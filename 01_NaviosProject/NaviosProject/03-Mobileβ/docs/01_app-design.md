# 01 アプリ設計書 — NaviOs 03-Mobileβ

## 目的

02-Mobile の最小リビルド版として、全レイヤー（Router → Hooks → Services → Supabase）を通す読み取り専用アプリを構築する。

## 画面構成

### 1. Feed画面 (`app/(tabs)/index.tsx`)
- 投稿一覧を FlatList で表示
- Pull-to-refresh で再読み込み
- 空状態・エラー状態の表示
- 各投稿は PostListItem コンポーネントで表示

### 2. My画面 (`app/(tabs)/profile.tsx`)
- 未ログイン: ログインボタン表示
- ログイン済み: プロフィール情報（アバター、名前、メール）+ ログアウトボタン
- Supabase users テーブルからプロフィール取得

### 3. ログイン画面 (`app/auth/login.tsx`)
- メールアドレス + パスワード入力
- バリデーション + エラー表示
- ログイン成功時に (tabs) へリダイレクト

## ナビゲーション

```
RootLayout (Stack)
├── (tabs) (Tabs)
│   ├── index → Feed
│   └── profile → My
└── auth/login → ログイン
```

## データフロー

```
FeedScreen → usePosts() → fetchPosts() → supabase.from('posts').select(...)
ProfileScreen → useAuth() → supabase.auth.getSession()
LoginScreen → signIn() → supabase.auth.signInWithPassword()
```

## カテゴリシステム

4カテゴリ: 物資(stock), イベント(event), 近助(help), 行政(admin)
各カテゴリにカラー、アイコン、有効期限ロジックが定義されている。
