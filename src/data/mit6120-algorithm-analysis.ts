// MIT 6.1200J (formerly 6.042J) Mathematics for Computer Science, Spring
// 2024 — Unit 2: Algorithm Analysis (Lectures 5-7). Sourced from the
// course's own lecture notes, read page-by-page. Lecture 5 covers sums:
// closed forms, guess-and-check, the perturbation method (geometric series,
// annuities), educated guessing (ansatz), double sums and exchanging the
// order of summation, and the integral method. Lecture 6 covers asymptotics:
// harmonic numbers (the overhanging-stack problem), approximating n! and
// Stirling's formula, and the rigorous definitions of ~, O, o, Ω, ω, Θ with
// their limit tests and notation pitfalls. Lecture 7 covers recurrences:
// Towers of Hanoi, plug-and-chug for mergesort, and the master theorem's
// recursion-tree intuition and gaps. The applied side of this material (the
// basic O/Ω/Θ intuition and the three master-theorem cases) already lives in
// Complexity Class, so this module stays lean and cross-links there instead
// of repeating it. See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6120-analysis";

export const mit6120AlgorithmAnalysisCards: Card[] = [
  // --- Lecture 5: Sums ---
  {
    id: "mit6120-analysis-geometric-series-perturbation",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Derive the closed form of the geometric series 1 + x + x² + ⋯ + xⁿ⁻¹ using the perturbation method.",
    back: `**Closed form**: a formula you could type into a calculator — no $\\sum$, no "$\\cdots$", no recursion.

**Guess and check** proves a closed form you already know (by induction), but doesn't help you *find* one. The **perturbation method** does: compare the sum with a slightly modified copy of itself and hope most terms cancel. (Gauss's $1 + 2 + \\cdots + n$ trick is the same idea.)

**Derivation.** Let $S = \\sum_{k=0}^{n-1} x^k$. Multiplying by $x$ shifts every term one place:
$$\\begin{aligned} S &= 1 + x + x^2 + \\cdots + x^{n-1} \\\\ xS &= \\phantom{1 +{}} x + x^2 + \\cdots + x^{n-1} + x^n \\end{aligned}$$
Subtracting, everything except the ends cancels: $S - xS = 1 - x^n$, so for $x \\neq 1$
$$S = \\frac{1 - x^n}{1 - x}.$$

**Infinite version**: if $|x| < 1$ then $x^n \\to 0$, so $\\sum_{k=0}^{\\infty} x^k = \\dfrac{1}{1 - x}$.

Having *found* the formula, an induction proof is now routine: the step reduces to checking $\\frac{1 - x^n}{1 - x} + x^n = \\frac{1 - x^{n+1}}{1 - x}$.`,
    pitfall:
      "The formula divides by 1 − x, so it fails at x = 1 (where the sum is just n), and the infinite version needs |x| < 1 — for |x| ≥ 1 the series diverges.",
    related: ["mit6120-analysis-annuity-present-value", "mit6120-proofs-induction-axiom-sum", "complexity-analysis-aggregate-method"],
  },
  {
    id: "mit6120-analysis-annuity-present-value",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Use the geometric series to value an annuity: m paid now and once a year for n years, at interest rate p. What is a payment that lasts forever worth?",
    back: `**Money now is worth more than money later**: invested at rate $p$, 1 unit today becomes $(1 + p)$ next year. Conversely, 1 unit paid in $k$ years is worth $\\left(\\frac{1}{1+p}\\right)^k$ today.

An $n$-year annuity pays $m$ now, $m$ in 1 year, …, $m$ in $n - 1$ years. With $x = \\frac{1}{1+p}$, its value today is
$$V = m \\sum_{k=0}^{n-1} x^k = m \\cdot \\frac{1 - x^n}{1 - x}.$$

**Lottery example**: 50,000 a year for 20 years at $p = 0.0533$ gives $V \\approx 638{,}340$ — far less than the advertised "1 million". That's also exactly how a loan works: a lump sum now, repaid in installments that account for interest.

**Perpetuity** (1 per year, forever): with $|x| < 1$,
$$V = \\frac{1}{1 - x} = \\frac{1}{1 - \\frac{1}{1+p}} = \\frac{1 + p}{p} \\approx 19.76 \\text{ at } p = 0.0533.$$
Infinitely many payments, finite value — the interest rate shrinks distant payments geometrically. Such perpetual bonds really exist: one issued by a Dutch water authority in 1624 still pays interest (to Yale).`,
    related: ["mit6120-analysis-geometric-series-perturbation"],
  },
  {
    id: "mit6120-analysis-ansatz-sum-of-squares",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find a closed form for 1² + 2² + ⋯ + n² by educated guessing (the ansatz method), and say what still has to be proved.",
    back: `**Ansatz**: guess the *shape* of the answer with unknown coefficients, then solve for them. A sum of $n$ terms each about $n^2$ should be a degree-3 polynomial:
$$\\sum_{k=1}^{n} k^2 = an^3 + bn^2 + cn + d.$$

Plug in $n = 0, 1, 2, 3$ (the empty sum is 0):

| $n$ | equation |
|---|---|
| 0 | $d = 0$ |
| 1 | $a + b + c + d = 1$ |
| 2 | $8a + 4b + 2c + d = 1 + 4 = 5$ |
| 3 | $27a + 9b + 3c + d = 1 + 4 + 9 = 14$ |

Solving: $a = \\tfrac13,\\ b = \\tfrac12,\\ c = \\tfrac16,\\ d = 0$, i.e.
$$\\sum_{k=1}^{n} k^2 = \\frac{n^3}{3} + \\frac{n^2}{2} + \\frac{n}{6} = \\frac{n(n+1)(2n+1)}{6}.$$

**Not proved yet!** The coefficients only guarantee the formula for $n \\in \\{0, 1, 2, 3\\}$ — and the degree-3 guess itself was an assumption. Now prove it by induction. If the induction step goes through, the formula is right; if it fails, the guessed shape was wrong. (The step reduces to checking $\\frac{n(n+1)(2n+1)}{6} + (n+1)^2 = \\frac{(n+1)(n+2)(2n+3)}{6}$.)`,
    pitfall:
      "Fitting a polynomial through a few points always 'works' — any 4 points fit some cubic. It's the induction afterwards that turns the guess into a theorem.",
    related: ["mit6120-analysis-double-sums-exchange-order", "mit6120-proofs-induction-axiom-sum"],
  },
  {
    id: "mit6120-analysis-double-sums-exchange-order",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Evaluate Σ_{j=1}^{n} j·2ʲ by rewriting it as a double sum and exchanging the order of summation.",
    back: `**Double sums**: evaluate the inner sum to a closed form first, then the outer one. When that's hard, **exchange the order**: describe the set of index pairs both ways. E.g. $\\sum_{i=1}^{n} \\sum_{j=i}^{n}$ ranges over $1 \\leq i \\leq j \\leq n$, which is also $\\sum_{j=1}^{n} \\sum_{i=1}^{j}$. So $\\sum_{i=1}^{n} \\sum_{j=i}^{n} j = \\sum_{j=1}^{n} j \\cdot j = \\frac{n(n+1)(2n+1)}{6}$.

**The trick for $\\sum j 2^j$**: there is no inner sum yet — so *create* one by writing $j = \\sum_{i=1}^{j} 1$:
$$\\sum_{j=1}^{n} j\\,2^j = \\sum_{j=1}^{n} \\sum_{i=1}^{j} 2^j = \\sum_{i=1}^{n} \\sum_{j=i}^{n} 2^j \\quad (\\text{exchange: } 1 \\leq i \\leq j \\leq n).$$
The inner sum is now geometric: $\\sum_{j=i}^{n} 2^j = 2^{n+1} - 2^i$. So
$$\\sum_{i=1}^{n} \\left(2^{n+1} - 2^i\\right) = n\\,2^{n+1} - (2^{n+1} - 2) = (n - 1)\\,2^{n+1} + 2. \\;\\blacksquare$$

Check: $n = 2$: $1 \\cdot 2 + 2 \\cdot 4 = 10 = 1 \\cdot 8 + 2$. ✓

The "create an inner sum, then exchange" move is a general tool: weighted sums like $\\sum_j j\\,a_j$ become sums of tail sums $\\sum_i \\sum_{j \\geq i} a_j$, which are often geometric.`,
    pitfall:
      "When exchanging the order, rewrite the index constraints as one chain of inequalities (here 1 ≤ i ≤ j ≤ n) before re-splitting — guessing the new limits directly is the usual source of off-by-one errors.",
    related: ["mit6120-analysis-geometric-series-perturbation", "mit6120-analysis-ansatz-sum-of-squares"],
  },
  {
    id: "mit6120-analysis-integral-method",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the integral bounds for Σ f(k) when f is weakly increasing, weakly decreasing, or summed to infinity, and apply them to Σ √k.",
    back: `When no closed form exists, **bound** the sum by an integral (picture the sum as rectangles of width 1 under/over the curve). Let $S = \\sum_{k=1}^{n} f(k)$ and $I = \\int_1^n f(x)\\,dx$.

**Increasing $f$** (weakly): $\\quad f(1) + I \\;\\leq\\; S \\;\\leq\\; f(n) + I$.

**Decreasing $f$** (weakly): $\\quad f(n) + I \\;\\leq\\; S \\;\\leq\\; f(1) + I$.

**Infinite sums**, $f$ weakly decreasing on $[1, \\infty)$: $\\sum_{k=1}^{\\infty} f(k)$ converges **iff** $\\int_1^{\\infty} f(x)\\,dx$ converges, and then
$$\\int_1^{\\infty} f(x)\\,dx \\;\\leq\\; \\sum_{k=1}^{\\infty} f(k) \\;\\leq\\; f(1) + \\int_1^{\\infty} f(x)\\,dx.$$

*Why (increasing case)*: replacing $f(x)$ by $f(\\lfloor x \\rfloor)$ under-approximates the integral, giving $I \\geq \\sum_{k=1}^{n-1} f(k) = S - f(n)$; replacing it by $f(\\lceil x \\rceil)$ over-approximates, giving $I \\leq S - f(1)$.

**Example**: $\\sum_{k=1}^{n} \\sqrt{k}$ has no known closed form. $\\int_1^n \\sqrt{x}\\,dx = \\tfrac23 n\\sqrt{n} - \\tfrac23$, so
$$1 + \\tfrac23 n\\sqrt{n} - \\tfrac23 \\;\\leq\\; S \\;\\leq\\; \\sqrt{n} + \\tfrac23 n\\sqrt{n} - \\tfrac23 :$$
the sum is a touch more than $\\tfrac23 n^{3/2}$.

**Sharpening**: the bounds' gap is one term ($f(1)$ or $f(n)$). For $\\sum_{k \\geq 1} k^{-2}$ the plain bounds give only $[1, 2]$; summing the first 3 terms exactly and applying the bound to the tail from $k = 4$ narrows it to $\\left[\\tfrac{232}{144}, \\tfrac{241}{144}\\right] \\approx [1.611, 1.674]$. (The true value is $\\pi^2/6 \\approx 1.645$.)`,
    pitfall:
      "Using the increasing-f bounds on a decreasing f (or vice versa) silently swaps which side is the upper bound. Check monotonicity first.",
    related: ["mit6120-analysis-harmonic-numbers", "mit6120-analysis-factorial-stirling"],
  },

  // --- Lecture 6: Asymptotics ---
  {
    id: "mit6120-analysis-harmonic-numbers",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the harmonic numbers Hₙ, how do they arise when stacking blocks over a table edge, and why is Hₙ ~ ln n?",
    back: `**Harmonic number**: $H_n = \\sum_{i=1}^{n} \\frac{1}{i} = 1 + \\frac12 + \\frac13 + \\cdots + \\frac1n$.

**The overhang problem**: stack $n$ blocks of width 1 at the table edge, one per level. The stack is stable iff, for every $k$, the center of mass of the top $k$ blocks lies over block $k+1$ (the table counts as block $n$). Building **greedily** from the top — push the top $k$ blocks as far right as possible, so their center of mass sits exactly on the next block's edge — gives the recurrence $k\\,d_k = \\tfrac{k}{2} + \\sum_{i<k} d_i$ for the offsets. Subtracting the equation for $k - 1$ (perturbation again) simplifies it to $d_k = d_{k-1} + \\frac{1}{2k}$, so the total overhang is
$$d_n = \\tfrac12 H_n.$$
$H_4 = \\tfrac{25}{12} > 2$: just **4 blocks** reach a full block-width past the edge. Since $H_n \\to \\infty$, any overhang is possible in principle ($H_{227} \\approx 6.004$: 227 blocks overhang 3 widths).

**Approximating $H_n$**: there is no closed form, but $f(x) = 1/x$ is decreasing, so the integral method gives
$$\\tfrac1n + \\ln n \\;\\leq\\; H_n \\;\\leq\\; 1 + \\ln n.$$
The error of approximating $H_n$ by $\\ln n$ is less than 1, which becomes negligible as $n \\to \\infty$: we write $H_n \\sim \\ln n$, where $f \\sim g$ means $\\lim_{x \\to \\infty} f(x)/g(x) = 1$.

$H_n$ shows up throughout CS: e.g. the expected number of comparisons in randomized quicksort is $\\sim 2n \\ln n$ via harmonic sums.`,
    pitfall:
      "Hₙ grows without bound but extremely slowly — an overhang of 22 yards needs about e¹³² blocks. 'Diverges' and 'grows usefully' are very different things.",
    related: ["mit6120-analysis-integral-method", "mit6120-analysis-asymptotic-definitions", "sorting-quicksort-randomization"],
  },
  {
    id: "mit6120-analysis-factorial-stirling",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you approximate a product like n!? Derive crude bounds with logs and the integral method, and state Stirling's formula.",
    back: `**Turn the product into a sum** with logs: $\\ln(n!) = \\sum_{i=1}^{n} \\ln i$. No closed form, but $\\ln x$ is increasing, so the integral method applies with
$$\\int_1^n \\ln x\\,dx = [x \\ln x - x]_1^n = n \\ln n - n + 1 \\quad (\\text{integration by parts}).$$
That gives $n \\ln n - n + 1 \\leq \\ln(n!) \\leq (n+1)\\ln n - n + 1$, and exponentiating:
$$\\frac{n^n}{e^{n-1}} \\;\\leq\\; n! \\;\\leq\\; \\frac{n^{n+1}}{e^{n-1}}.$$
That pins $n!$ down within a **factor of $n$** — crude-looking, but very good for a function that grows faster than any exponential.

**Stirling's formula** is much sharper:
$$n! = \\sqrt{2\\pi n}\\left(\\frac{n}{e}\\right)^n e^{\\epsilon(n)}, \\qquad \\frac{1}{12n + 1} \\leq \\epsilon(n) \\leq \\frac{1}{12n},$$
so $n! \\sim \\sqrt{2\\pi n}\\left(\\frac{n}{e}\\right)^n$, with multiplicative error below $1 + \\frac{1}{12n}$ — and it can be evaluated quickly with repeated squaring.

A consequence used constantly in CS: $\\ln(n!) = n \\ln n - n + O(\\log n)$, so $\\log(n!) \\in \\Theta(n \\log n)$. That is exactly why comparison sorting needs $\\Omega(n \\log n)$ comparisons: a decision tree must have at least $n!$ leaves, hence depth at least $\\log_2(n!)$.`,
    related: ["mit6120-analysis-integral-method", "mit6120-analysis-asymptotic-definitions", "sorting-comparison-lower-bound"],
  },
  {
    id: "mit6120-analysis-asymptotic-definitions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give the rigorous definitions of f ∈ O(g), o(g), Ω(g), ω(g), Θ(g) and f ~ g, with their limit tests.",
    back: `Take $g$ positive. Each notation is a **set of functions**, read as an inequality "modulo constant factors and finitely many exceptions":

| Notation | Reads like | Definition | Limit test on $\\lim_{x\\to\\infty} f(x)/g(x)$ |
|---|---|---|---|
| $f \\sim g$ | $=$ (exactly, asymptotically) | limit $= 1$ | **is** the definition |
| $f \\in O(g)$ | $\\leq$ | $\\exists c\\, \\exists M\\, \\forall x > M.\\ \\lvert f(x)\\rvert \\leq c\\,g(x)$ | $\\lim \\lvert f\\rvert/g < \\infty$ ⇒ $O$ (**one-sided**) |
| $f \\in o(g)$ | $<$ | limit $= 0$ | **is** the definition |
| $f \\in \\Omega(g)$ | $\\geq$ | $g \\in O(f)$ | $\\lim \\in (0, \\infty]$ ⇒ $\\Omega$ (**one-sided**) |
| $f \\in \\omega(g)$ | $>$ | $g \\in o(f)$, i.e. limit $= \\infty$ | **is** the definition |
| $f \\in \\Theta(g)$ | $=$ (up to constants) | $f \\in O(g)$ and $f \\in \\Omega(g)$ | $\\lim \\in (0, \\infty)$ ⇒ $\\Theta$ (**one-sided**) |

**Unpacking Big-O**: $c$ says constant factors don't matter (machines differ); $M$ says behavior on small inputs doesn't matter. It looks like an $\\epsilon$–$\\delta$ limit definition but is **not** a limit — $3\\sin x \\in O(1)$ (take $c = 3$) although $\\lim 3\\sin x$ doesn't exist. That's why the limit tests for $O$, $\\Omega$, $\\Theta$ only work in one direction: if the limit doesn't exist, fall back to the definition.

**Relations**: $f \\in o(g) \\Rightarrow f \\in O(g)$ (like $< \\Rightarrow \\leq$), and $f \\in o(g) \\Rightarrow f \\notin \\Omega(g)$.

**Examples**: $10x^3 + 20x^2 + 5 \\in \\Theta(x^3)$; $2 + \\sin x \\in \\Theta(1)$ but $1 + \\sin x \\notin \\Theta(1)$ (it touches 0 infinitely often); any polynomial is in $o(2^x)$; $4^x \\notin O(2^x)$.`,
    pitfall:
      "Analytic number theory uses different definitions (f ∈ Ω(g) iff f ∉ o(g)). The CS definitions above are stronger — be careful when reading math papers.",
    related: ["mit6120-analysis-big-o-proofs", "mit6120-analysis-notation-abuses", "complexity-analysis-big-o", "complexity-analysis-big-omega", "complexity-analysis-big-theta"],
  },
  {
    id: "mit6120-analysis-big-o-proofs",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove from the definition that x² ∉ O(x) and 4ˣ ∉ O(2ˣ), and prove that a finite limit of |f|/g implies f ∈ O(g).",
    back: `**Proving non-membership means negating the definition**: $f \\notin O(g)$ iff for **every** $c$ and $M$ there is some $x > M$ with $\\lvert f(x)\\rvert > c\\,g(x)$.

**$x^2 \\notin O(x)$.** Let $c$ and $M$ be arbitrary. Take $x > \\max(c, M)$. Then $x^2 = x \\cdot x > c \\cdot x$. Since $c, M$ were arbitrary, no constants work. $\\blacksquare$

**$4^x \\notin O(2^x)$.** Let $c, M$ be arbitrary and take $x > \\max(c, M)$ (an integer, so $2^x \\geq x$). Then $4^x = 2^x \\cdot 2^x \\geq x \\cdot 2^x > c \\cdot 2^x$. $\\blacksquare$
(So exponentials with different bases are **not** asymptotically equivalent, unlike logarithms with different bases.)

**Limit test.** Suppose $\\lim_{x\\to\\infty} \\lvert f(x)\\rvert / g(x) = l \\in \\mathbb{R}$. Take $c = l + 1$. By the definition of a limit (with tolerance 1) there is an $M$ such that for all $x > M$, $\\left\\lvert \\frac{\\lvert f(x)\\rvert}{g(x)} - l \\right\\rvert < 1$, so $\\frac{\\lvert f(x)\\rvert}{g(x)} < l + 1 = c$, i.e. $\\lvert f(x)\\rvert < c\\,g(x)$. Hence $f \\in O(g)$. $\\blacksquare$

**Discrete-domain simplification**: when $f, g$ are defined on $\\mathbb{Z}^+$, $f \\in O(g)$ iff $\\exists c'.\\ \\forall x.\\ \\lvert f(x)\\rvert \\leq c'\\,g(x)$ — the finitely many $x \\leq M$ can be absorbed into a larger constant (take $c'$ = the max of $c$ and the finitely many ratios $\\lvert f(x)\\rvert/g(x)$). This fails over $\\mathbb{R}^+$, where "$x \\leq M$" is no longer a finite set.`,
    pitfall:
      "To disprove f ∈ O(g) you must defeat EVERY choice of c and M — choosing particular constants (say c = 100) and finding a violating x proves nothing.",
    related: ["mit6120-analysis-asymptotic-definitions", "mit6120-proofs-propositions-predicates-quantifiers"],
  },
  {
    id: "mit6120-analysis-notation-abuses",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the common abuses of asymptotic notation, and which ones lead to wrong conclusions?",
    back: `- **Never write $f = O(g)$.** $O(g)$ is a *set*, and "=" invites nonsense: $f = O(g)$ and $h = O(g)$ would "give" $f = h$ (e.g. $n = O(n^2)$ and $n^2 = O(n^2)$, so $n = n^2$?). Big-O does **not** behave like equality.
- **$f \\leq O(g)$ is more acceptable** — Big-O does behave somewhat like $\\leq$ — but it still doesn't obey every rule of inequalities.
- **$f \\geq O(g)$ means nothing**: the zero function is in $O(g)$, so it only says $\\lvert f\\rvert \\geq 0$. $O$ and $o$ are **only upper bounds**; $\\Omega$ and $\\omega$ are **only lower bounds**. "This algorithm is at least $O(n^2)$" is meaningless — you mean $\\Omega(n^2)$.
- **Writing $n \\in O(n^2)$** instead of the pedantic $(n \\mapsto n) \\in O(n \\mapsto n^2)$ is an accepted, harmless shorthand — prefer it.
- **$f \\in g(O(h))$** means $f \\in \\{g \\circ h' \\mid h' \\in O(h)\\}$, which is **not** the same as $f \\in O(g \\circ h)$. Example: $2^{O(n)}$ contains $4^n = 2^{2n}$, but $4^n \\notin O(2^n)$.`,
    pitfall:
      "Saying 'quicksort is O(n log n)' when you mean its average case, while its worst case is Θ(n²), is a precision error, not a notation error — always say which case (worst/average/best) the bound describes.",
    related: ["mit6120-analysis-asymptotic-definitions", "complexity-analysis-big-o"],
  },

  // --- Lecture 7: Recurrences ---
  {
    id: "mit6120-analysis-towers-of-hanoi",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Give the recursive Towers of Hanoi algorithm, set up its recurrence, and prove T(n) = 2ⁿ − 1.",
    back: `**Puzzle**: move $n$ disks (sizes 1..$n$) from post A to post B, one at a time, never placing a larger disk on a smaller one.

**Algorithm, defined by induction** — $H(n, A, B)$ with C the third post:
1. If $n = 1$: move disk 1 from A to B.
2. Otherwise: $H(n-1, A, C)$ (move the top $n-1$ out of the way); move disk $n$ from A to B; $H(n-1, C, B)$.

It's correct by induction: disk $n$ is the largest, so it never blocks the smaller disks, and the $(n-1)$-disk solution works between **any** two posts.

**Recurrence**: $T(1) = 1$ and $T(n) = 2T(n-1) + 1$, giving $1, 3, 7, 15, 31, \\ldots$

**Guess**: $T(n) = 2^n - 1$. **Proof by induction.** Base: $T(1) = 1 = 2^1 - 1$. Step: assume $T(n) = 2^n - 1$; then $T(n+1) = 2(2^n - 1) + 1 = 2^{n+1} - 1$. $\\blacksquare$

(The algorithm is also optimal — no strategy uses fewer moves.) For the legendary 64 disks at one move per second: $2^{64} - 1$ seconds, about half a trillion years.

**Why exponential**: the recursion tree has **linearly many levels** ($n$, $n-1$, …) and doubles at each, so $2^n$ nodes. Divide-and-conquer recurrences shrink the size by a **factor** each level, giving log depth and polynomially many nodes — that is the essential difference.`,
    pitfall:
      "T(n) = 2T(n−1) + 1 is NOT a master-theorem recurrence: it subtracts 1 instead of dividing by b. Forcing it into the master theorem gives a wildly wrong answer.",
    related: ["mit6120-analysis-master-theorem-intuition", "mit6120-analysis-plug-and-chug-mergesort", "recursion-dc-fundamentals"],
  },
  {
    id: "mit6120-analysis-plug-and-chug-mergesort",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Solve mergesort's comparison recurrence T(1) = 0, T(n) = 2T(n/2) + n − 1 (n a power of 2) by plug-and-chug.",
    back: `**Why this recurrence**: merging two sorted lists of total length $n$ takes at most $n - 1$ comparisons (each comparison outputs one element; the last is free), plus two recursive sorts of size $n/2$. Correctness is also just induction: MS(2ᵏ) works because MS(2ᵏ⁻¹) works and merge is correct.

**Plug and chug** — substitute the recurrence into itself until a pattern appears:
$$\\begin{aligned} T(n) &= (n - 1) + 2T(n/2) \\\\ &= (n - 1) + (n - 2) + 4T(n/4) \\\\ &= (n - 1) + (n - 2) + (n - 4) + 8T(n/8) \\\\ &= \\sum_{i=0}^{k-1} (n - 2^i) + 2^k\\,T(n/2^k). \\end{aligned}$$
Choose $k = \\log_2 n$ so $n/2^k = 1$ and $T(1) = 0$:
$$T(n) = kn - (1 + 2 + \\cdots + 2^{k-1}) = n\\log_2 n - (n - 1) = n\\log_2 n - n + 1.$$

| $n$ | Mergesort $n\\log_2 n - n + 1$ | Selection sort $n(n-1)/2$ |
|---|---|---|
| 8 | 17 | 28 |
| 16 | 49 | 120 |
| 32 | 129 | 496 |

**Then check it**: plug-and-chug *discovers* a formula, but the "$\\cdots$" step is informal — confirm the result by induction (guess and check).`,
    pitfall:
      "Plug-and-chug as shown assumes n is a power of 2. For general n the recurrence has ceilings, T(n) = 2T(⌈n/2⌉) + n − 1, and you need the master theorem or a careful induction to conclude Θ(n log n).",
    related: ["mit6120-analysis-master-theorem-intuition", "sorting-merge-overview", "complexity-analysis-recurrence-relations"],
  },
  {
    id: "mit6120-analysis-master-theorem-intuition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain the master theorem's three cases through the recursion tree, and give a divide-and-conquer recurrence it cannot solve.",
    back: `**Statement**: for $T(n) = a\\,T(\\lfloor n/b \\rfloor) + f(n)$ with constants $a \\geq 1$, $b > 1$ (ceilings work too):
1. $f(n) \\in O(n^{\\log_b a - \\epsilon})$ for some $\\epsilon > 0$ ⇒ $T(n) \\in \\Theta(n^{\\log_b a})$.
2. $f(n) \\in \\Theta(n^{\\log_b a})$ ⇒ $T(n) \\in \\Theta(n^{\\log_b a}\\log n)$.
3. $f(n) \\in \\Omega(n^{\\log_b a + \\epsilon})$ for some $\\epsilon > 0$, **and** $a f(\\lfloor n/b \\rfloor) \\leq c f(n)$ for some $c < 1$ and all large $n$ ⇒ $T(n) \\in \\Theta(f(n))$.

**Recursion-tree intuition**: level $k$ has $a^k$ nodes of size $n/b^k$; the depth is $\\log_b n$, so there are $\\Theta(a^{\\log_b n}) = \\Theta(n^{\\log_b a})$ leaves. Level work is $f(n), a f(n/b), a^2 f(n/b^2), \\ldots$
- **Case 1** — $f$ grows slowly: the leaves dominate, cost $\\Theta(\\#\\text{leaves})$.
- **Case 3** — $f$ grows fast: the root dominates, cost $\\Theta(f(n))$.
- **Case 2** — balanced: every level does about the same work, cost $\\Theta(f(n) \\cdot \\text{depth})$.

**Examples**: mergesort $2T(\\lceil n/2 \\rceil) + n - 1$ → case 2, $\\Theta(n \\log n)$. Binary search $T(\\lceil n/2 \\rceil) + 1$ → case 2 with $n^{\\log_2 1} = 1$, $\\Theta(\\log n)$. Karatsuba $3T(\\lceil n/2 \\rceil) + \\Theta(n)$ → case 1, $\\Theta(n^{\\log_2 3})$.

**Gaps**: $T(n) = 2T(n/2) + n\\log n$ is **not** covered. $n^{\\log_2 2} = n$, and $f(n) = n \\log n$ is asymptotically larger than $n$ (so not case 2) but only by a log factor, not a polynomial $n^{\\epsilon}$ (so not case 3). Fall back on a recursion-tree sum or induction — it comes out to $\\Theta(n \\log^2 n)$.`,
    pitfall:
      "Case 3 has an extra 'regularity' condition (a·f(n/b) ≤ c·f(n)). It holds for ordinary polynomial f, but it's part of the theorem — forgetting it is a classic exam deduction.",
    related: [
      "complexity-analysis-master-theorem-overview",
      "complexity-analysis-master-theorem-case1",
      "complexity-analysis-master-theorem-case2",
      "complexity-analysis-master-theorem-case3",
      "mit6120-analysis-towers-of-hanoi",
      "recursion-dc-karatsuba",
    ],
  },
];
