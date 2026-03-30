import { create } from "zustand";

interface LocationState {
  lat: number | null;
  lng: number | null;
  watching: boolean;
  error: string | null;
  setCoords: (lat: number, lng: number) => void;
  setWatching: (w: boolean) => void;
  setError: (e: string | null) => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  lat: null,
  lng: null,
  watching: false,
  error: null,
  setCoords: (lat, lng) => set({ lat, lng, error: null }),
  setWatching: (watching) => set({ watching }),
  setError: (error) => set({ error }),
}));
