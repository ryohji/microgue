// ゲーム全体のフロー管理

import type { Dungeon } from './Dungeon.js';
import type { PlayerInventory } from './Items.js';
import type { CombatState } from './CombatState.js';

// ゲームフェーズ
export type GamePhase =
  | 'navigation'    // ダンジョン探索中（部屋選択）
  | 'room'          // 部屋内（戦闘 or 休憩）
  | 'reward'        // 報酬確認・獲得
  | 'victory'       // クリア
  | 'defeat';       // 敗北

// ゲーム全体の状態
export interface GameState {
  readonly phase: GamePhase;
  readonly dungeon: Dungeon;
  readonly inventory: PlayerInventory;
  readonly currentHp: number;
  readonly maxHp: number;
  readonly currentFloor: number;
  readonly combat: CombatState | null;
  readonly message: string;
}
