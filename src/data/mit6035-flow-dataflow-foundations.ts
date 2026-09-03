// MIT 6.035 (Spring 2010) — Lectures 9-12: program analysis fundamentals
// (basic-block/CFG construction, value-numbering-based local CSE, local
// copy propagation and dead code elimination, algebraic simplification),
// the three classical dataflow analyses (reaching definitions, available
// expressions, liveness) and the general forward/backward dataflow
// framework (GEN/KILL, dataflow equations, the worklist fixed-point
// algorithm, optimistic vs. pessimistic analyses), and the formal
// mathematical foundations of dataflow analysis (lattices, partial orders,
// transfer functions, monotonicity vs. distributivity, Meet-Over-Paths as
// the ideal solution vs. the worklist algorithm's Maximum-Fixed-Point
// solution, and abstraction-function soundness proofs). This is the
// theoretical core of the course's optimization material. See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6035-flow";

export const mit6035FlowDataflowFoundationsCards: Card[] = [
  // --- Lecture 9: Program analysis fundamentals ---
  {
    id: "mit6035-flow-cfg-construction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the basic-block/CFG construction algorithm, and define split points and join points.",
    back: `**Program analysis and transformation, framed generally**: analysis determines properties true at various program points; transformation uses those properties to produce faster/smaller/otherwise-improved code while preserving meaning — this pairing (analyze, then transform using what was learned) is the organizing pattern for essentially everything in this module.

**Basic block construction**: start with individual instructions as one-instruction "blocks," each an initial CFG node, wired together by control-flow edges. **Merge** any node into its predecessor whenever the predecessor has **exactly one successor** and the successor has **exactly one predecessor** — repeat until no more merges apply. The result: each surviving node is a **basic block** — a maximal straight-line instruction sequence with control entering only at the top and leaving only at the bottom, exactly the granularity later dataflow analysis operates over (related cards).

**Program points**: one point **before** each node, one point **after** each node. A **join point** is a program point with **multiple predecessors** (where two or more control-flow paths merge — e.g. after an \`if\`/\`else\`, or a loop's re-entry point). A **split point** is a program point with **multiple successors** (where control forks — e.g. a conditional branch). These two point-kinds are exactly where dataflow analysis's "combine information from multiple paths" and "the same information feeds multiple continuations" logic, respectively, has to do real work (related cards).`,
    related: ["mit6035-flow-value-numbering-cse", "mit6035-flow-reaching-definitions"],
  },
  {
    id: "mit6035-flow-value-numbering-cse",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the value-numbering algorithm for local common-subexpression elimination, and explain why it correctly handles variable overwrites and different variable names holding the same value.",
    back: `**The idea**: track, via **symbolic execution** within a basic block, not just what each *variable* currently holds, but what abstract **value** each variable and each computed expression currently represents — using **fresh, purely symbolic value tokens** (not concrete numbers) to represent "the result of this specific computation," so that two syntactically different expressions computing the *same underlying value* can be recognized as equal even without knowing what that value numerically is.

**Maps maintained**: **var2val** (current symbolic value of each variable); **exp2val** (symbolic value already assigned to a given expression, if that expression has already been computed); **exp2tmp** (which temporary variable currently holds a given expression's value, so a later recomputation can be replaced by a reference to that temp).

**Algorithm, per statement \`x = e\`**: look up (or assign, if new) a symbolic value for \`e\` in **exp2val**; if \`e\`'s value was already computed by some earlier temp (found in **exp2tmp**), **rewrite** the current statement to just copy that temp instead of recomputing \`e\`; otherwise, record the new temp in **exp2tmp**; update **var2val[x]** to the (possibly newly assigned) symbolic value.

**Why this is robust even when \`x\`'s underlying variable gets overwritten later, or a different variable ends up holding the same value**: because the algorithm keys everything off **symbolic values**, not variable *names* — if \`y = x\` later, and then \`x\` is reassigned, \`y\` still correctly maps to the *original* symbolic value \`x\` held at the time of the copy, not whatever \`x\` currently holds; and if two *different* variables independently come to hold the *same* symbolic value (e.g. via two separate but value-equal computations), the exp2val/exp2tmp maps still correctly recognize the shared value and allow CSE between them, entirely independent of which variable names happen to be involved — precisely the property a naive "track expressions by their variable-name syntax" approach would miss.`,
    related: ["mit6035-flow-cfg-construction", "mit6035-flow-copy-propagation-local"],
  },
  {
    id: "mit6035-flow-copy-propagation-local",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the local copy-propagation algorithm (tmp2var/var2set maps) as a forward pass within a basic block.",
    back: `**Forward propagation within a basic block**, using two maps: **tmp2var** — tells which ordinary variable to substitute in place of a given temporary variable; **var2set** — the inverse of tmp2var, tracking which temporaries currently map (via tmp2var) to a given variable, specifically so that a **reassignment** of that variable can correctly invalidate every temp that was pointing at its *old* value.

**Algorithm, for each statement**: (1) if any **temp** variable appearing on the right-hand side is present in **tmp2var**, **replace it** with the variable tmp2var says it should be treated as a copy of. (2) if the statement's **left-hand-side variable** is present in **var2set** (i.e., some temps currently believe they're aliases for this variable's *old* value), **remove** all of those temps from **tmp2var** — the reassignment has invalidated that copy relationship, and continuing to substitute the old variable in their place would now be incorrect.

**Why this needs to be a genuinely two-map bookkeeping scheme, not just one**: **tmp2var** alone answers "what should I substitute right now," but has no efficient way to find "which temps need to be invalidated" when a variable gets reassigned — **var2set** exists purely to make that invalidation step efficient, by inverting the relationship so a reassignment's invalidation work is a direct lookup rather than a scan over every currently-tracked temp.`,
    related: ["mit6035-flow-value-numbering-cse", "mit6035-flow-dead-code-elimination-local"],
  },
  {
    id: "mit6035-flow-dead-code-elimination-local",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the local dead-code-elimination algorithm as a backward pass using a 'needed' set.",
    back: `**Backward propagation within a basic block**: maintain a single **set** of variables known to be **needed later** in the computation (i.e., some subsequent statement will read them).

**Algorithm, scanning the block's statements in reverse, for each statement encountered**: if the statement's **left-hand-side variable is *not* in the needed set**, the statement's result is never used — **remove the statement entirely**. **Otherwise**, the statement's result *is* needed, so **add every variable appearing on its right-hand side** to the needed set (those are now, themselves, needed by *this* statement, which is being kept) — before continuing the backward scan.

**Why backward, specifically**: "needed later" is inherently a **backward**-looking property (whether something matters depends on what happens *after* it, not before) — scanning in reverse lets the algorithm accumulate exactly the right "what's needed from this point backward" set incrementally, one statement at a time, mirroring the general pattern that backward dataflow problems (liveness, related card) are solved by propagating information against the flow of control.`,
    related: ["mit6035-flow-copy-propagation-local", "mit6035-flow-algebraic-simplification"],
  },
  {
    id: "mit6035-flow-algebraic-simplification",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe algebraic simplification (identities, strength reduction, canonical reordering), and explain the numerical-stability caveat about why (a/b)*0+c cannot always be simplified to c.",
    back: `**Algebraic identities**: rewrite expressions using known-always-true algebraic laws, regardless of whether operands are literal constants — \`x + 0 → x\`, \`x * 1 → x\`, \`x * 0 → 0\`, and similar identities for boolean operators.

**Strength reduction**: replace an expensive operation with a cheaper one that computes the same result — the classic example is replacing multiplication by a power of two with a bit-shift.

**Canonical form via reordering**: for **commutative and associative** operators, reorder operands into a fixed, canonical arrangement (e.g. always putting the literal-constant operand on a specific side) — this doesn't simplify the expression's *value* by itself, but it makes **subsequent** passes (constant folding, CSE, related cards) far more likely to actually recognize and exploit matching sub-patterns, since two expressions that are mathematically equivalent but were written in different operand orders now look syntactically identical.

**The numerical-stability caveat — why \`(a/b)*0 + c\` is *not* always safely simplifiable to \`c\`**: the naive algebraic identity \`x*0 = 0\` would suggest the whole \`(a/b)*0\` term vanishes, collapsing the expression to \`c\`. But if \`b\` happens to be **zero**, \`a/b\` itself raises a **division-by-zero exception** at runtime — an exception the *original*, unsimplified expression would genuinely have raised, but that the "simplified" \`c\` would silently **never raise at all**. **The general lesson**: algebraic simplification must respect a program's actual **exception/error semantics**, not merely its arithmetic value — a transformation that's mathematically valid for the *numeric* result can still be an invalid *program* transformation if it silently eliminates a side effect (here, a possible runtime exception) the original code was specified to produce.`,
    pitfall:
      "Not every mathematically-true algebraic identity is safe to apply as a compiler transformation — x*0=0 is true for all numeric x, but (a/b)*0 can raise a division-by-zero exception before the multiplication by zero ever happens, and eliminating that possible exception changes the program's observable behavior, not just its arithmetic. Always check whether a 'simplification' preserves every side effect the original expression could produce, not just its numeric result.",
    related: ["mit6035-flow-dead-code-elimination-local", "mit6035-flow-reaching-definitions"],
  },

  // --- Lecture 10: Introduction to dataflow analysis ---
  {
    id: "mit6035-flow-reaching-definitions",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define reaching definitions ('may' semantics), formalize it via GEN/KILL/IN/OUT and dataflow equations, and state the worklist algorithm.",
    back: `**Definition and use**: \`a = x + y\` is a **definition** of \`a\`, and a **use** of \`x\` and \`y\`. **A definition reaches a use** if the value it writes **may** be read by that use — i.e., there exists *some* execution path from the definition to the use along which no *other* definition of the same variable intervenes.

**GEN/KILL/IN/OUT, per basic block \`b\`**: **IN[b]** — definitions reaching the *start* of \`b\`. **OUT[b]** — definitions reaching the *end* of \`b\`. **GEN[b]** — definitions *created* within \`b\`. **KILL[b]** — definitions of the *same variables* GEN[b] defines, from *anywhere else* in the program (since a new definition of \`x\` within \`b\` kills every other definition of \`x\` that might otherwise still be considered "reaching" past this point).

**Dataflow equations**: $\\text{IN}[b] = \\bigcup_{p \\,\\in\\, \\text{pred}(b)} \\text{OUT}[p]$ (a definition reaches the start of \`b\` if it reaches the end of **any** predecessor — union, since this is a "may" analysis); $\\text{OUT}[b] = \\text{GEN}[b] \\cup (\\text{IN}[b] - \\text{KILL}[b])$ (whatever \`b\` itself generates, plus whatever reached its start and wasn't killed within it); $\\text{IN}[\\text{entry}] = \\emptyset$.

**Worklist algorithm**: initialize every $\\text{OUT}[n] = \\emptyset$; set $\\text{IN}[\\text{entry}]=\\emptyset$, $\\text{OUT}[\\text{entry}]=\\text{GEN}[\\text{entry}]$; put every other node on a **worklist**. While the worklist is non-empty: remove a node $n$; recompute $\\text{IN}[n]$ as the union of its predecessors' current $\\text{OUT}$; recompute $\\text{OUT}[n]$ via the equation above; if $\\text{OUT}[n]$ **changed**, add $n$'s **successors** back onto the worklist (their own $\\text{IN}$ may now need updating too). Repeat until the worklist empties — a **fixed point** has been reached.`,
    related: ["mit6035-flow-cfg-construction", "mit6035-flow-splitting-and-merge-loss"],
  },
  {
    id: "mit6035-flow-splitting-and-merge-loss",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Explain how basic-block splitting can recover analysis precision that gets lost at a merge (join) point.",
    back: `**The precision-loss problem at a merge**: after a conditional assigns \`b = 1\` on one branch and \`b = 2\` on the other, a join point immediately after necessarily sees **both** definitions of \`b\` as reaching (the union confluence, related card, has no way to distinguish "which branch we actually came from") — even though, on **any single actual execution**, only *one* of the two definitions genuinely reached that point. Anything analyzed *after* the join (e.g. whether a later use of \`b\` is provably a specific constant) is stuck with this blurred, merged information.

**Splitting as the fix**: **duplicate** the code that comes after the merge point, once **per incoming branch**, so each duplicate is analyzed **separately**, still "remembering" which branch it came from — the merge is effectively pushed **later**, past the point where the duplicated code needed the finer-grained information. Concretely: instead of one shared copy of \`s = s + a*b; i = i+1;\` reached from both the \`b=1\` and \`b=2\` branches, create **two** copies of that code, one reachable only from each branch — now each copy's own analysis correctly sees \`b\` as the specific constant from *its* branch, rather than the merged, imprecise union.

**The tradeoff**: splitting genuinely **recovers precision that a naive single-copy analysis would lose at the join** — but it does so by **duplicating code**, potentially many times over if a function has many branch-then-merge structures in sequence, trading code size (and, transitively, compile time and possibly instruction-cache pressure) for analysis precision. This is a real, practical technique real optimizing compilers use selectively (not universally, given the size cost), not merely a theoretical curiosity.`,
    related: ["mit6035-flow-reaching-definitions", "mit6035-flow-available-expressions-and-global-cse"],
  },
  {
    id: "mit6035-flow-available-expressions-and-global-cse",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define available expressions ('must' semantics), contrast its ANY-vs-ALL confluence with reaching definitions, and walk through the worked global-CSE transform.",
    back: `**Definition**: expression \`x+y\` is **available** at program point $p$ if **every** path from the entry to $p$ evaluates \`x+y\`, **and** no intervening assignment to \`x\` or \`y\` occurs on that path after the evaluation and before $p$ — a genuinely stronger ("must") requirement than reaching definitions' ("may") requirement.

**The "big difference" from reaching definitions**: a definition reaches a block if it comes from **ANY** predecessor (union confluence) — but an expression is available at a block only if it's available from **ALL** predecessors (**intersection** confluence). Concretely: $\\text{IN}[b] = \\bigcap_{p\\,\\in\\,\\text{pred}(b)} \\text{OUT}[p]$; $\\text{OUT}[b] = \\text{GEN}[b] \\cup (\\text{IN}[b] - \\text{KILL}[b])$ — same GEN/KILL structure as reaching definitions (related card), but the *confluence operator itself flips* from union to intersection, and correspondingly $\\text{OUT}[b]$ must be **initialized to the universal set** $E$ (all expressions), not $\\emptyset$, since intersecting anything with an initially-empty guess would incorrectly force every expression to start out unavailable everywhere.

**Use — global (cross-basic-block) common subexpression elimination**: if an expression is available at a use, there's **no need to recompute it** — a prior computation is guaranteed, along every path, to have already produced the same value. **Worked transform**: given \`a = b+c\` (also computing \`f = a+c\` later reusing the same subexpression) followed by a diamond with \`g = a+c\` on one branch and \`b = a+d; h = c+f\` on the other, converging at \`j = a+b+c+d\` — since \`f = a+c\` is available at the merge (both branches either compute it directly or inherit it), the merge point's \`a+c\` sub-term can be replaced by a reference to \`f\` directly, **without recomputing** \`a+c\`.

**A critical implementation detail this transform depends on**: when the *same* expression is available via **different** computations on different incoming branches (e.g. computed into variable \`t=a\` on one path and \`t=b\` on another, both actually holding the availed value), the transform **must use the same temporary variable name** for the CSE'd result on every branch — otherwise the code emerging from the merge point can't uniformly refer to "the already-computed value" by one consistent name.`,
    pitfall:
      "Reaching definitions and available expressions look structurally similar (both are GEN/KILL forward analyses) but use OPPOSITE confluence operators for a fundamental reason: reaching definitions asks 'could this have happened on some path' (union — any predecessor suffices), while available expressions asks 'is this guaranteed on every path' (intersection — all predecessors required). Getting the confluence operator backwards for either analysis silently produces an unsound result.",
    related: ["mit6035-flow-reaching-definitions", "mit6035-flow-liveness-analysis"],
  },
  {
    id: "mit6035-flow-liveness-analysis",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define liveness, formalize it as a backward USE/DEF analysis, and describe its two main uses (register allocation, dead code elimination) including how externally-visible variables are handled.",
    back: `**Definition**: variable $v$ is **live** at point $p$ if $v$ is used along **some** path starting at $p$, with **no** intervening (re)definition of $v$ before that use. Equivalently, $v$ is **dead** at $p$ if either no path from $p$ ever uses $v$ again, or every path redefines $v$ before its next use.

**Backward analysis, USE/DEF sets per block**: **USE[b]** — variables with an **"upwards-exposed" use** in $b$ (read before any local (re)definition within $b$ itself). **DEF[b]** — variables (re)defined somewhere in $b$. Dataflow equations: $\\text{OUT}[b] = \\bigcup_{s\\,\\in\\,\\text{succ}(b)} \\text{IN}[s]$; $\\text{IN}[b] = \\text{USE}[b] \\cup (\\text{OUT}[b] - \\text{DEF}[b])$ — note this genuinely **mirrors** reaching definitions' equations (related card), just with **IN/OUT roles swapped** and **predecessors replaced by successors**, since liveness propagates **backward**, against the flow of control.

**Two uses**: **register allocation** — if a variable is dead at some point, its register can be safely **reassigned** to something else, since nothing further needs the old value. **Dead code elimination** — an assignment to a variable that's **dead immediately afterward** (i.e., never subsequently read) can simply be **removed**.

**Handling externally-visible variables (e.g. instance fields, or anything visible outside the analyzed function/CFG)**: dead-code elimination must **not** delete the *last* assignment to a variable that's visible **outside** the CFG being analyzed, even if nothing *within* the CFG reads it again — doing so would be observably wrong from the outside caller's perspective. **The fix**: make every externally-visible variable **artificially live on exit** from the CFG (include them in the initial $\\text{OUT}[\\text{exit}]$) — this single trick correctly protects exactly the assignments that matter externally, without needing any special-case logic scattered through the rest of the (otherwise perfectly general) liveness analysis or dead-code-elimination pass.`,
    related: ["mit6035-flow-available-expressions-and-global-cse", "mit6035-flow-duality-and-optimistic-pessimistic"],
  },
  {
    id: "mit6035-flow-duality-and-optimistic-pessimistic",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "State the general correctness guarantee dataflow analysis provides, and contrast optimistic (available expressions) vs. pessimistic (liveness) analyses — including why only one permits stopping the fixed-point iteration early.",
    back: `**General correctness guarantee**: analysis reasons about **all possible executions** simultaneously. For reaching definitions: for **every** actual execution $E$ reaching program point $p$, if definition $D$ genuinely reaches $p$ in $E$, then $D$ **must** be included in the analysis's computed reaching-definitions set at $p$ (soundness in one direction) — and conversely, if $D$ is **not** in the analysis's set, $D$ **never** reaches $p$ in **any** execution (soundness in the other direction, licensing the compiler to safely act on that absence). The analogous statement for available expressions: if the analysis says an expression **is** available, it genuinely is, in every execution — this is the direction of guarantee CSE (related card) depends on. This overall "the analysis's answer conservatively bounds what could actually happen" property is the general contract every dataflow analysis promises.

**Available expressions is *optimistic***: the analysis effectively **starts by assuming everything is available**, and each iteration **removes** things proven *not* actually available everywhere — this specific direction of iteration means the **analysis cannot be safely stopped early**: an intermediate, not-yet-converged result might still incorrectly claim something is available that a later iteration will correctly retract.

**Liveness is *pessimistic***: the analysis effectively **starts by assuming everything is live** (nothing provably dead yet), and each iteration **discovers** variables that are actually dead — this direction of iteration means the analysis **CAN be stopped early** and its current, not-yet-fully-converged result safely used: anything the analysis has *already* determined to be dead at some intermediate iteration is guaranteed to genuinely stay dead (removing more edges/paths through further iteration can only ever kill *more* things, never resurrect something already proven dead) — so an early, partial dead-code-elimination pass based on an unconverged liveness result is still a **safe**, if possibly incomplete, optimization.

**Why this distinction exists, and what it does *not* depend on**: it's purely about **which direction the analysis is being used for** (proving something IS true, vs. proving something ISN'T) — the underlying dataflow machinery (the equations, the worklist algorithm, the confluence operator) is otherwise identical in structure; the "optimistic vs. pessimistic" label is a property of how a specific analysis's result gets *used*, not a distinct kind of dataflow mechanism.`,
    related: ["mit6035-flow-liveness-analysis", "mit6035-flow-transfer-functions-monotone-distributive"],
  },

  // --- Lecture 11-12: Foundations of dataflow analysis ---
  {
    id: "mit6035-flow-lattices-and-partial-orders",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the partial-order axioms, define join/meet and top/bottom, and state the algebraic characterization of a lattice (associativity/commutativity/idempotence/absorption).",
    back: `**Partial order** $\\le$ on a set $P$: **reflexive** ($x \\le x$); **antisymmetric** ($x \\le y$ and $y \\le x$ implies $x=y$); **transitive** ($x \\le y$ and $y \\le z$ implies $x \\le z$).

**Upper/lower bounds**: $x$ is an **upper bound** of $S \\subseteq P$ if $y \\le x$ for every $y \\in S$; $x$ is the **least upper bound (join, $\\vee$, lub, sup)** if it's an upper bound and $x \\le$ every other upper bound. **Lower bound**/**greatest lower bound (meet, $\\wedge$, glb, inf)** are defined symmetrically. If $x\\wedge y$ and $x\\vee y$ exist for **every** pair $x,y \\in P$, $P$ is a **lattice**; if $\\wedge S$ and $\\vee S$ exist for **every** subset $S \\subseteq P$, $P$ is a **complete lattice** (every **finite** lattice is automatically complete — a fact this course's dataflow lattices, being finite in practice, get for free).

**Top and bottom**: the greatest element of $P$ (if it exists) is **top**; the least element (if it exists) is **bottom**, $\\bot$.

**The algebraic characterization — an equivalent way to define a lattice, purely via $\\vee$/$\\wedge$ as abstract operations satisfying**: associativity and commutativity of both $\\vee$ and $\\wedge$; **idempotence** ($x\\vee x = x$, $x\\wedge x = x$); **absorption** ($x \\vee (x \\wedge y) = x$, $x \\wedge (x \\vee y) = x$). **The connection**: define $x \\le y$ iff $x \\vee y = y$ (equivalently, iff $x \\wedge y = x$ — these two conditions are provably equivalent to each other using just the algebraic laws, and the resulting $\\le$ can be proven to satisfy all three partial-order axioms, purely algebraically) — meaning a lattice can be built up **either** starting from an order and deriving $\\vee$/$\\wedge$ as bounds, **or** starting from $\\vee$/$\\wedge$ as arbitrary algebraic operations satisfying the four laws above and deriving $\\le$ from them; both routes provably agree, giving two equally valid, fully interchangeable ways to think about the same structure.`,
    related: ["mit6035-flow-ascending-chains-and-termination", "mit6035-flow-transfer-functions-monotone-distributive"],
  },
  {
    id: "mit6035-flow-ascending-chains-and-termination",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define chains and the ascending chain condition, explain why it guarantees the worklist algorithm terminates, and describe widening operators for lattices that lack it.",
    back: `**Chain**: a subset $S \\subseteq P$ is a **chain** if every two elements of $S$ are comparable ($x \\le y$ or $y \\le x$, for all $x,y \\in S$) — a fully linearly-ordered subset, with no incomparable pairs.

**Ascending chain condition (ACC)**: $P$ satisfies it if **every** ascending sequence $x_1 \\le x_2 \\le \\cdots$ **eventually stabilizes** — there exists some $n$ with $x_n = x_{n+1} = \\cdots$ forever after. (Every **finite** lattice trivially satisfies the ACC, since only finitely many distinct values can ever appear in any sequence at all.)

**Why the ACC guarantees the worklist algorithm terminates**: the algorithm only ever **updates** $\\text{IN}[n]$/$\\text{OUT}[n]$ values **upward** (each recomputation, via monotone transfer functions and a join-based confluence operator, related card, produces a value $\\ge$ the previous one) — so the sequence of values any single node's $\\text{IN}$ or $\\text{OUT}$ takes on over the course of the algorithm is itself an ascending chain. If the lattice satisfies the ACC, that chain **must** eventually stop changing — at which point that node stops re-triggering further work, and (applied to every node simultaneously) the whole worklist eventually empties.

**Widening operators — for lattices lacking the ACC** (e.g. the integers under max/min, which admit infinitely ascending chains): a **widening operator** detects when a value **might** be part of an infinitely-ascending chain, and **artificially forces** it up to some coarser, chain-terminating value (often all the way to **TOP**) rather than letting the naive iteration continue climbing forever. **Worked example**: for a lattice of *sets of integers* (used, e.g., to track the set of possible values a variable takes on during execution), a widening operator might raise **any** set that grows to size $\\ge n$ straight to TOP — deliberately sacrificing precision specifically to **guarantee termination**, a technique the lecture notes is "likely to be useful for loops" (where naive value-tracking could otherwise attempt to enumerate unboundedly many distinct values across iterations).`,
    related: ["mit6035-flow-lattices-and-partial-orders", "mit6035-flow-generalized-worklist-algorithm"],
  },
  {
    id: "mit6035-flow-transfer-functions-monotone-distributive",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the requirements on a dataflow framework's transfer-function set F (identity, closure under composition, monotonicity, sometimes distributivity), and prove distributivity implies monotonicity.",
    back: `**Each dataflow analysis problem has a set $F$ of transfer functions**, $f: P \\to P$, one per CFG node, required to satisfy: **identity function $i \\in F$** (some node might do nothing to the information — e.g. a no-op); **closed under composition** — for any $f,g \\in F$, the composed function $h = \\lambda x. f(g(x))$ must **also** be in $F$ (chaining two nodes' effects together must still be a legitimate transfer function of the same kind, needed since sequences of nodes must compose correctly); **each $f \\in F$ must be monotone**: $x \\le y$ implies $f(x) \\le f(y)$ (information can only ever become "more defined/more merged," never spontaneously become more precise, as it flows through a transfer function) — this is the property the worklist algorithm's termination argument (related card) directly depends on. **Sometimes** all $f \\in F$ are additionally **distributive**: $f(x \\vee y) = f(x) \\vee f(y)$ — a strictly stronger property with major precision consequences (related later card).

**Proof: distributivity implies monotonicity**. Assume $f(x \\vee y) = f(x) \\vee f(y)$ for all $x,y$. Must show: $x \\vee y = y$ (i.e., $x \\le y$, using the join-based definition of $\\le$, related card) implies $f(x) \\vee f(y) = f(y)$ (i.e., $f(x) \\le f(y)$). Proof: $f(y) = f(x \\vee y)$ (by the assumption $x\\vee y = y$) $= f(x) \\vee f(y)$ (by distributivity) — establishing exactly $f(x) \\vee f(y) = f(y)$, which is precisely $f(x) \\le f(y)$. **QED.**

**The practical upshot**: distributivity is a genuinely *stronger*, not merely equivalent, requirement than monotonicity — every distributive transfer-function set is automatically monotone (as just proven), but the converse fails (related later card gives a concrete monotone-but-not-distributive example) — meaning "monotone" is the *minimum* bar every legitimate dataflow framework must clear (for termination/correctness), while "distributive" is a *bonus* property some frameworks happen to have and others don't, with real precision consequences either way.`,
    related: ["mit6035-flow-lattices-and-partial-orders", "mit6035-flow-mop-vs-mfp-distributivity"],
  },
  {
    id: "mit6035-flow-generalized-worklist-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the fully generalized forward dataflow-equation framework and worklist algorithm, and show how reaching definitions is recovered as one specific instantiation (including its distributivity proof).",
    back: `**The generalized framework, forward analysis**: for each node $n$: $\\text{in}_n$ (value before $n$), $\\text{out}_n$ (value after $n$), $f_n$ (transfer function, $\\text{out}_n = f_n(\\text{in}_n)$). Require: $\\forall n \\ne n_0.\\ \\text{in}_n = \\bigvee\\{\\text{out}_m \\mid m \\in \\text{pred}(n)\\}$; $\\text{in}_{n_0} = I$ (a chosen value summarizing information known at program start). This gives a **system of dataflow equations** — exactly the same shape regardless of which specific analysis is being performed, deliberately **separating the analysis problem from the particular program** being analyzed.

**Generalized worklist algorithm**: for each $n$, $\\text{out}_n := f_n(\\bot)$; $\\text{in}_{n_0}:=I$, $\\text{out}_{n_0}:=f_{n_0}(I)$; worklist $:= N - \\{n_0\\}$; while the worklist is non-empty, remove a node $n$, recompute $\\text{in}_n := \\bigvee\\{\\text{out}_m \\mid m\\in\\text{pred}(n)\\}$ and $\\text{out}_n := f_n(\\text{in}_n)$, and — if $\\text{out}_n$ changed — re-add $n$'s successors to the worklist. (The **correctness argument** is essentially definitional: the algorithm only stops touching a node once its equations are already satisfied, and every successor of a changed node is guaranteed to be revisited — so the final, stable state necessarily satisfies every dataflow equation everywhere.)

**Recovering reaching definitions as one instantiation**: $P = $ powerset of all definitions in the program; $\\vee = \\cup$ (order: $\\subseteq$); $\\bot = \\emptyset$; $I = \\text{in}_{n_0} = \\bot$; $F = $ all functions of the form $f(x) = a \\cup (x - b)$ (i.e., exactly $\\text{GEN} \\cup (x - \\text{KILL})$, related earlier card) — a **general pattern** many transfer functions across many different analyses share.

**Proving this specific $F$ actually satisfies the framework's requirements**: **identity** — $\\lambda x.\\emptyset \\cup (x-\\emptyset) = \\lambda x.x \\in F$ (take $a=\\emptyset, b=\\emptyset$). **Distributivity** — given $f_1(x)=a_1\\cup(x-b_1)$, $f_2(x)=a_2\\cup(x-b_2)$, direct algebraic expansion shows $f_1(x)\\cup f_1(y) = a_1\\cup((x\\cup y)-b_1) = f_1(x\\cup y)$ — confirming the GEN/KILL form is genuinely distributive, not merely monotone. **Composition** — given $f_1,f_2$ of that same form, direct expansion shows $f_1(f_2(x))$ simplifies back down to the same $a\\cup(x-b)$ shape (with $a = a_1\\cup(a_2-b_1)$, $b=b_2\\cup b_1$) — confirming closure under composition. These three concrete proofs, done once here for the GEN/KILL pattern specifically, are exactly why *every* GEN/KILL-shaped analysis (reaching definitions, available expressions, liveness, all related cards) automatically inherits distributivity, termination, and correctness for free, without needing to re-derive them from scratch each time.`,
    related: ["mit6035-flow-transfer-functions-monotone-distributive", "mit6035-flow-mop-and-soundness"],
  },
  {
    id: "mit6035-flow-mop-and-soundness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the Meet-Over-Paths (MOP) solution as the ideal target for a forward dataflow analysis, and sketch the induction proof that the worklist algorithm's result is always a safe (≤) approximation of MOP.",
    back: `**What would an ideal solution look like?** Consider any actual path $p = n_0, n_1, \\ldots, n_k, n$ reaching node $n$ (where each $n_i \\in \\text{pred}(n_{i+1})$). Whatever the true, ideal dataflow information at $n$ is, it must **account for** exactly what this specific path would produce: $f_p(\\bot) = f_{n_k}(f_{n_{k-1}}(\\cdots f_{n_1}(f_{n_0}(\\bot))\\cdots)) \\le \\text{in}_n$ — a real solution must be **at least as merged/general as** what any single actual path's own step-by-step transfer-function composition would compute. **The Meet-Over-Paths (MOP) solution**, ideally: $\\text{in}_n = \\bigvee\\{f_p(\\bot) \\mid p \\text{ is a path to } n\\}$ — the join, over *every possible path* to $n$, of what that specific path alone would compute — the tightest, most precise value consistent with every individual path's own contribution.

**The soundness statement the worklist algorithm actually guarantees**: for **every** path $p$ to $n$, $f_p(\\bot) \\le \\text{in}_n$ (the worklist result) — i.e., the algorithm's answer is **at least as merged as** (safely approximates) what any single path alone would give, though not necessarily *exactly* equal to the true MOP join over all paths (related next card).

**Proof sketch, by induction on the length of $p$**: **base case** — $p$ of length 1 means $p = n_0$ itself, and $f_p(\\bot) = \\bot = \\text{in}_{n_0}$ trivially. **Induction step** — assume the claim for all paths of length $k$; given a path $p$ of length $k{+}1$ ending $\\ldots, n_k, n$: by the induction hypothesis, $(f_{k-1}(\\cdots f_{n_0}(\\bot)\\cdots)) \\le \\text{in}_{n_k}$; applying $f_{n_k}$ to both sides and using **monotonicity** (related card — this is exactly where monotonicity, not merely distributivity, is the load-bearing property) preserves the $\\le$: $f_{n_k}(\\cdots) \\le f_{n_k}(\\text{in}_{n_k}) = \\text{out}_{n_k}$ (by the algorithm's own defining equation); and — using a lemma about what the worklist algorithm's own fixed point already guarantees ($\\text{out}_{n_k} \\le \\text{in}_n$, since $n_k$ is a predecessor of $n$ and the fixed point satisfies the join equation) — transitivity chains these together to give exactly $f_p(\\bot) \\le \\text{in}_n$, completing the induction.`,
    related: ["mit6035-flow-generalized-worklist-algorithm", "mit6035-flow-mop-vs-mfp-distributivity"],
  },
  {
    id: "mit6035-flow-mop-vs-mfp-distributivity",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does distributivity make the worklist algorithm's fixed-point result exactly equal MOP, and walk through the constant-propagation counterexample showing a monotone-but-not-distributive framework loses real precision.",
    back: `**Distributivity closes the gap between the worklist algorithm's result (sometimes called the Maximum/Meet Fixed Point, MFP) and the ideal MOP**: if every $f \\in F$ is distributive, the worklist algorithm's fixed point *exactly equals* MOP — $\\bigvee\\{f_p(\\bot) \\mid p \\text{ is a path to } n\\} = \\text{in}_n$ for every $n$, not merely $\\le$ (related card's weaker general guarantee). Intuitively: distributivity means "join, then apply $f$" and "apply $f$ to each, then join" give the **same** answer — so it doesn't matter whether the algorithm joins information from different paths *before* or *after* applying each node's transfer function; either order reaches the identical, fully precise result.

**The constant-propagation counterexample — a genuinely monotone but *not* distributive framework**: lattice = flat lattice on the integers (BOT below every integer, every integer incomparable to every other, TOP above all — tracking "the constant value(s) a variable might hold"). Consider $f$ for \`c = a + b\`. **Check distributivity directly**: $f([a{\\to}3,b{\\to}2]) \\vee f([a{\\to}2,b{\\to}3])$ — both individually compute $c{=}5$ (since $3{+}2=2{+}3=5$), so this equals $[a{\\to}\\text{TOP}, b{\\to}\\text{TOP}, c{\\to}5]$ (joining the differing $a$/$b$ values to TOP, but $c$ genuinely agrees at 5 on both paths). **Versus**: $f([a{\\to}3,b{\\to}2] \\vee [a{\\to}2,b{\\to}3]) = f([a{\\to}\\text{TOP},b{\\to}\\text{TOP}]) = [a{\\to}\\text{TOP},b{\\to}\\text{TOP},c{\\to}\\text{TOP}]$ (joining $a$/$b$ to TOP *before* applying $f$ destroys the information that they were, on **every individual path**, always going to sum to exactly 5). **These two computations genuinely disagree** ($c{\\to}5$ vs. $c{\\to}\\text{TOP}$) — a direct, concrete demonstration that this framework is **not** distributive, even though it's still perfectly monotone.

**What this means concretely for the worklist algorithm's own result**: the worklist algorithm computes information by joining **before** applying transfer functions at each merge (exactly the second, less-precise computation above) — so its MFP result for $c$ at the merge is $\\text{TOP}$ ("could be anything"), even though the *true* MOP answer (accounting for each path's own history individually) would correctly determine $c=5$ on every actual execution. **The MFP result is a strictly weaker, less precise — but still sound — approximation of MOP** whenever the framework lacks distributivity.

**The fix, and its cost**: to recover full MOP precision, track **sets of complete value-combinations** actually observed on each path (e.g. $\\{[a{\\to}2,b{\\to}3], [a{\\to}3,b{\\to}2]\\}$, keeping both combinations distinct through the join, applying $f$ to each separately and only then joining the two resulting $c{\\to}5$ facts — which correctly agree) — but this pays a real, serious cost: **exponential blowup** (tracking the full cross-product of every variable's possible combinations, not just each variable independently) and **possible nontermination** (the resulting lattice of value-combination-sets may lack the ascending chain condition, related card, requiring a widening operator and its own attendant precision loss to force termination).`,
    pitfall:
      "Monotonicity guarantees the worklist algorithm terminates at a SOUND answer (related card's ≤ MOP guarantee) — it does NOT guarantee that answer is the most PRECISE possible sound answer. Distributivity is the strictly stronger property that closes this precision gap; a framework can be perfectly correct (monotone) while still being needlessly imprecise (not distributive), and the two properties must be checked and reasoned about separately.",
    related: ["mit6035-flow-transfer-functions-monotone-distributive", "mit6035-flow-abstraction-function-soundness"],
  },
  {
    id: "mit6035-flow-abstraction-function-soundness",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the concrete-state-to-lattice-value connection via an abstraction function AF, state the general correctness condition, and walk through the Sign Analysis worked example including its induction-based soundness proof.",
    back: `**Connecting abstract analysis results back to concrete execution**: a concrete program **state** $s$ pairs a program point $n$ (what executes next) with the actual current values of every variable; a real execution generates a **trajectory** of states $s_0, s_1, \\ldots$. The **abstraction function** $\\text{AF}: \\text{ST} \\to P$ maps a concrete state to the lattice value it corresponds to. **The general correctness condition** every sound analysis must satisfy: for **every** reachable state $s$ (with $n$ its next-to-execute node), $\\text{AF}(s) \\le \\text{in}_n$ — the analysis's computed value must always be **at least as general/imprecise as** whatever the *actual*, concrete state genuinely is; the analysis is allowed to lose precision (by design, related card on sources of imprecision), but never to claim something **more specific** than is actually, always true.

**Worked example — Sign Analysis**: base lattice $P = \\{-, 0, +\\}$ arranged as a **flat lattice** (TOP above all three, BOT below all three, the three signs mutually incomparable) — the full analysis lattice tracks one sign-value per variable, e.g. $[a{\\to}+, b{\\to}0, c{\\to}-]$. **Interpretation**: BOT means "no information yet" (unreachable/uninitialized); $-/0/+$ pin down the sign exactly; TOP means "could be either sign" (genuine uncertainty). **Abstraction function**: $\\text{AF}(s)[v] = \\text{sign}(s[v])$ for each variable $v$ — directly reading off each variable's actual concrete sign. **Transfer functions**: for \`v = c\` (a constant), set $v$'s lattice entry to $\\text{sign}(c)$ directly; for \`v1 = v2 * v3\`, look up a small $\\otimes$ multiplication table over $\\{-,0,+,\\text{TOP},\\text{BOT}\\}$ (e.g. $-\\otimes- = +$, $+\\otimes 0 = 0$, anything involving TOP with a nonzero operand gives TOP, since the true sign genuinely can't be pinned down). **$I = \\text{TOP}$** for every variable at entry — uninitialized variables could genuinely hold any sign.

**Two distinct sources of imprecision this example makes concrete**: **abstraction imprecision** — collapsing a concrete value like $a{=}1$ down to the coarser $a{\\to}+$ throws away everything except the sign itself. **Control-flow imprecision** — at a merge where one branch sets $b{=}{-1}$ and the other $b{=}1$, the join gives $b{\\to}\\text{TOP}$ — correctly summarizing "$b$'s sign varies across the different paths that could reach here," even though *any specific* concrete execution state $s$ reaching that point has some definite, single sign for $b$ (never literally TOP) — TOP is a summary **across executions**, not a value any individual execution's own $\\text{AF}(s)$ ever actually equals.

**Soundness proof — by induction on the length of the execution that produced $s$**: **base case** — the very first state $s_0$ has, for every $v$, $\\text{in}_{n_0}[v] = \\text{TOP}$ (by the chosen $I$), and trivially $\\text{AF}(s_0)[v] \\le \\text{TOP}$ for anything. **Induction step** — given the hypothesis holds for the state $s_p$ that just produced (via node $p$) the new state $s$ at node $n$: case-split on $p$'s form. If $p$ is \`v = c\`: the concrete state genuinely sets $s[v]=c$, so $\\text{AF}(s)[v] = \\text{sign}(c) = \\text{out}_p[v]$ exactly (no imprecision introduced at *this* specific step) — and $\\text{out}_p[v] \\le \\text{in}_n[v]$ follows from the same worklist-fixed-point lemma used in the MOP soundness proof (related card); for every **other** variable $x \\ne v$, $s[x]=s_p[x]$ (unchanged) and $\\text{out}_p[x]=\\text{in}_p[x]$ (the transfer function for \`v=c\` doesn't touch $x$'s entry), so $\\text{AF}(s)[x] = \\text{AF}(s_p)[x] \\le \\text{in}_p[x] = \\text{out}_p[x] \\le \\text{in}_n[x]$ by the induction hypothesis chained with transitivity. The \`v1=v2*v3\` case follows by exactly analogous reasoning through the $\\otimes$ table. **This same induction-on-execution-length pattern is completely general** — it's the template every concrete-to-abstract soundness proof in this framework follows, regardless of which specific analysis or lattice is involved.`,
    related: ["mit6035-flow-mop-vs-mfp-distributivity", "mit6035-flow-multiple-fixed-points"],
  },
  {
    id: "mit6035-flow-multiple-fixed-points",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does dataflow analysis specifically compute the LEAST fixed point (not merely 'a' fixed point), and what does the worked available-expressions counterexample with two distinct self-consistent solutions show?",
    back: `**The subtlety**: a system of dataflow equations can, in general, have **more than one** self-consistent solution — i.e., more than one assignment of $\\text{in}_n$/$\\text{out}_n$ values to every node that satisfies every dataflow equation simultaneously. **Dataflow analysis specifically wants the *least* such fixed point** — not just any arbitrary one that happens to satisfy the equations.

**Worked available-expressions counterexample**: a small CFG — \`a = x+y\` feeding into \`i == 0\`, which branches to either \`b = x+y\` or a \`nop\`, both converging back to (implicitly) another use. **One self-consistent solution** ("the correct, least one"): after \`a=x+y\`, both the true and false branches show \`x+y\` as available (bit \`0\`/\`1\` marking "$x{+}y$ available" as, say, false initially then true after \`a=x+y\` computes it) — genuinely tracking that \`x+y\` becomes available right after its first computation and stays available through both branches (since neither branch redefines $x$ or $y$). **A second, *also* self-consistent solution exists**: one where the edges are instead labeled to show \`x+y\` available **everywhere**, including *before* \`a=x+y\` even executes — this configuration *also* satisfies every local dataflow equation (each block's own $\\text{IN}$/$\\text{OUT}$/$\\text{GEN}$/$\\text{KILL}$ relationship checks out internally), **despite being an incorrect over-statement** of when \`x+y\` is genuinely, actually available (claiming it's available *before* it was ever computed at all).

**Why this second, spurious solution isn't what the algorithm should produce**: it's simply **not sound** with respect to the actual semantics of "available" (related card's correctness condition) — it's a fixed point of the *equations themselves*, but not one that correctly reflects any genuine constraint on real program executions. **The worklist algorithm's specific initialization and iteration order (related card — starting from the most conservative extreme, $\\bot$ for reaching-definitions-style union analyses or the universal set for intersection-style ones, and only ever moving in the join direction) is precisely what guarantees it converges to the *least* fixed point** — the smallest, most-conservative self-consistent solution — rather than accidentally landing on some other, larger, over-optimistic fixed point that happens to also satisfy the equations but doesn't correctly reflect reality. This is exactly why the algorithm's specific starting point and monotone-only update discipline matter, not merely "eventually reach some fixed point of the equations."`,
    pitfall:
      "Satisfying the dataflow equations is a necessary but NOT sufficient condition for a correct analysis result — the equations alone can admit multiple self-consistent solutions, some of which are unsound over-approximations. The worklist algorithm's specific bottom-up, monotone-only iteration is what guarantees landing on the least (most conservative, actually-correct) fixed point rather than some other solution that merely happens to satisfy the same equations.",
    related: ["mit6035-flow-abstraction-function-soundness", "mit6035-flow-duality-and-optimistic-pessimistic"],
  },
];
