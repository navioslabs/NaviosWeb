# NaviOs Phase 1 開発ドキュメント

**バージョン:** 1.0  
**作成日:** 2026年3月  
**対象:** Phase 1 MVP  
**開発者:** 1名（なるはや実装）

---

## 目次

1. [要件定義](#1-要件定義)
2. [画面設計](#2-画面設計)
3. [システム構成](#3-システム構成)
4. [データベース設計](#4-データベース設計)
5. [API設計](#5-api設計)
6. [開発タスク](#6-開発タスク)

---

# 1. 要件定義

## 1.1 プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロダクト名 | NaviOs（ナビオス） |
| コンセプト | 半径1km限定の生活情報共有アプリ |
| 初期展開エリア | 鹿児島県日置市 伊集院町（人口約2万人） |
| ターゲット | 地方の高齢者層（60代以上）、現役世代（30-50代） |

## 1.2 解決する課題

```
問題: 災害時に頼れるのは「近所の人」だが、普段から繋がりがない
解決: 日常から使える地域情報アプリで、緩やかな繋がりを作る
価値: 「物流が止まっても、近所の絆と情報があれば生きていける」
```

## 1.3 情報の価値方程式

```
情報の価値 = 鮮度 × 距離の近さ × 行動可能性
```

## 1.4 Phase 1 機能要件

### 必須機能（MVP）

| 機能 | 説明 | 優先度 |
|------|------|--------|
| ユーザー登録/ログイン | メール認証 | 最高 |
| 投稿作成 | 4カテゴリ（物資/イベント/近助/行政） | 最高 |
| 投稿一覧表示 | 距離順でソート | 最高 |
| 投稿詳細表示 | 画像、コメント表示 | 最高 |
| **地図表示** | MapLibre + MapTiler | 最高 |
| コメント機能 | 投稿への返信 | 高 |
| 位置情報取得 | 現在地の取得 | 高 |
| 場所選択 | 国土地理院+OSM+手動入力 | 高 |
| 画像アップロード | 投稿への画像添付 | 高 |
| **マイページ詳細** | プロフィール、自分の投稿、設定 | 高 |
| カテゴリフィルター | カテゴリで絞り込み | 中 |
| 投稿の期限/終了 | 自動非表示、手動終了 | 中 |

### Phase 1 対象外（後回し）

| 機能 | 理由 |
|------|------|
| Pulse AI連携 | モック検索で十分 |
| プッシュ通知 | 基本機能安定後 |
| 管理画面 | Supabaseダッシュボードで代替 |

## 1.5 非機能要件

| 項目 | 要件 |
|------|------|
| 対応OS | iOS 14以上、Android 10以上 |
| レスポンス | 一覧表示3秒以内 |
| 同時接続 | 100人程度（初期） |
| データ保持 | 投稿は期限後も履歴として保持 |
| セキュリティ | Supabase RLSによるアクセス制御 |

## 1.6 4つの情報カテゴリ

| カテゴリID | 名前 | 色 | 用途 | 期限ルール |
|-----------|------|-----|------|-----------|
| `stock` | 物資 | emerald-500 | 在庫・価格情報 | 投稿者が選択（デフォルト48時間） |
| `event` | イベント | amber-500 | 地域の集まり | 開催日の23:59まで |
| `help` | 近助 | rose-500 | 助け合い | 48時間（手動終了可） |
| `admin` | 行政 | violet-500 | 公共サービス | 申請期限まで |

---

# 2. 画面設計

## 2.1 画面一覧

| 画面名 | view値 | 説明 |
|--------|--------|------|
| Pulse画面 | `pulse` | ホーム、AI検索（モック） |
| 近く画面 | `main` | 地図＋投稿一覧 |
| 投稿詳細画面 | `detail` | 投稿の詳細表示 |
| 投稿作成画面 | `post` | 新規投稿 |
| 検索画面 | `search` | トレンド、履歴 |
| マイページ画面 | `profile` | プロフィール、自分の投稿、設定 |

## 2.2 画面遷移図

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   [Pulse] ←──────────────────────────────────────┐     │
│      │                                           │     │
│      └── 検索結果タップ → [詳細画面]              │     │
│                            │                      │     │
│                            └── 戻る ──────────────┘     │
│                                                         │
│   [近く] ←───────────────────────────────────────┐     │
│      │                                           │     │
│      ├── ピンタップ → カテゴリ絞込み             │     │
│      │                                           │     │
│      ├── カードタップ → [詳細画面]               │     │
│      │                    │                      │     │
│      │                    └── 戻る ──────────────┘     │
│      │                                                  │
│      └── 投稿ボタン → [投稿画面] → 投稿 → Pulse        │
│                                                         │
│   [Pulse] ←→ [近く] ←→ [検索] ←→ [マイページ]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 2.3 ボトムナビゲーション

```
┌─────────────────────────────────────────────────────────┐
│   ⚡        🗺️        ＋        🔍        👤           │
│  Pulse     近く       投稿      検索    マイページ      │
└─────────────────────────────────────────────────────────┘
```

| 位置 | タブ | アイコン | 遷移先 |
|------|------|---------|--------|
| 1 | Pulse | Zap | `pulse` |
| 2 | 近く | Map | `main` |
| 3 | 投稿 | Plus | `post` |
| 4 | 検索 | Search | `search` |
| 5 | マイページ | User | `profile` |

## 2.4 各画面のワイヤーフレーム

### Pulse画面（ホーム）

```
┌─────────────────────────────────────┐
│ ⚡ Pulse                      [🔔] │ ← 通知ベル
│ AIが近くの情報をキャッチ            │
├─────────────────────────────────────┤
│ 何をお探しですか？                  │
│ [入力欄                       ] [🔍]│
│ [野菜] [卵] [手伝い] [イベント]     │ ← クイックタグ
├─────────────────────────────────────┤
│ ✨ 3件見つかりました                │
│ ┌─────────────────────────────────┐ │
│ │ 📦 春キャベツ入荷       [95%]   │ │
│ │    450m · 6時間前               │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Pulse][近く][+][検索][マイページ]  │
└─────────────────────────────────────┘
```

### 近く画面

```
┌─────────────────────────────────────┐
│ 🟢 NaviOs  [伊集院] [🔔] [👤]       │ ← ヘッダー
├─────────────────────────────────────┤
│ [すべて] [物資] [イベント] [近助]   │ ← カテゴリフィルター
├─────────────────────────────────────┤
│                                     │
│        🗺️ 地図エリア                │
│     📦     📅                       │ ← 投稿ピン
│         🔵（現在地）                │
│     🤝         🏛️                   │
├─────────────────────────────────────┤
│ ═══                                 │ ← ハンドル
│ 🟢 近くの今  8件                    │
├─────────────────────────────────────┤
│ [カード1] [カード2] [カード3] →     │ ← ホットカード
├─────────────────────────────────────┤
│ すべての情報                        │
│ ├ 📦 卵入荷          350m  30分前   │
│ ├ 🤝 薪運び手伝って  200m  1時間前  │
│ └ ...                               │
├─────────────────────────────────────┤
│ [Pulse][近く][+][検索][マイページ]  │
└─────────────────────────────────────┘
```

### 投稿詳細画面

```
┌─────────────────────────────────────┐
│ ← [カテゴリ]                [共有] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │         📷 画像                 │ │
│ └─────────────────────────────────┘ │
│            ● ○ ○                    │ ← ページング
├─────────────────────────────────────┤
│ タイトル                            │
│ 👤 投稿者名 · 時間                  │
│ 📍 場所名  距離 徒歩時間            │
│ 詳細テキスト...                     │
│ 🎁 お礼 / 💰 価格 / 📅 日時         │ ← カテゴリ別
├─────────────────────────────────────┤
│ 💬 コメント (6)                     │
│ ├ コメント1                         │
│ ├ コメント2                         │
│ └ [もっと見る（残り3件）]           │
├─────────────────────────────────────┤
│ [コメント入力...              ] [➤]│
├─────────────────────────────────────┤
│ [ここへ行く] [カテゴリ別ボタン]     │
└─────────────────────────────────────┘
```

### 投稿作成画面

```
┌─────────────────────────────────────┐
│ ✕                 情報を投稿  [投稿]│
├─────────────────────────────────────┤
│ カテゴリ                            │
│ [物資] [イベント] [近助] [行政]     │
├─────────────────────────────────────┤
│ 写真（任意）                        │
│ [📷撮影] [🖼️選択]                   │
├─────────────────────────────────────┤
│ タイトル *                          │
│ [                              ]    │
├─────────────────────────────────────┤
│ 詳細（任意）                        │
│ [                              ]    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📦 物資情報（カテゴリ別）       │ │
│ │ 価格 [      ] 在庫 [▼ 在庫あり]│ │
│ │ 表示期間 [今日中][明日まで]...  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ 📍 現在地を使用                     │
│    伊集院町付近            [変更]   │
├─────────────────────────────────────┤
│ 💬 コメントを受け付ける    [ON/OFF] │
├─────────────────────────────────────┤
│ 💡 投稿のコツ                       │
│ • 数量制限があれば明記しましょう    │
└─────────────────────────────────────┘
```

### マイページ画面

```
┌─────────────────────────────────────┐
│ マイページ                    [⚙️] │
├─────────────────────────────────────┤
│ ┌───────┐                          │
│ │  👤   │  田中太郎                │
│ │ アバター│  tanaka@example.com     │
│ └───────┘  ✅ 認証済み             │
│            [プロフィール編集]       │
├─────────────────────────────────────┤
│ 📊 あなたの活動                     │
│ ┌─────────┬─────────┬─────────┐    │
│ │ 投稿    │ 協力    │ コメント │    │
│ │  12     │   5     │   28    │    │
│ └─────────┴─────────┴─────────┘    │
├─────────────────────────────────────┤
│ 📝 自分の投稿                       │
│ ├ 📦 卵入荷しました      30分前    │
│ ├ 🤝 薪運び手伝って      2日前     │
│ └ [すべて見る]                      │
├─────────────────────────────────────┤
│ ⚙️ 設定                             │
│ ├ 🔔 通知設定                       │
│ ├ 📍 位置情報設定                   │
│ ├ 🔒 プライバシー                   │
│ └ ❓ ヘルプ                         │
├─────────────────────────────────────┤
│ [ログアウト]                        │
├─────────────────────────────────────┤
│ [Pulse][近く][+][検索][マイページ]  │
└─────────────────────────────────────┘
```

### プロフィール編集画面

```
┌─────────────────────────────────────┐
│ ← プロフィール編集          [保存] │
├─────────────────────────────────────┤
│        ┌───────┐                    │
│        │  👤   │                    │
│        └───────┘                    │
│        [写真を変更]                 │
├─────────────────────────────────────┤
│ 表示名 *                            │
│ [田中太郎                     ]     │
├─────────────────────────────────────┤
│ 自己紹介（任意）                    │
│ [伊集院で八百屋をやっています...]   │
├─────────────────────────────────────┤
│ 電話番号（任意）                    │
│ [090-XXXX-XXXX                ]     │
│ ※投稿に「電話する」ボタンを表示    │
├─────────────────────────────────────┤
│ アバター文字                        │
│ [田] [中] [太] [🍎] [🥬]            │
└─────────────────────────────────────┘
```

### 自分の投稿一覧画面

```
┌─────────────────────────────────────┐
│ ← 自分の投稿                        │
├─────────────────────────────────────┤
│ [公開中] [終了済み]                 │ ← タブ切り替え
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📦 卵入荷しました                │ │
│ │ 30分前 · 350m · 👁 23 💬 3      │ │
│ │ [終了する] [編集]               │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🤝 薪運び手伝って               │ │
│ │ 2日前 · 200m · 👁 45 💬 5       │ │
│ │ [終了する] [編集]               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 2.5 カテゴリ別アクションボタン

| カテゴリ | ボタン1 | ボタン2 |
|---------|--------|--------|
| stock | ここへ行く | 📞 電話する |
| event | ここへ行く | ✋ 参加する |
| help | ここへ行く | 🤝 協力する |
| admin | ここへ行く | → 公式サイト |

## 2.6 「参加する」「協力する」の遷移

**パターンB：コメント連携型**を採用

```
[協力する] タップ
    ↓
コメント入力欄にフォーカス
プレースホルダー: 「どんな協力ができるか書いてください」
    ↓
送信すると「🤝 協力表明」バッジ付きコメント
```

---

# 3. システム構成

## 3.1 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                      クライアント                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   iOS App   │  │ Android App │  │   Web App   │     │
│  │   (Expo)    │  │   (Expo)    │  │  (Phase2)   │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
└─────────┼────────────────┼────────────────┼─────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Workers                    │
│                    （エッジ処理）                         │
│  • キャッシュ                                            │
│  • レート制限                                            │
│  • リクエスト最適化                                      │
└─────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                       Supabase                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  PostgreSQL │  │    Auth     │  │   Storage   │     │
│  │  + PostGIS  │  │   (JWT)     │  │  (Images)   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    外部データソース                       │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │  国土地理院  │  │OpenStreetMap│                       │
│  │  （場所）    │  │  （場所）   │                       │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────┘
```

## 3.2 技術スタック

| レイヤー | 技術 | 選定理由 |
|---------|------|---------|
| フロントエンド | Expo (React Native) | クロスプラットフォーム、開発速度 |
| 状態管理 | React Hooks + Context | シンプル、学習コスト低 |
| **地図** | **MapLibre GL + MapTiler** | オープンソース、無料枠10万回/月 |
| エッジ | Cloudflare Workers | 無料枠1000万回/月 |
| データベース | Supabase (PostgreSQL + PostGIS) | 位置情報対応、無料枠あり |
| 認証 | Supabase Auth | JWT、RLS対応、実装が楽 |
| ストレージ | Supabase Storage | 画像保存、CDN配信 |
| AI（Phase2） | Claude API (Haiku) | Pulse機能、低コスト |

## 3.3 地図表示（MapLibre + MapTiler）

### 構成

| 項目 | 内容 |
|------|------|
| ライブラリ | `@maplibre/maplibre-react-native` |
| タイル提供 | MapTiler（無料枠10万回/月） |
| スタイル | MapTiler Streets / Basic |

### セットアップ

```bash
# パッケージインストール
npx expo install @maplibre/maplibre-react-native
```

### 実装例

```javascript
import MapLibreGL from '@maplibre/maplibre-react-native';

const MAPTILER_KEY = 'YOUR_MAPTILER_KEY';

const MapView = ({ posts, userLocation, onPinPress }) => {
  return (
    <MapLibreGL.MapView
      style={{ flex: 1 }}
      styleURL={`https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`}
    >
      <MapLibreGL.Camera
        centerCoordinate={[userLocation.lng, userLocation.lat]}
        zoomLevel={14}
      />
      
      {/* 現在地マーカー */}
      <MapLibreGL.PointAnnotation
        id="user-location"
        coordinate={[userLocation.lng, userLocation.lat]}
      >
        <View style={styles.userMarker} />
      </MapLibreGL.PointAnnotation>
      
      {/* 投稿ピン */}
      {posts.map(post => (
        <MapLibreGL.PointAnnotation
          key={post.id}
          id={post.id}
          coordinate={[post.longitude, post.latitude]}
          onSelected={() => onPinPress(post)}
        >
          <View style={[styles.postPin, { backgroundColor: getCategoryColor(post.category) }]}>
            <CategoryIcon category={post.category} size={16} />
          </View>
        </MapLibreGL.PointAnnotation>
      ))}
    </MapLibreGL.MapView>
  );
};
```

### カテゴリ別ピンの色

| カテゴリ | 色 | Hex |
|---------|-----|-----|
| stock | 緑 | #10B981 |
| event | 黄 | #F59E0B |
| help | 赤 | #F43F5E |
| admin | 紫 | #8B5CF6 |

## 3.4 場所データの取得方式

**方針：無料ソース優先、Google Places APIは使用しない**

| 優先度 | ソース | 内容 | コスト |
|--------|--------|------|--------|
| 1 | 自前DB | 過去の投稿で使われた場所 | $0 |
| 2 | 国土地理院 | 公共施設、地名、行政区域 | $0 |
| 3 | OpenStreetMap | 店舗、商店、施設全般 | $0 |
| 4 | ユーザー手動入力 | 見つからない場合 | $0 |

**場所選択の流れ:**

```
ユーザーが場所を選ぶ
    ↓
① 自前DB（過去の投稿場所）を検索
    ↓
② 国土地理院 + OpenStreetMapデータを検索
    ↓
③ 見つからない → 手動入力（名前 + 地図でピン）
```

## 3.5 外部連携

| 機能 | 実装方法 | コスト |
|------|---------|--------|
| 地図表示 | MapLibre + MapTiler | $0（無料枠内） |
| ナビゲーション | Google Maps外部リンク | $0（API不要） |
| 電話 | `Linking.openURL('tel:...')` | $0 |
| 場所検索 | 国土地理院 + OSM + 自前DB | $0 |

## 3.6 コスト見積もり（Phase 1）

| サービス | 無料枠 | 想定利用 | コスト |
|---------|--------|---------|--------|
| Supabase | 5万リクエスト/月 | 〜3万 | $0 |
| Supabase Storage | 1GB | 〜500MB | $0 |
| Cloudflare Workers | 1000万リクエスト/月 | 〜10万 | $0 |
| **MapTiler** | **10万タイル/月** | **〜5万** | **$0** |
| **合計** | | | **$0** |

---

# 4. データベース設計

## 4.1 ER図

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │    posts    │       │  comments   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │──┐    │ id (PK)     │
│ email       │  │    │ author_id   │◀─┘    │ post_id     │◀─┐
│ display_name│  │    │ category    │       │ author_id   │  │
│ avatar      │  │    │ title       │       │ content     │  │
│ phone       │  │    │ content     │       │ can_help    │  │
│ verified    │  │    │ place_id    │◀──┐   │ created_at  │  │
│ created_at  │  │    │ distance    │   │   └─────────────┘  │
└─────────────┘  │    │ expires_at  │   │                    │
                 │    │ is_ended    │   │   ┌─────────────┐  │
                 │    │ created_at  │   │   │   places    │  │
                 │    └─────────────┘   │   ├─────────────┤  │
                 │           │          │   │ id (PK)     │──┘
                 │           │          └──▶│ name        │
                 │           │              │ address     │
                 │           ▼              │ latitude    │
                 │    ┌─────────────┐       │ longitude   │
                 │    │ post_images │       │ source      │
                 │    ├─────────────┤       └─────────────┘
                 │    │ id (PK)     │
                 │    │ post_id     │
                 │    │ image_url   │
                 │    │ order       │
                 │    └─────────────┘
                 │
                 │    ┌─────────────┐
                 │    │ post_details│
                 │    ├─────────────┤
                 └───▶│ post_id(PK) │
                      │ price       │
                      │ stock_status│
                      │ event_date  │
                      │ event_time  │
                      │ fee         │
                      │ max_participants │
                      │ help_type   │
                      │ reward      │
                      │ deadline    │
                      │ requirements│
                      └─────────────┘
```

## 4.2 テーブル定義

### users（ユーザー）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar TEXT,  -- 1文字のアバター文字
  phone TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);
```

### posts（投稿）

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('stock', 'event', 'help', 'admin')),
  title TEXT NOT NULL,
  content TEXT,
  place_id UUID REFERENCES places(id),
  location GEOGRAPHY(POINT, 4326),  -- PostGIS
  allow_comments BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  is_ended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
CREATE INDEX posts_location_idx ON posts USING GIST(location);
CREATE INDEX posts_expires_at_idx ON posts(expires_at) WHERE is_ended = FALSE;

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active posts"
  ON posts FOR SELECT
  USING (is_ended = FALSE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);
```

### post_details（投稿詳細：カテゴリ別データ）

```sql
CREATE TABLE post_details (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  -- 物資用
  price TEXT,
  stock_status TEXT CHECK (stock_status IN ('在庫あり', '残りわずか', '入荷予定')),
  stock_duration TEXT CHECK (stock_duration IN ('today', '48hours', '3days', '1week', 'manual')),
  -- イベント用
  event_date DATE,
  event_time TIME,
  fee TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  -- 近助用
  help_type TEXT CHECK (help_type IN ('request', 'share')),
  reward TEXT,
  estimated_time TEXT,
  -- 行政用
  deadline DATE,
  requirements TEXT[]
);
```

### post_images（投稿画像）

```sql
CREATE TABLE post_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX post_images_post_id_idx ON post_images(post_id);
```

### comments（コメント）

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  can_help BOOLEAN DEFAULT FALSE,  -- 「協力できます」バッジ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX comments_post_id_idx ON comments(post_id);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);
```

### places（場所）

```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  source TEXT CHECK (source IN ('user', 'gsi', 'osm')),  -- 国土地理院/OSM/ユーザー入力
  category TEXT,  -- shop, public, park, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX places_location_idx ON places USING GIST(location);
CREATE INDEX places_name_idx ON places USING GIN(name gin_trgm_ops);  -- 部分一致検索用

-- locationカラムの自動更新
CREATE OR REPLACE FUNCTION update_place_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER places_location_trigger
  BEFORE INSERT OR UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_place_location();
```

## 4.3 距離計算クエリ

```sql
-- 現在地から近い投稿を取得
CREATE OR REPLACE FUNCTION get_nearby_posts(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  distance_meters DOUBLE PRECISION,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.category,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters,
    p.created_at
  FROM posts p
  WHERE 
    p.is_ended = FALSE
    AND (p.expires_at IS NULL OR p.expires_at > NOW())
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
    AND (category_filter IS NULL OR p.category = category_filter)
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
```

## 4.4 初期データ投入

```sql
-- 伊集院エリアの主要スポット（例）
INSERT INTO places (name, address, latitude, longitude, source, category) VALUES
  ('日置市役所 伊集院庁舎', '伊集院町郡1丁目', 31.6234, 130.3856, 'gsi', 'public'),
  ('伊集院公民館', '伊集院町徳重', 31.6200, 130.3820, 'gsi', 'public'),
  ('妙円寺公園', '伊集院町徳重', 31.6180, 130.3800, 'gsi', 'park'),
  ('JA直売所', '伊集院町徳重2丁目', 31.6250, 130.3870, 'osm', 'shop');
```

---

# 5. API設計

## 5.1 認証

Supabase Authを使用。JWTトークンをヘッダーに含める。

```
Authorization: Bearer <jwt_token>
```

## 5.2 エンドポイント一覧

### 認証系

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/auth/signup` | ユーザー登録 |
| POST | `/auth/login` | ログイン |
| POST | `/auth/logout` | ログアウト |
| GET | `/auth/user` | 現在のユーザー情報 |

### 投稿系

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/posts` | 投稿一覧取得 |
| GET | `/posts/:id` | 投稿詳細取得 |
| POST | `/posts` | 投稿作成 |
| PATCH | `/posts/:id` | 投稿更新 |
| PATCH | `/posts/:id/end` | 投稿を終了 |
| DELETE | `/posts/:id` | 投稿削除 |

### コメント系

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/posts/:id/comments` | コメント一覧取得 |
| POST | `/posts/:id/comments` | コメント作成 |

### 場所系

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/places/search` | 場所検索 |
| POST | `/places` | 場所を手動登録 |

### 画像系

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/images/upload` | 画像アップロード |

## 5.3 API詳細

### GET /posts - 投稿一覧取得

**リクエスト**
```
GET /posts?lat=31.6234&lng=130.3856&radius=5000&category=stock
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| lat | number | ○ | 緯度 |
| lng | number | ○ | 経度 |
| radius | number | | 半径（メートル）デフォルト5000 |
| category | string | | カテゴリフィルター |
| limit | number | | 取得件数（デフォルト20） |
| offset | number | | オフセット |

**レスポンス**
```json
{
  "posts": [
    {
      "id": "uuid",
      "category": "stock",
      "title": "卵入荷しました",
      "content": "本日朝入荷...",
      "distance": 350,
      "author": {
        "id": "uuid",
        "display_name": "田中商店",
        "avatar": "田",
        "verified": true
      },
      "place": {
        "name": "田中商店",
        "address": "伊集院町徳重1丁目"
      },
      "images": ["https://..."],
      "details": {
        "price": "¥280/パック",
        "stock_status": "残りわずか"
      },
      "comment_count": 3,
      "created_at": "2026-03-08T10:00:00Z",
      "expires_at": "2026-03-09T10:00:00Z"
    }
  ],
  "total": 8,
  "has_more": false
}
```

### POST /posts - 投稿作成

**リクエスト**
```json
{
  "category": "stock",
  "title": "卵入荷しました",
  "content": "本日朝入荷しました...",
  "place_id": "uuid",
  "location": {
    "latitude": 31.6234,
    "longitude": 130.3856
  },
  "allow_comments": true,
  "images": ["https://..."],
  "details": {
    "price": "¥280/パック",
    "stock_status": "残りわずか",
    "stock_duration": "48hours"
  }
}
```

**レスポンス**
```json
{
  "id": "uuid",
  "created_at": "2026-03-08T10:00:00Z"
}
```

### GET /places/search - 場所検索

**リクエスト**
```
GET /places/search?q=田中&lat=31.6234&lng=130.3856
```

**レスポンス**
```json
{
  "places": [
    {
      "id": "uuid",
      "name": "田中商店",
      "address": "伊集院町徳重1丁目",
      "latitude": 31.6250,
      "longitude": 130.3870,
      "distance": 200,
      "source": "user"
    }
  ]
}
```

### POST /images/upload - 画像アップロード

**リクエスト**
```
POST /images/upload
Content-Type: multipart/form-data

file: <image_file>
```

**レスポンス**
```json
{
  "url": "https://xxx.supabase.co/storage/v1/object/public/images/xxx.jpg"
}
```

## 5.4 Supabase クライアント実装例

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 投稿一覧取得
const getNearbyPosts = async (lat, lng, radius = 5000, category = null) => {
  const { data, error } = await supabase
    .rpc('get_nearby_posts', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radius,
      category_filter: category
    });
  
  return { data, error };
};

// 投稿作成
const createPost = async (postData) => {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      author_id: supabase.auth.user().id,
      category: postData.category,
      title: postData.title,
      content: postData.content,
      place_id: postData.place_id,
      location: `POINT(${postData.longitude} ${postData.latitude})`,
      allow_comments: postData.allow_comments,
      expires_at: calculateExpiry(postData)
    })
    .select()
    .single();

  if (postError) return { error: postError };

  // 詳細データを保存
  if (postData.details) {
    await supabase
      .from('post_details')
      .insert({
        post_id: post.id,
        ...postData.details
      });
  }

  return { data: post };
};

// 画像アップロード
const uploadImage = async (file) => {
  const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) return { error };

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return { url: publicUrl };
};
```

---

# 6. 開発タスク

## 6.1 全体スケジュール（4週間）

```
Week 1: 土台を作る（認証、投稿CRUD）
Week 2: コア機能（詳細、コメント、位置、画像）
Week 3: 地図 + マイページ
Week 4: 仕上げ + リリース
```

## 6.2 Week 1 - 土台を作る

### Day 1: プロジェクト初期化

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| Expoプロジェクト作成 | `npx create-expo-app NaviOs` | 15分 |
| 必要パッケージインストール | react-navigation, supabase-js等 | 30分 |
| フォルダ構成作成 | screens/, components/, lib/ | 15分 |
| ボトムナビゲーション実装 | 5タブ間の遷移ができる | 2時間 |
| 動作確認 | iOS/Androidで表示確認 | 30分 |

```bash
# パッケージ
npx expo install @react-navigation/native @react-navigation/bottom-tabs
npx expo install @supabase/supabase-js
npx expo install expo-location expo-image-picker
npx expo install react-native-safe-area-context react-native-screens
npx expo install @maplibre/maplibre-react-native  # 地図用
```

### Day 2: Supabase設定

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| Supabaseプロジェクト作成 | ダッシュボードにアクセスできる | 15分 |
| テーブル作成 | users, posts, post_details, comments, places | 1時間 |
| RLSポリシー設定 | 各テーブルのポリシー設定完了 | 1時間 |
| Storageバケット作成 | imagesバケット作成、公開設定 | 15分 |
| クライアント接続確認 | アプリからSupabaseに接続できる | 30分 |

### Day 3: 認証

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| ログイン画面UI | メール/パスワード入力フォーム | 1時間 |
| 登録画面UI | 表示名入力も含む | 1時間 |
| Supabase Auth連携 | ログイン/登録が動作する | 1時間 |
| 認証状態管理 | Context or Zustandで管理 | 1時間 |
| ログアウト機能 | ログアウトできる | 30分 |

### Day 4: 投稿作成

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 投稿画面UI移植 | プロトタイプのUIを移植 | 2時間 |
| カテゴリ選択 | 4カテゴリ切り替え | 30分 |
| カテゴリ別フィールド | 動的にフィールド表示 | 1時間 |
| Supabaseに保存 | 投稿がDBに保存される | 1時間 |

### Day 5: 投稿一覧

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 近く画面UI移植 | ヘッダー、フローティングシート | 2時間 |
| 投稿データ取得 | Supabaseから取得 | 1時間 |
| リスト表示 | FlatListで表示 | 1時間 |
| カテゴリフィルター | フィルター動作 | 30分 |

### Day 6-7: バグ修正 + 調整

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| Week1のバグ修正 | 致命的バグなし | 3時間 |
| UI調整 | レイアウト崩れなし | 2時間 |
| 動作確認 | 一通りの操作が可能 | 1時間 |

**Week 1 完了基準：**
- [x] ログイン/登録ができる
- [x] 投稿を作成できる
- [x] 投稿一覧が表示される

---

## 6.3 Week 2 - コア機能

### Day 1: 投稿詳細画面

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 詳細画面UI移植 | プロトタイプのUIを移植 | 2時間 |
| データ取得 | 投稿IDから詳細取得 | 1時間 |
| カテゴリ別表示 | 価格/日時/お礼等の表示 | 1時間 |
| アクションボタン | 「電話」「ここへ行く」等 | 30分 |

### Day 2: コメント機能

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| コメント一覧表示 | 投稿に紐づくコメント表示 | 1時間 |
| コメント投稿 | 入力→送信→表示 | 1時間 |
| ページネーション | 「もっと見る」 | 1時間 |
| 協力バッジ | can_helpフラグ対応 | 30分 |

### Day 3: 位置情報取得

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| expo-location設定 | 権限リクエスト | 30分 |
| 現在地取得 | lat/lng取得 | 1時間 |
| 距離計算 | 投稿との距離表示 | 1時間 |
| 投稿時に位置付与 | 投稿に現在地を保存 | 30分 |

### Day 4: 場所選択

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 場所検索UI | 検索入力フォーム | 1時間 |
| 自前DB検索 | placesテーブル検索 | 1時間 |
| 手動入力UI | 名前+地図ピン | 1時間 |
| 場所登録 | 新しい場所をDBに保存 | 30分 |

### Day 5: 画像アップロード

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| expo-image-picker設定 | カメラ/ギャラリー権限 | 30分 |
| 画像選択UI | 撮影/選択ボタン | 1時間 |
| Supabase Storage保存 | 画像がアップロードされる | 1時間 |
| 投稿に画像添付 | post_imagesに保存 | 1時間 |

### Day 6-7: バグ修正 + 調整

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| Week2のバグ修正 | 致命的バグなし | 3時間 |
| UI調整 | レイアウト崩れなし | 2時間 |
| パフォーマンス確認 | 一覧表示3秒以内 | 1時間 |

**Week 2 完了基準：**
- [x] 投稿詳細が見れる
- [x] コメントできる
- [x] 現在地が取得できる
- [x] 場所を選択できる
- [x] 写真付き投稿ができる

---

## 6.4 Week 3 - 地図 + マイページ

### Day 1: 地図表示（MapLibre）

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| MapTilerアカウント作成 | APIキー取得 | 15分 |
| MapLibre設定 | 地図が表示される | 1時間 |
| 現在地表示 | 青いドットが表示される | 1時間 |
| スタイル調整 | 見やすい地図スタイル | 30分 |

### Day 2: 地図上の投稿ピン

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 投稿ピン表示 | カテゴリ色のピン表示 | 2時間 |
| ピンタップ処理 | タップで詳細へ遷移 | 1時間 |
| カテゴリフィルター連携 | 地図上のピンも絞り込み | 1時間 |

### Day 3: マイページ詳細

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| マイページUI実装 | プロフィール、活動統計表示 | 2時間 |
| 自分の投稿一覧 | 投稿リスト表示 | 1時間 |
| 投稿の編集/終了 | 自分の投稿を管理できる | 1時間 |

### Day 4: プロフィール編集

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 編集画面UI | 表示名、自己紹介、電話番号 | 1時間 |
| アバター設定 | 文字/絵文字選択 | 1時間 |
| プロフィール保存 | DBに保存、反映 | 1時間 |
| 設定画面 | 通知、位置情報設定 | 1時間 |

### Day 5: Pulse画面（モック）

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| Pulse画面UI移植 | プロトタイプのUIを移植 | 1時間 |
| モック検索実装 | キーワードマッチング | 1時間 |
| 結果表示 | マッチ度表示 | 1時間 |

### Day 6-7: バグ修正 + 調整

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| Week3のバグ修正 | 致命的バグなし | 3時間 |
| 地図パフォーマンス | スムーズに動作 | 2時間 |
| 全体UI調整 | 統一感のあるデザイン | 2時間 |

**Week 3 完了基準：**
- [x] 地図に投稿ピンが表示される
- [x] マイページで自分の投稿を管理できる
- [x] プロフィール編集ができる
- [x] Pulse画面が動作する

---

## 6.5 Week 4 - 仕上げ + リリース

### Day 1: 投稿の期限/終了

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 期限計算ロジック | カテゴリ別の期限設定 | 1時間 |
| 期限切れ非表示 | クエリで除外 | 1時間 |
| 「終了」ボタン | 投稿者が手動終了 | 1時間 |
| 終了済み表示 | バッジ表示 | 30分 |

### Day 2: 検索画面 + 最終調整

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 検索画面UI移植 | トレンド、履歴表示 | 1時間 |
| キーワード検索 | 投稿を検索できる | 1時間 |
| 全画面の動作確認 | 一通りの操作が可能 | 2時間 |

### Day 3: UI調整 + テスト

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 全画面UI確認 | レイアウト崩れなし | 2時間 |
| エラーハンドリング | エラー時の表示 | 1時間 |
| ローディング表示 | 適切なローディング | 1時間 |
| 実機テスト | iOS/Android両方 | 1時間 |

### Day 4: ストア申請準備

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| app.json設定 | 名前、アイコン、スプラッシュ | 1時間 |
| アイコン作成 | 1024x1024 | 30分 |
| スクリーンショット | 各画面キャプチャ | 1時間 |
| 説明文作成 | ストア掲載文 | 1時間 |
| プライバシーポリシー | URL準備 | 30分 |

### Day 5: ストア申請

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| EASビルド | `eas build` | 1時間 |
| App Store Connect申請 | iOS申請 | 1時間 |
| Google Play Console申請 | Android申請 | 1時間 |

### Day 6-7: 審査待ち + 修正対応

| タスク | 完了条件 | 時間目安 |
|--------|---------|---------|
| 審査フィードバック対応 | 指摘事項修正 | 必要に応じて |
| リリース | ストア公開 | - |

---

## 6.6 最低限のリリース基準

これができればリリースしてOK：

```
✅ ユーザー登録/ログインできる
✅ 投稿を作成できる
✅ 投稿一覧が見れる
✅ 投稿詳細が見れる
✅ 地図に投稿ピンが表示される
✅ マイページで自分の投稿を管理できる
✅ クラッシュしない
```

**なくてもリリースできる：**
- Pulse AI検索（モック検索で代替）
- プッシュ通知

## 6.7 詰まった時のルール

```
30分調べて分からない → 別の方法を探す
1時間試して動かない → その機能は後回し
致命的でないバグ → リリース後に修正
```

**動くものを出すことが最優先。**

---

## 付録

### A. フォルダ構成

```
NaviOs/
├── app/                    # Expo Router
│   ├── (tabs)/            # タブナビゲーション
│   │   ├── index.tsx      # Pulse画面
│   │   ├── nearby.tsx     # 近く画面
│   │   ├── search.tsx     # 検索画面
│   │   └── profile.tsx    # マイページ
│   ├── post/
│   │   ├── create.tsx     # 投稿作成
│   │   └── [id].tsx       # 投稿詳細
│   └── auth/
│       ├── login.tsx      # ログイン
│       └── register.tsx   # 登録
├── components/
│   ├── PostCard.tsx
│   ├── CategoryFilter.tsx
│   ├── CommentList.tsx
│   └── ...
├── lib/
│   ├── supabase.ts        # Supabaseクライアント
│   ├── auth.ts            # 認証関連
│   └── utils.ts           # ユーティリティ
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   └── useLocation.ts
├── types/
│   └── index.ts           # 型定義
└── constants/
    └── categories.ts      # カテゴリ定義
```

### B. 環境変数

```
# .env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### C. 主要パッケージバージョン

```json
{
  "expo": "~50.0.0",
  "@supabase/supabase-js": "^2.39.0",
  "@react-navigation/native": "^6.1.0",
  "@react-navigation/bottom-tabs": "^6.5.0",
  "expo-location": "~16.5.0",
  "expo-image-picker": "~14.7.0"
}
```

---

**ドキュメント終わり**

このドキュメントとプロトタイプ（NaviOs-MVP-Final.jsx）があれば、Phase 1の開発を進められます。