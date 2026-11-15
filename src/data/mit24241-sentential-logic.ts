// MIT 24.241 Logic I (Fall 2009, Ephraim Glick; TA Damien Rochford) — Part 1:
// Sentential Logic, Syntax & Semantics (Lectures 1-5). The course follows
// Bergmann, Moor & Nelson, "The Logic Book" (TLB, 5th ed.), which is NOT on
// OCW, so these cards are sourced only from the course's OCW-hosted
// materials, read page by page: the Session 2 and Session 4 handouts, the
// Session 9 slides (the ⊨ vs ⊢ reminder), Problem Sets 1-3 with the TA's
// answer sheets, Quiz 1-2 and the final-exam study guide. Every truth table
// was recomputed by brute force over all truth-value assignments (TVAs).
// Notation is the course's: ∼ & ∨ ⊃ ≡ (standard ¬ ∧ ∨ → ↔).
// Corrections / additions:
//  - The Session 2 handout lists "Strengthening: (A ⊃ B) implies
//    ((A & B) ⊃ B)". As printed the conclusion is valid on its own, so the
//    entry says nothing about ⊃; the intended law is (A ⊃ B) implies
//    ((A & C) ⊃ B) (antecedent strengthening), which is what the card uses.
//  - The handouts leave the definitions as fill-in blanks ("is valid iff
//    ..."); the completed definitions follow TLB's standard wording as used
//    throughout the course's answer sheets and slides.
//  - The Lecture 3 "problems with conditionals" card adds the standard
//    observations about material implication (the handout only lists the
//    four laws).
// Covers KU Leuven's "Logica voor informatici" (propositional logic part).
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit24241-sl";

export const mit24241SententialLogicCards: Card[] = [
  // --- Lecture 1: Basic notions of logic; arguments ---
  {
    id: "mit24241-sl-validity-soundness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define deductive validity and soundness of an argument, and the logical notions of truth, falsity, indeterminacy, consistency and equivalence.",
    back: `An **argument** is a set of sentences, one designated the **conclusion** and the rest the **premises**.

- **Deductively valid**: it is **impossible** for all the premises to be true while the conclusion is false. Validity is about the *form* of the reasoning, not about whether the premises are actually true.
- **Sound**: valid **and** all premises actually true. A sound argument therefore has a true conclusion.

For single sentences and sets:
- **Logically true**: cannot be false. **Logically false**: cannot be true. **Logically indeterminate**: neither.
- A set is **logically consistent** iff it is possible for all its members to be true together.
- Two sentences are **logically equivalent** iff they cannot differ in truth value.

The edge cases in Problem Set 1 test whether you apply the definition literally:
- Every argument whose **conclusion is logically true** is valid: the conclusion can never be false, so "premises true, conclusion false" can never happen.
- Every argument whose **premises are inconsistent** is valid, for the same reason from the other side.
- Some argument with a **logically false conclusion** is valid. Take logically false premises.
- Some **invalid** argument has true premises and a true conclusion. Take three unrelated true sentences.

Example from the answer sheet: "Either penguins can fly or they can sing. Penguins can't fly. So penguins can sing." It is valid, because its form is disjunctive syllogism, but it is unsound, because the first premise is false.`,
    pitfall:
      "Valid does not mean 'has true premises and a true conclusion'. Validity only rules out one combination (all premises true and the conclusion false). An argument can be valid with false premises, and invalid even though everything in it is true.",
    related: ["mit24241-sl-tf-entailment-validity", "mit24241-sl-explosion-and-fallacies"],
  },

  // --- Lecture 2: Truth-functionality; SL syntax and semantics ---
  {
    id: "mit24241-sl-truth-functionality",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What makes a connective truth-functional? Why does 'because' have to be translated into SL as an atomic sentence?",
    back: `A connective is **truth-functional** iff the truth value of the compound it forms is **completely determined by the truth values of its components**. Such a connective *is* a function on truth values:
- a one-place connective is a function $f: \\{T, F\\} \\to \\{T, F\\}$;
- a two-place connective is a function $f: \\{T, F\\} \\times \\{T, F\\} \\to \\{T, F\\}$.

The **truth table** of the connective is just a listing of that function. SL's five connectives, ∼ & ∨ ⊃ ≡, are all truth-functional.

**Non-truth-functional English connectives.** Take "Bill won the race **because** Gladys broke her leg." Even if both components are true, the compound can be true or false: maybe Gladys's injury was irrelevant. Knowing the truth values of "Bill won" and "Gladys broke her leg" does not fix the truth value of the whole, so no SL connective can express "because".

The course's answer for this sentence (Problem Set 1) is to translate it as a **single atomic sentence** A. You lose its internal structure, but you don't misrepresent it. The same goes for "necessarily", "believes that", "before" and similar connectives.`,
    pitfall:
      "Don't translate 'P because Q' as P & Q, or as Q ⊃ P. Both are truth-functional, and both are true in situations where the 'because' claim is false (e.g. two true but unrelated facts).",
    related: ["mit24241-sl-syntax", "mit24241-sl-connectives-and-translation", "mit24241-slmeta-tf-completeness-dnf"],
  },
  {
    id: "mit24241-sl-syntax",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give the recursive definition of the sentences of SL. What is the main connective of a sentence, and why does the recursive definition matter later?",
    back: `**Symbols of SL**: sentence letters A, B, …, Z (also with subscripts, e.g. H₇, J₃), the connectives ∼ & ∨ ⊃ ≡, and the parentheses ( and ).

**Sentences**: the set of sentences of SL is the **smallest** set F such that:
1. every **atomic sentence** (sentence letter) is in F;
2. if φ and ψ are in F, then so are ∼φ, (φ & ψ), (φ ∨ ψ), (φ ⊃ ψ) and (φ ≡ ψ).

"Smallest" is what excludes junk: nothing is a sentence unless the two clauses force it in. Every non-atomic sentence was built by exactly one last application of clause 2, and that connective is the sentence's **main connective**. It is the one whose truth table you compute last.

Example: in ∼(A ⊃ B) the main connective is ∼. In (A ∨ B) ⊃ (∼B ⊃ A) it is the first ⊃. (Outer parentheses are conventionally dropped.)

**Why it matters**: because sentences are built up in stages, every claim "all sentences of SL have property X" can be proved by **induction on the number of connectives**. The base case covers atomic sentences, and the inductive step has one case per connective. The metatheory (truth-functional completeness, soundness, completeness) uses this over and over.`,
    pitfall:
      "Truth values belong to sentences only relative to a truth-value assignment (TVA). A sentence letter like A has no fixed truth value. Each TVA assigns T or F to every sentence letter, and the connectives' tables then fix the value of every compound.",
    related: ["mit24241-sl-truth-functionality", "mit24241-slmeta-induction-on-sentences"],
  },
  {
    id: "mit24241-sl-connectives-and-translation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give the truth tables of SL's connectives and translate: 'only if', 'neither … nor', 'P even though Q', and 'Bill will win iff Gladys breaks a leg or has a hangover'.",
    back: `| P | Q | ∼P | P & Q | P ∨ Q | P ⊃ Q | P ≡ Q |
|---|---|---|---|---|---|---|
| T | T | F | T | T | T | T |
| T | F | F | F | T | F | F |
| F | T | T | F | T | T | F |
| F | F | T | F | F | T | T |

∨ is **inclusive**. P ⊃ Q is false **only** in the row P = T, Q = F; its left side is the **antecedent** and its right side the **consequent**.

**Translations** (from Problem Set 1's answer sheet):
- "Methuselah is the oldest man **only if** no man is older than he is" becomes A ⊃ B. "P only if Q" puts **Q in the consequent**: it says P can't be true without Q.
- "**Neither** Mary **nor** Frank has both a dog and a cat" becomes ∼((A & B) ∨ (C & D)), or equivalently ∼(A & B) & ∼(C & D).
- "Bill will win the race **if and only if** Gladys either breaks a leg or has a hangover" becomes A ≡ (B ∨ C).
- "If some lawyers are dishonest but some are not, I will not tell lawyer-jokes **even though** people laugh at them" becomes ((A & B) ⊃ C) & D. Both "but" and "even though" are translated as &. The contrast they express is not truth-functional and is lost.`,
    pitfall:
      "'P only if Q' is P ⊃ Q, not Q ⊃ P. 'P if Q' is Q ⊃ P. The word 'only' flips which side is the antecedent.",
    related: ["mit24241-sl-truth-functionality", "mit24241-sl-conditional-laws", "mit6120-proofs-implication-truth-table"],
  },

  // --- Lecture 3: Translation continued; problems with conditionals ---
  {
    id: "mit24241-sl-conditional-laws",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Which laws hold for the material conditional ⊃ but sound wrong for English 'if … then'? (Contraposition, strengthening, (A ⊃ B) ∨ (B ⊃ A), ∼(A ⊃ B).)",
    back: `The Lecture 2–3 handout lists four facts about ⊃ in SL. All four can be checked by truth table.

1. **Contraposition**: A ⊃ B entails ∼B ⊃ ∼A (and vice versa).
2. **Strengthening the antecedent**: A ⊃ B entails (A & C) ⊃ B.
3. **(A ⊃ B) ∨ (B ⊃ A)** is a tautology: true on every TVA.
4. **∼(A ⊃ B)** is true iff A is true and B is false, i.e. it is equivalent to A & ∼B.

Why these are "problems with conditionals" for English:
- **Strengthening** fails for ordinary conditionals: "if I strike this match it will light" does not seem to entail "if I strike this match and it is soaking wet, it will light".
- **(A ⊃ B) ∨ (B ⊃ A)** says that, for any two sentences whatsoever, one "implies" the other. Take "if the moon is cheese then 2 + 2 = 5, or if 2 + 2 = 5 then the moon is cheese": in SL it is true.
- **∼(A ⊃ B) ≡ (A & ∼B)**: denying "if it rains the match will be cancelled" in English does not commit you to "it rains".

These are features of the **material** conditional: ⊃ is defined by its truth table, and its truth value depends only on the truth values of its parts. SL accepts these oddities in exchange for being truth-functional.`,
    pitfall:
      "Contraposition (A ⊃ B to ∼B ⊃ ∼A) is valid. Its look-alikes are not: the converse (B ⊃ A) and the inverse (∼A ⊃ ∼B) are not entailed by A ⊃ B.",
    related: ["mit24241-sl-connectives-and-translation", "mit6120-proofs-implication-truth-table", "mit24241-sd-theorem-derivation"],
  },

  // --- Lecture 4: Truth-tables and logical properties of compound sentences ---
  {
    id: "mit24241-sl-truth-table-computation",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Compute the truth tables of ∼(A ⊃ B) and (A ∨ B) ⊃ (∼B ⊃ A). Classify each as truth-functionally true, false, or indeterminate.",
    back: `**Method.** Write a row for each of the $2^n$ TVAs of the $n$ sentence letters. Then compute the columns from the innermost connective outwards. The main connective's column comes last and gives the sentence's value.

**∼(A ⊃ B)**:

| A | B | A ⊃ B | ∼(A ⊃ B) |
|---|---|---|---|
| T | T | T | **F** |
| T | F | F | **T** |
| F | T | T | **F** |
| F | F | T | **F** |

It is true on some TVAs and false on others, so it is **truth-functionally indeterminate**. It is true exactly when A is true and B is false.

**(A ∨ B) ⊃ (∼B ⊃ A)**:

| A | B | A ∨ B | ∼B | ∼B ⊃ A | whole |
|---|---|---|---|---|---|
| T | T | T | F | T | **T** |
| T | F | T | T | T | **T** |
| F | T | T | F | T | **T** |
| F | F | F | T | F | **T** |

It is true on every TVA, so it is **truth-functionally true**. In the only row where the consequent is false (A = F, B = F), the antecedent is false too.

**Shortened truth tables**: to show that a sentence *can* take a value, you only need **one** row. Fix the value of the main connective and work backwards to a TVA that produces it. This proves "not TF-true" or "not TF-false" with one row. Proving TF-truth itself still needs every row (or a derivation).`,
    related: ["mit24241-sl-tf-properties", "mit24241-sl-syntax"],
  },
  {
    id: "mit24241-sl-tf-properties",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Define truth-functional truth, falsity, indeterminacy, consistency and equivalence. For each, what does a truth table need to show to establish it, and what to refute it?",
    back: `All of these are defined in terms of **truth-value assignments (TVAs)**, not in terms of derivability or "possibility":

| Property | Definition | Established by | Refuted by |
|---|---|---|---|
| P is **TF-true** | P is true on every TVA | the full table (all rows T) | one row where P is F |
| P is **TF-false** | P is false on every TVA | the full table (all rows F) | one row where P is T |
| P is **TF-indeterminate** | neither TF-true nor TF-false | two rows: one T, one F | the full table |
| Γ is **TF-consistent** | some TVA makes every member of Γ true | one row | the full table |
| P, Q are **TF-equivalent** | no TVA gives them different values | the full table | one row where they differ |

The pattern: an **existential** claim (some TVA does X) needs one witnessing row, so a shortened table suffices. A **universal** claim (every TVA does X) needs every row.

Example from the final exam: {A ≡ (B ∨ C), ∼A & ∼C} is TF-consistent. The single row A = F, B = F, C = F makes both members true (∼A & ∼C is true, and A ≡ (B ∨ C) is F ≡ F, which is true). By brute force it is the only such row.

Sets use set notation: Γ ranges over sets of SL sentences, ∅ is the empty set, and Γ ∪ {P} adds P to Γ.`,
    pitfall:
      "Indeterminacy of each member doesn't give consistency of the set. A and ∼A are both TF-indeterminate, but {A, ∼A} is TF-inconsistent. Consistency needs one TVA that makes all members true at once.",
    related: ["mit24241-sl-truth-table-computation", "mit24241-sl-tf-entailment-validity", "mit24241-sl-explosion-and-fallacies"],
  },

  // --- Lecture 5: Entailment and validity with truth-tables ---
  {
    id: "mit24241-sl-tf-entailment-validity",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Define Γ ⊨ P and truth-functional validity. Use a truth table to show that the argument with premise ∼(C ∨ A) and conclusion ∼(C ≡ ∼A) is valid.",
    back: `**Truth-functional entailment**: $\\Gamma \\vDash P$ iff **no TVA makes every member of Γ true and P false**. Equivalently, P is true on every TVA that makes all of Γ true. The notation $\\vDash P$ abbreviates $\\emptyset \\vDash P$, which says that P is TF-true.

An argument with premises P₁, …, Pₙ and conclusion C is **TF-valid** iff no TVA makes P₁, …, Pₙ true and C false. Comparing the two definitions:
$$\\text{the argument is TF-valid} \\iff \\{P_1, \\ldots, P_n\\} \\vDash C.$$

**Problem Set 3, Question 1**: the premise is ∼(C ∨ A) and the conclusion is ∼(C ≡ ∼A).

| A | C | ∼(C ∨ A) | ∼A | C ≡ ∼A | ∼(C ≡ ∼A) |
|---|---|---|---|---|---|
| T | T | F | F | F | T |
| T | F | F | F | T | F |
| F | T | F | T | T | F |
| F | F | **T** | T | F | **T** |

The premise is true only in the last row, and the conclusion is true there too. So no row has a true premise and a false conclusion, and the argument is **TF-valid**.

To show an argument is **invalid**, one row with every premise true and the conclusion false is enough. That is a shortened truth table.`,
    pitfall:
      "Rows where some premise is false are irrelevant to validity. Only rows that make every premise true need checking. A conclusion that is false in other rows doesn't make the argument invalid.",
    related: ["mit24241-sl-validity-soundness", "mit24241-sl-entailment-metatheorems", "mit24241-slmeta-semantic-vs-syntactic"],
  },
  {
    id: "mit24241-sl-entailment-metatheorems",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove from the definition of ⊨: Γ ∪ {P} ⊨ Q iff Γ ⊨ P ⊃ Q. Then prove that if Γ ⊨ P and Γ ⊨ ∼P, Γ is truth-functionally inconsistent.",
    back: `These are **metalanguage** proofs: claims *about* SL, proved by unpacking definitions in terms of TVAs.

**(1) Γ ∪ {P} ⊨ Q iff Γ ⊨ P ⊃ Q** (Problem Set 2, 3.6E 2b). Each step is an "iff":
- Γ ⊨ P ⊃ Q
- iff no TVA makes every member of Γ true and P ⊃ Q false (definition of ⊨);
- iff no TVA makes every member of Γ true, P true and Q false (P ⊃ Q is false exactly when P is true and Q is false);
- iff no TVA makes every member of Γ ∪ {P} true and Q false;
- iff Γ ∪ {P} ⊨ Q.

This is the semantic counterpart of the derivation rule ⊃I. To show Γ ⊨ P ⊃ Q, you may assume P as well and show Q.

**(2) If Γ ⊨ P and Γ ⊨ ∼P then Γ is TF-inconsistent** (3.6E 3b).
- From Γ ⊨ P: no TVA makes all of Γ true and P false.
- From Γ ⊨ ∼P: no TVA makes all of Γ true and ∼P false, i.e. no TVA makes all of Γ true and P true.
- Every TVA makes P either true or false. So no TVA makes all of Γ true, and Γ is TF-inconsistent. ∎

In the same style (3.6E 4c): if Γ ⊨ P and Γ′ ⊨ Q, then Γ ∪ Γ′ ⊨ P & Q. Any TVA making Γ ∪ Γ′ true makes both Γ and Γ′ true, hence makes P and Q true.`,
    pitfall:
      "Entailment doesn't distribute over ∨. {A ∨ B} ⊨ A ∨ B, yet {A ∨ B} entails neither A nor B (Problem Set 2, 3.5E 5c). Getting P ∨ Q from Γ doesn't mean Γ settles which disjunct is true.",
    related: ["mit24241-sl-tf-entailment-validity", "mit24241-sd-conditional-proof"],
  },
  {
    id: "mit24241-sl-explosion-and-fallacies",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Is the argument with premise ∼(A ⊃ (B ∨ A)) and conclusion ∼B valid? Explain why every argument with inconsistent premises is valid.",
    back: `**Quiz 2, Question 1.** The premise ∼(A ⊃ (B ∨ A)) is true only if A ⊃ (B ∨ A) is false, which needs A true and B ∨ A false. But if A is true then B ∨ A is true. So the premise is **false on every TVA**: it is TF-false.

| A | B | B ∨ A | A ⊃ (B ∨ A) | premise | ∼B |
|---|---|---|---|---|---|
| T | T | T | T | F | F |
| T | F | T | T | F | T |
| F | T | T | T | F | F |
| F | F | F | T | F | T |

No row has a true premise, so certainly no row has a true premise and a false conclusion. The argument is **TF-valid**, whatever its conclusion.

**In general**: if Γ is TF-inconsistent then Γ ⊨ P for **every** P. The definition of ⊨ only rules out TVAs that make Γ true and P false, and there is no TVA that makes Γ true at all. This "explosion" is why consistency matters so much: an inconsistent set of premises supports every conclusion, and so it gives you no information about which conclusions are true.

Dually, if P is TF-true then Γ ⊨ P for every Γ, including ∅.`,
    pitfall:
      "A valid argument with an inconsistent premise set is not sound (its premises can't all be true). Explosion makes such arguments trivially valid, and useless as evidence for their conclusions.",
    related: ["mit24241-sl-validity-soundness", "mit24241-sl-tf-properties", "mit24241-sd-negated-theorem-explosion"],
  },
];
