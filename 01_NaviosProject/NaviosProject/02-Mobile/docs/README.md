# docs フォルダ構成（整理版）

`docs/` は用途別に番号付きで分類しています。新規ドキュメントは必ず該当カテゴリに追加してください。

## 01_spec（仕様・設計）
- `docs/01_spec/01_Navios-MVP-Phase1.md`
  - MVP要件、画面仕様、DB/API設計の元資料
- `docs/01_spec/02_supabasedb.sql`
  - Supabaseスキーマ参照（実行用ではなく参照用）

## 02_current（現在の実装状態）
- `docs/02_current/01_code-structure.md`
  - フォルダ責務、実装ポリシー
- `docs/02_current/02_implementation-summary-2026-03-15.md` ← **最新**
  - 現在の実装状況の要約
- `docs/02_current/03_roadmap-refresh-2026-03-15.md` ← **最新**
  - 現在の優先ロードマップ
- `docs/02_current/04_ui-data-delivery-2026-03-14.md`
  - UI/データ移行作業の完了記録

### アーカイブ（02_current内）
- `docs/02_current/02_implementation-summary-2026-03-14.md` — 前回版
- `docs/02_current/03_roadmap-refresh-2026-03-14.md` — 前回版

## 03_handoff（引き継ぎ）
- `docs/03_handoff/02_session-handoff-2026-03-15.md` ← **最新（まずこれを読む）**
  - 次担当者向けの引き継ぎ内容
- `docs/03_handoff/01_session-handoff-2026-03-14.md` — 前回版

## 04_history（履歴）
- `docs/04_history/01_changelog.md`
  - 変更履歴（全セッション分）
- `docs/04_history/02_progress-legacy.md`
  - 旧進捗ログ（レガシー）

## 99_legacy（移行前互換）
- 移行前の `docs/progress/*` や `docs/Navios-MVP-Phase1` など旧パスは互換目的で残置。
- 以後の更新は原則として `01_*`〜`04_*` の整理済みパスに対して行う。

## まず読む順番
1. `docs/03_handoff/02_session-handoff-2026-03-15.md`（最新の引き継ぎ）
2. `docs/02_current/02_implementation-summary-2026-03-15.md`（全体の実装状況）
3. `docs/02_current/03_roadmap-refresh-2026-03-15.md`（次にやること）
4. 必要に応じて `docs/01_spec/01_Navios-MVP-Phase1.md`（仕様の原典）

## 運用ルール
- 実装変更時は最低限更新する
  - `docs/04_history/01_changelog.md`
  - `docs/03_handoff/XX_session-handoff-YYYY-MM-DD.md`（新規作成）
- 実装状態の変化が大きい場合
  - `docs/02_current/02_implementation-summary-YYYY-MM-DD.md` を新規作成
  - `docs/02_current/03_roadmap-refresh-YYYY-MM-DD.md` を新規作成
- 前回版のドキュメントは削除せずアーカイブとして残す
- 仕様判断は `01_spec` を一次情報とする
