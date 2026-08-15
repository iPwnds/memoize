// MIT 6.828 (Fall 2012) — Lectures 4-5: virtual memory (paging as a level
// of indirection, x86 page table entries, the two-level page table, page
// faults, xv6's specific address-space layout, and how sbrk() actually
// grows a process's heap) and interrupts/exceptions (the unified
// syscall/interrupt/exception entry mechanism, the INT instruction's exact
// steps, the IDT, the xv6 trapframe, syscall dispatch, kernel-mode
// interrupts, and how fork() bootstraps a brand-new kernel stack). See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6828-vm";

export const mit6828VmInterruptsCards: Card[] = [
  // --- Lecture 4: Virtual Memory ---
  {
    id: "mit6828-vm-paging-indirection",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the motivating problem paging solves (a buggy shell writing to a random address), and explain why 'mapping' (indirection) is a more powerful solution than a simple base/bound scheme.",
    back: `**The motivating problem**: suppose the shell has a bug — sometimes it writes to a random memory address. How does the kernel keep that write from **wrecking the kernel itself**, or from **wrecking other processes**? The general goal: **isolated address spaces** — each process has its own memory, can read and write *its own* memory, and **cannot** read or write anything else. xv6 uses x86's paging hardware to implement this.

**Paging as a level of indirection**: $CPU \\to MMU \\to RAM$, translating every **virtual address (VA)** the CPU issues into a **physical address (PA)** before it ever reaches memory. Software can only load/store to virtual addresses — never physical ones directly. The kernel tells the MMU **how** to map each virtual address to a physical one; the MMU consults something that is, in essence, a table indexed by VA, yielding a PA — this is the **page table**. Critically, the MMU can also **restrict which virtual addresses user code is even allowed to use at all**.

**Why mapping (indirection) rather than something simpler, like a base/bound scheme** (where a process's addresses are just a contiguous range added to some base, checked against a bound)? **Indirection lets paging hardware solve many problems beyond simple isolation** that a rigid base/bound scheme cannot: it **avoids fragmentation** (a process's virtual address range can be contiguous even though the underlying physical pages backing it are scattered anywhere in RAM); it enables **copy-on-write \`fork()\`** (two processes' page tables can point at the *same* physical pages, deferring an actual copy until either process writes); and it enables **lazy allocation** (a page can be left unmapped until it's actually first touched, deferring real physical-memory commitment) — and "many more techniques" beyond these, all made possible specifically because the VA-to-PA relationship is an arbitrary, software-controlled *mapping*, not a fixed arithmetic offset.`,
    related: ["mit6828-vm-pte-structure", "mit6828-vm-page-fault"],
  },
  {
    id: "mit6828-vm-pte-structure",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the structure of an x86 page table entry (PTE): what the top and bottom bits encode, and how a page table is indexed.",
    back: `**Page size**: x86 maps memory in **4-KB pages**, aligned — every page starts on a 4KB boundary. Since a page covers $2^{12}$ bytes, the **page table index is the top 20 bits of a virtual address** (the remaining low 12 bits are the *offset within* the page, which passes through translation unchanged).

**What's in a Page Table Entry (PTE)**: the **top 20 bits** are the top 20 bits of the corresponding **physical address** — the **"physical page number" (PPN)**. Translation, at its core, is simply: the MMU **replaces the top 20 bits of the VA with the PPN** from the matching PTE, leaving the low 12 offset bits untouched. The **low 12 bits** of a PTE are **flags**, not part of the address at all — including (among others) **Present** (is this mapping currently valid?) and **Writable** (can this mapping be written to, or is it read-only?).

**Where the page table itself lives**: in ordinary **RAM** — the MMU *loads* (and, when the OS updates a mapping, *stores*) PTEs directly from/to memory, and the OS is free to read and write PTEs like any other in-memory data structure (subject to its own privilege, of course) when it needs to establish or change mappings.`,
    related: ["mit6828-vm-paging-indirection", "mit6828-vm-two-level-page-table"],
  },
  {
    id: "mit6828-vm-two-level-page-table",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why would a flat, single-level page table waste memory, and how does x86's two-level page table avoid that waste? Walk through the full VA-to-PA translation.",
    back: `**Would a flat array of PTEs be reasonable?** Work out the size: with 20-bit page-table indices, there are $2^{20}$ (about a million) possible entries; at 32 bits (4 bytes) per PTE, a **full** flat page table would need **4MB** — "pretty big" even on modern machines, and it would **waste enormous amounts of memory for small programs**, since a typical process only actually needs mappings for a few hundred pages, yet a flat table would still have to physically allocate storage for essentially all one million *possible* entries, the vast majority of which would sit unused.

**x86's fix — a two-level page table**: the top **10** bits of a VA index a small, always-present **Page Directory (PD)** (1024 entries) in RAM; each PD entry (**PDE**) itself contains a 20-bit PPN, but pointing not at a data page — at a **page of PTEs** (1024 PTEs, a "page table" proper). The next **10** bits of the VA then index *that* page of PTEs to find the actual PTE. In total this structure can address $1024 \\times 1024$ PTEs — the same coverage as the flat design — but crucially, **PD entries can be marked invalid**, meaning an entire *page* of 1024 PTEs simply **need not exist in memory at all** if none of those 1024 mappings are actually needed — so a page table for a small address space stays genuinely small, allocating real memory only for the PD-entry ranges actually in use.

**How the MMU finds the page table in RAM**: register **\`%cr3\`** holds the physical address of the **PD**; the PD's entries in turn hold the physical addresses of the individual PTE pages — these PTE pages **can be located anywhere in RAM** (they need not be contiguous with each other or with the PD), since each is reached via an explicit pointer (the PDE), not by any fixed arithmetic offset.

**The full translation, step by step**: (1) \`%cr3\` gives the physical address of the PD. (2) The VA's **top 10 bits** index the PD to get the physical address of the relevant page of PTEs (the "PT"). (3) The VA's **next 10 bits** index that PT to get the actual PTE. (4) The final physical address is the PTE's **PPN** combined with the VA's **low 12 bits** (the untranslated in-page offset).`,
    pitfall:
      "The two-level structure isn't primarily about translation speed — it's specifically a memory-saving technique. A flat one-level table always costs 4MB regardless of how sparsely a process uses its address space; the two-level design lets entire unused REGIONS of the address space (whole PD entries' worth, 4MB of VA space each) cost zero additional memory, which is exactly what makes small processes' page tables small.",
    related: ["mit6828-vm-pte-structure", "mit6828-vm-sbrk-implementation"],
  },
  {
    id: "mit6828-vm-page-fault",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What happens in hardware and software when a memory access finds the Present bit clear, or a store finds the Writable bit clear?",
    back: `**The trigger**: a memory access finds its PTE's **P (Present)** bit **not set** — the mapping simply doesn't currently exist — or a **store** instruction finds the **W (Writable)** bit **not set** on an otherwise-present mapping (a read-only page being written to). Either condition raises a "**page fault**."

**What the hardware does**: the CPU **saves registers** (exactly the same trap/interrupt machinery used for system calls and device interrupts, related card — page faults are not a special separate mechanism) and **forces a transfer of control to the kernel**, landing in xv6's \`trap.c\` fault-handling logic just like any other exception.

**What the kernel can do about it — two genuinely different responses**: (1) treat it as a **genuine error** — produce an error message and **kill the offending process** (the common case for a process that has, e.g., dereferenced a wild/uninitialized pointer). (2) treat it as a **deliberate, expected** signal that some lazy setup work now needs to happen — **install a fresh PTE**, then **resume the faulting process** exactly where it left off, completely unaware anything unusual occurred. Concrete example: after **loading the needed page of memory from disk** (classic demand paging, mirroring this course's earlier hardware-level treatment in MIT 6.004's virtual memory material) — or, as explored in this lecture's own in-class exercise, implementing **lazy allocation** (deferring the actual commitment of physical memory for a freshly-\`sbrk\`'d heap region until the process's first genuine touch of that memory triggers a fault, at which point the kernel allocates and maps a real physical page just in time).`,
    related: ["mit6828-vm-pte-structure", "mit6828-vm-paging-indirection", "mit6828-vm-idt-and-vectors"],
  },
  {
    id: "mit6828-vm-xv6-address-space-layout",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe xv6's per-process address space layout, and explain the reasoning behind mapping the kernel identically into every process's address space.",
    back: `**The layout** (each process has its own address space and its own page table): virtual addresses **below \`KERNBASE\` (\`0x80000000\`)** are **user** addresses — the process's own code, stack, and heap. From \`KERNBASE\` to \`KERNBASE+0x100000\` (1MB) maps **low-memory devices**, for the kernel's own use. Above that: **kernel instructions and data**. A large stretch (roughly 224MB in the specific numbers discussed) maps **DRAM** directly. And near the top of the address space, **more memory-mapped devices** are mapped in. Notably, user pages end up **double-mapped**: the same physical page backing a user address also appears at a second, kernel-side virtual address (related to the "easy for kernel to r/w physical memory" point below).

**All processes share the same kernel (high-memory) mappings** — only the low, user-address portion differs between processes' page tables. When the kernel switches from running one process to another, it **switches page tables** (sets \`%cr3\` to the new process's PD) — but the *kernel-half* of the mapping stays identical across every switch.

**Why this specific arrangement — several deliberate design payoffs**: **user virtual addresses all start at zero** for every process (of course, VA 0 maps to a *different* physical address per process) — giving each process up to 2GB of heap space that can grow **contiguously in virtual address terms**, even though the underlying physical memory backing it need not be contiguous at all (no fragmentation problem, directly exploiting the indirection benefit of paging, related card). Having **both kernel and user mapped simultaneously** in every process's page table means the kernel doesn't need to **switch** page tables just to handle an ordinary system call or interrupt from that process — it's already mapped and ready. The kernel mapping being **identical across every process** specifically **eases switching between processes** (no special-casing needed for "which process's kernel view is this"). It's **easy for the kernel to read/write user memory** directly using ordinary user-supplied addresses (e.g. system-call arguments) since the user's mappings are already present. And it's **easy for the kernel to read/write arbitrary physical memory** — physical address $x$ is mapped at virtual address $x + \\text{0x80000000}$ (exactly the double-mapping mentioned above) — used, e.g., while directly manipulating page tables themselves (related card).`,
    related: ["mit6828-vm-two-level-page-table", "mit6004-vm-contexts"],
  },
  {
    id: "mit6828-vm-sbrk-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Trace the call chain from a user-level sbrk(n) call down to walkpgdir(), and explain what walkpgdir() actually does.",
    back: `**The user-facing call**: a process calls \`sbrk(n)\` to request $n$ more bytes of heap memory (\`malloc()\` itself is built on top of \`sbrk()\`) — the kernel tracks each process's current size, adds new memory at the *end* of the process's existing address range, and increases the recorded size; \`sbrk()\` allocates real physical memory (RAM), **maps** it into the process's page table, and returns the starting address of the newly-available memory.

**The kernel-side call chain**: \`sys_sbrk()\` (in \`sysproc.c\`) handles the raw system call, calling \`growproc()\` (in \`proc.c\`) — which tracks \`proc->sz\`, the process's current size, and calls **\`allocuvm()\`** to do the actual work of allocating and mapping new pages (checking, e.g., that the new size doesn't cross into kernel address space, i.e. \`newsz >= KERNBASE\`, and rounding up to a page boundary via \`PGROUNDUP\`). \`growproc()\` finally calls **\`switchuvm()\`**, which sets \`%cr3\` to (re-)install the process's page table and **flushes MMU caches** so the hardware picks up the freshly-added PTEs rather than continuing to use any stale cached translation.

**\`mappages()\` (in \`vm.c\`)** — the routine that actually installs mappings: given a page directory, a virtual address range, a physical address, and permission bits, it adds mappings from that VA range to the corresponding PA range. Since callers may pass non-page-aligned addresses, it **rounds** appropriately, then, for **each page-aligned address in the range**, calls **\`walkpgdir()\`** to find the *address* of the relevant PTE (not merely its current content — since the whole point is to **modify** it), writes the desired physical address into that PTE, and marks it valid (\`PTE_P\`).

**\`walkpgdir()\` — mimicking the hardware's own translation walk in software**: extracts the top 10 bits of the VA (\`PDX(va)\`) to index the page directory and locate the relevant **PDE**; if that PDE's \`PTE_P\` bit is already set, the corresponding page-table page already exists — its physical address is recovered via \`PTE_ADDR\` (extracting the PPN) and converted to a kernel-usable *virtual* address via \`p2v()\` (adding \`0x80000000\`, exploiting exactly the double-mapping described in the address-space-layout card); if \`PTE_P\` is **not** set, \`walkpgdir()\` itself **allocates a fresh page-table page** and fills in the PDE to point at it. Either way, it then locates the actual PTE of interest within that page-table page, at offset \`PTX(va)\` — the *second* 10 bits of the VA — and returns **its address**, ready for the caller (\`mappages()\`) to write into directly.`,
    related: ["mit6828-vm-two-level-page-table", "mit6828-vm-xv6-address-space-layout"],
  },

  // --- Lecture 5: Interrupts, exceptions ---
  {
    id: "mit6828-vm-execution-state-transitions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "List the four possible control-flow transitions between user/kernel execution, and state the key unifying fact about how interrupts, exceptions, and system calls are handled.",
    back: `**Where can the system be executing?** Along two independent axes: **user vs. kernel** mode, and — since each process has its own **user stack** and its own **kernel stack** — *which* stack is currently active.

**The four possible transitions**: **user → kernel**: triggered by a **system call**, a **device interrupt**, or an **exception** (e.g. a page fault, divide-by-zero). **kernel → user**: a **return** from whichever of those three brought execution into the kernel. **kernel → kernel**: a **context switch** (the kernel voluntarily switches from running on behalf of one process to running on behalf of another — covered in a later lecture). **kernel → kernel**: an **interrupt occurring while the kernel is already running** (a genuinely different case from an ordinary user→kernel entry, related card, since there's no user state to save in quite the same way).

**The key unifying fact**: **interrupts, exceptions, and system calls all use the exact same underlying hardware mechanism** — there is no separate "system call instruction path" distinct from "the interrupt path"; a system call is, mechanically, just one particular *kind* of interrupt/trap, using the identical \`INT\`-instruction-driven entry sequence (related card) that a timer interrupt or a page fault also uses. This unification is precisely why this course groups syscalls, interrupts, and exceptions into a single lecture, rather than treating them as three unrelated mechanisms.

**Why a per-process kernel stack, specifically** (rather than one single global kernel stack shared by all processes): if a system call used a single shared global stack, a system call from process A could be **interrupted** (by a device interrupt, or by the scheduler switching to a different process) partway through, and process B's *own* system call would then need to use that *same* stack — genuinely corrupting A's still-in-progress kernel-mode stack frame. Each process needing its **own private kernel stack** is a direct consequence of the fact that kernel-mode execution on behalf of different processes must never be allowed to collide.`,
    pitfall:
      "It's tempting to think of system calls as fundamentally different from hardware interrupts (one is 'requested' by software, the other 'happens to' the CPU) — mechanically on x86, both are entered via the exact same INT-instruction/IDT machinery, and xv6's trap() handler dispatches on the SAME trapno field regardless of whether the trap originated from a deliberate int $0x40 syscall instruction or an asynchronous device interrupt.",
    related: ["mit6828-vm-int-instruction-mechanics", "mit6828-vm-kernel-mode-interrupts"],
  },
  {
    id: "mit6828-vm-int-instruction-mechanics",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the exact steps the x86 INT instruction performs, and explain specifically why it needs to save/restore SS and ESP.",
    back: `**INT instruction steps** (essentially identical for interrupts and exceptions, not just deliberate \`int\` instructions): (1) **fetch** the relevant vector's descriptor from the **IDT** (related card). (2) If the descriptor's privilege level is **less than** the current CPL — i.e., this is a **cross-ring** transition (user → kernel) — the hardware **saves the current \`%esp\` and \`%ss\` in CPU-internal registers**, then **loads a fresh \`%ss\` and \`%esp\`** (the kernel's own per-process stack, from the **TSS** — Task State Segment) and **pushes the *old*, user-mode \`%ss\` and \`%esp\`** onto that new kernel stack. (3) Push the (old) **EFLAGS**. (4) Push the (old) **CS**. (5) Push the (old) **EIP**. (6) **Clear certain EFLAGS bits** (disabling further interrupts during the transition, among other housekeeping). (7) **Set CS and EIP** from the IDT descriptor's own segment selector and offset — actually transferring control into the kernel's designated handler entry point.

**Why does INT bother saving SS and ESP specifically?** Because entering the kernel means switching to a **completely different stack** — the kernel's own per-process kernel stack, not the interrupted user code's stack (related card on per-process kernel stacks) — and the hardware needs to remember exactly which user-mode stack (segment *and* pointer) to restore later, on the way back out, so execution can resume with the user program's stack pointer intact and undisturbed, exactly as it was at the moment of interruption.

**Why user code can't abuse \`INT\` to gain unwarranted privilege**: the resulting CPL after an \`INT\` is determined by the **IDT descriptor's own segment selector** — configured once, by the kernel, at boot time (\`tvinit()\` in \`trap.c\`) — **not** by anything the executing user instruction supplies. A user program can trigger \`INT\` (choosing *which* vector number to invoke, within the vectors it's permitted to use), but it has **no control whatsoever** over what privilege level or what code address that vector actually transfers control to — exactly the same "hardware, not user-supplied data, decides the entry point" principle already established for the CPL-switching mechanism generally (related card, Lecture 3).`,
    related: ["mit6828-vm-idt-and-vectors", "mit6828-intro-syscall-entry"],
  },
  {
    id: "mit6828-vm-idt-and-vectors",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the IDT (Interrupt Descriptor Table): what a vector number is, what each descriptor contains, and how the kernel knows why an interrupt occurred.",
    back: `**256 vectors**: x86 supports 256 distinct interrupt/exception "vectors," covering everything from CPU-generated exceptions (divide-by-zero, page fault) to device interrupts (timer, disk, console) to software-triggered system calls (xv6 uses vector \`0x40\` for its \`int $0x40\` system call convention).

**How the kernel identifies why an interrupt occurred**: simply by looking at **which vector number** was invoked — the vector number *is* the classification.

**The IDT (Interrupt Descriptor Table)**: a vector number is an **index into a descriptor in the IDT**. The **IDTR** register holds the IDT's base address in memory. Each IDT **descriptor** contains a **segment selector** and an **offset within that segment** — together specifying exactly where to jump. For xv6 specifically, every descriptor's segment selector is set to the same fixed value, \`SEG_KCODE\` (the kernel's code segment); the *offset* is simply the address of that vector's specific handler function.

**Why the IDT's segment selector — not the interrupting code's own CPL — is what determines the resulting privilege level**: since \`SEG_KCODE\`'s own descriptor is configured (once, by the kernel, at boot) to run at CPL=0, **any** \`INT\` that dispatches through an IDT entry pointing at \`SEG_KCODE\` unconditionally ends up executing at full kernel privilege — regardless of what CPL the calling code happened to be running at beforehand. This is precisely the mechanism (established more generally in Lecture 3, related card) that makes it safe for arbitrary, untrusted user code to trigger \`INT\`: the *destination* privilege is baked into the kernel-configured IDT entry itself, never influenced by anything the calling (potentially malicious) user code supplies.`,
    related: ["mit6828-vm-int-instruction-mechanics", "mit6828-vm-trapframe"],
  },
  {
    id: "mit6828-vm-trapframe",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Enumerate what ends up on the kernel stack after a trap (the xv6 'trapframe'), distinguishing what the hardware pushes, what the vector stub pushes, and what the shared alltraps code pushes.",
    back: `After a full trap sequence, xv6's kernel stack holds a **trapframe** — a fixed layout of saved state, assembled in **three distinct stages** by three different actors:

**Pushed by hardware itself** (as part of the raw \`INT\` mechanics, related card): \`ss\`, \`esp\` (the interrupted code's user stack pointer/segment — only pushed on an actual cross-ring transition, related card), \`eflags\`, \`cs\`, \`eip\` — and, for certain exceptions, a hardware-supplied **error code**.

**Pushed by the per-vector stub** (\`vectors.S\`, one small generated stub per vector number): just the **\`trapno\`** — the vector number itself — so that shared downstream handling code knows *which* vector actually fired, without needing 256 separate full-blown handler bodies.

**Pushed by the shared \`alltraps\` code** (\`trapasm.S\`) that every vector stub jumps to next, after pushing its own \`trapno\`: the segment registers \`ds\`, \`es\`, \`fs\`, \`gs\`, followed by the **general-purpose registers** \`eax\`, \`ecx\`, \`edx\`, \`ebx\`, (the stale) \`esp\`, \`ebp\`, \`esi\`, \`edi\` (matching \`struct trapframe\` in \`x86.h\`) — completing a full snapshot of the interrupted code's machine state.

**Why split the work this way — a tiny per-vector stub, then one shared handler**: rather than have each of the 256 possible vectors independently duplicate the entire save-all-registers sequence, only the **one** piece of information that's genuinely vector-*specific* (the \`trapno\`) is pushed by the small per-vector stub; everything else is common, shared code (\`alltraps\`) run once regardless of which vector fired — avoiding 256-fold duplication of identical register-saving logic. \`alltraps\` finally calls the C function \`trap(struct trapframe *tf)\`, passing the address of this now-fully-assembled trapframe (conveniently, since \`alltraps\` pushed \`%esp\` last, \`%esp\` itself already points at the trapframe's start — exactly the pointer \`trap()\` needs as its argument).`,
    related: ["mit6828-vm-idt-and-vectors", "mit6828-vm-syscall-handling"],
  },
  {
    id: "mit6828-vm-syscall-handling",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Trace how trap() dispatches a system call to syscall(), and how syscall() locates both the system-call number and its arguments.",
    back: `**Dispatch**: \`trap()\` checks the trapframe's \`trapno\` field; if it equals \`T_SYSCALL\` (\`0x40\`), \`trap()\` calls \`syscall()\`.

**Finding the system-call number**: \`syscall()\` reads it from **\`tf->eax\`** — this works because of a convention established entirely at the **user-level C library** call site: e.g. the user-level \`sbrk()\` wrapper, before executing \`int $0x40\`, first does \`mov $0xc, %eax\` (\`0xc\` = 12 = \`SYS_sbrk\`) — placing the desired system-call number in \`%eax\` *before* trapping, so that once the hardware has finished pushing everything into the trapframe (related card), that same value is sitting right there in \`tf->eax\` for the kernel to read back out.

**Finding the system-call's arguments**: since the syscall interface passes only integers/strings/user-buffers, never rich objects (this course's own earlier design-philosophy discussion, related concept from Lecture 3), arguments are fetched directly off the **user's stack** — e.g. \`sys_sbrk()\` calls \`argint()\`, which locates the requested argument via \`tf->esp\` (the saved user stack pointer, itself part of the trapframe) — exactly where the user-level C calling convention (this course's own Lecture 2 material, related card) placed them before the trapping instruction executed, since a system call, syntactically, still looks like an ordinary function call from the user program's point of view, just one that happens to trap into the kernel partway through.

**Returning a result**: \`syscall()\` places the return value of the specific handler (e.g. \`sys_sbrk()\`'s result) directly into **\`tf->eax\`** — meaning that once the trapframe is eventually restored and control returns to user code (related card), \`%eax\` will hold exactly the value the user-level wrapper function expects as its own return value, completing the illusion that \`sbrk()\` behaves like an ordinary C function call throughout.

**The return path**: \`syscall()\` returns to \`trap()\`, which returns to \`alltraps\` (\`trapasm.S\`) — the reverse of the entry sequence: popping the general registers, popping the segment registers, popping the hardware-pushed \`trapno\`/error code, and finally executing \`iret\` (the counterpart to \`INT\`) to restore \`eip\`/\`cs\`/\`eflags\`/\`esp\`/\`ss\` all at once and resume user execution.`,
    related: ["mit6828-vm-trapframe", "mit6828-intro-syscall-interface-design"],
  },
  {
    id: "mit6828-vm-kernel-mode-interrupts",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a trap that occurs while the kernel is already running differ structurally from an ordinary user-to-kernel trap, and how can code tell the two cases apart?",
    back: `**The scenario**: faults, interrupts, and other traps **can occur while the kernel itself is already running** (e.g. a device interrupt firing while the kernel is midway through handling a system call) — this is the "kernel → kernel" transition case (related card).

**What's genuinely different about this case**: the "old" CPL and the "new" CPL are the **same** (both already 0, kernel mode) — so this is **not** a cross-ring transition. Consequently, per the INT mechanics (related card), the hardware does **not** switch stacks (there's no reason to — the kernel is already running on its own proper kernel stack) and does **not** push the old \`esp\`/\`ss\` (since it never switched away from them in the first place) — meaning the resulting **trapframe has a different shape** than the ordinary user→kernel case: it's simply missing the \`ss\`/\`esp\` entries that a cross-ring trap would have included.

**How to tell the two cases apart in code**: examine the **old CPL**, recoverable from the **low bits of \`tf->cs\`** (the saved code-segment register reflects whatever privilege level was active *before* the trap — since \`cs\`'s low bits directly encode CPL, related Lecture 3 card) — a value of 0 there indicates the trap interrupted kernel code already in kernel mode (this shorter trapframe shape); a value of 3 indicates an ordinary user→kernel entry (the full trapframe shape, related card). Any code that generically processes trapframes (rather than assuming one fixed shape) must check this distinction explicitly rather than assuming every trap looks identical.`,
    pitfall:
      "Code that blindly assumes every trapframe has the full ss/esp fields (as in an ordinary user->kernel trap) will misinterpret a kernel-mode-interrupt trapframe, since those fields simply aren't present when old CPL == new CPL — always check the saved CPL (low bits of tf->cs) before assuming a particular trapframe layout.",
    related: ["mit6828-vm-execution-state-transitions", "mit6828-vm-int-instruction-mechanics"],
  },
  {
    id: "mit6828-vm-fork-kernel-stack-setup",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does fork() construct a brand-new child process's kernel stack from scratch, including the role of allocproc(), the copied trapframe, and context->eip = forkret?",
    back: `**The problem \`fork()\` faces**: a process's kernel stack is normally only ever built up *incrementally*, one trap/call at a time, as that process actually runs and enters/exits the kernel. But a **brand-new child process** created by \`fork()\` has never run at all — its kernel stack must be **constructed synthetically**, from nothing, so that when the scheduler eventually picks it to run for the very first time, it can be resumed exactly as if it were an ordinary, already-in-progress kernel-mode execution.

**What needs to be set up**: both the child's **user-visible state** (user stack, registers, EIP — where it should resume in *user* code) and its **kernel-visible state** (kernel stack, registers, EIP — where the *kernel* itself should resume executing on the child's behalf) — tracked in each process's \`struct proc\` (\`proc.h\`), which must be fully initialized for the new child.

**\`allocproc()\`**: allocates the child's kernel stack, and deliberately carves out two regions at the top of that freshly-allocated stack: **space for a trapframe**, and **space for a \`context\`** (a smaller, separate saved-register set used specifically by the context-switch mechanism, covered in a later lecture) — setting the trapframe's stack-pointer-to-be (\`*sp = trapret\`, the address of the code that will eventually restore the trapframe and return to user mode) and, critically, setting **\`context->eip = forkret\`**.

**\`fork()\` itself**: calls \`copyuvm()\` to copy the parent's *user* memory (stack, instructions, heap) into freshly-allocated physical pages for the child (establishing the child's own, independent address space — not sharing the parent's). Then \`*np->tf = *proc->tf\` — the child's **trapframe is copied directly from the parent's own current trapframe** — meaning the child, once resumed, will land at *exactly* the same user-mode instruction the parent was at when it called \`fork()\`, with the same register values... **except** \`np->tf->eax = 0\` is explicitly set — this single field is what makes \`fork()\`'s return value **differ** between parent and child (recall from Lecture 1, related card: \`fork()\` "returns twice, with different values" — the parent's own trapframe still holds the child's real PID as its return value via the ordinary system-call return path, while the child's copied-and-modified trapframe is hard-coded to return 0).

**Why \`context->eip = forkret\`**: the **first** time this brand-new kernel stack is ever switched *to* by the scheduler, there's no genuine "resume a previously-suspended kernel computation" to do (since the child never ran before) — \`forkret\` is a small stub function specifically designed to be the very first code a freshly-\`fork()\`ed process's kernel-mode execution ever runs, after which it falls through into the ordinary trap-return path (\`trapret\`, using the pre-populated trapframe) to actually resume in **user** mode at the copied EIP — bootstrapping a kernel stack that was built entirely by \`fork()\` itself into looking, from the scheduler's perspective, exactly like any other process's kernel stack that's merely being resumed after a context switch.`,
    related: ["mit6828-vm-trapframe", "mit6828-intro-os-fork-exec-split"],
  },
];
