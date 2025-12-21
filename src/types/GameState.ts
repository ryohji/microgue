// ゲーム状態の型定義（Phase 1: 最小限）

export interface Position {
  readonly x: number;
  readonly y: number;
}

// Phase 1 では最小限の状態のみ定義
export interface GameState {
  readonly cursorPos: Position;
  readonly running: boolean;
}
