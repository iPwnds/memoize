// MIT 6.001 Structure and Interpretation of Computer Programs (Spring 2005,
// Eric Grimson, Peter Szolovits, Trevor Darrell) — Lectures 5-8: data
// abstraction, types and higher-order procedures, good programming practice,
// and the Henderson/Escher picture language (the Quiz 1 block). Sourced from
// the course's own online-lecture handouts, read page by page, with code
// read from the slide images; SICP §1.3 and §2.1-2.2 (the assigned
// readings) for context. Every numeric example was recomputed in Python.
//
// Corrections / additions beyond the handouts:
// - Slide 6.5.15's narration says average-damp of square is tried "on the
//   value 5", but the slide (correctly) evaluates ((average-damp square) 10)
//   → (average 10 100) → 55. The card uses the slide's 10.
// - Slide 6.2.5 writes 1 + 1/3² + … + 1/101² = π²/8 with "="; the finite sum
//   is ≈ 1.22880 vs π²/8 ≈ 1.23370 — only the infinite series equals π²/8.
//   The card says so.
// - The beside slide (30.1.36) writes (scale-rect (horiz rect) a) in the
//   second frame; the procedure is scale-vect (as in the first frame). The
//   card uses scale-vect.
// - The handout's fixed-point uses a fixed tolerance close? of 0.0001; the
//   card's trace counts (golden ratio after 10 steps → 1.61806, sqrt 2 via
//   average damping after 4 steps) were re-run in Python.
import type { Card } from "./types";

const MODULE = "mit6001-hop";

export const mit6001AbstractionHopCards: Card[] = [
  // --- Lecture 5: Data abstraction ---
  {
    id: "mit6001-hop-block-structure",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is block structure (internal definitions), and why does 6.001 move sqrt's helpers (good-enuf?, improve, sqrt-iter) inside sqrt?",
    back: `Some procedures are **general** (\`average\`, \`sqrt\`) and should be visible to every user. Others (\`good-enuf?\`, \`improve\`, the loop \`sqrt-iter\`) are **implementation details of sqrt** and shouldn't pollute the global namespace.

**Block structure**: put those definitions *inside* the body of \`sqrt\`'s lambda:
\`\`\`scheme
(define sqrt
  (lambda (x)
    (define good-enuf?
      (lambda (guess) (< (abs (- (square guess) x)) 0.001)))
    (define improve
      (lambda (guess) (average guess (/ x guess))))
    (define sqrt-iter
      (lambda (guess)
        (if (good-enuf? guess) guess (sqrt-iter (improve guess)))))
    (sqrt-iter 1.0)))
\`\`\`
- The internal names are **only in scope inside the lambda**. Referring to \`improve\` at top level is an unbound-variable error.
- The internal procedures can use \`x\` freely, because it is the enclosing procedure's parameter. They no longer need it passed as an argument.
- When \`sqrt\` is applied, the body runs: first the internal defines, then the last expression \`(sqrt-iter 1.0)\`, whose value is the result.

The box around the outer lambda is exactly the **black box**. Users see \`sqrt\`'s contract and nothing inside it.`,
    pitfall:
      "Internal procedures see x only because they are defined inside the scope of x. Pulling them back out to top level silently breaks them (x becomes unbound) unless you add x back as a parameter. Lecture 15's environment model explains why.",
    related: ["mit6001-procs-sqrt-by-averaging", "mit6001-hop-pairs-closure"],
  },
  {
    id: "mit6001-hop-pairs-closure",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the contract between cons, car and cdr, and explain the 'closure property' of pairs and of lists (sequences of pairs ending in nil).",
    back: `**Pair abstraction**:
- **Constructor**: \`(cons a b)\` evaluates both operands and glues the values into a **pair**.
- **Selectors**: \`car\` and \`cdr\`.
- **Predicate**: \`pair?\`.

**Contract**: for all $a, b$, \`(car (cons a b))\` = $a$ and \`(cdr (cons a b))\` = $b$. *How* the gluing is done is irrelevant; all that matters is that the selectors get back what was glued.

**Closure property** (in the algebraic sense, not the "closures" of later lectures): the result of combining things with \`cons\` can itself be combined with \`cons\`. That gives hierarchies, for example a segment made of two points made of two coordinates:
\`\`\`scheme
(define (make-point x y) (cons x y))
(define (make-seg p q) (cons p q))   ; pairs of pairs
\`\`\`

**List**: a sequence of pairs. Each \`car\` holds an element, each \`cdr\` points to the rest, and the last \`cdr\` is the empty list \`nil\`. In box-and-pointer diagrams the cdrs form the "spine" and the elements hang off the cars as "ribs". Lists are **closed under cons and cdr**:
- consing onto a list gives a list;
- the \`cdr\` of a non-empty list is a list.

That closure is what makes **induction over lists** work. Test for the end with \`null?\`.`,
    pitfall:
      "(cdr nil) is an error in MIT Scheme. Some Schemes return nil, which would preserve 'the cdr of a list is a list', but you can't rely on it. Always test null? before taking car or cdr.",
    related: ["mit6001-hop-list-procedures", "mit6001-hop-rationals-abstraction-barrier"],
  },
  {
    id: "mit6001-hop-list-procedures",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Write enumerate-interval, list-ref, length and append by 'consing up' and 'cdring down' lists. How does the procedure's shape mirror the data's?",
    back: `The recursive structure of a list (an element, plus a list) dictates the shape of a list procedure:
- the **base case** is the empty list;
- the **recursive case** handles \`car\` and recurses on \`cdr\`, which by closure is a list.

The four procedures below (see the code):
- **Consing up** (\`enumerate-interval\`): glue \`from\` onto the interval from \`from+1\` to \`to\`. The adjoins are **deferred**, so the pairs are created *last element first*.
- **Cdring down**: \`list-ref\` (0-indexed) and \`length\` (the base case is \`nil\`, which has length 0).
- **Both at once**: \`append\` cdrs down the first list while consing up the result.

Example: \`(append (list 1 2) (list 3 4))\` → \`(1 2 3 4)\`.

**Correctness by induction on the list**: if \`append\` works on the shorter list \`(cdr l1)\`, then consing \`(car l1)\` onto the result gives a list with the right elements.

**Cost**: \`append\` copies \`l1\` and **shares** \`l2\`, taking $\\Theta(\\lvert l_1 \\rvert)$ time and space.`,
    code: `(define (enumerate-interval from to)
  (if (> from to)
      nil
      (cons from (enumerate-interval (+ 1 from) to))))

(define (list-ref lst n)            ; 0-indexed
  (if (= n 0)
      (car lst)
      (list-ref (cdr lst) (- n 1))))

(define (length lst)
  (if (null? lst) 0 (+ 1 (length (cdr lst)))))

(define (append l1 l2)
  (if (null? l1)
      l2
      (cons (car l1) (append (cdr l1) l2))))`,
    codeLang: "scheme",
    pitfall:
      "append does not copy its second argument. The result's tail IS l2. That is harmless without mutation, but once set-car!/set-cdr! appear (Lecture 12), changing l2 also changes the appended list.",
    related: ["mit6001-hop-pairs-closure", "mit6001-hop-map-filter-fold"],
  },
  {
    id: "mit6001-hop-rationals-abstraction-barrier",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Build rational numbers behind an abstraction barrier. Why does (+rat 1/2 3/4) give 10/8, and compare reducing by gcd in the selectors vs in the constructor.",
    back: `**Abstraction**:
- constructor \`make-rat\`: integer, integer → rational;
- selectors \`numer\` and \`denom\`: rational → integer;
- **contract**: \`(numer (make-rat n d))\` / \`(denom (make-rat n d))\` = $n/d$.

Operations are written *only* in terms of these:
\`\`\`scheme
(define (+rat x y)
  (make-rat (+ (* (numer x) (denom y)) (* (numer y) (denom x)))
            (* (denom x) (denom y))))
\`\`\`
The common form: **select** the parts, **operate** on simpler data, **construct** the result.

**The 10/8 surprise**: with \`make-rat\` = \`cons\`, adding $\\frac12 + \\frac34$ gives numerator $1 \\cdot 4 + 3 \\cdot 2 = 10$ and denominator $2 \\cdot 4 = 8$. That is *equal* to $\\frac54$ but not in lowest terms.

**Fix it behind the barrier** with \`(gcd a b)\` = \`(if (= b 0) a (gcd b (remainder a b)))\`:

| strategy | where gcd runs | better when |
|---|---|---|
| reduce in the **selectors** | every \`numer\`/\`denom\` call | rationals are made often but read rarely |
| reduce in the **constructor** | once per \`make-rat\` | rationals are read often |

Either way, \`+rat\`, \`*rat\` and \`print-rat\` are **unchanged**. A list representation (\`list\` / \`car\` / \`cadr\`) would also satisfy the contract invisibly.

**Without the barrier**, \`+rat\` written with \`cons\`/\`car\`/\`cdr\` directly would have to be rewritten, along with every other procedure that touches rationals.`,
    pitfall:
      "The barrier only helps if it is never crossed. One procedure that does (car r) instead of (numer r) silently breaks when the representation changes. Scheme enforces nothing here; it is programmer discipline.",
    related: ["mit6001-hop-pairs-closure", "number-theory-euclidean-algorithm"],
  },
  // --- Lecture 6: Higher-order procedures ---
  {
    id: "mit6001-hop-types-contracts",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does 6.001 assign types to Scheme values and procedures, what does a procedure's type promise, and what does 'weakly typed' Scheme give up?",
    back: `A **type** is a set of values that belong together through common behavior.
- **Primitive types**: number, string, boolean, symbol.
- **Compound types**: \`Pair<A, B>\`, and \`List<A>\` = \`Pair<A, List<A> or nil>\`. The list type is defined recursively, mirroring the data.
- **Procedure types**: the number and types of the arguments, and the type of the result, e.g.
  - \`square\`: number → number
  - \`>\`: number, number → boolean
  - \`+\`: number, number → number

**Inferring a type from the body**: \`(lambda (a b c) (if (> a 0) (+ b c) (- b c)))\` must be number, number, number → number:
- \`a\` is compared with \`>\`, so it is a number;
- \`b\` and \`c\` go to \`+\`/\`-\`, so they are numbers;
- both branches return numbers.

\`(lambda (p) (if p "hi" "bye"))\` is boolean → string.

**A type is a contract**: given inputs of the right types, the result has the promised type. It guarantees the *type* of the answer, not its *correctness*.

**Strong vs weak typing**, in the lecture's terms: strongly typed languages make the programmer declare types and catch mismatches before running. Scheme declares none and finds errors **at run time** (e.g. \`(+ 5 "five")\`). That gives more flexibility but makes debugging harder. Good Scheme programmers still reason with types.`,
    pitfall:
      "Under the lecture's convention, a value with several types (an integer is also a number) is given the most general type that fits: + is number, number → number. Special forms like define don't name values, so they have no type.",
    related: ["mit6001-hop-sum-higher-order", "mit6001-hop-compose-type-variables"],
  },
  {
    id: "mit6001-hop-sum-higher-order",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Abstract sum-integers, sum-squares and pi-sum into one higher-order procedure sum. What is its type, and how does integral reuse it?",
    back: `The three procedures differ only in **the term added** and **how to step to the next index**:
- $\\sum_{k=1}^{100} k = \\frac{100 \\cdot 101}{2} = 5050$
- $\\sum_{k=1}^{100} k^2 = \\frac{100 \\cdot 101 \\cdot 201}{6} = 338350$
- $\\sum_{k \\text{ odd}}^{101} \\frac{1}{k^2} \\approx 1.22880$. Only the infinite series equals $\\frac{\\pi^2}{8} \\approx 1.23370$, which gives $\\pi \\approx \\sqrt{8 \\cdot 1.22880} \\approx 3.135$.

Make those two parts **parameters**:
\`\`\`scheme
(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a) (sum term (next a) next b))))

(sum square 1 (lambda (x) (+ x 1)) 100)                 ; 338350
(sum (lambda (k) (/ 1 (square k))) 1 (lambda (k) (+ k 2)) 101)
\`\`\`
**Type**: $(\\text{number} \\to \\text{number}),\\ \\text{number},\\ (\\text{number} \\to \\text{number}),\\ \\text{number} \\to \\text{number}$.
- \`term\` and \`next\` appear in operator position, so they must be procedures.
- \`a\` is compared with \`>\`, so it is a number.

A **higher-order procedure** takes procedures as arguments and/or returns them. The arguments can be named procedures or bare lambdas.

**Building on it**: integration is a sum of rectangle areas, so \`integral\` is \`sum\` times $\\delta$:
$$\\int_a^b f \\approx \\delta \\sum_{k} f(a + k\\delta).$$
Then $\\arctan x = \\int_0^x \\frac{dt}{1 + t^2}$ is just a call to \`integral\`. Each abstraction becomes a primitive for the next.`,
    pitfall:
      "sum as written is a recursive process with Θ(n) deferred additions. Same pattern, same cost. The iterative version needs an accumulator parameter.",
    related: ["mit6001-hop-procedures-as-values", "mit6001-hop-types-contracts"],
  },
  {
    id: "mit6001-hop-procedures-as-values",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Write deriv, average-damp and fixed-point. Why does (fixed-point (lambda (y) (/ x y)) 1) oscillate, and how does average damping fix sqrt?",
    back: `**Returning procedures.** \`deriv\` maps a function to a function, with type $(\\text{num} \\to \\text{num}) \\to (\\text{num} \\to \\text{num})$:
\`\`\`scheme
(define deriv
  (lambda (f)
    (lambda (x) (/ (- (f (+ x dx)) (f x)) dx))))
((deriv square) 5)   ; ≈ 10: two open parens, because (deriv square) IS a procedure
\`\`\`

**Fixed points.** $y$ is a fixed point of $f$ if $f(y) = y$. Iterate $g, f(g), f(f(g)), \\ldots$ until successive values are close:
\`\`\`scheme
(define (close? u v) (< (abs (- u v)) 0.0001))
(define (fixed-point f i-guess)
  (define (try g)
    (if (close? (f g) g) (f g) (try (f g))))
  (try i-guess))
(fixed-point (lambda (x) (+ 1 (/ 1 x))) 1)   ; 1.61806, the golden ratio
\`\`\`

**sqrt as a fixed point**: $\\sqrt{x}$ is the fixed point of $y \\mapsto x/y$. Starting at 1 with $x = 2$, the guesses go $1 \\to 2 \\to 1 \\to 2 \\to \\cdots$, an **undamped oscillation** that never converges. That is a conceptual bug, not a coding bug.

**Average damping**:
\`\`\`scheme
(define (average-damp f) (lambda (x) (average x (f x))))
((average-damp square) 10)  ; → (average 10 (square 10)) → 55

(define (sqrt x)
  (fixed-point (average-damp (lambda (y) (/ x y))) 1))
\`\`\`
For $x = 2$ this gives $1 \\to 1.5 \\to 1.41667 \\to 1.414216 \\to 1.414214$. That is exactly Heron's method, but now with the **fixed-point idea** and the **damping idea** in separate, reusable pieces. A cube root is just a different $f$: $y \\mapsto x/y^2$.`,
    pitfall:
      "((average-damp square) 10) needs two levels of parentheses. (average-damp square 10) passes two arguments to a one-argument procedure. When a procedure returns a procedure, the outer combination applies that returned procedure.",
    related: ["mit6001-hop-sum-higher-order", "mit6001-procs-sqrt-by-averaging"],
  },
  {
    id: "mit6001-hop-map-filter-fold",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define map, filter and fold-right as the three conventional interfaces for list processing, and use them to compute ∑ᵢ₌₀ⁿ f(a + iδ).",
    back: `**map**: transform each element. The output has the same length as the input.

**filter**: keep the elements satisfying a predicate. Example: \`(filter even? (list 1 2 3 4 5 6))\` → \`(2 4 6)\`.

**fold-right**: combine the elements with \`op\`, starting from \`init\` at the end:
$$(\\text{fold-right } op\\ init\\ (x_1 \\ldots x_n)) = op(x_1, op(x_2, \\ldots op(x_n, init))).$$
It generalizes \`add-up\` (init 0, op \`+\`) and \`mult-all\` (init 1, op \`*\`).

**Composition** for the sampled sum $\\sum_{i=0}^{n} f(a + i\\delta)$:
1. generate the indices $0 \\ldots n$;
2. **map** each $i$ to $f(a + i\\delta)$;
3. **fold** with \`+\`.

Many sequence computations reduce to a pipeline of \`map\`, \`filter\` and \`fold-right\`. Lecture 21 reuses the same interfaces on (possibly infinite) streams.`,
    code: `(define (map proc lst)
  (if (null? lst)
      nil
      (cons (proc (car lst)) (map proc (cdr lst)))))

(define (filter pred lst)
  (cond ((null? lst) nil)
        ((pred (car lst))
         (cons (car lst) (filter pred (cdr lst))))
        (else (filter pred (cdr lst)))))

(define (fold-right op init lst)
  (if (null? lst)
      init
      (op (car lst) (fold-right op init (cdr lst)))))

(define (sum f start inc terms)
  (fold-right + 0
              (map (lambda (x) (f (+ start (* x inc))))
                   (generate-interval 0 terms))))`,
    codeLang: "scheme",
    pitfall:
      "fold-right groups from the right: (fold-right - 0 (list 1 2 3)) = 1 − (2 − (3 − 0)) = 2, not (1 − 2) − 3. For a non-associative op, a left fold gives a different answer.",
    related: ["mit6001-hop-list-procedures", "mit6001-hop-sum-higher-order"],
  },
  {
    id: "mit6001-hop-compose-type-variables",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the most general type of compose = (lambda (f g x) (f (g x))), and why does 6.001 need type variables to state it?",
    back: `Tried on numbers, \`compose\` looks like $(\\text{num} \\to \\text{num}),\\ (\\text{num} \\to \\text{num}),\\ \\text{num} \\to \\text{num}$. But nothing in the body forces $x$ to be a number. For example, \`(compose (lambda (p) (if p "hi" "bye")) (lambda (x) (> x 0)) 5)\` returns \`"hi"\`:
- $g$: number → boolean;
- $f$: boolean → string.

**Type variables** stand for "any type, but the same type everywhere this letter appears":
$$\\text{compose}: (A \\to B),\\ (C \\to A),\\ C \\to B.$$

The constraints, read off the body \`(f (g x))\`:
- $f$ and $g$ take one argument each;
- $g$'s argument type matches $x$'s type: $C$;
- $f$'s argument type matches $g$'s result type: $A$;
- compose returns what $f$ returns: $B$.

**Failure cases the type predicts**: passing a two-argument procedure as $f$ (wrong arity), or a $g$ whose argument type isn't $C$.

The same reasoning designs \`repeated\` (Lecture 7). It needs type $(A \\to A),\\ \\text{integer} \\to (A \\to A)$, because the output is fed back in as input.`,
    pitfall:
      "This is parametric polymorphism, but Scheme never checks it. The type is a design and reasoning tool. A statically typed functional language (ML, Haskell) infers exactly this type for compose and rejects mismatched calls before running.",
    related: ["mit6001-hop-types-contracts", "mit6001-hop-repeated-by-types"],
  },
  // --- Lecture 7: Good programming practices ---
  {
    id: "mit6001-hop-repeated-by-types",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Use type reasoning to derive repeated, which returns the n-fold composition of proc, so that ((repeated f n) x) = fⁿ(x).",
    back: `**Specification**: \`repeated\`: $(A \\to A),\\ \\text{integer} \\to (A \\to A)$.
- \`proc\` must map $A$ to $A$, because its output is fed back into it.
- The result must also be $A \\to A$, so it can be used recursively.
- Motivation: multiplication is repeated addition, and exponentiation is repeated multiplication.

**Base case** ($n = 0$): the type says to return an $A \\to A$ procedure that does *nothing*, which is the identity \`(lambda (x) x)\`.

**Recursive case**: return \`(lambda (x) …)\` of type $A \\to A$ that applies \`proc\` to "the result of repeating $n-1$ times".
- \`(repeated proc (- n 1))\` is a *procedure* of type $A \\to A$, not an $A$.
- \`proc\` needs an $A$, so first **apply** it to \`x\`: \`((repeated proc (- n 1)) x)\`.

\`\`\`scheme
(define (repeated proc n)
  (if (= n 0)
      (lambda (x) x)
      (lambda (x)
        (proc ((repeated proc (- n 1)) x)))))

((repeated (lambda (y) (+ y 3)) 4) 0)   ; 12: 0 + 3·4, multiplication by repeated addition
((repeated (lambda (y) (* y 3)) 4) 1)   ; 81: 3⁴, exponentiation by repeated multiplication
\`\`\`
The types forced the shape of the code. Only the identity base case and the extra application were left to fill in.`,
    pitfall:
      "Writing (proc (repeated proc (- n 1))) passes a procedure where proc expects an A. That type error is exactly what this derivation catches. Also note n must be a non-negative integer, or the recursion never reaches 0.",
    related: ["mit6001-hop-compose-type-variables", "mit6001-hop-programming-practice"],
  },
  {
    id: "mit6001-hop-programming-practice",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Summarize 6.001's good-programming methodology: design steps, documentation elements, the four classes of bugs, and the debugging tools (with the sine-series example).",
    back: `**Design**:
1. Choose the data structures (what naturally belongs together).
2. Split the computation into modules: reusable pieces, black boxes defined by role.
3. Lay out the flow of information between modules: what types go in and out.

**Documentation**, for each procedure:
- its goal;
- the types of inputs and outputs;
- the constraints (e.g. $x > 0$);
- the expected state and goal at each stage.

You write it for the reader six months from now, often yourself.

**Bug classes**:
- **Unbound variable**: a typo, or using a name outside the scope of its binding (a parameter or internal define).
- **Wrong number of arguments**.
- **Wrong type**:
  - applying a non-procedure;
  - an argument of the wrong type, often created far upstream, which makes it the hardest to trace.
- **Structural**: the code runs but computes the wrong thing (wrong initial value, wrong update, wrong stopping test).

**Tools**:
- test cases: base cases plus a spread of values;
- \`display\` inside loops;
- the **tracer** (arguments and return value of each call);
- the **stepper** (one substitution-model step at a time);
- the **debugger** (inspect the frames at the error);
- explicit **type/precondition checks** while debugging.

**Sine-series session**, for $\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots$:
- Test $x = 0$: passes.
- Test $\\pi$ and $\\pi/2$: answers far too large. Displaying the state shows all powers of $n$ being used, so step $n$ by 2.
- Still wrong: the signs must alternate. Add a $\\pm1$ parameter.
- Arity error: one call site wasn't updated for the new parameter.
- $\\pi$ now works, but $\\pi/2$ gives about $-1$: the sign's initial value was wrong.

**Lesson**: a single passing test proves little.`,
    pitfall:
      "When you add a parameter to a helper, check every call site. The sine example's arity error came from exactly that.",
    related: ["mit6001-hop-repeated-by-types", "mit6001-hop-types-contracts"],
  },
  // --- Lecture 8: Using higher-order procedures (Escher picture language) ---
  {
    id: "mit6001-hop-picture-language",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In the Henderson/Escher picture language, why is a picture represented as a procedure, and how do rotate90, beside and up-push work with closure to form an embedded language?",
    back: `**Representation**:
- vectors: \`make-vect\`, \`xcor\`, \`ycor\`;
- segments: pairs of vectors;
- a **frame (rectangle)**: an origin $\\mathbf{o}$ and two axis vectors $\\mathbf{u}, \\mathbf{v}$. A point $(x, y)$ of the unit square maps to $\\mathbf{o} + x\\mathbf{u} + y\\mathbf{v}$.

**A picture is a procedure** from a frame to drawing in that frame:
\`\`\`scheme
(define (make-picture seglist)
  (lambda (rect)
    (for-each
      (lambda (segment)
        (let ((b (start-segment segment)) (e (end-segment segment)))
          (draw-line rect (xcor b) (ycor b) (xcor e) (ycor e))))
      seglist)))
\`\`\`
One procedure yields infinitely many versions of the picture: stretched, skewed (non-orthogonal axes), or moved. The line between data and procedure blurs.

**Operations build new frames and ask the old picture to draw in them:**
\`\`\`scheme
(define (rotate90 pict)
  (lambda (rect)
    (pict (make-rectangle (+vect (origin rect) (horiz rect))
                          (vert rect)
                          (scale-vect (horiz rect) -1)))))
(define (beside pict1 pict2 a)
  (lambda (rect)
    (pict1 (make-rectangle (origin rect) (scale-vect (horiz rect) a) (vert rect)))
    (pict2 (make-rectangle (+vect (origin rect) (scale-vect (horiz rect) a))
                           (scale-vect (horiz rect) (- 1 a))
                           (vert rect)))))
(define (up-push pict n)
  (if (= n 0) pict (above (up-push pict (- n 1)) pict .25)))
\`\`\`
\`above\` is \`beside\` conjugated by rotations, and \`together\` draws two pictures in the same frame.

**Closure**: combining pictures yields a picture, so combinations nest, and recursion (\`up-push\`, corner-push, four rotated copies) produces Escher's *Square Limit*.

**The point, an embedded language**:
- primitives = pictures;
- means of combination = \`beside\`/\`above\`/\`rotate\`/\`flip\`, which are closed;
- means of abstraction = Scheme's \`define\`, inherited along with recursion.`,
    pitfall:
      "A picture procedure draws as a side effect when applied to a frame. (rotate90 g) by itself draws nothing. It returns a new picture that draws only when given a rectangle, e.g. via (draw …).",
    related: ["mit6001-hop-procedures-as-values", "mit6001-hop-pairs-closure"],
  },
];
