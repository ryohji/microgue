// 描画フォーマッター: ゲーム状態を文字列配列に変換

import type { CombatState } from '../types/CombatState.js';
import type { Entity } from '../types/Entity.js';
import type { Dungeon, Room } from '../types/Dungeon.js';

// 戦闘画面を描画
export function renderCombat(state: CombatState): readonly string[] {
  const lines: string[] = [];

  lines.push('='.repeat(50));
  lines.push('Combat Demo - Timeline + AP System');
  lines.push('='.repeat(50));
  lines.push('');

  // グリッド描画
  for (let y = 0; y < state.grid.height; y++) {
    let line = '';
    for (let x = 0; x < state.grid.width; x++) {
      const entity = state.entities.find(e => e.pos.x === x && e.pos.y === y);
      line += entity ? entity.symbol : '.';
    }
    lines.push(line);
  }

  lines.push('');

  // エンティティ情報
  lines.push('Entities:');
  for (const entity of state.entities) {
    const hpBar = renderHPBar(entity);
    const hp = String(entity.hp).padStart(3);
    const maxHp = String(entity.stats.maxHp).padStart(3);
    lines.push(`${entity.symbol} ${entity.id.padEnd(8)}: ${hpBar} ${hp}/${maxHp}`);
  }

  lines.push('');

  // タイムラインゲージ
  lines.push('Timeline:');
  for (const entity of state.entities) {
    const gauge = state.timeline.get(entity.id) ?? 0;
    const bar = renderGaugeBar(gauge);
    const gaugeStr = String(Math.floor(gauge)).padStart(3);
    const canAct = gauge >= 100 ? ' [READY]' : '        ';
    lines.push(`${entity.symbol} ${entity.id.padEnd(8)}: ${bar} ${gaugeStr}${canAct}`);
  }

  return lines;
}

// HPバーを描画
function renderHPBar(entity: Entity): string {
  const ratio = entity.hp / entity.stats.maxHp;
  const barLength = 10;
  const filled = Math.ceil(ratio * barLength);
  return '[' + '='.repeat(filled) + ' '.repeat(barLength - filled) + ']';
}

// ゲージバーを描画
function renderGaugeBar(gauge: number): string {
  const barLength = 20;
  const filled = Math.min(barLength, Math.floor(gauge / 5));
  return '[' + '='.repeat(filled) + ' '.repeat(barLength - filled) + ']';
}

// ダンジョンナビゲーション画面を描画
export function renderDungeonNav(dungeon: Dungeon, availableRooms: readonly Room[]): readonly string[] {
  if (!dungeon.currentFloor) {
    return ['No current floor'];
  }

  const floor = dungeon.currentFloor;

  const header = [
    '='.repeat(70),
    `Floor ${floor.floorNumber + 1} - Choose Your Path`,
    '='.repeat(70),
    '',
    'Available Rooms:',
    ''
  ];

  const roomLines = availableRooms.flatMap((room, index) => {
    const number = String(index + 1).padStart(2);
    const typeSymbol = getRoomTypeSymbol(room.type);
    const typeName = getRoomTypeName(room.type);
    const enemyInfo = room.enemyCount !== undefined && room.enemyCount > 0
      ? ` (${room.enemyCount} enemies)`
      : '';

    const treasure = room.reward.treasure;
    const rewardLine = `    Reward: ${getRaritySymbol(treasure.rarity)} ${treasure.name}`;

    return [
      `  [${number}] ${typeSymbol} ${typeName}${enemyInfo}`,
      rewardLine
    ];
  });

  const footer = [
    '',
    'Controls: 1-9 to select room, Q to quit'
  ];

  return [...header, ...roomLines, ...footer];
}

// 部屋タイプのシンボル
function getRoomTypeSymbol(type: Room['type']): string {
  switch (type) {
    case 'normal': return '⚔';
    case 'elite': return '☠';
    case 'horde': return '⚡';
    case 'boss': return '👑';
    case 'rest': return '💚';
  }
}

// 部屋タイプの名前
function getRoomTypeName(type: Room['type']): string {
  switch (type) {
    case 'normal': return 'Normal Combat';
    case 'elite': return 'Elite Enemy';
    case 'horde': return 'Horde Battle';
    case 'boss': return 'Boss Room';
    case 'rest': return 'Rest Site';
  }
}

// 報酬情報の描画（部屋選択時に表示）
export function renderRewardInfo(room: Room): readonly string[] {
  const treasure = room.reward.treasure;

  const header = [
    '',
    'Reward:',
    `  ${getRaritySymbol(treasure.rarity)} ${treasure.name} [${treasure.rarity.toUpperCase()}]`,
    `  ${treasure.description}`,
    '  Effects:'
  ];

  if (treasure.effects.length === 0) {
    return [...header, '    • none'];
  } else {
    const effectLines = treasure.effects.values()
      .map(effect => `    • ${formatEffect(effect)}`)
      .toArray();
    return [...header, ...effectLines];
  }
}

// レアリティのシンボル
function getRaritySymbol(rarity: string): string {
  switch (rarity) {
    case 'common': return '◇';
    case 'rare': return '◆';
    case 'epic': return '★';
    default: return '○';
  }
}

// 効果のフォーマット
function formatEffect(effect: { readonly type: string; readonly value: number; readonly level?: number }): string {
  const levelStr = effect.level ? ` (Lv.${effect.level})` : '';
  const valueStr = effect.value > 0 ? `+${effect.value}` : `${effect.value}`;

  switch (effect.type) {
    case 'maxHpBoost': return `Max HP ${valueStr}${levelStr}`;
    case 'barrier': return `Barrier ${valueStr}${levelStr}`;
    case 'speedBoost': return `Speed ${valueStr}${levelStr}`;
    case 'evasionBoost': return `Evasion ${valueStr}%${levelStr}`;
    case 'accuracyBoost': return `Accuracy ${valueStr}%${levelStr}`;
    case 'bonusDamage': return `Bonus Damage ${valueStr}${levelStr}`;
    case 'critical': return `Critical Chance ${valueStr}%${levelStr}`;
    case 'areaAttack': return `Area Attack${levelStr}`;
    case 'dotDamage': return `DoT Damage ${valueStr}${levelStr}`;
    case 'lifesteal': return `Lifesteal ${valueStr}%${levelStr}`;
    case 'damageReduction': return `Damage Reduction ${valueStr}${levelStr}`;
    case 'attackDown': return `Enemy Attack -${valueStr}%${levelStr}`;
    case 'speedDown': return `Enemy Speed -${valueStr}%${levelStr}`;
    default: return `${effect.type}: ${valueStr}${levelStr}`;
  }
}

// メタ進行データの描画
export function renderMetaProgress(
  stats: { totalRuns: number; totalClears: number; maxFloorReached: number },
  unlockedTrophiesCount: number,
  unlockedTreasuresCount: number
): readonly string[] {
  return [
    '',
    '='.repeat(70),
    'Meta Progress',
    '='.repeat(70),
    '',
    'Game Statistics:',
    `  Total Runs: ${stats.totalRuns}`,
    `  Total Clears: ${stats.totalClears}`,
    `  Max Floor Reached: ${stats.maxFloorReached}`,
    '',
    'Unlocked Items:',
    `  Trophies: ${unlockedTrophiesCount}`,
    `  Treasures: ${unlockedTreasuresCount}`,
    ''
  ];
}
