// MIT 6.046J / 18.410J (Spring 2015) — Lectures 1-4: course overview via
// interval scheduling (greedy vs. DP), the divide-and-conquer paradigm,
// convex hull, median-of-medians selection, the Fast Fourier Transform, and
// van Emde Boas trees. Where a topic already exists in Complexity Class
// (convex hull's problem statement, greedy/DP as paradigms), these cards
// cover 6.046's own algorithm/proof and cross-link via `related` rather than
// duplicating; van Emde Boas trees, median-of-medians, and FFT have no
// equivalent anywhere in the generic curriculum. See src/data/courses.ts for
// the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6046-dc";

export const mit6046DivideConquerCards: Card[] = [
  {
    id: "mit6046-dc-greedy-interval-scheduling",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "For interval scheduling (max-size compatible subset of requests), why does 'earliest finish time' work as a greedy rule when 'earliest start,' 'shortest interval,' and 'fewest conflicts' all fail?",
    back: `Given requests $1, \\ldots, n$ each with start time $s(i)$ and finish time $f(i)$, two requests are **compatible** if they don't overlap. **Goal**: select a maximum-size compatible subset. A **greedy algorithm** repeatedly picks a request by a fixed rule, rejects everything incompatible with it, and repeats.

Three plausible rules all fail on small counterexamples: **earliest start time** picks a long interval that blocks many short compatible ones; **shortest interval** can similarly block more total requests than it saves; **fewest incompatibilities** can also be beaten by a differently-shaped counterexample. The rule that actually works: **earliest finish time** — always pick whichever remaining compatible request finishes soonest.

**Correctness, in two parts.** *Claim 1*: the greedy algorithm's own output is a valid schedule, i.e. $f(i_1) \\leq s(i_2) \\leq \\cdots$ — immediate by contradiction, since any later overlap would mean the algorithm rejected a request it shouldn't have (Step 2 explicitly rejects everything incompatible with what's already picked). *Claim 2* (optimality, by induction on $k^*$, the optimal solution's size): base case $k^*=1$ is trivial. Inductive step: given an optimal schedule of size $k^*+1$, since greedy picks the *earliest possible* finish time first, $f(i_1) \\leq f(j_1)$ for the optimal solution's first interval $j_1$ — so swapping in $i_1$ for $j_1$ still yields a valid, equally-optimal schedule $S^{**}$. Removing $i_1$ (equivalently $j_1$) from consideration, the remaining problem restricted to requests starting after $f(i_1)$ has an optimal solution of size $k^*$ — and by the inductive hypothesis, running greedy on *that* restricted set produces a schedule of size $k^*$, so together with $i_1$, greedy's overall output has size $k^*+1$, matching optimal.

This exchange-argument-plus-induction pattern — show greedy's first choice can always be swapped into *some* optimal solution without loss, then induct on the remainder — is the general template most greedy-algorithm correctness proofs in this course follow.`,
    pitfall:
      "The proof doesn't show greedy's exact output equals some specific optimal solution — it shows greedy's output size matches the optimal size, via the swap-and-recurse argument. Conflating 'greedy produces an optimal schedule' with 'greedy produces the unique optimal schedule' overstates the claim; there can be multiple equally-optimal schedules.",
    related: ["mit6046-dc-weighted-interval-scheduling-dp"],
  },
  {
    id: "mit6046-dc-weighted-interval-scheduling-dp",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does adding weights to interval scheduling break the greedy algorithm, and what's the resulting DP recurrence?",
    back: `**Weighted interval scheduling**: each request $i$ now has weight $w(i)$; the goal shifts from maximum *count* to maximum *total weight* among compatible requests. The key observation: **the greedy algorithm no longer works** — earliest-finish-time can pick a low-weight interval that blocks a much higher-weight one, with no fixed greedy rule salvaging this in general (unlike the unweighted case, no exchange argument rescues an arbitrary greedy choice once weights are unequal).

**Dynamic programming instead**: define subproblems $R^x = \\{j \\in R \\mid s(j) \\geq x\\}$ — the set of requests starting no earlier than $x$. Setting $x = f(i)$, $R^{f(i)}$ is exactly the set of requests compatible with a schedule that has already placed $i$ and needs to fill in everything *after* it. There are only $n$ distinct subproblems (one per request's finish time), each solved once and memoized:
$$\\text{opt}(R) = \\max_{1 \\leq i \\leq n} \\left(w(i) + \\text{opt}(R^{f(i)})\\right)$$
Trying every request $i$ as the tentative *first* one taken (even though some other compatible request might have an earlier start), then recursively optimizing what remains after $i$ finishes, correctly explores every valid schedule exactly once. This gives $O(n^2)$ total time ($n$ subproblems, $O(n)$ work each) — improvable to $O(n \\log n)$ with more care (binary search for each $R^{f(i)}$), though the mechanics of that speedup aren't spelled out.

This is the course's very first illustration of a recurring theme: **greedy and dynamic programming solve the same-looking problem shape**, but greedy only survives when there's an exchange argument showing an arbitrary optimal solution can always be rearranged to agree with the greedy choice — weights are exactly the kind of complication that breaks that argument and forces the more general (and more expensive) DP approach.`,
    pitfall:
      "The subproblem set R^x is defined by *start* time, not finish time, even though the recurrence is indexed by trying each i's *finish* time f(i) — R^{f(i)} means 'everything that could come after i finishes,' not 'everything that finishes after i.'",
    related: ["mit6046-dc-greedy-interval-scheduling"],
  },
  {
    id: "mit6046-dc-paradigm",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the general divide-and-conquer recurrence template, and identify its three named steps.",
    back: `**Divide-and-conquer**: given a problem of size $n$, (1) **divide** it into $a$ subproblems of size $n/b$ (with $a \\geq 1$, $b > 1$); (2) **conquer** each subproblem recursively; (3) **combine** the subproblem solutions into an overall solution. The running time satisfies:
$$T(n) = a \\cdot T\\left(\\frac{n}{b}\\right) + [\\text{work for combine step}]$$
This single template organizes every algorithm in this module: **convex hull** and **median finding** ($a=2$ or more exotic subdivisions, combine steps of varying cost), the **FFT** ($a=2$, $b=2$, $O(n)$ combine, yielding $T(n) = O(n\\log n)$), and **van Emde Boas trees** (a recursive structure rather than a one-shot algorithm, but built from the identical recurrence-solving discipline). What varies between algorithms is entirely how expensive the *combine* step is, and how cleverly the *divide* step is chosen to make that combine step cheap — the recursive skeleton itself is always this same three-step shape.`,
    related: ["recursion-dc-paradigm", "recursion-dc-fundamentals"],
  },
  {
    id: "mit6046-dc-convex-hull-merge",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the divide-and-conquer convex hull algorithm merge two hulls in linear time using tangent lines, and why does this beat the brute-force approach?",
    back: `Given $n$ points, brute force tests every candidate edge (all $O(n^2)$ point pairs) to see if all remaining points lie on one side — $O(n^3)$ total. Divide-and-conquer instead: sort points by $x$-coordinate once ($O(n\\log n)$), split into left half $A$ and right half $B$, recursively compute $CH(A)$ and $CH(B)$ (each hull stored as a clockwise doubly-linked list of boundary points), then **merge** the two hulls.

**Merging** needs exactly two new edges: the **upper tangent** $(a_i, b_j)$ and **lower tangent** $(a_k, b_m)$ — the two segments connecting $A$'s hull to $B$'s hull such that all other points lie *below* the upper tangent line and *above* the lower tangent line respectively. Once both tangents are found, the merge itself is $\\Theta(n)$: link $a_i \\to b_j$, walk along $B$'s list until reaching $b_m$, link $b_m \\to a_k$, then continue along $A$'s list back to $a_i$ — a straightforward "cut and paste" of the two boundary lists.

**Finding the upper tangent efficiently**: let $L$ be the vertical line separating $A$ and $B$, and $y(i,j)$ the $y$-coordinate where segment $(a_i, b_j)$ crosses $L$. The upper tangent is exactly the pair $(a_i, b_j)$ that **maximizes** $y(i,j)$ (any non-maximal candidate has points on both sides, disqualifying it as a tangent). Rather than checking all $O(n^2)$ pairs, a two-pointer sweep starting from $A$'s rightmost point and $B$'s leftmost point — advancing whichever pointer currently increases $y(i,j)$ — finds the maximizing pair in $\\Theta(n)$ (the lower tangent is symmetric). This gives the overall recurrence $T(n) = 2T(n/2) + \\Theta(n) = \\Theta(n\\log n)$ — a direct instance of the D&C paradigm (related card), with the tangent-finding trick supplying the linear-time combine step that makes the recurrence favorable.`,
    pitfall:
      "A tangent pair (a_i, b_j) maximizing y(i,j) does not mean a_i or b_j is the highest point of its own hull — tangency is about the line's crossing height relative to L, a global property of the pair, not a local property of either endpoint alone.",
    related: ["computational-geometry-convex-hull-problem", "computational-geometry-hull-comparison", "mit6046-dc-paradigm"],
  },
  {
    id: "mit6046-dc-median-of-medians",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the median-of-medians SELECT algorithm guarantee linear worst-case time by picking a pivot 'cleverly,' and how is the T(n) ≤ cn bound actually proven?",
    back: `**Goal**: find the element of rank $i$ (e.g. the median) in an unsorted set of $n$ numbers, faster than sorting ($\\Theta(n\\log n)$). The SELECT recursive template — pick a pivot $x$, partition into $B = \\{y < x\\}$ and $C = \\{y > x\\}$, recurse into whichever side contains rank $i$ — only runs in linear time if $x$'s rank is never *extreme* (close to 1 or $n$); a naive pivot choice (e.g. always the first element) degrades to $\\Theta(n^2)$ on adversarial input, exactly like naive quicksort.

**Picking $x$ cleverly — the median of medians**: arrange the $n$ elements into $\\lceil n/5\\rceil$ columns of 5, sort each column ($O(1)$ time per column, $O(n)$ total), and let $x$ be the **median of the column medians** (found recursively). This guarantees a *provable* balance: at least half the columns (minus a small constant-size correction for the partial last column and $x$'s own column) contribute at least 3 elements each that are $\\geq x$ — giving at least $3(\\lceil n/10\\rceil - 2)$ elements guaranteed greater than $x$, and symmetrically at least that many less than $x$. Neither side can therefore be more than roughly $\\frac{7}{10}n$ of the total, however adversarial the input.

**Recurrence**: $T(n) = T(\\lceil n/5\\rceil) + T(7n/10 + 6) + \\Theta(n)$ for $n > 140$ — the first term recursively finds the median of medians, the second recurses into the larger partitioned side, and $\\Theta(n)$ covers the column-sorting and partitioning work. The **Master theorem doesn't apply** here (the subproblem sizes don't sum to a clean fraction pattern it covers), so the bound is proven directly: guess $T(n) \\leq cn$ and verify by induction. Substituting the guess into the recurrence and simplifying yields $T(n) \\leq cn + \\left(-\\frac{cn}{10} + 7c + an\\right)$ (where $an$ is the linear work's constant) — which stays $\\leq cn$ exactly when $c \\geq \\frac{70c}{n} + 10a$, true for $c \\geq 20a$ once $n \\geq 140$. Since $\\frac{n}{5} + \\frac{7n}{10} < n$, both recursive calls are on strictly smaller instances, so this induction is well-founded and $T(n) = O(n)$.`,
    pitfall:
      "The Master theorem's standard case analysis doesn't apply to this recurrence because it has two *differently-sized* recursive subproblems (n/5 and 7n/10, not two equal-size branches) — the guess-and-verify induction technique is the general fallback for recurrences the Master theorem can't handle directly.",
    related: ["mit6046-dc-paradigm", "searching-binary-search"],
  },
  {
    id: "mit6046-dc-polynomial-representations",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare the three representations of a degree-(n-1) polynomial (coefficients, roots, samples) by the time each supports evaluation, addition, and multiplication.",
    back: `A polynomial $A(x) = a_0 + a_1x + \\cdots + a_{n-1}x^{n-1}$ can be represented three ways, each with a different cost profile for the three core operations (evaluation at a point, addition of two polynomials, multiplication of two polynomials):

| | Coefficients | Roots | Samples |
|---|---|---|---|
| Evaluation | $O(n)$ | $O(n)$ | $O(n^2)$ |
| Addition | $O(n)$ | $\\infty$ | $O(n)$ |
| Multiplication | $O(n^2)$ | $O(n)$ | $O(n)$ |

**Coefficients** $\\langle a_0, \\ldots, a_{n-1}\\rangle$: evaluation via **Horner's rule** ($A(x) = a_0 + x(a_1 + x(a_2 + \\cdots))$, $O(n)$ multiplications and additions); addition is termwise, $O(n)$; multiplication is $O(n^2)$ naively (a full convolution). **Roots** $A(x) = c\\prod(x - r_i)$: evaluation is still $O(n)$ (plug in and multiply out); multiplication is cheap, $O(n)$ (just concatenate root lists and multiply the scale terms); but **addition is effectively impossible** — there's no way to combine two root lists into the root list of the sum without re-factoring from scratch, and exact roots generally aren't even expressible via radicals for degree $\\geq 5$ (Abel–Ruffini). **Samples** $(x_0,y_0), \\ldots, (x_{n-1},y_{n-1})$ with $A(x_i)=y_i$ (uniquely determining $A$, by Lagrange interpolation / the Fundamental Theorem of Algebra): addition and multiplication are both $O(n)$ (just combine matching $y_i$'s), but evaluation at a *new* point requires full interpolation, $O(n^2)$.

No single representation is fastest at everything — **samples are cheapest for both addition and multiplication**, which is exactly the leverage the FFT exploits (related card): convert coefficients $\\to$ samples, multiply cheaply in sample form, convert back — provided the coefficient$\\leftrightarrow$sample conversion itself can be made fast.`,
    related: ["mit6046-dc-fft-collapsing-sets"],
  },
  {
    id: "mit6046-dc-fft-collapsing-sets",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does naive divide-and-conquer polynomial evaluation still cost Θ(n²), and what property of the roots of unity fixes this to Θ(n log n)?",
    back: `Split polynomial $A(x)$ into its even- and odd-indexed coefficients: $A_{even}(y) = \\sum a_{2k}y^k$, $A_{odd}(y) = \\sum a_{2k+1}y^k$, so that $A(x) = A_{even}(x^2) + x \\cdot A_{odd}(x^2)$. Evaluating $A$ at a set of points $X$ recursively evaluates $A_{even}$ and $A_{odd}$ at $X^2 = \\{x^2 \\mid x \\in X\\}$ — but naively, $|X^2|$ is just as large as $|X|$ (squaring $n$ distinct values generally gives $n$ distinct results), so the recurrence is $T(n, |X|) = 2T(n/2, |X|) + O(n + |X|) = O(n^2)$ — no better than direct evaluation.

**The fix — collapsing sets**: choose $X$ so that squaring **shrinks** it by half at every level: $|X^2| = |X|/2$, with $X^2$ itself recursively collapsing the same way. Then the recurrence becomes $T(n) = 2T(n/2) + O(n) = O(n\\log n)$ — a direct instance of the D&C paradigm (related card) with a genuinely favorable divide step.

**The $n$-th roots of unity are exactly such a collapsing set.** Build them by repeated square-rooting: $\\{1\\} \\to \\{1,-1\\} \\to \\{1,-1,i,-i\\} \\to \\cdots$ — each set is the square roots of the previous one, uniformly spaced around the unit circle in the complex plane (formally, $x$ such that $x^n=1$, i.e. $e^{i\\theta}$ for $\\theta = \\frac{2\\pi k}{n}$). For $n = 2^\\ell$, squaring an $n$-th root of unity ($e^{i\\theta}$ squared is $e^{i(2\\theta \\bmod 2\\pi)}$) lands exactly on an $(n/2)$-th root of unity, and every $(n/2)$-th root is hit exactly twice — so the $n$-th roots of unity square down to precisely the $(n/2)$-th roots of unity, a perfectly collapsing set by construction.`,
    pitfall:
      "The naive even/odd split by itself buys nothing — the O(n log n) speedup comes entirely from the specific choice of evaluation points (roots of unity), which is what makes X² exactly half the size of X at every recursive level. Splitting coefficients without also choosing collapsing evaluation points leaves you at Θ(n²).",
    related: ["mit6046-dc-polynomial-representations", "mit6046-dc-fft-algorithm"],
  },
  {
    id: "mit6046-dc-fft-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the FFT/IFFT pipeline multiply two polynomials in O(n log n), and what's the key structural fact that makes the inverse transform just as fast as the forward one?",
    back: `The **Discrete Fourier Transform (DFT)** converts a coefficient vector $A$ to its **samples** at the $n$-th roots of unity: $A^* = V \\cdot A$, where $V$ is the **Vandermonde matrix** with entries $v_{jk} = x_j^k$ for $x_k = e^{ik\\tau/n}$ ($\\tau = 2\\pi$). Computed directly, this matrix-vector product costs $O(n^2)$ — the **FFT** is a $D\\&C$ algorithm (exploiting the roots-of-unity collapsing-set structure, related card) computing exactly this in $O(n\\log n)$.

**Fast polynomial multiplication**, combining the best of each representation (related card): (1) $A^* = \\text{FFT}(A)$, $B^* = \\text{FFT}(B)$ — convert both polynomials to sample form, $O(n\\log n)$ each; (2) $C^*_k = A^*_k \\cdot B^*_k$ for each $k$ — multiply pointwise in sample form, $O(n)$; (3) $C = \\text{IFFT}(C^*)$ — convert the product's samples back to coefficient form, $O(n\\log n)$. Total: $O(n\\log n)$, versus $O(n^2)$ for naive coefficient-form multiplication.

**Why the inverse is essentially free once you have the forward transform**: $\\textbf{Claim}$: $V^{-1} = \\frac{1}{n}\\bar V$ (the complex conjugate of $V$, scaled by $\\frac{1}{n}$). *Proof*: compute $P = V \\cdot \\bar V$ entrywise: $p_{jk} = \\sum_{m=0}^{n-1} e^{ij\\tau m/n}e^{-ik\\tau m/n} = \\sum_m e^{i(j-k)\\tau m/n}$. If $j=k$, every term is 1, so $p_{jk}=n$. If $j \\neq k$, this is a geometric series summing to $\\frac{(e^{i\\tau(j-k)/n})^n - 1}{e^{i\\tau(j-k)/n}-1} = 0$ (since $e^{i\\tau}=1$ makes the numerator vanish). So $V\\bar V = nI$, giving $V^{-1} = \\frac{1}{n}\\bar V$ directly. This means the **IDFT is the DFT itself**, just with each evaluation point $x_k$ replaced by its complex conjugate $\\bar x_k = e^{-ik\\tau/n}$ and the result scaled by $\\frac{1}{n}$ — so the *same* FFT algorithm, with this trivial adjustment, computes the inverse transform in the identical $O(n\\log n)$ time, with no separate algorithm needed.

**Applications**: the transformed samples $A^*$ have a physical "frequency domain" interpretation — $|a_k^*|$ is the amplitude and $\\arg(a_k^*)$ the phase of the frequency-$k$ component — the basis for audio processing (high/low-pass filters, pitch shifting, MP3 compression) and signal processing generally, beyond the pure polynomial-multiplication use case.`,
    code: `# Conceptual pipeline (not an FFT implementation, just the 3-step structure)
def multiply_polynomials(A_coeffs, B_coeffs):
    A_star = FFT(A_coeffs)             # O(n log n)
    B_star = FFT(B_coeffs)             # O(n log n)
    C_star = [a * b for a, b in zip(A_star, B_star)]  # O(n), pointwise
    return IFFT(C_star)                # O(n log n) — same algorithm as FFT`,
    pitfall:
      "n must be a power of 2 (n = 2^ℓ) for the roots-of-unity collapsing-set structure to apply directly — polynomials of other degrees need padding with zero coefficients up to the next power of 2 before the FFT recursion works.",
    related: ["mit6046-dc-fft-collapsing-sets", "mit6046-dc-polynomial-representations"],
  },
  {
    id: "mit6046-dc-veb-clustering",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What's the incremental path from a plain bit vector to a Θ(√u)-per-operation clustered structure for maintaining a set with fast Insert/Successor, and why split into √u clusters specifically?",
    back: `**Goal**: maintain $n$ elements from the universe $\\{0, \\ldots, u-1\\}$ supporting Insert, Delete, Successor — ultimately in $O(\\log\\log u)$ time (exponentially faster than a balanced BST's $O(\\log n)$; used e.g. for network routing tables, where $u$ = the IP address space, $2^{32}$ for IPv4).

**Step 1 — bit vector**: $V[x] = 1$ iff $x$ is in the set. Insert/Delete are $O(1)$ (flip a bit), but **Successor is $O(u)$** (linear scan for the next 1-bit) — fast writes, slow reads.

**Step 2 — split into clusters**: divide $\\{0,\\ldots,u-1\\}$ into $\\sqrt{u}$ clusters of size $\\sqrt{u}$ each. For $x$, define $\\text{high}(x) = \\lfloor x/\\sqrt{u}\\rfloor$ (which cluster) and $\\text{low}(x) = x \\bmod \\sqrt{u}$ (position within that cluster), so $V[x] = V.\\text{cluster}[\\text{high}(x)][\\text{low}(x)]$. Insert stays $O(1)$ (set the bit, mark the cluster non-empty). **Successor** improves to $O(\\sqrt{u})$: check the rest of the current cluster ($O(\\sqrt{u})$ elements), else scan cluster indices for the next non-empty one ($O(\\sqrt{u})$ clusters), then find that cluster's minimum ($O(\\sqrt{u})$) — three $O(\\sqrt{u})$ steps.

**Step 3 — recurse**: since each of those three $O(\\sqrt{u})$-time subroutines is *itself* a Successor-style operation on a structure of size $\\sqrt{u}$, replace each cluster (and a new $V.\\text{summary}$ array tracking which clusters are non-empty) with a **recursively defined, smaller van Emde Boas structure** of the same kind. This is why the split is specifically $\\sqrt{u}$ (not, say, $u/2$ or $u/\\log u$): recursing on $\\sqrt{u}$-sized substructures makes the *recursion depth itself* logarithmic in $\\log u$ (since $\\sqrt{\\sqrt{\\cdots \\sqrt{u}}}$ reaches 1 after $O(\\log\\log u)$ halvings of $\\log u$), which is exactly the mechanism the later refinements (related card) exploit to reach the final $O(\\log\\log u)$ bound.`,
    related: ["mit6046-dc-veb-recursive-refinement", "mit6046-dc-paradigm"],
  },
  {
    id: "mit6046-dc-veb-recursive-refinement",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Trace the recurrence-solving refinements that take van Emde Boas from Θ(√u) down to the target Θ(log log u), including the 'first call vs. second call' amortization trick.",
    back: `Recursing naively (each cluster and the summary are themselves van Emde Boas structures of size $\\sqrt{u}$) gives $\\text{Insert}$ the recurrence $T(u) = 2T(\\sqrt{u}) + O(1)$ (recurse into both the target cluster *and* the summary). Substituting $u = 2^{2^k}$ (so $\\log u$ halves cleanly under square-rooting) transforms this into $T'(\\log u) = 2T'(\\frac{\\log u}{2}) + O(1)$, solving to $T(u) = O(\\log u)$ — better than $\\Theta(\\sqrt u)$, but not yet the target.

**Successor recurses into three places** (current cluster, summary, target cluster again) — naively $T(u) = 3T(\\sqrt{u}) + O(1)$, which by the same substitution solves to $T(u) = O((\\log u)^{\\log_2 3}) \\approx O((\\log u)^{1.585})$ — worse than Insert's bound, since 3 recursive branches (not 2) accumulate faster. **Reducing to $O(\\log\\log u)$ requires cutting this down to a single effective recursive call.**

**The trick — maintain min and max explicitly** in every structure (not just recursively derivable): this lets Successor short-circuit — if the target lies below the current cluster's stored max, only **one** recursive call into that cluster is needed (skip the summary lookup entirely); only if it doesn't, fall back to a summary lookup plus a direct min-lookup (not a full recursive Successor) in the resulting cluster. This drops the recurrence to $T(u) = T(\\sqrt{u}) + O(1)$, giving the target $T(u) = O(\\log\\log u)$.

**But storing min recursively breaks the bound for Insert**: if every structure's min is *itself* stored inside a recursive sub-structure, inserting a new minimum requires recursively re-inserting the old min *somewhere else* — reintroducing the expensive branching. The fix: store each structure's min/max as **plain, non-recursive fields**, checked directly ("if $x < V.\\text{min}$: return $V.\\text{min}$" as an $O(1)$ first step of Successor) — and rely on a subtler but crucial accounting fact for Insert: **when the "first call" (into the summary, marking a previously-empty cluster non-empty) executes, the "second call" (into that now-freshly-created cluster) is itself only $O(1)$**, because inserting into a structure whose min was just undefined can bypass the general recursive logic and set min/max directly. So *at most one* of the two calls is ever genuinely recursive on any given Insert — giving $T(u) = T(\\sqrt{u}) + O(1)$ for Insert too, matching Successor's bound.`,
    code: `def successor(V, x):
    i = high(x)
    if low(x) < V.cluster[i].max:
        j = successor(V.cluster[i], low(x))   # one recursive call
    else:
        i = successor(V.summary, high(x))     # find next nonempty cluster
        j = V.cluster[i].min                  # O(1), not recursive
    return index(i, j)`,
    pitfall:
      "The 'first call is O(1), so second call must be recursive' and 'second call is O(1), so first call must be recursive' cases are exact complements of each other by construction — it's the guarantee that *at most one* of the two Insert calls is ever genuinely recursive (never both) that collapses the T(u) = 2T(√u) recurrence down to T(u) = T(√u), not a claim that recursion is avoided altogether.",
    related: ["mit6046-dc-veb-clustering", "mit6046-dc-veb-space"],
  },
  {
    id: "mit6046-dc-veb-space",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does van Emde Boas reduce its space usage from Θ(u) down to Θ(n), given that the structure's time bounds don't depend on n at all?",
    back: `The recursive structure as described allocates space proportional to the **universe size** $u$ (every possible cluster gets a sub-structure, whether or not it's ever used) — $\\Theta(u)$ total, wildly wasteful when the actual number of stored elements $n \\ll u$ (e.g. storing a few thousand IP addresses out of a $2^{32}$-size universe).

**First improvement — lazy allocation, $O(n\\log\\log u)$**: only create a cluster's sub-structure when it actually becomes non-empty (deallocating it if it becomes empty again — tracked via $V.\\text{min} = \\text{None}$), storing $V.\\text{cluster}$ as a **hash table** of just the non-empty clusters rather than a fixed-size array. Since each Insert can trigger creating a new (empty) structure at most $O(\\log\\log u)$ times along its recursive path (one potential creation per level of recursion, and the recursion depth itself is $O(\\log\\log u)$), this bounds total space at $O(n\\log\\log u)$ — though now **randomized**, since it relies on hash table performance.

**Second improvement — indirection, down to $O(n)$**: once a recursive sub-structure's universe size $u'$ shrinks to $O(\\log\\log u)$, switch its implementation to an ordinary BST (or even a flat array) instead of continuing the van Emde Boas recursion — a base case costing only $O(\\log\\log u)$ time to operate on directly, matching the target time bound without further recursive overhead. Using $O(n/\\log\\log u)$ such small, disjoint base-case structures accounts for $O(\\frac{n}{\\log\\log u} \\cdot \\log\\log u) = O(n)$ space at the small end; larger structures above them only need to **store pointers** to these small structures rather than duplicating their contents, contributing another $O(\\frac{n}{\\log\\log u}\\cdot\\log\\log u) = O(n)$ — with the remaining engineering detail (not covered in depth) being how to correctly split and merge these small base-case structures as elements are inserted and deleted across their boundaries.

This progression — start with the asymptotically-correct-but-space-wasteful recursive structure, then trade a small, carefully-bounded amount of extra machinery (hashing, then indirection to base cases) to bring space down to the information-theoretic minimum $O(n)$ — is a recurring pattern for turning a "clean but wasteful" recursive data structure into a practically efficient one.`,
    pitfall:
      "The Patrascu-Thorup 2007 lower bound (Ω(log log u) per query, even for static structures with no inserts/deletes, using O(n·poly(log n)) space) confirms O(log log u) is asymptotically optimal for this problem — the space-improvement techniques here reduce memory without giving up any of that time bound, they aren't a tradeoff sacrificing speed for space.",
    related: ["mit6046-dc-veb-recursive-refinement"],
  },
];
