// グリッドシステム: グリッド操作と経路探索

import type { Grid } from '../types/CombatState.js';
import type { Position } from '../types/GameState.js';

// グリッドを生成
export function createGrid(width: number, height: number): Grid {
  return { width, height };
}

// 位置がグリッド内にあるかチェック
export function isValidPosition(grid: Grid, pos: Position): boolean {
  return pos.x >= 0 && pos.x < grid.width && pos.y >= 0 && pos.y < grid.height;
}

// マンハッタン距離を計算
export function getDistance(from: Position, to: Position): number {
  return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
}

// 隣接する 4 方向の位置を取得
export function getAdjacentPositions(grid: Grid, { x, y }: Position): readonly Position[] {
  const directions = [
    { dx: 0, dy: -1 },  // 上
    { dx: 0, dy: 1 },   // 下
    { dx: -1, dy: 0 },  // 左
    { dx: 1, dy: 0 }    // 右
  ];

  return directions
    .map(({ dx, dy }) => ({ x: x + dx, y: y + dy }))
    .filter(p => isValidPosition(grid, p));
}

// 簡易パス探索（A*アルゴリズム）
// Phase 2 では障害物なしの単純な実装
export function findPath(
  grid: Grid,
  start: Position,
  goal: Position
): readonly Position[] {
  if (!isValidPosition(grid, start) || !isValidPosition(grid, goal)) {
    return [];
  }

  if (start.x === goal.x && start.y === goal.y) {
    return [start];
  }

  // A*実装
  const openSet = new Set<string>();
  const cameFrom = new Map<string, Position>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const posKey = (p: Position) => `${p.x},${p.y}`;
  const startKey = posKey(start);

  openSet.add(startKey);
  gScore.set(startKey, 0);
  fScore.set(startKey, getDistance(start, goal));

  while (openSet.size > 0) {
    // fScoreが最小のノードを選択
    let currentKey = Array.from(openSet).reduce((min, key) =>
      (fScore.get(key) ?? Infinity) < (fScore.get(min) ?? Infinity) ? key : min
    );

    const [x, y] = currentKey.split(',').map(Number);
    const current = { x, y };

    if (current.x === goal.x && current.y === goal.y) {
      // パスを再構築
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(currentKey);

    for (const neighbor of getAdjacentPositions(grid, current)) {
      const neighborKey = posKey(neighbor);
      const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + 1;

      if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + getDistance(neighbor, goal));
        openSet.add(neighborKey);
      }
    }
  }

  return [];  // パスが見つからない
}

// パスを再構築（ヘルパー関数）
function reconstructPath(
  cameFrom: Map<string, Position>,
  current: Position
): readonly Position[] {
  const path: Position[] = [current];
  const posKey = (p: Position) => `${p.x},${p.y}`;
  let currentKey = posKey(current);

  while (cameFrom.has(currentKey)) {
    current = cameFrom.get(currentKey)!;
    path.unshift(current);
    currentKey = posKey(current);
  }

  return path;
}