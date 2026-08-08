import type { Card } from "./types";

const MODULE = "linear-structures";

export const linearStructuresCards: Card[] = [
  // ---------------------------------------------------------- Static array
  {
    id: "linear-structures-static-array",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a static array achieve O(1) indexing, physically?",
    back: `A static array is a single contiguous block of memory, one element after another. The address of element $i$ is computed directly: $\\text{base\\_address} + i \\times \\text{element\\_size}$ — a single multiplication and addition, regardless of $n$ or $i$. That's why indexing is $O(1)$: there's no traversal, just arithmetic.

Contiguity also gives arrays excellent **cache locality**: reading \`arr[i]\` pulls a whole cache line (typically 64 bytes) into cache, so nearby elements (\`arr[i+1]\`, \`arr[i+2]\`, ...) are likely already cached by the time you access them. Sequential array scans are dramatically faster in practice than their Big-O alone suggests, compared to structures like linked lists that scatter nodes across memory.

The cost of contiguity: a static array's size is fixed at allocation — growing it means allocating a new block and copying everything over (see Dynamic Arrays).`,
    complexity: {
      structure: "Static Array",
      operations: [
        { op: "Access by index", time: "O(1)" },
        { op: "Search (unsorted)", time: "O(n)" },
        { op: "Insert/delete at end", time: "O(1)", note: "if capacity allows; array is fixed-size" },
        { op: "Insert/delete at arbitrary index", time: "O(n)", note: "must shift subsequent elements" },
      ],
    },
    pitfall:
      "Cache locality is a constant-factor effect invisible to Big-O — two O(n) algorithms can differ by 10x+ in wall-clock time purely based on memory access pattern, which is why 'asymptotically equal' doesn't mean 'equally fast in practice.'",
    related: ["linear-structures-array-vs-linked-list"],
  },

  // --------------------------------------------------------- Dynamic array
  {
    id: "linear-structures-dynamic-array",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a dynamic array, and how does it grow?",
    back: `A dynamic array (Python \`list\`, C++ \`std::vector\`, Java \`ArrayList\`) wraps a static array with automatic resizing: it tracks a **capacity** (allocated size) separate from its **length** (elements in use). Appending when \`length < capacity\` is a plain $O(1)$ write. When \`length == capacity\`, it allocates a new, larger backing array (typically **doubling** the capacity), copies all existing elements over, then appends.

That occasional $O(n)$ copy is why a single append is $O(n)$ in the worst case — but averaged over a sequence of appends, it's $O(1)$ amortized (see the aggregate-method proof in the Complexity & Analysis module). This is the data structure that motivates amortized analysis as a concept in the first place.`,
    complexity: {
      structure: "Dynamic Array",
      operations: [
        { op: "Access by index", time: "O(1)" },
        { op: "Append", time: "O(1) amortized", note: "O(n) worst case, on resize" },
        { op: "Insert/delete at arbitrary index", time: "O(n)" },
        { op: "Insert/delete at end", time: "O(1) amortized" },
      ],
    },
    related: ["linear-structures-doubling-growth-factor", "complexity-analysis-aggregate-method"],
  },
  {
    id: "linear-structures-doubling-growth-factor",
    tier: 1,
    module: MODULE,
    type: "compare",
    front:
      "Why does a dynamic array double its capacity on resize instead of growing by a fixed increment?",
    back: `**Doubling (geometric growth)**: resizes happen at sizes $1, 2, 4, 8, ..., n$ — $O(\\log n)$ resizes total, and the total copying work across all resizes is $1+2+4+\\cdots+n < 2n = O(n)$ for $n$ appends. Amortized cost per append: $O(1)$.

**Fixed increment (e.g. always add 10 slots)**: resizes happen every 10 appends — $O(n/10) = O(n)$ resizes total, and the $k$-th resize copies $O(k \\cdot 10)$ elements, so total copying work is $O(1+2+\\cdots+n/10) \\times 10 = O(n^2)$. Amortized cost per append: $O(n)$ — no better than always inserting into a fixed-size array from scratch.

The qualitative difference: doubling makes each resize's cost *proportional to the work already done* (so the geometric series stays bounded by $O(n)$ total), while a fixed increment makes resize *frequency* scale linearly with $n$ while each resize still copies a growing array — that combination is what blows up to $O(n^2)$.`,
    pitfall:
      "The exact growth factor (2x, 1.5x, golden ratio ~1.618x) doesn't affect the asymptotic O(1) amortized bound — any constant factor > 1 works — but it does trade off wasted memory (higher factor = more unused capacity on average) against fewer resizes.",
    related: ["linear-structures-dynamic-array", "complexity-analysis-accounting-method"],
  },

  // -------------------------------------------------------- Singly linked
  {
    id: "linear-structures-singly-linked-list",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a singly linked list, and what are its core operation complexities?",
    back: `A sequence of nodes, each storing a value and a pointer to the next node. There's no contiguous memory requirement — nodes can live anywhere, linked purely by pointers. The list is accessed via a \`head\` pointer (and often a \`tail\` pointer for O(1) appends).

Unlike arrays, there's no arithmetic shortcut to the $i$-th element — you must **traverse** pointer by pointer, making indexed access $O(n)$. But insertion/deletion **at a known node** (given a pointer to it, or to its predecessor) is $O(1)$ — no shifting required, just pointer rewiring, which is the opposite trade-off from arrays.`,
    complexity: {
      structure: "Singly Linked List",
      operations: [
        { op: "Access by index", time: "O(n)" },
        { op: "Search", time: "O(n)" },
        { op: "Insert/delete at head", time: "O(1)" },
        { op: "Insert/delete at tail", time: "O(1) with tail pointer, else O(n)" },
        { op: "Insert/delete given a node reference", time: "O(1)", note: "for insert-after; delete needs the predecessor" },
      ],
    },
    pitfall:
      "Deleting a node in a singly linked list given only that node's own reference is NOT O(1) in general — you need the predecessor to rewire its `next` pointer, and finding the predecessor requires an O(n) traversal from head (unless you were already holding it).",
    related: ["linear-structures-doubly-linked-list", "linear-structures-array-vs-linked-list"],
  },
  {
    id: "linear-structures-sll-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement insert-at-head, delete-by-value, and traversal for a singly linked list.",
    back: `The classic node + head-pointer pattern. Delete-by-value needs a predecessor pointer since we can't walk backwards.`,
    code: `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

class SinglyLinkedList:
    def __init__(self):
        self.head = None

    def insert_at_head(self, val):
        self.head = Node(val, self.head)

    def delete(self, val):
        prev, cur = None, self.head
        while cur and cur.val != val:
            prev, cur = cur, cur.next
        if cur is None:
            return False  # not found
        if prev is None:
            self.head = cur.next
        else:
            prev.next = cur.next
        return True

    def traverse(self):
        vals, cur = [], self.head
        while cur:
            vals.append(cur.val)
            cur = cur.next
        return vals`,
    related: ["linear-structures-singly-linked-list", "linear-structures-sll-reversal"],
  },
  {
    id: "linear-structures-sll-reversal",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement in-place reversal of a singly linked list.",
    back: `Walk the list once, re-pointing each node's \`next\` to the previous node instead of the next one. Track three pointers (\`prev\`, \`cur\`, \`next\`) so you never lose the rest of the list after rewiring.`,
    code: `def reverse(head):
    prev = None
    cur = head
    while cur:
        next_node = cur.next   # save before overwriting
        cur.next = prev        # reverse the pointer
        prev = cur
        cur = next_node
    return prev  # new head`,
    complexity: {
      structure: "Singly Linked List",
      operations: [{ op: "In-place reversal", time: "O(n)", space: "O(1)", note: "O(n) if done recursively, due to call stack" }],
    },
    pitfall:
      "Overwriting `cur.next` before saving it into `next_node` severs the rest of the list — you'd lose the reference to everything after the current node. Always save `cur.next` first.",
    related: ["linear-structures-sll-implementation"],
  },
  {
    id: "linear-structures-sll-reversal-trace",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front:
      "Trace `reverse` from the previous card on the list `1 -> 2 -> 3 -> None`. What are `prev` and `cur` after each iteration?",
    back: `| Iteration | prev | cur (before body) | next_node | list state after rewiring |
|---|---|---|---|---|
| start | None | 1 | — | 1→2→3→None |
| 1 | None | 1 | 2 | 1→None, prev=1, cur=2 |
| 2 | 1 | 2 | 3 | 2→1→None, prev=2, cur=3 |
| 3 | 2 | 3 | None | 3→2→1→None, prev=3, cur=None |

Loop exits when \`cur\` becomes \`None\`. Return \`prev\`, which is now node \`3\` — the new head of \`3 -> 2 -> 1 -> None\`.`,
    related: ["linear-structures-sll-reversal"],
  },

  // -------------------------------------------------------- Doubly/circular
  {
    id: "linear-structures-doubly-linked-list",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does a doubly linked list add over a singly linked list, and what does it cost?",
    back: `Each node stores both a \`next\` and a \`prev\` pointer. This makes **backward traversal** possible and — critically — makes **deletion of a known node truly O(1)**, since you no longer need to separately locate its predecessor; the node already points to it.

The cost: every node carries an extra pointer (roughly 2x the per-node pointer overhead of a singly linked list), and every insert/delete must correctly maintain twice as many pointers, which is a common source of off-by-reference bugs (forgetting to update one of the four pointers involved in an insertion between two nodes).

Used as the backing structure for LRU caches (O(1) move-to-front/delete on any node) and \`collections.deque\` in Python.`,
    complexity: {
      structure: "Doubly Linked List",
      operations: [
        { op: "Access by index", time: "O(n)" },
        { op: "Insert/delete at head or tail", time: "O(1)" },
        { op: "Delete given a node reference", time: "O(1)", note: "no predecessor lookup needed, unlike SLL" },
      ],
    },
    pitfall:
      "A node deletion must update 4 pointers (the deleted node's neighbors' next/prev), not 2 — missing one silently corrupts the list in a way that often doesn't crash immediately, making the bug hard to spot.",
    related: ["linear-structures-singly-linked-list"],
  },
  {
    id: "linear-structures-circular-linked-list",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a circular linked list, and where is it actually used?",
    back: `A linked list (singly or doubly) where the last node points back to the first instead of to \`None\` — there's no natural "end," so traversal must track a stopping condition externally (e.g. "stop when we're back at the node we started from") rather than checking for a null pointer.

Real uses: **round-robin scheduling** (cycling through processes/players indefinitely — a circular list naturally supports "give me the next one, forever"), and implementing a **circular buffer** conceptually (though circular buffers are more often array-backed in practice — see the Queue cards). Also used for browser tab cycling (Alt+Tab-style "next/previous, wrapping around").`,
    pitfall:
      "Naive traversal code copied from a non-circular linked list (`while cur: ...`) infinite-loops on a circular list, since `cur` never becomes None — you must track the starting node or a count instead.",
    related: ["linear-structures-singly-linked-list"],
  },

  // -------------------------------------------------------------- Stacks
  {
    id: "linear-structures-stack-adt",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a stack, and what are its core operations?",
    back: `A LIFO (last-in, first-out) structure with three core operations, all $O(1)$ regardless of backing implementation: \`push\` (add to top), \`pop\` (remove and return the top), \`peek\`/\`top\` (view the top without removing).

The defining property is access discipline, not a specific memory layout — you only ever touch the most-recently-added element. This maps naturally onto anything with a "most recent thing first" access pattern: undo history, function call frames, nested/bracketed structure.`,
    complexity: {
      structure: "Stack",
      operations: [
        { op: "Push", time: "O(1)", note: "amortized if array-backed" },
        { op: "Pop", time: "O(1)" },
        { op: "Peek", time: "O(1)" },
      ],
    },
    related: ["linear-structures-stack-array-vs-list", "linear-structures-stack-applications"],
  },
  {
    id: "linear-structures-stack-array-vs-list",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Array-backed vs. linked-list-backed stack — what's the actual trade-off?",
    back: `Both give $O(1)$ push/pop/peek — the *asymptotic* complexity is identical. The difference is entirely about constants and secondary properties:

- **Array-backed** (dynamic array, push/pop at the end): better cache locality, lower per-element memory overhead (no pointer per element), but push is $O(1)$ *amortized* (occasional $O(n)$ resize) rather than strictly worst-case $O(1)$.
- **Linked-list-backed** (push/pop at head): strictly worst-case $O(1)$ per operation, no resize spikes, but each node carries pointer overhead and worse cache locality, plus a memory allocation per push.

In practice, array-backed stacks (Python \`list\`, used via \`append\`/\`pop\`) are the default choice — the amortized-vs-worst-case distinction rarely matters, and the cache-locality win is real. Linked-list-backed is preferred only when strict per-operation worst-case latency matters (e.g. real-time systems where an occasional O(n) resize spike is unacceptable).`,
    related: ["linear-structures-stack-adt", "linear-structures-array-vs-linked-list"],
  },
  {
    id: "linear-structures-stack-applications",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are stacks used for in practice?",
    back: `- **Undo/redo**: each action pushed onto an undo stack; undo pops and reverses it, often pushing onto a redo stack.
- **Expression evaluation & parsing**: converting infix to postfix (shunting-yard algorithm), evaluating postfix expressions, matching/validating balanced brackets.
- **DFS (graph/tree traversal)**: explicit stack simulates the "go deep, backtrack" access pattern — either an explicit stack or recursion (which uses the *call* stack implicitly).
- **The call stack itself**: every function call pushes a frame (return address, local variables); returning pops it. Deep unbounded recursion overflows this stack — a "stack overflow" is literally this structure hitting its capacity limit.
- **Balanced parentheses / syntax validation**: push opening brackets, pop and match on closing brackets (see the implementation card).`,
    pitfall:
      "Confusing the abstract 'stack' data structure with 'the call stack' — they're related (recursion is implemented via a stack) but not identical; you can use an explicit stack to simulate recursion iteratively specifically to avoid call-stack depth limits.",
    related: ["linear-structures-stack-adt", "linear-structures-balanced-parens"],
  },
  {
    id: "linear-structures-balanced-parens",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement a balanced-parentheses checker using a stack.",
    back: `Push opening brackets. On a closing bracket, the stack must be non-empty and its top must be the matching opener — otherwise it's unbalanced. At the end, the stack must be empty (no unclosed openers left).`,
    code: `def is_balanced(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    stack = []
    for ch in s:
        if ch in '([{':
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0`,
    pitfall:
      "Forgetting the final `len(stack) == 0` check passes strings like `\"(((\"` as balanced — every closing bracket matched fine because there simply weren't any, but openers were left unclosed.",
    related: ["linear-structures-stack-applications"],
  },

  // -------------------------------------------------------------- Queues
  {
    id: "linear-structures-queue-adt",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a queue, and why does a naive array-backed queue have an O(n) dequeue?",
    back: `A FIFO (first-in, first-out) structure: \`enqueue\` adds to the back, \`dequeue\` removes from the front.

A naive array-backed queue that dequeues via \`arr.pop(0)\` (or equivalent "remove first element") is $O(n)$, because every remaining element has to shift left by one to fill the gap. This is the same shifting cost as any arbitrary-index deletion from a plain array.

Two standard fixes: a **circular buffer** (see its own card) making both ends $O(1)$ on a fixed-size array, or a **linked list with head and tail pointers**, giving $O(1)$ enqueue (at tail) and $O(1)$ dequeue (at head) without any shifting.`,
    complexity: {
      structure: "Queue (naive array)",
      operations: [
        { op: "Enqueue (at end)", time: "O(1) amortized" },
        { op: "Dequeue (remove from front)", time: "O(n)", note: "requires shifting all remaining elements" },
      ],
    },
    pitfall:
      "Python's `list.pop(0)` looks innocuous but is O(n) — a common performance bug is using a plain list as a queue; `collections.deque` (a doubly linked list / circular-buffer hybrid) is the correct O(1)-both-ends choice.",
    related: ["linear-structures-circular-buffer-queue", "linear-structures-linked-queue"],
  },
  {
    id: "linear-structures-circular-buffer-queue",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a circular buffer give an array-backed queue O(1) enqueue and dequeue?",
    back: `Instead of shifting elements, track two indices — \`head\` (next to dequeue) and \`tail\` (next to enqueue) — and let them **wrap around** the fixed-size array using modular arithmetic: \`index = index % capacity\`. Dequeue just advances \`head\`; enqueue writes at \`tail\` and advances it. No element ever moves.

This trades away dynamic resizing for O(1) on both ends within a fixed capacity — many circular buffer implementations resize (like a dynamic array, allocating a larger buffer and re-copying in logical order) once full, which reintroduces the same amortized-O(1) argument as a dynamic array's doubling.

Used directly in producer-consumer pipelines, streaming/audio buffers, and OS-level ring buffers for I/O.`,
    complexity: {
      structure: "Queue (Circular Buffer)",
      operations: [
        { op: "Enqueue", time: "O(1)", note: "amortized O(1) if backing array resizes when full" },
        { op: "Dequeue", time: "O(1)" },
      ],
    },
    code: `class CircularQueue:
    def __init__(self, capacity):
        self.buf = [None] * capacity
        self.capacity = capacity
        self.head = self.size = 0

    def enqueue(self, val):
        if self.size == self.capacity:
            raise OverflowError("queue full")
        tail = (self.head + self.size) % self.capacity
        self.buf[tail] = val
        self.size += 1

    def dequeue(self):
        if self.size == 0:
            raise IndexError("queue empty")
        val = self.buf[self.head]
        self.head = (self.head + 1) % self.capacity
        self.size -= 1
        return val`,
    pitfall:
      "Distinguishing 'empty' from 'full' by comparing head == tail alone is ambiguous — both states can produce head == tail. Tracking an explicit `size` counter (as above) sidesteps the ambiguity entirely.",
    related: ["linear-structures-queue-adt"],
  },
  {
    id: "linear-structures-linked-queue",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does a linked-list-backed queue achieve O(1) enqueue and dequeue?",
    back: `A singly linked list with **both** a \`head\` pointer (for O(1) dequeue — remove and advance head) and a \`tail\` pointer (for O(1) enqueue — append after tail, then advance tail). Without a tracked tail pointer, enqueue would require an O(n) traversal to find the last node.

No fixed capacity, no wraparound arithmetic, no resize step — grows one node at a time, at the cost of per-node pointer overhead and worse cache locality than an array-backed circular buffer.`,
    complexity: {
      structure: "Queue (Linked List)",
      operations: [
        { op: "Enqueue (at tail)", time: "O(1)", note: "requires a tracked tail pointer" },
        { op: "Dequeue (at head)", time: "O(1)" },
      ],
    },
    pitfall:
      "Forgetting to maintain the tail pointer (e.g. after dequeuing the second-to-last element down to a single-node queue) is the classic bug source — tail must be updated to null-or-head correctly when the queue becomes empty.",
    related: ["linear-structures-queue-adt", "linear-structures-singly-linked-list"],
  },
  {
    id: "linear-structures-queue-applications",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are queues used for in practice?",
    back: `- **BFS (breadth-first search)**: the queue holds the frontier of nodes to visit next, processed in the order discovered — this FIFO order is exactly what makes BFS explore level-by-level and find shortest paths in unweighted graphs.
- **Task scheduling**: OS process scheduling, print job queues, request queues in web servers — anything with a "first come, first served" fairness requirement.
- **Producer-consumer pipelines**: buffering work items between stages that run at different speeds (often backed by a circular buffer).
- **Rate limiting / sliding window algorithms**: maintaining a window of "recent" timestamps or values, evicting from the front as new ones arrive from the back.`,
    related: ["linear-structures-queue-adt"],
  },

  // -------------------------------------------------------------- Deques
  {
    id: "linear-structures-deque",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a deque, and how is it typically implemented?",
    back: `A double-ended queue: supports $O(1)$ push and pop at **both** the front and the back — a strict generalization of both stack (use one end) and queue (use front + back). \`push_front\`, \`push_back\`, \`pop_front\`, \`pop_back\` all run in $O(1)$.

Typically implemented as either a **doubly linked list** (each end is O(1) to touch, given head/tail pointers) or a **resizable circular buffer** (Python's \`collections.deque\` uses a doubly linked list of fixed-size blocks internally — a hybrid that keeps most of the cache benefits of arrays while avoiding whole-array shifting). Both give the same asymptotic guarantees; the circular-buffer-of-blocks approach used by real implementations is a practical compromise for cache performance.`,
    complexity: {
      structure: "Deque",
      operations: [
        { op: "Push/pop front", time: "O(1)" },
        { op: "Push/pop back", time: "O(1)" },
        { op: "Access by index", time: "O(n)", note: "O(1) only at the two ends" },
      ],
    },
    related: ["linear-structures-deque-vs-stack-vs-queue"],
  },
  {
    id: "linear-structures-deque-vs-stack-vs-queue",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Deque vs. stack vs. queue — when do you actually need the extra flexibility of a deque?",
    back: `A deque is a strict superset of both — you could always use a deque and just not touch one end. Reach for the more restrictive structure when it communicates intent, and for a deque specifically when you need:

- **Sliding window algorithms**: a monotonic deque maintains window maxima/minima in $O(1)$ amortized per element, adding at the back and evicting from *both* ends (from the back to maintain monotonicity, from the front when the window slides past an index).
- **Undo/redo with both directions needed at once**, or **work-stealing schedulers** (steal from one end, push/pop locally from the other, reducing contention).
- **Palindrome checking**: compare/pop from both ends simultaneously.

If you only ever touch one end, use a stack (simpler mental model, same complexity). If you only ever add at the back and remove from the front, use a queue. Reach for a deque only when the algorithm genuinely needs both ends.`,
    related: ["linear-structures-deque", "linear-structures-stack-adt", "linear-structures-queue-adt"],
  },

  // -------------------------------------------------------- Array vs list
  {
    id: "linear-structures-array-vs-linked-list",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Array vs. linked list — what's the real trade-off, and when does each win?",
    back: `| | Array | Linked List |
|---|---|---|
| Indexed access | O(1) | O(n) |
| Insert/delete at known position | O(n) (shifting) | O(1) (pointer rewiring) |
| Memory layout | Contiguous — great cache locality | Scattered — poor cache locality |
| Memory overhead | None per element | Extra pointer(s) per node |
| Growth | Resize + copy (amortized O(1) append) | Grows one node at a time, no copy |

**Arrays win** when you need random access by index, or when you're mostly iterating sequentially (cache locality dominates, often making array O(n) scans faster in wall-clock time than linked-list O(n) scans despite identical Big-O).

**Linked lists win** when you frequently insert/delete in the middle *and already have a reference to the position* (e.g. maintaining a sorted structure via merge, or an LRU cache's internal ordering), and when you can't tolerate the occasional O(n) resize pause an array-based structure introduces.

In practice, modern hardware's cache-locality advantage is large enough that arrays (or array-backed structures like a circular-buffer deque) are the default choice even for many "should be a linked list" textbook scenarios — genuinely reaching for a linked list is rarer in practice than the classic curriculum framing suggests.`,
    pitfall:
      "Textbook Big-O comparisons make linked lists look competitive for insertion-heavy workloads, but real-world cache-miss costs often make array-based structures faster even for insert-heavy patterns, unless insertions are genuinely at arbitrary/already-known positions at scale.",
    related: ["linear-structures-static-array", "linear-structures-singly-linked-list"],
  },
];
