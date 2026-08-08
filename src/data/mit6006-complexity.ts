// MIT 6.006 (Spring 2020) — Lecture 19: Complexity. The course's compact
// capstone lecture on computability and NP-completeness. P/NP definitions,
// NP-hardness, reductions, and Cook-Levin already have deep cards in the
// Tier 3 np-completeness module — cross-linked here as thin bridges. What's
// new: the R/EXP/P decidability hierarchy with its countability argument
// for undecidable problems, concrete reduction examples, Chess as an
// EXP-complete (not merely NP-complete) problem, and how real NP-hardness
// proofs chain reductions together in practice.
import type { Card } from "./types";

const MODULE = "mit6006-complexity";

export const mit6006ComplexityCards: Card[] = [
  {
    id: "mit6006-complexity-decidability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does 6.006 claim most decision problems are undecidable, and what does that have to do with counting?",
    back: `A **decision problem** is a function $p: \\mathbb{N} \\to \\{0,1\\}$ (encode any input as an integer; the problem answers YES/NO for each) — equivalently, an infinite string of bits. A **program** solving it is a *finite* string of bits (constant-length code, independent of input size) — equivalently, one particular natural number.

The cardinality mismatch is the whole argument: there are only **countably infinitely many** programs ($|\\mathbb{N}|$, since each is a finite bit-string), but **uncountably infinitely many** problems ($|\\mathbb{R}|$, since each is an infinite bit-string — provable via Cantor's diagonalization argument). Since there are strictly more problems than programs, **most decision problems have no program that solves them at all** — they're **undecidable**, regardless of how much time or space you're willing to spend. The canonical example is the **Halting Problem** (does a given program terminate on a given input?) — provably undecidable, not merely hard.

This motivates the decidable-problem hierarchy 6.006 actually studies: $P \\subsetneq EXP \\subsetneq R$, where $R$ = decidable in *some* finite time, $EXP$ = decidable in $2^{n^{O(1)}}$ time (where "most problems we think of" actually live), and $P$ = decidable in $n^{O(1)}$ polynomial time (the efficient algorithms this whole course is about). These containments are strict, provable via time-hierarchy theorems (6.045 territory) — so $EXP$ isn't just "P but we haven't found the fast algorithm yet," it provably contains problems no polynomial algorithm can ever solve.`,
    pitfall:
      "Undecidable is a strictly stronger claim than 'no known efficient algorithm' — an undecidable problem has no algorithm at all, of any running time, that solves it correctly on every input. Don't conflate 'undecidable' (Halting Problem) with 'decidable but not known to be in P' (most NP problems) — they're different tiers of difficulty.",
    related: ["np-completeness-p-vs-np"],
  },
  {
    id: "mit6006-complexity-np-certificates",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In 6.006's certificate-verifier definition of NP, what makes a valid certificate for each of its example problems?",
    back: `$NP$ = decision problems with a **verifier** $V$ that, given the input $I$ and a polynomial-length **certificate** $c$, runs in polynomial time and outputs YES iff $c$ actually proves $I$ is a YES-instance — i.e. some certificate makes $V$ say YES exactly when $I$ truly is a YES input, and *no* certificate can trick $V$ into saying YES on a NO input. Concretely, per problem:

| Problem | Certificate | What the verifier checks |
|---|---|---|
| $s$-$t$ Shortest Path $\\leq d$ | a path $P$ | sum edge weights on $P$, check $\\leq d$ |
| Negative Cycle | a cycle $C$ | sum edge weights on $C$, check $< 0$ |
| Longest Simple Path $\\geq d$ | a path $P$ | check $P$ is simple, weight $\\geq d$ |
| Subset Sum | a subset $A'$ | check $A' \\subseteq A$ sums to $S$ |
| Tetris (survive $k$ pieces) | a move sequence | simulate, check survival |

$P \\subseteq NP$ trivially (the verifier just solves the instance itself, ignoring the certificate entirely). $NP \\subseteq EXP$ because you can brute-force **every** possible certificate (at most $2^{n^{O(1)}}$ of them, since certificates are polynomial-length bit strings) and run the poly-time verifier on each. Whether $P = NP$ — whether being able to *verify* a proof quickly implies being able to *find* one quickly — is exactly the open Millennium Prize question, and most researchers believe $P \\subsetneq NP$: generating solutions is strictly harder than checking them.`,
    related: ["np-completeness-p-vs-np"],
  },
  {
    id: "mit6006-complexity-reduction-examples",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are three concrete worked reductions 6.006 uses to illustrate 'reduce to a problem you know how to solve' at the complexity level?",
    back: `A **reduction** from problem $A$ to problem $B$ ($A \\to B$, read "$A \\leq B$") converts any instance of $A$ into an instance of $B$ whose solution gives $A$'s answer — proving $B$ is *at least as hard* as $A$ (an algorithm for $B$ immediately gives one for $A$). Three concrete examples, in increasing generality:

- **Unweighted Shortest Path $\\to$ Weighted Shortest Path**: give every edge weight $1$ — any weighted-shortest-path algorithm now also solves the unweighted case.
- **Integer-weighted Shortest Path $\\to$ Unweighted Shortest Path**: subdivide each edge of weight $w$ into $w$ unit-weight edges via $w{-}1$ new intermediate vertices — a path's edge-count in the subdivided graph exactly equals its original total weight, so BFS on the subdivided graph solves the weighted problem.
- **Longest (simple) Path $\\to$ Shortest Path**: negate every edge weight — the *most* negative-weight path (shortest, by the negated weights) corresponds to the *most* positive-weight (longest) path in the original.

This is the same general strategy from "how to solve an algorithms problem" (reduce to something you already know) — reductions are that strategy applied one level up, at the level of entire *problems* rather than individual instances, and are exactly the tool used to build the whole edifice of NP-completeness (see the related reduction-chain card).`,
    pitfall:
      "The longest-path-via-negation reduction only works because it's restricted to simple paths — negating weights and running a shortest-path algorithm on a graph with cycles would let the algorithm loop around a negative cycle indefinitely, which is exactly why Longest Simple Path is NP-complete while ordinary Shortest Path is easy: the 'simple' constraint is what makes the reduction direction not just trivially work both ways.",
    related: ["np-completeness-reductions"],
  },
  {
    id: "mit6006-complexity-exp-complete-chess",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Why is Chess EXP-complete rather than merely NP-complete, and what does that distinction actually mean?",
    back: `**Chess** (does a player have a forced win from a given board, on an $n \\times n$ generalized board) is in $EXP \\setminus P$, and specifically **EXP-complete**: it's in $EXP$, *and* every problem in $EXP$ polynomially reduces to it — making it (informally) one of the hardest problems in $EXP$, the same way an NP-complete problem is one of the hardest in $NP$.

The reason Chess resists an $NP$-style certificate: a "certificate" for *forced-win* game problems isn't a short, easily-checkable object like a path or a subset — it's an entire game tree of exponential size, since verifying "I can force a win" requires accounting for the opponent's best-possible responses at every branch, not just exhibiting one winning line. Problems like Longest Simple Path or Tetris (single-agent, no adversary to account for) admit short certificates (one path, one move sequence) and land in $NP$; two-player adversarial games with forced-win questions generally don't, and land a full exponential tier higher, in $EXP$-complete territory.

This is a useful data point against a common misconception: "NP-complete" is not a synonym for "very hard" in general — it specifically means "hardest *within NP*." A problem can be provably **harder** than every NP-complete problem (assuming $P \\neq NP$, since $EXP$-complete problems are provably outside $P$, unlike NP-complete problems where that's merely conjectured) — Chess is exactly such a problem.`,
    pitfall:
      "Don't assume 'NP-complete' means 'as hard as problems get' — it's specifically the ceiling of NP, and EXP-complete problems like generalized Chess are a provably harder tier above it, not merely a different flavor of similarly-hard.",
    related: ["np-completeness-p-vs-np", "mit6006-complexity-decidability"],
  },
  {
    id: "mit6006-complexity-reduction-chains",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do real NP-hardness proofs chain together, using 3-Partition → Rectangle Packing → Jigsaw Puzzles as a worked example?",
    back: `New NP-hardness results are almost never proven from scratch against Circuit-SAT (the historically-first NP-complete problem, from Cook-Levin) — instead, they're proven by reducing from a problem **already known** to be NP-hard, chaining outward:

- **3-Partition** (given $n$ integers, can they be split into equal-sum triples?) is NP-hard — unlike Subset Sum, which is only **weakly** NP-complete (its pseudopolynomial $O(nT)$ DP means it's efficiently solvable whenever the target $T$ is polynomially bounded), 3-Partition is **strongly** NP-complete: no pseudopolynomial algorithm exists for it either, even when all the numbers involved are small.
- **Rectangle Packing** (fit $n$ given rectangles exactly into one target rectangle) reduces *from* 3-Partition: turn integer $a_i$ into a $1 \\times a_i$ strip, and set the target rectangle to $\\frac{n}{3} \\times \\frac{\\sum a_i}{3}$ — packing the strips into it exactly forces a partition into equal-sum triples (each "row" of the target).
- **Jigsaw Puzzles** (fit ambiguous-tabbed pieces together) reduces *from* Rectangle Packing: use uniquely-matching tabs to force pieces into rigid rectangular blocks (encoding the rectangles), plus one ambiguous tab/pocket pattern to force those blocks into the outer boundary shape — turning "solve this jigsaw" into "solve the encoded rectangle-packing instance."

Each link only needs to show *one* direction (hard problem $\\to$ new problem) — once one link in a chain is established, everything reachable by further reductions inherits NP-hardness for free, which is why the "known NP-complete problems" list (Subset Sum, TSP, graph coloring, clique, SAT, and — per this chain — Rectangle Packing and Jigsaw Puzzles, plus most video games) keeps growing without anyone needing to re-derive Cook-Levin's original circuit-based argument each time.`,
    pitfall:
      "A reduction proving NP-hardness must go FROM a known-hard problem TO the new one (known-hard ≤ new), not the reverse — reducing the new problem to a known-hard one only shows the new problem is at most as hard, which proves nothing about a lower bound on its difficulty.",
    related: ["np-completeness-reductions", "np-completeness-tsp-subset-sum"],
  },
];
