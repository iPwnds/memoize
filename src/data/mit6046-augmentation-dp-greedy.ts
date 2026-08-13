// MIT 6.046J / 18.410J (Spring 2015) — Lectures 9-12: tree augmentation
// (finger search trees, range trees), advanced dynamic programming (longest
// palindromic subsequence, optimal BST), all-pairs shortest paths via
// min-plus matrix multiplication and difference constraints, and the formal
// optimal-substructure/greedy-choice-property proofs behind MST algorithms.
// This lecture range has the heaviest overlap yet with material already
// covered elsewhere in the app — order-statistics trees (mit6006), the
// alternating coin game (mit6006), and Bellman-Ford/Floyd-Warshall/Kruskal's/
// Prim's/Union-Find (Complexity Class) are all already covered in depth
// there, so this module is intentionally leaner and cross-links to that
// existing content rather than re-deriving it; the cards here focus on what
// has no equivalent anywhere else in the app. See src/data/courses.ts for
// the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6046-augdp";

export const mit6046AugmentationDpGreedyCards: Card[] = [
  {
    id: "mit6046-augdp-finger-search-trees",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What problem do finger search trees solve, and how do level-linked 2-3 trees achieve O(log|rank(y)-rank(x)|) search from a nearby node?",
    back: `**Goal** (Brown & Tarjan, 1980): given a node $y$ you already have a reference to, search for $x$ in $O(\\log|\\text{rank}(y) - \\text{rank}(x)|)$ time — fast specifically when $x$ is *close* to $y$ in sorted order, regardless of how large the whole structure is. This generalizes ordinary $O(\\log n)$ search (which is the special case where $y$ is the root, i.e. "far" from everything).

**Structure — level-linked 2-3 trees**: augment an ordinary 2-3 tree so every node has pointers to its **previous and next sibling at the same level** (not just parent/child pointers) — level links can be maintained incrementally during split (the new node created gets linked into the level) and merge (the deleted node's links get spliced out), no extra asymptotic cost. All keys live in the **leaves**; internal nodes store no keys directly, only (via easy tree augmentation) the **min and max** key of their subtree.

**Search$(x)$ from $y$**: start at the leaf containing $y$. Repeatedly: if $x$ falls within the current node's $[\\min,\\max]$ range, do an ordinary top-down search from there and finish; if $x < \\min$, move to the *previous* node at this level (via the level link); if $x > \\max$, move to the *next* node; otherwise move up to the parent and repeat. This walks up from the leaf, using level links to check neighboring subtrees before ascending further, until it finds a subtree range containing $x$, then descends normally.

**Why this achieves the bound**: at height $i$ above the leaves, a level link skips over roughly $c^i$ keys (ranks), where $c \\in [2,3]$ (the branching factor range of a 2-3 tree). So if $|\\text{rank}(y)-\\text{rank}(x)| = k$, the upward walk needs only $O(\\log k)$ steps to reach a subtree containing $x$ — each step's level-link jump covering exponentially more ground than the last — and the subsequent top-down search is also $O(\\log k)$ (bounded by the height of that subtree, which is itself $O(\\log k)$ since the subtree's size is $O(k)$).`,
    related: ["mit6006-trees-heaps-augment-steps"],
  },
  {
    id: "mit6046-augdp-range-trees",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How do 1D, 2D, and d-D range trees answer orthogonal range queries, and how does dimensionality trade off against space?",
    back: `**Orthogonal range searching**: given $n$ points in $d$-dimensional space, find all points inside an axis-aligned box $[a_1,b_1] \\times \\cdots \\times [a_d,b_d]$. A sorted array (1D only) or a finger-search-tree-backed dynamic sorted structure both answer 1D range queries in $O(\\log n + k)$ ($k$ = output size) — but neither generalizes to higher dimensions, motivating **range trees**.

**1D range tree**: a complete/balanced BST (e.g. an AVL tree). $\\text{range-query}(a,b)$: search for $a$ and $b$, find their **lowest common ancestor** $v_{\\text{split}}$, then walk down from $v_{\\text{split}}$ along both the $a$-path and $b$-path, collecting the $O(\\log n)$ subtrees hanging entirely "between" the two paths (each subtree consists entirely of points in-range, reported wholesale via subtree-size augmentation without inspecting each point individually). Total: $O(\\log n)$ to represent the answer implicitly, $O(\\log n + k)$ to enumerate all $k$ points explicitly.

**2D range tree**: a *primary* 1D range tree keyed on the first coordinate, where **every node** additionally stores a *secondary* 1D range tree (keyed on the second coordinate) over all points in that node's subtree. $\\text{range-query}(a,b)$: use the primary tree to find the $O(\\log n)$ "in-between" nodes/subtrees for the first coordinate, then for each, query its secondary tree for the second coordinate's range. Cost: $O(\\log^2 n)$ to represent the answer (since there are $O(\\log n)$ secondary-tree queries, each itself $O(\\log n)$), $O(\\log^2 n + k)$ to enumerate. **Space**: $O(n\\log n)$ — each point is duplicated into a secondary tree once per ancestor in the primary tree, i.e. $O(\\log n)$ copies per point.

**$d$-D range tree**: recurse the same construction — primary 1D tree $\\to$ secondary 1D trees $\\to$ tertiary 1D trees $\\to \\cdots$, one level of nesting per dimension. Range-query cost: $O(\\log^d n + k)$. Space: $O(n\\log^{d-1}n)$ (one fewer log factor than the query time, since the outermost dimension doesn't need the duplication overhead the inner ones do). This is a direct cost of generality: each additional dimension costs one more $\\log n$ factor in both query time and space — a course pointer (6.851, "Advanced Data Structures") is given for improved bounds (Chazelle) shaving one log factor off both.`,
    pitfall:
      "The O(log^d n + k) query bound and O(n log^{d-1} n) space bound have DIFFERENT exponents on the log factor — it's easy to misremember these as matching. The space bound is one dimension 'cheaper' because the outermost (primary) tree doesn't need to be duplicated into anything above it.",
    related: ["mit6046-augdp-finger-search-trees", "computational-geometry-sweep-line"],
  },
  {
    id: "mit6046-augdp-longest-palindromic-subsequence",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Derive the DP recurrence for longest palindromic subsequence, and explain why naive memoization without a subproblem count bound looks exponential.",
    back: `**Problem**: given string $X[1..n]$, find the length of the longest **subsequence** (not necessarily contiguous) of $X$ that is a palindrome — e.g. for "character", the answer is "carac" (length 5).

**Subproblem**: $L(i,j)$ = length of the longest palindromic subsequence of $X[i..j]$, for $i \\leq j$. **Recurrence**:
- Base case: $L(i,i) = 1$ (single character).
- If $X[i] = X[j]$: those two matching endpoints can both be included in the palindrome, contributing 2, plus whatever's achievable strictly inside: $L(i,j) = 2 + L(i+1,j-1)$ (or just 2, if $i+1=j$, to avoid double-counting when the "inside" is empty or a single character).
- Else ($X[i] \\neq X[j]$): at least one endpoint can't be part of an optimal palindrome starting exactly at $i$ and ending exactly at $j$ — try dropping either end: $L(i,j) = \\max(L(i+1,j), L(i,j-1))$.

**Why the naive recursive implementation looks exponential**: written directly as a recursive function without memoization, and assuming all characters of $X$ are distinct (forcing the "else" branch every time), the recurrence $T(n) = 2T(n-1)$ (two recursive calls, each on a string one shorter) solves to $T(n) = 2^{n-1}$ — apparently exponential.

**Why it's actually polynomial once memoized**: the *apparent* exponential blowup comes from re-solving the *same* $(i,j)$ pairs repeatedly along different recursive paths — but there are only $\\binom{n}{2} = \\Theta(n^2)$ **distinct** $(i,j)$ pairs with $i < j$ in total. Memoizing $L(i,j)$ (hashing $(i,j)$ as a key, or using a 2D array indexed directly by $i,j$) means each distinct subproblem is solved exactly once, at $O(1)$ work per subproblem given its (already-solved) smaller dependencies — giving $\\Theta(n^2) \\cdot \\Theta(1) = \\Theta(n^2)$ total, not exponential. Equivalently, solving subproblems bottom-up in order of increasing $j-i$ (so smaller instances are always ready before larger ones need them) achieves the same bound without explicit memoization bookkeeping.`,
    code: `def L(i, j, X, memo={}):
    if (i, j) in memo: return memo[(i, j)]
    if i == j: return 1
    if X[i] == X[j]:
        result = 2 if i + 1 == j else 2 + L(i + 1, j - 1, X, memo)
    else:
        result = max(L(i + 1, j, X, memo), L(i, j - 1, X, memo))
    memo[(i, j)] = result
    return result`,
    pitfall:
      "The apparent exponential recurrence T(n) = 2T(n-1) describes the *unmemoized* call tree's shape, not the actual work done once memoized — conflating these two is a common source of confusion when first seeing 'this looks like it should be exponential' DP problems.",
    related: ["dynamic-programming-lcs", "dynamic-programming-memo-vs-tabulation"],
  },
  {
    id: "mit6046-augdp-optimal-bst",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Set up the optimal binary search tree DP recurrence, and show via a concrete counterexample why a greedy 'pick the highest-weight key as root' strategy fails.",
    back: `**Problem**: given sorted keys $K_1 < K_2 < \\cdots < K_n$ with weights $W_1,\\ldots,W_n$ (e.g. search frequencies — building a dictionary where common words should be found faster), find the BST minimizing $\\sum_i W_i \\cdot (\\text{depth}_T(K_i) + 1)$ — the weighted total search cost. Brute-force enumeration is hopeless: there are exponentially many possible tree shapes even for the given fixed key order.

**DP setup**: let $W(i,j) = W_i + W_{i+1} + \\cdots + W_j$ and $e(i,j)$ = the minimum cost of an optimal BST built from just keys $K_i,\\ldots,K_j$. Want $e(1,n)$. **Strategy — guess all possible roots**: for each candidate root $K_r$ ($i \\leq r \\leq j$), keys $K_i,\\ldots,K_{r-1}$ form the left subtree and $K_{r+1},\\ldots,K_j$ the right subtree — recursively optimal by the same argument, plus every key in *either* subtree has its depth increased by 1 (one more step down from the new root), which conveniently is accounted for by simply adding $W(i,j)$ (not just $W_r$) to the recursive subtree costs:
$$e(i,j) = \\begin{cases} W_i & i = j \\\\ \\min_{i \\leq r \\leq j}\\big(e(i,r-1) + e(r+1,j) + W(i,j)\\big) & \\text{else} \\end{cases}$$
$\\Theta(n^2)$ subproblems, $\\Theta(n)$ work each (trying every root) $= \\Theta(n^3)$ total.

**Why a greedy "always pick the max-weight key as root" rule fails**: consider weights $W_1=1, W_2=10, W_3=8, W_4=9$ for keys $1,2,3,4$. Greedy picks $K_2$ (weight 10) as root first. One resulting tree (root $K_2$, with $K_3$ as $K_2$'s right child and $K_1,K_4$ placed to keep BST order) gives cost $1{\\times}2 + 10{\\times}1 + 8{\\times}2 + 9{\\times}3 = 2+10+16+27=55$. But choosing root $K_3$ instead (weight 8, *not* the maximum) — with $K_2$ as $K_3$'s left child, $K_1$ as $K_2$'s child, and $K_4$ as $K_3$'s right child — gives cost $1{\\times}3 + 10{\\times}2 + 8{\\times}1 + 9{\\times}2 = 3+20+8+18=49$, strictly **better** than the greedy choice. The lower-weight key, by sitting at a position that keeps the *other* high-weight keys shallower overall, wins — greedy's "pick locally biggest weight" ignores exactly this global depth-interaction effect, which is precisely why the full $O(n^3)$ DP (trying every root, not just the heaviest) is necessary.`,
    pitfall:
      "The +W(i,j) term in the recurrence is easy to under-derive — it's not just W_r for the chosen root, but the weight of ALL keys in the subtree, because promoting any subtree under a new root increases every one of its keys' depths by exactly 1, and depth increases multiply through the cost function for every key, not just the root.",
    related: ["dynamic-programming-matrix-chain", "mit6046-dc-median-of-medians"],
  },
  {
    id: "mit6046-augdp-apsp-matrix-multiplication",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does reframing shortest-path relaxation as (min,+) matrix multiplication lead to an O(V³log V) all-pairs shortest paths algorithm via repeated squaring, and why can't Strassen-style speedups apply?",
    back: `**All-pairs shortest paths (APSP)**: running a single-source algorithm from every vertex gives $O(VE + V^2\\log V)$ via Dijkstra (non-negative weights) or $O(V^2E)$ via Bellman-Ford (general weights, dense-graph worst case $O(V^4)$) — this course develops purpose-built APSP algorithms instead.

**DP formulation**: let $d_{uv}^{(m)}$ = the weight of the shortest $u \\to v$ walk using **at most $m$ edges**. Recurrence (guessing the last edge $(x,v)$): $d_{uv}^{(m)} = \\min_{x \\in V}(d_{ux}^{(m-1)} + w(x,v))$, base case $d_{uv}^{(0)} = 0$ if $u=v$ else $\\infty$. Since (absent negative cycles) shortest paths are simple, $\\delta(u,v) = d_{uv}^{(n-1)} = d_{uv}^{(n)} = \\cdots$ — iterating $m$ up to $n-1$ suffices. Naive DP: $O(V^3)$ subproblems (all $u,v,m$ triples up to $n$), $O(V)$ work each $= O(V^4)$ — no better than $|V| \\times$ Bellman-Ford.

**The matrix-multiplication reframing**: define the **min-plus semiring**, replacing ordinary $(+,\\times)$ with $(\\min, +)$: $\\oplus = \\min$, $\\odot = +$. Under this redefinition, ordinary matrix multiplication $C = A \\odot B$ computes exactly $c_{ij} = \\min_k(a_{ik}+b_{kj})$ — precisely the relaxation recurrence's shape. Writing $D^{(m)} = (d_{uv}^{(m)})$ and $W = (w(i,j))$ as matrices, the recurrence becomes $D^{(m)} = D^{(m-1)} \\odot W$ — so $D^{(m)}$ is literally $W$ "min-plus-multiplied by itself" $m$ times.

**Repeated squaring**: rather than computing $D^{(1)}, D^{(2)}, \\ldots$ one step at a time ($O(V)$ min-plus multiplications, each $O(V^3)$ naively, for $O(V^4)$ total — no improvement), compute $D^{(2)} = W \\odot W$, $D^{(4)} = D^{(2)} \\odot D^{(2)}$, $D^{(8)} = D^{(4)} \\odot D^{(4)}$, etc. — doubling the path-length bound with each multiplication. Since path lengths only need to reach $n-1$, only $\\lceil\\log n\\rceil$ squarings are needed (each still $O(V^3)$ per min-plus multiplication, unimproved), giving $O(V^3\\log V)$ total — asymptotically better than $O(V^4)$.

**Why Strassen-style sub-cubic multiplication tricks don't carry over**: Strassen's algorithm (and its descendants) fundamentally exploit **algebraic cancellation** — additions and subtractions combining terms in clever ways that only work because ordinary $(+,\\times)$ supports subtraction (additive inverses). The $(\\min,+)$ semiring has **no subtraction** (there's no operation "undoing" a $\\min$) — so the identities Strassen's construction relies on simply don't hold, and min-plus matrix multiplication is stuck at (currently) essentially cubic time, with no known sub-cubic algorithm analogous to Strassen's for ordinary matrix multiplication.`,
    pitfall:
      "This O(V³ log V) bound, while an improvement over naive O(V⁴), is still asymptotically worse than Floyd-Warshall's O(V³) — the matrix-multiplication/repeated-squaring approach is presented as a conceptual bridge (motivating why APSP relates to matrix multiplication at all) rather than the fastest known dense-graph APSP algorithm.",
    related: ["shortest-paths-mst-floyd-warshall", "shortest-paths-mst-bellman-ford", "recursion-dc-strassen"],
  },
  {
    id: "mit6046-augdp-difference-constraints",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does Johnson's algorithm's reweighting technique double as a system-of-difference-constraints solver, and what does the negative-cycle-implies-unsolvable proof look like?",
    back: `Johnson's algorithm (already covered in the 6.006 track — see related card) reweights edges via a function $h$ satisfying $w_h(u,v) = w(u,v) + h(u) - h(v) \\geq 0$ for all edges, enabling Dijkstra from every vertex even with negative original weights. Rearranged, this condition is $h(v) - h(u) \\leq w(u,v)$ — a **system of difference constraints**: find values $h(v)$ for every vertex such that each edge $(u,v)$'s weight upper-bounds the *difference* $h(v)-h(u)$.

**Theorem**: if the underlying graph $(V,E,w)$ has a negative-weight cycle, the difference-constraint system has **no solution**. *Proof*: suppose cycle $v_0 \\to v_1 \\to \\cdots \\to v_k \\to v_0$ is negative-weight, and (for contradiction) some solution $h$ exists. The constraints along the cycle give $h(v_1)-h(v_0) \\leq w(v_0,v_1)$, $h(v_2)-h(v_1) \\leq w(v_1,v_2)$, …, $h(v_0)-h(v_k) \\leq w(v_k,v_0)$. **Summing all $k+1$ inequalities**: every $h(v_i)$ term appears exactly once positively and once negatively, so the left side telescopes to exactly 0, giving $0 \\leq w(\\text{cycle}) < 0$ — a direct contradiction (using that the cycle's total weight is, by assumption, negative). So no solution $h$ can exist whenever a negative cycle is present.

**Theorem (converse)**: if there's no negative-weight cycle, a solution *does* exist — constructively, $h(v) = \\delta(s,v)$ (shortest-path distance from a new source $s$ with zero-weight edges to every vertex) works, directly by the triangle inequality: $\\delta(s,u)+w(u,v) \\geq \\delta(s,v) \\iff \\delta(s,v)-\\delta(s,u) \\leq w(u,v) \\iff h(v)-h(u) \\leq w(u,v)$.

**Practical upshot**: Bellman-Ford, run once from an added zero-weight source vertex, solves **any** system of difference constraints (or correctly reports unsolvability) in $O(VE)$ time, treating variables as $V$ and constraints as $E$. Applications wherever constraints naturally take the form "one quantity minus another is bounded" — real-time/multimedia scheduling (bounding an event's duration via $LB \\leq t_{\\text{end}} - t_{\\text{start}} \\leq UB$, expressible as two difference constraints), or synchronizing two events to within tolerance $\\varepsilon$ via $|t_{\\text{start1}} - t_{\\text{start2}}| \\leq \\varepsilon$.`,
    pitfall:
      "The telescoping-sum proof crucially sums the inequalities in the SAME direction around the cycle (each h(v_i) canceling against its own appearance in the neighboring inequality) — summing them in a mismatched order or direction breaks the telescoping and doesn't produce the contradiction.",
    related: ["mit6006-graphs-johnsons-algorithm", "mit6006-graphs-reweighting-potential-function"],
  },
  {
    id: "mit6046-augdp-mst-formal-proofs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the two formal lemmas underlying MST algorithms — optimal substructure via edge contraction, and the cut/greedy-choice property — and sketch each proof.",
    back: `Prim's and Kruskal's algorithms (already covered — see related cards) are both justified by two structural lemmas, proved here more formally than the standard "cut and paste, it obviously works" intuition.

**Lemma 1 (optimal substructure via contraction)**: if edge $e=\\{u,v\\}$ belongs to *some* MST of $G$, and $T'$ is an MST of the **contracted graph** $G/e$ (merge $u,v$ into one vertex, keeping the cheaper of any resulting parallel edges), then $T' \\cup \\{e\\}$ is an MST of $G$. *Proof*: let $T^*$ be an MST of $G$ containing $e$. Then $T^*/e$ is a spanning tree of $G/e$, so (since $T'$ is *optimal* for $G/e$) $w(T') \\leq w(T^*/e)$. Then $w(T'\\cup\\{e\\}) = w(T') + w(e) \\leq w(T^*/e) + w(e) = w(T^*)$ — so $T'\\cup\\{e\\}$ costs no more than the known-optimal $T^*$, hence is itself optimal. This licenses a "guess an MST edge, contract it, recurse" DP structure — correct, but naively exponential (exponentially many edges to guess), motivating the greedy alternative below.

**Lemma 2 (greedy-choice / cut property)**: for **any** cut $(S, V\\setminus S)$ of $G$, the least-weight edge crossing that cut belongs to *some* MST. *Proof* (cut-and-paste): let $T$ be any MST; since $u \\in S, v \\notin S$ for the least-weight crossing edge $e=\\{u,v\\}$, and $T$ is a spanning tree, $T$'s unique $u\\to v$ path must cross the cut via some edge $e' = \\{u',v'\\}$ (possibly $e$ itself, in which case done). If $e' \\neq e$: form $T' = T \\setminus \\{e'\\} \\cup \\{e\\}$ — still a spanning tree (removing $e'$ splits $T$ into two pieces, both reconnected since $e$ also crosses the same cut), with $w(T') = w(T) - w(e') + w(e) \\leq w(T)$ (since $e$ is the cut's *minimum*-weight crossing edge, $w(e) \\leq w(e')$) — so $T'$ is at least as good, hence also an MST, and it contains $e$.

**Why this matters**: Lemma 2 is what makes MST a genuinely **greedy-solvable** problem (locally optimal choices — repeatedly taking a cut's cheapest crossing edge — combine into a globally optimal solution), in contrast to problems like weighted interval scheduling (related card) where no analogous cut-property exists and DP is required instead. Prim's algorithm applies Lemma 2 with the cut $(S, V\\setminus S)$ where $S$ is the partially-built tree so far; Kruskal's applies it implicitly via union-find, always taking the globally cheapest remaining edge that doesn't create a cycle (which is exactly the cheapest edge crossing the cut between its two endpoints' current components).`,
    pitfall:
      "Lemma 1 alone (optimal substructure) does not make a problem greedy-solvable — dynamic programming problems generally have optimal substructure too. It's specifically Lemma 2 (the cut property, a much stronger structural fact) that licenses the greedy algorithms; conflating the two lemmas' roles misses why MST is 'easier' than a typical DP problem.",
    related: ["shortest-paths-mst-mst-overview", "shortest-paths-mst-prim", "shortest-paths-mst-kruskal", "mit6046-dc-greedy-interval-scheduling"],
  },
];
