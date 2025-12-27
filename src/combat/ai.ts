// AI システム: 敵の行動決定

import type { Entity, Enemy } from '../types/Entity.js';
import type { CombatState, Action } from '../types/CombatState.js';
import type { Position } from '../types/GameState.js';
import type { RandomGenerator } from '../core/random.js';
import { getDistance, findPath } from './grid.js';
import { findEntityById } from './entity.js';

// AI が行動を決定
export function decideAction(
  state: CombatState,
  enemyId: string,
  rng: RandomGenerator = Math.random
): Action | null {
  const enemy = findEntityById(state.entities, enemyId) as Enemy | undefined;

  if (!enemy) {
    return null;
  }

  // AI タイプに応じて行動を決定
  switch (enemy.aiType) {
    case 'melee':
      return decideMeleeAction(state, enemy);
    case 'boss':
      return decideBossAction(state, enemy, rng);
    default:
      return null;
  }
}

// 近接 AI の行動決定
function decideMeleeAction(state: CombatState, enemy: Enemy): Action | null {
  const player = findEntityById(state.entities, 'player');

  if (!player) {
    return { type: 'wait', apCost: 100 };
  }

  const distance = getDistance(enemy.pos, player.pos);

  // 隣接している場合は攻撃
  if (distance <= 1.5) {
    return {
      type: 'attack',
      targetPos: player.pos,
      apCost: 100
    };
  }

  // プレイヤーに近づく
  const path = findPath(state.grid, enemy.pos, player.pos);

  if (path && path.length > 1) {
    return {
      type: 'move',
      targetPos: path[1],
      apCost: 100
    };
  }

  // パスが見つからない場合は待機
  return { type: 'wait', apCost: 100 };
}

// ボス AI の行動決定（より戦略的）
function decideBossAction(state: CombatState, boss: Enemy, rng: RandomGenerator): Action | null {
  const player = findEntityById(state.entities, 'player');

  if (!player) {
    return { type: 'wait', apCost: 100 };
  }

  const distance = getDistance(boss.pos, player.pos);

  // HP が低い場合は距離を取る戦略
  const hpRatio = boss.hp / boss.stats.maxHp;
  const shouldRetreat = hpRatio < 0.3;

  // 隣接している場合
  if (distance <= 1.5) {
    // 低HP時は30%の確率で後退
    if (shouldRetreat && rng() < 0.3) {
      const retreatPos = findRetreatPosition(state, boss, player);
      if (retreatPos) {
        return {
          type: 'move',
          targetPos: retreatPos,
          apCost: 100
        };
      }
    }

    // 攻撃
    return {
      type: 'attack',
      targetPos: player.pos,
      apCost: 100
    };
  }

  // 遠距離の場合はプレイヤーに接近
  const path = findPath(state.grid, boss.pos, player.pos);

  if (path && path.length > 1) {
    return {
      type: 'move',
      targetPos: path[1],
      apCost: 100
    };
  }

  // パスが見つからない場合は待機
  return { type: 'wait', apCost: 100 };
}

// 後退位置を探す（敵から離れる）
function findRetreatPosition(
  state: CombatState,
  entity: Entity,
  threat: Entity
): Position | null {
  const candidates: Position[] = [];

  // 隣接する8マスをチェック
  const offsets = [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    { x: -1, y: 0 },                   { x: 1, y: 0 },
    { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
  ];

  for (const offset of offsets) {
    const newPos = {
      x: entity.pos.x + offset.x,
      y: entity.pos.y + offset.y
    };

    // グリッド内かチェック
    if (
      newPos.x >= 0 && newPos.x < state.grid.width &&
      newPos.y >= 0 && newPos.y < state.grid.height
    ) {
      // 他のエンティティがいないかチェック
      const blocked = state.entities.some(e => e.pos.x === newPos.x && e.pos.y === newPos.y);

      if (!blocked) {
        // 脅威から遠ざかる位置を優先
        const currentDist = getDistance(entity.pos, threat.pos);
        const newDist = getDistance(newPos, threat.pos);

        if (newDist > currentDist) {
          candidates.push(newPos);
        }
      }
    }
  }

  // 候補がある場合は最も遠い位置を選択
  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      const distA = getDistance(a, threat.pos);
      const distB = getDistance(b, threat.pos);
      return distB - distA;
    });

    return candidates[0];
  }

  return null;
}
