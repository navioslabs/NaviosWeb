# 03 テスト戦略 — NaviOs 03-Mobileβ

## テストフレームワーク

- **Jest 29** + **jest-expo ~55.0.0** (Expo 55 公式プリセット)
- **@testing-library/react-native 13.x** — コンポーネント/Hook テスト
- **react-test-renderer 19.2.0** — React 19 対応レンダラー

## モック戦略

### Supabase Client (`jest.setup.js`)
チェイナブルクエリビルダーをモック:
```js
supabase.from() → { select, eq, order, limit, ... } // 各メソッドが this を返す
supabase.auth → { getSession, signInWithPassword, signOut, onAuthStateChange }
```

### AsyncStorage
全メソッド（getItem, setItem, removeItem, clear）を jest.fn() でモック。

### expo-router
useRouter, useSegments, Link, Stack, Tabs をモック。

### @expo/vector-icons
Ionicons を Text コンポーネントに置換。

## テストファイル構成

| ファイル | テスト対象 | テスト数 |
|---------|-----------|---------|
| `__tests__/lib/utils.test.ts` | formatDistance, getWalkTime, getExpiryLabel | 10 |
| `__tests__/lib/postService.test.ts` | toRelativeTime, mapPost, fetchPosts | 8 |
| `__tests__/hooks/useAuth.test.ts` | useAuth hook (session管理) | 5 |
| `__tests__/components/PostListItem.test.tsx` | PostListItem レンダリング | 7 |
| **合計** | | **30+** |

## テストカテゴリ

### 1. 純粋関数テスト (utils.test.ts)
- 入力 → 出力の検証
- エッジケース（0m, 負値, 各カテゴリ）
- モック不要

### 2. サービス層テスト (postService.test.ts)
- `toRelativeTime`: 時間フォーマット
- `mapPost`: DB行 → Post型マッピング（正常系 + 異常系）
- `fetchPosts`: Supabase クエリ構築の検証

### 3. Hook テスト (useAuth.test.ts)
- `renderHook` + `waitFor` パターン
- 初期状態（loading: true）
- セッション取得成功/失敗
- auth state change サブスクリプション

### 4. コンポーネントテスト (PostListItem.test.tsx)
- Props に基づく表示内容の検証
- onPress コールバック
- 条件付き表示（終了バッジ、有効期限ラベル）

## 実行コマンド

```bash
npm test                # 全テスト実行
npm run test:watch      # ウォッチモード
npm run test:coverage   # カバレッジレポート
```

## カバレッジ目標

- `lib/` — 80%+
- `hooks/` — 80%+
- `components/` — 基本レンダリングのみ
