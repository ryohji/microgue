// Phase 2 動作確認デモ: 戦闘システム

import { createInputSystem } from './input/inputSystem.js';
import { runGameLoop } from './core/gameLoop.js';
import { cleanupRenderer } from './rendering/render.js';
import { initCombat, updateCombat, executeAction, isCombatOver, isVictory } from './combat/combat.js';
import { renderCombat } from './rendering/formatters.js';
import { getDistance } from './combat/grid.js';
import { findEntityById } from './combat/entity.js';
import type { CombatState, Action } from './types/CombatState.js';
import type { InputState } from './types/Input.js';
import type { RandomGenerator } from './core/random.js';

// Phase 2 デモ用のゲーム状態
interface DemoGameState {
  readonly combat: CombatState | null;
  readonly running: boolean;
  readonly message: string;
}

// 初期状態
const initialState: DemoGameState = {
  combat: null,
  running: true,
  message: ''
};

// エントリーポイント
main();

// メイン実行
async function main(): Promise<void> {
  let exitCode = 0;
  const { getState, cleanup } = createInputSystem();

  try {
    const callbacks = { getInput: getState, update, render };
    await runGameLoop(initialState, callbacks);
    console.log('\nGame ended. Thank you for playing!');
  } catch (error) {
    exitCode = 1;
    console.error('Error:', error);
  } finally {
    cleanup();
    cleanupRenderer();
  }

  process.exit(exitCode);
}

// ゲーム状態更新 (ピュア関数)
function update(
  state: DemoGameState,
  input: InputState,
  deltaTime: number,
  rng: RandomGenerator
): DemoGameState {
  // 戦闘が未初期化なら初期化
  if (!state.combat) {
    return {
      ...state,
      combat: initCombat(15, 10, rng),
      message: 'Combat started!'
    };
  }

  // 戦闘終了チェック
  if (isCombatOver(state.combat)) {
    const victory = isVictory(state.combat);
    return {
      ...state,
      message: victory ? 'Victory!' : 'Defeat...',
      running: false
    };
  }

  // タイムライン更新
  let newCombat = updateCombat(state.combat, deltaTime);
  let newMessage = state.message;

  // プレイヤーのターンなら入力処理
  if (newCombat.currentTurn === 'player') {
    for (const keyPress of input.queue) {
      // 終了キー
      if (keyPress.key.name === 'q' || (keyPress.key.ctrl && keyPress.key.name === 'c')) {
        return { ...state, running: false };
      }

      const player = findEntityById(newCombat.entities, 'player');
      if (!player) continue;

      let action: Action | null = null;

      // 移動
      if (keyPress.key.name === 'up') {
        action = { type: 'move', targetPos: { x: player.pos.x, y: player.pos.y - 1 }, apCost: 80 };
      } else if (keyPress.key.name === 'down') {
        action = { type: 'move', targetPos: { x: player.pos.x, y: player.pos.y + 1 }, apCost: 80 };
      } else if (keyPress.key.name === 'left') {
        action = { type: 'move', targetPos: { x: player.pos.x - 1, y: player.pos.y }, apCost: 80 };
      } else if (keyPress.key.name === 'right') {
        action = { type: 'move', targetPos: { x: player.pos.x + 1, y: player.pos.y }, apCost: 80 };
      }
      // 攻撃 (スペースキー)
      else if (keyPress.key.name === 'space') {
        const enemy = newCombat.entities.find(e => e.id.startsWith('enemy'));
        if (enemy && getDistance(player.pos, enemy.pos) === 1) {
          action = { type: 'attack', targetPos: enemy.pos, apCost: 100 };
          newMessage = 'Player attacks!';
        } else {
          newMessage = 'No enemy in range!';
        }
      }
      // 待機
      else if (keyPress.key.name === 'w') {
        action = { type: 'wait', apCost: 50 };
        newMessage = 'Player waits...';
      }

      if (action) {
        newCombat = executeAction(newCombat, 'player', action);
      }
    }
  }
  // 敵のターンなら簡易AI
  else if (newCombat.currentTurn?.startsWith('enemy')) {
    const enemy = findEntityById(newCombat.entities, newCombat.currentTurn);
    const player = findEntityById(newCombat.entities, 'player');

    if (enemy && player) {
      const distance = getDistance(enemy.pos, player.pos);

      let action: Action;
      if (distance === 1) {
        // 隣接していたら攻撃
        action = { type: 'attack', targetPos: player.pos, apCost: 100 };
        newMessage = `${enemy.id} attacks!`;
      } else {
        // それ以外は接近
        const dx = Math.sign(player.pos.x - enemy.pos.x);
        const dy = Math.sign(player.pos.y - enemy.pos.y);
        const targetPos = { x: enemy.pos.x + dx, y: enemy.pos.y + dy };
        action = { type: 'move', targetPos, apCost: 80 };
        newMessage = `${enemy.id} moves closer...`;
      }

      newCombat = executeAction(newCombat, newCombat.currentTurn, action);
    }
  }

  return {
    ...state,
    combat: newCombat,
    message: newMessage
  };
}

// 描画用データ生成 (ピュア関数)
function render(state: DemoGameState): readonly string[] {
  if (!state.combat) {
    return ['Initializing combat...'];
  }

  const combatLines = renderCombat(state.combat);
  const lines = [...combatLines];

  // メッセージ表示
  if (state.message) {
    lines.push('');
    lines.push(`>> ${state.message}`);
  }

  return lines;
}
