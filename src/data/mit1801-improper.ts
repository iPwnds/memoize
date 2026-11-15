// MIT 18.01SC Single Variable Calculus (Fall 2010, OCW Scholar; lectures by
// David Jerison) — Unit 5, Part A: L'Hôpital's Rule and Improper Integrals
// (Sessions 87-93). Sourced from the course's per-session lecture notes
// (MIT18_01SCF10_SesNNx), read page by page, with every limit and improper
// integral recomputed in sympy. Unit 5 ("Exploring the Infinite") is split
// at the course's own Part A / Part B boundary; Part B (series) is the
// mit1801-series module. Unit 5 has no unit exam; it is examined on the
// final, which has no session number.
//
// Additions beyond the notes:
// - the general L'Hôpital rule (f′/g′ → L, no differentiability at a)
//   proved from the Cauchy mean value theorem; the notes prove only the
//   version with f(a) = g(a) = 0 and g′(a) ≠ 0 (a ratio of difference
//   quotients) and state the extensions without proof;
// - the list of the other indeterminate forms (1^∞, ∞⁰, ∞ − ∞) beside 0⁰.
// Corrections to the notes:
// - Ses93c (text and Figure 4) gives ∫₁^∞ dx/x² = 2; it is 1 (the p-test
//   value 1/(p − 1) with p = 2).
// - Ses93a/93c call integrals over singularities "indefinite integrals of
//   the second type"; they are improper integrals of the second kind (as
//   Ses93b's title says).
import type { Card } from "./types";

const MODULE = "mit1801-improper";

export const mit1801ImproperCards: Card[] = [
  // --- Session 87: L'Hôpital's rule ---
  {
    id: "mit1801-improper-lhopital-rule",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State L'Hôpital's rule. Prove the simple version (a ratio of difference quotients), then the general one via the Cauchy mean value theorem.",
    back: `**Simple version (the notes).** If $f(a) = g(a) = 0$ and $g'(a) \\neq 0$, divide top and bottom by $x - a$:
$$\\lim_{x\\to a}\\frac{f(x)}{g(x)} = \\lim_{x\\to a}\\frac{\\frac{f(x) - f(a)}{x - a}}{\\frac{g(x) - g(a)}{x - a}} = \\frac{f'(a)}{g'(a)}.$$
Example: $\\lim_{x\\to 1}\\frac{x^{10} - 1}{x^2 - 1} = \\frac{10}{2} = 5$, with no long division.

**General version (used in practice).** Suppose $f, g$ are differentiable near $a$ (not necessarily at $a$), $f, g \\to 0$, $g' \\neq 0$ near $a$, and $\\frac{f'(x)}{g'(x)} \\to L$, where $L$ may be $\\pm\\infty$. Then $\\frac{f(x)}{g(x)} \\to L$. The same holds for $\\frac{\\infty}{\\infty}$ forms and for $a = \\pm\\infty$.

**Cauchy MVT.** If $f, g$ are continuous on $[a, x]$ and differentiable inside, then
$$\\big(f(x) - f(a)\\big)g'(c) = \\big(g(x) - g(a)\\big)f'(c)\\quad\\text{for some } c \\in (a, x).$$
*Proof:* apply Rolle to $h(t) = \\big(f(x) - f(a)\\big)\\big(g(t) - g(a)\\big) - \\big(g(x) - g(a)\\big)\\big(f(t) - f(a)\\big)$, which vanishes at $t = a$ and $t = x$.

**Proof of the $\\frac00$ case.** Set $f(a) = g(a) = 0$, which makes them continuous at $a$. For $x$ near $a$, Cauchy gives
$$\\frac{f(x)}{g(x)} = \\frac{f'(c_x)}{g'(c_x)}, \\qquad c_x \\text{ between } a \\text{ and } x.$$
(Note $g(x) \\neq 0$, by Rolle, since $g' \\neq 0$.) As $x \\to a$, $c_x \\to a$, so the ratio tends to $L$. $\\blacksquare$`,
    pitfall:
      "L'Hôpital needs an indeterminate form. Applied to lim (x + 1)/(x + 2) as x → 0 it would give 1/1 = 1, but the true limit is 1/2. Check 0/0 or ∞/∞ before differentiating.",
    related: ["mit1801-improper-lhopital-examples", "mit1801-applications-mean-value-theorem", "mit1801-differentiation-derivative-definition"],
  },

  // --- Session 88: Examples of L'Hôpital's rule ---
  {
    id: "mit1801-improper-lhopital-examples",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Compute lim sin 5x / sin 2x and lim (cos x − 1)/x² as x → 0 by L'Hôpital (repeated if needed) and by approximation. What extensions does the rule allow?",
    back: `**One application.**
$$\\lim_{x\\to 0}\\frac{\\sin 5x}{\\sin 2x} = \\lim_{x\\to 0}\\frac{5\\cos 5x}{2\\cos 2x} = \\frac52.$$

**Repeated.** The first step is still $\\frac00$, so apply the rule again:
$$\\lim_{x\\to 0}\\frac{\\cos x - 1}{x^2} = \\lim_{x\\to 0}\\frac{-\\sin x}{2x} = \\lim_{x\\to 0}\\frac{-\\cos x}{2} = -\\frac12.$$
This works even though $g'(0) = 0$ at the first step, which is why the "limit of $f'/g'$" version is the useful one. Logically subtle: you only learn that the hypothesis (the limit of $f'/g'$ exists) holds once you reach the end.

**Same results by approximation:**
- $\\sin u \\approx u$ gives $\\frac{\\sin 5x}{\\sin 2x} \\approx \\frac{5x}{2x} = \\frac52$.
- $\\cos x \\approx 1 - \\frac{x^2}{2}$ gives $\\frac{(1 - x^2/2) - 1}{x^2} = -\\frac12$.

The approximations become exact in the limit. The quadratic term of $\\cos$ carries the same information as the second derivative used by L'Hôpital.

**Extensions** (all valid):
- $a = \\pm\\infty$;
- the form $\\frac{\\pm\\infty}{\\pm\\infty}$;
- a limit of $\\frac{f'}{g'}$ equal to $\\pm\\infty$.

The rule fails only if $\\frac{f'}{g'}$ oscillates without a limit. For example, $\\frac{x + \\sin x}{x} \\to 1$, but $\\frac{1 + \\cos x}{1}$ has no limit.`,
    related: ["mit1801-improper-lhopital-rule", "mit1801-improper-rates-of-growth", "mit1801-applications-quadratic-approximation"],
  },

  // --- Session 89: L'Hôpital's rule and rates of growth ---
  {
    id: "mit1801-improper-rates-of-growth",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Use L'Hôpital to compare rates of growth: prove x ln x → 0 as x → 0⁺, eᵖˣ/x¹⁰⁰ → ∞ and ln x / x¹ᐟ³ → 0 as x → ∞ (p > 0).",
    back: `**Rewrite products as quotients first.**

**$x\\ln x$ as $x \\to 0^+$** ($0\\cdot(-\\infty)$):
$$x\\ln x = \\frac{\\ln x}{1/x} \\quad\\left(\\tfrac{-\\infty}{\\infty}\\right) \\;\\overset{\\text{L'H}}{\\longrightarrow}\\; \\frac{1/x}{-1/x^2} = -x \\to 0.$$
So $x$ shrinks faster than $\\ln x$ blows up.

**$xe^{-px}$ as $x \\to \\infty$:** $\\frac{x}{e^{px}} \\to \\frac{1}{pe^{px}} \\to 0$.

**$\\frac{e^{px}}{x^{100}}$.** The slow way is 100 applications of the rule. The clever way is to take a 100th root first:
$$\\frac{e^{px}}{x^{100}} = \\left(\\frac{e^{px/100}}{x}\\right)^{100}, \\qquad \\frac{e^{px/100}}{x} \\overset{\\text{L'H}}{\\longrightarrow} \\frac{p}{100}e^{px/100} \\to \\infty.$$
So **exponentials beat every power**.

**$\\frac{\\ln x}{x^{1/3}}$:**
$$\\frac{1/x}{\\frac13x^{-2/3}} = 3x^{-1/3} \\to 0.$$
So **logs lose to every positive power**.

**Hierarchy** as $x \\to \\infty$, for any $a > 0$ and $p > 0$:
$$\\ln x \\ll x^a \\ll e^{px}.$$
In asymptotic notation, $\\ln x = o(x^a)$ and $x^a = o(e^{px})$. This is exactly the ordering behind $O(\\log n) \\subset O(n^\\varepsilon) \\subset O(c^n)$ in algorithm analysis.

These rates decide which improper integrals converge, e.g. $\\int_0^\\infty x^ne^{-x}\\,dx < \\infty$.`,
    related: ["mit1801-improper-lhopital-examples", "mit1801-improper-indeterminate-powers", "mit6120-analysis-asymptotic-definitions", "mit6120-analysis-big-o-proofs"],
  },

  // --- Session 90: Advanced examples of L'Hôpital's rule ---
  {
    id: "mit1801-improper-indeterminate-powers",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Evaluate lim xˣ as x → 0⁺ (the form 0⁰). How do you handle moving exponents and the other indeterminate forms?",
    back: `**Moving exponent, so use base $e$:** $x^x = e^{x\\ln x}$.

**Limit of the exponent** (Session 89):
$$\\lim_{x\\to 0^+}x\\ln x = \\lim\\frac{\\ln x}{1/x} \\overset{\\text{L'H}}{=} \\lim(-x) = 0.$$

**Exponentiate back** ($e^u$ is continuous):
$$\\lim_{x\\to 0^+}x^x = e^{0} = 1.$$

**The catalogue of indeterminate forms** and how to reduce each to $\\frac00$ or $\\frac\\infty\\infty$:

| Form | Example | Rewrite |
|---|---|---|
| $0\\cdot\\infty$ | $x\\ln x$ | $\\frac{\\ln x}{1/x}$ |
| $0^0$, $\\infty^0$, $1^\\infty$ | $x^x$, $x^{1/x}$, $(1 + \\frac1n)^n$ | $e^{(\\text{exponent})\\cdot\\ln(\\text{base})}$, then $0\\cdot\\infty$ |
| $\\infty - \\infty$ | $\\frac1x - \\frac{1}{\\sin x}$ | common denominator |

The $1^\\infty$ row is the Session 19 limit $(1 + \\frac1n)^n \\to e$.

**Not indeterminate:** $\\frac{1}{0^+} = +\\infty$, $0^\\infty = 0$, $\\infty\\cdot\\infty = \\infty$. Don't apply L'Hôpital to these.`,
    related: ["mit1801-improper-rates-of-growth", "mit1801-differentiation-e-as-limit", "mit1801-differentiation-logarithmic-differentiation"],
  },

  // --- Session 91: Improper integrals ---
  {
    id: "mit1801-improper-improper-integrals",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define ∫ₐ^∞ f dx. Compute ∫₀^∞ e⁻ᵏˣ dx and prove the p-test: ∫₁^∞ dx/xᵖ converges iff p > 1.",
    back: `**Definition** (for $f > 0$):
$$\\int_a^\\infty f(x)\\,dx = \\lim_{N\\to\\infty}\\int_a^N f(x)\\,dx.$$
It **converges** if the limit exists and is finite, and **diverges** otherwise. An area stretching to infinity can be finite.

**Exponential decay** ($k > 0$), "by far the most fundamental" improper integral:
$$\\int_0^N e^{-kx}\\,dx = \\frac1k - \\frac1ke^{-kN} \\xrightarrow{N\\to\\infty}\\frac1k.$$
For example, with decay rate $k$, $\\int_0^\\infty Ae^{-kt}\\,dt = \\frac Ak$ particles decay in total. $\\frac{A}{k}$ is far easier to use than the finite-time expression.

**The p-test.**
- $p = 1$: $\\int_1^N\\frac{dx}{x} = \\ln N \\to \\infty$, so it **diverges**.
- $p \\neq 1$:
$$\\int_1^N x^{-p}\\,dx = \\frac{N^{1-p} - 1}{1 - p} \\to \\begin{cases}\\dfrac{1}{p - 1} & p > 1 \\ (N^{1-p} \\to 0)\\\\[4pt] \\infty & p < 1\\end{cases}$$

So $\\int_1^\\infty\\frac{dx}{x^p}$ **converges iff $p > 1$**, with value $\\frac{1}{p - 1}$. $\\blacksquare$ The cases $p = 1$ and $p \\neq 1$ need separate antiderivatives ($\\ln x$ vs $\\frac{x^{1-p}}{1-p}$).

**Fat tails.** $\\frac1x$ is the borderline between thin tails (finite area) and fat ones (infinite area). Tail area is the probability of extreme events: ignoring a fat tail gives nasty surprises.

**Signed integrands** like $\\frac{\\sin x}{x}$ can converge through cancellation. The course restricts to $f > 0$ to avoid this.`,
    related: ["mit1801-improper-limit-comparison", "mit1801-improper-singularities", "mit1801-integration-gaussian-integral", "mit1805-probability-exponential-memoryless"],
  },

  // --- Session 92: Integral comparison ---
  {
    id: "mit1801-improper-limit-comparison",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "State the limit comparison and direct comparison tests for improper integrals. Decide ∫ dx/√(x² + 10), ∫ dx/√(x³ + 3) and ∫ e⁻ˣ² dx.",
    back: `**Limit comparison.** If $f, g > 0$ and $f(x) \\sim g(x)$ as $x \\to \\infty$ (i.e. $\\frac fg \\to 1$), then $\\int_a^\\infty f$ and $\\int_a^\\infty g$ **both converge or both diverge**. Any finite positive limit works the same way.

**Direct comparison.** If $0 \\le f \\le g$, then $\\int g < \\infty$ implies $\\int f < \\infty$, and $\\int f = \\infty$ implies $\\int g = \\infty$.

**Examples.**
- $\\int_0^\\infty\\frac{dx}{\\sqrt{x^2 + 10}}$: the integrand $\\sim\\frac1x$, which diverges, so this **diverges**. Compare only on the tail, e.g. $[1, \\infty)$. $\\int_0^1\\frac{dx}{x}$ is infinite for an unrelated reason (the singularity at 0), while $\\int_0^1$ of the original integrand is finite.
- $\\int_0^\\infty\\frac{dx}{\\sqrt{x^3 + 3}}$: no antiderivative is available, but the integrand $\\sim x^{-3/2}$ with $p = \\frac32 > 1$, so it **converges**.
- $\\int_{-\\infty}^\\infty e^{-x^2}\\,dx$ decays too fast to be "$\\sim$" any power, so use **direct** comparison. For $x \\ge 1$, $x^2 \\ge x$, so $e^{-x^2} \\le e^{-x}$. Then
$$\\int_{-\\infty}^\\infty e^{-x^2} = 2\\int_0^1 e^{-x^2} + 2\\int_1^\\infty e^{-x^2} \\le 2\\int_0^1 e^{-x^2} + 2\\int_1^\\infty e^{-x}\\,dx < \\infty.$$
Its value, $\\sqrt\\pi$, came from Session 65.

The point is to decide convergence **without** computing the integral.`,
    pitfall:
      "Comparing in the wrong direction. Being smaller than a divergent integral, or bigger than a convergent one, proves nothing.",
    related: ["mit1801-improper-improper-integrals", "mit6120-analysis-asymptotic-definitions", "mit1801-series-comparison-tests"],
  },

  // --- Session 93: Improper integrals with singularities ---
  {
    id: "mit1801-improper-singularities",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define improper integrals over a singularity (second kind). When does ∫₀¹ dx/xᵖ converge? Why is ∫₋₁¹ dx/x² = −2 nonsense?",
    back: `**Definition.** If $f$ blows up at $0$,
$$\\int_0^1 f(x)\\,dx = \\lim_{a\\to 0^+}\\int_a^1 f(x)\\,dx.$$
This is a vertical "tail", treated just like the horizontal ones.

**p-test at 0.**
- $\\int_0^1\\frac{dx}{\\sqrt x} = 2\\sqrt x\\Big|_0^1 = 2$ (converges).
- $\\int_0^1\\frac{dx}{x} = \\ln 1 - \\ln 0^+ = +\\infty$ (diverges).
- In general,
$$\\int_0^1\\frac{dx}{x^p} = \\begin{cases}\\dfrac{1}{1 - p} & p < 1\\\\[4pt] \\infty & p \\ge 1\\end{cases}$$
This is the **mirror image** of the tail at infinity, which needs $p > 1$.

**Overview** ($y = \\frac1x$ is symmetric under $x \\leftrightarrow y$, and both of its tails are infinite):

| | $\\int_0^1$ | $\\int_1^\\infty$ |
|---|---|---|
| $x^{-1/2}$ | $2$ | $\\infty$ |
| $x^{-1}$ | $\\infty$ | $\\infty$ |
| $x^{-2}$ | $\\infty$ | $1$ |

So near 0, functions smaller than $\\frac1x$ have finite area. Near $\\infty$ the same holds, with "smaller" meaning decaying faster.

**The nonsense computation.** Blindly applying FTC1 gives
$$\\int_{-1}^1\\frac{dx}{x^2} = -\\frac1x\\Big|_{-1}^1 = -2,$$
a negative "area" for a positive integrand. FTC1 needs $f$ **continuous on $[a, b]$**, and $\\frac{1}{x^2}$ has a singularity at $0$ inside the interval. Split there: $\\int_0^1\\frac{dx}{x^2} = \\infty$, so the integral **diverges**.`,
    pitfall:
      "Integrating straight across a singularity inside [a, b]. Always check where the integrand blows up and split the integral there.",
    related: ["mit1801-improper-improper-integrals", "mit1801-integration-ftc1"],
  },
];
