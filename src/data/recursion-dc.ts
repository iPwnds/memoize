import type { Card } from "./types";

const MODULE = "recursion-dc";

export const recursionDcCards: Card[] = [
  // ---------------------------------------------------------- Fundamentals
  {
    id: "recursion-dc-fundamentals",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the essential parts of a correct recursive function?",
    back: `- **Base case**: the condition under which the function returns directly, without recursing — this is what stops the recursion. Every recursive function needs at least one.
- **Recursive case**: the function calls itself on a **smaller/simpler** version of the problem, then uses that result to build the answer for the current call.
- **Progress toward the base case**: each recursive call must move strictly closer to a base case (smaller input, decremented counter, shrinking range) — without this guarantee, recursion never terminates, regardless of a correct-looking base case existing.

Mechanically, each call gets its own **stack frame** holding its local variables and the return address to resume the caller — this is why deep, unbounded recursion causes a stack overflow (see the call-stack visualization card), and why recursion has $O(\\text{depth})$ space overhead that an equivalent iterative loop wouldn't.`,
    pitfall:
      "A base case that's merely reachable in theory isn't enough — if the recursive case doesn't guarantee monotonic progress toward it (e.g. recursing on n instead of n-1 due to a typo), you get infinite recursion regardless of a correctly written base case.",
    related: ["recursion-dc-call-stack-trace"],
  },
  {
    id: "recursion-dc-call-stack-trace",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "Trace the call stack for `factorial(4)` and show exactly when multiplications happen.\n```python\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n```",
    back: `Calls build **down** the stack before any multiplication happens, then multiplications happen **up** the stack as calls return:

\`\`\`
factorial(4) calls factorial(3) calls factorial(2) calls factorial(1)
                                                          returns 1
                                        factorial(2) returns 2 * 1 = 2
                          factorial(3) returns 3 * 2 = 6
factorial(4) returns 4 * 6 = 24
\`\`\`

Four stack frames exist simultaneously at the deepest point (\`factorial(4)\` through \`factorial(1)\`), each waiting on its pending multiplication until its inner call returns. This "build down, then resolve up" shape is the universal pattern for any recursion that does work *after* the recursive call (as opposed to tail recursion, which does all its work *before* recursing and could — in languages with tail-call optimization, which Python does not have — avoid growing the stack at all).`,
    related: ["recursion-dc-fundamentals"],
  },

  // -------------------------------------------------------------- D&C
  {
    id: "recursion-dc-paradigm",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the three steps of the divide-and-conquer paradigm?",
    back: `1. **Divide**: split the problem into smaller subproblems of the same kind (usually — though not always — roughly equal size).
2. **Conquer**: solve each subproblem recursively (base case: solve directly once small enough).
3. **Combine**: merge the subproblem solutions into a solution for the original problem.

The *shape* of a specific D&C algorithm is entirely determined by which step does the heavy lifting — see the next card for how merge sort, quicksort, and binary search each emphasize a different step. This three-step structure is exactly what the Master Theorem's $T(n) = aT(n/b) + f(n)$ formalizes: $a$ and $b$ describe "divide," the recursive calls describe "conquer," and $f(n)$ describes "combine."`,
    related: ["recursion-dc-paradigm-in-practice", "complexity-analysis-master-theorem-overview"],
  },
  {
    id: "recursion-dc-paradigm-in-practice",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Merge sort, quicksort, and binary search are all divide-and-conquer — which of the three steps (divide/conquer/combine) does the real work in each?",
    back: `| Algorithm | Divide | Conquer (recursive calls) | Combine |
|---|---|---|---|
| Merge sort | Trivial (split at midpoint) | 2 calls on halves | **Does all the work** — O(n) merge |
| Quicksort | **Does all the work** — O(n) partition | 2 calls on the resulting partitions | Trivial (already sorted, nothing to do) |
| Binary search | O(1) — compare against midpoint | **1** call on one half (not both) | Trivial — just return the recursive result |

This is a genuinely useful lens: merge sort's cost lives entirely in "combine," quicksort's lives entirely in "divide" (the partition step), and binary search is degenerate in a different way — only **one** recursive branch is taken at all, which is exactly why its recurrence $T(n) = T(n/2) + O(1)$ resolves to $O(\\log n)$ instead of $O(n \\log n)$ (see Master Theorem Case 1 for the general pattern of why $a=1$ branching gives a much smaller result than $a=2$).`,
    related: ["recursion-dc-paradigm", "sorting-merge-overview", "sorting-quicksort-overview"],
  },

  // -------------------------------------------------------- Closest pair
  {
    id: "recursion-dc-closest-pair",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the divide-and-conquer closest-pair-of-points algorithm achieve O(n log n)?",
    back: `Naive approach: check all $\\binom{n}{2}$ pairs, $O(n^2)$. The D&C approach:

1. **Divide**: sort points by x-coordinate (once, upfront); split into left and right halves by a vertical line through the median x.
2. **Conquer**: recursively find the closest pair in each half, giving distance $\\delta = \\min(\\delta_{\\text{left}}, \\delta_{\\text{right}})$.
3. **Combine** (the clever part): the true closest pair might straddle the dividing line — but only candidates within a **strip of width $2\\delta$** centered on the line can possibly beat $\\delta$. Within that strip, sort by y-coordinate and check each point only against the next few points in y-order — a geometric packing argument shows **at most 7-8 points need checking per point** (any more would force two points closer than $\\delta$ within one half, contradicting $\\delta$'s definition), making the strip check $O(n)$, not $O(n^2)$.

Recurrence: $T(n) = 2T(n/2) + O(n)$ — identical shape to merge sort — giving $\\Theta(n \\log n)$ by Master Theorem Case 2.`,
    complexity: {
      structure: "Closest Pair of Points",
      operations: [
        { op: "Naive (all pairs)", time: "O(n²)" },
        { op: "Divide-and-conquer", time: "O(n log n)" },
      ],
    },
    pitfall:
      "The 'check only ~7 neighbors in the strip' bound relies on the strip being built from points already known to be at least δ apart within their own half — skipping the y-sort within the strip (or checking against all strip points instead of just the next few in y-order) silently degrades this back to O(n²) in the worst case.",
    related: ["recursion-dc-paradigm", "complexity-analysis-master-theorem-case2"],
  },

  // ------------------------------------------------------------ Karatsuba
  {
    id: "recursion-dc-karatsuba",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Karatsuba multiplication beat the naive O(n²) grade-school algorithm?",
    back: `Split each $n$-digit number into two halves: $x = x_1 \\cdot 10^{n/2} + x_0$, $y = y_1 \\cdot 10^{n/2} + y_0$. The product is $x_1 y_1 \\cdot 10^n + (x_1 y_0 + x_0 y_1) \\cdot 10^{n/2} + x_0 y_0$ — naively this needs **4** half-size multiplications ($x_1y_1$, $x_1y_0$, $x_0y_1$, $x_0y_0$), giving the same $T(n) = 4T(n/2) + O(n)$ as grade-school, which is $O(n^2)$.

Karatsuba's trick: the **middle term** $x_1y_0 + x_0y_1$ can be recovered from **just one more multiplication** plus the two you already need for the outer terms: compute $z = (x_1+x_0)(y_1+y_0) = x_1y_1 + x_1y_0 + x_0y_1 + x_0y_0$, then the middle term is $z - x_1y_1 - x_0y_0$ — both of which you're already computing anyway. So only **3** multiplications total are needed ($x_1y_1$, $x_0y_0$, and $z$), plus $O(n)$ additions/subtractions/shifts.

Recurrence: $T(n) = 3T(n/2) + O(n)$. By Master Theorem: $a=3, b=2$, so $n^{\\log_2 3} \\approx n^{1.585}$; since $f(n) = O(n) = O(n^{1.585-\\epsilon})$, **Case 1** applies: $T(n) = \\Theta(n^{1.585})$ — asymptotically better than $O(n^2)$ for large $n$.`,
    complexity: {
      structure: "Karatsuba Multiplication",
      operations: [
        { op: "Grade-school", time: "O(n²)" },
        { op: "Karatsuba", time: "O(n^1.585)", note: "n^log₂3" },
      ],
    },
    pitfall:
      "Karatsuba only wins asymptotically for large n — the extra additions/subtractions overhead make grade-school multiplication faster in practice for small numbers, which is why real bignum libraries switch to Karatsuba only above a size threshold (and to even faster methods like Toom-Cook or FFT-based multiplication for very large numbers).",
    related: ["complexity-analysis-master-theorem-case1", "recursion-dc-strassen"],
  },

  // ------------------------------------------------------------- Strassen
  {
    id: "recursion-dc-strassen",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Strassen's algorithm beat the naive O(n³) matrix multiplication?",
    back: `Naive matrix multiplication of two $n \\times n$ matrices, split into four $n/2 \\times n/2$ quadrant submatrices each, needs **8** quadrant multiplications to compute the four output quadrants: $T(n) = 8T(n/2) + O(n^2)$, which resolves to $O(n^3)$ — no better than the standard triple-nested-loop algorithm.

Strassen found a way to compute the same result using only **7** quadrant multiplications, via 7 specific cleverly-combined linear combinations of the submatrices (analogous in spirit to Karatsuba's trick of trading a multiplication for extra additions, though the actual combinations are considerably more intricate — not worth memorizing the exact formulas for flashcard purposes, just the complexity implication).

Recurrence: $T(n) = 7T(n/2) + O(n^2)$. By Master Theorem: $a=7, b=2$, so $n^{\\log_2 7} \\approx n^{2.807}$; since $f(n) = O(n^2) = O(n^{2.807-\\epsilon})$, **Case 1** applies: $T(n) = \\Theta(n^{2.807})$ — better than $O(n^3)$.`,
    complexity: {
      structure: "Matrix Multiplication",
      operations: [
        { op: "Naive", time: "O(n³)" },
        { op: "Strassen's", time: "O(n^2.807)", note: "n^log₂7" },
      ],
    },
    related: ["recursion-dc-strassen-practical", "complexity-analysis-master-theorem-case1"],
  },
  {
    id: "recursion-dc-strassen-practical",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "If Strassen's algorithm is asymptotically faster, why isn't it the default in real linear algebra libraries?",
    back: `Two practical problems that Big-O hides:

1. **Constant factor and overhead**: the extra additions/subtractions per level of recursion give Strassen's a larger constant factor than the simple triple-loop naive algorithm, which is also extremely cache-friendly and trivially parallelizable/vectorizable. The crossover point where Strassen's actually wins in wall-clock time is often a few hundred rows — below that, naive (or a cache-blocked variant of naive) wins.
2. **Numerical stability**: Strassen's involves more additions and subtractions of intermediate values, which can amplify floating-point rounding error more than the direct multiply-and-accumulate pattern of naive multiplication — a real concern for numerically sensitive applications.

Production libraries (BLAS implementations like OpenBLAS, MKL) mostly rely on highly cache- and SIMD-optimized naive-style multiplication, sometimes switching to Strassen's or its variants only for very large matrices where the asymptotic win outweighs both concerns.`,
    pitfall:
      "This is a recurring theme across the curriculum: a better Big-O bound is not automatically a better real-world algorithm — Strassen's, Fibonacci heaps, and median-of-medians pivot selection are all textbook examples of asymptotically superior algorithms that lose to simpler ones in practice due to constant factors.",
    related: ["recursion-dc-strassen"],
  },

  // -------------------------------------------------------- Randomized
  {
    id: "recursion-dc-las-vegas-vs-monte-carlo",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Las Vegas vs. Monte Carlo randomized algorithms — what's the difference?",
    back: `Both use randomness during execution, but differ in **what's allowed to vary**:

- **Las Vegas**: always produces the **correct** result; the **running time** is the random variable (usually analyzed via its expected value). Randomized quicksort is Las Vegas — it always correctly sorts, but how fast depends on the random pivot choices.
- **Monte Carlo**: has a **fixed (often better) running time**, but may produce an **incorrect** result with some (usually small, tunable) probability. Miller-Rabin primality testing (Tier 3) is Monte Carlo — it runs in fixed time and answers "probably prime" or "composite," with a tunable false-positive rate that shrinks with more rounds.

Rule of thumb: reach for Las Vegas when correctness is non-negotiable and you can tolerate variable runtime (or bound its expectation); reach for Monte Carlo when a bounded, predictable runtime matters more than absolute certainty — often paired with a way to run extra rounds to push the error probability arbitrarily low.`,
    pitfall:
      "A Monte Carlo algorithm's error probability is a property of the ALGORITHM, not the input — running more independent rounds and taking a majority/consistency vote reduces it exponentially, but a single run always carries the stated risk, even on 'easy' inputs.",
    related: ["sorting-quicksort-randomization", "recursion-dc-reservoir-sampling"],
  },
  {
    id: "recursion-dc-reservoir-sampling",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does reservoir sampling pick a uniformly random sample from a stream of unknown length?",
    back: `Goal: select $k$ items uniformly at random from a stream where you don't know the total count $n$ in advance (or it's too large to store), seeing each item exactly once.

For $k=1$: keep the first item as the current "reservoir" pick. For each subsequent item $i$ (1-indexed), replace the reservoir with it with probability $1/i$.

**Why this gives a uniform distribution**: by induction, after processing $i$ items, each has probability $1/i$ of being the current pick. When item $i+1$ arrives, it becomes the pick with probability $1/(i+1)$ (correct for itself), and each *previously* uniform item survives with probability $1 - 1/(i+1) = i/(i+1)$, so its overall probability becomes $\\frac{1}{i} \\cdot \\frac{i}{i+1} = \\frac{1}{i+1}$ — still uniform, now over $i+1$ items. This holds all the way through the stream.

General $k$: keep the first $k$ items as the initial reservoir; for each subsequent item $i > k$, include it with probability $k/i$, replacing a uniformly random existing reservoir slot if included. Runs in $O(n)$ time and, crucially, $O(k)$ space — no need to ever store the whole stream.`,
    complexity: {
      structure: "Reservoir Sampling",
      operations: [{ op: "Sample k from n (unknown n)", time: "O(n)", space: "O(k)" }],
    },
    pitfall:
      "A naive fix of 'store everything, then pick k at the end' defeats the entire purpose — reservoir sampling exists specifically for streams too large to fully store, or where n isn't known until the stream ends.",
    related: ["recursion-dc-las-vegas-vs-monte-carlo"],
  },
];
