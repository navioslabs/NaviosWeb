import { formatDistance, getWalkTime, getExpiryLabel } from '../../lib/utils';
import type { Post } from '../../types';

const makePost = (overrides: Partial<Post> = {}): Post => ({
  id: '1',
  category: 'stock',
  title: 'Test',
  content: '',
  author: { id: 'u1', displayName: 'Test', avatar: 'T', verified: false },
  place: { name: 'Place', address: '', latitude: 0, longitude: 0 },
  distance: 0,
  images: [],
  allowComments: true,
  isEnded: false,
  commentCount: 0,
  createdAt: 'たった今',
  ...overrides,
});

describe('formatDistance', () => {
  it('formats meters under 1000 as meters', () => {
    expect(formatDistance(500)).toBe('500m');
    expect(formatDistance(0)).toBe('0m');
    expect(formatDistance(999)).toBe('999m');
  });

  it('formats meters 1000+ as kilometers', () => {
    expect(formatDistance(1000)).toBe('1.0km');
    expect(formatDistance(2500)).toBe('2.5km');
    expect(formatDistance(15000)).toBe('15.0km');
  });

  it('handles negative values by clamping to 0', () => {
    expect(formatDistance(-100)).toBe('0m');
  });
});

describe('getWalkTime', () => {
  it('returns minimum 1 minute', () => {
    expect(getWalkTime(0)).toBe('徒歩1分');
    expect(getWalkTime(50)).toBe('徒歩1分');
  });

  it('calculates walk time at 80m/min', () => {
    expect(getWalkTime(160)).toBe('徒歩2分');
    expect(getWalkTime(400)).toBe('徒歩5分');
  });

  it('rounds up', () => {
    expect(getWalkTime(81)).toBe('徒歩2分');
  });
});

describe('getExpiryLabel', () => {
  it('returns default stock expiry', () => {
    expect(getExpiryLabel(makePost({ category: 'stock' }))).toBe('残り48時間');
  });

  it('returns stock duration label', () => {
    expect(getExpiryLabel(makePost({
      category: 'stock',
      details: { stockDuration: 'today' },
    }))).toBe('本日中');
  });

  it('returns help expiry', () => {
    expect(getExpiryLabel(makePost({ category: 'help' }))).toBe('残り48時間');
  });

  it('returns event date and time', () => {
    expect(getExpiryLabel(makePost({
      category: 'event',
      details: { eventDate: '2025-03-20', eventTime: '14:00' },
    }))).toBe('2025-03-20 14:00');
  });

  it('returns admin deadline', () => {
    expect(getExpiryLabel(makePost({
      category: 'admin',
      details: { deadline: '2025-04-01' },
    }))).toBe('締切 2025-04-01');
  });

  it('returns null for admin without deadline', () => {
    expect(getExpiryLabel(makePost({ category: 'admin' }))).toBeNull();
  });
});
