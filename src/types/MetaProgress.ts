// メタプログレッション: プレイ間で永続化されるゲーム進行データ

// アンロック条件の種類
export type UnlockConditionType =
  | 'firstClear'        // 初回クリア
  | 'bossKill'          // 特定ボス撃破
  | 'clearCount'        // クリア回数
  | 'floorReached'      // 到達フロア
  | 'treasureCollected' // 特定トレジャー獲得
  | 'always';           // 常に解放済み

// アンロック条件
export interface UnlockCondition {
  readonly type: UnlockConditionType;
  readonly value?: number | string; // bossKill: ボスID, clearCount: 回数, treasureCollected: トレジャーID
}

// トロフィーのアンロック情報
export interface TrophyUnlock {
  readonly trophyId: string;
  readonly unlocked: boolean;
  readonly unlockedAt?: string; // ISO8601 日時文字列
}

// トレジャーのアンロック情報
export interface TreasureUnlock {
  readonly treasureId: string;
  readonly unlocked: boolean;
  readonly unlockedAt?: string; // ISO8601 日時文字列
}

// ゲーム統計情報
export interface GameStats {
  readonly totalRuns: number;           // 総プレイ回数
  readonly totalClears: number;         // 総クリア回数
  readonly maxFloorReached: number;     // 到達最大フロア
  readonly bossesKilled: readonly string[]; // 撃破したボスのID一覧
  readonly treasuresCollected: readonly string[]; // 獲得したトレジャーのID一覧（重複あり）
}

// メタ進行データ（プレイ間で永続化）
export interface MetaProgress {
  readonly version: number;                        // データバージョン
  readonly stats: GameStats;                       // ゲーム統計
  readonly unlockedTrophies: readonly TrophyUnlock[];   // アンロック済みトロフィー
  readonly unlockedTreasures: readonly TreasureUnlock[]; // アンロック済みトレジャー
  readonly lastPlayedAt: string;                   // 最終プレイ日時（ISO8601）
}

// アンロック条件定義（マスターデータ）
export interface UnlockDefinition {
  readonly itemId: string;              // トロフィーまたはトレジャーのID
  readonly itemType: 'trophy' | 'treasure';
  readonly condition: UnlockCondition;
  readonly displayName: string;         // 表示名
  readonly description: string;         // 説明
}
