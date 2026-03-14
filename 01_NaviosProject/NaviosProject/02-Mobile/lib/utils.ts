import { Post } from '../types';

export const formatDistance = (meters: number): string =>
  meters < 1000 ? `${Math.max(0, Math.round(meters))}m` : `${(meters / 1000).toFixed(1)}km`;

export const getWalkTime = (meters: number): string =>
  `徒歩${Math.max(1, Math.ceil(meters / 80))}分`;

export const getExpiryLabel = (post: Post): string | null => {
  const { category, details } = post;
  switch (category) {
    case 'stock': {
      const map: Record<string, string> = {
        today: '本日中',
        '48hours': '残り48時間',
        '3days': '残り3日',
        '1week': '残り1週間',
        manual: '期限指定',
      };
      return details?.stockDuration ? (map[details.stockDuration] ?? null) : '残り48時間';
    }
    case 'event':
      if (details?.eventDate) {
        return details.eventTime ? `${details.eventDate} ${details.eventTime}` : details.eventDate;
      }
      return null;
    case 'help':
      return '残り48時間';
    case 'admin':
      return details?.deadline ? `締切 ${details.deadline}` : null;
    default:
      return null;
  }
};

export const calcMatchScore = (
  post: { title: string; content: string; category: string; distance: number; urgency?: string },
  query: string,
): number => {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
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
