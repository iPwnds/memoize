import type { Card } from "./types";

const MODULE = "greedy";

export const greedyCards: Card[] = [
  {
    id: "greedy-choice-property",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the greedy-choice property and optimal substructure, and why does a greedy algorithm need both?",
    back: `- **Greedy-choice property**: a globally optimal solution can be reached by making a **locally optimal choice at each step**, without ever reconsidering that choice later. This is the property that lets greedy algorithms commit immediately instead of exploring alternatives (unlike DP, which keeps multiple possibilities alive via subproblem tables).
- **Optimal substructure**: same requirement as DP — an optimal solution to the whole problem contains optimal solutions to its subproblems.

A problem needs **both** for greedy to be valid: optimal substructure alone (which 0/1 knapsack also has) doesn't guarantee that the locally-best choice never needs to be revisited — see the counterexample card for exactly this failure mode. Proving the greedy-choice property genuinely holds for a specific problem is usually done via an **exchange argument** (see that card) — it's rarely "obviously true" and needs to be actually verified, not assumed by analogy to a problem where greedy did work.`,
    pitfall:
      "The most common conceptual error in this module: assuming a greedy strategy is correct because it 'seems reasonable' or worked on a similar-looking problem — greedy correctness requires an actual proof (the exchange argument), and being wrong is common and easy (see the 0/1 knapsack counterexample).",
    related: ["greedy-exchange-argument", "greedy-knapsack-counterexample"],
  },

  // -------------------------------------------------------- Activity selection
  {
    id: "greedy-activity-selection",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the activity selection problem, and why does 'earliest finish time first' greedy work?",
    back: `Given a set of activities each with a start and finish time, select the **maximum number** of non-overlapping activities that can be scheduled in a single room/resource.

Greedy strategy: sort activities by **finish time** ascending; repeatedly pick the next activity whose start time is $\\geq$ the finish time of the last picked activity. This works because picking the activity that finishes *earliest* among the remaining compatible ones always leaves the **maximum possible remaining time** for scheduling everything after it — no other valid first choice can leave a strictly larger window of remaining time, so it can never be strictly worse to pick it (the exchange argument formalizes this: any optimal solution can be modified to start with the earliest-finishing activity without reducing its size).

Notably, sorting by **shortest duration** or **earliest start time** are both tempting but *incorrect* greedy strategies here — only earliest finish time provably works.`,
    code: `def activity_selection(activities):  # list of (start, finish)
    activities = sorted(activities, key=lambda a: a[1])  # by finish time
    selected = [activities[0]]
    last_finish = activities[0][1]
    for start, finish in activities[1:]:
        if start >= last_finish:
            selected.append((start, finish))
            last_finish = finish
    return selected`,
    complexity: {
      structure: "Activity Selection",
      operations: [{ op: "Greedy (after sort)", time: "O(n log n)", note: "dominated by the sort" }],
    },
    pitfall:
      "Sorting by shortest duration first is a very tempting but INCORRECT greedy strategy — a short activity in the middle of the timeline can block two longer, non-overlapping activities that together would have allowed a larger total count.",
    related: ["greedy-exchange-argument"],
  },

  // ------------------------------------------------------------ Huffman
  {
    id: "greedy-huffman-coding",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Huffman coding greedily build an optimal prefix code?",
    back: `Goal: assign variable-length binary codes to symbols (based on frequency) minimizing total encoded length, with the **prefix property** (no code is a prefix of another, so a decoder never needs lookahead/separators to know where one code ends).

Greedy algorithm: put all symbols in a **min-heap** keyed by frequency. Repeatedly **extract the two lowest-frequency nodes**, merge them into a new internal node (frequency = sum of the two), and push it back — this new node's two children become the 0/1 branches for those two symbols/subtrees. Repeat until one node remains: the root of the Huffman tree. Each symbol's code is the path of 0s/1s from root to its leaf.

Why greedy works: the two least-frequent symbols can always be placed as **siblings at the deepest level** of an optimal tree without increasing total cost (an exchange argument again — if they weren't siblings at the deepest level in some optimal tree, swapping them there can only maintain or improve the total weighted path length, since anything else at that depth has frequency $\\geq$ theirs).`,
    code: `import heapq
from collections import Counter

def huffman_codes(text):
    freq = Counter(text)
    heap = [[f, [ch, ""]] for ch, f in freq.items()]
    heapq.heapify(heap)
    while len(heap) > 1:
        lo = heapq.heappop(heap)
        hi = heapq.heappop(heap)
        for pair in lo[1:]:
            pair[1] = '0' + pair[1]
        for pair in hi[1:]:
            pair[1] = '1' + pair[1]
        heapq.heappush(heap, [lo[0] + hi[0]] + lo[1:] + hi[1:])
    return dict(heap[0][1:])`,
    complexity: {
      structure: "Huffman Coding",
      operations: [{ op: "Build code (n symbols)", time: "O(n log n)", note: "n heap extract/insert pairs" }],
    },
    pitfall:
      "Huffman coding produces an OPTIMAL prefix code for a GIVEN frequency table — it doesn't mean the encoded output is always shorter than a fixed-width encoding for every possible input, only that among all valid prefix codes for that frequency distribution, its expected length is minimal.",
    related: ["greedy-choice-property", "heaps-priority-queue-adt"],
  },

  // --------------------------------------------------------- Fractional knapsack
  {
    id: "greedy-fractional-knapsack",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement the greedy solution to fractional knapsack.",
    back: `Sort by value-per-weight ratio descending, then greedily take as much of each item as fits, taking a fraction of the last item that doesn't fit whole. See the Dynamic Programming module's knapsack-contrast card for why this greedy approach is provably optimal here but fails for 0/1 knapsack.`,
    code: `def fractional_knapsack(items, capacity):  # items: list of (weight, value)
    items = sorted(items, key=lambda x: x[1] / x[0], reverse=True)
    total_value = 0.0
    for weight, value in items:
        if capacity <= 0:
            break
        take = min(weight, capacity)
        total_value += value * (take / weight)
        capacity -= take
    return total_value`,
    complexity: {
      structure: "Fractional Knapsack",
      operations: [{ op: "Greedy (after sort)", time: "O(n log n)" }],
    },
    related: ["dynamic-programming-fractional-knapsack-contrast", "greedy-exchange-argument"],
  },

  // ---------------------------------------------------- Job sequencing
  {
    id: "greedy-job-sequencing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does greedy job sequencing with deadlines work?",
    back: `Each job has a profit and a deadline (must finish by that time slot to earn the profit); each time slot holds exactly one job. Maximize total profit.

Greedy strategy: sort jobs by **profit descending**. For each job (highest profit first), place it in the **latest available time slot at or before its deadline** (search backward from its deadline for a free slot). If no slot is free by its deadline, skip the job (it can't be scheduled profitably).

Why "latest available slot," not just "any available slot": greedily using the latest possible slot preserves earlier slots for other jobs that might have tighter deadlines — using an earlier slot unnecessarily could block a different job that has no later option.`,
    code: `def job_sequencing(jobs):  # jobs: list of (deadline, profit)
    jobs = sorted(jobs, key=lambda j: j[1], reverse=True)
    max_deadline = max(d for d, p in jobs)
    slots = [None] * (max_deadline + 1)  # slots[1..max_deadline], 1-indexed
    total_profit = 0
    for deadline, profit in jobs:
        for t in range(min(deadline, max_deadline), 0, -1):
            if slots[t] is None:
                slots[t] = (deadline, profit)
                total_profit += profit
                break
    return total_profit, slots`,
    complexity: {
      structure: "Job Sequencing with Deadlines",
      operations: [{ op: "Greedy (naive slot search)", time: "O(n²)", note: "O(n log n) achievable with Union-Find for slot search" }],
    },
    pitfall:
      "A naive backward linear scan for a free slot is O(n) per job (O(n²) total); a Union-Find structure tracking 'next free slot at or before t' brings this down to near O(n α(n)) — the same Union-Find technique used for Kruskal's, repurposed here for slot allocation instead of cycle detection.",
    related: ["greedy-activity-selection", "shortest-paths-mst-union-find"],
  },

  // -------------------------------------------------------- Exchange argument
  {
    id: "greedy-exchange-argument",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the exchange argument, and how does it prove a greedy algorithm is correct?",
    back: `A proof technique with a consistent shape: **take an arbitrary optimal solution** (assume one exists, don't assume it's the greedy one), and show that it can be **transformed step by step into the greedy solution without ever making it worse**. If every transformation step preserves optimality, then the greedy solution must also be optimal (it's reachable from *some* optimal solution via cost-preserving swaps).

Concretely, for activity selection: suppose an optimal solution doesn't start with the earliest-finishing activity $a$. Since $a$ finishes earliest, whatever activity the optimal solution *does* start with must finish no earlier than $a$ — so **swapping** that first activity for $a$ cannot break compatibility with the rest of the optimal solution's chosen activities (they were already compatible with a later-or-equal finish time, so they're certainly compatible with $a$'s earlier-or-equal finish time), and the solution's size is unchanged. Repeating this swap argument shows an optimal solution matching greedy's choices, step by step, must exist.

This is the standard template for proving *any* greedy algorithm in this module correct — activity selection, Huffman coding, and fractional knapsack all admit a version of this same "swap an optimal solution's choice for the greedy choice without loss" argument.`,
    pitfall:
      "An exchange argument that only shows the greedy choice is 'no worse' than SOME alternative isn't sufficient — it must show the swap is safe against an arbitrary OPTIMAL solution, or the proof has a gap (this is exactly the kind of gap that would incorrectly 'prove' greedy correct for 0/1 knapsack if done sloppily).",
    related: ["greedy-choice-property", "greedy-activity-selection"],
  },

  // ------------------------------------------------------ Counterexample
  {
    id: "greedy-knapsack-counterexample",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What's a clean counterexample showing greedy fails for 0/1 knapsack?",
    back: `Capacity 10. Items (weight, value): $A = (6, 6)$, $B = (5, 5)$, $C = (5, 5)$ — all identical ratio (value/weight = 1.0), so a naive "best ratio first" greedy has no tiebreak preference, but consider the more standard version of this counterexample with distinct ratios to see the failure clearly:

Capacity 10. Items: $A=(\\text{weight }6,\\ \\text{value }100)$ [ratio $16.7$], $B=(\\text{weight }5,\\ \\text{value }60)$ [ratio $12$], $C=(\\text{weight }5,\\ \\text{value }60)$ [ratio $12$].

**Greedy (by ratio)** picks $A$ first (weight 6, value 100), leaving capacity 4 — not enough for $B$ or $C$ (weight 5 each). Total: **100**.

**Optimal (0/1)**: skip $A$ entirely, take $B$ and $C$ together (weight $5+5=10$, exactly fits): value $60+60=$ **120**.

Greedy's locally-best first choice ($A$'s superior ratio) *locks in* a capacity remainder that can't be used productively — exactly the failure mode fractional knapsack never has, because there, any leftover capacity could always be filled with a fraction of the next item, making the ratio-greedy choice safe. Indivisibility is what breaks the greedy-choice property here — this is why 0/1 knapsack needs the DP formulation (see that module) instead.`,
    pitfall:
      "This counterexample is worth memorizing exactly because it's the standard one used to test whether you actually understand WHY greedy fails here (indivisibility breaking the exchange argument) rather than just knowing the fact 'greedy doesn't work for 0/1 knapsack.'",
    related: ["greedy-choice-property", "dynamic-programming-fractional-knapsack-contrast", "dynamic-programming-knapsack-01"],
  },

  // --------------------------------------------------- Greedy vs DP heuristic
  {
    id: "greedy-vs-dp-heuristic",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "General heuristic: how do you tell whether a problem needs greedy or DP?",
    back: `Both require optimal substructure — the deciding question is whether the **locally best choice at each step can ever need to be revisited** in light of later information.

- If committing to the locally-best choice **never** needs to be undone (provable via an exchange argument) → **greedy** suffices, and is typically faster ($O(n \\log n)$-ish, usually dominated by an initial sort) than the corresponding DP.
- If the locally-best choice **can** turn out wrong once you see more of the problem (indivisibility, conflicting constraints that only resolve later) → you need **DP**, exploring/caching multiple partial solutions instead of committing early.

Practical test: try to construct a counterexample to the greedy strategy you're considering (as in the knapsack counterexample). If you can't find one after genuinely trying, and especially if you can sketch an exchange argument, greedy is likely correct. If you find a counterexample, that's your signal to reach for DP instead — and often the exchange argument's failure point directly suggests *why* (as with knapsack's indivisibility).`,
    related: ["greedy-choice-property", "dynamic-programming-what-makes-dp-able"],
  },
];
