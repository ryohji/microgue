// セーブ/ロードシステム: メタ進行データの永続化

import * as fs from 'fs';
import * as path from 'path';
import type { MetaProgress } from '../types/MetaProgress.js';
import { createInitialMetaProgress } from './meta.js';

// セーブファイルのパス
const SAVE_DIR = 'saves';
const SAVE_FILE = 'meta.json';

// セーブディレクトリのパスを取得
function getSaveDir(): string {
  return path.join(process.cwd(), SAVE_DIR);
}

// セーブファイルのパスを取得
function getSavePath(): string {
  return path.join(getSaveDir(), SAVE_FILE);
}

// セーブディレクトリを作成（存在しない場合）
function ensureSaveDir(): void {
  const saveDir = getSaveDir();
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }
}

// メタ進行データをJSONファイルに保存
export function saveMetaProgress(meta: MetaProgress): void {
  try {
    ensureSaveDir();
    const savePath = getSavePath();
    const json = JSON.stringify(meta, null, 2);
    fs.writeFileSync(savePath, json, 'utf-8');
  } catch (error) {
    console.error('Failed to save meta progress:', error);
    throw error;
  }
}

// メタ進行データをJSONファイルから読み込み
export function loadMetaProgress(): MetaProgress {
  try {
    const savePath = getSavePath();

    // セーブファイルが存在しない場合は初期データを返す
    if (!fs.existsSync(savePath)) {
      return createInitialMetaProgress();
    }

    const json = fs.readFileSync(savePath, 'utf-8');
    const data = JSON.parse(json) as MetaProgress;

    // バージョンチェック（将来的なマイグレーション用）
    if (data.version !== 1) {
      console.warn(`Unknown save data version: ${data.version}. Using initial data.`);
      return createInitialMetaProgress();
    }

    return data;
  } catch (error) {
    console.error('Failed to load meta progress:', error);
    console.log('Using initial meta progress data.');
    return createInitialMetaProgress();
  }
}

// セーブファイルが存在するかチェック
export function hasSaveFile(): boolean {
  return fs.existsSync(getSavePath());
}

// セーブファイルを削除（デバッグ用）
export function deleteSaveFile(): void {
  try {
    const savePath = getSavePath();
    if (fs.existsSync(savePath)) {
      fs.unlinkSync(savePath);
    }
  } catch (error) {
    console.error('Failed to delete save file:', error);
    throw error;
  }
}
