// MIT 6.042J Mathematics for Computer Science (Spring 2015, Albert R. Meyer &
// Adam Chlipala) — Logical Formulas (Sessions 4-5). Sourced from the course's
// OCW-hosted textbook chapters, "Mathematics for Computer Science" (Lehman,
// Leighton & Meyer, 2015 edition): Chapter 3.1-3.5 (Session 4: propositional
// formulas, validity and satisfiability, normal forms, the equivalence
// axioms and their completeness, SAT) and Chapter 3.6 (Session 5: predicate
// formulas, quantifier order and negation, validity for predicate
// formulas), read page by page from the PDFs (pdftotext drops the overbars
// used for negation, so the normal-form pages were read as rendered images).
// This 6.042J track exists alongside the 6.1200J track because two things
// in the KU Leuven "Logica voor informatici" / "Bewijzen en redeneren"
// syllabus are not covered by 6.1200J's or 24.241's OCW materials: CNF/DNF
// with the algebraic equivalence axioms, and infinite cardinality (next
// module). Material already carded for 6.1200J (connectives, implication and
// contrapositive, quantifier basics) is linked rather than repeated. Every
// truth table, normal form and the SAT example's satisfying assignments
// were brute-forced over all assignments.
// Corrections / additions:
//  - The text leaves the SAT example's satisfiability open as a question;
//    the card answers it (satisfiable; exactly the three assignments with
//    exactly one of P, Q, R true).
//  - The card on reading "any" in English adds the observation that the
//    existential reading (∃x. Solves(x)) IMPLIES G is equivalent to
//    ∀x. (Solves(x) IMPLIES G), linking to 24.241's quantifier-movement card.
// See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6042-logic";

export const mit6042LogicalFormulasCards: Card[] = [
  // --- Session 4: Chapter 3.1-3.5 ---
  {
    id: "mit6042-logic-validity-satisfiability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define valid and satisfiable propositional formulas. How are validity, satisfiability and equivalence related to each other?",
    back: `- A formula is **valid** if it is true for **every** assignment of truth values to its variables. Examples: P OR NOT(P), and [(P IMPLIES Q) AND (Q IMPLIES R)] IMPLIES (P IMPLIES R), which is transitivity of implication.
- A formula is **satisfiable** if **some** assignment makes it true.

**The links (MCS §3.3.2):**
- **P is satisfiable iff NOT(P) is not valid.** Some assignment makes P true iff not every assignment makes NOT(P) true. Equivalently, P is valid iff NOT(P) is unsatisfiable, so a validity checker and a SAT solver can each do the other's job.
- **F and G are equivalent iff (F IFF G) is valid.** Example: A OR B is equivalent to A OR (NOT(A) AND B), so (A OR B) IFF (A OR (NOT(A) AND B)) is valid.
- A formula is valid iff it is equivalent to **T**.

**Practical meaning**: a set of system specifications can all be met only if the AND of the specs is **satisfiable**. A simplification of a program's condition is safe only if old IFF new is **valid**.

Notation: MCS writes NOT(P) as $\\overline{P}$ or $\\neg P$, AND as $\\wedge$, OR as $\\vee$, IMPLIES as $\\rightarrow$, IFF as $\\leftrightarrow$. In 24.241's notation these are TF-true, TF-consistent and TF-equivalent.`,
    related: ["mit6042-logic-sat-problem", "mit6120-proofs-implication-truth-table", "mit24241-sl-tf-properties"],
  },
  {
    id: "mit6042-logic-dnf-cnf-from-truth-table",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Read off a disjunctive normal form and a conjunctive normal form for A AND (B OR C) from its truth table.",
    back: `| A | B | C | A AND (B OR C) |
|---|---|---|---|
| T | T | T | **T** |
| T | T | F | **T** |
| T | F | T | **T** |
| T | F | F | F |
| F | T | T | F |
| F | T | F | F |
| F | F | T | F |
| F | F | F | F |

**DNF: one AND-term per T row.** Each AND-term is true on exactly its own row:
$$(A \\wedge B \\wedge C) \\vee (A \\wedge B \\wedge \\overline{C}) \\vee (A \\wedge \\overline{B} \\wedge C).$$

**CNF: one OR-term per F row.** Each OR-term is **false on exactly its own row**: negate the variables that are T in that row. For example, the row T, F, F gives $\\overline{A} \\vee B \\vee C$. The formula is false exactly when one of these OR-terms is false:
$$(\\overline{A} \\vee B \\vee C) \\wedge (A \\vee \\overline{B} \\vee \\overline{C}) \\wedge (A \\vee \\overline{B} \\vee C) \\wedge (A \\vee B \\vee \\overline{C}) \\wedge (A \\vee B \\vee C).$$
Both were checked against the truth table by brute force.

- A **disjunctive form** is an OR of AND-terms of literals (variables or negated variables). It is a **DNF** when every AND-term mentions **every** variable.
- **Conjunctive form** and **CNF** are the duals.

**Theorem 3.4.3**: every propositional formula is equivalent to both a DNF and a CNF, by this construction. (A formula with no T rows has the empty DNF, which is F; one with no F rows has the empty CNF, which is T.)

DNFs are often not minimal: this one simplifies to $(A \\wedge B) \\vee (A \\wedge C)$.`,
    pitfall:
      "For CNF, the OR-term for a false row negates the variables that are TRUE in that row (so the term is false there). It's the opposite of the DNF rule, and mixing the two up is the standard mistake.",
    related: ["mit6042-logic-equivalence-axioms", "mit24241-slmeta-tf-completeness-dnf", "mit6004-logic-sum-of-products"],
  },
  {
    id: "mit6042-logic-equivalence-axioms",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "List the propositional equivalence axioms of MCS §3.4.2 (commutativity, associativity, identity, zero, idempotence, contradiction, double negation, validity, distributivity, De Morgan).",
    back: `The approach is to rewrite everything into AND, OR and NOT first (e.g. A IMPLIES B becomes $\\overline{A} \\vee B$) and then apply:

| Axiom | Law |
|---|---|
| commutativity | $A \\wedge B \\longleftrightarrow B \\wedge A$ |
| associativity | $(A \\wedge B) \\wedge C \\longleftrightarrow A \\wedge (B \\wedge C)$ |
| identity for AND | $\\mathbf{T} \\wedge A \\longleftrightarrow A$ |
| zero for AND | $\\mathbf{F} \\wedge A \\longleftrightarrow \\mathbf{F}$ |
| idempotence | $A \\wedge A \\longleftrightarrow A$ |
| contradiction for AND | $A \\wedge \\overline{A} \\longleftrightarrow \\mathbf{F}$ |
| double negation | $\\overline{\\overline{A}} \\longleftrightarrow A$ |
| validity for OR | $A \\vee \\overline{A} \\longleftrightarrow \\mathbf{T}$ |
| De Morgan for AND | $\\overline{A \\wedge B} \\longleftrightarrow \\overline{A} \\vee \\overline{B}$ |
| De Morgan for OR | $\\overline{A \\vee B} \\longleftrightarrow \\overline{A} \\wedge \\overline{B}$ |

There is a matching set of OR versions (commutativity, associativity, identity $\\mathbf{F} \\vee A \\longleftrightarrow A$, and so on). There are also **two distributive laws**:
- AND over OR (Theorem 3.4.1): $A \\wedge (B \\vee C) \\longleftrightarrow (A \\wedge B) \\vee (A \\wedge C)$;
- **OR over AND** (Theorem 3.4.2): $A \\vee (B \\wedge C) \\longleftrightarrow (A \\vee B) \\wedge (A \\vee C)$.

The second has **no arithmetic analogue**: $a + bc \\neq (a + b)(a + c)$ in general.

Each axiom is checked by a small truth table. They are applied **inside** larger formulas (replacing a subformula with an equivalent one), and that's legitimate because the connectives are truth-functional.`,
    related: ["mit6042-logic-algebraic-dnf-conversion", "mit6042-logic-axioms-complete", "mit24241-slmeta-replacement-of-equivalents"],
  },
  {
    id: "mit6042-logic-algebraic-dnf-conversion",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Use the equivalence axioms to convert NOT((A AND B) OR (A AND C)) into disjunctive normal form.",
    back: `**1. Push the NOT inward with De Morgan.** Use De Morgan for OR, then for AND:
$$\\overline{(A \\wedge B) \\vee (A \\wedge C)} \\;\\longleftrightarrow\\; \\overline{A \\wedge B} \\wedge \\overline{A \\wedge C} \\;\\longleftrightarrow\\; (\\overline{A} \\vee \\overline{B}) \\wedge (\\overline{A} \\vee \\overline{C}).$$
NOT now applies only to variables.

**2. Distribute AND over OR** (using commutativity to distribute from the right):
$$(\\overline{A} \\wedge \\overline{A}) \\vee (\\overline{B} \\wedge \\overline{A}) \\vee (\\overline{A} \\wedge \\overline{C}) \\vee (\\overline{B} \\wedge \\overline{C}).$$

**3. Idempotence** ($\\overline{A} \\wedge \\overline{A} \\longleftrightarrow \\overline{A}$) and associativity give a disjunctive form:
$$\\overline{A} \\vee (\\overline{B} \\wedge \\overline{A}) \\vee (\\overline{A} \\wedge \\overline{C}) \\vee (\\overline{B} \\wedge \\overline{C}).$$

**4. Make every term mention all variables.** Use validity for OR and identity for AND: $\\overline{B} \\wedge \\overline{A} \\longleftrightarrow (\\overline{B} \\wedge \\overline{A}) \\wedge (C \\vee \\overline{C})$. Then distribute. Do the same for every other term (the lone $\\overline{A}$ needs it twice).

**5. Sort the literals and terms, and remove duplicate terms** (OR-idempotence):
$$(A \\wedge \\overline{B} \\wedge \\overline{C}) \\vee (\\overline{A} \\wedge B \\wedge C) \\vee (\\overline{A} \\wedge B \\wedge \\overline{C}) \\vee (\\overline{A} \\wedge \\overline{B} \\wedge C) \\vee (\\overline{A} \\wedge \\overline{B} \\wedge \\overline{C}).$$

**Check**: these five AND-terms are exactly the five **F** rows of A AND (B OR C). That's correct, since $(A \\wedge B) \\vee (A \\wedge C)$ is equivalent to A AND (B OR C), and the input formula is its negation. Verified by brute force.`,
    related: ["mit6042-logic-equivalence-axioms", "mit6042-logic-dnf-cnf-from-truth-table", "mit6042-logic-axioms-complete"],
  },
  {
    id: "mit6042-logic-axioms-complete",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove Theorem 3.4.5: two propositional formulas are equivalent iff they can be proved equivalent using the equivalence axioms.",
    back: `**If** (soundness): each axiom is a valid equivalence (check its truth table). Replacing a subformula with an equivalent one preserves the truth value of the whole, so any chain of axiom steps ends at an equivalent formula.

**Only if** (completeness). Suppose F and G are equivalent.
1. **Theorem 3.4.4**: the axioms suffice to transform any formula into DNF. Push NOTs inward (De Morgan, double negation), distribute AND over OR, and pad each term with $(X \\vee \\overline{X})$ for each missing variable X. Do this for F and G, over the **same** set of variables (the union of the variables in F and G).
2. Use commutativity and associativity to **sort** the literals inside each term and the terms themselves, and OR-idempotence to remove duplicates. Call the results the **sorted DNFs** of F and G.
3. A full DNF term over the variable set is true on **exactly one** row. So a sorted DNF is determined by the set of rows on which it is true. Two **different** sorted DNFs over the same variables have different truth tables.
4. F and G have the same truth table, so their sorted DNFs are **identical**. Chain the axiom steps F → sorted DNF ← G (each step can be reversed), and you have an axiomatic proof that F is equivalent to G. ∎

**Caveat (from the text)**: this strategy costs about as much as a truth table, since full DNFs can have $2^n$ terms. The value of the axioms is that they *allow* clever shortcuts, while the theorem guarantees that no equivalence is out of their reach.`,
    pitfall:
      "This is completeness of an equational system for equivalence. It's a different thing from completeness of a derivation system like SD (⊨ ⇒ ⊢), though both proofs work through normal-form or maximal-set constructions that match syntax to truth tables.",
    related: ["mit6042-logic-equivalence-axioms", "mit6042-logic-algebraic-dnf-conversion", "mit24241-slmeta-two-completeness-notions"],
  },
  {
    id: "mit6042-logic-sat-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the SAT problem? Is (P ∨ Q ∨ R) ∧ (P̄ ∨ Q̄) ∧ (P̄ ∨ R̄) ∧ (R̄ ∨ Q̄) satisfiable? Why does the question 'is SAT in polynomial time?' matter so much?",
    back: `**SAT**: given a propositional formula, decide whether it is **satisfiable**.

**The example.**
- The first clause says at least one of P, Q, R is true.
- The other three say no two are both true.

So it is satisfied exactly when **exactly one** of P, Q, R is true. It **is satisfiable**: brute force over the 8 assignments finds exactly the three models (T, F, F), (F, T, F) and (F, F, T).

**The naive method**: build the truth table and look for a T. With n variables that is $2^n$ rows. For 30 variables that's over a billion.

**P vs NP**: no one knows a procedure that decides SAT in time polynomial in the formula's size, and no one has proved that none exists. This is the **P vs NP** question, one of the Clay Millennium Problems, with a one-million-dollar prize.
- A polynomial-time SAT algorithm would give polynomial-time solutions for scheduling, routing, resource allocation and circuit verification.
- It would also break much of public-key cryptography.
- **Validity** is equally hard, since P is valid iff NOT(P) is unsatisfiable.

**In practice**, modern **SAT solvers** handle many industrial formulas with millions of variables (e.g. in circuit verification). But which formulas they will handle is hard to predict, and they often get nowhere on unsatisfiable formulas.`,
    related: ["mit6042-logic-validity-satisfiability", "mit6045-complexity-sat-is-np-complete", "mit6045-complexity-3sat-and-cnf-conversion"],
  },

  // --- Session 5: Chapter 3.6, predicate formulas ---
  {
    id: "mit6042-logic-ambiguous-any",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "'If you can solve any problem we come up with, then you get an A.' Give its two readings in logic. Why does the existential reading equal a universally quantified conditional?",
    back: `Let Probs be the set of problems, Solves(x) mean "you can solve problem x", and G mean "you get an A". English "any" is ambiguous here (MCS §3.6.1):
- **Universal reading** ("you can solve every problem"): $(\\forall x \\in \\text{Probs}.\\ \\text{Solves}(x)) \\rightarrow G$.
- **Existential reading** ("you can solve at least one problem"): $(\\exists x \\in \\text{Probs}.\\ \\text{Solves}(x)) \\rightarrow G$.

These are very different promises. The first demands everything; the second grants an A for a single solved problem.

**A useful rewriting.** When x does not occur in G,
$$(\\exists x.\\ \\text{Solves}(x)) \\rightarrow G \\quad\\text{is equivalent to}\\quad \\forall x.\\ (\\text{Solves}(x) \\rightarrow G).$$
"If some problem is solved, you get an A" is the same as "for each problem, if you solve it you get an A". This is the reason "any" can sound universal even on the existential reading. (24.241 proves this equivalence and shows why the side condition is needed.)

**Domain of discourse** (§3.6.4): when all variables range over one **nonempty** set D, it is left implicit: ∀x∃y. Q(x, y). Restricted quantifiers reduce to the single domain: $\\forall n \\in \\text{Evens}.\\ P(n)$ becomes $\\forall n.\\ (n \\in \\text{Evens} \\rightarrow P(n))$.`,
    pitfall:
      "Moving a quantifier out of the antecedent of an implication flips it (∃ becomes ∀). Out of the consequent, it stays the same. Applying the 'stays the same' rule to the antecedent is a common error.",
    related: ["mit6042-logic-predicate-validity", "mit24241-pl-prenex-restriction", "mit6120-proofs-propositions-predicates-quantifiers"],
  },
  {
    id: "mit6042-logic-predicate-validity",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "When is a predicate formula valid? Show ∃x∀y. P(x, y) → ∀y∃x. P(x, y) is valid, and give a counter model for the converse.",
    back: `A predicate formula is **valid** iff it is true **no matter what the (nonempty) domain is, what values its free variables take, and how its predicate symbols are interpreted** (MCS §3.6.6). Example: NOT(∀x. P(x)) IFF ∃x. NOT(P(x)), which is the quantifier-negation rule.

**∃x∀y. P(x, y) → ∀y∃x. P(x, y) is valid.** Fix any domain D and binary predicate $P_0$ on D, and suppose $\\exists x \\in D\\ \\forall y \\in D.\\ P_0(x, y)$. Then some $d_0 \\in D$ has $P_0(d_0, d)$ for **all** $d \\in D$. Given any $d \\in D$, the element $d_0$ is an x with $P_0(x, d)$. That is exactly $\\forall y\\ \\exists x.\\ P_0(x, y)$. ∎

The text says this is an explanation rather than a proof, because it translates the formula into English and appeals to what "for all" and "there exists" mean. 24.241 makes it fully formal, both as a PD derivation and through satisfaction clauses.

**The converse ∀y∃x. P(x, y) → ∃x∀y. P(x, y) is not valid.** **Counter model**: domain ℤ and P(x, y) meaning x > y.
- Hypothesis: for every y there is a larger x (take y + 1). True.
- Conclusion: some integer is larger than every integer (including itself). False.

A single counter model refutes validity. A finite one also works: domain {1, 2} with P as equality.

**Swapping quantifiers changes meaning**: "every American has a dream" (∀a∃d) versus "there is a dream every American has" (∃d∀a). Swapping the quantifiers in Goldbach's conjecture produces "the same two primes sum to every even number > 2", which is patently false.`,
    related: ["mit6042-logic-ambiguous-any", "mit24241-pd-exists-forall-swap", "mit24241-pl-scope-free-bound"],
  },
];
