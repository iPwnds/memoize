// MIT 6.1200J (formerly 6.042J) Mathematics for Computer Science, Spring
// 2024 — Unit 5: Counting (Lectures 15-17). Sourced from the course's own
// lecture notes, read page-by-page. Lecture 15 covers relations (functions,
// total/injective/surjective/bijective), relations on one set, equivalence
// relations and weak partial orders, and the product, sum and bijection
// rules. Lecture 16 covers the generalized product rule, the division rule,
// binomial coefficients, and counting with recipes (poker hands). Lecture 17
// covers inclusion-exclusion, the pigeonhole principle, combinatorial
// (double-counting) proofs, and the binomial/multinomial theorems. Unlike
// Units 2-4, almost none of this exists elsewhere in the app — it's one of
// the core gaps against KU Leuven's "Bewijzen en redeneren" (relations,
// functions, equivalence relations, orders, counting). Two slips in the
// notes are corrected here: the 3-set inclusion-exclusion formula ends in
// +|A ∩ B ∩ C| (the notes print ∪), and the password count is ≈ 9.3·10¹³.
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6120-counting";

export const mit6120CountingCards: Card[] = [
  // --- Lecture 15: Relations and counting ---
  {
    id: "mit6120-counting-relations-and-functions",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Define a relation R ⊆ A × B, and the properties function, total, injective, surjective and bijection. How do they compare set sizes?",
    back: `A **relation** $R \\subseteq A \\times B$ has a **domain** $A$, a **codomain** $B$, and a set of ordered pairs; write $a\\,R\\,b$ for $(a, b) \\in R$ and picture it as an arrow $a \\to b$. (A binary relation is exactly a two-column table in a relational database.)

| Property | Arrows | Meaning |
|---|---|---|
| **function** $R: A \\to B$ | $\\leq 1$ **out** of each $a$ | no input has two outputs |
| **total** | $\\geq 1$ **out** of each $a$ | every input has an output |
| **injective** | $\\leq 1$ **in** to each $b$ | no two inputs share an output |
| **surjective** | $\\geq 1$ **in** to each $b$ | every output is hit |
| **bijection** | exactly 1 out, exactly 1 in | total function, injective and surjective |

**Domain and codomain are part of the relation.** $f(x) = 1/x^2$ is **not total** as a function $\\mathbb{R} \\to \\mathbb{R}$ ($f(0)$ is undefined), but it **is total** as a function $\\mathbb{R}_{\\neq 0} \\to \\mathbb{R}_{\\neq 0}$ — with exactly the same set of pairs. Properties can't be judged from the pairs alone.

**Comparing sizes** (finite $A, B$) — count the arrows:
- total **injection** $A \\to B$ ⇒ $|A| \\leq \\#\\text{arrows} \\leq |B|$, so $|A| \\leq |B|$;
- **surjective function** $A \\to B$ ⇒ $|A| \\geq |B|$;
- **bijection** ⇒ $|A| = |B|$ — the basis of almost every counting argument.`,
    pitfall:
      "Programmers' 'function' (always returns something) is a TOTAL function. In math, 'function' alone only forbids multiple outputs — partial functions are still functions.",
    related: ["mit6120-counting-equivalence-relations", "mit6120-counting-product-sum-bijection-rules", "mit6120-proofs-sets-basics"],
  },
  {
    id: "mit6120-counting-equivalence-relations",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define reflexive, symmetric and transitive relations, and prove that an equivalence relation partitions its set into equivalence classes.",
    back: `A **binary relation on $A$** is $R \\subseteq A \\times A$ — literally the same thing as a **digraph** on vertex set $A$. Familiar examples: $=$, $\\equiv \\pmod{10}$, $\\leq$, $\\subseteq$, $\\mid$, reachability in a digraph.

- **Reflexive**: $a\\,R\\,a$ for all $a$.
- **Symmetric**: $a\\,R\\,b \\iff b\\,R\\,a$.
- **Transitive**: $a\\,R\\,b$ and $b\\,R\\,c$ ⇒ $a\\,R\\,c$.
- **Equivalence relation**: all three. These three rules capture "sameness": same remainder mod 10, same connected component of a graph.

**Theorem.** If $R$ is an equivalence relation on $A$, the classes $[a] = \\{x \\in A \\mid a\\,R\\,x\\}$ partition $A$, and $a\\,R\\,b$ iff $a$ and $b$ lie in the same class.

**Proof.**
- *Every element is in a class*: $a \\in [a]$ by reflexivity.
- *Classes are equal or disjoint*: suppose $c \\in [a] \\cap [b]$, so $a\\,R\\,c$ and $b\\,R\\,c$; by symmetry $c\\,R\\,b$, and by transitivity $a\\,R\\,b$. Now for any $x \\in [b]$: $a\\,R\\,b$ and $b\\,R\\,x$ give $a\\,R\\,x$, so $x \\in [a]$; thus $[b] \\subseteq [a]$, and symmetrically $[a] \\subseteq [b]$.
- *Same class iff related*: if $a\\,R\\,b$ then $b \\in [a]$ and $b \\in [b]$, so $[a] = [b]$ by the previous point; conversely if $b \\in [a]$ then $a\\,R\\,b$ by definition. $\\blacksquare$

(The lecture states this theorem without proof; the argument above is the standard one.) Example: $\\equiv_5$ has the five classes $[0], \\ldots, [4]$.`,
    pitfall:
      "Symmetric + transitive does NOT imply reflexive: the empty relation on a non-empty set is symmetric and transitive but not reflexive. All three properties must be checked.",
    related: ["mit6120-counting-weak-partial-orders", "mit6120-number-theory-congruence-and-remainders", "mit6120-graphs-walks-paths-components"],
  },
  {
    id: "mit6120-counting-weak-partial-orders",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define antisymmetry, a weak partial order and a total (linear) order. Which of ≤, ⊆ and divisibility are total orders?",
    back: `To capture "behaves like $\\leq$", keep **reflexive** and **transitive** but replace symmetry with:
- **Antisymmetric**: $a\\,R\\,b$ and $b\\,R\\,a$ ⇒ $a = b$ ("can't be both bigger and smaller unless equal").
- **Weak partial order (WPO)**: reflexive, antisymmetric and transitive.

Examples: $\\leq$ on numbers, $\\subseteq$ on sets, $\\mid$ on **positive** integers, "is a prerequisite of (or equal to)" — the walk relation of a **DAG** is a WPO.

$a, b$ are **comparable** if $a\\,R\\,b$ or $b\\,R\\,a$. A WPO in which **every** pair is comparable is a **total** (linear) order — the elements line up left to right.

| Relation | WPO? | Total? |
|---|---|---|
| $\\leq$ on $\\mathbb{R}$ | yes | **yes** |
| $\\subseteq$ on sets | yes | no — $\\{1\\}$, $\\{2\\}$ incomparable |
| $\\mid$ on $\\mathbb{Z}^+$ | yes | no — 2 and 3 incomparable |
| walk relation of a DAG | yes | usually no — left sock / right sock |

Partial orders are exactly what scheduling, dependency resolution and version history need: some pairs are forced into an order, others are free. A topological order is a total order **extending** a partial order.`,
    pitfall:
      "Divisibility is NOT antisymmetric on all integers: 2 | −2 and −2 | 2, yet 2 ≠ −2. It's a WPO only on the positive (or natural) numbers.",
    related: ["mit6120-counting-equivalence-relations", "mit6120-graphs-topological-order", "mit6120-graphs-parallel-scheduling-chains"],
  },
  {
    id: "mit6120-counting-product-sum-bijection-rules",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the product, sum and bijection rules, and use them to count n-bit strings, subsets of an n-set, and passwords.",
    back: `**Product rule**: $|A_1 \\times \\cdots \\times A_n| = |A_1| \\cdots |A_n|$. Use it when making a choice from $A_1$ **AND** from $A_2$ … Binary strings of length $n$ are $\\{0, 1\\}^n$, so there are $2^n$.

**Sum rule**: if $A_1, \\ldots, A_n$ are **pairwise disjoint**, $|A_1 \\cup \\cdots \\cup A_n| = |A_1| + \\cdots + |A_n|$. Use it for a choice from $A_1$ **OR** $A_2$ … (10 shirts and 6 pants: 16 garments to pick *one* from, but $10 \\cdot 6 = 60$ outfits.)

**Bijection rule**: a bijection $A \\to B$ gives $|A| = |B|$. Count something hard by matching it with something easy. (The parable: a shepherd who can't count tracks sheep with pebbles — one pebble per sheep is a bijection.)

**Subsets**: map $S \\subseteq \\{1, \\ldots, n\\}$ to the $n$-bit string whose $i$-th bit is 1 iff $i \\in S$ (e.g. $\\{1, 2, 5\\} \\mapsto 11001\\ldots0$). That's a bijection, so there are $2^n$ subsets.

**Passwords** of length 6–8, starting with a capital letter, then capitals/lowercase/digits (62 options): split by length (sum rule, disjoint), then product rule per length:
$$|W| = 26 \\cdot 62^5 + 26 \\cdot 62^6 + 26 \\cdot 62^7 \\approx 9.3 \\times 10^{13}.$$`,
    pitfall:
      "The sum rule needs DISJOINT sets — adding overlapping counts double-counts the overlap. For overlapping sets, use inclusion–exclusion.",
    related: ["mit6120-counting-generalized-product-rule", "mit6120-counting-inclusion-exclusion", "bit-manipulation-bitmask-subsets"],
  },

  // --- Lecture 16: Counting ---
  {
    id: "mit6120-counting-generalized-product-rule",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the generalized product rule and give an example where it applies and one where it does not.",
    back: `**Generalized product rule**: if $A$ is a set of length-$k$ sequences with exactly $n_1$ possible first entries, and for each $i$ exactly $n_i$ possible $i$-th entries **no matter which earlier entries were chosen**, then $|A| = n_1 n_2 \\cdots n_k$.

The **set** of options may depend on earlier choices; only the **number** of options must not.

**Applies — shuffled decks**: 52 choices of first card, then 51, …, then 1: $52! \\approx 8 \\times 10^{67}$ orders. In general a **permutation** of an $n$-set (a sequence using each element once) — there are $n!$.

**Applies — dollar bills**: 8-digit serial numbers with **no repeated digit**: $10 \\cdot 9 \\cdot 8 \\cdots 3$ out of $10^8$ total, so only about **1.8%** of bills avoid a repeated digit.

**Does not apply — increasing serials**: 3-digit serials $abc$ with $a < b < c$. The number of options for $b$ depends on $a$ ($a = 7$ forces $b \\in \\{8\\}$, but $a = 0$ allows 8 values), so the rule can't be used directly. Instead notice that such serials correspond **bijectively** to 3-element subsets of $\\{0, \\ldots, 9\\}$ (choose the digits, then write them in increasing order) — counted with the division rule.`,
    related: ["mit6120-counting-division-rule-binomial", "mit6120-counting-product-sum-bijection-rules"],
  },
  {
    id: "mit6120-counting-division-rule-binomial",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the division rule, use it to count seatings at a round table, and derive the formula for the binomial coefficient C(n, r).",
    back: `**Division rule**: if $f: A \\to B$ is a **total function** in which every $b \\in B$ has **exactly $k$** arrows in (a $k$-to-1 correspondence), then $|B| = |A| / k$.

**Round table**: $n$ knights, seatings considered the same up to rotation ($abcd \\equiv bcda \\equiv cdab \\equiv dabc$). Map each of the $n!$ permutations to its cyclic order; each cyclic order arises from exactly $n$ rotations, so there are $n!/n = (n-1)!$ seatings.

**Binomial coefficient.** How many $r$-element subsets does an $n$-set have?
*Derivation.* Let $A$ be the **ordered** sequences of $r$ distinct elements: by the generalized product rule $|A| = n(n-1)\\cdots(n-r+1) = \\frac{n!}{(n-r)!}$. Map each sequence $(a_1, \\ldots, a_r)$ to the set $\\{a_1, \\ldots, a_r\\}$. Each $r$-subset comes from exactly $r!$ orderings, so this is $r!$-to-1, and
$$\\binom{n}{r} = \\frac{n!}{(n-r)!\\;r!}. \\;\\blacksquare$$

(Equivalently: map each permutation of the whole $n$-set to the set of its first $r$ entries — that's $r!\\,(n-r)!$-to-1.)

Examples: increasing 3-digit serials $= \\binom{10}{3} = 120$; 4 volunteers from 350 $= \\binom{350}{4}$; 100 coin flips with exactly 50 heads $= \\binom{100}{50}$ — only about **8%** of all $2^{100}$ outcomes.`,
    pitfall:
      "The division rule needs EVERY element of B to have exactly k preimages. If some targets have more than others, you cannot simply divide.",
    related: ["mit6120-counting-generalized-product-rule", "mit6120-counting-poker-recipes", "mit6120-counting-combinatorial-proofs"],
  },
  {
    id: "mit6120-counting-poker-recipes",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Count 5-card poker hands with four of a kind, and hands containing all four suits — and show why the obvious recipe for the second one overcounts.",
    back: `**Counting with recipes**: describe each object by a sequence of choices, count the choices with the generalized product rule, then **check the map is a bijection**: (1) every recipe produces an object in the set, and (2) every object comes from **exactly one** recipe.

A deck has 13 ranks × 4 suits = 52 cards; a hand is a 5-element subset, so there are $\\binom{52}{5}$ hands.

**Four of a kind** — recipe $(R, C)$: choose the rank $R$ of the four (13 ways), then the extra card $C$ of a different rank (48 ways). Every recipe gives a four-of-a-kind hand, and every such hand determines $R$ and $C$ uniquely: a bijection. Answer: $13 \\cdot 48 = 624$.

**All four suits — first attempt**: choose a rank for clubs, hearts, spades, diamonds ($13^4$), then any extra card (48): $13^4 \\cdot 48$. **Check (2) fails**: $\\{6\\diamondsuit, Q\\heartsuit, A\\spadesuit, 2\\clubsuit, J\\spadesuit\\}$ comes from choosing $A\\spadesuit$ as "the spade" with extra $J\\spadesuit$, **and** from choosing $J\\spadesuit$ with extra $A\\spadesuit$. Every hand arises exactly twice (the two cards of the doubled suit can swap roles) — a 2-to-1 map. Answer: $13^4 \\cdot 48 / 2 = 685{,}464$.

**A recipe with no overcount**: choose the doubled suit (4), two ranks for it ($\\binom{13}{2}$), and a rank for each other suit ($13^3$): $4 \\cdot \\binom{13}{2} \\cdot 13^3 = 685{,}464$. ✓ (Confirmed by brute force over all $\\binom{52}{5}$ hands.)`,
    pitfall:
      "A recipe that 'feels' right usually produces every object — the error is producing some objects more than once. Always test check (2) on a concrete object.",
    related: ["mit6120-counting-complement-at-least-one-pair", "mit6120-counting-division-rule-binomial"],
  },
  {
    id: "mit6120-counting-complement-at-least-one-pair",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Why does the direct recipe for 'poker hands with at least one pair' fail, and how does counting the complement fix it?",
    back: `**Direct attempt**: choose the pair's rank (13), its two suits ($\\binom42$), then any 3 more cards ($\\binom{50}{3}$). Every result has a pair — but hands are produced a **varying** number of times:
- two pair $\\{A\\heartsuit, A\\spadesuit, 2\\clubsuit, 2\\diamondsuit, 3\\heartsuit\\}$: **2** ways (either pair can be "the" pair);
- three of a kind: **3** ways; full house: **4** ways; four of a kind: **6** ways.

It isn't even $k$-to-1 for a fixed $k$, so the division rule can't rescue it.

**Count the complement instead** — hands with **no** pair (all 5 ranks distinct):
- choose 5 distinct ranks $\\binom{13}{5}$, then a suit for each, $4^5$: $\\binom{13}{5} \\cdot 4^5 = 1{,}317{,}888$; or
- ordered lists of 5 cards with distinct ranks, $52 \\cdot 48 \\cdot 44 \\cdot 40 \\cdot 36$, divided by $5!$ orderings — the same number.

So hands with at least one pair:
$$\\binom{52}{5} - \\binom{13}{5} \\cdot 4^5 \\approx 49.3\\% \\text{ of all hands}.$$

General lesson: "**at least one**" is usually easier as **total minus none**.`,
    related: ["mit6120-counting-poker-recipes", "mit6120-counting-inclusion-exclusion"],
  },

  // --- Lecture 17: More counting ---
  {
    id: "mit6120-counting-inclusion-exclusion",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State inclusion–exclusion for 2, 3 and n sets, and use it to count the integers in {1, …, pqr} coprime to pqr.",
    back: `**Two sets**: $|A \\cup B| = |A| + |B| - |A \\cap B|$. Queens or hearts: $4 + 13 - 1 = 16$ (the queen of hearts was counted twice).

**Three sets**:
$$|A \\cup B \\cup C| = |A| + |B| + |C| - |A \\cap B| - |A \\cap C| - |B \\cap C| + |A \\cap B \\cap C|.$$

**$n$ sets**: add the sets, subtract all pairwise intersections, add all triple intersections, …, ending with $\\pm |A_1 \\cap \\cdots \\cap A_n|$:
$$\\Big|\\bigcup_{i} A_i\\Big| = \\sum_{\\emptyset \\neq I \\subseteq [n]} (-1)^{|I|+1} \\Big|\\bigcap_{i \\in I} A_i\\Big|.$$

**Application**: $n = pqr$ with distinct primes $p, q, r$. Let $A_p$ = multiples of $p$ in $\\{1, \\ldots, n\\}$, etc. Then $|A_p| = n/p = qr$, $|A_p \\cap A_q| = n/(pq) = r$, $|A_p \\cap A_q \\cap A_r| = 1$, so
$$|A_p \\cup A_q \\cup A_r| = qr + pr + pq - r - q - p + 1 = n - (p-1)(q-1)(r-1).$$
The numbers **coprime** to $n$ are the rest: exactly $(p - 1)(q - 1)(r - 1)$. (Check with $3 \\cdot 5 \\cdot 7 = 105$: 48 coprime numbers $= 2 \\cdot 4 \\cdot 6$.) This is Euler's totient $\\varphi(n)$ — and the same count, $(p-1)(q-1)$, is the modulus used to build RSA keys.`,
    related: ["mit6120-counting-inclusion-exclusion-proof", "mit6120-counting-product-sum-bijection-rules", "mit6120-number-theory-rsa-correctness"],
  },
  {
    id: "mit6120-counting-inclusion-exclusion-proof",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the general inclusion–exclusion principle by showing each element contributes exactly 0 to the signed sum.",
    back: `**Statement (signed form).** Let $U = A_1 \\cup \\cdots \\cup A_n$ be finite, and adopt the convention $\\bigcap_{i \\in \\emptyset} A_i = U$. Then
$$\\sum_{I \\subseteq [n]} (-1)^{|I|} \\Big|\\bigcap_{i \\in I} A_i\\Big| = 0.$$
Moving the $I = \\emptyset$ term ($|U|$) to the other side gives the usual alternating formula for $|A_1 \\cup \\cdots \\cup A_n|$.

**Proof.** Count each element's contribution. Fix $x \\in U$ and let $I_x = \\{i \\mid x \\in A_i\\}$ — non-empty, since $x$ lies in at least one $A_i$. Then $x \\in \\bigcap_{i \\in I} A_i$ exactly when $I \\subseteq I_x$, so $x$ contributes
$$\\sum_{I \\subseteq I_x} (-1)^{|I|} = (\\#\\text{even-size subsets of } I_x) - (\\#\\text{odd-size subsets of } I_x).$$
Pick any $i \\in I_x$. The map "toggle $i$" ($I \\mapsto I \\triangle \\{i\\}$: add $i$ if absent, remove it if present) is its own inverse, so it is a **bijection**, and it changes the size by exactly 1 — swapping even and odd sizes. So there are equally many even- and odd-size subsets, and $x$ contributes $0$. Summing over all $x \\in U$, the total is 0. $\\blacksquare$

This "every element contributes 0 via a sign-reversing involution" technique is a standard tool for proving alternating-sum identities.`,
    related: ["mit6120-counting-inclusion-exclusion", "mit6120-counting-combinatorial-proofs"],
  },
  {
    id: "mit6120-counting-pigeonhole",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the pigeonhole principle (and its generalization), and use it to prove that no lossless compression scheme shortens every n-bit string.",
    back: `**Pigeonhole principle**: if $|A| > |B|$, no total function $f: A \\to B$ is injective — some $a_1 \\neq a_2$ have $f(a_1) = f(a_2)$. (More pigeons than holes ⇒ two share a hole.)

**Generalized**: if $|A| > k\\,|B|$, some $b$ receives at least $k + 1$ elements of $A$.

Examples:
- With more than 26 people in a room, two names start with the same letter.
- $n$ differently colored pairs of socks: $n + 1$ single socks guarantee a matching pair — and $n$ don't (one of each color).
- Two non-bald Bostonians have exactly the same number of hairs (about 650,000 people, at most about 200,000 hairs each). **Non-constructive**: we know they exist without knowing who.

**Theorem.** No lossless compression scheme maps every $n$-bit string to a strictly shorter string.

**Proof.** There are $2^n$ strings of length $n$, but only $2^{n-1} + \\cdots + 2^1 + 2^0 = 2^n - 1$ strictly shorter strings (including the empty one). A total function from the larger set to the smaller one can't be injective, so two inputs compress to the same output — and decompression can't recover both. $\\blacksquare$

**Cleverness is in the holes**: 33 rooks on a chessboard always include 5 that don't attack each other. Label cell $(r, c)$ with $(r + c) \\bmod 8$; each of the 8 labels marks 8 cells in distinct rows and columns. $33 > 4 \\cdot 8$, so by the generalized principle some label carries at least 5 rooks — pairwise non-attacking.`,
    pitfall:
      "The same argument shows hash functions into a smaller range MUST have collisions — collision-resistance is about collisions being hard to FIND, not about their absence.",
    related: ["mit6120-counting-relations-and-functions", "hashing-good-hash-function", "mit6045-automata-pumping-lemma-statement"],
  },
  {
    id: "mit6120-counting-combinatorial-proofs",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Give combinatorial (double-counting) proofs that Σₖ C(n, k) = 2ⁿ and that C(n, k) = C(n−1, k−1) + C(n−1, k).",
    back: `**Combinatorial proof**: count one set in two different ways; the two expressions must be equal. It explains *why* an identity holds, where algebra on factorials only verifies it.

**$\\sum_{k=0}^{n} \\binom{n}{k} = 2^n$.** Let $S$ be the set of all subsets of $\\{1, \\ldots, n\\}$.
- Way 1: each element is in or out, so $|S| = 2^n$.
- Way 2: partition $S$ by size, $S_k$ = subsets of size $k$, with $|S_k| = \\binom{n}{k}$; by the sum rule $|S| = \\sum_k \\binom{n}{k}$. $\\blacksquare$

**Pascal's identity** $\\binom{n}{k} = \\binom{n-1}{k-1} + \\binom{n-1}{k}$. Count the $k$-subsets of $\\{1, \\ldots, n\\}$ by whether they contain $n$:
- containing $n$: pick the other $k - 1$ elements from $\\{1, \\ldots, n-1\\}$: $\\binom{n-1}{k-1}$;
- not containing $n$: pick all $k$ from $\\{1, \\ldots, n-1\\}$: $\\binom{n-1}{k}$.

The two cases are disjoint and exhaustive, so the sum rule gives the identity. $\\blacksquare$

This is why each entry of **Pascal's triangle** is the sum of the two above it; row $n$ sums to $2^n$, and the shallow diagonals sum to Fibonacci numbers.

Exercise in the same style: find a combinatorial proof that $\\sum_k \\binom{n}{k}^2 = \\binom{2n}{n}$. (Hint: choose $n$ people from $n$ men and $n$ women.)`,
    related: ["mit6120-counting-binomial-multinomial-theorem", "mit6120-counting-division-rule-binomial", "dynamic-programming-climbing-stairs"],
  },
  {
    id: "mit6120-counting-binomial-multinomial-theorem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State and explain the binomial theorem and the multinomial theorem.",
    back: `**Binomial theorem**: for any $x, y$ and $n \\in \\mathbb{N}$ (with $0^0 = 1$),
$$(x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^k y^{n-k}.$$

*Why*: expanding $(x + y)(x + y)\\cdots(x + y)$ gives $2^n$ terms $a_1 a_2 \\cdots a_n$, each $a_i$ being $x$ or $y$. The terms equal to $x^k y^{n-k}$ are those where exactly $k$ factors chose $x$ — one for each $k$-subset of the $n$ positions, so $\\binom{n}{k}$ of them.

Example: $(x + y)^3 = y^3 + 3xy^2 + 3x^2y + x^3$, coefficients $\\binom30, \\binom31, \\binom32, \\binom33$. Setting $x = y = 1$ recovers $\\sum_k \\binom{n}{k} = 2^n$.

**Multinomial theorem**:
$$(x_1 + \\cdots + x_m)^n = \\sum_{k_1 + \\cdots + k_m = n} \\binom{n}{k_1, \\ldots, k_m} x_1^{k_1} \\cdots x_m^{k_m}, \\qquad \\binom{n}{k_1, \\ldots, k_m} = \\frac{n!}{k_1!\\,k_2! \\cdots k_m!},$$
summing over non-negative $k_i$. The multinomial coefficient counts ways to split $n$ positions into labeled groups of sizes $k_1, \\ldots, k_m$ — e.g. the distinct rearrangements of a word with repeated letters ("bookkeeper": $\\frac{10!}{1!\\,2!\\,2!\\,3!\\,1!\\,1!}$ for b, o, k, e, p, r).`,
    related: ["mit6120-counting-combinatorial-proofs", "mit6120-counting-division-rule-binomial"],
  },
];
