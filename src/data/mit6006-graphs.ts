// MIT 6.006 (Spring 2020) — Lectures 9-14: BFS, DFS, Weighted Shortest
// Paths, Bellman-Ford, Dijkstra, Johnson's Algorithm. The unifying idea
// 6.006 builds toward across all six lectures: every SSSP algorithm here is
// "maintain a safe distance estimate d(s,v) >= true distance, and relax
// edges (lower the estimate) until it's tight" — BFS, DAG Relaxation,
// Bellman-Ford, and Dijkstra differ only in what order they relax edges in
// and what that order costs to compute. Johnson's algorithm then reduces
// general APSP to that same machinery via a potential-function reweighting
// trick. BFS/DFS mechanics, standard Dijkstra/Bellman-Ford, and
// Kahn's/DFS-based topological sort already have deep cards in
// graph-traversal/shortest-paths-mst and are cross-linked, not re-taught.
import type { Card } from "./types";

const MODULE = "mit6006-graphs";

export const mit6006GraphsCards: Card[] = [
  {
    id: "mit6006-graphs-representation-cost-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006 justify that a graph can always be stored and traversed in Θ(|V| + |E|), and why is that the definition of 'linear time' for graph algorithms?",
    back: `Store a graph as: a Set \`Adj\` mapping each vertex $u$ to its adjacency list (typically a direct-access array or hash table, for $O(1)$ vertex lookup), where each \`Adj(u)\` is itself a Sequence (array or linked list) of $u$'s outgoing neighbors. \`Adj\` has size $\\Theta(|V|)$; each \`Adj(u)\` has size $\\Theta(\\deg(u))$.

By the **handshaking lemma**, $\\sum_{u \\in V} \\deg(u) \\leq 2|E|$ (every edge contributes to exactly two out-degree counts in an undirected graph, or exactly one in a directed graph counted twice across the whole sum) — so the total size of all adjacency lists combined is $O(|E|)$, and the whole representation costs $\\Theta(|V| + |E|)$ space. This is why **"linear time" for a graph algorithm means $\\Theta(|V| + |E|)$**, not $\\Theta(|V|)$ or $\\Theta(|E|)$ alone: that's the actual size of the input once you account for both the vertex set and every adjacency list. Any algorithm that visits each vertex $O(1)$ times and does $O(1)$ work per edge in each vertex's adjacency list is automatically $O(|V| + |E|)$ by this same handshaking argument — the pattern behind BFS, DFS, and DAG Relaxation's linear-time bounds.`,
    pitfall:
      "|E| = O(|V|²) always holds for simple graphs, so O(|V| + |E|) can be as bad as O(|V|²) on dense graphs — 'linear in graph size' is not the same claim as 'linear in the number of vertices,' and conflating them mispredicts performance on dense inputs.",
  },
  {
    id: "mit6006-graphs-problem-hierarchy",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is 6.006's hierarchy of graph path problems, and why does solving the hardest one solve all the others for free?",
    back: `Four problems, each strictly reducible to the next: **Single-Pair Reachability** (is there *any* path $s \\to t$?) $\\leq$ **Single-Pair Shortest Path** (the *distance* $\\delta(s,t)$ and a shortest path) $\\leq$ **Single-Source Shortest Paths / SSSP** (distance *and* a shortest path to **every** vertex from $s$). A black-box solving any problem in this chain trivially solves every problem before it — so 6.006 doesn't bother with separate algorithms for the easier ones; it develops one $O(|V|+|E|)$ algorithm (BFS) for the hardest (SSSP) and gets reachability and pair-shortest-path for free.

The subtlety that makes SSSP tractable in $O(|V| + |E|)$ despite returning up to $|V|$ full paths: naively storing every shortest path explicitly could cost $\\Omega(|V|^2)$ total (paths can have $\\Omega(|V|)$ length each). Instead, store only a **parent pointer** $P(v)$ — the second-to-last vertex on *a* shortest path from $s$ to $v$ (with $P(s) = \\text{None}$) — giving an $O(|V|)$-size **shortest-paths tree** that implicitly encodes every shortest path (walk parent pointers backward from any $v$ to recover it explicitly in time proportional to that path's own length).`,
    related: ["graph-traversal-bfs"],
  },
  {
    id: "mit6006-graphs-full-search-pattern",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the 'Full-BFS'/'Full-DFS' pattern, and how does it turn any single-source-reachability algorithm into a connected-components algorithm?",
    back: `To explore an **entire** graph rather than just what's reachable from one vertex: repeatedly pick an arbitrary unvisited vertex $s$ and run a single-source search (BFS or DFS) from it, until every vertex has been visited. This is **Full-BFS** or **Full-DFS** depending on which search backs it — since each vertex is visited exactly once across all the runs combined, the total cost is still $O(|V| + |E|)$, the same as a single search, just partitioned across multiple starting points.

This single pattern gives **Connected Components** for free from any single-source-reachability algorithm $A$: run Full-$A$, and each individual run's visited-vertex set *is* one connected component (undirected graphs only — directed reachability is asymmetric, so "connectivity" needs a more careful definition 6.006 doesn't cover). The same pattern also underlies **topological sort**: on a DAG, the *reverse* of Full-DFS's finishing order (the order in which \`visit(u)\` completes, not starts) is provably a valid topological order — and checking whether that reverse-finish order actually respects every edge is exactly how Full-DFS detects that a graph is **not** a DAG (i.e. contains a cycle). See the related cards for Kahn's-algorithm and DFS-finish-order topological sort mechanics in full.`,
    pitfall:
      "The finishing order itself is a topological order for a DAG — it's specifically the *reverse* of finishing order that is. Reading off vertices in the order DFS finishes them (not reverses it) gives the opposite of a valid topological order.",
    related: ["graph-traversal-connected-components", "graph-traversal-topo-dfs"],
  },
  {
    id: "mit6006-graphs-weighted-shortest-path-definitions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does 6.006 define shortest-path weight as an infimum rather than a minimum, and what does that have to do with negative cycles?",
    back: `A **weighted graph** attaches $w: E \\to \\mathbb{Z}$ to edges; a path's weight is the sum of its edge weights. The shortest-path *weight* is $\\delta(s,t) = \\inf\\{w(\\pi) \\mid \\pi \\text{ a path } s \\to t\\}$ — an **infimum**, not a minimum, because that set of path weights might have no actual smallest element: if a **negative-weight cycle** (a cycle whose total weight is $< 0$) is reachable from $s$ and can reach $t$, you can loop around it arbitrarily many times to make the path weight arbitrarily negative, with no finite path achieving the infimum. In that case $\\delta(s,t) = -\\infty$ by convention, and there is no "shortest path" to return — at best, the negative cycle itself.

This single definitional choice is why the next four lectures each carry an explicit restriction (DAG, non-negative weights, or "general, but detect/report negative cycles") — every one of them is really answering "how do you compute $\\delta$ correctly given that it might be $-\\infty$, and how do you know when it is?"`,
    pitfall:
      "δ(s,t) = ∞ (no path exists at all) and δ(s,t) = -∞ (a path exists but is unboundedly improvable via a negative cycle) are both valid outputs and easy to conflate — an algorithm that only checks 'is there a path' without separately handling the negative-cycle case will silently return a finite wrong answer instead of -∞.",
    related: ["mit6006-graphs-relaxation", "mit6006-graphs-bellman-ford-negative-cycle-witness"],
  },
  {
    id: "mit6006-graphs-relaxation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is 'relaxation', and why is 6.006's claim that 'relaxation is safe' the load-bearing idea behind every SSSP algorithm in this course?",
    back: `Maintain a **distance estimate** $d(s,v)$ for every vertex, initialized to $\\infty$ (and $d(s,s)=0$), that is always an *upper bound* on the true distance: $d(s,v) \\geq \\delta(s,v)$ throughout. The **triangle inequality** says $\\delta(s,v) \\leq \\delta(s,u) + w(u,v)$ for every edge $(u,v)$ — so if your current estimate violates it, i.e. $d(s,v) > d(s,u) + w(u,v)$, that's provably too high and can be safely lowered. **Relaxing** edge $(u,v)$ means exactly that: set $d(s,v) \\leftarrow d(s,u) + w(u,v)$ whenever doing so decreases it.

**Relaxation is safe**: it never makes $d(s,v)$ an underestimate. Proof by induction — if every $d(s,v')$ currently equals the weight of *some* actual path from $s$ (or $\\infty$), then relaxing $(u,v)$ sets $d(s,v)$ to the weight of a genuine path (through $u$), preserving the invariant. Since $\\delta(s,v)$ is by definition the *minimum* over all path weights, an estimate that always equals some path's weight can never be smaller than $\\delta(s,v)$.

Every SSSP algorithm in this course — BFS, DAG Relaxation, Bellman-Ford, Dijkstra — is this exact same relax-based estimate-lowering process; they differ **only** in what order they relax edges in, and that choice of order is what determines both correctness (does the order guarantee $d(s,v) = \\delta(s,v)$ by the time you stop touching $v$?) and running time (how expensive is it to compute or maintain that order?).`,
    pitfall:
      "Relaxation being 'safe' only guarantees d(s,v) never becomes an underestimate — it says nothing about when d(s,v) actually reaches the true δ(s,v). Correctness of a specific algorithm requires a separate argument that its particular relaxation order eventually tightens every estimate to equality, which is exactly what differs between BFS/DAG-Relaxation/Bellman-Ford/Dijkstra's correctness proofs.",
    related: ["mit6006-graphs-dag-relaxation", "mit6006-graphs-sssp-summary"],
  },
  {
    id: "mit6006-graphs-dag-relaxation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does DAG Relaxation solve SSSP in O(|V|+|E|) time, and why does processing vertices in topological order guarantee correctness?",
    back: `On a DAG: initialize $d(s,v) = \\infty$ for all $v$ ($d(s,s)=0$), compute a topological order of $G$ (Full-DFS, $O(|V|+|E|)$), then process vertices **in that order**, relaxing every outgoing edge of each vertex as it's processed.

Correctness by induction on position $k$ in the topological order: assume $d(s,v) = \\delta(s,v)$ for all of the first $k$ vertices. For the $(k{+}1)$-th vertex $v$, let $u$ be $v$'s predecessor on *some* shortest $s \\to v$ path — $u$ must come before $v$ in topological order (since edge $(u,v)$ exists and topological order respects all edges), so by induction $d(s,u) = \\delta(s,u)$ was already correct when $u$ was processed. When $u$ was processed, $(u,v)$ was relaxed, setting $d(s,v) \\leq \\delta(s,u) + w(u,v) = \\delta(s,v)$ — combined with relaxation's safety ($d(s,v) \\geq \\delta(s,v)$ always), this forces $d(s,v) = \\delta(s,v)$ exactly.

Total cost: $O(|V|)$ initialization + $O(|V|+|E|)$ topological sort + $O(1)$ work per edge relaxed (each edge relaxed exactly once, when its source is processed) = $O(|V|+|E|)$ overall. This is the *fastest* possible SSSP algorithm in this course's table, achieved only because a DAG's acyclicity guarantees a processing order where every predecessor is finalized before you need it — general graphs with cycles have no such order, which is exactly the problem Bellman-Ford and Dijkstra each solve differently.`,
    pitfall:
      "DAG Relaxation is only correct if the topological order is computed on the same graph whose shortest paths you're finding — running it on a graph that turns out to have a cycle (not actually a DAG) produces silently wrong distances rather than an error, since topological sort itself would need to detect the cycle first.",
    related: ["mit6006-graphs-relaxation", "mit6006-graphs-sssp-summary", "graph-traversal-topo-kahn"],
  },
  {
    id: "mit6006-graphs-shortest-paths-tree-reconstruction",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Once you know every δ(s,v), how do you reconstruct a shortest-paths tree afterward, and what subtlety arises from zero-weight cycles?",
    back: `Rather than tracking parent pointers *during* the relaxation process (as BFS does inline), 6.006 shows you can always reconstruct a valid shortest-paths tree **afterward** in $O(|V|+|E|)$, given only the final $\\delta(s,v)$ values: for each vertex $u$ with finite $\\delta(s,u)$, scan its outgoing edges $(u,v)$; if $v$ has no parent assigned yet and $\\delta(s,v) = \\delta(s,u) + w(u,v)$, set $P(v) = u$ (this edge provably lies on *some* shortest path to $v$).

The subtlety: this greedy first-match assignment can accidentally create a **cycle of zero-weight edges** in the parent-pointer structure (possible only among edges with $w=0$, since any positive-weight edge in a cycle back to an already-assigned ancestor would violate $\\delta$ being a minimum). A cycle in what's supposed to be a *tree* breaks it. Fix: for each vertex left "marked" as part of such a cycle, look for an alternative valid parent edge $(u,v)$ where $u$ is *unmarked* — reassigning $P(v) = u$ breaks the cycle by attaching it back to the tree's unmarked (already-correct) portion.

This after-the-fact reconstruction is why the weighted-SSSP algorithms in Lectures 12-14 (Bellman-Ford, Dijkstra, Johnson's) are described purely in terms of computing distances $d(s,v)$, without needing to also carry parent pointers through their own — often more complex — correctness arguments.`,
    pitfall:
      "This reconstruction only works correctly once every δ(s,v) is already final and correct — running it on partially-relaxed estimates (mid-algorithm) can pick edges that look locally valid but don't actually lie on a true shortest path, since d(s,u) might not yet equal δ(s,u).",
    related: ["mit6006-graphs-problem-hierarchy", "mit6006-graphs-relaxation"],
  },
  {
    id: "mit6006-graphs-bellman-ford-graph-duplication",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006's 'graph duplication' construction reduce Bellman-Ford to DAG Relaxation on an unrolled graph?",
    back: `Define the **$k$-edge distance** $\\delta_k(s,v)$: the minimum weight of any $s \\to v$ path using **at most $k$ edges**. Build a new DAG $G' = (V', E')$ with $|V|+1$ **levels** ($k = 0, \\ldots, |V|$), where vertex $v_k$ represents "reaching $v$ using $\\leq k$ edges": for every original vertex $v$, add zero-weight edges $(v_{k-1}, v_k)$ (carry a value forward unchanged, i.e. "do nothing this round"); for every original edge $(u,v)$ with weight $w(u,v)$, add edges $(u_{k-1}, v_k)$ with that same weight, for every level $k$. Since edges only ever go from level $k{-}1$ to level $k$, **$G'$ is guaranteed acyclic** regardless of what cycles $G$ itself has — so DAG Relaxation applies directly.

Running DAG Relaxation on $G'$ from $s_0$ computes $\\delta(s_0, v_k) = \\delta_k(s, v)$ for every $v$ and every $k$ (provable by induction on $k$, mirroring DAG Relaxation's own correctness proof one level at a time). This *is* Bellman-Ford — the "relax every edge, repeat $|V|-1$ times" formulation taught elsewhere is exactly this same layered unrolling, just without materializing $G'$ explicitly. Cost: $G'$ has $O(|V|(|V|+|E|))$ vertices and edges, so building and DAG-relaxing it costs $O(|V|(|V|+|E|))$ — pruned to only vertices reachable from $s$ first (so $|V| = O(|E|)$), this becomes the standard $O(|V| \\cdot |E|)$ bound.`,
    code: `# conceptually: G' has vertices v_k for v in V, k in 0..|V|
# edges: (v_{k-1}, v_k) weight 0   [carry forward]
#        (u_{k-1}, v_k) weight w(u,v)  for each (u,v) in E
# DAG Relaxation on G' from s_0 gives delta(s_0, v_k) = delta_k(s, v)`,
    pitfall:
      "The graph-duplication view is what makes Bellman-Ford's correctness a direct corollary of DAG Relaxation's proof — but it's easy to lose sight of why |V|-1 rounds specifically suffice: a *simple* shortest path (see the negative-cycle-witness card) has at most |V|-1 edges, so δ_{|V|-1}(s,v) already equals the true δ(s,v) whenever it's finite.",
    related: ["mit6006-graphs-dag-relaxation", "mit6006-graphs-bellman-ford-negative-cycle-witness"],
  },
  {
    id: "mit6006-graphs-bellman-ford-negative-cycle-witness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Bellman-Ford pinpoint exactly which vertices have δ(s,v) = -∞, using the idea of a 'negative cycle witness'?",
    back: `First: if $G$ has **no** negative-weight cycle, every finite shortest path is **simple** (repeats no vertex) — if it weren't, the repeated portion would form a non-negative-weight cycle (else $\\delta$ would be $-\\infty$, contradiction), and removing that cycle only shrinks or preserves the path's weight while using fewer vertices, contradicting minimality. A simple path has at most $|V|-1$ edges, so **$\\delta(s,v) = \\delta_{|V|-1}(s,v)$ whenever $\\delta(s,v)$ is finite**.

Define vertex $v$ as a **witness** if $\\delta_{|V|}(s,v) < \\delta_{|V|-1}(s,v)$ — i.e. allowing one *more* edge than a simple path can use still finds a strictly shorter path, which is only possible if that extra edge closes a negative-weight cycle. So: compute both $\\delta_{|V|-1}$ and $\\delta_{|V|}$ for every vertex (both fall out of the same graph-duplication DAG Relaxation, at levels $|V|{-}1$ and $|V|$); any vertex where they differ is a witness, provably lying on or reachable-from a negative-weight cycle.

Crucially, **not every vertex with $\\delta(s,v) = -\\infty$ is itself a witness** — but every negative-weight cycle reachable from $s$ contains **at least one** witness (proof: sum the $\\delta_{|V|}$ vs. $\\delta_{|V|-1}$ inequality around the cycle; if no vertex on it were a witness, the sums would contradict the cycle having negative total weight). So the fix-up step is: mark every witness, then mark every vertex **reachable from** a witness as $\\delta(s,v) = -\\infty$ too — that reachability pass is a single Full-BFS/DFS-style traversal, not per-witness work.`,
    pitfall:
      "A vertex can have δ(s,v) = -∞ without being a witness itself — it's merely reachable from one. Checking only 'is v a witness?' and reporting finite distances for non-witness vertices with actually-unbounded shortest paths is the classic bug this two-step (find witnesses, then propagate reachability from them) design exists to avoid.",
    related: ["mit6006-graphs-bellman-ford-graph-duplication", "shortest-paths-mst-bellman-ford-negative-cycle"],
  },
  {
    id: "mit6006-graphs-dijkstra-changeable-pq",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What extra priority-queue operation does Dijkstra need beyond a plain Priority Queue interface, and how does its backing structure choice change Dijkstra's running time?",
    back: `Dijkstra relaxes edges in increasing order of distance from $s$, using a **changeable priority queue**: beyond \`build\`/\`delete_min\`, it needs \`decrease_key(id, k)\` — find the item with a given ID and lower its key in place — because relaxing an edge $(u,v)$ that improves $d(s,v)$ must update $v$'s priority *without* removing and re-inserting it (which would break the invariant of "one entry per vertex"). This is implemented by cross-linking the priority queue with a **dictionary** mapping vertex IDs to their location in it.

Running time is $O(B_{|V|} + |V| \\cdot M_{|V|} + |E| \\cdot D_{|V|})$ for build/delete-min/decrease-key costs $B, M, D$ — so the backing structure choice directly sets Dijkstra's complexity:

$$\\begin{array}{l|ccc|l}
Q_0 & \\texttt{build} & \\texttt{delete\\_min} & \\texttt{decrease\\_key} & \\text{Dijkstra total} \\\\
\\hline
\\text{Array} & n & n & 1 & O(|V|^2) \\\\
\\text{Binary Heap} & n & \\log n^{(a)} & \\log n & O(|E|\\log|V|) \\\\
\\text{Fibonacci Heap} & n & \\log n^{(a)} & 1^{(a)} & O(|E| + |V|\\log|V|)
\\end{array}$$

An Array backing is actually *better* for dense graphs ($|E| = \\Theta(|V|^2)$, giving $O(|V|^2)$ either way but with lower constants); a Binary Heap wins for sparse graphs. 6.006 doesn't cover Fibonacci heaps in depth but tells you to assume $O(|E| + |V|\\log|V|)$ as Dijkstra's theoretical bound in problems.`,
    pitfall:
      "A binary heap's decrease_key needs to locate the target item first, which a plain array-backed heap can't do in O(1) — implementing 'changeable' priority queue semantics requires the auxiliary ID-to-position dictionary specifically, not just any binary heap off the shelf.",
    related: ["shortest-paths-mst-dijkstra-overview", "mit6006-graphs-sssp-summary"],
  },
  {
    id: "mit6006-graphs-sssp-summary",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "6.006's complete Single-Source Shortest Paths algorithm-selection table — which algorithm for which restriction, and why is each the fastest known for its case?",
    back: `Every algorithm below is the same relax-based process from a different edge-processing order, each order enabled by a different restriction on the input:

$$\\begin{array}{l|l|l|l}
\\text{Graph} & \\text{Weights} & \\text{Algorithm} & \\text{Time } O(\\cdot) \\\\
\\hline
\\text{General} & \\text{Unweighted} & \\text{BFS} & |V|+|E| \\\\
\\text{DAG} & \\text{Any} & \\text{DAG Relaxation} & |V|+|E| \\\\
\\text{General} & \\text{Non-negative} & \\text{Dijkstra} & |V|\\log|V|+|E| \\\\
\\text{General} & \\text{Any} & \\text{Bellman-Ford} & |V|\\cdot|E|
\\end{array}$$

Selection logic, in order of preference: is the graph unweighted (or all weights equal)? Use BFS. Is it a DAG? Use DAG Relaxation regardless of weight sign — acyclicity alone gives a safe processing order. Otherwise, are all weights non-negative? Use Dijkstra — a priority queue can discover the correct processing order on the fly. Otherwise (general graph, possibly negative weights, possibly negative cycles) — Bellman-Ford is the fallback, the only one of the four that can even detect and report negative cycles.

For **All-Pairs Shortest Paths**, running any of these $|V|$ times (once per source) is already reasonable since output size is $\\Theta(|V|^2)$ regardless — Johnson's algorithm (see related card) improves the general-weights case specifically, from $|V|$ runs of Bellman-Ford ($O(|V|^2 \\cdot |E|)$) down to one Bellman-Ford plus $|V|$ runs of Dijkstra ($O(|V|^2\\log|V| + |V||E|)$), by reweighting to remove negative edges first.`,
    related: ["mit6006-graphs-dag-relaxation", "mit6006-graphs-johnsons-algorithm"],
  },
  {
    id: "mit6006-graphs-reweighting-potential-function",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the potential-function reweighting trick, why does 'add a constant to every edge' fail, and why does it work with a per-vertex adjustment instead?",
    back: `**Naive attempt**: add $-(\\text{most negative weight})$ to *every* edge, making all weights non-negative. This **fails** — it biases toward paths with fewer edges (a $k$-edge path's total weight shifts by $+k \\cdot |\\text{min weight}|$, so shortest-path *comparisons* between paths of different lengths change, not just their absolute weights).

**Working idea**: define a **potential function** $h: V \\to \\mathbb{Z}$, and reweight each edge $(u,v)$ to $w'(u,v) = w(u,v) + h(u) - h(v)$. For any path $\\pi = (v_0, \\ldots, v_k)$, summing the new weights along it **telescopes**: $w'(\\pi) = \\sum w(v_{i-1},v_i) + h(v_{i-1}) - h(v_i) = w(\\pi) + h(v_0) - h(v_k)$ — every interior $h(v_i)$ appears once with $+$ and once with $-$ and cancels. So **every** path between the same two endpoints $v_0, v_k$ shifts by exactly the same amount $h(v_0) - h(v_k)$, meaning whichever path was shortest in $G$ is still shortest in $G'$ — shortest paths are preserved *exactly*, not just approximately.

The remaining question — can you choose $h$ so that every reweighted edge becomes non-negative — is answered by Johnson's algorithm specifically: rearranging $w(u,v) + h(u) - h(v) \\geq 0$ gives $h(v) \\leq h(u) + w(u,v)$, which is exactly the triangle-inequality shape satisfied by $h(v) = \\delta(s,v)$ for any single source $s$ that can reach everything.`,
    pitfall:
      "This trick preserves which path is shortest between any fixed pair of endpoints — it does not preserve raw path weights (those shift by h(start) - h(end)), so you must un-reweight (add back h(start) - h(end)) to recover actual distances in the original graph, not just relative comparisons.",
    related: ["mit6006-graphs-johnsons-algorithm"],
  },
  {
    id: "mit6006-graphs-johnsons-algorithm",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Johnson's algorithm combine reweighting, Bellman-Ford, and Dijkstra to solve APSP with negative weights in O(|V|² log|V| + |V||E|)?",
    back: `1. **Add a super-source** $x$ with a zero-weight edge to every vertex in $V$ (adding $x$ introduces no new cycles, since $x$ has no incoming edges — so any negative cycle in $G_x$ is already a negative cycle in $G$).
2. **Run Bellman-Ford from $x$** to compute $\\delta_x(x,v)$ for every $v$ — if any is $-\\infty$, $G$ has a negative-weight cycle; **abort**.
3. Otherwise, use $h(v) = \\delta_x(x,v)$ as the potential function (finite for every $v$, since every $v$ is reachable from $x$ via the zero-weight edge). Reweight: $w'(u,v) = w(u,v) + h(u) - h(v) \\geq 0$ for every edge — guaranteed non-negative by the triangle inequality, since $\\delta_x$ satisfies it by definition.
4. **Run Dijkstra from every vertex** $u \\in V$ on the reweighted graph $G'$ to get $\\delta'(u,v)$ for all pairs.
5. **Un-reweight**: recover true distances via $\\delta(u,v) = \\delta'(u,v) - h(u) + h(v)$ (inverting the shift the potential function introduced).

Correctness reduces entirely to Bellman-Ford's correctness (step 2) and Dijkstra's correctness (step 4) plus the reweighting-preserves-shortest-paths proof — "no induction today," as the lecture puts it, because it's a **reduction** (signed-weight APSP reduces to non-negative-weight APSP) rather than a new algorithm needing its own correctness proof from scratch. Total cost: $O(|V|+|E|)$ to build $G_x$, $O(|V||E|)$ for one Bellman-Ford, $O(|V|+|E|)$ to reweight, $O(|V| \\cdot (|V|\\log|V| + |E|))$ for $|V|$ Dijkstra runs, $O(|V|^2)$ to un-reweight all pairs — dominated by $O(|V|^2\\log|V| + |V||E|)$, strictly better than running Bellman-Ford $|V|$ times ($O(|V|^2|E|)$) for the same general-weights APSP problem.`,
    pitfall:
      "Forgetting to un-reweight (step 5) returns distances in the wrong graph — δ'(u,v) from the reweighted graph is not the answer to the original problem, only δ'(u,v) - h(u) + h(v) is; this is the single most common implementation slip.",
    related: ["mit6006-graphs-reweighting-potential-function", "mit6006-graphs-sssp-summary", "shortest-paths-mst-floyd-warshall"],
  },
];
