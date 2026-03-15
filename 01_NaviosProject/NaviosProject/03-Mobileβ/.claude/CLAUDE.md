# NaviOs 03-Mobileβ — CLAUDE.md

## プロジェクト概要

NaviOs 03-Mobileβ は、02-Mobile（地域情報共有アプリ）の最小リビルド版。
同一 Supabase バックエンドを共有しつつ、テスト基盤付きでゼロから構築された読み取り専用アプリ。

## 技術スタック

- **Expo 55** + React Native 0.83 + React 19.2
- **TypeScript 5.9** (strict mode)
- **Supabase JS** — 認証 + DB
- **Expo Router** — ファイルベースルーティング
- **Jest + jest-expo + @testing-library/react-native** — テスト

## スコープ

**含む**: Feed（投稿一覧）、My（プロフィール）、ログイン認証
**含まない**: 投稿作成、Talk、Map、AI検索、コメント、いいね、画像アップロード、新規登録

## ディレクトリ構成

```
03-Mobileβ/
├── app/                    # Expo Router 画面
│   ├── _layout.tsx         # Root Stack + 認証ガード
│   ├── (tabs)/
│   │   ├── _layout.tsx     # 2タブ: Feed + My
│   │   ├── index.tsx       # Feed画面
│   │   └── profile.tsx     # My画面
│   └── auth/login.tsx      # ログイン画面
├── components/
│   ├── PostListItem.tsx    # 投稿行コンポーネント
│   └── UserAvatar.tsx      # アバター表示
├── constants/
│   ├── colors.ts           # カラーパレット
│   ├── design.ts           # デザイントークン
│   └── categories.ts       # カテゴリ定義
├── hooks/
│   ├── useAuth.ts          # 認証状態管理
│   └── usePosts.ts         # 投稿取得
├── lib/
│   ├── supabase.ts         # Supabase クライアント
│   ├── auth.ts             # signIn / signOut
│   ├── postService.ts      # fetchPosts（読み取り専用）
│   └── utils.ts            # ユーティリティ
├── types/index.ts          # 型定義
├── __tests__/              # テスト
└── docs/                   # 設計ドキュメント
```

## コマンド

ビルド・デプロイ・start は **PowerShell** から実行する。
WSL側で `npm install` した node_modules がある場合は、PowerShell側で再度 `npm install` すること。

```powershell
npm install          # 依存関係インストール（PowerShellで実行）
npm test             # テスト実行
npm run typecheck    # 型チェック (tsc --noEmit)
npm run test:coverage # カバレッジ付きテスト
npx expo start       # 開発サーバー起動
```

## 環境変数

`.env` ファイルに以下を設定（`.env.example` を参照）:

```
EXPO_PUBLIC_SUPABASE_URL=https://xkndguwbizgohfdjoisf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## アーキテクチャ

```
Screen → Hook → Service → Supabase
```

- **Screen** (app/): UI表示とユーザー操作
- **Hook** (hooks/): 状態管理とデータフェッチ
- **Service** (lib/): Supabase クエリ実行
- **Supabase**: PostgreSQL + Auth

## テスト方針

- **jest-expo ~55.0.0** プリセット使用
- **モック**: Supabase client, AsyncStorage, expo-router, @expo/vector-icons
- **対象**: lib/, hooks/, components/
- **テストファイル**: 4ファイル、33テスト

## カテゴリ

| ID | ラベル | カラー |
|----|--------|--------|
| stock | 物資 | #10B981 |
| event | イベント | #F59E0B |
| help | 近助 | #F43F5E |
| admin | 行政 | #8B5CF6 |

## 02-Mobile との関係

- 同じ Supabase プロジェクトを共有
- constants/, types/, lib/supabase.ts, hooks/useAuth.ts は 02-Mobile から流用
- postService.ts は fetchPosts のみ（読み取り専用サブセット）
- 5タブ → 2タブ（Feed + My）に簡略化

## コーディング規約

- TypeScript strict mode
- 関数コンポーネント + hooks パターン
- StyleSheet.create でスタイル定義
- Ionicons でアイコン表示
- 日本語 UI テキスト
- 変数名・関数名はcamelCase
- コンポーネントはPascalCase
- 1ファイル1コンポーネント

## Supabase テーブル構造（参照のみ）

- `users` — id, display_name, avatar, verified, email, phone
- `posts` — id, category, title, content, author_id, place_id, location, allow_comments, is_ended, created_at, expires_at
- `places` — id, name, address, latitude, longitude
- `post_details` — post_id + カテゴリ別詳細フィールド
- `post_images` — post_id, image_url, display_order
- `comments` — id, post_id, author_id, content, can_help, created_at

## 拡張時の注意

新機能追加時は以下の順序で実装:
1. `types/` に型を追加
2. `lib/` にサービス関数を追加
3. `hooks/` にカスタムフックを追加
4. `components/` にUIコンポーネントを追加
5. `app/` に画面を追加
6. `__tests__/` にテストを追加
