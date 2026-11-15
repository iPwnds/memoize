// MIT 6.001 Structure and Interpretation of Computer Programs (Spring 2005)
// — Logic programming and nondeterministic search, from the course's
// official textbook: Abelson & Sussman, "Structure and Interpretation of
// Computer Programs" (2nd ed., MIT Press 1996), §4.3.1 (amb and search) and
// §4.4 (logic programming: the query language, pattern matching, streams of
// frames, unification, rules, and the limits of logic programming as logic).
// OCW's 6.001 readings page links the full book openly (MIT Press site and
// PDF); it was read section by section.
//
// Placement: the Spring 2005 lecture schedule has no logic-programming
// lecture, and §4.3-4.4 are not assigned readings (the matching 1986 video
// lectures 8A/8B, "Logic Programming", are on the OCW video page but have no
// written notes). These cards are mapped to Lecture 21 (Lazy Evaluation,
// readings §4.2 and §3.5): SICP §4.3-4.4 are the next "variations on a
// Scheme" after §4.2, and the query evaluator is built on §3.5's streams.
// This is a placement call, not a course lecture.
//
// Corrections / additions beyond the source:
// - The Horn-clause reading of rules (conclusion ⇐ conjunction of atoms;
//   or-bodies split into several clauses) is stated explicitly; SICP only
//   names "linear Horn-clause resolution" in a footnote.
// - Recomputed examples: prime-sum-pair '(1 3 5 8) '(20 35 110) yields
//   (3 20), (3 110), (8 35) (sums 23, 113, 43 prime); (19 27 30)/(11 36 58)
//   yields (30 11) (41). (wheel ?who) yields Warbucks 4 times (via Ben's 3
//   reports and Scrooge's 1) and Ben once (via Alyssa → Louis).
import type { Card } from "./types";

const MODULE = "mit6001-logic";

export const mit6001LogicProgrammingCards: Card[] = [
  {
    id: "mit6001-logic-relations-not-functions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does logic programming turn 'what is' knowledge into programs? Show how the two append-to-form rules answer three different questions that the append procedure cannot.",
    back: `Most languages compute **functions**, in one direction from inputs to outputs. Logic programming states **relations** and leaves the "how to" to a general search procedure built into the interpreter. That procedure combines **pattern matching** with **unification**. One relation can then answer several questions.

The \`append\` *procedure* encodes two facts:
- for any list $y$, () and $y$ append to form $y$;
- (cons $u$ $v$) and $y$ append to form (cons $u$ $z$) if $v$ and $y$ append to form $z$.

As **rules** in the query language:
\`\`\`scheme
(rule (append-to-form () ?y ?y))
(rule (append-to-form (?u . ?v) ?y (?u . ?z))
      (append-to-form ?v ?y ?z))
\`\`\`
| query | results |
|---|---|
| \`(append-to-form (a b) (c d) ?z)\` | \`?z\` = (a b c d) |
| \`(append-to-form (a b) ?y (a b c d))\` | \`?y\` = (c d) |
| \`(append-to-form ?x ?y (a b c d))\` | all **5** splits: () + (a b c d), (a) + (b c d), (a b) + (c d), (a b c) + (d), (a b c d) + () |

The procedure answers only the first question. The rules answer all three.

**The caveat**: the user is not freed from "how". Many logically equivalent rule sets exist, and only some of them run effectively in every direction. Some "what is" facts give no method at all: knowing $y^2 = x$ does not tell you how to compute $y$.`,
    pitfall:
      "Running a relation 'backwards' is not guaranteed to work. Whether a query terminates depends on the rule and clause order and on which arguments are bound. Logic programs can fall into infinite loops where the logic itself has an answer.",
    related: ["mit6001-logic-query-language-basics", "mit6001-logic-amb-backtracking", "mit6001-procs-declarative-vs-imperative"],
  },
  {
    id: "mit6001-logic-amb-backtracking",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "What do amb and require do in SICP's nondeterministic evaluator, and how does chronological backtracking find (prime-sum-pair '(1 3 5 8) '(20 35 110)) and the answers to try-again?",
    back: `\`(amb e₁ … eₙ)\` returns the value of **one** of its expressions "ambiguously". For example, \`(list (amb 1 2 3) (amb 'a 'b))\` has 6 possible values. \`(amb)\` has **no** value, and evaluating it means **failure**.
\`\`\`scheme
(define (require p) (if (not p) (amb)))
(define (an-element-of items)
  (require (not (null? items)))
  (amb (car items) (an-element-of (cdr items))))
(define (prime-sum-pair list1 list2)
  (let ((a (an-element-of list1))
        (b (an-element-of list2)))
    (require (prime? (+ a b)))
    (list a b)))
\`\`\`
Conceptually, each \`amb\` is a **choice point** where time splits into branches. On one processor the evaluator does a **systematic search**:
- always try the *first* alternative;
- on failure, **back up to the most recent choice point** and try its next alternative;
- when a choice point is exhausted, back up further.

This is **depth-first search**, or **chronological backtracking**. The REPL's \`try-again\` asks for the next success.

**Trace** on \`'(1 3 5 8)\` × \`'(20 35 110)\`:
- a = 1: the sums 21, 36 and 111 = 3·37 all fail.
- a = 3, b = 20: 23 is prime, so the first value is **(3 20)**.
- \`try-again\`: 3 + 35 = 38 fails, then 3 + 110 = 113 is prime: **(3 110)**.
- \`try-again\`: the sums with a = 5 (25, 40, 115) and 8 + 20 = 28 fail, then 8 + 35 = 43: **(8 35)**.
- \`try-again\`: 8 + 110 = 118 fails, so there are **no more values**.

For \`'(19 27 30)\` × \`'(11 36 58)\` the first value is **(30 11)** (41).

\`(an-integer-starting-from n)\` = \`(amb n (an-integer-starting-from (+ n 1)))\` expresses an infinite set of choices, like a stream, but it *returns one integer* at a time.`,
    pitfall:
      "Depth-first backtracking never comes back from an infinite branch. Using an-integer-starting-from for the innermost choice of a Pythagorean-triple search, for instance, keeps trying larger k forever and never revisits i or j. The order of choices decides completeness.",
    related: ["mit6001-logic-relations-not-functions", "mit6001-data-search-structures", "mit6001-eval-streams"],
  },
  {
    id: "mit6001-logic-query-language-basics",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "In SICP's query language, what are assertions, pattern variables and dotted-tail patterns? What do (job ?x (computer ?type)) and (job ?x (computer . ?type)) match in the Microshaft database?",
    back: `**Assertions** are facts in the database, written as lists whose elements may be lists:
\`\`\`scheme
(job (Bitdiddle Ben) (computer wizard))
(salary (Bitdiddle Ben) 60000)
(supervisor (Hacker Alyssa P) (Bitdiddle Ben))
(job (Reasoner Louis) (computer programmer trainee))
\`\`\`
**A simple query is a pattern**, in which \`?x\` is a **pattern variable** that matches anything. The system finds **all assignments** to the variables for which the instantiated pattern is in the database, and prints each instantiation.

- Repeated variables must take the **same value** everywhere. That is why variables have names: \`(supervisor ?x ?x)\` finds people who supervise themselves, and there are none here.
- \`(job ?x (computer ?type))\` requires the third element to be a **2-element** list starting with \`computer\`. It matches Ben (wizard), Alyssa and Cy (programmer), and Lem (technician). It does **not** match Louis, whose job \`(computer programmer trainee)\` has 3 elements.
- \`(job ?x (computer . ?type))\` uses a **dotted tail**: \`?type\` matches the *rest of the list*. So it also matches Louis with \`?type\` = (programmer trainee), and it would match \`(computer)\` with \`?type\` = ().
- A query with no variables just tests membership. If the fact is present, the **empty assignment** satisfies it.

The dotted tail needs no special support in the matcher: Lisp's \`read\` already turns \`(computer . ?type)\` into \`(cons 'computer '?type)\`.`,
    pitfall:
      "Different variable names don't force different values. (supervisor ?x ?y) can return rows where ?x and ?y are equal. To require distinctness you need an explicit (not (same ?x ?y)).",
    related: ["mit6001-logic-compound-queries-rules", "mit6001-logic-pattern-matching-frames"],
  },
  {
    id: "mit6001-logic-compound-queries-rules",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the query language's means of combination (and, or, not, lisp-value) and of abstraction (rules). Give lives-near, wheel and the recursive outranked-by, and say why (wheel ?who) lists Oliver Warbucks four times.",
    back: `**Combination**, mirroring logic:
- \`(and q₁ … qₙ)\` is satisfied by assignments that satisfy all of the $q_i$. Example: \`(and (job ?p (computer programmer)) (address ?p ?where))\`.
- \`(or q₁ … qₙ)\` is satisfied by assignments that satisfy at least one.
- \`(not q)\` is satisfied by assignments that do **not** satisfy \`q\`. That description is only valid for simple cases; see the negation card.
- \`(lisp-value pred arg …)\` applies a Lisp predicate, e.g. \`(lisp-value > ?amount 30000)\`.

**Abstraction**: \`(rule ⟨conclusion⟩ ⟨body⟩)\` stands for all the instantiations of the conclusion whose body is satisfied. A rule with no body always holds.
\`\`\`scheme
(rule (same ?x ?x))
(rule (lives-near ?person-1 ?person-2)
      (and (address ?person-1 (?town . ?rest-1))
           (address ?person-2 (?town . ?rest-2))
           (not (same ?person-1 ?person-2))))
(rule (wheel ?person)
      (and (supervisor ?middle-manager ?person)
           (supervisor ?x ?middle-manager)))
(rule (outranked-by ?staff-person ?boss)
      (or (supervisor ?staff-person ?boss)
          (and (supervisor ?staff-person ?middle-manager)
               (outranked-by ?middle-manager ?boss))))
\`\`\`
- \`(lives-near ?x (Bitdiddle Ben))\` gives Louis Reasoner and DeWitt Aull, who are also in Slumerville.
- **Logically, a rule is an implication**: body ⇒ conclusion. These are **Horn clauses**, one positive conclusion implied by a conjunction. An \`or\` body is equivalent to several such clauses.

**Duplicate answers**: \`(wheel ?who)\` returns one result per **satisfying assignment**, not per distinct person:
- Warbucks supervises Ben, who has 3 reports (Alyssa, Cy, Lem), and Scrooge, who has 1 (Cratchet). That makes **4** frames.
- Ben appears **once**, through Alyssa and Louis.`,
    pitfall:
      "Because answers are frames (derivations), not a set of distinct values, aggregating over a query (sum, count) double-counts. Ben's 'simple' sum accumulator in SICP Exercise 4.66 breaks on exactly this.",
    related: ["mit6001-logic-query-language-basics", "mit6001-logic-applying-rules", "mit6001-logic-negation-as-failure"],
  },
  {
    id: "mit6001-logic-pattern-matching-frames",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the query system evaluate queries as transformations of streams of frames? Explain pattern matching against a frame, and why and is a series and or a parallel combination.",
    back: `**Frame**: a set of bindings for pattern variables.

**Pattern matcher**: \`(pattern-match pat datum frame)\` returns the frame extended *consistently* with any new bindings, or the symbol \`failed\`.
- \`(?x ?y ?x)\` against \`(a b a)\` in the empty frame gives {?x: a, ?y: b}.
- The same match with ?y already bound to a fails.
- The same match with ?y bound to b gives that frame plus {?x: a}.

**A query is a filter on a stream of frames.** For each input frame it produces every extension that matches some database assertion, and all of these are combined into one output stream. A top-level query starts from a stream holding a single **empty frame**, and each output frame instantiates the query for printing.

- **(and A B)** is a **series** connection: frames from A feed B. \`(and (can-do-job ?x (computer programmer trainee)) (job ?person ?x))\` first binds ?x, then finds people with that job.
- **(or A B)** is a **parallel** connection: both see the input and their outputs are merged. The implementation *interleaves* them, so that one infinite stream cannot starve the other.
- **(not A)** and **lisp-value** are **filters**: they drop the frames for which A can be satisfied, or for which the predicate fails.

**Why streams**: recursive rules can produce *infinitely many* answers. Delayed evaluation prints them one at a time.

**Cost**: an \`and\` of $n$ queries can do a number of matches exponential in $n$ in the worst case, although conjuncts usually shrink the stream.`,
    pitfall:
      "Clause order inside and is a 'how' choice. (and (job ?x (computer programmer)) (supervisor ?x ?y)) scans supervisors once per programmer, while the reverse order scans jobs once per supervisor, which is usually far more work. The logic is the same; the cost is not.",
    related: ["mit6001-logic-unification", "mit6001-logic-applying-rules", "mit6001-eval-streams"],
  },
  {
    id: "mit6001-logic-unification",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "What is unification and how does it generalize pattern matching? Work through (?x a ?y) with (?y ?z a), (?x ?y a) with (?x b ?y), (?x ?x) with ((a ?y c) (a b ?z)), and (?x a) with ((b ?y) ?z). Why reject binding ?y to an expression containing ?y?",
    back: `In **pattern matching** only the pattern has variables. In **unification** *both* sides may contain variables, so the unifier must solve **simultaneous equations** between the two patterns. It returns a frame of bindings, or fails. This is needed to match a query against a rule's *conclusion*.

**Examples**:
1. \`(?x a ?y)\` with \`(?y ?z a)\`: ?x = ?y, a = ?z, ?y = a. So **?x = ?y = ?z = a**, and the unified pattern is \`(a a a)\`.
2. \`(?x ?y a)\` with \`(?x b ?y)\`: the second position needs ?y = b and the third needs ?y = a. **Fail**.
3. \`(?x ?x)\` with \`((a ?y c) (a b ?z))\`: ?x = (a ?y c) and ?x = (a b ?z), so (a ?y c) = (a b ?z). That gives ?y = b and ?z = c, hence **?x = (a b c)**.
4. \`(?x a)\` with \`((b ?y) ?z)\`: ?x = (b ?y) and ?z = a. This **succeeds without determining ?y**. The frame binds ?x to the pattern \`(b ?y)\`, and if ?y is bound later, ?x "follows" it. The most general unifier is \`((b ?y) a)\`.

**Occurs check** (\`depends-on?\`): unifying ?y with an expression containing ?y, such as \`(f ?y)\`, would require a *fixed point* ?y = (f (f (f …))). There is no general way to solve such equations, and formal manipulations can mislead, so the unifier **fails**.

SICP's analogy: $y = 1 + y/2$ unrolls to $2 = 1 + \\frac12 + \\frac14 + \\cdots$, which is valid. $y = 1 + 2y$ unrolls the same way to $-1 = 1 + 2 + 4 + \\cdots$, which is not.

A variable unified with *itself* (\`(?x ?x)\` with \`(?y ?y)\`, the second time) is fine, and is caught by the \`equal?\` test.`,
    pitfall:
      "Without the occurs check, unification can create cyclic bindings and loop or produce unsound answers. Many Prolog systems omit it by default for speed. SICP's unifier includes it.",
    related: ["mit6001-logic-unify-implementation", "mit6001-logic-pattern-matching-frames", "mit6001-logic-applying-rules"],
  },
  {
    id: "mit6001-logic-unify-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Give SICP's pattern-match and unify-match with extend-if-consistent and extend-if-possible. What are the two extra checks that unification needs?",
    back: `**One-sided matcher**: walk the pattern and the datum in parallel, threading the frame through car then cdr. A variable is bound if that is consistent; otherwise the stored value is matched against the datum.

**Unifier**: the same walk, but **symmetric**. If either side is a variable, try to bind it.

\`extend-if-possible\` adds two checks, marked ***:
1. If the value is itself a variable that is **already bound**, unify with *its* value. If both variables are unbound, bind one to the other.
2. The **occurs check**: if the value contains the variable (\`depends-on?\` walks it, following existing bindings), fail.

**Invariant**: a stored binding is never modified, and no variable is ever bound twice. Later information arrives as bindings for the variables that appear *inside* stored values.

Example: if ?x is bound to (f ?y), then extending it with ?x = (f b) matches (f ?y) against (f b), which adds ?y = b. The binding for ?x stays the same.`,
    code: `(define (pattern-match pat dat frame)
  (cond ((eq? frame 'failed) 'failed)
        ((equal? pat dat) frame)
        ((var? pat) (extend-if-consistent pat dat frame))
        ((and (pair? pat) (pair? dat))
         (pattern-match (cdr pat) (cdr dat)
                        (pattern-match (car pat) (car dat) frame)))
        (else 'failed)))

(define (extend-if-consistent var dat frame)
  (let ((binding (binding-in-frame var frame)))
    (if binding
        (pattern-match (binding-value binding) dat frame)
        (extend var dat frame))))

(define (unify-match p1 p2 frame)
  (cond ((eq? frame 'failed) 'failed)
        ((equal? p1 p2) frame)
        ((var? p1) (extend-if-possible p1 p2 frame))
        ((var? p2) (extend-if-possible p2 p1 frame))        ; ***
        ((and (pair? p1) (pair? p2))
         (unify-match (cdr p1) (cdr p2)
                      (unify-match (car p1) (car p2) frame)))
        (else 'failed)))

(define (extend-if-possible var val frame)
  (let ((binding (binding-in-frame var frame)))
    (cond (binding (unify-match (binding-value binding) val frame))
          ((var? val)                                      ; ***
           (let ((binding (binding-in-frame val frame)))
             (if binding
                 (unify-match var (binding-value binding) frame)
                 (extend var val frame))))
          ((depends-on? val var frame) 'failed)            ; *** occurs check
          (else (extend var val frame)))))`,
    codeLang: "scheme",
    pitfall:
      "Binding-chasing matters. If ?x is bound to ?y and ?y to 5, any code that reads ?x must follow the chain to 5. SICP's instantiate copies values recursively for exactly this reason.",
    related: ["mit6001-logic-unification", "mit6001-logic-applying-rules"],
  },
  {
    id: "mit6001-logic-applying-rules",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the query evaluator apply a rule, why must it rename the rule's variables, and how do qeval and simple-query mirror eval and apply?",
    back: `**To apply a rule** to a query pattern in a frame:
1. **Rename** all the rule's variables uniquely for this application (\`?x\` becomes \`?x-7\`).
2. **Unify** the query with the rule's **conclusion**, extending the frame.
3. If that succeeds, **evaluate the rule body** as a query, starting from the extended frame.

\`\`\`scheme
(define (apply-a-rule rule query-pattern query-frame)
  (let ((clean-rule (rename-variables-in rule)))
    (let ((unify-result (unify-match query-pattern
                                     (conclusion clean-rule)
                                     query-frame)))
      (if (eq? unify-result 'failed)
          the-empty-stream
          (qeval (rule-body clean-rule) (singleton-stream unify-result))))))
\`\`\`
**Why rename**: two applications of rules that both use \`?x\`, including recursive applications of the *same* rule, must not share bindings. Renaming plays the role of a **fresh frame per procedure call**.

**The analogy with Lisp**:

| Lisp evaluator | query evaluator |
|---|---|
| bind parameters to arguments, extending the procedure's env | unify the query with the conclusion, extending the frame |
| evaluate the body in the new env | evaluate the rule body in the new frame |
| \`eval\` dispatches on expression type | \`qeval\` dispatches on \`and\`/\`or\`/\`not\`/\`lisp-value\` (data-directed \`get\`) |

Anything else is a **simple query**: for each frame, append (with delay) the stream from \`find-assertions\` (pattern matching against the database) and the stream from \`apply-rules\` (unification with every rule).

Example: \`(lives-near ?x (Hacker Alyssa P))\` matches no assertion. It unifies with the lives-near conclusion, giving ?person-2 = (Hacker Alyssa P) and ?x = ?person-1. The body then binds ?person-1, and through it ?x.

**Driver**: the query driver loop \`qeval\`s each query against a one-frame stream and prints the instantiations, or handles \`(assert! …)\` by adding to the database.`,
    pitfall:
      "Rules are the query language's procedures, and rule application is effectively proof search by SLD-style resolution. Like recursion without a base case, a rule whose body can re-derive the same goal without progress loops forever.",
    related: ["mit6001-logic-unification", "mit6001-logic-logic-vs-programs", "mit6001-eval-metacircular-core"],
  },
  {
    id: "mit6001-logic-logic-vs-programs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "In what sense is the query language mathematical logic, and in what sense is it not? Explain the married-rule infinite loop and why reordering outranked-by's clauses causes a loop.",
    back: `**The logic side**:
- an assertion is an atomic fact;
- a rule is an implication, and applying it is **modus ponens** (from A and A ⇒ B, conclude B);
- so any terminating deduction is logically justified.

The aim is to separate **"what"** (the logic) from **"how"** (the control).

**The program side**: the system gives the logic a fixed **procedural interpretation**, so clause order and subgoal order *are* the control:
- \`(and (job ?x (computer programmer)) (supervisor ?x ?y))\` and its reversal are logically equal but cost different amounts;
- some orders **don't terminate**.

**Married loop**: after \`(assert! (married Minnie Mickey))\` and \`(assert! (rule (married ?x ?y) (married ?y ?x)))\`, the query \`(married Mickey ?who)\` runs as follows:
1. it unifies with the rule (?x = Mickey, ?y = ?who), so the subgoal is \`(married ?who Mickey)\`;
2. that finds the assertion (Minnie), **and** it can also apply the rule again, giving \`(married Mickey ?who)\` once more, and so on forever.

Whether *Minnie* is printed before the loop even starts depends on implementation details.

**Reordered outranked-by** (SICP Exercise 4.64): \`(or (supervisor ?s ?b) (and (outranked-by ?m ?b) (supervisor ?s ?m)))\`. Here the recursive \`outranked-by\` comes *first*, with ?m unbound. Each attempt spawns another \`outranked-by ?m ?b\` before anything binds ?m, so the query loops after its direct answers.

**No general cure**: a breadth-first search over proofs would find answers the depth-first strategy misses, but it gives up the programmer's control over order. And no scheme can detect every infinite path; consider "to show P(x), show P(f(x))".`,
    pitfall:
      "Calling a non-terminating query 'false' or 'no answer' is wrong. Non-termination is a property of the search strategy, not of the logic. The same facts and rules may have a perfectly good proof that the depth-first search never reaches.",
    related: ["mit6001-logic-negation-as-failure", "mit6001-logic-applying-rules", "mit6120-proofs-inference-rules"],
  },
  {
    id: "mit6001-logic-negation-as-failure",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Why does the query language's not differ from logical negation? Explain the closed-world assumption and why (and (not (job ?x (computer programmer))) (supervisor ?x ?y)) returns nothing.",
    back: `**Implementation**: \`not\` is a **filter**. For each input frame it tries to satisfy the negated query, and keeps the frame only if that produces **no** extensions.
\`\`\`scheme
(define (negate operands frame-stream)
  (stream-flatmap
    (lambda (frame)
      (if (stream-null? (qeval (negated-query operands) (singleton-stream frame)))
          (singleton-stream frame)
          the-empty-stream))
    frame-stream))
\`\`\`

**Order dependence**:

| query | result |
|---|---|
| \`(and (supervisor ?x ?y) (not (job ?x (computer programmer))))\` | supervisees who aren't programmers. ?x is **bound** when \`not\` filters, so this works as intended |
| \`(and (not (job ?x (computer programmer))) (supervisor ?x ?y))\` | **empty**. With ?x unbound, "some ?x is a programmer" succeeds, so the single empty frame is dropped |

Logically the two are the same conjunction. Operationally, \`not\` must only be applied once its variables are bound. \`lisp-value\` has the same limitation, and errors on unbound variables.

**Closed-world assumption**: logical $\\lnot P$ means "P is false". The query language's \`not P\` means "**P is not deducible** from the database". So with the Microshaft data, \`(not (baseball-fan (Bitdiddle Ben)))\` succeeds. So would "it is not raining" and "2 + 2 is not 4": anything not recorded is treated as false. This is **negation as failure**.

**Consequences**:
- adding facts can *remove* conclusions (non-monotonic reasoning), which classical logic never does;
- programs with \`not\` and \`lisp-value\` are no longer simply consequences of logic.

Dropping them would restore consistency with logic, but at a large cost in expressive power, and reconciling the two is an open research problem.`,
    pitfall:
      "Read (not q) as 'q cannot currently be proved', never as 'q is false'. Put negations after the subgoals that bind their variables. Prolog's negation-as-failure operator needs the same discipline.",
    related: ["mit6001-logic-logic-vs-programs", "mit6001-logic-compound-queries-rules", "mit6120-proofs-propositions-predicates-quantifiers"],
  },
];
