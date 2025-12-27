# mycrogue - 進捗管理

## プロジェクト概要

- **開始日**: 2025-12-21
- **現在フェーズ**: Phase 6 (ボス戦・バランス調整) - 部分完了（デモレベル）
- **前フェーズ**: Phase 5 完了 ✅

---

## 全体進捗

```
Phase 0: 準備・設計         [████████████████████] 100%
Phase 1: コアループ         [████████████████████] 100% ✅
Phase 2: 基本戦闘           [████████████████████] 100% ✅
Phase 3: ダンジョン         [████████████████████] 100% ✅
Phase 4: アイテム・成長     [████████████████████] 100% ✅
Phase 5: メタ進行           [████████████████████] 100% ✅
Phase 6: ボス・バランス     [██████████████░░░░░░]  70% (デモ完了)
Phase 7: 仕上げ             [░░░░░░░░░░░░░░░░░░░░]   0%

全体進捗: 89% (Phase 0-5 完了、Phase 6 部分完了)
```

---

## Phase 0: 準備・設計 ✅

### 状態: 完了
### 期間: 2025-12-21

#### 完了項目
- [x] 要件定義・ヒアリング
- [x] システム設計
- [x] 関数型スタイル設計への修正
- [x] DESIGN.md 作成
- [x] PLAN.md 作成
- [x] PROGRESS.md 作成

#### 成果物
- [DESIGN.md](DESIGN.md): システム設計書
- [PLAN.md](PLAN.md): 作業計画書
- PROGRESS.md: このファイル

#### メモ
- 関数型プログラミングスタイルを採用
- データと関数を分離
- ピュア関数と副作用の明確な分離

---

## Phase 1: コアループ

### 状態: 完了 ✅
### 目標: 60fps ゲームループと入力システムの基盤構築

#### タスク進捗

##### 1.1 プロジェクト初期化
- [x] ディレクトリ構造作成
- [x] package.json 作成
- [x] tsconfig.json 作成
- [x] .gitignore 作成

##### 1.2 型定義
- [x] `src/types/Input.ts`
- [x] `src/types/GameState.ts`
- [x] `src/core/random.ts`

##### 1.3 入力システム
- [x] `src/input/inputSystem.ts`

##### 1.4 描画システム
- [x] `src/rendering/render.ts`

##### 1.5 ゲームループ
- [x] `src/core/gameLoop.ts`

##### 1.6 動作確認デモ
- [x] `src/main.ts`
- [x] 矢印キーでカーソル移動デモ

#### 完了条件
- [x] 60fps で動作するゲームループ
- [x] キーボード入力の受付
- [x] 画面への文字列描画
- [x] デモが正常にビルド完了

---

## Phase 2: 基本戦闘システム

### 状態: 完了 ✅
### 目標: グリッドベースの戦術戦闘の基礎

#### タスク進捗

##### 2.1 型定義
- [x] `src/types/Entity.ts`
- [x] `src/types/CombatState.ts`

##### 2.2 グリッドシステム
- [x] `src/combat/grid.ts`

##### 2.3 エンティティ操作
- [x] `src/combat/entity.ts`

##### 2.4 タイムラインシステム
- [x] `src/combat/timeline.ts`

##### 2.5 戦闘更新ロジック
- [x] `src/combat/combat.ts`

##### 2.6 戦闘描画
- [x] `src/rendering/formatters.ts`

##### 2.7 動作確認デモ
- [x] 1vs1 戦闘デモ

#### 完了条件
- [x] プレイヤーが敵を倒せる
- [x] 敵のシンプルな AI
- [x] タイムラインゲージが正しく動作

---

## Phase 3: ダンジョンシステム

### 状態: 完了 ✅
### 目標: 部屋の分岐構造とダンジョン探索

#### タスク進捗

##### 3.1 型定義
- [x] `src/types/Dungeon.ts`

##### 3.2 部屋生成
- [x] `src/world/room.ts`

##### 3.3 グラフ構造
- [x] `src/world/graph.ts`

##### 3.4 ダンジョン生成
- [x] `src/world/dungeon.ts`

##### 3.5 ナビゲーション
- [x] `src/world/navigation.ts`

##### 3.6 ダンジョン描画
- [x] `src/rendering/formatters.ts` 拡張

##### 3.7 動作確認デモ
- [x] ダンジョングラフ可視化デモ

#### 完了条件
- [x] レベルベースのグラフ生成（6レベル構造）
- [x] レベルスキップ機能（50%確率で1箇所）
- [x] 回復部屋1つ、特殊部屋（Elite/Horde）の配置
- [x] すべての部屋がスタートからボスまで到達可能

---

## Phase 4: アイテム・成長システム

### 状態: 完了 ✅
### 目標: トロフィー・トレジャーとキャラクター成長

#### タスク進捗

##### 4.1 型定義
- [x] `src/types/Items.ts`
  - EffectType, EffectValue
  - Treasure, Trophy
  - TreasureType, TreasureRarity
  - Reward, PlayerInventory
  - AggregatedEffects

##### 4.2 効果システム
- [x] `src/items/effects.ts`
  - aggregateEffects(): インベントリから効果を集計
  - hasEffect(): 特定効果タイプの保持チェック
  - getEffectLevel(): 効果レベルの取得
  - MutableAggregatedEffects 型定義（-readonly マッピング）

##### 4.3 トレジャーシステム
- [x] `src/items/treasure.ts`
  - TREASURE_POOL: メジャーレリックと消耗品の定義
  - MINOR_RELIC_TEMPLATES: マイナーレリックテンプレート
  - generateTreasure(): トレジャー生成
  - selectTreasureType(): タイプ選択（インベントリ考慮）
  - generateMinorRelic(): マイナーレリック生成

##### 4.4 報酬システム
- [x] `src/items/rewards.ts`
  - generateRoomReward(): 部屋の報酬生成
  - addRewardToInventory(): インベントリへの追加
  - createEmptyInventory(): 空インベントリ生成

##### 4.5 部屋報酬統合
- [x] `src/world/room.ts` 更新
  - createRoomWithReward(): 報酬付き部屋生成
  - Room 型に reward フィールド追加

##### 4.6 遅延フロア生成
- [x] `src/types/Dungeon.ts` 更新
  - Dungeon 型を単一フロア保持に変更
- [x] `src/world/dungeon.ts` 更新
  - generateDungeon(): 初期状態のみ生成
  - generateFloor(): インベントリを考慮したフロア生成
  - advanceToNextFloor(): 次フロア生成関数
  - startDungeon(): 最初のフロア生成
- [x] `src/world/navigation.ts` 更新
  - currentFloor 対応に変更
  - Iterator Helpers 使用
- [x] `src/world/graph.ts` 更新
  - inventory パラメータ追加

##### 4.7 TypeScript 設定更新
- [x] `tsconfig.json` 更新
  - ES2023 サポート
  - ESNext.Iterator 追加

##### 4.8 報酬描画
- [x] `src/rendering/formatters.ts` 拡張
  - renderRewardInfo(): 報酬詳細表示
  - renderDungeonNav(): 報酬情報統合
  - getRaritySymbol(), formatEffect()

##### 4.9 動作確認デモ
- [x] 報酬選択デモ (main.ts)
  - 部屋選択とインベントリ管理
  - インベントリ考慮のフロア生成確認

#### 完了条件
- [x] アイテム型定義完了
- [x] トレジャー生成機能完了
- [x] 効果システム完了
- [x] 部屋報酬統合完了
- [x] 遅延フロア生成完了
- [x] 報酬描画実装
- [x] 動作確認デモ作成

---

## Phase 5: メタプログレッション

### 状態: 完了 ✅
### 目標: プレイ間でのアンロック要素

#### タスク進捗

##### 5.1 型定義
- [x] `src/types/MetaProgress.ts`
  - UnlockConditionType, UnlockCondition
  - TrophyUnlock, TreasureUnlock
  - GameStats (totalRuns, totalClears, maxFloorReached, bossesKilled, treasuresCollected)
  - MetaProgress (version, stats, unlockedTrophies, unlockedTreasures, lastPlayedAt)
  - UnlockDefinition (マスターデータ定義)

##### 5.2 アンロックシステム
- [x] `src/progression/meta.ts`
  - createInitialMetaProgress(): メタ進行データの初期化
  - checkUnlockCondition(): アンロック条件のチェック
  - unlockTrophy/unlockTreasure(): アンロック処理
  - processUnlocks(): アンロック定義の一括処理
  - recordRunStart/recordClear/recordBossKill/recordTreasureCollected(): 統計記録
  - isTrophyUnlocked/isTreasureUnlocked(): アンロック状態確認

##### 5.3 保存システム
- [x] `src/progression/save.ts`
  - saveMetaProgress(): saves/meta.json への保存
  - loadMetaProgress(): 読み込みまたは初期データ生成
  - hasSaveFile(): セーブファイル存在確認
  - deleteSaveFile(): デバッグ用削除機能

##### 5.4 アンロック定義
- [x] `data/unlocks.json`
  - 初期トレジャー定義（always条件）
  - トロフィー定義（firstClear, clearCount条件）
- [x] `src/progression/unlocks.ts`
  - loadUnlockDefinitions(): JSONファイル読み込み
  - getInitialUnlockedIds(): 初期アンロック済みID取得
  - DEFAULT_UNLOCKS: フォールバック定義

##### 5.5 描画機能
- [x] `src/rendering/formatters.ts` 拡張
  - renderMetaProgress(): メタ進行画面の描画

##### 5.6 ゲームループ改善
- [x] `src/core/gameLoop.ts` 修正
  - runGameLoop の戻り値を Promise<T> に変更
  - 最終状態を返すように修正

##### 5.7 動作確認デモ
- [x] `src/main.ts` Phase 5 デモ実装
  - メタ進行データの読み込み
  - メタ進行画面の表示
  - ラン開始/クリアの記録
  - アンロック処理の実行
  - セーブデータの保存

#### 完了条件
- [x] セーブデータが正しく保存・読み込み
- [x] アンロック条件が機能
- [x] プレイを重ねるごとに選択肢が増える仕組みの実装

---

## Phase 6: ボス戦・バランス調整

### 状態: 部分完了（デモレベル）
### 目標: ボス戦実装とゲームバランス調整

#### タスク進捗

##### 6.1 ボス定義
- [x] `data/bosses.json` 作成
  - 3体のボス定義（Dragon Lord, Shadow Assassin, Arcane Golem）
  - 各ボス固有のレリック装備

##### 6.2 ボスシステム
- [x] `src/types/Entity.ts` 拡張（`equippedRelics`, `'boss'` AI タイプ、`isBoss` フラグ）
- [x] `src/combat/bosses.ts` 作成（ボス読み込み、生成）

##### 6.3 レリック効果統合
- [x] `src/items/effects.ts` 拡張（`aggregateEntityEffects()`）
- [x] `src/combat/entity.ts` 拡張（レリック効果対応のダメージ計算）
- [x] `src/combat/combat.ts` 拡張（ライフスティール処理）

##### 6.4 ボス AI
- [x] `src/combat/ai.ts` 拡張（ボス AI、後退戦略）

##### 6.5 Phase 6 デモ
- [x] ボス選択 UI
- [x] プレイヤー初期装備
- [x] 装備表示
- [x] Q キー終了機能修正

##### 6.6 入力システム改善
- [x] `src/input/inputSystem.ts` 修正（stdin.pause()）
- [x] `src/main.ts` 修正（process.exit()）

##### 6.7 バランス調整
- [ ] 敵ステータス調整（未実施）
- [ ] アイテム効果調整（未実施）
- [ ] タイムライン速度調整（未実施）
- [ ] AP コスト調整（未実施）

##### 6.8 テストプレイ
- [ ] プレイ時間確認（未実施）
- [ ] 難易度曲線チェック（未実施）
- [ ] アイテムバランスチェック（未実施）

#### 完了条件
- [x] ボスが定義されている
- [x] ボスがレリックを装備している
- [x] レリック効果が戦闘に反映される
- [x] ボス AI が動作する
- [x] デモが動作する
- [ ] バランス調整完了（次フェーズに持ち越し）
- [ ] 難易度が適切（次フェーズに持ち越し）
- [ ] 1プレイ 30〜40分（次フェーズに持ち越し）

---

## Phase 7: 仕上げ・最適化

### 状態: 未着手
### 目標: UI改善、最適化、ポリッシュ

#### タスク進捗

##### 7.1 UI 改善
- [ ] ASCII レイアウト改善
- [ ] 色付け (ANSI)
- [ ] エフェクト表現

##### 7.2 エラーハンドリング
- [ ] 不正入力への対応
- [ ] セーブデータ破損対応
- [ ] エラーメッセージ改善

##### 7.3 パフォーマンス最適化
- [ ] 不要な再計算削減
- [ ] メモ化導入

##### 7.4 ドキュメント整備
- [ ] README.md 作成
- [ ] コメント追加

##### 7.5 最終テスト
- [ ] フルプレイテスト
- [ ] バグ修正
- [ ] エッジケースチェック

#### 完了条件
- [ ] 安定して動作
- [ ] UI が分かりやすい
- [ ] ドキュメントが揃っている

---

## 変更履歴

### 2025-12-21
- プロジェクト開始
- Phase 0 完了: 設計書・計画書作成
- **Phase 1 完了** ✅:
  - プロジェクト初期化: package.json, tsconfig.json, ディレクトリ構造
  - 型定義: Input.ts, GameState.ts, random.ts
  - 入力システム: inputSystem.ts (非同期キューイング)
  - 描画システム: render.ts (ASCII出力)
  - ゲームループ: gameLoop.ts (60fps制御)
  - デモ実装: main.ts (カーソル移動デモ)
  - ビルド成功、dist/ 生成完了

### 2025-12-26
- **Phase 2 完了** ✅:
  - 型定義: Entity.ts, CombatState.ts
  - グリッドシステム: grid.ts (A*パス探索)
  - エンティティ操作: entity.ts
  - タイムラインシステム: timeline.ts (Timeline + AP)
  - 戦闘ロジック: combat.ts
  - 戦闘描画: formatters.ts
  - ゲームループのジェネリック化 (RunnableState)
  - タイムライン蓄積の100停止機能
  - エンティティ位置重複防止機能
  - 固定幅フォーマット表示 (HP/ゲージ)
  - 1vs1 戦闘デモ動作確認

### 2025-12-27
- **Phase 3 完了** ✅:
  - 型定義: Dungeon.ts (Room, Floor, Dungeon 型定義)
  - 部屋生成: room.ts (createRoom, addNextRooms)
  - グラフ生成: graph.ts (レベルベース6段階グラフ構造)
  - ダンジョン生成: dungeon.ts (フロア生成、ダンジョン初期化)
  - ナビゲーション: navigation.ts (部屋遷移ロジック)
  - 描画システム拡張: formatters.ts (ダンジョンマップ表示)
  - ゲームループ拡張: AppState に clearScreen 追加
  - ダンジョングラフ可視化デモ (main.ts)
  - レベルスキップ機能 (50%確率、選択肢2以下の部屋から1箇所)
  - 回復部屋の制限 (フロア内1つまで)
  - 特殊部屋配置 (Elite, Horde, Rest)
  - パラメータ整理 (不要なパラメータ削除)

### 2025-12-28 (午前)
- **Phase 4 完了** ✅:
  - 型定義: Items.ts (EffectType, Treasure, Trophy, Reward, PlayerInventory, AggregatedEffects)
  - 効果システム: effects.ts (aggregateEffects, hasEffect, getEffectLevel)
    - MutableAggregatedEffects 型定義（-readonly マッピング）
  - トレジャーシステム: treasure.ts
    - TREASURE_POOL（Common/Rare/Epic メジャーレリック、消耗品）
    - MINOR_RELIC_TEMPLATES（マイナーレリック）
    - generateTreasure（インベントリ考慮の生成）
  - 報酬システム: rewards.ts (generateRoomReward, addRewardToInventory, createEmptyInventory)
  - 部屋報酬統合: room.ts に createRoomWithReward 追加
  - 遅延フロア生成:
    - Dungeon 型を単一フロア保持に変更（totalFloors, currentFloorNumber, currentFloor, options）
    - generateDungeon（初期状態のみ）、generateFloor（インベントリ考慮）、advanceToNextFloor、startDungeon
    - navigation.ts を currentFloor 対応に変更
    - graph.ts に inventory パラメータ追加
  - TypeScript 設定更新: ES2023, ESNext.Iterator 追加（Iterator Helpers 使用可能）
  - 報酬描画: formatters.ts
    - renderRewardInfo（報酬詳細表示）
    - renderDungeonNav 更新（報酬情報統合）
    - getRaritySymbol, formatEffect
  - 動作確認デモ: main.ts（Phase 4 報酬システムデモ）
    - 部屋選択（1-9キー）、報酬詳細表示
    - 報酬獲得とインベントリ管理（Enterキー）
    - インベントリ考慮のフロア生成確認
    - リセット機能（Spaceキー）
  - 既存コードの API 更新（main.ts, formatters.ts, navigation.ts）
- **Phase 5 完了** ✅:
  - 型定義: MetaProgress.ts
    - UnlockConditionType (always, firstClear, bossKill, clearCount, floorReached, treasureCollected)
    - UnlockCondition, TrophyUnlock, TreasureUnlock
    - GameStats (総プレイ回数、総クリア回数、最大フロア到達、ボス撃破、トレジャー獲得履歴)
    - MetaProgress（プレイ間で永続化されるデータ）
    - UnlockDefinition（マスターデータ定義）
  - メタ進行システム: meta.ts
    - createInitialMetaProgress（初期データ生成）
    - checkUnlockCondition（条件チェック）
    - unlockTrophy/unlockTreasure（アンロック処理）
    - processUnlocks（一括アンロック処理）
    - recordRunStart/recordClear/recordBossKill/recordTreasureCollected（統計記録）
    - isTrophyUnlocked/isTreasureUnlocked（アンロック状態確認）
  - セーブ/ロードシステム: save.ts
    - saves/meta.json への JSON 保存
    - 初回起動時の初期データ生成
    - バージョン管理
  - アンロック定義: unlocks.ts, data/unlocks.json
    - 初期トレジャー（always条件）
    - トロフィー（firstClear, clearCount条件）
    - JSONファイルからの読み込みとフォールバック
  - メタ進行描画: formatters.ts
    - renderMetaProgress（統計とアンロック数表示）
  - ゲームループ改善: gameLoop.ts
    - runGameLoop の戻り値を Promise<T> に変更（最終状態を返す）
  - デモ実装: main.ts（Phase 5 メタプログレッションデモ）
    - メタ進行データの読み込みと保存
    - メタ進行画面の表示（ENTER でラン開始、Q で終了）
    - ラン記録、クリア記録、アンロック処理

### 2025-12-28 (午後)
- **Phase 6 部分完了** （デモレベル）:
  - ボス定義: data/bosses.json
    - 3体のボス（Dragon Lord, Shadow Assassin, Arcane Golem）
    - 各ボス固有のレリック装備
  - ボスシステム:
    - Entity 型拡張（equippedRelics, 'boss' AI タイプ, isBoss フラグ）
    - bosses.ts（JSON 読み込み、ボス生成）
  - レリック効果統合:
    - aggregateEntityEffects()（エンティティ装備効果集計）
    - damageEntity() レリック対応（クリティカル、ライフスティール、軽減、DoT、デバフ）
    - calculateLifesteal(), healEntity()
    - executeAction() にライフスティール処理追加
  - ボス AI:
    - decideBossAction()（HP 低下時の後退戦略）
    - findRetreatPosition()（脅威から遠ざかる位置探索）
  - Phase 6 デモ: main.ts
    - ボス選択 UI（矢印キー選択、Enter 確定）
    - プレイヤー初期装備（Hero Sword, Hero Armor, Swift Boots）
    - 戦闘中の装備表示
    - 勝利/敗北後の R キーリスタート
  - 入力システム改善:
    - inputSystem.ts: cleanup に stdin.pause() 追加
    - main.ts: ゲーム終了時に process.exit(0) 追加
    - Q キー終了機能の修正完了

---

## メモ・課題

### Phase 2 で解決した技術課題
- ゲームループの型を `GameState` から `RunnableState` にジェネリック化し、任意の状態構造に対応
- タイムラインゲージが100を超えて蓄積し続ける問題を修正 (100到達時に蓄積停止)
- エンティティが同じ位置に重なる問題を修正 (移動時の衝突判定追加)
- HP/ゲージ表示で桁数が減った際の表示崩れを修正 (固定幅パディング)

### Phase 3 で実装した主要機能
- **レベルベースグラフ生成**: 6レベル構造（レベル1: スタート1部屋 → レベル2-4: 拡大 → レベル5: 収束1-3部屋 → レベル6: ボス1部屋）
- **ラグビーボール型グラフ**: 中央（レベル3-4）が最大6部屋まで広がり、両端が狭い形状
- **レベルスキップ機能**: レベル4以前の選択肢2以下の部屋から50%確率で1箇所、次々レベルへの接続を追加
- **回復部屋制限**: フロア内に1つまで（連続回復を防止）
- **関数型スタイル**: filter, flatMap を使った候補選択、不要なループや配列組み立てを排除

### Phase 3 で解決した技術課題
- グラフ構造の再設計: depth ベースから level ベースへの変更
- 到達可能性の保証: レベルレイアウトベースの接続生成により全部屋到達可能を実現
- ループ防止: 前方向（次レベル）への接続のみに制限
- パス長分析の修正: BFSとDFSの重複実装を削除、DFSのみでエッジ数計算
- 画面クリア管理: AppState に clearScreen フラグ追加、ダンジョン再生成時の画面クリア実装

### Phase 4 で実装した主要機能
- **アイテム型システム**:
  - Treasure（メジャーレリック・マイナーレリック・消耗品）
  - Trophy（メタプログレッション用、未実装）
  - EffectValue（効果の値とレベル）
  - AggregatedEffects（効果の集計結果）
- **効果システム**:
  - 15種類の効果タイプ（ステータス増強、攻撃強化、防御強化、デバフ）
  - インベントリから効果を自動集計
  - -readonly マッピングによる mutable 型生成
- **トレジャー生成**:
  - インベントリを考慮した生成ロジック
  - マイナーレリックは既存効果がある場合のみ出現
  - レアリティ（Common/Rare/Epic）
- **遅延フロア生成**:
  - 現在のフロアのみをメモリに保持
  - インベントリを考慮してフロアを動的生成
  - 後戻りがないため効率的
- **Iterator Helpers**:
  - ES2023 の Iterator.prototype.filter/toArray を活用
  - Map.values().filter().toArray() パターン

### Phase 4 で解決した技術課題
- **readonly プロパティへの代入問題**: `-readonly` マッピングによる MutableAggregatedEffects 型定義
- **遅延フロア生成の設計**: 全フロア保持から単一フロア保持へ変更、メモリ効率向上
- **インベントリ依存の報酬生成**: フロア生成時にインベントリを渡すことで、マイナーレリックの出現条件を実現
- **TypeScript Iterator Helpers**: ES2023 + ESNext.Iterator の設定で最新 API を使用可能に
- **API 移行**: Dungeon 型変更に伴う既存コード（navigation.ts, formatters.ts, main.ts）の更新

### Phase 5 で実装した主要機能
- **メタプログレッションシステム**:
  - プレイ間で永続化されるゲーム統計（プレイ回数、クリア回数、最大フロア到達など）
  - トロフィーとトレジャーのアンロックシステム
  - 柔軟なアンロック条件（always, firstClear, bossKill, clearCount, floorReached, treasureCollected）
- **セーブ/ロードシステム**:
  - JSON ファイルベースの永続化（saves/meta.json）
  - 初回起動時の自動初期化
  - バージョン管理による将来の拡張性
- **アンロック定義の外部化**:
  - data/unlocks.json によるマスターデータ管理
  - フォールバック機能（ファイルが無い場合のデフォルト定義）
- **統計追跡**:
  - ラン開始、クリア、ボス撃破、トレジャー獲得の記録
  - アンロック条件の自動チェックと処理

### Phase 5 で解決した技術課題
- **ゲームループの戻り値問題**: runGameLoop を Promise<void> から Promise<T> に変更し、最終状態を返すように改善
- **メタデータの設計**: プレイごとのデータ（Treasure）とメタデータ（Trophy）の明確な分離
- **条件チェックの拡張性**: switch-case による条件タイプごとの分岐で、新しい条件タイプの追加が容易
- **JSON ベースのマスターデータ**: 外部ファイルによるアンロック定義で、コードを変更せずにアンロック要素を追加可能

### Phase 6 で実装した主要機能
- **ボス定義システム**:
  - JSON ベースのボス定義（data/bosses.json）
  - 各ボス固有のレリック装備
  - 高いステータス（HP, 攻撃力, 防御力）
- **レリック効果統合**:
  - エンティティの装備レリック効果集計（aggregateEntityEffects）
  - ダメージ計算への効果反映（クリティカル、ライフスティール、軽減、DoT、デバフ）
  - ライフスティール処理の実装
- **ボス AI**:
  - HP 低下時の後退戦略
  - 脅威から遠ざかる位置探索
- **Phase 6 デモ**:
  - ボス選択 UI
  - プレイヤー初期装備システム
  - 装備表示機能

### Phase 6 で解決した技術課題
- **Entity へのレリック装備**: equippedRelics フィールドを追加し、Entity 型を拡張
- **効果集計の統合**: aggregateEffects（インベントリ用）と aggregateEntityEffects（エンティティ用）の2系統実装
- **レリック効果のダメージ計算統合**: damageEntity を完全に書き換え、すべてのレリック効果を反映
- **入力システムのクリーンアップ**: stdin.pause() と process.exit() を追加し、Q キー終了時に確実にシェルに戻るように修正

### 今後の拡張案
- Web UI への移植 (Vue.js/React)
- マルチプレイヤー対応
- モバイル対応
- セーブ/ロード機能の強化

---

## 次のアクション

1. Phase 6 の残りタスク
   - ゲームバランスの調整（敵ステータス、アイテム効果、タイムライン速度、AP コスト）
   - テストプレイとバランス調整
   - 1プレイ 30〜40分の調整
2. Phase 7 の準備
   - UI 改善の検討（色付け、レイアウト改善）
   - エラーハンドリングの強化
   - ドキュメント整備

---

_このファイルは各フェーズの進捗に応じて更新されます_
