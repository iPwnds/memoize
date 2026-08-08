import type { Card } from "./types";

const MODULE = "searching";

export const searchingCards: Card[] = [
  {
    id: "searching-linear-search",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is linear search, and when is it genuinely the right choice over binary search?",
    back: `Scan elements one by one until the target is found or the collection is exhausted. $O(n)$ worst/average case, $O(1)$ best case (target is first).

Genuinely the right choice when: the data is **unsorted** and you're searching only once (sorting first to enable binary search costs $O(n \\log n)$ up front — not worth it for a single $O(n)$ linear scan); the collection is a **linked list or stream** without random access (binary search needs $O(1)$ index access to be efficient); or $n$ is small enough that the simplicity and better cache locality of a linear scan beats binary search's overhead in practice.`,
    complexity: {
      structure: "Linear Search",
      operations: [
        { op: "Best case", time: "O(1)" },
        { op: "Average/Worst case", time: "O(n)" },
      ],
    },
    related: ["searching-binary-search"],
  },
  {
    id: "searching-binary-search",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does binary search work, and what invariant must hold on the input?",
    back: `Requires the array to be **sorted**. Maintain a search range \`[lo, hi]\` known to contain the target if it exists. Each step: check the middle element. If it equals the target, done. If the target is smaller, discard the right half (\`hi = mid - 1\`); if larger, discard the left half (\`lo = mid + 1\`). Each comparison eliminates **half of the remaining range**, giving $O(\\log n)$ total comparisons.

The loop invariant to hold onto: "if the target is present, it's within \`[lo, hi]\`" — every step must preserve this, which is exactly why the boundary updates use \`mid ± 1\` (excluding the just-checked \`mid\`), not \`mid\` itself (which would risk an infinite loop — see the off-by-one card).`,
    complexity: {
      structure: "Binary Search",
      operations: [{ op: "Search", time: "O(log n)", space: "O(1) iterative, O(log n) recursive" }],
    },
    related: ["searching-binary-search-off-by-one", "searching-binary-search-iterative"],
  },
  {
    id: "searching-binary-search-iterative",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement binary search iteratively.",
    back: `\`lo <= hi\` (not \`<\`) as the loop condition — a range of exactly one element (\`lo == hi\`) still needs to be checked.`,
    code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2   # avoids overflow in languages with fixed-width ints
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1  # not found`,
    related: ["searching-binary-search", "searching-binary-search-off-by-one"],
  },
  {
    id: "searching-binary-search-recursive",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement binary search recursively.",
    back: `Same logic as iterative, expressed as a recursive descent instead of a loop. Base case: empty range means not found.`,
    code: `def binary_search_recursive(arr, target, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo > hi:
        return -1  # base case: empty range
    mid = lo + (hi - lo) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, hi)
    else:
        return binary_search_recursive(arr, target, lo, mid - 1)`,
    complexity: {
      structure: "Binary Search",
      operations: [{ op: "Recursive", time: "O(log n)", space: "O(log n)", note: "recursion stack, vs O(1) iterative" }],
    },
    related: ["searching-binary-search-iterative"],
  },
  {
    id: "searching-binary-search-off-by-one",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the classic off-by-one pitfalls in binary search?",
    back: `1. **Integer overflow in \`mid\` calculation**: \`mid = (lo + hi) / 2\` can overflow in fixed-width integer languages (C, Java) if \`lo + hi\` exceeds the max int, silently producing a negative or wrapped value. Fix: \`mid = lo + (hi - lo) / 2\`, which never sums two large numbers directly. (Not an issue in Python, which has arbitrary-precision integers — but essential to know for C/C++/Java.)

2. **Wrong loop condition**: using \`lo < hi\` when you need \`lo <= hi\` (or vice versa) either misses the case where the range has exactly one element left, or causes an infinite loop / out-of-bounds access.

3. **Updating boundaries to \`mid\` instead of \`mid ± 1\`**: if you don't exclude the just-checked \`mid\` from the new range (e.g. \`hi = mid\` instead of \`hi = mid - 1\` when going left), and your loop condition allows \`lo == hi\`, you can loop forever re-checking the same middle element.

4. **Confusing "found" with "insertion point" semantics**: a search that returns "-1 if not found" vs. one that returns "the index where the target *would* go" (used in binary-search-on-the-answer and \`bisect\`-style functions) need different boundary-update logic — mixing the two patterns mid-implementation is a common source of bugs.`,
    pitfall:
      "This is the single most bug-prone few lines of code in the entire curriculum by reputation — even experienced engineers get it wrong on the first try. Always double check with a 1-element and 2-element array by hand.",
    related: ["searching-binary-search-iterative"],
  },
  {
    id: "searching-first-last-occurrence",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Given a sorted array with duplicates, find the first (leftmost) occurrence of a target.",
    back: `Standard binary search stops as soon as it finds *any* match — to find the **first** match, keep searching the **left half** even after finding a match, recording it as a candidate answer, in case an earlier occurrence exists further left.`,
    code: `def find_first(arr, target):
    lo, hi, result = 0, len(arr) - 1, -1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            result = mid       # record candidate...
            hi = mid - 1       # ...but keep looking left for an earlier one
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result`,
    pitfall:
      "Returning immediately on the first match found (rather than continuing to search left) gives *a* correct index but not necessarily the *first* one — the whole point of this variant is not stopping early.",
    related: ["searching-last-occurrence"],
  },
  {
    id: "searching-last-occurrence",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Given a sorted array with duplicates, find the last (rightmost) occurrence of a target.",
    back: `Mirror image of finding the first occurrence: on a match, keep searching the **right half** instead.`,
    code: `def find_last(arr, target):
    lo, hi, result = 0, len(arr) - 1, -1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            result = mid       # record candidate...
            lo = mid + 1       # ...but keep looking right for a later one
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return result`,
    related: ["searching-first-last-occurrence"],
  },
  {
    id: "searching-rotated-sorted-array",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How do you binary search a rotated sorted array (e.g. [4,5,6,7,0,1,2])?",
    back: `At every step, **at least one half** of \`[lo, mid]\` or \`[mid, hi]\` is guaranteed to still be normally sorted (a rotation only introduces one "break point" in the whole array). Determine which half is sorted by comparing \`arr[lo]\` to \`arr[mid]\`, then check if the target falls within that sorted half's range — if so, recurse/iterate into it; otherwise the target must be in the other half.`,
    code: `def search_rotated(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid
        if arr[lo] <= arr[mid]:              # left half is sorted
            if arr[lo] <= target < arr[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                 # right half is sorted
            if arr[mid] < target <= arr[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
    complexity: {
      structure: "Rotated Sorted Array Search",
      operations: [{ op: "Search", time: "O(log n)" }],
    },
    pitfall:
      "Using `<` instead of `<=` (or vice versa) when checking `arr[lo] <= arr[mid]` mishandles the case where the sorted half has only one element (lo == mid) — test this boundary explicitly.",
    related: ["searching-binary-search"],
  },
  {
    id: "searching-binary-search-on-answer",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the 'binary search on the answer' pattern?",
    back: `Applies binary search not over an array's *indices*, but over the **space of possible answers** to an optimization problem — whenever that answer-space has a **monotonic property**: "if answer $x$ works, every answer $\\geq x$ (or $\\leq x$) also works," you can binary search for the boundary between "works" and "doesn't work," even though there's no literal sorted array in sight.

Recipe: (1) identify the range of possible answers \`[lo, hi]\`; (2) write a \`feasible(x)\` check — "can we achieve the goal using answer-value $x$?"; (3) binary search over \`[lo, hi]\`, using \`feasible(mid)\` in place of an array comparison, converging on the smallest (or largest) $x$ for which \`feasible(x)\` is true.

Classic examples: "minimum capacity to ship packages within D days" (feasible(capacity) = can we ship within D days using this capacity — monotonic: any larger capacity also works), "minimum time to complete all tasks with workers," "smallest divisor so that a sum stays under a threshold."`,
    related: ["searching-binary-search-on-answer-example"],
  },
  {
    id: "searching-binary-search-on-answer-example",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "Worked example: minimum ship capacity to deliver weights `[1,2,3,4,5,6,7,8,9,10]` within 5 days. How does binary-search-on-the-answer solve this?",
    back: `**Answer space**: capacity ranges from \`max(weights) = 10\` (must be able to carry the single heaviest package) to \`sum(weights) = 55\` (one day, everything at once).

**feasible(capacity)**: greedily load packages onto the current day's shipment until adding the next one would exceed capacity, then start a new day; return whether the number of days used is $\\leq 5$. This is monotonic: any capacity larger than a feasible one is also feasible (more room never hurts).

Binary search \`[10, 55]\`: try \`mid=32\` → simulate greedy loading → uses some number of days → if $\\leq 5$, capacity 32 works, try smaller (\`hi = mid - 1\`); if $> 5$, need more room, try larger (\`lo = mid + 1\`). Converges to the minimum feasible capacity.

Cost: $O(\\log(\\text{sum} - \\text{max}))$ iterations, each doing an $O(n)$ feasibility simulation — $O(n \\log(\\text{sum}))$ total, dramatically better than trying every capacity value one by one.`,
    related: ["searching-binary-search-on-answer"],
  },
  {
    id: "searching-ternary-search",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is ternary search, and what kind of function does it require?",
    back: `Finds the maximum (or minimum) of a **unimodal function** — one that strictly increases then strictly decreases (or vice versa), with a single peak/valley and no other local extrema. Pick two interior points \`m1\`, \`m2\` that split \`[lo, hi]\` into thirds; compare $f(m1)$ and $f(m2)$: whichever is smaller (searching for a max) tells you that side cannot contain the peak, so discard that third of the range. Repeat.

Each iteration discards $1/3$ of the range (vs. binary search's $1/2$), giving $O(\\log_{3/2} n)$ iterations — asymptotically still $O(\\log n)$, but with a **worse constant factor** than binary search (roughly 2 function evaluations per iteration vs. 1 comparison), and each iteration shrinks the range by less. For a genuinely unimodal function it's the standard tool; it is *not* a general replacement for binary search on sorted arrays, where plain binary search is strictly better.`,
    pitfall:
      "Ternary search requires strict unimodality — if the function has flat regions or multiple local extrema, it can converge to the wrong point or fail to converge correctly at all.",
    related: ["searching-binary-search"],
  },
  {
    id: "searching-exponential-search",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is exponential (galloping) search, and when does it beat plain binary search?",
    back: `Used when the target is likely **near the start** of a sorted collection, or the collection has **no known upper bound** (e.g. an unbounded/infinite stream, or an array whose length isn't known in advance). Start with a bound of 1, and **double it** repeatedly (\`1, 2, 4, 8, 16, ...\`) until the bound overshoots the target's value (or the end of the array). Then run ordinary **binary search within that last doubling interval** \`[bound/2, bound]\`.

Cost: $O(\\log p)$ to find the bounding range, where $p$ is the target's actual position (not the total array size $n$), plus $O(\\log p)$ for the binary search within that range — total $O(\\log p)$. When the target is near the start ($p \\ll n$), this beats plain binary search's $O(\\log n)$; when $p \\approx n$, it's roughly the same order (with slightly more overhead from the doubling phase). Used in practice for searching within skip lists and merging index structures (a "galloping" merge in Timsort uses this exact idea when one run is consistently winning against another).`,
    complexity: {
      structure: "Exponential Search",
      operations: [{ op: "Search (target at position p)", time: "O(log p)" }],
    },
    related: ["searching-binary-search", "searching-linear-vs-binary-vs-exponential"],
  },
  {
    id: "searching-linear-vs-binary-vs-exponential",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Linear vs. binary vs. exponential search — how do you choose?",
    back: `| | Requires sorted? | Requires known size? | Best for |
|---|---|---|---|
| Linear search | No | No | Unsorted data, one-off search, linked structures |
| Binary search | Yes | Yes (or at least bounded) | Sorted random-access data, target position unknown |
| Exponential search | Yes | No | Unbounded/streamed sorted data, or target likely near the start |

The decision is mostly about what you're given: no ordering → linear is often your only reasonable option (or sort first if you'll search many times); sorted with random access and a known range → binary search is the default; sorted but unbounded, or with a data-dependent skip structure — exponential search adapts without needing to know the size upfront.`,
    related: ["searching-linear-search", "searching-binary-search", "searching-exponential-search"],
  },
];
