// 描画システム: 画面クリアと文字列出力

// ANSI エスケープシーケンス
const CURSOR_HOME = '\x1b[H';      // カーソルを左上(1,1)に移動
const CLEAR_SCREEN = '\x1b[2J';    // 画面全体をクリア
const HIDE_CURSOR = '\x1b[?25l';   // カーソルを非表示
const SHOW_CURSOR = '\x1b[?25h';   // カーソルを表示

// セットアップ済みフラグ
let isSetup = false;

// 画面を描画 (副作用関数)
export function renderScreen(lines: readonly string[], clearScreen = false): void {
  // 初回セットアップ
  if (!isSetup) {
    process.stdout.write(CLEAR_SCREEN + HIDE_CURSOR);
    isSetup = true;
  }

  // 画面クリアが必要な場合
  if (clearScreen) {
    process.stdout.write(CLEAR_SCREEN);
  }

  // 描画
  process.stdout.write(CURSOR_HOME + lines.join('\n'));
}

// クリーンアップ: カーソルを再表示
export function cleanupRenderer(): void {
  process.stdout.write(SHOW_CURSOR);
}
