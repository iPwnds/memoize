import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  dark: boolean;
  toggleDark: () => void;
  setDark: (dark: boolean) => void;
}

const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      dark: prefersDark ?? true,
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      setDark: (dark) => set({ dark }),
    }),
    { name: "memoize-ui-v1" },
  ),
);
