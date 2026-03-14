import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export default function SkeletonLoader({ width = '100%', height = 16, borderRadius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

// Pre-built skeleton layouts
export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.postItem}>
          <SkeletonLoader width={40} height={40} borderRadius={10} />
          <View style={styles.postBody}>
            <SkeletonLoader width="70%" height={14} />
            <SkeletonLoader width="90%" height={12} />
            <SkeletonLoader width="40%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function PostCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      <SkeletonLoader width={26} height={26} borderRadius={8} />
      <SkeletonLoader width="80%" height={14} style={{ marginTop: 8 }} />
      <SkeletonLoader width="60%" height={12} style={{ marginTop: 4 }} />
      <SkeletonLoader width="40%" height={10} style={{ marginTop: 8 }} />
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.profileSkeleton}>
      <View style={styles.profileRow}>
        <SkeletonLoader width={64} height={64} borderRadius={32} />
        <View style={styles.profileInfo}>
          <SkeletonLoader width="50%" height={18} />
          <SkeletonLoader width="70%" height={12} style={{ marginTop: 6 }} />
          <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View style={styles.statsRow}>
        <SkeletonLoader width="30%" height={60} borderRadius={12} />
        <SkeletonLoader width="30%" height={60} borderRadius={12} />
        <SkeletonLoader width="30%" height={60} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  listContainer: {
    gap: 12,
    padding: 16,
  },
  postItem: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  postBody: {
    flex: 1,
    gap: 6,
  },
  cardSkeleton: {
    width: 176,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileSkeleton: {
    padding: 16,
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 12,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
