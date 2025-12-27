// ダンジョンナビゲーション: 部屋選択と遷移

import type { Dungeon, Floor, Room } from '../types/Dungeon.js';

// 部屋を選択（部屋に入る）
export function selectRoom(dungeon: Dungeon, roomId: string): Dungeon {
  if (!dungeon.currentFloor) {
    return dungeon;
  }

  const floor = dungeon.currentFloor;
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

  return {
    ...dungeon,
    currentFloor: updatedFloor,
    currentRoomId: roomId
  };
}

// 部屋をクリア（次の部屋を選択可能にする）
export function clearRoom(dungeon: Dungeon): Dungeon {
  if (!dungeon.currentRoomId || !dungeon.currentFloor) {
    return dungeon;
  }

  const floor = dungeon.currentFloor;
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

  return {
    ...dungeon,
    currentFloor: updatedFloor
  };
}

// 選択可能な部屋のリストを取得
export function getAvailableRooms(dungeon: Dungeon): readonly Room[] {
  return dungeon.currentFloor?.rooms.values()
    .filter(({ status }) => status === 'available')
    .toArray() ?? [];
}

// 現在の部屋を取得
export function getCurrentRoom(dungeon: Dungeon): Room | null {
  if (dungeon.currentRoomId && dungeon.currentFloor) {
    return dungeon.currentFloor.rooms.get(dungeon.currentRoomId) ?? null;
  } else {
    return null;
  }
}
