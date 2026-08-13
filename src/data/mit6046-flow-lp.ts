// MIT 6.046J / 18.410J (Spring 2015) — Lectures 13-15: the formal algebra of
// network flow (skew-symmetric flows, cuts, the max-flow min-cut theorem's
// full 3-way equivalence proof), why naive Ford-Fulkerson can be
// pathologically slow and how Edmonds-Karp fixes it, and linear programming
// (standard form, duality, formulating known problems as LPs, the simplex
// algorithm). Flow/matching algorithms themselves (Ford-Fulkerson,
// Edmonds-Karp, bipartite matching) are already covered at an
// implementation level in Complexity Class's advanced-graphs module, so
// those cards cross-link rather than re-deriving the algorithms; linear
// programming has no equivalent anywhere else in the app. See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6046-flowlp";

export const mit6046FlowLpCards: Card[] = [
  {
    id: "mit6046-flowlp-formal-flow-cut-algebra",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a flow network formally via skew symmetry, and prove the max-flow min-cut theorem's full three-way equivalence.",
    back: `A **net flow** on $G=(V,E)$ is a function $f: V \\times V \\to \\mathbb{R}$ satisfying: **capacity constraint** $f(u,v) \\leq c(u,v)$; **conservation** $\\sum_{v} f(u,v) = 0$ for all $u \\notin \\{s,t\\}$; and **skew symmetry** $f(u,v) = -f(v,u)$ for all $u,v$ — this last condition is a bookkeeping convenience (an edge "carrying $-3$ units backward" is definitionally the same as $3$ units forward) that makes the algebra below clean. Using the shorthand $f(X,Y) = \\sum_{x\\in X,y\\in Y}f(x,y)$, a short lemma ($f(X,X)=0$; $f(X,Y)=-f(Y,X)$; $f(X\\cup Y,Z)=f(X,Z)+f(Y,Z)$ when $X\\cap Y=\\emptyset$) gives $|f| = f(s,V) = f(V,t)$ — flow out of the source equals flow into the sink.

**Cut** $(S,T)$: a partition of $V$ with $s\\in S, t\\in T$. **Lemma**: $|f| = f(S,T)$ for *any* cut (not just the trivial $S=\\{s\\}$) — proof: $f(S,T) = f(S,V)-f(S,S) = f(S,V) = f(s,V)+f(S-s,V)$, and the algebra collapses $f(S-s,V)$ to 0 by conservation, leaving $f(s,V)=|f|$. **Corollary**: $|f| \\leq c(S,T)$ for any cut, since $f(u,v)\\leq c(u,v)$ termwise.

**Max-flow min-cut theorem**: the following are equivalent — (1) $|f|=c(S,T)$ for some cut; (2) $f$ is a maximum flow; (3) $f$ admits no augmenting path in the residual network $G_f$. **Proof**: $(1)\\Rightarrow(2)$: since $|f|\\leq c(S,T)$ always, equality with *some* cut forces $f$ to be maximal. $(2)\\Rightarrow(3)$: an augmenting path would strictly increase $|f|$, contradicting maximality. $(3)\\Rightarrow(1)$: with no augmenting path, let $S=\\{v : \\text{a path } s\\to v \\text{ exists in } G_f\\}$, $T=V-S$ — a valid cut since $t\\notin S$ (else an augmenting path would exist). For any $u\\in S, v\\in T$: $c_f(u,v)=0$ (else $v$ would be reachable, contradicting $v\\in T$), so $f(u,v)=c(u,v)$ exactly. Summing over the cut gives $f(S,T)=c(S,T)$, and combined with $|f|=f(S,T)$ (the lemma above), $|f|=c(S,T)$.`,
    pitfall:
      "Skew symmetry is a modeling convention, not an extra physical constraint on the network — it just means f(u,v) and f(v,u) are two names for the same underlying quantity, which is what makes the f(X,Y) algebra (additivity, antisymmetry) work cleanly in the proofs above.",
    related: ["advanced-graphs-max-flow-min-cut", "advanced-graphs-ford-fulkerson"],
  },
  {
    id: "mit6046-flowlp-adversarial-slow-example",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Walk through the adversarial example where naive Ford-Fulkerson takes 2 billion augmentations on a 4-vertex graph, and explain exactly what Edmonds-Karp changes to guarantee polynomial time.",
    back: `**The pathological input**: a diamond-shaped graph, $s \\to a \\to t$ and $s \\to b \\to t$ (capacities $10^9$ each), plus a middle edge $a \\to b$ (capacity 1). The true max flow is $2\\times 10^9$ (saturate both outer paths directly, never touching the middle edge). But if Ford-Fulkerson's "**while an augmenting path exists**" step happens to alternately pick the path $s\\to a\\to b\\to t$ (pushing 1 unit) and then $s\\to b\\to a\\to t$ (pushing 1 unit back through the middle edge's residual reverse direction) — **repeating** — each augmentation moves only **1 unit** of flow, requiring **2 billion iterations** on a graph with just 4 vertices. Ford-Fulkerson's correctness doesn't depend on *which* augmenting path is chosen at each step, but its **running time** depends enormously on that choice.

**Edmonds-Karp's fix**: always augment along a **breadth-first** augmenting path — the *shortest* $s\\to t$ path in the residual graph $G_f$ (treating every edge as weight 1), found via ordinary BFS in $O(E)$. This one specific tie-breaking rule (among the many valid augmenting-path choices Ford-Fulkerson permits) is what Edmonds and Karp proved bounds the total number of augmentations at $O(VE)$ — giving $O(VE) \\times O(E) = O(VE^2)$ total, the **first polynomial-time bound** on max flow (Dinic independently proved a similar polynomial bound around the same time). On the pathological diamond example, BFS-based augmenting immediately finds a path saturating one of the two $10^9$-capacity outer routes directly, never touching the trap edge at all.

**Flow integrality**: if every edge capacity is an integer, the maximum flow found by Ford-Fulkerson is itself integer-valued — proof by induction: starting from the all-zero flow (integral), each augmenting path's residual capacity $c_f(p) = \\min_{(u,v)\\in p} c_f(u,v)$ is a minimum of *integer* quantities (since $c(u,v)$ and the running flow are both integers throughout), hence itself an integer, so every augmentation preserves integrality. This fact is what licenses **reducing** other combinatorial problems (bipartite matching, baseball-elimination-style feasibility questions) to max flow: an integral max-flow solution can be read directly as a combinatorial object (a matching, an assignment) without needing to round or interpret fractional flow values.`,
    pitfall:
      "The slow behavior isn't a bug in Ford-Fulkerson's correctness — every augmenting-path choice eventually reaches the true maximum flow. The problem is purely about worst-case running time, and it's specifically the *adversarial choice of which* augmenting path to take at each step (not the algorithm's overall structure) that Edmonds-Karp's BFS rule fixes.",
    related: ["advanced-graphs-edmonds-karp", "advanced-graphs-bipartite-matching-flow"],
  },
  {
    id: "mit6046-flowlp-standard-form-and-duality",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State LP standard form, work through the political-campaign example's certificate of optimality, and explain LP duality.",
    back: `**Standard form**: variables $\\mathbf{x}=(x_1,\\ldots,x_d)^\\top$, objective $\\mathbf{c}\\cdot\\mathbf{x}$, constraints $A\\mathbf{x}\\leq\\mathbf{b}$ ($A$ an $n\\times d$ matrix), maximize the objective subject to the constraints and $\\mathbf{x}\\geq 0$.

**Worked example — political campaign**: given demographics with populations and per-dollar vote yields for various advertised issues, find the *minimum* total spending $x_1+x_2+x_3+x_4$ guaranteeing majority support in every demographic — each demographic's majority requirement becomes one linear inequality (e.g. "Urban Majority": $-2x_1+8x_2+0x_3+10x_4 \\geq 50{,}000$), plus $x_i \\geq 0$ (can't un-advertise).

**Certificate of optimality**: given a *candidate* solution, you can verify its optimality without re-running any algorithm, by finding a **nonnegative linear combination of the constraints** that, when summed, directly implies a lower bound on the objective matching the candidate's value. E.g. combining constraints (1),(2),(3) with coefficients $\\frac{25}{222}, \\frac{46}{222}, \\frac{14}{222}$ yields $x_1+x_2+\\frac{140}{222}x_3+x_4 \\geq \\frac{3{,}100{,}000}{111}$ — and since $x_3\\geq 0$ makes the true objective $x_1+x_2+x_3+x_4$ only *larger* than this combination, the candidate solution achieving exactly $\\frac{3{,}100{,}000}{111}$ is certified optimal, with no need to inspect every other feasible point.

**This is not a coincidence — it's LP duality**: every "**primal**" LP (maximize $\\mathbf{c}\\cdot\\mathbf{x}$ subject to $A\\mathbf{x}\\leq\\mathbf{b}, \\mathbf{x}\\geq 0$) has a corresponding "**dual**" LP (minimize $\\mathbf{b}\\cdot\\mathbf{y}$ subject to $A^\\top\\mathbf{y}\\geq\\mathbf{c}, \\mathbf{y}\\geq 0$) — and a feasible dual solution *always* certifies an upper bound on the primal's optimum (weak duality), with the two optima actually *coinciding* at the true optimal solution (strong duality, not proven in this lecture but stated as the reason certificates work at all). The certificate constructed above is precisely a feasible dual solution. Duality is powerful beyond bookkeeping: it's the standard route to proving deep structural theorems — **the max-flow min-cut theorem itself can be derived by writing max-flow as a primal LP and recognizing its dual as exactly the min-cut problem**.`,
    pitfall:
      "A certificate only needs to use nonnegative combinations of ≥-constraints (or nonpositive combinations of ≤-constraints) to validly bound the objective — combining constraints with the wrong-signed coefficients doesn't produce a valid bound, since inequality direction can flip under a negative multiplier.",
    related: ["mit6046-flowlp-formal-flow-cut-algebra", "mit6046-flowlp-simplex-algorithm"],
  },
  {
    id: "mit6046-flowlp-formulating-known-problems",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How do max flow and single-source shortest paths get reformulated as linear programs, and what does 'LP infeasible' correspond to in the shortest-paths case?",
    back: `**Max flow as an LP**: maximize $\\sum_{v} f(s,v)$ subject to: skew symmetry $f(u,v)=-f(v,u)$; conservation $\\sum_v f(u,v)=0$ for $u\\notin\\{s,t\\}$; capacity $f(u,v)\\leq c(u,v)$. Every constraint from the formal flow definition (related card) becomes a linear constraint verbatim — the LP framework is expressive enough to encode the *entire* flow problem directly, with no translation loss.

**Shortest paths as an LP**: maximize $\\sum_v d(v)$ subject to $d(v)-d(u)\\leq w(u,v)$ for every edge (the triangle inequality — the same difference-constraint shape from Johnson's algorithm, related card) and $d(s)=0$. The **maximization** direction is essential and easy to get backwards: since every valid distance assignment could trivially be shrunk (e.g. all zeros satisfies every triangle inequality when weights are nonnegative), only *maximizing* $\\sum_v d(v)$ subject to the upper-bound constraints pushes every $d(v)$ up to its true shortest-path value — minimizing would just collapse everything to the trivial all-equal solution.

**LP infeasibility $\\iff$ negative-weight cycle reachable from $s$**: this is exactly the same fact established via Bellman-Ford in the difference-constraints framing (related card), now recovered as a general LP phenomenon — a system of upper-bound difference constraints has no solution exactly when summing constraints around some cycle produces a self-contradiction (the telescoping-sum argument from that card *is* a proof that the corresponding LP's feasible region is empty).

The broader point these two reformulations make: **many problems already studied via purpose-built algorithms (max flow via augmenting paths, shortest paths via Bellman-Ford/Dijkstra) are special cases of linear programming** — a single, general algorithm (the simplex method or ellipsoid method, related card) could in principle solve any of them, though the purpose-built algorithms remain faster in practice for their specific problem shape. LP's real power is as a **unifying language**: once a problem is written as an LP, it inherits LP's whole surrounding theory (duality, certificates, the whole machinery of feasibility/boundedness) for free.`,
    pitfall:
      "For the shortest-paths LP, it's specifically the direction of optimization (maximize, not minimize) that makes the formulation correct — this is the opposite of the intuitive first guess ('shortest path sounds like minimization'), and getting it backwards produces a trivial, useless LP rather than an infeasible or obviously-wrong one, making the error easy to miss.",
    related: ["mit6046-flowlp-formal-flow-cut-algebra", "mit6046-augdp-difference-constraints"],
  },
  {
    id: "mit6046-flowlp-simplex-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the simplex algorithm's slack-form pivoting mechanics on a worked example, and explain the exponential-vs-practical running-time tension.",
    back: `**Algorithm landscape**: **simplex** (this card) is simple and fast in practice but exponential worst case; the **ellipsoid method** was the first proven polynomial-time LP algorithm (a genuine theoretical breakthrough) but is impractically slow in practice; **interior-point methods** are both polynomial-time *and* practical, and are what most production LP solvers actually use today. Simplex remains pedagogically central because of its clean geometric picture: it walks vertex-to-vertex along the boundary of the feasible region (a polytope), always moving in a direction that improves the objective, until no further improving move exists.

**Slack form**: rewrite $\\leq$-constraints by introducing a fresh **basic** (slack) variable per constraint, keeping the original variables **nonbasic**. E.g. minimize $3x_1+x_2+x_3$ subject to $x_1+x_2+3x_2\\leq 30$, $2x_1+2x_2+5x_3\\leq24$, $4x_1+x_2+2x_3\\leq36$ becomes: $z=3x_1+x_2+2x_3$; $x_4=30-x_1-x_2-3x_3$; $x_5=24-2x_1-2x_2-5x_3$; $x_6=36-4x_1-x_2-2x_3$. The **basic solution** sets every nonbasic variable to 0 and reads off the basic variables directly — here $(0,0,0,30,24,36)$, objective value 0 (always feasible for this particular form, though not guaranteed in general).

**Pivoting**: pick a nonbasic variable $x_e$ with a **positive** coefficient in the objective (increasing it improves $z$); increase $x_e$ as far as constraints allow (here, the tightest binding constraint limits $x_1$ to 9); swap $x_e$ into the basic set, and the constraint that became tight has its own basic variable swap out to nonbasic — then **rewrite every other equation** in terms of the new nonbasic set. First pivot ($x_1$ in, $x_6$ out) raises $z$ from 0 to 27; a *further* pivot on $x_6$ would actually *decrease* $z$ (not shown), so $x_3$ is chosen instead, raising $z$ to $\\frac{111}{4}$; a final pivot on $x_2$ reaches $z=28$ with every nonbasic coefficient in the objective now **negative** — the stopping condition, since no further pivot could possibly improve $z$, certifying optimality reached.

**Worst-case exponential, why it doesn't matter much in practice**: simplex is proven to converge within $\\binom{n+m}{n}$ iterations ($n$ variables, $n+m$ constraints) — genuinely exponential in the worst case, and pathological inputs achieving this are known. But such inputs are rare and somewhat contrived; on the overwhelming majority of real-world LP instances, simplex converges in a small polynomial number of pivots, which is exactly why it remains widely used (often alongside, not instead of, interior-point methods) despite lacking a polynomial worst-case guarantee.`,
    code: `# Slack-form pivoting sketch (not a full LP solver)
# Objective: maximize z; nonbasic vars start at 0; each pivot brings a
# nonbasic var with positive objective coefficient into the basis,
# swapping out whichever basic var hits zero first as that var grows.
def is_optimal(objective_coeffs_of_nonbasic_vars):
    return all(c <= 0 for c in objective_coeffs_of_nonbasic_vars)`,
    pitfall:
      "Not every pivot choice increases the objective — the notes explicitly flag that pivoting on x6 at the second step would decrease z, which is why x3 is chosen instead. A correct simplex implementation must pick pivots (or detect and reject bad ones) that never decrease z, not simply 'any nonbasic variable with a positive coefficient.'",
    related: ["mit6046-flowlp-standard-form-and-duality"],
  },
];
