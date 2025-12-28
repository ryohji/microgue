// フルゲーム統合 - ダンジョン探索から戦闘、報酬獲得までの完全なフロー

import { runGameLoop } from './core/gameLoop.js';
import type { AppState } from './core/gameLoop.js';
import { createInputSystem } from './input/inputSystem.js';
import type { InputState } from './types/Input.js';
import type { RandomGenerator } from './core/random.js';
import type { GamePhase } from './types/GameFlow.js';
import type { Dungeon } from './types/Dungeon.js';
import type { PlayerInventory } from './types/Items.js';
import type { CombatState } from './types/CombatState.js';
import { DEFAULT_DUNGEON_OPTIONS } from './types/Dungeon.js';
import { generateDungeon, startDungeon, advanceToNextFloor } from './world/dungeon.js';
import { selectRoom, clearRoom, getAvailableRooms, getCurrentRoom } from './world/navigation.js';
import { createEmptyInventory, addRewardToInventory } from './items/rewards.js';
import { createEncounterForRoom, applyRelicEffectsToPlayer } from './combat/encounter.js';
import { accumulateTimeline, getNextActor } from './combat/timeline.js';
import { executeAction } from './combat/combat.js';
import { decideAction } from './combat/ai.js';
import { createPlayer } from './combat/entity.js';
import { renderCombat, renderDungeonNav } from './rendering/formatters.js';

// ゲーム全体の状態
interface FullGameState extends AppState {
  readonly phase: GamePhase;
  readonly dungeon: Dungeon;
  readonly inventory: PlayerInventory;
  readonly currentHp: number;
  readonly maxHp: number;
  readonly combat: CombatState | null;
  readonly message: string;
}

// 初期状態を生成
function createInitialState(rng: RandomGenerator): FullGameState {
  const dungeon = generateDungeon(DEFAULT_DUNGEON_OPTIONS);
  const inventory = createEmptyInventory();

  // プレイヤーの基本 HP
  const basePlayer = createPlayer({ x: 0, y: 0 });
  const playerWithRelics = applyRelicEffectsToPlayer(basePlayer, inventory);

  return {
    running: true,
    clearScreen: true,
    phase: 'navigation',
    dungeon: startDungeon(dungeon, inventory, rng),
    inventory,
    currentHp: playerWithRelics.stats.maxHp,
    maxHp: playerWithRelics.stats.maxHp,
    combat: null,
    message: 'Welcome to the dungeon! Select your path.'
  };
}

// ゲーム更新ロジック
function updateGame(
  state: FullGameState,
  input: InputState,
  deltaTime: number,
  rng: RandomGenerator
): FullGameState {
  // Q キー押下で即座に終了
  if (input.queue.length > 0 && input.queue[0].key.name === 'q') {
    return { ...state, running: false };
  }

  // フェーズごとの処理
  switch (state.phase) {
    case 'navigation':
      return updateNavigation(state, input, rng);
    case 'room':
      return updateRoom(state, input, deltaTime, rng);
    case 'reward':
      return updateReward(state, input, rng);
    case 'victory':
    case 'defeat':
      return state; // ゲームオーバー時は何もしない
    default:
      return state;
  }
}

// ナビゲーションフェーズの更新
function updateNavigation(
  state: FullGameState,
  input: InputState,
  rng: RandomGenerator
): FullGameState {
  if (input.queue.length === 0) return state;

  const key = input.queue[0].key.name;
  const availableRooms = getAvailableRooms(state.dungeon);

  // 数字キーで部屋を選択
  const roomIndex = parseInt(key || '') - 1;
  if (roomIndex >= 0 && roomIndex < availableRooms.length) {
    const selectedRoom = availableRooms[roomIndex];
    let newDungeon = selectRoom(state.dungeon, selectedRoom.id);

    // 部屋のタイプに応じて次のフェーズを決定
    if (selectedRoom.type === 'rest') {
      // 休憩部屋: HP回復して即座に報酬フェーズへ
      const healAmount = Math.floor(state.maxHp * 0.3);
      const newHp = Math.min(state.maxHp, state.currentHp + healAmount);

      newDungeon = clearRoom(newDungeon);

      return {
        ...state,
        dungeon: newDungeon,
        currentHp: newHp,
        phase: 'reward',
        message: `Rested and recovered ${healAmount} HP.`,
        clearScreen: true
      };
    } else {
      // 戦闘部屋: 戦闘開始
      const bossId = selectedRoom.type === 'boss' ? `boss_floor_${state.dungeon.currentFloorNumber + 1}` : null;
      const combat = createEncounterForRoom(
        selectedRoom.type,
        state.inventory,
        state.currentHp,
        bossId,
        rng
      );

      return {
        ...state,
        dungeon: newDungeon,
        combat,
        phase: 'room',
        message: `Entering ${selectedRoom.type} room...`,
        clearScreen: true
      };
    }
  }

  return state;
}

// 部屋フェーズの更新（戦闘）
function updateRoom(
  state: FullGameState,
  input: InputState,
  deltaTime: number,
  rng: RandomGenerator
): FullGameState {
  if (!state.combat) return state;

  // 入力がない場合はタイムラインを進める
  if (input.queue.length === 0) {
    const timeline = accumulateTimeline(state.combat.timeline, state.combat.entities, deltaTime);
    const nextActor = getNextActor(timeline);
    return {
      ...state,
      combat: { ...state.combat, timeline, currentTurn: nextActor }
    };
  }

  const key = input.queue[0].key.name;
  const player = state.combat.entities.find(e => e.id === 'player');
  const enemies = state.combat.entities.filter(e => e.id !== 'player');

  // 戦闘終了チェック
  if (!player || player.hp <= 0) {
    return {
      ...state,
      phase: 'defeat',
      message: 'You have been defeated...',
      clearScreen: true
    };
  }

  if (enemies.length === 0) {
    // 戦闘勝利: 部屋をクリアして報酬フェーズへ
    const newDungeon = clearRoom(state.dungeon);
    return {
      ...state,
      dungeon: newDungeon,
      currentHp: player.hp,
      phase: 'reward',
      combat: null,
      message: 'Victory!',
      clearScreen: true
    };
  }

  // ターンがない場合: タイムラインを進めて次のターンを決定
  if (!state.combat.currentTurn) {
    const timeline = accumulateTimeline(state.combat.timeline, state.combat.entities, deltaTime);
    const nextActor = getNextActor(timeline);
    return {
      ...state,
      combat: { ...state.combat, timeline, currentTurn: nextActor }
    };
  }

  // プレイヤーのターン
  if (state.combat.currentTurn === 'player') {
    const action = getPlayerAction(key, state.combat);
    if (action) {
      const newCombat = executeAction(state.combat, 'player', action, rng);
      return {
        ...state,
        combat: newCombat,
        message: 'Player acts'
      };
    } else {
      return state;
    }
  } else {
    // 敵のターン: 入力を無視して敵の行動を実行
    const action = decideAction(state.combat, state.combat.currentTurn, rng);
    if (action) {
      const newCombat = executeAction(state.combat, state.combat.currentTurn, action, rng);
      return {
        ...state,
        combat: newCombat,
        message: `${state.combat.currentTurn} acts`
      };
    } else {
      return state;
    }
  }
}

// プレイヤーの行動を取得
function getPlayerAction(key: string | undefined, combat: CombatState) {
  const player = combat.entities.find(e => e.id === 'player');
  if (!player) return null;

  const enemies = combat.entities.filter(e => e.id !== 'player');

  // 最も近い敵を選択（マンハッタン距離）
  const nearestEnemy = enemies.length > 0
    ? enemies.reduce((nearest, enemy) => {
        const distToEnemy = Math.abs(enemy.pos.x - player.pos.x) + Math.abs(enemy.pos.y - player.pos.y);
        const distToNearest = Math.abs(nearest.pos.x - player.pos.x) + Math.abs(nearest.pos.y - player.pos.y);
        return distToEnemy < distToNearest ? enemy : nearest;
      })
    : null;

  switch (key) {
    case 'up':
      return { type: 'move' as const, targetPos: { x: player.pos.x, y: player.pos.y - 1 }, apCost: 100 };
    case 'down':
      return { type: 'move' as const, targetPos: { x: player.pos.x, y: player.pos.y + 1 }, apCost: 100 };
    case 'left':
      return { type: 'move' as const, targetPos: { x: player.pos.x - 1, y: player.pos.y }, apCost: 100 };
    case 'right':
      return { type: 'move' as const, targetPos: { x: player.pos.x + 1, y: player.pos.y }, apCost: 100 };
    case 'space':
      return nearestEnemy ? { type: 'attack' as const, targetPos: nearestEnemy.pos, apCost: 100 } : null;
    case 'z':
      return { type: 'wait' as const, apCost: 100 };
    default:
      return null;
  }
}

// 報酬フェーズの更新
function updateReward(
  state: FullGameState,
  input: InputState,
  rng: RandomGenerator
): FullGameState {
  if (input.queue.length === 0) return state;

  const key = input.queue[0].key.name;

  if (key === 'return') {
    const currentRoom = getCurrentRoom(state.dungeon);
    if (!currentRoom) return state;

    // 報酬を獲得
    const newInventory = addRewardToInventory(state.inventory, currentRoom.reward);

    // プレイヤーの最大 HP を更新（レリック効果適用）
    const basePlayer = createPlayer({ x: 0, y: 0 });
    const playerWithRelics = applyRelicEffectsToPlayer(basePlayer, newInventory);
    const newMaxHp = playerWithRelics.stats.maxHp;
    const hpIncrease = newMaxHp - state.maxHp;
    const newCurrentHp = state.currentHp + hpIncrease;

    // ボス部屋クリア後の処理
    if (currentRoom.type === 'boss') {
      const isLastFloor = state.dungeon.currentFloorNumber >= state.dungeon.totalFloors - 1;

      if (isLastFloor) {
        // 最終フロアクリア
        return {
          ...state,
          inventory: newInventory,
          maxHp: newMaxHp,
          currentHp: newCurrentHp,
          phase: 'victory',
          message: 'Congratulations! You have conquered the dungeon!',
          clearScreen: true
        };
      } else {
        // 次のフロアへ
        const newDungeon = advanceToNextFloor(state.dungeon, newInventory, rng);
        return {
          ...state,
          dungeon: newDungeon,
          inventory: newInventory,
          maxHp: newMaxHp,
          currentHp: newCurrentHp,
          phase: 'navigation',
          message: `Floor ${newDungeon.currentFloorNumber + 1} - Select your path.`,
          clearScreen: true
        };
      }
    }

    // 通常の部屋クリア後
    return {
      ...state,
      inventory: newInventory,
      maxHp: newMaxHp,
      currentHp: newCurrentHp,
      phase: 'navigation',
      message: 'Reward obtained. Select your next path.',
      clearScreen: true
    };
  }

  return state;
}

// ゲーム描画
function renderGame(state: FullGameState): readonly string[] {
  const lines: string[] = [];

  // フェーズごとの描画
  switch (state.phase) {
    case 'navigation':
      lines.push(...renderNavigationPhase(state));
      break;
    case 'room':
      lines.push(...renderRoomPhase(state));
      break;
    case 'reward':
      lines.push(...renderRewardPhase(state));
      break;
    case 'victory':
      lines.push('=== VICTORY ===', '', state.message, '', 'Press Q to quit');
      break;
    case 'defeat':
      lines.push('=== DEFEAT ===', '', state.message, '', 'Press Q to quit');
      break;
  }

  return lines;
}

// ナビゲーション画面の描画
function renderNavigationPhase(state: FullGameState): string[] {
  const lines: string[] = [];

  lines.push(`=== Floor ${state.dungeon.currentFloorNumber + 1} / ${state.dungeon.totalFloors} ===`);
  lines.push('');
  lines.push(`HP: ${state.currentHp} / ${state.maxHp}`);
  lines.push(`Items: ${state.inventory.treasures.length}`);
  lines.push('');

  // ダンジョンマップ
  const availableRooms = getAvailableRooms(state.dungeon);
  lines.push(...renderDungeonNav(state.dungeon, availableRooms));
  lines.push('');
  lines.push(state.message);
  lines.push('');
  lines.push('Press 1-9 to select a room, Q to quit');

  return lines;
}

// 部屋画面の描画（戦闘）
function renderRoomPhase(state: FullGameState): string[] {
  if (!state.combat) return ['No combat active'];

  const lines: string[] = [];

  lines.push(`=== Floor ${state.dungeon.currentFloorNumber + 1} - Combat ===`);
  lines.push('');
  lines.push(...renderCombat(state.combat));
  lines.push('');
  lines.push(state.message);
  lines.push('');

  // 現在のターンを表示
  if (state.combat.currentTurn) {
    const actor = state.combat.entities.find(e => e.id === state.combat!.currentTurn);
    if (actor) {
      lines.push(`>>> ${actor.id}'s turn <<<`);
      lines.push('');
    }
  }

  // ターンの状態に応じた制御表示
  if (state.combat.currentTurn === 'player') {
    lines.push('Arrow keys: move, Space: attack, Z: wait, Q: quit');
  } else {
    if (state.combat.currentTurn) {
      // 敵のターン
      lines.push('Press any key to continue, Q: quit');
    } else {
      // ターンなし（タイムライン蓄積中）
      lines.push('Q: quit');
    }
  }

  return lines;
}

// 報酬画面の描画
function renderRewardPhase(state: FullGameState): string[] {
  const lines: string[] = [];
  const currentRoom = getCurrentRoom(state.dungeon);

  lines.push(`=== Floor ${state.dungeon.currentFloorNumber + 1} - Reward ===`);
  lines.push('');
  lines.push(`HP: ${state.currentHp} / ${state.maxHp}`);
  lines.push('');

  if (currentRoom) {
    lines.push(`Room cleared! Reward:`);
    lines.push('');

    // 報酬の内容を表示
    const reward = currentRoom.reward;
    if (reward.treasure) {
      lines.push(`  Treasure: ${reward.treasure.name} [${reward.treasure.rarity}]`);
      lines.push(`  ${reward.treasure.description}`);
      lines.push('  Effects:');
      for (const effect of reward.treasure.effects) {
        lines.push(`    - ${effect.type}: ${effect.value}`);
      }
    }
  }

  lines.push('');
  lines.push(state.message);
  lines.push('');
  lines.push('Press Enter to continue, Q to quit');

  return lines;
}

// メイン関数
async function main() {
  const inputSystem = createInputSystem();
  const rng = Math.random;
  const state = createInitialState(rng);

  await runGameLoop(state, {
    getInput: () => inputSystem.getState(),
    update: updateGame,
    render: renderGame,
    cleanup: () => inputSystem.cleanup()
  });

  console.log('\nGame ended.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
