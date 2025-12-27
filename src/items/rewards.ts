// 報酬システム: 部屋への報酬割り当てとインベントリ管理

import type { Reward, PlayerInventory } from '../types/Items.js';
import type { RandomGenerator } from '../core/random.js';
import { generateTreasure } from './treasure.js';

// 部屋の報酬を生成
export function generateRoomReward(
  rng: RandomGenerator,
  inventory: PlayerInventory
): Reward {
  return { treasure: generateTreasure(rng, inventory) };
}

// 報酬をインベントリに追加
export function addRewardToInventory(
  inventory: PlayerInventory,
  reward: Reward
): PlayerInventory {
  return {
    ...inventory,
    treasures: [...inventory.treasures, reward.treasure]
  };
}

// 空のインベントリを作成
export function createEmptyInventory(): PlayerInventory {
  return {
    treasures: []
  };
}