// MIT 18.06SC Linear Algebra (Fall 2011, Gilbert Strang) — Unit I, part 1:
// Elimination (Lectures 1-5). Sourced from the course's own per-session
// lecture summaries, read page-by-page; every matrix example was recomputed
// exactly (the PDFs' matrix layouts don't survive text extraction). Lecture
// numbers follow Strang's video lectures, which the 18.06SC sessions track
// one-to-one. Lecture 1 covers the row, column and matrix pictures of Ax = b;
// Lecture 2 elimination, elimination and permutation matrices; Lecture 3 four
// views of matrix multiplication, inverses and Gauss-Jordan; Lecture 4
// (AB)^-1, (AB)^T, A = LU and the cost of elimination; Lecture 5 PA = LU,
// transposes and symmetric matrices, and vector spaces/subspaces. This is the
// first module of the app's linear algebra track — the core of KU Leuven's
// "Lineaire algebra" and the starting point for "Numerieke wiskunde".
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit1806-elimination";

export const mit1806EliminationCards: Card[] = [
  // --- Lecture 1: The geometry of linear equations ---
  {
    id: "mit1806-elimination-three-pictures",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the row picture, the column picture and the matrix picture of a system of linear equations, using 2x − y = 0, −x + 2y = 3.",
    back: `**Row picture** — each equation is a line (in 3D, a plane); the solution is where they **intersect**. Here the lines $2x - y = 0$ and $-x + 2y = 3$ meet at $(1, 2)$.

**Column picture** — rewrite the system as a **linear combination of the columns**:
$$x \\begin{bmatrix} 2 \\\\ -1 \\end{bmatrix} + y \\begin{bmatrix} -1 \\\\ 2 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 3 \\end{bmatrix}.$$
The question becomes: *which combination of the column vectors produces $b$?* Answer: 1 copy of the first plus 2 copies of the second.

**Matrix picture** — collect everything into $Ax = b$:
$$\\underbrace{\\begin{bmatrix} 2 & -1 \\\\ -1 & 2 \\end{bmatrix}}_{A}\\underbrace{\\begin{bmatrix} x \\\\ y \\end{bmatrix}}_{x} = \\underbrace{\\begin{bmatrix} 0 \\\\ 3 \\end{bmatrix}}_{b}.$$
$A$ is the **coefficient matrix**.

In $n$ dimensions the row picture (intersecting $n$ hyperplanes) becomes hard to visualize, but the column picture stays simple: find the weights that combine $n$ column vectors into $b$. Strang treats the **column picture as the fundamental one** for the whole course.`,
    related: ["mit1806-elimination-ax-combination-of-columns", "mit1806-elimination-elimination-to-u"],
  },
  {
    id: "mit1806-elimination-ax-combination-of-columns",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the two ways to compute a matrix–vector product Ax, and when can Ax = b be solved for every b?",
    back: `**By columns** (the important view): $Ax$ is a **linear combination of the columns of $A$**, with the entries of $x$ as weights:
$$\\begin{bmatrix} 2 & 5 \\\\ 1 & 3 \\end{bmatrix}\\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix} = 1\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + 2\\begin{bmatrix} 5 \\\\ 3 \\end{bmatrix} = \\begin{bmatrix} 12 \\\\ 7 \\end{bmatrix}.$$

**By rows**: each entry of $Ax$ is the **dot product** of a row of $A$ with $x$: $2 \\cdot 1 + 5 \\cdot 2 = 12$, $1 \\cdot 1 + 3 \\cdot 2 = 7$.

Same numbers, different meaning — and the column view answers the central question:

**Can $Ax = b$ be solved for every $b$?** Exactly when the combinations of the columns **fill the whole space**. If they don't, $A$ is **singular**: its columns are **linearly dependent**, and all their combinations lie on a lower-dimensional subspace (a point or line in $\\mathbb{R}^2$; a point, line or plane in $\\mathbb{R}^3$). Then $Ax = b$ has no solution for most $b$.`,
    pitfall:
      "A square system can fail to have a unique solution even though it has as many equations as unknowns — e.g. three planes that meet in a line, or columns that all lie in one plane.",
    related: ["mit1806-elimination-three-pictures", "mit1806-elimination-four-ways-to-multiply"],
  },

  // --- Lecture 2: Elimination with matrices ---
  {
    id: "mit1806-elimination-elimination-to-u",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Solve Ax = b by elimination and back substitution for A = [[1,2,1],[3,8,1],[0,4,1]], b = (2, 12, 2).",
    back: `**Forward elimination**: use each **pivot** to zero out the entries below it.
1. Pivot 1 (top-left). Row 2 − **3**·Row 1; row 3 already has a 0 in column 1.
2. Pivot 2 (now at position (2,2)). Row 3 − **2**·Row 2.
$$\\begin{bmatrix} 1 & 2 & 1 \\\\ 3 & 8 & 1 \\\\ 0 & 4 & 1 \\end{bmatrix} \\to \\begin{bmatrix} 1 & 2 & 1 \\\\ 0 & 2 & -2 \\\\ 0 & 4 & 1 \\end{bmatrix} \\to U = \\begin{bmatrix} 1 & 2 & 1 \\\\ 0 & 2 & -2 \\\\ 0 & 0 & 5 \\end{bmatrix}.$$
The pivots $1, 2, 5$ sit on the diagonal of the **upper triangular** $U$.

**Same steps on $b$** (do it by augmenting $[A \\mid b]$): $(2, 12, 2) \\to (2, 6, 2) \\to c = (2, 6, -10)$. Now $Ax = b$ has become $Ux = c$.

**Back substitution** (bottom row up): $5z = -10 \\Rightarrow z = -2$; $2y - 2z = 6 \\Rightarrow y = 1$; $x + 2y + z = 2 \\Rightarrow x = 2$. So $x = (2, 1, -2)$, which also solves the original system — every step was reversible.

Bonus fact for later: $\\det A$ = product of the pivots $= 1 \\cdot 2 \\cdot 5 = 10$.`,
    pitfall:
      "Remember to apply every row operation to b as well. Augmenting the matrix with b as an extra column makes that automatic.",
    related: ["mit1806-elimination-elimination-matrices", "mit1806-elimination-a-equals-lu"],
  },
  {
    id: "mit1806-elimination-elimination-matrices",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Express elimination steps and row exchanges as matrix multiplications. When does elimination break down?",
    back: `**Row operations are left-multiplications.** A row vector times a matrix is a combination of the matrix's **rows**. So "subtract 3 × row 1 from row 2" is multiplication by the **elimination matrix**
$$E_{21} = \\begin{bmatrix} 1 & 0 & 0 \\\\ -3 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix} \\quad (\\text{the identity with } -3 \\text{ in position } (2,1)).$$
The whole elimination is a product: $E_{32}(E_{31}(E_{21}A)) = U$, and by associativity $(E_{32}E_{31}E_{21})A = U$.

**Every step can be undone**: $E_{21}^{-1}$ *adds* 3 × row 1 back (the same matrix with $+3$). That's why solving $Ux = c$ also solves $Ax = b$.

**Permutation matrices** exchange rows: $P = \\begin{bmatrix} 0 & 1 & 0 \\\\ 1 & 0 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}$ swaps rows 1 and 2 of $PA$. Multiplying on the **right**, $AP$, swaps **columns** — and in general $PA \\neq AP$: matrix multiplication isn't commutative.

**Breakdown**:
- A **zero in a pivot position** with a nonzero entry below it: exchange rows (temporary failure).
- A zero in a pivot position with **nothing nonzero below** it: $A$ is **not invertible**, and there's no unique solution (permanent failure).`,
    related: ["mit1806-elimination-elimination-to-u", "mit1806-elimination-pa-equals-lu-permutations"],
  },

  // --- Lecture 3: Multiplication and inverse matrices ---
  {
    id: "mit1806-elimination-four-ways-to-multiply",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Give four ways to compute the product C = AB (A is m×n, B is n×p), plus block multiplication.",
    back: `| View | Description |
|---|---|
| **Row · column** | $c_{ij} = \\sum_{k=1}^{n} a_{ik} b_{kj}$: dot product of row $i$ of $A$ and column $j$ of $B$ |
| **Columns** | column $j$ of $C$ = $A$ times column $j$ of $B$ — columns of $C$ are combinations of the **columns of $A$** |
| **Rows** | row $i$ of $C$ = row $i$ of $A$ times $B$ — rows of $C$ are combinations of the **rows of $B$** |
| **Column × row** | $AB = \\sum_{k=1}^{n} (\\text{column } k \\text{ of } A)(\\text{row } k \\text{ of } B)$ — a sum of $n$ rank-one matrices |

**Column × row example**: $\\begin{bmatrix} 2 \\\\ 3 \\\\ 4 \\end{bmatrix}\\begin{bmatrix} 1 & 6 \\end{bmatrix} = \\begin{bmatrix} 2 & 12 \\\\ 3 & 18 \\\\ 4 & 24 \\end{bmatrix}$. Every column is a multiple of $(2, 3, 4)$ and every row a multiple of $(1, 6)$: its column space and row space are each a single line (a **rank-one** matrix).

**Blocks**: if $A$ and $B$ are cut into compatible blocks, multiply blocks like numbers: with $A = \\begin{bmatrix} A_1 & A_2 \\\\ A_3 & A_4 \\end{bmatrix}$, $B = \\begin{bmatrix} B_1 & B_2 \\\\ B_3 & B_4 \\end{bmatrix}$, the top-left block of $AB$ is $A_1B_1 + A_2B_3$.

Sizes: $(m \\times n)(n \\times p) = m \\times p$ — the inner dimensions must match.`,
    related: ["mit1806-elimination-ax-combination-of-columns", "mit1806-elimination-inverses-and-singularity"],
  },
  {
    id: "mit1806-elimination-inverses-and-singularity",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that if Ax = 0 for some nonzero vector x, then the square matrix A has no inverse.",
    back: `**Definition**: $A$ (square) is **invertible** (nonsingular) if some $A^{-1}$ satisfies $A^{-1}A = I = AA^{-1}$.

**Theorem.** If $Ax = 0$ for some $x \\neq 0$, then $A$ is not invertible.

**Proof.** Suppose $A^{-1}$ existed. Multiply $Ax = 0$ on the left by $A^{-1}$:
$$x = Ix = A^{-1}Ax = A^{-1}0 = 0,$$
contradicting $x \\neq 0$. $\\blacksquare$

**Example**: $\\begin{bmatrix} 1 & 3 \\\\ 2 & 6 \\end{bmatrix}\\begin{bmatrix} 3 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix}$ — three times column 1 minus column 2 is zero, so both columns lie on one line, and the matrix is singular (its determinant is 0).

**Intuition**: $A$ sends the nonzero $x$ and the zero vector to the same output 0. No inverse can map 0 back to both — $A$ is not one-to-one, so it can't be undone.

The converse also holds for square matrices: if $Ax = 0$ only for $x = 0$, then $A$ is invertible. This becomes clear with column space and nullspace (the next module).`,
    pitfall:
      "For non-square matrices 'invertible' doesn't apply; a tall matrix can have Ax = 0 only for x = 0 and still have no two-sided inverse (it may have a left inverse).",
    related: ["mit1806-elimination-gauss-jordan", "mit1806-elimination-four-ways-to-multiply"],
  },
  {
    id: "mit1806-elimination-gauss-jordan",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Use Gauss–Jordan elimination to invert A = [[1,3],[2,7]], and explain why E[A | I] = [I | E] gives E = A⁻¹.",
    back: `**Idea**: $AA^{-1} = I$ says "$A$ times column $j$ of $A^{-1}$ = column $j$ of $I$" — $n$ systems $Ax = b$ with the same $A$. Solve them all at once by augmenting $A$ with the **whole identity**.

**Gauss** (downward, to triangular form): row 2 − 2·row 1.
**Jordan** (upward, clearing above the pivots): row 1 − 3·row 2.
$$\\left[\\begin{array}{cc|cc} 1 & 3 & 1 & 0 \\\\ 2 & 7 & 0 & 1 \\end{array}\\right] \\to \\left[\\begin{array}{cc|cc} 1 & 3 & 1 & 0 \\\\ 0 & 1 & -2 & 1 \\end{array}\\right] \\to \\left[\\begin{array}{cc|cc} 1 & 0 & 7 & -3 \\\\ 0 & 1 & -2 & 1 \\end{array}\\right]$$
So $A^{-1} = \\begin{bmatrix} 7 & -3 \\\\ -2 & 1 \\end{bmatrix}$. Check: $\\begin{bmatrix} 1 & 3 \\\\ 2 & 7 \\end{bmatrix}\\begin{bmatrix} 7 & -3 \\\\ -2 & 1 \\end{bmatrix} = I$. ✓

**Why it works**: let $E$ be the product of all the elimination steps. Applied to the augmented matrix, block multiplication gives $E[A \\mid I] = [EA \\mid E]$. The left block ended as $I$, so $EA = I$ — which means $E = A^{-1}$, and the right block **is** $A^{-1}$.

(Had a pivot become 0 with no row to exchange, $A$ would be singular and the left block could never reach $I$.)`,
    related: ["mit1806-elimination-inverses-and-singularity", "mit1806-elimination-elimination-matrices"],
  },

  // --- Lecture 4: Factorization into A = LU ---
  {
    id: "mit1806-elimination-inverse-transpose-of-product",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove (AB)⁻¹ = B⁻¹A⁻¹, and state the transpose rules (AB)ᵀ = BᵀAᵀ and (A⁻¹)ᵀ = (Aᵀ)⁻¹.",
    back: `**Theorem.** If $A$ and $B$ are invertible, so is $AB$, with $(AB)^{-1} = B^{-1}A^{-1}$.

**Proof.** Check both products using associativity:
$$(AB)(B^{-1}A^{-1}) = A(BB^{-1})A^{-1} = AIA^{-1} = AA^{-1} = I,$$
$$(B^{-1}A^{-1})(AB) = B^{-1}(A^{-1}A)B = B^{-1}B = I. \\;\\blacksquare$$

**Reverse order** — like taking off shoes and socks: you undo the last thing done first.

**Transposes**: $(A^T)_{ij} = A_{ji}$ (rows become columns), and
- $(AB)^T = B^TA^T$ — reverse order again;
- $(A^{-1})^T = (A^T)^{-1}$. *Proof*: transpose $AA^{-1} = I$ to get $(A^{-1})^TA^T = I^T = I$, so $(A^{-1})^T$ is the inverse of $A^T$.

These are used constantly: e.g. inverting $E = E_{32}E_{21}$ gives $E^{-1} = E_{21}^{-1}E_{32}^{-1}$ — the key to $A = LU$.`,
    pitfall:
      "(AB)⁻¹ = A⁻¹B⁻¹ is wrong in general (matrices don't commute). Only the reversed order B⁻¹A⁻¹ is correct.",
    related: ["mit1806-elimination-a-equals-lu", "mit1806-elimination-transposes-symmetric"],
  },
  {
    id: "mit1806-elimination-a-equals-lu",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does elimination produce the factorization A = LU (and A = LDU)? Why is L nicer than the elimination matrix E?",
    back: `If elimination needs no row exchanges, $EA = U$ with $E = \\cdots E_{32}E_{31}E_{21}$, so
$$A = E^{-1}U = E_{21}^{-1}E_{31}^{-1}E_{32}^{-1}U = LU.$$
$L$ is **lower triangular with 1s on the diagonal**; $U$ is upper triangular with the pivots on its diagonal.

**2×2 example**: subtracting 4 × row 1 gives $\\begin{bmatrix} 2 & 1 \\\\ 8 & 7 \\end{bmatrix} = \\begin{bmatrix} 1 & 0 \\\\ 4 & 1 \\end{bmatrix}\\begin{bmatrix} 2 & 1 \\\\ 0 & 3 \\end{bmatrix}$. Factor out the pivots for **LDU**: $\\begin{bmatrix} 1 & 0 \\\\ 4 & 1 \\end{bmatrix}\\begin{bmatrix} 2 & 0 \\\\ 0 & 3 \\end{bmatrix}\\begin{bmatrix} 1 & 1/2 \\\\ 0 & 1 \\end{bmatrix}$.

**Why $L$ beats $E$** (3×3, with multipliers 2 for $E_{21}$ and 5 for $E_{32}$):
$$E = E_{32}E_{21} = \\begin{bmatrix} 1 & 0 & 0 \\\\ -2 & 1 & 0 \\\\ 10 & -5 & 1 \\end{bmatrix}, \\qquad L = E^{-1} = \\begin{bmatrix} 1 & 0 & 0 \\\\ 2 & 1 & 0 \\\\ 0 & 5 & 1 \\end{bmatrix}.$$
$E$ has a stray **10** (row 3 felt row 1 *through* row 2). In $L$ the multipliers simply sit in place: **with no row exchanges, the multipliers go directly into $L$**. So $L$ can be recorded during elimination, overwriting $A$ — no extra storage.

**Use**: factor once, then each new right-hand side $b$ costs only two triangular solves, $Lc = b$ then $Ux = c$.`,
    related: ["mit1806-elimination-elimination-cost", "mit1806-elimination-pa-equals-lu-permutations", "mit1806-elimination-inverse-transpose-of-product"],
  },
  {
    id: "mit1806-elimination-elimination-cost",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "How many operations does elimination (computing A = LU) take for an n × n matrix, and how much does each right-hand side cost?",
    back: `A typical operation is "multiply one row and subtract it from another", about $n$ multiply-subtracts.

- Clearing column 1 touches the $n \\times n$ block below and right of the pivot: about $n^2$ operations.
- Column 2 works on an $(n-1) \\times (n-1)$ block: about $(n-1)^2$; and so on.

Total, by the integral approximation for a sum of squares:
$$n^2 + (n-1)^2 + \\cdots + 1^2 = \\sum_{i=1}^{n} i^2 \\approx \\int_0^n x^2\\,dx = \\frac{n^3}{3}.$$
(For $n = 100$: the exact sum is 338,350, versus $10^6/3 \\approx 333{,}333$.)

**Each right-hand side** $b$ then costs only about $n^2$ (forward elimination on $b$ plus back substitution) — negligible next to $\\frac13 n^3$. That is why you **factor once, solve many times**, and why you should almost never compute $A^{-1}$ explicitly just to solve $Ax = b$.`,
    complexity: {
      structure: "Gaussian Elimination (dense n×n)",
      operations: [
        { op: "Factor A = LU", time: "≈ n³/3 multiply-subtracts", note: "O(n³)" },
        { op: "Solve for one right-hand side (given LU)", time: "≈ n²", note: "forward + back substitution" },
        { op: "Compute A⁻¹ explicitly", time: "O(n³)", note: "rarely needed — prefer LU solves" },
      ],
      caveat: "Dense matrices; sparse/banded matrices can be far cheaper.",
    },
    related: ["mit1806-elimination-a-equals-lu", "mit6120-analysis-integral-method"],
  },

  // --- Lecture 5: Transposes, permutations, spaces Rⁿ ---
  {
    id: "mit1806-elimination-pa-equals-lu-permutations",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What happens to A = LU when row exchanges are needed? State the key facts about permutation matrices.",
    back: `When a zero lands in a pivot position, rows must be exchanged. Doing all exchanges **up front** gives
$$PA = LU,$$
where the **permutation matrix** $P$ reorders the rows of $A$ into an order that elimination can handle without further exchanges. This is the factorization that numerical software actually computes (it also exchanges rows to pick large pivots, for numerical stability).

**Permutation matrices**: the identity with its rows reordered.
- $PA$ reorders the rows of $A$; $AP$ reorders its columns.
- $P^{-1} = P^T$, i.e. $P^TP = I$ — the transpose undoes the permutation.
- There are exactly $n!$ permutation matrices of size $n \\times n$ (including $I$).
- They form a **group** under multiplication: products and inverses of permutation matrices are permutation matrices.`,
    related: ["mit1806-elimination-a-equals-lu", "mit1806-elimination-elimination-matrices", "mit6120-counting-generalized-product-rule"],
  },
  {
    id: "mit1806-elimination-transposes-symmetric",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define a symmetric matrix and prove that RᵀR is symmetric for every (even non-square) matrix R.",
    back: `**Transpose**: $(A^T)_{ij} = A_{ji}$. E.g. $\\begin{bmatrix} 1 & 3 \\\\ 2 & 3 \\\\ 4 & 1 \\end{bmatrix}^T = \\begin{bmatrix} 1 & 2 & 4 \\\\ 3 & 3 & 1 \\end{bmatrix}$.

**Symmetric**: $A^T = A$ (so $A$ is square and $a_{ij} = a_{ji}$).

**Theorem.** For any $m \\times n$ matrix $R$, the $n \\times n$ matrix $R^TR$ is symmetric.

**Proof.** Using $(AB)^T = B^TA^T$ and $(R^T)^T = R$:
$$(R^TR)^T = R^T(R^T)^T = R^TR. \\;\\blacksquare$$
(Likewise $RR^T$, which is $m \\times m$.)

Entry-wise this is clear too: $(R^TR)_{ij}$ is the dot product of columns $i$ and $j$ of $R$, which is the same as the dot product of columns $j$ and $i$.

$R^TR$ is everywhere later in the course: the **normal equations** $A^TA\\hat{x} = A^Tb$ of least squares, **positive (semi)definite** matrices, and the **SVD** (whose singular values come from the eigenvalues of $A^TA$).`,
    related: ["mit1806-elimination-inverse-transpose-of-product", "mit1806-elimination-vector-spaces-subspaces"],
  },
  {
    id: "mit1806-elimination-vector-spaces-subspaces",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What makes a collection of vectors a vector space or subspace? List all subspaces of ℝ² and ℝ³, and define the column space C(A).",
    back: `A **vector space** is a collection of vectors **closed under linear combinations**: adding any two, or multiplying by any real number, stays inside (with the usual arithmetic rules). $\\mathbb{R}^n$ — all column vectors with $n$ real components — is the basic example.

**Not a vector space**: vectors in $\\mathbb{R}^2$ with both components **positive**. It's closed under addition but not scalar multiplication: $-5$ times such a vector leaves the set.

A **subspace** is a vector space inside another one. **Every subspace contains $0$** (multiply any member by 0). So a line in $\\mathbb{R}^2$ **not** through the origin is not a subspace.

**All subspaces**:
- of $\\mathbb{R}^2$: all of $\\mathbb{R}^2$; any line through the origin; $\\{0\\}$ alone.
- of $\\mathbb{R}^3$: all of $\\mathbb{R}^3$; any plane through the origin; any line through the origin; $\\{0\\}$.

**Column space** $C(A)$: all linear combinations of the columns of $A$ — a subspace of $\\mathbb{R}^m$ for an $m \\times n$ matrix. For $A = \\begin{bmatrix} 1 & 3 \\\\ 2 & 3 \\\\ 4 & 1 \\end{bmatrix}$, $C(A)$ is the plane through the origin in $\\mathbb{R}^3$ containing $(1, 2, 4)$ and $(3, 3, 1)$.

$Ax = b$ is solvable **exactly when $b \\in C(A)$** — the bridge from equations to subspaces.`,
    pitfall:
      "A union of two subspaces (e.g. two different lines through the origin) is generally NOT a subspace — adding a vector from each leaves both lines. Intersections of subspaces are always subspaces.",
    related: ["mit1806-elimination-ax-combination-of-columns", "mit1806-elimination-transposes-symmetric"],
  },
];
