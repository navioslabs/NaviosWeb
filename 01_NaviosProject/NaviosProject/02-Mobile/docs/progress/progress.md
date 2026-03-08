# Progress

最終更新: 2026-03-09

## 全体進捗

- 基盤整理: ✅ 完了
- ディレクトリ再編: ✅ 完了
- ドキュメント集約: ✅ 完了
- **Phase 1 UI実装（mock移植）: ✅ 完了**
- **Expo Router本実装: ✅ 完了**
- Supabase本接続: ⬜ 未着手（雛形のみ）

---

## 完了したこと

### 基盤・構成（2026-03-08）
- mobile/ の既存実装をベースに NaviOs/ → Mobile/ として再配置
- CLAUDE.md・mock.jsx を Mobile/ 直下に移動
- 予定構成に沿って画面を再配置
- App.tsx の import を新構成へ更新
- GitHub (nextpresen/NaviosProject) へプッシュ

### Phase 1 UI実装（2026-03-09）

#### アイコン・コンポーネント修正
- Pulse 検索ボタン: `sparkles` → `search`
- 近助カテゴリアイコン: `people-outline` → `hand-left-outline`
- CategoryFilter: 各チップにカテゴリアイコン追加
- PostCard: カテゴリドット → アイコン付き角丸ボックス
- PostListItem: カテゴリアイコン追加

#### Nearby 画面 (app/(tabs)/nearby.tsx)
- ボトムシートアニメーション: translateY + useNativeDriver: true (300ms)
- 現在地マーカー: 青いパルスアニメーション (scale + opacity ループ)
- 地図ピン: カテゴリ別カラー + アイコン + 緊急バッジ + 選択状態
- ボトムシート overflow: hidden 削除 → 横スクロール正常動作

#### 投稿詳細 (app/post/[id].tsx)
- エンゲージメント行追加（いいね / コメント数 / シェア）
- いいねボタン: ハートアニメーション (scale 1→1.4→1)、カウントトグル
- シェアボタン: Share.share() によるOSネイティブシェート

#### 残り時間表示 (lib/utils.ts + PostCard + PostListItem)
- `getExpiryLabel(post)` 追加（カテゴリ別: 今日中/残り48h/イベント日時/〆日など）
- PostCard: タイトル下にアイコン + カテゴリカラーラベル
- PostListItem: メタ行末尾にアイコン + カテゴリカラーラベル

#### 検索画面 (app/(tabs)/search.tsx)
- query state + クリアボタン（×）
- 検索中: calcMatchScore でフィルタリング → PostListItem でスコア付き表示
- 非検索時: トレンド / 過去の盛り上がり / カテゴリグリッド（変わらず）
- TrendItem / PastHotItem: TouchableOpacity でラップ → 詳細遷移

#### 認証画面 UI
- app/auth/login.tsx: NaviOs ロゴ + メール/パスワード + パスワード表示切替 + ログインボタン
- app/auth/register.tsx: 表示名/メール/パスワード + バリデーション + 利用規約表示

#### 型・データ更新
- types/index.ts: Post に `likeCount?: number` 追加
- lib/mockData.ts: 全8投稿に likeCount 設定

### Expo Router 移行（2026-03-09）
- `package.json` `main` を `"expo-router/entry"` に変更、`expo-router: ~5.0.0` 追加
- `app.json` に `scheme: "navios"`, `plugins: ["expo-router"]`, `web.bundler: "metro"` 追加
- `app/_layout.tsx` 新規作成（SafeAreaProvider + StatusBar + Stack）
- `app/(tabs)/_layout.tsx` 新規作成（カスタムタブバー + 中央投稿ボタン）
- 全画面から Props 型・ナビゲーションコールバックを削除し `useRouter()` に置換
  - `app/(tabs)/index.tsx`: `onPostPress` → `router.push('/post/${post.id}')`
  - `app/(tabs)/nearby.tsx`: `onPostPress` → `router.push()` + `useLocalSearchParams()` でカテゴリ受け取り
  - `app/(tabs)/search.tsx`: `onPostPress`/`onCategorySelect` → `router.push()`
  - `app/post/[id].tsx`: `post: Post` + `onBack` → `useLocalSearchParams()` + `MOCK_POSTS` lookup
  - `app/post/create.tsx`: `onClose` → `router.back()`
  - `app/auth/login.tsx`: `onGoRegister`/`onLoginSuccess` → `router.push()`/`router.replace()`
  - `app/auth/register.tsx`: `onGoLogin`/`onRegisterSuccess` → `router.back()`/`router.replace()`
- `App.tsx` / `BottomTabBar.tsx` は死コードに（削除可）

---

## 残タスク（Phase 2）

### 高優先
- MapLibre GL による実地図表示（現在はプレースホルダー）

### 中優先
- app/auth/ を Supabase Auth 実装に接続
- lib/mockData.ts 依存を Supabase API + hooks ベースへ段階移行
- hooks/usePosts.ts の実装（PostGIS get_nearby_posts RPC）
- hooks/useLocation.ts の実装（expo-location）

### 低優先
- プッシュ通知
- Claude API 連携 Pulse 検索
- テスト・Lint・型チェック導入
- 管理画面（Supabaseダッシュボードで代替予定）
