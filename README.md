# Memoize

A flashcard app for mastering algorithms and data structures, from first-principles
complexity analysis through advanced/specialized topics. Built for depth and
correctness over quiz-app polish — 322 cards covering the full undergraduate-to-
early-graduate algorithms & data structures curriculum, organized into three tiers
and 24 modules.

## Stack

Vite + React + TypeScript + Tailwind CSS, Zustand for state, `localStorage` for
persistence (no backend, single-user). Content lives as typed data in
`src/data/*.ts`, one file per module, against the shared `Card` interface in
`src/data/types.ts`.

## Study modes

- **Review** — spaced-repetition queue (simplified SM-2), only cards due today,
  optionally filtered by tier.
- **Browse** — free exploration by tier/module/type, with search.
- **Cram** — every card in a chosen module, no effect on SRS state.
- **Learn** — a structured, textbook-style read through each module: cards in
  curated order as one continuous page, with a sticky table of contents and
  clickable cross-links between related cards (including across modules).
  Read-only, like Browse/Cram.
- **Cheat Sheet** — complexity reference generated directly from card data.
- **Stats** — per-module mastery, streak, cards due.

Keyboard-driven: space/enter to flip, 1–4 to rate in Review, arrow keys to
navigate in Browse.

## Development

```bash
npm install
npm run dev        # http://localhost:5173

npm run build       # production build to dist/
npx tsc -b --noEmit  # typecheck
npx tsx scripts/validate-content.ts  # verify card id/related-link integrity
```

## Content status

All three tiers are complete — 322 cards across 24 modules:

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

Run `scripts/validate-content.ts` after adding cards to any module — it checks
id uniqueness, module/tier consistency, and that every `related` link resolves.
