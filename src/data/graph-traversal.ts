import type { Card } from "./types";

const MODULE = "graph-traversal";

export const graphTraversalCards: Card[] = [
  {
    id: "graph-traversal-representations",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Adjacency list vs. adjacency matrix vs. edge list — what are the trade-offs, and when do you use each?",
    back: `- **Adjacency list**: array/map of \`vertex → list of neighbors\`. Space $O(V + E)$ — proportional to what's actually there. Best default for **sparse graphs** ($E \\ll V^2$, the common case) and any traversal algorithm (BFS/DFS) that needs "iterate all neighbors of v," which it supports in $O(\\text{degree}(v))$.
  - **Adjacency matrix**: $V \\times V$ boolean/weight grid. Space $O(V^2)$ regardless of edge count — wasteful for sparse graphs, but gives $O(1)$ **edge existence lookup** ("is there an edge u→v?"), which adjacency lists can't do better than $O(\\text{degree}(u))$. Good for **dense graphs** or algorithms that need frequent edge-existence checks (Floyd-Warshall, some matching algorithms).
- **Edge list**: flat list of \`(u, v, weight)\` tuples. Space $O(E)$, simplest to build/serialize, but slow to query neighbors of a specific vertex ($O(E)$ scan). Mainly useful as an input format, or for algorithms that process all edges globally in one pass regardless of structure (Kruskal's — sort all edges once; Bellman-Ford — relax all edges each round).

There's no universally "best" representation — the choice follows directly from which operation the algorithm needs cheaply.`,
    complexity: {
      structure: "Graph Representations",
      operations: [
        { op: "Adjacency list — space", time: "O(V + E)" },
        { op: "Adjacency list — neighbors of v", time: "O(deg(v))" },
        { op: "Adjacency matrix — space", time: "O(V²)" },
        { op: "Adjacency matrix — edge exists?", time: "O(1)" },
        { op: "Edge list — space", time: "O(E)" },
        { op: "Edge list — neighbors of v", time: "O(E)" },
      ],
    },
    pitfall:
      "Defaulting to an adjacency matrix out of habit wastes O(V²) memory on sparse real-world graphs (social networks, road networks) where E is closer to O(V) than O(V²) — always check sparsity before picking a representation.",
    related: [],
  },

  // ------------------------------------------------------------------ BFS
  {
    id: "graph-traversal-bfs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does BFS work, and why does it find shortest paths in unweighted graphs?",
    back: `Explore the graph in **layers**, using a queue: start at the source, visit all its direct neighbors (layer 1), then all of *their* unvisited neighbors (layer 2), and so on — never jumping ahead to a farther layer before finishing the current one.

Why this gives shortest paths in an **unweighted** graph: BFS visits vertices in strictly non-decreasing order of distance from the source (every vertex in layer $k$ is discovered only after all of layer $k-1$ is processed), so the *first* time a vertex is reached is guaranteed to be via a shortest (fewest-edges) path — there's no way to reach it in fewer steps that BFS wouldn't have already found first.

This breaks for **weighted** graphs — a path with more edges can have smaller total weight than a path with fewer edges, and BFS's layer-by-layer order has nothing to do with edge weights (that's what Dijkstra's algorithm is for).`,
    complexity: {
      structure: "BFS",
      operations: [{ op: "Traversal", time: "O(V + E)", space: "O(V)" }],
    },
    pitfall:
      "Running BFS on a weighted graph and treating the result as shortest-path distances is a common and serious error — BFS only guarantees shortest paths by edge *count*, meaningless once edges have different weights.",
    related: ["graph-traversal-bfs-implementation", "graph-traversal-bfs-vs-dfs"],
  },
  {
    id: "graph-traversal-bfs-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement BFS from a source vertex, tracking distances.",
    back: `Mark a vertex visited **at the moment you enqueue it**, not when you dequeue it — otherwise the same vertex can be enqueued multiple times via different neighbors before it's first processed, wasting work (and for shortest-path tracking, risking incorrect distances).`,
    code: `from collections import deque

def bfs(graph, source):
    dist = {source: 0}
    queue = deque([source])
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if v not in dist:
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist`,
    pitfall:
      "Marking a vertex visited only when dequeued (instead of when enqueued) lets it be added to the queue multiple times, and can compute an incorrect (non-minimal) distance if it's dequeued via a longer path first.",
    related: ["graph-traversal-bfs"],
  },

  // ------------------------------------------------------------------ DFS
  {
    id: "graph-traversal-dfs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does DFS work, recursively and iteratively?",
    back: `Explore as **deep** as possible along each branch before backtracking — the opposite exploration order from BFS's layer-by-layer approach.

**Recursive**: visit a vertex, mark it visited, then recursively visit each unvisited neighbor — the call stack implicitly tracks the path back for backtracking.

**Iterative**: use an explicit stack. Push the source; loop: pop a vertex, if not yet visited, mark it visited and push all its neighbors. Note this iterative version can push the same vertex multiple times before it's first popped (from different neighbors); checking "visited" at pop-time (not push-time) handles this correctly, unlike BFS's queue version where checking at enqueue-time is preferred (see the pitfall on the BFS card) — the two traversals have different practical conventions here, and it's fine as long as you check visited status at the point that determines processing order.`,
    code: `def dfs_recursive(graph, u, visited=None):
    if visited is None:
        visited = set()
    visited.add(u)
    for v in graph[u]:
        if v not in visited:
            dfs_recursive(graph, v, visited)
    return visited

def dfs_iterative(graph, source):
    visited = set()
    stack = [source]
    while stack:
        u = stack.pop()
        if u in visited:
            continue
        visited.add(u)
        for v in graph[u]:
            if v not in visited:
                stack.append(v)
    return visited`,
    complexity: {
      structure: "DFS",
      operations: [{ op: "Traversal", time: "O(V + E)", space: "O(V)", note: "O(V) worst-case recursion depth" }],
    },
    pitfall:
      "Deep recursive DFS on a very large/deep graph can hit the language's recursion limit (Python's default is ~1000) — the iterative version with an explicit stack avoids this entirely.",
    related: ["graph-traversal-bfs-vs-dfs", "graph-traversal-discovery-finish-times"],
  },
  {
    id: "graph-traversal-discovery-finish-times",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are DFS discovery and finish times, and what are they used for?",
    back: `During a DFS, stamp each vertex with a **discovery time** (when it's first visited) and a **finish time** (when the recursive call for it — having explored all its reachable descendants — returns). These timestamps let you classify every edge encountered:

- **Tree edge**: leads to an undiscovered vertex (part of the DFS tree itself).
- **Back edge**: leads to an ancestor still on the current recursion stack (discovered but not yet finished) — **the signal for a cycle** in a directed graph (see the cycle-detection card).
- **Forward edge**: leads to a descendant that's already finished (only possible in directed graphs).
- **Cross edge**: leads to a vertex in a different DFS subtree entirely, neither ancestor nor descendant (only possible in directed graphs).

Finish times specifically are what **DFS-based topological sort** is built on: sorting vertices by *decreasing* finish time produces a valid topological order (see that card) — a vertex finishes only after everything reachable from it has already finished, which is exactly the dependency ordering topological sort needs.`,
    related: ["graph-traversal-cycle-directed", "graph-traversal-topo-dfs"],
  },
  {
    id: "graph-traversal-bfs-vs-dfs",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "BFS vs. DFS for finding a path through a maze — which would you use, and why?",
    back: `**BFS** if you need the **shortest** path (fewest steps) — its layer-by-layer exploration guarantees the first time you reach the exit is via a minimal-length path. Costs $O(V)$ extra space for the queue and visited set, which can be significant for a large maze (the frontier can be wide).

**DFS** if you just need **any** valid path (or need to enumerate/explore all paths, or are backtracking through constraints) — it uses only $O(\\text{depth})$ space, much cheaper for a maze whose solution paths are long but the state space is wide, and it's the natural fit when the real goal is exhaustive search (see the Backtracking module, Tier 2), not shortest distance.

General rule: BFS answers "what's closest," DFS answers "does a path exist / enumerate all paths," and the space trade-off (O(V) frontier vs. O(depth) stack) often decides it even before shortest-path matters.`,
    related: ["graph-traversal-bfs", "graph-traversal-dfs"],
  },

  // ---------------------------------------------------------- Components
  {
    id: "graph-traversal-connected-components",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you find connected components using BFS or DFS?",
    back: `Iterate over every vertex; whenever you find one that hasn't been visited yet, it must belong to a **new** component — run a full BFS or DFS from it, marking everything reachable as visited and belonging to that component, then continue the outer loop. Each vertex and edge is touched a constant number of times across the whole process, so total cost stays $O(V + E)$ despite the outer loop.

This directly counts the number of connected components (increment a counter each time the outer loop starts a new traversal) and assigns each vertex a component label — the basis for many higher-level checks (e.g. "is this graph fully connected?" is just "does it have exactly one component?").

For **directed** graphs, this same technique (ignoring edge direction) finds **weakly connected** components; **strongly connected** components (where every vertex can reach every other via directed paths) need a different algorithm — Tarjan's or Kosaraju's (Tier 2, Advanced Graph Algorithms).`,
    complexity: {
      structure: "Connected Components (BFS/DFS)",
      operations: [{ op: "Find all components", time: "O(V + E)" }],
    },
    related: ["graph-traversal-bfs", "graph-traversal-dfs"],
  },

  // -------------------------------------------------------- Cycle detect
  {
    id: "graph-traversal-cycle-undirected",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you detect a cycle in an undirected graph?",
    back: `Run DFS, tracking each vertex's **parent** (the vertex you arrived from). If DFS ever encounters an edge to an **already-visited vertex that isn't the current vertex's parent**, that's a cycle — you've found a second way to reach an already-discovered vertex that isn't just "walking back along the edge you just came from."

The parent check is essential specifically because undirected graphs store each edge in both directions (u→v and v→u) — without excluding the parent, every single edge would trigger a false "cycle detected" by immediately walking straight back where you came from.

Equivalently, **Union-Find** works too: process edges one at a time; if both endpoints are already in the same set (find(u) == find(v)), adding this edge would create a cycle — see the Shortest Paths & MST module for Union-Find's own mechanics.`,
    code: `def has_cycle_undirected(graph, n):
    visited = [False] * n
    def dfs(u, parent):
        visited[u] = True
        for v in graph[u]:
            if not visited[v]:
                if dfs(v, u):
                    return True
            elif v != parent:
                return True  # visited, and not where we came from -> cycle
        return False
    return any(not visited[u] and dfs(u, -1) for u in range(n))`,
    pitfall:
      "Forgetting the parent check makes every graph with at least one edge look cyclic, since undirected adjacency lists store both directions of every edge.",
    related: ["graph-traversal-cycle-directed", "graph-traversal-cycle-comparison"],
  },
  {
    id: "graph-traversal-cycle-directed",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you detect a cycle in a directed graph, and why doesn't the undirected technique work?",
    back: `The undirected "visited + parent" check fails on directed graphs: encountering an edge to an already-visited vertex is **not necessarily a cycle** — it might be a perfectly valid **cross edge** or **forward edge** to a vertex that was already fully explored via a different path (see the discovery/finish-time card), which is completely normal in a DAG.

The correct signal is specifically a **back edge**: an edge to a vertex that is an **ancestor still on the current DFS recursion stack** (discovered but not yet finished) — not just "visited at some point in the past." Track this with a second marker distinguishing "currently in progress" (on the recursion stack) from "fully finished":

\`\`\`
WHITE (unvisited) → GRAY (in progress, on stack) → BLACK (finished)
\`\`\`

A cycle exists if and only if DFS ever encounters an edge into a **GRAY** vertex.`,
    code: `def has_cycle_directed(graph, n):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = [WHITE] * n
    def dfs(u):
        color[u] = GRAY
        for v in graph[u]:
            if color[v] == GRAY:
                return True          # back edge -> cycle
            if color[v] == WHITE and dfs(v):
                return True
        color[u] = BLACK
        return False
    return any(color[u] == WHITE and dfs(u) for u in range(n))`,
    pitfall:
      "Using a simple visited/unvisited boolean (the undirected approach) on a directed graph produces false positives on any DAG with a 'diamond' shape (two paths converging on the same vertex) — that convergence is completely legal and not a cycle.",
    related: ["graph-traversal-cycle-undirected", "graph-traversal-cycle-comparison"],
  },
  {
    id: "graph-traversal-cycle-comparison",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Why do directed and undirected graphs need genuinely different cycle-detection techniques?",
    back: `The core reason: in an undirected graph, "already visited" is a strong enough signal (once you exclude the trivial walk-back-to-parent case) because there's only one way edges can create false positives — the immediate parent link, which every edge has since it's stored bidirectionally.

In a directed graph, "already visited" is **too weak** a signal — a directed graph can have many valid edges pointing at an already-fully-explored vertex (forward and cross edges) that have nothing to do with cycles. The distinguishing feature of an actual cycle is specifically that the target vertex is still **on the current path** (an ancestor), which requires the three-color (or recursion-stack-tracking) scheme rather than a plain visited set.

Practical mnemonic: undirected needs to exclude *one specific edge* (the parent); directed needs to distinguish *ancestors-in-progress* from *everything else already seen*.`,
    related: ["graph-traversal-cycle-undirected", "graph-traversal-cycle-directed"],
  },

  // ------------------------------------------------------- Topological sort
  {
    id: "graph-traversal-topo-sort-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is topological sort, and when does it apply?",
    back: `A linear ordering of a **directed acyclic graph (DAG)**'s vertices such that for every directed edge $u \\to v$, $u$ appears **before** $v$ in the ordering. It only exists for DAGs — any graph with a cycle has no valid topological order (a cycle would require some vertex to come both before and after another).

Real uses: task scheduling with dependencies (build systems, package installation — install dependencies before the package that needs them), course prerequisite ordering, spreadsheet formula evaluation order, compiler instruction scheduling.

Two standard algorithms compute it: **Kahn's algorithm** (BFS-based, via in-degrees) and a **DFS-based** approach using finish times (see their own cards) — they produce different (both valid) orderings in general, since multiple topological orders usually exist for the same DAG.`,
    related: ["graph-traversal-topo-kahn", "graph-traversal-topo-dfs"],
  },
  {
    id: "graph-traversal-topo-kahn",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Kahn's algorithm compute a topological sort?",
    back: `Repeatedly peel off vertices with **no remaining unprocessed dependencies** (in-degree 0): compute every vertex's in-degree; put all currently-zero-in-degree vertices in a queue; repeatedly dequeue a vertex, append it to the result, and decrement the in-degree of each of its neighbors — any neighbor that drops to 0 gets enqueued.

If the result contains **fewer than $V$ vertices** when the queue empties, the graph has a **cycle** (some vertices' in-degrees never reached 0, because they were waiting on each other in a cycle) — this doubles as a cycle-detection method for directed graphs, an alternative to the DFS coloring approach.`,
    code: `from collections import deque

def kahn_topo_sort(graph, n):
    indegree = [0] * n
    for u in graph:
        for v in graph[u]:
            indegree[v] += 1
    queue = deque(u for u in range(n) if indegree[u] == 0)
    order = []
    while queue:
        u = queue.popleft()
        order.append(u)
        for v in graph[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                queue.append(v)
    if len(order) != n:
        raise ValueError("graph has a cycle — no topological order exists")
    return order`,
    complexity: {
      structure: "Topological Sort (Kahn's)",
      operations: [{ op: "Sort", time: "O(V + E)" }],
    },
    related: ["graph-traversal-topo-sort-overview", "graph-traversal-topo-dfs"],
  },
  {
    id: "graph-traversal-topo-dfs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the DFS-based topological sort work?",
    back: `Run DFS from every unvisited vertex; each time a vertex **finishes** (all its descendants have been fully explored), push it onto the front of a result list (or append to a list and reverse at the end). The final order is the topological order.

Why this works: a vertex only finishes after everything reachable from it has already finished — so by the time $u$ finishes, every vertex $v$ with an edge $u \\to v$ has *already* finished and been placed *earlier* in the (front-inserted / later-reversed) result, guaranteeing $u$ ends up before $v$.`,
    code: `def dfs_topo_sort(graph, n):
    visited = [False] * n
    order = []
    def dfs(u):
        visited[u] = True
        for v in graph[u]:
            if not visited[v]:
                dfs(v)
        order.append(u)  # append on finish
    for u in range(n):
        if not visited[u]:
            dfs(u)
    return order[::-1]  # reverse finish order`,
    pitfall:
      "Forgetting to reverse the finish-order list is the single most common bug here — appending on finish naturally produces the REVERSE of a valid topological order.",
    related: ["graph-traversal-topo-sort-overview", "graph-traversal-discovery-finish-times", "graph-traversal-topo-comparison"],
  },
  {
    id: "graph-traversal-topo-comparison",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Kahn's algorithm vs. DFS-based topological sort — how do you choose?",
    back: `Both run in $O(V+E)$ and produce a valid (though generally different) ordering. Practical differences:

- **Kahn's** is iterative (BFS-style, no recursion depth concerns), naturally detects cycles as a side effect (leftover vertices with in-degree > 0), and its "process all currently-available zero-dependency items" framing maps directly onto real scheduling intuition (e.g. it can process ties/levels in any order, useful if you want to know which tasks *could* run in parallel at each stage).
- **DFS-based** is often more natural to implement if you're already running DFS for another purpose in the same pass, and generalizes naturally to also computing other DFS-derived properties (finish times, SCC groundwork for Tier 2's Tarjan's/Kosaraju's) in the same traversal.

Neither is "better" in complexity — pick Kahn's when cycle detection or level/parallelism structure matters, DFS-based when you're already deep in a DFS-based pipeline.`,
    related: ["graph-traversal-topo-kahn", "graph-traversal-topo-dfs"],
  },

  // ------------------------------------------------------------ Bipartite
  {
    id: "graph-traversal-bipartiteness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you check if a graph is bipartite using 2-coloring?",
    back: `A graph is bipartite if its vertices can be split into two groups such that every edge connects vertices from **different** groups (no edge stays within one group). Check via BFS or DFS: color the source vertex color A; every neighbor must get the **opposite** color; if you ever find an edge connecting two vertices that already have the **same** color, the graph is not bipartite.

This directly generalizes the observation that **a graph with an odd-length cycle can never be bipartite** — an odd cycle forces two adjacent vertices to eventually receive the same color as you alternate around it, which the algorithm catches directly as a same-color conflict; a bipartite graph, conversely, can only contain even-length cycles (or none).`,
    code: `from collections import deque

def is_bipartite(graph, n):
    color = [None] * n
    for start in range(n):
        if color[start] is not None:
            continue
        color[start] = 0
        queue = deque([start])
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                if color[v] is None:
                    color[v] = 1 - color[u]
                    queue.append(v)
                elif color[v] == color[u]:
                    return False
    return True`,
    complexity: {
      structure: "Bipartiteness Check",
      operations: [{ op: "Check", time: "O(V + E)" }],
    },
    pitfall:
      "Forgetting to restart the coloring process from every unvisited vertex (not just one source) misses disconnected components — a graph can be bipartite within each component individually while the check needs to verify all of them.",
    related: ["graph-traversal-bfs"],
  },
];
