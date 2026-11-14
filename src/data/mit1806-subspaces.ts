// MIT 18.06SC Linear Algebra (Fall 2011, Gilbert Strang) — Unit I, part 2:
// Vector Spaces and the Four Subspaces (Lectures 6-12; Lecture 13 is the
// Unit I exam review and carries no new material). Sourced from the course's
// own per-lecture summaries, read page-by-page, with every matrix example
// recomputed exactly. Lecture 6 covers column space and nullspace; Lecture 7
// computing the nullspace (pivots, free variables, special solutions, rref);
// Lecture 8 solvability and the complete solution of Ax = b, and the four
// rank cases; Lecture 9 independence, span, basis and dimension; Lecture 10
// the four fundamental subspaces; Lecture 11 other vector spaces (matrix
// spaces, solution spaces of ODEs) and rank-one matrices; Lecture 12 graphs,
// incidence matrices, Kirchhoff's law and Euler's formula. Correction to the
// Lecture 11 summary: its dimension formula reads dim(S ∪ U), but the
// correct statement uses the sum S + U (the union isn't a subspace). Graph
// cards cross-link the 6.1200J graph module. See src/data/courses.ts.
import type { Card } from "./types";

const MODULE = "mit1806-subspaces";

export const mit1806SubspacesCards: Card[] = [
  // --- Lecture 6: Column space and nullspace ---
  {
    id: "mit1806-subspaces-nullspace-is-subspace",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that the nullspace N(A) is a subspace, and explain why the solutions of Ax = b (b ≠ 0) are not.",
    back: `**Nullspace**: $N(A) = \\{x \\mid Ax = 0\\}$. For an $m \\times n$ matrix it lives in $\\mathbb{R}^n$ (while the column space lives in $\\mathbb{R}^m$).

**Theorem.** $N(A)$ is a subspace of $\\mathbb{R}^n$.

**Proof.** It contains $0$ since $A0 = 0$. It is closed under linear combinations: if $Ax = 0$ and $Ay = 0$, then for any scalars $c, d$,
$$A(cx + dy) = c\\,Ax + d\\,Ay = 0 + 0 = 0. \\;\\blacksquare$$

**Solutions of $Ax = b$ with $b \\neq 0$ are not a subspace**: $0$ is not a solution ($A0 = 0 \\neq b$). Geometrically they form a line or plane **shifted away from the origin** — parallel to $N(A)$.

**Example**: $A = \\begin{bmatrix} 1 & 1 & 2 \\\\ 2 & 1 & 3 \\\\ 3 & 1 & 4 \\\\ 4 & 1 & 5 \\end{bmatrix}$. Column 3 = column 1 + column 2, so $N(A)$ is the line of multiples of $(1, 1, -1)$ in $\\mathbb{R}^3$. The solutions of $Ax = (1, 2, 3, 4)$ form a parallel line through $(1, 0, 0)$ and $(0, -1, 1)$ — not through the origin.

Related facts: the **intersection** of two subspaces is a subspace (both are closed under combinations, so their common part is too); the **union** usually isn't.`,
    related: ["mit1806-subspaces-column-space-solvability", "mit1806-elimination-vector-spaces-subspaces"],
  },
  {
    id: "mit1806-subspaces-column-space-solvability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "For which right-hand sides b can Ax = b be solved? Illustrate with a 4×3 matrix whose columns are dependent.",
    back: `**Answer**: $Ax = b$ is solvable **exactly when $b$ is in the column space $C(A)$** — because $Ax$ *is* a combination of the columns, with $x$ supplying the weights. A useful way to generate solvable $b$'s: pick any $x$ and compute $b = Ax$.

**Example**: $A = \\begin{bmatrix} 1 & 1 & 2 \\\\ 2 & 1 & 3 \\\\ 3 & 1 & 4 \\\\ 4 & 1 & 5 \\end{bmatrix}$ — four equations, three unknowns.
- Three columns can't fill $\\mathbb{R}^4$, so most $b$ have no solution.
- Worse, the columns aren't independent: column 3 = column 1 + column 2 adds nothing new. $C(A)$ is only a **2-dimensional plane** inside $\\mathbb{R}^4$.

Two different questions to keep apart:
- **Existence** — is $b \\in C(A)$? (column space, a subspace of $\\mathbb{R}^m$)
- **Uniqueness** — is $N(A) = \\{0\\}$? (nullspace, a subspace of $\\mathbb{R}^n$)

Every solvable system has solution set = one particular solution + all of $N(A)$.`,
    related: ["mit1806-subspaces-nullspace-is-subspace", "mit1806-subspaces-complete-solution"],
  },

  // --- Lecture 7: Solving Ax = 0 ---
  {
    id: "mit1806-subspaces-special-solutions",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Compute the nullspace of A = [[1,2,2,2],[2,4,6,8],[3,6,8,10]] using pivots, free variables and special solutions.",
    back: `**Elimination still works on singular/rectangular matrices**, and row operations don't change the nullspace (no augmentation needed: the right side is 0).

$$A \\to \\begin{bmatrix} 1 & 2 & 2 & 2 \\\\ 0 & 0 & 2 & 4 \\\\ 0 & 0 & 2 & 4 \\end{bmatrix} \\to U = \\begin{bmatrix} 1 & 2 & 2 & 2 \\\\ 0 & 0 & 2 & 4 \\\\ 0 & 0 & 0 & 0 \\end{bmatrix}$$
No pivot in column 2, so the second pivot is the 2 in column 3. Row 3 became zero — it was row 1 + row 2. $U$ is in **echelon (staircase) form**.

- **Rank** $r$ = number of pivots $= 2$.
- **Pivot columns**: 1 and 3. **Free columns**: 2 and 4 → **free variables** $x_2, x_4$ can be anything.

**Special solutions**: set one free variable to 1, the others to 0, and back-substitute in $Ux = 0$:
- $x_2 = 1, x_4 = 0$: $2x_3 = 0$, then $x_1 = -2$ → $s_1 = (-2, 1, 0, 0)$ (column 2 is twice column 1).
- $x_2 = 0, x_4 = 1$: $2x_3 + 4 = 0 \\Rightarrow x_3 = -2$, then $x_1 = 2$ → $s_2 = (2, 0, -2, 1)$.

$N(A)$ = all combinations $c_1 s_1 + c_2 s_2$. There is one special solution per free variable: $n - r = 4 - 2 = 2$.`,
    related: ["mit1806-subspaces-rref-nullspace-matrix", "mit1806-subspaces-rank-nullity"],
  },
  {
    id: "mit1806-subspaces-rref-nullspace-matrix",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the reduced row echelon form R, what does R = [I F; 0 0] look like, and how does it give the nullspace matrix N directly?",
    back: `Keep eliminating past $U$: make every pivot **1** and clear the entries **above** the pivots too. For the matrix of the previous card:
$$U = \\begin{bmatrix} 1 & 2 & 2 & 2 \\\\ 0 & 0 & 2 & 4 \\\\ 0 & 0 & 0 & 0 \\end{bmatrix} \\to R = \\begin{bmatrix} 1 & 2 & 0 & -2 \\\\ 0 & 0 & 1 & 2 \\\\ 0 & 0 & 0 & 0 \\end{bmatrix}.$$

**Block form**: reorder columns to put the pivot columns first:
$$R = \\begin{bmatrix} I & F \\\\ 0 & 0 \\end{bmatrix},$$
with $I$ the $r \\times r$ identity (pivot columns), $F$ the free columns, and zero rows for dependent rows of $A$.

**Nullspace matrix**: $N = \\begin{bmatrix} -F \\\\ I \\end{bmatrix}$ (here $I$ is $(n - r) \\times (n - r)$). Then
$$RN = \\begin{bmatrix} I & F \\end{bmatrix}\\begin{bmatrix} -F \\\\ I \\end{bmatrix} = -F + F = 0,$$
so the **columns of $N$ are exactly the special solutions** — read straight off $R$ by flipping the sign of $F$. (Undo the column reordering to put the entries back in place: here $F = \\begin{bmatrix} 2 & -2 \\\\ 0 & 2 \\end{bmatrix}$ gives $(-2, 1, 0, 0)$ and $(2, 0, -2, 1)$.)`,
    related: ["mit1806-subspaces-special-solutions", "mit1806-subspaces-rank-cases"],
  },

  // --- Lecture 8: Solving Ax = b ---
  {
    id: "mit1806-subspaces-complete-solution",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "For A = [[1,2,2,2],[2,4,6,8],[3,6,8,10]], find the solvability condition on b and the complete solution of Ax = (1, 5, 6).",
    back: `**Solvability**: eliminate on the augmented matrix $[A \\mid b]$:
$$\\left[\\begin{array}{cccc|c} 1 & 2 & 2 & 2 & b_1 \\\\ 2 & 4 & 6 & 8 & b_2 \\\\ 3 & 6 & 8 & 10 & b_3 \\end{array}\\right] \\to \\left[\\begin{array}{cccc|c} 1 & 2 & 2 & 2 & b_1 \\\\ 0 & 0 & 2 & 4 & b_2 - 2b_1 \\\\ 0 & 0 & 0 & 0 & b_3 - b_2 - b_1 \\end{array}\\right].$$
The zero row demands $b_3 - b_2 - b_1 = 0$. In general: **if a combination of the rows of $A$ gives the zero row, the same combination of the $b_i$ must be 0.** This is equivalent to $b \\in C(A)$. $b = (1, 5, 6)$ passes.

**Particular solution**: set all free variables to 0 ($x_2 = x_4 = 0$) and solve for the pivot variables: $2x_3 = 3$, $x_1 + 2x_3 = 1$, so $x_p = (-2, 0, \\tfrac32, 0)$.

**Complete solution** = particular + nullspace:
$$x = x_p + x_n = \\begin{bmatrix} -2 \\\\ 0 \\\\ 3/2 \\\\ 0 \\end{bmatrix} + c_1\\begin{bmatrix} -2 \\\\ 1 \\\\ 0 \\\\ 0 \\end{bmatrix} + c_2\\begin{bmatrix} 2 \\\\ 0 \\\\ -2 \\\\ 1 \\end{bmatrix}.$$
*Why*: $Ax_p = b$ and $Ax_n = 0$ add to $A(x_p + x_n) = b$; and any two solutions differ by a nullspace vector. Geometrically: a 2-dimensional plane in $\\mathbb{R}^4$, parallel to $N(A)$, through $x_p$.`,
    related: ["mit1806-subspaces-special-solutions", "mit1806-subspaces-rank-cases", "mit1806-subspaces-column-space-solvability"],
  },
  {
    id: "mit1806-subspaces-rank-cases",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "For an m×n matrix of rank r, how many solutions can Ax = b have in each of the four rank cases?",
    back: `Always $r \\leq m$ and $r \\leq n$. With pivot columns first, the reduced form $R$ tells you everything:

| Case | $R$ | Solutions of $Ax = b$ | Example shape |
|---|---|---|---|
| $r = m = n$ (invertible) | $I$ | exactly **1** | square |
| $r = n < m$ (full column rank) | $\\begin{bmatrix} I \\\\ 0 \\end{bmatrix}$ | **0 or 1** | tall |
| $r = m < n$ (full row rank) | $\\begin{bmatrix} I & F \\end{bmatrix}$ | **infinitely many** (always solvable) | wide |
| $r < m$, $r < n$ | $\\begin{bmatrix} I & F \\\\ 0 & 0 \\end{bmatrix}$ | **0 or infinitely many** | rank-deficient |

**Full column rank** ($r = n$): independent columns, $N(A) = \\{0\\}$, no free variables — a solution, if one exists, is unique. Common in applications (more measurements than unknowns → least squares).

**Full row rank** ($r = m$): no zero rows in $R$, so no conditions on $b$ — every $b$ is reachable, with $n - m$ free variables giving infinitely many solutions.`,
    related: ["mit1806-subspaces-complete-solution", "mit1806-subspaces-four-subspaces"],
  },

  // --- Lecture 9: Independence, basis, and dimension ---
  {
    id: "mit1806-subspaces-independence",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define linear independence, prove that the columns of A are independent iff N(A) = {0}, and show that more than m vectors in ℝᵐ are always dependent.",
    back: `**Definition**: $x_1, \\ldots, x_n$ are **linearly independent** if $c_1x_1 + \\cdots + c_nx_n = 0$ only when every $c_i = 0$. Two vectors are independent iff they don't lie on one line; three iff they don't lie in one plane.

**Theorem.** The columns of $A$ are independent $\\iff N(A) = \\{0\\}$.
**Proof.** $Ac = c_1(\\text{col}_1) + \\cdots + c_n(\\text{col}_n)$. "Only the zero combination gives 0" says precisely "$Ac = 0$ only for $c = 0$", i.e. $N(A) = \\{0\\}$. $\\blacksquare$

Equivalently: independent columns ⟺ every column is a pivot column ⟺ $\\text{rank} = n$ ⟺ no free variables.

**Theorem.** Any $n > m$ vectors in $\\mathbb{R}^m$ are dependent.
**Proof.** Put them as the columns of an $m \\times n$ matrix $A$. There are at most $m$ pivots (one per row), so with $n > m$ columns at least $n - m \\geq 1$ column is free. Setting that free variable to 1 gives a **nonzero** special solution of $Ax = 0$, i.e. a nontrivial combination of the columns equal to 0. $\\blacksquare$

E.g. any 3 vectors in $\\mathbb{R}^2$ are dependent.`,
    related: ["mit1806-subspaces-basis-dimension", "mit1806-subspaces-special-solutions"],
  },
  {
    id: "mit1806-subspaces-basis-dimension",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define span, basis and dimension. Find bases for C(A) and N(A) when A = [[1,2,3,1],[1,1,2,1],[1,2,3,1]].",
    back: `- $v_1, \\ldots, v_k$ **span** a space $S$ if $S$ consists of all their combinations — the smallest space containing them. (The columns of $A$ span $C(A)$.)
- A **basis** of a space is a sequence of vectors that are **independent** *and* **span** it. Every vector in the space is then a combination of the basis vectors in exactly one way.
- **Dimension**: every basis of a given space has the **same number** of vectors; that number is its dimension. $\\dim \\mathbb{R}^n = n$.

$n$ vectors in $\\mathbb{R}^n$ form a basis iff they are the columns of an **invertible** matrix. E.g. $(1, 1, 2), (2, 2, 5), (3, 3, 8)$ is not a basis of $\\mathbb{R}^3$: as columns, the matrix has two equal rows, so it's singular.

**Example.** $A = \\begin{bmatrix} 1 & 2 & 3 & 1 \\\\ 1 & 1 & 2 & 1 \\\\ 1 & 2 & 3 & 1 \\end{bmatrix}$: column 3 = column 1 + column 2 and column 4 = column 1, so the **pivot columns 1 and 2** form a basis of $C(A)$, and $\\text{rank } A = \\dim C(A) = 2$. The special solutions $(-1, -1, 1, 0)$ and $(-1, 0, 0, 1)$ form a basis of $N(A)$, so $\\dim N(A) = n - r = 2$.

Vocabulary: **matrices have a rank; subspaces have a dimension.** $\\text{rank}(A) = \\dim C(A)$.`,
    pitfall:
      "A basis of C(A) uses the pivot columns of A itself, not of U or R — elimination changes the column space (but not the row space or nullspace).",
    related: ["mit1806-subspaces-independence", "mit1806-subspaces-four-subspaces"],
  },

  // --- Lecture 10: The four fundamental subspaces ---
  {
    id: "mit1806-subspaces-four-subspaces",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Name the four fundamental subspaces of an m×n matrix A of rank r: where each lives, its dimension, and how to find a basis.",
    back: `| Subspace | Lives in | Dimension | Basis |
|---|---|---|---|
| Column space $C(A)$ | $\\mathbb{R}^m$ | $r$ | the pivot columns **of $A$** |
| Row space $C(A^T)$ | $\\mathbb{R}^n$ | $r$ | the first $r$ rows **of $R$** |
| Nullspace $N(A)$ | $\\mathbb{R}^n$ | $n - r$ | the special solutions |
| Left nullspace $N(A^T)$ | $\\mathbb{R}^m$ | $m - r$ | the last $m - r$ rows of $E$, where $E[A \\mid I] = [R \\mid E]$ |

**Row space and $R$**: elimination changes the column space but **not** the row space — the rows of $R$ are combinations of the rows of $A$, and (since elimination is reversible) vice versa. So the nonzero rows of $R$ are a basis for $C(A^T)$, and row rank = column rank = $r$.

**Left nullspace** $N(A^T) = \\{y \\mid A^Ty = 0\\} = \\{y \\mid y^TA = 0\\}$ — "left" because $y^T$ multiplies $A$ from the left. Eliminate on $[A \\mid I]$ to get $EA = R$. The bottom $m - r$ rows of $R$ are zero, so the bottom $m - r$ rows of $E$ satisfy $y^TA = 0$ — they record the row dependencies.

Example: for $A = \\begin{bmatrix} 1 & 2 & 3 & 1 \\\\ 1 & 1 & 2 & 1 \\\\ 1 & 2 & 3 & 1 \\end{bmatrix}$, the last row of $E$ is $(-1, 0, 1)$: row 3 − row 1 = 0.

Dimension checks: $r + (n - r) = n$ and $r + (m - r) = m$.`,
    related: ["mit1806-subspaces-rank-nullity", "mit1806-subspaces-basis-dimension", "mit1806-subspaces-incidence-matrices"],
  },
  {
    id: "mit1806-subspaces-rank-nullity",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the rank–nullity theorem dim C(A) + dim N(A) = n, and that row rank equals column rank.",
    back: `Let $A$ be $m \\times n$ and reduce it to $R$ with $r$ pivots. Elimination doesn't change $N(A)$ or the row space, and it preserves which columns are combinations of which, so we can read everything off $R$.

**Rank–nullity.** $\\dim C(A) + \\dim N(A) = n$.
**Proof.** Every one of the $n$ columns is either a **pivot column** or a **free column**.
- The $r$ pivot columns of $A$ are independent (in $R$ they're the columns of $I$) and every free column is a combination of them, so they form a basis of $C(A)$: $\\dim C(A) = r$.
- There's one special solution per free variable. They're independent — each has a 1 in its own free position where the others have 0 — and every $x \\in N(A)$ is the combination of them given by its own free entries. So $\\dim N(A) = n - r$.

Adding: $r + (n - r) = n$. $\\blacksquare$

**Row rank = column rank.** The nonzero rows of $R$ span the row space of $A$, and there are $r$ of them. They're independent: each has a 1 in a pivot column where every other row of $R$ has a 0. So $\\dim C(A^T) = r = \\dim C(A)$. $\\blacksquare$

Applying rank–nullity to $A^T$ (with $m$ columns) gives $\\dim N(A^T) = m - r$.`,
    related: ["mit1806-subspaces-four-subspaces", "mit1806-subspaces-special-solutions"],
  },

  // --- Lecture 11: Matrix spaces; rank 1; small world graphs ---
  {
    id: "mit1806-subspaces-other-vector-spaces",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give examples of vector spaces whose 'vectors' aren't columns in ℝⁿ: matrix spaces (with dimensions), and solutions of y'' + y = 0. Which natural subsets fail to be subspaces?",
    back: `Anything you can **add** and **multiply by scalars** (following the usual rules) forms a vector space.

**3×3 matrices** $M$: dimension 9 (it behaves like $\\mathbb{R}^9$; a basis is the 9 matrices with a single 1). Subspaces:
- symmetric matrices $S$: dimension **6** (choose the diagonal and the upper triangle);
- upper triangular $U$: dimension **6**;
- $S \\cap U$ = diagonal matrices $D$: dimension **3**.

$S \\cup U$ is **not** a subspace (a symmetric plus an upper triangular matrix is usually neither). Its "fill-in" is the **sum** $S + U = \\{s + u\\}$, which here is all of $M$. Dimensions satisfy
$$\\dim S + \\dim U = \\dim(S + U) + \\dim(S \\cap U): \\quad 6 + 6 = 9 + 3.$$

**Functions**: the solutions of $y'' + y = 0$ form a **nullspace** (of a differential operator): $\\cos x$, $\\sin x$, $e^{ix}$, … The complete solution $y = c_1\\cos x + c_2\\sin x$ shows it's a 2-dimensional space with basis $\\{\\cos x, \\sin x\\}$.

**Not subspaces**: the rank-4 matrices in the $5 \\times 17$ matrices (a sum of two rank-4 matrices needn't have rank 4, even with $0$ added). **Subspace**: $\\{v \\in \\mathbb{R}^4 \\mid v_1 + v_2 + v_3 + v_4 = 0\\}$ — the nullspace of $\\begin{bmatrix} 1 & 1 & 1 & 1 \\end{bmatrix}$, of dimension $4 - 1 = 3$.`,
    pitfall:
      "The summary for this lecture writes dim(S ∪ U) in the dimension formula — it must be dim(S + U). The union isn't a subspace, so it has no dimension.",
    related: ["mit1806-subspaces-rank-one-matrices", "mit1806-elimination-vector-spaces-subspaces"],
  },
  {
    id: "mit1806-subspaces-rank-one-matrices",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does a rank-one matrix look like, and why are rank-one matrices called building blocks?",
    back: `$\\text{rank}(A) = \\dim C(A) = \\dim C(A^T)$. A matrix has **rank 1** when every column is a multiple of one column (equivalently every row a multiple of one row):
$$A = \\begin{bmatrix} 1 & 4 & 5 \\\\ 2 & 8 & 10 \\end{bmatrix} = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}\\begin{bmatrix} 1 & 4 & 5 \\end{bmatrix}.$$

**Every rank-1 matrix is a column times a row**: $A = uv^T$. Then $C(A)$ is the line through $u$ and the row space is the line through $v$.

**Building blocks**: the column-times-row view of multiplication writes any product as a sum of rank-1 pieces, $AB = \\sum_k (\\text{col}_k A)(\\text{row}_k B)$, and every rank-$r$ matrix is a sum of $r$ rank-1 matrices. This becomes concrete in the **SVD**, $A = \\sigma_1u_1v_1^T + \\cdots + \\sigma_ru_rv_r^T$, where keeping only the largest terms gives the best low-rank approximation — the idea behind image compression and recommender systems.

**Storage**: a rank-1 $m \\times n$ matrix needs only $m + n$ numbers instead of $mn$.`,
    related: ["mit1806-subspaces-other-vector-spaces", "mit1806-elimination-four-ways-to-multiply"],
  },

  // --- Lecture 12: Graphs, networks, incidence matrices ---
  {
    id: "mit1806-subspaces-incidence-matrices",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the incidence matrix of a directed graph, and what do its four subspaces mean for an electrical network (potentials, currents, Kirchhoff's law)?",
    back: `**Incidence matrix**: one **row per edge**, one **column per node**. An edge from node $a$ to node $b$ has $-1$ in column $a$ and $+1$ in column $b$; all else 0. (Large graphs give **sparse** matrices.) For 4 nodes and 5 edges (1→2, 2→3, 1→3, 1→4, 3→4):
$$A = \\begin{bmatrix} -1 & 1 & 0 & 0 \\\\ 0 & -1 & 1 & 0 \\\\ -1 & 0 & 1 & 0 \\\\ -1 & 0 & 0 & 1 \\\\ 0 & 0 & -1 & 1 \\end{bmatrix}.$$

- **$Ax$ = potential differences** across the edges, if $x$ gives node potentials ($x_2 - x_1$, …).
- **Nullspace**: $Ax = 0$ iff all potentials are equal — $N(A)$ is spanned by $(1, 1, 1, 1)$, dimension 1. Only differences are observable, so you **ground** one node to fix the rest. Hence $\\text{rank } A = n - 1 = 3$.
- **Loops ↔ dependent rows**: edges 1→2, 2→3, 1→3 form a loop, and row 3 = row 1 + row 2.
- **Pivot columns ↔ a spanning tree**: the independent edges connect all nodes without a loop.
- **Left nullspace = Kirchhoff's current law**: $A^Ty = 0$ says the net current $y$ at every node is zero. $\\dim N(A^T) = m - r = 5 - 3 = 2$, one basis vector per independent loop: $(1, 1, -1, 0, 0)$ (around nodes 1-2-3) and $(0, 0, 1, -1, 1)$ (around 1-3-4).

The full network: $e = Ax$ (differences), $y = Ce$ (Ohm's law, conductances), $A^Ty = f$ (current sources), combining into $A^TCAx = f$ — the central equation of applied linear algebra.`,
    related: ["mit1806-subspaces-euler-formula", "mit1806-subspaces-four-subspaces", "mit6120-graphs-trees-n-minus-1-edges"],
  },
  {
    id: "mit1806-subspaces-euler-formula",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Use the dimensions of the four subspaces of an incidence matrix to derive Euler's formula: nodes − edges + loops = 1 (for a connected graph).",
    back: `Let a **connected** directed graph have $n$ nodes and $m$ edges, with $m \\times n$ incidence matrix $A$.

1. **Nullspace**: $Ax = 0$ means $x_b - x_a = 0$ along every edge. Since the graph is connected, all potentials must be equal, so $N(A)$ is spanned by $(1, \\ldots, 1)$: $\\dim N(A) = 1$.
2. **Rank** by rank–nullity: $r = n - \\dim N(A) = n - 1$.
3. **Left nullspace**: $\\dim N(A^T) = m - r = m - (n - 1)$. Its vectors are current flows obeying Kirchhoff's current law, and a basis is given by currents around the **independent loops** (each loop circulates one unit of current, and balances at every node). So the number of independent loops is $m - n + 1$.

Rearranging $\\text{loops} = m - n + 1$:
$$\\text{nodes} - \\text{edges} + \\text{loops} = 1. \\;\\blacksquare$$

Check on the 4-node, 5-edge example: $4 - 5 + 2 = 1$. ✓

Special case: a **tree** has no loops, so it has exactly $n - 1$ edges — the same fact proved combinatorially (by pruning leaves) in 6.1200J.`,
    related: ["mit1806-subspaces-incidence-matrices", "mit1806-subspaces-rank-nullity", "mit6120-graphs-trees-n-minus-1-edges"],
  },
];
