// アンロック定義: マスターデータの読み込みとデフォルト定義

import type { UnlockDefinition } from '../types/MetaProgress.js';
import * as fs from 'fs';
import * as path from 'path';

// アンロック定義ファイルのパス
const UNLOCKS_FILE = 'data/unlocks.json';

// デフォルトのアンロック定義（ファイルが読み込めない場合のフォールバック）
const DEFAULT_UNLOCKS: readonly UnlockDefinition[] = [
  {
    itemId: 'hp_ring',
    itemType: 'treasure',
    condition: { type: 'always' },
    displayName: '体力の指輪',
    description: '初期から使用可能なトレジャー'
  },
  {
    itemId: 'speed_ring',
    itemType: 'treasure',
    condition: { type: 'always' },
    displayName: '俊敏の指輪',
    description: '初期から使用可能なトレジャー'
  },
  {
    itemId: 'iron_sword',
    itemType: 'treasure',
    condition: { type: 'always' },
    displayName: '鉄の剣',
    description: '初期から使用可能なトレジャー'
  },
  {
    itemId: 'first_victory',
    itemType: 'trophy',
    condition: { type: 'firstClear' },
    displayName: '初勝利',
    description: '初めてダンジョンをクリアした証'
  }
];

// アンロック定義を読み込み
export function loadUnlockDefinitions(): readonly UnlockDefinition[] {
  try {
    const filePath = path.join(process.cwd(), UNLOCKS_FILE);

    if (!fs.existsSync(filePath)) {
      console.warn(`Unlock definitions file not found: ${filePath}`);
      console.log('Using default unlock definitions.');
      return DEFAULT_UNLOCKS;
    }

    const json = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(json) as UnlockDefinition[];

    if (!Array.isArray(data)) {
      console.error('Invalid unlock definitions format. Using defaults.');
      return DEFAULT_UNLOCKS;
    }

    return data;
  } catch (error) {
    console.error('Failed to load unlock definitions:', error);
    console.log('Using default unlock definitions.');
    return DEFAULT_UNLOCKS;
  }
}

// 初期アンロック済みアイテムのIDリストを取得
export function getInitialUnlockedIds(): {
  trophies: readonly string[];
  treasures: readonly string[];
} {
  const unlocks = loadUnlockDefinitions();

  const trophies = unlocks
    .filter(u => u.itemType === 'trophy' && u.condition.type === 'always')
    .map(u => u.itemId);

  const treasures = unlocks
    .filter(u => u.itemType === 'treasure' && u.condition.type === 'always')
    .map(u => u.itemId);

  return { trophies, treasures };
}
