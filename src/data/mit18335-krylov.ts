// MIT 18.335J Introduction to Numerical Methods (Spring 2019, Steven G.
// Johnson) — Lectures 17-24 (iterative part): iterative methods for large
// sparse problems, Krylov subspaces and the Arnoldi/Lanczos algorithms,
// restarting, GMRES and its polynomial convergence theory, preconditioning,
// steepest descent and conjugate gradient, preconditioned CG and biCG,
// choosing a solver, and sparse-direct solvers. Sourced from the
// per-lecture OCW summaries, Johnson's handout "Why Restarting
// Arnoldi/Lanczos is not Trivial" (Lec 19) and Per-Olof Persson's "Sparse
// Matrix Algorithms" slides (Lec 24). Lectures 25-39 of the course
// (optimization, adjoint methods, quadrature, FFTs) are outside this
// track's numerical-linear-algebra scope and are not carded.
//
// Recomputed: the 2×2 conjugate-gradient trace (exact rationals:
// α₀ = 1/4, β₀ = 1/16, α₁ = 4/11, x₂ = (1/11, 7/11) exactly, d₁ᵀAd₀ = 0) and
// steepest descent on the same system (23 steps to a 10⁻¹² residual despite
// κ ≈ 1.94); Persson's compressed-column example (Pr, Ir, Jc arrays).
//
// Corrections and additions:
// - Lec 18 summary: "GS on {b, b, Ab, A²b, …}" lists b twice; the Krylov
//   sequence is {b, Ab, A²b, …}.
// - Lec 21 summary: "require that the nsup step minimize" is a garbled
//   "n-th step".
// - Added beyond the source: the M⁻¹-inner-product argument for PCG (the
//   summary only says MA's non-Hermitian-ness "is not actually a problem"),
//   the steepest-descent step length
//   α = rᵀr/rᵀAr, the CG recurrences written out, the classical bound
//   ‖e_n‖_A ≤ 2((√κ − 1)/(√κ + 1))ⁿ‖e₀‖_A behind the summary's "number of
//   steps goes like √κ", and the Jacobi preconditioner M = diag(A)⁻¹ made
//   explicit. Stationary Jacobi/Gauss-Seidel iterations are not covered by
//   this course (Jacobi appears only as a preconditioner).
import type { Card } from "./types";

const MODULE = "mit18335-krylov";

export const mit18335KrylovCards: Card[] = [
  // --- Lecture 17 (end): introduction to iterative methods ---
  {
    id: "mit18335-krylov-iterative-methods-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "When do iterative methods replace dense factorizations, what single operation do they need from A, and why is there no LAPACK-style bulletproof library for them?",
    back: `**Setting:** matrices too large for $\\Theta(m^3)$ dense methods, usually **sparse**, or more generally any $A$ for which you have a **fast matrix–vector product** $x \\mapsto Ax$ but cannot (practically) access or modify individual entries. Examples: discretized PDEs, or $A$ available only as a function.

**Interface:** iterative methods touch $A$ only through products $Ax$ (sometimes $A^*x$). They improve a guess step by step, and you stop when the residual is small enough.

**Common techniques:**
- $Ax = b$: conjugate gradient (Hermitian positive definite), MINRES/SYMMLQ (Hermitian indefinite), GMRES, biCG and its stabilized variants, QMR (non-Hermitian).
- $Ax = \\lambda x$ or $Ax = \\lambda Bx$: Arnoldi, Lanczos, and their restarted versions; nonlinear-CG / LOBPCG-type minimization of the Rayleigh quotient.

**No clear winner.** Unlike dense direct solvers (call LAPACK and you're done), the best iterative method is **problem-dependent** and often found by trial and error. Then there's **preconditioning**, which is even more problem-dependent. Tools like MATLAB or PETSc help by making it quick to try many combinations.`,
    related: ["mit18335-krylov-krylov-arnoldi", "mit18335-krylov-choosing-a-solver", "mit18335-lu-structured-solvers"],
  },

  // --- Lecture 18: Krylov methods and the Arnoldi algorithm ---
  {
    id: "mit18335-krylov-krylov-arnoldi",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define the Krylov subspace 𝒦ₙ, derive the Arnoldi iteration as Gram–Schmidt, and state the Arnoldi relation AQₙ = QₙHₙ + hₙ₊₁,ₙqₙ₊₁eₙᵀ. What does n steps cost?",
    back: `**Motivation:** the power method keeps only the latest vector $A^nv$ and throws the earlier ones away. **Krylov methods** instead look for the best answer in the whole space
$$\\mathcal K_n = \\operatorname{span}\\{b, Ab, A^2b, \\ldots, A^{n-1}b\\}.$$

**Arnoldi** builds an orthonormal basis $q_1, \\ldots, q_n$ of $\\mathcal K_n$. The raw vectors $A^kb$ all align with the dominant eigenvector (hopelessly ill-conditioned), so instead orthogonalize **$Aq_n$** against the previous $q$'s by modified Gram–Schmidt. In exact arithmetic this equals Gram–Schmidt on $\\{b, Ab, A^2b, \\ldots\\}$.

The coefficients $h_{jn} = q_j^*v$ fill an upper-Hessenberg matrix $H_n$, because $Aq_n$ only involves $q_1, \\ldots, q_{n+1}$. Collecting the steps gives the **Arnoldi relation** (a partial Hessenberg factorization of $A$):
$$AQ_n = Q_nH_n + h_{n+1,n}\\,q_{n+1}e_n^T, \\qquad H_n = Q_n^*AQ_n.$$
If $h_{n+1,n} = 0$, $\\mathcal K_n$ is an invariant subspace ("lucky breakdown").

**Cost:** $n$ steps need $n$ matrix–vector products plus $\\Theta(mn^2)$ for orthogonalization, and $\\Theta(mn)$ storage for $Q_n$. Both grow with $n$, which is why restarting is needed.`,
    code: `def arnoldi(A_mul, b, n):
    m = b.shape[0]
    Q = np.zeros((m, n + 1)); H = np.zeros((n + 1, n))
    Q[:, 0] = b / np.linalg.norm(b)
    for k in range(n):
        v = A_mul(Q[:, k])
        for j in range(k + 1):              # modified Gram-Schmidt
            H[j, k] = Q[:, j] @ v
            v -= H[j, k] * Q[:, j]
        H[k + 1, k] = np.linalg.norm(v)
        if H[k + 1, k] == 0:                # invariant subspace found
            return Q[:, :k + 1], H[:k + 1, :k + 1]
        Q[:, k + 1] = v / H[k + 1, k]
    return Q, H                             # A Q[:, :n] = Q H  (H is (n+1) x n)`,
    related: ["mit18335-krylov-rayleigh-ritz-lanczos", "mit18335-krylov-gmres", "mit18335-qr-cgs-vs-mgs", "mit18335-eig-power-inverse-iteration"],
  },
  {
    id: "mit18335-krylov-rayleigh-ritz-lanczos",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Arnoldi estimate eigenvalues (Rayleigh–Ritz, Ritz values), and why does it collapse to the three-term Lanczos recurrence for Hermitian A?",
    back: `**Rayleigh–Ritz:** approximate the eigenproblem *within* the subspace. Find $x \\in \\mathcal K_n$ and $\\nu$ with the **residual orthogonal to the subspace**, $Ax - \\nu x \\perp \\mathcal K_n$ (a Galerkin condition). Writing $x = Q_nz$ this becomes the small eigenproblem
$$H_nz = \\nu z.$$
The **Ritz values** $\\nu$ (eigenvalues of $H_n$) and **Ritz vectors** $Q_nz$ are the approximations. Extreme eigenvalues are typically found first.

**Hermitian $A$:** by the min–max theorem, the largest and smallest Ritz values are the max and min of the Rayleigh quotient over $\\mathcal K_n$, so they approach $\\lambda_{\\max}$ and $\\lambda_{\\min}$ monotonically from inside.

**Lanczos.** If $A = A^*$ then $H_n = Q_n^*AQ_n$ is Hermitian *and* upper Hessenberg, hence **tridiagonal**. Most of Arnoldi's inner products are zero: $Aq_n$ only needs orthogonalizing against $q_n$ and $q_{n-1}$. This gives a **three-term recurrence**
$$\\beta_nq_{n+1} = Aq_n - \\alpha_nq_n - \\beta_{n-1}q_{n-1}, \\qquad \\alpha_n = q_n^*Aq_n,$$
with a tridiagonal Ritz matrix.

**Costs** for $n$ steps: Arnoldi needs $\\Theta(mn^2)$ work and $\\Theta(mn)$ storage. Lanczos needs $\\Theta(mn)$ work and, if only eigenvalues are wanted, $\\Theta(m + n)$ storage (keep just two vectors). That's the theory. In floating point, Lanczos loses orthogonality (next card).`,
    related: ["mit18335-krylov-krylov-arnoldi", "mit18335-krylov-restarting", "mit18335-eig-rayleigh-quotient-iteration", "mit18335-eig-hessenberg-reduction"],
  },

  // --- Lecture 19: Arnoldi and Lanczos with restarting ---
  {
    id: "mit18335-krylov-restarting",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why do Arnoldi and Lanczos need restarting, and why does the naive restart (keep the k best Ritz vectors) break the Arnoldi relation?",
    back: `**Two problems as $n$ grows:**
- **Lanczos** in floating point loses orthogonality of the $q$'s (it never re-orthogonalizes against old vectors). Converged eigenvalues then reappear as spurious copies: "**ghost eigenvalues**".
- **Arnoldi** stores and orthogonalizes against all $q_j$, so it stays accurate, but costs $\\Theta(mn^2)$ time and $\\Theta(mn)$ memory, which eventually runs out.

**Restarting:** after $n$ steps, shrink to a $k$-dimensional subspace holding the current best guesses and continue from there. With $k = 1$ every step this is essentially the power method: still convergent, but slower. For $k > 1$ it converges significantly faster than the power method.

**What a restart must preserve.** The new basis $\\hat Q_k = Q_n\\hat Q$ (with $\\hat Q$ an $n\\times k$ matrix with orthonormal columns) must satisfy the Arnoldi relation
$$A\\hat Q_k = \\hat Q_k\\hat H_k + \\hat r_ke_k^*, \\qquad \\hat H_k \\text{ upper Hessenberg}, \\quad \\hat r_k \\perp \\hat Q_k.$$

**Naive restart:** take Ritz vectors $Q_n\\hat Z$ for the $k$ wanted Ritz values and orthonormalize, $\\hat Z = \\hat Q\\hat R$. Two things work out beautifully: $\\hat H_k = \\hat R\\hat\\Lambda\\hat R^{-1}$ is upper **triangular**, and the cross term $\\hat Q_\\perp^*H_n\\hat Q$ vanishes. But the residual term becomes
$$r_ne_n^*\\hat Q = r_n\\,(\\text{last row of } \\hat Q),$$
and the last row of $\\hat Q$ is generally **not** a multiple of $e_k^*$. The relation breaks. Lanczos has the same problem.

**The fix (implicit restarting):** the naive choice was "too good" (triangular instead of Hessenberg, residual orthogonal to all of $\\mathcal K_n$). Do exactly $n - k$ steps of **shifted QR** on $H_n$ instead, and let $\\hat Q$ be the resulting Schur-vector estimate. That preserves the Arnoldi structure while keeping mostly the wanted Ritz vectors (implicitly restarted Arnoldi/Lanczos, as in ARPACK).`,
    related: ["mit18335-krylov-rayleigh-ritz-lanczos", "mit18335-krylov-krylov-arnoldi", "mit18335-eig-shifted-qr-algorithm"],
  },

  // --- Lecture 20: GMRES and convergence of GMRES and Arnoldi ---
  {
    id: "mit18335-krylov-gmres",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does GMRES solve Ax = b over the Krylov subspace, and why is each step only a small (n+1)×n least-squares problem?",
    back: `**GMRES** ("generalized minimal residual"): at step $n$, choose
$$x_n = \\arg\\min_{x \\in \\mathcal K_n}\\lVert Ax - b\\rVert_2, \\qquad \\mathcal K_n = \\operatorname{span}\\{b, Ab, \\ldots, A^{n-1}b\\}.$$

**Reduction to a small problem.** Use the Arnoldi basis with $q_1 = b/\\lVert b\\rVert$ and write $x = Q_ny$. Arnoldi gives $AQ_n = Q_{n+1}\\tilde H_n$, where $\\tilde H_n$ is the $(n+1)\\times n$ upper-Hessenberg matrix ($H_n$ plus the row $h_{n+1,n}e_n^T$). Since $b = \\lVert b\\rVert Q_{n+1}e_1$,
$$\\lVert Ax - b\\rVert_2 = \\lVert Q_{n+1}(\\tilde H_ny - \\lVert b\\rVert e_1)\\rVert_2 = \\lVert\\tilde H_ny - \\lVert b\\rVert e_1\\rVert_2,$$
because $Q_{n+1}$ has orthonormal columns. Each step solves this tiny least-squares problem (cheaply updated with one Givens rotation per step) and sets $x_n = Q_ny$.

**Properties:**
- The residual norm is **monotonically non-increasing** (the subspaces are nested).
- In exact arithmetic it reaches the exact solution in at most $m$ steps, but the point is to get a good answer for $n \\ll m$.
- Cost and storage grow like Arnoldi's, $\\Theta(mn^2)$ and $\\Theta(mn)$. So in practice one **restarts** every $k$ steps, usually keeping a 1-dimensional subspace (the current $x$): **GMRES($k$)**.`,
    pitfall:
      "Restarted GMRES(k) is not guaranteed to converge. Unlike restarted Arnoldi for the largest |λ|, it can stagnate. When it does, the remedy is preconditioning, not a bigger k.",
    related: ["mit18335-krylov-krylov-arnoldi", "mit18335-krylov-gmres-convergence", "mit18335-qr-givens-rotations", "mit18335-qr-least-squares-three-ways"],
  },
  {
    id: "mit18335-krylov-gmres-convergence",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain GMRES convergence through polynomial approximation on the eigenvalues. Why do clustered eigenvalues converge fast, and why can two matrices with the same small κ behave very differently?",
    back: `**Krylov = polynomials.** Any $x \\in \\mathcal K_n$ is $q(A)b$ for a polynomial $q$ of degree $< n$, so the residual is $b - Ax = p(A)b$ with $p(z) = 1 - zq(z)$: a degree-$n$ polynomial with **$p(0) = 1$**. GMRES picks the best such $p$. For diagonalizable $A = V\\Lambda V^{-1}$:
$$\\frac{\\lVert r_n\\rVert}{\\lVert b\\rVert} \\leq \\kappa(V)\\min_{\\substack{\\deg p \\leq n\\\\ p(0) = 1}}\\max_{\\lambda \\in \\sigma(A)}|p(\\lambda)|.$$
(For Arnoldi eigenvalue estimates the analogous polynomials are **monic**, with the $\\lambda^n$ coefficient equal to 1, instead of $p(0) = 1$.)

**Reading the bound:**
- **Clustered eigenvalues** (one or a few small clusters away from 0): put a few roots of $p$ in each cluster and $|p|$ is tiny on all eigenvalues after a few steps. **Fast.**
- **A few outliers** cost only about one iteration each: $p$ gets a root there and "removes" them. This is why Krylov methods effectively improve the condition number as they go, and why condition-number bounds are often pessimistic.
- **Eigenvalues spread out** (worst case) need high degree.
- **Non-normal $A$**: $\\kappa(V)$ can be huge. Near-orthogonal eigenvectors (near-normal $A$) are favorable.

**Same κ, different behaviour** (the book's examples 35.1/35.2, discussed in lecture): eigenvalues clustered near one point converge quickly, while eigenvalues of similar magnitude spread **around a circle centred at the origin** converge very slowly, because a polynomial with $p(0) = 1$ cannot be small all around a circle enclosing 0, even though $\\kappa$ is comparable.

In practice eigenvalues often aren't clustered, so the cure is **preconditioning**: find an easy-to-invert $M$ such that $M^{-1}A$ has clustered eigenvalues (and isn't nearly defective).`,
    related: ["mit18335-krylov-gmres", "mit18335-krylov-preconditioning", "mit18335-krylov-cg-convergence"],
  },

  // --- Lecture 21: Preconditioning; the conjugate-gradient method ---
  {
    id: "mit18335-krylov-preconditioning",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "What is a preconditioner, what are left and right preconditioning, and when do Jacobi, incomplete LU/Cholesky and multigrid preconditioners work?",
    back: `**Idea:** solve an equivalent system whose matrix has **clustered eigenvalues**, so the Krylov method converges in few iterations. Think of $M$ as a crude approximation of $A^{-1}$, or rather as the inverse of a crude approximation of $A$ that's easy to invert.
- **Left:** solve $MAx = Mb$.
- **Right:** solve $AMy = b$, then $x = My$.

Each iteration now also applies $M$ once, so $M$ must be **cheap to apply**. The ideal $M = A^{-1}$ would converge in one step but costs a full solve.

| Preconditioner | $M$ approximates $A^{-1}$ by | Works well for |
|---|---|---|
| **Jacobi** / block-Jacobi | inverting the diagonal (or diagonal blocks): $M = \\operatorname{diag}(A)^{-1}$ | **diagonally dominant** matrices, e.g. from spectral and integral-equation methods; poor for finite-difference/finite-element grids, since it only captures short-range interactions |
| **Incomplete LU / Cholesky** | an LU/Cholesky factorization that drops fill-in to stay sparse | general sparse matrices, a common default |
| **Multigrid** | solving coarser versions of the problem recursively | PDE discretizations on grids (near-optimal there) |

Choosing a preconditioner is **highly problem-dependent**, often more of an art than choosing the Krylov method itself.`,
    pitfall:
      "A preconditioner is never applied by forming M⁻¹ or MA explicitly. That would destroy sparsity and cost a dense product. Each iteration just applies M to a vector, e.g. two sparse triangular solves for incomplete LU.",
    related: ["mit18335-krylov-gmres-convergence", "mit18335-krylov-pcg-bicg", "mit18335-lu-lu-factorization-solve"],
  },
  {
    id: "mit18335-krylov-steepest-descent",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "For Hermitian positive-definite A, cast Ax = b as minimizing f(x) = x*Ax − x*b − b*x. Derive steepest descent with exact line search, and explain its zig-zag and its dependence on κ(A).",
    back: `**Minimization view.** $f(x) = x^*Ax - x^*b - b^*x$ is a convex quadratic (since $A$ is positive definite), with gradient $\\nabla f = 2(Ax - b)$. Its unique minimizer is the solution of $Ax = b$. The **residual** $r = b - Ax$ is half the negative gradient: the steepest-descent direction.

**Line minimization.** From $x$, minimize $f(x + \\alpha d)$ over the scalar $\\alpha$. For real data, setting the derivative to zero gives
$$\\alpha = \\frac{d^*r}{d^*Ad}.$$
**Steepest descent** takes $d = r$: $x \\leftarrow x + \\frac{r^*r}{r^*Ar}r$.

**Zig-zag.** After an exact line search the new gradient is orthogonal to the old direction, so successive steps are at right angles. In a long narrow valley (ellipses with axis ratio $\\sqrt{\\kappa}$) the iterate bounces between the walls, making slow progress along the valley floor. The number of steps for a given accuracy grows **proportionally to $\\kappa(A)$**.

**Example:** $A = \\begin{pmatrix}4 & 1\\\\ 1 & 3\\end{pmatrix}$, $b = (1, 2)$, $x_0 = 0$, solution $x = (\\frac1{11}, \\frac7{11})$. Even with $\\kappa \\approx 1.94$, steepest descent needs **23** steps to get the residual below $10^{-12}$, while CG solves this $2\\times2$ system *exactly* in 2 (next card).

**The flaw:** each step minimizes along one direction and then forgets it, and later steps partly undo earlier progress. **Conjugate gradient** instead minimizes over **all** previous search directions at once.`,
    related: ["mit18335-krylov-conjugate-gradient", "mit18335-errors-matrix-condition-number", "mit1806-pd-svd-completing-square-minima"],
  },
  {
    id: "mit18335-krylov-conjugate-gradient",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Derive the conjugate-gradient method: what does the n-th iterate minimize, why must the search directions be A-conjugate, and why does a three-term recurrence suffice? Trace it on A = [[4, 1], [1, 3]], b = (1, 2).",
    back: `**Goal:** make $x_n$ minimize $f(x) = x^*Ax - x^*b - b^*x$ over the whole Krylov space $\\mathcal K_n = \\operatorname{span}\\{b, Ab, \\ldots\\}$ (with $x_0 = 0$), not just along one line. Equivalently, minimize the error $\\lVert x - x_*\\rVert_A$ in the $A$-norm $\\lVert e\\rVert_A = \\sqrt{e^*Ae}$.

**Conjugacy.** If each step does a line search along $d_n$ and we want the result to stay optimal over *all* previous directions, then the new direction must not spoil the earlier minimizations. That forces
$$d_i^*Ad_j = 0 \\quad (i \\neq j),$$
i.e. directions orthogonal **through $A$** ("conjugate"). Get them by Gram–Schmidt (in the $A$-inner product) on the successive residuals (gradients).

**The Lanczos-like miracle:** most of those Gram–Schmidt coefficients are **zero**. The residuals are mutually orthogonal and $r_n$ is already $A$-conjugate to all directions except $d_{n-1}$. So only the previous direction is needed:
$$\\alpha_n = \\frac{r_n^*r_n}{d_n^*Ad_n}, \\quad x_{n+1} = x_n + \\alpha_nd_n, \\quad r_{n+1} = r_n - \\alpha_nAd_n,$$
$$\\beta_n = \\frac{r_{n+1}^*r_{n+1}}{r_n^*r_n}, \\quad d_{n+1} = r_{n+1} + \\beta_nd_n.$$
That's one matrix–vector product and $O(m)$ storage per step.

**Trace** (exact rationals), $x_0 = 0$, $r_0 = d_0 = (1, 2)$:
- $Ad_0 = (6, 7)$, $\\alpha_0 = \\frac{5}{20} = \\frac14$, $x_1 = (\\frac14, \\frac12)$, $r_1 = (-\\frac12, \\frac14)$.
- $\\beta_0 = \\frac{5/16}{5} = \\frac1{16}$, $d_1 = (-\\frac7{16}, \\frac38)$. Check: $d_1^TAd_0 = -\\frac{42}{16} + \\frac{42}{16} = 0$.
- $Ad_1 = (-\\frac{11}8, \\frac{11}{16})$, $\\alpha_1 = \\frac{5/16}{110/128} = \\frac4{11}$, $x_2 = (\\frac1{11}, \\frac7{11})$, $r_2 = 0$: **exact after $m = 2$ steps.**`,
    code: `def conjugate_gradient(A_mul, b, tol=1e-10, maxiter=None):
    x = np.zeros_like(b); r = b.copy(); d = r.copy()
    rr = r @ r
    for _ in range(maxiter or len(b)):
        Ad = A_mul(d)
        alpha = rr / (d @ Ad)
        x += alpha * d
        r -= alpha * Ad
        rr_new = r @ r
        if np.sqrt(rr_new) < tol * np.linalg.norm(b):
            break
        d = r + (rr_new / rr) * d
        rr = rr_new
    return x`,
    related: ["mit18335-krylov-steepest-descent", "mit18335-krylov-cg-convergence", "mit18335-krylov-rayleigh-ritz-lanczos", "mit18335-krylov-pcg-bicg"],
  },

  // --- Lecture 22: Convergence of conjugate gradient ---
  {
    id: "mit18335-krylov-cg-convergence",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "What can be said about the convergence of conjugate gradient: the “exact in m steps” result, the √κ bound, and superlinear convergence?",
    back: `Three levels of statement, from least to most useful:

**1. Exact in $m$ steps** (exact arithmetic): $\\mathcal K_m$ is the whole space, so $x_m = x_*$. **Useless in practice:** $m$ may be $10^6$, roundoff destroys the exact conjugacy long before, and the whole point is to stop at $n \\ll m$.

**2. Condition-number bound** (pessimistic). Like GMRES, the CG error is a polynomial in $A$ applied to the initial error, now optimized in the $A$-norm. Bounding $|p|$ on $[\\lambda_{\\min}, \\lambda_{\\max}]$ with Chebyshev polynomials gives
$$\\lVert e_n\\rVert_A \\leq 2\\left(\\frac{\\sqrt\\kappa - 1}{\\sqrt\\kappa + 1}\\right)^n\\lVert e_0\\rVert_A,$$
so the number of steps for a fixed accuracy grows like $\\sqrt{\\kappa}$, against $\\kappa$ for steepest descent. For $\\kappa = 10^4$ that's $\\sim 100$ versus $\\sim 10^4$ iterations.

**3. Superlinear convergence** (realistic). The bound treats the spectrum as filling the whole interval. If the eigenvalues are **clustered**, or a few outliers sit apart, the optimal polynomial does much better: outliers are "removed" one root at a time, and the effective condition number shrinks as the iteration proceeds. Convergence then **accelerates**.

| Method | Iterations for fixed accuracy | Requires |
|---|---|---|
| Steepest descent | $\\propto \\kappa$ | Hermitian positive definite |
| Conjugate gradient | $\\propto \\sqrt\\kappa$ (often better) | Hermitian positive definite |
| GMRES | depends on eigenvalue distribution and $\\kappa(V)$ | any nonsingular $A$ |`,
    related: ["mit18335-krylov-conjugate-gradient", "mit18335-krylov-gmres-convergence", "mit18335-krylov-steepest-descent"],
  },

  // --- Lecture 23: Biconjugate gradient algorithms ---
  {
    id: "mit18335-krylov-pcg-bicg",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does preconditioned CG keep working although MA is not Hermitian, and what is biCG? Why should plain biCG almost never be used?",
    back: `**Preconditioned CG.** With a Hermitian positive-definite preconditioner $M \\approx A^{-1}$, the matrix $MA$ is generally **not** Hermitian, which seems to rule out CG. But $MA$ is self-adjoint in the **$M^{-1}$-inner product** $\\langle x, y\\rangle = x^*M^{-1}y$ (equivalently, CG on $M^{1/2}AM^{1/2}$). Redoing the CG derivation in that inner product gives PCG, which only needs one application of $M$ per step and never forms $M^{1/2}$. (Preconditioned steepest descent with $M \\approx A^{-1}$ resembles an approximate **Newton** step.)

**biCG**, for non-Hermitian $A$ (an alternative to GMRES with short recurrences): run PCG on the Hermitian but **indefinite** block matrix
$$B = \\begin{pmatrix}0 & A\\\\ A^* & 0\\end{pmatrix}$$
with the "preconditioner" $\\begin{pmatrix}0 & I\\\\ I & 0\\end{pmatrix}$. Because $B$ is Hermitian there's still a conjugacy condition and short recurrences, and it's still a Krylov method. Because $B$ is indefinite, it seeks a **saddle point**, not a minimum, and it can **break down** when a denominator like $d^*Bd$ hits zero. (The same algorithm as Trefethen's 39.1, derived differently.)

**So:** plain biCG is almost never the right choice. Use its stabilized descendants, especially **biCGSTAB($\\ell$)**, which combine biCG with GMRES-like minimization to avoid breakdown, or **QMR**.`,
    related: ["mit18335-krylov-conjugate-gradient", "mit18335-krylov-preconditioning", "mit18335-krylov-choosing-a-solver", "mit18335-qr-hermitian-embedding-svd"],
  },
  {
    id: "mit18335-krylov-choosing-a-solver",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Rules of thumb from 18.335 for choosing an Ax = b solver: dense LAPACK vs sparse-direct vs iterative. How does the PDE dimension change the answer?",
    back: `| Situation | Use | Why |
|---|---|---|
| Small: up to roughly thousands × thousands | dense **LAPACK** (LU, Cholesky, QR) | robust, predictable $\\Theta(m^3)$, no tuning |
| Intermediate-size **sparse** | **sparse-direct** (sparse LU/Cholesky with fill-reducing ordering) | exact up to roundoff, reusable factorization, much less work than dense |
| Largest problems, or a fast $Ax$ with no explicit sparsity | **iterative** Krylov method (CG, MINRES, GMRES, biCGSTAB) + preconditioner | memory $O(m)$, cost = iterations × cost of $Ax$ |

**Dimension matters for sparse-direct.** On a well-shaped mesh with $N$ unknowns (Persson's table, nested-dissection orderings):

| | 1-D | 2-D | 3-D |
|---|---|---|---|
| Fill (storage) | $O(N)$ | $O(N\\log N)$ | $O(N^{4/3})$ |
| Time (flops) | $O(N)$ | $O(N^{3/2})$ | $O(N^2)$ |

So sparse-direct scales well for **2-D** PDE discretizations and much worse for **3-D**, where iterative methods win sooner.

In general, some **experimentation** is needed. Environments that make it quick to swap algorithms and preconditioners (MATLAB, PETSc) are valuable precisely because no single method dominates.`,
    related: ["mit18335-krylov-sparse-direct", "mit18335-krylov-iterative-methods-overview", "mit18335-lu-structured-solvers"],
  },

  // --- Lecture 24: Sparse-direct solvers ---
  {
    id: "mit18335-krylov-sparse-direct",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "What is fill-in in sparse LU/Cholesky, why does it depend on the ordering, and how does nested dissection reduce it for the 2-D grid Laplacian?",
    back: `**Sparse-direct solvers** do LU/Cholesky while storing and computing **only the nonzeros**: storage $O(\\text{nonzeros})$, time close to $O(\\text{flops})$. Typical storage is **compressed column**: values $Pr$, row indices $Ir$, and column start pointers $Jc$. For $\\begin{pmatrix}31 & 0 & 53\\\\ 0 & 59 & 0\\\\ 41 & 26 & 0\\end{pmatrix}$ these are $Pr = (31, 41, 59, 26, 53)$, $Ir = (1, 3, 2, 3, 1)$, $Jc = (1, 3, 5, 6)$ (1-based), about $1.5\\,\\text{nnz} + 0.5\\,\\text{ncols}$ words. Lookup within a column is $O(\\log)$, inserting a new nonzero is expensive.

**Fill-in:** elimination creates **new nonzeros**. In graph terms (vertices = unknowns, edges = nonzeros $a_{ij}$), eliminating vertex $j$ adds edges between all of $j$'s higher-numbered neighbours. The fill depends only on the **sparsity pattern and the ordering**, so it's a graph problem.

**Discrete Laplacian experiments:**
- **1-D** grid: tridiagonal, and the factor is bidiagonal. $\\Theta(m)$ storage and work.
- **2-D** $n\\times n$ grid ($m = n^2$, 4 off-diagonals per row), natural ordering: each column fills in $\\Theta(\\sqrt m)$ entries, so $\\Theta(m^{3/2})$ nonzeros in total.
- **Random reordering**: $\\Theta(m^2)$ nonzeros (about 10% dense in the demo), a disaster.

**Nested dissection:** find a **separator** $S$ (vertices whose removal splits the graph into pieces), number it **last**, and recurse on the pieces. The matrix becomes mostly block-diagonal with big zero blocks that elimination preserves. For the 2-D grid this gives $O(m\\log m)$ fill (optimal up to constants) and $O(m^{3/2})$ flops. For general matrices, finding good separators is a hard graph problem. Practical orderings: reverse Cuthill–McKee (bandwidth), approximate minimum degree, nested dissection, and ND/MD hybrids.`,
    complexity: {
      structure: "Sparse Cholesky of the grid Laplacian (m unknowns)",
      operations: [
        { op: "1-D grid", time: "Θ(m) flops", space: "Θ(m) fill" },
        { op: "2-D grid, natural ordering", time: "—", space: "Θ(m√m) fill", note: "Θ(√m) per column" },
        { op: "2-D grid, nested dissection", time: "O(m√m) flops", space: "O(m log m) fill" },
        { op: "3-D mesh, nested dissection", time: "O(m²) flops", space: "O(m⁴ᐟ³) fill" },
      ],
      caveat: "A random ordering of the 2-D grid gives Θ(m²) fill: the ordering is everything.",
    },
    related: ["mit18335-krylov-choosing-a-solver", "mit18335-lu-cholesky", "mit18335-lu-structured-solvers"],
  },
];
