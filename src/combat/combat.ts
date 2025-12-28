// 戦闘システム: 戦闘状態の初期化と更新

import type { CombatState, Action } from '../types/CombatState.js';
import type { RandomGenerator } from '../core/random.js';
import { createGrid } from './grid.js';
import { initializeTimeline, accumulateTimeline, getNextActor, consumeActionPoints } from './timeline.js';
import { createPlayer, createEnemy, moveEntity, damageEntity, updateEntity, removeDeadEntities, findEntityAt, calculateLifesteal, healEntity, isDead } from './entity.js';

// 戦闘を初期化
export function initCombat(
  gridWidth: number,
  gridHeight: number,
  rng: RandomGenerator
): CombatState {
  const grid = createGrid(gridWidth, gridHeight);

  // プレイヤーを左側に配置
  const player = createPlayer({ x: 1, y: Math.floor(gridHeight / 2) });

  // 敵を右側に配置
  const enemy = createEnemy('enemy1', { x: gridWidth - 2, y: Math.floor(gridHeight / 2) }, rng);

  const entities = [player, enemy];
  const timeline = initializeTimeline(entities);

  return {
    grid,
    entities,
    timeline,
    currentTurn: null
  };
}

// 戦闘状態を更新
export function updateCombat(
  state: CombatState,
  deltaTime: number
): CombatState {
  // タイムラインを蓄積
  const newTimeline = accumulateTimeline(state.timeline, state.entities, deltaTime);

  // 次の行動者を決定
  const nextActor = getNextActor(newTimeline);

  return {
    ...state,
    timeline: newTimeline,
    currentTurn: nextActor
  };
}

// アクションを実行
export function executeAction(
  state: CombatState,
  entityId: string,
  action: Action,
  rng: RandomGenerator = Math.random
): CombatState {
  let newEntities = state.entities;
  const actor = newEntities.find(e => e.id === entityId);

  if (!actor) {
    return state;
  }

  // アクションタイプごとの処理
  switch (action.type) {
    case 'move':
      if (action.targetPos) {
        // 移動先に他のエンティティがいないかチェック
        const blocking = findEntityAt(newEntities, action.targetPos);
        if (!blocking) {
          const moved = moveEntity(actor, action.targetPos);
          newEntities = updateEntity(newEntities, moved);
        }
      }
      break;

    case 'attack':
      if (action.targetPos) {
        const target = findEntityAt(newEntities, action.targetPos);
        if (target) {
          // ダメージ前のHP
          const previousHp = target.hp;

          // ダメージを与える
          const damaged = damageEntity(target, actor, rng);
          newEntities = updateEntity(newEntities, damaged);

          // ライフスティール処理
          const actualDamage = previousHp - damaged.hp;
          const lifestealAmount = calculateLifesteal(actor, actualDamage);

          if (lifestealAmount > 0) {
            const healed = healEntity(actor, lifestealAmount);
            newEntities = updateEntity(newEntities, healed);
          }
        }
      }
      break;

    case 'wait':
      // 何もしない
      break;
  }

  // 死亡したエンティティを特定
  const deadEntities = newEntities.filter(e => isDead(e));

  // 死亡したエンティティを除去
  newEntities = removeDeadEntities(newEntities);

  // 死亡したエンティティをタイムラインから削除
  let newTimeline = new Map(state.timeline);
  for (const dead of deadEntities) {
    newTimeline.delete(dead.id);
  }

  // AP を消費
  newTimeline = consumeActionPoints(newTimeline, entityId, action.apCost);

  return {
    ...state,
    entities: newEntities,
    timeline: newTimeline,
    currentTurn: null  // アクション後はターンをクリア
  };
}

// 戦闘が終了しているかチェック
export function isCombatOver(state: CombatState): boolean {
  const hasPlayer = state.entities.some(e => e.id === 'player');
  const hasEnemy = state.entities.some(e => e.id.startsWith('enemy'));

  return !hasPlayer || !hasEnemy;
}

// 勝利判定
export function isVictory(state: CombatState): boolean {
  const hasPlayer = state.entities.some(e => e.id === 'player');
  const hasEnemy = state.entities.some(e => e.id.startsWith('enemy'));

  return hasPlayer && !hasEnemy;
}
