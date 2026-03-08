/**
 * RegisterScreen - 新規登録画面
 * Supabase Auth 接続は Phase 2。現在はUIのみ。
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (!displayName.trim()) {
      Alert.alert('入力エラー', '表示名を入力してください');
      return;
    }
    if (!email.trim()) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください');
      return;
    }
    if (password.length < 8) {
      Alert.alert('入力エラー', 'パスワードは8文字以上で入力してください');
      return;
    }
    // TODO: Supabase Auth サインアップ実装 (Phase 2)
    Alert.alert('登録完了（デモ）', 'Phase 2 で Supabase Auth を接続します', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* ロゴ */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="location" size={36} color="#fff" />
            </View>
            <Text style={styles.appName}>NaviOs</Text>
            <Text style={styles.appTagline}>地域をつなぐ情報共有</Text>
          </View>

          {/* フォーム */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>新規登録</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>表示名 <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="例: 田中太郎"
                  placeholderTextColor={Colors.textMuted}
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>メールアドレス <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>パスワード <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="8文字以上"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              {password.length > 0 && password.length < 8 && (
                <Text style={styles.passwordHint}>あと{8 - password.length}文字必要です</Text>
              )}
            </View>

            <View style={styles.termsRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.termsText}>
                登録することで<Text style={styles.termsLink}>利用規約</Text>および<Text style={styles.termsLink}>プライバシーポリシー</Text>に同意したものとみなします
              </Text>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.registerButtonText}>アカウントを作成</Text>
            </TouchableOpacity>
          </View>

          {/* ログインへ */}
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>すでにアカウントをお持ちですか？</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>ログイン</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 32, gap: 8 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  appTagline: { fontSize: 13, color: Colors.textSecondary },
  form: { gap: 14, marginBottom: 24 },
  formTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  required: { color: Colors.danger },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: Colors.surfaceSecondary,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  passwordHint: { fontSize: 11, color: Colors.danger, marginTop: 2 },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 2,
  },
  termsText: { flex: 1, fontSize: 11, color: Colors.textMuted, lineHeight: 16 },
  termsLink: { color: Colors.primary, fontWeight: '600' },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  loginPrompt: { fontSize: 13, color: Colors.textSecondary },
  loginLink: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
