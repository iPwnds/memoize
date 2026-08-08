// MIT 6.006 (Spring 2020) — Lectures 1-2: Algorithms and Computation, Data
// Structures. Course-specific framing and vocabulary (Word-RAM, the
// Sequence/Set interfaces, the "reduce or design" problem-solving process)
// that the generic curriculum doesn't use verbatim. Where the underlying
// idea is already covered in depth elsewhere (dynamic array doubling,
// amortized analysis, linked lists), these cards stay thin and link out
// rather than re-teaching it — see src/data/courses.ts for how this module
// fits into the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6006-foundations";

export const mit6006FoundationsCards: Card[] = [
  {
    id: "mit6006-foundations-problem-vs-algorithm",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In 6.006's terms, how are a 'problem' and an 'algorithm' formally distinguished?",
    back: `A **problem** is a binary relation from inputs to *correct* outputs — for a given input there may be many acceptable outputs, so a problem is really a verifiable predicate correct outputs must satisfy, not a single mapping. An **algorithm** is a deterministic *procedure* mapping every input to a single output; it *solves* the problem if that output is always correct for every input in the (arbitrarily large) input space.

The gap between the two is the whole point: a problem statement only tells you what counts as correct, never how to compute it. 6.006 studies problems over **arbitrarily large general input spaces** (not one fixed instance) — "is there a repeated birthday among *these* 30 people" is a fixed instance you could answer by inspection; "given any $n$ people, is there a repeated birthday" is the general problem an algorithm must handle for every $n$.`,
    pitfall:
      "A procedure that returns correct answers on every example you tried is not the same as an algorithm that provably solves the problem — correctness has to be argued for the general input space, typically by induction (see the next card), not spot-checked on cases.",
    related: ["mit6006-foundations-induction-correctness", "mit6006-foundations-how-to-solve"],
  },
  {
    id: "mit6006-foundations-induction-correctness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does 6.006 insist correctness proofs for general-input algorithms use induction?",
    back: `An algorithm has fixed-size code but must handle an unbounded input space, so it can only do that by looping or recursing — and the only proof technique that scales to "works for every $n$" without checking each $n$ separately is **induction** on the size of the problem it has processed so far.

Worked shape (from the lecture's birthday-matching algorithm, which scans students one at a time and checks each new birthday against all previously seen ones): induct on $k$, the number of students processed. **Hypothesis**: if a matching pair exists among the first $k$, the algorithm has already returned it before looking at student $k+1$. **Base case** $k=0$: vacuously true, no students seen yet. **Inductive step**: assume the hypothesis for $k = k_0$; when student $k_0+1$ arrives, either a match already existed in the first $k_0$ (already returned, by the inductive hypothesis) or it didn't — in which case a match in the first $k_0+1$ must involve student $k_0+1$ specifically, and the algorithm explicitly checks that student's birthday against every prior record before moving on.

This is also why recursion is such a central tool in algorithm design, not just an implementation trick: a recursive algorithm's correctness proof and its code structure are often the same induction.`,
    pitfall:
      "Case analysis (checking small inputs by hand) is not a substitute for induction here — it proves correctness on the cases you checked, not on the unbounded general input space the problem is defined over.",
    related: ["mit6006-foundations-problem-vs-algorithm"],
  },
  {
    id: "mit6006-foundations-word-ram",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the Word-RAM model of computation, and what has to be true of the word size w?",
    back: `The **Word-RAM** is 6.006's model of computation: a specification of exactly which operations a machine can perform in $O(1)$ time, so that "efficient" has a machine-independent meaning instead of depending on clock speed. Memory is an addressable sequence of **machine words**, each a block of $w$ bits. In $O(1)$ time, the processor can perform arithmetic ($+, -, \\times, //, \\%$), logical ($\\&\\&, \\vert\\vert, !, ==, <, >$), and bitwise operations on a constant number of words, and can read or write the word at a given address.

The word size $w$ isn't free to pick arbitrarily: memory addresses themselves have to fit in a word, so $w$ must be at least $\\log_2(\\text{max addressable memory})$ — a 32-bit word can address roughly 4 GB, a 64-bit word roughly 16 exabytes. If $w$ were fixed independent of input size, you could "cheat" asymptotic bounds by packing unboundedly much data into single $O(1)$-time word operations, so the model ties word size to the address space it needs to support.

Python's runtime is a more complex model implemented *on top of* a Word-RAM — when reasoning about the true cost of a Python operation, you're really asking what it compiles down to in Word-RAM terms.`,
    pitfall:
      "Treating word size as unboundedly large relative to input size breaks the model — an algorithm that hides work inside 'one word operation' by using words that grow with n isn't actually O(1) per operation.",
  },
  {
    id: "mit6006-foundations-how-to-solve",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What two high-level strategies does 6.006 teach for approaching any new algorithms problem?",
    back: `1. **Reduce to a problem you already know how to solve** — recognize the new problem as an instance of a search problem (pick the right data structure: static array, linked list, dynamic array, sorted array, direct-access array, hash table, balanced BST, binary heap), a sorting problem (pick the right sort), or a shortest-path problem (pick the right graph algorithm), and reuse that known solution rather than inventing something new. This is almost always tried first — it's faster to argue correct and is usually what a quiz question wants.
2. **Design a new (typically recursive) algorithm** when no reduction applies — via **brute force**, **decrease-and-conquer**, **divide-and-conquer**, **dynamic programming**, or **greedy/incremental** design. Harder to get right and to prove correct, and the primary subject of the back half of this course (dynamic programming) and of 6.046.

The practical habit this produces: when facing an unfamiliar problem, first ask "is this secretly a search / sort / shortest-path problem in disguise?" before reaching for a from-scratch recursive design — reduction is cheaper and less error-prone whenever it applies.`,
    pitfall:
      "Jumping straight to designing a custom recursive algorithm without first checking whether the problem reduces to sorting or a known data-structure interface wastes time and increases the chance of a subtly wrong correctness argument.",
    related: ["mit6006-foundations-sequence-interface", "mit6006-foundations-set-interface"],
  },
  {
    id: "mit6006-foundations-sequence-interface",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What operations does 6.006's Sequence interface specify, and what does 'extrinsic order' mean?",
    back: `A **Sequence** maintains items in an **extrinsic** order — an item is "first" or "third" because something external placed it there, not because of any property of the item itself (contrast with Set, next card). Every sequence data structure in this course is judged by how fast it supports:

| Category | Operation | Meaning |
|---|---|---|
| Container | \`build(X)\` | build a sequence from iterable $X$ |
| | \`len()\` | number of stored items |
| Static | \`iter_seq()\` | yield stored items in order |
| | \`get_at(i)\` / \`set_at(i, x)\` | read/write the $i$-th item |
| Dynamic | \`insert_at(i, x)\` / \`delete_at(i)\` | add/remove at index $i$ |
| | \`insert_first(x)\` / \`delete_first()\` | add/remove at the front |
| | \`insert_last(x)\` / \`delete_last()\` | add/remove at the back |

Insert/delete at index $i$ shifts the rank of every item after it. **Stack** (\`insert_last\`+\`delete_last\`) and **queue** (\`insert_last\`+\`delete_first\`) are special cases that use only a subset of these operations. This interface/implementation split — one specification, many data structures (array, linked list, dynamic array, …) implementing it with different time bounds — is the organizing idea of the whole first third of the course.`,
    pitfall:
      "The interface says nothing about how operations are implemented or how fast they are — 'supports insert_at' doesn't mean O(1) insert_at; that's a property of the specific data structure, not the interface.",
    related: ["mit6006-foundations-set-interface", "mit6006-foundations-array-sequence", "mit6006-foundations-linked-list-sequence"],
  },
  {
    id: "mit6006-foundations-set-interface",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What operations does 6.006's Set interface specify, and how does 'intrinsic order' differ from Sequence?",
    back: `A **Set** maintains items based on an **intrinsic** property — each item $x$ has a key \`x.key\`, and queries are about *what the item is* (its key), not about externally-imposed position. This is the generalization of a dictionary / ordered map:

| Category | Operation | Meaning |
|---|---|---|
| Container | \`build(X)\` | build a set from iterable $X$ |
| | \`len()\` | number of stored items |
| Static | \`find(k)\` | return the item with key $k$ (or \`None\`) |
| Dynamic | \`insert(x)\` | add $x$, replacing any existing item with key \`x.key\` |
| | \`delete(k)\` | remove and return the item with key $k$ |
| Order | \`iter_ord()\` | yield items in key order |
| | \`find_min()\` / \`find_max()\` | item with smallest/largest key |
| | \`find_next(k)\` / \`find_prev(k)\` | smallest key $> k$ / largest key $< k$ |

A **dictionary** is the special case that drops the Order operations (\`find_min/max/next/prev\`) — pure key lookup without needing sorted access. Every "which data structure should I use" decision in this course starts by asking: does this problem need Sequence operations (position matters), Set operations (identity/key matters), or both?`,
    pitfall:
      "find_next(k) and find_prev(k) return the item with the nearest *different* key on either side of k, not k itself — and both return None at the boundary (no larger/smaller key exists), a case worth checking explicitly.",
    related: ["mit6006-foundations-sequence-interface", "mit6006-foundations-set-from-sequence"],
  },
  {
    id: "mit6006-foundations-array-sequence",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "In 6.006's Sequence-implementation table, why is a plain (static) array strong at Static ops and weak at Dynamic ops?",
    back: `A fixed-size array stores item $i$ at address $\\text{base} + i$, so the Word-RAM's $O(1)$ random memory access gives \`get_at(i)\`/\`set_at(i, x)\` in $\\Theta(1)$ time directly — no searching needed. But every Dynamic operation (\`insert_first\`, \`delete_first\`, \`insert_last\`, \`insert_at\`, \`delete_at\`) requires shifting all items after the modified index to keep the array contiguous, which is $\\Theta(n)$ in the worst case — and \`build(X)\` itself is $\\Theta(n)$ to allocate and fill.

$$\\begin{array}{l|ccccc}
\\text{Array} & \\texttt{build} & \\texttt{get/set\\_at} & \\texttt{insert/delete\\_first} & \\texttt{insert/delete\\_last} & \\texttt{insert/delete\\_at(i)} \\\\
\\hline
\\Theta(\\cdot) & n & 1 & n & n & n
\\end{array}$$

This is exactly the gap the Dynamic Array (amortizes \`insert/delete_last\` to $O(1)$) and Linked List (makes \`insert/delete_first\` $O(1)$ but \`get_at\` $O(n)$) each close from a different direction — see those cards, and the related linear-structures card below for the deeper array-vs-pointer-structure tradeoffs.`,
    complexity: {
      structure: "Array Sequence (6.006)",
      operations: [
        { op: "build(X)", time: "Θ(n)" },
        { op: "get_at(i) / set_at(i, x)", time: "Θ(1)" },
        { op: "insert/delete_first, insert/delete_last, insert/delete_at(i)", time: "Θ(n)" },
      ],
    },
    related: ["mit6006-foundations-dynamic-array-doubling", "mit6006-foundations-linked-list-sequence", "linear-structures-static-array"],
  },
  {
    id: "mit6006-foundations-linked-list-sequence",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "How does a Linked List Sequence's cost profile invert the Array's, and what stays slow?",
    back: `Each item lives in a node (\`node.item\`, \`node.next\`) that can sit anywhere in memory — relinking pointers is $O(1)$ regardless of where in the list it happens, so \`insert_first\`/\`delete_first\` (relink the head pointer) drop to $\\Theta(1)$. But there's no random access: finding the $i$-th node means walking $i$ pointers from the head, so \`get_at(i)\`/\`set_at(i, x)\` become $\\Theta(n)$ worst case — the exact inverse trade from a plain array.

$$\\begin{array}{l|ccccc}
\\text{Linked List} & \\texttt{build} & \\texttt{get/set\\_at} & \\texttt{insert/delete\\_first} & \\texttt{insert/delete\\_last} & \\texttt{insert/delete\\_at(i)} \\\\
\\hline
\\Theta(\\cdot) & n & n & 1 & n & n
\\end{array}$$

\`insert/delete_last\` stay $\\Theta(n)$ here because reaching the last node still requires walking the whole list — unless you *also* keep a tail pointer, which is exactly the fix Problem Set 1 in 6.006 asks for (making both ends $O(1)$ simultaneously). See the related singly-linked-list card for node-level implementation detail and pointer-manipulation pitfalls.`,
    complexity: {
      structure: "Linked List Sequence (6.006)",
      operations: [
        { op: "build(X)", time: "Θ(n)" },
        { op: "get_at(i) / set_at(i, x)", time: "Θ(n)" },
        { op: "insert_first(x) / delete_first()", time: "Θ(1)" },
        { op: "insert_last(x), insert/delete_at(i)", time: "Θ(n)" },
      ],
    },
    pitfall:
      "A plain head-pointer linked list is Θ(n) for insert_last/delete_last too, not just get_at — it's easy to remember 'linked lists are O(1) at the ends' and forget that's only true for the end you kept a direct pointer to.",
    related: ["mit6006-foundations-array-sequence", "linear-structures-singly-linked-list"],
  },
  {
    id: "mit6006-foundations-dynamic-array-doubling",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006 frame the dynamic array's fill ratio and doubling/shrinking thresholds?",
    back: `Define the **fill ratio** $r = n / (\\text{allocated space})$. Whenever the array fills up ($r = 1$), reallocate to a larger block sized so the new fill ratio is some target $r_i < 1$ (commonly $r_i = 1/2$, i.e. "table doubling"). Because the new allocation has $\\Theta(n)$ *extra* room, $\\Theta(n)$ more insertions must occur before the next reallocation — so the expensive $\\Theta(n)$ resize gets divided across $\\Theta(n)$ cheap insertions, giving $\\Theta(1)$ **amortized** cost per \`insert_last\`.

Shrinking needs its own threshold to avoid thrashing: naively resizing back down whenever $r$ drops below 1 means an alternating insert/delete/insert/delete sequence could trigger a resize on *every* operation. The fix: only shrink once $r$ drops below some $r_d < r_i$ (e.g. $r_d = 1/4$ when $r_i = 1/2$), leaving a gap between the two thresholds — so $\\Theta(n)$ cheap operations are again guaranteed between any two expensive resizes in either direction. Choosing $r_d = \\frac{1}{1+\\epsilon}$-style bounds lets you cap wasted space at $(1+\\epsilon)n$ for any $\\epsilon > 0$.

Python's actual list over-allocates by roughly $n/8$ (not a full doubling) on each growth — a gentler constant, same $\\Theta(1)$-amortized guarantee. For the general amortized-cost machinery (aggregate vs. accounting vs. potential method) this specific example instantiates, see the related amortized-analysis and doubling-growth-factor cards below.`,
    pitfall:
      "Resizing to exactly r=1 (no slack) on both growth and shrink reintroduces worst-case Θ(n) per operation under alternating insert/delete — the gap between the grow and shrink thresholds is what makes the amortized bound hold, not the doubling factor by itself.",
    related: ["complexity-analysis-amortized-intro", "linear-structures-doubling-growth-factor", "mit6006-foundations-array-sequence"],
  },
  {
    id: "mit6006-foundations-amortized-definition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is 6.006's working definition of 'amortized cost T(n)', stated precisely?",
    back: `An operation has **amortized cost** $T(n)$ if any sequence of $k$ calls to it costs at most $k \\cdot T(n)$ total — i.e. $T(n)$ "on average" over many operations, even though any *single* call might cost much more (or less). It's a guarantee about sequences of operations, not about any individual call: \`insert_last\` on a dynamic array is $\\Theta(1)$ amortized even though the specific call that triggers a resize costs $\\Theta(n)$, because that expensive call is always preceded by enough cheap ones to cover it.

This is the informal ("aggregate-style") definition 6.006 states directly; the related aggregate-method and accounting-method cards below cover the same idea with the formal proof techniques (aggregate analysis, accounting method, potential method) used to actually establish a $T(n)$ amortized bound rather than just assert one.`,
    pitfall:
      "Amortized is not the same guarantee as average-case: amortized bounds hold for *every* sequence of operations (a worst-case guarantee over sequences), while average-case depends on an assumed input distribution. See the related amortized-vs-average card for this exact distinction.",
    related: ["complexity-analysis-amortized-vs-average", "mit6006-foundations-dynamic-array-doubling"],
  },
  {
    id: "mit6006-foundations-set-from-sequence",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How do you implement the Set interface on top of any Sequence data structure (the recitation reduction)?",
    back: `Given *any* Sequence implementation, you can build a (slow but correct) Set by storing items unordered in the sequence and implementing every Set operation as a linear scan:

- \`find(k)\` / \`insert(x)\` / \`delete(k)\`: scan with \`get_at\`, comparing \`.key\`; \`insert\` overwrites in place if the key already exists, else appends via \`insert_last\`.
- \`find_min()\` / \`find_max()\`: scan once, tracking the extreme key seen.
- \`find_next(k)\` / \`find_prev(k)\`: scan once, tracking the closest key strictly greater/less than $k$ seen so far.
- \`iter_ord()\`: repeatedly call \`find_min\`/\`find_next\` — correct but $O(n)$ *per step*, so $O(n^2)$ to iterate the whole set in order.

Every operation costs $\\Theta(n)$ (or worse for full ordered iteration) — this is a **correctness-first reduction**, not an efficient data structure. Its value is pedagogical and practical: it's the base case that later lectures improve on (Sorted Array gets \`find\` to $O(\\log n)$; a balanced BST gets everything to $O(\\log n)$), and it's a direct instance of "reduce to a problem you already know" — implementing an unfamiliar interface (Set) entirely in terms of a familiar one (Sequence) you already have working code for.`,
    code: `def Set_from_Seq(seq):
    class set_from_seq:
        def __init__(self):  self.S = seq()
        def __len__(self):   return len(self.S)
        def __iter__(self):  yield from self.S

        def build(self, A):  self.S.build(A)

        def insert(self, x):
            for i in range(len(self.S)):
                if self.S.get_at(i).key == x.key:
                    self.S.set_at(i, x)
                    return
            self.S.insert_last(x)

        def find(self, k):
            for x in self:
                if x.key == k: return x
            return None

        def find_min(self):
            out = None
            for x in self:
                if out is None or x.key < out.key: out = x
            return out`,
    pitfall:
      "This reduction is intentionally not efficient — quoting it as your final answer to a 'design a Set with O(log n) operations' question misses the point; it's the starting point you improve on with a better underlying data structure, not the destination.",
    related: ["mit6006-foundations-set-interface", "mit6006-foundations-sequence-interface"],
  },
];
