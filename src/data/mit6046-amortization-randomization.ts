// MIT 6.046J / 18.410J (Spring 2015) — Lectures 5-8: the four amortized-
// analysis techniques (aggregate, accounting, charging, potential methods),
// randomized algorithms (Freivalds' matrix-product checker, randomized
// quicksort), skip lists (motivation and formal with-high-probability
// analysis), and hashing (universal hashing, perfect hashing). Where the
// generic curriculum already covers a topic at an intro level (amortized
// analysis, skip list structure/operations, hashing basics), these cards
// cover 6.046's own deeper formal machinery and cross-link via `related`
// rather than duplicating. See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6046-am";

export const mit6046AmortizationRandomizationCards: Card[] = [
  {
    id: "mit6046-am-four-methods-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the formal definition of a valid amortized-cost assignment, and name the four techniques this course uses to establish one.",
    back: `**Formal definition**: an assignment of an "amortized cost" to each operation in a sequence is **valid** as long as it "preserves the total cost" — for any sequence of operations, $\\sum \\text{amortized cost} \\geq \\sum \\text{actual cost}$. Critically, amortized cost **need not be the literal average** — any assignment satisfying this inequality is a legitimate amortized bound, which is what makes the non-aggregate methods below possible (they assign different, more convenient numbers per operation, as long as the total still dominates the true total).

Four techniques for establishing such a bound, in increasing order of flexibility:
1. **Aggregate method**: sum the total actual cost of $k$ operations and divide by $k$. Simplest, but too blunt for algorithms whose operations have genuinely different amortized costs (e.g. insert vs. delete).
2. **Accounting method**: let cheap operations "save coins" (assigned amortized cost $>$ actual cost) into a bank for expensive operations to "spend" later (assigned amortized cost $<$ actual cost).
3. **Charging method**: let an expensive operation retroactively **charge** its cost to earlier (or, in principle, later) operations that made it necessary — $\\text{amortized cost} = \\text{actual cost} - \\text{total charged to past ops} + \\text{total charged by future ops}$.
4. **Potential method**: define a potential function $\\Phi$ (mapping a data-structure configuration to a number, playing the same role as the accounting method's "bank balance") such that $\\text{amortized cost} = \\text{actual cost} + \\Delta\\Phi$.

The accounting and potential methods are **equivalent in power** — one specifies $\\Delta\\Phi$ directly per operation, the other specifies $\\Phi$ as a function of the whole configuration, and either determines the other — but one is often more intuitive than the other for a given problem, which is why the course develops both.`,
    related: ["complexity-analysis-amortized-intro", "complexity-analysis-amortized-vs-average"],
  },
  {
    id: "mit6046-am-accounting-vs-charging",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Work through table doubling (and halving) with both the accounting method and the charging method — what's the key difference in how each assigns credit?",
    back: `**Accounting method** (table doubling, growing from size $m$ to $2m$ at cost $\\Theta(m)$): if an insertion doesn't trigger doubling, it stores a coin worth $c = O(1)$ for future use. If an insertion *does* trigger doubling, there must be $n/2$ elements inserted since the last doubling whose coins haven't been spent yet — use those $n/2$ saved coins to pay the $O(n)$ doubling cost. Amortized cost per insertion: $1 + c = O(1)$.

**Charging method** (same problem, forward-looking framing): when the table doubles from $m$ to $2m$, **retroactively charge** $\\Theta(m)$ cost to the $m/2$ insert operations that happened since the last doubling — each insert is charged $\\Theta(1)$, and (crucially) **will not be charged again**. Amortized cost per insert is again $\\Theta(1)$.

**Extending to table halving** (shrinking when the table becomes sparse, to save space when deletes dominate): shrink from $m$ to $m/2$ once $n$ drops to $m/4$, at cost $\\Theta(m)$ — this keeps the table at least half full after *any* resize (growth or shrink), avoiding the alternating-insert-delete thrashing problem. Each doubling still has $\\geq m/2$ insertions to charge to, and each halving has $\\geq m/4$ deletions to charge to, so the amortized cost per insert *or* delete remains $\\Theta(1)$.

**The key structural difference**: the accounting method's coins are *saved forward in time* by cheap operations, to be *spent* later by an expensive one — a prepayment model. The charging method instead lets the expensive operation reach *backward in time* and retroactively bill past operations — a postpayment model. Both produce the identical $O(1)$ bound here; which framing is more natural depends on whether it's easier to reason about "who should save up" (accounting) or "who caused this cost" (charging) for a given data structure.`,
    pitfall:
      "In the accounting method, once a coin is used to pay for a doubling, it's gone — you can't 'double-spend' the same n/2 coins to justify a later doubling. The charging method has the analogous rule: 'will not be charged again' is what prevents an insertion from being billed for every subsequent resize forever.",
    related: ["mit6046-am-four-methods-overview", "mit6046-am-potential-method"],
  },
  {
    id: "mit6046-am-potential-method",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Work through the potential-method analysis of incrementing a binary counter — what potential function makes the amortized cost O(1), and why must Φ(initial) = 0?",
    back: `**Binary counter increment**: flipping a bit string like $0011010111 \\to 0011011000$ costs $\\Theta(1 + \\#1)$, where $\\#1$ is the number of **trailing 1-bits** that must flip to 0 (plus one bit flipping $0 \\to 1$) — worst case $\\Theta(\\log n)$ per increment (all bits are 1), but intuitively "1 bits are bad" and get cleared out, suggesting an amortized bound much better than the worst case.

**Potential function**: define $\\Phi = c \\cdot \\#1$ (a constant $c$ times the current number of 1-bits). An increment that flips $k$ trailing 1s to 0 and one 0 to 1 changes the bit count by $\\Delta(\\#1) = -k + 1$, so $\\Delta\\Phi = c(-k+1) = c(1 - \\#1_{\\text{flipped}})$ using the same $k = \\#1_{\\text{flipped}}$ from the actual cost:
$$\\text{amortized cost} = \\text{actual cost} + \\Delta\\Phi = \\Theta(1 + k) + c(1 - k) = \\Theta(1)$$
for large enough $c$ — the $k$ terms cancel, leaving a constant. Intuitively: $\\Phi$ measures "stored badness" (1-bits), and clearing a 1-bit both costs $\\Theta(1)$ actual work *and* decreases $\\Phi$ by $c$, exactly offsetting.

**Why $\\Phi(\\text{initial}) = 0$ matters**: the amortized-bound guarantee $\\sum \\text{amortized} \\geq \\sum \\text{actual}$ only holds if $\\Phi$ **never drops below** its initial value at any point in the sequence (intuitively, "the bank account can't go negative" — you can't have amortized-saved more than you've actually paid). If the counter starts at $000\\cdots0$, $\\Phi = 0$ initially and $\\Phi \\geq 0$ always (it's a bit count), so the bound holds throughout. Starting from a nonzero initial value would make $\\Phi(\\text{initial}) > 0$, and later configurations could in principle have *smaller* $\\Phi$ than that starting point, breaking the guarantee.`,
    pitfall:
      "The potential function's validity depends on Φ never going below Φ(initial) at ANY point during execution, not just at the end — a Φ that dips negative partway through a sequence (even if it recovers later) invalidates the amortized bound for prefixes of that sequence.",
    related: ["mit6046-am-four-methods-overview", "mit6046-am-tree-splits-merges"],
  },
  {
    id: "mit6046-am-tree-splits-merges",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Using the potential method, show insert has O(1) amortized splits in a 2-3 tree — and why does this NOT extend to giving both insert and delete O(1) amortized cost simultaneously, until switching to a 2-5 tree?",
    back: `**2-3 trees**: a split happens specifically when inserting into a **3-node** (a node with 3 children) — it must split into two 2-nodes, potentially cascading a split up to the parent. Define $\\Phi = $ the number of 3-nodes in the tree. Each split converts one 3-node into two 2-nodes (removing one 3-node from the count, i.e. $\\Delta\\Phi \\leq -1$ per split — though a split might also *create* a new 3-node one level up if the promoted key lands in an already-full parent, giving $\\Delta\\Phi \\leq 1 - \\#\\text{splits}$ overall for a single insert's cascade). So $\\text{amortized splits} = \\text{actual splits} + \\Delta\\Phi \\leq 1$ — $O(1)$ amortized splits per insert, with $\\Phi(\\text{initial}) = 0$ for an empty tree. (This argument generalizes directly to any $(a,b)$-tree, defining $\\Phi$ as the count of $b$-nodes — the "about-to-overflow" node type for that tree's branching factor.)

**Why this doesn't extend to insert AND delete simultaneously in a 2-3 tree**: a **merge** (triggered by deleting from a 2-node, which must combine with a sibling) produces a 3-node — but 3-nodes are exactly the "bad" (potential-increasing) nodes the split analysis was built around. In the worst case, an adversarial alternating sequence of inserts and deletes can repeatedly create a 3-node via merge, then immediately split it again on the next insert, and so on — there's no way to charge both operation types against a single potential function without one undoing the other's guarantee.

**The fix — 2-5 trees**: allow nodes with up to 5 children. Insertion into a **5-node** splits it into two **3-nodes** (not two 2-nodes) — crucially, 3-nodes are no longer "bad" in a 2-5 tree, since only 2-nodes and 5-nodes are extremal. Deletion from a **2-node** demotes a key from its parent and merges into a 3-node — also not "bad." Defining $\\Phi = \\#\\text{5-nodes} + \\#\\text{2-nodes}$ (the two extremal, "about-to-need-fixing" node types), both amortized splits (from insert) and amortized merges (from delete) come out to $O(1)$ **simultaneously** — because the byproduct of a split (a 3-node) and the byproduct of a merge (also effectively a 3-node) are both potential-*neutral*, not potential-*increasing* the way a 2-3 tree's merge-produces-3-node interaction was. This generalizes to any $(a,b)$-tree with $b > 2a$: the gap between the minimum and maximum branching factor being large enough is exactly what prevents a split/merge byproduct from immediately being "bad" again.`,
    pitfall:
      "The 2-3 tree problem isn't that deletion itself is expensive — a single merge is O(1) actual cost, same as a split. The problem is specifically that repeated insert/delete pairs can be adversarially sequenced to trigger a split immediately followed by a merge immediately followed by a split, forever, with no way to amortize both directions against the same potential function.",
    related: ["mit6046-am-potential-method"],
  },
  {
    id: "mit6046-am-freivalds-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does Freivalds' algorithm check A×B = C in O(n²) time (versus O(n³) for the multiplication itself), and walk through the probability-1/2 correctness proof.",
    back: `Given $n \\times n$ matrices $A, B, C$ (entries in $\\{0,1\\}$, arithmetic mod 2), checking $A \\times B = C$ by actually computing $A \\times B$ costs at least as much as matrix multiplication itself ($O(n^3)$ naively, or $O(n^{2.376})$ with the best known algorithms). **Freivalds' algorithm** checks it in $O(n^2)$ — a genuine asymptotic improvement — using randomness, as a **Monte Carlo algorithm** (always runs in the stated time bound; the *answer* is correct with high probability, rather than being guaranteed correct but with variable running time, which is the Las Vegas alternative).

**Algorithm**: choose a random binary vector $r[1..n]$, each bit independently $\\Pr[r_i=1] = \\frac{1}{2}$. Output "YES" ($A \\times B = C$) if $A(Br) = Cr$, else "NO." This costs $O(n^2)$: computing $Br$, then $A(Br)$, then $Cr$, are each a matrix-vector product ($n \\times n$ times $n \\times 1$), not a full matrix-matrix product.

**Correctness if $AB = C$**: trivially $A(Br) = (AB)r = Cr$ always — no false "NO" ever occurs.

**Correctness if $AB \\neq C$ — $\\Pr[ABr \\neq Cr] \\geq \\frac{1}{2}$**: let $D = AB - C \\neq 0$, so some entry $d_{ij} \\neq 0$. Fix vector $v$ with $v_j = 1$ and 0 elsewhere; then $(Dv)_i = d_{ij} \\neq 0$, so $Dv \\neq 0$. Suppose (for contradiction, restricted to the "bad" case) $Dr = 0$ for the algorithm's random $r$; consider $r' = r + v$. Since $v$ is 0 everywhere except position $j$: $Dr' = D(r+v) = Dr + Dv = 0 + Dv \\neq 0$. Moreover $r \\mapsto r' = r+v$ is a **bijection** on the space of random vectors (its own inverse, since $v+v=0$ mod 2) — so it pairs up every "bad" $r$ (where $Dr=0$) with a distinct "good" $r'$ (where $Dr' \\neq 0$), giving $\\#\\{r' : Dr'\\neq 0\\} \\geq \\#\\{r : Dr = 0\\}$, hence $\\Pr[Dr \\neq 0] \\geq \\frac{1}{2}$.

Running the check $k$ independent times and requiring all $k$ to say "YES" drives the false-positive probability down to $2^{-k}$ — the standard Monte Carlo amplification-by-repetition trick.`,
    pitfall:
      "The bijection argument (r ↔ r+v) is what makes 'at least half the r's are bad for D' a clean counting fact rather than a probabilistic heuristic — it's a purely combinatorial pairing, not an appeal to D's structure being 'random-like.'",
    related: ["recursion-dc-las-vegas-vs-monte-carlo", "mit6046-am-randomized-quicksort-paranoid"],
  },
  {
    id: "mit6046-am-randomized-quicksort-paranoid",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the recursion-tree analysis proving 'paranoid' randomized quicksort runs in O(n log n) expected time on every input.",
    back: `Plain quicksort pivoting on a fixed position (first or last element) is $\\Theta(n^2)$ worst case (sorted or reverse-sorted input repeatedly creates a 0-vs-$(n{-}1)$ split). **"Paranoid" quicksort**: repeatedly pick a **random** pivot and partition, but **re-pick and re-partition** if the resulting split isn't good enough — specifically, repeat until $|L| \\leq \\frac{3}{4}|A|$ and $|G| \\leq \\frac{3}{4}|A|$ — then recurse on $L$ and $G$.

**Good vs. bad pivot**: a pivot is "**good**" if both resulting sides have size $\\leq \\frac{3}{4}n$ — by the array's rank distribution, this happens whenever the pivot's rank falls in the middle half of the array (ranks between $n/4$ and $3n/4$), which is **half** the array by size, so $\\Pr[\\text{good pivot}] > \\frac{1}{2}$ for a uniformly random choice.

**Recursion-tree bookkeeping**: let $T(n)$ upper-bound the expected running time on any size-$n$ array, and let $cn$ be the cost of one partition attempt. $T(n)$ decomposes into: the cost of sorting the (good-pivot-guaranteed) left and right subarrays, plus the expected number of partition *attempts* needed to get a good split, times $cn$ per attempt. Since a "good" outcome occurs with probability $> \\frac{1}{2}$ each independent trial, the **expected number of attempts is $\\leq 2$** (geometric distribution with success probability $> 1/2$) — giving:
$$T(n) \\leq T\\left(\\frac{n}{4}\\right) + T\\left(\\frac{3n}{4}\\right) + 2cn$$
(worst-case-sized good split: $n/4$ and $3n/4$, the most unbalanced a "good" split is allowed to be). Unlike the earlier median-based deterministic pivot selection (which is provably $O(n\\log n)$ but empirically slow, losing to mergesort in practice), this randomized version achieves the same asymptotic guarantee with much lower constant overhead.

**Solving the recurrence via the recursion tree**: at every level, the total work summed across all nodes at that level is exactly $2cn$ (since each node's cost is proportional to its own subarray size, and sibling subarray sizes at a level sum to $\\leq n$ along any root-to-leaf accounting, generalized across the whole level). The tree's height is bounded by $\\log_{4/3}(2cn)$ — the number of times $n$ can be multiplied by $\\frac{3}{4}$ (the *worse* branch of a good split) before reaching a base case. Multiplying per-level work ($2cn$) by the height ($O(\\log n)$) gives $T(n) = \\Theta(n\\log n)$ **expected** time — for *every* input, not just "on average over random inputs" the way basic quicksort's good practical behavior is usually described.`,
    pitfall:
      "The O(n log n) guarantee here is for EVERY fixed input array — the randomness is in the algorithm's own coin flips (pivot choice), not an assumption about the input's distribution. This is the crucial distinction between 'randomized algorithm, guaranteed expected bound on any input' and 'deterministic algorithm, good average-case bound assuming random input' (which basic quicksort only has).",
    related: ["mit6046-am-freivalds-algorithm", "recursion-dc-las-vegas-vs-monte-carlo"],
  },
  {
    id: "mit6046-am-skip-list-motivation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the 'express and local subway lines' analogy motivate the log n-linked-list structure that a skip list approximates, and what's the optimal number of express-line nodes?",
    back: `Start from a single sorted linked list: search costs $\\Theta(n)$ worst case. Add a **second**, sparser linked list $L_1$ (a subset of nodes from the full list $L_2$) with links between corresponding nodes at shared stations — like an express subway line skipping over stops a local line stops at. $\\text{Search}(x)$: walk right in $L_1$ until going further would overshoot $x$, drop down to $L_2$ at that point, then walk right in $L_2$ to finish.

**Optimal size for $L_1$**: search cost is roughly $|L_1| + \\frac{|L_2|}{|L_1|}$ (cost of traversing the express line, plus cost of the local segment between two consecutive express stops). Minimizing this (by AM-GM, or calculus) occurs when the two terms are equal: $|L_1| = \\frac{|L_2|}{|L_1|} \\Rightarrow |L_1|^2 = |L_2| = n \\Rightarrow |L_1| = \\sqrt{n}$, giving total search cost $2\\sqrt{n}$.

**Generalizing to $k$ lists**: the same balancing argument extended to $k$ nested levels gives cost $k \\cdot \\sqrt[k]{n}$ — minimized as $k$ grows, bottoming out at $k = \\log n$ levels, giving cost $\\log n \\cdot \\sqrt[\\log n]{n} = \\log n \\cdot 2 = 2\\log n$ (since $n^{1/\\log n} = 2$). A **$\\log n$-linked-list structure** is exactly this ideal — and it's structurally a binary tree in disguise (in fact, a level-linked B$^+$-tree): each level halves the number of "stations" relative to the level below, exactly like the levels of a balanced binary search tree, but realized as parallel linked lists with vertical connections rather than a single tree of pointers.

**The gap this motivates**: this ideal $\\log n$-list structure gives $O(\\log n)$ search — but it's a *static* structure (built once, sizes fixed at each level). A **skip list** (introduced next) is precisely a way to *maintain* roughly this same layered structure dynamically, under insertions and deletions, using **randomized** level assignment instead of a fixed, carefully-spaced layout — see the related cards on skip list structure/operations already covered generically, and the with-high-probability analysis of why the randomized version still achieves the ideal's $O(\\log n)$ bound.`,
    related: ["persistent-structures-skip-list-structure", "mit6046-am-skip-list-whp-analysis"],
  },
  {
    id: "mit6046-am-skip-list-whp-analysis",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the formal 'with high probability' (w.h.p.) definition, and sketch the backward-analysis proof that skip-list search costs O(log n) w.h.p. (not just in expectation).",
    back: `**With high probability (w.h.p.)**, informally: event $E$ occurs w.h.p. if, for **any** $\\alpha \\geq 1$, there's an appropriate choice of constants making $E$ occur with probability at least $1 - O(1/n^\\alpha)$ — a much stronger guarantee than "expected," since the failure probability can be driven *polynomially* small, not just kept bounded on average. **Boole's inequality / union bound**: for any events $E_1,\\ldots,E_k$, $\\Pr[E_1 \\cup \\cdots \\cup E_k] \\leq \\sum \\Pr[E_i]$ — critically, if $k = n^{O(1)}$ and each $E_i$ individually occurs w.h.p. (i.e. fails with probability $O(1/n^\\alpha)$ for large enough $\\alpha$), then $E_1 \\cap \\cdots \\cap E_k$ *also* occurs w.h.p. (the $k$ failure probabilities, summed, are still polynomially small) — this is what licenses combining many individually-w.h.p. events into one overall w.h.p. guarantee, used constantly in randomized-algorithm analysis.

**Lemma — w.h.p., an $n$-element skip list has $O(\\log n)$ levels**: the probability of having *more* than $c\\log n$ levels is (by the union bound over all $n$ elements) at most $n \\cdot \\Pr[\\text{one element promoted} \\geq c\\log n \\text{ times}] = n \\cdot (1/2)^{c\\log n} = n \\cdot n^{-c} = n^{-(c-1)}$ — polynomially small, hence w.h.p., for any desired exponent by choosing $c$ large enough.

**Theorem — w.h.p., every search costs $O(\\log n)$**: the "cool idea" is to analyze the search path **backwards**, from the leaf reached up to the root (or $-\\infty$) rather than forwards. At each node along this reversed path: if the node was *not* promoted higher (a coin-flip "tails"), the reversed walk moves **left**; if it *was* promoted (a "heads"), the reversed walk moves **up**. The walk terminates (reaches the root) once it's made enough "heads" moves to exhaust the actual number of levels. So the number of "up" moves in the reversed walk is exactly the number of coin flips needed to see $c\\log n$ heads — bounded, w.h.p., by the number-of-levels lemma above. Combined with a **Chernoff bound** (governing how tightly a sum of independent coin flips concentrates around its expectation — see related card), the total number of moves (up + left) is $O(\\log n)$ w.h.p., not merely in expectation.`,
    pitfall:
      "'Expected O(log n)' and 'O(log n) with high probability' are different, non-interchangeable guarantees — w.h.p. bounds the *tail* of the distribution (how unlikely a bad outcome is), which expectation alone says nothing about; a distribution can have small expectation while still having a non-negligible chance of a much larger value.",
    related: ["mit6046-am-skip-list-motivation", "persistent-structures-skip-list-operations"],
  },
  {
    id: "mit6046-am-universal-hashing-theorem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a universal hashing family precisely, and prove the resulting collision-count bound E[# keys colliding in a slot] ≤ 1 + α.",
    back: `Hashing with chaining under the **simple uniform hashing** assumption ($\\Pr[h(k_1)=h(k_2)] = \\frac{1}{m}$ for $k_1 \\neq k_2$) gives $\\Theta(1+\\alpha)$ expected time per operation ($\\alpha = n/m$, the load factor) — but this assumption is unreasonable to just *posit* about a fixed hash function $h$ against arbitrary input keys (an adversary who knows $h$ can always construct a worst-case key set that collides constantly, exactly the same vulnerability randomized quicksort's "paranoid" pivoting was designed to sidestep).

**The fix**: instead of assuming a fixed $h$ behaves randomly on adversarial input, **choose $h$ randomly** from a family $\\mathcal{H}$ satisfying: $\\Pr_{h \\in \\mathcal{H}}\\{h(k) = h(k')\\} \\leq \\frac{1}{m}$ for **all** $k \\neq k'$ — a **universal hashing family**. Now no assumption about the input keys is needed at all (they can be entirely adversarial and fixed in advance); only the algorithm's own internal coin flips (which $h \\in \\mathcal{H}$ gets picked) are random.

**Theorem**: for $n$ arbitrary distinct keys and random $h \\in \\mathcal{H}$ (universal), $E[\\#\\text{keys colliding in a slot}] \\leq 1 + \\alpha$. *Proof*: for keys $k_1,\\ldots,k_n$, let $I_{i,j} = 1$ if $h(k_i)=h(k_j)$, else 0. $E[I_{i,j}] = \\Pr\\{h(k_i)=h(k_j)\\} \\leq \\frac{1}{m}$ for $j \\neq i$ (by the universal-family property), and $E[I_{i,i}]=1$ trivially. By **linearity of expectation**:
$$E[\\#\\text{keys hashing to } k_i\\text{'s slot}] = E\\left[\\sum_{j=1}^n I_{i,j}\\right] = \\sum_{j \\neq i} E[I_{i,j}] + E[I_{i,i}] \\leq \\frac{n}{m} + 1 = 1 + \\alpha$$
Since this holds for every $k_i$, Insert/Delete/Search all take $O(1+\\alpha)$ expected time — the *same* asymptotic guarantee as simple uniform hashing, but resting on a genuinely defensible assumption (randomness the algorithm controls, not randomness assumed about an adversary's input).`,
    pitfall:
      "Universal hashing's guarantee is over the algorithm's own random choice of h — it does NOT require or assume anything about how the input keys were generated. Conflating this with 'assume keys are random' reintroduces exactly the unjustified assumption universal hashing was built to eliminate.",
    related: ["hashing-load-factor", "hashing-separate-chaining", "mit6046-am-dot-product-hash-family"],
  },
  {
    id: "mit6046-am-dot-product-hash-family",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why is the family of ALL hash functions technically universal but useless, and how does the dot-product hash family fix this while staying provably universal?",
    back: `$\\mathcal{H} = \\{\\text{all functions } h: \\{0,\\ldots,u{-}1\\} \\to \\{0,\\ldots,m{-}1\\}\\}$ is trivially universal (a uniformly random function from this family satisfies the collision bound by definition) — but it's **useless in practice**: storing a single such $h$ requires $\\log(m^u) = u\\log m$ bits (astronomically more than the $n \\ll u$ keys actually being hashed), and even writing it down requires $\\Omega(u)$ precomputation.

**Dot-product hash family** — a genuinely practical universal family: assume $m$ is prime and $u = m^r$ for integer $r$ (round up in practice to satisfy this). View a key $k$ in base $m$: $k = \\langle k_0,\\ldots,k_{r-1}\\rangle$. For any "seed" vector $a = \\langle a_0,\\ldots,a_{r-1}\\rangle$ with $a_i \\in \\{0,\\ldots,m{-}1\\}$, define $h_a(k) = a \\cdot k \\bmod m = \\sum_i a_i k_i \\bmod m$. Then $\\mathcal{H} = \\{h_a \\mid a \\in \\{0,\\ldots,u-1\\}\\}$. Storing $h_a$ needs just the single value $a$ — one machine word (in the Word-RAM model) — and computing $h_a(k)$ takes $O(1)$ time (a constant number of word operations, since $r = O(1)$ for keys that fit in a machine word).

**Proof of universality**: take any $k \\neq k'$; they differ in some digit, say $k_d \\neq k'_d$. The event $h_a(k) = h_a(k')$ becomes (after canceling the shared terms $i \\neq d$) a linear equation solving for $a_d$ in terms of the other coordinates $a_{\\text{not }d}$: $a_d \\equiv -(k_d - k'_d)^{-1}\\sum_{i\\neq d} a_i(k_i - k'_i) \\pmod m$ — this uses that $m$ is prime, so $(k_d-k'_d)^{-1} \\bmod m$ exists (every nonzero residue has a multiplicative inverse mod a prime). For **any** fixed choice of $a_{\\text{not }d}$, this equation pins down **exactly one** value of $a_d$ (out of $m$ equally likely choices) that causes a collision — so $\\Pr_a\\{h_a(k)=h_a(k')\\} = \\frac{1}{m}$ exactly, satisfying the universal-family bound with equality.`,
    pitfall:
      "The proof crucially needs m prime — without a prime modulus, (k_d - k'_d) might not have a multiplicative inverse mod m, and the 'exactly one bad value of a_d' argument breaks down, potentially allowing a higher collision probability than 1/m for some key pairs.",
    related: ["mit6046-am-universal-hashing-theorem", "number-theory-modular-inverse"],
  },
  {
    id: "mit6046-am-perfect-hashing-fks",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Outline the Fredman-Komlós-Szemerédi (FKS) two-level perfect hashing construction, and explain how it achieves worst-case O(1) search despite hashing being fundamentally probabilistic.",
    back: `**Static dictionary problem**: given $n$ keys fixed in advance (no future inserts/deletes — only Search), can lookup be made **worst-case** $O(1)$, not just expected? **Perfect hashing** (Fredman, Komlós, Szemerédi 1984) achieves: polynomial build time **with high probability**, $O(1)$ search **in the worst case**, and $O(n)$ space **in the worst case** — the search-time guarantee is unconditional, even though *building* the structure is randomized.

**Idea — two-level hashing**: **Step 1**: pick $h_1$ from a universal family, $h_1: \\{0,\\ldots,u{-}1\\} \\to \\{0,\\ldots,m{-}1\\}$ with $m = \\Theta(n)$; hash all $n$ keys with chaining under $h_1$. **Step 2**: for each slot $j$ with $l_j$ items landing in it, pick a **second-level** hash function $h_{2,j}$ from a universal family mapping into a table of size $m_j = O(l_j^2)$ — replace slot $j$'s chain with hashing-with-chaining using $h_{2,j}$ into this larger (quadratic-in-$l_j$) second-level table.

**Why $O(l_j^2)$ eliminates second-level collisions entirely**: the universal-family collision-count theorem, applied with $m_j = \\Theta(l_j^2)$, makes the *expected* number of colliding pairs within slot $j$'s second-level table less than $\\binom{l_j}{2} \\cdot \\frac{1}{l_j^2} < \\frac{1}{2}$ — so a random $h_{2,j}$ has better than even odds of producing **zero** collisions; repeatedly re-picking $h_{2,j}$ (a "coin flip" with success probability $> \\frac{1}{2}$ each trial) finds a collision-free one after $O(1)$ expected tries, $O(\\log n)$ tries w.h.p. (via the same geometric-distribution machinery as randomized quicksort and skip-list-level bounds). With **zero** second-level collisions guaranteed, search is a single direct lookup — genuinely $O(1)$ worst case, no chain-walking at all.

**Keeping total space $O(n)$**: naive $\\sum_j O(l_j^2)$ second-level space could blow up if $h_1$ happens to cluster many keys into few first-level slots — an extra **Step 1.5** re-picks $h_1$ entirely (and redoes Step 1) if $\\sum_j l_j^2 > cn$ for a suitable constant $c$; by a **Markov inequality** argument (using $E[\\sum_j l_j^2] = O(n)$, itself proved via the same linearity-of-expectation technique as the collision theorem), this "bad" event also has probability $\\leq \\frac{1}{2}$, so $O(1)$ expected retries suffice here too. Combining both levels of retries (each $O(\\log n)$ attempts w.h.p., each attempt costing $O(n)$ or $O(\\log n)$ work depending on the level), the **total build time is $O(n\\log^2 n)$ with high probability** — polynomial, randomized, but the resulting structure's search time is a hard worst-case guarantee independent of any luck in the construction.`,
    pitfall:
      "The randomness in FKS hashing is confined entirely to the *build* phase — once built, every search is a deterministic O(1) lookup with no probability involved at all. This is different from ordinary hashing-with-chaining, where even after construction, individual searches still have expected (not worst-case) cost.",
    related: ["mit6046-am-universal-hashing-theorem", "hashing-load-factor"],
  },
];
