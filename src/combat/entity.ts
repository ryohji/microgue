// エンティティ操作: エンティティの生成・更新

import type { Entity, Player, Enemy } from '../types/Entity.js';
import type { Position } from '../types/GameState.js';
import type { RandomGenerator } from '../core/random.js';

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

// エンティティにダメージを与える
export function damageEntity(entity: Entity, attacker: Entity): Entity {
  const damage = Math.max(1, attacker.stats.attack - entity.stats.defense);
  const newHp = Math.max(0, entity.hp - damage);
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
