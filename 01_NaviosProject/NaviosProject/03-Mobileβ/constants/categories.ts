export type CategoryId = 'stock' | 'event' | 'help' | 'admin';

export const CATEGORIES = [
  { id: 'stock' as CategoryId, label: '物資', color: '#10B981', bgColor: '#ECFDF5' },
  { id: 'event' as CategoryId, label: 'イベント', color: '#F59E0B', bgColor: '#FFFBEB' },
  { id: 'help' as CategoryId, label: '近助', color: '#F43F5E', bgColor: '#FFF1F2' },
  { id: 'admin' as CategoryId, label: '行政', color: '#8B5CF6', bgColor: '#F5F3FF' },
] as const;

export const getCategoryInfo = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const getCategoryIconName = (id: string): string => {
  const map: Record<string, string> = {
    all: 'apps-outline',
    stock: 'cube-outline',
    event: 'calendar-outline',
    help: 'hand-left-outline',
    admin: 'business-outline',
  };
  return map[id] ?? 'ellipse-outline';
};
