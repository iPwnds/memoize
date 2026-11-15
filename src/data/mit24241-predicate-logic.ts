// MIT 24.241 Logic I (Fall 2009, Ephraim Glick; TA Damien Rochford) — Part 4:
// Predicate Logic — Syntax, Translation and Formal Semantics (Lectures
// 12-18). Sourced from the course's OCW materials, read page by page: the
// Session 13 slides (limitations of SL), the Session 14 handout (PL
// vocabulary, formulas, sentences, scope, substitution instances, informal
// interpretations), the Session 18 handout and slides (formal semantics of
// PL/PLE: interpretations, denotation, variable assignments and their
// variants, satisfaction, truth), Problem Sets 7-10 with the TA's answers,
// Quizzes 5-6 and the final exam. Every interpretation example was
// re-evaluated by a small finite-model checker, and every claimed validity
// was brute-forced over all interpretations with domains of size 1-3.
// Notation is the course's: (∀x), (∃x), ∼ & ∨ ⊃ ≡.
// Corrections / additions:
//  - Session 18 handout, satisfaction clause 4: "d satisfies Q&R iff d
//    satisfies Q or d satisfies R" — must be "and". Clause 7 for Q ≡ R says
//    "P and Q are both satisfied … or neither P nor Q" — must be Q and R.
//    Both are fixed in the card.
//  - Session 18 slides, the proof that (∀x)(Rxx ⊃ (∃y)Rxy) is
//    quantificationally true, write the pair as ⟨den(y), den(x)⟩ for the
//    atomic formula Rxy; the order should be ⟨den(x), den(y)⟩ (harmless there
//    because both denote u). The card writes it in the right order.
//  - Problem Set 7, Question 1(e), answer sheet: it claims
//    {(∀x)(∀y)(Rxy ⊃ Ryx), (∀x)(∀y)(∀z)((Rxy & Ryz) ⊃ Rxz)} entails (∀x)Rxx
//    ("every symmetric, transitive relation is reflexive. And that's
//    true."). That is false: UD = {1}, R = ∅ makes both premises true and
//    the conclusion false. The entailment does hold once (∀x)(∃y)Rxy is
//    added as a premise. The card gives the counterexample and the repaired
//    version.
//  - Quiz 5 (formula vs sentence) and Quiz 6 (evaluating sentences on an
//    interpretation) have no posted answers; the answers are this module's,
//    checked against the handout's rules and by the model checker.
//  - The Russellian translation of definite descriptions and the final
//    exam's "true only on infinite domains" example are standard material
//    added beyond the posted notes (the calendar lists definite descriptions
//    for Lecture 13; no slides were posted for it). Lecture 15's "most" and
//    donkey sentences have no posted material and are not carded.
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit24241-pl";

export const mit24241PredicateLogicCards: Card[] = [
  // --- Lecture 12: Introduction to predicate logic ---
  {
    id: "mit24241-pl-why-predicate-logic",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why can't SL show that 'Everything in the house smells bad; Fido is in the house; so Fido smells bad' is valid? What does PL add?",
    back: `In SL each of the three sentences is atomic, because none is a truth-functional compound. So the argument's best SL symbolization is "A, B, therefore C", which is **truth-functionally invalid**. Yet the English argument is plainly deductively valid.

The validity depends on structure *inside* the sentences: "everything", "is in the house", "smells bad", "Fido". SL can't see that structure (Session 13). PL adds:
- **individual constants**: a, b, f, … name objects (f = Fido);
- **predicates**: Hx (x is in the house), Sx (x smells bad), and many-place ones like Lxy;
- **variables** w, x, y, z and the **quantifiers** (∀x) "for every x" and (∃x) "for some x";
- a **universe of discourse (UD)**, the things the quantifiers range over.

Symbolized: (∀x)(Hx ⊃ Sx), Hf, therefore Sf. This is **quantificationally valid**. Any interpretation making the first premise true makes Hf ⊃ Sf true, so together with Hf it makes Sf true.

A second Session 13 example: "Nothing has horns and also wings. Some animals at Neverland Ranch have horns. All chickens have wings. So not all animals at Neverland Ranch are chickens." It is valid only because of how the quantifiers and predicates interact.

Final exam Question 22 asks for exactly this pattern: an argument whose SL symbolization is invalid in SD but whose PL symbolization is valid in PD.`,
    related: ["mit24241-pl-vocabulary-and-formulas", "mit24241-pl-translation-patterns"],
  },
  {
    id: "mit24241-pl-vocabulary-and-formulas",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give the recursive definition of the formulas of PL and the definition of a sentence of PL. What is unusual about the quantifier clause?",
    back: `**Vocabulary** (Session 14 handout): sentence letters (A, B, C₃, …); n-place predicates (F, G, R, …); individual constants (a, b₄, c₂, …); variables (w, x, y₃, z₁, …); quantifiers (∀x), (∃x); the SL connectives; parentheses. Constants and variables together are the **individual terms**.

**Atomic formula**: a sentence letter, or an n-place predicate followed by **exactly n** individual terms (Fa, Rxy, Gx).

**Formulas** are what can be built by:
1. every atomic formula is a formula;
2. if P is a formula, so is ∼P;
3. if P and Q are formulas, so are (P & Q), (P ∨ Q), (P ⊃ Q), (P ≡ Q);
4. if P is a formula that **contains at least one occurrence of x** and **no x-quantifier**, then (∀x)P and (∃x)P are formulas.

**Sentence**: a formula in which **no variable occurs free**. Only sentences get truth values on an interpretation. Formulas with free variables, such as Fx, are only satisfied or not, relative to a variable assignment.

**What's unusual about clause 4.** It bans **vacuous quantifiers**, such as (∀x)Fa or (∃z)(Gx & Fy), where the quantified variable never occurs. It also bans **re-quantifying a bound variable**, such as (∀x)(Fx & (∀x)Gx). Many textbooks (and most of mathematics) allow both. TLB's PL just treats them as ungrammatical.`,
    pitfall:
      "In standard first-order logic, (∀x)(Fx & (∀x)Gx) is a well-formed sentence: the inner quantifier shadows the outer one. In TLB's PL it isn't a formula at all. Check which grammar a question assumes before calling something ill-formed.",
    related: ["mit24241-pl-why-predicate-logic", "mit24241-pl-scope-free-bound", "mit24241-pl-formula-or-sentence", "mit24241-sl-syntax"],
  },

  // --- Lecture 13: Open sentences; free vs. bound variables; scope ---
  {
    id: "mit24241-pl-scope-free-bound",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the scope of a quantifier, bound and free occurrences of a variable, and a substitution instance P(a/x). Why does the order of mixed quantifiers matter?",
    back: `From the Session 14 handout:
- The **scope** of a quantifier is the subformula of which that quantifier is the main logical operator.
- An occurrence of x is **bound** iff it lies within the scope of an x-quantifier. Otherwise it is **free**.
- **P(a/x)** is the expression just like P except that the constant a replaces every **free** occurrence of x in P.
- If a sentence has the form (∀x)Q or (∃x)Q, then **Q(a/x)** is a **substitution instance** of it, with **instantiating constant** a.

Examples:
- In (∀x)Fx ⊃ Gx, the scope of (∀x) is just Fx. The last x is free, so this is a formula but not a sentence.
- The substitution instances of (∀x)(Fx ⊃ (∃y)Rxy) are Fa ⊃ (∃y)Ray, Fb ⊃ (∃y)Rby, and so on.

**The order of quantifiers matters.** With Lxy read as "x loves y":
- (∀x)(∃y)Lxy: everyone loves someone (possibly a different someone for each).
- (∃y)(∀x)Lxy: there is one person everyone loves.

The second entails the first, but not conversely. For a counter-interpretation, take UD = {1, 2} and L = {⟨1, 1⟩, ⟨2, 2⟩}: everyone loves someone (themselves), but no single object is loved by everyone. **Quantifier scope ambiguity** in English ("Everyone loves someone") is the problem of choosing between these readings.`,
    pitfall:
      "Substitution replaces only the free occurrences of the quantified variable, and it uses a constant. Replacing a variable bound by an inner quantifier changes the meaning.",
    related: ["mit24241-pl-vocabulary-and-formulas", "mit24241-pd-exists-forall-swap"],
  },
  {
    id: "mit24241-pl-formula-or-sentence",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Classify as sentence, formula only, or neither (F, G 1-place; R 2-place; A a sentence letter): Fx; Rb; (Ga & Ga); (∃z)Fz; (A ⊃ (∃x)Gx); (∀x)(∃z)(Gx & Fy); ((∀x)Fx & (∀x)Gx); (∀x)(Fx & (∀x)Gx).",
    back: `Quiz 5, checked against the handout's rules.

| Expression | Verdict | Why |
|---|---|---|
| Fx | **formula, not a sentence** | atomic; x is free |
| Rb | **neither** | R is 2-place but has 1 term, so it is not even atomic |
| (Ga & Ga) | **sentence** | redundant, but well formed, and nothing is free |
| (∃z)Fz | **sentence** | Fz contains z and no z-quantifier |
| (A ⊃ (∃x)Gx) | **sentence** | a sentence letter may be combined with a quantified sentence |
| (∀x)(∃z)(Gx & Fy) | **neither** | (∃z) is applied to (Gx & Fy), which contains no z, which clause 4 forbids |
| ((∀x)Fx & (∀x)Gx) | **sentence** | two separate x-quantifiers with disjoint scopes is fine |
| (∀x)(Fx & (∀x)Gx) | **neither** | (∀x) is applied to a formula that already contains an x-quantifier |

Two further items from the quiz: (∀x)(∃y)(Gx & Fy) is a sentence. ∀yRxy, written without the parentheses PL requires around a quantifier, is not an expression of PL as defined. Read as (∀y)Rxy it would be a formula with x free, so not a sentence.

**Procedure**: (1) check every atomic part has the right number of terms; (2) check every quantifier's scope contains its variable and no second quantifier for that variable; (3) check that no variable is left free.`,
    related: ["mit24241-pl-vocabulary-and-formulas", "mit24241-pl-scope-free-bound"],
  },
  {
    id: "mit24241-pl-relation-properties-countermodel",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Symbolize symmetry, transitivity and reflexivity of R in PL. Is every symmetric, transitive relation reflexive? Prove your answer with an interpretation.",
    back: `- Symmetric: (∀x)(∀y)(Rxy ⊃ Ryx)
- Transitive: (∀x)(∀y)(∀z)((Rxy & Ryz) ⊃ Rxz)
- Reflexive: (∀x)Rxx

**No.** The answer sheet for Problem Set 7 (Question 1e) claims these two premises entail reflexivity. That is **false**.

**Counter-interpretation**: UD = {1}, R = ∅ (the empty relation).
- Symmetry: there is no pair in R, so every instance Rxy ⊃ Ryx has a false antecedent. It is true.
- Transitivity: likewise vacuously true.
- (∀x)Rxx: ⟨1, 1⟩ ∉ R, so it is false.

All premises are true and the conclusion is false, so the argument is quantificationally invalid. (A brute-force search of all relations on 1–3 element domains finds exactly this kind of counterexample: some object related to nothing.)

**What is true**: symmetric + transitive + **serial** (every x is related to something: (∀x)(∃y)Rxy) does entail reflexivity. Take any x. Pick y with Rxy. Symmetry gives Ryx. Transitivity applied to Rxy and Ryx gives Rxx.

The "proof" without seriality goes wrong exactly at "pick y with Rxy": nothing guarantees such a y exists.`,
    pitfall:
      "To refute an entailment claim you need one interpretation, and the smallest ones are often vacuous: an empty extension makes every universally quantified conditional about it true.",
    related: ["mit24241-pl-quantificational-properties", "mit24241-pl-satisfaction-worked-example"],
  },

  // --- Lecture 14: Identity; functions; translation ---
  {
    id: "mit24241-pl-identity-and-counting",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "With identity (PLE), how do you say 'at least two things', 'at most two things', 'exactly one F', and 'the F is G'? How are functors interpreted?",
    back: `**PLE** adds the 2-place predicate = (always interpreted as identity) and **functors**: f(t₁, …, tₙ) is a term denoting an object.

**Counting with =:**
- At least two things: (∃x)(∃y)∼x = y
- At most two things (the second premise in Problem Set 10's PDE derivation): ∼(∃x)(∃y)(∃z)(∼x = y & (∼x = z & ∼y = z))
- Exactly one F: (∃x)(Fx & (∀y)(Fy ⊃ y = x))
- **The F is G** (Russell's analysis of definite descriptions): (∃x)((Fx & (∀y)(Fy ⊃ y = x)) & Gx). There is exactly one F, and it is G.

**Final exam 29–30 ideas:**
- (∀x)(∀y)x = y is true on some interpretation (any one-object UD) and on **no** interpretation with an infinite UD.
- Conversely, (∀x)(∃y)Rxy & (∀x)∼Rxx & (∀x)(∀y)(∀z)((Rxy & Ryz) ⊃ Rxz) is true only on infinite UDs. R would be an irreflexive, transitive relation where everything has a successor, so following successors never returns to an earlier object.

**Functor semantics** (Session 18 handout): an n-place functor is assigned a set of (n+1)-tuples that is the graph of a total function on the UD. If g gets {⟨1,1,2⟩, ⟨1,2,3⟩, ⟨1,3,4⟩, …} (addition on the positive integers), then g(1,3) denotes 4, because ⟨1, 3, 4⟩ ∈ I(g). Satisfaction gets one new clause: d satisfies t₁ = t₂ iff $\\text{den}_{I,d}(t_1) = \\text{den}_{I,d}(t_2)$.`,
    pitfall:
      "'There are two F's' written as (∃x)(∃y)(Fx & Fy) is true when there's only one F: x and y can denote the same object. You need ∼x = y.",
    related: ["mit24241-pl-translation-patterns", "mit24241-pl-formal-semantics"],
  },

  // --- Lecture 15: Translation to and from PL/PLE ---
  {
    id: "mit24241-pl-translation-patterns",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How do you symbolize 'All F are G', 'Some F are G' and 'No F is G' in PL? What goes wrong with (∀x)(Fx & Gx) and (∃x)(Fx ⊃ Gx)?",
    back: `**The four basic forms:**
- All F are G: (∀x)(Fx ⊃ Gx). **∀ goes with ⊃.**
- Some F are G: (∃x)(Fx & Gx). **∃ goes with &.**
- No F is G: ∼(∃x)(Fx & Gx), equivalently (∀x)(Fx ⊃ ∼Gx).
- Not all F are G: ∼(∀x)(Fx ⊃ Gx), equivalently (∃x)(Fx & ∼Gx).

**The two classic errors:**
- (∀x)(Fx & Gx) says **everything** is both F and G, which is far too strong.
- (∃x)(Fx ⊃ Gx) is far too weak. It is true as soon as **something is not F**, because a false antecedent makes the conditional true. Problem Set 8 (8.2E 2d) shows the effect: (∃x)((∃y)Fy ⊃ ∼Fx) comes out true in a one-object UD where nothing is F, because the embedded antecedent is false.

**Nested forms** (from the problem-set answers):
- "Everything is shorter than something": (∀x)(∃y)Bxy.
- "There is an even prime, and every prime larger than it is odd" starts with (∃x)(…) and has a (∀y)(… ⊃ …) inside.
- "If one number is larger than another, the second is not larger than the first": (∀x)(∀y)(Lxy ⊃ ∼Lyx).

The **main logical operator** is the operator applied last. In (∀x)(∃y)Dxy & (∀x)(∀y)(Dxy ⊃ (Ax & ∼Fx)) it is the **&**, not a quantifier.`,
    pitfall:
      "A sentence with a quantifier at the front isn't automatically quantified as a whole. Check the main logical operator first: (∀x)Fx ⊃ Ga is a conditional, not a universal.",
    related: ["mit24241-pl-identity-and-counting", "mit24241-pl-prenex-restriction", "mit24241-sl-connectives-and-translation"],
  },
  {
    id: "mit24241-pl-prenex-restriction",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Show that (∃x)Fx ⊃ P is equivalent to (∀x)(Fx ⊃ P) when x does not occur in P. Why is the restriction essential?",
    back: `This is from TLB's list of quantificational equivalences (Problem Set 7, Question 2).

**Equivalence** (x not in P). Fix an interpretation; P's truth value there doesn't depend on x.
- If P is true, both sentences are true. The left one has a true consequent, and every instance Fa ⊃ P has a true consequent.
- If P is false, the left side is true iff (∃x)Fx is false, i.e. nothing is F. The right side is true iff every instance Fa ⊃ P is true, i.e. iff Fa is false for every object, i.e. nothing is F.

The two sides agree in both cases. (Checked by brute force on all interpretations with 1–3 objects.) Read in words: "if anything is F then P" says the same as "for each thing, if it is F then P".

**Why the restriction matters.** Drop it and let P be Gx. The sentence (∀x)(Fx ⊃ Gx) has no equivalent of the other form. The only candidate, (∃x)Fx ⊃ Gx, is **not a sentence**: its last x lies outside the scope of (∃x) and is free (the answer sheet's point).

**Note the quantifier flip**: an ∃ in the antecedent of a conditional becomes a ∀ when moved out to cover the whole conditional. An antecedent behaves like a negated position, since P ⊃ Q is equivalent to ∼P ∨ Q, and ∼(∃x)Fx is equivalent to (∀x)∼Fx.`,
    related: ["mit24241-pl-translation-patterns", "mit24241-pl-scope-free-bound"],
  },

  // --- Lecture 16: Informal PL semantics; quantificational properties ---
  {
    id: "mit24241-pl-quantificational-properties",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is an interpretation of PL? Define quantificational truth, falsity, consistency, equivalence and entailment, and show (∃x)Gx, (∀x)(Gx ⊃ Dxx) does not entail (∃x)(∀y)(Gx & Dxy).",
    back: `An **interpretation** specifies a nonempty **UD**, a truth value for each sentence letter, an object of the UD for each constant, and an **extension** for each n-place predicate (a set of n-tuples from the UD).

The quantificational notions copy the truth-functional ones, with "interpretation" in place of "TVA":
- P is **q-true** iff true on every interpretation, and **q-false** iff true on none.
- Γ is **q-consistent** iff some interpretation makes all of Γ true.
- P, Q are **q-equivalent** iff no interpretation gives them different values.
- $\\Gamma \\vDash P$ iff no interpretation makes all of Γ true and P false.

Examples from Problem Set 7:
- q-true: (∀x)(Rxx ⊃ (∃y)Rxy).
- q-false: (∃x)(Fx & ∼Fx).
- q-equivalent: (∀x)(Fx ⊃ (A & ∼A)) and ∼(∃x)Fx.
- q-inconsistent: {Fa, ∼(∃x)Fx}.

**Invalidity by interpretation** (Problem Set 8, 8.4E 2g): UD = {Damien, Ephraim}; G = {Damien}; D = {⟨Damien, Damien⟩, ⟨Ephraim, Ephraim⟩}.
- (∃x)Gx: true, since Damien is in G.
- (∀x)(Gx ⊃ Dxx): true, since everyone bears D to himself.
- (∃x)(∀y)(Gx & Dxy): false. Ephraim isn't G, and Damien doesn't bear D to Ephraim.

So the premises don't entail the conclusion.

**Unlike SL, there is no truth-table test.** There are infinitely many interpretations, and some sentences can be falsified only on infinite UDs. So showing that a property *fails* can't always be done by checking finitely many cases. Derivations (PD) are the systematic positive method.`,
    related: ["mit24241-pl-formal-semantics", "mit24241-pl-relation-properties-countermodel", "mit24241-sl-tf-properties"],
  },
  {
    id: "mit24241-pl-nonempty-domain",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does PL require a nonempty UD, and what follows? Is {Fa, ∼(∃x)Fx} inconsistent in every logic?",
    back: `The Session 18 handout requires $\\emptyset \\subset \\text{UD}$: every interpretation's universe of discourse has **at least one** object. Also, **every constant must denote** an object in the UD.

**Consequences:**
- (∀x)Fx ⊃ (∃x)Fx is **q-true**, and {(∀x)Fx} ⊢ (∃x)Fx in PD (final exam, Question 28a: ∀E to Fa, then ∃I). On an empty domain, (∀x)Fx would be vacuously true and (∃x)Fx false.
- (∃x)(Fx ∨ ∼Fx) is q-true. "Something exists" is a logical truth of PL.
- Fa entails (∃x)Fx. Since a must name something in the UD, {Fa, ∼(∃x)Fx} is **q-inconsistent** (Problem Set 7).

**Not in every logic.** The answer sheet notes that **free logics** allow non-denoting names (and sometimes empty domains). In a free logic {Fa, ∼(∃x)Fx} can be consistent, e.g. "Pegasus is winged; nothing is winged and real".

Standard first-order logic as taught in CS courses (KU Leuven included) makes the same two choices as PL: nonempty domains and total constant denotation.`,
    pitfall:
      "Inferences like (∀x)Fx ⊢ (∃x)Fx feel wrong if you picture an empty domain, and they fail in databases where a table can be empty. They are valid in FOL only because FOL rules empty domains out.",
    related: ["mit24241-pl-quantificational-properties", "mit24241-pd-quantifier-rules"],
  },

  // --- Lecture 17: Formal PL/PLE semantics ---
  {
    id: "mit24241-pl-formal-semantics",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give the formal semantics of PL: denotation of terms, variants d[u/x] of a variable assignment, the satisfaction clauses, and the definition of truth on an interpretation.",
    back: `Fix an interpretation I. A **variable assignment** d for I maps every variable to an object of I's UD.

**Denotation**: $\\text{den}_{I,d}(t) = d(t)$ if t is a variable, and $I(t)$ if t is a constant.

**Variant**: d[u/x] assigns u to x and otherwise agrees with d. Example: if d₁ assigns Alice to x, Bill to y and Carol to z, then d₁[John/y] assigns Alice, John, Carol.

**Satisfaction** (Session 18 handout, with clauses 4 and 7 corrected):
1. d satisfies a sentence letter P iff I(P) = T.
2. d satisfies $At_1 \\ldots t_n$ iff $\\langle \\text{den}_{I,d}(t_1), \\ldots, \\text{den}_{I,d}(t_n) \\rangle \\in I(A)$.
3. d satisfies ∼Q iff d does not satisfy Q.
4. d satisfies Q & R iff d satisfies Q **and** d satisfies R.
5. d satisfies Q ∨ R iff d satisfies Q or d satisfies R.
6. d satisfies Q ⊃ R iff d doesn't satisfy Q or d satisfies R.
7. d satisfies Q ≡ R iff d satisfies **both Q and R** or **neither**.
8. d satisfies (∀x)Q iff **for every** u ∈ UD, d[u/x] satisfies Q.
9. d satisfies (∃x)Q iff **for some** u ∈ UD, d[u/x] satisfies Q.

**Truth**: a sentence P is **true on I** iff **every** variable assignment for I satisfies P, and **false on I** iff none does.

**Why assignments are needed.** The quantifier clauses recurse into Q, which has x free. Q has no truth value of its own, so the recursion is over **satisfaction of formulas**, with d supplying values for free variables. For a sentence, which has no free variables, either every d satisfies it or none does. That is why truth can be defined as "satisfied by all d".`,
    pitfall:
      "Don't define (∀x)Q as true when every substitution instance Q(a/x) is true. That only works if every object has a name, and an interpretation can have objects no constant denotes. The d[u/x] clause quantifies over objects directly.",
    related: ["mit24241-pl-satisfaction-worked-example", "mit24241-pl-quantificational-properties", "mit24241-pd-canonical-model-truth-lemma"],
  },

  // --- Lecture 18: Formal semantics continued; review ---
  {
    id: "mit24241-pl-satisfaction-worked-example",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Let I have UD = {a, b}, F = {⟨a⟩}, G = {⟨b⟩}. Using the satisfaction clauses, show that (∀x)Fx and (∀x)(Fx ≡ Gx) are false on I and that (∃x)(Fx ⊃ (∀y)Gy) and ∼(∃x)(Fx & Gx) are true.",
    back: `Throughout, let d be an **arbitrary** assignment for I. For a sentence, showing d satisfies it (or doesn't) for arbitrary d settles its truth (or falsity) on I.

**(∀x)Fx is false.** ⟨b⟩ ∉ I(F), so d[b/x] doesn't satisfy Fx (clause 2). So not every variant d[u/x] satisfies Fx, and by clause 8 d doesn't satisfy (∀x)Fx. Since d was arbitrary, no assignment satisfies it, and it is false on I.

**(∃x)(Fx ⊃ (∀y)Gy) is true.** By clause 9, d satisfies it iff some d[u/x] satisfies Fx ⊃ (∀y)Gy. By clause 6, that holds if d[u/x] fails to satisfy Fx. Take u = b: ⟨b⟩ ∉ I(F), so d[b/x] doesn't satisfy Fx, and the conditional is satisfied. So every d satisfies the sentence, and it is true. (A conditional with a false antecedent is all it takes, whatever happens to (∀y)Gy, which is in fact false since a ∉ G.)

**∼(∃x)(Fx & Gx) is true** (Problem Set 9). d satisfies it iff d doesn't satisfy (∃x)(Fx & Gx) (clause 3), iff there's **no** u with d[u/x] satisfying both Fx and Gx (clauses 9 and 4). u = a is in F but not G; u = b is in G but not F. So no such u exists.

**(∀x)(Fx ≡ Gx) is false** (Problem Set 9). By clause 8, d satisfies it iff every d[u/x] satisfies Fx ≡ Gx. For u = a, Fx is satisfied and Gx is not, so by clause 7 d[a/x] fails. So no d satisfies the sentence.

All four values were confirmed by a finite-model evaluator.`,
    related: ["mit24241-pl-formal-semantics", "mit24241-pl-q-true-proof"],
  },
  {
    id: "mit24241-pl-q-true-proof",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove from the satisfaction clauses that (∀x)(Rxx ⊃ (∃y)Rxy) is quantificationally true.",
    back: `**Goal**: the sentence is true on **every** interpretation, i.e. for every I and every assignment d for I, d satisfies it.

Take an arbitrary I and d. By clause 8, d satisfies (∀x)(Rxx ⊃ (∃y)Rxy) iff for every u ∈ UD, d[u/x] satisfies Rxx ⊃ (∃y)Rxy. By clause 6, that holds iff for every u, either d[u/x] fails to satisfy Rxx, or d[u/x] satisfies (∃y)Rxy.

**Reductio.** Suppose some u has d[u/x] satisfying Rxx but not (∃y)Rxy.
- d[u/x] satisfies Rxx, so by clause 2, $\\langle u, u \\rangle \\in I(R)$.
- Now take the variant d[u/x][u/y], which gives both x and y the value u. Its denotations are $\\text{den}(x) = u$ and $\\text{den}(y) = u$, so $\\langle \\text{den}(x), \\text{den}(y) \\rangle = \\langle u, u \\rangle \\in I(R)$. By clause 2, d[u/x][u/y] satisfies Rxy.
- So for some v ∈ UD (namely v = u), d[u/x][v/y] satisfies Rxy, and by clause 9 d[u/x] satisfies (∃y)Rxy. This contradicts the supposition.

So for every u the conditional is satisfied, and d satisfies the universal sentence. Since I and d were arbitrary, the sentence is true on every interpretation: it is **q-true**. ∎

**The key move**: the witness for (∃y) is the same object u that x already denotes. Informally: "whatever bears R to itself bears R to something, namely itself."`,
    related: ["mit24241-pl-satisfaction-worked-example", "mit24241-pl-quantificational-properties"],
  },
  {
    id: "mit24241-pl-evaluating-sentences",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "UD = {McCain, Obama, Damien}; D = {Obama}, R = {McCain}, P = {Damien}; O = {⟨McCain, Obama⟩, ⟨McCain, Damien⟩, ⟨Obama, Damien⟩}; m, o, d name them. Evaluate (∀z)(∼m = z ⊃ Omz), (∃x)(∼x = m & ∼Oxd), (∀y)(∃z)Ozy, (∃z)(∀y)(∼y = z ⊃ Oyz), (∀y)(∀x)((Ry ⊃ Oyx) ≡ ∼Rx).",
    back: `Quiz 6. Evaluate a quantified sentence by checking each object of the UD in turn: ∀ needs all of them to pass, ∃ needs one.

1. **(∀z)(∼m = z ⊃ Omz): TRUE.** For z = McCain the antecedent is false. For z = Obama and z = Damien, ⟨McCain, Obama⟩ and ⟨McCain, Damien⟩ are both in O.
2. **(∃x)(∼x = m & ∼Oxd): TRUE.** x = Obama fails, because ⟨Obama, Damien⟩ ∈ O. x = Damien works: Damien ≠ McCain, and ⟨Damien, Damien⟩ ∉ O.
3. **(∀y)(∃z)Ozy: FALSE.** For y = McCain, no pair in O has McCain second. Nothing bears O to McCain.
4. **(∃z)(∀y)(∼y = z ⊃ Oyz): TRUE.** Take z = Damien. Every other object bears O to Damien: ⟨McCain, Damien⟩ and ⟨Obama, Damien⟩ are both in O.
5. **(∀y)(∀x)((Ry ⊃ Oyx) ≡ ∼Rx): FALSE.** Take y = Obama and x = McCain. Ry is false, so Ry ⊃ Oyx is true. But ∼Rx is false, since McCain ∈ R. A true left side and a false right side make the biconditional false, so one failing pair refutes the ∀∀.

The quiz's remaining items, all checked by a model evaluator: Oom ∨ Do is true (Obama ∈ D), (∃x)Oox is true, (∃y)(∃x)(Dy & Oxy) is true (y = Obama, x = McCain), (∀x)((Dx ∨ Rx) ⊃ ∼Odx) is true, and (∀x)(∼(∃z)Oxz ⊃ Px) is true (only Damien bears O to nothing, and Damien ∈ P).`,
    pitfall:
      "The order inside a tuple matters: Oxy holds iff ⟨x, y⟩ ∈ O. Checking ⟨Damien, Obama⟩ when the formula asks for Ozy with z = Obama and y = Damien (or the other way round) is the commonest slip.",
    related: ["mit24241-pl-satisfaction-worked-example", "mit24241-pl-identity-and-counting"],
  },
];
