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

  lines.push('');

  // 現在のターン
  if (state.currentTurn) {
    const actor = state.entities.find(e => e.id === state.currentTurn);
    if (actor) {
      lines.push(`>>> ${actor.id}'s turn <<<`);
    }
  }

  lines.push('');
  lines.push('Controls: Arrow keys to move, Space to attack, W to wait, Q to quit');

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
  const lines: string[] = [];
  const floor = dungeon.floors[dungeon.currentFloor];

  lines.push('='.repeat(50));
  lines.push(`Floor ${floor.floorNumber} - Choose Your Path`);
  lines.push('='.repeat(50));
  lines.push('');

  // 選択可能な部屋をリスト表示
  lines.push('Available Rooms:');
  lines.push('');

  availableRooms.forEach((room, index) => {
    const number = String(index + 1).padStart(2);
    const typeSymbol = getRoomTypeSymbol(room.type);
    const typeName = getRoomTypeName(room.type);
    const enemyInfo = room.enemyCount !== undefined && room.enemyCount > 0
      ? ` (${room.enemyCount} enemies)`
      : '';

    lines.push(`  [${number}] ${typeSymbol} ${typeName}${enemyInfo}`);
  });

  lines.push('');
  lines.push('Controls: 1-9 to select room, Q to quit');

  return lines;
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
