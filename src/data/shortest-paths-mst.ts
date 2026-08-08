import type { Card } from "./types";

const MODULE = "shortest-paths-mst";

export const shortestPathsMstCards: Card[] = [
  // ------------------------------------------------------------ Dijkstra
  {
    id: "shortest-paths-mst-dijkstra-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Dijkstra's algorithm work, and why is its greedy choice correct?",
    back: `Maintains a set of "finalized" vertices with known-correct shortest distances, and repeatedly picks the **unfinalized vertex with the smallest tentative distance**, finalizes it, then **relaxes** its outgoing edges (updates neighbors' tentative distances if a shorter path through this vertex is found).

Why greedy works here: once you pick the unfinalized vertex $u$ with the globally smallest tentative distance, **no other path to $u$ can be shorter** — any such path would have to go through some other unfinalized vertex $w$, but $w$'s tentative distance is already $\\geq u$'s (that's why $u$ was picked), and edge weights are non-negative, so routing through $w$ can only add more distance, never less. This is exactly the assumption that breaks with negative weights (see that card).`,
    complexity: {
      structure: "Dijkstra's Algorithm",
      operations: [
        { op: "Binary heap PQ", time: "O((V + E) log V)" },
        { op: "Fibonacci heap PQ", time: "O(E + V log V)", note: "theoretical bound, rarely used in practice" },
      ],
    },
    related: ["shortest-paths-mst-dijkstra-implementation", "shortest-paths-mst-dijkstra-negative-weights"],
  },
  {
    id: "shortest-paths-mst-dijkstra-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement Dijkstra's algorithm using a binary heap priority queue.",
    back: `A binary heap doesn't support efficient decrease-key, so the standard workaround is to just **push a new entry** on every improvement and **skip stale entries** when popped (check if the popped distance is still the current best-known distance for that vertex).`,
    code: `import heapq

def dijkstra(graph, source):
    dist = {source: 0}
    pq = [(0, source)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist.get(u, float('inf')):
            continue  # stale entry, a better one was already processed
        for v, weight in graph[u]:
            new_dist = d + weight
            if new_dist < dist.get(v, float('inf')):
                dist[v] = new_dist
                heapq.heappush(pq, (new_dist, v))
    return dist`,
    pitfall:
      "Skipping the staleness check (`if d > dist.get(u, inf): continue`) doesn't break correctness (the algorithm still terminates with right answers) but wastes work re-relaxing edges from an already-finalized vertex via outdated heap entries.",
    related: ["shortest-paths-mst-dijkstra-overview"],
  },
  {
    id: "shortest-paths-mst-dijkstra-negative-weights",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does Dijkstra's algorithm break with negative edge weights?",
    back: `Dijkstra's greedy step assumes that once a vertex is finalized (popped with the smallest tentative distance), its distance can never improve later. Negative weights violate this: a vertex could be finalized with a "shortest" distance, and *afterward* a negative edge from some other, later-processed vertex could offer an even shorter path to it — but Dijkstra never revisits finalized vertices, so it produces a wrong (too large) answer without any error or warning.

**Concrete counterexample**: vertices A, B, C. Edges: A→B weight 5, A→C weight 2, C→B weight -4. Dijkstra finalizes A (dist 0), then C (dist 2, the next smallest), then finalizes B at dist 5 (from A→B) *before* ever considering relaxing B via C (dist 2 + (-4) = -2, which is actually shorter) — because B looked "closer" via the direct edge at the time it was popped. The true shortest A→B distance is $-2$, but Dijkstra reports $5$.

For graphs with negative weights (but no negative cycles), use **Bellman-Ford** instead.`,
    pitfall:
      "Dijkstra doesn't crash or detect the problem on negative weights — it silently returns an incorrect (too-large) distance, which is more dangerous than an outright error.",
    related: ["shortest-paths-mst-bellman-ford"],
  },

  // -------------------------------------------------------- Bellman-Ford
  {
    id: "shortest-paths-mst-bellman-ford",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Bellman-Ford work, and why does it handle negative weights correctly?",
    back: `Relax **every edge** in the graph, repeated for **$V-1$ rounds** (where $V$ is the vertex count). Relaxing edge $(u,v,w)$ means: if $dist[u] + w < dist[v]$, update $dist[v]$.

Why $V-1$ rounds suffice: any shortest path between two vertices in a graph with no negative cycle uses **at most $V-1$ edges** (a simple path can't repeat a vertex, so it has at most $V-1$ edges). Each full round of relaxing all edges is guaranteed to "extend" the correctly-computed shortest-path prefix by at least one more edge along every optimal path simultaneously, so after $V-1$ rounds, every shortest path — however many edges it needed, up to $V-1$ — has been fully computed, **regardless of negative weights**, since (unlike Dijkstra) it never assumes a vertex's distance is final until all rounds complete.`,
    code: `def bellman_ford(edges, n, source):
    dist = [float('inf')] * n
    dist[source] = 0
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    return dist`,
    complexity: {
      structure: "Bellman-Ford",
      operations: [{ op: "Shortest paths from source", time: "O(V · E)" }],
    },
    pitfall:
      "Bellman-Ford is significantly slower than Dijkstra (O(VE) vs O((V+E) log V)) — only reach for it when negative weights are actually possible in your graph; don't default to it 'to be safe.'",
    related: ["shortest-paths-mst-bellman-ford-negative-cycle", "shortest-paths-mst-dijkstra-vs-bellman-ford"],
  },
  {
    id: "shortest-paths-mst-bellman-ford-negative-cycle",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Bellman-Ford detect negative cycles?",
    back: `Run one **extra**, $V$-th round of edge relaxation after the normal $V-1$ rounds. If **any** edge can still be relaxed (distance still improves) in this extra round, a negative cycle must be reachable from the source — because in a graph with no negative cycle, all shortest distances are already final and correct after $V-1$ rounds (see the previous card), so any further improvement is only possible if a cycle keeps reducing some distance without bound.

This matters practically wherever "shortest path" needs to be well-defined at all — a negative cycle reachable from the source and able to reach the destination makes the shortest path **undefined** (infinitely negative, by looping the cycle forever), so detecting this case is often as important as computing the distances themselves (e.g. arbitrage detection in currency exchange graphs, where a negative cycle in log-exchange-rate weights represents a genuine arbitrage opportunity).`,
    code: `def has_negative_cycle(edges, n, source):
    dist = [float('inf')] * n
    dist[source] = 0
    for i in range(n):
        updated = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                updated = True
        if i == n - 1 and updated:
            return True   # a change still happened on round V -> negative cycle
    return False`,
    related: ["shortest-paths-mst-bellman-ford"],
  },
  {
    id: "shortest-paths-mst-dijkstra-vs-bellman-ford",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Dijkstra vs. Bellman-Ford — when do you actually need Bellman-Ford's extra generality?",
    back: `| | Dijkstra | Bellman-Ford |
|---|---|---|
| Negative weights | Breaks (silently wrong) | Handles correctly |
| Negative cycle detection | No | Yes (extra round) |
| Time complexity | O((V+E) log V) with a heap | O(V·E) |
| Approach | Greedy, one vertex finalized at a time | Brute-force relax-everything, repeated |

Use Dijkstra whenever weights are guaranteed non-negative (the overwhelmingly common case — physical distances, non-negative costs) for its better complexity. Reach for Bellman-Ford specifically when negative weights are possible (e.g. modeling gains as negative costs, arbitrage detection, certain flow-network reductions) or when you need negative-cycle detection as a feature, not just a shortest-path answer.`,
    related: ["shortest-paths-mst-dijkstra-overview", "shortest-paths-mst-bellman-ford"],
  },

  // ------------------------------------------------------- Floyd-Warshall
  {
    id: "shortest-paths-mst-floyd-warshall",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Floyd-Warshall compute all-pairs shortest paths?",
    back: `A dynamic program over an incrementally-allowed set of **intermediate** vertices: $dist[i][j]$ is refined through $V$ rounds, where round $k$ asks "does routing through vertex $k$ as an intermediate stop improve the current best-known $i \\to j$ distance?" — $dist[i][j] = \\min(dist[i][j],\\ dist[i][k] + dist[k][j])$.

After considering all $V$ vertices as potential intermediates, $dist[i][j]$ holds the true shortest distance between every pair. The elegance: no priority queue, no per-source repetition — three nested loops directly compute the full $V \\times V$ distance matrix, and it correctly handles negative edge weights (though not negative cycles — those must be checked separately, e.g. via $dist[i][i] < 0$ after completion).`,
    code: `def floyd_warshall(dist, n):
    # dist[i][j] initialized to edge weight or inf; dist[i][i] = 0
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist`,
    complexity: {
      structure: "Floyd-Warshall",
      operations: [{ op: "All-pairs shortest paths", time: "O(V³)", space: "O(V²)" }],
    },
    pitfall:
      "The loop order matters: k (the intermediate vertex being newly allowed) must be the OUTERMOST loop — dist[i][k] and dist[k][j] must reflect the state 'using only intermediates up to k-1' when computing round k, which requires k fixed across the full i,j sweep.",
    related: ["shortest-paths-mst-floyd-warshall-vs-dijkstra"],
  },
  {
    id: "shortest-paths-mst-floyd-warshall-vs-dijkstra",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Floyd-Warshall vs. running Dijkstra from every vertex — when is each the right choice for all-pairs shortest paths?",
    back: `Running Dijkstra from every one of the $V$ vertices costs $O(V \\cdot (V+E)\\log V)$ total. Floyd-Warshall costs $O(V^3)$ flat, regardless of $E$.

- **Sparse graph** ($E = O(V)$ or $O(V \\log V)$): repeated Dijkstra is $O(V^2 \\log V)$-ish, beating Floyd-Warshall's $O(V^3)$.
- **Dense graph** ($E = O(V^2)$): repeated Dijkstra becomes $O(V^3 \\log V)$ — *worse* than Floyd-Warshall's flat $O(V^3)$, and Floyd-Warshall's much simpler implementation (no priority queue) wins outright.
- **Negative weights, no negative cycles**: repeated Dijkstra doesn't work at all (see that card); Floyd-Warshall handles it natively, or you'd need repeated Bellman-Ford ($O(V^2 E)$, generally worse than Floyd-Warshall).

Floyd-Warshall's simplicity and negative-weight tolerance make it the practical default for all-pairs problems unless the graph is clearly sparse and non-negative, where repeated Dijkstra wins on complexity.`,
    related: ["shortest-paths-mst-floyd-warshall", "shortest-paths-mst-dijkstra-overview"],
  },

  // --------------------------------------------------------------- MST
  {
    id: "shortest-paths-mst-mst-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What problem does a Minimum Spanning Tree solve?",
    back: `Given a connected, weighted, undirected graph, find a subset of edges that **connects all vertices** (a spanning tree — no cycles, exactly $V-1$ edges) with the **minimum possible total edge weight**.

Real uses: network design (minimum cable/wire needed to connect all sites), clustering (removing the most expensive edges of an MST splits the graph into natural clusters), approximation algorithms for harder problems (e.g. a 2-approximation for metric TSP is built from an MST).

Both standard algorithms (Kruskal's, Prim's) rely on the **cut property**: for any partition of vertices into two non-empty sets, the minimum-weight edge crossing that partition is guaranteed to be in *some* MST — this is what justifies greedily picking cheap edges without needing to look ahead.`,
    related: ["shortest-paths-mst-kruskal", "shortest-paths-mst-prim"],
  },
  {
    id: "shortest-paths-mst-kruskal",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Kruskal's algorithm build an MST?",
    back: `**Edge-centric**: sort all edges by weight ascending. Process them in order, adding an edge to the MST **unless it would create a cycle** (checked via Union-Find — if both endpoints are already in the same component, skip it). Stop once $V-1$ edges have been added.

This is a direct application of the cut property: at each step, the cheapest remaining edge that doesn't create a cycle is guaranteed safe to add — it's the minimum-weight edge crossing the cut between "the component this edge would merge" and everything else.`,
    complexity: {
      structure: "Kruskal's Algorithm",
      operations: [{ op: "Build MST", time: "O(E log E)", note: "dominated by sorting edges" }],
    },
    related: ["shortest-paths-mst-kruskal-implementation", "shortest-paths-mst-union-find"],
  },
  {
    id: "shortest-paths-mst-kruskal-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement Kruskal's algorithm using Union-Find.",
    back: `Sort edges once, then a single linear pass with Union-Find cycle checks.`,
    code: `def kruskal(n, edges):  # edges: list of (weight, u, v)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]  # path compression
            x = parent[x]
        return x

    mst_weight = 0
    mst_edges = []
    for w, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            mst_weight += w
            mst_edges.append((u, v, w))
    return mst_weight, mst_edges`,
    related: ["shortest-paths-mst-kruskal", "shortest-paths-mst-path-compression"],
  },
  {
    id: "shortest-paths-mst-prim",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Prim's algorithm build an MST?",
    back: `**Vertex-centric**: start from an arbitrary vertex, growing a single connected tree by repeatedly adding the **cheapest edge that connects a vertex already in the tree to one not yet in the tree** — structurally very similar to Dijkstra's, using a priority queue of "frontier" edges instead of tentative distances.

Also justified by the cut property: the cut is always "current tree vs. everything else," and the minimum-weight edge crossing that specific cut is always safe to add.`,
    code: `import heapq

def prim(graph, n, source=0):
    visited = [False] * n
    pq = [(0, source)]
    mst_weight = 0
    while pq:
        w, u = heapq.heappop(pq)
        if visited[u]:
            continue
        visited[u] = True
        mst_weight += w
        for v, weight in graph[u]:
            if not visited[v]:
                heapq.heappush(pq, (weight, v))
    return mst_weight`,
    complexity: {
      structure: "Prim's Algorithm",
      operations: [{ op: "Build MST (binary heap)", time: "O(E log V)" }],
    },
    related: ["shortest-paths-mst-mst-overview", "shortest-paths-mst-kruskal-vs-prim"],
  },
  {
    id: "shortest-paths-mst-kruskal-vs-prim",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Kruskal's vs. Prim's — when do you choose one over the other?",
    back: `| | Kruskal's | Prim's |
|---|---|---|
| Approach | Edge-centric (global sort) | Vertex-centric (grow one tree) |
| Complexity | O(E log E) | O(E log V) with a binary heap |
| Best for | Sparse graphs, or edges already available as a flat list | Dense graphs (where E ≈ V²) |
| Natural data structure | Union-Find | Priority queue (like Dijkstra) |

For **sparse** graphs, $E \\approx V$, so both run similarly, but Kruskal's is often simpler to reason about (sort once, process greedily) if edges are already given as a flat list. For **dense** graphs ($E \\approx V^2$), Prim's with a Fibonacci heap ($O(E + V \\log V)$) or even a plain adjacency-matrix version ($O(V^2)$, no heap needed) tends to win, since Kruskal's $O(E \\log E)$ sort becomes the bottleneck at $E = O(V^2)$.

In practice, either works fine for most graph sizes — the choice matters most at scale or when one representation (edge list vs. adjacency list/matrix) is already the natural fit for the rest of your pipeline.`,
    related: ["shortest-paths-mst-kruskal", "shortest-paths-mst-prim"],
  },

  // ------------------------------------------------------------ Union-Find
  {
    id: "shortest-paths-mst-union-find",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is Union-Find (Disjoint Set Union), and what do find/union do?",
    back: `A structure tracking a partition of elements into disjoint sets, supporting two operations: **find(x)** — return a representative ("root") identifying which set $x$ belongs to, and **union(x, y)** — merge the sets containing $x$ and $y$ into one.

Represented as a forest: each element points to a parent (via an array), and a set's representative is whichever element is its own parent (a self-loop root). find(x) walks parent pointers up to the root; union(x, y) finds both roots and points one root at the other.

Two crucial optimizations — **path compression** and **union by rank/size** (see their own cards) — take this from a naive $O(n)$-worst-case-per-operation structure to near-$O(1)$ amortized. Central use: cycle detection during MST construction (Kruskal's) and general "are these two things connected" queries (network connectivity, image processing's connected-component labeling, Kruskal's-style clustering).`,
    complexity: {
      structure: "Union-Find",
      operations: [
        { op: "Find (naive)", time: "O(n) worst case", note: "degenerate chain" },
        { op: "Find/Union (path compression + union by rank)", time: "O(α(n)) amortized", note: "α = inverse Ackermann, effectively constant" },
      ],
    },
    related: ["shortest-paths-mst-path-compression", "shortest-paths-mst-union-by-rank"],
  },
  {
    id: "shortest-paths-mst-path-compression",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does path compression speed up Union-Find's find operation?",
    back: `While walking up to find a set's root, **re-point every visited node directly to the root** (flattening the tree) before returning. The next find on any of those nodes is then $O(1)$ — no need to re-walk the chain.

This alone (even without union by rank) provably gives $O(\\log n)$ amortized find; combined with union by rank/size, the bound tightens to $O(\\alpha(n))$ — the inverse Ackermann function, which grows so slowly it's less than 5 for any $n$ that could ever be represented in physical memory, making it effectively constant time in practice.`,
    code: `def find(parent, x):
    root = x
    while parent[root] != root:
        root = parent[root]
    while parent[x] != root:        # second pass: compress path
        parent[x], x = root, parent[x]
    return root

# Or the common compact recursive form:
def find_recursive(parent, x):
    if parent[x] != x:
        parent[x] = find_recursive(parent, parent[x])  # compress on the way back up
    return parent[x]`,
    related: ["shortest-paths-mst-union-find", "shortest-paths-mst-union-by-rank"],
  },
  {
    id: "shortest-paths-mst-union-by-rank",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does union by rank (or size) prevent Union-Find trees from becoming tall chains?",
    back: `Without it, a naive union always attaches one root under the other in a fixed (e.g. arbitrary) order — repeatedly unioning this way can build a long chain (effectively a linked list), degrading find to $O(n)$.

**Union by rank**: track each root's approximate tree height ("rank"); when unioning two sets, always attach the **shorter** tree under the **taller** one's root (if equal, pick either and increment the resulting rank by 1). This keeps tree height bounded to $O(\\log n)$ even without path compression.

**Union by size** is a common simpler-to-reason-about variant: track the number of elements in each set instead of height, always attaching the smaller set under the larger one's root — gives the same $O(\\log n)$ height guarantee via a slightly different (and arguably more intuitive) accounting.

Combined with path compression, either variant achieves the near-constant $O(\\alpha(n))$ amortized bound — neither optimization alone gets you there as tightly as the two together.`,
    pitfall:
      "Always attaching by a fixed rule (e.g. 'always make the second argument's root the parent') rather than by actual rank/size defeats the purpose entirely — a sequence of unions can then still build an O(n)-tall chain.",
    related: ["shortest-paths-mst-union-find", "shortest-paths-mst-path-compression"],
  },
];
