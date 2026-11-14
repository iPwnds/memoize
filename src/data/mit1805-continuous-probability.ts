// MIT 18.05 Introduction to Probability and Statistics (Spring 2022, Jeremy
// Orloff & Jennifer French) — Part 1: Probability (Classes 1-7). Sourced from
// the course's own per-class reading notes, read page-by-page, with every
// numeric example recomputed (sympy/exact sums). Classes 1-4 (counting,
// probability, conditional probability/Bayes, discrete random variables and
// expectation) overlap heavily with MIT 6.1200J's counting and probability
// units, so this module stays lean there and cross-links; the depth goes to
// what's new: continuous random variables (pdf/cdf, the uniform, exponential
// and normal distributions, transformations, expectation/variance,
// quantiles), the law of large numbers and central limit theorem, joint
// distributions, covariance and correlation. Together with 6.1200J this
// covers KU Leuven's "Kansrekenen I". See src/data/courses.ts.
import type { Card } from "./types";

const MODULE = "mit1805-probability";

export const mit1805ContinuousProbabilityCards: Card[] = [
  // --- Class 4: Discrete random variables ---
  {
    id: "mit1805-probability-discrete-distributions",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Summarize the Bernoulli, binomial and geometric distributions: what each models, its pmf, mean and variance.",
    back: `A **discrete random variable** is a function $X: \\Omega \\to \\mathbb{R}$ taking a discrete set of values (think: a **payoff function** on outcomes). It's described by its **pmf** $p(a) = P(X = a)$ or its **cdf** $F(a) = P(X \\leq a)$ — note the $\\leq$.

| Distribution | Models | pmf | Mean | Variance |
|---|---|---|---|---|
| Bernoulli$(p)$ | one trial: success (1) or failure (0) | $p(1) = p$, $p(0) = 1 - p$ | $p$ | $p(1-p)$ |
| Binomial$(n, p)$ | number of successes in $n$ independent trials | $\\binom{n}{k}p^k(1-p)^{n-k}$ | $np$ | $np(1-p)$ |
| Geometric$(p)$ | number of **failures before** the first success | $(1-p)^kp$, $k = 0, 1, 2, \\ldots$ | $\\frac{1-p}{p}$ | $\\frac{1-p}{p^2}$ |

**Building new random variables from old ones**: sums, products, functions — e.g. the maximum of two dice, $M(i, j) = \\max(i, j)$, has $p(a) = \\frac{2a - 1}{36}$.

The binomial is a **sum of $n$ independent Bernoullis**, which is how its mean and variance follow from linearity and additivity of variance.`,
    pitfall:
      "Geometric conventions differ: 18.05 counts failures BEFORE the first success (mean (1−p)/p); many texts count trials UP TO AND INCLUDING it (mean 1/p, as in 6.1200's 'mean time to failure'). Check which one a formula assumes.",
    related: ["mit6120-probability-random-variables", "mit6120-probability-binomial-distribution", "mit1805-probability-continuous-random-variables"],
  },

  // --- Class 5: Continuous random variables ---
  {
    id: "mit1805-probability-continuous-random-variables",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a continuous random variable via its probability density function. How are the pdf and cdf related, and why is a pdf value not a probability?",
    back: `$X$ is **continuous** if there's a function $f(x)$ — the **probability density function (pdf)** — with
$$P(c \\leq X \\leq d) = \\int_c^d f(x)\\,dx \\quad \\text{for all } c \\leq d.$$
Requirements: $f(x) \\geq 0$ and $\\int_{-\\infty}^{\\infty} f(x)\\,dx = 1$. From discrete to continuous: **replace sums by integrals**.

**The pdf is a density, not a probability**:
- $f(x)\\,dx$ is the probability of a tiny interval of width $dx$ around $x$; $f$ has units of probability per unit of $X$.
- So $f(x)$ can exceed 1 (e.g. uniform on $[0, \\frac12]$ has $f = 2$).
- Any single value has probability 0: $P(X = a) = \\int_a^a f = 0$. Hence $P(c \\leq X \\leq d) = P(c < X < d)$.

**cdf**: $F(x) = P(X \\leq x) = \\int_{-\\infty}^{x} f(t)\\,dt$, and $f(x) = F'(x)$. Properties: non-decreasing, from 0 at $-\\infty$ to 1 at $+\\infty$, and $P(c < X \\leq d) = F(d) - F(c)$.

"Mass" and "density" are exactly as in physics: a discrete pmf puts point masses at values; a pdf spreads the probability continuously like a density along a rod.`,
    related: ["mit1805-probability-gallery-continuous", "mit1805-probability-continuous-expectation", "mit1805-probability-discrete-distributions"],
  },
  {
    id: "mit1805-probability-gallery-continuous",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Give the range, pdf, cdf, mean, variance and typical use of the uniform, exponential and normal distributions.",
    back: `| | Uniform$(a, b)$ | Exponential$(\\lambda)$ | Normal $N(\\mu, \\sigma^2)$ |
|---|---|---|---|
| Range | $[a, b]$ | $[0, \\infty)$ | $(-\\infty, \\infty)$ |
| pdf | $\\frac{1}{b - a}$ | $\\lambda e^{-\\lambda x}$ | $\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-(x-\\mu)^2/2\\sigma^2}$ |
| cdf | $\\frac{x - a}{b - a}$ | $1 - e^{-\\lambda x}$ | $\\Phi\\!\\left(\\frac{x - \\mu}{\\sigma}\\right)$ (no closed form) |
| Mean | $\\frac{a + b}{2}$ | $\\frac{1}{\\lambda}$ | $\\mu$ |
| Variance | $\\frac{(b - a)^2}{12}$ | $\\frac{1}{\\lambda^2}$ | $\\sigma^2$ |
| Models | equally likely values: rounding errors, spinners, the base of random number generators | **waiting times** for a memoryless process: next taxi, radioactive decay ($\\lambda$ = rate) | sums/averages of many small effects (CLT): measurement error, heights |

**Parameters** ($a, b, \\lambda, \\mu, \\sigma$) are exactly what statistics will try to **estimate** from data.

**Standard normal** $Z \\sim N(0, 1)$: pdf $\\phi(z) = \\frac{1}{\\sqrt{2\\pi}}e^{-z^2/2}$, cdf $\\Phi(z)$. Rule of thumb:
$$P(|Z| \\leq 1) \\approx 0.68, \\quad P(|Z| \\leq 2) \\approx 0.95, \\quad P(|Z| \\leq 3) \\approx 0.997.$$
By symmetry, $\\Phi(1) \\approx 0.68 + 0.16 = 0.84$. In R: \`pnorm(x, mu, sigma)\`; in Python: \`scipy.stats.norm.cdf\`.

The normal is "easily the most important distribution" here.`,
    related: ["mit1805-probability-exponential-memoryless", "mit1805-probability-standardization-normal", "mit1805-probability-continuous-random-variables"],
  },
  {
    id: "mit1805-probability-exponential-memoryless",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that the exponential distribution is memoryless: P(X > s + t | X > s) = P(X > t). Why does a scheduled train fail this?",
    back: `For $X \\sim \\exp(\\lambda)$ the **right tail** is $P(X > x) = 1 - F(x) = e^{-\\lambda x}$.

**Theorem.** $P(X > s + t \\mid X > s) = P(X > t)$ for all $s, t \\geq 0$.

**Proof.** The event $\\{X > s + t\\}$ is contained in $\\{X > s\\}$, so
$$P(X > s + t \\mid X > s) = \\frac{P(X > s + t)}{P(X > s)} = \\frac{e^{-\\lambda(s + t)}}{e^{-\\lambda s}} = e^{-\\lambda t} = P(X > t). \\;\\blacksquare$$

**Meaning**: having already waited $s$ minutes for a taxi tells you nothing — the remaining wait has the same distribution as a fresh wait. The process has **no memory** of how long it's been running.

**Not memoryless**: a subway train scheduled about every 12 minutes. After waiting 5 minutes without a train, it is *more* likely to come in the next 5 — elapsed time carries information. A uniform model fits it better.

The exponential is the **only** continuous memoryless distribution (the geometric plays that role among discrete ones), which is why it models radioactive decay, arrivals in a Poisson process, and component failure without wear.`,
    related: ["mit1805-probability-gallery-continuous", "mit6120-probability-conditional-product-rule"],
  },
  {
    id: "mit1805-probability-transforming-rvs",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "X has range [0, 2] and cdf F(x) = x²/4. Find the cdf and pdf of Y = X² with the cdf method, and state the general recipe.",
    back: `**The cdf method** (usually easier than transforming the pdf directly): work from the **definition** of the cdf.

1. Definition: $F_Y(y) = P(Y \\leq y)$.
2. Substitute: $= P(X^2 \\leq y)$.
3. Isolate $X$ (here $X \\geq 0$): $= P(X \\leq \\sqrt{y})$.
4. Recognize $F_X$: $= F_X(\\sqrt{y})$.
5. Plug in: $= \\frac{(\\sqrt{y})^2}{4} = \\frac{y}{4}$ on the range $[0, 4]$.

Then **differentiate**: $f_Y(y) = F_Y'(y) = \\frac14$ — so $Y$ is uniform on $[0, 4]$.

**Direct pdf method** ("$u$-substitution"): probability $f_X(x)\\,dx$ must equal $f_Y(y)\\,dy$. With $y = x^2$, $dx = \\frac{dy}{2\\sqrt y}$ and $f_X(x) = \\frac{x}{2} = \\frac{\\sqrt y}{2}$:
$$f_X(x)\\,dx = \\frac{\\sqrt{y}}{2}\\cdot\\frac{dy}{2\\sqrt{y}} = \\frac14\\,dy. \\;\\checkmark$$

**Same technique**: if $X \\sim \\exp(\\lambda)$ then $Y = X^2$ has $F_Y(y) = 1 - e^{-\\lambda\\sqrt y}$. And standardizing $X \\sim N(5, 3^2)$ as $Z = \\frac{X - 5}{3}$ gives $Z \\sim N(0, 1)$.`,
    pitfall:
      "When the transformation isn't monotonic (e.g. Y = X² with X taking negative values too), step 3 must keep both branches: P(X² ≤ y) = P(−√y ≤ X ≤ √y).",
    related: ["mit1805-probability-continuous-random-variables", "mit1805-probability-standardization-normal"],
  },

  // --- Class 6: Expectation, variance; LLN and CLT ---
  {
    id: "mit1805-probability-continuous-expectation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How are expectation and variance defined for continuous random variables? Compute them for exponential(λ) and uniform(a, b).",
    back: `Replace sums by integrals (with weights $f(x)\\,dx$ instead of $p(x_i)$):
$$E[X] = \\int x\\,f(x)\\,dx, \\qquad \\text{Var}(X) = E[(X - \\mu)^2] = \\int (x - \\mu)^2 f(x)\\,dx = E[X^2] - \\mu^2.$$
All the properties carry over: linearity $E[aX + bY + c] = aE[X] + bE[Y] + c$, $\\text{Var}(aX + b) = a^2\\text{Var}(X)$, additivity of variance for independent variables, and $E[h(X)] = \\int h(x) f(x)\\,dx$.

**Exponential**$(\\lambda)$ (integration by parts):
$$E[X] = \\int_0^\\infty x\\lambda e^{-\\lambda x}\\,dx = \\frac1\\lambda, \\qquad \\text{Var}(X) = \\frac{1}{\\lambda^2}.$$
Mean waiting time = 1 / rate.

**Uniform**$(a, b)$: $E[X] = \\frac{a + b}{2}$ (the midpoint), $\\text{Var}(X) = \\frac{(b - a)^2}{12}$.

**Intuition**: the mean is the **balance point** of the density. For $f(x) = \\frac38x^2$ on $[0, 2]$ the mean is $\\frac32$ — pulled right of the midpoint, because more mass sits on the right.

**Standard normal**: $E[Z] = 0$ by symmetry, $\\text{Var}(Z) = 1$; hence $X = \\mu + \\sigma Z \\sim N(\\mu, \\sigma^2)$ has mean $\\mu$ and variance $\\sigma^2$.`,
    related: ["mit6120-probability-expectation", "mit6120-probability-variance", "mit1805-probability-quantiles"],
  },
  {
    id: "mit1805-probability-quantiles",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the p-th quantile of a distribution? Find the median of exponential(λ), and explain why the median and mean can differ.",
    back: `The **$p$-th quantile** $q_p$ is the value with probability $p$ to its left:
$$F(q_p) = P(X \\leq q_p) = p.$$
The **median** is $q_{0.5}$; the **quartiles** are $q_{0.25}, q_{0.5}, q_{0.75}$; the $p$-th quantile is the $100p$-th **percentile**. For a continuous $X$ with increasing cdf, $q_p = F^{-1}(p)$.

**Exponential**$(\\lambda)$: solve $1 - e^{-\\lambda m} = \\frac12$:
$$m = \\frac{\\ln 2}{\\lambda} \\approx \\frac{0.693}{\\lambda} \\;<\\; \\frac1\\lambda = \\text{mean}.$$
(This is the **half-life** of a decaying isotope.)

**Why they differ**: the mean is pulled toward a long tail; the median isn't. A right-skewed distribution (waiting times, incomes) has mean > median. For a symmetric distribution like the normal, mean = median.

**Standard normal quantiles** used constantly in statistics: $q_{0.975} \\approx 1.96$ (so $P(|Z| \\leq 1.96) = 0.95$) and $q_{0.95} \\approx 1.645$.

Quantiles are **robust** summaries: one huge outlier can move the mean arbitrarily, but barely moves the median.`,
    related: ["mit1805-probability-continuous-expectation", "mit1805-probability-standardization-normal"],
  },
  {
    id: "mit1805-probability-standardization-normal",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is standardization, and how do you use it to compute normal probabilities such as P(X ≤ 115) for X ~ N(100, 15²)?",
    back: `**Standardization**: for $X$ with mean $\\mu$ and standard deviation $\\sigma$,
$$Z = \\frac{X - \\mu}{\\sigma}$$
has mean 0 and standard deviation 1 (by linearity and $\\text{Var}(aX + b) = a^2\\text{Var}(X)$). If $X$ is **normal**, then $Z$ is **standard normal** $N(0, 1)$ — a linear function of a normal variable is normal.

So every normal probability reduces to $\\Phi$:
$$P(X \\leq x) = P\\!\\left(Z \\leq \\frac{x - \\mu}{\\sigma}\\right) = \\Phi\\!\\left(\\frac{x - \\mu}{\\sigma}\\right).$$

**Example**: IQ $X \\sim N(100, 15^2)$. $P(X \\leq 115) = \\Phi(1) \\approx 0.84$, and $P(85 \\leq X \\leq 115) = P(|Z| \\leq 1) \\approx 0.68$.

**The rule of thumb in $\\sigma$ units**: about 68% / 95% / 99.7% of a normal distribution lies within 1 / 2 / 3 standard deviations of the mean.

A **$z$-score** says how many standard deviations a value is from the mean — the common currency for comparing values from different normal distributions, and the basis of $z$-tests.`,
    related: ["mit1805-probability-gallery-continuous", "mit1805-probability-central-limit-theorem", "mit1805-probability-transforming-rvs"],
  },
  {
    id: "mit1805-probability-law-of-large-numbers",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the law of large numbers for i.i.d. random variables. What does it say (and not say) about averages and histograms?",
    back: `**Setup**: $X_1, X_2, \\ldots$ **i.i.d.** (independent, identically distributed) with mean $\\mu$ and standard deviation $\\sigma$. The sample average is $\\bar{X}_n = \\frac{X_1 + \\cdots + X_n}{n}$, with
$$E[\\bar{X}_n] = \\mu, \\qquad \\text{Var}(\\bar{X}_n) = \\frac{\\sigma^2}{n}, \\qquad \\sigma_{\\bar{X}_n} = \\frac{\\sigma}{\\sqrt n}.$$

**Law of large numbers**: for every tolerance $a > 0$,
$$\\lim_{n \\to \\infty} P(|\\bar{X}_n - \\mu| < a) = 1.$$
As $n$ grows, the average is within any fixed tolerance of the true mean with probability approaching 1. Example: for 500 fair coin tosses, the fraction of heads is within 0.1 of 0.5 with probability about 0.99999.

(It follows from Chebyshev: $P(|\\bar{X}_n - \\mu| \\geq a) \\leq \\frac{\\sigma^2}{na^2} \\to 0$.)

**Consequences**:
- Long-run frequencies converge to probabilities — the justification for estimating probabilities by simulation.
- With high probability, the **density histogram** of many samples resembles the underlying pdf or pmf.

**What it doesn't say**: nothing about any single outcome, and no "balancing out" of past deviations (the gambler's fallacy). Early deviations get **diluted** by more data, not corrected.`,
    related: ["mit1805-probability-central-limit-theorem", "mit6120-probability-chebyshev", "mit6120-probability-independence"],
  },
  {
    id: "mit1805-probability-central-limit-theorem",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "State the central limit theorem, and use it to estimate the probability of more than 55 heads in 100 fair coin flips.",
    back: `**CLT**: for i.i.d. $X_i$ with mean $\\mu$ and standard deviation $\\sigma$, sum $S_n$ and average $\\bar{X}_n$, for large $n$:
$$\\bar{X}_n \\approx N\\!\\left(\\mu, \\frac{\\sigma^2}{n}\\right), \\qquad S_n \\approx N(n\\mu, n\\sigma^2), \\qquad Z_n = \\frac{S_n - n\\mu}{\\sigma\\sqrt n} \\approx N(0, 1).$$
Precisely: the cdfs of $Z_n$ converge to $\\Phi$. **Whatever the shape** of the original distribution, sums and averages of many independent copies are approximately normal — the reason the normal is everywhere.

**Coin flips**: $S$ = number of heads in 100 flips; each flip has $\\mu = \\frac12$, $\\sigma = \\frac12$, so $E[S] = 50$ and $\\sigma_S = \\sqrt{100}\\cdot\\frac12 = 5$.
$$P(S > 55) \\approx P\\!\\left(Z > \\frac{55 - 50}{5}\\right) = 1 - \\Phi(1) \\approx 0.16.$$

**Sharper — continuity correction**: $S$ is an integer, so "$S > 55$" means "$S \\geq 56$"; use the midpoint 55.5: $1 - \\Phi(1.1) \\approx 0.136$. The exact binomial value is $0.1356$.

LLN vs CLT: the LLN says $\\bar{X}_n \\to \\mu$; the CLT says **how** it fluctuates around $\\mu$ — normally, with spread $\\sigma/\\sqrt n$. That $\\frac{1}{\\sqrt n}$ is why quadrupling a sample only halves the error.`,
    pitfall:
      "The CLT is about sums/averages of MANY independent variables. It says nothing about the distribution of a single observation, and it can be poor for small n or heavily skewed data.",
    related: ["mit1805-probability-law-of-large-numbers", "mit1805-probability-standardization-normal", "mit6120-probability-chernoff"],
  },

  // --- Class 7: Joint distributions, independence, covariance ---
  {
    id: "mit1805-probability-joint-distributions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are joint pmfs/pdfs and marginal distributions, and how do you test whether two random variables are independent?",
    back: `**Joint distribution** of $X$ and $Y$ (studied together: height and weight, exercise and heart disease):
- discrete: joint pmf $p(x_i, y_j) = P(X = x_i, Y = y_j)$, often as a table;
- continuous: joint pdf $f(x, y)$ with $P((X, Y) \\in \\text{small } dx \\times dy \\text{ rectangle}) = f(x, y)\\,dx\\,dy$, where $f \\geq 0$ and $\\iint f\\,dx\\,dy = 1$.
- joint cdf $F(x, y) = P(X \\leq x, Y \\leq y)$.

**Marginals** — recover one variable by summing/integrating out the other (in a table, the row and column sums written in the **margins**):
$$p_X(x_i) = \\sum_j p(x_i, y_j), \\qquad f_X(x) = \\int f(x, y)\\,dy.$$
Example: $f(x, y) = \\frac83x^3y$ on $[0, 1] \\times [1, 2]$ gives $f_X(x) = \\int_1^2 \\frac83x^3y\\,dy = 4x^3$.

**Independence**: $X$ and $Y$ are independent iff the joint factors into the marginals:
$$p(x_i, y_j) = p_X(x_i)\\,p_Y(y_j) \\quad \\text{or} \\quad f(x, y) = f_X(x)\\,f_Y(y) \\text{ for all } x, y.$$
In the example, $f_Y(y) = \\frac23y$ and $4x^3 \\cdot \\frac23y = \\frac83x^3y$ — independent.

The marginals do **not** determine the joint distribution: many different joints share the same marginals (it's the dependence structure that's lost).`,
    related: ["mit1805-probability-covariance-correlation", "mit6120-probability-random-variables"],
  },
  {
    id: "mit1805-probability-covariance-correlation",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Define covariance and correlation, list the key covariance properties, and compute both for X = heads in flips 1–2, Y = heads in flips 2–3 of three fair coin flips.",
    back: `**Covariance**: $\\text{Cov}(X, Y) = E[(X - \\mu_X)(Y - \\mu_Y)]$ — how much $X$ and $Y$ vary **together** (positive: big with big).

**Properties**:
1. $\\text{Cov}(aX + b, cY + d) = ac\\,\\text{Cov}(X, Y)$.
2. $\\text{Cov}(X_1 + X_2, Y) = \\text{Cov}(X_1, Y) + \\text{Cov}(X_2, Y)$.
3. $\\text{Cov}(X, X) = \\text{Var}(X)$.
4. $\\text{Cov}(X, Y) = E[XY] - \\mu_X\\mu_Y$.
5. $\\text{Var}(X + Y) = \\text{Var}(X) + \\text{Var}(Y) + 2\\,\\text{Cov}(X, Y)$ — for **any** $X, Y$.
6. Independent ⇒ $\\text{Cov}(X, Y) = 0$.

**Correlation** — covariance rescaled to be unitless:
$$\\rho = \\text{Cor}(X, Y) = \\frac{\\text{Cov}(X, Y)}{\\sigma_X\\sigma_Y}, \\qquad -1 \\leq \\rho \\leq 1,$$
with $\\rho = \\pm 1$ exactly when $Y = aX + b$. It measures **linear** association only.

**Example**: with $B_1, B_2, B_3$ the three flips, $X = B_1 + B_2$ and $Y = B_2 + B_3$ share the middle flip. By bilinearity, only $\\text{Cov}(B_2, B_2) = \\text{Var}(B_2) = \\frac14$ survives (independent flips have covariance 0):
$$\\text{Cov}(X, Y) = \\tfrac14, \\qquad \\sigma_X^2 = \\sigma_Y^2 = \\tfrac12, \\qquad \\rho = \\frac{1/4}{1/2} = \\tfrac12.$$
(The joint table gives the same: $\\frac18(0 - 1)(0 - 1) + \\frac18(2 - 1)(2 - 1) = \\frac14$.)`,
    pitfall:
      "Zero covariance does NOT imply independence: X uniform on {−1, 0, 1} and Y = X² have Cov = E[X³] − E[X]E[X²] = 0, yet Y is a function of X.",
    related: ["mit1805-probability-joint-distributions", "mit6120-probability-variance-of-sums", "mit6120-probability-conditional-independence"],
  },
];
