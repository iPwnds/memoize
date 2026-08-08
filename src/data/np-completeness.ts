import type { Card } from "./types";

const MODULE = "np-completeness";

export const npCompletenessCards: Card[] = [
  // ------------------------------------------------------------------ P vs NP
  {
    id: "np-completeness-p-vs-np",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What do P and NP mean, and what is the P vs NP question actually asking?",
    back: `**P** is the class of decision problems (yes/no questions) **solvable** by a deterministic algorithm in **polynomial time** — $O(n^k)$ for some fixed $k$. "Efficiently solvable," in the standard theoretical sense.

**NP** is the class of decision problems where a **proposed "yes" answer can be *verified*** in polynomial time, given a **certificate/witness** — you don't need to find the solution efficiently, just confirm one is correct efficiently, once shown one. E.g. for "does this graph have a Hamiltonian cycle?", verifying a *proposed* cycle visits every vertex exactly once is fast, even though *finding* one is believed to be hard.

Every problem in **P is also in NP** ($P \\subseteq NP$): if you can solve it in polynomial time, you can trivially "verify" any proposed answer by just solving it yourself and comparing, ignoring the certificate. The open question — one of the most famous unsolved problems in computer science and mathematics, with a \\$1 million Millennium Prize attached — is whether **$P = NP$**: is every efficiently-*verifiable* problem also efficiently *solvable*? Despite decades of effort, nobody has proven it either way, though the overwhelming consensus (unproven) is that $P \\neq NP$.`,
    pitfall:
      "NP does NOT stand for 'non-polynomial' — it stands for 'nondeterministic polynomial time' (an equivalent, historically original definition via a hypothetical nondeterministic machine that guesses correctly). The verification-based definition given here is equivalent and much more intuitive to work with.",
    related: ["np-completeness-nphard-vs-npcomplete"],
  },
  {
    id: "np-completeness-nphard-vs-npcomplete",
    tier: 3,
    module: MODULE,
    type: "compare",
    front: "NP-hard vs. NP-complete — what's the distinction, and why does it matter?",
    back: `**NP-hard**: at least as hard as every problem in NP — formally, every problem in NP can be **reduced** to it in polynomial time (see the reductions card). An NP-hard problem does **not** need to be in NP itself — it might not even be a decision problem, or might be even harder than anything in NP (e.g. the halting problem is NP-hard but not in NP at all, since it's not even decidable).

**NP-complete**: in **both** NP **and** NP-hard — the "hardest problems within NP itself." This is the class most classic combinatorial problems (SAT, vertex cover, TSP's decision version, etc.) belong to.

Why the distinction matters: calling something "NP-hard" is a weaker, more general claim than "NP-complete" — a problem could be NP-hard yet strictly harder than anything solvable even with a magic NP-oracle. In practice, most NP-hard problems people discuss casually (TSP, knapsack's optimization form) ARE in NP-complete territory once phrased as decision problems, but the terms aren't interchangeable in general.`,
    pitfall:
      "The optimization version of an NP-complete problem (e.g. 'find the SHORTEST TSP tour') is technically NP-hard but not itself in NP as stated, because there's no simple yes/no answer to verify — NP-completeness is formally a property of DECISION problems; optimization versions are discussed as NP-hard by extension.",
    related: ["np-completeness-p-vs-np", "np-completeness-reductions"],
  },

  // ------------------------------------------------------------------ Reductions
  {
    id: "np-completeness-reductions",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does a polynomial-time reduction actually prove a new problem is NP-hard?",
    back: `To prove a new problem $Y$ is NP-hard, take a problem $X$ **already known** to be NP-hard, and construct a **polynomial-time algorithm** that transforms **any** instance of $X$ into an instance of $Y$, such that: the transformed $Y$-instance is a "yes" instance **if and only if** the original $X$-instance was a "yes" instance. This is written $X \\leq_p Y$ ("X reduces to Y").

**Why this proves $Y$ is at least as hard as $X$**: if you had a polynomial-time algorithm to solve $Y$, you could solve $X$ too — just apply the polynomial-time reduction to convert your $X$-instance into a $Y$-instance, run the (hypothetical) fast $Y$-solver, and read off the answer. Since $X$ is already known to be NP-hard (no known polynomial algorithm, believed not to have one), this chain would give a fast algorithm for $X$ too — a contradiction (assuming $P \\neq NP$), meaning $Y$ can't have an easy solution either.

The very first problem proven NP-complete this way had no earlier NP-complete problem to reduce *from* — that's the Cook-Levin theorem (see the SAT card), which proved SAT NP-complete directly from the formal definition of NP itself. Every other NP-completeness proof since then chains off SAT (or another already-proven problem) via exactly this reduction technique — a long chain of "if you could solve this, you could solve SAT, which nobody can do efficiently."`,
    pitfall:
      "Reduction DIRECTION matters and is easy to get backwards: to prove Y is hard, you reduce a KNOWN-hard problem X *into* Y (X ≤ Y), not the other way around — showing Y reduces into some other easy problem proves nothing about Y's hardness.",
    related: ["np-completeness-sat", "np-completeness-nphard-vs-npcomplete"],
  },

  // -------------------------------------------------------------- SAT
  {
    id: "np-completeness-sat",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What is SAT (Boolean satisfiability), and why is the Cook-Levin theorem foundational?",
    back: `SAT asks: given a Boolean formula (variables connected by AND, OR, NOT), does there exist an assignment of \`True\`/\`False\` to the variables that makes the **entire formula evaluate to True**? E.g. $(x_1 \\lor x_2) \\land (\\lnot x_1 \\lor x_3)$ is satisfiable (e.g. $x_1 = T, x_3 = T$ works).

**Cook-Levin theorem** (1971): SAT is NP-complete — and critically, it was the **first** problem proven NP-complete, proven directly from the definition of NP itself (any NP problem's polynomial-time verification process can be encoded as a Boolean formula whose satisfiability corresponds exactly to the original problem having a "yes" answer). This gave the field its first foothold: once SAT was established as NP-hard, **every subsequent NP-completeness proof** could reduce FROM SAT (or a problem already reduced from it) instead of re-deriving hardness from first principles — SAT is the trunk of the whole NP-completeness reduction tree.

**3-SAT** (every clause restricted to exactly 3 literals) is also NP-complete — a further reduction from general SAT — and is the more commonly used reduction *source* in textbook proofs specifically because its restricted, uniform clause structure is easier to encode into other problems' structure than arbitrary SAT formulas.`,
    pitfall:
      "2-SAT (clauses restricted to exactly 2 literals) is NOT NP-complete — it's solvable in polynomial time (via a clever reduction to strongly connected components, Tier 2). The jump from 2 to 3 literals per clause is exactly where the problem crosses from P into NP-complete territory — a classic 'small change, huge complexity jump' example.",
    related: ["np-completeness-reductions", "np-completeness-classic-problems"],
  },

  // ---------------------------------------------------------- Classic problems
  {
    id: "np-completeness-classic-problems",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What are vertex cover, clique, and graph coloring, and how do they relate to each other via reduction?",
    back: `- **Vertex cover**: given a graph and a number $k$, does there exist a set of $\\leq k$ vertices such that **every edge** has at least one endpoint in the set (the set "covers" all edges)?
- **Clique**: does there exist a set of $\\geq k$ vertices that are **all pairwise connected** (a complete subgraph)?
- **Independent set**: does there exist a set of $\\geq k$ vertices with **no edges between any of them**?

These three are tightly related by simple, near-trivial reductions on the **same graph**: a set $S$ is a vertex cover **if and only if** its complement $V \\setminus S$ is an independent set (every edge has an endpoint in $S$ $\\iff$ no edge has both endpoints outside $S$) — so vertex cover and independent set reduce to each other directly. And $S$ is a clique in graph $G$ **if and only if** $S$ is an independent set in $G$'s **complement graph** $\\bar{G}$ (edges and non-edges swapped) — so clique reduces to independent set via one graph-complement transformation.

**Graph coloring**: can a graph's vertices be colored with $\\leq k$ colors such that no two adjacent vertices share a color? NP-complete for $k \\geq 3$ (interestingly, $k=2$ coloring is exactly the bipartiteness check, Tier 1, which IS polynomial — another small-parameter-change complexity cliff, like 2-SAT vs 3-SAT).`,
    pitfall:
      "These reductions being 'simple' doesn't make the PROBLEMS easy — it means their hardness is essentially the SAME hardness, viewed through different combinatorial lenses on the same underlying graph structure.",
    related: ["np-completeness-reductions", "np-completeness-tsp-subset-sum"],
  },
  {
    id: "np-completeness-tsp-subset-sum",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What are the TSP decision problem and subset sum, and how does subset sum relate to 0/1 knapsack?",
    back: `**TSP (decision version)**: given a weighted graph and a bound $k$, does there exist a tour visiting every vertex exactly once and returning to the start with total weight $\\leq k$? (The optimization version — "find the *minimum*-weight tour" — is what's usually meant casually by "TSP," and is NP-hard by extension of this NP-complete decision version. It generalizes the **Hamiltonian cycle** problem, which asks only whether *any* full tour exists at all, ignoring weight.)

**Subset sum**: given a set of integers and a target $T$, does some subset sum to exactly $T$? NP-complete in general — but has a **pseudo-polynomial** DP solution in $O(n \\cdot T)$ (build a boolean table of "is sum $s$ achievable using the first $i$ items," exactly the same recurrence shape as 0/1 knapsack, Tier 1 Dynamic Programming module — subset sum is knapsack with weight = value and target = capacity).

"Pseudo-polynomial" is the key subtlety: $O(nT)$ **looks** polynomial in $n$ and $T$, but $T$ itself can be **exponentially large relative to its input encoding size** (representing $T$ takes only $O(\\log T)$ bits) — so this DP is only fast when $T$ is small in *magnitude*, not necessarily fast relative to the actual input size in bits. This is exactly why subset sum's NP-completeness and knapsack's efficient DP solution **don't contradict each other**: the DP's runtime isn't truly polynomial in input *size*.`,
    pitfall:
      "This is a subtle and commonly missed point: 0/1 knapsack's O(nW) DP does NOT prove P=NP for an NP-complete problem — it's pseudo-polynomial (exponential in the number of BITS needed to represent W), not genuinely polynomial, which is precisely the loophole that lets both facts be true simultaneously.",
    related: ["np-completeness-classic-problems", "dynamic-programming-knapsack-01"],
  },

  // ------------------------------------------------------- Approximation
  {
    id: "np-completeness-approximation-overview",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What does an approximation algorithm's approximation ratio mean?",
    back: `Since NP-hard optimization problems are believed to have no efficient *exact* algorithm, an **approximation algorithm** trades exactness for a **provable guarantee**: it runs in polynomial time and returns a solution provably within some **bounded factor** of optimal — not "usually close," but *guaranteed* close, for every possible input.

A **$c$-approximation** algorithm for a minimization problem guarantees its output is **at most $c \\times$ optimal**, for every input (for a maximization problem, at least $\\frac{1}{c} \\times$ optimal). Smaller $c$ (closer to 1) is a stronger, better guarantee. This is a fundamentally different kind of promise than a heuristic "works well in practice, no guarantee" approach — an approximation algorithm's bound holds provably, even in the worst case, even though finding the *exact* optimum remains intractable.

Some NP-hard problems have excellent approximation algorithms (vertex cover: 2-approximation, see that card); others are proven to have **no** good polynomial-time approximation at all, unless $P=NP$ (e.g. general TSP without the triangle inequality has no constant-factor approximation possible) — approximability itself is a rich area of complexity theory, not a given for every NP-hard problem.`,
    related: ["np-completeness-vertex-cover-approximation"],
  },
  {
    id: "np-completeness-vertex-cover-approximation",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does the 2-approximation algorithm for vertex cover work, and why is the proof so simple?",
    back: `Algorithm: repeatedly pick **any remaining uncovered edge** $(u, v)$, add **both** $u$ and $v$ to the cover set, and remove every edge touching either $u$ or $v$ (they're now covered). Repeat until no edges remain.

**Why this is a 2-approximation**: every edge picked this way has **both** endpoints added — meaning the picked edges form a **matching** (no two picked edges share a vertex, since picking $(u,v)$ removes every other edge touching $u$ or $v$ before the next pick). Any valid vertex cover must include **at least one** endpoint from every edge in this matching, and since the matching's edges share no vertices, that means any valid cover needs **at least $|\\text{matching}|$** vertices just to cover the matching edges alone. Our algorithm used exactly $2 \\times |\\text{matching}|$ vertices (two per matched edge) — so our solution is at most $2\\times$ the true optimum, without ever needing to *compute* the true optimum.

This is a strikingly simple, elegant proof: it doesn't analyze the algorithm's output directly against optimal — it constructs a **lower bound** on optimal (via the matching) and compares the algorithm's output against *that* lower bound instead, a common and powerful technique in approximation-algorithm analysis generally.`,
    code: `def vertex_cover_2approx(edges):
    cover = set()
    remaining = set(edges)
    while remaining:
        u, v = remaining.pop()
        cover.add(u); cover.add(v)
        remaining = {(a, b) for (a, b) in remaining if a not in (u, v) and b not in (u, v)}
    return cover`,
    complexity: {
      structure: "Vertex Cover (2-approximation)",
      operations: [{ op: "Approximate cover", time: "O(E)", note: "vs NP-hard for exact minimum cover" }],
    },
    pitfall:
      "This algorithm is simple and fast, but its 2x guarantee is a WORST-CASE bound, not typical performance — on many real graphs it does much better than 2x optimal, but you can't assume that without the specific graph's structure supporting it.",
    related: ["np-completeness-approximation-overview", "np-completeness-classic-problems"],
  },
];
