// 入力システム: 非同期キーボード入力の収集とキューイング

import * as readline from 'readline';
import type { InputState, KeyPress } from '../types/Input.js';

export interface InputSystem {
  getState: () => InputState;
  cleanup: () => void;
}

export function createInputSystem(): InputSystem {
  const queue: KeyPress[] = [];

  // readline でキープレスイベントを有効化
  readline.emitKeypressEvents(process.stdin);

  // raw mode を有効にして、キー入力をバッファリングせずに取得
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  // キープレスハンドラ
  const handler = (str: string, key: any) => {
    queue.push({
      str,
      key: {
        name: key?.name,
        ctrl: key?.ctrl,
        shift: key?.shift,
        meta: key?.meta
      }
    });
  };

  process.stdin.on('keypress', handler);

  return {
    // 現在のキューを取得して、キューをクリア
    getState: (): InputState => {
      const currentQueue = [...queue];
      queue.length = 0;  // キューをクリア
      return { queue: currentQueue };
    },

    // クリーンアップ
    cleanup: () => {
      process.stdin.removeListener('keypress', handler);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
    }
  };
}
