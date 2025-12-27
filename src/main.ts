// Phase 4 動作確認デモ: アイテム・報酬システムの可視化

import { createInputSystem } from './input/inputSystem.js';
import { runGameLoop } from './core/gameLoop.js';
import { cleanupRenderer } from './rendering/render.js';
import { generateDungeon, startDungeon } from './world/dungeon.js';
import { DEFAULT_DUNGEON_OPTIONS } from './types/Dungeon.js';
import { createEmptyInventory, addRewardToInventory } from './items/rewards.js';
import { renderDungeonNav, renderRewardInfo } from './rendering/formatters.js';
import { getAvailableRooms } from './world/navigation.js';
import type { Dungeon } from './types/Dungeon.js';
import type { PlayerInventory } from './types/Items.js';
import type { InputState } from './types/Input.js';
import type { RandomGenerator } from './core/random.js';

// Phase 4 デモ用のゲーム状態
interface DemoRewardState {
  readonly dungeon: Dungeon | null;
  readonly inventory: PlayerInventory;
  readonly running: boolean;
  readonly clearScreen: boolean;
  readonly selectedRoomIndex: number | null; // 選択中の部屋インデックス
}

// 初期状態
const initialState: DemoRewardState = {
  dungeon: null,
  inventory: createEmptyInventory(),
  running: true,
  clearScreen: true,
  selectedRoomIndex: null
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
    console.log('\nDemo ended. Thank you!');
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
  state: DemoRewardState,
  input: InputState,
  _deltaTime: number,
  rng: RandomGenerator
): DemoRewardState {
  // ダンジョンが未初期化なら初期化
  if (!state.dungeon) {
    const dungeon = startDungeon(
      generateDungeon(DEFAULT_DUNGEON_OPTIONS),
      state.inventory,
      rng
    );
    return { ...state, dungeon, clearScreen: true };
  }

  // clearScreen フラグをリセット
  let newState = { ...state, clearScreen: false };

  // 入力処理
  for (const keyPress of input.queue) {
    // 終了キー
    if (keyPress.key.name === 'q' || (keyPress.key.ctrl && keyPress.key.name === 'c')) {
      return { ...state, running: false };
    }

    // スペースキーで新しいダンジョンを生成（インベントリリセット）
    if (keyPress.key.name === 'space') {
      const inventory = createEmptyInventory();
      const dungeon = startDungeon(
        generateDungeon(DEFAULT_DUNGEON_OPTIONS),
        inventory,
        rng
      );
      return { ...state, dungeon, inventory, clearScreen: true, selectedRoomIndex: null };
    }

    // 数字キーで部屋を選択（1-9）
    if (keyPress.key.name && keyPress.key.name >= '1' && keyPress.key.name <= '9') {
      const roomIndex = parseInt(keyPress.key.name) - 1;
      const availableRooms = getAvailableRooms(state.dungeon);

      if (roomIndex < availableRooms.length) {
        return { ...newState, selectedRoomIndex: roomIndex };
      }
    }

    // Enterキーで報酬を獲得して次のフロアへ
    if (keyPress.key.name === 'return' && state.selectedRoomIndex !== null) {
      const availableRooms = getAvailableRooms(state.dungeon);
      const selectedRoom = availableRooms[state.selectedRoomIndex];

      if (selectedRoom) {
        // 報酬をインベントリに追加
        const newInventory = addRewardToInventory(state.inventory, selectedRoom.reward);

        // 新しいフロアを生成（更新されたインベントリを使用）
        const newDungeon = startDungeon(
          generateDungeon(DEFAULT_DUNGEON_OPTIONS),
          newInventory,
          rng
        );

        return {
          ...newState,
          dungeon: newDungeon,
          inventory: newInventory,
          clearScreen: true,
          selectedRoomIndex: null
        };
      }
    }
  }

  return newState;
}

// 描画用データ生成 (ピュア関数)
function render(state: DemoRewardState): readonly string[] {
  if (!state.dungeon || !state.dungeon.currentFloor) {
    return ['Initializing dungeon...'];
  }

  const availableRooms = getAvailableRooms(state.dungeon);

  // ダンジョンナビゲーション画面
  const navLines = renderDungeonNav(state.dungeon, availableRooms);

  // 選択中の部屋の詳細報酬情報
  const detailLines = state.selectedRoomIndex !== null && availableRooms[state.selectedRoomIndex]
    ? [
      '',
      '--- Selected Room Details ---',
      ...renderRewardInfo(availableRooms[state.selectedRoomIndex]),
      '',
      'Press ENTER to take this reward and advance to next floor'
    ]
    : [];

  // インベントリ表示
  const inventoryLines = [
    '',
    '='.repeat(70),
    'Current Inventory:',
    '='.repeat(70)
  ];

  if (state.inventory.treasures.length === 0) {
    inventoryLines.push('  (empty)');
  } else {
    const treasureLines = state.inventory.treasures.flatMap((treasure, index) => {
      const symbol = treasure.rarity === 'epic' ? '★' : treasure.rarity === 'rare' ? '◆' : '◇';
      return [
        `  ${index + 1}. ${symbol} ${treasure.name} [${treasure.rarity.toUpperCase()}]`,
        `     ${treasure.description}`
      ];
    });
    inventoryLines.push(...treasureLines);
  }

  inventoryLines.push('');
  inventoryLines.push('Additional Controls: SPACE to restart with empty inventory');

  return [...navLines, ...detailLines, ...inventoryLines];
}
