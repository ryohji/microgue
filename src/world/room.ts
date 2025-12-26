// 部屋生成ロジック

import type { Room, RoomType } from '../types/Dungeon.js';
import type { RandomGenerator } from '../core/random.js';

// 部屋を生成
export function createRoom(
  id: string,
  type: RoomType,
  depth: number,
  nextRooms: readonly string[] = []
): Room {
  return {
    id,
    type,
    status: 'locked',
    depth,
    nextRooms,
    enemyCount: getEnemyCount(type)
  };
}

// 部屋タイプに応じた敵の数を決定
function getEnemyCount(type: RoomType): number {
  switch (type) {
    case 'normal':
      return 2;  // 通常戦闘: 2体
    case 'elite':
      return 1;  // 難敵: 1体（強い）
    case 'horde':
      return 6;  // 大広間: 6体
    case 'boss':
      return 1;  // ボス: 1体
    case 'rest':
      return 0;  // 休憩部屋: 戦闘なし
  }
}

// ランダムな戦闘部屋タイプを選択（ボス以外）
export function randomCombatRoomType(rng: RandomGenerator): RoomType {
  const roll = rng();

  if (roll < 0.6) {
    return 'normal';  // 60%
  } else if (roll < 0.85) {
    return 'elite';   // 25%
  } else {
    return 'horde';   // 15%
  }
}

// 部屋の状態を更新
export function updateRoomStatus(room: Room, status: Room['status']): Room {
  return { ...room, status };
}

// 部屋に次の選択肢を追加
export function addNextRooms(room: Room, nextRoomIds: readonly string[]): Room {
  return { ...room, nextRooms: [...room.nextRooms, ...nextRoomIds] };
}
