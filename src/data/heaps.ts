import type { Card } from "./types";

const MODULE = "heaps";

export const heapsCards: Card[] = [
  {
    id: "heaps-array-representation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How is a binary heap represented as a plain array, with no explicit pointers?",
    back: `A binary heap is a **complete** binary tree (every level fully filled except possibly the last, which fills left-to-right with no gaps) — that completeness is exactly what lets it be stored densely in an array with no wasted slots and no pointers.

For a node at array index $i$ (0-indexed):
- **Parent**: $\\lfloor (i-1)/2 \\rfloor$
- **Left child**: $2i + 1$
- **Right child**: $2i + 2$

All pure arithmetic, $O(1)$ per lookup — no pointer chasing, and excellent cache locality compared to a pointer-based tree. This array-as-tree trick only works *because* the tree is guaranteed complete; it would leave gaps (wasted space) for an arbitrary, non-complete binary tree.`,
    complexity: {
      structure: "Binary Heap",
      operations: [
        { op: "Find min/max", time: "O(1)", note: "always at index 0" },
        { op: "Insert", time: "O(log n)" },
        { op: "Extract min/max", time: "O(log n)" },
        { op: "Build heap from n elements", time: "O(n)" },
      ],
    },
    pitfall:
      "A heap is only partially ordered — a max-heap guarantees parent ≥ children, NOT that the array is sorted, and NOT that left-child ≤ right-child. Don't assume any ordering between siblings.",
    related: ["heaps-sift-up", "heaps-sift-down"],
  },
  {
    id: "heaps-sift-up",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is sift-up (bubble-up), and when is it used?",
    back: `Used after **inserting** a new element: append it at the end of the array (the next open slot in the complete tree), then repeatedly compare it to its **parent**, swapping upward as long as it violates the heap property (e.g., in a max-heap, as long as it's greater than its parent). Stops when it reaches the root or finds a parent it doesn't need to overtake.

Each swap moves the element up one level, so the number of swaps is bounded by the tree's height: $O(\\log n)$.`,
    code: `def sift_up(heap, i):
    while i > 0:
        parent = (i - 1) // 2
        if heap[i] <= heap[parent]:   # max-heap: stop once in place
            break
        heap[i], heap[parent] = heap[parent], heap[i]
        i = parent`,
    related: ["heaps-array-representation", "heaps-insert-implementation"],
  },
  {
    id: "heaps-sift-down",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is sift-down (bubble-down / heapify), and when is it used?",
    back: `Used after **removing the root** (extract-max/min) and after each step of **build-heap**: take the element currently at a given position (often, the last element moved into the vacated root slot), and repeatedly swap it downward with its **larger child** (max-heap) as long as it violates the heap property, until it either reaches a position where it's ≥ both children or hits a leaf.

Comparing against the *larger* (not just either) child is essential — swapping with the smaller child could still leave the heap property violated against the other child.`,
    code: `def sift_down(heap, i, size):
    while True:
        left, right = 2 * i + 1, 2 * i + 2
        largest = i
        if left < size and heap[left] > heap[largest]:
            largest = left
        if right < size and heap[right] > heap[largest]:
            largest = right
        if largest == i:
            break
        heap[i], heap[largest] = heap[largest], heap[i]
        i = largest`,
    pitfall:
      "Comparing only against the left child (or only checking one child) is the most common sift-down bug — you must find the larger (max-heap) or smaller (min-heap) of BOTH children before deciding whether and where to swap.",
    related: ["heaps-array-representation", "heaps-extract-implementation"],
  },
  {
    id: "heaps-insert-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement heap insertion (push) using sift-up.",
    back: `Append to the end (preserving completeness), then sift up to restore the heap property.`,
    code: `def push(heap, val):
    heap.append(val)
    sift_up(heap, len(heap) - 1)`,
    related: ["heaps-sift-up"],
  },
  {
    id: "heaps-extract-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement extract-max, using sift-down.",
    back: `Swap the root with the last element (so removal doesn't disturb the array's compactness), pop the old root off the end, then sift the new root down into place.`,
    code: `def extract_max(heap):
    if not heap:
        raise IndexError("empty heap")
    max_val = heap[0]
    last = heap.pop()          # remove last element
    if heap:
        heap[0] = last          # move it to the root...
        sift_down(heap, 0, len(heap))  # ...and restore heap property
    return max_val`,
    complexity: {
      structure: "Binary Heap",
      operations: [{ op: "Extract max/min", time: "O(log n)" }],
    },
    related: ["heaps-sift-down"],
  },
  {
    id: "heaps-build-heap-on",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "Why is build-heap O(n), not O(n log n)?",
    back: `Naively, you might expect $n$ insertions × $O(\\log n)$ sift-up each = $O(n \\log n)$. But the standard **build-heap** algorithm doesn't insert one at a time — it calls \`sift_down\` on every node starting from the **last non-leaf node up to the root** (bottom-up), skipping leaves entirely (leaves are trivially valid single-node heaps).

The key insight: sift-down's cost is bounded by the **height of the subtree rooted at that node**, not the height of the whole tree. Most nodes are near the bottom with small subtree heights: a heap of $n$ nodes has roughly $n/2$ nodes at height 0 (leaves, skipped), $n/4$ at height 1, $n/8$ at height 2, and so on. Summing cost across all levels:
$$\\sum_{h=0}^{\\log n} \\frac{n}{2^{h+1}} \\cdot O(h) = O(n) \\sum_{h=0}^{\\log n} \\frac{h}{2^h} = O(n) \\cdot O(1) = O(n)$$
(the series $\\sum h/2^h$ converges to a constant). Most nodes are cheap to sift down (they're near the bottom, so short subtree height) and only a few nodes are expensive (near the root) — that imbalance is exactly what makes the total linear instead of $n \\log n$.`,
    code: `def build_heap(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):  # last non-leaf down to root
        sift_down(arr, i, n)
    return arr`,
    complexity: {
      structure: "Binary Heap",
      operations: [{ op: "Build heap (bottom-up)", time: "O(n)", note: "NOT n·O(log n) — see explanation" }],
    },
    pitfall:
      "Building a heap by calling `push` n times (top-down, one insertion at a time) really IS O(n log n) — the O(n) bound specifically requires the bottom-up sift-down construction, not repeated insertion.",
    related: ["heaps-sift-down", "heaps-array-representation"],
  },
  {
    id: "heaps-heapsort-link",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a binary heap turn into heapsort?",
    back: `Two phases directly built from the operations on this module: **build-heap** in $O(n)$, then repeatedly **extract-max** (swap root to the end of the live region, shrink, sift-down) $n$ times, each $O(\\log n)$. Total: $O(n) + O(n \\log n) = O(n \\log n)$, guaranteed in every case, in-place ($O(1)$ extra space beyond the array itself).

See the Sorting module for the full comparison against quicksort and merge sort — the point here is that heapsort is nothing more than "build a heap, then drain it," using exactly the two primitives (build-heap, extract) covered in this module.`,
    complexity: {
      structure: "Heapsort",
      operations: [{ op: "Best/Average/Worst", time: "O(n log n)", space: "O(1)" }],
    },
    related: ["heaps-build-heap-on", "heaps-extract-implementation"],
  },

  // ---------------------------------------------------- PQ applications
  {
    id: "heaps-priority-queue-adt",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a priority queue, and why is a binary heap the natural way to implement it?",
    back: `An ADT supporting \`insert\` and \`extract-min\` (or extract-max) — unlike a plain queue (FIFO order), elements come out in **priority order**, regardless of insertion order.

A binary heap is the standard backing structure because it's the cheapest structure that supports both operations in $O(\\log n)$ simultaneously: a sorted array gives $O(1)$ extract-min but $O(n)$ insert; an unsorted array gives $O(1)$ insert but $O(n)$ extract-min; a heap gives $O(\\log n)$ for **both**, plus $O(1)$ peek-min and $O(n)$ build from a full collection. That balance is exactly what "priority queue" as a concept needs.`,
    related: ["heaps-array-representation"],
  },
  {
    id: "heaps-pq-dijkstra",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a priority queue drive Dijkstra's algorithm?",
    back: `Dijkstra's repeatedly needs "the unvisited vertex with the smallest known tentative distance so far" — exactly an extract-min operation. A min-heap holding (distance, vertex) pairs gives $O(\\log V)$ extraction of that vertex, and each edge relaxation that improves a distance triggers an $O(\\log V)$ insert (or decrease-key, if the heap variant supports it) of the updated pair.

With a binary heap: $O((V + E) \\log V)$ total. This is precisely why the algorithm's complexity is stated in terms of $\\log V$ — it's the heap's operation cost, not something inherent to graph traversal itself. See the Fibonacci heap card for how a fancier heap changes this bound.`,
    related: ["heaps-fibonacci-heap", "heaps-priority-queue-adt"],
  },
  {
    id: "heaps-pq-kth-largest",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you find the k-th largest element in a stream using a heap, without sorting everything?",
    back: `Maintain a **min-heap of size $k$**: for each incoming element, push it, and if the heap now has more than $k$ elements, pop the minimum. After processing all $n$ elements, the heap's root is the $k$-th largest, and the heap contains exactly the top $k$ elements.

Why a *min*-heap for a *largest*-k problem (the flip that trips people up): the heap only ever needs to answer "what's the smallest thing currently in my top-k set, so I know what to evict if something bigger shows up" — that's a min-query, even though the overall goal is about the largest elements.

Cost: $O(n \\log k)$ — much better than sorting the whole stream ($O(n \\log n)$) when $k \\ll n$, and works on an unbounded/streaming input where you can't even hold everything in memory to sort.`,
    complexity: {
      structure: "k-th Largest (heap-based)",
      operations: [{ op: "Process n elements, k tracked", time: "O(n log k)", space: "O(k)" }],
    },
    pitfall:
      "Using a max-heap of all n elements to find the k-th largest works but costs O(n log n) to build/drain — the size-k min-heap trick is what gets you to O(n log k), a real improvement when k is small.",
    related: ["heaps-priority-queue-adt"],
  },
  {
    id: "heaps-pq-merge-k-sorted",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you merge k sorted lists efficiently using a heap?",
    back: `Naive pairwise merging (merge list 1 with list 2, then merge that with list 3, ...) costs $O(nk)$ for $n$ total elements across $k$ lists, since each of the $k-1$ merge passes touches up to all $n$ elements.

Better: put the **current head of each of the $k$ lists** into a min-heap of size $k$, tagged with which list it came from. Repeatedly extract-min (the globally smallest remaining head), append it to the output, and push the next element from that same list (if any) back into the heap. Each of the $n$ total elements is pushed and popped once, each operation $O(\\log k)$: total $O(n \\log k)$ — a direct improvement over $O(nk)$ whenever $k$ isn't tiny.

This is precisely the k-way merge used in external sorting's merge phase (see the Sorting module).`,
    complexity: {
      structure: "Merge k Sorted Lists",
      operations: [
        { op: "Naive pairwise merge", time: "O(nk)" },
        { op: "Heap-based k-way merge", time: "O(n log k)" },
      ],
    },
    related: ["heaps-priority-queue-adt", "sorting-merge-external-sorting"],
  },
  {
    id: "heaps-pq-task-scheduling",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How are priority queues used in task scheduling?",
    back: `Whenever "run the most urgent thing next" needs to beat plain FIFO order: OS process schedulers (priority by nice-value/deadline), event-driven simulations (process events in timestamp order — a min-heap keyed by event time), and job schedulers (earliest-deadline-first, or highest-priority-first). \`insert\` adds a newly-arrived task, \`extract-min\`/\`extract-max\` pulls the next one to run, both in $O(\\log n)$ regardless of how many tasks are queued.

Real systems often need **decrease-key** too (a task's priority changes after it's already queued, e.g. aging to prevent starvation) — a plain binary heap doesn't support this efficiently (you'd need to know the element's array index, then sift-up/down from there — $O(\\log n)$ if you track indices externally, otherwise $O(n)$ to find it first). This is one of the motivations for binomial/Fibonacci heaps in theoretical contexts (see those cards).`,
    related: ["heaps-priority-queue-adt", "heaps-fibonacci-heap"],
  },

  // -------------------------------------------------------------- d-ary
  {
    id: "heaps-d-ary-heaps",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a d-ary heap, and what does it trade off against a binary heap?",
    back: `A generalization where each node has **d children** instead of 2, still stored densely in an array (parent of index $i$ is $\\lfloor (i-1)/d \\rfloor$, children are $di+1, ..., di+d$). Larger $d$ makes the tree **shorter** — height $O(\\log_d n)$ instead of $O(\\log_2 n)$ — which speeds up operations dominated by height (like sift-up, and decrease-key if supported), but each **sift-down** now must compare against up to $d$ children instead of 2, so per-level work grows.

Net effect: **insert/decrease-key** become faster ($O(\\log_d n)$, fewer levels to traverse), while **extract-min** stays roughly the same order or can get slightly worse (must scan $d$ children per level: $O(d \\log_d n)$). This trade-off makes d-ary heaps a good choice specifically for workloads dominated by insertions and decrease-key calls relative to extractions — e.g. some Dijkstra/Prim implementations use a 4-ary heap for exactly this reason.`,
    complexity: {
      structure: "d-ary Heap",
      operations: [
        { op: "Insert / decrease-key", time: "O(logd n)", note: "fewer levels than binary (d=2)" },
        { op: "Extract min", time: "O(d · logd n)", note: "must scan d children per level" },
      ],
    },
    related: ["heaps-array-representation"],
  },

  // --------------------------------------------------- Binomial/Fibonacci
  {
    id: "heaps-binomial-heap",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a binomial heap, and what does it improve on over a plain binary heap?",
    back: `A binomial heap is a **collection (forest) of binomial trees**, each satisfying the heap property, where the sizes present correspond to the binary representation of $n$ (e.g. $n=13=8+4+1$ means trees of size 8, 4, and 1 — one binomial tree per set bit). A binomial tree of order $k$ has exactly $2^k$ nodes and height $k$.

The headline improvement over a plain binary heap: **merging two heaps** is $O(\\log n)$ instead of $O(n)$ — because merging is structurally like binary addition (combining two binomial trees of the same order into one of the next order up, carrying just like adding binary digits), it never needs to touch every element, unlike a plain array-heap merge which requires rebuilding from scratch.

This matters for algorithms that need to repeatedly merge priority queues (e.g. certain parallel/distributed algorithms, or theoretical analyses of graph algorithms needing meldable heaps) — a capability a plain binary heap doesn't efficiently support at all.`,
    complexity: {
      structure: "Binomial Heap",
      operations: [
        { op: "Insert", time: "O(log n)", note: "O(1) amortized" },
        { op: "Find min", time: "O(log n)", note: "O(1) if min pointer cached" },
        { op: "Extract min", time: "O(log n)" },
        { op: "Merge", time: "O(log n)" },
        { op: "Decrease-key", time: "O(log n)" },
      ],
    },
    related: ["heaps-fibonacci-heap", "heaps-heap-variants-comparison"],
  },
  {
    id: "heaps-fibonacci-heap",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What makes a Fibonacci heap special, and why does it matter for Dijkstra's theoretical bound?",
    back: `A Fibonacci heap achieves $O(1)$ **amortized** insert, $O(1)$ amortized merge, and — the headline feature — $O(1)$ **amortized decrease-key**, by being extremely "lazy": merging heaps is just splicing root lists together (no immediate consolidation), and structure is only cleaned up (trees consolidated by degree) lazily, during extract-min. This laziness is precisely what a binomial heap's more eager, always-consolidated structure doesn't allow — the deferred work is what makes decrease-key so cheap.

**Why it matters for Dijkstra**: the standard binary-heap implementation does $O(V)$ extract-mins and $O(E)$ decrease-keys, each $O(\\log V)$, giving $O((V+E)\\log V)$. With a Fibonacci heap, decrease-key drops to $O(1)$ amortized, so the bound becomes $O(V \\log V + E)$ — asymptotically better for **dense graphs** where $E$ is much larger than $V$ (e.g. $E = O(V^2)$), since the $E$ term is no longer multiplied by $\\log V$.

In practice, Fibonacci heaps are rarely used — large constant factors make binary (or d-ary) heaps faster for realistic graph sizes. They matter primarily for the **theoretical** asymptotic bound, not as a practical engineering choice.`,
    complexity: {
      structure: "Fibonacci Heap",
      operations: [
        { op: "Insert", time: "O(1) amortized" },
        { op: "Find min", time: "O(1)" },
        { op: "Extract min", time: "O(log n) amortized" },
        { op: "Merge", time: "O(1) amortized" },
        { op: "Decrease-key", time: "O(1) amortized" },
      ],
    },
    pitfall:
      "Fibonacci heaps are a textbook/theoretical tool more than a practical one — their large constant factors mean binary or d-ary heaps usually win in real wall-clock time despite the worse asymptotic bound, which surprises people expecting the 'better Big-O' structure to always be the right engineering choice.",
    related: ["heaps-binomial-heap", "heaps-pq-dijkstra", "heaps-heap-variants-comparison"],
  },
  {
    id: "heaps-heap-variants-comparison",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Binary heap vs. binomial heap vs. Fibonacci heap — complexity comparison for the operations that differ.",
    back: `| | Binary Heap | Binomial Heap | Fibonacci Heap |
|---|---|---|---|
| Insert | O(log n) | O(log n) amortized O(1) | O(1) amortized |
| Extract-min | O(log n) | O(log n) | O(log n) amortized |
| Merge two heaps | O(n) | O(log n) | O(1) amortized |
| Decrease-key | O(log n)* | O(log n) | O(1) amortized |

*assuming you already have a direct reference/index to the element — otherwise O(n) to find it first, for any of these.

The practical takeaway: reach for a **binary heap** by default (simplest, best constants, cache-friendly array storage); reach for **binomial** when you genuinely need efficient merging of two priority queues; **Fibonacci** heaps mostly matter for citing the theoretically optimal bound on algorithms like Dijkstra/Prim (O(E + V log V)) rather than for actual implementation.`,
    related: ["heaps-binomial-heap", "heaps-fibonacci-heap"],
  },

  // ---------------------------------------------------------- Code trace
  {
    id: "heaps-sift-down-trace",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "Max-heap array `[3, 8, 5, 1, 2]` — index 0 (value 3) violates the heap property. Trace sift_down(heap, 0, 5).",
    back: `Start: \`i=0\`, value 3. Children: left = index 1 (value 8), right = index 2 (value 5). Larger child is index 1 (8 > 5, and 8 > 3). Swap indices 0 and 1: array becomes \`[8, 3, 5, 1, 2]\`, \`i\` moves to 1.

Now \`i=1\`, value 3. Children: left = index 3 (value 1), right = index 4 (value 2). Larger child is index 4 (value 2 > value 1, and 2 > 3? **No** — 2 < 3). Since neither child exceeds the current value 3, \`largest == i\`, loop stops.

Final array: \`[8, 3, 5, 1, 2]\` — a valid max-heap (root 8 ≥ children 3, 5; node at index 1, value 3, ≥ its children 1, 2).`,
    related: ["heaps-sift-down"],
  },
];
