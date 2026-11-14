// MIT 6.1200J (formerly 6.042J) Mathematics for Computer Science, Spring
// 2024 — Unit 6: Probability (Lectures 18-24), the course's final module.
// Sourced from the course's own lecture notes, read page-by-page. Lecture 18
// covers probability spaces and the tree method (Monty Hall, nontransitive
// dice). Lecture 19 covers probability rules, conditional probability,
// Bayes' rule (base rates) and Simpson's paradox. Lecture 20 covers
// independence (pairwise vs mutual, correlated events, conditional
// independence) and the birthday principle. Lecture 21 covers random
// variables, a randomized strategy for the two-envelope game, and the
// binomial distribution. Lecture 22 covers expectation and linearity of
// expectation. Lecture 23 (expectation and variance) has no published notes:
// it is covered from Lecture 24's own variance review plus the course's
// official textbook, Lehman/Leighton/Meyer "Mathematics for Computer
// Science" (CC BY-SA, linked from the OCW readings page), Sections 20.2-20.3.
// Lecture 24 covers Markov, Chebyshev and Chernoff bounds. Probability is a
// core gap against KU Leuven's "Kansrekenen I" — it barely exists elsewhere in
// the app. Correction to the notes: their infinite-expectation example
// ("latency i with probability 1/i") isn't a valid distribution; the card
// uses probability proportional to 1/i² instead. See src/data/courses.ts for
// the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6120-probability";

export const mit6120ProbabilityCards: Card[] = [
  // --- Lecture 18: Introduction to probability ---
  {
    id: "mit6120-probability-space-tree-method",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a discrete probability space, outcomes and events, and describe the four-step tree method for solving probability problems.",
    back: `**Discrete probability space** $(S, \\Pr)$: a non-empty **countable** sample space $S$ and a total function $\\Pr: S \\to [0, 1]$ with $\\sum_{\\omega \\in S} \\Pr[\\omega] = 1$.
- An **outcome** is an element $\\omega \\in S$.
- An **event** is a subset $A \\subseteq S$; its probability is $\\Pr[A] = \\sum_{\\omega \\in A} \\Pr[\\omega]$. Notation: $[X]$ = "the event that $X$ happens".

**The tree method** — rigorous, and no reliance on intuition (which is notoriously unreliable in probability):
0. **Pin down the question.** State every modeling assumption explicitly; they are your axioms.
1. **Sample space**: draw a tree with one level per step of the random process, branching on each possible result. The **leaves are the outcomes**.
2. **Probability function**: label each edge with the probability of taking it *given that you reached its parent* (edges out of a node sum to 1). An outcome's probability is the **product along its root-to-leaf path**.
3. **Events**: identify which leaves belong to the event you care about.
4. **Answer**: add up those leaves' probabilities.

If an edge probability isn't obvious from the process, restructure the tree (e.g. put the step whose probabilities you know first).`,
    pitfall:
      "Different assumptions give different answers — and both can be 'correct'. Most probability arguments go wrong at step 0, not in the arithmetic.",
    related: ["mit6120-probability-monty-hall", "mit6120-probability-conditional-product-rule", "mit6120-counting-generalized-product-rule"],
  },
  {
    id: "mit6120-probability-monty-hall",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Solve the Monty Hall problem with the tree method. Why does the answer depend on the assumptions about the host?",
    back: `A prize is behind one of three doors; you pick one; the host, who knows where the prize is, opens another door showing no prize and offers a switch. Should you switch? (Marilyn vos Savant said yes in 1990 and received a torrent of hate mail, including from mathematicians.)

**Step 0 — assumptions**: the prize is uniformly behind A, B or C; the contestant picks uniformly, independently of the prize; the host **must** open an unpicked, empty door and offer the switch; when he has two such doors he picks uniformly.

**Steps 1–2**: three levels — prize location (1/3 each), picked door (1/3 each), opened door (probability 1 if the host has one choice, 1/2 if two). Outcomes are triples $(x, y, z)$ with $z \\neq x$, $z \\neq y$: 12 leaves.
- If the pick is **correct** ($x = y$, e.g. $(A, A, B)$): $\\frac13 \\cdot \\frac13 \\cdot \\frac12 = \\frac{1}{18}$ — 6 such leaves.
- If the pick is **wrong** ($x \\neq y$, e.g. $(A, B, C)$): $\\frac13 \\cdot \\frac13 \\cdot 1 = \\frac19$ — 6 such leaves.

**Steps 3–4**: switching wins exactly when the first pick was wrong: $6 \\cdot \\frac19 = \\frac23$.

**The assumptions matter**: if the host is "tricksy" and only offers a switch when you picked right, switching **always loses**; if he's "benevolent" and only offers when you picked wrong, switching **always wins**. Both are consistent stories — the $\\frac23$ answer is a theorem about the stated axioms.`,
    related: ["mit6120-probability-space-tree-method", "mit6120-probability-bayes-base-rates"],
  },
  {
    id: "mit6120-probability-nontransitive-dice",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are nontransitive dice, and what do they show about the relation 'beats with probability > 1/2'?",
    back: `Three fair 3-sided "dice": **Red** $\\{2, 6, 7\\}$, **Green** $\\{1, 5, 9\\}$, **Blue** $\\{3, 4, 8\\}$. Player 1 picks a die, Player 2 then picks another; both roll; higher number wins.

Each pair gives a uniform space of $3 \\times 3 = 9$ outcomes:
- Red beats Green in 5 of 9 outcomes: $\\Pr = \\frac59$.
- Green beats Blue: $\\frac59$.
- **Blue beats Red**: $\\frac59$.

So "beats more than half the time" is **not transitive**: there is no best die, and Player 2 can always counter Player 1's choice and win with probability $\\frac59$.

**It gets stranger**: if each player rolls their die **twice** and adds the results, Red now beats Green with probability only $\\frac{37}{81} < \\frac12$ — the advantage reverses.

Takeaway: intuitions borrowed from ordinary orders ($a > b$, $b > c$ ⇒ $a > c$) don't transfer to probabilistic comparisons. Just compute. The same phenomenon shows up wherever "A is usually better than B" is used to rank options — benchmarks, tournaments, voting.`,
    related: ["mit6120-probability-space-tree-method", "mit6120-counting-weak-partial-orders"],
  },

  // --- Lecture 19: Conditional probability ---
  {
    id: "mit6120-probability-rules",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "List the basic probability rules that follow from defining Pr[A] as the sum of Pr[ω] over all outcomes ω ∈ A.",
    back: `All follow directly from summing outcome probabilities — they mirror the counting rules for set sizes.

- **Sum rule**: $A, B$ disjoint ⇒ $\\Pr[A \\cup B] = \\Pr[A] + \\Pr[B]$ (also for countably many pairwise disjoint events).
- **Complement rule**: $\\Pr[\\overline{A}] = 1 - \\Pr[A]$.
- **Difference rule**: $\\Pr[A \\setminus B] = \\Pr[A] - \\Pr[A \\cap B]$.
- **Inclusion–exclusion**: $\\Pr[A \\cup B] = \\Pr[A] + \\Pr[B] - \\Pr[A \\cap B]$ (and the alternating version for finitely many events).
- **Union bound**: $\\Pr[A \\cup B] \\leq \\Pr[A] + \\Pr[B]$; more generally $\\Pr\\left[\\bigcup_i A_i\\right] \\leq \\sum_i \\Pr[A_i]$ — **no independence or disjointness needed**.
- **Monotonicity**: $A \\subseteq B$ ⇒ $\\Pr[A] \\leq \\Pr[B]$.

The union bound is the workhorse of algorithm analysis: if each of $n$ bad events has probability at most $\\frac{1}{n^2}$, then *some* bad event happens with probability at most $\\frac1n$, however the events are correlated.`,
    related: ["mit6120-counting-inclusion-exclusion", "mit6120-probability-conditional-product-rule"],
  },
  {
    id: "mit6120-probability-conditional-product-rule",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define conditional probability, derive the product rule, and explain why the tree method's edge labels are conditional probabilities.",
    back: `**Conditional probability** (for $\\Pr[B] > 0$):
$$\\Pr[A \\mid B] = \\frac{\\Pr[A \\cap B]}{\\Pr[B]}.$$
Read: restrict the sample space to $B$ and renormalize.

**Product rule** — rearranging: $\\Pr[A \\cap B] = \\Pr[A \\mid B]\\,\\Pr[B]$, and for more events
$$\\Pr[A \\cap B \\cap C] = \\Pr[A \\mid B \\cap C]\\,\\Pr[B \\mid C]\\,\\Pr[C].$$
Dividing by $\\Pr[C]$ also gives $\\Pr[A \\cap B \\mid C] = \\Pr[A \\mid B \\cap C]\\,\\Pr[B \\mid C]$.

**This justifies the tree method**: an edge label is the probability of a step *given the path so far* — a conditional probability — and multiplying along a path is exactly the product rule.

**Example**: Ash and Gary play until someone wins two battles; the first battle is a toss-up, and whoever won the previous battle wins the next with probability $\\frac23$. With $A$ = [Ash wins the series], $B$ = [Ash wins battle 1]: given $B$, Ash wins battle 2 ($\\frac23$), or loses it and then wins battle 3 ($\\frac13 \\cdot \\frac13$), so
$$\\Pr[A \\mid B] = \\tfrac23 + \\tfrac19 = \\tfrac79.$$`,
    pitfall:
      "Pr[A | B] and Pr[B | A] are different quantities and usually differ. Confusing them is the 'prosecutor's fallacy' — see Bayes' rule.",
    related: ["mit6120-probability-bayes-base-rates", "mit6120-probability-space-tree-method"],
  },
  {
    id: "mit6120-probability-bayes-base-rates",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "State Bayes' rule (with prior, likelihood and posterior), and use it on a screening test: 10% are sick, false-positive rate 0.3, false-negative rate 0.1. If you test positive, how likely are you sick?",
    back: `**Bayes' rule**:
$$\\Pr[B \\mid A] = \\frac{\\Pr[A \\mid B]\\,\\Pr[B]}{\\Pr[A]}.$$
$\\Pr[B]$ is the **prior**, $\\Pr[A \\mid B]$ the **likelihood**, $\\Pr[B \\mid A]$ the **posterior**. Models usually give the "forward" direction $\\Pr[\\text{evidence} \\mid \\text{cause}]$; Bayes inverts it to infer the cause.

**Odds form** — divide Bayes for $B$ by Bayes for $C$, and $\\Pr[A]$ cancels:
$$\\frac{\\Pr[B \\mid A]}{\\Pr[C \\mid A]} = \\frac{\\Pr[A \\mid B]}{\\Pr[A \\mid C]} \\cdot \\frac{\\Pr[B]}{\\Pr[C]}.$$

**The screening test**: $S$ = sick, $H$ = healthy. $\\Pr[S] = 0.1$, $\\Pr[H] = 0.9$, $\\Pr[+ \\mid S] = 0.9$, $\\Pr[+ \\mid H] = 0.3$.
$$\\frac{\\Pr[S \\mid +]}{\\Pr[H \\mid +]} = \\frac{0.9 \\cdot 0.1}{0.3 \\cdot 0.9} = \\frac{0.09}{0.27} = \\frac13,$$
so $\\Pr[S \\mid +] = \\frac14$. Despite a positive result, you're **more likely healthy**: the low **base rate** (prior) dominates a decent-looking test.

**Coins**: pick a fair or an always-heads coin uniformly and see heads: the odds fair : biased are $\\frac{1/2 \\cdot 1/2}{1 \\cdot 1/2} = \\frac12$, so $\\Pr[\\text{fair} \\mid H] = \\frac13$. Make the biased coin rare and the posterior tilts back toward fair.`,
    pitfall:
      "In practice tests are given to people with symptoms, i.e. a population with a much higher prior — Pr[S | +, symptoms] can be far larger. The base rate must match the population actually tested.",
    related: ["mit6120-probability-conditional-product-rule", "mit6120-probability-simpsons-paradox"],
  },
  {
    id: "mit6120-probability-simpsons-paradox",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is Simpson's paradox? Explain how every department can favor women while the university as a whole favors men.",
    back: `**The data** (UC Berkeley graduate admissions, 1973): the university-wide admission rate was higher for men, $\\Pr[A \\mid M] > \\Pr[A \\mid F]$, yet in each department the rate was at least as high for women.

**No contradiction** — overall rates are **weighted averages** of departmental rates, weighted by **where each group applies**:
$$\\Pr[A \\mid F] = \\Pr[A \\mid F \\cap CS]\\,\\Pr[CS \\mid F] + \\Pr[A \\mid F \\cap EE]\\,\\Pr[EE \\mid F],$$
and likewise for $M$. If women mostly apply to the hard department and men to the easy one, the women's average is dragged down even though each department favors them.

**Extreme example**: 100 men and 100 women apply. 99 women and 1 man apply to CS; 99 men and 1 woman apply to EE. CS admits exactly 1 (a woman); EE rejects exactly 1 (a man).
- CS: women $\\frac{1}{99}$ vs men $\\frac01$ — favors women. EE: women $\\frac11$ vs men $\\frac{98}{99}$ — favors women.
- Overall: women $\\frac{2}{100}$ vs men $\\frac{98}{100}$ — overwhelmingly favors men.

**Lesson**: an aggregate trend can reverse within every subgroup when a confounding variable (department choice) is unevenly distributed. Always ask what you're conditioning on.`,
    related: ["mit6120-probability-bayes-base-rates", "mit6120-probability-conditional-independence"],
  },

  // --- Lecture 20: Independence ---
  {
    id: "mit6120-probability-independence",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define independent events. Are disjoint events independent? Give an example where independence depends on whether the coin is fair.",
    back: `**Independent events**: $\\Pr[A \\mid B] = \\Pr[A]$ or $\\Pr[B] = 0$. Equivalently (and symmetric): $\\Pr[A \\cap B] = \\Pr[A] \\cdot \\Pr[B]$. Learning $B$ tells you nothing about $A$.

**The gambler's fallacy**: after ten tails in a row from a fair coin, heads is not "due" — flips of a fair coin are independent (that's part of what "fair coin" means).

**Disjoint ≠ independent** — the opposite, in fact: if $A, B$ are disjoint with nonzero probabilities, then $\\Pr[A \\cap B] = 0 \\neq \\Pr[A]\\Pr[B]$. Knowing $A$ happened tells you $B$ didn't.

**Two coin flips**, $A$ = [first is heads]:
- $B$ = [both heads]: **dependent** — $\\Pr[A \\cap B] = \\frac14 \\neq \\frac12 \\cdot \\frac14$; $B$ forces $A$.
- $B$ = [both coins agree], **fair** coins: **independent** — $\\Pr[A \\cap B] = \\frac14 = \\frac12 \\cdot \\frac12$.
- $B$ = [both coins agree], coins with heads probability $p$: **dependent** — $\\Pr[B \\mid A] = p$ but $\\Pr[B] = p^2 + (1-p)^2$. For tiny $p$, $\\Pr[B \\mid A] \\approx 0$ while $\\Pr[B] \\approx 1$.

So independence is a numerical coincidence of the probabilities, not a structural property of the events.`,
    related: ["mit6120-probability-pairwise-vs-mutual", "mit6120-probability-conditional-independence"],
  },
  {
    id: "mit6120-probability-pairwise-vs-mutual",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define mutual and pairwise independence for three events, and show three events that are pairwise but not mutually independent.",
    back: `$A, B, C$ are **mutually independent** if all four hold:
$$\\Pr[A \\cap B] = \\Pr[A]\\Pr[B], \\quad \\Pr[A \\cap C] = \\Pr[A]\\Pr[C], \\quad \\Pr[B \\cap C] = \\Pr[B]\\Pr[C],$$
$$\\Pr[A \\cap B \\cap C] = \\Pr[A]\\Pr[B]\\Pr[C].$$
**Pairwise independent**: the first three hold.

**The fourth condition doesn't follow from the first three.** Flip three fair, independent coins. Let $A$ = [coins 1 and 2 agree], $B$ = [coins 2 and 3 agree], $C$ = [coins 3 and 1 agree].
- Each has probability $\\frac12$.
- Any two together mean all three coins agree: probability $\\frac18 + \\frac18 = \\frac14 = \\frac12 \\cdot \\frac12$. So all pairs are independent. ✓
- But $\\Pr[A \\cap B \\cap C] = \\Pr[\\text{all agree}] = \\frac14 \\neq \\frac18 = \\Pr[A]\\Pr[B]\\Pr[C]$.

So the events are **pairwise but not mutually independent**: any two of them determine the third. $\\blacksquare$

**Why CS cares**: pairwise independence is often "good enough" and much cheaper to generate (pairwise-independent hash families, derandomization). Variances of sums only need pairwise independence; Chernoff bounds need mutual independence.`,
    related: ["mit6120-probability-independence", "mit6120-probability-variance-of-sums", "mit6006-sorting-hashing-universal-hashing"],
  },
  {
    id: "mit6120-probability-conditional-independence",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is assuming independence dangerous (the 2016 election example), and how can conditioning create dependence between independent events?",
    back: `**Correlated events — the 2016 US election**: polls gave Trump about 0.21 (PA), 0.23 (MI) and 0.165 (WI) chances. Multiplying as if independent gives about 0.008 for winning all three. But the states are **correlated** (shared polling errors, election-day dynamics), so the product is meaningless. Without assumptions about correlation, the best upper bound is the **smallest** probability, 0.165 — since $[PA \\cap MI \\cap WI] \\subseteq [WI]$ — and it could be that large.

**Conditional independence**: $A, B$ are independent given $C$ if
$$\\Pr[A \\cap B \\mid C] = \\Pr[A \\mid C]\\,\\Pr[B \\mid C].$$

**Conditioning can create dependence** between causally unrelated events. Toy dating model: attractive ($A$) and nice ($N$) are independent, each with probability $\\frac12$. You only pay attention to people who are "interesting" — $R = A \\cup N$, $\\Pr[R] = \\frac34$. Given $R$:
$$\\Pr[A \\mid R] = \\Pr[N \\mid R] = \\tfrac23, \\qquad \\Pr[A \\cap N \\mid R] = \\tfrac13 \\neq \\tfrac49.$$
Worse, $\\Pr[A \\mid R \\cap N] = \\frac12 < \\Pr[A \\mid R] = \\frac23$: among the people you meet, nice ones *seem* less attractive. There's no causal link — it's purely the **selection filter**.

Takeaway: dependence ≠ causation, and independence assumptions must be justified, never assumed for convenience.`,
    pitfall:
      "Selection effects like this explain many 'surprising' observed correlations: e.g. among admitted students, test scores and grades can look negatively correlated because admission selected on their combination.",
    related: ["mit6120-probability-independence", "mit6120-probability-simpsons-paradox"],
  },
  {
    id: "mit6120-probability-birthday-principle",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Derive the birthday principle: with d people and n equally likely birthdays, a shared birthday becomes likely once d ≈ √n.",
    back: `Assume the $d$ birthdays are independent and uniform over $n$ days. Choosing birthdays one at a time, each must avoid all earlier ones:
$$\\Pr[\\text{no shared birthday}] = \\frac{n-1}{n} \\cdot \\frac{n-2}{n} \\cdots \\frac{n-(d-1)}{n} = \\prod_{i=1}^{d-1}\\left(1 - \\frac{i}{n}\\right).$$

**Upper bound** with $1 - x \\leq e^{-x}$:
$$\\Pr[\\text{no shared birthday}] \\leq e^{-1/n} e^{-2/n} \\cdots e^{-(d-1)/n} = e^{-\\frac{d(d-1)}{2n}}.$$
This is small once $d(d-1)$ is comparable to $n$, i.e. $d \\approx \\sqrt{n}$. $\\blacksquare$

For $n = 365$: $d = 23$ already makes a shared birthday more likely than not (about 50.7%).

**Why it matters in CS** — the "square-root" scaling:
- **Hashing**: inserting about $\\sqrt{m}$ keys into $m$ buckets already makes a collision likely.
- **Cryptography**: finding a collision in a $b$-bit hash takes about $2^{b/2}$ tries, not $2^b$ (the "birthday attack") — why hash outputs need twice the bits of the target security level.
- Random IDs: 64-bit random identifiers start colliding around $2^{32}$ of them.`,
    related: ["mit6120-probability-independence", "mit6120-counting-pigeonhole", "hashing-load-factor"],
  },

  // --- Lecture 21: Random variables ---
  {
    id: "mit6120-probability-random-variables",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a random variable? Define indicators, independence of random variables, PMF and CDF — and give two dependent-looking variables that are independent.",
    back: `A **random variable** (RV) is a **total function** whose domain is the sample space. For three coin flips: the first coin's value, the number of heads $R$, or $M$ = 1 if all three match.
- An **indicator** (Bernoulli) RV takes values in $\\{0, 1\\}$. Every event $A$ has an indicator $\\mathbb{1}[A]$, and every RV value gives an event $[X = x] = \\{\\omega \\mid X(\\omega) = x\\}$. (An event is a **set**; an RV is a **function**.)
- **Independent RVs**: $\\Pr[X = x \\cap Y = y] = \\Pr[X = x]\\Pr[Y = y]$ for **all** values $x, y$ — learning $Y$'s value, whatever it is, tells you nothing about $X$. $X_1, \\ldots, X_n$ are **mutually** independent if the joint probability factors for all value tuples (the smaller sub-collections then follow by summing).
- **PMF** $f(x) = \\Pr[X = x]$; **CDF** $F(x) = \\Pr[X \\leq x]$ — two equivalent descriptions of the **distribution**. Uniform on $\\{1, \\ldots, n\\}$: $f(i) = \\frac1n$, $F(i) = \\frac{i}{n}$.

**Example**: roll two fair dice $D_1, D_2$; let $S = D_1 + D_2$ and $T = \\mathbb{1}[S = 7]$.
- $D_1$ and $S$ are dependent: $\\Pr[S = 5 \\cap D_1 = 6] = 0 \\neq \\Pr[S = 5]\\Pr[D_1 = 6]$.
- $T$ and $D_1$ are **independent**: for every $d$, exactly one value of $D_2$ makes the sum 7, so $\\Pr[T = 1 \\mid D_1 = d] = \\frac16 = \\Pr[T = 1]$ — a symmetry of the problem, despite $T$ being computed from $D_1$.`,
    related: ["mit6120-probability-binomial-distribution", "mit6120-probability-expectation", "mit6120-probability-independence"],
  },
  {
    id: "mit6120-probability-two-envelopes",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Two envelopes hold different unknown integers in [0, 100], chosen adversarially. You open one at random and may switch. Give a strategy that picks the larger with probability strictly above 1/2.",
    back: `**Deterministic strategies can't beat $\\frac12$**: "always switch" or "never switch" ignores what you saw, so it's equivalent to choosing blindly — and the adversary controls the numbers.

**Randomized threshold strategy**: choose $z$ uniformly from $\\{0.5, 1.5, \\ldots, 99.5\\}$ (half-integers, so $z$ never equals an amount). Open a random envelope; if its amount is **above $z$, keep it**; otherwise **switch**.

**Analysis.** Fix any amounts $x_0 \\neq x_1$ (the adversary's choice).
- If $z$ falls **between** them: a large amount is kept and a small one is swapped — you end with the larger **for certain**.
- Otherwise both amounts are on the same side of $z$, so you either always keep or always switch — your random first pick gives success probability exactly $\\frac12$.

At least one of the 100 thresholds lies between $x_0$ and $x_1$, so $\\Pr[z \\text{ between}] \\geq \\frac{1}{100}$, and
$$\\Pr[\\text{win}] \\geq \\frac{1}{100} \\cdot 1 + \\frac{99}{100} \\cdot \\frac12 = \\frac12 + \\frac{1}{200}. \\;\\blacksquare$$

The conceptual point: until now probability **modeled** uncertainty in the world; here we **injected** randomness into an algorithm to beat an adversary — the idea behind randomized algorithms (quicksort pivots, hashing, Miller–Rabin).`,
    related: ["mit6120-probability-random-variables", "sorting-quicksort-randomization", "recursion-dc-las-vegas-vs-monte-carlo"],
  },
  {
    id: "mit6120-probability-binomial-distribution",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does the binomial distribution model? Give its PMF, and say how concentrated it is.",
    back: `**Binomial distribution** with parameters $n$ and $p$: the number $X$ of heads in $n$ **independent** coin flips, each heads with probability $p$ (equivalently, the number of failures among $n$ independently failing components).

**PMF**: each specific sequence with $k$ heads has probability $p^k (1-p)^{n-k}$, and there are $\\binom{n}{k}$ such sequences, so
$$f_{n,p}(k) = \\Pr[X = k] = \\binom{n}{k} p^k (1-p)^{n-k}, \\qquad F_{n,p}(k) = \\sum_{j=0}^{k} \\binom{n}{j} p^j (1-p)^{n-j}.$$

**Concentration**: using Stirling's formula, $f_{n,p}(\\alpha n)$ is roughly $2^{-c\\,n}$ with $c > 0$ unless $\\alpha = p$ — a narrow bump around $pn$ that decays **exponentially** away from it. For $n = 100$, $p = \\frac12$:
- $\\Pr[X = 50] \\approx 0.08$ — even the most likely value is unlikely;
- $\\Pr[X = 25] \\approx 1.9 \\times 10^{-7}$.

The tails are so thin that getting **exactly** 25 heads is more likely than getting **fewer than** 25. Mean and variance: $\\mathbb{E}[X] = np$ and $\\text{Var}[X] = np(1-p)$, so typical deviations are only about $\\sqrt{n}$ — quantified by the Chebyshev and Chernoff bounds.`,
    related: ["mit6120-probability-random-variables", "mit6120-probability-variance-of-sums", "mit6120-probability-chernoff", "mit6120-analysis-factorial-stirling"],
  },

  // --- Lecture 22: Expectation ---
  {
    id: "mit6120-probability-expectation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the expectation of a random variable and give its alternative formulas, including the tail-sum formula and mean time to failure.",
    back: `**Definition**: $\\mathbb{E}[R] = \\sum_{\\omega \\in S} R(\\omega) \\cdot \\Pr[\\omega]$ (the mean or average).

Expected value is **not** "the value you expect to see": a fair die has $\\mathbb{E} = \\frac72$, which it never shows.

**Formulas — don't mix them up:**
1. Over outcomes: $\\sum_{\\omega} R(\\omega)\\Pr[\\omega]$ (definition).
2. Over values: $\\mathbb{E}[R] = \\sum_{x \\in \\text{range}(R)} x \\cdot \\Pr[R = x]$ — group outcomes by value; efficient when there are many outcomes but few values.
3. **Tail sum**, only for $\\text{range}(R) \\subseteq \\mathbb{N}$: $\\mathbb{E}[R] = \\sum_{i \\geq 0} \\Pr[R > i]$ — each $\\Pr[R = i]$ appears in exactly $i$ of the tail terms.
4. Linearity: $\\mathbb{E}[R_1 + R_2] = \\mathbb{E}[R_1] + \\mathbb{E}[R_2]$ (sums over several RVs).

**Indicators**: $\\mathbb{E}[\\mathbb{1}_A] = \\Pr[A]$.

**Mean time to failure**: each part is independently defective with probability $p$; $R$ = parts made up to and including the first defective one. $\\Pr[R > i] = (1-p)^i$, so
$$\\mathbb{E}[R] = \\sum_{i \\geq 0} (1-p)^i = \\frac{1}{1 - (1-p)} = \\frac1p.$$

**Infinite expectations**: if a latency is $i$ ms with probability proportional to $\\frac{1}{i^2}$, then $\\mathbb{E}$ involves $\\sum \\frac1i$, which diverges — yet every sample average is finite. A finite empirical mean says nothing about whether the true mean exists.`,
    pitfall:
      "A classic mistake merges formulas 2 and 3 into Σ i·Pr[R > i]. Each formula sums over something different (outcomes / values / naturals / RVs) — know which one you're using.",
    related: ["mit6120-probability-linearity-of-expectation", "mit6120-probability-random-variables", "mit6120-analysis-geometric-series-perturbation"],
  },
  {
    id: "mit6120-probability-linearity-of-expectation",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove linearity of expectation, and use it to find the expected number of people who get their own phone back when n phones are returned at random.",
    back: `**Theorem.** For any random variables $R_1, R_2$ on the same space: $\\mathbb{E}[R_1 + R_2] = \\mathbb{E}[R_1] + \\mathbb{E}[R_2]$. **No independence needed.**

**Proof.**
$$\\mathbb{E}[R_1 + R_2] = \\sum_\\omega (R_1(\\omega) + R_2(\\omega))\\Pr[\\omega] = \\sum_\\omega R_1(\\omega)\\Pr[\\omega] + \\sum_\\omega R_2(\\omega)\\Pr[\\omega] = \\mathbb{E}[R_1] + \\mathbb{E}[R_2]. \\;\\blacksquare$$
(It extends to any fixed finite number of RVs.) Contrast: $\\Pr[A \\cap B] = \\Pr[A]\\Pr[B]$ needs independence, and $\\Pr[A \\cup B] = \\Pr[A] + \\Pr[B]$ needs disjointness.

**Technique**: write a complicated RV as a **sum of indicators**. Two dice: $\\mathbb{E}[R_1 + R_2] = \\frac72 + \\frac72 = 7$ — even if the dice are perfectly correlated.

**Phone check**: $n$ phones are returned in a uniformly random order. Let $I_i = 1$ if person $i$ gets their own phone. Then $R = I_1 + \\cdots + I_n$ and $\\Pr[I_i = 1] = \\frac1n$, so
$$\\mathbb{E}[R] = \\sum_i \\mathbb{E}[I_i] = n \\cdot \\frac1n = 1.$$
The exact distribution is messy ($\\Pr[R = k] = \\frac{1}{k!}\\sum_{i=0}^{n-k} \\frac{(-1)^i}{i!}$), but linearity skips it entirely. The same calculation works for a spun lazy Susan, where the $I_i$ are as dependent as possible (all $n$ get their phone with probability $\\frac1n$, otherwise nobody does).`,
    pitfall:
      "Linearity holds for sums, but E[R₁·R₂] = E[R₁]·E[R₂] requires independence. Don't extend 'linearity' to products.",
    related: ["mit6120-probability-expectation", "mit6120-probability-variance-of-sums"],
  },

  // --- Lecture 23: Expectation and variance (Lecture 24 review + MCS §20.2–20.3) ---
  {
    id: "mit6120-probability-variance",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Why isn't expectation enough? Define variance and standard deviation, prove Var[R] = E[R²] − E[R]², and give Var[aR + b].",
    back: `**Two games with the same mean**: Game A wins 2 with probability $\\frac23$, loses 1 with probability $\\frac13$; Game B wins 1002 with probability $\\frac23$, loses 2001 with probability $\\frac13$. Both have $\\mathbb{E} = 1$, but B is wildly riskier: ten rounds could lose over 20,000.

**Variance**: $\\text{Var}[R] = \\mathbb{E}\\left[(R - \\mathbb{E}[R])^2\\right]$ — the mean squared deviation. Here $\\text{Var}[A] = 2$ but $\\text{Var}[B] = 2{,}004{,}002$.

**Standard deviation**: $\\sigma_R = \\sqrt{\\text{Var}[R]}$ — same units as $R$ (variance is in "square dollars"). $\\sigma_B \\approx 1416$, a fair summary of deviations of $+1001$ or $-2002$.

**Lemma.** $\\text{Var}[R] = \\mathbb{E}[R^2] - \\mathbb{E}[R]^2$.
*Proof.* Let $\\mu = \\mathbb{E}[R]$. By linearity,
$$\\mathbb{E}[(R - \\mu)^2] = \\mathbb{E}[R^2] - 2\\mu\\,\\mathbb{E}[R] + \\mu^2 = \\mathbb{E}[R^2] - \\mu^2. \\;\\blacksquare$$

**Corollaries:**
- Indicator with $\\Pr[B = 1] = p$: $B^2 = B$, so $\\text{Var}[B] = p - p^2 = p(1-p)$.
- **Constants**: $\\text{Var}[aR] = a^2\\,\\text{Var}[R]$, $\\text{Var}[R + b] = \\text{Var}[R]$, hence $\\sigma_{aR + b} = |a|\\,\\sigma_R$.
- Time to first failure with probability $p$: $\\text{Var}[C] = \\frac{1-p}{p^2}$.

(Lecture 23 has no published notes; this card follows the course's Lecture 24 review and textbook §20.2–20.3.)`,
    related: ["mit6120-probability-variance-of-sums", "mit6120-probability-chebyshev", "mit6120-probability-expectation"],
  },
  {
    id: "mit6120-probability-variance-of-sums",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that variances add for pairwise independent random variables, and derive the variance of the binomial distribution.",
    back: `**Theorem.** If $R_1, \\ldots, R_n$ are **pairwise independent**, then $\\text{Var}\\left[\\sum_i R_i\\right] = \\sum_i \\text{Var}[R_i]$.

**Proof** (two variables; the general case is the same). Shifting by a constant doesn't change variance or independence, so assume $\\mathbb{E}[R] = \\mathbb{E}[S] = 0$; then $\\text{Var}[T] = \\mathbb{E}[T^2]$ for each of $R$, $S$, $R + S$. For independent $R, S$, $\\mathbb{E}[RS] = \\mathbb{E}[R]\\,\\mathbb{E}[S] = 0$, so
$$\\mathbb{E}[(R + S)^2] = \\mathbb{E}[R^2] + 2\\,\\mathbb{E}[RS] + \\mathbb{E}[S^2] = \\mathbb{E}[R^2] + \\mathbb{E}[S^2]. \\;\\blacksquare$$

For $n$ variables, the cross terms $\\mathbb{E}[R_i R_j] - \\mathbb{E}[R_i]\\mathbb{E}[R_j]$ vanish pair by pair — which is why **pairwise** independence suffices.

**Without independence it fails**: if $S = R$, then $\\text{Var}[2R] = 4\\,\\text{Var}[R] \\neq 2\\,\\text{Var}[R]$ (unless $\\text{Var}[R] = 0$).

**Binomial**: $J = \\sum_{k=1}^{n} I_k$ with independent indicators, each $\\text{Var} = p(1-p)$, so
$$\\text{Var}[J] = np(1-p), \\qquad \\sigma_J = \\sqrt{np(1-p)}.$$
For $n$ fair coins: mean $\\frac n2$, standard deviation $\\frac{\\sqrt n}{2}$.

**Matching birthdays**: the indicators "students $i, j$ share a birthday" are pairwise (but not 3-way) independent. With 95 students and 365 days: $\\mathbb{E}[M] = \\binom{95}{2}/365 \\approx 12.23$ and $\\text{Var}[M] < 12.2$.

**Standard deviations don't add**: for independent variables, $\\sigma_{R+S}^2 = \\sigma_R^2 + \\sigma_S^2$, not $\\sigma_{R+S} = \\sigma_R + \\sigma_S$.`,
    related: ["mit6120-probability-variance", "mit6120-probability-pairwise-vs-mutual", "mit6120-probability-binomial-distribution"],
  },

  // --- Lecture 24: Large deviations ---
  {
    id: "mit6120-probability-markov",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State and prove Markov's inequality, show why non-negativity is required, and explain the 'shift the variable' trick.",
    back: `**Markov's inequality.** If $R \\geq 0$ and $x > 0$: $\\displaystyle \\Pr[R \\geq x] \\leq \\frac{\\mathbb{E}[R]}{x}$; equivalently $\\Pr[R \\geq c\\,\\mathbb{E}[R]] \\leq \\frac1c$.

**Proof.** By total expectation,
$$\\mathbb{E}[R] = \\mathbb{E}[R \\mid R \\geq x]\\Pr[R \\geq x] + \\mathbb{E}[R \\mid R < x]\\Pr[R < x] \\geq x \\cdot \\Pr[R \\geq x] + 0,$$
since the first conditional expectation is at least $x$ and the second is at least 0 (**this is where $R \\geq 0$ is used**). Rearrange. $\\blacksquare$

Example: if the mean weight is 100, at most half the population weighs 200 or more — not a probabilistic claim at all.

**Non-negativity matters**: $R = \\pm 1$ with probability $\\frac12$ each has $\\mathbb{E}[R] = 0$, but $\\Pr[R \\geq \\frac12] = \\frac12$, not $\\leq 0$.

**Shift trick**: test scores in $[30, 100]$ with mean 75.
- $\\Pr[R \\geq 90] \\leq \\frac{75}{90} \\approx 0.83$ directly; better, apply Markov to $R - 30 \\geq 0$: $\\Pr[R - 30 \\geq 60] \\leq \\frac{45}{60} = 0.75$.
- **Lower tails** via an upper bound: $\\Pr[R \\leq 65] = \\Pr[100 - R \\geq 35] \\leq \\frac{25}{35} \\approx 0.71$.

**Often loose**: if $n$ phones are randomly permuted, $\\mathbb{E}[\\text{matches}] = 1$, so Markov gives $\\Pr[\\text{all } n \\text{ match}] \\leq \\frac1n$ — but the truth is $\\frac{1}{n!}$. Markov only knows the mean.`,
    related: ["mit6120-probability-chebyshev", "mit6120-probability-linearity-of-expectation"],
  },
  {
    id: "mit6120-probability-chebyshev",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State and prove Chebyshev's inequality, and compare it with Markov's on n fair coin flips.",
    back: `**Chebyshev's inequality.** For **any** random variable $R$ (not necessarily non-negative) and $x > 0$:
$$\\Pr\\big[|R - \\mathbb{E}[R]| \\geq x\\big] \\leq \\frac{\\text{Var}[R]}{x^2}; \\qquad \\text{equivalently} \\quad \\Pr\\big[|R - \\mathbb{E}[R]| \\geq c\\,\\sigma_R\\big] \\leq \\frac{1}{c^2}.$$

**Proof.** Apply Markov to the **non-negative** RV $(R - \\mathbb{E}[R])^2$:
$$\\Pr\\big[|R - \\mathbb{E}[R]| \\geq x\\big] = \\Pr\\big[(R - \\mathbb{E}[R])^2 \\geq x^2\\big] \\leq \\frac{\\mathbb{E}[(R - \\mathbb{E}[R])^2]}{x^2} = \\frac{\\text{Var}[R]}{x^2}. \\;\\blacksquare$$

So the variance controls how far an RV strays from its mean: at most $\\frac{1}{c^2}$ probability of being $c$ standard deviations away.

**Examples**:
- Test scores with mean 75, variance 25: $\\Pr[\\text{score} \\leq 65] \\leq \\Pr[|\\text{score} - 75| \\geq 10] \\leq \\frac{25}{100} = 0.25$.
- IQ with mean 100, $\\sigma = 15$: $\\Pr[\\text{IQ} \\geq 300] \\leq \\frac{225}{200^2}$ — at most 1 person in 178 (Markov only gave $\\frac13$).
- **$n$ fair coins**, $R$ = heads, $\\mathbb{E} = \\frac n2$, $\\text{Var} = \\frac n4$: Markov gives $\\Pr[R \\geq \\frac{3n}{4}] \\leq \\frac23$; Chebyshev gives $\\Pr[|R - \\frac n2| \\geq \\frac n4] \\leq \\frac{n/4}{(n/4)^2} = \\frac4n$ — vanishing as $n$ grows.

Chebyshev needs only **pairwise** independence (to compute the variance), which is what makes it useful for pairwise-independent samples and hash families.`,
    related: ["mit6120-probability-markov", "mit6120-probability-chernoff", "mit6120-probability-variance-of-sums"],
  },
  {
    id: "mit6120-probability-chernoff",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the Chernoff bound, what independence it needs, and how much better it is than Chebyshev for n coin flips.",
    back: `**Chernoff bound.** Let $T_1, \\ldots, T_n$ be **mutually independent** RVs with $0 \\leq T_i \\leq 1$, and $T = \\sum_i T_i$. For all $c \\geq 1$:
$$\\Pr\\big[T \\geq c\\,\\mathbb{E}[T]\\big] \\leq e^{-(c \\ln c - c + 1)\\,\\mathbb{E}[T]}.$$
(The proof applies Markov to $c^{T}$; see textbook §20.5.6.)

**Coin flips**, $R$ = heads in $n$ fair flips, $\\mathbb{E}[R] = \\frac n2$, and $c = \\frac32$ (so $c \\ln c - c + 1 \\approx 0.108 > 0.1$):
$$\\Pr\\big[R \\geq \\tfrac{3n}{4}\\big] \\leq e^{-0.1 \\cdot n/2} = e^{-n/20}.$$

| Bound | Uses | $\\Pr[R \\geq 3n/4]$ |
|---|---|---|
| Markov | mean | $\\leq \\frac23$ |
| Chebyshev | variance (pairwise independence) | $\\leq \\frac4n$ |
| Chernoff | mutual independence, bounded terms | $\\leq e^{-n/20}$ |

Each extra assumption buys a dramatically stronger bound — Chernoff is **exponentially** small.

**Concentration**: with $c = 1 + \\frac{4}{\\sqrt n}$ one gets $\\Pr\\big[R \\geq \\frac n2 + 2\\sqrt n\\big] \\leq 0.02$ for large $n$. Deviations are on the order of $\\sqrt n$, which is tiny relative to $n$ — the count clusters ever more tightly (proportionally) around its mean. This is why sampling, load balancing and randomized algorithms work reliably.`,
    pitfall:
      "Chernoff needs MUTUAL independence and bounded (0 to 1) terms. For merely pairwise-independent variables, Chebyshev is the right tool.",
    related: ["mit6120-probability-chebyshev", "mit6120-probability-binomial-distribution", "mit6120-probability-pairwise-vs-mutual"],
  },
];
