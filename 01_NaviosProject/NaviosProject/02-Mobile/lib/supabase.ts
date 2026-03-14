import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FALLBACK_SUPABASE_URL = 'https://invalid-project-ref.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'invalid-anon-key';
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseEnv) {
  console.error(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Auth/network calls are disabled.',
  );
}

export const isSupabaseConfigured = hasSupabaseEnv;

export const supabase = createClient(
  supabaseUrl ?? FALLBACK_SUPABASE_URL,
  supabaseAnonKey ?? FALLBACK_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
