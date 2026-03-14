import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  avatar: string;
  size?: number;
  backgroundColor?: string;
};

export default function UserAvatar({ avatar, size = 32, backgroundColor = '#E2E8F0' }: Props) {
  const isImageUrl = avatar.startsWith('http');

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      {isImageUrl ? (
        <Image
          source={{ uri: avatar }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{avatar}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '700',
    color: '#475569',
  },
});
