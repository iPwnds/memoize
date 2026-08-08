import type { Card } from "./types";

const MODULE = "string-algorithms";

export const stringAlgorithmsCards: Card[] = [
  {
    id: "string-algorithms-naive-matching",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does naive string matching work, and when is it actually fine to use?",
    back: `Slide the pattern across every possible starting position in the text; at each position, compare character by character until a mismatch or a full match. Worst case $O(nm)$ (text length $n$, pattern length $m$) — e.g. text \`"aaaa...a"\` against pattern \`"aaa...ab"\` re-compares almost the whole pattern at every single shift.

Genuinely fine when: $m$ is small (short patterns), the alphabet is large (mismatches happen early on average, so the practical cost is closer to $O(n)$), or you're only matching **once** and the $O(n+m)$ preprocessing cost of KMP/Z-algorithm isn't worth it for a single search. Most real text-search tools (grep-style tools, simple string \`.find()\` in short strings) lean on naive matching's simplicity and good average-case behavior rather than always reaching for KMP.`,
    complexity: {
      structure: "Naive String Matching",
      operations: [
        { op: "Worst case", time: "O(n·m)" },
        { op: "Typical/average case", time: "O(n)", note: "large alphabet, early mismatches" },
      ],
    },
    related: ["string-algorithms-kmp-overview"],
  },

  // -------------------------------------------------------------------- KMP
  {
    id: "string-algorithms-kmp-overview",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What problem does KMP's failure function solve, and why does it avoid re-scanning the text?",
    back: `When a naive matcher hits a mismatch partway through a candidate match, it discards all the progress made and restarts the pattern from its beginning at the very next text position — throwing away the useful information that a **prefix of the pattern was already confirmed to match**.

KMP precomputes a **failure function** (a.k.a. prefix function) $\\pi$ over the pattern alone: $\\pi[i]$ = length of the longest proper prefix of \`pattern[0..i]\` that is **also a suffix** of \`pattern[0..i]\`. On a mismatch after matching $k$ characters, instead of restarting the pattern from index 0, jump the pattern pointer directly to $\\pi[k-1]$ — this is exactly how far the pattern can "reuse" its own already-confirmed self-overlap instead of re-deriving it by re-scanning the text. The text pointer **never moves backward**, which is what gives the overall $O(n+m)$ bound (linear in text length, not $O(nm)$).`,
    related: ["string-algorithms-kmp-prefix-function", "string-algorithms-kmp-implementation"],
  },
  {
    id: "string-algorithms-kmp-prefix-function",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How is KMP's prefix function (failure function) built?",
    back: `Build $\\pi$ over the pattern itself, using the pattern to match against **itself** — the exact same matching logic used later against the text, just self-referential. Maintain a pointer \`k\` (current candidate prefix-suffix length); for each position \`i\`, while \`pattern[i] != pattern[k]\` and \`k > 0\`, fall back via \`k = pi[k-1]\` (reusing already-computed structure, same self-similar trick as the main search); if they match, increment \`k\`; set \`pi[i] = k\`.

This construction is itself $O(m)$ (amortized — the \`k\` fallback chain, like a two-pointer/amortized argument, is bounded because \`k\` only increases by at most 1 per outer step, so total decreases across the whole run can't exceed total increases).`,
    code: `def build_prefix_function(pattern):
    m = len(pattern)
    pi = [0] * m
    k = 0
    for i in range(1, m):
        while k > 0 and pattern[i] != pattern[k]:
            k = pi[k - 1]
        if pattern[i] == pattern[k]:
            k += 1
        pi[i] = k
    return pi`,
    pitfall:
      "π[i] must be the LONGEST such prefix-suffix, not just any — the fallback chain (k = pi[k-1]) is what correctly finds progressively shorter candidates if the longest one doesn't extend, never skipping past a valid shorter option.",
    related: ["string-algorithms-kmp-overview", "string-algorithms-kmp-implementation"],
  },
  {
    id: "string-algorithms-kmp-implementation",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement full KMP string search using the prefix function.",
    back: `The search loop mirrors the prefix-function construction almost exactly — both are "match against something, fall back via π on mismatch."`,
    code: `def kmp_search(text, pattern):
    if not pattern:
        return []
    pi = build_prefix_function(pattern)
    matches = []
    k = 0
    for i in range(len(text)):
        while k > 0 and text[i] != pattern[k]:
            k = pi[k - 1]
        if text[i] == pattern[k]:
            k += 1
        if k == len(pattern):
            matches.append(i - len(pattern) + 1)
            k = pi[k - 1]     # continue searching for overlapping matches
    return matches`,
    complexity: {
      structure: "KMP String Matching",
      operations: [
        { op: "Build prefix function", time: "O(m)" },
        { op: "Search", time: "O(n)" },
        { op: "Total", time: "O(n + m)" },
      ],
    },
    related: ["string-algorithms-kmp-prefix-function"],
  },

  // --------------------------------------------------------------- Rabin-Karp
  {
    id: "string-algorithms-rabin-karp",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Rabin-Karp use a rolling hash for string matching?",
    back: `Compute a hash of the pattern once, and a hash of each length-$m$ window of the text — but instead of recomputing each window's hash from scratch ($O(m)$ each, giving $O(nm)$ overall, no better than naive), use a **rolling hash**: derive the next window's hash from the current one in $O(1)$ by removing the outgoing character's contribution and adding the incoming character's, using a polynomial hash structured so this is pure arithmetic (e.g. treating the window as a base-$b$ number: \`new_hash = (old_hash - text[i] * b^(m-1)) * b + text[i+m]\`, all mod some large prime).

When a window's hash matches the pattern's hash, do a **direct character-by-character verification** (hashes can collide on different strings) before confirming a real match — this verification is why worst-case is still $O(nm)$ in principle (adversarial input causing every window to hash-collide), but with a well-chosen modulus, that's astronomically unlikely, giving expected $O(n+m)$.`,
    complexity: {
      structure: "Rabin-Karp",
      operations: [
        { op: "Average case", time: "O(n + m)" },
        { op: "Worst case (many hash collisions)", time: "O(n·m)" },
      ],
    },
    pitfall:
      "Skipping the character-by-character verification step after a hash match is a correctness bug, not just a performance one — hash collisions are rare but real, and an unverified 'match' can be a false positive.",
    related: ["string-algorithms-rabin-karp-implementation", "hashing-good-hash-function"],
  },
  {
    id: "string-algorithms-rabin-karp-implementation",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Implement Rabin-Karp with a polynomial rolling hash.",
    back: `Precompute $b^{m-1} \\bmod p$ once — it's the constant needed to "remove" the outgoing character's contribution each roll.`,
    code: `def rabin_karp(text, pattern, base=256, mod=10**9 + 7):
    n, m = len(text), len(pattern)
    if m > n:
        return []
    high_pow = pow(base, m - 1, mod)
    pattern_hash = 0
    window_hash = 0
    for i in range(m):
        pattern_hash = (pattern_hash * base + ord(pattern[i])) % mod
        window_hash = (window_hash * base + ord(text[i])) % mod

    matches = []
    for i in range(n - m + 1):
        if window_hash == pattern_hash and text[i:i+m] == pattern:  # verify!
            matches.append(i)
        if i < n - m:
            window_hash = ((window_hash - ord(text[i]) * high_pow) * base
                            + ord(text[i + m])) % mod
    return matches`,
    related: ["string-algorithms-rabin-karp"],
  },

  // ------------------------------------------------------------------ Z-algorithm
  {
    id: "string-algorithms-z-algorithm",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is the Z-array, and how does the Z-algorithm compute it in O(n)?",
    back: `For a string $s$, the **Z-array** $Z[i]$ = the length of the longest substring starting at $i$ that matches a **prefix of $s$ itself** (with $Z[0]$ conventionally undefined/ignored). E.g. for \`"aabxaab"\`, $Z[4] = 3$ (since \`"aab"\` starting at index 4 matches the prefix \`"aab"\`).

Computed in $O(n)$ using a maintained **Z-box** $[l, r]$ — the rightmost window known (from previous computations) to match the prefix. For each new index $i$: if $i$ is inside the current Z-box, initialize $Z[i]$ using the **already-known** mirrored value $Z[i-l]$ (reusing prior work, same amortized-doubling-style trick as KMP's fallback), then only extend by direct comparison **past** the Z-box's known boundary — never re-comparing characters already known to match. This "extend the window, reuse known matches inside it" structure is what keeps total comparison work linear despite computing $n$ separate values.`,
    complexity: {
      structure: "Z-algorithm",
      operations: [{ op: "Build Z-array", time: "O(n)" }],
    },
    related: ["string-algorithms-z-algorithm-matching"],
  },
  {
    id: "string-algorithms-z-algorithm-matching",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does the Z-algorithm perform pattern matching, using string concatenation?",
    back: `Build the string \`pattern + separator + text\`, where \`separator\` is a character guaranteed not to appear in either (e.g. \`"\\0"\` or another sentinel). Compute the Z-array of this combined string; any position $i$ (within the \`text\` portion) with $Z[i] == \\text{len(pattern)}$ marks a match — the substring there matches the full pattern prefix exactly.

This is functionally equivalent to KMP (same $O(n+m)$ bound, same underlying idea of reusing already-known prefix-matching information) but expressed through a different, arguably more general, piece of precomputed structure (the whole Z-array vs. KMP's prefix function) — the Z-array itself is also directly useful for other prefix-related string problems beyond single-pattern search (e.g. counting distinct substrings, some string-periodicity problems), which is why it's worth knowing as a separate tool rather than just "another way to do KMP."`,
    pitfall:
      "The separator character is essential — without it, a match could spuriously span across the pattern/text boundary, inflating a Z-value incorrectly.",
    related: ["string-algorithms-z-algorithm", "string-algorithms-kmp-overview"],
  },

  // -------------------------------------------------------------- Aho-Corasick
  {
    id: "string-algorithms-aho-corasick",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Aho-Corasick match multiple patterns simultaneously in one pass over the text?",
    back: `Build a **trie** over all patterns (see the Specialized Trees module), then augment it with **failure links** — for each node, a link to the longest proper suffix of that node's path that is also some prefix present in the trie (conceptually the same "fall back to a known shorter match" idea as KMP's failure function, generalized from one pattern to a whole trie of them).

Scanning the text: walk the trie one character at a time; on a mismatch (no matching child), follow the failure link (never restart from the trie root, never re-scan the text) and try again from there; whenever a node marked "end of pattern" is reached (directly, or via failure links pointing through it — patterns can be suffixes of each other), report a match. This finds **all occurrences of all patterns** in a single $O(n + \\sum |pattern_i| + z)$ pass ($z$ = total number of matches), instead of running KMP separately for each of $k$ patterns ($O(k \\cdot n)$).

Real uses: this is the core algorithm behind most **multi-pattern text scanners** — antivirus signature scanning, network intrusion detection (matching many attack signatures against a packet stream), and content filtering, wherever you need to search for thousands of patterns simultaneously.`,
    complexity: {
      structure: "Aho-Corasick",
      operations: [
        { op: "Build (k patterns, total length M)", time: "O(M)" },
        { op: "Search text of length n", time: "O(n + z)", note: "z = number of matches reported" },
      ],
    },
    pitfall:
      "Aho-Corasick's failure links must be built via a BFS over the trie (level by level) so that a node's failure link always points to an already-fully-computed shallower node — building them via DFS or in the wrong order produces incorrect links.",
    related: ["specialized-trees-trie-structure", "string-algorithms-kmp-overview"],
  },

  // ------------------------------------------------------------------ Manacher
  {
    id: "string-algorithms-manacher",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Manacher's algorithm find the longest palindromic substring in O(n)?",
    back: `Naive approach: check every center (there are $O(n)$ possible centers, accounting for both odd- and even-length palindromes) and expand outward, $O(n)$ per center — $O(n^2)$ total. Manacher's avoids re-expanding from scratch at every center by reusing **already-known palindrome information from centers processed earlier**.

Trick 1: insert a separator character between every pair of characters (e.g. \`"aba"\` → \`"#a#b#a#"\`) so every palindrome — odd or even length in the original — becomes **odd-length** in the transformed string, unifying the two cases into one algorithm.

Trick 2 (the real speedup): maintain the **rightmost known palindrome boundary** $[l, r]$ found so far. For a new center $i$ inside this boundary, its palindrome radius can be **initialized** using the already-computed radius of its **mirror position** across the current palindrome's center (reflected symmetry inside a known palindrome guarantees a matching sub-palindrome there) — then only expand *past* the current boundary $r$ by direct character comparison, exactly the same "reuse known structure, only pay for genuinely new comparisons" pattern as KMP and the Z-algorithm. This bounds total expansion work to $O(n)$ across the whole string.`,
    complexity: {
      structure: "Manacher's Algorithm",
      operations: [{ op: "Longest palindromic substring", time: "O(n)" }],
    },
    pitfall:
      "This is the third algorithm in this module (after KMP and Z-algorithm) built on the exact same core idea — 'a known palindrome/prefix/match gives you a shortcut for nearby positions, so only pay full cost for genuinely new information.' Recognizing that recurring pattern is more useful than memorizing each algorithm's mechanics independently.",
    related: ["string-algorithms-kmp-overview", "string-algorithms-z-algorithm"],
  },

  // -------------------------------------------------------------- Suffix arrays
  {
    id: "string-algorithms-suffix-array",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a suffix array, and how is it constructed?",
    back: `An array of **all suffixes of a string, sorted lexicographically**, stored as their starting indices (not the actual substrings, to avoid $O(n^2)$ space). E.g. for \`"banana"\`: the sorted suffixes are \`"a"\`, \`"ana"\`, \`"anana"\`, \`"banana"\`, \`"na"\`, \`"nana"\`, giving suffix array \`[5, 3, 1, 0, 4, 2]\`.

**Naive construction**: generate all $n$ suffixes and sort them with a standard comparison sort — each comparison can cost $O(n)$ in the worst case, giving $O(n^2 \\log n)$ total.

**Faster construction** (e.g. the prefix-doubling method): sort suffixes by their first $2^k$ characters at each of $O(\\log n)$ rounds, doubling $k$ each round, reusing the **previous round's ranking** to compare $2^k$-length prefixes in $O(1)$ per comparison (a pair's rank is just the concatenation of two already-known $2^{k-1}$-length ranks) — giving $O(n \\log n)$ or $O(n \\log^2 n)$ depending on the sort used per round. Linear-time $O(n)$ construction algorithms (DC3/skew algorithm) exist but are considerably more complex to implement.`,
    complexity: {
      structure: "Suffix Array",
      operations: [
        { op: "Naive construction", time: "O(n² log n)" },
        { op: "Prefix-doubling construction", time: "O(n log n)" },
      ],
    },
    related: ["string-algorithms-lcp-array", "string-algorithms-suffix-array-applications"],
  },
  {
    id: "string-algorithms-lcp-array",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is the LCP array, and how does Kasai's algorithm build it in O(n)?",
    back: `The **LCP (Longest Common Prefix) array**: $LCP[i]$ = length of the longest common prefix between the suffix array's $i$-th and $(i-1)$-th suffixes (adjacent entries in **sorted** order). Combined with the suffix array, this powers several substring queries efficiently (see the applications card).

**Kasai's algorithm** builds it in $O(n)$ from an existing suffix array, exploiting a non-obvious but provable fact: as you process suffixes in **original string order** (not sorted order) and track the LCP of each with its sorted-neighbor, the LCP value can decrease by **at most 1** from one step to the next (compared to the previous suffix's LCP value) — so instead of recomputing each LCP from scratch, start each new comparison from \`max(0, previous_lcp - 1)\` characters in, extending from there. This gives the same amortized "total decrease bounded by total increase" argument seen in the KMP/Z-algorithm family, yielding $O(n)$ total despite computing $n$ separate LCP values.`,
    complexity: {
      structure: "LCP Array (Kasai's)",
      operations: [{ op: "Build from suffix array", time: "O(n)" }],
    },
    related: ["string-algorithms-suffix-array"],
  },
  {
    id: "string-algorithms-suffix-array-applications",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What can you do with a suffix array (+ LCP array) that's hard to do directly?",
    back: `- **Substring search**: since suffixes are sorted, checking whether a pattern occurs anywhere in the text is a **binary search** over the suffix array — $O(m \\log n)$ for pattern length $m$, text length $n$ (compare the pattern against the suffix at each binary-search midpoint).
- **Longest repeated substring**: the answer is the **maximum value in the LCP array** — the two suffixes achieving it, being adjacent in sorted order with maximal shared prefix, directly identify the repeated substring and its length.
- **Longest common substring of two strings**: concatenate the two strings with a separator, build one suffix array over the combination, and search the LCP array for the maximum LCP between two suffixes originating from **different** original strings.
- **Counting distinct substrings**: total substrings possible ($\\binom{n+1}{2}$) minus the sum of the LCP array (each LCP value counts a repeated — non-distinct — prefix overlap once).

Suffix arrays are generally preferred over suffix trees (see that card) in practice for exactly this reason: once built, they support this whole family of queries with simple array operations (binary search, linear LCP scans) rather than tree traversals, and use much less memory.`,
    related: ["string-algorithms-suffix-array", "string-algorithms-lcp-array", "string-algorithms-suffix-tree-conceptual"],
  },
  {
    id: "string-algorithms-suffix-tree-conceptual",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What is a suffix tree, and how does it compare to a suffix array?",
    back: `A **trie** (see the Specialized Trees module) built over all suffixes of a string, but with chains of single-child nodes **compressed** into single edges labeled with substrings (a compressed trie, also called a Patricia trie/radix tree structure) — without compression, a naive suffix trie would use $O(n^2)$ space (each of $n$ suffixes contributing up to $n$ nodes); the compressed form uses $O(n)$ space and can be built in $O(n)$ time with the (famously intricate) Ukkonen's algorithm.

A suffix tree supports the same family of queries as a suffix array (substring search, longest repeated substring, etc.) — often with better asymptotic bounds for some queries (e.g. $O(m)$ substring search instead of $O(m \\log n)$) — but with substantially **higher constant factors and memory overhead** in practice (each node/edge carries pointers and substring-range bookkeeping), and a genuinely harder-to-implement linear-time construction algorithm.

This is why suffix **arrays** (paired with an LCP array, which recovers most of a suffix tree's query power via the "virtual suffix tree" relationship between the two structures) are generally preferred in practice — better constants, simpler implementation, and the small asymptotic query-time edge suffix trees have rarely matters at real data scales.`,
    pitfall:
      "Every query a suffix tree supports can be simulated on a suffix array + LCP array via the well-known correspondence between the two structures — 'suffix tree' and 'suffix array + LCP' are largely interchangeable in terms of what they let you compute, differing mainly in constant factors and implementation complexity, not fundamental capability.",
    related: ["string-algorithms-suffix-array", "specialized-trees-trie-structure"],
  },

  // -------------------------------------------------------------- Comparison
  {
    id: "string-algorithms-matching-comparison",
    tier: 2,
    module: MODULE,
    type: "compare",
    front: "KMP vs. Rabin-Karp vs. Z-algorithm for single-pattern matching — how do you choose?",
    back: `All three achieve $O(n+m)$ for single-pattern search, so the choice is about secondary properties:

- **KMP**: worst-case guaranteed $O(n+m)$, no false positives, deterministic — the safe general-purpose default when you need a hard guarantee.
- **Rabin-Karp**: simplest to extend to **multi-pattern search with a hash set** of pattern hashes (check every window's hash against the set, verify on hit) — a natural fit when you have many patterns of the **same fixed length** and don't want the complexity of Aho-Corasick's failure-link trie. Its worst case is technically $O(nm)$ (adversarial hash collisions), though this is a non-issue in practice with a good hash and modulus.
- **Z-algorithm**: produces a reusable, generally useful array (not just a single match/no-match answer) — worth reaching for when you need broader prefix-structure information about the text beyond just "does this one pattern occur," or when its concatenation-based formulation is simply easier to adapt to a specific problem's shape than KMP's failure-function bookkeeping.

For genuinely **multiple, variable-length** patterns searched simultaneously, none of these three is the right tool — that's Aho-Corasick's specific use case.`,
    related: ["string-algorithms-kmp-overview", "string-algorithms-rabin-karp", "string-algorithms-z-algorithm", "string-algorithms-aho-corasick"],
  },
];
