// ダンジョングラフ生成: 部屋の分岐構造を生成（関数型スタイル）

import type { Room } from '../types/Dungeon.js';
import type { RandomGenerator } from '../core/random.js';
import type { PlayerInventory } from '../types/Items.js';
import { createRoomWithReward, addNextRooms } from './room.js';

// グラフ生成のパラメータ
interface GraphGenerationParams {
  readonly floorNumber: number;    // フロア番号（ID生成用）
  readonly inventory: PlayerInventory; // プレイヤーのインベントリ（報酬生成に使用）
}

// レベルごとの部屋構成
interface LevelLayout {
  readonly level: number;           // レベル番号（1-6）
  readonly roomCount: number;       // このレベルの部屋数
  readonly choicesPerRoom: number[]; // 各部屋の選択肢数（nextRooms数）
}

// グラフ生成結果
export interface RoomGraph {
  readonly rooms: ReadonlyMap<string, Room>;
  readonly startRoomId: string;
  readonly bossRoomId: string;
  readonly restRoomCount: number;
}

// 部屋グラフを生成
export function generateRoomGraph(
  params: GraphGenerationParams,
  rng: RandomGenerator
): RoomGraph {
  // Step 1: レベルごとの部屋数と選択肢数を決定
  const levelLayouts = generateLevelLayouts(rng);

  // Step 2: 部屋を作成し、レベルを割り当て（報酬も生成）
  const { rooms, roomIds, startRoomId, bossRoomId } = createRoomsWithLevels(levelLayouts, params, rng);

  // Step 3: 接続関係を作成
  const connectedRooms = createConnectionsByLayout(rooms, levelLayouts, rng);

  // Step 4: 特殊部屋（難敵、大広間、休憩）を割り当て
  const { updatedRooms, restCount } = assignSpecialRooms(connectedRooms, roomIds, rng);

  return {
    rooms: updatedRooms,
    startRoomId,
    bossRoomId,
    restRoomCount: restCount
  };
}

// レベルごとの部屋数と選択肢数を決定
function generateLevelLayouts(rng: RandomGenerator): readonly LevelLayout[] {
  const layouts: LevelLayout[] = [];

  // レベル1: 開始部屋（1部屋、選択肢2-3）
  const level1Choices = 2 + Math.floor(rng() * 2); // 2-3
  layouts.push({
    level: 1,
    roomCount: 1,
    choicesPerRoom: [level1Choices]
  });

  // レベル2: レベル1の選択肢数と同じ部屋数（各部屋1-3選択肢）
  const level2Count = level1Choices;
  const level2Choices = Array.from({ length: level2Count }, () => 1 + Math.floor(rng() * 3)); // 各1-3
  layouts.push({
    level: 2,
    roomCount: level2Count,
    choicesPerRoom: level2Choices
  });

  // レベル3: level2の最小選択肢数以上、最大6部屋（各部屋1-3選択肢）
  const level2MinChoices = Math.min(...level2Choices);
  const level3Count = Math.min(6, level2MinChoices + Math.floor(rng() * (7 - level2MinChoices))); // min ~ 6
  const level3Choices = Array.from({ length: level3Count }, () => 1 + Math.floor(rng() * 3)); // 各1-3
  layouts.push({
    level: 3,
    roomCount: level3Count,
    choicesPerRoom: level3Choices
  });

  // レベル4: level3の最小選択肢数以上、最大6部屋（各部屋1-3選択肢）
  const level3MinChoices = Math.min(...level3Choices);
  const level4Count = Math.min(6, level3MinChoices + Math.floor(rng() * (7 - level3MinChoices))); // min ~ 6
  const level4Choices = Array.from({ length: level4Count }, () => 1 + Math.floor(rng() * 3)); // 各1-3
  layouts.push({
    level: 4,
    roomCount: level4Count,
    choicesPerRoom: level4Choices
  });

  // レベル5: level4の最小選択肢数以上、最大3部屋（各部屋選択肢必ず1）
  const level4MinChoices = Math.min(...level4Choices);
  const level5Count = Math.min(3, level4MinChoices + Math.floor(rng() * (4 - level4MinChoices))); // min ~ 3
  layouts.push({
    level: 5,
    roomCount: level5Count,
    choicesPerRoom: Array.from({ length: level5Count }, () => 1) // すべて1
  });

  // レベル6: ボス部屋（1部屋、選択肢0）
  layouts.push({
    level: 6,
    roomCount: 1,
    choicesPerRoom: [0]
  });

  return layouts;
}

// レベルレイアウトに基づいて部屋を作成
function createRoomsWithLevels(
  layouts: readonly LevelLayout[],
  { floorNumber, inventory }: GraphGenerationParams,
  rng: RandomGenerator
): {
  rooms: ReadonlyMap<string, Room>;
  roomIds: readonly string[];
  startRoomId: string;
  bossRoomId: string;
} {
  const rooms = new Map<string, Room>();
  const roomIds: string[] = [];

  // 各レベルの部屋を作成（報酬も生成）
  for (const layout of layouts) {
    for (let i = 0; i < layout.roomCount; i++) {
      const roomId = `f${floorNumber}_r${roomIds.length}`;
      const room = createRoomWithReward(roomId, 'normal', layout.level, [], rng, inventory);
      rooms.set(roomId, room);
      roomIds.push(roomId);
    }
  }

  // 最初の部屋がスタート、最後の部屋がボス
  const startRoomId = roomIds[0];
  const bossRoomId = roomIds[roomIds.length - 1];

  // ボス部屋のタイプを設定
  const bossRoom = rooms.get(bossRoomId)!;
  rooms.set(bossRoomId, { ...bossRoom, type: 'boss', enemyCount: 1 });

  return { rooms, roomIds, startRoomId, bossRoomId };
}

// レベルレイアウトに基づいて接続を作成
function createConnectionsByLayout(
  rooms: ReadonlyMap<string, Room>,
  layouts: readonly LevelLayout[],
  rng: RandomGenerator
): ReadonlyMap<string, Room> {
  const updated = new Map(rooms);

  // レベルごとに部屋をグループ化
  const roomsByLevel = new Map<number, string[]>();
  for (const [roomId, room] of rooms.entries()) {
    const existing = roomsByLevel.get(room.depth) || [];
    roomsByLevel.set(room.depth, [...existing, roomId]);
  }

  // 各レベルから次レベルへの接続を作成
  for (let levelIndex = 0; levelIndex < layouts.length - 1; levelIndex++) {
    const currentLayout = layouts[levelIndex];
    const nextLayout = layouts[levelIndex + 1];

    const currentLevel = currentLayout.level;
    const nextLevel = nextLayout.level;

    const currentRooms = roomsByLevel.get(currentLevel)!;
    const nextRooms = roomsByLevel.get(nextLevel)!;

    // 各部屋の選択肢数に基づいて接続を作成
    for (let roomIndex = 0; roomIndex < currentRooms.length; roomIndex++) {
      const roomId = currentRooms[roomIndex];
      const choicesCount = currentLayout.choicesPerRoom[roomIndex];

      // この部屋からの接続先をランダムに選択（重複なし）
      const selectedNextRooms = selectUniqueRooms(nextRooms, choicesCount, rng);

      const room = updated.get(roomId)!;
      updated.set(roomId, addNextRooms(room, selectedNextRooms));
    }
  }

  // 50%の確率でレベルスキップを追加
  if (rng() < 0.5) {
    // レベル4以前のレイアウトで選択肢がふたつ以下の部屋を探す
    const skipCandidates = layouts
      .slice(0, layouts.length - 2)
      .flatMap(layout => {
        const currentLevel = layout.level;
        const currentRooms = roomsByLevel.get(currentLevel)!;
        const skipTargetLevel = currentLevel + 2;

        return layout.choicesPerRoom
          .map((choicesCount, roomIndex) => ({
            roomId: currentRooms[roomIndex],
            targetLevel: skipTargetLevel,
            choicesCount
          }))
          .filter(({ choicesCount }) => choicesCount < 3);
      });

    // 候補から1つ選んでレベルスキップを追加
    const candidate = selectOne(skipCandidates, rng);
    if (candidate) {
      const { roomId, targetLevel } = candidate;
      const targetRoom = selectOne(roomsByLevel.get(targetLevel)!, rng);
      if (targetRoom) {
        const room = updated.get(roomId)!;
        updated.set(roomId, addNextRooms(room, [targetRoom]));
      }
    }
  }

  return updated;
}

// ユニークな部屋をランダムに選択
function selectUniqueRooms(
  availableRooms: readonly string[],
  count: number,
  rng: RandomGenerator
): string[] {
  const shuffled = [...availableRooms].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(count, availableRooms.length));
}

function selectOne<T>(array: readonly T[], rng: RandomGenerator): T | undefined {
  const index = Math.floor(rng() * (array.length));
  return array[index];
}

// 特殊部屋を割り当て（難敵、大広間、休憩）
function assignSpecialRooms(
  rooms: ReadonlyMap<string, Room>,
  roomIds: readonly string[],
  rng: RandomGenerator
): { updatedRooms: ReadonlyMap<string, Room>; restCount: number } {
  const updated = new Map(rooms);

  // スタートとボスを除外した候補
  const candidates = roomIds.slice(1, roomIds.length - 1);

  // 最大4つまでランダムに選択
  const specialCount = Math.min(4, candidates.length);
  const shuffled = [...candidates].sort(() => rng() - 0.5);
  const selected = shuffled.slice(0, specialCount);

  let restCount = 0;

  for (const roomId of selected) {
    const roll = rng();
    let newType: Room['type'];

    // 回復部屋は1つまで
    if (restCount < 1 && roll < 0.3) {
      newType = 'rest';
      restCount++;
    } else if (roll < 0.6) {
      newType = 'elite';
    } else {
      newType = 'horde';
    }

    const room = updated.get(roomId)!;
    updated.set(roomId, { ...room, type: newType, enemyCount: getEnemyCount(newType) });
  }

  return { updatedRooms: updated, restCount };
}

// 部屋タイプに応じた敵の数
function getEnemyCount(type: Room['type']): number {
  switch (type) {
    case 'normal': return 2;
    case 'elite': return 1;
    case 'horde': return 6;
    case 'boss': return 1;
    case 'rest': return 0;
  }
}
