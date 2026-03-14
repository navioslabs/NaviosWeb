# Session Handoff (2026-03-15, latest)

## Goal
次担当者が、追加調査なしで実装を継続できる状態にする。

## What Was Implemented

### Phase 1: カテゴリ名 + Nearbyフローティングカード
1. カテゴリ名を正式名称に変更（`constants/categories.ts`）
   - `特売`→`物資`、`助け合い`→`近助`、`自治会`→`行政`
   - IDは変更なし（`stock`, `event`, `help`, `admin`）
2. Nearby画面にフローティングプレビューカード追加
   - ピンタップ → spring スライドイン / 別ピン → スライドアウト→イン / 空白タップ → 消去

### Phase 2: 4画面同時改修
3. **マイページ** (`app/(tabs)/profile.tsx`, `components/common/UserAvatar.tsx`)
   - `UserAvatar` がURL画像に対応（`http`で始まる場合Image、それ以外はテキスト）
   - アバタータップ → ImagePicker → Supabase Storage `avatars` アップロード → `users.avatar` 更新
   - カメラアイコンオーバーレイ
   - ユーザー名: 鉛筆アイコンタップ → インラインTextInput → 保存（✓）/キャンセル（✕）
4. **投稿画面** (`app/post/create.tsx`)
   - カテゴリ選択を2x2グリッド化（大きいタッチターゲット）
   - セクション間をディバイダーで整理（カード入れ子→フラット構造）
   - ヘッダー: 円形閉じるボタン / 中央「新規投稿」/ 送信ボタンにアイコン
   - 画像プレビュー100x100
   - 時刻入力: テキスト入力 → スクロール式時刻ピッカーモーダル（時0-23 / 分00-55）
5. **Pulse画面** (`app/(tabs)/index.tsx`)
   - ヘッダー完全削除
   - 検索ボックスを画面最下部にフローティング配置（チャット入力風）
   - クイックタグを検索ボックスの直上に移動
   - 候補表示: 全幅リスト → 横スクロールのコンパクトチップ
   - カラーテーマ: 紫(#7C3AED) → ティール(#0D9488)
6. **検索→タイムライン** (`app/(tabs)/search.tsx`, `app/(tabs)/_layout.tsx`)
   - 検索機能を完全削除（検索ボックス、トレンド、過去人気、カテゴリグリッド）
   - 全投稿を新着順に時系列表示（FlatList + pull-to-refresh）
   - カテゴリフィルターチップ（横スクロール、件数付き）
   - タブ: icon `search` → `time-outline` / label `検索` → `タイムライン`
7. **画像最適化** (`lib/postService.ts`)
   - `optimizeImage(uri, maxSize, quality)` 関数追加
   - 投稿画像アップロード時に自動リサイズ（max 800px, quality 0.7）
   - アバターアップロード時に自動リサイズ（max 400px, quality 0.7）

## Files Changed
- `constants/categories.ts` — カテゴリラベル修正
- `app/(tabs)/nearby.tsx` — フローティングカード追加
- `app/(tabs)/profile.tsx` — アバター画像化、ユーザー名編集
- `components/common/UserAvatar.tsx` — URL画像対応
- `app/post/create.tsx` — モダンUI、時刻ピッカー
- `app/(tabs)/index.tsx` — Pulse改修（カラー、レイアウト）
- `app/(tabs)/search.tsx` — タイムライン画面に変換
- `app/(tabs)/_layout.tsx` — タブラベル/アイコン変更
- `lib/postService.ts` — `optimizeImage` 追加、投稿画像に適用

## Before Running
```bash
npx expo install expo-image-manipulator
```

## What's NOT Done Yet
- MapLibre未統合（地図はプレースホルダー）
- 全画面の実機テスト未実施
- コメントページネーション未実装

## Next Steps（推奨順）
1. **MapLibre統合**（`app/(tabs)/nearby.tsx` の `mapPlaceholder` → 実地図）
2. **実機回帰テスト**（認証・投稿作成・画像アップロード・アバター編集・タイムライン）
3. コメントページネーション + 楽観更新

## Environment Risk
- この実行環境では `node` / `npm` / `npx` が見つからず、テストコマンドを実行できない。
