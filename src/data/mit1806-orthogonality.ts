// MIT 18.06SC Linear Algebra (Fall 2011, Gilbert Strang) — Unit II, part 1:
// Orthogonality and Least Squares (Lectures 14-17). Sourced from the
// course's own per-lecture summaries, read page-by-page, with every example
// recomputed exactly. Lecture 14 covers orthogonal vectors and subspaces,
// row space ⊥ nullspace (orthogonal complements) and N(AᵀA) = N(A);
// Lecture 15 projections onto lines and subspaces and the normal equations;
// Lecture 16 projection matrices and least-squares line fitting; Lecture 17
// orthonormal vectors, orthogonal matrices, Gram-Schmidt and A = QR.
// Correction to the Lecture 17 summary: the projection onto C(Q) is
// Q(QᵀQ)⁻¹Qᵀ (the summary prints Qᵀ(QᵀQ)⁻¹Qᵀ), which reduces to QQᵀ. The
// Hadamard example uses the standard 4×4 Hadamard matrix (the summary's
// layout didn't survive extraction). See src/data/courses.ts.
import type { Card } from "./types";

const MODULE = "mit1806-orthogonality";

export const mit1806OrthogonalityCards: Card[] = [
  // --- Lecture 14: Orthogonal vectors and subspaces ---
  {
    id: "mit1806-orthogonality-orthogonal-vectors",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove, using the Pythagorean theorem, that vectors x and y are orthogonal exactly when xᵀy = 0.",
    back: `**Length**: $\\lVert x \\rVert^2 = x^Tx = x_1^2 + \\cdots + x_n^2$.

**Claim.** $x \\perp y$ (they form a right angle) $\\iff x^Ty = 0$.

**Proof.** $x$ and $y$ are perpendicular exactly when they form a right triangle with hypotenuse $x + y$, i.e. when Pythagoras holds:
$$\\lVert x \\rVert^2 + \\lVert y \\rVert^2 = \\lVert x + y \\rVert^2.$$
Expand the right side:
$$\\lVert x + y \\rVert^2 = (x + y)^T(x + y) = x^Tx + x^Ty + y^Tx + y^Ty = \\lVert x \\rVert^2 + 2\\,x^Ty + \\lVert y \\rVert^2,$$
using $y^Tx = x^Ty$. So Pythagoras holds $\\iff 2\\,x^Ty = 0 \\iff x^Ty = 0$. $\\blacksquare$

Consequence: the **zero vector is orthogonal to every vector**.

**Orthogonal subspaces**: $S \\perp T$ means **every** vector of $S$ is orthogonal to **every** vector of $T$. Two lines through the origin at right angles are orthogonal; a line and the whole plane never are. The blackboard and the floor are *not* orthogonal subspaces: the line where they meet lies in both, and a nonzero vector isn't orthogonal to itself.`,
    pitfall:
      "Orthogonal subspaces can only share the zero vector. 'Perpendicular planes' in everyday 3D geometry (like wall and floor) are NOT orthogonal subspaces.",
    related: ["mit1806-orthogonality-orthogonal-complements", "mit1806-orthogonality-orthonormal-orthogonal-matrices"],
  },
  {
    id: "mit1806-orthogonality-orthogonal-complements",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that the row space of A is orthogonal to its nullspace, and explain why they are orthogonal complements in ℝⁿ.",
    back: `**Theorem.** $C(A^T) \\perp N(A)$ in $\\mathbb{R}^n$, and likewise $C(A) \\perp N(A^T)$ in $\\mathbb{R}^m$.

**Proof.** $Ax = 0$ says the **dot product of $x$ with every row of $A$ is 0**:
$$Ax = \\begin{bmatrix} \\text{row}_1 \\cdot x \\\\ \\vdots \\\\ \\text{row}_m \\cdot x \\end{bmatrix} = 0.$$
Any vector of the row space is a combination $c_1\\,\\text{row}_1 + \\cdots + c_m\\,\\text{row}_m$, and its dot product with $x$ is $c_1 \\cdot 0 + \\cdots + c_m \\cdot 0 = 0$. So every row-space vector is orthogonal to every nullspace vector. Applying this to $A^T$ gives $C(A) \\perp N(A^T)$. $\\blacksquare$

**Orthogonal complements**: more is true — the dimensions add up: $r + (n - r) = n$. So $N(A)$ contains **all** vectors perpendicular to the row space, and the row space contains all vectors perpendicular to $N(A)$: they split $\\mathbb{R}^n$ into two perpendicular pieces, and every $x \\in \\mathbb{R}^n$ is uniquely (row-space part) + (nullspace part).

**Example**: $A = \\begin{bmatrix} 1 & 2 & 5 \\\\ 2 & 4 & 10 \\end{bmatrix}$ has row space = the line through $(1, 2, 5)$, and nullspace = the plane perpendicular to it.

Strang's **Fundamental Theorem of Linear Algebra**: part 1 gives the dimensions of the four subspaces; **part 2 says they come in orthogonal-complement pairs**; part 3 (the SVD) gives orthonormal bases for them.`,
    related: ["mit1806-orthogonality-orthogonal-vectors", "mit1806-subspaces-four-subspaces", "mit1806-orthogonality-ata-invertible"],
  },
  {
    id: "mit1806-orthogonality-ata-invertible",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that N(AᵀA) = N(A), and conclude that AᵀA is invertible exactly when A has independent columns.",
    back: `**Why it matters**: least squares solves $A^TA\\hat{x} = A^Tb$, so we need to know when the square, symmetric $n \\times n$ matrix $A^TA$ is invertible.

**Theorem.** $N(A^TA) = N(A)$.

**Proof.** ($\\supseteq$) If $Ax = 0$ then $A^TAx = A^T0 = 0$.
($\\subseteq$) Suppose $A^TAx = 0$. Multiply on the left by $x^T$:
$$0 = x^TA^TAx = (Ax)^T(Ax) = \\lVert Ax \\rVert^2.$$
A vector of length 0 is the zero vector, so $Ax = 0$. $\\blacksquare$

**Corollaries**:
- $\\text{rank}(A^TA) = \\text{rank}(A)$ (same nullspace, same number of columns $n$).
- $A^TA$ is invertible $\\iff N(A^TA) = \\{0\\} \\iff N(A) = \\{0\\} \\iff$ **$A$ has independent columns**.

Example: $A = \\begin{bmatrix} 1 & 1 \\\\ 1 & 2 \\\\ 1 & 5 \\end{bmatrix}$ has independent columns, and $A^TA = \\begin{bmatrix} 3 & 8 \\\\ 8 & 30 \\end{bmatrix}$ is invertible.

Orthonormal columns are independent automatically, so they always qualify (and then $A^TA = I$).`,
    pitfall:
      "The key step 'xᵀAᵀAx = ‖Ax‖²' is the trick to remember — multiplying by xᵀ turns a vector equation into a statement about a length.",
    related: ["mit1806-orthogonality-projection-onto-subspace", "mit1806-elimination-transposes-symmetric"],
  },

  // --- Lecture 15: Projections onto subspaces ---
  {
    id: "mit1806-orthogonality-projection-onto-line",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Derive the projection of b onto the line through a, and the projection matrix P = aaᵀ/aᵀa. What properties does P have?",
    back: `The closest point $p$ to $b$ on the line through $a$ is where the error $e = b - p$ is **perpendicular** to the line.

Since $p$ is on the line, $p = \\hat{x}a$ for a number $\\hat{x}$. Perpendicularity gives:
$$a^T(b - \\hat{x}a) = 0 \\;\\Rightarrow\\; \\hat{x} = \\frac{a^Tb}{a^Ta}, \\qquad p = a\\,\\frac{a^Tb}{a^Ta}.$$
Doubling $b$ doubles $p$; doubling $a$ doesn't change $p$ (the line is the same).

**Projection matrix**: $p = Pb$ with
$$P = \\frac{aa^T}{a^Ta}$$
— $aa^T$ is a matrix (column times row), $a^Ta$ a number. For $a = (1, 2, 2)$: $P = \\frac19\\begin{bmatrix} 1 & 2 & 2 \\\\ 2 & 4 & 4 \\\\ 2 & 4 & 4 \\end{bmatrix}$.

**Properties**:
- $C(P)$ = the line through $a$; **rank 1**.
- **Symmetric**: $P^T = P$.
- **Idempotent**: $P^2 = P$ — projecting a vector already on the line leaves it there.

These two properties, $P^T = P$ and $P^2 = P$, characterize all orthogonal projection matrices.`,
    related: ["mit1806-orthogonality-projection-onto-subspace", "mit1806-orthogonality-orthogonal-vectors"],
  },
  {
    id: "mit1806-orthogonality-projection-onto-subspace",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Derive the normal equations AᵀAx̂ = Aᵀb for projecting b onto the column space of A, and the projection matrix P = A(AᵀA)⁻¹Aᵀ.",
    back: `**Why project?** $Ax = b$ often has no solution ($b \\notin C(A)$, e.g. noisy measurements with $m > n$). So replace $b$ by its projection $p$ onto $C(A)$ and solve $A\\hat{x} = p$.

Let $A$ have independent columns $a_1, \\ldots, a_n$ (a basis of the subspace). Then $p = A\\hat{x}$, and the error $e = b - A\\hat{x}$ must be perpendicular to **every** column:
$$a_i^T(b - A\\hat{x}) = 0 \\text{ for all } i \\iff A^T(b - A\\hat{x}) = 0.$$
So $e \\in N(A^T)$ — the left nullspace, which is exactly the orthogonal complement of $C(A)$. ✓ This gives the **normal equations**
$$A^TA\\hat{x} = A^Tb \\;\\Rightarrow\\; \\hat{x} = (A^TA)^{-1}A^Tb, \\quad p = A(A^TA)^{-1}A^Tb, \\quad P = A(A^TA)^{-1}A^T.$$
($A^TA$ is invertible because the columns are independent.) For one column $a$ this reduces to $\\frac{aa^T}{a^Ta}$.

**Properties**: $P^T = P$ and $P^2 = P$. If $b \\in C(A)$ then $Pb = b$; if $b \\perp C(A)$ then $Pb = 0$.

**The complementary projection** $I - P$ projects onto $N(A^T)$: $e = (I - P)b$. Every $b$ splits as $b = p + e$ with $p \\in C(A)$, $e \\in N(A^T)$, $p \\perp e$.`,
    pitfall:
      "Don't 'simplify' (AᵀA)⁻¹ to A⁻¹(Aᵀ)⁻¹ — A is usually rectangular and has no inverse. Only when A is square and invertible does P collapse to I.",
    related: ["mit1806-orthogonality-least-squares-line", "mit1806-orthogonality-ata-invertible", "mit1806-orthogonality-projection-onto-line"],
  },

  // --- Lecture 16: Projection matrices and least squares ---
  {
    id: "mit1806-orthogonality-least-squares-line",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the least-squares line b = C + Dt through the points (1, 1), (2, 2), (3, 2), and interpret p and e.",
    back: `A line through all three points would need
$$\\underbrace{\\begin{bmatrix} 1 & 1 \\\\ 1 & 2 \\\\ 1 & 3 \\end{bmatrix}}_{A}\\begin{bmatrix} C \\\\ D \\end{bmatrix} = \\underbrace{\\begin{bmatrix} 1 \\\\ 2 \\\\ 2 \\end{bmatrix}}_{b},$$
which has no solution. **Least squares** minimizes $\\lVert Ax - b \\rVert^2 = e_1^2 + e_2^2 + e_3^2$, the sum of squared vertical errors.

**Normal equations** $A^TA\\hat{x} = A^Tb$:
$$\\begin{bmatrix} 3 & 6 \\\\ 6 & 14 \\end{bmatrix}\\begin{bmatrix} \\hat{C} \\\\ \\hat{D} \\end{bmatrix} = \\begin{bmatrix} 5 \\\\ 11 \\end{bmatrix} \\;\\Rightarrow\\; \\hat{C} = \\tfrac23,\\ \\hat{D} = \\tfrac12.$$
Best line: $b = \\frac23 + \\frac12 t$. (Calculus — setting the partial derivatives of $(C + D - 1)^2 + (C + 2D - 2)^2 + (C + 3D - 2)^2$ to zero — gives the same equations.)

**Two pictures of the answer**:
- In the $t$–$b$ plane: $p = (\\frac76, \\frac53, \\frac{13}{6})$ are the heights of the line at $t = 1, 2, 3$, and $e = b - p = (-\\frac16, \\frac13, -\\frac16)$ are the vertical misses.
- In $\\mathbb{R}^3$: $p$ is the projection of $b$ onto $C(A)$, and $e$ lies in $N(A^T)$. Check: $p^Te = 0$ and $A^Te = 0$ — the errors are orthogonal to both columns (so they sum to zero, and their dot product with $t$ is zero).`,
    pitfall:
      "Least squares weights every squared error equally, so a single outlier can drag the line badly. It's the right tool for noisy data without gross outliers.",
    related: ["mit1806-orthogonality-projection-onto-subspace", "mit6120-probability-variance"],
  },

  // --- Lecture 17: Orthogonal matrices and Gram-Schmidt ---
  {
    id: "mit1806-orthogonality-orthonormal-orthogonal-matrices",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define orthonormal vectors, a matrix Q with orthonormal columns, and an orthogonal matrix. Give examples and key properties.",
    back: `$q_1, \\ldots, q_n$ are **orthonormal** if $q_i^Tq_j = 0$ for $i \\neq j$ and $q_i^Tq_i = 1$: unit length, mutually perpendicular. Orthonormal vectors are always **independent**.

**Orthonormal columns**: $Q = \\begin{bmatrix} q_1 & \\cdots & q_n \\end{bmatrix}$ satisfies $Q^TQ = I$ (even if $Q$ is rectangular).

**Orthogonal matrix**: a **square** $Q$ with orthonormal columns. Then $Q^TQ = I$ means $Q^T = Q^{-1}$ — the inverse is free.

**Examples**:
- Permutation matrices.
- Rotations $\\begin{bmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{bmatrix}$.
- Rescaling $\\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}$ by $\\frac{1}{\\sqrt2}$; the **Hadamard** matrix $\\frac12\\begin{bmatrix} 1 & 1 & 1 & 1 \\\\ 1 & -1 & 1 & -1 \\\\ 1 & 1 & -1 & -1 \\\\ 1 & -1 & -1 & 1 \\end{bmatrix}$.
- Without square roots: $\\frac13\\begin{bmatrix} 1 & -2 & 2 \\\\ 2 & -1 & -2 \\\\ 2 & 2 & 1 \\end{bmatrix}$; its first two columns form a rectangular $Q$ with orthonormal columns.

**Orthogonal matrices preserve lengths and angles**: $\\lVert Qx \\rVert^2 = x^TQ^TQx = x^Tx = \\lVert x \\rVert^2$. That's why they're numerically stable — they never amplify errors.`,
    related: ["mit1806-orthogonality-orthonormal-bases-simplify", "mit1806-orthogonality-gram-schmidt"],
  },
  {
    id: "mit1806-orthogonality-orthonormal-bases-simplify",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why do orthonormal columns make projection and least squares trivial? What do P and x̂ become?",
    back: `For a general basis (columns of $A$): $\\hat{x} = (A^TA)^{-1}A^Tb$ and $P = A(A^TA)^{-1}A^T$.

With **orthonormal** columns $Q$, the troublesome $Q^TQ$ is just $I$:
$$\\hat{x} = Q^Tb, \\qquad P = Q(Q^TQ)^{-1}Q^T = QQ^T.$$
No matrix to invert — each coordinate is a single dot product, $\\hat{x}_i = q_i^Tb$, independent of the other basis vectors.

- If $Q$ is **square** (orthogonal), its columns span everything, so $P = QQ^T = I$ and $b = \\sum_i (q_i^Tb)\\,q_i$ — expanding a vector in an orthonormal basis.
- Otherwise $QQ^T$ projects onto the column space, while $Q^TQ = I$ (note the order matters).

This is why orthonormal bases are preferred everywhere — Fourier series, the FFT, wavelets, and numerical least squares via $A = QR$.`,
    related: ["mit1806-orthogonality-orthonormal-orthogonal-matrices", "mit1806-orthogonality-qr-factorization", "mit1806-orthogonality-projection-onto-subspace"],
  },
  {
    id: "mit1806-orthogonality-gram-schmidt",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Apply Gram–Schmidt to a = (1, 1, 1) and b = (1, 0, 2), and state the general step for a third vector c.",
    back: `**Goal**: from independent vectors, build an **orthonormal** basis of the same space (where elimination aimed for *triangular*, Gram–Schmidt aims for *orthonormal*).

**Step 1**: keep the first direction: $A = a = (1, 1, 1)$.

**Step 2**: subtract from $b$ its projection onto $A$ — what's left is perpendicular to $A$:
$$B = b - \\frac{A^Tb}{A^TA}A = \\begin{bmatrix} 1 \\\\ 0 \\\\ 2 \\end{bmatrix} - \\frac33\\begin{bmatrix} 1 \\\\ 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ -1 \\\\ 1 \\end{bmatrix}.$$
Check: $A^TB = 0 - 1 + 1 = 0$. ✓

**Step 3**: normalize:
$$q_1 = \\frac{A}{\\lVert A \\rVert} = \\frac{1}{\\sqrt3}\\begin{bmatrix} 1 \\\\ 1 \\\\ 1 \\end{bmatrix}, \\qquad q_2 = \\frac{B}{\\lVert B \\rVert} = \\frac{1}{\\sqrt2}\\begin{bmatrix} 0 \\\\ -1 \\\\ 1 \\end{bmatrix}.$$
$Q = [\\,q_1\\ q_2\\,]$ has the same column space (the plane spanned by $a$ and $b$) and orthonormal columns.

**Third vector**: subtract its components along **both** earlier directions:
$$C = c - \\frac{A^Tc}{A^TA}A - \\frac{B^Tc}{B^TB}B,$$
then normalize. In general, each new vector loses its projections onto all previous ones.`,
    pitfall:
      "Subtract projections onto the already-orthogonalized vectors (A, B, …), not onto the original a, b. Using the originals gives vectors that are not orthogonal.",
    related: ["mit1806-orthogonality-qr-factorization", "mit1806-orthogonality-projection-onto-line"],
  },
  {
    id: "mit1806-orthogonality-qr-factorization",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Gram–Schmidt give the factorization A = QR? Why is R upper triangular, and how does QR help with least squares?",
    back: `Just as elimination is $A = LU$, **Gram–Schmidt is $A = QR$**: $Q$ has the orthonormal columns it produced, and $R$ records how to rebuild the original columns from them.

For two columns:
$$\\begin{bmatrix} a_1 & a_2 \\end{bmatrix} = \\begin{bmatrix} q_1 & q_2 \\end{bmatrix}\\begin{bmatrix} q_1^Ta_1 & q_1^Ta_2 \\\\ q_2^Ta_1 & q_2^Ta_2 \\end{bmatrix}, \\qquad R = Q^TA.$$

**Why $R$ is upper triangular**: $q_2^Ta_1 = 0$ because $q_1$ points along $a_1$, and $q_2$ was built perpendicular to $q_1$. In general each $q_j$ is perpendicular to all earlier $a_i$ (they lie in the span of $q_1, \\ldots, q_{j-1}$), so all entries below the diagonal vanish.

**Example** ($a_1 = (1, 1, 1)$, $a_2 = (1, 0, 2)$, from the previous card): $R = \\begin{bmatrix} \\sqrt3 & \\sqrt3 \\\\ 0 & \\sqrt2 \\end{bmatrix}$.

**Least squares with QR**: $A^TA\\hat{x} = A^Tb$ becomes $R^TQ^TQR\\hat{x} = R^TQ^Tb$, i.e. $R\\hat{x} = Q^Tb$ — a triangular system solved by back substitution. This avoids forming $A^TA$, which squares the problem's sensitivity to errors; numerical software solves least squares this way.`,
    related: ["mit1806-orthogonality-gram-schmidt", "mit1806-elimination-a-equals-lu", "mit1806-orthogonality-orthonormal-bases-simplify"],
  },
];
