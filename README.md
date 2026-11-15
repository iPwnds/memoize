# Memoize

A flashcard app for mastering algorithms, data structures, and theoretical CS,
organized entirely by course — every module belongs to exactly one course,
there's no undifferentiated generic pile. Built for depth and correctness over
quiz-app polish — 1340 cards across 99 modules and 15 courses:

- **Complexity Class** — 322 cards, 24 modules, the original from-first-principles
  algorithms & data structures curriculum, independent of any external syllabus.
- **MIT 6.006 — Introduction to Algorithms** — 67 cards, 6 modules, mapped
  lecture-by-lecture against the actual Spring 2020 OCW syllabus.
- **MIT 6.045J / 18.400J — Automata, Computability, and Complexity** — 74 cards,
  5 modules, mapped lecture-by-lecture against the actual Spring 2011 OCW
  syllabus (all 23 lectures).
- **MIT 6.046J / 18.410J — Design and Analysis of Algorithms** — 62 cards,
  7 modules, mapped lecture-by-lecture against the actual Spring 2015 OCW
  syllabus (all 24 lectures).
- **MIT 6.004 — Computation Structures** — 125 cards, 7 modules, mapped
  lecture-by-lecture against the actual Spring 2009 OCW syllabus (all 25
  lectures) — digital logic, CPU architecture, and operating systems, the
  hardware/systems counterpart to the app's other, algorithms-focused tracks.
- **MIT 6.828 — Operating System Engineering** — 99 cards, 5 modules, mapped
  lecture-by-lecture against the actual Fall 2012 OCW syllabus (all 15
  lectures with real lecture-notes content) — building a real, if small,
  Unix-like kernel from the ground up: x86/PC architecture, virtual memory,
  multiprocessor locking, file systems and crash recovery, and OS/language
  co-design, scalable/lock-free concurrency, and virtual machines.
- **MIT 6.035 — Computer Language Engineering** — 103 cards, 5 modules, mapped
  lecture-by-lecture against the actual Spring 2010 OCW syllabus (all 18
  lecture-note-bearing lectures) — building a real compiler front-to-back:
  parsing, semantic analysis and unoptimized codegen, dataflow analysis,
  instruction scheduling and loop optimization, and register allocation,
  parallelization and memory optimization.

- **MIT 6.1200J — Mathematics for Computer Science** — 98 cards, 6 modules,
  mapped lecture-by-lecture against the actual Spring 2024 OCW syllabus (all
  24 lectures) — discrete math and proof technique, the first track aimed
  squarely at the math gap between an applied-CS bachelor and a university
  CS bachelor.

- **MIT 18.06 — Linear Algebra** — 73 cards, 6 modules, from the 18.06SC
  (Fall 2011, Gilbert Strang) per-lecture summaries, mapped against all 34 of
  Strang's video lectures.

- **MIT 18.05 — Introduction to Probability and Statistics** — 35 cards,
  3 modules, from the Spring 2022 per-class reading notes, numbered by class.
- **MIT 18.01 — Single Variable Calculus** — 78 cards, 6 modules, from the
  18.01SC (Fall 2010, OCW Scholar, David Jerison) per-session lecture notes,
  numbered by the course's 101 sessions.
- **MIT 18.335J — Introduction to Numerical Methods** — 56 cards, 5 modules,
  from the Spring 2019 (Steven G. Johnson) per-lecture summaries and course
  handouts, numbered by lecture (the numerical-linear-algebra core, Lec 1–24).
- **MIT 24.241 — Logic I** — 59 cards, 5 modules, from the Fall 2009 OCW
  slides, handouts, TA problem-set answers and quizzes (Ephraim Glick),
  numbered by lecture session (all 25).
- **MIT 6.042J — Mathematics for Computer Science (Logic & Infinite Sets)** —
  19 cards, 2 modules, from the Spring 2015 OCW textbook chapters (MCS
  Ch. 3 and 7), numbered by class session (Sessions 4, 5 and 11 only; the
  rest of 6.042J is covered by the 6.1200J track).
- **MIT 6.001 — Structure and Interpretation of Computer Programs** — 70 cards,
  7 modules, from the Spring 2005 online-lecture handouts and code handouts plus
  the SICP textbook, mapped against all 26 lectures. It is the declarative-
  programming track (functional programming, evaluators, laziness, logic
  programming).

The goal going forward: bring a graduate of an applied-CS (professional)
bachelor up to the level of a university CS bachelor — benchmarked against
KU Leuven's *Bachelor in de informatica* — using MIT OpenCourseWare courses
only. Every major gap now has a track: proofs, relations, counting and
discrete probability (MIT 6.1200J), linear algebra (MIT 18.06), continuous
probability and statistics (MIT 18.05), single-variable calculus (MIT 18.01),
numerical linear algebra (MIT 18.335J), logic with soundness/completeness
(MIT 24.241) and normal forms plus infinite cardinality (MIT 6.042J), and
functional and logic programming (MIT 6.001). What remains is narrower:
multivariable calculus and real-analysis rigour, abstract linear-map /
spectral-theorem proofs, numerical root finding, interpolation and
quadrature, static typing with Hindley–Milner inference and Prolog
specifics, and resolution/tableaux in logic — systems and algorithms were
already well covered.

## Stack

Vite + React + TypeScript + Tailwind CSS, Zustand for state, `localStorage` for
persistence (no backend, single-user). Content lives as typed data in
`src/data/*.ts`, one file per module, against the shared `Card` interface in
`src/data/types.ts`.

## Study modes

The landing page is a dashboard: due-today count, streak, overall mastery, a
one-click jump into Review, a mastery bar for every course, plus a grid
linking into every mode below.

- **Review** — spaced-repetition queue (simplified SM-2), only cards due today,
  filterable by Track (Everything, or a specific course — isolating a course's
  cards from the rest of the deck for focused study).
- **Browse** — free exploration by track/module/type, with search.
- **Cram** — every card in a chosen module (grouped by course), no effect on SRS state.
- **Learn** — a structured, textbook-style read through each module: cards in
  curated order as one continuous page, with a sticky table of contents and
  clickable cross-links between related cards (including across modules).
  Read-only, like Browse/Cram.
- **Courses** — a per-course tracker. For a lecture-numbered course (MIT 6.006),
  it's a lecture-by-lecture syllabus grouped by which exam it's scoped to, with
  recitation/problem-set cross-references and per-lecture mastery. For a
  module-grouped course (Complexity Class), it's the module list grouped by
  tier. Either way it links straight into Learn mode for the cards that cover it.
- **Cheat Sheet** — complexity reference generated directly from card data.
- **Stats** — per-module mastery, streak, cards due.

Keyboard-driven: space/enter to flip, 1–4 to rate in Review, arrow keys to
navigate in Browse.

## Courses

Every module (`src/data/modules.ts`) has a required `course` tag
(`ModuleMeta.course`) pointing at an entry in `COURSES`
(`src/data/courses.ts`). A course is one of two shapes:

- **Module-grouped** — no external lecture numbering; the course is just its
  modules, grouped by `tier` for display. Complexity Class is this shape:
  `tier`/`order` are meaningful here (they control display grouping/ordering
  within the course), unlike in a lecture-numbered course where they're inert.
- **Lecture-numbered** — has an entry in `COURSE_LECTURE_MAPS`, an array of
  `{ number, title, cardIds, recitation?, problemSet?, ... }` mapping each
  lecture of the real course to the card ids that cover it. MIT 6.006 is this
  shape. Its 6 modules follow the course's own vocabulary and framing (e.g.
  the Sequence/Set interfaces, SRT BOT for dynamic programming, the Word-RAM
  model) even where a topic is also covered in Complexity Class — cross-linked
  via `related` rather than duplicated, where the overlap is substantial.

`CoursePage` picks the rendering based on whether `COURSE_LECTURE_MAPS[courseId]`
exists; `validate-content.ts` checks both shapes (lecture cardIds resolve and
every course-tagged card is reachable from its course, one way or the other).

## Development

```bash
npm install
npm run dev        # http://localhost:5173

npm run build       # production build to dist/
npx tsc -b --noEmit  # typecheck
npx tsx scripts/validate-content.ts  # verify card id/related-link integrity
```

## Content status

**Complexity Class** is complete — 322 cards across 24 modules, grouped into
three internal tiers (foundations → intermediate/competitive → advanced/specialized):

- **Tier 1** (Modules 1–12): Complexity & Analysis, Core Linear Structures,
  Hashing, Binary Trees & BSTs, Heaps & Priority Queues, Sorting, Searching,
  Graph Traversal, Shortest Paths & MST, Recursion & Divide-and-Conquer,
  Dynamic Programming, Greedy Algorithms.
- **Tier 2** (Modules 13–18): Specialized Trees, Advanced Graph Algorithms,
  String Algorithms, Two Pointers/Sliding Window/Prefix Sums, Backtracking,
  Bit Manipulation.
- **Tier 3** (Modules 19–24): Advanced Balanced & Persistent Structures,
  Probabilistic Data Structures, Computational Geometry, NP-Completeness &
  Complexity Theory, Number Theory for Algorithms, Systems-Adjacent.

**MIT 6.006** (Introduction to Algorithms, Spring 2020) is complete — 67 cards
across 6 modules, mapped against all 21 lectures:

- **Foundations** (Lec 1–2), **Sorting & Hashing** (Lec 3–5), **Trees & Heaps**
  (Lec 6–8), **Graphs** (Lec 9–14), **Dynamic Programming** (Lec 15–18),
  **Complexity** (Lec 19). Lectures 20–21 (course review, next steps) carry no
  new material and are noted as such in the syllabus tracker rather than left
  looking incomplete.
- Coverage was audited two ways: every named topic in each lecture's own notes
  was checked against the card set, and the course's own Quiz 1/2/3 review
  sheets (the staff's topic checklists) were cross-referenced against the
  finished lecture map.

**MIT 6.045J / 18.400J** (Automata, Computability, and Complexity, Spring 2011)
is complete — 74 cards across 5 modules, mapped against all 23 lectures:

- **Automata & Regular Languages** (Lec 1–5), **Turing Machines & Computability**
  (Lec 6–10), **Complexity Theory & NP-Completeness** (Lec 12, 15–17),
  **Cryptography** (Lec 11, 13, 14, 18), **Learning Theory & Quantum Computing**
  (Lec 19–23).
- Sourced directly from the course's own Spring 2011 lecture slides/notes
  (fetched from OCW and read page-by-page), not summarized from lecture
  titles alone. Where a topic already exists in Complexity Class at an
  applied level (P vs NP, reductions, SAT, classic NP-complete problems,
  modular exponentiation), these cards cover it at 6.045's formal/
  proof-driven level and cross-link via `related` rather than duplicating.

**MIT 6.046J / 18.410J** (Design and Analysis of Algorithms, Spring 2015) is
complete — 62 cards across 7 modules, mapped against all 24 lectures:

- **Foundations & Divide-and-Conquer** (Lec 1–4), **Amortization &
  Randomization** (Lec 5–8), **Augmentation, DP & Greedy** (Lec 9–12), **Flow,
  Matching & Linear Programming** (Lec 13–15), **Complexity & Approximation**
  (Lec 16–18), **Distributed Algorithms** (Lec 19–20), **Cryptography &
  Cache-Oblivious Algorithms** (Lec 21–24).
- Sourced from the course's own written lecture notes and slide decks, read
  page-by-page. This is the most overlap-heavy of the MIT tracks — several
  lectures (order-statistics trees, the alternating coin game, Bellman-Ford,
  Floyd-Warshall, Kruskal's/Prim's/Union-Find, basic Vertex Cover
  approximation, RSA, Diffie-Hellman) already have deep coverage elsewhere in
  the app (mainly MIT 6.006 and MIT 6.045J), so those modules stay
  intentionally lean and cross-link via `related` rather than duplicating;
  cards were only written where the material is genuinely new or the
  treatment is meaningfully more rigorous (e.g. the four amortized-analysis
  techniques in full generality, van Emde Boas trees, FFT, universal/perfect
  hashing, the formal max-flow min-cut proof, linear programming, fixed-
  parameter tractability, distributed leader election/MIS, and
  cache-oblivious algorithms — none of which exist anywhere else in the app).

**MIT 6.004** (Computation Structures, Spring 2009, Steve Ward) is complete —
125 cards across 7 modules, mapped against all 25 lectures:

- **Information, Digital Abstraction & CMOS** (Lec 1–3), **Logic Synthesis,
  Sequential Logic & FSMs** (Lec 4–7), **Pipelining & the Multiplier Case
  Study** (Lec 8–9), **The Beta ISA, Assembly & Models of Computation**
  (Lec 10–13), **Beta Implementation, Caches & Pipelining** (Lec 14–16,
  22–23), **Virtual Memory, OS Kernels & Devices** (Lec 17–19),
  **Communication, Synchronization & Parallel Processing** (Lec 20–21, 24).
  Lecture 25 (a closing design-project talk) carries no new material and is
  noted as such in the syllabus tracker rather than left looking incomplete.
- Sourced from the course's own Spring 2009 lecture slides (fetched from OCW
  and read page-by-page), not summarized from lecture titles alone. Unlike
  the algorithms-focused tracks, 6.004 is genuinely all-new hardware/systems
  territory — digital logic, the Beta teaching ISA, caches, pipelining,
  virtual memory, and OS/concurrency fundamentals — with essentially zero
  overlap against the rest of the app, so nearly every card here is original
  rather than cross-linked. The one exception is the Models of Computation
  lecture (Lec 12), which bridges into formal computability theory already
  covered in depth by MIT 6.045J — those cards stay deliberately lean and
  cross-link via `related` instead of re-deriving the same proofs.

**MIT 6.828** (Operating System Engineering, Fall 2012, Frans Kaashoek &
Robert Morris) is complete — 99 cards across 5 modules, mapped against all 15
lectures that carry real lecture-notes content (the syllabus's remaining
lecture slots — project introduction/conferences, an in-class hacking
session, and final demos — carry no lecture material and are noted as such
in the tracker):

- **OS Overview, x86/PC Hardware & Kernel Internals** (Lec 1–3), **Virtual
  Memory & Interrupts/Exceptions** (Lec 4–5), **Multiprocessors, Locking,
  Processes & Scheduling** (Lec 6–8), **File Systems & Crash Recovery**
  (Lec 9–11), **OS Organization, Scalable & Lock-Free Concurrency, Virtual
  Machines** (Lec 13, 17, 18, 21, 22).
- Sourced from the course's own Fall 2012 lecture notes — dense prose
  outlines (not slide decks), read page-by-page. This is a lab-driven course
  built around students constructing JOS, a small x86 kernel in an exokernel
  style, and xv6, a teaching Unix; like 6.004, it's genuinely new
  hardware/systems territory with essentially no overlap against the rest of
  the app — the one deliberate exception is cross-linking a couple of cards
  to MIT 6.004's own OS-multiplexing/scheduling material (Lec 17–19) and MIT
  6.004's sequential-consistency/dining-philosophers material, since 6.828
  covers the same underlying mechanisms from the kernel-implementation side
  rather than the hardware side.

**MIT 6.035** (Computer Language Engineering, Spring 2010, Martin Rinard) is
complete — 103 cards across 5 modules, mapped against all 18 lectures that
carry real lecture-notes content (the syllabus's remaining lecture slots —
project introductions, guest lectures, and demo days — carry no lecture
material and are not tracked as separate entries):

- **Language Specification & Parsing** (Lec 1–4), **IR, Semantic Analysis &
  Code Generation** (Lec 5–8), **Program Analysis & Dataflow Foundations**
  (Lec 9–11), **Instruction Scheduling & Loop Optimization** (Lec 13–15),
  **Register Allocation, Parallelization & Memory Optimization** (Lec 16–18).
- Sourced from the course's own Spring 2010 lecture slides (fetched from OCW
  and read page-by-page), not summarized from lecture titles alone. This is
  the app's compiler-construction track — building a real compiler front to
  back, from regular-expression/CFG language specification through LR/LL
  parsing, IR design and unoptimized codegen, classical dataflow analysis
  (reaching definitions, available expressions, liveness) and its lattice-
  theoretic foundations, instruction scheduling and loop transformations
  (strength reduction, software pipelining, SIMDization), and finally
  graph-coloring register allocation, automatic parallelization (dependence
  analysis, privatization, legality-constrained loop transformations), and
  memory-system optimization (locality, tiling, prefetching, alias analysis).
  Essentially no overlap with the rest of the app — every card here is
  original, cross-linked only internally via `related`.

**MIT 6.1200J** (Mathematics for Computer Science, Spring 2024 — formerly
6.042J; Zachary Abel, Brynmor Chapman, Erik Demaine) is complete — 98 cards
across 6 modules, one per unit of the course, mapped against all 24 lectures:

- **Proofs** (Lec 1–4) is done: propositions, quantifiers, implication, sets,
  axioms and Gödel; inference rules and the standard proof templates;
  contradiction; induction, strengthening the hypothesis, and strong
  induction; proof by cases; state machines, the invariant principle, and
  termination via potential functions. Worked proofs use the `proof` card
  type (scratch space for your own attempt before the proof is revealed).
- **Algorithm Analysis** (Lec 5–7) is done, kept deliberately lean since
  Complexity Class already covers the applied side: sums (perturbation,
  ansatz, exchanging summation order, the integral method), harmonic numbers
  and Stirling's formula, the rigorous definitions and limit tests behind
  O/o/Ω/ω/Θ/~ and their notation pitfalls, Towers of Hanoi, plug-and-chug,
  and the master theorem's recursion-tree intuition and gaps.
- **Number Theory** (Lec 8–10) is done, also lean — the algorithms (Euclid,
  modular inverse/exponentiation, Miller–Rabin) live in Complexity Class and
  the RSA/Diffie–Hellman mechanics in MIT 6.045J, so these cards supply the
  proofs behind them: divisibility and the water-jug invariant, Euclid's
  correctness and bit-count bound, the Pulverizer and Bézout's identity,
  congruence vs. remainders (and how `%` differs across languages), which
  substitutions are legal mod n, inverses iff coprime, Fermat's little
  theorem, RSA's correctness proof and real security assumptions, and the
  Chinese Remainder Theorem.
- **Graphs** (Lec 11–14) is done — definitions and proofs, while the graph
  algorithms themselves stay in Complexity Class/6.006: the handshake lemma,
  bipartite degree averages, chromatic number and the greedy d+1 coloring
  proof (and buildup error in graph induction), matchings and stable
  matching with Gale–Shapley's correctness proofs and applicant-optimality,
  walks/paths/components, Euler tours, trees, digraphs/SCCs/condensation,
  topological orders, and parallel scheduling via chains and antichains.
- **Relations & Counting** (Lec 15–17) is done, at full depth since almost
  none of it existed in the app: relations and function properties
  (total/injective/surjective/bijective), equivalence relations and the
  partition theorem, weak partial and total orders, the product/sum/
  bijection/generalized-product/division rules, binomial coefficients,
  counting with recipes (and catching overcounts), complements,
  inclusion–exclusion with its sign-cancellation proof, the pigeonhole
  principle, combinatorial proofs, and the binomial/multinomial theorems.
- **Probability** (Lec 18–24) is done, at full depth — a core gap against
  KU Leuven's *Kansrekenen*: probability spaces and the tree method (Monty
  Hall, nontransitive dice), probability rules, conditional probability,
  Bayes' rule and base rates, Simpson's paradox, independence (pairwise vs.
  mutual, correlated events, conditioning-induced dependence), the birthday
  principle, random variables and the binomial distribution, a randomized
  two-envelope strategy, expectation and linearity of expectation, variance
  (and its additivity under pairwise independence), and the Markov,
  Chebyshev and Chernoff bounds.
- Sourced from the course's own Spring 2024 lecture notes (read page-by-page);
  Lecture 23 has no published notes, so it is sourced from Lecture 24's own
  variance review plus the course's official textbook (Lehman, Leighton &
  Meyer, *Mathematics for Computer Science*, CC BY-SA, linked from the OCW
  readings page), §20.2–20.3. Units 2–4 overlap heavily with existing tracks
  and stay lean (supplying proofs, cross-linked both ways); Units 1, 5 and 6
  are the real gap and get full depth. A few slips in the notes are corrected
  in the cards (noted in the affected modules' header comments). Known
  residual gap: Spring 2024 doesn't teach infinite cardinality /
  diagonalization, which KU Leuven's *Bewijzen en redeneren* does.

**MIT 18.06** (Linear Algebra, 18.06SC Fall 2011, Gilbert Strang) is
complete — 73 cards across 6 modules, sourced from the course's own
per-lecture summaries with every matrix example recomputed exactly (the PDFs'
matrix layouts don't survive text extraction). Lecture numbers follow
Strang's 34 video lectures, which the 18.06SC sessions track one-to-one.

- **Elimination & Matrices** (Lec 1–5) is done: the row/column/matrix
  pictures, elimination and back substitution, elimination and permutation
  matrices, four views of matrix multiplication, inverses and Gauss–Jordan,
  (AB)⁻¹ and (AB)ᵀ, A = LU / LDU / PA = LU and the n³/3 cost, symmetric
  RᵀR, and vector spaces/subspaces.
- **Vector Spaces & the Four Subspaces** (Lec 6–12) is done: nullspace and
  column space, special solutions and rref, the complete solution of Ax = b
  and the four rank cases, independence/basis/dimension, the four
  fundamental subspaces with proofs of rank–nullity and row rank = column
  rank, matrix and function spaces, rank-one matrices, and incidence
  matrices (Kirchhoff's law, Euler's formula from the subspace dimensions).
  Lecture 13 is the Unit I exam review.
- **Orthogonality & Least Squares** (Lec 14–17) is done: orthogonality via
  Pythagoras, row space ⊥ nullspace as orthogonal complements, N(AᵀA) =
  N(A), projections onto lines and subspaces and the normal equations,
  least-squares line fitting, orthonormal/orthogonal matrices, Gram–Schmidt
  and A = QR.
- **Determinants** (Lec 18–20) is done, built axiomatically from the three
  defining properties: derived properties with proofs, det = 0 iff singular
  (and computing det via pivots), det AB and det Aᵀ, the big formula and
  cofactor expansion, the cofactor formula for A⁻¹ (with proof), Cramer's
  rule, and |det A| as volume.
- **Eigenvalues & Eigenvectors** (Lec 21–24) is done: Ax = λx and the
  characteristic equation, trace = sum and det = product (with proof),
  complex and defective cases, diagonalization and powers of A, a proof that
  distinct eigenvalues give independent eigenvectors, difference equations
  and Binet's Fibonacci formula, du/dt = Au with stability and e^(At),
  Markov matrices (eigenvalue 1, steady states), and Fourier series as an
  orthonormal expansion in function space.
- **Positive Definite Matrices, SVD & Linear Transformations** (Lec 25–31,
  33) is done: the spectral theorem with proofs of real eigenvalues and
  orthogonal eigenvectors, complex vectors and Hermitian/unitary matrices,
  the Fourier matrix and FFT, the four positive-definiteness tests,
  completing the square as elimination and the Hessian test, ellipsoids,
  AᵀA and similar matrices (with proofs), Jordan form, the SVD and its four
  orthonormal subspace bases, linear transformations and their matrices,
  change of basis and image compression, and left/right inverses and the
  pseudoinverse (with proof). Lectures 13, 32 and 34 are exam/course
  reviews; the Quiz 2 review ("24b") has no tracker entry.
- Where the summaries slip, the cards correct them (noted in each affected
  module's header comment). 18.06 is computational: abstract
  linear-map/spectral-theorem rigour and numerical conditioning/stability
  (KU Leuven's *Lineaire algebra* proofs and *Numerieke wiskunde*) remain
  partial gaps.

**MIT 18.05** (Introduction to Probability and Statistics, Spring 2022,
Jeremy Orloff & Jennifer French) is complete — 35 cards across 3
modules, following the course's own arc (probability → Bayesian inference →
frequentist inference), sourced from its per-class reading notes with every
numeric example recomputed.

- **Continuous Probability & Limit Theorems** (Classes 1–7) is done, lean
  where 6.1200J already covers counting, conditional probability and
  discrete expectation (Classes 1–3 point there in the tracker): the
  Bernoulli/binomial/geometric distributions, pdfs and cdfs, the uniform/
  exponential/normal gallery, memorylessness (with proof), transforming
  random variables, continuous expectation/variance, quantiles,
  standardization, the law of large numbers, the central limit theorem
  (with a continuity-correction example), joint distributions, and
  covariance/correlation.
- **Maximum Likelihood & Bayesian Inference** (Classes 10–16) is done: the
  phases of statistics, MLEs (discrete and continuous, via log likelihood),
  the Bayesian update table, prior/likelihood/posterior and MLE vs MAP,
  prior and posterior predictive probabilities, odds and Bayes factors,
  continuous priors, conjugate priors (beta–binomial with proof,
  normal–normal precision weighting), choosing priors, and credible
  intervals.
- **Frequentist Inference** (Classes 17–26) is done: NHST ingredients,
  type I/II errors, significance and power, p-values (and what they are
  not), z- and t-tests, choosing a test (ANOVA, chi-square), the
  frequentist-vs-Bayesian comparison, confidence intervals for normal data
  and what "95% confidence" really means, polling and large-sample
  intervals, the bootstrap, and least-squares linear regression.

**MIT 18.01** (Single Variable Calculus, 18.01SC Fall 2010, David Jerison) is
complete — 78 cards across 6 modules, sourced from the course's own
per-session lecture notes (the written notes that accompany each video clip,
686 pages across 101 sessions), with every derivative, integral, limit and
series recomputed in sympy. The tracker follows the OCW Scholar numbering
(Sessions 1–101) and groups it by the course's five units, each closed by an
exam review and exam (Sessions 21/22, 41/42, 66/67, 85/86); Unit 5 is split
at its own Part A / Part B boundary. Worked-example sessions (e.g. the ring on
a string, the sphere and cauldron volumes, the wine glass) are folded into
neighbouring cards and say so in the tracker. Measured against KU Leuven's
*Wiskunde I*, this covers limits, derivatives, integrals, series and
Taylor polynomials, and first-order separable differential equations.

- **Differentiation** (Sessions 1–22) is done: the derivative as a limit of
  secant slopes and as a rate of change, derivatives from the definition,
  limits, one-sided limits and continuity (with the ε–δ definition added),
  discontinuity types, differentiable ⇒ continuous, sin/cos derivatives and
  the squeeze proof of sin θ/θ → 1, the sum/product/quotient rules, the chain
  rule (with a proof that survives Δg = 0), higher derivatives and Dⁿxⁿ = n!,
  rational exponents and inverse functions by implicit differentiation, aˣ,
  M(a), e and ln, logarithmic differentiation, (1 + 1/n)ⁿ → e, and the
  hyperbolic functions.
- **Applications of Differentiation** (Sessions 23–42) is done: linear and
  quadratic approximation (and differentials), curve sketching, max/min at
  critical points and endpoints, related rates, Newton's method and its
  quadratic convergence, the mean value theorem (proof via Rolle added) and
  its consequences, MVT inequalities, antiderivatives and their uniqueness,
  substitution, and separable differential equations.
- **The Definite Integral & its Applications** (Sessions 43–67) is done:
  Riemann sums, FTC1 and FTC2 with proofs, properties and estimation,
  definite substitution, ln defined as an integral, new functions (erf,
  Fresnel, Li), areas between curves, disks and shells, average value,
  weighted averages and probability, numerical integration (trapezoid vs
  Simpson), and the Gaussian integral √π.
- **Techniques of Integration** (Sessions 68–86) is done and kept lean: trig
  powers, ∫tan/∫sec, trig substitution and completing the square, partial
  fractions (cover-up, repeated and quadratic factors), integration by parts
  and reduction formulas, arc length (radians as arc length), surface area,
  parametric curves, and polar coordinates and polar area.
- **L'Hôpital's Rule & Improper Integrals** (Sessions 87–93) is done:
  L'Hôpital (the general rule proved from the Cauchy MVT), rates of growth
  (ln x ≪ xᵃ ≪ eᵖˣ, linked to the 6.1200J asymptotics cards), indeterminate
  forms, improper integrals and the p-test, limit/direct comparison, and
  integrals over singularities.
- **Infinite Series & Taylor Series** (Sessions 94–101) is done: partial sums
  and the geometric series, the integral test (proved) and the harmonic
  series, comparison and the ratio test, the stacking-blocks overhang (linked
  both ways with 6.1200J's harmonic-number card), power series and radius of
  convergence, Taylor's formula with remainder, and term-by-term operations
  (ln(1 + x), e^(−t²), erf).
- Where the notes slip, the cards correct them (each module's header comment
  lists the corrections). The notes are informal by design; the ε–δ limit,
  the Rolle-based MVT proof, the general L'Hôpital rule, the ratio test,
  absolute/alternating convergence and Taylor's remainder theorem are added
  (and marked as additions in the headers). Residual gap: real-analysis
  rigour (completeness of ℝ, uniform continuity, Riemann integrability
  proofs) that KU Leuven's *Wiskunde I* touches is only stated, not proved.

**MIT 18.335J** (Introduction to Numerical Methods, Spring 2019, Steven G.
Johnson) covers its numerical-linear-algebra core: 56 cards across 5
modules for Lectures 1–24. The course is the numerical layer on top of MIT
18.06: what elimination, QR, the SVD and eigenvalues do in floating point.
Sources are the OCW per-lecture summaries plus the course's handouts
(Johnson's notes on Newton's method, summation accuracy, backwards
stability and norm equivalence; Per-Olof Persson's slides on IEEE
arithmetic, Gram–Schmidt, Householder/Givens, Hessenberg reduction, the QR
algorithm and sparse matrices) and the Pset 1/2 solutions where the
summaries point to them. The textbook (Trefethen & Bau) is not on OCW and
was not used. Every numeric example, flop count and code sketch was
recomputed or run. Lectures 25–39 (optimization, adjoint methods,
quadrature, FFTs) are outside this track's scope.

- **Floating Point, Stability & Conditioning** (Lec 1–5) is done: Newton's
  square roots and their quadratic convergence (with proofs), the
  floating-point model and IEEE single/double formats, special values and
  gradual underflow, floating-point myths, naive vs pairwise summation
  error bounds, forwards/backwards stability (with the summation proof),
  vector/matrix norms and norm equivalence, condition numbers, and
  ‖A‖₂ via the Rayleigh quotient with κ(A*A) = κ(A)².
- **SVD, Least Squares & QR** (Lec 7–11) is done: the SVD and κ₂ =
  σ₁/σₙ, the ±σ Hermitian embedding, least squares three ways, why normal
  equations square κ, classical vs modified Gram–Schmidt (with Persson's
  orthogonality-loss example), triangular orthogonalization vs orthogonal
  triangularization, Householder reflectors, Givens rotations, and
  Householder QR.
- **Caches, LU & Cholesky** (Lec 11–14) is done: why flop counts don't
  predict speed, the ideal-cache model, blocked and cache-oblivious matrix
  multiplication, spatial locality, LU and why not to form A⁻¹, partial
  pivoting, the growth factor (2ᵐ⁻¹ example), Cholesky, and structured
  solvers.
- **Eigenvalue Algorithms** (Lec 14–17) is done: the Schur factorization,
  why eigensolvers must iterate, Wilkinson's polynomial, Hessenberg
  reduction, power/inverse iteration, Rayleigh-quotient iteration, QR as
  simultaneous iteration (with proof), and shifted QR with Wilkinson shifts
  and deflation.
- **Krylov Methods & Sparse Solvers** (Lec 17–24) is done: Arnoldi,
  Rayleigh–Ritz and Lanczos, restarting, GMRES and its polynomial
  convergence theory, preconditioning, steepest descent vs conjugate
  gradient (exact 2×2 trace), CG convergence, PCG/biCG, solver-choice
  rules, and sparse-direct fill-in with nested dissection.

**MIT 24.241** (Logic I, Fall 2009, Ephraim Glick; TA Damien Rochford) is
complete — 59 cards across 5 modules, following the course's own two-part
arc (sentential logic and its metatheory, then predicate logic and its
metatheory). The course's textbook (Bergmann, Moor & Nelson, *The Logic
Book*) is not on OCW, so cards are sourced only from the OCW-hosted slides,
handouts, problem-set answer sheets, quizzes and final exam. Every truth
table, interpretation and derivation was re-checked by brute force or line by
line, and errors in the source (e.g. a false "symmetric + transitive ⇒
reflexive" answer, a typo in the satisfaction clause for &, and a wrong ∃E
step in the soundness proof) are corrected and logged in the module headers.

- **Sentential Logic — Syntax & Semantics** (Lectures 1–5) is done:
  validity and soundness of arguments, truth-functionality, the recursive
  syntax of SL, connectives and translation ("only if", "because"), the
  oddities of the material conditional, truth tables, truth-functional
  properties, entailment and validity, entailment metatheorems, and
  explosion.
- **Natural Deduction in SD** (Lectures 6–8) is done: Fitch-style
  derivations (scope, primary/auxiliary assumptions, accessibility, Γ ⊢ P),
  SD's intro/elim rules, worked derivations (reductio, conditional proof, ∨E,
  De Morgan, the theorem (A ⊃ B) ∨ (B ⊃ A)), SD+ derived rules, what
  derivations can establish, and why a rule must be truth-preserving.
- **Metatheory of SL** (Lectures 9–11, 13) is done: ⊨ vs ⊢, induction on
  sentences (with a strengthened hypothesis), replacement of equivalents,
  truth-functional completeness via characteristic sentences/DNF, the
  Sheffer stroke and neither-nor, soundness of SD, completeness of SD
  (Lindenbaum construction, maximally consistent sets, truth lemma),
  compactness, and the two meanings of "complete".
- **Predicate Logic — Syntax, Translation & Formal Semantics** (Lectures
  12–18) is done: why PL, formulas and sentences, scope and free/bound
  variables, identity and counting, translation patterns, quantifier
  movement, quantificational properties and counter-interpretations,
  nonempty domains (and free logic), and the formal semantics with
  variable assignments, satisfaction and truth, with worked evaluations.
- **Derivations in PD & Metatheory of Predicate Logic** (Lectures 19–25) is
  done: the quantifier rules and why ∀I/∃E need their restrictions, worked
  PD and PDE derivations, ∃∀ ⇒ ∀∃, what PD can and can't establish
  (semi-decidability), soundness of PD (∀E and ∃E cases), completeness of PD
  (evenly subscripted sets, the Henkin construction, the canonical model on
  the positive integers), and Löwenheim–Skolem and compactness. Lecture 25
  (review) has no card content.

**MIT 6.042J** (Mathematics for Computer Science, Spring 2015, Albert R.
Meyer & Adam Chlipala) covers only the two topics the KU Leuven logic and
proof courses need that neither the 6.1200J nor the 24.241 OCW materials
cover — 19 cards across 2 modules, sourced from the course's OCW-hosted
textbook chapters (*Mathematics for Computer Science*, 2015 edition) and
numbered by the class sessions that assign them.

- **Logical Formulas — Normal Forms, Equivalence Axioms & SAT** (Sessions
  4–5, MCS Ch. 3) is done: validity vs satisfiability, DNF and CNF from a
  truth table, the equivalence axioms, algebraic DNF conversion, the
  completeness of the equivalence axioms, SAT and P vs NP, ambiguous "any",
  and validity for predicate formulas.
- **Infinite Sets — Cardinality, Diagonalization & ZFC** (Session 11, MCS
  Ch. 7) is done: surj/inj/bij/strict, Schröder–Bernstein and
  comparability, Hilbert's hotel, countable sets (ℤ, ℚ, finite sequences),
  Cantor's theorem, the diagonal argument, uncountability of ℝ, larger
  infinities and the continuum hypothesis, the halting problem as a
  diagonal argument, Russell's paradox, and the ZFC axioms.

**MIT 6.001** (Structure and Interpretation of Computer Programs, Spring 2005,
Eric Grimson, Peter Szolovits & Trevor Darrell) is complete: 70 cards across 7
modules. It closes the gap left by KU Leuven's *Declaratieve talen*. The cards
are sourced from the course's per-lecture handouts (slide narration, with code
read from the slide images), its three evaluator code handouts, and the SICP
textbook that the OCW readings page links. Every trace and count was re-run
by hand or in Python.

- **Procedures, Processes & Orders of Growth** (Lec 1–4) is done:
  declarative vs imperative knowledge, primitives/combination/abstraction,
  lambda and procedure objects, sqrt by successive averaging, the substitution
  model and applicative order, why `if` is a special form, recursive vs
  iterative factorial (with an induction proof of correctness), Θ for time and
  space, tree-recursive Fibonacci (2F(n+1) − 1 calls), linear, iterative and
  logarithmic exponentiation, and Pascal's triangle.
- **Data Abstraction & Higher-Order Procedures** (Lec 5–8) is done: block
  structure, the cons/car/cdr contract and closure, list procedures,
  rationals behind an abstraction barrier, 6.001's type notation, `sum`,
  `deriv`/`fixed-point`/`average-damp`, map/filter/fold-right, compose's
  polymorphic type with type variables, deriving `repeated` from its type,
  debugging methodology, and the Escher picture language.
- **Symbols, Tagged Data, Mutation & Search** (Lec 9–14) is done: quote and
  symbols, symbolic differentiation, tagged data and data-directed/defensive
  programming, tables and hash tables as opaque ADTs, set!/set-car!/set-cdr!
  with sharing and identity, the O(1) mutable queue, trees, and DFS/BFS
  seekers. Lecture 14 has no handout, so its tracker entry points to Lecture 13
  and 6.006.
- **Environment Model & Object-Oriented Programming** (Lec 15–18) is done:
  frames and the name/define/set! rules, the lambda and application rules
  (lexical scoping), closures with local state, message passing, generic
  operations vs objects, and the Scheme object system (ask/self, inheritance,
  delegate vs ask, multiple inheritance).
- **Interpreters, the Metacircular Evaluator & Lazy Evaluation** (Lec 19–21)
  is done: interpreter stages, the step-by-step Scheme* evaluator,
  m-eval/m-apply, syntax vs semantics (let desugaring), environments as list
  structure, lexical vs dynamic scoping, normal vs applicative order, the lazy
  evaluator with memoized thunks, and streams (infinite streams, the stream
  sieve, an integrator).
- **Concurrency, Universal Machines & Computability** (Lec 22–26) is done:
  interleavings and serializers, deadlock and mutexes, the analyze evaluator,
  eval as a universal machine, the halting theorem by diagonalization, and the
  Y combinator. Lectures 24 and 25 were guest talks with no notes, so they have
  tracker-only entries.
- **Logic Programming & Nondeterministic Search** (SICP §4.3–4.4) is done:
  relations vs functions, amb and chronological backtracking, the query
  language, rules as Horn clauses, streams of frames, unification (with the
  occurs check and its implementation), rule application, logic vs control
  (infinite loops), and negation as failure under the closed-world assumption.
  The 2005 course has no logic-programming lecture, so these cards sit in the
  Lecture 21 tracker entry as the next "variation on a Scheme".
- Where the handouts slip, the cards correct them (noted in each module's
  header comment). Static type systems with Hindley–Milner inference
  (Haskell's side of *Declaratieve talen*) remain a gap. 6.001 only covers
  dynamic types and informal type reasoning.

Run `scripts/validate-content.ts` after adding cards to any module — it checks
id uniqueness, module/tier consistency, and that every `related` link resolves.
