// Simplified SM-2 spaced repetition, Anki-style 4-button grading.

export type Rating = "again" | "hard" | "good" | "easy";

export interface CardSrsState {
  /** SM-2 ease factor, in [1.3, +inf). Starts at 2.5. */
  ease: number;
  /** Current interval in days. 0 means "not yet scheduled / new". */
  interval: number;
  /** Consecutive successful (non-"again") repetitions. */
  repetitions: number;
  /** ISO date string (yyyy-mm-dd) the card is next due. */
  due: string;
  /** ISO timestamp of the last review, if any. */
  lastReviewed?: string;
}

export const INITIAL_SRS_STATE: CardSrsState = {
  ease: 2.5,
  interval: 0,
  repetitions: 0,
  due: todayIso(),
};

export function todayIso(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const MIN_EASE = 1.3;

/**
 * Applies one SM-2 review step. "Again" always resets the card to a
 * short relearning interval and drops ease — it does not just re-queue
 * the card at its old interval.
 */
export function nextSrsState(
  prev: CardSrsState,
  rating: Rating,
  now: Date = new Date(),
): CardSrsState {
  const lastReviewed = now.toISOString();

  if (rating === "again") {
    return {
      ease: Math.max(MIN_EASE, prev.ease - 0.2),
      interval: 0, // due again today; relearn
      repetitions: 0,
      due: todayIso(now),
      lastReviewed,
    };
  }

  const easeDelta = { hard: -0.15, good: 0, easy: 0.15 }[rating];
  const ease = Math.max(MIN_EASE, prev.ease + easeDelta);
  const repetitions = prev.repetitions + 1;

  let interval: number;
  if (prev.interval === 0) {
    // First successful review out of "new"/relearning.
    interval = rating === "hard" ? 1 : rating === "easy" ? 4 : 1;
  } else if (repetitions === 1) {
    interval = rating === "hard" ? 2 : rating === "easy" ? 5 : 3;
  } else {
    const factor = rating === "hard" ? Math.max(1.2, ease - 0.3) : ease;
    interval = Math.round(prev.interval * factor);
    if (rating === "easy") interval = Math.round(interval * 1.3);
  }
  interval = Math.max(1, interval);

  return {
    ease,
    interval,
    repetitions,
    due: todayIso(addDays(now, interval)),
    lastReviewed,
  };
}

export function isDue(state: CardSrsState | undefined, now: Date = new Date()): boolean {
  if (!state) return true; // never-seen cards are due
  return state.due <= todayIso(now);
}

/** Rough per-card mastery score in [0, 1], used for progress %. */
export function masteryScore(state: CardSrsState | undefined): number {
  if (!state || state.repetitions === 0) return 0;
  return Math.min(1, state.interval / 21); // "mastered" once interval reaches ~3 weeks
}
