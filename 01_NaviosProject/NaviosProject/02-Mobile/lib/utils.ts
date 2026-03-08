/** メートルを距離文字列に変換 */
export const formatDistance = (meters: number): string =>
  meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;

/** メートルから徒歩時間を算出（80m/分） */
export const getWalkTime = (meters: number): string =>
  `徒歩${Math.ceil(meters / 80)}分`;

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
