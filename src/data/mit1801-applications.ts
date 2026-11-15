// MIT 18.01SC Single Variable Calculus (Fall 2010, OCW Scholar; lectures by
// David Jerison) — Unit 2: Applications of Differentiation (Sessions 23-42).
// Sourced from the course's per-session lecture notes (MIT18_01SCF10_SesNNx),
// read page by page, with every approximation, optimum, rate and Newton
// iterate recomputed in sympy/exact arithmetic. Part A: linear and quadratic
// approximation and curve sketching (23-28); Part B: optimization, related
// rates and Newton's method (29-33); Part C: the mean value theorem,
// differentials, antiderivatives and separable differential equations
// (34-40). Session 41 is the Exam 2 review, Session 42 the exam. Session 32
// (ring on a string, a constrained max/min worked example) and Session 36
// (differential notation dy = f′(x)dx, illustrated by (64.1)^(1/3)) are
// folded into the Session 30 and Session 23 cards.
//
// Additions beyond the notes:
// - a proof of the MVT via Rolle's theorem and the extreme value theorem (the
//   notes give only the "slide a parallel line" picture and say the formal
//   proof needs more analysis than the course does);
// - the precise inflection-point condition (f″ changes sign; f″ = 0 alone is
//   not enough, e.g. x⁴), where the notes define it by f″(x₀) = 0;
// - that ∫ dx/x = ln|x| + c may take a different constant on each side of 0.
// Corrections to the notes:
// - Ses28b says x = 0⁺ is "another critical point with critical value −∞"
//   for f(x) = x/ln x; the critical value there is f(0⁺) = 0.
// - Ses27c says the graph of (x+1)/(x+2) is increasing on (−∞, 2) and
//   (2, ∞) and describes the behaviour "near x = 2"; the break is at x = −2.
// - Ses25c/26d list the second derivative of eˣ as "3x"; it is eˣ.
// - Ses40b lists "y = −2y²" among the solutions y = ax²; it is y = −2x².
import type { Card } from "./types";

const MODULE = "mit1801-applications";

export const mit1801ApplicationsCards: Card[] = [
  // --- Session 23: Linear approximation (+ Session 36: differentials) ---
  {
    id: "mit1801-applications-linear-approximation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the linear approximation formula, explain how it is the definition of the derivative read backwards, and list the standard approximations at x = 0.",
    back: `**Formula.** Near a base point $x_0$ a curve is approximately its tangent line:
$$f(x) \\approx f(x_0) + f'(x_0)(x - x_0) \\qquad (x \\approx x_0).$$

**Why.** $f'(x_0) = \\lim_{\\Delta x \\to 0}\\frac{\\Delta f}{\\Delta x}$, so $\\frac{\\Delta f}{\\Delta x} \\approx f'(x_0)$ when $\\Delta x \\approx 0$. Multiply by $\\Delta x$ to get $\\Delta f \\approx f'(x_0)\\Delta x$, which is the same formula.

**Library at $x_0 = 0$** (each line is just $f(0) + f'(0)x$):

| $f(x)$ | $f(0)$ | $f'(0)$ | Approximation |
|---|---|---|---|
| $\\sin x$ | 0 | 1 | $\\sin x \\approx x$ |
| $\\cos x$ | 1 | 0 | $\\cos x \\approx 1$ |
| $e^x$ | 1 | 1 | $e^x \\approx 1 + x$ |
| $\\ln(1 + x)$ | 0 | 1 | $\\ln(1 + x) \\approx x$ |
| $(1 + x)^r$ | 1 | $r$ | $(1 + x)^r \\approx 1 + rx$ |

Use $\\ln(1 + x)$ rather than $\\ln x$ (which blows up at 0). Change variables $u = 1 + x$ to recover $\\ln u \\approx u - 1$ near $u = 1$.

**The point:** "curves are hard, lines are easy". For example, $\\ln 1.1 \\approx 0.1$ (true value $0.0953$).

**Differentials (Session 36).** Write $dy = f'(x)\\,dx$, with $dx$ and $dy$ standing in for $\\Delta x$ and $\\Delta y$ along the tangent line. Example: $y = x^{1/3}$ at $x_0 = 64$ has $dy = \\frac13 64^{-2/3}dx = \\frac{dx}{48}$. So $(64.1)^{1/3} \\approx 4 + \\frac{0.1}{48} \\approx 4.002$ (true value $4.00208$). Leibniz's differential notation is what makes substitution and separation of variables mechanical.`,
    related: ["mit1801-applications-combining-approximations", "mit1801-applications-quadratic-approximation", "mit1801-applications-mvt-and-approximation"],
  },

  // --- Session 24: Examples of linear approximation ---
  {
    id: "mit1801-applications-combining-approximations",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the linear approximation of e⁻³ˣ/√(1 + x) near 0 by combining known approximations, and estimate the relativistic time dilation of a GPS clock.",
    back: `**Combine, don't differentiate.** Write the function as $e^{-3x}(1 + x)^{-1/2}$ and use the library:
$$e^{-3x} \\approx 1 - 3x, \\qquad (1 + x)^{-1/2} \\approx 1 - \\tfrac12 x.$$
Multiply, and **drop the $x^2$ term** (it is negligible when $x$ is small):
$$(1 - 3x)\\left(1 - \\tfrac12x\\right) = 1 - \\tfrac72x + \\tfrac32x^2 \\approx 1 - \\tfrac72x.$$
As a by-product, $f'(0) = -\\frac72$, with no quotient rule needed. At $x = 0.01$ the discarded term is only $0.00015$.

**GPS time dilation.** A clock moving at speed $v$ runs slow:
$$T_m = \\frac{T}{\\sqrt{1 - v^2/c^2}} = T(1 - u)^{-1/2} \\approx T\\left(1 + \\tfrac12 u\\right), \\quad u = \\frac{v^2}{c^2}.$$
So the **relative error** is $\\frac{\\Delta T}{T} \\approx \\frac12\\frac{v^2}{c^2}$. With $v \\approx 4$ km/s and $c = 3 \\times 10^5$ km/s, $\\frac{v^2}{c^2} \\approx 1.8 \\times 10^{-10}$. The notes round this to $10^{-10}$, giving $T_m \\approx T(1.00000000005)$.

That is tiny, but GPS engineers still calibrate for it. When the answer is "too small to matter", a more precise computation would be wasted effort, which is the point of approximating.`,
    pitfall:
      "(1 − u)^(−1/2) ≈ 1 + u/2, not 1 − u/2. Substitute x = −u into (1 + x)^r ≈ 1 + rx and track both minus signs.",
    related: ["mit1801-applications-linear-approximation", "mit1801-applications-quadratic-approximation"],
  },

  // --- Session 25: Introduction to quadratic approximation ---
  {
    id: "mit1801-applications-quadratic-approximation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the quadratic approximation formula. Why is there a ½ in front of the second-derivative term? List the quadratic approximations at 0.",
    back: `$$f(x) \\approx f(x_0) + f'(x_0)(x - x_0) + \\frac{f''(x_0)}{2}(x - x_0)^2 \\qquad (x \\approx x_0).$$

**Why the $\\frac12$.** The approximation of a quadratic should be **the quadratic itself**. For $f = a + bx + cx^2$ we have $f(0) = a$, $f'(0) = b$ and $f''(0) = 2c$, so $c = \\frac{f''(0)}{2}$. Equivalently, the approximating parabola matches $f$, $f'$ **and** $f''$ at $x_0$. Without the $\\frac12$ the second derivatives wouldn't match.

**Library at 0:**
- $\\sin x \\approx x$ (no $x^2$ term, since $\\sin'' 0 = 0$)
- $\\cos x \\approx 1 - \\frac12x^2$
- $e^x \\approx 1 + x + \\frac12x^2$
- $\\ln(1 + x) \\approx x - \\frac12x^2$
- $(1 + x)^r \\approx 1 + rx + \\frac{r(r - 1)}{2}x^2$

**Geometric meaning.** The quadratic term gives the best-fit parabola. $\\cos x \\approx 1$ is a poor horizontal line, while $1 - \\frac{x^2}{2}$ bends down with the graph.

**Accuracy.** $\\ln 1.1 \\approx 0.1 - 0.005 = 0.095$ (true value $0.09531$), against $0.1$ from the linear approximation.

**When to use it:** only when the linear approximation isn't enough, because the algebra grows fast. This is the $n = 2$ case of the Taylor polynomials in Unit 5.`,
    related: ["mit1801-applications-linear-approximation", "mit1801-applications-quadratic-combining"],
  },

  // --- Session 26: Using quadratic approximations ---
  {
    id: "mit1801-applications-quadratic-combining",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the quadratic approximation of e⁻³ˣ(1 + x)⁻¹ᐟ² near 0, and use approximations to see why k·ln(1 + 1/k) → 1 and how fast.",
    back: `**Product of two quadratic approximations.** Substitute $-3x$ into the $e^x$ formula and $r = -\\frac12$ into the $(1 + x)^r$ formula:
$$e^{-3x} \\approx 1 - 3x + \\tfrac92x^2, \\qquad (1 + x)^{-1/2} \\approx 1 - \\tfrac12x + \\tfrac38x^2.$$
Multiply, keeping only terms up to $x^2$:
$$1 - \\tfrac12x - 3x + \\left(\\tfrac38 + \\tfrac32 + \\tfrac92\\right)x^2 = 1 - \\tfrac72x + \\tfrac{51}{8}x^2.$$
The linear part agrees with the Session 24 answer, as it must. Differentiating the product twice would be far worse.

**The limit $(1 + \\frac1k)^k \\to e$ revisited.** With $\\ln(1 + x) \\approx x$:
$$\\ln a_k = k\\ln\\left(1 + \\tfrac1k\\right) \\approx k\\cdot\\tfrac1k = 1,$$
and the approximation improves as $\\frac1k \\to 0$. That is the Session 19 limit in one line.

**Rate of convergence** needs the next term. With $\\ln(1 + x) \\approx x - \\frac{x^2}{2}$:
$$\\ln a_k \\approx 1 - \\frac{1}{2k}, \\qquad\\text{so}\\qquad a_k \\approx e\\left(1 - \\frac{1}{2k}\\right).$$
The error is about $\\frac{e}{2k}$, which is why $(1 + \\frac{1}{10000})^{10000}$ is only good to 4 digits.

**Rule of thumb:** if $x \\approx \\frac{1}{100}$ then $x^3 \\approx 10^{-6}$, so dropping it is safe.`,
    related: ["mit1801-applications-quadratic-approximation", "mit1801-applications-combining-approximations", "mit1801-differentiation-e-as-limit"],
  },

  // --- Session 27: Sketching graphs I ---
  {
    id: "mit1801-applications-curve-sketching-principles",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What do the signs of f′ and f″ say about a graph? Define critical point, critical value and inflection point, and sketch y = 3x − x³ and y = (x + 1)/(x + 2).",
    back: `**Principles** (proved later with the MVT):
- $f' > 0$ means $f$ is increasing; $f' < 0$ means decreasing.
- $f'' > 0$ means $f'$ is increasing, so the graph is **concave up** (a smile). $f'' < 0$ means concave down.

**Definitions.** $x_0$ is a **critical point** if $f'(x_0) = 0$, and then $f(x_0)$ is a **critical value**. An **inflection point** is where the concavity changes. The notes write $f''(x_0) = 0$, which is necessary but not sufficient: $x^4$ has $f''(0) = 0$ and no inflection.

**$f(x) = 3x - x^3$.**
- $f' = 3(1 - x)(1 + x)$: decreasing, then increasing on $(-1, 1)$, then decreasing.
- Critical points $(\\pm1, \\pm2)$.
- $f$ is odd, $f(0) = 0$, and it crosses zero at $x = \\pm\\sqrt3$.
- Ends: $f \\approx -x^3$, so $f \\to \\mp\\infty$ as $x \\to \\pm\\infty$.
- $f'' = -6x$: inflection at the origin.

**$f(x) = \\frac{x + 1}{x + 2} = 1 - \\frac{1}{x + 2}$.**
- $f' = \\frac{1}{(x + 2)^2} > 0$: there are **no critical points**, and that's fine.
- The most important point is the one that isn't there. $f(-2^+) = \\frac{-1}{0^+} = -\\infty$ and $f(-2^-) = +\\infty$, so there is a vertical asymptote at $x = -2$.
- $f(\\pm\\infty) = 1$: horizontal asymptote $y = 1$.
- $f'' = \\frac{-2}{(x + 2)^3}$: concave up on $(-\\infty, -2)$, concave down on $(-2, \\infty)$.

It is increasing on each piece, but **not** on all of its domain: it jumps from $+\\infty$ down to $-\\infty$ across $x = -2$.`,
    pitfall:
      "Increasing doesn't require f′ > 0 everywhere: x³ is increasing although f′(0) = 0. And f′ > 0 on a domain with a gap (like x ≠ −2) does not make f increasing across the gap.",
    related: ["mit1801-applications-curve-sketching-strategy", "mit1801-applications-mvt-consequences"],
  },

  // --- Session 28: Sketching graphs II ---
  {
    id: "mit1801-applications-curve-sketching-strategy",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Give the course's five-step strategy for curve sketching and apply it to f(x) = x/ln x (x > 0).",
    back: `**Strategy.**
1. Precalculus first: plot discontinuities (especially infinite ones), endpoints or $x \\to \\pm\\infty$, and easy points.
2. Solve $f'(x) = 0$ and plot the critical points and values.
3. Check the sign of $f'$ between critical points and discontinuities. This double-checks steps 1 and 2.
4. Check the sign of $f''$ for concavity and inflection. Skip this step if you can.
5. Combine.

**$f(x) = \\frac{x}{\\ln x}$.**
1. **Discontinuity at $x = 1$** ($\\ln 1 = 0$): $f(1^+) = +\\infty$ and $f(1^-) = -\\infty$. **Ends:** $f(0^+) = \\frac{0^+}{-\\infty} = 0$, and $f(10^{10}) = \\frac{10^{10}}{10\\ln 10} \\gg 1$, so $f(\\infty) = \\infty$.
2. $f'(x) = \\frac{\\ln x - 1}{(\\ln x)^2} = 0$ gives $x = e$, with critical value $f(e) = e$.
3. $f$ is decreasing on $(0, 1)$ and on $(1, e)$, and increasing on $(e, \\infty)$. Also $f' = \\frac{1}{\\ln x} - \\frac{1}{(\\ln x)^2} \\to 0$ as $x \\to 0^+$, so the graph leaves $(0, 0)$ horizontally.
4. $f''(x) = \\frac{2 - \\ln x}{x(\\ln x)^3}$:
   - concave down on $(0, 1)$;
   - concave up on $(1, e^2)$;
   - concave down on $(e^2, \\infty)$.

   So there is an inflection point at $(e^2, \\frac{e^2}{2})$. The graph keeps rising there, just less and less steeply.

**Max/min candidates** (Session 29): $x = 0^+$, $1^-$, $1^+$, $e$ and $\\infty$. Only one of them is a critical point.`,
    related: ["mit1801-applications-curve-sketching-principles", "mit1801-applications-max-min-endpoints"],
  },

  // --- Session 29: Optimization problems ---
  {
    id: "mit1801-applications-max-min-endpoints",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Where can a maximum or minimum occur? Cut a wire of length 1 into two pieces, each bent into a square: where should you cut to maximize the total area?",
    back: `**Key principle.** Extrema occur only at **critical points, endpoints and points of discontinuity** (or where $f'$ fails to exist). Finding $f' = 0$ is not enough: you must **compare values** at all candidates.

**Two squares.** Cut at $x$, giving sides $\\frac x4$ and $\\frac{1 - x}{4}$:
$$A(x) = \\frac{x^2}{16} + \\frac{(1 - x)^2}{16}, \\qquad A'(x) = \\frac{2x - 1}{8} = 0 \\iff x = \\tfrac12.$$
Compare the candidates:
- critical point: $A(\\frac12) = \\frac{1}{32}$;
- endpoints: $A(0^+) = A(1^-) = \\frac{1}{16}$.

So the critical point is the **minimum** (two equal squares). The maximum, $\\frac{1}{16}$, is at the endpoints, using all the wire for one square. "If you don't pay attention to what the function looks like you may find the worst answer, rather than the best one."

**Answer the question asked.** "What is the minimum?" asks for the critical **value** $\\frac{1}{32}$. "Where is it?" asks for the critical **point** $x = \\frac12$. Finding both extremes is cheap, and it shows you what the function does.`,
    pitfall:
      "Setting f′ = 0 and stopping. Here that finds the minimum when the problem asked for the maximum; you must always check the endpoints.",
    related: ["mit1801-applications-optimization-box", "mit1801-applications-curve-sketching-strategy"],
  },

  // --- Session 30: Optimization problems II (+ Session 32: ring on a string) ---
  {
    id: "mit1801-applications-optimization-box",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the open-topped box with square base and fixed volume V that has the least surface area, both by eliminating a variable and by implicit differentiation.",
    back: `**Set up.** With base side $x$ and height $y$: $V = x^2y$ (the constraint) and $A = x^2 + 4xy$.

**Method 1: eliminate $y$.** $y = \\frac{V}{x^2}$, so $A(x) = x^2 + \\frac{4V}{x}$ on $0 < x < \\infty$.
- $A'(x) = 2x - \\frac{4V}{x^2} = 0$ gives $x^3 = 2V$, so $x = 2^{1/3}V^{1/3}$.
- **Ends:** $A(0^+) = \\infty$ (an infinitely tall box) and $A(\\infty) = \\infty$. With one critical point and both ends infinite, it must be the minimum.
- Alternatively, $A'' = 2 + \\frac{8V}{x^3} > 0$, so the graph is concave up.

This gives $y = 2^{-2/3}V^{1/3}$ and $A = 3\\cdot 2^{2/3}V^{2/3}$.

**Best answer: dimensionless.** $\\frac{x}{y} = 2$: the base is twice the height, at **every** scale. Also $\\frac{A}{V^{2/3}} = 3\\cdot 2^{2/3}$.

**Method 2: implicit differentiation.** Differentiate both equations in $x$, keeping $V$ fixed:
$$0 = 2xy + x^2y' \\implies y' = -\\frac{2y}{x}, \\qquad A' = 2x + 4y + 4xy' = 2x - 4y.$$
Setting $A' = 0$ gives $\\frac xy = 2$ directly. It's faster, but it doesn't tell you whether you found a max or a min, so you still check the ends.

**Ring on a string (Session 32).** The same idea, with the constraint curve given implicitly: a ring on a string of length $L$ hangs at the lowest point of an ellipse. Setting $y' = 0$ in the implicitly differentiated constraint gives $\\sin\\alpha = \\sin\\beta$. The two halves make **equal angles** with the vertical, which means equal tension. It is also the reflection property of the ellipse's foci.`,
    related: ["mit1801-applications-max-min-endpoints", "mit1801-applications-related-rates", "mit1801-differentiation-implicit-differentiation"],
  },

  // --- Session 31: Related rates ---
  {
    id: "mit1801-applications-related-rates",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Radar 30 ft from a road reads 80 ft/s closing speed when the car is 50 ft away. Is it speeding (limit 95 ft/s)? And how fast does water rise in a conical tank (radius 4, depth 10) filled at 2 ft³/min, at depth 5?",
    back: `**Recipe.**
1. Draw a picture and name the **changing** quantities.
2. Write an equation relating them, then differentiate with respect to $t$ (implicitly).
3. **Only then** plug in the numbers.

**Radar.** Let $x$ be the distance along the road and $D$ the line of sight. Then $30^2 + x^2 = D^2$, with $D = 50$, $x = 40$ and $D' = -80$. Differentiate:
$$2xx' = 2DD' \\implies x' = \\frac{DD'}{x} = \\frac{50(-80)}{40} = -100\\text{ ft/s} \\approx 68\\text{ mph}.$$
That exceeds 95 ft/s (65 mph): **speeding**. The radar under-reads, because it measures $D'$, not $x'$.

**Conical tank.** Similar triangles give $\\frac rh = \\frac{4}{10}$, so $r = \\frac25h$ and
$$V = \\tfrac13\\pi r^2h = \\frac{4\\pi}{75}h^3.$$
By the chain rule:
$$\\frac{dV}{dt} = \\frac{4\\pi}{25}h^2\\frac{dh}{dt} \\implies 2 = \\frac{4\\pi}{25}(25)h' \\implies h' = \\frac{1}{2\\pi}\\text{ ft/min}.$$

Related rates are the chain rule applied to word problems: $\\frac{dV}{dt} = \\frac{dV}{dh}\\frac{dh}{dt}$.`,
    pitfall:
      "Substituting D = 50 before differentiating. 50 is a constant with derivative 0; D is a variable with D′ = −80. Differentiate first, then plug in.",
    related: ["mit1801-differentiation-chain-rule", "mit1801-differentiation-implicit-differentiation", "mit1801-applications-optimization-box"],
  },

  // --- Session 33: Newton's method ---
  {
    id: "mit1801-applications-newtons-method",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Derive Newton's method for f(x) = 0, run it on x² = 5 from x₀ = 2, and explain its convergence rate and how it can fail.",
    back: `**Derivation.** Pretend $f$ is linear. The tangent line at $x_n$ is $y = f(x_n) + f'(x_n)(x - x_n)$. Setting $y = 0$ gives the next guess:
$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}.$$

**$\\sqrt5$:** $f = x^2 - 5$, so $x_{n+1} = \\frac12\\left(x_n + \\frac{5}{x_n}\\right)$ (Heron's rule).

| $n$ | $x_n$ | $\\lvert\\sqrt5 - x_n\\rvert$ |
|---|---|---|
| 0 | $2$ | $2.4 \\times 10^{-1}$ |
| 1 | $\\frac94$ | $1.4 \\times 10^{-2}$ |
| 2 | $\\frac{161}{72}$ | $4.3 \\times 10^{-5}$ |
| 3 | $\\frac{51841}{23184}$ | $4.2 \\times 10^{-10}$ |

**Quadratic convergence:** $E_{n+1} \\sim E_n^2$, so the number of correct digits roughly **doubles** each step ($10^{-1} \\to 10^{-2} \\to 10^{-4} \\to 10^{-8}$).

**Works well when** $\\lvert f'\\rvert$ is not too small, $\\lvert f''\\rvert$ is not too big, and $x_0$ starts near the root.

**What goes wrong:**
- A far start: if $E_0 > 1$, then $E_0^2$ is bigger, and the error grows.
- An **unexpected root**: $x_0 = -2$ converges to $-\\sqrt5$.
- A **horizontal tangent**: $x_0 = 0$ gives $f'(0) = 0$, so $x_1$ is undefined.
- **Cycling**: $x_2 = x_0$, $x_3 = x_1$, … and it never converges.`,
    code: `def newton(f, df, x, tol=1e-12, max_iter=50):
    for _ in range(max_iter):
        d = df(x)
        if d == 0:
            raise ZeroDivisionError("horizontal tangent")
        step = f(x) / d
        x -= step
        if abs(step) < tol:
            return x
    raise RuntimeError("no convergence (cycling or divergence?)")

newton(lambda x: x*x - 5, lambda x: 2*x, 2.0)  # 2.2360679775`,
    codeLang: "python",
    pitfall:
      "Quadratic convergence is local. Far from the root, or near a root where f′ ≈ 0 (a double root), Newton can be slow, jump to another root, or cycle.",
    related: ["mit1801-applications-linear-approximation"],
  },

  // --- Session 34: Introduction to the mean value theorem ---
  {
    id: "mit1801-applications-mean-value-theorem",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the mean value theorem with its hypotheses, prove it from Rolle's theorem, and show why each hypothesis is needed.",
    back: `**MVT.** If $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then for some $c \\in (a, b)$
$$\\frac{f(b) - f(a)}{b - a} = f'(c).$$
Some tangent is parallel to the secant. Fly 3000 km in 6 h and at some moment your speed is exactly 500 km/h.

**The notes' picture.** Slide a line parallel to the secant until it last touches the graph. The point of contact has a parallel tangent. The notes say the formal proof is beyond the course; here it is.

**Rolle's theorem.** If additionally $f(a) = f(b)$, then $f'(c) = 0$ for some $c \\in (a, b)$.
*Proof.* By the extreme value theorem, the continuous $f$ attains a max and a min on $[a, b]$. If both are at endpoints, then $f$ is constant and any $c$ works. Otherwise an extremum is at an interior $c$. There the difference quotient is $\\ge 0$ on one side and $\\le 0$ on the other, so $f'(c) = 0$.

**MVT from Rolle.** Subtract the secant line:
$$g(x) = f(x) - \\left[f(a) + \\frac{f(b) - f(a)}{b - a}(x - a)\\right].$$
Then $g(a) = g(b) = 0$, so Rolle gives $g'(c) = f'(c) - \\frac{f(b) - f(a)}{b - a} = 0$. $\\blacksquare$

**Hypotheses matter.**
- *Continuity:* sit still for 6 h, then teleport 3000 km. You are never doing 500 km/h.
- *Differentiability:* for $f = \\lvert x\\rvert$ on $[-1, 2]$ the secant slope is $\\frac13$, but $f' = \\pm1$ everywhere it exists. "One bad point ruins the proof."`,
    related: ["mit1801-applications-mvt-consequences", "mit1801-differentiation-differentiable-implies-continuous"],
  },
  {
    id: "mit1801-applications-mvt-consequences",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Use the MVT to prove: f′ > 0 ⇒ f increasing, f′ < 0 ⇒ decreasing, f′ = 0 ⇒ constant. Why aren't these obvious?",
    back: `**Proof.** Let $a < b$ in the interval. The MVT, read "backwards", gives
$$f(b) = f(a) + f'(c)(b - a)\\quad\\text{for some } c \\in (a, b).$$
Since $b - a > 0$, the sign of $f(b) - f(a)$ is the sign of $f'(c)$:
- $f' > 0$ everywhere means $f(b) > f(a)$: **increasing**;
- $f' < 0$ means $f(b) < f(a)$: **decreasing**;
- $f' = 0$ means $f(b) = f(a)$: **constant**. $\\blacksquare$

**Why it's not obvious.** The derivative is defined by an infinitesimal limit, a statement about each single point. Nothing in that definition alone links it to large-scale behaviour. The MVT is the bridge: the difference quotient over a **whole interval** is **exactly** a derivative, at some unknown point $c$.

**Payoffs:**
- Curve sketching's first principle is now proved.
- Antiderivatives are unique up to a constant (Session 37).
- The FTC, $\\int_a^b f' = f(b) - f(a)$, rests on these facts.

The hypothesis must hold on an **interval**. On a domain with a gap, $f' = 0$ only gives "locally constant", e.g. $\\operatorname{sign}(x)$ on $x \\neq 0$.`,
    related: ["mit1801-applications-mean-value-theorem", "mit1801-applications-antiderivatives", "mit1801-applications-curve-sketching-principles"],
  },

  // --- Session 35: Using the mean value theorem ---
  {
    id: "mit1801-applications-mvt-and-approximation",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "How does the MVT differ from linear approximation? Use it to prove eˣ > 1 + x and eˣ > 1 + x + x²/2 for x > 0.",
    back: `**Approximation vs exactness.**
- Linear approximation says $\\frac{\\Delta f}{\\Delta x} \\approx f'(a)$, using the slope at the **start**.
- The MVT says $\\frac{\\Delta f}{\\Delta x} = f'(c)$ **exactly**, for some unknown $c \\in (a, b)$. Hence
$$\\min_{[a, b]} f' \\le \\frac{f(b) - f(a)}{b - a} \\le \\max_{[a, b]} f'.$$

Your average speed lies between your minimum and maximum speeds. On a short interval $f'$ barely varies, so this inequality is what **justifies** linear approximation and bounds its error. This is the form used in problem solving.

**Claim 1:** $e^x > 1 + x$ for $x > 0$.
*Proof.* Let $f(x) = e^x - (1 + x)$. Then $f(0) = 0$ and $f'(x) = e^x - 1 > 0$ for $x > 0$. So $f$ is increasing on $[0, \\infty)$, and $f(x) > f(0) = 0$.

**Claim 2:** $e^x > 1 + x + \\frac{x^2}{2}$ for $x > 0$.
*Proof.* Let $g(x) = e^x - (1 + x + \\frac{x^2}{2})$. Then $g(0) = 0$ and $g'(x) = e^x - (1 + x) > 0$ by Claim 1. So $g$ is increasing and $g(x) > 0$. $\\blacksquare$

**Bootstrapping** the same way gives $e^x > 1 + x + \\frac{x^2}{2} + \\frac{x^3}{3!}$, and so on. In the limit,
$$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots,$$
the Taylor series of Unit 5.`,
    related: ["mit1801-applications-mean-value-theorem", "mit1801-applications-linear-approximation"],
  },

  // --- Session 37: Antiderivatives ---
  {
    id: "mit1801-applications-antiderivatives",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "What is an antiderivative / indefinite integral? List the basic ones (including ∫dx/x), and prove antiderivatives are unique up to a constant.",
    back: `**Definition.** $G(x) = \\int g(x)\\,dx$ means $G' = g$, i.e. $dG = g(x)\\,dx$. It is "indefinite" because any constant can be added: $\\frac{d}{dx}(G + c) = g$.

**Read derivative formulas backwards:**
- $\\int\\sin x\\,dx = -\\cos x + c$
- $\\int x^a\\,dx = \\frac{x^{a+1}}{a + 1} + c$ for $a \\neq -1$
- $\\int\\frac{dx}{x} = \\ln\\lvert x\\rvert + c$. For $x < 0$: $\\frac{d}{dx}\\ln(-x) = \\frac{-1}{-x} = \\frac1x$.
- $\\int\\sec^2 x\\,dx = \\tan x + c$
- $\\int\\frac{dx}{\\sqrt{1 - x^2}} = \\sin^{-1}x + c$ (inverse sine, not $\\frac{1}{\\sin x}$)
- $\\int\\frac{dx}{1 + x^2} = \\tan^{-1}x + c$

**Theorem.** If $F' = f$ and $G' = f$ on an interval, then $F = G + c$.

**Proof.** $(F - G)' = f - f = 0$ on the interval. By the MVT corollary, a function with zero derivative on an interval is constant. So $F - G = c$. $\\blacksquare$

This is "the basis for calculus": the rate of change determines a function **except for its starting value**.

**Apparent paradox.** $\\int\\sin x\\cos x\\,dx$ equals both $\\frac12\\sin^2 x$ and $-\\frac12\\cos^2 x$. These differ by $\\frac12(\\sin^2 x + \\cos^2 x) = \\frac12$, which is just a different $c$.`,
    pitfall:
      "Uniqueness needs an interval. ln|x| + c can use different constants on x < 0 and x > 0, because the domain of 1/x has two pieces.",
    related: ["mit1801-applications-mvt-consequences", "mit1801-applications-substitution"],
  },

  // --- Session 38: Integration by substitution ---
  {
    id: "mit1801-applications-substitution",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Integrate x³(x⁴ + 2)⁵, x/√(1 + x²), e⁶ˣ, xe⁻ˣ², and 1/(x ln x) by substitution or advanced guessing.",
    back: `**Substitution.** Pick the "messiest" piece as $u$, so that $du$ absorbs the rest:
$$\\int x^3(x^4 + 2)^5\\,dx \\overset{u = x^4 + 2,\\ du = 4x^3dx}{=} \\int u^5\\,\\frac{du}{4} = \\frac{u^6}{24} + c = \\frac{(x^4 + 2)^6}{24} + c.$$
Always **substitute back** to $x$.

**Advanced guessing.** Guess the form, differentiate, and fix the constant:
- $\\int\\frac{x\\,dx}{\\sqrt{1 + x^2}}$: guess $(1 + x^2)^{1/2}$. Its derivative is $\\frac12(1 + x^2)^{-1/2}\\cdot 2x$, exactly right, so the answer is $\\sqrt{1 + x^2} + c$.
- $\\int e^{6x}dx$: guess $e^{6x}$. Its derivative is $6e^{6x}$, so the answer is $\\frac16e^{6x} + c$.
- $\\int xe^{-x^2}dx$: guess $e^{-x^2}$. Its derivative is $-2xe^{-x^2}$, so the answer is $-\\frac12e^{-x^2} + c$.

**When guessing fails, substitute.**
$$\\int\\frac{dx}{x\\ln x} \\overset{u = \\ln x,\\ du = dx/x}{=} \\int\\frac{du}{u} = \\ln\\lvert\\ln x\\rvert + c.$$

Substitution is the chain rule run backwards. Leibniz's differentials make it bookkeeping: $du = u'(x)\\,dx$.`,
    pitfall:
      "Guessing without checking. Always differentiate your answer; it takes seconds and catches every missing constant factor.",
    related: ["mit1801-applications-antiderivatives", "mit1801-differentiation-chain-rule"],
  },

  // --- Session 39: Introduction to differential equations ---
  {
    id: "mit1801-applications-separation-of-variables",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is separation of variables? Solve dy/dx = −xy, and explain what can be lost along the way.",
    back: `**Simplest ODE.** $\\frac{dy}{dx} = f(x)$ has solution $y = \\int f(x)\\,dx$. When the rate depends on $y$ too, integration alone won't do.

**Separable equations** $\\frac{dy}{dx} = f(x)g(y)$:
1. Separate: $\\frac{dy}{g(y)} = f(x)\\,dx$. Leibniz notation lets you treat differentials like numbers.
2. Integrate both sides: $H(y) = F(x) + c$, with **one** constant ($c = c_2 - c_1$).
3. Solve for $y$ if you can (needs $H^{-1}$). Otherwise leave the **implicit** solution.

**Example** $\\left(\\frac{d}{dx} + x\\right)y = 0$, i.e. $y' = -xy$. This is the quantum harmonic oscillator's "annihilation operator".
$$\\frac{dy}{y} = -x\\,dx \\;\\Longrightarrow\\; \\ln\\lvert y\\rvert = -\\frac{x^2}{2} + c \\;\\Longrightarrow\\; y = ae^{-x^2/2}.$$
The **additive** constant became a **multiplicative** one, $a = \\pm e^c$. An initial condition fixes it: $y(0) = 3$ gives $y = 3e^{-x^2/2}$. Check: $y' = ae^{-x^2/2}(-x) = -xy$. ✓ This is the bell curve.

**What can be lost.** Dividing by $g(y)$ drops the solutions with $g(y) = 0$. Here that is $y \\equiv 0$, which is $a = 0$. Whenever you divide, note what might be zero and check that case separately.

**General vs particular solution.** The family $y = ae^{-x^2/2}$ is the general solution; an initial condition picks one member.`,
    related: ["mit1801-applications-differential-equations-curves", "mit1801-applications-antiderivatives", "mit1806-eigenvalues-differential-equations"],
  },

  // --- Session 40: Separation of variables ---
  {
    id: "mit1801-applications-differential-equations-curves",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the curves whose tangent is twice as steep as the ray from the origin, then the curves perpendicular to them.",
    back: `**Twice as steep.** The ray to $(x, y)$ has slope $\\frac yx$, so
$$\\frac{dy}{dx} = \\frac{2y}{x} \\;\\Longrightarrow\\; \\int\\frac{dy}{y} = \\int\\frac{2\\,dx}{x} \\;\\Longrightarrow\\; \\ln\\lvert y\\rvert = 2\\ln\\lvert x\\rvert + c \\;\\Longrightarrow\\; \\lvert y\\rvert = e^cx^2.$$
So the general solution is $y = ax^2$ for **any** real $a$ (positive, negative, or $a = 0$, which was lost by dividing by $y$). Check: $y' = 2ax = \\frac{2y}{x}$. ✓

*Warning:* the equation says nothing at $x = 0$. A solution can follow one parabola for $x < 0$ and a different one for $x > 0$, so knowing $y(0)$ and $y'(0)$ doesn't determine it.

**Orthogonal trajectories.** Perpendicular slopes multiply to $-1$:
$$\\frac{dy}{dx} = -\\frac{x}{2y} \\;\\Longrightarrow\\; \\int 2y\\,dy = -\\int x\\,dx \\;\\Longrightarrow\\; y^2 + \\frac{x^2}{2} = c.$$
These are **ellipses** with semi-axes $\\sqrt{2c}$ along $x$ and $\\sqrt c$ along $y$ (ratio $\\sqrt2$). Here $c > 0$ is required; not every constant is allowed.

The explicit form $y = \\pm\\sqrt{c - \\frac{x^2}{2}}$ splits each ellipse into two functions. The tangent is vertical at $y = 0$, matching $y' = -\\frac{x}{2y} = \\infty$ there.`,
    related: ["mit1801-applications-separation-of-variables", "mit1801-applications-antiderivatives"],
  },
];
