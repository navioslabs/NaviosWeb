# 02 アーキテクチャ — NaviOs 03-Mobileβ

## レイヤー構成

```
┌─────────────────────────────────────┐
│  Screen Layer (app/)                │  UI + ユーザー操作
├─────────────────────────────────────┤
│  Hook Layer (hooks/)                │  状態管理 + データフェッチ
├─────────────────────────────────────┤
│  Service Layer (lib/)               │  ビジネスロジック + API呼び出し
├─────────────────────────────────────┤
│  Supabase Client (lib/supabase.ts)  │  HTTP クライアント + Auth
├─────────────────────────────────────┤
│  Supabase Backend                   │  PostgreSQL + Auth + Storage
└─────────────────────────────────────┘
```

## 各レイヤーの責務

### Screen Layer
- Expo Router によるファイルベースルーティング
- React コンポーネントで UI を描画
- Hook を呼び出してデータを取得・表示
- ユーザー操作をハンドル

### Hook Layer
- `useAuth`: 認証セッション管理（getSession + onAuthStateChange）
- `usePosts`: 投稿データのフェッチ・キャッシュ・リフレッシュ
- useState/useEffect/useCallback で状態管理

### Service Layer
- `auth.ts`: signIn, signOut（Supabase Auth ラッパー）
- `postService.ts`: fetchPosts + 行マッピング（DB行 → Post型）
- `utils.ts`: formatDistance, getWalkTime, getExpiryLabel

### Supabase Client
- AsyncStorage でセッション永続化
- 自動トークンリフレッシュ
- 環境変数未設定時のフォールバック

## 認証フロー

```
1. アプリ起動 → useAuth() → getSession()
2. セッションなし → 画面表示（未認証状態で閲覧可能）
3. ログインボタン → auth/login → signIn() → onAuthStateChange → セッション設定
4. ログアウト → signOut() → onAuthStateChange → セッションクリア
```

## データマッピング

Supabase の JOIN クエリ結果を TypeScript の Post 型にマッピング:

```
posts + users (author) + places + post_details + post_images + comments(count)
→ Post { id, category, title, content, author: User, place: Place, ... }
```

## 02-Mobile との共有

| ファイル | 共有方式 |
|---------|---------|
| lib/supabase.ts | そのままコピー |
| hooks/useAuth.ts | そのままコピー |
| constants/* | そのままコピー |
| types/index.ts | サブセット（Post, User, Place, PostDetails） |
| lib/postService.ts | fetchPosts のみ（読み取り専用） |
