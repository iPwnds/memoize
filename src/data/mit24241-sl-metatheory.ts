// MIT 24.241 Logic I (Fall 2009, Ephraim Glick; TA Damien Rochford) — Part 3:
// Metatheory of Sentential Logic (Lectures 9-11 and 13): proof by
// mathematical induction on sentences, truth-functional completeness
// (characteristic sentences / DNF, the Sheffer stroke, neither-nor), and the
// soundness, completeness and compactness of SD. Sourced from the course's
// OCW lecture slides for Sessions 9, 10, 11 and 13, read page by page, plus
// the TA's answer sheets for Problem Sets 4-6, Quiz 4 and the final exam
// (Questions 15-21). Every truth-function example and connective translation
// was checked by brute force over all TVAs.
// Corrections / additions:
//  - Session 11 writes the Sheffer-stroke translation of (A&B) ∨ (∼A&B)
//    without enough parentheses to parse ("((A|B)|(A|B) | (A|B)|(A|B)) | …");
//    the card gives it fully parenthesised (and verified by truth table),
//    and also notes that the whole sentence is equivalent to just B.
//  - The SL Lindenbaum construction (extend a consistent set to a maximally
//    consistent one by running through an enumeration of SL) is only named
//    in Sessions 11/13 (TLB 6.4.5). The card states the construction the
//    way the Session 23-24 slides do it for PD, minus the quantifier clause.
//  - The membership facts for maximally consistent sets (TLB 6.4.9-6.4.11)
//    are proved on the Session 24 slides and in Problem Set 6's answers; the
//    ⊃ and ≡ clauses are stated without proof there and here.
//  - The final exam asks which sets of connectives are TF-complete with no
//    posted answer; the argument that {&, ∨, ⊃, ≡} is not complete is this
//    module's, built from the Session 9 induction example.
//  - The comparison of "complete proof system" with "complete theory"
//    (Gödel's 1929 completeness vs. 1931 incompleteness) is context added
//    beyond the source, to link to the 6.1200J card.
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit24241-slmeta";

export const mit24241SlMetatheoryCards: Card[] = [
  // --- Lecture 9: Introduction to meta-theory; mathematical induction ---
  {
    id: "mit24241-slmeta-semantic-vs-syntactic",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast Γ ⊨ P with Γ ⊢ P. Define soundness and completeness of SD, and state what they give you when combined.",
    back: `| | $\\Gamma \\vDash P$ (entailment) | $\\Gamma \\vdash P$ (derivability) |
|---|---|---|
| Kind | **semantic** | **syntactic** |
| Defined by | truth-value assignments: no TVA makes all of Γ true and P false | derivations: some SD derivation has primary assumptions in Γ and P on the main scope line |
| Shown true by | a full truth table | one derivation |
| Shown false by | one TVA | (hard: you'd need to rule out every derivation) |

The symbol ⊢ "looks like a piece of a derivation" (Session 9).

- **Soundness**: if $\\Gamma \\vdash P$ then $\\Gamma \\vDash P$. Derivations never lead from true premises to a false conclusion.
- **Completeness**: if $\\Gamma \\vDash P$ then $\\Gamma \\vdash P$. Every entailment has a derivation.

Together, "Γ ⊢ P iff Γ ⊨ P". The answer sheet for Problem Set 4 calls this **S&C** and uses it to transfer every notion between the two sides:
- an argument is valid in SD iff it is TF-valid;
- P is a theorem of SD iff P is TF-true;
- P and Q are equivalent in SD iff they are TF-equivalent.

Each of these follows by chaining definitions with S&C.

These are **metatheorems**: claims *about* SL and SD, proved in the metalanguage (English plus mathematics), mostly by mathematical induction.`,
    pitfall:
      "Soundness and completeness are properties of a proof system relative to a semantics, not of individual arguments. 'This argument is sound' (valid with true premises) and 'SD is sound' are unrelated uses of the word.",
    related: ["mit24241-slmeta-soundness-strategy", "mit24241-slmeta-completeness-roadmap", "mit24241-sl-tf-entailment-validity", "mit24241-sd-derivation-structure"],
  },
  {
    id: "mit24241-slmeta-induction-on-sentences",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove by induction: no sentence of SL that contains only binary connectives (no ∼) is truth-functionally false. Why is it easier to prove something stronger?",
    back: `**Session 9's five-step strategy for proof by mathematical induction (MI):**
1. Insert the definitions into the claim.
2. Arrange the objects in a sequence. For sentences, order them by the number of connectives.
3. State the basis clause and the inductive step.
4. Prove the basis clause.
5. Prove the inductive step: assume the claim for every sentence with n or fewer connectives, and derive it for sentences with n + 1.

**Insert definitions.** "Not TF-false" means "true on *some* TVA". The obvious induction ("each such sentence is true on some TVA") breaks down. P and Q might each be true on *different* TVAs, and then nothing follows about P & Q.

**Strengthen.** Fix one TVA, $V_T$, which makes **every** atomic sentence true. Prove that every ∼-free sentence is true on $V_T$.
- **Basis**: a sentence with zero binary connectives and no ∼ is atomic, and so it is true on $V_T$.
- **Inductive step**: assume every ∼-free sentence with at most n binary connectives is true on $V_T$. A ∼-free sentence R with n + 1 connectives has the form (P & Q), (P ∨ Q), (P ⊃ Q) or (P ≡ Q), where P and Q have at most n connectives. By the hypothesis, P and Q are both true on $V_T$. Each binary connective gives T when both inputs are T (look at the T,T row of each table), so R is true on $V_T$.

So every ∼-free sentence is true on $V_T$, and so none is TF-false. ∎

The stronger claim gave an inductive hypothesis that was strong enough to carry the step. The same move is needed in the soundness proof.`,
    pitfall:
      "A strong induction (assume the claim for all sentences with n or fewer connectives) is needed. Subsentences of a sentence with n + 1 connectives can have any number of connectives up to n, not exactly n.",
    related: ["mit24241-sl-syntax", "mit24241-slmeta-replacement-of-equivalents", "mit24241-slmeta-sheffer-and-incomplete-sets", "mit6120-proofs-strengthening-ih-trominoes"],
  },
  {
    id: "mit24241-slmeta-replacement-of-equivalents",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove by induction: if Q and Q₁ are truth-functionally equivalent, replacing occurrences of the component Q in P by Q₁ yields a sentence equivalent to P.",
    back: `Write [P](Q₁//Q) for the result of replacing at least one occurrence of the sentential component Q of P by Q₁. This is TLB 6.1E 1e, proved on Problem Set 4's answer sheet. The induction is on the number of connectives in P.

**Basis** (P atomic). The only component of P is P itself, so [P](Q₁//P) is Q₁. That is equivalent to P by assumption.

**Inductive step.** Assume the claim for every sentence with at most n connectives, and let P have n + 1.

*Case P = ∼R.* Either Q is P itself (handled as in the basis) or Q is a component of R. In the second case, the hypothesis says R and [R](Q₁//Q) agree on every TVA. So their negations agree too, and ∼[R](Q₁//Q) is exactly [∼R](Q₁//Q).

*Case P = R · S* for a binary connective ·. Either Q is P itself, or Q occurs in R and/or S. By the hypothesis, R agrees with its replaced version and S agrees with its replaced version on every TVA. A truth-functional connective sees only the truth values of its inputs, so R · S agrees with the replaced R · S. ∎

**Why it matters**: it justifies rewriting a subformula with an equivalent one *inside* a larger sentence. It is the semantic basis for SD+'s replacement rules, and for the equivalence-algebra method of reaching normal forms.

**The proof uses truth-functionality exactly once.** That use is in the inductive step: the compound's value depends only on the values of its parts.`,
    related: ["mit24241-slmeta-induction-on-sentences", "mit24241-sl-truth-functionality"],
  },

  // --- Lecture 10: Soundness of SD/SD+ (and truth-functional completeness) ---
  {
    id: "mit24241-slmeta-tf-completeness-dnf",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What does it mean for SL to be truth-functionally complete? Find a sentence expressing the 3-place truth-function that is T exactly on rows TFT, FTT and FFT.",
    back: `**Definitions** (Session 10):
- A **truth-function** maps each n-tuple of truth values to a truth value: $\\{T, F\\}^n \\to \\{T, F\\}$.
- A sentence P **expresses** f iff P's truth table is the table of f.
- A set of connectives is **TF-complete** iff every truth-function can be expressed using only those connectives.

**Algorithm (characteristic sentences):**
1. For each row, conjoin the letters: take A if the row has T for A, and ∼A if it has F; do the same for B, C, and so on. This conjunction is the row's **characteristic sentence (CS)**: it is true on exactly that row.
2. If the function has no T rows, output a contradiction such as A & ∼A.
3. Otherwise, output the disjunction of the CSs of the T rows.

**Example.** The T rows are 3 (T F T), 5 (F T T) and 7 (F F T):

| A | B | C | f | CS |
|---|---|---|---|---|
| T | T | T | F | (A&B)&C |
| T | T | F | F | (A&B)&∼C |
| T | F | T | **T** | **(A&∼B)&C** |
| T | F | F | F | (A&∼B)&∼C |
| F | T | T | **T** | **(∼A&B)&C** |
| F | T | F | F | (∼A&B)&∼C |
| F | F | T | **T** | **(∼A&∼B)&C** |
| F | F | F | F | (∼A&∼B)&∼C |

The answer is (((A&∼B)&C) ∨ ((∼A&B)&C)) ∨ ((∼A&∼B)&C). Brute force confirms it has exactly this table. It simplifies to C & ∼(A & B), but the algorithm doesn't need simplicity.

The output uses only ∼, & and ∨, so **{∼, &, ∨} is already TF-complete**. The output is in **disjunctive normal form**. Problem Set 5 shows by induction that each CS is true on exactly its own row, which completes the proof.

**Why care**: if some truth-function were not expressible, truth tables and derivations couldn't handle English arguments that use the corresponding connective.`,
    related: ["mit24241-slmeta-sheffer-and-incomplete-sets", "mit24241-sl-truth-functionality", "mit6004-logic-sum-of-products"],
  },
  {
    id: "mit24241-slmeta-soundness-strategy",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Outline the proof that SD is sound (Γ ⊢ P implies Γ ⊨ P). Why does the naive induction on derivation length fail, and what claim is proved instead?",
    back: `**Goal**: if some SD derivation has primary assumptions in Γ and P on the main scope line, then Γ ⊨ P.

**Naive attempt** (Session 10). Induct on derivation length: "for every n-line derivation whose last line is in the scope of only primary assumptions in Γ*, Γ* ⊨ the last line". This **fails**. In an (n+1)-line derivation, line n may lie inside a subderivation, in the scope of *auxiliary* assumptions. Then the hypothesis says nothing about it, and so it can't tell you the earlier lines were safe.

**Strengthened claim.** For **every line** i of **any** derivation, let $\\Gamma_i$ be the set of **all open assumptions** (primary *and* auxiliary) with scope over line i, and $P_i$ the sentence on line i. Then:
$$(\\ast)\\qquad \\Gamma_i \\vDash P_i.$$

**Induction on line number:**
- **Basis**: line 1 is an assumption, so $\\Gamma_1 = \\{P_1\\}$, and trivially $\\{P_1\\} \\vDash P_1$.
- **Inductive step**: assume $(\\ast)$ for all lines $i \\le n$. Line n + 1 is either an assumption, which is trivial, or is justified by one of SD's rules from earlier lines. Prove $(\\ast)$ for line n + 1 **separately for each rule** (one case per rule).

**Conclusion.** When P is on the main scope line, its open assumptions are exactly the primary ones, which are in Γ. So $\\Gamma_P \\vDash P$, and by monotonicity Γ ⊨ P. ∎

This is the Session 9 lesson again: strengthen the claim so the inductive hypothesis is strong enough. The same proof extended with quantifier cases gives soundness of PD.`,
    pitfall:
      "Γᵢ is the set of open assumptions at line i, not the set of all assumptions made so far. When a subderivation closes, its assumption drops out, and the rule that closes it (⊃I, ∼I, ∼E, ∨E, ≡I) is exactly what makes that legitimate.",
    related: ["mit24241-slmeta-soundness-cases", "mit24241-slmeta-semantic-vs-syntactic", "mit24241-slmeta-induction-on-sentences"],
  },
  {
    id: "mit24241-slmeta-soundness-cases",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "In the soundness proof for SD, prove the inductive-step cases for &E, ⊃I and ∼I.",
    back: `**Lemma (monotonicity, TLB 11.3.2):** if $\\Gamma \\vDash P$ and $\\Gamma \\subseteq \\Gamma'$, then $\\Gamma' \\vDash P$. Any TVA making all of Γ′ true makes all of Γ true, and so makes P true.

Assume $(\\ast)$, i.e. $\\Gamma_i \\vDash P_i$, holds for every line $i \\le n$.

**&E.** $P_{n+1}$ comes from a conjunction $P_{n+1} \\,\\&\\, R$ on line j. By the hypothesis, $\\Gamma_j \\vDash P_{n+1} \\,\\&\\, R$, so $\\Gamma_j \\vDash P_{n+1}$. Line j must be accessible from line n + 1, so every assumption open at j is still open at n + 1: $\\Gamma_j \\subseteq \\Gamma_{n+1}$. By monotonicity, $\\Gamma_{n+1} \\vDash P_{n+1}$.

**⊃I.** $P_{n+1} = Q \\supset R$, from a subderivation that starts with assumption Q on line i and has R on line k. By the hypothesis, $\\Gamma_k \\vDash R$. The only assumption closed between k and n + 1 is Q, so $\\Gamma_k \\subseteq \\Gamma_{n+1} \\cup \\{Q\\}$, and by monotonicity $\\Gamma_{n+1} \\cup \\{Q\\} \\vDash R$. The metatheorem "Γ ∪ {Q} ⊨ R iff Γ ⊨ Q ⊃ R" then gives $\\Gamma_{n+1} \\vDash Q \\supset R$.

**∼I.** $P_{n+1} = \\sim Q$, from a subderivation with assumption Q on line h that contains R on line j and ∼R on line k. By the hypothesis, $\\Gamma_j \\vDash R$ and $\\Gamma_k \\vDash \\sim R$. Both sets are subsets of $\\Gamma_{n+1} \\cup \\{Q\\}$, so that set entails both R and ∼R. That means no TVA makes $\\Gamma_{n+1} \\cup \\{Q\\}$ true. So every TVA making $\\Gamma_{n+1}$ true makes Q false, i.e. $\\Gamma_{n+1} \\vDash \\sim Q$.

The remaining rules (R, &I, ∨I, ∨E, ⊃E, ∼E, ≡I, ≡E) go the same way: identify the form of the earlier lines, apply the hypothesis to them, relate their assumption sets to $\\Gamma_{n+1}$, and finish with a semantic fact about the connective. Problem Set 5 adds one case in the same way for an extra SD* rule.`,
    related: ["mit24241-slmeta-soundness-strategy", "mit24241-sl-entailment-metatheorems", "mit24241-sd-rules"],
  },

  // --- Lecture 11: Completeness of SD/SD+ ---
  {
    id: "mit24241-slmeta-sheffer-and-incomplete-sets",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Show that {|} (NAND, the Sheffer stroke) and {↓} (neither-nor) are each TF-complete, and that {&, ∨, ⊃, ≡} is not.",
    back: `P | Q is false only when both are true; P ↓ Q is true only when both are false.

**{|} is complete** (Session 11). {∼, &, ∨} is complete, so it suffices to rewrite each of those connectives with |:
$$\\sim P \\equiv P \\mid P, \\qquad P \\,\\&\\, Q \\equiv (P \\mid Q) \\mid (P \\mid Q), \\qquad P \\lor Q \\equiv (P \\mid P) \\mid (Q \\mid Q).$$
Applied to (A&B) ∨ (∼A&B), the rewriting gives, fully parenthesised:
$$\\big(((A|B)|(A|B))\\,|\\,((A|B)|(A|B))\\big)\\;\\big|\\;\\big((((A|A)|B)|((A|A)|B))\\,|\\,(((A|A)|B)|((A|A)|B))\\big)$$
A brute-force truth table confirms this has the same table as (A&B) ∨ (∼A&B), which is in fact just B. A full proof is an **induction on sentences** showing that the rewriting preserves truth value at every step.

**{↓} is complete** (Problem Set 5, the answer sheet's induction over the {∼, &, ∨}-language): ∼R ⇝ T↓T, R & S ⇝ (T↓T)↓(U↓U), and R ∨ S ⇝ (T↓U)↓(T↓U), where T and U are ↓-translations of R and S. So the minimum size of a TF-complete set is **one** connective (final exam, Question 16).

**{&, ∨, ⊃, ≡} is not complete.** By the Session 9 induction, every sentence built from these connectives alone is true on the TVA that makes all atomic sentences true. The truth-function of ∼A is F on that row, so no such sentence expresses it.`,
    pitfall:
      "Being TF-complete is about which truth-functions can be expressed, not about how short the result is. The |-translations grow exponentially, and that doesn't affect completeness.",
    related: ["mit24241-slmeta-tf-completeness-dnf", "mit24241-slmeta-induction-on-sentences"],
  },
  {
    id: "mit24241-slmeta-completeness-roadmap",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Give the roadmap of the completeness proof for SD (Γ ⊨ P implies Γ ⊢ P), and prove its two easy links.",
    back: `**Prove the contrapositive**: if $\\Gamma \\nvdash P$ then $\\Gamma \\nvDash P$. The key notion:

> Γ is **maximally consistent in SD (MC-SD)** iff Γ is consistent in SD, and adding any sentence not already in Γ makes it inconsistent.

**Chain** (Sessions 11 and 13):
1. $\\Gamma \\nvdash P$ implies that Γ ∪ {∼P} is consistent in SD.
2. Every set that is consistent in SD is a subset of some MC-SD set Γ* (**Lindenbaum**, TLB 6.4.5).
3. Every MC-SD set is TF-consistent (TLB 6.4.8).
4. So Γ ∪ {∼P}, being a subset of a TF-consistent set, is TF-consistent.
5. So $\\Gamma \\nvDash P$.

**Link 1.** Suppose Γ ∪ {∼P} were inconsistent: some Q and ∼Q are derivable from it. Then from Γ alone, open a subderivation with assumption ∼P, derive Q and ∼Q inside it, and close with ∼E to get P on the main scope line. So Γ ⊢ P. Contraposing: if Γ ⊬ P, then Γ ∪ {∼P} is consistent.

**Link 5.** If Γ ∪ {∼P} is TF-consistent, some TVA makes all of Γ true and ∼P true, i.e. makes all of Γ true and P false. That is exactly a witness to $\\Gamma \\nvDash P$.

**Link 4** is monotonicity in reverse: a TVA making a superset true makes every subset true.

The real work is in links 2 and 3, the construction of Γ* and the proof that a TVA satisfies all of it.`,
    related: ["mit24241-slmeta-maximal-consistent-construction", "mit24241-slmeta-truth-lemma", "mit24241-slmeta-semantic-vs-syntactic"],
  },
  {
    id: "mit24241-slmeta-maximal-consistent-construction",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Show that every set Γ that is consistent in SD can be extended to a maximally consistent set Γ* (Lindenbaum's lemma).",
    back: `**Enumerate SL.** Every SL sentence is a finite string over a countable vocabulary, so the sentences can be listed $P_1, P_2, P_3, \\ldots$, with every sentence appearing at some finite position.

**Build a chain**: $\\Gamma_1 = \\Gamma$ and
$$\\Gamma_{i+1} = \\begin{cases} \\Gamma_i \\cup \\{P_i\\} & \\text{if that set is consistent in SD,} \\\\ \\Gamma_i & \\text{otherwise.} \\end{cases}$$
Let $\\Gamma^* = \\bigcup_i \\Gamma_i$.

**Each $\\Gamma_i$ is consistent**, by induction. $\\Gamma_1 = \\Gamma$ is consistent by hypothesis, and each step either keeps the set unchanged or adds $P_i$ only when the result is consistent.

**Γ* is consistent.** A derivation of Q and ∼Q from Γ* would be finite, so it would use only finitely many members of Γ*. Each of these is in some $\\Gamma_i$, and the chain is increasing, so all of them are in a single $\\Gamma_n$. Then $\\Gamma_n$ would be inconsistent, contradicting the previous step.

**Γ* is maximal.** Suppose $P_k \\notin \\Gamma^*$ but $\\Gamma^* \\cup \\{P_k\\}$ is consistent. Since $\\Gamma_k \\subseteq \\Gamma^*$, the set $\\Gamma_k \\cup \\{P_k\\}$ is also consistent (an inconsistency in the smaller set would be an inconsistency in the larger). So the construction put $P_k$ into $\\Gamma_{k+1} \\subseteq \\Gamma^*$, a contradiction. ∎

Two facts carry the proof: **derivations are finite**, and **the sentences can be enumerated**. The PD version (Session 23) adds a third clause that puts witnesses for existential sentences into the set.`,
    pitfall:
      "'Consistent' here means consistent in SD, a syntactic notion. The point of the whole completeness proof is to show that this coincides with TF-consistency. Assuming that at this stage would be circular.",
    related: ["mit24241-slmeta-completeness-roadmap", "mit24241-slmeta-truth-lemma", "mit24241-slmeta-compactness"],
  },
  {
    id: "mit24241-slmeta-truth-lemma",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "For a maximally consistent set Γ*, prove Γ* ⊢ Q iff Q ∈ Γ*, P ∉ Γ* iff ∼P ∈ Γ*, and P ∨ Q ∈ Γ* iff P ∈ Γ* or Q ∈ Γ*. Then show Γ* is TF-consistent.",
    back: `**(a) Deductive closure: Γ* ⊢ Q iff Q ∈ Γ*.** If Q ∈ Γ*, then Γ* ⊢ Q trivially. Conversely, suppose Γ* ⊢ Q but Q ∉ Γ*. By maximality, Γ* ∪ {Q} is inconsistent, so ∼I gives Γ* ⊢ ∼Q. Then Γ* derives both Q and ∼Q, contradicting its consistency.

**(b) Negation-completeness: exactly one of P, ∼P is in Γ*.** Both can't be in, since Γ* is consistent. If P ∉ Γ*, then Γ* ∪ {P} is inconsistent, so by ∼I, Γ* ⊢ ∼P, and by (a), ∼P ∈ Γ*.

**(c) ∨ clause** (Problem Set 6). If neither P nor Q is in Γ*, then by (b) both ∼P and ∼Q are. Since {∼P, ∼Q} ⊢ ∼(P ∨ Q), (a) gives ∼(P ∨ Q) ∈ Γ*, so P ∨ Q ∉ Γ*. Conversely, if P ∨ Q ∉ Γ* then ∼(P ∨ Q) ∈ Γ*. From it, ∼P and ∼Q are derivable, so both are in Γ*, and neither P nor Q is. In the same way: P & Q ∈ Γ* iff both are; P ⊃ Q ∈ Γ* iff P ∉ Γ* or Q ∈ Γ*; P ≡ Q ∈ Γ* iff both or neither of P, Q are.

**(d) Truth lemma.** Define the TVA $A^*$ by: an atomic sentence is true iff it is in Γ*. Then **for every sentence P, P is true on $A^*$ iff P ∈ Γ***. The proof is by induction on connectives. The basis is the definition of $A^*$. Each inductive case matches the connective's truth table against its clause in (b) and (c). The ∨ case: Q ∨ R is true iff Q or R is true, iff (by the inductive hypothesis) Q ∈ Γ* or R ∈ Γ*, iff (by (c)) Q ∨ R ∈ Γ*.

So $A^*$ makes every member of Γ* true, and Γ* is TF-consistent (TLB 6.4.8). ∎`,
    pitfall:
      "Clauses (a)-(c) each use particular SD rules (∼I, ∨I, &E, …). Problem Set 6 shows that dropping &E from SD breaks the &-clause: a maximally consistent set could contain A & B together with ∼A. Completeness depends on having enough rules.",
    related: ["mit24241-slmeta-maximal-consistent-construction", "mit24241-slmeta-completeness-roadmap", "mit24241-sd-disjunction-elimination"],
  },

  // --- Lecture 13: Completeness summary; compactness; limitations of SL ---
  {
    id: "mit24241-slmeta-compactness",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State and prove the compactness theorem for SL: Γ is TF-consistent iff every finite subset of Γ is TF-consistent.",
    back: `**Left to right** (trivial). A TVA that makes every member of Γ true makes every member of any subset of Γ true.

**Right to left**, contrapositive: if Γ is TF-inconsistent, some finite subset is TF-inconsistent (Session 13).
1. Γ is TF-inconsistent, so no TVA makes all of Γ true. Vacuously, every TVA making all of Γ true makes R & ∼R true: $\\Gamma \\vDash R \\,\\&\\, \\sim R$.
2. By **completeness**, $\\Gamma \\vdash R \\,\\&\\, \\sim R$.
3. A derivation is **finite**, so it uses only a finite subset $\\Gamma' \\subseteq \\Gamma$ of primary assumptions: $\\Gamma' \\vdash R \\,\\&\\, \\sim R$.
4. By **soundness**, $\\Gamma' \\vDash R \\,\\&\\, \\sim R$.
5. No TVA makes R & ∼R true, so no TVA makes all of Γ′ true. Γ′ is a finite, TF-inconsistent subset. ∎

**Intuition**: no truth-functional inconsistency needs infinitely many sentences to produce it.

**Why it's surprising**: the definition of TF-consistency for infinite Γ talks about a single TVA handling infinitely many sentences at once, and nothing in that definition is finite. Finiteness comes in from the proof side, through derivations. That is why the result counts as "a cool result of completeness".

Note that completeness is needed for **infinite** Γ here. The course's completeness proof never assumes Γ is finite, and the Lindenbaum construction works for any Γ.`,
    related: ["mit24241-slmeta-maximal-consistent-construction", "mit24241-slmeta-completeness-roadmap", "mit24241-slmeta-two-completeness-notions"],
  },
  {
    id: "mit24241-slmeta-two-completeness-notions",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "'Complete' means two different things in logic. Contrast completeness of a proof system (SD, PD) with completeness of an axiom set, and explain why Gödel's completeness and incompleteness theorems don't conflict.",
    back: `| | Completeness of a **proof system** | Completeness of an **axiom set / theory** |
|---|---|---|
| Claim | every **entailment** is derivable: Γ ⊨ P implies Γ ⊢ P | every sentence or its negation is **provable**: for every P, T ⊢ P or T ⊢ ∼P |
| About | the rules, relative to a semantics | a particular set of premises (axioms) |
| SL / SD | SD is complete (this module) | — |
| First-order logic | PD is complete (**Gödel 1929**; proved in this course for PD) | arithmetic is **not** (**Gödel 1931**, incompleteness) |
| Compare | in an MC set, "P ∈ Γ* or ∼P ∈ Γ*" | the same "P or ∼P" condition, required of a theory's theorems |

**Why there's no conflict.** Incompleteness gives a sentence G such that the axioms T entail neither G nor ∼G: some models of T make G true and others make it false. A complete proof system derives everything T **entails**. G is not entailed, so failing to derive it is no defect in the rules.

The maximally consistent sets in this module's proof *are* negation-complete. Every consistent set extends to one, but for arithmetic the extension cannot be effectively listed. That is the escape route the incompleteness theorem's hypotheses close off.`,
    pitfall:
      "Completeness (⊨ ⇒ ⊢) is the converse of soundness (⊢ ⇒ ⊨). It isn't the 'every truth is provable' slogan that incompleteness refutes. Arithmetic truths that are unprovable from the axioms are not entailed by the axioms.",
    related: ["mit24241-slmeta-semantic-vs-syntactic", "mit24241-slmeta-compactness", "mit6120-proofs-axioms-consistency-completeness"],
  },
];
