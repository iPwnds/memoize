// MIT 6.004 (Spring 2009) — Lectures 8-9: pipelining (latency/throughput,
// well-formed pipelines, the bottleneck problem, control-structure taxonomy)
// and a full worked cost/performance case study — designing a binary
// multiplier four different ways (combinational, pipelined, slice-serial,
// bit-serial) and comparing their hardware/latency/throughput tradeoffs.
// Continues the all-new hardware territory from Modules 1-2. See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6004-pipe";

export const mit6004PipeliningMultipliersCards: Card[] = [
  {
    id: "mit6004-pipe-latency-throughput",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define latency and throughput precisely, and use the 'MIT vs. Harvard laundry' example to show why pipelining improves one but not the other.",
    back: `**Latency**: the delay from when an input is established until the output associated with *that specific* input becomes valid. **Throughput**: the *rate* at which inputs are consumed (or outputs produced) — outputs per unit time, not tied to any single input's journey.

**Worked analogy**: a washer takes 30 minutes, a dryer 60 minutes. "**Harvard-style**" laundry (the combinational/urban-legend way): do the wash, wait for it to finish, *then* start the dry — one load fully completes before the next begins. Latency $=30+60=90$ min; throughput $=\\frac{1}{90}$ loads/min (do $N$ loads sequentially, one full 90-minute cycle each, $N\\times90$ minutes total). "**MIT-style**" laundry (pipelining): start washing load 2 the moment load 1 moves from washer to dryer — the two machines run **concurrently** on different loads. Steady-state latency is *slightly worse*: $\\max(30,60)$ per stage means the pipe fills at a rate set by the slower stage, but a single load still needs to pass through both stages, so its own latency stays around 90 min (plus pipeline-fill overhead) — **latency doesn't improve**. But throughput jumps to $\\frac{1}{60}$ loads/min ($N$ loads take roughly $N\\times60$ minutes once the pipeline is full) — a **50% throughput improvement**, purely from letting independent stages work on different inputs simultaneously rather than sitting idle while an earlier or later stage works.

**The general lesson pipelining exploits**: in an unpipelined system, earlier combinational stages sit **idle**, just holding their outputs stable, while a later stage finishes its work — wasted hardware-time. Pipelining inserts registers between stages specifically so multiple stages can be **simultaneously busy** on *different* inputs, trading (slightly) worse per-item latency for substantially better aggregate throughput.`,
    related: ["mit6004-pipe-formal-definition"],
  },
  {
    id: "mit6004-pipe-formal-definition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the formal definition of a K-stage pipeline, and explain exactly what goes wrong in an 'ill-formed' pipeline where paths have different register counts.",
    back: `A **K-Stage Pipeline** ("K-pipeline") is an acyclic circuit having **exactly K registers on every path** from an input to an output. By this definition, an ordinary **combinational circuit is a 0-stage pipeline** — the K-pipeline concept is a strict generalization, not a separate category. **Convention**: every pipeline stage (hence every K-stage pipeline) places its register on its **output**, not its input — and the shared clock's period must always exceed the worst-case combinational propagation delay between registers, plus the input register's own $t_{PD}$, plus the output register's $t_{SETUP}$.

**Ill-formed pipelines**: consider a circuit where signal $X$ feeds two paths to a downstream combinational block $C$ — one path with 2 registers, another with only 1 — before both merge back together. This circuit is **not** a valid K-pipeline for **any** value of $K$, because it violates the "exactly K registers on every path" requirement. The concrete symptom: **successive inputs get mixed together** — a computation like $B(A(X_{i-1}), Y_i)$ can occur, where $C$'s inputs come from *two different* clock cycles' worth of upstream data simultaneously, since one path delivered $X$'s effect one cycle earlier than the other path delivered $Y$'s. This kind of cross-cycle data mixing is exactly the failure mode the strict "K registers on *every* path" rule is designed to rule out categorically — a well-formed pipeline structurally **cannot** exhibit it, by construction, no matter how the timing works out.

**Consequence for design practice**: extra "pass-through" registers are sometimes inserted on a path purely to *equalize* its register count with a longer parallel path — not because that shorter path's own combinational logic needs the extra latency, but because well-formedness is a *global*, all-paths property of the whole circuit, not something that can be checked or fixed path-by-path in isolation.`,
    pitfall:
      "A circuit can have plenty of registers scattered throughout and still not be a valid K-pipeline for any K — well-formedness specifically requires every input-to-output PATH to cross exactly the same number of registers, not merely that registers exist somewhere in the circuit.",
    related: ["mit6004-pipe-latency-throughput", "mit6004-pipe-design-methodology"],
  },
  {
    id: "mit6004-pipe-design-methodology",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the 'draw a line crossing every output' methodology for placing pipeline registers, and explain why the resulting register count and stage boundaries follow automatically.",
    back: `**Step 1**: draw a line across the circuit diagram that crosses every wire carrying a circuit-element **output** exactly once, and mark the two endpoints of that line as terminal points (fixed reference points, e.g. the overall circuit's input/output boundary).

**Step 2**: continue drawing additional such lines between the terminal points, through various different routes across the circuit, always ensuring that **every connection in the circuit crosses each line in the same direction** (never crossing back and forth). Each such line demarcates one **pipeline stage boundary** — placing a pipeline register at every point where a separating line crosses a connection is *guaranteed* to produce a valid, well-formed pipeline (related card), because by construction every signal path crosses the same number of these lines.

**Strategy — target the bottleneck**: rather than adding stage boundaries arbitrarily, focus attention specifically on splitting the **slowest** circuit elements (the ones dominating the clock period) into their own pipeline stages — since throughput is set by the clock period, which in turn is set by the *slowest* stage's combinational delay, splitting a slow element in two (each half now faster) directly buys a shorter minimum clock period and hence higher throughput. Worked example: a chain of components $A(4\\text{ns}) \\to B(3\\text{ns}) \\to C(8\\text{ns}) \\to \\{D(4\\text{ns}) \\to E(2\\text{ns}), F(5\\text{ns})\\}$ has an unpipelined critical path setting throughput to $\\frac{1}{8\\text{ns}}$ (limited by $C$) — pipelining doesn't help until $C$ itself is either internally split (if it decomposes into faster sub-stages) or handled by an alternative technique (circuit interleaving, related card) when it can't be split further.`,
    pitfall:
      "Adding MORE pipeline stages beyond what the bottleneck requires doesn't further improve throughput — it only adds latency (each stage's register contributes its own setup/tPD overhead to every item's total transit time) without buying anything, since throughput is capped by the single slowest remaining stage regardless of how many other stages exist.",
    related: ["mit6004-pipe-formal-definition", "mit6004-pipe-bottleneck-and-interleaving"],
  },
  {
    id: "mit6004-pipe-bottleneck-and-interleaving",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "When a bottleneck component can't be split into faster pipeline stages, how does circuit interleaving achieve the same throughput improvement, and what's the equivalence between N-way interleaving and N pipeline stages?",
    back: `Pipelining is only as good as its **weakest link** — a chain's overall throughput is capped by whichever single stage has the largest combinational delay, however many other (faster) stages exist alongside it. Sometimes that slow stage genuinely **cannot** be split further (e.g. it's already a monolithic, non-decomposable functional unit) — in the laundry analogy (related card), "how do you pipeline a single clothes dryer?"

**Circuit interleaving**: instead of speeding up the single slow component $C$, **replicate** it — build two (or $N$) identical copies $C_0, C_1$, and alternate which copy handles each successive input, using a small controlling FSM (in the simplest case, just a single toggling bit) to route input $X_i$ to whichever copy is currently free, and to select the correct copy's output back onto the shared output path. While $C_0$ is busy processing $X_i$, $C_1$ can simultaneously be processing $X_{i+1}$ — from the *outside*, the interleaved pair behaves like a single component with the *same* latency as one copy of $C$, but with **doubled throughput**, since two independent copies are working concurrently.

**Equivalence to pipelining**: $N$-way interleaving of a component is functionally and performance-equivalent to giving that component $N$ pipeline stages — both techniques buy a factor-of-$N$ throughput improvement over the un-replicated, unpipelined baseline, by allowing $N$ inputs to be "in flight" simultaneously. The two techniques can also be **combined**: interleaving handles a bottleneck component that can't be internally pipelined, while ordinary register-insertion pipelining handles the rest of the circuit — and both can further combine with outright **parallelism** (replicating the entire pipeline, not just the bottleneck stage) for additional throughput at proportional additional hardware cost. The "MIT Aces" laundry example illustrates all three combined: interleaving two dryers per washer (to match the 2:1 time ratio), while still pipelining the wash/dry sequence itself, and running several such stations in parallel.`,
    pitfall:
      "Interleaving improves throughput but does NOT reduce the latency of any individual item passing through — a single input still takes exactly as long to get through one copy of the slow component as it always did; only the aggregate rate at which the SYSTEM as a whole processes many inputs improves, exactly mirroring the latency-vs-throughput distinction pipelining itself makes.",
    related: ["mit6004-pipe-design-methodology", "mit6004-pipe-latency-throughput"],
  },
  {
    id: "mit6004-pipe-control-structures",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Lay out the 2×2 taxonomy of digital control structures (synchronous/asynchronous × globally/locally timed), and explain the tradeoff each axis represents.",
    back: `Two independent design axes classify how a digital system's components coordinate the timing of their work:

**Synchronous vs. asynchronous**: *synchronous* — all computation "events" occur at active edges of one periodic clock; time is divided into fixed-size discrete intervals, uniformly, everywhere. *Asynchronous* — events (like loading a register) can happen at arbitrary times, driven by the actual completion of the relevant work rather than a global tick.

**Globally timed vs. locally timed**: *globally timed* — timing is dictated by one centralized controller (e.g. a single FSM) operating on a fixed, predetermined schedule known in advance. *Locally timed* — each module determines its own timing individually; neighboring modules coordinate directly via local **handshaking** signals (e.g. "here's X" / "got X") rather than deferring to any central schedule.

**The resulting four combinations, and their tradeoffs**: **synchronous + globally-timed** (a single clock, all control signals generated by one central FSM) is the most **rigid** but by far the **easiest to design** — this is the discipline used throughout the rest of the course (related cards on the single-clock synchronous discipline). **Asynchronous + locally-timed** is the most **flexible/"laid-back"** — each module signals its own start and completion (e.g. via *transition signaling*, where a wire's *edge*, not its level, carries the "here's data"/"got it" meaning), letting genuinely **data-dependent** timing (like a multiplication that happens to finish early because one operand was 0) be automatically exploited, with no fixed clock forcing every operation to wait for the worst case. The two mixed combinations (synchronous-locally-timed via handshaking-with-a-shared-clock, and asynchronous-globally-timed) also exist as intermediate design points, each inheriting a partial mix of both axes' tradeoffs.

**Why globally-timed synchronous design dominates in practice despite the flexibility asynchronous design offers**: fixed-size clock intervals are easy to design around but can be wasteful when actual work has highly variable, data-dependent duration — asynchronous, locally-timed design is "the next big idea" that keeps resurfacing across decades of research precisely because it promises to automatically adapt to that variability, at the real cost of substantially more complex handshaking/control-logic design work, which is worth paying only in special, performance-critical cases.`,
    related: ["mit6004-logic-seq-edge-triggered-flipflop"],
  },
  {
    id: "mit6004-pipe-mult-recursive-construction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the recursive n-bit-to-2n-bit multiplier construction work, and how does the resulting brick-wall array reduce to an array of full adders?",
    back: `**Engineering principle**: exploit structure in the problem — designing a combinational multiplier for *tiny* operands (1, 2, 3 bits) is easy; designing one directly for *large* operands (32, 64 bits) is hard. Bridge the gap by building large multipliers **out of** smaller ones, recursively.

**Recursive step**: given $n$-bit $\\times$ $n$-bit multipliers, build a $2n$-bit $\\times$ $2n$-bit multiplier: split each $2n$-bit operand into high/low $n$-bit halves ($a = a_H a_L$, $b = b_H b_L$); form the four $2n$-bit partial products $a_Lb_L$, $a_Lb_H$, $a_Hb_L$, $a_Hb_H$ using the smaller multipliers; **align** them appropriately (shifted by 0, $n$, $n$, and $2n$ bits respectively, reflecting each half's place value); **add** the aligned partial products together. This same structuring principle applies again to build a $4n$-bit multiplier from the newly-built $2n$-bit ones, and so on — genuine mathematical induction on the operand size, with the base case ($n=1$) being trivial: multiplying two 1-bit numbers is just $a\\cdot b$, an AND gate.

**The "brick wall" view**: fully unrolling this recursion down to 1-bit partial products for an $n$-bit multiplier produces exactly $n^2$ individual 1-bit partial products $a_ib_j$, arranged in a diamond/brick-wall pattern by place value, all needing to be summed together. Recognizing that "sum many aligned bits together" is *exactly* what a chain of **full adders** does (each full adder takes 2 addend bits plus an incoming carry, producing a sum bit and an outgoing carry), the entire multiplier reduces to an $n\\times n$ **array of full adders**, each handling one AND-gate-generated partial product bit plus incoming sum/carry from its neighbors — a single repeated "brick" cell tiled into a grid, with operand bits **bused diagonally** across the array, carry bits propagating right-to-left, and sum bits propagating top-to-bottom.`,
    code: `# Base case: 1-bit multiplier is just AND
def mult1(a, b):
    return a & b

# Recursive step: build 2n-bit multiplier from n-bit multipliers
def mult2n(a, b, n, multn):
    aH, aL = a >> n, a & ((1 << n) - 1)
    bH, bL = b >> n, b & ((1 << n) - 1)
    return (multn(aH, bH) << (2*n)) + (multn(aL, bH) << n) + \\
           (multn(aH, bL) << n) + multn(aL, bL)`,
    related: ["mit6004-pipe-mult-latency-insight"],
  },
  {
    id: "mit6004-pipe-mult-latency-insight",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why does the array multiplier's true propagation delay turn out to be O(n), not the naive O(n²) bound you'd get from counting additions?",
    back: `**Naive (but valid) bound**: an $n$-bit array multiplier performs $O(n)$ additions of $n$-bit numbers, each addition taking $O(n)$ time (a ripple-carry adder's carry has to propagate across all $n$ bit positions) — multiplying these gives an apparent $O(n^2)$ total propagation delay.

**On closer inspection — the real critical path is much shorter**: in the brick-wall array structure (related card), signals only ever propagate in **two** fixed directions — carries flow right-to-left, sums flow top-to-bottom, **never** looping back or crossing the whole array in both dimensions independently for a single computation. Tracing the *actual longest path* from any input to the final output reveals it's bounded not by (number of rows) × (row width), but by (array height) + (array width) — i.e. $O(n) + O(n) = O(n)$, since a signal only ever needs to traverse the array's length plus its width once, not the full $n^2$ grid of cells sequentially.

**Why this matters**: this is a concrete illustration of a recurring theme — a structure's **worst-case bound derived from counting components naively** (here, "$O(n)$ additions, each $O(n)$, so $O(n^2)$") can dramatically overstate the truth once you actually trace which paths are the **longest**, rather than assuming delays compound in the most pessimistic possible way across every component. The correct $O(n)$ latency bound for this specific array-multiplier structure is what later motivates treating the whole $n^2$-cell grid as a **single, reasonably-fast combinational block** (with $\\Theta(n^2)$ hardware cost but only $\\Theta(n)$ latency) — the starting point ("Chapter 2" of the multiplier design space) that pipelining, interleaving, and hardware-minimization techniques (related cards) each subsequently trade against.`,
    pitfall:
      "Counting the number of sequential operations (here, additions) and multiplying by each operation's individual worst-case delay gives a valid but often very loose upper bound — the array multiplier's actual critical path is determined by tracing the longest actual signal route through the specific interconnection structure, which can be far shorter than the naive product suggests.",
    related: ["mit6004-pipe-mult-recursive-construction", "mit6004-pipe-mult-pipelining-diagonal-slices"],
  },
  {
    id: "mit6004-pipe-mult-pipelining-diagonal-slices",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why do the 'obvious' ways of pipelining the array multiplier (horizontal row-slicing) fail to be well-formed or fail to break the long paths, and what does the correct diagonal-slice pipeline achieve?",
    back: `**First attempt — slice by horizontal rows**: insert pipeline registers between consecutive rows of the brick-wall array. This *is* a well-formed pipeline (registers correctly separate every path), giving $\\Theta(n)$ stages — but it doesn't address the real problem: each individual row's own carry-chain is still a long $O(n)$-length combinational path *within* a single stage, so the clock period is still bottlenecked at $\\Theta(n)$, giving only $\\Theta(1/n)$ throughput — no real improvement over the unpipelined version, just "stupid pipeline tricks" that add latency without buying throughput.

**Second attempt — slice by columns ("even stupider")**: this fails even more basically — it's **not a well-formed pipeline at all**, because different paths through the circuit end up crossing different numbers of registers, and (worse) data crosses stage boundaries in *both* directions simultaneously, violating the single-direction-crossing requirement (related card) outright.

**The correct approach — diagonal slicing**: since the array's long combinational paths run diagonally (down-and-to-the-left, following the carry/sum propagation directions established earlier, related card), slice the array along **diagonal** boundaries instead of horizontal or vertical ones — this genuinely **segments every long combinational path** into short pieces, one piece per pipeline stage. The result: $\\Theta(n)$ stages, **but now each stage's own combinational delay is $\\Theta(1)$** (a small, bounded piece of carry chain, not the whole thing) — giving a $\\Theta(1)$ clock period and hence $\\Theta(1)$ throughput, **independent of the operand size $n$** — genuinely well-formed, and genuinely achieving the pipelining payoff this time. The tradeoff: latency rises to $\\Theta(n)$ (an individual multiplication now takes $n$ clock cycles to traverse all the diagonal stages) and hardware cost stays $\\Theta(n^2)$ (same array, just with registers added between diagonal slices).`,
    pitfall:
      "A pipeline can be well-formed (every path crosses the same number of registers) while STILL not achieving the throughput goal, if the resulting per-stage combinational delay is still large — well-formedness is necessary for CORRECTNESS, but choosing where the stage boundaries actually fall relative to the circuit's long paths is what determines whether the pipeline achieves its PERFORMANCE goal.",
    related: ["mit6004-pipe-mult-latency-insight", "mit6004-pipe-design-methodology"],
  },
  {
    id: "mit6004-pipe-mult-slice-bit-serial",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the slice-serial and bit-serial multiplier designs, and explain the hardware/latency/throughput tradeoff each makes at the opposite extreme from the pipelined array.",
    back: `The pipelined diagonal-slice array (related card) is optimized for **high throughput** (constant, independent of $n$) at the cost of $\\Theta(n^2)$ hardware — appropriate when multiplications are frequent. When multiplications are **infrequent**, that hardware investment is wasted; cost-minimization instead motivates *reusing* a small amount of hardware across multiple clock cycles.

**Slice-serial multiplier**: instead of building $n$ separate diagonal pipeline stages in hardware simultaneously, build just **one** stage's worth of hardware (a single $n$-bit "slice") and **reuse it** across $n$ clock cycles, feeding back the previous cycle's partial results — emulating the pipelined array's full stage sequence with only $\\Theta(n)$ hardware (one slice, not $n$ slices) instead of $\\Theta(n^2)$. Result: $\\Theta(1)$ (constant) clock period, $\\Theta(n)$ latency (an individual multiplication still needs $n$ cycles through the reused slice), but throughput drops back to $\\Theta(1/n)$ (only one multiplication's worth of work can be "in flight" through the single reused slice at a time, unlike the fully-pipelined version where $n$ different multiplications occupy the $n$ stages simultaneously).

**Bit-serial multiplier — an even more extreme cost minimization**: reuse a **single 1-bit "brick"** cell (rather than a whole $n$-bit slice) across *both* dimensions — both operands are fed in serially, one bit at a time, requiring $O(n^2)$ total clock cycles to complete a full multiplication (needing additional storage, typically borrowed from existing registers, to hold intermediate state between cycles). Result: $\\Theta(1)$ hardware (a single reused cell — the absolute minimum), but $\\Theta(n^2)$ latency and $\\Theta(1/n^2)$ throughput — the worst performance of any of the four designs, in exchange for the smallest possible hardware footprint.

Both designs trade throughput and/or latency for dramatically reduced hardware — the general "amortize a small amount of hardware across many clock cycles instead of building it out $n$-fold in parallel" technique, which reappears constantly in real digital design whenever a resource is used infrequently enough that dedicating full parallel hardware to it isn't worth the cost.`,
    pitfall:
      "Slice-serial and bit-serial designs both keep the SAME clock period (Θ(1)) as the fully pipelined design — the performance cost shows up entirely in LATENCY and THROUGHPUT, not in clock speed. It's a common mistake to assume reusing hardware necessarily slows the clock down; here it's specifically the number of cycles needed per operation, and how many operations can overlap, that changes.",
    related: ["mit6004-pipe-mult-pipelining-diagonal-slices", "mit6004-pipe-mult-cost-performance-summary"],
  },
  {
    id: "mit6004-pipe-mult-cost-performance-summary",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Summarize all four multiplier designs' cost/latency/throughput tradeoffs, and state the general engineering lesson this case study is meant to illustrate.",
    back: `| Scheme | Hardware ($) | Latency | Throughput |
|---|---|---|---|
| Combinational (unpipelined array) | $\\Theta(n^2)$ | $\\Theta(n)$ | $\\Theta(1/n)$ |
| N-pipe (diagonal-slice pipeline) | $\\Theta(n^2)$ | $\\Theta(n)$ | $\\Theta(1)$ |
| Slice-serial | $\\Theta(n)$ | $\\Theta(n)$ | $\\Theta(1/n)$ |
| Bit-serial | $\\Theta(1)$ | $\\Theta(n^2)$ | $\\Theta(1/n^2)$ |

**Reading the table**: moving down the table trades progressively less hardware for progressively worse throughput (and, for bit-serial, worse latency too) — there is **no single "best" design**; each occupies a different point in the cost/performance space, and the right choice depends entirely on the actual **usage pattern** the multiplier will see. Frequent multiplications on a performance-critical path justify the pipelined array's $\\Theta(n^2)$ hardware cost to get constant throughput; infrequent, latency-tolerant multiplications (e.g. a rarely-used instruction in a simple processor) are better served by the bit-serial design's minimal hardware footprint, accepting that any individual multiplication will simply take longer.

**The general engineering lesson**: this entire case study (recursive structure exploitation, recognizing the true O(n) critical path, correctly identifying diagonal — not horizontal or vertical — as the right pipelining cut, and finally the serial/bit-serial hardware-minimization extremes) is presented specifically as a template for approaching **any** digital design problem: first get a *structurally sound* baseline design by exploiting problem structure; then analyze its *true* (not naively-bounded) performance characteristics; then deliberately explore the cost/performance tradeoff space in both directions (more hardware for more throughput, or less hardware for less throughput) depending on the actual deployment requirements — "digital systems architecture" as a discipline of making these tradeoffs deliberately, rather than defaulting to either extreme.`,
    related: ["mit6004-pipe-mult-slice-bit-serial", "mit6004-pipe-latency-throughput"],
  },
];
