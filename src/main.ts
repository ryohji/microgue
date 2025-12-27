// Phase 6: ボス戦デモ - レリック装備ボスとの戦闘

import { runGameLoop } from './core/gameLoop.js';
import type { AppState } from './core/gameLoop.js';
import { createInputSystem } from './input/inputSystem.js';
import type { InputState } from './types/Input.js';
import type { RandomGenerator } from './core/random.js';
import type { CombatState } from './types/CombatState.js';
import type { Treasure } from './types/Items.js';
import { createGrid } from './combat/grid.js';
import { createPlayer } from './combat/entity.js';
import { createBoss, getAvailableBossIds } from './combat/bosses.js';
import { initializeTimeline, accumulateTimeline, getNextActor } from './combat/timeline.js';
import { executeAction } from './combat/combat.js';
import { decideAction } from './combat/ai.js';
import { renderCombat } from './rendering/formatters.js';

// プレイヤー用の初期トレジャー（ボスに対抗できる程度の装備）
const PLAYER_STARTING_RELICS: readonly Treasure[] = [
  {
    id: 'hero_sword',
    name: 'Hero Sword',
    type: 'majorRelic',
    rarity: 'rare',
    description: 'A legendary sword for brave heroes',
    effects: [
      { type: 'bonusDamage', value: 15 },
      { type: 'critical', value: 20 }
    ]
  },
  {
    id: 'hero_armor',
    name: 'Hero Armor',
    type: 'majorRelic',
    rarity: 'rare',
    description: 'Sturdy armor that protects the hero',
    effects: [
      { type: 'maxHpBoost', value: 50 },
      { type: 'damageReduction', value: 3 }
    ]
  },
  {
    id: 'swift_boots',
    name: 'Swift Boots',
    type: 'majorRelic',
    rarity: 'common',
    description: 'Boots that enhance speed',
    effects: [
      { type: 'speedBoost', value: 20 }
    ]
  }
];

interface BossDemoState extends AppState {
  readonly combat: CombatState;
  readonly message: string;
  readonly selectedBossIndex: number;
  readonly bossSelectionMode: boolean;
}

function initBossCombat(bossId: string): CombatState {
  const grid = createGrid(12, 8);
  const basePlayer = createPlayer({ x: 2, y: 4 });

  // プレイヤーにトレジャーを装備
  const player = { ...basePlayer, equippedRelics: PLAYER_STARTING_RELICS };

  const boss = createBoss(bossId, { x: 9, y: 4 });
  return { grid, entities: [player, boss], timeline: initializeTimeline([player, boss]), currentTurn: null };
}

function updateGame(state: BossDemoState, input: InputState, deltaTime: number, rng: RandomGenerator): BossDemoState {
  // Q キー押下で即座に終了
  if (input.queue.length > 0) {
    const key = input.queue[0].key.name;
    if (key === 'q') {
      return { ...state, running: false };
    }
  }

  if (input.queue.length === 0) {
    if (!state.bossSelectionMode) {
      const timeline = accumulateTimeline(state.combat.timeline, state.combat.entities, deltaTime);
      const nextActor = getNextActor(timeline);
      return { ...state, combat: { ...state.combat, timeline, currentTurn: nextActor } };
    }
    return state;
  }

  const key = input.queue[0].key.name;
  const bossIds = getAvailableBossIds();

  if (state.bossSelectionMode) {
    if (key === 'up') return { ...state, selectedBossIndex: Math.max(0, state.selectedBossIndex - 1) };
    if (key === 'down') return { ...state, selectedBossIndex: Math.min(bossIds.length - 1, state.selectedBossIndex + 1) };
    if (key === 'return') return { ...state, combat: initBossCombat(bossIds[state.selectedBossIndex]), bossSelectionMode: false, clearScreen: true, message: 'Fight!' };
    return state;
  }

  let combat = state.combat;
  let msg = state.message;

  const hasPlayer = combat.entities.some(e => e.id === 'player');
  const hasBoss = combat.entities.some(e => e.id !== 'player');

  if (!hasPlayer || !hasBoss) {
    msg = hasPlayer ? 'VICTORY! Press R to restart' : 'DEFEAT! Press R to restart';
    if (key === 'r') return { ...state, bossSelectionMode: true, clearScreen: true };
    return { ...state, message: msg };
  }

  const timeline = accumulateTimeline(combat.timeline, combat.entities, deltaTime);
  const nextActor = getNextActor(timeline);
  combat = { ...combat, timeline, currentTurn: nextActor };

  if (nextActor === 'player') {
    const player = combat.entities.find(e => e.id === 'player')!;
    const boss = combat.entities.find(e => e.id !== 'player')!;
    let action = null;

    if (key === 'up') action = { type: 'move' as const, targetPos: { x: player.pos.x, y: player.pos.y - 1 }, apCost: 100 };
    if (key === 'down') action = { type: 'move' as const, targetPos: { x: player.pos.x, y: player.pos.y + 1 }, apCost: 100 };
    if (key === 'left') action = { type: 'move' as const, targetPos: { x: player.pos.x - 1, y: player.pos.y }, apCost: 100 };
    if (key === 'right') action = { type: 'move' as const, targetPos: { x: player.pos.x + 1, y: player.pos.y }, apCost: 100 };
    if (key === 'space') action = { type: 'attack' as const, targetPos: boss.pos, apCost: 100 };
    if (key === 'z') action = { type: 'wait' as const, apCost: 100 };

    if (action) {
      combat = executeAction(combat, 'player', action, rng);
      msg = 'Player acts';
    }
  } else if (nextActor) {
    const action = decideAction(combat, nextActor, rng);
    if (action) {
      combat = executeAction(combat, nextActor, action, rng);
      msg = 'Boss acts';
    }
  }

  return { ...state, combat, message: msg };
}

function renderGame(state: BossDemoState): readonly string[] {
  if (state.bossSelectionMode) {
    const bossIds = getAvailableBossIds();
    return [
      '=== Boss Battle Demo ===',
      '',
      ...bossIds.map((id, i) => (i === state.selectedBossIndex ? '> ' : '  ') + id),
      '',
      'Up/Down: select, Enter: confirm, Q: quit'
    ];
  }

  const player = state.combat.entities.find(e => e.id === 'player');
  const boss = state.combat.entities.find(e => e.id !== 'player');
  const playerRelics = player?.equippedRelics || [];
  const bossRelics = boss?.equippedRelics || [];

  return [
    ...renderCombat(state.combat),
    '',
    state.message,
    '',
    'Player Equipment:',
    ...playerRelics.map(r => `  ${r.name} [${r.rarity}]`),
    '',
    'Boss Equipment:',
    ...bossRelics.map(r => `  ${r.name} [${r.rarity}]`),
    '',
    'Controls: Arrow keys to move, Space to attack, Z to wait, Q to quit'
  ];
}

async function main() {
  const inputSystem = createInputSystem();
  const bossIds = getAvailableBossIds();
  const state: BossDemoState = {
    running: true,
    clearScreen: true,
    combat: initBossCombat(bossIds[0]),
    message: 'Select boss',
    selectedBossIndex: 0,
    bossSelectionMode: true
  };

  await runGameLoop(state, {
    getInput: () => inputSystem.getState(),
    update: updateGame,
    render: renderGame,
    cleanup: () => inputSystem.cleanup()
  });

  // ゲーム終了
  console.log('\nGame ended.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
