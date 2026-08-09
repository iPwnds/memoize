// MIT 6.045J / 18.400J (Spring 2011) — Lectures 6-10: Turing machines,
// decidability, undecidable problems (including PCP), mapping reducibility,
// Rice's Theorem, and the Recursion Theorem. Course-specific formal
// machinery (Acc_TM/Halt_TM, the diagonalization/reduction proof templates,
// ≤m) with no equivalent in the generic curriculum, which has no
// computability-theory module at all — this is genuinely new territory, not
// a reframing. See src/data/courses.ts for how this fits into the full
// lecture map.
import type { Card } from "./types";

const MODULE = "mit6045-computability";

export const mit6045ComputabilityCards: Card[] = [
  {
    id: "mit6045-computability-tm-informal-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a Turing machine generalize a finite automaton, and why does adding two-way tape movement alone add no power?",
    back: `A **Turing machine** extends an FA with two new capabilities: it can **write** to the tape (not just read), and it can **halt at any point of its choosing** (not just at the end of a fixed-length pass). At every step, a TM's behavior is a function of its current state and the symbol under its head, answering three questions: change state? write to the tape? move left, move right, or halt?

Writing gives a TM effectively **unlimited memory** — anything that won't fit in the finite state set can be recorded on the tape instead. Halting at discretion means a TM isn't "tied to the input" the way an FA is; it can do arbitrary auxiliary computation before answering.

Merely letting an automaton move **backwards** on the tape (without writing) adds nothing: a two-way FA at tape position $x$, having wandered left and come back to $x$, has only computed some function $f(a)$ of its state $a$ (determined by what's to the left) — so a *one-way* machine can simulate it by tracking $f$ itself instead of $a$. It's the combination of writing **and** unbounded halting-on-demand, not two-way movement alone, that gives Turing machines strictly more power than finite automata — demonstrated concretely by the palindrome language: unlike an FA (which provably cannot recognize palindromes, see the automata module), a TM solves it in $O(n^2)$ by repeatedly matching and marking symbols from both ends.`,
    pitfall:
      "The extra power comes from writing (unbounded external memory) combined with unrestricted halting, not from bidirectional movement by itself — a two-way *read-only* automaton is still only as powerful as an ordinary one-way DFA.",
    related: ["mit6045-automata-circuit-limitations"],
  },
  {
    id: "mit6045-computability-universal-tm-church-turing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a Universal Turing Machine, and what does the Church-Turing Thesis claim?",
    back: `A **Universal Turing Machine** $U$ takes as input a description of another Turing machine $M$ (encoded as a string $\\langle M \\rangle$) together with an input $w$, and simulates $M$ running on $w$ step by step. Turing proved such a $U$ exists in his founding 1936 paper — without it, every new computational problem would require new hardware, with no concept of "software" at all. A key subtlety: $U$ itself has a *fixed* finite number of states and alphabet symbols, yet it can simulate machines $M$ with arbitrarily many states, because $M$'s full description (states, transitions) is written out on $U$'s tape and interpreted symbol by symbol, rather than being built into $U$'s own state set.

The **Church-Turing Thesis** claims that anything intuitively "computable" — by any reasonable model (RAM machines, cellular automata, etc.) — is computable by *some* Turing machine, because compilers/interpreters can be written to translate between any such model and the TM model. It is a claim about the scope of computability itself, not a theorem provable within any one formal system, which is part of why its exact status (a claim about physics? about human reasoning? about mathematics?) remains debated even as its practical content is universally accepted.`,
    related: ["mit6045-computability-tm-informal-model"],
  },
  {
    id: "mit6045-computability-diagonalization-uncomputable-problems",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why must uncomputable problems exist, purely by a cardinality argument (no specific problem required)?",
    back: `**Turing machines are countable**: each TM has a *finite* description (a finite set of states and transitions), so all TMs can be "flattened" into finite-length strings and enumerated in order of length — a one-to-one correspondence with $\\mathbb{N}$, the same technique used to show the rationals are countable.

**Problems are uncountable**: define a problem (over inputs from $\\{0,1\\}^*$) as a function mapping every input string to an output bit. Since there are infinitely many input strings, specifying such a function in general requires infinitely many bits — putting the set of all problems in bijection with $[0,1]$'s binary expansions. Cantor's diagonal argument (1880s) shows this set is **uncountable**: given any proposed enumeration $x_1, x_2, x_3, \\ldots$ of reals in $[0,1]$, the number formed by flipping the $n$-th digit of $x_n$ for every $n$ differs from every listed number, so no enumeration can be complete.

Since there are strictly more problems (uncountably many) than Turing machines (countably many) to solve them, **most problems have no algorithm at all** — the set of computable problems is "a tiny island in a huge sea of unsolvability." This existence proof is non-constructive: it guarantees uncomputable problems exist without exhibiting one. The Halting Problem (undecidability of $\\text{Acc}_{TM}$, see related card) is the classical *specific*, constructive example — and its proof technique, not coincidentally, is itself a diagonalization argument.`,
    pitfall:
      "This cardinality argument only proves existence — it says nothing about whether any particular problem you care about (like 'does this program halt?') is among the uncomputable ones. That requires a separate, constructive proof, which is exactly what the Acc_TM/Halt_TM diagonalization proofs supply.",
    related: ["mit6045-computability-acc-tm-undecidable", "mit6045-automata-countable-vs-uncountable-languages"],
  },
  {
    id: "mit6045-computability-decide-vs-recognize",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What's the precise distinction between a TM 'recognizing' and 'deciding' a language, and how do the two language classes relate?",
    back: `Assume every TM has designated states $q_{acc}$ and $q_{rej}$. TM $M$ **recognizes** language $L$ if $L = \\{w \\mid M \\text{ on } w \\text{ reaches } q_{acc}\\}$ — words in $L$ lead to acceptance, but words *not* in $L$ may either reach $q_{rej}$ **or loop forever**. TM $M$ **decides** $L$ if additionally $M$ *always halts* (reaches $q_{acc}$ or $q_{rej}$ on every input) — so words not in $L$ must reach $q_{rej}$, never loop.

$L$ is **Turing-recognizable** if some TM recognizes it; **Turing-decidable** if some TM decides it. Every decidable language is recognizable (trivially), but not conversely — the two classes are genuinely different, and $\\text{Acc}_{TM}$ (recognizable but not decidable, see related card) is the standard witness.

**Theorem**: $L$ is Turing-decidable **iff** both $L$ and its complement $L^c$ are Turing-recognizable. ($\\Rightarrow$: decidability gives you a decider for $L$, and swapping $q_{acc}$/$q_{rej}$ decides $L^c$ too, so both are recognizable. $\\Leftarrow$: given $M_1$ recognizing $L$ and $M_2$ recognizing $L^c$, run both **in parallel** on a 2-tape machine — one of them is guaranteed to accept, since every string is in exactly one of $L, L^c$, and you can't just run them sequentially because the first one might loop forever.) This gives four possible classifications for any language $L$: decidable (both $L,L^c$ recognizable), recognizable-only, co-recognizable-only, or neither — all four actually occur.`,
    pitfall:
      "A machine that recognizes L is not automatically wrong on strings outside L — it may correctly loop forever on them. The failure mode to watch for is treating 'doesn't halt' as equivalent to 'rejects': a recognizer can be completely correct about L while never producing an answer on non-members.",
    related: ["mit6045-computability-recursively-enumerable", "mit6045-computability-acc-tm-undecidable"],
  },
  {
    id: "mit6045-computability-recursively-enumerable",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is an enumerator, and why is 'recursively enumerable' exactly equivalent to 'Turing-recognizable'?",
    back: `An **enumerator** is a TM variant with a work tape and a separate output tape, no accept/reject states, starting with a blank work tape (no input). It runs forever, periodically entering a special print state that copies its work-tape contents (up to the first blank) to the output tape followed by a separator, then continues. $L(E) = \\{x \\mid x \\text{ is eventually printed by } E\\}$; if some enumerator prints exactly $L$ (possibly with repeats, possibly infinitely many strings), $L$ is **recursively enumerable (r.e.)**.

**Theorem**: $L$ is r.e. **iff** $L$ is Turing-recognizable. ($\\Leftarrow$, enumerator from recognizer) Given TM $M$ recognizing $L$: simulate $M$ on *every* possible input, but not sequentially (an early input might loop forever and starve the rest) — instead **dovetail**: run 1 step on input 1, then 2 steps each on inputs 1–2, then 3 steps each on inputs 1–3, and so on, running more steps on more inputs as time goes on. Whenever a simulated run reaches $q_{acc}$, print that input. Every accepting computation eventually gets enough simulated steps to complete, so every string in $L$ eventually gets printed. ($\\Rightarrow$, recognizer from enumerator) Given enumerator $E$ for $L$: on input $x$, simulate $E$, and accept the moment $E$ prints $x$ (loop forever if it never does) — this recognizes exactly $L(E) = L$.

Dovetailing is the general technique for correctly running **infinitely many** potentially-nonterminating computations "in parallel" on a single-threaded TM — it recurs throughout computability theory anywhere you need to search an infinite space without letting one bad branch block progress on the rest.`,
    pitfall:
      "Simulating inputs sequentially (finish input 1 fully, then input 2, ...) is broken here — if input 1's simulation loops forever, no later input ever gets a turn. Dovetailing (bounded steps per round, across a growing prefix of inputs) is what makes the construction actually work.",
    related: ["mit6045-computability-decide-vs-recognize"],
  },
  {
    id: "mit6045-computability-encoding-machines-as-strings",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does encoding graphs, DFAs, and TMs as strings let a Turing machine 'compute on' them — and why are DFA-domain questions decidable while the analogous TM-domain questions aren't?",
    back: `A TM only ever computes on strings, but many interesting questions are about other objects (graphs, automata, other TMs). The fix: fix a standard encoding scheme mapping each object to a bit string, e.g. a graph $G=(V,E)$ as a list of vertices (positive integers) and a list of edge pairs, written $\\langle G \\rangle$; a DFA $M = (Q, \\Sigma, \\delta, q_0, F)$ as its full 5-tuple written out with standard names, written $\\langle M \\rangle$. A property of the underlying object then becomes a *language* of encoded strings — e.g. $\\{\\langle G \\rangle \\mid G \\text{ has a cycle}\\}$ — and asking whether that property is decidable becomes an ordinary question about Turing-decidability.

Under this scheme, essentially **every** natural question about DFAs, NFAs, and regular expressions turns out to be Turing-decidable — emptiness ($L(M) = \\emptyset$?), equivalence ($L(M_1) = L(M_2)$?), acceptance ($w \\in L(M)$?) — because DFAs are themselves finite objects with only finitely much reachable structure to search (e.g. emptiness reduces to graph reachability from the start state). The moment the *domain* switches from DFAs to full Turing machines, this breaks down: $\\text{Acc}_{TM} = \\{\\langle M, w \\rangle \\mid M \\text{ is a TM and } M \\text{ accepts } w\\}$ and $\\text{Halt}_{TM} = \\{\\langle M, w \\rangle \\mid M \\text{ halts on } w\\}$ are both undecidable (see related card) — because unlike a DFA, a TM's behavior on an input cannot in general be predicted without actually running it, and running it might never terminate.`,
    pitfall:
      "The word 'decidable' silently changes meaning depending on the encoded domain — decidability results about DFAs (a finite, fully-searchable object) do not transfer to the analogous questions about Turing machines (whose behavior is only bounded by actually running them, possibly forever).",
    related: ["mit6045-computability-acc-tm-undecidable"],
  },
  {
    id: "mit6045-computability-acc-tm-undecidable",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Walk through the diagonalization proof that Acc_TM = {⟨M,w⟩ | M accepts w} is Turing-recognizable but not Turing-decidable.",
    back: `**Recognizable**: the universal TM $U$, on input $\\langle M, w \\rangle$, simulates $M$ on $w$ and accepts/rejects to match — accepting exactly the pairs where $M$ accepts $w$. But $U$ doesn't *decide* $\\text{Acc}_{TM}$: if $M$ loops forever on $w$, $U$ loops forever too, never reaching $q_{rej}$.

**Not decidable — proof by contradiction (diagonalization)**: suppose TM $H$ decides $\\text{Acc}_{TM}$: $H(\\langle M, w\\rangle)$ accepts if $M$ accepts $w$, rejects if $M$ rejects $w$ **or loops** on $w$. Restrict to the special case where $M$ is run on *its own description*: define $H'(\\langle M \\rangle)$ to accept if $M$ accepts $\\langle M \\rangle$, reject otherwise (just $H$ run on the pair $\\langle M, \\langle M \\rangle \\rangle$). Now define the **diagonal machine** $D$ to do the *opposite* of $H'$: $D(\\langle M \\rangle)$ rejects if $M$ accepts $\\langle M \\rangle$, accepts if $M$ rejects or loops on $\\langle M \\rangle$.

The punchline: run $D$ on its **own** description, $D(\\langle D \\rangle)$. By $D$'s definition, $D(\\langle D \\rangle)$ accepts iff $D$ does **not** accept $\\langle D \\rangle$ — a direct contradiction. So no such $H$ can exist: $\\text{Acc}_{TM}$ is not Turing-decidable. (Visualize this as a matrix with TMs labeling both rows and columns, entry $(M, M')$ recording whether $M$ accepts $\\langle M' \\rangle$; $D$ is built to disagree with every diagonal entry $M(\\langle M \\rangle)$, so $D$ itself can't appear anywhere in the enumeration — the same shape as Cantor's proof that the reals are uncountable.)

**Corollary**: $(\\text{Acc}_{TM})^c$ is not Turing-recognizable — if it were, then by the recognizable-iff-decidable-with-complement theorem (see related card), $\\text{Acc}_{TM}$ itself would be decidable, contradiction.`,
    pitfall:
      "The contradiction comes specifically from asking what D(⟨D⟩) does — plugging a machine into its own description. Skipping straight to 'D accepts iff D rejects' without first establishing H' (the restriction to self-application) and D (the negation of H') loses the actual mechanism of the proof.",
    related: ["mit6045-computability-decide-vs-recognize", "mit6045-computability-recursion-theorem-application"],
  },
  {
    id: "mit6045-computability-halt-tm-reduction",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the undecidability of Halt_TM follow from Acc_TM's undecidability via reduction, without a fresh diagonalization?",
    back: `$\\text{Halt}_{TM} = \\{\\langle M, w \\rangle \\mid M \\text{ halts (accepts or rejects) on } w\\}$ — note Sipser's terminology: what this course calls $\\text{Acc}_{TM}$, Sipser's textbook itself calls "the halting problem," while $\\text{Halt}_{TM}$ is its own separate language.

Rather than diagonalizing again, **reduce** $\\text{Acc}_{TM}$ to $\\text{Halt}_{TM}$: suppose TM $R$ decides $\\text{Halt}_{TM}$. Build $S$ to decide $\\text{Acc}_{TM}$: on input $\\langle M, w \\rangle$, first run $R$ on $\\langle M, w \\rangle$ — by definition $R$ always halts, so this always terminates. If $R$ rejects (meaning $M$ loops on $w$), $S$ rejects. If $R$ accepts (meaning $M$ definitely halts on $w$, one way or the other), it's now *safe* to simulate $M$ on $w$ directly — the simulation is guaranteed to terminate — and $S$ accepts or rejects to match $M$'s actual verdict.

$S$ correctly decides $\\text{Acc}_{TM}$ in all three cases (M accepts w, M rejects w, M loops on w) — but $\\text{Acc}_{TM}$ is known undecidable, so no such $R$ can exist: $\\text{Halt}_{TM}$ is undecidable too. This is the **reduction** technique: to show a new language $B$ is undecidable, show that a decider for $B$ could be used to build a decider for a language ($A$) already known to be undecidable — since deciding $A$ is impossible, deciding $B$ must be too. It's a far more efficient tool than re-running a diagonalization argument from scratch for every new undecidable language, and it's the technique used throughout the rest of computability theory (and later, in complexity theory, for NP-hardness proofs).`,
    pitfall:
      "The reduction direction matters: you assume a decider for the *new* language exists and use it to build a decider for a *known-undecidable* language — not the other way around. Building a decider for Halt_TM out of a decider for Acc_TM would prove nothing about Halt_TM's own decidability.",
    related: ["mit6045-computability-acc-tm-undecidable", "mit6045-computability-reduction-template"],
  },
  {
    id: "mit6045-computability-reduction-template",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What's the general 'construct M′ that behaves like M on w' reduction template, and how does it prove Empty_TM, Reg_TM, and EQ_TM are all undecidable?",
    back: `A recurring reduction shape: given $\\langle M, w \\rangle$, algorithmically construct a **new machine** $M'_{M,w}$ (hard-coding $M$ and $w$ into $M'$'s own description) whose language-level behavior encodes whether $M$ accepts $w$ — then ask a decider for the *target* property about $M'$ instead.

- $\\text{Empty}_{TM} = \\{\\langle M \\rangle \\mid L(M) = \\emptyset\\}$: let $M'_{M,w}$, on any input $x$, ignore $x$ and simulate $M$ on $w$. Then $M$ accepts $w$ $\\iff$ $M'_{M,w}$ accepts *everything* $\\iff$ $L(M'_{M,w}) \\neq \\emptyset$. A decider for $\\text{Empty}_{TM}$ applied to $\\langle M'_{M,w} \\rangle$ (with the answer flipped) decides $\\text{Acc}_{TM}$ — contradiction.
- $\\text{Reg}_{TM} = \\{\\langle M \\rangle \\mid L(M) \\text{ is regular}\\}$: let $M'_{M,w}$, on input $x$, accept immediately if $x$ has the form $0^n1^n$; otherwise simulate $M$ on $w$ and accept iff $M$ does. If $M$ accepts $w$, $M'_{M,w}$ accepts *everything* (regular). If $M$ doesn't, $M'_{M,w}$ accepts *exactly* $\\{0^n1^n\\}$ (provably non-regular, via the Pumping Lemma). So $M$ accepts $w$ $\\iff$ $L(M'_{M,w})$ is regular — reducing $\\text{Acc}_{TM}$ to $\\text{Reg}_{TM}$.
- $\\text{EQ}_{TM} = \\{\\langle M_1, M_2\\rangle \\mid L(M_1) = L(M_2)\\}$: reduce from $\\text{Empty}_{TM}$ instead — fix any machine $M_\\emptyset$ accepting nothing, and ask a decider for $\\text{EQ}_{TM}$ whether $\\langle M, M_\\emptyset \\rangle \\in \\text{EQ}_{TM}$, i.e. whether $L(M) = \\emptyset$.

The pattern generalizes to almost any nontrivial semantic property of $L(M)$ — a fact **Rice's Theorem** later makes precise and general-purpose (see related card), so these three no longer need to be proved one at a time.`,
    pitfall:
      "The constructed M' must be buildable algorithmically from M and w by the reducing machine itself — it isn't enough that M' 'exists' abstractly; S has to actually be able to write out ⟨M'_{M,w}⟩ as a step in its own computation, which is why these proofs always show M' as simulatable code, not just an existence claim.",
    related: ["mit6045-computability-halt-tm-reduction", "mit6045-computability-rices-theorem"],
  },
  {
    id: "mit6045-computability-post-correspondence-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the Post Correspondence Problem, and why does its undecidability proof require a different reduction strategy than the TM-property proofs?",
    back: `Given a finite set of **tile types**, each a pair of strings stacked top/bottom (e.g. $\\begin{pmatrix}a\\\\ab\\end{pmatrix}$, $\\begin{pmatrix}ca\\\\ab\\end{pmatrix}$, $\\begin{pmatrix}b\\\\c\\end{pmatrix}$, $\\begin{pmatrix}bd\\\\d\\end{pmatrix}$), is there a nonempty finite sequence of tiles (repeats allowed, not necessarily using every type) such that concatenating all the top strings equals concatenating all the bottom strings? Such a sequence is a **match**. $\\text{PCP} = \\{\\langle T \\rangle \\mid T \\text{ is a tile set that has a match}\\}$.

This is the course's first undecidable problem stated **without any reference to Turing machines** — a pure string-matching puzzle. The proof still reduces from $\\text{Acc}_{TM}$, but the reduction has to do fundamentally different work than the earlier TM-property reductions: instead of constructing a *new Turing machine* whose behavior encodes an answer, it must encode an entire **computation history** of $M$ running on $w$ (the full sequence of tape configurations from start to acceptance) as a sequence of tile strings, engineered so that a valid PCP match exists exactly when that computation history is a genuine accepting run. Building and verifying such an encoding is intricate enough that the course's actual proof takes multiple lecture passes (an initial attempt, a detour through the more constrained "Modified PCP" where the match must start with a specific first tile, then relating MPCP back to unrestricted PCP) rather than a single direct construction.

The result matters because it shows undecidability isn't a phenomenon confined to questions *about* machines — it can appear in an ordinary combinatorial puzzle with no TM syntax anywhere in its statement, once encodings are chosen adversarially enough.`,
    related: ["mit6045-computability-reduction-template"],
  },
  {
    id: "mit6045-computability-mapping-reducibility-formal",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the formal definition of mapping reducibility (≤m), and what do its two basic preservation theorems say?",
    back: `A function $f: \\Sigma_1^* \\to \\Sigma_2^*$ is **computable** if some TM, on every input $w$, halts with exactly $f(w)$ on its tape (using a variant with a single $q_{halt}$ state instead of separate accept/reject). Language $A \\subseteq \\Sigma_1^*$ is **mapping-reducible** to $B \\subseteq \\Sigma_2^*$, written $A \\leq_m B$, if there's a computable $f$ such that for every string $w$: $w \\in A \\iff f(w) \\in B$. This is exactly the abstract shape every earlier reduction already had — e.g. $\\text{Acc}_{TM} \\leq_m \\text{Empty}_{TM}^c$ via $f(\\langle M, w\\rangle) = \\langle M'_{M,w}\\rangle$ from the reduction-template card.

**Theorem**: if $A \\leq_m B$ and $B$ is Turing-decidable, then $A$ is Turing-decidable. (Decide $w \\in A$ by computing $f(w)$, then running $B$'s decider on it.) **Corollary**: if $A \\leq_m B$ and $A$ is undecidable, $B$ is undecidable. **Theorem**: if $A \\leq_m B$ and $B$ is Turing-recognizable, then $A$ is Turing-recognizable (same construction, but $B$'s recognizer may loop — that's fine, since a recognizer for $A$ is allowed to loop too). **Corollary**: if $A \\leq_m B$ and $A$ is not recognizable, $B$ isn't either.

Two structural facts make chaining reductions painless: $A \\leq_m B \\iff A^c \\leq_m B^c$ (same $f$ works, since it's an iff), and $\\leq_m$ is transitive (compose the two computable functions) — e.g. having shown $\\text{Acc}_{TM} \\leq_m \\text{MPCP}$ and $\\text{MPCP} \\leq_m \\text{PCP}$ separately, transitivity immediately gives $\\text{Acc}_{TM} \\leq_m \\text{PCP}$ without redoing the encoding.`,
    pitfall:
      "≤m only ever transfers undecidability/non-recognizability *forward* along the arrow (from the known-hard language to the new one) or decidability/recognizability *backward* — it never goes both directions for a single fact. Mixing up which language is assumed easy and which is being proven hard inverts the whole argument.",
    related: ["mit6045-computability-reduction-template", "mit6045-computability-mapping-reducibility-non-recognizability"],
  },
  {
    id: "mit6045-computability-mapping-reducibility-non-recognizability",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Using ≤m, show EQ_TM is neither Turing-recognizable nor co-Turing-recognizable.",
    back: `$\\text{EQ}_{TM} = \\{\\langle M_1, M_2\\rangle \\mid L(M_1) = L(M_2)\\}$ — practically important (comparing program versions, checking a compiler optimization preserves behavior).

**Not recognizable**: show $\\text{Acc}_{TM} \\leq_m (\\text{EQ}_{TM})^c$. Define $f(\\langle M, w\\rangle) = \\langle M_1, M_2\\rangle$ where $M_1$ always rejects (so $L(M_1) = \\emptyset$) and $M_2$ ignores its own input, runs $M$ on $w$, and accepts iff $M$ does. If $M$ accepts $w$: $M_2$ accepts everything, so $L(M_1) \\neq L(M_2)$, so $\\langle M_1,M_2\\rangle \\in (\\text{EQ}_{TM})^c$. If $M$ doesn't accept $w$: $M_2$ accepts nothing, so $L(M_1) = L(M_2) = \\emptyset$, so $\\langle M_1,M_2\\rangle \\notin (\\text{EQ}_{TM})^c$. This is exactly the $\\iff$ mapping-reducibility requires, and $f$ is clearly computable — so $\\text{Acc}_{TM} \\leq_m (\\text{EQ}_{TM})^c$. Since $(\\text{Acc}_{TM})^c$ is not recognizable, and $A \\leq_m B \\iff A^c \\leq_m B^c$ gives $(\\text{Acc}_{TM})^c \\leq_m \\text{EQ}_{TM}$, the non-recognizability transfers: $\\text{EQ}_{TM}$ is not Turing-recognizable.

**Complement not recognizable either**: symmetric construction — let $M_1$ accept *everything* instead of nothing, keep $M_2$ as before. Now $M$ accepts $w$ $\\iff$ $L(M_1) = L(M_2) = \\Sigma^*$ $\\iff$ $\\langle M_1,M_2\\rangle \\in \\text{EQ}_{TM}$, giving $\\text{Acc}_{TM} \\leq_m \\text{EQ}_{TM}$ directly, which (via the same complement rule) transfers non-recognizability to $(\\text{EQ}_{TM})^c$.

So $\\text{EQ}_{TM}$ sits in the fourth, strictly-hardest classification bucket from the decide-vs-recognize card: neither it nor its complement is even recognizable.`,
    pitfall:
      "The two directions need genuinely different constructions (M1 rejects-everything vs. M1 accepts-everything) — reusing the same f for both 'EQ_TM not recognizable' and '(EQ_TM)^c not recognizable' silently proves the same thing twice instead of covering both halves of the classification.",
    related: ["mit6045-computability-mapping-reducibility-formal"],
  },
  {
    id: "mit6045-computability-rices-theorem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does Rice's Theorem say, and what distinguishes the 'properties of L(M)' it covers from properties it does NOT cover?",
    back: `A set of languages $P$ is a **nontrivial property of Turing-recognizable languages** if some TM $M_1$ has $L(M_1) \\in P$ and some TM $M_2$ has $L(M_2) \\notin P$ — i.e. $P$ is neither vacuously true of every recognizable language nor vacuously false of all of them.

**Rice's Theorem**: for any such nontrivial property $P$, the language $M_P = \\{\\langle M \\rangle \\mid L(M) \\in P\\}$ is undecidable. Informally: **any nontrivial property of the language a TM recognizes is undecidable** — this single theorem subsumes $\\text{Empty}_{TM}$, $\\text{Reg}_{TM}$, $\\text{Acc01}_{TM}$, "$L(M)$ is finite," "$L(M)$ contains some palindrome," and countless others, all proved individually earlier, without needing a fresh reduction for each.

The crucial restriction is "property of $L(M)$" — a **semantic** property, depending only on which strings $M$ accepts, not on $M$'s internal machinery. Rice's Theorem says nothing about **syntactic** properties of the machine's description itself: "$M$ never moves left off the tape's left end" or "$M$ has more than 20 states" are properties of $M$ as an object, decidable by direct inspection of $\\langle M \\rangle$ (just read off the transition table) — completely different in kind from asking what language $M$ recognizes, which in general requires reasoning about $M$'s behavior on infinitely many inputs.`,
    pitfall:
      "Rice's Theorem applies only to semantic properties of L(M) (what strings get accepted), never to syntactic properties of the machine description (state count, tape-movement patterns, presence of a particular instruction) — conflating the two is the most common misapplication of the theorem.",
    related: ["mit6045-computability-reduction-template", "mit6045-computability-mapping-reducibility-formal"],
  },
  {
    id: "mit6045-computability-self-referencing-programs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why doesn't the self-referencing program P3 = 'obtain ⟨P3⟩, run P3 on w, output one more than the result' produce a logical contradiction?",
    back: `Consider programs that obtain their **own description** and use it: $P_1$ = "obtain $\\langle P_1 \\rangle$, output $\\langle P_1 \\rangle$" simply prints its own source — the simplest self-referencing program. $P_2$, on input $w$: if $w = \\varepsilon$ output 0; else obtain $\\langle P_2\\rangle$, run $P_2$ recursively on $\\text{tail}(w)$, and output one more than that result — this computes $|w|$, using the same recursive style as Lisp/Scheme, under the assumption that once you have a machine's representation you can simulate it.

Now $P_3$, on input $w$: obtain $\\langle P_3 \\rangle$, run $P_3$ **on $w$ itself** (not a shrinking argument like \`tail(w)\`), and output one more than the result. This looks paradoxical: if $P_3(w)$ outputs $n$, then by definition it should also output $n+1$. But there's no contradiction, because under the **usual semantics of recursive calls**, the inner call to $P_3(w)$ never terminates (it calls itself on the *same* input forever, with no base case to stop the recursion) — so $P_3$ simply never halts on any input. $P_3$ computes the **partial function that's undefined everywhere**, not a contradictory total function.

This is the same resolution as the Recursion Theorem more generally (see related card): self-reference is a legitimate, well-defined programming construct exactly because "obtain my own description" behaves like an ordinary (if unusual) recursive call, with the same termination behavior recursive calls always have — it grants no magic escape from normal computability limits.`,
    pitfall:
      "The apparent paradox in P3 evaporates once you notice it lacks a base case — P1 and P2 both terminate (P1 immediately, P2 by recursing on a strictly shorter tail(w) with an explicit ε base case), while P3 recurses on the same w forever, so 'P3(w) = n and also n+1' is vacuously consistent: neither ever gets computed.",
    related: ["mit6045-computability-recursion-theorem"],
  },
  {
    id: "mit6045-computability-recursion-theorem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the Recursion Theorem precisely, and explain how it justifies 'obtain my own description' as a legitimate primitive.",
    back: `**Recursion Theorem** (Sipser Theorem 6.3): let $T$ be a TM computing a (possibly partial) 2-argument function $t: \\Sigma^* \\times \\Sigma^* \\to \\Sigma^*$. Then there exists another TM $R$ computing the 1-argument function $r: \\Sigma^* \\to \\Sigma^*$ defined by $r(w) = t(\\langle R \\rangle, w)$ for every $w$.

Read $T$'s first argument as "the description of some arbitrary machine $M$," so $T$ computes $t(\\langle M\\rangle, w)$ for any $M$ you plug in. The theorem says: there's a specific machine $R$ that behaves exactly like $T$ does when its first argument is fixed to $\\langle R \\rangle$ — **$R$'s own description**. This is precisely "self-reference" made rigorous: instead of trying to write a program that magically obtains its own source code, you write an ordinary 2-input machine $T$ that would compute the right thing *if* it had its own description as the first argument, and the Recursion Theorem guarantees a machine $R$ exists realizing exactly that.

Worked example: $P_2$ (computing $|w|$, from the related card) corresponds to $T_2(\\langle M\\rangle, w)$ = "if $w=\\varepsilon$ output 0, else run $M$ on $\\text{tail}(w)$ and output one more" — a well-defined 2-input TM for *any* choice of $M$ plugged into the first slot. The Recursion Theorem's $R$ for this $T_2$ is exactly $P_2$ itself. The overall message: adding "know and use your own description" as a capability doesn't extend the basic Turing-machine model at all — every self-referencing machine built this way is provably equivalent to an ordinary TM with no self-reference, just one whose construction happens to go through this theorem.`,
    related: ["mit6045-computability-self-referencing-programs", "mit6045-computability-recursion-theorem-application"],
  },
  {
    id: "mit6045-computability-recursion-theorem-application",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Use the Recursion Theorem to give a second, self-reference-based proof that Acc_TM is undecidable.",
    back: `Suppose for contradiction that TM $D$ decides $\\text{Acc}_{TM}$. Construct $R$, using the Recursion Theorem to legitimately obtain its own description, defined on input $w$: obtain $\\langle R \\rangle$ (guaranteed possible by the theorem), run $D$ on $\\langle R, w\\rangle$, and do the **opposite** of what $D$ says — if $D$ accepts $\\langle R,w\\rangle$, reject; if $D$ rejects, accept.

(Formally, this $R$ is produced by applying the theorem to the 2-input machine $T(\\langle M\\rangle, w)$ = "run $D$ on $\\langle M, w\\rangle$; do the opposite," so that $R$'s behavior on $w$ is exactly $T(\\langle R\\rangle, w)$.)

Now derive the contradiction directly from $R$'s own definition, on any input $w$: if $R$ accepts $w$, then (since $D$ decides $\\text{Acc}_{TM}$ correctly) $D$ must have accepted $\\langle R, w\\rangle$ — but $R$ was built to reject whenever $D$ accepts. Contradiction. If $R$ doesn't accept $w$, then $D$ rejected $\\langle R, w\\rangle$ — but $R$ was built to accept whenever $D$ rejects. Contradiction either way. So $D$ cannot exist: $\\text{Acc}_{TM}$ is undecidable.

Compare this to the direct diagonalization proof (related card): there, $D$ (the diagonal machine) is built from $H'$ and evaluated at $\\langle D \\rangle$ by hand, constructing the self-application explicitly. Here, the Recursion Theorem packages "build a machine that can refer to its own description" as a reusable black box, so the proof skips straight to deriving the contradiction from $R$'s behavior — the same underlying idea, but with the self-reference machinery abstracted out instead of hand-rolled each time.`,
    pitfall:
      "This isn't a fundamentally different proof from the earlier diagonalization — the Recursion Theorem is itself proved using essentially the same self-reference construction. Treating this as independent confirmation of Acc_TM's undecidability, rather than the same underlying mechanism viewed through reusable machinery, misses the point of introducing the theorem.",
    related: ["mit6045-computability-recursion-theorem", "mit6045-computability-acc-tm-undecidable"],
  },
];
