// MIT 6.006 (Spring 2020) — Lectures 15-18: Recursive Algorithms, DP
// Subproblems, DP III, Pseudopolynomial (+ Recitation 16's max-subarray
// exercise). The course's central framework: SRT BOT, a six-step recipe
// for turning any recursive idea into a provably correct, analyzable
// algorithm, and "subproblem constraint/expansion" as the fix whenever a
// natural subproblem doesn't carry enough information. LCS/LIS/knapsack
// mechanics already have deep cards in dynamic-programming.ts and are
// cross-linked (thin bridge cards naming 6.006's SRT BOT framing); Bowling,
// the Alternating Coin Game, Arithmetic Parenthesization, Piano Fingering,
// Rod Cutting, Subset Sum, and Max Subarray Sum are worked in full since
// they're 6.006's own canonical teaching examples and not elsewhere in
// this deck.
import type { Card } from "./types";

const MODULE = "mit6006-dp";

export const mit6006DynamicProgrammingCards: Card[] = [
  {
    id: "mit6006-dp-recursive-algorithm-classification",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006 classify Brute Force, Decrease & Conquer, Divide & Conquer, Dynamic Programming, and Greedy by the shape of their recursive call graph?",
    back: `Every recursive algorithm implicitly defines a graph: one vertex per recursive call (subproblem), with a directed edge from a call to whichever calls it makes (or a call to what it *depends on*, depending on orientation) — and this graph must be **acyclic** for the recursion to terminate. The five design paradigms from "how to solve an algorithms problem" are exactly a classification by that graph's **shape**:

- **Brute Force** — a **star**: one central problem branches to many independent candidate solutions checked directly, no further recursion.
- **Decrease & Conquer** — a **chain**: each subproblem depends on exactly one smaller subproblem (e.g. insertion sort's $T(n) = T(n-1) + O(n)$).
- **Divide & Conquer** — a **tree**: each subproblem depends on multiple smaller, *disjoint* subproblems that never overlap (e.g. merge sort's two independent halves).
- **Dynamic Programming** — a **DAG** with **in-degree $>1$**: subproblem dependencies *overlap* (the same smaller subproblem gets depended on by multiple larger ones) — this overlap is precisely what distinguishes DP from Divide & Conquer, and precisely why memoizing/re-using solutions saves work instead of just being a stylistic choice.
- **Greedy/Incremental** — a **subgraph** (of the DP DAG): a Greedy algorithm is really a DP where, at each step, you can *prove* only one choice ever needs to be considered instead of branching over all of them — so it explores only a thin path through what would otherwise be a full DAG.

This is why "does my problem have overlapping subproblems?" is *the* diagnostic question for reaching for DP specifically — a tree-shaped (non-overlapping) recursion is Divide & Conquer even if it looks superficially similar, and doesn't benefit from memoization at all (nothing to re-use).`,
    pitfall:
      "Greedy being 'a subgraph of the DP DAG' means every greedy algorithm has a DP algorithm as a fallback proof strategy: if you can't prove a greedy choice is always safe, fall back to considering all choices (full DP) rather than assuming greedy works — greedy needs its own exchange-argument proof, it doesn't come for free just because a DP formulation exists.",
    related: ["mit6006-dp-srt-bot-framework", "recursion-dc-paradigm"],
  },
  {
    id: "mit6006-dp-srt-bot-framework",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the six SRT BOT steps for solving any problem recursively, stated precisely?",
    back: `**SRT BOT** — 6.006's recipe for constructing (and proving correct, and analyzing) a recursive/DP algorithm from scratch:

1. **Subproblem definition**: describe, in words, what a subproblem $x \\in X$ means, parameterized concretely (often prefixes/suffixes/substrings of the input, or extra "state" parameters when a bare prefix/suffix doesn't carry enough information — see subproblem expansion).
2. **Relate** subproblem solutions recursively: $x(i) = f(x(j), \\ldots)$ for one or more $j$ "smaller" than $i$. Method: identify a *question* about the subproblem's solution that, if answered, reduces it to smaller subproblem(s) — then **locally brute-force every possible answer** to that question and combine (take the max/min/sum/etc. depending on the problem).
3. **Topological order**: argue the relation is acyclic — subproblems must form a genuine DAG, never actually depending on themselves even indirectly.
4. **Base cases**: state solutions directly for every independent subproblem where the relation "breaks down" (no smaller subproblems to recurse on).
5. **Original problem**: show how the answer to the actual input problem is recovered from subproblem solution(s) — sometimes it *is* one specific subproblem, sometimes a combination, sometimes needs parent pointers to reconstruct an actual solution (not just an optimal value).
6. **Time analysis**: $\\sum_{x \\in X} \\text{work}(x)$, where $\\text{work}(x)$ counts only the *non-recursive* work in computing the relation at $x$ (treat each recursive call as $O(1)$, since its own cost is accounted for separately, at its own subproblem). If every subproblem does $O(W)$ non-recursive work, total time is $|X| \\cdot O(W)$.

Once a problem is fully specified in SRT BOT terms, converting it to code is mechanical: base cases become the base case of a recursive function (top-down + memo) or the first entries filled in an array (bottom-up), the relation becomes the recursive call or loop body, and the topological order becomes either "whatever order memoization naturally recurses in" or the explicit loop order for the iterative version.`,
    pitfall:
      "Skipping step 3 (topological order) is the most common source of bugs that only surface as infinite recursion or wrong answers on specific inputs — a relation that *looks* like it reduces to smaller subproblems can still be secretly circular if the 'smaller' argument isn't rigorously decreasing in every branch.",
    related: ["mit6006-dp-recursive-algorithm-classification", "mit6006-dp-bowling-problem", "mit6006-dp-main-features-summary"],
  },
  {
    id: "mit6006-dp-fibonacci-memoization",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is naive recursive Fibonacci Ω(2^(n/2)) despite only n+1 distinct subproblems, and what subtlety remains even after memoizing?",
    back: `Naive \`fib(n) = fib(n-1) + fib(n-2)\` re-derives the same subproblem repeatedly — $F(k)$ gets recomputed $F(n-k)$ times — giving $T(n) = T(n-1) + T(n-2) + O(1)$, which solves to $\\Omega(2^{n/2})$: exponential, despite there being only $n+1$ *distinct* subproblems (a classic Divide & Conquer-shaped recursion applied to a problem whose dependency graph is actually a DAG in disguise — see the recursive-algorithm-classification card). Memoizing (top-down) or tabulating bottom-up-in-a-loop both exploit the true DAG structure directly: $n+1$ subproblems, $O(1)$ work each (one addition), giving $O(n)$ total.

The remaining subtlety 6.006 flags explicitly: $F_n$ itself grows to $\\Theta(n)$ **bits** long — far past a single machine word once $n$ is large — so each "$O(1)$" addition is actually $O(\\lceil n/w \\rceil)$ time for $w$-bit words, making the true cost $O(n\\lceil n/w \\rceil) = O(n + n^2/w)$, not simply $O(n)$. This is a recurring theme worth watching for generally: a DP's subproblem *count* and its *word-RAM-honest* per-subproblem cost are two different things, and treating every DP relation step as $O(1)$ is only valid when the values involved stay within a single machine word.`,
    pitfall:
      "The Word-RAM model's O(1) arithmetic assumption silently breaks once a computed value's bit-length exceeds the word size — this is easy to miss for any DP whose values can grow (Fibonacci, factorials, large sums), and problem statements that don't bound output magnitude should raise this question explicitly.",
    related: ["mit6006-foundations-word-ram", "dynamic-programming-climbing-stairs"],
  },
  {
    id: "mit6006-dp-dag-shortest-paths-as-dp",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How is DAG Relaxation itself a dynamic program in SRT BOT terms?",
    back: `Subproblems: $\\delta(s,v)$ for every $v \\in V$. Relate: $\\delta(s,v) = \\min\\{\\delta(s,u) + w(u,v) \\mid u \\in \\text{Adj}^-(v)\\} \\cup \\{\\infty\\}$ — guess the last edge on a shortest path to $v$, brute-force over every possible incoming edge. Topological order: the DAG's own topological order. Base case: $\\delta(s,s) = 0$. Original problem: all subproblems together (SSSP wants every vertex's distance, not just one). Time: $\\sum_{v} O(1 + |\\text{Adj}^-(v)|) = O(|V| + |E|)$ by the same handshaking argument as everywhere else.

This is the *exact same computation* as DAG Relaxation from the graphs unit — just viewed from $v$'s perspective (pull: "what's my best incoming edge?") instead of $u$'s perspective (push: "relax all my outgoing edges as I'm processed"). Recognizing that a graph algorithm you already know **is** a dynamic program under a change of perspective is itself a useful skill: DP is not a separate bag of tricks from the graph algorithms unit, it's the same "safe estimate + relaxation" idea wearing SRT BOT's bookkeeping.`,
    related: ["mit6006-graphs-dag-relaxation", "mit6006-graphs-relaxation"],
  },
  {
    id: "mit6006-dp-bowling-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In the Bowling problem, why does switching from prefix/midpoint subproblems to suffix subproblems turn an O(n²) Divide & Conquer algorithm into an O(n) DP?",
    back: `**Bowling**: $n$ pins each with value $v_i$ (possibly negative); a ball hits either one pin ($v_i$ points) or two adjacent pins ($v_i \\cdot v_{i+1}$ points, so two negatives multiply into a big positive — order matters!); maximize total score.

**First attempt (Divide & Conquer)**: $B(i,j)$ = best score using only pins $i,\\ldots,j-1$, splitting at the midpoint $m$: $B(i,j) = \\max\\{v_m v_{m+1} + B(i,m) + B(m{+}2,j), \\; B(i,m{+}1) + B(m{+}1,j)\\}$. This works ($T(n) = 4T(n/2) + O(1) = O(n^2)$ by the Master Theorem) but is needlessly slow and doesn't generalize (e.g. to a "bigger ball" hitting three pins).

**DP fix**: switch to **suffix** subproblems, $B(i)$ = best score using only pins $i, \\ldots, n-1$. The key move — the general "how to relate" method: **identify a question about the subproblem whose answer reduces it to something smaller, then locally brute-force every possible answer**. Here the question is "what happens to the very first pin?" — three possible answers (skip it, hit it alone, hit it with its neighbor), each reducing to a smaller suffix: $B(i) = \\max\\{B(i{+}1),\\; v_i + B(i{+}1),\\; v_i v_{i+1} + B(i{+}2)\\}$. Now there are only $\\Theta(n)$ subproblems (not $\\Theta(n^2)$ pairs $(i,j)$) with $O(1)$ work each — $\\Theta(n)$ total, and the three-way brute force generalizes immediately to a bigger ball (just add a fourth branch).

The general lesson: **prefer the subproblem shape that minimizes both count and per-subproblem branching** — $(i,j)$-pair subproblems aren't wrong, they're just carrying information (both endpoints) the problem doesn't actually need, since bowling never "returns" to reconsider pins already decided.`,
    code: `def bowl(v):
    memo = {}
    def B(i):
        if i >= len(v): return 0                    # base case
        if i not in memo:
            memo[i] = max(B(i+1),                    # skip pin i
                v[i] + B(i+1),                        # hit pin i alone
                v[i] * v[i+1] + B(i+2))               # hit pins i, i+1 together
        return memo[i]
    return B(0)`,
    pitfall:
      "The 'small number of possible answers to the guessed question' condition is what keeps brute-forcing cheap — bowling's question ('what happens to the first pin?') has only 3 answers regardless of n; a question with Θ(n) possible answers (like arithmetic parenthesization's 'where's the outermost split?') is still valid SRT BOT, just with correspondingly more per-subproblem work.",
    related: ["mit6006-dp-srt-bot-framework", "mit6006-dp-subproblem-constraint-expansion"],
  },
  {
    id: "mit6006-dp-lcs-srt-bot",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006's SRT BOT specification of Longest Common Subsequence work, in the course's own terms?",
    back: `Subproblems $x(i,j)$ = length of the LCS of suffixes $A[i:]$ and $B[j:]$. Relate: if $A[i] = B[j]$, some LCS uses that matched pair (using it never hurts), so $x(i,j) = x(i{+}1,j{+}1) + 1$; otherwise, guess which of $A[i]$/$B[j]$ is excluded from the LCS and take the better: $x(i,j) = \\max\\{x(i{+}1,j), x(i,j{+}1)\\}$. Topological order: decreasing $i+j$. Base: $x(i,|B|) = x(|A|,j) = 0$. Original: $x(0,0)$, with parent pointers to reconstruct the actual subsequence (not just its length). Time: $(|A|{+}1)(|B|{+}1)$ subproblems $\\times\\ O(1)$ work $= O(|A||B|)$.

This is the identical mechanics to the deep LCS card elsewhere in this deck — 6.006's contribution here is purely the SRT BOT *bookkeeping* (an explicit "why does the relation only need $i{+}1,j{+}1$" correctness argument via the "using a matching pair never hurts" exchange argument), not a different algorithm. See the related card for the full implementation and edit-distance comparison.`,
    related: ["dynamic-programming-lcs"],
  },
  {
    id: "mit6006-dp-lis-srt-bot",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does naive suffix-subproblem LIS ('is A[i] in the LIS?') fail, and what subproblem expansion fixes it?",
    back: `Natural first attempt: $x(i)$ = LIS length of suffix $A[i:]$, guessing whether $A[i]$ is included. Problem: if $A[i]$ *is* included, you need the LIS to actually **start** at $A[i]$ to guarantee the increasing property connects correctly into whatever comes after — a bare "LIS of the suffix" doesn't carry that constraint.

**Fix (subproblem constraint, not expansion — no new parameter, just a restricted meaning)**: redefine $x(i)$ = length of the longest increasing subsequence of $A[i:]$ **that includes $A[i]$ as its first element**. Relate: guess the *second* element of the LIS — either some $A[j]$ with $j>i$ and $A[j] > A[i]$ (extend), or $A[i]$ is the last element: $x(i) = \\max(\\{1 + x(j) \\mid i<j<|A|, A[j]>A[i]\\} \\cup \\{1\\})$. No base case is needed (the "$A[i]$ is last" option is always available). Original problem: guess the *first* element of the overall LIS — $\\max\\{x(i) \\mid 0 \\leq i < |A|\\}$. Time: $|A|$ subproblems $\\times\\ O(|A|)$ work (scanning all $j>i$) $= O(|A|^2)$; 6.006 notes this can be improved to $O(|A|\\log|A|)$ by doing only $O(\\log|A|)$ work per subproblem via an **augmented AVL tree** — a direct callback to the order-statistics-tree augmentation technique from the Trees unit.`,
    pitfall:
      "This is a case where adding a constraint to the subproblem's meaning (not adding a new parameter) is what fixes it — it's tempting to reach for full subproblem expansion (adding an index/state parameter) by default, but check first whether merely restricting what the existing subproblem means already supplies the missing information.",
    related: ["dynamic-programming-lis-on2", "mit6006-trees-heaps-order-statistics-tree"],
  },
  {
    id: "mit6006-dp-alternating-coin-game",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "In the Alternating Coin Game, how does 'subproblem expansion' (adding whose-turn-it-is as state) simplify the relation from O(n) work to O(1) work per subproblem?",
    back: `Two players alternately take the first or last of a row of $n$ coins; you go first and want to maximize your own total, knowing your opponent plays to maximize theirs too (equivalently, since it's zero-sum, to minimize what's left for you).

**Solution 1 (zero-sum trick)**: $x(i,j)$ = max value **you** can take from coins $i,\\ldots,j$ (regardless of whose turn — since it's your turn by the recursive structure). Guess whether you take coin $i$ or $j$; whichever you don't take leaves the *rest* for your opponent's optimal (zero-sum) play: $x(i,j) = \\max\\{v_i + \\sum_{k=i+1}^j v_k - x(i{+}1,j),\\; v_j + \\sum_{k=i}^{j-1} v_k - x(i,j{-}1)\\}$. Base: $x(i,i) = v_i$. This needs $\\Theta(n)$ work per subproblem just to compute the sums (naively), giving $\\Theta(n^3)$ total — improvable to $\\Theta(n^2)$ by precomputing prefix sums first.

**Solution 2 (subproblem expansion)**: add **whose turn it is** as an explicit third parameter: $x(i,j,p)$ = max value *you* get when player $p \\in \\{\\text{me, you}\\}$ moves first on coins $i,\\ldots,j$. Now the relation needs no sum-subtraction trick at all: $x(i,j,\\text{me}) = \\max\\{v_i + x(i{+}1,j,\\text{you}),\\; v_j + x(i,j{-}1,\\text{you})\\}$ and $x(i,j,\\text{you}) = \\min\\{x(i{+}1,j,\\text{me}),\\; x(i,j{-}1,\\text{me})\\}$ (the opponent's choice doesn't add to *your* total). Base: $x(i,i,\\text{me})=v_i$, $x(i,i,\\text{you})=0$. **$O(1)$ work per subproblem**, $\\Theta(n^2)$ subproblems, $\\Theta(n^2)$ total — asymptotically better than Solution 1 even after its own optimization, and the relation itself is simpler to state and verify correct.`,
    pitfall:
      "Solution 1's zero-sum reasoning (my total + your total = full sum, so 'what I get' determines 'what you get') is specific to two-player zero-sum games — it doesn't generalize to games with more players or non-zero-sum payoffs, whereas Solution 2's explicit whose-turn state generalizes directly to both.",
    related: ["mit6006-dp-subproblem-constraint-expansion"],
  },
  {
    id: "mit6006-dp-subproblem-constraint-expansion",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the general 'subproblem constraint/expansion' technique, and when should you reach for it?",
    back: `If your natural choice of subproblem (usually a prefix, suffix, or substring) turns out **not to carry enough information** for the relation to work — you can't check a needed condition, or you can't tell what "started" a subsequent subproblem — the fix is to change what a subproblem records:

- **Constraint**: restrict the *meaning* of the existing subproblem without adding new parameters (e.g. LIS's "$x(i)$ = LIS of the suffix starting *specifically* at $A[i]$", not just "LIS of the suffix").
- **Expansion**: add an entirely new parameter recording extra state (e.g. the Coin Game's whose-turn player $p$; Piano Fingering's starting-finger $f$; Bellman-Ford's edge-count budget $k$).

Both trade an increase in subproblem *count* for a simplification of the *relation* — often turning an expensive per-subproblem computation (summing, searching, or an incorrect/incomplete relation) into cheap $O(1)$ or small-constant work per subproblem instead. This is a real trade-off, not a free lunch: more subproblems costs more total work if the per-subproblem savings don't outweigh the multiplicative blowup in subproblem count — but when it does pay off (as in the Coin Game: $n^2 \\to n^2$ subproblems but $\\Theta(n) \\to \\Theta(1)$ work each), it's usually both asymptotically faster *and* easier to state and prove correct, since the relation no longer needs auxiliary tricks (like the Coin Game's zero-sum subtraction) to compensate for missing information.`,
    related: ["mit6006-dp-alternating-coin-game", "mit6006-dp-piano-fingering", "mit6006-dp-main-features-summary"],
  },
  {
    id: "mit6006-dp-sssp-revisited-bridge",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does re-deriving Bellman-Ford as an explicit SRT BOT dynamic program relate to its graph-duplication construction from the Graphs unit?",
    back: `Same idea, formalized as a DP: expand subproblems to $\\delta_k(s,v)$ = shortest-path weight from $s$ to $v$ using **at most $k$ edges** (subproblem *expansion*, adding the edge-budget $k$ — exactly the fix needed because plain $\\delta(s,v)$ alone isn't acyclic on a graph with cycles). Relate: guess the last edge, $\\delta_k(s,v) = \\min(\\{\\delta_{k-1}(s,u) + w(u,v) \\mid (u,v) \\in E\\} \\cup \\{\\delta_{k-1}(s,v)\\})$ (the second option: don't use a $k$-th edge at all). Topological order: increasing $k$. Base: $\\delta_0(s,s)=0$, $\\delta_0(s,v)=\\infty$ otherwise. Time: $O(|V| \\cdot |E|)$, summing $O(\\deg^-(v))$ work over every $(v,k)$ pair.

This is **exactly** the graph-duplication construction from the Bellman-Ford lecture — $\\delta_k(s,v)$ *is* $\\delta(s_0, v_k)$ in that layered DAG, just derived here directly from SRT BOT instead of via an explicit graph construction. Two derivations of the identical algorithm is itself a useful confirmation: whenever a DP's subproblems are literally "the same computation as a known graph algorithm," that's a sign you can reuse the graph algorithm's correctness proof rather than re-deriving one from scratch.`,
    related: ["mit6006-graphs-bellman-ford-graph-duplication", "mit6006-dp-dag-shortest-paths-as-dp"],
  },
  {
    id: "mit6006-dp-floyd-warshall-srt-bot",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does Floyd-Warshall's SRT BOT specification achieve O(1) branching per subproblem, unlike Bellman-Ford's O(degree)?",
    back: `Subproblems $x(u,v,k)$ = shortest-path weight from $u$ to $v$ using only intermediate vertices from $\\{1,\\ldots,k\\}$ (numbering all vertices $1$ to $|V|$). Relate: for the $k$-th vertex, guess only whether the shortest path **uses vertex $k$ or not** — a binary question, not "guess the last edge" (which has $O(\\deg)$ possible answers): $x(u,v,k) = \\min\\{x(u,k,k{-}1) + x(k,v,k{-}1),\\; x(u,v,k{-}1)\\}$. Base: $x(u,u,0)=0$; $x(u,v,0)=w(u,v)$ if edge exists, else $\\infty$. Original: $x(u,v,|V|)$ for all pairs. Time: $O(|V|^3)$ subproblems $\\times\\ O(1)$ each $= O(|V|^3)$.

The payoff of reformulating "which vertices are allowed" instead of "which edge did I just take" as the guessed question: **constant branching** replaces the $O(|E|)$-per-subproblem cost that Bellman-Ford-repeated-$|V|$-times would need, bringing All-Pairs Shortest Paths down from $O(|V|^2|E|)$ (naive repeated Bellman-Ford) to $O(|V|^3)$ — matching Johnson's algorithm's bound for dense graphs ($|E| = \\Theta(|V|^2)$) with a dramatically simpler algorithm, though Johnson's remains strictly better for sparse graphs ($|E| = O(|V|)$, where Johnson gives $O(|V|^2\\log|V|)$ versus Floyd-Warshall's $O(|V|^3)$ regardless of sparsity).`,
    pitfall:
      "Floyd-Warshall's O(V³) bound doesn't improve on sparse graphs the way Johnson's does — it's insensitive to |E| entirely, so for a sparse graph where |E| = O(|V|), Johnson's O(V² log V) is asymptotically better despite Floyd-Warshall's simpler implementation; the right choice depends on graph density, not just 'which is easier to code.'",
    related: ["shortest-paths-mst-floyd-warshall", "mit6006-graphs-johnsons-algorithm"],
  },
  {
    id: "mit6006-dp-arithmetic-parenthesization",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In Arithmetic Parenthesization, why must each subproblem track both a max AND a min value, not just the max?",
    back: `Given $a_0 \\ast_1 a_1 \\ast_2 \\cdots \\ast_{n-1} a_{n-1}$ with each $\\ast_i \\in \\{+, \\times\\}$ and possibly-negative $a_i$, choose parenthesization to maximize the result. Naive idea: $x(i,j)$ = max value obtainable from $a_i \\ast \\cdots \\ast a_{j-1}$, split at the last operation: $x(i,j) = \\max\\{x(i,k) \\ast_k x(k,j)\\}$ over split points $k$. **This is wrong** — with multiplication, two very *negative* subexpressions can multiply into a very *large positive* result: $(-3)\\times(-3) = 9 > (-2)\\times(-2) = 4$, so the maximum overall result can come from combining two **minima**, not two maxima.

Fix: track both simultaneously. $x(i,j,\\text{opt})$ for $\\text{opt} \\in \\{\\min,\\max\\}$ = the optimal (min or max) value obtainable from $a_i \\ast \\cdots \\ast a_{j-1}$. Relate: guess the outermost split point $k$ **and** which of $\\{\\min,\\max\\}$ each side should use (four combinations, since multiplying two mins or two maxes can each yield the new max or min depending on sign): $x(i,j,\\text{opt}) = \\text{opt}\\{x(i,k,\\text{opt}') \\ast_k x(k,j,\\text{opt}'') \\mid i<k<j,\\ \\text{opt}',\\text{opt}'' \\in \\{\\min,\\max\\}\\}$. Base: $x(i,i{+}1,\\text{opt}) = a_i$ (single number, no ambiguity). Original: $x(0,n,\\max)$, with **two** parent pointers per subproblem (which split, which opt-pair) to reconstruct the actual parenthesization (forms a binary tree). Time: $O(n^2)$ subproblems $\\times\\ O(n)$ work (scan all splits, 4 opt combos) $= O(n^3)$.`,
    pitfall:
      "This is the canonical example of a DP relation needing to track more than 'the' optimal value at each subproblem — whenever an operation (here, multiplication) can flip sign and turn a minimum into part of a new maximum, tracking only the max is silently incorrect, not just suboptimal.",
    related: ["dynamic-programming-matrix-chain"],
  },
  {
    id: "mit6006-dp-piano-fingering",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In Piano Fingering, why does the naive suffix subproblem fail to specify a well-defined transition cost, and what expansion fixes it?",
    back: `Given notes $t_0,\\ldots,t_{n-1}$ and a difficulty function $d(t,f,t',f')$ for transitioning from note $t$ with finger $f$ to note $t'$ with finger $f'$, assign fingers to minimize total transition difficulty.

**First attempt**: $x(i)$ = min difficulty for playing $t_i,\\ldots,t_{n-1}$, guessing the finger $f$ for $t_i$: $x(i) = \\min\\{x(i{+}1) + d(t_i,f,t_{i+1}, ?) \\mid f\\}$. **Breaks**: the "$?$" — which finger starts note $t_{i+1}$ — is exactly the information $x(i{+}1)$'s bare definition doesn't expose. Different starting fingers at $i{+}1$ have different optimal continuations *and* different transition costs from $t_i$, so you can't evaluate $d(\\cdot)$ without knowing which one $x(i{+}1)$'s optimal solution actually uses.

**Fix (subproblem expansion)**: $x(i,f)$ = min difficulty for playing $t_i,\\ldots,t_{n-1}$ **starting with finger $f$ on note $t_i$**. Now the relation has everything it needs: $x(i,f) = \\min\\{x(i{+}1,f') + d(t_i,f,t_{i+1},f') \\mid 1 \\leq f' \\leq F\\}$. Base: $x(n{-}1,f) = 0$. Original: $\\min\\{x(0,f) \\mid f\\}$. Time: $\\Theta(nF)$ subproblems $\\times\\ \\Theta(F)$ work $= \\Theta(nF^2)$ — notably **independent of how many distinct notes** exist, only the number of fingers $F$ (a small constant, $\\leq 5$ for one hand) and notes $n$.

This generalizes directly: **guitar fingering** redefines "finger" as a (finger, string) pair, multiplying $F$ by the number of strings $S$; **multiple simultaneous notes** (chords) extends a "finger" to an assignment across up to $T$ notes at once, giving $\\Theta(n \\cdot T^{2F})$ — still $\\Theta(n)$ for small constant $T, F$ (e.g. Guitar Hero's $F=4$, Dance Dance Revolution's $F=2$ feet).`,
    pitfall:
      "The subproblem-expansion fix here trades a subproblem count of n for n·F — a genuinely useful trade only because F is a small constant (number of fingers/limbs), not a value that scales with input size; expanding by a parameter whose range grows with n would defeat the purpose.",
    related: ["mit6006-dp-subproblem-constraint-expansion"],
  },
  {
    id: "mit6006-dp-rod-cutting",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does greedy (cut the most valuable price-per-length piece first) provably fail for Rod Cutting, and what's the DP fix?",
    back: `Given a rod of length $L$ and value $v(\\ell)$ for each possible piece length $\\ell \\in \\{1,\\ldots,L\\}$, cut the rod to maximize total value. **Greedy fails**: picking the length with the best value-per-unit-length ratio first isn't optimal — e.g. with $v = [0,1,10,13,18,20,31,32]$ for lengths $0..7$, the best ratio is length 6 ($31/6$), giving $v(6)+v(1) = 32$, but $v(2)+v(2)+v(3) = 10+10+13 = 33$ is strictly better.

DP: $x(\\ell)$ = max value from a length-$\\ell$ rod. Relate: guess the length $p$ of the *first* piece cut off: $x(\\ell) = \\max\\{v(p) + x(\\ell-p) \\mid 1 \\leq p \\leq \\ell\\}$ — equivalent to a maximum-weight path in the subproblem DAG. Base: $x(0)=0$. Original: $x(L)$, with parent pointers (store which $p$ achieved the max at each $\\ell$) to reconstruct the actual cuts. Time: $L{+}1$ subproblems $\\times\\ O(\\ell)$ work each $= O(L^2)$.

This *is* (strongly) polynomial time: input size is $L{+}1$ words (the integer $L$ plus $L$ values), and $O(L^2)$ is a constant-degree polynomial in that input size — a useful contrast case for the next card, since a structurally near-identical problem (Subset Sum) with the same $O(nT)$-style bound is **not** polynomial, because its second parameter $T$ isn't guaranteed to appear as $\\Omega(T)$ actual input integers the way Rod Cutting's $L$ values are.`,
    code: `def cut_rod(L, v):
    x = [0] * (L + 1)
    parent = [None] * (L + 1)
    for l in range(1, L + 1):
        for piece in range(1, l + 1):
            candidate = v[piece] + x[l - piece]
            if candidate > x[l]:
                x[l] = candidate
                parent[l] = piece
    return x[L], parent`,
    pitfall:
      "Rod Cutting looks structurally identical to Subset Sum / Knapsack's O(n·(budget)) DP shape, but Rod Cutting happens to be genuinely polynomial because its budget parameter L is paired with exactly L input values — don't assume every 'integer-indexed subproblem' DP is automatically pseudopolynomial without checking whether the budget scales with actual input size or not.",
    related: ["mit6006-dp-pseudopolynomial", "dynamic-programming-knapsack-01"],
  },
  {
    id: "mit6006-dp-subset-sum",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.006's SRT BOT specification of Subset Sum work, and why is it a decision problem rather than an optimization problem?",
    back: `Given positive integers $A = (a_0,\\ldots,a_{n-1})$ and target $T$: does *some* subset of $A$ sum to exactly $T$? Output is **YES/NO** — a **decision problem**, not an optimization problem (no "best" value to maximize, just a boolean question), though the DP machinery is identical either way.

Subproblems: $x(i,t)$ = can some subset of $A[i:]$ sum to $t$? Relate: guess whether $a_i$ is included: $x(i,t) = x(i{+}1, t - a_i)$ **if** $t \\geq a_i$, **OR** $x(i{+}1, t)$ (always available) — true if either branch is true. Topological order: decreasing $i$. Base: $x(i, 0) = \\text{YES}$ for all $i$ (empty subset sums to 0); $x(n, t) = \\text{NO}$ for $t \\geq 1$ (no items left, can't reach a positive target). Original: $x(0, T)$. Time: $O(nT)$ subproblems (one per $(i,t)$ pair) $\\times\\ O(1)$ work $= O(nT)$.

Top-down memoization can be significantly cheaper in practice than the full $O(nT)$ bottom-up table — only *reachable* subproblems get computed (6.006 gives an example where the full table has 35 entries but memoization only ever touches 14) — though worst-case is still $O(nT)$ either way, since a reachable-subproblem-count bound isn't guaranteed to be smaller in general.`,
    code: `def subset_sum(A, T):
    n = len(A)
    memo = {}
    def x(i, t):
        if t == 0: return True
        if i == n: return False
        if (i, t) not in memo:
            memo[(i, t)] = (t >= A[i] and x(i+1, t - A[i])) or x(i+1, t)
        return memo[(i, t)]
    return x(0, T)`,
    related: ["mit6006-dp-pseudopolynomial", "dynamic-programming-knapsack-01"],
  },
  {
    id: "mit6006-dp-pseudopolynomial",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does 'pseudopolynomial time' precisely mean, and why is Subset Sum's O(nT) not polynomial while Rod Cutting's O(L²) is?",
    back: `**(Strongly) polynomial time**: running time bounded by a constant-degree polynomial in the input size, measured in **words** (equivalently, roughly, in the *count* of numbers in the input, treating each as $O(1)$ words). **Pseudopolynomial time**: running time bounded by a constant-degree polynomial in the input size **and** in the *magnitude* of the input integers — polynomial only when those integers happen to be polynomially bounded in the input size ($n^{O(1)}$), but genuinely exponential when they're not.

Subset Sum's $O(nT)$: input size is $O(n)$ words ($n$ integers plus $T$), but $T$ itself can be astronomically larger than $n$ — e.g. $T = 2^n$ needs only $n$ bits to write down (so contributes $O(1)$ words to input size) yet makes $O(nT) = O(n \\cdot 2^n)$ genuinely exponential in the input's actual bit-length. Contrast with Rod Cutting's $O(L^2)$: it *looks* similarly integer-indexed, but $L$ is paired with **exactly $L$ actual input values** $v(1),\\ldots,v(L)$ — so $L$ is *forced* to be $O(\\text{input size})$, making $O(L^2)$ genuinely polynomial rather than merely pseudopolynomial.

Other pseudopolynomial algorithms already seen this course: Counting Sort ($O(n+u)$), Direct-Access-Array build ($O(n+u)$), naive Fibonacci-via-DP if you count bit-length honestly. **Radix Sort** is subtly different — it's *weakly* polynomial (bounded by a polynomial in the input size measured in **bits**, i.e. in $\\log$ of the integers, sitting strictly between pseudopolynomial and strongly polynomial). The practical stakes: 0-1 Knapsack's $O(nS)$ DP (same shape as Subset Sum) means Knapsack is only efficiently solvable when the capacity $S$ is polynomially bounded — for astronomically large $S$, no known polynomial algorithm exists, and (per Lecture 19) this is provably tied to $P$ vs $NP$.`,
    pitfall:
      "A pseudopolynomial algorithm is not simply 'a slow polynomial algorithm' — it is genuinely exponential in the true (bit-length) input size when the numeric parameters aren't bounded polynomially, which is precisely why NP-hardness proofs for problems like Subset Sum/Knapsack require using numbers with unboundedly many bits, not just 'large' numbers in the everyday sense.",
    related: ["mit6006-dp-rod-cutting", "mit6006-dp-subset-sum", "mit6006-sorting-hashing-radix-sort-derivation"],
  },
  {
    id: "mit6006-dp-max-subarray-sum",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the O(n) 'maximum subarray sum' DP (Kadane's algorithm, in SRT BOT terms) improve on the O(n²) 'best ending position' approach?",
    back: `Given an array $A$ of $n$ integers (positive and negative), find the maximum sum of any non-empty **contiguous** subarray. Brute force checks all $O(n^2)$ subarrays directly in $O(n)$ each ($O(n^3)$ total); scanning left from each candidate end-point improves this to $O(n^2)$ but **redoes work**: each leftward scan re-touches sums already computed by an earlier scan.

SRT BOT fix: $x(k)$ = max subarray sum **ending exactly at** $A[k]$ (a constrained prefix-like subproblem, in the same spirit as LIS's "must include $A[i]$"). Relate: the subarray ending at $k$ either extends the best subarray ending at $k{-}1$, or restarts fresh at $A[k]$ alone: $x(k) = \\max\\{A[k],\\ A[k] + x(k{-}1)\\}$. Base: $x(0) = A[0]$. Original problem: $\\max\\{x(k) \\mid 0 \\leq k < n\\}$ (the best subarray can end anywhere, so combine across *all* subproblems, not just the last one). Time: $n$ subproblems $\\times\\ O(1)$ work $= O(n)$ — each subproblem reuses the immediately preceding one instead of rescanning.`,
    code: `def max_subarray_sum(A):
    best_ending_here = best_overall = A[0]
    for k in range(1, len(A)):
        best_ending_here = max(A[k], A[k] + best_ending_here)
        best_overall = max(best_overall, best_ending_here)
    return best_overall`,
    pitfall:
      "The answer is max over ALL x(k), not just x(n-1) — the best subarray doesn't have to end at the last element, which is easy to get backwards if you're used to DPs (like Fibonacci) where the original problem's answer is exactly the last subproblem computed.",
    related: ["mit6006-dp-lis-srt-bot"],
  },
  {
    id: "mit6006-dp-main-features-summary",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "6.006's own retrospective classification of every DP example by subproblem type, expansion, and branching — what's the pattern?",
    back: `Looking back across every example this unit covers, the same handful of design axes recur, and locating a new problem on these axes is often enough to guess a working subproblem definition immediately:

**Subproblem shape**: prefixes/suffixes (Bowling, LCS, LIS, Floyd-Warshall's vertex-subset, Rod Cutting, Subset Sum); substrings/intervals (Alternating Coin Game, Arithmetic Parenthesization); across multiple sequences at once (LCS); indexed by an **integer budget** rather than input position (Fibonacci, Rod Cutting, Subset Sum — the last two also pseudopolynomial); indexed by graph **vertices** (DAG Shortest Paths, Bellman-Ford, Floyd-Warshall).

**Constraint/expansion applied**: none needed for the most direct problems; a same-size **constraint** (LIS: "must include $A[i]$" — no new parameter, just a restricted meaning); **doubling** the subproblem space (Alternating Coin Game's whose-turn bit, Arithmetic Parenthesization's min/max pair); **constant-factor** expansion (Piano Fingering's starting-finger, a small constant $F$); **linear** expansion (Bellman-Ford's edge-budget $k$, ranging over $\\Theta(|V|)$ values).

**Relation branching**: $\\Theta(1)$ (Fibonacci, Bowling, LCS, Coin Game, Floyd-Warshall, Subset Sum — each guesses among a small fixed number of options); $\\Theta(\\deg(v))$ (DAG Shortest Paths, Bellman-Ford — branching scales with graph structure, contributing the $|E|$ term to running time); $\\Theta(n)$ (LIS, Arithmetic Parenthesization, Rod Cutting — guessing a split point or extension anywhere in a range).

**Original-problem recovery**: sometimes a single subproblem *is* the answer (Fibonacci, Bowling, Rod Cutting, Subset Sum); sometimes it's a **combination across many subproblems** (DAG Shortest Paths/Bellman-Ford/Floyd-Warshall want *every* vertex pair's answer; LIS and Piano Fingering take a max/min over all valid starting subproblems).

Using this as a checklist when facing a new problem — "what's my subproblem shape, does it need constraint or expansion, how many branches does my relation guess over, does the original answer come from one subproblem or a combination" — turns "invent a DP from scratch" into "locate this problem's coordinates on four known axes."`,
    related: ["mit6006-dp-srt-bot-framework", "mit6006-dp-subproblem-constraint-expansion"],
  },
];
