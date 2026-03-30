import { create } from "zustand";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isGuest: boolean;
  setUser: (u: User | null) => void;
  setProfile: (p: Profile | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  profile: null,
  isGuest: true,
  setUser: (user) => set({ user, isGuest: !user }),
  setProfile: (profile) => set({ profile }),
  reset: () => set({ user: null, profile: null, isGuest: true }),
}));
