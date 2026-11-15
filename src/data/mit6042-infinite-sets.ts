// MIT 6.042J Mathematics for Computer Science (Spring 2015, Albert R. Meyer &
// Adam Chlipala) — Infinite Sets (Session 11). Sourced from the course's
// OCW-hosted textbook chapter, "Mathematics for Computer Science" (Lehman,
// Leighton & Meyer, 2015 edition) Chapter 7, read page by page: infinite
// cardinality via surj/inj/bij (with the definitions from §4.5), the
// Schröder-Bernstein theorem, countable sets, Cantor's theorem and the
// diagonal argument, uncountability of the reals, the halting problem as a
// diagonal argument, Russell's paradox, the ZFC axioms, and the
// continuum hypothesis. This fills the infinite-cardinality and
// diagonalization part of KU Leuven's "Bewijzen en redeneren", which neither
// the 6.1200J OCW notes nor 24.241 cover. The halting-problem card is kept
// short and links to the 6.045J computability cards rather than repeating
// them. Every explicit example (the integer listing, the prime-exponent
// encoding of 20 and 6615, the 6×6 diagonal, the decimal-to-bit-string
// map) was recomputed.
// Corrections / additions:
//  - pdftotext drops the minus signs in the text's listing of ℤ and its
//    formula; the card gives f(n) = n/2 for even n and −(n+1)/2 for odd n,
//    which produces the listed order 0, −1, 1, −2, 2, … (checked).
//  - MCS defines "A surj B" with a possibly *partial* surjective function
//    (MCS functions are [≤ 1 out]); the card states this convention
//    explicitly, since most texts use total functions and the difference
//    matters for the empty set and for the reals-to-bit-strings map.
//  - The text states Theorem 7.1.5 (any two sets are comparable) without
//    proof; the card notes it depends on the axiom of choice, which is
//    context beyond the source.
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6042-infinite";

export const mit6042InfiniteSetsCards: Card[] = [
  {
    id: "mit6042-infinite-surj-inj-bij",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does MCS compare sizes of possibly infinite sets with surj, inj, bij and strict? What carries over from finite sets automatically?",
    back: `**Definitions** (MCS 4.5.2 and 7.1.1). For any sets A and B:
- **A surj B** iff there is a **surjective function** from A to B. In MCS a function is a relation with **at most one** arrow out of each element, so it may be partial. Surjective means every element of B gets **at least one** arrow in.
- **A inj B** iff there is a **total injective** relation from A to B.
- **A bij B** iff there is a **bijection** from A to B.
- **A strict B** iff **NOT(A surj B)**.

Cantor's idea: read "A surj B" as "A is **at least as big as** B", "A bij B" as "**same size**", and "A strict B" as "**strictly smaller**". For finite sets this matches counting exactly (the Mapping Rules): A surj B iff |A| ≥ |B|, and A strict B iff |A| < |B|.

**Lemma 7.1.3**, which carries over to infinite sets with easy proofs:
1. A surj B iff B inj A (invert the arrows);
2. surj is transitive (compose surjections);
3. bij is transitive;
4. bij is symmetric.

**Warning from the text**: no "size" of an infinite set is defined. That would require ordinals. Only the comparisons are defined, and you must not assume any finite-set property of them on infinite sets until it has been proved.`,
    pitfall:
      "The direction matters. A surj B means the map goes from A onto B, and that makes A the bigger one. Reading it as 'A is surjected onto by B' reverses every inequality.",
    related: ["mit6042-infinite-schroder-bernstein", "mit6042-infinite-countable-sets"],
  },
  {
    id: "mit6042-infinite-schroder-bernstein",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the Schröder–Bernstein theorem and the comparability theorem. Use them to prove that strict is transitive.",
    back: `**Schröder–Bernstein (Theorem 7.1.4)**: if **A surj B and B surj A**, then **A bij B**.

It sounds obvious ("each is at least as big as the other"), but for infinite sets it is technical. Surjections f: A → B and g: B → A need not be bijections, and a bijection has to be assembled from parts of both (MCS Problem 7.11).

**Comparability (Theorem 7.1.5)**: for all sets A and B, A surj B **or** B surj A. The text states this without proof. The proof needs well-ordering and ordinal machinery, and in fact relies on the axiom of choice.

**Lemma 7.1.6**: if A strict B and B strict C, then A strict C.

*Proof.* Suppose A strict B and B strict C, and for contradiction NOT(A strict C), i.e. A surj C.
- Since B strict C means NOT(B surj C), comparability gives **C surj B**.
- Now A surj C and C surj B, so transitivity of surj (Lemma 7.1.3) gives **A surj B**.
- That contradicts A strict B. ∎

The proof needs comparability precisely to turn "B is not at least as big as C" into "C is at least as big as B". For finite sets that step is trivial; for infinite sets it is a theorem.`,
    related: ["mit6042-infinite-surj-inj-bij", "mit6042-infinite-cantor-theorem"],
  },
  {
    id: "mit6042-infinite-adding-one-element",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove Lemma 7.1.7: for b ∉ A, A is infinite iff A bij A ∪ {b}.",
    back: `**Finite case.** If A is finite, |A ∪ {b}| = |A| + 1, so the two sets are not the same size.

**Infinite case: build a bijection e: A ∪ {b} → A.**
1. A is infinite, so it has an element a₀. It has at least two elements, so pick a₁ ≠ a₀. It has at least three, so pick a₂ different from both. Continuing gives an infinite sequence a₀, a₁, a₂, … of **distinct** elements of A.
2. Define
$$e(b) = a_0, \\qquad e(a_n) = a_{n+1}\\ (n \\in \\mathbb{N}), \\qquad e(a) = a \\text{ for every other } a \\in A.$$
3. e is a bijection. b goes to a₀, each aₙ moves one step along the sequence, and every other element stays put. Every element of A is hit exactly once.

This is "Hilbert's hotel": shift every guest in the sequence one room along, and room a₀ is free for the newcomer. It is also a way to characterize infinity: **a set is infinite iff it is the same size as a proper superset of itself**.

**Consequences**: adding any finite number of elements doesn't change the size of an infinite set. A slight variation shows every infinite set A satisfies A surj B for every countable B (Problem 7.9), so the countably infinite sets are the **smallest** infinite sets.`,
    pitfall:
      "'True after any finite number of steps' doesn't mean 'true after infinitely many'. Adding one element at a time never changes the size, but that alone does not prove A bij A ∪ B for an infinite B. That needs its own proof (MCS Problem 7.13). Likewise, incrementing 3 forever doesn't give an integer.",
    related: ["mit6042-infinite-countable-sets", "mit6042-infinite-surj-inj-bij"],
  },
  {
    id: "mit6042-infinite-countable-sets",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Define countable and countably infinite. Give an explicit bijection ℕ → ℤ, and explain why ℕ × ℕ, ℚ and the set of finite sequences of positive integers are countable.",
    back: `**Definition 7.1.8**: C is **countably infinite** iff ℕ bij C. C is **countable** iff it is finite or countably infinite. Equivalently, its elements can be listed c₀, c₁, c₂, … (Lemma 7.1.9: C is countable iff ℕ surj C; repeats in the list are allowed).

**ℤ is countable.** List it as 0, −1, 1, −2, 2, −3, 3, …:
$$f(n) = \\begin{cases} n/2 & n \\text{ even} \\\\ -(n+1)/2 & n \\text{ odd} \\end{cases}$$
f(0), …, f(8) = 0, −1, 1, −2, 2, −3, 3, −4, 4 (checked).

**More countable sets** (Corollary 7.1.10): ℤ⁺, ℤ, ℕ × ℕ, ℚ⁺, ℤ × ℤ, ℚ. Pairs can be listed diagonal by diagonal. Rationals are images of pairs, so a list of pairs gives a list of rationals, with repeats.

**Corollary 7.1.14**: if C is countable and C surj A, then A is countable. If U is uncountable and A surj U, then A is uncountable.

**Finite sequences of positive integers, (ℤ⁺)\\*, are countable** (Corollary 7.1.16). Map each n ≥ 1 to the sequence e(n) of the **nonzero exponents** in its prime factorization:
- 20 = 2²·3⁰·5¹, so e(20) = (2, 1);
- 6615 = 2⁰·3³·5¹·7², so e(6615) = (3, 1, 2);
- e(1) is the empty sequence, and e(0) is undefined.

Every finite sequence (k₁, …, kₘ) of positive integers is hit by $2^{k_1} 3^{k_2} \\cdots p_m^{k_m}$. So e is a surjective (partial) function and ℕ surj (ℤ⁺)\\*.`,
    pitfall:
      "Density doesn't mean uncountability. Between any two rationals lies another, yet ℚ is countable. Uncountability (the reals) needs a diagonal argument, not 'there are a lot of them'.",
    related: ["mit6042-infinite-adding-one-element", "mit6042-infinite-reals-uncountable", "mit6045-automata-countable-vs-uncountable-languages"],
  },
  {
    id: "mit6042-infinite-cantor-theorem",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove Cantor's theorem: for every set A, A strict pow(A), i.e. no function from A to pow(A) is surjective.",
    back: `**Proof** (Theorem 7.1.11). Let g: A → pow(A) be any function. We find a subset of A that g misses.

Define the **diagonal set**
$$A_g ::= \\{ a \\in A \\mid a \\notin g(a) \\}.$$
$A_g \\subseteq A$, so $A_g \\in \\text{pow}(A)$.

Suppose $A_g = g(a_0)$ for some $a_0 \\in A$. Then for every $a \\in A$:
$$a \\in g(a_0) \\iff a \\in A_g \\iff a \\notin g(a).$$
Take $a = a_0$:
$$a_0 \\in g(a_0) \\iff a_0 \\notin g(a_0),$$
a contradiction. So $A_g$ is not in the range of g, and g is not a surjection. Since g was arbitrary, NOT(A surj pow(A)). ∎

**Corollaries:**
- **pow(ℕ) is uncountable** (7.1.12).
- pow(ℕ) bij {0, 1}^ω, the infinite bit strings: a subset S ↔ the string whose n-th bit says whether n ∈ S. So **{0, 1}^ω is uncountable** (7.1.13).

The proof works for **every** set A, finite or infinite. For finite A it says $n < 2^n$.`,
    pitfall:
      "The proof does not show that some particular subset is 'too big'. For each attempted g it constructs a different missing set A_g. The argument is a recipe that defeats every candidate surjection.",
    related: ["mit6042-infinite-diagonal-argument", "mit6042-infinite-russell-paradox", "mit6042-infinite-schroder-bernstein"],
  },
  {
    id: "mit6042-infinite-diagonal-argument",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Explain the diagonal argument on a table: given a claimed list A₀, A₁, A₂, … of all infinite bit strings, construct a string missing from it.",
    back: `Suppose ℕ bij {0, 1}^ω. Then the infinite bit strings could be listed. The text's example of the first six rows and columns:

| | 0 | 1 | 2 | 3 | 4 | 5 | … |
|---|---|---|---|---|---|---|---|
| A₀ | **1** | 0 | 0 | 0 | 1 | 1 | |
| A₁ | 0 | **1** | 1 | 1 | 0 | 1 | |
| A₂ | 1 | 1 | **1** | 1 | 1 | 1 | |
| A₃ | 0 | 1 | 0 | **0** | 1 | 0 | |
| A₄ | 0 | 0 | 1 | 0 | **0** | 0 | |
| A₅ | 1 | 0 | 0 | 1 | 1 | **1** | |

- The **diagonal** (bit n of Aₙ) is D = 1 1 1 0 0 1 ….
- **Flip every bit**: C = 0 0 0 1 1 0 ….

C differs from Aₙ at position n, for **every** n. So C appears nowhere in the list, and no list is complete. **{0, 1}^ω is uncountable.**

**The link to Cantor's theorem**: C is the bit-string version of $A_g = \\{a \\mid a \\notin g(a)\\}$. Bit n of C is 1 exactly when n ∉ g(n), i.e. when bit n of Aₙ is 0.

The same pattern ("build an object that disagrees with the n-th item at the n-th place") proves the halting problem undecidable, drives Russell's paradox, and appears in Gödel's incompleteness theorem.`,
    related: ["mit6042-infinite-cantor-theorem", "mit6042-infinite-reals-uncountable", "mit6042-infinite-halting-problem"],
  },
  {
    id: "mit6042-infinite-reals-uncountable",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove ℝ is uncountable by building a surjection from ℝ onto {0, 1}^ω. How is the 0.999… ambiguity handled?",
    back: `**Corollary 7.1.15.** Map each real r to the bit string b(r) given by the digits of r's **decimal** expansion after the decimal point, **if** all those digits are 0 or 1. Otherwise b(r) is undefined. Examples:
- b(5) = 000…;
- b(1/10) = 1000…;
- b(1/9) = 111…;
- b(4 1/99) = 010101… (4 + 1/99 = 4.0101…);
- b(√2) and b(1/3) are undefined.

**b is a surjection onto {0, 1}^ω.** Every infinite bit string s is the decimal expansion of the real number 0.s, which is hit. (b is partial, which MCS's definition of surj allows.) So **ℝ surj {0, 1}^ω**. Since {0, 1}^ω is uncountable, Corollary 7.1.14(a) makes ℝ uncountable. ∎

**The ambiguity.** Some rationals have two expansions: 5 = 5.000… = 4.999…, and 1/10 = 0.1000… = 0.0999…. The text fixes b(r) to use the expansion ending in **all 0's**, so b is a function (at most one output per r).

Using **decimal** digits restricted to 0/1, rather than binary expansions, is what makes this painless. In binary, 0.0111… = 0.1000… would make two different bit strings the same real, and the map from reals would no longer hit both.`,
    related: ["mit6042-infinite-diagonal-argument", "mit6042-infinite-countable-sets", "mit6045-computability-diagonalization-uncomputable-problems"],
  },
  {
    id: "mit6042-infinite-larger-infinities-ch",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How many sizes of infinity are there? State the Continuum Hypothesis and its status.",
    back: `**A tower of infinities.** Iterating Cantor's theorem gives
$$\\mathbb{N} \\text{ strict } \\text{pow}(\\mathbb{N}) \\text{ strict } \\text{pow}(\\text{pow}(\\mathbb{N})) \\text{ strict } \\cdots$$
Each set is strictly bigger than all the earlier ones (strict is transitive, Lemma 7.1.6). The **union** of the whole sequence is strictly bigger than each of them (Problem 7.23), and you can keep going from there indefinitely.

**Continuum Hypothesis (Cantor)**: there is no set A with
$$\\mathbb{N} \\text{ strict } A \\text{ strict } \\text{pow}(\\mathbb{N}).$$
No infinity lies strictly between the integers and the reals.

**Status**: the ZFC axioms **cannot settle it** (Gödel in the 1930s; Paul Cohen in the 1960s). There are collections of sets satisfying all of ZFC in which CH is true, and others in which it is false. It stays undecided until someone finds persuasive new axioms.

**For computer science** (§7.4.1): towers of infinities rarely matter, since CS deals with countable, usually finite, sets. But the **reasoning** developed for them, diagonalization, is exactly what reveals the logical limits of computation.`,
    related: ["mit6042-infinite-cantor-theorem", "mit6042-infinite-zfc-axioms"],
  },
  {
    id: "mit6042-infinite-halting-problem",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "MCS proves the halting problem unrecognizable with Cantor's argument. Define No-halt and give the proof.",
    back: `**Setup** (§7.2). Programs are ASCII strings. For s ∈ ASCII\\*, $P_s$ is the procedure s compiles to (a default never-halting procedure if s doesn't parse). A set of strings is **recognizable** if some procedure halts on exactly its members.
$$\\text{No-halt} ::= \\{ s \\in \\text{ASCII}^* \\mid P_s \\text{ applied to } s \\text{ does not halt} \\}.$$

**Theorem 7.2.2: No-halt is not recognizable.**

*Proof (Cantor's argument).* Let $f(s) = \\{ t \\mid P_s \\text{ halts on } t\\}$, the set that $P_s$ recognizes. Then by definition
$$s \\in \\text{No-halt} \\iff s \\notin f(s).$$
That is, No-halt is exactly Cantor's diagonal set $A_f$ for f: ASCII\\* → pow(ASCII\\*). By Cantor's proof, $A_f$ is not in the range of f. So No-halt ≠ f(s₀) for every s₀, and no procedure recognizes it. Concretely: if $P_{s_0}$ recognized it, then setting s = s₀ gives $s_0 \\in f(s_0) \\iff s_0 \\notin f(s_0)$. ∎

**Consequences in the text:**
- No perfect type-checker, optimizer, or analyzer of any "overall" run-time property exists. A type-checker must reject some programs that would never cause a type error.
- Switching languages doesn't help: one language can simulate another.

6.045J develops the same result with Turing machines, decidability and reductions.`,
    related: ["mit6042-infinite-diagonal-argument", "mit6045-computability-acc-tm-undecidable", "mit6045-computability-rices-theorem"],
  },
  {
    id: "mit6042-infinite-russell-paradox",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State Russell's paradox and explain how modern set theory (ZFC, via the Foundation axiom) avoids it.",
    back: `**Russell's paradox** (§7.3.1). Let S range over all sets and define
$$W ::= \\{ S \\mid S \\notin S \\}.$$
Then $S \\in W \\iff S \\notin S$ for every set S. Letting S be W gives
$$W \\in W \\iff W \\notin W,$$
a contradiction. This three-line argument destroyed Frege's axioms for sets, which assumed that **every well-defined collection is a set**. It reasons just like Cantor's theorem.

**The way out**: the step "let S be W" is unjustified, because S ranges over **sets** and W need not be one. The paradox shows W must **not** be a set. So set theory has to say which collections are sets. Russell and Whitehead's *Principia Mathematica* attempted this and proved too cumbersome. The accepted answer is **Zermelo–Fraenkel set theory with Choice (ZFC)**.

**The ZFC resolution** (§7.3.3). The **Foundation** axiom implies that no set is a member of itself. So S ∉ S for every set S, and W would contain **every** set. If W were a set, it would contain itself, which Foundation forbids. So W is not a set.

(The **Subset** axiom also blocks the paradox: you can only carve $\\{y \\in x \\mid \\phi(y)\\}$ out of an **existing** set x, never form $\\{y \\mid \\phi(y)\\}$ from scratch.)`,
    related: ["mit6042-infinite-cantor-theorem", "mit6042-infinite-zfc-axioms"],
  },
  {
    id: "mit6042-infinite-zfc-axioms",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Name the ZFC axioms of MCS §7.3.2 and read a few as predicate formulas (Extensionality, Pairing, Power Set, Foundation).",
    back: `A **formula of set theory** is a first-order predicate formula that uses only = and ∈. Its variables range over sets. For example, $x \\subseteq y$ abbreviates $\\forall z.\\ (z \\in x \\rightarrow z \\in y)$.

- **Extensionality**: sets with the same members are equal. $(\\forall z.\\ z \\in x \\leftrightarrow z \\in y) \\rightarrow x = y$.
- **Pairing**: $\\forall x, y\\ \\exists u\\ \\forall z.\\ [z \\in u \\leftrightarrow (z = x \\vee z = y)]$. The set {x, y} exists.
- **Union**: $\\forall z\\ \\exists u\\ \\forall x.\\ (\\exists y.\\ x \\in y \\wedge y \\in z) \\leftrightarrow x \\in u$.
- **Infinity**: there is a nonempty set x such that $y \\in x$ implies $\\{y\\} \\in x$.
- **Subset (separation)**: $\\forall x\\ \\exists z\\ \\forall y.\\ y \\in z \\leftrightarrow [y \\in x \\wedge \\phi(y)]$, for any definable property φ.
- **Power Set**: $\\forall x\\ \\exists p\\ \\forall u.\\ u \\subseteq x \\leftrightarrow u \\in p$.
- **Replacement**: the image of a set under a definable function is a set.
- **Foundation**: every nonempty set x has a **member-minimal** element m, one with $m \\in x$ and no $y \\in x$ such that $y \\in m$. Equivalently, there is no infinite descending chain $\\cdots \\in x_2 \\in x_1 \\in x_0$.
- **Choice**: from any set of nonempty, pairwise disjoint sets, a set can be formed containing exactly one element of each.

Virtually all of mathematics can be derived from these. The text's "dark clouds":
- ZFC may yet turn out inconsistent.
- Choice yields the Banach–Tarski paradox.
- ZFC can't settle the Continuum Hypothesis.
- By Gödel's second incompleteness theorem, a consistent ZFC cannot prove its own consistency.`,
    pitfall:
      "These axioms are sentences of first-order logic. So everything in 24.241's metatheory applies to them: compactness and Löwenheim–Skolem give ZFC countable models, even though ZFC proves that uncountable sets exist (Skolem's 'paradox').",
    related: ["mit6042-infinite-russell-paradox", "mit6042-infinite-larger-infinities-ch", "mit24241-pd-lowenheim-skolem-compactness", "mit6120-proofs-axioms-consistency-completeness"],
  },
];
