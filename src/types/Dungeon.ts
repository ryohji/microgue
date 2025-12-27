// ダンジョンシステムの型定義

import type { Reward } from './Items.js';

// 部屋の種類
export type RoomType =
  | 'normal'      // 通常戦闘（雑魚敵 1-3体）
  | 'elite'       // 難敵戦闘（強敵 1-2体）
  | 'horde'       // 大広間（大量の敵 5-8体）
  | 'boss'        // ボス部屋（ボス1体）
  | 'rest';       // 休憩部屋（HP回復 + 報酬）

// 部屋の状態
export type RoomStatus =
  | 'locked'      // 未到達
  | 'available'   // 選択可能
  | 'current'     // 現在地
  | 'cleared';    // クリア済み

// 部屋
export interface Room {
  readonly id: string;
  readonly type: RoomType;
  readonly status: RoomStatus;
  readonly depth: number;                // 深度（スタートからの距離）
  readonly nextRooms: readonly string[]; // 次に進める部屋のID
  readonly enemyCount?: number;          // 敵の数（戦闘部屋の場合）
  readonly reward: Reward;               // 部屋の報酬（すべての部屋）
}

// フロア（階層）
export interface Floor {
  readonly floorNumber: number;
  readonly rooms: ReadonlyMap<string, Room>;
  readonly startRoomId: string;
  readonly bossRoomId: string;
  readonly restRoomCount: number;        // このフロアの休憩部屋数（最大2）
}

// ダンジョン全体（遅延生成：現在のフロアのみ保持）
export interface Dungeon {
  readonly totalFloors: number;           // 全フロア数
  readonly currentFloorNumber: number;    // 現在のフロア番号（0-indexed）
  readonly currentFloor: Floor | null;    // 現在のフロア（未開始時はnull）
  readonly currentRoomId: string | null;  // 現在の部屋ID
  readonly options: DungeonGenerationOptions; // ダンジョン生成オプション
}

// ダンジョン生成オプション
export interface DungeonGenerationOptions {
  readonly floorsCount: number;          // フロア数（3〜5）
  readonly minRoomsToReachBoss: number;  // ボスまでの最短経路の部屋数（最低限のアイテム数保証）
  readonly maxRoomsToReachBoss: number;  // ボスまでの最長経路の部屋数（アイテム数上限）
  readonly branchingFactor: number;      // 分岐係数（各部屋から次に進める部屋の数 1〜3）
  readonly maxRestRoomsPerFloor: number; // フロアごとの休憩部屋上限（2）
}

// デフォルト設定（テンポ重視の短時間プレイ）
export const DEFAULT_DUNGEON_OPTIONS: DungeonGenerationOptions = {
  floorsCount: 3,
  minRoomsToReachBoss: 4,    // 最低4部屋通過 = 最低4アイテム獲得
  maxRoomsToReachBoss: 6,    // 最大6部屋通過 = 最大6アイテム獲得
  branchingFactor: 2,        // 平均2つの選択肢
  maxRestRoomsPerFloor: 2
};
