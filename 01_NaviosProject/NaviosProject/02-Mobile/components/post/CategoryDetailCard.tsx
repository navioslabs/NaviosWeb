/**
 * CategoryDetailCard - カテゴリ別の詳細情報パネル
 * mock.jsx: 投稿詳細画面のカテゴリ別色付きカード（stock/event/help/admin）
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import { Colors } from '../../constants/colors';

type Props = {
  post: Post;
};

export default function CategoryDetailCard({ post }: Props) {
  const d = post.details;
  if (!d) return null;

  if (post.category === 'stock') {
    return (
      <View style={[styles.card, styles.stockCard]}>
        <Row label="価格" value={d.price} color="#059669" />
        <Row
          label="在庫状況"
          value={d.stockStatus}
          color={d.stockStatus === '残りわずか' ? Colors.danger : '#059669'}
        />
      </View>
    );
  }

  if (post.category === 'event') {
    return (
      <View style={[styles.card, styles.eventCard]}>
        <Row label="日時" value={`${d.eventDate ?? ''} ${d.eventTime ?? ''}`.trim()} color="#B45309" />
        <Row label="参加費" value={d.fee} color="#B45309" />
        {d.maxParticipants && (
          <Row
            label="参加者"
            value={`${d.currentParticipants ?? 0}/${d.maxParticipants}人`}
            color="#B45309"
          />
        )}
      </View>
    );
  }

  if (post.category === 'help') {
    return (
      <View style={[styles.card, styles.helpCard]}>
        {d.reward && (
          <Row label="お礼" value={d.reward} color="#BE123C" iconName="gift-outline" />
        )}
        {d.estimatedTime && (
          <Row label="所要時間" value={d.estimatedTime} color="#BE123C" iconName="timer-outline" />
        )}
      </View>
    );
  }

  if (post.category === 'admin') {
    return (
      <View style={[styles.card, styles.adminCard]}>
        {d.deadline && (
          <Row label="締切" value={d.deadline} color="#6D28D9" iconName="warning-outline" />
        )}
        {d.requirements && d.requirements.length > 0 && (
          <View>
            <Text style={[styles.label, { color: '#6D28D9' }]}>必要なもの:</Text>
            {d.requirements.map((req, i) => (
              <View key={i} style={styles.reqRow}>
                <Ionicons name="checkmark-outline" size={13} color="#5B21B6" />
                <Text style={[styles.reqItem, { color: '#5B21B6' }]}>{req}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  return null;
}

function Row({
  label,
  value,
  color,
  iconName,
}: {
  label: string;
  value?: string;
  color: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        {iconName && <Ionicons name={iconName} size={13} color={color} />}
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  stockCard: { backgroundColor: '#ECFDF5' },
  eventCard: { backgroundColor: '#FFFBEB' },
  helpCard: { backgroundColor: '#FFF1F2' },
  adminCard: { backgroundColor: '#F5F3FF' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingLeft: 4,
  },
  reqItem: {
    fontSize: 13,
  },
});
