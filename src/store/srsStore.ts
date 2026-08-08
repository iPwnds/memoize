import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  INITIAL_SRS_STATE,
  nextSrsState,
  todayIso,
  type CardSrsState,
  type Rating,
} from "../lib/srs";

interface StreakState {
  current: number;
  longest: number;
  lastStudyDate?: string; // ISO yyyy-mm-dd
}

interface SrsStoreState {
  cards: Record<string, CardSrsState>;
  streak: StreakState;
  /** Total reviews ever, for lifetime stats. */
  totalReviews: number;
  rate: (cardId: string, rating: Rating) => void;
  getState: (cardId: string) => CardSrsState | undefined;
  resetCard: (cardId: string) => void;
  resetAll: () => void;
}

function bumpStreak(streak: StreakState, now: Date): StreakState {
  const today = todayIso(now);
  if (streak.lastStudyDate === today) return streak; // already studied today
  const yesterday = todayIso(new Date(now.getTime() - 86400000));
  const current = streak.lastStudyDate === yesterday ? streak.current + 1 : 1;
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastStudyDate: today,
  };
}

export const useSrsStore = create<SrsStoreState>()(
  persist(
    (set, get) => ({
      cards: {},
      streak: { current: 0, longest: 0 },
      totalReviews: 0,
      rate: (cardId, rating) => {
        const now = new Date();
        const prev = get().cards[cardId] ?? INITIAL_SRS_STATE;
        const next = nextSrsState(prev, rating, now);
        set((s) => ({
          cards: { ...s.cards, [cardId]: next },
          streak: bumpStreak(s.streak, now),
          totalReviews: s.totalReviews + 1,
        }));
      },
      getState: (cardId) => get().cards[cardId],
      resetCard: (cardId) =>
        set((s) => {
          const cards = { ...s.cards };
          delete cards[cardId];
          return { cards };
        }),
      resetAll: () => set({ cards: {}, streak: { current: 0, longest: 0 }, totalReviews: 0 }),
    }),
    { name: "memoize-srs-v1" },
  ),
);
