import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>ログイン</Text>
      <Text style={styles.caption}>実装予定: Supabase Auth ログイン</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700' },
  caption: { marginTop: 8, fontSize: 14, color: '#64748B' },
});
