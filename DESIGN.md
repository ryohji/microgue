# microgue - システム設計書

## プロジェクト概要

### コンセプト
- ターン制ローグライクゲーム
- 60fps のゲームエンジンスタイル (update/draw ループ)
- Node.js + TypeScript (将来的に Vue.js/React へ移行可能)
- コンソール・テキストベース UI
- 1プレイ 30〜40 分程度

### ゲーム構成
- 3〜5 層のダンジョン
- 1 層に 20 前後の部屋
- 1 部屋ごとに 1〜3 の進行選択肢（分岐構造）
- 部屋クリアでトロフィー獲得
- 層ボス撃破でトレジャー獲得
- プレイ間でアンロック要素が蓄積（メタプログレッション）

---

## アーキテクチャ設計

### 全体構造

```
┌──────────────────────────────────────────────────┐
│ Game Loop (60fps)                                │
│ ├─ Input Collection (non-blocking queue)        │
│ ├─ Update (pure functions, RNG injection)       │
│ └─ Draw (side effect: stdout)                   │
└──────────────────────────────────────────────────┘
                      ↓
         ┌────────────┴────────────┐
         │                         │
    ┌─────────┐              ┌──────────┐
    │ Dungeon │              │  Combat  │
    │ System  │              │  System  │
    └─────────┘              └──────────┘
         │                         │
    分岐グラフ              Timeline + AP
    3-5 階層               可変グリッド
    ボス部屋               戦術戦闘
                                │
                    ┌───────────┴───────────┐
                    │                       │
               ┌─────────┐           ┌──────────┐
               │ Trophy  │           │Treasure  │
               │(Passive)│           │(Equipment)│
               └─────────┘           └──────────┘
                    │
            ┌───────┴────────┐
            │                │
       ┌──────────┐    ┌────────────┐
       │ Unlocks  │    │ Meta Save  │
       │ Database │    │ (JSON)     │
       └──────────┘    └────────────┘
```

### 設計原則

1. **関数型プログラミングスタイル**
   - データは readonly な interface で定義
   - ピュア関数で状態変換
   - 副作用は特定の関数に分離

2. **イミュータビリティ**
   - すべての状態更新は新しいオブジェクトを返す
   - 元のデータは変更しない

3. **依存性注入**
   - 乱数生成器は外部から注入
   - テスタビリティとデバッグ性を確保

4. **シンプルさ優先**
   - class は必要最小限
   - データと関数を分離
   - 実験的な調整が容易

---

## コアシステム詳細

### 1. Game Loop (60fps制御)

```typescript
async function gameLoop(
  initialState: GameState,
  rng: () => number = Math.random
): Promise<void> {
  const targetFrameTime = 1000 / 60;
  let state = initialState;
  let lastTime = performance.now();

  while (running) {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // 入力取得 (副作用)
    const input = pollInput();

    // 状態更新 (ピュア関数)
    state = updateGame(state, input, deltaTime, rng);

    // 描画 (副作用)
    const lines = renderGameState(state);
    renderScreen(lines);

    // フレームレート制御
    await waitForNextFrame(currentTime, targetFrameTime);
  }
}
```

**特徴:**
- 一定の 60fps を維持
- deltaTime でフレーム間の時間差を吸収
- 入力・更新・描画の明確な分離

---

### 2. Input System (非同期キューイング)

```typescript
interface InputState {
  readonly queue: readonly KeyPress[];
}

function createInputSystem(): {
  getState: () => InputState;
  cleanup: () => void;
} {
  const queue: KeyPress[] = [];

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', (str, key) => {
    queue.push({ str, key });
  });

  return {
    getState: () => ({ queue: [...queue].splice(0, queue.length) }),
    cleanup: () => { /* リスナー解除 */ }
  };
}
```

**特徴:**
- ノンブロッキングでキー入力を収集
- ゲームループ内でキューを消費
- 標準入力の raw mode を利用

---

### 3. Combat System (戦術戦闘)

#### 部屋構成
- 可変サイズグリッド (5x5 〜 20x20)
- 部屋タイプによってサイズと敵数が変動
- 自由移動可能なストラテジー戦闘

#### ターン順序システム (Timeline + AP)

```typescript
interface CombatState {
  readonly timeline: ReadonlyMap<string, number>;  // entityId -> gauge (0-100)
  readonly entities: readonly Entity[];
}

// タイムラインゲージ蓄積
function accumulateTimeline(
  timeline: ReadonlyMap<string, number>,
  entities: readonly Entity[],
  deltaTime: number
): Map<string, number> {
  const newTimeline = new Map(timeline);

  for (const entity of entities) {
    const current = newTimeline.get(entity.id) ?? 0;
    const gain = entity.speed * deltaTime;
    newTimeline.set(entity.id, current + gain);
  }

  return newTimeline;
}

// AP消費 (行動の重さで変動)
function consumeActionPoints(
  timeline: ReadonlyMap<string, number>,
  entityId: string,
  action: Action
): Map<string, number> {
  const newTimeline = new Map(timeline);
  const current = newTimeline.get(entityId) ?? 0;
  newTimeline.set(entityId, Math.max(0, current - action.apCost));
  return newTimeline;
}

// 次の行動者を決定
function getNextActor(
  timeline: ReadonlyMap<string, number>
): string | null {
  let maxGauge = 0;
  let nextActor: string | null = null;

  for (const [id, gauge] of timeline) {
    if (gauge >= 100 && gauge > maxGauge) {
      maxGauge = gauge;
      nextActor = id;
    }
  }

  return nextActor;
}
```

**動作イメージ:**
1. 各エンティティの速度に応じてゲージが蓄積
2. ゲージが 100 に到達したエンティティが行動可能
3. 行動時に AP を消費（軽い行動 = 少ないAP、重い行動 = 多いAP）
4. AP消費後、ゲージが減少し、再び蓄積を開始
5. 速度バフやアクションの軽重で順序が動的に変化

**例:**
- プレイヤー速度 100、敵速度 150
- 軽攻撃 (AP 80) → 次の行動まで 0.8秒
- 重攻撃 (AP 100) → 次の行動まで 1.0秒
- 速度バフ (+50%) → ゲージ蓄積が 1.5倍

---

### 4. Dungeon System (分岐グラフ構造)

```typescript
interface Dungeon {
  readonly floors: readonly Floor[];
  readonly currentFloor: number;
  readonly currentRoom: string;  // room id
}

interface Floor {
  readonly level: number;
  readonly rooms: ReadonlyMap<string, Room>;
  readonly graph: ReadonlyMap<string, readonly string[]>;  // room -> next rooms
  readonly bossRoom: string;
  readonly startRoom: string;
}

interface Room {
  readonly id: string;
  readonly type: 'combat' | 'treasure' | 'boss';
  readonly cleared: boolean;
  readonly gridSize: { width: number; height: number };
  readonly enemies: readonly EnemyDef[];
}
```

**構造:**
- 各部屋は 1〜3 の次の部屋への選択肢を持つ
- グラフ構造で分岐を管理
- 階層の最後にボス部屋が配置される

---

### 5. Progression System (成長とアンロック)

#### トロフィー (Trophy)
- パッシブスキル
- 永続的な能力向上
- 部屋クリア報酬

```typescript
interface Trophy {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effect: PassiveEffect;
}

type PassiveEffect =
  | { type: 'stat_bonus'; stat: 'hp' | 'attack' | 'defense'; value: number }
  | { type: 'speed_multiplier'; multiplier: number }
  | { type: 'ap_reduction'; reduction: number };
```

#### トレジャー (Treasure)
- 装備アイテム
- 武器・防具・アクセサリ
- ボス撃破報酬

```typescript
interface Treasure {
  readonly id: string;
  readonly name: string;
  readonly slot: 'weapon' | 'armor' | 'accessory';
  readonly stats: Stats;
  readonly special?: SpecialEffect;
}
```

#### メタプログレッション
- プレイ間でアンロック要素が蓄積
- 新しいトロフィー・トレジャーが出現可能になる

```typescript
interface MetaProgress {
  readonly unlockedTrophies: ReadonlySet<string>;
  readonly unlockedTreasures: ReadonlySet<string>;
  readonly totalClears: number;
  readonly bossesDefeated: ReadonlySet<string>;
}

// JSON保存/読込
function saveMetaProgress(progress: MetaProgress): void;
function loadMetaProgress(): MetaProgress;
```

---

### 6. Random System (乱数注入)

```typescript
type RandomGenerator = () => number;  // [0, 1)

// すべての乱数処理で使用
function rollDice(rng: RandomGenerator, sides: number): number {
  return Math.floor(rng() * sides) + 1;
}

function pickRandom<T>(rng: RandomGenerator, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

// デバッグ用: 固定シード
import seedrandom from 'seedrandom';
const debugRng = seedrandom('debug-seed-123');
gameLoop(initialState, debugRng);

// 本番用: Math.random
gameLoop(initialState, Math.random);
```

---

### 7. Rendering System (ASCII描画)

```typescript
// ピュア関数: 状態 → 文字列配列
function renderCombat(state: CombatState): readonly string[] {
  const lines: string[] = [];

  // グリッド描画
  for (let y = 0; y < state.grid.height; y++) {
    let line = '';
    for (let x = 0; x < state.grid.width; x++) {
      const entity = findEntityAt(state.entities, x, y);
      line += entity ? entity.symbol : '.';
    }
    lines.push(line);
  }

  // UI情報
  lines.push('');
  lines.push(`HP: ${state.player.hp}/${state.player.maxHp}`);

  // タイムラインゲージ
  lines.push('Timeline:');
  for (const [id, gauge] of state.timeline) {
    const bar = '='.repeat(Math.floor(gauge / 10));
    lines.push(`${id}: [${bar.padEnd(10)}] ${gauge.toFixed(0)}`);
  }

  return lines;
}

// 副作用: 画面出力
function renderScreen(lines: readonly string[]): void {
  console.clear();
  console.log(lines.join('\n'));
}
```

**特徴:**
- シンプルな ASCII アート
- 最小限のレイアウト
- ロジックの実験に集中

---

## データ型定義

### 基本型

```typescript
interface Position {
  readonly x: number;
  readonly y: number;
}

interface Stats {
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
}

interface KeyPress {
  readonly str: string;
  readonly key: {
    readonly name?: string;
    readonly ctrl?: boolean;
    readonly shift?: boolean;
  };
}
```

### エンティティ

```typescript
interface Entity {
  readonly id: string;
  readonly symbol: string;  // ASCII表示用
  readonly pos: Position;
  readonly hp: number;
  readonly stats: Stats;
  readonly equipment: readonly Treasure[];
  readonly trophies: readonly Trophy[];
}

interface Player extends Entity {
  readonly type: 'player';
}

interface Enemy extends Entity {
  readonly type: 'enemy';
  readonly aiType: 'melee' | 'ranged' | 'boss';
}
```

### ゲーム状態

```typescript
type GamePhase = 'dungeon_nav' | 'combat' | 'reward';

interface GameState {
  readonly phase: GamePhase;
  readonly dungeon: Dungeon;
  readonly combat: CombatState | null;
  readonly player: Player;
  readonly metaProgress: MetaProgress;
}
```

---

## ディレクトリ構造

```
microgue/
├── src/
│   ├── types/                    # データ型定義
│   │   ├── GameState.ts
│   │   ├── CombatState.ts
│   │   ├── Entity.ts
│   │   ├── Dungeon.ts
│   │   ├── Items.ts
│   │   └── Input.ts
│   │
│   ├── core/
│   │   ├── gameLoop.ts          # メインループ (副作用)
│   │   ├── update.ts            # 状態更新 (ピュア関数)
│   │   └── random.ts            # 乱数型定義・ヘルパー
│   │
│   ├── input/
│   │   └── inputSystem.ts       # 入力管理 (副作用)
│   │
│   ├── rendering/
│   │   ├── render.ts            # 描画実行 (副作用)
│   │   └── formatters.ts        # 状態→文字列変換 (ピュア関数)
│   │
│   ├── combat/
│   │   ├── timeline.ts          # タイムライン計算 (ピュア関数)
│   │   ├── actions.ts           # アクション適用 (ピュア関数)
│   │   ├── grid.ts              # グリッド操作 (ピュア関数)
│   │   └── combat.ts            # 戦闘状態更新 (ピュア関数)
│   │
│   ├── world/
│   │   ├── dungeon.ts           # ダンジョン生成 (rng注入)
│   │   ├── room.ts              # 部屋定義
│   │   └── graph.ts             # グラフ操作 (ピュア関数)
│   │
│   ├── items/
│   │   ├── trophy.ts
│   │   ├── treasure.ts
│   │   └── equipment.ts
│   │
│   ├── progression/
│   │   ├── meta.ts              # メタ進行 (ピュア関数)
│   │   └── save.ts              # 保存/読込 (副作用)
│   │
│   └── main.ts
│
├── data/                         # マスターデータ (JSON)
│   ├── enemies.json
│   ├── trophies.json
│   ├── treasures.json
│   └── rooms.json
│
├── saves/                        # メタ進行データ
│   └── meta.json
│
├── DESIGN.md                     # このファイル
├── PLAN.md                       # 作業計画
├── PROGRESS.md                   # 進捗管理
├── package.json
├── tsconfig.json
└── README.md
```

---

## 技術スタック

- **言語**: TypeScript (strict mode)
- **ランタイム**: Node.js (v18+)
- **依存ライブラリ**:
  - `seedrandom`: デバッグ用固定シード乱数生成
  - (その他は標準ライブラリのみ)
- **ビルドツール**: tsc (TypeScript Compiler)
- **テスト**: (後で検討)

---

## 設計上の注意点

### やること
- readonly を徹底してイミュータビリティを保つ
- ピュア関数と副作用関数を明確に分離
- 乱数は必ず引数として注入
- 状態更新は常に新しいオブジェクトを返す

### やらないこと
- class の多用（必要最小限のみ）
- グローバル変数
- 状態の直接変更
- 副作用の隠蔽

---

## 将来の拡張性

### Web UI への移行
- ピュア関数の更新ロジックはそのまま流用可能
- 入力・描画部分のみ置き換え
- Vue.js / React のコンポーネントで再実装

### マルチプレイヤー
- 状態をシリアライズして送受信
- ピュア関数なので状態同期が容易

### モバイル対応
- タッチ入力への対応
- レスポンシブなレイアウト
