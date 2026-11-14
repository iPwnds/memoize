// MIT 18.05 Introduction to Probability and Statistics (Spring 2022, Jeremy
// Orloff & Jennifer French) — Part 2: Statistics I, Maximum Likelihood and
// Bayesian Inference (Classes 10-16). Sourced from the course's own
// per-class reading notes, read page-by-page, with every numeric example
// recomputed exactly. Class 10 covers the phases of statistics and maximum
// likelihood estimates; Class 11 Bayesian updating with discrete priors
// (the update table); Class 12 predictive probabilities, odds and Bayes
// factors; Classes 13-14 continuous priors and the law of total probability
// for densities; Class 15 conjugate priors (beta-binomial, normal-normal);
// Class 16 choosing priors and probability (credible) intervals. Builds on
// the Bayes'-rule cards in MIT 6.1200J. See src/data/courses.ts.
import type { Card } from "./types";

const MODULE = "mit1805-bayes";

export const mit1805BayesianInferenceCards: Card[] = [
  // --- Class 10: Introduction to statistics; maximum likelihood ---
  {
    id: "mit1805-bayes-what-statistics-does",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the three phases of statistical practice, what is a 'statistic', and how does statistical inference flip the direction of probability?",
    back: `**Three overlapping phases** (mirroring the scientific method):
1. **Collecting data — experimental design.** "Garbage in, garbage out." R. A. Fisher: consulting a statistician after the experiment is like asking for a post-mortem — they can say what it died of.
2. **Describing data — descriptive statistics**: summary statistics (mean, median, interquartile range) and plots (histograms, scatterplots, the empirical cdf).
3. **Analyzing data — inferential statistics**: fit a **statistical model** (e.g. "measurement errors are normal") and draw conclusions about its **parameters**.

A **statistic** is anything computed from the data alone — e.g. the sample mean $\\bar{x}$. It may not depend on unknown parameters.

**The flip**: probability asks *"given the parameters, how likely is this data?"* — $P(\\text{data} \\mid \\theta)$. Statistics asks the reverse: *"given this data, what can we say about the parameters?"* Parameters are treated as **hypotheses** to be weighed by the data.

Because data come from a random process, statistical conclusions are always **probability statements** — and their meaning is easy to misstate (by the media and by researchers). 18.05 emphasizes the precise meaning of each statement, not just the method that produced it.`,
    related: ["mit1805-bayes-mle-discrete", "mit1805-bayes-update-table"],
  },
  {
    id: "mit1805-bayes-mle-discrete",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What is the maximum likelihood estimate (MLE)? Find the MLE of p when a coin shows 55 heads in 100 flips, using the log likelihood.",
    back: `**Likelihood**: $P(\\text{data} \\mid \\theta)$, viewed as a function of the **parameter** $\\theta$ with the data held fixed.

**MLE**: the parameter value that makes the observed data **most probable**:
$$\\hat{\\theta} = \\arg\\max_\\theta P(\\text{data} \\mid \\theta).$$
It's a **point estimate** (one number), easy to compute, and matches intuition in simple cases.

**Coin**: experiment = flip 100 times; data = 55 heads.
$$P(55 \\text{ heads} \\mid p) = \\binom{100}{55}p^{55}(1 - p)^{45}.$$
**Log likelihood** — $\\ln$ is increasing, so it has the same maximizer, and products become sums:
$$\\ell(p) = \\ln\\binom{100}{55} + 55\\ln p + 45\\ln(1 - p), \\qquad \\ell'(p) = \\frac{55}{p} - \\frac{45}{1 - p} = 0$$
$$\\Rightarrow\\; 55(1 - p) = 45p \\;\\Rightarrow\\; \\hat{p} = 0.55.$$
The constant $\\binom{100}{55}$ doesn't affect the maximizer — you can drop it.

As expected, the MLE is the observed frequency of heads.`,
    pitfall:
      "The likelihood P(data | θ) is NOT the probability that θ is the true value. It doesn't even integrate to 1 over θ. Getting P(θ | data) requires a prior — that's Bayesian inference.",
    related: ["mit1805-bayes-mle-continuous", "mit1805-bayes-what-statistics-does"],
  },
  {
    id: "mit1805-bayes-mle-continuous",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Find the MLE of λ for exponential bulb lifetimes 2, 3, 1, 3, 4 years, and the MLEs of μ and σ² for normal data.",
    back: `**Continuous data**: use the **pdf** as the likelihood. For **independent** observations the joint density is the product of the individual densities.

**Light bulbs**, $X_i \\sim \\exp(\\lambda)$, data $x = (2, 3, 1, 3, 4)$:
$$f(x_1, \\ldots, x_5 \\mid \\lambda) = \\prod_{i=1}^{5}\\lambda e^{-\\lambda x_i} = \\lambda^5e^{-\\lambda\\sum x_i} = \\lambda^5e^{-13\\lambda}.$$
$\\ell(\\lambda) = 5\\ln\\lambda - 13\\lambda$, so $\\ell'(\\lambda) = \\frac5\\lambda - 13 = 0$:
$$\\hat{\\lambda} = \\frac{5}{13} \\approx 0.385 = \\frac{1}{\\bar{x}}.$$
Sensible: the mean of $\\exp(\\lambda)$ is $\\frac1\\lambda$, and the sample mean lifetime is $\\frac{13}{5}$.

**Normal** $N(\\mu, \\sigma^2)$, both unknown:
$$\\ell(\\mu, \\sigma) = -n\\ln(\\sqrt{2\\pi}\\,\\sigma) - \\sum_{i=1}^{n}\\frac{(x_i - \\mu)^2}{2\\sigma^2}.$$
Setting both partial derivatives to zero:
$$\\hat{\\mu} = \\bar{x}, \\qquad \\hat{\\sigma}^2 = \\frac1n\\sum_{i=1}^{n}(x_i - \\bar{x})^2.$$

The MLE recovers the familiar sample mean and (uncorrected) sample variance.`,
    pitfall:
      "The MLE of σ² divides by n and is slightly biased (too small on average); the usual 'sample variance' s² divides by n − 1 to be unbiased. For large n the difference is negligible.",
    related: ["mit1805-bayes-mle-discrete", "mit1805-probability-gallery-continuous"],
  },

  // --- Class 11: Bayesian updating with discrete priors ---
  {
    id: "mit1805-bayes-update-table",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "A drawer holds 2 fair coins (A, P(H) = 0.5), 2 bent coins B (0.6) and 1 bent coin C (0.9). A random coin shows heads. Build the Bayesian update table.",
    back: `**Terms**: **hypotheses** $\\mathcal{H}$ (coin type), **data** $\\mathcal{D}$ (heads), **prior** $P(\\mathcal{H})$, **likelihood** $P(\\mathcal{D} \\mid \\mathcal{H})$, **posterior** $P(\\mathcal{H} \\mid \\mathcal{D})$.

**Bayes' theorem** in table form: posterior ∝ likelihood × prior; normalize by the total.

| hypothesis | prior | likelihood | Bayes numerator | posterior |
|---|---|---|---|---|
| A | 0.4 | 0.5 | 0.20 | $\\frac{10}{31} \\approx 0.323$ |
| B | 0.4 | 0.6 | 0.24 | $\\frac{12}{31} \\approx 0.387$ |
| C | 0.2 | 0.9 | 0.18 | $\\frac{9}{31} \\approx 0.290$ |
| total | 1 | — | $P(\\mathcal{D}) = 0.62$ | 1 |

- The **Bayes numerator** column is likelihood × prior.
- Its **sum** is $P(\\mathcal{D})$ — the **law of total probability** (the prior predictive probability of heads).
- **Posterior** = numerator / total.

**Reading it**: heads raised the probability of C (0.2 → 0.29) and lowered A (0.4 → 0.32). The likelihood column needn't sum to 1 — it isn't a distribution over hypotheses.

**Updating again**: today's posterior is tomorrow's prior. After a second heads: A ≈ 0.246, B ≈ 0.355, C ≈ 0.399 — now C is most probable.`,
    related: ["mit1805-bayes-prior-likelihood-posterior", "mit1805-bayes-predictive-probability", "mit6120-probability-bayes-base-rates"],
  },
  {
    id: "mit1805-bayes-prior-likelihood-posterior",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain 'posterior ∝ likelihood × prior'. Why is 'likelihood' a dangerous word, and how does the MLE relate to the posterior?",
    back: `$$\\underbrace{P(\\mathcal{H} \\mid \\mathcal{D})}_{\\text{posterior}} = \\frac{\\overbrace{P(\\mathcal{D} \\mid \\mathcal{H})}^{\\text{likelihood}}\\;\\overbrace{P(\\mathcal{H})}^{\\text{prior}}}{\\underbrace{P(\\mathcal{D})}_{\\text{total probability}}} \\;\\propto\\; \\text{likelihood} \\times \\text{prior}.$$
The denominator doesn't depend on $\\mathcal{H}$ — it just normalizes the posterior to sum (or integrate) to 1.

**Why "likelihood" is dangerous**: in everyday speech likelihood = probability. Here it means **probability of the data given the hypothesis**, varying the hypothesis with the data fixed. It is not a probability distribution over hypotheses (it needn't sum to 1). The course would rather call it the **Bayes term**.

**MLE vs the posterior**:
- The MLE picks the hypothesis with the largest **likelihood** — it ignores the prior.
- The hypothesis with the largest **posterior** (the MAP estimate) weighs in the prior.
- With a **flat** (uniform) prior, the two coincide. In the drawer example the likelihood favors C (0.9), but its small prior keeps B the most probable after one heads.

**Bayes' theorem as the foundation of inference**: everything in Bayesian statistics is this update applied to well-chosen hypotheses, priors and data.`,
    related: ["mit1805-bayes-update-table", "mit1805-bayes-mle-discrete", "mit1805-bayes-choosing-priors"],
  },

  // --- Class 12: Probabilistic prediction; odds and Bayes factors ---
  {
    id: "mit1805-bayes-predictive-probability",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Distinguish prior and posterior predictive probabilities. In the three-coin drawer, what is the probability of heads before any flip, and on the next flip after seeing one heads?",
    back: `**Probabilistic prediction** assigns a probability to each possible outcome of a future experiment — sharper than a bare prediction ("it will rain") or vague words of estimative probability ("it's likely to rain").

Predictions **average over hypotheses** using the law of total probability.

**Prior predictive** (before data), weighting by the **prior**:
$$P(H_1) = \\sum_{\\mathcal{H}} P(H_1 \\mid \\mathcal{H})\\,P(\\mathcal{H}) = 0.5(0.4) + 0.6(0.4) + 0.9(0.2) = 0.62.$$

**Posterior predictive** (after seeing $H_1$ = heads), weighting by the **posterior** $\\frac{10}{31}, \\frac{12}{31}, \\frac{9}{31}$:
$$P(H_2 \\mid H_1) = 0.5 \\cdot \\tfrac{10}{31} + 0.6 \\cdot \\tfrac{12}{31} + 0.9 \\cdot \\tfrac{9}{31} \\approx 0.655.$$

Seeing heads made heads **more likely next time** (0.62 → 0.655), because it shifted belief toward the bent coins.

Note the **two different kinds of probability**: probabilities of **hypotheses** (prior, posterior) and probabilities of **outcomes** (likelihoods, predictive probabilities). Keeping them apart is half the battle.`,
    pitfall:
      "Flips of the chosen coin are independent GIVEN the coin type, but not unconditionally: P(H₂ | H₁) ≠ P(H₂) because H₁ carries information about which coin you have.",
    related: ["mit1805-bayes-update-table", "mit1805-bayes-odds-bayes-factors", "mit6120-probability-conditional-independence"],
  },
  {
    id: "mit1805-bayes-odds-bayes-factors",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define odds and the Bayes factor, and show that posterior odds = Bayes factor × prior odds. How does the blood-type evidence about 'Oliver' work?",
    back: `**Odds** of $E$ versus $E'$: $\\frac{P(E)}{P(E')}$; by default $E' = E^c$, so $O(E) = \\frac{P(E)}{1 - P(E)}$. $O(\\text{rain}) = 2$ means "2 to 1", i.e. $P = \\frac23$. Conversely $P = \\frac{O}{1 + O}$.

**Bayes factor** (likelihood ratio) of data $D$ for hypothesis $H$:
$$BF = \\frac{P(D \\mid H)}{P(D \\mid H^c)}.$$

**Odds update**: divide Bayes' theorem for $H$ by Bayes' theorem for $H^c$ — $P(D)$ cancels:
$$\\underbrace{O(H \\mid D)}_{\\text{posterior odds}} = \\frac{P(D \\mid H)}{P(D \\mid H^c)} \\cdot \\frac{P(H)}{P(H^c)} = BF \\times \\underbrace{O(H)}_{\\text{prior odds}}.$$
- $BF > 1$: the data is evidence **for** $H$; $BF < 1$: evidence **against**; $BF = 1$: uninformative.
- Independent pieces of data multiply their Bayes factors (add their log-odds).

**Oliver** (type O blood, 60% of people): two people left blood at a scene — one type O, one type AB (1% of people).
- If Oliver was there, the other person must be AB: $P(D \\mid S) = 0.01$.
- If not, two random people produced one O and one AB: $P(D \\mid S^c) = 2 \\cdot 0.6 \\cdot 0.01$.
$$BF = \\frac{0.01}{2(0.6)(0.01)} \\approx 0.83 < 1.$$
Finding his blood type at the scene is (weak) evidence **against** Oliver being there — type O is so common that a random pair would easily include it.`,
    related: ["mit1805-bayes-predictive-probability", "mit6120-probability-bayes-base-rates"],
  },

  // --- Classes 13-14: Continuous priors ---
  {
    id: "mit1805-bayes-continuous-priors",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Bayesian updating work when the parameter θ is continuous? Update a flat prior on a coin's P(heads) after one head.",
    back: `When the hypotheses form a **continuum** (e.g. $\\theta \\in [0, 1]$ = a bent coin's probability of heads), replace the prior pmf by a **prior pdf** $f(\\theta)$ and sums by integrals.

**Law of total probability** (prior predictive):
$$p(x) = \\int p(x \\mid \\theta)\\,f(\\theta)\\,d\\theta.$$
**Bayes' theorem for densities**:
$$f(\\theta \\mid x) = \\frac{p(x \\mid \\theta)\\,f(\\theta)}{p(x)} \\;\\propto\\; \\text{likelihood} \\times \\text{prior pdf}.$$
The update table still works, with one row for the whole range of $\\theta$ (entries like $f(\\theta)\\,d\\theta$).

**Flat prior** $f(\\theta) = 1$ on $[0, 1]$ (every value equally plausible). Toss once, get heads: likelihood $p(x = 1 \\mid \\theta) = \\theta$.
- Total probability $p(x = 1) = \\int_0^1 \\theta\\,d\\theta = \\frac12$.
- Posterior $f(\\theta \\mid x = 1) = \\frac{\\theta \\cdot 1}{1/2} = 2\\theta$ — tilted toward larger $\\theta$.

**Non-flat prior** $f(\\theta) = 2\\theta$: the prior predictive probability of heads is $\\int_0^1 \\theta \\cdot 2\\theta\\,d\\theta = \\frac23$.

The same machinery handles **continuous data** too: use pdfs $f(x \\mid \\theta)$ for the likelihood (e.g. normal measurements of an unknown mean).`,
    related: ["mit1805-bayes-conjugate-beta-binomial", "mit1805-bayes-update-table", "mit1805-probability-continuous-random-variables"],
  },

  // --- Class 15: Conjugate priors ---
  {
    id: "mit1805-bayes-conjugate-beta-binomial",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define a conjugate prior and prove that a Beta(a, b) prior with a binomial(N, θ) likelihood gives a Beta(a + x, b + N − x) posterior.",
    back: `**Conjugate prior**: a family of prior distributions such that, for a given likelihood, the posterior is **in the same family**. Bayesian updating then reduces to **updating the parameters** (the "hyperparameters") — simple arithmetic instead of integrals.

**Beta distribution** on $[0, 1]$: $f(\\theta) = c\\,\\theta^{a-1}(1 - \\theta)^{b-1}$, with mean $\\frac{a}{a + b}$. Beta(1, 1) is the flat prior.

**Theorem.** Prior Beta$(a, b)$, data $x$ successes in $N$ binomial trials ⇒ posterior Beta$(a + x,\\ b + N - x)$.

**Proof.** posterior ∝ likelihood × prior:
$$f(\\theta \\mid x) \\;\\propto\\; \\binom{N}{x}\\theta^x(1 - \\theta)^{N - x}\\cdot c\\,\\theta^{a-1}(1 - \\theta)^{b-1} \\;\\propto\\; \\theta^{a + x - 1}(1 - \\theta)^{b + N - x - 1}.$$
That's the shape of Beta$(a + x, b + N - x)$. A pdf is determined by its shape up to the normalizing constant, so that's the posterior. $\\blacksquare$

**Interpretation**: $a - 1$ and $b - 1$ act like **prior counts** of successes and failures; each observation adds to the matching count.

**Example**: flat prior Beta(1, 1), then 55 heads in 100 flips → Beta(56, 46), posterior mean $\\frac{56}{102} \\approx 0.549$ — close to the MLE 0.55, pulled slightly toward $\\frac12$.

The beta is also conjugate for **Bernoulli** and **geometric** likelihoods.`,
    related: ["mit1805-bayes-normal-normal", "mit1805-bayes-continuous-priors", "mit1805-bayes-mle-discrete"],
  },
  {
    id: "mit1805-bayes-normal-normal",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the normal–normal update: a normal prior N(μ₀, σ₀²) on θ with n normal measurements of known variance σ². Interpret the formula.",
    back: `The normal family is **its own conjugate prior** when the likelihood is normal with **known variance**.

Prior $\\theta \\sim N(\\mu_{\\text{prior}}, \\sigma^2_{\\text{prior}})$; data $x_1, \\ldots, x_n \\sim N(\\theta, \\sigma^2)$ independently. Let
$$a = \\frac{1}{\\sigma^2_{\\text{prior}}}, \\qquad b = \\frac{n}{\\sigma^2}.$$
Then the posterior is $N(\\mu_{\\text{post}}, \\sigma^2_{\\text{post}})$ with
$$\\mu_{\\text{post}} = \\frac{a\\,\\mu_{\\text{prior}} + b\\,\\bar{x}}{a + b}, \\qquad \\sigma^2_{\\text{post}} = \\frac{1}{a + b}.$$

**Interpretation**:
- $a$ and $b$ are **precisions** (1 / variance). The posterior mean is a **precision-weighted average** of the prior mean and the data mean.
- Precisions **add**: the posterior is always more certain than either the prior or the data alone.
- More data ($n \\uparrow$) or less noise ($\\sigma \\downarrow$) increases $b$, so the data dominates and $\\mu_{\\text{post}} \\to \\bar{x}$.

**Example**: prior $N(4, 8)$, one measurement $x = 3$ with $\\sigma^2 = 1$: $a = \\frac18$, $b = 1$:
$$\\mu_{\\text{post}} = \\frac{\\frac18 \\cdot 4 + 1 \\cdot 3}{\\frac98} \\approx 3.11, \\qquad \\sigma^2_{\\text{post}} = \\frac89.$$
The precise measurement pulls the estimate most of the way to 3.

This is the core of the **Kalman filter**: fuse a prediction (prior) with a noisy sensor reading, weighting each by its precision.`,
    related: ["mit1805-bayes-conjugate-beta-binomial", "mit1805-bayes-choosing-priors"],
  },

  // --- Class 16: Choosing priors; probability intervals ---
  {
    id: "mit1805-bayes-choosing-priors",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the choice of prior affect Bayesian conclusions? What goes wrong with an overly rigid prior, and how do Bayesians and frequentists differ on this?",
    back: `When the prior is genuinely known (the drawer of coins), Bayesian inference is uncontroversial — just Bayes' theorem. **The art of statistics begins when the prior is uncertain.**

**Lessons on priors**:
- **The prior affects the posterior**: different reasonable priors give different conclusions, especially with little data.
- **Too rigid a prior blocks learning**: a prior that gives some hypothesis probability **0** can never recover — its posterior stays 0 whatever the data (posterior ∝ likelihood × 0). Never rule out what you can't rule out; give "surprising" hypotheses small but nonzero prior probability.
- **More data reduces dependence on the prior**: as data accumulates, the likelihood dominates, and posteriors from different reasonable priors converge.
- **Good practice**: justify the prior from prior knowledge, and check robustness by trying several priors to see whether they lead to the same conclusion.

**Two schools** when the prior is unknown:
- **Bayesian**: choose a reasonable (subjective but stated) prior and reason with the posterior $P(H \\mid D)$ — probabilities of hypotheses.
- **Frequentist**: refuse to put probabilities on hypotheses; reason only with likelihoods $P(D \\mid H)$, i.e. how often procedures would succeed in repeated experiments (significance tests, confidence intervals).

Both are widely used; understanding what each statement means is the point.`,
    related: ["mit1805-bayes-probability-intervals", "mit1805-bayes-prior-likelihood-posterior", "mit1805-freq-frequentist-vs-bayesian"],
  },
  {
    id: "mit1805-bayes-probability-intervals",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a p-probability (credible) interval for a parameter? Is it unique, and how can probability intervals be used to build a prior?",
    back: `**Definition**: given a pmf or pdf describing belief about $\\theta$, a **$p$-probability interval** is an interval $[a, b]$ with
$$P(a \\leq \\theta \\leq b) = p.$$
They're also called **credible intervals** (to contrast with frequentist **confidence intervals**).

**In quantiles**: for $s \\leq t$, $[q_s, q_t]$ is a $(t - s)$-probability interval. A **symmetric** 90% interval is $[q_{0.05}, q_{0.95}]$.

**Not unique**: $[q_{0.05}, q_{0.55}]$ and $[q_{0.25}, q_{0.75}]$ are both 50% intervals. Common choices: symmetric (equal tails) or **shortest** (highest density).

**Summarizing belief**: a posterior is a whole distribution; a 90% credible interval compresses it into "θ is between $a$ and $b$ with probability 0.9" — a direct probability statement **about the parameter**, which is exactly what a Bayesian is allowed to say.

**Building a prior**: when you have no formula for your beliefs, estimate **subjective quantiles** systematically ("I'm 50/50 the value is below…", "90% sure it's between…"), then pick a distribution (e.g. a beta or normal) matching those intervals. Wider intervals = a less informative prior.`,
    pitfall:
      "Don't read a frequentist 95% confidence interval as '95% probability the parameter is inside' — that's the meaning of a Bayesian credible interval, which requires a prior.",
    related: ["mit1805-bayes-choosing-priors", "mit1805-probability-quantiles", "mit1805-freq-confidence-interval-meaning"],
  },
];
