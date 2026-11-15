// MIT 18.01SC Single Variable Calculus (Fall 2010, OCW Scholar; lectures by
// David Jerison) — Unit 4: Techniques of Integration (Sessions 68-86).
// Sourced from the course's per-session lecture notes (MIT18_01SCF10_SesNNx),
// read page by page; every antiderivative was verified by differentiating
// in sympy, and every partial-fraction decomposition, area, length and volume
// was recomputed. Kept deliberately lean (exercise mechanics are not the
// point for a CS student): one card per technique plus the geometric
// payoffs. Part A: trig powers, trig substitution and completing the square
// (68-73); Part B: partial fractions, integration by parts, arc length and
// surface area (74-79); Part C: parametric curves and polar coordinates
// (80-84). Session 85 is the Exam 4 review, Session 86 the exam. Sessions 69
// (even powers), 70 (circle-tab preview of trig substitution), 73
// (completing the square), 77 (wine-glass volume), 81 (the parametrized
// ellipse) and 84 (polar graphs) are folded into neighbouring cards.
//
// Corrections to the notes:
// - Ses73a writes "x² + 4 = (x + 2)² − 4"; it is x² + 4x.
// - Ses79a sets up the area of y = x² revolved about the x-axis as
//   ∫ 2πx √(1 + 4x²) dx; the radius is y = x², so the integrand is
//   2πx²√(1 + 4x²). (The card uses the sphere example instead.)
// - Ses82d calls the off-centre circle's radius "(2a, 0)"; the circle has
//   centre (a, 0) and radius a.
// - Ses68c writes the identity as "sinˣx + cos²x = 1", the integrand as
//   (u² − u⁴x)(−du), and the intermediate result as −u³/3 + u⁶/5 (still under
//   an integral sign); it is −u³/3 + u⁵/5, i.e. −cos³x/3 + cos⁵x/5 + c, as
//   the notes' final line says (checked by differentiation).
import type { Card } from "./types";

const MODULE = "mit1801-techniques";

export const mit1801TechniquesCards: Card[] = [
  // --- Session 68: ∫ sinⁿx cosᵐx, odd exponents (+ Session 69: even exponents) ---
  {
    id: "mit1801-techniques-trig-powers",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "How do you integrate sinⁿx cosᵐx? Do ∫ sin³x cos²x dx (an odd power) and ∫ sin²x cos²x dx (all even powers).",
    back: `**Tools:** $\\sin^2 + \\cos^2 = 1$ and the half-angle formulas
$$\\cos^2\\theta = \\frac{1 + \\cos 2\\theta}{2}, \\qquad \\sin^2\\theta = \\frac{1 - \\cos 2\\theta}{2}.$$

**Easy case: some exponent is odd.**
1. Peel off one factor of the odd-power function.
2. Convert the remaining even power with $\\sin^2 = 1 - \\cos^2$ (or the reverse).
3. Substitute $u$ = the other function.

Example:
$$\\int\\sin^3x\\cos^2x\\,dx = \\int(1 - \\cos^2x)\\cos^2x\\,\\sin x\\,dx \\overset{u = \\cos x}{=} -\\int(u^2 - u^4)\\,du = -\\frac{\\cos^3x}{3} + \\frac{\\cos^5x}{5} + c.$$
Similarly, $\\int\\sin^3x\\,dx = -\\cos x + \\frac{\\cos^3x}{3} + c$. With $m = 1$ it's immediate: $\\int\\sin^nx\\cos x\\,dx = \\frac{\\sin^{n+1}x}{n + 1} + c$.

**Hard case: all exponents even (Session 69).** Use the half-angle formulas to halve the degree, repeating until the problem is easy:
$$\\int\\cos^2x\\,dx = \\int\\frac{1 + \\cos 2x}{2}\\,dx = \\frac x2 + \\frac{\\sin 2x}{4} + c.$$
Note the non-trigonometric $\\frac x2$.

For the next example, use $\\sin x\\cos x = \\frac12\\sin 2x$:
$$\\sin^2x\\cos^2x = \\frac{\\sin^2 2x}{4} = \\frac{1 - \\cos 4x}{8} \\;\\Longrightarrow\\; \\int\\sin^2x\\cos^2x\\,dx = \\frac x8 - \\frac{\\sin 4x}{32} + c.$$

So **every** $\\int\\sin^nx\\cos^mx\\,dx$ is computable. These integrals are the building blocks of Fourier series.`,
    pitfall:
      "Different-looking answers can both be right: ½sin²x and −½cos²x are both antiderivatives of sin x cos x, differing by the constant ½. Check by differentiating, not by comparing forms.",
    related: ["mit1801-techniques-trig-substitution", "mit1801-applications-substitution", "mit1806-eigenvalues-fourier-series"],
  },

  // --- Session 71: Integrals involving secant, cosecant and cotangent ---
  {
    id: "mit1801-techniques-tan-sec-integrals",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive ∫ tan x dx, ∫ sec x dx and ∫ sec⁴x dx.",
    back: `**Facts:** $\\sec^2x = 1 + \\tan^2x$, $(\\tan x)' = \\sec^2x$ and $(\\sec x)' = \\sec x\\tan x$.

**Tangent.** Look for a function whose derivative is also present:
$$\\int\\tan x\\,dx = \\int\\frac{\\sin x}{\\cos x}\\,dx \\overset{u = \\cos x}{=} -\\int\\frac{du}{u} = -\\ln\\lvert\\cos x\\rvert + c.$$

**Secant (a trick, not something you'd be expected to find).** Add the two derivative formulas:
$$(\\sec x + \\tan x)' = \\sec x\\tan x + \\sec^2x = \\sec x\\,(\\sec x + \\tan x).$$
So with $u = \\sec x + \\tan x$ we have $\\sec x = \\frac{u'}{u} = (\\ln u)'$, the logarithmic derivative. Hence
$$\\int\\sec x\\,dx = \\ln\\lvert\\sec x + \\tan x\\rvert + c.$$

**Even powers of secant.** Split off $\\sec^2x$, the derivative of $\\tan x$:
$$\\int\\sec^4x\\,dx = \\int(1 + \\tan^2x)\\sec^2x\\,dx \\overset{u = \\tan x}{=} \\int(1 + u^2)\\,du = \\tan x + \\frac{\\tan^3x}{3} + c.$$

These integrals are what trig substitutions turn into. $\\int\\sec\\theta\\,d\\theta$ appears in the completing-the-square example.`,
    related: ["mit1801-techniques-trig-powers", "mit1801-techniques-trig-substitution", "mit1801-differentiation-logarithmic-differentiation"],
  },

  // --- Session 72: Trig substitution (+ Sessions 70, 73) ---
  {
    id: "mit1801-techniques-trig-substitution",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Which trig substitution handles √(a² − x²), √(a² + x²) and √(x² − a²)? Compute ∫ dx/(x²√(1 + x²)) and ∫ dx/√(x² + 4x), and undo the substitution with a triangle.",
    back: `**Table.** Each substitution turns the square root of a quadratic into a trig function:

| Integrand contains | Substitute | Root becomes |
|---|---|---|
| $\\sqrt{a^2 - x^2}$ | $x = a\\sin\\theta$ | $a\\cos\\theta$ |
| $\\sqrt{a^2 + x^2}$ | $x = a\\tan\\theta$ | $a\\sec\\theta$ |
| $\\sqrt{x^2 - a^2}$ | $x = a\\sec\\theta$ | $a\\tan\\theta$ |

**Circle tab (Session 70).** $y = a\\sin\\theta$ gives
$$\\int\\sqrt{a^2 - y^2}\\,dy = a^2\\int\\cos^2\\theta\\,d\\theta = \\frac{a^2}{2}\\arcsin\\frac ya + \\frac y2\\sqrt{a^2 - y^2} + c.$$
Geometrically, this is a sector plus a triangle.

**Example 1.** $x = \\tan\\theta$, $dx = \\sec^2\\theta\\,d\\theta$, $\\sqrt{1 + x^2} = \\sec\\theta$:
$$\\int\\frac{dx}{x^2\\sqrt{1 + x^2}} = \\int\\frac{\\sec\\theta}{\\tan^2\\theta}\\,d\\theta = \\int\\frac{\\cos\\theta}{\\sin^2\\theta}\\,d\\theta \\overset{u = \\sin\\theta}{=} -\\frac1u + c = -\\csc\\theta + c.$$
**Undo with a triangle:** $\\tan\\theta = \\frac x1$, so the opposite side is $x$, the adjacent side is 1 and the hypotenuse is $\\sqrt{1 + x^2}$. Then $\\csc\\theta = \\frac{\\sqrt{1 + x^2}}{x}$, and the answer is $-\\frac{\\sqrt{1 + x^2}}{x} + c$.

**Example 2: completing the square (Session 73).** $x^2 + 4x = (x + 2)^2 - 4$. Put $u = x + 2$, then $u = 2\\sec\\theta$:
$$\\int\\frac{dx}{\\sqrt{x^2 + 4x}} = \\int\\sec\\theta\\,d\\theta = \\ln\\lvert\\sec\\theta + \\tan\\theta\\rvert + c = \\ln\\left\\lvert\\frac{x + 2}{2} + \\frac{\\sqrt{x^2 + 4x}}{2}\\right\\rvert + c.$$

The hyperbolic substitution $x = a\\sinh u$ is an alternative for $\\sqrt{a^2 + x^2}$, using $\\cosh^2 - \\sinh^2 = 1$.`,
    pitfall:
      "Leaving the answer as −csc(arctan x). That's correct but unfinished: draw the right triangle for θ = arctan x and read off the ratio.",
    related: ["mit1801-techniques-tan-sec-integrals", "mit1801-techniques-trig-powers", "mit1801-differentiation-hyperbolic-functions", "mit1801-techniques-arc-length"],
  },

  // --- Session 74: Integration by partial fractions ---
  {
    id: "mit1801-techniques-partial-fractions",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Integrate (4x − 1)/(x² + x − 2) by partial fractions using the cover-up method, and explain why cover-up works.",
    back: `**The disguise.** $\\int\\left(\\frac{1}{x - 1} + \\frac{3}{x + 2}\\right)dx = \\ln\\lvert x - 1\\rvert + 3\\ln\\lvert x + 2\\rvert + c$ is easy. Adding the fractions gives the same integrand in disguise, $\\frac{4x - 1}{x^2 + x - 2}$. Partial fractions undoes the disguise.

**Method** (when $\\deg P < \\deg Q$):
1. **Factor** $Q$: $(x - 1)(x + 2)$.
2. **Set up:** $\\frac{4x - 1}{(x - 1)(x + 2)} = \\frac{A}{x - 1} + \\frac{B}{x + 2}$.
3. **Cover up.** To get $A$, cover the factor $(x - 1)$ on the left and evaluate the rest at $x = 1$: $A = \\frac{4 - 1}{1 + 2} = 1$. Likewise $B = \\frac{4(-2) - 1}{-2 - 1} = 3$.

**Why it works.** Multiply both sides by $(x - 1)$:
$$\\frac{4x - 1}{x + 2} = A + \\frac{B(x - 1)}{x + 2}.$$
Then let $x \\to 1$. The $B$ term vanishes, leaving $A$. The equation holds for $x \\neq 1$, so we are really taking a **limit**, not multiplying by zero.

**Three factors.** For $\\frac{x^2 + 3x + 8}{(x - 1)(x - 2)(x + 5)}$, cover-up gives
$$A = \\frac{12}{(-1)(6)} = -2, \\qquad B = \\frac{18}{(1)(7)} = \\frac{18}{7}, \\qquad C = \\frac{18}{(-6)(-7)} = \\frac37.$$
There is one term per linear factor.

Cover-up works directly for **distinct linear factors** with $\\deg P < \\deg Q$. For the other cases, see the next card.`,
    related: ["mit1801-techniques-partial-fractions-general", "mit1801-applications-antiderivatives"],
  },

  // --- Session 75: Advanced partial fractions ---
  {
    id: "mit1801-techniques-partial-fractions-general",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do partial fractions handle repeated linear factors, irreducible quadratic factors and improper fractions (deg P ≥ deg Q)?",
    back: `**Repeated factors:** $(x - a)^n$ needs $n$ terms, $\\frac{A_1}{x - a} + \\cdots + \\frac{A_n}{(x - a)^n}$. (This is like place value: $\\frac{15}{16} = \\frac12 + \\frac14 + \\frac18 + \\frac{1}{16}$.)

Example:
$$\\frac{x^2 + 2}{(x - 1)^2(x + 2)} = \\frac{A}{x - 1} + \\frac{B}{(x - 1)^2} + \\frac{C}{x + 2}.$$
- Cover-up gives the **top power** and the other factors: $B = \\frac{3}{3} = 1$ and $C = \\frac{6}{9} = \\frac23$.
- $A$ needs one more equation. Plug in a fresh value such as $x = 0$: $\\frac{2}{2} = -A + 1 + \\frac13$, so $A = \\frac13$.

**Irreducible quadratic factors** get a **linear** numerator:
$$\\frac{x^2}{(x - 1)(x^2 + 1)} = \\frac{A}{x - 1} + \\frac{Bx + C}{x^2 + 1}.$$
- Cover-up gives $A = \\frac12$.
- Clear denominators and match coefficients: from $x^2$, $A + B = 1$, so $B = \\frac12$; from the constant term, $A - C = 0$, so $C = \\frac12$.
- Integrate: $\\frac{x}{x^2 + 1}$ gives a $\\ln$, and $\\frac{1}{x^2 + 1}$ gives an $\\arctan$.

**Improper fractions** ($\\deg P \\ge \\deg Q$): first do **long division** to get $P/Q = $ polynomial $+ \\frac{R}{Q}$ with $\\deg R < \\deg Q$. A shortcut: $\\frac{x^2}{1 + x^2} = 1 - \\frac{1}{1 + x^2}$.

**Always works, can be long.** A denominator of degree 12 means 12 unknowns and 12 linear equations, which is machine work. The result is always a combination of polynomials, logs and arctangents, possibly after completing the square and a trig substitution. That's why computer algebra systems can integrate every rational function.`,
    pitfall:
      "Skipping the factorisation step. With (x − 1)(x³ + 1) in the denominator you must first factor x³ + 1 = (x + 1)(x² − x + 1), or the set-up is wrong.",
    related: ["mit1801-techniques-partial-fractions", "mit1801-techniques-trig-substitution"],
  },

  // --- Session 76: Integration by parts (+ Session 77: wine glass) ---
  {
    id: "mit1801-techniques-integration-by-parts",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Derive integration by parts. Use it for ∫ ln x dx, derive reduction formulas for ∫ (ln x)ⁿ dx and ∫ xⁿeˣ dx, and find the volume of the eˣ wine glass both ways.",
    back: `**Derivation.** Integrate the product rule $(uv)' = u'v + uv'$ and rearrange:
$$\\int uv'\\,dx = uv - \\int u'v\\,dx, \\qquad \\int_a^b uv'\\,dx = uv\\Big|_a^b - \\int_a^b u'v\\,dx.$$
Choose $u$ to get **simpler when differentiated**, and $v'$ **not to get worse when integrated**.

**$\\int\\ln x\\,dx$:** with $u = \\ln x$ and $v = x$,
$$\\int\\ln x\\,dx = x\\ln x - \\int x\\cdot\\frac1x\\,dx = x\\ln x - x + c.$$

**Reduction formulas.** Let $F_n = \\int(\\ln x)^n dx$ and $G_n = \\int x^ne^x\\,dx$. With $u = (\\ln x)^n$ and $u = x^n$ respectively:
$$F_n = x(\\ln x)^n - nF_{n-1}, \\qquad G_n = x^ne^x - nG_{n-1}.$$
So $F_2 = x(\\ln x)^2 - 2x\\ln x + 2x + c$ and $G_1 = xe^x - e^x + c$. Each step lowers $n$ until $F_0 = x$ or $G_0 = e^x$.

**Wine glass (Session 77).** Revolve $y = e^x$, $0 \\le x \\le 1$, about the $y$-axis, with the bowl filled up to $y = e$.
- **Disks** (radius $x = \\ln y$): $V = \\int_1^e\\pi(\\ln y)^2dy = \\pi F_2\\Big|_1^e = \\pi(e - 2)$.
- **Shells:** $V = \\int_0^1 2\\pi x(e - e^x)\\,dx = \\pi e - 2\\pi G_1\\Big|_0^1 = \\pi(e - 2)$. ✓

**Review example (Session 85).** $\\int x\\arctan x\\,dx = \\frac{x^2}{2}\\arctan x - \\frac12\\int\\frac{x^2}{1 + x^2}\\,dx = \\frac{x^2 + 1}{2}\\arctan x - \\frac x2 + c$.`,
    pitfall:
      "Choosing u = eˣ in ∫ xⁿeˣ dx. Its derivative is no simpler, so the new integral is no easier. Differentiate the factor that simplifies.",
    related: ["mit1801-differentiation-product-rule", "mit1801-integration-volumes", "mit1801-techniques-partial-fractions-general"],
  },

  // --- Session 78: Computing the length of a curve ---
  {
    id: "mit1801-techniques-arc-length",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Derive the arc-length formula ds = √(1 + (y′)²) dx. Show that it makes radians into arc length on the unit circle, and set up the length of y = x².",
    back: `**Derivation.** Approximate the curve by chords: $\\Delta s \\approx \\sqrt{(\\Delta x)^2 + (\\Delta y)^2}$. In the limit,
$$ds^2 = dx^2 + dy^2 \\quad\\Longrightarrow\\quad ds = \\sqrt{1 + \\left(\\tfrac{dy}{dx}\\right)^2}\\,dx, \\qquad L = \\int_a^b\\sqrt{1 + f'(x)^2}\\,dx.$$
Here $ds^2$ means $(ds)^2$, the square of a differential, not the differential of a square. Likewise $f'(x)^2 \\neq f''(x)$.

**Sanity check.** For $y = mx$ on $[0, 10]$: $L = \\int_0^{10}\\sqrt{1 + m^2}\\,dx = 10\\sqrt{1 + m^2}$, which is Pythagoras.

**Circular arc.** $y = \\sqrt{1 - x^2}$ has $1 + y'^2 = \\frac{1}{1 - x^2}$, so the length of the arc over $0 \\le x \\le a$ is
$$\\alpha = \\int_0^a\\frac{dx}{\\sqrt{1 - x^2}} = \\arcsin a.$$
That is, $\\sin\\alpha = a$: **the radian measure of an angle is the arc length it cuts off on the unit circle**. This is the first time the course derives that, rather than assuming it. It gives a rigorous route to defining $\\arcsin$, then $\\sin$, the way $\\ln$ was defined by an integral.

**Parabola.** $y = x^2$ gives $L = \\int_0^a\\sqrt{1 + 4x^2}\\,dx$. A trig substitution ($2x = \\tan u$) gives
$$L = \\frac a2\\sqrt{1 + 4a^2} + \\frac14\\ln\\left(2a + \\sqrt{1 + 4a^2}\\right).$$
Setting up the integral is the main skill; techniques of integration exist to finish it.`,
    related: ["mit1801-techniques-surface-area", "mit1801-techniques-parametric-curves", "mit1801-integration-ln-as-integral", "mit1801-differentiation-trig-limits"],
  },

  // --- Session 79: Surface area ---
  {
    id: "mit1801-techniques-surface-area",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Give the surface-area element for a surface of revolution, and show the area of the zone of a sphere between x₁ and x₂ is 2πa(x₂ − x₁).",
    back: `**Element.** A short arc of length $ds$ at height $y$, revolved about the $x$-axis, sweeps out a thin band:
$$dA = 2\\pi y\\,ds = 2\\pi y\\sqrt{1 + (y')^2}\\,dx.$$
Use $ds$, not $dx$. A tilted segment sweeps out **more** area than its horizontal shadow.

**Sphere of radius $a$.** Take $y = \\sqrt{a^2 - x^2}$, so $y' = \\frac{-x}{\\sqrt{a^2 - x^2}}$ and $ds = \\frac{a}{\\sqrt{a^2 - x^2}}\\,dx$. Then
$$dA = 2\\pi\\sqrt{a^2 - x^2}\\cdot\\frac{a\\,dx}{\\sqrt{a^2 - x^2}} = 2\\pi a\\,dx, \\qquad A = \\int_{x_1}^{x_2}2\\pi a\\,dx = 2\\pi a(x_2 - x_1).$$
- **Hemisphere** ($0$ to $a$): $2\\pi a^2$.
- **Whole sphere** ($-a$ to $a$): $4\\pi a^2$.

**Archimedes' surprise:** equally thick slices of a sphere have **equal** surface area, wherever they are cut.

**Not shells.** Shells have thickness and compute volumes. Surface area adds up thin **bands** of width $ds$.`,
    pitfall:
      "Using the distance along the axis instead of the radius. Revolving y = f(x) about the x-axis, the band's radius is y, so the factor is 2πy, not 2πx.",
    related: ["mit1801-techniques-arc-length", "mit1801-integration-volumes"],
  },

  // --- Session 80: Parametric curves (+ Session 81) ---
  {
    id: "mit1801-techniques-parametric-curves",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a parametric curve? Give the parametric arc-length formula and the speed, and apply it to (a cos t, a sin t) and to the ellipse (2 sin t, cos t).",
    back: `**Parametric curve:** $x = x(t)$, $y = y(t)$. Think of a trajectory, with $t$ as time; draw arrows for the direction of motion. Here $y$ is no longer a function of $x$.

**Arc length.** Dividing $\\Delta s^2 \\approx \\Delta x^2 + \\Delta y^2$ by $\\Delta t^2$ and taking the limit gives the **speed**:
$$\\frac{ds}{dt} = \\sqrt{\\left(\\frac{dx}{dt}\\right)^2 + \\left(\\frac{dy}{dt}\\right)^2}, \\qquad L = \\int_{t_1}^{t_2}\\frac{ds}{dt}\\,dt.$$

**Circle.** $(a\\cos t, a\\sin t)$ satisfies $x^2 + y^2 = a^2$, starting at $(a, 0)$ and moving **counterclockwise**. Its speed is
$$\\sqrt{a^2\\sin^2t + a^2\\cos^2t} = a,$$
so the motion is **uniform**. More generally, $(a\\cos kt, a\\sin kt)$ has speed $ak$.

**Ellipse (Session 81).** $(2\\sin t, \\cos t)$ satisfies $\\frac{x^2}{4} + y^2 = 1$. It starts at $(0, 1)$ and moves **clockwise**. The speed $\\sqrt{4\\cos^2t + \\sin^2t}$ is non-constant, and the perimeter
$$\\int_0^{2\\pi}\\sqrt{4\\cos^2t + \\sin^2t}\\,dt$$
has **no elementary antiderivative** (an elliptic integral). "We have to stop here; this is our final answer."

**Revolving it** about the $y$-axis, the right half ($0 \\le t \\le \\pi$, radius $x = 2\\sin t$) gives
$$A = \\int_0^\\pi 2\\pi(2\\sin t)\\sqrt{4\\cos^2t + \\sin^2t}\\,dt.$$
This one *is* doable via $u = \\cos t$. Use only the right half, or you count the surface twice.`,
    pitfall:
      "Writing (dx/dt)² as d²x/dt². The latter is the second derivative x″(t), a different thing.",
    related: ["mit1801-techniques-arc-length", "mit1801-techniques-polar-coordinates"],
  },

  // --- Session 82: Polar coordinates ---
  {
    id: "mit1801-techniques-polar-coordinates",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define polar coordinates and their ambiguities. Convert y = 1 and the circle through the origin with centre (a, 0) to polar form.",
    back: `**Definition** (the only unambiguous one):
$$x = r\\cos\\theta, \\qquad y = r\\sin\\theta.$$
Going the other way, $r = \\sqrt{x^2 + y^2}$ and $\\theta = \\tan^{-1}\\frac yx$, **up to quadrant**: check against a picture.

"$r$ is the distance to the origin" is a useful lie, because $r$ may be negative. For example, $(1, -1)$ is $(\\sqrt2, -\\frac\\pi4)$ or $(\\sqrt2, \\frac{7\\pi}{4})$ or $(-\\sqrt2, \\frac{3\\pi}{4})$. Typical conventions are $r \\ge 0$ and $\\theta \\in (-\\pi, \\pi]$ or $[0, 2\\pi)$.

**Coordinate curves.** $r = a$ is a circle. $\\theta = c$ is a ray, or a whole line if $r$ may be negative.

**$y = 1$:** $r\\sin\\theta = 1$, so $r = \\frac{1}{\\sin\\theta}$ for $0 < \\theta < \\pi$. As $\\theta \\to 0^+$ or $\\pi^-$, $r \\to \\infty$ (the ends of the line). The minimum $r = 1$ is at $\\theta = \\frac\\pi2$.

**Off-centre circle** $(x - a)^2 + y^2 = a^2$. Expand: $x^2 + y^2 = 2ax$, i.e. $r^2 = 2ar\\cos\\theta$. So
$$r = 2a\\cos\\theta, \\qquad -\\tfrac\\pi2 \\le \\theta \\le \\tfrac\\pi2.$$
Check: $\\theta = 0$ gives $(2a, 0)$, and $\\theta = \\frac\\pi4$ gives $r = a\\sqrt2$, i.e. $(a, a)$. ✓ This circle is essential in multivariable calculus.

**Session 84.** Letting $\\theta$ run over $[0, 2\\pi]$ traverses the circle **twice**: on $(\\frac\\pi2, \\pi)$ $r < 0$, and the point lands in the 4th quadrant. In the same way, $r = \\sin 2\\theta$ is a four-leaf rose whose petals appear opposite the angle whenever $r < 0$.`,
    related: ["mit1801-techniques-polar-area", "mit1801-techniques-parametric-curves"],
  },

  // --- Session 83: Polar coordinates continued ---
  {
    id: "mit1801-techniques-polar-area",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive the polar area element dA = ½r² dθ, and compute the area inside r = 2a cos θ and one petal of r = sin 2θ.",
    back: `**Element.** A thin pie slice of radius $r$ and angle $d\\theta$ is the fraction $\\frac{r\\,d\\theta}{2\\pi r}$ of a disk of area $\\pi r^2$. So
$$dA = \\frac12r^2\\,d\\theta, \\qquad A = \\int_{\\theta_1}^{\\theta_2}\\frac12r(\\theta)^2\\,d\\theta.$$
This is the polar version of a Riemann sum, with sectors in place of rectangles.

**Off-centre circle** $r = 2a\\cos\\theta$, $-\\frac\\pi2 \\le \\theta \\le \\frac\\pi2$. Using the half-angle formula:
$$A = \\int_{-\\pi/2}^{\\pi/2}\\frac12(2a\\cos\\theta)^2\\,d\\theta = a^2\\int_{-\\pi/2}^{\\pi/2}(1 + \\cos 2\\theta)\\,d\\theta = a^2\\left[\\theta + \\frac{\\sin 2\\theta}{2}\\right]_{-\\pi/2}^{\\pi/2} = \\pi a^2. ✓$$

**One petal of $r = \\sin 2\\theta$** ($0 \\le \\theta \\le \\frac\\pi2$, where $r \\ge 0$):
$$A = \\int_0^{\\pi/2}\\frac12\\sin^2 2\\theta\\,d\\theta = \\frac\\pi8.$$

**Limits matter.** Choose them so $r \\ge 0$ and each region is traced **once**. Integrating $r = 2a\\cos\\theta$ over $[0, 2\\pi]$ goes around the circle twice and gives $2\\pi a^2$.`,
    pitfall:
      "Wrong θ-limits that trace a region twice (doubling the area), or that mix a positive-r loop with a negative-r one.",
    related: ["mit1801-techniques-polar-coordinates", "mit1801-techniques-trig-powers", "mit1801-integration-riemann-sums"],
  },
];
