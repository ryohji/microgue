// トレジャーシステム: プレイ内報酬の生成

import type { Treasure, TreasureType, EffectType, PlayerInventory } from '../types/Items.js';
import type { RandomGenerator } from '../core/random.js';
import { hasEffect } from './effects.js';

// トレジャープール（マスターデータから読み込む想定）
const TREASURE_POOL: readonly Treasure[] = [
  // Common - メジャーレリック（シンプルな効果）
  {
    id: 'relic_hp_boost',
    name: '頑健の指輪',
    description: '最大体力+15',
    rarity: 'common',
    type: 'majorRelic',
    effects: [{ type: 'maxHpBoost', value: 15 }]
  },
  {
    id: 'relic_speed_boost',
    name: '俊敏の指輪',
    description: '素早さ+8',
    rarity: 'common',
    type: 'majorRelic',
    effects: [{ type: 'speedBoost', value: 8 }]
  },
  {
    id: 'relic_damage_boost',
    name: '剛力の指輪',
    description: '追加ダメージ+3',
    rarity: 'common',
    type: 'majorRelic',
    effects: [{ type: 'bonusDamage', value: 3 }]
  },
  {
    id: 'relic_evasion_boost',
    name: '回避の指輪',
    description: '回避率+8%',
    rarity: 'common',
    type: 'majorRelic',
    effects: [{ type: 'evasionBoost', value: 8 }]
  },
  {
    id: 'relic_accuracy_boost',
    name: '命中の指輪',
    description: '命中率+8%',
    rarity: 'common',
    type: 'majorRelic',
    effects: [{ type: 'accuracyBoost', value: 8 }]
  },

  // Rare - メジャーレリック（強力な効果）
  {
    id: 'relic_berserker',
    name: '狂戦士の首飾り',
    description: '最大体力+20、追加ダメージ+5、被ダメージ+2',
    rarity: 'rare',
    type: 'majorRelic',
    effects: [
      { type: 'maxHpBoost', value: 20 },
      { type: 'bonusDamage', value: 5 },
      { type: 'damageReduction', value: -2 } // デメリット
    ]
  },
  {
    id: 'relic_tank',
    name: '要塞の盾',
    description: '最大体力+30、障壁+30、素早さ-10',
    rarity: 'rare',
    type: 'majorRelic',
    effects: [
      { type: 'maxHpBoost', value: 30 },
      { type: 'barrier', value: 30 },
      { type: 'speedBoost', value: -10 } // デメリット
    ]
  },
  {
    id: 'relic_assassin',
    name: '暗殺者の短剣',
    description: 'クリティカル率+25%、回避率+10%',
    rarity: 'rare',
    type: 'majorRelic',
    effects: [
      { type: 'critical', value: 25 },
      { type: 'evasionBoost', value: 10 }
    ]
  },
  {
    id: 'relic_plague',
    name: '疫病の瓶',
    description: '継続ダメージ+10、敵の攻撃力-20%',
    rarity: 'rare',
    type: 'majorRelic',
    effects: [
      { type: 'dotDamage', value: 10 },
      { type: 'attackDown', value: 20 }
    ]
  },

  // Epic - メジャーレリック（非常に強力な効果）
  {
    id: 'relic_storm',
    name: '嵐の宝珠',
    description: '範囲攻撃、追加ダメージ+4',
    rarity: 'epic',
    type: 'majorRelic',
    effects: [
      { type: 'areaAttack', value: 1 },
      { type: 'bonusDamage', value: 4 }
    ]
  },

  // 消耗品（一度だけ使える）
  {
    id: 'consumable_hp_potion',
    name: '体力の薬',
    description: '最大体力+15（一度だけ）',
    rarity: 'common',
    type: 'consumable',
    effects: [{ type: 'maxHpBoost', value: 15 }]
  },
  {
    id: 'consumable_barrier_potion',
    name: '障壁の薬',
    description: '障壁+20（一度だけ）',
    rarity: 'common',
    type: 'consumable',
    effects: [{ type: 'barrier', value: 20 }]
  },
  {
    id: 'consumable_speed_potion',
    name: '俊敏の薬',
    description: '素早さ+10（一度だけ）',
    rarity: 'common',
    type: 'consumable',
    effects: [{ type: 'speedBoost', value: 10 }]
  }
];

// マイナーレリックのテンプレート（効果レベルアップ）
const MINOR_RELIC_TEMPLATES: ReadonlyMap<EffectType, Omit<Treasure, 'id' | 'effects'>> = new Map([
  ['maxHpBoost', {
    name: '体力の結晶',
    description: '体力増加効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'maxHpBoost'
  }],
  ['speedBoost', {
    name: '俊敏の結晶',
    description: '素早さ増加効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'speedBoost'
  }],
  ['bonusDamage', {
    name: '剛力の結晶',
    description: '追加ダメージ効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'bonusDamage'
  }],
  ['critical', {
    name: '会心の結晶',
    description: 'クリティカル率効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'critical'
  }],
  ['evasionBoost', {
    name: '回避の結晶',
    description: '回避率効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'evasionBoost'
  }],
  ['accuracyBoost', {
    name: '命中の結晶',
    description: '命中率効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'accuracyBoost'
  }],
  ['barrier', {
    name: '障壁の結晶',
    description: '障壁効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'barrier'
  }],
  ['lifesteal', {
    name: '吸血の結晶',
    description: '体力吸収効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'lifesteal'
  }],
  ['damageReduction', {
    name: '鉄壁の結晶',
    description: '被ダメージ軽減効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'damageReduction'
  }],
  ['dotDamage', {
    name: '猛毒の結晶',
    description: '継続ダメージ効果のレベルが上がる',
    rarity: 'common',
    type: 'minorRelic',
    upgradeTarget: 'dotDamage'
  }]
]);

// トレジャータイプをランダムに選択
function selectTreasureType(rng: RandomGenerator, inventory: PlayerInventory): TreasureType {
  const roll = rng() * 100;

  // インベントリに効果がある場合はマイナーレリックが出やすい
  const hasAnyEffect = hasEffect(inventory, 'maxHpBoost') ||
    hasEffect(inventory, 'speedBoost') ||
    hasEffect(inventory, 'bonusDamage');

  if (hasAnyEffect) {
    if (roll < 30) return 'minorRelic';
    if (roll < 80) return 'majorRelic';
    return 'consumable';
  } else {
    if (roll < 70) return 'majorRelic';
    if (roll < 90) return 'consumable';
    return 'minorRelic';
  }
}

// マイナーレリックを生成
function generateMinorRelic(
  rng: RandomGenerator,
  inventory: PlayerInventory
): Treasure | null {
  // プレイヤーが持っている効果タイプを収集
  const availableEffects: EffectType[] = [];

  for (const [effectType] of MINOR_RELIC_TEMPLATES) {
    if (hasEffect(inventory, effectType)) {
      availableEffects.push(effectType);
    }
  }

  if (availableEffects.length === 0) {
    return null; // アップグレード対象がない
  }

  // ランダムに選択
  const effectType = availableEffects[Math.floor(rng() * availableEffects.length)];
  const template = MINOR_RELIC_TEMPLATES.get(effectType)!;

  return {
    id: `minor_relic_${effectType}_${Date.now()}`,
    name: template.name,
    description: template.description,
    rarity: template.rarity,
    type: 'minorRelic',
    effects: [{ type: effectType, value: 1, level: 1 }], // レベル+1相当
    upgradeTarget: effectType
  };
}

// トレジャーを生成
export function generateTreasure(
  rng: RandomGenerator,
  inventory: PlayerInventory
): Treasure {
  const treasureType = selectTreasureType(rng, inventory);

  if (treasureType === 'minorRelic') {
    const minorRelic = generateMinorRelic(rng, inventory);
    if (minorRelic) {
      return minorRelic;
    }
    // マイナーレリック生成失敗時はメジャーレリックにフォールバック
  }

  // メジャーレリックまたは消耗品
  const candidates = TREASURE_POOL.filter(t => t.type === treasureType || treasureType === 'minorRelic');

  if (candidates.length === 0) {
    // フォールバック: 最初のトレジャー
    return TREASURE_POOL[0];
  }

  const index = Math.floor(rng() * candidates.length);
  return candidates[index];
}

// 複数のトレジャー選択肢を生成
export function generateTreasureChoices(
  count: number,
  rng: RandomGenerator,
  inventory: PlayerInventory
): readonly Treasure[] {
  const choices: Treasure[] = [];

  for (let i = 0; i < count; i++) {
    choices.push(generateTreasure(rng, inventory));
  }

  return choices;
}
