import type { ModuleMeta } from "./types";

const CC = "complexity-class";

export const MODULES: ModuleMeta[] = [
  // Complexity Class — Tier 1
  { slug: "complexity-analysis", title: "Complexity & Analysis", tier: 1, order: 1, course: CC },
  { slug: "linear-structures", title: "Core Linear Structures", tier: 1, order: 2, course: CC },
  { slug: "hashing", title: "Hashing", tier: 1, order: 3, course: CC },
  { slug: "trees-bst", title: "Binary Trees & BSTs", tier: 1, order: 4, course: CC },
  { slug: "heaps", title: "Heaps & Priority Queues", tier: 1, order: 5, course: CC },
  { slug: "sorting", title: "Sorting", tier: 1, order: 6, course: CC },
  { slug: "searching", title: "Searching", tier: 1, order: 7, course: CC },
  { slug: "graph-traversal", title: "Graph Traversal", tier: 1, order: 8, course: CC },
  { slug: "shortest-paths-mst", title: "Shortest Paths & MST", tier: 1, order: 9, course: CC },
  { slug: "recursion-dc", title: "Recursion & Divide-and-Conquer", tier: 1, order: 10, course: CC },
  { slug: "dynamic-programming", title: "Dynamic Programming", tier: 1, order: 11, course: CC },
  { slug: "greedy", title: "Greedy Algorithms", tier: 1, order: 12, course: CC },

  // Complexity Class — Tier 2
  { slug: "specialized-trees", title: "Specialized Trees", tier: 2, order: 13, course: CC },
  { slug: "advanced-graphs", title: "Advanced Graph Algorithms", tier: 2, order: 14, course: CC },
  { slug: "string-algorithms", title: "String Algorithms", tier: 2, order: 15, course: CC },
  { slug: "two-pointers-window", title: "Two Pointers, Sliding Window, Prefix Sums", tier: 2, order: 16, course: CC },
  { slug: "backtracking", title: "Backtracking", tier: 2, order: 17, course: CC },
  { slug: "bit-manipulation", title: "Bit Manipulation", tier: 2, order: 18, course: CC },

  // Complexity Class — Tier 3
  { slug: "persistent-structures", title: "Advanced Balanced & Persistent Structures", tier: 3, order: 19, course: CC },
  { slug: "probabilistic-structures", title: "Probabilistic Data Structures", tier: 3, order: 20, course: CC },
  { slug: "computational-geometry", title: "Computational Geometry", tier: 3, order: 21, course: CC },
  { slug: "np-completeness", title: "NP-Completeness & Complexity Theory", tier: 3, order: 22, course: CC },
  { slug: "number-theory", title: "Number Theory for Algorithms", tier: 3, order: 23, course: CC },
  { slug: "systems-adjacent", title: "Systems-Adjacent", tier: 3, order: 24, course: CC },

  // MIT 6.006 course track — see src/data/courses.ts for the lecture map.
  // `tier` is a placeholder: this course is lecture-numbered (via
  // COURSE_LECTURE_MAPS), not tier-grouped, so `tier`/`order` here are only
  // used for id/validator consistency, not for any rendered grouping.
  { slug: "mit6006-foundations", title: "6.006: Foundations", tier: 1, order: 100, course: "mit6006" },
  { slug: "mit6006-sorting-hashing", title: "6.006: Sorting & Hashing", tier: 1, order: 101, course: "mit6006" },
  { slug: "mit6006-trees-heaps", title: "6.006: Trees & Heaps", tier: 1, order: 102, course: "mit6006" },
  { slug: "mit6006-graphs", title: "6.006: Graphs", tier: 1, order: 103, course: "mit6006" },
  { slug: "mit6006-dp", title: "6.006: Dynamic Programming", tier: 1, order: 104, course: "mit6006" },
  { slug: "mit6006-complexity", title: "6.006: Complexity", tier: 1, order: 105, course: "mit6006" },

  // MIT 6.045J course track — see src/data/courses.ts for the lecture map.
  // Same placeholder-tier note as mit6006 above: lecture-numbered, not
  // tier-grouped, so `tier`/`order` are only for id/validator consistency.
  { slug: "mit6045-automata", title: "6.045: Automata & Regular Languages", tier: 1, order: 200, course: "mit6045" },
  { slug: "mit6045-computability", title: "6.045: Turing Machines & Computability", tier: 1, order: 201, course: "mit6045" },
  { slug: "mit6045-complexity", title: "6.045: Complexity Theory & NP-Completeness", tier: 1, order: 202, course: "mit6045" },
];

export const moduleBySlug = (slug: string): ModuleMeta | undefined =>
  MODULES.find((m) => m.slug === slug);
