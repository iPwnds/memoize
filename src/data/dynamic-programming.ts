import type { Card } from "./types";

const MODULE = "dynamic-programming";

export const dynamicProgrammingCards: Card[] = [
  // -------------------------------------------------------------- Intro
  {
    id: "dynamic-programming-what-makes-dp-able",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What two properties make a problem solvable with dynamic programming?",
    back: `- **Overlapping subproblems**: a naive recursive solution recomputes the *same* subproblem many times via different call paths (e.g. naive Fibonacci computing \`fib(2)\` dozens of times inside \`fib(10)\`). If subproblems don't overlap (each is solved at most once, like in merge sort's recursion), there's nothing for DP to save — that's plain divide-and-conquer, not DP.
- **Optimal substructure**: an optimal solution to the whole problem can be constructed directly from optimal solutions to its subproblems. Without this, even if you cache subproblem answers, they wouldn't combine into a correct overall answer.

Both are necessary: overlapping subproblems is what makes caching *worthwhile* (there's redundant work to eliminate); optimal substructure is what makes caching *correct* (the cached answer is actually reusable, not just "a" solution to a smaller instance).`,
    pitfall:
      "Optimal substructure alone doesn't imply overlapping subproblems (merge sort has the former without the latter) — verify both before reaching for DP; if there's no overlap, a plain divide-and-conquer or greedy approach may be simpler and equally correct.",
    related: ["dynamic-programming-memo-vs-tabulation"],
  },
  {
    id: "dynamic-programming-memo-vs-tabulation",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Memoization (top-down) vs. tabulation (bottom-up) — what's the actual trade-off?",
    back: `| | Memoization (top-down) | Tabulation (bottom-up) |
|---|---|---|
| Structure | Plain recursion + a cache (dict/array) | Iterative loop filling a table in dependency order |
| Computes | Only the subproblems actually needed | Every subproblem in the table, even unneeded ones |
| Stack usage | O(depth) recursion stack | None — iterative |
| Easier to write from | The natural recursive definition | Requires figuring out a valid fill order upfront |

Memoization is often easier to derive directly from a recursive brute-force solution (add a cache, done) and can save work when not all subproblems are reachable from the actual input. Tabulation avoids recursion-depth limits/overhead and is usually faster in practice (no function-call overhead, better cache locality iterating an array) — and it's what enables **space optimization** (see the knapsack card) since you can discard rows/entries you'll never need again once you know the fill order.`,
    code: `# Top-down (memoization)
def fib_memo(n, cache={}):
    if n <= 1:
        return n
    if n not in cache:
        cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    return cache[n]

# Bottom-up (tabulation)
def fib_tab(n):
    if n <= 1:
        return n
    dp = [0, 1]
    for i in range(2, n + 1):
        dp.append(dp[i - 1] + dp[i - 2])
    return dp[n]`,
    related: ["dynamic-programming-what-makes-dp-able"],
  },

  // -------------------------------------------------------------- 1D DP
  {
    id: "dynamic-programming-climbing-stairs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Climbing stairs (1 or 2 steps at a time): what's the DP recurrence, and why is it structurally Fibonacci?",
    back: `To reach step $n$, your last move was either a single step from $n-1$, or a double step from $n-2$ — so the number of ways to reach step $n$ is the **sum** of the ways to reach each of those: $dp[n] = dp[n-1] + dp[n-2]$, with base cases $dp[0] = 1$ (one way: do nothing) and $dp[1] = 1$.

This is exactly the Fibonacci recurrence in different clothing — the general lesson: many counting-DP problems reduce to "sum over all valid last moves," and recognizing that shape is often the key insight, not the specific problem story.`,
    complexity: {
      structure: "Climbing Stairs",
      operations: [
        { op: "Naive recursion", time: "O(2ⁿ)" },
        { op: "DP (memo or tabulation)", time: "O(n)", space: "O(n) or O(1) rolling" },
      ],
    },
    related: ["dynamic-programming-memo-vs-tabulation"],
  },
  {
    id: "dynamic-programming-house-robber",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "House robber (maximize loot, no two adjacent houses): what's the DP recurrence?",
    back: `At each house $i$, you face a binary choice: **rob it** (take its value, plus the best total from houses up to $i-2$, since $i-1$ is now forbidden) or **skip it** (keep the best total from houses up to $i-1$). Take whichever is larger:
$$dp[i] = \\max(dp[i-1],\\ \\ nums[i] + dp[i-2])$$
with $dp[0] = nums[0]$ and $dp[1] = \\max(nums[0], nums[1])$.

This is the canonical "include vs. exclude the current item" DP shape, which reappears constantly (it's the same shape 0/1 knapsack uses per item — see that card). Space can be optimized to $O(1)$ since each state only depends on the previous two.`,
    code: `def rob(nums):
    prev2, prev1 = 0, 0
    for num in nums:
        prev2, prev1 = prev1, max(prev1, num + prev2)
    return prev1`,
    complexity: {
      structure: "House Robber",
      operations: [{ op: "DP", time: "O(n)", space: "O(1) with rolling variables" }],
    },
    related: ["dynamic-programming-knapsack-01"],
  },

  // -------------------------------------------------------------- 2D DP
  {
    id: "dynamic-programming-lcs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the DP for Longest Common Subsequence (LCS) work?",
    back: `$dp[i][j]$ = length of the LCS of the first $i$ characters of string $A$ and first $j$ characters of string $B$.

- If $A[i-1] == B[j-1]$ (characters match): this character can extend the LCS of the two shorter prefixes — $dp[i][j] = dp[i-1][j-1] + 1$.
- Otherwise: the LCS can't use both current characters together, so take the better of dropping one from either string — $dp[i][j] = \\max(dp[i-1][j],\\ dp[i][j-1])$.

Base case: $dp[0][j] = dp[i][0] = 0$ (an empty string has LCS length 0 with anything). Answer is $dp[m][n]$.`,
    code: `def lcs(A, B):
    m, n = len(A), len(B)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if A[i - 1] == B[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]`,
    complexity: {
      structure: "Longest Common Subsequence",
      operations: [{ op: "DP", time: "O(m·n)", space: "O(m·n), O(min(m,n)) with rolling rows" }],
    },
    pitfall:
      "LCS is a SUBSEQUENCE match (elements need not be contiguous, just in relative order) — don't confuse it with longest common SUBSTRING, a different problem requiring contiguity, whose recurrence resets to 0 on a mismatch instead of taking a max.",
    related: ["dynamic-programming-edit-distance"],
  },
  {
    id: "dynamic-programming-edit-distance",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the DP for edit distance (Levenshtein distance) work?",
    back: `$dp[i][j]$ = minimum number of insertions/deletions/substitutions to transform the first $i$ characters of $A$ into the first $j$ characters of $B$.

- If $A[i-1] == B[j-1]$: no edit needed for this character — $dp[i][j] = dp[i-1][j-1]$.
- Otherwise, take the cheapest of three possible single edits, each reducing to a smaller subproblem: **substitute** ($dp[i-1][j-1] + 1$), **delete from A** ($dp[i-1][j] + 1$), **insert into A** ($dp[i][j-1] + 1$):
$$dp[i][j] = 1 + \\min(dp[i-1][j-1],\\ dp[i-1][j],\\ dp[i][j-1])$$

Base cases: $dp[i][0] = i$ (delete all of A's prefix), $dp[0][j] = j$ (insert all of B's prefix).`,
    code: `def edit_distance(A, B):
    m, n = len(A), len(B)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if A[i - 1] == B[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
    return dp[m][n]`,
    complexity: {
      structure: "Edit Distance",
      operations: [{ op: "DP", time: "O(m·n)", space: "O(m·n), O(min(m,n)) with rolling rows" }],
    },
    related: ["dynamic-programming-lcs"],
  },
  {
    id: "dynamic-programming-unique-paths",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the DP for counting unique paths through a grid (only right/down moves) work?",
    back: `$dp[i][j]$ = number of distinct paths from the top-left corner to cell $(i,j)$, moving only right or down. Since the only ways to arrive at $(i,j)$ are from directly **above** or directly **left**, the counts simply add:
$$dp[i][j] = dp[i-1][j] + dp[i][j-1]$$
Base case: the entire first row and first column are all 1 (only one way to walk in a straight line to any of those cells).

This is a clean example of "count paths by summing over the ways to arrive," the counting-DP analogue of the "sum over last moves" pattern from climbing stairs — and it has a nice closed-form check: the answer is exactly $\\binom{m+n-2}{m-1}$ (a combinatorics identity), useful for verifying the DP result on small cases.`,
    code: `def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
    return dp[m - 1][n - 1]`,
    complexity: {
      structure: "Unique Paths",
      operations: [{ op: "DP", time: "O(m·n)", space: "O(n) with rolling row" }],
    },
    related: ["dynamic-programming-lcs"],
  },

  // -------------------------------------------------------------- Knapsack
  {
    id: "dynamic-programming-knapsack-01",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the DP for 0/1 knapsack work?",
    back: `Given items each with a weight and value, and a capacity $W$, maximize total value without exceeding $W$ — each item used **at most once** (hence "0/1": include or don't).

$dp[i][w]$ = best achievable value using only the first $i$ items with capacity $w$. For item $i$ (weight $wt_i$, value $val_i$): either **skip it** ($dp[i-1][w]$) or, if it fits, **take it** ($val_i + dp[i-1][w - wt_i]$) — take the max:
$$dp[i][w] = \\max\\big(dp[i-1][w],\\ \\ val_i + dp[i-1][w-wt_i] \\text{ if } wt_i \\leq w\\big)$$

Note the recurrence references row $i-1$ **only** — this is exactly what allows the classic space optimization to a single 1D array, iterated over weight in **decreasing** order (to avoid reusing an item within the same row's update).`,
    code: `def knapsack_01(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for wt, val in zip(weights, values):
        for w in range(capacity, wt - 1, -1):   # decreasing order!
            dp[w] = max(dp[w], val + dp[w - wt])
    return dp[capacity]`,
    complexity: {
      structure: "0/1 Knapsack",
      operations: [{ op: "DP", time: "O(n·W)", space: "O(W) with 1D rolling array" }],
    },
    pitfall:
      "Iterating weight in INCREASING order in the space-optimized 1D version lets an item be counted multiple times (using its own just-updated value within the same pass) — turning 0/1 knapsack into unbounded knapsack by accident. Decreasing order is what enforces 'at most once.'",
    related: ["dynamic-programming-unbounded-knapsack", "dynamic-programming-fractional-knapsack-contrast"],
  },
  {
    id: "dynamic-programming-unbounded-knapsack",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does unbounded knapsack differ from 0/1 knapsack, and how does that show up in the code?",
    back: `Unbounded knapsack allows **unlimited copies** of each item (e.g. coin change with unlimited coins of each denomination is exactly an unbounded knapsack problem). The recurrence changes from referencing row $i-1$ to referencing row $i$ **itself**, since after taking an item, you're still allowed to take another copy of that same item:
$$dp[i][w] = \\max\\big(dp[i-1][w],\\ \\ val_i + dp[i][w-wt_i]\\big)$$

In the space-optimized 1D version, this is exactly the mirror image of 0/1 knapsack's decreasing-order pitfall: unbounded knapsack requires **increasing** weight order (allowing an item's own just-updated value to be reused within the same pass, which is now correct — that's the "unlimited copies" behavior).`,
    code: `def knapsack_unbounded(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for w in range(1, capacity + 1):
        for wt, val in zip(weights, values):
            if wt <= w:
                dp[w] = max(dp[w], val + dp[w - wt])
    return dp[capacity]`,
    complexity: {
      structure: "Unbounded Knapsack",
      operations: [{ op: "DP", time: "O(n·W)", space: "O(W)" }],
    },
    pitfall:
      "The ONLY code difference from the space-optimized 0/1 version is the loop order (increasing vs. decreasing) — it's easy to copy-paste the wrong variant and get silently wrong answers rather than a crash.",
    related: ["dynamic-programming-knapsack-01", "dynamic-programming-coin-change"],
  },
  {
    id: "dynamic-programming-fractional-knapsack-contrast",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Why does greedy work for fractional knapsack but provably fail for 0/1 knapsack?",
    back: `**Fractional knapsack** (items can be split, taking any fraction of one) has a clean greedy solution: sort items by **value-per-unit-weight** descending, fill the knapsack greedily taking as much of the best ratio item as fits, then move to the next — provably optimal, because any leftover capacity can always be filled with a fraction of the next-best item, and swapping a smaller-ratio unit for a larger-ratio unit can never make the total worse.

**0/1 knapsack** breaks this because items are **indivisible** — the greedy "best ratio first" choice can lock in a suboptimal combination when a high-ratio item's weight doesn't fit evenly into the remaining capacity, wasting space a different (lower-ratio-but-better-fitting) combination would have used more effectively.

**Concrete counterexample**: capacity 10, items (weight, value): (6, 30) [ratio 5], (4, 20) [ratio 5], (5, 25) [ratio 5]... use a clearer split: items (weight 6, value 6) [ratio 1.0] and (weight 5, value 5)+(weight 5, value 5) [ratio 1.0 each], capacity 10. Greedy might grab the weight-6 item first (value 6), leaving capacity 4 — unusable by either weight-5 item, total value 6. The optimal 0/1 choice takes both weight-5 items instead: total value 10. This is exactly why 0/1 knapsack needs DP (exploring the actual combinatorial choice) rather than a greedy ratio-based shortcut.`,
    pitfall:
      "This exact pair of problems is the standard textbook illustration of 'greedy works here, DP required there' — expect it to be used as the canonical example whenever a course explains why greedy isn't a universal replacement for DP.",
    related: ["dynamic-programming-knapsack-01", "greedy-exchange-argument", "greedy-knapsack-counterexample"],
  },

  // ------------------------------------------------------------------ LIS
  {
    id: "dynamic-programming-lis-on2",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the O(n²) DP for Longest Increasing Subsequence (LIS) work?",
    back: `$dp[i]$ = length of the longest increasing subsequence **ending exactly at index $i$**. For each $i$, look back at every $j < i$: if $nums[j] < nums[i]$, then $nums[i]$ could extend that subsequence, giving a candidate length $dp[j] + 1$. Take the best such candidate (or 1, if no valid $j$ exists — the element alone):
$$dp[i] = 1 + \\max\\{dp[j] : j < i,\\ nums[j] < nums[i]\\} \\quad (\\text{or } 1 \\text{ if no such } j)$$
The answer is $\\max_i dp[i]$ (the best subsequence might not end at the last index).`,
    code: `def lis_length_on2(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    complexity: {
      structure: "Longest Increasing Subsequence",
      operations: [
        { op: "DP (O(n²))", time: "O(n²)", space: "O(n)" },
        { op: "Binary search (O(n log n))", time: "O(n log n)", space: "O(n)" },
      ],
    },
    related: ["dynamic-programming-lis-nlogn"],
  },
  {
    id: "dynamic-programming-lis-nlogn",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the O(n log n) approach to LIS work?",
    back: `Maintain an array \`tails\`, where \`tails[k]\` holds the **smallest possible tail value** among all increasing subsequences of length $k+1$ found so far (not necessarily a real subsequence itself — just the best "ending value" bookkeeping, which is why this trick doesn't directly reconstruct the sequence without extra bookkeeping — see the reconstruction card).

For each new number: **binary search** \`tails\` for the first entry $\\geq$ the number (for a strictly increasing LIS), and **replace** it — if the number is larger than everything in \`tails\`, **append** it instead (a new best length has been found). The length of \`tails\` at the end is the LIS length.

Why replacing (not just tracking) is valid: keeping the *smallest* possible tail for each length is always at least as good for extending with future numbers — it never hurts and can only help future elements qualify to extend that length's subsequence.`,
    code: `import bisect

def lis_length_nlogn(nums):
    tails = []
    for num in nums:
        i = bisect.bisect_left(tails, num)  # first index with tails[i] >= num
        if i == len(tails):
            tails.append(num)
        else:
            tails[i] = num
    return len(tails)`,
    pitfall:
      "The `tails` array is NOT itself a valid increasing subsequence from the input — it's purely a bookkeeping structure for the length; reconstructing the actual subsequence needs auxiliary parent-pointer tracking alongside it (see the solution-reconstruction card).",
    related: ["dynamic-programming-lis-on2", "dynamic-programming-reconstruct-solution"],
  },

  // ---------------------------------------------------- Matrix chain
  {
    id: "dynamic-programming-matrix-chain",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What problem does matrix chain multiplication DP solve, and what's the recurrence?",
    back: `Given a chain of matrices to multiply (dimensions compatible for multiplication in the fixed given order), matrix multiplication is **associative** — $(AB)C = A(BC)$ — so the order in which you *parenthesize* the multiplications doesn't change the result, but it dramatically changes the total number of scalar multiplications performed. The problem: find the parenthesization minimizing total cost — not compute the product itself.

$dp[i][j]$ = minimum cost to multiply matrices $i$ through $j$. Try every possible **split point** $k$ (where the last multiplication joining the chain happens): multiply the optimally-parenthesized left part ($i$ to $k$), the optimally-parenthesized right part ($k+1$ to $j$), then combine them — cost $p_{i-1} \\times p_k \\times p_j$ for that final combining multiplication (where $p$ is the dimensions array):
$$dp[i][j] = \\min_{i \\leq k < j} \\big(dp[i][k] + dp[k+1][j] + p_{i-1} \\cdot p_k \\cdot p_j\\big)$$
Base case: $dp[i][i] = 0$ (a single matrix needs no multiplication).`,
    code: `def matrix_chain_order(p):  # p[i-1] x p[i] is the dimension of matrix i
    n = len(p) - 1  # number of matrices
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for length in range(2, n + 1):          # chain length
        for i in range(1, n - length + 2):
            j = i + length - 1
            dp[i][j] = min(
                dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j]
                for k in range(i, j)
            )
    return dp[1][n]`,
    complexity: {
      structure: "Matrix Chain Multiplication",
      operations: [{ op: "DP", time: "O(n³)", space: "O(n²)", note: "O(n²) states, O(n) split-point search each" }],
    },
    pitfall:
      "This DP computes the minimum COST of an optimal parenthesization, not the parenthesization itself, and definitely not the matrix product — a separate pass tracking which split k was chosen at each dp[i][j] is needed to reconstruct the actual grouping (same principle as the general solution-reconstruction card).",
    related: ["dynamic-programming-reconstruct-solution"],
  },

  // ------------------------------------------------------------ Coin change
  {
    id: "dynamic-programming-coin-change",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Coin change: 'minimum number of coins' vs. 'number of ways to make change' — these are commonly confused. What's actually different?",
    back: `Both start from the same coin set and target amount, but ask fundamentally different questions with different DP structures:

**Minimum coins** ($dp[a]$ = fewest coins summing to amount $a$): for each amount, try using one more of each coin denomination and take the **minimum**:
$$dp[a] = \\min_{c \\in \\text{coins},\\ c \\leq a} \\big(dp[a-c] + 1\\big)$$
This is (a variant of) unbounded knapsack's shape — minimizing count, not maximizing value.

**Number of ways** ($dp[a]$ = how many distinct combinations of coins sum to $a$, where order doesn't matter): here the loop order matters critically — coins must be the **outer** loop, amount the inner, so that each coin is "decided about" once per combination rather than generating permutations of the same combination as distinct:
$$dp[a] \\mathrel{+}= dp[a - c] \\quad \\text{for each coin } c, \\text{ processed one coin at a time across all amounts}$$

Swapping which one you compute when asked for the other is the single most common coin-change bug — they look superficially similar but have genuinely different recurrences and loop-order requirements.`,
    code: `def min_coins(coins, amount):
    dp = [0] + [float('inf')] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

def count_ways(coins, amount):
    dp = [1] + [0] * amount
    for c in coins:               # coin outer loop is essential here
        for a in range(c, amount + 1):
            dp[a] += dp[a - c]
    return dp[amount]`,
    pitfall:
      "Using amount as the outer loop for count_ways counts permutations (e.g. [1,2] and [2,1] as different 'ways'), overcounting versus the intended combination count — the coins-outer/amount-inner order is what restricts counting to combinations.",
    related: ["dynamic-programming-unbounded-knapsack"],
  },

  // -------------------------------------------------------------- Bitmask
  {
    id: "dynamic-programming-bitmask-tsp",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does bitmask DP solve the traveling salesman problem faster than brute-force permutations?",
    back: `Brute force tries all $n!$ orderings of cities. Bitmask DP reduces this to $O(2^n \\cdot n^2)$ by exploiting that the only information that matters about the past is **which cities have been visited** (as a set) and **where you currently are** — not the exact order you visited them in.

State: $dp[\\text{mask}][i]$ = minimum cost to have visited exactly the set of cities in \`mask\`, ending at city $i$. Represent the visited set as an $n$-bit integer (\`mask\`), where bit $j$ set means city $j$ has been visited — this is what "bitmask" refers to, and it's what makes the visited-set usable as an array index at all. Transition: for each unvisited city $j$ (bit $j$ clear in \`mask\`), $dp[\\text{mask} \\cup \\{j\\}][j] = \\min(dp[\\text{mask} \\cup \\{j\\}][j],\\ dp[\\text{mask}][i] + \\text{cost}(i, j))$.

Final answer: $\\min_i dp[\\text{full mask}][i] + \\text{cost}(i, \\text{start})$ (returning to the start). $2^{20} \\cdot 20^2 \\approx 4 \\times 10^8$ is borderline-feasible; this is still exponential (not a polynomial-time solution to an NP-hard problem — see NP-Completeness, Tier 3), just a dramatically better exponential base ($2^n$ instead of $n!$).`,
    code: `def tsp(cost):  # cost[i][j] = distance from city i to city j
    n = len(cost)
    FULL = (1 << n) - 1
    dp = [[float('inf')] * n for _ in range(1 << n)]
    dp[1][0] = 0  # start at city 0, only city 0 visited
    for mask in range(1 << n):
        for i in range(n):
            if dp[mask][i] == float('inf') or not (mask & (1 << i)):
                continue
            for j in range(n):
                if mask & (1 << j):
                    continue  # already visited
                new_mask = mask | (1 << j)
                dp[new_mask][j] = min(dp[new_mask][j], dp[mask][i] + cost[i][j])
    return min(dp[FULL][i] + cost[i][0] for i in range(1, n))`,
    complexity: {
      structure: "Traveling Salesman (bitmask DP)",
      operations: [
        { op: "Brute force (permutations)", time: "O(n!)" },
        { op: "Bitmask DP (Held-Karp)", time: "O(2ⁿ · n²)", space: "O(2ⁿ · n)" },
      ],
    },
    pitfall:
      "2ⁿ·n² is still exponential — bitmask DP makes TSP feasible for roughly n ≤ 20, not for genuinely large instances. It's a constant-factor-in-the-exponent improvement over brute force, not a fundamentally polynomial algorithm.",
    related: ["complexity-analysis-complexity-ladder"],
  },

  // ------------------------------------------------------- Reconstruction
  {
    id: "dynamic-programming-reconstruct-solution",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you reconstruct the actual optimal solution from a DP table, not just its value?",
    back: `A DP table alone tells you the **optimal value** (length, cost, count) — to recover the actual sequence of choices that achieved it, you need one of two approaches:

1. **Store choices during the fill**: alongside \`dp[i][j]\`, keep a parallel \`choice[i][j]\` recording *which transition* was taken (e.g., for LCS: "came from a match," "came from dp[i-1][j]," or "came from dp[i][j-1]"). After filling the table, walk **backward** from the final state, following the recorded choices, to reconstruct the actual sequence.
2. **Re-derive by re-checking conditions**: without a stored choice array, walk backward from \`dp[m][n]\` re-testing which recurrence case must have produced the current value (e.g., for LCS: if \`A[i-1] == B[j-1]\` and that character can plausibly be part of the answer, step diagonally; otherwise step toward whichever of \`dp[i-1][j]\`/\`dp[i][j-1]\` equals the current cell's value). Saves memory (no extra table) at the cost of redoing some comparisons.

**LCS reconstruction example** (approach 2): start at $(m, n)$; if $A[i-1]==B[j-1]$, prepend that character and move to $(i-1,j-1)$; else move toward whichever of $(i-1,j)$/$(i,j-1)$ has the larger $dp$ value; stop at $i=0$ or $j=0$.`,
    code: `def lcs_string(A, B):
    m, n = len(A), len(B)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if A[i-1] == B[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    # backward reconstruction
    i, j, result = m, n, []
    while i > 0 and j > 0:
        if A[i-1] == B[j-1]:
            result.append(A[i-1])
            i, j = i - 1, j - 1
        elif dp[i-1][j] >= dp[i][j-1]:
            i -= 1
        else:
            j -= 1
    return ''.join(reversed(result))`,
    pitfall:
      "Most DP tutorials stop at computing the optimal VALUE and skip reconstruction entirely — but in interviews and real applications the actual sequence/combination is usually what's needed (the alignment itself, not just its score; the item list, not just the total value), so always be ready for this second pass.",
    related: ["dynamic-programming-lcs", "dynamic-programming-lis-nlogn"],
  },
];
