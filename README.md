# Memoize

A flashcard app for mastering algorithms and data structures, from first-principles
complexity analysis through advanced/specialized topics. Built for depth and
correctness over quiz-app polish — 389 cards across 30 modules: the full
undergraduate-to-early-graduate algorithms & data structures curriculum (322 cards,
24 modules, three tiers), plus a course-specific track for MIT 6.006 (67 cards,
6 modules) mapped lecture-by-lecture against the course's own syllabus.

## Stack

Vite + React + TypeScript + Tailwind CSS, Zustand for state, `localStorage` for
persistence (no backend, single-user). Content lives as typed data in
`src/data/*.ts`, one file per module, against the shared `Card` interface in
`src/data/types.ts`.

## Study modes

- **Review** — spaced-repetition queue (simplified SM-2), only cards due today,
  filterable by Track (Tier 1/2/3, or a specific course like MIT 6.006 — isolating
  a course's cards from the rest of the deck for focused exam prep).
- **Browse** — free exploration by track/module/type, with search.
- **Cram** — every card in a chosen module, no effect on SRS state.
- **Learn** — a structured, textbook-style read through each module: cards in
  curated order as one continuous page, with a sticky table of contents and
  clickable cross-links between related cards (including across modules).
  Read-only, like Browse/Cram.
- **Courses** — a lecture-by-lecture syllabus tracker for a specific course
  (currently MIT 6.006), grouping every lecture by which exam it's scoped to,
  with recitation/problem-set cross-references and per-lecture mastery,
  linking each lecture straight into Learn mode for the cards that cover it.
- **Cheat Sheet** — complexity reference generated directly from card data.
- **Stats** — per-module mastery, streak, cards due.

Keyboard-driven: space/enter to flip, 1–4 to rate in Review, arrow keys to
navigate in Browse.

## Course tracks

Course tracks (`src/data/courses.ts`) sit alongside the generic tiered
curriculum: a `ModuleMeta.course` tag marks which modules belong to a course
instead of a tier, and a lecture map (`{ number, title, cardIds, ... }`)
points each lecture at the card ids that cover it — mixing course-specific
cards with cross-links into the generic curriculum's existing deep cards
where topics overlap, rather than duplicating content. MIT 6.006 (Spring
2020, MIT OpenCourseWare) is the first course covered; its 6 modules follow
the course's own vocabulary and framing (e.g. the Sequence/Set interfaces,
SRT BOT for dynamic programming, the Word-RAM model) even where a topic is
also covered generically elsewhere in the deck.

## Development

```bash
npm install
npm run dev        # http://localhost:5173

npm run build       # production build to dist/
npx tsc -b --noEmit  # typecheck
npx tsx scripts/validate-content.ts  # verify card id/related-link integrity
```

## Content status

All three tiers of the generic curriculum are complete — 322 cards across 24
modules:

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

Run `scripts/validate-content.ts` after adding cards to any module — it checks
id uniqueness, module/tier consistency, and that every `related` link resolves.
