import type { Card, Complexity, ComplexityRow } from "../data/types";

/**
 * Multiple cards can carry a `complexity` block for the same structure
 * (e.g. a Module 1 card's amortized-append note and Module 2's full
 * Dynamic Array operations table both use structure "Dynamic Array").
 * The cheat sheet must show the union of their rows, not just whichever
 * card happened to appear first in ALL_CARDS.
 */
export function mergeComplexityByStructure(cards: Card[]): Complexity[] {
  const byStructure = new Map<string, Complexity>();

  for (const card of cards) {
    if (!card.complexity) continue;
    const { structure, operations, caveat } = card.complexity;
    const existing = byStructure.get(structure);

    if (!existing) {
      byStructure.set(structure, { structure, operations: [...operations], caveat });
      continue;
    }

    const seenOps = new Set(existing.operations.map((op) => op.op));
    const newOps: ComplexityRow[] = operations.filter((op) => !seenOps.has(op.op));
    existing.operations.push(...newOps);
    if (!existing.caveat && caveat) existing.caveat = caveat;
  }

  return [...byStructure.values()];
}
