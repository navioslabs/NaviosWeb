import { create } from "zustand";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  show: (msg: string, type?: "success" | "error" | "info") => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  message: "",
  type: "info",
  visible: false,
  show: (message, type = "info") => {
    set({ message, type, visible: true });
    setTimeout(() => set({ visible: false }), 3000);
  },
  hide: () => set({ visible: false }),
}));
