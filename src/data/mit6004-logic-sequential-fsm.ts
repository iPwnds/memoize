// MIT 6.004 (Spring 2009) — Lectures 4-7: combinational logic synthesis
// (sum-of-products, minimization, muxes, ROMs), sequential logic (storage,
// latches, edge-triggered flip-flops), finite state machines (formal
// definition, equivalence, minimization), and synchronization/metastability
// (the asynchronous arbiter's provable unsolvability, and the practical
// engineering response). Continues the all-new hardware territory from
// Module 1 — no overlap with any prior course. See src/data/courses.ts for
// the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6004-logic";

export const mit6004LogicSequentialFsmCards: Card[] = [
  {
    id: "mit6004-logic-sum-of-products",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the systematic sum-of-products (SOP) synthesis procedure, and explain why NAND and NOR gates alone suffice to build any Boolean function.",
    back: `**Sum-of-products synthesis**: (1) write the functional spec as a truth table; (2) write a Boolean expression with one product (AND) term covering each row where the output is 1, then OR all those terms together — e.g. $Y = \\overline{C}\\overline{B}A + \\overline{C}BA + CB\\overline{A} + CBA$ directly from a truth table's four 1-rows. (3) wire up inverters/ANDs/ORs. This always produces a **3-level** circuit (inverters, then ANDs, then one OR), giving propagation delay of no more than 3 gate delays regardless of how many inputs the function has (assuming gates with unlimited fan-in) — systematic, guaranteed to work, and easy, though not necessarily minimal.

**Universality of NAND/NOR**: there are only 16 possible 2-input gates (each of the 4 input combinations independently maps to 0 or 1, giving $2^4=16$ truth tables) — most are useless (constant-0, constant-1, "just copy input A," etc.), but **AND, OR, and NOT together are sufficient** to build any Boolean function (this is exactly what a Boolean expression *is* — a formula in these three operations). Since CMOS gates are naturally inverting (related card), and De Morgan's law gives $\\overline{A}\\cdot\\overline{B} = \\overline{A+B}$ and $\\overline{A}+\\overline{B}=\\overline{A\\cdot B}$, a **single** gate type — either NAND alone or NOR alone — can implement AND, OR, *and* NOT by appropriate composition (e.g. a NAND gate with both inputs tied together is an inverter; two cascaded NANDs, with the second's inputs tied together, form an AND). This is why NAND and NOR are each individually called **universal** gates — an entire digital system can in principle be built from just one of them, repeated.`,
    related: ["mit6004-basics-cmos-gate-synthesis"],
  },
  {
    id: "mit6004-logic-tree-vs-fanin",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare building an N-input XOR as a chain, a balanced tree of 2-input gates, and a single large-fan-in gate — what's each one's propagation delay, and when does the 'better' asymptotic option actually lose?",
    back: `**Chain (linear cascade)** of 2-input XOR gates, each with $t_{PD}=1$: computing an $N$-input XOR (parity — output 1 iff an odd number of inputs are 1) by feeding each gate's output into the next costs $t_{PD} = O(N)$ in the **worst case** — a signal on the last input has to ripple through every gate in sequence.

**Balanced binary tree** of the same 2-input gates: arrange the $N$ inputs as leaves of a tree, combining pairs level by level. The tree has $O(\\log N)$ **levels**, so signal propagation takes $O(\\log N)$ gate delays — asymptotically much better than the chain for large $N$. This raises a natural generalization: can *every* $N$-input Boolean function be implemented as a tree of 2-input gates, achieving $O(\\log N)$ delay in general (not just for XOR)? Yes, in principle, following the same divide-and-combine structure.

**Large fan-in gate** (e.g. an $N$-input OR built directly in CMOS as $N$ pulldown transistors in parallel with complementary pullup logic — the output is HIGH if *any* input is HIGH): propagation delay here is $O(N)$, since each additional MOSFET added to the pulldown network contributes its own parasitic capacitance to charge/discharge — asymptotically *worse* than the tree's $O(\\log N)$.

**The catch — constants matter for realistic $N$**: "don't be misled by the big-$O$ stuff" — the tree's $O(\\log N)$ has larger per-level overhead (each level is a separate gate, each with its own $t_{PD}$), while the direct large-fan-in gate's $O(N)$ has a much smaller constant per additional input (just one more transistor's worth of capacitance). For **small** $N$ (in the slide's example, roughly $N < 4$), the asymptotically "worse" large-fan-in gate is actually **faster** in absolute terms — a direct illustration that asymptotic analysis describes trends for large inputs, not a universal ranking valid at every scale.`,
    pitfall:
      "Asymptotically better (O(log N) vs O(N)) does not mean better for every actual N — this is a concrete, quantified example (not just a hand-wave) of where the crossover point matters: for small enough N, the option with worse big-O growth can have the lower actual constant and win outright.",
    related: ["mit6004-logic-sum-of-products"],
  },
  {
    id: "mit6004-logic-boolean-minimization",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through algebraic Boolean minimization using the reduction identity, and explain the counterintuitive case where a MINIMAL sum-of-products circuit is worse than a non-minimal one.",
    back: `**Boolean algebra toolkit**: OR rules ($a+1=1$, $a+0=a$, $a+a=a$), AND rules ($a\\cdot1=a$, $a\\cdot0=0$, $a\\cdot a=a$), commutative/associative/distributive laws, complements ($a+\\overline{a}=1$, $a\\overline{a}=0$), absorption ($a+ab=a$), **reduction** ($\\alpha a + \\alpha\\overline{a} = \\alpha$, for any expression $\\alpha$ and variable $a$ — the key tool for minimization), and De Morgan's law.

**Worked minimization**: $Y = \\overline{C}BA + CB\\overline{A} + CBA + \\overline{C}BA$ — group the last three terms sharing the factor $CB$: rewrite as $Y = \\overline{C}BA + CB(\\overline{A}+A) = \\overline{C}BA + CB$ — wait, applying reduction directly: group $CB\\overline{A}+CBA = CB(\\overline{A}+A)=CB$, leaving $Y = \\overline{C}BA + CB$, then further reducing gives $Y = \\overline{C}A + CB$ (fewer literals, fewer gates) than the original 4-term, 12-literal sum-of-products form.

**A case FOR non-minimal SOP — the glitch/hazard problem**: consider two circuits computing the *same steady-state* function but built differently — a minimized 2-term version ($Y=\\overline{C}A+CB$) versus the original, less-minimal 3-term version ($Y=\\overline{C}A+CB+AB$, which includes a *redundant* term $AB$ that's logically implied by the other two). When input $A$ and $C$ change simultaneously (e.g. $C: 0\\to1$ while $A$ stays 1, with $B=1$), the **minimized** circuit can produce a brief, spurious 0-glitch at the output before settling to the correct steady-state 1 — because momentarily, *neither* remaining term is asserted during the transition. The **non-minimal** circuit, because the extra $AB$ term stays asserted throughout the transition (it doesn't depend on $C$ at all), never glitches — it's **lenient** with respect to this particular input transition, while the minimal circuit is not.

**Lesson**: minimizing gate count is not a free lunch — it can silently introduce transient hazards (glitches) that a designer must either tolerate (if downstream logic is insensitive to brief glitches) or deliberately avoid by keeping "redundant" terms that cover a transition's worst case.`,
    pitfall:
      "Two circuits can have IDENTICAL steady-state (settled) behavior while differing significantly in their TRANSIENT behavior during input changes — Boolean algebra alone (which only reasons about steady-state truth values) cannot detect or predict this difference; it requires separately reasoning about which terms remain asserted during a given transition.",
    related: ["mit6004-logic-sum-of-products", "mit6004-basics-cmos-timing-contract"],
  },
  {
    id: "mit6004-logic-mux-rom-synthesis",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Explain how a multiplexer can implement any 2-input Boolean gate, and how a ROM generalizes this into a universal table-lookup device for any combinational function.",
    back: `A 2-input **multiplexer (MUX)** selects one of two data inputs $D_0, D_1$ based on a select line $S$: $Y = D_0$ if $S=0$, $Y=D_1$ if $S=1$. Because $D_0$ and $D_1$ can themselves be tied to constants or to other signals, a single 2-input MUX can implement **any** 2-input gate by appropriate wiring — e.g. tying $D_0=0, D_1=A$ with select $=B$ gives $Y=AB$ (AND); other constant/signal assignments give OR, XOR, etc. This generalizes: **muxes are universal**.

**Don't-cares reveal implementation opportunities**: rewriting a truth table using "$-$" for input combinations where a variable's value doesn't affect the output (e.g. rows $C=0, A=0$ giving $Y=0$ regardless of $B$) directly exposes which inputs a minimal circuit can safely ignore in a given branch — the same information Boolean minimization (related card) extracts algebraically, but read directly off a restructured table.

**ROM (Read-Only Memory) as universal table-lookup**: generalize the MUX idea to $2^k$ data inputs selected by $k$ select lines — a **decoder** (k select inputs, $N=2^k$ data outputs, exactly one output asserted at a time) paired with a large OR/selector network implements *any* truth table of $k$ inputs directly, by literally storing the desired output for every input combination ("address"). A ROM's size for an $N$-input Boolean function with $m$ outputs is $2^N \\times m$ bits — the **size, layout, and design are completely independent of the function being computed**; changing the implemented function means only reprogramming the stored values (via a different metal layer for masked ROMs, blown fuses for field-programmable ROMs, or trapped charge for EPROMs), never changing the circuit's structure. Real ROM layouts use **2D addressing** (a square array with row/column decoders) rather than one giant decoder, since long wires slow down propagation — the same locality-of-wiring concern that motivates most large-scale digital layout decisions.`,
    pitfall:
      "ROM size grows as 2^N in the number of inputs N — this exponential blowup means ROM-based table lookup is only practical for functions with a genuinely small number of inputs; it's a universal synthesis technique in principle, not a scalable one for arbitrary N.",
    related: ["mit6004-logic-sum-of-products", "mit6004-logic-fsm-hardware-implementation"],
  },
  {
    id: "mit6004-logic-seq-storage-and-feedback",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is combinational logic fundamentally incapable of 'remembering' anything, and how does positive feedback between two inverters create stable digital storage?",
    back: `**Combinational logic is stateless**: a valid combinational device's output always reflects only its *current* inputs (related card) — there's no way for such a circuit to "remember" a past input once it's gone. Building a device with genuine memory (e.g. a light that toggles on each button press, changing state based on an *event* rather than a stable input *value*) requires something fundamentally new.

**Storage via positive feedback**: connect two inverters in a loop — the first inverter's output feeds the second's input, and the second's output feeds back into the first's input. The steady-state constraint is $V_{IN} = V_{OUT}$ for the pair — graphically, the intersection of the inverter-pair's VTC curve (related card) with the line $V_{IN}=V_{OUT}$. For a well-designed inverter (gain$>1$ through its transition region), this intersection has **three** solutions: the two extreme corners (one representing a stored "0," one a stored "1") are **stable** — a small perturbation is pushed back toward the corner by the inverters' own restoring gain — while the middle intersection point is **unstable** (related card covers this "metastable" point in depth). Because the storage mechanism relies on the *same* restoring, noise-rejecting property that makes ordinary combinational gates reliable (related card), the stored value is naturally robust to noise, unlike naive analog storage schemes.

**Contrast with charge-based storage** (an alternative real technique, e.g. DRAM): store a bit directly as charge on a capacitor, accessed via a switching transistor. Pros: compact, low cost per bit at large scale. Cons: a more complex read/write interface, genuine stability concerns (small stored charges are more noise-sensitive), and — critically — the charge **leaks** over time, requiring periodic **refresh** to avoid losing the stored value (this is exactly why DRAM is called "dynamic" memory). The feedback-based bistable approach avoids the leakage problem entirely, at the cost of needing more transistors per stored bit — a foundational space/complexity tradeoff that recurs throughout memory-system design.`,
    related: ["mit6004-basics-digital-vtc-noise-margins", "mit6004-logic-seq-d-latch"],
  },
  {
    id: "mit6004-logic-seq-d-latch",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How is a D latch built from a lenient multiplexer with feedback, and what does the 'dynamic discipline' (setup/hold time) actually guarantee?",
    back: `A **D latch** is built from a lenient 2-input MUX (related card) with its own output fed back as one data input: $D$ (the data to store) on input 1, $Q'$ (the latch's own current output) on input 0, selected by a **gate** signal $G$. When $G=1$: $Y=D$ — "**Q follows D**," the latch is **transparent**. When $G=0$: $Y=Q'$ — the previous output feeds right back into itself, so "**Q holds**" its value stable, independent of $D$. This introduces the circuit's very first **feedback path**, so it is *not* a combinational circuit anymore (related card) — yet, remarkably, it can still be analyzed rigorously using the MUX's own **lenient** guarantee (related card): the output is valid whenever *any* input combination sufficient to determine the value has been stable long enough, tolerating instability on the *other* (currently-irrelevant) input.

**Dynamic discipline**: to reliably latch a new value $V_2$, you must (1) apply $V_2$ to $D$ while holding $G=1$; (2) after $t_{PD}$, both $Q'$ and $D$ are equal and stable, so the latch would hold $Q=V_2$ even if $G$ dropped now; (3) set $G=0$ — after another $t_{PD}$, the now-stored value is confirmed independent of $D$. This derivation directly yields two named timing parameters: **setup time** $t_{SETUP}$ ($=2t_{PD}$ for this design) — the interval **before** the $G$ transition during which $D$ must already be stable and valid; **hold time** $t_{HOLD}$ ($=t_{PD}$) — the interval **after** the $G$ transition during which $D$ must *continue* to remain stable and valid. Violating either constraint (changing $D$ too close to the $G$ transition) risks the latch capturing an inconsistent or invalid value — this is precisely the timing discipline every subsequent sequential-circuit design in the course has to respect.`,
    pitfall:
      "The D latch's feedback loop means it is genuinely not a combinational device by the formal definition (related card), even though its individual gate (the MUX) still obeys lenient combinational timing internally — analyzing a latch's overall correctness requires the dynamic discipline (setup/hold reasoning), not just ordinary combinational tPD/tCD reasoning.",
    related: ["mit6004-logic-seq-storage-and-feedback", "mit6004-logic-seq-combinational-cycle-problem"],
  },
  {
    id: "mit6004-logic-seq-combinational-cycle-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does a naive sequential circuit built from a single transparent latch fail, and what's the 'want to signal an instant, not an interval' insight that motivates the fix?",
    back: `**The naive plan**: a single D latch holds the current state; combinational logic computes both the next state (fed back to the latch's $D$ input) and the output, from the current state and external input; the latch's $G$ input pulses briefly high to load the new state. This looks reasonable, but **when $G=1$, the latch is transparent** (related card) — it provides a direct **combinational path** straight through from $D$ to $Q$. Since $Q$ (current state) feeds the combinational logic that computes the *new* value of $D$, which feeds right back to the latch whose $Q$ output is currently *equal* to $D$... the circuit temporarily contains a genuine **combinational cycle** for the entire duration that $G=1$ — precisely the structure the formal combinational-system definition (related card) forbids, since there's no longer a well-defined acyclic order to derive behavior from.

**Why this "kind of" works but is fragile**: making it functionally correct requires the $G=1$ pulse to be *extremely* precisely timed — narrow enough to fit within the combinational logic's contamination delay (so the new state doesn't have time to "race around" the loop and corrupt itself before $G$ closes again), yet wide enough to satisfy the latch's own setup/hold requirements. This is an unreasonably tight, fragile timing target to hit reliably across a real, noisy, temperature-and-manufacturing-variation-affected circuit.

**The real insight**: what's actually wanted is a mechanism to update state in response to a **transition** — an **instant** in time (like a clock edge) — rather than requiring a carefully-shaped **interval** (a precisely-width-limited pulse). This reframing is exactly what motivates the edge-triggered flip-flop (related card): a device whose defining property is reacting to the *instantaneous* edge of a clock signal, sidestepping the combinational-cycle problem entirely by construction rather than by delicate timing tuning.`,
    pitfall:
      "This single-latch design isn't merely 'a bit risky' — it's fundamentally the wrong structural approach, since it relies on precisely engineering an analog pulse WIDTH to approximate an instant, which no real circuit can guarantee reliably at scale. The fix (edge-triggering, related card) isn't a refinement of this design; it's a structurally different solution that eliminates the combinational cycle rather than trying to time around it.",
    related: ["mit6004-logic-seq-d-latch", "mit6004-logic-seq-edge-triggered-flipflop", "mit6004-basics-digital-combinational-device"],
  },
  {
    id: "mit6004-logic-seq-edge-triggered-flipflop",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the master-slave design solve the combinational-cycle problem via an 'escapement' strategy, and what does the single-clock synchronous discipline require of an entire circuit?",
    back: `**Master-slave edge-triggered flip-flop**: chain **two** D latches — a "master" latch gated by $\\overline{CLK}$ (transparent when the clock is *low*) feeding a "slave" latch gated by $CLK$ (transparent when the clock is *high*). The **escapement analogy** (like a toll-booth strategy admitting only one car at a time, or a mechanical clock's escapement releasing one gear tooth per tick): at any instant, **only one** of the two latches is ever transparent — when the master is open (transparent), the slave is necessarily closed (holding), and vice versa. This guarantees **no combinational path ever exists all the way through** the flip-flop (related card's problem), since a signal attempting to flow through always meets one latch that's currently closed.

**Result**: $Q$ (the slave's output) only changes shortly *after* a rising ($0\\to1$) transition of $CLK$ — externally, the device behaves as if **triggered by the clock edge itself**, a genuine instant rather than a level or interval, exactly resolving the earlier problem. Detailed timing analysis reveals a subtlety: the slave's **hold time** requirement, at the moment $CLK$ falls, is only actually satisfied because the master's own **contamination delay** (through its internal inverter and MUX path) is guaranteed to exceed the slave's hold time — a real engineering constraint the flip-flop's internal gate design must deliberately satisfy, not something that comes for free.

**Single-clock synchronous discipline**: build entire large systems using flip-flops/registers (grouped flip-flops sharing one clock) under strict rules: **no combinational cycles** anywhere in the overall design; a **single clock signal** shared by every clocked device; only the value of each register's data input **immediately before** the clock's rising edge matters; the clock **period** must exceed every combinational path's delay between registers; and state changes only happen after all noise-inducing logic transitions have already settled. Under this discipline, an entire multi-million-gate chip's correctness reduces to checking one clean timing inequality per register-to-register path — the payoff for accepting the flip-flop's more complex internal (two-latch) structure.`,
    code: `# Timing constraints for a register-to-register combinational path:
# t1 = tCD_reg1 + tCD_logic > tHOLD_reg2   (no premature capture)
# t2 = tPD_reg1 + tPD_logic < tCLK - tSETUP_reg2  (settles before next edge)
def min_clock_period(tPD_reg, tPD_logic, tSETUP_reg):
    return tPD_reg + tPD_logic + tSETUP_reg  # tCLK must exceed this`,
    pitfall:
      "The master-slave design's correctness depends on the master's contamination delay exceeding the slave's hold time — this is a real constraint on the internal gate implementation, not an automatic consequence of the master-slave topology alone. A careless implementation of the internal latches could violate it.",
    related: ["mit6004-logic-seq-combinational-cycle-problem", "mit6004-logic-seq-d-latch"],
  },
  {
    id: "mit6004-logic-fsm-formal-definition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the formal definition of a finite state machine, the two rules a valid state transition diagram must satisfy, and the difference between Moore and Mealy machines.",
    back: `A **finite state machine (FSM)** has: $k$ **states** $S_1,\\ldots,S_k$ (one designated **initial**); $m$ **inputs** $I_1,\\ldots,I_m$; $n$ **outputs** $O_1,\\ldots,O_n$; **transition rules** $s'(s,I)$ giving the next state for each state/input pair; and **output rules** $\\text{Out}(s)$ (or $\\text{Out}(s,I)$, see below) giving the output for each state. An FSM can be drawn as a **state transition diagram** (circles for states, the initial state marked with a heavy circle, labeled arcs for transitions) or written as a **truth table** (current state + input columns, next state + output columns) — the two are directly interconvertible, and once in truth-table form, the same Boolean minimization techniques used for ordinary combinational logic (related card) apply directly to simplify the implementation.

**Valid state diagrams** require every state's *outgoing* arcs to be: (1) **mutually exclusive** — no two arcs leaving the same state can be labeled with the same input value (the machine's next move must be deterministic); (2) **collectively exhaustive** — every state must specify a transition for *every* possible input combination (a state with "nothing happens" on some input is drawn as an explicit self-loop, not left undefined).

**Moore vs. Mealy machines**: a **Moore** machine's outputs depend only on the *current state* ($\\text{Out}(s)$) — outputs are drawn attached to states. A **Mealy** machine's outputs depend on *both* the current state and the current input ($\\text{Out}(s,I)$) — outputs are drawn attached to transition arcs. Mealy machines can sometimes react to an input one step "faster" (the output changes immediately, without waiting for a state transition to complete), but Moore machines are often simpler to reason about since their outputs are a pure function of "where the machine currently is."`,
    related: ["mit6004-logic-fsm-hardware-implementation", "mit6004-logic-boolean-minimization"],
  },
  {
    id: "mit6004-logic-fsm-hardware-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does an FSM map directly onto a ROM-plus-register hardware structure, and what does the resulting 'discrete state, discrete time' model actually abstract away?",
    back: `Given $s$ state bits (supporting up to $2^s$ distinct states), an FSM's entire transition-and-output logic is exactly a combinational lookup table: a **ROM** takes the current state (from a register) plus the external input as its address, and outputs both the next-state bits (fed back to the register's input) and the output bits — precisely the same "current state register + combinational logic computing next state and output" structure already built for a single bit of state (related sequential-logic cards), now generalized to $s$ bits and an arbitrary transition/output table instead of one specific hand-designed circuit.

**Discrete state, discrete time**: the clock's **active edges punctuate time** into discrete periods; between edges, the state register holds a constant, discrete value (one of $2^s$ possibilities); the ROM's transition/output table is itself a discrete specification (a finite table, not a continuous function). This is the **abstraction** the FSM model provides: it lets you reason about an entire class of sequential circuits purely in terms of states, inputs, and a table — completely hiding the underlying continuous voltages, capacitor charge, and analog transient behavior that the digital abstraction (related card) was built, at great effort, specifically to make safely ignorable.

**A subtlety — asynchronous inputs**: the FSM model above implicitly assumes each input change is a single, clean transition synchronized with the clock. If an external input (like a physical button) can change at *any* time, unaware of the clock, extra care is needed — the standard fix is to route such inputs through a **synchronizer** first (related card) and/or use additional intervening FSM states specifically to debounce or properly sequence a single physical button press into a single, clean logical transition, rather than letting raw asynchronous glitches propagate directly into the state-transition logic.`,
    pitfall:
      "The clean FSM abstraction (discrete state, discrete time) silently assumes all inputs are already synchronized to the clock — an FSM design that reads a genuinely asynchronous input directly, without a synchronizer, is exposed to exactly the metastability risk covered in the synchronization module (related cards), even though the FSM model itself gives no hint that this risk exists.",
    related: ["mit6004-logic-fsm-formal-definition", "mit6004-logic-mux-rom-synthesis"],
  },
  {
    id: "mit6004-logic-fsm-equivalence-minimization",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define FSM equivalence formally, and walk through the maze-solving-ant example of merging equivalent states to halve the required ROM size.",
    back: `Two FSMs are **equivalent** iff every input sequence yields identical output sequences from both — they are **externally indistinguishable**, hence freely interchangeable, even if their internal state diagrams look structurally different (e.g. a machine with a single self-looping "on" state can be equivalent to one that cycles through several differently-drawn "on-ish" states, as long as every input sequence produces the same outputs from both). The engineering goal: given *an* FSM that works, find the **simplest** — and therefore cheapest to implement — equivalent FSM.

**Reduction strategy**: two states $S_i \\equiv S_j$ are equivalent if (1) they have identical outputs, **and** (2) for every possible input, the *transitions* from $S_i$ and $S_j$ lead to (respectively) equivalent states. Find such pairs and **merge** them into one combined state.

**Worked example — a maze-navigating "ant" robot**: sensors are two antennae (Left, Right — each 1 if touching a wall); actuators are Forward-step and small Left/Right turns. Strategy: "right antenna to the wall" (go forward until hitting something; when touching, turn until not touching; then hug the wall by alternating small corrective turns). Building this out state-by-state naturally produces states like $\\text{Wall1}$ (turning right, stepping forward) and $\\text{Corner}$ (turning right) — inspecting their behavior reveals they have **identical outputs** and **identical transition behavior for every input** — they're equivalent, and can be **merged** into a single combined state. The resulting merged FSM behaves *exactly* like the original 5-state design (verified by checking all reachable input/output sequences still match) while needing only **half the ROM** to implement (4 states instead of 5, since ROM size scales with the number of state bits needed to distinguish states, and fewer distinct states can sometimes drop a needed address bit entirely).

This same technique — find behaviorally-indistinguishable states, merge them, repeat until no more merges are possible — generalizes to minimize *any* FSM, and is exactly analogous in spirit to Boolean minimization (related card): both remove redundancy from a correct-but-not-minimal specification without changing the specified external behavior.`,
    pitfall:
      "Equivalence requires BOTH matching outputs AND matching transition behavior into (recursively) equivalent states for every possible input — matching outputs alone is not sufficient, since two states could produce the same output right now but diverge on what happens next for some input, making them genuinely distinguishable by a longer input sequence.",
    related: ["mit6004-logic-fsm-formal-definition", "mit6004-logic-boolean-minimization"],
  },
  {
    id: "mit6004-logic-sync-arbiter-unsolvability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the asynchronous arbiter problem, and sketch why it is provably unsolvable in bounded time — for ANY circuit, however clever, even with perfectly reliable components.",
    back: `**The asynchronous arbiter problem**: given two signals $B$ and $C$ that can transition (0→1) at *any* time, independently, produce a single output $S$ within some **finite decision time** $t_D$ after the later of the two transitions, such that $S=1$ if $B$ transitioned at least $t_E$ (allowable error) before $C$, $S=0$ if $C$ transitioned at least $t_E$ before $B$, and either value is acceptable if the two transitions were within $t_E$ of each other. Intuitively: decide, within a bounded time budget, which of two nearly-simultaneous events happened first.

**Theorem**: for **no** finite values of $t_D$ and $t_E$ is this specification realizable — not with any circuit, however clever, not even given perfectly reliable, noise-free components. **Proof idea**: the arbiter's output must map the *continuous* variable $(t_B - t_C)$ (the real-valued time gap between the two transitions) onto the *discrete* variable $S \\in \\{0,1\\}$, **within a bounded time**. Plot the arbiter's actual output as a function of $t_B - t_C$: away from the boundary it must cleanly settle to 0 or 1, but *somewhere* the output has to transition from one valid value to the other. Because voltage (and hence the physical quantity encoding "the decision so far") varies **continuously** with $t_B - t_C$, and any real circuit takes time proportional to how far its internal state is from a stable extreme to settle (this is exactly the metastability phenomenon, related card) — for *any* fixed time bound $t_D$, you can always find some sufficiently close $t_B - t_C$ for which the circuit **hasn't yet settled** to a valid output by time $t_D$. No forbidden zone (related card) can rescue this: the whole point of a forbidden zone is refusing to promise anything about inputs that fall in it, but the arbiter's spec explicitly promises a valid, bounded-time answer for **every** possible $(t_B - t_C)$, including arbitrarily close calls.

This is a genuine **impossibility result** for digital systems, in the same family as (though a different flavor from) computability theory's undecidability results — no amount of clever engineering circumvents it, because it follows from the continuous nature of the underlying physics itself, not from any particular circuit's limitations.`,
    pitfall:
      "This is not a statement that arbiters are merely hard to build well — it's a proof that a BOUNDED-TIME arbiter is mathematically impossible for any circuit whatsoever, given continuous underlying physics. Real systems don't 'solve' this; they manage it (via unbounded-time arbiters or accepting some probability of a very long, but not infinite-in-practice, decision delay — related cards).",
    related: ["mit6004-logic-sync-metastable-state", "mit6004-logic-sync-practical-synchronizers"],
  },
  {
    id: "mit6004-logic-sync-metastable-state",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the metastable state precisely, list its key properties, and explain the ball-on-a-hill mechanical analogy.",
    back: `Recall that a bistable storage element's steady states are the two stable intersections of a device's VTC with the constraint line $V_{IN}=V_{OUT}$ (related card) — but a well-designed (gain$>1$, S-shaped) VTC crossing that line always produces a **third** intersection, in the middle, at the device's switching threshold. This is the **metastable state**.

**Key properties**: (1) it corresponds to an **invalid** logic level — sitting squarely in the forbidden zone; (2) it's an **unstable equilibrium** — any small perturbation causes it to accelerate away, toward one of the two valid stable states; (3) it **will** eventually settle to a valid 0 or 1 — metastability is not permanent; (4) **but** — depending on exactly how close the initial condition lands to the true fixed point, settling time can be **arbitrarily long**, with no fixed upper bound; (5) **every** bistable system exhibits at least one metastable state — this isn't a flaw specific to some particular circuit design, it's an unavoidable topological consequence of having two stable states connected by a continuous transfer function.

**Mechanical analogy**: launch a ball up a symmetric two-humped landscape (a valley, a hill in the middle, another valley) — from almost any starting push, the ball either rolls back down the near side or crests over into the far valley. But there's a *third* possible outcome: the ball could, with exactly the right initial velocity, come to rest precisely balanced at the hill's apex. That balance point is **not stable** — the slightest disturbance (a gust of wind, thermal/Brownian jitter) eventually tips it one way or the other, but *how long* it stays balanced first depends sensitively on how close to perfectly-centered the initial launch was. This maps directly onto the VTC picture: the "hill" corresponds to the region where the VTC's slope (gain) is steepest, and — since physics is continuous — no real circuit can make that balance point (where the derivative of the VTC is exactly zero) simply disappear, however high its gain.`,
    pitfall:
      "Metastability isn't a probabilistic 'maybe it happens, maybe it doesn't' phenomenon in the sense of being avoidable by careful circuit design — every real bistable circuit provably HAS a metastable state as a mathematical consequence of being bistable at all. What varies with design quality is only the PROBABILITY of landing near it and the RATE at which the circuit escapes it, never whether the state exists.",
    related: ["mit6004-logic-sync-arbiter-unsolvability", "mit6004-logic-sync-metastability-probability"],
  },
  {
    id: "mit6004-logic-sync-metastability-probability",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the probability of a synchronizer still being in a metastable state fall off with allotted settling delay, and why does this make metastability practically manageable despite being theoretically unavoidable?",
    back: `Model the feedback loop near the metastable point as a simple amplifier with gain $A$ and time constant $\\tau \\propto RC/A$: if the output starts a small distance $\\varepsilon$ from the metastable voltage $V_M$, it moves away exponentially, $V_{out}(t) - V_M \\approx \\varepsilon\\, e^{t/\\tau}$. Working this the other direction: given an elapsed settling time $T$, the *range* of initial offsets $\\varepsilon$ still capable of leaving the output within $\\varepsilon(T) \\approx (V_H - V_M)e^{-T/\\tau}$ of $V_M$ — i.e. still metastable — **shrinks exponentially** with $T$. Combined with a (roughly uniform) probability distribution over how close to $V_M$ an asynchronous input transition happens to land, this gives $P_{\\text{metastable}}(T) \\approx K e^{-T/\\tau}$ — the probability of *still* being metastable after waiting time $T$ **decays exponentially** in $T$.

**Concrete numbers** (illustrative, for a roughly 100MHz clock and conservative device parameters): allowing 31ns of settling delay gives a metastability failure probability of about $3\\times10^{-16}$ (roughly one failure per year of continuous operation); 33.2ns gives about $3\\times10^{-17}$ (about one failure per decade); 100ns gives about $10^{-45}$ — for comparison, the age of the Earth is roughly $5\\times10^9$ years, so a $10^{-45}$-per-decision failure rate corresponds to an expected time between failures many, many orders of magnitude longer than the age of the universe.

**The practical lesson**: allowing even a modest amount of extra settling time (a handful of nanoseconds beyond the "obviously enough" bound) is an extremely cheap, effective way to drive metastability-related failure rates down to levels indistinguishable from zero in any practical engineering sense — even though, per the earlier theorem (related card), the probability can **never** be driven to *exactly* zero for any finite delay. This is the resolution to the tension between the arbiter's proven impossibility and real synchronizers working reliably in practice: real systems don't need a guarantee, they need a failure rate low enough not to matter, and exponential decay delivers that extremely cheaply.`,
    pitfall:
      "The failure probability decreasing exponentially with delay does NOT mean the theoretical impossibility (related card) has been circumvented — it's the same unavoidable phenomenon, just made practically negligible rather than eliminated. There is no finite delay that reduces the probability to exactly zero, only delays that make it smaller than any threshold you care to name.",
    related: ["mit6004-logic-sync-metastable-state", "mit6004-logic-sync-practical-synchronizers"],
  },
  {
    id: "mit6004-logic-sync-practical-synchronizers",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What CAN be built despite the arbiter's impossibility, why do proposed 'folk cure' fixes for metastability fail, and what's the actual engineering strategy?",
    back: `Despite the bounded-time arbiter being provably impossible (related card), useful *relaxed* versions **can** be built: an **unbounded-time arbiter** (output $S$ becomes valid only when a separate "Done" signal fires — no promise on *when*, just that it eventually will); an **unbounded-time analog comparator** (same idea — decides eventually, no fixed deadline); and ordinary **bounded-time combinational logic** for signals that are already synchronized to a clock (the arbiter problem is specifically about genuinely asynchronous, unclocked inputs).

**Two "folk cure" ideas that don't actually work**: (1) build a flip-flop, detect if its output is stuck in the forbidden (metastable) zone, and have a "fixer" circuit correct it — bug: the fixer's own detection logic is *itself* just another bistable circuit, subject to exactly the same unavoidable metastability (you haven't eliminated the problem, only pushed it one level down, recursively). (2) redefine the metastable voltage itself as a valid logic level, so there's no more "invalid" output to worry about — bug: doing so requires shrinking the true forbidden zone, which means some previously-valid "0" or "1" signals now fall inside the new (smaller) valid ranges too, causing the memory element to occasionally flip a genuinely valid stored 0 to a 1 (or vice versa) after enough time, since the redefined boundary now cuts through territory that ordinary operation legitimately visits.

**The actual engineering strategy — accept and manage, don't eliminate**: insert one or more **synchronizer** flip-flops between every asynchronous input and the synchronous logic that uses it; each added synchronizer stage buys additional settling time, driving the (never-zero, but exponentially shrinkable, related card) failure probability down to a level appropriate for the application (higher clock rates or higher-reliability requirements call for more synchronizer stages). As a system designer's overall philosophy: **avoid the problem where possible** (use a single clock, obey the dynamic discipline everywhere you can — combinational logic alone has *no* metastable states at all, related card), and where an async input is unavoidable, **budget delay deliberately** as the acknowledged, irreducible cost of synchronization — rather than chasing an engineering "fix" that the arbiter theorem already rules out.`,
    pitfall:
      "Bad-idea #1 (detect-and-fix) is a genuinely common intuition that seems like it should work — the key insight for why it fails is recognizing that the FIXER circuit itself is just another piece of bistable hardware, inheriting the exact same unavoidable metastability property as the thing it's trying to fix, rather than somehow standing outside the problem.",
    related: ["mit6004-logic-sync-arbiter-unsolvability", "mit6004-logic-sync-metastability-probability", "mit6004-basics-digital-combinational-device"],
  },
];