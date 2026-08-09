// MIT 6.045J / 18.400J (Spring 2011) — Lectures 12, 15-17: Time complexity
// classes, P, the Hierarchy Theorem, NP (both machine and verifier
// formulations), polynomial-time reducibility, NP-completeness (Cook-Levin,
// 3SAT, CLIQUE), and probabilistic complexity classes (BPP, RP). Where the
// generic curriculum's np-completeness module already covers a topic at an
// applied level (P vs NP, reductions, SAT, classic NP-complete problems),
// these cards cover the same ground at 6.045's formal/proof-driven level of
// rigor and cross-link rather than duplicate — asymptotic notation itself
// (O/Ω/Θ) is assumed from the generic complexity-analysis module and not
// re-derived here. See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6045-complexity";

export const mit6045ComplexityCards: Card[] = [
  {
    id: "mit6045-complexity-time-class-and-model-independence",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is TIME(t(n)) formally, and in what precise sense is it 'independent' of which reasonable machine model you use to define it?",
    back: `For a function $t: \\mathbb{N} \\to \\mathbb{R}^{\\geq 0}$, $\\text{TIME}(t(n)) = \\{L \\mid L \\text{ is decided by some } O(t(n))\\text{-time Turing machine}\\}$ — a **time-bounded complexity class**, defined here with respect to the basic single-tape TM (Sipser's convention; other texts use multi-tape or RAM models).

Model choice isn't fully irrelevant, but the effect is bounded: if $L \\in \\text{TIME}(f(n))$ on any "standard" machine model, then $L \\in \\text{TIME}(g(n))$ on any *other* standard model, where $g(n) = O(p(f(n)))$ for **some polynomial** $p$ — running times across reasonable models are always polynomially related, never wildly different. Concretely, for single-tape vs. multi-tape TMs: any multi-tape machine running in $t(n) \\geq n$ time has an equivalent single-tape machine running in $O(t^2(n))$ time. *Proof idea*: the single-tape machine simulates each multi-tape step with two scans over the (still-bounded) non-blank portion of a single tape encoding all the multi-tape machine's tracks — visiting every head position and applying every change. After $t(n)$ real steps, the non-blank region has grown to at most $t(n)$ cells (heads start at the left and can't outrun the step count), so each of the $t(n)$ steps costs $O(t(n))$ to simulate, giving $O(t(n)) \\times O(t(n)) = O(t^2(n))$ total.

The one **important exception** to "polynomial-related across models": nondeterministic TMs. A $t(n)$-step bound on every branch of an NTM translates to $2^{O(t(n))}$ steps for a basic deterministic TM to simulate — exponential, not polynomial, blowup.`,
    pitfall:
      "The polynomial-relatedness guarantee is specifically about deterministic 'reasonable' models (RAM machines, real programming languages, other tape configurations) — it does not extend to nondeterministic models, where the deterministic-simulation cost is exponential, not polynomial.",
    related: ["complexity-analysis-big-o", "mit6045-complexity-p-definition"],
  },
  {
    id: "mit6045-complexity-p-definition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the formal definition of P, and what three properties make it 'the' class of feasibly-computable languages?",
    back: `$P = \\bigcup_{p \\text{ a polynomial}} \\text{TIME}(p(n)) = \\bigcup_{k \\geq 0} \\text{TIME}(n^k)$ — languages decidable in polynomial time. Because polynomial differences between "standard" deterministic models are provably unimportant (see related card), this definition is **robust**: it doesn't matter which reasonable deterministic model you use to state it.

Three properties motivate treating $P$ as the formal stand-in for "efficiently computable":
1. **Model-independence** — same class regardless of which reasonable deterministic model defines it.
2. **Scalability** — for time bound $n^k$, doubling the input length only multiplies the running time by the constant $2^k$; the *ratio* of times for related input sizes doesn't depend on $n$ itself.
3. **Composition** — composing two polynomials yields another polynomial, which is exactly what makes polynomial-time **reducibility** ($\\leq_p$, see related card) well-behaved: chaining a poly-time reduction with a poly-time decision procedure stays polynomial.

$P$ is also known to have real limitations as a model of "feasible": it only counts *worst-case* time (an algorithm exponential in the worst case but fast on typical inputs is excluded), it ignores algorithms that use **randomness** to get a probabilistically-correct answer fast (see the BPP/RP cards), and it says nothing about quantum computation. It's also arguably too permissive in the other direction — it allows polynomials with arbitrarily large degree and huge constant coefficients ($10^7 n^{10^7}$ is technically "polynomial" but not remotely feasible); in practice, real algorithms in $P$ almost always have low-degree bounds, up to roughly $O(n^4)$.

The **modified Church-Turing thesis** — a philosophical statement, not a theorem — extends the original thesis to claim: if $L$ is decidable in polynomial time on *some* reasonable deterministic model, it's decidable in polynomial time on *any* reasonable deterministic model. This is effectively what licenses treating $P$'s definition as canonical rather than an artifact of choosing basic single-tape TMs.`,
    pitfall:
      "P's model-independence guarantee is specifically about deterministic models — nondeterministic TMs are the standard counterexample (see the related TIME(t(n)) card), which is exactly why NP needs its own separate definition rather than being folded into this story.",
    related: ["mit6045-complexity-time-class-and-model-independence", "mit6045-complexity-poly-time-reducibility"],
  },
  {
    id: "mit6045-complexity-language-not-in-p-and-hierarchy",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a diagonalization argument show that not every decidable language is in P, and what does the Hierarchy Theorem generalize this to?",
    back: `Not every language is decidable (computability theory), and — separately, requiring its own proof — not every *decidable* language is in $P$.

**Theorem**: for any computable function $t$, there's a decidable language not decidable by any basic TM in $\\leq t(n)$ steps. *Proof*: define $\\text{Acc}(t) = \\{\\langle M \\rangle \\mid M \\text{ is a basic TM that accepts } \\langle M \\rangle \\text{ in} \\leq t(|\\langle M \\rangle|) \\text{ steps}\\}$. **Claim 1**: $\\text{Acc}(t)$ is decidable — simulate $M$ on $\\langle M \\rangle$ for exactly $t(|\\langle M \\rangle|)$ simulated steps and check for acceptance; this simulation is guaranteed to terminate since the step bound is fixed in advance. **Claim 2** (diagonalization): $\\text{Acc}(t)$ can't be decided by any basic TM $M_0$ running in $\\leq t(n)$ steps. Suppose it could — then $M_0$ decides $\\text{Acc}(t)$ in $\\leq t(n)$ steps, so (swapping accept/reject) some $M_0'$ decides $(\\text{Acc}(t))^c$ in $\\leq t(n)$ steps too. By definition of $\\text{Acc}(t)$: for every basic TM $M$, $\\langle M \\rangle \\in (\\text{Acc}(t))^c$ iff $M$ does *not* accept $\\langle M \\rangle$ within $t(|\\langle M \\rangle|)$ steps. But $M_0'$ deciding $(\\text{Acc}(t))^c$ in $\\leq t(n)$ steps means $\\langle M \\rangle \\in (\\text{Acc}(t))^c$ iff $M_0'$ *accepts* $\\langle M \\rangle$ within $t(|\\langle M \\rangle|)$ steps. Plug in $M = M_0'$ itself: $\\langle M_0' \\rangle \\in (\\text{Acc}(t))^c$ iff $M_0'$ accepts $\\langle M_0'\\rangle$ within the bound, **and also** iff $M_0'$ does *not* accept $\\langle M_0'\\rangle$ within the bound — direct contradiction.

Since this holds for *every* computable $t$ — polynomial, exponential, double-exponential, anything — there are decidable languages outside $\\text{TIME}(t(n))$ no matter how generous $t$ is, and in particular, **decidable languages not in $P$** exist.

The **Hierarchy Theorem** sharpens this from "eventually more time helps" to a precise ladder: for time-constructible $t$ (computable in time not much bigger than $t$ itself — true of typical functions like polynomials and exponentials), $\\text{Acc}(t)$ is decidable in time not much more than $t(n)$ (roughly $t^2(n)$), which is *tight enough* to conclude a strict hierarchy: $\\text{TIME}(n) \\subsetneq \\text{TIME}(n^2) \\subsetneq \\text{TIME}(n^4) \\subsetneq \\cdots \\subsetneq \\text{TIME}(2^n) \\subsetneq \\text{TIME}(4^n) \\subsetneq \\cdots$ — genuinely more time always buys the ability to decide strictly more languages, not just asymptotically-equivalent-seeming ones.`,
    pitfall:
      "The contradiction in Claim 2 hinges on plugging M0' into its own construction (M = M0') — the same self-application move as the Acc_TM undecidability proof from the computability module. It's easy to state the theorem correctly but lose track of exactly where the diagonalization happens in the proof.",
    related: ["mit6045-computability-acc-tm-undecidable", "mit6045-complexity-p-definition"],
  },
  {
    id: "mit6045-complexity-np-two-definitions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give both equivalent formal definitions of NP (nondeterministic-machine and verifier), and explain what a 'certificate' is.",
    back: `**Machine definition**: $NP = \\{L \\mid \\exists \\text{ a polynomial-time nondeterministic TM that decides } L\\}$ — an NTM decides $L$ if, on every input, some branch accepts iff the input is in $L$, and *every* branch is bounded by a polynomial in the input length.

**Verifier definition** (equivalent): $L \\in NP$ iff there exists a polynomial-time **verifier** $V$ and a polynomial $p$ such that $x \\in L \\iff \\exists c$ with $|c| \\leq p(|x|)$ such that $V(x, c)$ accepts. The string $c$ is a **certificate** (or witness) — a piece of evidence that, if $x \\in L$, some certificate makes $V$ accept, and if $x \\notin L$, no certificate does. The equivalence is intuitive: an NTM's accepting branch, written down as a sequence of nondeterministic choices, *is* a certificate; conversely, a verifier can be turned into an NTM that nondeterministically guesses the certificate then runs $V$.

**Practical upshot**: to show $L \\in NP$, it suffices to exhibit a suitable verifier and certificate format — you never need to describe the (potentially exponential-size) search over all certificates explicitly. E.g. for $\\text{CLIQUE} = \\{\\langle G, k\\rangle \\mid G \\text{ has a clique of size } k\\}$: the certificate is a candidate set of $k$ vertices; the verifier checks in polynomial time that all $\\binom{k}{2}$ pairs are edges. For $\\text{VERTEX-COVER} = \\{\\langle G, k\\rangle \\mid G \\text{ has a vertex cover of size } k\\}$ (a set of vertices touching every edge): the certificate is a candidate set of $k$ vertices; the verifier checks every edge has an endpoint in the set. Both structures share the defining shape of $NP$ membership: a solution that's *hard to find* but *easy to verify once found*. $P \\subseteq NP$ always (a poly-time decider is trivially a verifier that ignores its certificate), but whether $P = NP$ is open.`,
    related: ["np-completeness-p-vs-np", "mit6045-complexity-poly-time-reducibility"],
  },
  {
    id: "mit6045-complexity-poly-time-reducibility",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is polynomial-time reducibility (≤p), and what do its three core preservation theorems say?",
    back: `$A \\leq_p B$ ("$A$ is polynomial-time reducible to $B$") if there's a polynomial-time computable function $f$ such that $\\forall w: w \\in A \\iff f(w) \\in B$ — the same shape as mapping reducibility ($\\leq_m$, computability theory), restricted to *polynomial-time-computable* $f$.

Three theorems make $\\leq_p$ useful for organizing hardness:
1. **Transitivity**: $A \\leq_p B$ and $B \\leq_p C$ imply $A \\leq_p C$ — compose the two reduction functions $h(w) = g(f(w))$; $h$ is still poly-time since substituting one polynomial's output size into another polynomial yields another polynomial.
2. **Easiness propagates downward / hardness propagates upward**: $A \\leq_p B$ and $B \\in P$ imply $A \\in P$ (decide $w \\in A$ by computing $f(w)$, then deciding $f(w) \\in B$ — both poly-time, so the composite is too). Contrapositive: $A \\leq_p B$ and $A \\notin P$ imply $B \\notin P$.
3. **NP transfers the same way**: $A \\leq_p B$ and $B \\in NP$ imply $A \\in NP$ (guess a certificate for $f(w)$ using $B$'s NTM, run it on $f(w)$ computed from $w$). Contrapositive: $A \\leq_p B$ and $A \\notin NP$ imply $B \\notin NP$.

**Worked example** — $\\text{CLIQUE} \\leq_p \\text{VERTEX-COVER}$ and $\\text{VERTEX-COVER} \\leq_p \\text{CLIQUE}$, via the *same* transformation in both directions: given $\\langle G, k \\rangle$ with $G = (V, E)$, $|V| = n$, map to $\\langle G', n-k \\rangle$ where $G' = (V, E')$ and $E' = (V \\times V) - E$ (the **complement graph** — edges present in $G'$ are exactly the non-edges of $G$). $G$ has a $k$-clique iff $G'$ has an $(n-k)$-vertex-cover: if $C$ is a $k$-clique in $G$, every edge among $C$'s vertices is in $E$, hence *missing* from $E'$ — so $V - C$ (size $n-k$) must cover every edge of $G'$ (any edge in $E'$ has at least one endpoint outside $C$, since edges strictly inside $C$ don't exist in $E'$). The reverse direction is the mirror argument. Since this single transformation witnesses both directions, CLIQUE and VERTEX-COVER are "essentially the same problem" up to $\\leq_p$ — either both are in $P$ or neither is.`,
    pitfall:
      "≤p only tells you A is no harder than B — it says nothing about which is 'easier' to reason about or implement. A ≤p B and B ≤p A together (as in the CLIQUE/VC example) show the two are polynomially equivalent, not that one reduces work away from the other.",
    related: ["np-completeness-reductions", "mit6045-complexity-np-completeness-definitions"],
  },
  {
    id: "mit6045-complexity-np-completeness-definitions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define NP-complete and NP-hard precisely, and state the theorem connecting NP-completeness to the P vs NP question.",
    back: `$\\leq_p$ imposes structure on $NP$: it's not just an unordered pile of problems, but a partial order where $A \\to B$ (meaning $A \\leq_p B$) tracks "reduces to, hence is no harder than." **Language $B$ is NP-complete** if (a) $B \\in NP$, and (b) for every $A \\in NP$, $A \\leq_p B$ — $B$ is a "hardest" problem in $NP$, since literally everything in $NP$ reduces to it. **Language $B$ is NP-hard** if condition (b) holds but $B$ isn't required to be in $NP$ itself (it might not even be decidable) — NP-hardness is the weaker, "at least as hard as everything in NP" notion without the membership requirement.

**Theorem**: if some NP-complete language is in $P$, then $P = NP$. *Proof*: suppose NP-complete $B \\in P$; let $A$ be any language in $NP$ — since $B$ is NP-complete, $A \\leq_p B$, and since easiness propagates downward (related card) with $B \\in P$, $A \\in P$ too. Since this holds for *every* $A \\in NP$, $NP \\subseteq P$; combined with the always-true $P \\subseteq NP$, this gives $P = NP$.

**Corollary — three equivalent statements**: (1) $P = NP$; (2) every NP-complete language is in $P$; (3) some NP-complete language is in $P$. $(1) \\Rightarrow (2)$: if $P = NP$ and $B$ is NP-complete, $B \\in NP = P$. $(2) \\Rightarrow (3)$: immediate, given that at least one NP-complete language is known to exist (SAT, via Cook-Levin — see related card). $(3) \\Rightarrow (1)$: the theorem above.

**Why most theoretical computer scientists believe $P \\neq NP$**: decades of effort by many researchers on many NP-complete problems (arising independently across logic, graph theory, number theory, operations research, games) have produced no polynomial-time algorithm for any of them — purely empirical evidence, not a proof. The intuitive source of the difficulty: $NP$'s defining shape (guess a certificate, verify in poly time) seems to require exploring an exponentially large tree of possible guesses when no shortcut is known, but nobody has yet found a way to make that intuition into an actual lower-bound proof — "we don't have sharp enough methods" — which is exactly why NP-completeness results (relative hardness) are the practical tool available, in lieu of absolute hardness proofs.`,
    pitfall:
      "NP-hard is not synonymous with NP-complete — an NP-hard problem need not be in NP at all (it could be much harder, even undecidable), whereas NP-complete requires both NP membership and hardness. Every NP-complete problem is NP-hard, but not every NP-hard problem is NP-complete.",
    related: ["np-completeness-nphard-vs-npcomplete", "mit6045-complexity-sat-is-np-complete"],
  },
  {
    id: "mit6045-complexity-sat-is-np-complete",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does the Cook-Levin theorem state, and what's the high-level structure of showing SAT is NP-hard via a Boolean formula built from a TM's computation?",
    back: `A Boolean formula uses variables (each 0/1), **literals** (a variable or its negation, e.g. $x$, $\\neg x$), and the operations $\\land, \\lor, \\neg$; it's **satisfiable** if some 0/1 assignment to its variables makes the whole formula evaluate to 1. $\\text{SAT} = \\{\\langle \\phi \\rangle \\mid \\phi \\text{ is a satisfiable Boolean formula}\\}$.

**Cook-Levin Theorem**: SAT is NP-complete. SAT $\\in NP$ is immediate (certificate = a satisfying assignment; verifier plugs it in and evaluates $\\phi$ in polynomial time). The substantial direction is NP-*hardness*: for an **arbitrary** $A \\in NP$ with NTM $M$, construct — in time polynomial in $|w|$ — a formula $\\phi_w$ such that $\\phi_w$ is satisfiable iff $M$ accepts $w$. $\\phi_w$ is built as a **conjunction of four sub-formulas** describing a complete accepting computation history (a *tableau*: the full grid of $M$'s tape contents across every step, encoded as Boolean variables $x_{i,j,s}$ meaning "at step $i$, tape cell $j$ holds symbol $s$"): $\\phi_w = \\phi_{cell} \\land \\phi_{start} \\land \\phi_{accept} \\land \\phi_{move}$ — $\\phi_{cell}$ forces exactly one symbol per cell, $\\phi_{start}$ forces the first row to encode $w$ on the initial tape, $\\phi_{accept}$ forces some row to reach an accepting state, and $\\phi_{move}$ forces every $3\\times 3$ block of adjacent cells across consecutive steps to be consistent with one of $M$'s legal transition rules.

This reduction shows $A \\leq_p \\text{SAT}$ for the specific $A$ chosen — but since $A$ was an *arbitrary* language in $NP$, it shows every language in $NP$ reduces to SAT, which is exactly the NP-hardness condition. Together with SAT $\\in NP$, this proves SAT is NP-complete — the historically first NP-complete problem shown (independently, Cook and Levin), and the base case every other NP-completeness proof in this course (3SAT, CLIQUE, VERTEX-COVER, …) builds on by reducing *from* SAT or one of its descendants rather than re-deriving hardness from scratch against an arbitrary NTM each time.`,
    pitfall:
      "The construction reduces a single arbitrary A in NP to SAT — genuine NP-hardness requires this to work for every A simultaneously, which is why the construction is parameterized by M and w rather than tailored to one specific NP language; that generality is what licenses reusing SAT as the base case for every later reduction.",
    related: ["np-completeness-sat", "mit6045-complexity-3sat-and-cnf-conversion"],
  },
  {
    id: "mit6045-complexity-3sat-and-cnf-conversion",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What is 3SAT, and how does the reduction from general CNF-SAT to 3SAT keep formula size polynomial despite converting each clause independently?",
    back: `A **clause** is a disjunction of literals, e.g. $(\\neg x_1 \\lor x_2 \\lor \\neg x_3)$; a formula in **conjunctive normal form (CNF)** is a conjunction of clauses. **3-CNF** restricts every clause to exactly 3 literals; $\\text{3SAT} = \\{\\langle \\phi \\rangle \\mid \\phi \\text{ is a satisfiable 3-CNF formula}\\} = \\text{SAT} \\cap \\text{3-CNF}$.

**CNF-SAT is NP-hard** (a strengthening of Cook-Levin): the tableau formula $\\phi_w = \\phi_{cell} \\land \\phi_{start} \\land \\phi_{accept} \\land \\phi_{move}$ is already in CNF except $\\phi_{move}$, which has the shape (conjunction over cell positions) of (disjunction over tile choices) of (conjunction of 6 conditions) — an "$\\land$ of $\\lor$ of $\\land$" shape. Distributive laws can always convert $\\lor$-of-$\\land$ into $\\land$-of-$\\lor$ (true CNF), but doing this **naively can blow up formula size exponentially**. The saving grace here: each individual $(i,j)$-indexed clause group has a size depending only on $M$'s fixed transition function, **not on $w$** — so the CNF-conversion cost per group is a constant, and the total transformed formula stays polynomial in $|w|$.

**3SAT is NP-hard** (reduces from CNF-SAT): convert each clause independently to an equivalent conjunction of $\\leq 3$-literal clauses using **fresh auxiliary variables** that chain the original literals together. E.g. a 5-literal clause $(a \\lor b \\lor c \\lor d \\lor e)$ becomes $(a \\lor r_1) \\land (\\neg r_1 \\lor b \\lor r_2) \\land (\\neg r_2 \\lor c \\lor r_3) \\land (\\neg r_3 \\lor d \\lor r_4) \\land (\\neg r_4 \\lor e)$ — each $r_i$ "carries forward" whether some earlier literal in the chain was already satisfied. **Satisfiability is preserved both directions**: given a satisfying assignment for the original clause, some literal is true — set every $r_i$ before that literal's position to 1 and every $r_i$ after to 0, satisfying every new clause. Conversely, given a satisfying assignment for the chain, each $r_i$ can only make *one* clause true by itself, but there's one fewer $r_i$ than clauses — so at least one clause must be satisfied by an *original* literal, which is exactly what makes the original clause true. Since each clause converts independently with only a constant multiplicative blowup (linear in that clause's own length), the whole-formula conversion stays polynomial.`,
    pitfall:
      "The naive CNF-to-3CNF conversion via full distributive expansion is exponential in general — the polynomial-time reduction works specifically because it processes clauses independently with fresh auxiliary variables per clause, never expanding the whole formula's disjunctive structure globally.",
    related: ["mit6045-complexity-sat-is-np-complete", "mit6045-complexity-clique-is-np-complete"],
  },
  {
    id: "mit6045-complexity-clique-is-np-complete",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Walk through the reduction proving CLIQUE is NP-hard: how does a 3-CNF formula's clause structure become a graph, such that satisfiability corresponds exactly to a clique?",
    back: `Given a 3-CNF formula $\\phi$ with $k$ clauses (each with 3 literals), build graph $G$: one **node per (clause, literal) pair** — $3k$ nodes total, grouped into $k$ triples, one triple per clause. **Edges** connect every pair of nodes that are (a) in *different* clauses, and (b) **non-contradictory** — i.e. not a variable paired with its own negation. Set the target clique size to $k$ (the number of clauses).

**Claim**: $\\phi$ is satisfiable iff $G$ has a $k$-clique.

($\\Rightarrow$) Given a satisfying assignment, each clause has at least one literal evaluating to true (that's what satisfiability requires) — pick exactly one such literal per clause, giving $k$ nodes, one from each clause's triple. Any two of these are in different clauses (by construction) and can't be contradictory (both are true under the *same* consistent assignment, so a variable and its negation can't both be among them) — so all $\\binom{k}{2}$ pairs are edges: a $k$-clique.

($\\Leftarrow$) Given a $k$-clique: since edges only connect nodes from *different* clauses, and there are only $k$ clause-triples total, the clique must contain **exactly one node per clause**. Since no two clique nodes are contradictory (by the edge definition), the corresponding literals can be assigned true *simultaneously and consistently* — set each chosen literal's variable so that literal is true (any variable that appears in more than one chosen literal is forced to agree, since contradictory choices weren't connected by an edge, hence never both chosen). Every clause has its chosen literal true, so $\\phi$ is satisfied.

This 3SAT $\\leq_p$ CLIQUE reduction is polynomial (the graph has $O(k)$ nodes and $O(k^2)$ edges, directly readable off $\\phi$'s clause structure) — combined with 3SAT being NP-hard, transitivity of $\\leq_p$ gives CLIQUE is NP-hard; combined with CLIQUE $\\in NP$ (shown earlier via the obvious verifier), CLIQUE is NP-complete.`,
    pitfall:
      "The 'exactly one node per clause' fact in the ⇐ direction relies on the graph having no edges *within* a clause's own triple — that's what forces a k-clique (which needs one node from k different 'slots' to reach size k, given no two same-clause nodes can ever be adjacent) to pick precisely one literal from each clause, never two from the same one.",
    related: ["mit6045-complexity-3sat-and-cnf-conversion", "np-completeness-classic-problems"],
  },
  {
    id: "mit6045-complexity-probabilistic-tm-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a probabilistic Turing machine's computation tree assign probabilities to branches, and what makes a probabilistic TM a 'decider'?",
    back: `A **probabilistic TM** is an NTM where every nondeterministic step is a **coin flip**: exactly two next moves, each assigned probability $\\frac{1}{2}$. A maximal branch of length $k$ (i.e. $k$ coin flips along the way) has probability $\\left(\\frac{1}{2}\\right)^k$ — the product of each flip's probability. Since accept/reject states work as in ordinary NTMs, this lets you define, for input $w$:
$$\\Pr[\\text{acceptance}] = \\sum_{b \\text{ an accepting branch}} \\Pr(b), \\qquad \\Pr[\\text{rejection}] = \\sum_{b \\text{ a rejecting branch}} \\Pr(b)$$

Time complexity is measured as usual: worst case over all branches. A probabilistic TM that **halts (accepts or rejects) on every branch** is called a **decider** — for a decider, acceptance and rejection probabilities sum to exactly 1 (every branch contributes to one or the other, with no "runs forever" branches to unaccounted-for probability). This course restricts attention to probabilistic *poly-time* deciders throughout.

Randomness is useful beyond just yes/no decisions too — a classic application is **Monte Carlo estimation**: to estimate the integral of some function $f$ over a rectangle, repeatedly sample a random point $(x, y)$ in the rectangle and check whether $y \\leq f(x)$; the fraction of "yes" trials approximates the area under $f$ relative to the rectangle, with accuracy improving (in a quantifiable way) as the number of trials grows. This is the same underlying idea — trading certainty for tunable, cheap probabilistic accuracy — that motivates the formal probabilistic complexity classes below.`,
    related: ["mit6045-complexity-bpp-and-rp-definitions"],
  },
  {
    id: "mit6045-complexity-bpp-and-rp-definitions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define BPP and RP precisely, and explain the key asymmetry that distinguishes RP's error model from BPP's.",
    back: `The naive way to say a probabilistic algorithm "approximates" a language — right on *most inputs* — is too weak, since it says nothing about any specific input you actually care about. The definitions instead require: for **every** input $w$, the right answer comes back with **high probability**.

A probabilistic TM decider $M$ **decides $L$ with error probability $\\varepsilon$** if: $w \\in L \\Rightarrow \\Pr[M \\text{ accepts } w] \\geq 1-\\varepsilon$, and $w \\notin L \\Rightarrow \\Pr[M \\text{ rejects } w] \\geq 1-\\varepsilon$ — **two-sided** error, since $M$ can be wrong in either direction. $L \\in \\text{BPP}$ (Bounded-error Probabilistic Polynomial time) if some probabilistic poly-time TM decides $L$ with error probability $\\frac{1}{3}$. The constant $\\frac{1}{3}$ is not special — any fixed $\\varepsilon$ with $0 \\leq \\varepsilon < \\frac{1}{2}$ gives an equivalent class, by the Amplification Theorem (related card): **BPP $\\in L$ iff for *some* $\\varepsilon < \\frac{1}{2}$, a probabilistic poly-time TM decides $L$ with that error**, so the class doesn't depend on which sub-$\\frac{1}{2}$ constant you happen to name.

$L \\in \\text{RP}$ (Random Polynomial time) if some probabilistic poly-time TM decides $L$ with **one-sided error**: $w \\in L \\Rightarrow \\Pr[M \\text{ accepts } w] \\geq \\frac{1}{2}$, but $w \\notin L \\Rightarrow \\Pr[M \\text{ rejects } w] = 1$ — **always** correct on non-members, never a false accept, but may incorrectly reject a true member up to half the time. This asymmetry mirrors nondeterministic acceptance itself: $w \\in L$ means *some* accepting path exists (NTM) vs. *enough probability mass* of accepting branches (RP); $w \\notin L$ means *no* accepting path exists (NTM) vs. *zero* probability of accepting (RP) — RP is, informally, "NP with a probabilistic witness-finding process" rather than an existential one.`,
    pitfall:
      "BPP's error is two-sided (can be wrong either direction) while RP's is one-sided (only ever wrong by false-rejecting a true member, never by false-accepting) — mixing these up inverts which direction 'amplification by majority vote' vs. 'amplification by OR-ing trials' actually applies to, since the two error models call for different amplification strategies (see the amplification card).",
    related: ["mit6045-complexity-probabilistic-tm-model", "mit6045-complexity-amplification-lemmas"],
  },
  {
    id: "mit6045-complexity-amplification-lemmas",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why does majority-vote amplification work for BPP, and why does a different (OR-based) strategy apply to RP instead?",
    back: `**BPP amplification** (two-sided error, majority vote): if $M$ decides $L$ with error $\\varepsilon < \\frac{1}{2}$, then for *any* target $\\varepsilon' < \\frac{1}{2}$, some $M'$ decides $L$ with error $\\varepsilon'$. $M'$ runs $M$ independently many times on the same input and outputs the **majority** answer. Intuition: each trial is individually correct with probability $\\geq 1-\\varepsilon > \\frac{1}{2}$ — a biased coin favoring the right answer — so repeating it enough times and taking the majority drives the chance of an *overall wrong* majority down exponentially in the number of trials (a Chernoff-bound-style argument; e.g. for $\\varepsilon=\\frac{1}{3}$, $2k$ trials suffice once $(4\\varepsilon(1-\\varepsilon))^k \\leq \\varepsilon'$). This is exactly why the specific constant $\\frac{1}{3}$ in BPP's definition doesn't matter: any starting error below $\\frac{1}{2}$ can be amplified down to any other target below $\\frac{1}{2}$.

**RP amplification** (one-sided error, OR of trials): majority vote is useless here — if $w \\in L$, $\\Pr[\\text{accept}]$ could be exactly $\\frac{1}{2}$, a fair coin with **no** bias toward the correct answer, so a majority vote over many trials would be right about as often as wrong. But the one-sided guarantee ($w \\notin L$ always rejects) makes a *different* strategy work: run $k$ *independent* trials, and **accept if any of them accepts** (reject only if all $k$ reject). If $w \\notin L$: every trial rejects with certainty, so $M'$ correctly rejects too. If $w \\in L$: each trial independently has $\\Pr[\\text{accept}] \\geq 1-\\varepsilon$, so $\\Pr[\\text{all } k \\text{ reject}] \\leq \\varepsilon^k$, meaning $\\Pr[\\text{at least one accepts}] \\geq 1-\\varepsilon^k$ — driving the error down to any target $\\varepsilon' \\geq \\varepsilon^k$ by choosing $k$ large enough.

**Consequence — RP $\\subseteq$ BPP**: given $A \\in RP$ via some $M$ with $\\Pr[\\text{accept} \\mid w \\in L] \\geq \\frac{1}{2}$ and $\\Pr[\\text{reject} \\mid w \\notin L] = 1$, the RP amplification lemma boosts this to $\\Pr[\\text{accept} \\mid w \\in L] \\geq \\frac{2}{3}$ while keeping $\\Pr[\\text{reject} \\mid w \\notin L] = 1$ — which is in particular a decider with two-sided error $\\leq \\frac{1}{3}$ (trivially, since the "wrong" side for non-members has probability exactly 0), satisfying BPP's definition directly.`,
    pitfall:
      "Applying majority-vote amplification to an RP machine is a real error, not just a missed optimization — RP's guarantee for members can be as weak as Pr[accept] = 1/2 exactly, giving majority vote zero net bias toward correctness, whereas the OR-based strategy correctly exploits the one-sided certainty on non-members that majority vote never uses.",
    related: ["mit6045-complexity-bpp-and-rp-definitions"],
  },
];
