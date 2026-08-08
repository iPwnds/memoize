import type { Card } from "./types";

const MODULE = "sorting";

export const sortingCards: Card[] = [
  // ---------------------------------------------------------------- Bubble
  {
    id: "sorting-bubble-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is bubble sort and how does it work?",
    back: `Repeatedly walk the array comparing **adjacent pairs**, swapping them if they're out of order. Each full pass "bubbles" the largest unsorted element to its final position at the end of the array, so the scanned range shrinks by one each pass.

Runs in $O(n^2)$ comparisons and swaps in the worst/average case. With an early-exit flag ("did we swap this pass?"), the best case (already sorted) drops to $O(n)$ because it terminates after one clean pass.

Used in practice almost nowhere directly — it exists pedagogically to introduce comparison sorts and the idea of adaptive best-case behavior.`,
    complexity: {
      structure: "Bubble Sort",
      operations: [
        { op: "Best (sorted)", time: "O(n)", space: "O(1)", note: "with early-exit flag" },
        { op: "Average", time: "O(n²)", space: "O(1)" },
        { op: "Worst (reverse sorted)", time: "O(n²)", space: "O(1)" },
      ],
      caveat: "Stable. In-place. Adaptive only with the early-exit optimization.",
    },
    pitfall:
      "Forgetting the early-exit flag turns an already-sorted array into a full O(n²) pass anyway — the naive textbook version has no best-case speedup.",
    related: ["sorting-choosing-algorithm", "sorting-stability-matters"],
  },
  {
    id: "sorting-bubble-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement bubble sort with the early-exit optimization.",
    back: `The early-exit flag is what makes this adaptive: if a full pass makes zero swaps, the array is already sorted and we can stop.`,
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    complexity: {
      structure: "Bubble Sort",
      operations: [
        { op: "Best (sorted)", time: "O(n)", space: "O(1)" },
        { op: "Worst", time: "O(n²)", space: "O(1)" },
      ],
    },
    related: ["sorting-bubble-overview"],
  },

  // ------------------------------------------------------------- Selection
  {
    id: "sorting-selection-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is selection sort and how does it work?",
    back: `On each pass, scan the unsorted suffix to find its **minimum element**, then swap it into place at the front of that suffix. After $i$ passes, the first $i$ elements are sorted and final.

Always $O(n^2)$ comparisons — even on an already-sorted array — because it scans the whole remaining suffix every pass regardless of order. It's not adaptive.

Its one redeeming property: it makes at most $n-1$ **swaps** total, vs. $O(n^2)$ for bubble sort. That matters when writes are expensive (e.g. flash memory) even though comparisons are the same order.`,
    complexity: {
      structure: "Selection Sort",
      operations: [
        { op: "Best/Average/Worst", time: "O(n²)", space: "O(1)", note: "not adaptive" },
        { op: "Swaps", time: "O(n)", note: "at most n-1 swaps total" },
      ],
      caveat: "Not stable (naive swap-based version). In-place.",
    },
    pitfall:
      "Assuming selection sort is stable — the swap-based version isn't: swapping the minimum into place can move an equal element past another equal element, changing their relative order.",
    related: ["sorting-bubble-overview", "sorting-choosing-algorithm"],
  },
  {
    id: "sorting-selection-vs-bubble",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Selection sort vs. bubble sort — both O(n²), so when would you prefer one?",
    back: `Both are $O(n^2)$ comparisons in the general case, but they differ in what's expensive:

| | Comparisons | Swaps | Adaptive | Stable |
|---|---|---|---|---|
| Bubble sort | O(n²) | O(n²) worst | Yes (with flag) | Yes |
| Selection sort | O(n²) always | O(n) | No | No (naive) |

Prefer **selection sort** when writes/swaps are far more expensive than comparisons (e.g. writing to flash storage, or elements are large records with cheap keys). Prefer **bubble sort** only when the input is likely nearly-sorted and you want the early-exit adaptivity — otherwise insertion sort dominates both in practice.`,
    pitfall:
      "In real code neither should usually be chosen over insertion sort, which is adaptive, stable, and does no worse than either on every axis.",
    related: ["sorting-bubble-overview", "sorting-selection-overview", "sorting-insertion-overview"],
  },

  // ------------------------------------------------------------- Insertion
  {
    id: "sorting-insertion-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is insertion sort and how does it work?",
    back: `Build up a sorted prefix one element at a time: take the next unsorted element and shift it leftward through the sorted prefix until it lands in its correct position (like sorting a hand of playing cards).

It's **adaptive** — the shifting distance is proportional to how far out of place an element is, so a nearly-sorted array runs close to $O(n)$. It's also **stable** and **in-place**, and has very low constant-factor overhead, which is why it beats asymptotically-better algorithms on small inputs.`,
    complexity: {
      structure: "Insertion Sort",
      operations: [
        { op: "Best (sorted)", time: "O(n)", space: "O(1)" },
        { op: "Average", time: "O(n²)", space: "O(1)" },
        { op: "Worst (reverse sorted)", time: "O(n²)", space: "O(1)" },
      ],
      caveat: "Stable. In-place. Adaptive.",
    },
    pitfall:
      "Underestimating it: insertion sort is the practical default for small n (roughly n < 10–50 depending on language/hardware), which is exactly why Timsort and Introsort fall back to it for small partitions instead of recursing further.",
    related: ["sorting-choosing-algorithm", "sorting-timsort-introsort"],
  },
  {
    id: "sorting-insertion-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement insertion sort.",
    back: `Shift elements right (don't swap pairwise) while they're greater than the key — this is what makes insertion sort's inner loop cheaper in practice than a naive swap-based shift.`,
    code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    complexity: {
      structure: "Insertion Sort",
      operations: [
        { op: "Best (sorted)", time: "O(n)" },
        { op: "Worst", time: "O(n²)" },
      ],
    },
    related: ["sorting-insertion-overview"],
  },
  {
    id: "sorting-insertion-when-right-choice",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Bubble, selection, and insertion sort are all O(n²) — when is one of them genuinely the right choice over merge/quicksort?",
    back: `Two real scenarios where an $O(n^2)$ sort wins over an $O(n \\log n)$ one:

1. **Tiny arrays** (roughly n < 10–50). Merge sort and quicksort have real per-call overhead (recursion, extra allocations, cache misses across partitions); insertion sort's tight, branch-predictable inner loop wins on wall-clock time despite the worse asymptotic bound. This is why production sorts (Timsort, Introsort) switch to insertion sort below a size threshold.
2. **Nearly-sorted data.** Insertion sort (and bubble sort with early-exit) is adaptive: cost scales with the number of *inversions*, not just n. A nearly-sorted array sorts in close to O(n).

Selection sort is the exception — it's never adaptive, so its only real justification is expensive-writes/cheap-comparisons hardware, not "small" or "nearly sorted" data.`,
    related: ["sorting-timsort-introsort", "sorting-choosing-algorithm"],
  },

  // ---------------------------------------------------------------- Merge
  {
    id: "sorting-merge-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does merge sort work, and why is it always O(n log n)?",
    back: `Divide-and-conquer: split the array in half, recursively sort each half, then **merge** the two sorted halves into one sorted array in $O(n)$ by walking both with two pointers and always taking the smaller front element.

The recurrence is $T(n) = 2T(n/2) + O(n)$. By the Master Theorem ($a=2, b=2, f(n)=O(n)$, so $n^{\\log_b a} = n^1 = f(n)$ — Case 2), $T(n) = \\Theta(n \\log n)$. Unlike quicksort, this holds for **every** input, not just on average — merge sort has no bad-input worst case because the split is always balanced regardless of data.`,
    complexity: {
      structure: "Merge Sort",
      operations: [
        { op: "Best/Average/Worst", time: "O(n log n)", space: "O(n)", note: "auxiliary array for merging" },
      ],
      caveat: "Stable. Not in-place (standard array version needs O(n) extra space).",
    },
    pitfall:
      "Assuming merge sort is in-place — the standard array implementation needs O(n) auxiliary space for the merge step. A true in-place merge sort exists but is significantly more complex and slower in practice.",
    related: ["sorting-merge-stability"],
  },
  {
    id: "sorting-merge-stability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is merge sort stable, and why does that require care in the merge step?",
    back: `Stability means equal elements keep their original relative order. In the merge step, when the front elements of the two subarrays are **equal**, you must take from the **left** subarray first. Since the left subarray's elements were originally earlier in the array, this preserves their relative order.

Stability isn't automatic from "divide and conquer" in general — it's a property of *this specific merge rule*. Get the tie-break backwards (take from the right on ties) and the sort becomes unstable while still producing correctly-ordered output.`,
    code: `def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:   # <=, not <, is what keeps it stable
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    pitfall:
      "Using `<` instead of `<=` in the tie-break still sorts correctly but silently breaks stability — a subtle bug that only shows up when you depend on stability downstream.",
    related: ["sorting-stability-matters", "sorting-merge-overview"],
  },
  {
    id: "sorting-merge-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement merge sort from scratch.",
    back: `Recurse to the base case of a single element (trivially sorted), then merge pairs of sorted subarrays back up.`,
    code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    related: ["sorting-merge-overview"],
  },
  {
    id: "sorting-merge-external-sorting",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is merge sort the algorithm behind external (disk-based) sorting?",
    back: `External sorting handles datasets too large to fit in RAM. It works in two phases:

1. **Run generation**: read chunks that fit in memory, sort each in-place (often with quicksort or an in-memory merge sort), write each sorted "run" back to disk.
2. **K-way merge**: merge all runs together using a min-heap of size k over their fronts, streaming output — this only ever needs to hold one element per run in memory at a time, not the whole dataset.

Merge sort generalizes naturally to this because merging is a **sequential, streaming** operation — it never needs random access back into data it already passed, which is exactly the access pattern disk I/O rewards. Quicksort's partitioning, by contrast, needs random access across the whole range being partitioned.`,
    pitfall:
      "The bottleneck in external sorting is disk I/O, not comparisons — so the practical win of a k-way merge is minimizing the number of passes over the data, which is why k is chosen as large as available memory allows.",
    related: ["sorting-merge-overview"],
  },
  {
    id: "sorting-merge-code-trace",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "This merge step has a bug. What does it produce for `merge([1,3,5],[2,4,6])`, and where's the bug?\n```python\ndef merge(left, right):\n    result, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] < right[j]:\n            result.append(left[i]); i += 1\n        else:\n            result.append(right[j]); j += 1\n    result.extend(left[i:])\n    return result\n```",
    back: `It produces \`[1, 2, 3, 4, 5]\` — missing the **6**.

The bug: after the main loop ends (because \`j\` ran out of range, i.e. \`right\` is exhausted), the code only does \`result.extend(left[i:])\` — it never appends the leftover tail of \`right\`. Here \`left\` is exhausted first at \`i=3\`, so \`left[i:]\` is empty and the remaining \`right[j:] = [6]\` is silently dropped.

Fix: also add \`result.extend(right[j:])\` after the loop, since exactly one of the two subarrays can have leftovers.`,
    pitfall: "Only draining one of the two subarrays after the loop is the single most common merge-sort bug.",
    related: ["sorting-merge-implementation"],
  },

  // ------------------------------------------------------------ Quicksort
  {
    id: "sorting-quicksort-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does quicksort work, and what's its average-case complexity?",
    back: `Divide-and-conquer via **partitioning**: pick a pivot, rearrange the array so everything less than the pivot is to its left and everything greater is to its right (the pivot is now in its final sorted position), then recursively sort each side. Unlike merge sort, there's no merge step — partitioning does the ordering work, and once both sides are sorted the whole array is sorted.

Average case is $O(n \\log n)$ because a random pivot splits the array reasonably evenly on average, giving the same balanced-recursion shape as merge sort. It's typically faster than merge sort in practice despite the same asymptotic bound because it sorts in-place (better cache locality, no allocation for a merge buffer).`,
    complexity: {
      structure: "Quicksort",
      operations: [
        { op: "Best/Average", time: "O(n log n)", space: "O(log n)", note: "recursion stack" },
        { op: "Worst", time: "O(n²)", space: "O(n)", note: "degenerate pivot choice every call" },
      ],
      caveat: "Not stable (in-place partitioning swaps break relative order). In-place.",
    },
    pitfall:
      "Calling quicksort's average-case bound 'guaranteed' — it's a property of typical/random inputs and pivot choices, not a worst-case guarantee the way merge sort's O(n log n) is.",
    related: ["sorting-quicksort-worst-case", "sorting-quicksort-pivot-selection"],
  },
  {
    id: "sorting-quicksort-lomuto-vs-hoare",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Lomuto partition scheme vs. Hoare partition scheme — what's the difference?",
    back: `Both rearrange a subarray around a pivot; they differ in mechanics and guarantees.

**Lomuto**: fixes the pivot at the *last* element, walks a single index maintaining "boundary of elements ≤ pivot," swaps into place, finishes by swapping the pivot into its final boundary position. Returns the pivot's final index. Simpler to write, but does more swaps and degrades to $O(n^2)$ on arrays with many duplicate keys.

**Hoare**: uses two pointers starting at both ends, moving inward and swapping when they find a pair that's mutually out of order. Does about 3x fewer swaps on average than Lomuto, and handles duplicates better. The catch: it does **not** place the pivot at its final sorted index — the returned split index is a partition boundary, not a pivot position, so the recursive calls must use \`(lo, p)\` / \`(p+1, hi)\`, not \`(lo, p-1)\` / \`(p+1, hi)\`.`,
    pitfall:
      "Using Lomuto's recursion boundaries `(lo, p-1)/(p+1, hi)` with Hoare's partition function (or vice versa) causes infinite recursion or an off-by-one that drops elements — the two schemes are not interchangeable without adjusting the recursive calls.",
    related: ["sorting-quicksort-implementation"],
  },
  {
    id: "sorting-quicksort-worst-case",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "What causes quicksort's O(n²) worst case, concretely?",
    back: `Worst case happens when every pivot choice is the **minimum or maximum** of its subarray, producing a maximally unbalanced split (size 1 and size n-1) at every level. That gives $n$ levels of recursion instead of $\\log n$, each doing $O(n)$ partition work: $O(n) \\times O(n) = O(n^2)$.

The classic trigger: **always picking the first (or last) element as pivot on an already-sorted or reverse-sorted array.** Every partition then puts the pivot at one extreme end.

This is also a real-world security concern: if an adversary knows your pivot strategy is deterministic (e.g. "always first element"), they can construct an input that triggers $O(n^2)$ — an algorithmic-complexity DoS.`,
    complexity: {
      structure: "Quicksort",
      operations: [{ op: "Worst case", time: "O(n²)", note: "recursion depth becomes O(n) instead of O(log n)" }],
    },
    pitfall: "This is exactly why production quicksorts randomize the pivot or use median-of-three, never a fixed index.",
    related: ["sorting-quicksort-pivot-selection", "sorting-quicksort-randomization"],
  },
  {
    id: "sorting-quicksort-pivot-selection",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What pivot selection strategies exist for quicksort, and what do they trade off?",
    back: `| Strategy | Idea | Weakness |
|---|---|---|
| First/last element | Simplest | Deterministic → adversarial/sorted input triggers O(n²) |
| Random element | Uniformly random index each call | No single input can reliably trigger worst case; expected O(n log n) regardless of input |
| Median-of-three | Median of first, middle, last | Cheap, avoids sorted-input worst case; still has adversarial inputs in theory but they're impractical to construct |
| Median-of-medians | True median in O(n) (BFPRT) | Guarantees O(n log n) worst case, but large constant factor makes it slower in practice than randomized quicksort |

Random pivot selection is the standard production default: it doesn't improve the *average* case, but it makes the worst case a vanishingly unlikely random event rather than something an adversary — or just unlucky, already-sorted input — can trigger deterministically.`,
    related: ["sorting-quicksort-worst-case", "sorting-quicksort-randomization"],
  },
  {
    id: "sorting-quicksort-randomization",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does randomizing the pivot defend against quicksort's worst case?",
    back: `With a fixed pivot rule, *some* input triggers $O(n^2)$ every time you run it — and that input might be exactly what shows up in practice (already-sorted data is extremely common).

With a **random** pivot, the worst case still exists in theory, but which run hits it is random and independent of the input. The *expected* running time over the randomness is $O(n \\log n)$ **for every input**, including already-sorted or adversarially chosen arrays. This is randomized quicksort — a Las Vegas algorithm: always correct, runtime is the random variable.

In practice: \`pivot = random.randint(lo, hi)\`, swap it to a fixed position (e.g. the end), then run ordinary Lomuto/Hoare partitioning.`,
    pitfall:
      "Randomizing the pivot changes the *expected* complexity, not the worst-case bound — O(n²) is still possible, just astronomically unlikely.",
    related: ["sorting-quicksort-pivot-selection"],
  },
  {
    id: "sorting-quicksort-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement quicksort with random pivot selection and Lomuto partitioning.",
    back: `Swapping a randomly chosen pivot to the end first lets you reuse standard Lomuto partitioning unchanged.`,
    code: `import random

def quicksort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo < hi:
        p = partition(arr, lo, hi)
        quicksort(arr, lo, p - 1)
        quicksort(arr, p + 1, hi)
    return arr

def partition(arr, lo, hi):
    pivot_idx = random.randint(lo, hi)
    arr[pivot_idx], arr[hi] = arr[hi], arr[pivot_idx]
    pivot = arr[hi]
    i = lo - 1
    for j in range(lo, hi):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[hi] = arr[hi], arr[i + 1]
    return i + 1`,
    complexity: {
      structure: "Quicksort",
      operations: [
        { op: "Average", time: "O(n log n)", space: "O(log n)" },
        { op: "Worst", time: "O(n²)", space: "O(n)" },
      ],
    },
    related: ["sorting-quicksort-overview", "sorting-quicksort-lomuto-vs-hoare"],
  },

  // ------------------------------------------------------------- Heapsort
  {
    id: "sorting-heapsort-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does heapsort work?",
    back: `Two phases, both operating on the array in-place as an implicit binary heap:

1. **Build a max-heap** from the array in $O(n)$ (see heaps module for why this is O(n), not O(n log n)).
2. **Repeatedly extract the max**: swap the root (max) with the last element of the unsorted region, shrink the heap by one, then sift-down the new root to restore the heap property. Each extraction is $O(\\log n)$, done $n$ times.

Total: $O(n) + O(n \\log n) = O(n \\log n)$, **guaranteed** in every case — no adversarial input degrades it, unlike quicksort. It's also strictly in-place ($O(1)$ extra space), which beats both merge sort and quicksort on space. The tradeoff is worse constant factors and poor cache locality (heap operations jump around the array), so it's usually slower than quicksort in practice despite the better worst-case guarantee.`,
    complexity: {
      structure: "Heapsort",
      operations: [{ op: "Best/Average/Worst", time: "O(n log n)", space: "O(1)" }],
      caveat: "Not stable. In-place.",
    },
    pitfall:
      "Heapsort is not stable — extracting from a heap freely reorders equal elements, unlike merge sort's careful tie-breaking.",
    related: ["sorting-quicksort-worst-case", "sorting-heapsort-vs-others"],
  },
  {
    id: "sorting-heapsort-vs-others",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Heapsort vs. quicksort vs. merge sort — how do you choose?",
    back: `| | Worst case | Space | Stable | Typical speed |
|---|---|---|---|---|
| Quicksort | O(n²) (rare, randomized) | O(log n) | No | Fastest in practice |
| Merge sort | O(n log n) guaranteed | O(n) | Yes | Consistent, good for linked lists / external sort |
| Heapsort | O(n log n) guaranteed | O(1) | No | Slower constants, poor cache locality |

- Need a **hard worst-case guarantee** with minimal memory (e.g. embedded/real-time systems) → heapsort.
- Need **stability** or you're sorting something disk-backed / a linked list → merge sort.
- Need **raw average speed** and can tolerate a randomized worst case → quicksort.
- Want the best of both → **introsort**: quicksort by default, falls back to heapsort if recursion depth exceeds a threshold (guards the worst case) — see the real-world-usage card.`,
    related: ["sorting-timsort-introsort"],
  },

  // --------------------------------------------------------- Linear-time
  {
    id: "sorting-counting-sort",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does counting sort work, and when can you use it?",
    back: `Non-comparison sort for integers (or integer keys) in a known small range $[0, k]$. Count occurrences of each value into a count array, take a prefix sum over counts to get each value's final position, then place elements directly (iterating input in reverse to keep it stable).

Runs in $O(n + k)$ — genuinely linear when $k = O(n)$. It sidesteps the $\\Omega(n \\log n)$ comparison lower bound entirely because it never compares two elements to each other; it only ever asks "what is this element's value."`,
    code: `def counting_sort(arr, k):
    count = [0] * (k + 1)
    for x in arr:
        count[x] += 1
    for i in range(1, k + 1):
        count[i] += count[i - 1]        # prefix sums -> final positions
    output = [0] * len(arr)
    for x in reversed(arr):             # reverse keeps it stable
        count[x] -= 1
        output[count[x]] = x
    return output`,
    complexity: {
      structure: "Counting Sort",
      operations: [{ op: "Best/Average/Worst", time: "O(n + k)", space: "O(n + k)", note: "k = range of key values" }],
      caveat: "Stable (if implemented with the reverse-iteration trick). Not in-place. Only for small-range integer keys.",
    },
    pitfall:
      "Counting sort is useless when k >> n (e.g. sorting 100 arbitrary 64-bit integers) — the count array dominates cost. It only pays off when the key range is bounded and comparable to n.",
    related: ["sorting-radix-sort", "sorting-comparison-lower-bound"],
  },
  {
    id: "sorting-radix-sort",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does radix sort work, and what does it require of the sub-sort it uses?",
    back: `Sorts integers (or fixed-length strings) digit by digit — typically **least-significant-digit (LSD) first** — using a **stable** sort (usually counting sort) as a subroutine on each digit.

Why LSD works: sorting by the least significant digit first, then next, etc., up to the most significant digit, correctly sorts the whole number *because* each pass is stable — ties on the current digit preserve the ordering already established by previous (less significant) digit passes. If the digit sub-sort weren't stable, the accumulated ordering from earlier passes would be destroyed.

With $d$ digits and base/range $k$ per digit: $O(d \\cdot (n + k))$. For fixed-width integers (e.g. 32-bit), $d$ is a constant, so this is effectively $O(n)$.`,
    complexity: {
      structure: "Radix Sort",
      operations: [{ op: "Best/Average/Worst", time: "O(d·(n + k))", space: "O(n + k)", note: "d = number of digits" }],
      caveat: "Stable (requires a stable digit sub-sort). Not in-place.",
    },
    pitfall:
      "Using an unstable sort (e.g. quicksort) as the per-digit subroutine breaks radix sort's correctness, not just its stability — the final order will be wrong, not merely tie-broken differently.",
    related: ["sorting-counting-sort", "sorting-linear-vs-comparison"],
  },
  {
    id: "sorting-bucket-sort",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does bucket sort work, and what assumption does its average-case bound rely on?",
    back: `Distribute $n$ elements into $k$ "buckets" by value range, sort each bucket individually (usually with insertion sort, since buckets are expected to be small), then concatenate buckets in order.

Average case $O(n + k)$ **relies on elements being roughly uniformly distributed** across the value range, so each bucket gets about $n/k$ elements and each small-bucket insertion sort is cheap. If the distribution is skewed, one bucket can end up with most of the elements, degrading to the sub-sort's worst case — $O(n^2)$ if using insertion sort on the overloaded bucket.

Classic use case: sorting floating-point numbers uniformly distributed in $[0, 1)$, where bucket index = $\\lfloor n \\cdot x \\rfloor$.`,
    complexity: {
      structure: "Bucket Sort",
      operations: [
        { op: "Average (uniform data)", time: "O(n + k)", space: "O(n + k)" },
        { op: "Worst (skewed data)", time: "O(n²)", note: "one bucket absorbs most elements" },
      ],
      caveat: "Stable if the per-bucket sort is stable. Not in-place.",
    },
    pitfall:
      "Applying bucket sort to skewed or unknown-distribution data can be *worse* than just using a comparison sort — the O(n+k) bound is not a worst-case guarantee.",
    related: ["sorting-counting-sort", "sorting-radix-sort"],
  },
  {
    id: "sorting-linear-vs-comparison",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Counting sort vs. radix sort vs. bucket sort — how do you choose?",
    back: `All three beat the $\\Omega(n \\log n)$ comparison-sort lower bound by exploiting structure in the *values*, not just comparing them — but each needs a different kind of structure:

- **Counting sort**: key range $k$ is small and known (e.g. sorting grades 0–100, single bytes). Fails badly if $k \\gg n$.
- **Radix sort**: keys are fixed-width (integers, fixed-length strings) but the range is too large for counting sort directly — decompose into digits and counting-sort each digit.
- **Bucket sort**: keys are (roughly) uniformly distributed over a continuous or large range — no digit structure needed, just a good hash/bucket function.

If none of these structural assumptions hold — arbitrary comparable objects, unknown/skewed distribution, no fixed-width decomposition — fall back to a comparison sort (Timsort/Introsort).`,
    related: ["sorting-comparison-lower-bound", "sorting-choosing-algorithm"],
  },

  // ---------------------------------------------------------------- Shell
  {
    id: "sorting-shell-sort",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is shell sort, and how does it generalize insertion sort?",
    back: `Insertion sort's weakness is that an element far from its correct position has to shift one slot at a time — expensive. Shell sort fixes this by first insertion-sorting elements that are far apart (a large "gap"), moving far-out-of-place elements long distances quickly, then progressively shrinking the gap down to 1 (plain insertion sort) for a final cleanup pass on an already-nearly-sorted array.

With gap sequence $\\{1, 2, 4, 8, ...\\}$ (powers of 2) worst case is $O(n^2)$; better sequences like **Hibbard's** ($2^k - 1$) give $O(n^{3/2})$, and **Sedgewick's** sequence gives roughly $O(n^{4/3})$. No known gap sequence achieves $O(n \\log n)$.

It's in-place, requires no extra memory, and is simple to implement — used in some embedded/small-memory contexts where merge/quicksort's extra space or recursion isn't wanted.`,
    complexity: {
      structure: "Shell Sort",
      operations: [
        { op: "Best (sorted)", time: "O(n log n)" },
        { op: "Worst", time: "depends on gap sequence — O(n²) to O(n^4/3)" },
      ],
      caveat: "Not stable (gapped comparisons can reorder equal elements). In-place.",
    },
    pitfall:
      "Shell sort's complexity is entirely gap-sequence-dependent — quoting a single Big-O without naming the sequence is meaningless.",
    related: ["sorting-insertion-overview"],
  },

  // -------------------------------------------------------- Real-world
  {
    id: "sorting-timsort-introsort",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What sorting algorithms do real languages actually use, and why?",
    back: `**Timsort** (Python's \`sorted\`/\`list.sort\`, Java's \`Collections.sort\` for objects): a hybrid of merge sort and insertion sort designed around **real-world data often being partially sorted**. It scans for existing "runs" (already-ordered subsequences), extends short runs with insertion sort up to a minimum length, then merges runs using merge sort's merge step — with a stack-based rule for choosing which runs to merge to preserve balance. It's stable (needed because Python/Java sort arbitrary key-extracted objects, e.g. \`sort(key=...)\`, where preserving input order on ties is expected) and adapts beautifully to nearly-sorted input (best case O(n)).

**Introsort** (C++ \`std::sort\`): starts with quicksort for its average-case speed, monitors recursion depth, and **switches to heapsort** if depth exceeds $O(\\log n)$ — this caps the worst case at $O(n \\log n)$ instead of quicksort's $O(n^2)$. It also switches to insertion sort for small partitions (typically ~16 elements). \`std::sort\` isn't required to be stable, which is why it's allowed to use an in-place, non-stable strategy — \`std::stable_sort\` (typically a merge sort) exists separately for when stability is required.

Both are the same underlying lesson: **no single classic algorithm is best everywhere**, so production sorts are hybrids that pick the right strategy per size/shape of input.`,
    pitfall:
      "Assuming std::sort is stable because 'most sort functions are' — it explicitly is not; use std::stable_sort when tie order matters.",
    related: ["sorting-insertion-when-right-choice", "sorting-heapsort-vs-others", "sorting-stability-matters"],
  },

  // ---------------------------------------------------------- Lower bound
  {
    id: "sorting-comparison-lower-bound",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the Ω(n log n) lower bound for comparison sorts, and how does the decision-tree argument prove it?",
    back: `No comparison-based sort (one that only learns information via "is A < B?") can guarantee better than $\\Omega(n \\log n)$ comparisons in the worst case.

**Decision-tree argument**: model any comparison sort as a binary tree where each internal node is one comparison, and each leaf is one possible output permutation. For $n$ elements there are $n!$ possible orderings, and the algorithm must be able to reach a distinct leaf for each one (otherwise it couldn't distinguish two different correct answers). A binary tree with $L$ leaves has height $\\geq \\log_2 L$. So the tree needs height $\\geq \\log_2(n!)$.

By Stirling's approximation, $\\log_2(n!) = \\Theta(n \\log n)$. Since the height of the decision tree equals the worst-case number of comparisons, **every** comparison sort needs $\\Omega(n \\log n)$ comparisons in the worst case — meaning merge sort and heapsort's $O(n \\log n)$ bound is asymptotically optimal, not just a good engineering result.

This is exactly why counting/radix/bucket sort can beat it: they're not comparison-based — they use the actual value of each element, not just pairwise comparisons.`,
    pitfall:
      "This bound applies only to comparison sorts. It's a common mistake to cite it against counting/radix/bucket sort as if it were a universal law — it isn't; those algorithms use extra information (the values themselves) that comparisons alone don't provide.",
    related: ["sorting-linear-vs-comparison", "sorting-merge-overview"],
  },

  // -------------------------------------------------------------- Stability
  {
    id: "sorting-stability-matters",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Why does sort stability matter? Give a concrete example where an unstable sort changes the result.",
    back: `A **stable** sort guarantees that elements comparing equal keep their original relative order. This matters whenever you sort by one key after already having a meaningful order from a previous sort (multi-key sorting).

**Concrete example**: you have a list of employees already sorted by *name* (alphabetical), and you now sort that list by *department*. With a **stable** sort, employees within the same department remain in alphabetical order — you get "sorted by department, then by name" for free. With an **unstable** sort, employees within a department can end up in arbitrary order, silently discarding the alphabetical ordering you'd already established.

This is precisely why Python's \`sorted(sorted(data, key=name), key=dept)\` reliably produces a two-key sort, and it's why Timsort must be stable — the language guarantees this pattern works.`,
    pitfall:
      "Multi-key sorting by sorting once per key from least-significant to most-significant only works if every sort in the chain is stable — one unstable pass anywhere breaks the whole chain.",
    related: ["sorting-merge-stability", "sorting-timsort-introsort"],
  },

  // ------------------------------------------------------------ Choosing
  {
    id: "sorting-choosing-algorithm",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Given an arbitrary sorting task, how do you actually pick an algorithm?",
    back: `A practical decision order:

1. **Just use the standard library sort** (Timsort/Introsort) unless you have a specific, measured reason not to — they're hybrids tuned for real data and hard to beat by hand.
2. **Tiny n (< ~50) or nearly-sorted data** → insertion sort, if you're hand-rolling something (or trust the library to already do this internally).
3. **Need a hard worst-case bound with O(1) extra space** (real-time/embedded constraints) → heapsort.
4. **Need stability and can afford O(n) space** → merge sort.
5. **Keys are integers/fixed-width and the range is bounded** → counting sort or radix sort for genuine linear time.
6. **Sorting a linked list** → merge sort (no random access needed for the merge step; quicksort's partitioning wants random access).
7. **External/disk-based sort** → k-way merge sort.

The recurring theme: quicksort's raw average speed is the default *inside* library implementations, but the moment you have a hard constraint (stability, worst-case guarantee, memory limit, non-comparison structure available), something else wins.`,
    related: ["sorting-timsort-introsort", "sorting-heapsort-vs-others", "sorting-linear-vs-comparison"],
  },
];
