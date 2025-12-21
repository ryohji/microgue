// 描画システム: 画面クリアと文字列出力

// 画面をクリアして文字列配列を描画 (副作用関数)
export function renderScreen(lines: readonly string[]): void {
  // ANSI エスケープシーケンスでカーソルを左上に移動して画面クリア
  console.clear();

  // 各行を出力
  for (const line of lines) {
    console.log(line);
  }
}
