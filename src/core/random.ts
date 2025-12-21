// 乱数生成の型定義とヘルパー関数

// 乱数生成器の型 ([0, 1) の範囲の数値を返す)
export type RandomGenerator = () => number;

// サイコロを振る
export function rollDice(rng: RandomGenerator, sides: number): number {
  return Math.floor(rng() * sides) + 1;
}

// 配列からランダムに要素を選択
export function pickRandom<T>(rng: RandomGenerator, items: readonly T[]): T {
  const index = Math.floor(rng() * items.length);
  return items[index];
}

// min から max の範囲の整数をランダムに返す (min, max を含む)
export function randomInt(rng: RandomGenerator, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// min から max の範囲の実数をランダムに返す
export function randomFloat(rng: RandomGenerator, min: number, max: number): number {
  return rng() * (max - min) + min;
}
