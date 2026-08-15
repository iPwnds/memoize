// MIT 6.004 (Spring 2009) — Lectures 17-19: virtual memory (address-space
// exhaustion, demand paging, page maps, TLBs, contexts, cache/VM
// interaction), virtual machines and OS kernels (the process abstraction,
// CPU multiplexing via interrupts, kernel/user mode, supervisor calls,
// illegal-opcode dispatch), and devices/interrupts/real-time scheduling
// (asynchronous I/O, sleep/wakeup, interrupt latency, weak vs. strong
// priority scheduling). See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6004-vm";

export const mit6004VmOsDevicesCards: Card[] = [
  // --- Lecture 17: Virtual Memory ---
  {
    id: "mit6004-vm-address-space-lessons",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the historical lesson about address-space exhaustion, and list the main reasons a big (virtual) address space is valuable even when actual usage is sparse.",
    back: `**The historical lesson** (Gordon Bell and Bill Strecker, speaking about the PDP-11 in 1976): *"There is only one mistake that can be made in computer design that is difficult to recover from — not having enough address bits for memory addressing and memory management."* A partial list of once-successful machines that eventually **starved to death** purely from running out of address bits includes the PDP-8, PDP-10, PDP-11, Intel 8080/8086/80186/80286, Motorola 6800, MOS 6502, Zilog Z80, Cray-1, and Cray X-MP. **Why this is so hard to recover from**: address size determines the minimum width of *everything* that can hold an address — the PC, registers, memory words, and all hardware for address arithmetic (BR/JMP, LD/ST). Running out of address space effectively forces an entirely new ISA.

**Why programs want a big address space even though they use it sparsely** (the "Top 10 Reasons" list, condensed): **programming convenience** — create regions of memory with different semantics (read-only code, shared libraries) without cramped bookkeeping; **usage uncertainty** — provide headroom for run-time expansion of the stack and heap without having to predict their eventual size in advance; **isolating the ISA from the implementation** — hardware configuration details (how much RAM is actually installed) shouldn't have to leak into software design.

**The concrete sparsity problem this creates**: large monolithic programs (e.g. a big office suite) typically only *use* small portions of their code at any moment (add-ins, plug-ins, shared libraries sit mostly idle); a stack has to be sized to accommodate worst-case recursion depth, but any *given* run rarely approaches that worst case; a heap holding $N$ variable-size records has no natural fixed bound on $N$ or record size. **Actual use is sparse, and the working set is even sparser** — programs want to *behave* as if they have enormous, generously-provisioned address space, while genuinely touching only a small, changing fraction of it at any given time. This sparsity gap between "wants to address" and "actually uses" is exactly what virtual memory (related card) is engineered to exploit.`,
    related: ["mit6004-vm-illusion-and-demand-paging"],
  },
  {
    id: "mit6004-vm-illusion-and-demand-paging",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State virtual memory's core illusion, its two guarantees (transparency, isolation), and describe the demand-paging mechanism that realizes it.",
    back: `**The core illusion**: use RAM as a **cache** to a much larger, slower storage pool (disk) — exactly the same "small fast memory fronting large slow memory" pattern as an ordinary cache (related Module 5 cards), just one level further out in the hierarchy, trading a much larger miss-time penalty (disk access is $\\sim10^4$–$10^5\\times$ slower than RAM, versus a cache's typical $3$–$20\\times$ miss penalty over hit time) for enormously larger effective capacity.

**Two guarantees this "elements of deceit" mechanism must uphold**: **transparency** — virtual-memory locations "look" the same to a running program whether their data currently happens to live on disk or in RAM; **isolation** — software's view of address space size is decoupled from how much physical RAM is actually installed on this particular machine.

**Demand paging, the basic mechanism**: partition memory into fixed-size **pages** (typically 2K–8K bytes); start with *all* of a process's virtual memory nominally residing on disk (the "swap area"), with the memory-management unit (MMU) initially "empty" (mapping nothing). As the program begins running, each virtual address (VA) gets **mapped** to a physical address (PA) on demand: a reference to a RAM-resident page is handled entirely by hardware; a reference to a **non-resident** page **traps** to a software handler, which fetches the missing page from disk into RAM, adjusts the MMU to map the newly-loaded page, and — if RAM is already full — may have to **replace** ("swap out") some little-used page first to free up room. The working set (Module 5's locality card) is thus **incrementally loaded** and gradually evolves as the program's actual access pattern shifts over time — never loading more of the address space into RAM than is genuinely being used.`,
    related: ["mit6004-vm-address-space-lessons", "mit6004-vm-page-map-design"],
  },
  {
    id: "mit6004-vm-page-map-design",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the simple page-map design (virtual page # → physical page # or page fault), and explain why HIGH address bits — not low — are used to select the page.",
    back: `**Function**: given a virtual address, split it into a **virtual page number** (the high-order bits) and a within-page **offset** (the low-order bits). The **page map** (indexed by virtual page number) either **maps** to a physical page number — returning \`(physical page #, same offset)\` as the physical address — **or** signals a **page fault**, invoking software to bring the needed page in from disk and install a fresh mapping.

**Per-entry fields** (the "VI-1 view"): one page-map entry **per virtual page**. **RESIDENT bit (R)** $=1$ if the page currently lives in RAM, $0$ if it's non-resident (on disk, or never allocated) — referencing a page with $R=0$ triggers a page fault. **PPN (Physical Page Number)** of each *resident* page. **DIRTY bit (D)** — set once the page has been modified since being loaded from disk, meaning it must be written back to disk if evicted (exactly analogous to a cache's dirty bit, Module 5).

**Why use the HIGH address bits to select the page, not the low ones?** Locality. Choosing the page number from the **high-order** bits means addresses that are numerically *close together* (differing only in their low-order offset bits) land on the **same page** — keeping spatially-local data (an array, a struct, a stretch of sequential code) resident together as a unit, so that once *one* address on a page triggers a fault and brings the page in, *nearby* addresses on that same page become hits "for free." Using low-order bits instead would scatter nearby addresses across many different pages, defeating exactly the locality-driven benefit paging is designed to capture (this is the same reasoning, applied one level up, as the earlier "why low bits" cache-index discussion — but note the *direction* differs: caches use low bits for the **index** specifically to spread contention across independent cache lines, while page maps use high bits for the **page number** specifically to keep spatially-local data grouped on one page; the two designs optimize for different things at different granularities).`,
    pitfall:
      "This inverts the cache-indexing intuition from Module 5 (where LOW address bits picked the cache index, specifically to spread nearby, independently-hot addresses across different cache lines) — for page maps, HIGH bits pick the page specifically so that nearby addresses land on the SAME page and share its residency status, since the goal here is grouping locality together, not spreading contention apart.",
    related: ["mit6004-vm-illusion-and-demand-paging", "mit6004-vm-page-map-arithmetic"],
  },
  {
    id: "mit6004-vm-page-map-arithmetic",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Give the bit-size formulas relating virtual address size, physical address size, and page size to the page map's dimensions, and work the numeric example showing why page maps themselves get expensive.",
    back: `**Notation**: $2^v$ = number of virtual pages, $2^m$ = number of physical pages, $2^p$ = bytes per physical page (page size). Then: **bits in a virtual address** $= v + p$; **bits in a physical address** $= m + p$; a typical page size is 1K–8K bytes; typical $(v+p)$ is 32 (or more) bits; typical $(m+p)$ is 30–32 bits (1G–4G of physical memory). **Page map size**: one entry per *virtual* page, each entry holding a PPN ($m$ bits) plus a few status bits (D, R, ...) — total page-map size is roughly $(m+2) \\cdot 2^v$ bits.

**Worked example**: 32-bit virtual address, $2^{12}$-byte (4KB) page size, $2^{30}$-byte (1GB) maximum RAM. Then: **# Physical Pages** $= 2^{30}/2^{12} = 2^{18} = 256K$; **# Virtual Pages** $= 2^{32}/2^{12} = 2^{20}$; **# Page Map Entries** $= 2^{20} = 1M$ (one per virtual page, regardless of how many are actually resident); **# Bits in the page map** $\\approx 20 \\times 2^{20} \\approx 20M$ bits (using $m=18$ physical-page-number bits rounded up, plus a few status bits, times $2^{20}$ entries).

**The punchline — "Use SRAM for the page map??? OUCH!"**: a **20-million-bit** (roughly 2.5MB) table, if implemented in dedicated fast SRAM the way a small cache's tag/data array is, would itself be an enormous and expensive piece of hardware — far too costly to dedicate purely to page-mapping bookkeeping. This directly motivates **moving the page map into ordinary main memory** instead of dedicated SRAM (related card) — trading page-map storage cost for a new problem (every memory reference now potentially costs *two* memory accesses: one to read the page-map entry, one for the actual data) that the TLB (related card) exists specifically to solve.`,
    related: ["mit6004-vm-page-map-design", "mit6004-vm-tlb"],
  },
  {
    id: "mit6004-vm-tlb",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What problem does moving the page map into RAM create, and how does a Translation Look-aside Buffer (TLB) fix it? Why is a TLB typically fully-associative?",
    back: `**The problem**: since a dedicated-SRAM page map is too expensive at realistic sizes (related card), move the page map into ordinary **main memory** instead (accessed via a *Page Table Pointer* register, added to the virtual page number to locate the right entry). But this creates a genuine **2x performance hit**: **every** memory reference now requires **two** physical-memory accesses — one to fetch the relevant page-map entry, and a second for the actual data (or code) being referenced.

**The solution — cache the page-map entries**: add a small, dedicated cache specifically for **recently-used page-map entries**, called a **Translation Look-aside Buffer (TLB)**. On a **TLB hit**, the virtual-to-physical translation is available immediately, with no extra memory access — restoring single-access-per-reference performance for the common case. On a **TLB miss**, fall back to the slower two-access path (read the page-table entry from memory, then the data), simultaneously **installing** that entry into the TLB for next time.

**Why this works — "SUPER locality"**: ordinary locality of reference (Module 5) already justifies caching *data*; page-map entries benefit from an even *stronger* form of locality, since a single page-map entry covers an entire page's worth (thousands of bytes) of virtual addresses — the same page-table entry gets reused across every reference within that page, not just nearby-in-time references to the *same* address, making TLB hit rates typically very high even with a small TLB.

**Why fully-associative?** TLBs are typically small (16–64 entries) and **fully-associative** — since the whole point is mapping an arbitrary, unpredictable virtual page number to *some* entry with no natural indexing structure analogous to a data cache's address bits (the virtual page number *is* the key being searched for, not an address that can be split into an index+tag the way ordinary cache addressing works), full associativity at this small scale is affordable and avoids the collision problems a direct-mapped or lightly-associative design would introduce for what is, in effect, a very small, very hot, fully-general lookup table.

**Variations mentioned for further economy**: sparse page-map storage (don't allocate table space for virtual regions that are entirely unmapped) and "paging the page map" — applying the *same* demand-paging trick recursively to the page table itself, when even the in-memory page table grows too large to keep entirely resident.`,
    related: ["mit6004-vm-page-map-arithmetic", "mit6004-vm-contexts"],
  },
  {
    id: "mit6004-vm-contexts",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a 'context' precisely, and explain how contexts let multiple programs share a single physical memory simultaneously.",
    back: `**Definition**: a **context** is a mapping of virtual to physical locations, as dictated by the contents of the page map at a given moment — i.e., a context *is*, precisely, one particular assignment of every virtual page to either a physical page or "not resident."

**Multiple simultaneous contexts**: several programs may be **simultaneously loaded into main memory**, each occupying **different physical pages**, but each with its **own independent page map** — so each program's virtual address space can (and typically does) look identical from the program's own point of view (e.g. every program might believe its code starts at virtual address 0), while the actual physical pages backing those virtual addresses are completely disjoint between programs. Two virtual memories (Virtual Memory 1, Virtual Memory 2) can map into entirely separate regions of the *same* physical memory this way, with neither program aware of or interfering with the other's actual physical placement.

**"Context switch"**: to switch which program is currently running, simply **reload the page map** — swap in the new program's mapping in place of the old one. Nothing about physical memory itself needs to move; only the *translation* changes. This single mechanism — contexts plus fast context switching — is exactly what enables **timesharing** (multiple programs interleaved on one CPU, related card) and is the direct foundation the process abstraction and virtual-machine illusion (Lecture 18, related cards) build on top of.`,
    related: ["mit6004-vm-tlb", "mit6004-vm-os-process-abstraction"],
  },
  {
    id: "mit6004-vm-cache-interactions",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare cache and virtual-memory design parameters (block size, miss-time ratio, write policy), and explain the virtual-vs-physical-cache tradeoff.",
    back: `**Cache vs. virtual memory, as two instances of the same hierarchy idea but at very different scales**: a **cache** has relatively *short* blocks, *few* entries (a genuinely scarce resource), and a miss time that's only **3x–20x** the hit time — cheap enough that a write-through policy (paying the miss-equivalent cost on every write) is often perfectly acceptable. **Virtual memory** has a disk backing store with long access latency but fast bulk transfer once a page is located; its miss time (a page fault) is roughly **$10^5\\times$** the hit time — vastly more expensive relative to a hit than an ordinary cache miss — which makes **write-back essential** (a write-through policy, paying a $10^5\\times$-hit-time penalty on literally every write, would be catastrophic) and motivates using **large pages** (amortizing that huge miss cost over as much subsequently-useful data as possible, the same locality-driven logic as cache block size, just at a far more extreme cost ratio).

**Virtual vs. physical caches — where does a CPU-level cache sit relative to the MMU?** A **virtual cache** sits *before* the MMU (tags match virtual addresses) — advantage: **fast**, no MMU translation time needed on a hit; disadvantage: the cache becomes **invalid after a context switch** (the same virtual address now means something completely different under the new context's page map, so cached data under the old context's virtual addressing would be silently wrong if reused) — typically requiring a full cache flush on every context switch. A **physical cache** sits *after* the MMU (tags match physical addresses) — advantage: **avoids stale data after a context switch** (physical addresses mean the same thing regardless of which context is currently active, so no flush is needed); disadvantage: **slow** — MMU translation time is now on the critical path of every cache hit, not just misses.

**A middle path — overlapping cache lookup with MMU translation**: if cache-line selection is based on **unmapped** offset bits (bits within the page, which are identical between virtual and physical addresses since page offset never changes under translation), RAM access in a physical cache can **overlap** with page-map lookup — the cache's tag (once retrieved) is compared against the physical page number the MMU produces, rather than waiting for the MMU before starting the cache access at all. This wants a "small" cache index (so it fits entirely within the unmapped offset bits) — pushing toward **more associativity** rather than more index bits, to keep per-set size manageable while still getting adequate total cache capacity.`,
    related: ["mit6004-vm-illusion-and-demand-paging", "mit6004-arch-cache-write-strategies"],
  },

  // --- Lecture 18: Virtual machines, OS kernels, supervisor calls ---
  {
    id: "mit6004-vm-os-process-abstraction",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the 'process' abstraction (state, context, program, virtual I/O devices), and explain why it amounts to more than just virtual memory — a full 'virtual machine'.",
    back: `**The goal, stated directly**: give each running program its own apparent **virtual machine** — programs shouldn't have to "know about" each other or coordinate to avoid interfering with one another.

**A process bundles together**: **machine state** ($r0$, ..., $r30$ — general registers), a **context** (its own virtual address space, related card), **PC and stack** (its own independent execution point and call-stack storage), a **program** (its code, which may be *shared* read-only across multiple processes — e.g. multiple instances of the same application), and **virtual I/O devices** (its own apparent console, keyboard, etc., even though the real hardware devices are physically shared).

**Why this is genuinely "more than just virtual memory"**: a context alone only solves the *address-space* isolation problem (two programs' virtual addresses don't collide in physical memory) — it says nothing about *time*-sharing the CPU itself, or about how a program interacts with I/O devices it doesn't have exclusive physical access to. Bundling context together with independent register/PC/stack state and *virtualized* I/O access is what completes the illusion that each process has its own dedicated, private computer — hence "**virtual machine**," a strictly richer abstraction than context/virtual-memory alone.

**The OS Kernel's role**: a **specially privileged process** that oversees all the other (ordinary) processes and handles the *real*, physical I/O devices directly — emulating a private virtual I/O device for each ordinary process on top of that shared physical hardware. Every "application" is, from the kernel's perspective, just another process being multiplexed onto the one real CPU (related card).`,
    related: ["mit6004-vm-contexts", "mit6004-vm-os-multiplexing-cpu"],
  },
  {
    id: "mit6004-vm-os-multiplexing-cpu",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the mechanism by which the OS multiplexes a single physical CPU across multiple processes, and identify the key enabling technology.",
    back: `**The sequence of events for a single context switch**: (1) process #0 is currently **running**. (2) Execution of process #0 **stops** — either because it explicitly **yields** (voluntarily gives up its turn, related card), or because a timer **interrupt** fires; either way, this **traps** to handler code, which saves the current PC into $XP$ (the same forced-procedure-call exception mechanism from Module 5, applied here to a *timer* interrupt rather than an illegal opcode or fault). (3) The handler first **saves** process #0's complete state (registers, context/page-map) somewhere durable, then **loads** process #1's previously-saved state (registers, context) into the actual hardware. (4) Execution **"returns"** to process #1 — using the *exact same* return-from-trap-handler mechanism as returning from any other exception (an address in $XP$), except this return lands in a **different** trap than the one that was entered in step (2), since it's process #1's saved return point, not process #0's. (5) Process #1 is now **running**.

**Key technology: interrupts.** The entire multiplexing mechanism is built directly on top of the exception/interrupt machinery already established for illegal opcodes and faults (Module 5) — a **timer interrupt** is simply one more asynchronous event source using that same forced-procedure-call, save-PC-in-$XP$ discipline, just with the resulting handler code implementing scheduling logic (choose the next process to run) rather than error recovery.`,
    related: ["mit6004-vm-os-process-abstraction", "mit6004-vm-os-interrupt-handling-beta"],
  },
  {
    id: "mit6004-vm-os-interrupt-handling-beta",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the Beta's minimal hardware interrupt-handling implementation, and the entry/exit structure of an interrupt handler (hardware 'stub' + C handler body).",
    back: `**Minimal hardware implementation**: (1) check for pending **Interrupt Requests (IRQs)** before each instruction fetch. (2) On an IRQ: copy the current PC into $Reg[XP]$ (exactly the exception-linkage convention from Module 5); **install** a fixed address as the new PC. **Where to find handlers**: the Beta scheme wires in a fixed low-memory address for **each** exception's entry point directly (e.g. \`RESET → 0x80000000\`, \`ILLOP → 0x80000004\`, external interrupt \`X_ADR → 0x80000008\`, each holding a \`BR(...)\` instruction that jumps to the real handler) — a common **alternative** design instead wires in the address of a **table** of handler addresses ("interrupt vectors"), adding one level of indirection but avoiding needing a fixed, separately-numbered low-memory slot per exception type.

**Handler coding pattern — a hardware-facing assembly "stub" wrapping a C handler body**: a **stub**, written in assembly, first **saves** interrupted-process state into a \`User\` structure (all 31 registers plus PC, which arrives via $XP$); then it **calls a C procedure** to actually handle the exception (e.g. incrementing a time-of-day counter, or running the scheduler); then it **re-installs** the saved state from the \`User\` structure; finally it **returns to $Reg[XP]$** — this whole sequence is architecturally **transparent to the interrupted program**, which cannot tell it was ever paused. Splitting handler code this way — a small assembly stub for the raw save/restore/dispatch mechanics, a C procedure for the actual handling logic — is standard practice, since save/restore sequences are tedious, error-prone, and essentially boilerplate, while the handling logic itself benefits from being written in a higher-level language.`,
    related: ["mit6004-vm-os-multiplexing-cpu", "mit6004-vm-os-kernel-user-mode"],
  },
  {
    id: "mit6004-vm-os-kernel-user-mode",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the reentrance problem for interrupt handlers, and how does a Kernel/User mode distinction (with an uninterruptable Kernel mode) solve it?",
    back: `**The reentrance problem**: a handler that is itself **interruptable** — i.e., a *second* interrupt can fire while the *first* interrupt's handler is still running — is called **re-entrant**, and re-entrant handlers pose genuinely tricky correctness problems (partially-updated shared state, nested save/restore bookkeeping, etc.). **The Beta, like many real systems, disallows re-entrant interrupts** as the simplest available fix.

**Mechanism — an uninterruptable "Kernel mode"**: extend the processor state with a **Kernel/User mode flag** — concretely, on the Beta, bit $PC_{31}$ of the PC itself doubles as this flag ($PC_{31}=1$ means Kernel mode). **User mode** runs ordinary application code; **Kernel mode** runs the operating system's page-fault handler, SVC handlers, the clock handler, and other privileged OS logic — and, critically, **Kernel mode is itself uninterruptable** (further interrupts are deferred while any Kernel-mode handler is running), directly preventing the re-entrance problem the mechanism exists to solve. Other functions this same K-mode flag/mechanism typically also gates: **choosing** which context (Kernel's own, or a User process's) is currently active, and **allowing certain privileged operations** that ordinary User-mode code is forbidden from executing directly (e.g. directly modifying the page map, or accessing I/O device registers).

**Why this specific fix, rather than allowing carefully-managed re-entrance?** Disallowing re-entrance entirely trades away some responsiveness (a low-priority interrupt handler, once it starts, genuinely blocks *all* further interrupt handling until it finishes) for a dramatically simpler correctness argument — no handler ever needs to reason about a second copy of itself (or a different handler) running concurrently and touching shared kernel state. This tradeoff — and its real cost for time-critical systems — is exactly what motivates the later real-time/preemption discussion (Lecture 19, related cards), where genuinely bounding interrupt-service latency eventually requires relaxing this simple "kernel mode is fully uninterruptable" rule in favor of a more nuanced, priority-based scheme.`,
    pitfall:
      "Disallowing reentrant interrupts doesn't mean interrupts are ignored while in Kernel mode — pending interrupt REQUESTS are simply deferred (queued/held pending) until Kernel mode is exited, not dropped; this distinction between 'deferred' and 'lost' is exactly what makes the mechanism correctness-preserving rather than a source of missed events.",
    related: ["mit6004-vm-os-interrupt-handling-beta", "mit6004-vm-io-weak-vs-strong-priorities"],
  },
  {
    id: "mit6004-vm-os-supervisor-calls",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why can't user-mode code call OS kernel procedures directly, and how does a supervisor call (SVC), implemented via deliberate illegal instructions, solve this?",
    back: `**The problem**: user-mode application code frequently needs services from the OS kernel — accessing virtual I/O devices, communicating with other processes, and so on. But if the kernel is running in **another context** (a separate virtual address space, not the user program's own), an ordinary procedure call (which assumes shared, directly-addressable code/data) simply **cannot reach it** — there's no direct way to "jump into" code living in a different context's address space using the Module-4 calling convention.

**The solution's abstraction — a Supervisor Call (SVC)**: an instruction that passes **arguments in registers**, requests some kernel-provided service, and receives a **result** in $r0$ (or, for larger results, in shared user-mode memory) — conceptually a "procedure call across the user/kernel boundary."

**The solution's implementation — deliberately illegal instructions**: SVCs are implemented by using instructions that are otherwise **illegal opcodes**, causing an ordinary illegal-instruction exception exactly as in Module 5. The **OS's illegal-opcode handler** specifically recognizes certain illegal-instruction patterns as **legitimate, intentional user-mode SVC requests**, rather than genuine errors, and dispatches accordingly (related card) — reusing the *existing* exception machinery (context switch into kernel mode, save/restore state) rather than needing any brand-new hardware mechanism purpose-built for cross-context calls. This is a clean instance of a general design move seen before (Module 5's exception-based instruction-set extension via illegal-opcode traps) — SVCs are, structurally, just illegal-opcode traps whose "error recovery" happens to be "do the thing the program actually wanted," rather than reporting failure.`,
    related: ["mit6004-vm-os-kernel-user-mode", "mit6004-vm-os-illop-dispatch"],
  },
  {
    id: "mit6004-vm-os-illop-dispatch",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the illegal-opcode handler's dispatch mechanism, including how it distinguishes genuine illegal instructions from intentional SVCs, and the two-level table structure used.",
    back: `**Illegal-opcode handler (\`I_IllOp\`)**: on any illegal-instruction exception (the fixed hardware entry point at, e.g., \`0x00000004\`), the handler first **saves the full machine state** of the interrupted process (all registers, since it can't trust the user's own stack for this — the exception could have occurred at any point, including with a corrupted or exhausted user stack). It then **fetches the illegal instruction itself** (found via $Reg[XP]-4$, since $XP$ holds the *next* instruction's address), **extracts its 6-bit opcode**, and uses that opcode as an **index into a dispatch table** (\`UUOTbl\`, a 64-entry table — one entry per possible opcode value) — each table entry is the address of a **handler** for that specific opcode, and the illop handler simply **jumps to** whichever handler the table indicates.

**Distinguishing genuine illops from SVCs**: the dispatch table's entries fall into two categories. **\`BAD()\`** entries point to a generic **UUOError** ("truly unused opcode") handler — for opcodes that represent genuine, unintended illegal instructions — which types out a diagnostic error message (instruction value and location) and then **crashes** (halts) the system, since there's no sensible way to recover from a genuinely nonsensical instruction. **\`UUO(ADR)\`** entries instead point to a *specific*, legitimate **supervisor-call sub-handler** — for opcodes that were deliberately chosen by the SVC convention to encode a particular requested service.

**A second level of dispatch, for SVCs specifically**: the SVC's own instruction format further encodes an **SVC index** in its low-order bits (distinct from — nested one level beneath — the top-level opcode dispatch); the sub-handler (\`SVC_UUO\`) extracts this index and uses it as a second table lookup (\`SVCTbl\`) to reach the *specific* requested service's actual handler (e.g. \`SVC(1)\`: write a message; \`SVC(3)\`: get a key; \`SVC(7)\`: yield). This two-level table structure — opcode dispatch, then (for the SVC opcode specifically) SVC-index dispatch — lets the kernel support a rich menu of distinct supervisor services while using only a **single** reserved illegal-opcode value at the hardware-visible level.`,
    pitfall:
      "The illop handler saving ALL registers up front — not just the ones the specific requested service needs — is deliberate: at the moment the exception fires, the handler has no idea yet whether this is a genuine error, a SVC(1), or a SVC(7); a uniform, conservative full-state save (via the SAVESTATE macro) keeps the recovery path correct regardless of which specific handler ultimately runs.",
    related: ["mit6004-vm-os-supervisor-calls", "mit6004-vm-os-interrupt-handling-beta"],
  },

  // --- Lecture 19: Devices, interrupts, real-time ---
  {
    id: "mit6004-vm-io-readkey-evolution",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Trace the three-attempt evolution of the ReadKey SVC handler (broken busy-wait in the kernel, working-but-wasteful busy-wait in user mode, then yield-based), and state exactly what each attempt fixes.",
    back: `**Setup**: a keyboard interrupt handler (\`KEYhit_h()\`) runs on every physical keystroke, placing the received character into a per-device **buffer**; a \`ReadKey\` supervisor call is meant to hand the *next* buffered character back to whichever application requested it.

**Attempt #1 — busy-wait inside the SVC handler (broken)**: \`ReadKEY_h() { while (BufferEmpty(kbdnum)) { /* busy wait */ } User.Regs[0] = ReadInputBuffer(kbdnum); }\`. **Fatal problem**: this busy-wait loop runs **inside the kernel's SVC handler** — but recall (related card) the kernel is **uninterruptable** while handling any exception, including this SVC. Since the keyboard-hit handler that would actually *fill* the buffer is itself an interrupt, and interrupts are deferred throughout the SVC handler's uninterruptable execution, **the buffer can never get filled** while this loop is spinning — the system deadlocks waiting on a condition it has simultaneously made impossible to satisfy.

**Attempt #2 — busy-wait in USER mode (works, but wasteful)**: instead of looping inside the kernel, the handler checks once: if the buffer is empty, it **backs up** $Reg[XP]$ by 4 (\`User.Regs[XP] -= 4\`) so that, on return to the interrupted user program, the *same* \`ReadKey\` SVC instruction gets **re-executed** — effectively "a funny way to write a loop" entirely out of repeated SVC-trap/return cycles in user mode, where interrupts (including the keyboard interrupt that fills the buffer) **can** occur between attempts. This genuinely works — but the process **wastes its entire remaining time-slice** just repeatedly re-issuing the same SVC while waiting for a keystroke that may not come for a long time.

**Attempt #3 — yield on I/O wait (even better)**: instead of merely re-issuing the SVC and letting the scheduler eventually preempt it, the handler explicitly calls \`Scheduler()\` (related card) right after backing up $XP$ — **voluntarily yielding** the remainder of its time-slice immediately, rather than burning it on pointless repeated-SVC busy-waiting. **Result**: measurably **better CPU utilization**, since the time that would otherwise have been wasted on Attempt #2's spin loop is now available for *other* processes to make productive progress. **The cost of this improvement**: scheduling and context-switching overhead (Attempt #3 pays a real context switch immediately on I/O wait, rather than only whenever the timer would have preempted it anyway) — but that cost is judged worthwhile, since it converts wasted spin-time into productive use of another process's turn.`,
    related: ["mit6004-vm-io-sleep-wakeup", "mit6004-vm-os-kernel-user-mode"],
  },
  {
    id: "mit6004-vm-io-sleep-wakeup",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the active/waiting process-state scheduling refinement, and the sleep(reason)/wakeup(reason) primitive pair that implements it.",
    back: `**The refinement over Attempt #3** (related card): rather than the scheduler blindly cycling through **every** process, including ones known to be stuck waiting on slow I/O, classify processes into **ACTIVE** or **WAITING** ("sleeping") states, and have the scheduler cycle among **ACTIVE processes only** — avoiding wasted scheduling attention on processes that are certain not to be able to make progress right now.

**State transitions**: an active process moves to **WAITING** status the moment it tries to read a character and finds its buffer empty (rather than immediately yielding-and-retrying, as in Attempt #3, it now records *why* it's waiting and steps fully out of the active rotation). Each waiting process's process-control-block records a code (e.g. "waiting on keyboard $N$") describing exactly what event it's waiting for. When a **device interrupt** occurs (e.g. on keyboard $N$), the corresponding handler moves **any and all** processes currently waiting on that specific device back to **ACTIVE** status, making them eligible for scheduling again.

**The primitives** (mirroring real UNIX kernel utility functions): \`sleep(reason)\` — puts the **current** process to sleep, where \`reason\` is an arbitrary value (chosen by convention, e.g. a device number) identifying the condition that will eventually reactivate it. \`wakeup(reason)\` — makes **active** every process currently sleeping on that same \`reason\` value (there may be more than one process waiting on the same event, e.g. several processes all blocked on the same keyboard). This reason-based sleep/wakeup pairing decouples *who* is waiting from *what* eventually wakes them — the interrupt handler that calls \`wakeup\` doesn't need to know which specific processes (if any) are currently sleeping on that reason; it simply broadcasts "this condition is now satisfied" and lets the scheduler sort out who benefits.`,
    related: ["mit6004-vm-io-readkey-evolution", "mit6004-vm-io-interrupt-latency"],
  },
  {
    id: "mit6004-vm-io-interrupt-latency",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define interrupt latency precisely, list its main sources, and state the general design goal it motivates.",
    back: `**Definition**: **interrupt latency** is how much time can elapse between an interrupt **request** and the **start** of its handler's service (not the total time until the service *completes* — just until it *begins*). Visually: a timeline with a **Request** mark, then a **Latency** interval, then the handler's **Service Time**, ideally finishing before some application-imposed **Deadline**.

**Why this matters — "real time" considerations**: when service is delayed beyond an application-specific deadline, genuinely bad things can happen — from merely annoying (**missed characters** at a keyboard) to catastrophic (**system crashes**, or — in the most extreme illustrative framing used in lecture — **nuclear meltdowns**) depending on what's actually being controlled. These deadline-driven constraints are collectively "**hard real-time**" requirements.

**Sources of interrupt latency**: (1) **state save / context switch overhead** — the time the hardware/software mechanism itself takes to notice the interrupt and begin dispatching to a handler (this is addressable through better ISA/OS design — "we can address this in our ISA," a genuinely engineerable cost). (2) **Periods of uninterruptability** — long, uninterruptable instructions already in progress (e.g. block moves, multi-level indirection operations) that the processor can't abandon mid-execution; and explicitly disabled interrupt periods (e.g. Kernel mode's uninterruptability, related card, deliberately held during service of *other* interrupts to avoid reentrance). Uninterruptable-instruction latency is largely **application-dependent** (which specific long instructions a given program happens to execute), while explicit disable periods are a designed-in *system* property.

**The goal**: **bound**, and **minimize**, interrupt latency — via (a) optimizing the interrupt-sequence context-switch mechanism itself, (b) making unbounded-time instructions genuinely interruptable wherever feasible, (c) avoiding or minimizing disabled-interrupt time, and (d) allowing handlers themselves to be interrupted in certain controlled cases — while still avoiding the **reentrant-handler** correctness problems (related card) that motivated disallowing interruption of Kernel mode in the first place. This tension — bounding latency versus preserving simple non-reentrant correctness — is exactly what the weak-vs-strong priority scheduling discussion (related card) works out concretely.`,
    related: ["mit6004-vm-os-kernel-user-mode", "mit6004-vm-io-weak-vs-strong-priorities"],
  },
  {
    id: "mit6004-vm-io-weak-vs-strong-priorities",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast weak (non-preemptive) and strong (preemptive) interrupt priority schemes, and use a worked worst-case-latency example to show why weak priorities alone can fail to meet a tight deadline.",
    back: `**Weak (non-preemptive) priorities**: the processor becomes interruptable only at each new instruction fetch; if **several** interrupt requests happen to be simultaneously pending at that moment, they're serviced in a fixed, **prescribed sequence** (e.g. Disk > Printer > Keyboard, by convention). Critically: once a handler for a **lower**-priority device has actually **begun**, an even-**higher**-priority request that arrives during that handler's execution must still **wait** for it to finish — there's no preemption once service starts. **Worst-case latency under weak priorities** for a given device = service time of **one** other arbitrary device whose request just happened to be honored immediately beforehand, **plus** the service time of **all** higher-priority devices (since any combination of those might also be simultaneously pending and would all be serviced first, in priority order, before this device's turn comes up).

**Worked example — three devices, weak priority order Disk > Printer > Keyboard**: service times Keyboard=800, Disk=500, Printer=400 (arbitrary time units). Worst-case latencies: Keyboard $= 500{+}400 = 900$ (must wait for both higher-priority Disk and Printer); Disk $= 800{+}400 = 1200$ (Disk is lower priority here in this ordering... — the exact numeric assignment depends on the chosen priority order, illustrating that **the choice of priority ordering itself changes each device's worst-case bound**, not just which device happens to win ties).

**The need for preemption**: without preemption, **any** interrupt service — however low its own priority — can delay **any** other pending request, since once *started* it always runs to completion uninterrupted; the *slowest* device's service time alone constrains how fast the tightest deadline anywhere in the system can be met, **regardless of priority ordering**. Concrete illustrative deadline: an 800μs deadline on disk service (needed, e.g., to avoid missing the next disk sector) requires a maximum interrupt latency of just 300μs for disk requests — but weak priorities, worked through the numbers, **cannot** guarantee this for every possible combination of simultaneously-pending requests.

**Strong (preemptive) priorities — the fix**: expand the interrupt-enable bit in the PC into a full **priority integer** PRI (e.g. 3 bits, for 8 levels). Assign each device its own fixed priority. Before each instruction, find the priority $P_i$ of the highest-priority currently-requesting device; take that interrupt (preempting whatever's currently running, **including an in-progress lower-priority handler**) if and only if $P_i > PRI$ (the currently-active priority level), then set $PRI = P_i$ for the duration of that handler. **Key benefit**: this allows genuine **preemption** of lower-priority handlers by higher-priority ones (though still **not** reentrance — a handler still cannot be preempted by another request at the *same or lower* priority, preserving the non-reentrance correctness property, related card, just now scoped *per priority level* rather than globally). **Benefit, precisely**: latency seen at **high** priorities becomes completely **unaffected** by the service times of low-priority devices — exactly the guarantee weak priorities cannot offer.`,
    pitfall:
      "Strong priorities solve the 'low-priority handler blocks a higher-priority request' problem, but do NOT reintroduce full reentrance — a handler still can't be interrupted by another request at its own or a lower priority level; only STRICTLY higher-priority requests can preempt it, which is exactly enough to bound high-priority latency without reopening the same-priority reentrance correctness problems Kernel mode was designed to avoid.",
    related: ["mit6004-vm-io-interrupt-latency", "mit6004-vm-io-real-time-worked-example"],
  },
  {
    id: "mit6004-vm-io-real-time-worked-example",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Using the 'Ben visits ISS' worked example, show how to compute interrupt LOAD (% of CPU time consumed by service) and check real-time feasibility under weak vs. strong priority scheduling.",
    back: `**Interrupt load**: for a periodically-recurring interrupt with **service time** $S$ and **maximum frequency** $F$ (occurrences per second), the fraction of total CPU time it consumes is simply $S \\times F$ — e.g. a device with 400μs service time recurring up to 1000 times/second consumes $400\\mu s \\times 1000/s = 40\\%$ of all CPU time. Summing this fraction across every recurring interrupt source, whatever's **left over** is available for actual application progress — and it's a genuine system-design failure if that remaining fraction would go **negative** (i.e., the combined guaranteed service demands exceed 100% of available CPU time — the workload is fundamentally infeasible on this hardware, no scheduling cleverness can fix it).

**Worked example — "Ben visits ISS"**: the International Space Station's onboard computer must handle three periodic tasks — Supply-ship guidance (period 30ms, service 5ms, deadline 25ms — consuming 16.6% of CPU time), Gyroscope monitoring (period 40ms, service time to be determined, deadline 20ms — consuming 25%), and Cabin-pressure control (period 100ms, service time to be determined, deadline 100ms — consuming 10%).

**Under a weak (non-preemptive) priority system**: question — what is the **maximum service time** for Cabin Pressure that still lets *all* deadlines be met? Working through the worst-case-latency arithmetic (related card) for a chosen priority ordering (Guidance > Gyroscopes > Cabin-pressure) yields an answer of **under 10ms** — i.e., the lowest-priority task's own deadline (100ms) sounds generous in isolation, but weak-priority interference from the higher-priority tasks eats heavily into its *effectively available* service-time budget.

**Under a strong (preemptive) priority system**, with ordering Gyroscopes > Guidance > Cabin-pressure: the maximum feasible Cabin-pressure service time works out to a noticeably **larger** figure ($100 - (3\\times10) - (4\\times5) = 50$ ms in the worked numbers) — a direct, concrete illustration of strong priorities' core benefit (related card): by eliminating the "already-started lower-priority handler blocks a higher/other request" interference weak priorities suffer from, preemption recovers substantially more usable service-time budget for the same real-time deadlines, at the cost of the added PRI-register hardware and priority-assignment design complexity.

**The closing characterization**: real-time scheduling with hard deadlines is "a **black art**" in practice — genuinely complex to reason about exhaustively for realistic multi-device workloads — but the weak-vs-strong priority framework, combined with straightforward interrupt-load accounting, gives a tractable, quantitative way to check feasibility and compare designs before committing to hardware.`,
    related: ["mit6004-vm-io-weak-vs-strong-priorities"],
  },
];
