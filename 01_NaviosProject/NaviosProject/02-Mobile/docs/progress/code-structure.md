# コード構造メモ（02-Mobile）

## ディレクトリ責務
- `app/`
  - 画面・ルーティング定義（Expo Router）
  - 画面固有のUI状態を持つ
- `components/`
  - 再利用UIコンポーネント
  - API呼び出しを直接持たない
- `hooks/`
  - 画面横断の状態管理・非同期取得ロジック
  - 例: `usePosts`, `useNearbyPosts`, `useAuth`, `useLocation`
- `lib/`
  - 外部サービス接続・ドメイン処理
  - 例: `supabase.ts`, `auth.ts`, `postService.ts`
- `constants/`
  - 色・カテゴリ等の定数
- `types/`
  - 型定義

## 実装ポリシー
- Supabaseクエリは原則 `lib/postService.ts` に集約する
- 画面は service/hook を呼ぶだけにして見通しを保つ
- モック依存を復活させない（未移行画面のみ例外管理）

## 追加時の目安
- 新しいAPI read/write: `lib/postService.ts`
- 画面で使う取得状態: `hooks/` に専用hook
- 画面固有UI: `app/`

