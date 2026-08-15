// MIT 6.828 (Fall 2012) — Lectures 1-3: an OS-overview case study of the
// Unix shell (fork/exec, file descriptors, pipes), x86/PC architecture
// fundamentals (registers, I/O, segmentation, the physical memory map, gcc
// calling conventions, and how a software PC emulator like Bochs works),
// and OS organization (why have an OS at all, monolithic vs. microkernel
// design, and the four mechanisms — CPL, address spaces, preemptive
// context switching, and a deliberately narrow syscall interface — that
// together enforce process isolation). This is 6.828's own from-scratch
// treatment of many mechanisms MIT 6.004 introduced at the hardware level
// (Modules 5-6); cross-linked via `related` rather than duplicated where
// the overlap is substantial. See src/data/courses.ts for the lecture map.
import type { Card } from "./types";

const MODULE = "mit6828-intro";

export const mit6828IntroX86IsolationCards: Card[] = [
  // --- Lecture 1: O/S overview (case study: the shell) ---
  {
    id: "mit6828-intro-os-goals-and-abstraction",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What do applications want from an OS (the four goals), and contrast the 'small view' vs. 'big view' of what an OS actually is?",
    back: `**What applications want from an OS**: (1) **abstract the hardware** for convenience and portability (programs shouldn't need to know the exact disk controller or network card model); (2) **multiplex the hardware** among multiple applications (many programs sharing one CPU, one disk, one network link); (3) **isolate applications** to contain bugs (one program's crash or misbehavior shouldn't corrupt another's data or the system itself); (4) **allow sharing** among applications (deliberately, when programs *do* want to communicate or share resources).

**The small view**: an OS is simply a **hardware-management library** — a collection of routines applications link against or call into, handling the fiddly, device-specific details of talking to real hardware.

**The big view**: an OS transforms the **physical machine** into an **abstract machine with better properties** — hiding raw hardware quirks and limitations (a fixed amount of physical memory, one CPU, unreliable devices) behind a cleaner abstraction (seemingly-private virtual memory per process, apparent per-process CPUs via scheduling, well-defined file/socket interfaces) that's easier and safer to program against.

**Layered organization**: hardware (CPU, memory, disk) at the bottom; the **kernel** (providing services: processes, memory, file contents, directories/file names, security, and more — users, IPC, network, time, terminals) in the middle; user-level **applications** (e.g. \`vi\`, \`gcc\`) on top, which only ever see the kernel's abstractions via **system calls** — never raw hardware directly. The course's stated focus throughout: caring a lot about *interfaces* and *internal kernel structure*, not just what services exist.`,
    related: ["mit6828-intro-isolation-why-have-os"],
  },
  {
    id: "mit6828-intro-os-fork-exec-split",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Precisely what do fork() and exec() each do, and why does splitting process creation into these two separate calls — which looks wasteful — turn out to be useful?",
    back: `**\`fork()\`**: copies the calling process's user memory, and copies (most of) its kernel process state (e.g. user id, current working directory) into a **new** child process, which gets a **different PID**. Crucially, \`fork()\` **returns twice** — once in the parent (returning the child's PID) and once in the child (returning 0) — both processes resume executing from the exact same point in the code, now with different return values to distinguish which one they are.

**\`exec()\`**: **replaces** the memory of the *current* process with instructions/data loaded from a file (created by the compiler/linker) — but it is **still the same process** underneath: it keeps most of the process's existing kernel state (user id, open file descriptors, current working directory, PID) — only the *program* actually running changes, not the process's identity or its already-established environment.

**Why the fork/exec split, rather than one combined "create and run a new program" call, looks wasteful but is actually useful**: because they're **separate** calls, a shell (or any parent) gets a window **between** \`fork()\` and \`exec()\` to modify the child's environment *before* the new program starts running — e.g. redirecting file descriptors (implementing \`ls > out\`), setting up a pipe's ends (implementing \`cmd1 | cmd2\`), or changing the current directory — all using the *same*, already-existing kernel state–modification system calls (\`open\`, \`close\`, \`chdir\`, ...), rather than needing a single, enormously parameterized "create and configure and run a new program in one step" call that would have to anticipate every possible thing a caller might want to do first.`,
    related: ["mit6828-intro-file-descriptors", "mit6828-intro-pipes"],
  },
  {
    id: "mit6828-intro-file-descriptors",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Explain file descriptor numbering conventions (0/1/2), how FDs behave across fork vs. exec, and why this design makes programs more general-purpose.",
    back: `**What a file descriptor is**: I/O in Unix happens through per-process **file descriptors**, numbered starting from 0 — concretely, an **index into a table stored in the process's kernel state**. System calls \`open\`, \`read\`, \`write\`, \`close\` all operate on these small integers.

**Numbering conventions** (not enforced by the kernel, but universally followed): **fd 0** for input (e.g. the keyboard) — \`fgets(stdin)\` internally invokes \`read(0, buf, bufsize)\`. **fd 1** for output (e.g. the terminal) — \`fprintf(stdout)\` internally invokes \`write(1, "hello\\n", strlen("hello\\n"))\`. **fd 2** for error output (also typically the terminal).

**Behavior across fork vs. exec**: on **\`fork()\`**, the child **inherits** all of the parent's currently-open file descriptors (they refer to the exact same underlying open files/pipes as the parent's). On **\`exec()\`**, the process **retains** its file descriptors unchanged (only the running program's code/data image is replaced, per the fork/exec split, related card) — this is *exactly* what lets a shell implement \`ls > out\`: fork a child, have the child \`close\`/\`open\`(redirect) fd 1 to point at the file \`out\` **before** calling \`exec("ls")\` — \`ls\` itself is completely unaware it's writing to a file rather than a terminal, since it just unconditionally writes to fd 1 as always.

**Why this makes programs general-purpose**: commands like \`ls\` never need special-case logic for "am I writing to a file, a terminal, or a pipe?" — they simply use fd 0/1/2 by default, and it's the **caller's** responsibility (typically the shell, via fork+exec) to have already arranged what those numbers actually point to before the program starts. The tradeoff this design makes: shell pipelines therefore only genuinely work well for programs that speak a common, simple format (lines of text) over these numbered streams — anything requiring a richer, structured interface needs a different IPC mechanism.`,
    related: ["mit6828-intro-os-fork-exec-split", "mit6828-intro-pipes"],
  },
  {
    id: "mit6828-intro-pipes",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe a pipe as a one-way IPC channel, and explain how the shell uses fork, pipe, and file-descriptor manipulation to implement a pipeline like 'cmd1 | cmd2'.",
    back: `**A pipe** is a **one-way communication channel**: \`pipe(fds)\` creates a pair of file descriptors, \`fds[0]\` (the read end) and \`fds[1]\` (the write end) — bytes written to \`fds[1]\` become readable from \`fds[0]\`, in order, like a small in-kernel FIFO buffer. Since file descriptors are **inherited across \`fork()\`** (related card), a parent and its child can share the two ends of one pipe and use it to communicate, even though they're now separate processes with separate memory.

**Implementing \`cmd1 | cmd2\` (arranging that cmd1's output becomes cmd2's input)**: the shell creates a **process for each command** in the pipeline, and **manipulates their file descriptors** so that cmd1's stdout (fd 1) and cmd2's stdin (fd 0) are both connected to the *same* pipe — cmd1's process closes its normal fd 1 and duplicates the pipe's write end into that slot (then closes the now-redundant original pipe fd), and symmetrically cmd2's process wires the pipe's read end into fd 0 — all done in the window between \`fork()\` and \`exec()\` (related card), so neither \`cmd1\` nor \`cmd2\`'s own code needs any awareness that it's part of a pipeline at all. The shell then **waits** for the *last* process in the pipeline to exit before considering the whole pipeline command complete.

**Why close the unused read-end and write-end explicitly**: this ensures every process starts with exactly the 3 conventional file descriptors it expects (not extra, dangling pipe ends left open by mistake), and — critically — ensures that **reading from the pipe correctly returns end-of-file** once the writing command exits: a pipe's read end only sees EOF once **every** copy of its write end (across all processes that inherited it) has been closed; an accidentally-still-open extra copy of the write end (e.g. left open in the shell process itself) would cause the reading command to hang forever waiting for more input that will never come.`,
    pitfall:
      "Forgetting to close the shell's own copy of the pipe's write-end (after duplicating it into the child's fd 1) is a classic bug: since a pipe's read side only reports EOF once ALL copies of the write side are closed, that one leftover open descriptor in the shell process itself is enough to make the reading command block forever, even after the writing command has genuinely finished and exited.",
    related: ["mit6828-intro-file-descriptors", "mit6828-intro-os-fork-exec-split"],
  },

  // --- Lecture 2: x86 and PC architecture ---
  {
    id: "mit6828-intro-x86-registers-and-io",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "List the original 8086's register set, and contrast dedicated I/O space with memory-mapped I/O — including why MMIO doesn't 'behave' like ordinary memory.",
    back: `**8086 registers** (1978, 16-bit): four 16-bit **data registers** — AX, BX, CX, DX — each further splittable into two 8-bit halves (e.g. AH/AL), very fast and very few. **Address registers** (pointers into memory): **SP** (stack pointer), **BP** (frame base pointer), **SI** (source index), **DI** (destination index). **IP** (instruction pointer — what other architectures, e.g. this course's own earlier work with the Beta, call the PC), incremented after each instruction, modifiable by \`CALL\`/\`RET\`/\`JMP\`/conditional jumps. **FLAGS** — condition codes tracking, e.g., whether the last arithmetic operation overflowed, was positive/negative, was [not] zero, had a carry/borrow, plus whether interrupts are currently enabled and the direction of data-copy instructions.

**Dedicated I/O space**: the *original* PC architecture approach — device registers live in a **separate** address space from memory (only 1024 I/O addresses), accessed only via special **\`IN\`**/**\`OUT\`** instructions (e.g. writing a byte to a line printer by polling a status port for "not busy," then writing the data port, then strobing a control port). This keeps device access syntactically distinct from ordinary memory access, at the cost of needing dedicated instructions and a separate, small address space.

**Memory-mapped I/O (MMIO)**: devices are instead accessed through **normal physical memory addresses** — no special instructions needed, and no limited-size dedicated I/O space; a system controller simply routes accesses in certain address ranges to the appropriate device rather than to RAM. The catch: this "magic" memory is *addressed and accessed* like memory, but does **not behave** like memory — reads and writes can have arbitrary **side effects** (e.g. writing a command register that triggers a disk seek), and read *results* can change due to **external events** (e.g. a status register reflecting the device's current state, not a value the CPU itself ever wrote) — genuinely violating the "memory just stores whatever was last written" intuition ordinary RAM satisfies.`,
    related: ["mit6828-intro-x86-physical-memory-map"],
  },
  {
    id: "mit6828-intro-x86-segmentation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How did 8086 segmentation extend a 16-bit machine to address 1MB of memory, and what changed with the 80386's move to 32-bit mode?",
    back: `**The problem**: the 8086's registers and immediate addresses are only 16 bits wide (max 64KB directly addressable) — "painfully small" even by the standards of the time — but the 8086 actually has **20-bit physical addresses**, allowing up to 1MB of RAM.

**The 8086 solution — segmentation**: the extra 4 address bits come from a 16-bit **segment register**, combined with a 16-bit offset: $pa = va + seg \\times 16$. Four segment registers each serve a conventional purpose: **CS** (code segment, used for instruction fetches via IP), **SS** (stack segment, for load/store via SP and BP), **DS** (data segment, for load/store via other registers), **ES** (another data segment, used as the destination for string operations). E.g. setting $CS = 4096$ makes execution begin at physical address $4096\\times16 = 65536$.

**Two genuine pitfalls this introduces**: (1) you **can't use the plain 16-bit address of a stack variable as a general pointer** — a 16-bit offset alone is ambiguous without knowing which segment it's relative to; a **far pointer** (a full segment:offset pair, 16+16 bits) is needed for a pointer that must remain meaningful regardless of the current segment-register values. (2) **pointer arithmetic and array indexing become tricky across segment boundaries** — incrementing an offset far enough can silently wrap within its segment rather than smoothly continuing into the "next" memory, since segments don't compose the way a flat address space would.

**The 80386 (1985) — genuine 32-bit extension**: added support for 32-bit data and addresses. The chip **boots in 16-bit mode** (for backward compatibility) and switches to 32-bit mode via \`boot.S\`; registers become 32 bits wide (called **EAX** rather than AX); operands and addresses that were 16-bit become 32-bit by default in 32-bit mode (e.g. \`ADD\` now does 32-bit arithmetic); special **prefix bytes** (\`0x66\`/\`0x67\`) toggle *back* to 16-bit operands/addresses when needed for compatibility (so a 32-bit-mode assembler emits \`0x66\` in front of, e.g., a 16-bit \`MOVW\`). The 80386 **also** changed how segments work and added **paged memory** — the beginning of the paging-based virtual memory mechanism xv6 (and this course generally) actually relies on, rather than the older segmentation scheme.`,
    pitfall:
      "8086 segmentation and 80386 paging are two DIFFERENT memory-translation mechanisms from two different eras of the same instruction-set family — xv6 and modern x86 kernels use paging (32-bit addresses translated via page tables) for virtual memory, not segmentation; segmentation is largely legacy/compatibility machinery by the time 32-bit protected mode is in use.",
    related: ["mit6828-intro-x86-registers-and-io", "mit6828-intro-address-space-isolation"],
  },
  {
    id: "mit6828-intro-x86-physical-memory-map",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the x86 physical memory map's layout (low memory, VGA, BIOS ROM, extended memory), and explain why the reset vector sits at the very top of the address space.",
    back: `**The general shape**: the x86 physical address space mostly looks like ordinary RAM — but certain address ranges actually refer to entirely different things. From low to high addresses: **Low Memory** (starting at \`0x00000000\`) — ordinary RAM, historically used by real-mode BIOS/DOS-era code. **VGA Display** memory (from \`0x000A0000\`) — writes here appear directly on the screen. **16-bit devices, expansion ROMs** (from \`0x000C0000\`). **BIOS ROM** (from \`0x000F0000\`) — the firmware that runs at power-on. **Extended Memory** (from \`0x00100000\`, i.e. 1MB) — the bulk of ordinary usable RAM on a modern machine, size depending on how much RAM is actually installed. **Unused** space above that. **32-bit memory-mapped devices** (related card) occupying a region near the very top. Finally, address \`0xFFFFFFFF\` (4GB) — the very top of the 32-bit address space.

**Why the reset vector sits at the top**: on reset or power-on, the CPU **jumps to ROM at address \`0xFFFFFFF0\`** — deliberately placed at the very top of the address space, specifically so that ROM (which must contain the very first code the CPU ever executes, before any RAM has been initialized or any software has configured anything) can be **permanently, unconditionally mapped there** regardless of how much RAM is actually installed or how the rest of the address space gets configured later — the one fixed point of certainty a bare-metal boot process can rely on before any software-controlled memory mapping exists yet.`,
    related: ["mit6828-intro-x86-registers-and-io", "mit6828-intro-pc-emulation"],
  },
  {
    id: "mit6828-intro-x86-syntax-addressing",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare Intel and AT&T x86 assembly syntax, and list the five addressing modes shown in the AT&T examples.",
    back: `**Two syntax conventions for the same instruction set**: **Intel syntax** (\`op dst, src\` — destination first) is used by Intel's own manuals. **AT&T syntax** (\`op src, dst\` — source first) is used by GCC/GAS and this course's own labs/xv6 codebase — and additionally uses a **b/w/l suffix** on instruction mnemonics to explicitly specify operand size (byte/word/long).

**Addressing modes, worked via AT&T examples** (with "C"-ish equivalents): \`movl %eax, %edx\` → \`edx = eax;\` — **register mode** (both operands are registers). \`movl $0x123, %edx\` → \`edx = 0x123;\` — **immediate** (a literal constant, marked with \`$\`). \`movl 0x123, %edx\` → \`edx = *(int32_t*)0x123;\` — **direct** (the operand names a literal memory *address* to dereference). \`movl (%ebx), %edx\` → \`edx = *(int32_t*)ebx;\` — **indirect** (dereference through a register holding an address, i.e. a pointer). \`movl 4(%ebx), %edx\` → \`edx = *(int32_t*)(ebx+4);\` — **displaced** (dereference a register plus a constant offset — the same displacement-addressing idea seen in this course's earlier Beta ISA material, just now on x86).

**Operands generally**: registers, constants, memory-via-register, or memory-via-constant — the same small handful of addressing building blocks recombine to express every instruction's operands.`,
    related: ["mit6828-intro-gcc-calling-convention"],
  },
  {
    id: "mit6828-intro-gcc-calling-convention",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe GCC's x86 calling convention: the caller/callee contract at function entry and after return, the stack-frame layout, and caller-save vs. callee-save registers.",
    back: `**x86 dictates the stack grows down** — \`pushl %eax\` is \`subl $4,%esp; movl %eax,(%esp)\`; \`popl %eax\` is \`movl (%esp),%eax; addl $4,%esp\`; \`call ADDR\` is (conceptually) \`pushl %eip; movl $ADDR,%eip\`; \`ret\` is \`popl %eip\` — none of these expansions are real individual instructions, but they show precisely what the real \`call\`/\`ret\` instructions accomplish in terms of simpler operations.

**The caller/callee contract, by convention (GCC dictates how the stack is actually used)**: **at entry to a function** (just after \`call\`): \`%eip\` points at the function's first instruction; \`%esp+4\` points at the *first* argument; \`%esp\` itself points at the **return address**. **After the \`ret\` instruction**: \`%eip\` contains the return address; \`%esp\` points at whatever arguments the caller originally pushed; the called function **may have trashed its arguments**; \`%eax\` (and \`%edx\`, for 64-bit return types) holds the **return value** (or garbage, if the function is \`void\`); \`%eax\`, \`%edx\`, and \`%ecx\` may be trashed — these are the "**caller-save**" registers; \`%ebp\`, \`%ebx\`, \`%esi\`, \`%edi\` **must** still contain whatever they held at the time of the \`call\` — these are the "**callee-save**" registers (a called function that wants to use one of them must save and restore it itself).

**GCC's stack-frame convention** (functions can do anything that doesn't violate the contract above; GCC does more, by its own convention): each function marks its frame with \`%ebp\` (frame base) and \`%esp\` (current top) — arguments sit *above* the saved return address and saved \`%ebp\` (at positive offsets from \`%ebp\`), locals sit *below* them (negative offsets). **Function prologue**: \`pushl %ebp; movl %esp, %ebp\` (equivalently the single instruction \`enter $0,$0\`, though \`enter\` is rarely used in practice — 4 bytes versus 3 for the two-instruction form, and it isn't on the hardware's fast path anymore). **Function epilogue**: \`movl %ebp, %esp; popl %ebp\` (equivalently the single-byte \`leave\`, which **is** commonly used, precisely because 1 byte beats 3).

**Worked example**: \`int main(void) { return f(8)+1; } int f(int x) { return g(x); } int g(int x) { return x+3; }\` compiles to three near-identical prologue/body/epilogue blocks, each pushing its argument(s), \`call\`ing the next function, and cleaning up — and \`g\`, having no need to preserve any callee-save register, compiles down to a strikingly minimal \`movl 4(%esp),%eax; addl $3,%eax; ret\` with no frame setup at all — a concrete illustration that the full prologue/epilogue convention is exactly that, a **convention**, not a hard requirement every function must follow when it doesn't actually need a stack frame.`,
    related: ["mit6828-intro-x86-syntax-addressing"],
  },
  {
    id: "mit6828-intro-pc-emulation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does a software PC emulator like Bochs represent CPU/memory state and execute instructions, and how does it simulate I/O devices?",
    back: `**The core idea**: an emulator (e.g. **Bochs**) does exactly what a real PC would do, just implemented entirely in **software** rather than hardware — it runs as an ordinary process inside a **host** operating system (e.g. Linux), using that host process's own normal memory to represent the *emulated* machine's hardware state.

**Representing emulated state in host memory**: emulated CPU registers are just **global variables** in the emulator's own process (e.g. \`int32_t regs[8]; #define REG_EAX 1; ... int32_t eip; int16_t segregs[4];\`). Emulated **physical memory** is just a big host-process array (e.g. \`char mem[256*1024*1024];\` for 256MB of emulated RAM).

**Executing instructions — a software fetch/decode/execute loop**: \`for (;;) { read_instruction(); switch (decode_instruction_opcode()) { case OPCODE_ADD: ...; regs[dst] = regs[dst] + regs[src]; break; case OPCODE_SUB: ...; break; ... } eip += instruction_length; }\` — mirroring, entirely in software, the exact same fetch/decode/execute discipline a real hardware CPU implements directly in silicon (this course's own earlier hardware-architecture material, e.g. the Beta's fetch/execute loop).

**Simulating the physical memory map** (related card): \`read_byte\`/\`write_byte\` functions decode the emulated "physical" address exactly the way real PC hardware would — checking whether the address falls in low memory, the BIOS ROM range, extended memory, etc., and routing the access to the appropriate underlying host-array or special-cased behavior (e.g. silently ignoring writes to ROM, since real ROM can't be written).

**Simulating I/O devices**: detect accesses to "special" memory or I/O-space addresses (related card on dedicated I/O space vs. MMIO) and emulate the *correct resulting behavior*, translated into equivalent operations on the host system — e.g. reads/writes to an emulated hard disk become reads/writes of an ordinary **file** on the host filesystem; writes to emulated VGA display hardware become drawing operations into a host **X window**; reads from an emulated PC keyboard become reads from the host's **X input event queue**. The whole emulator is, in effect, a very literal, very complete implementation of "pretend to be the hardware," entirely in ordinary host-process C code.`,
    related: ["mit6828-intro-x86-physical-memory-map"],
  },

  // --- Lecture 3: O/S organization, processes, isolation ---
  {
    id: "mit6828-intro-isolation-why-have-os",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why have an OS at all instead of just a library, and what three key requirements (multiplexing, isolation, interaction) does supporting multiple activities impose?",
    back: `**Why not just a library?** If the "OS" were merely a library, applications would be **free to use it, or not** — nothing would actually force multiple programs to cooperate or share the machine safely. Some genuinely tiny OSes for embedded processors *do* work this way (a single trusted program, linked against helper routines, with no real isolation needed since there's only ever one application). But that model breaks down the moment a machine needs to run **multiple, mutually-untrusting activities**.

**Key requirement: support multiple activities**, which breaks down into three distinct needs: **multiplexing** (sharing one CPU, one set of devices, among many programs over time); **isolation** (preventing one activity from wrecking or spying on another, or on the OS itself); **interaction** (letting activities that *do* want to communicate or share do so safely, deliberately, and through defined channels).

**A helpful general approach**: abstract **services**, rather than exposing raw hardware directly — a **file system**, not a raw disk; **TCP**, not a raw Ethernet link; **processes**, not raw CPU/memory. Abstractions like these tend to **simultaneously** ease multiplexing (many files can share one disk), ease isolation (one process's file access doesn't expose another's), and ease interaction (a well-defined file or socket interface is a natural, safe sharing point) — while also being more convenient and portable for applications to program against than raw hardware ever could be.

**A caveat on scope**: this course mostly focuses on **mainstream** designs (xv6, Linux, and similar traditional Unix-family kernels) — for essentially *every* design question raised, some real system has made a genuinely different choice (the **exokernel** and certain **VMM** designs, for instance, deliberately abstract almost *nothing*, exposing hardware resources far more directly and pushing abstraction-building work up into user-level libraries instead).`,
    related: ["mit6828-intro-os-goals-and-abstraction", "mit6828-intro-monolithic-vs-microkernel"],
  },
  {
    id: "mit6828-intro-monolithic-vs-microkernel",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Describe xv6/Linux's monolithic kernel organization, its tradeoffs, and the alternative (microkernel/exokernel) approach of pushing functionality to user level.",
    back: `**xv6's user/kernel organization**: hardware at the bottom, a **kernel** in the middle, **user** applications on top. The kernel is a **single big program** providing both high-level *services* (process management, the file system, networking) and low-level *mechanisms* (device drivers, virtual memory) — critically, **all of the kernel runs with full hardware privilege**, which is very *convenient* (any part of the kernel can directly touch any hardware resource or any other kernel data structure with no extra ceremony) but has a real cost.

**The tradeoff, stated directly**: **good** — it's easy for kernel sub-systems to cooperate closely (e.g. the paging system and the file system can share data structures and call each other directly, no formal interface needed between them). **Bad** — those same easy interactions make the kernel's internals genuinely **complex**, and bugs are correspondingly easy to introduce, since **there is no isolation *within* the OS itself** — a bug in the file-system code can corrupt memory belonging to the scheduler, with nothing structurally preventing it. This organization is called "**monolithic**" — traditional, and (by any measure of real-world adoption) hugely **successful**, despite these internal-isolation costs.

**Worth asking: what actually *has* to be in the kernel?** E.g., could the file system instead be a **user-level library**, rather than kernel code? xv6/Linux say no (it's baked into the kernel) — but this is a genuine, non-obvious design choice, not a law of nature. **Alternative designs**: you could instead build a genuinely **small** kernel, with most functionality (file systems, device drivers, even parts of networking) pushed out to **user level**, communicating with the tiny trusted kernel core (and each other) via well-defined, isolated interfaces — this is the **microkernel** philosophy. The **exokernel** approach (mentioned as a specific alternative the course itself is loosely inspired by for its own JOS lab kernel) goes further still: expose hardware resources about as directly as possible, abstracting almost nothing, and let user-level libraries build whatever abstractions individual applications actually want.`,
    related: ["mit6828-intro-isolation-why-have-os", "mit6828-intro-isolation-mechanisms"],
  },
  {
    id: "mit6828-intro-isolation-mechanisms",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is isolation described as 'the most constraining consideration' in OS design, and what four mechanisms together enforce it?",
    back: `**Why isolation is so central**: it's described as **the most constraining consideration** in overall OS design — isolation requirements determine much of a kernel's basic structure, and are, in large part, *the very reason* the notion of a "process" needs to exist at all (rather than, say, every program simply running as ordinary code sharing one address space). Isolation concerns recur constantly throughout the rest of the course's material.

**What "isolation" means, precisely**: the **process** is the fundamental **unit of isolation**. Two distinct goals: (1) prevent process $X$ from **wrecking or spying on** process $Y$ — covering memory, CPU time, file descriptors, and general resource exhaustion. (2) prevent **any** process from wrecking the **operating system itself** — i.e., from defeating the kernel's own ability to keep enforcing isolation in the first place — and this must hold even **in the face of bugs or deliberate malice**, e.g. a hostile process might specifically try to trick the hardware or the kernel into misbehaving, not merely misbehave accidentally.

**The four mechanisms that, together, keep processes isolated** (each gets its own detailed treatment, related cards): the **user/kernel mode flag** (a hardware privilege bit distinguishing trusted kernel code from untrusted user code); **address spaces** (each process's own private view of memory, via paging hardware); **timeslicing** (preemptive scheduling, so no process can simply hog the CPU forever); and the **system call interface** itself (the narrow, deliberately-limited channel through which user code can ever ask the kernel to do anything on its behalf).`,
    related: ["mit6828-intro-cpl-mechanism", "mit6828-intro-address-space-isolation", "mit6828-intro-preemptive-context-switch", "mit6828-intro-syscall-interface-design"],
  },
  {
    id: "mit6828-intro-cpl-mechanism",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the x86 CPL (Current Privilege Level) mechanism, what it protects, and why it alone is not sufficient for process isolation.",
    back: `**The foundation of xv6's isolation — a user/kernel mode flag**: on x86, this is called **CPL** (Current Privilege Level), stored in the bottom two bits of the \`%cs\` (code segment) register. \`CPL=0\` means **kernel mode** — fully privileged. \`CPL=3\` means **user mode** — no special privilege. (Every serious microprocessor architecture has something functionally similar, whatever it happens to be called.)

**What CPL protects**: everything genuinely relevant to isolation is gated on the current CPL — writes to \`%cs\` itself (to defend CPL from being changed arbitrarily), **every** memory read/write (in conjunction with paging, related card), I/O port accesses, and control-register accesses (\`%eflags\`, certain \`%cs\`-adjacent state, and more).

**Why CPL alone is not enough**: CPL only protects against **direct** attacks on the hardware — attempting a privileged instruction or access while in user mode simply faults. But the kernel must still actively **configure** other protection mechanisms correctly (control registers, page tables) to protect things like kernel memory itself — CPL prevents user code from *directly* reading arbitrary physical memory or hardware registers, but it's the **combination** of CPL *plus* correctly-configured page tables (which memory ranges a given process's page table even makes accessible at all, related card) that provides the complete isolation guarantee; CPL is necessary but not, by itself, sufficient.`,
    pitfall:
      "CPL alone would let a user-mode process potentially still read or write arbitrary memory addresses that happen to be mapped into its own page table — CPL restricts PRIVILEGED OPERATIONS, not which memory addresses are accessible; memory isolation specifically is enforced by the combination of CPL together with the kernel correctly configuring each process's page table to exclude kernel memory and other processes' memory.",
    related: ["mit6828-intro-isolation-mechanisms", "mit6828-intro-syscall-entry"],
  },
  {
    id: "mit6828-intro-syscall-entry",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why is a naive 'user sets CPL=0 then jumps into the kernel' design insecure, and how does the x86 INT instruction's design solve the problem?",
    back: `**The design question**: user programs need kernel services, which means **some** mechanism must let user code raise its own privilege to CPL=0 and start running kernel code — but that mechanism itself must not become a hole a malicious or buggy user program could exploit.

**Why the naive approach fails**: suppose user code could execute an instruction sequence like "set \`CPL=0\`; then \`jmp\` to \`sys_open\`" — i.e., **two separate steps**, controlled by user-supplied instructions. This is **bad**: once \`CPL=0\` is set (even momentarily), the **very next**, user-specified instruction executes with full kernel privilege — a malicious program could set \`CPL=0\` and then jump *anywhere* it likes (not just to a legitimate kernel entry point), executing arbitrary code with full privilege.

**A closer idea, still broken**: what about a single **combined** instruction that both sets \`CPL=0\` *and* **requires** an immediate jump to somewhere specific — but still lets the user program supply *where*? Still bad: the user might specify an "awkward" jump target somewhere unintended deep inside kernel code (skipping necessary argument-checking logic at a real entry point, for instance), rather than a legitimate, fully-vetted entry point.

**The x86 answer — the \`INT\` instruction**: there are only a **few permissible kernel entry points**, and the **hardware itself**, not user-supplied instructions, decides exactly where \`INT\` lands — \`INT\` sets \`CPL=0\` **and** jumps to one of a small, fixed, kernel-configured set of entry addresses, with **no way** for user code to otherwise modify CPL or jump anywhere else "into" the kernel. On the way back out, **system-call return** is likewise a single combined instruction: it sets \`CPL=3\` **and** returns to user code in one atomic step (there's no way to separately set CPL and jump, in either direction) — but, notably, the **kernel** (already fully privileged) *is* allowed to jump anywhere it wants in user code, since a fully-trusted kernel jumping into less-trusted user code poses no privilege-escalation risk the way the reverse would.

**The resulting invariant**: at every moment, execution is in **exactly** one of two well-defined states — either \`CPL=3\` and executing ordinary user code, **or** \`CPL=0\` and executing from one of the kernel's own designated entry points. The states "\`CPL=0\` while executing something the user supplied" and "\`CPL=0\` while executing at some arbitrary kernel address the user chose" are both, by hardware construction, **impossible**.`,
    pitfall:
      "The security property here doesn't come from checking WHAT a jump target contains — it comes from removing the user's ability to choose a CPL=0 jump target AT ALL. INT's entry points are fixed by the kernel at setup time, not passed as an argument by the calling user instruction; there is no code path where untrusted, user-supplied data determines where execution resumes at kernel privilege.",
    related: ["mit6828-intro-cpl-mechanism", "mit6828-intro-syscall-interface-design"],
  },
  {
    id: "mit6828-intro-address-space-isolation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does x86 paging hardware create isolated address spaces, and why is paging described as 'the most popular plan' rather than the only possible one?",
    back: `**The idea — "address space"**: give each process some memory it can access (for its code, variables, heap, stack), and **prevent** it from accessing any other memory — neither the kernel's, nor any other process's.

**How x86 paging hardware realizes this**: xv6 uses x86's paging hardware. The **MMU** translates (or "maps") **every** address issued by a running program — both instruction fetches and data loads/stores, for kernel and user code alike — from a **virtual address (VA)** to a **physical address (PA)**; there is **no way** for any instruction to directly reference a physical address itself. The MMU consults an array with one entry per 4KB range of virtual address space (a **page**), each entry giving that page's corresponding physical address — this array **is** the **page table**. The OS tells the hardware which page table to use, and switches it whenever it switches to running a different process.

**Why this achieves isolation**: each **page table entry (PTE)** carries a bit saying whether **user-mode** instructions are permitted to use that mapping at all — the kernel only **sets** that permission bit for the memory that genuinely belongs to the *current* process's own address space, leaving every other process's (and the kernel's own) memory simply **unreachable** through this process's page table, however that process's own instructions try to address it.

**Paging is used for much more than just isolation** — e.g. **copy-on-write \`fork()\`** (a later course lab) reuses the very same page-table machinery for an entirely different purpose: efficient process duplication. **And paging isn't the *only* way to isolate memory**: alternatives exist that provide memory isolation without hardware paging at all — **type safety** (a language/runtime that simply never generates an out-of-bounds or arbitrary-pointer access in the first place), a managed runtime like a **JVM**, or research OSes like **Singularity** (isolation enforced by compiler-verified type safety rather than hardware page tables). Paging is simply "**the most popular plan**" in mainstream systems — a genuine design choice among several workable alternatives, not a logical necessity.`,
    related: ["mit6828-intro-cpl-mechanism", "mit6828-intro-x86-segmentation"],
  },
  {
    id: "mit6828-intro-preemptive-context-switch",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does an OS isolate the CPU from an uncooperative (e.g. infinite-looping) process, and why must the resulting context switch be totally transparent even to a cooperative process?",
    back: `**The problem**: prevent a **buggy or malicious process from hogging the CPU** forever — e.g. a process stuck in an infinite loop that never voluntarily yields. Since the kernel can't simply *ask nicely* and expect an uncooperative process to comply, it needs a way to **force** an uncooperative process to give up the CPU.

**The mechanism — a periodic hardware clock interrupt**: hardware provides a periodic "**clock interrupt**" that fires at regular intervals **regardless of what the currently-running process is doing** — this interrupt forcibly **suspends** the current process (mid-instruction-stream, wherever it happened to be) and **jumps into the kernel**, which can then choose to switch execution to a **different** process entirely.

**What "totally transparent" requires**: the kernel must **save and restore** the full process state (all registers, and whatever else is needed to resume exactly where execution was forcibly interrupted) — and this must be **completely transparent**, indistinguishable from the interrupted process's own point of view, **even to processes that would have cooperatively yielded on their own anyway**. A process should never be able to detect, from its own execution, that it was ever paused and resumed — its registers, memory, and program counter must appear completely undisturbed across the interruption, exactly mirroring the "transparent interrupt" requirement from this course's earlier hardware material (MIT 6.004's exception/interrupt handling, related concept).

**Terminology and a caveat**: this mechanism is called a "**pre-emptive context switch**." It's noted as the **traditional** approach — but not necessarily a *perfect* one (the lecture points to the exokernel paper as a place that questions some of the traditional assumptions baked into this design), a reminder that even foundational-seeming mechanisms like this one are genuine engineering choices, not the only conceivable way to solve the underlying problem.`,
    related: ["mit6828-intro-isolation-mechanisms", "mit6004-vm-os-multiplexing-cpu"],
  },
  {
    id: "mit6828-intro-syscall-interface-design",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What design philosophy governs the style of the xv6/Unix system call interface (integers, strings, user-allocated buffers — no shared objects), and why?",
    back: `**Restating the constraint**: the kernel and user processes **must** cooperate to some degree — user code genuinely needs kernel services — but the isolation mechanisms already established (related cards) mean user code **cannot** simply read or write kernel memory directly (well — with certain very deliberate, controlled exceptions introduced later in the course, e.g. for performance — but never as the default, unrestricted case), while the **kernel** generally *can* read/write a requesting process's user memory (since the kernel is fully trusted and needs to, e.g., copy syscall arguments and results across the boundary). Given this, the kernel must be careful about **how much** of that read/write capability it actually exercises, to avoid accidentally corrupting user state it shouldn't be touching.

**The resulting interface style**: system calls are kept **pretty simple** — arguments and results are **integers**, **strings** (always passed by **copying**, not by reference), and **user-allocated buffers** (memory the *user* process itself owns and has already allocated, which the kernel fills in or reads from on the user's behalf). Explicitly **avoided**: passing rich **objects** or complex **data structures** directly across the user/kernel boundary.

**The underlying rationale, stated directly**: this style guarantees there is **never any doubt about who owns memory** — a plain integer or a copied string carries no ambiguity about which side (kernel or user) is responsible for its lifetime, its validity, or freeing it; a shared object or a raw pointer *into* one side's private data structures, by contrast, would create exactly the kind of ambiguous, exploitable ownership question that could let a bug (or a malicious user program) trick the kernel into reading or writing memory it shouldn't, or corrupt the kernel's own internal state through what looks like an innocuous argument. This deliberately narrow, low-level interface style is a direct consequence of taking process isolation (related card) genuinely seriously at every point where user and kernel code must interact.`,
    pitfall:
      "The system call interface's simplicity (integers, copied strings, user-owned buffers) isn't primarily about ease of implementation — it's a direct SECURITY consequence of the isolation requirements established earlier in the lecture: any richer interface (shared objects, raw cross-boundary pointers) would reopen exactly the kind of ownership ambiguity the CPL/paging/syscall-entry mechanisms were built to eliminate.",
    related: ["mit6828-intro-syscall-entry", "mit6828-intro-isolation-mechanisms"],
  },
];
