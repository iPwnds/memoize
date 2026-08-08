import type { Card } from "../data/types";
import { isDue, masteryScore, type CardSrsState } from "./srs";

export interface CardsProgress {
  total: number;
  due: number;
  masteryPct: number; // 0-100
  seen: number;
}

export interface ModuleProgress extends CardsProgress {
  slug: string;
}

/** Progress over an arbitrary subset of cards (e.g. the cards covering one
 *  lecture in a course's syllabus map), not necessarily a whole module. */
export function computeCardsProgress(
  subsetCards: Card[],
  srsMap: Record<string, CardSrsState>,
): CardsProgress {
  const total = subsetCards.length;
  let due = 0;
  let seen = 0;
  let masterySum = 0;
  for (const c of subsetCards) {
    const state = srsMap[c.id];
    if (isDue(state)) due++;
    if (state && state.repetitions > 0) seen++;
    masterySum += masteryScore(state);
  }
  return {
    total,
    due,
    seen,
    masteryPct: total === 0 ? 0 : Math.round((masterySum / total) * 100),
  };
}

export function computeModuleProgress(
  cards: Card[],
  srsMap: Record<string, CardSrsState>,
  moduleSlug: string,
): ModuleProgress {
  const moduleCards = cards.filter((c) => c.module === moduleSlug);
  return { slug: moduleSlug, ...computeCardsProgress(moduleCards, srsMap) };
}

export function dueCards(cards: Card[], srsMap: Record<string, CardSrsState>): Card[] {
  return cards.filter((c) => isDue(srsMap[c.id]));
}

/** Priority order: overdue reviews first (most overdue first), then never-seen cards. */
export function sortByReviewPriority(
  cards: Card[],
  srsMap: Record<string, CardSrsState>,
): Card[] {
  const today = new Date();
  const daysOverdue = (c: Card) => {
    const state = srsMap[c.id];
    if (!state) return -1; // never-seen: lower priority than an overdue review
    const due = new Date(state.due);
    return Math.floor((today.getTime() - due.getTime()) / 86400000);
  };
  return [...cards].sort((a, b) => daysOverdue(b) - daysOverdue(a));
}
