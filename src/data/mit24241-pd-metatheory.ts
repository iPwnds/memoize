// MIT 24.241 Logic I (Fall 2009, Ephraim Glick; TA Damien Rochford) — Part 5:
// Derivations in PD/PDE and the Metatheory of Predicate Logic (Lectures
// 19-25): the quantifier rules and their restrictions, identity rules,
// soundness of PD, completeness of PD (Henkin construction with evenly
// subscripted sets, existential completeness and a canonical interpretation
// on the positive integers), compactness and Löwenheim-Skolem. Sourced from
// the course's OCW slides for Sessions 22, 23 and 24, read page by page,
// plus the TA's answers to Problem Sets 9-10 and the final exam (Questions
// 26-31). OCW has no slides for Sessions 19-21, so the rule cards are built
// from the restrictions used on the Session 22 slides and the answer sheets'
// derivations. Every derivation was re-checked line by line (including each
// ∀I/∃E restriction), and every invalidity counterexample was evaluated by a
// finite-model checker.
// Corrections / additions:
//  - Session 22, soundness case for ∃E: the slide says Γm = Γh ∪ {Q(a/x)}
//    for the last line m of the subderivation. That fails when other
//    assumptions are opened between lines h and j. What the proof needs (and
//    the card uses) is Γm ⊆ Γk+1 ∪ {Q(a/x)}.
//  - Sessions 23/24: Session 23 gave a wrong reason for using evenly
//    subscripted (ES) sets ("only finitely many constants appear in any Γi");
//    Session 24 retracts it. The card gives the corrected reason: Γ may be
//    infinite and use every constant, and doubling subscripts frees all the
//    odd-subscripted constants to serve as fresh witnesses.
//  - Session 24 states the truth lemma's conclusion as "for any SL
//    sentence P"; it is about PL sentences.
//  - The statements of ∀I, ∃I, =I and =E follow TLB's standard form; the
//    OCW materials use them (and state the ∀I/∃E restrictions in Problem
//    Set 9's answers and on the Session 22 slides) but don't list them.
//  - The derivations for final-exam Questions 28(d) and 28(e), the
//    restriction counterexamples (final Question 27) and the answers to
//    Questions 26 and 31 are this module's own; OCW posts no final-exam
//    solutions.
//  - The Session 24 title promises PD+ and PDE metatheory, but the slides
//    only cover PD (no identity); the canonical model here does not handle
//    "=". The undecidability of first-order validity (Church/Turing) is
//    context added beyond the source.
// Covers KU Leuven's "Logica voor informatici" (first-order logic part).
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit24241-pd";

export const mit24241PdMetatheoryCards: Card[] = [
  // --- Lecture 19: Derivations in PD ---
  {
    id: "mit24241-pd-quantifier-rules",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State PD's four quantifier rules (∀E, ∃I, ∀I, ∃E) with the restrictions on ∀I and ∃E.",
    back: `PD is SD plus four rules. Q(a/x) is the result of replacing the free x's in Q with the constant a.

| Rule | From | Derive | Restriction |
|---|---|---|---|
| **∀E** | (∀x)Q | Q(a/x), for **any** constant a | none |
| **∃I** | Q(a/x) | (∃x)Q | none |
| **∀I** | Q(a/x) | (∀x)Q | a must **not** occur in any **open assumption**, nor in (∀x)Q |
| **∃E** | (∃x)Q and a subderivation from assumption Q(a/x) to R | R | a must **not** occur in (∃x)Q, in R, or in any **open assumption** |

**The idea behind the restrictions**: the instantiating constant must be **arbitrary**.
- **∀I**: if nothing you've assumed mentions a, then whatever you proved about a would hold for any object. So you may generalize.
- **∃E**: the subderivation reasons about "some object, call it a, that is Q". Since a is a fresh name about which nothing else is known, any conclusion R that doesn't mention a follows from (∃x)Q alone.

**Example** (Problem Set 9, 10.1E 1j): {(∀x)(Fx ⊃ Lx), (∃y)Fy} ⊢ (∃x)Lx.

| # | Sentence | Justification |
|---|---|---|
| 1 | (∀x)(Fx ⊃ Lx) | A |
| 2 | (∃y)Fy | A |
| 3 | │ Fa | A / ∃E |
| 4 | │ Fa ⊃ La | 1 ∀E |
| 5 | │ La | 3, 4 ⊃E |
| 6 | │ (∃x)Lx | 5 ∃I |
| 7 | (∃x)Lx | 2, 3–6 ∃E |

The ∃E is legal: a is not in (∃y)Fy, not in (∃x)Lx, and not in the open assumptions 1–2.`,
    pitfall:
      "∃E must close a subderivation (Problem Set 9, 10.1E 2c). Going straight from (∃x)Fx to Fa on the same scope line is not a rule: it would let you conclude that the particular object a is F.",
    related: ["mit24241-pd-restriction-violations", "mit24241-pd-exists-elim-example", "mit24241-sd-rules", "mit24241-pl-nonempty-domain"],
  },
  {
    id: "mit24241-pd-restriction-violations",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Show with counterexamples why ∀I and ∃E need their restrictions on the instantiating constant.",
    back: `Each illegal derivation "proves" a non-entailment. A counter-interpretation shows the conclusion really doesn't follow.

**∀I with a in an open assumption** (Problem Set 9, 10.1E 2b): assume Fa, then "∀I" gives (∀x)Fx. That would show {Fa} ⊢ (∀x)Fx. Counter-interpretation: UD = {1, 2}, a = 1, F = {1}. Fa is true and (∀x)Fx is false. The restriction blocks this: a occurs in the open assumption Fa.

**∃E with a in the conclusion R**: from (∃x)Fx, assume Fa, reiterate Fa, then "∃E" gives Fa on the main line. That would show {(∃x)Fx} ⊢ Fa. Counter-interpretation: UD = {1, 2}, a = 1, F = {2}.

**∃E with a in an open assumption** (final exam, Question 27):

| # | Sentence | Justification |
|---|---|---|
| 1 | Ga | A |
| 2 | (∃x)Fx | A |
| 3 | │ Fa | A / ∃E |
| 4 | │ Ga & Fa | 1, 3 &I |
| 5 | │ (∃x)(Gx & Fx) | 4 ∃I |
| 6 | (∃x)(Gx & Fx) | 2, 3–5 ∃E ✗ |

Line 6 violates the restriction, because a occurs in the open assumption Ga. Counter-interpretation: UD = {1, 2}, a = 1, G = {1}, F = {2}. Both premises are true, but nothing is both G and F.

In each case the derivation silently identified "some F" or "an arbitrary object" with an object we already knew something about.`,
    related: ["mit24241-pd-quantifier-rules", "mit24241-pd-soundness-exists-elim"],
  },
  {
    id: "mit24241-pd-exists-elim-example",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive in PD: {Hb ∨ (∀z)∼Hz, (∃y)Hy} ⊢ Hb.",
    back: `**Strategy.** Proof by cases (∨E) on the first premise. The Hb case is immediate. In the (∀z)∼Hz case, use ∃E on (∃y)Hy with a **fresh** constant a. Ha together with ∼Ha (from ∀E) is a contradiction, so ∼E gives Hb.

| # | Sentence | Justification |
|---|---|---|
| 1 | Hb ∨ (∀z)∼Hz | A |
| 2 | (∃y)Hy | A |
| 3 | │ Hb | A / ∨E |
| 4 | │ Hb | 3 R |
| 5 | │ (∀z)∼Hz | A / ∨E |
| 6 | │ │ Ha | A / ∃E |
| 7 | │ │ │ ∼Hb | A / ∼E |
| 8 | │ │ │ Ha | 6 R |
| 9 | │ │ │ ∼Ha | 5 ∀E |
| 10 | │ │ Hb | 7–9 ∼E |
| 11 | │ Hb | 2, 6–10 ∃E |
| 12 | Hb | 1, 3–4, 5–11 ∨E |

**Checking line 11.** The constant a doesn't occur in (∃y)Hy, in the conclusion Hb, or in the open assumptions (lines 1, 2 and 5). Using **b** as the instantiating constant at line 6 would be illegal, since b occurs in Hb and in line 1.

(Final exam, Question 28(d).)`,
    related: ["mit24241-pd-quantifier-rules", "mit24241-sd-disjunction-elimination"],
  },

  // --- Lecture 20: Derivations in PD+/PDE ---
  {
    id: "mit24241-pd-exists-forall-swap",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Derive ⊢ (∃x)(∀y)Hxy ⊃ (∀y)(∃x)Hxy in PD. Why does the same strategy fail for the converse?",
    back: `Problem Set 10, 10.2E 7j:

| # | Sentence | Justification |
|---|---|---|
| 1 | │ (∃x)(∀y)Hxy | A / ⊃I |
| 2 | │ │ (∀y)Hay | A / ∃E |
| 3 | │ │ Hab | 2 ∀E |
| 4 | │ │ (∃x)Hxb | 3 ∃I |
| 5 | │ │ (∀y)(∃x)Hxy | 4 ∀I |
| 6 | │ (∀y)(∃x)Hxy | 1, 2–5 ∃E |
| 7 | (∃x)(∀y)Hxy ⊃ (∀y)(∃x)Hxy | 1–6 ⊃I |

**Restrictions check:**
- Line 5 (∀I on b): b occurs in neither open assumption (lines 1 and 2), nor in (∀y)(∃x)Hxy.
- Line 6 (∃E on a): a is not in line 1, not in line 6, and not in any assumption still open.

**The converse fails.** From (∀y)(∃x)Hxy, ∀E gives (∃x)Hxa. To use it you open ∃E with assumption Hba (b fresh). To reach (∀y)Hby you'd need ∀I on a, but a appears only in Hba, which is the open ∃E assumption, so ∀I is blocked.

Semantically, the converse is invalid. Take UD = {1, 2} and H = {⟨1, 1⟩, ⟨2, 2⟩}: for every y something bears H to it, but no single x bears H to everything. The rules' restrictions are exactly what stop a soundness violation here.`,
    related: ["mit24241-pd-quantifier-rules", "mit24241-pl-scope-free-bound"],
  },
  {
    id: "mit24241-pd-identity-rules",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "State PDE's identity rules =I and =E, and use them to prove ⊢ ∼a = b ⊃ ∼b = a.",
    back: `**PDE** = PD plus:
- **=I**: (∀x)x = x may be entered on any line, with no premises.
- **=E**: from t₁ = t₂ and a sentence P, derive the result of replacing one or more occurrences of t₁ in P with t₂, or of t₂ with t₁. (Problem Set 10 uses it this way, e.g. from b = c and Rcc to Rbb.)

**Final exam, Question 28(e)**: ∅ ⊢ ∼a = b ⊃ ∼b = a.

| # | Sentence | Justification |
|---|---|---|
| 1 | │ ∼a = b | A / ⊃I |
| 2 | │ │ b = a | A / ∼I |
| 3 | │ │ (∀x)x = x | =I |
| 4 | │ │ a = a | 3 ∀E |
| 5 | │ │ a = b | 2, 4 =E |
| 6 | │ │ ∼a = b | 1 R |
| 7 | │ ∼b = a | 2–6 ∼I |
| 8 | ∼a = b ⊃ ∼b = a | 1–7 ⊃I |

Line 5 replaces the **second** occurrence of a in a = a with b, using b = a.

This proves that identity is symmetric. Transitivity is similar: from a = b and b = c, replace b in a = b with c using b = c.

**Where = earns its keep**: counting ("at least three things", "at most two things"). Problem Set 10 derives a contradiction from "everything has its own distinct partner, different from a" together with "there are at most two things".`,
    related: ["mit24241-pl-identity-and-counting", "mit24241-pd-quantifier-rules"],
  },

  // --- Lecture 21: Derivations in PDE continued; preliminaries for meta-theory ---
  {
    id: "mit24241-pd-what-pd-can-prove",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "In SL, truth tables decide every truth-functional property. Is there an equally powerful method for PL? Which quantificational properties can PD establish?",
    back: `| | SL | PL |
|---|---|---|
| Semantic objects | finitely many TVAs per sentence | infinitely many interpretations, with arbitrarily large (even infinite) UDs |
| Mechanical test for validity | truth tables: **decides** it, yes or no | **none in general** |
| Proof system | SD: sound and complete | PD: sound and complete |

**What PD can establish** (final exam, Question 26). By soundness and completeness, whenever the following hold, some PD derivation shows it:
- quantificational validity of an argument (entailment);
- q-truth;
- q-falsity;
- q-inconsistency;
- q-equivalence.

**What it can't establish**: q-consistency, invalidity, non-equivalence and indeterminacy. These say that some interpretation *exists*. You show them by giving an interpretation, and a sentence like the final exam's "true only on infinite UDs" may need an infinite one.

**Beyond the course**: Church and Turing (1936) showed that no algorithm decides first-order validity. Searching through all PD derivations will find a proof of every valid sentence eventually, but it may run forever on an invalid one. So validity is **semi-decidable** (recursively enumerable) but not decidable. This is the halting problem showing up in logic.`,
    pitfall:
      "Completeness doesn't give you a decision procedure. It guarantees that a proof exists for every valid sentence, not that you can tell, for an arbitrary sentence, whether to keep searching.",
    related: ["mit24241-sd-properties-in-sd", "mit24241-pl-quantificational-properties", "mit6045-computability-decide-vs-recognize"],
  },

  // --- Lecture 22: Soundness of PD, PD+, PDE ---
  {
    id: "mit24241-pd-soundness-forall-elim",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Outline the soundness proof for PD and prove its ∀E case, including the lemma {(∀x)Q} ⊨ Q(a/x).",
    back: `**Same strategy as for SD.** Let $\\Gamma_i$ be the set of open assumptions at line i and $P_i$ the sentence there. Prove by induction on i that **every line is quantificationally entailed by its open assumptions**: $\\Gamma_i \\vDash P_i$.
- **Basis**: line 1 is an assumption, so $\\{P_1\\} \\vDash P_1$.
- **Inductive step**: one case per rule. All of SD's cases carry over with "interpretation" in place of "TVA". The new work is in the four quantifier rules.

**∀E case.** $P_{k+1} = Q(a/x)$, obtained from (∀x)Q on line i. By the hypothesis, $\\Gamma_i \\vDash (\\forall x)Q$. By monotonicity (11.3.2) and $\\Gamma_i \\subseteq \\Gamma_{k+1}$, we get $\\Gamma_{k+1} \\vDash (\\forall x)Q$. So it suffices to prove:

**Lemma (11.1.4)**: $\\{(\\forall x)Q\\} \\vDash Q(a/x)$. Suppose I makes (∀x)Q true, and let d be any assignment. Then d satisfies (∀x)Q, so for **every** u ∈ UD, d[u/x] satisfies Q. In particular d[I(a)/x] satisfies Q. By **11.1.1**, d[I(a)/x] satisfies Q iff d satisfies Q(a/x). (Giving x the value I(a) is the same as writing the name a in x's place.) So d satisfies Q(a/x), and since d was arbitrary, Q(a/x) is true on I. ∎

Chaining: $\\Gamma_{k+1} \\vDash (\\forall x)Q$ and $\\{(\\forall x)Q\\} \\vDash Q(a/x)$ give $\\Gamma_{k+1} \\vDash Q(a/x)$.

**∃I** is the dual: $\\{Q(a/x)\\} \\vDash (\\exists x)Q$, with witness u = I(a). The restricted rules **∀I** and **∃E** are where the restrictions are used.`,
    related: ["mit24241-pd-soundness-exists-elim", "mit24241-slmeta-soundness-strategy", "mit24241-pl-formal-semantics"],
  },
  {
    id: "mit24241-pd-soundness-exists-elim",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the ∃E case of PD's soundness proof, showing where each part of the restriction on the constant a is used.",
    back: `**Setup.** (∃x)Q is on line h. A subderivation opens with assumption Q(a/x) on line j and ends with $P_{k+1}$ on line m. Then line k + 1 is $P_{k+1}$ by ∃E. **Restriction**: a occurs neither in (∃x)Q, nor in $P_{k+1}$, nor in any member of $\\Gamma_{k+1}$.

**From the inductive hypothesis:**
- $\\Gamma_m \\vDash P_{k+1}$. Every assumption open at m other than Q(a/x) is still open at k + 1, so $\\Gamma_m \\subseteq \\Gamma_{k+1} \\cup \\{Q(a/x)\\}$, and by monotonicity $\\Gamma_{k+1} \\cup \\{Q(a/x)\\} \\vDash P_{k+1}$. (Session 22 writes $\\Gamma_m = \\Gamma_h \\cup \\{Q(a/x)\\}$, which fails if other assumptions were opened in between. The inclusion is what's needed.)
- $\\Gamma_h \\vDash (\\exists x)Q$ and $\\Gamma_h \\subseteq \\Gamma_{k+1}$, so $\\Gamma_{k+1} \\vDash (\\exists x)Q$.

**Show** $\\Gamma_{k+1} \\vDash P_{k+1}$, by reductio. Suppose I makes all of $\\Gamma_{k+1}$ true and $P_{k+1}$ false. Then I makes (∃x)Q true, so some u ∈ UD has d[u/x] satisfying Q.

Let **I′ be just like I except I′(a) = u.**
- a does not occur in $\\Gamma_{k+1}$, $P_{k+1}$ or (∃x)Q (**the restriction**), and what a denotes is irrelevant to sentences that don't contain a. So I′ still makes $\\Gamma_{k+1}$ true and $P_{k+1}$ false, and Q still holds of u on I′.
- Since I′(a) = u, I′ makes **Q(a/x) true**.

So I′ makes all of $\\Gamma_{k+1} \\cup \\{Q(a/x)\\}$ true and $P_{k+1}$ false. That contradicts $\\Gamma_{k+1} \\cup \\{Q(a/x)\\} \\vDash P_{k+1}$. ∎

**Why each restriction matters.** If a occurred in $\\Gamma_{k+1}$ or in $P_{k+1}$, re-pointing a at the witness u could change their truth values, and the reductio would collapse.`,
    related: ["mit24241-pd-soundness-forall-elim", "mit24241-pd-restriction-violations"],
  },

  // --- Lecture 23: Completeness of PD ---
  {
    id: "mit24241-pd-completeness-roadmap",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Give the roadmap of the completeness proof for PD, and say what new ingredients it needs beyond the SD proof.",
    back: `**Goal**: if $\\Gamma \\vDash P$ then $\\Gamma \\vdash P$ in PD. As for SD, prove the contrapositive.

**Definitions** (Session 23):
- **MC-PD**: Γ* is consistent in PD, and adding any sentence not in it makes it inconsistent.
- **∃-complete (∃C)**: for every (∃x)Q ∈ Γ*, some substitution instance Q(a/x) is also in Γ*. Every existential claim in the set has a named witness.
- **Evenly subscripted (ES) variant** $\\Gamma_e$ of Γ: the result of doubling the subscript of every individual constant in Γ.

**Chain:**
1. $\\Gamma \\nvdash P$ implies that Γ ∪ {∼P} is consistent in PD (assume ∼P and use ∼E, exactly as for SD).
2. Its ES variant is also consistent. Halve the subscripts throughout any derivation of a contradiction from the variant, and you get a derivation of one from Γ ∪ {∼P}.
3. The ES variant extends to a set Γ* that is **MC-PD and ∃C** (TLB 11.4.4, the Henkin construction).
4. Every MC-∃C-PD set is **q-consistent**: an interpretation I* makes all of it true (TLB 11.4.8).
5. So the ES variant is q-consistent. Relabel the constants (I(aₙ) = Iₑ(a₂ₙ)), and Γ ∪ {∼P} is q-consistent.
6. So $\\Gamma \\nvDash P$.

**What's new compared with SD:**
- **witnesses**: the ∃C clause, needed so that existential sentences in Γ* come out true;
- **fresh constants for the witnesses**: the ES trick;
- **an interpretation, not a TVA**: a UD built from the constants themselves.`,
    related: ["mit24241-pd-even-subscripts", "mit24241-pd-henkin-construction", "mit24241-pd-canonical-model-truth-lemma", "mit24241-slmeta-completeness-roadmap"],
  },
  {
    id: "mit24241-pd-even-subscripts",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does the PD completeness proof first replace Γ ∪ {∼P} by its evenly subscripted variant?",
    back: `The Henkin construction sometimes adds a witness Q(a/x) for an existential (∃x)Q, where **a must be a constant that occurs nowhere in the set built so far**. That fresh name is what makes adding the witness safe, by the same reasoning as ∃E's restriction.

**The wrong reason** (given in Session 23 and retracted in Session 24): "only finitely many constants appear in any Γᵢ, so there's always an unused one". That assumes Γ is finite. **Completeness is not restricted to finite Γ**, and that generality is exactly what makes compactness interesting. An infinite Γ could use **every** constant of PL, leaving none fresh.

**The fix.** Double the subscript of every constant in Γ ∪ {∼P}: a₁ becomes a₂, a₃ becomes a₆, and so on. The resulting set $\\Gamma_e$:
- is consistent iff the original is (halving the subscripts converts derivations back and forth);
- is q-consistent iff the original is (relabel the interpretation in the same way);
- uses **no odd-subscripted constant at all**.

So infinitely many constants are guaranteed fresh at the start. Each step of the construction adds only finitely many sentences, so at every stage only finitely many odd constants have been used, and a fresh one is always available.`,
    pitfall:
      "Don't import a finiteness assumption into a completeness proof. If the proof works only for finite Γ, you lose compactness and Löwenheim–Skolem, which are the theorems the infinite case was needed for.",
    related: ["mit24241-pd-completeness-roadmap", "mit24241-pd-henkin-construction"],
  },
  {
    id: "mit24241-pd-henkin-construction",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Describe the construction of a maximally consistent, existentially complete set Γ* from a consistent ES set, and prove that adding the witness Q(a/x) preserves consistency.",
    back: `**Construction** (Sessions 23–24). Enumerate all PL sentences $P_1, P_2, \\ldots$. Start with $\\Gamma_1 = \\Gamma_e$. Then:
1. If $\\Gamma_i \\cup \\{P_i\\}$ is **inconsistent**: $\\Gamma_{i+1} = \\Gamma_i$.
2. If it is **consistent** and $P_i$ is **not** of the form (∃x)Q: $\\Gamma_{i+1} = \\Gamma_i \\cup \\{P_i\\}$.
3. If it is **consistent** and $P_i = (\\exists x)Q$: $\\Gamma_{i+1} = \\Gamma_i \\cup \\{P_i, Q(a/x)\\}$, where a is the alphabetically earliest constant in neither $P_i$ nor $\\Gamma_i$ (an odd-subscripted one is always available).

$\\Gamma^* = \\bigcup_i \\Gamma_i$.

**Clause 3 keeps consistency.** Suppose $\\Gamma_k \\cup \\{(\\exists x)Q\\}$ is consistent but $\\Gamma_k \\cup \\{(\\exists x)Q, Q(a/x)\\}$ is not. Then from $\\Gamma_k \\cup \\{(\\exists x)Q\\}$, open a subderivation with assumption Q(a/x) and derive a contradiction, and hence **any** sentence, in particular ∼(∃x)Q. Now ∃E applies: a is fresh, so it is not in (∃x)Q, not in ∼(∃x)Q, and not in any assumption. That puts ∼(∃x)Q on the main line next to (∃x)Q, so $\\Gamma_k \\cup \\{(\\exists x)Q\\}$ is inconsistent. Contradiction.

**Then, as for SD:**
- **Consistent**: each $\\Gamma_n$ is consistent (induction over the three clauses), and a derivation is finite, so any contradiction would already lie in some $\\Gamma_n$.
- **Maximal**: if $\\Gamma^* \\cup \\{P_k\\}$ were consistent, so would $\\Gamma_k \\cup \\{P_k\\}$ be, and then $P_k$ would have been added.
- **∃-complete**: if $(\\exists x)Q = P_k \\in \\Gamma^*$, then $\\Gamma_k \\cup \\{P_k\\}$ is consistent (it's a subset of Γ*), so clause 3 added a witness Q(a/x) at stage k. ∎`,
    related: ["mit24241-pd-even-subscripts", "mit24241-slmeta-maximal-consistent-construction", "mit24241-pd-canonical-model-truth-lemma"],
  },

  // --- Lecture 24: Completeness continued ---
  {
    id: "mit24241-pd-canonical-model-truth-lemma",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define the canonical interpretation I* for a maximally consistent, existentially complete Γ*, and prove that P is true on I* iff P ∈ Γ*, including the ∀ case.",
    back: `**Membership facts** (Session 24), proved from maximal consistency as in SL:
- Γ* ⊢ Q iff Q ∈ Γ*;
- P ∈ Γ* iff ∼P ∉ Γ*;
- the &, ∨, ⊃, ≡ clauses are as for SD.

The new facts are about quantifiers:
- **(∃x)P ∈ Γ* iff P(a/x) ∈ Γ* for some constant a.** Left to right is ∃-completeness. Right to left: {P(a/x)} ⊢ (∃x)P, and Γ* is deductively closed.
- **(∀x)P ∈ Γ* iff P(a/x) ∈ Γ* for every constant a.** Left to right is ∀E plus closure. Right to left: if (∀x)P ∉ Γ*, then ∼(∀x)P ∈ Γ*, which gives (∃x)∼P ∈ Γ*. By ∃-completeness, some ∼P(a/x) ∈ Γ*, so P(a/x) ∉ Γ*.

**The canonical interpretation I*:**
- UD = the positive integers;
- each constant denotes its own position in the alphabetical enumeration of constants (a ↦ 1, b ↦ 2, …);
- I*(sentence letter) = T iff it is in Γ*;
- I*(A) = the set of ⟨I*(a₁), …, I*(aₙ)⟩ such that $Aa_1 \\ldots a_n \\in \\Gamma^*$.

**Truth lemma**, by induction on the number of logical operators: P is true on I* iff P ∈ Γ*.
- **Basis**: the atomic case holds by the definition of I*.
- **Connective cases**: as for SL.
- **∀ case**, for (∀x)Q. **Every object of the UD is named by some constant**, so (∀x)Q is true on I* iff Q(a/x) is true for every constant a. Each Q(a/x) has fewer operators than (∀x)Q, so by the hypothesis this holds iff Q(a/x) ∈ Γ* for every a. By the membership fact, that holds iff (∀x)Q ∈ Γ*.
- **∃ case**: similar.

So I* makes all of Γ* true, and Γ* is q-consistent (TLB 11.4.8). ∎`,
    pitfall:
      "The ∀ case uses the fact that I* names every object. In an arbitrary interpretation, 'every substitution instance is true' does not imply '(∀x)Q is true', because some objects may be unnamed. That is why the general semantics uses variable assignments, not substitution.",
    related: ["mit24241-pd-henkin-construction", "mit24241-slmeta-truth-lemma", "mit24241-pl-formal-semantics", "mit24241-pd-lowenheim-skolem-compactness"],
  },
  {
    id: "mit24241-pd-lowenheim-skolem-compactness",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove the Löwenheim–Skolem theorem from the completeness proof: if a set Γ of PL sentences is q-consistent, it is true on an interpretation whose UD is the positive integers. Also state compactness for PL.",
    back: `**Löwenheim–Skolem** (final exam, Question 31).
1. Γ is q-consistent. By **soundness**, Γ is consistent in PD. (If Γ derived Q and ∼Q, then by soundness Γ would entail both, and no interpretation could make Γ true.)
2. So the ES variant $\\Gamma_e$ is consistent in PD, and the Henkin construction extends it to an MC-∃C set Γ*.
3. The canonical interpretation I* makes every member of Γ* true, so in particular every member of $\\Gamma_e$. **Its UD is the positive integers.**
4. Relabel: define I by $I(a_n) = I^*(a_{2n})$, with the same UD and the same predicate extensions. I says about each constant in Γ exactly what I* says about its doubled counterpart, so I makes all of Γ true. Its UD is still the positive integers. ∎

**Surprising consequence**: every q-consistent set of PL sentences has a model of countable size. Even a set of sentences intended to describe an uncountable collection (such as the real numbers) has a countable model.

**Compactness for PL**: Γ is q-consistent iff every finite subset is. The proof is word for word the SL proof with PD in place of SD. If Γ is q-inconsistent, then Γ ⊨ R & ∼R, so by completeness Γ ⊢ R & ∼R. A derivation uses finitely many premises Γ′. By soundness Γ′ ⊨ R & ∼R, so Γ′ is q-inconsistent.

These theorems show limits of what first-order sentences can pin down. No set of PL sentences can force its UD to be uncountable. And by compactness, no set can say "the UD is finite": a set with arbitrarily large finite models also has an infinite one.`,
    related: ["mit24241-pd-canonical-model-truth-lemma", "mit24241-slmeta-compactness", "mit24241-pd-even-subscripts"],
  },
];
