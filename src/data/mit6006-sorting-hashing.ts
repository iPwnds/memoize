// MIT 6.006 (Spring 2020) — Lectures 3-5: Sets and Sorting, Hashing, Linear
// Sorting. This module tracks 6.006's specific narrative arc: Set via
// Sorted Array (binary search) is only as fast as it is to build a sorted
// array (motivating Sorting) -> the comparison-search lower bound shows why
// beating Θ(log n)/Θ(n log n) needs a non-comparison operation -> Direct
// Access Array exploits Word-RAM O(1) indexing but costs O(u) space ->
// Hashing tames that space cost -> the same direct-access idea, generalized
// to tuples of digits, gives Counting/Radix sort in linear time. Sort
// algorithm mechanics (merge sort, quicksort, etc.) already have deep cards
// in the generic sorting/hashing modules — cross-linked, not re-taught.
import type { Card } from "./types";

const MODULE = "mit6006-sorting-hashing";

export const mit6006SortingHashingCards: Card[] = [
  {
    id: "mit6006-sorting-hashing-sorted-array-set",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a Sorted Array implement the Set interface, and what does sorting buy you over a plain array?",
    back: `Storing Set items in an array **sorted increasing by key** upgrades three operations for free versus an unsorted array: \`find(k)\` becomes $O(\\log n)$ via binary search instead of $O(n)$ linear scan, and \`find_min\`/\`find_max\` become $O(1)$ by reading the first/last index instead of scanning. \`find_next(k)\`/\`find_prev(k)\` also drop to $O(\\log n)$ (binary search for $k$, then step to the adjacent slot).

$$\\begin{array}{l|ccc}
\\text{Set} & \\texttt{build} & \\texttt{find(k)} & \\texttt{insert/delete} \\\\
\\hline
\\text{Array} & n & n & n \\\\
\\text{Sorted Array} & n\\log n & \\log n & n
\\end{array}$$

Dynamic operations don't improve: \`insert(x)\`/\`delete(k)\` still cost $O(n)$, because keeping the array sorted after inserting means shifting every element after the insertion point — exactly the same shifting cost that makes plain-array \`insert_at\` linear. This sets up the motivating question for the rest of the arc: a sorted array is only as good as it is cheap to *build* sorted (hence Sorting, Lecture 3), and its $O(n)$ dynamic cost is exactly what a hash table (Lecture 4) and balanced BST (Lectures 6-7) each independently fix, in different ways.`,
    complexity: {
      structure: "Sorted Array Set (6.006)",
      operations: [
        { op: "build(X)", time: "O(n log n)" },
        { op: "find(k)", time: "O(log n)" },
        { op: "find_min() / find_max()", time: "O(1)" },
        { op: "find_next(k) / find_prev(k)", time: "O(log n)" },
        { op: "insert(x) / delete(k)", time: "O(n)" },
      ],
    },
    pitfall:
      "Building the sorted array once via a good sort is O(n log n), but resorting after every single insert to keep it sorted would make build-once-then-query workloads look fine while making a workload with frequent inserts pay O(n log n) per insert instead of the O(n) shift-only cost — always maintain sortedness incrementally (shift, don't re-sort).",
    related: ["mit6006-sorting-hashing-comparison-search-lower-bound", "mit6006-sorting-hashing-set-implementations-summary"],
  },
  {
    id: "mit6006-sorting-hashing-comparison-search-lower-bound",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006's decision-tree argument generalize the Θ(log n) search bound to 'you need bigger branching factor to go faster'?",
    back: `Model any comparison-based algorithm as a **decision tree**: each internal node is a binary comparison (branches True/False), each leaf is a possible output, and a root-to-leaf path is one execution. To distinguish $n$ possible search outcomes the tree needs $\\geq n+1$ leaves, and running time is lower-bounded by the tree's height. A binary tree (branching factor $b=2$) with $L$ leaves has height $\\geq \\log_2 L$ — so any comparison search is $\\Omega(\\log n)$, and sorted arrays already hit that bound.

The generalization that matters: a tree with $\\Theta(n)$ leaves and **branching factor $b$** has height $\\Omega(\\log_b n)$. Comparisons are stuck at $b=2$ (binary outcomes) — there's no way to make a comparison-based algorithm faster than $\\Theta(\\log n)$. To beat that bound you need an operation with **super-constant branching factor**, i.e. one comparison-equivalent step that rules out more than a constant fraction of remaining possibilities. That's precisely what a direct memory access provides (see the Direct Access Array card): reading array index $k$ effectively has branching factor $u$ (the key universe size), collapsing search to $O(1)$.`,
    pitfall:
      "This bound only constrains comparison-based algorithms — it says nothing about algorithms that use keys as memory addresses (direct access, hashing) or other non-comparison operations, which is exactly the loophole the rest of Lecture 4 exploits.",
    related: ["mit6006-sorting-hashing-direct-access-array", "sorting-comparison-lower-bound"],
  },
  {
    id: "mit6006-sorting-hashing-direct-access-array",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a Direct Access Array, and what specific trade-off does it make to escape the comparison lower bound?",
    back: `Give every item a unique integer key $k \\in \\{0, \\ldots, u-1\\}$ and store it directly at index $k$ of an array of size $u$ — the array index itself *is* the key lookup, exploiting the Word-RAM's $O(1)$ random access instead of comparisons. If keys fit in a machine word ($u \\leq 2^w$), every Set operation — \`find\`, \`insert\`, \`delete\` — is worst-case $O(1)$, escaping the $\\Omega(\\log n)$ comparison bound entirely by using an operation (indexing) with effectively unbounded branching factor.

The cost: space is $\\Theta(u)$, the size of the *entire key universe*, regardless of how many items $n$ you actually store. If keys are ten-letter names, one bit per possible name alone needs $26^{10} \\approx 17.6$ TB — catastrophic when $n \\ll u$ (few items, huge key space). This is the exact motivation for hashing: keep the $O(1)$ direct-indexing idea, but map the huge key universe $u$ down to a much smaller table of size $m = \\Theta(n)$ first.

$$\\begin{array}{l|cc}
\\text{Direct Access Array} & \\texttt{build/find/insert/delete} & \\text{space} \\\\
\\hline
\\Theta(\\cdot) & u \\text{ (build)}, \\; 1 \\text{ (rest)} & \\Theta(u)
\\end{array}$$`,
    pitfall:
      "'O(1) time' for a direct access array is worst-case only when u is small enough to be practical — quoting it as a general-purpose Set replacement ignores that its space cost scales with the key universe, not the number of stored items, which is usually the whole problem.",
    related: ["mit6006-sorting-hashing-comparison-search-lower-bound", "mit6006-sorting-hashing-universal-hashing", "mit6006-sorting-hashing-direct-access-sort"],
  },
  {
    id: "mit6006-sorting-hashing-universal-hashing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does it mean for a hash family to be 'universal,' and what does that guarantee about expected chain length?",
    back: `A hash table maps a huge key universe $\\{0,\\ldots,u-1\\}$ down to a small table of size $m = \\Theta(n)$ via $h(k)$, storing collisions in a chain (linked structure) at each index. If $m \\ll u$, collisions are unavoidable by pigeonhole — the question is how *bad* they get. A fixed hash function (e.g. $h(k) = k \\bmod m$) can always be defeated by an adversarial input set that collides everything into one chain. The fix: don't commit to one hash function — pick one **randomly** from a carefully designed family for each build.

A family $H(p, m) = \\{h_{ab}(k) = ((ak+b) \\bmod p) \\bmod m : a,b \\in \\{0,\\ldots,p-1\\}, a \\neq 0\\}$, for prime $p > u$, is **universal** if for every fixed pair of distinct keys $k_i \\neq k_j$: $\\Pr_{h \\in H}[h(k_i) = h(k_j)] \\leq 1/m$. That single guarantee is enough to bound expected chain length: let $X_i = \\sum_j X_{ij}$ count collisions with key $k_i$ (indicator $X_{ij}=1$ if $h(k_i)=h(k_j)$). Then

$$E[X_i] = 1 + \\sum_{j \\neq i} \\Pr[h(k_i)=h(k_j)] \\leq 1 + \\frac{n-1}{m}$$

Since $m = \\Theta(n)$, the load factor $\\alpha = n/m = O(1)$, so **every** chain has $O(1)$ expected length — regardless of what the input keys actually are, because the randomness is in the hash function's *choice*, not the input. That's why hash tables give expected $O(1)$ operations (amortized $O(1)$ if the table also resizes dynamically, by the same argument as a dynamic array) — the expectation is over the algorithm's own coin flips, not over an assumed input distribution.`,
    pitfall:
      "The O(1) expected-time guarantee is input-independent only because the hash function is chosen randomly at build time — using a fixed, publicly-known hash function (even a 'good-looking' one) reintroduces the adversarial-input vulnerability the universal-family construction exists to close.",
    related: ["mit6006-sorting-hashing-direct-access-array", "hashing-good-hash-function", "hashing-separate-chaining"],
  },
  {
    id: "mit6006-sorting-hashing-chaining-terminology",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In 6.006's terms, what are the two collision-resolution strategies for a hash table, and which does the course build on?",
    back: `When $h(a) = h(b)$ for distinct keys $a \\neq b$, there are exactly two places to put the second item: **open addressing** (probe for another slot in the same array — practical and common, but with more complicated expected-time analysis) or **chaining** (store all colliding items in a secondary dynamic-set data structure at that index — the analysis 6.006 develops in full, since it composes cleanly with the universal-hashing expected-chain-length bound). The course's default hash table is chaining-based: a direct access array of size $m$ where each slot holds a small Set/Sequence structure instead of a single item.

For the mechanics and trade-offs of both strategies (linear probing, quadratic probing, double hashing, tombstoned deletion) see the related hashing-module cards — that depth carries over unchanged; what 6.006 adds on top is the formal universal-hashing guarantee for *why* chain lengths stay short.`,
    related: ["hashing-separate-chaining", "hashing-open-addressing-linear-probing", "mit6006-sorting-hashing-universal-hashing"],
  },
  {
    id: "mit6006-sorting-hashing-set-implementations-summary",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "6.006's Set-implementation progression: Array → Sorted Array → Direct Access Array → Hash Table — what does each buy, and at what cost?",
    back: `Each step trades a different resource to fix the previous structure's weak operation:

$$\\begin{array}{l|ccccc}
\\text{Set} & \\texttt{build} & \\texttt{find(k)} & \\texttt{insert/delete} & \\texttt{find\\_min/max} & \\text{space} \\\\
\\hline
\\text{Array} & n & n & n & n & n \\\\
\\text{Sorted Array} & n\\log n & \\log n & n & 1 & n \\\\
\\text{Direct Access Array} & u & 1 & 1 & u & u \\\\
\\text{Hash Table} & n^{(e)} & 1^{(e)} & 1^{(a)(e)} & n & n
\\end{array}$$

($^{(e)}$ = expected, $^{(a)}$ = amortized.) Sorting buys $O(\\log n)$ find at the cost of $O(n)$ dynamic ops (shifting). Direct access buys $O(1)$ everything at the cost of $\\Theta(u)$ space (the whole key universe, not just $n$ stored items). Hashing recovers hash table's $\\Theta(n)$ space by mapping $u \\to m = \\Theta(n)$ randomly, paying only "expected" instead of worst-case guarantees — and loses the Order operations (\`find_min/max/next/prev\`) entirely, since hashing destroys key order by design. Recovering *both* $O(\\log n)$ everything *and* full Order support needs a balanced BST — the subject of Lectures 6-7.`,
    pitfall:
      "Hash tables are strictly worse than sorted structures for Order operations (find_min, find_max, find_next, find_prev, iter_ord) — a hash table gives no better than Θ(n) for these, since hashing intentionally scrambles key order to spread load; don't reach for a hash table when a problem needs sorted iteration or range queries.",
    related: ["mit6006-sorting-hashing-sorted-array-set", "mit6006-sorting-hashing-direct-access-array", "mit6006-sorting-hashing-universal-hashing"],
  },
  {
    id: "mit6006-sorting-hashing-destructive-in-place",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In 6.006's terms, what distinguishes a 'destructive' sort from an 'in-place' sort, and what's the naive brute-force baseline they're measured against?",
    back: `A sort is **destructive** if it overwrites the input array $A$ directly, rather than producing a separate output array $B$. It's **in-place** if, additionally, it uses only $O(1)$ extra space beyond the input — every in-place sort is destructive, but not every destructive sort is in-place (e.g. an in-place sort can't allocate an $O(n)$ auxiliary buffer, but a merely-destructive one could, as long as it writes its final result back into $A$).

The baseline every real sort improves on: **permutation sort** tries every one of the $n!$ permutations of $A$ and checks each for sortedness in $\\Theta(n)$, correct by pure brute-force case analysis but $\\Omega(n! \\cdot n)$ — exponential, and a useful reminder that "provably correct" and "efficient" are separate concerns that both need arguing. Insertion sort and selection sort are both in-place ($O(1)$ extra space, $O(n^2)$ time); merge sort is destructive but not in-place ($O(n)$ auxiliary space for the merge step) in its standard formulation.`,
    pitfall:
      "'In-place' does not mean O(1) time — it's purely a space classification. An O(n²) in-place sort and an O(n log n) non-in-place sort make an honest time-vs-space trade, not a strict improvement in one direction.",
  },
  {
    id: "mit6006-sorting-hashing-recurrence-methods",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What three techniques does 6.006 name for solving recurrences, and when do you reach for each?",
    back: `1. **Substitution**: guess a closed form (e.g. $T(n) = \\Theta(n \\log n)$), plug it back into the recurrence, and verify the guess is self-consistent with the right constants. Fast when you already suspect the answer (e.g. from a similar recurrence you've seen).
2. **Recurrence tree**: draw the tree of recursive calls, sum the non-recursive work done at each level, and add across levels. Most useful when the guess for substitution isn't obvious — the tree often *reveals* the right guess by making the per-level pattern visible (e.g. merge sort's $\\Theta(n)$-per-level, $\\log_2 n$ levels, gives $\\Theta(n \\log n)$ directly by inspection).
3. **Master Theorem**: a closed-form formula for recurrences of the shape $T(n) = aT(n/b) + f(n)$ — fastest when your recurrence matches that exact shape, useless otherwise (e.g. it doesn't apply to $T(n) = T(n-1) + T(n-2) + O(1)$).

All three should agree when applicable — 6.006 typically shows a recurrence's substitution proof and its recurrence-tree derivation side by side as a consistency check, since the tree makes an incorrect guess visibly fail to balance. For the full derivations and worked cases (including all three Master Theorem cases), see the related complexity-analysis cards.`,
    related: ["complexity-analysis-recurrence-relations", "complexity-analysis-master-theorem-overview"],
  },
  {
    id: "mit6006-sorting-hashing-direct-access-sort",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a Direct Access Array give a linear-time sort, and what breaks when the key range is too large?",
    back: `If every item has a distinct non-negative integer key in $\\{0, \\ldots, u-1\\}$, insert each into a direct-access array of size $u$ (index = key), then read the array out in index order — items land back in sorted order automatically. Cost: $\\Theta(n)$ to insert plus $\\Theta(u)$ to scan the array, so $\\Theta(u)$ overall — linear time if $u = \\Theta(n)$.

Two things break this once $u$ grows large relative to $n$: (1) scanning $\\Theta(u)$ empty slots dominates once $u \\gg n$, and (2) storing *one* item per slot can't handle **repeated keys** at all — a second item with the same key just overwrites the first. The fix for (1), when $u$ is as large as $n^2$: represent each key $k$ as a base-$n$ 2-tuple $(a, b) = \\text{divmod}(k, n)$ (so $a, b < n$) and sort tuples least-significant-digit-first using a smaller auxiliary direct-access array per digit — this is **tuple sort**. The fix for (2) is to store a **chain** (an insertion-order-preserving sequence) at each index instead of a single item — this is exactly **Counting Sort**, and combining tuple sort with counting sort as the per-digit auxiliary sort is **Radix Sort** (see the related card for the resulting linear-time argument). Both fixes are needed together for keys with a large range and possible repeats.`,
    code: `def direct_access_sort(A):
    "Sort A assuming items have distinct non-negative keys"
    u = 1 + max(x.key for x in A)   # O(n) find max key
    D = [None] * u                  # O(u) direct access array
    for x in A:                     # O(n) insert items
        D[x.key] = x
    i = 0
    for key in range(u):            # O(u) read out in order
        if D[key] is not None:
            A[i] = D[key]
            i += 1`,
    pitfall:
      "Direct access array sort silently produces a wrong (shorter) output if keys repeat — the last item written to a given index overwrites all earlier ones with the same key, which is exactly why Counting Sort's per-index chain (not a single slot) is necessary once repeated keys are possible.",
    related: ["mit6006-sorting-hashing-direct-access-array", "mit6006-sorting-hashing-radix-sort-derivation", "sorting-counting-sort"],
  },
  {
    id: "mit6006-sorting-hashing-radix-sort-derivation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does Radix Sort run in O(n) time specifically when every key is at most n^c for constant c?",
    back: `Radix sort is tuple sort (sort least-significant digit first, most-significant last, using a **stable** sort for each digit so earlier sorting passes aren't undone) with **Counting Sort** as the per-digit auxiliary sort. Represent every key in base $n$: if every key is $< n^c$, it has at most $c$ base-$n$ digits, each digit itself a value in $\\{0, \\ldots, n-1\\}$ — small enough that Counting Sort on a single digit costs $O(n)$ (a direct-access array of size $n$, i.e. $u = \\Theta(n)$ for that pass).

Doing this for all $c$ digits costs $O(cn)$ total. If $c$ is a **constant** — equivalently, if the key universe satisfies $u \\leq n^c$ for some fixed $c$, i.e. $c = \\log_n u$ is bounded — then $O(cn) = O(n)$, linear time overall despite Radix Sort using $c$ full passes. This is a genuinely different way of beating the $\\Omega(n \\log n)$ comparison-sort bound than counting sort alone: counting sort needs $u = O(n)$ directly (one pass, one wide direct-access array), while radix sort tolerates a *polynomially* larger universe ($u$ up to $n^c$) by spending $c$ narrower passes instead of one wide one.`,
    pitfall:
      "The linear bound requires c to be a constant independent of n — if the key range grows faster than any fixed power of n (c itself grows with n), radix sort's O(cn) stops being O(n), and you're back to needing a comparison sort or accepting the larger bound honestly.",
    related: ["mit6006-sorting-hashing-direct-access-sort", "sorting-radix-sort", "sorting-counting-sort"],
  },
];
