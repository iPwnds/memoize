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
  {
    id: "mit6045",
    title: "MIT 6.045J / 18.400J — Automata, Computability, and Complexity",
    subtitle: "Spring 2011 · Nancy Lynch · MIT OpenCourseWare",
    quizScopes: [
      { label: "Midterm (Lec 1–12)", lectures: [1, 12] },
      { label: "Final (Lec 13–23)", lectures: [13, 23] },
    ],
  },
  {
    id: "mit6046",
    title: "MIT 6.046J — Design and Analysis of Algorithms",
    subtitle: "Spring 2015 · MIT OpenCourseWare",
    quizScopes: [
      { label: "Quiz 1 (Lec 1–10)", lectures: [1, 10] },
      { label: "Quiz 2 (Lec 11–17)", lectures: [11, 17] },
      { label: "Final (Lec 18–24, emphasis on remainder)", lectures: [18, 24] },
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

export const MIT6045_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "Introduction",
    cardIds: ["mit6045-automata-rules-based-framing"],
  },
  {
    number: 2,
    title: "Logic, Circuits, and Gates",
    cardIds: ["mit6045-automata-boolean-circuits", "mit6045-automata-circuit-limitations"],
  },
  {
    number: 3,
    title: "Deterministic and Nondeterministic Finite Automata",
    cardIds: ["mit6045-automata-dfa-formal-definition", "mit6045-automata-nfa-formal-definition"],
  },
  {
    number: 4,
    title: "NFAs and Regular Expressions",
    cardIds: [
      "mit6045-automata-nfa-to-dfa-subset-construction",
      "mit6045-automata-regular-expressions",
      "mit6045-automata-closure-properties",
    ],
  },
  {
    number: 5,
    title: "Non-Regular Languages and the Pumping Lemma",
    cardIds: [
      "mit6045-automata-pigeonhole-non-regularity",
      "mit6045-automata-palindrome-non-regular",
      "mit6045-automata-countable-vs-uncountable-languages",
      "mit6045-automata-pumping-lemma-statement",
      "mit6045-automata-pumping-lemma-application",
    ],
    problemSet: "Problem Set 1",
  },
  {
    number: 6,
    title: "Turing Machines",
    cardIds: [
      "mit6045-computability-tm-informal-model",
      "mit6045-computability-universal-tm-church-turing",
      "mit6045-computability-diagonalization-uncomputable-problems",
    ],
  },
  {
    number: 7,
    title: "Decidability",
    cardIds: [
      "mit6045-computability-decide-vs-recognize",
      "mit6045-computability-recursively-enumerable",
      "mit6045-computability-encoding-machines-as-strings",
      "mit6045-computability-acc-tm-undecidable",
      "mit6045-computability-halt-tm-reduction",
    ],
    problemSet: "Problem Set 2",
  },
  {
    number: 8,
    title: "Undecidable Problems and the Post Correspondence Problem",
    cardIds: [
      "mit6045-computability-reduction-template",
      "mit6045-computability-post-correspondence-problem",
    ],
  },
  {
    number: 9,
    title: "Mapping Reducibility and Rice's Theorem",
    cardIds: [
      "mit6045-computability-mapping-reducibility-formal",
      "mit6045-computability-mapping-reducibility-non-recognizability",
      "mit6045-computability-rices-theorem",
    ],
  },
  {
    number: 10,
    title: "Self-Reference and the Recursion Theorem",
    cardIds: [
      "mit6045-computability-self-referencing-programs",
      "mit6045-computability-recursion-theorem",
      "mit6045-computability-recursion-theorem-application",
    ],
    problemSet: "Problem Set 3",
  },
  {
    number: 11,
    title: "Introduction to Cryptography",
    cardIds: [
      "mit6045-crypto-classical-ciphers-and-weaknesses",
      "mit6045-crypto-one-time-pad",
      "mit6045-crypto-shannons-theorem",
      "mit6045-crypto-key-reuse-vulnerability",
    ],
  },
  {
    number: 12,
    title: "Complexity Theory",
    cardIds: [
      "mit6045-complexity-time-class-and-model-independence",
      "mit6045-complexity-p-definition",
      "mit6045-complexity-language-not-in-p-and-hierarchy",
    ],
    problemSet: "Problem Set 4",
  },
  {
    number: 13,
    title: "Pseudorandom Generators and One-Way Functions",
    cardIds: [
      "mit6045-crypto-pseudorandom-generators",
      "mit6045-crypto-prg-stretching",
      "mit6045-crypto-enhanced-one-time-pad",
      "mit6045-crypto-one-way-functions",
      "mit6045-crypto-owf-cprg-equivalence",
      "mit6045-crypto-worst-case-vs-average-case",
    ],
  },
  {
    number: 14,
    title: "Public-Key Cryptography",
    cardIds: [
      "mit6045-crypto-yaos-minimax-principle",
      "mit6045-crypto-public-key-motivation",
      "mit6045-crypto-diffie-hellman",
      "mit6045-crypto-rsa",
    ],
  },
  {
    number: 15,
    title: "More Complexity Theory",
    cardIds: [
      "mit6045-complexity-np-two-definitions",
      "mit6045-complexity-poly-time-reducibility",
      "mit6045-complexity-np-completeness-definitions",
    ],
  },
  {
    number: 16,
    title: "More NP-Completeness",
    cardIds: [
      "mit6045-complexity-sat-is-np-complete",
      "mit6045-complexity-3sat-and-cnf-conversion",
      "mit6045-complexity-clique-is-np-complete",
    ],
    problemSet: "Problem Set 5",
  },
  {
    number: 17,
    title: "Probabilistic Turing Machines and Complexity Classes",
    cardIds: [
      "mit6045-complexity-probabilistic-tm-model",
      "mit6045-complexity-bpp-and-rp-definitions",
      "mit6045-complexity-amplification-lemmas",
    ],
  },
  {
    number: 18,
    title: "Trapdoor One-Way Functions and Zero-Knowledge Proofs",
    cardIds: [
      "mit6045-crypto-trapdoor-owf",
      "mit6045-crypto-impagliazzos-five-worlds",
      "mit6045-crypto-zero-knowledge-graph-nonisomorphism",
      "mit6045-crypto-3-coloring-zero-knowledge",
    ],
  },
  {
    number: 19,
    title: "Probably Approximately Correct (PAC) Learning",
    cardIds: [
      "mit6045-learning-quantum-problem-of-induction",
      "mit6045-learning-quantum-pac-framework",
      "mit6045-learning-quantum-sample-complexity-finite",
    ],
  },
  {
    number: 20,
    title: "More PAC Learning",
    cardIds: [
      "mit6045-learning-quantum-vc-dimension",
      "mit6045-learning-quantum-learning-computational-hardness",
      "mit6045-learning-quantum-rsa-learning-connection",
    ],
    problemSet: "Problem Set 6",
  },
  {
    number: 21,
    title: "Introduction to Quantum",
    cardIds: ["mit6045-learning-quantum-physical-basis-of-computation"],
  },
  {
    number: 22,
    title: "Quantum Mechanics and BQP",
    cardIds: [
      "mit6045-learning-quantum-qubits-and-measurement",
      "mit6045-learning-quantum-unitary-transformations",
      "mit6045-learning-quantum-entanglement",
      "mit6045-learning-quantum-no-cloning-and-no-communication",
      "mit6045-learning-quantum-universal-gate-sets-and-bqp",
    ],
  },
  {
    number: 23,
    title: "Quantum Algorithms",
    cardIds: [
      "mit6045-learning-quantum-deutsch-jozsa",
      "mit6045-learning-quantum-simons-algorithm",
      "mit6045-learning-quantum-shors-algorithm",
    ],
  },
];

/**
 * Single source of truth mapping a course id to its lecture map. Every
 * entry in `COURSES` must have a corresponding entry here — enforced by
 * scripts/validate-content.ts — or /courses/<id> silently renders as if
 * the course id itself were invalid.
 */
export const MIT6046_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "Overview, Interval Scheduling",
    cardIds: ["mit6046-dc-greedy-interval-scheduling", "mit6046-dc-weighted-interval-scheduling-dp"],
  },
  {
    number: 2,
    title: "Divide & Conquer: Convex Hull, Median Finding",
    cardIds: ["mit6046-dc-paradigm", "mit6046-dc-convex-hull-merge", "mit6046-dc-median-of-medians"],
  },
  {
    number: 3,
    title: "Divide & Conquer: FFT",
    cardIds: [
      "mit6046-dc-polynomial-representations",
      "mit6046-dc-fft-collapsing-sets",
      "mit6046-dc-fft-algorithm",
    ],
  },
  {
    number: 4,
    title: "Divide & Conquer: Van Emde Boas Trees",
    cardIds: [
      "mit6046-dc-veb-clustering",
      "mit6046-dc-veb-recursive-refinement",
      "mit6046-dc-veb-space",
    ],
  },
  {
    number: 5,
    title: "Amortization: Amortized Analysis",
    cardIds: [
      "mit6046-am-four-methods-overview",
      "mit6046-am-accounting-vs-charging",
      "mit6046-am-potential-method",
      "mit6046-am-tree-splits-merges",
    ],
  },
  {
    number: 6,
    title: "Randomization: Matrix Multiply, Quicksort",
    cardIds: ["mit6046-am-freivalds-algorithm", "mit6046-am-randomized-quicksort-paranoid"],
  },
  {
    number: 7,
    title: "Randomization: Skip Lists",
    cardIds: ["mit6046-am-skip-list-motivation", "mit6046-am-skip-list-whp-analysis"],
  },
  {
    number: 8,
    title: "Randomization: Universal & Perfect Hashing",
    cardIds: [
      "mit6046-am-universal-hashing-theorem",
      "mit6046-am-dot-product-hash-family",
      "mit6046-am-perfect-hashing-fks",
    ],
  },
];

/**
 * Single source of truth mapping a course id to its lecture map. Every
 * entry in `COURSES` must have a corresponding entry here — enforced by
 * scripts/validate-content.ts — or /courses/<id> silently renders as if
 * the course id itself were invalid.
 */
export const COURSE_LECTURE_MAPS: Record<string, CourseLecture[]> = {
  mit6006: MIT6006_LECTURES,
  mit6045: MIT6045_LECTURES,
  mit6046: MIT6046_LECTURES,
};
