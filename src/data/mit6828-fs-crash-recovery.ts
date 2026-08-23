// MIT 6.828 (Fall 2012) — Lectures 9-11: file systems (FS goals, UNIX's
// high-level design choices, the inode abstraction, xv6's on-disk layout,
// worked create/write/delete traces, and the buffer cache), crash recovery
// via synchronous metadata updates and xv6's simple write-ahead logging
// (and exactly why both are either unsafe or slow), and Linux ext3's fast
// journaling design (write absorption, transaction batching/commit,
// concurrency correctness, log-space reservations, durability, and the
// ordered-mode/checksum/orphan-inode correctness subtleties that make a
// production journaling filesystem genuinely hard to get right). See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6828-fs";

export const mit6828FsCrashRecoveryCards: Card[] = [
  // --- Lecture 9: File System ---
  {
    id: "mit6828-fs-goals-and-api-choices",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the four FS goals, list UNIX's five high-level design choices, and explain why the resulting FS/FD abstraction generalizes so usefully beyond ordinary disk files.",
    back: `**FS goals**: **durable storage** (data survives reboots, and ideally crashes); **multiplexing** (many files, many processes, sharing one disk); **sharing** (deliberate, controlled access to the same data by multiple users/processes); **organization** (a structure for finding and naming data, not just storing bytes somewhere).

**UNIX's (and xv6's) high-level design choices**, each a genuine alternative among several: **granularity** — **files** (as opposed to exposing a raw virtual disk, or a full database). **Content** — an uninterpreted **byte array** (as opposed to fixed 80-byte records, or a structured B-tree). **Naming** — **human-readable** names (as opposed to opaque object IDs). **Organization** — a **name hierarchy** (directories nested within directories). **Synchronization** — **none** built into the FS itself (as opposed to built-in locking or file versioning — concurrent access safety is left to applications).

**The basic API**: \`fd = open("x/y", O_CREATE); write(fd, "abc", 3); link("x/y", "x/z"); unlink("x/y");\`.

**Why this abstraction turns out to be so useful, well beyond ordinary disk files**: the *same* file-descriptor interface is reused for **pipes** (Lecture 1, related concept), **device files** (\`/dev/console\`), Linux's **\`/proc\`** (exposing kernel/process state as if it were a filesystem), **\`/afs\`** (a distributed network filesystem), and Plan 9 (which pushes this idea further still, representing essentially all system resources as files). **The point**: applications don't need to know about each of these different kinds of underlying object separately — a program written against the general FS/FD interface works, unmodified, against many completely different underlying implementations, purely because they all present the same narrow \`open\`/\`read\`/\`write\`/\`close\` surface.`,
    related: ["mit6828-fs-inode-and-links", "mit6828-intro-file-descriptors"],
  },
  {
    id: "mit6828-fs-inode-and-links",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What implications of the file-descriptor/link API force a file to be represented as something distinct from any of its directory entries — the inode — and what two counts does an inode need to track?",
    back: `**Two implications of the API that, together, force a real design decision**: (1) **an fd refers to something that's preserved even if the file's name changes, or even if the file is deleted while still open** — a process holding an open fd must keep working correctly regardless of what happens to the *name* it originally used to open it. (2) **A file can have multiple links** — i.e., occur in **multiple directories** (or multiple names within one directory) simultaneously via \`link()\`, and critically, **no one of those occurrences is special** — there's no "original" name a file is more fundamentally tied to than any other.

**The consequence**: since no single directory entry is privileged, a directory entry **cannot** be where a file's actual content/metadata info is stored (which entry would you even update?) — **a file must exist independent of its names entirely**. This independent-of-names entity is called an **inode**.

**What an inode must track, beyond its content**: a **link count** — telling the filesystem when it's finally safe to reclaim the inode's storage (only once **no directory entry anywhere** still references it); and a count of **currently-open file descriptors** referencing it (satisfying implication (1) above — a file deleted while still open must not have its storage reclaimed while some process still holds it open). **Inode deallocation is deferred until both counts reach zero** — the link count *and* the open-FD count — exactly the mechanism that lets \`unlink()\`-while-open work correctly (the directory entry disappears immediately, but the underlying inode and its data persist until the last open fd is also closed).`,
    related: ["mit6828-fs-goals-and-api-choices", "mit6828-fs-ondisk-layout"],
  },
  {
    id: "mit6828-fs-ondisk-layout",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe xv6's on-disk layout (the sequence of regions), the on-disk inode's fields, how an inode number maps to a disk location, and how a directory's contents are structured.",
    back: `**xv6's on-disk layout** — the disk viewed as a linear array of 512-byte sectors, in order: **sector 0** — unused. **Sector 1** — the **superblock** (holding, e.g., the filesystem's size and \`ninodes\`, the total inode count). **Region 2** — an **array of inodes**, packed into blocks. Region **X** — a **block-in-use bitmap** (0 = free, 1 = in-use), one bit per data block. Region **Y** — the actual **file/directory content blocks**. Region **Z** — a **log**, used for transactions (related crash-recovery cards). Then the end of the disk. (Performance-wise, this linear-array view is a simplification — real disks have concentric tracks, relevant once seek/rotation costs matter, related later cards.)

**The on-disk inode's fields**: **type** (free, file, directory, or device); **nlink** (the link count, related card); **size**; and **\`addrs[12+1]\`** — twelve **direct** block-number entries (pointing straight at content blocks) plus one further entry pointing at an **indirect** block (itself an array of further block numbers) — extending how large a file can grow without needing every single block address to fit directly in the inode itself.

**Locating an inode on disk**: each inode has an **i-number**; converting an i-number to its actual on-disk location is simple arithmetic — **sector $2 + 64 \\times \\text{inum}$** (inodes are packed at a fixed size, so a given i-number's sector is directly computable, no separate lookup structure needed).

**Directory contents**: a directory is structured **much like an ordinary file** (its content lives in ordinary content blocks) — **except the user cannot write to it directly** (only through directory-modifying system calls like \`link\`/\`unlink\`, never raw \`write\`). A directory's content is an **array of \`dirent\`s**, each holding an **inum** and a **14-byte file name**; a \`dirent\` is considered **free** whenever its \`inum\` field is **zero**.

**The overall mental model**: view the filesystem as an **on-disk data structure** — a tree of directories, inodes, and blocks — governed by **two independent allocation pools**: inodes, and data blocks, each with its own free/in-use tracking (the inode array's free entries, and the block bitmap, respectively).`,
    related: ["mit6828-fs-inode-and-links", "mit6828-fs-create-trace"],
  },
  {
    id: "mit6828-fs-create-trace",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through xv6's actual disk writes when creating a file ('echo > a'), and explain the concurrent-ialloc correctness question this raises.",
    back: `**The traced writes for \`echo > a\`** (each logged as \`log_write <sector> <op>, from <caller>, from <caller's caller>\`): \`log_write 4 ialloc (44, from create 54)\` — allocate a fresh inode, updating the inode-region sector holding it. \`log_write 4 iupdate (44, from create 54)\` — write the newly-allocated inode's own fields (type, nlink, size) to disk. \`log_write 29 writei (47, from dirlink 48, from create 54)\` — write to sector 29, which is the **directory's own content block** — this is \`writei\` writing the **new \`dirent\`** (linking the new file's inum into its parent directory) into the directory's data. \`log_write 2 iupdate\` — a **second** \`iupdate\`, this time updating sector 2 — the **parent directory's own inode** (its \`size\` field grows to reflect the newly-appended directory content).

**Why *two* \`iupdate\`s, on two different inodes**: the first \`iupdate\` persists the **new file's** own inode fields; the second \`iupdate\` persists the change to the **directory's** inode (specifically its size, since the directory's content — where the new \`dirent\` now lives — just grew). Two logically distinct inodes are modified by one \`create\`, so two separate inode writes are needed.

**The concurrent-\`ialloc\` question**: if two processes call \`create\` at nearly the same time, will they get the **same** inode number (a genuine correctness bug, corrupting both files)? xv6 avoids this via the buffer-cache's own locking discipline — \`ialloc\` uses \`bread\`/\`bwrite\`/\`brelse\` (related card) to read, modify, and release the relevant on-disk-bitmap-holding buffer, and the buffer cache's **\`B_BUSY\`** flag plus **\`sleep()\`**-based waiting (mirroring this course's own Lecture 8 sleep/wakeup material, related concept) ensures only one caller at a time can be examining/modifying that buffer — so two concurrent \`ialloc\` calls are automatically **serialized** through the shared, locked in-memory buffer representing the on-disk allocation bitmap, never both seeing the same "free" inode simultaneously.`,
    related: ["mit6828-fs-ondisk-layout", "mit6828-fs-write-and-delete-trace"],
  },
  {
    id: "mit6828-fs-write-and-delete-trace",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Trace xv6's disk writes for appending data to a file and for deleting a file, and explain the recurring pattern of paired iupdate calls.",
    back: `**Writing data — \`echo x > a\`** (appending content to an existing, now-empty file \`a\`): \`log_write 28 balloc (43, from bmap 46, from writei 47)\` — allocate a fresh **data** block (distinct from \`ialloc\`, which allocates *inodes* — this is the separate block-allocation pool, related card), updating the block-bitmap sector. \`log_write 417 bzero\` — zero the newly-allocated block before use (never expose leftover, potentially-sensitive old disk content to a new file). \`log_write 417 writei\` — write the actual "x" content into that block. \`log_write 4 iupdate\` — persist the inode's **size** and **\`addrs[]\`** change (now pointing at the new block). \`log_write 417 writei\` (again) / \`log_write 4 iupdate\` (again) — a second content write plus a second inode update, reflecting the trailing newline \`echo\` also writes as a separate operation.

**Deleting a file — \`rm a\`**: \`log_write 29 writei\` — writing sector 29, the **parent directory's** content block, to **erase the \`dirent\`** (setting its \`inum\` to 0, related card). \`log_write 4 iupdate\` — update the file's own inode (decrementing \`nlink\`). \`log_write 28 bfree\` — free the data block back to the bitmap. \`log_write 4 iupdate\` (again) — a further inode update reflecting the now-empty state (size 0, no more \`addrs[]\` entries) once the block is actually freed.

**The recurring pattern — why so many \`iupdate\` calls throughout**: essentially every structural change to a file's content or metadata (a new block, a freed block, a changed size, a changed link count) requires **persisting the inode itself** afterward, since the inode is the authoritative on-disk record of a file's current state — any operation that touches more than one inode-tracked property in sequence naturally produces multiple \`iupdate\` calls, one per point where the in-memory inode state has changed and needs to be made durable.`,
    related: ["mit6828-fs-create-trace", "mit6828-fs-buffer-cache-and-scheduling"],
  },
  {
    id: "mit6828-fs-buffer-cache-and-scheduling",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "When does xv6 actually write user data to disk (the writei/bwrite/iderw chain), why might FIFO disk scheduling not be the best policy, and what's the performance concern with the buffer cache's 'double copy of I/O'?",
    back: `**The write chain, and when a disk write genuinely happens**: \`writei\` (write to an inode's content) calls \`bwrite\` (mark a buffer dirty / start its disk write) which calls **\`iderw\`** — the actual IDE-disk driver entry point (Lecture 6's device-driver material, related concept), which **sleeps** (Lecture 8's sleep/wakeup, related concept) until the real hardware transfer completes. So: user data isn't durably on disk merely because \`write()\` returned — it's durable only once this full chain has actually run and the disk hardware has confirmed the transfer.

**Disk scheduling — is FIFO obviously right?** When several processes' requests are queued (\`iderw\` appends to \`idequeue\`; \`idestart\` looks at the **head** of that list; \`ideintr\` pops the head and starts the next — so requests are served **FIFO**, related Lecture 6 concept), is strict first-in-first-out actually the best policy? The lecture raises this as an open question, not a settled one: should **interactive** programs' requests get priority over batch ones? Should requests be reordered by an **elevator-sort**-style algorithm (servicing requests in disk-position order, minimizing physical seek distance, rather than arrival order) instead? FIFO is simple but not obviously optimal for either latency-sensitive interactive use or raw throughput.

**The "double copy of I/O" performance concern**: data makes **two** separate copies on its way from disk to an application — first **disk → buffer cache** (the kernel's own in-memory cache of disk blocks), then **buffer cache → user space** (copying from the kernel's cache into the requesting process's own memory, satisfying the syscall-interface design principle from Lecture 3, related concept, that the kernel never simply hands out a shared pointer into its own data structures). This raises a genuine question the lecture poses directly: can this be fixed to improve performance (e.g. some form of zero-copy I/O, avoiding the second copy)? And relatedly: **how much RAM should be dedicated to disk buffers** at all — more buffer-cache RAM improves hit rates and reduces actual disk traffic, but competes with memory that could otherwise serve application/user needs directly, a genuine system-wide resource-allocation tradeoff.`,
    related: ["mit6828-fs-write-and-delete-trace", "mit6828-conc-locks-and-critical-sections"],
  },

  // --- Lecture 10: Crash Recovery, Logging ---
  {
    id: "mit6828-fs-crash-recovery-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is crash recovery, and using the create/write examples, show why some 'half-finished' states are disastrous while others are merely harmless.",
    back: `**What crash recovery means**: you're writing to the file system; the power fails mid-operation; you reboot — **is your file system still usable?**

**The main problem**: a crash occurring **during a multi-step operation** can leave the filesystem's own internal invariants **violated** — since a single logical operation (like \`create\`, related card) actually requires *several* separate disk writes, a crash between two of them can leave disk state that no complete, correctly-sequenced operation would ever have produced — potentially leading to serious FS corruption.

**Worked example — \`create\`** (new dirent + newly-allocated file inode, related card): if a crash leaves a **dirent pointing at a *free* inode** — **disaster!** — some later operation could allocate that "free" inode for an entirely unrelated new file, while the old dirent still names it, creating aliasing/corruption between two logically unrelated files. By contrast, a crash leaving an inode marked **allocated but not actually referenced by any dirent yet** is **not so bad** — it merely wastes a small amount of space (a "leaked" inode) without threatening any *other* file's correctness.

**Worked example — \`write\`** (new content block + updated \`inode.addrs[]\`/indirect block + block-free bitmap, related card): if a crash leaves an **inode referring to a block the free-bitmap still marks as free** — **disaster!** — that block could subsequently be allocated to some *other* file, and now two different files' inodes both claim the same physical block, corrupting whichever one loses the race. A crash leaving a block **allocated in the bitmap but not yet referenced by any inode** is, again, **not so bad** — merely a leaked block, not a correctness-threatening aliasing bug.

**The general pattern across both examples**: the *dangerous* half-finished states are specifically the ones where a **reference** exists to something not-yet-properly-established (a dirent pointing at a free inode, an inode pointing at a free block) — a **dangling-reference-style** bug (echoed explicitly in the next lecture's own framing, related card) — while the *safe* half-finished states are the ones where something is merely **allocated-but-unreferenced**, a leak rather than a corruption.`,
    related: ["mit6828-fs-create-trace", "mit6828-fs-recovery-goals-and-fail-stop"],
  },
  {
    id: "mit6828-fs-recovery-goals-and-fail-stop",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the three things you can reasonably hope crash recovery guarantees, and the simplifying 'fail-stop disk' assumption this course's recovery designs rely on.",
    back: `**Three things worth hoping for, after rebooting and running recovery code**: (1) **FS internal invariants are maintained** — e.g., no block is simultaneously on the free list *and* referenced by some file (exactly the dangerous case from the previous card). (2) **All but the last few operations are preserved on disk** — data written well before the crash should survive; a user might reasonably have to re-check or redo only the very last handful of operations, not lose everything. (3) **No order anomalies** — concretely, \`echo 99 > result; echo done > status\` should never leave \`status\` containing "done" while \`result\` does *not* yet contain 99 — i.e., recovery must never expose an *effect* without its corresponding *cause* having also survived, even though the two operations were logically sequential in the user's own script.

**The simplifying "fail-stop disk" assumption**: the disk **executes exactly the writes the FS sends it, and does nothing else** — it might fail to perform the **very last** write in flight when power is lost, but critically: **no wild writes** (it never corrupts *unrelated* sectors it wasn't told to touch) and **no decay of sectors** (previously-written data doesn't spontaneously corrupt on its own). This assumption is what makes reasoning about crash recovery tractable at all — real disks can, in fact, violate parts of this idealization (related Lecture 11 card on disk write-reordering/"lying" caches), which is exactly why some of the trickiest correctness bugs discussed later in this lecture sequence arise from that gap between the idealized fail-stop model and real hardware behavior.

**The framing that sets up the rest of the lecture — correctness and performance often conflict**: **safety** pushes toward writing to disk **as soon as possible** (minimizing the window in which unwritten data could be lost); **speed** pushes toward **not** writing the disk promptly (batching writes, using a write-back cache, sorting by track) — the entire rest of this lecture (and the next) is organized around **two different approaches** to this tension: **synchronous metadata update** (safety-first, related cards) and **logging/journaling** (aiming for both, related cards).`,
    related: ["mit6828-fs-crash-recovery-problem", "mit6828-fs-synchronous-metadata-update"],
  },
  {
    id: "mit6828-fs-synchronous-metadata-update",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the synchronous metadata update approach to crash recovery, and give the correct write ordering for file creation, file deletion, and (conceptually) rename.",
    back: `**The core idea**: most dangerous crash states look like **dangling references** (related card) — an inode pointing at a free block, a dirent pointing at a free inode. The fix: **always initialize something *on disk* before creating any reference to it** — implemented via **synchronous writes**: issue the initializing write, **wait for it to fully complete**, and **only then** issue the write that creates the reference to it. This is an old, simple — though, as the lecture goes on to show, slow and incomplete — approach to crash recovery.

**File creation — the correct order**: (1) **mark the inode as allocated** (on disk); **then** (2) **create the directory entry** referencing it. Reversing this order would risk exactly the dangling-dirent disaster from the previous card.

**File deletion — the correct order**: (1) **erase the directory entry** first; (2) **erase the inode's \`addrs[]\`** and mark it free; (3) **mark its data blocks free**. Erasing the *reference* (the dirent) before freeing the thing it referenced ensures no dangling reference can ever be observed mid-deletion, mirroring the creation ordering in reverse.

**Rename (\`mv d1/x d2/y\`, not implemented in xv6, but instructive)**: moving a file **between directories** requires (1) creating the **new** dirent and (2) erasing the **old** one — but in which order? "Create then erase" is identified as **probably the safest** choice — a crash between the two steps leaves the file reachable via **both** old and new names simultaneously (a relatively benign anomaly — a leaked *extra* reference, not a dangling one) rather than potentially unreachable via **either** name if erase happened first and a crash struck before create completed.`,
    pitfall:
      "The 'create then erase' rule for rename isn't arbitrary — it's a direct application of the same principle as file creation/deletion ordering: always ensure a NEW reference exists before removing the OLD one, so that a crash mid-operation leaves the file over-referenced (safe, just a minor cleanup needed) rather than under-referenced or unreferenced (a genuine correctness problem).",
    related: ["mit6828-fs-recovery-goals-and-fail-stop", "mit6828-fs-sync-update-recovery-and-cost"],
  },
  {
    id: "mit6828-fs-sync-update-recovery-and-cost",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What must synchronous-metadata-update recovery (fsck) actually do at reboot, and why is this approach both slow in normal operation and slow to recover?",
    back: `**What's actually true after a crash+reboot, under synchronous metadata updates**: all **completed** system calls are guaranteed visible on disk (each one's writes were fully synchronous before it returned). The **reachable** part of the filesystem will be **mostly correct** — with one specific exception: an **interrupted rename** can leave a file visible under **both** its old and new names simultaneously (related card). And **blocks and inodes may be left unreferenced but not marked free** — i.e., genuine leaks are possible (the "not so bad" half-finished states from earlier, related card), even though no dangling-reference corruption is possible.

**What recovery (\`fsck\`) must therefore do**: find and **free** any unreferenced inodes/blocks — concretely, by **descending the entire directory tree from the root**, remembering every i-number and block number actually **seen** (reachable) along the way, and marking **everything else** free. It must also, in general, essentially **punt** on properly resolving an interrupted \`rename\` (the dual-visibility anomaly isn't something a simple reachability scan alone can cleanly undo).

**Historical note**: many kinds of UNIX used purely synchronous metadata writes, with this style of \`fsck\`-based recovery, until roughly a decade before this lecture was given — i.e., this was the dominant real-world approach for a long time, not merely a textbook simplification.

**The severe performance problems this approach has, in both directions**: **very slow during normal operation** — since *every* metadata write must be synchronous (wait for completion before issuing the next), creating a file and writing a few bytes costs roughly **8 separate writes** (\`ialloc\`, init inode, write dirent, alloc data block, add block to inode, write data, set length in inode, and one further mystery write) — each write taking roughly a full disk-rotation time (~10ms), totaling **~80ms per file creation**, meaning the system can create only **about a dozen small files per second** (genuinely crippling for anything like \`untar\` or \`rm -rf\` on a large tree). **Very slow during recovery too**: descending the whole directory hierarchy can require a random disk read per inode — for a concrete real-world data point cited directly, \`fsck\` took **10 minutes on a 70GB disk with 2 million inodes**, even while reading many inodes sequentially rather than seeking randomly (i.e., this is close to the *best* achievable case for that approach, not a worst case) — this dual cost (slow always, slow to recover) is exactly what motivates moving to logging (related cards) instead.`,
    related: ["mit6828-fs-synchronous-metadata-update", "mit6828-fs-writeback-cache-problem"],
  },
  {
    id: "mit6828-fs-writeback-cache-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why doesn't simply adding a big write-back disk cache safely fix synchronous-update's performance problem? Walk through the unlink()-then-create() example showing what can go wrong.",
    back: `**The tempting fix**: RAM is cheap, and disk sequential throughput is high (~50MB/sec) — why not just use a **big write-back cache**: operations **only** modify an in-memory disk cache (no actual disk write at the time), so \`creat()\`, \`unlink()\`, \`write()\`, etc. all return almost immediately; dirty buffers get written to disk **later** (e.g. writing the least-recently-used dirty block whenever the cache fills, or flushing all dirty blocks periodically, e.g. every 30 seconds, to bound how much could be lost in a crash) — this is, in fact, how the older Linux **EXT2** filesystem actually worked.

**A pointed question the lecture asks directly**: would a write-back cache even improve *performance*, exactly? After all, you have to write the data to disk **eventually** anyway — so what's actually gained? (The answer, developed further in Lecture 11's write-absorption material, related card: **batching** and **write absorption** — many logically-separate small updates to the *same* block, over a short window, collapse into a single eventual disk write, rather than each individually forcing its own synchronous round-trip.)

**What can go wrong — a worked \`unlink()\`-then-\`create()\` race against a crash**: start with an existing file \`x\`, safely on disk. One user runs \`unlink(x)\`: (1) delete \`x\`'s dir entry **[**]**; (2) put its blocks in the free bitmap; (3) mark \`x\`'s inode free. **Another** user then runs \`create(y)\`: (4) allocate a (now-)free inode — possibly the **very one** \`x\` just freed; (5) initialize that inode as in-use and zero-length; (6) create \`y\`'s directory entry **[**]**. All six of these writes initially land **only** in the buffer cache. Suppose **only** the two starred (\`**\`) writes — the dirent removal and the dirent creation — happen to get forced to disk before a crash (a perfectly plausible outcome under an LRU or periodic write-back policy, since these two "look independent" to a cache eviction policy that has no notion of the underlying correctness ordering). **The problem**: disk now shows \`x\`'s dirent gone and \`y\`'s dirent present and pointing at the recycled inode — but the *actual initialization* of that inode as \`y\` (step 5) never made it to disk. The result is exactly the dangerous dangling/aliased-reference corruption the synchronous-write ordering was specifically designed to prevent — silently reintroduced by write-back caching, since a cache eviction policy has no idea which writes' *relative order* actually mattered for correctness. And critically: **can \`fsck\` even detect this?** Not necessarily cleanly — the disk state doesn't obviously look "wrong" in the way a dangling reference from a naive crash mid-\`create\` would.

**The real lesson**: a write-back cache alone, with no additional bookkeeping, breaks the very safety property synchronous writes existed to guarantee — what's actually needed is a way to write **only to cache** (for speed) while somehow still **remembering the relationships among writes**, e.g. "don't ever let write #1 reach disk without #2 and #3 also having reached disk" — exactly the problem **logging** (related cards) is designed to solve.`,
    pitfall:
      "It's tempting to think a write-back cache is 'strictly better' than synchronous writes as long as SOME writes eventually reach disk — the unlink()/create() example shows this is false: an eviction/flush policy that has no notion of which writes were correctness-ordered relative to each other can persist a LATER write while losing an EARLIER one it causally depended on, reintroducing exactly the dangling-reference corruption synchronous ordering was built to prevent.",
    related: ["mit6828-fs-sync-update-recovery-and-cost", "mit6828-fs-logging-basic-idea"],
  },
  {
    id: "mit6828-fs-logging-basic-idea",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State logging's three goals, define 'transaction,' and describe the basic write-ahead-log algorithm and its recovery rule.",
    back: `**Logging (== journaling) — the most popular solution to the tension between correctness and performance.** Three goals, stated directly: **atomic system calls with respect to crashes** (a system call's writes happen either entirely, or not at all — never partially); **fast recovery** (no hour-long \`fsck\`, related card); and **the speed of a write-back cache for ordinary operations** (i.e., actually deliver the performance a write-back cache promises, without reintroducing the correctness problem from the previous card).

**Transaction, defined**: you want **atomicity** — all of a system call's writes, or none — call an atomic operation a "**transaction**."

**The basic write-ahead-log algorithm**: (1) **record, in the log, all the writes the system call *will* do** (not yet applied to their real, final on-disk locations — just recorded, sequentially, in a separate log area). (2) **Then record "done"** in the log, marking the transaction as fully recorded and ready. (3) **Then actually do the writes**, to their real, final on-disk locations.

**On crash + recovery**: **if "done" is present** in the log for a given transaction, **replay all the writes recorded in the log** (re-applying them to their real locations — safe and idempotent to do even if some or all of them had *already* been applied before the crash, since replaying a write that already landed is harmless). **If "done" is *not* present**, **simply ignore that transaction's log entries entirely** — the crash happened before the transaction was fully committed, so it's exactly as if the transaction never started at all (which is a **correct**, safe outcome for atomicity, even though it means the corresponding system call's effects are lost — the caller, in general, cannot yet have observed those effects as durable if "done" was never written).

**Why "write-ahead"**: because the writes are recorded in the log **before** ("ahead of") they're applied to their real, final locations — the log is the durable record of intent, and the real on-disk locations are only ever updated *after* that intent has itself been safely, atomically committed.`,
    related: ["mit6828-fs-writeback-cache-problem", "mit6828-fs-xv6-log-implementation"],
  },
  {
    id: "mit6828-fs-xv6-log-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe xv6's simple logging API (begin_trans/log_write/commit_trans) and exactly what each step does, plus the recovery procedure.",
    back: `**xv6's simple logging, structurally**: a syscall wraps its writes as: \`begin_trans(); bp = bread(); bp->data[] = ...; log_write(bp); /* more writes ... */ commit_trans();\`.

**\`begin_trans()\`**: since a transaction is a *group* of writes that must all-or-nothing succeed together, something must **indicate which group** of writes belongs to the same transaction — xv6 does this via a **lock**, allowing **only one transaction at a time** system-wide (a real limitation, related card on xv6's logging problems).

**\`log_write(bp)\`**: **records the sector number**, **appends the buffer's content to the log** (on disk, in the reserved log region, related card) — but critically, **leaves the actually-modified block in the (in-memory) buffer cache without yet writing it to its real, final location**. This is exactly the write-ahead discipline (related card): the log gets the durable copy first; the real location is untouched for now.

**\`commit_trans()\`**: (1) **records "done" and the list of sector numbers** in the log's header block — this is the atomic commit point: once this single write completes, the whole transaction is durably "will happen." (2) **Does the (real) writes** — now actually applying each logged block to its true, final on-disk location. (3) **Erases "done"** from the log (marking the transaction's log space as reusable — related card on freeing log space).

**Recovery, on reboot after a crash**: **if the log says "done"** (for whichever transaction is recorded there), **copy the blocks from the log to their real locations on disk** — i.e., exactly replay step (2) above, which is safe to do (or redo) regardless of how far step (2) had already gotten before the crash.

**A worked concrete trace** (from the lecture's own homework example, \`rm README\`): a sequence of \`bwrite\` calls to the **log's** sectors (1015–1017, holding the transaction's recorded \`writei\`/\`iupdate\`/\`bfree\` operations), then a \`bwrite\` to **sector 1014 — the log header — marked as the commit point**, *then* a sequence of \`bwrite\`s to the **real** locations (sector 29 — dir content; sector 2 — root/file inodes; sector 28 — free bitmap), and finally another \`bwrite\` to sector 1014 to **erase the transaction** — concretely tracing the exact same "log first, commit, then apply, then erase" sequence the algorithm describes abstractly.`,
    related: ["mit6828-fs-logging-basic-idea", "mit6828-fs-xv6-logging-problems"],
  },
  {
    id: "mit6828-fs-xv6-logging-problems",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Enumerate the specific performance problems with xv6's logging implementation, setting up why a faster design (ext3, next lecture) is needed.",
    back: `xv6's logging solves the *correctness* problem (atomicity across crashes) but is explicitly flagged as still **slow** — several distinct, compounding issues:

**Only one transaction at a time**: xv6's single global lock (related card) means **two unrelated system calls**, even ones modifying completely **different parts of the filesystem**, cannot proceed concurrently at all — a strictly worse concurrency story than even ordinary file-level or inode-level locking would allow.

**Huge log traffic — whole blocks logged even for a tiny change**: creating a file might dirty only a few dozen bytes across its affected blocks, but \`log_write\` logs the **entire block** each time — producing many kilobytes of log writes for what's conceptually a small change.

**Eager, synchronous writes to *both* the log *and* the real location**: the log write happens **synchronously** (each write costs roughly one disk rotation) — slow. Then \`commit_trans\` performs the **real** writes **synchronously to their home locations right after committing** — i.e., writes are effectively **write-through, not write-back** — meaning xv6's logging makes surprisingly **poor use of the in-memory disk cache** it otherwise has available; **every block ends up written twice** (once to the log, once to its real location), for every single transaction.

**Trouble with operations that simply don't fit in the log's fixed size**: e.g. \`unlink()\` on a large file, while **truncating** it, might dirty **many** blocks at once (freeing many data blocks and updating the inode) — more than a fixed-size log region can necessarily accommodate for one transaction, a structural limitation the simple design doesn't have a clean answer for.

**The resulting overall verdict**: xv6's logging is safe, but genuinely slow in ways that matter for real workloads — setting up exactly the motivation for Lecture 11's detailed study of **Linux ext3**, a real, widely-deployed filesystem specifically engineered to fix each of these performance problems while keeping the same fundamental write-ahead-log correctness guarantee.`,
    related: ["mit6828-fs-xv6-log-implementation", "mit6828-fs-ext3-goals-and-structures"],
  },

  // --- Lecture 11: Linux ext3 crash recovery ---
  {
    id: "mit6828-fs-ext3-goals-and-structures",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What is ext3, and describe its four core structures (write-back cache, per-transaction block list, on-disk FS, on-disk circular log) and what's actually stored in each log record type.",
    back: `**What ext3 is**: Linux's **ext3** adds logging/journaling **on top of ext2** (an older, xv6-like filesystem with no logging at all) — this lecture is explicitly framed as "a case study of the details required to add logging to a file system," working through real engineering decisions (based on Stephen Tweedie's own 2000 talk on ext3's design) rather than a from-scratch idealized design. ext3 has multiple journaling *modes*; the lecture starts with "**journaled data**" mode, where the log contains **both** metadata **and** file content blocks.

**ext3's four structures**: an **in-memory write-back block cache** (genuinely write-back this time, unlike xv6's effectively-write-through approach, related card); an **in-memory, per-transaction list of blocks that need to be logged** (tracking exactly which cached blocks belong to the *currently open* transaction); the **on-disk filesystem** itself (the real, final home for data, exactly as in ext2/xv6); and an **on-disk circular log file** (a fixed-size, wraparound region — as opposed to xv6's simpler, presumably-non-circular log region).

**What's actually recorded in the ext3 log**: a **superblock** — the log's own header, recording its **starting offset** and **starting sequence number** (used for recovery, related card). **Descriptor blocks** — a **magic number**, a **sequence number**, and the **list of real block numbers** the following data blocks correspond to (since, unlike xv6's simpler header-holds-everything design, ext3 needs this mapping recorded alongside the data itself in the circular log). **Data blocks** — the actual logged content, as described by the preceding descriptor block. **Commit blocks** — a **magic number** and **sequence number**, marking a transaction's commit point (analogous to xv6's "done" marker, but now itself a full log record with its own integrity-checking fields, related card on the missing-checksum subtlety).`,
    related: ["mit6828-fs-xv6-logging-problems", "mit6828-fs-write-absorption"],
  },
  {
    id: "mit6828-fs-write-absorption",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does ext3 get good performance despite still logging entire blocks, via 'write absorption'? Describe the start()/get()/stop() API and what guarantee stop() does and does not provide.",
    back: `**The core performance trick — write absorption**: ext3 **batches many system calls per commit** (unlike xv6's one-transaction-per-syscall design, related card) and **defers actually copying a cached block into the log** until that transaction is about to **commit** — not at the moment each individual syscall modifies it. The payoff: if **multiple** system calls, within the same open transaction, happen to modify the **same** underlying block (e.g. repeated small changes to the same directory, inode, or bitmap block), only **one** copy of that block ultimately needs to be written into the log — many logical modifications "absorb" into a single physical log write, dramatically cutting log traffic relative to xv6's log-every-write-immediately approach.

**The API**: \`h = start()\` — begin participating in the current open transaction (or open a new one if none is currently open). \`get(h, block#)\` — "warn the logging system" that the caller is about to modify this cached block: this **adds the block to the current transaction's list of blocks to be logged**, and — critically — **prevents that block from being written to its real, final location until after the transaction commits** (protecting the write-ahead ordering, exactly mirroring xv6's own \`log_write\` intent, related card, just now decoupled from immediately copying the block's *content* into the log). The caller then **modifies the block in the (write-back) cache** as normal. \`stop(h)\` — signal that this system call's modifications are done.

**The critical, easy-to-miss guarantee**: taken together, \`start()\`/\`get()\`/\`stop()\` guarantee **all-or-nothing** atomicity for the calling system call's writes with respect to a crash. But **\`stop()\` does *not* itself cause a commit** — it merely finishes this *one* syscall's participation in the (still-open) shared transaction; the transaction as a whole commits later, on its own separate schedule (related card), potentially bundling many further syscalls' \`start()\`/\`get()\`/\`stop()\` sequences first. A final, practically important note: this design makes it **"pretty easy to add log calls to existing [ext2] code"** — \`get()\` calls can simply be inserted at each point ext2 already modifies a cached block, without needing to redesign the surrounding logic.`,
    pitfall:
      "Don't assume stop() commits a transaction — conflating 'this syscall's own writes are logically complete' with 'this data is now durable on disk' is exactly the kind of confusion ext3's batching design invites; a syscall can return successfully (stop() called) well before the transaction it participated in actually commits, which is precisely why fsync() (related card) exists as a separate, explicit durability request.",
    related: ["mit6828-fs-ext3-goals-and-structures", "mit6828-fs-ext3-transaction-commit"],
  },
  {
    id: "mit6828-fs-ext3-transaction-commit",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the lifecycle of an ext3 transaction (only one open at a time, but many syscalls join it) and the exact sequence of steps in committing it to disk.",
    back: `**One *open* transaction at a time — but not one syscall at a time**: while a transaction is "open," any number of **new syscall handles** (\`start()\` calls, related card) can join it, each remembering the block numbers it touches — a sharp contrast with xv6's single-global-lock, one-transaction-per-syscall design (related card). ext3 **commits the currently-open transaction every few seconds** (a periodic timer) **or on an explicit \`fsync()\`** call (related card) — whichever comes first.

**Committing a transaction to disk, step by step**: (1) **open a new transaction** immediately, so **subsequent** syscalls have somewhere to go (the system never has *zero* open transactions available to join). (2) **Mark the (old, about-to-commit) transaction as "done"** accepting new joiners. (3) **Wait for any still-in-progress syscalls** (ones that called \`start()\` but haven't yet called \`stop()\`) to finish — the lecture notes this might itself involve the log system starting to write some of their blocks, then waiting, then writing more, as those in-flight syscalls continue modifying data. (4) **Write descriptor blocks** to the on-disk log, listing the block numbers involved. (5) **Write each actual block** from the cache to the log on disk. (6) **Wait for all of those log writes to finish**. (7) **Append the commit record** — only *now*, after every one of the transaction's actual data blocks is confirmed durably in the log, is the commit marker itself written. (8) **Only now are the cached blocks allowed to go to their real home locations on disk** (though not *forced* there immediately — write-back, at the cache's own leisure, related card) — completing the write-ahead discipline (data safely logged and committed *before* it's ever allowed to reach its real, final location).`,
    related: ["mit6828-fs-write-absorption", "mit6828-fs-ext3-concurrency-correctness"],
  },
  {
    id: "mit6828-fs-ext3-concurrency-correctness",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Answer three concurrency-correctness questions for ext3: same-directory concurrent creates, a later syscall reading an earlier uncommitted syscall's result, and a syscall in a NEW transaction wanting to write a block that the PREVIOUS transaction is still writing to disk.",
    back: `**(a) Is the log correct under concurrent syscalls — e.g. concurrently creating "a" and "b" in the same directory?** The **inode lock** (protecting the shared directory being modified) prevents the race that would otherwise occur when two syscalls update the same directory block concurrently — ordinary locking, exactly as in xv6 (Lecture 6, related concept), still does its usual job *underneath* the logging layer. Genuinely **independent** work (touching different, unrelated blocks in the cache) can proceed **truly concurrently** — and if both syscalls happen to be part of the same open transaction, their updates simply **combine** into that one transaction (an instance of write absorption, related card, at the whole-syscall level, not just the single-block level).

**(b) What if syscall B reads syscall A's *uncommitted* result?** Concretely: could \`B\` (\`ls > y\`) somehow **commit before** \`A\` (\`echo hi > x\`), such that a crash reveals \`y\`'s content depending on \`x\`'s write without \`x\`'s write itself having survived — an order anomaly (Lecture 10's third recovery goal, related concept)? **Case 1**: both in the **same** transaction — fine, both or neither survive a crash together, no anomaly possible. **Case 2**: A is in transaction T1, B is in a **later** transaction T2 — fine, T1 (being earlier) must commit *before* T2 does, by construction. **Case 3**: B is in T1, **A** is in a *later* T2 — could B (in the earlier-committing T1) have already observably read/depended on A's (later) modification? **ext3 must wait for all operations in the previous transaction to finish before letting any operation into the next transaction's start** — specifically so that operations sealed into an *old*, already-closing transaction can never end up reading modifications made by operations that only belong to a *newer* one.

**(c) What if a syscall in transaction T2 (just opened) wants to write a block that T1 (the previous transaction) is *still in the process of* writing out to the log on disk?** T2's syscall **cannot be allowed to directly write the same buffer T1 is currently writing to disk** — if it did, the new syscall's write would effectively become **part of T1** from the disk's point of view, and a crash occurring **after T1 commits but before T2 does** would then wrongly expose T2's not-yet-committed update. The fix: **T2 gets its own, separate copy-on-write copy** of the block to modify going forward; **T1 holds onto (and keeps writing) its own old copy** to the log, undisturbed. This raises a natural follow-up — are there now genuinely **two** versions of the block sitting in the buffer cache simultaneously? **No** — only the **new** (T2's) version remains in the live buffer cache going forward; the **old** version exists only as T1's already-in-flight copy being written out to the log, not as a second entry the cache itself has to track. And does that old copy still need a separate write to the *real* FS location later? **No** — T2 will eventually write **its own** (newer) version to the real location when T2 itself commits, which already reflects everything T1's version did plus T2's further change — no separate write-out of T1's now-superseded copy is ever needed.`,
    related: ["mit6828-fs-ext3-transaction-commit", "mit6828-fs-ext3-recovery-and-log-space"],
  },
  {
    id: "mit6828-fs-ext3-recovery-and-log-space",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does ext3 recovery find the log's boundaries and decide what to replay, and when can a committed transaction's log space actually be freed?",
    back: `**What a crash can leave in the log**: a crash may interrupt the writing of the **last** transaction to the log — so the on-disk log may contain a bunch of **fully-written, complete** transactions, followed by, at most, **one partial** one at the very end. The disk may also have already written **some** of the buffer cache out to the real FS — but (per the write-ahead/commit-ordering discipline, related cards) only ever for **fully-committed** transactions, never for the interrupted final one.

**Recovery, step by step**: (1) **Find the start and end of the log**. The log **superblock** (at the start of the log file) records the starting **offset** and **sequence number** of the first transaction still needed. Recovery **scans forward** from there until it finds either a **bad record** or a record whose sequence number **isn't the expected next one** — that's the boundary; recovery then backs up to the **last complete commit record** actually found. (In effect: a crash during a commit means that **entire last, incomplete transaction is simply ignored** during recovery — exactly mirroring xv6's own "if no 'done', ignore the log" rule, related card, just now applied per-transaction within a circular, multi-transaction log rather than xv6's single fixed transaction slot.) A genuine ambiguity the lecture flags: how do you tell a **stale leftover** from a *previous* use of that log region (which would also carry some old, no-longer-relevant sequence number) apart from **file data that merely happens to look like** a valid descriptor block (i.e., its bytes coincidentally resemble the right magic number)? Both are real hazards a robust implementation must guard against. (2) **Replay all blocks through the last complete transaction**, in log order — applying each logged block to its real, final location, exactly as in xv6's simpler single-transaction replay.

**When can ext3 free a transaction's log space?** Only **after** that transaction's cached blocks have actually been written out to their real FS locations on disk — "free" concretely means **advancing the log superblock's start pointer/sequence number** past that transaction, so its log space becomes available for reuse by future transactions.

**A subtlety this creates**: what if a block that was part of transaction T1 gets **dirtied again** by a **later** transaction T2, while T1's own copy is still sitting in the log (not yet freed)? Recall (related card) that ext3 only performs its copy-on-write duplication **while T1 is actively committing** — so **after** T1 has fully committed, T2 dirtying that same block only touches the **single, shared cache copy** (no fresh duplication needed at that point) — meaning **T1 cannot yet be freed** until T2 *also* commits, since T1's still-logged copy is, in effect, the only durable record of what that block's *T1-committed* content was, and freeing it prematurely (before T2's own commit makes the block's *current* state durable through T2's own log entry) would leave a window with no durable copy of the block's state at all.`,
    related: ["mit6828-fs-ext3-concurrency-correctness", "mit6828-fs-ext3-reservations-and-durability"],
  },
  {
    id: "mit6828-fs-ext3-reservations-and-durability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the log-space deadlock risk when a syscall's writes don't fit in the remaining log space, ext3's reservation-based fix, and why ext3 is 'not as immediately durable as xv6'.",
    back: `**The deadlock risk**: suppose ext3 starts adding a syscall's blocks to the currently-open transaction T2, and only **partway through** realizes T2, as it now stands, **won't fit** in the remaining free log space. It **cannot commit T2** (the syscall isn't finished yet — committing an incomplete syscall's partial writes would violate atomicity). Can it instead **free up space** by finishing off and freeing the **oldest** still-logged transaction, T1? **Maybe not** — per the previous card's subtlety, T2 may itself have **already dirtied a block that T1's own log entry is still the only durable record of** — meaning T1 **can't yet be freed**, precisely *because* T2 (the very transaction stuck for lack of space) depends on it. This is a genuine **deadlock**: T2 needs space that only freeing T1 would provide, but freeing T1 depends on T2 itself finishing and committing.

**The fix — reservations**: a syscall **pre-declares, in advance, how many blocks of log space it might possibly need**, *before* it's allowed to actually start modifying anything. If insufficient free space is available for that declared reservation, the syscall is simply **blocked from starting at all** until enough space frees up (which may itself require committing the current open transaction and freeing an older one first) — but critically, this waiting happens **before** any partial, uncommittable work has begun, avoiding the deadlock entirely. This works specifically **because** reservations guarantee that **every syscall that has already been allowed to start is guaranteed to have enough space to complete and commit** — the deadlock scenario above specifically required a syscall to have started *without* that guarantee.

**ext3 is not as immediately durable as xv6**: because of transaction batching (commits happen every few seconds, or on \`fsync()\`, related card, not after every single syscall), a call like \`creat()\` can **return successfully** to its caller while the actual data is **not yet on disk** — a crash occurring in that window will **undo** it, even though the syscall itself already reported success. Applications that need a stronger guarantee must call **\`fsync(fd)\`**, which forces an immediate commit of the current transaction and **waits** for it to complete, at real, non-amortized cost. **Why not just commit after every syscall, always, to avoid this gap?** Because that would defeat the entire point of write absorption (related card) — many more, smaller transactions would each need their own full commit sequence, costing roughly **10ms per syscall** (dominated by disk-rotation-scale costs) rather than the effectively **near-zero** amortized cost batching achieves for the common case of syscalls that don't need synchronous durability. (The lecture flags this specific tension — applications that use \`fsync()\` heavily don't get to enjoy ext3's batching benefits at all — as exactly the problem the next lecture's material, "Rethink the Sync," is designed to address.)`,
    related: ["mit6828-fs-ext3-recovery-and-log-space", "mit6828-fs-ext3-ordering-hazards"],
  },
  {
    id: "mit6828-fs-ext3-ordering-hazards",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe two further ext3 correctness subtleties: the missing-checksum/disk-reordering hazard, and why 'ordered mode' is needed even though journaling file content is otherwise avoidable.",
    back: `**Hazard 1 — no checksum in the ext3 commit record, combined with disks that reorder or lie about writes**: real disks commonly have their own internal write caches and **reorder** writes for performance — and this reordering behavior is "usually hard to turn off" ("the disk lies" about what's actually been durably written, and when) — people often leave it enabled purely for speed, sometimes without fully realizing the risk. **Bad news specifically for ext3's design**: if the disk happens to write the **commit block** to its final location **before** the preceding descriptor/data blocks it's supposed to certify are actually durable, then **recovery** (related card, which trusts "if the commit record is present, the transaction is complete and safe to replay") will **replay "descriptor" blocks that may actually still hold random, stale, or unrelated leftover content** — and write that **garbage** to the FS's real locations, since nothing in ext3's design (as described) **checksums** the log's content to detect this specific failure mode. (The lecture notes this is exactly what a later filesystem, **ext4**, specifically adds — a checksum — to close.)

**Hazard 2 — "ordered mode": why journal metadata but not necessarily file content, and the correctness gap that creates**: journaling **content** blocks (not just metadata) is slow — it doubles every data write (once to the log, once to the real location, related Lecture 10 card on xv6's identical cost) — and this lecture argues it's often **not actually needed** just to keep the filesystem's own **internal** structures consistent (metadata-only journaling is enough for *that* narrower goal). **But naively skipping content journaling entirely is unsafe**: if **metadata** commits (e.g. an inode now points at a newly-allocated block) **before** the corresponding **content** write has actually landed on that block, a crash in between can leave the file pointing at a block still containing **someone else's old data** — a real information-leak/corruption bug, not merely an internal-consistency one. **ext3's "ordered mode" fix**: write the **content** block to disk **before** committing the **metadata** (the inode update referencing that new block number) — so a crash can never expose a metadata-committed reference to not-yet-written content; if the crash happens before the content write, the metadata update (which depends on it) hasn't committed either. This is the mode "most people use" in practice — a deliberate middle ground between full content-journaling's cost and pure metadata-journaling's exposure to stale-data leaks.

**Two further correctness challenges specifically within ordered mode, both requiring dedicated fixes**: **(A)** \`rmdir\`, followed by **reusing** that freed block for an ordinary file, followed by an ordered content write of that file, with a **crash before the \`rmdir\` or the write actually commits** — the file's *content* write may have already **scribbled over** what's still, from the not-yet-committed log's perspective, "the directory block." **Fix**: **defer actually freeing** a block until the freeing operation itself has been forced to the log on disk — closing the window during which the block could be prematurely reused for unrelated content. **(B)** \`rmdir\`, commit, **reuse** that block in a file, an ordered content write, commit — then a **crash**, followed by recovery **replaying** the earlier (already-committed, but still-present-in-the-circular-log) \`rmdir\` record: the file can end up left holding **stale directory content** (e.g. leftover \`.\`/\`..\` entries) that a naive blind-replay would reintroduce. **Fix**: **revoke records** — an explicit mechanism that tells recovery "do **not** replay any log entry for this specific block number," specifically to suppress exactly this kind of stale-replay-of-an-already-superseded-operation hazard.`,
    related: ["mit6828-fs-ext3-reservations-and-durability", "mit6828-fs-ext3-orphan-inodes"],
  },
  {
    id: "mit6828-fs-ext3-orphan-inodes",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Walk through the 'open a file, then unlink it while still open, then crash' problem, and describe ext3's on-disk orphan-inode-list fix.",
    back: `**The scenario**: a process **opens** a file, then **\`unlink\`s** it while the fd is still open (Lecture 9's inode/link-count material, related card: this is legal — the directory entry is removed immediately, but the underlying inode and its data blocks are **not actually freed** until the last open fd is also closed). The \`unlink\` **commits** to the log (its dirent-removal part is done and durable) — but since the file is still open, the *deferred* deallocation (freeing the inode and its blocks, which is only supposed to happen once the fd finally closes) hasn't happened yet, and — by design — isn't logged as part of the \`unlink\` transaction at all. Now suppose a **crash** occurs before the process ever gets around to closing that fd.

**Why this is a genuine problem, not a minor leak**: on reboot, there's **nothing interesting left in the log to replay** regarding this file (the deferred free was never logged, since it hadn't happened yet at commit time) — but the inode and its blocks are now **neither on the free list** (they were never freed) **nor reachable by any directory entry anywhere** (the dirent was already removed and that removal *did* commit) — they are **permanently leaked**, with **no** recovery mechanism as described so far able to ever notice or reclaim them. This is a structurally different failure than ordinary "leaked inode from an interrupted create" (related Lecture 10 card) — an ordinary \`fsck\`-style reachability scan could find *that* kind of leak, but this scenario produces leaks that are invisible to *any* purely-reachability-based scan, since the leak's very existence depends on in-memory, not-yet-logged process state (an open fd) that recovery has no way to reconstruct after a crash.

**ext3's fix — an on-disk "orphan inode" linked list**: maintain an explicit, **on-disk linked list** of inodes that are "pending deletion whenever someone eventually gets around to it" — rooted at (pointed to by) the **filesystem superblock**. When \`unlink()\` removes the last directory reference to a still-open file, ext3 **adds that inode to this orphan list** — and, critically, this addition is itself **committed as part of the very same journaled transaction** as the \`unlink\`'s directory-entry removal, so the two facts ("dirent gone" and "inode is now an orphan pending cleanup") are always durably consistent with each other, never one without the other. **Recovery**, on reboot, explicitly **walks this orphan list** and **completes** any pending deletions it finds there — turning what would otherwise be an invisible, permanent leak into an ordinary, recoverable piece of deferred cleanup work that survives a crash correctly.`,
    related: ["mit6828-fs-ext3-ordering-hazards", "mit6828-fs-inode-and-links"],
  },
];
