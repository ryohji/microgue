// タイムラインシステム: Timeline + AP による行動順序管理

import type { Entity } from '../types/Entity.js';

// タイムラインゲージを蓄積
// 誰かが100以上になったら、それ以降の蓄積を停止する
export function accumulateTimeline(
  timeline: ReadonlyMap<string, number>,
  entities: readonly Entity[],
  deltaTime: number
): Map<string, number> {
  const newTimeline = new Map(timeline);

  // 誰かが既に100以上なら蓄積しない
  const hasReady = Array.from(timeline.values()).some(gauge => gauge >= 100);
  if (hasReady) {
    return newTimeline;
  }

  for (const entity of entities) {
    const current = newTimeline.get(entity.id) ?? 0;
    const gain = entity.stats.speed * deltaTime;
    newTimeline.set(entity.id, current + gain);
  }

  return newTimeline;
}

// アクションポイントを消費
export function consumeActionPoints(
  timeline: ReadonlyMap<string, number>,
  entityId: string,
  apCost: number
): Map<string, number> {
  const newTimeline = new Map(timeline);
  const current = newTimeline.get(entityId) ?? 0;
  newTimeline.set(entityId, Math.max(0, current - apCost));
  return newTimeline;
}

// 次の行動者を決定（ゲージが100以上のエンティティの中で最大値を持つもの）
export function getNextActor(
  timeline: ReadonlyMap<string, number>
): string | null {
  let maxGauge = -1;
  let nextActor: string | null = null;

  for (const [id, gauge] of timeline) {
    if (gauge >= 100 && gauge > maxGauge) {
      maxGauge = gauge;
      nextActor = id;
    }
  }

  return nextActor;
}

// タイムラインを初期化
export function initializeTimeline(
  entities: readonly Entity[]
): Map<string, number> {
  const timeline = new Map<string, number>();

  for (const entity of entities) {
    timeline.set(entity.id, 0);
  }

  return timeline;
}

// エンティティが行動可能か（ゲージが100以上）
export function canAct(
  timeline: ReadonlyMap<string, number>,
  entityId: string
): boolean {
  return (timeline.get(entityId) ?? 0) >= 100;
}
