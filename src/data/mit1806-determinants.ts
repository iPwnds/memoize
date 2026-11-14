// MIT 18.06SC Linear Algebra (Fall 2011, Gilbert Strang) — Unit II, part 2:
// Determinants (Lectures 18-20). Sourced from the course's own per-lecture
// summaries, read page-by-page, with every example recomputed exactly
// (sympy). Lecture 18 builds the determinant from three defining properties
// and derives the rest (equal rows, elimination, triangular matrices,
// singularity, det AB, det Aᵀ); Lecture 19 the big formula (n! terms) and
// cofactor expansion, with a tridiagonal example; Lecture 20 the cofactor
// formula for A⁻¹, Cramer's rule, and |det A| as volume. Correction to the
// Lecture 19 summary: its 3×3 formula prints the second term as −a₁₁a₂₃a₃₃;
// the correct term is −a₁₁a₂₃a₃₂. Determinant properties are exactly the
// kind of axiomatic, proof-based treatment KU Leuven's "Lineaire algebra"
// expects. See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit1806-determinants";

export const mit1806DeterminantsCards: Card[] = [
  // --- Lecture 18: Properties of determinants ---
  {
    id: "mit1806-determinants-three-properties",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What three properties define the determinant of a square matrix, and why start from properties instead of a formula?",
    back: `The determinant $\\det A = |A|$ is a single number attached to a square matrix, encoding a lot about it — above all, **$A$ is invertible exactly when $\\det A \\neq 0$**. Strang **defines** it by three properties; everything else (including every formula) follows from them:

1. $\\det I = 1$.
2. **Exchanging two rows reverses the sign** of the determinant.
3. **Linear in each row separately** (the other rows held fixed):
   - (a) multiplying one row by $t$ multiplies the determinant by $t$;
   - (b) $\\begin{vmatrix} a + a' & b + b' \\\\ c & d \\end{vmatrix} = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} + \\begin{vmatrix} a' & b' \\\\ c & d \\end{vmatrix}$.

Immediate consequences: $\\det$ of a permutation matrix is $+1$ or $-1$, according to whether it performs an even or odd number of row exchanges; $\\begin{vmatrix} 0 & 1 \\\\ 1 & 0 \\end{vmatrix} = -1$.

**Why properties first**: they explain *why* determinants behave as they do (singularity, products, volumes), and they lead directly to the practical algorithm — eliminate and multiply the pivots — instead of an unwieldy $n!$-term formula.

**Loose end** (for full rigor): property 2 only makes sense if no permutation can be reached by both an odd and an even number of exchanges — otherwise $\\det$ would equal its own negative. That parity fact is true, and it's what makes the determinant well defined.`,
    pitfall:
      "Linearity is in EACH ROW SEPARATELY — det(A + B) ≠ det A + det B in general, and det(tA) = tⁿ det A, not t·det A.",
    related: ["mit1806-determinants-derived-properties", "mit1806-determinants-big-formula"],
  },
  {
    id: "mit1806-determinants-derived-properties",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "From the three defining properties, prove: equal rows give det 0, row elimination doesn't change det, and a triangular matrix's det is the product of its diagonal.",
    back: `**4. Two equal rows ⇒ $\\det A = 0$.** Exchanging the two equal rows leaves $A$ unchanged, yet by property 2 it flips the sign: $\\det A = -\\det A$, so $\\det A = 0$.

**5. Subtracting $t \\times$ row $i$ from row $j$ leaves $\\det$ unchanged** (so elimination preserves it). In the 2×2 case:
$$\\begin{vmatrix} a & b \\\\ c - ta & d - tb \\end{vmatrix} \\overset{3b}{=} \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} + \\begin{vmatrix} a & b \\\\ -ta & -tb \\end{vmatrix} \\overset{3a}{=} \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} - t\\begin{vmatrix} a & b \\\\ a & b \\end{vmatrix} \\overset{4}{=} \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}.$$
The $n \\times n$ proof is identical.

**6. A zero row ⇒ $\\det A = 0$.** Property 3a with $t = 0$.

**7. Triangular ⇒ $\\det$ = product of the diagonal entries $d_1 d_2 \\cdots d_n$.** If all $d_i \\neq 0$, elimination (property 5) clears the off-diagonal entries without changing $\\det$, leaving a diagonal matrix. Factoring $d_i$ out of each row (3a) gives $d_1 \\cdots d_n \\det I = d_1 \\cdots d_n$ (property 1). If some $d_i = 0$, elimination produces a zero row, so $\\det = 0$ (property 6) — still equal to the product. $\\blacksquare$`,
    related: ["mit1806-determinants-three-properties", "mit1806-determinants-singular-iff-zero"],
  },
  {
    id: "mit1806-determinants-singular-iff-zero",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that det A = 0 exactly when A is singular, and explain how computers actually compute determinants.",
    back: `**8. $\\det A = 0 \\iff A$ is singular.**

**Proof.** Run elimination, with row exchanges as needed. Elimination steps don't change $\\det$ (property 5); each row exchange flips its sign (property 2).
- If $A$ is **singular**, elimination produces a **zero row**, so $\\det A = \\pm \\det U = 0$ (property 6).
- If $A$ is **invertible**, elimination reaches a triangular $U$ with $n$ nonzero pivots, so
$$\\det A = \\pm\\, d_1 d_2 \\cdots d_n \\neq 0$$
(property 7), with sign $+$ for an even number of exchanges and $-$ for odd. $\\blacksquare$

**This is the practical algorithm**: eliminate, track the parity of row exchanges, multiply the pivots — $O(n^3)$ work, versus $n!$ terms for the big formula. For 2×2 (with $a \\neq 0$):
$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\to \\begin{bmatrix} a & b \\\\ 0 & d - \\frac{c}{a}b \\end{bmatrix} \\;\\Rightarrow\\; \\det = a\\left(d - \\frac{c}{a}b\\right) = ad - bc.$$

Earlier example: $A = \\begin{bmatrix} 1 & 2 & 1 \\\\ 3 & 8 & 1 \\\\ 0 & 4 & 1 \\end{bmatrix}$ had pivots $1, 2, 5$, so $\\det A = 10$.`,
    related: ["mit1806-determinants-derived-properties", "mit1806-elimination-elimination-to-u", "mit1806-determinants-product-and-transpose"],
  },
  {
    id: "mit1806-determinants-product-and-transpose",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State det(AB) = det A · det B and det Aᵀ = det A with their consequences, and sketch why det Aᵀ = det A.",
    back: `**9. $\\det(AB) = (\\det A)(\\det B)$** — the determinant of a product is the product of determinants (but $\\det(A + B) \\neq \\det A + \\det B$). Consequences:
- $\\det A^{-1} = \\dfrac{1}{\\det A}$, since $\\det(A^{-1}A) = \\det I = 1$ (only for invertible $A$).
- $\\det A^2 = (\\det A)^2$.
- $\\det(2A) = 2^n \\det A$ — property 3a applied to each of the $n$ rows. Like volume: doubling every edge of a 3D box multiplies its volume by $2^3 = 8$.

**10. $\\det A^T = \\det A$.** *Why*: write $PA = LU$; for simplicity take $P = I$, so $A = LU$. Then $A^T = U^TL^T$, and by rule 9
$$\\det A^T = \\det U^T \\det L^T, \\qquad \\det A = \\det L \\det U.$$
$L$ and $L^T$ are triangular with 1s on the diagonal, so both have determinant 1; $U$ and $U^T$ are triangular with the same diagonal, so they have equal determinants (property 7). Hence $\\det A^T = \\det A$. (A permutation and its transpose — its inverse — have the same parity, which covers $P$.)

**Payoff**: every row property becomes a **column property** — a zero column gives $\\det = 0$, exchanging columns flips the sign, and $\\det$ is linear in each column.`,
    related: ["mit1806-determinants-singular-iff-zero", "mit1806-elimination-a-equals-lu", "mit1806-determinants-volume"],
  },

  // --- Lecture 19: Determinant formulas and cofactors ---
  {
    id: "mit1806-determinants-big-formula",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive the 'big formula' for the determinant (a sum of n! terms), and use it on A = [[0,0,1,1],[0,1,1,0],[1,1,0,0],[1,0,0,1]].",
    back: `**Derivation**: split each row into its separate entries using linearity (property 3). For 2×2:
$$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = \\begin{vmatrix} a & 0 \\\\ c & 0 \\end{vmatrix} + \\begin{vmatrix} a & 0 \\\\ 0 & d \\end{vmatrix} + \\begin{vmatrix} 0 & b \\\\ c & 0 \\end{vmatrix} + \\begin{vmatrix} 0 & b \\\\ 0 & d \\end{vmatrix} = 0 + ad - bc + 0.$$
A piece survives only if it uses **one entry from each row and each column** (otherwise it has a zero column) — exactly the pattern of a permutation matrix, whose determinant is $\\pm 1$. So
$$\\det A = \\sum_{n! \\text{ permutations } (\\alpha, \\ldots, \\omega)} \\pm\\, a_{1\\alpha}\\, a_{2\\beta} \\cdots a_{n\\omega},$$
with $+$ for even and $-$ for odd permutations. There are $n!$ terms ($n$ choices of column in row 1, then $n - 1$ in row 2, …).

**3×3**: $a_{11}a_{22}a_{33} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32} - a_{13}a_{22}a_{31}$ (the "down-right minus down-left diagonals" mnemonic works only for 3×3).

**Example**: in $A = \\begin{bmatrix} 0 & 0 & 1 & 1 \\\\ 0 & 1 & 1 & 0 \\\\ 1 & 1 & 0 & 0 \\\\ 1 & 0 & 0 & 1 \\end{bmatrix}$ only two permutations pick all nonzero entries:
- columns $(4, 3, 2, 1)$: even (two exchanges) → $+1$;
- columns $(3, 2, 1, 4)$: odd (one exchange) → $-1$.

So $\\det A = 0$. Confirmation: row 1 − row 2 + row 3 − row 4 = 0, so $A$ is singular.`,
    pitfall:
      "The big formula is for understanding, not computing: n! terms is astronomically slow (20! ≈ 2.4·10¹⁸). Elimination is O(n³).",
    related: ["mit1806-determinants-cofactors", "mit1806-determinants-three-properties", "mit6120-counting-generalized-product-rule"],
  },
  {
    id: "mit1806-determinants-cofactors",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What are cofactors, what is the cofactor expansion of det A along a row, and what is det of the n×n tridiagonal matrix of 1s?",
    back: `**Cofactor expansion** groups the big formula by the entries of one row:
$$\\det A = a_{11}C_{11} + a_{12}C_{12} + \\cdots + a_{1n}C_{1n}.$$
The **cofactor** $C_{ij} = (-1)^{i+j} \\det M_{ij}$, where $M_{ij}$ is the $(n-1) \\times (n-1)$ matrix left after deleting row $i$ and column $j$. The sign follows a checkerboard: $+$ when $i + j$ is even. For 2×2: $\\det = ad + b(-c)$.

**Tridiagonal matrices of 1s**: $A_n$ has 1s on the diagonal and directly above and below it, e.g. $A_4 = \\begin{bmatrix} 1 & 1 & 0 & 0 \\\\ 1 & 1 & 1 & 0 \\\\ 0 & 1 & 1 & 1 \\\\ 0 & 0 & 1 & 1 \\end{bmatrix}$.

Expanding along row 1: the first term gives $1 \\cdot |A_{n-1}|$; the second, $-1$ times a matrix whose own first column has a single 1, gives $-|A_{n-2}|$. So
$$|A_n| = |A_{n-1}| - |A_{n-2}|.$$
Starting from $|A_1| = 1$, $|A_2| = 0$: $1, 0, -1, -1, 0, 1, 1, 0, \\ldots$ — the sequence **repeats every six terms**.

Cofactors turn an $n \\times n$ determinant into $n$ determinants of size $n - 1$ — great for matrices with many zeros or special structure, and the key to recurrences like this one.`,
    related: ["mit1806-determinants-big-formula", "mit1806-determinants-inverse-formula"],
  },

  // --- Lecture 20: Cramer's rule, inverse matrix, and volume ---
  {
    id: "mit1806-determinants-inverse-formula",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the cofactor formula for the inverse: A⁻¹ = Cᵀ / det A, where C is the matrix of cofactors.",
    back: `**2×2 check**: $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}^{-1} = \\dfrac{1}{ad - bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$ — the cofactor matrix is $\\begin{bmatrix} d & -c \\\\ -b & a \\end{bmatrix}$, and its **transpose** appears.

**Theorem.** $A\\,C^T = (\\det A)\\,I$, so $A^{-1} = \\dfrac{1}{\\det A}C^T$ when $\\det A \\neq 0$.

**Proof.** Entry $(i, k)$ of $AC^T$ is $\\sum_j a_{ij}C_{kj}$ — row $i$ of $A$ against the cofactors of row $k$.
- **Diagonal** ($i = k$): $\\sum_j a_{ij}C_{ij}$ is exactly the cofactor expansion of $\\det A$ along row $i$. So every diagonal entry is $\\det A$.
- **Off-diagonal** ($i \\neq k$): $\\sum_j a_{ij}C_{kj}$ is the cofactor expansion along row $k$ of the matrix obtained from $A$ by **replacing row $k$ with row $i$** — the cofactors $C_{kj}$ don't involve row $k$, so they're unchanged. That matrix has **two equal rows**, so its determinant is 0.

Hence $AC^T = (\\det A)I$. $\\blacksquare$ (2×2 off-diagonal check: $a(-b) + b(a) = 0$.)

**Use**: a closed formula showing exactly how $A^{-1}$ depends on each entry of $A$ (useful for sensitivity analysis and proofs). Not for computation — elimination is far faster.`,
    pitfall:
      "Don't forget the transpose: the cofactors of row 1 of A form COLUMN 1 of A⁻¹.",
    related: ["mit1806-determinants-cramers-rule", "mit1806-determinants-cofactors", "mit1806-elimination-gauss-jordan"],
  },
  {
    id: "mit1806-determinants-cramers-rule",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State Cramer's rule for solving Ax = b, derive it from A⁻¹ = Cᵀ/det A, and say when it's useful.",
    back: `**Cramer's rule**: if $A$ is invertible, the solution of $Ax = b$ has components
$$x_j = \\frac{\\det B_j}{\\det A},$$
where $B_j$ is $A$ with **column $j$ replaced by $b$**.

**Derivation**: $x = A^{-1}b = \\dfrac{1}{\\det A}C^Tb$. Component $j$ of $C^Tb$ is $\\sum_i b_i C_{ij}$ — the cofactor expansion **down column $j$** of the matrix whose column $j$ is $b$. That's $\\det B_j$.

**Example**: $\\begin{bmatrix} 2 & 1 \\\\ 5 & 3 \\end{bmatrix}x = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}$, $\\det A = 1$:
$$x_1 = \\begin{vmatrix} 1 & 1 \\\\ 2 & 3 \\end{vmatrix} = 1, \\qquad x_2 = \\begin{vmatrix} 2 & 1 \\\\ 5 & 2 \\end{vmatrix} = -1.$$

**When to use it**: as a **formula** — it shows the solution is a ratio of polynomials in the entries, and it handles symbolic 2×2 or 3×3 systems neatly. **Not** as an algorithm for real systems: it needs $n + 1$ determinants of size $n$, far slower than one elimination.`,
    related: ["mit1806-determinants-inverse-formula", "mit1806-determinants-volume"],
  },
  {
    id: "mit1806-determinants-volume",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is |det A| the volume of the box whose edges are the columns of A? How do you get areas of parallelograms and triangles?",
    back: `**Claim**: $|\\det A|$ = volume of the box (parallelepiped) with the columns of $A$ as edges (the rows give a different box with the same volume, since $\\det A^T = \\det A$).

**Proof idea**: show that volume satisfies the three defining properties (in absolute value):
1. $A = I$: the unit cube, volume 1. ✓ (More generally an orthogonal $Q$ gives a rotated unit cube; indeed $Q^TQ = I \\Rightarrow (\\det Q)^2 = 1$.)
2. Exchanging two edges: same box, same volume (only the sign/orientation of $\\det$ changes). ✓
3. (a) Doubling one edge doubles the volume. ✓ (b) Volume is additive in one edge with the others fixed — the "sheared slices" picture. ✓

Since the three properties determine $\\det$, $|\\det A|$ = volume. Bonus: equal edges flatten the box to volume 0, matching property 4.

**Areas without trigonometry**:
- Parallelogram with edges $(a, b)$ and $(c, d)$: area $= |ad - bc|$.
- Triangle with those edges: half that, $\\frac12|ad - bc|$.
- Triangle with vertices $(x_1, y_1), (x_2, y_2), (x_3, y_3)$:
$$\\text{area} = \\frac12\\left|\\det\\begin{bmatrix} x_1 & y_1 & 1 \\\\ x_2 & y_2 & 1 \\\\ x_3 & y_3 & 1 \\end{bmatrix}\\right|.$$
The sign of that determinant tells you the **orientation** (clockwise vs. counter-clockwise) — the cross-product test used in computational geometry.`,
    related: ["mit1806-determinants-product-and-transpose", "computational-geometry-orientation-primitive"],
  },
];
