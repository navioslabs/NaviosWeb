# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**NaviOs（ナビオス）** - 半径1km限定の生活情報共有モバイルアプリ。
初期展開エリア: 鹿児島県日置市 伊集院町（人口約2万人）。
ターゲット: 地方の高齢者層（60代以上）・現役世代（30-50代）。

**現在のフェーズ:** `mock.jsx`（React + Tailwind CSS + lucide-react のWebプロトタイプ）を React Native Expo アプリに移植中。

---

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Expo (React Native) + TypeScript |
| 状態管理 | React Hooks + Context |
| 地図 | MapLibre GL (`@maplibre/maplibre-react-native`) + MapTiler |
| データベース | Supabase (PostgreSQL + PostGIS) |
| 認証 | Supabase Auth (JWT) |
| ストレージ | Supabase Storage（画像） |
| エッジ | Cloudflare Workers |
| AI（Phase2のみ） | Claude API (Haiku) |

---

## 開発コマンド

```bash
# Expoプロジェクト作成（初回のみ）
npx create-expo-app NaviOs --template blank-typescript

# 主要パッケージインストール
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install @supabase/supabase-js
npx expo install expo-location expo-image-picker
npx expo install react-native-safe-area-context react-native-screens
npx expo install @maplibre/maplibre-react-native

# 開発サーバー起動
npx expo start

# iOS/Android個別起動
npx expo start --ios
npx expo start --android

# EASビルド（リリース用）
eas build --platform all
```

---

## ディレクトリ構成（予定）

```
NaviOs/
├── app/                    # Expo Router
│   ├── (tabs)/
│   │   ├── index.tsx       # Pulse画面（ホーム）
│   │   ├── nearby.tsx      # 近く画面（地図）
│   │   ├── search.tsx      # 検索画面
│   │   └── profile.tsx     # マイページ
│   ├── post/
│   │   ├── create.tsx      # 投稿作成
│   │   └── [id].tsx        # 投稿詳細
│   └── auth/
│       ├── login.tsx
│       └── register.tsx
├── components/             # 再利用コンポーネント
├── lib/
│   ├── supabase.ts         # Supabaseクライアント
│   ├── auth.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   └── useLocation.ts
├── types/
│   └── index.ts
├── constants/
│   └── categories.ts       # カテゴリ定義（4種）
└── docs/                   # 設計ドキュメント
    └── Navios-MVP-Phase1   # 要件定義書（メインドキュメント）
```

---

## アーキテクチャ・設計方針

### 画面構成とルーティング

mock.jsx の `view` ステートによる画面切り替えを、Expo Router のファイルベースルーティングに置き換える。

| 画面 | mock.jsx の `view` 値 | Expo Router パス |
|------|----------------------|-----------------|
| Pulse（ホーム） | `pulse` | `/(tabs)/` |
| 近く（地図） | `main` | `/(tabs)/nearby` |
| 投稿詳細 | `detail` | `/post/[id]` |
| 投稿作成 | `post` | `/post/create` |
| 検索 | `search` | `/(tabs)/search` |
| マイページ | `profile` | `/(tabs)/profile` |

### カテゴリ定義（4種）

```typescript
// constants/categories.ts
export const CATEGORIES = [
  { id: 'stock', label: '物資', color: '#10B981' },   // emerald-500
  { id: 'event', label: 'イベント', color: '#F59E0B' }, // amber-500
  { id: 'help', label: '近助', color: '#F43F5E' },   // rose-500
  { id: 'admin', label: '行政', color: '#8B5CF6' },  // violet-500
];
```

カテゴリ別に投稿の期限ルールが異なる:
- `stock`: 投稿者選択（デフォルト48時間）
- `event`: 開催日の23:59まで
- `help`: 48時間（手動終了可）
- `admin`: 申請期限まで

### Supabase 接続

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
```

位置情報による投稿取得は `get_nearby_posts` RPCを使用（PostGIS の `ST_DWithin`）。

### 地図実装

`@maplibre/maplibre-react-native` + MapTilerを使用。Google Maps APIは**使用しない**（コスト0維持のため）。
ナビゲーション遷移は `Linking.openURL('google.maps://...')` で外部アプリに委ねる。

### 場所検索

Google Places APIは**使用しない**。優先順位:
1. 自前DB（`places`テーブル）
2. 国土地理院 API
3. OpenStreetMap
4. ユーザー手動入力

### 環境変数

```bash
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
EXPO_PUBLIC_MAPTILER_KEY=xxx
```

---

## コーディングルール

- **TypeScript必須**: `any` 型を使わない。`unknown` + 型ガードで代替する。
- **ファイル行数制限**: 画面ファイルは300行以内、コンポーネントは150行以内。超えたら分割する。
- **コンポーネント分離**: 複数箇所で使う・または単体で意味をなすUIは `components/` に切り出す。
- **定数の外出し**: マジックナンバー・文字列・設定値は `constants/` に定義する。
- **カスタムフック**: ロジックをUIから分離する場合は `hooks/` にカスタムフックを作る。
- **型定義**: Props・APIレスポンス・フォームデータなど共有する型は `types/` に定義する。
- **パフォーマンス最適化は後回し**: `useMemo`/`useCallback` はパフォーマンス問題が計測で確認されてから使う。現フェーズでは不要。
- **エラーハンドリング**: Supabase呼び出しは必ず `try/catch` し、失敗時はユーザーに `Alert` で通知する。
- **スタイル**: すべて `StyleSheet.create()` に書く。インラインスタイルは禁止。
- **デバッグログ禁止**: `console.log` をコードに残さない。
- **動作確認**: 変更後は必ずエミュレータで確認してから次に進む。
- **スパゲッティコード禁止**: 1関数1責務。ネストは3段階まで。条件分岐が増えたら関数に切り出す。
- **JSDoc必須**: すべての関数・コンポーネント・カスタムフックに JSDoc を書く。Props 型にも各フィールドの説明を付ける。

```ts
/**
 * 投稿一覧を取得するカスタムフック
 * @param radius 取得範囲（メートル）
 * @returns 投稿リストとローディング状態
 */
export function usePosts(radius: number) { ... }
```

---

## ファイル管理ルール

- **重複ファイルを作らない**: 既存ファイルを編集する。新規作成は本当に必要な場合のみ。
- **正規の場所**: 下記構成が唯一の正規配置。ここ以外に同名ファイルを作らない。
- **作業前に確認**: 同名・類似ファイルが既に存在しないか Glob/Grep で確認してから作業する。
- **`docs/` へのコピー禁止**: ルートにあるファイルを `NaviOs/docs/` に複製しない。

```
dev/
├── CLAUDE.md          ← プロジェクト設定（唯一）
├── mock.jsx           ← UI参照ファイル（唯一）
└── NaviOs/
    └── docs/
        ├── Navios-MVP-Phase1/   ← 要件定義書（唯一）
        └── progress/            ← 進捗記録（固有）
```

---

## Phase 1 対象外（後回し）

以下は実装しない:
- Pulse AI連携（Claude API）→ キーワードマッチングのモック検索で代替
- プッシュ通知
- 管理画面（Supabaseダッシュボードで代替）

---

## 参照ドキュメント

- `mock.jsx` - UIプロトタイプ（全画面の実装参考）
- `NaviOs/docs/Navios-MVP-Phase1` - 要件定義・DB設計・API設計・開発タスク詳細
- `NaviOs/docs/progress/` - 進捗記録（progress.md, changelog.md）

---

## 進捗サマリー（2026-03-09）

### Phase 1 UI 実装状況

| 画面・機能 | 状態 |
|---|---|
| Pulse（ホーム）画面 | ✅ 完成 |
| Nearby（地図・ボトムシート）画面 | ✅ 完成 |
| 検索画面（キーワード検索・トレンド遷移） | ✅ 完成 |
| マイページ | ✅ 完成 |
| 投稿詳細（いいね・シェア・コメント） | ✅ 完成 |
| 投稿作成フォーム（カテゴリ別） | ✅ 完成 |
| ログイン画面 UI | ✅ 完成（Supabase接続はPhase2） |
| 新規登録画面 UI | ✅ 完成（Supabase接続はPhase2） |
| BottomTabBar | ✅ 完成 |
| CategoryFilter（アイコン付き） | ✅ 完成 |
| PostCard（残り時間・カテゴリアイコン） | ✅ 完成 |
| PostListItem（残り時間・カテゴリアイコン） | ✅ 完成 |
| **Expo Router 移行** | ✅ 完成 |

### ルーティングアーキテクチャ（現状）

Expo Router v5 のファイルベースルーティングに完全移行済み。

```
app/
├── _layout.tsx          ← Root: SafeAreaProvider + StatusBar + Stack
├── (tabs)/
│   ├── _layout.tsx      ← Tabs: カスタムタブバー（中央投稿ボタン付き）
│   ├── index.tsx        ← Pulse画面
│   ├── nearby.tsx       ← 近く画面（地図）
│   ├── search.tsx       ← 検索画面
│   └── profile.tsx      ← マイページ
├── post/
│   ├── [id].tsx         ← 投稿詳細（useLocalSearchParams でID取得）
│   └── create.tsx       ← 投稿作成（modal）
└── auth/
    ├── login.tsx
    └── register.tsx
```

- 全画面でナビゲーション Props を廃止 → `useRouter()` / `useLocalSearchParams()` を使用
- `App.tsx` / `BottomTabBar.tsx` は死コード（削除可）

### 現在の状態

- **Phase 1 UI + Expo Router 移行はすべて実装完了**
- データはすべて `lib/mockData.ts` のモック（Supabase 接続は Phase 2）
- 地図は MapLibre プレースホルダー（実地図表示は Phase 2）
- 起動前に `npx expo install expo-router` が必要

### 次フェーズ候補（Phase 2）

- MapLibre GL による実地図表示（現在はプレースホルダー）
- `app/auth/` を Supabase Auth 実装に接続
- `lib/mockData.ts` 依存を `hooks/usePosts.ts` + Supabase API へ段階移行
- `hooks/useLocation.ts` の実装（expo-location）
- プッシュ通知（Phase 2）
- Claude API 連携 Pulse 検索（Phase 2）