import type { Card } from "./types";

const MODULE = "trees-bst";

export const treesBstCards: Card[] = [
  // ------------------------------------------------------------ Terminology
  {
    id: "trees-bst-terminology",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define: root, leaf, depth, height, balanced tree, degenerate tree.",
    back: `- **Root**: the single node with no parent — the top of the tree.
- **Leaf**: a node with no children.
- **Depth of a node**: the number of edges from the root down to that node (root has depth 0).
- **Height of a node**: the number of edges on the longest downward path from that node to a leaf (a leaf has height 0). **Height of the tree** = height of the root.
- **Balanced**: informally, height is $O(\\log n)$ for $n$ nodes — every root-to-leaf path is roughly the same length. Formal balance definitions vary by structure (AVL's is stricter than red-black's).
- **Degenerate (pathological)**: every node has at most one child, so the tree is structurally a linked list. Height is $O(n)$ — this is what happens to an unbalanced BST built from sorted input (see that card).

The practical stakes: BST operations cost $O(\\text{height})$, so balanced vs. degenerate is the difference between $O(\\log n)$ and $O(n)$ for every search/insert/delete.`,
    related: ["trees-bst-unbalanced-degrades"],
  },

  // ------------------------------------------------------------- Traversals
  {
    id: "trees-bst-preorder",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is preorder traversal, and what is it used for?",
    back: `Visit **root, then left subtree, then right subtree**, recursively. The root is always processed before either subtree.

Used for: **copying/serializing a tree** (you can reconstruct the exact same tree shape from a preorder sequence plus null markers, since you always see a parent before its children), and generating **prefix notation** for expression trees.`,
    code: `def preorder(node, out):
    if node is None:
        return
    out.append(node.val)   # root first
    preorder(node.left, out)
    preorder(node.right, out)`,
    complexity: {
      structure: "Binary Tree Traversal",
      operations: [
        { op: "Preorder / Inorder / Postorder", time: "O(n)", space: "O(h) recursion stack, h = height" },
        { op: "Level-order (BFS)", time: "O(n)", space: "O(w), w = max width" },
      ],
    },
    related: ["trees-bst-inorder", "trees-bst-postorder"],
  },
  {
    id: "trees-bst-inorder",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is inorder traversal, and why does it produce sorted output on a BST specifically?",
    back: `Visit **left subtree, then root, then right subtree**, recursively.

On a **BST**, this visits keys in **strictly increasing sorted order** — this falls directly out of the BST invariant (everything in the left subtree is smaller than the root, everything in the right subtree is larger): recursively visiting "all smaller things, then me, then all bigger things" at every node is exactly the definition of a sorted traversal. This is *not* true of an arbitrary binary tree — the sorted-output property is specific to the BST ordering invariant, not to inorder traversal itself.`,
    code: `def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)
    out.append(node.val)   # root between the two subtrees
    inorder(node.right, out)`,
    pitfall:
      "Inorder only yields sorted output on a valid BST. Running inorder traversal on a plain binary tree (heap, generic tree) and expecting sorted output is a common conceptual error.",
    related: ["trees-bst-preorder", "trees-bst-postorder", "trees-bst-iterative-inorder"],
  },
  {
    id: "trees-bst-postorder",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is postorder traversal, and what is it used for?",
    back: `Visit **left subtree, then right subtree, then root**, recursively. The root is always processed *after* both of its subtrees are fully done.

Used for: **safely deleting/freeing a tree** (children must be cleaned up before their parent, or you'd lose the reference to them), and generating **postfix notation** for expression trees (matches how a stack-based postfix evaluator consumes operators after their operands).`,
    code: `def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)
    postorder(node.right, out)
    out.append(node.val)   # root last`,
    related: ["trees-bst-preorder", "trees-bst-inorder"],
  },
  {
    id: "trees-bst-iterative-preorder",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement preorder traversal iteratively, using an explicit stack.",
    back: `Push root, then loop: pop a node, visit it, push its **right child before left child** — so left is popped (and thus visited) first, preserving root-left-right order.`,
    code: `def preorder_iterative(root):
    if root is None:
        return []
    out, stack = [], [root]
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right:
            stack.append(node.right)  # push right first...
        if node.left:
            stack.append(node.left)   # ...so left is popped first
    return out`,
    pitfall:
      "Pushing left before right reverses the visit order (you'd get root-right-left) — the push order is the opposite of the visit order because a stack is LIFO.",
    related: ["trees-bst-preorder", "trees-bst-iterative-inorder"],
  },
  {
    id: "trees-bst-iterative-inorder",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement inorder traversal iteratively, using an explicit stack.",
    back: `Unlike preorder, inorder can't just push-and-pop children directly — you need to walk all the way left first, pushing each node along the way, before you can visit anything.`,
    code: `def inorder_iterative(root):
    out, stack = [], []
    cur = root
    while cur or stack:
        while cur:              # walk to the leftmost node,
            stack.append(cur)   # remembering the path back up
            cur = cur.left
        cur = stack.pop()       # visit it
        out.append(cur.val)
        cur = cur.right         # then explore its right subtree
    return out`,
    complexity: {
      structure: "Binary Tree Traversal",
      operations: [{ op: "Iterative inorder", time: "O(n)", space: "O(h)" }],
    },
    related: ["trees-bst-inorder", "trees-bst-iterative-preorder"],
  },
  {
    id: "trees-bst-level-order",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement level-order traversal (BFS) on a binary tree.",
    back: `Use a **queue**, not a stack — process nodes in the order they were discovered, level by level, which is exactly the FIFO discipline a queue provides.`,
    code: `from collections import deque

def level_order(root):
    if root is None:
        return []
    out, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        out.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return out`,
    related: ["trees-bst-dfs-vs-bfs-traversal"],
  },
  {
    id: "trees-bst-dfs-vs-bfs-traversal",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Pre/in/postorder (DFS-style) vs. level-order (BFS) traversal — both are O(n), so when does the choice matter?",
    back: `All four traversals visit every node exactly once: $O(n)$ time. They differ in **order visited** and **space usage shape**:

- **DFS traversals** (pre/in/post): $O(h)$ space for the recursion stack (or explicit stack), where $h$ is height — cheap on a balanced tree ($O(\\log n)$), but can be $O(n)$ on a degenerate one.
- **Level-order (BFS)**: $O(w)$ space for the queue, where $w$ is the tree's maximum width — cheap on a tall, narrow tree, but can be $O(n)$ on a wide, shallow (or perfectly balanced) tree, since the last level of a balanced binary tree holds up to $n/2$ nodes.

Choose based on what the order needs to express: inorder for sorted BST output, postorder for safe deletion, level-order when you need "distance from root" semantics (shortest path in an unweighted tree, printing level-by-level, finding the tree's width).`,
    related: ["trees-bst-level-order", "trees-bst-inorder"],
  },

  // -------------------------------------------------------------- BST core
  {
    id: "trees-bst-property-and-search",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the BST invariant, and how does it make search O(height)?",
    back: `For every node, all keys in its **left** subtree are smaller, and all keys in its **right** subtree are larger (assuming no duplicates). This invariant holds recursively at every node, not just the root.

Search exploits this to eliminate half the *remaining* candidates (not half of $n$ — half of whatever subtree you're currently in) at each step: compare the target to the current node, go left if smaller, right if larger, stop if equal or you fall off the tree (\`None\` → not present). Each step descends one level, so search costs $O(h)$ where $h$ is the tree's height — $O(\\log n)$ if balanced, $O(n)$ if degenerate.`,
    code: `def search(node, target):
    if node is None or node.val == target:
        return node
    return search(node.left, target) if target < node.val else search(node.right, target)`,
    complexity: {
      structure: "Binary Search Tree",
      operations: [
        { op: "Search", time: "O(h)", note: "O(log n) balanced, O(n) degenerate" },
        { op: "Insert", time: "O(h)" },
        { op: "Delete", time: "O(h)" },
        { op: "Min/Max", time: "O(h)" },
      ],
    },
    related: ["trees-bst-insert", "trees-bst-unbalanced-degrades"],
  },
  {
    id: "trees-bst-insert",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement BST insertion.",
    back: `Same descent logic as search — walk down comparing against each node — but insert the new node once you fall off the tree (hit \`None\`), rather than stopping at a match.`,
    code: `def insert(node, val):
    if node is None:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    elif val > node.val:
        node.right = insert(node.right, val)
    # if val == node.val: no-op (no duplicates) or handle per your policy
    return node`,
    related: ["trees-bst-property-and-search"],
  },
  {
    id: "trees-bst-min-max",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you find the minimum and maximum values in a BST?",
    back: `The BST invariant makes this a pure descent, no comparisons of values needed: the **minimum** is the leftmost node (keep following \`.left\` until it's \`None\`); the **maximum** is the rightmost node (keep following \`.right\`). Both are $O(h)$.

This is the building block for BST deletion of a node with two children — see that card, which needs "find the minimum of the right subtree."`,
    code: `def find_min(node):
    while node.left:
        node = node.left
    return node

def find_max(node):
    while node.right:
        node = node.right
    return node`,
    related: ["trees-bst-delete", "trees-bst-successor-predecessor"],
  },
  {
    id: "trees-bst-delete",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the three cases of BST deletion, and how does each work?",
    back: `Deleting node $z$ splits into three cases based on how many children it has:

1. **Leaf (no children)**: simply remove it — set the parent's pointer to \`None\`.
2. **One child**: splice $z$ out by linking $z$'s parent directly to $z$'s single child, skipping $z$ entirely.
3. **Two children**: you can't simply remove $z$ without breaking the tree structure. Instead, find $z$'s **in-order successor** (the minimum of $z$'s right subtree — the next-larger value), **copy that successor's value into $z$**, then recursively delete the successor node from $z$'s right subtree. The successor is guaranteed to have *at most one child* (specifically, no left child — it's the leftmost node of that subtree), so its own deletion always falls into case 1 or 2, never back into case 3.

(Using the in-order **predecessor** — the maximum of the left subtree — instead of the successor is an equally valid symmetric choice.)`,
    complexity: {
      structure: "Binary Search Tree",
      operations: [{ op: "Delete", time: "O(h)", note: "all three cases combined" }],
    },
    pitfall:
      "The two-children case is where people go wrong: you copy the successor's *value*, then delete the *successor node* (not z) from the subtree — z itself is never physically removed from the tree in this case, only overwritten.",
    related: ["trees-bst-min-max", "trees-bst-delete-implementation", "trees-bst-successor-predecessor"],
  },
  {
    id: "trees-bst-delete-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement BST deletion, covering all three cases.",
    back: `Find the node first (descending like search), then handle deletion once found.`,
    code: `def delete(node, val):
    if node is None:
        return None
    if val < node.val:
        node.left = delete(node.left, val)
    elif val > node.val:
        node.right = delete(node.right, val)
    else:
        # found the node to delete
        if node.left is None:
            return node.right   # 0 or 1 child (right)
        if node.right is None:
            return node.left    # 1 child (left)
        # two children: replace with in-order successor's value,
        # then delete that successor from the right subtree
        successor = find_min(node.right)
        node.val = successor.val
        node.right = delete(node.right, successor.val)
    return node`,
    related: ["trees-bst-delete", "trees-bst-min-max"],
  },
  {
    id: "trees-bst-successor-predecessor",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you find the in-order successor and predecessor of a BST node?",
    back: `**Successor** (next larger value):
- If the node has a right subtree: successor = minimum of the right subtree.
- Otherwise (no right subtree): walk up via parent pointers until you move up from a left child — that parent is the successor. (If you reach the root without ever moving up from a left child, there is no successor — the node was the maximum.)

**Predecessor** (next smaller value) is the mirror image: maximum of the left subtree if it exists, otherwise walk up until moving up from a right child.

Without parent pointers, finding successor/predecessor from scratch requires re-descending from the root, tracking the last node where you branched in the relevant direction, which is still $O(h)$ but with different bookkeeping.`,
    pitfall:
      "This only needs parent pointers (or a root-to-node search) when there's no right subtree — people often forget the 'has a right subtree' case is simpler and try to walk up in every case.",
    related: ["trees-bst-min-max", "trees-bst-delete"],
  },
  {
    id: "trees-bst-unbalanced-degrades",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does inserting already-sorted data into a plain BST degrade it to O(n) operations?",
    back: `Inserting values in strictly increasing order (1, 2, 3, 4, 5, ...) into an empty BST: each new value is always greater than every existing node, so it always becomes the **right child of the current rightmost node**. The result is a tree where every node has only a right child — structurally identical to a linked list, with height $n-1$ instead of $O(\\log n)$.

Every subsequent search/insert/delete then costs $O(h) = O(n)$, not $O(\\log n)$ — the exact same asymptotic behavior as a linear scan, despite being "a BST." This is precisely the motivation for **self-balancing** BSTs (AVL, red-black) — they add rebalancing logic specifically to guarantee $O(\\log n)$ height regardless of insertion order, including already-sorted input.`,
    pitfall:
      "This isn't a rare edge case — sorted or near-sorted input is common in practice (e.g. inserting timestamped records in chronological order), which is exactly why production key-value structures never use a plain unbalanced BST.",
    related: ["trees-bst-avl-overview", "trees-bst-terminology"],
  },

  // ---------------------------------------------------------------- AVL
  {
    id: "trees-bst-avl-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is an AVL tree, and what invariant does it maintain?",
    back: `A self-balancing BST maintaining the **AVL invariant**: for every node, the **balance factor** — $\\text{height(left subtree)} - \\text{height(right subtree)}$ — must be in $\\{-1, 0, 1\\}$. This is a *strict* balance condition: no subtree pair can differ in height by more than 1, at any node, anywhere in the tree.

This guarantees height $O(\\log n)$ — specifically, an AVL tree's height is at most about $1.44 \\log_2 n$, very close to the theoretical minimum $\\log_2 n$. After every insert or delete, the tree walks back up from the modified node checking balance factors, and performs **rotations** (see that card) wherever the invariant is violated to restore it.`,
    complexity: {
      structure: "AVL Tree",
      operations: [
        { op: "Search", time: "O(log n)", note: "guaranteed, not just average" },
        { op: "Insert", time: "O(log n)", note: "includes rebalancing" },
        { op: "Delete", time: "O(log n)" },
      ],
    },
    related: ["trees-bst-avl-rotations", "trees-bst-avl-vs-redblack"],
  },
  {
    id: "trees-bst-avl-rotations",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the four AVL rotation cases, and when does each apply?",
    back: `After an insertion, walk back up from the new node; at the first ancestor whose balance factor becomes $\\pm 2$, identify which of four shapes caused it:

- **Left-Left (LL)**: imbalance from inserting into the **left** subtree of the **left** child. Fix: single **right rotation** on the imbalanced node.
- **Right-Right (RR)**: imbalance from inserting into the **right** subtree of the **right** child. Fix: single **left rotation**.
- **Left-Right (LR)**: imbalance from inserting into the **right** subtree of the **left** child. Fix: **left rotation on the left child** first (turning it into an LL shape), **then a right rotation** on the original node.
- **Right-Left (RL)**: imbalance from inserting into the **left** subtree of the **right** child. Fix: **right rotation on the right child** first (turning it into an RR shape), **then a left rotation** on the original node.

Mnemonic: name the case after the *path* from the imbalanced node down to the newly-inserted subtree (e.g. "went left, then right" = LR). A "straight line" shape (LL, RR) needs one rotation; a "zig-zag" shape (LR, RL) needs two.`,
    code: `def rotate_right(y):
    x = y.left
    y.left = x.right
    x.right = y
    update_height(y); update_height(x)
    return x  # x is the new subtree root

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    update_height(x); update_height(y)
    return y  # y is the new subtree root

# LR case: y.left = rotate_left(y.left); return rotate_right(y)
# RL case: y.right = rotate_right(y.right); return rotate_left(y)`,
    pitfall:
      "Applying a single rotation to a zig-zag (LR/RL) imbalance doesn't fix it — you need the two-rotation sequence; a single rotation on a zig-zag shape leaves the tree still imbalanced (just in a different way).",
    related: ["trees-bst-avl-overview", "trees-bst-avl-rotation-trace"],
  },
  {
    id: "trees-bst-avl-rotation-trace",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "Inserting 30, 20, 10 (in that order) into an empty AVL tree. What rotation fires, and what's the final shape?",
    back: `After inserting 30, then 20: tree is \`30(left=20)\`, balanced (factor 1).

Insert 10: it becomes the left child of 20, giving \`30 → 20 → 10\`, a straight line down the **left-left** path from 30. Node 30's balance factor is now $2$ (left height 2, right height 0) — an **LL** imbalance.

Fix: single **right rotation** on node 30. Result: **20 becomes the new subtree root**, with 10 as its left child and 30 as its right child — \`20(left=10, right=30)\`, now perfectly balanced (factor 0 at every node).

This is the canonical minimal example of why AVL trees never degrade to a linked list: the exact "insert in sorted order" pattern that breaks a plain BST (see that card) is caught and fixed after just one rotation here.`,
    related: ["trees-bst-avl-rotations", "trees-bst-unbalanced-degrades"],
  },

  // -------------------------------------------------------------- Red-Black
  {
    id: "trees-bst-redblack-properties",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the five red-black tree properties?",
    back: `1. Every node is colored **red** or **black**.
2. The **root is black**.
3. Every leaf (conceptually, the \`NIL\` sentinels below actual nodes) is **black**.
4. A **red node cannot have a red child** (equivalently: red node's parent must be black — no two reds in a row on any path).
5. Every path from a given node to any of its descendant \`NIL\` leaves contains the **same number of black nodes** (the node's **black-height**).

Properties 4 and 5 together bound the height: property 4 prevents too many consecutive red nodes from making one path much longer than another, and property 5 forces every path to have equal black-node count — combined, they guarantee the longest root-to-leaf path is at most **twice** the length of the shortest, giving height $O(\\log n)$ (looser than AVL's bound, but still logarithmic).`,
    complexity: {
      structure: "Red-Black Tree",
      operations: [
        { op: "Search", time: "O(log n)" },
        { op: "Insert", time: "O(log n)", note: "at most 2 rotations, plus O(log n) recoloring" },
        { op: "Delete", time: "O(log n)", note: "at most 3 rotations, plus O(log n) recoloring" },
      ],
    },
    pitfall:
      "The height bound is 2·log₂(n+1), looser than AVL's ~1.44·log₂(n) — red-black trees are less tightly balanced than AVL trees by design, trading search speed for cheaper rebalancing.",
    related: ["trees-bst-redblack-recolor-vs-rotate", "trees-bst-avl-vs-redblack"],
  },
  {
    id: "trees-bst-redblack-recolor-vs-rotate",
    tier: 1,
    module: MODULE,
    type: "concept",
    front:
      "When does a red-black tree fix a violation by recoloring vs. by rotating, and why prefer recoloring?",
    back: `A newly inserted node is always colored **red** (this can only ever violate property 4 — red-red — never property 5, since it adds no black nodes to any path). Fixing a red-red violation depends on the color of the new node's **uncle** (parent's sibling):

- **Uncle is red**: recolor — flip parent and uncle to black, grandparent to red — then recheck the violation one level up (it may have just moved higher, possibly all the way to the root, where it's resolved by property 2 forcing black). Pure recoloring, $O(1)$ work per level, no rotation needed.
- **Uncle is black (or absent/NIL)**: recoloring alone can't fix it — a **rotation** (one or two, depending on whether the new node forms a "line" or "triangle" shape with its parent and grandparent, mirroring AVL's LL/RR vs. LR/RL) is required, followed by a recolor of the rotated subtree's new root and its former position.

Recoloring is preferred when possible because it's cheaper (no pointer restructuring) — this is exactly why red-black trees tend to do **fewer rotations** than AVL trees on insertion, at the cost of a looser balance guarantee.`,
    pitfall:
      "The recoloring case can propagate all the way up to the root (each recolor may just move the violation up one level to the grandparent) — it's not always O(1) total; it's O(log n) in the worst case, still bounded by the tree height.",
    related: ["trees-bst-redblack-properties", "trees-bst-avl-rotations"],
  },
  {
    id: "trees-bst-avl-vs-redblack",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "AVL trees vs. red-black trees — how do you choose, and where does each actually get used?",
    back: `| | AVL | Red-Black |
|---|---|---|
| Balance strictness | Tighter (factor ∈ {-1,0,1}) | Looser (height ≤ 2× minimum) |
| Search speed | Slightly faster (shorter trees) | Slightly slower |
| Insert/delete speed | Slower (more rotations to maintain strict balance) | Faster (fewer rotations, more recoloring) |
| Typical real use | Read-heavy workloads (databases, lookup-heavy structures) | General-purpose (language standard libraries) |

Real-world defaults lean red-black: **C++ \`std::map\`/\`std::set\`, Java \`TreeMap\`/\`TreeSet\`**, and the Linux kernel's scheduler all use red-black trees — the faster, cheaper rebalancing on insert/delete wins for general-purpose use where both reads and writes are common. AVL trees are chosen specifically when lookups vastly outnumber modifications and the tighter balance's search-speed edge is worth the costlier writes.`,
    related: ["trees-bst-avl-overview", "trees-bst-redblack-properties"],
  },

  // ------------------------------------------------------- Treaps & splay
  {
    id: "trees-bst-treaps",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a treap, and how does it achieve balance without explicit rotation logic on every insert?",
    back: `A treap ("tree" + "heap") gives every node **two** keys: the actual BST key (maintaining the normal BST ordering invariant on this key), and a **randomly assigned priority** (maintaining a max-heap invariant on priority — every node's priority is ≥ its children's priorities).

Because priorities are random, the resulting tree shape is — in expectation — the same shape you'd get from inserting keys into a BST **in random order**, regardless of what order they actually arrived in. Random-order BST insertion has expected height $O(\\log n)$ (a classical result), so a treap achieves **expected** $O(\\log n)$ operations without any explicit balance-factor bookkeeping — insert/delete are implemented as ordinary BST insert followed by rotations that restore the heap invariant on priority (bubbling the new node up or down by priority), reusing the same rotation primitive as AVL trees, just driven by randomness instead of a deterministic balance condition.`,
    complexity: {
      structure: "Treap",
      operations: [
        { op: "Search/Insert/Delete (expected)", time: "O(log n)" },
        { op: "Search/Insert/Delete (worst case)", time: "O(n)", note: "extremely unlikely with random priorities" },
      ],
    },
    pitfall:
      "Treap balance is a probabilistic (expected-case) guarantee, not a worst-case one like AVL/red-black — an adversary who can predict or influence the random priorities could in principle force bad shapes, which matters in adversarial/competitive-programming contexts more than typical application code.",
    related: ["trees-bst-avl-overview", "trees-bst-unbalanced-degrades"],
  },
  {
    id: "trees-bst-splay-trees",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a splay tree, and why is 'recently accessed' the thing it optimizes for?",
    back: `A self-adjusting BST with **no explicit balance invariant at all** — instead, every access (search, insert, or delete) performs a **splay** operation: a sequence of rotations that moves the accessed node all the way up to become the **new root**, using specific rotation patterns (zig, zig-zig, zig-zag) chosen to also improve overall tree balance as a side effect, not just relocate the one node.

Individual operations can be $O(n)$ in the worst case (e.g. splaying a deep node), but the **amortized** cost over any sequence of $m$ operations is $O(\\log n)$ per operation — proven via a potential-function argument (see the amortized-analysis cards in Complexity & Analysis for the general technique).

This makes splay trees excel specifically when access patterns have **temporal locality** — recently/frequently accessed elements stay near the root and get cheap repeat access, similar in spirit to an LRU cache. Used in some implementations of caches and network routers' packet-forwarding tables where "recently used" entries dominate future queries.`,
    complexity: {
      structure: "Splay Tree",
      operations: [
        { op: "Access (amortized)", time: "O(log n)" },
        { op: "Access (single worst case)", time: "O(n)" },
      ],
    },
    pitfall:
      "A splay tree offers no worst-case-per-operation guarantee, only amortized — unsuitable for hard real-time systems where a single O(n) spike (however rare on average) is unacceptable, unlike AVL/red-black's guaranteed-every-time O(log n).",
    related: ["trees-bst-treaps", "complexity-analysis-amortized-intro"],
  },
];
