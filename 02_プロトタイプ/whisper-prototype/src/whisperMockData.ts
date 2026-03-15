/**
 * つぶやき（Whisper）機能 プロトタイプ用ダミーデータ
 *
 * 位置情報 × グルーピング × つぶやき のUI検証に使用
 */

// ============================================================
// 型定義
// ============================================================

export type WhisperUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type Whisper = {
  id: string;
  user: WhisperUser;
  content: string;
  latitude: number;
  longitude: number;
  areaName: string;
  distanceMeters: number; // ユーザーからの距離（UIフェード計算用）
  createdAt: string; // ISO 8601
  expiresAt: string; // 24h後
  replyCount: number;
  reactionCount: number;
  reactions: ReactionSummary[];
};

export type ReactionType =
  | "thanks" // ありがとう
  | "useful" // 助かった
  | "wantToGo" // 行きたい
  | "funny" // 笑
  | "agree"; // わかる

export type ReactionSummary = {
  type: ReactionType;
  count: number;
};

export type WhisperReply = {
  id: string;
  whisperId: string;
  user: WhisperUser;
  content: string;
  createdAt: string;
};

export type AreaGroup = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  activeUserCount: number;
  whisperCount: number;
};

// ============================================================
// ユーザー
// ============================================================

export const MOCK_USERS: WhisperUser[] = [
  { id: "u1", username: "たかし", avatarUrl: null },
  { id: "u2", username: "ゆきこ", avatarUrl: null },
  { id: "u3", username: "けんた", avatarUrl: null },
  { id: "u4", username: "さくら", avatarUrl: null },
  { id: "u5", username: "まさお", avatarUrl: null },
  { id: "u6", username: "あいこ", avatarUrl: null },
  { id: "u7", username: "りょう", avatarUrl: null },
  { id: "u8", username: "みほ", avatarUrl: null },
  { id: "u9", username: "だいき", avatarUrl: null },
  { id: "u10", username: "ことね", avatarUrl: null },
];

// ============================================================
// 現在地（渋谷駅周辺を想定）
// ============================================================

export const CURRENT_LOCATION = {
  latitude: 35.6581,
  longitude: 139.7017,
};

// ============================================================
// エリアグループ（自動グループ）
// ============================================================

export const MOCK_AREAS: AreaGroup[] = [
  {
    id: "area1",
    name: "渋谷駅前",
    latitude: 35.6581,
    longitude: 139.7017,
    radiusMeters: 300,
    activeUserCount: 24,
    whisperCount: 8,
  },
  {
    id: "area2",
    name: "宮益坂エリア",
    latitude: 35.6595,
    longitude: 139.7045,
    radiusMeters: 200,
    activeUserCount: 9,
    whisperCount: 4,
  },
  {
    id: "area3",
    name: "センター街",
    latitude: 35.6595,
    longitude: 139.6988,
    radiusMeters: 200,
    activeUserCount: 31,
    whisperCount: 12,
  },
  {
    id: "area4",
    name: "代々木公園",
    latitude: 35.6715,
    longitude: 139.6948,
    radiusMeters: 500,
    activeUserCount: 15,
    whisperCount: 6,
  },
];

// ============================================================
// つぶやきデータ
// ============================================================

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
const hoursLater = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

export const MOCK_WHISPERS: Whisper[] = [
  // --- 近い（0〜100m）→ opacity 100% ---
  {
    id: "w1",
    user: MOCK_USERS[0],
    content: "ハチ公前めっちゃ人いる。待ち合わせの人は東口の方がいいかも",
    latitude: 35.6580,
    longitude: 139.7015,
    areaName: "渋谷駅前",
    distanceMeters: 30,
    createdAt: hoursAgo(0.5),
    expiresAt: hoursLater(23.5),
    replyCount: 3,
    reactionCount: 8,
    reactions: [
      { type: "useful", count: 5 },
      { type: "thanks", count: 3 },
    ],
  },
  {
    id: "w2",
    user: MOCK_USERS[1],
    content: "駅前のスタバ、今なら空いてるよ〜",
    latitude: 35.6583,
    longitude: 139.7020,
    areaName: "渋谷駅前",
    distanceMeters: 50,
    createdAt: hoursAgo(1),
    expiresAt: hoursLater(23),
    replyCount: 1,
    reactionCount: 4,
    reactions: [
      { type: "wantToGo", count: 3 },
      { type: "thanks", count: 1 },
    ],
  },
  {
    id: "w3",
    user: MOCK_USERS[2],
    content: "109の前でストリートライブやってる！うまい",
    latitude: 35.6590,
    longitude: 139.7005,
    areaName: "渋谷駅前",
    distanceMeters: 80,
    createdAt: hoursAgo(0.2),
    expiresAt: hoursLater(23.8),
    replyCount: 5,
    reactionCount: 12,
    reactions: [
      { type: "wantToGo", count: 7 },
      { type: "funny", count: 3 },
      { type: "agree", count: 2 },
    ],
  },

  // --- やや近い（100〜250m）→ opacity 70% ---
  {
    id: "w4",
    user: MOCK_USERS[3],
    content: "宮益坂のパン屋、今日クロワッサン焼きたて出してる",
    latitude: 35.6593,
    longitude: 139.7040,
    areaName: "宮益坂エリア",
    distanceMeters: 150,
    createdAt: hoursAgo(2),
    expiresAt: hoursLater(22),
    replyCount: 2,
    reactionCount: 6,
    reactions: [
      { type: "wantToGo", count: 4 },
      { type: "useful", count: 2 },
    ],
  },
  {
    id: "w5",
    user: MOCK_USERS[4],
    content: "この辺でランチおすすめある？和食がいいな",
    latitude: 35.6598,
    longitude: 139.7035,
    areaName: "宮益坂エリア",
    distanceMeters: 200,
    createdAt: hoursAgo(1.5),
    expiresAt: hoursLater(22.5),
    replyCount: 4,
    reactionCount: 2,
    reactions: [
      { type: "agree", count: 2 },
    ],
  },

  // --- 中距離（250〜400m）→ opacity 40% ---
  {
    id: "w6",
    user: MOCK_USERS[5],
    content: "センター街の古着屋セールやってる！50%オフ",
    latitude: 35.6600,
    longitude: 139.6985,
    areaName: "センター街",
    distanceMeters: 300,
    createdAt: hoursAgo(3),
    expiresAt: hoursLater(21),
    replyCount: 7,
    reactionCount: 15,
    reactions: [
      { type: "wantToGo", count: 9 },
      { type: "useful", count: 4 },
      { type: "thanks", count: 2 },
    ],
  },
  {
    id: "w7",
    user: MOCK_USERS[6],
    content: "タピオカの新しい店できてるけど行列やば",
    latitude: 35.6598,
    longitude: 139.6990,
    areaName: "センター街",
    distanceMeters: 350,
    createdAt: hoursAgo(4),
    expiresAt: hoursLater(20),
    replyCount: 2,
    reactionCount: 5,
    reactions: [
      { type: "funny", count: 3 },
      { type: "agree", count: 2 },
    ],
  },

  // --- 遠い（400m〜）→ opacity 15%、フェードアウト寸前 ---
  {
    id: "w8",
    user: MOCK_USERS[7],
    content: "代々木公園の桜、三分咲きくらい。来週が見頃かも",
    latitude: 35.6710,
    longitude: 139.6945,
    areaName: "代々木公園",
    distanceMeters: 1500,
    createdAt: hoursAgo(5),
    expiresAt: hoursLater(19),
    replyCount: 8,
    reactionCount: 22,
    reactions: [
      { type: "wantToGo", count: 14 },
      { type: "useful", count: 5 },
      { type: "thanks", count: 3 },
    ],
  },
  {
    id: "w9",
    user: MOCK_USERS[8],
    content: "公園のベンチ、噴水の裏側が空いてるよ",
    latitude: 35.6720,
    longitude: 139.6950,
    areaName: "代々木公園",
    distanceMeters: 1600,
    createdAt: hoursAgo(6),
    expiresAt: hoursLater(18),
    replyCount: 0,
    reactionCount: 3,
    reactions: [
      { type: "thanks", count: 2 },
      { type: "useful", count: 1 },
    ],
  },

  // --- 古い（20h以上前）→ 時間フェード ---
  {
    id: "w10",
    user: MOCK_USERS[9],
    content: "渋谷駅の工事、南口あたり通りにくくなってる",
    latitude: 35.6578,
    longitude: 139.7018,
    areaName: "渋谷駅前",
    distanceMeters: 40,
    createdAt: hoursAgo(22),
    expiresAt: hoursLater(2),
    replyCount: 6,
    reactionCount: 18,
    reactions: [
      { type: "useful", count: 10 },
      { type: "thanks", count: 5 },
      { type: "agree", count: 3 },
    ],
  },
];

// ============================================================
// リプライ（w1のスレッド例）
// ============================================================

export const MOCK_REPLIES: WhisperReply[] = [
  {
    id: "r1",
    whisperId: "w1",
    user: MOCK_USERS[3],
    content: "東口のモヤイ像前が穴場だよ",
    createdAt: hoursAgo(0.4),
  },
  {
    id: "r2",
    whisperId: "w1",
    user: MOCK_USERS[5],
    content: "ハチ公前、外国人観光客でいつも混んでるよね",
    createdAt: hoursAgo(0.3),
  },
  {
    id: "r3",
    whisperId: "w1",
    user: MOCK_USERS[8],
    content: "ありがとう！東口にします",
    createdAt: hoursAgo(0.1),
  },
];

// ============================================================
// ユーティリティ: 距離からopacityを計算
// ============================================================

/**
 * 距離と経過時間からつぶやきの表示opacity（0〜1）を算出する
 *
 * - 距離: 0m → 1.0、500m → 0.15、500m超 → 0
 * - 時間: 作成直後 → 1.0、24h → 0
 * - 最終opacity = 距離opacity × 時間opacity
 */
export function calcWhisperOpacity(whisper: Whisper): number {
  // 距離ベースのopacity
  const maxDistance = 500; // この距離で完全にフェードアウト
  const distanceRatio = Math.min(whisper.distanceMeters / maxDistance, 1);
  const distanceOpacity = 1 - distanceRatio * 0.85; // 0m=1.0, 500m=0.15

  // 時間ベースのopacity
  const createdTime = new Date(whisper.createdAt).getTime();
  const expiresTime = new Date(whisper.expiresAt).getTime();
  const nowTime = Date.now();
  const totalLifespan = expiresTime - createdTime;
  const elapsed = nowTime - createdTime;
  const timeRatio = Math.min(elapsed / totalLifespan, 1);
  const timeOpacity = 1 - timeRatio * 0.7; // 作成直後=1.0, 期限=0.3

  return Math.max(0, distanceOpacity * timeOpacity);
}

// ============================================================
// リアクションのラベル・アイコン対応表
// ============================================================

export const REACTION_CONFIG: Record<ReactionType, { label: string; emoji: string }> = {
  thanks: { label: "ありがとう", emoji: "🙏" },
  useful: { label: "助かった", emoji: "👍" },
  wantToGo: { label: "行きたい", emoji: "🏃" },
  funny: { label: "笑", emoji: "😂" },
  agree: { label: "わかる", emoji: "💡" },
};
