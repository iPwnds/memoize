import type { ModuleMeta } from "./types";

export const MODULES: ModuleMeta[] = [
  // Tier 1
  { slug: "complexity-analysis", title: "Complexity & Analysis", tier: 1, order: 1 },
  { slug: "linear-structures", title: "Core Linear Structures", tier: 1, order: 2 },
  { slug: "hashing", title: "Hashing", tier: 1, order: 3 },
  { slug: "trees-bst", title: "Binary Trees & BSTs", tier: 1, order: 4 },
  { slug: "heaps", title: "Heaps & Priority Queues", tier: 1, order: 5 },
  { slug: "sorting", title: "Sorting", tier: 1, order: 6 },
  { slug: "searching", title: "Searching", tier: 1, order: 7 },
  { slug: "graph-traversal", title: "Graph Traversal", tier: 1, order: 8 },
  { slug: "shortest-paths-mst", title: "Shortest Paths & MST", tier: 1, order: 9 },
  { slug: "recursion-dc", title: "Recursion & Divide-and-Conquer", tier: 1, order: 10 },
  { slug: "dynamic-programming", title: "Dynamic Programming", tier: 1, order: 11 },
  { slug: "greedy", title: "Greedy Algorithms", tier: 1, order: 12 },

  // Tier 2
  { slug: "specialized-trees", title: "Specialized Trees", tier: 2, order: 13 },
  { slug: "advanced-graphs", title: "Advanced Graph Algorithms", tier: 2, order: 14 },
  { slug: "string-algorithms", title: "String Algorithms", tier: 2, order: 15 },
  { slug: "two-pointers-window", title: "Two Pointers, Sliding Window, Prefix Sums", tier: 2, order: 16 },
  { slug: "backtracking", title: "Backtracking", tier: 2, order: 17 },
  { slug: "bit-manipulation", title: "Bit Manipulation", tier: 2, order: 18 },

  // Tier 3
  { slug: "persistent-structures", title: "Advanced Balanced & Persistent Structures", tier: 3, order: 19 },
  { slug: "probabilistic-structures", title: "Probabilistic Data Structures", tier: 3, order: 20 },
  { slug: "computational-geometry", title: "Computational Geometry", tier: 3, order: 21 },
  { slug: "np-completeness", title: "NP-Completeness & Complexity Theory", tier: 3, order: 22 },
  { slug: "number-theory", title: "Number Theory for Algorithms", tier: 3, order: 23 },
  { slug: "systems-adjacent", title: "Systems-Adjacent", tier: 3, order: 24 },

  // MIT 6.006 course track — see src/data/courses.ts for the lecture map.
  // `tier` is a placeholder (unused by any course-aware view; every
  // tier-grouped view filters these out via `course`).
  { slug: "mit6006-foundations", title: "6.006: Foundations", tier: 1, order: 100, course: "mit6006" },
  { slug: "mit6006-sorting-hashing", title: "6.006: Sorting & Hashing", tier: 1, order: 101, course: "mit6006" },
  { slug: "mit6006-trees-heaps", title: "6.006: Trees & Heaps", tier: 1, order: 102, course: "mit6006" },
  { slug: "mit6006-graphs", title: "6.006: Graphs", tier: 1, order: 103, course: "mit6006" },
  { slug: "mit6006-dynamic-programming", title: "6.006: Dynamic Programming", tier: 1, order: 104, course: "mit6006" },
  { slug: "mit6006-complexity", title: "6.006: Complexity", tier: 1, order: 105, course: "mit6006" },
];

export const moduleBySlug = (slug: string): ModuleMeta | undefined =>
  MODULES.find((m) => m.slug === slug);
