import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CategoryId, getCategoryInfo } from '../../constants/categories';

type Props = {
  categoryId: CategoryId;
  size?: 'sm' | 'md';
};

export default function CategoryBadge({ categoryId, size = 'md' }: Props) {
  const cat = getCategoryInfo(categoryId);
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: cat.color }]}>
      <Text style={[styles.label, isSmall && styles.labelSm]}>{cat.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 11,
  },
});
