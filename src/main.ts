// Phase 1 動作確認デモ: 矢印キーでカーソル移動

import { createInputSystem } from './input/inputSystem.js';
import { runGameLoop } from './core/gameLoop.js';
import { cleanupRenderer } from './rendering/render.js';
import type { GameState, Position } from './types/GameState.js';
import type { InputState } from './types/Input.js';
import type { RandomGenerator } from './core/random.js';

// 初期状態
const initialState: GameState = {
  cursorPos: { x: 10, y: 10 },
  running: true
};

// エントリーポイント
main();

// メイン実行
async function main(): Promise<void> {
  let exitCode = 0;
  const { getState, cleanup } = createInputSystem();

  try {
    const callbacks = { getInput: getState, update, render };
    await runGameLoop(initialState, callbacks);
    console.log('\nGame ended. Thank you for playing!');
  } catch (error) {
    exitCode = 1;
    console.error('Error:', error);
  } finally {
    cleanup();
    cleanupRenderer();
  }

  process.exit(exitCode);
}

// ゲーム状態更新 (ピュア関数)
function update(
  state: GameState,
  input: InputState,
  _deltaTime: number,
  _rng: RandomGenerator
): GameState {
  let newState = state;

  // キー入力を処理
  for (const keyPress of input.queue) {
    // 終了キー
    if (keyPress.key.name === 'q' || (keyPress.key.ctrl && keyPress.key.name === 'c')) {
      newState = { ...newState, running: false };
      continue;
    }

    // 矢印キーでカーソル移動
    switch (keyPress.key.name) {
      case 'up':
        newState = { ...newState, cursorPos: moveCursor(newState.cursorPos, 0, -1) };
        break;
      case 'down':
        newState = { ...newState, cursorPos: moveCursor(newState.cursorPos, 0, 1) };
        break;
      case 'left':
        newState = { ...newState, cursorPos: moveCursor(newState.cursorPos, -1, 0) };
        break;
      case 'right':
        newState = { ...newState, cursorPos: moveCursor(newState.cursorPos, 1, 0) };
        break;
    }
  }

  return newState;
}

// 描画用データ生成 (ピュア関数)
function render(state: GameState): readonly string[] {
  const lines: string[] = [];

  lines.push('='.repeat(40));
  lines.push('Phase 1 Demo: Cursor Movement');
  lines.push('='.repeat(40));
  lines.push('');
  lines.push('Use arrow keys to move the cursor');
  lines.push('Press \'q\' to quit');
  lines.push('');

  // 20x20 グリッド描画
  for (let y = 0; y < 20; y++) {
    let line = '';
    for (let x = 0; x < 20; x++) {
      if (x === state.cursorPos.x && y === state.cursorPos.y) {
        line += '@';  // カーソル
      } else {
        line += '.';
      }
    }
    lines.push(line);
  }

  lines.push('');
  lines.push(`Cursor: (${state.cursorPos.x}, ${state.cursorPos.y})`);

  return lines;
}

// カーソル移動処理 (ピュア関数)
function moveCursor(pos: Position, dx: number, dy: number): Position {
  return {
    x: Math.max(0, Math.min(19, pos.x + dx)),
    y: Math.max(0, Math.min(19, pos.y + dy))
  };
}
