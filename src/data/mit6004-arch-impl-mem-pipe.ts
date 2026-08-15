// MIT 6.004 (Spring 2009) — Lectures 14-16, 22-23: building a real Beta
// implementation (CPU design tradeoffs, incremental-featurism datapath
// construction, exceptions), the memory hierarchy and cache design
// (locality, associativity, replacement, block size, write strategy), and
// pipelining that implementation (why the Beta is harder to pipeline than
// a combinational circuit, branch delay slots, data/load hazards, bypass
// paths, stalling, and exception handling in a pipelined machine). See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6004-arch";

export const mit6004ArchImplMemPipeCards: Card[] = [
  // --- Lecture 14: Non-pipelined Beta implementation ---
  {
    id: "mit6004-arch-impl-cpu-tradeoffs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the CPU performance formula MIPS = Freq/CPI, and the three competing design goals ('maximum performance', 'minimum cost', 'best performance/price') a CPU implementation is judged against.",
    back: `**MIPS** (Millions of Instructions Per Second) $= \\frac{\\text{Clock Frequency (MHz)}}{\\text{CPI (Clocks Per Instruction)}}$ — the two levers available to increase performance are **decreasing CPI** (RISC-style simplicity, targeting exactly 1 clock/instruction — going *below* 1.0 requires multiple-instruction-issue machines, out of scope here) and **increasing clock frequency** (bounded by the delay along the circuit's longest combinational path, which is exactly what pipelining, related cards, attacks).

**Three competing metrics an implementation is judged against**: **Maximum Performance** — measured by instructions executed per second; **Minimum Cost** — measured by circuit size (silicon area, gate count); **Best Performance/Price** — measured by the *ratio* of MIPS to size, since a design that's merely fast or merely cheap in isolation may not be the best engineering tradeoff; in power-sensitive applications, **MIPS/Watt** matters just as much as MIPS/\\$.

**Why this frames the whole implementation effort**: every subsequent datapath and pipelining decision in this module is ultimately in service of moving along one of these three axes — incremental featurism (related card) targets minimum cost by reusing a small component repertoire; pipelining targets maximum performance by increasing frequency without proportionally increasing CPI.`,
    related: ["mit6004-arch-pipe-why-hard"],
  },
  {
    id: "mit6004-arch-impl-incremental-featurism",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the 'incremental featurism' design strategy for building the Beta datapath, and list its component repertoire.",
    back: `**Strategy**: each Beta instruction *class* (operate, load/store, jump/branch, exceptions) can be implemented using a small, shared component repertoire — build a datapath for each class **individually** first, then **merge** the individual datapaths together (using MUXes to select between them) into one unified circuit, rather than trying to design the full merged datapath all at once.

**The component "bag"**: **registers** (storage elements), **MUXes** (selecting between alternative data sources), a **"black box" ALU** (arithmetic/logic unit, treated abstractly at this stage — its internal design was covered in earlier modules), a **3-port register file** (2 read ports, 1 write port — related card), and **memories** (separate instruction memory and data memory blocks).

**Why incrementally, not all-at-once**: each new instruction class typically requires only a *small* extension to the datapath built for the previous classes (e.g. adding load/store needs only a data-memory block plus a couple of new MUX select signals layered onto the operate-instruction datapath already built) — incremental construction keeps each design step tractable and lets the control logic (which signal values implement which instruction) be worked out class-by-class rather than in one large combinatorial leap.`,
    related: ["mit6004-arch-impl-register-file-timing", "mit6004-arch-impl-instruction-class-datapaths"],
  },
  {
    id: "mit6004-arch-impl-register-file-timing",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the Beta register file's port structure (2 read + 1 write) and its read-during-write timing behavior.",
    back: `The Beta's register file is a **3-port** memory: **2 independent combinational READ ports** (RA1/RA2 address in, RD1/RD2 data out — purely combinational, no clock involved in a read) and **1 clocked WRITE port** (write address, write data, write-enable WE, updated only on the active clock edge). Internal logic ensures **Reg[31] always reads as 0**, regardless of what (if anything) was ever written there.

**Read-during-write timing**: what happens if a read address (RA1) equals the *simultaneous* write address (WA) in the same cycle? The register file's actual behavior: **RD1 reads the "old" value of Reg[RA1] until the next clock edge** — i.e., a read never sees a write that hasn't yet been clocked in, even if they target the same register in the same cycle. This detail matters enormously once bypassing/forwarding is introduced for the pipelined implementation (related cards) — it's precisely the case the bypass hardware exists to work around, since without bypassing, a dependent instruction reading that register in the very next cycle would otherwise need to stall.`,
    pitfall:
      "Don't assume a write and a same-cycle read to the same register address somehow race or produce undefined behavior — the register file's defined semantics are that reads always return the pre-write ('old') value within that same clock cycle; only after the clock edge does the new value become visible.",
    related: ["mit6004-arch-impl-incremental-featurism", "mit6004-arch-pipe-bypass-mechanics"],
  },
  {
    id: "mit6004-arch-impl-fetch-decode-datapath",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the instruction fetch/decode datapath: how the PC drives instruction memory, and how the fetched 32-bit word splits into fields and control signals.",
    back: `**Fetch**: a **program counter (PC)** register drives the address input of **instruction memory**; the PC is used directly as the memory address to fetch the next 32-bit instruction word. In parallel, \`PC + 4\` is computed and (by default) loaded back into the PC at the end of the cycle — realizing the fetch/execute loop's \`PC ← PC + 4\` step (related card in Module 4).

**Decode**: the fetched 32-bit instruction word splits into **fields** used two different ways: (1) some fields are used **directly** as data — the register-number fields ($ra$, $rb$, $rc$) route straight to the register file's address inputs, and the 16-bit constant field routes straight into the datapath as a literal operand; (2) the top bits (\`<31:26>\`, the **opcode**) route to a separate **Control Logic** block, which decodes the opcode into the actual **control signals** (mux-select lines, write-enables, ALU function select, etc.) that configure the rest of the datapath for that specific instruction. This is the concrete hardware realization of the "instruction fields → control signals" half of the fetch/execute loop.`,
    related: ["mit6004-arch-impl-instruction-class-datapaths"],
  },
  {
    id: "mit6004-arch-impl-instruction-class-datapaths",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through how OP/OPC, LD, ST, JMP, BEQ/BNE, and LDR each extend the base fetch/decode datapath, and identify the one control signal (WERF) that most sharply distinguishes them.",
    back: `Building on the fetch/decode base (related card), each instruction class adds a small increment:

**OP/OPC (ALU operations)**: register file reads $ra$ (and $rb$, for OP) or uses the embedded constant (for OPC); ALU computes; result is written back to $rc$ via the register file's write port — **WERF (write-enable-register-file) = 1**.

**LD (load)**: same ALU-computed address as OP/OPC (\`Reg[ra] + SXT(C)\`), but the value written to $rc$ comes from **Data Memory[address]**, not directly from the ALU — a MUX selects memory-output vs. ALU-output feeding the write-data port. **WERF = 1**.

**ST (store)**: computes the same address, but instead of writing the register file, it writes **Data Memory** at that address with $Reg[rc]$'s value. Crucially, **no WERF** — a store never updates the register file at all.

**JMP**: \`Reg[rc] ← PC+4; PC ← Reg[ra]\` — writes the *old* PC+4 into $rc$ (useful as a return-address convention) while redirecting the PC itself from a register value rather than an offset.

**BEQ/BNE**: conditionally redirect the PC using \`PC + 4 + 4*SXT(C)\` instead of an unconditional register value, gated on whether $Reg[ra]$ equals (or doesn't equal) zero.

**LDR (load relative)**: \`Reg[rc] ← Mem[PC + 4 + 4*SXT(C)]\` — computes its *address* relative to the **PC**, not a register, specifically to let compiled code load large constants/addresses stored nearby in the *same* read-only code region (via an assembler-placed \`LONG(...)\` literal, since ordinary instructions can't embed values wider than 16 bits) without needing a separate register-relative addressing step.

**The key distinguishing signal — WERF**: whether an instruction writes the register file (\`OP\`, \`OPC\`, \`LD\`, \`LDR\`, \`JMP\` all set WERF=1; \`ST\`, \`BEQ\`/\`BNE\` do not) is the single control bit most datapath elements key off of, and becomes central again once exceptions (related card) and pipelining (related cards) are layered on top.`,
    pitfall:
      "It's tempting to think every instruction class needs substantially different hardware — in fact nearly every class reuses the SAME register-file-read → ALU-compute → optional-memory-access → optional-register-file-write skeleton, differing mainly in which MUX inputs get selected and whether WERF fires, exactly the incremental-featurism principle (related card) in action.",
    related: ["mit6004-arch-impl-fetch-decode-datapath", "mit6004-arch-impl-incremental-featurism"],
  },
  {
    id: "mit6004-arch-impl-exceptions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the goal of exception handling (recoverable, transparent interrupts), and how is it implemented as a 'forced procedure call' using the XP register?",
    back: `**What can go wrong**: execution of an illegal opcode, reference to non-existent memory, divide by zero — or something entirely unanticipated, like a key being struck or a network packet arriving. **Goal**: handle **all** these cases (and more) in **software** — treat each one as an *implicit procedure call*: a handler procedure runs, deals with the problem, and returns to the interrupted program, **transparently** (the interrupted program should be unable to tell it was ever paused). A key added capability this enables: handlers for certain errors (e.g. illegal opcodes) can be used to **extend the instruction set purely in software** (used for exactly this purpose in one of the course's lab assignments).

**Implementation, concretely**: reserve one register — **$r30$, aka $XP$** — specifically for exception linkage, and **prohibit user programs from using $XP$** directly (mirroring, but distinct from, the ordinary $LP$ procedure-linkage convention from Module 4). On detecting an exception: **don't execute** the offending instruction; instead **fake a forced procedure call** — save the current $PC$ (actually $PC+4$, since the fetch/execute loop already advanced it) into $XP$, and load $PC$ with a fixed **exception vector** address (e.g. \`0x4\` for synchronous exceptions like illegal opcodes, \`0x8\` for asynchronous ones like I/O interrupts). The handler code at that vector address runs (using ordinary \`PUSH(XP)\` at its start, since it may itself need to call other procedures and can't clobber $XP$ otherwise), and finishes with \`POP(XP); JMP(XP)\` to resume the interrupted program exactly where it left off.

**Worked example — DIV, unimplemented in hardware**: executing \`DIV(R0,R1,R2)\` on hardware that doesn't implement DIV directly triggers an illegal-opcode exception; the \`IllOp\` handler fetches the faulting instruction from \`Mem[Reg[XP]-4]\`, decodes it to recover the DIV's register numbers, performs the division in **software**, fills in the result register, then \`POP(XP); JMP(XP)\` returns — completely transparent to code that called DIV, which never has to know the operation wasn't natively supported.`,
    pitfall:
      "Prohibiting user programs from touching XP directly isn't an arbitrary restriction — it's what guarantees XP is always available, uncorrupted, for the NEXT exception the hardware needs to signal; if user code could freely clobber XP, a nested or subsequent exception would have nowhere safe to record its return address.",
    related: ["mit6004-arch-impl-instruction-class-datapaths", "mit6004-arch-pipe-exceptions-in-pipeline"],
  },

  // --- Lecture 15: Multilevel memories, locality, caches ---
  {
    id: "mit6004-arch-mem-hierarchy-tradeoff",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Give the capacity/latency/cost tradeoff across the memory-technology spectrum (register, SRAM, DRAM, hard disk), and state precisely what we 'want' but can't get directly.",
    back: `| Technology | Capacity | Latency | Cost |
|---|---|---|---|
| Register | 100's of bits | ~20 ps | \\$\\$\\$\\$ |
| SRAM | 100's of KBytes | ~1 ns | \\$\\$\\$ |
| DRAM | 100's of MBytes | ~40 ns | \\$ |
| Hard disk (non-volatile) | 100's of GBytes | ~10 ms | ¢ |
| **Want** | **1's of GBytes** | **~1 ns** | **cheap** |

**The contradiction**: every real technology trades capacity against latency against cost — bigger is slower and/or cheaper, faster is smaller and/or pricier. The "Want" row is not a technology at all — it's an *impossible* combination for any single memory technology to deliver directly. This tension is exactly what the **memory hierarchy** (small fast memory backed by large slow memory, exploiting locality — related card) is built to resolve: not by inventing a technology that beats this tradeoff, but by architecturally *combining* technologies so the *system* behaves, on average, close to the "Want" row despite no individual component achieving it.`,
    related: ["mit6004-arch-mem-locality-of-reference", "mit6004-arch-mem-expose-vs-hide"],
  },
  {
    id: "mit6004-arch-mem-locality-of-reference",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the formal definition of locality of reference, and explain how the 'working set' concept follows from it.",
    back: `**Locality of Reference**: reference to location $X$ at time $t$ implies that reference to location $X + \\Delta X$ at time $t + \\Delta t$ becomes **more probable** as $\\Delta X$ and $\\Delta t$ approach zero. Informally: memory accesses cluster — both in **space** (nearby addresses tend to be accessed together, e.g. sequential instruction fetch, array traversal) and in **time** (recently accessed addresses tend to be accessed again soon, e.g. loop variables, a hot function's instructions).

**Working set**: let $S$ be the set of distinct locations accessed during some time window $\\Delta t$. A program's **working set** is a set $S$ that changes *slowly* with respect to $\\Delta t$ — i.e., as $\\Delta t$ grows from very small, $|S|$ (the working-set size) grows quickly at first (capturing genuinely distinct, actively-used locations) but then **flattens out**, since most subsequent accesses revisit locations already counted in $S$ rather than touching entirely new ones. This empirical flattening is the direct consequence of locality, and it's precisely what justifies the memory-hierarchy strategy (related card): if the working set stayed small (roughly SRAM-sized) relative to program size, keeping just that working set in fast memory captures the overwhelming majority of actual accesses.

**Why this is the load-bearing empirical fact behind caching**: without locality, no small fast memory could possibly help — a program with genuinely uniform-random access patterns across its entire address space would defeat any cache, however large, since there'd be no small "hot" subset to keep close to the CPU. It's the *observed regularity* of real programs' memory reference patterns — not a logical necessity — that makes caching work in practice.`,
    related: ["mit6004-arch-mem-hierarchy-tradeoff", "mit6004-arch-mem-cache-basic-algorithm"],
  },
  {
    id: "mit6004-arch-mem-expose-vs-hide",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast the two architectural approaches to exploiting a memory hierarchy: 'expose hierarchy' vs. 'hide hierarchy'. Which one is the cache?",
    back: `**Approach 1 — Expose Hierarchy** (used by, e.g., Cray-style architectures): registers, main memory, and disk are each presented to the **programmer** as distinct, explicitly-named storage alternatives, with different instructions/addressing for each. The programming model tells programmers: "use them cleverly" — placement decisions (what lives where) are a **manual, software-level** responsibility.

**Approach 2 — Hide Hierarchy** (the **cache** approach, used throughout the rest of this module): the programming model presents a **single kind of memory, single address space** — the machine **automatically** assigns locations to fast or slow physical memory depending on **usage patterns** (locality, related card), completely transparently to software. A small, fast **cache** (built from SRAM) sits between the CPU and a larger, slower **main memory** (DRAM), with a hard disk further back as "swap space" for what doesn't fit even in main memory.

**Why "hide" dominates in practice**: the "hide" approach's automatic, usage-pattern-driven placement is exactly the **program-transparent memory hierarchy** goal the cache mechanism (related card) is designed to deliver — it requires zero programmer awareness of the underlying hierarchy (unlike Approach 1's "use them cleverly" burden), while still capturing nearly all the performance benefit, *provided* locality genuinely holds for the running program's actual reference pattern.`,
    related: ["mit6004-arch-mem-locality-of-reference", "mit6004-arch-mem-cache-basic-algorithm"],
  },
  {
    id: "mit6004-arch-mem-cache-basic-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the basic cache hit/miss algorithm, and derive the average-access-time formula t_ave = t_c + (1-α)t_m from it.",
    back: `A **cache** holds *temporary copies* of selected main-memory locations, e.g. \`Mem[100] = 37\` cached as a (tag=100, data=37) pair. **On reference to Mem[X]**: look for $X$ among the cache's tags. **HIT** ($X = TAG(i)$ for some cache line $i$): READ returns $DATA(i)$ directly; WRITE changes $DATA(i)$ and starts a write to $Mem[X]$ (write-through, related card). **MISS** ($X$ not found in any tag): select some replacement line $k$ to hold $Mem[X]$ (**allocation**); READ reads $Mem[X]$, then sets $TAG(k)=X$, $DATA(k)=Mem[X]$; WRITE starts a write to $Mem[X]$, then sets $TAG(k)=X$, $DATA(k)=$ the new value.

**Two goals**: (1) improve the *average* access time; (2) **transparency** — the cache must be invisible to software correctness (compatibility, programming ease), only affecting *speed*.

**The average-access-time formula**: let $\\alpha$ = **hit ratio** (fraction of references found in cache), $(1-\\alpha)$ = **miss ratio**, $t_c$ = cache access time, $t_m$ = main-memory access time. Then:
$$t_{ave} = \\alpha t_c + (1-\\alpha)(t_c + t_m) = t_c + (1-\\alpha)t_m$$
(a hit costs just $t_c$; a miss costs $t_c$ *plus* $t_m$, since the cache is still checked first before falling through to memory). **The challenge, restated**: make $\\alpha$ as close to 1 as possible, since $(1-\\alpha)t_m$ is the only term that can dominate $t_{ave}$.

**Worked example — how high a hit ratio is actually needed?** Given an on-chip SRAM with $t_c = 4$ ns and main memory averaging $t_m = 40$ ns, achieving an average access time of $t_{ave} = 5$ ns requires:
$$\\alpha = 1 - \\frac{t_{ave} - t_c}{t_m} = 1 - \\frac{5-4}{40} = 97.5\\%$$
— a strikingly **high** required hit ratio, illustrating just how heavily average performance depends on locality actually holding in practice.`,
    related: ["mit6004-arch-mem-locality-of-reference", "mit6004-arch-mem-associativity-tradeoff"],
  },
  {
    id: "mit6004-arch-mem-associativity-tradeoff",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast fully-associative and direct-mapped cache lookup, and use the two-loop example to show concretely why direct-mapped caches can suffer pathological contention that fully-associative caches don't.",
    back: `**Fully-associative** ("the extreme in associativity"): every incoming address is compared, **in parallel**, against **every** cache line's tag — any data item could be located in **any** cache line. Maximally flexible (no address is ever forced to collide with another), but expensive: needs $N$ parallel tag comparators for an $N$-line cache.

**Direct-mapped** (non-associative): **no parallelism** — look in **just one** place, determined by a fixed subset of the incoming address's bits (the low-order bits, chosen specifically because low-order bits vary faster/more independently across nearby addresses than high-order bits — related discussion in the set-associative card). Cheap: a single comparator, ordinary fast SRAM for the tag/data table. **Disadvantage**: **collisions** — two addresses that happen to map to the same cache line can never be cached simultaneously, however much unused capacity the rest of the cache has.

**Worked contention example**: a 1024-line, 1-word-per-line direct-mapped cache. **Loop A** (program at address 1024, data at address 37): the reference sequence 1024, 37, 1025, 38, 1026, 39, 1024, ... maps to cache lines 0, 37, 1, 38, 2, 39, 0, ... — **no collisions**, every reference is a **HIT** in steady state (program and data addresses land on disjoint cache lines). **Loop B** — *same* program, but data now lives at address **2048** instead of 37: the reference sequence 1024, 2048, 1025, 2049, 1026, 2050, 1024, ... maps to cache lines 0, 0, 1, 1, 2, 2, 0, ... — program and data now **collide on every single cache line** ($1024 \\bmod 1024 = 0$ and $2048 \\bmod 1024 = 0$ land on the same line), producing **100% MISSES** in steady state, despite the cache being no more "full" in any real sense than in Loop A. This — identical hardware, identical working-set *size*, wildly different performance purely from address *placement* — motivates **set-associativity** (related card): some associativity to absorb this kind of collision, without paying for full associativity's parallel-comparator cost everywhere.`,
    pitfall:
      "A direct-mapped cache's miss rate isn't simply a function of how much of the address space is 'hot' relative to cache size — it also critically depends on whether hot addresses happen to alias onto the SAME cache line, which can turn an easily-cacheable working set into a thrashing worst case purely by bad luck in address assignment (as the Loop A vs Loop B example shows).",
    related: ["mit6004-arch-mem-cache-basic-algorithm", "mit6004-arch-cache-set-associative"],
  },

  // --- Lecture 16: Cache design issues ---
  {
    id: "mit6004-arch-cache-set-associative",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe N-way set-associative caching as the birds-eye 2D generalization of direct-mapped and fully-associative caches, and explain the insight about where contention actually occurs that motivates it.",
    back: `**The birds-eye view**: think of a cache's lines arranged in a 2D grid — **# Sets** (rows) $\\times$ **Set Size** (columns). Total lines $=$ #Sets $\\times$ Set Size. **# Sets = 1** is exactly a **fully-associative** cache (one giant "set" containing every line, searched entirely in parallel). **Set Size = 1** is exactly a **direct-mapped** cache (every address maps to exactly one line). **Set Size = N** (with more than one set) is an **N-way set-associative** cache: an incoming address maps to a *specific set* (via its low-order index bits, same idea as direct-mapped), but within that set, the address may be cached in **any** of the $N$ lines belonging to that set — parallel lookup restricted to just those $N$ lines, not the entire cache.

**Two empirical observations motivating this middle ground**: (1) the **probability of collision diminishes as cache size grows** — so build huge direct-mapped caches out of cheap SRAM where collisions are already rare; (2) contention mostly occurs between a **small number of independent "hot spots"** simultaneously active (e.g. instruction fetches vs. the stack frame vs. a couple of data structures, typically only 2-4 such streams at once) — so the ability to simultaneously cache just a **few** (2? 4? 8?) competing addresses in the same set eliminates most real collisions, without needing full associativity across the *whole* cache.

**Implementation**: an N-way set-associative cache can literally be built as **N direct-mapped caches running in parallel** — one comparator per way, each way independently indexed by the same set-index bits, with the $N$ comparators' outputs OR'd together to determine overall hit/miss. **Rule of thumb, confirmed by measurement**: an $N$-line direct-mapped cache performs roughly as poorly as an $N/2$-line 2-way set-associative cache — i.e., 2-way associativity is worth roughly a 2x capacity increase in direct-mapped terms; and empirically, **8-way associativity is nearly as effective as full associativity** for typical program behavior — miss rate keeps improving with associativity but with steeply diminishing returns past 4-8 ways.`,
    related: ["mit6004-arch-mem-associativity-tradeoff", "mit6004-arch-cache-replacement-strategies"],
  },
  {
    id: "mit6004-arch-cache-replacement-strategies",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare LRU, FIFO, and Random cache replacement strategies, including each one's hardware overhead.",
    back: `Replacement strategy only matters within a **set** containing more than one line (direct-mapped caches, Set Size=1, need no replacement policy at all — there's only ever one possible line to evict).

**LRU (Least-Recently-Used)**: keeps the **most-recently-used** locations in cache, evicting whichever line in the set was accessed **longest ago**. Needs to maintain an *ordered list* of $N$ items per set → $N!$ possible orderings → $O(\\log_2 N!) = O(N\\log_2 N)$ "LRU bits" of state per set, plus non-trivial update logic on every access — the most accurate policy, but the most hardware-expensive to implement exactly.

**FIFO/LRR (First-In-First-Out / Least-Recently-Replaced)**: a cheaper alternative — replace the **oldest** item (by when it was *loaded*, not when it was last *accessed*); within each set, keep just one counter pointing at the "victim" line. Overhead: only $O(\\log_2 N)$ bits/set — far cheaper than LRU, at some cost in miss-rate accuracy (FIFO can evict a line that was just recently re-accessed, which true LRU would have protected).

**Random**: select the replacement line using a uniform random distribution. Overhead: $O(\\log_2 N)$ bits/**cache** (not per-set — a single shared pseudo-random generator suffices), the cheapest of the three. Its key structural advantage: **no pathological reference stream can reliably produce worst-case results**, since the policy itself isn't a deterministic function of access history an adversarial (or accidentally-adversarial) program could exploit — using **genuine** randomness (not just a predictable pseudo-random sequence) specifically **prevents reverse-engineering** a worst-case access pattern (illustrated by the "Devil's Advocacy" benchmark-gaming example, related discussion, where a fixed deterministic policy like LRU or FIFO can be specifically targeted by a crafted reference string to make one cache design look artificially better or worse than a competitor's).

**Practical takeaway** (also echoed in the cache summary): for large caches serving typical program behavior, "any sane approach works well" — the *choice* of replacement policy matters far less than getting associativity and block size right; real randomness mainly matters as protection against adversarially-crafted benchmarks rather than as a day-to-day performance lever.`,
    related: ["mit6004-arch-cache-set-associative"],
  },
  {
    id: "mit6004-arch-cache-block-size",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Explain why enlarging each cache line to hold a multi-word block amortizes tag overhead and exploits spatial locality, and what cost this trades off.",
    back: `**The idea**: enlarge each cache line to hold a **block** of $2^B$ words (aligned on $2^B$-word boundaries) sharing a **single** tag, rather than one tag per individual word. Worked example: a 4-word block needs one 28-bit tag ($A_{31:4}$) covering 4 $\\times$ 32 = 128 bits of data — tag overhead drops to **under $\\frac{1}{4}$ bit of tag per bit of data**, versus a much higher tag-to-data ratio when each single word carries its own tag.

**Why this works — exploiting *spatial* locality specifically**: whenever the memory system fetches a word on a miss, it now fetches the **entire** $2^B$-word block containing that word from main memory (not just the single requested word) — betting that, per locality (related card), nearby words in the same block are likely to be accessed soon too, turning what would have been several *future* misses into cache **hits** against data already pulled in "for free" alongside the originally-requested word.

**The cost**: some of each fetched block may go **unaccessed** — if locality doesn't hold as strongly as hoped for a given access pattern, those extra words were fetched (consuming memory bandwidth and cache space) for nothing. This is a genuinely **big win specifically when there's a wide path to memory** (e.g. a wide memory bus can transfer an entire block in roughly the same time a narrower bus would need for just one word) — block size and memory bus width are a matched pair of design decisions, not independent choices.`,
    related: ["mit6004-arch-mem-locality-of-reference", "mit6004-arch-cache-valid-bits"],
  },
  {
    id: "mit6004-arch-cache-valid-bits",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What problem do valid bits solve, and when are they set/cleared?",
    back: `**The problem**: a cache's tag/data storage is ordinary SRAM — at power-up, or after certain "back door" changes to memory (e.g. loading a program fresh from disk, bypassing the cache entirely), the tag entries hold **garbage**, not meaningful "this cache line currently holds a temporary copy of address X" information. Treating that garbage as if it were legitimately cached data risks a spurious tag match against a real incoming address, returning **wrong data** as if it were a genuine cache hit.

**The fix**: extend each tag entry with a **valid (V) bit**. A cache line can only produce a **HIT** if its valid bit is **set**, regardless of whether its tag bits happen to numerically match the incoming address. **At power-up/reset**: clear **all** valid bits (every line starts invalid — forcing the very first access to any given line to be a compulsory miss, which is correct, since nothing is genuinely cached yet). **When a cache line is first replaced** (loaded with real data on a miss): set its valid bit. This also enables a useful **cache-flush control feature**: software (or external control logic) can invalidate the entire cache instantly just by clearing all valid bits — much cheaper than actually rewriting every tag/data entry — used, e.g., whenever cache contents must be guaranteed stale/discarded (context switches, DMA-modified memory regions, etc.).`,
    related: ["mit6004-arch-cache-block-size", "mit6004-arch-cache-write-strategies"],
  },
  {
    id: "mit6004-arch-cache-write-strategies",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare write-through, write-behind, and write-back cache write strategies, and explain what 'dirty bits' add to write-back.",
    back: `Since the large majority (90%+) of memory accesses are **reads**, write handling is a secondary — but still consequential — design choice:

**Write-through**: every CPU write updates the cache **and** is also immediately written to main memory, **stalling the CPU** until that memory write completes. Memory always holds "the truth" — simplest to reason about, but slowest for write-heavy code, since every single write pays main-memory latency.

**Write-behind**: CPU writes are cached, and writes to main memory are **buffered** (queued, possibly pipelined) — the CPU keeps executing immediately while the memory writes complete **in order**, in the background. Faster than write-through for the CPU's perspective, while still keeping memory eventually consistent, in write-issue order.

**Write-back**: CPU writes update **only** the cache; the corresponding main-memory location is **not** updated immediately — memory contents can go **stale** ("dirty") relative to the cache. The write is only pushed out to memory later, specifically **when that cache line is evicted** (replaced to make room for something else) — at eviction time, the stale/dirty data is written back to memory before being overwritten in the cache.

**Dirty bits — making write-back's eviction cost-aware**: extend each cache line with a **D (dirty) bit**, set whenever a write hits that line (meaning its cached copy no longer matches memory) and cleared whenever the line is loaded fresh from memory. On eviction, the write-back to memory is only actually necessary if $D=1$ — a **clean** line ($D=0$, never written since it was loaded) can simply be **discarded** on eviction, since memory already holds an identical copy; skipping that write saves real bandwidth whenever a fetched line was only ever read, never written.

**Is write-back worth the added complexity?** Depends on (1) the actual cost of a write (how much a write-through stall or write-behind buffer really costs in the target system) and (2) **consistency issues** it introduces — since memory can now be *stale* relative to the cache, any other agent reading memory directly (DMA, another processor) may see out-of-date data unless additional coherence mechanisms account for it.`,
    related: ["mit6004-arch-cache-valid-bits", "mit6004-arch-cache-set-associative"],
  },

  // --- Lecture 22: Pipelined Beta implementation, bypassing ---
  {
    id: "mit6004-arch-pipe-why-hard",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Given that combinational circuits (like the array multiplier) were already successfully pipelined earlier in the course, why is pipelining the Beta processor itself substantially harder?",
    back: `Two structural differences distinguish pipelining a full CPU from pipelining an ordinary combinational circuit (e.g. the array multiplier, Module 3):

**(1) The Beta isn't combinational — it has state, both explicit and hidden.** **Explicit state**: the register file and main memory hold values that persist across instructions and are read/written by many different instructions over time — a pipelined stage can no longer treat "the inputs" as simply flowing straight through from a single upstream source, since register/memory contents are shared, mutable, long-lived state. **Hidden state**: the **PC** itself is state, and it doesn't merely flow through the pipeline like an ordinary datapath value — it can be **changed** by instructions currently *in flight* (a branch or jump partway through the pipeline redirects where the *next* fetch should come from), creating a feedback dependency the multiplier's straightforward feed-forward structure never had to deal with.

**(2) Consecutive operations — instruction executions — genuinely interact with each other.** Jumps and branches **dynamically change the instruction sequence** itself (which instruction comes next depends on a still-in-flight earlier instruction's outcome) — the array multiplier had no analogous notion of one "item" changing what the next "item" even *is*. Instructions also **communicate through registers and memory** — one instruction's result is very often another nearby instruction's operand, creating genuine data dependencies between pipeline stages that a multiplier's independent, uncorrelated inputs never exhibited.

**The two goals this sets up for the pipelined design**: (a) move the Beta's slow components (memory, register file, ALU) into **separate pipeline stages**, so the clock can run faster; (b) **maintain the exact instruction semantics of the unpipelined Beta as far as possible** — i.e., a program should compute the *same* result whether run on the pipelined or unpipelined implementation, despite the added structural complexity. Branch delay slots, data hazards, and bypassing (related cards) are all consequences of trying to satisfy goal (b) while pursuing goal (a).`,
    related: ["mit6004-arch-impl-cpu-tradeoffs", "mit6004-arch-pipe-5-stage-structure"],
  },
  {
    id: "mit6004-arch-pipe-5-stage-structure",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Name the Beta's 5 pipeline stages (IF/RF/ALU/MEM/WB) and what each one does.",
    back: `**Goal**: maintain (nearly) 1.0 CPI, while increasing clock speed to barely include the *slowest single* component (rather than the sum of all components' delays, as in the unpipelined design). **Approach**: structure the processor as a 5-stage pipeline:

- **IF (Instruction Fetch)**: maintains the PC, fetches one instruction per cycle, passes it (and PC+4) downstream.
- **RF (Register File)**: reads the source operands ($ra$, $rb$) from the register file, passes them downstream.
- **ALU**: performs the indicated operation on the operands, passes the result downstream.
- **MEM (Memory)**: if the instruction is a load, uses the ALU's result as a memory *address* and reads data from it; otherwise simply passes the ALU's result through unchanged.
- **WB (Write-Back)**: writes the final result (from MEM) back into the register file.

**A simpler stepping stone — the 2-stage pipeline** (IF/EXE, built first before tackling the full 5-stage design): consider consecutive instructions \`ADDC(r1,1,r2); SUBC(r1,1,r3); XOR(r1,r5,r1); MUL(r2,r6,r0)\`. On a 2-stage IF/EXE pipeline, cycle $i$ fetches ADDC while nothing executes yet; cycle $i{+}1$ fetches SUBC while ADDC executes; cycle $i{+}2$ fetches XOR while SUBC executes — each instruction overlaps its own fetch with the *previous* instruction's execution, exactly the pipelining pattern established for combinational circuits, just now applied to instruction processing itself. The 5-stage design generalizes this same overlapping-stages idea to a longer, more realistic pipeline that separately isolates the truly slow components (memory access, register file access) as their own stages.`,
    related: ["mit6004-arch-pipe-why-hard", "mit6004-arch-pipe-branch-delay-slots"],
  },
  {
    id: "mit6004-arch-pipe-branch-delay-slots",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Explain the branch delay slot problem, and compare the four solution strategies (hardware annulment; NOP-filling; useful-instruction filling always-executed vs. annul-if-mispredicted).",
    back: `**The problem**: by the time a branch's condition is actually evaluated (a later pipeline stage), one or more **subsequent** instructions have *already been fetched* — those fetched-but-not-yet-executed instructions occupy the branch's **delay slot(s)**. If the branch is taken, those already-fetched instructions are architecturally *wrong* to execute (they came from the fall-through path, not the branch target) — yet they're already partway down the pipe.

**Solution 1 — hardware annulment**: add hardware that automatically **annuls** (disables WERF/WR, effectively turning into a no-op) instructions sitting in the delay slot(s) of a **taken** branch. Pro: the *same* program (unmodified machine code) runs identically on both the unpipelined and pipelined hardware. Con: on real benchmarks (SPEC), roughly 14% of instructions are taken branches → about 12% of *all* cycles end up executing annulled (wasted) work.

**Solution 2a — program around it, fill with NOPs**: the compiler/assembler explicitly inserts a \`NOP()\` (e.g. \`ADD(R31,R31,R31)\`, a genuine do-nothing instruction) into each delay slot. Pro: same behavioral effect as Solution 1. Con: **code is longer**, and the same ~12% of cycles are now spent explicitly executing NOPs rather than being hardware-annulled — the wasted-cycle cost doesn't go away, it just moves from hardware to visible instruction count.

**Solution 2b(i) — fill delay slots with USEFUL instructions, always executed**: move genuinely useful, independent instructions into the delay slot(s), understanding they'll execute **whether or not** the branch is taken. Pro: reclaims wasted cycles when such reorderable instructions exist. Con: finding instructions that are safe to execute unconditionally (regardless of branch outcome) is often hard, may require nontrivial code rewriting, and the *unpipelined* implementation now runs this reordered code **differently** than originally written (semantics only match on the pipelined machine, not the plain sequential reading of the code).

**Solution 2b(ii) — fill with useful instructions, annulled if branch doesn't behave as predicted**: similar to 2b(i), but the hardware selectively annuls the delay-slot instruction specifically when the branch's actual outcome contradicts what the placement assumed. Pro: only ~1 instruction gets annulled (on the very last loop iteration typically), and roughly 70% of branch delay slots in practice can be filled with genuinely useful work this way. Con: still changes program behavior relative to a naive unpipelined reading, and doesn't scale usefully beyond a single delay slot.`,
    pitfall:
      "Filling delay slots with 'useful' instructions (2b variants) is a genuine performance win but is NOT semantically transparent the way annulment (Solution 1) or NOP-filling (2a) are — code relying on delay-slot filling behaves differently if naively run on an unpipelined implementation, so it's a compiler-level optimization that assumes a specific pipelined target, not a portable transformation.",
    related: ["mit6004-arch-pipe-5-stage-structure", "mit6004-arch-pipe-data-hazards-and-solutions"],
  },
  {
    id: "mit6004-arch-pipe-data-hazards-and-solutions",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Demonstrate the pipeline data hazard with a worked example, and compare the three solution strategies (program around it, stalling, bypassing).",
    back: `**The problem, worked example** (4-stage IF/RF/ALU/WB pipeline): \`ADD(r1,r2,r3); CMPLEC(r3,100,r0); MULC(r1,100,r4); SUB(r1,r2,r5)\`. ADD is fetched in cycle $i$, reaches its RF stage in $i{+}1$, ALU in $i{+}2$, and only **writes** $r3$ back at the end of cycle $i{+}3$ (WB stage). But CMPLEC — the very next instruction — reaches its **own** RF stage (where it reads $r3$) in cycle $i{+}2$, a full cycle **before** ADD's result is actually committed to the register file. CMPLEC reads $r3$'s **stale** value — architecturally wrong.

**Solution 1 — "program around it" (software)**: document the pipeline's exposed timing as a defined part of the ISA, declare hazard-avoidance a software/compiler responsibility (e.g. by reordering independent instructions between the producer and consumer, as shown by rewriting \`ADD;CMPLEC;MULC;SUB\` into \`ADD;MULC;SUB;CMPLEC\`, pushing CMPLEC's read of $r3$ far enough downstream that ADD has already written back). **Breaks sequential semantics** (a naive unpipelined reading of the reordered code no longer matches the original program) and costs code efficiency (reordering isn't always possible, and even when it is, it constrains compiler freedom).

**Solution 2 — stall the pipeline**: **freeze** the IF and RF stages for however many cycles are needed (2, in the 4-stage example), inserting NOPs into the ALU-stage instruction register during the freeze — CMPLEC's RF-stage read is delayed until *after* ADD's WB has genuinely completed. Correct and requires no software awareness, but **wastes cycles** (the frozen/NOP cycles are pure overhead, no useful work happens).

**Solution 3 — bypass (forwarding) paths**: add **extra data paths and control logic** that reroute a still-in-flight result directly from wherever it's already been computed (the ALU's output, or the WB stage's input) straight to wherever a dependent instruction needs it (the RF stage), **without** waiting for that result to actually complete its trip through the register file. In the same example: ADD's result is already sitting at the ALU's output in cycle $i{+}2$ — exactly the cycle CMPLEC needs it in its RF stage — so a bypass path can hand it over immediately, with **zero** stall cycles. This is the strategy actually built out in detail (related card) because it recovers full throughput without either sacrificing sequential semantics (Solution 1) or wasting cycles (Solution 2) — at the cost of nontrivial extra hardware (bypass muxes and hazard-detection comparators).`,
    pitfall:
      "Bypassing looks like it 'solves' data hazards outright, but it only works when the needed value has ALREADY been computed somewhere in the pipeline by the time it's needed — as the load-hazard cards show, a load instruction's data genuinely isn't available yet at the cycle a bypass would need it, and no amount of extra wiring can bypass data that doesn't exist yet; that case needs stalling instead.",
    related: ["mit6004-arch-pipe-bypass-mechanics", "mit6004-arch-pipe-load-hazards"],
  },
  {
    id: "mit6004-arch-pipe-bypass-mechanics",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the logical condition for selecting the ALU-stage bypass path and the WB-stage bypass path in the Beta's RF stage.",
    back: `Bypass hardware sits in the **RF stage**, where operands are normally read straight from the register file — bypass MUXes intercept that read and substitute a fresher, still-in-flight value when appropriate.

**ALU bypass** (routing a value currently sitting at the ALU's *output*, one stage ahead, directly back to the RF stage): select this bypass path if **OpCode$^{RF}$ reads $r_a$** (the currently-decoding instruction actually needs a register operand) **and OpCode$^{ALU}$ = OP or OPC** (the instruction one stage ahead is one that actually produces a usable ALU result — i.e. it uses the ALU to compute its result) **and $r_a^{RF} = r_c^{ALU}$** (the register being read now is exactly the register the ALU-stage instruction is about to write) **and $r_a^{RF} \\ne R31$** (never bypass the hardwired-zero register — $R31$ must always read as 0, regardless of what any in-flight instruction nominally "writes" to it).

**WB bypass** (routing a value sitting at the **WB** stage's input, two stages ahead of RF, back to RF): select this bypass path if **OpCode$^{RF}$ reads $r_a$**, **and $r_a^{RF} \\ne R31$**, **and the ALU bypass condition above does NOT already apply** (the two bypass paths are mutually exclusive priority levels — if the closer, fresher ALU-stage value is available, prefer it over the older WB-stage value), **and WERF = 1** (the WB-stage instruction is actually going to write the register file at all), **and $r_a^{RF} = WA$** (the register being read matches the WB stage's actual write-address).

**Why two separate bypass paths, not just one**: a dependent instruction might be **one** instruction behind the producer (needing the ALU-stage bypass) or **two** instructions behind (needing the WB-stage bypass, since by the time it reaches RF, the producer has already moved past ALU into WB) — both cases arise routinely in ordinary code, so both bypass sources must be wired in, with the nearer (ALU-stage) source taking priority whenever both could apply.`,
    pitfall:
      "The R31-exclusion condition isn't a minor edge case to skip — without it, bypass logic would incorrectly try to forward a 'result' into an instruction reading R31, corrupting the guarantee that R31 always reads as zero; every bypass condition explicitly excludes r_a = R31 for exactly this reason.",
    related: ["mit6004-arch-pipe-data-hazards-and-solutions", "mit6004-arch-impl-register-file-timing"],
  },

  // --- Lecture 23: Pipeline issues — delay slots, annulment, exceptions ---
  {
    id: "mit6004-arch-pipe-load-hazards",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Distinguish the 'easy' load hazard (fixable by bypassing) from the 'hard' load hazard (not fixable by bypassing at all), using LD(r1,0,r4); ADD(r4,r1,r5); XOR(r3,r4,r6).",
    back: `Consider \`LD(r1,0,r4); ADD(r4,r1,r5); XOR(r3,r4,r6)\` — both ADD and XOR depend on $r4$, which LD is loading from memory.

**The XOR hazard — easy**: by the time XOR reaches its RF stage, LD's loaded value has already reached the **WB** stage (memory data has, by then, genuinely been fetched and is sitting ready) — this is handled by the **already-established WB bypass path** (related card), exactly the same mechanism used for ordinary ALU-producer hazards. Nothing new is needed here.

**The ADD hazard — hard**: ADD needs $r4$ in its RF stage, which occurs only **one** cycle after LD was fetched. But LD's own memory access hasn't even reached the MEM stage yet at that point — the data simply **does not exist anywhere in the pipeline** for ADD to read, bypassed or not. **Bypassing fundamentally cannot fix this** — bypassing can only reroute a value that has *already been computed somewhere*; it cannot manufacture a value from a computation that hasn't happened yet. This is a **structural** hazard, distinct in kind from the data hazards bypassing solves.

**The general lesson**: a load instruction's result becomes available later, relative to its own fetch, than an ALU instruction's result does (memory access is slower/deeper in the pipeline than the ALU stage) — this specific extra distance is exactly what's traditionally called the machine's **load delay** (or "load-use hazard" / "load-use penalty"), and it's unavoidable structurally, requiring an entirely different fix: **stalling** (related card), not bypassing, for the specific case where a load's result is needed the very next cycle or two.`,
    pitfall:
      "It's tempting to think 'we solved data hazards with bypassing, so we're done' — the ADD-after-LD case is a genuinely different category of problem (data that doesn't exist yet, not data that exists but hasn't reached the register file), and no amount of additional bypass wiring resolves it; only stalling (holding the dependent instruction back until the data actually exists) can.",
    related: ["mit6004-arch-pipe-bypass-mechanics", "mit6004-arch-pipe-stall-logic"],
  },
  {
    id: "mit6004-arch-pipe-stall-logic",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the stall-logic mechanics for the hard load hazard, and explain how compilers can use knowledge of load delay to avoid stalls entirely.",
    back: `**Stall mechanics, concretely** (freeze-and-bubble): (1) **freeze** the IF and RF pipeline stages (they hold their current contents rather than advancing — the dependent instruction and everything behind it in program order simply doesn't move forward yet); (2) **introduce a NOP** into the ALU-stage instruction register each frozen cycle (so no spurious operation executes while frozen); (3) **wait** until the load's operand has actually become available (reached the point a bypass path can deliver it) before releasing the freeze and letting the dependent instruction proceed. This is architecturally identical in spirit to the data-hazard stall solution (related card), just triggered specifically by the load-use case that bypassing structurally cannot resolve.

**Compiler-level avoidance — instruction scheduling**: if the compiler **knows** the target machine's load delay (how many cycles must elapse between a load and a dependent instruction's RF-stage read), it can often **reorder** the compiled instruction sequence so that some *other*, independent instruction fills the gap between the load and its first use — exactly analogous to filling branch delay slots with useful work (related card). Many real compilers provide machine-specific **instruction scheduling** passes specifically for this purpose — converting what would otherwise be a hardware-inserted stall bubble into productive work, at zero runtime cost, purely by rearranging *already-needed* instructions rather than adding new ones.

**The deeper motivation for even longer pipelines**: as memories get relatively slower compared to increasingly fast processors, the memory-access stage's inherent latency grows relative to a clock cycle — rather than simply lengthening the clock period to accommodate this (which would slow down every instruction, not just loads), the alternative is **longer pipelines**: add dedicated "memory wait" stages between the start of a read and the return of its data, and build genuinely pipelined memories (supporting multiple simultaneous in-flight transactions) — at the structural cost of *more* load delay slots (a genuine 5-stage pipeline, as built here, allows nearly two clocks' worth of memory-read latency to be absorbed, versus barely one clock in a shallower 4-stage design).`,
    related: ["mit6004-arch-pipe-load-hazards", "mit6004-arch-pipe-branch-delay-slots"],
  },
  {
    id: "mit6004-arch-pipe-exceptions-in-pipeline",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does an illegal-opcode trap get handled in a pipelined implementation, and what does 'flushing the pipe' mean?",
    back: `The unpipelined exception mechanism (Module 5's Lecture-14 card, related) — force a BNE-like jump to a handler, saving the return PC in $XP$ — still works as the conceptual model, but a **pipelined** implementation must additionally account for **everything else currently in flight** when the fault is detected.

**Illegal opcode, concretely**: a bad opcode is decoded in the **RF stage** (the earliest point full decoding is available). On detection: (1) redirect $PC \\leftarrow$ address of the \`IllOp\` handler (as the next fetch target); (2) **annul the instruction currently in the IF stage** (it was fetched *after* the bad instruction, using the now-known-wrong sequential PC, so it must never be allowed to execute); (3) **force** a \`BNE(R31, 0, XP)\` in the RF stage in place of the illegal instruction itself — this synthetic instruction, as it flows through the rest of the pipe, will (eventually, when it reaches WB) correctly store $PC+4$ into $XP$, giving the handler exactly the return-address linkage it needs, using the *existing* WERF/write machinery rather than requiring any brand-new hardware path.

**"Flushing the pipe" — the general principle**: any instruction that is **earlier in the pipeline** (i.e., was fetched more recently, further from completing) than the one that caused the fault must be **annulled** — since program order guarantees the faulting instruction logically comes first, everything fetched after it (but still in-flight) represents fetch-ahead speculation that turned out to be premature and must be discarded, exactly generalizing the "annul what's in the delay slot" idea from branches to "annul everything currently between the fault point and the front of the pipe."

**Other fault sources handled the same way**: arithmetic exceptions (e.g. divide-by-zero) are caught by the **ALU subsystem** during its processing in the ALU stage; memory faults (illegal address) are caught by the **memory subsystem** during address processing in the MEM stage — each triggers the identical "redirect PC, annul earlier in-flight instructions, force a synthetic BNE(...,XP) at the fault's own stage" recipe, just anchored at a different pipeline stage depending on where the specific fault is naturally detected.`,
    related: ["mit6004-arch-impl-exceptions", "mit6004-arch-pipe-async-interrupts"],
  },
  {
    id: "mit6004-arch-pipe-async-interrupts",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does a naive 'annul nothing, just redirect PC' approach fail for asynchronous I/O interrupts, and what does the 'smart' interrupt handler fix do instead?",
    back: `**Why asynchronous interrupts seem easy at first, and aren't**: unlike a synchronous fault (illegal opcode, divide-by-zero — tied to a *specific* instruction's own processing), an asynchronous interrupt (e.g. a key struck, arriving mid-fetch of some unrelated ADD instruction) has **no natural "faulting instruction"** to anchor to — the naive plan is simply: select the handler address as the next PC, **leave** whatever's currently in the pipeline **completely alone** (no annulment needed, since nothing in flight actually did anything wrong), and have the handler eventually return to wherever execution would naturally have continued.

**The problem this naive plan runs into**: when, exactly, does "the old PC+4" (the value the handler needs saved in $XP$ to know where to resume) actually get **written** to $XP$? In a pipelined machine, there is no single clean moment analogous to the synchronous-fault case's "force a BNE right where the fault was detected" — the interrupt can arrive at any arbitrary point relative to the pipeline's ongoing instruction stream, with no natural stage to anchor the $XP$-save operation to.

**The "smart" interrupt handler fix**: instead of trying to leave the pipeline completely undisturbed, **annul the instruction currently in the IF stage** at the moment the interrupt is taken — but rather than turning it into an ordinary NOP (as branch/fault annulment does), turn it specifically into a forced \`BNE(R31, 0, XP)\`. This causes that (now-annulled-in-effect, but still structurally present) instruction's own PC+4 to be correctly written into $XP$ when it reaches WB, using the exact same mechanism as synchronous exceptions. The wrinkle: since the *annulled* instruction (not the original ADD that was executing when the interrupt arrived) is what generated the saved PC, the interrupt handler must adjust by subtracting 4 from $XP$ before returning (\`SUBC(xp,4,xp); JMP(xp)\`) to correctly resume at the instruction that was annulled, rather than one instruction too late — a small but essential correction that falls directly out of *which* instruction's PC+4 ends up saved.`,
    pitfall:
      "The 'obvious' asynchronous-interrupt design — don't touch the pipeline at all, just redirect PC — silently fails to specify WHEN the return address actually gets saved, because pipelined execution has no single instruction 'in progress' the way an unpipelined machine does; the fix reuses the synchronous-exception machinery by manufacturing an annulled instruction specifically so there IS a well-defined moment and mechanism for saving XP.",
    related: ["mit6004-arch-pipe-exceptions-in-pipeline"],
  },
  {
    id: "mit6004-arch-pipe-risc-complexity-irony",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Summarize the full pipeline-implementation cost accounting (stages, bypasses, stalls, exceptions), and state the ironic 'RISC = simplicity?' observation the course closes this material with.",
    back: `**Full cost accounting, building up from the unpipelined baseline**: **unpipelined Beta** — 1 cycle/instruction, but a *long* cycle time (memory + register-read + ALU + memory, all summed into one combinational path). **2-stage pipeline** — increased throughput (though less than 2x in practice), but introduces **branch delay slots** (a genuinely new correctness concern that didn't exist unpipelined). **5-stage pipeline** — further increased throughput (roughly 3x over unpipelined, empirically), but adds: branch delay slots (still); **delayed register write-back** (results only commit 3 stages after being fetched, the root cause of data hazards); handling for **RF/ALU/MEM-stage exceptions** (saving PC+4 in $XP$, annulling in-flight instructions — "flushing the pipe"); and correct **interrupt** handling (throwing away the IF-stage instruction, saving its PC+4 in $XP$, fixing up the return address). All of this requires genuinely new hardware beyond the unpipelined baseline: pipeline registers to hold values *between* stages, data-bypass MUXes specifically in the RF stage, and instruction-rewriting MUXes able to turn a normal fetched instruction into an annulling NOP or a forced \`BNE(...,XP)\` on demand.

**The closing observation — "RISC = Simplicity???"**: framed as "The P.T. Barnum World's Tallest Dwarf Competition" / "World's Most Complex RISC?" — a wry acknowledgment that the RISC philosophy's original promise (simple instructions, simple hardware) has, over the course of actually building a competitive pipelined implementation, accumulated a genuinely substantial amount of implementation complexity: bypass networks, annulment/rewrite logic, stall-detection comparators, and delay-slot semantics all exist specifically **because** of pipelining — none of it was needed by the "obviously more complex-looking" unpipelined design. The irony is structural, not a critique of RISC's core premise: RISC's *instruction-set* simplicity is precisely what made high-throughput pipelining *tractable* to build in the first place (uniform instruction size/timing, related Module 4 card) — but the resulting *implementation*, once fully worked out with all its correctness machinery, is far from simple in absolute terms. The broader lesson closing out this material: performance-oriented complexity in real processor design (VLIWs, superscalars, and beyond) tends to grow specifically out of *exploiting* an ISA's regularities to go faster, not out of the ISA's own instruction repertoire being large.`,
    related: ["mit6004-arch-pipe-why-hard", "mit6004-arch-impl-cpu-tradeoffs"],
  },
];
