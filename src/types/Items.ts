// アイテムシステム: トロフィー・トレジャーの型定義

// 効果の種類
export type EffectType =
  // ステータス増強
  | 'maxHpBoost'        // 最大体力増加
  | 'barrier'           // 障壁（体力減少の肩代わり）
  | 'speedBoost'        // 素早さ増加
  | 'evasionBoost'      // 回避率増加
  | 'accuracyBoost'     // 命中率増加

  // 攻撃強化
  | 'bonusDamage'       // 追加ダメージ
  | 'critical'          // クリティカル効果
  | 'areaAttack'        // 範囲攻撃
  | 'dotDamage'         // 継続ダメージ (Damage Over Time)
  | 'lifesteal'         // 体力吸収

  // 防御強化
  | 'damageReduction'   // 被ダメージ軽減

  // デバフ効果
  | 'attackDown'        // 敵の攻撃力低下
  | 'speedDown'         // 敵の速度低下
;

// 効果の値（数値または真偽値）
export interface EffectValue {
  readonly type: EffectType;
  readonly value: number;       // 効果の強さ（%やフラット値）
  readonly level?: number;      // 効果レベル（アップグレード可能な場合）
}

// トレジャーのレアリティ
export type TreasureRarity = 'common' | 'rare' | 'epic';

// トレジャーの種類
export type TreasureType =
  | 'majorRelic'        // メジャーレリック: 強力な効果
  | 'minorRelic'        // マイナーレリック: 既存効果のレベルアップ
  | 'consumable'        // 消耗品: 一度だけ使える
;

// トレジャー: プレイ内で部屋クリア時に入手するアイテム
export interface Treasure {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly rarity: TreasureRarity;
  readonly type: TreasureType;
  readonly effects: readonly EffectValue[];
  readonly upgradeTarget?: EffectType; // マイナーレリックの場合、アップグレード対象
}

// トロフィー: プレイ間で永続化される実績報酬
export interface Trophy {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly condition: string;   // 獲得条件の説明
  readonly unlocked: boolean;   // 解除済みか
}

// 報酬（部屋の報酬として使用）
export interface Reward {
  readonly treasure: Treasure;
}

// プレイヤーのインベントリ
export interface PlayerInventory {
  readonly treasures: readonly Treasure[];
}

// メタプログレッション（トロフィー管理）
export interface MetaProgress {
  readonly trophies: readonly Trophy[];
}

// 効果の集計結果（実際の戦闘で使用）
export interface AggregatedEffects {
  // ステータス増強
  readonly maxHpBoost: number;
  readonly barrier: number;
  readonly speedBoost: number;
  readonly evasionBoost: number;
  readonly accuracyBoost: number;

  // 攻撃強化
  readonly bonusDamage: number;
  readonly criticalChance: number;
  readonly criticalMultiplier: number;
  readonly hasAreaAttack: boolean;
  readonly dotDamage: number;
  readonly lifestealPercent: number;

  // 防御強化
  readonly damageReduction: number;

  // デバフ効果
  readonly attackDownPercent: number;
  readonly speedDownPercent: number;
}
