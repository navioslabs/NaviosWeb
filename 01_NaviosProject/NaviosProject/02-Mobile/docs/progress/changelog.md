# Changelog

最終更新: 2026-03-08

## 2026-03-08 Chat 1

- 対象ファイルとディレクトリを調査
- NaviOs/ を新規作成し、予定構成に合わせて仕分け
- app/tabs/* を app/(tabs)/* へ移動
- app/post/DetailScreen.tsx を app/post/[id].tsx へ移動
- auth / hooks / lib の不足ファイルを追加
- docs/ に CLAUDE.md / mock.jsx / Navios-MVP-Phase1 を集約

## 2026-03-08 Chat 2

- CLAUDE.md に進捗をまとめて追記
- NaviOs/docs/CLAUDE.md に同期

## 2026-03-08 Chat 3

- ユーザー指示により /home/zer0/dev/mobile を削除

## 2026-03-08 Chat 4

- docs/progress/ を作成
- progress.md と changelog.md を作成し、これまでの作業と残タスクを整理

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
  - 削除: NaviOs/docs/CLAUDE.md（dev/CLAUDE.md が正規）
  - 削除: NaviOs/docs/mock.jsx（dev/mock.jsx が正規）
  - 削除: dev/Navios-MVP-Phase1/（NaviOs/docs/Navios-MVP-Phase1/ が正規）
- CLAUDE.md にコーディングルール追記
  - TypeScript必須・行数制限・コンポーネント分離・JSDoc・スパゲッティコード禁止 など
- CLAUDE.md にファイル管理ルール追記（正規配置ツリー図）

### コンポーネント改善
- `BottomTabBar.tsx`: @expo/vector-icons (Ionicons) アイコンを追加
  - 各タブにアクティブ/非アクティブアイコン（flash / map / search / person）
  - 中央投稿ボタンを `add` アイコンに変更
  - TAB_ITEMS 定数化でハードコード廃止
- `app/(tabs)/index.tsx`: Pulse 画面のアイコン・アニメーション刷新
  - 左上・検索ボタン・中央アイコンを Ionicons に統一
  - 中央アイコンにパルスアニメーション追加（usePulseAnimation カスタムフック）
  - iconWrapper（固定サイズ）+ absoluteFill pulseRing 方式でズレを解消
