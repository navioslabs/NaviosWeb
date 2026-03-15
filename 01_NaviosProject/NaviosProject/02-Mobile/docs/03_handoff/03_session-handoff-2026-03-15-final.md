# Session Handoff (2026-03-15, final)

## Goal
次担当者が、追加調査なしで実装を継続できる状態にする。

---

## セッション全体のサマリー

このセッションでは**21項目の機能改善 + 15項目の品質改善 + 地図統合 + コード整理**を実施。

---

## 実装済み機能一覧

### カテゴリ・基盤
- カテゴリ名正式化（物資/イベント/近助/行政）
- デザイントークン統一（`constants/design.ts`）
- Colors拡張（teal/orange/purple追加）
- CategoryDetailCardハードコード色排除

### 画面改修
- **Nearby**: フローティングプレビューカード + 地図コンポーネント隔離
- **Pulse**: ヘッダー削除、検索下部フローティング、ティール系カラー
- **タイムライン**: SectionList（最新/盛り上がり/過去の人気）、オレンジテーマ
- **マイページ**: ヒーローヘッダー、アバター画像アップロード、ユーザー名編集、統計バー
- **投稿作成**: 3ステップ化、時刻ピッカー、位置情報手動フォールバック
- **投稿詳細**: いいね永続化、コメント自動読み込み、投稿終了/削除、ハプティック
- **認証**: 全テキスト日本語化、インラインバリデーション

### UI品質
- スケルトンローダー（タイムライン/プロフィール）
- PostCardレスポンシブ幅（画面幅42%）
- ハプティックフィードバック（いいね/コメント/シェア）

### 地図（方針変更）
- `components/map/MapView.tsx` に地図を隔離
- **地図表示**: MapTiler（ベクタータイル）に移行予定
- **場所検索**: Google Places API に移行予定
- 現在の `react-native-maps` 実装は置き換え対象

---

## コード整理（削除したもの）

### ファイル削除
| ファイル | 理由 |
|---------|------|
| `App.tsx` | Expo Router移行前のレガシー |
| `lib/mockData.ts` | 全画面から参照なし |
| `components/common/BottomTabBar.tsx` | Expo Routerに統合済み |

### パッケージ削除
| パッケージ | 理由 |
|-----------|------|
| `@maplibre/maplibre-react-native` | ネイティブ初期化でクラッシュ。不採用 |
| `@turf/length` | maplibreの依存。不要に |
| `react-native-webview` | react-native-mapsに移行 |
| `react-dom` | React Nativeでは不使用 |
| `expo-linking` | 未使用 |
| `@react-navigation/bottom-tabs` | expo-routerに統合 |

---

## 現在のパッケージ構成

```
@expo/vector-icons
@react-native-async-storage/async-storage
@react-navigation/native
@supabase/supabase-js
expo / expo-dev-client / expo-router / expo-status-bar
expo-haptics / expo-image-manipulator / expo-image-picker / expo-location
react / react-native
react-native-maps / react-native-safe-area-context / react-native-screens
```

## 現在のファイル構成

```
app/                     11画面
components/              9コンポーネント（map/含む）
hooks/                   4 hooks
lib/                     4サービス
constants/               3定数ファイル
types/                   1型定義
metro.config.js          Metro設定
```

---

## 地図実装の手順（次担当者向け）

### 技術選定
| 用途 | サービス | 理由 |
|------|---------|------|
| 地図表示 | **MapTiler** | ベクタータイル、カスタムスタイル、無料枠あり |
| 場所検索 | **Google Places API** | オートコンプリート、日本語対応が強力 |

### 1. MapTiler セットアップ
1. [MapTiler Cloud](https://cloud.maptiler.com/) でアカウント作成
2. APIキーを取得
3. `.env` に追加: `EXPO_PUBLIC_MAPTILER_API_KEY=YOUR_KEY`
4. `components/map/MapView.tsx` を MapLibre GL JS + MapTiler タイルURL で書き換え

### 2. Google Places セットアップ
1. Google Cloud Console で **Places API** を有効化
2. APIキーを取得（制限: Places API のみ）
3. `.env` に追加: `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_KEY`
4. 投稿作成フォーム（`app/post/create.tsx`）に場所検索オートコンプリートを組み込み

### 3. 実装方針
- MapView.tsx: MapLibre GL JS (WebView) or `@maplibre/maplibre-react-native` でMapTilerタイルを描画
- 検索: Google Places Autocomplete API を `lib/` に追加
- APIキー未設定時は現在のプレースホルダーにフォールバック

---

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
CREATE POLICY "いいねは誰でも読める" ON post_likes FOR SELECT USING (true);
CREATE POLICY "自分のいいねを追加できる" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "自分のいいねを削除できる" ON post_likes FOR DELETE USING (auth.uid() = user_id);
```

Supabase Storage: `avatars` バケット（Public）の作成も必要。

---

## Next Steps

1. **MapTiler地図表示の実装** — MapView.tsx をMapTilerベースに書き換え
2. **Google Places検索の実装** — 投稿作成時の場所検索オートコンプリート
3. **実機回帰テスト** — 全画面の動作確認
4. **コメント楽観更新** — 送信後の即時反映
5. **`create.tsx` 分割** — 1,406行→サブコンポーネント化
