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

## Phase 1: コアループ (基盤構築)

### 目的
60fps ゲームループと入力システムの基盤を構築し、動作を確認する。

### 実装内容

#### 1.1 プロジェクト初期化
- [ ] ディレクトリ構造作成
- [ ] package.json 作成
  - TypeScript 設定
  - seedrandom 依存追加
- [ ] tsconfig.json 作成
  - strict mode 有効化
  - ES2020 ターゲット
- [ ] .gitignore 作成

#### 1.2 型定義
- [ ] `src/types/Input.ts`: KeyPress 型
- [ ] `src/types/GameState.ts`: 最小限のゲーム状態
- [ ] `src/core/random.ts`: RandomGenerator 型定義

#### 1.3 入力システム
- [ ] `src/input/inputSystem.ts`
  - createInputSystem() 実装
  - readline によるキー入力収集
  - キューイング機構

#### 1.4 描画システム
- [ ] `src/rendering/render.ts`
  - renderScreen() 実装
  - console.clear() による画面クリア
  - 文字列配列の出力

#### 1.5 ゲームループ
- [ ] `src/core/gameLoop.ts`
  - 60fps 制御
  - deltaTime 計算
  - 入力・更新・描画の統合

#### 1.6 動作確認デモ
- [ ] `src/main.ts`
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

## Phase 2: 基本戦闘システム

### 目的
グリッドベースの戦術戦闘の基礎を実装する。

### 実装内容

#### 2.1 型定義
- [ ] `src/types/Entity.ts`
  - Position, Stats
  - Entity, Player, Enemy
- [ ] `src/types/CombatState.ts`
  - Grid, CombatState
  - Action 定義

#### 2.2 グリッドシステム
- [ ] `src/combat/grid.ts`
  - createGrid(): グリッド生成
  - isValidPosition(): 位置チェック
  - getDistance(): 距離計算
  - findPath(): パス探索 (A*)

#### 2.3 エンティティ操作
- [ ] `src/combat/entity.ts`
  - createPlayer(): プレイヤー生成
  - createEnemy(): 敵生成
  - moveEntity(): エンティティ移動
  - damageEntity(): ダメージ適用

#### 2.4 タイムラインシステム
- [ ] `src/combat/timeline.ts`
  - accumulateTimeline(): ゲージ蓄積
  - consumeActionPoints(): AP 消費
  - getNextActor(): 次の行動者決定

#### 2.5 戦闘更新ロジック
- [ ] `src/combat/combat.ts`
  - initCombat(): 戦闘開始
  - updateCombat(): 戦闘状態更新
  - executeAction(): アクション実行

#### 2.6 戦闘描画
- [ ] `src/rendering/formatters.ts`
  - renderCombat(): 戦闘画面の文字列生成
  - renderTimeline(): タイムラインゲージ表示
  - renderEntityInfo(): エンティティ情報表示

#### 2.7 動作確認デモ
- [ ] 5x5 グリッド
- [ ] プレイヤー (P) vs 敵 1体 (E)
- [ ] 矢印キーで移動
- [ ] スペースキーで攻撃
- [ ] タイムラインゲージの可視化

### 成果物
- グリッド上での移動・攻撃
- タイムラインによるターン制御
- 簡易的な 1vs1 戦闘

### 完了条件
- プレイヤーが敵を倒せる
- 敵のシンプルな AI (接近して攻撃)
- タイムラインゲージが正しく動作

---

## Phase 3: ダンジョンシステム

### 目的
部屋の分岐構造とダンジョン探索を実装する。

### 実装内容

#### 3.1 型定義
- [ ] `src/types/Dungeon.ts`
  - Room, Floor, Dungeon
  - RoomType 定義

#### 3.2 部屋生成
- [ ] `src/world/room.ts`
  - createRoom(): 部屋生成
  - generateEnemies(): 敵配置
  - 部屋タイプ別のパラメータ

#### 3.3 グラフ構造
- [ ] `src/world/graph.ts`
  - createRoomGraph(): 分岐グラフ生成
  - 1部屋あたり 1〜3 の次の部屋
  - ボス部屋への到達保証

#### 3.4 ダンジョン生成
- [ ] `src/world/dungeon.ts`
  - generateFloor(): フロア生成
  - generateDungeon(): ダンジョン全体生成
  - 3〜5 階層、各階 20 部屋前後

#### 3.5 ナビゲーション
- [ ] `src/core/update.ts` に追加
  - updateDungeonNav(): 部屋選択処理
  - 次の部屋への遷移
  - 戦闘フェーズへの切り替え

#### 3.6 ダンジョン描画
- [ ] `src/rendering/formatters.ts` に追加
  - renderDungeonNav(): 部屋選択画面
  - 現在位置と選択肢の表示
  - クリア状況の可視化

#### 3.7 動作確認デモ
- [ ] 簡易的な 1階層ダンジョン
- [ ] 3部屋 + ボス部屋
- [ ] 部屋選択 → 戦闘 → 次の部屋選択

### 成果物
- 分岐するダンジョン構造
- 部屋間の遷移
- ダンジョンナビゲーション UI

### 完了条件
- 部屋選択が機能する
- 戦闘とナビゲーションの切り替えが正しい
- ボス部屋までたどり着ける

---

## Phase 4: アイテム・成長システム

### 目的
トロフィー・トレジャーとキャラクター成長を実装する。

### 実装内容

#### 4.1 型定義
- [ ] `src/types/Items.ts`
  - Trophy, Treasure
  - PassiveEffect, SpecialEffect
  - Equipment

#### 4.2 トロフィーシステム
- [ ] `src/items/trophy.ts`
  - applyTrophyEffect(): 効果適用
  - パッシブ効果の種類実装
    - ステータスボーナス
    - 速度倍率
    - AP 軽減

#### 4.3 トレジャーシステム
- [ ] `src/items/treasure.ts`
  - equipTreasure(): 装備
  - unequipTreasure(): 装備解除
  - calculateEquipmentStats(): 装備込みステータス

#### 4.4 報酬システム
- [ ] `src/core/update.ts` に追加
  - updateReward(): 報酬選択処理
  - トロフィー選択
  - トレジャー選択

#### 4.5 マスターデータ
- [ ] `data/trophies.json`: トロフィーマスターデータ
- [ ] `data/treasures.json`: トレジャーマスターデータ
- [ ] データ読み込み処理

#### 4.6 報酬描画
- [ ] `src/rendering/formatters.ts` に追加
  - renderReward(): 報酬選択画面
  - アイテム情報の表示

#### 4.7 動作確認デモ
- [ ] 戦闘後にトロフィー選択
- [ ] ボス撃破後にトレジャー選択
- [ ] 効果が次の戦闘に反映される

### 成果物
- トロフィー・トレジャーシステム
- 報酬選択 UI
- キャラクター成長の実感

### 完了条件
- アイテム取得が機能する
- 効果が正しく適用される
- プレイヤーが強化される実感がある

---

## Phase 5: メタプログレッション

### 目的
プレイ間でのアンロック要素と進行データの保存を実装する。

### 実装内容

#### 5.1 型定義
- [ ] `src/types/MetaProgress.ts`
  - MetaProgress
  - UnlockCondition

#### 5.2 アンロックシステム
- [ ] `src/progression/meta.ts`
  - checkUnlocks(): 解放条件チェック
  - unlockTrophy(): トロフィー解放
  - unlockTreasure(): トレジャー解放

#### 5.3 保存システム
- [ ] `src/progression/save.ts`
  - saveMetaProgress(): JSON 保存
  - loadMetaProgress(): JSON 読み込み
  - saves/meta.json への書き込み

#### 5.4 初期化処理
- [ ] `src/main.ts` 修正
  - 起動時にメタ進行データ読み込み
  - 終了時に保存

#### 5.5 アンロック条件定義
- [ ] `data/unlocks.json`: アンロック条件マスターデータ
  - 初回クリアで解放
  - 特定ボス撃破で解放
  - クリア回数で解放

#### 5.6 動作確認デモ
- [ ] 初回プレイでは限られたアイテムのみ
- [ ] クリア後、新しいアイテムが解放される
- [ ] 再起動してもアンロック状態が保持される

### 成果物
- メタプログレッションシステム
- プレイ間での進行保存
- アンロック要素

### 完了条件
- セーブデータが正しく保存・読み込みされる
- アンロック条件が機能する
- プレイを重ねるごとに選択肢が増える

---

## Phase 6: ボス戦・バランス調整

### 目的
ボス戦を実装し、ゲーム全体のバランスを調整する。

### 実装内容

#### 6.1 ボス定義
- [ ] `data/enemies.json` にボスデータ追加
  - 高いステータス
  - 特殊な行動パターン

#### 6.2 ボス AI
- [ ] `src/combat/ai.ts` 拡張
  - ボス専用の行動ロジック
  - 複数のスキル使用
  - フェーズ変化

#### 6.3 特殊スキル
- [ ] `src/combat/actions.ts` 拡張
  - 範囲攻撃
  - バフ/デバフ
  - 特殊効果

#### 6.4 バランス調整
- [ ] 敵のステータス調整
- [ ] アイテム効果の調整
- [ ] タイムラインゲージの速度調整
- [ ] AP コストの調整

#### 6.5 テストプレイ
- [ ] 1プレイ 30〜40分になるか確認
- [ ] 難易度曲線のチェック
- [ ] アイテムバランスのチェック

### 成果物
- ボス戦システム
- バランス調整済みのゲーム
- プレイアブルな完成品

### 完了条件
- ボス戦が楽しい
- 難易度が適切
- 1プレイの時間が目標範囲内

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

Phase 1 の実装を開始します。
詳細な進捗は PROGRESS.md で管理します。
