import type { Card } from "./types";

const MODULE = "specialized-trees";

export const specializedTreesCards: Card[] = [
  // -------------------------------------------------------------- Tries
  {
    id: "specialized-trees-trie-structure",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a trie, and how does insert/search work?",
    back: `A tree where each **edge** represents one character, and a path from the root spells out a prefix — so all strings sharing a prefix share the same path down to where they diverge. Each node holds a map/array of child pointers (one per possible next character) and a boolean flag marking "a word ends here."

**Insert**: walk from the root, one character at a time, creating a child node whenever the needed edge doesn't yet exist; mark the final node as end-of-word. **Search**: walk the same way; if you ever need an edge that doesn't exist, the string isn't present; if you reach the end of the string, check the end-of-word flag (walking successfully to a node doesn't mean the *exact* string was inserted — it might only be a prefix of something else that was).`,
    complexity: {
      structure: "Trie",
      operations: [
        { op: "Insert", time: "O(L)", space: "O(L) new nodes worst case", note: "L = string length" },
        { op: "Search (exact)", time: "O(L)" },
        { op: "Prefix search", time: "O(P)", note: "P = prefix length, plus output size to enumerate matches" },
      ],
    },
    pitfall:
      "Reaching the last character's node during search doesn't mean the word was inserted — it might just be a prefix of a longer inserted word. Always check the end-of-word flag, not just 'did the walk succeed.'",
    related: ["specialized-trees-trie-implementation", "specialized-trees-trie-use-cases"],
  },
  {
    id: "specialized-trees-trie-implementation",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement a trie with insert, exact search, and prefix search (startsWith).",
    back: `A dict-of-dicts is the simplest Python representation — no fixed alphabet size assumption needed.`,
    code: `class Trie:
    def __init__(self):
        self.children = {}
        self.is_word = False

    def insert(self, word):
        node = self
        for ch in word:
            node = node.children.setdefault(ch, Trie())
        node.is_word = True

    def _walk(self, prefix):
        node = self
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word

    def starts_with(self, prefix):
        return self._walk(prefix) is not None`,
    related: ["specialized-trees-trie-structure"],
  },
  {
    id: "specialized-trees-trie-use-cases",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "Where are tries used in practice?",
    back: `- **Autocomplete / typeahead**: walk to the node matching the user's typed prefix in $O(P)$, then DFS from there to enumerate all completions — far better than filtering a full word list by prefix on every keystroke.
- **IP routing (longest prefix match)**: router forwarding tables use a trie over binary IP address bits; finding the most specific matching route is a walk down the trie tracking the deepest node that's a valid route entry, which is exactly a "find the longest matching prefix" trie operation.
- **Spell-checkers / dictionary lookups**: exact and near-match (edit-distance-bounded) lookups against a large word list.
- **Compressed variants (radix trees / Patricia tries)** collapse chains of single-child nodes into one edge labeled with a whole substring, trading a bit of insert complexity for much better space efficiency on sparse tries — used in real routing tables and some in-memory key-value stores.`,
    related: ["specialized-trees-trie-structure"],
  },

  // --------------------------------------------------------- Segment trees
  {
    id: "specialized-trees-segment-tree-structure",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a segment tree, and how does it support range queries?",
    back: `A binary tree built over an array, where each node represents a **contiguous range** of the array and stores an aggregate (sum, min, max, ...) over that range. The root covers the whole array; each node's two children cover its left and right halves; leaves cover single elements.

**Range query** on $[l, r]$: instead of scanning all elements, decompose $[l, r]$ into at most $O(\\log n)$ tree nodes whose ranges exactly tile it — recursively descend: if a node's range is entirely inside $[l,r]$, use its precomputed aggregate directly (no need to go deeper); if entirely outside, skip it; if partially overlapping, recurse into both children. Because the tree has $O(\\log n)$ height and each level contributes at most a constant number of "partially overlapping" nodes, the whole query is $O(\\log n)$ instead of $O(n)$.`,
    complexity: {
      structure: "Segment Tree",
      operations: [
        { op: "Build", time: "O(n)" },
        { op: "Range query", time: "O(log n)" },
        { op: "Point update", time: "O(log n)" },
      ],
    },
    related: ["specialized-trees-segment-tree-implementation", "specialized-trees-fenwick-vs-segment"],
  },
  {
    id: "specialized-trees-segment-tree-implementation",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement a segment tree for range-sum queries with point updates, using an array representation.",
    back: `Same array-as-complete-binary-tree indexing trick as a binary heap (node $i$'s children are $2i+1, 2i+2$), sized $4n$ to safely hold a non-power-of-2-sized tree.`,
    code: `class SegmentTree:
    def __init__(self, arr):
        n = len(arr)
        self.n = n
        self.tree = [0] * (4 * n)
        self._build(arr, 0, 0, n - 1)

    def _build(self, arr, node, lo, hi):
        if lo == hi:
            self.tree[node] = arr[lo]
            return
        mid = (lo + hi) // 2
        self._build(arr, 2*node+1, lo, mid)
        self._build(arr, 2*node+2, mid+1, hi)
        self.tree[node] = self.tree[2*node+1] + self.tree[2*node+2]

    def query(self, l, r, node=0, lo=0, hi=None):
        if hi is None:
            hi = self.n - 1
        if r < lo or hi < l:
            return 0                        # no overlap
        if l <= lo and hi <= r:
            return self.tree[node]          # fully covered
        mid = (lo + hi) // 2
        return (self.query(l, r, 2*node+1, lo, mid) +
                self.query(l, r, 2*node+2, mid+1, hi))

    def update(self, idx, val, node=0, lo=0, hi=None):
        if hi is None:
            hi = self.n - 1
        if lo == hi:
            self.tree[node] = val
            return
        mid = (lo + hi) // 2
        if idx <= mid:
            self.update(idx, val, 2*node+1, lo, mid)
        else:
            self.update(idx, val, 2*node+2, mid+1, hi)
        self.tree[node] = self.tree[2*node+1] + self.tree[2*node+2]`,
    pitfall:
      "Swapping the aggregate function (sum -> min/max) is the ONLY change needed to repurpose this exact structure for range-min or range-max queries — the tree shape and traversal logic are identical, only the combine step at each node differs.",
    related: ["specialized-trees-segment-tree-structure"],
  },
  {
    id: "specialized-trees-lazy-propagation",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "Why does range UPDATE need lazy propagation, and how does it work?",
    back: `A plain segment tree supports $O(\\log n)$ **point** updates cheaply, but a naive **range** update (e.g. "add 5 to every element in $[l,r]$") would need to update every affected leaf and its ancestors — up to $O(n)$ nodes, defeating the whole point of the tree.

**Lazy propagation** fixes this: when a range update fully covers a node's range, don't recurse into its children immediately — instead, update that node's aggregate directly (in $O(1)$, since you know exactly how the aggregate changes, e.g. sum += 5 × range_length) and stash a **pending update marker** ("lazy tag") on the node, deferring the update to its children until they're actually needed. The next time a query or update needs to descend into that node's children, first **push down** the pending tag (apply it to both children, tag them lazily too, then clear the parent's tag) before proceeding.

This keeps both range update and range query at $O(\\log n)$ — the deferred work is only ever paid for by the specific future operations that actually need to look inside that subtree, never eagerly for the whole range.`,
    complexity: {
      structure: "Segment Tree (Lazy Propagation)",
      operations: [
        { op: "Range update", time: "O(log n)" },
        { op: "Range query", time: "O(log n)" },
      ],
    },
    pitfall:
      "Forgetting to push down a pending lazy tag before reading or recursing into a node's children is the single most common lazy-propagation bug — it silently returns stale aggregates for children that haven't actually received their parent's pending update yet.",
    related: ["specialized-trees-lazy-propagation-implementation"],
  },
  {
    id: "specialized-trees-lazy-propagation-implementation",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement range-add-update / range-sum-query with lazy propagation.",
    back: `A second array \`lazy\` parallel to \`tree\` holds each node's pending-but-not-yet-pushed-down update.`,
    code: `class LazySegTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (4 * n)
        self.lazy = [0] * (4 * n)

    def _push_down(self, node, lo, hi):
        if self.lazy[node] == 0:
            return
        mid = (lo + hi) // 2
        for child, (clo, chi) in ((2*node+1, (lo, mid)), (2*node+2, (mid+1, hi))):
            self.lazy[child] += self.lazy[node]
            self.tree[child] += self.lazy[node] * (chi - clo + 1)
        self.lazy[node] = 0

    def update_range(self, l, r, val, node=0, lo=0, hi=None):
        if hi is None:
            hi = self.n - 1
        if r < lo or hi < l:
            return
        if l <= lo and hi <= r:
            self.tree[node] += val * (hi - lo + 1)
            self.lazy[node] += val
            return
        self._push_down(node, lo, hi)
        mid = (lo + hi) // 2
        self.update_range(l, r, val, 2*node+1, lo, mid)
        self.update_range(l, r, val, 2*node+2, mid+1, hi)
        self.tree[node] = self.tree[2*node+1] + self.tree[2*node+2]

    def query(self, l, r, node=0, lo=0, hi=None):
        if hi is None:
            hi = self.n - 1
        if r < lo or hi < l:
            return 0
        if l <= lo and hi <= r:
            return self.tree[node]
        self._push_down(node, lo, hi)
        mid = (lo + hi) // 2
        return self.query(l, r, 2*node+1, lo, mid) + self.query(l, r, 2*node+2, mid+1, hi)`,
    related: ["specialized-trees-lazy-propagation"],
  },

  // ----------------------------------------------------------- Fenwick
  {
    id: "specialized-trees-fenwick-tree",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a Fenwick tree (Binary Indexed Tree), and how does the i & -i trick work?",
    back: `A compact array-based structure supporting **prefix sums** and **point updates**, both in $O(\\log n)$, using far less code and overhead than a segment tree. Each index $i$ in the internal array is responsible for the sum of a specific range ending at $i$, whose length is determined by $i$'s **lowest set bit** — extracted via the bit trick \`i & -i\` (in two's complement, \`-i\` is \`~i + 1\`, and ANDing with \`i\` isolates exactly the lowest set bit).

- **Point update** (add \`delta\` at index \`i\`): repeatedly move to \`i += i & -i\`, updating each node touched — climbs through $O(\\log n)$ ranges that include index \`i\`.
- **Prefix sum query** up to index \`i\`: repeatedly move to \`i -= i & -i\`, summing each node touched — walks down through $O(\\log n)$ ranges that tile $[1, i]$.

A range sum $[l, r]$ is then \`prefix(r) - prefix(l-1)\`, same trick as ordinary prefix sums (see the Prefix Sums cards, Tier 2 Two Pointers module) but recomputed on the fly in $O(\\log n)$ after updates instead of needing a full $O(n)$ rebuild.`,
    code: `class FenwickTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)   # 1-indexed

    def update(self, i, delta):
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)

    def prefix_sum(self, i):
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & (-i)
        return total

    def range_sum(self, l, r):
        return self.prefix_sum(r) - self.prefix_sum(l - 1)`,
    complexity: {
      structure: "Fenwick Tree (BIT)",
      operations: [
        { op: "Point update", time: "O(log n)" },
        { op: "Prefix sum query", time: "O(log n)" },
        { op: "Build", time: "O(n log n)", note: "O(n) possible with a specialized build" },
      ],
    },
    pitfall:
      "Fenwick trees are 1-indexed by convention specifically because the i & -i trick breaks at index 0 (has no set bits, the loop would never terminate/never start) — always offset your data by 1 when using a standard Fenwick tree implementation.",
    related: ["specialized-trees-fenwick-vs-segment"],
  },
  {
    id: "specialized-trees-fenwick-vs-segment",
    tier: 2,
    module: MODULE,
    type: "compare",
    front: "Fenwick tree vs. segment tree — why reach for the simpler structure when it applies?",
    back: `| | Fenwick Tree | Segment Tree |
|---|---|---|
| Code size | ~10 lines, no recursion | Noticeably more code, typically recursive |
| Space | O(n) | O(4n) typical array implementation |
| Supports | Prefix-sum-like queries (sum, XOR — anything invertible) | Any associative aggregate (sum, min, max, gcd, ...) |
| Range updates | Possible with a second Fenwick tree trick, but awkward | Natural with lazy propagation |

Fenwick trees are strictly less general — they fundamentally rely on the aggregate being **invertible** (so \`range_sum = prefix(r) - prefix(l-1)\` works), which rules them out for min/max (you can't "subtract" a minimum). Reach for a Fenwick tree specifically for prefix-sum-shaped problems (sum, XOR, count) where its dramatically simpler implementation and smaller constant factor are a clear win; reach for a segment tree the moment you need min/max aggregation or lazy range updates as a first-class, natural operation.`,
    related: ["specialized-trees-fenwick-tree", "specialized-trees-segment-tree-structure"],
  },

  // ---------------------------------------------------------- Interval trees
  {
    id: "specialized-trees-interval-trees",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does an interval tree support fast overlapping-interval queries?",
    back: `A BST where each node stores an **interval** (keyed/ordered by start point for the BST structure) and is **augmented** with the **maximum end point** in its entire subtree. This one extra piece of cached information per node is what makes overlap search fast — it lets you prune entire subtrees that provably can't contain an overlap.

**Query "does anything overlap $[lo, hi]$?"**: at each node, first check if the current node's own interval overlaps the query — if so, done. Otherwise, decide which subtree(s) might still contain an overlap: if the **left child's max-end** is $\\geq lo$, an overlap could still exist there, so recurse left; if not, the entire left subtree is provably out of range and can be skipped entirely. Similarly decide about the right subtree based on ordering.

This gives $O(\\log n + k)$ for finding overlaps ($k$ = number of overlaps found, if enumerating all of them) on a balanced interval tree, vs. $O(n)$ for a naive scan over all intervals. Real uses: calendar/meeting-room conflict detection, genomic interval overlap queries, computational geometry sweep-line algorithms.`,
    complexity: {
      structure: "Interval Tree",
      operations: [
        { op: "Insert", time: "O(log n)", note: "on a balanced BST backing" },
        { op: "Search for one overlap", time: "O(log n)" },
        { op: "Report all k overlaps", time: "O(log n + k)" },
      ],
    },
    pitfall:
      "The max-end augmentation must be kept up to date on every insert/delete/rotation (if the backing BST self-balances) — forgetting to propagate a max-end change up through ancestors after a modification breaks the pruning logic's correctness silently.",
    related: ["trees-bst-property-and-search"],
  },

  // ------------------------------------------------------------------ B-trees
  {
    id: "specialized-trees-btree-overview",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a B-tree, and why does its multi-way branching minimize disk I/O?",
    back: `A **self-balancing, multi-way** search tree (not binary) where each node holds many keys (typically hundreds) and many children — unlike a binary tree's 2 children per node, a B-tree of **order/degree $m$** has up to $m$ children per node. This makes the tree extremely **shallow**: height is $O(\\log_m n)$ instead of $O(\\log_2 n)$, so even billions of records need only 3-4 levels.

Why this matters specifically for disk-backed storage: reading from disk has high **latency per access** (seek time) but can transfer a large **block** of data (a page, e.g. 4KB-16KB) roughly as cheaply as a tiny one. A B-tree node is sized to fit exactly one disk page/block — so each tree level traversed costs **one disk read**, regardless of how many keys that node holds. Minimizing height directly minimizes disk reads, which is the actual bottleneck (disk seek time is orders of magnitude slower than in-memory comparisons) — a plain binary BST, even balanced, would need far more levels and thus far more disk reads for the same $n$.`,
    complexity: {
      structure: "B-tree (order m)",
      operations: [
        { op: "Search/Insert/Delete", time: "O(logm n)", note: "height, which equals disk reads" },
      ],
    },
    related: ["specialized-trees-btree-operations", "specialized-trees-bplus-tree"],
  },
  {
    id: "specialized-trees-btree-operations",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does insertion (with node splitting) work in a B-tree?",
    back: `Each node holds between $\\lceil m/2 \\rceil - 1$ and $m-1$ keys (for order $m$), keeping the tree reasonably full and balanced. Insertion descends to the appropriate leaf (like a BST, but choosing among many children based on which key range the new key falls into) and inserts the key in sorted position within that leaf.

If the leaf now **overflows** (exceeds $m-1$ keys), **split** it: the median key moves **up** into the parent (separating the two new half-full nodes as its two children), and the two halves become siblings. If the parent now overflows from receiving that median key, the split **propagates upward** recursively — in the worst case all the way to the root, where a split creates a new root and increases the tree's height by exactly one level (the only way a B-tree grows taller).

This upward-propagating-split behavior is what keeps the tree **always perfectly height-balanced** — unlike a BST's rotations which happen locally, B-tree growth happens uniformly from the bottom, guaranteeing every leaf is at the same depth.`,
    pitfall:
      "Unlike a BST, all leaves in a B-tree are always at exactly the same depth — there's no such thing as a B-tree leaf being 'shallower' than another, which is a direct consequence of splits always propagating upward rather than the tree growing unevenly.",
    related: ["specialized-trees-btree-overview"],
  },
  {
    id: "specialized-trees-bplus-tree",
    tier: 2,
    module: MODULE,
    type: "compare",
    front: "B-tree vs. B+ tree — why do databases specifically prefer B+ trees?",
    back: `**B-tree**: keys and their associated data can live in **any** node, including internal ones.

**B+ tree**: all actual data lives **only in leaf nodes**; internal nodes store **only keys**, used purely for routing/navigation. Additionally, B+ tree leaves are **linked together** in a sequential chain (like a linked list across the bottom level).

Why databases prefer B+ trees specifically:
1. **Range queries**: "give me all rows with key between X and Y" is answered by one descent to find X, then a **linear walk along the leaf-level linked list** — no need to re-traverse the tree for each subsequent row. A plain B-tree has no such shortcut.
2. **More keys per internal node**: since internal nodes don't need to store data payloads (just keys + child pointers), more keys fit per disk page, making the tree even shallower for the same data volume — fewer disk reads per lookup.
3. **Predictable leaf-level scanning** is exactly the access pattern SQL range queries (\`WHERE date BETWEEN ...\`), and full/partial table scans need.

This is why virtually every production relational database index (MySQL's InnoDB, PostgreSQL, SQLite) uses B+ trees, not plain B-trees, and it's also the standard structure for filesystem directory indexes for the same disk-I/O-minimization and range-scan reasons.`,
    related: ["specialized-trees-btree-overview"],
  },

  // ------------------------------------------------------------------ K-d trees
  {
    id: "specialized-trees-kd-tree-structure",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does a k-d tree partition space, and how does that support spatial queries?",
    back: `A binary tree over **multi-dimensional points**, where each level splits the remaining points along **one dimension**, cycling through dimensions as you go deeper (e.g. in 2D: split by x at the root, by y at the next level, by x again, alternating). Each node's splitting value is typically the **median** of its subtree's points along the current dimension, keeping the tree balanced.

This recursively partitions space into axis-aligned regions ("cells"), where every point in a given subtree lies entirely within that subtree root's cell. Build costs $O(n \\log n)$ (median-finding at each of $O(\\log n)$ levels, over $n$ total points, with a selection algorithm), giving a structure whose shape directly encodes spatial locality — points near each other in space tend to be near each other in the tree, which is exactly what spatial queries (nearest-neighbor, range search) exploit.`,
    complexity: {
      structure: "K-d Tree",
      operations: [
        { op: "Build (balanced)", time: "O(n log n)" },
        { op: "Nearest-neighbor search (average)", time: "O(log n)" },
        { op: "Range search", time: "O(√n + k)", note: "k = points reported, 2D case" },
      ],
    },
    related: ["specialized-trees-kd-tree-nearest-neighbor"],
  },
  {
    id: "specialized-trees-kd-tree-nearest-neighbor",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does nearest-neighbor search work in a k-d tree, and when does it degrade?",
    back: `Descend like a BST insert (comparing the query point against each node's splitting dimension) to find the leaf cell containing the query point — this gives a **good candidate** nearest neighbor quickly, but not necessarily the true nearest one, since a closer point could exist in a *neighboring* cell just across a boundary.

**Backtrack** up the tree: at each ancestor, check whether the splitting plane is **closer to the query point than the current best distance found so far** — if so, a closer point might exist on the *other* side of that plane, so recurse into the sibling subtree too; if not, that whole sibling subtree can be **pruned** (provably can't contain anything closer). This pruning is what typically gives $O(\\log n)$ average-case search — dramatically better than checking all $n$ points.

**Degrades toward $O(n)$ in high dimensions** — the "curse of dimensionality": as dimensionality grows, an increasing fraction of tree nodes end up within pruning distance of the query (points are all "equally far" from each other in high-dim space in a loose sense), so pruning stops helping and search approaches brute-force linear scan. K-d trees are effective for roughly up to a few dozen dimensions at most; higher-dimensional nearest-neighbor search typically needs approximate methods (locality-sensitive hashing, or approximate nearest-neighbor structures) instead.`,
    pitfall:
      "K-d trees are a poor choice for the very-high-dimensional embeddings common in modern ML (hundreds to thousands of dimensions) — the curse of dimensionality erases their advantage over brute force, which is why vector databases use approximate methods (HNSW, LSH) instead.",
    related: ["specialized-trees-kd-tree-structure"],
  },
];
