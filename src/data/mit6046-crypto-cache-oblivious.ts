// MIT 6.046J / 18.410J (Spring 2015) — Lectures 21-24: cryptographic hash
// functions, encryption (with a Diffie-Hellman MITM attack and the Merkle-
// Hellman knapsack cryptosystem's rise and fall), and cache-oblivious
// algorithms (memory hierarchy, cache-oblivious scanning/median-finding/
// matrix multiplication, LRU competitiveness, the van Emde Boas memory
// layout, and cache-oblivious sorting). RSA and Diffie-Hellman's own
// mechanics are already covered in depth in the mit6045 track, so those
// cards cross-link rather than re-deriving them; cryptographic hash
// functions, the knapsack cryptosystem, and cache-oblivious algorithms have
// no equivalent anywhere else in the app. This is the final module of the
// mit6046 course — see src/data/courses.ts for the full 24-lecture map.
import type { Card } from "./types";

const MODULE = "mit6046-final";

export const mit6046CryptoCacheObliviousCards: Card[] = [
  {
    id: "mit6046-final-hash-function-properties",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the five desirable cryptographic hash function properties, and give concrete constructions showing why some don't imply others.",
    back: `A **cryptographic hash function** $h: \\{0,1\\}^* \\to \\{0,1\\}^d$ is deterministic, public (no secret key), and should "look random." The **random oracle model** idealizes this: an oracle $h$ that returns a fresh random value for every never-before-seen input, and replays its previous answer for repeated inputs — unachievable in practice (would need infinite storage), but a useful idealization for reasoning about real hash functions like SHA-256.

Five properties, in decreasing strength: (1) **one-way** (pre-image resistance): given $y$, hard to find $x$ with $h(x)=y$. (2) **strong collision-resistance**: hard to find *any* pair $x \\neq x'$ with $h(x)=h(x')$. (3) **weak collision-resistance** (2nd pre-image resistance): given $x$, hard to find a *different* $x'$ with $h(x)=h(x')$. (4) **pseudorandom**: behaves indistinguishably from a random oracle. (5) **non-malleable**: given $h(x)$, hard to produce $h(f(x))$ for any function $f$, without knowing $x$.

**Known implication**: strong collision-resistance $\\Rightarrow$ weak collision-resistance (trivially — finding *any* colliding pair is at least as easy as finding one for a *specific* given $x$). **Known non-implication, with an explicit counterexample**: one-way does **not** imply either collision-resistance property. Given some $h$ satisfying (1) and (2), construct $h'(a,b,x_2,\\ldots,x_n) = h((a\\oplus b), x_2,\\ldots,x_n)$ (one extra input bit, XORed away) — $h'$ remains one-way (inverting it is still as hard as inverting $h$), but is **not** weakly collision-resistant (flipping both $a$ and $b$ together always produces the identical output, an instant, free collision). Conversely, $h''(x) = 0\\|x$ if $|x|\\leq n$, else $1\\|h(x)$ — $h''$ is weakly collision-resistant for long inputs (inheriting $h$'s resistance) but is **not** one-way (short inputs are trivially invertible by just stripping the leading 0 bit).

**Generic attack bounds**: any hash function's collision resistance is bounded above by the **birthday paradox** — a collision can always be found in $O(2^{d/2})$ queries by random sampling (far fewer than the $O(2^d)$ naive brute force), and any pre-image can be inverted in $O(2^d)$. Real-world hash functions have historically fallen short even of their own design targets: MD4 and MD5 aimed for $2^{64}$ security but were broken using $2^6$ and $2^{37}$ inputs respectively; SHA-1 aimed for $2^{80}$ but has been shown (at least theoretically) to be no better than $2^{61}$.`,
    pitfall:
      "The birthday-paradox O(2^{d/2}) bound applies to collision resistance specifically — it's a fundamentally easier target than pre-image inversion (O(2^d)), which is why 'collision resistant to 2^64' and 'one-way to 2^64' require very different output lengths d to actually achieve in practice.",
    related: ["mit6045-crypto-one-way-functions", "mit6046-final-hash-applications"],
  },
  {
    id: "mit6046-final-hash-applications",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Walk through hash functions' four core security applications, and explain why plain h(x) fails as a cryptographic commitment scheme.",
    back: `**Password storage**: store $h(p)$ instead of the plaintext password $p$; authenticate by recomputing and comparing. Relies on **one-wayness** (property 1) — an adversary who steals the stored hash still can't recover $p$.

**File authenticity**: publish $h(F)$ for a large file $F$ in a trusted location; verify by recomputing $h(F)$ and comparing. Relies on **weak collision-resistance** (property 3) — an attacker who wants to substitute a tampered file $F'$ that hashes to the same value can't find one.

**Digital signatures**: hash functions let a signature scheme sign a short digest $h(m)$ instead of an entire long message $m$, while still cryptographically binding the signature to the message's exact content.

**Commitments**: in a sealed-bid auction, Alice wants to commit to a bid $x$ now but reveal it only later, without either (a) letting anyone learn $x$ before the reveal ("**hiding**") or (b) letting Alice later claim she bid something else ("**binding**"). The naive scheme $C(x) = h(x)$ is **not** secure for this: it needs more than the five basic properties above to guarantee secrecy, since a value like $h'(x) = h(x)\\,\\|\\,\\text{MSB}(x)$ (concatenating $h(x)$ with $x$'s most-significant bit) can satisfy properties 1, 2, and 5 while still leaking one bit of $x$ before the reveal — a commitment scheme needs to hide **everything** about $x$, not just resist inversion/collision/malleation of the *whole* value.

**The practical fix**: add explicit **randomness** to the commitment: $C(x) = h(r\\,\\|\\,x)$ for a fresh random $r \\in_R \\{0,1\\}^{256}$, generated fresh for each commitment. To reveal, disclose both $r$ and $x$ — a verifier recomputes $h(r\\|x)$ and checks it matches the earlier commitment. Binding still follows from collision-resistance (Alice can't find a different $(r',x')$ hashing to the same value); hiding now holds because the random $r$ prevents any structural leakage about $x$ analogous to the MSB-leaking counterexample — the randomness "drowns out" any partial information the bare hash of $x$ alone might have exposed.`,
    pitfall:
      "The five basic hash properties (one-way, collision-resistant, etc.) are necessary but not automatically sufficient for every cryptographic use — the commitment scheme is a concrete case where a hash satisfying all five properties can still fail the actual security goal (hiding), which is why the randomized construction is needed rather than just 'a good hash function.'",
    related: ["mit6046-final-hash-function-properties"],
  },
  {
    id: "mit6046-final-mitm-diffie-hellman",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a man-in-the-middle attack completely break unauthenticated Diffie-Hellman key exchange, and what does this reveal about what DH actually guarantees?",
    back: `Diffie-Hellman key exchange (already covered — see related card) guarantees that an eavesdropper who only **passively observes** the exchanged values $g^a \\bmod p$ and $g^b \\bmod p$ can't recover the shared secret $g^{ab} \\bmod p$ (assuming the Diffie-Hellman problem is hard). But this guarantee says nothing about an **active** attacker.

**The attack**: Eve positions herself between Alice and Bob, intercepting all messages. Alice, believing she's exchanging keys with Bob, actually completes a full DH exchange **with Eve** — Eve picks her own secret $e_1$, computes $g^{e_1}$, and sends it to Alice as if it came from Bob; Alice computes a shared key $k_A = g^{a \\cdot e_1}$ that she believes is shared with Bob but is actually shared with Eve. Simultaneously, Bob completes a *separate* full DH exchange with Eve (using a second secret $e_2$), believing he's talking to Alice — Bob computes $k_B = g^{b\\cdot e_2}$, again actually shared with Eve, not Alice. Eve now holds **both** $k_A$ and $k_B$, and can transparently relay (decrypting and re-encrypting) all subsequent traffic between Alice and Bob — reading and even modifying everything, while both endpoints believe they have a secure, private channel with each other.

**What this reveals**: Diffie-Hellman by itself only provides **key secrecy against passive eavesdropping** — it does *not* provide **authentication** (proof that you're really talking to who you think you are). The protocol has no mechanism for Alice to verify the values she receives genuinely originated from Bob rather than an impostor. Real-world protocols (like TLS) fix this by layering DH with a separate authentication mechanism — typically digital signatures backed by a certificate authority, so each party can cryptographically verify the other's identity *before* trusting the exchanged DH values, closing exactly the gap this attack exploits.`,
    pitfall:
      "This attack works even though the underlying Diffie-Hellman and discrete-log problems remain completely unbroken — the mathematics of DH is not what fails here. The vulnerability is architectural (no identity verification built into the base protocol), not cryptographic, which is exactly why the fix is adding an authentication layer rather than a stronger DH variant.",
    related: ["mit6045-crypto-diffie-hellman"],
  },
  {
    id: "mit6046-final-np-completeness-average-case-crypto",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does 'NP-complete' not automatically mean 'good for cryptography,' illustrated via graph 3-coloring's easy average-case behavior?",
    back: `NP-completeness (already covered in depth — see related cards) is fundamentally a **worst-case** notion: no polynomial-time algorithm solves *every* instance correctly. Cryptography instead needs problem instances that are hard **on average**, with parameters the cryptosystem designer actually controls — a subtly different, and often unrelated, requirement.

**Concrete illustration — graph 3-colorability**: deciding whether a graph can be properly 3-colored (adjacent vertices get different colors) is NP-complete in the worst case. But a simple **backtracking search** — order the vertices, traverse them in order, at each vertex assign the smallest color that doesn't conflict with already-colored neighbors, backtrack on failure — is **extremely fast on typical random graphs**: empirically, the average number of vertices visited stays under 197, **regardless of the total graph size** $t$. This isn't a fluke of the algorithm; it's a structural fact about *most* random graphs beyond a certain size: they simply aren't 3-colorable at all, so the backtracking search fails fast (runs out of colors early) rather than needing to explore deeply.

**Consequence for cryptography**: this is precisely why **most knapsack-based cryptosystems have failed** in practice (related card) — designers hoped NP-completeness of the general knapsack problem would translate into hard-to-break instances, but the specific instances their key-generation procedures produced turned out to have exploitable *average-case* structure, even though the general problem remains NP-complete. This is the same fundamental tension already identified in the 6.045 track (related card): $P \\neq NP$ is a claim about worst-case hardness, and cryptography's actual foundational need — hardness on the specific, structured instances a real system generates — simply doesn't follow from it. Choosing "an NP-complete problem" is not, by itself, a recipe for a secure cryptosystem; the instances actually produced must independently be shown hard on average, which is a much harder and more fragile property to establish (and to keep true as attacks improve).`,
    related: ["mit6045-crypto-worst-case-vs-average-case", "mit6046-final-merkle-hellman-knapsack", "np-completeness-p-vs-np"],
  },
  {
    id: "mit6046-final-merkle-hellman-knapsack",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the Merkle-Hellman knapsack cryptosystem's superincreasing-to-general transform with a numeric example, and explain why it was ultimately broken.",
    back: `**Superincreasing knapsack**: a sequence $w_1,\\ldots,w_n$ where each element exceeds the sum of all previous ones, $w_j \\geq \\sum_{i<j} w_i$ — this special structure makes the subset-sum problem (NP-complete in general) solvable in **linear time**: given target $S$, greedily check from the largest weight down, including $w_j$ iff $w_j \\leq$ remaining target.

**Merkle-Hellman transform** (private key $\\to$ public key): pick private superincreasing sequence, e.g. $\\{2,3,6,14,27,52\\}$, and two private integers $N, M$ with $\\gcd(N,M)=1$ and $M$ exceeding the sequence's total sum — e.g. $N=31, M=105$. Compute the **public key** by multiplying every private weight by $N$ and reducing mod $M$: $\\{2,3,6,14,27,52\\} \\to \\{62, 93, 81, 88, 102, 37\\}$ (e.g. $2\\times31=62$; $52\\times31=1612 \\equiv 37 \\pmod{105}$). The public sequence has lost its superincreasing structure (looks like a "hard," general knapsack instance) while secretly still being solvable — *if* you know $N, M$ and can undo the transform.

**Worked encryption/decryption**: encode message bits in blocks of 6 against the 6 public weights, e.g. blocks $011000, 110101, 101110$: sum the public weights at the 1-positions per block — $011000 \\to 93+81=174$; $110101 \\to 62+93+88+37=280$; $101110 \\to 62+81+88+102=333$. Ciphertext: $(174, 280, 333)$. **Decryption**: compute $N^{-1} \\bmod M$ (here $31^{-1} \\equiv 61 \\pmod{105}$), multiply each ciphertext value by it mod $M$ — $174 \\times 61 \\equiv 9 \\pmod{105}$ — this recovers the sum **in the private, superincreasing basis** ($9 = 3+6$), solvable by the fast greedy algorithm, correctly recovering $011000$; similarly $280\\times61\\equiv 70 = 2+3+13+52 \\to 110101$, and $333\\times61\\equiv 48=2+6+13+27\\to101110$.

**Why it's "beautiful but broken"**: **lattice basis reduction** techniques can efficiently solve knapsack instances of sufficiently low **density**, $d = \\frac{n}{\\max_i \\log_2 w_i}$ — and the Merkle-Hellman construction, by its very nature (multiplying by $N \\bmod M$ preserves the sequence's numeric scale relative to $n$), **always** produces low-density public knapsacks. So the exact structural property that made the scheme constructible (transforming an easy private problem into a public one) is also what made it universally vulnerable to a single class of attack — one of the clearest historical illustrations of the worst-case-vs-average-case gap (related card) actually playing out and breaking a real, once-celebrated cryptosystem.`,
    code: `# Superincreasing knapsack: fast greedy subset-sum solver
def solve_superincreasing(weights, target):
    result = []
    for w in reversed(weights):  # largest first
        if w <= target:
            result.append(w)
            target -= w
    return result  # empty target means success`,
    pitfall:
      "The public knapsack sequence's individual numbers can look arbitrary and 'hard' at a glance — the low-density vulnerability is a structural, global property of the whole sequence (relating n to the weights' bit-lengths), not something visible by inspecting any single weight, which is part of why the attack wasn't obvious until lattice-reduction techniques were specifically developed for this problem shape.",
    related: ["mit6046-final-np-completeness-average-case-crypto", "number-theory-modular-inverse"],
  },
  {
    id: "mit6046-final-cache-models",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Contrast the external-memory model and the cache-oblivious model of computation, and explain why the cache-oblivious restriction (not knowing B, M) is actually desirable.",
    back: `Every algorithm studied so far in this course implicitly treats all memory accesses as equal cost — but real computers have a **memory hierarchy** (L1/L2/L3 cache, main memory, disk), where each level is bigger but has higher latency, and data is moved in fixed-size **blocks** (not individual words) to amortize that latency — useful only if the algorithm exhibits **spatial locality** (uses everything in a fetched block) and **temporal locality** (reuses blocks already in cache).

**External-memory model**: an $O(1)$-size CPU, connected to a **cache** of total size $M$ (divided into $M/B$ blocks of $B$ words each), connected in turn to effectively infinite **memory/disk** (also divided into $B$-word blocks). Cache accesses are free; the algorithm **explicitly** reads/writes memory in blocks, and the cost metric is the number of **memory transfers** between cache and memory — with the algorithm *knowing* $B$ and $M$ and free to tune its behavior accordingly.

**Cache-oblivious model**: identical, except the algorithm does **not** know $B$ or $M$ — accessing any single word automatically fetches its entire containing block into cache, evicting the least-recently-used (LRU) block if the cache is full. Trivially, *every* algorithm is technically "a cache-oblivious algorithm" (since none can violate a constraint it doesn't know about) — the goal is finding ones that **minimize memory transfers** despite this ignorance.

**Why prefer not knowing $B,M$, rather than just tuning explicitly**: an algorithm that must be told $B$ and $M$ needs re-tuning (or at least re-compiling with different constants) for every different machine, and real systems have **multiple** cache levels simultaneously (L1, L2, L3, each with different $B,M$) — a cache-oblivious algorithm, by construction, automatically achieves good memory-transfer bounds **at every level of the hierarchy simultaneously**, with no explicit per-level tuning at all. This "auto-tuning" property, plus the fact that it forces genuinely more careful, transferable algorithm design, is why the cache-oblivious model became an active research area in its own right.`,
    related: ["mit6046-final-cache-scanning", "mit6046-final-cache-median-finding"],
  },
  {
    id: "mit6046-final-cache-scanning",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Why does a simple linear scan cost the same asymptotic number of memory transfers in both the external-memory and cache-oblivious models, up to a small additive constant?",
    back: `Consider the simplest possible program: iterate through array $A$ of $N$ elements, summing as you go (\`for i in range(N): sum += A[i]\`), with $A$ stored contiguously in memory.

**External-memory model**: since the algorithm knows $B$, it can explicitly **align** $A$'s starting address with a block boundary — reading it then costs exactly $\\lceil N/B \\rceil$ memory transfers (one per full block, with the array's own boundary contributing at most one partial-block read).

**Cache-oblivious model**: since the algorithm doesn't know $B$, it has **no control over alignment** — $A$'s start might fall anywhere within a block, potentially wasting one extra transfer at each end of the scan. This costs $\\lceil N/B\\rceil + 1 = N/B + O(1)$ memory transfers — asymptotically identical to the external-memory bound, just with a small constant-factor penalty from the alignment uncertainty. A constant number of such parallel scans (e.g. 2 or 3 arrays scanned in lockstep, as merge-based algorithms often need) still costs only $O(N/B+1)$ total — the "+1" penalty doesn't compound per scan, since each scan independently loses at most one block's worth of alignment slack.

**Why this matters as a baseline**: scanning's $\\Theta(N/B)$ cost (versus $\\Theta(N)$ if every access individually triggered a transfer) is the fundamental "locality wins" fact that every subsequent cache-oblivious algorithm in this lecture exploits and builds on — divide-and-conquer algorithms are specifically designed to reduce their combine/merge steps to sequences of scans precisely because scanning is this cheap, in both models, without any need for the algorithm to know $B$.`,
    pitfall:
      "The '+1' term isn't a rounding artifact you can ignore for large N — it's the concrete cost of the algorithm's ignorance of block boundaries, and it's exactly why cache-oblivious analyses always carry this additive constant through their recursions rather than silently dropping it, since in recursive algorithms with many small subproblems these +1 terms can accumulate to dominate the total cost if not accounted for carefully (see the median-finding base-case discussion, related card).",
    related: ["mit6046-final-cache-models", "mit6046-final-cache-median-finding"],
  },
  {
    id: "mit6046-final-cache-median-finding",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Re-derive the median-of-medians algorithm's memory-transfer recursion, and explain why choosing the base case MT(O(B)) = O(1) (not just MT(O(1)) = O(1)) is essential to getting the optimal bound.",
    back: `Recall the median-of-medians SELECT algorithm (already derived for ordinary time complexity — see related card): (1) partition into groups of 5, sort each group; (2) recursively find the median of the group medians; (3) partition the full array by that pivot; (4) recurse into the appropriate side.

**Memory-transfer analysis**: step 1 (grouping into 5s) is **free** conceptually, folded into the scan; sorting each $O(1)$-size group and collecting medians is one scan, $O(N/B+1)$. Step 2's recursive call operates on $N/5$ elements — after a scan-based pre-processing step that coalesces them into one consecutive array (needed so the recursive call itself gets a nicely laid-out sub-array), costing $MT(N/5)$. Step 3 (partitioning by the found pivot) is 3 parallel scans, $O(N/B+1)$. Step 4 recurses into a side of size at most $7N/10$ (the same fraction from the original correctness proof), costing $MT(7N/10)$. Total:
$$MT(N) = MT(N/5) + MT(7N/10) + O(N/B+1)$$

**Why the base case choice matters**: solving this recurrence with the "obvious" base case $MT(O(1)) = O(1)$ gives a working but **suboptimal** bound. Using the **stronger** base case $MT(O(B)) = O(1)$ instead — justified because an instance of size $O(B)$ fits within $O(1)$ memory blocks, so it costs only $O(1)$ transfers regardless of how many elements it internally contains — the recurrence solves to the **optimal** $MT(N) = O(N/B+1)$. Intuition: since $\\frac{1}{5}+\\frac{7}{10} = \\frac{9}{10} < 1$, the total problem size **shrinks geometrically** across recursive levels — meaning the *cost at the root* (the $O(N/B+1)$ term from the current level's scans) already dominates the entire recursion tree's total cost, so pushing the base case down to $O(B)$ instead of $O(1)$ avoids needlessly paying the constant-transfer cost of many tiny subproblems that could otherwise have been absorbed into a single already-in-cache chunk.

This "choose a base case sized to fit in $O(1)$ cache blocks, not just $O(1)$ elements" trick recurs throughout cache-oblivious algorithm design (matrix multiplication's own analysis, related card, uses the same idea at an even more refined level with $\\sqrt{M/3}$).`,
    pitfall:
      "Both base-case choices (MT(O(1))=O(1) and MT(O(B))=O(1)) are individually TRUE — the point isn't correctness, it's tightness. Using the weaker O(1)-element base case doesn't give a wrong answer, just a looser, non-matching-optimal bound; recognizing when a stronger, still-valid base case tightens the final result is a recurring skill in this style of analysis, not a correctness fix.",
    related: ["mit6046-dc-median-of-medians", "mit6046-final-cache-scanning", "mit6046-final-cache-blocked-matrix-multiply"],
  },
  {
    id: "mit6046-final-cache-blocked-matrix-multiply",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Derive the O(N³/B√M) memory-transfer bound for cache-oblivious blocked matrix multiplication, and explain why the base case √(M/3) is the key design choice.",
    back: `**Problem**: compute $Z = X \\cdot Y$ for $N\\times N$ matrices (using the ordinary $\\Theta(N^3)$ algorithm, not Strassen), with $X$ stored row-major and $Y$ column-major (to improve locality for the naive approach). **Naive cost**: computing a single output element needs one row-scan of $X$ and one column-scan of $Y$, each $O(N/B+1)$ — giving $O(N^3/B + N^2)$ total, since $N^2$ output elements each cost roughly $O(N/B+1)$.

**Blocked (recursive) algorithm**: split each $N\\times N$ matrix into four $(N/2)\\times(N/2)$ quadrants; compute $Z$'s four quadrants via the standard 8-multiplication, 4-addition block-matrix-multiplication formula (recursively multiplying quadrant pairs, then adding results) — crucially, each block must be stored **consecutively** in memory for this to have good locality. This gives the recurrence:
$$MT(N) = 8\\,MT(N/2) + O(N^2/B+1)$$
(8 recursive quadrant-multiplications, plus scan-based matrix addition for combining).

**Choosing the base case — three options, in increasing quality**: (1) weak, $MT(O(1))=O(1)$; (2) better, $MT(O(B))=O(1)$ (same idea as median-finding, related card); (3) **even better**, $MT(\\sqrt{M/3}) = O(M/B)$ — the insight: once each of the *three* matrices involved ($X$, $Y$, $Z$'s relevant quadrants) is small enough that all three fit into cache **simultaneously** ($3\\times$ a $\\sqrt{M/3}\\times\\sqrt{M/3}$ matrix $\\approx M$ total), the entire multiplication needs just **one** scan-load of all operands, costing $O(M/B)$ regardless of how much further computation happens purely inside the cache.

**Solving with base case (3)**: unlike the median-finding recursion (where cost shrinks geometrically toward the root), here the recursion tree's per-level cost **grows** geometrically going down: level 0 costs $N^2/B$, level 1 costs $8\\times(N/2)^2/B = 2N^2/B$, level 2 costs $8^2\\times(N/4)^2/B = 4N^2/B$, and so on — so the **leaves dominate** the total cost instead of the root. The tree has depth $O(\\lg(N/\\sqrt{M}))$ (shrinking from $N$ down to the $\\sqrt{M/3}$ base case), giving $8^{O(\\lg(N/\\sqrt{M}))} = O((N/\\sqrt{M})^3)$ leaves, each costing $O(M/B)$:
$$MT(N) = O(M/B) \\cdot O\\left((N/\\sqrt{M})^3\\right) = O\\left(\\frac{N^3}{B\\sqrt{M}}\\right)$$
— strictly better than the naive $O(N^3/B + N^2)$ bound whenever $M$ is reasonably large, and achieved with **no knowledge of $M$ or $B$** anywhere in the algorithm itself (the base case's optimality is a property discovered by the *analysis*, not something the code checks or branches on).`,
    pitfall:
      "This recursion's cost is dominated by the LEAVES (cost grows going down the tree), the opposite of the median-finding recursion where cost is dominated by the ROOT (cost shrinks going down) — using the wrong domination direction when summing a recursion tree's levels is a common analysis mistake, and here it specifically arises because 8 recursive calls (branching factor 8) outpaces the (N/2)² per-call cost shrinkage (factor 4), unlike median-finding's more favorable branching.",
    related: ["mit6046-final-cache-median-finding", "recursion-dc-strassen"],
  },
  {
    id: "mit6046-final-lru-competitiveness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the Sleater-Tarjan theorem bounding LRU's cache-miss competitiveness against the optimal offline replacement strategy, and sketch its proof.",
    back: `The cache-oblivious model's automatic block-eviction policy (related card) uses **LRU** (least-recently-used) specifically — a natural question is how much worse LRU can be compared to $OPT$, the theoretically optimal (but requires knowing the future) replacement strategy.

**Theorem** (Sleator & Tarjan, 1985): $LRU_M \\leq 2 \\cdot OPT_{M/2}$ — the number of cache misses LRU incurs with cache size $M$ is at most **twice** the number of misses the optimal offline algorithm would incur with **half** the cache size, $M/2$. This is a form of "resource augmentation" competitiveness result: LRU running with a somewhat bigger cache is never much worse than the best possible strategy running with a smaller one.

**Proof sketch**: partition the sequence of block accesses into maximal **phases**, each phase being the longest run of accesses touching at most $M/B$ **distinct** blocks (i.e., a phase boundary occurs right when a new, $(M/B+1)$-th distinct block would need to be accessed). Within any single phase, **LRU incurs at most $M/B$ misses** — since a phase touches at most $M/B$ distinct blocks by construction, and LRU (with a cache of exactly $M/B$ block-slots) can miss at most once per distinct block within the phase (afterward it stays cached, since nothing gets evicted until $M/B+1$ distinct blocks are competing).

Meanwhile, $OPT$ running with **half** the cache ($M/2$, i.e. $M/(2B)$ slots) must incur **at least** $\\frac{M/B}{2}$ misses per phase: even in the best case, $OPT$ starts a phase with its entire smaller cache already holding exactly the blocks it'll need — but the phase (by construction) touches $M/B$ distinct blocks while $OPT$'s cache holds only $M/(2B)$ slots, so at least half the phase's distinct-block accesses must be misses no matter how cleverly $OPT$ plays.

Combining: in every phase, $LRU$'s miss count ($\\leq M/B$) is at most twice $OPT_{M/2}$'s miss count ($\\geq \\frac{1}{2}\\cdot M/B$) — and since this ratio holds phase-by-phase, it holds summed over the whole access sequence, giving $LRU_M \\leq 2\\cdot OPT_{M/2}$ overall. This theorem is exactly what justifies LRU as *the* eviction policy baked into the cache-oblivious model's definition — it's provably close to optimal, without needing to know the future access pattern.`,
    pitfall:
      "The bound compares LRU at cache size M against OPT at the SMALLER size M/2, not against OPT at the same size M — this asymmetric comparison (resource augmentation) is what makes the theorem provable at all; LRU can in fact be arbitrarily worse than OPT running with the exact same cache size on adversarial access patterns.",
    related: ["mit6046-final-cache-models"],
  },
  {
    id: "mit6046-final-veb-layout-cache-oblivious-search",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the van Emde Boas memory layout achieve O(log_B N) cache-oblivious BST search, and how does the recursive splitting technique parallel blocked matrix multiplication?",
    back: `**Motivation**: ordinary binary search on a sorted array costs $\\Theta(\\log N - \\log B) = \\Theta(\\log(N/B))$ memory transfers cache-obliviously (each comparison roughly halves the remaining range, but only once the range shrinks below $B$ do accesses start hitting the *same* cached block repeatedly) — asymptotically **slower** than the $O(\\log_B N)$ a B-tree achieves (since $\\log(N/B) = \\log N - \\log B$ while $\\log_B N = \\frac{\\log N}{\\log B}$, and the latter is much smaller for large $B$). But B-trees need to **know** $B$ to size their nodes correctly — not cache-oblivious.

**Van Emde Boas layout** (Prokop, 1999) — a way to store an **ordinary balanced BST** in memory achieving B-tree-like performance without knowing $B$: take a complete BST of $N$ elements, height $\\lg N$; conceptually **cut it at the middle level of edges** (height $\\frac{1}{2}\\lg N$ from the top), splitting it into one top subtree of height $\\frac{1}{2}\\lg N$ and $\\sqrt{N}$ bottom subtrees, each also of height $\\frac{1}{2}\\lg N$ (hence each of size $\\sqrt{N}$). **Recursively** lay out each of these $\\sqrt{N}+1$ pieces the same way, then **concatenate** them in memory — as with cache-oblivious blocked matrix multiplication (related card), the specific memory *order* of the pieces doesn't matter; only that each piece individually occupies a **consecutive** memory region.

**Analysis of BST search cost**: consider the recursive level of refinement at which pieces first shrink to $\\leq B$ nodes — since each level of the recursive split exactly halves the height (hence roughly square-roots the size), a piece's height at this level lies between $\\frac{1}{2}\\lg B$ and $\\lg B$, so its size is between $\\sqrt{B}$ and $B$. Any root-to-leaf search path therefore passes through at most $\\frac{\\lg N}{\\frac{1}{2}\\lg B} = 2\\log_B N$ such $\\leq B$-sized pieces — and since each piece, being $\\leq B$ elements stored consecutively, occupies at most 2 memory blocks (accounting for alignment), the total search cost is $\\leq 4\\log_B N = O(\\log_B N)$ memory transfers, **matching the B-tree bound** while genuinely not knowing $B$ anywhere in the layout or search code. This generalizes to non-power-of-2 heights and constant branching factors, and (with more machinery) to **dynamic** B-trees supporting $O(\\log_B N)$ insert/delete (Bender, Demaine, Farach-Colton, 2000).`,
    pitfall:
      "The van Emde Boas *memory layout* technique here (recursively splitting a BST's structure to lay it out cache-obliviously) is conceptually related to, but a distinct application from, the van Emde Boas *tree data structure* (achieving O(log log u) successor/insert/delete on an integer universe) covered earlier in this course — both exploit the same 'recursively split by √ of the size' idea, but solve different problems.",
    related: ["mit6046-dc-veb-clustering", "mit6046-final-cache-blocked-matrix-multiply"],
  },
  {
    id: "mit6046-final-cache-oblivious-sorting",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Compare B-tree-based sorting, binary mergesort, and M/B-way mergesort's memory-transfer costs, and derive the asymptotically optimal sorting bound.",
    back: `**B-tree sort** (repeatedly insert $N$ elements into a cache-oblivious B-tree): costs $MT(N) = \\Theta(N\\log_B N)$ — **not optimal**, since each individual insertion pays the full $O(\\log_B N)$ tree-search cost even though sorting doesn't inherently require re-searching from the root every time.

**Binary mergesort** (already cache-oblivious as ordinarily written): the merge step is 3 parallel scans, giving recurrence $MT(N) = 2\\,MT(N/2) + O(N/B+1)$, with base case $MT(M) = O(M/B)$ (once a subproblem fits in cache, it costs one scan-load). The recursion tree has $\\lg(N/M)$ levels, each contributing $O(N/B)$ total work, giving $MT(N) = \\frac{N}{B}\\lg\\frac{N}{B}$... — wait, more precisely $O(\\frac{N}{B}\\lg\\frac{N}{M})$: a factor of $\\frac{B}{\\lg B}$ **faster** than the B-tree-based approach, but still not the best achievable.

**$M/B$-way mergesort**: instead of merging only 2 runs at a time, split into $M/B$ equal subarrays, recursively sort each, then merge all $M/B$ sorted runs simultaneously via $M/B$ **parallel scans** (one "current position" pointer per run, all fitting in cache together). Recurrence: $MT(N) = \\frac{M}{B}\\,MT\\!\\left(\\frac{N}{M/B}\\right) + O(N/B+1)$, base case $MT(M)=O(M/B)$. The recursion's height works out to $\\log_{M/B}\\frac{N}{B}$ (via the algebra $\\log_{M/B}\\frac{N}{M} + 1 = \\log_{M/B}\\frac{N}{B} - \\log_{M/B}\\frac{M}{B} + 1 = \\log_{M/B}\\frac{N}{B}$), giving:
$$MT(N) = O\\left(\\frac{N}{B}\\log_{M/B}\\frac{N}{B}\\right)$$
This is **asymptotically optimal** in the comparison model — no comparison-based sorting algorithm can do better, in either the external-memory or cache-oblivious setting.

**The catch — $M/B$-way mergesort needs to know $M$ and $B$** (to decide the split factor), so it's only an **external-memory** algorithm as stated, not yet cache-oblivious. Achieving the *same* optimal bound cache-obliviously requires the **tall-cache assumption** ($M = \\Omega(B^{1+\\varepsilon})$ for some fixed $\\varepsilon>0$ — informally, cache capacity must grow somewhat faster than block size) and a more intricate recursive **"funnel merge"** technique (not derived in this lecture) that achieves an effective $\\approx N^\\varepsilon$-way merge without explicit knowledge of $M,B$. The same optimal transfer bound, generalized, also governs **cache-oblivious priority queues** ($O(\\frac{1}{B}\\log_{M/B}\\frac{N}{B})$ amortized per insert/delete-min) — pointer given to 6.851 (Advanced Data Structures) for the full construction.`,
    pitfall:
      "M/B-way mergesort as described here is an EXTERNAL-MEMORY algorithm (it explicitly needs M and B to pick the split factor) — reaching the same optimal bound cache-obliviously is a genuinely separate, harder result (the tall-cache assumption plus funnel merge), not just 'the same algorithm without telling it M and B.'",
    related: ["mit6046-final-cache-models", "mit6046-final-lru-competitiveness"],
  },
];
