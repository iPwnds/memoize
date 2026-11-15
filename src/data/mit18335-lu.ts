// MIT 18.335J Introduction to Numerical Methods (Spring 2019, Steven G.
// Johnson) — Lectures 11-14 (dense direct solvers): caches and blocking,
// cache-oblivious matrix multiplication, LU factorization with partial
// pivoting and its stability, Cholesky and other structured solvers.
// Sourced from the per-lecture OCW summaries and the course handouts
// "Performance Experiments with Matrix Multiplication" (Lec 11),
// "Ideal-Cache Terminology" (Lec 11) and "Experiments with Cache-Oblivious
// Matrix Multiplication" (Lec 12). The Householder-QR part of Lec 11 is in
// src/data/mit18335-qr.ts; the eigenproblem part of Lec 14 (Schur
// factorization) is in src/data/mit18335-eig.ts.
//
// Lectures 13 and 14 have no handout: only their summaries (which defer to
// Trefethen & Bau lectures 20-23, not hosted on OCW). Everything on the LU
// and Cholesky cards beyond the summaries' statements is therefore an
// addition, recomputed where numeric:
// - the 2m³/3 and m³/3 flop counts and the Cholesky recurrence;
// - the 2×2 tiny-pivot example (ε = 10⁻²⁰: no pivoting returns x = (0, 1)
//   instead of ≈ (1, 1); rerun in double precision);
// - the growth-factor matrix (1 on the diagonal, −1 below, 1 in the last
//   column), whose U has last column 1, 2, 4, …, 2ᵐ⁻¹ — the summary only
//   "mentioned an example where U grows exponentially"; checked with
//   scipy for m = 6, where partial pivoting performs no swaps;
// - the backward-error statement L̃Ũ = PA + δA, ‖δA‖/‖A‖ = O(ρ ε(machine));
// - the ≈ 2m³ cost of an explicit inverse, the O(mw²) banded cost, the
//   |r_kj| ≤ √a_jj no-growth argument for Cholesky, and Cholesky breakdown
//   as a definiteness test.
// Also added: the Θ(n³) / Θ(n³/√Z) cache-miss derivations (the Lec 11
// summary states the results) and the cache-oblivious recurrence.
import type { Card } from "./types";

const MODULE = "mit18335-lu";

export const mit18335LuCards: Card[] = [
  // --- Lecture 11: Matrix operations, caches, and blocking ---
  {
    id: "mit18335-lu-flops-are-not-enough",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why can two matrix-multiplication codes with the same flop count differ 10× in speed? Describe the ideal-cache model used to analyze this.",
    back: `**The experiment** (Lec 11 handout): the textbook triple loop $C_{ij} = \\sum_k A_{ik}B_{kj}$ does $2mnp$ flops. Timed on square matrices, its flop rate is **not constant**: it drops sharply each time the matrices outgrow a level of cache (L1, then L2), and stays below 1 gigaflop on a 2.66 GHz CPU. An optimized BLAS (ATLAS) doing the **same operations** runs near peak, about **10× faster**. (Ten lines of C versus 130,000+ in ATLAS.)

**Lesson:** you cannot understand performance without memory efficiency, which is about ten times more important than arithmetic count on modern machines.

**Memory hierarchy:** registers → L1 → L2 → main memory, each larger and slower.

**Ideal-cache model** (two levels, for analysis):
- a cache of $Z$ items between CPU and main memory. A **hit** (item in cache) is fast; a **miss** loads the item, evicting another;
- **optimal replacement**: evict the item needed furthest in the future (LRU is provably within a constant factor, but harder to analyze);
- **fully associative**: any item can go anywhere (real caches have limited associativity, so "unlucky" access patterns effectively shrink the cache);
- **temporal locality**: reusing an item soon after it was loaded, while it's still cached;
- **cache complexity** $Q(n; Z)$: the number of misses for problem size $n$, usually given asymptotically.`,
    related: ["mit18335-lu-blocked-matrix-multiply", "mit6046-final-cache-models", "mit6004-arch-cache-replacement-strategies"],
  },
  {
    id: "mit18335-lu-blocked-matrix-multiply",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "Derive the cache complexity of the row-column triple-loop n×n matrix multiply and of the blocked version. What are the practical drawbacks of blocking?",
    back: `**Row–column triple loop**, for $n^2 \\gg Z$: computing $C_{ij}$ walks a row of $A$ and a **column of $B$**. Between two uses of the same column of $B$ (the next $i$), all $n^2$ entries of $B$ are touched, more than fit in cache, so every entry of $B$ is re-fetched every time:
$$Q(n; Z) = \\Theta(n^3).$$
That's the same order as the number of flops: the cache gives **asymptotically no benefit**.

**Blocked algorithm:** split each matrix into $b\\times b$ blocks with $3b^2 \\leq Z$, so one block each of $A$, $B$ and $C$ fit in cache together, and loop over blocks: $C_{IJ} \\mathrel{+}= A_{IK}B_{KJ}$. Each of the $(n/b)^3$ block multiplies loads $O(b^2)$ items and then does $2b^3$ flops entirely in cache:
$$Q(n; Z) = \\Theta\\!\\left(\\frac{n^3}{b^3}\\cdot b^2\\right) = \\Theta\\!\\left(\\frac{n^3}{b}\\right) = \\Theta\\!\\left(\\frac{n^3}{\\sqrt Z}\\right),$$
which is **optimal** for any algorithm doing the standard $\\Theta(n^3)$ operations.

**Practical drawbacks:** the algorithm depends on $Z$ (it must be tuned per machine), and a multi-level hierarchy needs **multi-level blocking** (blocks of blocks). **LAPACK** is built on this idea: its factorizations are written in terms of block operations performed by an optimized **BLAS** (level-3 BLAS = matrix–matrix operations, the ones with $O(n^3)$ work on $O(n^2)$ data, so reuse is possible).`,
    complexity: {
      structure: "n×n matrix multiply (ideal cache of size Z)",
      operations: [
        { op: "Triple loop (row × column)", time: "Θ(n³) flops", note: "Θ(n³) cache misses when n² ≫ Z" },
        { op: "Blocked, 3b² ≤ Z", time: "Θ(n³) flops", note: "Θ(n³/√Z) misses (optimal)" },
        { op: "Cache-oblivious recursive", time: "Θ(n³) flops", note: "Θ(n³/√Z) misses without knowing Z" },
      ],
      caveat: "All three do the same arithmetic; only the memory traffic differs.",
    },
    related: ["mit18335-lu-flops-are-not-enough", "mit18335-lu-cache-oblivious-matmul", "mit6046-final-cache-blocked-matrix-multiply"],
  },

  // --- Lecture 12: Cache-oblivious algorithms and spatial locality ---
  {
    id: "mit18335-lu-cache-oblivious-matmul",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does recursive divide-and-conquer matrix multiplication achieve optimal Θ(n³/√Z) cache misses without knowing Z, and why must its base case be about 16×16 rather than 1×1?",
    back: `**Algorithm:** to compute $C \\mathrel{+}= AB$, split $C$ into 4 blocks (and $A$, $B$ correspondingly) and do the 8 half-size block products recursively: $C_{11} \\mathrel{+}= A_{11}B_{11}$, $C_{11} \\mathrel{+}= A_{12}B_{21}$, and so on. For very non-square matrices, split along the longest dimension instead.

**Why it's optimal for every cache at once.** The recursion eventually reaches subproblems of size $s$ with $3s^2 \\leq Z$, whatever $Z$ is. Those fit in cache and cost $O(s^2)$ misses each. With $Q(n) = 8Q(n/2)$ above that size,
$$Q(n; Z) = \\Theta\\!\\left(\\left(\\frac ns\\right)^3 s^2\\right) = \\Theta\\!\\left(\\frac{n^3}{\\sqrt Z}\\right).$$
The algorithm never mentions $Z$ (it's "**cache-oblivious**"), so it is simultaneously optimal for L1, L2, and main memory. In the experiments, the cache-related performance drops of the triple loop disappear.

**Base case:** recursing down to $1\\times1$ means one function call per element and no reuse of **registers**. The handout's C code stops at $m + n + p \\leq 48$ (about $16\\times16$) and runs a simple loop there.

**But that's still far from ATLAS.** The registers (~100) form a tiny, almost ideal cache of their own, and three nested loops use them badly too. Fast kernels need long blocks of **unrolled, loop-free code** that load a block into local variables, multiply, and write back. Since there are $(n^3)!$ orderings of an unrolled $n\\times n$ multiply, the optimal schedule is found by automated experimentation (ATLAS) or by cache-oblivious scheduling (as in FFTW).`,
    code: `def matmul_add_rec(A, B, C):
    """C += A @ B, recursively (numpy views, so no copies)."""
    m, n = A.shape; p = B.shape[1]
    if m + n + p <= 48:                       # ~16x16 base case
        C += A @ B                            # a simple loop in the C version
        return
    m2, n2, p2 = m // 2, n // 2, p // 2
    for (i0, i1) in ((0, m2), (m2, m)):
        for (k0, k1) in ((0, p2), (p2, p)):
            for (j0, j1) in ((0, n2), (n2, n)):
                matmul_add_rec(A[i0:i1, j0:j1], B[j0:j1, k0:k1], C[i0:i1, k0:k1])`,
    related: ["mit18335-lu-blocked-matrix-multiply", "mit18335-lu-spatial-locality", "systems-adjacent-cache-oblivious", "mit6046-final-cache-blocked-matrix-multiply"],
  },
  {
    id: "mit18335-lu-spatial-locality",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is spatial locality, how do cache lines exploit it, and why does the loop order matter for a row-major matrix even in a level-1 BLAS operation like a matrix addition?",
    back: `**Spatial locality:** items close together in memory are used close together in time. Caches exploit it with **cache lines**: a miss loads a whole contiguous line (e.g. 64 bytes = 8 doubles), so the next few accesses to neighbouring addresses are hits.

**Level-1 BLAS** operations (dot products, vector/matrix additions) do $O(1)$ flops per item and use each item **once**. They have **no temporal locality** at all, so the best possible is one miss per cache line: $\\Theta(N/L)$ misses for $N$ items and line length $L$.

**Loop order decides whether you get that.** In **row-major** storage (C, numpy default), $A_{ij}$ and $A_{i,j+1}$ are adjacent. For $C = A + B$:
- loop $j$ innermost: walk along rows, use every item of each loaded line, $\\Theta(n^2/L)$ misses;
- loop $i$ innermost: jump by a whole row each step, so each access touches a different line and (for large $n$) every access misses, $\\Theta(n^2)$ misses: up to $L\\times$ slower for identical arithmetic.

**Column-major** languages (Fortran, MATLAB, Julia) reverse the rule: the first index should vary fastest. The same reasoning is why the triple-loop matrix multiply walks a *column* of row-major $B$ badly. (This is what Problem Set 3 explores experimentally.)`,
    pitfall:
      "Porting a loop nest between Julia/Fortran/MATLAB (column-major) and C/numpy (row-major) without swapping the loop order silently costs a large constant factor — the results are identical, only the speed changes.",
    related: ["mit18335-lu-cache-oblivious-matmul", "mit18335-lu-flops-are-not-enough", "mit6004-arch-cache-block-size"],
  },

  // --- Lecture 13: LU factorization and partial pivoting ---
  {
    id: "mit18335-lu-lu-factorization-solve",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "How does Gaussian elimination give A = LU, how is Ax = b then solved, what does it cost, and why should you almost never compute A⁻¹?",
    back: `**Elimination is a factorization.** Zeroing column $k$ below the pivot subtracts $\\ell_{ik} = a_{ik}/a_{kk}$ times row $k$ from row $i$. Those multipliers, put below the diagonal of a unit lower-triangular $L$, undo the elimination, and the result is the upper-triangular $U$:
$$A = LU.$$

**Solving $Ax = b$:** $LUx = b$ splits into
1. $Ly = b$ by **forward substitution** (this does to $b$ exactly what elimination did to $A$);
2. $Ux = y$ by **back substitution**.

**Costs** (leading order):

| Step | Flops |
|---|---|
| Factor $A = LU$ | $\\frac23m^3$ |
| Each triangular solve | $m^2$ |
| Each extra right-hand side | $2m^2$, the same as a matrix–vector multiply |

**Don't compute $A^{-1}$.** Keeping $L$ and $U$ costs nothing extra, and applying them to a new $b$ costs the same as multiplying by $A^{-1}$ would. Computing $A^{-1}$ costs more ($\\approx 2m^3$), and it's *less accurate*. Anything you can do with $A^{-1}$ you can do with $L$ and $U$. $A^{-1}$ is for abstract manipulations: whenever you see $x = A^{-1}b$, read it computationally as "solve $Ax = b$ by LU (or another factorization)".`,
    complexity: {
      structure: "Dense LU solver (m×m)",
      operations: [
        { op: "Factor (PA = LU)", time: "2m³/3 flops" },
        { op: "Solve with L and U, per right-hand side", time: "2m² flops" },
        { op: "Explicit inverse (avoid)", time: "≈ 2m³ flops", note: "and less accurate" },
      ],
    },
    related: ["mit18335-lu-partial-pivoting", "mit18335-lu-cholesky", "mit1806-elimination-a-equals-lu", "mit1806-elimination-elimination-cost"],
  },
  {
    id: "mit18335-lu-partial-pivoting",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Solve [[ε, 1], [1, 1]]x = (1, 2) with ε = 10⁻²⁰ by elimination without pivoting, then with partial pivoting. What is PA = LU?",
    back: `The exact solution is $x \\approx (1, 1)$ (precisely $x_1 = \\frac{1}{1 - \\epsilon}$, $x_2 = \\frac{1 - 2\\epsilon}{1 - \\epsilon}$).

**No pivoting** (double precision): the multiplier is $\\ell_{21} = 1/\\epsilon = 10^{20}$, so
- $u_{22} = 1 - 10^{20} \\cdot 1 \\to -10^{20}$ (the 1 is lost),
- $y_2 = 2 - 10^{20} \\cdot 1 \\to -10^{20}$,
- $x_2 = y_2/u_{22} = 1$, then $x_1 = (1 - x_2)/\\epsilon = 0$.

The answer $x = (0, 1)$ is completely wrong, even though this $A$ is perfectly well-conditioned ($\\kappa \\approx 2.6$). The algorithm is unstable: a tiny pivot made a huge multiplier, and the huge entries swamped the data.

**Partial pivoting:** at step $k$, swap into the pivot position the row with the **largest $|a_{ik}|$** in column $k$ (on or below the diagonal). Here swap the rows: $\\ell_{21} = \\epsilon$, $u_{22} = 1 - \\epsilon \\to 1$, $x_2 = 1$, $x_1 = 2 - 1 = 1$. Correct.

**Bookkeeping:** collecting the row swaps into a permutation matrix $P$ gives
$$PA = LU, \\qquad |\\ell_{ij}| \\leq 1.$$
To solve, apply $P$ to $b$ and do the two triangular solves. The swaps cost $O(m^2)$ comparisons, negligible next to $\\frac23m^3$.`,
    pitfall:
      "Pivoting is not only for zero pivots. A pivot that is small but nonzero, like 10⁻²⁰, does no harm in exact arithmetic and destroys the answer in floating point. Always pivot on the largest available entry.",
    related: ["mit18335-lu-lu-factorization-solve", "mit18335-lu-growth-factor-stability", "mit1806-elimination-pa-equals-lu-permutations"],
  },
  {
    id: "mit18335-lu-growth-factor-stability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Is LU with partial pivoting backwards stable? Explain the growth factor, the matrix where it reaches 2ᵐ⁻¹, and why Gaussian elimination works in practice anyway.",
    back: `**Backward error of LU with partial pivoting:** the computed factors satisfy
$$\\tilde L\\tilde U = PA + \\delta A, \\qquad \\frac{\\lVert\\delta A\\rVert}{\\lVert A\\rVert} = O(\\rho\\,\\epsilon_{\\text{machine}}),$$
where the **growth factor** $\\rho = \\frac{\\max_{ij}|u_{ij}|}{\\max_{ij}|a_{ij}|}$ measures how large the entries grow during elimination. Pivoting keeps $|\\ell_{ij}| \\leq 1$, but it does not bound $U$.

**Worst case, $\\rho = 2^{m-1}$:** take 1 on the diagonal, $-1$ everywhere below it, and 1 in the last column. Partial pivoting does no swaps (all candidates have $|a_{ik}| = 1$), and each step doubles the last column. For $m = 6$ the last column of $U$ is
$$(1, 2, 4, 8, 16, 32)^T.$$
So $\\rho$ grows **exponentially** with $m$, and the stability bound $O(2^{m-1}\\epsilon_{\\text{machine}})$ is useless for $m \\gtrsim 60$ in double precision. Formally the algorithm is backwards stable (for fixed $m$, $\\rho$ is a constant), but the constant is astronomical.

**Why it's used everywhere anyway:** the (indisputable) practicality of Gaussian elimination comes from the **kinds of matrices that arise in practice**, not from the worst-case theorem. For matrices met in applications, growth factors are small, and the exponential examples essentially never occur. This is an empirical observation, not a proof.`,
    pitfall:
      "“Backwards stable” hides a constant. For LU with partial pivoting that constant is the growth factor, which can be 2ᵐ⁻¹. Householder QR has no such factor, which is one reason QR is preferred when guaranteed stability matters.",
    related: ["mit18335-lu-partial-pivoting", "mit18335-errors-stability-definitions", "mit18335-qr-householder-qr-algorithm"],
  },

  // --- Lecture 14: Cholesky factorization and other specialized solvers ---
  {
    id: "mit18335-lu-cholesky",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What is the Cholesky factorization A = R*R, for which matrices does it exist, and why does it cost half of LU and need no pivoting?",
    back: `For **Hermitian positive-definite** $A$ ($A = A^*$, $x^*Ax > 0$ for all $x \\neq 0$), Gaussian elimination can be done symmetrically:
$$A = R^*R, \\qquad R \\text{ upper triangular with } r_{jj} > 0.$$
It's LU with $L = R^*$, up to scaling the diagonal.

**Recurrence:** comparing entries of $A = R^*R$ row by row gives
$$r_{jj} = \\sqrt{a_{jj} - \\textstyle\\sum_{k<j}|r_{kj}|^2}, \\qquad r_{ji} = \\frac{a_{ji} - \\sum_{k<j}\\overline{r_{kj}}\\,r_{ki}}{r_{jj}} \\quad (i > j).$$
Positive definiteness guarantees the square root's argument is positive, and the algorithm **breaks down** (a non-positive value under the root) exactly when $A$ is not positive definite. That makes Cholesky the cheapest practical test for definiteness.

**Half the cost:** symmetry means only one triangle is computed and stored, $\\frac13m^3$ flops versus $\\frac23m^3$ for LU, and half the memory.

**No pivoting needed:** the entries of $R$ are bounded by the data, since $\\sum_k|r_{kj}|^2 = a_{jj}$ makes every $|r_{kj}| \\leq \\sqrt{a_{jj}}$. There's no growth, so Cholesky is backwards stable without pivoting.`,
    code: `def cholesky(A):
    """Return upper-triangular R with A = R^T R (real SPD A)."""
    m = A.shape[0]
    R = np.zeros_like(A, dtype=float)
    for j in range(m):
        s = A[j, j] - R[:j, j] @ R[:j, j]
        if s <= 0:
            raise ValueError("not positive definite")
        R[j, j] = np.sqrt(s)
        R[j, j+1:] = (A[j, j+1:] - R[:j, j] @ R[:j, j+1:]) / R[j, j]
    return R`,
    related: ["mit18335-lu-lu-factorization-solve", "mit18335-lu-structured-solvers", "mit1806-pd-svd-positive-definite-tests"],
  },
  {
    id: "mit18335-lu-structured-solvers",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Which matrix structures allow a faster Ax = b solver than dense LU, and what do they cost? When does sparsity start to pay?",
    back: `If $A$ has special form, exploit it. Dense LU costs $\\frac23m^3$:

| Structure | Solver | Cost |
|---|---|---|
| Hermitian positive-definite | Cholesky | $\\frac13m^3$, half the time and memory |
| Lower/upper triangular | forward/back substitution | $m^2$ |
| Tridiagonal or banded (bandwidth $w$) | banded LU/Cholesky, which creates no fill outside the band | $O(m)$ for tridiagonal, $O(mw^2)$ in general |
| Sparse (mostly zeros) | sparse-direct or iterative solvers | depends on structure and fill-in |
| Fast $Ax$ but no explicit entries | iterative (Krylov) solvers | (number of iterations) × (cost of $Ax$) |

LAPACK provides specialized routines for each of these special cases; you should pick the most specific one that applies.

**Sparsity:** exploiting it is typically only worthwhile when the matrix is much bigger than about $1000\\times1000$. Below that, dense LAPACK is simpler and fast enough. Sparse-direct methods (Lec 24) and Krylov iterations (Lec 18–23) take over for the big problems.`,
    related: ["mit18335-lu-cholesky", "mit18335-lu-lu-factorization-solve", "mit18335-krylov-sparse-direct", "mit18335-krylov-iterative-methods-overview"],
  },
];
