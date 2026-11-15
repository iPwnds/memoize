// MIT 18.335J Introduction to Numerical Methods (Spring 2019, Steven G.
// Johnson) — Lectures 7-11 (QR part): the SVD and conditioning, least
// squares, Gram-Schmidt (classical and modified), Householder reflectors,
// Givens rotations and Householder QR. Sourced from the per-lecture OCW
// summaries; Per-Olof Persson's "Gram-Schmidt Orthogonalization" slides
// (the Lec 9 reading; numbered "Lecture 5" in his 2006 course) and
// "Householder Reflectors and Givens Rotations" slides (Lec 10 handout);
// and the Problem Set 2 solutions (SVD exercises; backwards stability of
// multiplying by unitary matrices, which the Lec 10 summary cites). Lec 7
// and 8 were guest lectures (Alan Edelman) with one-paragraph summaries,
// so their cards lean on the Lec 5 summary and the Pset 2 solutions.
// The Lec 11 cache material is in src/data/mit18335-lu.ts.
//
// Every example recomputed: the classical-vs-modified Gram-Schmidt example
// (q₂ᵀq₃ = 1/2 vs 0, checked in double precision with ε = 10⁻⁸), and the
// flop counts 2mn² (Gram-Schmidt), 2mn² − 2n³/3 (Householder, sympy sum),
// 3mn² − n³ (Givens, leading-order sum).
//
// Corrections and additions (no outright errors found in these sources):
// - Added beyond the source: the explicit least-squares formulas via QR
//   (R̂x = Q̂*b) and via the SVD (x = VΣ̂⁻¹Û*b); the normal-equations cost
//   mn² + n³/3 (Cholesky) in the comparison table; the general statement
//   that the distance to the nearest rank-r matrix is σᵣ₊₁ (Pset 2 only
//   uses the special case); the non-normal pitfall example
//   [[1, 100], [0, 1]] (σ₁/σ₂ ≈ 10002, recomputed); the Givens per-column
//   cost derivation (the slide states only the total 3mn² − n³); and the
//   O(m²) Givens QR of a Hessenberg matrix.
// - The ±σ eigen-embedding and the real-SVD fact are Pset 2 problem 4.
import type { Card } from "./types";

const MODULE = "mit18335-qr";

export const mit18335QrCards: Card[] = [
  // --- Lecture 7: The SVD, its applications, and condition numbers ---
  {
    id: "mit18335-qr-svd-norms-conditioning",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the SVD A = UΣV* give ‖A‖₂, ‖A⁻¹‖₂ and κ₂(A)? Why is it better than reasoning through the eigenvalues of A*A?",
    back: `The **singular value decomposition** of $A \\in \\mathbb C^{m\\times n}$ is
$$A = U\\Sigma V^*, \\qquad U, V \\text{ unitary}, \\quad \\Sigma = \\operatorname{diag}(\\sigma_1 \\geq \\sigma_2 \\geq \\cdots \\geq 0).$$
Column by column: $Av_i = \\sigma_i u_i$ and $A^*u_i = \\sigma_i v_i$. The $\\sigma_i^2$ are the eigenvalues of $A^*A$ (and of $AA^*$), and the $v_i$ / $u_i$ are their eigenvectors.

**Norms and conditioning, read off directly** (unitary factors don't change 2-norms):
$$\\lVert A\\rVert_2 = \\sigma_1, \\qquad \\lVert A^{-1}\\rVert_2 = \\frac{1}{\\sigma_n}, \\qquad \\kappa_2(A) = \\frac{\\sigma_1}{\\sigma_n}, \\qquad \\lVert A\\rVert_F = \\sqrt{\\textstyle\\sum\\sigma_i^2}.$$
Geometrically, $A$ maps the unit sphere to an ellipsoid with semi-axes $\\sigma_iu_i$, and $\\kappa_2$ is the ratio of its longest to its shortest axis.

**Why not via $A^*A$** (the Lec 5 route): it means solving two eigenproblems, $\\kappa(A^*A) = \\kappa(A)^2$ makes forming $A^*A$ numerically bad, and it says little about $A$ itself. The SVD is one factorization of $A$, computed stably without ever forming $A^*A$.

**Facts from Problem Set 2:**
- **Distance to lower rank:** perturbing $\\Sigma$ by adding small singular values $\\epsilon/2$ makes any rank-deficient $A$ full rank with $\\lVert A - B\\rVert_2 = \\epsilon/2$. In general the 2-norm distance from $A$ to the nearest matrix of rank $r$ is $\\sigma_{r+1}$, so $\\sigma_n$ is the distance to singularity, and $1/\\kappa_2 = \\sigma_n/\\sigma_1$ is the *relative* distance.
- **Real $A$ has a real SVD**: the $u_i$ are eigenvectors of the real symmetric $AA^T$, and real or imaginary parts of complex eigenvectors are again eigenvectors.

Applications covered in lecture include **principal component analysis** (the leading singular vectors of a centered data matrix).`,
    pitfall:
      "Singular values are not the absolute values of the eigenvalues unless A is normal. For a non-normal matrix like [[1, 100], [0, 1]], both eigenvalues are 1 but σ₁ ≈ 100 and σ₂ ≈ 0.01, so κ₂ ≈ 10⁴.",
    related: ["mit1806-pd-svd-svd", "mit18335-errors-two-norm-rayleigh-quotient", "mit18335-errors-matrix-condition-number", "mit18335-qr-hermitian-embedding-svd"],
  },
  {
    id: "mit18335-qr-hermitian-embedding-svd",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Show that the Hermitian block matrix [[0, A*], [A, 0]] (A square) has eigenvalues ±σᵢ, and give its eigenvectors in terms of the SVD of A.",
    back: `Let $A = U\\Sigma V^*$, so $AV = U\\Sigma$ and $A^*U = V\\Sigma$. Then
$$\\begin{pmatrix}0 & A^*\\\\ A & 0\\end{pmatrix}\\begin{pmatrix}V\\\\ \\pm U\\end{pmatrix} = \\begin{pmatrix}\\pm A^*U\\\\ AV\\end{pmatrix} = \\begin{pmatrix}\\pm V\\Sigma\\\\ U\\Sigma\\end{pmatrix} = \\pm\\begin{pmatrix}V\\\\ \\pm U\\end{pmatrix}\\Sigma.$$
So each $(v_i; \\pm u_i)$ is an eigenvector with eigenvalue $\\pm\\sigma_i$. These $2n$ vectors are mutually orthogonal and each has norm $\\sqrt 2$, giving the diagonalization
$$\\begin{pmatrix}0 & A^*\\\\ A & 0\\end{pmatrix} = Q\\begin{pmatrix}\\Sigma & \\\\ & -\\Sigma\\end{pmatrix}Q^*, \\qquad Q = \\frac{1}{\\sqrt 2}\\begin{pmatrix}V & V\\\\ U & -U\\end{pmatrix}. \\;\\blacksquare$$

**Why it's useful:** it turns an SVD question into a **Hermitian eigenproblem**, without squaring anything. Everything known about Hermitian eigenvalues (real, orthogonal eigenvectors, min–max, stable algorithms) transfers to singular values, and the condition number is *not* squared as it would be with $A^*A$. The same block structure reappears in Lec 23, where biCG is derived as CG on a matrix of this form.`,
    related: ["mit18335-qr-svd-norms-conditioning", "mit18335-errors-two-norm-rayleigh-quotient"],
  },

  // --- Lecture 8: Linear regression and the generalized SVD ---
  {
    id: "mit18335-qr-least-squares-three-ways",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare three ways to solve the least-squares problem min ‖Ax − b‖₂ (A is m×n, m > n, full rank): normal equations, QR, and SVD.",
    back: `The minimizer satisfies $A^*(Ax - b) = 0$: the residual is orthogonal to the column space of $A$.

| Method | Solve | Cost (leading) | Accuracy |
|---|---|---|---|
| **Normal equations** | $A^*Ax = A^*b$ (by Cholesky) | $mn^2 + \\frac13n^3$ | error amplified by $\\kappa(A^*A) = \\kappa(A)^2$ |
| **QR** ($A = \\hat Q\\hat R$) | $\\hat Rx = \\hat Q^*b$ by back-substitution | $2mn^2 - \\frac23n^3$ (Householder) | stable; error governed by $\\kappa(A)$ |
| **SVD** ($A = \\hat U\\hat\\Sigma V^*$) | $x = V\\hat\\Sigma^{-1}\\hat U^*b$ | larger constant | stable; also handles rank deficiency (drop tiny $\\sigma_i$) |

**Why QR works**: $\\hat Q$ has orthonormal columns spanning $\\operatorname{col}(A)$, so the projection of $b$ is $\\hat Q\\hat Q^*b$, and $A^*Ax = A^*b$ becomes $\\hat R^*\\hat Rx = \\hat R^*\\hat Q^*b$, i.e. $\\hat Rx = \\hat Q^*b$ ($\\hat R$ invertible). No $A^*A$ is ever formed, and multiplying by unitary matrices doesn't amplify errors.

**Many viewpoints on one problem** (the Lec 8 theme): linear algebra (projection onto $\\operatorname{col}(A)$), optimization (minimize a convex quadratic), statistics (maximum likelihood under Gaussian noise), machine learning (linear regression). The **generalized SVD** handles pairs of matrices, e.g. regularized problems $\\min\\lVert Ax - b\\rVert^2 + \\lVert Bx\\rVert^2$.`,
    pitfall:
      "The normal equations look cheapest and simplest, but squaring κ means a problem with κ(A) = 10⁸ becomes κ = 10¹⁶ — no correct digits in double precision — even though QR would still give about 8.",
    related: ["mit18335-qr-normal-equations-squaring", "mit18335-qr-householder-qr-algorithm", "mit1806-orthogonality-least-squares-line", "mit1806-pd-svd-pseudoinverse"],
  },

  // --- Lecture 9: Solving the normal equations by QR and Gram-Schmidt ---
  {
    id: "mit18335-qr-normal-equations-squaring",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that κ₂(A*A) = κ₂(A)² for a full-column-rank A, and explain what it means for solving least squares via the normal equations.",
    back: `**Proof.** Let $A = U\\Sigma V^*$ (reduced: $\\hat U$ is $m\\times n$, $\\hat\\Sigma$ is $n\\times n$ with $\\sigma_n > 0$). Then
$$A^*A = V\\hat\\Sigma\\hat U^*\\hat U\\hat\\Sigma V^* = V\\hat\\Sigma^2V^*,$$
which is an SVD (and eigendecomposition) of the Hermitian positive-definite $A^*A$ with singular values $\\sigma_i^2$. Hence
$$\\kappa_2(A^*A) = \\frac{\\sigma_1^2}{\\sigma_n^2} = \\kappa_2(A)^2. \\;\\blacksquare$$

**Example:** $A = \\begin{pmatrix}1 & 2\\\\ 3 & 4\\end{pmatrix}$ has $\\sigma^2 = 15 \\pm \\sqrt{221}$, so $\\kappa_2(A) \\approx 14.93$ and $\\kappa_2(A^TA) \\approx 223.0$.

**Consequence.** A backwards-stable solve of $A^*Ax = A^*b$ has forward error about $\\kappa(A)^2\\epsilon_{\\text{machine}}$: you lose *twice* as many digits as the least-squares problem itself warrants. (Forming $A^*A$ in floating point can also destroy information outright: entries of size $\\epsilon$ in $A$ become $\\epsilon^2$ next to 1 and round away.)

The fix is to work with $A$ itself, via an **orthonormal basis for its column space**, i.e. a QR factorization, which is what Gram–Schmidt and Householder compute.`,
    related: ["mit18335-qr-least-squares-three-ways", "mit18335-errors-two-norm-rayleigh-quotient", "mit18335-qr-classical-gram-schmidt", "mit1806-orthogonality-ata-invertible"],
  },
  {
    id: "mit18335-qr-classical-gram-schmidt",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Write classical Gram–Schmidt for the reduced QR factorization A = Q̂R̂, derive its 2mn² flop count, and explain why (qqᵀ)a and q(qᵀa) cost so differently.",
    back: `**Gram–Schmidt** builds orthonormal $q_1, \\ldots, q_n$ spanning the same nested spaces as the columns $a_1, \\ldots, a_n$: subtract from $a_j$ its projections onto the earlier $q$'s, then normalize. The coefficients form the upper-triangular $\\hat R$, with $r_{ij} = q_i^*a_j$ and $r_{jj} = \\lVert v_j\\rVert_2$, so $A = \\hat Q\\hat R$.

In projector form, $q_j = \\frac{P_ja_j}{\\lVert P_ja_j\\rVert}$ with $P_j = I - \\hat Q_{j-1}\\hat Q_{j-1}^*$, the orthogonal projector onto the complement of $\\operatorname{span}(q_1, \\ldots, q_{j-1})$ (rank $m - j + 1$).

**Flop count** (each $+, -, \\times, \\div, \\sqrt{\\ }$ is one flop): the inner loop does a dot product ($\\approx 2m$) and an update ($2m$), so $4m$ flops per $(i, j)$ pair with $i < j$:
$$\\sum_{j=1}^n\\sum_{i=1}^{j-1}4m \\approx 4m\\cdot\\frac{n^2}{2} = 2mn^2.$$

**Parentheses matter.** The projection $qq^Ta$ computed as $(qq^T)a$ first forms an $m\\times m$ matrix: $O(m^2)$ work. As $q(q^Ta)$ it is a dot product and a scaling: $O(m)$. Matrix multiplication is associative, so both give the same answer in exact arithmetic, but never form an outer product just to apply it.`,
    code: `def classical_gram_schmidt(A):
    m, n = A.shape
    Q = np.zeros((m, n)); R = np.zeros((n, n))
    for j in range(n):
        v = A[:, j].copy()
        for i in range(j):
            R[i, j] = Q[:, i] @ A[:, j]   # project the ORIGINAL column
            v -= R[i, j] * Q[:, i]
        R[j, j] = np.linalg.norm(v)
        Q[:, j] = v / R[j, j]
    return Q, R`,
    pitfall:
      "Classical Gram–Schmidt is unstable: with nearly dependent columns, the computed q's can lose orthogonality completely (q₂ᵀq₃ = 1/2 in the course example). Use modified Gram–Schmidt or Householder.",
    related: ["mit18335-qr-cgs-vs-mgs", "mit18335-qr-normal-equations-squaring", "mit1806-orthogonality-gram-schmidt", "mit1806-orthogonality-qr-factorization"],
  },

  // --- Lecture 10: Modified Gram-Schmidt and Householder QR ---
  {
    id: "mit18335-qr-cgs-vs-mgs",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Run classical and modified Gram–Schmidt on a₁ = (1, ε, 0, 0), a₂ = (1, 0, ε, 0), a₃ = (1, 0, 0, ε), where 1 + ε² rounds to 1. Compare q₂ᵀq₃.",
    back: `**The one-line difference:** classical GS uses $r_{ij} = q_i^*a_j$ (the original column), modified GS uses $r_{ij} = q_i^*v_j$ (the partially orthogonalized vector). Equivalently, MGS applies the rank-one projectors one after another, $v_j = P_{q_{j-1}}\\cdots P_{q_2}P_{q_1}a_j$ with $P_q = I - qq^*$, instead of $P_ja_j$ all at once.

**Both start the same way** (using $\\sqrt{1 + \\epsilon^2} \\to 1$):
- $q_1 = (1, \\epsilon, 0, 0)$.
- $r_{12} = 1$, $v_2 = a_2 - q_1 = (0, -\\epsilon, \\epsilon, 0)$, $q_2 = (0, -1, 1, 0)/\\sqrt2$.
- $r_{13} = 1$, $v_3 = a_3 - q_1 = (0, -\\epsilon, 0, \\epsilon)$.

**They differ at $r_{23}$:**

| | $r_{23}$ | $v_3$ after | $q_3$ | $q_2^Tq_3$ |
|---|---|---|---|---|
| **Classical** | $q_2^Ta_3 = 0$ | $(0, -\\epsilon, 0, \\epsilon)$ | $(0, -1, 0, 1)/\\sqrt2$ | $\\frac12$ |
| **Modified** | $q_2^Tv_3 = \\epsilon/\\sqrt2$ | $(0, -\\frac\\epsilon2, -\\frac\\epsilon2, \\epsilon)$ | $(0, -1, -1, 2)/\\sqrt6$ | $0$ |

Running both in double precision with $\\epsilon = 10^{-8}$ reproduces this: CGS gives $q_2^Tq_3 \\approx 0.5$, MGS about $10^{-16}$.

**Why:** CGS projects the *original* $a_3$, which carries the rounding error made when $q_1$ was subtracted. MGS projects the *current* $v_3$, so the error from the previous step gets projected out too. MGS mostly fixes the problem: the product $\\tilde Q\\tilde R$ it returns is backwards stable, though $\\tilde Q$ can still drift from orthogonal when $A$ is ill-conditioned.

Implementation detail: in MGS, once $q_i$ is known, $P_{q_i}$ can be applied to **all** remaining $v_j$ at once (loop order $i$ outer, $j$ inner). The cost is the same $2mn^2$.`,
    related: ["mit18335-qr-classical-gram-schmidt", "mit18335-qr-triangular-vs-orthogonal", "mit18335-qr-householder-reflectors"],
  },
  {
    id: "mit18335-qr-triangular-vs-orthogonal",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast Gram–Schmidt as triangular orthogonalization (A R₁R₂⋯Rₙ = Q̂) with Householder as orthogonal triangularization (Qₙ⋯Q₂Q₁A = R). Why is the second inherently stable?",
    back: `**Gram–Schmidt multiplies $A$ on the right by triangular matrices.** Step $j$ divides column $j$ by $r_{jj}$ and subtracts multiples of it from later columns, which is right-multiplication by an upper-triangular $R_j$:
$$A\\,R_1R_2\\cdots R_n = \\hat Q, \\qquad R_1R_2\\cdots R_n = \\hat R^{-1}.$$
"**Triangular orthogonalization**". The trouble: those triangular factors can be **badly conditioned** (nearly dependent columns make $r_{jj}$ tiny), so errors in them are amplified and $\\hat Q$ loses orthogonality.

**Householder multiplies $A$ on the left by unitary matrices.** $Q_k$ zeroes column $k$ below the diagonal and leaves the earlier zeros alone:
$$\\underbrace{Q_n\\cdots Q_2Q_1}_{Q^*}A = R.$$
"**Orthogonal triangularization**". Each $Q_k$ is exactly unitary up to rounding, so $\\kappa_2(Q_k) = 1$: nothing gets amplified.

**The stability fact behind it** (Problem Set 2): computing $Q_k\\cdots Q_1A$ by multiplying by unitary matrices one at a time is **backwards stable**, i.e. $\\widetilde{Q_k\\cdots Q_1A} = Q_k\\cdots Q_1(A + \\delta A)$ with $\\lVert\\delta A\\rVert = O(\\epsilon_{\\text{machine}})\\lVert A\\rVert$. By induction: one unitary multiply has forward error $O(\\epsilon)\\lVert A\\rVert$ and $\\lVert Q^*\\cdot\\rVert_2 = \\lVert\\cdot\\rVert_2$, and the errors add. (In contrast, multiplying by a rank-1 matrix is *not* backwards stable: the exact product has rank 1, but the computed one generally doesn't.)

The surface pattern looks like Gaussian elimination (zero out below the diagonal column by column), but elimination uses triangular, not unitary, operations.`,
    related: ["mit18335-qr-householder-reflectors", "mit18335-qr-cgs-vs-mgs", "mit18335-errors-vector-matrix-norms"],
  },
  {
    id: "mit18335-qr-householder-reflectors",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Construct the Householder reflector F that maps a vector x to a multiple of e₁. Why choose v = sign(x₁)‖x‖e₁ + x rather than ‖x‖e₁ − x?",
    back: `**Goal:** a unitary $F$ with $Fx = \\pm\\lVert x\\rVert e_1$ (all entries but the first zeroed). Embedded as $Q_k = \\begin{pmatrix}I & 0\\\\ 0 & F\\end{pmatrix}$ with $I$ of size $(k-1)$, it zeroes column $k$ below the diagonal without touching earlier rows.

**Construction: reflect across a hyperplane.** Let $v = \\lVert x\\rVert e_1 - x$ and reflect across the hyperplane $H \\perp v$:
$$F = I - 2\\frac{vv^*}{v^*v}.$$
Compare the projector $P_{\\perp v} = I - \\frac{vv^*}{v^*v}$, which only goes *to* the hyperplane. The reflector goes twice as far, to the mirror image. $F$ is Hermitian and unitary ($F^2 = I$), and (for real $x$) $Fx = \\lVert x\\rVert e_1$.

**Choice of sign.** Any target $z\\lVert x\\rVert e_1$ with $|z| = 1$ works; for real $x$ the two candidates are $\\pm\\lVert x\\rVert e_1$. Pick the one **farther from $x$**:
$$v = \\operatorname{sign}(x_1)\\lVert x\\rVert e_1 + x,$$
which reflects $x$ to $-\\operatorname{sign}(x_1)\\lVert x\\rVert e_1$. If instead $x$ is nearly parallel to $+e_1$ and we used $\\lVert x\\rVert e_1 - x$, then $v$ would be a **difference of nearly equal vectors**: catastrophic cancellation, and $v/\\lVert v\\rVert$ would be garbage. The chosen sign makes $\\lVert v\\rVert \\geq \\lVert x\\rVert$.`,
    pitfall:
      "sign(0) must be taken as +1 here. MATLAB's sign(0) returns 0, which would make v = x and fail to zero anything when x₁ = 0.",
    related: ["mit18335-qr-triangular-vs-orthogonal", "mit18335-qr-householder-qr-algorithm", "mit18335-qr-givens-rotations", "mit1806-orthogonality-projection-onto-subspace", "mit18335-eig-hessenberg-reduction"],
  },
  {
    id: "mit18335-qr-givens-rotations",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "How does a Givens rotation zero a single entry, in what order does Givens QR sweep a 4×3 matrix, and how does its cost compare with Householder?",
    back: `A **Givens rotation** acts on just two rows $i, j$:
$$\\begin{pmatrix}\\cos\\theta & -\\sin\\theta\\\\ \\sin\\theta & \\cos\\theta\\end{pmatrix}\\begin{pmatrix}x_i\\\\ x_j\\end{pmatrix} = \\begin{pmatrix}\\sqrt{x_i^2 + x_j^2}\\\\ 0\\end{pmatrix}, \\qquad \\cos\\theta = \\frac{x_i}{\\sqrt{x_i^2 + x_j^2}}, \\quad \\sin\\theta = \\frac{-x_j}{\\sqrt{x_i^2 + x_j^2}}.$$
Check the second row: $x_i\\sin\\theta + x_j\\cos\\theta = \\frac{-x_ix_j + x_jx_i}{\\sqrt{\\cdot}} = 0$. Like a reflector it is unitary, so it never amplifies errors.

**Givens QR sweep** for a $4\\times3$ matrix: zero each column **from the bottom up**, rotating adjacent rows:
- column 1: rows $(3,4)$, then $(2,3)$, then $(1,2)$;
- column 2: rows $(3,4)$, then $(2,3)$;
- column 3: rows $(3,4)$.

Each rotation only mixes two rows, so the zeros made in earlier columns survive (both rows are already zero there).

**Cost.** Zeroing the $m - k$ entries of column $k$ takes $m - k$ rotations, each updating two rows of length about $n - k$ at 6 flops per column:
$$\\sum_{k=1}^n 6(m-k)(n-k) \\approx 3mn^2 - n^3,$$
about **50% more** than Householder's $2mn^2 - \\frac23n^3$.

**When Givens wins:** when only a few entries need zeroing. QR of an upper-Hessenberg matrix (as in the QR eigenvalue algorithm) needs just $m - 1$ rotations, $O(m^2)$ work instead of $O(m^3)$.`,
    related: ["mit18335-qr-householder-reflectors", "mit18335-qr-householder-qr-algorithm", "mit18335-eig-shifted-qr-algorithm"],
  },

  // --- Lecture 11: Householder QR finished (cache material in mit18335-lu) ---
  {
    id: "mit18335-qr-householder-qr-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Write Householder QR, derive its 2mn² − 2n³/3 flop count, and explain how to apply Q* or Q without ever forming Q.",
    back: `Overwrite $A$ ($m\\times n$, $m \\geq n$) with $R$, storing the unit reflector vectors $v_k$.

**Flop count.** Each step's work is in the update of the $(m-k)\\times(n-k)$ trailing block: $2(m-k)(n-k)$ for the products $v_k^*A$, $(m-k)(n-k)$ for the outer product, and $(m-k)(n-k)$ for the subtraction. That's $4(m-k)(n-k)$ per step, and
$$\\sum_{k=1}^n 4(m-k)(n-k) = 2mn^2 - \\frac23n^3 + O(mn).$$
For square $A$ that's $\\frac43m^3$, twice Gaussian elimination's $\\frac23m^3$. For $m \\gg n$ it's the same $2mn^2$ as Gram–Schmidt, but stable.

**Never form $Q$ explicitly.** To solve least squares you need $Q^*b = Q_n\\cdots Q_1b$: apply the stored reflectors in order, $b_{k:m} \\leftarrow b_{k:m} - 2v_k(v_k^*b_{k:m})$, costing $O(mn)$. For $Qx = Q_1\\cdots Q_nx$ loop $k = n$ down to $1$. To get $Q$ itself (rarely needed), apply this to the columns of $I$.

**Stability:** a product of unitary operations, hence backwards stable: $\\tilde Q\\tilde R = A + \\delta A$, $\\lVert\\delta A\\rVert/\\lVert A\\rVert = O(\\epsilon_{\\text{machine}})$. The computed $\\tilde Q$ is orthogonal to working precision, even for ill-conditioned $A$ (unlike Gram–Schmidt).`,
    code: `def householder_qr(A):
    A = A.astype(float).copy()
    m, n = A.shape
    V = []
    for k in range(n):
        x = A[k:, k]
        v = x.copy()
        v[0] += (1.0 if x[0] >= 0 else -1.0) * np.linalg.norm(x)  # sign(0) = +1
        v /= np.linalg.norm(v)
        A[k:, k:] -= 2.0 * np.outer(v, v @ A[k:, k:])
        V.append(v)
    return V, np.triu(A[:n, :])

def apply_Qstar(V, b):
    b = b.astype(float).copy()
    for k, v in enumerate(V):
        b[k:] -= 2.0 * v * (v @ b[k:])
    return b`,
    related: ["mit18335-qr-householder-reflectors", "mit18335-qr-least-squares-three-ways", "mit18335-qr-triangular-vs-orthogonal"],
  },
];
