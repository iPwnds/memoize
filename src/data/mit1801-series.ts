// MIT 18.01SC Single Variable Calculus (Fall 2010, OCW Scholar; lectures by
// David Jerison, Session 99 by Haynes Miller) — Unit 5, Part B: Infinite
// Series and Taylor Series (Sessions 94-101). Sourced from the course's
// per-session lecture notes (MIT18_01SCF10_SesNNx), read page by page, with
// every sum, bound and series expansion recomputed in sympy. Session 101 is
// the course finale (no new content); the final exam has no session number.
//
// The written notes cover partial sums, the geometric series, the integral
// test, limit comparison, the harmonic series (and the stacking-blocks
// application), power series and radius of convergence, Taylor's formula
// and term-by-term operations. Additions beyond the notes, which KU
// Leuven's Wiskunde I expects:
// - the ratio test with proof (18.01SC treats it only in a recitation
//   video, which is not written material), the term (divergence) test,
//   and absolute convergence / the alternating series test, stated;
// - Taylor's theorem with remainder (integral form, proved by integration
//   by parts; Lagrange form stated). The notes give only the formal
//   coefficient argument aₙ = f⁽ⁿ⁾(0)/n!.
// - the integral-test bound proved from upper/lower Riemann sums in
//   general (the notes do it for 1/x and state the theorem).
// Corrections to the notes:
// - Ses100b gives the radius of convergence of the cosine series obtained
//   by differentiating sin x as "R = 1"; it is R = ∞.
// - Ses96b lists C₅ = 1 + ½ + ⅓ + ¼ + ⅕ > 2; already C₄ = 25/12 > 2, which
//   is why the 5th (bottom) block is the first the top block can clear,
//   matching the notes' "at least 5 blocks".
import type { Card } from "./types";

const MODULE = "mit1801-series";

export const mit1801SeriesCards: Card[] = [
  // --- Session 94: Infinite series ---
  {
    id: "mit1801-series-geometric-series",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define convergence of a series via partial sums. When does the geometric series 1 + a + a² + ⋯ converge, and what goes wrong for a = 1, −1, 2?",
    back: `**Partial sums.** For $\\sum_{n=0}^\\infty a_n$, let $S_N = \\sum_{n=0}^N a_n$. The series **converges** to $S$ if $S_N \\to S$, and **diverges** otherwise. This is exactly parallel to $\\int_a^\\infty f = \\lim_{N\\to\\infty}\\int_a^N f$.

**Geometric series.**
$$1 + a + a^2 + a^3 + \\cdots = \\frac{1}{1 - a} \\qquad (\\lvert a\\rvert < 1).$$
Example: $1 + \\frac12 + \\frac14 + \\cdots = 2$. Each partial sum lands halfway between the previous one and 2 (Zeno's paradox).

**Derivation** (Session 97). If $S = 1 + a + a^2 + \\cdots$ exists, then $S - aS = 1$, so $S = \\frac{1}{1 - a}$. This argument is valid **only if $S$ exists**. Rigorously,
$$S_N = \\frac{1 - a^{N+1}}{1 - a} \\to \\frac{1}{1 - a} \\iff \\lvert a\\rvert < 1.$$

**Divergent cases.** Here the formula gives interesting but wrong answers:
- $a = 1$: $1 + 1 + 1 + \\cdots = \\infty$ (the formula says $\\frac10$).
- $a = -1$: partial sums alternate $1, 0, 1, 0, \\ldots$ and never settle. The formula's $\\frac12$ is wrong.
- $a = 2$: $1 + 2 + 4 + \\cdots = \\infty$, while the formula says $-1$.

Using the formula outside $\\lvert a\\rvert < 1$ is like integrating across a singularity.

**Comparison with integrals.**
- $\\sum\\frac{1}{n^2}$ behaves like $\\int_1^\\infty\\frac{dx}{x^2} = 1$, so it converges. Its value $\\frac{\\pi^2}{6}$ is Euler's famous result.
- $\\sum\\frac{1}{n^3}$ converges too. Its value $\\zeta(3)$ is irrational (Apéry, 1978), with no elementary closed form.`,
    related: ["mit1801-series-integral-test", "mit1801-series-power-series", "mit6120-analysis-geometric-series-perturbation"],
  },

  // --- Session 95: Series comparison ---
  {
    id: "mit1801-series-integral-test",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the integral test: for f positive and decreasing, Σ f(n) and ∫₁^∞ f dx converge or diverge together, with |Σ f(n) − ∫ f| < f(1). Apply it to show ln N < Hₙ < ln N + 1.",
    back: `**Theorem.** Let $f > 0$ be decreasing on $[1, \\infty)$. Then $\\sum_{n=1}^\\infty f(n)$ and $\\int_1^\\infty f(x)\\,dx$ both converge or both diverge, and
$$0 \\le \\sum_{n=1}^{N}f(n) - \\int_1^N f(x)\\,dx \\le f(1).$$

**Proof (Riemann sums with $\\Delta x = 1$).** On $[n, n + 1]$, $f$ is decreasing, so $f(n + 1) \\le f(x) \\le f(n)$. Integrate over the interval and sum for $n = 1, \\ldots, N - 1$:
- the **upper** sum gives $\\int_1^N f \\le f(1) + \\cdots + f(N - 1) \\le S_N$;
- the **lower** sum gives $S_N - f(1) = f(2) + \\cdots + f(N) \\le \\int_1^N f$.

So $\\int_1^N f \\le S_N \\le f(1) + \\int_1^N f$. Both $S_N$ and $\\int_1^N f$ increase with $N$, so each stays bounded (converges) iff the other does. $\\blacksquare$

**Harmonic series.** $f = \\frac1x$, $\\int_1^N\\frac{dx}{x} = \\ln N$:
$$\\ln N < H_N = 1 + \\tfrac12 + \\cdots + \\tfrac1N < \\ln N + 1.$$
So $\\sum\\frac1n$ **diverges**, but only logarithmically. (In fact $H_N - \\ln N \\to \\gamma \\approx 0.5772$.)

**p-series.** $\\sum\\frac{1}{n^p}$ converges iff $p > 1$, exactly as for $\\int_1^\\infty\\frac{dx}{x^p}$.

The integral test is so useful because sums are hard to compute and integrals are easy.`,
    pitfall:
      "The integral test needs f decreasing (and positive). It tells you about convergence, not the value: Σ1/n² = π²/6, while ∫₁^∞ dx/x² = 1.",
    related: ["mit1801-series-comparison-tests", "mit1801-series-stacking-blocks", "mit1801-improper-improper-integrals", "mit6120-analysis-integral-method", "mit6120-analysis-harmonic-numbers"],
  },
  {
    id: "mit1801-series-comparison-tests",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the term test, limit comparison and the ratio test (with proof). Decide Σ 1/√(n² + 1), Σ 1/√(n⁵ − n²) and Σ xⁿ/n!. What are absolute convergence and the alternating series test?",
    back: `**Term (divergence) test.** If $a_n \\not\\to 0$, then $\\sum a_n$ diverges, since $a_n = S_n - S_{n-1}$ would have to tend to $S - S = 0$. The converse is false: $\\frac1n \\to 0$, but $\\sum\\frac1n = \\infty$.

**Limit comparison (the notes).** If $a_n, b_n > 0$ and $\\frac{a_n}{b_n} \\to 1$ (or any finite positive limit), the two series converge or diverge together. Only the tails matter.
- $\\frac{1}{\\sqrt{n^2 + 1}} \\sim \\frac1n$: **diverges**. Starting the sum at $n = 0$ is harmless.
- $\\frac{1}{\\sqrt{n^5 - n^2}} \\sim \\frac{1}{n^{5/2}}$ (start at $n = 2$): **converges**, since $\\frac52 > 1$.

**Ratio test** (added). If $a_n > 0$ and $\\frac{a_{n+1}}{a_n} \\to L$:
- $L < 1$: the series converges;
- $L > 1$: it diverges;
- $L = 1$: no information (both $\\sum\\frac1n$ and $\\sum\\frac{1}{n^2}$ give $L = 1$).

*Proof.* If $L < 1$, pick $r$ with $L < r < 1$. For $n \\ge N$, $a_{n+1} \\le ra_n$, so $a_n \\le a_Nr^{n-N}$: the tail is dominated by a convergent geometric series. If $L > 1$, the terms eventually increase, so $a_n \\not\\to 0$. $\\blacksquare$

Example: $\\frac{\\lvert x\\rvert^{n+1}/(n+1)!}{\\lvert x\\rvert^n/n!} = \\frac{\\lvert x\\rvert}{n + 1} \\to 0$, so $\\sum\\frac{x^n}{n!}$ converges for every $x$.

**Signed terms** (added).
- **Absolute convergence:** $\\sum\\lvert a_n\\rvert < \\infty$ implies $\\sum a_n$ converges.
- **Alternating series test (Leibniz):** if $b_n \\downarrow 0$, then $\\sum(-1)^nb_n$ converges, with error at most the first omitted term. Example: $1 - \\frac12 + \\frac13 - \\cdots = \\ln 2$ converges, though not absolutely.`,
    pitfall:
      "Reading aₙ → 0 as proof of convergence. It is only necessary; the harmonic series has aₙ → 0 and diverges.",
    related: ["mit1801-series-integral-test", "mit1801-improper-limit-comparison", "mit1801-series-power-series"],
  },

  // --- Session 96: Stacking blocks ---
  {
    id: "mit1801-series-stacking-blocks",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Stack identical blocks (length 2) greedily from the top. Show the overhang after N blocks is the harmonic number Hₙ, so it is unbounded, and estimate the height needed for 24 units of overhang.",
    back: `**Greedy from the top.** Place each new block below so that its left end sits under the centre of mass of everything above it, the farthest position that doesn't topple.

Let $C_N$ be the $x$-coordinate of the centre of mass of the top $N$ blocks, with the top block's left end at 0 (so $C_1 = 1$). The next block's own centre is at $C_N + 1$. The weighted average gives
$$C_{N+1} = \\frac{NC_N + (C_N + 1)}{N + 1} = C_N + \\frac{1}{N + 1} \\quad\\Longrightarrow\\quad C_N = 1 + \\frac12 + \\cdots + \\frac1N = H_N.$$

**Clearing the base.** $H_4 = \\frac{25}{12} > 2$ (one block length), so with 5 blocks the top block lies entirely beyond the bottom one. Jerison used 7.

**Unbounded, but slowly.** By the integral test, $\\ln N < H_N < \\ln N + 1$. So the overhang $\\to \\infty$ (the harmonic series diverges), but only like $\\ln N$. Seen from the side, the stack traces out the graph of $\\ln x$.

**How tall?** Spanning two lab tables needs 24 units of overhang, so $\\ln N \\approx 24$ and $N \\approx e^{24}$. At about 3 cm per block, the height is $3\\text{ cm}\\cdot e^{24} \\approx 8 \\times 10^8$ m, roughly twice the distance to the Moon.

The greedy algorithm is optimal for top-down stacking. Bottom-up greedy would stall after one half-block.`,
    related: ["mit1801-series-integral-test", "mit6120-analysis-harmonic-numbers"],
  },

  // --- Session 97: Power series ---
  {
    id: "mit1801-series-power-series",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a power series and its radius of convergence R? What happens for |x| < R, |x| > R and |x| = R? How do power series combine?",
    back: `**Power series:** $\\sum_{n=0}^\\infty a_nx^n = a_0 + a_1x + a_2x^2 + \\cdots$, a "polynomial that doesn't end". It is a **function** of $x$, defined wherever it converges.

**Radius of convergence.** There is $R \\in [0, \\infty]$ such that:
- for $\\lvert x\\rvert < R$ the series converges, and its terms $\\lvert a_nx^n\\rvert$ shrink **exponentially fast**;
- for $\\lvert x\\rvert > R$ it diverges, because the terms don't even tend to 0;
- at $\\lvert x\\rvert = R$ anything can happen (not treated in 18.01).

Examples:
- $\\frac{1}{1 - x} = \\sum x^n$ has $R = 1$. At $x = \\frac12$ the terms shrink; at $x = 2$ they grow.
- $\\frac{1}{1 + x} = \\sum(-1)^nx^n$ also has $R = 1$, reflecting the blow-up at $x = -1$. At $x = 1$ the partial sums $1, 0, 1, 0, \\ldots$ diverge even though the function is smooth there.
- $e^x$, $\\sin x$ and $\\cos x$ have $R = \\infty$.

In practice $R$ is found with the ratio test: $R = \\lim\\frac{\\lvert a_n\\rvert}{\\lvert a_{n+1}\\rvert}$ when that limit exists.

**Algebra of power series** (inside the radius): add, multiply, substitute, divide, and above all **differentiate and integrate term by term**, exactly like polynomials:
$$\\Big(\\sum a_nx^n\\Big)' = \\sum na_nx^{n-1}, \\qquad \\int\\sum a_nx^n\\,dx = c + \\sum\\frac{a_n}{n + 1}x^{n+1}.$$
Term-by-term differentiation and integration keep the same $R$. A product converges at least where both factors do.`,
    related: ["mit1801-series-geometric-series", "mit1801-series-taylor-formula", "mit1801-series-operations", "mit1801-series-comparison-tests"],
  },

  // --- Session 98: Taylor's series ---
  {
    id: "mit1801-series-taylor-formula",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Derive Taylor's formula aₙ = f⁽ⁿ⁾(0)/n! for the coefficients of a power series, and state and prove Taylor's theorem with remainder.",
    back: `**Coefficients.** Suppose $f(x) = a_0 + a_1x + a_2x^2 + \\cdots$ inside its radius. Differentiate term by term:
$$f' = a_1 + 2a_2x + 3a_3x^2 + \\cdots, \\qquad f'' = 2a_2 + 3\\cdot 2\\,a_3x + \\cdots, \\qquad f^{(n)}(0) = n!\\,a_n.$$
So
$$a_n = \\frac{f^{(n)}(0)}{n!}, \\qquad f(x) = \\sum_{n=0}^\\infty\\frac{f^{(n)}(0)}{n!}x^n,$$
with $0! = 1$. This is the infinite version of $D^nx^n = n!$, and it extends the linear and quadratic approximations of Unit 2.

**Taylor's theorem with remainder** (added). If $f$ has $n + 1$ continuous derivatives, then $f(x) = P_n(x) + R_n(x)$, where
$$P_n(x) = \\sum_{k=0}^{n}\\frac{f^{(k)}(0)}{k!}x^k, \\qquad R_n(x) = \\int_0^x\\frac{f^{(n+1)}(t)}{n!}(x - t)^n\\,dt.$$

*Proof by induction on $n$.*
- **Base case $n = 0$:** $f(x) = f(0) + \\int_0^x f'(t)\\,dt$, which is FTC1.
- **Step:** integrate $R_n$ by parts, with $u = f^{(n+1)}(t)$ and $v = -\\frac{(x - t)^{n+1}}{(n + 1)!}$:
$$R_n(x) = \\frac{f^{(n+1)}(0)}{(n + 1)!}x^{n+1} + R_{n+1}(x). \\;\\blacksquare$$

**Lagrange form** (from the MVT for integrals):
$$R_n(x) = \\frac{f^{(n+1)}(c)}{(n + 1)!}x^{n+1}\\quad\\text{for some } c \\text{ between } 0 \\text{ and } x.$$

**Why it matters.** $f$ equals its Taylor series exactly when $R_n(x) \\to 0$. For $e^x$: $\\lvert R_n\\rvert \\le e^{\\lvert x\\rvert}\\frac{\\lvert x\\rvert^{n+1}}{(n + 1)!} \\to 0$ for every $x$.

A function can have all derivatives and still not equal its Taylor series: $e^{-1/x^2}$ (extended by 0 at $x = 0$) has every derivative 0 at 0.`,
    related: ["mit1801-series-taylor-examples", "mit1801-series-power-series", "mit1801-differentiation-higher-derivatives", "mit1801-applications-quadratic-approximation", "mit1801-techniques-integration-by-parts"],
  },

  // --- Session 99: Taylor's series, continued ---
  {
    id: "mit1801-series-taylor-examples",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the Taylor series at 0, with radius of convergence, of eˣ, 1/(1 + x) and sin x. Why does sin x converge for every x?",
    back: `**$e^x$** (Euler). Every derivative is $e^x$, which equals 1 at $x = 0$:
$$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots = \\sum_{n\\ge 0}\\frac{x^n}{n!}, \\qquad R = \\infty.$$

**$\\frac{1}{1 + x}$** (Newton). Put $-x$ into the geometric series:
$$\\frac{1}{1 + x} = 1 - x + x^2 - x^3 + \\cdots, \\qquad R = 1.$$
The infinite discontinuity at $x = -1$ signals $R = 1$. At $x = +1$ the function is fine, but the series ($1, 0, 1, 0, \\ldots$) still diverges: $R$ is a **radius**, the same distance on both sides.

**$\\sin x$.** The derivatives cycle $\\sin, \\cos, -\\sin, -\\cos$, so the values at 0 are $0, 1, 0, -1, \\ldots$:
$$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\frac{x^7}{7!} + \\cdots, \\qquad R = \\infty.$$
It contains only odd powers, as it must for an odd function.

**Why $R = \\infty$:**
$$\\frac{x^{2n+1}}{(2n + 1)!} = \\frac x1\\cdot\\frac x2\\cdots\\frac{x}{2n + 1}.$$
For any fixed $x$, all but finitely many factors are tiny, so the terms go to 0 faster than any geometric sequence. (Ratio test: $\\frac{x^2}{(2n + 2)(2n + 3)} \\to 0$.)

**Strength and weakness.** Truncating the series gives excellent numerical values of $\\sin x$. But the series hides structure: nothing in $x - \\frac{x^3}{6} + \\cdots$ makes the period $2\\pi$ visible.`,
    related: ["mit1801-series-taylor-formula", "mit1801-series-operations", "mit1801-applications-mvt-and-approximation"],
  },

  // --- Session 100: Operations on power series ---
  {
    id: "mit1801-series-operations",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Use term-by-term operations to get series for x sin x, cos x, ln(1 + x), e⁻ᵗ² and erf(x).",
    back: `**Multiply.**
$$x\\sin x = x^2 - \\frac{x^4}{3!} + \\frac{x^6}{5!} - \\cdots$$
odd × odd = even, so only even powers appear. The product's $R$ is at least the smaller of the two radii (here $\\infty$).

**Differentiate.**
$$\\cos x = (\\sin x)' = 1 - \\frac{3x^2}{3!} + \\frac{5x^4}{5!} - \\cdots = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots$$
The radius is unchanged, $R = \\infty$.

**Integrate.**
$$\\ln(1 + x) = \\int_0^x\\frac{dt}{1 + t} = \\int_0^x(1 - t + t^2 - \\cdots)\\,dt = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\frac{x^4}{4} + \\cdots, \\qquad R = 1.$$
For $x > 1$ the terms $\\frac{x^n}{n}$ blow up (exponential beats linear), so the series diverges. Euler used series like this to compute logarithms efficiently.

**Substitute.** Put $x = -t^2$ into $e^x$:
$$e^{-t^2} = 1 - t^2 + \\frac{t^4}{2!} - \\frac{t^6}{3!} + \\cdots, \\qquad R = \\infty.$$

**The error function** has no elementary formula, but integrating term by term gives one anyway:
$$\\operatorname{erf}(x) = \\frac{2}{\\sqrt\\pi}\\int_0^xe^{-t^2}dt = \\frac{2}{\\sqrt\\pi}\\left(x - \\frac{x^3}{3} + \\frac{x^5}{5\\cdot 2!} - \\frac{x^7}{7\\cdot 3!} + \\cdots\\right).$$
This is a practical way to compute it, and essentially what calculators do.

Session 101 (finale) points ahead to 18.02, where the product and quotient rules turn out to be special cases of a multivariable chain rule.`,
    related: ["mit1801-series-power-series", "mit1801-series-taylor-examples", "mit1801-integration-new-functions", "mit1801-integration-gaussian-integral"],
  },
];
