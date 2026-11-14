// MIT 18.06SC Linear Algebra (Fall 2011, Gilbert Strang) — Unit II, part 3:
// Eigenvalues and Eigenvectors (Lectures 21-24; the Quiz 2 review, "Lecture
// 24b", carries no new material and isn't a separate tracker entry).
// Sourced from the course's own per-lecture summaries, read page-by-page,
// with every example recomputed exactly (sympy). Lecture 21 covers Ax = λx,
// the characteristic equation, trace/determinant, complex and repeated
// eigenvalues; Lecture 22 diagonalization A = SΛS⁻¹, powers of A,
// difference equations and Fibonacci; Lecture 23 du/dt = Au, stability and
// the matrix exponential; Lecture 24 Markov matrices and Fourier series as
// orthonormal expansions. The proof that eigenvectors for distinct
// eigenvalues are independent is the standard argument (the summary states
// the fact without proof). The summary's "all other eigenvalues of a Markov
// matrix are less than 1" is sharpened to |λ| ≤ 1 (strictly < 1 when every
// entry is positive). See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit1806-eigenvalues";

export const mit1806EigenvaluesCards: Card[] = [
  // --- Lecture 21: Eigenvalues and eigenvectors ---
  {
    id: "mit1806-eigenvalues-definition-examples",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are eigenvalues and eigenvectors? Give the eigenvalues and eigenvectors of a projection matrix and of the swap matrix [[0,1],[1,0]].",
    back: `A square matrix acts on vectors like a function: input $x$, output $Ax$. Usually $Ax$ points in a new direction. **Eigenvectors** are the special vectors whose direction doesn't change:
$$Ax = \\lambda x \\qquad (x \\neq 0),$$
and the number $\\lambda$ is the **eigenvalue** — the factor by which $A$ stretches $x$ (negative $\\lambda$ flips it).

**Eigenvalue 0**: $Ax = 0x = 0$ — the eigenvectors for $\\lambda = 0$ are the nonzero vectors of the **nullspace**. So $A$ is singular $\\iff$ $0$ is an eigenvalue.

**Projection onto a plane** $P$: every $x$ **in** the plane has $Px = x$ ($\\lambda = 1$); every $x$ **perpendicular** to the plane has $Px = 0$ ($\\lambda = 0$). These eigenvectors span the whole space — not true of every matrix.

**Swap** $B = \\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$: $x = (1, 1)$ is unchanged ($\\lambda = 1$) and $x = (1, -1)$ is flipped ($\\lambda = -1$). The two eigenvectors are perpendicular — because $B$ is symmetric, as proved later.

**Shifting**: $(B + 3I)x = \\lambda x + 3x = (\\lambda + 3)x$ — adding $cI$ adds $c$ to every eigenvalue and keeps the eigenvectors.`,
    pitfall:
      "Eigenvalues of A + B are generally NOT sums of eigenvalues of A and B, and eigenvalues of AB are not products — that only works when A and B share eigenvectors (like B and 3I).",
    related: ["mit1806-eigenvalues-characteristic-equation", "mit1806-orthogonality-projection-onto-subspace"],
  },
  {
    id: "mit1806-eigenvalues-characteristic-equation",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "How do you find eigenvalues and eigenvectors via det(A − λI) = 0? Work it out for A = [[3,1],[1,3]].",
    back: `$Ax = \\lambda x$ means $(A - \\lambda I)x = 0$ with $x \\neq 0$, so $A - \\lambda I$ must be **singular**:
$$\\det(A - \\lambda I) = 0 \\quad (\\text{the characteristic equation}).$$
This polynomial of degree $n$ has $n$ roots (counted with multiplicity, possibly complex) — the eigenvalues. For each $\\lambda$, the eigenvectors are the nonzero vectors of $N(A - \\lambda I)$, found by elimination.

**Example** $A = \\begin{bmatrix} 3 & 1 \\\\ 1 & 3 \\end{bmatrix}$:
$$\\det\\begin{bmatrix} 3 - \\lambda & 1 \\\\ 1 & 3 - \\lambda \\end{bmatrix} = (3 - \\lambda)^2 - 1 = \\lambda^2 - 6\\lambda + 8 = (\\lambda - 4)(\\lambda - 2).$$
- $\\lambda_1 = 4$: $A - 4I = \\begin{bmatrix} -1 & 1 \\\\ 1 & -1 \\end{bmatrix}$, nullspace spanned by $x_1 = (1, 1)$.
- $\\lambda_2 = 2$: $A - 2I = \\begin{bmatrix} 1 & 1 \\\\ 1 & 1 \\end{bmatrix}$, nullspace spanned by $x_2 = (-1, 1)$.

Note $6 = \\text{trace}$ and $8 = \\det A$: for every 2×2 matrix,
$$\\lambda^2 - (\\text{trace } A)\\,\\lambda + \\det A = 0.$$
And $A = B + 3I$ for the swap matrix $B$ — same eigenvectors, eigenvalues shifted from $\\pm 1$ to $4, 2$.`,
    related: ["mit1806-eigenvalues-trace-determinant", "mit1806-eigenvalues-definition-examples"],
  },
  {
    id: "mit1806-eigenvalues-trace-determinant",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that the product of the eigenvalues is det A and their sum is the trace (sum of the diagonal entries).",
    back: `Let $\\lambda_1, \\ldots, \\lambda_n$ be the eigenvalues (with multiplicity, possibly complex). They are the roots of the characteristic polynomial, so
$$\\det(A - \\lambda I) = (\\lambda_1 - \\lambda)(\\lambda_2 - \\lambda)\\cdots(\\lambda_n - \\lambda).$$
(The leading coefficient matches: $\\det(A - \\lambda I)$ has $(-\\lambda)^n$ as its top term, from the product of the diagonal entries.)

**Product = determinant.** Set $\\lambda = 0$: $\\det A = \\lambda_1\\lambda_2\\cdots\\lambda_n$. $\\blacksquare$

**Sum = trace.** Compare the coefficients of $(-\\lambda)^{n-1}$ on both sides.
- Right side: $\\lambda_1 + \\cdots + \\lambda_n$.
- Left side, via the big formula: any term that isn't the diagonal product $(a_{11} - \\lambda)\\cdots(a_{nn} - \\lambda)$ skips at least **two** diagonal entries, so it has degree at most $n - 2$ in $\\lambda$. Hence the $(-\\lambda)^{n-1}$ coefficient comes only from the diagonal product, and equals $a_{11} + \\cdots + a_{nn}$.

So $\\lambda_1 + \\cdots + \\lambda_n = \\text{trace}(A)$. $\\blacksquare$

**Quick uses**: if you know one eigenvalue of a 2×2 matrix, the trace gives the other. For a singular 2×2 matrix with trace $-3$, the eigenvalues must be $0$ and $-3$. A **triangular** matrix has its eigenvalues on the diagonal ($\\det(A - \\lambda I) = \\prod (a_{ii} - \\lambda)$).`,
    related: ["mit1806-eigenvalues-characteristic-equation", "mit1806-determinants-big-formula"],
  },
  {
    id: "mit1806-eigenvalues-complex-and-repeated",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What goes wrong with eigenvalues of a rotation matrix, and with a repeated eigenvalue like in [[3,1],[0,3]]?",
    back: `**Complex eigenvalues — rotation by 90°**: $Q = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$ turns every vector, so no real nonzero vector keeps its direction. Trace 0 and determinant 1 already hint at trouble:
$$\\det(Q - \\lambda I) = \\lambda^2 + 1 = 0 \\;\\Rightarrow\\; \\lambda = \\pm i.$$
- For a real matrix, complex eigenvalues come in **conjugate pairs** $a \\pm bi$.
- **Symmetric** matrices ($A^T = A$) always have **real** eigenvalues.
- **Antisymmetric** matrices ($A^T = -A$), like $Q$, have purely **imaginary** eigenvalues.

**Repeated eigenvalues — possibly too few eigenvectors**: $A = \\begin{bmatrix} 3 & 1 \\\\ 0 & 3 \\end{bmatrix}$ is triangular, so its eigenvalues are $3, 3$. But
$$A - 3I = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0 \\end{bmatrix}$$
has a 1-dimensional nullspace: only $x = (1, 0)$. There is **no second independent eigenvector**. Such a matrix is **defective** and can't be diagonalized.

A repeated eigenvalue doesn't *force* this — $I$ has eigenvalue 1 repeated $n$ times and still $n$ independent eigenvectors. Repeated eigenvalues are where things *can* go wrong.`,
    related: ["mit1806-eigenvalues-diagonalization", "mit1806-eigenvalues-trace-determinant"],
  },

  // --- Lecture 22: Diagonalization and powers of A ---
  {
    id: "mit1806-eigenvalues-diagonalization",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Derive the diagonalization A = SΛS⁻¹ and use it to find the eigenvalues of Aᵏ. When does Aᵏ → 0?",
    back: `Suppose $A$ has $n$ **independent** eigenvectors $x_1, \\ldots, x_n$. Put them in the columns of the **eigenvector matrix** $S$. Column by column, $Ax_i = \\lambda_ix_i$, so
$$AS = A\\begin{bmatrix} x_1 & \\cdots & x_n \\end{bmatrix} = \\begin{bmatrix} \\lambda_1x_1 & \\cdots & \\lambda_nx_n \\end{bmatrix} = S\\Lambda, \\qquad \\Lambda = \\begin{bmatrix} \\lambda_1 & & \\\\ & \\ddots & \\\\ & & \\lambda_n \\end{bmatrix}.$$
$S$ is invertible (independent columns), so
$$S^{-1}AS = \\Lambda, \\qquad A = S\\Lambda S^{-1}.$$
In the eigenvector basis, $A$ just scales each coordinate.

**Powers**: $Ax = \\lambda x \\Rightarrow A^2x = \\lambda Ax = \\lambda^2x$; in general
$$A^k = S\\Lambda S^{-1}S\\Lambda S^{-1}\\cdots = S\\Lambda^kS^{-1}.$$
**Same eigenvectors, eigenvalues raised to the $k$-th power.** (Also $A^{-1} = S\\Lambda^{-1}S^{-1}$ when no $\\lambda_i = 0$.)

**Theorem**: if $A$ has $n$ independent eigenvectors, then $A^k \\to 0$ as $k \\to \\infty$ **iff every $|\\lambda_i| < 1$** — since $\\Lambda^k \\to 0$ exactly then.

**Which matrices are diagonalizable?** Any matrix with $n$ **distinct** eigenvalues (next card) — so "most" matrices. Defective ones like $\\begin{bmatrix} 2 & 1 \\\\ 0 & 2 \\end{bmatrix}$ are not.`,
    related: ["mit1806-eigenvalues-distinct-independent", "mit1806-eigenvalues-difference-equations-fibonacci"],
  },
  {
    id: "mit1806-eigenvalues-distinct-independent",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that eigenvectors belonging to distinct eigenvalues are linearly independent (so n distinct eigenvalues ⇒ diagonalizable).",
    back: `**Theorem.** If $x_1, \\ldots, x_k$ are eigenvectors with **distinct** eigenvalues $\\lambda_1, \\ldots, \\lambda_k$, they are linearly independent.

**Proof by induction on $k$.** $k = 1$: an eigenvector is nonzero, hence independent.

Assume it holds for $k - 1$ vectors, and suppose
$$c_1x_1 + c_2x_2 + \\cdots + c_kx_k = 0. \\qquad (*)$$
Apply $A$: $c_1\\lambda_1x_1 + \\cdots + c_k\\lambda_kx_k = 0$. Subtract $\\lambda_k$ times $(*)$ — the $x_k$ term cancels:
$$c_1(\\lambda_1 - \\lambda_k)x_1 + \\cdots + c_{k-1}(\\lambda_{k-1} - \\lambda_k)x_{k-1} = 0.$$
By the induction hypothesis $x_1, \\ldots, x_{k-1}$ are independent, so every $c_i(\\lambda_i - \\lambda_k) = 0$. The eigenvalues are distinct, so $\\lambda_i - \\lambda_k \\neq 0$, hence $c_1 = \\cdots = c_{k-1} = 0$. Then $(*)$ reduces to $c_kx_k = 0$ with $x_k \\neq 0$, so $c_k = 0$. $\\blacksquare$

**Corollary.** An $n \\times n$ matrix with $n$ distinct eigenvalues has $n$ independent eigenvectors, so it is **diagonalizable**.

(The summary states this fact; the proof above is the standard one. The converse fails: $I$ has one repeated eigenvalue yet is diagonal.)`,
    related: ["mit1806-eigenvalues-diagonalization", "mit1806-subspaces-independence"],
  },
  {
    id: "mit1806-eigenvalues-difference-equations-fibonacci",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Solve u_{k+1} = Au_k with eigenvectors, and use it to derive Binet's closed form for the Fibonacci numbers.",
    back: `**Difference equations**: $u_{k+1} = Au_k$ gives $u_k = A^ku_0$. Expand the start in eigenvectors, $u_0 = c_1x_1 + \\cdots + c_nx_n = Sc$; then each piece just scales:
$$u_k = c_1\\lambda_1^kx_1 + c_2\\lambda_2^kx_2 + \\cdots + c_n\\lambda_n^kx_n.$$
For large $k$ the **largest $|\\lambda|$ dominates** the long-term behavior.

**Fibonacci** $F_{k+2} = F_{k+1} + F_k$ is second order; make it first order with $u_k = (F_{k+1}, F_k)$:
$$u_{k+1} = \\begin{bmatrix} 1 & 1 \\\\ 1 & 0 \\end{bmatrix}u_k.$$
Trace 1, determinant $-1$: $\\lambda^2 - \\lambda - 1 = 0$, so
$$\\lambda_1 = \\frac{1 + \\sqrt5}{2} \\approx 1.618, \\qquad \\lambda_2 = \\frac{1 - \\sqrt5}{2} \\approx -0.618.$$
Eigenvectors $x_i = (\\lambda_i, 1)$ (and $A$ is symmetric, so they're orthogonal). From $u_0 = (1, 0) = c_1x_1 + c_2x_2$: $c_1 = -c_2 = \\frac{1}{\\sqrt5}$. Reading off the second component:
$$F_k = \\frac{1}{\\sqrt5}\\left(\\frac{1 + \\sqrt5}{2}\\right)^k - \\frac{1}{\\sqrt5}\\left(\\frac{1 - \\sqrt5}{2}\\right)^k.$$
Since $|\\lambda_2| < 1$, its term vanishes: $F_k$ is the integer nearest $\\lambda_1^k/\\sqrt5$, and the numbers grow by the **golden ratio** each step. (Checked: the formula gives 0, 1, 1, 2, 3, 5, 8, 13, 21, 34.)`,
    related: ["mit1806-eigenvalues-diagonalization", "dynamic-programming-climbing-stairs", "mit6120-analysis-towers-of-hanoi"],
  },

  // --- Lecture 23: Differential equations and exp(At) ---
  {
    id: "mit1806-eigenvalues-differential-equations",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Solve du/dt = Au with A = [[−1,2],[1,−2]] and u(0) = (1, 0) using eigenvalues, and find the steady state.",
    back: `**Pure solutions**: if $Ax = \\lambda x$, then $u = e^{\\lambda t}x$ solves $\\frac{du}{dt} = Au$: $\\frac{du}{dt} = \\lambda e^{\\lambda t}x = e^{\\lambda t}Ax = Au$. ✓ The general solution combines them:
$$u(t) = c_1e^{\\lambda_1t}x_1 + \\cdots + c_ne^{\\lambda_nt}x_n$$
— the continuous analogue of $c_i\\lambda_i^kx_i$.

**Example**: $A = \\begin{bmatrix} -1 & 2 \\\\ 1 & -2 \\end{bmatrix}$ is singular with trace $-3$, so $\\lambda_1 = 0$, $\\lambda_2 = -3$.
- $\\lambda_1 = 0$: $x_1 = (2, 1)$ — a **steady state** ($e^{0t} = 1$).
- $\\lambda_2 = -3$: $x_2 = (1, -1)$ — decays like $e^{-3t}$.

Match $u(0) = (1, 0) = c_1(2, 1) + c_2(1, -1)$, i.e. solve $Sc = u(0)$: $c_1 = c_2 = \\frac13$. So
$$u(t) = \\frac13\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + \\frac13e^{-3t}\\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix}.$$
Starting at $(1, 0)$, the system flows to the **steady state** $u(\\infty) = (\\frac23, \\frac13)$ — "stuff" moving from $u_1$ to $u_2$, with the total $u_1 + u_2 = 1$ conserved (both columns of $A$ sum to 0).`,
    related: ["mit1806-eigenvalues-stability-matrix-exponential", "mit1806-eigenvalues-difference-equations-fibonacci"],
  },
  {
    id: "mit1806-eigenvalues-stability-matrix-exponential",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do eigenvalues determine the stability of du/dt = Au? Define the matrix exponential e^{At} and show e^{At} = Se^{Λt}S⁻¹.",
    back: `**Stability** — read off the real parts of the eigenvalues:
1. **Stable** ($u(t) \\to 0$): every $\\text{Re}(\\lambda) < 0$.
2. **Steady state**: one $\\lambda = 0$ and all others have $\\text{Re}(\\lambda) < 0$.
3. **Blow-up**: some $\\text{Re}(\\lambda) > 0$.

For 2×2: stable $\\iff$ **trace $< 0$ and det $> 0$**. Negative trace alone isn't enough: $\\begin{bmatrix} -2 & 0 \\\\ 0 & 1 \\end{bmatrix}$ has trace $-1$ but eigenvalue 1, and $e^{t}$ blows up.

**Decoupling**: substitute $u = Sv$. Then $S\\frac{dv}{dt} = ASv$, i.e. $\\frac{dv}{dt} = \\Lambda v$ — $n$ independent scalar equations $\\frac{dv_i}{dt} = \\lambda_iv_i$. So $u(t) = Se^{\\Lambda t}S^{-1}u(0)$.

**Matrix exponential**, defined by the power series:
$$e^{At} = I + At + \\frac{(At)^2}{2} + \\frac{(At)^3}{6} + \\cdots.$$
With $A = S\\Lambda S^{-1}$, each power is $A^k = S\\Lambda^kS^{-1}$, so
$$e^{At} = S\\left(I + \\Lambda t + \\frac{(\\Lambda t)^2}{2} + \\cdots\\right)S^{-1} = Se^{\\Lambda t}S^{-1}, \\quad e^{\\Lambda t} = \\begin{bmatrix} e^{\\lambda_1t} & & \\\\ & \\ddots & \\\\ & & e^{\\lambda_nt} \\end{bmatrix}.$$
Then $u(t) = e^{At}u(0)$. (Similarly $(I - At)^{-1} = I + At + (At)^2 + \\cdots$ when the eigenvalues of $At$ are small.)

**Higher order**: $y'' + by' + ky = 0$ becomes first order with $u = (y', y)$: $u' = \\begin{bmatrix} -b & -k \\\\ 1 & 0 \\end{bmatrix}u$. A $k$-th order equation gives a $k \\times k$ matrix (a **companion matrix**).`,
    related: ["mit1806-eigenvalues-differential-equations", "mit1806-eigenvalues-diagonalization", "mit6120-analysis-geometric-series-perturbation"],
  },

  // --- Lecture 24: Markov matrices; Fourier series ---
  {
    id: "mit1806-eigenvalues-markov-matrices",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define a Markov matrix, prove it always has eigenvalue 1, and find the long-run population split for A = [[0.9,0.2],[0.1,0.8]].",
    back: `**Markov matrix**: all entries $\\geq 0$ and **each column sums to 1** (column $j$ gives the probabilities of moving from state $j$ to each state). Powers of a Markov matrix are Markov matrices.

**Fact**: $A$ and $A^T$ have the same eigenvalues: $\\det(A^T - \\lambda I) = \\det(A - \\lambda I)^T = \\det(A - \\lambda I)$.

**Theorem.** Every Markov matrix has eigenvalue $\\lambda = 1$.
**Proof.** Each column of $A$ sums to 1, so each column of $A - I$ sums to 0. That means the **rows** of $A - I$ add up to the zero row — the rows are dependent, so $A - I$ is singular and 1 is an eigenvalue. (Equivalently, $A^T(1, \\ldots, 1) = (1, \\ldots, 1)$.) $\\blacksquare$

The other eigenvalues satisfy $|\\lambda| \\leq 1$ (strictly $< 1$ when every entry is positive). So $u_k = c_1x_1 + c_2\\lambda_2^kx_2 + \\cdots \\to c_1x_1$: the eigenvector for $\\lambda = 1$ is the **steady state**.

**Example** (California, Massachusetts): $A = \\begin{bmatrix} 0.9 & 0.2 \\\\ 0.1 & 0.8 \\end{bmatrix}$, $u_0 = (0, 1000)$. Eigenvalues $1$ and $0.7$ (trace 1.7). Eigenvectors $x_1 = (2, 1)$, $x_2 = (-1, 1)$. Then $u_0 = \\frac{1000}{3}(2, 1) + \\frac{2000}{3}(-1, 1)$, so
$$u_k = \\frac{1000}{3}\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + \\frac{2000}{3}(0.7)^k\\begin{bmatrix} -1 \\\\ 1 \\end{bmatrix} \\to \\begin{bmatrix} 2000/3 \\\\ 1000/3 \\end{bmatrix}.$$
After one step $u_1 = (200, 800)$; in the limit, $\\frac23$ live in California — from **any** start with 1000 people.`,
    pitfall:
      "Some texts make the ROWS sum to 1 (probabilities of leaving each state). Then everything transposes: the steady state is a left eigenvector, πA = π.",
    related: ["mit1806-eigenvalues-difference-equations-fibonacci", "mit6120-probability-conditional-product-rule"],
  },
  {
    id: "mit1806-eigenvalues-fourier-series",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How are Fourier series an orthonormal-basis expansion in a function space? Define the inner product of functions and derive the formula for a₁.",
    back: `**Finite case**: with an orthonormal basis $q_1, \\ldots, q_n$, any $v = x_1q_1 + \\cdots + x_nq_n$ has coefficients $x_i = q_i^Tv$ (dot both sides with $q_i$; all other terms vanish). In matrix form $Qx = v$, so $x = Q^{-1}v = Q^Tv$.

**Fourier series** do the same thing in an **infinite-dimensional** space of $2\\pi$-periodic functions:
$$f(x) = a_0 + a_1\\cos x + b_1\\sin x + a_2\\cos 2x + b_2\\sin 2x + \\cdots$$
with the orthogonal basis $1, \\cos x, \\sin x, \\cos 2x, \\sin 2x, \\ldots$

**Inner product of functions** — the continuous version of $v^Tw = \\sum v_iw_i$:
$$f^Tg = \\int_0^{2\\pi} f(x)\\,g(x)\\,dx.$$
The basis functions are orthogonal, e.g. $\\int_0^{2\\pi} \\sin x\\cos x\\,dx = \\left[\\tfrac12\\sin^2 x\\right]_0^{2\\pi} = 0$.

**Coefficients by projection**: take the inner product of $f$ with $\\cos x$; every other term integrates to 0:
$$\\int_0^{2\\pi} f(x)\\cos x\\,dx = a_1\\int_0^{2\\pi}\\cos^2 x\\,dx = a_1\\pi \\;\\Rightarrow\\; a_1 = \\frac1\\pi\\int_0^{2\\pi} f(x)\\cos x\\,dx.$$
(The basis is orthogonal but not normalized — hence the $\\frac1\\pi$.) $a_0$ is the **average value** of $f$.

This is the bridge to signal processing: the FFT computes these coefficients fast in the discrete setting.`,
    related: ["mit1806-orthogonality-orthonormal-bases-simplify", "mit6046-dc-fft-algorithm"],
  },
];
