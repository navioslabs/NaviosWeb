import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAuth', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('resolves to no session when getSession returns null', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets session when getSession returns a session', async () => {
    const mockSession = {
      user: { id: 'user-1', email: 'test@example.com' },
      access_token: 'token',
    };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.session).toBe(mockSession);
    expect(result.current.user).toEqual(mockSession.user);
  });

  it('sets error when getSession rejects', async () => {
    (supabase.auth.getSession as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.session).toBeNull();
  });

  it('subscribes to auth state changes', () => {
    renderHook(() => useAuth());
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });
});
