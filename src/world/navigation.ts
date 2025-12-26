// ダンジョンナビゲーション: 部屋選択と遷移

import type { Dungeon, Floor, Room } from '../types/Dungeon.js';

// 部屋を選択（部屋に入る）
export function selectRoom(dungeon: Dungeon, roomId: string): Dungeon {
  const floor = dungeon.floors[dungeon.currentFloor];
  const room = floor.rooms.get(roomId);

  if (!room || room.status !== 'available') {
    return dungeon;
  }

  // 選択した部屋を current に設定
  const updatedRooms = new Map(floor.rooms);
  updatedRooms.set(roomId, { ...room, status: 'current' });

  const updatedFloor: Floor = {
    ...floor,
    rooms: updatedRooms
  };

  const updatedFloors = [...dungeon.floors];
  updatedFloors[dungeon.currentFloor] = updatedFloor;

  return {
    ...dungeon,
    floors: updatedFloors,
    currentRoomId: roomId
  };
}

// 部屋をクリア（次の部屋を選択可能にする）
export function clearRoom(dungeon: Dungeon): Dungeon {
  if (!dungeon.currentRoomId) {
    return dungeon;
  }

  const floor = dungeon.floors[dungeon.currentFloor];
  const currentRoom = floor.rooms.get(dungeon.currentRoomId);

  if (!currentRoom) {
    return dungeon;
  }

  // 現在の部屋を cleared に設定
  let updatedRooms = new Map(floor.rooms);
  updatedRooms.set(dungeon.currentRoomId, { ...currentRoom, status: 'cleared' });

  // 次に進める部屋を available に設定
  for (const nextRoomId of currentRoom.nextRooms) {
    const nextRoom = updatedRooms.get(nextRoomId);
    if (nextRoom && nextRoom.status === 'locked') {
      updatedRooms.set(nextRoomId, { ...nextRoom, status: 'available' });
    }
  }

  const updatedFloor: Floor = {
    ...floor,
    rooms: updatedRooms
  };

  const updatedFloors = [...dungeon.floors];
  updatedFloors[dungeon.currentFloor] = updatedFloor;

  return {
    ...dungeon,
    floors: updatedFloors
  };
}

// 次のフロアに進む（ボスをクリアした後）
export function advanceToNextFloor(dungeon: Dungeon): Dungeon {
  const nextFloorIndex = dungeon.currentFloor + 1;

  if (nextFloorIndex >= dungeon.floors.length) {
    // 最終フロアクリア
    return dungeon;
  }

  const nextFloor = dungeon.floors[nextFloorIndex];
  const startRoom = nextFloor.rooms.get(nextFloor.startRoomId);

  if (!startRoom) {
    return dungeon;
  }

  // 次のフロアのスタート部屋を available に設定
  const updatedRooms = new Map(nextFloor.rooms);
  updatedRooms.set(nextFloor.startRoomId, { ...startRoom, status: 'available' });

  const updatedFloor: Floor = {
    ...nextFloor,
    rooms: updatedRooms
  };

  const updatedFloors = [...dungeon.floors];
  updatedFloors[nextFloorIndex] = updatedFloor;

  return {
    ...dungeon,
    floors: updatedFloors,
    currentFloor: nextFloorIndex,
    currentRoomId: nextFloor.startRoomId
  };
}

// 選択可能な部屋のリストを取得
export function getAvailableRooms(dungeon: Dungeon): readonly Room[] {
  const floor = dungeon.floors[dungeon.currentFloor];
  const available: Room[] = [];

  for (const room of floor.rooms.values()) {
    if (room.status === 'available') {
      available.push(room);
    }
  }

  return available;
}

// 現在の部屋を取得
export function getCurrentRoom(dungeon: Dungeon): Room | null {
  if (!dungeon.currentRoomId) {
    return null;
  }

  const floor = dungeon.floors[dungeon.currentFloor];
  return floor.rooms.get(dungeon.currentRoomId) || null;
}
