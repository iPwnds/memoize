// MIT 6.035 (Spring 2010) — Lectures 16-18: register allocation,
// parallelization, and memory optimization — the course's final module.
// Lecture 16 covers graph-coloring register allocation (webs, interference
// graphs, the simplify/select algorithm, spill-cost heuristics, splitting as
// an alternative to spilling, and further optimizations: coalescing,
// pre-coloring, pre-splitting, interprocedural allocation). Lecture 17
// covers automatic parallelization (Amdahl's law and parallel-execution
// models, iteration-space/data-space dependence analysis via distance
// vectors and integer programming, and techniques that increase
// parallelization opportunities: privatization, reduction recognition, and
// legality-constrained loop transformations). Lecture 18 covers memory
// system optimization (the cache-miss taxonomy and reuse distance, loop and
// data transformations that improve locality, prefetching, and alias
// analysis as the whole-program prerequisite pointer-heavy code imposes on
// every optimization above). See src/data/courses.ts for the full lecture
// map. This module completes MIT 6.035.
import type { Card } from "./types";

const MODULE = "mit6035-alloc";

export const mit6035AllocParallelMemoryCards: Card[] = [
  // --- Lecture 16: Register allocation ---
  {
    id: "mit6035-alloc-webs-and-interference",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a 'web' as the unit of register allocation, and describe how the interference graph is built from webs.",
    back: `**Why not allocate registers per source-level variable**: a single source variable may be reassigned many times with unrelated live ranges (e.g. reused as a loop counter in two different loops) — treating the whole variable as one indivisible unit would force every one of its uses into the *same* register even when the separate live ranges never overlap and could safely use different registers.

**Web**: the actual unit of allocation — a maximal set of definitions and uses connected by def-use chains (a definition and every use it can reach, transitively merged whenever two definitions reach a common use). Each web is allocated to **one** register (or spilled to memory) independently of every other web, even ones belonging to the same source variable.

**Interference graph**: one **node** per web; an **edge** between two webs whenever their live ranges **overlap** (both are simultaneously live at some program point) — meaning they cannot safely share the same register, since assigning them the same register would let one clobber the other's still-needed value. Register allocation now reduces to: assign each node a register such that no two **adjacent** nodes (interfering webs) get the same one — exactly **graph coloring**, with available physical registers as the palette (related card).`,
    related: ["mit6035-alloc-graph-coloring-algorithm", "mit6035-alloc-splitting-vs-spilling"],
  },
  {
    id: "mit6035-alloc-graph-coloring-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the simplify/select graph-coloring algorithm for register allocation, given N available registers.",
    back: `**Goal**: color the interference graph (related card) with **N** colors (one per physical register) such that no two adjacent nodes share a color — an **N-colorable** graph yields a valid, spill-free allocation.

**Simplify phase**: repeatedly find any node with **degree < N** (fewer than N interfering neighbors) and **remove** it from the graph, pushing it onto a stack — such a node is always safely colorable later, since even if all its neighbors end up with *different* colors, at most N−1 colors are excluded, leaving at least one free. Repeat until either the graph is empty, or every remaining node has degree ≥ N (related card, spilling).

**Select phase**: **pop** nodes off the stack one at a time (reverse removal order) and assign each the **first color not already used by any of its neighbors currently colored** — by construction from the simplify phase, a popped node was removed while its degree was < N, so at least one color is guaranteed free among its (at most N−1 distinct) neighbors' colors.

**If simplify gets stuck** (every remaining node has degree ≥ N, but the graph isn't empty): the graph may or may not still be colorable — a node must be chosen to **spill** (or **split**, related card) speculatively, removed from the graph anyway, and the algorithm optimistically continues; if select later fails to find a free color for that node when popped, it's confirmed as an actual spill.`,
    related: ["mit6035-alloc-webs-and-interference", "mit6035-alloc-coloring-worked-example"],
  },
  {
    id: "mit6035-alloc-coloring-worked-example",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Trace graph coloring on a 5-node interference graph (s0-s4, forming a graph with no degree-<3 node) with N=3 registers.",
    back: `**The graph**: nodes s0-s4, with edges such that **every node has degree ≥ 3** from the start (e.g. s0 connects to s1, s2, s3; s2 connects to s0, s1, s4; and so on around a mostly-complete structure) — so **simplify cannot make progress**: there is no node with degree < N=3 to safely remove.

**What simplify does when stuck**: rather than giving up, it picks a node to remove **speculatively** despite its high degree — guided by a **spill-cost heuristic** (related card): prefer removing a node with either the **highest interference degree** (it's the biggest obstacle to colorability for its neighbors) or the **lowest cost of actually spilling it** to memory if coloring ultimately fails for it.

**Continuing**: once one high-degree node is speculatively removed, the remaining graph's degrees drop (each of the removed node's neighbors loses one edge), which may unstick simplify — letting it resume finding genuine degree-<3 nodes and proceed normally from there.

**Select then re-examines the speculative node last** (since it was pushed onto the stack first, popped last, related card): if, once its actual neighbors are colored, a free color remains among the N=3 available, the speculation succeeded and no real spill occurred — coloring can succeed even for a graph that initially looked "stuck," which is exactly why the speculative removal is worth attempting before concluding a spill is truly necessary.`,
    related: ["mit6035-alloc-graph-coloring-algorithm", "mit6035-alloc-spill-cost-heuristic"],
  },
  {
    id: "mit6035-alloc-spill-cost-heuristic",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Explain why an 'ideal' spill cost can't be computed exactly, and state the standard static approximation formula.",
    back: `**Ideal spill cost**: the true **dynamic** runtime cost of the extra load/store instructions a spill would introduce — but this can't be computed exactly at compile time, since it depends on information only known at runtime: which way branches actually resolve, and how many times loops actually execute.

**Static approximation**: since profiling data may not be available, **assume** every loop executes some fixed number of times per nesting level (e.g. 10, or 100) as a stand-in for real trip counts, and compute:

\`spillCost = Σ (over every def site) storeCost × 10^(loop nesting depth) + Σ (over every use site) loadCost × 10^(loop nesting depth)\`

— i.e., **weight each load/store by 10 raised to how deeply nested in loops** that def or use site is, so a spill inside a loop (executed many times) is penalized far more heavily than one outside any loop (executed once), even though neither trip count is actually known exactly.

**Worked example**: consider a web \`x\` with one def and one use, both **outside** any loop, versus a web \`y\` with one def and one use both **inside** a loop (so 9 additional def/use pairs recur across the loop body relative to \`x\`'s single pair, per the slide's specific numbering): spillCost(x) = storeCost + loadCost, but spillCost(y) = 9×storeCost + 9×loadCost — so with only one register available, the algorithm should prefer spilling the **cheaper** one, \`x\`, keeping the loop-heavy \`y\` in a register where its higher access frequency benefits most from avoiding memory traffic.`,
    related: ["mit6035-alloc-graph-coloring-algorithm", "mit6035-alloc-coloring-worked-example"],
  },
  {
    id: "mit6035-alloc-splitting-vs-spilling",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Explain splitting as an alternative to spilling, and trace the worked example where splitting a web z into z1/z2 makes an uncolorable graph colorable.",
    back: `**Spilling** keeps a web as one unit but stores its value to memory between every def and use — paying memory-traffic cost on **every** access. **Splitting** instead breaks one web into **multiple separate webs**, inserting a store/reload only at the specific **split point**, so only the boundary between the resulting pieces pays any memory cost, and other parts of the original web may end up **not interfering** with whatever was crowding the interference graph.

**Worked example**: source pattern \`def z; use z; [loop: def x; def y; use x; use x; use y] use z\` — \`z\` is defined once before a loop, used once **after** the loop, but its live range must span the **entire loop** (since it's live-out of the loop-entry point and live-in to the use after), so it **interferes with both x and y**, which are defined and used entirely inside the loop. With N=3 registers, \`{x, y, z}\` mutually interfering (each pair, since x-y also interfere within the loop body) makes the graph **not 2-colorable**, let alone leaving room if N were smaller.

**Splitting the fix**: split \`z\`'s single web into **z1** (the portion live only from its definition up to loop entry — dead throughout the entire loop body) and **z2** (the portion live only from loop exit to its final use) — inserting a store of z1's value before the loop and a reload into z2 after. Now **neither z1 nor z2 is live during the loop**, so **neither interferes with x or y** — the loop body's interference graph shrinks to just \`{x, y}\`, trivially colorable, while z1/z2 (never live simultaneously with each other or with x/y) can each take any free register.`,
    related: ["mit6035-alloc-webs-and-interference", "mit6035-alloc-splitting-heuristic-cost-benefit"],
  },
  {
    id: "mit6035-alloc-splitting-heuristic-cost-benefit",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the splitting heuristic algorithm and the cost/benefit ratio used to choose which web to split.",
    back: `**Splitting heuristic algorithm**: (1) identify a **program point** where the interference graph is **not R-colorable** (more than N webs simultaneously live there); (2) among the webs live at that point, pick one that is **not used** anywhere within the **largest enclosing basic block** around that point (i.e., a web that's live across a stretch of code without actually being touched there — pure "pass-through" liveness, the same wasted-liveness pattern the z1/z2 example exploited, related card); (3) **split** that web at the corresponding edge (insert the store/reload boundary there); (4) **rebuild** the interference graph with the split webs; (5) **retry** coloring.

**Cost of splitting a given web**: proportional to how many times the split edge is crossed **dynamically** — approximated, just as with spill cost (related card), by the **loop nesting depth** at the split point (a split inside a deep loop is crossed, and pays its store/reload cost, on every one of many iterations).

**Benefit of splitting a given web**: how much it **increases colorability** for the *other* webs it was interfering with — approximated by the split web's **degree** in the interference graph (a high-degree web was blocking many neighbors from being colorable; removing its interference at the split point frees up all of them at once).

**Greedy selection rule**: among candidate webs, pick the one with the **highest benefit-to-cost ratio** to split (equivalently, to speculatively spill in the simplify/select algorithm, related card) — maximizing colorability gained per unit of actual runtime overhead paid.`,
    related: ["mit6035-alloc-splitting-vs-spilling", "mit6035-alloc-spill-cost-heuristic"],
  },
  {
    id: "mit6035-alloc-register-coalescing",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Describe register coalescing and its pros/cons for graph coloring.",
    back: `**The idea**: find register-copy instructions of the form \`s_j = s_i\` (one web's value copied directly into another). If \`s_i\` and \`s_j\`'s webs **do not interfere** (never simultaneously live), **combine them into a single web** — since they never conflict, they can safely share one register, and once merged, the copy instruction itself becomes redundant (a register copied to itself) and can be **deleted entirely**.

**Pros**: conceptually similar to **copy propagation** (a familiar earlier optimization, related to program-analysis material) — directly **reduces instruction count** by eliminating now-unnecessary register-to-register moves, which is pure upside if it doesn't cost anything elsewhere.

**Cons**: merging two webs' node also **merges their interference edges** — the combined node's degree is the **union** of both original webs' neighbors, which can easily push its degree from **below N** (safely colorable) to **at or above N** (no longer guaranteed colorable). A graph that was previously N-colorable can become **not** N-colorable purely as a side effect of coalescing — so coalescing is a genuine trade: fewer instructions **if** it doesn't create new spills, but a real risk of *introducing* spills that wouldn't otherwise have been needed. Real compilers apply it selectively (e.g. only when the combined degree provably stays safe), not unconditionally.`,
    related: ["mit6035-alloc-webs-and-interference", "mit6035-alloc-graph-coloring-algorithm"],
  },
  {
    id: "mit6035-alloc-precoloring-presplitting-interprocedural",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe three further register-allocation optimizations: register targeting (pre-coloring), pre-splitting of webs, and interprocedural register allocation.",
    back: `**Register targeting (pre-coloring)**: some webs are **required** to live in a *specific* physical register at a specific point regardless of general allocation — e.g. the first several function arguments and a function's return value, which the calling convention fixes to particular registers. **Pre-color** those webs (bind them to their required register **before** running the general graph-coloring algorithm), so the allocator treats that assignment as already fixed rather than free to choose — this also **eliminates otherwise-unnecessary copy instructions** that would exist purely to move a value into its conventionally-required register.

**Pre-splitting of webs**: some live ranges span very large **"dead" regions** — stretches of code where the variable is live (not yet reallocated) but genuinely **unused**. Rather than waiting for the simplify/select algorithm to get stuck and only *then* discover a beneficial split (related card), **proactively** break up such live ranges at strategically chosen points **before** allocation even attempts coloring, paying a small guaranteed spill cost in exchange for a graph that's far **easier to color** overall. Good strategic split points: **call sites** (a spill is often needed there anyway, since caller-saved registers must be preserved across the call regardless), and around **large loop nests** (reserving registers specifically for the values used inside the loop, rather than letting outer-scope live ranges crowd them out).

**Interprocedural register allocation**: saving/restoring registers across every procedure call under a **generic, one-size-fits-all calling convention** is wasteful, especially for programs with many small functions where call overhead dominates. Instead, perform register allocation **across function boundaries**, customizing each function's *own* effective calling convention (which registers it actually needs saved, which it doesn't) based on real interprocedural analysis of how it's used — avoiding unnecessary saves/restores the generic convention would otherwise force.`,
    related: ["mit6035-alloc-register-coalescing", "mit6035-alloc-splitting-heuristic-cost-benefit"],
  },

  // --- Lecture 17: Parallelization ---
  {
    id: "mit6035-alloc-amdahls-law-and-issues",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State Amdahl's Law and the two other practical issues (load balancing, granularity) that limit real parallel speedup.",
    back: `**Amdahl's Law**: split total work into a sequential portion \`Ts\` (must run on one processor) and a parallel portion \`Tp\` (can be divided across processors). With \`n\` processors: \`T(n) = Ts + Tp/n\`. As \`n → ∞\`, \`T(∞) → Ts\` — so the **maximum possible speedup** is bounded by \`(Ts + Tp) / Ts\`, no matter how many processors are thrown at the problem: the sequential portion alone sets a hard ceiling, since it can never be sped up by adding more processors.

**Load balancing**: even with a large parallel portion, speedup suffers if work isn't **evenly distributed** — if some processors finish early and sit idle while others are still working, the wall-clock time is determined by the **slowest** processor, wasting the idle processors' potential.

**Granularity**: the size of the parallel regions **between synchronization points**, or equivalently the ratio of useful computation to communication/synchronization overhead. Very fine-grained parallelism (many small parallel regions with frequent synchronization) can be dominated by overhead rather than actual work, sometimes making parallel execution **slower** than sequential — a concern that directly motivates preferring **outer-loop** over **inner-loop** parallelism when both are legal (related card).`,
    related: ["mit6035-alloc-execution-models", "mit6035-alloc-loop-transformations-for-parallelism"],
  },
  {
    id: "mit6035-alloc-execution-models",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare FORALL vs. FORACROSS parallel loop annotations, and contrast the block-distribution, fork, and SPMD/thread-pool code-generation models.",
    back: `**FORALL**: a loop with **no loop-carried dependences** — every iteration is fully independent and may run in any order or simultaneously, with no cross-iteration synchronization needed at all.

**FORACROSS**: a loop with **some loop-carried dependences** — iterations are not fully independent (later iterations depend on results from earlier ones), so *some* synchronization between iterations is required even though useful parallelism may still exist alongside the dependence.

**Code-generation models for a FORALL/FORPAR loop**, all computing the same block-distributed iteration range \`Iters = ceiling(N/NUMPROC)\` per processor:
- **Block distribution (explicit loop nest)**: wrap the original loop in an outer loop over processor id \`P\`, each processor computing its own contiguous \`[P*Iters, (P+1)*Iters)\` slice — conceptually simplest, but written as if generating separate sequential code per processor.
- **Fork (spawn a function per processor)**: extract the loop body into a standalone function taking the processor id as a parameter, and \`ParallelExecute\` it once per processor — but any local variables used/defined inside the original loop body are **no longer visible** across the function-call boundary, so they must either become **global** or be explicitly **passed and returned** as arguments, adding real function-call overhead.
- **SPMD (Single Program, Multiple Data) / thread pool**: every processor runs the **same compiled code** simultaneously, using its own id (\`myPid\`) to compute its slice inline, coordinated by explicit \`Barrier()\` calls before/after the parallel region. A **thread pool** amortizes the cost of setting this up: create all \`NUMPROC\` OS threads once at program start (thread creation itself has real overhead: allocating a stack, involving the OS), keep \`N-1\` of them idling on a barrier during sequential sections, and have them execute the shared function body and return to the barrier for each parallel region — avoiding repeated thread creation/teardown per parallel loop.`,
    related: ["mit6035-alloc-amdahls-law-and-issues", "mit6035-alloc-dependence-types-and-distance-vectors"],
  },
  {
    id: "mit6035-alloc-dependence-types-and-distance-vectors",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a loop's distance vector, and give the interpretation of dv=[0], dv=[1], dv=[2], and dv=[*] for a single loop.",
    back: `**Setup**: the same three dependency types from instruction scheduling (true/RAW, anti/WAR, output/WAW; related cards from Module 4) apply here, but now the two conflicting accesses may occur on **different loop iterations** rather than adjacent instructions — this is a **loop-carried dependence**.

**Distance vector**: a loop has distance \`d\` if there is a data dependence from iteration \`i\` to iteration \`j\` (i.e. \`i\` writes/reads something \`j\` later reads/writes the same location) with \`d = j - i\`.

**Single-loop examples**, all over \`FOR I = 0 to 5\`:
- \`dv = [0]\`: \`A[I] = A[I] + 1\` — every access stays within the **same** iteration (\`I\` reads and writes the same index), no cross-iteration dependence at all.
- \`dv = [1]\`: \`A[I+1] = A[I] + 1\` — each iteration's write is read by the **next** iteration (distance exactly 1), a classic sequential recurrence.
- \`dv = [2]\`: \`A[I] = A[I+2] + 1\` — each iteration reads a location written **two** iterations later (in program order, since the write to \`A[I+2]\` happens when the loop variable equals \`I+2\`, a later iteration than the read at \`I\`), giving distance 2.
- \`dv = [*]\`: \`A[I] = A[0] + 1\` — every iteration reads the **same fixed** location \`A[0]\`, which was itself written on iteration 0 — the dependence distance varies with \`I\` itself (1, 2, 3, ...), so no single fixed distance describes it; \`*\` denotes this "any/unknown distance" case.`,
    related: ["mit6035-alloc-distance-vector-parallelizability-test", "mit6035-sched-dependence-types"],
  },
  {
    id: "mit6035-alloc-distance-vector-parallelizability-test",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the distance-vector parallelizability test for the i-th loop of a nest, and apply it to two 2D examples.",
    back: `**The test**: the **i-th** loop of a nest is safely parallelizable with respect to a given dependence \`d = [d_1, ..., d_i, ..., d_n]\` if **either**: some earlier component \`d_1, ..., d_{i-1}\` is **> 0** (the dependence is already "resolved" by an outer loop's sequential ordering before loop \`i\` is even reached, so loop \`i\` itself can run in any order), **or** **every** component \`d_1, ..., d_i\` **= 0** (the dependence carries no ordering constraint through loop \`i\` at all — it's entirely confined within a single iteration of every loop from the outermost down through \`i\`).

**A single loop is parallelizable overall** exactly when **every** dependence in the loop has \`dv = [0]\` — any nonzero single-component distance (\`[1]\`, \`[2]\`, \`[*]\`) makes it non-parallelizable, since with only one loop there's no earlier component that could ever be positive.

**2D examples** (loops indexed \`I\` outer, \`J\` inner): \`A[I,J] = A[I,J-1]+1\` has \`dv=[0,1]\` — the outer \`I\` loop **is** parallelizable (first component 0, but that's the loop *being tested*; per the rule, since \`d_1=0\` and we're asking about loop 1, need all \`d_1..d_1=0\`, which holds — parallel), while the inner \`J\` loop is **not** (need either \`d_1>0\`, false, or all \`d_1,d_2=0\`, false since \`d_2=1\` — sequential). Conversely \`A[I,J] = A[I+1,J]+1\` has \`dv=[1,0]\`: the outer \`I\` loop is **not** parallelizable (\`d_1=1≠0\` and there's no earlier component to be positive), but the inner \`J\` loop **is** (\`d_1=1>0\`, an earlier component is positive, so loop 2 is free).`,
    related: ["mit6035-alloc-dependence-types-and-distance-vectors", "mit6035-alloc-integer-programming-dependence-test"],
  },
  {
    id: "mit6035-alloc-integer-programming-dependence-test",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe how exact array dependence testing is formulated as an integer programming problem over the iteration space.",
    back: `**Iteration space**: an \`n\`-deep affine loop nest corresponds to an \`n\`-dimensional discrete Cartesian space, with **loop bounds and array-index expressions** required to be **integer linear (affine) functions** of constants, loop-invariant variables, and enclosing-loop indices — exactly the structural restriction that makes the dependence question decidable via linear methods at all.

**The question, precisely**: for two array accesses (potentially the same statement on two different iterations), does there exist a pair of **distinct** integer iteration vectors \`i_w\` (the write) and \`i_r\` (the read) — both satisfying the loop bounds — such that the two accesses' affine index expressions evaluate to the **same** memory location?

**Formulation**: express the loop bounds and the "same location" equality as a system of **linear inequalities** \`Â·ī ≤ b̄\`, where \`Â\` is an integer matrix and \`b̄\` an integer vector — a dependence exists **iff** an integer solution exists (an **integer programming feasibility** problem). A complication: **strict inequality** (\`i_w ≠ i_r\`, or one strictly less than the other) is not itself affine, so the check is **split into two separate problems** — one assuming \`i_w < i_r\`, one assuming \`i_r < i_w\` — and a dependence exists if **either** subproblem is feasible.

**Generalization to an \`n\`-deep nest**: the same idea extends to \`2n\` subproblems, one for each possible "first point of divergence" between the two iteration vectors (\`i_1=j_1, ..., i_{k-1}=j_{k-1}, i_k < j_k\` for each \`k\`, and symmetrically \`j_k < i_k\`) — solving all of them (each itself now a fully affine feasibility problem) determines the complete dependence relation exactly, in contrast to the coarser distance-vector approximation (related card), at the cost of genuinely solving integer programming problems.`,
    related: ["mit6035-alloc-distance-vector-parallelizability-test", "mit6035-alloc-privatization"],
  },
  {
    id: "mit6035-alloc-privatization",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe scalar privatization, array privatization, and reduction recognition as ways to remove spurious loop-carried dependences.",
    back: `**Scalar privatization**: a scalar temporary written and then immediately read within the **same** iteration (\`X = A[i]*3; B[i] = X;\`), reused across iterations, creates loop-carried **anti-** and **output-** dependences on \`X\` purely from storage reuse — no genuine cross-iteration dataflow exists. Fix: give each iteration (or each processor) its **own private copy** of \`X\` — either a genuinely local variable re-declared inside the loop body, or (for cross-processor code generation) an array \`Xtmp\` indexed by iteration/processor, eliminating the false dependence entirely. If \`X\`'s value is needed **after** the loop, add an explicit final assignment (\`if (i==n) X = Xtmp\`) to preserve that one required value.

**Array privatization**: the same idea applied to an **array** rather than a scalar — structurally similar, but the analysis is harder: **array data dependence analysis** (does iteration pair access the same location) is not enough by itself; **array data-flow analysis** (do they access the same *value*, i.e. is a write between them) is needed to determine whether privatizing is actually safe.

**Reduction recognition**: a loop-carried **true** dependence like \`X = X + A[i]\` looks sequential, but if the operation is **associative** and the accumulated result is **never read within the loop** (only after), it's a **reduction**, not a genuine sequential chain — associativity means the summation order doesn't affect the final result. Transform: give each processor a **private partial accumulator** (\`Xtmp[myPid]\`), accumulate independently within each processor's slice, then **combine** all partial results in a final sequential (or tree-structured) step after a barrier — turning an apparently-sequential dependence into one that's almost entirely parallel.`,
    related: ["mit6035-alloc-integer-programming-dependence-test", "mit6035-alloc-loop-transformations-for-parallelism"],
  },
  {
    id: "mit6035-alloc-loop-transformations-for-parallelism",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe unimodular loop transformations (interchange, skew) and their legality condition, and explain the outer-loop-parallelism granularity fix.",
    back: `**The problem**: a loop nest may have **no** parallelizable loop as originally written, even though real parallelism is latent in it — a **transformation** of the iteration space can sometimes expose it.

**Unimodular transformations**: represent a change of iteration-space coordinates as a matrix \`A\` applied to the index vector, \`ī_new = A·ī_old\` — **interchange** swaps two loop indices (\`A\` = the swap permutation matrix), **skew** shifts one index by a multiple of another (e.g. \`i_new = i_old + j_old\`, useful for turning a diagonal dependence pattern into one aligned with a loop axis so an inner \`FORPAR\` loop with dynamically shifting bounds becomes legal).

**Legality condition**: a unimodular transformation with matrix \`A\` is valid **iff**, for **every** dependence vector \`v\` in the original loop, the **first nonzero entry** of \`A·v\` is **positive** — i.e. the transformation must not reorder any dependence's source before its sink. (Concretely: **reversing** an axis with an existing forward-only dependence is illegal, since it would flip that dependence's sign to negative; **interchange** and **skew** can each be legal or illegal depending on the specific dependence vectors present, so the check must be run per-transformation per-loop-nest.)

**Granularity — outer- vs. inner-loop parallelism**: parallelizing an **inner** loop means paying **barrier/synchronization overhead on every outer-loop iteration**, which can dominate if the inner loop's per-iteration work is small — sometimes making the "parallel" version **slower** than sequential. Fix: apply **loop transpose/interchange** so the parallelizable dimension becomes the **outer** loop instead, paying synchronization overhead only **once** per whole computation rather than once per outer iteration — directly trading the same underlying parallelism for far less overhead.

**Interprocedural parallelization**: function calls inside a loop body block automatic parallelization the same way they block automatic register allocation (related card) — real interprocedural dependence analysis, or **inlining** the callee (works with existing intraprocedural analysis, but at the cost of potentially large code bloat), are the two standard fixes.`,
    related: ["mit6035-alloc-privatization", "mit6035-alloc-amdahls-law-and-issues"],
  },

  // --- Lecture 18: Memory optimization ---
  {
    id: "mit6035-alloc-hierarchy-and-miss-types",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the memory hierarchy's latency/size tradeoff, and define the five categories of cache miss.",
    back: `**Memory hierarchy**: each level trades **capacity for latency** — registers (~1-2ns, hundreds of bytes) → L1 private cache (~3-10ns, tens of KB) → shared L2/L3 (~8-30ns, several MB) → main memory/DRAM (~60-250ns, GBs) → permanent storage (~milliseconds, TBs) — a gap of **orders of magnitude** between the fastest and slowest levels that has only **widened** over time (historically, processor speed improved roughly 60%/year vs. DRAM's roughly 9%/year — the "processor-memory gap").

**Cache miss taxonomy**:
- **Cold miss**: the very **first** access to a given piece of data — unavoidable, since nothing could have cached it before its first use.
- **Capacity miss**: data was evicted between two accesses because so much **other** data (more than the cache can hold) was accessed in between.
- **Conflict miss**: data was evicted because a **later access mapped to the same cache line** (due to limited associativity), even though the cache as a whole had room — a structural artifact of the cache's indexing scheme, not of true working-set size.
- **True sharing miss** (multicore only): another processor accessed the **same** data between this processor's two accesses to it, forcing a re-fetch.
- **False sharing miss** (multicore only): another processor accessed **different** data that happens to sit in the **same cache line**, forcing an invalidation/re-fetch even though the actual data this processor cares about was never touched.`,
    related: ["mit6035-alloc-loop-transformations-tiling", "mit6035-alloc-false-sharing-and-conflict-misses"],
  },
  {
    id: "mit6035-alloc-loop-transformations-tiling",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define reuse distance, and trace how loop interchange and loop tiling reduce it in a matrix-multiply-style triple loop.",
    back: `**Reuse distance**: for a given data access, the number of **other** distinct data items accessed before that same item is accessed again. If reuse distance **exceeds the cache's capacity**, the data is guaranteed to be evicted (a capacity miss, related card) before its reuse — so **reducing reuse distance below cache size** is the general goal of loop-level locality optimization.

**Interchange for spatial locality**: \`for i: for j: for k: ... A[k,j] ...\` accesses \`A\` with reuse distance \`N²\` in the innermost \`k\`, since \`j\` (which \`A\`'s access doesn't depend on for its row) varies slowly — the same column of \`A\` is revisited only after a full \`N×N\` sweep. **Interchanging** to put the loop that matches \`A\`'s access pattern innermost reduces the reuse distance, and further interchange (matching cache-line-sized access granularity, reuse distance becomes \`L·N\` for cache line size \`L\`) can improve it further — but for **three** arrays each indexed by a different subset of the loop indices in a triple-nested loop, **no single loop ordering** can make every array's access pattern favorable simultaneously (at least one array's accesses must still traverse the full array multiple times, regardless of interchange order).

**Loop tiling (blocking)**: reorganize the iteration space into small rectangular **tiles**, iterating fully within one tile before moving to the next: \`for ii: for jj: for i=b*ii to ...: for j = b*jj to ...\` — this bounds the reuse distance to roughly the **tile's own working set**, small enough to fit in cache, rather than the whole array. Concretely, for 1024×1024 matrix multiply: computing the full result with the naive triple loop touches **1,050,624** total data elements across the computation (dominated by repeatedly re-reading the second matrix in full for every output row), while tiling with a modest block size reduces this to **66,560** — over an order of magnitude fewer cache-relevant accesses for the identical mathematical result.`,
    related: ["mit6035-alloc-hierarchy-and-miss-types", "mit6035-alloc-data-transformations"],
  },
  {
    id: "mit6035-alloc-data-transformations",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe strip-mining and permutation as the two primitives behind data transformations, and how they combine to implement block/cyclic data decomposition.",
    back: `**Data transformations, generally**: analogous to loop transformations (related card), but transforming the **layout of data in memory** rather than the order iterations execute — since data layout is a **global** property referenced from every point in the program that touches it, a data transformation requires **whole-program analysis** to update every access consistently, unlike a loop transformation's more local scope.

**Strip-mining**: splits one array dimension into **two** — with block size \`b\`, a dimension of size \`N\` becomes two dimensions of size \`b\` and \`⌈N/b⌉\`; a flat index \`i\` becomes the pair \`(i mod b, i/b)\` (or the reverse order, depending on which "strip" position is intended). This is purely a **reindexing**, changing neither the total data nor which values are stored — just how the same linear array is conceptually diced into blocks.

**Permutation**: **reorders** which dimension varies fastest in memory (e.g. swapping a row-major layout to column-major, via a permutation matrix like \`[[0,1],[1,0]]\`) — changing the **physical memory layout** so that accesses which were previously far apart in memory (poor spatial locality) become adjacent, or vice versa.

**Combining them for decomposition**: to give each of \`P\` processors a **contiguous** private region of a shared array (**block decomposition**) or an **interleaved** one (**cyclic decomposition**), first **strip-mine** the relevant dimension by the appropriate block size (or by \`P\` itself, for cyclic), then **permute** the resulting dimensions so the "which processor owns this" dimension sits outermost in memory — the general **data transformation algorithm**: rearrange data so each processor's portion is contiguous, by applying strip-mining and permutation to each array dimension according to its chosen decomposition (\`*\`, block, cyclic, or block-cyclic).`,
    related: ["mit6035-alloc-loop-transformations-tiling", "mit6035-alloc-false-sharing-and-conflict-misses"],
  },
  {
    id: "mit6035-alloc-false-sharing-and-conflict-misses",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain how false-sharing and conflict misses arise from a parallel loop's data layout, and how a data transformation eliminates them.",
    back: `**The setup**: \`for J: forall I: X(I,J) = ...\` — a parallel loop where different processors, working on different values of \`I\` at the **same** \`J\`, write to **adjacent** memory locations \`X(I,J)\` (since array \`X\` is laid out with \`I\` varying fastest, adjacent-\`I\` elements land in the **same cache line**).

**False sharing**: multiple **different** processors' writes to *different* elements of \`X\` fall in the **same** cache line — even though no processor is touching another's actual data, the cache-coherence protocol still treats the whole line as invalidated/re-fetched on each write from a different core, producing misses that have nothing to do with genuine data conflicts (related card, cache miss taxonomy).

**Conflict misses compound it**: as the parallel loop repeatedly cycles back to the same array region across iterations of the outer \`J\` loop, cache-line-granularity thrashing between cache and memory recurs on **every** outer iteration, not just once.

**The fix — a data transformation**: reorganize \`X\`'s memory layout (via strip-mining and permutation, related card) so that each processor's **entire** slice of the \`I\` dimension is stored **contiguously** in memory, with different processors' slices landing in **entirely separate** cache lines rather than interleaved within shared ones. Once each processor's data occupies its own cache lines, writes from different processors no longer share a line at all — eliminating both the false-sharing invalidations and the associated conflict misses, since each processor's contiguous region simply doesn't compete for the same cache slots as another's.`,
    related: ["mit6035-alloc-hierarchy-and-miss-types", "mit6035-alloc-data-transformations"],
  },
  {
    id: "mit6035-alloc-prefetching",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain the motivation for prefetching, its four main risks, and contrast compiler-inserted prefetching with runahead (helper) threads.",
    back: `**Motivation**: a cache miss stalls the processor for **hundreds of cycles** waiting on main memory — if the data address is known **before** it's actually needed, issuing a fetch early lets that latency overlap with other useful work, so the data is already resident by the time it's really accessed.

**Four risks, each with a standard mitigation**:
- **Bandwidth contention**: prefetches compete with demand fetches for limited memory bandwidth. Mitigation: hardware issues prefetches only when bandwidth is otherwise **unused**.
- **Premature eviction**: prefetching too early can evict data that's still needed before the prefetched data itself is used. Mitigation: don't prefetch **too early** — time it close to actual need.
- **Still-pending on access**: prefetching too late means the fetch hasn't completed by the time the data is actually accessed, providing no benefit. Mitigation: don't prefetch **too late** either — there's a real timing window to hit.
- **Wasted prefetch**: prefetched data that's **never actually used** wastes bandwidth and cache space for nothing. Mitigation: only prefetch data **guaranteed to be used**, and only when the access is predicted to actually **miss** (prefetching data already in cache is pure waste too).

**Compiler-inserted prefetching**: use reuse-distance analysis (related card) to statically identify which accesses will likely miss, then insert explicit prefetch instructions ahead of those accesses in the generated code.

**Runahead (helper) threads**: spawn a separate thread that runs **ahead** of the main computation thread, performing only the **control-flow and address-calculation** work needed to know what will be accessed (skipping the actual heavyweight computation) — its sole job is to issue the resulting prefetches early, letting the main thread catch up to already-warmed cache lines.`,
    related: ["mit6035-alloc-loop-transformations-tiling", "mit6035-alloc-alias-analysis-points-to"],
  },
  {
    id: "mit6035-alloc-alias-analysis-points-to",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain why aliases block local optimization reasoning, define a points-to graph and its soundness condition, and contrast context and flow sensitivity.",
    back: `**Why aliases are a problem**: two pointers are **aliases** if they point to the **same** location — e.g. \`Y=&Z; X=Y; *X=3;\` also changes \`*Y\`, since \`X\` and \`Y\` alias \`Z\`. Simple, purely **local** transformations (the kind seen throughout this course — dead code elimination, privatization, dependence testing, all of it) implicitly assume that writing to one name can't silently change the value read through some *other* name — aliasing breaks that assumption, forcing **global, whole-program reasoning** wherever pointers are involved, and the problem is strictly **worse** for multithreaded programs (where aliasing can additionally arise across threads sharing memory).

**Points-to graph**: nodes are program **names**; an edge \`(x, y)\` means "\`x\` may point to \`y\`." Since real programs can have **unboundedly many** heap cells (e.g. inside a loop allocating fresh memory each iteration) but the analysis must use a **finite** set of names, each name necessarily **summarizes many actual heap cells** at once — a deliberate, necessary approximation. **Soundness condition**: if \`*x = y\` genuinely holds in **any** reachable program state of **any** possible execution, then \`(x, y)\` **must** be an edge in the computed points-to graph — the analysis may **over-approximate** (report a possible alias that never actually occurs) but must **never under-approximate** (miss a real one), since a missed alias could silently invalidate a transformation that assumed no aliasing existed.

**Context sensitivity**: analyze a function **separately for each distinct calling context** (distinguishing "different" inputs and reusing prior results only when a call's inputs are recognized as the *same* as a previously-analyzed one) rather than merging all call sites into one conflated summary — more precise, at higher analysis cost.

**Flow sensitivity**: a **flow-insensitive** analysis would give the *same* result under any permutation of the program's statements (it ignores execution order entirely); a **flow-sensitive** analysis tracks how points-to information changes **statement by statement**, following the same forward-propagation structure as ordinary dataflow analysis (related to Module 3's dataflow material) — again, more precise, at higher cost.`,
    related: ["mit6035-alloc-prefetching", "mit6035-alloc-integer-programming-dependence-test"],
  },
];
