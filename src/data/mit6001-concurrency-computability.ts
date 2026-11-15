// MIT 6.001 Structure and Interpretation of Computer Programs (Spring 2005,
// Eric Grimson, Peter Szolovits, Trevor Darrell) — Lectures 22-26:
// asynchronous computing (time, interleaving, serializers, deadlock,
// mutexes), "Universal Machines" (the analyze evaluator and eval as a
// universal machine) and "Computability" (the halting theorem by
// diagonalization and the Y combinator). Lecture 22 is sourced from its
// online-lecture handout; Lectures 23 and 26 from their slide handouts
// (slides only, no narration), read page by page; SICP §3.4 and §4.1.7 for
// context. Lectures 24 (Erik Demaine, origami/linkages) and 25 (Frans
// Kaashoek, peer-to-peer) were live guest lectures with no notes on OCW.
// Lean where other tracks go deeper: locking is covered by MIT 6.828 and
// Turing machines/undecidability by MIT 6.045J.
//
// Corrections / additions beyond the handouts:
// - Lecture 23 slide 28 dates Gödel's incompleteness results to 1933; they
//   were published in 1931. Slide 32 says Turing completed his Ph.D. with
//   Church "proving Church-Turing Thesis"; the Church–Turing thesis is a
//   thesis (not provable — "effective procedure" is informal), and Turing's
//   Princeton dissertation was on ordinal logics. The card states it as a
//   thesis.
// - The x = 10 interleaving example (P1: x ← x·x reading x twice; P2:
//   x ← x+1) was enumerated in Python: 10 interleavings, final values
//   {11, 100, 101, 110, 121}; serialized, {101, 121}.
// - The Y-combinator factorial ((Y F) 10) = 3628800 was checked by running
//   the same applicative-order Y in Python.
import type { Card } from "./types";

const MODULE = "mit6001-conc";

export const mit6001ConcurrencyComputabilityCards: Card[] = [
  // --- Lecture 22: Asynchronous computing ---
  {
    id: "mit6001-conc-time-and-interleaving",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Why does assignment cost referential transparency and bring time into programs? With x = 10, P1 = (set! x (* x x)) and P2 = (set! x (+ x 1)) run concurrently, what final values of x are possible, with and without serialization?",
    back: `**Referential transparency**: equal expressions can be substituted for one another without changing the program's meaning. \`(define d1 (make-adder 4))\` and \`(define d2 (make-adder 4))\` are interchangeable. Two accounts \`peter\` and \`paul\` made by identical \`(make-account 100)\` calls are **not**, because each has its own changing local state.

**With assignment, the value of an expression depends on *when* it is evaluated.** Concurrency makes "when" ambiguous.

**The joint account**: Peter withdraws 10 and Paul withdraws 25 from 100. \`(set! balance (- balance amount))\` is three steps: read, compute, write. If both read 100 before either writes, the final balance is **75** (or 90). Money is not conserved.

**Interleavings**: P1 has steps a (read x), b (read x again), c (write the product). P2 has steps d (read x) and e (write the sum). Each process keeps its own order, but the processes may interleave. There are $\\binom{5}{2} = 10$ orders:

| final $x$ | example order | why |
|---|---|---|
| 121 | d e a b c | P2 runs first: $11^2$ |
| 101 | a b c d e | P1 runs first: $100 + 1$ |
| 110 | d a e b c | P1 reads 10, then 11: $10 \\cdot 11$ |
| 100 | d a b e c | P2's write of 11 is overwritten by P1's $10 \\cdot 10$ |
| 11 | d a b c e | P1's 100 is overwritten by P2's $10 + 1$ |

**Correctness criterion**: the result must equal that of **some sequential order**. Here only **101 or 121** qualify, and serializing P1 and P2 with the same serializer allows exactly those two.`,
    pitfall:
      "Requiring 'the same result as some sequential run' does not make the result unique. 101 and 121 are both correct. Concurrency control removes the incorrect interleavings, not the nondeterminism between correct ones.",
    related: ["mit6001-conc-serializers-deadlock", "mit6001-data-mutation-sharing", "mit6828-conc-race-condition"],
  },
  {
    id: "mit6001-conc-serializers-deadlock",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a serializer and how is it built from a mutex and an atomic test-and-set!? Why does serialized account exchange need both accounts' serializers, how can it deadlock, and how does ordering accounts by ID avoid that?",
    back: `**Serializer**: \`(make-serializer)\` returns \`s\`. \`(s p)\` is a procedure that behaves like \`p\`, but **at most one procedure in the set made by \`s\` runs at a time**. Others wait.

A **serialized account** wraps \`withdraw\` and \`deposit\` with that account's own serializer:
- operations on the *same* account are mutually excluded;
- *different* accounts still proceed concurrently.

**Multiple resources**: \`(exchange a1 a2)\` reads both balances, computes the difference, withdraws from one and deposits into the other. Even with per-account serialization, Peter's \`exchange a1 a2\` and Paul's \`exchange a1 a3\` can interleave between the *read* and the *write*. Money is conserved, but the swaps come out wrong.

**Fix**: the account **exports** its serializer (deliberately breaking modularity), and \`exchange\` is wrapped in **both** accounts' serializers.

**Deadlock**: Peter runs \`(exchange a1 a2)\` while Paul runs \`(exchange a2 a1)\`. Peter enters a1's serializer and Paul enters a2's. Each now waits forever for the other.

**Avoidance**: give each account a unique number, and always enter the **lowest-numbered** account's serializer first. That gives a global lock order, so no cycle of waiting can form. Some situations need more elaborate schemes.

**Mutex implementation**: a serializer acquires a mutex, runs \`p\`, and releases. A mutex is a one-element cell holding false (free) or true (taken).
- **Acquire** loops until \`(test-and-set! cell)\` returns false.
- **Release** sets the cell back to false.
- \`test-and-set!\` must be **atomic**: between testing false and setting true, no other process may test. That is done by disabling time-slicing, or with a hardware atomic instruction.

**The deeper point**: on pipelined, cached multiprocessors, "shared state at an instant" is itself ill-defined. Imposing an order on events requires *communication* between processes.`,
    pitfall:
      "A test-and-set! written as ordinary Scheme, (if (car cell) true (begin (set-car! cell true) false)), is itself a race. Two processes can both see false and both 'acquire'. Atomicity has to come from below the language.",
    related: ["mit6001-conc-time-and-interleaving", "mit6828-conc-atomic-instructions", "mit6828-conc-lock-ordering"],
  },
  // --- Lecture 23: Universal machines ---
  {
    id: "mit6001-conc-analyze-evaluator",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What problem does the analyze evaluator solve, and how does analyze turn an expression into an execution procedure (Env → value)? Give analyze-variable, analyze-if and analyze-application.",
    back: `**The cost of plain eval**: evaluating \`(fact 4)\` re-dispatches on the syntax of the same body, \`(if (= n 1) …)\`, on **every** call. The case analysis in \`eval\` runs again and again for identical code.

**Static analysis**: do work **before execution**, once. The benefits:
- speed, because loops don't repeat syntactic work;
- catching mistakes early (malformed expressions, wrong operand types or counts);
- proving properties of programs, which is an active research area.

**Analyze evaluator**:
$$\\text{analyze}: \\text{expression} \\to (\\text{Env} \\to \\text{value}), \\qquad \\text{(a-eval exp env)} = \\text{((analyze exp) env)}.$$
Everything outside the returned \`(lambda (env) …)\` happens at **analysis time**. Code inside it happens at **execution time**.

\`\`\`scheme
(define (analyze-number exp) (lambda (env) exp))
(define (analyze-variable exp)
  (lambda (env) (lookup-variable exp env)))

(define (analyze-if exp)
  (let ((pproc (analyze (if-predicate exp)))     ; analyzed once
        (cproc (analyze (if-consequent exp)))
        (aproc (analyze (if-alternative exp))))
    (lambda (env)                                 ; run every time
      (if (true? (pproc env)) (cproc env) (aproc env)))))

(define (analyze-application exp)
  (let ((fproc (analyze (operator exp)))
        (aprocs (map analyze (operands exp))))
    (lambda (env)
      (execute-application (fproc env)
                           (map (lambda (aproc) (aproc env)) aprocs)))))
\`\`\`
**Procedures**: \`analyze-lambda\` analyzes the body once. The "double bubble" now stores the **execution procedure** \`bproc\` instead of the body text. \`execute-application\` runs \`((procedure-body proc) (extend-environment …))\`.

The execution procedures hold their subexpressions' execution procedures as **local state**, which is closures again.`,
    pitfall:
      "Anything that depends on the environment (variable values, which branch of an if is taken) must stay inside the (lambda (env) …). Analysis can't know run-time values. It only pre-digests the syntax.",
    related: ["mit6001-conc-eval-universal-machine", "mit6001-eval-metacircular-core", "mit6035-parse-compiler-pipeline"],
  },
  {
    id: "mit6001-conc-eval-universal-machine",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In what sense is eval a 'universal machine', and what do Turing's machine, the Church–Turing thesis and the existence of interpreters for other languages say about computability?",
    back: `**Circuits analogy**: imagine a circuit that takes any *encoded* circuit diagram as input and reconfigures itself to simulate it. Described as programs, that is just **eval**. It takes *any* program as data and behaves like it, so it is a **universal machine**.

Howard Aiken (1956) found it would be "the most amazing coincidence" if a differential-equation machine and a department-store billing machine had the same basic logic. Universality says they do.

**Consequences**:
- eval is itself a program, so **eval can simulate itself**; that is the metacircular \`m-eval\`;
- eval can run an evaluator for **any other language**, given that language's syntax and evaluation rules;
- so any language with an evaluator can simulate any other. **Computability is language-independent**: what is computable in one universal language is computable in all of them.

**Turing's insight** (motivated by Gödel's incompleteness theorems of 1931 and Hilbert's *Entscheidungsproblem*):
- a simple abstract machine (the **Turing machine**) suffices for any "effective process";
- machines can be **encoded** as data;
- a **universal machine** can run any encoded machine. Turing's universal machine was, in effect, "the first EVAL".

**Church–Turing thesis**: Church's **lambda calculus** captured the same class of effective procedures. The **thesis** is that anything reasonably called an effective procedure can be carried out by a universal machine. It is a thesis, not a theorem, because "effective procedure" is informal.

**And the limit**: if a problem can't be solved by the universal machine, no machine solves it. The halting problem is such a problem (Lecture 26).`,
    pitfall:
      "Universality is about what can be computed, not how fast. Simulating one machine on another can cost large constant or polynomial factors, and the analyze evaluator exists precisely to reduce interpretive overhead.",
    related: ["mit6001-conc-analyze-evaluator", "mit6001-conc-halting-theorem", "mit6045-computability-universal-tm-church-turing"],
  },
  // --- Lecture 26: Computability ---
  {
    id: "mit6001-conc-halting-theorem",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Prove that a procedure halts? (returning #t iff (p) terminates) cannot exist, and use Cantor diagonalization to show there are more integer predicates than programs.",
    back: `**Not every expression stands for a value**: \`(define (return-seven) (+ 3 4))\` gives 7, but \`(define (loop-forever) (loop-forever))\` never returns.

**Countability**: a set is countable if it can be put in one-to-one correspondence with the integers.
- The even numbers ($n \\mapsto 2n$), the squares ($n \\mapsto n^2$) and the rationals (walk the table of $p/q$ along a path that eventually reaches every entry) are all countable.
- The **reals in (0, 1)** are not. Suppose they were listed. Build a number whose $k$-th digit is the $k$-th digit of the $k$-th number plus 1 (mod 10). If the diagonal begins $0.437\\ldots$, the new number begins $0.548\\ldots$. It differs from every listed number in at least one digit, so it is not in the list.

**More functions than programs**:
- Every program can be written in binary, so there are **countably many** procedures.
- Suppose the predicates $\\mathbb{N} \\to \\{0, 1\\}$ were also listed as $f_1, f_2, \\ldots$. Define $g(k) = 1 - f_k(k)$. Then $g$ differs from every $f_k$ at $k$, so it is not in the list.

Hence some well-defined predicates are computed by **no** program.

**Halting theorem**: suppose \`halts?\` exists, and define
\`\`\`scheme
(define (contradict-halts)
  (if (halts? contradict-halts)
      (loop-forever)
      #t))
\`\`\`
- If \`(contradict-halts)\` halts, then \`halts?\` returns #t, so it runs \`(loop-forever)\` and does **not** halt.
- If it does not halt, then \`halts?\` returns #f, so it returns #t and **halts**.

Both cases are contradictions, so \`halts?\` cannot exist. **halts? is well specified** (it has a definite answer on every input) but it is **uncomputable**.`,
    pitfall:
      "The theorem doesn't say you can't decide halting for particular programs (halts? is easy for return-seven and loop-forever). It says no single procedure decides it correctly for all programs.",
    related: ["mit6001-conc-eval-universal-machine", "mit6001-conc-y-combinator", "mit6045-computability-diagonalization-uncomputable-problems", "mit6045-computability-halt-tm-reduction"],
  },
  {
    id: "mit6001-conc-y-combinator",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Where does recursion's power come from? Build infinite recursion from lambda alone, then derive the applicative-order Y combinator and use it to compute 10! without define.",
    back: `**Is naming (\`define\`) the source of recursion?** No. Lambda and application suffice.

**Anonymous infinite loop**: let $H = (\\lambda(h)\\,(h\\ h))$. Then
$$(H\\ H) \\Rightarrow (H\\ H) \\Rightarrow \\cdots$$
The naive \`((lambda (loop) (loop)) (lambda (loop) (loop)))\` fails, because the inner \`(loop)\` passes no argument to a one-argument procedure.

**Doing work at each step**: with $Q = (\\lambda(h)\\,(f\\ (h\\ h)))$, the applicative-order expansion is
$$(Q\\ Q) \\Rightarrow (f\\ (Q\\ Q)) \\Rightarrow (f\\ (f\\ (Q\\ Q))) \\Rightarrow \\cdots$$
which recurses **uncontrollably**: \`(Q Q)\` must be fully evaluated before \`f\` is even called.

**Controlling it: wrap in a lambda.** Let $D = (\\lambda(h)\\,(\\lambda(x)\\,((f\\ (h\\ h))\\ x)))$. Now $(D\\ D)$ evaluates to a **procedure** $(\\lambda(x)\\,((f\\ (D\\ D))\\ x))$. That is a finite value carrying the seed $(D\\ D)$ of further recursion, which unfolds only when the procedure is applied to an $x$.

**Parameterize over $f$**:
$$Y = \\lambda f.\\,\\big(\\lambda h.\\,\\lambda x.\\,((f\\ (h\\ h))\\ x)\\big)\\big(\\lambda h.\\,\\lambda x.\\,((f\\ (h\\ h))\\ x)\\big)$$
The key property:
$$((Y\\ F)\\ x) = ((F\\ (Y\\ F))\\ x).$$
So $(Y\\ F)$ is a fixed point of $F$.

**Designing F**: $F$ takes \`proc\` (which will be $(Y\\ F)$, i.e. "myself") and returns a one-argument procedure with a base case:
\`\`\`scheme
(((lambda (f) ((lambda (h) (lambda (x) ((f (h h)) x)))
               (lambda (h) (lambda (x) ((f (h h)) x)))))
  (lambda (fact)
    (lambda (n) (if (= n 0) 1 (* n (fact (- n 1)))))))
 10)                               ; => 3628800, with no define anywhere
\`\`\`
Each recursive call \`(fact (- n 1))\` applies $(D\\ D)$, which unfolds exactly one more level.

**Moral**: λ captures "how to" knowledge, and Y reaches toward the infinite one controlled step at a time. The halting theorem still bounds what any of it can compute.`,
    pitfall:
      "The classic normal-order Y, λf.(λx.f(x x))(λx.f(x x)), loops forever in applicative-order Scheme, because (x x) is evaluated eagerly. The extra λx wrapper (eta-expansion) is what makes this Y work in Scheme.",
    related: ["mit6001-conc-halting-theorem", "mit6001-hop-procedures-as-values", "mit6001-eval-applicative-vs-normal-order"],
  },
];
