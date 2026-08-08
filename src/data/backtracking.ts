import type { Card } from "./types";

const MODULE = "backtracking";

export const backtrackingCards: Card[] = [
  {
    id: "backtracking-general-template",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is the general backtracking template?",
    back: `Backtracking systematically explores a space of partial candidates, extending each one step at a time, and **abandoning ("backtracking" from) a candidate as soon as it's determined it cannot possibly lead to a valid solution** — this early abandonment (pruning) is what distinguishes it from brute-force exhaustive enumeration of every complete candidate.

The universal shape:
1. **Choose**: pick a next option from the current state.
2. **Explore**: recurse deeper with that choice made.
3. **Un-choose (backtrack)**: undo the choice before trying the next option, restoring state so sibling branches start from a clean slate.

This "choose, explore, un-choose" rhythm is what every backtracking algorithm in this module shares (N-Queens, Sudoku, permutations, word search) — the specific *what* changes, but the recursive skeleton doesn't.`,
    code: `def backtrack(state, choices):
    if is_solution(state):
        record(state)
        return
    for choice in choices(state):
        if is_valid(state, choice):
            state.append(choice)     # choose
            backtrack(state, choices) # explore
            state.pop()               # un-choose`,
    pitfall:
      "Forgetting the 'un-choose' step (e.g. not popping/undoing) is the single most common backtracking bug — without it, state from one branch silently leaks into sibling branches that should have started fresh.",
    related: ["backtracking-pruning-strategies"],
  },

  // ------------------------------------------------------------------ N-Queens
  {
    id: "backtracking-n-queens",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does backtracking solve N-Queens, and what constraints does it check?",
    back: `Place queens **one per row**, choosing a column for each row in turn — this immediately halves the branching factor vs. choosing arbitrary $(row, col)$ pairs, since "one queen per row" is baked into the search structure itself rather than checked as a constraint.

At each row, try every column; a placement is valid if no previously placed queen shares that **column**, or either **diagonal** (checked via \`row - col\` being constant along one diagonal, \`row + col\` constant along the other — tracking these as sets gives $O(1)$ conflict checks instead of re-scanning all placed queens). If a row has no valid column, backtrack to the previous row and try its next option.

This prunes enormous swaths of the search space early — an invalid placement in row 3 immediately eliminates every possible arrangement of rows 4 through $n$ that would have built on it, without ever generating them.`,
    code: `def solve_n_queens(n):
    solutions = []
    cols, diag1, diag2 = set(), set(), set()
    placement = []

    def backtrack(row):
        if row == n:
            solutions.append(placement[:])
            return
        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            placement.append(col)
            backtrack(row + 1)
            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)
            placement.pop()

    backtrack(0)
    return solutions`,
    complexity: {
      structure: "N-Queens",
      operations: [
        { op: "Brute force (all column assignments)", time: "O(n^n)" },
        { op: "Backtracking with pruning", time: "O(n!)", note: "still exponential, but a much smaller constant/base" },
      ],
    },
    related: ["backtracking-general-template", "backtracking-pruning-strategies"],
  },

  // ------------------------------------------------------------------ Sudoku
  {
    id: "backtracking-sudoku-solver",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does backtracking solve Sudoku, and how is constraint checking done efficiently?",
    back: `Find the next empty cell; try digits 1-9 in it; for each digit, check whether it's valid (not already present in the same **row**, **column**, or **3×3 box**) — if valid, place it and recurse to the next empty cell; if the recursive call fails to find a full solution, un-place the digit and try the next one; if no digit works, backtrack.

Efficient validity checking maintains **sets per row, per column, and per box** (27 sets total for a 9×9 grid) tracking which digits are already used — checking and updating these is $O(1)$ per attempt, rather than re-scanning the relevant row/column/box ($O(9)$ each) on every single trial. This is the same "maintain derived state incrementally instead of recomputing from scratch" principle as N-Queens' column/diagonal sets.

Choosing the **most-constrained empty cell first** (fewest remaining valid digits) rather than scanning left-to-right is a major practical speedup (a pruning strategy — see that card) — it fails fast on dead-end branches instead of wasting effort filling in easy, under-constrained cells before hitting the hard ones.`,
    complexity: {
      structure: "Sudoku Solver",
      operations: [{ op: "Backtracking with row/col/box constraint sets", time: "exponential worst case", note: "heavily pruned in practice; most real puzzles solve near-instantly" }],
    },
    related: ["backtracking-n-queens", "backtracking-pruning-strategies"],
  },

  // ------------------------------------------------- Permutations/combinations/subsets
  {
    id: "backtracking-permutations",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement backtracking to generate all permutations of a list.",
    back: `At each recursive level, try every **not-yet-used** element next (order matters for permutations, so every element is a candidate at every position, just excluding what's already placed).`,
    code: `def permutations(nums):
    result = []
    used = [False] * len(nums)
    current = []

    def backtrack():
        if len(current) == len(nums):
            result.append(current[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            current.append(x)
            backtrack()
            used[i] = False
            current.pop()

    backtrack()
    return result`,
    complexity: {
      structure: "Permutations (backtracking)",
      operations: [{ op: "Generate all", time: "O(n · n!)", note: "n! permutations, O(n) to copy each" }],
    },
    related: ["backtracking-combinations", "backtracking-permutations-vs-combinations-vs-subsets"],
  },
  {
    id: "backtracking-combinations",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement backtracking to generate all size-k combinations of a list (order doesn't matter).",
    back: `The key structural difference from permutations: only ever consider elements **after** the current start index — this is exactly what prevents generating both \`[1,2]\` and \`[2,1]\` as if they were distinct (they'd represent the same combination).`,
    code: `def combinations(nums, k):
    result = []
    current = []

    def backtrack(start):
        if len(current) == k:
            result.append(current[:])
            return
        for i in range(start, len(nums)):
            current.append(nums[i])
            backtrack(i + 1)   # never revisit indices before i
            current.pop()

    backtrack(0)
    return result`,
    complexity: {
      structure: "Combinations (backtracking)",
      operations: [{ op: "Generate all C(n,k)", time: "O(k · C(n,k))" }],
    },
    pitfall:
      "Passing `start` instead of `i + 1` (or forgetting the start-index restriction entirely) turns this back into a permutation-style generator, producing duplicate combinations in different orders.",
    related: ["backtracking-permutations", "backtracking-subsets"],
  },
  {
    id: "backtracking-subsets",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement backtracking to generate all subsets (the power set) using the include/exclude pattern.",
    back: `Every element gets an explicit **binary choice** at each recursive level — include it in the current subset, or don't — rather than combinations' 'pick the next k' framing. This naturally generates all $2^n$ subsets, including the empty set and the full set.`,
    code: `def subsets(nums):
    result = []
    current = []

    def backtrack(i):
        if i == len(nums):
            result.append(current[:])
            return
        # exclude nums[i]
        backtrack(i + 1)
        # include nums[i]
        current.append(nums[i])
        backtrack(i + 1)
        current.pop()

    backtrack(0)
    return result`,
    complexity: {
      structure: "Subsets / Power Set (backtracking)",
      operations: [{ op: "Generate all 2ⁿ subsets", time: "O(n · 2ⁿ)" }],
    },
    related: ["backtracking-combinations", "backtracking-permutations-vs-combinations-vs-subsets"],
  },
  {
    id: "backtracking-permutations-vs-combinations-vs-subsets",
    tier: 2,
    module: MODULE,
    type: "compare",
    front: "Permutations vs. combinations vs. subsets — what structural difference in the backtracking template produces each?",
    back: `All three use the same choose/explore/un-choose skeleton; they differ in **what's allowed as the next choice** at each recursive step:

| | Order matters? | Reuse earlier indices? | Count |
|---|---|---|---|
| Permutations | Yes | Any unused element, from anywhere | n! |
| Combinations (size k) | No | Only indices ≥ current start | C(n,k) |
| Subsets (power set) | No | Binary include/exclude per element, in index order | 2ⁿ |

The recognizable tell in code: permutations track a **used[] array** (any not-yet-used element is fair game, from anywhere in the list); combinations pass a **start index forward** (never look back); subsets make an explicit **binary decision per element** rather than "picking the next item" at all. Recognizing which of these three shapes a problem actually wants is most of the work — the recursive skeleton around it is nearly identical in all three.`,
    related: ["backtracking-permutations", "backtracking-combinations", "backtracking-subsets"],
  },

  // ------------------------------------------------------------- Word search
  {
    id: "backtracking-word-search",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does backtracking solve word search / maze pathfinding on a grid?",
    back: `From each candidate starting cell, DFS outward: at each step, check whether the current cell matches the next needed character (word search) or is a valid open path cell (maze), then recurse into up to 4 (or 8) neighboring cells. Before recursing, **mark the current cell as visited** (so the path can't loop back on itself); after the recursive calls return (whether they found a solution or not), **unmark it** — this is the choose/explore/un-choose template applied directly to grid traversal.

The unmark step is essential specifically because the *same* cell needs to be available again for **a different candidate path** that doesn't happen to pass through it (e.g. a different starting position, or a different word in a word-search board) — permanently marking cells visited (as in ordinary graph BFS/DFS, which never unmarks) would incorrectly block valid alternative paths.`,
    code: `def word_search(board, word):
    rows, cols = len(board), len(board[0])

    def backtrack(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < rows and 0 <= c < cols) or board[r][c] != word[i]:
            return False
        temp, board[r][c] = board[r][c], '#'   # mark visited
        found = any(backtrack(r+dr, c+dc, i+1) for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)])
        board[r][c] = temp                      # un-mark
        return found

    return any(backtrack(r, c, 0) for r in range(rows) for c in range(cols))`,
    pitfall:
      "This 'mark then unmark' pattern is the distinguishing feature of backtracking-based grid search vs. plain BFS/DFS graph traversal (Tier 1) — plain traversal marks a cell visited PERMANENTLY for the whole run, which is wrong here since different candidate paths need to reuse the same cells.",
    related: ["backtracking-general-template", "graph-traversal-dfs"],
  },

  // ------------------------------------------------------------- Pruning
  {
    id: "backtracking-pruning-strategies",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What pruning strategies matter for backtracking's practical runtime, beyond the basic template?",
    back: `The bare choose/explore/un-choose template only prunes branches that are **already known invalid** at the point of choice — the strategies below prune *more aggressively and earlier*, often turning an impractical exponential search into a fast one on real inputs, even though the worst-case asymptotic bound doesn't change:

- **Constraint propagation**: after each choice, proactively narrow the remaining options for *other* not-yet-decided variables (e.g. in Sudoku, placing a digit immediately removes it from that row/column/box's candidate sets for every other empty cell) — catches dead ends before even trying them, rather than discovering the failure several levels deeper.
- **Most-constrained-variable ordering**: choose next whichever variable currently has the **fewest** valid options remaining (Sudoku's "fill the most-constrained cell first") — fails fast on doomed branches instead of wasting work on easy, under-constrained choices first.
- **Early feasibility checks**: check partial validity as soon as possible rather than only at a complete candidate (N-Queens checking column/diagonal conflicts row-by-row, not only once all $n$ queens are placed).
- **Symmetry breaking**: if the problem has symmetric solutions (e.g. N-Queens board reflections), fix one choice to eliminate an entire symmetric family of otherwise-redundant branches.

None of these change the worst-case exponential bound — backtracking problems are frequently NP-hard (Tier 3) — but in practice they're the difference between a solver that finishes instantly and one that doesn't finish at all on realistically-sized inputs.`,
    pitfall:
      "Pruning strategies improve practical/average-case performance dramatically but do NOT change the worst-case asymptotic complexity — don't cite 'we added pruning' as if it proves a polynomial-time bound on an inherently exponential search problem.",
    related: ["backtracking-general-template", "backtracking-sudoku-solver", "backtracking-n-queens"],
  },
];
