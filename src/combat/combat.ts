// 戦闘システム: 戦闘状態の初期化と更新

import type { CombatState, Action } from '../types/CombatState.js';
import type { RandomGenerator } from '../core/random.js';
import { createGrid } from './grid.js';
import { initializeTimeline, accumulateTimeline, getNextActor, consumeActionPoints } from './timeline.js';
import { createPlayer, createEnemy, moveEntity, damageEntity, updateEntity, removeDeadEntities, findEntityAt } from './entity.js';

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
  action: Action
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
          const damaged = damageEntity(target, actor);
          newEntities = updateEntity(newEntities, damaged);
        }
      }
      break;

    case 'wait':
      // 何もしない
      break;
  }

  // 死亡したエンティティを除去
  newEntities = removeDeadEntities(newEntities);

  // AP を消費
  const newTimeline = consumeActionPoints(state.timeline, entityId, action.apCost);

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
