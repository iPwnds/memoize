// MIT 18.05 Introduction to Probability and Statistics (Spring 2022, Jeremy
// Orloff & Jennifer French) — Part 3: Statistics II, Frequentist Inference
// (Classes 17-26), the course's final module. Sourced from the course's own
// per-class reading notes, read page-by-page; every numeric example was
// recomputed (exact binomial sums, normal cdf, a simulated bootstrap).
// Class 17 covers the frequentist school and null hypothesis significance
// testing (rejection regions, type I/II errors, significance, power,
// p-values); Class 18 z- and t-tests; Class 19 a catalog of common tests and
// how to choose one; Class 20 the frequentist-vs-Bayesian comparison;
// Class 22 confidence intervals for normal data; Class 23 the meaning of
// confidence and large-sample/Bernoulli intervals; Class 24 the bootstrap;
// Class 26 linear regression by least squares. Some worked numbers (the
// coin test's power, the z-test, the bootstrap run) are this module's own
// examples in the notes' style. Covers KU Leuven's "Statistiek &
// data-analyse". See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit1805-freq";

export const mit1805FrequentistInferenceCards: Card[] = [
  // --- Class 17: The frequentist school; NHST I ---
  {
    id: "mit1805-freq-nhst-ingredients",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "List the ingredients of a null hypothesis significance test, and design one for 'is this coin fair?' with 10 tosses.",
    back: `**Frequentists** won't put probabilities on hypotheses (no prior). They reason only with $P(\\text{data} \\mid \\text{hypothesis})$: **how surprising is this data if a default hypothesis is true?** The standard framework is Neyman–Pearson **NHST**.

**Ingredients**:
- $H_0$, the **null hypothesis** — the cautious default ("nothing interesting is going on").
- $H_A$, the **alternative** — accepted if we reject $H_0$.
- $X$, the **test statistic** — computed from the data, hence random.
- The **null distribution** — the distribution of $X$ assuming $H_0$.
- The **rejection region** — values of $X$ that are **extreme under $H_0$** and more likely under $H_A$. If $X$ lands there, reject $H_0$; otherwise, **do not reject**.

**Coin**: $H_0$: $\\theta = 0.5$; $H_A$: $\\theta \\neq 0.5$ (two-sided). $X$ = number of heads in 10 tosses, with null distribution Binomial(10, 0.5). Expect about 5 under $H_0$, so put both **tails** in the rejection region: $\\{0, 1, 2, 8, 9, 10\\}$.

**Significance level** $\\alpha = P(\\text{reject } H_0 \\mid H_0)$, the total null probability of the rejection region:
$$\\alpha = \\frac{2\\left[\\binom{10}{0} + \\binom{10}{1} + \\binom{10}{2}\\right]}{2^{10}} = \\frac{112}{1024} \\approx 0.109.$$
Usually you fix $\\alpha$ first (e.g. 0.05) and choose the rejection region to match.`,
    related: ["mit1805-freq-errors-significance-power", "mit1805-freq-p-values"],
  },
  {
    id: "mit1805-freq-errors-significance-power",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define type I and type II errors, significance level and power. Compute the power of the 10-toss coin test against θ = 0.7 and θ = 0.9.",
    back: `| | $H_0$ true | $H_A$ true |
|---|---|---|
| **reject $H_0$** | **Type I error** (false alarm) | correct |
| **don't reject $H_0$** | correct | **Type II error** (missed effect) |

- **Significance level** $\\alpha = P(\\text{reject } H_0 \\mid H_0)$ = P(type I error). Want it **small**.
- **Power** $= P(\\text{reject } H_0 \\mid H_A)$ = 1 − P(type II error). Want it **near 1**.

Analogies: power = probability of **detecting something interesting when it's there**; significance = probability of **falsely claiming** something interesting. Or a criminal trial: $H_0$ = innocent; convicting the innocent is a type I error, acquitting the guilty a type II.

**Power depends on the specific alternative**. For the rejection region $\\{0, 1, 2, 8, 9, 10\\}$:
- $\\theta = 0.7$: $P(X \\in \\text{region} \\mid \\theta = 0.7) \\approx 0.38$ — the test usually **misses** a moderately biased coin.
- $\\theta = 0.9$: power $\\approx 0.93$ — a strongly biased coin is usually caught.

**The trade-off**: enlarging the rejection region raises power but also raises $\\alpha$. For fixed $\\alpha$, the way to more power is **more data**.`,
    pitfall:
      "'Not rejecting H₀' is not 'accepting H₀'. A low-power test (small sample) fails to reject even when H₀ is false — absence of evidence is not evidence of absence.",
    related: ["mit1805-freq-nhst-ingredients", "mit1805-freq-p-values"],
  },
  {
    id: "mit1805-freq-p-values",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the p-value precisely, state the p-test, and list what a p-value is NOT.",
    back: `**Definition**: the $p$-value is the probability, **assuming the null hypothesis**, of seeing data **at least as extreme** as the data actually observed. ("At least as extreme" — one tail or both — depends on the design.)

**P-test**: reject $H_0$ iff $p < \\alpha$. This is equivalent to "the test statistic lies in the rejection region at level $\\alpha$", and the $p$-value additionally tells you **how far** into the tail you are.

**Example**: $H_0$: $\\mu = 100$ with $\\sigma = 15$ known; $n = 9$ observations with $\\bar{x} = 112$. Then $z = \\frac{112 - 100}{15/\\sqrt9} = 2.4$, giving a one-sided $p = P(Z \\geq 2.4) \\approx 0.008$ and a two-sided $p \\approx 0.016$. Reject at $\\alpha = 0.05$.

**What a $p$-value is NOT**:
- **not** $P(H_0 \\mid \\text{data})$ — that's a posterior, and needs a prior;
- **not** the probability that the result is "due to chance";
- **not** a measure of **effect size** or importance — a tiny, useless effect gives $p \\approx 0$ with enough data;
- and $p > \\alpha$ does **not** show $H_0$ is true.

The $p$-value also depends on the **experimental design**: the same data can give different $p$-values under different stopping rules ("toss 12 times" vs "toss until the 3rd tails").`,
    pitfall:
      "The most common error — even in published research — is reading p = 0.03 as '97% chance the effect is real'. Explaining the difference between a p-value and a posterior probability is a stated learning goal of 18.05.",
    related: ["mit1805-freq-errors-significance-power", "mit1805-freq-frequentist-vs-bayesian", "mit1805-freq-z-and-t-tests"],
  },

  // --- Class 18: NHST II ---
  {
    id: "mit1805-freq-z-and-t-tests",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "When do you use a z-test, a one-sample t-test or a two-sample t-test? What is the t-distribution and why does it have fatter tails?",
    back: `All tests follow the **same pattern**; only the test statistic and its null distribution change. Each one **assumes** something about the data — usually independent **normal** samples.

| Test | Use | Statistic | Null distribution |
|---|---|---|---|
| **$z$-test** | mean of normal data, **$\\sigma$ known** | $z = \\dfrac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt n}$ | $N(0, 1)$ |
| **one-sample $t$-test** | mean of normal data, **$\\sigma$ unknown** | $t = \\dfrac{\\bar{x} - \\mu_0}{s/\\sqrt n}$ | $t(n - 1)$ |
| **two-sample $t$-test** | do two normal groups have equal means? | difference of means / pooled standard error | $t(n_x + n_y - 2)$ (equal variances) |

$s^2 = \\frac{1}{n - 1}\\sum(x_i - \\bar{x})^2$ is the **sample variance**.

**The $t$-distribution** $t(df)$: symmetric and bell-shaped like $N(0, 1)$ but with **heavier tails**, governed by the **degrees of freedom** $df$. As $df \\to \\infty$ it approaches the standard normal.

**Why fatter tails**: replacing the known $\\sigma$ by the estimate $s$ adds uncertainty — $s$ itself varies from sample to sample, so extreme $t$-values are more common than extreme $z$-values. Small samples pay for it with wider rejection regions.

There's also a two-sample $t$-test for **unequal variances** (Welch's). In practice, know **when** a test applies and run it in software (R: \`t.test\`).`,
    related: ["mit1805-freq-p-values", "mit1805-freq-choosing-a-test", "mit1805-freq-confidence-intervals-normal"],
  },

  // --- Class 19: NHST III ---
  {
    id: "mit1805-freq-choosing-a-test",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you choose an appropriate significance test? Describe the general recipe and what ANOVA and chi-square goodness-of-fit tests are for.",
    back: `**The universal recipe**: (1) state $H_0$ and $H_A$; (2) pick a test statistic whose **null distribution is known**, given the assumptions; (3) fix $\\alpha$ and the rejection region (or compute a $p$-value); (4) collect data and decide.

**Choosing a test = matching the question and the assumptions.** A few from the catalog:
- **$z$/$t$-tests** — one or two means of normal data (σ known / unknown).
- **ANOVA ($F$-test for equal means)** — are the means of $n$ groups **all** equal? Assumes independent normal samples with a **common variance**. Statistic: between-group variance / within-group variance, with an $F$ null distribution. It doesn't say *which* means differ.
- **Chi-square ($\\chi^2$) goodness of fit** — do observed **counts** match the counts a model predicts? (E.g. is a die fair?)
- **$\\chi^2$ test for homogeneity/independence** — do several groups share the same distribution of categories?
- **$F$-test for equal variances** of two normal groups.

**Example (ANOVA)**: pain scores for 3 procedures, 5 patients each, give $F = 0.325$, $p = 0.729$ — no reason to reject equal means. But with only 5 per group, that does **not** show the treatments are equally good; the test simply has little power.

Every test carries assumptions (normality, independence, equal variances). Check them, or use a method that needs fewer — like the bootstrap.`,
    pitfall:
      "Running many tests and reporting the 'significant' ones inflates false positives: at α = 0.05, about 1 in 20 true nulls will be rejected by chance (the multiple-testing problem).",
    related: ["mit1805-freq-z-and-t-tests", "mit1805-freq-errors-significance-power", "mit1805-freq-bootstrap"],
  },

  // --- Class 20: Comparison of frequentist and Bayesian inference ---
  {
    id: "mit1805-freq-frequentist-vs-bayesian",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare frequentist and Bayesian inference: what each computes, their main critiques and defenses, and how you'd explain a p-value vs a posterior to a doctor.",
    back: `**Both** start from Bayes' theorem; they split over **probabilities of hypotheses**.

| | Bayesian | Frequentist |
|---|---|---|
| Computes | posterior $P(\\mathcal{H} \\mid \\mathcal{D})$ | likelihoods $P(\\mathcal{D} \\mid \\mathcal{H})$ only — $p$-values, confidence intervals |
| Needs | a prior | a fully specified experimental design |
| Interval | credible interval: $P(\\theta \\in I \\mid \\text{data}) = 0.95$ | confidence interval: the *procedure* covers $\\theta$ 95% of the time |

**Critiques and defenses**:
- **Bayesian** — critique: the prior is subjective, so different people reach different conclusions; and some object to probabilities of hypotheses at all. Defense: probabilities of hypotheses are **exactly what decisions need**; given a prior, the reasoning is **deductively rigorous**; and priors are stated openly and can be tested for robustness.
- **Frequentist** — critique: it's ad hoc ("more extreme" isn't well defined), $p$-values depend on the **stopping rule** and intentions, and experiments must be fully specified in advance. Defense: it's **objective** — everyone gets the same $p$-value — and it's the established standard for scientific evidence.

**To a doctor**: a positive screening test's $p$-value answers *"if you were healthy, how unusual would this result be?"* The question that matters — *"given this result, how likely am I to be sick?"* — is a **posterior probability**, and it depends heavily on the base rate (the prior).`,
    related: ["mit1805-freq-p-values", "mit1805-bayes-choosing-priors", "mit1805-freq-confidence-interval-meaning"],
  },

  // --- Class 22: Confidence intervals for normal data ---
  {
    id: "mit1805-freq-confidence-intervals-normal",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive the z confidence interval for the mean of normal data from the z-test's non-rejection region, and compute a 95% interval for n = 9, x̄ = 112, σ = 15.",
    back: `**Interval statistic**: a pair of statistics $[L, U]$ computed from the data. It's **random** — new data gives a new interval — and (frequentist rule) may not depend on unknown parameters: $\\bar{x} \\pm \\frac{2\\sigma}{\\sqrt n}$ qualifies only if $\\sigma$ is known; $\\bar{x} \\pm \\frac{2s}{\\sqrt n}$ always does.

**From test to interval**: data $x_1, \\ldots, x_n \\sim N(\\mu, \\sigma^2)$, $\\sigma$ known. A level-$\\alpha$ two-sided $z$-test does **not reject** $\\mu_0$ exactly when
$$|\\bar{x} - \\mu_0| \\leq z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}.$$
The **$(1 - \\alpha)$ confidence interval** collects every $\\mu_0$ that would not be rejected:
$$\\left[\\bar{x} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n},\\ \\bar{x} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt n}\\right], \\qquad z_{0.025} \\approx 1.96.$$
**Confidence level $1 - \\alpha$ ↔ significance level $\\alpha$**: that's why 0.95 and 0.05 go together.

**Example**: $\\bar{x} = 112$, $\\sigma = 15$, $n = 9$, so the standard error is $\\frac{15}{3} = 5$:
$$112 \\pm 1.96 \\cdot 5 = [102.2,\\ 121.8].$$
It excludes 100 — consistent with the two-sided $z$-test rejecting $\\mu_0 = 100$ ($p \\approx 0.016$).

**Unknown $\\sigma$**: the **$t$ interval** $\\bar{x} \\pm t_{\\alpha/2}(n - 1)\\frac{s}{\\sqrt n}$ (wider, for the extra uncertainty). For the **variance** of normal data there's a $\\chi^2$ interval.`,
    related: ["mit1805-freq-confidence-interval-meaning", "mit1805-freq-z-and-t-tests", "mit1805-probability-standardization-normal"],
  },

  // --- Class 23: Confidence intervals — three views; non-normal data ---
  {
    id: "mit1805-freq-confidence-interval-meaning",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does '95% confidence interval' actually mean? Why is it wrong to say there's a 95% probability that μ lies in [102.2, 121.8]?",
    back: `**Correct meaning**: the **procedure** that produces the interval captures the true parameter in 95% of repeated experiments. If many labs each drew a sample and computed $\\bar{x} \\pm 1.96\\frac{\\sigma}{\\sqrt n}$, about 95% of their intervals would contain the true $\\mu$.

**The confidence level is never the probability that the parameter is in a specific computed interval.** Once you've computed $[102.2, 121.8]$, either $\\mu$ is in it or it isn't — the frequentist treats $\\mu$ as a fixed unknown constant, not a random variable, so there's no probability left to assign.

**Three views of the same interval**:
1. **Pivoting**: $\\frac{\\bar{x} - \\mu}{\\sigma/\\sqrt n} \\sim N(0, 1)$, so $P(|\\bar{x} - \\mu| \\leq 1.96\\frac{\\sigma}{\\sqrt n}) = 0.95$ — a probability about the **random interval**, before seeing the data.
2. **Inverting a test**: the set of null values $\\mu_0$ a level-0.05 test would not reject.
3. **Coverage**: the long-run fraction of intervals that contain $\\mu$.

**Width ↔ evidence**: a narrow interval at high confidence is strong evidence that $\\mu$ is near $\\bar{x}$. The width shrinks like $\\frac{1}{\\sqrt n}$.

"95% probability that $\\mu$ is in this interval" is a statement a **Bayesian credible interval** can make (with a prior); a confidence interval cannot.`,
    pitfall:
      "Also wrong: '95% of the data lies in the interval' or '95% of future sample means will fall in it'. It's about capturing the parameter, by the procedure, over repetitions.",
    related: ["mit1805-freq-confidence-intervals-normal", "mit1805-bayes-probability-intervals", "mit1805-freq-frequentist-vs-bayesian"],
  },
  {
    id: "mit1805-freq-polling-large-sample-ci",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive the conservative confidence interval for a Bernoulli proportion and the rule-of-thumb 95% interval x̄ ± 1/√n. What margin of error does a poll of 400 people have?",
    back: `**Polling**: responses are Bernoulli($\\theta$) — 1 for candidate A, 0 otherwise — and we estimate $\\theta$ by $\\bar{x}$, the fraction in the sample.

**Conservative normal interval**: by the CLT, $\\bar{x} \\approx N\\!\\left(\\theta, \\frac{\\theta(1 - \\theta)}{n}\\right)$. The unknown standard deviation $\\sqrt{\\theta(1 - \\theta)}$ is **at most $\\frac12$** (maximized at $\\theta = \\frac12$), so replacing it by $\\frac12$ gives an interval that is **at least** as wide as needed:
$$\\bar{x} \\pm z_{\\alpha/2}\\cdot\\frac{1}{2\\sqrt n}.$$

**Rule of thumb** (95%, $z_{0.025} = 1.96 \\approx 2$):
$$\\bar{x} \\pm \\frac{1}{\\sqrt n}.$$
A poll of $n = 400$ has a margin of error of about $\\frac{1}{20} = 5$ percentage points (exactly $1.96 \\cdot \\frac{0.5}{20} = 0.049$). Halving the margin to 2.5 points needs **four times** the sample (1600).

**Large-sample interval for any mean**: for a large sample from an **unknown** (not necessarily normal) distribution, the CLT makes $\\bar{x}$ approximately normal, so
$$\\bar{x} \\pm z_{\\alpha/2}\\frac{s}{\\sqrt n}$$
is an approximate confidence interval — the justification for $z$-intervals far beyond normal data.`,
    pitfall:
      "The margin of error covers only RANDOM sampling error. Biased samples (who answers polls), question wording and late swings are not in it — real polling error is usually larger.",
    related: ["mit1805-freq-confidence-intervals-normal", "mit1805-probability-central-limit-theorem"],
  },

  // --- Class 24: Bootstrap confidence intervals ---
  {
    id: "mit1805-freq-bootstrap",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What is the bootstrap principle? Compute a basic (empirical) bootstrap 90% confidence interval for the mean of 1, 1, 2, 3, 3, 3, 3, 4, 7, 7.",
    back: `**Problem**: to build a confidence interval for a statistic (mean, median, …) you need the distribution of its error $\\bar{x} - \\mu$, which depends on the unknown underlying distribution $F$.

**Bootstrap principle** (Efron, 1979): use the data's own **empirical distribution** $F^*$ (each data point with probability $\\frac1n$) as a stand-in for $F$. The variation of the statistic under resampling from $F^*$ approximates its variation under $F$:
$$\\bar{x}^* - \\bar{x} \\;\\approx\\; \\bar{x} - \\mu \\quad (\\text{in distribution}).$$

**Empirical (nonparametric) bootstrap**:
1. **Resample**: draw $n$ values **with replacement** from the data (a bootstrap sample $x_1^*, \\ldots, x_n^*$).
2. Compute the statistic, e.g. $\\bar{x}^*$, and record $\\delta^* = \\bar{x}^* - \\bar{x}$.
3. Repeat thousands of times — cheap with a computer.
4. With $\\delta^*_{0.05}$ and $\\delta^*_{0.95}$ the quantiles of $\\delta^*$, the **basic bootstrap** 90% interval is
$$[\\bar{x} - \\delta^*_{0.95},\\ \\bar{x} - \\delta^*_{0.05}].$$

**Example**: $\\bar{x} = 3.4$. Running 20,000 resamples gives $\\delta^*_{0.05} \\approx -1.0$ and $\\delta^*_{0.95} \\approx 1.1$, so the interval is about $[2.3, 4.4]$. (The **percentile** bootstrap instead uses the quantiles of $\\bar{x}^*$ directly.)

**Parametric bootstrap**: if you trust a model family (e.g. exponential), fit its parameter, then resample from the **fitted model** instead of the raw data.

It needs no normality assumption and works for awkward statistics (medians, ratios) where no formula exists.`,
    pitfall:
      "Note the reversed order in the basic interval: the UPPER quantile of δ* sets the LOWER endpoint. Mixing these up gives an interval that's reflected around x̄.",
    related: ["mit1805-freq-confidence-interval-meaning", "mit1805-freq-choosing-a-test", "mit1805-probability-law-of-large-numbers"],
  },

  // --- Class 26: Linear regression ---
  {
    id: "mit1805-freq-linear-regression",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does simple linear regression by least squares assume and minimize? How can 'linear' regression fit parabolas and exponentials, and what are homoscedasticity and heteroscedasticity?",
    back: `**Model**: bivariate data $(x_i, y_i)$ with $x_i$ **not random** and
$$y_i = a + bx_i + E_i, \\qquad E_i \\text{ independent errors with mean } 0 \\text{ and the same variance } \\sigma^2.$$
**Least squares** chooses $a, b$ minimizing the **total squared error**
$$S(a, b) = \\sum_{i=1}^{n}(y_i - a - bx_i)^2.$$
Setting $\\partial S/\\partial a = \\partial S/\\partial b = 0$ gives
$$\\hat{b} = \\frac{s_{xy}}{s_{xx}} = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2}, \\qquad \\hat{a} = \\bar{y} - \\hat{b}\\bar{x}.$$
The line passes through $(\\bar{x}, \\bar{y})$; the slope is a covariance over a variance. (These are exactly the normal equations $A^TA\\hat{x} = A^Tb$ of 18.06.)

Example from the notes: US stamp prices since 1960 fit $y = -0.214 + 0.882x$ cents ($x$ = years since 1960), "predicting" 53.6 cents in 2021.

**"Linear" means linear in the parameters**, not in $x$:
- parabola $y = ax^2 + bx + c$ — still least squares in $a, b, c$;
- exponential growth $y = ce^{ax}$ — fit $\\ln y = \\ln c + ax$.

**Homoscedasticity**: errors have the **same variance** for every $x$ (the assumption above). **Heteroscedasticity**: the spread changes with $x$ (e.g. grows with it) — the fit still runs, but the usual error estimates become unreliable.`,
    pitfall:
      "Regression shows association, not causation, and extrapolating far beyond the range of the data (like predicting decades ahead) is unreliable.",
    related: ["mit1806-orthogonality-least-squares-line", "mit1805-probability-covariance-correlation", "mit1805-bayes-mle-continuous"],
  },
];
