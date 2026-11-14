// MIT 18.06SC Linear Algebra (Fall 2011, Gilbert Strang) — Unit III:
// Positive Definite Matrices and Applications (Lectures 25-31 and 33;
// Lectures 32 and 34 are the Quiz 3 and final reviews), the course's final
// module. Sourced from the course's own per-lecture summaries, read
// page-by-page, with every example recomputed exactly (sympy). Lecture 25
// covers symmetric matrices and the spectral theorem; Lecture 26 complex
// vectors, Hermitian/unitary matrices and the FFT; Lecture 27 tests for
// positive definiteness, completing the square, minima and ellipsoids;
// Lecture 28 AᵀA, similar matrices and Jordan form; Lecture 29 the SVD;
// Lecture 30 linear transformations and their matrices; Lecture 31 change of
// basis and image compression; Lecture 33 left/right inverses and the
// pseudoinverse. Corrections to the summaries: Lecture 29 says the columns of
// U and V are bases for the row and column spaces "respectively" — it's the
// reverse (V ↔ row space, U ↔ column space). Added beyond the summaries:
// the standard proof that a symmetric matrix's eigenvectors for distinct
// eigenvalues are orthogonal, and the rank-of-the-square argument showing
// the two 4×4 nilpotent Jordan matrices aren't similar. See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit1806-pd-svd";

export const mit1806PositiveDefiniteSvdCards: Card[] = [
  // --- Lecture 25: Symmetric matrices and positive definiteness ---
  {
    id: "mit1806-pd-svd-spectral-theorem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the spectral theorem for real symmetric matrices, and explain how it writes A as a combination of projections.",
    back: `**Spectral theorem** (the *principal axis theorem* in mechanics): a real symmetric matrix $A = A^T$ has
- **real eigenvalues**, and
- a **complete set of orthonormal eigenvectors**.

So the eigenvector matrix can be chosen **orthogonal**, $S = Q$ with $Q^{-1} = Q^T$:
$$A = Q\\Lambda Q^{-1} = Q\\Lambda Q^T.$$
Conversely, every matrix of the form $Q\\Lambda Q^T$ (real $\\Lambda$) is symmetric. The eigenvalues are the matrix's **spectrum**.

**A sum of projections**: multiply out column-times-row,
$$A = \\begin{bmatrix} q_1 & \\cdots & q_n \\end{bmatrix}\\begin{bmatrix} \\lambda_1 & & \\\\ & \\ddots & \\\\ & & \\lambda_n \\end{bmatrix}\\begin{bmatrix} q_1^T \\\\ \\vdots \\\\ q_n^T \\end{bmatrix} = \\lambda_1q_1q_1^T + \\lambda_2q_2q_2^T + \\cdots + \\lambda_nq_nq_n^T.$$
Each $q_kq_k^T$ is the projection matrix onto the line through $q_k$ (unit vector, so $q_k^Tq_k = 1$). **Every symmetric matrix is a combination of perpendicular projections**, weighted by its eigenvalues.

**Eigenvalue signs without computing eigenvalues**: for symmetric $A$, the number of **positive pivots** equals the number of **positive eigenvalues**. Applying this to $A - bI$ counts how many eigenvalues exceed any number $b$ — practical for huge matrices where solving $\\det(A - \\lambda I) = 0$ is hopeless.`,
    related: ["mit1806-pd-svd-symmetric-real-orthogonal", "mit1806-orthogonality-projection-onto-line", "mit1806-eigenvalues-diagonalization"],
  },
  {
    id: "mit1806-pd-svd-symmetric-real-orthogonal",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that a real symmetric matrix has real eigenvalues, and that its eigenvectors for distinct eigenvalues are orthogonal.",
    back: `**Real eigenvalues.** Let $A$ be real symmetric with $Ax = \\lambda x$ ($x \\neq 0$, possibly complex). Conjugate (bars denote complex conjugates; $A$ is real): $A\\bar{x} = \\bar{\\lambda}\\bar{x}$. Transpose and use $A^T = A$:
$$\\bar{x}^TA = \\bar{\\lambda}\\,\\bar{x}^T.$$
Multiply on the right by $x$: $\\bar{x}^TAx = \\bar{\\lambda}\\,\\bar{x}^Tx$. Separately, multiply $Ax = \\lambda x$ on the left by $\\bar{x}^T$: $\\bar{x}^TAx = \\lambda\\,\\bar{x}^Tx$. So
$$\\lambda\\,\\bar{x}^Tx = \\bar{\\lambda}\\,\\bar{x}^Tx.$$
And $\\bar{x}^Tx = |x_1|^2 + \\cdots + |x_n|^2 > 0$ for $x \\neq 0$, so $\\lambda = \\bar{\\lambda}$: **$\\lambda$ is real.** $\\blacksquare$
(The same conjugation step shows complex eigenvalues of any real matrix come in conjugate pairs.)

**Orthogonal eigenvectors.** Let $Ax = \\lambda x$ and $Ay = \\mu y$ with $\\lambda \\neq \\mu$ (real). Then
$$\\lambda\\,(x^Ty) = (Ax)^Ty = x^TA^Ty = x^TAy = \\mu\\,(x^Ty),$$
so $(\\lambda - \\mu)\\,x^Ty = 0$, and since $\\lambda \\neq \\mu$, **$x^Ty = 0$**. $\\blacksquare$

(For repeated eigenvalues one can still *choose* orthonormal eigenvectors — the full spectral theorem; the summary states it without proof.) For complex matrices the right condition is **Hermitian**, $\\bar{A}^T = A$.`,
    related: ["mit1806-pd-svd-spectral-theorem", "mit1806-pd-svd-complex-hermitian-unitary", "mit1806-eigenvalues-complex-and-repeated"],
  },

  // --- Lecture 26: Complex matrices; fast Fourier transform ---
  {
    id: "mit1806-pd-svd-complex-hermitian-unitary",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "How do length and inner product change for complex vectors? Define Hermitian and unitary matrices as the complex versions of symmetric and orthogonal.",
    back: `**Length**: $z^Tz$ fails for complex $z$ — e.g. $z = (1, i)$ gives $1 + i^2 = 0$, a nonzero vector of "length" 0. Conjugate first:
$$\\lVert z \\rVert^2 = \\bar{z}^Tz = |z_1|^2 + \\cdots + |z_n|^2, \\qquad \\lVert (1, i) \\rVert^2 = 1 + 1 = 2.$$
Notation: $z^H = \\bar{z}^T$ ("$z$ Hermitian"), so $\\lVert z \\rVert^2 = z^Hz$.

**Inner product**: $y^Hx = \\bar{y}_1x_1 + \\cdots + \\bar{y}_nx_n$.

| Real | Complex | Property |
|---|---|---|
| $A^T$ | $A^H = \\bar{A}^T$ | conjugate transpose |
| symmetric $A^T = A$ | **Hermitian** $A^H = A$ | real eigenvalues, orthogonal eigenvectors; diagonal entries must be real |
| orthogonal $Q^TQ = I$ | **unitary** $Q^HQ = I$ | orthonormal columns under $y^Hx$; preserves lengths |

Hermitian example: $\\begin{bmatrix} 2 & 3 + i \\\\ 3 - i & 5 \\end{bmatrix}$ — real diagonal, conjugate entries mirrored across it.

Complex numbers are unavoidable: even real matrices (rotations) have complex eigenvalues, and the most important complex matrix, the **Fourier matrix**, is the basis of the FFT.`,
    related: ["mit1806-pd-svd-fourier-matrix-fft", "mit1806-pd-svd-symmetric-real-orthogonal", "mit1806-orthogonality-orthonormal-orthogonal-matrices"],
  },
  {
    id: "mit1806-pd-svd-fourier-matrix-fft",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the Fourier matrix Fₙ, explain why (1/√n)Fₙ is unitary, and show how the FFT factorization of F₂ₙ cuts the cost from n² to about ½ n log₂ n.",
    back: `**Fourier matrix** (rows and columns numbered $0, \\ldots, n-1$): $(F_n)_{jk} = w^{jk}$ with $w = e^{2\\pi i/n}$, so $w^n = 1$ — every entry lies on the unit circle. For $n = 4$, $w = i$:
$$F_4 = \\begin{bmatrix} 1 & 1 & 1 & 1 \\\\ 1 & i & -1 & -i \\\\ 1 & -1 & 1 & -1 \\\\ 1 & -i & -1 & i \\end{bmatrix}.$$
Its columns are orthogonal (with the conjugated inner product), each of length $\\sqrt{n}$, so $\\frac{1}{\\sqrt n}F_n$ is **unitary**: $\\frac1nF_n^HF_n = I$. Inverting the transform is just multiplying by $\\bar{F}_n$ and dividing by $n$.

**Example**: an impulse $(1, 0, 0, 0)$ transforms to $(1, 1, 1, 1)$ — **all frequencies equally**. Applying $F_4$ again gives $(4, 0, 0, 0)$: back to the impulse, times $n = 4$.

**FFT**: write $w_n = e^{2\\pi i/n}$; since $w_{2n}^2 = w_n$, a size-$2n$ transform splits into two size-$n$ transforms:
$$F_{2n} = \\begin{bmatrix} I & D \\\\ I & -D \\end{bmatrix}\\begin{bmatrix} F_n & 0 \\\\ 0 & F_n \\end{bmatrix}P,$$
where $P$ separates even- and odd-indexed entries and $D = \\text{diag}(1, w_{2n}, \\ldots, w_{2n}^{n-1})$ holds powers of the **$2n$-th** root of unity $w_{2n} = e^{2\\pi i/2n}$. The outer factors cost only $O(n)$. Recursing all the way down: about $\\frac12n\\log_2 n$ multiplications instead of $n^2$.

For $n = 1024$: over a million vs. $\\frac12 \\cdot 1024 \\cdot 10 = 5120$ — **about 200× faster**. Possible only because $F_n$ has orthogonal columns with this special structure. (Gauss noticed the split, but not its significance.)`,
    complexity: {
      structure: "Discrete Fourier Transform (size n)",
      operations: [
        { op: "Direct multiplication by Fₙ", time: "O(n²)" },
        { op: "FFT (n a power of 2)", time: "≈ ½ n log₂ n multiplications", note: "O(n log n)" },
        { op: "Inverse transform", time: "O(n log n)", note: "conjugate, FFT, divide by n" },
      ],
    },
    related: ["mit1806-pd-svd-complex-hermitian-unitary", "mit1806-eigenvalues-fourier-series", "mit6046-dc-fft-algorithm"],
  },

  // --- Lecture 27: Positive definite matrices and minima ---
  {
    id: "mit1806-pd-svd-positive-definite-tests",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give four equivalent tests for a symmetric matrix [[a,b],[b,c]] to be positive definite. Where is the borderline in [[2,6],[6,y]]?",
    back: `A **positive definite** matrix is a symmetric matrix that passes any (hence all) of these equivalent tests:

1. **Eigenvalues**: $\\lambda_1 > 0$, $\\lambda_2 > 0$ (all eigenvalues positive).
2. **Determinants**: $a > 0$ and $ac - b^2 > 0$ (all **upper-left** determinants positive).
3. **Pivots**: $a > 0$ and $\\frac{ac - b^2}{a} > 0$ (all pivots positive).
4. **Energy**: $x^TAx > 0$ for every $x \\neq 0$ — usually taken as the definition.

The quadratic form: $x^TAx = ax_1^2 + 2bx_1x_2 + cx_2^2$.

**Borderline**: $\\begin{bmatrix} 2 & 6 \\\\ 6 & y \\end{bmatrix}$ is positive definite iff $2y - 36 > 0$, i.e. $y > 18$. At $y = 18$, $\\begin{bmatrix} 2 & 6 \\\\ 6 & 18 \\end{bmatrix}$ is **positive semidefinite**: singular, eigenvalues $0$ and $20$, only one pivot, and
$$x^TAx = 2x_1^2 + 12x_1x_2 + 18x_2^2 = 2(x_1 + 3x_2)^2,$$
which is $\\geq 0$ but equals 0 at $x = (3, -1)$. (Semidefinite: all $\\lambda \\geq 0$.)

Determinant alone isn't enough: $\\begin{bmatrix} -1 & 0 \\\\ 0 & -3 \\end{bmatrix}$ has $\\det = 3 > 0$ but is negative definite.

Positive definite matrices tie the whole course together: pivots, determinants, eigenvalues and energy all agree.`,
    related: ["mit1806-pd-svd-completing-square-minima", "mit1806-pd-svd-spectral-theorem"],
  },
  {
    id: "mit1806-pd-svd-completing-square-minima",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Show that completing the square in 2x² + 12xy + 20y² is exactly elimination, and contrast it with the saddle 2x² + 12xy + 7y². How does this give the second-derivative test?",
    back: `**Positive definite** $A = \\begin{bmatrix} 2 & 6 \\\\ 6 & 20 \\end{bmatrix}$ (det 4, trace 22):
$$2x^2 + 12xy + 20y^2 = 2(x + 3y)^2 + 2y^2 > 0 \\text{ unless } x = y = 0.$$
The graph is a **bowl** with elliptical level curves.

**Not positive definite** $\\begin{bmatrix} 2 & 6 \\\\ 6 & 7 \\end{bmatrix}$:
$$2x^2 + 12xy + 7y^2 = 2(x + 3y)^2 - 11y^2,$$
which is negative at $(x, y) = (-3, 1)$ — a **saddle** at the origin.

**Completing the square = elimination**: subtract 3 × row 1 from row 2:
$$\\begin{bmatrix} 2 & 6 \\\\ 6 & 20 \\end{bmatrix} \\to U = \\begin{bmatrix} 2 & 6 \\\\ 0 & 2 \\end{bmatrix}, \\qquad L = \\begin{bmatrix} 1 & 0 \\\\ 3 & 1 \\end{bmatrix}.$$
- The **pivots** $2, 2$ multiply the squares.
- The **multiplier** 3 is the coefficient inside $(x + 3y)$.

Positive pivots ⟺ a sum of squares with positive weights ⟺ $x^TAx > 0$. (Note $2(x + 3y)^2 = 2x^2 + 12xy + 18y^2$ — 18 is exactly the borderline value.)

**Minima in calculus**: at a critical point ($f_x = f_y = 0$), $f$ has a **minimum** when the **Hessian** $\\begin{bmatrix} f_{xx} & f_{xy} \\\\ f_{yx} & f_{yy} \\end{bmatrix}$ (symmetric, since $f_{xy} = f_{yx}$) is positive definite: $f_{xx} > 0$ and $f_{xx}f_{yy} > f_{xy}^2$ — the familiar test. In $n$ variables, the same matrix tests apply.`,
    related: ["mit1806-pd-svd-positive-definite-tests", "mit1806-pd-svd-ellipsoids-3x3", "mit1806-elimination-a-equals-lu"],
  },
  {
    id: "mit1806-pd-svd-ellipsoids-3x3",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Test A = [[2,−1,0],[−1,2,−1],[0,−1,2]] for positive definiteness three ways, and describe the geometry of xᵀAx = 1.",
    back: `**Determinants** (upper-left $k \\times k$): $2$, $\\begin{vmatrix} 2 & -1 \\\\ -1 & 2 \\end{vmatrix} = 3$, $\\det A = 4$ — all positive. ✓

**Pivots**: ratios of successive determinants: $2, \\frac32, \\frac43$ — all positive. ✓

**Eigenvalues**: $2 - \\sqrt2,\\ 2,\\ 2 + \\sqrt2$ — all positive (product 4, sum 6 = trace). ✓

**Energy**:
$$x^TAx = 2x_1^2 + 2x_2^2 + 2x_3^2 - 2x_1x_2 - 2x_2x_3 > 0 \\text{ for } x \\neq 0,$$
a sum of three squares weighted by the positive pivots. Its graph (in 4D) is a bowl with its minimum at $x = 0$.

**Geometry**: the level set $x^TAx = 1$ is an **ellipsoid** (like a rugby ball). Writing $A = Q\\Lambda Q^T$ (principal axis theorem):
- the **eigenvectors** give the directions of the principal axes;
- the **eigenvalues** set their lengths — the half-axis along $q_i$ is $1/\\sqrt{\\lambda_i}$ (large $\\lambda$ = steep bowl = short axis).

This matrix — the "$-1, 2, -1$" second-difference matrix — appears throughout numerical methods for differential equations.`,
    related: ["mit1806-pd-svd-completing-square-minima", "mit1806-pd-svd-spectral-theorem"],
  },

  // --- Lecture 28: Similar matrices and Jordan form ---
  {
    id: "mit1806-pd-svd-ata-positive-definite",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that AᵀA is positive definite when A has independent columns, and that sums and inverses of positive definite matrices are positive definite.",
    back: `**$A^TA$ is positive definite** for any $m \\times n$ matrix $A$ of rank $n$ (independent columns).
*Proof.* $A^TA$ is square and symmetric. For any $x$, just move parentheses:
$$x^T(A^TA)x = (Ax)^T(Ax) = \\lVert Ax \\rVert^2 \\geq 0,$$
with equality only if $Ax = 0$. Independent columns mean $Ax = 0$ only for $x = 0$, so $x^TA^TAx > 0$ for every $x \\neq 0$. $\\blacksquare$
(If the columns are dependent, $A^TA$ is only semidefinite.) This is why the normal equations of least squares are so well behaved.

**Inverse**: $A$ positive definite ⇒ $A^{-1}$ positive definite. Its eigenvalues are $\\frac{1}{\\lambda_i} > 0$, and it's symmetric. $\\blacksquare$

**Sum**: $A, B$ positive definite ⇒ $A + B$ positive definite. Eigenvalues don't add, but the energy test does:
$$x^T(A + B)x = x^TAx + x^TBx > 0 \\text{ for } x \\neq 0. \\;\\blacksquare$$

**Bonus**: elimination on a positive definite matrix **never needs row exchanges** — the pivots are positive, so no zeros (or dangerously small numbers) ever appear in pivot positions.`,
    related: ["mit1806-orthogonality-ata-invertible", "mit1806-pd-svd-positive-definite-tests", "mit1806-pd-svd-svd"],
  },
  {
    id: "mit1806-pd-svd-similar-matrices",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define similar matrices and prove that similar matrices have the same eigenvalues. Illustrate with A = [[2,1],[1,2]].",
    back: `**Similar**: $B = M^{-1}AM$ for some invertible $M$. Similar matrices form **families**; diagonalization finds the diagonal member, $S^{-1}AS = \\Lambda$.

**Theorem.** Similar matrices have the same eigenvalues (and the same number of independent eigenvectors).

**Proof.** Let $Ax = \\lambda x$ and $B = M^{-1}AM$. Then
$$B(M^{-1}x) = M^{-1}AMM^{-1}x = M^{-1}Ax = \\lambda\\,(M^{-1}x).$$
$M^{-1}x \\neq 0$ (since $M^{-1}$ is invertible), so $\\lambda$ is an eigenvalue of $B$ with eigenvector $M^{-1}x$. The map $x \\mapsto M^{-1}x$ carries independent eigenvectors to independent eigenvectors. $\\blacksquare$

The eigenvalues stay the same; **the eigenvectors move** (to $M^{-1}x$).

**Example**: $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$ has eigenvalues 3 and 1, so it's similar to $\\Lambda = \\begin{bmatrix} 3 & 0 \\\\ 0 & 1 \\end{bmatrix}$. With $M = \\begin{bmatrix} 1 & 4 \\\\ 0 & 1 \\end{bmatrix}$:
$$B = M^{-1}AM = \\begin{bmatrix} -2 & -15 \\\\ 1 & 6 \\end{bmatrix}$$
— trace 4, determinant 3, eigenvalues 3 and 1 again. **Every** 2×2 matrix with eigenvalues 3 and 1 is in this family (e.g. $\\begin{bmatrix} 3 & 7 \\\\ 0 & 1 \\end{bmatrix}$, $\\begin{bmatrix} 1 & 7 \\\\ 0 & 3 \\end{bmatrix}$): with distinct eigenvalues, all are similar to the same $\\Lambda$.`,
    related: ["mit1806-pd-svd-jordan-form", "mit1806-eigenvalues-diagonalization", "mit1806-pd-svd-change-of-basis-compression"],
  },
  {
    id: "mit1806-pd-svd-jordan-form",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the Jordan form? Why are [[4,0],[0,4]] and [[4,1],[0,4]] not similar, and how do you tell two nilpotent 4×4 matrices apart?",
    back: `**Repeated eigenvalues split into several families.** Matrices with eigenvalues $4, 4$:
- $4I = \\begin{bmatrix} 4 & 0 \\\\ 0 & 4 \\end{bmatrix}$ is **alone** in its family: $M^{-1}(4I)M = 4I$ for every $M$.
- Every other matrix with eigenvalues $4, 4$ (e.g. $\\begin{bmatrix} 4 & 1 \\\\ 0 & 4 \\end{bmatrix}$, $\\begin{bmatrix} 5 & 1 \\\\ -1 & 3 \\end{bmatrix}$) has only **one** independent eigenvector, and they're all similar to $\\begin{bmatrix} 4 & 1 \\\\ 0 & 4 \\end{bmatrix}$. None is diagonalizable.

**Jordan block**: eigenvalue $\\lambda_i$ repeated on the diagonal, **1s just above it**, zeros elsewhere. **Jordan's theorem**: every square matrix is similar to a **Jordan matrix** $J$ — Jordan blocks down the diagonal, **one block per independent eigenvector**. With $n$ distinct eigenvalues, $J = \\Lambda$.

**Same eigenvalues and eigenvector count aren't enough.** Both
$$A = \\begin{bmatrix} 0 & 1 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 0 & 0 & 0 \\\\ 0 & 0 & 0 & 0 \\end{bmatrix}, \\qquad C = \\begin{bmatrix} 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 0 & 0 \\end{bmatrix}$$
have four zero eigenvalues, rank 2, and 2 eigenvectors — but their blocks are $3 + 1$ vs. $2 + 2$, so they're **not similar**. A quick proof: similarity preserves the rank of every power ($B^2 = M^{-1}A^2M$), but $\\text{rank}(A^2) = 1$ while $\\text{rank}(C^2) = 0$.

Jordan form used to be the climax of linear algebra; numerical work rarely needs it (it's unstable under tiny perturbations) — the SVD took its place.`,
    related: ["mit1806-pd-svd-similar-matrices", "mit1806-eigenvalues-complex-and-repeated"],
  },

  // --- Lecture 29: Singular value decomposition ---
  {
    id: "mit1806-pd-svd-svd",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What is the SVD A = UΣVᵀ, how do you compute it from AᵀA and AAᵀ, and what is it for A = [[4,4],[−3,3]]?",
    back: `**The SVD**: **any** matrix (any shape, any rank) factors as
$$A = U\\Sigma V^T,$$
with $U, V$ **orthogonal** and $\\Sigma$ **diagonal** with nonnegative **singular values** $\\sigma_1 \\geq \\sigma_2 \\geq \\cdots$. It's "the final and best factorization". For symmetric positive definite $A$ it is just $Q\\Lambda Q^T$; in general $S\\Lambda S^{-1}$ has a non-orthogonal $S$, while the SVD uses **two different** orthogonal matrices.

**The idea**: find an orthonormal basis $v_i$ of the row space that $A$ maps to an orthogonal basis of the column space: $Av_i = \\sigma_iu_i$, i.e. $AV = U\\Sigma$.

**Computing**: $A^TA = V\\Sigma^TU^TU\\Sigma V^T = V\\Sigma^2V^T$ — a diagonalization of the symmetric matrix $A^TA$. So the columns of $V$ are eigenvectors of $A^TA$ and $\\sigma_i^2$ its eigenvalues. Likewise $AA^T = U\\Sigma^2U^T$ gives $U$ (or use $u_i = Av_i/\\sigma_i$, which fixes the signs consistently).

**Example**: $A = \\begin{bmatrix} 4 & 4 \\\\ -3 & 3 \\end{bmatrix}$, $A^TA = \\begin{bmatrix} 25 & 7 \\\\ 7 & 25 \\end{bmatrix}$ with eigenvalues $32, 18$ and eigenvectors $(1, 1), (1, -1)$:
$$\\begin{bmatrix} 4 & 4 \\\\ -3 & 3 \\end{bmatrix} = \\underbrace{\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}}_{U}\\underbrace{\\begin{bmatrix} 4\\sqrt2 & 0 \\\\ 0 & 3\\sqrt2 \\end{bmatrix}}_{\\Sigma}\\underbrace{\\frac{1}{\\sqrt2}\\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}}_{V^T}.$$
$AA^T = \\begin{bmatrix} 32 & 0 \\\\ 0 & 18 \\end{bmatrix}$ is diagonal, but $u_2 = (0, -1)$, not $(0, 1)$: $Av_2 = (0, -3\\sqrt2)$ forces the sign.`,
    pitfall:
      "Finding U and V independently from AAᵀ and AᵀA can produce sign mismatches (each eigenvector is only defined up to sign). Compute V first, then uᵢ = Avᵢ/σᵢ.",
    related: ["mit1806-pd-svd-svd-four-subspaces", "mit1806-pd-svd-ata-positive-definite", "mit1806-pd-svd-spectral-theorem"],
  },
  {
    id: "mit1806-pd-svd-svd-four-subspaces",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the SVD give orthonormal bases for all four fundamental subspaces? Work out the SVD of the rank-1 matrix [[4,3],[8,6]].",
    back: `For $A$ of rank $r$, the SVD supplies **the right bases** — orthonormal, and paired by $Av_i = \\sigma_iu_i$:

| Columns | Basis for |
|---|---|
| $v_1, \\ldots, v_r$ | row space $C(A^T)$ |
| $v_{r+1}, \\ldots, v_n$ | nullspace $N(A)$ ($\\sigma = 0$) |
| $u_1, \\ldots, u_r$ | column space $C(A)$ |
| $u_{r+1}, \\ldots, u_m$ | left nullspace $N(A^T)$ |

This is **part 3 of the Fundamental Theorem**: on top of the dimensions (part 1) and orthogonality (part 2), orthonormal bases in which $A$ is diagonal.

**Example** $A = \\begin{bmatrix} 4 & 3 \\\\ 8 & 6 \\end{bmatrix}$ (rank 1):
- row space = multiples of $(4, 3)$: $v_1 = (0.8, 0.6)$; nullspace: $v_2 = (0.6, -0.8)$;
- column space = multiples of $(4, 8)$: $u_1 = \\frac{1}{\\sqrt5}(1, 2)$; left nullspace: $u_2 = \\frac{1}{\\sqrt5}(2, -1)$;
- $A^TA = \\begin{bmatrix} 80 & 60 \\\\ 60 & 45 \\end{bmatrix}$ has rank 1, so its nonzero eigenvalue equals the trace: $\\sigma_1^2 = 125$.
$$\\begin{bmatrix} 4 & 3 \\\\ 8 & 6 \\end{bmatrix} = \\frac{1}{\\sqrt5}\\begin{bmatrix} 1 & 2 \\\\ 2 & -1 \\end{bmatrix}\\begin{bmatrix} \\sqrt{125} & 0 \\\\ 0 & 0 \\end{bmatrix}\\begin{bmatrix} 0.8 & 0.6 \\\\ 0.6 & -0.8 \\end{bmatrix}.$$`,
    pitfall:
      "V's columns span the row space and U's the column space (not the other way round — the lecture summary has them swapped). Remember Avᵢ = σᵢuᵢ: v goes IN, u comes OUT.",
    related: ["mit1806-pd-svd-svd", "mit1806-subspaces-four-subspaces", "mit1806-orthogonality-orthogonal-complements", "mit1806-pd-svd-pseudoinverse"],
  },

  // --- Lecture 30: Linear transformations and their matrices ---
  {
    id: "mit1806-pd-svd-linear-transformations",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a linear transformation, give non-examples, and explain how choosing bases turns any linear transformation into a matrix (with the derivative as example).",
    back: `**Linear**: $T(cv + dw) = cT(v) + dT(w)$ for all vectors $v, w$ and scalars $c, d$. Consequence: $T(0) = 0$.

**Examples**: projection onto a line, rotation by 45°, $T(v) = Av$ for any matrix, the reflection $\\begin{bmatrix} 1 & 0 \\\\ 0 & -1 \\end{bmatrix}$ (across the $x$-axis).
**Non-examples**: shifting, $T(v) = v + v_0$ ($T(2v) \\neq 2T(v)$); the length $T(v) = \\lVert v \\rVert$ (fails for $c < 0$).

**A basis determines everything**: if $v = c_1v_1 + \\cdots + c_nv_n$, then $T(v) = c_1T(v_1) + \\cdots + c_nT(v_n)$. Knowing $T$ on a basis gives $T$ everywhere; the $c_i$ are the **coordinates** of $v$.

**The matrix of $T$** (input basis $v_1, \\ldots, v_n$, output basis $w_1, \\ldots, w_m$): **column $j$ holds the coordinates of $T(v_j)$** in the $w$-basis. Then $T(v) = Av$ in coordinates.
- Projection onto a line, with $v_1$ on the line and $v_2$ perpendicular (eigenvectors!): $A = \\begin{bmatrix} 1 & 0 \\\\ 0 & 0 \\end{bmatrix}$. In the standard basis, the 45° line gives $\\begin{bmatrix} 1/2 & 1/2 \\\\ 1/2 & 1/2 \\end{bmatrix}$ — same $T$, messier matrix.
- **Derivative** $T = \\frac{d}{dx}$ from quadratics (basis $1, x, x^2$) to linear polynomials (basis $1, x$): $T(c_1 + c_2x + c_3x^2) = c_2 + 2c_3x$, so
$$A = \\begin{bmatrix} 0 & 1 & 0 \\\\ 0 & 0 & 2 \\end{bmatrix}.$$

**Composition ↔ product**: applying $T_1$ (matrix $A_1$) then $T_2$ (matrix $A_2$) has matrix $A_2A_1$ — **this is where the rule for matrix multiplication comes from**.`,
    related: ["mit1806-pd-svd-change-of-basis-compression", "mit1806-subspaces-other-vector-spaces", "mit1806-orthogonality-projection-onto-line"],
  },

  // --- Lecture 31: Change of basis; image compression ---
  {
    id: "mit1806-pd-svd-change-of-basis-compression",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do vector coordinates and transformation matrices change under a change of basis? Why is that the core of image compression (JPEG, wavelets)?",
    back: `**Vectors**: if the columns of $W$ are the new basis vectors, a vector $x$ (old coordinates) has new coordinates $c$ with
$$x = Wc, \\qquad c = W^{-1}x.$$
**Matrices**: if $T$ has matrix $A$ in one basis and $B$ in another, then $B = M^{-1}AM$ ($M$ = change-of-basis matrix) — **$A$ and $B$ are similar**. In an **eigenvector basis**, the matrix is the diagonal $\\Lambda$.

**Image compression**: a 512×512 grayscale frame is a vector in $\\mathbb{R}^{512^2}$; the standard basis (one vector per pixel) is a terrible way to send it. "The whole frame is black" costs $512^2$ numbers pixel by pixel, but **one** coefficient if a basis vector is all 1s.

- **Fourier/JPEG**: split into 8×8 blocks (64 pixels), change to a **cosine** basis (real parts of Fourier vectors), drop coefficients below a threshold:
  signal $x$ → 64 coefficients $c$ (lossless) → $\\hat{c}$ with many zeros (**lossy**) → $\\hat{x} = \\sum \\hat{c}_iv_i$.
- **Haar wavelets**: orthogonal vectors of $\\pm1$ and many 0s, at several scales (JPEG2000 refines them).
- **Video**: also compress the small *differences* between consecutive frames.

**A good basis** for compression: (1) multiplying by $W$ and $W^{-1}$ is **fast** (FFT, wavelets; ideally $W^{-1} = W^T$); (2) **few coefficients** capture the image — most $c_i$ are tiny and can be zeroed. An eigenvector basis would be ideal but costs too much to compute.`,
    related: ["mit1806-pd-svd-linear-transformations", "mit1806-pd-svd-similar-matrices", "mit1806-pd-svd-fourier-matrix-fft"],
  },

  // --- Lecture 33: Left and right inverses; pseudoinverse ---
  {
    id: "mit1806-pd-svd-left-right-inverses",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "When does a rectangular matrix have a left inverse or a right inverse, and what are the 'favorite' formulas for each?",
    back: `| Case | Rank | Inverse | Formula | Product |
|---|---|---|---|---|
| square, invertible | $r = m = n$ | two-sided $A^{-1}$ | — | $AA^{-1} = I = A^{-1}A$ |
| full **column** rank (tall) | $r = n$ | **left** inverse | $A^{-1}_{\\text{left}} = (A^TA)^{-1}A^T$ | $A^{-1}_{\\text{left}}A = I_n$ |
| full **row** rank (wide) | $r = m$ | **right** inverse | $A^{-1}_{\\text{right}} = A^T(AA^T)^{-1}$ | $AA^{-1}_{\\text{right}} = I_m$ |

- **Full column rank**: $N(A) = \\{0\\}$, so $Ax = b$ has 0 or 1 solutions. $A^TA$ is invertible (the same fact behind least squares). The other order, $AA^{-1}_{\\text{left}} = A(A^TA)^{-1}A^T$, is the **projection onto $C(A)$**, not $I$.
- **Full row rank**: $N(A^T) = \\{0\\}$, so $Ax = b$ always has solutions (infinitely many if $n > m$). The other order, $A^{-1}_{\\text{right}}A = A^T(AA^T)^{-1}A$, projects onto the **row space**.

A rectangular matrix can **never** have a two-sided inverse: either it or its transpose has a nonzero nullspace. Other left/right inverses exist; these are the natural ones.

**Neither full row nor full column rank** ($r < m$, $r < n$): no one-sided inverse at all — that's where the **pseudoinverse** comes in.`,
    related: ["mit1806-pd-svd-pseudoinverse", "mit1806-orthogonality-projection-onto-subspace", "mit1806-subspaces-rank-cases"],
  },
  {
    id: "mit1806-pd-svd-pseudoinverse",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that A maps its row space one-to-one onto its column space, and use the SVD to construct the pseudoinverse A⁺.",
    back: `**Theorem.** If $x \\neq y$ are both in the row space of $A$, then $Ax \\neq Ay$.

**Proof.** Suppose $Ax = Ay$. Then $A(x - y) = 0$, so $x - y \\in N(A)$. But $x - y$ is also in the row space (a subspace, closed under subtraction). The row space and nullspace are orthogonal complements; the only vector in both is $0$. So $x - y = 0$ — contradicting $x \\neq y$. $\\blacksquare$

Both spaces have dimension $r$, so $x \\mapsto Ax$ is an **invertible** map from the row space onto the column space. Its inverse, extended by sending the left nullspace to 0, is the **pseudoinverse** $A^+$: $A^+Ax = x$ for every $x$ in the row space, and $N(A^+) = N(A^T)$. It exists for **every** matrix — the nullspaces are what block an ordinary inverse.

**Construction via SVD**: $A = U\\Sigma V^T$ and $U, V$ are orthogonal (easy to invert), so only $\\Sigma$ needs work. Let $\\Sigma^+$ be the $n \\times m$ matrix with $\\frac{1}{\\sigma_1}, \\ldots, \\frac{1}{\\sigma_r}$ on its diagonal and zeros elsewhere. Then
$$A^+ = V\\Sigma^+U^T.$$
$\\Sigma\\Sigma^+$ and $\\Sigma^+\\Sigma$ are diagonal with $r$ ones — projections onto the column and row spaces.

**Example**: $A = \\begin{bmatrix} 4 & 3 \\\\ 8 & 6 \\end{bmatrix}$ (rank 1, $\\sigma_1 = \\sqrt{125}$) gives $A^+ = \\frac{1}{125}\\begin{bmatrix} 4 & 8 \\\\ 3 & 6 \\end{bmatrix}$.

**Why statisticians care**: $x^+ = A^+b$ is the **minimum-norm least-squares solution** — linear regression even when the columns of $A$ are dependent.`,
    related: ["mit1806-pd-svd-left-right-inverses", "mit1806-pd-svd-svd-four-subspaces", "mit1806-orthogonality-orthogonal-complements"],
  },
];
