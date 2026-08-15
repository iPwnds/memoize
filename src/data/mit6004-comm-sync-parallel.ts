// MIT 6.004 (Spring 2009) — Lectures 20-21, 24: interconnect/communication
// (why interfaces outlast technologies, bus protocols and arbitration,
// communication topology cost/latency tradeoffs), communicating processes
// (precedence constraints, semaphores, mutual exclusion, deadlock and the
// dining philosophers problem), and parallel processing (ILP/TLP,
// superscalar, SIMD, VLIW, MIMD/SMP, sequential consistency, and cache
// coherence via snooping) — the course's final content module. See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6004-comm";

export const mit6004CommSyncParallelCards: Card[] = [
  // --- Lecture 20: Communication issues — busses, networks, protocols ---
  {
    id: "mit6004-comm-bus-interfaces-vs-technology",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain the principle 'technology comes and goes; interfaces last forever,' and why interfaces often deserve more engineering attention than the technologies they connect.",
    back: `**The principle**: underlying implementation technologies (a specific memory chip generation, a specific disk mechanism, a specific bus voltage standard) get replaced every few years — but a well-designed **interface** between components can remain stable and in active use for **decades**, long after every technology it originally connected has been superseded.

**Why interfaces deserve outsized engineering attention**: (1) **Abstraction** — a good interface should outlast many technology generations, meaning the *cost* of getting it right is amortized over an enormously longer useful lifetime than any single technology behind it. (2) Interfaces are often **"virtualized"** to extend beyond their original function — e.g. a memory interface designed for RAM ends up also serving disk-backed virtual memory (Module 6); an I/O interface designed for local peripherals ends up serving networked/remote services. (3) A stable interface **represents more potential value to its proprietors** than the technologies it connects — control of a widely-adopted interface standard is a durable strategic asset in a way that any one underlying chip generation cannot be.

**Both cautionary and success stories exist**: "interface warts" — poorly-designed interfaces that persist far past their useful life specifically *because* so much depends on them (e.g. cited "sob stories" like Windows' \`aux.c\` special-filename bug, and big/little-endian byte-order incompatibilities forcing endless conversion code) — versus genuine long-term successes like the **IBM 360 instruction set architecture** (still influencing designs decades later), **PostScript**, **CompactFlash**, and **backplane buses** (related card) — interfaces so well-conceived that their *stability itself* became one of their most valuable properties.`,
    related: ["mit6004-comm-bus-basics"],
  },
  {
    id: "mit6004-comm-bus-basics",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the backplane bus, master/slave/bus-cycle terminology, and describe the historical progression from processor-dependent to processor-independent buses.",
    back: `**Backplane bus**: modular cards (CPUs, memories, bulk storage, I/O devices) plug into a common backplane providing **power**, a **common system clock**, and shared **wires for communication** — a physical/electrical interface standard letting independently-designed modules interoperate.

**Terminology** (still standard today): **BUS MASTER** — a module that *initiates* a bus transaction (a CPU, a smart I/O device, another processor). **BUS SLAVE** — a module that *responds* to a bus request (memory, an I/O device). **BUS CYCLE** — the period from when a transaction is requested until it is served.

**Historical progression**: "**Ancient times**" — ad hoc, direct point-to-point connections between every pair of components that needed to talk (no shared bus abstraction at all). "**Late 60s**" — a **processor-dependent** bus, where the bus's signals and timing were essentially just the CPU chip's own pins, buffered and exposed (e.g. the original IBM PC's **ISA bus**, whose pinout and timing are nearly identical to the 8088 processor's own spec) — simple to build, but tightly coupled to one specific CPU family, making it hard to later swap in a different processor. "**80s**" — genuinely **processor-independent** buses (e.g. **NuBus, PCI**) that isolate basic communication primitives (simple read/write protocols) from any specific processor's internal architecture, are **symmetric** (any module can become bus master — smart I/O, multiple processors), and support **"plug & play"** expansion — the explicit **goal**: a vendor-independent interface standard. "**Today**" — "buses galore," a hierarchy of specialized buses (front-side bus, back-side bus, AGP graphics bus, memory bus) bridged together, reflecting how different components' bandwidth/latency needs have diverged enough that one uniform shared bus no longer serves everyone well.`,
    related: ["mit6004-comm-bus-interfaces-vs-technology", "mit6004-comm-bus-transmission-lines"],
  },
  {
    id: "mit6004-comm-bus-transmission-lines",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why can't bus wires be treated as the ideal 'equipotential nodes' of circuit theory, and what three analog issues does treating them as transmission lines surface?",
    back: `**The circuit-theorist's simplifying view of wires**: equipotential "nodes" of a circuit, with *instant* propagation of voltage and current over the entire node — "space" is abstracted completely out of the design model, and timing issues are dictated purely by the circuit's RLC elements, treating wires themselves as timeless, zero-delay connections.

**The interconnect engineer's view, once wires get long or fast enough**: wires are actually **transmission lines** — finite signal propagation velocity means "**space matters**, **time matters**, **reality matters**." Concretely: signals travel at roughly **1 foot per nanosecond** in a typical wire (light-speed-limited) — for a bus spanning even a modest physical distance, this delay is no longer negligible relative to a fast clock period.

**Three specific analog issues this creates**: (1) **Propagation time** — a transition doesn't reach every point on a long bus instantaneously; different points see the signal at genuinely different moments. (2) **Skew** — different points along the bus see the *same* signal transition at *different* times relative to each other, complicating any assumption that "everyone samples the same value at the same instant." (3) **Reflections & standing waves** — at each interface where the wire's propagation medium or impedance changes, a signal transition can partially **reflect** back if impedances aren't properly matched; a transition on a long line may need to wait through **many** round-trip transition times before these echoes die down enough for the line to be considered "settled" and safely sampleable.

**Why this matters for protocol design**: these analog realities are exactly what motivate the specific timing disciplines (synchronous, self-timed bus protocols with explicit "settling time" and "de-skew time" margins, related card) used by real bus designs — a bus protocol that ignored these effects and simply sampled "as soon as" a signal changed would be reading garbage on any sufficiently long or fast physical bus.`,
    related: ["mit6004-comm-bus-synchronous-transaction"],
  },
  {
    id: "mit6004-comm-bus-synchronous-transaction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the roles of MASTER, SLAVE, and BUS in a simple synchronous bus transaction, and how multiplexed address/data buses trade latency for wire efficiency.",
    back: `**Coping with the analog issues** (related card) while staying technology-independent: **self-timed** protocols let transactions accommodate varying response times (rather than assuming a fixed, technology-specific delay); **asynchronous** protocols avoid needing to commit to one specific clock frequency — but pure asynchronous design is itself vulnerable to analog-domain hazards (e.g. the "wired-OR glitch": unpredictable transient behavior when a switch driving a shared line opens). The **common, practical compromise**: **synchronous, self-timed** protocols — broadcast a shared bus clock, but sample signals only at deliberately-chosen "**safe**" times (a *sample edge* well after a prior *assertion edge*, with enough margin — "settling time" and "de-skew time" — for the analog transients to have died down), explicitly dealing with noise and clock skew rather than ignoring them.

**A simple (non-multiplexed) bus transaction**: **MASTER** — (1) chooses the bus operation, (2) asserts an address, (3) waits for a slave to answer. **SLAVE** — (1) monitors the \`start\` signal, (2) checks the asserted address, (3) if the transaction is meant for it, looks at the requested operation and performs it, then signals \`finish\`. **BUS** (the shared infrastructure itself, not any single module) — (1) monitors \`start\`, (2) starts a countdown counter, (3) if no slave answers before the counter reaches 0, signals a **"time out"** — providing a defined, bounded failure mode rather than hanging forever waiting for a slave that (for whatever reason) never responds.

**Multiplexed buses — trading latency for wire count**: rather than dedicating separate, permanently-wired address and data buses, let the **address and data buses share the same physical wires**, using them for the address during one phase of the transaction and for data during another. On a **write**, the slave signals success/failure/retry by driving status onto the operation-control lines when it finishes. On a **read**, one cycle must be allotted purely for the bus to "**turn around**" (stop driving in one direction, begin driving in the other) before data can actually be read — and a slow slave can further **stall** the transaction (inserting extra "**wait-states**") by delaying its \`finish\` assertion for several clocks. Net effect: multiplexing genuinely **more efficient use of shared wires** (fewer total pins/traces needed), at the direct cost of **more clocks per transaction** (a non-multiplexed read might complete in 1-2 clocks; a multiplexed one needs 3+ clocks/word) — a concrete cost/complexity tradeoff, not a strictly-better design.`,
    related: ["mit6004-comm-bus-transmission-lines", "mit6004-comm-bus-arbitration"],
  },
  {
    id: "mit6004-comm-bus-arbitration",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe daisy-chain bus arbitration for multiple bus masters, and the four properties (fairness, bounded wait, utilization, scalability) an arbitration scheme is judged against.",
    back: `**The problem**: when a bus supports **multiple** potential masters (multiple processors, or smart I/O devices that can themselves initiate transactions), some mechanism must decide which module actually gets to use the shared bus at any given moment — this is **arbitration**.

**Daisy-chain arbitration**: modules are physically chained in a fixed priority order, each with a **Request-in/Grant-in** input and a **Request-out/Grant-out** output passed to the next module in the chain. A module wanting the bus asserts a shared \`Request\` line; the arbiter (or the highest-priority module in the chain) responds by propagating a **Grant** signal down the chain — each module in turn either **claims** the grant (if it's the one that requested) or **passes it along** to the next module, giving a simple, cheaply-wired priority ordering with no centralized decision logic needed beyond the chain itself.

**Four properties an arbitration scheme is judged against**: **Fairness** — given uniform requests, bus cycles should be divided evenly among modules, according to their actual needs, not systematically favoring modules earlier in some fixed chain. **Bounded Wait** — there should be an *upper bound* on how long any module has to wait between requesting and actually receiving a grant (an unfair-but-bounded scheme is at least predictable; an unbounded one risks starvation). **Utilization** — the arbitration scheme itself shouldn't waste bus cycles on overhead, allowing near-maximum actual bus performance. **Scalability** — the *cost* of arbitration (both hardware and time) should scale gracefully as more modules are added, not blow up disproportionately.

**State of the art**: with $N$ potential masters, arbitration schemes achieving $O(\\log N)$ time and $O(\\log N)$ wires are achievable (rather than, say, $O(N)$ wires for a naive one-request-line-per-module scheme, or $O(N)$ time for pure daisy-chaining in the worst case) — logarithmic scaling in both dimensions being the practically-achievable target for large-$N$ systems.`,
    related: ["mit6004-comm-bus-synchronous-transaction"],
  },
  {
    id: "mit6004-comm-bus-topologies-latency",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare the cost/latency/throughput tradeoffs across bus, crossbar, mesh, tree, and hypercube communication topologies, and explain the 'log-latency is a useful fiction' caveat.",
    back: `Generalizing a bus into broader **communication topologies** (connecting many nodes, not just a linear shared bus):

| Topology | Cost | Theoretical latency | Actual latency (physical constraints) |
|---|---|---|---|
| Complete graph (dedicated line per pair) | $\\Theta(n^2)$ | $\\Theta(1)$ | $\\Theta(\\sqrt[3]{n})$ |
| Crossbar switch | $\\Theta(n^2)$ | $\\Theta(1)$ | $\\Theta(n)$ |
| 1D Bus | $\\Theta(n)$ | $\\Theta(n)$ (one master at a time) | $\\Theta(n)$ |
| 2D Mesh | $\\Theta(n)$ | $\\Theta(\\sqrt{n})$ | $\\Theta(\\sqrt{n})$ |
| 3D Mesh | $\\Theta(n)$ | $\\Theta(\\sqrt[3]{n})$ | $\\approx\\Theta(\\sqrt[3]{n})$ |
| Tree | $\\Theta(n)$ | $\\Theta(\\log n)$ | $\\approx\\Theta(\\sqrt[3]{n})$ |
| N-cube (hypercube) | $\\Theta(n\\log n)$ | $\\Theta(\\log n)$ | $\\approx\\Theta(\\sqrt[3]{n})$ |

**Reading the table**: a **complete graph** connects every pair of nodes with a dedicated line — $\\Theta(n)$ simultaneous communications possible, but $\\Theta(n^2)$ cost. A **crossbar switch** achieves the same $\\Theta(1)$ theoretical any-pair latency with dedicated per-pair switching (still $\\Theta(n^2)$ cost) — special cases include one side being processors and the other memories. A plain **bus** costs only $\\Theta(n)$ but only **one** message can be delivered at a time, giving $\\Theta(n)$ latency under load. **Mesh** topologies (2D, 3D) offer nearest-neighbor point-to-point interconnect — minimizing both delay and "analog" transmission-line effects (related card) at each hop — with store-and-forward routing overhead, at genuinely sub-linear (though not constant) latency. **Trees** and **hypercubes (N-cubes)** achieve $\\Theta(\\log n)$ *theoretical* worst-case path length at only $\\Theta(n)$ (tree) or $\\Theta(n\\log n)$ (hypercube) cost — dramatically better than the complete graph's quadratic cost for comparable latency.

**The crucial caveat — "log-latency topologies: a useful fiction"**: the theoretical $\\Theta(\\log n)$ bounds for trees/hypercubes assume each hop takes constant time regardless of physical distance — but **physical reality** (speed of light: $\\sim$1 ns/foot; and the simple fact that a network with $n$ nodes occupying finite 3D space must have *some* links whose physical length grows as $n$ grows) means links on a tree or N-cube must **physically lengthen** as $n$ grows, so **time per link must also grow** with $n$ — bringing *actual* achievable latency for these "logarithmic" topologies back down to roughly $\\Theta(\\sqrt[3]{n})$ in practice (matching the best physically-realizable 3D-mesh-like bound), not genuinely $\\Theta(\\log n)$. **Density limits** (can a node shrink forever? power and heat dissipation constraints) further bound how far this scaling can be pushed in real hardware.`,
    pitfall:
      "The Θ(log n) hypercube/tree latency figures are asymptotic circuit-theory bounds that assume unit-time hops independent of physical distance — treating them as literally achievable at scale ignores that a network embedded in 3D physical space with n nodes necessarily has some links whose length (and hence propagation delay) grows with n, which is exactly what the 'actual latency' column and the closing 'useful fiction' framing are warning against.",
    related: ["mit6004-comm-bus-transmission-lines"],
  },

  // --- Lecture 21: Communicating processes — semaphores, synchronization, deadlock ---
  {
    id: "mit6004-comm-sync-precedence-constraints",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the two precedence constraints that synchronous producer/consumer communication must enforce, using the classic 'α precedes β' notation.",
    back: `**Setup — the producer/consumer problem**: a **PRODUCER** process repeatedly does some work then \`send(c)\`s a value; a **CONSUMER** process repeatedly \`c = rcv()\`s a value then does some work with it. Interprocess communication is needed whenever processes exhibit **concurrency**, **asynchrony**, want processes as a clean **programming primitive**, or need **data/event-driven** coordination — realized via shared memory (overlapping contexts), supervisor calls, or dedicated synchronization instructions with hardware support.

**Notation**: "**$\\alpha$ precedes $\\beta$**," written $\\alpha \\preceq \\beta$, means operation $\\alpha$ must complete before operation $\\beta$ is allowed to begin.

**Constraint 1 — can't consume before it's produced**: $\\text{send}_i \\preceq \\text{rcv}_i$ — the $i$-th receive cannot happen before the $i$-th send has completed (a consumer can't read the $i$-th item before the producer has actually produced it).

**Constraint 2 — producer can't overwrite before it's consumed**: $\\text{rcv}_i \\preceq \\text{send}_{i+1}$ — the $(i{+}1)$-th send cannot happen before the $i$-th receive has completed (with a single-slot communication channel, the producer must wait for the consumer to actually take the *previous* item before overwriting it with the next one).

**Why this framing matters**: these two precedence constraints are exactly what any correct interprocess communication mechanism — FIFO buffering (related card), semaphores (related card) — is ultimately responsible for **enforcing**; every subsequent mechanism in this lecture is judged by whether, and how efficiently, it guarantees these two constraints hold.`,
    related: ["mit6004-comm-sync-fifo-buffering", "mit6004-comm-sync-semaphores"],
  },
  {
    id: "mit6004-comm-sync-fifo-buffering",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does an N-character FIFO buffer relax the overwrite precedence constraint, and how is it implemented as a ring buffer?",
    back: `**The relaxation**: a direct, single-slot handoff (related card) forces the producer to wait for *every single* consume before producing the *next* item — overly restrictive when the consumer merely lags behind briefly rather than being permanently stuck. Inserting an **N-character FIFO buffer** between producer and consumer relaxes the overwrite constraint from $\\text{rcv}_i \\preceq \\text{send}_{i+1}$ (related card) all the way to:
$$\\text{rcv}_i \\preceq \\text{send}_{i+N}$$
— i.e., the producer may now run up to $N$ items **ahead** of the consumer before being forced to wait, rather than being lockstep-synchronized on every single item.

**Implementation — the "ring buffer"**: a fixed-size array with independent **Read pointer** and **Write pointer**, each wrapping around (modulo the buffer size) as they advance — the producer writes at the write pointer and advances it; the consumer reads at the read pointer and advances it; the two pointers chase each other around the ring, with the buffer being empty when they coincide and full when the write pointer has lapped the read pointer by $N$ slots. This is the standard, minimal-synchronization-overhead implementation of bounded producer/consumer buffering, and underlies the worked semaphore-based bounded-buffer solution (related card) that follows in the same lecture.`,
    related: ["mit6004-comm-sync-precedence-constraints", "mit6004-comm-sync-semaphores-bounded-buffer"],
  },
  {
    id: "mit6004-comm-sync-semaphores",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State Dijkstra's semaphore definition (the wait/signal operations) and its precise semantic guarantee.",
    back: `**Semaphores (Dijkstra)** — a programming construct purpose-built for synchronization. **New data type**: \`semaphore\` — an integer-valued variable, e.g. \`semaphore s = K;\` (initialize $s$ to $K$).

**New operations**, defined on semaphores: \`wait(semaphore s)\` — **stall** the current process if $s \\le 0$; otherwise, $s = s - 1$. \`signal(semaphore s)\` — $s = s + 1$ (this can have the side effect of letting another, previously-stalled process proceed, since it may push $s$ from $\\le 0$ back above 0). (Note: classic literature sometimes uses $P(s)$ for \`wait(s)\` — from Dutch "*proberen*"/"*passeren*," "try" or "pass" — and $V(s)$ for \`signal(s)\` — from "*verhogen*," "increase.")

**Semantic guarantee**: a semaphore $s$ initialized to $K$ enforces the constraint $\\text{signal}(s)_i \\preceq \\text{wait}(s)_{i+K}$ — this is precisely a **precedence relationship** (related card), meaning the $(i{+}K)$-th call to \`wait\` cannot proceed until the $i$-th call to \`signal\` has completed. Framed differently: a semaphore initialized to $K$ allows up to $K$ \`wait\`s to succeed *before* any corresponding \`signal\`s occur — exactly the right primitive for tracking a **pool of $K$ available resources** (related card), or, with $K=1$, for tracking mutually-exclusive access to a single shared resource (related card).`,
    related: ["mit6004-comm-sync-precedence-constraints", "mit6004-comm-sync-semaphores-bounded-buffer"],
  },
  {
    id: "mit6004-comm-sync-semaphores-bounded-buffer",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the semaphore-based bounded buffer solution, showing how a single 'chars' semaphore initially fails to prevent overflow and how adding a 'space' semaphore fixes it — enforcing both precedence constraints simultaneously.",
    back: `**First attempt — one semaphore, tracking filled slots**: \`semaphore chars=0;\` in shared memory. \`PRODUCER\`: \`buf[in]=c; in=(in+1)%N; signal(chars);\`. \`CONSUMER\`: \`wait(chars); c=buf[out]; out=(out+1)%N;\`. This correctly enforces $\\text{send}_i \\preceq \\text{rcv}_i$ (related card) — the consumer's \`wait(chars)\` genuinely blocks until the producer has \`signal\`ed that a character is available. **But it does NOT enforce the overwrite constraint** — nothing stops the producer from writing an $(N{+}1)$-th character into an already-full $N$-slot buffer, silently overwriting not-yet-consumed data: **overflow, randomness, havoc**.

**Second attempt — add a second semaphore, tracking empty slots**: \`semaphore chars=0, space=N;\` (space starts at $N$ — the buffer is entirely empty). \`PRODUCER\`: \`wait(space); buf[in]=c; in=(in+1)%N; signal(chars);\`. \`CONSUMER\`: \`wait(chars); c=buf[out]; out=(out+1)%N; signal(space);\`. Now: **two independent resource pools** are each managed by their own semaphore — \`chars\` tracks "characters available to consume" (bounding how far the consumer can get *ahead*), \`space\` tracks "empty slots available to fill" (bounding how far the producer can get *ahead*). A single synchronization primitive (the semaphore), applied twice with complementary roles, **simultaneously enforces both** precedence constraints from earlier (related card): $\\text{send}_i \\preceq \\text{rcv}_i$ (via \`chars\`) and $\\text{rcv}_i \\preceq \\text{send}_{i+N}$ (via \`space\`) — exactly the FIFO-buffer relaxation (related card), now genuinely correctly implemented.

**Remaining gap, addressed next**: this version "works with a **single** producer, single consumer" — but says nothing yet about what happens with **multiple simultaneous producers** (or consumers) racing to update the same shared \`in\`/\`out\` index variables — the mutual-exclusion problem (related card).`,
    pitfall:
      "A single semaphore tracking only 'items available' looks sufficient at first (it correctly gates the consumer) but silently permits producer-side buffer overflow — bounded producer/consumer synchronization genuinely needs TWO semaphores (one per direction of the precedence constraint), not one.",
    related: ["mit6004-comm-sync-semaphores", "mit6004-comm-sync-mutual-exclusion"],
  },
  {
    id: "mit6004-comm-sync-mutual-exclusion",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Using the simultaneous-ATM-withdrawal example, explain critical sections and mutual exclusion, and show how a binary ('lock') semaphore solves it.",
    back: `**The problem, concretely**: two processes debit the same account "simultaneously" — \`Debit(int account, int amount) { t = balance[account]; balance[account] = t - amount; }\` — compiled to \`LD(R10,balance,R0); SUB(R0,R1,R0); ST(R0,balance,R10)\`. If both processes' instruction streams **interleave** (e.g. both LD the same starting balance before either ST's its result back), the *second* write can silently **overwrite** the effect of the first — net result: only *one* \$50 debit is reflected in the balance, even though two genuinely occurred. The same bug pattern reappears in the bounded-buffer code with **multiple producers**: two producer processes both compute \`buf[in]=c; in=(in+1)%N;\` using the *same* shared \`in\` index — their interleaved execution can cause one producer's write to be **lost** entirely.

**The general concept**: code segments where we need to guarantee that **no two executions overlap** are called **critical sections**; the constraint that enforces this is **mutual exclusion**.

**Solution — embed critical sections in wrappers ("transactions") guaranteeing atomicity**, using a **binary semaphore** ("lock"), initialized to 1: \`semaphore lock=1; Debit(...) { wait(lock); /* critical section */ t=balance[account]; balance[account]=t-amount; signal(lock); }\`. Since \`lock\` starts at 1, only **one** process can successfully \`wait(lock)\` (decrementing it to 0) at a time; any other process attempting \`wait(lock)\` concurrently **stalls** until the first process's \`signal(lock)\` releases it — genuinely serializing access to the critical section, regardless of how the two processes' instructions happen to interleave at the hardware level.

**A real design question this raises — granularity of locking**: should there be *one* lock for the entire balance database (simple, but serializes *all* debits system-wide, even to unrelated accounts)? One lock *per account* (more concurrency, more locks to manage)? Some coarser intermediate grouping? This tradeoff — between correctness-preserving serialization and unnecessarily limiting legitimate concurrency — is a recurring real-world concern whenever mutual exclusion is applied to shared data at scale.`,
    pitfall:
      "The bounded-buffer producer/consumer semaphores (chars, space) solve the PRECEDENCE problem, not the mutual-exclusion problem — with multiple producers, adding chars/space alone is not enough; a SEPARATE mutex semaphore is needed specifically to protect the shared 'in'/'out' index updates from concurrent, interleaved corruption.",
    related: ["mit6004-comm-sync-semaphores-bounded-buffer", "mit6004-comm-sync-semaphore-implementation"],
  },
  {
    id: "mit6004-comm-sync-semaphore-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Compare the three approaches to actually implementing semaphores (SVC/kernel atomicity, hardware test-and-clear, Dijkstra's 2-phase scheme), and explain the bootstrapping role of a simple binary lock.",
    back: `**The core problem any semaphore implementation must solve**: an **arbitration** problem — when multiple processes are simultaneously waiting and a \`signal\` occurs, some **atomicity** assumption in the implementation technology must determine, unambiguously, which single waiting process gets to proceed, without a race condition in *that decision itself*.

**Approach 1 — SVC implementation, using atomicity of kernel handlers**: implement \`wait\`/\`signal\` as supervisor calls (Module 6, related concept) — since kernel-mode handlers are themselves non-reentrant/uninterruptable (Module 6's kernel-mode card), the semaphore's internal bookkeeping is automatically protected by that same non-reentrance guarantee. Works cleanly on a **timeshared processor sharing a single uninterruptable kernel** — but doesn't directly generalize to genuinely simultaneous *multiple* physical processors, since kernel-mode non-reentrance on one CPU says nothing about a second CPU's kernel-mode execution happening at the exact same physical instant.

**Approach 2 — a special atomic instruction (e.g. "test and set"/\`TCLR\`)**: relies on the **atomicity of a single instruction's execution** — e.g. \`TCLR(RA, literal, RC)\`: computes an effective address, reads the memory location there into $RC$, then **unconditionally writes 0** to that same location — with the read-then-write guaranteed, by hardware (e.g. via bus protocol guarantees), to happen as one indivisible unit, uninterruptible even by another processor's simultaneous access to the same location. This approach **works with shared-bus multiprocessors** supporting atomic read-modify-write bus transactions, genuinely generalizing beyond the single-timeshared-kernel case Approach 1 is limited to.

**Approach 3 — Dijkstra's original 2-phase scheme**: a complex, clever construction achieving semaphore semantics using only the atomicity of **individual** read or write operations (no dedicated read-modify-write instruction needed at all) — historically important as a proof that semaphores don't strictly *require* special hardware, but **unused in practice**, since real hardware providing a dedicated atomic instruction (Approach 2) is both simpler to implement correctly and simpler to reason about.

**Bootstrapping**: a simple **binary semaphore** ("lock") — built directly from whichever atomicity primitive is actually available (a \`TCLR\`-based spin-wait/signal pair is the concrete worked example) — is sufficient to then implement **full, general-valued** semaphore support entirely in software on top of it: one small atomic primitive, correctly implemented once, bootstraps the richer synchronization abstraction used throughout the rest of the system.`,
    related: ["mit6004-comm-sync-mutual-exclusion"],
  },
  {
    id: "mit6004-comm-sync-deadlock",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the four necessary conditions for deadlock (illustrated via Dining Philosophers), and describe the fixed-resource-ordering avoidance solution with its proof sketch.",
    back: `**Dining Philosophers** (a famous toy problem for illustrating resource-deadlock): $N$ philosophers sit around a table with $N$ chopsticks interspersed between them; each needs **both** neighboring chopsticks to eat. The naive protocol — "take (wait for) LEFT stick; take (wait for) RIGHT stick; eat; replace both sticks" — can **deadlock**: if every philosopher simultaneously picks up their left stick first, **every** philosopher is now permanently waiting for their (already-taken-by-a-neighbor) right stick — no one can ever make progress.

**Four necessary conditions for deadlock** (all four must hold simultaneously for deadlock to be possible): (1) **Mutual exclusion** — only one process can hold a given resource at a time. (2) **Hold-and-wait** — a process holds already-allocated resources while waiting for others. (3) **No preemption** — a resource cannot be forcibly removed from a process holding it. (4) **Circular wait** — a cycle of processes exists, each waiting for a resource held by the next.

**Avoidance solution — a fixed global resource ordering**: assign a **unique number** to each shared resource (each chopstick), and require **all** processes to request resources strictly in that globally-consistent numeric order. Revised philosopher algorithm: "take LOW-numbered stick; take HIGH-numbered stick; eat; replace both sticks." **Proof sketch that this eliminates deadlock**: suppose deadlock occurred anyway — then every philosopher is waiting for a resource held by some other philosopher. But consider the philosopher currently holding the **highest-numbered** chopstick in the whole system — by the ordering rule, that philosopher must have acquired it *second* (as their high stick), meaning they already successfully held their low stick *first*; they cannot possibly be **waiting** for anything held by anyone else (they hold both sticks they need, or are about to complete acquiring their second) — contradicting the hold-and-wait assumption for *that specific philosopher*. Since deadlock requires *every* participant to be stuck waiting, and this one participant provably cannot be, **no deadlock is possible** under this ordering discipline.

**General technique, beyond chopsticks**: this same fixed-ordering discipline generalizes directly to any multi-resource acquisition — e.g. a bank transfer between two accounts should acquire locks in a canonical order (say, always the numerically-lower account number first) rather than in caller-supplied order, to guarantee no circular-wait cycle can ever form.

**Two families of solutions in general**: **avoidance** (structurally prevent one of the four necessary conditions from ever holding, as the fixed-ordering scheme does for circular wait) versus **detection and recovery** (let the system run unconstrained, have the OS actively detect circular-wait cycles when they occur, and kill/roll-back a waiting process to break the cycle) — detection-and-recovery is a genuinely **hard problem** in general (the "transaction model," with its own rollback/retry machinery, is the typical real-world mechanism), used when avoidance's upfront ordering discipline is impractical to impose on all participants.`,
    pitfall:
      "All FOUR conditions (mutual exclusion, hold-and-wait, no preemption, circular wait) are individually NECESSARY for deadlock — breaking any single one is sufficient to prevent it. The fixed-ordering solution specifically attacks circular wait; other systems instead attack hold-and-wait (require acquiring all needed resources atomically, up front) or allow preemption — there's no single 'the' deadlock fix, only a choice of which condition to structurally rule out.",
    related: ["mit6004-comm-sync-mutual-exclusion"],
  },

  // --- Lecture 24: Parallel processing, shared memory, cache coherence ---
  {
    id: "mit6004-comm-par-ilp-vs-tlp",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does achieving CPI < 1 require, and what are the two places (ILP vs. TLP) parallelism can be found to achieve it?",
    back: `**Stepping back**: everything built so far in the course (Modules 5-6) targeted executing a **single thread** of execution — one static program, tracing out one dynamic execution path (its **"path length"** = number of instructions actually executed along that path) — as fast as possible. Total execution time $= \\dfrac{\\text{Path Length} \\times \\text{Clocks-per-Instruction}}{\\text{Clocks-per-second}}$; everything up through pipelining targeted **CPI = 1** as the practical floor (Module 5's "RISC simplicity" discussion).

**Can CPI go below 1?** This would require **completing more than one instruction per clock cycle** — genuinely executing multiple instructions' worth of work simultaneously, not merely overlapping different *stages* of single-instruction-at-a-time pipeline flow.

**Two distinct places to find this additional parallelism**: **Instruction-Level Parallelism (ILP)** — fetch and issue **groups of independent instructions within a single thread of execution** simultaneously (the hardware itself finds independent instructions inside one program's instruction stream and executes several at once). **Thread-Level Parallelism (TLP)** — simultaneously execute **multiple, genuinely separate** execution streams (multiple programs, or multiple independent parts of one program) side by side. These are **not mutually exclusive** — real systems, and the rest of this closing lecture, explore both directions and their various hardware realizations (superscalar/VLIW for ILP; SIMD/MIMD for TLP-adjacent approaches).`,
    related: ["mit6004-comm-par-superscalar-simd", "mit6004-comm-par-mimd-smp"],
  },
  {
    id: "mit6004-comm-par-superscalar-simd",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast superscalar ILP execution with SIMD (Single Instruction, Multiple Data) processing, including SIMD's characteristic difficulty with conditional branching.",
    back: `**Superscalar parallelism** (exploiting ILP): hardware performs **multiple instruction dispatch** each cycle — fetching, decoding, and issuing several instructions from a single thread's stream simultaneously to multiple execution units, using structures like an instruction queue, reorder buffer, and multiple parallel execution/load-store units, often combined with **speculative execution** (guessing branch outcomes and executing ahead, to avoid stalling on control-flow uncertainty). Framed as "**popular now, but the limits are near**" — real designs have pushed to roughly 8-way issue, with steeply diminishing returns (and rapidly growing hardware complexity/power cost) beyond that, since genuinely independent instructions become progressively harder to find in ordinary sequential code as the issue width grows.

**SIMD (Single Instruction, Multiple Data) processing**: multiple **independent datapaths**, each with its **own local register file**, but all executing the **exact same instruction** simultaneously, each against its *own* private data. This is a form of parallelism that trades ILP-style hardware complexity (dependency detection, dynamic scheduling) for structural simplicity — one shared instruction stream, replicated data lanes.

**SIMD's characteristic difficulty — conditional branching**: what happens if, mid-loop, only *some* of the parallel datapaths' local data satisfies a branch condition (e.g. "if $R1 = 0$") while others don't? Since every datapath must execute the **same** instruction stream in lockstep, genuinely divergent control flow is awkward. The typical resolution: model conditional *operations* rather than conditional *branches* — e.g. \`if (flag1) Rc = Ra <op> Rb\`, where each datapath conditionally *executes* (or discards the effect of) an operation based on its own local flag, rather than actually branching to different code — with **global AND/OR-ing of flag registers** used for higher-level, coarser control decisions that genuinely do need to be made uniformly across all lanes. The overarching strategy: **"hide" parallelism inside primitives** (e.g. vector operations) that a compiler or programmer invokes explicitly, rather than exposing per-lane divergent control flow as a general capability.`,
    related: ["mit6004-comm-par-ilp-vs-tlp", "mit6004-comm-par-vliw"],
  },
  {
    id: "mit6004-comm-par-simd-coprocessing",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe SIMD coprocessing units (e.g. Intel MMX/SSE) as an incremental addition to a traditional CPU core, and explain the 'partitionable datapath / packed operands' idea.",
    back: `Rather than building an entirely separate SIMD machine, real processors commonly add a **SIMD coprocessing unit** as an incremental extension to an otherwise-ordinary CPU core (examples cited: Intel **MMX/SSE**, Sparc **VIS**). Common structural properties: **register-only operands** (the SIMD unit operates purely on wide registers, not directly on memory — the core CPU still handles all memory traffic/addressing); **partitionable datapaths** supporting variable-sized "**packed operands**" — the *same* physical wide ALU hardware (e.g. a 64-bit-wide datapath) can be configured, instruction-by-instruction, to instead operate as **two** 32-bit ALUs, or **four** 16-bit ALUs, or **eight** 8-bit ALUs — reusing one piece of hardware to serve several different data-granularity needs rather than building separate fixed-width units for each.

**Why this particular set of data sizes**: it maps well onto real workload needs — **graphics** (pixel components often fit naturally in 8- or 16-bit fields), **signal processing** (16-bit audio samples), and general **multimedia applications**, where a single wide register conveniently holds many independent small values that all need the identical arithmetic operation applied (adding, multiplying, packing/unpacking between widths). Representative MMX-style instructions: \`PADDB\` (add packed bytes), \`PADDW\` (add packed 16-bit words), \`PADDD\` (add packed 32-bit words, with optional saturation instead of wraparound on overflow), \`PSUB\` variants, \`PMULTLW\`/\`PMULTHW\` (packed multiply, low/high half of result), \`PMADDW\` (multiply-and-add), plus \`PACK\`/\`UNPACK\`/\`PAND\`/\`POR\` for rearranging and combining packed data between different granularities.`,
    related: ["mit6004-comm-par-superscalar-simd"],
  },
  {
    id: "mit6004-comm-par-vliw",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the VLIW (Very Long Instruction Word) approach to exposing instruction-level parallelism, and how it differs philosophically from superscalar execution.",
    back: `**VLIW (Very Long Instruction Word)** — a variant approach to instruction-level parallelism: a **single, very wide instruction** directly controls **multiple heterogeneous datapaths** simultaneously (e.g. one field controlling an integer ALU, another controlling a floating-point multiplier, another a floating-point adder, another a load/store unit — all specified explicitly, together, within one instruction word).

**The key philosophical difference from superscalar**: superscalar hardware (related card) takes ordinary, sequentially-written code and *dynamically discovers*, at run time, which instructions happen to be independent enough to issue together — all the complexity of dependency detection and scheduling lives in **hardware**. VLIW instead **exposes parallelism directly to the compiler** — the *compiler* is responsible for statically analyzing the code and packing genuinely independent operations together into single wide instructions ahead of time; the hardware itself stays comparatively simple, since it no longer needs to *discover* parallelism, only *execute* the parallelism the compiler already identified and encoded.

**The resulting tradeoff — software vs. hardware complexity**: VLIW trades hardware complexity for **compiler** complexity (a genuinely hard static-scheduling problem, since the compiler must correctly predict things like memory latencies and dependencies without runtime information a dynamic superscalar scheduler would have available) and for **code portability/compatibility** friction (a VLIW binary is tied to the exact datapath configuration it was compiled for — adding an execution unit, or changing a latency, generally requires recompilation, unlike superscalar hardware's ability to schedule the *same* unmodified binary differently as microarchitecture evolves).`,
    related: ["mit6004-comm-par-superscalar-simd", "mit6004-comm-par-mimd-smp"],
  },
  {
    id: "mit6004-comm-par-mimd-smp",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe MIMD (Multiple Instruction, Multiple Data) as the hardware realization of thread-level parallelism, and its two main problems (scalability, synchronization).",
    back: `**MIMD (Multiple Instruction, Multiple Data)** — exploiting **Thread-Level Parallelism** by giving each of several complete processors its own independent instruction stream, all sharing a **common main memory**. Attractive because it **leverages existing CPU designs** (each processor can be an ordinary, already-designed single-threaded core — no new per-processor architecture needed) and makes it **easy to map "processes/threads" to "processors"** — one thread per physical processor, sharing data and program through the common memory, with the whole arrangement being straightforwardly **upgradeable** (add more processor+cache units to the shared memory bus).

**This specific shared-memory MIMD organization is called a Symmetric Multi-Processor (SMP)**: multiple identical processors, each with its own local cache, connected to one shared main memory.

**The two problems this raises**: **Scalability** — as more processors are added to a single shared memory/bus, contention for that shared resource grows, eventually limiting how many processors can be usefully added before the shared memory itself becomes the bottleneck. **Synchronization** — genuinely coordinating access to shared data across multiple *simultaneously*-executing processors (not merely time-sliced on one CPU, as in Modules 5-6's process/scheduling material) raises correctness questions the rest of this closing lecture works through in detail: does shared memory even behave the way programmers naively expect when multiple processors are truly concurrent (related "does it even work?" and sequential-consistency cards), and how do per-processor caches avoid serving each other stale data (the cache-coherence/snooping card)?`,
    related: ["mit6004-comm-par-vliw", "mit6004-comm-par-sequential-consistency"],
  },
  {
    id: "mit6004-comm-par-sequential-consistency",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Using the worked x/y/print example, state the definition of sequential consistency, and show which printed outcomes are possible vs. provably impossible.",
    back: `**The question — "does it even work?"**: consider two trivial processes, sharing memory containing $x=1, y=2$ initially: Process A does \`x=3; print(y);\`; Process B does \`y=4; print(x);\`, running **genuinely simultaneously** on separate processors $P_1$, $P_2$ (not merely time-sliced).

**Sequential consistency — the semantic constraint**: the result of executing $N$ parallel programs should correspond to **some** valid *interleaved* execution of those same programs on a **single** (hypothetical, timeshared) processor — i.e., whatever actually happens under true parallel execution must be indistinguishable from *some* legitimate way of interleaving the two programs' instructions one-at-a-time, even though no such literal interleaving is actually occurring.

**Working the example — timeshared/uniprocessor interleavings** (mixing A's and B's instructions in every legal order, respecting each program's own internal sequential order): the six possible orderings of \`x=3\`, \`print(y)\`, \`y=4\`, \`print(x)\` (respecting that \`x=3\` must precede \`print(y)\` within A, and \`y=4\` must precede \`print(x)\` within B) yield only the possible printed-value **pairs** (A-prints, B-prints): $(2,3)$, $(4,3)$, $(4,1)$ — i.e., possible printed values for (y-by-A, x-by-B) include $2,3$; $4,3$; and $4,1$, but **NOT** $2,1$ — since $2,1$ would require *both* prints to see the *original*, pre-update values simultaneously, which cannot happen in **any** legal single-processor interleaving (whichever instruction runs first among \`x=3\` and \`y=4\` necessarily updates a value the *other* process's print could then observe).

**The sequential-consistency verdict**: printed values $(2,3)$, $(4,3)$, $(4,1)$ are each **possible** (each corresponds to at least one valid interleaved execution) — a genuinely parallel implementation is free to produce any of them, since a sequentially-consistent single-processor equivalent exists for each. But $(2,1)$ is **impossible** under sequential consistency — no valid interleaving produces it — so a correctly-sequentially-consistent parallel machine must **never** produce that outcome, however its actual hardware happens to be built. This gives a precise, checkable correctness criterion for parallel hardware/memory-system design: does it ever produce an outcome that **no** sequential interleaving could have produced?`,
    pitfall:
      "'Sequential consistency' doesn't mean parallel execution must produce a UNIQUE, predictable outcome — multiple different outcomes (here, (2,3), (4,3), and (4,1)) are all legitimately possible, since different valid interleavings exist. The correctness bar is narrower and more specific: never produce an outcome that corresponds to NO valid interleaving at all.",
    related: ["mit6004-comm-par-mimd-smp", "mit6004-comm-par-cache-coherence-snooping"],
  },
  {
    id: "mit6004-comm-par-cache-coherence-snooping",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Explain why per-processor caching threatens sequential consistency, why write-through alone doesn't fix it, and how snoopy caches (with the MESI protocol) restore correctness.",
    back: `**The problem — cache incoherence**: revisit the sequential-consistency example (related card), but now each processor has its **own local cache**. Suppose $P_1$'s cache holds $x=3, y=2$ and $P_2$'s cache holds $x=1, y=4$ — each cache reflects *its own* processor's writes but is unaware of the *other* processor's writes to the *same* shared variables. Process A (on $P_1$) does \`x=3; print(y);\` and Process B (on $P_2$) does \`y=4; print(x);\` — but $P_2$'s \`print(x)\` reads $x=1$ from its own stale local cache, never seeing $P_1$'s update at all. **Crucially, the problem is not that main memory itself has a stale value** — it's that **other caches** may hold stale copies, entirely independent of whatever main memory correctly contains.

**Does write-through help? NO.** Even if every write is immediately propagated all the way to main memory (write-through, Module 5), that alone does nothing to inform *other processors' already-cached copies* that their data is now stale — write-through keeps memory itself current, but says nothing about invalidating or updating copies sitting in other caches.

**The fix — "snoopy" caches**: every cache **monitors ("snoops") the shared bus** for transactions from *other* caches. When $P_1$ writes 3 into $x$, its write-through cache generates a visible bus transaction; $P_2$'s cache, snooping that same bus, **sees** the transaction and either **invalidates** its own stale copy of $x$ (forcing a fresh re-fetch on next access) or directly **updates** its copy to match — either way, restoring the guarantee that no cache can silently continue serving a value some other processor has since overwritten.

**MESI — the concrete two-bit state machine**: each cache line carries a two-bit state — **Invalid** (unused); **Shared** (read-only, valid, not dirty — potentially shared with other read-only copies elsewhere; must invalidate other copies before this processor writes to it); **Exclusive** (this cache holds the *only* copy; read-write, valid; on a local write it transitions to Modified); **Modified** (exclusive access, read-write, valid, dirty — must eventually be written back to memory; meanwhile can be freely read/written by the local processor with no further bus traffic needed). A defined transition table specifies exactly how each state responds to local read/write hits/misses and to *snooped* remote read/write bus transactions — giving a complete, implementable protocol that restores sequential consistency in the presence of per-processor caching, at the cost of the extra bus-monitoring hardware and coherence-protocol traffic every cache must now participate in.`,
    related: ["mit6004-comm-par-sequential-consistency", "mit6004-comm-par-weak-consistency"],
  },
  {
    id: "mit6004-comm-par-weak-consistency",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Describe weak consistency as an alternative to sequential consistency, and the role of an explicit memory-barrier instruction.",
    back: `**"Who needs sequential consistency, anyway?"** — sequential consistency (related card) is a strong, intuitive guarantee, but genuinely **expensive** to maintain at scale (the coherence-protocol traffic and bus-snooping overhead, related card, grows with the number of processors and their memory-access rate) — motivating alternative, deliberately **weaker** memory semantics that sacrifice some of that intuitive guarantee in exchange for performance.

**Weak consistency — the easier goal**: memory operations issued by **each individual processor** still appear to be performed in the order that processor issued them (a per-processor ordering guarantee is retained) — but memory operations from **different** processors are now permitted to **overlap in arbitrary ways**, with **no** requirement that the overall result correspond to *any* consistent global interleaving. This is a strictly weaker guarantee than sequential consistency: outcomes that sequential consistency would have ruled out as "impossible" (like the $(2,1)$ case, related card) can now legitimately occur under weak consistency, since there's no longer any promise of a globally-consistent interleaving at all.

**The alternative approach this enables**: **weak consistency by default** (cheap, fast — no expensive continuous global-ordering enforcement needed for ordinary memory operations) **plus** an explicit **MEMORY BARRIER** instruction: executing a barrier **stalls the issuing processor until all of its previous memory operations have genuinely completed** (fully propagated/visible), giving the programmer (or compiler) a deliberate, opt-in tool to insert exactly the ordering guarantees actually needed at specific critical points (e.g. immediately before releasing a lock, or immediately after acquiring one) — rather than paying the cost of full sequential consistency's ordering guarantee on **every single** memory operation, most of which don't actually need it. This "fast by default, strict only where explicitly requested" pattern is the general strategy real high-performance multiprocessor memory systems use to balance correctness against the genuine cost of enforcing it universally.`,
    related: ["mit6004-comm-par-cache-coherence-snooping"],
  },
];
