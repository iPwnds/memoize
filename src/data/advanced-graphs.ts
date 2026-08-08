import type { Card } from "./types";

const MODULE = "advanced-graphs";

export const advancedGraphsCards: Card[] = [
  // ---------------------------------------------------------------- SCC
  {
    id: "advanced-graphs-scc-overview",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a strongly connected component, and why does it matter?",
    back: `In a **directed** graph, a strongly connected component (SCC) is a maximal set of vertices where **every vertex can reach every other vertex** in the set via directed paths. This is a strictly stronger notion than the "weakly connected" components you'd get by ignoring edge direction (see the Graph Traversal module's connected-components card) — a directed graph can be one weakly-connected piece while containing many separate SCCs.

Why it matters: SCCs let you **collapse** a directed graph into a DAG (the "condensation" — contract each SCC to a single node) — this is a common first step in graph algorithms, since many problems become tractable once you know you're working with a DAG (e.g. topological sort only applies to DAGs). Real uses: detecting cycles/deadlocks (a non-trivial SCC — more than one vertex — implies a cycle), compiler dependency analysis, analyzing web-page link structure, social network mutual-reachability clusters.`,
    related: ["advanced-graphs-kosaraju", "advanced-graphs-tarjan-scc"],
  },
  {
    id: "advanced-graphs-kosaraju",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Kosaraju's algorithm find all SCCs?",
    back: `Two DFS passes:

1. Run DFS over the **original** graph, pushing each vertex onto a stack when it **finishes** (same finish-time idea as DFS-based topological sort).
2. Compute the **transpose graph** $G^T$ (reverse every edge). Pop vertices off the stack (i.e., process in **decreasing finish-time order** from pass 1); for each not-yet-visited vertex, run DFS on $G^T$ — everything reached in that one DFS call is exactly one SCC.

Why processing in decreasing finish-time order on the transpose works: the vertex that finished last in pass 1 is guaranteed to be in a "source" SCC of the condensation DAG (or tied for one) — reversing all edges turns sources into sinks and vice versa, so DFS from that vertex on $G^T$ can only reach vertices within its own SCC (it can't escape into what were, pre-reversal, other SCCs it could reach, because those edges now point the wrong way).`,
    complexity: {
      structure: "Kosaraju's Algorithm",
      operations: [{ op: "Find all SCCs", time: "O(V + E)", note: "two DFS passes plus building the transpose" }],
    },
    pitfall:
      "Processing vertices in the wrong order in pass 2 (e.g. increasing finish time, or skipping the transpose) breaks correctness entirely — the decreasing-finish-time order on the REVERSED graph is what isolates each SCC cleanly.",
    related: ["advanced-graphs-scc-overview", "advanced-graphs-tarjan-vs-kosaraju"],
  },
  {
    id: "advanced-graphs-tarjan-scc",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Tarjan's algorithm find all SCCs in a single DFS pass?",
    back: `Track two values per vertex during one DFS: **discovery index** (order visited) and **low-link value** (the smallest discovery index reachable from this vertex's subtree, including via **one back edge** to an ancestor still on the current DFS stack). Maintain an explicit stack of vertices currently "in progress."

A vertex $v$ is the **root of an SCC** exactly when $low[v] == disc[v]$ — meaning nothing in its subtree can reach back to an ancestor earlier than $v$ itself, so $v$'s subtree-so-far (restricted to the still-on-stack portion) forms a complete SCC. When this condition is found, **pop the stack** down to and including $v$ — everything popped is exactly that SCC.

The low-link value itself is computed bottom-up during the DFS return: $low[u] = \\min(low[u], low[v])$ for each DFS tree-edge child $v$, and $low[u] = \\min(low[u], disc[v])$ for each back edge to a vertex $v$ still on the stack — this is the exact same low-link technique used for articulation points and bridges (see those cards), applied to directed graphs.`,
    complexity: {
      structure: "Tarjan's SCC Algorithm",
      operations: [{ op: "Find all SCCs", time: "O(V + E)", note: "single DFS pass" }],
    },
    pitfall:
      "Using disc[v] instead of low[v] when updating via a back edge to a vertex not currently on the stack is a common bug — a back edge to a vertex that's already been popped (finished, and assigned to an earlier SCC) must NOT be used to update low-link, since that vertex is provably in a different SCC.",
    related: ["advanced-graphs-scc-overview", "advanced-graphs-articulation-bridges-lowlink"],
  },
  {
    id: "advanced-graphs-tarjan-vs-kosaraju",
    tier: 2,
    module: MODULE,
    type: "compare",
    front: "Tarjan's vs. Kosaraju's for finding SCCs — how do you choose?",
    back: `Both run in $O(V+E)$. The practical differences:

- **Tarjan's**: single DFS pass, no need to build the transpose graph (saves memory/time building $G^T$), but the low-link bookkeeping is more intricate to implement correctly.
- **Kosaraju's**: conceptually simpler to reason about and explain (two separate, individually-simple DFS passes), but requires materializing the transpose graph — extra memory and a full extra pass.

In practice, Tarjan's is generally preferred for production code (fewer passes, no transpose construction), while Kosaraju's is often taught first / used in explanations because "run DFS twice, once reversed" is easier to hold in your head than low-link value propagation.`,
    related: ["advanced-graphs-kosaraju", "advanced-graphs-tarjan-scc"],
  },

  // ------------------------------------------------------ Articulation/bridges
  {
    id: "advanced-graphs-articulation-points",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is an articulation point (cut vertex), and why does it matter?",
    back: `In an **undirected** graph, an articulation point is a vertex whose **removal increases the number of connected components** — i.e., it's a single point of failure holding otherwise-separate parts of the graph together.

Real uses: identifying single points of failure in a network (which router/server, if it goes down, partitions the network), critical infrastructure analysis (which intersection, if closed, disconnects parts of a road network), and as a building block for more advanced graph decompositions (biconnected components). Finding all articulation points in one pass uses the same low-link DFS technique as bridges and Tarjan's SCC algorithm — see that card.`,
    related: ["advanced-graphs-bridges", "advanced-graphs-articulation-bridges-lowlink"],
  },
  {
    id: "advanced-graphs-bridges",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a bridge, and how does it differ from an articulation point?",
    back: `A bridge is an **edge** whose removal increases the number of connected components (as opposed to an articulation point, which is a *vertex* with that property). Every bridge's two endpoints are articulation points **if** they have other neighbors (a bridge to a degree-1 leaf doesn't make that leaf an articulation point, since removing a leaf can't disconnect anything further) — but the converse doesn't hold: an articulation point can exist without any adjacent bridge (e.g. a vertex connecting two cycles, where removing it disconnects the graph, but no single edge is a bridge).

Real uses: identifying critical network links (which single cable/connection, if cut, partitions the network) — directly relevant to network reliability and redundancy planning (a network with no bridges has redundant paths everywhere, tolerating any single link failure).`,
    pitfall:
      "Articulation points and bridges are related but NOT equivalent concepts — a graph can have articulation points with zero bridges (cycles sharing a single cut vertex), so don't assume finding one gives you the other for free without running the actual respective check.",
    related: ["advanced-graphs-articulation-points", "advanced-graphs-articulation-bridges-lowlink"],
  },
  {
    id: "advanced-graphs-articulation-bridges-lowlink",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Tarjan's low-link technique find articulation points and bridges in one DFS pass?",
    back: `Same \`disc\`/\`low\` bookkeeping as Tarjan's SCC algorithm (see that card), applied to an **undirected** DFS tree, with one extra wrinkle: you must **exclude the edge back to your immediate parent** from back-edge low-link updates (an undirected graph stores every edge in both directions, so without this exclusion every edge would look like a trivial back edge to itself — the same parent-exclusion issue as undirected cycle detection).

- **Bridge condition**: tree edge $(u, v)$ (where $v$ is $u$'s DFS child) is a bridge if and only if $low[v] > disc[u]$ — meaning $v$'s subtree has **no** back edge reaching $u$ or higher, so removing edge $(u,v)$ genuinely disconnects $v$'s subtree from the rest.
- **Articulation point condition**: vertex $u$ is an articulation point if either (a) $u$ is the **DFS root** and has **more than one child** in the DFS tree (removing it splits those subtrees apart, since without $u$ there'd be no connection between them), or (b) $u$ is **not** the root and has some child $v$ with $low[v] \\geq disc[u]$ (v's subtree can't reach back above $u$, so removing $u$ strands it).`,
    code: `def find_bridges(graph, n):
    disc = [-1] * n
    low = [0] * n
    timer = [0]
    bridges = []
    def dfs(u, parent):
        disc[u] = low[u] = timer[0]; timer[0] += 1
        for v in graph[u]:
            if v == parent:
                continue          # skip the edge back to parent
            if disc[v] == -1:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridges.append((u, v))
            else:
                low[u] = min(low[u], disc[v])
    for u in range(n):
        if disc[u] == -1:
            dfs(u, -1)
    return bridges`,
    pitfall:
      "The DFS-root special case for articulation points is easy to forget — a root with only one child is never an articulation point regardless of low-link values, since there's nothing 'above' it that removal could disconnect it from.",
    related: ["advanced-graphs-articulation-points", "advanced-graphs-bridges", "advanced-graphs-tarjan-scc"],
  },

  // ------------------------------------------------------------ Network flow
  {
    id: "advanced-graphs-max-flow-overview",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What does the max-flow problem model, and what is a residual graph?",
    back: `A flow network is a directed graph where each edge has a **capacity** (max amount that can flow through it), with a designated **source** $s$ and **sink** $t$. Max flow asks: what's the greatest total flow that can be pushed from $s$ to $t$, respecting every edge's capacity and conservation of flow at every other vertex (flow in = flow out)?

The **residual graph** is the key bookkeeping device every max-flow algorithm uses: for each edge $(u,v)$ with capacity $c$ currently carrying flow $f$, the residual graph has a **forward edge** $(u,v)$ with remaining capacity $c - f$ (how much more can still be pushed), and a **backward edge** $(v,u)$ with capacity $f$ (representing the ability to "undo" already-sent flow — sending flow along this backward edge effectively cancels/reroutes previously committed flow). This backward-edge mechanism is what lets an algorithm correct an earlier suboptimal routing choice without needing to explicitly backtrack.`,
    related: ["advanced-graphs-ford-fulkerson", "advanced-graphs-max-flow-min-cut"],
  },
  {
    id: "advanced-graphs-ford-fulkerson",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does the Ford-Fulkerson method compute max flow?",
    back: `Repeatedly find an **augmenting path** — any path from $s$ to $t$ in the current residual graph with positive remaining capacity along every edge — and push flow equal to the **bottleneck** (minimum residual capacity along that path). Update the residual graph (decrease forward capacities, increase backward capacities along the path) and repeat until **no augmenting path exists** — at that point, the current flow is provably maximum (this is exactly the max-flow min-cut theorem — see that card).

Ford-Fulkerson is a **method**, not a fully specified algorithm — it doesn't say *how* to find an augmenting path, just that any valid one works. With arbitrary path selection (e.g. plain DFS), it can be slow: with integer capacities it terminates in $O(E \\cdot \\text{max\\_flow})$ time in the worst case, since a poorly chosen path might only increase flow by 1 unit each iteration. **Edmonds-Karp** (see that card) fixes this by specifying BFS for path selection, giving a genuine polynomial bound independent of the capacity values.`,
    complexity: {
      structure: "Ford-Fulkerson (arbitrary path choice)",
      operations: [{ op: "Max flow", time: "O(E · max_flow)", note: "not polynomial in graph size alone" }],
    },
    pitfall:
      "Ford-Fulkerson's O(E · max_flow) bound depends on the VALUE of the max flow, not just graph size — with large capacities and a poor path-choice strategy (e.g. always picking a path with tiny bottleneck capacity), this can be extremely slow despite a small graph.",
    related: ["advanced-graphs-edmonds-karp", "advanced-graphs-max-flow-overview"],
  },
  {
    id: "advanced-graphs-edmonds-karp",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Edmonds-Karp improve on Ford-Fulkerson, and what's its complexity bound?",
    back: `Edmonds-Karp is Ford-Fulkerson with one specific rule: **always choose the shortest augmenting path** (fewest edges), found via **BFS** on the residual graph each iteration — instead of leaving path choice arbitrary.

This one constraint gives a genuine polynomial bound, **independent of capacity values**: $O(VE^2)$. The key insight enabling this bound is that each edge can become "saturated" (bottleneck of the chosen path) only $O(V)$ times across the whole algorithm — because every time an edge saturates, the shortest-path distance from $s$ to either of its endpoints must strictly increase before that edge can saturate again, and shortest-path distance is bounded by $V$. With $E$ edges each saturating $O(V)$ times, and each BFS costing $O(E)$, total work is $O(VE^2)$.`,
    complexity: {
      structure: "Edmonds-Karp",
      operations: [{ op: "Max flow", time: "O(V·E²)", note: "polynomial regardless of capacity magnitudes" }],
    },
    code: `from collections import deque

def bfs_augmenting_path(residual, s, t, n):
    parent = [-1] * n
    parent[s] = s
    queue = deque([s])
    while queue:
        u = queue.popleft()
        for v in range(n):
            if parent[v] == -1 and residual[u][v] > 0:
                parent[v] = u
                if v == t:
                    return parent
                queue.append(v)
    return None

def edmonds_karp(capacity, s, t, n):
    residual = [row[:] for row in capacity]
    max_flow = 0
    while (parent := bfs_augmenting_path(residual, s, t, n)):
        # walk path t -> s via parent, finding the bottleneck capacity
        path_flow, v = float('inf'), t
        while v != s:
            u = parent[v]
            path_flow = min(path_flow, residual[u][v])
            v = u
        v = t
        while v != s:
            u = parent[v]
            residual[u][v] -= path_flow
            residual[v][u] += path_flow
            v = u
        max_flow += path_flow
    return max_flow`,
    related: ["advanced-graphs-ford-fulkerson", "advanced-graphs-max-flow-min-cut"],
  },
  {
    id: "advanced-graphs-max-flow-min-cut",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What does the max-flow min-cut theorem state, and why is it what proves Ford-Fulkerson correct?",
    back: `An $s$-$t$ **cut** is a partition of vertices into two sets, one containing $s$ and the other containing $t$; its **capacity** is the sum of capacities of edges crossing from the $s$-side to the $t$-side. The theorem states: **the maximum flow from $s$ to $t$ equals the minimum capacity over all possible $s$-$t$ cuts.**

Intuition for why they must be equal: any flow is trivially bounded above by *every* cut's capacity (all flow must cross every cut at least once, net), so max-flow $\\leq$ min-cut always holds. The nontrivial direction — that this bound is actually *achieved* — is exactly what "no augmenting path exists" certifies: when Ford-Fulkerson terminates (residual graph has no $s$-to-$t$ path), the set of vertices still reachable from $s$ in the residual graph forms one side of a cut whose capacity **exactly equals** the current flow — proving that flow is simultaneously a valid flow and matches some cut's capacity, which by the inequality direction must mean both are optimal.

This is also directly useful as an algorithm: finding min-cut is literally "run max-flow, then look at which vertices remain reachable from $s$ in the final residual graph" — no separate algorithm needed.`,
    pitfall:
      "This is one of the cleanest LP-duality-flavored results in the whole curriculum: max-flow and min-cut aren't just related facts, they're the SAME NUMBER by this theorem — a common exam trap is treating them as merely correlated rather than provably equal.",
    related: ["advanced-graphs-ford-fulkerson", "advanced-graphs-max-flow-overview"],
  },

  // -------------------------------------------------------- Bipartite matching
  {
    id: "advanced-graphs-bipartite-matching-flow",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does bipartite matching reduce to a max-flow problem?",
    back: `Given a bipartite graph (two vertex sides, edges only between sides — see the Graph Traversal module's bipartiteness card), a **matching** pairs up vertices via edges such that no vertex is used twice; **maximum matching** finds the largest such pairing.

Reduction to max flow: add a **super-source** $s$ connected to every vertex on the left side (capacity 1 each), add a **super-sink** $t$ connected to from every vertex on the right side (capacity 1 each), and give every original bipartite edge capacity 1, directed left-to-right. Since all capacities are 1, any integer flow corresponds to a valid matching (flow conservation at each vertex, capacity-1 edges enforcing "used at most once"), and the **maximum flow value equals the maximum matching size**. This means Edmonds-Karp already solves bipartite matching in $O(VE^2)$ — but the specialized structure (all capacities are 1) allows a much faster dedicated algorithm: **Hopcroft-Karp** (see that card).`,
    related: ["graph-traversal-bipartiteness", "advanced-graphs-hopcroft-karp", "advanced-graphs-max-flow-overview"],
  },
  {
    id: "advanced-graphs-hopcroft-karp",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Hopcroft-Karp improve on generic max-flow for bipartite matching?",
    back: `Instead of augmenting **one** shortest path per phase (like Edmonds-Karp), Hopcroft-Karp finds a **maximal set of vertex-disjoint shortest augmenting paths simultaneously** in each phase (via one BFS to find the shortest-augmenting-path length, then one DFS pass to greedily extract as many disjoint paths of that exact length as possible), augmenting the matching along all of them at once.

This dramatically reduces the number of phases needed: it can be proven that after $O(\\sqrt{V})$ phases, no augmenting path shorter than $O(\\sqrt{V})$ remains, and the total number of phases is bounded by $O(\\sqrt{V})$. Each phase costs $O(E)$ (one BFS + one DFS pass), giving total complexity $O(E\\sqrt{V})$ — asymptotically better than generic max-flow's $O(VE^2)$ applied to the same problem, specifically by exploiting the unit-capacity bipartite structure that a general max-flow algorithm doesn't know to take advantage of.`,
    complexity: {
      structure: "Hopcroft-Karp",
      operations: [{ op: "Maximum bipartite matching", time: "O(E√V)" }],
    },
    pitfall:
      "Hopcroft-Karp's speedup comes specifically from exploiting unit capacities and the bipartite structure — it's not a general max-flow algorithm and doesn't apply to weighted matching or non-bipartite graphs without modification (general graph matching needs the more complex Blossom algorithm).",
    related: ["advanced-graphs-bipartite-matching-flow"],
  },

  // -------------------------------------------------------------------- A*
  {
    id: "advanced-graphs-astar",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does A* search work, and how does it generalize Dijkstra's algorithm?",
    back: `A* is Dijkstra's algorithm with one modification: instead of prioritizing vertices by $g(v)$ alone (actual known distance from the source, same as Dijkstra), it prioritizes by $f(v) = g(v) + h(v)$, where $h(v)$ is a **heuristic estimate** of the remaining distance from $v$ to the goal. This lets A* prefer exploring vertices that seem to be heading *toward* the goal, rather than blindly expanding outward in all directions by actual-distance-so-far alone.

If $h(v) = 0$ for all $v$, A* degenerates to exactly Dijkstra's algorithm — Dijkstra is the special case of A* with no heuristic guidance at all. This is why A* is best understood as a strict generalization, not a separate algorithm: same priority-queue-driven relaxation structure, just a smarter priority function when a good heuristic is available (e.g. straight-line/Euclidean distance to the goal in pathfinding on a map).`,
    complexity: {
      structure: "A* Search",
      operations: [{ op: "Search (heap-based)", time: "O((V+E) log V)", note: "same as Dijkstra; the heuristic changes exploration order, not the worst-case bound" }],
    },
    related: ["advanced-graphs-astar-admissibility", "shortest-paths-mst-dijkstra-overview"],
  },
  {
    id: "advanced-graphs-astar-admissibility",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What does it mean for a heuristic to be admissible, and why does A* need it for optimality?",
    back: `A heuristic $h(v)$ is **admissible** if it **never overestimates** the true remaining distance to the goal: $h(v) \\leq \\text{actual\\_distance}(v, \\text{goal})$ for every vertex. (Straight-line distance is a classic admissible heuristic for road-network pathfinding — you can never actually get there in less distance than a straight line, since roads only add detour.)

Admissibility is exactly what guarantees A* finds the **true shortest path**, not just *a* plausible-looking one: an overestimating heuristic could cause A* to prematurely deprioritize (and never properly explore) a vertex that's actually on the optimal path, because it looks falsely expensive. With an admissible heuristic, A* never discards a path that could still turn out optimal — it's provably as correct as Dijkstra while typically exploring far fewer vertices in practice.

A related, stronger property is **consistency** (a.k.a. the triangle inequality: $h(u) \\leq \\text{cost}(u,v) + h(v)$ for every edge) — consistency implies admissibility and additionally guarantees that once A* finalizes a vertex's distance, it never needs to revisit it (matching Dijkstra's own finalization guarantee exactly).`,
    pitfall:
      "An inadmissible heuristic (one that CAN overestimate) doesn't necessarily make A* crash or loop — it just silently returns a suboptimal path, exactly like Dijkstra with negative weights returns a wrong answer without any error signal.",
    related: ["advanced-graphs-astar", "advanced-graphs-astar-vs-dijkstra"],
  },
  {
    id: "advanced-graphs-astar-vs-dijkstra",
    tier: 2,
    module: MODULE,
    type: "compare",
    front: "A* vs. Dijkstra — when does the heuristic actually pay off?",
    back: `Both guarantee the shortest path (given non-negative weights, and for A*, an admissible heuristic) and share the same worst-case complexity bound. The practical difference is **how many vertices get explored before reaching the goal**:

- **Dijkstra** explores outward uniformly in all directions by actual distance — it has no notion of "which direction is the goal," so it wastes work exploring vertices that are objectively closer to the source but pointing entirely away from the destination.
- **A*** with a good (tight, still-admissible) heuristic explores in a much more directed way toward the goal, often visiting dramatically fewer vertices in practice for point-to-point queries.

A* only has an advantage when you have a **specific target vertex** and a decent heuristic available (spatial pathfinding is the classic case). If you need distances to **all** vertices (not just one target), or have no useful heuristic (h=0 everywhere), A* provides no benefit over plain Dijkstra — the heuristic's whole value is in pruning search toward one known goal.`,
    related: ["advanced-graphs-astar", "shortest-paths-mst-dijkstra-overview"],
  },

  // ------------------------------------------------------------- Eulerian
  {
    id: "advanced-graphs-eulerian-path-circuit",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What are Eulerian paths and circuits, and what are their existence conditions?",
    back: `An **Eulerian circuit** is a closed walk that uses **every edge exactly once** and returns to its starting vertex. An **Eulerian path** is the same but doesn't need to return to the start (open walk, uses every edge exactly once).

**Existence conditions (undirected graph)**: an Eulerian **circuit** exists iff every vertex has **even degree** and all edges lie in a single connected component. An Eulerian **path** (but not circuit) exists iff **exactly two** vertices have odd degree (the path must start at one and end at the other) and the graph is connected.

**Directed graph**: an Eulerian **circuit** exists iff every vertex's in-degree equals its out-degree, and the graph is connected (ignoring direction, with all edges reachable from any starting point). An Eulerian **path** exists iff at most one vertex has $\\text{out-degree} - \\text{in-degree} = 1$ (the start) and at most one has $\\text{in-degree} - \\text{out-degree} = 1$ (the end), with all other vertices balanced.

This is the origin problem of graph theory itself — the Seven Bridges of Königsberg, which Euler proved unsolvable precisely because the underlying graph had four odd-degree vertices, violating the circuit condition (and even the path condition, needing exactly two, not four).`,
    related: ["advanced-graphs-hierholzer"],
  },
  {
    id: "advanced-graphs-hierholzer",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Hierholzer's algorithm construct an Eulerian circuit?",
    back: `Start at any vertex; **greedily walk** along unused edges, marking each edge used as you traverse it, until you're stuck (forced back to the starting vertex — guaranteed to happen because every vertex has even degree, so you can never get stuck at a non-start vertex: every time you enter a vertex via an edge, an even-degree guarantee ensures an unused edge remains to leave by, until you close the loop back at start). This gives one closed **sub-circuit**, but possibly not using all edges yet.

If unused edges remain, they must touch some vertex **already on your current circuit** (since the graph is connected) — pick such a vertex, **splice in** a new sub-circuit starting and ending there (found the same greedy way), inserting it into the original circuit at that vertex. Repeat until no unused edges remain. The final spliced-together walk is a valid Eulerian circuit.

Cost: $O(E)$ total — each edge is traversed and marked used exactly once across all the splicing, and finding "a vertex on the current circuit with unused edges" can be done efficiently by maintaining, per vertex, a pointer into its remaining unused edge list.`,
    code: `def hierholzer(graph, start, n):
    # graph: adjacency list with edges consumable (e.g. list of lists, popped as used)
    circuit = []
    stack = [start]
    while stack:
        v = stack[-1]
        if graph[v]:
            u = graph[v].pop()
            stack.append(u)
        else:
            circuit.append(stack.pop())
    return circuit[::-1]`,
    pitfall:
      "Hierholzer's algorithm assumes the existence conditions (even degree / balanced in-out degree, connectivity) already hold — it doesn't verify or handle the case where no Eulerian circuit/path exists; check the existence conditions first.",
    related: ["advanced-graphs-eulerian-path-circuit"],
  },
];
