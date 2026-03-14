# 実装サマリー（2026-03-15 最終更新）

## 全体進捗

| 機能 | 状態 |
|------|------|
| 認証（ログイン/登録/ログアウト） | 完了 |
| 認証ガード | 完了 |
| 投稿データ取得 | Supabase化済み |
| Nearby投稿（RPC） | 完了 |
| 投稿詳細/コメント | read/write完了 |
| いいね | post_likes永続化完了 |
| 投稿作成 | 3ステップ式、画像アップ対応 |
| 投稿管理（終了/削除） | 完了 |
| マイページ | ヒーロー型UI、アバター編集、ユーザー名編集 |
| Pulse | AI検索、ティール系テーマ |
| タイムライン | セクション表示、オレンジ系テーマ |
| 画像最適化 | optimizeImage（投稿800px/アバター400px） |
| スケルトンローダー | タイムライン/プロフィールに適用 |
| ハプティック | いいね/コメント/シェアに適用 |
| 認証画面日本語化 | 完了 + インラインバリデーション |
| デザインシステム | constants/design.ts作成、Colors拡張 |

## 今セッションの変更一覧

### Phase 1: 基盤修正
1. カテゴリ名正式化（物資/イベント/近助/行政）
2. Nearbyフローティングプレビューカード

### Phase 2: 4画面同時改修
3. マイページ — アバター画像化 + ユーザー名編集
4. 投稿画面 — モダンUI + 時刻ピッカー
5. Pulse — ヘッダー削除、検索ボックス下部、ティールカラー
6. 検索→タイムライン — セクション別表示、オレンジテーマ

### Phase 3: 品質向上（15項目一括改修）
7. デザイントークン統一（`constants/design.ts`）
8. Colors拡張（teal/orange/purple追加）
9. CategoryDetailCardハードコード排除
10. Pulseカラー定数化
11. 認証画面 全テキスト日本語化
12. 認証画面 インラインバリデーション
13. スケルトンローダー（コンポーネント作成 + 適用）
14. PostCardレスポンシブ幅
15. いいね永続化（`post_likes`テーブル）
16. コメント自動ページネーション
17. ハプティックフィードバック
18. 投稿の終了/削除機能
19. 投稿作成ステップ化（3ステップ）
20. 位置情報手動入力フォールバック

### Phase 4: UI仕上げ
21. マイページ全面リニューアル（ヒーローヘッダー、統計バー、メニュー形式）

## ファイル構成（32ファイル）

```
app/                    11画面
components/             9コンポーネント
hooks/                  4 hooks
lib/                    5サービス（mockData含む）
constants/              3定数ファイル
types/                  1型定義
```

## 未使用ファイル
- `lib/mockData.ts` — 全画面からの import なし。参照用として残存
- `components/common/BottomTabBar.tsx` — Expo Router統合により不要

## 既知の注意点
- `node` / `npm` / `npx` が実行環境にないため、型チェック/実機テストは未実行
- MapLibre本接続は未完（地図はプレースホルダー）
- `app/post/create.tsx` が1,406行。将来的にステップごとの分割を検討

## 追加インストールが必要
```bash
npx expo install expo-haptics expo-image-manipulator
```

## DB追加が必要
```sql
CREATE TABLE post_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
```
Supabase Storage: `avatars` バケット（Public）の作成も必要。
