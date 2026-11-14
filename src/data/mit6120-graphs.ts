// MIT 6.1200J (formerly 6.042J) Mathematics for Computer Science, Spring
// 2024 — Unit 4: Graphs (Lectures 11-14). Sourced from the course's own
// lecture notes, read page-by-page. Lecture 11 covers simple graphs, the
// handshake lemma, bipartite degree averages, coloring and chromatic number,
// and the greedy (d+1)-coloring proof by induction on graphs (and buildup
// error). Lecture 12 covers matchings and stable matching: rogue couples,
// the non-bipartite counterexample, Gale-Shapley and its correctness proofs,
// and applicant-optimality. Lecture 13 covers walks/trails/paths,
// connected components, Euler tours, and trees. Lecture 14 covers digraphs,
// strong connectivity and condensation graphs, DAGs, topological orders,
// and parallel scheduling via chains and antichains. The graph ALGORITHMS
// (BFS/DFS, Hierholzer, Kosaraju/Tarjan, Kahn, flow-based matching) already
// live in Complexity Class and MIT 6.006, so this module supplies the
// definitions and proofs and cross-links. See src/data/courses.ts.
import type { Card } from "./types";

const MODULE = "mit6120-graphs";

export const mit6120GraphsCards: Card[] = [
  // --- Lecture 11: Graphs and coloring ---
  {
    id: "mit6120-graphs-handshake-lemma",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define a simple graph and vertex degree, prove the handshake lemma, and use it to show no graph has degree sequence (2,2,2,2,2,1).",
    back: `**Simple graph** $G = (V, E)$: a **non-empty** set $V$ of vertices and a set $E$ of **2-element subsets** of $V$ (edges). So no self-loops (an edge $\\{a\\}$ isn't a 2-element set) and no parallel edges ($E$ is a set, not a multiset). Graphs with no edges are allowed: $(\\{a, b, c\\}, \\emptyset)$. Definitions vary between sources — always check which one a theorem assumes.

$u, v$ are **adjacent** if $\\{u, v\\} \\in E$; the edge is **incident** to its endpoints. The **degree** $\\deg(v)$ is the number of edges incident to $v$.

**Handshake lemma.** $\\displaystyle\\sum_{v \\in V} \\deg(v) = 2|E|$.

**Proof.** The left side counts, for each vertex, its incident edges. Every edge has exactly two endpoints, so each edge is counted exactly twice. $\\blacksquare$

**Consequences:**
- The degree sum is always **even**. $(2,2,2,2,2,1)$ sums to 11, which would need $5.5$ edges — impossible. (Equivalently: every graph has an even number of odd-degree vertices.)
- **Maximum edges**: each degree is at most $n - 1$, so $2|E| \\leq n(n-1)$, i.e. $|E| \\leq \\binom{n}{2} = \\frac{n(n-1)}{2}$, achieved exactly by the complete graph $K_n$.`,
    related: ["mit6120-graphs-bipartite-average-degree", "mit6120-graphs-trees-n-minus-1-edges"],
  },
  {
    id: "mit6120-graphs-bipartite-average-degree",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In a bipartite graph with sides L and R, how do the average degrees of the two sides relate — and why does that debunk surveys claiming men have far more female partners than women have male partners?",
    back: `**Bipartite**: $V$ can be partitioned into disjoint sets $L$ and $R$ such that every edge has one endpoint in each. (The sides need not have equal size.)

**Bipartite handshake**: each edge has exactly one endpoint in $L$ and one in $R$, so
$$\\sum_{u \\in L} \\deg(u) = |E| = \\sum_{v \\in R} \\deg(v).$$
With average degrees $A_L = |E|/|L|$ and $A_R = |E|/|R|$:
$$\\frac{A_L}{A_R} = \\frac{|R|}{|L|}.$$
The ratio depends **only on the sizes of the sides** — not on the number of edges or how they're distributed.

**Example**: Harvard–MIT friendships. With about 7200 Harvard and 4600 MIT undergrads, the average MIT student has about $7200/4600 \\approx 1.6$ times as many Harvard friends as the average Harvard student has MIT friends — no survey needed.

**Debunking**: surveys (1994 UChicago, 2004 ABC News, 2007 NCHS) reported that men have 1.74–3.33 times as many opposite-gender partners as women. But opposite-gender partnerships form a bipartite graph between men $M$ and women $W$, so $A_M / A_W = |W| / |M| \\approx 157\\text{M} / 152\\text{M} \\approx 1.03$ (2010 US census). The reported ratios can't be right — the data must be biased (e.g. misreporting), since the true ratio is fixed by population counts.`,
    pitfall:
      "This is about AVERAGES. A ratio near 1.03 says nothing about how partners are distributed — a few people with many partners can coexist with most having few.",
    related: ["mit6120-graphs-handshake-lemma", "graph-traversal-bipartiteness"],
  },
  {
    id: "mit6120-graphs-coloring-chromatic-number",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a proper k-coloring and the chromatic number χ(G). What must you prove to establish χ(G) = 3?",
    back: `**Coloring problem**: given $G$ and $k$ colors, assign each vertex a color so that no two **adjacent** vertices share one. Edges model **conflicts** (two exams with shared students can't be at the same time).

**Proper $k$-coloring**: a function $f: V \\to C$ with $|C| \\leq k$ such that $f(u) \\neq f(v)$ for every edge $\\{u, v\\}$.

**Chromatic number** $\\chi(G)$: the **minimum** $k$ for which $G$ has a proper $k$-coloring.

**Proving $\\chi(G) = 3$ takes two proofs:**
- **Upper bound** $\\chi(G) \\leq 3$: exhibit a proper 3-coloring.
- **Lower bound** $\\chi(G) > 2$: prove **no** 2-coloring exists — e.g. three mutually adjacent vertices (a triangle) need three different colors.

(Exam example: five classes with conflicts; a 3-coloring gives 3 exam slots, and three pairwise-conflicting classes show 2 slots are impossible.)

**Applications**: exam/meeting scheduling, register allocation (variables live at the same time conflict), radio frequency assignment, map coloring.

**Complexity**: deciding whether $\\chi(G) \\leq 3$ (**3-coloring**) is **NP-complete** — a proposed coloring is easy to check, but no efficient algorithm is known to find one. So in practice we use fast heuristics with provable (if loose) guarantees.`,
    pitfall:
      "Finding a 4-coloring proves only χ(G) ≤ 4, not χ(G) = 4. An exact value always needs a matching impossibility argument.",
    related: ["mit6120-graphs-greedy-coloring", "np-completeness-classic-problems", "mit6035-alloc-graph-coloring-algorithm"],
  },
  {
    id: "mit6120-graphs-greedy-coloring",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that the greedy coloring algorithm uses at most d+1 colors on any graph with maximum degree d, for every vertex order.",
    back: `**Greedy ("basic") algorithm**: order the vertices $v_1, \\ldots, v_n$ and the colors $c_1, c_2, \\ldots$; give each vertex in turn the smallest color not used by its already-colored neighbors. Don't look back.

**Theorem.** If every vertex has degree $\\leq d$, greedy uses at most $d + 1$ colors, for every vertex order.

**Choosing the induction variable**: inducting on $d$ is a mess. Induct on the **number of vertices** instead, with the claim quantified over all $d$, graphs, and orders:

$P(n)$: for all $d$ and all $n$-vertex graphs $G$ with max degree $\\leq d$, and every vertex order, greedy uses at most $d + 1$ colors.

**Proof.** *Base* $n = 1$: no edges, one color. ✓
*Step*: assume $P(n)$. Let $G$ be **any** graph with $n + 1$ vertices $v_1, \\ldots, v_{n+1}$ and max degree $\\leq d$. Greedy colors $v_1, \\ldots, v_n$ without looking at $v_{n+1}$, so it colors them exactly as it would the subgraph on those $n$ vertices — whose max degree is still $\\leq d$. By $P(n)$ that uses at most $d + 1$ colors. Now $v_{n+1}$ has at most $d$ neighbors, using at most $d$ colors, so one of the first $d + 1$ colors is free. ✓ $\\blacksquare$

**How tight?**
- $K_n$ has max degree $n - 1$ and $\\chi(K_n) = n$: the bound $d + 1$ is exactly right.
- The star $K_{1,k}$ has max degree $k$ but greedy always uses 2 colors: the bound can be very loose.
- **Crown graphs** are 2-colorable, yet a bad vertex order makes greedy use $n$ colors on $2n$ vertices — the order matters enormously.`,
    pitfall:
      "Note the step starts from an ARBITRARY (n+1)-vertex graph and removes a vertex. Starting from an n-vertex graph and adding a vertex ('buildup') is a different — and usually invalid — argument.",
    related: ["mit6120-graphs-coloring-chromatic-number", "mit6120-graphs-induction-buildup-error"],
  },
  {
    id: "mit6120-graphs-induction-buildup-error",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is 'buildup error' in induction proofs about graphs, and how do you avoid it?",
    back: `When the claim is $P(n)$ = "**for all** graphs with $n$ vertices (or edges), …", the inductive step must prove something about **all** graphs with $n + 1$ vertices.

**Buildup error**: starting with an $n$-vertex graph that satisfies the hypothesis and "building up" by adding a vertex, then concluding the claim for $n + 1$. That only covers $(n+1)$-vertex graphs that **can be built that way while preserving the property** — which may not be all of them.

**The correct shape** (use proof outlining):
1. "Suppose $G$ is **any** graph with $n + 1$ vertices [satisfying the hypotheses]."
2. **Shrink** it: remove a carefully chosen vertex/edge (e.g. a leaf of a tree) to get an $n$-vertex graph.
3. Check the smaller graph satisfies the hypotheses of $P(n)$ (e.g. it's still a tree / still has max degree $\\leq d$).
4. Apply $P(n)$ to it, then put the removed piece back and finish the argument.

Graph induction isn't a different principle — it's ordinary induction. It only *feels* backwards because the "for all graphs" inside $P(n+1)$ forces you to start from the big graph.`,
    pitfall:
      "A good test: could some (n+1)-vertex graph satisfying the hypothesis fail to be reachable by your 'add one vertex' construction? If you can't rule that out, restructure as remove-then-restore.",
    related: ["mit6120-graphs-greedy-coloring", "mit6120-graphs-trees-n-minus-1-edges", "mit6120-proofs-proof-outlining"],
  },

  // --- Lecture 12: Matching ---
  {
    id: "mit6120-graphs-matching-definitions",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Distinguish a maximal matching, a maximum matching, a perfect matching, and a minimum-weight perfect matching.",
    back: `A **matching** $M$ in $G$ is a subgraph in which every vertex has degree 1 — i.e. a set of edges no two of which share an endpoint (we usually identify $M$ with its edge set).

| Kind | Meaning |
|---|---|
| **Maximal** | can't be extended: no matching strictly contains it ($M \\not\\subset M'$) |
| **Maximum** | as large as possible: $\\lvert M' \\rvert \\leq \\lvert M \\rvert$ for every matching $M'$ |
| **Perfect** | covers every vertex: $\\lvert M \\rvert = \\lvert V \\rvert / 2$ |
| **Min-weight perfect** | in a weighted graph ($w: E \\to \\mathbb{R}$), a perfect matching minimizing $w(M) = \\sum_{e \\in M} w(e)$ (non-edges count as weight $\\infty$) |

Every maximum matching is maximal, **not** conversely: a matching can be stuck (no edge can be added) yet smaller than the best one. Proving a matching is maximum needs an argument about **all** matchings — e.g. two degree-1 vertices hanging off the same vertex can't both be matched, so some vertex must stay unmatched.

In a bipartite graph (planes/gates, applicants/positions), a perfect matching forces both sides to have equal size.

Both maximum matching and min-weight perfect matching have fast (polynomial-time) algorithms — for bipartite graphs, via max-flow.`,
    pitfall:
      "A greedy 'add any compatible pair' algorithm produces a MAXIMAL matching, which can be as small as half a maximum one. Don't report it as optimal.",
    related: ["mit6120-graphs-stable-matching-definitions", "advanced-graphs-bipartite-matching-flow"],
  },
  {
    id: "mit6120-graphs-stable-matching-definitions",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define a rogue couple and a stable matching, and prove that in a non-bipartite setting a stable matching need not exist.",
    back: `**Stable matching problem**: $N$ applicants and $N$ evaluators; each ranks **all** of the other side, with no ties; preferences need not be symmetric.

**Rogue couple** in a matching $M$: a pair $(x, y)$ not matched to each other, who **both** prefer each other over their assigned partners. They'd abandon their matches.

**Stable**: no rogue couples. Goal: a perfect stable matching.

**Non-bipartite counterexample** (anyone may pair with anyone): four people $A, B, C, D$. $A$ likes $B$ best, $B$ likes $C$ best, $C$ likes $A$ best, and **everyone** ranks $D$ last.

**Theorem.** No stable matching exists.

**Proof.** Suppose $M$ is a stable matching. Someone is matched with $D$; by symmetry of the cycle $A \\to B \\to C \\to A$, say it's $C$ (the other cases are rotations). The person who ranks $C$ first is $B$; $B$ is matched with $A$ (the only one left). Then $B$ prefers $C$ over $A$, and $C$ prefers $B$ over $D$ (everyone ranks $D$ last). So $(B, C)$ is a rogue couple — contradiction. $\\blacksquare$

So there's no a priori reason stable matchings should exist. The surprise is that in the **bipartite** case they always do — Gale–Shapley constructs one.`,
    related: ["mit6120-graphs-gale-shapley-algorithm", "mit6120-graphs-matching-definitions"],
  },
  {
    id: "mit6120-graphs-gale-shapley-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the Gale–Shapley (propose-and-reject / deferred acceptance) algorithm for bipartite stable matching.",
    back: `**Gale–Shapley** (1962); extended and applied by Alvin Roth — Nobel Prize in Economics 2012 (with Shapley). Used for medical residents and hospitals, NYC school assignment, and request-to-server assignment (Akamai).

Run in **days**. Each applicant keeps their preference list, crossing out evaluators who reject them. Each day:
1. Every applicant **applies** to their favorite evaluator **not yet crossed off**.
2. Every evaluator with more than one applicant **keeps their favorite** and **rejects** the rest.
3. Each rejected applicant **crosses** that evaluator off their list.
4. If no one was rejected (every evaluator has at most one applicant), **stop** and match each evaluator with their current applicant.

The evaluators' choices are "deferred": holding an applicant today is not a commitment, since someone better may apply tomorrow.`,
    code: `def gale_shapley(app_prefs, eval_rank):
    # app_prefs[a]: evaluators in a's order of preference
    # eval_rank[e][a]: position of a in e's list (lower = better)
    next_choice = {a: 0 for a in app_prefs}
    holding = {}            # evaluator -> applicant currently held
    free = list(app_prefs)  # applicants not currently held
    while free:
        a = free.pop()
        e = app_prefs[a][next_choice[a]]
        next_choice[a] += 1                  # cross e off a's list
        current = holding.get(e)
        if current is None:
            holding[e] = a
        elif eval_rank[e][a] < eval_rank[e][current]:
            holding[e] = a                    # e trades up
            free.append(current)              # previous applicant rejected
        else:
            free.append(a)                    # a rejected
    return {a: e for e, a in holding.items()}`,
    pitfall:
      "The code processes one proposal at a time instead of in daily rounds; both versions produce the same matching (the applicant-optimal one), but the 'days' version is what the correctness proofs are phrased around.",
    related: ["mit6120-graphs-gale-shapley-proofs", "mit6120-graphs-stable-matching-definitions"],
  },
  {
    id: "mit6120-graphs-gale-shapley-proofs",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that Gale–Shapley terminates within N² + 1 days, matches everyone, and produces a stable matching.",
    back: `Model it as a **state machine**: state = the set of rejections so far; one transition per day.

**Termination.** Let $f$ = total number of evaluators remaining on applicants' lists. It starts at $N^2$, is a natural number, and **strictly decreases** every non-final day (someone gets rejected). So there are at most $N^2$ transitions — it terminates by day $N^2 + 1$. (Tighter: by day $(N-1)^2 + 1$.)

**Lemma A.** An evaluator's **best current applicant never gets worse**: if $e$ holds $a$ today, $a$ comes back tomorrow (or is matched today), so $e$'s favorite tomorrow is at least as good.

**Lemma B.** An applicant's **evaluator never gets better**: each day $a$ applies to the best evaluator not yet crossed off; a rejection moves $a$ down the list.

**Everyone is matched.** Suppose applicant $a$ ends unmatched. Then $a$ crossed off every evaluator, so **every** evaluator rejected $a$ — and by Lemma A each of them holds someone at the end. That's $N$ matched evaluators, hence $N$ matched applicants, including $a$. Contradiction.

**Stability.** Suppose $(a, e)$ is a rogue couple. Case on whether $e$ rejected $a$:
- **Yes**: $e$ rejected $a$ for someone better, and by Lemma A $e$'s final match is at least that good — $e$ prefers their match to $a$. Not rogue.
- **No**: $e$ is still on $a$'s list, and $a$'s final evaluator is $a$'s favorite among those remaining — so $a$ prefers their match to $e$. Not rogue.

Either way, contradiction: the matching is stable. $\\blacksquare$`,
    related: ["mit6120-graphs-gale-shapley-algorithm", "mit6120-graphs-applicant-optimal", "mit6120-proofs-termination-derived-variables"],
  },
  {
    id: "mit6120-graphs-applicant-optimal",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Who does Gale–Shapley favor: applicants or evaluators? Define feasible, optimal and pessimal matches.",
    back: `There can be many stable matchings. For a party $x$:
- $y$ is a **feasible match** for $x$ if **some** stable matching pairs $x$ with $y$. (Everyone has at least one — the Gale–Shapley partner.)
- $x$'s **optimal match** is $x$'s favorite feasible match; the **pessimal match** is $x$'s least favorite feasible match.

**Theorems** (proved in the course's recitation):
- Gale–Shapley gives **every applicant** their **optimal** match.
- Gale–Shapley gives **every evaluator** their **pessimal** match.

So although evaluators' lot only improves day by day and applicants' only worsens, the side that **proposes holds all the power**. The output doesn't depend on the order of proposals, and no applicant can do better in any stable matching.

**Practical consequence**: who proposes is a design decision. The US residency match (NRMP) was redesigned in the 1990s (Roth) so that the **applicants** (residents) propose, rather than the hospitals.`,
    pitfall:
      "'Applicant-optimal' is about stable matchings only — an applicant could do better in some unstable matching, but such a matching would fall apart via a rogue couple.",
    related: ["mit6120-graphs-gale-shapley-proofs", "mit6120-graphs-gale-shapley-algorithm"],
  },

  // --- Lecture 13: Connectivity and trees ---
  {
    id: "mit6120-graphs-walks-paths-components",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Distinguish walks, trails and paths; prove that a walk from a to b implies a path from a to b; and say what connected components are.",
    back: `- **Walk** $(v_0, \\ldots, v_k)$: consecutive vertices are adjacent; anything goes (revisits allowed). Its **length** is $k$ — the number of edges ($k + 1$ vertices). The one-vertex walk $(v)$ has length 0.
- **Trail**: a walk that repeats no **edge**.
- **Path**: a trail that repeats no **vertex**.

$a$ and $b$ are **connected** iff some walk goes from $a$ to $b$ (every vertex is connected to itself via the length-0 walk). $G$ is connected iff every pair is connected. ("Connected" is more general than "adjacent".)

**Theorem.** If there is a walk from $a$ to $b$, there is a path from $a$ to $b$.

**Proof** (take the shortest). Let $(a = v_0, \\ldots, v_k = b)$ be a **shortest** walk from $a$ to $b$. If some vertex repeated, $v_i = v_j$ with $i < j$, then $(v_0, \\ldots, v_i, v_{j+1}, \\ldots, v_k)$ would be a walk from $a$ to $b$ of length $k - (j - i) < k$ — contradicting minimality. So the shortest walk repeats no vertex: it is a path. $\\blacksquare$

**Connected components**: the component of $v$ is the subgraph induced by all vertices connected to $v$. Each component is connected, and the components **partition** the graph — every vertex and every edge lies in exactly one (if two components share a vertex, they're identical). Many problems can be solved one component at a time, as if the graph were connected.`,
    related: ["mit6120-graphs-euler-tours", "mit6120-graphs-trees-n-minus-1-edges", "graph-traversal-connected-components"],
  },
  {
    id: "mit6120-graphs-euler-tours",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that a connected graph has an Euler tour iff every vertex has even degree.",
    back: `**Euler tour**: a closed walk using **every edge exactly once** (and visiting every vertex). This is the Königsberg bridges problem (Euler, 1736) — the birth of graph theory. Königsberg's bridge graph has **all** vertices of odd degree, so no tour exists.

**Theorem.** A connected graph has an Euler tour iff every vertex has even degree.

**(⇒)** Follow the tour from any vertex $v$: every departure from $v$ is matched by a later arrival, each along a distinct edge, so $\\deg(v)$ is even.

**(⇐)** Let $W$ be a **longest** walk in $G$ that repeats no edge.
1. **$W$ is closed.** If its endpoints were $a \\neq b$: each pass through a vertex uses two of its edges, so every vertex has an even number of edges unused by $W$ — except $a$ and $b$, which have an **odd** number. Then $b$ has an unused edge, and $W$ could be extended. Contradiction.
2. **$W$ uses every edge.** If $\\{u, v\\}$ were unused, take a vertex $w$ on $W$; since $G$ is connected, there's a walk from $w$ to $u$ then $v$. Let $\\{s, t\\}$ be its first edge not in $W$ — so $s$ is on $W$. Since $W$ is closed, start at $s$, go once around $W$ back to $s$, then take $\\{s, t\\}$: a longer walk with no repeated edge. Contradiction.

So $W$ is an Euler tour. $\\blacksquare$

**Corollary**: a connected graph has an open Euler **trail** iff **exactly two** vertices have odd degree (it must start at one and end at the other). For digraphs: an Euler tour exists iff the graph is strongly connected and in-degree = out-degree everywhere.`,
    pitfall:
      "Terminology is inconsistent: an 'Euler cycle' need not be a cycle (it may revisit vertices) and an 'Euler path' need not be a path. Rely on the definition, not the name.",
    related: ["mit6120-graphs-walks-paths-components", "advanced-graphs-eulerian-path-circuit", "advanced-graphs-hierholzer"],
  },
  {
    id: "mit6120-graphs-trees-n-minus-1-edges",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that every tree with n ≥ 2 vertices has at least 2 leaves, and that every tree with n vertices has exactly n − 1 edges. List equivalent characterizations of trees.",
    back: `**Tree**: a connected, acyclic graph. (A **cycle** is a closed walk of length $\\geq 3$ with no repeated edges or vertices, apart from start = end.) Acyclic graphs in general are **forests** — each component is a tree.

**Lemma (leaves exist).** Every tree with $n \\geq 2$ vertices has at least 2 vertices of degree 1.
*Proof.* Take a **longest path** $v_0, \\ldots, v_k$; since the tree is connected with $n \\geq 2$, it has an edge, so $v_0 \\neq v_k$. If $v_0$ had a neighbor besides $v_1$: if it's some $v_i$ on the path, that closes a **cycle**; otherwise we could **extend** the path. Both impossible, so $\\deg(v_0) = 1$; likewise $v_k$. $\\blacksquare$

**Theorem.** A tree with $n$ vertices has exactly $n - 1$ edges.
*Proof by induction* ($n \\geq 2$; $n = 1$ is trivial). *Base* $n = 2$: the only connected 2-vertex graph has 1 edge. *Step*: assume $P(n)$; let $T$ be **any** tree with $n + 1$ vertices. **Prune a leaf** $v$ (with its one edge) to get $T'$.
- $T'$ is acyclic (removing edges can't create cycles) and connected (a path between two other vertices can't pass through $v$, which has degree 1). So $T'$ is a tree with $n$ vertices and, by $P(n)$, $n - 1$ edges.
- Put the leaf back: $T$ has $n$ edges. ✓ $\\blacksquare$

It must be a **leaf** — removing an arbitrary vertex can disconnect the tree.

**Equivalent characterizations** ($n$ vertices) — each is equivalent to being a tree:
- connected and acyclic (definition)
- connected with exactly $n - 1$ edges
- acyclic with exactly $n - 1$ edges
- every pair of vertices joined by a **unique** path
- minimally connected (removing any edge disconnects it)
- maximally acyclic (adding any edge creates a cycle)`,
    related: ["mit6120-graphs-induction-buildup-error", "mit6120-graphs-walks-paths-components", "shortest-paths-mst-mst-overview", "mit1806-subspaces-euler-formula"],
  },

  // --- Lecture 14: Digraphs and DAGs ---
  {
    id: "mit6120-graphs-digraphs-scc-condensation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do directed graphs differ from undirected ones (degree, cycles, connectivity)? Define strongly connected components and the condensation graph.",
    back: `**Digraph** $G = (V, E)$ with $E \\subseteq V \\times V$: edges are **ordered** pairs $(u, v)$, drawn $u \\to v$. Consequences: **self-loops** $(v, v)$ and **antiparallel** edges $(u, v), (v, u)$ are allowed (parallel edges still aren't). Examples: state machines (states → transitions), the follower graph, the web's link graph (PageRank).

- **Degree** splits into **in-degree** $\\deg^-(v)$ and **out-degree** $\\deg^+(v)$; handshake: $\\sum_v \\deg^-(v) = |E| = \\sum_v \\deg^+(v)$.
- **Walks** must follow edge directions. A walk from $u$ to $v$ still implies a path (same shortest-walk proof).
- **Cycles** can be short: a self-loop is a cycle of length 1, an antiparallel pair one of length 2.
- **Connectivity isn't symmetric**: $v$ is **reachable** from $u$ if there's a $u \\to v$ walk. $u, v$ are **strongly connected** if each can reach the other; $G$ is strongly connected if every pair is.

**Strongly connected component** $[v]$: the subgraph induced by all vertices strongly connected to $v$. SCCs **partition the vertices** — but unlike undirected components, some **edges run between** SCCs.

**Condensation graph**: collapse each SCC to a single vertex, keep an edge $[u] \\to [v]$ whenever some edge $u \\to v$ joins different SCCs, and drop self-loops. **Every condensation graph is a DAG** — a cycle among SCCs would merge them into one SCC.`,
    related: ["mit6120-graphs-topological-order", "advanced-graphs-scc-overview", "mit6120-proofs-state-machine-definitions"],
  },
  {
    id: "mit6120-graphs-topological-order",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that every finite DAG has a minimal element and a topological order.",
    back: `**DAG**: a digraph with no cycles — the directed analog of a forest. It models **precedence** (put on pants before belt): $u$ must come before $v$ whenever $v$ is reachable from $u$. Edges implied by longer paths are **redundant**; keeping only **covering edges** (each the only path between its endpoints) gives the **Hasse diagram**, encoding the same precedence with fewer edges. A precedence graph must be acyclic — a cycle is a chicken-and-egg deadlock.

**Source / minimal element**: in-degree 0. **Sink / maximal element**: out-degree 0.

**Topological order**: a list of all vertices in which each vertex appears before every vertex reachable from it.

**Lemma.** Every finite DAG has a minimal element.
*Proof.* Take a longest path. Its first vertex has no incoming edge: an edge from a vertex on the path would form a cycle, and an edge from a vertex off the path would extend it. (Same shape as the leaf lemma for trees.) $\\blacksquare$

**Theorem.** Every finite DAG has a topological order.
*Proof by induction* on $n$: $P(n)$ = every $n$-vertex DAG has a topological order. *Base* $n = 0$: the empty list. *Step*: let $G$ be any DAG with $n$ vertices; pick a minimal $v$ (lemma). The induced subgraph $H$ on $V \\setminus \\{v\\}$ is a DAG with $n - 1$ vertices, so it has a topological order; **prepend** $v$. Nothing reaches $v$, so this is a topological order of $G$. $\\blacksquare$

The proof is the algorithm: **repeatedly remove a minimal element** (Kahn's algorithm). Any minimal element may be chosen, so topological orders are usually not unique.`,
    related: ["mit6120-graphs-parallel-scheduling-chains", "graph-traversal-topo-kahn", "graph-traversal-topo-sort-overview"],
  },
  {
    id: "mit6120-graphs-parallel-scheduling-chains",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "With unlimited workers, what is the minimum number of stages to complete all tasks of a DAG? Define chains, antichains and critical paths, and prove the answer.",
    back: `$u, v$ are **comparable** if one can reach the other.
- **Chain**: a set of pairwise comparable vertices (they lie along a single path). No two can run in the same stage — one is a prerequisite of the other.
- **Antichain**: a set of pairwise **incomparable** vertices. A set of tasks can run together iff it's an antichain.
- **Critical path**: a maximum-size chain (a set of vertices, not literally a path).

**Lower bound**: every schedule needs at least $c$ stages, where $c$ is the size of the largest chain — even with unlimited workers.

**Theorem.** $c$ stages suffice.

**Proof.** Let $\\text{depth}(v)$ = the length of the longest path **ending** at $v$ (so minimal elements have depth 0).
- If $u$ reaches $v \\neq u$, then $\\text{depth}(u) < \\text{depth}(v)$: append the $u \\to v$ path to a longest path ending at $u$ to get a longer path ending at $v$. So every prerequisite of $v$ has **strictly smaller depth**.
- Depths range over $0, 1, \\ldots, c - 1$ (a longest path has $c$ vertices).

Schedule stage $i$ = all vertices of depth $i$. When stage $i$ runs, every prerequisite (smaller depth) has finished, and each stage is an antichain (equal-depth vertices are incomparable). That's exactly $c$ stages. $\\blacksquare$

So the vertices can be **partitioned into $c$ antichains, and no fewer**.

**Workers**: the largest antichain bounds how many workers can ever be busy at once. The greedy "as soon as possible" schedule minimizes stages but not necessarily workers — in the lecture's getting-dressed example, a 4-stage schedule exists with only 3 helpers.`,
    pitfall:
      "Minimizing the number of stages and minimizing the number of workers are different problems. Fixing the number of workers and minimizing stages is NP-hard in general.",
    related: ["mit6120-graphs-topological-order", "mit6035-sched-list-scheduling-algorithm"],
  },
];
