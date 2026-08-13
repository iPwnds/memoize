// MIT 6.046J / 18.410J (Spring 2015) — Lectures 16-18: NP-completeness via
// reduction chains (including a delightful 3SAT-to-Super-Mario-Brothers
// proof), the weak/strong NP-hardness distinction, formal approximation
// algorithms (PTAS/FPTAS, Vertex Cover, Set Cover, Partition), and
// fixed-parameter tractability (bounded search trees, kernelization). Basic
// P/NP/NP-completeness/reductions/SAT and a basic Vertex Cover approximation
// are already covered in Complexity Class's np-completeness module and in
// the mit6045 track's own formal complexity-theory module, so these cards
// go deeper (full proofs, the weak/strong distinction, PTAS/FPTAS, fixed-
// parameter tractability) rather than re-deriving the basics. See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6046-cx";

export const mit6046ComplexityApproxCards: Card[] = [
  {
    id: "mit6046-cx-reduction-chain-gadgets",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What's the general two-part template for proving a problem NP-complete via reduction, and how does the 3SAT-to-Super-Mario-Brothers proof illustrate the 'gadget' technique?",
    back: `**Template**: to show problem $X$ is NP-complete, (1) show $X \\in NP$ (exhibit a polynomial-time verifier for a polynomial-size certificate), and (2) show $X$ is **NP-hard** by reducing from an *already-known* NP-complete problem $Y$ — a polynomial-time transformation converting any $Y$-instance into an equivalent $X$-instance (same YES/NO answer). This suffices because $Y$'s own NP-hardness means *every* problem in NP already reduces to $Y$; composing that with the new $Y \\to X$ reduction shows every NP problem reduces to $X$ too. A **gadget** is a small, reusable sub-structure in the target problem's instance that encodes one feature (a variable, a clause) of the source problem.

**Worked example — Super Mario Brothers is NP-hard** (reduction from 3SAT, generalized to arbitrary $n\\times n$ screen size): build one **variable gadget** per Boolean variable $x_i$ — Mario falls from a ledge and is forced to choose left or right, irreversibly, corresponding to setting $x_i$ true or false. Build one **clause gadget** per clause — visiting it (reachable only via the correct literal choices from the variable gadgets) releases a star, needed later to survive a return trip through fire. A **crossover gadget** prevents Mario from illegally hopping between variable and clause sections out of order. After traversing all variable gadgets (encoding a full truth assignment) and then re-traversing all clause gadgets, Mario can only pass through fire (and thus complete the level) if *every* clause gadget was already visited-and-starred during the first pass — which happens exactly when every clause was satisfied by the chosen assignment. So "can Mario complete this level" $\\iff$ "is the 3SAT formula satisfiable," and since the gadgets' total size is polynomial in the formula size, this is a valid polynomial-time reduction.

This is the pattern *every* subsequent reduction in this lecture follows (3SAT $\\to$ Super Mario $\\to$ 3-Dimensional Matching $\\to$ Subset Sum $\\to$ Partition $\\to$ Rectangle Packing $\\to$ Jigsaw Puzzles) — each step designs gadgets translating the previous problem's structure into the new one's vocabulary, chaining hardness forward via transitivity of polynomial-time reductions.`,
    related: ["np-completeness-reductions", "mit6045-complexity-clique-is-np-complete"],
  },
  {
    id: "mit6046-cx-weak-vs-strong-nphard",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What's the difference between weak and strong NP-hardness, illustrated through the Subset Sum → Partition → Rectangle Packing → Jigsaw Puzzles reduction chain?",
    back: `**Subset Sum**: given integers $A=\\{a_1,\\ldots,a_n\\}$ and target $t$, is there a subset summing to exactly $t$? NP-hard via a reduction from 3-Dimensional Matching, encoding each matching triple $(x_i,x_j,x_k)$ as a number in a large base $b$ with 1s in exactly three digit positions — sized so digits can never "carry" or collide between different triples' encodings, making a valid Subset Sum solution correspond exactly to a valid matching.

**Weak vs. strong NP-hardness**: Subset Sum is only **weakly** NP-hard — the *target* $t$'s bit-length is only $O(n)$, but $t$'s actual numeric *value* can be exponential in $n$ (the reduction needs numbers with exponentially many digits to prevent digit collisions). A problem is **strongly** NP-hard only if hardness survives even when every number in the instance is restricted to be *polynomial* in the input size — no exponentially-large numeric values allowed. This distinction matters practically: a **pseudopolynomial algorithm** exists for Subset Sum (e.g. DP indexed by achievable sums, polynomial in $n$ *and* in $t$'s numeric value, though exponential in $t$'s bit-length) — weakly NP-hard problems often admit such algorithms, which strongly NP-hard problems provably cannot (assuming $P\\neq NP$).

**Partition** (subset summing to exactly half the total) reduces *from* Subset Sum by padding with two extra carefully-chosen elements ($a_{n+1}=\\sigma+t$, $a_{n+2}=2\\sigma-t$, where $\\sigma=\\sum A$) that force a valid partition to correspond exactly to a Subset-Sum solution — also only weakly NP-hard.

**Rectangle Packing** reduces from Partition (each element becomes a $1\\times 3a_i$ rectangle, forcing horizontal-only packing into a target rectangle whose split corresponds to the partition) — also weakly NP-hard, since it inherits Partition's reliance on numeric magnitude.

**Jigsaw Puzzles**, however, needs a reduction from **4-Partition** (partition into groups of exactly 4 elements each summing to $t$, itself known **strongly** NP-hard) rather than from ordinary Partition directly — because Jigsaw Puzzle instances can't be built with exponentially-sized numeric magnitudes (piece counts must stay polynomial), a reduction from a *weakly*-hard source problem wouldn't carry through. Using 4-Partition (whose polynomial-size numeric ranges survive the reduction) makes Jigsaw Puzzles **strongly** NP-hard.`,
    pitfall:
      "Choosing the wrong source problem for a reduction can silently produce an unprovable or false claim — reducing from a weakly NP-hard problem into a target that structurally can't represent exponentially large numbers (like polynomial-size jigsaw pieces) simply doesn't work, which is exactly why this chain switches from Partition to 4-Partition partway through.",
    related: ["np-completeness-tsp-subset-sum", "mit6046-cx-reduction-chain-gadgets"],
  },
  {
    id: "mit6046-cx-approximation-ratio-ptas-fptas",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define approximation ratio formally, and distinguish a ρ(n)-approximation algorithm from a PTAS and an FPTAS.",
    back: `Let $C_{opt}$ be the optimal solution's cost for a size-$n$ instance. An approximation algorithm producing solution cost $C$ has **approximation ratio** $\\rho(n)$ if, for **every** input, $\\max\\left(\\frac{C}{C_{opt}}, \\frac{C_{opt}}{C}\\right) \\leq \\rho(n)$ — a single symmetric bound covering both minimization problems (where $C \\geq C_{opt}$) and maximization problems (where $C \\leq C_{opt}$) with one definition. Such an algorithm is called a **$\\rho(n)$-approximation algorithm**.

An **approximation scheme** takes a precision parameter $\\varepsilon > 0$ as input and guarantees $C \\leq (1+\\varepsilon)C_{opt}$ for any fixed $\\varepsilon$ — a **$(1+\\varepsilon)$-approximation algorithm**, letting the user dial the accuracy/speed tradeoff directly rather than being stuck with one fixed $\\rho(n)$.

- A **PTAS** (Polynomial Time Approximation Scheme): runs in time polynomial in $n$ (for each *fixed* $\\varepsilon$) — but the polynomial's degree or constant is allowed to depend on $\\varepsilon$ arbitrarily badly (e.g. $O(n^{2/\\varepsilon})$ is a valid PTAS: polynomial in $n$ for fixed $\\varepsilon$, but the exponent itself blows up as $\\varepsilon \\to 0$).
- An **FPTAS** (Fully Polynomial Time Approximation Scheme): runs in time polynomial in **both** $n$ and $\\frac{1}{\\varepsilon}$ simultaneously (e.g. $O(n/\\varepsilon^2)$) — a strictly stronger, more practically useful guarantee, since halving $\\varepsilon$ only polynomially (not catastrophically) increases running time.

Every FPTAS is a PTAS, but not conversely — the distinction is exactly analogous to (and directly informs) the fixed-parameter-tractability distinction between $f(k)\\cdot n^{O(1)}$ and other growth patterns (related card): both frameworks separate "the hard part scales however it wants, but the polynomial part stays clean" from "everything scales polynomially, even the hard-looking part."`,
    related: ["np-completeness-approximation-overview", "mit6046-cx-fixed-parameter-tractability"],
  },
  {
    id: "mit6046-cx-vertex-cover-natural-vs-edge-picking",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Why does the 'obviously smarter' greedy Vertex Cover heuristic (always pick the highest-degree vertex) actually perform WORSE (Θ(log n)) than the seemingly naive edge-picking algorithm (2-approximation)?",
    back: `**Edge-picking algorithm** (already covered — see related card): repeatedly pick an arbitrary uncovered edge, add *both* endpoints to the cover, discard all edges now covered. Achieves a **2-approximation**: the picked edges form a matching (no two share an endpoint, since covering an edge removes all edges touching either endpoint), so $C_{opt}$ must include at least one endpoint from each — giving $C_{opt} \\geq |\\text{matching}|$, while the algorithm's output is exactly $2\\times|\\text{matching}|$.

**The intuitively "smarter" alternative**: repeatedly pick the **single vertex of maximum current degree**, add it alone, remove it and its incident edges, repeat. This *feels* more efficient (one vertex per step instead of two, always attacking the "worst offender"). **But it's provably worse — only a $\\Theta(\\log n)$-approximation**: consider a graph with $k!$ vertices of degree $k$ at the top, connected down through several layers to $k!$ vertices of degree 1 at the bottom (sized so each layer's total degree matches). The true optimal cover is just the $k!$ top-degree vertices — but the max-degree-greedy algorithm can be fooled into picking large numbers of the *bottom*, degree-1 vertices instead (if ties or near-ties favor them at each step), accumulating a cover of size $\\approx k!\\log k$ — a factor of $\\log k \\approx \\log\\log n$ worse than optimal in this specific construction, and provably $O(\\log n)$ worse than optimal in general (via a harmonic-sum argument: each of the first $m=C_{opt}$ iterations removes at least a $\\frac{1}{m}$ fraction of remaining edges, so full coverage takes $O(m\\log n)$ iterations/vertices).

**The lesson**: an approximation algorithm's quality isn't well-predicted by how "sensible" or "locally optimal" its greedy rule feels — the *provable* worst-case ratio is what matters, and here the less locally-clever algorithm (picking both endpoints of an arbitrary edge) actually gives the *better* guarantee (constant factor 2, vs. growing $\\log n$) than the more locally-aggressive one (always attacking max degree).`,
    pitfall:
      "It's tempting to assume 'attacks the highest-degree vertex first' must dominate 'picks an arbitrary edge' — but approximation ratio is a worst-case guarantee across all inputs, and the max-degree heuristic's failure mode (getting misled into covering many low-degree vertices) is a real, constructible adversarial case, not a hypothetical.",
    related: ["np-completeness-vertex-cover-approximation", "mit6046-cx-set-cover-greedy-approx"],
  },
  {
    id: "mit6046-cx-set-cover-greedy-approx",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Derive the (ln n + 1)-approximation ratio for the greedy Set Cover algorithm.",
    back: `**Set Cover**: given universe $X$ and subsets $S_1,\\ldots,S_m \\subseteq X$ covering $X$, find the fewest subsets whose union is still all of $X$. **Greedy algorithm**: repeatedly pick whichever remaining set covers the most *still-uncovered* elements; remove those elements from consideration; repeat until nothing remains.

**Proof of the $(\\ln n + 1)$ ratio**: let $C_{opt} = t$ (the true minimum), and let $X_k$ be the elements still uncovered after the greedy algorithm's $k$-th pick. Since the $t$ optimal sets *do* cover all of $X$ (hence all of $X_k \\subseteq X$), by pigeonhole **some** optimal set covers at least $\\frac{|X_k|}{t}$ of $X_k$'s elements — and the greedy algorithm, by definition, picks a set covering *at least as many* remaining elements as any single candidate, so $|X_{k+1}| \\leq |X_k| - \\frac{|X_k|}{t} = \\left(1-\\frac{1}{t}\\right)|X_k|$.

Unrolling this recursively: $|X_k| \\leq \\left(1-\\frac{1}{t}\\right)^k |X_0| \\leq e^{-k/t}\\,n$ (using $|X_0|=n=|X|$ and the standard inequality $1-x \\leq e^{-x}$). The algorithm terminates once $|X_k| < 1$ (i.e. $=0$), which happens once $e^{-k/t}n < 1 \\iff e^{k/t} > n \\iff \\frac{k}{t} > \\ln n$ — so the algorithm needs at most $k \\leq t(\\ln n + 1)$ sets (accounting for the final rounding step to guarantee strict coverage). Since the algorithm's cost $C=k$ and $C_{opt}=t$: $\\frac{C}{C_{opt}} \\leq \\ln n + 1$.

**A cautionary note on the ratio's behavior**: unlike the Vertex Cover 2-approximation's *constant* ratio, Set Cover's $(\\ln n+1)$ ratio **grows** (slowly) with instance size — larger Set Cover instances get proportionally worse worst-case guarantees, a qualitatively different (and generally less desirable) kind of approximation guarantee than a fixed constant factor.`,
    pitfall:
      "The pigeonhole step ('some optimal set covers ≥ |X_k|/t of X_k') relies on the t optimal sets collectively covering ALL of X_k — it does not claim any single optimal set is large on its own merits; it's purely an averaging argument over the t sets in the (unknown to the algorithm) optimal solution.",
    related: ["mit6046-cx-vertex-cover-natural-vs-edge-picking", "mit6046-cx-partition-ptas"],
  },
  {
    id: "mit6046-cx-partition-ptas",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the two-phase PTAS for Partition (minimize the larger side's weight) and its (1+ε) proof.",
    back: `**Partition** (optimization version): given weighted items $s_1 \\geq s_2 \\geq \\cdots \\geq s_n$, split into sets $A, B$ minimizing $\\max(w(A), w(B))$. Let $2L = \\sum_i s_i$, so $C_{opt} \\geq L$ (perfect balance is the best any partition could achieve).

**Algorithm — $Approx\\_Partition$**, parameterized by target precision $\\varepsilon$, with $m = \\lceil\\frac{1}{\\varepsilon}\\rceil - 1$: **Phase 1**: brute-force the *optimal* partition $A', B'$ of just the $m$ largest items — $O(2^m)$ time, feasible since $m$ depends only on $\\varepsilon$, not $n$. **Phase 2**: initialize $A=A', B=B'$; then greedily assign each remaining item $s_i$ (for $i=m{+}1,\\ldots,n$) to whichever of $A, B$ currently has smaller total weight.

**Proof this achieves $(1+\\varepsilon)$**: WLOG the final $w(A) \\geq w(B)$; let $s_k$ be the *last* item added to $A$. **Case 1** ($k \\leq m$, added during Phase 1): then $A=A'$ exactly, which is *provably optimal* for the $m$-item sub-problem — and since $n \\geq m$, this can't be beaten, so $w(A)=L$ exactly wherever achievable, giving ratio 1. **Case 2** ($k > m$, added during Phase 2): $s_k$ was added to $A$ specifically because $w(A)-s_k \\leq w(B)$ at that moment (that's the greedy rule) — combined with $w(A)+w(B)=2L$, this gives $w(A) \\leq L + \\frac{s_k}{2}$. Since items are sorted decreasingly and $k > m$, $s_k \\leq s_1,\\ldots,s_m$, and since $2L \\geq (m+1)s_k$ (the $m+1$ largest items, all $\\geq s_k$, sum to at most the full total $2L$): $\\frac{w(A)}{L} \\leq \\frac{L+s_k/2}{L} = 1+\\frac{s_k}{2L} \\leq 1+\\frac{s_k}{(m+1)s_k} = 1+\\frac{1}{m+1} = 1+\\varepsilon$.

**Why this is a PTAS, not (without more care) an FPTAS**: the running time is dominated by Phase 1's $O(2^m) = O(2^{1/\\varepsilon})$ brute force — polynomial in $n$ for any *fixed* $\\varepsilon$, but exponential in $\\frac{1}{\\varepsilon}$ itself, exactly the PTAS-not-FPTAS pattern (related card). A genuine FPTAS for Partition exists too (via a more careful DP-based rounding scheme), but isn't the algorithm developed here.`,
    pitfall:
      "The proof's Case 1 and Case 2 are genuinely different arguments for different structural reasons (brute-force optimality vs. the greedy balancing bound) — it's not that Case 1 is just 'Case 2 with k small,' so both cases need to be checked, not just the more general-looking Case 2.",
    related: ["mit6046-cx-approximation-ratio-ptas-fptas", "mit6046-cx-set-cover-greedy-approx"],
  },
  {
    id: "mit6046-cx-fixed-parameter-tractability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain the 'pick two of three' framing motivating fixed-parameter algorithms, and state the formal FPT definition plus why f(k)·n^c (not f(k)+n^c) is the right growth form.",
    back: `Three desirable features for an algorithm on an NP-hard problem: (1) solve the actual hard problem, (2) run in polynomial time, (3) return an exact (not approximate) solution. **Unless $P=NP$, no algorithm can have all three simultaneously.** An ordinary $P$-time exact algorithm has (2)+(3) but doesn't apply to genuinely NP-hard problems (feature 1 fails, since $P$-time exact solutions to NP-hard problems would imply $P=NP$). An **approximation algorithm** has (1)+(2) — solves hard problems fast, but sacrifices exactness. A **fixed-parameter algorithm** takes the third combination: (1)+(3) — solves hard problems exactly, but sacrifices polynomial-time (runs fast only for small values of some chosen **parameter**).

**Formal setup**: a **parameter** $k(x)$ is a nonnegative integer computed from the input $x$ (need not be efficiently computable itself, e.g. $k=$ the true optimum value); a **parameterized problem** pairs the original decision problem with a choice of parameter. A problem is **fixed-parameter tractable (FPT)** if some algorithm solves it in time $f(k)\\cdot n^{O(1)}$, for *some* computable function $f$, where the polynomial's **degree is independent of $k$** (only the function $f(k)$, not the exponent, is allowed to depend on the parameter).

**Why $f(k)\\cdot n^c$, not $f(k)+n^c$**: these two growth forms are actually **equivalent** up to redefinition — *Theorem*: an $f(k)\\cdot n^c$-time algorithm exists iff an $f'(k)+n^{c'}$-time algorithm exists. ($\\Leftarrow$ trivial, assuming $f',n^{c'}\\geq 1$.) ($\\Rightarrow$): if $n\\leq f(k)$, then $f(k)\\cdot n^c\\leq f(k)^{c+1}$; if $f(k)\\leq n$, then similarly $f(k)\\cdot n^c\\leq n^{c+1}$; combining both cases, $f(k)\\cdot n^c\\leq f(k)^{c+1}+n^{c+1}$, giving the additive form with $f'(k)=f(k)^{c+1}$, $c'=c+1$. (A slicker version: since $xy\\leq x^2+y^2$, set $f'(k)=f(k)^2$, $c'=2c$.) So the multiplicative form is chosen purely by convention (it's the more common way results are stated), not because it's a strictly larger class of algorithms.

**Concrete goal — $k$-Vertex Cover**: given $G$ and integer $k$, is there a vertex cover of size $\\leq k$? A **brute-force** search over all $\\leq k$-subsets costs $O(V^k|E|)$ — technically polynomial for any *fixed* $k$, but with the polynomial's *degree itself* growing with $k$ (this is exactly the "bad" pattern $n^{f(k)}$, disqualified from FPT status). A **bounded search-tree** algorithm (related card) achieves genuine FPT status: $O(2^k\\cdot V)$ — exponential only in $k$, with the polynomial part's degree ($V^1$) staying fixed regardless of $k$.`,
    pitfall:
      "n^{f(k)} (polynomial degree growing with k) and f(k)·n^{O(1)} (fixed polynomial degree, k confined to a separate multiplicative factor) look superficially similar but are fundamentally different growth classes — only the second is FPT; the first is the 'bad' pattern the brute-force k-Vertex Cover algorithm falls into.",
    related: ["mit6046-cx-approximation-ratio-ptas-fptas", "mit6046-cx-bounded-search-kernelization"],
  },
  {
    id: "mit6046-cx-bounded-search-kernelization",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the bounded search-tree algorithm solve k-Vertex Cover in O(2^k·V), and how does kernelization shrink the instance to O(k²) size before any search even begins?",
    back: `**Bounded search-tree algorithm for $k$-Vertex Cover**: pick any edge $(u,v)$ — at least one of $u,v$ must be in any valid cover (else that edge stays uncovered), but which one isn't known, so **try both**: recurse once assuming $u$ is in the cover (delete $u$ and its incident edges, recurse with budget $k-1$), and once assuming $v$ is (symmetric) — return YES if *either* branch succeeds. Unlike DP's guessing, **memoization doesn't help here** (the recursive subproblems along different branches are on genuinely different reduced graphs, not the same subproblem revisited), but the recursion tree is still cheaply bounded: it's binary, and the budget $k$ decreases by 1 at every level, so the tree has depth exactly $k$ and at most $2^k$ leaves. Each node costs $O(V)$ (deleting a vertex and its edges); a leaf ($k=0$) just checks whether all edges are already covered. Total: $O(2^k\\cdot V)$ — exponential *only* in $k$, with the polynomial part's degree fixed at 1, correctly landing in the FPT pattern $f(k)\\cdot n^{O(1)}$.

**Kernelization**: a polynomial-time **self-reduction** converting instance $(x,k)$ into a provably-equivalent but **smaller** instance $(x',k')$ with $|x'|\\leq f(k)$ (size bounded purely by the parameter, independent of the original $n$). **Theorem**: a problem is FPT $\\iff$ it admits a kernelization. ($\\Leftarrow$): kernelize first (poly-time), then run *any* finite algorithm on the now-small kernel — total time $n^{O(1)} + g(f(k))$, itself of FPT form. ($\\Rightarrow$): given an $f(k)\\cdot n^c$-time algorithm, if $n\\leq f(k)$ the instance is already small enough to count as its own kernel; if $f(k) \\leq n$, just *run* the FPT algorithm directly (only $n^{c+1}$ time) and output a trivial constant-size YES/NO instance — either way produces a valid kernelization.

**Concrete polynomial kernel for $k$-Vertex Cover** (size $O(k^2)$): any vertex with degree $> k$ **must** be in the cover (excluding it would require including all $>k$ of its neighbors instead, exceeding the budget) — repeatedly remove such high-degree vertices (and their incident edges), decrementing $k$ each time. The **remaining** graph has max degree $\\leq k$, so each of the $\\leq k$ remaining cover vertices can cover at most $k$ edges — if more than $k^2$ edges remain, answer NO immediately (no valid cover of size $k$ can exist); otherwise $|E'|\\leq k^2$, and after discarding isolated (degree-0) vertices, $|V'|\\leq 2k^2$. This $O(k^2)$-size kernel, combined with either the brute-force or bounded-search-tree algorithm applied *to the kernel*, gives overall runtimes of $O(V+E+2^kk^{2k+2})$ or $O(V+E+2^kk^2)$ respectively — the kernelization step itself dominates for large graphs, and the exponential blowup only ever touches the tiny, parameter-bounded kernel.`,
    code: `def bounded_search_vertex_cover(G, k):
    if not G.edges: return True          # k=0 leaf, all edges covered
    if k == 0: return False              # out of budget, edges remain
    u, v = next(iter(G.edges))           # pick any edge
    G_minus_u = G.copy(); G_minus_u.remove_vertex(u)
    G_minus_v = G.copy(); G_minus_v.remove_vertex(v)
    return (bounded_search_vertex_cover(G_minus_u, k - 1) or
            bounded_search_vertex_cover(G_minus_v, k - 1))`,
    pitfall:
      "Memoization across the search tree's branches doesn't help the bounded-search-tree algorithm the way it does in DP — each branch operates on a genuinely different reduced graph (different vertex removed), so there's no shared subproblem structure to cache; the O(2^k·V) bound comes purely from the tree's bounded depth and branching factor, not from avoiding repeated work.",
    related: ["mit6046-cx-fixed-parameter-tractability"],
  },
  {
    id: "mit6046-cx-eptas-fpt-connection",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State and prove the theorem connecting EPTAS (efficient PTAS) to fixed-parameter tractability of the associated decision problem.",
    back: `Given an optimization problem with integral optimum $OPT$, form its associated **decision problem** ("is $OPT \\leq k$?") and parameterize by $k$. An **EPTAS** (efficient PTAS) is a PTAS running in time $f(\\frac{1}{\\varepsilon})\\cdot n^{O(1)}$ — i.e. the polynomial's degree doesn't depend on $\\varepsilon$ (Partition's PTAS from the related card is an example).

**Theorem**: if an optimization problem has an EPTAS, its decision problem is FPT. **Proof** (for a maximization problem with a "$\\leq k$" decision question, by direct construction — deliberately parallel to the pseudopolynomial-vs-FPTAS relationship elsewhere in this course): run the EPTAS with $\\varepsilon = \\frac{1}{2k}$, costing $f(2k)\\cdot n^{O(1)}$ time — of valid FPT form, since $2k$ is still purely a function of the parameter. This produces a solution with relative error $\\leq \\varepsilon = \\frac{1}{2k} < \\frac{1}{k}$.

Two cases now settle the decision question exactly: if the EPTAS-found solution has value $\\leq k$, then since its relative error is bounded, $OPT \\leq (1+\\frac{1}{2k})\\cdot k = k+\\frac{1}{2}$ — and because $OPT$ is **integral**, $OPT \\leq k+\\frac{1}{2}$ forces $OPT \\leq k$ exactly, so the answer is definitively YES. Otherwise (the found solution's value $> k$), since the EPTAS never *overestimates* a maximization problem's achievable value beyond what's truly reachable, $OPT$ must itself be $> k$, so the answer is NO. Either way, the FPT-time EPTAS run **exactly** resolves the decision question — no approximation error survives, because the error bound was chosen small enough ($<1$) relative to $k$, combined with $OPT$'s integrality, to force rounding to the exact answer.

**Practical significance**: this theorem is mostly used in its **contrapositive** form — proving a decision problem is **not** FPT (e.g. via other hardness results, like the "W-hierarchy" briefly gestured at but not covered in depth here) then immediately rules out the existence of an EPTAS for the corresponding optimization problem, without needing to analyze approximation algorithms directly at all. The lecture also notes that $=, \\leq, \\geq$ decision-problem variants are all FPT-equivalent to each other, which is part of what makes this kind of cross-framework argument (approximation hardness $\\Rightarrow$ FPT hardness, or vice versa) broadly applicable rather than tied to one specific inequality direction.`,
    pitfall:
      "The proof depends critically on OPT being integral — without that assumption, a relative error just below 1/k wouldn't be enough to force exact rounding to the true decision answer, and the argument would only give an approximate (not exact) resolution of the ≤k question.",
    related: ["mit6046-cx-fixed-parameter-tractability", "mit6046-cx-approximation-ratio-ptas-fptas"],
  },
];
