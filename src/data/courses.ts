// Course syllabus maps. Every module belongs to exactly one course
// (ModuleMeta.course) — there is no more "courseless" generic content.
// Two shapes of course exist:
//   - Lecture-numbered (e.g. MIT 6.006): has an entry in
//     COURSE_LECTURE_MAPS below, each lecture pointing at the card ids that
//     cover it. Rendered by CoursePage as a lecture-by-lecture tracker.
//   - Module-grouped (e.g. Complexity Class): has no lecture map — CoursePage
//     falls back to grouping that course's MODULES by tier instead, since
//     there's no external lecture numbering to track against.

export interface CourseMeta {
  id: string;
  title: string;
  subtitle: string;
  /** Which Quiz (or the Final) this course's own review sheets scope each
   *  lecture range to — lets the tracker group lectures by exam. Only
   *  meaningful for lecture-numbered courses; omit for module-grouped ones. */
  quizScopes?: { label: string; lectures: [number, number] }[];
}

export interface CourseLecture {
  number: number;
  title: string;
  /** Card ids covering this lecture, in reading order. */
  cardIds: string[];
  recitation?: string;
  problemSet?: string;
  problemSession?: string;
  /** Set for lectures with no dedicated card content (e.g. a review or
   *  "next steps" talk) — the tracker explains why instead of showing 0/0. */
  noCardContent?: string;
}

export const COURSES: CourseMeta[] = [
  {
    id: "complexity-class",
    title: "Complexity Class",
    subtitle:
      "The original Memoize curriculum — algorithms & data structures from first-principles complexity analysis through advanced/specialized topics, independent of any single external course.",
  },
  {
    id: "mit6006",
    title: "MIT 6.006 — Introduction to Algorithms",
    subtitle: "Spring 2020 · Erik Demaine, Jason Ku, Justin Solomon · MIT OpenCourseWare",
    quizScopes: [
      { label: "Quiz 1", lectures: [1, 8] },
      { label: "Quiz 2", lectures: [9, 14] },
      { label: "Quiz 3", lectures: [15, 18] },
      { label: "Final (all, emphasis on 19–21)", lectures: [19, 21] },
    ],
  },
];

export const MIT6006_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "Algorithms and Computation",
    cardIds: [
      "mit6006-foundations-problem-vs-algorithm",
      "mit6006-foundations-induction-correctness",
      "mit6006-foundations-word-ram",
      "mit6006-foundations-how-to-solve",
    ],
    recitation: "Recitation 1",
    problemSet: "Problem Set 0",
    problemSession: "Problem Session 1",
  },
  {
    number: 2,
    title: "Data Structures",
    cardIds: [
      "mit6006-foundations-sequence-interface",
      "mit6006-foundations-set-interface",
      "mit6006-foundations-array-sequence",
      "mit6006-foundations-linked-list-sequence",
      "mit6006-foundations-dynamic-array-doubling",
      "mit6006-foundations-amortized-definition",
      "mit6006-foundations-set-from-sequence",
    ],
    recitation: "Recitation 2",
    problemSet: "Problem Set 0",
    problemSession: "Problem Session 1",
  },
  {
    number: 3,
    title: "Sets and Sorting",
    cardIds: [
      "mit6006-sorting-hashing-sorted-array-set",
      "mit6006-sorting-hashing-destructive-in-place",
      "mit6006-sorting-hashing-recurrence-methods",
      "sorting-selection-overview",
      "sorting-insertion-overview",
      "sorting-merge-overview",
    ],
    recitation: "Recitation 3",
    problemSet: "Problem Set 1",
    problemSession: "Problem Session 2",
  },
  {
    number: 4,
    title: "Hashing",
    cardIds: [
      "mit6006-sorting-hashing-comparison-search-lower-bound",
      "mit6006-sorting-hashing-direct-access-array",
      "mit6006-sorting-hashing-chaining-terminology",
      "mit6006-sorting-hashing-universal-hashing",
      "mit6006-sorting-hashing-set-implementations-summary",
    ],
    recitation: "Recitation 4",
    problemSet: "Problem Set 1",
    problemSession: "Problem Session 2",
  },
  {
    number: 5,
    title: "Linear Sorting",
    cardIds: [
      "mit6006-sorting-hashing-direct-access-sort",
      "mit6006-sorting-hashing-radix-sort-derivation",
      "sorting-counting-sort",
      "sorting-radix-sort",
    ],
    recitation: "Recitation 5",
    problemSet: "Problem Set 2",
    problemSession: "Problem Session 3",
  },
  {
    number: 6,
    title: "Binary Trees, Part 1",
    cardIds: [
      "trees-bst-terminology",
      "mit6006-trees-heaps-rotations-suffice",
      "mit6006-trees-heaps-augment-steps",
      "mit6006-trees-heaps-order-statistics-tree",
      "trees-bst-successor-predecessor",
    ],
    recitation: "Recitation 6",
    problemSet: "Problem Set 3",
    problemSession: "Problem Session 4",
  },
  {
    number: 7,
    title: "Binary Trees, Part 2: AVL",
    cardIds: [
      "mit6006-trees-heaps-avl-height-bound",
      "mit6006-trees-heaps-avl-local-rebalance",
      "trees-bst-avl-rotations",
      "mit6006-trees-heaps-avl-sort",
    ],
    recitation: "Recitation 7",
    problemSet: "Problem Set 3",
    problemSession: "Problem Session 4",
  },
  {
    number: 8,
    title: "Binary Heaps",
    cardIds: [
      "mit6006-trees-heaps-priority-queue-interface",
      "mit6006-trees-heaps-priority-queue-sort-family",
      "heaps-array-representation",
      "heaps-sift-up",
      "heaps-sift-down",
      "heaps-build-heap-on",
      "mit6006-trees-heaps-sequence-avl-priority-queue",
      "mit6006-trees-heaps-set-vs-multiset",
    ],
    recitation: "Recitation 8",
    problemSet: "Problem Set 4",
  },
  {
    number: 9,
    title: "Breadth-First Search",
    cardIds: [
      "mit6006-graphs-representation-cost-model",
      "graph-traversal-bfs",
      "mit6006-graphs-problem-hierarchy",
    ],
    recitation: "Recitation 9",
    problemSet: "Problem Set 4",
  },
  {
    number: 10,
    title: "Depth-First Search",
    cardIds: [
      "graph-traversal-dfs",
      "mit6006-graphs-full-search-pattern",
      "graph-traversal-topo-dfs",
      "graph-traversal-cycle-directed",
    ],
    recitation: "Recitation 10",
    problemSession: "Problem Session 5",
  },
  {
    number: 11,
    title: "Weighted Shortest Paths",
    cardIds: [
      "mit6006-graphs-weighted-shortest-path-definitions",
      "mit6006-graphs-relaxation",
      "mit6006-graphs-dag-relaxation",
      "mit6006-graphs-shortest-paths-tree-reconstruction",
    ],
    recitation: "Recitation 11",
    problemSession: "Problem Session 5",
  },
  {
    number: 12,
    title: "Bellman-Ford",
    cardIds: [
      "mit6006-graphs-bellman-ford-graph-duplication",
      "mit6006-graphs-bellman-ford-negative-cycle-witness",
      "shortest-paths-mst-bellman-ford",
    ],
    recitation: "Recitation 12",
    problemSet: "Problem Set 5",
    problemSession: "Problem Session 6",
  },
  {
    number: 13,
    title: "Dijkstra's Algorithm",
    cardIds: [
      "shortest-paths-mst-dijkstra-overview",
      "mit6006-graphs-dijkstra-changeable-pq",
      "mit6006-graphs-sssp-summary",
    ],
    recitation: "Recitation 13",
    problemSet: "Problem Set 6",
    problemSession: "Problem Session 7",
  },
  {
    number: 14,
    title: "Johnson's Algorithm",
    cardIds: [
      "mit6006-graphs-reweighting-potential-function",
      "mit6006-graphs-johnsons-algorithm",
    ],
    recitation: "Recitation 14",
    problemSet: "Problem Set 6",
    problemSession: "Problem Session 7",
  },
  {
    number: 15,
    title: "Dynamic Programming, Part 1: Recursive Algorithms",
    cardIds: [
      "mit6006-dp-recursive-algorithm-classification",
      "mit6006-dp-srt-bot-framework",
      "mit6006-dp-fibonacci-memoization",
      "mit6006-dp-dag-shortest-paths-as-dp",
      "mit6006-dp-bowling-problem",
    ],
    recitation: "Recitation 15",
    problemSession: "Problem Session 8",
  },
  {
    number: 16,
    title: "Dynamic Programming, Part 2: Subproblems",
    cardIds: [
      "mit6006-dp-lcs-srt-bot",
      "mit6006-dp-lis-srt-bot",
      "mit6006-dp-alternating-coin-game",
      "mit6006-dp-subproblem-constraint-expansion",
      "mit6006-dp-max-subarray-sum",
    ],
    recitation: "Recitation 16",
    problemSession: "Problem Session 8",
  },
  {
    number: 17,
    title: "Dynamic Programming, Part 3: APSP, Parens, Piano",
    cardIds: [
      "mit6006-dp-sssp-revisited-bridge",
      "mit6006-dp-floyd-warshall-srt-bot",
      "mit6006-dp-arithmetic-parenthesization",
      "mit6006-dp-piano-fingering",
    ],
    recitation: "Recitation 17",
    problemSet: "Problem Set 7",
  },
  {
    number: 18,
    title: "Dynamic Programming, Part 4: Pseudopolynomials",
    cardIds: [
      "mit6006-dp-rod-cutting",
      "mit6006-dp-subset-sum",
      "mit6006-dp-pseudopolynomial",
      "mit6006-dp-main-features-summary",
    ],
    recitation: "Recitation 18",
    problemSet: "Problem Set 8",
    problemSession: "Problem Session 9",
  },
  {
    number: 19,
    title: "Complexity",
    cardIds: [
      "mit6006-complexity-decidability",
      "np-completeness-p-vs-np",
      "mit6006-complexity-np-certificates",
      "mit6006-complexity-reduction-examples",
      "np-completeness-nphard-vs-npcomplete",
      "np-completeness-sat",
      "mit6006-complexity-exp-complete-chess",
      "mit6006-complexity-reduction-chains",
      "np-completeness-classic-problems",
    ],
    recitation: "Recitation 19",
    problemSet: "Problem Set 8",
    problemSession: "Problem Session 9",
  },
  { number: 20, title: "Course Review", cardIds: [], noCardContent: "A review session — no new material. Use this slot to revisit weak spots from Lectures 1–19 via Browse or Cram." },
  { number: 21, title: "Algorithms — Next Steps", cardIds: [], noCardContent: "A closing talk pointing toward 6.046/6.854 (design & analysis) and other follow-on courses — no new testable material." },
];

/**
 * Single source of truth mapping a course id to its lecture map. Every
 * entry in `COURSES` must have a corresponding entry here — enforced by
 * scripts/validate-content.ts — or /courses/<id> silently renders as if
 * the course id itself were invalid.
 */
export const COURSE_LECTURE_MAPS: Record<string, CourseLecture[]> = {
  mit6006: MIT6006_LECTURES,
};
