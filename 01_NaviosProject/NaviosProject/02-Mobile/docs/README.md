# docs フォルダ構成

`docs/` は用途別に番号付きで分類しています。新規ドキュメントは必ず該当カテゴリに追加してください。

## まず読む順番

1. **`CLAUDE.md`**（リポジトリルート）— コード規約・アーキテクチャ・全体仕様
2. `docs/03_handoff/02_session-handoff-2026-03-15.md` — 最新の引き継ぎ（全21項目）
3. `docs/02_current/02_implementation-summary-2026-03-15.md` — 実装状況一覧
4. `docs/02_current/03_roadmap-refresh-2026-03-15.md` — ロードマップ
5. 必要に応じて `docs/01_spec/01_Navios-MVP-Phase1.md` — 仕様原典

## 01_spec（仕様・設計）
- `01_Navios-MVP-Phase1.md` — MVP要件、画面仕様、DB/API設計
- `02_supabasedb.sql` — Supabaseスキーマ参照

## 02_current（現在の実装状態）
- `01_code-structure.md` — フォルダ責務、実装ポリシー
- **`02_implementation-summary-2026-03-15.md`** — 最新の実装状況
- **`03_roadmap-refresh-2026-03-15.md`** — 最新ロードマップ
- `04_ui-data-delivery-2026-03-14.md` — UI/データ移行記録

## 03_handoff（引き継ぎ）
- **`02_session-handoff-2026-03-15.md`** — 最新引き継ぎ（まずこれを読む）
- `01_session-handoff-2026-03-14.md` — 前回版

## 04_history（履歴）
- `01_changelog.md` — 変更履歴（全セッション分）
- `02_progress-legacy.md` — 旧進捗ログ

## 運用ルール
- 実装変更時は最低限 `changelog.md` と `session-handoff` を更新
- 前回版ドキュメントは削除せずアーカイブとして残す
- 仕様判断は `01_spec` を一次情報とする
- **コード規約は `CLAUDE.md` を正とする**
