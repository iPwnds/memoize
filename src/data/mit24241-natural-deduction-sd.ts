// MIT 24.241 Logic I (Fall 2009, Ephraim Glick; TA Damien Rochford) — Part 2:
// Natural Deduction for Sentential Logic, the derivation system SD
// (Lectures 6-8). OCW has no slides for Sessions 6-8, and SD's official rule
// list lives in "The Logic Book" (TLB), which is not on OCW. These cards are
// therefore built from the course's own OCW materials, read page by page:
// Problem Sets 3 and 6 with the TA's answer sheets (which contain full SD
// derivations), Quizzes 2-3, the final exam and its study guide, and the
// Session 10/11/24 slides, which use the rules ∼I, ∼E, &E, ⊃I and the
// definition of Γ ⊢ P in the soundness and completeness proofs. Every
// derivation was re-checked line by line, and every claimed entailment was
// confirmed by truth table.
// Corrections / additions:
//  - Problem Set 3, Question 2(b): the final line is justified "2-8 ∼I"; the
//    subderivation runs from line 2 to line 7, so the card has "2–7 ∼I".
//  - Problem Set 3, Question 4 (TLB 5.3E 13a): the answer sheet's
//    counterexample TVA (A false, B true) makes the inferred sentence B
//    true, so it does not refute the rule. A counterexample needs the
//    inferred disjunct false and the other true; the card uses one.
//  - The rule statements for ≡I and ≡E, and the reiteration/accessibility
//    conditions, are stated in TLB's standard form. The OCW materials only
//    use them (≡E in Problem Set 10) without stating them.
//  - The derivations for Quiz 2, Questions 4 and 5, and the answer to final
//    exam Question 13 are this module's own (OCW posts no quiz/final
//    solutions).
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit24241-sd";

export const mit24241NaturalDeductionSdCards: Card[] = [
  // --- Lecture 6: Derivations in sentential logic (SD) ---
  {
    id: "mit24241-sd-derivation-structure",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a derivation in SD? Explain scope lines, primary vs auxiliary assumptions, open vs closed assumptions, accessibility, and the definition of Γ ⊢ P.",
    back: `SD is a **Fitch-style natural deduction** system. A derivation is a numbered list of SL sentences. Each line carries a **justification**: either "A" (an assumption) or a rule plus the earlier lines it cites.

- **Scope lines.** Every assumption starts a vertical scope line. Everything to the right of that line, until the line ends, is **in the scope** of the assumption.
- **Primary assumptions** sit at the top of the main scope line. These are the premises.
- **Auxiliary assumptions** open a **subderivation** in order to use a rule that needs one, such as ⊃I, ∼I, ∼E, ∨E or ≡I. They are written "A/⊃I", "A/∼E" and so on, naming the rule they are for.
- An auxiliary assumption is **discharged (closed)** when its scope line ends. That happens exactly when the rule it was for is applied to the whole subderivation.
- **Accessibility.** A later line may cite a sentence only if that sentence is not inside a subderivation that has already closed. A closed subderivation can be cited only *as a whole*, by the rule that closes it.

**Derivability**: $\\Gamma \\vdash P$ in SD iff there is a derivation in which **all primary assumptions are members of Γ** and P occurs **in the scope of only those assumptions** (on the main scope line, with every auxiliary assumption closed). P is a **theorem** of SD iff $\\emptyset \\vdash P$.

Since a derivation is finite, it uses only finitely many members of Γ. This fact is what drives the compactness theorem later.`,
    pitfall:
      "A sentence derived inside a subderivation depends on that subderivation's assumption. Copying it out to the main scope line after the subderivation closes is the classic invalid move, and the accessibility rule exists to forbid it.",
    related: ["mit24241-sd-rules", "mit24241-sl-tf-entailment-validity"],
  },
  {
    id: "mit24241-sd-rules",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "List SD's rules: Reiteration and an introduction and an elimination rule for each of &, ∨, ⊃, ∼, ≡.",
    back: `Each connective has an **introduction** rule (how to derive a sentence with it as main connective) and an **elimination** rule (how to use one). "P…Q" below means a subderivation from the auxiliary assumption P to the line Q.

| Rule | From | Derive |
|---|---|---|
| **R** (Reiteration) | an accessible P | P |
| **&I** | P and Q | P & Q |
| **&E** | P & Q | P (or Q) |
| **∨I** | P | P ∨ Q (or Q ∨ P), for any Q |
| **∨E** | P ∨ Q, a subderivation P…R and a subderivation Q…R | R |
| **⊃I** | a subderivation P…Q | P ⊃ Q |
| **⊃E** | P ⊃ Q and P | Q |
| **∼I** | a subderivation from P containing some Q and ∼Q | ∼P |
| **∼E** | a subderivation from ∼P containing some Q and ∼Q | P |
| **≡I** | subderivations P…Q and Q…P | P ≡ Q |
| **≡E** | P ≡ Q and P (or Q) | Q (or P) |

**∼I and ∼E are both reductio rules.** ∼I refutes an assumption P by deriving a contradiction from it, which gives ∼P. ∼E assumes ∼P, derives a contradiction, and concludes P. ∼E is the rule that makes the system classical: it is how you prove something by contradiction.

Justifications cite line numbers: "1, 4 ⊃E" or "3–6 ∼I" (a range for a subderivation). In the course's soundness proof, each of these rules gets its own case.`,
    pitfall:
      "∨E isn't 'from P ∨ Q, derive P'. You have to derive the same goal R separately from each disjunct (proof by cases), and both subderivations must end in R.",
    related: ["mit24241-sd-derivation-structure", "mit24241-sd-negation-rules-example", "mit24241-sd-disjunction-elimination", "mit6120-proofs-inference-rules"],
  },
  {
    id: "mit24241-sd-negation-rules-example",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive in SD: {(A ⊃ B) ⊃ ∼B} ⊢ ∼B.",
    back: `**Strategy.** The goal ∼B is a negation, so assume B and aim for a contradiction (∼I). With B available you can prove A ⊃ B for free, because the consequent is already there. ⊃E with the premise then gives ∼B, which contradicts the assumption B.

(The │ marks show scope lines.)

| # | Sentence | Justification |
|---|---|---|
| 1 | (A ⊃ B) ⊃ ∼B | A |
| 2 | │ B | A / ∼I |
| 3 | │ │ A | A / ⊃I |
| 4 | │ │ B | 2 R |
| 5 | │ A ⊃ B | 3–4 ⊃I |
| 6 | │ ∼B | 1, 5 ⊃E |
| 7 | │ B | 2 R |
| 8 | ∼B | 2–7 ∼I |

Lines 3–4 show a useful trick: to derive P ⊃ Q when Q is already accessible, assume P and reiterate Q.

Semantic check: if B were true, A ⊃ B would be true, so the premise would make ∼B true. So every TVA that makes the premise true makes B false, and {(A ⊃ B) ⊃ ∼B} ⊨ ∼B.`,
    related: ["mit24241-sd-rules", "mit24241-sd-conditional-proof"],
  },

  // --- Lecture 7: Derivations in SD/SD+ ---
  {
    id: "mit24241-sd-conditional-proof",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive in SD: {A ⊃ B} ⊢ ∼B ⊃ ∼(A & D).",
    back: `**Strategy: work backwards from the goal's main connective.**
- The goal is a conditional, so assume ∼B and aim for ∼(A & D) (⊃I).
- That subgoal is a negation, so assume A & D and aim for a contradiction (∼I).

| # | Sentence | Justification |
|---|---|---|
| 1 | A ⊃ B | A |
| 2 | │ ∼B | A / ⊃I |
| 3 | │ │ A & D | A / ∼I |
| 4 | │ │ A | 3 &E |
| 5 | │ │ B | 1, 4 ⊃E |
| 6 | │ │ ∼B | 2 R |
| 7 | │ ∼(A & D) | 3–6 ∼I |
| 8 | ∼B ⊃ ∼(A & D) | 2–7 ⊃I |

Both auxiliary assumptions close (at lines 7 and 8), so line 8 is in the scope of the primary assumption only. That is what $\\{A \\supset B\\} \\vdash \\sim B \\supset \\sim(A \\,\\&\\, D)$ requires.

This "assume the antecedent, derive the consequent" pattern is the SD version of the direct proof of P ⊃ Q. Its semantic counterpart is the metatheorem: Γ ∪ {P} ⊨ Q iff Γ ⊨ P ⊃ Q.`,
    pitfall:
      "Subderivations must nest. The inner one (3–6) has to close before the outer one (2–7) does. You can't end the ⊃I subderivation while the ∼I assumption is still open.",
    related: ["mit24241-sd-negation-rules-example", "mit24241-sl-entailment-metatheorems"],
  },
  {
    id: "mit24241-sd-disjunction-elimination",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Use ∨E (proof by cases) to derive {(A & B) ∨ (B & C)} ⊢ A ∨ (B & C), and to derive {∼P, ∼Q} ⊢ ∼(P ∨ Q).",
    back: `**(1) Quiz 2, Question 4.** Derive the goal A ∨ (B & C) from each disjunct, then apply ∨E.

| # | Sentence | Justification |
|---|---|---|
| 1 | (A & B) ∨ (B & C) | A |
| 2 | │ A & B | A / ∨E |
| 3 | │ A | 2 &E |
| 4 | │ A ∨ (B & C) | 3 ∨I |
| 5 | │ B & C | A / ∨E |
| 6 | │ A ∨ (B & C) | 5 ∨I |
| 7 | A ∨ (B & C) | 1, 2–4, 5–6 ∨E |

**(2) One De Morgan direction (Problem Set 6).** The goal is a negation, so assume P ∨ Q for ∼I. Inside, use ∨E to get P in both cases. The Q case reaches P by ∼E, because Q contradicts the premise ∼Q.

| # | Sentence | Justification |
|---|---|---|
| 1 | ∼P | A |
| 2 | ∼Q | A |
| 3 | │ P ∨ Q | A / ∼I |
| 4 | │ │ P | A / ∨E |
| 5 | │ │ P | 4 R |
| 6 | │ │ Q | A / ∨E |
| 7 | │ │ │ ∼P | A / ∼E |
| 8 | │ │ │ Q | 6 R |
| 9 | │ │ │ ∼Q | 2 R |
| 10 | │ │ P | 7–9 ∼E |
| 11 | │ P | 3, 4–5, 6–10 ∨E |
| 12 | │ ∼P | 1 R |
| 13 | ∼(P ∨ Q) | 3–12 ∼I |

The converse, {∼(P ∨ Q)} ⊢ ∼P, is short: assume P, get P ∨ Q by ∨I, reiterate ∼(P ∨ Q), and close with ∼I.`,
    related: ["mit24241-sd-rules", "mit24241-sd-plus-derived-rules"],
  },
  {
    id: "mit24241-sd-plus-derived-rules",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "SD+ adds rules such as Disjunctive Syllogism (from P ∨ Q and ∼P, infer Q). Is SD+ stronger than SD? Show that DS is derivable in SD.",
    back: `**SD+ is not stronger.** It derives exactly the same sentences from the same sets: Γ ⊢ P in SD+ iff Γ ⊢ P in SD. (This is a true/false item on Quiz 3. The answer is "false".) The extra rules are **derived rules**, i.e. shortcuts. Any use of one can be replaced by a fixed pattern of SD steps.

**Proof for DS** (Problem Set 3, Question 7). Suppose P ∨ Q is on line i and ∼P on line j, both accessible. Replace the DS step with:

| # | Sentence | Justification |
|---|---|---|
| k | │ P | A / ∨E |
| k+1 | │ │ ∼Q | A / ∼E |
| k+2 | │ │ P | k R |
| k+3 | │ │ ∼P | j R |
| k+4 | │ Q | k+1 – k+3 ∼E |
| k+5 | │ Q | A / ∨E |
| k+6 | │ Q | k+5 R |
| k+7 | Q | i, k – k+4, k+5 – k+6 ∨E |

This works for any P and Q, so every SD+ derivation that uses DS can be rewritten as an SD derivation. Showing the same for each of SD+'s other rules gives the full claim.

**Why bother with SD+?** Derivations get shorter. For metatheory, the smaller system SD is better: the soundness and completeness proofs need one case per rule, and a result for SD carries over to SD+.`,
    pitfall:
      "A derived rule is a different thing from a new axiom or primitive rule. It adds no new derivable sentences. A primitive rule that is not truth-preserving would add some, and would make the system unsound.",
    related: ["mit24241-sd-disjunction-elimination", "mit24241-sd-unsound-rule"],
  },

  // --- Lecture 8: Theorem-proving, review ---
  {
    id: "mit24241-sd-theorem-derivation",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Prove in SD that (A ⊃ B) ∨ (B ⊃ A) is a theorem, i.e. derivable from no premises.",
    back: `**Strategy.** With no premises, ∨I would need one disjunct on its own, and neither disjunct is a theorem. So assume the **negation of the goal** and derive a contradiction (∼E). Inside, first refute A (any proof of A would give B ⊃ A, hence the goal), then use ∼A to prove A ⊃ B.

| # | Sentence | Justification |
|---|---|---|
| 1 | │ ∼((A ⊃ B) ∨ (B ⊃ A)) | A / ∼E |
| 2 | │ │ A | A / ∼I |
| 3 | │ │ │ B | A / ⊃I |
| 4 | │ │ │ A | 2 R |
| 5 | │ │ B ⊃ A | 3–4 ⊃I |
| 6 | │ │ (A ⊃ B) ∨ (B ⊃ A) | 5 ∨I |
| 7 | │ │ ∼((A ⊃ B) ∨ (B ⊃ A)) | 1 R |
| 8 | │ ∼A | 2–7 ∼I |
| 9 | │ │ A | A / ⊃I |
| 10 | │ │ │ ∼B | A / ∼E |
| 11 | │ │ │ A | 9 R |
| 12 | │ │ │ ∼A | 8 R |
| 13 | │ │ B | 10–12 ∼E |
| 14 | │ A ⊃ B | 9–13 ⊃I |
| 15 | │ (A ⊃ B) ∨ (B ⊃ A) | 14 ∨I |
| 16 | │ ∼((A ⊃ B) ∨ (B ⊃ A)) | 1 R |
| 17 | (A ⊃ B) ∨ (B ⊃ A) | 1–16 ∼E |

Line 17 lies outside every scope line: every assumption has been discharged. So $\\emptyset \\vdash (A \\supset B) \\lor (B \\supset A)$, and the sentence is a theorem of SD. (Its truth table is all T, as soundness requires.)

**Heuristic for theorems and disjunctive goals**: when no premise helps and ∨I can't be used directly, assume the goal's negation and use ∼E.`,
    related: ["mit24241-sd-rules", "mit24241-sl-conditional-laws", "mit24241-sd-negated-theorem-explosion"],
  },
  {
    id: "mit24241-sd-properties-in-sd",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define inconsistency, validity, equivalence and theoremhood in SD. Show {(∼A ∨ ∼B) ⊃ ∼C, B ⊃ (C & ∼A), B} is inconsistent in SD. Which truth-functional properties can a derivation establish?",
    back: `**Definitions in SD:**
- Γ is **inconsistent in SD** iff for some Q, both Γ ⊢ Q and Γ ⊢ ∼Q.
- An argument is **valid in SD** iff its conclusion is derivable from its premises.
- P and Q are **equivalent in SD** iff {P} ⊢ Q and {Q} ⊢ P.
- P is a **theorem** iff ∅ ⊢ P.

**Inconsistency** (Problem Set 3, Question 3):

| # | Sentence | Justification |
|---|---|---|
| 1 | (∼A ∨ ∼B) ⊃ ∼C | A |
| 2 | B ⊃ (C & ∼A) | A |
| 3 | B | A |
| 4 | C & ∼A | 2, 3 ⊃E |
| 5 | ∼A | 4 &E |
| 6 | ∼A ∨ ∼B | 5 ∨I |
| 7 | ∼C | 1, 6 ⊃E |
| 8 | C | 4 &E |

Both C and ∼C are derived, so the set is inconsistent in SD.

**What a derivation can establish** (final exam, Question 13). A derivation is a finite certificate of an *existential* syntactic fact ("there is a derivation of …"). By soundness, it therefore establishes the truth-functional properties that say some sentence is **entailed**:
- inconsistency;
- entailment, and so validity of an argument;
- TF-truth (P derivable from ∅);
- TF-falsity ({P} inconsistent);
- equivalence.

It cannot directly establish the negative properties: consistency, non-entailment, invalidity, indeterminacy, non-equivalence. Those say *no* derivation exists, and a truth table (one row) is the natural way to show them.`,
    pitfall:
      "Failing to find a derivation proves nothing. Γ ⊬ P is a claim about all possible derivations. Show Γ ⊭ P with one TVA, and then completeness (contraposed) gives Γ ⊬ P.",
    related: ["mit24241-sd-derivation-structure", "mit24241-sl-tf-properties"],
  },
  {
    id: "mit24241-sd-negated-theorem-explosion",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Show that in SD every sentence Q can be derived from the negation of a theorem, and that the argument with premises A and ∼A and conclusion ∼(A & ∼A) is valid in SD.",
    back: `**Negated theorem** (Problem Set 3, Question 5). Let P be a theorem and suppose ∼P is on line i. Since ∅ ⊢ P, copy P's derivation into the current derivation (at some line j). Its lines need no premises, so P ends up in the scope of the current assumptions. Then, for any Q:

| # | Sentence | Justification |
|---|---|---|
| k | │ ∼Q | A / ∼E |
| k+1 | │ P | j R |
| k+2 | │ ∼P | i R |
| k+3 | Q | k – k+2 ∼E |

So {∼P} ⊢ Q for **every** Q. Any set containing the negation of a theorem is inconsistent in SD, and it "explodes".

**Quiz 2, Question 5.** The premises A and ∼A are themselves contradictory, so any conclusion follows. One derivation of ∼(A & ∼A):

| # | Sentence | Justification |
|---|---|---|
| 1 | A | A |
| 2 | ∼A | A |
| 3 | │ A & ∼A | A / ∼I |
| 4 | │ A | 1 R |
| 5 | │ ∼A | 2 R |
| 6 | ∼(A & ∼A) | 3–5 ∼I |

So the argument is **valid in SD**. (Here the conclusion is also a theorem: lines 3–5 could use &E on line 3 instead of the premises.)

This is the syntactic mirror of semantic explosion. An inconsistent Γ entails every sentence, and in SD it also derives every sentence.`,
    related: ["mit24241-sl-explosion-and-fallacies", "mit24241-sd-theorem-derivation"],
  },
  {
    id: "mit24241-sd-unsound-rule",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why would a rule letting you infer one disjunct from P ∨ Q be a bad addition to SD? What property must every derivation rule have?",
    back: `A derivation rule should be **truth-preserving**: whenever the sentences it is applied to are true on a TVA, the sentence it produces must be true on that TVA too. Only then do derivations track entailment. This is the property the soundness proof checks rule by rule.

**Counterexample for "from P ∨ Q infer Q"** (TLB 5.3E 13a, Problem Set 3). Let P = A and Q = B, and take the TVA with **A true and B false**. Then A ∨ B is true but B is false, so the rule takes you from a truth to a falsehood. One such TVA is enough to show the rule is not truth-preserving. (The symmetric rule "infer P" fails on A false, B true.)

Adding the rule would make the system **unsound**. You could derive B from {A ∨ B} even though {A ∨ B} ⊭ B.

Contrast with **Disjunctive Syllogism**: from P ∨ Q *and ∼P* infer Q. This is truth-preserving, because any TVA making both true must make P false and hence Q true. Being truth-preserving is what makes it safe to add as a derived rule (SD+).`,
    pitfall:
      "One counterexample TVA must make every input to the rule true and its output false. A TVA that makes the output true, or an input false, refutes nothing.",
    related: ["mit24241-sd-plus-derived-rules", "mit24241-sl-entailment-metatheorems"],
  },
];
