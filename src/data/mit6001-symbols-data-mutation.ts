// MIT 6.001 Structure and Interpretation of Computer Programs (Spring 2005,
// Eric Grimson, Peter Szolovits, Trevor Darrell) — Lectures 9-14: symbols
// and quotation, tagged data, advanced data types (tables, hash tables),
// data mutation (stacks and queues), and trees/graphs/search. Sourced from
// the course's own online-lecture handouts, read page by page, with code
// read from the slide images; SICP §2.3-2.4 and §3.3.1-3.3.3 (the assigned
// readings) for context. Lecture 14 ("Graphs and Search", a live lecture)
// has no handout on OCW; its tracker entry points to Lecture 13's card and
// to the 6.006 graph cards rather than inventing content.
//
// Corrections / additions beyond the handouts:
// - Slide 31.2.8 says count-leaves, having two recursive calls, should
//   "remind you of ... exponential". That's wrong: each recursive call is on
//   a disjoint part of the structure (car vs cdr), so every pair and leaf is
//   visited once — time is linear in the size of the tree. The card says so
//   and contrasts it with fib, whose two calls overlap.
// - Slide 9.4.12 says the bug happened "because we were fully defensive";
//   the narrative (and slide title "value-add-6 is not defensive") means
//   NOT fully defensive. The card states it correctly.
// - The range-plus-limited-precision example: (make-range 4 6) plus
//   (make-limited-precision 10 1) wrongly yields (range 14 16) because the
//   tag is stripped and (10 1) read as the point range [10, 10]; the correct
//   answer is [13, 17] (= 15 ± 2). Recomputed.
import type { Card } from "./types";

const MODULE = "mit6001-data";

export const mit6001SymbolsDataMutationCards: Card[] = [
  // --- Lecture 9: Symbols and quotation ---
  {
    id: "mit6001-data-quote-symbols",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What does quote do, why must it be a special form, and what does each of these print after (define x 20): (+ x 3), '(+ x 3), (list (quote +) x '3), (list '+ x 3), (list + x 3)?",
    back: `\`(quote alpha)\`, abbreviated \`'alpha\`, returns the **symbol** itself rather than the value bound to the name. It has to be a special form, because ordinary evaluation of the operand would look up its value, which is exactly what we want to avoid. ("What is your favorite color?" → *blue*; "What is 'your favorite color'?" → the phrase itself.)

The reader turns any parenthesized text into list structure. Quoting it returns that structure unevaluated, so \`'(1 2)\` is the same as \`(list '1 '2)\`.

| expression | prints |
|---|---|
| \`(+ x 3)\` | \`23\` |
| \`'(+ x 3)\` | \`(+ x 3)\`, a list of the symbol +, the symbol x and the number 3 |
| \`(list (quote +) x '3)\` | \`(+ 20 3)\` |
| \`(list '+ x 3)\` | \`(+ 20 3)\` (a quoted number is just the number) |
| \`(list + x 3)\` | \`([procedure #…] 20 3)\`, the *value* of + |

**Symbols are interned**: each name has a unique symbol object, so \`(list 'delta 'delta)\` holds two pointers to the *same* object. Test symbols with \`eq?\` (pointer identity). Numbers use \`=\` and strings use \`string=?\`. \`symbol?\` is the type predicate.`,
    pitfall:
      "eq? on numbers or strings is unreliable (two equal strings may be different objects). Use eq? for symbols, = for numbers, string=? for strings, and equal? for structural comparison of lists.",
    related: ["mit6001-data-symbolic-deriv", "mit6001-data-mutation-sharing"],
  },
  {
    id: "mit6001-data-symbolic-deriv",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Build symbolic differentiation over expressions like (+ x 3) and (* x y). Why does the direct version return (+ 1 0), and how does a data abstraction fix it with one change?",
    back: `**Representation**: \`Expr = number | symbol | (+ Expr Expr) | (* Expr Expr)\`. This is a recursive type, so expressions are trees. The operator symbol at the front acts as a **type tag**.

**Rules**:
- $\\frac{dc}{dx} = 0$;
- $\\frac{dx}{dx} = 1$, and $\\frac{dy}{dx} = 0$ for any other variable $y$;
- $\\frac{d(e_1 + e_2)}{dx} = \\frac{de_1}{dx} + \\frac{de_2}{dx}$;
- $\\frac{d(e_1 e_2)}{dx} = e_1\\frac{de_2}{dx} + e_2\\frac{de_1}{dx}$.

**Direct version**: \`if\` on \`(pair? expr)\`, then \`car\`/\`cadr\`/\`caddr\` and \`(list '+ …)\` sprinkled through \`deriv\`. \`(deriv '(+ x y) 'x)\` → \`(+ 1 0)\`: the output copies the input's list structure. It is also hard to add operators or change the representation.

**Better version**: dispatch with \`cond\` on type predicates, and use only constructors and selectors:
\`\`\`scheme
(define (deriv expr var)
  (cond ((constant? expr) 0)
        ((variable? expr) (if (same-var? expr var) 1 0))
        ((sum? expr)
         (make-sum (deriv (addend expr) var) (deriv (augend expr) var)))
        ((product? expr)
         (make-sum (make-product (multiplier expr) (deriv (multiplicand expr) var))
                   (make-product (deriv (multiplier expr) var) (multiplicand expr))))
        (else (error "unknown expression type" expr))))

(define (make-sum a1 a2)     ; the ONLY change needed to simplify
  (cond ((and (number? a1) (number? a2)) (+ a1 a2))
        ((number? a2) (list '+ a2 a1))
        (else (list '+ a1 a2))))
\`\`\`
Now \`(deriv '(+ x y) 'x)\` → \`1\`, and \`deriv\` itself was not touched.`,
    pitfall:
      "variable? should check that the expression is not compound AND is a symbol. The direct version silently assumed 'not a pair and not a number' means variable, which breaks as soon as another atom type appears.",
    related: ["mit6001-data-quote-symbols", "mit6001-data-tagged-data", "mit6001-hop-rationals-abstraction-barrier"],
  },
  // --- Lecture 10: Tagged data ---
  {
    id: "mit6001-data-tagged-data",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why do the Bert (rectangular) and Ernie (polar) complex-number implementations need type tags, and what are data-directed and defensive programming?",
    back: `Complex numbers support both $(\\text{real}, \\text{imag})$ and $(\\text{mag}, \\text{angle})$ selectors.
- **Addition** is easy in rectangular form: add the real parts and the imaginary parts.
- **Multiplication** is easy in polar form: multiply the magnitudes and add the angles.

**Two implementations, both satisfying the contract:**
- **Bert** stores \`(list real imag)\` and computes mag/angle with trigonometry.
- **Ernie** stores \`(list mag angle)\` and computes real/imag.

**The problem**: you find \`(1 2)\` "lying on the floor". Is it $1 + 2i$, or magnitude 1 at angle 2? The representation alone can't tell you.

**The fix**: tag every datum with who made it:
\`\`\`scheme
(define (make-complex-from-real-imag r i) (list 'rectangular r i))
(define (make-complex-from-mag-angle m a) (list 'polar m a))
(define (tag z) (car z))
(define (contents z) (cdr z))
(define (real z)
  (cond ((eq? (tag z) 'rectangular) (car (contents z)))
        ((eq? (tag z) 'polar)
         (* (car (contents z)) (cos (cadr (contents z)))))
        (else (error "unknown complex type" z))))
\`\`\`
The constructors just glue the parts on. The **selectors** dispatch on the tag and do any conversion. Every operation (\`+c\`, \`*c\`) now works on both kinds of number.

**Two payoffs:**
- **Data-directed programming**: the type of an object directs which method runs. To add a new type, add a tag and a dispatch clause.
- **Defensive programming**: check the tag before using the representation, and send unknown types to an \`error\` branch. Wrong-type data then fails *immediately*, instead of producing garbage several stages later.`,
    pitfall:
      "Keep the tag value behind a name (sum-tag, range-tag). Code tests (eq? (tag e) sum-tag), never the literal symbol, so changing the tag means changing one definition.",
    related: ["mit6001-data-defensive-evaluator", "mit6001-data-symbolic-deriv"],
  },
  {
    id: "mit6001-data-defensive-evaluator",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In the 6.001 evaluator for sums of constants, ranges and limited-precision values, what three bugs show up, and what discipline fixes them?",
    back: `**Goal**: simplify sums whose leaves can be numbers, ranges, or limited-precision values. For example $[3, 7] + [1, 3] = [4, 10]$ and $100 \\pm 1 + 3 \\pm 0.5 = 103 \\pm 1.5$.

**Bug 1, untagged ranges.** Ranges are bare \`(min max)\` lists, and the evaluator treats "any pair that isn't a sum" as a range:
- *number + range*: it falls into range addition and fails on \`(car 5)\`.
- A new limited-precision \`(val err)\` pair is silently added as if it were a range. This is the worst kind of failure: a wrong answer with no error.

**Bug 2, returning an untagged result.** With tagged constants, \`eval\` of \`(sum (const 3) (const 5))\` returns the *number* 8. Nested inside a larger sum, that bare 8 is no longer a valid tagged expression.

**Fix**: every case **returns a tagged value** (\`(constant 8)\`), and the arithmetic moves into the abstraction (\`constant-add\`).

**Bug 3, a non-exhaustive dispatch.** \`value-add\` assumed "not both constants ⇒ ranges" and converted with \`val2range\`, which stripped the tag without checking it. Then:
- \`(make-range 4 6)\` + \`(make-limited-precision 10 1)\` gives \`(range 14 16)\`, because $10 \\pm 1$ was misread as the point range $[10, 10]$.
- The correct answer is $[13, 17]$, which is $15 \\pm 2$.

**Fix**: test explicitly for every type you can handle, and use the \`else\` branch **only** for errors.

**The discipline** (*"only the paranoid survive"*):
- tag all data, including return values;
- separate the tag's *use* from its *value*;
- dispatch on tags;
- put an error in every fall-through.

The final evaluator has the same simple shape as the first one (base case plus recursive sum case) but handles every type safely.`,
    pitfall:
      "Skipping type checks 'for efficiency, since a caller already checked' is how bug 3 happened. The check that was skipped was exactly the one the new type needed.",
    related: ["mit6001-data-tagged-data", "mit6001-hop-programming-practice"],
  },
  // --- Lecture 11: Advanced data types ---
  {
    id: "mit6001-data-tables-adt",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why is an association list not an abstract data type, and what makes the tagged Table1 (make, put!, get) one? What is an 'opaque type name'?",
    back: `**Table interface**:
- \`make\`: build an empty table;
- \`(put! t k v)\`: bind $k$ to $v$, so that later lookups find this binding;
- \`(get t k)\`: return the value bound to $k$, or false if there is none.

**A-list**: \`((x 15) (y 20))\`. \`find-assoc\` walks the list using \`caar\`/\`cadar\` and \`equal?\`. \`add-assoc\` conses a new binding on the front, which **shadows** old bindings instead of removing them, so lookups get slower as bindings are added.

An a-list is **not an ADT**:
- there's no constructor;
- there's no barrier: users can \`map\` or \`filter\` the raw list directly.

Code like that ties itself to the representation, and modularity is lost.

**Table1**: \`(list 'table1)\` with the a-list in its cdr.
- \`put!\` uses \`set-cdr!\` to install the new a-list.
- \`get\` strips the tag and calls \`find-assoc\`.

What makes it an ADT is not the tag, the constructor or the mutator (a-lists have equivalents). It is that **users can't use list operations on it**: the representation is hidden.

**Opaque type name**: users see only signatures:
- \`make\`: void → Table1<k, v>
- \`put!\`: Table1<k, v>, k, v → undefined
- \`get\`: Table1<k, v>, k → v or false

With m1: number → MyType and m2: MyType → …, \`(m2 (m1 10))\` is fine, but \`(car (m1 10))\` should "bomb", because nothing says a MyType is a pair. The name hides the implementation, so the implementation can change.`,
    pitfall:
      "Shadowing in add-assoc means old bindings are never reclaimed. That is fine for correctness under the contract, but space grows with every put!, and get on a missing key costs time proportional to all puts ever made.",
    related: ["mit6001-data-hash-table", "mit6001-hop-rationals-abstraction-barrier"],
  },
  {
    id: "mit6001-data-hash-table",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "How does Table2 implement the same table contract with a hash function and a vector of a-list buckets, and when is Table1 (a single a-list) the better choice?",
    back: `**Hash table**: keep $N$ small a-lists (**buckets**) in a **vector**, a fixed-size ADT with $O(1)$ indexed \`vector-ref\`/\`vector-set!\`. A **hash function** maps a key to an index $0 \\ldots N-1$. For point keys the lecture uses
$$h(p, N) = (x_p + y_p) \\bmod N,$$
which is nearly uniform if points are spread evenly in the plane.

**Table2**: \`(list 'table2 size hashfn buckets)\`.
- \`get\`: compute the index, then \`find-assoc\` in that bucket's a-list.
- \`put!\`: compute the index, \`add-assoc\` to that bucket, then \`vector-set!\` it back.

The **types are identical to Table1's**, so callers can't tell the difference except through speed. With a good hash function a search scans about $1/N$ of the bindings.

| | Table1 (one a-list) | Table2 (hash table) |
|---|---|---|
| \`make\` | $O(1)$, tiny | allocates a size-$N$ vector |
| \`put!\` | $O(1)$ cons | hash plus cons, $O(1)$ |
| \`get\` | $O(n)$ in the number of puts | hash plus a bucket of about $n/N$ |

**Which is better depends on use.**
- **Table1** wins for very few gets or very small tables.
- **Table2** wins when gets dominate, but only if you can predict $N$ and find a cheap hash function that spreads keys evenly.

**The lesson**: the opaque ADT let you swap representations without touching any client.`,
    pitfall:
      "A skewed hash function (e.g. x + y when points lie on a line x + y = c) puts everything in one bucket, and get degrades to Table1's O(n) while also paying for the hashing.",
    related: ["mit6001-data-tables-adt", "hashing-separate-chaining", "mit6006-sorting-hashing-chaining-terminology"],
  },
  // --- Lecture 12: Data mutation ---
  {
    id: "mit6001-data-mutation-sharing",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What do set!, set-car! and set-cdr! do, why do they break the substitution model, and what is x after x = (3 4), y = (1 2), (set-car! x y), then (set-cdr! y (cdr x))?",
    back: `**Mutators**:
- \`(set! name expr)\` is a special form. It evaluates \`expr\` and **changes the existing binding** of \`name\`. That differs from \`define\`, which creates a binding.
- \`(set-car! p v)\` and \`(set-cdr! p v)\` are ordinary procedures. They redirect one pointer of the pair \`p\`. Their return value is unspecified, since they are used only for the effect.

**Time enters the language.** Without mutation, procedures act like mathematical functions: \`(+ x 5)\` means the same thing whenever it is evaluated. That is **functional programming**, and it is what the substitution model assumes. After \`(define x 10)\`, \`(+ x 5)\` → 15. After \`(set! x 94)\`, the identical text → 99. The same syntax now has different meanings depending on *when* it runs.

**Sharing**: after \`(define a (list 1 2))\` and \`(define b a)\`, then \`(set-car! a 10)\`, \`b\` prints \`(10 2)\` even though nothing mentioned \`b\`.

**The trace**:
\`\`\`
x → (3 4), y → (1 2)
(set-car! x y)        x → ((1 2) 4)     ; x's first car now points at y's list
(set-cdr! y (cdr x))  x → ((1 4) 4)     ; y's cdr now points at x's tail (4)
\`\`\`
\`x\` changed in step 2 without being named, because it shares structure with \`y\`.

**Identity vs equivalence**:
- \`eq?\`: the *same object* (a mutation through one name is visible through the other).
- \`equal?\`: *looks the same* (prints alike). \`(equal? (list 1 2) (list 1 2))\` → true, but \`eq?\` → false, because each \`list\` call makes new pairs.

An object stays the same object after mutation as long as you hold the same pointer to it.`,
    pitfall:
      "Mutating a list you received as an argument (or one built with append, which shares its last argument) can silently change other variables. Before you mutate, check whether the structure is shared.",
    related: ["mit6001-data-queue-mutation", "mit6001-data-quote-symbols", "mit6001-hop-list-procedures"],
  },
  {
    id: "mit6001-data-queue-mutation",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "Contrast the functional list stack/queue with the mutable tagged versions. Why does a front/rear-pointer queue make insert O(1), and why do mutable ADTs need a tag cell?",
    back: `**Stack** (LIFO):
- operations: \`make-stack\`, \`top\`, \`insert\`, \`delete\`, \`empty-stack?\`;
- contract: after $i$ inserts and $j$ deletes, it is an error if $j > i$; the stack is empty iff $i = j$; insert-then-delete restores the old top; \`top\` after \`insert x\` is $x$.

**Functional list stack**: \`insert\` = \`cons\`, \`delete\` = \`cdr\`. The problem is that the stack has **no identity**. \`(insert s 'a)\` returns a new list, but \`s\` is still empty. Users can also rebind or slice the raw list.

**Fix**: a **tag cell** \`(stack . contents)\`. \`insert!\` and \`delete!\` \`set-cdr!\` the contents while the pointer to the tag cell (the stack's identity) stays fixed. This changes the contract: the operations now mutate.

**Queue** (FIFO): the contract says the front is the $(j+1)$-th element inserted, after $j$ deletes.
- **As a plain list**: \`front\` = \`car\` and \`delete\` = \`cdr\` are $O(1)$. But \`insert\` must walk to the end and **copy** the list, which is $\\Theta(n)$ time and $\\Theta(n)$ new pairs.
- **Mutable**: \`(queue . (front-ptr . rear-ptr))\`, where the two pointers aim at the first and last pairs of the contents list. Insert and delete are below.

\`\`\`scheme
(define (insert-queue! q elt)
  (let ((new-pair (cons elt nil)))
    (cond ((empty-queue? q)
           (set-front-ptr! q new-pair) (set-rear-ptr! q new-pair) q)
          (else
           (set-cdr! (rear-ptr q) new-pair)   ; splice at the end, no walk
           (set-rear-ptr! q new-pair) q))))
(define (delete-queue! q)
  (cond ((empty-queue? q) (error "delete of empty queue:" q))
        (else (set-front-ptr! q (cdr (front-ptr q))) q)))
\`\`\``,
    complexity: {
      structure: "Queue (6.001 Lecture 12)",
      operations: [
        { op: "front-queue", time: "Θ(1)", space: "Θ(1)" },
        { op: "delete-queue (list or mutable)", time: "Θ(1)", space: "Θ(1)" },
        { op: "insert-queue, functional list", time: "Θ(n)", space: "Θ(n) new pairs", note: "copies the list to append at the end" },
        { op: "insert-queue!, front/rear pointers", time: "Θ(1)", space: "Θ(1)" },
      ],
      caveat: "Time counts cons/car/cdr operations; space counts newly created pairs.",
    },
    pitfall:
      "In delete-queue!, only the front pointer moves. When the last element is deleted, the rear pointer still points at the old pair. That is harmless only because empty-queue? tests the front pointer alone. Testing the rear pointer instead would be a bug.",
    related: ["mit6001-data-mutation-sharing", "linear-structures-queue-adt", "linear-structures-stack-adt"],
  },
  // --- Lecture 13: Trees, graphs and search ---
  {
    id: "mit6001-data-trees-count-leaves",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Define trees as lists of lists, write count-leaves and tree-map, prove them correct by induction, and give count-leaves' true order of growth.",
    back: `**Type**: \`Tree<C> = List<Tree<C>> | Leaf<C>\`, where a leaf is any non-pair. So \`(list 2 (list 6 8) 4)\`, drawn as box-and-pointer, is a list of three top-level branches. \`length\` gives **3** (top-level branches). The **4** leaves need a procedure that follows the tree's structure:
\`\`\`scheme
(define (count-leaves tree)
  (cond ((null? tree) 0)                ; empty tree
        ((leaf? tree) 1)                ; leaf = (not (pair? tree))
        (else (+ (count-leaves (car tree))
                 (count-leaves (cdr tree))))))

(define (tree-map proc tree)
  (cond ((null? tree) nil)
        ((leaf? tree) (proc tree))
        (else (cons (tree-map proc (car tree))
                    (tree-map proc (cdr tree))))))
\`\`\`
There are two base cases, and the recursion goes into **both** the car and the cdr, since the car may itself be a tree. A list procedure only recurses on the cdr.

**Correctness by induction on size**:
- The base cases return the right count or tree.
- The car and cdr are strictly smaller trees, so by hypothesis they are handled correctly, and \`+\` or \`cons\` combines the results.
- The same argument proves \`map\` correct on lists.

**Order of growth**: the lecture suggests that two recursive calls "remind you of exponential". But the calls work on **disjoint** parts (car vs cdr), so each pair and each leaf is visited exactly once. Time is $\\Theta(\\text{pairs} + \\text{leaves})$, **linear in the size of the tree**.

Compare \`fib\`, whose two calls *overlap* (both recompute $F(n-2)$).`,
    pitfall:
      "Two recursive calls do not imply exponential time. What matters is whether the subproblems overlap. Structural recursion over disjoint parts of a tree is linear, and tree-recursive fib is exponential only because of recomputation.",
    related: ["mit6001-data-search-structures", "mit6001-procs-tree-recursion-fibonacci", "mit6001-hop-map-filter-fold"],
  },
  {
    id: "mit6001-data-search-structures",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare search in an unordered list, an ordered list and a binary tree, and explain 6.001's 'seeker' framework, where one line switches depth-first and breadth-first graph search.",
    back: `**Collections**:

| structure | find (hit or miss) | insert | delete |
|---|---|---|---|
| unordered list | $\\Theta(n)$ | $O(1)$ cons | $\\Theta(n)$ |
| ordered list (\`same?\`, \`less?\`) | $\\Theta(n)$, misses stop early but still about $n/2$ | $\\Theta(n)$ | $\\Theta(n)$ |
| binary tree (left < entry < right) | $\\Theta(\\log n)$ if balanced | $\\Theta(\\log n)$ if balanced | |

If every left branch is empty, the tree degenerates into a list and search is linear. Keeping it balanced is "a later course".

**Graphs** (e.g. the Web): nodes plus **directed** edges, possibly with **cycles**. A graph entry is \`(tag node children contents)\`.

**Generic search** loops \`(seeker node)\` until it returns true (found) or false (exhausted). Otherwise it returns the next node. A **strategy** is a higher-order procedure that builds a seeker with internal state \`*to-be-visited*\`. Given the current node, the seeker:
1. adds the node's children to \`*to-be-visited*\`;
2. returns true if \`(goal? node)\`;
3. otherwise returns false if nothing is left to visit;
4. otherwise pops and returns the next node.

The order of step 1 decides the search:
- children added at the **front** (a stack) gives **depth-first** search, with backtracking when a node has no children;
- children added at the **end** (a queue) gives **breadth-first** search.

**Cycles**: as written, this only works on trees. On a cyclic graph it loops forever. The fix is to **mark visited nodes** and skip them when choosing the next node. Smarter strategies reorder \`*to-be-visited*\` by estimated closeness to the goal.`,
    pitfall:
      "Without a visited set, BFS loops forever on a cycle just as DFS does. Choosing breadth-first order does not make search safe on graphs; marking visited nodes does.",
    related: ["mit6001-data-trees-count-leaves", "graph-traversal-bfs-vs-dfs", "mit6006-graphs-full-search-pattern"],
  },
];
