// Course syllabus maps. These sit alongside the tiered curriculum and give
// a course-scoped reading order: each lecture points at the card ids that
// cover it, mixing course-specific cards (module slug prefixed `mit6006-`)
// with existing generic-curriculum cards via cross-reference. `cardIds` is
// filled in as each module is written — see src/data/index.ts for the
// modules that back this course.

export interface CourseMeta {
  id: string;
  title: string;
  subtitle: string;
  /** Which Quiz (or the Final) this course's own review sheets scope each
   *  lecture range to — lets the tracker group lectures by exam. */
  quizScopes: { label: string; lectures: [number, number] }[];
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
  { number: 6, title: "Binary Trees, Part 1", cardIds: [], recitation: "Recitation 6", problemSet: "Problem Set 3", problemSession: "Problem Session 4" },
  { number: 7, title: "Binary Trees, Part 2: AVL", cardIds: [], recitation: "Recitation 7", problemSet: "Problem Set 3", problemSession: "Problem Session 4" },
  { number: 8, title: "Binary Heaps", cardIds: [], recitation: "Recitation 8", problemSet: "Problem Set 4" },
  { number: 9, title: "Breadth-First Search", cardIds: [], recitation: "Recitation 9", problemSet: "Problem Set 4" },
  { number: 10, title: "Depth-First Search", cardIds: [], recitation: "Recitation 10", problemSession: "Problem Session 5" },
  { number: 11, title: "Weighted Shortest Paths", cardIds: [], recitation: "Recitation 11", problemSession: "Problem Session 5" },
  { number: 12, title: "Bellman-Ford", cardIds: [], recitation: "Recitation 12", problemSet: "Problem Set 5", problemSession: "Problem Session 6" },
  { number: 13, title: "Dijkstra's Algorithm", cardIds: [], recitation: "Recitation 13", problemSet: "Problem Set 6", problemSession: "Problem Session 7" },
  { number: 14, title: "Johnson's Algorithm", cardIds: [], recitation: "Recitation 14", problemSet: "Problem Set 6", problemSession: "Problem Session 7" },
  { number: 15, title: "Dynamic Programming, Part 1: Recursive Algorithms", cardIds: [], recitation: "Recitation 15", problemSession: "Problem Session 8" },
  { number: 16, title: "Dynamic Programming, Part 2: Subproblems", cardIds: [], recitation: "Recitation 16", problemSession: "Problem Session 8" },
  { number: 17, title: "Dynamic Programming, Part 3: APSP, Parens, Piano", cardIds: [], recitation: "Recitation 17", problemSet: "Problem Set 7" },
  { number: 18, title: "Dynamic Programming, Part 4: Pseudopolynomials", cardIds: [], recitation: "Recitation 18", problemSet: "Problem Set 8", problemSession: "Problem Session 9" },
  { number: 19, title: "Complexity", cardIds: [], recitation: "Recitation 19", problemSet: "Problem Set 8", problemSession: "Problem Session 9" },
  { number: 20, title: "Course Review", cardIds: [], noCardContent: "A review session — no new material. Use this slot to revisit weak spots from Lectures 1–19 via Browse or Cram." },
  { number: 21, title: "Algorithms — Next Steps", cardIds: [], noCardContent: "A closing talk pointing toward 6.046/6.854 (design & analysis) and other follow-on courses — no new testable material." },
];
