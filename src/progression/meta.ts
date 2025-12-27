// メタプログレッションシステム: アンロック管理とメタ進行データ操作

import type {
  MetaProgress,
  GameStats,
  TrophyUnlock,
  TreasureUnlock,
  UnlockCondition,
  UnlockDefinition
} from '../types/MetaProgress.js';

// 空のゲーム統計を生成
function createEmptyStats(): GameStats {
  return {
    totalRuns: 0,
    totalClears: 0,
    maxFloorReached: 0,
    bossesKilled: [],
    treasuresCollected: []
  };
}

// 初期メタ進行データを生成
export function createInitialMetaProgress(): MetaProgress {
  return {
    version: 1,
    stats: createEmptyStats(),
    unlockedTrophies: [],
    unlockedTreasures: [],
    lastPlayedAt: new Date().toISOString()
  };
}

// アンロック条件をチェック
export function checkUnlockCondition(
  condition: UnlockCondition,
  stats: GameStats
): boolean {
  switch (condition.type) {
    case 'always':
      return true;

    case 'firstClear':
      return stats.totalClears >= 1;

    case 'bossKill':
      if (typeof condition.value === 'string') {
        return stats.bossesKilled.includes(condition.value);
      } else {
        return false;
      }

    case 'clearCount':
      if (typeof condition.value === 'number') {
        return stats.totalClears >= condition.value;
      } else {
        return false;
      }

    case 'floorReached':
      if (typeof condition.value === 'number') {
        return stats.maxFloorReached >= condition.value;
      } else {
        return false;
      }

    case 'treasureCollected':
      if (typeof condition.value === 'string') {
        return stats.treasuresCollected.includes(condition.value);
      } else {
        return false;
      }

    default:
      return false;
  }
}

// トロフィーをアンロック
export function unlockTrophy(
  meta: MetaProgress,
  trophyId: string
): MetaProgress {
  // 既にアンロック済みの場合は変更なし
  if (meta.unlockedTrophies.some(t => t.trophyId === trophyId)) {
    return meta;
  } else {
    const newUnlock: TrophyUnlock = {
      trophyId,
      unlocked: true,
      unlockedAt: new Date().toISOString()
    };

    return {
      ...meta,
      unlockedTrophies: [...meta.unlockedTrophies, newUnlock]
    };
  }
}

// トレジャーをアンロック
export function unlockTreasure(
  meta: MetaProgress,
  treasureId: string
): MetaProgress {
  // 既にアンロック済みの場合は変更なし
  if (meta.unlockedTreasures.some(t => t.treasureId === treasureId)) {
    return meta;
  } else {
    const newUnlock: TreasureUnlock = {
      treasureId,
      unlocked: true,
      unlockedAt: new Date().toISOString()
    };

    return {
      ...meta,
      unlockedTreasures: [...meta.unlockedTreasures, newUnlock]
    };
  }
}

// アンロック定義リストを処理して、条件を満たすアイテムをアンロック
export function processUnlocks(
  meta: MetaProgress,
  unlockDefs: readonly UnlockDefinition[]
): MetaProgress {
  let updatedMeta = meta;

  for (const def of unlockDefs) {
    if (checkUnlockCondition(def.condition, meta.stats)) {
      if (def.itemType === 'trophy') {
        updatedMeta = unlockTrophy(updatedMeta, def.itemId);
      } else if (def.itemType === 'treasure') {
        updatedMeta = unlockTreasure(updatedMeta, def.itemId);
      }
    }
  }

  return updatedMeta;
}

// ゲーム統計を更新：プレイ開始
export function recordRunStart(meta: MetaProgress): MetaProgress {
  return {
    ...meta,
    stats: {
      ...meta.stats,
      totalRuns: meta.stats.totalRuns + 1
    },
    lastPlayedAt: new Date().toISOString()
  };
}

// ゲーム統計を更新：クリア
export function recordClear(meta: MetaProgress, floorReached: number): MetaProgress {
  return {
    ...meta,
    stats: {
      ...meta.stats,
      totalClears: meta.stats.totalClears + 1,
      maxFloorReached: Math.max(meta.stats.maxFloorReached, floorReached)
    }
  };
}

// ゲーム統計を更新：ボス撃破
export function recordBossKill(meta: MetaProgress, bossId: string): MetaProgress {
  if (meta.stats.bossesKilled.includes(bossId)) {
    return meta;
  } else {
    return {
      ...meta,
      stats: {
        ...meta.stats,
        bossesKilled: [...meta.stats.bossesKilled, bossId]
      }
    };
  }
}

// ゲーム統計を更新：トレジャー獲得
export function recordTreasureCollected(meta: MetaProgress, treasureId: string): MetaProgress {
  return {
    ...meta,
    stats: {
      ...meta.stats,
      treasuresCollected: [...meta.stats.treasuresCollected, treasureId]
    }
  };
}

// トロフィーがアンロック済みかチェック
export function isTrophyUnlocked(meta: MetaProgress, trophyId: string): boolean {
  return meta.unlockedTrophies.some(t => t.trophyId === trophyId && t.unlocked);
}

// トレジャーがアンロック済みかチェック
export function isTreasureUnlocked(meta: MetaProgress, treasureId: string): boolean {
  return meta.unlockedTreasures.some(t => t.treasureId === treasureId && t.unlocked);
}
