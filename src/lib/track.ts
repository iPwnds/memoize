// Shared "track" filter for Review/Browse: "all" (everything) or a specific
// course — every module belongs to exactly one course, so filtering by
// course is the only scoping dimension below "all". Encoded as a plain
// string so it can live directly in a <select> value.
import { courseOfCard } from "../data";
import type { Card } from "../data/types";

export const ALL_TRACK = "all";
export const courseTrack = (courseId: string) => `course:${courseId}`;

export function matchesTrack(card: Card, track: string): boolean {
  if (track === ALL_TRACK) return true;
  if (track.startsWith("course:")) {
    return courseOfCard(card) === track.slice("course:".length);
  }
  return false;
}
