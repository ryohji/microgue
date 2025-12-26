// ダンジョン生成: フロアとダンジョン全体の生成

import type { Dungeon, Floor, DungeonGenerationOptions } from '../types/Dungeon.js';
import type { RandomGenerator } from '../core/random.js';
import { generateRoomGraph } from './graph.js';

// ダンジョンを生成
export function generateDungeon(
  options: DungeonGenerationOptions,
  rng: RandomGenerator
): Dungeon {
  const floors = generateFloors(options, rng);

  return {
    floors,
    currentFloor: 0,
    currentRoomId: null
  };
}

// 全フロアを生成
function generateFloors(
  options: DungeonGenerationOptions,
  rng: RandomGenerator
): readonly Floor[] {
  return Array.from({ length: options.floorsCount }, (_, i) =>
    generateFloor(i + 1, options, rng)
  );
}

// 単一フロアを生成
function generateFloor(
  floorNumber: number,
  _options: DungeonGenerationOptions,
  rng: RandomGenerator
): Floor {
  const graph = generateRoomGraph(
    {
      floorNumber
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

// ダンジョンを開始（スタート部屋を選択可能にする）
export function startDungeon(dungeon: Dungeon): Dungeon {
  if (dungeon.floors.length === 0) {
    return dungeon;
  }

  const firstFloor = dungeon.floors[0];
  const startRoom = firstFloor.rooms.get(firstFloor.startRoomId);

  if (!startRoom) {
    return dungeon;
  }

  // スタート部屋を available に設定
  const updatedRooms = new Map(firstFloor.rooms);
  updatedRooms.set(firstFloor.startRoomId, { ...startRoom, status: 'available' });

  const updatedFloor: Floor = {
    ...firstFloor,
    rooms: updatedRooms
  };

  const updatedFloors = [...dungeon.floors];
  updatedFloors[0] = updatedFloor;

  return {
    ...dungeon,
    floors: updatedFloors,
    currentFloor: 0,
    currentRoomId: firstFloor.startRoomId
  };
}
