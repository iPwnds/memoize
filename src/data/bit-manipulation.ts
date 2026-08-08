import type { Card } from "./types";

const MODULE = "bit-manipulation";

export const bitManipulationCards: Card[] = [
  {
    id: "bit-manipulation-operators-refresher",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "Refresher: what do AND, OR, XOR, NOT, and the shift operators do, bit by bit?",
    back: `- **AND (\`&\`)**: 1 only if **both** bits are 1. Used to test/clear specific bits (a bit ANDed with 0 is forced to 0; ANDed with 1 is unchanged).
- **OR (\`|\`)**: 1 if **either** bit is 1. Used to set specific bits (a bit ORed with 1 is forced to 1; ORed with 0 is unchanged).
- **XOR (\`^\`)**: 1 if the bits **differ**. Used for toggling and difference-detection (see the XOR-properties card — it has unusually useful algebraic properties).
- **NOT (\`~\`)**: flips every bit. In two's-complement representation, \`~x\` equals \`-x - 1\` — a common source of off-by-one surprises if you expect a naive "flip the bits" magnitude.
- **Left shift (\`<<\`)**: shifts bits left, filling with 0s — equivalent to multiplying by $2^k$ for a shift of $k$ (ignoring overflow).
- **Right shift (\`>>\`)**: shifts bits right — equivalent to (integer) division by $2^k$. For signed integers, this is typically an **arithmetic** shift (fills with copies of the sign bit, preserving sign), distinct from a **logical** shift (fills with 0s) some languages expose separately (e.g. Java's \`>>>\`).`,
    pitfall:
      "Right-shifting a negative number is language/mode-dependent — Python's `>>` on ints is arithmetic (sign-extending, since Python ints are conceptually unbounded), while C/Java distinguish signed (`>>`) vs unsigned (`>>>` in Java) shifts explicitly. Don't assume shift behavior transfers across languages unchecked.",
    related: ["bit-manipulation-xor-properties"],
  },
  {
    id: "bit-manipulation-xor-properties",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "What algebraic properties of XOR make it so useful for bit-manipulation tricks?",
    back: `- $a \\oplus a = 0$ (anything XORed with itself cancels to zero) — the foundation of the find-the-unique-element trick.
- $a \\oplus 0 = a$ (XOR with zero is a no-op) — the identity element.
- **Commutative and associative**: $a \\oplus b = b \\oplus a$, and $(a \\oplus b) \\oplus c = a \\oplus (b \\oplus c)$ — meaning you can XOR a whole collection of values together in **any order** and get the same result, which is exactly what lets the "find the unique element" trick work regardless of array order.
- **Self-inverse**: XORing by the same value twice returns the original — $(a \\oplus b) \\oplus b = a$. This is what powers "swap without a temp variable" and is also the basis of simple XOR-cipher encryption (XOR with a key, XOR with the same key again to decrypt).

Together, these properties make XOR the tool of choice whenever a problem involves **pairing/cancellation** — "everything appears twice except one," "find what changed between two states," toggling a bit on/off repeatedly.`,
    related: ["bit-manipulation-find-unique-element", "bit-manipulation-xor-swap"],
  },
  {
    id: "bit-manipulation-find-unique-element",
    tier: 2,
    module: MODULE,
    type: "implementation",
    front: "Given an array where every element appears twice except one, find the unique element using XOR.",
    back: `XOR every element together — pairs cancel to 0 (using $a \\oplus a = 0$), and the identity ($a \\oplus 0 = a$) leaves exactly the unpaired element standing, regardless of array order (thanks to XOR's commutativity/associativity).`,
    code: `def find_unique(nums):
    result = 0
    for x in nums:
        result ^= x
    return result`,
    complexity: {
      structure: "Find Unique Element (XOR)",
      operations: [{ op: "Find", time: "O(n)", space: "O(1)", note: "vs O(n) time + O(n) space for a hash-set approach" }],
    },
    pitfall:
      "This trick specifically requires EXACTLY one element to be unpaired and every other element to appear an EVEN number of times — it silently gives a wrong (meaningless) answer if, say, elements can appear three times, or if two elements are each unpaired (their XOR contribution doesn't cancel out to reveal either one individually).",
    related: ["bit-manipulation-xor-properties"],
  },
  {
    id: "bit-manipulation-xor-swap",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does swapping two variables via XOR (without a temp variable) work, and why isn't it actually recommended?",
    back: `\`\`\`
a ^= b   # a = a ^ b
b ^= a   # b = b ^ (a ^ b) = a          (since b ^ b = 0)
a ^= b   # a = (a ^ b) ^ a = b          (since a ^ a = 0)
\`\`\`
Each step relies on the self-inverse property: XORing a value into another and then XORing again "recovers" the original operand while the target ends up holding what used to be the other one.

**Why it's mostly a curiosity, not a real recommendation**: it fails silently if \`a\` and \`b\` are the **same memory location** (e.g. swapping \`arr[i]\` with itself when \`i == j\`) — all three operations zero it out, permanently destroying the value, since every step degenerates to \`x ^= x\`. Modern languages also make plain tuple/temp-variable swaps (\`a, b = b, a\` in Python) just as fast and vastly clearer — this trick is worth knowing conceptually (it's a clean illustration of XOR's self-inverse property) but shouldn't be reached for in real production code.`,
    pitfall:
      "The classic gotcha: XOR-swapping a value with itself (aliased indices) zeroes it out instead of leaving it unchanged — always guard against a == b (by identity/index, not just by value) before using this trick, or just don't use it.",
    related: ["bit-manipulation-xor-properties"],
  },

  // -------------------------------------------------------------- Bitmasking
  {
    id: "bit-manipulation-bitmask-subsets",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does bitmasking enumerate all subsets of a set?",
    back: `For a set of $n$ elements, every possible subset corresponds to exactly one integer in $[0, 2^n - 1]$: **bit $i$ of the integer is 1 if element $i$ is included, 0 if excluded**. Iterating \`mask\` from $0$ to $2^n - 1$ and checking each bit therefore enumerates **every** subset exactly once, including the empty set (\`mask = 0\`) and the full set (\`mask = 2^n - 1\`).

This is the mechanical foundation behind bitmask DP (see the Dynamic Programming module's TSP card, which uses exactly this encoding for "which cities have been visited") and is often simpler and faster in practice than a recursive include/exclude backtracking enumeration (Tier 2 Backtracking module) for small $n$ — no recursion overhead, just integer arithmetic and bit tests.`,
    code: `def all_subsets(elements):
    n = len(elements)
    result = []
    for mask in range(1 << n):        # 0 to 2^n - 1
        subset = [elements[i] for i in range(n) if mask & (1 << i)]
        result.append(subset)
    return result`,
    complexity: {
      structure: "Bitmask Subset Enumeration",
      operations: [{ op: "Enumerate all 2ⁿ subsets", time: "O(n · 2ⁿ)" }],
    },
    pitfall:
      "This only scales to roughly n ≤ 20-25 in practice — 2ⁿ grows explosively (see the Complexity & Analysis module's growth-at-scale card), so bitmask enumeration is a small-n technique, not a general one.",
    related: ["dynamic-programming-bitmask-tsp", "backtracking-subsets"],
  },

  // ---------------------------------------------------------- Counting bits
  {
    id: "bit-manipulation-brian-kernighan",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does Brian Kernighan's trick count set bits faster than checking every bit position?",
    back: `Naively counting set bits checks all $b$ bit positions (e.g. 32 or 64), regardless of how many are actually set: $O(b)$.

Brian Kernighan's trick exploits: \`n & (n - 1)\` **clears the lowest set bit** of \`n\` (subtracting 1 flips the lowest set bit to 0 and every bit below it to 1; ANDing with the original \`n\` then re-clears those flipped-to-1 lower bits, netting "lowest set bit turned off, everything else unchanged"). Repeatedly applying this and counting iterations until \`n\` reaches 0 counts set bits in $O(\\text{popcount}(n))$ — proportional to the **number of set bits**, not the total bit width. For a sparse number (few 1s), this is a real speedup over the naive $O(b)$ scan; for a dense number (mostly 1s), it's no better (many production languages/CPUs also expose a dedicated \`popcount\` hardware instruction that's faster than either approach).`,
    code: `def count_set_bits(n):
    count = 0
    while n:
        n &= n - 1   # clear the lowest set bit
        count += 1
    return count`,
    complexity: {
      structure: "Brian Kernighan's Bit Count",
      operations: [
        { op: "Naive (check every bit)", time: "O(b)", note: "b = bit width" },
        { op: "Brian Kernighan's", time: "O(popcount(n))", note: "proportional to number of set bits" },
      ],
    },
    related: ["bit-manipulation-power-of-two"],
  },

  // -------------------------------------------------------- Single-instruction tricks
  {
    id: "bit-manipulation-power-of-two",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does n & (n-1) == 0 check whether n is a power of two, in a single operation?",
    back: `A power of two has **exactly one set bit** (e.g. \`8 = 0b1000\`). Brian Kernighan's \`n & (n-1)\` clears the lowest set bit (see that card) — if \`n\` had only one set bit to begin with, clearing it leaves **zero**. If \`n\` had more than one set bit, clearing just the lowest one leaves something nonzero.

So: \`n > 0 and (n & (n - 1)) == 0\` is a complete, branch-free power-of-two check (the \`n > 0\` guard is needed because \`n = 0\` would otherwise pass the bit test despite not being a valid power of two — \`0 & -1 == 0\`, a degenerate case worth explicitly excluding).`,
    code: `def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0`,
    pitfall:
      "Forgetting the `n > 0` guard lets 0 pass the check incorrectly — `0 & (0 - 1)` evaluates to 0 in two's complement, satisfying the bit-clearing condition despite 0 not being a power of two.",
    related: ["bit-manipulation-brian-kernighan", "bit-manipulation-isolate-lowest-bit"],
  },
  {
    id: "bit-manipulation-isolate-lowest-bit",
    tier: 2,
    module: MODULE,
    type: "concept",
    front: "How does n & -n isolate the lowest set bit of n, and where has this trick already appeared in the curriculum?",
    back: `In two's complement, \`-n\` is \`~n + 1\`. Flipping all bits and adding 1 has the effect of leaving every bit **below** the lowest set bit of \`n\` **unchanged as 0**, flipping the lowest set bit's position appropriately, and flipping everything above it — the net result is that \`n & -n\` produces a value with **only the lowest set bit of \`n\` turned on**, everything else 0.

This exact expression is the core mechanism behind the **Fenwick tree / Binary Indexed Tree**'s \`i & -i\` operation (Tier 2, Specialized Trees module) — that's not a coincidence or a separate trick to memorize independently, it's a direct application of this same bit-isolation identity, used there to determine each index's range-responsibility size.`,
    code: `def lowest_set_bit(n):
    return n & (-n)`,
    related: ["specialized-trees-fenwick-tree", "bit-manipulation-brian-kernighan"],
  },
];
