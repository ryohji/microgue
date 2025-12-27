# mycrogue - 作業計画

## 実装方針

### 段階的アプローチ
最小構成から段階的に実装し、各フェーズで動作確認を行いながら進める。

### フェーズ分割の理由
1. **早期の動作確認**: 各フェーズで実際に動くものを作り、問題を早期発見
2. **実験的な調整**: コアループができた段階で数値やメカニクスを試行錯誤
3. **モチベーション維持**: 動くものが見えることで進捗を実感
4. **リスク軽減**: 大きな設計ミスを早期に発見・修正

---

## Phase 1: コアループ (基盤構築) ✅

### 目的
60fps ゲームループと入力システムの基盤を構築し、動作を確認する。

### 状態: 完了

### 実装内容

#### 1.1 プロジェクト初期化
- [x] ディレクトリ構造作成
- [x] package.json 作成
  - TypeScript 設定
  - seedrandom 依存追加
- [x] tsconfig.json 作成
  - strict mode 有効化
  - ES2020 ターゲット
- [x] .gitignore 作成

#### 1.2 型定義
- [x] `src/types/Input.ts`: KeyPress 型
- [x] `src/types/GameState.ts`: 最小限のゲーム状態
- [x] `src/core/random.ts`: RandomGenerator 型定義

#### 1.3 入力システム
- [x] `src/input/inputSystem.ts`
  - createInputSystem() 実装
  - readline によるキー入力収集
  - キューイング機構

#### 1.4 描画システム
- [x] `src/rendering/render.ts`
  - renderScreen() 実装
  - console.clear() による画面クリア
  - 文字列配列の出力

#### 1.5 ゲームループ
- [x] `src/core/gameLoop.ts`
  - 60fps 制御
  - deltaTime 計算
  - 入力・更新・描画の統合

#### 1.6 動作確認デモ
- [x] `src/main.ts`
  - 矢印キーでカーソル移動
  - カーソル位置を画面に表示
  - 'q' キーで終了

### 成果物
- 60fps で動作するゲームループ
- キーボード入力の受付
- 画面への文字列描画

### 完了条件
```bash
npm start
# 矢印キーでカーソルが移動する
# 画面が 60fps で更新される
# 'q' で正常終了する
```

---

## Phase 2: 基本戦闘システム ✅

### 目的
グリッドベースの戦術戦闘の基礎を実装する。

### 状態: 完了

### 実装内容

#### 2.1 型定義
- [x] `src/types/Entity.ts`
  - Position, Stats
  - Entity, Player, Enemy
- [x] `src/types/CombatState.ts`
  - Grid, CombatState
  - Action 定義

#### 2.2 グリッドシステム
- [x] `src/combat/grid.ts`
  - createGrid(): グリッド生成
  - isValidPosition(): 位置チェック
  - getDistance(): 距離計算
  - findPath(): パス探索 (A*)

#### 2.3 エンティティ操作
- [x] `src/combat/entity.ts`
  - createPlayer(): プレイヤー生成
  - createEnemy(): 敵生成
  - moveEntity(): エンティティ移動
  - damageEntity(): ダメージ適用
  - 位置重複防止機能

#### 2.4 タイムラインシステム
- [x] `src/combat/timeline.ts`
  - accumulateTimeline(): ゲージ蓄積
  - consumeActionPoints(): AP 消費
  - getNextActor(): 次の行動者決定
  - 100到達時の蓄積停止機能

#### 2.5 戦闘更新ロジック
- [x] `src/combat/combat.ts`
  - initCombat(): 戦闘開始
  - updateCombat(): 戦闘状態更新
  - executeAction(): アクション実行
  - 移動時の衝突判定

#### 2.6 戦闘描画
- [x] `src/rendering/formatters.ts`
  - renderCombat(): 戦闘画面の文字列生成
  - renderHPBar(): HPバー表示
  - renderGaugeBar(): タイムラインゲージ表示
  - 固定幅フォーマット対応

#### 2.7 動作確認デモ
- [x] 15x10 グリッド
- [x] プレイヤー (@) vs 敵 1体 (E)
- [x] 矢印キーで移動
- [x] スペースキーで攻撃
- [x] タイムラインゲージの可視化
- [x] ゲームループのジェネリック化

### 成果物
- グリッド上での移動・攻撃
- タイムラインによるターン制御
- 簡易的な 1vs1 戦闘
- 動作する戦闘デモ

### 完了条件
- [x] プレイヤーが敵を倒せる
- [x] 敵のシンプルな AI (接近して攻撃)
- [x] タイムラインゲージが正しく動作
- [x] エンティティが重ならない
- [x] 表示が正しくフォーマットされる

---

## Phase 3: ダンジョンシステム ✅

### 目的
部屋の分岐構造とダンジョン探索を実装する。

### 状態: 完了

### 実装内容

#### 3.1 型定義
- [x] `src/types/Dungeon.ts`
  - Room, Floor, Dungeon
  - RoomType 定義 (normal, elite, horde, boss, rest)
  - RoomStatus 定義

#### 3.2 部屋生成
- [x] `src/world/room.ts`
  - createRoom(): 部屋生成
  - addNextRooms(): 接続追加
  - 部屋タイプ別のパラメータ

#### 3.3 グラフ構造
- [x] `src/world/graph.ts`
  - generateRoomGraph(): レベルベース6段階グラフ生成
  - generateLevelLayouts(): レベルごとの部屋数と選択肢数決定
  - createConnectionsByLayout(): レベルレイアウトベースの接続生成
  - レベルスキップ機能 (50%確率、選択肢2以下の部屋から1箇所)
  - すべての部屋がスタートからボスまで到達可能

#### 3.4 ダンジョン生成
- [x] `src/world/dungeon.ts`
  - generateFloor(): フロア生成
  - generateDungeon(): ダンジョン全体生成
  - startDungeon(): ダンジョン開始処理

#### 3.5 ナビゲーション
- [x] `src/world/navigation.ts`
  - moveToRoom(): 部屋遷移処理
  - selectRoom(): 部屋選択処理
  - 状態管理 (locked, available, cleared)

#### 3.6 ダンジョン描画
- [x] `src/rendering/formatters.ts` 拡張
  - renderDungeonMap(): ダンジョンマップ表示
  - 現在位置と選択肢の表示
  - クリア状況の可視化

#### 3.7 動作確認デモ
- [x] ダンジョングラフ可視化デモ (main.ts)
  - レベルごとの部屋表示
  - 接続関係の表示
  - パス分析 (最短/最長パス、総パス数)
  - 部屋タイプ統計
  - スペースキーで新しいダンジョン生成

### 成果物
- レベルベース6段階グラフ構造
- レベルスキップ機能
- 回復部屋制限 (フロア内1つ)
- 特殊部屋配置 (Elite, Horde, Rest)
- ダンジョングラフ可視化デモ

### 完了条件
- [x] レベルベースのグラフ生成 (6レベル構造)
- [x] レベルスキップ機能 (50%確率で1箇所)
- [x] 回復部屋1つ、特殊部屋 (Elite/Horde) の配置
- [x] すべての部屋がスタートからボスまで到達可能
- [x] ループ防止 (前方向のみの接続)

---

## Phase 4: アイテム・成長システム ✅

### 目的
トロフィー・トレジャーとキャラクター成長を実装する。

### 状態: 完了

### 実装内容

#### 4.1 型定義
- [x] `src/types/Items.ts`
  - EffectType, EffectValue
  - Treasure, Trophy
  - TreasureType, TreasureRarity
  - Reward, PlayerInventory
  - AggregatedEffects

#### 4.2 効果システム
- [x] `src/items/effects.ts`
  - aggregateEffects(): インベントリから効果を集計
  - hasEffect(): 特定効果タイプの保持チェック
  - getEffectLevel(): 効果レベルの取得
  - MutableAggregatedEffects 型定義（-readonly マッピング）

#### 4.3 トレジャーシステム
- [x] `src/items/treasure.ts`
  - TREASURE_POOL: メジャーレリックと消耗品の定義（Common/Rare/Epic）
  - MINOR_RELIC_TEMPLATES: マイナーレリックテンプレート
  - generateTreasure(): トレジャー生成
  - selectTreasureType(): タイプ選択（インベントリ考慮）
  - generateMinorRelic(): マイナーレリック生成

#### 4.4 報酬システム
- [x] `src/items/rewards.ts`
  - generateRoomReward(): 部屋の報酬生成
  - addRewardToInventory(): インベントリへの追加
  - createEmptyInventory(): 空インベントリ生成

#### 4.5 部屋報酬統合
- [x] `src/world/room.ts` 更新
  - createRoomWithReward(): 報酬付き部屋生成
  - Room 型に reward フィールド追加

#### 4.6 遅延フロア生成
- [x] `src/types/Dungeon.ts` 更新
  - Dungeon 型を単一フロア保持に変更
  - totalFloors, currentFloorNumber, options 追加
- [x] `src/world/dungeon.ts` 更新
  - generateDungeon(): 初期状態のみ生成
  - generateFloor(): インベントリを考慮したフロア生成
  - advanceToNextFloor(): 次フロア生成関数
  - startDungeon(): 最初のフロア生成
- [x] `src/world/navigation.ts` 更新
  - currentFloor 対応に変更
  - Iterator.prototype.filter().toArray() 使用
- [x] `src/world/graph.ts` 更新
  - inventory パラメータ追加

#### 4.7 TypeScript 設定更新
- [x] `tsconfig.json` 更新
  - ES2023 サポート
  - ESNext.Iterator 追加
  - Iterator Helpers 使用可能

#### 4.8 報酬描画
- [x] `src/rendering/formatters.ts` に追加
  - renderRewardInfo(): 報酬詳細表示
  - renderDungeonNav(): 報酬情報統合
  - getRaritySymbol(): レアリティシンボル
  - formatEffect(): 効果フォーマット

#### 4.9 動作確認デモ
- [x] 報酬選択デモ (main.ts)
  - 部屋選択（1-9キー）
  - 報酬詳細表示
  - 報酬獲得とインベントリ管理
  - インベントリ考慮のフロア生成確認

### 成果物
- トレジャーシステム（メジャー・マイナー・消耗品）
- 効果集計システム
- 遅延フロア生成（インベントリ考慮）
- 報酬システム基盤
- 報酬描画システム
- インタラクティブなデモ

### 完了条件
- [x] アイテム型定義完了
- [x] トレジャー生成機能完了
- [x] 効果システム完了
- [x] 部屋報酬統合完了
- [x] 遅延フロア生成完了
- [x] 報酬描画実装
- [x] 動作確認デモ作成

---

## Phase 5: メタプログレッション ✅

### 目的
プレイ間でのアンロック要素と進行データの保存を実装する。

### 状態: 完了

### 実装内容

#### 5.1 型定義
- [x] `src/types/MetaProgress.ts`
  - UnlockConditionType (always, firstClear, bossKill, clearCount, floorReached, treasureCollected)
  - UnlockCondition, TrophyUnlock, TreasureUnlock
  - GameStats (総プレイ回数、総クリア回数、最大フロア到達、ボス撃破、トレジャー獲得履歴)
  - MetaProgress (プレイ間で永続化されるデータ)
  - UnlockDefinition (マスターデータ定義)

#### 5.2 アンロックシステム
- [x] `src/progression/meta.ts`
  - createInitialMetaProgress(): メタ進行データの初期化
  - checkUnlockCondition(): アンロック条件のチェック
  - unlockTrophy/unlockTreasure(): アンロック処理
  - processUnlocks(): アンロック定義の一括処理
  - recordRunStart/recordClear/recordBossKill/recordTreasureCollected(): 統計記録
  - isTrophyUnlocked/isTreasureUnlocked(): アンロック状態確認

#### 5.3 保存システム
- [x] `src/progression/save.ts`
  - saveMetaProgress(): saves/meta.json への保存
  - loadMetaProgress(): 読み込みまたは初期データ生成
  - hasSaveFile(): セーブファイル存在確認
  - deleteSaveFile(): デバッグ用削除機能

#### 5.4 アンロック定義
- [x] `data/unlocks.json`
  - 初期トレジャー定義（always条件）
  - トロフィー定義（firstClear, clearCount条件）
- [x] `src/progression/unlocks.ts`
  - loadUnlockDefinitions(): JSONファイル読み込み
  - getInitialUnlockedIds(): 初期アンロック済みID取得
  - DEFAULT_UNLOCKS: フォールバック定義

#### 5.5 描画機能
- [x] `src/rendering/formatters.ts` 拡張
  - renderMetaProgress(): メタ進行画面の描画

#### 5.6 ゲームループ改善
- [x] `src/core/gameLoop.ts` 修正
  - runGameLoop の戻り値を Promise<T> に変更
  - 最終状態を返すように修正

#### 5.7 動作確認デモ
- [x] `src/main.ts` Phase 5 デモ実装
  - メタ進行データの読み込みと保存
  - メタ進行画面の表示（ENTER でラン開始、Q で終了）
  - ラン記録、クリア記録、アンロック処理

### 成果物
- メタプログレッションシステム
- プレイ間でのデータ永続化 (saves/meta.json)
- アンロック要素（トロフィー、トレジャー）
- 柔軟なアンロック条件システム
- JSON ベースのマスターデータ管理

### 完了条件
- [x] セーブデータが正しく保存・読み込みされる
- [x] アンロック条件が機能する
- [x] プレイを重ねるごとに選択肢が増える仕組みの実装

---

## Phase 6: ボス戦・バランス調整 ✅

### 目的
ボス戦を実装し、ゲーム全体のバランスを調整する。

### 状態: 部分完了（デモレベル）

### 実装内容

#### 6.1 ボス定義
- [x] `data/bosses.json` 作成
  - 3体のボス定義（Dragon Lord, Shadow Assassin, Arcane Golem）
  - 高いステータス（HP, 攻撃力, 防御力）
  - 装備レリック（各ボス固有のレリック）

#### 6.2 ボスシステム
- [x] `src/types/Entity.ts` 拡張
  - `equippedRelics` フィールド追加
  - `'boss'` AI タイプ追加
  - `isBoss` フラグ追加
- [x] `src/combat/bosses.ts` 作成
  - JSON からボス定義読み込み
  - `createBoss()` 関数
  - `getAvailableBossIds()` 関数

#### 6.3 レリック効果システム統合
- [x] `src/items/effects.ts` 拡張
  - `aggregateEntityEffects()` 関数追加（エンティティの装備レリック効果集計）
- [x] `src/combat/entity.ts` 拡張
  - `damageEntity()` をレリック効果対応に書き換え
  - クリティカルヒット、ライフスティール、ダメージ軽減、DoT、デバフ対応
  - `calculateLifesteal()` 関数追加
- [x] `src/combat/combat.ts` 拡張
  - 攻撃時のライフスティール処理追加

#### 6.4 ボス AI
- [x] `src/combat/ai.ts` 拡張
  - `decideBossAction()` 関数追加
  - HP が低い時の後退戦略
  - `findRetreatPosition()` 関数（脅威から遠ざかる位置探索）

#### 6.5 Phase 6 デモ
- [x] `src/main.ts` Phase 6 ボス戦デモ実装
  - ボス選択UI（矢印キーで選択、Enter で確定）
  - プレイヤー初期装備（Hero Sword, Hero Armor, Swift Boots）
  - 戦闘中の装備表示
  - Q キーでの終了機能
  - 勝利/敗北後の R キーでリスタート

#### 6.6 入力システム改善
- [x] `src/input/inputSystem.ts` 修正
  - クリーンアップ時に `process.stdin.pause()` 追加
- [x] `src/main.ts` 修正
  - ゲーム終了時の `process.exit(0)` 追加

#### 6.7 バランス調整
- [ ] 敵のステータス調整（未実施）
- [ ] アイテム効果の調整（未実施）
- [ ] タイムラインゲージの速度調整（未実施）
- [ ] AP コストの調整（未実施）

#### 6.8 テストプレイ
- [ ] 1プレイ 30〜40分になるか確認（未実施）
- [ ] 難易度曲線のチェック（未実施）
- [ ] アイテムバランスのチェック（未実施）

### 成果物
- ボス定義システム（JSON ベース）
- ボスレリック装備システム
- レリック効果統合（クリティカル、ライフスティール、軽減、DoT、デバフ）
- ボス AI（後退戦略）
- ボス戦デモ（プレイ可能）

### 完了条件
- [x] ボスが定義されている
- [x] ボスがレリックを装備している
- [x] レリック効果が戦闘に反映される
- [x] ボス AI が動作する
- [x] デモが動作する
- [ ] バランス調整完了（次フェーズに持ち越し）
- [ ] 難易度が適切（次フェーズに持ち越し）
- [ ] 1プレイの時間が目標範囲内（次フェーズに持ち越し）

---

## Phase 7: 仕上げ・最適化

### 目的
UI 改善、最適化、ポリッシュを行う。

### 実装内容

#### 7.1 UI 改善
- [ ] より見やすい ASCII レイアウト
- [ ] 色付け (ANSI エスケープシーケンス)
- [ ] エフェクト表現の改善

#### 7.2 エラーハンドリング
- [ ] 不正な入力への対応
- [ ] セーブデータ破損への対応
- [ ] エラーメッセージの改善

#### 7.3 パフォーマンス最適化
- [ ] 不要な再計算の削減
- [ ] メモ化の導入 (必要に応じて)

#### 7.4 ドキュメント整備
- [ ] README.md 作成
  - ゲーム説明
  - 操作方法
  - インストール手順
- [ ] コード内コメント追加

#### 7.5 最終テスト
- [ ] フルプレイテスト
- [ ] バグ修正
- [ ] エッジケースのチェック

### 成果物
- 完成度の高いゲーム
- 充実したドキュメント

### 完了条件
- 安定して動作する
- UI が分かりやすい
- ドキュメントが揃っている

---

## 各フェーズの推定工数

| フェーズ | 推定工数 | 主な内容 |
|---------|---------|---------|
| Phase 1 | 2-3時間 | コアループ構築 |
| Phase 2 | 4-6時間 | 戦闘システム |
| Phase 3 | 3-4時間 | ダンジョン生成 |
| Phase 4 | 3-4時間 | アイテムシステム |
| Phase 5 | 2-3時間 | メタ進行 |
| Phase 6 | 4-6時間 | ボス・バランス |
| Phase 7 | 2-4時間 | 仕上げ |
| **合計** | **20-30時間** | |

---

## 優先度と柔軟性

### 必須要素 (MVP)
- Phase 1: コアループ
- Phase 2: 基本戦闘
- Phase 3: ダンジョン (簡易版)

### 重要要素
- Phase 4: アイテム
- Phase 5: メタ進行

### オプション要素
- Phase 6: ボスの複雑な AI
- Phase 7: UI の装飾

---

## 次のステップ

Phase 4 (アイテム・成長システム) の実装を準備します。
詳細な進捗は PROGRESS.md で管理します。

---

## 実装済み機能の詳細

### Phase 1 で実装された機能
- 60fps ゲームループ (可変 deltaTime 対応)
- 非ブロッキング入力システム (キーイベントキュー)
- ANSI エスケープシーケンスによる描画 (スクロール防止)
- ジェネリックな状態管理 (AppState)

### Phase 2 で実装された機能
- グリッドベース戦闘システム
- Timeline + AP ターン制御 (100到達時の蓄積停止)
- A*パス探索アルゴリズム
- エンティティ衝突判定
- 固定幅フォーマット表示
- 簡易AI (接近・攻撃)

### Phase 3 で実装された機能
- レベルベース6段階グラフ生成
  - レベル1: スタート1部屋
  - レベル2-4: 拡大 (最大6部屋)
  - レベル5: 収束 (1-3部屋)
  - レベル6: ボス1部屋
- ラグビーボール型グラフ構造 (中央が広く両端が狭い)
- レベルスキップ機能
  - 50%確率で発生
  - レベル4以前の選択肢2以下の部屋から1箇所
  - 次々レベルへの接続を追加
- 特殊部屋配置
  - 回復部屋: フロア内1つまで
  - Elite部屋: 敵1体、高難易度
  - Horde部屋: 敵6体、大量戦
- 到達可能性とループ防止
  - すべての部屋がスタートからボス到達可能
  - 前方向 (次レベル) への接続のみ
- 関数型スタイル実装
  - filter, flatMap による候補選択
  - 不変データ構造
  - ピュア関数による生成ロジック
- ゲームループ拡張
  - AppState に clearScreen フラグ追加
  - 画面クリア管理の改善
