// MIT 18.01SC Single Variable Calculus (Fall 2010, OCW Scholar; lectures by
// David Jerison) — Unit 1: Differentiation (Sessions 1-22). Sourced from the
// course's own per-session lecture notes (MIT18_01SCF10_SesNNx.pdf, the
// written notes that accompany each video clip), read page by page, with
// every derivative and limit recomputed in sympy. The tracker is numbered by
// the course's 101 sessions; Session 21 is the Exam 1 review and Session 22
// the exam. Sessions 3 (rate of change) and 6 (sum and constant-multiple
// rules) are folded into the Session 1 and Session 9 cards.
//
// Additions beyond the notes (which argue limits informally, by pictures):
// - the ε–δ definition of a limit (the notes only describe limits in words);
// - the squeeze-theorem proof that sin θ/θ → 1 via sin θ ≤ θ ≤ tan θ, and
//   the algebraic reduction of (1 − cos θ)/θ to it (the notes give the
//   unit-circle picture only);
// - a rigorous chain-rule proof (the notes' Δy/Δx · Δx/Δt argument breaks
//   down when Δx = 0 for small Δt; the card says so and patches it);
// - |x| as the standard continuous-but-not-differentiable example.
// Corrections to the notes:
// - Ses5a writes the jump example's second branch as "x ≥ 0" (it is x ≤ 0,
//   as in Ses4a) and writes "for x > 0, lim f(x) = 1" for the right-hand
//   limit as x → 0⁺.
// - Ses17a says the secant of y = 4ˣ with slope 1 runs from (−1/2, 1/2) to
//   (1, 0); it runs from (−1/2, 1/2) to (0, 1).
// - Ses8d says "the arc length Δθ is approximately equal to the length |PR|
//   of the hypotenuse"; the hypotenuse is PQ.
import type { Card } from "./types";

const MODULE = "mit1801-differentiation";

export const mit1801DifferentiationCards: Card[] = [
  // --- Session 1: Introduction to derivatives (+ Session 3: rate of change) ---
  {
    id: "mit1801-differentiation-derivative-definition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the derivative f′(x₀) as a limit. What is a tangent line, and what does the derivative mean geometrically and physically?",
    back: `**Geometric definition.** The derivative $f'(x_0)$ is the slope of the **tangent line** to $y = f(x)$ at $P = (x_0, f(x_0))$. A tangent line is **not** "a line meeting the graph at one point". It is the **limit of secant lines** $PQ$ as $Q \\to P$ along the graph.

With $Q = (x_0 + \\Delta x, f(x_0 + \\Delta x))$, the secant slope is the **difference quotient** $\\frac{\\Delta f}{\\Delta x}$, so
$$f'(x_0) = \\lim_{\\Delta x \\to 0} \\frac{\\Delta f}{\\Delta x} = \\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}.$$
The tangent line is then $y - y_0 = f'(x_0)(x - x_0)$. The course calls this "by far the most important formula" of Lecture 1.

**Notation.** Newton: $f'(x_0)$. Leibniz: $\\frac{dy}{dx}$, $\\frac{df}{dx}$, $\\frac{d}{dx}f$. Also $Df$. Leibniz notation hides *where* the derivative is evaluated.

**Rate of change (Session 3).** $\\frac{\\Delta y}{\\Delta x}$ is the **average** rate of change over an interval; its limit $\\frac{dy}{dx}$ is the **instantaneous** rate. Examples: position → velocity, charge $q$ → current $\\frac{dq}{dt}$, temperature in space → gradient $\\frac{dT}{dx}$, and measurement sensitivity $\\Delta L \\approx \\frac{dL}{dh}\\Delta h$.

*Pumpkin drop:* $h(t) = 80 - 5t^2$ m hits the ground at $t = 4$. Average velocity $\\frac{0 - 80}{4 - 0} = -20$ m/s, but the impact velocity is $h'(4) = -10 \\cdot 4 = -40$ m/s.`,
    pitfall:
      "Plugging Δx = 0 straight into the difference quotient always gives 0/0. You must simplify and cancel the Δx first, then take the limit.",
    related: ["mit1801-differentiation-derivatives-from-definition", "mit1801-differentiation-limits-continuity"],
  },

  // --- Session 2: Examples of derivatives ---
  {
    id: "mit1801-differentiation-derivatives-from-definition",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "From the definition, prove d/dx (1/x) = −1/x² and d/dx xⁿ = nxⁿ⁻¹ for n = 1, 2, 3, … Then show every tangent to y = 1/x cuts off a triangle of area 2.",
    back: `**$f(x) = \\frac1x$.** Combine over a common denominator, then cancel $\\Delta x$:
$$\\frac{\\Delta f}{\\Delta x} = \\frac{1}{\\Delta x}\\left(\\frac{1}{x_0 + \\Delta x} - \\frac{1}{x_0}\\right) = \\frac{1}{\\Delta x}\\cdot\\frac{x_0 - (x_0 + \\Delta x)}{x_0(x_0 + \\Delta x)} = \\frac{-1}{x_0(x_0 + \\Delta x)} \\xrightarrow{\\Delta x \\to 0} -\\frac{1}{x_0^2}.$$
Sanity check: the slope is always negative, and it tends to 0 as $x_0 \\to \\infty$.

**Power rule, $n \\in \\mathbb{N}$.** Expanding $(x + \\Delta x)^n$, the terms are $x^n$, then $n$ ways to pick one $\\Delta x$, giving $nx^{n-1}\\Delta x$, then terms with at least two factors of $\\Delta x$:
$$(x + \\Delta x)^n = x^n + nx^{n-1}\\Delta x + O\\big((\\Delta x)^2\\big).$$
So $\\frac{\\Delta y}{\\Delta x} = nx^{n-1} + O(\\Delta x) \\to nx^{n-1}$. For example, $\\frac{d}{dx}(x^2 + 3x^{10}) = 2x + 30x^9$.

**The triangle.** The tangent at $(x_0, \\frac{1}{x_0})$ is $y - \\frac{1}{x_0} = -\\frac{1}{x_0^2}(x - x_0)$.
- Setting $y = 0$ gives the $x$-intercept $2x_0$.
- By the $x \\leftrightarrow y$ symmetry of $xy = 1$, the $y$-intercept is $2y_0 = \\frac{2}{x_0}$.
- So the area is $\\frac12(2x_0)\\left(\\frac{2}{x_0}\\right) = 2$, whatever the point of tangency.

The calculus is the easy part. The algebra and geometry around it are what make a "calculus problem" hard.`,
    related: ["mit1801-differentiation-derivative-definition", "mit1801-differentiation-quotient-rule", "mit1801-differentiation-rational-exponents"],
  },

  // --- Session 4: Limits and continuity ---
  {
    id: "mit1801-differentiation-limits-continuity",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the difference between an easy and a hard limit? Define one-sided limits, the ε–δ limit, and continuity at x₀.",
    back: `**Easy vs hard limits.** In $\\lim_{x \\to 3}\\frac{x^2 + x}{x + 1} = \\frac{12}{4} = 3$ you can just plug in. A derivative is *never* an easy limit, because $\\Delta x = 0$ is forbidden. Limits involving division by zero or $\\infty$ are the hard ones, such as $\\lim_{x\\to -1}\\frac{x^2 + x}{x + 1}$ or $\\lim_{x \\to\\infty}\\frac{x^2+x}{x+1}$.

**Key convention.** $\\lim_{x\\to x_0} f(x)$ never uses the value $f(x_0)$. Here $x \\neq x_0$ throughout.

**One-sided limits.** $\\lim_{x \\to x_0^+}$ uses only $x > x_0$, and $\\lim_{x \\to x_0^-}$ uses only $x < x_0$. Take $f(x) = x + 1$ for $x > 0$ and $f(x) = -x$ for $x \\le 0$. Then $\\lim_{0^+} f = 1$ and $\\lim_{0^-} f = 0$, whatever $f(0)$ is.

**ε–δ definition** (the rigorous version of "close to"). $\\lim_{x \\to x_0} f(x) = L$ means
$$\\forall \\varepsilon > 0\\ \\exists \\delta > 0:\\quad 0 < \\lvert x - x_0 \\rvert < \\delta \\implies \\lvert f(x) - L \\rvert < \\varepsilon.$$
The two-sided limit exists iff both one-sided limits exist and are equal.

**Continuity.** $f$ is continuous at $x_0$ iff $\\lim_{x\\to x_0} f(x) = f(x_0)$. That packs in three conditions:
1. both one-sided limits exist and agree;
2. $f(x_0)$ is defined;
3. the limit equals $f(x_0)$.

So the "easy" limits are exactly the limits of continuous functions.`,
    pitfall:
      "Saying lim f(x) = f(x₀) is a definition of continuity, not a way to compute every limit. At a removable discontinuity the limit exists but differs from f(x₀), or f(x₀) isn't defined at all.",
    related: ["mit1801-differentiation-discontinuities", "mit1801-differentiation-differentiable-implies-continuous", "mit6120-analysis-asymptotic-definitions"],
  },

  // --- Session 5: Discontinuity ---
  {
    id: "mit1801-differentiation-discontinuities",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Classify discontinuities: jump, removable, infinite and \"ugly\". Give an example of each.",
    back: `| Type | One-sided limits | Example at $x = 0$ |
|---|---|---|
| **Jump** | both exist, **not equal** | $x + 1$ for $x > 0$, $-x$ for $x \\le 0$: limits $1$ and $0$ |
| **Removable** | both exist and are **equal**, but $f(x_0)$ is undefined or different | $\\frac{\\sin x}{x} \\to 1$, $\\frac{1 - \\cos x}{x} \\to 0$ |
| **Infinite** | at least one is $\\pm\\infty$ | $\\frac1x$: $+\\infty$ from the right, $-\\infty$ from the left |
| **Ugly (oscillating)** | neither exists | $\\sin\\frac1x$ |

**Remarks from the notes:**
- The jump example is **continuous from the left** at 0 (since $f(0) = 0$), but not from the right.
- "The limit is $\\infty$" is different from "the limit doesn't exist": $\\frac1x$ heads off in a definite direction from each side. But $\\lim_{x \\to 0}\\frac1x$ does not exist, because $+\\infty \\neq -\\infty$.
- The derivative $-\\frac{1}{x^2}$ of $\\frac1x$ is always negative and looks nothing like $\\frac1x$. Differentiation swaps parity: the derivative of an **odd** function is **even**, and vice versa. That gives a quick check on your work.`,
    related: ["mit1801-differentiation-limits-continuity", "mit1801-differentiation-trig-limits"],
  },
  {
    id: "mit1801-differentiation-differentiable-implies-continuous",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that if f is differentiable at x₀ then f is continuous at x₀. Is the converse true?",
    back: `**Goal.** Show $\\lim_{x \\to x_0}\\big(f(x) - f(x_0)\\big) = 0$, which is exactly continuity at $x_0$.

**Proof.** For $x \\neq x_0$, multiply and divide by $x - x_0$:
$$\\lim_{x\\to x_0}\\big(f(x) - f(x_0)\\big) = \\lim_{x\\to x_0}\\frac{f(x) - f(x_0)}{x - x_0}\\cdot(x - x_0) = f'(x_0)\\cdot 0 = 0. \\;\\blacksquare$$

**Why it isn't dividing by zero:** inside the limit $x \\neq x_0$ always, so $x - x_0$ is small but never zero. That is exactly what limits are for. The product of limits splits because both factors' limits exist, and the first one exists **by the differentiability hypothesis**.

**Why it matters.** The product and quotient rule proofs both need $\\lim_{\\Delta x \\to 0} u(x + \\Delta x) = u(x)$, and this theorem provides it.

**Converse is false.** $f(x) = \\lvert x\\rvert$ is continuous at 0, but the difference quotient $\\frac{\\lvert \\Delta x\\rvert}{\\Delta x}$ is $+1$ from the right and $-1$ from the left, so $f'(0)$ doesn't exist.`,
    related: ["mit1801-differentiation-limits-continuity", "mit1801-differentiation-product-rule", "mit1801-differentiation-quotient-rule"],
  },

  // --- Session 7: Derivatives of sine and cosine ---
  {
    id: "mit1801-differentiation-sin-cos-derivatives",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove d/dx sin x = cos x and d/dx cos x = −sin x from the definition, given the two limits at 0.",
    back: `Assume (proved in Session 8) that
$$\\text{(A)}\\ \\lim_{h \\to 0}\\frac{\\cos h - 1}{h} = 0, \\qquad \\text{(B)}\\ \\lim_{h \\to 0}\\frac{\\sin h}{h} = 1.$$

**Sine.** Use $\\sin(a + b) = \\sin a\\cos b + \\cos a\\sin b$ to separate $x$ from $\\Delta x$:
$$\\frac{\\sin(x + \\Delta x) - \\sin x}{\\Delta x} = \\sin x\\cdot\\frac{\\cos\\Delta x - 1}{\\Delta x} + \\cos x\\cdot\\frac{\\sin\\Delta x}{\\Delta x} \\to \\sin x\\cdot 0 + \\cos x\\cdot 1 = \\cos x.$$

**Cosine.** Use $\\cos(a + b) = \\cos a\\cos b - \\sin a\\sin b$:
$$\\frac{\\cos(x + \\Delta x) - \\cos x}{\\Delta x} = \\cos x\\cdot\\frac{\\cos\\Delta x - 1}{\\Delta x} - \\sin x\\cdot\\frac{\\sin\\Delta x}{\\Delta x} \\to -\\sin x.$$

(A) and (B) are themselves derivatives at 0: (B) is $\\sin'(0)$ and (A) is $\\cos'(0)$. So you only need the slope **at one point** to get the slope everywhere. The same pattern returns for $a^x$, where everything hinges on $M(a) = \\frac{d}{dx}a^x\\big|_{x=0}$.

**Geometric version (Session 8).** On the unit circle, moving the angle from $\\theta$ to $\\theta + \\Delta\\theta$ moves the point along an arc of length $\\Delta\\theta$. That arc is nearly a straight segment making angle $\\theta$ with the vertical, so $\\Delta(\\sin\\theta) \\approx \\Delta\\theta\\cos\\theta$.

**From these:** $(\\tan x)' = \\sec^2 x$ by the quotient rule, and $(\\sec x)' = -(\\cos x)^{-2}(-\\sin x) = \\sec x\\tan x$.`,
    pitfall:
      "These formulas need radians. In degrees, sin x/x → π/180, not 1, and every trig derivative picks up that factor.",
    related: ["mit1801-differentiation-trig-limits", "mit1801-differentiation-exponential-m-of-a", "mit1801-differentiation-quotient-rule"],
  },

  // --- Session 8: Limits of sine and cosine ---
  {
    id: "mit1801-differentiation-trig-limits",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that sin θ/θ → 1 and (1 − cos θ)/θ → 0 as θ → 0 (θ in radians).",
    back: `**Picture (the notes' argument).** On the unit circle the arc cut off by angle $\\theta$ has length $\\theta$, because the angle is in radians, and the vertical "bowstring" half has length $\\sin\\theta$. As $\\theta \\to 0$ the arc and the segment become indistinguishable, so $\\frac{\\sin\\theta}{\\theta} \\to 1$. Meanwhile the horizontal "gap" $1 - \\cos\\theta$ shrinks **much faster** than the arc, so $\\frac{1 - \\cos\\theta}{\\theta} \\to 0$.

**Squeeze proof of (B).** Take $0 < \\theta < \\frac{\\pi}{2}$ and compare three areas: the triangle inside the sector, the sector itself, and the triangle with the tangent segment:
$$\\frac{\\sin\\theta}{2} \\le \\frac{\\theta}{2} \\le \\frac{\\tan\\theta}{2} \\quad\\Longrightarrow\\quad \\cos\\theta \\le \\frac{\\sin\\theta}{\\theta} \\le 1.$$
Since $\\cos\\theta \\to 1$, the squeeze theorem gives $\\frac{\\sin\\theta}{\\theta} \\to 1$ from the right. The ratio is even in $\\theta$, so the left-hand limit is the same.

**(A) from (B).** Multiply by the conjugate:
$$\\frac{1 - \\cos\\theta}{\\theta} = \\frac{1 - \\cos^2\\theta}{\\theta(1 + \\cos\\theta)} = \\frac{\\sin\\theta}{\\theta}\\cdot\\frac{\\sin\\theta}{1 + \\cos\\theta} \\to 1\\cdot\\frac{0}{2} = 0.$$

**Sizes:** $\\sin(\\pi/2)/(\\pi/2) = 2/\\pi \\approx 0.64$ and $\\sin(\\pi/4)/(\\pi/4) = 2\\sqrt2/\\pi \\approx 0.90$, creeping up to 1. Comparing a short arc with its chord, as here, is a technique the course reuses many times.`,
    related: ["mit1801-differentiation-sin-cos-derivatives", "mit1801-differentiation-discontinuities"],
  },

  // --- Session 9: Product rule (+ Session 6: sum and constant multiple) ---
  {
    id: "mit1801-differentiation-product-rule",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the sum rule and the product rule (uv)′ = u′v + uv′ from the definition of the derivative.",
    back: `**General vs specific rules.** Specific rules give the derivatives of particular functions ($x^n$, $\\sin x$). General rules combine them: linearity, product, quotient and chain.

**Sum rule (Session 6).** Regroup the difference quotient:
$$\\frac{(u + v)(x + \\Delta x) - (u + v)(x)}{\\Delta x} = \\frac{u(x + \\Delta x) - u(x)}{\\Delta x} + \\frac{v(x + \\Delta x) - v(x)}{\\Delta x} \\to u' + v'.$$
The limit of a sum is the sum of the limits when both exist. $(cu)' = cu'$ is the same argument.

**Product rule.** Add and subtract $u(x + \\Delta x)v(x)$ in the numerator:
$$\\frac{u(x{+}\\Delta x)v(x{+}\\Delta x) - u(x)v(x)}{\\Delta x} = \\frac{u(x{+}\\Delta x) - u(x)}{\\Delta x}\\,v(x) + u(x{+}\\Delta x)\\,\\frac{v(x{+}\\Delta x) - v(x)}{\\Delta x}.$$
As $\\Delta x \\to 0$ the difference quotients tend to $u'$ and $v'$. Also $u(x + \\Delta x) \\to u(x)$, because **differentiable implies continuous**. So
$$(uv)' = u'v + uv'.$$
Mnemonic: change **one factor at a time**. Iterating gives $(uvw)' = u'vw + uv'w + uvw'$.

Example: $\\frac{d}{dx}\\left(x^n\\sin x\\right) = nx^{n-1}\\sin x + x^n\\cos x$.`,
    pitfall:
      "(uv)′ is not u′v′. Test it: (x·x)′ = 2x, while (x)′(x)′ = 1.",
    related: ["mit1801-differentiation-differentiable-implies-continuous", "mit1801-differentiation-quotient-rule", "mit1801-differentiation-chain-rule"],
  },

  // --- Session 10: Quotient rule ---
  {
    id: "mit1801-differentiation-quotient-rule",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the quotient rule (u/v)′ = (u′v − uv′)/v², and use it to extend the power rule to negative integers.",
    back: `**Proof.** Write $\\Delta u = u(x + \\Delta x) - u(x)$ and $\\Delta v = v(x + \\Delta x) - v(x)$. Then
$$\\frac{u + \\Delta u}{v + \\Delta v} - \\frac{u}{v} = \\frac{(u + \\Delta u)v - u(v + \\Delta v)}{(v + \\Delta v)v} = \\frac{(\\Delta u)v - u(\\Delta v)}{(v + \\Delta v)v}.$$
Divide by $\\Delta x$:
$$\\frac{\\Delta(u/v)}{\\Delta x} = \\frac{\\frac{\\Delta u}{\\Delta x}v - u\\frac{\\Delta v}{\\Delta x}}{(v + \\Delta v)v} \\longrightarrow \\frac{u'v - uv'}{v^2},$$
using $\\Delta v \\to 0$ ($v$ is differentiable, hence continuous) and $v \\neq 0$.

**Reciprocals.** With $u = 1$: $\\left(\\frac1v\\right)' = \\frac{-v'}{v^2}$.

**Negative powers.** With $v = x^n$:
$$\\frac{d}{dx}x^{-n} = -(x^n)^{-2}\\cdot nx^{n-1} = -nx^{-n-1}.$$
This is $ax^{a-1}$ with $a = -n$, so the power rule holds for all integers.

**Via the chain rule (Session 21 review).** $(u/v)' = (uv^{-1})' = u'v^{-1} - uv^{-2}v'$. This explains the minus sign, and is a way to avoid memorizing the formula.`,
    related: ["mit1801-differentiation-product-rule", "mit1801-differentiation-derivatives-from-definition", "mit1801-differentiation-rational-exponents"],
  },

  // --- Session 11: Chain rule ---
  {
    id: "mit1801-differentiation-chain-rule",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the chain rule for f(g(x)), give the intuition for why rates multiply, and give a proof that survives Δg = 0.",
    back: `**Statement.** If $g$ is differentiable at $x$ and $f$ at $g(x)$, then
$$\\frac{d}{dx}f(g(x)) = f'(g(x))\\,g'(x), \\qquad\\text{or}\\qquad \\frac{dy}{dt} = \\frac{dy}{dx}\\frac{dx}{dt}.$$
Example: $\\frac{d}{dt}\\sin^{10}t = 10\\sin^9 t\\cos t$ (outside $x^{10}$, inside $\\sin t$). Another: $\\frac{d}{dt}\\sin(10t) = 10\\cos(10t)$.

**Why rates multiply (the notes).** If $y = 10x + b$ and $x = 5t + a$, then $y = 50t + 10a + b$. $y$ moves 10 times as fast as $x$, and $x$ moves 5 times as fast as $t$, so $y$ moves $50 = 10\\cdot 5$ times as fast as $t$.

**The heuristic and its gap.** The notes write $\\frac{\\Delta y}{\\Delta t} = \\frac{\\Delta y}{\\Delta x}\\cdot\\frac{\\Delta x}{\\Delta t}$ and let $\\Delta t \\to 0$, so that $\\Delta x \\to 0$ by continuity. But $\\Delta x$ may be **zero** for arbitrarily small $\\Delta t$ (e.g. $g$ constant near $x$, or $x^2\\sin\\frac1x$), and then you can't divide by it.

**Rigorous proof.** Let $y_0 = g(x)$ and define
$$\\varphi(k) = \\frac{f(y_0 + k) - f(y_0)}{k}\\ (k \\neq 0), \\qquad \\varphi(0) = f'(y_0).$$
Then $\\varphi$ is continuous at 0, and $f(y_0 + k) - f(y_0) = \\varphi(k)\\,k$ holds for **all** $k$, including $k = 0$. Put $k = \\Delta g = g(x + h) - g(x)$:
$$\\frac{f(g(x + h)) - f(g(x))}{h} = \\varphi(\\Delta g)\\cdot\\frac{\\Delta g}{h} \\to f'(g(x))\\cdot g'(x),$$
since $\\Delta g \\to 0$ and $\\varphi$ is continuous at 0. $\\blacksquare$`,
    pitfall:
      "Forgetting to substitute back. After d/dt sin¹⁰ t = 10x⁹ cos t, you must write x = sin t. Only you know what the helper variable x stands for.",
    related: ["mit1801-differentiation-product-rule", "mit1801-differentiation-implicit-differentiation", "mit1801-differentiation-inverse-functions"],
  },

  // --- Session 12: Higher derivatives ---
  {
    id: "mit1801-differentiation-higher-derivatives",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "What are higher derivatives and their notations? Prove Dⁿxⁿ = n! and find Dⁿ⁺¹xⁿ.",
    back: `**Higher derivatives** are derivatives of derivatives: $u'' = (u')'$, $u''' = u^{(3)}$, …

| Newton | Operator | Leibniz |
|---|---|---|
| $f'$ | $Df$ | $\\frac{df}{dx}$ |
| $f''$ | $D^2 f$ | $\\frac{d^2 f}{dx^2} = \\left(\\frac{d}{dx}\\right)^2 f$ |
| $f^{(n)}$ | $D^n f$ | $\\frac{d^n f}{dx^n}$ |

$D$ and $\\frac{d}{dx}$ are **operators**: they take a function to a function. $\\sin x$ is special because it cycles back after four derivatives: $\\sin \\to \\cos \\to -\\sin \\to -\\cos \\to \\sin$.

**Claim.** $D^n x^n = n!$ for $n = 1, 2, 3, \\ldots$

**Proof (induction on $n$).** Strengthen the claim to $D^k x^n = n(n-1)\\cdots(n-k+1)\\,x^{n-k}$ for $0 \\le k \\le n$.
- **Base case** $k = 0$: trivial.
- **Step:** differentiate $x^{n-k}$ by the power rule. This multiplies by the current exponent $n - k$ and lowers it by one.

At $k = n$ the exponent is 0, giving $n(n-1)\\cdots 1 = n!$, a constant. $\\blacksquare$

**Hence** $D^{n+1}x^n = 0$, the derivative of a constant. More generally, any polynomial of degree $n$ is killed by $D^{n+1}$. This fact powers Taylor's formula later in the course.`,
    related: ["mit1801-differentiation-derivatives-from-definition", "mit6120-proofs-induction-axiom-sum"],
  },

  // --- Session 13: Implicit differentiation (rational exponents) ---
  {
    id: "mit1801-differentiation-rational-exponents",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Use implicit differentiation to prove d/dx xᵃ = axᵃ⁻¹ for every rational a = m/n.",
    back: `So far the power rule is proved for integer exponents (binomial theorem, then the quotient rule). The difference quotient of $x^{m/n}$ is hopeless to simplify directly, so the notes use a new idea instead.

**Proof.** Let $y = x^{m/n}$ ($x > 0$; $m, n$ integers, $n \\neq 0$). Raise both sides to the $n$th power to get rid of the root:
$$y^n = x^m.$$
Apply $\\frac{d}{dx}$ to both sides. The left side is a function of $y$, which is a function of $x$, so use the chain rule:
$$ny^{n-1}\\frac{dy}{dx} = mx^{m-1} \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = \\frac{m}{n}\\cdot\\frac{x^{m-1}}{y^{n-1}}.$$
**Only now** substitute $y = x^{m/n}$. (Doing it earlier would require already knowing the derivative of $x^{m/n}$.)
$$\\frac{dy}{dx} = \\frac{m}{n}\\,x^{(m-1) - \\frac{m(n-1)}{n}} = \\frac{m}{n}\\,x^{\\frac{nm - n - nm + m}{n}} = \\frac{m}{n}\\,x^{\\frac mn - 1}. \\;\\blacksquare$$

The proof assumes $y = x^{m/n}$ is differentiable, which follows from the inverse-function rule. Once $\\frac{d}{dx}a^x$ is known (Session 17), $x^a = e^{a\\ln x}$ extends the rule to **real** $a$.`,
    related: ["mit1801-differentiation-implicit-differentiation", "mit1801-differentiation-chain-rule", "mit1801-differentiation-inverse-functions"],
  },

  // --- Session 14: Examples of implicit differentiation ---
  {
    id: "mit1801-differentiation-implicit-differentiation",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find dy/dx on the circle x² + y² = 1 both explicitly and implicitly, and find dy/dx if y⁴ + xy² − 2 = 0.",
    back: `**Explicitly (top half only).** $y = (1 - x^2)^{1/2}$, so by the chain rule
$$y' = \\tfrac12(1 - x^2)^{-1/2}(-2x) = \\frac{-x}{\\sqrt{1 - x^2}} = -\\frac{x}{y}.$$

**Implicitly (the whole circle at once).** Apply $\\frac{d}{dx}$ to both sides, treating $y$ as a function of $x$:
$$2x + 2y\\,y' = 0 \\quad\\Longrightarrow\\quad y' = -\\frac{x}{y}.$$
No square roots and no choice of branch. (The formula fails only where $y = 0$, where the tangent is vertical.)

**A harder curve.** $y^4 + xy^2 - 2 = 0$. Solving explicitly gives $y = \\pm\\sqrt{\\frac{-x \\pm\\sqrt{x^2 + 8}}{2}}$, which has four branches. Implicitly, using the product rule on $xy^2$:
$$4y^3y' + \\left(y^2 + x\\cdot 2y\\,y'\\right) = 0 \\quad\\Longrightarrow\\quad y' = \\frac{-y^2}{4y^3 + 2xy} = \\frac{-y}{4y^2 + 2x}\\ (y \\neq 0).$$

**Recipe.**
1. Differentiate every term with respect to $x$, using the chain rule on each $y$-term (it picks up a factor $y'$).
2. Collect the $y'$ terms.
3. Solve for $y'$.

The answer involves both $x$ and $y$, which is expected. Another example, from the Exam 1 review: $y^3 + 3xy^2 = 8$ gives $y' = \\frac{-3y^2}{3y^2 + 6xy}$.`,
    pitfall:
      "Differentiating y² as 2y instead of 2y·y′. Every y-term needs the chain rule, because y depends on x.",
    related: ["mit1801-differentiation-rational-exponents", "mit1801-differentiation-inverse-functions", "mit1801-differentiation-chain-rule"],
  },

  // --- Session 15: Implicit differentiation and inverse functions ---
  {
    id: "mit1801-differentiation-inverse-functions",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Derive the derivative of an inverse function, and use it to prove d/dx arctan x = 1/(1 + x²) and d/dx arcsin x = 1/√(1 − x²).",
    back: `**Inverse functions.** $g = f^{-1}$ means $g(f(x)) = x$. The graph of $f^{-1}$ is the graph of $f$ **reflected across $y = x$**, so tangent slopes become reciprocals.

**General rule (implicit differentiation).** Differentiate $f^{-1}(y) = x$, where $y = f(x)$, with respect to $x$ using the chain rule:
$$\\frac{d f^{-1}}{dy}\\cdot\\frac{dy}{dx} = 1 \\quad\\Longrightarrow\\quad \\frac{dx}{dy} = \\frac{1}{dy/dx}.$$

**arctan.** $y = \\arctan x$ means $\\tan y = x$, with $y \\in (-\\frac{\\pi}{2}, \\frac{\\pi}{2})$. Differentiating gives $\\sec^2 y\\cdot y' = 1$, so $y' = \\cos^2 y$. Express this in $x$ using a right triangle with legs $1$ and $x$ (so $\\tan y = x$) and hypotenuse $\\sqrt{1 + x^2}$. Then $\\cos y = \\frac{1}{\\sqrt{1 + x^2}}$, and
$$\\frac{d}{dx}\\arctan x = \\frac{1}{1 + x^2}.$$
Also, $\\arctan x \\to \\frac{\\pi}{2}$ as $x \\to \\infty$.

**arcsin.** $\\sin y = x$ gives $\\cos y\\cdot y' = 1$. On $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$ we have $\\cos y > 0$, so $\\cos y = +\\sqrt{1 - \\sin^2 y} = \\sqrt{1 - x^2}$, and
$$\\frac{d}{dx}\\arcsin x = \\frac{1}{\\sqrt{1 - x^2}}, \\qquad \\lvert x \\rvert < 1.$$

These two antiderivatives are why $\\int\\frac{dx}{1 + x^2}$ and $\\int\\frac{dx}{\\sqrt{1 - x^2}}$ come out as inverse trig functions in the integration units.`,
    pitfall:
      "Choosing the wrong square-root sign. Pick it from the range of the inverse function (arcsin outputs lie in [−π/2, π/2], where cos ≥ 0). When in doubt, draw the graph.",
    related: ["mit1801-differentiation-implicit-differentiation", "mit1801-differentiation-e-and-ln", "mit1801-differentiation-chain-rule"],
  },

  // --- Session 16: The derivative of aˣ ---
  {
    id: "mit1801-differentiation-exponential-m-of-a",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How is aˣ defined for irrational x, and why does d/dx aˣ reduce to the single number M(a) = lim (aʰ − 1)/h?",
    back: `**Building $a^x$** ($a > 0$):
1. Start from $a^0 = 1$, $a^1 = a$ and the law $a^{x_1 + x_2} = a^{x_1}a^{x_2}$. These give $(a^{x_1})^{x_2} = a^{x_1x_2}$ and $a^{-m} = 1/a^m$.
2. For rational exponents, define $a^{p/q} = \\sqrt[q]{a^p}$.
3. For irrational $x$, fill in the gaps **by continuity**. This is what a calculator does for $3^{\\sqrt2}$ or $2^\\pi$.

**The derivative.** The exponent law factors $a^x$ out of the difference quotient, and $a^x$ is constant as $\\Delta x$ varies:
$$\\frac{d}{dx}a^x = \\lim_{\\Delta x\\to 0}\\frac{a^xa^{\\Delta x} - a^x}{\\Delta x} = a^x\\cdot\\underbrace{\\lim_{\\Delta x \\to 0}\\frac{a^{\\Delta x} - 1}{\\Delta x}}_{M(a)}.$$
So $\\frac{d}{dx}a^x = M(a)\\,a^x$, where $M(a) = \\frac{d}{dx}a^x\\big|_{x=0}$ is the **slope of $a^x$ at $x = 0$**. Knowing the slope at one point gives it everywhere, just as $\\lim\\frac{\\sin h}{h}$ did for sine.

**The snag.** Nothing like the unit-circle picture evaluates $M(a)$ directly. The way out (Session 17) is to stop trying: **define** $e$ by $M(e) = 1$. Then it turns out that $M(a) = \\ln a$.

**Bounds.** The secant of $2^x$ from $(0, 1)$ to $(1, 2)$ has slope 1, and $2^x$ is convex, so $M(2) < 1$. The secant of $4^x$ from $(-\\frac12, \\frac12)$ to $(0, 1)$ also has slope 1, so $M(4) > 1$. Numerically, $M(2) = \\ln 2 \\approx 0.693$ and $M(4) = \\ln 4 \\approx 1.386$.`,
    related: ["mit1801-differentiation-e-and-ln", "mit1801-differentiation-sin-cos-derivatives"],
  },

  // --- Session 17: The exponential function, its derivative and its inverse ---
  {
    id: "mit1801-differentiation-e-and-ln",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define e by M(e) = 1. Derive d/dx eˣ = eˣ, d/dx ln x = 1/x and d/dx aˣ = (ln a)aˣ. Why is ln the natural logarithm?",
    back: `**Definition.** $e$ is the unique base whose graph has slope 1 at $x = 0$:
$$\\lim_{h \\to 0}\\frac{e^h - 1}{h} = 1, \\qquad\\text{so}\\qquad \\frac{d}{dx}e^x = e^x.$$
**Existence:** $M(2) < 1 < M(4)$, and squeezing the graph horizontally ($2^{kx}$ for $1 \\le k \\le 2$) raises the slope at 0 continuously. So some base between 2 and 4 has slope exactly 1.

**$\\ln$ is the inverse of $e^x$.** $w = \\ln x \\iff e^w = x$. It has domain $x > 0$, satisfies $\\ln(x_1x_2) = \\ln x_1 + \\ln x_2$ and $\\ln 1 = 0$, and passes through $(1, 0)$ with slope 1, reflecting the slope 1 of $e^x$ at $(0, 1)$. Differentiate $e^w = x$ implicitly:
$$e^w\\frac{dw}{dx} = 1 \\quad\\Longrightarrow\\quad \\frac{d}{dx}\\ln x = \\frac{1}{e^w} = \\frac1x.$$

**General base, method 1.** $a^x = (e^{\\ln a})^x = e^{x\\ln a}$, and $\\ln a$ is a constant, so by the chain rule
$$\\frac{d}{dx}a^x = (\\ln a)\\,a^x, \\qquad\\text{i.e.}\\qquad M(a) = \\ln a.$$
For example, $(2^x)' = (\\ln 2)2^x$ and $(10^x)' = (\\ln 10)10^x$. Natural logs appear even if you insist on base 2 or 10.

**Why "natural".** Relative change $\\frac{\\Delta p}{p}$ is what matters for prices. A 27.9-point drop in an index of 6432 is about $0.43\\%$. And $\\frac{p'}{p} = (\\ln p)'$ exactly, whereas $(\\log_{10}p)' = \\frac{p'}{p\\ln 10}$ carries a stray constant.`,
    pitfall:
      "d/dx aˣ is not x·aˣ⁻¹. The power rule is for a variable base with a constant exponent; aˣ has a constant base and a variable exponent.",
    related: ["mit1801-differentiation-exponential-m-of-a", "mit1801-differentiation-logarithmic-differentiation", "mit1801-differentiation-e-as-limit"],
  },

  // --- Session 18: Derivatives of other exponential functions ---
  {
    id: "mit1801-differentiation-logarithmic-differentiation",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What is logarithmic differentiation? Use it to differentiate aˣ and xˣ.",
    back: `**Rule.** By the chain rule, $(\\ln u)' = \\frac{u'}{u}$, so
$$u' = u\\cdot(\\ln u)'.$$
This is useful when $\\ln u$ is easier to differentiate than $u$: products, powers, and above all **moving exponents** such as $u = e^{x^2 + 6}$.

**$a^x$ (method 2).** $\\ln u = x\\ln a$, so $(\\ln u)' = \\ln a$ and $u' = a^x\\ln a$. This is the same arithmetic as converting to base $e$, without the conversion.

**$v = x^x$** (moving base **and** moving exponent):
1. Take logs: $\\ln v = x\\ln x$.
2. Differentiate with the product rule: $\\frac{v'}{v} = \\ln x + x\\cdot\\frac1x = 1 + \\ln x$.
3. Multiply back: $v' = x^x(1 + \\ln x)$.

Check: neither rule applies on its own. The power rule would give $x\\cdot x^{x-1} = x^x$, and the exponential rule would give $x^x\\ln x$. The true derivative is their **sum**, since each rule captures one way the function changes.`,
    related: ["mit1801-differentiation-e-and-ln", "mit1801-differentiation-e-as-limit", "mit1801-differentiation-product-rule"],
  },

  // --- Session 19: An interesting limit involving e ---
  {
    id: "mit1801-differentiation-e-as-limit",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that (1 + 1/n)ⁿ → e as n → ∞ by recognising a derivative.",
    back: `**Moving exponent, so take logs:** $\\ln\\left(1 + \\frac1n\\right)^n = n\\ln\\left(1 + \\frac1n\\right)$.

**Turn $n \\to \\infty$ into $\\Delta x \\to 0$.** Put $\\Delta x = \\frac1n$ and subtract $0 = \\ln 1$:
$$\\lim_{n\\to\\infty}n\\ln\\left(1 + \\tfrac1n\\right) = \\lim_{\\Delta x \\to 0}\\frac{\\ln(1 + \\Delta x) - \\ln 1}{\\Delta x} = \\frac{d}{dx}\\ln x\\Big|_{x = 1} = \\frac11 = 1.$$

**Exponentiate back.** $e^x$ is continuous, so the limit passes inside:
$$\\lim_{n\\to\\infty}\\left(1 + \\tfrac1n\\right)^n = \\lim e^{n\\ln(1 + 1/n)} = e^{\\lim n\\ln(1 + 1/n)} = e^1 = e. \\;\\blacksquare$$

**Why it's not $1^\\infty = 1$.** It's true that $1 + \\frac1n \\to 1$, so $\\ln(1 + \\frac1n) \\to 0$. But it is multiplied by $n \\to \\infty$, and the race between the two is exactly what the derivative measures. (Later this is the indeterminate form $1^\\infty$ for L'Hospital's rule.)

**Numerically:** $(1 + \\frac{1}{10000})^{10000} \\approx 2.71815$, against $e = 2.71828\\ldots$. The convergence is slow, with error about $\\frac{e}{2n}$. The same argument gives $(1 + \\frac{r}{n})^n \\to e^r$, which is continuous compounding.`,
    related: ["mit1801-differentiation-e-and-ln", "mit1801-differentiation-logarithmic-differentiation"],
  },

  // --- Session 20: Hyperbolic trig functions ---
  {
    id: "mit1801-differentiation-hyperbolic-functions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define sinh and cosh, give their derivatives, and prove cosh² x − sinh² x = 1. Why are they called hyperbolic?",
    back: `$$\\sinh x = \\frac{e^x - e^{-x}}{2}, \\qquad \\cosh x = \\frac{e^x + e^{-x}}{2}.$$

**Derivatives** (from $(e^{-x})' = -e^{-x}$):
$$(\\sinh x)' = \\frac{e^x + e^{-x}}{2} = \\cosh x, \\qquad (\\cosh x)' = \\sinh x.$$
Note there is **no minus sign**, unlike $(\\cos x)' = -\\sin x$.

**Identity.**
$$\\cosh^2 x - \\sinh^2 x = \\tfrac14\\left(e^{2x} + 2 + e^{-2x}\\right) - \\tfrac14\\left(e^{2x} - 2 + e^{-2x}\\right) = \\tfrac14(2 + 2) = 1.$$

**Hyperbolic vs circular.** With $u = \\cosh t$ and $v = \\sinh t$ we get $u^2 - v^2 = 1$, a **hyperbola**. With $u = \\cos t$ and $v = \\sin t$ we get $u^2 + v^2 = 1$, a circle.

They come back in the integration unit: the substitution $x = a\\sinh u$ handles $\\sqrt{x^2 + a^2}$.`,
    related: ["mit1801-differentiation-e-and-ln", "mit1801-differentiation-sin-cos-derivatives"],
  },
];
