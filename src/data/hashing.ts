import type { Card } from "./types";

const MODULE = "hashing";

export const hashingCards: Card[] = [
  {
    id: "hashing-good-hash-function",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What properties make a hash function 'good' for a hash table?",
    back: `- **Deterministic**: the same input always produces the same hash — otherwise you could never find something you already inserted.
- **Fast to compute**: $O(1)$ relative to key size (or O(length) for variable-length keys like strings) — a hash table's whole value proposition collapses if hashing itself is expensive.
- **Uniform distribution**: outputs should spread evenly across the output range for realistic input distributions, minimizing collisions. A hash that clusters most inputs into a few buckets degrades the table toward linked-list-like $O(n)$ behavior.
- **Avalanche effect**: a small change in input (even one bit) should produce a large, unpredictable change in output. Without this, similar keys (like sequential integers or near-identical strings) cluster into nearby buckets, undermining uniformity in practice even if the hash looks uniform in theory.

Note that "hard to reverse" (cryptographic security) is generally **not** required for ordinary hash tables — that's a separate, stronger property needed only for cryptographic hash functions (SHA-256 etc.), not for a \`dict\`.`,
    pitfall:
      "A hash function can be uniform on random inputs yet still cluster badly on realistic inputs (e.g. sequential IDs, common English words) if it lacks the avalanche property — always evaluate against your actual key distribution, not just theoretical uniformity.",
    related: ["hashing-load-factor", "hashing-flooding-dos"],
  },
  {
    id: "hashing-separate-chaining",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does separate chaining resolve hash collisions?",
    back: `Each bucket in the hash table holds a small secondary structure (typically a linked list, sometimes a small dynamic array or, for very large chains, a balanced tree) containing all keys that hashed to that bucket. On collision, the new key is simply appended to that bucket's list — no need to find another slot.

Lookup: hash the key to find the bucket, then linearly scan that bucket's list for a match. With a good hash function and reasonable load factor, each bucket holds $O(1)$ keys on average, keeping average-case operations $O(1)$.

Deletion is straightforward — just remove the node from the bucket's list, no special handling needed (unlike open addressing's tombstone problem).`,
    complexity: {
      structure: "Hash Table (Separate Chaining)",
      operations: [
        { op: "Search/Insert/Delete (average)", time: "O(1)", note: "assumes load factor bounded, good hash" },
        { op: "Search/Insert/Delete (worst)", time: "O(n)", note: "all keys collide into one bucket" },
      ],
      caveat: "Extra memory overhead per bucket for the chain's pointers/structure.",
    },
    pitfall:
      "Worst case is O(n) per operation if all keys collide into one bucket — this is exactly the vulnerability hash flooding attacks exploit (see that card) unless the hash function is randomized or collision-resistant.",
    related: ["hashing-open-addressing-linear-probing", "hashing-chaining-vs-open-addressing"],
  },
  {
    id: "hashing-open-addressing-linear-probing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does open addressing with linear probing resolve collisions?",
    back: `All keys live directly in the table's array itself — no secondary structure. On collision at slot $h(k)$, **probe forward** through slots $h(k)+1, h(k)+2, h(k)+3, ...$ (wrapping around) until an empty slot is found, and insert there. Lookup follows the same probe sequence until it finds the key or hits an empty slot (which proves the key isn't present).

The problem: **primary clustering**. Once several keys land in consecutive slots, any new key hashing near that cluster has to probe through the whole cluster to find a free slot — and every such insertion *extends* the cluster, making the problem self-reinforcing. This degrades average probe length well before the table is actually full.`,
    complexity: {
      structure: "Hash Table (Open Addressing)",
      operations: [
        { op: "Search/Insert/Delete (average, low load factor)", time: "O(1)" },
        { op: "Search/Insert/Delete (as load factor → 1)", time: "degrades sharply", note: "primary clustering" },
      ],
      caveat: "No extra per-bucket memory — better cache locality than chaining, since probing stays within the array.",
    },
    pitfall:
      "Deletion cannot simply empty the slot — a later lookup's probe sequence would stop early at that now-empty slot, incorrectly reporting 'not found' for a key that was actually probed past it. See the tombstone card.",
    related: ["hashing-quadratic-probing", "hashing-tombstones"],
  },
  {
    id: "hashing-quadratic-probing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does quadratic probing improve on linear probing, and what problem remains?",
    back: `Instead of probing sequentially ($+1, +2, +3, ...$), probe at increasing quadratic offsets from the original hash: $h(k), h(k)+1^2, h(k)+2^2, h(k)+3^2, ...$ (mod table size). This scatters probes further from the initial cluster, largely avoiding **primary clustering**.

**Secondary clustering** remains: keys that hash to the *same* initial slot $h(k)$ still follow the *exact same probe sequence* as each other, so they keep colliding with each other at every step — just spread across a different (still shared) sequence of slots rather than jamming one contiguous run. It's a real improvement, but not a complete fix.

A subtler issue: with certain table sizes, quadratic probing's sequence may not visit every slot, meaning insertion can fail to find a free slot even when the table isn't full — using a prime table size (or a power-of-two size with specific probe constants) is required to guarantee full coverage.`,
    pitfall:
      "Quadratic probing needs a carefully chosen table size (commonly prime) to guarantee the probe sequence covers all slots — an arbitrary table size can cause insertions to fail with 'table full' false positives.",
    related: ["hashing-open-addressing-linear-probing", "hashing-double-hashing"],
  },
  {
    id: "hashing-double-hashing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does double hashing resolve both primary and secondary clustering?",
    back: `Use a **second, independent hash function** $h_2(k)$ to determine the probe step size itself: probe sequence is $h_1(k), h_1(k) + h_2(k), h_1(k) + 2h_2(k), ...$ (mod table size). Since the step size now depends on the key (via $h_2$), two keys that collide at $h_1$ almost certainly have *different* step sizes, so they diverge onto different probe sequences after the first collision — eliminating secondary clustering, not just spreading it out.

This is generally the best-performing open-addressing scheme in practice, at the cost of computing two hash functions per operation instead of one. $h_2(k)$ must never evaluate to 0 (or the probe sequence degenerates to a single repeated slot) — commonly enforced as $h_2(k) = 1 + (k \\bmod (m-1))$ for table size $m$.`,
    related: ["hashing-quadratic-probing", "hashing-probing-comparison"],
  },
  {
    id: "hashing-probing-comparison",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Linear vs. quadratic vs. double hashing — how do their clustering behaviors compare?",
    back: `| Scheme | Probe sequence | Clustering issue | Cache behavior |
|---|---|---|---|
| Linear probing | $h(k), h(k)+1, h(k)+2, ...$ | Primary clustering — colliding runs merge and grow | Best (sequential access) |
| Quadratic probing | $h(k), h(k)+1, h(k)+4, h(k)+9, ...$ | Secondary clustering — same-hash keys share a sequence | Worse (jumps around) |
| Double hashing | $h_1(k), h_1(k)+h_2(k), h_1(k)+2h_2(k), ...$ | Neither (different keys diverge quickly) | Worst (least predictable jumps) |

The general pattern: each scheme fixes the previous one's clustering problem at the cost of worse memory-access locality (bigger, less predictable jumps through the array). Real-world hash table implementations pick based on this trade-off — e.g. Python's dict uses a form of open addressing with pseudo-random probing (closer to the double-hashing family) specifically to avoid clustering pathologies.`,
    related: ["hashing-open-addressing-linear-probing", "hashing-double-hashing"],
  },
  {
    id: "hashing-chaining-vs-open-addressing",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Separate chaining vs. open addressing — what's the overall trade-off?",
    back: `| | Separate Chaining | Open Addressing |
|---|---|---|
| Memory overhead | Extra pointers per chain node | None — keys stored directly in the array |
| Load factor > 1? | Fine — chains just get longer | Impossible — table must always have a free slot |
| Cache locality | Poor (chain nodes scattered) | Good (probing stays within the array) |
| Deletion | Simple (unlink node) | Needs tombstones (see that card) |
| Degrades how? | Long chains → O(n) per op in the worst bucket | Clustering → longer probe sequences everywhere |

Chaining is simpler to reason about and tolerates a higher load factor gracefully; open addressing is generally faster in practice at moderate load factors due to cache locality, but requires careful load-factor management (typically resizing well before load factor reaches 1, often around 0.7) and correct tombstone handling for deletion.`,
    related: ["hashing-separate-chaining", "hashing-open-addressing-linear-probing", "hashing-load-factor"],
  },
  {
    id: "hashing-tombstones",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does deletion in an open-addressing hash table need tombstones?",
    back: `Lookup in open addressing relies on probing until it finds either the key or an **empty slot** (which signals "definitely not present, stop searching"). If deletion just clears a slot to empty, it breaks this invariant: a later lookup for a *different* key that originally probed *through* the deleted slot would now stop early at the empty slot and incorrectly report "not found," even though the key exists further along the original probe sequence.

The fix: mark deleted slots with a special **tombstone** marker instead of plain-empty. Lookups treat a tombstone as "occupied, keep probing" (don't stop), while insertions treat it as "available, can be reused." Over many deletions, accumulated tombstones degrade probe-sequence length (functionally like an increased load factor) — most implementations periodically rebuild/rehash the table to clear tombstones once they accumulate past some threshold.`,
    pitfall:
      "Treating a tombstone as truly empty during lookup breaks correctness (false negatives); treating it as occupied during insertion wastes space unnecessarily by refusing to reuse the slot — the two operations must treat tombstones differently.",
    related: ["hashing-open-addressing-linear-probing"],
  },
  {
    id: "hashing-load-factor",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is load factor, and why does it matter for hash table performance?",
    back: `Load factor $\\alpha = n / m$, where $n$ is the number of stored keys and $m$ is the number of buckets/slots. It measures how "full" the table is.

- **Separate chaining**: average chain length is $\\alpha$, so average search cost is $O(1 + \\alpha)$ — performance degrades gracefully and linearly as $\\alpha$ grows past 1.
- **Open addressing**: $\\alpha$ must stay $< 1$ (there must always be room to probe into), and expected probe length grows sharply as $\\alpha \\to 1$ — roughly $\\frac{1}{1-\\alpha}$ for random probing schemes. At $\\alpha = 0.9$, expected probes are already ~10; the degradation is far from linear.

This is why every practical hash table implementation **resizes well before the table is full** — commonly triggering a resize once $\\alpha$ crosses a threshold like 0.7, rather than waiting until 1.0.`,
    pitfall:
      "Assuming a hash table stays O(1) at any load factor — open addressing in particular degrades sharply (not gracefully) as load factor approaches 1, which is why implementations resize well before actually running out of slots.",
    related: ["hashing-resizing-rehashing", "hashing-good-hash-function"],
  },
  {
    id: "hashing-resizing-rehashing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What happens when a hash table resizes, and why is it amortized O(1) per insertion overall?",
    back: `When load factor crosses the resize threshold, the table allocates a larger backing array (typically **doubling**, same growth strategy as a dynamic array) and must **rehash every existing key** into the new array — because a key's slot depends on \`hash(key) % new_size\`, which changes when \`new_size\` changes. This is an $O(n)$ operation.

The amortized argument is structurally identical to a dynamic array's doubling: resizes happen at sizes $1, 2, 4, 8, ..., n$, so total rehashing work across $n$ insertions is $O(n)$ (geometric series), giving $O(1)$ amortized cost per insertion — see the aggregate-method proof in the Complexity & Analysis module for the general technique.`,
    complexity: {
      structure: "Hash Table",
      operations: [
        { op: "Insert", time: "O(1) amortized", note: "O(n) worst case, on resize/rehash" },
      ],
    },
    related: ["hashing-load-factor", "complexity-analysis-aggregate-method", "linear-structures-doubling-growth-factor"],
  },
  {
    id: "hashing-set-vs-map",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Hash set vs. hash map — what's the actual difference?",
    back: `A hash **map** (dictionary) stores key→value pairs; a hash **set** stores keys only, with no associated value — it answers "is this element present?" rather than "what value is associated with this key?"

Mechanically, a hash set is almost always implemented as a hash map whose values are ignored/unit (e.g. Java's \`HashSet\` is internally backed by a \`HashMap\` with a dummy value). Same hashing, collision resolution, and load-factor mechanics apply identically — the distinction is purely about the interface and use case: sets for membership testing and deduplication, maps for key-value association.`,
    related: ["hashing-real-world-uses"],
  },
  {
    id: "hashing-mutable-keys-pitfall",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why can't (or shouldn't) you use a mutable object as a hash table key?",
    back: `A key's hash value determines which bucket it's stored in. If the key object is **mutated after insertion** in a way that changes its hash (e.g. mutating a list used as a key, or a custom object whose \`__hash__\` depends on mutable fields), the object is now sitting in the *wrong* bucket for its *new* hash value — a subsequent lookup computes the new hash, checks the new bucket, and doesn't find it there, even though the object is still physically in the table (in the old bucket). The entry becomes silently unreachable.

This is exactly why Python makes lists unhashable (raises \`TypeError\`) while tuples are hashable — tuples are immutable, so their hash is guaranteed stable for their lifetime. The general rule: a type is safe as a hash key only if its hash (and equality) are guaranteed not to change while it's stored in the table — which for practical purposes means **immutable, or at least never mutated while used as a key**.`,
    pitfall:
      "This bug is especially nasty because it doesn't crash — the entry silently becomes unfindable while still consuming space in the table, which is much harder to debug than an outright error.",
    related: ["hashing-good-hash-function"],
  },
  {
    id: "hashing-flooding-dos",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is hash flooding, and how do real systems defend against it?",
    back: `If an attacker can predict (or reverse-engineer) a hash function's behavior, they can craft a large set of keys that **all collide into the same bucket** (or same probe sequence). Inserting/looking up such keys then degrades from expected $O(1)$ to worst-case $O(n)$ *per operation* — turning an $O(n)$ workload into $O(n^2)$, a genuine algorithmic-complexity denial-of-service vector. This is a real, historically exploited vulnerability (e.g. crafted form-POST keys against web frameworks using naive hash tables for parsed parameters, circa 2011-2012, affected PHP, Java, and others).

**Defense**: randomize the hash function per-process (a random seed mixed into the hash, so the attacker can't predict bucket assignment without knowing the seed) — Python's \`PYTHONHASHSEED\`, and language runtimes generally moving to **SipHash** or similar keyed hash functions for string/bytes hashing specifically because they're designed to resist this kind of collision-crafting even when the attacker knows the algorithm, as long as they don't know the secret seed.`,
    pitfall:
      "This is a real reason hash(str) differs between Python process runs by default (unless PYTHONHASHSEED is fixed) — code that relies on hash values being stable across runs (e.g. for serialization or caching hash values to disk) will break, which is the correct trade-off for security but surprises people expecting determinism.",
    related: ["hashing-good-hash-function", "hashing-separate-chaining"],
  },
  {
    id: "hashing-real-world-uses",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Where are hash tables used in practice, beyond the language's built-in dict/map?",
    back: `- **Language-level dictionaries/objects**: Python \`dict\`, JavaScript object property storage, Java \`HashMap\` — the default general-purpose key-value structure in nearly every language.
- **Caches**: in-memory caches (e.g. an LRU cache pairs a hash map for O(1) key lookup with a doubly linked list for O(1) recency tracking — see Heaps/Trees modules for other cache-adjacent structures).
- **Deduplication**: inserting items into a hash set and checking membership before insertion is the standard $O(n)$-total way to dedupe a collection, versus $O(n^2)$ pairwise comparison or $O(n \\log n)$ sort-then-scan.
- **Database indexing** (hash indexes): fast equality lookups, though unlike B-tree indexes (Tier 2) they don't support range queries.
- **Content-addressable storage / caching by content hash**: e.g. Git's object store, package manager lockfiles — using a hash of content itself as the lookup key.`,
    related: ["hashing-set-vs-map"],
  },
  {
    id: "hashing-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement a basic hash table with separate chaining (insert, get, delete).",
    back: `A fixed number of buckets, each a Python list of \`(key, value)\` pairs. This omits resizing for brevity — a production version would track load factor and rehash into a larger bucket array once it crosses a threshold.`,
    code: `class HashTable:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.buckets = [[] for _ in range(capacity)]

    def _bucket(self, key):
        return self.buckets[hash(key) % self.capacity]

    def insert(self, key, value):
        bucket = self._bucket(key)
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)  # overwrite
                return
        bucket.append((key, value))

    def get(self, key):
        for k, v in self._bucket(key):
            if k == key:
                return v
        raise KeyError(key)

    def delete(self, key):
        bucket = self._bucket(key)
        for i, (k, _) in enumerate(bucket):
            if k == key:
                del bucket[i]
                return
        raise KeyError(key)`,
    complexity: {
      structure: "Hash Table (Separate Chaining)",
      operations: [{ op: "Insert/Get/Delete (average)", time: "O(1)" }],
    },
    related: ["hashing-separate-chaining"],
  },
  {
    id: "hashing-collision-trace",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "Table size 5, linear probing. Insert keys with hashes 2, 7, 3, 2 (in that order — hash values shown, not raw keys). Which slots do they land in?",
    back: `Slot = hash mod 5.

- Key A (hash 2) → slot $2 \\bmod 5 = 2$. Slot 2 empty → placed at **slot 2**.
- Key B (hash 7) → slot $7 \\bmod 5 = 2$. Slot 2 occupied → probe slot 3 → empty → placed at **slot 3**.
- Key C (hash 3) → slot $3 \\bmod 5 = 3$. Slot 3 occupied (by B) → probe slot 4 → empty → placed at **slot 4**.
- Key D (hash 2) → slot $2 \\bmod 5 = 2$. Occupied (A) → probe 3 (occupied, C... wait, B) → probe 4 (occupied, C) → probe $5 \\bmod 5 = 0$ → empty → placed at **slot 0**.

Final layout: slot 0 = D, slot 2 = A, slot 3 = B, slot 4 = C, slot 1 = empty.

Notice how three of the four keys (A, B, D all hashing near 2) ended up clustered in slots 0, 2, 3, 4 — a concrete small-scale illustration of primary clustering from linear probing.`,
    related: ["hashing-open-addressing-linear-probing"],
  },
];
