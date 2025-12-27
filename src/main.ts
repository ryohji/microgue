// Phase 3 動作確認デモ: ダンジョングラフの可視化

import { createInputSystem } from './input/inputSystem.js';
import { runGameLoop } from './core/gameLoop.js';
import { cleanupRenderer } from './rendering/render.js';
import { generateDungeon } from './world/dungeon.js';
import { DEFAULT_DUNGEON_OPTIONS } from './types/Dungeon.js';
import type { Dungeon, Room } from './types/Dungeon.js';
import type { InputState } from './types/Input.js';
import type { RandomGenerator } from './core/random.js';

// Phase 3 デモ用のゲーム状態
interface DemoGraphState {
  readonly dungeon: Dungeon | null;
  readonly running: boolean;
  readonly clearScreen: boolean; // 画面クリアが必要か
}

// 初期状態
const initialState: DemoGraphState = {
  dungeon: null,
  running: true,
  clearScreen: true
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
  state: DemoGraphState,
  input: InputState,
  _deltaTime: number,
  _rng: RandomGenerator
): DemoGraphState {
  // ダンジョンが未初期化なら初期化
  if (!state.dungeon) {
    const dungeon = generateDungeon(DEFAULT_DUNGEON_OPTIONS);
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

    // スペースキーで新しいダンジョンを生成
    if (keyPress.key.name === 'space') {
      const dungeon = generateDungeon(DEFAULT_DUNGEON_OPTIONS);
      return { ...state, dungeon, clearScreen: true };
    }
  }

  return newState;
}

// 描画用データ生成 (ピュア関数)
function render(state: DemoGraphState): readonly string[] {
  if (!state.dungeon || !state.dungeon.currentFloor) {
    return ['Initializing dungeon...'];
  }

  const lines: string[] = [];
  const floor = state.dungeon.currentFloor;

  lines.push('='.repeat(70));
  lines.push(`Floor ${floor.floorNumber} - Dungeon Graph Visualization`);
  lines.push('='.repeat(70));
  lines.push('');

  // 深度ごとに部屋をグループ化
  const roomsByDepth = groupRoomsByDepth(floor.rooms);
  const maxDepth = Math.max(...Array.from(roomsByDepth.keys()));

  lines.push(`Total Rooms: ${floor.rooms.size}`);
  lines.push(`Start: ${floor.startRoomId}`);
  lines.push(`Boss: ${floor.bossRoomId}`);
  lines.push(`Rest Rooms: ${floor.restRoomCount}`);
  lines.push('');

  // 深度ごとに部屋を表示
  for (let depth = 0; depth <= maxDepth; depth++) {
    const rooms = roomsByDepth.get(depth) || [];
    if (rooms.length === 0) continue;

    lines.push(`Depth ${depth}:`);

    for (const room of rooms) {
      const symbol = getRoomTypeSymbol(room.type);
      const typeName = getRoomTypeName(room.type).padEnd(15);
      const roomId = room.id.padEnd(10);
      const enemies = room.enemyCount !== undefined ? `(${room.enemyCount} enemies)`.padEnd(12) : ''.padEnd(12);

      // 接続先の表示
      const connections = room.nextRooms.length > 0
        ? `→ [${room.nextRooms.join(', ')}]`
        : '';

      lines.push(`  ${symbol} ${roomId} ${typeName} ${enemies} ${connections}`);
    }

    lines.push('');
  }

  // パス情報の分析
  const pathAnalysis = analyzePathLengths(floor.rooms, floor.startRoomId, floor.bossRoomId);
  lines.push('Path Analysis:');
  lines.push(`  Shortest path to boss: ${pathAnalysis.shortestPath} moves`);
  lines.push(`  Longest path to boss: ${pathAnalysis.longestPath} moves`);
  lines.push(`  Total paths to boss: ${pathAnalysis.totalPaths}`);
  lines.push('');

  // 部屋タイプの統計
  const stats = getRoomTypeStats(floor.rooms);
  lines.push('Room Type Distribution:');
  lines.push(`  Normal: ${stats.normal}  Elite: ${stats.elite}  Horde: ${stats.horde}`);
  lines.push(`  Rest: ${stats.rest}  Boss: ${stats.boss}`);
  lines.push('');

  lines.push('Controls: SPACE to generate new dungeon, Q to quit');

  return lines;
}

// 深度ごとに部屋をグループ化
function groupRoomsByDepth(rooms: ReadonlyMap<string, Room>): Map<number, Room[]> {
  const grouped = new Map<number, Room[]>();

  for (const room of rooms.values()) {
    const existing = grouped.get(room.depth) || [];
    grouped.set(room.depth, [...existing, room]);
  }

  // 各深度内で部屋IDでソート
  for (const [depth, roomList] of grouped.entries()) {
    grouped.set(depth, roomList.sort((a, b) => a.id.localeCompare(b.id)));
  }

  return grouped;
}

// パス長を分析
function analyzePathLengths(
  rooms: ReadonlyMap<string, Room>,
  startId: string,
  bossId: string
): { shortestPath: number; longestPath: number; totalPaths: number } {
  // DFSですべてのパスを列挙
  const allPaths = findAllPaths(rooms, startId, bossId);

  if (allPaths.length === 0) {
    return { shortestPath: 0, longestPath: 0, totalPaths: 0 };
  }

  // エッジ数（移動回数）= 部屋数 - 1
  const pathLengths = allPaths.map(path => path.length - 1);
  const shortestPath = Math.min(...pathLengths);
  const longestPath = Math.max(...pathLengths);

  return {
    shortestPath,
    longestPath,
    totalPaths: allPaths.length
  };
}

// DFSですべてのパスを列挙
function findAllPaths(
  rooms: ReadonlyMap<string, Room>,
  startId: string,
  goalId: string
): string[][] {
  const paths: string[][] = [];
  const currentPath: string[] = [];

  function dfs(currentId: string): void {
    currentPath.push(currentId);

    if (currentId === goalId) {
      paths.push([...currentPath]);
    } else {
      const room = rooms.get(currentId);
      if (room) {
        for (const nextId of room.nextRooms) {
          // 循環を防ぐ
          if (!currentPath.includes(nextId)) {
            dfs(nextId);
          }
        }
      }
    }

    currentPath.pop();
  }

  dfs(startId);
  return paths;
}

// 部屋タイプの統計
function getRoomTypeStats(rooms: ReadonlyMap<string, Room>): {
  normal: number;
  elite: number;
  horde: number;
  boss: number;
  rest: number;
} {
  const stats = { normal: 0, elite: 0, horde: 0, boss: 0, rest: 0 };

  for (const room of rooms.values()) {
    stats[room.type]++;
  }

  return stats;
}

// 部屋タイプのシンボル
function getRoomTypeSymbol(type: Room['type']): string {
  switch (type) {
    case 'normal': return '⚔';
    case 'elite': return '☠';
    case 'horde': return '⚡';
    case 'boss': return '👑';
    case 'rest': return '💚';
  }
}

// 部屋タイプの名前
function getRoomTypeName(type: Room['type']): string {
  switch (type) {
    case 'normal': return 'Normal Combat';
    case 'elite': return 'Elite Enemy';
    case 'horde': return 'Horde Battle';
    case 'boss': return 'Boss Room';
    case 'rest': return 'Rest Site';
  }
}
