// MIT 6.001 Structure and Interpretation of Computer Programs (Spring 2005,
// Eric Grimson, Peter Szolovits, Trevor Darrell) — Lectures 15-18: the
// environment model (replacing the substitution model once mutation
// exists), closures with local state, message passing, and the course's
// Scheme object system (classes, instances, self, inheritance, delegation,
// multiple inheritance). Sourced from the course's own online-lecture
// handouts (Lecture 15 in two parts), read page by page, with code read
// from the slide images; SICP §3.1-3.2 (the assigned readings) for context.
// Lecture numbering follows the OCW lecture-notes page: Lecture 17's
// handout holds Notes sections 14.1-14.3 and Lecture 18's holds 14.4-14.7.
// The get-method/ask card is mapped to Lecture 17 (§14.3) but also carries
// the self argument, no-method marker and is-a test from §14.4, since they
// are refinements of the same interface.
//
// Corrections / additions beyond the handouts:
// - Slide 14.6.12's narration says the arrogant professor "delegates to its
//   internal professor a request to LECTURE '.... obviously'". In the code
//   (slide 14.6.9) arrogant-prof has no LECTURE method: get-method falls
//   through to the internal professor, whose LECTURE delegates SAY to its
//   internal person — so "obviously" is never added at all. The card traces
//   the code, not the narration.
// - The fixed make-professor on slide 14.6.14 takes (name) while earlier
//   slides use (fname lname); the card uses (fname lname) throughout.
// - The card on the environment-model quiz re-traces slide 12.2.18-22:
//   z in GE goes 10 → 11 via set! from E1, define in E1 adds z = 12 in frame
//   A, and (set! y …) in GE is an unbound-variable error.
import type { Card } from "./types";

const MODULE = "mit6001-env";

export const mit6001EnvironmentOopCards: Card[] = [
  // --- Lecture 15: Environment model ---
  {
    id: "mit6001-env-frames-name-define-set",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Define frame, environment and the global environment, and state the name, define and set! rules. With GE = {z: 10, x: 3} and E1 = frame A {x: 15, y: (1 2)} → GE, trace (+ z 1) in E1, (set! z (+ z 1)) in E1, (define z (+ z 1)) in E1, and (set! y (+ z 1)) in GE.",
    back: `**The change of viewpoint**: a variable is now a **place** holding a value, a procedure is an **object with an inherited context**, and an expression only has meaning **with respect to an environment**.

**Structures**:
- A **frame** is a table of **bindings** (name ↦ slot).
- An **environment** is a sequence of frames linked by **enclosing-environment pointers**. A frame may be shared by several environments.
- The **global environment (GE)** is the only one with no enclosing environment. It holds the built-in procedures.

**Rules**, evaluating in environment E:
- **Name rule**: the value of $x$ is its value in the **first frame of E where $x$ is bound**. Inner bindings **shadow** outer ones: $x \\mid_{E1} = 15$ but $x \\mid_{GE} = 3$.
- **define rule**: create or replace the binding in the **first frame of E**, always that frame.
- **set! rule**: change the binding in the **first frame of E where it already exists**. It is an error if there is no binding anywhere up the chain.

**Trace**:

| expression | effect |
|---|---|
| \`(+ z 1)\` in E1 | z is not in A, so look in GE: 10, giving **11** |
| \`(set! z (+ z 1))\` in E1 | computes 11. z is not in A, so the **GE** binding becomes 11 |
| \`(define z (+ z 1))\` in E1 | computes 12 and **creates** z = 12 **in frame A**, shadowing GE's 11 |
| \`(set! y (+ z 1))\` in GE | lookup starts in GE and never sees A's \`y\`: **unbound variable y** |

The same text gives different results with \`define\` and \`set!\`. That difference is exactly why both forms exist.`,
    pitfall:
      "set! never creates a binding, and define never reaches outward. Inside a procedure body, (define x …) makes a new local x even if an outer x exists, while (set! x …) mutates the outer one.",
    related: ["mit6001-env-lambda-application-rules", "mit6001-data-mutation-sharing"],
  },
  {
    id: "mit6001-env-lambda-application-rules",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "State the environment model's lambda rule (the 'double bubble') and the four-step rule for applying a compound procedure. Trace (inc-square 4), and say which environment encloses square's frame.",
    back: `**Lambda rule**: evaluating \`(lambda (params) body)\` in E creates a **procedure object** drawn as a "double bubble":
- one part points to the **code** (parameters plus the unevaluated body);
- the other part points to **E**, the environment where the lambda was evaluated.

The value of the lambda is a pointer to that object, and \`define\` binds a name to it.

**Application rule**, applying compound procedure P to arguments:
1. Create a new frame A.
2. Make A an environment by pointing its enclosing pointer at **P's environment pointer**, *not* at the environment the call was made from.
3. In A, bind P's formal parameters to the argument values.
4. Evaluate P's body in this new environment.

Combinations are as before: evaluate the subexpressions in the current environment, then apply.

**Trace** with \`(define (square x) (* x x))\`, \`(define (inc-square y) (+ 1 (square y)))\`, and \`x\` = 10 in GE:
- \`(inc-square 4)\` in GE creates E1 = {y: 4} → GE, then evaluates \`(+ 1 (square y))\` in E1.
- \`square\` is not in E1, so it is found in GE. \`y\` evaluates to 4.
- Applying \`square\` creates E2 = {x: 4}, which is enclosed by **GE** (square's environment pointer), **not by E1**.
- \`(* x x)\` in E2 finds x = 4 in E2, shadowing GE's x = 10, and gives 16.
- The result is $1 + 16 =$ **17**.

This is **lexical (static) scoping**: free variables are resolved where the procedure was *defined*, not where it was *called*.`,
    pitfall:
      "Pointing the new frame at the caller's environment gives dynamic scoping, which is a different language. In the 6.001 model the enclosing frame always comes from the procedure object's second bubble.",
    related: ["mit6001-env-frames-name-define-set", "mit6001-env-closures-local-state", "mit6001-procs-substitution-model"],
  },
  {
    id: "mit6001-env-closures-local-state",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Explain with the environment model why (define ca (make-counter 0)) then (ca), (ca) gives 1, 2, while a second counter cb is independent.",
    back: `\`\`\`scheme
(define make-counter
  (lambda (n)
    (lambda () (set! n (+ n 1)) n)))
(define ca (make-counter 0))
(ca) ; => 1
(ca) ; => 2
(define cb (make-counter 0))
(cb) ; => 1
(ca) ; => 3   ; independent
\`\`\`
The same expression \`(ca)\` returns different values, so the substitution model can't explain this.

**Environment model**:
1. \`(make-counter 0)\` creates frame **E1 = {n: 0} → GE**. Its body is a lambda, evaluated *in E1*, so the returned procedure's environment pointer is **E1**. This is the first procedure we've seen whose environment isn't GE. \`ca\` is bound to it in GE.
2. \`(ca)\` creates **E2 → E1** (from ca's pointer), with no parameters. Then \`(set! n (+ n 1))\` in E2 finds \`n\` in E1 and changes it from 0 to 1, and \`n\` returns 1.
3. The second \`(ca)\` creates E3 → E1, and E1's \`n\` goes from 1 to 2. **E1 persists** because the procedure object still points to it.
4. \`(make-counter 0)\` again creates a *fresh* **E4 = {n: 0}**, and \`cb\`'s procedure points to E4. \`(cb)\` changes E4's \`n\`, never E1's.

**The pattern**: a procedure plus a private frame reachable only through that procedure is **encapsulated local state**. It is the basis of the object systems in Lectures 16–18.`,
    pitfall:
      "Each call to make-counter creates a new frame. A counter whose state lives in a global variable (define n 0) would be shared by every counter, and ca and cb would interfere.",
    related: ["mit6001-env-lambda-application-rules", "mit6001-env-message-passing-data"],
  },
  // --- Lecture 16: Object-oriented programming I ---
  {
    id: "mit6001-env-message-passing-data",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Implement cons, car, cdr and set-car! as message-passing procedures with local state. How do dotted parameters (msg . args) give a uniform interface?",
    back: `**Data as a procedure with local state.** \`cons\` returns a procedure of one argument, \`msg\`, whose frame holds \`x\` and \`y\`:
\`\`\`scheme
(define (cons x y)
  (lambda (msg)
    (cond ((eq? msg 'CAR) x)
          ((eq? msg 'CDR) y)
          ((eq? msg 'PAIR?) #t)
          (else (error "pair cannot" msg)))))
(define (car p) (p 'CAR))
(define (cdr p) (p 'CDR))
\`\`\`
\`(car (cons 1 2))\` → \`(foo 'CAR)\` → a frame for \`msg\` enclosed by the pair's \`{x: 1, y: 2}\` frame → 1. The **contract holds**, even though no memory cell called a "pair" exists. The "tag" is now the object's answer to \`PAIR?\`.

**Mutation by message**: a \`SET-CAR!\` message can return \`(lambda (new-car) (set! x new-car))\`, created in a frame below the pair's frame, so \`(set! x …)\` reaches the pair's \`x\`. The caller must then write \`((p 'SET-CAR!) 0)\`.

**Uniform interface**: handle *all* messages inside the object with internal procedures and **dotted parameters**:
\`\`\`scheme
(define (cons x y)
  (define (change-car new-car) (set! x new-car))
  (define (change-cdr new-cdr) (set! y new-cdr))
  (lambda (msg . args)
    (cond ((eq? msg 'CAR) x)
          ((eq? msg 'CDR) y)
          ((eq? msg 'SET-CAR!) (change-car (car args)))
          ((eq? msg 'SET-CDR!) (change-cdr (car args)))
          (else (error "pair cannot" msg)))))
\`\`\`
**Dotted notation**: in \`(define (add x y . rest) …)\`, \`x\` and \`y\` are required, and \`rest\` is a **list** of any further arguments.
- \`(add 1 2)\` gives \`rest\` = \`()\`.
- \`(add 1 2 3 4 5)\` gives \`rest\` = \`(3 4 5)\`.
- \`(add 1)\` is an error.`,
    pitfall:
      "This is a teaching model. Real Scheme pairs are memory cells, not closures. The point is that the cons/car/cdr contract, not the representation, defines what a pair is.",
    related: ["mit6001-env-closures-local-state", "mit6001-env-operations-types-table"],
  },
  {
    id: "mit6001-env-operations-types-table",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "View a system as a table of operations × data types. Compare organizing it by rows (generic operations with tag dispatch) vs by columns (message-passing objects): which change is easy in each?",
    back: `Picture a table with one **row per operation** (scale, draw, …) and one **column per type** (number, line, shape, …). Each cell holds the procedure for that operation on that type.

**By rows: data-directed (procedural) style.** Each generic operation dispatches on the tag:
\`\`\`scheme
(define (scale x factor)
  (cond ((number? x) (* x factor))
        ((line? x) (line-scale x factor))
        ((shape? x) (shape-scale x factor))
        (else (error "unknown type" x))))
\`\`\`

**By columns: message-passing (object-oriented) style.** Each object is a procedure that dispatches on the **message** and carries its own state and methods. You design around **classes**:
- private state, plus the public messages that form the interface;
- **instances** are created by a *maker* procedure;
- a **bailout** clause reports unknown messages.

| change | rows (generic ops) | columns (objects) |
|---|---|---|
| add a **new type** | edit **every** generic operation's dispatch | write one new maker (class) |
| add a **new operation** | write one new procedure | edit **every** class |

**Which is better depends on the domain.** Procedural style suits numeric work and few data types. Objects suit **simulations** with many interacting objects, each with a little state. The lecture's example is a Star Wars simulator: ships, planets and torpedoes with \`move\`, \`draw\` and \`explode\` methods, a **clock** that ticks **callback** objects, and predicate messages (\`planet?\`) as type tags.`,
    pitfall:
      "Neither style removes the table; it only decides which axis is cheap to extend. Choosing by 'objects are modern' rather than by which axis your system will grow along leads to many scattered edits later.",
    related: ["mit6001-env-message-passing-data", "mit6001-data-tagged-data", "mit6001-env-ask-self-oop"],
  },
  // --- Lecture 17: Object-oriented programming II ---
  {
    id: "mit6001-env-ask-self-oop",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "In the 6.001 object system, why does every message return a method, what do get-method and ask do (with apply), and why does every method take self as its first argument?",
    back: `**Convention**: an instance is a message-accepting procedure, and the response to **every** message is a **method** (a procedure), never a bare value. A \`case\` expression keeps the dispatch tidy:
\`\`\`scheme
(define (make-person fname lname)
  (lambda (message)
    (case message
      ((WHOAREYOU?) (lambda (self) fname))
      ((CHANGE-NAME)
       (lambda (self new-name)
         (set! fname new-name)
         (ask self 'SAY (list 'call 'me fname))))
      ((SAY) (lambda (self list-of-stuff)
               (display-message list-of-stuff) 'NUF-SAID))
      (else (no-method)))))
\`\`\`
Without help, users must write \`((g 'WHOAREYOU?))\`, which couples **method lookup** with **method application**. Separate the two:
\`\`\`scheme
(define (get-method message object) (object message))
(define (ask object message . args)
  (let ((method (get-method message object)))
    (if (method? method)
        (apply method object args)        ; object becomes self
        (error "No method for message" message))))
\`\`\`
- \`(apply f (list a b))\` ≡ \`(f a b)\`. It spreads a list of any length into arguments.
- \`no-method\` is a distinguishable non-procedure marker, so \`method?\` can tell "this object lacks the message" apart from an implementation bug.

**Why self**: a method body has no other way to reach *its own object*. Passing the object as \`self\` lets \`CHANGE-NAME\` do \`(ask self 'SAY …)\`. And when \`self\` is a subclass instance, the call reaches the **subclass's** overriding method.

**Type tests**: \`PERSON?\` methods act as tags. A safe \`(is-a obj 'PROFESSOR?)\` returns false, instead of an error, when the method is missing.`,
    pitfall:
      "Asking a professor 'STUDENT? directly fails with 'no method' rather than returning #f. Wrap type tests in is-a, which checks for the method first.",
    related: ["mit6001-env-inheritance-delegation", "mit6001-env-operations-types-table"],
  },
  // --- Lecture 18: Object-oriented programming III ---
  {
    id: "mit6001-env-inheritance-delegation",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "How does 6.001 implement inheritance with an internal superclass instance? Trace why an arrogant professor's LECTURE loses its 'obviously' when professor uses delegate, and how ask fixes it.",
    back: `**Inheritance**: a subclass maker builds a **private instance of its superclass** and passes any unknown message to it:
\`\`\`scheme
(define (make-professor fname lname)
  (let ((int-person (make-person fname lname)))
    (lambda (message)
      (case message
        ((LECTURE)
         (lambda (self stuff)
           (delegate int-person self 'SAY (append '(therefore) stuff))))   ; BUG
        (else (get-method message int-person))))))

(define (delegate to from message . args)
  (let ((method (get-method message to)))
    (if (method? method)
        (apply method from args)      ; method from TO, applied with FROM as self
        (error "No method" message))))
\`\`\`
A subclass method with the same name **shadows** the inherited one. Shared code lives once, in the superclass. **Delegation** expresses "lecturing is a kind of saying".

**The arrogant professor** has an internal professor, and its \`SAY\` delegates to the professor with \`(append stuff '(obviously))\`. Then \`(ask e 'SAY '(the sky is blue))\` gives *the sky is blue obviously*. But \`(ask e 'LECTURE '(the sky is blue))\` goes:
1. arrogant-prof has no \`LECTURE\`, so \`get-method\` falls through to int-prof's \`LECTURE\`;
2. that **delegates \`SAY\` to int-person**, i.e. it takes the person's SAY method directly;
3. the arrogant \`SAY\` is never consulted.

Output: *therefore the sky is blue*. **No "obviously"**.

**Fix**: in professor's \`LECTURE\`, \`(ask self 'SAY (append '(therefore) stuff))\`. Since \`self\` is the arrogant professor, method lookup starts at the most specific class. Output: *therefore the sky is blue obviously*.

**Rule of thumb**:
- \`ask self\` = "let whoever I really am handle this", which lets subclasses override (virtual dispatch);
- \`delegate\` = "use exactly that superclass's method".`,
    pitfall:
      "The bug is in the superclass (professor), not in the new subclass. A superclass that delegates where it should ask silently disables every subclass override of that message.",
    related: ["mit6001-env-ask-self-oop", "mit6001-env-multiple-inheritance"],
  },
  {
    id: "mit6001-env-multiple-inheritance",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the 6.001 'singing arrogant professor' implement multiple inheritance, and why does the order of the internal superclass instances, or delegating to all of them, change behavior?",
    back: `**Setup**: \`singer\` is a base class with its own \`SAY\` (which appends *tra la la*) and a \`SING\` method (*the hills are alive …*, said via \`(ask self 'SAY …)\`). A **singing arrogant professor** builds *two* internal instances, an internal singer and an internal arrogant professor, and resolves each message by searching them:
\`\`\`scheme
(define (find-method message . objects)
  (define (try objects)
    (if (null? objects)
        (no-method)
        (let ((method (get-method message (car objects))))
          (if (not (eq? method (no-method)))
              method
              (try (cdr objects))))))
  (try objects))
;; in the s-a-p's dispatch:  (else (find-method message int-singer int-arrogant-prof))
\`\`\`

**Order is semantics.** Both parents define \`SAY\`. Searching the singer first means s-a-p says things with *tra la la*. Searching the professor first means *obviously*. Methods that \`ask self 'SAY\` (like \`LECTURE\` and \`SING\`) pick up whichever \`SAY\` wins.

**Alternative policy**: **delegate to all**, sending the message to every internal object so that each runs its own method. A single \`SAY\` then produces several utterances.

**The design lesson**: with hierarchies, and especially multiple ones, you must decide *which object answers which message*:
- inherit by following the chain;
- delegate to a specific superclass;
- or ask \`self\`.

Poor choices produce surprising behavior.`,
    pitfall:
      "Multiple inheritance with a first-match search is order-dependent. Swapping two arguments to find-method silently changes the behavior of every message both parents implement.",
    related: ["mit6001-env-inheritance-delegation", "mit6001-env-ask-self-oop"],
  },
];
