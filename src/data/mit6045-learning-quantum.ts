// MIT 6.045J / 18.400J (Spring 2011) — Lectures 19-23: computational
// learning theory (PAC learning, VC-dimension, the learning/cryptography
// connection) and quantum computing (qubits, entanglement, BQP, and the
// Deutsch-Jozsa/Simon's/Shor's algorithms). Genuinely new territory versus
// the generic curriculum, which has neither a learning-theory nor a
// quantum-computing module — cross-links point back to this course's own
// P/NP/BPP (mit6045-complexity) and RSA (mit6045-crypto) cards where the
// connection is substantial rather than re-deriving that material. See
// src/data/courses.ts for the full lecture map — this module completes it.
import type { Card } from "./types";

const MODULE = "mit6045-learning-quantum";

export const mit6045LearningQuantumCards: Card[] = [
  {
    id: "mit6045-learning-quantum-problem-of-induction",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is Hume's Problem of Induction, and how does it motivate treating 'learning' as inherently relative to a restricted hypothesis space rather than an unconstrained one?",
    back: `**Hume's Problem of Induction** (18th century): given past data, multiple hypotheses can be *perfectly* consistent with everything observed so far, yet make wildly different predictions about the future. Classic illustration: "the sun rises every morning" and "the sun rises every morning **until tomorrow**, when it turns into the Death Star and crashes into Jupiter" are both completely compatible with every sunrise ever observed. We obviously believe the first — but on what grounds, given the data alone doesn't favor either?

A related argument (Quine): imagine an anthropologist visiting a tribe, hearing "gavagai" said while someone points at a rabbit. Does "gavagai" mean rabbit? Food? Dinner? "Little brown thing"? No finite amount of pointing-and-listening logically rules out every alternative — there's always another interpretation consistent with all evidence so far.

**The resolution these thought experiments actually point to**: it's not that learning is impossible — it's that learning is impossible **in a theoretical vacuum**, over the space of *all logically conceivable* hypotheses. In practice, we always bring some restricted space of *plausible* hypotheses to the table (the weekday/Death-Star hypothesis is never seriously entertained), and we favor **simpler** explanations — ones that take fewer bits to write down than the raw data itself (a version of Occam's Razor). The entire mathematical machinery of computational learning theory (PAC learning, VC-dimension — related cards) exists precisely to make "simple," "plausible hypothesis space," and "how much data is needed" mathematically precise, rather than leaving them as vague philosophical intuitions.`,
    related: ["mit6045-learning-quantum-pac-framework"],
  },
  {
    id: "mit6045-learning-quantum-pac-framework",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define Valiant's PAC (Probably Approximately Correct) learning framework precisely, and explain what the 'Probably' and 'Approximately' each concretely guard against.",
    back: `**Framework** (Valiant, 1984): a **sample space** $S$ (e.g. all points on a blackboard), a **sample distribution** $D$ over $S$ (how points are drawn), a **concept** $c: S \\to \\{0,1\\}$ (a rule classifying each point, e.g. "above or below a particular line"), and a **concept class** $C$ (the set of all concepts under consideration, e.g. all lines). There's a hidden **true concept** $c \\in C$ the learner is trying to recover. The learner receives sample points $x_1, \\ldots, x_m$ drawn i.i.d. from $D$, each labeled with $c(x_i)$, and must output a **hypothesis** $h$ such that:
$$\\Pr_{x \\in D}[h(x) = c(x)] \\geq 1 - \\varepsilon$$
— i.e. $h$ agrees with the true concept on all but an $\\varepsilon$ fraction of **future** points drawn from the *same* distribution $D$ (this is the formal encoding of "the future should resemble the past," and also of "nothing should be tested that wasn't covered in training").

**"Approximately"** guards against demanding *exact* recovery of $c$ — a learner is allowed to be wrong on some small ($\\varepsilon$) fraction of future inputs, which is unavoidable given only finitely many samples. **"Probably"** guards against unlucky sample draws — even an excellent learning algorithm could, by bad luck, see a wildly unrepresentative batch of samples that reveals almost nothing about $c$ (e.g. all twenty sampled points happening to fall suspiciously close together). So the framework only requires success **with probability at least $1-\\delta$** over the random choice of sample points — not certainty.

Two variants: **proper learning** requires $h \\in C$ (the output must have the same form as the concept class, e.g. a valid line); **improper learning** allows $h$ to be *any* efficiently-evaluable hypothesis, even outside $C$, as long as it predicts well — this distinction turns out to matter a great deal for the *computational* difficulty of learning (related cards).`,
    pitfall:
      "The test/future points must be drawn from the same distribution D as the training samples — PAC's guarantee says nothing about performance on points drawn from a different distribution, which is exactly the mathematical form of 'nothing should be on the test that wasn't covered in class.'",
    related: ["mit6045-learning-quantum-problem-of-induction", "mit6045-learning-quantum-sample-complexity-finite"],
  },
  {
    id: "mit6045-learning-quantum-sample-complexity-finite",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "For a finite concept class C, derive Valiant's sample complexity bound via the union-bound argument, and state the trivial-but-correct learning algorithm it justifies.",
    back: `**Claim**: after seeing $m \\geq \\frac{1}{\\varepsilon}\\log\\frac{|C|}{\\delta}$ samples drawn from $D$, **any** hypothesis $h \\in C$ that agrees with **all** $m$ samples (i.e. $h(x_i) = c(x_i)$ for every $i$) satisfies $\\Pr[h(x) = c(x)] \\geq 1-\\varepsilon$ with probability at least $1-\\delta$ over the sample draw.

**Proof, by the contrapositive**: call $h \\in C$ "**bad**" if $\\Pr_{x \\in D}[h(x) = c(x)] < 1-\\varepsilon$ (i.e. $h$ actually predicts poorly on the true distribution). For a fixed bad $h$, the probability it *happens* to agree with the true concept on all $m$ *independently* drawn samples is at most $(1-\\varepsilon)^m$ (each sample independently has probability $< 1-\\varepsilon$ of agreeing). By the **union bound** over all hypotheses in $C$ (there are at most $|C|$ of them, good or bad): $\\Pr[\\exists \\text{ a bad } h \\text{ that nonetheless agrees on all } m \\text{ samples}] \\leq |C| \\cdot (1-\\varepsilon)^m$. Setting this bound equal to the target failure probability $\\delta$ and solving for $m$: $\\delta = |C|(1-\\varepsilon)^m \\Rightarrow m = \\log_{1-\\varepsilon}\\frac{\\delta}{|C|} \\approx \\frac{1}{\\varepsilon}\\log\\frac{|C|}{\\delta}$ (using $\\log(1-\\varepsilon) \\approx -\\varepsilon$ for small $\\varepsilon$).

**Consequence — a trivially simple learning algorithm**: (1) find *any* $h \\in C$ consistent with all $m$ sample points; (2) output $h$. Such an $h$ always exists (the true concept $c$ itself is always one valid choice), and by the theorem, with probability $\\geq 1-\\delta$, whichever consistent $h$ you happen to find will be a *good* hypothesis. This means the entire statistical difficulty of PAC learning (how much data is needed) has a clean closed-form answer — what's *not* addressed is how computationally hard it is to actually **find** such a consistent $h$ (related card).

The formula's two dependencies are intuitive: smaller target error $\\varepsilon$ (more accuracy demanded) needs more samples; a larger concept class $|C|$ (more hypotheses that could spuriously fit noise) needs more samples to rule out bad ones — but only **logarithmically** more, so even an exponentially large concept class needs only a polynomial number of samples.`,
    pitfall:
      "This bound is stated for finite |C| — it says nothing directly about infinite concept classes (like 'all lines,' which has infinitely many concepts), where the formula's dependence on |C| breaks down entirely and a different notion (VC-dimension, related card) is needed instead.",
    related: ["mit6045-learning-quantum-pac-framework", "mit6045-learning-quantum-vc-dimension"],
  },
  {
    id: "mit6045-learning-quantum-vc-dimension",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define VC-dimension via 'shattering,' work through the VCdim(lines-in-the-plane) = 3 example, and state Blumer et al.'s theorem connecting VC-dimension to PAC-learnability.",
    back: `Valiant's finite-class bound (related card) breaks down when $|C| = \\infty$ — yet intuitively, "the class of all lines" is learnable from few samples while "the class of all squiggles" is not, even though both are infinite with the same cardinality. The number-of-parameters intuition ("a line needs 2 numbers, a squiggle needs infinitely many") is close but not quite it — you can construct artificially parameter-heavy descriptions of lines and parameter-light descriptions of squiggles.

**VC-dimension** (Vapnik–Chervonenkis) makes this precise without reference to "parameters" at all: a set of points $x_1, \\ldots, x_m$ is **shattered** by concept class $C$ if, for **every** one of the $2^m$ possible ways of labeling those points 0/1, **some** concept $c \\in C$ realizes exactly that labeling. $\\text{VCdim}(C)$ is the size of the **largest** point set $C$ can shatter (infinite if arbitrarily large finite sets can always be shattered).

**Worked example — lines in the plane**: $\\text{VCdim}(C) = 3$. Three points arranged as a **triangle** can be shattered — each of the $2^3 = 8$ possible in/out labelings of the three corners is realizable by some line (check each case). But **no** set of 4 points can be shattered: four points form either a quadrilateral (some line can't give opposite corners the same label without also capturing an adjacent one — 2 of the 16 possible labelings are unrealizable), a triangle with an interior point (the interior point can't be labeled differently from all three surrounding vertices simultaneously by a single line), or 3 collinear points (immediately unclassifiable by *any* line in some labelings). Since some 3-point set is shattered but no 4-point set ever is, $\\text{VCdim} = 3$ exactly.

**Blumer, Ehrenfeucht, Haussler, Warmuth (1989)**: a concept class is PAC-learnable **if and only if** its VC-dimension is finite, and when finite, $m = O\\left(\\frac{\\text{VCdim}(C)}{\\varepsilon}\\log\\frac{1}{\\delta\\varepsilon}\\right)$ samples suffice — the same "find any hypothesis consistent with the sample data" algorithm still works, just with VC-dimension replacing $\\log|C|$ as the relevant measure of concept-class complexity. A useful informal corollary, the **Occam's Razor Theorem**: whenever a hypothesis is *sufficiently more succinct* (fewer bits) than the raw data it explains, it will probably predict future data well — the formal cousin of the "simpler explanations generalize better" intuition from the Problem of Induction (related card).`,
    related: ["mit6045-learning-quantum-sample-complexity-finite", "mit6045-learning-quantum-problem-of-induction"],
  },
  {
    id: "mit6045-learning-quantum-learning-computational-hardness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Even with enough samples, how hard is it computationally to find a hypothesis fitting the data — and why does the answer depend critically on proper vs. improper learning?",
    back: `Both sample-complexity theorems (finite $|C|$ and finite VC-dimension) reduce PAC learning to a purely **statistical** question — how much data suffices — and hand you a trivial-sounding algorithm: "find any $h$ consistent with the sample data, output it." But *finding* such an $h$ efficiently is a genuine **computational** problem in its own right, with a flavor reminiscent of satisfiability (find a hypothesis satisfying certain fixed outputs), though not identical.

**Proper learning** (the hypothesis $h$ must have a fixed, specific format, matching the concept class — e.g. a DNF Boolean expression): in some cases, this really is **provably NP-hard** — finding a DNF formula consistent with given labeled examples can be as hard as any NP-complete problem.

**Improper learning** (the hypothesis can be *any* efficiently-evaluable rule — any polynomial-time-computable function that predicts the data well, regardless of form): whether this is ever NP-hard remains, to this day, an **open problem**. Improper learning is always in $NP$ though (given a candidate $h$, checking it fits the sample data is easy) — so if $P = NP$, **all** learning problems (proper or improper) become tractable. Concretely, that would mean a computer could, in principle, find the shortest efficient description of the stock market, or of neural firing patterns in a human brain — solving some of the hardest open problems in AI and neuroscience as a side effect of an unrelated complexity-class collapse. This consequence is itself treated as further (informal) evidence that $P \\neq NP$: it would be strange for a question about circuit satisfiability's inherent difficulty to also silently resolve deep empirical mysteries about brains and markets.`,
    pitfall:
      "The type of hardness result available (proven NP-hard vs. genuinely open) is a real, substantive distinction between proper and improper learning — it's not just that improper learning's hardness proof 'hasn't been found yet' in some routine sense; no one currently even knows which answer to expect.",
    related: ["mit6045-learning-quantum-pac-framework", "mit6045-learning-quantum-rsa-learning-connection"],
  },
  {
    id: "mit6045-learning-quantum-rsa-learning-connection",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does a hypothetical efficient improper-learning algorithm let you break RSA, and what does this say about arguments (like Chomsky's) that grammar must be innately hardwired rather than learned from data?",
    back: `Even without resolving whether improper learning is NP-hard, it can be shown at least as hard as **breaking RSA** — a striking, concrete connection between computational learning theory and cryptography. Construction: let the concept class $C$ have one concept $c$ per valid RSA modulus $N = pq$ (with $p-1, q-1$ not divisible by 3). Let the sample space $S$ consist of pairs $(y, i)$ with $1 \\leq y \\leq N-1$, $1 \\leq i \\leq \\log N$, where $(y,i) \\in c$ iff the $i$-th bit of $y^{1/3} \\bmod N$ (the RSA decryption of $y$) is 1. So a learner is handed a stream of RSA-encrypted values $y = x^3 \\bmod N$, each paired with one bit of the corresponding plaintext $x$ — exactly the "training data" an eavesdropper could freely generate or observe.

There **is** a compact, polynomial-size rule explaining this data: exactly the decryption procedure someone who knows $p, q$ would use (see the RSA card). The question is whether that rule is *learnable* without already knowing $p, q$. If an efficient improper-learning algorithm existed, it could infer the plaintext-bit rule directly from this sample data (data an adversary can freely generate) — meaning it could recover plaintext bits from ciphertext without ever knowing the trapdoor, i.e. **break RSA**. So improper-learning hardness is now known to follow from the hardness of RSA specifically, and — more generally — from the existence of *any* one-way function at all (a strictly weaker, more general assumption than RSA's specific hardness).

**The payoff for a famous linguistics debate**: Chomsky's "Poverty of the Stimulus" argument claims children hear far too few sentences to infer grammar from scratch — implying grammar must be innately hardwired rather than learned. But the *sample*-complexity bounds above actually suggest surprisingly little data is needed *in principle* (as long as the relevant concept class has low VC-dimension, which grammar plausibly does) — undermining the sample-complexity version of Chomsky's argument. The *real* obstruction, this connection suggests, isn't how much data a baby has access to, but **computational** difficulty: even a nondeterministic finite automaton (a far simpler model than any human grammar) with unknown structure has been shown at least as hard to learn from example strings as breaking RSA — so if a baby really could learn grammar totally from scratch with no innate structure, that baby would incidentally be capable of breaking modern cryptography.`,
    pitfall:
      "This argument doesn't prove grammar IS innate — it only shows that the specific 'not enough sample data' version of Chomsky's argument is undermined by PAC theory's sample-complexity bounds, while pointing to computational (not statistical) hardness as a more defensible version of a similar conclusion.",
    related: ["mit6045-learning-quantum-learning-computational-hardness", "mit6045-crypto-rsa", "mit6045-crypto-one-way-functions"],
  },
  {
    id: "mit6045-learning-quantum-physical-basis-of-computation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does the reliability of real computers depend on more than pure mathematics, and what historical/theoretical developments settled the question of whether large-scale reliable computation is even physically possible?",
    back: `Every model studied so far in this course (finite automata, Turing machines, circuits, complexity classes) is a piece of pure mathematics — but real computers are physical objects, and it's a genuine, non-obvious question whether the mathematical abstractions correspond to anything buildable at scale. With **vacuum tubes**, this wasn't obvious at all: individual components failed often enough that some researchers suspected a fundamental physical ceiling on how complex a reliable circuit or Turing-machine tape head could ever be.

**Von Neumann** (1950s) proved a foundational theorem: it's possible to build an **arbitrarily reliable** computer out of individually **unreliable** components (noisy AND/OR/NOT gates), *provided* each component's failure probability is below some fixed critical threshold and failures are uncorrelated across components — reliability doesn't require perfect parts, just good-enough parts combined with redundancy. What actually resolved the practical worry, though, was the **transistor** (1947), whose reliability rests on understanding semiconductors — which in turn rests on the quantum-mechanical revolution in physics roughly 80 years prior. In this sense, **every modern computer already is, in a real physical sense, a quantum device** — quantum mechanics isn't an exotic add-on to classical computing, it's the physical substrate classical computing already runs on.

**The deeper question this opens up**: having secured the *physical substrate*, can complexity theory's classes be worked out "in the armchair," independent of physics? Already, this course changed models once — from $P$ (polynomial-time deterministic) to $BPP$ (polynomial-time probabilistic) — precisely because *physical* randomness turned out to be a resource worth formalizing as a complexity class, even though $P = BPP$ is now conjectured (the classes are believed equivalent, just not provably so). This raises the natural question the rest of the module answers: could nature have **another** surprise in store for computation, beyond randomness?`,
    related: ["mit6045-learning-quantum-qubits-and-measurement", "mit6045-complexity-bpp-and-rp-definitions"],
  },
  {
    id: "mit6045-learning-quantum-qubits-and-measurement",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a qubit's superposition state and the measurement postulate, and contrast measurement's three defining properties against unitary evolution's.",
    back: `A **qubit** — an object with two perfectly distinguishable classical states $\\vert 0\\rangle$, $\\vert 1\\rangle$ — can also exist in a **superposition** $\\alpha\\vert 0\\rangle + \\beta\\vert 1\\rangle$, where $\\alpha, \\beta$ are (in general complex) numbers satisfying $\\vert\\alpha\\vert^2 + \\vert\\beta\\vert^2 = 1$. Restricting to real amplitudes for visualization, the possible states of a single qubit correspond exactly to points on a unit circle in the $(\\alpha, \\beta)$-plane.

**Measurement**: measuring a qubit "in the standard basis" yields outcome $\\vert 0\\rangle$ with probability $\\vert\\alpha\\vert^2$ and $\\vert 1\\rangle$ with probability $\\vert\\beta\\vert^2$ — and critically, the qubit's state **collapses** to whichever outcome was observed (all superposition information is destroyed the instant a measurement happens). This makes measurement fundamentally **irreversible** (you can't recover $\\alpha, \\beta$ from the post-measurement state), **probabilistic** (which outcome occurs is genuinely random, not merely unknown), and **discontinuous** (an instantaneous jump, not a gradual process). This is philosophically uncomfortable — *what* physically constitutes "a measurement," and how the universe "knows" when one has occurred, remains unresolved even in modern physics (decoherence theory offers a partial account of measurement as ordinary interaction, but doesn't fully explain where the probabilities themselves come from) — but the course treats it as a working axiom, since everything remains mathematically well-defined regardless.

This is the crucial contrast that makes the rest of the module possible: measurement (irreversible/probabilistic/discontinuous) is one kind of operation on a qubit; **unitary transformations** (related card) are the other — reversible, deterministic, and continuous, and are what quantum *computation* is actually built from.`,
    pitfall:
      "'Probabilistic' here means genuinely random, not merely 'unknown to us but predetermined' — this is the substance of what's philosophically at stake in measurement, and it's a stronger claim than ordinary classical uncertainty (compare to the no-communication/no-cloning discussion, related cards).",
    related: ["mit6045-learning-quantum-unitary-transformations", "mit6045-learning-quantum-physical-basis-of-computation"],
  },
  {
    id: "mit6045-learning-quantum-unitary-transformations",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What makes a matrix 'unitary,' why must such matrices be used to act on qubits (besides measuring), and what does composing the 45° rotation matrix with itself reveal that has no classical analogue?",
    back: `Besides measuring a qubit outright, you can act on it — e.g. shining a laser on an electron — in a way that multiplies its amplitude vector by any matrix that **preserves total probability** (maps unit vectors to unit vectors). Such a matrix is called **unitary**. **Theorem**: $U$ is unitary iff $UU^* = I$, where $U^*$ is $U$'s conjugate transpose — equivalently $U^{-1} = U^*$, and a direct corollary is that **every unitary operation is reversible** (apply $U^*$ to undo it) — the opposite of measurement's irreversibility.

Example unitary matrices: the identity $I$; the **NOT gate** $X = \\begin{bmatrix}0&1\\\\1&0\\end{bmatrix}$; the **phase-$i$ gate** $\\begin{bmatrix}1&0\\\\0&i\\end{bmatrix}$; and a **45° rotation** $\\begin{bmatrix}\\cos 45° & -\\sin 45°\\\\ \\sin 45° & \\cos 45°\\end{bmatrix}$. Physically, unitary evolution corresponds to running the **Schrödinger equation** ($\\frac{d\\vert\\psi\\rangle}{dt} = iH\\vert\\psi\\rangle$) for some duration — a unitary transformation is just "leaving the Schrödinger equation on for a while." (Complex numbers, rather than reals, are used because some unitaries — like NOT — cannot be written as the square of any *real-valued* unitary matrix, but can be with complex amplitudes: an entirely mathematical, not merely aesthetic, reason.)

**Applying the 45° rotation twice reveals something with no classical counterpart**: tracking $\\vert 0\\rangle$ and $\\vert 1\\rangle$ through two applications, the combined effect sends $(\\vert 0\\rangle + \\vert 1\\rangle)/\\sqrt{2} \\mapsto \\vert 1\\rangle$ — meaning the **squared** 45° rotation acts exactly as the NOT gate $X$. This 45° rotation is therefore literally a **"square root of NOT"** — a well-defined operation $R$ with $R^2 = X$. No classical bit-flip operation has a meaningful "square root" in this sense; it's a genuinely new structural feature quantum mechanics' continuous, reversible evolution provides, traceable to the **interference** between amplitudes that a purely classical (probabilistic) bit-flip could never exhibit.`,
    code: `import numpy as np
R = np.array([[np.cos(np.pi/4), -np.sin(np.pi/4)],
              [np.sin(np.pi/4),  np.cos(np.pi/4)]])
X = np.array([[0, 1], [1, 0]])
assert np.allclose(R @ R, X)  # R is a genuine "square root of NOT"`,
    codeLang: "python",
    related: ["mit6045-learning-quantum-qubits-and-measurement", "mit6045-learning-quantum-entanglement"],
  },
  {
    id: "mit6045-learning-quantum-entanglement",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a two-qubit state generalize a single qubit's, what does it mean for a state to be 'entangled' rather than 'separable,' and why is the CNOT gate special among two-qubit operations?",
    back: `Describing two qubits requires **four** amplitudes (one per possible 2-bit string): $\\alpha\\vert 00\\rangle + \\beta\\vert 01\\rangle + \\gamma\\vert 10\\rangle + \\delta\\vert 11\\rangle$, with $\\vert\\alpha\\vert^2+\\vert\\beta\\vert^2+\\vert\\gamma\\vert^2+\\vert\\delta\\vert^2=1$. Measuring **both** qubits collapses to one 2-bit string with the expected probabilities. Measuring only the **first** qubit is more subtle: with probability $\\vert\\alpha\\vert^2+\\vert\\beta\\vert^2$ you see $0$, and the *remaining* (unmeasured) qubit's state collapses to the appropriately renormalized combination of the terms consistent with that outcome — informally, "any time you ask the universe a question, it makes up its mind; any time you don't ask, it puts off deciding for as long as it can."

Some two-qubit states **factor** cleanly into independent single-qubit states — e.g. $\\vert 01\\rangle = \\vert 0\\rangle \\otimes \\vert 1\\rangle$, or $\\vert 00\\rangle+\\vert 01\\rangle+\\vert 10\\rangle+\\vert 11\\rangle = \\frac{1}{2}(\\vert 0\\rangle+\\vert 1\\rangle)(\\vert 0\\rangle+\\vert 1\\rangle)$ — these are called **separable**. But $\\vert 00\\rangle + \\vert 11\\rangle$ (suitably normalized) **cannot** be factored into any product of single-qubit states — this is an **entangled** state, one of quantum mechanics' most discussed features.

The **CNOT (Controlled-NOT)** gate, $\\vert x\\rangle\\vert y\\rangle \\mapsto \\vert x\\rangle\\vert x \\oplus y\\rangle$ (flip the second bit iff the first is 1), is the simplest **operation** that can't be decomposed into independent single-qubit gates — it's needed to actually *create* entanglement (e.g. applying a Hadamard to the first qubit, then CNOT with the second, transforms $\\vert 00\\rangle$ into the entangled $(\\vert 00\\rangle+\\vert 11\\rangle)/\\sqrt{2}$). Not every 2-qubit map is achievable this way, though: a hypothetical gate computing $\\vert x\\rangle\\vert y\\rangle \\mapsto \\vert x\\rangle\\vert x \\text{ AND } y\\rangle$ is **not** unitary (it's not reversible — both $\\vert 0\\rangle\\vert 0\\rangle$ and $\\vert 0\\rangle\\vert 1\\rangle$ map to the same output, so information is destroyed), illustrating that quantum gates are constrained to reversible operations in a way ordinary classical logic gates (like AND) are not.`,
    related: ["mit6045-learning-quantum-unitary-transformations", "mit6045-learning-quantum-no-cloning-and-no-communication"],
  },
  {
    id: "mit6045-learning-quantum-no-cloning-and-no-communication",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State and prove the no-cloning theorem, and explain why measuring one half of an entangled pair doesn't allow faster-than-light communication despite superficially looking like it should.",
    back: `**No-cloning theorem**: there is no unitary operation that duplicates an arbitrary unknown qubit state. *Proof*: duplication would have to act as $\\alpha\\vert 0\\rangle + \\beta\\vert 1\\rangle \\mapsto (\\alpha\\vert 0\\rangle+\\beta\\vert 1\\rangle)(\\alpha\\vert 0\\rangle+\\beta\\vert 1\\rangle) = \\alpha^2\\vert 00\\rangle + \\alpha\\beta\\vert 01\\rangle + \\alpha\\beta\\vert 10\\rangle + \\beta^2\\vert 11\\rangle$ — but the resulting amplitudes ($\\alpha^2$, $\\alpha\\beta$, $\\beta^2$) are **not linear functions** of $\\alpha, \\beta$, while every unitary transformation is by definition linear. So no unitary operation can implement this map, for arbitrary unknown $\\alpha, \\beta$ — a direct, purely algebraic consequence of unitarity, "as simple as it looks." This matters practically because it means a quantum state generally gets only **one chance** to be measured/used — you can't back it up first.

**The "spooky action at a distance" puzzle**: consider the entangled state $\\vert 00\\rangle + \\vert 11\\rangle$ (normalized), with the two qubits potentially light-years apart. Measuring just the first qubit yields $\\vert 00\\rangle$ or $\\vert 11\\rangle$ each with probability $\\frac{1}{2}$ — and the *other*, distant qubit's value is now determined too, seemingly instantaneously. Einstein called this troubling. But it provably **cannot** be exploited to send information faster than light: the **no-communication theorem** establishes that nothing done to the first qubit alone can affect the *probability distribution* of any measurement outcome on the second qubit in isolation — the correlation is only visible by later comparing both measurement records together (which requires ordinary, light-speed-limited communication).

Could this correlation instead be explained by the two qubits secretly "agreeing on an outcome" (a hidden variable) at creation, with no real randomness or entanglement involved? **Bell's theorem** (1964) proved there are experiments whose statistics **cannot** be reproduced by any such local hidden-variable explanation — and those experiments, run in the 1980s, vindicated quantum mechanics over any classical "secretly pre-agreed" account, in most physicists' view closing Einstein's hoped-for "completion" of the theory.`,
    pitfall:
      "The randomness of individual measurement outcomes and the correlation between distant entangled qubits are both real and experimentally confirmed — what's ruled out is only the possibility of using entanglement alone to signal information faster than light, not the reality of the correlation itself.",
    related: ["mit6045-learning-quantum-entanglement"],
  },
  {
    id: "mit6045-learning-quantum-universal-gate-sets-and-bqp",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What makes a set of quantum gates 'universal,' why can't Hadamard+CNOT alone suffice, and how is BQP formally defined?",
    back: `Real quantum circuits must be built from gates acting on only a **constant** number of qubits at a time (1, 2, or 3), since physical interactions are local — you can't directly apply an arbitrary transformation to all $n$ qubits simultaneously. A **universal set of quantum gates** is a small fixed collection of such local gates that can be composed to approximate *any* unitary matrix to arbitrary precision (the word "universal" here specifically means "sufficient for real/complex-valued quantum computation," a slightly different sense than "universal Turing machine").

Hadamard and CNOT alone are **not** sufficient — the **Gottesman-Knill theorem** shows any circuit built purely from Hadamard and CNOT gates can be efficiently simulated by an ordinary *classical* computer, so this pair adds no quantum advantage. Adding the **Toffoli gate** (controlled-controlled-NOT: $\\vert x\\rangle\\vert y\\rangle\\vert z\\rangle \\mapsto \\vert x\\rangle\\vert y\\rangle\\vert z \\oplus xy\\rangle$) to Hadamard *does* give a universal set. (A different, equally valid universal pair: CNOT together with the "$\\pi/8$" gate $T = \\begin{bmatrix}\\cos(\\pi/8)&\\sin(\\pi/8)\\\\-\\sin(\\pi/8)&\\cos(\\pi/8)\\end{bmatrix}$.)

**Why not every unitary is efficiently reachable**: an $n$-qubit unitary has roughly $2^n \\times 2^n$ real degrees of freedom — doubly exponential in $n$ — while the number of distinct quantum circuits buildable from $T$ gates is only singly exponential in $T$. So "almost all" unitary matrices require an exponential number of gates to even approximate — exactly analogous to Shannon's classical circuit-counting argument. A quantum circuit is only useful as an efficient algorithm if it uses a **polynomial** number of gates.

**BQP (Bounded-error Quantum Polynomial time)**: informally, the class of problems efficiently solvable by a quantum computer. Formally, $L \\in BQP$ if there's a polynomial-size family of quantum circuits (built from a fixed universal gate set, with a classical poly-time algorithm to *produce* the circuit for each input length — otherwise there'd be no way to actually find the right circuit) such that measuring a designated output qubit yields $\\vert 1\\rangle$ with probability $\\geq \\frac{2}{3}$ when $x \\in L$, and $\\leq \\frac{1}{3}$ when $x \\notin L$ — the direct quantum analogue of BPP's two-sided-error definition.

**BQP's place in the complexity landscape**: $P \\subseteq BQP$ (any classical computation is trivially simulable — CNOT simulates NOT, Toffoli simulates AND); $BPP \\subseteq BQP$ ("randomness is free" in quantum mechanics — a Hadamard applied to a fresh $\\vert 0\\rangle$ qubit gives an unbiased coin flip, no interference exploited, just used as a randomness source); $BQP \\subseteq PSPACE \\subseteq EXP$ (a quantum circuit's exact behavior can always be computed by explicit linear algebra, in exponential time and — a nontrivial 1993 Bernstein-Vazirani result — polynomial *space*). A striking consequence: since $BQP \\subseteq PSPACE$, any unconditional proof that $P \\neq BQP$ would *automatically* also prove $P \\neq PSPACE$ — an open problem believed at least as hard as $P$ vs $NP$. So there's currently **no realistic hope** of unconditionally proving quantum computers are more powerful than classical ones — every known quantum speedup result (related cards) instead applies to more restricted, "black-box" settings.`,
    pitfall:
      "BQP ⊆ PSPACE is a containment, not an equality — it shows quantum computers can't do more than PSPACE allows, but doesn't by itself say anything about whether BQP equals P, equals PSPACE, or sits strictly in between; the open questions about BQP's exact relationship to P remain as hard as the analogous P vs PSPACE question.",
    related: ["mit6045-learning-quantum-entanglement", "mit6045-complexity-bpp-and-rp-definitions", "mit6045-complexity-p-definition"],
  },
  {
    id: "mit6045-learning-quantum-deutsch-jozsa",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the Deutsch-Jozsa-style circuit compute f(0) ⊕ f(1) in a single quantum query, when any classical algorithm provably needs two?",
    back: `Given oracle access to $f: \\{0,1\\} \\to \\{0,1\\}$, computing $f(0) \\oplus f(1)$ **classically** provably needs 2 queries — knowing only $f(0)$ or only $f(1)$ alone reveals literally nothing about their XOR (either value is equally consistent with either XOR outcome).

**Quantum**: querying $f$ means applying a unitary $U_f: \\vert x,y\\rangle \\mapsto \\vert x, y \\oplus f(x)\\rangle$ (this specific reversible form is required — directly overwriting $y$ with $f(x)$ wouldn't be unitary). Prepare two qubits: apply Hadamard to the first (starting at $\\vert 0\\rangle$) and Hadamard-after-NOT to the second (starting at $\\vert 0\\rangle$), producing $\\vert\\psi_0\\rangle = \\vert +\\rangle\\vert -\\rangle = \\frac{1}{2}[\\vert 0\\rangle+\\vert 1\\rangle][\\vert 0\\rangle-\\vert 1\\rangle]$. Apply $U_f$ **once**, then a final Hadamard to the first qubit, then measure.

**Why one query suffices**: acting $U_f$ on a second qubit already in the $\\vert -\\rangle$ state has a special effect — it "kicks back" a phase rather than changing the qubit's classical value (the **phase kickback** trick): $U_f$ applied to this specific $\\vert\\psi_0\\rangle$ simply **negates the amplitude** of the first-qubit term whenever $f(x) = 1$. Concretely, the result is $\\vert +\\rangle\\vert -\\rangle$ if $f(0) = f(1)$, and $\\vert -\\rangle\\vert -\\rangle$ if $f(0) \\neq f(1)$ — the difference is now entirely encoded in the **first qubit's sign**, invisible to a direct measurement but exactly what the final Hadamard is designed to convert back into the standard $\\vert 0\\rangle/\\vert 1\\rangle$ basis: measuring the first qubit afterward yields $1$ **if and only if** $f(0) \\neq f(1)$, i.e. exactly $f(0) \\oplus f(1)$.

This particular speedup (2 queries $\\to$ 1) is only a **constant factor**, not asymptotically dramatic — computing the XOR of $N$ bits this way needs $N/2$ quantum queries versus $N$ classical ones. But it was historically the **first proof** that a quantum algorithm could solve *any* problem with provably fewer resources than any classical algorithm — establishing the core technique (interference engineered so wrong answers cancel, right answers reinforce) that far more dramatic later speedups (Simon's, Shor's — related cards) build directly on.`,
    related: ["mit6045-learning-quantum-simons-algorithm", "mit6045-learning-quantum-unitary-transformations"],
  },
  {
    id: "mit6045-learning-quantum-simons-algorithm",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What problem does Simon's algorithm solve, why is the classical lower bound exponential (via the birthday paradox), and why is this the first *unconditional* proof of a quantum speedup — reconciling with 'we can't prove P ≠ BQP'?",
    back: `**Simon's problem**: given oracle access to $f: \\{0,1\\}^n \\to \\{0,1\\}^n$, promised there's a hidden "secret string" $s$ such that $f(x) = f(y) \\iff y = x \\oplus s$ (for $x \\neq y$), find $s$ using as few queries as possible.

**Classical lower bound**: any randomized classical algorithm needs $\\Omega(2^{n/2})$ queries — essentially the **birthday paradox**. The algorithm is reduced to "shooting in the dark," hoping to stumble on a colliding pair $x, y$ with $f(x) = f(y)$ (which reveals $s = x \\oplus y$); after $T$ queries, the probability of having found such a pair by chance is at most $T^2/(2^n - 1)$, so exponentially many queries ($T \\approx 2^{n/2}$) are needed before a collision becomes likely — until you find a collision, individual query results carry essentially no information about $s$.

**Quantum**: Daniel Simon (1993) gave a quantum algorithm solving this using only $O(n)$ queries — **exponentially** fewer than any classical algorithm can achieve. This was the **first proven example** of a quantum computer being exponentially faster than any classical one for a well-defined problem — a genuinely contrived problem (arguably why Simon's original paper was initially rejected), but historically pivotal for two reasons: it directly inspired Shor's factoring algorithm (related card), and Shor's algorithm is easiest to understand as literally the same underlying technique, applied to a different mathematical group.

**Reconciling with "we can't prove P ≠ BQP"**: Simon's problem involves $f$ as a **black box** (an oracle you can only query, never inspect the internal implementation of) — in this **black-box / oracle setting**, an unconditional exponential separation between quantum and classical query complexity genuinely can be, and has been, proven. What remains completely open is the *non-black-box* question — whether any **concrete, explicitly-described** problem (not hidden behind an oracle) separates $P$ from $BQP$ this dramatically; that stronger claim would (as noted in the BQP card) also resolve $P$ vs $PSPACE$, and remains firmly out of reach.`,
    pitfall:
      "The exponential speedup here is unconditional and proven — but only in the oracle/black-box model. It's easy to misread this as contradicting the earlier claim that P ≠ BQP can't be proven unconditionally; the two statements are about different models (black-box query complexity vs. ordinary Turing-machine-style complexity) and don't conflict.",
    related: ["mit6045-learning-quantum-deutsch-jozsa", "mit6045-learning-quantum-shors-algorithm"],
  },
  {
    id: "mit6045-learning-quantum-shors-algorithm",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Shor's algorithm reduce factoring to period-finding, and what does the 'clocks and thumbtacks' analogy convey about how the quantum Fourier transform extracts that period via interference?",
    back: `Breaking RSA reduces to **factoring** $N$ (see the RSA card) — but trying all possible divisors "in quantum parallel" doesn't work, since measuring a superposition over candidate divisors just yields one uniformly random guess, no better than classical brute force. A genuine quantum speedup needs to exploit **structure** specific to factoring, not treat it as a generic unstructured search.

**The structure exploited — periodicity**: for $N = pq$ and $x$ not divisible by $p$ or $q$, the sequence $x \\bmod N, x^2 \\bmod N, x^3 \\bmod N, \\ldots$ is **periodic**, with period dividing $(p-1)(q-1)$ (the same Euler's-theorem fact underlying RSA's correctness). Learning the period of this sequence reveals a divisor of $(p-1)(q-1)$; collecting several such divisors (from different values of $x$) lets you reconstruct $(p-1)(q-1)$ itself with high probability, from which $p, q$ follow via further number-theoretic steps. The obstruction to a **classical** algorithm: the period itself can be almost as large as $N$ — up to thousands of digits — so finding it by direct simulation is exactly as slow as factoring was in the first place.

**The quantum approach**: create a superposition $\\sum_r \\vert r\\rangle\\vert x^r \\bmod N\\rangle$ over all exponents $r$ (each $x^r \\bmod N$ efficiently computable via repeated squaring, so this superposition is efficiently constructible) — then apply the **quantum Fourier transform (QFT)**, a unitary linear transformation that maps a quantum state encoding a periodic sequence directly to a state encoding **the period itself**.

**Intuition via the clocks-and-thumbtacks analogy**: imagine a room full of analog clocks, each completing a full revolution at a different, arbitrary period (17 hours, 26 hours, 24.7 hours, ...), each with a thumbtack on a corkboard beneath it, starting at the board's center. Every "morning" (each element of the sequence), you move every thumbtack one inch in the direction its clock hand currently points. If your true underlying schedule has some period $T$ (say, 26 hours), the thumbtack under the clock whose own period matches $T$ gets pushed the **same direction every time** (since that clock always shows the same reading when you wake up) — drifting steadily outward, farther than any other thumtack. Every *mismatched* clock's thumbtack instead gets pushed in essentially random, uncorrelated directions over many mornings, and **cancels out** near the center. So simply observing **which thumbtack traveled farthest** reveals the true period $T$ — without ever needing to inspect the raw sequence of wake-up times directly.

The QFT is precisely this mechanism, formalized: amplitudes corresponding to the sequence's *true* period all point the **same direction** and reinforce (constructive interference), while amplitudes for every other candidate period point in different, effectively random directions and **cancel** (destructive interference) — so measuring after the QFT reveals the true period with high probability. This is the one part of Shor's algorithm that genuinely depends on quantum mechanics (specifically, on amplitudes being able to take **negative or complex** values, unlike classical probabilities, which are always non-negative — the source of destructive interference having no classical analogue at all).`,
    pitfall:
      "The exponential parallelism of preparing a superposition over all r is not, by itself, what gives Shor's algorithm its speedup — a naive measurement of that superposition yields one useless random sample, exactly as with brute-force divisor search. The actual speedup comes specifically from the QFT's interference step, which extracts a *global* property (the period) that no single measured branch could reveal on its own.",
    related: ["mit6045-learning-quantum-simons-algorithm", "mit6045-crypto-rsa", "number-theory-modular-exponentiation"],
  },
];
