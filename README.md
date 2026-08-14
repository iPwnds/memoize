# Memoize

A flashcard app for mastering algorithms, data structures, and theoretical CS,
organized entirely by course — every module belongs to exactly one course,
there's no undifferentiated generic pile. Built for depth and correctness over
quiz-app polish — 525 cards across 42 modules and 4 courses:

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

More MIT OpenCourseWare courses are intended to follow the same pattern.

## Stack

Vite + React + TypeScript + Tailwind CSS, Zustand for state, `localStorage` for
persistence (no backend, single-user). Content lives as typed data in
`src/data/*.ts`, one file per module, against the shared `Card` interface in
`src/data/types.ts`.

## Study modes

The landing page is a dashboard: due-today count, streak, overall mastery, a
one-click jump into Review, and — if you have one in progress — a course
progress spotlight, plus a grid linking into every mode below.

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

Run `scripts/validate-content.ts` after adding cards to any module — it checks
id uniqueness, module/tier consistency, and that every `related` link resolves.
