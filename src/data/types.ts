// Card content schema. This is the single source of truth for all study
// content — the app (review queue, browse/cram, cheat sheet, stats) is
// derived entirely from arrays of `Card` exported by src/data/<module>.ts.

export type Tier = 1 | 2 | 3;

export type CardType =
  | "concept"
  | "complexity"
  | "code-trace"
  | "compare"
  | "implementation";

/** One row of a data structure/algorithm's operation-complexity table. */
export interface ComplexityRow {
  /** e.g. "Insert", "Search", "Delete", "Build". */
  op: string;
  time: string;
  space?: string;
  note?: string;
}

/**
 * Structured complexity data. This is the source of truth for the
 * cheat-sheet page — never hand-write a complexity table only inside
 * `back` markdown if the topic belongs on the cheat sheet. When both are
 * present, `back` should render a table generated from this field (see
 * src/lib/complexity.ts `renderComplexityTable`) so there is exactly one
 * source of truth.
 */
export interface Complexity {
  /** Name of the structure/algorithm this table describes, e.g. "Dynamic Array". */
  structure: string;
  operations: ComplexityRow[];
  /** Optional caveat shown under the table, e.g. "Amortized unless noted." */
  caveat?: string;
}

export interface Card {
  /**
   * Stable, namespaced id: "<module-slug>-<topic-slug>". Never reused,
   * never renamed once content ships (SRS progress and `related` links
   * are keyed on it). Example: "sorting-quicksort-partitioning".
   */
  id: string;
  tier: Tier;
  /** Module slug, e.g. "sorting", "graphs-traversal". Must match the
   *  `slug` of an entry in src/data/modules.ts. */
  module: string;
  type: CardType;
  front: string;
  /** Markdown (GFM). May reference a companion `complexity` table. */
  back: string;
  /** Short Python/pseudocode snippet, if relevant. */
  code?: string;
  /** Language for syntax highlighting; defaults to "python". */
  codeLang?: string;
  /** Common mistake or edge case. */
  pitfall?: string;
  /** ids of related cards, for cross-linking. */
  related?: string[];
  /** Structured complexity table; also powers the cheat-sheet page. */
  complexity?: Complexity;
}

export interface ModuleMeta {
  slug: string;
  title: string;
  tier: Tier;
  /** Order within its tier, for stable display/navigation. */
  order: number;
  /**
   * Set when this module belongs to a specific external course (e.g.
   * "mit6006") rather than the generic tiered curriculum. `tier` is still
   * required for id/validator consistency but is not meaningful for course
   * modules — every view that groups by tier must filter these out via
   * `course` and present them through the course track UI instead.
   */
  course?: string;
}
