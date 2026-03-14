import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { getCategoryInfo, CategoryId } from '../../constants/categories';

export default function PostSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string; category?: string; id?: string }>();

  const title = params.title ?? '投稿';
  const category = (params.category as CategoryId) ?? 'stock';
  const categoryInfo = getCategoryInfo(category);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: categoryInfo.color }]}>
          <Ionicons name="checkmark" size={42} color="#fff" />
        </View>

        <Text style={styles.heading}>投稿が完了しました</Text>
        <Text style={styles.subHeading}>カテゴリ: {categoryInfo.label}</Text>

        <View style={styles.titleBox}>
          <Text style={styles.titleLabel}>投稿タイトル</Text>
          <Text style={styles.titleValue} numberOfLines={2}>{title}</Text>
        </View>

        <View style={styles.actions}>
          {params.id ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace(`/post/${params.id}`)}>
              <Text style={styles.primaryBtnText}>投稿を見る</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)/nearby')}>
            <Text style={styles.secondaryBtnText}>近くの投稿へ戻る</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    gap: 14,
  },
  iconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  titleBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  titleLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  titleValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#fff',
  },
  secondaryBtnText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
});
