// Phase 5 動作確認デモ: メタプログレッションシステムの可視化

import { createInputSystem } from './input/inputSystem.js';
import { runGameLoop } from './core/gameLoop.js';
import { cleanupRenderer } from './rendering/render.js';
import { generateDungeon, startDungeon } from './world/dungeon.js';
import { DEFAULT_DUNGEON_OPTIONS } from './types/Dungeon.js';
import { createEmptyInventory, addRewardToInventory } from './items/rewards.js';
import { renderDungeonNav, renderRewardInfo, renderMetaProgress } from './rendering/formatters.js';
import { getAvailableRooms } from './world/navigation.js';
import { loadMetaProgress, saveMetaProgress } from './progression/save.js';
import { recordRunStart, recordClear, processUnlocks } from './progression/meta.js';
import { loadUnlockDefinitions } from './progression/unlocks.js';
import type { Dungeon } from './types/Dungeon.js';
import type { PlayerInventory } from './types/Items.js';
import type { MetaProgress } from './types/MetaProgress.js';
import type { InputState } from './types/Input.js';
import type { RandomGenerator } from './core/random.js';

// Phase 5 デモ用のゲーム状態
interface DemoMetaState {
  readonly dungeon: Dungeon | null;
  readonly inventory: PlayerInventory;
  readonly metaProgress: MetaProgress;
  readonly running: boolean;
  readonly clearScreen: boolean;
  readonly selectedRoomIndex: number | null;
  readonly currentFloorCount: number; // クリアしたフロア数
  readonly showMetaProgress: boolean; // メタ進行を表示するか
}

// 初期状態
const initialMeta = loadMetaProgress();
const initialState: DemoMetaState = {
  dungeon: null,
  inventory: createEmptyInventory(),
  metaProgress: initialMeta,
  running: true,
  clearScreen: true,
  selectedRoomIndex: null,
  currentFloorCount: 0,
  showMetaProgress: true
};

// エントリーポイント
main();

// メイン実行
async function main(): Promise<void> {
  let exitCode = 0;
  const { getState, cleanup } = createInputSystem();

  try {
    const callbacks = { getInput: getState, update, render };
    const finalState = await runGameLoop(initialState, callbacks);

    // 終了時にメタ進行を保存
    saveMetaProgress(finalState.metaProgress);
    console.log('\nMeta progress saved. Thank you!');
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
  state: DemoMetaState,
  input: InputState,
  _deltaTime: number,
  rng: RandomGenerator
): DemoMetaState {
  // ダンジョンが未初期化なら初期化
  if (!state.dungeon && !state.showMetaProgress) {
    // プレイ開始を記録
    const updatedMeta = recordRunStart(state.metaProgress);

    const dungeon = startDungeon(
      generateDungeon(DEFAULT_DUNGEON_OPTIONS),
      state.inventory,
      rng
    );
    return { ...state, dungeon, metaProgress: updatedMeta, clearScreen: true };
  }

  // clearScreen フラグをリセット
  let newState = { ...state, clearScreen: false };

  // 入力処理
  for (const keyPress of input.queue) {
    // 終了キー
    if (keyPress.key.name === 'q' || (keyPress.key.ctrl && keyPress.key.name === 'c')) {
      return { ...state, running: false };
    }

    // メタ進行表示中の場合
    if (state.showMetaProgress) {
      // Enterキーでゲーム開始
      if (keyPress.key.name === 'return') {
        return { ...newState, showMetaProgress: false, clearScreen: true };
      }
      continue;
    }

    // スペースキーで新しいダンジョンを生成（インベントリリセット）
    if (keyPress.key.name === 'space') {
      const inventory = createEmptyInventory();
      const updatedMeta = recordRunStart(state.metaProgress);
      const dungeon = startDungeon(
        generateDungeon(DEFAULT_DUNGEON_OPTIONS),
        inventory,
        rng
      );
      return {
        ...state,
        dungeon,
        inventory,
        metaProgress: updatedMeta,
        clearScreen: true,
        selectedRoomIndex: null,
        currentFloorCount: 0
      };
    }

    // 数字キーで部屋を選択（1-9）
    if (keyPress.key.name && keyPress.key.name >= '1' && keyPress.key.name <= '9') {
      const roomIndex = parseInt(keyPress.key.name) - 1;
      if (state.dungeon) {
        const availableRooms = getAvailableRooms(state.dungeon);

        if (roomIndex < availableRooms.length) {
          return { ...newState, selectedRoomIndex: roomIndex };
        }
      }
    }

    // Enterキーで報酬を獲得して次のフロアへ
    if (keyPress.key.name === 'return' && state.selectedRoomIndex !== null && state.dungeon) {
      const availableRooms = getAvailableRooms(state.dungeon);
      const selectedRoom = availableRooms[state.selectedRoomIndex];

      if (selectedRoom) {
        // 報酬をインベントリに追加
        const newInventory = addRewardToInventory(state.inventory, selectedRoom.reward);
        const newFloorCount = state.currentFloorCount + 1;

        // 最終フロアに到達したかチェック
        if (newFloorCount >= DEFAULT_DUNGEON_OPTIONS.floorsCount) {
          // クリア処理
          let updatedMeta = recordClear(state.metaProgress, newFloorCount);

          // アンロック処理
          const unlockDefs = loadUnlockDefinitions();
          updatedMeta = processUnlocks(updatedMeta, unlockDefs);

          // メタ進行を保存
          saveMetaProgress(updatedMeta);

          return {
            ...newState,
            dungeon: null,
            inventory: createEmptyInventory(),
            metaProgress: updatedMeta,
            clearScreen: true,
            selectedRoomIndex: null,
            currentFloorCount: 0,
            showMetaProgress: true
          };
        } else {
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
            selectedRoomIndex: null,
            currentFloorCount: newFloorCount
          };
        }
      }
    }
  }

  return newState;
}

// 描画用データ生成 (ピュア関数)
function render(state: DemoMetaState): readonly string[] {
  // メタ進行表示
  if (state.showMetaProgress) {
    const metaLines = renderMetaProgress(
      state.metaProgress.stats,
      state.metaProgress.unlockedTrophies.length,
      state.metaProgress.unlockedTreasures.length
    );

    return [
      ...metaLines,
      'Press ENTER to start a new run',
      'Press Q to quit',
      '',
      `Current Floor Progress: ${state.currentFloorCount} / ${DEFAULT_DUNGEON_OPTIONS.floorsCount}`
    ];
  }

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

  // フロア進行表示
  const floorProgress = [
    '',
    `Floor Progress: ${state.currentFloorCount + 1} / ${DEFAULT_DUNGEON_OPTIONS.floorsCount}`
  ];

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

  return [...navLines, ...floorProgress, ...detailLines, ...inventoryLines];
}
