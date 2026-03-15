import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { signUp } from '../../lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    if (!displayName.trim()) {
      setErrorMessage('表示名を入力してください。');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('メールアドレスを入力してください。');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('パスワードは8文字以上で入力してください。');
      return;
    }

    try {
      setSubmitting(true);
      await signUp(email, password, displayName);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'アカウント作成に失敗しました。';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="location" size={36} color="#fff" />
            </View>
            <Text style={styles.appName}>NaviOs</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.formTitle}>新規登録</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>表示名</Text>
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={(text) => { setDisplayName(text); setErrorMessage(''); }}
                  placeholder="例：太郎"
                  placeholderTextColor={Colors.textMuted}
                  autoCorrect={false}
                  editable={!submitting}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>メールアドレス</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
                  placeholder="example@email.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!submitting}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>パスワード</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
                  placeholder="8文字以上で入力してください"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!submitting}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  disabled={submitting}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
              {password.length > 0 && password.length < 8 ? <Text style={styles.passwordHint}>あと{8 - password.length}文字必要です</Text> : null}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, submitting && styles.registerButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.registerButtonText}>アカウント作成</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>既にアカウントをお持ちの方</Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity disabled={submitting}>
                <Text style={styles.loginLink}>ログイン</Text>
              </TouchableOpacity>
            </Link>
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
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  form: { gap: 14, marginBottom: 24 },
  formTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
  },
  input: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  passwordHint: { fontSize: 11, color: Colors.danger, marginTop: 2 },
  errorText: { fontSize: 12, color: Colors.danger, marginTop: 4, paddingHorizontal: 4 },
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
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  loginPrompt: { fontSize: 13, color: Colors.textSecondary },
  loginLink: { fontSize: 13, fontWeight: '700', color: Colors.primary },
});
