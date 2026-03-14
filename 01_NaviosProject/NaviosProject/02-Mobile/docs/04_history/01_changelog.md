# Changelog

最終更新: 2026-03-15

## 2026-03-15 - 全21項目の一括改修（カテゴリ・UI・品質・デザインシステム）

### Phase 1: 基盤修正
- カテゴリ名正式化（物資/イベント/近助/行政）
- Nearbyフローティングプレビューカード

### Phase 2: 4画面同時改修
- マイページ: アバター画像化 + ユーザー名編集
- 投稿画面: モダンUI + 時刻ピッカー
- Pulse: ヘッダー削除、検索下部移動、ティール系カラー
- 検索→タイムライン: SectionList + 3フィルタータブ + オレンジテーマ

### Phase 3: 品質向上（15項目一括）
- `constants/design.ts` 作成（デザイントークン統一）
- `constants/colors.ts` 拡張（teal/orange/purple）
- CategoryDetailCardハードコード色排除
- Pulseカラー定数化
- 認証画面 全テキスト日本語化 + インラインバリデーション
- `SkeletonLoader.tsx` 新規作成 + タイムライン/プロフィールに適用
- PostCard レスポンシブ幅（176px → 画面幅42%）
- いいね永続化（`post_likes` テーブル + `toggleLike`/`checkUserLiked`）
- コメント自動ページネーション（スクロール末尾で自動読み込み）
- ハプティックフィードバック（いいね/コメント/シェア）
- 投稿の終了/削除（著者に「...」メニュー）
- 投稿作成3ステップ化 + ステップインジケーター
- 位置情報手動入力フォールバック

### Phase 4: UI仕上げ
- マイページ全面リニューアル（ヒーロー/統計バー/メニュー形式）

### ドキュメント・規約
- CLAUDE.md にコード規約を追加（命名/スタイル/カラー/デザイントークン）
- 全ドキュメント最終更新

---

## 2026-03-15（旧記録） - カテゴリ名正式化 + Nearbyフローティングカード + 4画面同時改修

### カテゴリ名変更
- `constants/categories.ts` のラベルを正式名称に修正
  - `特売` → `物資`、`助け合い` → `近助`、`自治会` → `行政`

### Nearbyフローティングプレビューカード
- `app/(tabs)/nearby.tsx` にピン選択時のフローティングカードを追加
  - ピンタップ → スプリングスライドイン / 別ピン → 切替 / 空白タップ → 消去
- MapLibre未統合のためダミーピンでの動作

### マイページ改修
- `components/common/UserAvatar.tsx`: URL画像対応（`http`で始まる場合Image表示）
- `app/(tabs)/profile.tsx`:
  - アバタータップ → ImagePicker → Supabase Storage `avatars` にアップロード
  - カメラアイコンオーバーレイ表示
  - ユーザー名インライン編集（鉛筆アイコン → TextInput → 保存/キャンセル）

### 投稿画面モダンUI
- `app/post/create.tsx`:
  - カテゴリ選択を2x2グリッド化
  - セクション間ディバイダー（カード入れ子→フラット構造）
  - ヘッダー改善（円形閉じる / 中央タイトル / 送信アイコン付き）
  - 画像プレビュー100x100に拡大
  - 時刻入力をスクロール式ピッカーモーダルに変更（時0-23 / 分00-55）

### Pulse画面改修
- `app/(tabs)/index.tsx`:
  - ヘッダー完全削除
  - 検索ボックスを画面最下部にフローティング配置
  - 候補表示を横スクロールのコンパクトチップに
  - カラー: 紫(#7C3AED) → ティール(#0D9488)

### 検索→タイムライン変換
- `app/(tabs)/search.tsx`: 検索機能を削除、全投稿を新着順表示（FlatList + pull-to-refresh + カテゴリフィルター）
- `app/(tabs)/_layout.tsx`: タブラベル `検索`→`タイムライン`、アイコン `search`→`time`

### 画像最適化
- `lib/postService.ts`: `optimizeImage()` 関数追加（`expo-image-manipulator`使用）
  - 投稿画像: max 800px, quality 0.7
  - アバター: max 400px, quality 0.7
- 要インストール: `npx expo install expo-image-manipulator`

## 2026-03-14 - docs folder reclassification
- Added numbered documentation folders:
  - `docs/01_spec`
  - `docs/02_current`
  - `docs/03_handoff`
  - `docs/04_history`
- Copied current active docs into the new categorized structure.
- Added `docs/progress/README_legacy.md` to mark old `progress` folder as legacy.

## 2026-03-14 - Documentation / workspace cleanup
- Added `docs/README.md` as docs entry point.
- Added `docs/progress/implementation-summary-2026-03-14.md`.
- Added `docs/progress/code-structure.md`.
- Updated handoff doc to include read-first links.
- Updated `.gitignore` to ignore local temp/workspace files:
  - `*.code-workspace`
  - `app/_tmp_write_test.txt`

## 2026-03-14 - Nearby RPC + post/comment + create insert
### Nearby (RPC)
- `hooks/useNearbyPosts.ts` を追加
  - `get_nearby_posts` RPC を呼び出し
  - RPCの `id` 順を維持して投稿詳細を補完
- `app/(tabs)/nearby.tsx`
  - `MOCK_POSTS/usePosts` 主導から `useNearbyPosts` 主導へ切替
  - 読み込み中表示・取得エラー表示を追加

### Post detail + comments read/write
- `lib/postService.ts` を追加
  - `fetchPostById`
  - `fetchCommentsByPostId`
  - `createComment`
- `app/post/[id].tsx`
  - モック依存を削除して Supabase 読み込みへ切替
  - コメント送信を `comments` insert に接続

### Create post insert
- `app/post/create.tsx` を Supabase insert 接続へ更新
  - `createPost` を呼び出し
  - `posts` insert + `post_details` insert
  - 送信中ロック・失敗時アラートを追加

## 2026-03-14 - P0/P1 execution update
### P0
- `app/(tabs)/profile.tsx`
  - ログアウトボタンを `signOut()` に接続
  - 送信中の多重押下防止（`submittingLogout`）
  - 失敗時 `Alert` を表示

### P1 (start)
- `hooks/usePosts.ts`
  - `lib/mockData.ts` 依存を削除
  - Supabase `posts` 取得へ移行
  - `users` / `places` / `post_details` / `post_images` / `comments` を join
  - アプリの `Post` 型にマッピング
- `app/(tabs)/nearby.tsx`
  - `MOCK_POSTS` 依存を削除
  - `usePosts()` から投稿を取得
  - fetch error 表示を追加

### Validation note
- この作業環境では `node`/`npm`/`npx` が利用できず、`expo` の実行確認は未実施。

## 2026-03-14 — Supabase 認証接続（Phase 2 開始）

### 環境設定
- `.env` 作成: `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` を設定
- `.gitignore` に `.env` を追加（誤コミット防止）
- `@supabase/supabase-js` インストール（`--legacy-peer-deps` で peer 依存競合を回避）

### `lib/supabase.ts` — React Native 向け設定
- `AsyncStorage` をセッションストレージに指定（`@react-native-async-storage/async-storage`）
- `detectSessionInUrl: false` 設定（React Native では URL からセッションを検出しない）
- `autoRefreshToken: true` / `persistSession: true` で再起動後もログイン維持

### `hooks/useAuth.ts` — Auth 操作関数を追加
- `signIn(email, password)` — `supabase.auth.signInWithPassword()` でログイン
- `signUp(email, password, displayName)` — `supabase.auth.signUp()` + `public.users` テーブルへ INSERT
  - `avatar` フィールドは `displayName.charAt(0)` で自動設定
- `signOut()` — `supabase.auth.signOut()` でログアウト

### `app/_layout.tsx` — 認証ガード追加
- `RootLayoutNav` コンポーネントに分離（`useRouter` / `useSegments` の利用に対応）
- `useAuth` でセッション監視 → 未ログイン時は `/auth/login` へ自動リダイレクト
- ログイン済みで auth グループにいる場合は `/(tabs)` へリダイレクト
- `loading` 中は白背景の `ActivityIndicator` を表示（無限スピナー対策）

### `app/auth/login.tsx` — Supabase signIn 接続
- `useAuth().signIn()` を呼び出し
- `submitting` state でボタンを非活性化 + `ActivityIndicator` 表示
- エラー時は `Alert` でメッセージ表示

### `app/auth/register.tsx` — Supabase signUp 接続
- `useAuth().signUp()` を呼び出し
- `submitting` state でボタンを非活性化 + `ActivityIndicator` 表示
- エラー時は `Alert` でメッセージ表示

### Supabase ダッシュボード側で必要な設定
```sql
-- public.users RLS ポリシー
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分自身を登録できる"
ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "ユーザーは自分のデータを読める"
ON public.users FOR SELECT USING (auth.uid() = id);
```
- `Authentication → Providers → Email → Confirm email` をオフ（MVP用・即時ログイン）

---

## 2026-03-09 — Expo Router 完全移行

### 設定ファイル
- `package.json`: `main` を `"expo-router/entry"` に変更、依存に `"expo-router": "~5.0.0"` 追加
- `app.json`: `scheme: "navios"`, `plugins: ["expo-router"]`, `web: { bundler: "metro" }` 追加

### ルートレイアウト新設 (`app/_layout.tsx`)
- `SafeAreaProvider` + `StatusBar` でラップ
- `Stack` に5画面を宣言:
  - `(tabs)`: `headerShown: false`
  - `post/[id]`: `slide_from_right` アニメーション
  - `post/create`: `modal` プレゼンテーション
  - `auth/login` / `auth/register`: `headerShown: false`

### タブレイアウト新設 (`app/(tabs)/_layout.tsx`)
- カスタム `tabBar` でボトムタブバーを描画
  - 左2タブ（Pulse・近く）/ 中央投稿ボタン / 右2タブ（検索・マイページ）の5分割
  - 中央ボタン: `router.push('/post/create')`
  - `TAB_ITEMS` 定数 + `TabButton` コンポーネントで管理

### 全画面: ナビゲーション Props 削除 → `useRouter()` 置換
- `app/(tabs)/index.tsx`: `onPostPress` prop を削除、`router.push('/post/${post.id}')`
- `app/(tabs)/nearby.tsx`: `onPostPress` 削除、`useLocalSearchParams()` でカテゴリ初期値受け取り
- `app/(tabs)/search.tsx`: `onPostPress`/`onCategorySelect` 削除、`router.push()` に統一
- `app/post/[id].tsx`: `post: Post`/`onBack` 削除 → `useLocalSearchParams({ id })` + `MOCK_POSTS.find()`
- `app/post/create.tsx`: `onClose` 削除 → `router.back()`
- `app/auth/login.tsx`: `onGoRegister`/`onLoginSuccess` → `router.push('/auth/register')` / `router.replace('/(tabs)')`
- `app/auth/register.tsx`: `onGoLogin`/`onRegisterSuccess` → `router.back()` / `router.replace('/(tabs)')`

### 不要になったファイル
- `App.tsx`: 画面ルーティングの中央管理が不要に（削除可）
- `BottomTabBar.tsx`: `_layout.tsx` 内の `CustomTabBar` に統合（削除可）

### 次回起動前に必要な作業
```bash
cd Mobile
npx expo install expo-router
```

---

## 2026-03-09 — Phase 1 UI 完成

### アイコン・UI修正
- Pulse 検索ボタン: `sparkles` → `search`（mock.jsx 準拠）
- 近助カテゴリアイコン: `people-outline` → `hand-left-outline`
- CategoryFilter: 各チップにカテゴリアイコン追加（getCategoryIconName 使用）
- PostCard: カテゴリドット → アイコン付き角丸ボックス（categoryIconBox）
- PostListItem: カテゴリアイコン追加

### Nearby 画面 UI改善
- ボトムシートアニメーション: height → translateY（useNativeDriver: true）に変更
  - SHEET_TRANSLATE 定数 (closed / half / full) で translateY 値を管理
  - animateSheet() ヘルパー関数で状態遷移を統一
- 現在地マーカー: 青いパルスアニメーション追加
  - pingScale (1→2.4) + pingOpacity (0.7→0) のループ
  - locationDot（32×32 青丸 + navigate アイコン）
- 地図ピン: カテゴリ別カラー・アイコン・緊急バッジ・選択状態の太ボーダー
- overflow: hidden 削除 → 横スクロール ScrollView が正常動作

### 投稿残り時間表示
- lib/utils.ts: getExpiryLabel(post: Post): string | null 追加
  - stock: stockDuration に応じたラベル（今日中 / 残り48h / 残り3日 / 残り1週間 / 手動終了）
  - event: eventDate + eventTime を結合
  - help: 残り48h（固定）
  - admin: 〆 + deadline
- PostCard: タイトル下に time-outline アイコン + カテゴリカラーラベル
- PostListItem: メタ行末尾に · time-outline アイコン + カテゴリカラーラベル

### 投稿詳細 いいね・シェアボタン
- app/post/[id].tsx にエンゲージメント行を追加（著者行と場所カードの間）
  - いいね: heart / heart-outline アイコン + カウント + scale アニメーション (1→1.4→1)
  - コメント数: 表示のみ
  - シェア: Share.share() でOSネイティブシェートを呼び出し
- ヘッダーの share-social-outline ボタンも handleShare に接続
- types/index.ts: Post に likeCount?: number 追加
- lib/mockData.ts: 全8投稿に likeCount 設定

### 検索画面 キーワード検索
- app/(tabs)/search.tsx 全面書き換え
  - query state + クリアボタン（×）付き検索入力
  - isSearching フラグで表示を切り替え
  - calcMatchScore で全 MOCK_POSTS をスコアリング → 降順ソート → PostListItem 表示
  - TrendItem / PastHotItem: TouchableOpacity でラップ → handleTrendPress でカテゴリ一致投稿の詳細へ
- App.tsx: SearchScreen に onPostPress を追加

### 認証画面 UI実装
- app/auth/login.tsx: フル実装
  - NaviOs ロゴ（緑丸 + location アイコン）+ タイトル + タグライン
  - メールアドレス・パスワード入力（パスワード表示切替）
  - パスワードを忘れた場合リンク
  - ログインボタン（プライマリカラー・シャドウ）
  - 新規登録へのリンク
- app/auth/register.tsx: フル実装
  - 表示名・メールアドレス・パスワード（8文字バリデーション + リアルタイムヒント）
  - 利用規約・プライバシーポリシー表示
  - アカウント作成ボタン
  - ログインへのリンク

---

## 2026-03-08 Chat 5

### バグ修正
- 投稿ボタン押下で真っ白になる問題を修正
  - App.tsx に `view === 'post'` の条件分岐と `<CreatePostScreen>` のレンダリングを追加
- ✕ボタンで前画面に戻れない問題を修正
  - App.tsx の `<CreatePostScreen onClose={() => setView(activeTab)} />` を接続

### UI実装
- `app/post/create.tsx`: mock.jsx の投稿作成画面をフル実装
  - カテゴリ選択（stock / event / help / admin）
  - カテゴリ別追加フィールド（価格・在庫・日時・参加費・お礼など）
  - 場所セクション・コメントトグル・投稿のコツ
  - バリデーション（タイトル必須）・投稿完了 Alert

### ドキュメント整理
- 重複ファイルを統合・削除
- CLAUDE.md にコーディングルール・ファイル管理ルール追記

### コンポーネント改善
- `BottomTabBar.tsx`: Ionicons アイコン追加、TAB_ITEMS 定数化
- `app/(tabs)/index.tsx`: Pulse 画面のアイコン・アニメーション刷新（usePulseAnimation）

---

## 2026-03-08 Chat 1〜4

- mobile/ → NaviOs/ → Mobile/ としてディレクトリ整備
- CLAUDE.md・mock.jsx を Mobile/ 直下に移動
- 予定構成に沿った画面ファイルの再配置
- GitHub (nextpresen/NaviosProject 01_NaviosProject/NaviosProject/02-Mobile) へプッシュ
- docs/progress/ 作成・progress.md・changelog.md 初版作成

---

## 2026-03-09 — 開発環境セットアップ・動作確認

### 問題解決: エミュレーター青くるくる（接続不可）
- **原因**: WSL上のMetroバンドラーにAndroidエミュレーター（Windows側）から届かない
- **解決**:  を使用（ngrok経由でトンネル）
-  では解決しないことを確認

### 問題解決: npm install ERESSOLVEエラー
- **原因**:  後に  を実行するとpeer依存関係の競合
- **解決手順**:
  1. 
added 473 packages in 1m

41 packages are looking for funding
  run `npm fund` for details
  2. 
  3. 

### GitHub push 完了
- リポジトリ: 
- パス: 
- コミット: 

## 2026-03-14 - ドキュメント再整理
- `docs/` 配下の既存資料（`Navios-MVP-Phase1`, `progress.md`, `changelog.md`, `supabasedb.sql`）を棚卸し
- 直近の無限スピナー対策を反映した再計画ドキュメントを追加
  - `docs/progress/roadmap-refresh-2026-03-14.md`
- 今後の優先度を `P0/P1/P2` で再定義（認証安定化 -> Supabase実データ化 -> 地図/位置情報 -> 品質）

## 2026-03-14 - Auth stabilization and handoff prep
- Added auth guard routing in `app/_layout.tsx`
- Connected auth screens to Supabase (`signInWithPassword`, `signUp`, `users` upsert)
- Added loading/error-safe auth initialization in `hooks/useAuth.ts`
- Added handoff docs:
  - `docs/progress/roadmap-refresh-2026-03-14.md` (updated)
  - `docs/progress/session-handoff-2026-03-14.md`

## 2026-03-14 - Search/Pulse migration and post UX refresh
- Search (`app/(tabs)/search.tsx`) を Supabase データ利用へ移行
- Pulse (`app/(tabs)/index.tsx`) を Supabase データ利用へ移行
- 投稿画像導線を接続
  - `app/post/create.tsx` で画像選択
  - `lib/postService.ts` で Storage `images` アップロード
  - `post_images` insert
- 近くタブのホットカード崩れを修正（長いタイトルでも重なり回避）
- ログイン画面から `Community Info App` 文言を削除
- 投稿作成のplaceholderを日本語化
- 投稿日付入力をカレンダー式に変更
- 投稿完了ページ `app/post/success.tsx` を追加
- 主要UIの文字化けを修正
- テスト実行は環境制約（`node/npm/npx` 不在）で未完
