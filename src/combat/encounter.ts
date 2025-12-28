// エンカウンターシステム: 部屋タイプに応じた戦闘の生成

import type { RoomType } from '../types/Dungeon.js';
import type { CombatState } from '../types/CombatState.js';
import type { Entity } from '../types/Entity.js';
import type { RandomGenerator } from '../core/random.js';
import type { PlayerInventory } from '../types/Items.js';
import { createGrid } from './grid.js';
import { createPlayer } from './entity.js';
import { createEnemy, getNormalEnemyIds, getEliteEnemyIds } from './enemies.js';
import { createBoss } from './bosses.js';
import { initializeTimeline } from './timeline.js';
import { aggregateEffects } from '../items/effects.js';

// プレイヤーのステータスにレリック効果を適用
export function applyRelicEffectsToPlayer(
  basePlayer: Entity,
  inventory: PlayerInventory
): Entity {
  const effects = aggregateEffects(inventory);

  // ステータスを更新
  // 注: attack/defense boost は bonusDamage/damageReduction として戦闘時に適用される
  const newStats = {
    maxHp: basePlayer.stats.maxHp + effects.maxHpBoost,
    attack: basePlayer.stats.attack,  // 基本値のまま（bonusDamage は戦闘時に適用）
    defense: basePlayer.stats.defense, // 基本値のまま（damageReduction は戦闘時に適用）
    speed: basePlayer.stats.speed + effects.speedBoost
  };

  // HP を調整（maxHp が増えた場合、現在 HP も増やす）
  const hpIncrease = newStats.maxHp - basePlayer.stats.maxHp;
  const newHp = Math.min(newStats.maxHp, basePlayer.hp + hpIncrease);

  return {
    ...basePlayer,
    hp: newHp,
    stats: newStats,
    equippedRelics: inventory.treasures
  };
}

// 部屋タイプに応じた戦闘を生成
export function createEncounterForRoom(
  roomType: RoomType,
  inventory: PlayerInventory,
  currentHp: number,
  bossId: string | null,
  rng: RandomGenerator = Math.random
): CombatState {
  const grid = createGrid(15, 10);

  // プレイヤーを左側に配置
  const basePlayer = createPlayer({ x: 2, y: 5 });

  // レリック効果を適用
  const player = applyRelicEffectsToPlayer(basePlayer, inventory);

  // 現在 HP を設定
  const playerWithHp = { ...player, hp: currentHp };

  // 部屋タイプに応じて敵を生成
  const enemies = generateEnemiesForRoom(roomType, bossId, rng);

  const allEntities: Entity[] = [playerWithHp, ...enemies];
  const timeline = initializeTimeline(allEntities);

  return {
    grid,
    entities: allEntities,
    timeline,
    currentTurn: null
  };
}

// 部屋タイプに応じて敵を生成
function generateEnemiesForRoom(
  roomType: RoomType,
  bossId: string | null,
  rng: RandomGenerator
): Entity[] {
  switch (roomType) {
    case 'normal':
      return generateNormalEncounter(rng);
    case 'elite':
      return generateEliteEncounter(rng);
    case 'horde':
      return generateHordeEncounter(rng);
    case 'boss':
      return generateBossEncounter(bossId, rng);
    case 'rest':
      // 休憩部屋には敵がいない
      return [];
    default:
      return generateNormalEncounter(rng);
  }
}

// 通常エンカウンター: 1-2体の通常敵
function generateNormalEncounter(rng: RandomGenerator): Entity[] {
  const normalIds = getNormalEnemyIds();
  if (normalIds.length === 0) return [];

  const count = rng() < 0.5 ? 1 : 2;
  const enemies: Entity[] = [];

  for (let i = 0; i < count; i++) {
    const enemyId = normalIds[Math.floor(rng() * normalIds.length)];
    const x = 10 + i * 2;
    const y = 4 + i;
    enemies.push(createEnemy(enemyId, { x, y }, String(i)));
  }

  return enemies;
}

// エリートエンカウンター: 1体のエリート敵
function generateEliteEncounter(rng: RandomGenerator): Entity[] {
  const eliteIds = getEliteEnemyIds();

  // エリート敵がいない場合は通常敵2体で代用
  if (eliteIds.length === 0) {
    const normalIds = getNormalEnemyIds();
    if (normalIds.length === 0) return [];

    return [
      createEnemy(normalIds[Math.floor(rng() * normalIds.length)], { x: 10, y: 4 }, '0'),
      createEnemy(normalIds[Math.floor(rng() * normalIds.length)], { x: 12, y: 6 }, '1')
    ];
  }

  const enemyId = eliteIds[Math.floor(rng() * eliteIds.length)];
  return [createEnemy(enemyId, { x: 11, y: 5 }, '0')];
}

// ホードエンカウンター: 4-6体の通常敵
function generateHordeEncounter(rng: RandomGenerator): Entity[] {
  const normalIds = getNormalEnemyIds();
  if (normalIds.length === 0) return [];

  const count = 4 + Math.floor(rng() * 3); // 4-6体
  const enemies: Entity[] = [];

  // グリッド上に敵を配置
  const positions = [
    { x: 9, y: 3 },
    { x: 11, y: 3 },
    { x: 13, y: 3 },
    { x: 9, y: 5 },
    { x: 11, y: 5 },
    { x: 13, y: 5 },
    { x: 9, y: 7 },
    { x: 11, y: 7 }
  ];

  for (let i = 0; i < count && i < positions.length; i++) {
    const enemyId = normalIds[Math.floor(rng() * normalIds.length)];
    enemies.push(createEnemy(enemyId, positions[i], String(i)));
  }

  return enemies;
}

// ボスエンカウンター: 1体のボス
function generateBossEncounter(
  bossId: string | null,
  _rng: RandomGenerator
): Entity[] {
  // bossId が指定されていない場合はデフォルトボスを使用
  const boss = createBoss(bossId || 'dragon_lord', { x: 11, y: 5 });
  return [boss];
}
