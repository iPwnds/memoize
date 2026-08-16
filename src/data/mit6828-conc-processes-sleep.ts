// MIT 6.828 (Fall 2012) — Lectures 6-8: multiprocessors and locking (race
// conditions, locks/critical sections, atomic instructions, why spin locks
// and interrupts interact dangerously, lock granularity/modularity, lock
// ordering), processes and context switching (process vs. thread
// terminology, the switching-transparency goals, the three-hop
// user-kernel-user switch sequence, xv6's co-routine scheduler design,
// yield/swtch concurrency, and thread cleanup), and sleep/wakeup (spin vs.
// sleep, the lost-wakeup race and why sleep() takes a lock argument, xv6's
// atomicity mechanism, and signals arriving during sleep). See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6828-conc";

export const mit6828ConcProcessesSleepCards: Card[] = [
  // --- Lecture 6: Multiprocessors and Locking ---
  {
    id: "mit6828-conc-race-condition",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Using the linked-list insert() example, show what goes wrong when two processors call a 'correct-looking' function concurrently, and why most code is only correct under serial execution.",
    back: `**The abstract SMP architecture** this lecture assumes: multiple processors sharing **one** memory, plus devices, with **interrupts processed in parallel** across those processors — genuinely simultaneous execution, not merely time-sliced on one CPU.

**The example**: \`insert(int data) { List *l = new List; l->data = data; l->next = list; /* A */ list = l; /* B */ }\` — prepending a node to a shared singly-linked list. Whoever wrote this code probably believed it was correct: if the list starts out correct, one call to \`insert()\` yields a new list with the old elements plus the new one, and two successive calls yield two new elements. **This reasoning is only valid under serial execution** — i.e., it silently assumes \`insert()\` is only ever called one-at-a-time, never concurrently.

**What goes wrong under real concurrency**: suppose two different processors both call \`insert()\` at the same time, and their executions of statements A (\`l->next = list\`) and B (\`list = l\`) **interleave**. Tracing the sequence $A_1$ (processor 1's A), $A_2$ (processor 2's A), $B_2$, $B_1$: both new nodes read the **same** original \`list\` value into their own \`next\` pointer (via $A_1$, $A_2$, before either has updated the shared \`list\` variable) — then $B_2$ sets \`list\` to point at processor 2's node, but $B_1$ (executing *after*) **overwrites** that with processor 1's node instead. The result: processor 2's node is silently **dropped** from the list entirely, even though its \`insert()\` call returned normally with no error — a **race condition**, and a classic illustration that most programmers write code that's only correct under an implicit serial-execution assumption they never state explicitly.

**The stated goals this motivates**: serialize inserts (and deletes) on the **same** list, while still allowing operations on genuinely **different** lists to proceed in parallel — i.e., the fix should be as narrowly scoped as the actual sharing, not a blanket "only one operation anywhere, ever."`,
    related: ["mit6828-conc-locks-and-critical-sections"],
  },
  {
    id: "mit6828-conc-locks-and-critical-sections",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Show the lock-protected fix for the list race, define 'critical section,' and describe the worked IDE-disk-driver example of what invariants a lock actually protects.",
    back: `**The popular tool: a lock.** The general framing: **a lock protects an invariant** — some property of shared data that must hold whenever no one is in the middle of modifying it.

**Fixing the list race** (related card): \`Lock list_lock; // one per list\`, then: \`insert(int data) { List *l = new List; l->data = data; acquire(&list_lock); l->next = list; /* A */ list = l; /* B */ release(&list_lock); }\` — note that allocating and initializing the new node happens **before** acquiring the lock (no shared state touched yet, so no need to serialize that part), and the lock is held only across the genuinely shared-state-touching statements A and B.

**Terminology**: the code between \`acquire\`/\`release\` is called a **critical section**, or **atomic section** — from the outside, its effects appear to happen as a single, indivisible unit relative to any other thread also trying to enter a critical section protected by the same lock.

**Worked example — the IDE disk device driver**: use **one lock for all disk devices**, protecting several distinct invariants simultaneously: **the disk hardware itself can only execute one read or write at a time** (a physical constraint the software must respect); **only one process should be inserting or deleting from the shared \`ide_queue\`** at a time (an ordinary shared-data-structure invariant, exactly like the list example); **only one process should be commanding the IDE hardware** (via \`inb\`/\`outb\` I/O instructions, related Lecture 2 card) **at a time**. A natural question the lecture raises: why does \`iderw()\` (the driver's main entry point) have **no lock around its very first instruction**? Because that first instruction doesn't yet touch any of the shared state the lock protects — locking, correctly, should bracket only the genuinely shared-state-touching portion of a function, exactly mirroring \`insert()\`'s own allocate-then-lock structure. The device driver additionally has its **own** concurrency invariants beyond simple mutual exclusion — e.g. the processor shouldn't read or write a DMA buffer while the disk hardware is actively using it — enforced, in the end, simply by **careful, disciplined programming** rather than any single automatic mechanism.`,
    related: ["mit6828-conc-race-condition", "mit6828-conc-atomic-instructions"],
  },
  {
    id: "mit6828-conc-atomic-instructions",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How is acquire()/release() actually implemented using an atomic hardware instruction like x86's xchg, and what kind of lock does xv6 use?",
    back: `**The bootstrapping requirement**: implementing \`acquire\`/\`release\` itself needs **some** atomic primitive to build on — you can't implement mutual exclusion purely out of ordinary, non-atomic reads and writes without risking the exact same race-condition problem one level down (echoing this course's own earlier — MIT 6.004 — discussion of semaphore-implementation bootstrapping).

**x86's \`xchg\` instruction**: \`xchg %eax, addr\` performs, as a single **atomic** hardware operation: **freeze other CPUs' memory activity for address \`addr\`**; \`temp := *addr\`; \`*addr := %eax\`; \`%eax = temp\`; **un-freeze** other CPUs' memory activity for that address. The freeze/un-freeze bracket is exactly what guarantees no *other* processor can observe or interfere with this read-modify-write sequence partway through — the same "some atomicity assumption in the implementation technology" requirement this course's earlier semaphore-implementation material (MIT 6.004) identified generally, here satisfied by a dedicated hardware instruction (mirroring that earlier material's "test and set" approach) rather than kernel-handler atomicity or Dijkstra's software-only 2-phase scheme.

**xv6's lock is a *spin* lock**: \`acquire()\` repeatedly attempts the atomic \`xchg\`-based test-and-set in a tight loop until it succeeds — the calling processor **busy-waits**, actively spinning and consuming CPU cycles, rather than doing anything else, for however long the lock happens to be held by someone else.

**A subtlety noted — instruction reordering**: modern CPUs and compilers can reorder memory operations for performance, which could in principle let an instruction that's "supposed" to happen after \`acquire()\` actually become visible to other processors *before* the lock is genuinely held — xv6's lock implementation must account for this (via appropriate memory-barrier/fence instructions bracketing the critical section) to guarantee the critical section's *effects*, not just the \`acquire\`/\`release\` calls themselves, are correctly ordered relative to other processors' view of memory.`,
    related: ["mit6828-conc-locks-and-critical-sections", "mit6828-conc-locks-and-interrupts"],
  },
  {
    id: "mit6828-conc-locks-and-interrupts",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why can spin locks and interrupt handlers deadlock each other, and how does xv6's 'critical sections run with interrupts disabled' rule prevent it?",
    back: `**The dangerous interaction**: **spin locks are not good for waiting until a device driver returns** — if the wait might be long, spinning simply wastes CPU cycles that could be doing useful work (this motivates sleep locks for long waits, related card on sleep/wakeup). But there's a sharper, *correctness* problem specifically involving **interrupts**: the IDE disk generates an **interrupt** when a disk operation completes, causing the handler \`ideintr\` to run. If \`ideintr\` needs to \`acquire\` the **same** lock that was **already held** by the code the interrupt just preempted — **deadlock**: the interrupted code can never release the lock (it's suspended, waiting for the interrupt handler to finish), and the interrupt handler can never acquire it (it's waiting for the interrupted code to release it) — a two-party circular wait, exactly the deadlock structure from this course's earlier (MIT 6.004) Dining Philosophers material, just realized here between "normal execution" and "an interrupt handler" rather than between two ordinary processes.

**One tempting-but-bad fix**: give the interrupt handler its **own**, separate lock (or make locks recursive so the same holder can re-acquire). This is explicitly called out as **a bad idea** — recursive locks mask exactly the bugs a lock is supposed to catch, and \`ideintr\` in particular should **certainly not** use a recursive lock as a substitute for the real fix.

**xv6's actual fix**: **critical sections run with interrupts turned off**. By disabling interrupts for the duration of any critical section that a device interrupt handler might also need to enter, xv6 guarantees the interrupt simply **cannot fire** at all while the lock is held by ordinary (non-interrupt) code — eliminating the possibility of the dangerous interleaving entirely, rather than trying to detect or recover from it after the fact. This is a direct, mechanism-level consequence of the isolation/timing material from Lecture 3 (related card): interrupts are a form of forced, involuntary control transfer, and the only fully reliable way to prevent one from landing at a genuinely unsafe moment is to disable them for that moment.`,
    pitfall:
      "A recursive lock 'fix' for the interrupt-handler deadlock doesn't actually solve the underlying problem — it just prevents the deadlock from being DETECTED, while leaving the interrupt handler free to run concurrently with (partway through) the very critical section it interrupted, exactly the race condition locks exist to prevent in the first place. Disabling interrupts during critical sections is the fix that actually rules out the dangerous interleaving.",
    related: ["mit6828-conc-atomic-instructions", "mit6828-intro-preemptive-context-switch"],
  },
  {
    id: "mit6828-conc-lock-granularity-modularity",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Using the move() example, show why locks are part of a module's specification (not just its implementation), and contrast lock granularity choices (one lock per kernel vs. one lock per device).",
    back: `**Granularity, as a genuine design axis**: should there be **one lock for the entire kernel** (a "Big Kernel Lock," BKL — simple to reason about, but serializes *everything*, killing multiprocessor parallelism)? Or **one lock per device** (finer-grained, more genuine concurrency, but more locks to manage correctly, and more opportunities for lock-ordering bugs, related card)? This is a real tradeoff with no universally correct answer — the lecture notes that "this year your JOS will do this..." (i.e., the course's own lab kernel makes a specific, deliberate choice here, presented as one workable point in the tradeoff space, not the only one).

**Locks are part of a module's *specification*, not merely an internal implementation detail**: e.g. \`idestart\` **assumes its caller already holds the relevant lock** — this assumption is exactly as much a part of \`idestart\`'s contract as its parameter types or return value; a caller that doesn't already hold the lock when calling \`idestart\` violates that contract just as surely as passing the wrong argument type would, even though nothing in \`idestart\`'s own signature visibly states the requirement.

**Worked example — the danger of not locking granularly and correctly, via \`move()\`**: \`move(l1, l2) { e = del(l1); insert(l2, e); }\` — moving an element from one list to another via two separate, individually-safe operations. **The bug**: there is a genuine window of time, between the \`del\` and the \`insert\`, during which \`e\` is **observable as being in neither list** — any other thread inspecting the system during that window sees an inconsistent, "lost" element, even though \`move()\` as a whole is *supposed* to look atomic from the outside.

**The fix — hold both locks across the whole operation**: \`move(l1, l2) { acquire(l1.lock); acquire(l2.lock); e = del(l1); insert(l2, e); release(l1.lock); release(l2.lock); }\` — genuinely making the entire compound operation appear atomic, by extending the critical section to cover *both* individually-locked resources for the operation's full duration, not just each sub-operation individually. This sets up the next problem directly: acquiring **two** locks at once now raises a lock-*ordering* question (related card) — what if some other operation acquires \`l1.lock\` and \`l2.lock\` in the opposite order?`,
    related: ["mit6828-conc-locks-and-critical-sections", "mit6828-conc-lock-ordering"],
  },
  {
    id: "mit6828-conc-lock-ordering",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why are recursive locks a bad idea, and what lock-ordering discipline prevents deadlock when a piece of code must hold multiple locks at once?",
    back: `**Recursive locks are called out as a bad idea, generally** — not just in the interrupt-handler context (related card), but as a broader principle: a lock that silently permits its own holder to re-acquire it masks exactly the class of bugs (accidentally re-entering a critical section, or misunderstanding which code paths already hold which locks) that ordinary, non-recursive locks are specifically designed to surface as a hang/deadlock during development, rather than as silent, hard-to-diagnose data corruption in production.

**The deadlock risk once code legitimately needs multiple locks at once** (as \`move()\`, related card, now does): if one code path acquires \`l1.lock\` then \`l2.lock\`, while a *different* code path somewhere else in the system acquires \`l2.lock\` then \`l1.lock\`, the two can deadlock — each holding one lock the other needs next — exactly the **circular wait** condition from this course's own earlier (MIT 6.004) Dining Philosophers treatment, now recurring in a genuinely new context (kernel lock management) rather than an abstract toy problem.

**The fix — a fixed, global lock-acquisition ordering**: establish one consistent order in which locks are *always* acquired, system-wide, and never violate it — a direct application of the same "fixed resource ordering" deadlock-avoidance discipline this course's earlier material already proved eliminates circular wait (since the highest-priority/highest-ordered lock-holder, by construction, can never itself be waiting on anything).

**A concrete xv6-specific instance of this rule**: \`iderw()\`'s sleep-based waiting (related card) internally **acquires \`plock\`** (the process-table lock) as part of how sleep works — which establishes a concrete ordering constraint: code must **never acquire \`plock\` and then try to acquire \`ide_lock\`** afterward, since \`ide_lock\`-holding code paths may themselves need to go through a sleep that acquires \`plock\` — acquiring them in the *other* order (as \`iderw\` already does) avoids the corresponding circular-wait risk. This isn't a hypothetical concern — it's the exact kind of constraint real kernel code must track explicitly and consistently across every code path that might hold more than one lock.`,
    related: ["mit6828-conc-lock-granularity-modularity", "mit6004-comm-sync-deadlock"],
  },

  // --- Lecture 7: Processes and Switching ---
  {
    id: "mit6828-conc-process-thread-terms",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define 'process' and 'thread' precisely (including kernel thread vs. user thread), and describe xv6's specific process/thread/processor picture.",
    back: `**A process**: the OS's core abstraction — an **abstract virtual machine**, providing the *illusion* to an application of a dedicated computer, but a convenient, **abstract** one for the application developer (rather than raw, literal hardware) — critically, **one process cannot accidentally affect another** (directly restating the isolation goals from Lecture 3, related card). A process's own API surface: \`fork\`, \`exec\`, \`exit\`, \`wait\`, \`kill\`, \`sbrk\`, \`getpid\`.

**The problem this lecture actually tackles**: there are typically **more processes than processors** — the system must be able to run many processes' worth of logical execution on a small, fixed number of physical CPUs, switching between them.

**Precise definitions**: **a process** = an address space **plus one or more threads**. **A thread** = "a thread of execution" — formally, **an abstraction that contains enough state of a running program that it can be stopped and later resumed** (registers, program counter, stack — exactly the state a context switch, related card, must save and restore). **Kernel thread**: a thread currently running in kernel mode. **User thread**: a thread currently running in user mode.

**xv6's specific picture**: **1 user thread and 1 kernel thread per process** (xv6 doesn't support multiple threads *within* a single process — each process has exactly one of each), plus **1 scheduler thread per processor**, across **$n$ processors** total. xv6's own relevant API for thread-level control: \`yield\` (voluntarily give up the CPU) and \`swtch\` (the low-level primitive that actually performs a context switch between two specific thread contexts).`,
    related: ["mit6828-intro-isolation-mechanisms", "mit6828-conc-switch-transparency-goals"],
  },
  {
    id: "mit6828-conc-switch-transparency-goals",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the two design goals for the process-switching solution, and explain why 'a kernel thread cannot hog a processor' is explicitly NOT one of them.",
    back: `**Goal 1 — switching must be transparent to user threads**: exactly the same transparency requirement established generally in Lecture 3 (related card) — a user thread, resumed after being switched away from and back to, must be unable to detect that anything happened; its registers, memory, and program counter must appear completely undisturbed.

**Goal 2 — a user thread cannot hog a processor**: the kernel must be able to **forcibly** reclaim the CPU from an uncooperative or buggy user thread (the preemptive-context-switch mechanism, related card) — no user-level code should be able to prevent this by, e.g., looping forever or ignoring the timer interrupt.

**Why "a kernel thread cannot hog a processor" is explicitly *not* stated as a goal**: **kernel threads are assumed to be correct** — since kernel code is entirely under the OS developers' own control (not arbitrary, untrusted user code), the system simply trusts that kernel-mode code will eventually yield or complete on its own, rather than building in the same forced-preemption machinery used against untrusted user code. This is a deliberate scope-narrowing assumption, not an oversight — it reflects that the *threat model* motivating forced preemption (untrusted, possibly-buggy or malicious code) applies specifically to user code, not to the kernel's own trusted internals.`,
    pitfall:
      "This doesn't mean kernel code can never be interrupted at all — it means the system doesn't need a FORCED mechanism specifically to protect against a hostile or buggy kernel thread hogging a CPU forever, because kernel code is trusted by assumption. Kernel-mode execution can still be interrupted by device interrupts (Lecture 5's kernel-mode-interrupt case, related card) — the two concerns (forced preemption vs. ordinary interruptibility) are separate.",
    related: ["mit6828-conc-process-thread-terms", "mit6828-intro-preemptive-context-switch"],
  },
  {
    id: "mit6828-conc-user-thread-switch-overview",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Outline the three-hop sequence (user→kernel, kernel→kernel, kernel→user) by which switching from one user thread to a completely different one is accomplished.",
    back: `Switching between two **user** threads is never a single, direct hop — it's structured as three distinct transitions, chained together:

**(1) User → kernel transition**: guaranteed to happen via a **periodic timing interrupt** (every 100ms, in the numbers discussed) — even a user thread that never makes a system call or voluntarily yields will still be forcibly transferred into the kernel at least this often, directly realizing Goal 2 (a user thread cannot hog a processor, related card). This is the **"guaranteed U→K transition"** — the property the whole scheme's correctness ultimately rests on.

**(2) Kernel → kernel switch**: once in the kernel (whether via the timer interrupt or a voluntary \`yield\`), the kernel **switches to a different kernel thread** — this is the actual context-switch step, implemented via \`swtch\` (related card on xv6's scheduler design), transferring control from the *current* thread's kernel-mode execution to some *other* thread's previously-suspended kernel-mode execution.

**(3) Kernel → user transition**: that different kernel thread, once resumed, eventually **returns to its own corresponding user thread** — via the ordinary trap-return path (Lecture 5's trapframe-restore mechanism, related card), resuming that *different* user thread exactly where it was left off.

**The net effect**: from the outside, it looks like execution simply "switched" from user thread A directly to user thread B — but underneath, it's genuinely a three-hop journey (A's user code → A's kernel thread → B's kernel thread → B's user code), each hop using a mechanism already established in earlier lectures (the trap/interrupt entry mechanism from Lecture 5, and the low-level \`swtch\` context-switch primitive covered in this lecture) rather than any single new, dedicated "user-to-user switch" instruction or mechanism.`,
    related: ["mit6828-conc-process-thread-terms", "mit6828-vm-trapframe", "mit6828-conc-xv6-scheduler-design"],
  },
  {
    id: "mit6828-conc-xv6-scheduler-design",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe xv6's scheduler design (one scheduler thread per processor, co-routine style), and explain why a thread can't clean up its own kernel stack and must hand that job to the scheduler.",
    back: `**xv6's scheduler design**: **one dedicated scheduler thread per processor** (not a single global scheduler shared across processors) — **scheduling is organized as co-routines**: rather than the scheduler being a subroutine that threads *call into* and get a return value back from, control passes back and forth between a thread and its processor's scheduler thread as **peer** routines, each explicitly yielding control to the other via \`swtch\`, neither one being conceptually "in charge" of returning control to the other in the ordinary caller/callee sense.

**Why the scheduler thread specifically performs cleanup**: one of the genuine implementation challenges this lecture calls out is **terminating a thread always needs a valid stack** — a thread cannot free or otherwise dismantle its **own** kernel stack while it is still the thread actively executing *on* that very stack (the CPU is still using it!). The co-routine structure resolves this cleanly: when a thread is done (exiting), it \`swtch\`es away to the **scheduler thread** — which is running on the **scheduler's own**, separate stack — and it is the **scheduler**, now safely executing on a different stack entirely, that can go on to perform any necessary cleanup of the now-finished thread's resources, including (eventually) freeing that thread's kernel stack, without ever needing to free the stack it's currently running on.

**Other challenges this design has to navigate**: **opaque code** ("you are not supposed to understand this" — a real comment in the xv6 source, acknowledging that the low-level \`swtch\` assembly, which saves/restores a context and jumps into genuinely different code with a different stack, is inherently subtle and hard to reason about line-by-line); and **concurrency** — several processors are potentially switching between threads simultaneously, needing careful synchronization (related card on \`yield\`/\`swtch\` concurrency) to avoid the scheduler-level analogue of the very race conditions this whole lecture sequence started with.`,
    related: ["mit6828-conc-user-thread-switch-overview", "mit6828-conc-thread-cleanup"],
  },
  {
    id: "mit6828-conc-yield-swtch-concurrency",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why must the process-table lock (plock) be held across the swtch() call inside yield(), and why does the scheduler nonetheless release and immediately re-acquire that same lock right after its scan loop?",
    back: `**Why \`plock\` must stay held across \`swtch\`**: when a thread calls \`yield()\`, it marks itself **runnable** (available for some processor's scheduler to pick up and resume later) — but until the \`swtch\` call has **actually completed** the low-level context switch (saving this thread's registers/stack pointer into its saved context), that saved context isn't genuinely safe to resume from yet. If \`plock\` were released **before** \`swtch\` completes, a **different** processor's scheduler could see the thread marked runnable, select it, and try to resume it from a context that hasn't finished being saved yet — a race condition exactly analogous to the original list-insert race (related card), just one level down in the scheduler's own bookkeeping. Holding \`plock\` across the entire \`swtch\` call closes this window: **$p$ must fully complete its switch before any scheduler is allowed to choose $p$** again. (The lecture notes this pattern is genuinely **hard to reason about**, even with the coroutine structure helping.)

**Why the scheduler releases \`plock\` right after its scan loop, then immediately re-acquires it**: the scheduler must, at some point, **run with interrupts enabled** — if it held \`plock\` (and, per the earlier rule, kept interrupts disabled the whole time it holds a lock a device interrupt handler might need, related card) for its *entire* scanning loop indefinitely, a device interrupt that some other part of the system is waiting on could **never be serviced** while the scheduler loop runs, potentially stalling the whole system. Releasing and immediately re-acquiring \`plock\` around/after the scan gives interrupts a genuine window to be serviced between scheduling passes, trading a small amount of scheduler-loop overhead for guaranteed interrupt responsiveness.

**A related question the lecture poses directly**: can two different processors' schedulers **simultaneously** select the **same** runnable process? This is precisely what holding \`plock\` across the relevant critical section is designed to prevent — only one scheduler can hold \`plock\` (and thus be in the process of selecting/switching to a given process) at a time.`,
    related: ["mit6828-conc-xv6-scheduler-design", "mit6828-conc-locks-and-interrupts"],
  },
  {
    id: "mit6828-conc-thread-cleanup",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Walk through why kill() cannot immediately clean up a killed process, why exit() cannot delete its own stack, and what wait() actually does.",
    back: `**Can \`kill()\` clean up the killed process immediately?** **No** — the target process **might currently be running** (on some other processor, actively executing) or **holding locks** at the exact moment \`kill()\` is called; forcibly tearing down its state right then would corrupt whatever it was doing and potentially leave shared locks permanently held with no one left to release them.

**The actual mechanism — self-termination**: instead of being torn down externally, a killed process **kills itself**, by calling \`exit()\`, but only once it naturally reaches a safe point — specifically, **before returning to user space** (i.e., xv6 arranges for a process marked "should be killed" to notice this and call \`exit()\` itself at the next safe opportunity, such as returning from a system call or trap, rather than being interrupted mid-critical-section from the outside).

**Can \`exit()\` delete its own kernel stack?** **No**, for exactly the same reason \`swtch\`-based cleanup generally can't (related card): the exiting thread is still **actively executing on** that very stack while \`exit()\` itself runs — it cannot safely free the ground it's currently standing on.

**Who does the actual final cleanup?** **\`wait()\`** — called by the **parent** process, does the real cleanup work (freeing the exited child's remaining resources, including its now-safely-abandoned kernel stack) once the child has already transitioned to a terminated-but-not-yet-fully-cleaned-up state via \`exit()\`. This three-step structure (external \`kill()\` request → self-directed \`exit()\` at a safe point → parent's \`wait()\` performing final teardown) is the concrete resolution of the "can't clean up your own stack, and can't be killed at an arbitrary unsafe moment" constraints running through this whole lecture's thread-lifecycle material.`,
    related: ["mit6828-conc-xv6-scheduler-design", "mit6828-intro-os-fork-exec-split"],
  },

  // --- Lecture 8: Sleep & Wakeup ---
  {
    id: "mit6828-conc-spin-vs-sleep",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is 'sequence coordination,' why is spinning a poor 'straw man' solution for it, and what four concrete waiting scenarios does it generalize to?",
    back: `**Sequence coordination**: the general problem of arranging for threads to **wait for each other** to reach some condition before proceeding — distinct from the *mutual exclusion* problem locks solve (related cards); here, a thread isn't merely avoiding overlap with others, it's genuinely waiting on some **event** or **condition** that another thread will bring about.

**Four concrete instances this generalizes across**, all recurring throughout a real kernel: waiting for a **disk interrupt to complete** (a driver thread needs the actual disk-transfer result before it can proceed); waiting for **pipe readers to make space** in a full pipe buffer (a writer blocked until a reader drains some data, this course's own Lecture 1 pipe material, related concept); waiting for a **child process to exit** (\`wait()\`, related card); waiting for a **buffer to become free** for use (a general resource-availability wait).

**The "straw man" solution — spin**: simply loop, repeatedly checking the condition, until it becomes true. **The problem**: this **wastes CPU cycles** for however long the wait actually takes — fine for very short waits (as ordinary spin locks, related card, already accept), but genuinely wasteful — and potentially cripplingly so — if the wait might be long (a disk operation, or another process's I/O-bound work).

**The better solution — sleep when waiting**: instead of busy-spinning, a waiting thread should voluntarily **give up the CPU entirely** (transition out of the scheduler's active rotation, mirroring this course's own earlier — MIT 6.004 — active/waiting process-state material) while it waits, letting some *other* thread make productive use of the CPU in the meantime, and be **woken up** later once the awaited condition actually becomes true. The lecture immediately flags this as genuinely **tricky** to implement correctly, specifically because of the **lost wakeup** problem (related card).`,
    related: ["mit6828-conc-lost-wakeup-problem"],
  },
  {
    id: "mit6828-conc-lost-wakeup-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the lost-wakeup race condition precisely, and explain why it forces sleep() to take a lock as an explicit argument rather than being a parameterless call.",
    back: `**The race, concretely**: a thread wants to wait for some condition — it checks the condition, finds it false, and is *about* to call \`sleep()\` to actually go dormant. But **between** checking the condition and *actually* going to sleep, there is a genuine window during which another thread could bring the condition true and call the corresponding \`wakeup()\` — if that \`wakeup()\` happens to land in exactly that window, **before** the first thread has actually registered itself as sleeping, the wakeup is simply **lost**: there was no sleeping thread yet for it to wake, and once the first thread *does* finally go to sleep (a moment later), it will now wait **forever** for a wakeup that already happened and can never be repeated — a **deadlock**, arising purely from an unlucky timing window, not from any logic error in either thread's own code.

**Why this forces an API change — \`sleep()\` must take a lock as an argument**: the fix requires making "check the condition" and "go to sleep" **atomic** with respect to any wakeup — i.e., no wakeup can possibly be delivered in the gap between them. But the condition being checked is itself typically protected by **some** lock (so that concurrent modifications to it are themselves safe) — so \`sleep()\` needs to know **which** lock that is, specifically so it can arrange to hold it (or coordinate around it) right up until the sleeping thread is genuinely, safely registered as asleep, and only *then* release it — closing the race window entirely. A parameterless \`sleep()\`, with no way to coordinate with the caller's own condition-protecting lock, structurally **cannot** close this window — hence the deliberate API design: \`sleep(chan, lock)\`, not just \`sleep(chan)\`.

**Case study referenced**: \`iderw()\` (the same IDE driver code from Lecture 6, related card) is used as the concrete worked example of exactly this pattern — why it passes its own \`ide_lock\` into \`sleep()\`, and what specifically goes wrong (a missed wakeup, leading to deadlock) if it instead called a naive, lock-unaware \`sleep()\`.`,
    pitfall:
      "It's tempting to think the race is 'unlikely enough in practice to ignore' — but the whole point of this lecture's design is that a race window, however narrow, WILL eventually be hit under real concurrent load (this is exactly the same 'don't trust serial-execution intuition' lesson from the very first race-condition example, related card), and a missed wakeup here doesn't just corrupt data — it deadlocks the waiting thread permanently, since there's no second chance for the same wakeup event to occur.",
    related: ["mit6828-conc-spin-vs-sleep", "mit6828-conc-sleep-atomicity-mechanism"],
  },
  {
    id: "mit6828-conc-sleep-atomicity-mechanism",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the exact order of operations xv6's sleep() uses to make 'going to sleep' atomic, and why that specific ordering (not the reverse) is what closes the lost-wakeup window.",
    back: `**The mechanism, in order**: (1) \`sleep()\` first **acquires \`plock\`** (the process-table lock — the same lock protecting process state generally, including which processes are runnable, related card). (2) It then **sets the calling process's state to SLEEPING** (registered as asleep — and, critically, this update happens while \`plock\` is held, so no scheduler or \`wakeup()\` call, which must itself also go through \`plock\` to inspect/modify process states, can act on this process's state mid-transition). (3) **Only then** does it **release the *caller's* condition lock** (the lock argument passed into \`sleep()\`, related card) — the lock that was protecting the condition being waited on.

**Why this specific ordering closes the race**: any \`wakeup()\` call must itself go through \`plock\` to find and reactivate sleeping processes — so as long as the calling process's state transition to SLEEPING happens **while \`plock\` is held**, there is **no possible window** during which the process has *stopped checking its condition* (having already decided to sleep) but is *not yet* correctly registered as asleep — a concurrent \`wakeup()\` attempting to run during this sequence must itself wait for \`plock\`, and by the time it gets \`plock\`, the sleeping process's state is already fully, correctly set — the wakeup can no longer be "too early," because the registration-as-asleep and the release of the condition lock are bridged by \`plock\` continuously held across the transition.

**Confirming via a second example — pipes**: the lecture poses this directly as a check-your-understanding question — what specifically is the race if a pipe's own \`sleep()\` call **didn't** take \`p->lock\` (the pipe's own condition-protecting lock) as its argument? The same lost-wakeup structure recurs: a writer could add data and call \`wakeup()\` in the gap between a reader checking "pipe empty?" and the reader actually registering itself as asleep, exactly mirroring the general race (related card) — the pipe case is simply a second, concrete instantiation of the identical underlying problem, using \`p->lock\` in the role that \`ide_lock\` played for the disk-driver case.`,
    related: ["mit6828-conc-lost-wakeup-problem", "mit6828-conc-locks-and-interrupts"],
  },
  {
    id: "mit6828-conc-signals-during-sleep",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What complication does an external signal (e.g. ctrl-C) arriving while a process is deep in a kernel sleep() introduce, and how do real kernels — vs. xv6 specifically — handle it?",
    back: `**The complication**: a process can be asleep **arbitrarily deep inside kernel code** (waiting on a disk interrupt, a pipe, a child, in the middle of some multi-step kernel operation) when an external signal (e.g. the user hits ctrl-C) arrives, needing to interrupt it. A signal **forces** the process out of its \`sleep()\` — but when it comes back out, **the condition it was actually waiting on is generally still false** (the signal didn't make the disk operation finish, or the pipe have data, or the child exit) — so the code that was sleeping can't simply resume as if the wait had completed normally; it has to somehow unwind out of whatever multi-step kernel operation it was in the middle of, cleanly, without leaving kernel data structures in an inconsistent state.

**A common general approach (used by many real kernels)**: use **\`longjmp\`** to **unwind the stack** — abandoning the current, partially-completed kernel-mode call chain entirely, back to a well-defined point (typically the top of the system-call handling logic) — and then **retry the system call from scratch**, re-checking whatever conditions are relevant as if the call had just been freshly issued by the user program.

**xv6's own, narrower approach**: xv6 **does not** implement this general longjmp-and-retry machinery. Instead, it handles the specific case of a **kill signal arriving while sleeping on a pipe** by having the relevant pipe code **explicitly check** for a pending kill request at the appropriate point, rather than relying on any general-purpose signal-unwinding mechanism — a deliberately narrower, special-cased solution to the one specific instance of this problem xv6's own pipe implementation actually needs to handle correctly, rather than the fully general mechanism a production kernel would need to support arbitrary signal delivery during arbitrary kernel-mode sleeps.`,
    related: ["mit6828-conc-lost-wakeup-problem"],
  },
];
