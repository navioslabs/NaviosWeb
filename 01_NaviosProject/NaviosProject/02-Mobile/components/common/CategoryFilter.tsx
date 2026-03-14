import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES, CategoryId, getCategoryIconName } from '../../constants/categories';
import { Colors } from '../../constants/colors';

type Props = {
  active: CategoryId | 'all';
  onSelect: (id: CategoryId | 'all') => void;
  counts?: Partial<Record<CategoryId, number>>;
};

const ALL_ITEM = { id: 'all' as const, label: 'すべて', color: '#475569' };

export default function CategoryFilter({ active, onSelect, counts }: Props) {
  const items = [ALL_ITEM, ...CATEGORIES];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {items.map((cat) => {
        const isActive = active === cat.id;
        const count = cat.id !== 'all' ? counts?.[cat.id as CategoryId] : undefined;
        const iconName = getCategoryIconName(cat.id) as keyof typeof Ionicons.glyphMap;

        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id as CategoryId | 'all')}
            style={[
              styles.chip,
              isActive ? { backgroundColor: cat.color } : { backgroundColor: 'rgba(255,255,255,0.95)' },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={13} color={isActive ? '#fff' : Colors.textSecondary} />
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>{cat.label}</Text>
            {count !== undefined ? (
              <Text style={[styles.count, isActive ? styles.countActive : styles.countInactive]}>{count}</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelActive: {
    color: '#fff',
  },
  labelInactive: {
    color: Colors.textSecondary,
  },
  count: {
    fontSize: 10,
  },
  countActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  countInactive: {
    color: Colors.textMuted,
  },
});
