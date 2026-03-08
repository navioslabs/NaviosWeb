import { Post } from '../types';

/** メートルを距離文字列に変換 */
export const formatDistance = (meters: number): string =>
  meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;

/** メートルから徒歩時間を算出（80m/分） */
export const getWalkTime = (meters: number): string =>
  `徒歩${Math.ceil(meters / 80)}分`;

/** カテゴリ別の残り時間ラベルを返す */
export const getExpiryLabel = (post: Post): string | null => {
  const { category, details } = post;
  switch (category) {
    case 'stock': {
      const map: Record<string, string> = {
        today: '今日中',
        '48hours': '残り48h',
        '3days': '残り3日',
        '1week': '残り1週間',
        manual: '手動終了',
      };
      return details?.stockDuration ? (map[details.stockDuration] ?? null) : '残り48h';
    }
    case 'event':
      if (details?.eventDate) {
        return details.eventTime ? `${details.eventDate} ${details.eventTime}` : details.eventDate;
      }
      return null;
    case 'help':
      return '残り48h';
    case 'admin':
      return details?.deadline ? `〆${details.deadline}` : null;
    default:
      return null;
  }
};

/** モック検索スコアリング */
export const calcMatchScore = (
  post: { title: string; content: string; category: string; distance: number; urgency?: string },
  query: string
): number => {
  const keywords = query.toLowerCase().split(/\s+/);
  const text = `${post.title} ${post.content} ${post.category}`.toLowerCase();
  let score = 0;
  keywords.forEach((kw) => {
    if (text.includes(kw)) score += 30;
    if (post.title.toLowerCase().includes(kw)) score += 20;
  });
  if (post.distance < 300) score += 20;
  else if (post.distance < 500) score += 10;
  if (post.urgency === 'high') score += 10;
  return Math.min(score, 100);
};
