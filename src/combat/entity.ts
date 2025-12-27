// エンティティ操作: エンティティの生成・更新

import type { Entity, Player, Enemy } from '../types/Entity.js';
import type { Position } from '../types/GameState.js';
import type { RandomGenerator } from '../core/random.js';
import { aggregateEntityEffects } from '../items/effects.js';

// プレイヤーを生成
export function createPlayer(pos: Position): Player {
  return {
    id: 'player',
    type: 'player',
    symbol: '@',
    pos,
    hp: 100,
    stats: {
      maxHp: 100,
      attack: 10,
      defense: 5,
      speed: 100
    }
  };
}

// 敵を生成
export function createEnemy(id: string, pos: Position, rng: RandomGenerator): Enemy {
  // Phase 2 ではシンプルな敵のみ
  const hpVariation = Math.floor(rng() * 20) - 10;  // ±10
  const maxHp = 50 + hpVariation;

  return {
    id,
    type: 'enemy',
    symbol: 'E',
    pos,
    hp: maxHp,
    stats: {
      maxHp,
      attack: 8,
      defense: 3,
      speed: 80
    },
    aiType: 'melee'
  };
}

// エンティティを移動
export function moveEntity(entity: Entity, newPos: Position): Entity {
  return { ...entity, pos: newPos };
}

// エンティティにダメージを与える（レリック効果を考慮）
export function damageEntity(entity: Entity, attacker: Entity, rng: RandomGenerator = Math.random): Entity {
  // 攻撃者と防御者のレリック効果を集計
  const attackerEffects = aggregateEntityEffects(attacker);
  const defenderEffects = aggregateEntityEffects(entity);

  // 基本ダメージ計算
  let baseDamage = attacker.stats.attack - entity.stats.defense;

  // 攻撃者のボーナスダメージを追加
  baseDamage += attackerEffects.bonusDamage;

  // 防御者の攻撃力低下デバフを適用
  baseDamage *= (100 - defenderEffects.attackDownPercent) / 100;

  // クリティカルヒット判定
  const isCritical = rng() * 100 < attackerEffects.criticalChance;
  if (isCritical) {
    baseDamage *= attackerEffects.criticalMultiplier;
  }

  // 防御者のダメージ軽減を適用
  baseDamage -= defenderEffects.damageReduction;

  // 最低ダメージは1
  let finalDamage = Math.max(1, Math.floor(baseDamage));

  // DoTダメージを追加
  if (attackerEffects.dotDamage > 0) {
    finalDamage += attackerEffects.dotDamage;
  }

  // ダメージを適用
  let newHp = Math.max(0, entity.hp - finalDamage);

  // ライフスティール効果（攻撃者のHP回復は呼び出し側で処理）

  return { ...entity, hp: newHp };
}

// ライフスティール効果によるHP回復を計算
export function calculateLifesteal(attacker: Entity, damageDealt: number): number {
  const attackerEffects = aggregateEntityEffects(attacker);
  const healAmount = Math.floor(damageDealt * attackerEffects.lifestealPercent / 100);
  return healAmount;
}

// エンティティのHPを回復
export function healEntity(entity: Entity, amount: number): Entity {
  const newHp = Math.min(entity.stats.maxHp, entity.hp + amount);
  return { ...entity, hp: newHp };
}

// エンティティが死亡しているか
export function isDead(entity: Entity): boolean {
  return entity.hp <= 0;
}

// エンティティリストから指定IDのエンティティを取得
export function findEntityById(
  entities: readonly Entity[],
  id: string
): Entity | undefined {
  return entities.find(e => e.id === id);
}

// エンティティリストから指定位置のエンティティを取得
export function findEntityAt(
  entities: readonly Entity[],
  pos: Position
): Entity | undefined {
  return entities.find(e => e.pos.x === pos.x && e.pos.y === pos.y);
}

// エンティティリストを更新（指定IDのエンティティを置き換え）
export function updateEntity(
  entities: readonly Entity[],
  updated: Entity
): readonly Entity[] {
  return entities.map(e => e.id === updated.id ? updated : e);
}

// 死亡したエンティティを除去
export function removeDeadEntities(
  entities: readonly Entity[]
): readonly Entity[] {
  return entities.filter(e => !isDead(e));
}
