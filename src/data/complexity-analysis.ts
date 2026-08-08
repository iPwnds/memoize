import type { Card } from "./types";

const MODULE = "complexity-analysis";

export const complexityAnalysisCards: Card[] = [
  // ------------------------------------------------------------- Notation
  {
    id: "complexity-analysis-big-o",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does Big-O notation formally mean?",
    back: `$f(n) = O(g(n))$ means $f$ grows **no faster than** $g$, asymptotically: there exist constants $c > 0$ and $n_0$ such that $f(n) \\leq c \\cdot g(n)$ for all $n \\geq n_0$.

Everyday intuition: Big-O describes an **upper bound** on growth rate — "this algorithm takes at most roughly this much time/space as input grows," ignoring constant factors and lower-order terms. When people casually say "the complexity is O(n log n)," they usually mean it as a tight bound (which is technically Θ), but formally O only promises "not worse than."`,
    code: `# O(n) — one pass, cost scales linearly with input size
def contains(arr, target):
    for x in arr:
        if x == target:
            return True
    return False`,
    pitfall:
      "O(n) does not mean 'exactly n operations' — it means 'bounded above by some constant multiple of n.' O(n) and O(1) are both valid (looser) upper bounds for an O(1) algorithm; Big-O alone doesn't tell you the bound is tight.",
    related: ["complexity-analysis-big-omega", "complexity-analysis-big-theta"],
  },
  {
    id: "complexity-analysis-big-omega",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does Big-Ω (Big-Omega) notation formally mean?",
    back: `$f(n) = \\Omega(g(n))$ means $f$ grows **at least as fast as** $g$: there exist constants $c > 0$ and $n_0$ such that $f(n) \\geq c \\cdot g(n)$ for all $n \\geq n_0$.

It's the mirror image of Big-O — a **lower bound** instead of an upper bound. "Any comparison sort is $\\Omega(n \\log n)$" means no comparison sort can beat that growth rate, no matter how cleverly written.`,
    pitfall:
      "Ω describes a lower bound on the algorithm's growth, not a claim about the best case specifically — it's easy to conflate 'Ω' with 'best case' and 'O' with 'worst case,' but they're independent axes (bound type vs. input scenario). See the best/average/worst-case card for that distinction.",
    related: ["complexity-analysis-big-o", "complexity-analysis-big-theta", "complexity-analysis-bound-vs-case"],
  },
  {
    id: "complexity-analysis-big-theta",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does Big-Θ (Big-Theta) notation formally mean?",
    back: `$f(n) = \\Theta(g(n))$ means $f$ is **tightly bounded** by $g$ from both sides: $f(n) = O(g(n))$ **and** $f(n) = \\Omega(g(n))$. Equivalently, there exist $c_1, c_2 > 0$ and $n_0$ such that $c_1 \\cdot g(n) \\leq f(n) \\leq c_2 \\cdot g(n)$ for all $n \\geq n_0$.

This is what people usually *mean* in casual conversation when they say an algorithm "is O(n log n)" — a precise characterization of growth rate, not just an upper bound. Merge sort is $\\Theta(n \\log n)$: it's never asymptotically faster or slower than that, in every case.`,
    pitfall:
      "Saying an algorithm 'is O(n)' when you actually know it's Θ(n) is technically correct but throws away information — prefer Θ when you know the bound is tight.",
    related: ["complexity-analysis-big-o", "complexity-analysis-big-omega"],
  },
  {
    id: "complexity-analysis-bound-vs-case",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "How are O/Θ/Ω notation and best/average/worst-case analysis different axes, not the same thing?",
    back: `They answer different questions and can be combined:

- **O, Θ, Ω** describe the *type of bound* on a growth rate (upper, tight, lower).
- **Best/average/worst case** describe *which input scenario* you're analyzing.

You can (and often must) apply notation to any of the three cases: quicksort's **worst case** is $O(n^2)$ (and that bound is tight, so also $\\Theta(n^2)$), while its **average case** is $\\Theta(n \\log n)$. "Quicksort is O(n log n)" is an incomplete claim without saying which case — and in fact false as an unqualified worst-case claim.

A precise statement names both: "Binary search is $\\Theta(\\log n)$ in the worst case."`,
    pitfall:
      "The single most common notation error: treating O as synonymous with 'worst case' and Ω as synonymous with 'best case.' They're orthogonal — you can state an Ω bound on the worst case, or an O bound on the best case.",
    related: ["complexity-analysis-best-average-worst"],
  },

  // ------------------------------------------------------ Best/avg/worst
  {
    id: "complexity-analysis-best-average-worst",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What do best-case, average-case, and worst-case analysis each measure?",
    back: `Three different questions about the same algorithm, evaluated over the space of possible inputs of size $n$:

- **Best case**: the input that minimizes running time. Rarely a design target, but useful to know when it's misleadingly good (e.g. "sorted input" for insertion sort).
- **Worst case**: the input that maximizes running time. The standard guarantee to design for and cite — it bounds you no matter what input arrives, including adversarial ones.
- **Average case**: expected running time over some assumed input distribution (often "uniformly random"). Requires an explicit distributional assumption — an average case is only as meaningful as that assumption is realistic.

**Linear search** for a target in an unsorted array of $n$ elements: best case $O(1)$ (target is first), worst case $O(n)$ (target is last or absent), average case $O(n)$ assuming a uniformly random position (expected $n/2$ comparisons, still linear).`,
    complexity: {
      structure: "Linear Search",
      operations: [
        { op: "Best case", time: "O(1)" },
        { op: "Average case", time: "O(n)" },
        { op: "Worst case", time: "O(n)" },
      ],
    },
    pitfall:
      "Worst case is the default you should cite unless told otherwise — quoting an algorithm's best case as if it were representative is a common way to make a slow algorithm look fast.",
    related: ["complexity-analysis-bound-vs-case"],
  },

  // ------------------------------------------------------ Time vs space
  {
    id: "complexity-analysis-time-space-tradeoff",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "What is the time-space trade-off, with concrete examples?",
    back: `Many algorithms can trade memory for speed, or vice versa — using extra space to avoid recomputation, or recomputing to avoid storing.

- **Memoization**: naive recursive Fibonacci is $O(2^n)$ time, $O(n)$ space (call stack). Caching results per input drops it to $O(n)$ time at the cost of $O(n)$ space for the cache — a direct time-for-space trade.
- **Hash map lookup**: $O(1)$ average time to check membership, at the cost of $O(n)$ space to store the set, versus $O(n)$ time / $O(1)$ space for a linear scan with no auxiliary storage.
- **Precomputed lookup tables**: replacing a $O(\\log n)$ or $O(n)$ computation with an $O(1)$ array read, paying storage proportional to the domain size upfront.
- **In-place vs. auxiliary-buffer algorithms**: quicksort ($O(\\log n)$ extra space) vs. merge sort ($O(n)$ extra space) for the same $O(n \\log n)$ time bound — merge sort spends space to guarantee no bad-case time blowup.

The trade-off isn't always available — some problems have proven lower bounds on the product of time and space (used, and no such trade exists) — but it's the first lever to consider when either time or space is the binding constraint.`,
    pitfall:
      "Reflexively trading space for time is not free in practice — cache misses on a large lookup table can be slower than a tight recomputation that stays in L1/L2 cache, even though the lookup 'is O(1)'.",
    related: ["complexity-analysis-complexity-ladder"],
  },

  // -------------------------------------------------------- Loop analysis
  {
    id: "complexity-analysis-single-loops",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What's the time complexity of this function, and why?\n```python\ndef sum_array(arr):\n    total = 0\n    for x in arr:\n        total += x\n    return total\n```",
    back: `$O(n)$. The loop executes once per element, and each iteration does $O(1)$ work (one addition). Total work is $n \\times O(1) = O(n)$.

General rule for a single loop: if the loop runs $k$ times and each iteration is $O(1)$, the loop is $O(k)$. If each iteration itself does $O(m)$ work (e.g. a nested operation), the loop is $O(k \\cdot m)$.`,
    related: ["complexity-analysis-nested-loops"],
  },
  {
    id: "complexity-analysis-nested-loops",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "What's the complexity of this, and does the inner loop's shrinking bound change the asymptotic answer?\n```python\ndef count_pairs(arr):\n    n = len(arr)\n    count = 0\n    for i in range(n):\n        for j in range(i + 1, n):\n            count += 1\n    return count\n```",
    back: `Still $O(n^2)$, even though the inner loop shrinks each time. The total number of iterations is $\\sum_{i=0}^{n-1} (n - i - 1) = \\frac{n(n-1)}{2}$, which is $\\Theta(n^2)$ — the constant factor of $\\frac{1}{2}$ is dropped by asymptotic notation, but the quadratic shape survives.

General rule: two nested loops each ranging over roughly $n$ (even if one's bound depends on the other, as long as it's a linear function of $n$) multiply to $O(n^2)$. This is the mechanical reason "nested loop over the same input" is the go-to signature of an $O(n^2)$ algorithm — bubble/selection/insertion sort, naive pairwise comparison, etc.`,
    pitfall:
      "A shrinking inner bound (like `range(i+1, n)`) is a classic case people mistakenly think is 'better than O(n²)' because it 'does less work than a full nested loop.' It's asymptotically identical — only the constant factor (here, ½) changes.",
    related: ["complexity-analysis-single-loops"],
  },
  {
    id: "complexity-analysis-recursive-calls",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "What's the time complexity of naive recursive Fibonacci, and why is it so much worse than the iterative version?\n```python\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n```",
    back: `$O(2^n)$. Each call to \`fib(n)\` (for $n > 1$) makes two more recursive calls, forming a binary call tree of depth $n$. Since there's no caching, the same subproblems (e.g. \`fib(n-2)\`) get recomputed from scratch every time they're reached via a different path — the tree has $O(2^n)$ nodes total.

Contrast with the iterative (or memoized) version, which computes each value exactly once: $O(n)$ time, $O(1)$ (iterative) or $O(n)$ (memoized, for the cache) space. This is the canonical example of "overlapping subproblems without memoization" — see the Dynamic Programming module for the general pattern.

To analyze recursive complexity in general: write the **recurrence relation** the calls satisfy — here $T(n) = T(n-1) + T(n-2) + O(1)$ — and solve it (directly, by recursion tree, or via the Master Theorem when it applies).`,
    complexity: {
      structure: "Recursive Fibonacci",
      operations: [
        { op: "Naive recursive", time: "O(2ⁿ)", space: "O(n)", note: "call stack depth" },
        { op: "Memoized / iterative", time: "O(n)", space: "O(n) / O(1)" },
      ],
    },
    pitfall:
      "This exact recurrence, $T(n) = T(n-1) + T(n-2) + O(1)$, is not of the form the Master Theorem covers (it needs $T(n) = aT(n/b) + f(n)$ with a fixed *division* of the input, not a fixed *subtraction*) — you can't apply the Master Theorem here directly; a recursion-tree or generating-function argument is needed instead.",
    related: ["complexity-analysis-recurrence-relations", "complexity-analysis-complexity-ladder"],
  },

  // -------------------------------------------------- Recurrences & Master Thm
  {
    id: "complexity-analysis-recurrence-relations",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a recurrence relation, and how do you derive one from recursive code?",
    back: `A recurrence relation expresses the running time of a recursive algorithm on input size $n$ in terms of its running time on smaller inputs. To derive one from code, identify:

1. **How many recursive calls** are made (this becomes $a$).
2. **What fraction of the input** each call gets (this becomes $b$, if the input shrinks by a fixed division — $n/b$).
3. **How much non-recursive work** happens per call, outside the recursive calls themselves — the partition/combine/merge step (this becomes $f(n)$).

That gives the standard form $T(n) = aT(n/b) + f(n)$, which the Master Theorem solves directly when applicable (see the Master Theorem cards). Merge sort: two calls on half the input each, plus $O(n)$ merge work → $T(n) = 2T(n/2) + O(n)$. Binary search: one call on half the input, $O(1)$ non-recursive work → $T(n) = T(n/2) + O(1)$.`,
    pitfall:
      "Not every recursive algorithm's recurrence has the a·T(n/b) shape — recursion that shrinks the input by subtraction rather than division (like naive Fibonacci: T(n) = T(n-1) + T(n-2)) needs different tools (recursion tree, characteristic equation), not the Master Theorem.",
    related: ["complexity-analysis-master-theorem-overview"],
  },
  {
    id: "complexity-analysis-master-theorem-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the Master Theorem, and what form of recurrence does it solve?",
    back: `For recurrences of the form $T(n) = aT(n/b) + f(n)$ — $a \\geq 1$ subproblems, each of size $n/b$ ($b > 1$), plus $f(n)$ work to divide/combine — the Master Theorem gives $T(n)$ directly by comparing $f(n)$ against $n^{\\log_b a}$ (the cost if there were no combine work, i.e. how much the branching alone would cost).

Three cases, depending on which term dominates:

- **Case 1**: combine work is asymptotically smaller than the branching cost → $T(n) = \\Theta(n^{\\log_b a})$.
- **Case 2**: combine work matches the branching cost (up to a log factor) → $T(n) = \\Theta(n^{\\log_b a} \\log n)$.
- **Case 3**: combine work dominates → $T(n) = \\Theta(f(n))$.

See the three worked-example cards for each case in detail.`,
    pitfall:
      "The Master Theorem only applies when subproblems are equal-sized divisions (n/b) — not when they're unequal (like T(n) = T(n/3) + T(2n/3) + O(n), which needs the more general Akra-Bazzi method) and not when the recurrence subtracts rather than divides.",
    related: ["complexity-analysis-master-theorem-case1", "complexity-analysis-master-theorem-case2", "complexity-analysis-master-theorem-case3"],
  },
  {
    id: "complexity-analysis-master-theorem-case1",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Master Theorem Case 1 — worked example",
    back: `**Case 1** applies when $f(n) = O(n^{\\log_b a - \\epsilon})$ for some $\\epsilon > 0$ — the combine work is *polynomially smaller* than the cost implied by branching alone. Result: $T(n) = \\Theta(n^{\\log_b a})$, i.e. the recursive branching dominates and the combine step is asymptotically irrelevant.

**Example**: $T(n) = 8T(n/2) + O(n^2)$ (a naive divide-and-conquer cubing-style recurrence — 8 subproblems each half the size, with quadratic combine work). Here $a=8$, $b=2$, so $n^{\\log_b a} = n^{\\log_2 8} = n^3$. Since $f(n) = n^2 = O(n^{3 - 1})$, Case 1 applies with $\\epsilon = 1$.

$$T(n) = \\Theta(n^3)$$

The 8-way branching (cost $n^3$) swamps the $O(n^2)$ combine work completely.`,
    related: ["complexity-analysis-master-theorem-overview", "complexity-analysis-master-theorem-case2"],
  },
  {
    id: "complexity-analysis-master-theorem-case2",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Master Theorem Case 2 — worked example (merge sort)",
    back: `**Case 2** applies when $f(n) = \\Theta(n^{\\log_b a} \\log^k n)$ for some $k \\geq 0$ — the combine work *matches* the branching cost (in the common case $k=0$, exactly matches; the general form allows a log factor). Result: $T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n)$.

**Example — merge sort**: $T(n) = 2T(n/2) + O(n)$. Here $a=2$, $b=2$, so $n^{\\log_b a} = n^{\\log_2 2} = n^1 = n$. The combine work $f(n) = n = \\Theta(n^1 \\log^0 n)$, so $k = 0$ and Case 2 applies.

$$T(n) = \\Theta(n^1 \\log^{0+1} n) = \\Theta(n \\log n)$$

This is the formal justification for merge sort's $\\Theta(n \\log n)$ bound: branching cost and combine (merge) cost are perfectly balanced at every level of recursion, and there are $\\log n$ levels each doing $\\Theta(n)$ total work.`,
    related: ["complexity-analysis-master-theorem-overview", "complexity-analysis-master-theorem-case1"],
  },
  {
    id: "complexity-analysis-master-theorem-case3",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Master Theorem Case 3 — worked example",
    back: `**Case 3** applies when $f(n) = \\Omega(n^{\\log_b a + \\epsilon})$ for some $\\epsilon > 0$ (combine work is *polynomially larger* than the branching cost), **and** the regularity condition $a \\cdot f(n/b) \\leq c \\cdot f(n)$ holds for some $c < 1$ and large $n$ (this technical condition is satisfied by essentially all polynomial $f(n)$ you'll encounter). Result: $T(n) = \\Theta(f(n))$ — the combine step dominates completely, and branching is asymptotically irrelevant.

**Example**: $T(n) = 2T(n/2) + O(n^2)$ (two subproblems of half the size, but an expensive $O(n^2)$ combine step — e.g. a divide-and-conquer algorithm whose merge step itself does a nested comparison). Here $a=2, b=2$, so $n^{\\log_b a} = n^1$. Since $f(n) = n^2 = \\Omega(n^{1+1})$, Case 3 applies with $\\epsilon=1$, and the regularity condition holds for $f(n)=n^2$.

$$T(n) = \\Theta(n^2)$$

The expensive combine step dominates; the recursive branching barely matters.`,
    pitfall:
      "Forgetting to check the regularity condition is the most common Case-3 mistake in coursework — it's automatically satisfied for any polynomial f(n), which is why it's rarely mentioned in worked examples, but it is technically required for the case to apply.",
    related: ["complexity-analysis-master-theorem-overview", "complexity-analysis-master-theorem-case2"],
  },

  // -------------------------------------------------------- Amortized
  {
    id: "complexity-analysis-amortized-intro",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does 'amortized' complexity mean, and how is it different from average case?",
    back: `Amortized analysis bounds the **average cost per operation over a worst-case sequence of operations**, not over a probabilistic distribution of inputs. It's a guarantee: no matter what sequence of operations an adversary throws at the data structure, the *total* cost divided by the number of operations is bounded — even though any *single* operation might occasionally be expensive.

Classic example: appending to a dynamic array (Python \`list.append\`) is $O(1)$ **amortized**, even though any individual append that triggers a resize costs $O(n)$. This is not a claim about "average" input distribution — it's a worst-case guarantee about the *sequence*.

Two standard proof techniques: the **aggregate method** and the **accounting method** (see their own cards) — plus a third, the potential method, which formalizes the accounting method's "banked credit" idea using a potential function.`,
    pitfall:
      "Amortized O(1) does NOT mean every individual operation is fast — an amortized-O(1) structure can still have an occasional O(n) operation. It means the total cost over any sequence of m operations is O(m), so no adversarial sequence can force sustained bad performance.",
    related: ["complexity-analysis-amortized-vs-average", "complexity-analysis-aggregate-method", "complexity-analysis-accounting-method"],
  },
  {
    id: "complexity-analysis-amortized-vs-average",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Amortized complexity vs. average-case complexity — these get confused constantly. What's the actual difference?",
    back: `| | Amortized | Average case |
|---|---|---|
| What varies | A **sequence of operations** on one structure | The **input** to a single run |
| Guarantee type | Worst-case over all possible sequences | Expected value over an assumed input distribution |
| Adversary-proof? | Yes — holds even for an adversarially chosen sequence | No — a distribution assumption can be violated by real data |
| Example | Dynamic array append: O(1) amortized, guaranteed | Quicksort: O(n log n) average, assuming random pivots/input |

The key distinction: amortized bounds are a genuine worst-case guarantee (about sequences of operations), while average-case bounds depend on an assumption about input distribution that may or may not hold in practice. Quicksort's average case can degrade on adversarial input; a dynamic array's amortized O(1) append cannot be broken by any sequence, adversarial or not.`,
    pitfall:
      "Calling quicksort's O(n log n) 'amortized' is a category error — that's an average-case bound over random inputs/pivots, not an amortized bound over a sequence of operations on a persistent structure.",
    related: ["complexity-analysis-amortized-intro", "complexity-analysis-bound-vs-case"],
  },
  {
    id: "complexity-analysis-aggregate-method",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the aggregate method prove an amortized bound? (dynamic array example)",
    back: `The aggregate method sums the **total cost of a worst-case sequence of $m$ operations**, then divides by $m$ to get the amortized cost per operation — no per-operation bookkeeping, just a global sum.

**Dynamic array append, doubling growth**: starting from capacity 1, appending $n$ elements triggers resizes at sizes $1, 2, 4, 8, ..., n$. Each resize of size $k$ costs $O(k)$ to copy. Total resize cost:
$$1 + 2 + 4 + \\cdots + n \\leq 2n = O(n)$$
(a geometric series sums to less than twice its largest term). Add the $O(1)$ cost of each of the $n$ non-resizing appends: total cost is $O(n) + O(n) = O(n)$ for $n$ appends, so the **amortized cost per append is $O(n)/n = O(1)$.**

This is exactly why growth-factor doubling (not fixed-increment growth) is what makes dynamic arrays amortized O(1) — see the Core Linear Structures module for why a fixed increment fails this.`,
    complexity: {
      structure: "Dynamic Array",
      operations: [
        { op: "Append", time: "O(1) amortized", note: "O(n) worst case on a single resizing call" },
      ],
    },
    related: ["complexity-analysis-amortized-intro", "complexity-analysis-accounting-method"],
  },
  {
    id: "complexity-analysis-accounting-method",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the accounting method prove an amortized bound? (dynamic array example)",
    back: `The accounting method assigns each operation an **amortized charge** (possibly more than its actual immediate cost), banking the surplus as "credit" on specific data, and later withdrawing that credit to pay for expensive operations — as long as the credit balance never goes negative, the charged amortized cost is a valid upper bound.

**Dynamic array append**: charge each append **3 credits** (its amortized cost), even though a non-resizing append only actually costs 1.
- 1 credit pays for inserting the new element itself.
- 1 credit is banked on the new element, earmarked to pay for it being copied during some *future* resize.
- 1 credit is banked on the element that's already at the midpoint of the array, earmarked to help pay for copying an *older* element during that same future resize.

When a resize to size $2k$ eventually happens, every one of the $k$ existing elements has exactly 1 banked credit sitting on it — exactly enough to pay for its own copy. Balance never goes negative, so charging 3 credits per append is a valid amortized bound: $O(1)$.`,
    pitfall:
      "The accounting method's charge is a bookkeeping device, not a claim about real cost — a single append genuinely costs O(1) or O(n) depending on whether it resizes; the '3 credits' is just what makes the invariant provable.",
    related: ["complexity-analysis-aggregate-method", "complexity-analysis-amortized-intro"],
  },
  {
    id: "complexity-analysis-aggregate-vs-accounting",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Aggregate method vs. accounting method for amortized analysis — when is each more natural?",
    back: `Both prove the same kinds of bounds; they differ in mechanics and what they make easy:

- **Aggregate method**: sum total cost over $m$ operations, divide by $m$. Simple and direct when the total cost has a clean closed form (like a geometric series) — best when *all* operations in the sequence are the same type (e.g. all appends).
- **Accounting method**: assign per-operation-type charges and track banked credit. More flexible when a structure has **multiple operation types with different costs** (e.g. a structure supporting both insert and delete, or a stack with a multi-pop operation) — you can charge each operation type its own amortized rate and reason locally about credit invariants, rather than needing one global sum over a mixed sequence.

In practice: reach for the aggregate method first (it's simpler); switch to the accounting method when the sequence mixes distinct operation types with different natural costs.`,
    related: ["complexity-analysis-aggregate-method", "complexity-analysis-accounting-method"],
  },

  // ------------------------------------------------------ Complexity ladder
  {
    id: "complexity-analysis-complexity-ladder",
    tier: 1,
    module: MODULE,
    type: "concept",
    front:
      "What's the standard complexity ladder from O(1) to O(n!), with a concrete algorithm at each rung?",
    back: `From fastest to slowest growth:

| Complexity | Example algorithm |
|---|---|
| $O(1)$ | Array index access; hash map lookup (average case) |
| $O(\\log n)$ | Binary search on a sorted array |
| $O(n)$ | Linear search; single pass array sum |
| $O(n \\log n)$ | Merge sort, heapsort, any comparison-sort-optimal algorithm |
| $O(n^2)$ | Bubble/selection/insertion sort; naive nested-loop pairwise comparison |
| $O(2^n)$ | Naive recursive Fibonacci; enumerating all subsets of a set of size $n$ |
| $O(n!)$ | Brute-force traveling salesman (try every permutation of cities); generating all permutations |

Each rung represents a qualitatively different *shape* of growth, not just "slower" — the gap between $O(n^2)$ and $O(2^n)$ at $n=100$ is the difference between "instant" and "longer than the age of the universe," which is categorically different from the gap between $O(n)$ and $O(n^2)$ (see the growth-at-scale card for concrete numbers).`,
    complexity: {
      structure: "Complexity Class Reference",
      operations: [
        { op: "O(1)", time: "constant", note: "array index, hash lookup" },
        { op: "O(log n)", time: "logarithmic", note: "binary search" },
        { op: "O(n)", time: "linear", note: "linear scan" },
        { op: "O(n log n)", time: "linearithmic", note: "merge sort, heapsort" },
        { op: "O(n²)", time: "quadratic", note: "nested loop, elementary sorts" },
        { op: "O(2ⁿ)", time: "exponential", note: "subset enumeration, naive Fibonacci" },
        { op: "O(n!)", time: "factorial", note: "permutation enumeration, brute-force TSP" },
      ],
    },
    related: ["complexity-analysis-growth-at-scale"],
  },
  {
    id: "complexity-analysis-growth-at-scale",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Concretely, how do these growth rates compare at real input sizes?",
    back: `Approximate operation counts (illustrative, not exact runtimes):

| n | O(n) | O(n log n) | O(n²) | O(2ⁿ) | O(n!) |
|---|---|---|---|---|---|
| 10 | 10 | ~33 | 100 | 1,024 | 3,628,800 |
| 20 | 20 | ~86 | 400 | ~1,000,000 | ~2.4 × 10¹⁸ |
| 50 | 50 | ~282 | 2,500 | ~10¹⁵ | incomprehensibly large |

At $n=20$, $O(2^n)$ is already past a million operations, and $O(n!)$ is past a billion billion. This is *why* the distinction between polynomial-time ($O(n^k)$ for fixed $k$) and exponential-time algorithms is treated as a hard boundary in complexity theory (see NP-Completeness, Tier 3) rather than just "one is slower" — beyond roughly $n=40$–$50$, exponential/factorial algorithms are not "slow," they're **infeasible**, regardless of how fast the hardware is.`,
    pitfall:
      "It's tempting to think faster hardware 'solves' exponential blowup — but doubling CPU speed only lets an O(2ⁿ) algorithm handle one additional unit of n. The algorithmic class matters far more than the constant factor once n is large enough.",
    related: ["complexity-analysis-complexity-ladder"],
  },
];
