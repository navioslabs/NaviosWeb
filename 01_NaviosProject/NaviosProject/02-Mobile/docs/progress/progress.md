# Progress

最終更新: 2026-03-08

## 全体進捗

- 基盤整理: 完了
- ディレクトリ再編: 完了
- ドキュメント集約: 完了
- UI実装（mock移植）: 進行中
- Expo Router本実装: 未着手
- Supabase本接続: 一部（雛形のみ）

## 完了したこと

### 基盤・構成
- mobile/ の既存実装をベースに NaviOs/ を新規作成
- 予定構成に沿って画面を再配置
  - app/(tabs)/index.tsx（Pulse）
  - app/(tabs)/nearby.tsx（近く）
  - app/(tabs)/search.tsx（検索）
  - app/(tabs)/profile.tsx（マイページ）
  - app/post/[id].tsx（投稿詳細）
- 追加作成
  - app/post/create.tsx
  - app/auth/login.tsx
  - app/auth/register.tsx
  - lib/supabase.ts / lib/auth.ts
  - hooks/useAuth.ts / hooks/usePosts.ts / hooks/useLocation.ts
- App.tsx の import を新構成へ更新
- 旧 mobile/ ディレクトリ削除

### ドキュメント整理
- 重複ファイルを統合（NaviOs/docs/CLAUDE.md, mock.jsx を削除）
- dev/ ルートを正規配置に統一
- CLAUDE.md にコーディングルール・ファイル管理ルールを追記

### UI実装（mock.jsx → React Native 移植）
- `app/post/create.tsx`: 投稿作成画面をフル実装
  - カテゴリ選択（4種）
  - カテゴリ別フィールド（stock / event / help / admin）
  - 写真選択・タイトル・詳細・場所・コメント設定・投稿のコツ
  - ✕ボタンで前画面に戻る（onClose 接続）
- `components/common/BottomTabBar.tsx`: Ionicons アイコン追加
  - flash / map / search / person（アクティブ・非アクティブ切り替え）
  - 中央投稿ボタンを add アイコンに変更
  - TAB_ITEMS 定数で管理、重複ハードコード廃止
- `app/(tabs)/index.tsx`: Pulse 画面アイコン刷新 + アニメーション
  - 左上アイコン: ⚡絵文字 → Ionicons "flash"
  - 検索ボタン: 🔍絵文字 → Ionicons "sparkles"
  - 中央アイコン: 絵文字 → Ionicons "flash" + パルスアニメーション
    - usePulseAnimation カスタムフック（scale + opacity ループ）
    - iconWrapper（110×110）内に pulseRing（absoluteFill）+ aiIconBox（80×80）を重ねて中央揃え

## 残タスク

### 高優先
- `@expo/vector-icons` インストール（Ionicons 使用のため必須）
  ```bash
  cd /home/zer0/dev/NaviOs && npx expo install @expo/vector-icons
  ```
- 近く画面の地図プレースホルダーを MapLibre 実装へ置換

### 中優先
- Expo Router へ完全移行（app/_layout.tsx + Tabs/Stack）
- auth/login / auth/register を Supabase Auth 実装に置換
- lib/mockData.ts 依存を API + hooks ベースへ段階移行

### 低優先
- 投稿一覧・詳細・検索のデータ取得を Supabase 連携化
- テスト・Lint・型チェック導入
