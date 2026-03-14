import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import { getCategoryInfo, CategoryId } from '../../constants/categories';

type Props = {
  post: Post;
};

export default function CategoryDetailCard({ post }: Props) {
  const d = post.details;
  if (!d) return null;

  const catInfo = getCategoryInfo(post.category as CategoryId);

  if (post.category === 'stock') {
    return (
      <View style={[styles.card, { backgroundColor: catInfo.bgColor }]}>
        <Row label="価格" value={d.price} color={catInfo.color} />
        <Row label="在庫状況" value={d.stockStatus} color={catInfo.color} />
      </View>
    );
  }

  if (post.category === 'event') {
    return (
      <View style={[styles.card, { backgroundColor: catInfo.bgColor }]}>
        <Row label="日時" value={`${d.eventDate ?? ''} ${d.eventTime ?? ''}`.trim()} color={catInfo.color} />
        <Row label="参加費" value={d.fee} color={catInfo.color} />
        {d.maxParticipants ? (
          <Row
            label="参加人数"
            value={`${d.currentParticipants ?? 0}/${d.maxParticipants}人`}
            color={catInfo.color}
          />
        ) : null}
      </View>
    );
  }

  if (post.category === 'help') {
    return (
      <View style={[styles.card, { backgroundColor: catInfo.bgColor }]}>
        {d.reward ? <Row label="お礼" value={d.reward} color={catInfo.color} iconName="gift-outline" /> : null}
        {d.estimatedTime ? (
          <Row label="目安時間" value={d.estimatedTime} color={catInfo.color} iconName="timer-outline" />
        ) : null}
      </View>
    );
  }

  if (post.category === 'admin') {
    return (
      <View style={[styles.card, { backgroundColor: catInfo.bgColor }]}>
        {d.deadline ? <Row label="締切" value={d.deadline} color={catInfo.color} iconName="warning-outline" /> : null}
        {d.requirements && d.requirements.length > 0 ? (
          <View>
            <Text style={[styles.label, { color: catInfo.color }]}>必要なもの:</Text>
            {d.requirements.map((req, i) => (
              <View key={`${req}-${i}`} style={styles.reqRow}>
                <Ionicons name="checkmark-outline" size={13} color={catInfo.color} />
                <Text style={[styles.reqItem, { color: catInfo.color }]}>{req}</Text>
              </View>
            ))}
          </View>
        ) : null}
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
        {iconName ? <Ionicons name={iconName} size={13} color={color} /> : null}
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
    flexShrink: 1,
    textAlign: 'right',
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
