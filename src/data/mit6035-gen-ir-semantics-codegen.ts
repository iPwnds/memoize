// MIT 6.035 (Spring 2010) — Lectures 5-8: intermediate representations
// (the high-level/low-level IR split, symbol tables built from an AST with
// class inheritance, and virtual method table construction for dynamic
// dispatch), semantic analysis (type expressions and equivalence, coercion
// vs. casting, and a practical per-IR-node-type survey of what to check),
// and unoptimized code generation (the x86-64 target model, parameter-
// passing disciplines, caller/callee-saved registers, the full stack-frame
// layout and four-part procedure-linkage protocol, flat-list expression
// lowering, control-flow generation via both fixed templates and a
// structural-induction destruct()/shortcircuit() algorithm, machine vs.
// assembly vs. relocatable code, memory layout/data allocation, and
// pragmatic code-generator engineering guidelines). See src/data/courses.ts
// for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6035-gen";

export const mit6035GenIrSemanticsCodegenCards: Card[] = [
  // --- Lecture 5: Intermediate representations ---
  {
    id: "mit6035-gen-ir-levels",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does a compiler's intermediate representation typically split into a 'high-level IR' and a 'low-level IR', with semantic analysis producing the former and code generation consuming something closer to the latter?",
    back: `**The pipeline, restated with this split made explicit**: program (character stream) → lexical analyzer → token stream → syntax analyzer → parse tree → **semantic analyzer** → **high-level IR** → *(intermediate code optimizer)* → **low-level IR** → code generator → assembly code.

**High-level IR**: still organized around source-language concepts — class/method structure, symbol tables (related card), typed expression trees, structured control flow (\`if\`/\`while\` as tree nodes, not yet flattened into jumps) — genuinely convenient for semantic analysis (type checking, name resolution) and for source-level optimizations (inlining, algebraic simplification) that want to reason in terms of the original program's own structure.

**Low-level IR**: closer to the eventual target machine — a flat sequence (or control-flow graph, related card) of simple, three-address-style operations, explicit register/temporary references, explicit branches rather than structured \`if\`/\`while\` nodes.

**Why not skip straight from the parse tree to machine code?** Each level is a genuine layer of abstraction doing a specific job — semantic analysis is far easier to write against a high-level, source-shaped tree (checking "is this method call's receiver actually a class type" is a tree-local question); code generation is far easier to write against a low-level, machine-shaped representation (turning a flat three-address op into one or two real instructions is nearly mechanical). Keeping the two levels distinct — with an explicit lowering step between them — lets each phase stay simple, exactly the same "staged abstraction" argument that motivates the overall compiler pipeline (Lecture 1, related concept).`,
    related: ["mit6035-gen-symbol-tables-and-scoping", "mit6035-gen-expression-lowering-flat-list"],
  },
  {
    id: "mit6035-gen-symbol-tables-and-scoping",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the symbol-table structure a semantic analyzer builds while walking an AST for a class-based language, and how nested scoping (parameters, locals, fields) is represented.",
    back: `**The basic idea**: as the semantic analyzer walks the parse tree, it builds a **symbol table** for each scope it enters — a class gets its own table (mapping field/method names to their descriptors); each method gets its own **parameter** table and **local-variable** table, nested inside the class's own scope.

**What a descriptor holds**: enough information for later phases to use the symbol correctly without re-deriving it — a field descriptor records its **type** and (once storage layout is decided) its **offset** within the object; a method descriptor records its **parameter types**, **return type**, and eventually its entry-point address; a local/parameter descriptor records its **type** and its eventual **stack-frame offset** (Lecture 7's stack-frame material, related card).

**Nested scoping and lookup**: a name reference (e.g. a bare identifier used inside a method body) is resolved by searching **outward** through the enclosing scopes in order — the method's own **local** table first, then its **parameter** table, then the enclosing **class**'s field table — the same "innermost scope wins, then search outward" discipline used by essentially every block-structured language. Building these tables **while walking the AST** (rather than as a wholly separate later pass) is exactly what lets semantic checks (related card) be performed incrementally, node by node, using whatever symbol information has already been established by the time each node is visited.`,
    related: ["mit6035-gen-ir-levels", "mit6035-gen-inheritance-symbol-tables"],
  },
  {
    id: "mit6035-gen-inheritance-symbol-tables",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How do symbol tables handle class inheritance — field/method lookup across the inheritance chain, and field-layout offset assignment for a subclass?",
    back: `**The problem inheritance raises**: a subclass's own symbol table only directly lists the fields/methods **it itself** declares — but code referencing an inherited field or method (declared in some **ancestor** class) must still resolve correctly.

**The fix — link each class's symbol table to its parent's**: a subclass's symbol table carries an explicit link to its **superclass's** table; field/method lookup that fails in the subclass's own table **continues** the search in the parent's table, and so on up the inheritance chain — exactly the same "search outward through nested scopes" discipline used for parameter/local/field lookup (related card), just applied along the *inheritance* dimension rather than the *lexical-nesting* dimension.

**Field-layout offsets must account for inherited fields**: when assigning each field a concrete byte **offset** within an object's memory layout (needed later for actual load/store code generation, related card), a subclass's **own** fields must be laid out **after** all of its inherited fields' offsets — i.e., the subclass's object layout is the parent's layout, extended with additional fields appended at the end. This specific layout discipline (inherited fields first, at the *same* offsets the parent class itself uses, subclass's own fields appended after) is exactly what lets code written against the **parent** class's field offsets continue to work correctly even when actually operating on a **subclass** instance passed in its place — the foundation the virtual-dispatch mechanism (related card) builds on.`,
    pitfall:
      "Field offsets aren't merely 'whatever's convenient' — a subclass MUST place its inherited fields at the exact same offsets the parent class uses, and can only append its own new fields afterward. Any other layout would break the ability to treat a subclass instance as an instance of its parent (passing it to code that only knows the parent's field layout), which is exactly the substitutability inheritance is supposed to provide.",
    related: ["mit6035-gen-symbol-tables-and-scoping", "mit6035-gen-virtual-dispatch-vtables"],
  },
  {
    id: "mit6035-gen-virtual-dispatch-vtables",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe how a virtual method table (vtable) is constructed for a class hierarchy, and how a method call compiles into an indirect call through it.",
    back: `**The problem virtual dispatch solves**: a method call \`obj.foo()\` where \`obj\`'s **static** (declared) type might differ from its **actual runtime** type (a subclass instance stored in a parent-typed variable) must invoke whichever \`foo\` implementation the **actual** runtime class provides — a compile-time-only lookup based on the static type would call the wrong (parent's) implementation whenever the object was actually a subclass instance overriding that method.

**The mechanism — one vtable per class, built by walking the inheritance chain**: each class gets its own **virtual method table** — an array of method-entry-point addresses. Building a subclass's vtable: **start from a copy of the parent class's vtable** (inheriting every entry positionally); for each method the subclass **overrides**, **replace** that entry (at the *same* position/offset the parent used) with the subclass's own implementation's address; for each **new** method the subclass introduces (not present in the parent at all), **append** a new entry at the end — exactly mirroring the field-layout discipline (related card): inherited entries keep their parent-assigned positions, new entries append after.

**How a method call actually compiles**: every object carries a pointer to its own (actual, runtime) class's vtable, typically stored as a hidden first field. A call \`obj.foo()\` compiles to: load \`obj\`'s vtable pointer; **index into the vtable at \`foo\`'s known, fixed offset** (the same offset regardless of which class in the hierarchy actually implements \`foo\`, guaranteed by the override-in-place construction above); **call through** that loaded address — an **indirect call**, not a direct call to a statically-known address. This is exactly why virtual dispatch works correctly regardless of the object's actual runtime class: the *offset* used to index the vtable is fixed at compile time (known from the *static* type), but the *vtable itself* — and hence which address that offset actually points at — is determined at **runtime** by the object's actual class.`,
    related: ["mit6035-gen-inheritance-symbol-tables"],
  },

  // --- Lecture 6: Semantic analysis ---
  {
    id: "mit6035-gen-type-expressions-and-equivalence",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a type expression, and contrast structural vs. name equivalence for deciding whether two type expressions denote 'the same' type.",
    back: `**Type expressions**: types are themselves described by a small grammar — **basic types** (int, boolean, ...); **type names** (a name bound to some other type expression, e.g. via a \`type\` declaration); **products** (record/struct types — a tuple of named, typed fields); **arrays** (an element type plus, depending on the language, a size); **function types** (parameter types plus a return type). Semantic analysis represents every expression's type as one of these, and type-checking a construct amounts to checking the actual type expressions involved satisfy whatever rule that construct requires (e.g. an \`if\`'s condition must have type \`boolean\`, related card).

**Structural equivalence**: two type expressions are considered the same type if they have the **same structure** — e.g. two independently-written record types with identical field names and field types in the same order are equivalent, even if the programmer never declared them as "the same" type by name.

**Name equivalence**: two type expressions are considered the same type only if they were declared using the **same type name** — two structurally identical but separately-declared record types are treated as **different**, incompatible types under this discipline.

**Why the distinction matters in practice**: name equivalence catches a class of bugs structural equivalence would silently permit (e.g. accidentally passing a \`Meters\` value where a \`Feet\` value was expected, even though both are structurally just "a float"), at the cost of sometimes rejecting genuinely-compatible values that merely weren't declared under a shared name. Real languages make this choice deliberately and differently — the specific choice a compiler's semantic analyzer implements is a genuine, consequential language-design decision, not an incidental implementation detail.`,
    related: ["mit6035-gen-type-coercion-and-casting"],
  },
  {
    id: "mit6035-gen-type-coercion-and-casting",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Distinguish implicit type coercion from explicit type casting, and note what a safe language must additionally do for casts that can fail.",
    back: `**Coercion (implicit)**: the compiler **automatically** converts a value from one type to another when it's used somewhere a different (but compatible) type is expected — the classic example is **widening** (e.g. an \`int\` automatically promoted to a \`float\` when passed where a \`float\` is expected) — no explicit syntax needed in the source program; the compiler silently inserts the conversion.

**Casting (explicit)**: the programmer **explicitly** writes a conversion (e.g. \`(int) x\`) — commonly needed for **narrowing** conversions (e.g. \`float\` to \`int\`, or a supertype reference to a subtype reference) that the language doesn't consider safe enough to perform silently, and so requires the programmer to opt in explicitly, acknowledging the conversion might lose information or might fail.

**What a *safe* language must additionally do for a potentially-failing cast**: a narrowing cast (especially a downcast in an object-oriented type hierarchy — casting a supertype-typed reference down to a subtype) isn't always actually valid for the **specific runtime value** involved — the compiler alone, working only from static types, generally cannot prove the cast will succeed. A safe language's code generator must therefore emit an explicit **runtime check** alongside the cast (verifying the object's actual runtime class, using the same runtime-class information the vtable mechanism, related card, already tracks) — raising a runtime error if the cast is actually invalid, rather than silently proceeding with (and potentially corrupting memory via) an incorrectly-typed value.

**Overloading, a related but distinct concept**: multiple functions/operators sharing one name, distinguished by their **parameter types** — resolving which specific overload a given call site actually means is itself a form of type-directed analysis, closely related to (and often implemented alongside) coercion/equivalence checking, since choosing the right overload may itself depend on which implicit coercions are available for the actual argument types supplied.`,
    related: ["mit6035-gen-type-expressions-and-equivalence", "mit6035-gen-semantic-checks-by-node-type"],
  },
  {
    id: "mit6035-gen-semantic-checks-by-node-type",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the specific semantic checks needed for load/store-array, method-invocation, return, and conditional IR nodes, and state the general pattern these checks follow.",
    back: `**The general framing**: semantic checks are done **while building the IR** (not as a wholly separate pass) — most checks correspond to **making sure the entities referenced actually exist and are usable** in a way that lets a *correct* IR node be built at all; a smaller remainder are simple **sanity checks**. Each source language has its own specific list of required checks, but they follow a recognizable, recurring shape, illustrated across several IR node kinds:

**Store-array instruction** (\`arr[index] = expr\`): look up the variable name (checking it resolves — in the local table, reference its local descriptor; in the parameter table, that's typically an **error**, since arrays are usually passed by reference rather than reassignable as a whole parameter; in the field table, reference its field descriptor; if not found anywhere, a semantic error); check the **index expression's** type is **integer**; check the array's **element type** is compatible with the assigned **expression's** type.

**Method invocation** (\`receiver.method(actuals)\`): check the **receiver expression** actually has a class type; check the **method name** is actually defined somewhere in that class's type (walking the inheritance chain, related card); check the **actual parameters'** types match the **formal parameters'** types — raising the genuine design question of **what "match" means** (exact same type only? or any type that's *compatible*, accounting for coercion, related card?).

**Return instruction**: check the **returned expression's type** matches the enclosing method's declared **return type**.

**Conditional instruction** (\`if\`): check the **test expression** actually produces a **boolean** value.

**The recurring pattern across all of these**: (1) **resolve** every name/reference the construct depends on (a symbol-table lookup, related card, that can itself fail with "not found"); (2) **check type compatibility** between whatever the construct combines (index vs. array element, actual vs. formal parameter, return expression vs. declared return type, test expression vs. boolean). Semantic analysis, reduced to its essence, is exactly this pattern applied systematically across every construct the language's grammar admits — "can flag many potential errors at compile time" specifically because it's checking exactly these two things, consistently, everywhere a construct's own well-formedness depends on them.`,
    related: ["mit6035-gen-type-coercion-and-casting", "mit6035-gen-symbol-tables-and-scoping"],
  },

  // --- Lecture 7: x86-64 target, procedure abstraction & linkage ---
  {
    id: "mit6035-gen-x86-64-overview",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Sketch the x86-64 target model (ALU/Control/Memory/Registers) a code generator must target, including operand kinds and the two main control-transfer mechanisms.",
    back: `**The four components** a code generator's target model needs: **ALU** — performs data operations, of the form \`OP <oprnd1>, <oprnd2>\` (result overwrites the second operand) or a unary \`OP <oprnd1>\`; operands may be an **immediate value** (\`$25\`), a **register** (\`%rax\`), or **memory** (\`4(%rbp)\`); operations include arithmetic (\`add\`, \`sub\`, \`imul\`), logical (\`and\`, \`sal\`), and unary (\`inc\`, \`dec\`) — sized by suffix (\`addb\`/\`addw\`/\`addl\`/\`addq\` for 8/16/32/64-bit operands), and many can raise exceptions (overflow/underflow). **Control** — sequences instructions: ordinary execution simply **increments the PC**; **unconditional branches** (\`jmp .L32\`, \`jmp %rax\`, or \`call\` for procedure invocation) fetch the next instruction from an explicitly different location; **conditional branches** consult the **rFLAGS** condition codes (set implicitly by arithmetic ops, or explicitly by \`cmp\`) via \`Jxx\` variants (\`JO\`/\`JC\`/\`JAE\`/\`JZ\`/\`JNE\`, etc.); rare **traps/exceptions** save the current location, look up a handler address (via an exception vector), and jump there. **Memory** — a **flat, byte-addressable** address space; must hold the program itself, local variables, global variables/data, a stack, and a heap. **Registers** — most instructions permit only **limited** direct memory operand combinations (e.g. two memory operands in one instruction is typically disallowed — \`add -4(%rbp), -8(%rbp)\` is not legal, forcing an intermediate register); registers matter enormously for performance precisely because they're a **scarce** resource; two registers (\`%rbp\`, \`%rsp\`) are conventionally reserved as the base and stack pointers (Lecture 7's stack-frame material, related card).

**Moving data**: \`mov source, dest\` (register↔register, register↔memory); \`push source\`/\`pop dest\` for stack-relative moves. **Other interactions** (I/O, privileged/secure operations, TLB/cache management) are mostly handled via **system calls** — from the compiler's own point of view, these can simply be treated as ordinary function calls into hand-written assembly library routines, rather than needing any special code-generation support of their own.`,
    related: ["mit6035-gen-parameter-passing-disciplines"],
  },
  {
    id: "mit6035-gen-parameter-passing-disciplines",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Using the worked foo(A) example (B=B+1; B=B+A;), show how call-by-value, call-by-reference, and call-by-value-result produce three genuinely different final values for the caller's variable A.",
    back: `**The worked example**: \`int A; foo(int B) { B = B+1; B = B+A; } Main() { A = 10; foo(A); }\` — after \`foo(A)\` returns, what is \`A\`'s final value, under each parameter-passing discipline?

**Call by value**: \`foo\` receives a **copy** of \`A\`'s value (\`B\` starts at 10, independent of \`A\`); \`foo\`'s modifications to \`B\` (\`B=11\`, then \`B=11+A\` — but note \`A\` inside \`foo\` still refers to the **caller's live** global \`A=10\`, so \`B=21\`) never touch the caller's \`A\` at all. **Result: \`A\` is 10** (completely unaffected).

**Call by reference**: \`foo\` receives a genuine **alias** for \`A\` itself — \`B\` and \`A\` are the *same* storage location throughout the call. \`B=B+1\` makes \`A\` become 11; then \`B=B+A\` reads the **current** (already-updated) value of \`A\` through both names simultaneously, giving \`B = 11+11 = 22\`. **Result: \`A\` is 22.**

**Call by value-result (copy-in/copy-out)**: \`foo\` receives a **private copy** of \`A\`'s value in \`B\` (exactly like call-by-value **during** the call — so \`B=B+1\` gives \`B=11\`, then \`B=B+A\` reads the **caller's original, unmodified** \`A=10\` since call-by-value-result doesn't alias during execution — giving \`B=11+10=21\`) — but **on return**, \`B\`'s **final** value is **copied back out** to overwrite \`A\`. **Result: \`A\` is 21.**

**Why this matters for a compiler**: the parameter-passing discipline a source language specifies is a genuine **semantic** choice, independent of the *mechanical* question of whether parameters are physically passed via registers or the stack (related card) — a code generator must implement whichever discipline the source language actually specifies, and the three disciplines are observably, semantically different (as this worked example shows concretely), not merely different performance tradeoffs on the same underlying behavior.`,
    related: ["mit6035-gen-x86-64-overview", "mit6035-gen-caller-vs-callee-saved-registers"],
  },
  {
    id: "mit6035-gen-caller-vs-callee-saved-registers",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "What problem does the caller-saved/callee-saved register convention solve, and what tradeoff does splitting registers between the two conventions represent?",
    back: `**The problem**: a register holding a value the currently-executing code still needs (a **live** register) might get **overwritten** by a called procedure, which is free to use registers for its own purposes — some convention is needed to protect live register values across a procedure call.

**Caller-saved**: it's the **caller's** responsibility to save (e.g. push) any of its own live registers **before** the call, and restore them **after** the call returns — the callee is free to clobber these registers with no obligation to preserve their incoming values.

**Callee-saved**: it's the **callee's** responsibility — if the callee's own body wants to use a callee-saved register, it must first save the register's incoming value (typically in its prolog, related card) and restore it before returning (in its epilog) — the caller can safely assume these registers survive the call untouched.

**The tradeoff a split convention represents** (real ABIs, including this course's own Decaf calling convention, use a mix of both — some registers caller-saved, others callee-saved): a register that's caller-saved costs the **caller** a save/restore **only when that specific register actually holds something live across this specific call** — potentially cheap, if the caller doesn't happen to have anything live there. A register that's callee-saved costs the **callee** a save/restore on **every single call**, whether or not the caller had anything live in it — a fixed cost, but one paid exactly once per call regardless of how many callers exist, versus caller-saved's cost being paid repeatedly at every call site that happens to have something live there. Neither convention is categorically better — a well-designed calling convention (this course's own worked example: 6 argument-passing registers used only as short-lived temporaries "within a segment," not live across calls at all, sidestepping the question entirely for those specific registers) balances the two based on which registers are actually likely to hold call-spanning-live values in typical generated code.`,
    related: ["mit6035-gen-parameter-passing-disciplines", "mit6035-gen-stack-frame-layout"],
  },
  {
    id: "mit6035-gen-stack-frame-layout",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Diagram the full x86-64 stack-frame layout used by this course's calling convention (arguments, return address, saved rbp, callee-saved registers, locals, temporaries, dynamic area, caller-saved registers, further arguments), and state the register-argument convention.",
    back: `**Register-passed arguments**: the first **6** arguments are passed in registers — \`%rdi, %rsi, %rdx, %rcx, %r8, %r9\`, in that fixed order; any **further** arguments (the 7th onward) are passed on the **stack**.

**The stack frame, from low to high address (growing upward in the diagram, \`%rbp\` anchoring the "current" frame's base)**: **dynamic area** (\`0(%rsp)\`, variable size — e.g. space for a called sub-procedure's own eventual frame, or dynamically-sized data) → **caller-saved registers** (saved here if live across an upcoming call, related card) → **argument 7, 8, ... n** (any arguments beyond the first 6, pushed by the *caller* before the call) → **return address** (pushed automatically by \`call\`) → **previous \`%rbp\`** (\`0(%rbp)\` — the caller's own frame-base pointer, saved so it can be restored on return) → **callee-saved registers** (saved here by the *callee*'s own prolog, if it uses any) → **local 0 ... local m** (\`-8(\\%rbp)\` downward — the current procedure's own local variables) → back to a fresh **dynamic area** for this frame's own stack temporaries/further calls (\`0(\\%rsp)\`).

**Why \`%rbp\` anchors the frame despite \`%rsp\` moving constantly**: exactly this course's own earlier — MIT 6.828 — reasoning for the same design (related concept): \`%rsp\` shifts with every push/pop/allocation *within* the currently-executing procedure's own body, making offsets from it a moving target; \`%rbp\` is set **once**, at the very start of the procedure (in its prolog), and held **fixed** for the procedure's entire execution — letting every local variable and (for the first 6) register-passed / (for the 7th+) stack-passed argument be addressed via a single, unchanging offset from \`%rbp\` throughout the procedure's body, regardless of how much the procedure's own \`%rsp\` moves around it in the meantime.`,
    related: ["mit6035-gen-caller-vs-callee-saved-registers", "mit6035-gen-prolog-epilog-precall-postreturn"],
  },
  {
    id: "mit6035-gen-prolog-epilog-precall-postreturn",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the four-part standard procedure-linkage protocol (pre-call, prolog, epilog, post-return), and the enter/leave instruction shorthand.",
    back: `**The four parts, and exactly what each does**: **Pre-call** (executed by the *caller*, immediately before \`call\`): save any live **caller-saved** registers (related card); push (or otherwise arrange) the **arguments**. **Prolog** (executed by the *callee*, at the very start of its own body): push the **old \`%rbp\`** (preserving the caller's frame-base pointer); save any **callee-saved** registers the callee's body will actually use; **allocate space** for locals/temporaries (advancing \`%rsp\`). **Epilog** (executed by the *callee*, just before returning): **restore** the callee-saved registers it saved in its own prolog; **pop** the old \`%rbp\` back; store the **return value** (conventionally in \`%rax\`). **Post-return** (executed by the *caller*, immediately after \`call\` returns): **restore** its own previously-saved caller-saved registers; **pop** the arguments it pushed (reclaiming that stack space).

**Worked prolog, via \`enter\`**: \`push %rbp; mov %rsp, %rbp; sub $48, %rsp\` — three ordinary instructions — is exactly equivalent to the single instruction \`enter $48, $0\` (allocating 48 bytes for locals) — a convenience macro-instruction bundling the standard prolog sequence, though (as this course's own earlier — MIT 6.004 — assembly material notes, related concept) real compilers often prefer the explicit multi-instruction form since it isn't necessarily on a modern CPU's fastest execution path.

**Worked epilog, via \`leave\`**: \`mov %rbp, %rsp; pop %rbp\` is exactly equivalent to the single instruction \`leave\` — restoring \`%rsp\` from the still-valid \`%rbp\` (deallocating locals/temporaries in one step) and then popping the saved old \`%rbp\` back, immediately followed by \`ret\`.

**Why structure the protocol as four separate parts rather than two (just "call" and "return")**: caller-side responsibilities (pre-call, post-return) and callee-side responsibilities (prolog, epilog) are genuinely different concerns, executed by different parties, often generated by entirely different, mutually-unaware compilation units — splitting the protocol this way is exactly what makes **separate compilation** work at all (this course's own object-file/relocatable-code material, related card): a caller compiled by one invocation of the compiler and a callee compiled by a completely separate invocation only need to agree on this shared protocol, never on each other's actual implementation details.`,
    related: ["mit6035-gen-stack-frame-layout", "mit6035-gen-assembly-vs-machine-code"],
  },
  {
    id: "mit6035-gen-assembly-vs-machine-code",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast machine code and assembly language, and within machine code, contrast relocatable and absolute forms — including what an object file actually contains.",
    back: `**Machine code**: what the machine literally understands — raw binary bytes at specific memory locations, with no symbolic structure at all (a bare LOCATION/DATA table).

**Assembly language**: a symbolic layer above machine code — instructions and names given readable symbolic form (\`movl -4(%rbp), %eax\` rather than raw bytes \`8B45FC\`). **Advantages**: simplifies code generation (the compiler emits readable symbols, not literal bit patterns); provides a genuine **logical abstraction layer**, letting **multiple distinct hardware architectures/implementations** be described by variants of a single assembly language, meaning the underlying implementation can change without necessarily changing the compiler's own code-generation target; supports **macro assembly instructions** (e.g. \`enter\`/\`leave\`, related card) that expand into several primitive instructions. **Disadvantages**: needs an additional **assembling and linking** step before the code can actually run, and the assembler itself adds a real processing-time overhead.

**Relocatable machine language (object modules)**: **every** address/location is represented **symbolically** rather than as a fixed number — actual memory addresses are only assigned at **link and load time**. This is exactly what gives **separate compilation** its flexibility (this course's own procedure-linkage material, related card): different compilation units, compiled independently and potentially at different times, can still be correctly stitched together later, since none of them had to commit to final absolute addresses up front.

**Absolute machine language**: addresses are **hard-coded** directly — simple and straightforward to implement, but genuinely **inflexible** (the resulting binary is hard to reload or relocate elsewhere in memory) — used specifically in contexts (interrupt handlers, device drivers) that must run at hardware-fixed, unchangeable addresses anyway, where relocatability offers no benefit.

**What an object file (this course uses the **ELF** format) actually contains**: **multiple segments** (Global Offset Table, Procedure Linkage Table, Text/code, Data, Read-Only Data — mirroring the runtime memory-layout regions, related card); **symbol information** (the names relocatable references depend on); **relocation information** (exactly which locations in the file need their symbolic references patched to real addresses once linking/loading determines them).`,
    related: ["mit6035-gen-prolog-epilog-precall-postreturn", "mit6035-gen-memory-layout-and-data-allocation"],
  },
  {
    id: "mit6035-gen-memory-layout-and-data-allocation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Sketch the flat process memory layout (text/data/stack/heap) a code generator targets, and how it allocates read-only data vs. global variables specifically.",
    back: `**The flat address space, low to high**: **unmapped** (low addresses reserved/inaccessible) → **text** (the program's own instructions — "Program," starting around \`0x40 0000\` in this course's worked numbers) → **data** (globals and read-only data) → **stack** (growing, conventionally, toward the heap) → **dynamic/heap** (growing the opposite direction, toward the stack, meeting somewhere in the middle around \`0x800 0000 0000\`) — the classic "stack and heap grow toward each other" layout, needing genuine memory-management bookkeeping (free lists, related concept from this course's own earlier — MIT 6.828 — allocator material) once either region actually needs to grow.

**Allocating read-only data**: placed in the **text segment** (since it never changes, it's safe to co-locate with the equally-immutable instruction stream). **Integers**: simply use an ordinary **load-immediate** instruction — no separate storage allocation needed at all, the constant lives directly embedded in the instruction stream. **Strings**: allocated via the assembler's **\`.string\`** macro (e.g. \`.msg: .string "Five: %d\\n"\`), giving the string bytes a symbolic label that ordinary code can reference.

**Allocating global variables**: via the assembler's **\`.comm\` directive** — \`.comm name, size, alignment\` — reserving \`size\` bytes of storage in the **data** section, referenced symbolically by \`name\` (and optionally aligned to a specific byte boundary). Accessed using **PC-relative addressing**: \`x(%rip)\` — \`%rip\` holds the **current instruction's address**; the assembler computes and encodes the fixed **offset** from wherever this particular instruction happens to end up to \`x\`'s own storage location, adding that offset to \`%rip\` at execution time to compute the actual address. **Why PC-relative specifically**: this produces **easily relocatable binaries** — since the encoded offset between an instruction and the data it references stays constant regardless of *where in memory* the whole program actually ends up loaded (both the instruction and the data shift together), this addressing mode needs **no relocation-time patching at all** for the common case of code and its own referenced data moving together — directly supporting the "relocatable machine language" goal (related card) with zero extra linker/loader work for this specific, very common case.`,
    related: ["mit6035-gen-assembly-vs-machine-code", "mit6035-gen-x86-64-overview"],
  },

  // --- Lecture 8: Expression/statement/control-flow code generation ---
  {
    id: "mit6035-gen-expression-lowering-flat-list",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Contrast the stack model and flat-list model for evaluating expression trees, and explain why the flat-list ('three-address code') approach is the practical choice despite its obvious inefficiency.",
    back: `**The problem**: expressions are represented as **trees** (an expression either produces a value, or — for boolean expressions used as conditions — sets condition codes, related card); mapping a tree onto a real machine requires deciding an **evaluation order** and **where to keep intermediate values**.

**Stack model**: evaluate the left subtree, push its result; evaluate the right subtree, push its result; pop the top two values, apply the operator, push the result back — a direct recursive-descent evaluation strategy. Flagged directly as **"very inefficient"** — every intermediate value round-trips through memory (the stack) even when it could have stayed in a register, and the push/pop traffic itself is pure overhead.

**Flat-list model ("three-address code")**: **linearize** the expression tree via a **left-to-right, depth-first traversal**, allocating a **fresh temporary** for every intermediate node's result (initially, "all the temporaries on the stack, for now" — a deliberately simple starting placement, related card on register allocation being a later optimization concern). Each resulting operation becomes a single **3-address op**, \`x = y op z\`, which lowers mechanically to: **load** \`y\` into a register; **load** \`z\` into a register; **perform** \`op\` on those two registers; **store** the result to \`x\`.

**Why choose flat-list despite it being obviously verbose and redundant** (the guidelines material, related card, explicitly endorses generating code as unrefined as \`0 + 1*x + 0*y\` without embarrassment): it keeps the **code generator itself extremely simple** — a completely mechanical, uniform translation with no case-by-case cleverness needed — while producing code whose obvious redundancies (unnecessary loads, multiply-by-one, add-zero) are exactly the kind of pattern later **optimization passes** (constant propagation, algebraic simplification, copy propagation, dead code elimination — this course's own Lecture 1 worked example, related concept) are specifically designed to clean up. **Two genuine complications this raises, noted directly**: registers are a limited resource, so a sufficiently large expression tree may need some temporaries spilled to stack-allocated space rather than kept in registers; and some three-address ops may have **no single matching machine instruction**, requiring expansion into multiple real instructions to realize one intermediate-level op.`,
    pitfall:
      "Deliberately generating obviously-inefficient, redundant code at this stage isn't a shortcut taken because doing better would be too hard — it's a genuine engineering strategy: keeping the code generator itself simple and correct, and delegating ALL cleanup to dedicated, separately-testable optimization passes, rather than tangling optimization logic into the code generator where it would make both harder to get right.",
    related: ["mit6035-gen-ir-levels", "mit6035-gen-control-flow-templates"],
  },
  {
    id: "mit6035-gen-control-flow-templates",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the template-matching approach to generating control flow for if/else and while, including the optimized while-loop template that moves the test to the end.",
    back: `**The template-matching approach, generally**: **flatten** each structured control construct using a fixed **template** (a fixed skeleton of jumps/labels with holes for the construct's own sub-parts); assign **unique labels** at every control-join point; **generate** the appropriate code by filling the template's holes with the (recursively generated) code for the construct's sub-parts.

**Template for \`if (test) true_body else false_body\`**: \`<do the test>; j<oper> lab_true; <false_body>; jmp lab_end; lab_true: <true_body>; lab_end:\` — the test's condition-code-setting jump (\`j<oper>\`) branches directly to the **true** case; falling through executes the **false** case followed by an unconditional skip past the true case.

**Worked trace**: \`if (ax > bx) dx = ax - bx; else dx = bx - ax;\` lowers to \`movq 16(%rbp), %r10; movq 24(%rbp), %r11; cmpq %r10, %r11; jg .L0; <false body: dx = bx-ax>; jmp .L1; .L0: <true body: dx = ax-bx>; .L1:\` — a direct, mechanical instantiation of the template above.

**Basic template for \`while (test) body\`**: \`lab_cont: <do the test>; j<oper> lab_body; jmp lab_end; lab_body: <body>; jmp lab_cont; lab_end:\` — testing at the top, unconditionally jumping back after each body execution.

**The optimized while template — moving the test to the end**: \`lab_cont: <do the test>; j<oper> lab_end; <body>; jmp lab_cont; lab_end:\` — inverting the branch condition (branch to *lab_end*, i.e. exit, when the test is now false, instead of branching to *lab_body* when true) collapses the basic template's **two** jumps-per-iteration (a conditional test-jump plus an unconditional back-edge jump) down to **just one** conditional jump per iteration — exactly the same "move the loop-exit test so the common case pays only one branch, not two" optimization this course's own earlier (Lecture 4) parsing material independently arrived at for a *different* reason (predictive-parser loop structuring, related concept) — here motivated purely by runtime branch-count savings rather than parsing concerns, but recognizably the same underlying trick recurring in a genuinely different part of the compiler.

**\`do body while(test)\`'s template**, posed as a direct exercise: \`lab_begin: <body>; <do test>; j<oper> lab_begin;\` — needs **no** separate end label or unconditional jump at all, since a do-while's body always executes at least once before any test.

**The template approach's acknowledged drawback**: fixed templates, applied uniformly regardless of context, routinely produce **more jumps and branches than are actually necessary** for many specific cases — motivating the alternative, more flexible algorithmic/structural-induction approach (related card).`,
    related: ["mit6035-gen-expression-lowering-flat-list", "mit6035-gen-cfg-and-short-circuit"],
  },
  {
    id: "mit6035-gen-cfg-and-short-circuit",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the control-flow graph (CFG) as code generation's target representation, and explain why short-circuit boolean evaluation genuinely requires CFG branching rather than computing a single boolean value first.",
    back: `**Control-Flow Graph (CFG)**: the target representation code generation ultimately aims for. **Starting point**: the high-level IR plus symbol tables (related card); **target**: a CFG, where **nodes are individual instructions**, **edges represent flow of control**, the graph **forks** at conditional-jump instructions and **merges** wherever control can reach a point via more than one path, with designated **entry and exit** nodes.

**Short-circuit evaluation — the semantic requirement**: a boolean condition like \`(i < n) && (v[i] != 0)) || i > k\` must be evaluated executing **only as much as is required** to determine the overall result — e.g. \`v[i] != 0\` should only actually be evaluated **if** \`i < n\` is already known true (this is precisely what prevents an out-of-bounds array access when \`i >= n\`, not merely a performance nicety — genuine program correctness can depend on the right-hand operand never being evaluated at all when the left short-circuits the result).

**Why this genuinely requires CFG branching, not a single boolean-value computation**: a naive code-generation strategy might try to compute each subexpression's boolean result into a value (0 or 1) and then combine them with ordinary logical AND/OR instructions — but that approach **necessarily evaluates every subexpression**, exactly the behavior short-circuit semantics forbids. The correct approach instead represents a condition's evaluation **directly as control flow**: evaluating \`(i < n)\` **branches** — to code that evaluates \`v[i] != 0\` if true, or directly to the loop-exit path if false — never falling through to code that would evaluate the right operand unless the left operand's result actually requires it. The worked CFG for \`while (i < n && v[i] != 0) { i = i+1; }\` shows exactly this: the first comparison's \`jl\` branches either into a **second** comparison block (evaluating \`v[i] != 0\`) or directly to **exit** — with the loop body reached only if **both** conditions' branches ultimately route control there. A three-operand example (\`a < b || c != 0\`) shows the symmetric OR case: the first comparison branches either directly into the body (short-circuiting on a true left operand) or into a **second** comparison evaluating the right operand.`,
    related: ["mit6035-gen-control-flow-templates", "mit6035-gen-destruct-shortcircuit-algorithm"],
  },
  {
    id: "mit6035-gen-destruct-shortcircuit-algorithm",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the structural-induction destruct()/shortcircuit() algorithm as the alternative to template matching, including how nop placeholder nodes get introduced and later eliminated.",
    back: `**The algorithmic approach, generally**: like template matching, "based on **structural induction**" — generate a representation for each sub-part, then **combine** them into a representation for the whole — but instead of fixed templates, use two **mutually recursive** functions operating directly on the CFG (related card) being built.

**\`destruct(n)\`** — generates the lowered (CFG) form of structured code node \`n\`; returns \`(b, e)\`: \`b\` is the fragment's **begin** node, \`e\` its **end** node.

**\`destruct\` on a \`Seq x y\` node** (sequential composition): (1) \`(bx, ex) = destruct(x)\`; (2) \`(by, ey) = destruct(y)\`; (3) **wire** \`next(ex) = by\` (chain \`x\`'s fragment directly into \`y\`'s); (4) **return** \`(bx, ey)\` — the combined fragment begins where \`x\`'s did and ends where \`y\`'s did.

**\`destruct\` on an \`If c x y\` node**: (1)-(2) recursively destruct both branches, giving \`(bx,ex)\` and \`(by,ey)\`; (3) allocate a fresh **\`nop\`** node \`e\` (a placeholder, explained below); (4)-(5) wire **both** branches' end nodes to converge on \`e\` (\`next(ex)=e\`, \`next(ey)=e\`); (6) \`b_c = shortcircuit(c, bx, by)\` (related below) — generate the condition's own branching code, routing to \`bx\` on true, \`by\` on false; (7) **return** \`(b_c, e)\`.

**\`destruct\` on a \`While c x\` node**: (1) allocate a fresh \`nop\` as \`e\` (the loop-exit merge point); (2) \`(bx, ex) = destruct(x)\` (the body); (3) \`b_c = shortcircuit(c, bx, e)\` (loop test routes to the body on true, to exit on false); (4) wire \`next(ex) = b_c\` (the body loops back into the test, not directly to itself); (5) **return** \`(b_c, e)\`.

**\`shortcircuit(c, t, f)\`** — generates the short-circuit form of condition \`c\`, routing to node \`t\` if \`c\` is true, \`f\` if false; returns \`b\`, the fragment's begin node. **On \`c1 && c2\`**: \`b2 = shortcircuit(c2, t, f)\` (recursively build $c_2$'s own branch, since $c_2$ is only reached/evaluated when $c_1$ is true); \`b1 = shortcircuit(c1, b2, f)\` (build $c_1$'s branch, routing its *true* case into $c_2$'s own evaluation, and its *false* case **directly** to \`f\` — skipping \`c2\` entirely, exactly the required short-circuit behavior); return \`b1\`. **On \`c1 || c2\`**: symmetric — \`b2 = shortcircuit(c2, t, f)\`; \`b1 = shortcircuit(c1, t, b2)\` (true case goes **directly** to \`t\`, skipping $c_2$; false case falls into $c_2$'s own evaluation). **On \`!c1\`**: \`shortcircuit(c1, f, t)\` — simply **swap** the true/false targets, no new branching structure needed at all. **On a computed condition \`e1 < e2\`** (the recursion's actual base case): allocate a genuine conditional-branch node comparing \`e1\` and \`e2\`, routing to \`t\`/\`f\` directly — this is where actual comparison instructions finally get emitted.

**\`nop\` nodes and their cleanup**: \`destruct\`'s \`If\`/\`While\` cases both introduce a fresh **\`nop\`** node purely as a **merge point placeholder** — a node with no actual instruction, existing only so multiple incoming edges have somewhere well-defined to converge before the algorithm's recursive structure continues. These nops are **not** left in the final generated code — a **peephole optimization** pass simply **redirects** every edge that pointed at a nop directly to the nop's own single successor, then deletes the now-unreferenced nop node entirely — a clean, mechanical cleanup exactly matching this course's own broader philosophy (related card): generate simple, occasionally-redundant structure first, and let a dedicated, focused cleanup pass remove exactly the specific artifact the generation algorithm introduced for its own bookkeeping convenience.`,
    pitfall:
      "The nop nodes destruct() introduces for If/While merge points aren't a design flaw to work around during generation itself — they're a deliberate, simple bookkeeping device, cleaned up afterward by a dedicated peephole pass. Trying to avoid ever generating them (by special-casing the merge logic inline) would make the destruct()/shortcircuit() recursion itself more complex for no real benefit, exactly the same 'generate straightforwardly, clean up separately' philosophy used throughout this module.",
    related: ["mit6035-gen-cfg-and-short-circuit", "mit6035-gen-codegen-guidelines"],
  },
  {
    id: "mit6035-gen-codegen-guidelines",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "List the pragmatic code-generator engineering guidelines this module closes with, and the reasoning behind each.",
    back: `**Lower the abstraction level slowly**: do **many** passes, each doing few things (or just one) — easier to break the overall project into independently generatable and independently debuggable pieces, rather than one large, all-at-once lowering step that's hard to isolate bugs within.

**Keep the abstraction level consistent**: the IR should have **"correct" semantics at all times** (or, at minimum, the implementer should always **know** precisely what the current semantics are, even mid-transformation) — and it can be genuinely useful to **run some optimizations between** lowering passes, rather than strictly finishing all lowering before any optimization begins.

**Use assertions liberally**: check your own assumptions explicitly in code, rather than silently trusting them — exactly the kind of self-checking discipline that turns a violated invariant into an immediate, localized failure rather than a mysterious downstream bug.

**Do the simplest but dumb thing**: it's genuinely **fine** to generate something as naively redundant as \`0 + 1*x + 0*y\` (this course's own running example, related card on flat-list expression lowering) — such code is "painful to look at," but optimization passes will clean it up; **don't** let a code generator's own logic get complicated trying to avoid generating obviously-improvable code, since that's not the code generator's job.

**Know what's decidable when**: make sure you know exactly what can be determined **at compile time**, within the compiler itself, versus what can only be resolved **at runtime**, by the generated code actually executing — conflating the two is a recurring source of subtle code-generation bugs (e.g. attempting a compile-time decision that actually depends on a runtime value).

**Remember optimizations come later — structure code accordingly**: **let the optimizer do the optimizing** — but *do* think ahead about **what the optimizer will need** from the code generator's output, and structure the generated IR with that in mind (the guideline names register allocation, algebraic simplification, and constant propagation as concrete examples the optimizer will specifically be looking to exploit).

**Set up a good testing infrastructure from the start**: maintain **regression tests** (any input program that ever triggers a bug should be added permanently as a regression test, so the same bug can never silently reappear); and learn **good bug-hunting procedures** — binary search (narrowing down which of many passes/inputs actually introduced a given bug) and **delta debugging** (systematically minimizing a large failing input down to the smallest input that still reproduces the failure) are both named directly as concrete, learnable techniques worth deliberately acquiring, not just generically "debugging harder."`,
    related: ["mit6035-gen-expression-lowering-flat-list", "mit6035-gen-destruct-shortcircuit-algorithm"],
  },
];
