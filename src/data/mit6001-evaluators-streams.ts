// MIT 6.001 Structure and Interpretation of Computer Programs (Spring 2005,
// Eric Grimson, Peter Szolovits, Trevor Darrell) — Lectures 19-21: building
// an interpreter step by step (Scheme*), the full metacircular evaluator
// (eval/apply, syntax vs semantics, environments, lexical vs dynamic
// scoping), and lazy evaluation — normal order, thunks, memoization,
// programmer-declared laziness and streams. Sourced from the course's own
// online-lecture handouts (Lectures 19 and 21 each in two parts) plus the
// three code handouts (Interpreter Code, Evaluator Code, Lazy Evaluator
// Code), read page by page; SICP §4.1, §4.2 and §3.5 (the assigned
// readings) for context.
//
// Corrections / additions beyond the handouts:
// - Evaluator Code handout: the syntax section defines (operators app) but
//   m-eval calls (operator exp); the selector must be named operator (as it
//   is in the Lazy Evaluator Code). The card uses operator.
// - Lazy Evaluator Code: the cond clause calls (eval (cond->if exp) env)
//   instead of l-eval, which would hand cond bodies to the underlying
//   (strict) Scheme evaluator. The card notes it should be l-eval.
// - The Lazy Evaluator Code defines actual-value twice (identically); only
//   one definition is shown.
// - Lecture 20's dynamic-scoping example (pooh/bear) is traced: under
//   dynamic scoping (pooh 9) = 29; under lexical scoping it is an unbound-
//   variable error for x.
// - Lecture 21's "100th prime" example uses (list-ref … 100); list-ref is
//   0-indexed, so index 100 is the 101st prime (547). The card uses index 99
//   for the 100th prime, 541 (both checked by sieve).
import type { Card } from "./types";

const MODULE = "mit6001-eval";

export const mit6001EvaluatorsStreamsCards: Card[] = [
  // --- Lecture 19: Interpretation ---
  {
    id: "mit6001-eval-interpreter-stages",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the stages of a Lisp-style interpreter, what does each stage take in and produce, and why does 6.001 say 'the evaluator defines the language'?",
    back: `**Stages**, by input and output:
1. **Lexical analyzer**: turns a string of characters into **tokens**: \`(\`, \`plus*\`, \`24\`, … .
2. **Parser**: turns tokens into a **tree**. Each \`(\` starts a new list (one level down), and self-evaluating tokens become internal values (numbers, symbols).
3. **Evaluator**, working with an **environment**: takes the tree plus the environment (a "dictionary" of name ↦ value) and walks the tree with a set of rules down to a value.
4. **Printer**: turns the value back into text.

6.001 reuses Scheme's own reader (lexer and parser) and printer, and builds only the **evaluator**. That is the heart of the interpreter.

**Why the evaluator defines the language**: every expression's meaning is whatever the evaluation process deduces. A program that carries out that deduction is therefore an exact specification of which expressions are legal and what they mean.

The **environment model** (Lecture 15) was already this description, given as rules. The evaluator is the same description written as a procedure. **Change the evaluator and you change the language**: Lectures 20–21 get dynamic scoping and lazy evaluation from tiny edits.`,
    pitfall:
      "'Metacircular' means the evaluator for Scheme is written in Scheme. It explains the semantics, but it inherits some behavior (evaluation order of operands, tail calls, error handling) from the host Scheme unless it makes them explicit.",
    related: ["mit6001-eval-scheme-star-evolution", "mit6035-parse-compiler-pipeline", "mit6001-procs-language-elements"],
  },
  {
    id: "mit6001-eval-scheme-star-evolution",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Trace how the Scheme* evaluator grows: from plus* sums, to define*, to if*, to a generic application case. Why must the application clause come last in eval?",
    back: `**1. Arithmetic.**
\`\`\`scheme
(define (eval exp)
  (cond ((number? exp) exp)
        ((sum? exp) (eval-sum exp))          ; tag-check: (car exp) is plus*
        (else (error "unknown expression " exp))))
(define (eval-sum exp)
  (+ (eval (cadr exp)) (eval (caddr exp))))
(eval '(plus* 24 (plus* 5 6)))               ; 35
\`\`\`
Dispatch on the type tag, walk the tree with \`cadr\`/\`caddr\`, and recurse until only primitive operations on numbers remain. Then the deferred additions finish: $5 + 6 = 11$, $24 + 11 = 35$.

**2. Names.** Add \`(symbol? exp)\` → \`lookup\` in a table, and \`define*\` → \`eval-define\`. \`eval-define\` takes the **name unevaluated** and evaluates only the value. That makes it the first **special form**. \`(define* x* (plus* 4 5))\` then \`(plus* x* 2)\` gives 11.

**3. Branching.**
- \`greater*\` works like \`plus*\`: evaluate both parts, then call Scheme's \`>\`.
- \`if*\` is a special form: evaluate the predicate, then **only one** branch.

**4. Applications.** Instead of a clause per operator:
- evaluate the **operator** subexpression to a procedure, looked up by name in the environment (\`plus*\` ↦ \`(primitive #[+])\`);
- evaluate all operand subexpressions (\`map eval\`);
- \`apply\` the procedure to the resulting values.

Adding a primitive now just means adding a binding.

**Clause order**: primitives (numbers, symbols) first, then special forms (\`define*\`, \`if*\`, …), and **application last**. The application test is just "is it a pair?", so it would also catch \`(if* …)\` and \`(define* …)\` if it came earlier. The \`if*\` example never calls \`apply\`: special forms control evaluation themselves.`,
    pitfall:
      "Treating if* as an application would evaluate both branches, the same reason if must be a special form in Scheme (Lecture 3). The evaluator makes the distinction concrete: applications go through apply, and special forms don't.",
    related: ["mit6001-eval-interpreter-stages", "mit6001-eval-lambda-eval-apply-cycle", "mit6001-procs-if-special-form"],
  },
  {
    id: "mit6001-eval-lambda-eval-apply-cycle",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Add lambda* to the Scheme* evaluator: what does eval-lambda build, how does apply handle a compound procedure, and what is the eval/apply cycle? Trace (twice* 4) with twice* = (lambda* (x*) (plus* x* x*)).",
    back: `**First, pass the environment explicitly**: \`(eval exp env)\`. Every handler takes \`env\`, and operands are evaluated with \`(map (lambda (e) (eval e env)) operands)\`.

**eval-lambda** only manipulates the tree, with **no evaluation**:
\`\`\`scheme
(define (eval-lambda exp env)
  (let ((args (cadr exp)) (body (caddr exp)))   ; one-expression body
    (make-compound args body env)))             ; the "double bubble" as a list
\`\`\`
\`(lambda* (x*) (plus* x* x*))\` in GE → \`(compound (x*) (plus* x* x*) <GE>)\`.

**apply** now has two cases:
\`\`\`scheme
(define (apply operator operands)
  (cond ((primitive? operator)
         (scheme-apply (get-scheme-procedure operator) operands))
        ((compound? operator)
         (eval (body operator)
               (extend-env-with-new-frame (parameters operator) operands
                                          (env operator))))
        (else (error "operator not a procedure: " operator))))
\`\`\`
The new frame extends the **procedure's** environment (lexical scoping), not the caller's.

**Trace** \`(twice* 4)\` in GE:
1. It is an application. Look up \`twice*\` to get the compound procedure, and evaluate the operands to \`(4)\`.
2. \`apply\` builds E1 = {x*: 4} → GE and evaluates \`(plus* x* x*)\` in E1.
3. That is an application: \`plus*\` is found in GE as a primitive, and \`x*\` is found in E1 as 4.
4. Scheme's \`+\` gives **8**.

**The cycle**: eval of an expression in an environment reduces to **apply** of a procedure to values, which reduces to **eval** of a body in a new environment, and so on until only primitives remain. Neither call leaves a pending operation, so an iterative Scheme procedure runs iteratively in the evaluator too, because the host Scheme is tail-recursive.

**Punch line**: delete every \`*\` and this *is* a Scheme interpreter.`,
    pitfall:
      "Calling eval on the body with the caller's env instead of (env operator) silently switches the language to dynamic scoping. That is exactly the one-line change Lecture 20 makes on purpose.",
    related: ["mit6001-eval-scheme-star-evolution", "mit6001-eval-metacircular-core", "mit6001-env-lambda-application-rules"],
  },
  // --- Lecture 20: The metacircular evaluator ---
  {
    id: "mit6001-eval-metacircular-core",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Write the core of the 6.001 metacircular evaluator: m-eval's dispatch and m-apply. Why is a procedure body evaluated as a sequence?",
    back: `\`m-eval\` dispatches on expression type through **syntax abstractions**, with no raw \`car\`/\`cdr\`. The order is:
1. primitives (self-evaluating, variables, quote);
2. special forms (\`set!\`, \`define\`, \`if\`, \`lambda\`, \`begin\`, \`cond\`);
3. **application** last.

\`cond\` is handled by rewriting it into nested \`if\`s and evaluating that.

\`m-apply\` sends primitives to the host Scheme. For a compound procedure it evaluates the body **as a sequence** in a new frame, which extends the procedure's environment and binds the parameters to the arguments.

**Why a sequence**: once there is mutation, earlier expressions in a body can matter for their side effects. \`eval-sequence\` evaluates them in order and returns the last value. \`(begin e₁ … eₙ)\` uses the same machinery.

**The other handlers**, as in the code handout:
- \`eval-if\`: evaluate the predicate, then exactly one branch.
- \`list-of-values\`: evaluate the operands into a list.
- \`eval-definition\` and \`eval-assignment\`: evaluate only the value part, then call \`define-variable!\` or \`set-variable-value!\`.

Together, eval and apply **are** the environment model's rules, written as code.`,
    code: `(define (m-eval exp env)
  (cond ((self-evaluating? exp) exp)
        ((variable? exp) (lookup-variable-value exp env))
        ((quoted? exp) (text-of-quotation exp))
        ((assignment? exp) (eval-assignment exp env))
        ((definition? exp) (eval-definition exp env))
        ((if? exp) (eval-if exp env))
        ((lambda? exp)
         (make-procedure (lambda-parameters exp) (lambda-body exp) env))
        ((begin? exp) (eval-sequence (begin-actions exp) env))
        ((cond? exp) (m-eval (cond->if exp) env))
        ((application? exp)
         (m-apply (m-eval (operator exp) env)
                  (list-of-values (operands exp) env)))
        (else (error "Unknown expression type -- EVAL" exp))))

(define (m-apply procedure arguments)
  (cond ((primitive-procedure? procedure)
         (apply-primitive-procedure procedure arguments))
        ((compound-procedure? procedure)
         (eval-sequence
          (procedure-body procedure)
          (extend-environment (procedure-parameters procedure)
                              arguments
                              (procedure-environment procedure))))
        (else (error "Unknown procedure type -- APPLY" procedure))))

(define (eval-sequence exps env)
  (cond ((last-exp? exps) (m-eval (first-exp exps) env))
        (else (m-eval (first-exp exps) env)
              (eval-sequence (rest-exps exps) env))))`,
    codeLang: "scheme",
    pitfall:
      "list-of-values conses (m-eval first) onto the rest, so operand evaluation order is whatever the host Scheme uses for cons's arguments. MIT Scheme may go right to left. To fix the order, sequence the evaluations explicitly with let.",
    related: ["mit6001-eval-lambda-eval-apply-cycle", "mit6001-eval-syntax-vs-semantics", "mit6001-eval-environment-representation"],
  },
  {
    id: "mit6001-eval-syntax-vs-semantics",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Why does 6.001 separate syntax procedures from eval/apply? Show (1) switching to an explicit (CALL proc ARGS arg …) syntax and (2) desugaring let into a lambda application, tracing (let ((x 1) (y 2)) (+ x y)).",
    back: `**Semantics** = \`m-eval\` and \`m-apply\`, which say how expressions get values. **Syntax** = the small procedures that recognize forms and pull out their pieces:
\`\`\`scheme
(define (tagged-list? exp tag) (and (pair? exp) (eq? (car exp) tag)))
(define (if? exp) (tagged-list? exp 'if))
(define (application? exp) (pair? exp))
(define (operator app) (car app))
(define (operands app) (cdr app))
\`\`\`
Because eval only ever goes through this interface, **syntax can change without touching semantics**.

**(1) A verbose call syntax**, e.g. \`(CALL (lambda (x) (* x x)) ARGS 5)\` → 25:
\`\`\`scheme
(define (application? exp) (tagged-list? exp 'CALL))
(define (operator app) (cadr app))
(define (operands app) (cdddr app))   ; skip CALL, the operator, and ARGS
\`\`\`
\`m-eval\` and \`m-apply\` are unchanged.

**(2) Syntactic sugar.** \`let\` is just applying a lambda, so eval dispatches \`((let? exp) (m-eval (let->combination exp) env))\`:
\`\`\`scheme
(define (let-bound-variables e) (map car (cadr e)))
(define (let-values e) (map cadr (cadr e)))
(define (let-body e) (cddr e))
(define (let->combination e)
  (cons (make-lambda (let-bound-variables e) (let-body e))
        (let-values e)))
\`\`\`
Trace:
- the clauses \`((x 1) (y 2))\` give variables \`(x y)\` and values \`(1 2)\`;
- the body is \`((+ x y))\`;
- the result is \`((lambda (x y) (+ x y)) 1 2)\`, which is pure **tree manipulation with no evaluation**;
- evaluating it gives 3.

Likewise \`(define (f x) body)\` is desugared in \`definition-value\` into \`(lambda (x) body)\` with \`make-lambda\`.`,
    pitfall:
      "Desugaring is tree rewriting before evaluation. If let->combination evaluated the values itself, they would be evaluated in the wrong environment or twice. It must only build list structure.",
    related: ["mit6001-eval-metacircular-core", "mit6001-procs-lambda-procedure-objects", "mit6035-parse-ast-vs-cst-dangling-else"],
  },
  {
    id: "mit6001-eval-environment-representation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the metacircular evaluator represent environments and frames as list structure, and how do lookup-variable-value, set-variable-value! and define-variable! differ?",
    back: `**Representation**:
- An **environment** is a list of frames; \`(cdr env)\` is the enclosing environment, and the empty list is the end.
- A **frame** is a pair \`(variables . values)\`: two parallel lists, matched by position.
- **Extending** an environment conses a new frame on the front, after checking that the arity matches ("Too many/few args supplied").

**Lookup** runs two loops: \`env-loop\` over the frames and \`scan\` down the parallel lists:
\`\`\`scheme
(define (lookup-variable-value var env)
  (define (env-loop env)
    (define (scan vars vals)
      (cond ((null? vars) (env-loop (enclosing-environment env)))
            ((eq? var (car vars)) (car vals))
            (else (scan (cdr vars) (cdr vals)))))
    (if (eq? env the-empty-environment)
        (error "Unbound variable -- LOOKUP" var)
        (let ((frame (first-frame env)))
          (scan (frame-variables frame) (frame-values frame)))))
  (env-loop env))
\`\`\`
- **\`set-variable-value!\`**: the same two loops, but on a hit it does \`(set-car! vals val)\`. It searches **outward** and errors if the variable is unbound everywhere. This is the set! rule.
- **\`define-variable!\`**: scans **only the first frame**. On a hit it overwrites the value; otherwise it \`add-binding-to-frame!\`s, mutating the frame's two lists. This is the define rule.

**The global environment**: \`setup-environment\` extends the empty environment with one frame binding primitive names to \`(primitive <scheme-proc>)\` objects, plus \`true\` and \`false\`. The **driver loop** reads an expression, \`m-eval\`s it in that environment, prints the result, and repeats.`,
    pitfall:
      "define-variable! mutates the first frame in place (set-car!/set-cdr!). Every environment that shares that frame sees the new binding, which is how internal defines become visible to sibling procedures defined in the same body.",
    related: ["mit6001-eval-metacircular-core", "mit6001-env-frames-name-define-set"],
  },
  {
    id: "mit6001-eval-lexical-vs-dynamic-scoping",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Define free vs bound variables, and compare lexical and dynamic scoping in the evaluator. What does (pooh 9) give with (define (pooh x) (bear 20)) and (define (bear y) (+ x y)) under each?",
    back: `In a procedure body, the **bound** variables are the formal parameters, found in the new frame. Every other name is **free**. Scoping decides where free variables are looked up.

**Lexical (static) scoping**, which is Scheme's: look in the environment where the procedure was **created**. \`make-procedure\` stores \`env\` (the second bubble), and \`m-apply\` extends that environment. Example: \`(define (foo x y) (lambda (z) (+ x y z)))\` and \`(define bar (foo 1 2))\`. Then \`bar\` always sees x = 1 and y = 2, from frame E1, every time it is called.

**Dynamic scoping**: look in the **caller's** environment at call time. The evaluator needs two changes:
1. \`lambda\` makes a **single bubble**: no environment is stored (e.g. \`'no-environment\`).
2. Applications pass the **current** env to a \`d-apply\`, which evaluates the body in \`(extend-environment params args env)\`, extending the caller's environment.

**pooh/bear**:
- **Lexical**: \`bear\` was created in GE, where \`x\` is unbound, so \`(pooh 9)\` is an **unbound variable x** error.
- **Dynamic**: \`(pooh 9)\` makes {x: 9} → GE, and its body calls \`(bear 20)\`. That makes {y: 20} → *pooh's frame*, and \`(+ x y)\` finds x = 9, giving **29**.

| | lexical | dynamic |
|---|---|---|
| procedure object | code + defining env | code only |
| new frame extends | procedure's env | caller's env |
| free-variable meaning | fixed by program text | depends on the call history |

**The lesson**: a two-line change to eval and apply produces a different language. Syntax is untouched because it is separated from semantics.`,
    pitfall:
      "Under dynamic scoping, renaming a local variable in a caller can change the behavior of an unrelated callee that happens to use that name freely. Lexical scoping makes a procedure's meaning independent of who calls it.",
    related: ["mit6001-eval-lambda-eval-apply-cycle", "mit6001-env-lambda-application-rules", "mit6035-gen-symbol-tables-and-scoping"],
  },
  // --- Lecture 21: Lazy evaluation and streams ---
  {
    id: "mit6001-eval-applicative-vs-normal-order",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "With (define (foo x) (write-line \"inside foo\") (+ x x)), what does (foo (begin (write-line \"eval arg\") 222)) print and return under applicative order vs normal order evaluation?",
    back: `**Applicative order** (Scheme): evaluate the operator **and all operands**, then apply the procedure to the **values**.

**Normal order**: evaluate the operator, then substitute the operand **expressions, unevaluated**, into the body. Keep going until a **primitive** procedure needs actual values (or something must be printed). Primitives are **strict**.

| | applicative | normal |
|---|---|---|
| output | \`eval arg\`, \`inside foo\` | \`inside foo\`, \`eval arg\`, \`eval arg\` |
| result | 444 | 444 |

- **Applicative**: the argument is evaluated **once**, before entering \`foo\`. Then \`(+ 222 222)\`.
- **Normal**: \`foo\`'s body runs first. When the primitive \`+\` needs its two operands, *each* copy of the substituted \`(begin …)\` is evaluated, so the side effect happens **twice**.

**Why normal order is interesting**:
- work that is never needed is never done;
- \`if\`-like procedures can be written as ordinary procedures;
- infinite data structures become possible.

**What it costs**:
- repeated evaluation of the same argument (fixed by memoization);
- loss of control over **when** side effects happen.`,
    pitfall:
      "Normal order changes when (and how often) evaluation happens, not the final value of side-effect-free code. Here both orders return 444; only the printed side effects differ. With mutation, the values can differ too.",
    related: ["mit6001-eval-lazy-evaluator-thunks", "mit6001-procs-substitution-model"],
  },
  {
    id: "mit6001-eval-lazy-evaluator-thunks",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What changes turn the metacircular evaluator into the lazy evaluator (l-eval, l-apply, thunks, actual-value, force-it), and how does memoizing a thunk by mutation avoid re-evaluation?",
    back: `**Changes to eval and apply**:
- **\`l-eval\` application case**: \`(l-apply (actual-value (operator exp) env) (operands exp) env)\`. It needs the operator's *actual* value (primitive or compound?), passes the operand **expressions unevaluated**, and passes **env** along.
- **\`l-apply\`**:
  - a **primitive** gets \`(list-of-arg-values arguments env)\`, which **forces** every argument;
  - a **compound** procedure binds its parameters to \`(list-of-delayed-args arguments env)\`, a list of **thunks**.
- **\`eval-if\`** must use \`actual-value\` on the predicate, to decide which branch to take.
- The REPL prints \`(actual-value input the-global-environment)\`.

**Thunks**: a promise is \`(thunk exp env)\`, an expression plus the environment to evaluate it in. \`(define (actual-value exp env) (force-it (l-eval exp env)))\`. Forcing repeats until a non-thunk results.

**Memoization**: the first force **mutates the thunk in place** into \`(evaluated-thunk result)\`, and drops \`env\` so it can be garbage-collected. Every structure that points at the same thunk now sees the cached value, which is why it mutates rather than building a new object.

**Programmer control** (an extension): annotate the parameters, e.g. \`(lambda (a (lazy b) c (lazy-memo d)) …)\`:
- **plain** parameters are evaluated at the call;
- **\`lazy\`** parameters become a thunk, recomputed on each use (useful when the side effect is the point);
- **\`lazy-memo\`** parameters become a thunk evaluated at most once.

\`delay-it\` takes the declaration and chooses which.`,
    code: `(define (delay-it exp env) (list 'thunk exp env))
(define (thunk? obj) (tagged-list? obj 'thunk))
(define (thunk-exp thunk) (cadr thunk))
(define (thunk-env thunk) (caddr thunk))

(define (force-it obj)
  (cond ((thunk? obj)
         (let ((result (actual-value (thunk-exp obj) (thunk-env obj))))
           (set-car! obj 'evaluated-thunk)
           (set-car! (cdr obj) result)      ; replace exp with its value
           (set-cdr! (cdr obj) '())         ; drop env
           result))
        ((evaluated-thunk? obj) (thunk-value obj))
        (else obj)))

(define (actual-value exp env) (force-it (l-eval exp env)))`,
    codeLang: "scheme",
    pitfall:
      "Memoized laziness and side effects don't mix well. If the delayed argument does I/O or mutation, it runs at an unpredictable time and at most once. The handout's lazy cond clause also calls eval instead of l-eval. Make it (l-eval (cond->if exp) env), or the cond bodies escape the lazy semantics.",
    related: ["mit6001-eval-applicative-vs-normal-order", "mit6001-eval-streams", "mit6001-eval-metacircular-core"],
  },
  {
    id: "mit6001-eval-streams",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a stream (cons-stream with a lazy, memoized cdr), why does (stream-ref (stream-filter prime? (stream-interval 1 100000000)) 99) not build a 10⁸-element list, and what does it mean to decouple apparent from actual order of evaluation?",
    back: `**Streams**: \`cons-stream\` evaluates its car but stores the cdr as a **memoized lazy** promise. \`stream-car\` and \`stream-cdr\` mirror \`car\` and \`cdr\`, and \`stream-cdr\` forces the promise.
- \`(define x (cons-stream 99 (/ 1 0)))\` is fine, and \`(stream-car x)\` is 99.
- Only \`(stream-cdr x)\` signals the division by zero.
- With an ordinary \`cons\`, the \`define\` itself would fail.

**Lists vs streams for "the 100th prime"**:
- **Lists**: \`enumerate-interval\` builds a list of $10^8$ integers, \`filter\` builds another big list of primes, and \`list-ref\` keeps one element and discards the rest.
- **Streams**: the procedures look the same as the list versions, but evaluation is **demand-driven**:

\`\`\`scheme
(define (stream-interval a b)
  (if (> a b) the-empty-stream
      (cons-stream a (stream-interval (+ a 1) b))))
(define (stream-filter pred str)
  (if (pred (stream-car str))
      (cons-stream (stream-car str)
                   (stream-filter pred (stream-cdr str)))
      (stream-filter pred (stream-cdr str))))
\`\`\`
\`stream-filter\` keeps forcing \`stream-cdr\` of the interval until it finds 2. It then returns \`(cons-stream 2 <promise to filter the rest>)\`, so there are two nested promises: filter, and inside it, the interval. \`(stream-ref … 99)\` pulls elements only until the 100th prime, which is **541**. Only integers up to 541 are ever generated. The lecture's \`(list-ref … 100)\` is off by one: indices start at 0, so index 100 is the 101st prime, 547.

**Decoupling**: you write the program as if the whole sequence existed, which is the *apparent order* (generate, then filter, then select). The *actual order* inside the machine interleaves the stages element by element.

**The alternative to objects**: instead of objects with instantaneous state (ball, walls, clock), model a system by the **time history (stream) of each state variable**.`,
    pitfall:
      "stream-filter (and any stream search) on an infinite stream with no matching element never returns. Laziness defers work but cannot finish an unbounded search.",
    related: ["mit6001-eval-infinite-streams", "mit6001-eval-lazy-evaluator-thunks", "mit6001-hop-map-filter-fold"],
  },
  {
    id: "mit6001-eval-infinite-streams",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define the infinite streams ones and ints (via add-streams), the sieve of Eratosthenes on streams, and a stream integrator. Why does sieve need no base case?",
    back: `**Self-referential definitions work** because the cdr is delayed. When it is finally forced, the name is already bound:
\`\`\`scheme
(define ones (cons-stream 1 ones))                 ; 1 1 1 1 ...
(define (add-streams s1 s2)
  (cons-stream (+ (stream-car s1) (stream-car s2))
               (add-streams (stream-cdr s1) (stream-cdr s2))))
(define ints (cons-stream 1 (add-streams ones ints)))   ; 1 2 3 4 ...
\`\`\`
With \`cons\`, \`(define ones (cons 1 ones))\` fails because \`ones\` is still unbound.

How \`ints\` unrolls: element 2 forces \`(add-streams ones ints)\` and gives $1 + 1 = 2$, plus a new promise. Element 3 "tugs" both inputs again and gives $1 + 2 = 3$, and so on. Each element is computed once, thanks to memoization.

**Sieve of Eratosthenes**:
\`\`\`scheme
(define (sieve str)
  (cons-stream (stream-car str)
               (sieve (stream-filter
                        (lambda (x) (not (divisible? x (stream-car str))))
                        (stream-cdr str)))))
(define primes (sieve (stream-cdr ints)))          ; 2 3 5 7 11 ...
\`\`\`
**No base case**: the input is infinite, so there is never an end to test for. Each step produces one element plus a promise. The list version had to build and re-filter whole lists.

**Signal processing view**: a stream is a signal, and feedback loops become stream definitions. A rectangle-rule **integrator** with step $dx$:
$$S_0 = \\text{init}, \\qquad S_{k+1} = S_k + dx \\cdot x_k.$$
\`\`\`scheme
(define (integral integrand init dx)
  (define int
    (cons-stream init (add-streams (scale-stream integrand dx) int)))
  int)
\`\`\`
\`(integral ones 0 2)\` gives 0, 2, 4, 6, ….`,
    pitfall:
      "These self-referential streams rely on memoized promises. Without memoization, every stream-cdr re-runs the delayed add-streams, which re-forces earlier elements again and again. Walking ints then costs far more than linear time, and SICP notes the analogous fibs stream becomes exponential.",
    related: ["mit6001-eval-streams", "number-theory-sieve-of-eratosthenes"],
  },
];
