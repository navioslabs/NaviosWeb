import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  avatar: string;
  size?: number;
  backgroundColor?: string;
};

export default function UserAvatar({ avatar, size = 32, backgroundColor = '#E2E8F0' }: Props) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{avatar}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    color: '#475569',
  },
});
