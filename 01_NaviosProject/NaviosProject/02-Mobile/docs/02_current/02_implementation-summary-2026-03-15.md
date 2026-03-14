# 実装サマリー（2026-03-15 更新）

## 進捗概要
- 認証（ログイン/新規登録/ログアウト）: 実装済み
- ルート認証ガード: 実装済み
- 投稿データ取得（通常）: Supabase化済み
- Nearby投稿取得: `get_nearby_posts` RPC 接続済み
- 投稿詳細: Supabase read 接続済み
- コメント: read/write 接続済み
- 投稿作成: `posts` + `post_details` + `post_images` 接続済み
- マイページ: Supabase化済み + アバター画像/ユーザー名編集対応
- Pulse: ティール系カラー、検索ボックス下部配置、ヘッダー削除
- タイムライン: 旧検索画面を全投稿時系列表示に変更

## 今回の更新（2026-03-15）

### カテゴリ名正式化
- `constants/categories.ts`: `特売`→`物資`、`助け合い`→`近助`、`自治会`→`行政`

### Nearby画面
- フローティングプレビューカード追加（ピンタップ→スライドイン）

### マイページ (`app/(tabs)/profile.tsx`)
- アバターを画像URL対応に（`UserAvatar` コンポーネント更新）
- アバタータップ → ImagePicker → Supabase Storage `avatars` にアップロード
- カメラアイコンオーバーレイ表示
- ユーザー名のインライン編集（鉛筆アイコン → TextInput → 保存/キャンセル）

### 投稿画面 (`app/post/create.tsx`)
- UI全面リニューアル: カテゴリ2x2グリッド、セクションディバイダー、入力欄の余白拡大
- ヘッダー改善: 閉じるボタン円形、「新規投稿」中央、送信ボタンにアイコン追加
- 画像プレビュー 100x100 に拡大
- 時刻ピッカーモーダル追加（時:0-23 / 分:00-55 のスクロール式）

### Pulse画面 (`app/(tabs)/index.tsx`)
- ヘッダー完全削除
- 検索ボックスを画面下部にフローティング配置（チャット入力風）
- 候補表示を横スクロールのコンパクトチップに変更
- カラー: 紫(#7C3AED) → ティール(#0D9488)

### 検索→タイムライン (`app/(tabs)/search.tsx`)
- 検索機能を完全削除
- 全投稿を新着順に時系列表示（FlatList + pull-to-refresh）
- カテゴリフィルターチップ（横スクロール）
- タブアイコン/ラベル: `search` → `time-outline` / `タイムライン`

### 画像最適化 (`lib/postService.ts`)
- `optimizeImage()` 関数追加（`expo-image-manipulator`）
- 投稿画像: max 800px, quality 0.7
- アバター: max 400px, quality 0.7

## 既知の注意点
- `node` / `npm` / `npx` が実行環境にないため、型チェック/実機テストは未実行
- `MapLibre` 本接続は未完（地図はプレースホルダー）
- `expo-image-manipulator` のインストールが必要: `npx expo install expo-image-manipulator`

## 推奨の次タスク
1. **MapLibre 本接続**（実座標ピン描画）→ フローティングカードとの連動を検証
2. 実機で全画面の回帰テスト（認証・投稿作成・画像アップロード・アバター編集）
3. コメントのページングと楽観更新の改善
