# Changelog

最終更新: 2026-03-09

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
