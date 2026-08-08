import type { Card } from "./types";

const MODULE = "probabilistic-structures";

export const probabilisticStructuresCards: Card[] = [
  // -------------------------------------------------------------- Bloom filter
  {
    id: "probabilistic-structures-bloom-filter-structure",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does a Bloom filter's structure support membership testing in O(1) with very little memory?",
    back: `A Bloom filter is a **bit array** of size $m$ (all zeros initially) plus $k$ independent hash functions. **Insert** an element: compute its $k$ hash values (each mapped into $[0, m)$), and set all $k$ corresponding bits to 1. **Query** "is $x$ present?": compute the same $k$ hash values, and check whether **all** $k$ corresponding bits are set — if even one is 0, $x$ was **definitely never inserted**; if all $k$ are 1, $x$ was **probably** inserted (but possibly not — see the false-positive card).

This trades exactness for extreme space efficiency: unlike a hash set, a Bloom filter never stores the elements themselves, only a shared bit array — so memory usage is independent of element size and grows only with $m$ (chosen based on desired accuracy, not the data itself). Both insert and query are $O(k)$ — a small constant, independent of the number of elements stored.`,
    complexity: {
      structure: "Bloom Filter",
      operations: [
        { op: "Insert", time: "O(k)", space: "O(m) total, m << n·element_size" },
        { op: "Query", time: "O(k)" },
      ],
    },
    related: ["probabilistic-structures-bloom-false-positives"],
  },
  {
    id: "probabilistic-structures-bloom-false-positives",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "Why can a Bloom filter have false positives but never false negatives?",
    back: `**No false negatives**: inserting an element sets specific bits to 1 and they're **never cleared** by a plain Bloom filter (no delete operation) — so if $x$ was genuinely inserted, all $k$ of its bits are guaranteed still set, and a query for $x$ will always find them all set. A "not present" answer is therefore always trustworthy.

**False positives possible**: because many elements share the same $m$-sized bit array, it's possible for **other** elements' insertions to have coincidentally set all $k$ of some *different*, never-inserted element's bits — purely by bit-array overlap, with no way to distinguish "these bits are set because I was inserted" from "these bits happen to be set because of unrelated insertions." A "probably present" answer can therefore occasionally be wrong.

The false-positive rate grows as the bit array fills up (more insertions → more 1-bits → higher chance of coincidental all-1 overlaps) — it's approximately $(1 - e^{-kn/m})^k$ for $n$ inserted elements, $m$ bits, $k$ hash functions, which is minimized for a given $m, n$ by choosing $k \\approx (m/n)\\ln 2$.`,
    pitfall:
      "Using a Bloom filter where a false positive is unacceptable (e.g. as the sole check before an irreversible destructive action) is a design error — Bloom filters are appropriate exactly when a false positive triggers a cheap fallback check (like an actual disk/database lookup), not when it directly causes harm.",
    related: ["probabilistic-structures-bloom-filter-structure", "probabilistic-structures-bloom-sizing"],
  },
  {
    id: "probabilistic-structures-bloom-sizing",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What's the practical trade-off in choosing a Bloom filter's size m and hash count k?",
    back: `Given an expected number of elements $n$ and a target false-positive rate $\\epsilon$, the standard formulas are:
$$m = -\\frac{n \\ln \\epsilon}{(\\ln 2)^2} \\qquad k = \\frac{m}{n}\\ln 2$$

Intuition, without deriving the formulas: **more bits ($m$) per element** means sparser bit occupancy, so fewer accidental all-1 overlaps — lower false-positive rate, at the cost of more memory. **More hash functions ($k$)** sets more bits per insertion (making false positives from any single missing bit less likely) but also fills the array faster (more total bits set for the same $n$), so there's a genuine optimum $k$ for a given $m/n$ ratio — too few or too many hash functions both hurt.

A practical takeaway that doesn't require memorizing the formulas: a Bloom filter sized for roughly **10 bits per element** achieves a false-positive rate around 1%, with $k \\approx 7$ — a useful rule-of-thumb starting point.`,
    related: ["probabilistic-structures-bloom-false-positives"],
  },
  {
    id: "probabilistic-structures-bloom-implementation",
    tier: 3,
    module: MODULE,
    type: "implementation",
    front: "Implement a basic Bloom filter using multiple hash functions derived from one base hash.",
    back: `Deriving $k$ hash functions from two independent base hashes (double hashing, same trick as open-addressing probe sequences — Tier 1 Hashing module) avoids needing $k$ genuinely independent hash function implementations.`,
    code: `import hashlib

class BloomFilter:
    def __init__(self, size, num_hashes):
        self.size = size
        self.num_hashes = num_hashes
        self.bits = [0] * size

    def _hashes(self, item):
        h1 = int(hashlib.md5(item.encode()).hexdigest(), 16)
        h2 = int(hashlib.sha1(item.encode()).hexdigest(), 16)
        return [(h1 + i * h2) % self.size for i in range(self.num_hashes)]

    def add(self, item):
        for idx in self._hashes(item):
            self.bits[idx] = 1

    def might_contain(self, item):
        return all(self.bits[idx] for idx in self._hashes(item))`,
    related: ["probabilistic-structures-bloom-filter-structure"],
  },

  // ---------------------------------------------------------- Count-Min Sketch
  {
    id: "probabilistic-structures-count-min-sketch",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does Count-Min Sketch estimate item frequency, and why does it only ever overestimate?",
    back: `A 2D array of counters with $d$ rows, each row $w$ columns wide, paired with $d$ independent hash functions (one per row). **Update** (increment count for item $x$): for each row $i$, hash $x$ with row $i$'s hash function to get a column, and **increment** that counter. **Query** (estimate count for $x$): hash $x$ the same way for each row, and return the **minimum** value found across all $d$ rows.

Why the minimum, and why it only overestimates: each row's counter for $x$'s hash bucket also accumulates increments from **other items that happen to hash to the same bucket in that row** (a collision) — so any single row's count is $\\geq$ the true count, never less. Taking the **minimum across all $d$ rows** is a way of picking the row where $x$'s bucket happened to collide with the fewest other heavy items — the estimate is provably always $\\geq$ the true frequency, and with enough independent rows, very likely close to it. This is the frequency-counting analogue of a Bloom filter's one-sided error (false positives only, never false negatives) — Count-Min Sketch has **overestimates only, never underestimates**.`,
    complexity: {
      structure: "Count-Min Sketch",
      operations: [
        { op: "Update", time: "O(d)" },
        { op: "Query (estimate)", time: "O(d)" },
      ],
    },
    pitfall:
      "Count-Min Sketch estimates can be significantly inflated for items that collide with 'heavy hitters' (very frequent items) in every row — it's most accurate for finding/tracking approximate frequencies of high-frequency items, less reliable for precise counts of rare ones.",
    related: ["probabilistic-structures-bloom-filter-structure"],
  },

  // --------------------------------------------------------------- HyperLogLog
  {
    id: "probabilistic-structures-hyperloglog",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does HyperLogLog estimate the number of distinct elements using almost no memory?",
    back: `The cardinality-estimation problem: "how many **distinct** elements have I seen in a huge (or unbounded/streaming) collection, allowing duplicates?" — exactly is $O(n)$ space (a hash set). HyperLogLog approximates it in a **remarkably small, fixed amount of memory** (a few KB, regardless of whether the true cardinality is thousands or billions).

**Core idea**: hash every incoming element to a uniform-looking bit string. The key statistical observation: if you've seen $N$ distinct random bit strings, the **longest run of leading zeros** observed across all of them tends to be around $\\log_2 N$ — seeing a hash with, say, 20 leading zero bits is a rare event that only becomes likely once you've hashed roughly $2^{20}$ distinct values, so the maximum leading-zero-run-length seen so far is itself an estimator of $\\log_2(\\text{cardinality})$.

**Reducing variance**: rather than tracking one single max-leading-zeros value (which is noisy — a single unlucky/lucky hash skews it badly), HyperLogLog splits the hash space into many **buckets** (via a few bits of the hash used as a bucket index) and tracks the max leading-zero-run **per bucket**, then **averages** (harmonically) across all buckets — combining many noisy per-bucket estimates into one much more stable overall estimate, the same "reduce variance via averaging many samples" principle used throughout statistics.`,
    complexity: {
      structure: "HyperLogLog",
      operations: [
        { op: "Add element", time: "O(1)" },
        { op: "Estimate cardinality", time: "O(m)", note: "m = number of buckets, typically a small constant like 2^14" },
      ],
    },
    pitfall:
      "HyperLogLog answers 'approximately how many distinct elements' with a typical error around 1-2% for standard configurations — it does NOT support exact counts, and it does NOT support membership queries (unlike a Bloom filter) — it only ever answers the single question 'how many distinct,' nothing about which specific elements were seen.",
    related: ["probabilistic-structures-cardinality-use-cases"],
  },
  {
    id: "probabilistic-structures-cardinality-use-cases",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "Where is HyperLogLog actually used, and why does the memory saving matter so much there?",
    back: `Real uses: counting **unique visitors** to a website across billions of page views, counting **distinct search queries**, database query planners estimating the number of distinct values in a column (for join/query optimization), and network traffic analysis (distinct IP addresses/flows seen).

Why the memory saving is the whole point: an exact distinct-count requires storing every unique element seen (a hash set) — for "unique visitors this month" at internet scale, that could be gigabytes of memory just to answer one aggregate number. HyperLogLog answers the same question using **a few kilobytes**, a difference of many orders of magnitude, at the cost of a small (typically ~1-2%), well-characterized approximation error — a trade nearly always worth making for analytics/monitoring dashboards, where an exact count is rarely actually required, just a reliable order-of-magnitude figure.

Redis includes HyperLogLog as a built-in data type (\`PFADD\`/\`PFCOUNT\`) specifically because this exact use case (approximate unique counts at scale) is so common in production systems.`,
    related: ["probabilistic-structures-hyperloglog"],
  },

  // -------------------------------------------------------------- Comparison
  {
    id: "probabilistic-structures-comparison",
    tier: 3,
    module: MODULE,
    type: "compare",
    front: "Bloom filter vs. Count-Min Sketch vs. HyperLogLog — what does each actually estimate, and when do you reach for which?",
    back: `All three trade exactness for dramatic memory savings, but they answer **different questions**:

| | Answers | Error direction | Use when |
|---|---|---|---|
| Bloom filter | "Is x a member?" | False positives only, never false negatives | Membership testing at scale (e.g. 'has this URL been crawled before?' before an expensive lookup) |
| Count-Min Sketch | "How many times has x occurred?" | Overestimates only, never underestimates | Approximate frequency counting / finding heavy hitters in a stream |
| HyperLogLog | "How many DISTINCT elements have occurred?" | Small statistical error, both directions | Approximate cardinality estimation (unique visitor counts, etc.) |

The common thread across all three (and across this whole module): each accepts a small, well-characterized, one-directional-or-bounded error in exchange for memory usage that's **independent of the number of elements** or **far smaller** than an exact structure would need — the right family of tools whenever "approximately right, using almost no memory" beats "exactly right, using a lot of memory" for the actual use case.`,
    related: ["probabilistic-structures-bloom-filter-structure", "probabilistic-structures-count-min-sketch", "probabilistic-structures-hyperloglog"],
  },
];
