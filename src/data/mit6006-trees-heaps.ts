// MIT 6.006 (Spring 2020) — Lectures 6-8: Binary Trees I, Binary Trees II
// (AVL), Binary Heaps. 6.006's specific framing: a plain binary tree's
// *traversal order* is the organizing idea, later specialized into BST
// (Set) or an order-statistics tree (Sequence) via augmentation; AVL's
// rebalancing is presented as a rigorous proof (height bound, 3-case local
// rebalance using "skew", a general augmentation methodology); and every
// sorting algorithm seen so far gets reframed as "priority queue + a
// specific backing structure". Rotation mechanics, BST basics, and heap
// array mechanics already have deep cards in trees-bst/heaps and are
// cross-linked rather than re-taught.
import type { Card } from "./types";

const MODULE = "mit6006-trees-heaps";

export const mit6006TreesHeapsCards: Card[] = [
  {
    id: "mit6006-trees-heaps-rotations-suffice",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does 6.006 claim that O(n) rotations suffice to transform any binary tree into any other tree with the same traversal order?",
    back: `A **rotation** relinks $O(1)$ pointers to change a tree's *shape* while provably preserving its **traversal order** (in-order sequence of nodes) — it's a purely structural move. The claim: any binary tree $T$ can reach any other tree $T'$ with the *same* traversal order using at most $O(n)$ rotations.

Proof sketch: repeatedly perform the last possible **right rotation** in traversal order. Each such rotation increases the depth of the last node in traversal order by exactly 1. Repeating this drives the tree toward a **canonical chain** (a fully right-leaning path), and since the last node's depth is at most $n-1$ in any $n$-node tree, at most $n-1$ rotations are needed to reach the chain from $T$. Running the same process on $T'$ reaches the *same* canonical chain (traversal order determines the chain uniquely). Reversing $T'$'s rotation sequence gets from the chain to $T'$ — so $T \\to \\text{chain} \\to T'$ is at most $O(n)$ rotations total.

This is the theoretical justification for *why* rebalancing via rotations is even possible in principle — the practical question AVL trees answer is how to do it in only $O(\\log n)$ rotations per operation instead of the $O(n)$ this general argument gives.`,
    pitfall:
      "This O(n) bound is what you'd get by fully rebalancing from scratch after every operation — it's not the AVL guarantee. AVL trees are interesting precisely because they avoid ever needing this many rotations, doing O(log n) per insert/delete instead.",
    related: ["mit6006-trees-heaps-avl-height-bound", "trees-bst-avl-rotations"],
  },
  {
    id: "mit6006-trees-heaps-avl-height-bound",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006 prove that height-balance (AVL's invariant) forces height O(log n)?",
    back: `Define **skew** of a node as $\\text{height(right subtree)} - \\text{height(left subtree)}$ (note: this is the *negative* of the "balance factor" convention some textbooks use — height(left) − height(right) — so double-check which sign convention a given source uses before reasoning about it). A node is **height-balanced** if its skew is in $\\{-1, 0, 1\\}$.

To show height-balance forces $h = O(\\log n)$, it suffices to show the *fewest* nodes $F(h)$ possible in any height-$h$ balanced tree grows exponentially in $h$: $F(0) = 1$, $F(1) = 2$, and in general $F(h) = 1 + F(h-1) + F(h-2)$ (a node plus its two subtrees, one of height $h-1$ and the other at least $h-2$ by the skew-$\\leq 1$ constraint). Since $F(h) \\geq 2F(h-2)$, this gives $F(h) \\geq 2^{h/2}$ — so $n \\geq F(h) \\geq 2^{h/2}$, i.e. $h \\leq 2\\log_2 n = O(\\log n)$.

This Fibonacci-like recurrence is the actual reason AVL height stays logarithmic — it's a direct consequence of the $\\pm 1$ skew bound, not an empirical observation. It's also why an AVL tree's *worst-case* height (~$1.44\\log_2 n$) is close to but not exactly $\\log_2 n$: the "worst height-balanced tree" is the minimal-node tree this recurrence describes, essentially a Fibonacci tree.`,
    pitfall:
      "Skew and balance factor are sign-inverted from each other (skew = right − left, balance factor = left − right) — mixing the two conventions mid-derivation silently flips which rotation (left vs right) you think you need.",
    related: ["mit6006-trees-heaps-avl-local-rebalance", "trees-bst-avl-overview"],
  },
  {
    id: "mit6006-trees-heaps-avl-local-rebalance",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In 6.006's skew-based case analysis, why does fixing one imbalanced ancestor suffice after insertion, but not necessarily after deletion?",
    back: `After inserting or deleting a leaf, only that leaf's **ancestors** can have changed height/skew (everything else is untouched) — and since a single leaf change moves any one subtree's height by at most 1, no ancestor's skew magnitude can exceed 2. 6.006's local-rebalance claim: if a node $\\langle B\\rangle$ has skew exactly $\\pm 2$ (wlog $+2$, meaning right-heavy) but every *other* node in its subtree is already height-balanced, one or two rotations restore height-balance at $\\langle B\\rangle$ — driven by the skew of $\\langle B\\rangle$'s right child $\\langle F\\rangle$: skew$(F) \\in \\{0,1\\}$ needs a single left rotation on $\\langle B\\rangle$; skew$(F) = -1$ needs a right rotation on $\\langle F\\rangle$ then a left rotation on $\\langle B\\rangle$ (the existing AVL-rotations card's LL/RR/LR/RL cases are exactly these, under the mirror-image left-heavy naming).

The asymmetry that matters: after **insertion**, a local rebalance always restores $\\langle B\\rangle$'s height to what it was *before* the insertion — so no ancestor further up can still be imbalanced, and $O(1)$ rotations suffice total. After **deletion**, a local rebalance can *decrease* $\\langle B\\rangle$'s height by 1 relative to before — which can propagate imbalance to $\\langle B\\rangle$'s parent, and its parent, and so on. So deletion may require rebalancing at *every* ancestor on the path to the root — still only $O(\\log n)$ of them (bounded by tree height), but a genuinely different shape of argument than insertion's "fix once and stop."`,
    pitfall:
      "It's tempting to assume insertion and deletion rebalancing are symmetric since both are O(log n) — they're both O(log n) in rotation count, but insertion needs at most one local rebalance while deletion can cascade all the way to the root; conflating the two leads to under-counting how many ancestors a deletion-rebalance routine needs to check.",
    related: ["trees-bst-avl-rotations", "mit6006-trees-heaps-avl-height-bound"],
  },
  {
    id: "mit6006-trees-heaps-augment-steps",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the two general steps 6.006 gives for augmenting any binary tree with a subtree property?",
    back: `To add a cached **subtree property** $P$ to every node of a binary tree without slowing down its dynamic operations:

1. **State the property** $P(\\langle X\\rangle)$ precisely, in terms of $\\langle X\\rangle$'s subtree (e.g. "size of the subtree rooted at $\\langle X\\rangle$", "height of the subtree", "pointer to the max-key node in the subtree").
2. **Show $P(\\langle X\\rangle)$ is computable in $O(1)$ time from $P$ of $\\langle X\\rangle$'s children** (plus $O(1)$ other local information) — e.g. subtree size = $1 + \\text{size(left)} + \\text{size(right)}$; subtree height = $1 + \\max(\\text{height(left)}, \\text{height(right)})$.

If step 2 holds, the augmentation can be maintained "for free" (no asymptotic slowdown) under every dynamic operation: a rotation only needs to recompute $P$ at the $O(1)$ nodes it directly relinks (ancestors above the rotation are untouched, since the rotation doesn't change their subtree contents), and an insert/delete only needs to recompute $P$ along the $O(h) = O(\\log n)$ ancestors of the affected leaf, walking up.

This is the general recipe behind subtree-size augmentation (order-statistics / Sequence trees), subtree-height augmentation (needed to even *detect* AVL imbalance in $O(1)$ instead of $O(n)$ per check), and subtree-max augmentation (Sequence AVL trees as priority queues) — every one of them is an instance of this same two-step recipe, not a special case requiring its own new idea.`,
    pitfall:
      "A subtree property that can't be computed from just the children's own augmented values in O(1) — e.g. one that requires looking at the whole subtree's contents, or at nodes outside the subtree — breaks the recipe and needs a fundamentally different (usually slower) maintenance strategy.",
    related: ["mit6006-trees-heaps-order-statistics-tree", "specialized-trees-interval-trees"],
  },
  {
    id: "mit6006-trees-heaps-order-statistics-tree",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does subtree-size augmentation turn a binary tree into an efficient Sequence (order-statistics) data structure?",
    back: `Give the tree's traversal order *sequence* meaning (item at traversal-position $i$ = the $i$-th item), then implement \`get_at(i)\` as \`subtree_at(i)\` starting from the root: augment every node $\\langle X\\rangle$ with \`X.size\` (subtree node count — an instance of the augmentation recipe, since size$(X) = 1 + $size(left)$+ $size(right) is $O(1)$ from children). To find the $i$-th node in $\\langle X\\rangle$'s subtree: let $n_L = $ size of $\\langle X\\rangle$'s left subtree. If $i < n_L$, recurse left with the same $i$. If $i > n_L$, recurse right with $i' = i - n_L - 1$. If $i = n_L$, $\\langle X\\rangle$ itself is the answer.

Each step does $O(1)$ work and descends one level, so \`subtree_at(i)\` costs $O(h)$ — matching \`get_at\`/\`set_at\` performance to a balanced BST's search, i.e. $O(\\log n)$ once paired with AVL. Maintaining \`.size\` costs $O(1)$ extra per node touched during insert/delete/rotation (per the augmentation recipe), so this doesn't slow anything down asymptotically. Naively rebuilding a tree this way costs $O(nh)$ (insert one at a time), but a direct $O(n)$ \`build\` is possible by constructing bottom-up.

This is exactly how an **order-statistics tree** answers "what's the $k$-th smallest element?" or "what's the rank of this key?" in $O(\\log n)$ — both are direct applications of \`subtree_at(i)\`-style traversal using size augmentation.`,
    code: `def subtree_at(node, i):
    n_L = size(node.left)   # 0 if node.left is None
    if i < n_L:
        return subtree_at(node.left, i)
    elif i > n_L:
        return subtree_at(node.right, i - n_L - 1)
    else:
        return node`,
    pitfall:
      "This gives O(log n) Sequence operations only if the underlying tree is height-balanced (AVL, red-black, etc.) — subtree-size augmentation on a plain unbalanced BST still degrades to O(n) on adversarial insertion order, same as ordinary BST search.",
    related: ["mit6006-trees-heaps-augment-steps", "mit6006-foundations-sequence-interface"],
  },
  {
    id: "mit6006-trees-heaps-avl-sort",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does 6.006 say 'every Set data structure defines a sorting algorithm', and what is AVL Sort specifically?",
    back: `Any Set supporting \`build\`/\`insert\` and ordered iteration (\`iter_ord\`) sorts for free: \`build(A)\` (or repeated \`insert\`), then \`iter_ord()\` to read items back in key order. **AVL Sort** is this pattern with a Set AVL tree as the backing structure: $O(n\\log n)$ to build (or $n$ inserts at $O(\\log n)$ each), then $O(n)$ to iterate in order — $O(n\\log n)$ total, matching merge sort's optimal comparison-sort bound.

This reframes sorting algorithms you already know as instances of a **single pattern** (Set/Priority-Queue backing structure → \`build\` then ordered extraction) rather than a list of unrelated tricks — the same lens Lecture 8 pushes further with binary heaps and Priority-Queue Sort (see the related card): Direct Access Array Sort, AVL Sort, and Heap Sort are all "pick a Set/PQ data structure, build it, read it back out," differing only in which data structure backs it and therefore which complexity and space trade-off you get.`,
    pitfall:
      "AVL Sort is not in-place (the tree's pointer overhead is Θ(n) extra space beyond the array) and is more complex to implement correctly than Heap Sort for the same O(n log n) bound — it's pedagogically useful for the 'any Set gives a sort' insight, not a practical recommendation over Heap Sort.",
    related: ["mit6006-trees-heaps-priority-queue-sort-family", "sorting-merge-overview"],
  },
  {
    id: "mit6006-trees-heaps-priority-queue-interface",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does 6.006's Priority Queue interface specify, and why is it a Set-interface specialization rather than a new interface?",
    back: `A **Priority Queue** orders items by key = priority, so it's a **Set** interface specialization (intrinsic order, not extrinsic position) — restricted to just the subset of Set operations needed for "quickly access/remove the most important item": \`build(X)\`, \`insert(x)\`, \`delete_max()\`, \`find_max()\` (or the min-oriented mirror; typically a data structure optimizes for one direction, not both simultaneously). \`build\` reduces to repeated \`insert\`; \`find_max\` reduces to \`insert(delete_max())\` — so \`insert\` and \`delete_max\` are the two operations that actually need dedicated fast implementations.

Real uses: bandwidth-limited routers prioritizing message types, OS process scheduling, discrete-event simulation (find the next event in time order), and — later in 6.006 — driving Dijkstra's shortest-paths algorithm (repeatedly extracting the currently-closest unvisited vertex).`,
    related: ["heaps-priority-queue-adt", "mit6006-foundations-set-interface"],
  },
  {
    id: "mit6006-trees-heaps-priority-queue-sort-family",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "How does 6.006 unify Selection Sort, Insertion Sort, AVL Sort, and Heap Sort as one algorithm family?",
    back: `**Priority Queue Sort**: \`build(A)\` (insert everything), then repeatedly \`delete_max()\` (or \`delete_min()\`) to read out sorted order. Total cost is $T_{build} + n \\cdot T_{delete\\_max} \\leq n \\cdot T_{insert} + n \\cdot T_{delete\\_max}$ — so the sort's complexity is entirely determined by which backing data structure you plug in:

$$\\begin{array}{l|cccl}
\\text{PQ backing structure} & \\texttt{insert} & \\texttt{delete\\_max} & \\text{total} & \\text{= which sort} \\\\
\\hline
\\text{Unsorted Dynamic Array} & O(1)^{(a)} & O(n) & O(n^2) & \\text{Selection Sort} \\\\
\\text{Sorted Dynamic Array} & O(n) & O(1)^{(a)} & O(n^2) & \\text{Insertion Sort} \\\\
\\text{Set AVL Tree} & O(\\log n) & O(\\log n) & O(n\\log n) & \\text{AVL Sort} \\\\
\\text{Binary Heap (goal)} & O(\\log n)^{(a)} & O(\\log n)^{(a)} & O(n\\log n) & \\text{Heap Sort}
\\end{array}$$

The insight this table is building toward: Selection and Insertion sort were never really "different algorithms" from AVL/Heap sort — they're the *same* algorithm (Priority Queue Sort) with a deliberately weak backing structure. Binary heaps close the gap to $O(n\\log n)$ **and** stay in-place ($O(1)$ extra space, unlike AVL Sort's pointer overhead) by implementing the Set interface directly on top of an array — see the related binary-heap cards for the array-as-complete-tree mechanics that make this possible.`,
    pitfall:
      "This table's Set AVL Tree row assumes O(log n) delete_max via find_max augmentation (subtree-max, see the augmentation-steps card) — a plain unaugmented BST's delete_max would need O(h) just to walk to the rightmost node first, which is the same O(log n) here but worth noting isn't automatic without the augmentation.",
    related: ["mit6006-trees-heaps-avl-sort", "mit6006-trees-heaps-sequence-avl-priority-queue", "heaps-heapsort-link"],
  },
  {
    id: "mit6006-trees-heaps-sequence-avl-priority-queue",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a Sequence AVL Tree implement a priority queue with the same bounds as a binary heap, using a different mechanism?",
    back: `Store priority-queue items in a **Sequence AVL tree** in arbitrary (e.g. insertion) order — position doesn't encode priority. Augment every node with \`node.max\`: a pointer to the node holding the maximum key anywhere in that node's subtree. This is a valid subtree-augmentation (max$(X) = $ the largest-keyed node among $\\{X\\} \\cup$ max(left) $\\cup$ max(right), computable in $O(1)$ from children's \`.max\` per the general augmentation recipe), so maintaining it costs no extra asymptotic overhead.

Result: \`find_max()\` is $O(1)$ (read the root's \`.max\` pointer directly — no tree walk needed), \`insert\`/\`delete_max\` are $O(\\log n)$ (standard AVL insert/delete, re-deriving \`.max\` along the $O(\\log n)$ ancestor path), and — because it's built on a Sequence AVL tree, which supports $O(n)$ \`build\` — \`build(A)\` is $O(n)$, not $O(n\\log n)$.

This matches (and technically exceeds — $O(1)$ find\\_max vs. a binary heap's $O(1)$ find\\_max but only after locating the root, which is the same thing) a binary heap's bounds via a completely different route: no array-as-complete-tree trick, no heapify — just the general augmentation recipe applied to a Sequence AVL tree. It's a good illustration that "priority queue" is an interface achievable by structurally unrelated implementations with matching asymptotic guarantees.`,
    pitfall:
      "This is asymptotically equivalent to a binary heap but not simpler or faster in practice — pointer-based AVL trees carry real constant-factor overhead (node allocation, cache locality) that the implicit array-based binary heap avoids entirely, which is exactly why binary heaps are the practical default despite the matching Big-O.",
    related: ["mit6006-trees-heaps-augment-steps", "mit6006-trees-heaps-priority-queue-sort-family"],
  },
  {
    id: "mit6006-trees-heaps-set-vs-multiset",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How can a Set-based data structure support duplicate keys (a Multiset), and when do binary heaps/AVL trees not even need the reduction?",
    back: `6.006's Set interface assumes unique keys — but a **Multiset** (duplicates allowed) is a direct reduction: make each item stored in the Set actually be a small **Sequence** (e.g. a linked list) holding all Multiset items that share that key, keyed by the shared key itself. Insert either creates a new one-item sequence at a fresh key or appends to the existing sequence at a matching key; delete removes one item from the matching sequence (removing the Set entry entirely once its sequence empties).

Binary heaps and AVL trees specifically don't need this reduction at all — they work directly on duplicate-key items as long as comparisons use $\\leq/\\geq$ instead of strict $</>$ (e.g. the max-heap property becomes "parent $\\geq$ children," which duplicate keys satisfy just fine without any special-casing). The Set-of-Sequences reduction matters for data structures whose correctness or efficiency genuinely depends on key uniqueness (e.g. a hash table's \`find(k)\` returning a single item, or an order-statistics tree where "the node with key $k$" needs to be unambiguous).`,
    pitfall:
      "Forgetting to switch strict inequalities to non-strict ones when adapting a Set/heap algorithm for duplicate keys is a common source of subtle bugs — e.g. a max-heap sift-down using Q[i] > Q[j] instead of Q[i] >= Q[j] can leave the heap property technically satisfiable but break invariants an algorithm built on top of it assumes.",
  },
];
