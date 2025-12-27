// ボス定義の読み込みとボス生成

import type { Enemy } from '../types/Entity.js';
import type { Position } from '../types/GameState.js';
import type { Treasure } from '../types/Items.js';
import * as fs from 'fs';
import * as path from 'path';

// ボス定義（JSONファイルの構造）
interface BossDefinition {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly stats: {
    readonly maxHp: number;
    readonly attack: number;
    readonly defense: number;
    readonly speed: number;
  };
  readonly equippedRelics: readonly Treasure[];
}

// ボス定義ファイルのパス
const BOSSES_FILE = 'data/bosses.json';

// デフォルトのボス定義（ファイルが読み込めない場合のフォールバック）
const DEFAULT_BOSSES: readonly BossDefinition[] = [
  {
    id: 'dragon_lord',
    name: 'Dragon Lord',
    symbol: 'D',
    stats: {
      maxHp: 150,
      attack: 25,
      defense: 10,
      speed: 8
    },
    equippedRelics: [
      {
        id: 'dragon_scale_armor',
        name: 'Dragon Scale Armor',
        type: 'majorRelic',
        rarity: 'epic',
        description: 'Ancient dragon scales providing massive defense',
        effects: [
          { type: 'damageReduction', value: 5 },
          { type: 'maxHpBoost', value: 50 }
        ]
      }
    ]
  }
];

// ボス定義を読み込み
export function loadBossDefinitions(): readonly BossDefinition[] {
  try {
    const filePath = path.join(process.cwd(), BOSSES_FILE);

    if (!fs.existsSync(filePath)) {
      console.warn(`Boss definitions file not found: ${filePath}`);
      console.log('Using default boss definitions.');
      return DEFAULT_BOSSES;
    }

    const json = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(json) as BossDefinition[];

    if (!Array.isArray(data)) {
      console.error('Invalid boss definitions format. Using defaults.');
      return DEFAULT_BOSSES;
    }

    return data;
  } catch (error) {
    console.error('Failed to load boss definitions:', error);
    console.log('Using default boss definitions.');
    return DEFAULT_BOSSES;
  }
}

// ボス定義からボスエンティティを生成
export function createBoss(bossId: string, pos: Position): Enemy {
  const bossDefs = loadBossDefinitions();
  const bossDef = bossDefs.find(b => b.id === bossId);

  if (!bossDef) {
    console.warn(`Boss definition not found: ${bossId}. Using first available boss.`);
    const fallbackBoss = bossDefs[0] || DEFAULT_BOSSES[0];
    return createBossFromDefinition(fallbackBoss, pos);
  }

  return createBossFromDefinition(bossDef, pos);
}

// ボス定義からエンティティを作成（内部関数）
function createBossFromDefinition(bossDef: BossDefinition, pos: Position): Enemy {
  return {
    id: bossDef.id,
    type: 'enemy',
    symbol: bossDef.symbol,
    pos,
    hp: bossDef.stats.maxHp,
    stats: bossDef.stats,
    aiType: 'boss',
    isBoss: true,
    equippedRelics: bossDef.equippedRelics
  };
}

// 利用可能なボスIDのリストを取得
export function getAvailableBossIds(): readonly string[] {
  const bossDefs = loadBossDefinitions();
  return bossDefs.map(b => b.id);
}

// ランダムなボスを生成
export function createRandomBoss(pos: Position, rng: () => number = Math.random): Enemy {
  const bossIds = getAvailableBossIds();
  const randomIndex = Math.floor(rng() * bossIds.length);
  const randomBossId = bossIds[randomIndex];
  return createBoss(randomBossId, pos);
}
