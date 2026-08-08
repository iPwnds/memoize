import type { Card } from "./types";

const MODULE = "persistent-structures";

export const persistentStructuresCards: Card[] = [
  // -------------------------------------------------------------- Skip lists
  {
    id: "persistent-structures-skip-list-structure",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What is a skip list, and how does probabilistic balancing work?",
    back: `A sorted linked list augmented with **multiple levels** of "express lane" links: level 0 is the full sorted list; each higher level contains a randomly-chosen **subset** of the nodes below it, letting a search skip over many elements at once before dropping down a level for finer-grained positioning — conceptually like a linked-list version of "binary search," but built from probability instead of a fixed tree shape.

**Probabilistic balancing**: when a node is inserted, its **height** (how many levels it participates in) is chosen randomly — typically by flipping a coin repeatedly, promoting to the next level up with probability $p$ (commonly $p = 1/2$) each time, stopping on the first "tails." This means roughly half of nodes reach level 1, a quarter reach level 2, an eighth reach level 3, and so on — the same geometric distribution that gives a balanced binary tree its $O(\\log n)$ height, but achieved **without any explicit rebalancing logic** (no rotations, no recoloring) — the structure stays balanced *in expectation* purely because of how insertion randomizes height.`,
    complexity: {
      structure: "Skip List",
      operations: [
        { op: "Search/Insert/Delete (expected)", time: "O(log n)" },
        { op: "Search/Insert/Delete (worst case)", time: "O(n)", note: "extremely unlikely — would need all coin flips to go the same way" },
      ],
    },
    pitfall:
      "Like treaps (Tier 1, Binary Trees module), a skip list's balance is a probabilistic guarantee, not a worst-case one — it's the same 'expected O(log n), astronomically-unlikely-but-technically-possible O(n)' trade-off as randomization-based balancing generally.",
    related: ["persistent-structures-skip-list-operations", "trees-bst-treaps"],
  },
  {
    id: "persistent-structures-skip-list-operations",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does search work in a skip list, level by level?",
    back: `Start at the **top-left** (the highest level's head pointer). At each step: if the next node **at the current level** has a value less than the target, move **right**; otherwise (next node's value is ≥ target, or there is no next node), move **down** one level and repeat. Reaching level 0 either lands on the target or confirms its absence.

This traces out a "staircase" path — mostly moving right at high levels (covering large gaps quickly), dropping down and moving right more finely as the search narrows in — directly analogous to how binary search narrows a range, except realized through the skip list's layered link structure instead of array indexing.

Skip lists are used in practice as the backing structure for Redis's sorted sets, and in some LSM-tree-based database engines' in-memory write buffers (memtables) — chosen specifically because, unlike a balanced BST, insertion needs no rotation logic, making it simpler to implement correctly and easier to reason about under concurrent access (lock-free skip list variants are more tractable than lock-free balanced trees).`,
    pitfall:
      "A common implementation slip: forgetting that moving right must check ALL levels' forward pointers from a given node as you build the update path for insertion — a naive search-only implementation doesn't track what's needed to correctly splice in a new node afterward.",
    related: ["persistent-structures-skip-list-structure", "persistent-structures-skip-list-vs-bst"],
  },
  {
    id: "persistent-structures-skip-list-vs-bst",
    tier: 3,
    module: MODULE,
    type: "compare",
    front: "Skip list vs. balanced BST (AVL/red-black) — what's the actual trade-off?",
    back: `Both give expected/guaranteed $O(\\log n)$ search, insert, and delete. The differences are in engineering properties, not asymptotic complexity:

- **Simplicity**: a skip list's insert/delete needs no rotations or recoloring — just random level selection and pointer splicing. This makes it considerably simpler to implement correctly, especially for lock-free/concurrent variants.
- **Guarantee type**: BSTs (AVL, red-black) give **worst-case** $O(\\log n)$, always. Skip lists give **expected** $O(\\log n)$ — a (vanishingly unlikely) unlucky sequence of random level choices could degrade performance.
- **Memory overhead**: skip list nodes carry a variable number of forward pointers (proportional to their randomly chosen height); BST nodes have a fixed, small pointer count (2-3 per node) plus balance/color metadata.
- **Range queries**: skip lists naturally support fast ordered iteration via level-0 traversal, comparable to a BST's in-order traversal.

In practice, skip lists are chosen specifically when implementation simplicity or concurrent-access-friendliness matters more than a hard worst-case guarantee — Redis and some database engines are the standard real examples.`,
    related: ["persistent-structures-skip-list-structure", "trees-bst-avl-vs-redblack"],
  },

  // ---------------------------------------------------------- Van Emde Boas
  {
    id: "persistent-structures-van-emde-boas",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What problem does a Van Emde Boas tree solve, and how does its recursive structure achieve O(log log u)?",
    back: `A Van Emde Boas (vEB) tree supports insert, delete, search, and (crucially) **successor/predecessor** queries over integer keys drawn from a **bounded universe** $[0, u)$, all in $O(\\log \\log u)$ — asymptotically faster than any comparison-based structure's $O(\\log n)$, by exploiting the fact that keys are integers with known range (not arbitrary comparable objects), similar in spirit to how counting/radix sort beats the comparison-sort lower bound by using more information than pairwise comparisons.

**Conceptual structure**: recursively split the universe $[0, u)$ into $\\sqrt{u}$ "clusters" each of size $\\sqrt{u}$ — a top-level **summary** structure (itself a smaller vEB tree over $\\sqrt{u}$ clusters) tracks which clusters are non-empty, and each cluster is itself a vEB tree of size $\\sqrt{u}$. A query recurses into a structure of size $\\sqrt{u}$ instead of $u/2$ (as a binary search would) — repeatedly taking a square root shrinks the universe size to $O(\\log \\log u)$ much faster than repeatedly halving shrinks it to $O(\\log u)$.

This is presented at a conceptual level here — a full implementation involves careful recursive bookkeeping (the summary/cluster split, min/max caching at each level to avoid infinite recursion on empty structures) that's more intricate than its asymptotic elegance suggests, which is exactly why it's a niche, rarely-implemented-from-scratch structure outside of specialized competitive programming and theoretical contexts.`,
    complexity: {
      structure: "Van Emde Boas Tree",
      operations: [
        { op: "Search/Insert/Delete/Successor/Predecessor", time: "O(log log u)", space: "O(u)", note: "u = universe size, not element count" },
      ],
    },
    pitfall:
      "vEB trees trade a hard requirement — space proportional to the UNIVERSE size u (not the number of elements actually stored) — for their speed, which makes them impractical whenever u is large relative to the actual data size; a hash-based or van-Emde-Boas-inspired 'y-fast trie' hybrid is used in practice to fix the space bound while keeping similar time complexity.",
    related: ["hashing-good-hash-function"],
  },

  // -------------------------------------------------------- Persistent structures
  {
    id: "persistent-structures-what-is-persistence",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What does it mean for a data structure to be 'persistent,' and why does naive copying fail?",
    back: `A persistent data structure preserves **every previous version** of itself after a modification — updating it doesn't destroy the old version; instead it produces a **new** version, and old versions remain fully queryable, as if nothing else had ever changed. ("Ephemeral" is the term for ordinary, non-persistent structures, where an update overwrites the only version.)

The naive approach — **copy the entire structure** on every update before modifying the copy — technically achieves persistence but is wasteful: an update to one element of an $n$-element structure costs $O(n)$ time and space, even though only one small part actually changed. For a structure updated $m$ times, that's $O(nm)$ total space for what might be a tiny amount of genuinely new information.

**Structural sharing** (see the next card) is the standard fix: a new version reuses as much of the old version's internal structure as possible, paying cost proportional only to what actually *needs* to change, not the whole structure's size.`,
    related: ["persistent-structures-structural-sharing"],
  },
  {
    id: "persistent-structures-structural-sharing",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does path copying achieve structural sharing for a persistent tree?",
    back: `For a persistent BST (or similar tree), an update to one node doesn't copy the whole tree — it copies only the **path from the root down to the modified node**, creating new versions of just those nodes; every node **not** on that path (i.e., untouched sibling subtrees) is **shared** directly between the old and new versions — both versions' new/old root point at the exact same, unmodified subtree objects.

Since a balanced tree has height $O(\\log n)$, path copying costs $O(\\log n)$ time and space **per update**, instead of $O(n)$ for full copying — and old versions remain perfectly intact and independently queryable, since nothing about them was ever mutated in place, only new nodes were added alongside them.

This is the same underlying idea used by real persistent-by-default data structures in **functional programming languages** (Clojure's persistent vectors/maps, Haskell's default immutable data structures) — immutability there isn't just a style preference, it's implemented efficiently via exactly this structural-sharing technique, not by naive full copying on every operation.`,
    code: `# Conceptual sketch: persistent BST insert via path copying
def persistent_insert(node, val):
    if node is None:
        return TreeNode(val)
    if val < node.val:
        # new node reuses the RIGHT subtree unchanged (shared), copies only the path left
        return TreeNode(node.val, left=persistent_insert(node.left, val), right=node.right)
    elif val > node.val:
        return TreeNode(node.val, left=node.left, right=persistent_insert(node.right, val))
    return node  # value already present; this version is unchanged`,
    complexity: {
      structure: "Persistent Tree (path copying)",
      operations: [
        { op: "Update, creating a new version", time: "O(log n)", note: "for a balanced tree; O(height) generally" },
        { op: "Query any version (old or new)", time: "O(log n)" },
        { op: "Space per update", time: "O(log n)", note: "amortized total space: O(m log n) for m updates, vs O(mn) naive" },
      ],
    },
    pitfall:
      "Path copying requires the underlying tree to be balanced (O(log n) height) to get its O(log n) update bound — path-copying a degenerate/unbalanced tree costs O(n) per update, same as naive full copying, since the 'path from root to node' can itself be O(n) long.",
    related: ["persistent-structures-what-is-persistence", "persistent-structures-versioning"],
  },
  {
    id: "persistent-structures-versioning",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What does 'versioning' mean for a persistent structure, and where is this used in real systems?",
    back: `Each update produces a distinct, independently-addressable **version** (often just represented as a pointer to that version's root) — the structure as a whole becomes a **collection of versions** rather than a single mutable object, and any past version can be queried or even branched from again (creating a new version derived from an *old* one, not necessarily the most recent).

Real-world uses built directly on this idea:
- **Git**: commits are persistent versions of the whole repository tree; each commit shares unchanged file/directory subtrees with its parent commit via exactly the path-copying/structural-sharing principle (a file untouched by a commit is the *same object* referenced by both the old and new tree, not a duplicate).
- **Database MVCC (multi-version concurrency control)**: readers see a consistent snapshot (version) of the database unaffected by concurrent writers producing newer versions — this is what lets reads never block on writes in many production databases (PostgreSQL, among others).
- **Undo/redo in editors**: each edit is a new version; undo just means "go back to viewing an older version," which is trivial and instant precisely because old versions were never destroyed.
- **Functional/immutable programming**: as mentioned in the structural-sharing card, this is the default execution model, not a special case, in languages built around immutable data.`,
    related: ["persistent-structures-structural-sharing"],
  },
];
