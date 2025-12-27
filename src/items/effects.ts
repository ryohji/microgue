// 効果システム: アイテム効果の集計と適用

import type { PlayerInventory, AggregatedEffects, EffectValue, EffectType } from '../types/Items.js';

// Mutableな効果集計用の内部型
type MutableAggregatedEffects = {
  -readonly [K in keyof AggregatedEffects]: AggregatedEffects[K];
};

// 空の効果（初期値）
export function createEmptyEffects(): AggregatedEffects {
  return {
    maxHpBoost: 0,
    barrier: 0,
    speedBoost: 0,
    evasionBoost: 0,
    accuracyBoost: 0,
    bonusDamage: 0,
    criticalChance: 0,
    criticalMultiplier: 1.5, // デフォルトのクリティカル倍率
    hasAreaAttack: false,
    dotDamage: 0,
    lifestealPercent: 0,
    damageReduction: 0,
    attackDownPercent: 0,
    speedDownPercent: 0
  };
}

// インベントリから効果を集計
export function aggregateEffects(inventory: PlayerInventory): AggregatedEffects {
  const effects: MutableAggregatedEffects = createEmptyEffects() as MutableAggregatedEffects;

  // すべてのトレジャーから効果を集計
  for (const item of inventory.treasures) {
    for (const effect of item.effects) {
      applyEffect(effects, effect);
    }
  }

  return effects;
}

// 単一の効果を集計結果に適用（副作用的だがパフォーマンス重視）
function applyEffect(effects: MutableAggregatedEffects, effect: EffectValue): void {
  const levelMultiplier = effect.level ? effect.level : 1;
  const value = effect.value * levelMultiplier;

  switch (effect.type) {
    case 'maxHpBoost':
      effects.maxHpBoost += value;
      break;
    case 'barrier':
      effects.barrier += value;
      break;
    case 'speedBoost':
      effects.speedBoost += value;
      break;
    case 'evasionBoost':
      effects.evasionBoost += value;
      break;
    case 'accuracyBoost':
      effects.accuracyBoost += value;
      break;
    case 'bonusDamage':
      effects.bonusDamage += value;
      break;
    case 'critical':
      effects.criticalChance += value;
      break;
    case 'areaAttack':
      effects.hasAreaAttack = true;
      break;
    case 'dotDamage':
      effects.dotDamage += value;
      break;
    case 'lifesteal':
      effects.lifestealPercent += value;
      break;
    case 'damageReduction':
      effects.damageReduction += value;
      break;
    case 'attackDown':
      effects.attackDownPercent += value;
      break;
    case 'speedDown':
      effects.speedDownPercent += value;
      break;
  }
}

// 効果のレベルアップ
export function upgradeEffect(effect: EffectValue): EffectValue {
  return {
    ...effect,
    level: (effect.level ?? 1) + 1
  };
}

// 特定の効果タイプを持つかチェック
export function hasEffect(inventory: PlayerInventory, effectType: EffectType): boolean {
  for (const item of inventory.treasures) {
    for (const effect of item.effects) {
      if (effect.type === effectType) {
        return true;
      }
    }
  }

  return false;
}

// 特定の効果タイプの合計レベルを取得
export function getEffectLevel(inventory: PlayerInventory, effectType: EffectType): number {
  let totalLevel = 0;

  for (const item of inventory.treasures) {
    for (const effect of item.effects) {
      if (effect.type === effectType) {
        totalLevel += effect.level ?? 1;
      }
    }
  }

  return totalLevel;
}
