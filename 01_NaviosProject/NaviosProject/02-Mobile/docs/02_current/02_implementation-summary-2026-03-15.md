# 実装サマリー（2026-03-15 最終更新）

## 全体進捗

| 機能 | 状態 |
|------|------|
| 認証（ログイン/登録/ログアウト） | 完了 |
| 認証ガード | 完了 |
| 投稿データ取得 | Supabase化済み |
| Nearby投稿（RPC） | 完了 |
| 地図表示 | WebView + MapLibre GL JS（CDN） |
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
| デザインシステム | constants/design.ts作成、Colors拡張 |

## 地図実装（方針変更: 2026-03-15）
- **地図表示**: MapTiler（ベクタータイル）
  - MapTiler SDK または MapLibre GL JS + MapTiler タイルURL で描画
  - 要 MapTiler APIキー（`EXPO_PUBLIC_MAPTILER_API_KEY`）
- **場所検索**: Google Places API
  - 投稿作成時の場所入力・オートコンプリートに使用
  - 要 Google Places APIキー（`EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`）
- **コンポーネント**: `components/map/MapView.tsx`（要リファクタ）
- **移行元**: react-native-maps（Google Maps）→ MapTiler + Google Places へ切り替え予定

## ファイル構成（31ファイル）

```
app/                    11画面
components/             9コンポーネント（map/含む）
hooks/                  4 hooks
lib/                    4サービス
constants/              3定数ファイル
types/                  1型定義
```

## クリーンアップ済み（削除したもの）
- `lib/mockData.ts` — 未使用モックデータ
- `components/common/BottomTabBar.tsx` — Expo Router統合により不要
- `App.tsx` — Expo Router移行前のレガシーファイル
- `@maplibre/maplibre-react-native` — ネイティブ版は不安定、WebView方式に移行
- `@turf/length` — maplibreネイティブの依存、不要に
- `react-dom` — React Nativeでは不使用
- `expo-linking` — 未使用
- `@react-navigation/bottom-tabs` — expo-routerに統合済み

## 既知の注意点
- 地図はMapTiler + Google Places方式に移行予定（実装はこれから）
- `app/post/create.tsx` が1,406行。将来的にステップごとの分割を検討

## 推奨の次タスク
1. **MapTiler地図表示の実装** — MapView.tsx をMapTiler SDK/MapLibre GL JSベースに書き換え
2. **Google Places検索の実装** — 投稿作成時の場所検索オートコンプリート
3. 実機で全画面の回帰テスト
4. コメント楽観更新
5. `create.tsx` のコンポーネント分割
