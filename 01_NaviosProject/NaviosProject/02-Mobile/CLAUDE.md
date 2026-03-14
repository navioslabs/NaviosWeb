# CLAUDE.md

NaviOs モバイルアプリのコーディングガイドラインおよびプロジェクト仕様。

---

## Project Overview

- **Name**: NaviOs — 地域情報共有アプリ
- **Stack**: Expo 55 + React Native 0.83 + TypeScript 5.9 + Expo Router
- **Backend**: Supabase (Auth, Postgres, PostGIS, Storage)
- **State Management**: Hooks + Supabase セッション（Redux/Context 不使用）

---

## Code Conventions

### ファイル構成ルール

| ディレクトリ | 責務 | ルール |
|---|---|---|
| `app/` | 画面・ルーティング | UI + インタラクション処理のみ。直接 Supabase を呼ばない |
| `components/` | 再利用 UI | API 呼び出し禁止。props で受け取り描画に専念 |
| `hooks/` | 横断状態・非同期取得 | 画面から呼ぶインターフェース。service を内部で使う |
| `lib/` | 外部サービス接続 | Supabase クエリ、認証、画像処理などの実装を集約 |
| `constants/` | 定数 | 色、カテゴリ、デザイントークン |
| `types/` | 型定義 | アプリ全体で共有する型 |

### 命名規則

- **ファイル名**: コンポーネント → `PascalCase.tsx`、それ以外 → `camelCase.ts`
- **コンポーネント**: `export default function ComponentName()` — default export
- **hooks**: `use` プレフィックス（`useAuth`, `usePosts`）
- **定数**: `UPPER_SNAKE_CASE`（`CATEGORIES`, `PIN_POSITIONS`）
- **型**: `PascalCase`（`Post`, `PostFormData`, `CategoryId`）
- **スタイル**: ファイル末尾に `const styles = StyleSheet.create({})` で定義

### デザイントークン（`constants/design.ts`）

新しいスタイルを書くときは以下の値を優先的に使うこと:

```
FontSize:  xs(10) sm(12) md(14) lg(16) xl(20) xxl(24)
Spacing:   xs(4) sm(8) md(12) lg(16) xl(24) xxl(32)
Radius:    sm(8) md(12) lg(16) xl(24) full(9999)
Duration:  fast(200) normal(300) slow(500)
Shadow:    sm / md / lg プリセット
```

### カラー（`constants/colors.ts`）

- **ハードコード禁止**: 色は必ず `Colors.xxx` または `getCategoryInfo().color` を使う
- 各画面のテーマカラー:
  - Pulse: `Colors.teal` (#0D9488)
  - Timeline: `Colors.orange` (#E97316)
  - Nearby: `Colors.primary` (#10B981)
  - Profile: `Colors.primary` (#10B981)
- `rgba()` のみ例外的にインラインで許可

### コーディングスタイル

- **1ファイル500行以内を目標**とする。超える場合はコンポーネント分割を検討
- **画面コンポーネント内のサブコンポーネント**は同ファイル内に定義してよい（`function StatItem()`等）
- **`Alert.alert` は操作系エラーのみ**使用。バリデーションはインラインエラー表示を優先
- **画像アップロード時は `optimizeImage()` を必ず使う**（投稿: 800px / アバター: 400px / quality: 0.7）
- **モックデータの再導入禁止** — `lib/mockData.ts` は参照用として残すが import しない
- **コメントは「なぜ」だけ書く**。「何をしているか」はコードで表現する
- **不要な import / 変数は即削除**。`_` prefix で残さない

---

## Architecture (as of 2026-03-15)

### Routing

```
app/
├── _layout.tsx              # Root stack + auth guard
├── (tabs)/
│   ├── _layout.tsx          # Tab bar (Pulse / 近く / + / タイムライン / マイページ)
│   ├── index.tsx            # Pulse (AI search, teal theme)
│   ├── nearby.tsx           # Nearby feed + map + floating card
│   ├── search.tsx           # Timeline (SectionList, orange theme)
│   └── profile.tsx          # Profile (hero header, avatar upload)
├── post/
│   ├── [id].tsx             # Post detail + comments + like + manage
│   ├── create.tsx           # 3-step create form + time picker
│   └── success.tsx          # Post success
└── auth/
    ├── login.tsx            # Login (Japanese)
    └── register.tsx         # Register (Japanese)
```

### Data Layer

```
lib/
├── supabase.ts       # Client (AsyncStorage session)
├── auth.ts           # signIn / signUp / signOut
├── postService.ts    # CRUD + RPC + image upload + optimizeImage
├── utils.ts          # formatDistance / calcMatchScore / getExpiryLabel
└── mockData.ts       # ⚠ 参照用のみ。import禁止
```

### Hooks

```
hooks/
├── useAuth.ts          # session / user / loading / error
├── usePosts.ts         # posts / loading / error / refetch
├── useNearbyPosts.ts   # RPC nearby + fallback
└── useLocation.ts      # coords / loading / error
```

### Components

```
components/
├── common/
│   ├── UserAvatar.tsx       # URL画像 or イニシャル文字
│   ├── CategoryBadge.tsx    # カテゴリラベル
│   ├── CategoryFilter.tsx   # 横スクロールフィルターチップ
│   ├── SkeletonLoader.tsx   # パルスアニメーション + プリセット
│   └── BottomTabBar.tsx     # ⚠ 未使用（レガシー）
└── post/
    ├── PostCard.tsx          # ホットカード (レスポンシブ幅)
    ├── PostListItem.tsx      # リスト行
    ├── CommentItem.tsx       # コメントバブル
    └── CategoryDetailCard.tsx # カテゴリ別詳細表示
```

### Categories

| ID | ラベル | カラー | アクション |
|---|---|---|---|
| `stock` | 物資 | #10B981 | 連絡する |
| `event` | イベント | #F59E0B | 参加する |
| `help` | 近助 | #F43F5E | 協力する |
| `admin` | 行政 | #8B5CF6 | 公式サイト |

---

## DB Expectations

### Tables
`users`, `posts`, `post_details`, `comments`, `places`, `post_images`, `post_likes`

### Storage Buckets
- `images` — 投稿画像
- `avatars` — ユーザーアバター

### RPC
`get_nearby_posts(user_lat, user_lng, radius_meters, category_filter)`

### Required ENV
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## Feature Status

### 完了 (P0/P1)
- [x] Auth guard + Login / Register / Logout
- [x] 全タブ Supabase 化（モックデータ依存ゼロ）
- [x] 投稿 CRUD（作成 3ステップ / 詳細表示 / 終了 / 削除）
- [x] コメント read/write + 自動ページネーション
- [x] いいね永続化（post_likes テーブル）
- [x] 画像アップロード + 最適化（投稿 / アバター）
- [x] Nearby: RPC + フローティングプレビューカード
- [x] Timeline: セクション別表示（最新/盛り上がり/過去の人気）
- [x] Profile: ヒーローヘッダー + アバター編集 + ユーザー名編集
- [x] Pulse: AI検索 + 底部フローティング入力
- [x] スケルトンローダー
- [x] ハプティックフィードバック
- [x] 認証画面 日本語化 + インラインバリデーション
- [x] デザイントークン統一

### 次の優先事項 (P2)
1. **MapLibre 統合** — プレースホルダーを実地図に置き換え
2. **実機回帰テスト** — 全画面の動作確認
3. **コメント楽観更新** — 送信後の即時反映改善

### 既知の課題
- `lib/mockData.ts` — 未使用だが残存。削除可
- `components/common/BottomTabBar.tsx` — 未使用（Expo Router に統合済み）
- `app/post/create.tsx` — 1,406行。将来的にステップごとのコンポーネント分割を検討
- MapLibre 未統合のため Nearby のピンはダミー座標

---

## Dependencies to Install (if fresh clone)

```bash
npx expo install expo-haptics expo-image-manipulator expo-image-picker
```
