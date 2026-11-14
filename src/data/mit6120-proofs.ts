// MIT 6.1200J (formerly 6.042J) Mathematics for Computer Science, Spring
// 2024 — Unit 1: Proofs (Lectures 1-4). Sourced from the course's own
// lecture notes (Abel, Chapman, Demaine), read page-by-page. Lecture 1 covers
// propositions, predicates, quantifiers, connectives and implication, sets,
// and axioms (consistency, completeness, Gödel). Lecture 2 covers inference
// rules, the basic proof templates (existence, universality, direct,
// contrapositive), proof by contradiction, proof outlining, the induction
// axiom, and strengthening the induction hypothesis. Lecture 3 covers proof
// by cases (incl. a first Ramsey-theory result) and strong induction.
// Lecture 4 covers state machines, the invariant principle, and termination
// via derived variables (potential functions). This is the first module of
// the app's discrete-math/proofs track — the foundation the KU Leuven
// bachelor's "Bewijzen en redeneren" and "Fundamenten voor de informatica"
// courses assume. See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6120-proofs";

export const mit6120ProofsCards: Card[] = [
  // --- Lecture 1: Predicates, sets, and proofs ---
  {
    id: "mit6120-proofs-what-is-a-proof",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a mathematical proof, and why is checking many examples not one?",
    back: `**Definition**: a mathematical proof is a **verification of a proposition** by a **chain of logical deductions** from a **base set of axioms**. Each of the three bolded parts is a separate ingredient (propositions, axioms, inference rules), studied in the following cards.

**Why examples don't count**: take the proposition $\\forall n \\in \\mathbb{N}.\\ n^2 + n + 41$ is prime. Checking $n = 0, 1, 2, \\ldots, 39$ gives primes every time (41, 43, 47, …, 1601) — 40 confirming cases. In engineering, physics or CS simulation this would be convincing evidence. But $n = 40$ gives $1681 = 41^2$, and $n = 41$ gives $41 \\cdot 43$: the proposition is **false**. Concluding a universal claim from examples is "proof by example", which is **not a valid proof**.

Number theory has far more devious cases: Euler conjectured in 1769 that $a^4 + b^4 + c^4 = d^4$ has no positive-integer solution. Noam Elkies disproved it (1988) with a solution in the tens of millions; the smallest solution, found afterwards by Roger Frye's computer search, is $a = 95800, b = 217519, c = 414560, d = 422481$. And $313(x^3 + y^3) = z^3$ has solutions, but the smallest has over 1000 digits — no amount of testing would find it.

**Goldbach's conjecture** (every even number $> 2$ is a sum of two primes) is true for every even number ever checked, is generally believed, and is still **unknown** — exactly because no proof exists yet.`,
    pitfall:
      "In applied work, 'it passed every test case' is often treated as 'it's correct'. In mathematics a single counterexample refutes a universal claim, while no finite number of confirming examples proves one.",
    related: ["mit6120-proofs-propositions-predicates-quantifiers", "mit6120-proofs-axioms-consistency-completeness"],
  },
  {
    id: "mit6120-proofs-propositions-predicates-quantifiers",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define proposition and predicate, and explain the quantifiers ∀ and ∃.",
    back: `- **Proposition**: a statement that is either True or False, e.g. $2 + 3 = 5$ (True), $2 + 3 = 6$ (False). Non-examples: "Hello.", "Who are you?", and self-referential statements like "This statement is false" (which can't consistently be assigned a truth value).
- **Predicate**: a proposition whose truth **depends on variables**, e.g. "$n^2 + n + 41$ is prime" is true or false depending on $n$.
- **Universal quantifier** $\\forall$ ("for all"): $\\forall n \\in \\mathbb{N}.\\ P(n)$ is true only if $P(n)$ holds for **every** natural number $n$ — one counterexample makes it false.
- **Existential quantifier** $\\exists$ ("there exists"): $\\exists a, b, c, d \\in \\mathbb{Z}^+.\\ a^4 + b^4 + c^4 = d^4$ is true as soon as **one** witness exists (e.g. $95800^4 + 217519^4 + 414560^4 = 422481^4$).

Notation used throughout the course: $\\in$ means "is an element of", and $\\mathbb{N}$ is the set of natural numbers **including 0**: $\\{0, 1, 2, \\ldots\\}$.

Note how negation swaps the quantifiers: "not every $n$ makes $n^2+n+41$ prime" is the same as "there exists an $n$ making it composite" — which is why a universal claim is refuted by a single example, and an existential claim is proved by a single example.`,
    pitfall:
      "6.1200 (like much of CS) takes ℕ to include 0. Many math texts start ℕ at 1 — always check the convention, since base cases of induction proofs depend on it.",
    related: ["mit6120-proofs-what-is-a-proof", "mit6120-proofs-basic-proof-templates"],
  },
  {
    id: "mit6120-proofs-connectives-and-english-or",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Give the truth tables for AND, OR, NOT, and explain why the English word 'or' is dangerous in proofs.",
    back: `| $A$ | $B$ | $A \\wedge B$ (AND) | $A \\vee B$ (OR) |
|---|---|---|---|
| T | T | T | T |
| T | F | F | T |
| F | T | F | T |
| F | F | F | F |

$\\neg A$ (NOT $A$, also written $\\overline{A}$) is true exactly when $A$ is false.

Mathematical OR is **inclusive**: $A \\vee B$ is true when at least one is true, **including both**.

**English "or" rarely means that.** The lecture's wedding-waiter example uses "or" three times with three different meanings:
- "Chicken **or** pasta" (one choice, not both, not neither) is **exclusive or**, XOR.
- "Coffee **or** tea" (one, or neither, but not both — one mug) is **NOT AND**, i.e. NAND.
- "Cream **or** sugar" (cream, sugar, both, or neither — all 4 combinations allowed) is not OR either: OR rules out "neither", but here nothing is ruled out, so the statement is always true and constrains nothing.

So none of the three English uses actually means OR as defined above.

In formulas, OR always means the inclusive truth table. When reading a problem statement written in English, translate it into explicit logic before proving anything.`,
    pitfall:
      "Reading 'A or B' as exclusive when a theorem means inclusive (or vice versa) changes what you have to prove — e.g. a proof by cases of 'A or B' never needs to rule out both being true.",
    related: ["mit6120-proofs-implication-truth-table", "mit6004-logic-sum-of-products"],
  },
  {
    id: "mit6120-proofs-implication-truth-table",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the truth table of A ⇒ B? Which related statements are equivalent to it (contrapositive) and which are not (converse, inverse)?",
    back: `| $A$ | $B$ | $A \\Rightarrow B$ |
|---|---|---|
| T | T | T |
| T | F | **F** |
| F | T | T |
| F | F | T |

$A \\Rightarrow B$ is false **only** when $A$ is true and $B$ is false. The surprising rows are F ⇒ T and F ⇒ F, which are **true**: think of the rule "if it's Wednesday, wear pink". Wearing pink on Thursday doesn't break the rule — the rule says nothing about non-Wednesdays.

Implication says **nothing about causation or time** — it is *defined* by this table.

- **Contrapositive** $\\neg B \\Rightarrow \\neg A$: **equivalent** to $A \\Rightarrow B$ (same truth table).
- **Converse** $B \\Rightarrow A$: **not** equivalent.
- **Inverse** $\\neg A \\Rightarrow \\neg B$: **not** equivalent to the original (it is the contrapositive of the converse, so it's equivalent to the converse).

The lecture's examples: "<4" is a *weaker* statement than "<3", since $x < 3 \\Rightarrow x < 4$ but not vice versa. And "I think therefore I am" ($T \\Rightarrow A$) is not the same claim as the meme "I do not think therefore I do not am" ($\\neg T \\Rightarrow \\neg A$) — that's the inverse. A shoe that exists but doesn't think is fine for Descartes but violates the meme.

**If and only if**: $A \\iff B$ is true when $A$ and $B$ are both true or both false — equivalent to $(A \\Rightarrow B) \\wedge (B \\Rightarrow A)$.`,
    pitfall:
      "Proving the converse instead of the statement is one of the most common proof errors. Before proving A ⇒ B, check you aren't accidentally assuming B and deriving A.",
    related: ["mit6120-proofs-connectives-and-english-or", "mit6120-proofs-contrapositive-n-squared-even", "mit6120-proofs-inference-rules"],
  },
  {
    id: "mit6120-proofs-sets-basics",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a set? Explain ∈ vs ⊆, set-builder notation, ∩/∪/\\, and how sets differ from tuples.",
    back: `A **set** is (roughly) an unordered collection of objects without duplicates. Sets can be finite ($A = \\{6, 1, 2, 0\\}$), infinite ($\\mathbb{N}$, $\\mathbb{Z}$), empty ($\\emptyset = \\{\\}$), or contain other sets ($B = \\{2, \\{3, 4\\}, \\emptyset\\}$).

**No duplicates, no order**: $\\{1, 2, 2, 3\\} = \\{2, 3, 1\\} = \\{3, 1, 2\\}$. (A collection with duplicates is a *multiset*.)

**Membership vs subset** — the classic confusion:
- $x \\in S$: $x$ is an **element** of $S$. $6 \\in A$. Is $\\{1, 2\\} \\in A$? **No** — $A$'s elements are numbers, not sets. Is $\\{3, 4\\} \\in B$? **Yes**, it's literally one of $B$'s three elements.
- $S \\subseteq T$: **every element** of $S$ is an element of $T$. $\\{1, 2\\} \\subseteq A$ — yes. $\\{0, 1, 2, 6\\} \\subseteq A$ — yes (every set is a subset of itself).

**Set-builder notation**: specify a subset with a predicate: $\\{n \\in \\mathbb{N} \\mid \\text{isPrime}(n)\\} = \\{2, 3, 5, 7, 11, \\ldots\\}$ (a colon is sometimes used instead of $\\mid$).

**Operations** with the $A, B$ above: intersection $A \\cap B = \\{2\\}$; union $A \\cup B = \\{0, 1, 2, 6, \\{3, 4\\}, \\emptyset\\}$; difference $A - B = A \\setminus B = \\{0, 1, 6\\}$ (elements of $A$ not in $B$).

**Tuples** $(6, 1, 2, 0)$ are **ordered** and allow duplicates, so $(6, 1, 2, 0) \\neq (2, 1, 6, 0)$; set operations like $\\cup$ don't make sense for them.`,
    pitfall:
      "∅ ⊆ S for every set S, but ∅ ∈ S only if the empty set is literally one of S's elements (as in B above). Mixing up ∈ and ⊆ is the most common set-theory mistake.",
    related: ["mit6120-proofs-propositions-predicates-quantifiers"],
  },
  {
    id: "mit6120-proofs-axioms-consistency-completeness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is an axiom? Define consistency and completeness of an axiom set, and state what Gödel's incompleteness theorem says about them.",
    back: `**Axiom**: a proposition that is **assumed** to be true. The advice "don't make assumptions in math" is wrong — you *must* assume something; the key is to **state assumptions up front**.

Different axioms give different, equally valid mathematics. Given a line $l$ and a point $p \\notin l$:
- exactly one line through $p$ is parallel to $l$ (Euclidean geometry),
- **no** line through $p$ is parallel to $l$,
- **infinitely many** lines through $p$ are parallel to $l$.

These contradict each other, yet each yields a consistent geometry — "lines" are just different objects in the three worlds. Anyone who accepts your axioms must accept the theorems you derive from them.

What we want from an axiom set:
- **Consistent**: no proposition can be both proved and disproved. (Necessary — otherwise everything is provable.)
- **Complete**: every proposition can be either proved or disproved.

Russell and Whitehead spent their careers seeking a complete and consistent axiomatization of basic arithmetic. **Gödel's incompleteness theorem** (1930s): no such axiom set can be both complete and consistent. Corollary: if you insist on consistency, there are **true statements that cannot be proved**. Goldbach's conjecture might be one of them.

**The precise conditions** (the lecture states the theorem informally): it applies to axiom sets that are **effectively listable** — a computer program could enumerate them, so proofs can be mechanically checked — and **strong enough to express basic arithmetic**. Both matter: "take every true arithmetic sentence as an axiom" is complete and consistent, but no program can list those axioms; and very weak theories (too weak to talk about arithmetic) can be complete.`,
    pitfall:
      "Incompleteness doesn't say 'math is broken' or that every open problem is unprovable — it says that for any consistent, effectively listable axiom set for arithmetic, some true statements have no proof from it, without telling you which ones.",
    related: ["mit6120-proofs-what-is-a-proof", "mit6045-computability-self-referencing-programs"],
  },

  // --- Lecture 2: Contradiction and induction ---
  {
    id: "mit6120-proofs-inference-rules",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is an inference rule? Give modus ponens, modus tollens, and the rules behind chaining implications and proof by contradiction.",
    back: `An **inference rule** combines true propositions into new true propositions — the "chain of logical deductions" part of a proof.

- **Modus ponens**: from $P \\Rightarrow Q$ and $P$, conclude $Q$. Written $((P \\Rightarrow Q) \\wedge P) \\Rightarrow Q$, or $P \\Rightarrow Q,\\ P \\vdash Q$, or as a fraction with the premises above the line and $Q$ below.
- **Modus tollens**: from $P \\Rightarrow Q$ and $\\neg Q$, conclude $\\neg P$.
- **Chaining**: $((P \\Rightarrow Q) \\wedge (Q \\Rightarrow R)) \\Rightarrow (P \\Rightarrow R)$.
- **Contradiction rule**: $(\\neg P \\Rightarrow \\text{False}) \\Rightarrow P$.

Each rule can be checked with a truth table. For modus ponens: in the implication table, the **only** row where both $P$ and $P \\Rightarrow Q$ are true is $P = Q = $ True — so $Q$ must be true.

What 6.1200 expects of a written proof: every step clear and logical; state which previously proved results you use; **no wild leaps** and **no "proof by intimidation"** ("clearly…", "obviously…"). You don't need to name the inference rule at each step, and basic math you already know may be used as axioms — but you can't cite the statement you were asked to prove.`,
    pitfall:
      "'Affirming the consequent' — from P ⇒ Q and Q, concluding P — is not a valid rule. Check it against the truth table: the F ⇒ T row has Q true and P false.",
    related: ["mit6120-proofs-implication-truth-table", "mit6120-proofs-sqrt2-irrational"],
  },
  {
    id: "mit6120-proofs-basic-proof-templates",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give the standard proof templates for ∃x. P(x), ∀x ∈ S. P(x), and P ⇒ Q (direct method), with an example of each.",
    back: `**Existence** — $\\exists x \\in S.\\ P(x)$: exhibit a specific witness.
> We'll show $x = $ [specific value] works. Indeed, $P(x)$ holds because [reasons].

Example: $\\exists n \\in \\mathbb{N}.\\ n \\geq 10 \\wedge \\text{isPrime}(n)$ — take $n = 17$, which is prime and $\\geq 10$.

**Universality** — $\\forall x \\in S.\\ P(x)$: one example is not enough. Introduce an **arbitrary** element, assuming nothing about it except $x \\in S$.
> Assume $x$ is an arbitrary element of $S$. Then $P(x)$ is true because [reasons].

Example: $\\forall x \\in \\mathbb{R}.\\ x^2 - 6x > -10$. Let $x$ be any real. $x^2 - 6x + 9 = (x - 3)^2 \\geq 0$ since squares of reals are nonnegative, so $x^2 - 6x = (x - 3)^2 - 9 \\geq -9 > -10$.

**Implication, direct** — $P \\Rightarrow Q$: assume $P$, derive $Q$.
> Assume $P$ is true. Then $Q$ is also true, because [reasons].

Example: if $n$ is a multiple of 10, it's a multiple of 2. Assume $n = 10k$ for an integer $k$. Then $n = 2 \\cdot (5k)$, which is 2 times an integer, hence a multiple of 2.`,
    pitfall:
      "In a ∀-proof, picking a convenient x ('let x = 3') proves nothing — the element must be arbitrary so the argument works for every member of S at once.",
    related: ["mit6120-proofs-contrapositive-n-squared-even", "mit6120-proofs-proof-outlining", "mit6120-proofs-proof-by-cases-template"],
  },
  {
    id: "mit6120-proofs-contrapositive-n-squared-even",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove: for every integer n, if n² is even then n is even. (Use the contrapositive.)",
    back: `**Why contrapositive**: assuming "$n^2$ is even" gives $n^2 = 2k$, and it's awkward to get from there to a statement about $n$ itself. The contrapositive turns the hypothesis into something we can compute with.

**Proof.** $P \\Rightarrow Q$ is equivalent to $\\neg Q \\Rightarrow \\neg P$, so we prove: if $n$ is odd, then $n^2$ is odd.

Assume $n$ is odd, so $n = 2k + 1$ for some integer $k$. Then
$$n^2 = (2k + 1)^2 = 4k^2 + 4k + 1 = 2(2k^2 + 2k) + 1,$$
which is one more than a multiple of 2, so $n^2$ is odd. $\\blacksquare$

**General template**:
> We'll prove the contrapositive, so assume NOT $Q$. Then NOT $P$ is true because [reasons].

This lemma is reused immediately in the proof that $\\sqrt{2}$ is irrational.`,
    pitfall:
      "Proving 'if n is even then n² is even' is the converse — true, but not what was asked. Always write out exactly which implication you're proving.",
    related: ["mit6120-proofs-implication-truth-table", "mit6120-proofs-sqrt2-irrational"],
  },
  {
    id: "mit6120-proofs-sqrt2-irrational",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove by contradiction that √2 is irrational.",
    back: `**Proof by contradiction**: to prove $P$, prove $\\neg P \\Rightarrow \\text{False}$ — assume the opposite and derive a contradiction (sometimes called an *indirect proof*).

**Proof.** Assume for contradiction that $\\sqrt{2} \\in \\mathbb{Q}$. Write it as a fraction **in lowest terms**: integers $a, b$ with no common divisor and
$$\\frac{a}{b} = \\sqrt{2} \\;\\Rightarrow\\; a = b\\sqrt{2} \\;\\Rightarrow\\; a^2 = 2b^2.$$
So $a^2$ is even, and by the lemma "$n^2$ even ⇒ $n$ even", $a$ is even: $a = 2c$ for some integer $c$. Substituting,
$$(2c)^2 = 2b^2 \\;\\Rightarrow\\; 4c^2 = 2b^2 \\;\\Rightarrow\\; b^2 = 2c^2,$$
so $b^2$ is even, and by the same lemma $b$ is even. Now $a$ and $b$ share the factor 2, contradicting lowest terms. Hence $\\sqrt{2} \\notin \\mathbb{Q}$. $\\blacksquare$

The structure to remember: (1) state the negated assumption, (2) fix a normal form (lowest terms) that the contradiction will violate, (3) derive the violation.`,
    pitfall:
      "The 'lowest terms' assumption is what makes the contradiction bite. Without it, finding that a and b are both even isn't contradictory at all — you could just keep dividing.",
    related: ["mit6120-proofs-contrapositive-n-squared-even", "mit6120-proofs-inference-rules"],
  },
  {
    id: "mit6120-proofs-proof-outlining",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How can you outline a proof mechanically from the logical form of a theorem, before knowing what its terms mean?",
    back: `Choosing a proof method for each logical connective often produces an outline **mechanically**, which directs your effort at the right target — a common mistake is diving into *how* to prove something while proving the wrong thing.

Example: "For every integer $n$, the number $n$ is **fooish** precisely when $n + 1$ is **barsome**." You don't need to know what fooish or barsome mean.

The form is $\\forall n \\in \\mathbb{Z}.\\ F(n) \\iff B(n+1)$.

1. **Handle ∀**: Suppose $n$ is any integer; we must prove $F(n) \\iff B(n+1)$.
2. **Handle iff** — split it into two implications: TODO prove $F(n) \\Rightarrow B(n+1)$; TODO prove $B(n+1) \\Rightarrow F(n)$.
3. **Handle each implication** (direct method):
   - To prove $F(n) \\Rightarrow B(n+1)$, assume $F(n)$. TODO: prove $B(n+1)$.
   - To prove $B(n+1) \\Rightarrow F(n)$, assume $B(n+1)$. TODO: prove $F(n)$.

Only the remaining TODOs need knowledge of the definitions — the scaffolding is done. With practice this becomes fast enough that you can sketch several approaches and pick the most promising one.`,
    pitfall:
      "An 'iff' proof that only shows one direction is incomplete — outlining first makes it obvious that two separate implications are owed.",
    related: ["mit6120-proofs-basic-proof-templates", "mit6120-proofs-implication-truth-table"],
  },
  {
    id: "mit6120-proofs-induction-axiom-sum",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the induction axiom, and use it to prove ∀n ∈ ℕ. 1 + 2 + ⋯ + n = n(n+1)/2.",
    back: `**Induction axiom**: let $P(n)$ be a predicate on $n \\in \\mathbb{N}$. If $P(0)$ and $\\forall n \\in \\mathbb{N}.\\ P(n) \\Rightarrow P(n+1)$, then $\\forall n \\in \\mathbb{N}.\\ P(n)$.

Intuition: from $P(0)$ and the chain $P(0) \\Rightarrow P(1)$, $P(1) \\Rightarrow P(2)$, … every $P(n)$ follows — the axiom is what lets us conclude *all infinitely many* at once. (Something like it is needed to define $\\mathbb{N}$ itself.)

**Proof.** Let $P(n)$ be $1 + 2 + \\cdots + n = n(n+1)/2$. We prove $\\forall n.\\ P(n)$ by induction on $n$.

*Base case* $P(0)$: the left side is the empty sum, 0; the right side is $0 \\cdot 1 / 2 = 0$. ✓

*Inductive step*: let $n \\in \\mathbb{N}$ and assume $P(n)$ (the **induction hypothesis**). We must show $P(n+1)$: $1 + \\cdots + n + (n+1) = (n+1)(n+2)/2$. Adding $n + 1$ to both sides of $P(n)$:
$$(1 + \\cdots + n) + (n+1) = \\frac{n(n+1)}{2} + (n+1) = (n+1)\\left(\\frac{n}{2} + 1\\right) = \\frac{(n+1)(n+2)}{2}.$$

By induction, $P(n)$ holds for every $n \\in \\mathbb{N}$. $\\blacksquare$`,
    pitfall:
      "In the inductive step you assume P(n) for one fixed but arbitrary n and prove P(n+1) — you never assume ∀n. P(n), which would be assuming the conclusion.",
    related: ["mit6120-proofs-strengthening-ih-trominoes", "mit6120-proofs-strong-induction", "mit6006-foundations-induction-correctness"],
  },
  {
    id: "mit6120-proofs-strengthening-ih-trominoes",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that a 2ⁿ × 2ⁿ grid can be tiled by L-trominoes leaving one center square uncovered — and explain why you must prove something stronger.",
    back: `**The obstacle**: let $P(n)$ = "the $2^n \\times 2^n$ grid can be covered with non-overlapping L-trominoes, except one of the center-most squares". The base case $n = 0$ (a single uncovered square) is fine, but knowing how to tile a $2^n$ grid around its *center* doesn't help with the $2^{n+1}$ grid — its four quadrants need holes at their *corners*, not centers.

**Strengthen the hypothesis**: $Q(n)$ = "for **any** chosen square, the other $2^{2n} - 1$ squares of the $2^n \\times 2^n$ grid can be covered with L-trominoes". $Q(n)$ is stronger than $P(n)$, and that makes the induction *easier*: the hypothesis you get to assume is stronger too.

**Proof of $\\forall n.\\ Q(n)$ by induction.** *Base case* $n = 0$: one square, left uncovered. ✓

*Inductive step*: assume $Q(n)$. Take a $2^{n+1} \\times 2^{n+1}$ grid and a square $(i, j)$ to leave uncovered; without loss of generality it's in the top-left quadrant. Place one L-tromino in the middle of the grid, covering one square in each of the **other three** quadrants. Now each quadrant is a $2^n \\times 2^n$ grid with exactly one square that must stay uncovered (either $(i, j)$ or the tromino's square), so by $Q(n)$ each can be tiled. Together this covers everything except $(i, j)$. ✓

By induction $\\forall n.\\ Q(n)$, and $P(n)$ is a special case. $\\blacksquare$

Bonus: the proof is **constructive** — it is a recursive tiling algorithm — and it proves more than asked (any square can be the hole).`,
    pitfall:
      "When an induction step gets stuck, the instinct is to weaken the claim. Often the fix is the opposite: prove something harder, so the induction hypothesis gives you more to work with.",
    related: ["mit6120-proofs-induction-axiom-sum", "recursion-dc-paradigm"],
  },

  // --- Lecture 3: Casework and strong induction ---
  {
    id: "mit6120-proofs-proof-by-cases-template",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Why is proof by cases valid? Use it to prove that (A ⇒ B) ∨ (B ⇒ C) is a tautology.",
    back: `**Why it's valid**: for any proposition $C$, "$C \\vee \\neg C$" is a **tautology** (always true). So $P$ is equivalent to $\\text{True} \\Rightarrow P$, i.e. $(C \\vee \\neg C) \\Rightarrow P$, which splits into $(C \\Rightarrow P) \\wedge (\\neg C \\Rightarrow P)$. Proving both cases proves $P$. More generally, any **exhaustive** set of cases $C_1 \\vee \\cdots \\vee C_k$ works — but you must justify that the cases are exhaustive.

**Theorem.** $S := (A \\Rightarrow B) \\vee (B \\Rightarrow C)$ is true for all truth values of $A, B, C$.

**Proof.** By cases on $B$.
- *Case 1*: $B$ is true. Then $A \\Rightarrow B$ is true (an implication with a true conclusion is true), so $S$ is true.
- *Case 2*: $B$ is false. Then $B \\Rightarrow C$ is true (an implication with a false hypothesis is true), so $S$ is true.

The cases are exhaustive, so $S$ is always true. $\\blacksquare$

Picking the case split well is the skill: splitting on $B$ — the variable shared by both implications — reduces each case to one row of the implication table. Splitting on $A$ would have needed sub-cases.`,
    pitfall:
      "Missing a case invalidates the whole proof. The four-color theorem had several published 'proofs' (Kempe 1879, Tait 1880) that were later found to have gaps before Appel and Haken's computer-checked proof in 1976.",
    related: ["mit6120-proofs-ramsey-r33", "mit6120-proofs-implication-truth-table"],
  },
  {
    id: "mit6120-proofs-ramsey-r33",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that among any 6 people there are 3 mutual friends or 3 mutual strangers (i.e. R(3,3) ≤ 6).",
    back: `Setup: every pair of people is either friends or strangers (friendship is symmetric).

**Proof.** By cases. Pick any person $p$. Each of the other 5 is a friend or a stranger of $p$, so $p$ has at least 3 friends or at least 3 strangers.

- **Case 1: $p$ has at least 3 friends** $q, r, s$.
  - *1a*: some pair among $q, r, s$ are friends. That pair plus $p$ are **3 mutual friends**.
  - *1b*: no pair among $q, r, s$ are friends. Then $q, r, s$ are **3 mutual strangers**.
- **Case 2: $p$ has at most 2 friends**, hence at least 3 strangers. This is Case 1 with "friends" and "strangers" swapped — the same argument gives 3 mutual strangers or 3 mutual friends. $\\blacksquare$

The "by symmetry" in Case 2 is a legitimate proof step because the argument in Case 1 never used anything specific to friendship.

This is **Ramsey theory**: $R(f, s)$ = the minimum number of people guaranteeing $f$ mutual friends or $s$ mutual strangers. We proved $R(3,3) \\leq 6$; in fact $R(3,3) = 6$ and $R(4,4) = 18$, while for $R(5,5)$ only bounds are known ($43 \\leq R(5,5) \\leq 48$ as given in the lecture).`,
    pitfall:
      "Case 1 needs at least 3 friends, not exactly 3 — '5 others, so at least 3 of one kind' is the pigeonhole step that makes the two top-level cases exhaustive.",
    related: ["mit6120-proofs-proof-by-cases-template"],
  },
  {
    id: "mit6120-proofs-strong-induction",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the principle of strong induction. Is it more powerful than ordinary induction?",
    back: `**Strong induction**: let $P(n)$ be a predicate on $n \\in \\mathbb{N}$. If
1. $P(0)$ is true, and
2. for all $n \\in \\mathbb{N}$: $P(0) \\wedge P(1) \\wedge \\cdots \\wedge P(n) \\Rightarrow P(n+1)$,

then $\\forall n \\in \\mathbb{N}.\\ P(n)$.

The difference from ordinary induction is only in the step: to prove $P(n+1)$ you may assume $P(m)$ for **every** $m \\leq n$, not just $m = n$. This is natural whenever the problem breaks into pieces of arbitrary smaller size (splitting a pile, recursing on a sub-tournament) rather than "one smaller".

**Is it more powerful? No.** Every ordinary step $P(n) \\Rightarrow P(n+1)$ also gives the strong step (an extra assumption never hurts). Conversely, strong induction can be proved from the ordinary induction axiom (apply ordinary induction to $Q(n) := P(0) \\wedge \\cdots \\wedge P(n)$). The two are **equivalent** — strong induction is a convenience, not extra power.

The base case doesn't have to be 0: starting at 1 (or any $b$) is cosmetic — reindex $n$ if you like.`,
    pitfall:
      "In strong induction the smaller instances must actually be smaller AND still within range of what you've proved — e.g. if your base case is n = 1, check every piece you recurse on has size ≥ 1.",
    related: ["mit6120-proofs-induction-axiom-sum", "mit6120-proofs-block-stacking-game", "mit6120-proofs-beats-ordering"],
  },
  {
    id: "mit6120-proofs-block-stacking-game",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "In the block-splitting game (split a stack into stacks of sizes a and b, scoring a·b, until all stacks have size 1), prove every strategy scores exactly n(n−1)/2 for n blocks.",
    back: `Try one strategy on 8 blocks: always split one block off the largest stack, scoring $7 + 6 + \\cdots + 1 = 28$. Surprisingly, every strategy scores 28. Claim: every strategy starting from $n$ blocks scores $n(n-1)/2$.

**Proof by strong induction** on $n \\geq 1$. Let $P(n)$: every strategy starting with $n$ blocks scores $n(n-1)/2$.

*Base case* $n = 1$: the game ends immediately with 0 points $= 1 \\cdot 0 / 2$. ✓

*Strong inductive step*: assume $P(m)$ for all $1 \\leq m \\leq n$, and start with $n + 1$ blocks. The first move splits into piles $m_1, m_2$ with $m_1 + m_2 = n + 1$ and $1 \\leq m_1, m_2 \\leq n$ (no empty piles — this is why base case 1 suffices). After that, the two piles evolve independently, so with $F(k, S)$ = points from $k$ blocks under strategy $S$:
$$F(n+1, S) = m_1 m_2 + F(m_1, S_1) + F(m_2, S_2) = m_1 m_2 + \\frac{m_1(m_1 - 1)}{2} + \\frac{m_2(m_2 - 1)}{2}$$
by the strong hypothesis (it holds for **all** strategies on smaller piles). Simplifying:
$$= \\frac{2m_1 m_2 + m_1^2 - m_1 + m_2^2 - m_2}{2} = \\frac{(m_1 + m_2)^2 - (m_1 + m_2)}{2} = \\frac{(n+1)\\,n}{2}. \\;\\blacksquare$$

Ordinary induction would be awkward here: the first split produces piles of *arbitrary* smaller sizes, not size $n$.`,
    pitfall:
      "The hypothesis must be 'for ALL strategies on m blocks', not 'for some strategy' — the sub-piles are played with whatever strategy the player chooses, so the claim has to cover them all.",
    related: ["mit6120-proofs-strong-induction", "mit6120-proofs-induction-axiom-sum"],
  },
  {
    id: "mit6120-proofs-beats-ordering",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "In a round-robin tournament with no ties, prove there is always an ordering p₁, …, pₙ where each pᵢ beat pᵢ₊₁.",
    back: `Example: A beats C, D; B beats A, C; C beats D; D beats B. Then $A\\,C\\,D\\,B$ is a **beats ordering** ($A$ beat $C$, $C$ beat $D$, $D$ beat $B$); $A\\,B\\,C\\,D$ is not ($A$ lost to $B$).

**Proof by strong induction.** $P(n)$: every tournament result on $n$ players has a beats ordering.

*Base case* $P(0)$: the empty list is a beats ordering. ✓

*Strong inductive step*: take any tournament on $n+1$ players and pick an arbitrary player $p'$. Every other player either beat $p'$ or lost to it (no ties). Let $W$ = players who beat $p'$, $L$ = players who lost to $p'$; then $W \\cup L \\cup \\{p'\\}$ is everyone and $|W|, |L| \\leq n$ (either may be empty).

By the strong hypothesis (applied to the matches among $W$ only, and among $L$ only), get beats orderings $p_1, \\ldots, p_{|W|}$ of $W$ and $q_1, \\ldots, q_{|L|}$ of $L$. Claim:
$$p_1, \\ldots, p_{|W|},\\ p',\\ q_1, \\ldots, q_{|L|}$$
is a beats ordering. Within $W$ and $L$ it holds already; the only new adjacencies are $p_{|W|}$ before $p'$ — true since $p_{|W|} \\in W$ beat $p'$ — and $p'$ before $q_1$ — true since $q_1 \\in L$ lost to $p'$. $\\blacksquare$

This is the same divide-around-a-pivot shape as quicksort's partition, and it reads directly as a recursive algorithm.`,
    pitfall:
      "Strong induction is needed because |W| and |L| can be any sizes from 0 to n — ordinary induction only hands you the size-n case.",
    related: ["mit6120-proofs-strong-induction", "sorting-quicksort-overview"],
  },

  // --- Lecture 4: State machines ---
  {
    id: "mit6120-proofs-state-machine-definitions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a state machine, an execution, a reachable state, and deterministic vs non-deterministic machines.",
    back: `A **state machine** is defined by:
- a collection of **states**,
- a specified **initial state**,
- for each state, a (possibly empty) list of possible **transitions** $s \\mapsto t$ to other states.

If some state has more than one possible transition, the machine is **non-deterministic**; otherwise it is **deterministic**.

An **execution** is a sequence of states that starts at the initial state and follows the transition rules. A state is **reachable** if some execution reaches it.

State machines are an abstraction for modeling **algorithms**: states = the algorithm's data at a moment, transitions = its steps. The two central questions are:
- **reachability** — can a bad state ever occur? (answered with invariants)
- **termination** — must every execution end? (answered with derived variables)

Example — the 8 puzzle: states are board configurations, written as the cells left-to-right, top-to-bottom (e.g. \`12345687*\`, where * is the blank); transitions slide a tile into the blank; the question "can I reach \`12345678*\`?" is a reachability question.

This is the same object as the finite-state machines of digital logic and automata theory, but here the state set may be infinite and the focus is on **proving properties** of executions.`,
    pitfall:
      "Reachability is about the initial state specifically: a state can be 'valid-looking' (a legal board) and still be unreachable from where you start.",
    related: ["mit6120-proofs-invariant-principle", "mit6004-logic-fsm-formal-definition", "mit6045-automata-dfa-formal-definition"],
  },
  {
    id: "mit6120-proofs-invariant-principle",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State and prove the Invariant Principle for state machines.",
    back: `**Definitions.** A **preserved predicate** is a predicate $P$ on states such that whenever $P(s)$ holds and $s \\mapsto t$ is a transition, $P(t)$ holds. An **invariant** is a property true of **all reachable states**.

**Invariant Principle.** If $P$ is true of the initial state and is preserved, then $P$ is an invariant.

**Proof.** Let $s_0$ be the initial state. Let $Q(n)$: for every execution $s_0, s_1, \\ldots, s_n$ of $n + 1$ states, $P(s_0) \\wedge \\cdots \\wedge P(s_n)$ holds. Induction on $n$:
- *Base case* $n = 0$: the only execution is $s_0$, and $P(s_0)$ holds by assumption.
- *Inductive step*: let $s_0, \\ldots, s_{n+1}$ be an execution. Then $s_0, \\ldots, s_n$ is an execution, so by the hypothesis $P(s_n)$ holds. Since $s_n \\mapsto s_{n+1}$ is a transition and $P$ is preserved, $P(s_{n+1})$ holds.

So $Q(n)$ for all $n$: every state on every execution satisfies $P$. $\\blacksquare$

**Corollary (proving unreachability).** If $P$ is an invariant and $P(s)$ is false, then $s$ is unreachable.

The principle is easy; the art is **finding** the right $P$. It is the formal version of the "loop invariant" reasoning used to prove algorithms correct.`,
    pitfall:
      "Being preserved is not enough — P must also hold at the initial state. A preserved predicate that starts false (e.g. 'the board is solved') tells you nothing about reachable states.",
    related: ["mit6120-proofs-state-machine-definitions", "mit6120-proofs-8-puzzle-parity", "searching-binary-search"],
  },
  {
    id: "mit6120-proofs-8-puzzle-parity",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that the 8 puzzle cannot get from 12345687* to 12345678* (swap the last two tiles).",
    back: `**Inversions**: in a sequence $a_1, \\ldots, a_n$, an inversion is a pair $i < j$ with $a_i > a_j$. E.g. 1234 has 0, 1324 has 1, 4132 has 4. Map each board to the sequence of its tiles in reading order with the blank deleted.

**How moves affect inversions:**
- **Horizontal move**: swaps the blank with a left/right neighbor. After deleting the blank, the sequence is **unchanged** — inversions unchanged.
- **Vertical move**: moves one tile past the two tiles between it and the blank's old position, i.e. three adjacent entries rotate: $a_i, a_{i+1}, a_{i+2} \\mapsto a_{i+2}, a_i, a_{i+1}$. Only the relative orders of the moved tile with the two others change — exactly **two pairs toggle** between inversion and non-inversion. So the inversion count changes by $-2$, $0$, or $+2$: an **even** amount. (The raw count does change — 12345687 → 12345876 goes from 1 to 3 inversions — which is why the count itself is not the invariant.)

**Proof.** Let $P(s)$: the number of inversions of $s$ is **odd**. By the above, every move preserves the **parity**, so $P$ is preserved. The initial state 12345687* has exactly 1 inversion, so $P$ holds initially. By the Invariant Principle, $P$ is an invariant. The target 12345678* has 0 inversions — even — so $P$ is false there, and the target is **unreachable**. $\\blacksquare$`,
    pitfall:
      "The natural first guess (the inversion count itself) is NOT preserved. When a quantity changes, look for something coarser it preserves — here its parity.",
    related: ["mit6120-proofs-invariant-principle", "mit6120-proofs-simple-sort-termination"],
  },
  {
    id: "mit6120-proofs-termination-derived-variables",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you prove a state machine terminates? Define final state, termination, and derived variables (potential functions).",
    back: `- **Final state**: a state with no possible transitions.
- A state machine **terminates** if it has **no infinite executions** — whatever choices are made, every run reaches a final state.
- **Derived variable** (aka **potential function**): a function $f$ from states to real numbers. It is **strictly decreasing** if every transition $s \\mapsto t$ has $f(t) < f(s)$, and **weakly decreasing** if $f(t) \\leq f(s)$.

**Theorem.** If $f$ is a **natural-number-valued**, **strictly decreasing** derived variable, the machine terminates.

*Why*: an infinite execution would give an infinite strictly decreasing sequence of natural numbers, which is impossible (the well-ordering of $\\mathbb{N}$).

Both conditions matter: real-valued $f$ can decrease forever ($1, \\tfrac12, \\tfrac14, \\ldots$), and weakly decreasing $f$ can stay constant forever.

**Partial correctness vs termination**: proving "*if* the algorithm reaches a final state, the output is right" is **partial correctness**. Full correctness also needs termination — a sort that loops forever never produces wrong output, but it is still broken.

Physics analogy from the lecture: invariants behave like total energy (conserved, so states with different energy are unreachable); potential functions behave like mechanical energy under friction — it can only go down.`,
    pitfall:
      "A strictly decreasing derived variable gives an upper bound on the number of steps for free: at most its initial value. Use it to bound running time, not just prove termination.",
    related: ["mit6120-proofs-simple-sort-termination", "mit6046-am-potential-method", "mit6035-flow-ascending-chains-and-termination"],
  },
  {
    id: "mit6120-proofs-simple-sort-termination",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Simple sort: repeatedly pick any adjacent out-of-order pair and swap it. Prove it terminates, and bound the number of steps.",
    back: `**As a state machine**: states are the permutations of the input sequence; the initial state is the input; transitions swap some adjacent pair $a_i, a_{i+1}$ with $a_i > a_{i+1}$ (any such $i$ may be chosen — the machine is non-deterministic). Final states are exactly those where every adjacent pair is in order, which (by induction) means the sequence is sorted — that's **partial correctness**.

**Termination.** Use the number of **inversions** (pairs $i < j$ with $a_i > a_j$) as the derived variable — it's natural-number valued. A transition
$$\\cdots a_{i-1}\\ a_i\\ a_{i+1} \\cdots \\;\\mapsto\\; \\cdots a_{i-1}\\ a_{i+1}\\ a_i \\cdots$$
only changes the relative order of the pair $(i, i+1)$; every other pair keeps its order. Since $i$ was chosen with $a_i > a_{i+1}$, that pair goes from inversion to non-inversion. So **every step decreases the inversion count by exactly 1** — strictly decreasing, hence the machine terminates. $\\blacksquare$

**Bonus — an exact step count**: every execution, whatever choices it makes, takes exactly as many steps as the input has inversions, which is at most $\\binom{n}{2} = n(n-1)/2$ (the total number of pairs). This is the $O(n^2)$ worst case of bubble sort, derived from a potential function.`,
    pitfall:
      "The proof works for ANY choice of out-of-order pair at each step — that's what makes it a proof about the non-deterministic machine, not just one run.",
    related: ["mit6120-proofs-termination-derived-variables", "mit6120-proofs-8-puzzle-parity", "sorting-bubble-overview"],
  },
];
