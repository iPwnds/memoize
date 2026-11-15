// MIT 18.335J Introduction to Numerical Methods (Spring 2019, Steven G.
// Johnson) — Lectures 1-5: Newton's method and convergence rates,
// floating-point arithmetic, summation error and backwards stability, norms,
// and condition numbers. Sourced from the course's own written materials,
// read page by page: the per-lecture summaries on the OCW week pages; the
// handouts "Square Roots via Newton's Method" (Lec 1), Persson's
// "Floating-Point Arithmetic, the IEEE Standard" slides and "Some Myths about
// Floating-Point Arithmetic" (Lec 2), "Notes on the Accuracy of Naive
// Summation" and "Backwards Stability of Recursive Summation" (Lec 3), and
// "Notes on the Equivalence of Norms" (Lec 4); plus the Problem Set 1 and 2
// solutions where the summaries point to them (pairwise summation; the
// stability classification exercise; the L∞ induced norm). The required
// textbook (Trefethen & Bau) is not hosted on OCW and was not used.
// Every numeric example was recomputed (exact rationals, Python's struct for
// the IEEE bit patterns, sympy for the condition numbers).
//
// This is the KU Leuven "Numerieke wiskunde" layer on top of MIT 18.06: 18.06
// does the exact linear algebra, this track does what happens to it in
// floating point.
//
// Corrections and additions:
// - Lec 2 slides list the "largest normalized" single/double numbers as
//   2¹²⁷ and 2¹⁰²³; those are the largest *powers of two*. The true maxima
//   are (2 − 2⁻²³)·2¹²⁷ ≈ 3.4·10³⁸ and (2 − 2⁻⁵²)·2¹⁰²³ ≈ 1.8·10³⁰⁸.
// - The slides' ε(machine) = ½β¹⁻ᵖ (= 2⁻⁵³ in double) is the unit roundoff;
//   Julia's eps() (used in Problem Set 1) and numpy's finfo.eps are 2⁻⁵²,
//   the gap from 1 to the next float. Added as a pitfall.
// - The handout states δₙ₊₁ = δₙ²/2 + O(δₙ³); the exact recurrence
//   δₙ₊₁ = δₙ²/(2(1 + δₙ)) is added (verified symbolically).
// - Added beyond the source: the round-half-to-even example 1 + 2⁻⁵³ = 1,
//   the explicit ℓ1/ℓ2/ℓ∞ equivalence constants, the forward-error ≤
//   κ·backward-error derivation for Ax = b, and the 2×2 Ax = b example
//   (κ∞ = 40004.0001, recomputed exactly).
import type { Card } from "./types";

const MODULE = "mit18335-errors";

export const mit18335ErrorsCards: Card[] = [
  // --- Lecture 1: Course overview, Newton's method for root-finding ---
  {
    id: "mit18335-errors-newton-square-roots",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive the Babylonian square-root iteration from Newton's method and trace it for √2 starting at x₁ = 1. What do the iterates show?",
    back: `**Newton's method** finds a root of $f(x) = 0$ by replacing $f$ with its tangent line at the current guess, $f(x_n) + f'(x_n)(x - x_n)$, and jumping to that line's root:
$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}.$$
For $f(x) = x^2 - a$ ($a > 0$) this is
$$x_{n+1} = x_n - \\frac{x_n^2 - a}{2x_n} = \\frac12\\left(x_n + \\frac{a}{x_n}\\right),$$
the **Babylonian** algorithm (c. 1000 BCE): if $x_n > \\sqrt a$ then $a/x_n < \\sqrt a$, so averaging the two moves toward $\\sqrt a$.

**Trace for $a = 2$, $x_1 = 1$** (exact rationals):

| $n$ | $x_n$ | decimal | correct digits |
|---|---|---|---|
| 1 | $1$ | 1 | 1 |
| 2 | $3/2$ | 1.5 | 1 |
| 3 | $17/12$ | 1.41666… | 3 |
| 4 | $577/408$ | 1.4142156… | 6 |
| 5 | $665857/470832$ | 1.41421356237469 | 12 |

Once close, the number of correct digits roughly **doubles** each step; seven iterations already give more than 60 digits, at which point the answer is limited only by the working precision.

This one example shows all three concerns that set numerical methods apart: the answers are real numbers (only ever approximated), **cost** matters (and nowadays memory access often matters more than arithmetic counts), and **accuracy** matters, both from the algorithm itself (converging but never arriving) and from floating-point roundoff.`,
    related: ["mit18335-errors-newton-quadratic-convergence", "mit18335-errors-newton-sqrt-converges", "mit18335-eig-eigensolvers-must-iterate"],
  },
  {
    id: "mit18335-errors-newton-sqrt-converges",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that the iteration xₙ₊₁ = ½(xₙ + a/xₙ) converges to √a from any starting guess x₁ > 0. What does this proof not tell you?",
    back: `The classic analysis-text proof: show the sequence is eventually **monotone and bounded**, so it has a limit, then identify the limit.

**1. Above $\\sqrt a$ after one step, from any start.**
$$x_{n+1}^2 - a = \\tfrac14\\left(x_n^2 + 2a + \\tfrac{a^2}{x_n^2}\\right) - a = \\tfrac14\\left(x_n - \\tfrac{a}{x_n}\\right)^2 = \\frac{(x_n^2 - a)^2}{4x_n^2} \\geq 0,$$
so $x_{n+1} \\geq \\sqrt a$ for every $n \\geq 1$, whatever $x_1 > 0$ was (strictly, unless $x_n = \\sqrt a$ already).

**2. Decreasing while above.** If $x_n > \\sqrt a$,
$$x_{n+1} - x_n = \\frac12\\left(\\frac{a}{x_n} - x_n\\right) = \\frac{a - x_n^2}{2x_n} < 0.$$

**3. Limit.** So from $n = 2$ on the sequence is decreasing and bounded below by $\\sqrt a$, hence converges (monotone convergence theorem). Its limit $x$ satisfies $x = \\frac12(x + a/x)$, i.e. $x^2 = a$, and $x \\geq \\sqrt a > 0$, so $x = \\sqrt a$. $\\blacksquare$

**What it doesn't say:** *how fast*. A sequence that gains one digit per thousand steps also converges. The rate needs a separate local analysis of the error, which is the next card.`,
    related: ["mit18335-errors-newton-square-roots", "mit18335-errors-newton-quadratic-convergence"],
  },
  {
    id: "mit18335-errors-newton-quadratic-convergence",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Show that Newton's square-root iteration converges quadratically: write xₙ = √a(1 + δₙ) and find δₙ₊₁ in terms of δₙ. Why does that double the number of correct digits?",
    back: `Measure the **relative error** $\\delta_n$ by $x_n = x(1 + \\delta_n)$ with $x = \\sqrt a$, so $|\\delta_n| = |x_n - x|/|x|$. Relative error is dimensionless (independent of units and scaling), and $-\\log_{10}|\\delta_n|$ is roughly the number of correct significant digits.

Substitute into $x_{n+1} = \\frac12(x_n + a/x_n)$ and divide by $x$, using $a/x = x$:
$$1 + \\delta_{n+1} = \\frac12\\left(1 + \\delta_n + \\frac{1}{1 + \\delta_n}\\right).$$
Exactly, this gives
$$\\delta_{n+1} = \\frac{\\delta_n^2}{2(1 + \\delta_n)},$$
and Taylor-expanding $(1+\\delta_n)^{-1} = 1 - \\delta_n + \\delta_n^2 - \\cdots$ gives the handout's form
$$\\delta_{n+1} = \\frac{\\delta_n^2}{2} + O(\\delta_n^3).$$

The error **squares** (and halves) every step once $|\\delta_n| \\ll 1$. If $|\\delta_n| \\approx 10^{-k}$ then $|\\delta_{n+1}| \\approx 10^{-2k}/2$: the digit count **doubles**. That is **quadratic convergence**. Compare **linear** convergence, $|\\delta_{n+1}| \\approx c\\,|\\delta_n|$ with $c < 1$, which adds a fixed number of digits per step (the power method, for example).

Check on the $\\sqrt 2$ trace: $\\delta_4 \\approx 1.5 \\cdot 10^{-6}$ predicts $\\delta_5 \\approx 1.1 \\cdot 10^{-12}$, matching $665857/470832$.`,
    pitfall:
      "“Quadratic convergence” (error squares each iteration) is not “second-order accuracy” (discretization error ∝ h², as in ODE or quadrature schemes). The two terminologies are unrelated, and the course warns against mixing them up.",
    related: ["mit18335-errors-newton-sqrt-converges", "mit18335-errors-newton-square-roots", "mit18335-eig-power-inverse-iteration"],
  },

  // --- Lecture 2: Floating-point arithmetic ---
  {
    id: "mit18335-errors-floating-point-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How is a floating-point number represented (base, precision, exponent), and what is the key accuracy property of fl(x) and of each arithmetic operation?",
    back: `Floating point is **scientific notation in hardware**:
$$\\pm\\left(d_0 + d_1\\beta^{-1} + \\cdots + d_{p-1}\\beta^{-(p-1)}\\right)\\beta^e, \\qquad 0 \\leq d_i < \\beta,$$
with base $\\beta$, precision $p$ (digits in the significand) and exponent $e \\in [e_{\\min}, e_{\\max}]$. It is **normalized** when $d_0 \\neq 0$. The set $\\mathbb F$ of floating-point numbers is a specific finite set of rationals: $p$-digit integers times powers of $\\beta$.

**Spacing scales with magnitude.** The gaps between neighbours grow with $|x|$, so the **relative** resolution is uniform. Toy example $\\beta = 2$, $p = 3$: the numbers in $[1, 2)$ are $1, 1.25, 1.5, 1.75$ (gap $\\frac14$), in $[2, 4)$ they are $2, 2.5, 3, 3.5$ (gap $\\frac12$), and so on.

**Machine epsilon** $\\epsilon_{\\text{machine}} = \\frac12\\beta^{1-p}$. Two axioms drive all error analysis:
1. **Rounding**: for every real $x$ in range, $\\text{fl}(x) = x(1 + \\epsilon)$ with $|\\epsilon| \\leq \\epsilon_{\\text{machine}}$.
2. **Correctly rounded operations** (IEEE guarantees this for $+, -, \\times, \\div$): $x \\circledast y = \\text{fl}(x * y) = (x * y)(1 + \\epsilon)$, $|\\epsilon| \\leq \\epsilon_{\\text{machine}}$, with ties rounded to even.

**Why this design**: a huge dynamic range ($\\sim 10^{\\pm 308}$ in double) at a **fixed relative accuracy** makes algorithms mostly insensitive to units or overall scaling, at the price of needing dedicated floating-point hardware (which every general-purpose CPU now has).`,
    pitfall:
      "Two different numbers are both called “machine epsilon”. The course's ε(machine) = ½β¹⁻ᵖ = 2⁻⁵³ ≈ 1.1·10⁻¹⁶ in double is the maximum relative rounding error, while Julia's eps() and numpy's finfo(float).eps = 2⁻⁵² ≈ 2.2·10⁻¹⁶ is the gap between 1 and the next float. Check which one a bound uses.",
    related: ["mit18335-errors-ieee-754-formats", "mit18335-errors-special-values-gradual-underflow", "mit18335-errors-floating-point-myths"],
  },
  {
    id: "mit18335-errors-ieee-754-formats",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Decode the IEEE single-precision word 0 10000001 101 followed by twenty 0 bits, and give the field sizes, exponent range and ε(machine) of single and double precision.",
    back: `**Single precision**: 1 sign bit $S$, 8 exponent bits $E$, 23 stored significand bits $M$ (the leading 1 is implicit, so $p = 24$). An ordinary number is
$$(-1)^S \\times 1.M \\times 2^{E - 127}.$$

**Decode** $0\\;10000001\\;1010\\ldots0$: $S = 0$, $E = 129$, $M = .101_2$, so the value is $+1.101_2 \\times 2^{129-127} = 1.625 \\times 4 = 6.5$. Flipping only the sign bit gives $-6.5$.

| | Single | Double |
|---|---|---|
| Significand $p$ | 24 bits | 53 bits |
| Exponent bits | 8 | 11 |
| Total | 32 bits | 64 bits |
| $e_{\\min}$ / $e_{\\max}$ | $-126$ / $+127$ | $-1022$ / $+1023$ |
| Smallest normalized | $2^{-126} \\approx 1.2 \\cdot 10^{-38}$ | $2^{-1022} \\approx 2.2 \\cdot 10^{-308}$ |
| Largest finite | $(2 - 2^{-23})2^{127} \\approx 3.4 \\cdot 10^{38}$ | $(2 - 2^{-52})2^{1023} \\approx 1.8 \\cdot 10^{308}$ |
| $\\epsilon_{\\text{machine}}$ | $2^{-24} \\approx 6 \\cdot 10^{-8}$ | $2^{-53} \\approx 1.1 \\cdot 10^{-16}$ |

**Special exponent fields** (single):

| | $E = 0$ | $0 < E < 255$ | $E = 255$ |
|---|---|---|---|
| $M = 0$ | $\\pm 0$ | powers of 2 | $\\pm\\infty$ |
| $M \\neq 0$ | denormalized: $0.M \\times 2^{-126}$ | ordinary numbers | NaN |

E.g. $0\\;00000000\\;0\\ldots01 = 2^{-126} \\cdot 2^{-23} = 2^{-149}$, the smallest positive single.

**Integers are exact up to $\\beta^p$**: the smallest positive integer that is *not* representable is $\\beta^p + 1$, i.e. $2^{24} + 1 = 16{,}777{,}217$ in single and $2^{53} + 1 = 9{,}007{,}199{,}254{,}740{,}993$ in double. ($2^{p}$ itself fits, as $2^{p-1}$ with the extra factor of 2 absorbed into the exponent.)`,
    pitfall:
      "The Lec 2 slides list 2¹²⁷ and 2¹⁰²³ as the largest normalized numbers. Those are the largest powers of two. The largest finite values are about 3.4·10³⁸ and 1.8·10³⁰⁸, because the significand can be all ones.",
    related: ["mit18335-errors-floating-point-model", "mit18335-errors-special-values-gradual-underflow"],
  },
  {
    id: "mit18335-errors-special-values-gradual-underflow",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are ±∞, NaN, ±0 and denormalized numbers in IEEE arithmetic, and what guarantee does gradual underflow buy?",
    back: `**±∞** is returned on **overflow**, and arithmetic with it is defined by limits: $4 - \\infty = \\lim_{x\\to\\infty}(4 - x) = -\\infty$, $x/\\pm\\infty = 0$, and $x/0 = \\pm\\infty$ for nonzero $x$.

**NaN** ("not a number") is returned when there is no well-defined finite or infinite result: $\\infty - \\infty$, $\\infty/\\infty$, $0/0$, $\\sqrt{-1}$, and any operation with a NaN input. NaN compares unequal to everything, itself included.

**±0**: underflow toward zero keeps its sign, so $1/(+0) = +\\infty$ but $1/(-0) = -\\infty$. Kahan's point: "if it is exactly 0, no purpose is served by distinguishing ±0" is a myth; the sign records which side the value came from (branch cuts, limits).

**Denormalized (subnormal) numbers.** With normalized significands only, there is a gap between $0$ and $\\beta^{e_{\\min}}$ that is far wider than the spacing just above $\\beta^{e_{\\min}}$. Then two distinct tiny numbers can have $x - y$ round to $0$, and code like

\`if x != y: z = 1/(x - y)\`

can still divide by zero. IEEE fills the gap by allowing a **non-normalized significand when the exponent is $e_{\\min}$** (stored with exponent field $E = 0$). This **gradual underflow** guarantees
$$x = y \\iff x - y = 0.$$
The price: denormals have fewer significant bits, so relative accuracy degrades smoothly below $\\beta^{e_{\\min}}$ (and on some hardware they're slow).`,
    related: ["mit18335-errors-ieee-754-formats", "mit18335-errors-floating-point-model"],
  },
  {
    id: "mit18335-errors-floating-point-myths",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "True or false (Kahan's myths): floating point adds a random error of order ε to every result; integer arithmetic is more accurate; precision equals accuracy; extra precision beyond the data is wasteful.",
    back: `All **false**. Each follows from the correct-rounding axiom $x \\circledast y = \\text{fl}(x * y)$:

| Myth | Reality |
|---|---|
| A random error $\\sim\\epsilon$ is added to every result, so $1 \\oplus 1 = 2 \\pm \\epsilon$ | Rounding is deterministic, and exact results are returned exactly: $1 \\oplus 1 = 2$, $0 \\otimes x = 0$ (for finite $x$) |
| Integer arithmetic is more accurate | Integers up to $2^{53}$ are represented and added/multiplied **exactly** in double |
| Integer arithmetic is much faster | False on any modern general-purpose CPU (true in 1985, or on small embedded chips) |
| Precision (digits stored) = accuracy | A result can be far more accurate (exact integers) or far less (accumulated or amplified error) than the digits stored |
| Arithmetic more precise than the data is wasteful | You may need many more digits in **intermediate** steps to get 3 good digits at the end |
| Floating point rounds decimal fractions "randomly" | True for **binary** floating point (0.1 is not in $\\mathbb F$), false for decimal floating point |
| Better formulas always replace worse ones | Sadly false |

**Concrete checks (double):** $0.1 + 0.2$ gives $0.30000000000000004 \\neq 0.3$, because none of the three decimals is exactly representable in binary. And $1 + 2^{-53}$ gives exactly $1$: it's a tie, and round-half-to-even picks $1$.`,
    pitfall:
      "Testing floating-point results with == is not always wrong. Exactly representable results (small integers, powers of two, x − x) are computed exactly. The real danger is decimal constants like 0.1, which are already rounded before any arithmetic happens.",
    related: ["mit18335-errors-floating-point-model", "mit18335-errors-ieee-754-formats"],
  },

  // --- Lecture 3: Floating-point summation and backwards stability ---
  {
    id: "mit18335-errors-naive-summation-error",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Bound the error of naive (“recursive”) floating-point summation s̃ₖ = s̃ₖ₋₁ ⊕ xₖ of n numbers. How does it grow with n in the worst case and on average?",
    back: `**Claim.** $|\\tilde f(x) - f(x)| \\leq n\\,\\epsilon_{\\text{machine}}\\sum_{i=1}^n |x_i| + O(\\epsilon_{\\text{machine}}^2)$.

**Lemma** (induction on $n$): $\\tilde f(x) = \\sum_{i=1}^n x_i \\prod_{k=i}^n (1 + \\epsilon_k)$ with $\\epsilon_1 = 0$ and $|\\epsilon_k| \\leq \\epsilon_{\\text{machine}}$. For $n = 1$ it's trivial. If it holds for $\\tilde s_{n-1}$, then $\\tilde s_n = \\tilde s_{n-1} \\oplus x_n = (\\tilde s_{n-1} + x_n)(1 + \\epsilon_n)$: every earlier term gains a factor $(1 + \\epsilon_n)$ and the new term is $x_n(1 + \\epsilon_n)$.

**Bound.** Multiply out: $\\prod_{k=i}^n (1 + \\epsilon_k) = 1 + \\delta_i$ with $\\delta_i = \\sum_{k=i}^n \\epsilon_k + (\\text{products of } \\epsilon\\text{'s})$, so $|\\delta_i| \\leq n\\epsilon_{\\text{machine}} + O(\\epsilon_{\\text{machine}}^2)$. Then $\\tilde f - f = \\sum_i x_i\\delta_i$, and the triangle inequality gives the claim. $\\blacksquare$

**Relative error:**
$$\\frac{|\\tilde f - f|}{|f|} \\leq n\\,O(\\epsilon_{\\text{machine}})\\left[\\frac{\\sum_i |x_i|}{\\left|\\sum_i x_i\\right|}\\right].$$
The bracket is the **condition number** of summation. It is 1 when all $x_i \\geq 0$ (error grows at worst linearly in $n$), and it is unbounded under **cancellation** (terms of opposite sign with a small sum).

**On average** the $\\epsilon_k$ behave like random signs, so $\\delta_i$ is a random walk: rms error $O(\\sqrt n\\,\\epsilon_{\\text{machine}}\\sum|x_i|)$.`,
    pitfall:
      "This bound is not forwards stability. It controls the error relative to Σ|xᵢ|, not relative to |Σxᵢ|. With cancellation the computed sum can have no correct digits at all, even though every single addition was correctly rounded.",
    related: ["mit18335-errors-pairwise-summation", "mit18335-errors-summation-backwards-stable", "mit18335-errors-condition-number"],
  },
  {
    id: "mit18335-errors-pairwise-summation",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Pairwise summation adds the two halves recursively: f̃(x) = f̃(first half) ⊕ f̃(second half). Prove its worst-case error grows like log₂ n instead of n, and say how to make it as fast as a loop.",
    back: `**Claim** ($n = 2^m$): $|\\tilde f(x) - f(x)| \\leq \\epsilon_{\\text{machine}}\\log_2(n)\\sum_i |x_i| + O(\\epsilon_{\\text{machine}}^2)$.

**Proof.** Show by induction on $m$ that
$$\\tilde f(x) = \\sum_{i=1}^n x_i\\prod_{k=1}^{m}(1 + \\epsilon_{i,k}), \\qquad |\\epsilon_{i,k}| \\leq \\epsilon_{\\text{machine}}.$$
For $n = 2$ this is one correctly rounded addition. Going from $n$ to $2n$: each half has this form with $m$ factors per term, and the final $\\oplus$ multiplies the whole sum by one more $(1 + \\epsilon)$, so set $\\epsilon_{i,m+1} = \\epsilon$. Each term passes through only $m = \\log_2 n$ additions (the depth of the recursion tree), against up to $n$ in a loop. As in naive summation, $\\prod_{k=1}^m(1 + \\epsilon_{i,k}) = 1 + \\delta_i$ with $|\\delta_i| \\leq m\\epsilon_{\\text{machine}} + O(\\epsilon_{\\text{machine}}^2)$. $\\blacksquare$

The average-case (random-walk) error is $O(\\sqrt{\\log n})$.

**Making it fast:** recursing all the way down costs a function call per number. Instead, **enlarge the base case**: when $n < N$ (say $N = 200$), sum with a simple loop. That is $\\sim 2n/N$ calls, negligible next to the $n - 1$ additions. The worst-case bound becomes $[N + \\log_2(n/N)]\\,\\epsilon_{\\text{machine}}\\sum|x_i|$, still logarithmic in $n$ with the same coefficient on $\\log_2 n$. This is what Julia's built-in \`sum\` does: about the speed of naive summation, much better error.`,
    related: ["mit18335-errors-naive-summation-error", "mit18335-errors-summation-backwards-stable"],
  },
  {
    id: "mit18335-errors-stability-definitions",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Define accuracy (forwards stability), stability and backwards stability of an algorithm f̃ for a problem f, including what O(ε(machine)) means here.",
    back: `**Asymptotic notation.** $g(\\epsilon) = O(\\epsilon)$ means there are constants $C, \\epsilon_0 > 0$ with $|g(\\epsilon)| \\leq C|\\epsilon|$ for all $|\\epsilon| < \\epsilon_0$. That's the limit of *small* arguments, unlike complexity theory's large $n$. In stability definitions the constants must be **uniform**: independent of the input $x$ (they may depend on the dimension).

| Property | Informally | Formally, for all $x$ |
|---|---|---|
| **Forwards stable** (accurate) | almost the right answer for the right input | $\\frac{\\lVert\\tilde f(x) - f(x)\\rVert}{\\lVert f(x)\\rVert} = O(\\epsilon_{\\text{machine}})$ |
| **Stable** | almost the right answer for almost the right input | $\\frac{\\lVert\\tilde f(x) - f(\\tilde x)\\rVert}{\\lVert f(\\tilde x)\\rVert} = O(\\epsilon_{\\text{machine}})$ for some $\\tilde x$ with $\\frac{\\lVert\\tilde x - x\\rVert}{\\lVert x\\rVert} = O(\\epsilon_{\\text{machine}})$ |
| **Backwards stable** | exactly the right answer for almost the right input | $\\tilde f(x) = f(\\tilde x)$ for some $\\tilde x$ with $\\frac{\\lVert\\tilde x - x\\rVert}{\\lVert x\\rVert} = O(\\epsilon_{\\text{machine}})$ |

Backwards stable ⇒ stable, and forwards stable ⇒ stable.

**Why backwards stability is the workhorse.** Forwards stability is often too strong. Summation is *not* forwards stable, because cancellation can make the denominator $|f(x)|$ arbitrarily small, but it *is* backwards stable. And backwards stability plus a well-conditioned problem gives accuracy (condition-number card).

**Exercise-style classifications** (Problem Set 2), for $x \\in \\mathbb R$:
- $x \\oplus x$ and $x \\otimes x$: backwards stable (absorb the errors into $\\tilde x = x(1 + O(\\epsilon))$).
- $x \\ominus x$: backwards stable, since it returns exactly $0 = f(x)$.
- $x \\oslash x$: forwards stable (it returns $1 + O(\\epsilon)$; exactly 1 with correct rounding), but in the worst-case model **not** backwards stable, since every $\\tilde x$ gives $\\tilde x/\\tilde x = 1$ exactly, never the computed $1 + \\epsilon$.
- $e$ as $\\sum 1/k!$ summed largest-first: unstable (the error grows like $n\\epsilon$ with $n! \\approx 1/\\epsilon$). Summed **smallest-first**: forwards stable (the error coefficients form a convergent series).`,
    related: ["mit18335-errors-summation-backwards-stable", "mit18335-errors-condition-number", "mit18335-errors-norm-equivalence"],
  },
  {
    id: "mit18335-errors-summation-backwards-stable",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that recursive floating-point summation f̃(x) = ((x₁ ⊕ x₂) ⊕ x₃) ⊕ ⋯ is backwards stable.",
    back: `We need $\\tilde x$ with $\\tilde f(x) = f(\\tilde x) = \\sum\\tilde x_i$ and $\\lVert\\tilde x - x\\rVert = \\lVert\\tilde x\\rVert\\,O(\\epsilon_{\\text{machine}})$. Use the $L_1$ norm. Any norm works, by norm equivalence.

**Construct $\\tilde x$.** Let $\\tilde s_1 = x_1$ and $\\tilde s_i = \\tilde s_{i-1} \\oplus x_i$. Put $\\tilde x_1 = x_1$ and define each later $\\tilde x_i$ to absorb its rounding error:
$$\\tilde x_i = \\tilde s_{i-1} \\oplus x_i - \\tilde s_{i-1} = (\\tilde s_{i-1} + x_i)(1 + \\epsilon_i) - \\tilde s_{i-1}, \\quad |\\epsilon_i| \\leq \\epsilon_{\\text{machine}}.$$
By induction $\\tilde s_i = \\sum_{k \\leq i}\\tilde x_k$, so $\\tilde f(x) = \\tilde s_n = f(\\tilde x)$.

**Show it's close.** From the formula, $\\tilde x_i - x_i = (x_i + \\tilde s_{i-1})\\epsilon_i$, and $\\tilde s_{i-1} = \\sum_{k<i}\\tilde x_k$ has $|\\tilde s_{i-1}| \\leq \\lVert\\tilde x\\rVert_1$. Hence
$$\\lVert\\tilde x - x\\rVert_1 \\leq \\sum_i (|x_i| + \\lVert\\tilde x\\rVert_1)|\\epsilon_i| \\leq \\lVert x\\rVert_1 O(\\epsilon_{\\text{machine}}) + \\lVert\\tilde x\\rVert_1 O(\\epsilon_{\\text{machine}}),$$
where the second $O$ hides a factor $n$. That is allowed, since the constant must not depend on $x$ but may depend on $n$. Finally $\\lVert x\\rVert \\leq \\lVert\\tilde x\\rVert + \\lVert\\tilde x - x\\rVert$. Substituting and solving,
$$\\lVert\\tilde x - x\\rVert_1 = \\frac{\\lVert\\tilde x\\rVert_1 O(\\epsilon_{\\text{machine}})}{1 - O(\\epsilon_{\\text{machine}})} = \\lVert\\tilde x\\rVert_1 O(\\epsilon_{\\text{machine}}). \\;\\blacksquare$$

The same argument shows $\\lVert\\tilde x - x\\rVert = \\lVert\\tilde x\\rVert O(\\epsilon) \\iff \\lVert\\tilde x - x\\rVert = \\lVert x\\rVert O(\\epsilon)$, so it doesn't matter which one sits in the denominator. Real (not yet rounded) inputs only add another $\\lVert x\\rVert_1 O(\\epsilon_{\\text{machine}})$ term from $\\text{fl}(x_i) = x_i(1 + \\epsilon_i')$.`,
    related: ["mit18335-errors-stability-definitions", "mit18335-errors-naive-summation-error", "mit18335-errors-norm-equivalence"],
  },

  // --- Lecture 4: Norms on vector spaces ---
  {
    id: "mit18335-errors-vector-matrix-norms",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the norm axioms, and define the p-norms, the Frobenius norm and the induced matrix norm. Which properties make the induced 2-norm special?",
    back: `A **norm** on a vector space $V$ maps $v \\mapsto \\lVert v\\rVert \\in \\mathbb R$ with
1. **positive definite**: $\\lVert v\\rVert \\geq 0$, and $= 0$ iff $v = 0$;
2. **scaling**: $\\lVert\\alpha v\\rVert = |\\alpha|\\,\\lVert v\\rVert$;
3. **triangle inequality**: $\\lVert v + w\\rVert \\leq \\lVert v\\rVert + \\lVert w\\rVert$.

**Vector norms**: $\\lVert x\\rVert_p = \\left(\\sum_i |x_i|^p\\right)^{1/p}$, usually $p = 1, 2, \\infty$ with $\\lVert x\\rVert_\\infty = \\max_i|x_i|$. Weighted 2-norms $\\lVert Wx\\rVert_2$ (with $W$ invertible) are norms too.

**Matrix norms.**
- **Frobenius**: $\\lVert A\\rVert_F = \\sqrt{\\sum_{ij}|a_{ij}|^2} = \\sqrt{\\operatorname{tr}(A^*A)} = \\sqrt{\\sum_i \\sigma_i^2}$, where the $\\sigma_i^2$ are the eigenvalues of $A^*A$.
- **Induced** (operator) norm: $\\lVert A\\rVert = \\sup_{x \\neq 0}\\frac{\\lVert Ax\\rVert}{\\lVert x\\rVert}$, the largest stretch. Concrete cases: $\\lVert A\\rVert_1$ = max absolute **column** sum, and $\\lVert A\\rVert_\\infty$ = max absolute **row** sum (attained at $x_k = \\operatorname{sign}(a_{jk})$ for the largest row $j$).

**Properties of induced norms:**
- **Submultiplicative**: $\\lVert AB\\rVert \\leq \\lVert A\\rVert\\,\\lVert B\\rVert$, since $\\lVert ABx\\rVert \\leq \\lVert A\\rVert\\,\\lVert Bx\\rVert \\leq \\lVert A\\rVert\\,\\lVert B\\rVert\\,\\lVert x\\rVert$.
- $\\lVert A\\rVert \\geq |\\lambda|$ for every eigenvalue of a square $A$ (take $x$ the eigenvector).
- $\\lVert A\\rVert_2 = \\sigma_{\\max}(A)$, the largest singular value (proved in Lec 5).
- **Unitary invariance**: for $Q^* = Q^{-1}$, $\\lVert QA\\rVert_2 = \\lVert A\\rVert_2$ and $\\lVert QA\\rVert_F = \\lVert A\\rVert_F$. Multiplying by unitary matrices never amplifies errors, which is the root of Householder QR's stability.`,
    related: ["mit18335-errors-norm-equivalence", "mit18335-errors-two-norm-rayleigh-quotient", "mit1806-orthogonality-orthonormal-orthogonal-matrices", "mit18335-qr-triangular-vs-orthogonal"],
  },
  {
    id: "mit18335-errors-norm-equivalence",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that any two norms on a finite-dimensional space are equivalent: C₁‖x‖ ≤ ‖x‖′ ≤ C₂‖x‖. Why does this matter for stability?",
    back: `Fix a basis $e_1, \\ldots, e_n$, write $x = \\sum\\alpha_i e_i$, and let $\\lVert x\\rVert_1 = \\sum|\\alpha_i|$ (a norm, by linear independence of the basis).

**Step 1: reduce to $\\lVert\\cdot\\rVert_b = \\lVert\\cdot\\rVert_1$.** Equivalence is transitive: if $C_1\\lVert x\\rVert_1 \\leq \\lVert x\\rVert_a \\leq C_2\\lVert x\\rVert_1$ and $C_1'\\lVert x\\rVert_1 \\leq \\lVert x\\rVert_{a'} \\leq C_2'\\lVert x\\rVert_1$, then $\\frac{C_1'}{C_2}\\lVert x\\rVert_a \\leq \\lVert x\\rVert_{a'} \\leq \\frac{C_2'}{C_1}\\lVert x\\rVert_a$.

**Step 2: reduce to the unit sphere.** The case $x = 0$ is trivial. Otherwise divide by $\\lVert x\\rVert_1$: it suffices that $C_1 \\leq \\lVert u\\rVert_a \\leq C_2$ for all $u$ with $\\lVert u\\rVert_1 = 1$.

**Step 3: $\\lVert\\cdot\\rVert_a$ is continuous under $\\lVert\\cdot\\rVert_1$.** By the triangle inequality, $\\big|\\lVert x\\rVert_a - \\lVert x'\\rVert_a\\big| \\leq \\lVert x - x'\\rVert_a \\leq \\sum_i|\\alpha_i - \\alpha_i'|\\,\\lVert e_i\\rVert_a \\leq \\lVert x - x'\\rVert_1\\max_i\\lVert e_i\\rVert_a$. So $\\delta = \\varepsilon/\\max_i\\lVert e_i\\rVert_a$ works.

**Step 4: extreme value theorem.** The unit sphere $\\{u : \\lVert u\\rVert_1 = 1\\}$ is closed and bounded, hence compact, so the continuous $\\lVert u\\rVert_a$ attains a minimum $C_1$ and maximum $C_2$ there. Since $u \\neq 0$ on the sphere, $C_1 > 0$. $\\blacksquare$

**Common constants** in $\\mathbb C^n$: $\\lVert x\\rVert_\\infty \\leq \\lVert x\\rVert_2 \\leq \\lVert x\\rVert_1 \\leq \\sqrt n\\lVert x\\rVert_2 \\leq n\\lVert x\\rVert_\\infty$.

**Why it matters:** $O(\\epsilon_{\\text{machine}})$ in one norm is $O(\\epsilon_{\\text{machine}})$ in every norm, since the constants only change $C$. So stability proofs may pick whichever norm is convenient ($L_1$ for summation, $L_2$ for unitary matrices).`,
    pitfall:
      "The constants depend on the dimension (√n, n), and equivalence fails in infinite dimensions. “Stable in every norm” is only true for a fixed problem size.",
    related: ["mit18335-errors-vector-matrix-norms", "mit18335-errors-summation-backwards-stable", "mit18335-errors-stability-definitions"],
  },

  // --- Lecture 5: Condition numbers ---
  {
    id: "mit18335-errors-condition-number",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the relative condition number κ of a problem f at x, give its Jacobian formula, and explain how it links backwards error to forwards error. What is κ for √x and for summation?",
    back: `The **relative condition number** measures how much a problem amplifies relative perturbations of its input, as the perturbation shrinks:
$$\\kappa(x) = \\lim_{\\delta\\to 0}\\sup_{\\lVert\\delta x\\rVert \\leq \\delta}\\frac{\\lVert f(x + \\delta x) - f(x)\\rVert / \\lVert f(x)\\rVert}{\\lVert\\delta x\\rVert / \\lVert x\\rVert}.$$
For differentiable $f$ with Jacobian $J$ (using the induced norm):
$$\\kappa = \\frac{\\lVert J(x)\\rVert}{\\lVert f(x)\\rVert / \\lVert x\\rVert}.$$
$\\kappa$ involves **only exact math** (calculus and linear algebra), with no floating point. It's a property of the *problem*, not of the algorithm.

**Backwards error → forwards error.** If $\\tilde f$ is backwards stable, $\\tilde f(x) = f(\\tilde x)$ with $\\lVert\\tilde x - x\\rVert/\\lVert x\\rVert = O(\\epsilon_{\\text{machine}})$, then in the limit of high precision
$$\\frac{\\lVert\\tilde f(x) - f(x)\\rVert}{\\lVert f(x)\\rVert} \\lesssim \\kappa(x)\\cdot\\frac{\\lVert\\tilde x - x\\rVert}{\\lVert x\\rVert} = O\\big(\\kappa(x)\\,\\epsilon_{\\text{machine}}\\big).$$
So you lose about $\\log_{10}\\kappa$ digits, and that loss is the problem's fault, not the algorithm's.

**Examples:**
- $f(x) = \\sqrt x$: $\\kappa = \\frac{|1/(2\\sqrt x)|}{\\sqrt x/x} = \\frac12$. Perfectly conditioned.
- Summation $f(x) = \\sum x_i$: $J = (1, \\ldots, 1)$, and in the $L_1$ norm $\\lVert J\\rVert = 1$, so $\\kappa = \\frac{\\sum|x_i|}{|\\sum x_i|}$. This is exactly the bracket in the naive-summation error bound: 1 for nonnegative data, unbounded under cancellation.`,
    pitfall:
      "A large forwards error does not mean the algorithm is bad. If κ ≈ 10¹⁶, even a backwards-stable algorithm in double precision may return no correct digits. Judge an algorithm by its backwards error, and the problem by κ.",
    related: ["mit18335-errors-matrix-condition-number", "mit18335-errors-stability-definitions", "mit18335-errors-naive-summation-error"],
  },
  {
    id: "mit18335-errors-matrix-condition-number",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive the condition number of f(x) = Ax and of solving Ax = b, define κ(A) = ‖A‖‖A⁻¹‖, and show the effect on A = [[1, 1], [1, 1.0001]], b = (2, 2.0001).",
    back: `**Matrix–vector product** $f(x) = Ax$: the Jacobian is $A$ itself, so
$$\\kappa = \\frac{\\lVert A\\rVert\\,\\lVert x\\rVert}{\\lVert Ax\\rVert} \\leq \\lVert A\\rVert\\,\\lVert A^{-1}\\rVert,$$
using $\\lVert x\\rVert = \\lVert A^{-1}Ax\\rVert \\leq \\lVert A^{-1}\\rVert\\,\\lVert Ax\\rVert$ for square invertible $A$.

**Solving** $Ax = b$, i.e. $f(b) = A^{-1}b$: the same argument with $A^{-1}$ in place of $A$ gives $\\kappa \\leq \\lVert A^{-1}\\rVert\\,\\lVert A\\rVert$. Perturbing $A$ instead of $b$ gives the same bound, $\\kappa = \\lVert A\\rVert\\,\\lVert A^{-1}\\rVert$. This number
$$\\kappa(A) = \\lVert A\\rVert\\,\\lVert A^{-1}\\rVert \\;\\;(\\geq 1)$$
is **the condition number of the matrix**. In the 2-norm it equals $\\sigma_{\\max}/\\sigma_{\\min}$.

**Example** (exact arithmetic): $A = \\begin{pmatrix}1 & 1\\\\ 1 & 1.0001\\end{pmatrix}$, $A^{-1} = \\begin{pmatrix}10001 & -10000\\\\ -10000 & 10000\\end{pmatrix}$.
- $\\kappa_\\infty(A) = 2.0001 \\times 20001 = 40004.0001$, and $\\kappa_2(A) \\approx 40002$.
- $b = (2, 2.0001)$ gives $x = (1, 1)$.
- Change $b$ to $(2, 2.0002)$: a relative change of $10^{-4}/2.0001 \\approx 5 \\cdot 10^{-5}$ in $\\lVert b\\rVert_\\infty$ gives $x = (0, 2)$, a **100%** relative change in $\\lVert x\\rVert_\\infty$. The amplification of about $2 \\cdot 10^4$ is within $\\kappa_\\infty$.

In double precision you should expect to lose about 4–5 of the ~16 digits when solving with this $A$, *however* good the solver is.`,
    pitfall:
      "κ(A) is not det(A). A matrix with a tiny determinant can be perfectly conditioned (10⁻³I has det 10⁻³⁰⁰ for n = 100 but κ = 1). Near-singularity is measured relative to the matrix's own size, by σmin/σmax.",
    related: ["mit18335-errors-condition-number", "mit18335-errors-two-norm-rayleigh-quotient", "mit1806-determinants-singular-iff-zero", "mit18335-qr-svd-norms-conditioning"],
  },
  {
    id: "mit18335-errors-two-norm-rayleigh-quotient",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that ‖A‖₂ = √λmax(A*A) and ‖A⁻¹‖₂ = 1/√λmin(A*A), using the Rayleigh quotient of the Hermitian matrix B = A*A. Why is forming A*A explicitly a bad idea?",
    back: `**$B = A^*A$ is Hermitian positive semidefinite.** $B^* = A^*A = B$, and $x^*Bx = (Ax)^*(Ax) = \\lVert Ax\\rVert_2^2 \\geq 0$. Hermitian matrices have real eigenvalues and an orthonormal eigenbasis $q_1, \\ldots, q_n$ (they're diagonalizable). PSD makes the eigenvalues $\\lambda_i \\geq 0$.

**Min–max for the Rayleigh quotient.** For Hermitian $B$, $R(x) = \\frac{x^*Bx}{x^*x}$ satisfies $\\lambda_{\\min} \\leq R(x) \\leq \\lambda_{\\max}$. Proof: expand $x = \\sum c_iq_i$. Then
$$R(x) = \\frac{\\sum_i\\lambda_i|c_i|^2}{\\sum_i|c_i|^2},$$
a weighted average of the $\\lambda_i$, with the bounds attained at the extreme eigenvectors.

**The norms.**
$$\\lVert A\\rVert_2^2 = \\sup_{x\\neq 0}\\frac{\\lVert Ax\\rVert_2^2}{\\lVert x\\rVert_2^2} = \\sup_x\\frac{x^*A^*Ax}{x^*x} = \\lambda_{\\max}(A^*A),$$
and likewise $\\inf_x\\frac{\\lVert Ax\\rVert}{\\lVert x\\rVert} = \\sqrt{\\lambda_{\\min}(A^*A)}$. For invertible $A$, substituting $y = Ax$ gives $\\lVert A^{-1}\\rVert_2 = \\sup_x\\frac{\\lVert x\\rVert}{\\lVert Ax\\rVert} = 1/\\sqrt{\\lambda_{\\min}(A^*A)}$. $\\blacksquare$

These square roots are the **singular values**, so $\\kappa_2(A) = \\sigma_{\\max}/\\sigma_{\\min}$.

**Why not compute via $A^*A$:** its eigenvalues are $\\sigma_i^2$, so
$$\\kappa(A^*A) = \\kappa(A)^2.$$
Example: $A = \\begin{pmatrix}1 & 2\\\\ 3 & 4\\end{pmatrix}$ has $\\sigma^2 = 15 \\pm\\sqrt{221}$, so $\\kappa_2(A) \\approx 14.93$ but $\\kappa_2(A^TA) \\approx 223.0$. Squaring the condition number squares the error amplification, which is why the SVD (one decomposition of $A$ itself) is preferred.`,
    related: ["mit18335-errors-matrix-condition-number", "mit1806-pd-svd-ata-positive-definite", "mit1806-pd-svd-spectral-theorem", "mit18335-qr-svd-norms-conditioning", "mit18335-qr-normal-equations-squaring"],
  },
];
