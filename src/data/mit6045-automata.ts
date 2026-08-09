// MIT 6.045J / 18.400J (Spring 2011) — Lectures 1-5: Introduction, Boolean
// circuits, finite automata, and regular languages. Course-specific formal
// notation (5-tuple DFA/NFA definitions, pigeonhole-based non-regularity
// proofs, the Pumping Lemma) that the generic curriculum's string-algorithms
// module doesn't cover at all — automata/formal-language theory is genuinely
// new territory here, not a reframing of existing content. See
// src/data/courses.ts for how this module fits into the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6045-automata";

export const mit6045AutomataCards: Card[] = [
  {
    id: "mit6045-automata-rules-based-framing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What throughline does 6.045 use to frame 'theoretical computer science' across its whole syllabus?",
    back: `The course frames CS as the study of **simple, well-defined sets of rules** and a meta-question asked about them: given this fixed set of operations, what can and can't be built? Each model the course studies is a different choice of rules — Boolean circuits (AND/OR/NOT gates, no loops), finite automata (a fixed number of states, one pass over the input), Turing machines (unbounded tape, unrestricted loops) — and the throughline is watching the same two questions recur at every level: what's *constructible* from these rules, and once you step back and ask *meta*-questions about the rules themselves, what are their fundamental limits?

An early illustration predating any of the formal machines: **Euclid's GCD algorithm** reduces GCD(A, B) to GCD(B mod A, A), repeatedly, which terminates because $(B \\bmod A) < B/2$ guarantees exponential shrinkage — an efficient algorithm built from a simple rule (repeated remainder-taking) centuries before "algorithm" had a formal definition. See the related card for the general-purpose GCD/LCM computation this same idea produces.`,
    related: ["number-theory-gcd-lcm"],
  },
  {
    id: "mit6045-automata-boolean-circuits",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In 6.045's circuit model, what makes NAND 'universal', and what's a monotone Boolean function?",
    back: `A **circuit** is built from logic gates (NOT, AND, OR, and derived gates like NAND, XOR) with no loops or feedback — it's a DAG from input variables to a single output. Any AND gate can be built from OR and three NOT gates via **De Morgan's law** ($\\overline{A \\land B} = \\overline{A} \\lor \\overline{B}$, negated again), and conversely OR from AND+NOT — so $\\{$AND, OR, NOT$\\}$ is redundant as a basis.

**NAND is universal**: every Boolean function can be built from NAND gates alone, since NOT, AND, and OR are each expressible using only NAND. Not every gate set has this property — $\\{$AND, OR$\\}$ alone can only build **monotone** functions (flipping any input from 0→1 never flips the output from 1→0; equivalently, an all-1s input can never map to 0), and $\\{$XOR, NOT$\\}$ alone can only build *linear* (affine) functions, since XOR/NOT composition is closed under linearity — neither basis can express AND or OR.`,
    pitfall:
      "Monotonicity is a property of the *function*, not of any specific circuit for it — the claim is that AND/OR-only circuits can never compute a non-monotone function, not that every monotone function happens to have an obvious AND/OR circuit.",
    related: ["mit6045-automata-circuit-limitations"],
  },
  {
    id: "mit6045-automata-circuit-limitations",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Why does 6.045 introduce finite automata as a response to circuits' limitations, specifically?",
    back: `Circuits have three structural limitations as a general model of computation: **no memory** (no state carried between gate evaluations), **no feedback** (a gate's output can never loop back as another gate's input), and — the one the course foregrounds — **fixed input size**: a circuit computes one specific function on inputs of one specific length, so "sort 100 numbers" and "sort 1000 numbers" require two entirely different circuits. There's no single circuit that handles arbitrary-length input.

A **finite automaton** fixes exactly this: it's *one* machine, with a fixed finite number of states, that processes an input tape of *any* length by reading it once symbol-by-symbol and updating its current state, finally accepting or rejecting based on the state reached at the end. The trade only shows up later (Lecture 5): unlike circuits, whose limitations are about what's *representable at all* for a fixed size, an FA's limitation is about memory — a fixed number of states can only "remember" a bounded amount about the input seen so far, which is exactly what the Pumping Lemma formalizes.`,
    related: ["mit6045-automata-dfa-formal-definition"],
  },
  {
    id: "mit6045-automata-dfa-formal-definition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the formal 5-tuple definition of a DFA, and when is a string 'accepted'?",
    back: `A **deterministic finite automaton (DFA)** is a 5-tuple $M = (Q, \\Sigma, \\delta, q_0, F)$:
- $Q$: a finite set of states
- $\\Sigma$: a finite alphabet of input symbols
- $\\delta: Q \\times \\Sigma \\to Q$: the transition function (current state + symbol → next state)
- $q_0 \\in Q$: the start state
- $F \\subseteq Q$: the set of accepting (final) states

Extend $\\delta$ to strings via $\\delta^*: Q \\times \\Sigma^* \\to Q$, defined recursively: $\\delta^*(q, \\varepsilon) = q$ and $\\delta^*(q, wa) = \\delta(\\delta^*(q, w), a)$ — read the string one symbol at a time, updating state each step. A string $w$ is **accepted** if $\\delta^*(q_0, w) \\in F$, and **rejected** otherwise. $L(M) = \\{w \\mid w \\text{ is accepted by } M\\}$ is the **language recognized by** $M$; a language is **regular** (or **FA-recognizable**) if some DFA recognizes it.

$\\delta$ being a *total function* (exactly one next state per state/symbol pair, no gaps) is what makes DFAs deterministic — at every point in reading the input, there's exactly one possible current state, never a choice and never a dead end (missing transitions are conventionally routed to an implicit trap state).`,
    pitfall:
      "δ must be defined for every (state, symbol) pair — a DFA diagram that 'omits' some arrows isn't leaving them undefined, it's using the convention that missing transitions go to an implicit non-accepting trap state you can't leave.",
    related: ["mit6045-automata-nfa-formal-definition"],
  },
  {
    id: "mit6045-automata-nfa-formal-definition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does an NFA's formal definition differ from a DFA's, and what does it mean for an NFA to 'accept' a string?",
    back: `A **nondeterministic finite automaton (NFA)** is also a 5-tuple $(Q, \\Sigma, \\delta, q_0, F)$, but with two generalizations to $\\delta$:
- $\\delta: Q \\times \\Sigma_\\varepsilon \\to \\mathcal{P}(Q)$, where $\\Sigma_\\varepsilon = \\Sigma \\cup \\{\\varepsilon\\}$ — the transition function's *result* is a **set** of states (possibly empty, possibly more than one), not a single state.
- Transitions can be labeled $\\varepsilon$ ("**epsilon-transitions**"): the machine may move between states **for free**, without consuming any input symbol.

Define $E(q)$ = the set of states reachable from $q$ using zero or more $\\varepsilon$-moves (including $q$ itself). Computation from a string $w$ can be viewed as a tree of all possible branches (each nondeterministic choice and each optional $\\varepsilon$-move forks the tree); the NFA **accepts** $w$ if **some** path through that tree — consuming exactly $w$, interspersed with any number of free $\\varepsilon$-moves — ends in an accepting state. (Paths that get stuck, with no legal move on the next input symbol or $\\varepsilon$, simply don't count; they aren't rejections of the whole string, just dead branches.)`,
    code: `# δ*(q, w): the SET of states reachable from q after reading w
def delta_star(q, w):
    S = E(q)                       # start: everywhere reachable via ε alone
    for a in w:
        S = union(E(r2) for r in S for r2 in delta(r, a))
    return S
# Accept iff delta_star(q0, w) ∩ F is nonempty`,
    pitfall:
      "An NFA path that runs out of legal moves partway through the input is a dead end, not a rejection — the whole string is only rejected if *every* possible path (including every choice of when to take ε-moves) either dies early or ends in a non-accepting state.",
    related: ["mit6045-automata-dfa-formal-definition", "mit6045-automata-nfa-to-dfa-subset-construction"],
  },
  {
    id: "mit6045-automata-nfa-to-dfa-subset-construction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the subset construction prove NFAs and DFAs recognize exactly the same class of languages, and why doesn't nondeterminism add power?",
    back: `**Theorem**: every NFA-recognizable language is DFA-recognizable (the converse is immediate — a DFA is trivially an NFA with singleton transitions and no $\\varepsilon$-edges). Given NFA $M_1 = (Q_1, \\Sigma, \\delta_1, q_{01}, F_1)$, construct an equivalent DFA $M_2 = (Q_2, \\Sigma, \\delta_2, q_{02}, F_2)$ where **each state of $M_2$ is a set of states of $M_1$**:
- $Q_2 = \\mathcal{P}(Q_1)$ — one DFA state per possible *subset* of NFA states.
- $q_{02} = E(q_{01})$ — start where the NFA could be after only $\\varepsilon$-moves.
- $\\delta_2(S, a) = \\bigcup_{r \\in S} E(\\delta_1(r, a))$ — from subset $S$, follow $a$ from every state in $S$, then close under $\\varepsilon$.
- $F_2 = \\{S \\in Q_2 \\mid S \\cap F_1 \\neq \\emptyset\\}$ — accept if the subset contains *any* NFA accepting state.

This tracks, at every step, the **exact set** of states the NFA could simultaneously be in — so $M_2$ deterministically simulates every nondeterministic branch of $M_1$ in parallel. The cost is that an NFA with $N$ states can require a DFA with up to $2^N$ states (one per subset) — nondeterminism buys succinctness (smaller machine descriptions) but not extra recognizing power, since the languages recognized are identical.`,
    pitfall:
      "The 2^N blowup is a worst-case upper bound on description size, not a claim that NFA-recognizable languages are 'weaker' — the whole point of the theorem is that NFAs and DFAs recognize exactly the same class of languages (the regular languages), just sometimes with exponentially different state counts.",
    related: ["mit6045-automata-nfa-formal-definition", "mit6045-automata-regular-expressions"],
  },
  {
    id: "mit6045-automata-regular-expressions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What operators build a regular expression, and what does the regex ⟺ FA-recognizable theorem state?",
    back: `A **regular expression** describes a language using three core operators built from alphabet symbols: **union/alternation** ($R_1 | R_2$, matches either), **concatenation** ($R_1 R_2$, matches $R_1$ then $R_2$ back-to-back), and **Kleene star** ($R^*$, matches zero or more repetitions of $R$, each repetition free to match differently). E.g. $(0|1)1(0|1)0^*$ matches any 3-bit string with a 1 in the middle, followed by any number of 0s; $[(0|1)1(0|1)]^*$ matches any number of such 3-bit blocks concatenated, each independently chosen.

**Theorem** (stated without proof in lecture): a language is expressible by some regular expression **if and only if** it is FA-recognizable (regular) — regular expressions and finite automata are two different-looking descriptions of the exact same class of languages. Example: the FA recognizing "even number of 1s" (a 2-state machine toggling on each 1) corresponds to the regex $0^*(0^*10^*1)^*$ — match any 0s, then any number of (0s, a 1, 0s, a 1) blocks, each such block containing exactly two 1s so the total stays even.`,
    related: ["mit6045-automata-nfa-to-dfa-subset-construction", "mit6045-automata-closure-properties"],
  },
  {
    id: "mit6045-automata-closure-properties",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What closure properties do regular languages have under union, concatenation, star, and complement — and why do these follow constructively from the machine models?",
    back: `The regular languages are closed under every operation the machine models directly support building:
- **Union**: given DFAs/NFAs for $L_1$ and $L_2$, build an NFA with a new start state and $\\varepsilon$-transitions to both old start states — accept if either sub-machine would.
- **Concatenation**: $\\varepsilon$-link every accepting state of $L_1$'s machine to the start state of $L_2$'s machine.
- **Kleene star**: $\\varepsilon$-link every accepting state back to the start state (to allow repetition), and $\\varepsilon$-link the start state directly to an accepting state (to allow zero repetitions, matching $\\varepsilon$).
- **Complement**: only works starting from a **DFA** (not an NFA) — swap accepting and non-accepting states. This requires $\\delta$ to be total (defined on every state/symbol pair, including an explicit trap state) or "the strings that get stuck" would be wrongly excluded from both a language and its complement.
- **Intersection**: follows from De Morgan's law plus closure under union and complement ($L_1 \\cap L_2 = \\overline{\\overline{L_1} \\cup \\overline{L_2}}$), or directly via a **product construction** — build a DFA whose states are pairs $(q_1, q_2)$, one from each machine, run both in lockstep, and accept only when both components accept.

Each proof is constructive — it doesn't just assert closure, it hands you the machine — which is why the regex operators (union, concatenation, star) exactly mirror this list: they're a language for describing the constructions, not a separate discovery.`,
    pitfall:
      "The complement construction needs a *complete* DFA — flipping accept/non-accept states on a machine with missing transitions silently gets intersection and complement wrong, since strings that 'fall off' the machine were implicitly rejected before and would need to become implicitly accepted after, which swapping states alone doesn't do.",
    related: ["mit6045-automata-regular-expressions", "mit6045-automata-dfa-formal-definition"],
  },
  {
    id: "mit6045-automata-pigeonhole-non-regularity",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What's the general pigeonhole-based proof pattern 6.045 uses to show a specific language isn't regular?",
    back: `**Pigeonhole Principle**: if more than $n$ pigeons are placed into $n$ holes, some hole holds at least two pigeons. Applied to non-regularity, by contradiction:

1. Assume language $L$ is regular, so some DFA $M = (Q, \\Sigma, \\delta, q_0, F)$ recognizes it.
2. Choose an infinite family of **pigeons** — strings (or prefixes) that a correct machine would need to distinguish (e.g. all strings in $0^*$: $\\varepsilon, 0, 00, 000, \\ldots$).
3. The **holes** are the (finitely many, $|Q|$) states of $M$. Map each pigeon $p$ to the hole $\\delta^*(q_0, p)$ — the state $M$ is in after reading $p$.
4. Since there are infinitely many pigeons but only $|Q|$ holes, two distinct pigeons $p_i \\neq p_j$ must land in the same hole (same state).
5. Because $M$ is in the same state after reading either one, it must treat them identically on every future suffix — so appending the same suffix $s$ to both, $M$ accepts $p_i s$ iff it accepts $p_j s$.
6. Choose $s$ so that $p_i s \\in L$ but $p_j s \\notin L$ (i.e., the two pigeons *should* be distinguishable) — this is exactly the contradiction, since a real $M$ recognizing $L$ can't accept both.

This is the same machinery underlying the Pumping Lemma (below) — the pumping lemma is essentially this argument made general-purpose so it doesn't have to be re-derived by hand for every new language.`,
    related: ["mit6045-automata-palindrome-non-regular", "mit6045-automata-pumping-lemma-statement"],
  },
  {
    id: "mit6045-automata-palindrome-non-regular",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Walk through the pigeonhole argument that no DFA recognizes the language of palindromes.",
    back: `Suppose DFA $M$ with state set $Q$ recognizes exactly the palindromes over $\\{0,1\\}$. Consider all strings of length $n$ as candidate "first halves" — there are $2^n$ of them, growing without bound, while $M$ has only $|Q|$ (fixed) states.

By pigeonhole, for $n$ large enough there exist two **distinct** first halves $x_1 \\neq x_2$ (each length $n$) that $M$ reaches the **same state** after reading. Build two genuine palindromes from each: $p_1 = x_1 \\cdot \\text{reverse}(x_1)$ and $p_2 = x_2 \\cdot \\text{reverse}(x_2)$ — both are palindromes, so a correct $M$ accepts both.

Now **cross** them: since $M$ is in the same state after $x_1$ and after $x_2$, it must behave identically on any shared suffix — so $M$ also accepts $z = x_1 \\cdot \\text{reverse}(x_2)$ (feed $M$ the state reached after $x_1$, then the suffix $\\text{reverse}(x_2)$ that would correctly continue $x_2$). But $z$ is generally **not** a palindrome (since $x_1 \\neq x_2$), so $M$ incorrectly accepts a non-palindrome — contradiction. No DFA can recognize the palindrome language.`,
    code: `# Concretely (x = 11011, y = 10000, both palindromes: x=11011|11011, y=10000|00001):
# if delta_star(q0, "11011") == delta_star(q0, "10000") == s,
# then M also accepts z = "11011" + "00001" = "1101100001"
# — not a palindrome, but M can't tell it apart from x's continuation.`,
    related: ["mit6045-automata-pigeonhole-non-regularity"],
  },
  {
    id: "mit6045-automata-countable-vs-uncountable-languages",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What's the diagonalization argument that non-regular languages must exist — and why does it show 'most' languages are non-regular?",
    back: `A second, purely cardinality-based existence proof (no explicit language needed) rests on two claims:

**Claim 1**: the set of *all* languages over $\\Sigma = \\{0,1\\}$ — i.e. $\\mathcal{P}(\\Sigma^*)$ — is **uncountable**. Proof by diagonalization: suppose (for contradiction) it were countable, so some enumeration $f: \\mathbb{N} \\to \\mathcal{P}(\\Sigma^*)$ lists every language, $f(0) = L_0, f(1) = L_1, \\ldots$ (using $\\mathbb{N}$'s bijection with $\\Sigma^*$, since $\\Sigma^*$ itself is countable — list finite strings in order of length). Define the **diagonal language** $D = \\{w \\in \\Sigma^* \\mid w \\notin f(w)\\}$. Since $f$ is assumed to enumerate *every* language, $D = f(x)$ for some string $x$. Ask: is $x \\in D$? If $x \\in D$, then by $D$'s definition $x \\notin f(x) = D$ — contradiction. If $x \\notin D$, then $x \\in f(x) = D$ — also a contradiction. Either way, no such $x$ (and no such enumeration $f$) can exist, so $\\mathcal{P}(\\Sigma^*)$ is uncountable.

**Claim 2**: the set of regular languages is **countable** — every regular language is recognized by some DFA, every DFA has a finite description (states + transition table, writable in a fixed alphabet), and finite descriptions of any fixed alphabet can be enumerated in order of length, giving an enumeration of the regular languages.

Since $\\mathcal{P}(\\Sigma^*)$ is strictly bigger (uncountable) than the countable set of regular languages, some language must be non-regular — and because one infinity is *strictly* larger than the other, this argument shows "almost all" languages are non-regular, not merely that at least one is.`,
    pitfall:
      "This proof establishes existence non-constructively — it doesn't exhibit any specific non-regular language, unlike the pigeonhole/pumping-lemma arguments, which is exactly why both proof styles are taught: one gives existence for free, the other gives a tool for proving a particular language of interest is non-regular.",
    related: ["mit6045-automata-pigeonhole-non-regularity"],
  },
  {
    id: "mit6045-automata-pumping-lemma-statement",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the Pumping Lemma precisely, and sketch why it follows from the pigeonhole principle.",
    back: `**Pumping Lemma**: let $L$ be a regular language, recognized by some DFA with $p$ states. For any string $x \\in L$ with $|x| \\geq p$, $x$ can be written as $x = uvw$ where $|v| \\geq 1$, $|uv| \\leq p$, and for **every** $m \\geq 0$, $uv^mw \\in L$.

**Proof sketch**: write $x = a_1 a_2 \\cdots a_k$ (with $k \\geq p$) and trace the DFA's run on $x$: states $q_0, q_1, \\ldots, q_k$, ending at an accepting state $q_k$. That's $k+1 \\geq p+1$ state occurrences along a machine with only $p$ states — by the **pigeonhole principle**, some state must repeat within the first $p+1$ occurrences: $q_i = q_j$ for some $i < j \\leq p$. Split $x$ at those repeat points: $u = a_1 \\cdots a_i$ (before the loop), $v = a_{i+1} \\cdots a_j$ (the loop itself, $|v| = j - i \\geq 1$ since $i<j$), $w = a_{j+1} \\cdots a_k$ (after the loop). Since $q_i = q_j$, the machine returns to the *same* state after reading $v$ — so $v$ can be traversed **any number of times** ($m=0,1,2,\\ldots$) without changing where the machine ends up, and $uv^mw$ still reaches the same accepting state $q_k$ for every $m$.

The lemma is really the pigeonhole non-regularity argument (see related card) packaged as a reusable tool: instead of re-deriving "some prefix must repeat a state" by hand for each new language, you invoke the lemma directly and focus on choosing $x$ and deriving the contradiction.`,
    pitfall:
      "The lemma only guarantees the split exists somewhere within the first p characters (|uv| ≤ p) — it does not let you choose which part of x gets pumped freely; a correct non-regularity proof must show the contradiction holds for *every* valid way of splitting x consistent with |uv| ≤ p and |v| ≥ 1, not just the split you'd prefer.",
    related: ["mit6045-automata-pigeonhole-non-regularity", "mit6045-automata-pumping-lemma-application"],
  },
  {
    id: "mit6045-automata-pumping-lemma-application",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Apply the Pumping Lemma to prove L = {0ⁿ1ⁿ | n ≥ 0} is not regular.",
    back: `**Proof by contradiction.** Suppose $L = \\{0^n1^n \\mid n \\geq 0\\}$ is regular, recognized by a DFA with $p$ states. Choose $x = 0^p1^p \\in L$ — this is a valid choice since $|x| = 2p \\geq p$, satisfying the lemma's precondition.

By the Pumping Lemma, $x = uvw$ with $|uv| \\leq p$ and $|v| \\geq 1$. Since $|uv| \\leq p$ and the first $p$ characters of $x$ are all 0s, **both $u$ and $v$ consist entirely of 0s** — say $v = 0^k$ for some $k \\geq 1$ (using $|v| \\geq 1$).

The lemma guarantees $uv^mw \\in L$ for *every* $m \\geq 0$; pick $m = 0$ (pump **down**, i.e. remove $v$ entirely). Then $uv^0w = uw$ has $(p - k)$ zeros followed by exactly $p$ ones — but $p - k < p$ since $k \\geq 1$, so $uw$ has *fewer* 0s than 1s. That means $uw \\notin L$ (it isn't of the form $0^n1^n$), directly contradicting the lemma's guarantee that $uv^mw \\in L$ for all $m$. Contradiction — so $L$ is not regular.

The general recipe this instantiates: (1) pick $x \\in L$ long and structured enough that the $|uv| \\leq p$ constraint pins down *what $v$ can possibly be* (here: forces $v$ to be all 0s), (2) pick whichever $m$ breaks the language's defining property fastest (here: $m=0$ unbalances the counts) — you rarely need $m > 1$.`,
    code: `# Sanity-check the contradiction directly: for L = {0^n 1^n}, p states, x = 0^p 1^p
# any split x = uvw with |uv| <= p forces v in 0^+ (v is all zeros)
# pumping down (m=0): uw has fewer 0s than 1s -> not in L -> contradiction
def is_0n1n(s):
    n = len(s) // 2
    return s == "0" * n + "1" * n  # uv^0w fails this whenever v was nonempty 0s`,
    pitfall:
      "Choosing x = 0^p1^p (rather than, say, a much shorter string) is essential — it's specifically long enough (|x| ≥ p) to trigger the lemma, and specifically structured (a block of 0s long enough that |uv| ≤ p forces v to live entirely inside it) so that the split is constrained enough to derive a contradiction from every possibility, not just one.",
    related: ["mit6045-automata-pumping-lemma-statement"],
  },
];
