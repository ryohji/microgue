// 通常敵・エリート敵の読み込みと生成

import * as fs from 'fs';
import * as path from 'path';
import type { Enemy } from '../types/Entity.js';
import type { Position } from '../types/GameState.js';
import type { Treasure } from '../types/Items.js';

interface EnemyDefinition {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly stats: {
    readonly maxHp: number;
    readonly attack: number;
    readonly defense: number;
    readonly speed: number;
  };
  readonly aiType: 'melee' | 'boss';
  readonly equippedRelics?: readonly Treasure[];
}

// デフォルトの敵定義（JSON が読み込めない場合のフォールバック）
const DEFAULT_ENEMIES: readonly EnemyDefinition[] = [
  {
    id: 'goblin',
    name: 'Goblin',
    symbol: 'g',
    stats: { maxHp: 30, attack: 6, defense: 2, speed: 90 },
    aiType: 'melee'
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    symbol: 's',
    stats: { maxHp: 35, attack: 7, defense: 3, speed: 85 },
    aiType: 'melee'
  }
];

// 敵定義を読み込む
export function loadEnemyDefinitions(): readonly EnemyDefinition[] {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'enemies.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(data) as EnemyDefinition[];
  } catch (error) {
    console.warn('Failed to load enemies.json, using default enemies');
    return DEFAULT_ENEMIES;
  }
}

// 定義から Enemy を生成
function createEnemyFromDefinition(def: EnemyDefinition, pos: Position, idSuffix: string): Enemy {
  return {
    id: `${def.id}_${idSuffix}`,
    type: 'enemy',
    symbol: def.symbol,
    pos,
    hp: def.stats.maxHp,
    stats: def.stats,
    aiType: def.aiType,
    equippedRelics: def.equippedRelics
  };
}

// ID で敵を生成
export function createEnemy(enemyId: string, pos: Position, idSuffix: string = '0'): Enemy {
  const enemyDefs = loadEnemyDefinitions();
  const enemyDef = enemyDefs.find(e => e.id === enemyId);

  if (!enemyDef) {
    // フォールバック: 最初の敵定義を使用
    const fallbackEnemy = enemyDefs[0] || DEFAULT_ENEMIES[0];
    return createEnemyFromDefinition(fallbackEnemy, pos, idSuffix);
  }

  return createEnemyFromDefinition(enemyDef, pos, idSuffix);
}

// 利用可能な敵 ID の一覧を取得
export function getAvailableEnemyIds(): readonly string[] {
  const enemyDefs = loadEnemyDefinitions();
  return enemyDefs.map(e => e.id);
}

// 通常部屋用の敵 ID を取得（elite_ で始まらないもの）
export function getNormalEnemyIds(): readonly string[] {
  return getAvailableEnemyIds().filter(id => !id.startsWith('elite_'));
}

// エリート部屋用の敵 ID を取得（elite_ で始まるもの）
export function getEliteEnemyIds(): readonly string[] {
  return getAvailableEnemyIds().filter(id => id.startsWith('elite_'));
}
