// MIT 6.035 (Spring 2010) — Lectures 13-15: instruction scheduling and loop
// optimization. Lecture 13 covers single-basic-block instruction scheduling
// (data-dependence types, the dependence DAG, greedy list scheduling and its
// READY-list heuristics, NP-completeness, resource-constrained/pipeline
// scheduling, and extending scheduling across basic blocks via control-
// dependence safety constraints and trace scheduling/superblock formation).
// Lecture 14 covers loop-specific scheduling techniques (unrolling + register
// renaming, software pipelining, the register-allocation/scheduling ordering
// tension, hardware- vs. compiler-driven scheduling) and induction-variable
// theory (basic vs. dependent IVs, families/basis, detection algorithm,
// including the variable-splitting subtlety). Lecture 15 covers strength
// reduction and loop test replacement (both formalized as algorithms over
// induction variables) plus a third pass on loop-invariant code motion
// (fixed-point classification, correct hoist-to-level), then closes with an
// SSE SIMDization case study (xmm registers, data transfer/arithmetic/
// reordering instructions, and the structural conditions a loop must satisfy
// to be SIMDized). See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6035-sched";

export const mit6035SchedInstructionLoopSchedulingCards: Card[] = [
  // --- Lecture 13: Introduction to code optimization: instruction scheduling ---
  {
    id: "mit6035-sched-dependence-types",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why do pipelined processors motivate instruction scheduling, and what are the three types of data dependency a scheduler must respect?",
    back: `**The motivation**: on a pipelined processor, an instruction's *result* often isn't available for several cycles after it *issues* (a multi-cycle multiply or a memory load are the classic examples) — an instruction that immediately needs that result must stall, wasting cycles. If the compiler instead **reorders** independent instructions to fill the gap between a producer and its consumer, the pipeline stays busy and the same program executes faster, with no change in meaning — this reordering is exactly what a scheduler does, and its only constraint is that it must never reorder past a genuine dependency.

**Three dependency types between two instructions that touch the same storage location**:
- **True dependency (RAW — read-after-write)**: the second instruction *reads* a value the first *writes*. This reflects real dataflow — the second instruction genuinely needs the first's result, and their relative order can never be changed.
- **Anti-dependency (WAR — write-after-read)**: the second instruction *writes* a location the first *reads*. Reordering these would let the write clobber the value before the read sees it — but this constraint exists only because the same storage location is being *reused*, not because of any real data need.
- **Output dependency (WAW — write-after-write)**: both instructions *write* the same location. Reordering would leave the wrong value as the final one — again a constraint purely from storage reuse, not dataflow.

**Why the distinction matters**: only RAW reflects genuine dataflow; WAR and WAW are "false" or "name" dependencies, artifacts of two logically unrelated computations happening to share a register or memory location — a fact exploited directly by register renaming (related card) to eliminate them and unlock more scheduling freedom.`,
    related: ["mit6035-sched-dependence-dag", "mit6035-sched-loop-unrolling-renaming"],
  },
  {
    id: "mit6035-sched-dependence-dag",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe how a basic block's instructions are turned into a dependence DAG for scheduling, and what a valid schedule corresponds to.",
    back: `**Construction**: each instruction in the basic block becomes one **node**. A **directed edge** is added from instruction \`i\` to instruction \`j\` whenever \`j\` depends on \`i\` (any of the three dependency types — true, anti, or output; related card) and \`i\` precedes \`j\` in the original program order. Each edge is **weighted by the latency** of the source instruction — the minimum number of cycles that must elapse after \`i\` issues before \`j\` may legally issue.

**A valid schedule = a topological ordering of the DAG that also respects edge weights**: any linearization of the nodes where every predecessor precedes its successors is dependency-safe; among all such linearizations, the scheduler additionally tries to *pack* instructions as densely as possible into cycles, subject to each edge's minimum-latency gap and (once introduced) resource availability (related card).

**Why building the DAG explicitly matters**: it turns "which reorderings are safe" into a purely structural graph question — any two instructions with **no path between them** in either direction are provably independent and may be freely reordered or interleaved, while any two connected by a path must preserve that path's relative order. This is the data structure every scheduling algorithm in this module operates over.`,
    related: ["mit6035-sched-dependence-types", "mit6035-sched-list-scheduling-algorithm"],
  },
  {
    id: "mit6035-sched-list-scheduling-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the greedy list-scheduling algorithm for scheduling a single basic block's dependence DAG.",
    back: `**Setup**: maintain a **READY list** — the set of DAG nodes whose predecessors have *all* already been scheduled, and whose latency requirements relative to those predecessors have already been satisfied by the current cycle. Initially, READY contains exactly the DAG's source nodes (no predecessors).

**Main loop, one cycle at a time**: from the current READY list, **greedily select** one or more instructions to issue this cycle (bounded by however many the machine can issue per cycle, and — once resource constraints are added — by which pipeline resources are still free; related card), using a priority heuristic to break ties (related card) whenever READY has more candidates than can be issued. After issuing, **update READY**: any node whose *last* remaining predecessor was just satisfied (i.e. that predecessor's latency has now fully elapsed) is added.

**Termination**: repeat until every node has been scheduled. The result is a concrete cycle-by-cycle instruction order — always a valid topological order of the DAG by construction, since a node only ever enters READY after all its predecessors have already issued and their latencies have elapsed.

**Why "greedy" and not exhaustive**: this is a fast, practical heuristic, not a search over all valid schedules — optimal scheduling is NP-complete (related card), so real compilers accept a good-but-not-guaranteed-optimal schedule from this greedy procedure.`,
    related: ["mit6035-sched-dependence-dag", "mit6035-sched-ready-list-heuristics"],
  },
  {
    id: "mit6035-sched-ready-list-heuristics",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "List the standard heuristics used to break ties among instructions in list scheduling's READY list, and justify each.",
    back: `When more than one instruction is READY in the same cycle and the machine can't issue all of them, list scheduling breaks the tie with priority heuristics:

- **Longest path to a leaf (critical-path length)**: prefer the instruction that starts the *longest* remaining chain of dependent work still to be scheduled. Delaying it would delay everything downstream of it, so it should go first; delaying a *short*-remaining-chain instruction instead costs less, since there's more slack in when it can still be scheduled without extending the whole block's finish time.
- **Most successors**: prefer the instruction that, once scheduled, will make the *most* new instructions become READY. This keeps the READY list well-stocked, giving the scheduler more options (and hence more chances to keep the pipeline full) in future cycles.
- **Least-busy resource/pipeline**: prefer the instruction that uses a pipeline resource currently under the *least* contention. This spreads resource usage out over time rather than letting one heavily-used resource become a bottleneck that stalls everything waiting on it.

**The common thread**: none of these heuristics is individually guaranteed to produce an optimal schedule (only exhaustive search can guarantee that, and that's intractable; related card) — they're well-motivated approximations that tend to produce good schedules in practice, and real compilers typically combine several of them (e.g. critical-path length as the primary tie-breaker, falling back to the others).`,
    related: ["mit6035-sched-list-scheduling-algorithm", "mit6035-sched-np-completeness"],
  },
  {
    id: "mit6035-sched-np-completeness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is optimal instruction scheduling NP-complete even for a single basic block, and what does that imply for real compilers?",
    back: `**Why it's hard**: scheduling a basic block's dependence DAG onto a machine with limited issue width and limited pipeline resources, subject to precedence (dependency) constraints, is an instance of the general **resource-constrained scheduling with precedence constraints** problem — structurally the same problem as classical **job-shop scheduling**, which is known **NP-complete**. Even though the input (one basic block's instructions) is typically small, there's no known polynomial algorithm that's guaranteed to find the schedule with the fewest cycles, and none is expected to exist unless P = NP.

**Implication for compilers**: since exhaustive search over all valid topological orderings (further multiplied by all resource-assignment choices) is intractable at compile time, real compilers use **greedy heuristic list scheduling** (related card) instead — fast, and good in practice, but not guaranteed to find the theoretically optimal schedule. This is the same "NP-complete in general, so fall back to a well-motivated heuristic" pattern seen elsewhere in compiler optimization (e.g. optimal register allocation via graph coloring is also NP-complete in general).`,
    related: ["mit6035-sched-list-scheduling-algorithm", "mit6035-sched-ready-list-heuristics"],
  },
  {
    id: "mit6035-sched-resource-constrained-scheduling",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Explain how a pipeline resource (reservation) table extends list scheduling to handle structural hazards.",
    back: `**The gap in the unconstrained model**: pure dependency-based scheduling (related cards) assumes any topologically-valid order can be executed — but real hardware has a **finite number of pipeline resources** (functional units, memory ports, individual pipeline stages) that can only be occupied by one instruction at a time. Two dependency-independent instructions can still be un-schedulable in the *same* cycle if they'd both need the *same* physical resource — a **structural hazard**, distinct from any of the three data-dependency types.

**The reservation table**: a two-dimensional table — rows are pipeline **resources**, columns are **cycles** (relative to when an instruction issues) — recording, for each instruction kind, exactly which resources it occupies during which cycles of its execution.

**Extending list scheduling**: before issuing a candidate instruction in a given cycle, check its reservation-table pattern against what's **already reserved** in the table for the cycles it would occupy; if every needed resource is free across all of those cycles, issue it and **mark** the table's cells reserved; if any resource conflicts, that instruction **cannot** issue this cycle even though its data dependencies are already satisfied — it stays in READY and is retried in a later cycle. This means READY-list membership alone is no longer sufficient to issue an instruction — resource availability is now an equally binding constraint.`,
    related: ["mit6035-sched-list-scheduling-algorithm", "mit6035-sched-ready-list-heuristics"],
  },
  {
    id: "mit6035-sched-cross-block-scheduling-safety",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What safety constraint must scheduling respect when moving an instruction across a basic-block boundary, and why?",
    back: `**The new hazard beyond a single block**: within one basic block, every instruction is guaranteed to execute (control never branches away mid-block), so data dependencies are the only concern. Once scheduling considers moving instructions **across** block boundaries, a new concern appears: **control dependence** — whether an instruction is guaranteed to execute at all *along the path it's being moved to or from*.

**Downward motion (into a successor block)**: only safe if the instruction has **no potential to change observable behavior on paths where it originally wouldn't have run** — moving a division or a memory dereference below a guard that currently protects against divide-by-zero or a null/invalid pointer is unsafe, since on some path through the successor the guard's protection no longer applies, and the moved instruction could now raise an exception (or crash) that the *original* program never would have. Instructions with no such exception potential (most arithmetic, register-only moves) can be moved more freely.

**Upward motion (out of a block into a predecessor)**: only safe if the instruction is guaranteed to execute on **every** path leaving that predecessor — otherwise the move would newly execute the instruction along paths where the original program skipped it entirely, again a potential behavior change even if no exception occurs (e.g. an extra memory write with a side effect).

**The general principle**: never move a potentially-excepting or side-effecting instruction into a context where the guard that originally protected it is no longer certain to hold. This constraint is exactly what motivates trace scheduling's more conservative, duplication-based approach (related card) rather than naively hoisting/sinking instructions across arbitrary block boundaries.`,
    pitfall: "It's tempting to think any independent instruction can be freely hoisted into an earlier block to fill a scheduling gap — but hoisting a division or memory access above the guard that was protecting it can introduce a division-by-zero or invalid dereference on a path that never reached that instruction in the original program, changing observable behavior even though no data dependency was violated.",
    related: ["mit6035-sched-trace-scheduling-superblocks", "mit6035-sched-dependence-types"],
  },
  {
    id: "mit6035-sched-trace-scheduling-superblocks",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe trace scheduling (superblock formation) as a technique for scheduling beyond a single basic block.",
    back: `**The idea**: pick the **most frequently executed path** through the CFG — a **trace** spanning multiple basic blocks, typically identified via profiling or branch-prediction heuristics (e.g. always assume a loop's back-edge is taken). **Duplicate** code as needed so this trace becomes a single **superblock**: a single-entry, multiple-exit straight-line instruction sequence, with any side-exits (rare branches off the common path) preserved as exits out of the superblock, and any *side-entrances* (other paths that used to merge into the middle of the trace) eliminated by duplicating the merged-in code onto its own copy of the tail.

**Scheduling the result**: because a superblock behaves like one giant basic block internally, ordinary intra-block list scheduling (related card) can now freely reorder instructions across what used to be separate blocks' worth of code — as long as they came from the common, frequently-taken path.

**Compensation code**: since instructions may now be scheduled *earlier* than their original block, any **side-exit** taken off the trace needs **compensation code** inserted along that (rare) exit path, undoing or completing whatever work the reordering assumed would happen but that the off-trace path skips — preserving full correctness even though the fast, common-case path is optimized aggressively.

**The tradeoff**: like the code-duplication-for-precision technique from program analysis (splitting at merge points), this trades **code size** (potentially significant, if many side-paths need compensation code) for **scheduling freedom** on the hot path — profitable specifically because the duplicated/compensated paths are, by construction, rarely executed.`,
    related: ["mit6035-sched-cross-block-scheduling-safety", "mit6035-sched-list-scheduling-algorithm"],
  },

  // --- Lecture 14: Loop optimizations: instruction scheduling ---
  {
    id: "mit6035-sched-loop-unrolling-renaming",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain how loop unrolling combined with register renaming increases available instruction-level parallelism.",
    back: `**Unrolling alone**: replicating the loop body \`N\` times per enlarged "iteration" exposes far more instructions to the scheduler at once — instead of scheduling one small basic block's worth of work per original iteration, the scheduler now sees \`N\` original iterations' worth of independent work simultaneously, in principle giving it much more freedom to interleave and fill pipeline latency gaps.

**The problem naive unrolling introduces**: if each replicated copy of the loop body reuses the **same temporary registers** as the others (as a naive unroll that doesn't rename anything would), the scheduler now sees spurious **anti- and output dependencies** (related card) between what are logically completely independent computations from different original iterations — purely because they've been assigned to the same physical storage, not because of any real data need.

**The fix — register renaming**: assign each unrolled copy's temporaries to **distinct** registers. This removes every one of those false anti/output dependencies, leaving only genuine true (RAW) dependencies in the dependence DAG — which restores the scheduler's full freedom to interleave the now-independent work from different original iterations, exactly the freedom unrolling was meant to expose in the first place.`,
    related: ["mit6035-sched-dependence-types", "mit6035-sched-regalloc-vs-scheduling-tension"],
  },
  {
    id: "mit6035-sched-software-pipelining",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe software pipelining: what a 'steady-state' window is, and why a preamble and postamble are needed.",
    back: `**The idea**: rather than scheduling one loop iteration in isolation and repeating that same schedule every time through the loop, **overlap** the tail of one iteration with the head of one or more *later* iterations, so a single repeating block of code — the **steady-state window** — simultaneously retires part of an *older* iteration's work while starting part of a *newer* one's, every time through. This is the same "assembly line" idea as hardware pipelining, applied by the compiler at the level of whole loop iterations rather than individual instructions.

**Why preamble/postamble are needed**: the steady-state window's schedule assumes **several iterations are already "in flight"** simultaneously (that's exactly what makes it able to overlap tail-of-one with head-of-another) — so before the loop can run in steady state, a **preamble** must execute to *ramp up*, launching the first few iterations' early stages without yet having any older iteration's tail to overlap with. Symmetrically, once the loop's real trip count is exhausted, a **postamble** is needed to *ramp down*, finishing the remaining in-flight iterations' tails after no new iterations are being started.

**The cost**: more code (three sections instead of one loop body) and **higher register pressure** — since multiple iterations' worth of live values are now genuinely in flight simultaneously inside the steady-state window, more registers must stay live at once than a single unpipelined iteration would ever need. The payoff is hiding inter-iteration latency (e.g. a load in one iteration whose result isn't needed until several iterations later) that no single-iteration schedule could ever hide.`,
    related: ["mit6035-sched-loop-unrolling-renaming", "mit6035-sched-regalloc-vs-scheduling-tension"],
  },
  {
    id: "mit6035-sched-regalloc-vs-scheduling-tension",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain the fundamental ordering tension between register allocation and instruction scheduling.",
    back: `**Schedule-then-allocate**: a good instruction schedule spreads independent instructions apart in time to hide pipeline latency (related cards) — but doing so means **more values are simultaneously live** (in flight between being produced and being consumed) at any given point than a tightly-packed, unscheduled ordering would have. Register allocation performed *after* such a schedule may then find more live values than physical registers, forcing **spills** — which reintroduces memory traffic and can undo exactly the latency-hiding benefit the schedule was built to provide.

**Allocate-then-schedule**: allocating registers *first*, optimizing to minimize spills, tends to **reuse** the same small set of registers aggressively across nearby instructions — but that reuse is precisely what creates spurious **anti- and output dependencies** (related card) between instructions that have no real data relationship, cramping the scheduler's freedom to reorder and interleave, since it must now respect false dependencies it wouldn't have had with more registers available.

**Why there's no clean answer**: each phase's "locally optimal" choice actively degrades the other phase's effectiveness — a wide, latency-hiding schedule wants many live registers; a spill-free allocation wants few, reused registers. Real compilers don't solve this with a strict ordering; they use heuristics, phase-ordering choices tuned empirically, or iterate between the two phases to find a reasonable compromise.`,
    related: ["mit6035-sched-loop-unrolling-renaming", "mit6035-sched-software-pipelining"],
  },
  {
    id: "mit6035-sched-hardware-vs-compiler-scheduling",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast hardware- vs. compiler-driven instruction scheduling, and explain why VLIW makes compiler scheduling mandatory.",
    back: `**What hardware can do dynamically**: a modern **superscalar out-of-order** processor performs some scheduling *at runtime* — **hardware register renaming** transparently removes anti- and output dependencies (mapping architectural registers to a larger pool of physical ones), and an **out-of-order issue window** lets independent instructions execute ahead of program order even when the compiler's static schedule didn't reorder them. This gives real hardware some tolerance for a suboptimal static schedule — the processor can partially compensate at runtime.

**Why static scheduling still matters even so**: the hardware's reordering window is **limited in size** — it can only look ahead a bounded number of instructions, so a static schedule that keeps independent, latency-hiding work close together within that window still meaningfully improves performance; a static schedule can't rely on the hardware to fix an arbitrarily bad ordering.

**VLIW — where compiler scheduling is mandatory, not just helpful**: a **Very Long Instruction Word** architecture has **no hardware reordering at all** — each explicit instruction bundle specifies, verbatim, exactly which operations execute together in that one cycle, decided entirely at **compile time**. There is no dynamic fallback if the compiler's schedule is suboptimal or even outright leaves functional units idle — correctness of *scheduling quality* (though not of program semantics) rests entirely on the compiler. This is the clearest illustration of the general principle that hardware and compiler scheduling are substitutes to some degree on superscalar OOO machines, but on VLIW the compiler is the *only* scheduler that exists.`,
    related: ["mit6035-sched-dependence-types", "mit6035-sched-resource-constrained-scheduling"],
  },
  {
    id: "mit6035-sched-induction-variable-classes",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define basic and dependent induction variables, and explain what a 'family' and its 'basis' variable are.",
    back: `**Basic induction variable**: a variable with exactly **one** definition inside the loop body, of the form \`X = X + c\` (or \`X = X - c\`) for a **loop-invariant** \`c\` — it changes by the same fixed amount every single iteration, so its value across iterations forms a simple arithmetic sequence (e.g. \`1, 2, 3, 4, ...\` for \`c=1\`, or \`202, 200, 198, 196, ...\` for \`X = X - 2\`).

**Dependent induction variable**: a variable \`Y\` whose value, at every point it's defined, is an **affine function** of some basic induction variable \`X\`: \`Y = a*X + b\`, where \`a\` and \`b\` are **loop-invariant**. Its value across iterations is therefore also fully predictable, just scaled and offset relative to \`X\`'s sequence — e.g. if \`X\` is a loop counter \`j\` stepping by 2, an array-address computation like \`abase + 4*j\` is a dependent IV with \`a=4\`, \`b=abase\`.

**Family and basis**: every dependent IV expressed in terms of the *same* basic IV \`X\`, together with \`X\` itself, forms a **family** with **basis** \`X\`. A single loop can contain **multiple independent families**, each with its own basis variable, when the loop increments more than one truly independent basic IV (as opposed to several dependent IVs all riding on one shared loop counter).

**Why this classification matters**: it's the foundation both strength reduction and loop test replacement (related cards) build on — both techniques specifically exploit the affine \`a*X+b\` relationship within a family to replace expensive recomputation with cheap incremental updates, or to eliminate a basic IV entirely.`,
    related: ["mit6035-sched-finding-induction-variables", "mit6035-sched-strength-reduction"],
  },
  {
    id: "mit6035-sched-finding-induction-variables",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Outline the algorithm for detecting induction variables, and explain the subtlety of a source variable needing to be split into multiple IV sequences.",
    back: `**Pass 1 — find basic IVs**: scan for variables with exactly **one** loop-body definition of the form \`X = X + c\` (loop-invariant \`c\`); each such variable is a basic induction variable.

**Pass 2 — find dependent IVs, to a fixed point**: iteratively look for variables \`Y\` with a **single** definition of the form \`Y = a*X + b\` (loop-invariant \`a\`, \`b\`) where \`X\` is already-classified as an induction variable (basic, or itself dependent on some basis) — classify \`Y\` as dependent, and repeat, since classifying \`Y\` may now let some *other* variable defined in terms of \`Y\` also be classified. This **iterate-to-closure** structure mirrors the same fixed-point pattern used to classify loop-invariant expressions (related card): keep applying the classification rule until a full pass adds nothing new.

**The variable-splitting subtlety**: the algorithm above assumes each source-level variable has **one** governing definition — but if a *single* variable is reused within one iteration for **two logically distinct purposes** (e.g. incremented once near the top of the loop body for one role, then reassigned differently near the bottom for an unrelated role, or used as an accumulator that's periodically reset), it does **not** have one consistent affine relationship to any basis variable across the whole iteration, and naively applying the classification rule to it would derive an \`(a, b)\` pair that doesn't actually hold throughout. Correct handling requires first recognizing the reused variable's two roles as **two separate conceptual induction-variable sequences** (effectively, splitting it the way SSA renaming would split a reused name at each new definition) — only then can the standard basic/dependent classification be applied correctly to each sequence independently.`,
    pitfall: "Detecting induction variables purely by variable name breaks when one source-level variable is reused for two unrelated purposes within a single iteration — the algorithm must recognize this as two separate induction-variable sequences (conceptually, split via renaming) before classifying either one, or it will derive an incorrect affine relationship that doesn't hold across the whole loop.",
    related: ["mit6035-sched-induction-variable-classes", "mit6035-sched-loop-invariant-code-motion"],
  },

  // --- Lecture 15: More loop optimizations ---
  {
    id: "mit6035-sched-loop-invariant-code-motion",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the fixed-point definition of loop-invariant computations, and explain why hoisting must target the correct loop-nesting level.",
    back: `**Fixed-point classification** (structurally the same iterate-to-closure pattern used for induction-variable detection, related card): a variable or expression is **loop-invariant** relative to a given loop if:
- it's a **constant**, or
- **variables not updated anywhere in the loop** are trivially loop-invariant, or
- **expressions built entirely from loop-invariant variables/constants** are themselves loop-invariant, or
- a **variable assigned only a loop-invariant expression** (i.e. its one relevant definition's right-hand side is itself already classified invariant) is itself loop-invariant.

Applying these rules repeatedly until no more variables/expressions can be added reaches the full set of loop-invariant computations.

**Hoisting to the correct nesting level, not automatically the outermost loop** — the canonical worked example: \`for i=1 to N: x=x+1; for j=1 to N: a(i,j) = 100*N + 10*i + j + x\`. The subexpression \`100*N\` depends on neither \`i\` nor \`j\` — it's invariant with respect to **both** loops, so it's hoisted all the way above the **outer** \`i\`-loop: \`t1 = 100*N\`. The subexpression \`t1 + 10*i + x\` depends on \`i\` and \`x\` (both of which change every outer iteration) but **not** on \`j\` — it's invariant only with respect to the **inner** \`j\`-loop, so it's hoisted just inside the outer loop, above the inner loop: \`t2 = t1 + 10*i + x\`, computed once per outer iteration (right after \`x = x+1\`). The inner loop body reduces to \`a(i,j) = t2 + j\`.

**The general principle**: each computation must be hoisted to the **shallowest enclosing loop for which it is actually invariant** — hoisting everything reflexively to the outermost loop would be **incorrect** whenever a term (like \`10*i\` above) still depends on an outer loop's changing index.`,
    related: ["mit6035-sched-finding-induction-variables", "mit6035-sched-strength-reduction"],
  },
  {
    id: "mit6035-sched-strength-reduction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the formal strength-reduction algorithm for a dependent induction variable, and trace it on a two-family worked example.",
    back: `**Algorithm**, for a dependent induction variable \`K = a*J + b\` of basic induction variable \`J\` (where \`J = J + c\` each iteration):
1. **Pre-header initialization**: add a new variable \`K'\`, initialized *before* the loop to \`K' = a*Jinit + b\` (the value \`K\`'s original definition would compute on the very first iteration).
2. **Incremental update**: at the same point \`J\` is incremented in the loop body, insert \`K' = K' + a*c\` immediately alongside it — since \`a*c\` is loop-invariant, this is a cheap addition computed from an already-known constant, replacing what would otherwise be a fresh multiplication every iteration.
3. **Replace every use** of \`K\`'s original (multiplication-based) definition with a reference to \`K'\`.

**Worked example** (\`double A[256], B[256][256]\`, basic IV \`j\` starting at 1 and stepping by \`c=2\`): the loop body originally computes \`*(&A + 4*j) = *(&B + 4*(256*j + j))\` each iteration — two dependent IVs sharing basis \`j\`: \`a = &A + 4*j\` (family coefficients \`a\`-coeff\`=4\`, \`b\`-coeff\`=&A\`) and \`b = &B + 4*257*j\` (coefficients \`1028\`, \`&B\`). Applying the algorithm to each: pre-header becomes \`a = &A + 4\`, \`b = &B + 1028\` (evaluated at \`j=1\`); the per-iteration increments become \`a = a + 8\` (since \`a\`-coeff \`* c\` \`= 4*2 = 8\`) and \`b = b + 2056\` (\`1028*2 = 2056\`); the loop body itself collapses to the simple pointer dereference \`*a = *b\`, with every multiplication gone.

**Why "not a data-flow problem"**: unlike the classical GEN/KILL dataflow analyses, this is a purely **local, algebraic** transformation driven directly by an induction variable's already-known affine structure — no fixed-point iteration over the CFG is needed once the induction variables are classified.`,
    code: `j = 1; a = &A + 4; b = &B + 1028\nwhile (j > 100):\n    *a = *b\n    j = j + 2\n    a = a + 8\n    b = b + 2056`,
    codeLang: "text",
    related: ["mit6035-sched-induction-variable-classes", "mit6035-sched-loop-test-replacement"],
  },
  {
    id: "mit6035-sched-loop-test-replacement",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the loop test replacement algorithm, and trace it on the strength-reduction worked example to eliminate the basic induction variable j.",
    back: `**Motivation**: after strength reduction (related card) has replaced every *use* of a basic induction variable's family members with incrementally-updated dependent IVs, the basic IV itself may end up used for **nothing except the loop's exit test** — at that point it's pure overhead: it's still incremented every iteration solely to support a comparison that could instead be phrased directly in terms of a dependent IV that's already being maintained.

**Algorithm**: if basic induction variable \`J\` is used *only* for calculating other induction variables (its loop-test use included), pick any induction variable \`K\` in \`J\`'s family (\`K = a*J + b\`). Replace a test \`if (J > X) goto L1\` with \`if (K' > a*X + b) goto L1\` when \`a\` is **positive**, or \`if (K' < a*X + b) goto L1\` when \`a\` is **negative** (the comparison direction flips because multiplying an inequality by a negative coefficient reverses it). If \`J\` is still **live** at any exit from the loop (used after the loop ends), it must be **recomputed** there as \`J = (K' - b) / a\`, since \`J\` itself is about to be eliminated from the loop body.

**Worked example, continuing directly from the strength-reduction result**: the original test was \`while (j > 100)\`, and \`j\` (basic IV, unused elsewhere after strength reduction) has family member \`a = &A + 4*j\` (coefficients \`a\`-coeff\`=4\`, \`b\`-coeff\`=&A\`). Substituting: \`j > 100 ⟹ a > 4*100 + &A = &A + 800\`. The loop becomes \`a = &A+4; b = &B+1028; while (a > &A+800): *a = *b; a = a+8; b = b+2056\` — \`j\` and its per-iteration increment are gone entirely, with the loop's termination now driven purely by the already-incrementally-maintained pointer \`a\`.`,
    code: `a = &A + 4; b = &B + 1028\nwhile (a > &A + 800):\n    *a = *b\n    a = a + 8\n    b = b + 2056`,
    codeLang: "text",
    related: ["mit6035-sched-strength-reduction", "mit6035-sched-induction-variable-classes"],
  },
  {
    id: "mit6035-sched-simd-sse-registers-and-data-transfer",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe SSE's SIMD model: what the xmm registers represent, and the two data-transfer instructions MOVDQA and MOVDQU.",
    back: `**SIMD (Single Instruction, Multiple Data)**: compute multiple identical operations within a single instruction, exploiting fine-grained, data-parallel structure — the same operation applied independently across several data elements packed together in one wide register, rather than one element at a time.

**The xmm registers**: 16 registers, \`%xmm0\`–\`%xmm15\`, each **128 bits wide**. A single 128-bit register can be **reinterpreted** at several granularities simultaneously — as one 128-bit double quadword, as two 64-bit quadwords, as four 32-bit doublewords, or as eight 16-bit words — and each arithmetic operation comes in a version matching one of these interpretations (related card), so the same physical register can hold, say, four 32-bit integers processed together by one instruction.

**Data transfer instructions**:
- \`MOVDQA op1, op2\` — move an **aligned** double quadword: reads or writes memory in full 128-bit chunks, with any register operand required to be an xmm register, and any memory-address operand required to be a **multiple of 16** (16-byte aligned).
- \`MOVDQU op1, op2\` — the **unaligned** counterpart: functionally identical, except memory addresses do **not** need to be multiples of 16 — used whenever alignment can't be guaranteed, typically at some performance cost relative to the aligned form.

There's also \`MOVQ op1, op2\`, which moves a **64-bit** quantity — usable to move between a general-purpose 64-bit register and the *lower* 64 bits of an xmm register (or vice versa), or to read/write a 64-bit chunk directly to/from memory.`,
    related: ["mit6035-sched-simd-arithmetic-and-data-reordering", "mit6035-sched-conditions-for-simdization"],
  },
  {
    id: "mit6035-sched-simd-arithmetic-and-data-reordering",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe SSE arithmetic instruction naming, and the PUNPCKLDQ/PUNPCKLQDQ data-reordering (unpack-and-interleave) instructions.",
    back: `**Arithmetic instruction naming**: each arithmetic operation comes in **multiple versions**, one per data width, distinguished by an instruction suffix indicating the element size being operated on — e.g. addition: \`PADDQ\` (add 64-bit quadwords), \`PADDD\` (add 32-bit doublewords), \`PADDW\` (add 16-bit words); subtraction follows the identical naming pattern: \`PSUBQ\`, \`PSUBD\`, \`PSUBW\`. Choosing the right suffix tells the processor how many independent lanes to slice the 128-bit register into and operate on in parallel.

**Data reordering — unpack and interleave**: before SIMD arithmetic can operate on several elements at once, the data often has to be **rearranged** into the right lanes of an xmm register first. \`PUNPCKLDQ\` interleaves the **low doublewords** (32-bit) of two source registers into one destination register (alternating elements from each source); \`PUNPCKLQDQ\` does the analogous interleave at the **low quadword** (64-bit) granularity, taking the low 64 bits of each of two sources and concatenating them into one 128-bit result. These instructions are the standard building block for "broadcasting" a single scalar value into every lane of a register — moving a scalar into the low bits via \`MOVQ\`, then repeatedly interleaving it with itself via \`PUNPCKLDQ\`/\`PUNPCKLQDQ\` until every lane holds a copy — exactly the pattern used to set up a loop-invariant multiplier before a SIMDized multiply loop (related card).`,
    related: ["mit6035-sched-simd-sse-registers-and-data-transfer", "mit6035-sched-simd-worked-example"],
  },
  {
    id: "mit6035-sched-simd-worked-example",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Trace the SIMDization of `for i=1 to N: A[i] = A[i] * b` from unrolled scalar code to its SSE version.",
    back: `**Source and its scalar-unrolled form**: \`for i = 1 to N: A[i] = A[i] * b\` unrolls (with register renaming, related card) to a loop body that reads two consecutive \`A\` elements, multiplies each by the loop-invariant \`b\`, and writes both back — using **two separate 64-bit-register index computations** (\`%rax\`, \`%rbx\`), one per unrolled copy, each decremented by 8 bytes per iteration.

**The SIMD version does the same work with one wide register instead of two scalar ones**:
- **Setup, once before the loop**: \`MOVQ %r11, %xmm2\` moves the scalar multiplier \`b\` (held in \`%r11\`) into the low 64 bits of \`%xmm2\`; \`PUNPCKLDQ %xmm2, %xmm2\` then interleaves \`%xmm2\` with itself, **populating every lane of \`%xmm2\` with a copy of \`b\`** (related card) — so the single register now holds "\`b\`, \`b\`, \`b\`, \`b\`" ready for a packed multiply.
- **Loop body**: \`MOVDQA (%rdi,%rax), %xmm0\` loads 128 bits (four packed elements) from memory in one instruction; \`PMULUDQ %xmm2, %xmm0\` multiplies all packed elements by the broadcast \`b\` simultaneously; \`MOVDQA %xmm0, (%rdi,%rax)\` stores the whole packed result back in one instruction; \`SUB $8, %rax\` advances the **single** index (only one index is needed now, versus the scalar-unrolled version's two).

**The net effect**: four scalar multiply-and-store operations collapse into one packed multiply-and-store, with one shared index register instead of two — directly cutting the number of executed load/multiply/store/index instructions relative to the unrolled scalar version.`,
    code: `movq       %r11, %xmm2\npunpckldq  %xmm2, %xmm2\nloop:\n    movdqa (%rdi,%rax), %xmm0\n    pmuludq %xmm2, %xmm0\n    movdqa %xmm0, (%rdi,%rax)\n    sub    $8, %rax\n    jz     loop`,
    codeLang: "text",
    related: ["mit6035-sched-simd-arithmetic-and-data-reordering", "mit6035-sched-conditions-for-simdization"],
  },
  {
    id: "mit6035-sched-conditions-for-simdization",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the structural conditions a loop must satisfy to be SIMDized, and the practical strategy compilers use to find such loops.",
    back: `**Conditions for SIMDization**:
- **Consecutive iterations must read and write consecutive memory locations** — SIMD loads/stores move a contiguous chunk of memory at once (related card), so the data really has to be laid out contiguously for a packed load/store to correctly gather/scatter the right elements.
- **Consecutive iterations must be independent of each other** — since a SIMD instruction processes several logical "iterations" worth of data genuinely simultaneously within one instruction, there can be no true (RAW) dependency of one iteration's computation on a *previous* iteration's result (which the earlier induction-variable and dependency material, related cards, is exactly the machinery for detecting) — this is the same non-negotiable independence requirement that underlies safe reordering/parallelization generally.

**Practical detection strategy**: rather than attempting a fully general dependence analysis across arbitrary loop structure, **the easiest approach is to pattern-match at the basic-block level after unrolling the loop** (related card) — once the loop body has been unrolled into a single straight-line basic block containing several copies of the original iteration's instructions with renamed registers, groups of instructions that are structurally identical except for consecutive memory offsets and consecutive (renamed) registers are exactly the pattern a SIMDizing pass looks for and replaces with one packed instruction, as in the multiply-loop worked example (related card).`,
    related: ["mit6035-sched-simd-worked-example", "mit6035-sched-loop-unrolling-renaming"],
  },
];
