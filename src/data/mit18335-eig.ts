// MIT 18.335J Introduction to Numerical Methods (Spring 2019, Steven G.
// Johnson) — Lectures 14-17 (eigenproblem part): the Schur factorization,
// why eigensolvers must be iterative, companion matrices and Wilkinson's
// polynomial, Hessenberg reduction, the power method, inverse and
// Rayleigh-quotient iteration, the QR algorithm and its shifts. Sourced
// from the per-lecture OCW summaries and Per-Olof Persson's slides
// "Hessenberg/Tridiagonal Reduction" (the Lec 15 handout; numbered
// "Lecture 14" in his 2006 course) and "The QR Algorithm I/II" (the Lec 16
// readings; his "Lectures 15-16"). The Cholesky part of Lec 14 is in
// src/data/mit18335-lu.ts; the iterative-methods overview that ends Lec 17
// is in src/data/mit18335-krylov.ts.
//
// Recomputed: the companion-matrix determinant (sympy, m = 3); Wilkinson's
// polynomial with the x¹⁹ coefficient −210 perturbed by 2⁻²³ (mpmath at 60
// digits: roots 16.7307 ± 2.81262i, 19.5024 ± 1.94033i, 20.8469, …); the
// Hessenberg operation count Σ 4(m−k)² + 4m(m−k) = 10m³/3 (sympy); the
// Wilkinson shift as the eigenvalue of the trailing 2×2 block closer to aₘ.
//
// Corrections and additions:
// - Persson's simultaneous-iteration slide writes A^k = A Q̲⁽ᵏ⁻¹⁾R̲⁽ᵏ⁻¹⁾ =
//   Q̲⁽ᵏ⁻¹⁾A⁽ᵏ⁻¹⁾R̲⁽ᵏ⁻¹⁾ without saying why AQ̲⁽ᵏ⁻¹⁾ = Q̲⁽ᵏ⁻¹⁾A⁽ᵏ⁻¹⁾; the
//   card supplies the one-line reason (A⁽ᵏ⁻¹⁾ = Q̲⁽ᵏ⁻¹⁾ᵀAQ̲⁽ᵏ⁻¹⁾).
// - Added beyond the source: the explicit companion matrix, the numeric
//   Wilkinson perturbation, the deflation formula A − λ₁q₁q₁* for the power
//   method, and the inductive Schur proof written out (the summary says
//   only "proved by induction").
import type { Card } from "./types";

const MODULE = "mit18335-eig";

export const mit18335EigCards: Card[] = [
  // --- Lecture 14: Eigenproblems and Schur factorizations ---
  {
    id: "mit18335-eig-schur-factorization",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove by induction that every square complex matrix has a Schur factorization A = QTQ* (Q unitary, T upper triangular), and that for Hermitian A the Schur form is real and diagonal.",
    back: `**Why Schur and not diagonalization:** $A = X\\Lambda X^{-1}$ fails for **defective** matrices (too few eigenvectors), and even when it exists $X$ can be badly conditioned. The Schur form always exists and uses a **unitary** similarity, which is perfectly conditioned. The eigenvalues sit on the diagonal of $T$.

**Theorem.** Every $A \\in \\mathbb C^{m\\times m}$ has $A = QTQ^*$ with $Q$ unitary and $T$ upper triangular.

**Proof** (induction on $m$; $m = 1$ is trivial). The characteristic polynomial has a root $\\lambda$ (fundamental theorem of algebra), so there's a unit eigenvector $q_1$ with $Aq_1 = \\lambda q_1$. Extend it to a unitary $U = (q_1 \\mid \\hat U)$. Then
$$U^*AU = \\begin{pmatrix}\\lambda & w^*\\\\ 0 & B\\end{pmatrix},$$
where the zero column comes from $\\hat U^*Aq_1 = \\lambda\\hat U^*q_1 = 0$. By induction $B = VT_BV^*$ with $V$ unitary and $T_B$ upper triangular. Set $Q = U\\begin{pmatrix}1 & 0\\\\ 0 & V\\end{pmatrix}$, which is unitary, and
$$Q^*AQ = \\begin{pmatrix}\\lambda & w^*V\\\\ 0 & T_B\\end{pmatrix} = T. \\;\\blacksquare$$

**Hermitian case.** If $A = A^*$ then $T = Q^*AQ$ is Hermitian *and* upper triangular, so it's diagonal, with real diagonal entries ($t_{ii} = \\overline{t_{ii}}$). That's the spectral theorem: real eigenvalues and an orthonormal eigenbasis.

Related problems mentioned in lecture: generalized eigenproblems $Ax = \\lambda Bx$, and the SVD as an eigenproblem of $A^*A$.`,
    related: ["mit18335-eig-hessenberg-reduction", "mit1806-pd-svd-spectral-theorem", "mit1806-pd-svd-jordan-form", "mit1806-eigenvalues-diagonalization"],
  },

  // --- Lecture 15: Companion matrices, ill-conditioning, Hessenberg ---
  {
    id: "mit18335-eig-eigensolvers-must-iterate",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Why must every general eigenvalue algorithm be iterative, rather than finishing in finitely many steps like LU? Use the companion matrix.",
    back: `**Root finding reduces to eigenvalues.** For a monic polynomial $p(z) = z^m + a_{m-1}z^{m-1} + \\cdots + a_1z + a_0$, the **companion matrix** (here for $m = 3$)
$$C = \\begin{pmatrix}0 & 0 & -a_0\\\\ 1 & 0 & -a_1\\\\ 0 & 1 & -a_2\\end{pmatrix}$$
has $\\det(zI - C) = z^3 + a_2z^2 + a_1z + a_0 = p(z)$, so its eigenvalues are exactly the roots of $p$. The same pattern (ones on the subdiagonal, $-a_i$ in the last column) works for every $m$.

**Abel–Ruffini (Abel, Galois, 19th century):** there is no formula for the roots of a general polynomial of degree $\\geq 5$ using finitely many $+, -, \\times, \\div$ and $k$-th roots. (Squaring the circle, trisecting an angle and doubling the cube were proved impossible in the same century.)

**Conclusion.** An "LU-like" eigensolver, one that produced exact eigenvalues in finitely many such operations, would give a root formula for every polynomial via its companion matrix. So no such algorithm can exist for $m \\geq 5$. Every eigensolver must be **iterative**: improve a guess step by step, converging to any desired accuracy but never exactly arriving (like Newton's method for a root).

What *can* be done exactly in finitely many steps is a reduction that preserves the eigenvalues: **Hessenberg form**.`,
    related: ["mit18335-eig-wilkinson-polynomial", "mit18335-eig-hessenberg-reduction", "mit18335-errors-newton-square-roots"],
  },
  {
    id: "mit18335-eig-wilkinson-polynomial",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Why is computing the characteristic polynomial's coefficients and then finding its roots a terrible way to compute eigenvalues? Use Wilkinson's polynomial (x − 1)(x − 2)⋯(x − 20).",
    back: `**Wilkinson's polynomial** $w(x) = \\prod_{k=1}^{20}(x - k)$ has well-separated roots $1, 2, \\ldots, 20$. In expanded (monomial) form its $x^{19}$ coefficient is $-210$, and the others reach about $10^{19}$.

**Perturb one coefficient by a relative $\\sim 6\\cdot10^{-10}$:** change $-210$ to $-210 - 2^{-23}$. The roots become (recomputed in 60-digit arithmetic)
- $1, 2, \\ldots, 5$ essentially unchanged; then $6.00001$, $6.9997$, $8.007$, $8.917$;
- and **five complex pairs**: $10.095 \\pm 0.644i$, $11.794 \\pm 1.652i$, $13.992 \\pm 2.519i$, $16.731 \\pm 2.813i$, $19.502 \\pm 1.940i$;
- and $20.847$.

So a perturbation far smaller than single-precision rounding moves roots by $O(1)$ and makes real roots complex. **Root finding from monomial coefficients is extremely ill-conditioned**, even when the eigenvalue problem it came from (here $\\operatorname{diag}(1, \\ldots, 20)$, perfectly conditioned) is not.

**Lesson:** never form the characteristic polynomial's coefficients. (Evaluating $\\det(A - \\lambda I)$ directly, e.g. to look for eigenvalues in a known interval, is not as bad, but there are much better methods.) The method LAPACK and MATLAB actually use, the **QR algorithm**, was discovered only around 1960. Note the irony: \`roots\` in MATLAB/numpy works the other way, computing polynomial roots as eigenvalues of the companion matrix.`,
    pitfall:
      "The undergraduate recipe (solve det(A − λI) = 0) is fine by hand for 2×2 and 3×3 matrices but is a numerical disaster in general. Ill-conditioning of the polynomial is not ill-conditioning of the eigenproblem.",
    related: ["mit18335-eig-eigensolvers-must-iterate", "mit18335-errors-condition-number", "mit1806-eigenvalues-characteristic-equation"],
  },
  {
    id: "mit18335-eig-hessenberg-reduction",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "Why can't Householder reflectors reduce A to triangular (Schur) form directly, and how does reducing to upper-Hessenberg form A = QHQ* work instead? Give the costs and what happens for Hermitian A.",
    back: `**Attempt at Schur directly:** apply a reflector $Q_1^*$ on the left to zero column 1 below the diagonal. For a *similarity* you must also apply $Q_1$ on the right, and that right multiplication **mixes all the columns**, destroying the zeros just made. (It had to fail: a finite procedure can't reach Schur form, by Abel. The subdiagonal entries do typically shrink, though, which hints at the QR algorithm.)

**Settle for Hessenberg:** let $Q_1^*$ zero column 1 below the **subdiagonal** only (rows $3..m$). Its right counterpart $Q_1$ then acts on columns $2..m$, so column 1 is untouched and the zeros survive. Repeat for columns $2, \\ldots, m-2$:
$$\\underbrace{Q_{m-2}^*\\cdots Q_1^*}_{Q^*}\\,A\\,\\underbrace{Q_1\\cdots Q_{m-2}}_{Q} = H,$$
upper triangular plus one subdiagonal. $H$ is **similar** to $A$ (same eigenvalues, eigenvectors related by $Q$), and this is finite, exact in exact arithmetic.

**Algorithm** ($k = 1, \\ldots, m-2$): $x = A_{k+1:m,k}$, $v_k = \\operatorname{sign}(x_1)\\lVert x\\rVert_2e_1 + x$, normalize, then
- $A_{k+1:m,\\,k:m} \\leftarrow A_{k+1:m,\\,k:m} - 2v_k(v_k^*A_{k+1:m,\\,k:m})$ (left),
- $A_{1:m,\\,k+1:m} \\leftarrow A_{1:m,\\,k+1:m} - 2(A_{1:m,\\,k+1:m}v_k)v_k^*$ (right).

**Cost:**
$$\\sum_{k=1}^m 4(m-k)^2 + 4m(m-k) \\approx \\underbrace{\\tfrac43m^3}_{\\text{left, like QR}} + 2m^3 = \\tfrac{10}{3}m^3.$$
That's not twice Householder QR, because the right multiplications act on all $m$ rows.

**Hermitian $A$:** $H = Q^*AQ$ is Hermitian, so the zeros appear above the diagonal too and $H$ is **tridiagonal**. Exploiting symmetry it costs $\\frac43m^3$.

**Payoff:** each later operation (a QR step, a determinant, an LU) costs $O(m^2)$ on Hessenberg instead of $O(m^3)$, and $O(m)$ on tridiagonal. **Stability:** backwards stable, $\\tilde Q\\tilde H\\tilde Q^* = A + \\delta A$ with $\\lVert\\delta A\\rVert/\\lVert A\\rVert = O(\\epsilon_{\\text{machine}})$ and $\\tilde Q$ exactly unitary.`,
    complexity: {
      structure: "Householder reduction (m×m)",
      operations: [
        { op: "General A → upper Hessenberg", time: "10m³/3 flops" },
        { op: "Hermitian A → tridiagonal", time: "4m³/3 flops" },
        { op: "One QR step on Hessenberg / tridiagonal", time: "O(m²) / O(m)" },
      ],
    },
    related: ["mit18335-eig-schur-factorization", "mit18335-qr-householder-reflectors", "mit18335-eig-qr-algorithm-simultaneous-iteration"],
  },

  // --- Lecture 16: The power method and the QR algorithm ---
  {
    id: "mit18335-eig-power-inverse-iteration",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Derive the convergence rate of power iteration for a real symmetric A, and show how inverse iteration with a shift μ targets the eigenvalue nearest μ.",
    back: `**Power iteration:** $w = Av^{(k-1)}$, $v^{(k)} = w/\\lVert w\\rVert$, $\\lambda^{(k)} = (v^{(k)})^TAv^{(k)}$.

**Convergence.** Expand $v^{(0)} = a_1q_1 + \\cdots + a_mq_m$ in the orthonormal eigenvectors. Then
$$v^{(k)} = c_kA^kv^{(0)} = c_k\\lambda_1^k\\left(a_1q_1 + a_2\\left(\\tfrac{\\lambda_2}{\\lambda_1}\\right)^kq_2 + \\cdots + a_m\\left(\\tfrac{\\lambda_m}{\\lambda_1}\\right)^kq_m\\right).$$
If $|\\lambda_1| > |\\lambda_2| \\geq \\cdots$ and $q_1^Tv^{(0)} \\neq 0$:
$$\\lVert v^{(k)} - (\\pm q_1)\\rVert = O\\!\\left(\\left|\\tfrac{\\lambda_2}{\\lambda_1}\\right|^k\\right), \\qquad |\\lambda^{(k)} - \\lambda_1| = O\\!\\left(\\left|\\tfrac{\\lambda_2}{\\lambda_1}\\right|^{2k}\\right).$$
This is **linear** convergence with factor $|\\lambda_2/\\lambda_1|$, hopeless when the top two eigenvalues are nearly equal in magnitude. The eigenvalue converges twice as fast because the Rayleigh quotient is quadratically accurate.

**Deflation (Hermitian):** once $q_1$ is found, iterate with vectors kept orthogonal to $q_1$ (equivalently on $A - \\lambda_1q_1q_1^*$) to get $\\lambda_2$, and so on.

**Inverse iteration:** apply the power method to $(A - \\mu I)^{-1}$, whose eigenvalues are $(\\lambda_j - \\mu)^{-1}$. The largest belongs to the $\\lambda_J$ **closest to $\\mu$**, so
$$\\lVert v^{(k)} - (\\pm q_J)\\rVert = O\\!\\left(\\left|\\tfrac{\\mu - \\lambda_J}{\\mu - \\lambda_K}\\right|^k\\right), \\quad |\\lambda^{(k)} - \\lambda_J| = O\\!\\left(\\left|\\tfrac{\\mu - \\lambda_J}{\\mu - \\lambda_K}\\right|^{2k}\\right),$$
with $\\lambda_K$ the second-closest. Each step **solves** $(A - \\mu I)w = v^{(k-1)}$ (factor once, then reuse the factorization); it never forms the inverse.`,
    pitfall:
      "When μ is very close to the target eigenvalue, A − μI is nearly singular and the solve has a huge error. That's harmless: the error lies almost entirely along the target eigenvector, exactly the direction we want, and normalization removes the size.",
    related: ["mit18335-eig-rayleigh-quotient-iteration", "mit18335-eig-qr-algorithm-simultaneous-iteration", "mit18335-errors-newton-quadratic-convergence", "mit18335-krylov-krylov-arnoldi"],
  },
  {
    id: "mit18335-eig-rayleigh-quotient-iteration",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Why is the Rayleigh quotient r(x) = xᵀAx/xᵀx a quadratically accurate eigenvalue estimate for symmetric A, and why does Rayleigh-quotient iteration converge cubically?",
    back: `**The Rayleigh quotient** of a real symmetric $A$:
- for an eigenvector $x$, $r(x) = \\lambda$;
- for general $x$, $r(x)$ is the $\\alpha$ minimizing $\\lVert Ax - \\alpha x\\rVert_2$ (the least-squares "eigenvalue" for that vector);
- $\\nabla r(x) = \\frac{2}{x^Tx}(Ax - r(x)x)$, so $x \\neq 0$ is an eigenvector **iff** $\\nabla r(x) = 0$: eigenvectors are the stationary points of $r$.

**Quadratic accuracy.** $r$ is smooth with $\\nabla r(q_J) = 0$, so a first-order error in the vector produces only a second-order error in the value:
$$r(x) - r(q_J) = O(\\lVert x - q_J\\rVert^2) \\text{ as } x \\to q_J.$$
(For Hermitian matrices the eigenvalue estimate has a much smaller error than the eigenvector, because the eigenvalue is an extremum.)

**Rayleigh-quotient iteration:** inverse iteration with the shift updated every step to the current estimate,
$$(A - \\lambda^{(k-1)}I)w = v^{(k-1)}, \\quad v^{(k)} = w/\\lVert w\\rVert, \\quad \\lambda^{(k)} = r(v^{(k)}).$$

**Cubic convergence.** Suppose $\\lVert v^{(k)} - q_J\\rVert \\leq \\epsilon$. Then $|\\lambda^{(k)} - \\lambda_J| = O(\\epsilon^2)$ by quadratic accuracy. One inverse-iteration step with shift $\\mu = \\lambda^{(k)}$ shrinks the vector error by a factor $O(|\\mu - \\lambda_J|)$:
$$\\lVert v^{(k+1)} - q_J\\rVert = O(|\\lambda^{(k)} - \\lambda_J|\\,\\lVert v^{(k)} - q_J\\rVert) = O(\\epsilon^3).$$
Likewise $|\\lambda^{(k+1)} - \\lambda_J| = O(|\\lambda^{(k)} - \\lambda_J|^3)$. **Cubic**: the number of correct digits roughly triples each step.`,
    related: ["mit18335-eig-power-inverse-iteration", "mit18335-eig-shifted-qr-algorithm", "mit18335-errors-two-norm-rayleigh-quotient"],
  },
  {
    id: "mit18335-eig-qr-algorithm-simultaneous-iteration",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the unshifted QR algorithm (A⁽ᵏ⁻¹⁾ = Q⁽ᵏ⁾R⁽ᵏ⁾, A⁽ᵏ⁾ = R⁽ᵏ⁾Q⁽ᵏ⁾) and prove it is equivalent to simultaneous iteration: Aᵏ = Q̲⁽ᵏ⁾R̲⁽ᵏ⁾ with Q̲⁽ᵏ⁾ = Q⁽¹⁾⋯Q⁽ᵏ⁾.",
    back: `**"Pure" QR algorithm:** factor, then multiply in reverse order:
$$A^{(0)} = A, \\qquad Q^{(k)}R^{(k)} = A^{(k-1)}, \\qquad A^{(k)} = R^{(k)}Q^{(k)}.$$
Each step is a similarity, $A^{(k)} = Q^{(k)T}A^{(k-1)}Q^{(k)}$, and under mild assumptions $A^{(k)}$ converges to Schur form (diagonal if $A$ is symmetric).

**Simultaneous iteration** = power iteration on $n$ vectors at once, **re-orthonormalizing every step** (the plain columns of $A^kV^{(0)}$ become hopelessly ill-conditioned, as all of them align with $q_1$): $Z = A\\underline{Q}^{(k-1)}$, $\\underline Q^{(k)}R^{(k)} = Z$. Under the assumptions that the leading $n + 1$ eigenvalues have distinct magnitudes and the leading principal minors of $\\hat Q^TV^{(0)}$ are nonzero, column $j$ converges to $\\pm q_j$ at rate $O(C^k)$ with $C = \\max_{k\\leq n}|\\lambda_{k+1}|/|\\lambda_k|$.

**Claim.** With $\\underline Q^{(0)} = I$, both processes produce $A^k = \\underline Q^{(k)}\\underline R^{(k)}$ (where $\\underline R^{(k)} = R^{(k)}\\cdots R^{(1)}$) and $A^{(k)} = \\underline Q^{(k)T}A\\,\\underline Q^{(k)}$.

**Proof** (induction; $k = 0$ is trivial).
- *Simultaneous iteration:* $A^k = A\\underline Q^{(k-1)}\\underline R^{(k-1)} = \\underline Q^{(k)}R^{(k)}\\underline R^{(k-1)} = \\underline Q^{(k)}\\underline R^{(k)}$.
- *QR algorithm:* by the induction hypothesis $A^{(k-1)} = \\underline Q^{(k-1)T}A\\underline Q^{(k-1)}$, i.e. $A\\underline Q^{(k-1)} = \\underline Q^{(k-1)}A^{(k-1)}$. Hence
$$A^k = A\\underline Q^{(k-1)}\\underline R^{(k-1)} = \\underline Q^{(k-1)}A^{(k-1)}\\underline R^{(k-1)} = \\underline Q^{(k-1)}Q^{(k)}R^{(k)}\\underline R^{(k-1)} = \\underline Q^{(k)}\\underline R^{(k)},$$
and $A^{(k)} = Q^{(k)T}A^{(k-1)}Q^{(k)} = \\underline Q^{(k)T}A\\underline Q^{(k)}$. $\\blacksquare$

**Why it's better than factoring $A^k$:** QR-factoring $A^k$ directly would in principle give the eigenvectors in order of decreasing $|\\lambda|$, but roundoff kills it. The QR algorithm gets the same subspaces while only ever **multiplying by unitary matrices**, so it is well conditioned and the eigenvalues come out accurately.`,
    related: ["mit18335-eig-power-inverse-iteration", "mit18335-eig-shifted-qr-algorithm", "mit18335-eig-hessenberg-reduction"],
  },

  // --- Lecture 17: Shifted QR and Rayleigh quotients ---
  {
    id: "mit18335-eig-shifted-qr-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why does the QR algorithm also behave like inverse iteration, and how do the Rayleigh-quotient and Wilkinson shifts, plus deflation, make the practical algorithm fast?",
    back: `**QR is also inverse iteration.** For symmetric $A$, inverting $A^k = \\underline Q^{(k)}\\underline R^{(k)}$ gives $A^{-k} = \\underline Q^{(k)}(\\underline R^{(k)})^{-T}$. With the flip permutation $P$ (ones on the anti-diagonal), $A^{-k}P = [\\underline Q^{(k)}P][P(\\underline R^{(k)})^{-T}P]$ is a QR factorization, so QR is simultaneous iteration on $A^{-1}$ too. In particular the **last column** of $\\underline Q^{(k)}$ evolves as in inverse iteration, which means **shifts** accelerate it.

**Shifted QR:**
$$Q^{(k)}R^{(k)} = A^{(k-1)} - \\mu^{(k)}I, \\qquad A^{(k)} = R^{(k)}Q^{(k)} + \\mu^{(k)}I.$$
Still a similarity, $A^{(k)} = \\underline Q^{(k)T}A\\underline Q^{(k)}$, and now $(A - \\mu^{(k)}I)\\cdots(A - \\mu^{(1)}I) = \\underline Q^{(k)}\\underline R^{(k)}$.

**Rayleigh-quotient shift:** $\\mu^{(k)} = A^{(k-1)}_{mm}$, which *is* the Rayleigh quotient of the last column of $\\underline Q^{(k-1)}$ (since $A^{(k-1)} = \\underline Q^{(k-1)T}A\\underline Q^{(k-1)}$). This is Rayleigh-quotient iteration on that column: **cubic** convergence. But it can fail, e.g. when two eigenvalues are symmetric about the shift ($\\pm\\lambda$).

**Wilkinson shift:** take the eigenvalue of the trailing $2\\times2$ block $\\begin{pmatrix}a_{m-1} & b_{m-1}\\\\ b_{m-1} & a_m\\end{pmatrix}$ that is closer to $a_m$:
$$\\mu = a_m - \\frac{\\operatorname{sign}(\\delta)\\,b_{m-1}^2}{|\\delta| + \\sqrt{\\delta^2 + b_{m-1}^2}}, \\qquad \\delta = \\frac{a_{m-1} - a_m}{2}.$$
It always converges, at worst quadratically.

**Practical algorithm:** first reduce to tridiagonal (Hessenberg) form, so each QR step costs $O(m)$ ($O(m^2)$). Iterate the shifted step. When an off-diagonal entry $A_{j,j+1}$ becomes negligible, set it to zero, **deflate** into two independent blocks $\\begin{pmatrix}A_1 & 0\\\\ 0 & A_2\\end{pmatrix}$, and recurse on each.

**Stability:** backwards stable, $\\tilde Q\\tilde\\Lambda\\tilde Q^T = A + \\delta A$ with $\\lVert\\delta A\\rVert/\\lVert A\\rVert = O(\\epsilon_{\\text{machine}})$, including the Hessenberg reduction. For normal matrices $|\\tilde\\lambda_j - \\lambda_j| \\leq \\lVert\\delta A\\rVert_2$, so $|\\tilde\\lambda_j - \\lambda_j|/\\lVert A\\rVert = O(\\epsilon_{\\text{machine}})$.

**Beyond this:** for eigenvectors as well, divide-and-conquer is more efficient. For the SVD, **Golub–Kahan bidiagonalization** plays the role of the Hessenberg step. In practice you call LAPACK. What matters is the structure: these algorithms look nothing like characteristic-polynomial root finding.`,
    code: `def practical_qr_eigvals(T, tol=1e-14):
    """Eigenvalues of a real symmetric tridiagonal T (Wilkinson shift + deflation)."""
    T = T.astype(float).copy()
    m = T.shape[0]
    if m == 1:
        return [T[0, 0]]
    while abs(T[m-1, m-2]) > tol * (abs(T[m-1, m-1]) + abs(T[m-2, m-2])):
        a, b, c = T[m-2, m-2], T[m-1, m-2], T[m-1, m-1]
        d = (a - c) / 2
        s = 1.0 if d >= 0 else -1.0
        mu = c - s * b * b / (abs(d) + np.hypot(d, b))
        Q, R = np.linalg.qr(T - mu * np.eye(m))  # dense for clarity; real codes use m-1 Givens rotations
        T = R @ Q + mu * np.eye(m)
    return practical_qr_eigvals(T[:m-1, :m-1], tol) + [T[m-1, m-1]]`,
    related: ["mit18335-eig-qr-algorithm-simultaneous-iteration", "mit18335-eig-rayleigh-quotient-iteration", "mit18335-eig-hessenberg-reduction", "mit18335-qr-givens-rotations"],
  },
];
