// MIT 18.01SC Single Variable Calculus (Fall 2010, OCW Scholar; lectures by
// David Jerison) — Unit 3: The Definite Integral and its Applications
// (Sessions 43-67). Sourced from the course's per-session lecture notes
// (MIT18_01SCF10_SesNNx), read page by page, with every integral, area,
// volume, average, probability and numerical-rule value recomputed in sympy.
// Part A: Riemann sums and the first fundamental theorem (43-50); Part B:
// the second fundamental theorem, new functions, areas and volumes (51-59);
// Part C: averages, probability, numerical integration and the Gaussian
// integral (60-65). Session 66 is the Exam 3 review, Session 67 the exam.
// Sessions 43 (definite integral as area), 45 (∫x and ∫1 by geometry), 53
// (ln and the bell-curve area as integrals), 58-59 (sphere and cauldron
// volumes), 61 (weighted averages) and 64 (the ln 2 worked example) are
// folded into neighbouring cards; the tracker says which.
//
// The course numbers the theorems as FTC1: ∫ₐᵇ f = F(b) − F(a) when F′ = f,
// and FTC2: d/dx ∫ₐˣ f(t) dt = f(x). The cards keep that naming.
//
// Additions beyond the notes:
// - a rigorous ε-style bound in the FTC2 proof (the notes approximate the
//   thin strip by a rectangle of height ≈ f(x));
// - the actual Simpson's-rule error for ∫₁² dx/x with n = 10 (3 × 10⁻⁶);
//   the notes estimate it as Δx⁴ ≈ 10⁻⁴.
// Corrections to the notes:
// - Ses48c/49c say substitution in a definite integral needs u′ not to change
//   sign. The forward formula ∫ g(u(x))u′(x)dx = ∫ g(u)du (limits u(x₁),
//   u(x₂)) holds for any continuously differentiable u; what fails in the
//   notes' ∫₋₁¹ x² dx example is inverting u = x² as x = √u on x < 0. The card
//   states it that way.
// - Ses61c converts 40π deg·m³ to "≈ 125,000π Kcal"; it is 40,000π ≈
//   125,664 kcal (about 500 candy bars, as the notes then say).
// - Ses62d prints the dartboard density as e^(−r); the computation uses
//   e^(−r²), which is what the card uses.
import type { Card } from "./types";

const MODULE = "mit1801-integration";

export const mit1801IntegrationCards: Card[] = [
  // --- Session 44: Adding areas of rectangles (+ Session 45: easy integrals) ---
  {
    id: "mit1801-integration-integral-of-x-squared",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Compute ∫₀ᵇ x² dx = b³/3 directly as a limit of rectangle sums, bounding 1² + 2² + ⋯ + n² with pyramids.",
    back: `**Rectangles.** Split $[0, b]$ into $n$ pieces of width $\\frac bn$. Use right endpoints $x_i = \\frac{ib}{n}$ as heights, which slightly overestimates:
$$\\sum_{i=1}^{n}\\frac bn\\left(\\frac{ib}{n}\\right)^2 = \\frac{b^3}{n^3}\\left(1^2 + 2^2 + \\cdots + n^2\\right).$$
Factor out what you understand ($\\frac{b^3}{n^3}$) and isolate the hard sum.

**Pyramid bounds.** Stack layers of $n^2, (n-1)^2, \\ldots, 1$ unit cubes into a stair-step pyramid of volume $\\sum i^2$. It contains the ordinary pyramid with base $n \\times n$ and height $n$, and fits inside the one with base and height $n + 1$. So
$$\\frac13n^3 < 1^2 + 2^2 + \\cdots + n^2 < \\frac13(n + 1)^3.$$
Divide by $n^3$:
$$\\frac13 < \\frac{\\sum i^2}{n^3} < \\frac13\\left(1 + \\frac1n\\right)^3 \\xrightarrow{n\\to\\infty}\\frac13.$$
By the squeeze, the sum of rectangle areas tends to $\\frac{b^3}{3}$:
$$\\int_0^b x^2\\,dx = \\frac{b^3}{3}.$$
(The exact closed form $\\sum i^2 = \\frac{n(n+1)(2n+1)}{6}$ gives the same limit.)

**Easy ones by geometry (Session 45):** $\\int_0^b x\\,dx = \\frac12b^2$ (a triangle) and $\\int_0^b 1\\,dx = b$ (a rectangle).

**Lesson:** the limit is easier than the sum. This is why calculus exists, and why FTC1 (next) is such a relief.`,
    related: ["mit1801-integration-riemann-sums", "mit1801-integration-ftc1", "mit6120-analysis-ansatz-sum-of-squares", "mit6120-analysis-integral-method"],
  },

  // --- Session 46: Riemann sums (+ Session 43: definite integrals) ---
  {
    id: "mit1801-integration-riemann-sums",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the definite integral as a limit of Riemann sums, and explain the integral as a cumulative sum using the borrowing-with-interest example.",
    back: `**Area under a curve (Session 43).** $\\int_a^b f(x)\\,dx$ is the area between the graph of $f$ and the $x$-axis over $[a, b]$:
1. divide it into thin rectangles;
2. add their areas;
3. take the limit as they become infinitely thin.

A **definite** integral has endpoints and is a **number**. An indefinite integral is a family of functions.

**Riemann sum.** Split $[a, b]$ into $n$ pieces of width $\\Delta x = \\frac{b - a}{n}$ and pick **any** $c_i$ in the $i$th piece:
$$\\sum_{i=1}^{n}f(c_i)\\,\\Delta x \\;\\xrightarrow{n\\to\\infty}\\; \\int_a^b f(x)\\,dx.$$
The notation $\\int f\\,dx$ mimics $\\sum f\\,\\Delta x$ (the $\\int$ is a stretched S, for "sum").

**Cumulative sums, not just areas.** Let $f(t)$ be a borrowing **rate** in dollars/year, so on day $i$ you borrow $f\\!\\left(\\frac{i}{365}\\right)\\Delta t$ dollars with $\\Delta t = \\frac{1}{365}$ year. The $dx$ keeps **units** consistent: (dollars/year) × years = dollars.
- Total borrowed: $\\sum_i f\\!\\left(\\frac{i}{365}\\right)\\Delta t \\approx \\int_0^1 f(t)\\,dt$.
- With continuous interest at rate $r$, money borrowed at time $t$ grows by the end of the year to $e^{r(1-t)}$ times itself. So you owe
$$\\int_0^1 e^{r(1 - t)}f(t)\\,dt.$$

Integrals like this are what you optimize when designing a borrowing strategy.`,
    related: ["mit1801-integration-integral-of-x-squared", "mit1801-integration-ftc1", "mit1801-integration-numerical-integration"],
  },

  // --- Session 47: Introduction of the fundamental theorem of calculus ---
  {
    id: "mit1801-integration-ftc1",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the (first) fundamental theorem of calculus, and use it for ∫₀ᵇ x² dx, the area under one hump of sin x, and ∫₀¹ x¹⁰⁰ dx.",
    back: `**FTC1.** If $f$ is continuous and $F' = f$, then
$$\\int_a^b f(x)\\,dx = F(b) - F(a) = F(x)\\Big|_a^b.$$
It connects the **definite** integral (a number, defined by Riemann sums) to the **indefinite** integral (an antiderivative). The course calls it "probably the most important thing in this entire course".

**Examples.**
- $\\int_0^b x^2\\,dx = \\frac{x^3}{3}\\Big|_0^b = \\frac{b^3}{3}$. No pyramids, sums or limits needed.
- One hump of sine: $\\int_0^\\pi \\sin x\\,dx = -\\cos x\\Big|_0^\\pi = -(-1) - (-1) = 2$.
- $\\int_0^1 x^{100}\\,dx = \\frac{x^{101}}{101}\\Big|_0^1 = \\frac{1}{101}$.

**Interpretation (Session 48).** With position $x(t)$ and velocity $v = x'$:
$$\\int_a^b v(t)\\,dt = x(b) - x(a).$$
The speedometer readings, summed, give the odometer change. Reading the speedometer every second, $\\sum v(t_i)\\Delta t$ is the Riemann sum; the integral is the exact distance.`,
    pitfall:
      "Sign slips in F(b) − F(a): −cos π − (−cos 0) = 1 + 1 = 2, not 0. Write both evaluations out in full.",
    related: ["mit1801-integration-riemann-sums", "mit1801-integration-properties", "mit1801-integration-ftc-proofs", "mit1801-applications-antiderivatives"],
  },

  // --- Session 48: The fundamental theorem of calculus ---
  {
    id: "mit1801-integration-properties",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does a definite integral measure when f < 0? List the properties of definite integrals, including estimation and change of variables.",
    back: `**Signed area.** $\\int_0^{2\\pi}\\sin x\\,dx = -\\cos x\\Big|_0^{2\\pi} = 0$. The integral **adds** area above the axis and **subtracts** area below it. For velocity this is the **net** displacement (a round trip gives 0); total distance is $\\int \\lvert v\\rvert\\,dt$.

**Properties** (all inherited from Riemann sums):
1. $\\int_a^b(f + g) = \\int_a^b f + \\int_a^b g$.
2. $\\int_a^b cf = c\\int_a^b f$ for a **constant** $c$. Never pull out a non-constant function.
3. $\\int_a^b f + \\int_b^c f = \\int_a^c f$.
4. $\\int_a^a f = 0$.
5. $\\int_b^a f = -\\int_a^b f$. This frees property 3 from needing $a < b < c$.
6. **Estimation:** if $f \\le g$ and $a < b$, then $\\int_a^b f \\le \\int_a^b g$. (Only valid when $a < b$.)
7. **Change of variables:** if $u = u(x)$, then
$$\\int_{x_1}^{x_2}g(u(x))\\,u'(x)\\,dx = \\int_{u(x_1)}^{u(x_2)}g(u)\\,du.$$
Change the limits along with the variable.`,
    related: ["mit1801-integration-ftc1", "mit1801-integration-estimation-substitution"],
  },

  // --- Session 49: Applications of the fundamental theorem ---
  {
    id: "mit1801-integration-estimation-substitution",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Integrate eˣ ≥ 1 to get polynomial lower bounds for eᵇ. Evaluate ∫₁² (x³ + 2)⁵x² dx by substitution, and explain what goes wrong substituting u = x² in ∫₋₁¹ x² dx.",
    back: `**Estimation, repeatedly.** For $b \\ge 0$:
$$e^x \\ge 1 \\;\\Rightarrow\\; \\int_0^b e^x\\,dx \\ge \\int_0^b 1\\,dx \\;\\Rightarrow\\; e^b - 1 \\ge b \\;\\Rightarrow\\; e^b \\ge 1 + b.$$
Integrate again: $e^b \\ge 1 + b + \\frac{b^2}{2}$, and so on. At $b = 1$ this gives $e \\ge 2\\frac12$. These fail for $b < 0$, because estimation needs $a < b$.

**Definite substitution.** Take $u = x^3 + 2$, so $du = 3x^2\\,dx$. The limits $x = 1, 2$ become $u = 3, 10$:
$$\\int_1^2 (x^3 + 2)^5x^2\\,dx = \\int_3^{10}u^5\\,\\frac{du}{3} = \\frac{u^6}{18}\\Big|_3^{10} = \\frac{10^6 - 3^6}{18} = \\frac{999271}{18}.$$
No back-substitution is needed: the new limits do the work.

**The $u = x^2$ trap.** On $[-1, 1]$ both endpoints map to $u = 1$, and writing $dx = \\frac{du}{2\\sqrt u}$ gives $\\int_1^1(\\ldots) = 0$, but the true value is $\\frac23$. The culprit is the inversion $x = \\sqrt u$, which is wrong for $x < 0$ (there $x = -\\sqrt u$).

**Safe practice:** split the interval where $u'$ changes sign (here at 0), so that $u$ is invertible on each piece:
$$\\int_{-1}^0 x^2\\,dx + \\int_0^1 x^2\\,dx = \\tfrac13 + \\tfrac13 = \\tfrac23.$$`,
    pitfall:
      "Forgetting to change the limits. After substituting u, integrate between u(x₁) and u(x₂), or else substitute back to x before plugging in the original limits.",
    related: ["mit1801-integration-properties", "mit1801-applications-substitution", "mit1801-applications-mvt-and-approximation"],
  },

  // --- Session 50: Combining the FTC and the MVT ---
  {
    id: "mit1801-integration-ftc-mvt",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Read FTC1 as ΔF = Average(F′)·Δx and compare it with the MVT. Given F′(x) = 1/(1 + x) and F(0) = 1, bound F(4).",
    back: `**Average value.** Dividing FTC1 by $\\Delta x = b - a$:
$$\\frac{\\Delta F}{\\Delta x} = \\frac{1}{b - a}\\int_a^b F'(x)\\,dx = \\text{Average}(F').$$
This is a limit of averages $\\frac{f(x_1) + \\cdots + f(x_n)}{n}$ of the derivative.

**MVT vs FTC.**
- The MVT says $\\Delta F = F'(c)\\,\\Delta x$ for an **unknown** $c$.
- FTC1 says $\\Delta F = \\text{Average}(F')\\,\\Delta x$, a **specific** number.

Both give the same practical conclusion:
$$\\left(\\min_{[a, b]}F'\\right)\\Delta x \\le \\Delta F \\le \\left(\\max_{[a, b]}F'\\right)\\Delta x.$$
"As soon as we have integrals, we can abandon the mean value theorem."

**Exam problem.** $F' = \\frac{1}{1 + x}$ decreases from 1 to $\\frac15$ on $[0, 4]$.
- **Via the MVT:** $F(4) - F(0) = \\frac{4}{1 + c}$ with $0 < c < 4$, so $\\frac45 < F(4) - 1 < 4$.
- **Via FTC1:** $\\int_0^4\\frac{dx}{1 + x}$ is squeezed between one-rectangle lower and upper Riemann sums, $4\\cdot\\frac15$ and $4\\cdot 1$.

Either way, $\\frac95 < F(4) < 5$. (Exactly, $F(4) = 1 + \\ln 5 \\approx 2.61$.)`,
    related: ["mit1801-integration-ftc1", "mit1801-applications-mean-value-theorem", "mit1801-integration-average-value"],
  },

  // --- Session 51: The second fundamental theorem of calculus ---
  {
    id: "mit1801-integration-ftc2",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the second fundamental theorem, explain the dummy variable, and compute d/dx ∫₁ˣ dt/t² both ways.",
    back: `**FTC2.** If $f$ is continuous and $G(x) = \\int_a^x f(t)\\,dt$, then
$$G'(x) = f(x).$$
The input $x$ is the **upper limit**. The variable $t$ is a **dummy** (the variable of integration). Don't mix up $t$ and $x$.

**As a differential equation.** $G$ solves $y' = f$ with $y(a) = 0$. So **every continuous function has an antiderivative**, constructed by Riemann sums if necessary.

**Quiz question "everybody gets wrong until they practice".** $\\frac{d}{dx}\\int_1^x\\frac{dt}{t^2} = \\frac{1}{x^2}$. Just recopy the integrand with $t \\to x$; no integration needed.

**Checking the slow way:**
$$\\int_1^x t^{-2}\\,dt = -t^{-1}\\Big|_1^x = 1 - \\frac1x, \\qquad \\frac{d}{dx}\\left(1 - \\frac1x\\right) = \\frac{1}{x^2}. ✓$$
There is no arbitrary constant: any constant is killed by $\\frac{d}{dx}$.

**With the chain rule:** $\\frac{d}{dx}\\int_a^{g(x)}f(t)\\,dt = f(g(x))\\,g'(x)$.`,
    pitfall:
      "d/dx ∫ₐˣ f(t) dt is f(x), not f(x) − f(a). The lower limit only fixes the constant, and it disappears on differentiating.",
    related: ["mit1801-integration-ftc-proofs", "mit1801-integration-ln-as-integral", "mit1801-integration-new-functions"],
  },

  // --- Session 52: Proving the fundamental theorem of calculus ---
  {
    id: "mit1801-integration-ftc-proofs",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove FTC2 (d/dx ∫ₐˣ f = f for continuous f), then deduce FTC1 (∫ₐᵇ f = F(b) − F(a) whenever F′ = f).",
    back: `**FTC2.** Let $G(x) = \\int_a^x f(t)\\,dt$. Then
$$\\Delta G = G(x + \\Delta x) - G(x) = \\int_x^{x + \\Delta x}f(t)\\,dt,$$
the area of a thin strip. The notes approximate it by a rectangle: $\\Delta G \\approx f(x)\\Delta x$.

To make this precise, let $m$ and $M$ be the min and max of $f$ on $[x, x + \\Delta x]$. By estimation,
$$m\\,\\Delta x \\le \\Delta G \\le M\\,\\Delta x \\quad\\Longrightarrow\\quad m \\le \\frac{\\Delta G}{\\Delta x} \\le M.$$
As $\\Delta x \\to 0$, continuity forces $m, M \\to f(x)$. By the squeeze, $G'(x) = f(x)$. $\\blacksquare$ (For $\\Delta x < 0$ the argument is the same.)

**FTC1.** Suppose $F' = f$, with $f$ continuous. Define $G(x) = \\int_a^x f(t)\\,dt$. By FTC2, $G' = f = F'$. So $(F - G)' = 0$, and by the **MVT corollary** $F = G + c$. Then
$$F(b) - F(a) = (G(b) + c) - (G(a) + c) = \\int_a^b f - \\int_a^a f = \\int_a^b f(t)\\,dt. \\;\\blacksquare$$

**What carries the weight.** "All of calculus is founded on the fact that if two functions have the same derivative, they differ by a constant." That fact comes from the MVT, which in turn needs the completeness of the reals (through the extreme value theorem).`,
    related: ["mit1801-integration-ftc2", "mit1801-integration-ftc1", "mit1801-applications-mvt-consequences", "mit1801-applications-mean-value-theorem"],
  },

  // --- Session 54: The second fundamental theorem and ln x (+ Session 53) ---
  {
    id: "mit1801-integration-ln-as-integral",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define L(x) = ∫₁ˣ dt/t. Derive the shape of its graph, define e from it, and prove L(ab) = L(a) + L(b).",
    back: `**Definition.** By FTC2, $L(x) = \\int_1^x\\frac{dt}{t}$ ($x > 0$) is the unique solution of $L' = \\frac1x$, $L(1) = 0$. So $L = \\ln$. Starting from a ratio of polynomials, we get a **transcendental** function.

**Graph from the definition alone:**
- $L' = \\frac1x > 0$, so $L$ is increasing.
- $L'' = -\\frac{1}{x^2} < 0$, so $L$ is concave down.
- $L(1) = 0$ and $L'(1) = 1$.
- For $0 < x < 1$, $L(x) = -\\int_x^1\\frac{dt}{t} < 0$ (minus a positive area).
- $L \\to -\\infty$ as $x \\to 0^+$, and $L \\to +\\infty$ as $x \\to \\infty$.

**Define $e$** as the unique point with $L(e) = 1$. It is unique because $L$ is increasing.

**Theorem.** $L(ab) = L(a) + L(b)$ for $a, b > 0$.

**Proof.** Split the range of integration:
$$L(ab) = \\int_1^{a}\\frac{dt}{t} + \\int_a^{ab}\\frac{dt}{t} = L(a) + \\int_a^{ab}\\frac{dt}{t}.$$
In the second integral substitute $t = au$, so $dt = a\\,du$ and the limits $t = a, ab$ become $u = 1, b$:
$$\\int_a^{ab}\\frac{dt}{t} = \\int_1^b\\frac{a\\,du}{au} = \\int_1^b\\frac{du}{u} = L(b). \\;\\blacksquare$$

This route defines $\\ln$ **first**, then $e^x$ as its inverse. It avoids the "fill in irrational exponents by continuity" step of Unit 1.`,
    related: ["mit1801-integration-ftc2", "mit1801-differentiation-e-and-ln", "mit1801-integration-new-functions"],
  },

  // --- Session 55: Creating new functions using the second FTC ---
  {
    id: "mit1801-integration-new-functions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does FTC2 create genuinely new functions? Sketch F(x) = ∫₀ˣ e⁻ᵗ² dt, and name some other functions defined this way.",
    back: `FTC2 solves $y' = f$, $y(a) = 0$ for **any** continuous $f$, even when no elementary antiderivative exists.

**$F(x) = \\int_0^x e^{-t^2}\\,dt$**, the area under the bell curve:
- $F(0) = 0$.
- $F'(x) = e^{-x^2} > 0$: increasing, with slope 1 at 0.
- $F''(x) = -2xe^{-x^2}$: concave up for $x < 0$, concave down for $x > 0$.
- **Odd**, by the symmetry of $e^{-t^2}$: $F(-x) = -F(x)$.
- **Horizontal asymptotes** at $\\pm\\frac{\\sqrt\\pi}{2}$ (proved in Session 65).

Normalising gives the **error function**:
$$\\operatorname{erf}(x) = \\frac{2}{\\sqrt\\pi}\\int_0^x e^{-t^2}\\,dt,$$
a cousin of the standard normal cdf.

**Other new functions:**
- Fresnel integrals $C(x) = \\int_0^x\\cos(t^2)\\,dt$ and $S(x) = \\int_0^x\\sin(t^2)\\,dt$ (optics).
- $\\int_0^x\\frac{\\sin t}{t}\\,dt$ (Fourier analysis).
- The logarithmic integral $\\operatorname{Li}(x) = \\int_2^x\\frac{dt}{\\ln t}$, which approximates the number of primes below $x$. Pinning down the error is the Riemann hypothesis.

**Session 53:** $\\ln x = \\int_1^x\\frac{dt}{t}$ is the familiar example. FTC2 turned a ratio of polynomials into a transcendental function.

For this course, what you can do with such functions is differentiate them, find concavity, and sketch them.`,
    related: ["mit1801-integration-ftc2", "mit1801-integration-gaussian-integral", "mit1801-integration-ln-as-integral", "mit1805-probability-gallery-continuous"],
  },

  // --- Session 56: Geometric interpretation of definite integrals ---
  {
    id: "mit1801-integration-area-between-curves",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the area between x = y² and y = x − 2, slicing both vertically and horizontally.",
    back: `**Area between curves:** $A = \\int_a^b(\\text{top} - \\text{bottom})\\,dx$. The two key steps are finding the **integrand** and the **limits**.

**Intersections.** Substituting $x = y^2$ into $y = x - 2$ gives $y^2 - y - 2 = (y - 2)(y + 1) = 0$. The curves meet at $(1, -1)$ and $(4, 2)$.

**Vertical slices (the hard way).** The bottom boundary changes at $x = 1$, so two integrals are needed:
$$A = \\int_0^1\\left(\\sqrt x - (-\\sqrt x)\\right)dx + \\int_1^4\\left(\\sqrt x - (x - 2)\\right)dx = \\frac43 + \\frac{19}{6} = \\frac92.$$

**Horizontal slices (the easy way).** Use right curve minus left curve, $x = y + 2$ and $x = y^2$, for $y$ from $-1$ to $2$:
$$A = \\int_{-1}^{2}\\left((y + 2) - y^2\\right)dy = \\left[\\frac{y^2}{2} + 2y - \\frac{y^3}{3}\\right]_{-1}^{2} = \\frac{10}{3} + \\frac76 = \\frac92.$$

**Heuristic:** as soon as one slicing direction forces you to split the region, try the other. At the limits the integrand is 0, a free check that you found the right intersection points.`,
    related: ["mit1801-integration-volumes", "mit1801-integration-properties"],
  },

  // --- Session 57: How to calculate volumes (+ Sessions 58-59) ---
  {
    id: "mit1801-integration-volumes",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Explain volumes by slicing, disks and shells. Find the volume of a ball of radius a by disks, and of the paraboloid cauldron y = x² ≤ a by shells.",
    back: `**Slicing.** As with a loaf of bread, $dV = A(x)\\,dx$ and $V = \\int A(x)\\,dx$.

**Disks** (revolve about the $x$-axis): a slice of height $y$ sweeps out a disk with $dV = \\pi y^2\\,dx$.

**Ball (Session 58).** Revolve the circle $(x - a)^2 + y^2 = a^2$, so $y^2 = 2ax - x^2$; there is no need for square roots:
$$V = \\int_0^{2a}\\pi(2ax - x^2)\\,dx = \\pi\\left[ax^2 - \\frac{x^3}{3}\\right]_0^{2a} = \\frac43\\pi a^3.$$
A variable upper limit gives the cap volume $V(x) = \\pi\\left(ax^2 - \\frac{x^3}{3}\\right)$. Check: $V(a) = \\frac23\\pi a^3$, half the ball. ✓

**Shells** (revolve about the $y$-axis, Session 59): a vertical strip at radius $x$ sweeps out a thin cylinder. Unrolled, it is a slab with
$$dV = (2\\pi x)(\\text{height})\\,dx.$$

**Cauldron.** The region between $y = x^2$ and $y = a$, revolved about the $y$-axis:
$$V = \\int_0^{\\sqrt a}2\\pi x\\,(a - x^2)\\,dx = 2\\pi\\left[\\frac{ax^2}{2} - \\frac{x^4}{4}\\right]_0^{\\sqrt a} = \\frac{\\pi}{2}a^2.$$
Integrate only over $x \\ge 0$: the right half sweeps out the whole solid, and including the left half would double count.

**Units warning.** $\\frac\\pi2a^2$ "looks like an area" because $y = x^2$ isn't scale-invariant. With $a = 100$ cm you get about 16 liters (a pot 5× as tall as wide). With $a = 1$ m you get about 1600 liters (twice as wide as tall).

**Choosing disks or shells:** set it up both ways and pick the easy integral. For example, revolving $0 < y < x - x^3$ about the $y$-axis is easy with shells ($\\frac{4\\pi}{15}$), but washers would need $x$ as a function of $y$ from a cubic.`,
    related: ["mit1801-integration-area-between-curves", "mit1801-integration-weighted-averages-probability"],
  },

  // --- Session 60: Integrals and averages ---
  {
    id: "mit1801-integration-average-value",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Define the average value of f on [a, b]. Find the average height of the unit semicircle with respect to x and with respect to arc length. Why do they differ?",
    back: `**Continuous average.**
$$\\operatorname{Ave}(f) = \\frac{1}{b - a}\\int_a^b f(x)\\,dx.$$
This is the $n \\to \\infty$ limit of $\\frac{y_1 + \\cdots + y_n}{n}$: the Riemann sum $(y_1 + \\cdots + y_n)\\Delta x$, divided by $b - a = n\\Delta x$. Check: the average of a constant $c$ is $c$, which confirms the $\\frac{1}{b - a}$.

**With respect to $x$.** $f = \\sqrt{1 - x^2}$ on $[-1, 1]$:
$$\\frac12\\int_{-1}^1\\sqrt{1 - x^2}\\,dx = \\frac12\\cdot\\frac\\pi2 = \\frac\\pi4 \\approx 0.785,$$
using the area of the half-disk rather than an antiderivative.

**With respect to arc length $\\theta$.** The height is $\\sin\\theta$ for $\\theta \\in [0, \\pi]$:
$$\\frac1\\pi\\int_0^\\pi\\sin\\theta\\,d\\theta = \\frac2\\pi \\approx 0.637.$$

**Why smaller?** Equal arc lengths near the ends cover only small $x$-intervals. So averaging over arc length **weights the low parts more**. Indeed $\\frac2\\pi < \\frac\\pi4 \\iff 8 < \\pi^2$. ✓

**Moral:** always say *with respect to which variable* you are averaging. Picking a uniformly random point on the diameter and picking one on the arc are different experiments, with different expected heights.`,
    related: ["mit1801-integration-ftc-mvt", "mit1801-integration-weighted-averages-probability"],
  },

  // --- Session 62: Integrals and probability (+ Session 61: weighted averages) ---
  {
    id: "mit1801-integration-weighted-averages-probability",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Define a weighted average ∫fw/∫w and the probability Part/Whole. Use them for the cauldron's average temperature, a random point under y = 1 − x², and the dartboard (P(hit) = ½ ⇒ P(hit brother) ≈ 1%).",
    back: `**Weighted average (Session 61).**
$$\\frac{\\int_a^b f(x)w(x)\\,dx}{\\int_a^b w(x)\\,dx}.$$
This is the continuous version of the average price per share, $\\frac{10w_1 + 20w_2 + 30w_3}{w_1 + w_2 + w_3}$. You can't factor $f$ out unless it is constant.

**Cauldron.** The 1 m-high paraboloid $y = x^2$, with water at $T = 100 - 30y$ °C. Disks have weight $w(y) = \\pi x^2 = \\pi y$.
- Energy: $\\int_0^1(100 - 30y)\\pi y\\,dy = 40\\pi$ deg·m³. That is $40\\pi \\times 10^3$ kcal ≈ 125,700 kcal, about 500 candy bars.
- Average final temperature: $\\frac{40\\pi}{\\pi/2} = 80$°, **not** $\\frac{100 + 70}{2} = 85$°, because there is more water near the top.

**Probability = Part / Whole.**
$$P(x_1 < x < x_2) = \\frac{\\int_{x_1}^{x_2}w}{\\int_a^b w}.$$

**Random point under $y = 1 - x^2$:**
$$P\\left(x > \\tfrac12\\right) = \\frac{\\int_{1/2}^1(1 - x^2)\\,dx}{\\int_{-1}^1(1 - x^2)\\,dx} = \\frac{5/24}{4/3} = \\frac{5}{32}.$$

**Dartboard.** Hits have density $ce^{-r^2}$ per unit area. A ring has area $2\\pi r\\,dr$, so by shells
$$P(r_1 < r < r_2) = \\frac{\\int_{r_1}^{r_2}2\\pi re^{-r^2}\\,dr}{\\int_0^\\infty 2\\pi re^{-r^2}\\,dr} = e^{-r_1^2} - e^{-r_2^2}.$$
The constant $c$ cancels.
- If the board (radius $a$) is hit half the time, $1 - e^{-a^2} = \\frac12$, so $e^{-a^2} = \\frac12$.
- The brother fills $\\frac16$ of the ring from $2a$ to $3a$: $P = \\frac16\\left[\\left(\\tfrac12\\right)^4 - \\left(\\tfrac12\\right)^9\\right] = \\frac16\\cdot\\frac{31}{512} \\approx 1\\%$.`,
    pitfall:
      "Using the 1-D density e^(−r²) as the weight. For rings you need the area factor 2πr; that's why the bullseye itself is rarely hit even though the density peaks there.",
    related: ["mit1801-integration-average-value", "mit1801-integration-gaussian-integral", "mit1805-probability-continuous-random-variables"],
  },

  // --- Session 63: Numerical integration (+ Session 64) ---
  {
    id: "mit1801-integration-numerical-integration",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Give the left/right Riemann sums, the trapezoidal rule and Simpson's rule. Estimate ∫₁² dx/x = ln 2 with n = 2, and compare their accuracy.",
    back: `With $x_i = a + i\\Delta x$, $y_i = f(x_i)$ and $\\Delta x = \\frac{b - a}{n}$:

| Rule | Formula | Exact for |
|---|---|---|
| Left Riemann | $\\Delta x(y_0 + \\cdots + y_{n-1})$ | constants |
| Right Riemann | $\\Delta x(y_1 + \\cdots + y_n)$ | constants |
| Trapezoidal | $\\Delta x\\left(\\frac{y_0}{2} + y_1 + \\cdots + y_{n-1} + \\frac{y_n}{2}\\right)$ | lines |
| Simpson ($n$ even) | $\\frac{\\Delta x}{3}(y_0 + 4y_1 + 2y_2 + 4y_3 + \\cdots + 4y_{n-1} + y_n)$ | cubics (!) |

The trapezoidal rule is the **average of the left and right sums**. Simpson's rule fits **parabolas** through triples of points, and by symmetry it is also exact for cubics. Its error therefore scales like $\\Delta x^4$, against $\\Delta x^2$ for trapezoids.

**$\\ln 2 = 0.693147\\ldots$ with $n = 2$** ($y = 1, \\frac23, \\frac12$):
- Trapezoid: $\\frac12\\left(\\frac12 + \\frac23 + \\frac14\\right) \\approx 0.7083$.
- Simpson: $\\frac16\\left(1 + \\frac83 + \\frac12\\right) \\approx 0.69444$.

With $n = 10$, the trapezoid error is $6 \\times 10^{-4}$ and the Simpson error is $3 \\times 10^{-6}$.

**Self-check (Session 64).** Plug in $f \\equiv 1$; any correct rule must return $b - a$.

**Caveat:** Simpson's rule struggles where $f'$ is unbounded or the graph isn't smooth.`,
    code: `def trapezoid(f, a, b, n):
    h = (b - a) / n
    return h * (f(a) / 2 + sum(f(a + i*h) for i in range(1, n)) + f(b) / 2)

def simpson(f, a, b, n):          # n must be even
    h = (b - a) / n
    s = f(a) + f(b) + sum((4 if i % 2 else 2) * f(a + i*h) for i in range(1, n))
    return h / 3 * s

simpson(lambda x: 1/x, 1, 2, 2)   # 0.69444...`,
    codeLang: "python",
    related: ["mit1801-integration-riemann-sums", "mit1801-applications-newtons-method", "mit6120-analysis-integral-method"],
  },

  // --- Session 65: Bell curve conclusion ---
  {
    id: "mit1801-integration-gaussian-integral",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove ∫₋∞^∞ e⁻ˣ² dx = √π by computing the volume under the surface z = e⁻ʳ² in two ways.",
    back: `Let $Q = \\int_{-\\infty}^{\\infty}e^{-x^2}dx$. It has no elementary antiderivative, so a trick is needed: compute one volume two ways.

**1. By shells.** Revolve $z = e^{-r^2}$ about the vertical axis:
$$V = \\int_0^\\infty 2\\pi r\\,e^{-r^2}dr = -\\pi e^{-r^2}\\Big|_0^\\infty = \\pi.$$
This is the dartboard integral again.

**2. By slices.** Cut the solid with the plane $y = b$. On that plane $r^2 = x^2 + b^2$, so the height is
$$e^{-(x^2 + b^2)} = e^{-b^2}e^{-x^2}.$$
The slice area is
$$A(b) = \\int_{-\\infty}^{\\infty}e^{-b^2}e^{-x^2}dx = e^{-b^2}Q.$$
Integrate the slices:
$$V = \\int_{-\\infty}^{\\infty}A(y)\\,dy = Q\\int_{-\\infty}^{\\infty}e^{-y^2}dy = Q^2.$$

**Compare:** $Q^2 = \\pi$, so $Q = \\sqrt\\pi$ (as $Q > 0$). $\\blacksquare$

**Consequences:**
- $F(x) = \\int_0^x e^{-t^2}dt \\to \\frac{\\sqrt\\pi}{2}$ as $x \\to \\infty$, so $\\operatorname{erf}(\\infty) = 1$.
- The normal density $\\frac{1}{\\sqrt{2\\pi}}e^{-x^2/2}$ integrates to 1 (substitute $x = \\sqrt2u$).

Here $x$ and $y$ are **independent** variables: inside a slice, $y = b$ is held fixed while $x$ runs over $\\mathbb{R}$.`,
    related: ["mit1801-integration-new-functions", "mit1801-integration-weighted-averages-probability", "mit1805-probability-gallery-continuous", "mit1805-probability-central-limit-theorem"],
  },
];
