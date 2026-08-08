import type { Card } from "./types";

const MODULE = "two-pointers-window";

export const twoPointersWindowCards: Card[] = [
  // ------------------------------------------------------------- Two pointers
  {
    id: "two-pointers-window-two-pointers-pattern",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is the two-pointers pattern, and how do you recognize when it applies?",
    back: `Maintain two indices into a (usually **sorted**, or otherwise structured) sequence, moving them according to some rule, to avoid the $O(n^2)$ cost of checking every pair explicitly. The recognition signal: the problem asks something about **pairs or subranges** of a sequence, and there's a **monotonic relationship** you can exploit — moving one pointer in one direction predictably increases or decreases some quantity, letting you decide which pointer to move next without backtracking.

Two common shapes:
- **Opposite-direction** (start and end pointers converging): classic for "find a pair summing to X in a sorted array" — if the current pair's sum is too small, the only way to increase it is to move the **left** pointer right (since the array is sorted, that's the only lever that can increase the sum); if too large, move the **right** pointer left.
- **Same-direction** (both pointers moving forward, one trailing the other): this is the shape sliding-window problems take (see those cards) — one pointer expands a window, the other contracts it.

Both variants turn an $O(n^2)$ brute-force pairwise scan into $O(n)$, since each pointer only ever moves forward (or inward), giving at most $O(n)$ total pointer moves across the whole run.`,
    related: ["two-pointers-window-two-sum-sorted", "two-pointers-window-sliding-window-fixed"],
  },
  {
    id: "two-pointers-window-two-sum-sorted",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement two-pointers to find a pair summing to a target in a sorted array.",
    back: `The opposite-direction variant — the monotonic lever is "moving left pointer right only increases the sum; moving right pointer left only decreases it."`,
    code: `def two_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        s = arr[lo] + arr[hi]
        if s == target:
            return (lo, hi)
        elif s < target:
            lo += 1   # only way to increase the sum
        else:
            hi -= 1   # only way to decrease the sum
    return None`,
    complexity: {
      structure: "Two Pointers (pair sum)",
      operations: [{ op: "Search", time: "O(n)", space: "O(1)", note: "vs O(n²) brute force pairwise, or O(n) with a hash set but O(n) extra space" }],
    },
    pitfall:
      "This exploits the array being SORTED — running the same pointer logic on unsorted data gives wrong answers, since the 'only way to increase/decrease the sum' monotonic guarantee no longer holds.",
    related: ["two-pointers-window-two-pointers-pattern"],
  },

  // ------------------------------------------------------------- Sliding window
  {
    id: "two-pointers-window-sliding-window-fixed",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does a fixed-size sliding window avoid recomputing from scratch at every position?",
    back: `For problems asking about every contiguous subarray/substring of a **fixed length $k$** (e.g. "maximum sum of any length-$k$ subarray"), naively recomputing the sum of each window from scratch costs $O(nk)$. A sliding window instead computes the **first** window's aggregate directly, then slides one position at a time by **removing the outgoing element's contribution and adding the incoming element's** — $O(1)$ work per slide, giving $O(n)$ total.

This is the same "reuse previously computed work, only pay for what's genuinely new" idea seen throughout this curriculum (KMP, Z-algorithm, Manacher's, Fenwick trees' rolling structure) — a fixed-size sliding window is the simplest instance of it, applicable whenever the aggregate (sum, and anything else with an easy "undo one element" operation) supports incremental update.`,
    code: `def max_sum_subarray_k(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]   # add incoming, remove outgoing
        max_sum = max(max_sum, window_sum)
    return max_sum`,
    complexity: {
      structure: "Fixed-Size Sliding Window",
      operations: [{ op: "Scan all windows of size k", time: "O(n)", note: "vs O(n·k) naive recomputation" }],
    },
    related: ["two-pointers-window-sliding-window-variable"],
  },
  {
    id: "two-pointers-window-sliding-window-variable",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement a variable-size sliding window: smallest subarray with sum ≥ target.",
    back: `Expand the window (move \`right\`) to grow the sum; once the condition is satisfied, **shrink from the left** as much as possible while still satisfying it, tracking the minimum window size seen — the "same-direction two pointers" shape, where \`left\` only ever needs to move forward, never back, across the whole scan (giving the $O(n)$ bound despite the nested-looking while loop).`,
    code: `def min_subarray_len(arr, target):
    left = 0
    window_sum = 0
    min_len = float('inf')
    for right in range(len(arr)):
        window_sum += arr[right]
        while window_sum >= target:
            min_len = min(min_len, right - left + 1)
            window_sum -= arr[left]
            left += 1
    return min_len if min_len != float('inf') else 0`,
    complexity: {
      structure: "Variable-Size Sliding Window",
      operations: [{ op: "Scan", time: "O(n)", note: "left pointer moves at most n times total, despite the nested loop" }],
    },
    pitfall:
      "This looks like O(n²) at first glance (a while loop nested inside a for loop) — the key insight is that `left` only ever increases and does so at most n times total across the ENTIRE run, not per outer iteration, so total work across both loops combined is O(n).",
    related: ["two-pointers-window-sliding-window-fixed", "two-pointers-window-two-pointers-pattern"],
  },

  // ------------------------------------------------------------- Prefix sums
  {
    id: "two-pointers-window-prefix-sums",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How do prefix sums enable O(1) range-sum queries after O(n) preprocessing?",
    back: `Precompute $prefix[i] = arr[0] + arr[1] + \\cdots + arr[i-1]$ (sum of the first $i$ elements, with $prefix[0] = 0$) in one $O(n)$ pass. Any range sum $[l, r]$ (inclusive) is then $prefix[r+1] - prefix[l]$ — a single subtraction, $O(1)$, instead of an $O(r-l+1)$ re-scan.

This is the array-static counterpart to a Fenwick tree (Tier 2, Specialized Trees) — prefix sums give $O(1)$ query but $O(n)$ update (any single element change invalidates all prefix sums after it, needing a full rebuild), while a Fenwick tree trades that down to $O(\\log n)$ for both. Use plain prefix sums when the array is **static** (no updates between queries); reach for a Fenwick tree only once updates are interleaved with queries.`,
    code: `def build_prefix_sums(arr):
    prefix = [0] * (len(arr) + 1)
    for i, x in enumerate(arr):
        prefix[i + 1] = prefix[i] + x
    return prefix

def range_sum(prefix, l, r):  # inclusive [l, r]
    return prefix[r + 1] - prefix[l]`,
    complexity: {
      structure: "Prefix Sums",
      operations: [
        { op: "Build", time: "O(n)" },
        { op: "Range sum query", time: "O(1)" },
        { op: "Update (requires rebuild)", time: "O(n)" },
      ],
    },
    related: ["two-pointers-window-difference-arrays", "specialized-trees-fenwick-tree"],
  },
  {
    id: "two-pointers-window-difference-arrays",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How do difference arrays enable O(1) range UPDATES, as the mirror image of prefix sums?",
    back: `A difference array $D$ satisfies $D[i] = arr[i] - arr[i-1]$ (with $D[0] = arr[0]$) — i.e., $D$ is what you'd get by taking the "derivative" of the array, and $arr$ is recovered from $D$ by taking its **prefix sum**. This mirrors the prefix-sum relationship exactly, in the opposite direction.

The payoff: to add a value $v$ to **every element in range $[l, r]$**, you only need **two** $O(1)$ edits to $D$: $D[l] \\mathrel{+}= v$ and $D[r+1] \\mathrel{-}= v$ (if within bounds) — because taking the prefix sum of $D$ later will apply $+v$ starting at $l$ and cancel it back out starting just after $r$. Apply as many range updates as needed, all $O(1)$ each, then reconstruct the final array with **one** $O(n)$ prefix-sum pass at the end.

This is the right tool when you have **many range updates followed by reading the final array once** — the opposite access pattern from plain prefix sums (many range-sum reads on a static array).`,
    code: `def apply_range_updates(n, updates):  # updates: list of (l, r, val)
    diff = [0] * (n + 1)
    for l, r, val in updates:
        diff[l] += val
        if r + 1 <= n:
            diff[r + 1] -= val
    # reconstruct final array via prefix sum of diff
    result = [0] * n
    running = 0
    for i in range(n):
        running += diff[i]
        result[i] = running
    return result`,
    complexity: {
      structure: "Difference Array",
      operations: [
        { op: "Range update", time: "O(1)" },
        { op: "Reconstruct final array", time: "O(n)" },
      ],
    },
    pitfall:
      "Difference arrays only cheaply support 'apply all updates, THEN read the final array once' — they do NOT support cheap interleaved reads between updates (reading any single element mid-stream still requires an O(n) prefix-sum-so-far, or you'd need a Fenwick tree for that access pattern instead).",
    related: ["two-pointers-window-prefix-sums", "two-pointers-window-prefix-vs-difference"],
  },
  {
    id: "two-pointers-window-prefix-vs-difference",
    tier: 2,
    module: MODULE,
    type: "compare",
    front: "Prefix sums vs. difference arrays — how are they complementary, not competing, techniques?",
    back: `They're inverses of each other, optimized for opposite access patterns:

| | Prefix Sums | Difference Arrays |
|---|---|---|
| Cheap operation | Range **query** — O(1) | Range **update** — O(1) |
| Expensive operation | Update — O(n) rebuild | Read a specific value mid-stream — O(n) |
| Best for | Static array, many range-sum reads | Many range updates, read final result once |

Recognize which one a problem needs by asking: "am I mostly **reading ranges** of a fixed array (→ prefix sums), or mostly **applying range modifications** before a final readout (→ difference array)?" If a problem genuinely needs **both** cheap range updates AND cheap range queries interleaved, neither plain technique suffices — that's exactly the gap a Fenwick tree or segment tree with lazy propagation fills (Tier 2, Specialized Trees module).`,
    related: ["two-pointers-window-prefix-sums", "two-pointers-window-difference-arrays", "specialized-trees-lazy-propagation"],
  },

  // ------------------------------------------------------------- Monotonic stack
  {
    id: "two-pointers-window-monotonic-stack",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a monotonic stack, and what invariant does it maintain?",
    back: `A stack kept in **strictly increasing or strictly decreasing order** from bottom to top, by **popping** elements that would violate that order **before** pushing a new one. This is the standard tool for "find the next/previous greater (or smaller) element" problems — each element is pushed and popped **at most once**, giving $O(n)$ total despite looking like it could be $O(n^2)$ (a while-loop pop nested in a for-loop, same amortized argument as the variable-size sliding window).

The core insight: when a new element $x$ arrives and pops something smaller off the stack (in a decreasing-maintained stack, for "next greater element"), that popped element's "next greater element" is *exactly* $x$ — the act of popping *is* the answer being discovered, not just bookkeeping.`,
    related: ["two-pointers-window-next-greater-element", "two-pointers-window-largest-rectangle-histogram"],
  },
  {
    id: "two-pointers-window-next-greater-element",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement 'next greater element' for every position in an array using a monotonic stack.",
    back: `Maintain a stack of **indices** whose corresponding values are still waiting to find their next-greater element, kept in decreasing value order.`,
    code: `def next_greater_elements(arr):
    n = len(arr)
    result = [-1] * n
    stack = []  # indices, values in decreasing order bottom-to-top
    for i in range(n):
        while stack and arr[stack[-1]] < arr[i]:
            j = stack.pop()
            result[j] = arr[i]   # arr[i] is the next greater element for index j
        stack.append(i)
    return result`,
    complexity: {
      structure: "Monotonic Stack (next greater element)",
      operations: [{ op: "Process all elements", time: "O(n)", note: "each index pushed and popped at most once" }],
    },
    related: ["two-pointers-window-monotonic-stack"],
  },
  {
    id: "two-pointers-window-largest-rectangle-histogram",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does a monotonic stack solve 'largest rectangle in a histogram'?",
    back: `For each bar, the largest rectangle **using that bar's height** extends left and right until it hits a **shorter** bar on either side — so the answer requires knowing, for every bar, the nearest shorter bar to its left and right (its rectangle's boundaries).

Maintain an **increasing** monotonic stack of bar indices. When a new bar is **shorter** than the stack's top, that's the signal the popped bar's rectangle is now fully determined: its right boundary is the current (shorter) bar's index, and its left boundary is whatever's now exposed below it on the stack (the previous, still-standing shorter bar) — compute that popped bar's area (\`height × width\`) right there. Push a sentinel-height-0 bar at the end to force any bars still on the stack to be resolved.

This computes the max rectangle in a single $O(n)$ pass, versus an $O(n^2)$ brute force checking every possible left/right boundary pair — the monotonic stack is what identifies each bar's "natural" boundaries in amortized $O(1)$ per bar.`,
    complexity: {
      structure: "Largest Rectangle in Histogram",
      operations: [{ op: "Monotonic stack solution", time: "O(n)" }],
    },
    pitfall:
      "Forgetting the sentinel bar (height 0) at the end leaves bars still on the stack when the array ends, never resolving their rectangles — a common source of an incomplete/wrong answer.",
    related: ["two-pointers-window-monotonic-stack"],
  },

  // ------------------------------------------------------------- Monotonic queue
  {
    id: "two-pointers-window-monotonic-queue",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a monotonic queue, and how does it solve sliding window maximum?",
    back: `A deque (double-ended queue) kept in **decreasing order** of value from front to back, holding **indices**, used to answer "what's the maximum in the current sliding window" in $O(1)$ per position — the combination of a monotonic invariant (like the monotonic stack) with a deque's ability to evict from **both ends** (needed because elements can leave the window from the front due to sliding, not just get superseded from the back).

Algorithm: for each new index $i$, first **pop from the back** while the back's value is $\\leq arr[i]$ (it can never be the max again — $arr[i]$ is both later-arriving and at-least-as-large, strictly dominating it for all future windows), then push $i$. Then **pop from the front** if the front index has slid outside the current window's left boundary. The front of the deque is always the current window's maximum.

Each index is pushed once and popped at most once across the whole scan, giving $O(n)$ total — versus $O(nk)$ for naively scanning each window of size $k$, or $O(n \\log k)$ using a heap (which also can't lazily evict expired entries as cleanly as the deque's explicit front-eviction).`,
    code: `from collections import deque

def sliding_window_max(arr, k):
    dq = deque()  # indices, values decreasing front-to-back
    result = []
    for i, x in enumerate(arr):
        while dq and arr[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()   # fell out of the window
        if i >= k - 1:
            result.append(arr[dq[0]])
    return result`,
    complexity: {
      structure: "Monotonic Queue (sliding window maximum)",
      operations: [{ op: "Process all windows", time: "O(n)", note: "vs O(n·k) naive, or O(n log k) heap-based" }],
    },
    pitfall:
      "Storing VALUES instead of INDICES in the deque breaks the window-eviction step — you need the index to know whether an entry has aged out of the current window, not just its value.",
    related: ["two-pointers-window-monotonic-stack", "heaps-pq-kth-largest"],
  },
];
