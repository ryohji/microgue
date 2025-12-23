// 戦闘状態の型定義

import type { Entity } from './Entity.js';
import type { Position } from './GameState.js';

// グリッド
export interface Grid {
  readonly width: number;
  readonly height: number;
}

// アクション定義
export interface Action {
  readonly type: 'move' | 'attack' | 'wait';
  readonly targetPos?: Position;  // 移動先・攻撃対象位置
  readonly apCost: number;  // アクションポイントコスト
}

// 戦闘状態
export interface CombatState {
  readonly grid: Grid;
  readonly entities: readonly Entity[];
  readonly timeline: ReadonlyMap<string, number>;  // entityId -> ゲージ値 (0-100)
  readonly currentTurn: string | null;  // 現在行動中のエンティティID
}
