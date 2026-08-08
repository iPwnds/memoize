# Memoize

A flashcard app for mastering algorithms and data structures, from first-principles
complexity analysis through advanced/specialized topics. Built for depth and
correctness over quiz-app polish — hundreds of cards covering the undergraduate-to-
early-graduate algorithms & data structures curriculum, organized into three tiers.

## Stack

Vite + React + TypeScript + Tailwind CSS, Zustand for state, `localStorage` for
persistence (no backend, single-user). Content lives as typed data in
`src/data/*.ts`, one file per module, against the shared `Card` interface in
`src/data/types.ts`.

## Study modes

- **Review** — spaced-repetition queue (simplified SM-2), only cards due today.
- **Browse** — free exploration by tier/module/type, with search.
- **Cram** — every card in a chosen module, no effect on SRS state.
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

Tier 1 (Modules 1–12: Complexity & Analysis, Core Linear Structures, Hashing,
Binary Trees & BSTs, Heaps & Priority Queues, Sorting, Searching, Graph
Traversal, Shortest Paths & MST, Recursion & Divide-and-Conquer, Dynamic
Programming, Greedy Algorithms) is complete. Tiers 2–3 are not yet built.

Run `scripts/validate-content.ts` after adding cards to any module — it checks
id uniqueness, module/tier consistency, and that every `related` link resolves.
