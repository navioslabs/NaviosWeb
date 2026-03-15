/**
 * MapView コンポーネント
 *
 * react-native-maps で地図表示。
 * Google Maps APIキーを app.json に設定すれば地図が表示される。
 * 未設定の場合はプレースホルダーにフォールバック。
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Post } from '../../types';
import { getCategoryInfo, getCategoryIconName } from '../../constants/categories';
import { Colors } from '../../constants/colors';

// react-native-maps を動的ロード — 未インストール時はフォールバック
let RNMapView: any = null;
let RNMarker: any = null;
let PROVIDER_GOOGLE: any = null;
try {
  const maps = require('react-native-maps');
  RNMapView = maps.default;
  RNMarker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
} catch {
  // react-native-maps 未インストール → フォールバック
}

const MAPS_AVAILABLE = RNMapView !== null;

// デフォルト中心（東京）
const DEFAULT_CENTER = { latitude: 35.6895, longitude: 139.6917 };
const DEFAULT_DELTA = { latitudeDelta: 0.01, longitudeDelta: 0.01 };

// ダミーピン位置（react-native-maps が無い場合のフォールバック用）
const PIN_POSITIONS = [
  { top: '22%', left: '25%' },
  { top: '30%', left: '68%' },
  { top: '58%', left: '20%' },
  { top: '65%', left: '72%' },
  { top: '18%', left: '50%' },
  { top: '48%', left: '40%' },
  { top: '75%', left: '45%' },
  { top: '38%', left: '30%' },
] as const;

type Props = {
  posts: Post[];
  selectedPostId?: string | null;
  onPinPress: (post: Post) => void;
  onMapPress: () => void;
  center?: { latitude: number; longitude: number };
};

export default function MapView({ posts, selectedPostId, onPinPress, onMapPress, center }: Props) {
  if (MAPS_AVAILABLE) {
    return (
      <NativeMapView
        posts={posts}
        selectedPostId={selectedPostId}
        onPinPress={onPinPress}
        onMapPress={onMapPress}
        center={center}
      />
    );
  }
  return (
    <PlaceholderMapView
      posts={posts}
      selectedPostId={selectedPostId}
      onPinPress={onPinPress}
      onMapPress={onMapPress}
    />
  );
}

// ==============================
// react-native-maps ネイティブ版
// ==============================
function NativeMapView({ posts, selectedPostId, onPinPress, onMapPress, center }: Props) {
  const mapCenter = center ?? DEFAULT_CENTER;

  return (
    <View style={styles.container}>
      <RNMapView
        style={styles.container}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{ ...mapCenter, ...DEFAULT_DELTA }}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={onMapPress}
      >
        {posts
          .filter((p) => p.place?.latitude && p.place?.longitude)
          .map((post) => {
            const cat = getCategoryInfo(post.category);
            const iconName = getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap;
            const isSelected = selectedPostId === post.id;

            return (
              <RNMarker
                key={post.id}
                coordinate={{
                  latitude: post.place.latitude,
                  longitude: post.place.longitude,
                }}
                onPress={() => onPinPress(post)}
              >
                <View style={[styles.pinCircle, { backgroundColor: cat.color }, isSelected && styles.pinCircleSelected]}>
                  <Ionicons name={iconName} size={16} color="#fff" />
                </View>
                {post.urgency === 'high' ? (
                  <View style={styles.pinUrgency}>
                    <Text style={styles.pinUrgencyText}>!</Text>
                  </View>
                ) : null}
              </RNMarker>
            );
          })}
      </RNMapView>
    </View>
  );
}

// ==============================
// フォールバック（プレースホルダー）
// ==============================
function PlaceholderMapView({ posts, selectedPostId, onPinPress, onMapPress }: Omit<Props, 'center'>) {
  const pingScale = useRef(new Animated.Value(1)).current;
  const pingOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const ping = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pingScale, { toValue: 2.4, duration: 1400, useNativeDriver: true }),
          Animated.timing(pingOpacity, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pingScale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(pingOpacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    ping.start();
    return () => ping.stop();
  }, [pingScale, pingOpacity]);

  return (
    <TouchableOpacity style={styles.placeholder} activeOpacity={1} onPress={onMapPress}>
      <Ionicons name="map-outline" size={48} color="#065F46" style={{ marginBottom: 12 }} />
      <Text style={styles.mapText}>Google Maps APIキーを設定してください</Text>
      <Text style={styles.mapSubText}>app.json → android.config.googleMaps.apiKey</Text>

      <View style={styles.locationMarker}>
        <Animated.View style={[styles.locationPing, { transform: [{ scale: pingScale }], opacity: pingOpacity }]} />
        <View style={styles.locationDot}>
          <Ionicons name="navigate" size={14} color="#fff" />
        </View>
      </View>

      {posts.slice(0, PIN_POSITIONS.length).map((post, i) => {
        const cat = getCategoryInfo(post.category);
        const iconName = getCategoryIconName(post.category) as keyof typeof Ionicons.glyphMap;
        const pos = PIN_POSITIONS[i];
        const isSelected = selectedPostId === post.id;

        return (
          <TouchableOpacity
            key={post.id}
            style={[styles.pin, { top: pos.top, left: pos.left }]}
            onPress={() => onPinPress(post)}
            activeOpacity={0.85}
          >
            <View style={[styles.pinCircle, { backgroundColor: cat.color }, isSelected && styles.pinCircleSelected]}>
              <Ionicons name={iconName} size={16} color="#fff" />
            </View>
            {post.urgency === 'high' ? (
              <View style={styles.pinUrgency}>
                <Text style={styles.pinUrgencyText}>!</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.successDark,
    marginBottom: 4,
  },
  mapSubText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  locationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -16,
    marginLeft: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  locationDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blue,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  pin: {
    position: 'absolute',
    marginLeft: -18,
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinCircleSelected: {
    borderWidth: 3,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  pinUrgency: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinUrgencyText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
  },
});
