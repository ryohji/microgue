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

// 次のフロアの探索を開始（フロアを生成し、スタート部屋をavailableに設定）
function startExplore(
  dungeon: Dungeon,
  inventory: PlayerInventory,
  rng: RandomGenerator
): Dungeon {
  const nextFloorNumber = dungeon.currentFloorNumber + 1;
  // generateFloor は内部で 0-indexed のフロア番号を使用
  const newFloor = generateFloor(nextFloorNumber, dungeon.options, inventory, rng);
  const startRoom = newFloor.rooms.get(newFloor.startRoomId);

  if (!startRoom) {
    return {
      ...dungeon,
      currentFloorNumber: nextFloorNumber,
      currentFloor: newFloor,
      currentRoomId: newFloor.startRoomId
    };
  }

  const updatedRooms = new Map(newFloor.rooms);
  updatedRooms.set(newFloor.startRoomId, { ...startRoom, status: 'available' });

  const initializedFloor: Floor = {
    ...newFloor,
    rooms: updatedRooms
  };

  return {
    ...dungeon,
    currentFloorNumber: nextFloorNumber,
    currentFloor: initializedFloor,
    currentRoomId: initializedFloor.startRoomId
  };
}

// 次のフロアに進む（新しいフロアを生成）
export function advanceToNextFloor(
  dungeon: Dungeon,
  inventory: PlayerInventory,
  rng: RandomGenerator
): Dungeon {
  if (dungeon.currentFloorNumber + 1 >= dungeon.totalFloors) {
    // 最終フロアを超えた場合は変更なし
    return dungeon;
  } else {
    return startExplore(dungeon, inventory, rng);
  }
}

// ダンジョンを開始（最初のフロアを生成してスタート部屋を選択可能にする）
export function startDungeon(
  dungeon: Dungeon,
  inventory: PlayerInventory,
  rng: RandomGenerator
): Dungeon {
  // currentFloorNumber を -1 にしてから startExplore を呼ぶことで、フロア 0 を生成
  const dungeonAtMinusOne = { ...dungeon, currentFloorNumber: -1 };
  return startExplore(dungeonAtMinusOne, inventory, rng);
}
