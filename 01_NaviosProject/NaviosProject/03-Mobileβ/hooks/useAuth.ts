import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const SESSION_INIT_TIMEOUT_MS = 10000;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setError('Supabase env is missing.');
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Session initialization timed out.')), SESSION_INIT_TIMEOUT_MS);
        });
        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        if (!isMounted) return;
        setSession(data.session);
      } catch (initError) {
        if (!isMounted) return;
        const message = initError instanceof Error ? initError.message : 'Failed to initialize session.';
        setError(message);
        setSession(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      setLoading(false);
      setError(null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, user: session?.user ?? null, error };
}
