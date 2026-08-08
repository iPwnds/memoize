import type { Card } from "./types";

const MODULE = "systems-adjacent";

export const systemsAdjacentCards: Card[] = [
  // ------------------------------------------------------ Disk I/O cost model
  {
    id: "systems-adjacent-disk-io-cost-model",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What is the disk I/O (external memory) cost model, and why does it change how you measure an algorithm's cost?",
    back: `Ordinary Big-O analysis (Tier 1) counts **comparisons/operations**, implicitly assuming every memory access costs the same. That assumption breaks down badly once data lives on **disk** (or even just doesn't fit in a fast cache level): reading one byte from disk and reading a whole 4KB-16KB **block** containing that byte cost roughly the **same** wall-clock time, dominated by seek/access latency, not transfer size. Under this reality, an algorithm that touches many scattered individual bytes across many separate blocks can be dramatically slower than one that touches the same *amount* of data but organized into fewer, larger sequential block reads — even if both have identical Big-O operation counts.

The **external memory model** formalizes this: cost is measured in **number of block transfers (I/Os)**, parameterized by block size $B$ and available fast memory size $M$, not raw operation count. This is exactly the model that motivated B-trees' node-size-equals-disk-page-size design (Tier 2, Specialized Trees) and external sorting's multi-way merge (see that card) — both are algorithms specifically *designed* to minimize I/O count under this model, sometimes at the cost of doing objectively *more* raw comparisons than an in-memory-optimal algorithm would.`,
    pitfall:
      "An algorithm that's asymptotically optimal by comparison-count (e.g. plain quicksort) can be far worse in practice than a 'worse' comparison-count algorithm (multi-way merge sort) once data exceeds memory — the two cost models can disagree about which algorithm is 'better,' and disk-backed systems must optimize for the I/O model, not the comparison model.",
    related: ["specialized-trees-btree-overview", "systems-adjacent-external-sorting"],
  },

  // -------------------------------------------------------- B-trees revisited
  {
    id: "systems-adjacent-btree-io-revisited",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "Under the disk I/O cost model, why exactly does a B-tree's height equal its I/O cost, and how does that formalize the Tier 2 intuition?",
    back: `Under the external memory model (see that card), each B-tree **node** is sized to exactly fill one disk block ($B$ keys/pointers per node, matched to block size). Since each level of the tree is a **separate** disk block (nodes at different levels are essentially never the same physical block), descending from root to leaf requires exactly **one I/O per level** — so total search cost **in I/Os** is precisely the tree's **height**, $O(\\log_B n)$.

This formalizes the Tier 2 intuition ("wide branching keeps the tree shallow, minimizing disk reads") into the actual cost measure that matters: not "number of comparisons" (which a binary BST also does in $O(\\log_2 n)$, no worse asymptotically in the comparison model) but **number of I/Os**, where the base of the logarithm is $B$ (block capacity, often in the hundreds) rather than 2. For $n = 10^9$ and $B = 200$: a binary BST needs $\\log_2(10^9) \\approx 30$ I/Os (if each node access is a separate disk read), while a B-tree needs $\\log_{200}(10^9) \\approx 4$ I/Os — a roughly 7x reduction in the metric that actually dominates wall-clock time on disk-backed storage, even though both are "$O(\\log n)$" in the comparison model.`,
    complexity: {
      structure: "B-tree (disk I/O model)",
      operations: [{ op: "Search (I/O count)", time: "O(logB n)", note: "B = block capacity; the metric that matters on disk" }],
    },
    pitfall:
      "Comparing a B-tree to a binary BST by comparison-count alone (both O(log n)) misses the entire point of B-trees — the design only makes sense once you switch to counting I/Os, where the base-B vs base-2 logarithm difference is the whole story.",
    related: ["systems-adjacent-disk-io-cost-model", "specialized-trees-btree-overview", "specialized-trees-bplus-tree"],
  },

  // ------------------------------------------------------- External sorting
  {
    id: "systems-adjacent-external-sorting",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does external sorting minimize I/O when data doesn't fit in memory, and how do you choose the merge fan-in k?",
    back: `As introduced in Tier 1 (Sorting module): (1) split data into chunks that fit in available memory $M$, sort each in-memory (any fast in-memory sort), write each sorted "run" back to disk; (2) **k-way merge** the runs using a min-heap of size $k$, streaming output.

Revisited under the I/O cost model: **pass count** is what matters, not comparisons. Phase 1 costs $O(n/B)$ I/Os (reading and writing the data once, block by block). Phase 2's cost depends on $k$: merging $n/M$ runs $k$-at-a-time requires $\\lceil \\log_k(n/M) \\rceil$ **passes** over the data if $k$ isn't large enough to merge everything in one shot, each pass costing $O(n/B)$ I/Os — total $O\\left(\\frac{n}{B}\\log_k \\frac{n}{M}\\right)$.

**Choosing $k$**: larger $k$ needs more simultaneous input buffers (one block-sized buffer per run being merged, all held in memory at once) — so $k$ is chosen as large as memory allows, $k \\approx M/B$ (as many buffers as fit). Maximizing $k$ this way typically collapses the merge to a **single pass** for realistic data/memory ratios, which is exactly why real database/external-sort implementations aim for — and usually achieve — a **two-pass** total algorithm (one pass to create runs, one pass to merge them all at once with the largest feasible $k$), rather than a deep multi-level merge tree.`,
    complexity: {
      structure: "External Sort",
      operations: [
        { op: "Run generation", time: "O(n/B) I/Os" },
        { op: "k-way merge (k = M/B, typically single-pass)", time: "O(n/B) I/Os total", note: "when k is large enough to merge all runs in one pass" },
      ],
    },
    pitfall:
      "Choosing k too small (e.g. a naive 2-way merge, repeatedly halving the number of runs) turns a single-pass merge into O(log(n/M)) passes — each an O(n/B) I/O cost — which is exactly the mistake maximizing k (using all available memory for buffers) avoids.",
    related: ["sorting-merge-external-sorting", "systems-adjacent-disk-io-cost-model"],
  },

  // -------------------------------------------------- Cache-oblivious
  {
    id: "systems-adjacent-cache-oblivious",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What does 'cache-oblivious' mean, and why is it a valuable property for an algorithm to have?",
    back: `A **cache-aware** algorithm (like a B-tree tuned to a specific disk block size, or external sort tuned to a specific memory size $M$) is explicitly parameterized by the cache/block/memory size and optimized for that particular value — it needs to *know* $B$ and $M$ to perform well, and performs poorly if those parameters are wrong or unknown.

A **cache-oblivious** algorithm achieves similarly good I/O performance **without knowing $B$ or $M$ at all** — it's written using only ordinary recursive divide-and-conquer, and its recursive structure *happens* to naturally align with **any** level of a memory hierarchy (L1 cache, L2 cache, RAM, disk — all simultaneously, without separate tuning for each), because at some point in the recursion, the current subproblem's size will fit within whatever cache level exists at whatever size it happens to be.

**Concrete example**: a cache-oblivious matrix multiply or transpose, implemented via straightforward recursive quadrant-splitting (divide the matrix into quadrants, recurse, combine — no different from an ordinary divide-and-conquer algorithm) automatically achieves near-optimal I/O behavior at every cache level simultaneously, purely because at some recursion depth, the current sub-matrix fits into L1 cache; at a shallower depth, into L2; at a shallower depth still, into RAM — all without the algorithm's code ever referencing a specific cache size. The elegance is that the *same, simple, untuned* recursive code is what achieves this — no explicit blocking/tiling parameters need to be chosen or retuned per machine.`,
    pitfall:
      "Cache-oblivious algorithms are elegant and portable (same code performs well across different hardware without retuning) but don't always beat a carefully hand-tuned cache-aware algorithm on a SPECIFIC known machine — the value proposition is portability and simplicity of design, not necessarily raw peak performance on one fixed target.",
    related: ["systems-adjacent-cache-oblivious-vs-aware"],
  },
  {
    id: "systems-adjacent-cache-oblivious-vs-aware",
    tier: 3,
    module: MODULE,
    type: "compare",
    front: "Cache-oblivious vs. cache-aware algorithm design — what's the actual trade-off?",
    back: `| | Cache-aware | Cache-oblivious |
|---|---|---|
| Needs to know B, M? | Yes — explicitly tuned | No — works across all levels automatically |
| Peak performance on one known machine | Can be hand-optimized higher | Very good, but generally not hand-tuned-optimal |
| Portability | Must retune per hardware/cache size | Same code performs well everywhere |
| Design complexity | Explicit blocking/tiling parameters to choose | Often just 'write the natural recursive divide-and-conquer version' |

Reach for **cache-aware** design (B-trees sized to disk pages, external sort's k chosen from actual memory size) when you know the deployment target and peak performance matters enough to justify the tuning effort and maintenance burden of re-tuning if hardware changes. Reach for (or simply benefit for free from) **cache-oblivious** design when portability matters, or when a problem's natural recursive structure already happens to be cache-oblivious — which is more often than one might expect, since many divide-and-conquer algorithms (merge sort, matrix multiplication) are cache-oblivious by default, without any extra design effort, purely as a byproduct of their recursive shape.`,
    related: ["systems-adjacent-cache-oblivious"],
  },
];
