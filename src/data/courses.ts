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
  {
    id: "mit6004",
    title: "MIT 6.004 — Computation Structures",
    subtitle: "Spring 2009 · Steve Ward · MIT OpenCourseWare",
    quizScopes: [
      { label: "Quiz 1 (Lec 1–5)", lectures: [1, 5] },
      { label: "Quiz 2 (Lec 6–10)", lectures: [6, 10] },
      { label: "Quiz 3 (Lec 11–15)", lectures: [11, 15] },
      { label: "Quiz 4 (Lec 16–20)", lectures: [16, 20] },
      { label: "Quiz 5 (Lec 21–25)", lectures: [21, 25] },
    ],
  },
  {
    id: "mit6828",
    title: "MIT 6.828 — Operating System Engineering",
    subtitle: "Fall 2012 · Frans Kaashoek, Robert Morris · MIT OpenCourseWare",
    quizScopes: [
      { label: "Quiz (Lec 1–13)", lectures: [1, 13] },
      { label: "Post-Quiz (Lec 14–25)", lectures: [14, 25] },
    ],
  },
  {
    id: "mit6035",
    title: "MIT 6.035 — Computer Language Engineering",
    subtitle: "Spring 2010 · Martin Rinard · MIT OpenCourseWare",
    quizScopes: [
      { label: "Front End (Lec 1–9)", lectures: [1, 9] },
      { label: "Optimization & Back End (Lec 10–20)", lectures: [10, 20] },
    ],
  },
  {
    id: "mit6120",
    title: "MIT 6.1200J — Mathematics for Computer Science",
    subtitle:
      "Spring 2024 (formerly 6.042J) · Zachary Abel, Brynmor Chapman, Erik Demaine · MIT OpenCourseWare",
    // The course's own unit structure (from its readings page); the Spring
    // 2024 OCW site doesn't publish quiz ranges.
    quizScopes: [
      { label: "Unit 1: Proofs", lectures: [1, 4] },
      { label: "Unit 2: Algorithm Analysis", lectures: [5, 7] },
      { label: "Unit 3: Number Theory", lectures: [8, 10] },
      { label: "Unit 4: Graphs", lectures: [11, 14] },
      { label: "Unit 5: Counting", lectures: [15, 17] },
      { label: "Unit 6: Probability", lectures: [18, 24] },
    ],
  },
  {
    id: "mit1806",
    title: "MIT 18.06 — Linear Algebra",
    subtitle:
      "18.06SC Fall 2011 · Gilbert Strang · MIT OpenCourseWare (lecture numbers follow Strang's video lectures)",
    quizScopes: [
      { label: "Unit I: Ax = b and the Four Subspaces", lectures: [1, 13] },
      { label: "Unit II: Least Squares, Determinants and Eigenvalues", lectures: [14, 24] },
      { label: "Unit III: Positive Definite Matrices and Applications", lectures: [25, 34] },
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
  {
    number: 9,
    title: "Augmentation: Range Trees",
    cardIds: ["mit6046-augdp-finger-search-trees", "mit6046-augdp-range-trees"],
  },
  {
    number: 10,
    title: "Dynamic Programming: Advanced DP",
    cardIds: ["mit6046-augdp-longest-palindromic-subsequence", "mit6046-augdp-optimal-bst"],
    problemSet: "Problem Set 5",
  },
  {
    number: 11,
    title: "Dynamic Programming: All-Pairs Shortest Paths",
    cardIds: ["mit6046-augdp-apsp-matrix-multiplication", "mit6046-augdp-difference-constraints"],
  },
  {
    number: 12,
    title: "Greedy Algorithms: Minimum Spanning Tree",
    cardIds: ["mit6046-augdp-mst-formal-proofs"],
  },
  {
    number: 13,
    title: "Incremental Improvement: Max Flow, Min Cut",
    cardIds: ["mit6046-flowlp-formal-flow-cut-algebra"],
  },
  {
    number: 14,
    title: "Incremental Improvement: Matching",
    cardIds: ["mit6046-flowlp-adversarial-slow-example"],
    problemSet: "Problem Set 7",
  },
  {
    number: 15,
    title: "Linear Programming: LP, Reductions, Simplex",
    cardIds: [
      "mit6046-flowlp-standard-form-and-duality",
      "mit6046-flowlp-formulating-known-problems",
      "mit6046-flowlp-simplex-algorithm",
    ],
  },
  {
    number: 16,
    title: "Complexity: P, NP, NP-completeness, Reductions",
    cardIds: ["mit6046-cx-reduction-chain-gadgets", "mit6046-cx-weak-vs-strong-nphard"],
    problemSet: "Problem Set 7",
  },
  {
    number: 17,
    title: "Complexity: Approximation Algorithms",
    cardIds: [
      "mit6046-cx-approximation-ratio-ptas-fptas",
      "mit6046-cx-vertex-cover-natural-vs-edge-picking",
      "mit6046-cx-set-cover-greedy-approx",
      "mit6046-cx-partition-ptas",
    ],
  },
  {
    number: 18,
    title: "Complexity: Fixed-Parameter Algorithms",
    cardIds: [
      "mit6046-cx-fixed-parameter-tractability",
      "mit6046-cx-bounded-search-kernelization",
      "mit6046-cx-eptas-fpt-connection",
    ],
  },
  {
    number: 19,
    title: "Synchronous Distributed Algorithms: Symmetry-Breaking, Shortest-Paths Spanning Trees",
    cardIds: [
      "mit6046-dist-synchronous-model",
      "mit6046-dist-leader-election-impossibility",
      "mit6046-dist-leader-election-uid-and-random",
      "mit6046-dist-mis-lubys-algorithm",
      "mit6046-dist-mis-termination",
      "mit6046-dist-sync-bfs-spanning-tree",
    ],
  },
  {
    number: 20,
    title: "Asynchronous Distributed Algorithms: Shortest-Paths Spanning Trees",
    cardIds: ["mit6046-dist-asynchronous-model"],
    problemSet: "Problem Set 9",
  },
  {
    number: 21,
    title: "Cryptography: Hash Functions",
    cardIds: ["mit6046-final-hash-function-properties", "mit6046-final-hash-applications"],
  },
  {
    number: 22,
    title: "Cryptography: Encryption",
    cardIds: [
      "mit6046-final-mitm-diffie-hellman",
      "mit6046-final-np-completeness-average-case-crypto",
      "mit6046-final-merkle-hellman-knapsack",
    ],
    problemSet: "Problem Set 10",
  },
  {
    number: 23,
    title: "Cache-Oblivious Algorithms: Medians & Matrices",
    cardIds: [
      "mit6046-final-cache-models",
      "mit6046-final-cache-scanning",
      "mit6046-final-cache-median-finding",
      "mit6046-final-cache-blocked-matrix-multiply",
    ],
  },
  {
    number: 24,
    title: "Cache-Oblivious Algorithms: Searching & Sorting",
    cardIds: [
      "mit6046-final-lru-competitiveness",
      "mit6046-final-veb-layout-cache-oblivious-search",
      "mit6046-final-cache-oblivious-sorting",
    ],
  },
];

export const MIT6004_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "Course Overview and Mechanics, Basics of Information",
    cardIds: [
      "mit6004-basics-shannon-information",
      "mit6004-basics-encoding-schemes",
      "mit6004-basics-twos-complement",
      "mit6004-basics-hamming-error-correction",
    ],
  },
  {
    number: 2,
    title: "Digital Abstraction, Combinational Logic, Voltage-Based Encoding",
    cardIds: [
      "mit6004-basics-digital-contracts-and-abstraction",
      "mit6004-basics-digital-combinational-device",
      "mit6004-basics-digital-noise-sources",
      "mit6004-basics-digital-vtc-noise-margins",
    ],
  },
  {
    number: 3,
    title: "CMOS Technology, Gate Design, Timing",
    cardIds: [
      "mit6004-basics-cmos-mosfet-switch-model",
      "mit6004-basics-cmos-design-rules",
      "mit6004-basics-cmos-gate-synthesis",
      "mit6004-basics-cmos-timing-contract",
      "mit6004-basics-cmos-power-and-reversible-computing",
    ],
  },
  {
    number: 4,
    title: "Canonical Forms; Synthesis, Simplification",
    cardIds: [
      "mit6004-logic-sum-of-products",
      "mit6004-logic-tree-vs-fanin",
      "mit6004-logic-boolean-minimization",
      "mit6004-logic-mux-rom-synthesis",
    ],
  },
  {
    number: 5,
    title: "Sequential Logic",
    cardIds: [
      "mit6004-logic-seq-storage-and-feedback",
      "mit6004-logic-seq-d-latch",
      "mit6004-logic-seq-combinational-cycle-problem",
      "mit6004-logic-seq-edge-triggered-flipflop",
    ],
  },
  {
    number: 6,
    title: "Storage Elements, Finite State Machines",
    cardIds: [
      "mit6004-logic-fsm-formal-definition",
      "mit6004-logic-fsm-hardware-implementation",
      "mit6004-logic-fsm-equivalence-minimization",
    ],
  },
  {
    number: 7,
    title: "Synchronization, Metastability",
    cardIds: [
      "mit6004-logic-sync-arbiter-unsolvability",
      "mit6004-logic-sync-metastable-state",
      "mit6004-logic-sync-metastability-probability",
      "mit6004-logic-sync-practical-synchronizers",
    ],
  },
  {
    number: 8,
    title: "Pipelining; Throughput and Latency",
    cardIds: [
      "mit6004-pipe-latency-throughput",
      "mit6004-pipe-formal-definition",
      "mit6004-pipe-design-methodology",
      "mit6004-pipe-bottleneck-and-interleaving",
      "mit6004-pipe-control-structures",
    ],
  },
  {
    number: 9,
    title: "Case Study: Multipliers",
    cardIds: [
      "mit6004-pipe-mult-recursive-construction",
      "mit6004-pipe-mult-latency-insight",
      "mit6004-pipe-mult-pipelining-diagonal-slices",
      "mit6004-pipe-mult-slice-bit-serial",
      "mit6004-pipe-mult-cost-performance-summary",
    ],
  },
  {
    number: 10,
    title: "Designing an Instruction Set",
    cardIds: [
      "mit6004-beta-isa-von-neumann",
      "mit6004-beta-isa-tradeoffs",
      "mit6004-beta-isa-programming-model",
      "mit6004-beta-isa-formats",
      "mit6004-beta-isa-alu-ops-and-constants",
      "mit6004-beta-isa-loads-stores",
      "mit6004-beta-isa-addressing-modes",
      "mit6004-beta-isa-branches",
    ],
  },
  {
    number: 11,
    title: "Machine Language, Assemblers, and Compilers",
    cardIds: [
      "mit6004-beta-asm-interpretation-vs-compilation",
      "mit6004-beta-asm-uasm-two-stage-translation",
      "mit6004-beta-asm-macros-and-instruction-assembly",
      "mit6004-beta-asm-compiling-data",
      "mit6004-beta-asm-compiling-control-flow",
    ],
  },
  {
    number: 12,
    title: "Models of Computation",
    cardIds: [
      "mit6004-beta-models-fsm-enumeration",
      "mit6004-beta-models-fsm-limitations-and-turing-machines",
      "mit6004-beta-models-universal-tm-and-interpretation",
    ],
  },
  {
    number: 13,
    title: "Stacks and Procedures",
    cardIds: [
      "mit6004-beta-stack-activation-records",
      "mit6004-beta-stack-discipline",
      "mit6004-beta-stack-linkage-contract",
      "mit6004-beta-stack-frame-layout",
      "mit6004-beta-stack-recursion-and-crawling",
      "mit6004-beta-stack-dangling-references",
    ],
  },
  {
    number: 14,
    title: "Non-pipelined Beta Implementation",
    cardIds: [
      "mit6004-arch-impl-cpu-tradeoffs",
      "mit6004-arch-impl-incremental-featurism",
      "mit6004-arch-impl-register-file-timing",
      "mit6004-arch-impl-fetch-decode-datapath",
      "mit6004-arch-impl-instruction-class-datapaths",
      "mit6004-arch-impl-exceptions",
    ],
  },
  {
    number: 15,
    title: "Multilevel Memories: Locality, Performance, Caches",
    cardIds: [
      "mit6004-arch-mem-hierarchy-tradeoff",
      "mit6004-arch-mem-locality-of-reference",
      "mit6004-arch-mem-expose-vs-hide",
      "mit6004-arch-mem-cache-basic-algorithm",
      "mit6004-arch-mem-associativity-tradeoff",
    ],
  },
  {
    number: 16,
    title: "Cache Design Issues",
    cardIds: [
      "mit6004-arch-cache-set-associative",
      "mit6004-arch-cache-replacement-strategies",
      "mit6004-arch-cache-block-size",
      "mit6004-arch-cache-valid-bits",
      "mit6004-arch-cache-write-strategies",
    ],
  },
  {
    number: 17,
    title: "Virtual Memory: Mapping, Protection, Contexts",
    cardIds: [
      "mit6004-vm-address-space-lessons",
      "mit6004-vm-illusion-and-demand-paging",
      "mit6004-vm-page-map-design",
      "mit6004-vm-page-map-arithmetic",
      "mit6004-vm-tlb",
      "mit6004-vm-contexts",
      "mit6004-vm-cache-interactions",
    ],
  },
  {
    number: 18,
    title: "Virtual Machines: Timesharing, OS Kernels, Supervisor Calls",
    cardIds: [
      "mit6004-vm-os-process-abstraction",
      "mit6004-vm-os-multiplexing-cpu",
      "mit6004-vm-os-interrupt-handling-beta",
      "mit6004-vm-os-kernel-user-mode",
      "mit6004-vm-os-supervisor-calls",
      "mit6004-vm-os-illop-dispatch",
    ],
  },
  {
    number: 19,
    title: "Devices and Interrupt Handlers",
    cardIds: [
      "mit6004-vm-io-readkey-evolution",
      "mit6004-vm-io-sleep-wakeup",
      "mit6004-vm-io-interrupt-latency",
      "mit6004-vm-io-weak-vs-strong-priorities",
      "mit6004-vm-io-real-time-worked-example",
    ],
  },
  {
    number: 20,
    title: "Communication Issues: Busses, Networks, Protocols",
    cardIds: [
      "mit6004-comm-bus-interfaces-vs-technology",
      "mit6004-comm-bus-basics",
      "mit6004-comm-bus-transmission-lines",
      "mit6004-comm-bus-synchronous-transaction",
      "mit6004-comm-bus-arbitration",
      "mit6004-comm-bus-topologies-latency",
    ],
  },
  {
    number: 21,
    title: "Communicating Processes: Semaphores, Synchronization, Deadlock",
    cardIds: [
      "mit6004-comm-sync-precedence-constraints",
      "mit6004-comm-sync-fifo-buffering",
      "mit6004-comm-sync-semaphores",
      "mit6004-comm-sync-semaphores-bounded-buffer",
      "mit6004-comm-sync-mutual-exclusion",
      "mit6004-comm-sync-semaphore-implementation",
      "mit6004-comm-sync-deadlock",
    ],
  },
  {
    number: 22,
    title: "Pipelined Beta Implementation, Bypassing",
    cardIds: [
      "mit6004-arch-pipe-why-hard",
      "mit6004-arch-pipe-5-stage-structure",
      "mit6004-arch-pipe-branch-delay-slots",
      "mit6004-arch-pipe-data-hazards-and-solutions",
      "mit6004-arch-pipe-bypass-mechanics",
    ],
  },
  {
    number: 23,
    title: "Pipeline Issues: Delay Slots, Annulment, Exceptions",
    cardIds: [
      "mit6004-arch-pipe-load-hazards",
      "mit6004-arch-pipe-stall-logic",
      "mit6004-arch-pipe-exceptions-in-pipeline",
      "mit6004-arch-pipe-async-interrupts",
      "mit6004-arch-pipe-risc-complexity-irony",
    ],
  },
  {
    number: 24,
    title: "Parallel Processing, Shared Memory, Cache Coherence",
    cardIds: [
      "mit6004-comm-par-ilp-vs-tlp",
      "mit6004-comm-par-superscalar-simd",
      "mit6004-comm-par-simd-coprocessing",
      "mit6004-comm-par-vliw",
      "mit6004-comm-par-mimd-smp",
      "mit6004-comm-par-sequential-consistency",
      "mit6004-comm-par-cache-coherence-snooping",
      "mit6004-comm-par-weak-consistency",
    ],
  },
  {
    number: 25,
    title: "Wrapup Lecture: Building a Better Beta",
    cardIds: [],
    noCardContent: "A closing design-tips talk for the course's optional final design project — no new testable material. Use this slot to revisit weak spots from Lectures 1–24 via Browse or Cram.",
  },
];

export const MIT6828_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "Operating Systems",
    cardIds: [
      "mit6828-intro-os-goals-and-abstraction",
      "mit6828-intro-os-fork-exec-split",
      "mit6828-intro-file-descriptors",
      "mit6828-intro-pipes",
    ],
  },
  {
    number: 2,
    title: "PC Hardware and x86 Programming",
    cardIds: [
      "mit6828-intro-x86-registers-and-io",
      "mit6828-intro-x86-segmentation",
      "mit6828-intro-x86-physical-memory-map",
      "mit6828-intro-x86-syntax-addressing",
      "mit6828-intro-gcc-calling-convention",
      "mit6828-intro-pc-emulation",
    ],
  },
  {
    number: 3,
    title: "Overview of Major Internals, System Call Interface",
    cardIds: [
      "mit6828-intro-isolation-why-have-os",
      "mit6828-intro-monolithic-vs-microkernel",
      "mit6828-intro-isolation-mechanisms",
      "mit6828-intro-cpl-mechanism",
      "mit6828-intro-syscall-entry",
      "mit6828-intro-address-space-isolation",
      "mit6828-intro-preemptive-context-switch",
      "mit6828-intro-syscall-interface-design",
    ],
  },
  {
    number: 4,
    title: "Virtual Memory",
    cardIds: [
      "mit6828-vm-paging-indirection",
      "mit6828-vm-pte-structure",
      "mit6828-vm-two-level-page-table",
      "mit6828-vm-page-fault",
      "mit6828-vm-xv6-address-space-layout",
      "mit6828-vm-sbrk-implementation",
    ],
  },
  {
    number: 5,
    title: "Interrupts, Exceptions",
    cardIds: [
      "mit6828-vm-execution-state-transitions",
      "mit6828-vm-int-instruction-mechanics",
      "mit6828-vm-idt-and-vectors",
      "mit6828-vm-trapframe",
      "mit6828-vm-syscall-handling",
      "mit6828-vm-kernel-mode-interrupts",
      "mit6828-vm-fork-kernel-stack-setup",
    ],
  },
  {
    number: 6,
    title: "Multiprocessors and Locking",
    cardIds: [
      "mit6828-conc-race-condition",
      "mit6828-conc-locks-and-critical-sections",
      "mit6828-conc-atomic-instructions",
      "mit6828-conc-locks-and-interrupts",
      "mit6828-conc-lock-granularity-modularity",
      "mit6828-conc-lock-ordering",
    ],
  },
  {
    number: 7,
    title: "Processes and Switching",
    cardIds: [
      "mit6828-conc-process-thread-terms",
      "mit6828-conc-switch-transparency-goals",
      "mit6828-conc-user-thread-switch-overview",
      "mit6828-conc-xv6-scheduler-design",
      "mit6828-conc-yield-swtch-concurrency",
      "mit6828-conc-thread-cleanup",
    ],
  },
  {
    number: 8,
    title: "Sleep & Wakeup",
    cardIds: [
      "mit6828-conc-spin-vs-sleep",
      "mit6828-conc-lost-wakeup-problem",
      "mit6828-conc-sleep-atomicity-mechanism",
      "mit6828-conc-signals-during-sleep",
    ],
  },
  {
    number: 9,
    title: "File Systems",
    cardIds: [
      "mit6828-fs-goals-and-api-choices",
      "mit6828-fs-inode-and-links",
      "mit6828-fs-ondisk-layout",
      "mit6828-fs-create-trace",
      "mit6828-fs-write-and-delete-trace",
      "mit6828-fs-buffer-cache-and-scheduling",
    ],
  },
  {
    number: 10,
    title: "Crash Recovery",
    cardIds: [
      "mit6828-fs-crash-recovery-problem",
      "mit6828-fs-recovery-goals-and-fail-stop",
      "mit6828-fs-synchronous-metadata-update",
      "mit6828-fs-sync-update-recovery-and-cost",
      "mit6828-fs-writeback-cache-problem",
      "mit6828-fs-logging-basic-idea",
      "mit6828-fs-xv6-log-implementation",
      "mit6828-fs-xv6-logging-problems",
    ],
  },
  {
    number: 11,
    title: "File System Performance and Fast Crash Recovery",
    cardIds: [
      "mit6828-fs-ext3-goals-and-structures",
      "mit6828-fs-write-absorption",
      "mit6828-fs-ext3-transaction-commit",
      "mit6828-fs-ext3-concurrency-correctness",
      "mit6828-fs-ext3-recovery-and-log-space",
      "mit6828-fs-ext3-reservations-and-durability",
      "mit6828-fs-ext3-ordering-hazards",
      "mit6828-fs-ext3-orphan-inodes",
    ],
  },
  {
    number: 12,
    title: "Project Introduction and Discussion",
    cardIds: [],
    noCardContent: "Introduces the course's open-ended final design project — reading assignments only, no lecture-notes content.",
  },
  {
    number: 13,
    title: "OS Organization",
    cardIds: [
      "mit6828-adv-os-kernel-goals",
      "mit6828-adv-os-virtualize-cpu",
      "mit6828-adv-os-virtualize-memory",
      "mit6828-adv-os-monolithic-vs-micro-vs-exo",
      "mit6828-adv-os-exokernel-memory-example",
      "mit6828-adv-os-exokernel-db-example",
      "mit6828-adv-os-exokernel-cpu-and-fast-rpc",
    ],
  },
  {
    number: 14,
    title: "In-class Hacking Session",
    cardIds: [],
    noCardContent: "A hands-on lab session — no new lecture material.",
  },
  {
    number: 15,
    title: "Project Conferences",
    cardIds: [],
    noCardContent: "Student project conferences — no new lecture material.",
  },
  {
    number: 16,
    title: "Project Conferences (continued)",
    cardIds: [],
    noCardContent: "Student project conferences — no new lecture material.",
  },
  {
    number: 17,
    title: "Language / OS Co-design",
    cardIds: [
      "mit6828-adv-os-singularity-no-hw-protection",
      "mit6828-adv-os-singularity-bytecode-verification",
      "mit6828-adv-os-singularity-trust-boundary",
      "mit6828-adv-os-singularity-exchange-heap",
      "mit6828-adv-os-singularity-sealing-and-comparison",
    ],
  },
  {
    number: 18,
    title: "Scalable Locks",
    cardIds: [
      "mit6828-adv-os-cache-coherence-msi",
      "mit6828-adv-os-locks-need-and-atomic-impl",
      "mit6828-adv-os-lock-handoff-cost-model",
      "mit6828-adv-os-nonscalable-locks",
      "mit6828-adv-os-locking-cost-matters",
      "mit6828-adv-os-backoff-and-anderson",
      "mit6828-adv-os-mcs-locks",
    ],
  },
  {
    number: 19,
    title: "Project Conferences",
    cardIds: [],
    noCardContent: "Student project conferences — no new lecture material.",
  },
  {
    number: 20,
    title: "Project Conferences (continued)",
    cardIds: [],
    noCardContent: "Student project conferences — no new lecture material.",
  },
  {
    number: 21,
    title: "Lock-free Coordination",
    cardIds: [
      "mit6828-adv-os-why-lock-free",
      "mit6828-adv-os-lockfree-stack",
      "mit6828-adv-os-aba-problem",
      "mit6828-adv-os-rcu",
      "mit6828-adv-os-rcu-dentry-example",
    ],
  },
  {
    number: 22,
    title: "Virtual Machines",
    cardIds: [
      "mit6828-adv-os-vm-goals-and-terminology",
      "mit6828-adv-os-trap-and-emulate",
      "mit6828-adv-os-trap-and-emulate-x86-problems",
      "mit6828-adv-os-shadow-page-table",
      "mit6828-adv-os-binary-translation",
      "mit6828-adv-os-vm-code-writes-and-hw-support",
    ],
  },
  {
    number: 23,
    title: "No Lecture — Work on Final Projects",
    cardIds: [],
    noCardContent: "No lecture — dedicated project work time.",
  },
  {
    number: 24,
    title: "Demos in Class",
    cardIds: [],
    noCardContent: "Final project demos — no new lecture material.",
  },
  {
    number: 25,
    title: "Demos in Class (continued)",
    cardIds: [],
    noCardContent: "Final project demos — no new lecture material.",
  },
];

export const MIT6035_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "Introduction",
    cardIds: [
      "mit6035-parse-compiler-pipeline",
      "mit6035-parse-optimization-passes-worked",
    ],
  },
  {
    number: 2,
    title: "Specifying Languages with Regular Expressions and Context-Free Grammars",
    cardIds: [
      "mit6035-parse-language-definition-layers",
      "mit6035-parse-thompson-construction",
      "mit6035-parse-nfa-to-dfa-subset-construction",
      "mit6035-parse-why-cfg-needed",
      "mit6035-parse-cfg-basics",
      "mit6035-parse-ambiguity-and-precedence-hack",
      "mit6035-parse-ast-vs-cst-dangling-else",
      "mit6035-parse-chomsky-hierarchy-correspondence",
    ],
  },
  {
    number: 3,
    title: "Introduction to Shift-Reduce Parsing",
    cardIds: [
      "mit6035-parse-pushdown-automaton",
      "mit6035-parse-shift-reduce-mechanics",
      "mit6035-parse-conflicts",
    ],
  },
  {
    number: 3.5,
    title: "Parse Table Construction",
    cardIds: [
      "mit6035-parse-lr0-items-closure-goto",
      "mit6035-parse-table-construction-and-slr",
      "mit6035-parse-lr1-and-lalr",
    ],
  },
  {
    number: 4,
    title: "Top-Down Parsing",
    cardIds: [
      "mit6035-parse-topdown-basic-approach",
      "mit6035-parse-backtracking-and-left-recursion-problem",
      "mit6035-parse-eliminating-left-recursion",
      "mit6035-parse-predictive-parsing-and-first-sets",
      "mit6035-parse-recursive-descent-implementation",
      "mit6035-parse-left-factoring",
      "mit6035-parse-concrete-vs-abstract-tree-reconstruction",
      "mit6035-parse-recursive-descent-vs-generator-tradeoff",
    ],
  },
  {
    number: 5,
    title: "Intermediate Formats",
    cardIds: [
      "mit6035-gen-ir-levels",
      "mit6035-gen-symbol-tables-and-scoping",
      "mit6035-gen-inheritance-symbol-tables",
      "mit6035-gen-virtual-dispatch-vtables",
    ],
  },
  {
    number: 6,
    title: "Semantic Analysis",
    cardIds: [
      "mit6035-gen-type-expressions-and-equivalence",
      "mit6035-gen-type-coercion-and-casting",
      "mit6035-gen-semantic-checks-by-node-type",
    ],
  },
  {
    number: 7,
    title: "Unoptimized Code Generation",
    cardIds: [
      "mit6035-gen-x86-64-overview",
      "mit6035-gen-parameter-passing-disciplines",
      "mit6035-gen-caller-vs-callee-saved-registers",
      "mit6035-gen-stack-frame-layout",
      "mit6035-gen-prolog-epilog-precall-postreturn",
      "mit6035-gen-assembly-vs-machine-code",
      "mit6035-gen-memory-layout-and-data-allocation",
    ],
  },
  {
    number: 8,
    title: "Unoptimized Code Generation (continued)",
    cardIds: [
      "mit6035-gen-expression-lowering-flat-list",
      "mit6035-gen-control-flow-templates",
      "mit6035-gen-cfg-and-short-circuit",
      "mit6035-gen-destruct-shortcircuit-algorithm",
      "mit6035-gen-codegen-guidelines",
    ],
  },
  {
    number: 9,
    title: "Introduction to Program Analysis and Optimization",
    cardIds: [
      "mit6035-flow-cfg-construction",
      "mit6035-flow-value-numbering-cse",
      "mit6035-flow-copy-propagation-local",
      "mit6035-flow-dead-code-elimination-local",
      "mit6035-flow-algebraic-simplification",
    ],
  },
  {
    number: 10,
    title: "Introduction to Dataflow Analysis",
    cardIds: [
      "mit6035-flow-reaching-definitions",
      "mit6035-flow-splitting-and-merge-loss",
      "mit6035-flow-available-expressions-and-global-cse",
      "mit6035-flow-liveness-analysis",
      "mit6035-flow-duality-and-optimistic-pessimistic",
    ],
  },
  {
    number: 11,
    title: "Foundations of Dataflow Analysis",
    cardIds: [
      "mit6035-flow-lattices-and-partial-orders",
      "mit6035-flow-ascending-chains-and-termination",
      "mit6035-flow-transfer-functions-monotone-distributive",
      "mit6035-flow-generalized-worklist-algorithm",
      "mit6035-flow-mop-and-soundness",
      "mit6035-flow-mop-vs-mfp-distributivity",
      "mit6035-flow-abstraction-function-soundness",
      "mit6035-flow-multiple-fixed-points",
    ],
  },
  {
    number: 13,
    title: "Introduction to Code Optimization: Instruction Scheduling",
    cardIds: [
      "mit6035-sched-dependence-types",
      "mit6035-sched-dependence-dag",
      "mit6035-sched-list-scheduling-algorithm",
      "mit6035-sched-ready-list-heuristics",
      "mit6035-sched-np-completeness",
      "mit6035-sched-resource-constrained-scheduling",
      "mit6035-sched-cross-block-scheduling-safety",
      "mit6035-sched-trace-scheduling-superblocks",
    ],
  },
  {
    number: 14,
    title: "Loop Optimizations: Instruction Scheduling",
    cardIds: [
      "mit6035-sched-loop-unrolling-renaming",
      "mit6035-sched-software-pipelining",
      "mit6035-sched-regalloc-vs-scheduling-tension",
      "mit6035-sched-hardware-vs-compiler-scheduling",
      "mit6035-sched-induction-variable-classes",
      "mit6035-sched-finding-induction-variables",
    ],
  },
  {
    number: 15,
    title: "More Loop Optimizations",
    cardIds: [
      "mit6035-sched-loop-invariant-code-motion",
      "mit6035-sched-strength-reduction",
      "mit6035-sched-loop-test-replacement",
      "mit6035-sched-simd-sse-registers-and-data-transfer",
      "mit6035-sched-simd-arithmetic-and-data-reordering",
      "mit6035-sched-simd-worked-example",
      "mit6035-sched-conditions-for-simdization",
    ],
  },
  {
    number: 16,
    title: "Register Allocation",
    cardIds: [
      "mit6035-alloc-webs-and-interference",
      "mit6035-alloc-graph-coloring-algorithm",
      "mit6035-alloc-coloring-worked-example",
      "mit6035-alloc-spill-cost-heuristic",
      "mit6035-alloc-splitting-vs-spilling",
      "mit6035-alloc-splitting-heuristic-cost-benefit",
      "mit6035-alloc-register-coalescing",
      "mit6035-alloc-precoloring-presplitting-interprocedural",
    ],
  },
  {
    number: 17,
    title: "Parallelization",
    cardIds: [
      "mit6035-alloc-amdahls-law-and-issues",
      "mit6035-alloc-execution-models",
      "mit6035-alloc-dependence-types-and-distance-vectors",
      "mit6035-alloc-distance-vector-parallelizability-test",
      "mit6035-alloc-integer-programming-dependence-test",
      "mit6035-alloc-privatization",
      "mit6035-alloc-loop-transformations-for-parallelism",
    ],
  },
  {
    number: 18,
    title: "Memory Optimization",
    cardIds: [
      "mit6035-alloc-hierarchy-and-miss-types",
      "mit6035-alloc-loop-transformations-tiling",
      "mit6035-alloc-data-transformations",
      "mit6035-alloc-false-sharing-and-conflict-misses",
      "mit6035-alloc-prefetching",
      "mit6035-alloc-alias-analysis-points-to",
    ],
  },
];

export const MIT6120_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "Predicates, Sets, and Proofs",
    cardIds: [
      "mit6120-proofs-what-is-a-proof",
      "mit6120-proofs-propositions-predicates-quantifiers",
      "mit6120-proofs-connectives-and-english-or",
      "mit6120-proofs-implication-truth-table",
      "mit6120-proofs-sets-basics",
      "mit6120-proofs-axioms-consistency-completeness",
    ],
  },
  {
    number: 2,
    title: "Contradiction and Induction",
    cardIds: [
      "mit6120-proofs-inference-rules",
      "mit6120-proofs-basic-proof-templates",
      "mit6120-proofs-contrapositive-n-squared-even",
      "mit6120-proofs-sqrt2-irrational",
      "mit6120-proofs-proof-outlining",
      "mit6120-proofs-induction-axiom-sum",
      "mit6120-proofs-strengthening-ih-trominoes",
    ],
  },
  {
    number: 3,
    title: "Casework and Strong Induction",
    cardIds: [
      "mit6120-proofs-proof-by-cases-template",
      "mit6120-proofs-ramsey-r33",
      "mit6120-proofs-strong-induction",
      "mit6120-proofs-block-stacking-game",
      "mit6120-proofs-beats-ordering",
    ],
  },
  {
    number: 4,
    title: "State Machines",
    cardIds: [
      "mit6120-proofs-state-machine-definitions",
      "mit6120-proofs-invariant-principle",
      "mit6120-proofs-8-puzzle-parity",
      "mit6120-proofs-termination-derived-variables",
      "mit6120-proofs-simple-sort-termination",
    ],
  },
  {
    number: 5,
    title: "Sums",
    cardIds: [
      "mit6120-analysis-geometric-series-perturbation",
      "mit6120-analysis-annuity-present-value",
      "mit6120-analysis-ansatz-sum-of-squares",
      "mit6120-analysis-double-sums-exchange-order",
      "mit6120-analysis-integral-method",
    ],
  },
  {
    number: 6,
    title: "Asymptotics",
    cardIds: [
      "mit6120-analysis-harmonic-numbers",
      "mit6120-analysis-factorial-stirling",
      "mit6120-analysis-asymptotic-definitions",
      "mit6120-analysis-big-o-proofs",
      "mit6120-analysis-notation-abuses",
    ],
  },
  {
    number: 7,
    title: "Recurrences",
    cardIds: [
      "mit6120-analysis-towers-of-hanoi",
      "mit6120-analysis-plug-and-chug-mergesort",
      "mit6120-analysis-master-theorem-intuition",
    ],
  },
  {
    number: 8,
    title: "Divisibility",
    cardIds: [
      "mit6120-number-theory-divisibility",
      "mit6120-number-theory-water-jugs",
      "mit6120-number-theory-euclid-correctness",
      "mit6120-number-theory-pulverizer-bezout",
    ],
  },
  {
    number: 9,
    title: "Modular Arithmetic",
    cardIds: [
      "mit6120-number-theory-congruence-and-remainders",
      "mit6120-number-theory-remainder-in-programming-languages",
      "mit6120-number-theory-legal-substitutions",
      "mit6120-number-theory-inverse-iff-coprime",
      "mit6120-number-theory-fermats-little-theorem",
    ],
  },
  {
    number: 10,
    title: "Cryptography",
    cardIds: [
      "mit6120-number-theory-rsa-correctness",
      "mit6120-number-theory-rsa-security-assumptions",
      "mit6120-number-theory-chinese-remainder-theorem",
    ],
  },
  {
    number: 11,
    title: "Graphs and Coloring",
    cardIds: [
      "mit6120-graphs-handshake-lemma",
      "mit6120-graphs-bipartite-average-degree",
      "mit6120-graphs-coloring-chromatic-number",
      "mit6120-graphs-greedy-coloring",
      "mit6120-graphs-induction-buildup-error",
    ],
  },
  {
    number: 12,
    title: "Matching",
    cardIds: [
      "mit6120-graphs-matching-definitions",
      "mit6120-graphs-stable-matching-definitions",
      "mit6120-graphs-gale-shapley-algorithm",
      "mit6120-graphs-gale-shapley-proofs",
      "mit6120-graphs-applicant-optimal",
    ],
  },
  {
    number: 13,
    title: "Connectivity and Trees",
    cardIds: [
      "mit6120-graphs-walks-paths-components",
      "mit6120-graphs-euler-tours",
      "mit6120-graphs-trees-n-minus-1-edges",
    ],
  },
  {
    number: 14,
    title: "Digraphs and DAGs",
    cardIds: [
      "mit6120-graphs-digraphs-scc-condensation",
      "mit6120-graphs-topological-order",
      "mit6120-graphs-parallel-scheduling-chains",
    ],
  },
  {
    number: 15,
    title: "Relations and Counting",
    cardIds: [
      "mit6120-counting-relations-and-functions",
      "mit6120-counting-equivalence-relations",
      "mit6120-counting-weak-partial-orders",
      "mit6120-counting-product-sum-bijection-rules",
    ],
  },
  {
    number: 16,
    title: "Counting Techniques",
    cardIds: [
      "mit6120-counting-generalized-product-rule",
      "mit6120-counting-division-rule-binomial",
      "mit6120-counting-poker-recipes",
      "mit6120-counting-complement-at-least-one-pair",
    ],
  },
  {
    number: 17,
    title: "More Counting Techniques",
    cardIds: [
      "mit6120-counting-inclusion-exclusion",
      "mit6120-counting-inclusion-exclusion-proof",
      "mit6120-counting-pigeonhole",
      "mit6120-counting-combinatorial-proofs",
      "mit6120-counting-binomial-multinomial-theorem",
    ],
  },
  {
    number: 18,
    title: "Introduction to Probability",
    cardIds: [
      "mit6120-probability-space-tree-method",
      "mit6120-probability-monty-hall",
      "mit6120-probability-nontransitive-dice",
    ],
  },
  {
    number: 19,
    title: "Conditional Probability",
    cardIds: [
      "mit6120-probability-rules",
      "mit6120-probability-conditional-product-rule",
      "mit6120-probability-bayes-base-rates",
      "mit6120-probability-simpsons-paradox",
    ],
  },
  {
    number: 20,
    title: "Independence",
    cardIds: [
      "mit6120-probability-independence",
      "mit6120-probability-pairwise-vs-mutual",
      "mit6120-probability-conditional-independence",
      "mit6120-probability-birthday-principle",
    ],
  },
  {
    number: 21,
    title: "Random Variables",
    cardIds: [
      "mit6120-probability-random-variables",
      "mit6120-probability-two-envelopes",
      "mit6120-probability-binomial-distribution",
    ],
  },
  {
    number: 22,
    title: "Expectation",
    cardIds: [
      "mit6120-probability-expectation",
      "mit6120-probability-linearity-of-expectation",
    ],
  },
  {
    number: 23,
    title: "Expectation and Variance",
    cardIds: [
      "mit6120-probability-variance",
      "mit6120-probability-variance-of-sums",
    ],
  },
  {
    number: 24,
    title: "Large Deviations: Chebyshev and Chernoff Bounds",
    cardIds: [
      "mit6120-probability-markov",
      "mit6120-probability-chebyshev",
      "mit6120-probability-chernoff",
    ],
  },
];

export const MIT1806_LECTURES: CourseLecture[] = [
  {
    number: 1,
    title: "The Geometry of Linear Equations",
    cardIds: [
      "mit1806-elimination-three-pictures",
      "mit1806-elimination-ax-combination-of-columns",
    ],
  },
  {
    number: 2,
    title: "Elimination with Matrices",
    cardIds: [
      "mit1806-elimination-elimination-to-u",
      "mit1806-elimination-elimination-matrices",
    ],
  },
  {
    number: 3,
    title: "Multiplication and Inverse Matrices",
    cardIds: [
      "mit1806-elimination-four-ways-to-multiply",
      "mit1806-elimination-inverses-and-singularity",
      "mit1806-elimination-gauss-jordan",
    ],
  },
  {
    number: 4,
    title: "Factorization into A = LU",
    cardIds: [
      "mit1806-elimination-inverse-transpose-of-product",
      "mit1806-elimination-a-equals-lu",
      "mit1806-elimination-elimination-cost",
    ],
  },
  {
    number: 5,
    title: "Transposes, Permutations, Spaces Rⁿ",
    cardIds: [
      "mit1806-elimination-pa-equals-lu-permutations",
      "mit1806-elimination-transposes-symmetric",
      "mit1806-elimination-vector-spaces-subspaces",
    ],
  },
  {
    number: 6,
    title: "Column Space and Nullspace",
    cardIds: [
      "mit1806-subspaces-nullspace-is-subspace",
      "mit1806-subspaces-column-space-solvability",
    ],
  },
  {
    number: 7,
    title: "Solving Ax = 0: Pivot Variables, Special Solutions",
    cardIds: [
      "mit1806-subspaces-special-solutions",
      "mit1806-subspaces-rref-nullspace-matrix",
    ],
  },
  {
    number: 8,
    title: "Solving Ax = b: Row Reduced Form R",
    cardIds: [
      "mit1806-subspaces-complete-solution",
      "mit1806-subspaces-rank-cases",
    ],
  },
  {
    number: 9,
    title: "Independence, Basis, and Dimension",
    cardIds: [
      "mit1806-subspaces-independence",
      "mit1806-subspaces-basis-dimension",
    ],
  },
  {
    number: 10,
    title: "The Four Fundamental Subspaces",
    cardIds: [
      "mit1806-subspaces-four-subspaces",
      "mit1806-subspaces-rank-nullity",
    ],
  },
  {
    number: 11,
    title: "Matrix Spaces; Rank 1; Small World Graphs",
    cardIds: [
      "mit1806-subspaces-other-vector-spaces",
      "mit1806-subspaces-rank-one-matrices",
    ],
  },
  {
    number: 12,
    title: "Graphs, Networks, Incidence Matrices",
    cardIds: [
      "mit1806-subspaces-incidence-matrices",
      "mit1806-subspaces-euler-formula",
    ],
  },
  {
    number: 13,
    title: "Quiz 1 Review",
    cardIds: [],
    noCardContent: "Exam review — worked problems on Lectures 1–12, no new material.",
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
  mit6004: MIT6004_LECTURES,
  mit6828: MIT6828_LECTURES,
  mit6035: MIT6035_LECTURES,
  mit6120: MIT6120_LECTURES,
  mit1806: MIT1806_LECTURES,
};
