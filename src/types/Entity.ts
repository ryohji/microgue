// エンティティ（プレイヤー・敵）の型定義

import type { Position } from './GameState.js';

// ステータス
export interface Stats {
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
}

// エンティティ基底型
export interface Entity {
  readonly id: string;
  readonly symbol: string;        // ASCII表示用文字
  readonly pos: Position;
  readonly hp: number;
  readonly stats: Stats;
}

// プレイヤー
export interface Player extends Entity {
  readonly type: 'player';
}

// 敵
export interface Enemy extends Entity {
  readonly type: 'enemy';
  readonly aiType: 'melee';  // Phase 2 ではシンプルな近接AIのみ
}
