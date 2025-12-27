// ダンジョン生成: フロアとダンジョン全体の生成

import type { Dungeon, Floor, DungeonGenerationOptions } from '../types/Dungeon.js';
import type { RandomGenerator } from '../core/random.js';
import type { PlayerInventory } from '../types/Items.js';
import { generateRoomGraph } from './graph.js';

// ダンジョンを生成（初期状態：フロアは未生成）
export function generateDungeon(
  options: DungeonGenerationOptions
): Dungeon {
  return {
    totalFloors: options.floorsCount,
    currentFloorNumber: 0,
    currentFloor: null,
    currentRoomId: null,
    options
  };
}

// 単一フロアを生成（インベントリを考慮）
export function generateFloor(
  floorNumber: number,
  _options: DungeonGenerationOptions,
  inventory: PlayerInventory,
  rng: RandomGenerator
): Floor {
  const graph = generateRoomGraph(
    {
      floorNumber,
      inventory
    },
    rng
  );

  return {
    floorNumber,
    rooms: graph.rooms,
    startRoomId: graph.startRoomId,
    bossRoomId: graph.bossRoomId,
    restRoomCount: graph.restRoomCount
  };
}

// 次のフロアに進む（新しいフロアを生成）
export function advanceToNextFloor(
  dungeon: Dungeon,
  inventory: PlayerInventory,
  rng: RandomGenerator
): Dungeon {
  const nextFloorNumber = dungeon.currentFloorNumber + 1;

  if (nextFloorNumber >= dungeon.totalFloors) {
    // 最終フロアを超えた場合は変更なし
    return dungeon;
  }

  const newFloor = generateFloor(
    nextFloorNumber + 1, // フロア番号は1-indexed
    dungeon.options,
    inventory,
    rng
  );

  return {
    ...dungeon,
    currentFloorNumber: nextFloorNumber,
    currentFloor: newFloor,
    currentRoomId: null
  };
}

// ダンジョンを開始（最初のフロアを生成してスタート部屋を選択可能にする）
export function startDungeon(
  dungeon: Dungeon,
  inventory: PlayerInventory,
  rng: RandomGenerator
): Dungeon {
  // 最初のフロアを生成
  const firstFloor = generateFloor(1, dungeon.options, inventory, rng);
  const startRoom = firstFloor.rooms.get(firstFloor.startRoomId);

  if (!startRoom) {
    return {
      ...dungeon,
      currentFloor: firstFloor
    };
  }

  // スタート部屋を available に設定
  const updatedRooms = new Map(firstFloor.rooms);
  updatedRooms.set(firstFloor.startRoomId, { ...startRoom, status: 'available' });

  const updatedFloor: Floor = {
    ...firstFloor,
    rooms: updatedRooms
  };

  return {
    ...dungeon,
    currentFloorNumber: 0,
    currentFloor: updatedFloor,
    currentRoomId: firstFloor.startRoomId
  };
}
