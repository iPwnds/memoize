// Shared "track" filter for Review/Browse: either a generic tier (1/2/3),
// "all" (everything, tiers and courses alike), or a specific course. Encoded
// as a plain string so it can live directly in a <select> value.
import { courseOfCard } from "../data";
import type { Card } from "../data/types";

export const ALL_TRACK = "all";
export const courseTrack = (courseId: string) => `course:${courseId}`;

export function matchesTrack(card: Card, track: string): boolean {
  if (track === ALL_TRACK) return true;
  if (track.startsWith("course:")) {
    return courseOfCard(card) === track.slice("course:".length);
  }
  const tierNum = Number(track);
  return card.tier === tierNum && !courseOfCard(card);
}
