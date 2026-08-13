// MIT 6.046J / 18.410J (Spring 2015) — Lectures 19-20: distributed
// algorithms, taught by Nancy Lynch. Synchronous-round leader election
// (including a symmetry-breaking impossibility proof), Luby's randomized
// Maximal Independent Set algorithm, synchronous breadth-first spanning
// trees, and the formal I/O-automaton model for asynchronous distributed
// systems. This is genuinely new territory — no distributed-systems content
// exists anywhere else in the app (Complexity Class and the other MIT
// tracks are single-machine algorithms/complexity theory throughout). See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6046-dist";

export const mit6046DistributedCards: Card[] = [
  {
    id: "mit6046-dist-synchronous-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In 6.046's synchronous distributed network model, what exactly happens during one 'round,' and what's the leader election problem?",
    back: `A **distributed network** is built on an undirected graph $G=(V,E)$: a **process** (an infinite-state automaton) sits at each vertex, and two directed **communication channels** (one per direction) are associated with each edge. Each process has **output ports** and **input ports** connecting to its channels — critically, a process doesn't know *who* is on the other end of a given port, only a **local name** for it (e.g. ports numbered $1,\\ldots,\\deg(u)$). Processes need not be distinguishable — they may lack unique identifiers (UIDs) entirely, depending on what the specific problem assumes.

**Execution proceeds in synchronous rounds**: in each round, every process determines (from its current state) the messages to send on all its ports — at most one message per port per round; every message is delivered to the process at the other end; then every process computes its new state from its old state plus the arriving messages. Local computation cost (time and space) is generally ignored; the two complexity measures tracked are **time** (number of rounds) and **communication** (number of messages, or total bits, sent).

**Leader election**: given an arbitrary connected graph $G$, the goal is for **exactly one** process to output a special "leader" signal. Motivation: a leader can subsequently take charge of communication, coordinate data processing, allocate resources, schedule tasks, or drive a consensus protocol — many distributed problems reduce to "first, elect a leader, then have the leader orchestrate the rest."`,
    related: ["mit6046-dist-leader-election-impossibility"],
  },
  {
    id: "mit6046-dist-leader-election-impossibility",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Prove that no deterministic algorithm of indistinguishable processes can elect a leader on an n-vertex clique network, and identify exactly what breaks the impossibility.",
    back: `**Theorem**: let $G=(V,E)$ be an $n$-vertex clique (every pair of vertices directly connected). There is no algorithm consisting of **deterministic, indistinguishable** processes guaranteed to elect a leader in $G$.

**Proof** (by contradiction, via induction on rounds): suppose algorithm $A$ solves leader election. Since the processes are indistinguishable and the clique is symmetric, all processes start in the **same** initial state, with ports numbered consistently (output port $k$ at any process connects to input port $k$ at every other process). Prove by induction on the number of completed rounds $r$: **all** processes are in identical states after $r$ rounds. Base case $r=0$: true by the same-start-state assumption. Inductive step: if all processes are identical after $r$ rounds, then (being deterministic and having identical local views) every process generates the **same** message on port $k$, for every $k$; every process therefore also **receives** the same message on port $k$ (since the consistent numbering makes every process's port-$k$ neighbor send the same thing); so every process makes the **same** state transition — remaining identical after $r+1$ rounds.

Since $A$ is assumed to solve leader election, *eventually* some process must output the leader signal — but by the invariant just proved, if **one** process does, **every** process does simultaneously (they're all in identical states) — contradicting the requirement that *exactly one* leader be elected.

**What this reveals**: the real obstruction is a **symmetry-breaking** problem — deterministic, indistinguishable processes have no way to ever diverge from each other's behavior, so they can never single out a unique leader. Two fixes restore solvability: (1) **unique identifiers (UIDs)** — assume each process starts knowing its own UID from some totally-ordered set (e.g. the naturals); then a trivial 1-round, $n^2$-message algorithm works (everyone broadcasts their UID; whoever holds the maximum elects itself). (2) **randomness** — even fully indistinguishable processes can break symmetry probabilistically (related card).`,
    pitfall:
      "The impossibility is specifically about deterministic, indistinguishable processes on a fully symmetric network (the clique) — it says nothing about asymmetric graphs (where distinct vertex degrees or positions can already break symmetry) or about processes given any extra distinguishing information (UIDs, randomness).",
    related: ["mit6046-dist-synchronous-model", "mit6046-dist-leader-election-uid-and-random"],
  },
  {
    id: "mit6046-dist-leader-election-uid-and-random",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the randomized leader-election algorithm work without UIDs, and what union-bound lemma establishes 'sufficiently large' random ID space?",
    back: `**Idea**: since deterministic indistinguishable processes provably can't break symmetry (related card), let processes choose **random** IDs from a space large enough that collisions are unlikely, then run the UID-based algorithm (broadcast IDs, max wins) as if those random choices were real UIDs.

**Lemma**: let $0 < \\varepsilon < 1$. Suppose $n$ processes independently choose IDs uniformly at random from $\\{1,\\ldots,r\\}$, where $r = \\lceil n^2/2\\varepsilon\\rceil$. Then with probability at least $1-\\varepsilon$, **all** chosen IDs are distinct. *Proof*: the probability any **particular** pair of processes picks the same value is $\\frac{1}{r}$; taking a union bound over all $\\binom{n}{2} \\approx \\frac{n^2}{2}$ pairs, the probability *some* pair collides is at most $\\frac{n^2}{2}\\cdot\\frac{1}{r} = \\frac{n^2}{2}\\cdot\\frac{2\\varepsilon}{n^2} = \\varepsilon$.

**Algorithm**: each process chooses a random ID from a sufficiently large space (per the lemma); all exchange IDs; if the maximum ID is **unique**, that process wins and becomes leader; otherwise (a tie at the max), **repeat** the whole process as many times as necessary. This elects a leader with **probability 1** eventually (any positive per-round success probability, repeated indefinitely, succeeds almost surely) — and has **expected** running time $\\leq \\frac{1}{1-\\varepsilon}$ rounds (a geometric-distribution bound, since each round independently succeeds with probability $\\geq 1-\\varepsilon$), with probability $\\geq 1-\\varepsilon$ of finishing in just **one** round.

This is the same fundamental move seen elsewhere in this course (randomized quicksort's paranoid pivoting, universal hashing's random function choice): replace an assumption you can't justify about the *input* (indistinguishable, adversarial processes) with randomness the *algorithm itself* controls, then use a union bound to show the algorithm's own coin flips are "good" with high probability.`,
    pitfall:
      "The lemma bounds the probability of ANY collision among all n processes (a union bound over all pairs), not just one specific pair — using only the single-pair collision probability 1/r without the union bound would understate how large r actually needs to be for n processes.",
    related: ["mit6046-dist-leader-election-impossibility", "mit6046-am-universal-hashing-theorem"],
  },
  {
    id: "mit6046-dist-mis-lubys-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe Luby's distributed Maximal Independent Set algorithm's two-round-phase structure, and prove independence and maximality (assuming it terminates).",
    back: `**Maximal Independent Set (MIS)**: select $S \\subseteq V$ such that (a) **independent**: no two neighbors are both in $S$, and (b) **maximal**: no more vertices can be added without violating independence — equivalently, every vertex is either in $S$ or has a neighbor in $S$. Applications: communication-network backbone selection, and (genuinely) distinguishing "Sensory Organ Precursor" cells in fruit fly nervous-system development. Assumed setting: **no UIDs**, but processes know a reasonable upper bound on $n$; **deterministic algorithms provably can't solve this on some graphs** (the same symmetry-breaking obstruction as leader election), motivating a randomized approach.

**Luby's algorithm**: proceeds in **phases**, each consisting of exactly 2 rounds. Initially all nodes are **active**. Each phase, some active nodes decide **in** (join $S$), some decide **out**, the rest stay active into the next phase — operating on a shrinking subgraph induced by the still-active nodes. Per-phase behavior of active node $u$: **Round 1** — choose a random value $r \\in \\{1,\\ldots,n^5\\}$, send to all (active) neighbors; if $r$ is **strictly greater** than every value received from active neighbors, join $S$ (output "in"). **Round 2** — if you joined, announce it to all active neighbors; if you receive such an announcement, decide "out"; if you decided either way this phase, become **inactive**.

**Theorem (independence)**: if Luby's algorithm ever terminates, the final $S$ is independent. *Proof*: a node only joins $S$ if it holds the **unique maximum** value in its active neighborhood at that phase — and the moment it joins, **every** active neighbor learns this (via the Round 2 announcement) and is forced to decide "out," so no neighbor of a newly-joined node can ever also join $S$ later.

**Theorem (maximality)**: if Luby's algorithm ever terminates, the final $S$ is maximal. *Proof*: a node becomes inactive only by joining $S$ itself or by having a neighbor join $S$ — in either case it (or its neighbor) is accounted for in $S$'s covering condition. The algorithm runs until **every** node is inactive, so every vertex ends up either in $S$ or adjacent to a member of $S$.`,
    pitfall:
      "Independence and maximality are both proved conditionally on termination ('if Luby's algorithm ever terminates') — they're properties of whatever S the algorithm eventually settles on, not guarantees that hold at every intermediate phase while the algorithm is still running.",
    related: ["mit6046-dist-mis-termination", "mit6046-dist-leader-election-impossibility"],
  },
  {
    id: "mit6046-dist-mis-termination",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Sketch the proof that Luby's MIS algorithm terminates within O(log n) phases with high probability, via the 'expected edges halve each phase' argument.",
    back: `**Theorem**: with probability at least $1-\\frac{1}{n}$, all nodes decide within $4\\log n$ phases. (Using a supporting lemma — with probability $\\geq 1-\\frac{1}{n^2}$, all random values chosen across the first $4\\log n$ phases are pairwise distinct, by the same union-bound machinery as the leader-election lemma — so it's safe to reason "as if" every chosen value in every phase is unique.)

**Key idea**: show the **active** subgraph shrinks fast enough, in expectation, every phase. Call an edge $\\{u,v\\}$ "**live**" if it currently connects two active nodes. **Lemma**: for each phase, the expected number of live edges remaining after the phase is at most **half** the number live before it.

**Proof sketch**: say node $u$ is "**killed**" in a phase if some active neighbor $w$ chooses a value strictly greater than *both* $w$'s other neighbors' values *and* $u$'s other neighbors' values — in that specific case $u$ is forced to decide "out" (via $w$ either joining directly, or via a cascade). The probability $w$ happens to choose such a dominating value is at least $\\frac{1}{\\deg(u)+\\deg(w)}$ (informally, $w$'s value needs to beat roughly $\\deg(u)+\\deg(w)$ competing values, uniformly at random). Summing over all of $u$'s neighbors, $\\Pr[u \\text{ killed}] \\geq \\sum_{w \\in \\Gamma(u)} \\frac{1}{\\deg(u)+\\deg(w)}$.

For a live edge $\\{u,v\\}$ to "**die**" (stop being live), it suffices that **either** endpoint gets killed — so $\\Pr[\\{u,v\\} \\text{ dies}] \\geq \\frac{1}{2}(\\Pr[u \\text{ killed}] + \\Pr[v \\text{ killed}])$. Summing this over **all** live edges, and reorganizing the double sum so each node $u$'s kill-probability is counted once per its $\\deg(u)$ incident edges, gives: expected edges dying $\\geq \\frac{1}{2}\\sum_u \\deg(u) \\sum_{w\\in\\Gamma(u)} \\frac{1}{\\deg(u)+\\deg(w)} = \\frac{1}{2}\\sum_u\\sum_{w\\in\\Gamma(u)} \\frac{\\deg(u)}{\\deg(u)+\\deg(w)}$. Pairing each term $\\frac{\\deg(u)}{\\deg(u)+\\deg(w)}$ with its mirror $\\frac{\\deg(w)}{\\deg(u)+\\deg(w)}$ (from the same edge counted from $w$'s side) shows these sum to exactly 1 per edge — giving the clean bound that **half** the live edges die in expectation each phase, hence (via standard concentration-of-expectation arguments) the whole active subgraph collapses to nothing within $O(\\log n)$ phases with high probability.`,
    pitfall:
      "The 'kill' condition is a sufficient condition engineered to make the probability bound provable, not the literal complete description of every way a node can end up deciding 'out' in a phase — the proof only needs a lower bound on the kill probability, not an exact characterization of it.",
    related: ["mit6046-dist-mis-lubys-algorithm", "mit6046-am-skip-list-whp-analysis"],
  },
  {
    id: "mit6046-dist-sync-bfs-spanning-tree",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the synchronous breadth-first spanning tree algorithm work via message flooding, and what invariants prove it correct?",
    back: `**Problem**: given a connected graph $G$ and a distinguished root vertex $v_0$ (its process $i_0$), every other process $i \\neq i_0$ must output $\\text{parent}(j)$, where $j$ is $i$'s parent in a valid BFS spanning tree rooted at $v_0$. Assumed setting: processes have UIDs, but no prior knowledge of the graph's structure.

**Algorithm**: each process maintains state $\\text{marked}$ (Boolean, initially true only for $i_0$), $\\text{parent}$ (a UID or undefined), $\\text{send}$ (Boolean, initially true only for $i_0$), and its own $\\text{uid}$. **Round 1**: if $i=i_0$, send a $\\text{search}$ message to all neighbors. If a process receives a $\\text{search}$ message, it marks itself, selects $i_0$ as its parent (outputting $\\text{parent}(i_0)$), and plans to send in the next round. **Round $r>1$**: any process that planned to send does so (broadcasting $\\text{search}$ to all neighbors); any **unmarked** process that receives a message marks itself, picks **one** sending neighbor $j$ as its parent (outputting $\\text{parent}(j)$), and plans to send next round.

**Correctness invariants**: (1) after exactly $r$ rounds, precisely the processes at graph-distance $\\leq r$ from $v_0$ are marked; (2) a process $\\neq i_0$ has its $\\text{parent}$ defined **iff** it's marked; (3) for any process at distance $d$ from $v_0$ with a defined parent, that parent is the UID of some process at distance $d-1$. Together these guarantee the resulting parent pointers form a genuine breadth-first spanning tree (every non-root vertex points to a neighbor exactly one level closer to the root).

**Complexity**: time = number of rounds until every node has output its parent = the graph's **diameter** (the max distance any node has from $v_0$, bounded by $\\text{diam}(G)$); message complexity = $O(|E|)$ total, since flooding sends at most one useful $\\text{search}$ message per edge direction. Common extensions ("bells and whistles"): sending explicit $\\text{parent}$/$\\text{nonparent}$ acknowledgments to build **child pointers** too; piggybacking distances directly on $\\text{search}$ messages; a **convergecast** (information flowing leaf-to-root) for clean termination detection; and using the finished tree for later root-initiated broadcasts or global aggregate computations.`,
    pitfall:
      "A node only picks ONE parent — the first sending neighbor it hears from in the round it first becomes marked — even though it may receive search messages from multiple neighbors simultaneously in a later round (once its own neighbors are already marked and re-flooding). Rule 'unmarked process picks one sending neighbor as parent' applies only at the moment of first becoming marked, which is exactly what keeps the result a tree (not a DAG with multiple parents).",
    related: ["mit6046-dist-synchronous-model"],
  },
  {
    id: "mit6046-dist-asynchronous-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the formal I/O-automaton model for asynchronous distributed systems differ from the synchronous-rounds model, and how does the Max-propagation example illustrate execution-order independence?",
    back: `The **asynchronous model** drops synchronous rounds entirely. Formally, each communication channel $C_{u,v}$ is itself modeled as an **input/output automaton**: input action $\\text{send}(m)_{u,v}$ (effect: append $m$ to a FIFO queue $\\text{mqueue}$), output action $\\text{receive}(m)_{u,v}$ (precondition: $m$ is the queue's head; effect: dequeue it) — so messages sent on a channel are delivered **in order**, but with **no timing guarantee** on when. Each vertex hosts a **process automaton** $P_u$ with $\\text{send}(m)_{u,v}$ outputs and $\\text{receive}(m)_{v,u}$ inputs (plus its own state variables and possibly external inputs/outputs) — critically, $P_u$ does not "know" which vertex $u$ it's located at. Composing the whole system: a process's $\\text{send}$ output is identified with the matching channel's $\\text{send}$ input; a channel's $\\text{receive}$ output is identified with the matching process's $\\text{receive}$ input — shared actions trigger simultaneous state transitions in both components.

**Execution**: no rounds — the system proceeds by performing **enabled steps one at a time, in any order** (a sequence of individual steps, not synchronized batches). The only liveness assumption is **fairness**: every channel eventually delivers the first message in its queue, and every process eventually performs some enabled step (if one remains available indefinitely).

**Worked example — $\\text{Max}_u$ propagation**: each process starts holding an initial value $x_u$ and a $\\text{send}(v)$ flag (initially true) per neighbor $v$. On receiving $m$ from a neighbor: if $m > \\text{max}$, update $\\text{max} := m$ and set every $\\text{send}(w) := \\text{true}$ (re-broadcast the new max to everyone). On sending to neighbor $v$: only enabled if $\\text{send}(v)$ is true; effect sets $\\text{send}(v) := \\text{false}$ afterward. Traced through several different interleavings of which process happens to send/receive next, the algorithm always converges to the same end state — every process ends up holding the **global maximum** value — regardless of the specific order enabled steps happened to fire in. This is the central discipline asynchronous distributed algorithms are designed and proved around: correctness must hold for **every** fair interleaving, not just some assumed "reasonable" execution order.`,
    pitfall:
      "The FIFO ordering guarantee applies only within a single channel (messages between one specific ordered pair of processes) — it says nothing about the relative order of messages arriving from DIFFERENT channels at the same process, which is exactly the source of the many possible interleavings the Max-propagation example has to be correct under.",
    related: ["mit6046-dist-synchronous-model", "mit6046-dist-sync-bfs-spanning-tree"],
  },
];
