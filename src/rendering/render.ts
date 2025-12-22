// 描画システム: 画面クリアと文字列出力

// ANSI エスケープシーケンス
const CURSOR_HOME = '\x1b[H';      // カーソルを左上(1,1)に移動
const CLEAR_SCREEN = '\x1b[2J';    // 画面全体をクリア
const HIDE_CURSOR = '\x1b[?25l';   // カーソルを非表示
const SHOW_CURSOR = '\x1b[?25h';   // カーソルを表示

// 画面を上書きして文字列配列を描画 (副作用関数)
export function renderScreen(lines: readonly string[]): void {
  render(lines);
}

let render = (lines: readonly string[]): void => {
  render = write; // 次回以降 setupRenderer をスキップ
  setupRenderer();
  write(lines);
}

function write(lines: readonly string[]) {
  process.stdout.write(CURSOR_HOME + lines.join('\n'));
}

function setupRenderer() {
  process.stdout.write(CLEAR_SCREEN + HIDE_CURSOR);
}

// クリーンアップ: カーソルを再表示
export function cleanupRenderer(): void {
  process.stdout.write(SHOW_CURSOR);
}
