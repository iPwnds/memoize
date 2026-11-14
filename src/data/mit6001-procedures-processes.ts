// MIT 6.001 Structure and Interpretation of Computer Programs (Spring 2005,
// Eric Grimson, Peter Szolovits, Trevor Darrell) — Lectures 1-4: Scheme
// basics, the substitution model, recursive vs iterative processes, and
// orders of growth. Sourced from the course's own per-lecture online-lecture
// handouts (slide + narration notes, read page by page; code read from the
// slide images), with the textbook (Abelson & Sussman, SICP 2nd ed., linked
// openly from the OCW readings page) for §1.1-1.2 where a definition is only
// on a slide. Every trace and count was re-run in Python.
//
// Corrections / additions beyond the handouts:
// - Lecture 4's fast-exp-1 uses base case (= b 1), so (fast-exp-1 a 0)
//   never terminates (0 is even, (/ 0 2) = 0). The card uses base case
//   (= b 0) and notes the slip.
// - Lecture 4 estimates tree-recursive Fibonacci as "about 2^(n/2)" steps by
//   replacing fib(n-1) with fib(n-2); that is a lower bound. The card adds
//   the exact call count 2·F(n+1) − 1 = Θ(φⁿ) (SICP §1.2.2).
// - Lecture 4 calls factorial-based Pascal "linear in time"; the card adds
//   that this counts each multiplication as one step (bignum costs ignored),
//   which is the course's unit-cost model.
// - Lecture 2 leaves "why must if be a special form?" as an exercise; the
//   card answers it from Lecture 3's account of if and applicative order.
import type { Card } from "./types";

const MODULE = "mit6001-procs";

export const mit6001ProceduresProcessesCards: Card[] = [
  // --- Lecture 1: Introduction to computation ---
  {
    id: "mit6001-procs-declarative-vs-imperative",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the difference between declarative ('what is') and imperative ('how to') knowledge, and why does 6.001 claim computer science is about the latter? Use square roots as the example.",
    back: `**Declarative knowledge** states *what is true*. Geometry, the lecture argues, is really about axioms for this kind of knowledge, not about surveying instruments. The definition of a square root is declarative:
$$\\sqrt{x} = y \\text{ such that } y \\ge 0 \\text{ and } y^2 = x.$$
It lets you *check* a candidate, but says nothing about how to *find* one.

**Imperative knowledge** says *how to*: a sequence of steps that turns one set of facts into new ones. Heron of Alexandria's method is imperative:
1. Make a guess $G$ (say 1).
2. If $G^2$ is close enough to $x$, stop.
3. Otherwise replace $G$ by the average of $G$ and $x/G$, and repeat.

For $x = 2$: $1 \\to 1.5 \\to 1.41667 \\to 1.41422$.

**The 6.001 claim**: computer science is no more about computers than geometry is about surveying tools. It is about capturing **"how to" knowledge**:
- A **procedure** is a description (the recipe).
- A **process** is the actual evolution of a computation when a procedure is applied (baking the recipe).

The course's tools for controlling complexity build on this: black-box **abstraction**, **conventional interfaces**, and **metalinguistic abstraction** (designing new languages).`,
    pitfall:
      "Don't confuse procedure and process. The same procedure text can generate very different processes (e.g. recursive vs iterative factorial), and the course's analysis is all about the process.",
    related: ["mit6001-procs-sqrt-by-averaging", "mit6001-procs-language-elements"],
  },
  {
    id: "mit6001-procs-language-elements",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What three elements does every language for describing processes need, and how do they appear in Scheme (primitives, combinations, define)?",
    back: `Every language for capturing processes needs:
1. **Primitives**: the atomic elements. In Scheme these are **self-evaluating** data (numbers, strings, booleans) and **built-in procedures** named by symbols such as \`+\`, \`*\`, \`<\`.
2. **Means of combination**: building bigger expressions from smaller ones. In Scheme this is the **combination**: \`(\` operator operand… \`)\`. To evaluate it, evaluate all subexpressions (in any order), then **apply** the operator's value to the operands' values. Combinations nest arbitrarily: \`(+ 4 (* 2 3))\` → 10.
3. **Means of abstraction**: naming a compound thing so it can be used like a primitive. In Scheme this is \`(define score 23)\`, which pairs the name with a value in a table called the **environment**.

Names are expressions too. \`+\` evaluates to the built-in addition procedure by looking up the name. So after \`(define fred +)\`, the expression \`(fred 3 4)\` returns 7. There's nothing special about the symbol \`+\`.

The **read–eval–print loop**: the *reader* turns typed text into an internal form, the *evaluator* reduces it to a value (recursively, for compound expressions), and the *printer* displays the value. The printed form may differ from the internal representation.`,
    pitfall:
      "define is a special form, not a combination: its name operand is NOT evaluated (it isn't bound yet). Its own return value is unspecified, so don't rely on what the REPL prints after a define.",
    related: ["mit6001-procs-lambda-procedure-objects", "mit6001-procs-substitution-model"],
  },
  // --- Lecture 2: Scheme basics ---
  {
    id: "mit6001-procs-lambda-procedure-objects",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does evaluating a lambda expression produce, when is its body evaluated, and how does (define (square x) …) relate to lambda?",
    back: `\`(lambda (x) (* x x))\` reads as "to process something, multiply it by itself". It is a **special form**:
- **Syntax**: the keyword \`lambda\`, a list of **formal parameters** (possibly empty: \`()\`), and a **body**.
- **Semantics**: the value of a lambda expression is a **procedure object**, an internal representation holding the parameters and the body.

The body is **not evaluated** when the lambda is evaluated. It is stored as a pattern and only evaluated when the procedure is **applied**:
\`\`\`scheme
((lambda (x) (* x x)) 5)   ; => 25: substitute 5 for x in the body
\`\`\`

**Naming a procedure** combines lambda with define:
\`\`\`scheme
(define square (lambda (x) (* x x)))
(define (square x) (* x x))     ; syntactic sugar for the line above
\`\`\`
The sugared form still hides a lambda. Evaluating it creates a procedure object, and define binds \`square\` to it.

**Procedural abstraction**: parameter names are local to the lambda, so you can rename them, or reimplement \`average\` as \`(* (+ x y) 0.5)\`, without changing any caller.`,
    pitfall:
      "Evaluating (lambda (x) (* x x)) does not compute anything. It returns a procedure, not a number. A procedure runs only when it appears in operator position of a combination and is applied.",
    related: ["mit6001-procs-language-elements", "mit6001-procs-sqrt-by-averaging"],
  },
  {
    id: "mit6001-procs-sqrt-by-averaging",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Build sqrt from procedural abstractions: close-enuf?, improve (via average) and a looping sqrt-loop. Trace (sqrt 2).",
    back: `**Decompose the process** into modules:
1. When is a guess **close enough**?
2. How do we make a **new guess**?
3. How do we **control** the process, so the new guess replaces the old one?

The control step needs a decision, which means the special form \`(if <predicate> <consequence> <alternative>)\`. The **predicate** is evaluated first. If it is true, only the consequence is evaluated; otherwise only the alternative.

\`sqrt-loop\` calls itself with the improved guess. That self-reference is the whole looping mechanism; Scheme needs no separate loop construct.

**Trace** of \`(sqrt 2)\` → \`(sqrt-loop 1.0 2)\`. Each row tests $\\lvert G^2 - 2 \\rvert < 0.001$:

| guess $G$ | $G^2$ | close enough? |
|---|---|---|
| 1.0 | 1.0 | no |
| 1.5 | 2.25 | no |
| 1.416667 | 2.006944 | no |
| 1.414216 | 2.000006 | yes, return |

Each module is a black box. \`close-enuf?\` relies on \`square\` without caring how it is implemented.`,
    code: `(define close-enuf?
  (lambda (guess x)
    (< (abs (- (square guess) x)) 0.001)))

(define average (lambda (a b) (/ (+ a b) 2)))

(define improve
  (lambda (guess x) (average guess (/ x guess))))

(define sqrt-loop
  (lambda (G X)
    (if (close-enuf? G X)
        G
        (sqrt-loop (improve G X) X))))

(define sqrt (lambda (x) (sqrt-loop 1.0 x)))`,
    codeLang: "scheme",
    pitfall:
      "The absolute test |G² − x| < 0.001 is naive (as the lecture says). For very small x, such as 0.0001, it accepts guesses that are far off in relative terms. A relative tolerance is more robust.",
    related: ["mit6001-procs-declarative-vs-imperative", "mit6001-procs-if-special-form"],
  },
  // --- Lecture 3: Procedures, processes, and recursion ---
  {
    id: "mit6001-procs-substitution-model",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "State the substitution model's evaluation rules and use them to trace (average 5 (square 3)). What is 'applicative order'?",
    back: `**Rules** (a model for reasoning about evolution, not a description of the machine):
- **Self-evaluating** (number, string, boolean): the value is the expression itself.
- **Name**: replace it by the value bound to it.
- **lambda**: replace it by a procedure object.
- **Other special forms** (\`if\`, \`define\`, …): follow that form's own rule.
- **Combination**: evaluate *all* subexpressions. Then:
  - If the operator is **primitive**, apply it directly.
  - If it is **compound**, substitute each argument *value* for its parameter in the body, replace the whole combination by that instantiated body, and repeat.

**Trace**, with \`square\` = \`(lambda (x) (* x x))\` and \`average\` = \`(lambda (x y) (/ (+ x y) 2))\`:
\`\`\`
(average 5 (square 3))
(average 5 (* 3 3))     ; operand is a combination: reduce it first
(average 5 9)
(/ (+ 5 9) 2)           ; substitute 5, 9 for x, y in average's body
(/ 14 2)
7
\`\`\`

**Applicative order**: operands are evaluated *before* the procedure is applied. That is why \`(square 3)\` became 9 before \`average\` was entered. There is no clash between the two \`x\`s: each substitution only touches its own procedure's body.`,
    pitfall:
      "The substitution model breaks down once assignment (set!) appears, because a name no longer stands for one fixed value. Lecture 15 replaces it with the environment model.",
    related: ["mit6001-procs-recursive-factorial", "mit6001-procs-if-special-form"],
  },
  {
    id: "mit6001-procs-if-special-form",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why must if be a special form rather than an ordinary procedure? What would go wrong with fact if if were a procedure?",
    back: `\`(if p c a)\` evaluates the **predicate first**, before looking at the other two parts. It then evaluates **exactly one** of the consequent and alternative.

An **ordinary procedure** under **applicative order** evaluates *all* its operands before it is applied. If \`if\` were a procedure, \`(fact 1)\` would evaluate
\`\`\`scheme
(my-if (= n 1) 1 (* n (fact (- n 1))))
\`\`\`
by first computing all three operands, including \`(fact 0)\`. That needs \`(fact -1)\`, and so on, so the recursion **never terminates**. The base case can only stop the unwinding if the recursive branch is *not* evaluated.

So \`if\` exists to **control the order of evaluation**. The same holds for \`cond\`, which tests its clauses in order and evaluates only the body of the first clause whose predicate is true (\`else\` counts as true). Likewise \`define\` and \`lambda\` are special forms because some of their parts must *not* be evaluated.`,
    pitfall:
      "Defining (define (my-if p c a) (cond (p c) (else a))) looks equivalent and even works on non-recursive examples. It fails only when a branch diverges or has side effects, which makes the bug easy to miss.",
    related: ["mit6001-procs-recursive-factorial", "mit6001-procs-substitution-model"],
  },
  {
    id: "mit6001-procs-recursive-factorial",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Design factorial with the three-step recipe (wishful thinking, decompose, smallest case). Trace (fact 3) with the substitution model. What shape does the process have?",
    back: `**Recipe for recursive procedures:**
1. **Wishful thinking**: assume you can already solve *smaller* instances.
2. **Decompose**: write the problem as simple operations plus a smaller instance of itself. Here $n! = n \\cdot (n-1)!$.
3. **Smallest case**: find a case you can solve directly ($1! = 1$), so the unwinding stops.

The result has a **test**, a **base case**, and a **recursive case**:
\`\`\`scheme
(define fact
  (lambda (n)
    (if (= n 1)
        1
        (* n (fact (- n 1))))))
\`\`\`

**Trace:**
\`\`\`
(fact 3)
(* 3 (fact 2))
(* 3 (* 2 (fact 1)))
(* 3 (* 2 1))
(* 3 2)
6
\`\`\`

**Shape**: the expression **grows** with a chain of **deferred operations** (the pending multiplications) until the base case. Then it **contracts** as they complete. This is a **recursive process**.

Without step 3 (no base case), the substitution keeps unwinding forever, because every multiplication waits on another \`fact\` call.`,
    pitfall:
      "This fact assumes n ≥ 1, which is the course's stated universe. (fact 0) recurses forever, because (= n 1) is never true for 0, −1, … . Always state the domain a recursive procedure is correct on.",
    related: ["mit6001-procs-iterative-factorial", "mit6001-procs-induction-correctness", "recursion-dc-call-stack-trace"],
  },
  {
    id: "mit6001-procs-iterative-factorial",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Derive an iterative factorial from a table of state variables (product, counter, n). Trace (ifact 4) and explain why it runs in constant space.",
    back: `**Idea**: multiplication is associative and commutative, so you can carry a running product instead of a stack of pending multiplications. Make a **table** with one column per piece of state and one row per step:

| product | counter | n |
|---|---|---|
| 1 | 1 | 4 |
| 1 | 2 | 4 |
| 2 | 3 | 4 |
| 6 | 4 | 4 |
| 24 | 5 | 4 |

- **Update rules**: product ← product · counter; counter ← counter + 1.
- **Stop** when counter > n. The answer is in the product column of the last row.
- **First row** ($0! = 1$): product = 1, counter = 1.
- The column $n$ never changes, but it is still state the process needs.

**Trace**: \`(ifact 4)\` → \`(ifact-helper 1 1 4)\` → \`(ifact-helper 1 2 4)\` → \`(ifact-helper 2 3 4)\` → \`(ifact-helper 6 4 4)\` → \`(ifact-helper 24 5 4)\` → 24.

Each call's value **is** the next call's value. There are **no deferred operations**, and the expression stays the same size, so space is constant. This is an **iterative process**, even though \`ifact-helper\` is a recursive *procedure*.`,
    code: `(define ifact (lambda (n) (ifact-helper 1 1 n)))

(define ifact-helper
  (lambda (product counter n)
    (if (> counter n)
        product
        (ifact-helper (* product counter)
                      (+ counter 1)
                      n))))`,
    codeLang: "scheme",
    pitfall:
      "\"Recursive procedure\" (it calls itself) is not the same as \"recursive process\" (it builds deferred work). Constant space depends on the implementation not growing a stack for tail calls. Scheme guarantees this (it is tail-recursive); many languages, such as C and Python, do not.",
    related: ["mit6001-procs-recursive-factorial", "mit6001-procs-orders-of-growth"],
  },
  {
    id: "mit6001-procs-induction-correctness",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove by induction that ∑ᵢ₌₀ⁿ 2ⁱ = 2ⁿ⁺¹ − 1, and that the recursive fact procedure computes n! for every integer n ≥ 1.",
    back: `**Induction**: to prove $P(n)$ for all $n$ in a universe starting at $n_0$:
- prove the **base case** $P(n_0)$;
- prove $\\forall n.\\, P(n) \\Rightarrow P(n+1)$.

**Sum of powers of 2** (universe: $n \\ge 0$):
- *Base*: $n = 0$ gives $2^0 = 1 = 2^1 - 1$.
- *Step*: assume $\\sum_{i=0}^{n} 2^i = 2^{n+1} - 1$. Then
$$\\sum_{i=0}^{n+1} 2^i = \\Big(\\sum_{i=0}^{n} 2^i\\Big) + 2^{n+1} = (2^{n+1} - 1) + 2^{n+1} = 2^{n+2} - 1.$$

**fact is correct** (universe: integers $n \\ge 1$; the proposition is that \`(fact n)\` evaluates to $n!$):
- *Base*, $n = 1$: the predicate \`(= n 1)\` is true, so \`if\` returns the consequent 1, and $1! = 1$.
- *Step*: assume \`(fact n)\` returns $n!$, and evaluate \`(fact (+ n 1))\`. Since $n + 1 \\ne 1$, \`if\` takes the alternative \`(* (+ n 1) (fact n))\`. By the substitution model its subexpressions evaluate to the multiplication procedure, $n+1$, and (by the hypothesis) $n!$. Applying \`*\` gives $(n+1) \\cdot n! = (n+1)!$.

So \`(fact n)\` $= n!$ for all $n \\ge 1$.

**Design lesson**: induction mirrors the recursive-design recipe. The base case is the smallest problem, and the inductive step is wishful thinking made rigorous.`,
    pitfall:
      "The proof holds only on the stated universe. For n = 0 the base case is never reached, and the procedure doesn't terminate. The proof covers correct inputs only.",
    related: ["mit6001-procs-recursive-factorial", "mit6120-proofs-induction-axiom-sum", "mit6006-foundations-induction-correctness"],
  },
  // --- Lecture 4: Orders of growth and kinds of procedures ---
  {
    id: "mit6001-procs-orders-of-growth",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "How does 6.001 measure the time and space of a process with the substitution model as rewrite rules? Give Θ for recursive vs iterative factorial.",
    back: `**Rewrite-rule view of the substitution model**:
- Numbers, primitive names and lambdas are left alone.
- A user-defined name is rewritten to its value.
- An \`if\` is rewritten to its consequent or alternative.
- A compound application is rewritten to the instantiated body.

**Order of growth**: let $n$ be the problem size and $R(n)$ the resources used. Then $R(n) = \\Theta(f(n))$ if there are constants $k_1, k_2 > 0$ with $k_1 f(n) \\le R(n) \\le k_2 f(n)$ for all large $n$.
- **Time** = the number of primitive rewrite steps.
- **Space** = the largest number of deferred operations held at any moment.

**Factorial**:
- **Recursive** \`fact\`: expands to $n$ deferred multiplications and then contracts. That is about $2n$ steps, so time is $\\Theta(n)$ and space is $\\Theta(n)$.
- **Iterative** \`ifact\`: one step per counter value and no deferred operations. Time is $\\Theta(n)$ and space is $\\Theta(1)$.

Constant factors (2n vs n steps) don't matter: both are linear in time. The difference that matters is the **shape** of the process.`,
    complexity: {
      structure: "Factorial (6.001 Lecture 4)",
      operations: [
        { op: "fact (recursive process)", time: "Θ(n)", space: "Θ(n)" },
        { op: "ifact (iterative process)", time: "Θ(n)", space: "Θ(1)" },
      ],
      caveat: "Unit-cost arithmetic: each multiplication counts as one step.",
    },
    related: ["mit6001-procs-iterative-factorial", "mit6001-procs-tree-recursion-fibonacci", "complexity-analysis-big-theta"],
  },
  {
    id: "mit6001-procs-tree-recursion-fibonacci",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "Why does the direct recursive fib take exponential time but only linear space? How many calls does (fib n) make?",
    back: `\`\`\`scheme
(define fib
  (lambda (n)
    (cond ((= n 0) 0)
          ((= n 1) 1)
          (else (+ (fib (- n 1)) (fib (- n 2)))))))
\`\`\`
Here \`cond\` tests clauses in order and evaluates the first one whose predicate is true; \`else\` always matches. There are **two base cases** and **two** recursive calls per step, which gives a **tree recursion**.

**Time**: each node spawns two subproblems. The lecture's estimate replaces $T(n-1)$ by $T(n-2)$:
$$T(n) \\gtrsim 2T(n-2) \\gtrsim 4T(n-4) \\gtrsim \\cdots \\approx 2^{n/2}.$$
This is a *lower bound*. The exact number of calls is $C(n) = 1 + C(n-1) + C(n-2)$ with $C(0) = C(1) = 1$, so $C(n) = 2F(n+1) - 1$. For example, \`(fib 4)\` makes 9 calls and \`(fib 10)\` makes 177. That gives $\\Theta(\\varphi^n)$ with $\\varphi = \\frac{1 + \\sqrt5}{2} \\approx 1.618$, which is exponential either way.

**Space**: only one path of the tree is pending at a time. The maximum depth is $n$, so space is $\\Theta(n)$.

Much of the work is **recomputation**: \`(fib (- n 2))\` is computed again inside \`(fib (- n 1))\`. An iterative version with state $(a, b) \\to (a + b, a)$ runs in $\\Theta(n)$ time and $\\Theta(1)$ space.`,
    complexity: {
      structure: "Fibonacci (6.001 Lecture 4)",
      operations: [
        { op: "tree-recursive fib", time: "Θ(φⁿ)", space: "Θ(n)", note: "lecture's estimate: ≈ 2^(n/2), a lower bound" },
        { op: "iterative fib", time: "Θ(n)", space: "Θ(1)" },
      ],
    },
    pitfall:
      "Exponential time with only linear space is the signature of tree recursion. Space follows the depth of the call tree, not its size.",
    related: ["mit6001-procs-orders-of-growth", "mit6001-procs-pascal-triangle", "mit6006-dp-fibonacci-memoization"],
  },
  {
    id: "mit6001-procs-fast-exponentiation",
    tier: 1,
    module: MODULE,
    type: "complexity",
    front: "Compute aᵇ with only multiplication: give a linear-recursive, an iterative, and a logarithmic version, and analyze each.",
    back: `**1. Linear recursive.** $a^b = a \\cdot a^{b-1}$, with $a^0 = 1$:
\`\`\`scheme
(define my-expt
  (lambda (a b)
    (if (= b 0) 1 (* a (my-expt a (- b 1))))))
\`\`\`
This has the same shape as \`fact\`: $\\Theta(b)$ time and $\\Theta(b)$ space (deferred multiplications).

**2. Iterative.** Table columns are the product and the count of multiplications left. Start at $(1, b)$, update product ← product · a and count ← count − 1, and stop at count = 0:
\`\`\`scheme
(define exp-i (lambda (a b) (exp-i-help 1 b a)))
(define exp-i-help
  (lambda (prod count a)
    (if (= count 0) prod (exp-i-help (* prod a) (- count 1) a))))
\`\`\`
$\\Theta(b)$ time and $\\Theta(1)$ space.

**3. Logarithmic.** If $b$ is even, $a^b = (a^2)^{b/2}$. If $b$ is odd, $a^b = a \\cdot a^{b-1}$:
\`\`\`scheme
(define fast-exp
  (lambda (a b)
    (cond ((= b 0) 1)        ; lecture: (= b 1) a, see pitfall
          ((even? b) (fast-exp (* a a) (/ b 2)))
          (else (* a (fast-exp a (- b 1)))))))
\`\`\`
An odd $b$ becomes even after one step, so **at most two steps halve $b$**. After $2k$ steps the size has dropped by $2^k$, and the procedure finishes when $2^k \\approx b$. Time is $\\Theta(\\log b)$. The odd branch defers a multiplication, so space is $\\Theta(\\log b)$ too.`,
    complexity: {
      structure: "Exponentiation aᵇ (6.001 Lecture 4)",
      operations: [
        { op: "linear recursive", time: "Θ(b)", space: "Θ(b)" },
        { op: "iterative (state table)", time: "Θ(b)", space: "Θ(1)" },
        { op: "successive squaring", time: "Θ(log b)", space: "Θ(log b)" },
      ],
      caveat: "Unit-cost multiplication.",
    },
    pitfall:
      "The lecture's fast-exp-1 uses base case (= b 1). Then (fast-exp-1 a 0) never terminates: 0 is even and (/ 0 2) = 0. Use (= b 0) as the base case.",
    related: ["mit6001-procs-orders-of-growth", "number-theory-modular-exponentiation"],
  },
  {
    id: "mit6001-procs-pascal-triangle",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Compare the tree-recursive Pascal's-triangle procedure with versions built on the closed form n!/(j!(n−j)!) — what are the orders of growth?",
    back: `Rows are numbered $n = 0, 1, 2, \\ldots$, and row $n$ has $n + 1$ entries $P(j, n)$, $0 \\le j \\le n$. The first and last entries are 1. Every other entry is the sum of the two entries above it: $P(j, n) = P(j-1, n-1) + P(j, n-1)$. For example, row 4 is 1 4 6 4 1.

**Tree-recursive version**: two base cases ($j = 0$ and $j = n$) and two recursive calls per step, just like \`fib\`. That means **exponential time and linear space**.

**Closed form**: $P(j, n)$ counts the size-$j$ subsets of an $n$-set. There are $n(n-1)\\cdots(n-j+1) = \\frac{n!}{(n-j)!}$ ordered picks, and each subset is picked in $j!$ orders, so
$$P(j, n) = \\binom{n}{j} = \\frac{n!}{j!\\,(n-j)!}, \\qquad \\text{e.g. } \\binom{5}{2} = 10.$$

| version | time | space |
|---|---|---|
| tree recursion | exponential | $\\Theta(n)$ |
| three calls to recursive \`fact\` | $\\Theta(n)$ | $\\Theta(n)$ |
| three calls to iterative \`ifact\` | $\\Theta(n)$ | $\\Theta(1)$ |
| two direct products (numerator $n \\cdots (n-j+1)$, denominator $j!$) | $\\Theta(n)$ | $\\Theta(1)$ |

The last version does fewer multiplications in practice, but it is in the **same order-of-growth class** as the one before it.

**Lesson**: the same function can have solutions with very different costs. Rethinking the problem (here, using combinatorics) can turn an exponential process into a linear one.`,
    pitfall:
      "These Θ(n) bounds count each multiplication as one step. n! grows to about n log n bits, so with true bignum costs the factorial versions are slower than linear. They are still far better than the exponential tree.",
    related: ["mit6001-procs-tree-recursion-fibonacci", "mit6001-procs-iterative-factorial"],
  },
];
