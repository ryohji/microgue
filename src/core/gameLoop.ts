// ゲームループ: 60fps 制御とゲームの更新・描画

import type { GameState } from '../types/GameState.js';
import type { InputState } from '../types/Input.js';
import type { RandomGenerator } from './random.js';

// ゲームループのオプション
export interface GameLoopOptions {
  readonly targetFPS?: number;
  readonly rng?: RandomGenerator;
}

// ゲームループのコールバック
export interface GameLoopCallbacks {
  getInput: () => InputState;
  update: (state: GameState, input: InputState, deltaTime: number, rng: RandomGenerator) => GameState;
  render: (state: GameState) => readonly string[];
  cleanup?: () => void;
}

// ゲームループを実行
export async function runGameLoop(
  initialState: GameState,
  callbacks: GameLoopCallbacks,
  options: GameLoopOptions = {}
): Promise<void> {
  const targetFPS = options.targetFPS ?? 60;
  const rng = options.rng ?? Math.random;
  const targetFrameTime = 1000 / targetFPS;

  let state = initialState;
  let lastTime = performance.now();

  while (state.running) {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;  // 秒単位
    lastTime = currentTime;

    // 入力取得 (副作用)
    const input = callbacks.getInput();

    // 状態更新 (ピュア関数)
    state = callbacks.update(state, input, deltaTime, rng);

    // 描画用データ生成 (ピュア関数)
    const renderLines = callbacks.render(state);

    // 画面描画 (副作用)
    const { renderScreen } = await import('../rendering/render.js');
    renderScreen(renderLines);

    // フレームレート制御
    const elapsed = performance.now() - currentTime;
    const waitTime = Math.max(0, targetFrameTime - elapsed);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  // クリーンアップ
  if (callbacks.cleanup) {
    callbacks.cleanup();
  }
}
