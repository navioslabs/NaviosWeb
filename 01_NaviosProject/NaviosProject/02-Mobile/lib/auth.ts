import { isSupabaseConfigured, supabase } from './supabase';

function ensureSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

export async function signIn(email: string, password: string) {
  ensureSupabaseConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(email: string, password: string, displayName: string) {
  ensureSupabaseConfigured();

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = displayName.trim();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { display_name: trimmedName },
    },
  });

  if (error) {
    throw error;
  }

  const userId = data.user?.id;
  if (!userId) {
    return data;
  }

  const { error: profileError } = await supabase.from('users').upsert(
    {
      id: userId,
      email: normalizedEmail,
      display_name: trimmedName,
      avatar: trimmedName.charAt(0).toUpperCase(),
    },
    { onConflict: 'id' },
  );

  if (profileError) {
    throw profileError;
  }

  return data;
}

export async function signOut() {
  ensureSupabaseConfigured();

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
