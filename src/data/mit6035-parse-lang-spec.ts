// MIT 6.035 (Spring 2010) — Lectures 1-4: the compiler pipeline and a full
// worked optimization example, language specification (regular
// expressions/NFAs/DFAs for lexical structure, context-free grammars for
// syntax, ambiguity, the AST/concrete-parse-tree distinction, and the
// Chomsky-hierarchy correspondence to automata), bottom-up shift-reduce
// parsing (pushdown automata, LR(0)/SLR/LR(1)/LALR(1) parse-table
// construction), and top-down recursive-descent parsing (backtracking,
// left-recursion elimination, predictive parsing via First sets, left
// factoring, and reconstructing a correct AST from a left-recursion-
// eliminated grammar). This is 6.035's first module — a genuinely new
// subject area (compiler construction) with essentially no overlap
// against the rest of the app, though CFG/automata material is
// cross-linked to MIT 6.045J's formal-language treatment rather than
// re-derived. See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6035-parse";

export const mit6035ParseLangSpecCards: Card[] = [
  // --- Lecture 1: Introduction (compiler pipeline, worked optimization) ---
  {
    id: "mit6035-parse-compiler-pipeline",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Name the standard compiler pipeline phases and what each one's input/output looks like.",
    back: `**The pipeline**: source text → **scanner** (lexical analysis) → stream of tokens → **parser** (syntax analysis) → parse tree / AST → **semantic analyzer** → decorated AST (types checked, names resolved) → **optimizer** → an improved intermediate representation → **code generator** → target machine code.

**What each phase actually does**: the **scanner** groups raw characters into **tokens** (each with a *type*, corresponding to a grammar terminal, and a *value*, the actual text matched — e.g. an \`Int\` token with value \`549\`) — this is exactly a regular-expression-driven process (related card). The **parser** consumes the token stream and builds a **parse tree** reflecting the language's context-free grammar — determining *how* the tokens fit together structurally, not merely that they form a valid sequence. The **semantic analyzer** checks properties a context-free grammar alone can't express (type correctness, whether a variable was actually declared before use). The **optimizer** rewrites the program's intermediate representation to be faster/smaller while preserving its meaning (related card, worked example). The **code generator** finally emits real target-machine instructions.

**Why phases are split this way**: each phase has a genuinely different, self-contained job — cleanly separating "what characters mean as tokens" from "how tokens fit together structurally" from "whether the structure is actually meaningful" from "how to make it fast" lets each phase be reasoned about (and implemented, and tested) largely independently, exactly the kind of modularity this course returns to throughout: a real compiler is a **case study in staged abstraction**, not a single monolithic translation step.`,
    related: ["mit6035-parse-optimization-passes-worked"],
  },
  {
    id: "mit6035-parse-optimization-passes-worked",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the sequence of optimization passes (constant propagation, algebraic simplification, copy propagation, dead code elimination, common subexpression elimination) applied to one worked example program.",
    back: `**The general pattern**: real optimizers apply a **sequence of independently-simple passes**, each targeting one specific kind of improvement, repeatedly — a genuinely different local rewrite can *expose* an opportunity for an *earlier* pass to fire again, which is exactly why real optimizers iterate passes rather than running each exactly once.

**Constant propagation**: if a variable is known to hold a specific constant value at a point in the program (e.g. \`x = 5;\` with no intervening reassignment), **replace later uses of that variable with the constant itself** — e.g. \`y = x + 3\` becomes \`y = 5 + 3\` once \`x\`'s constant value is known.

**Algebraic simplification** (constant folding / identity simplification): once an expression's operands are literal constants, **evaluate it at compile time** (\`5 + 3\` → \`8\`); also apply algebraic identities regardless of whether operands are constants (\`x + 0 → x\`, \`x * 1 → x\`, \`x * 0 → 0\`).

**Copy propagation**: if \`a = b\` (a plain copy, no computation), **replace later uses of \`a\` with \`b\` directly**, wherever \`b\` hasn't since been reassigned — this doesn't by itself eliminate anything, but it creates opportunities for the *next* pass.

**Dead code elimination**: remove computations whose results are **never subsequently used** — including the specific, easy-to-miss pattern **\`x = x\`** (a self-assignment that copy propagation, related step, can produce or reveal), which does nothing and can simply be deleted.

**Common subexpression elimination**: if the **same** expression is computed **more than once** with no intervening change to its operands, compute it **once** and reuse the stored result for later occurrences, avoiding redundant recomputation.

**The overall lesson this worked example teaches**: none of these five techniques is individually sophisticated — each is a small, mechanical, locally-checkable rewrite — but **applying them together, repeatedly**, on a single small program can produce a dramatically simplified final result, illustrating the general optimizer design philosophy this course returns to in much greater depth later (dataflow analysis, related later-module cards): compose many simple, individually-easy-to-justify transformations rather than reasoning about one large, complex rewrite all at once.`,
    related: ["mit6035-parse-compiler-pipeline"],
  },

  // --- Lecture 2: Language specification (regex, CFGs) ---
  {
    id: "mit6035-parse-language-definition-layers",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the two main layers used to define a programming language's surface syntax, and why does lexical analysis run before, and separately from, syntax analysis?",
    back: `**Two layers**: **lexical structure** — defined with **regular expressions**, specifying how raw characters group into *tokens* (identifiers, keywords, operators, literals); **syntactic structure** — defined with a **context-free grammar (CFG)**, specifying how *tokens* combine into larger, meaningful constructs (expressions, statements, whole programs).

**Why split these into two separate layers, rather than one combined grammar over raw characters?** Regular expressions are simpler and admit **much faster** matching algorithms (an efficient DFA-driven scan, related cards) than general CFG parsing does — running the *cheap* mechanism first, to collapse a long character stream down to a much shorter token stream, means the *more expensive* CFG-parsing machinery only ever has to operate over that shorter, already-simplified token stream. It's also simply a better **separation of concerns**: "what characters make up an identifier" is a fundamentally different, independently-answerable question from "where can an identifier legally appear in an expression."`,
    related: ["mit6035-parse-thompson-construction", "mit6035-parse-why-cfg-needed"],
  },
  {
    id: "mit6035-parse-thompson-construction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe Thompson's construction: how a regular expression is converted into an NFA, recursively.",
    back: `**Thompson's construction** builds an **NFA** (nondeterministic finite automaton) directly from a regular expression's own recursive structure — each RE operator gets a small, fixed NFA "gadget," and gadgets combine exactly following how the RE itself was built up.

**Base cases**: a single character $c$ becomes a two-state NFA with one edge labeled $c$. The empty string $\\varepsilon$ becomes a two-state NFA with one $\\varepsilon$-edge (a transition consumable without reading any input).

**Inductive cases**, given NFAs $N_1$ (for RE $r_1$) and $N_2$ (for RE $r_2$): **concatenation** $r_1 r_2$ — wire $N_1$'s accept state to $N_2$'s start state via an $\\varepsilon$-edge, chaining them in sequence. **Alternation** $r_1 | r_2$ — a new start state with $\\varepsilon$-edges branching to *both* $N_1$'s and $N_2$'s start states, and both machines' accept states $\\varepsilon$-edge into one new shared accept state. **Kleene star** $r_1^*$ — a new start/accept state pair, with $\\varepsilon$-edges allowing either skipping $N_1$ entirely (zero repetitions) or looping back into $N_1$ repeatedly (one or more repetitions).

**Why this produces a correct NFA for every regular expression**: each RE is built from finitely many applications of these operators over base characters — since each operator has a well-defined NFA-combining rule, and the whole RE decomposes into a finite tree of operator applications, a complete NFA can always be assembled bottom-up, mechanically, directly mirroring the RE's own parse structure — no cleverness needed per-language, just mechanical composition of a handful of gadgets.`,
    related: ["mit6035-parse-nfa-to-dfa-subset-construction"],
  },
  {
    id: "mit6035-parse-nfa-to-dfa-subset-construction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What is the subset construction, and why do real lexers run a DFA rather than the NFA Thompson's construction directly produces?",
    back: `**Why not just run the NFA directly?** An NFA can be in **multiple states "at once"** (nondeterministically) and has $\\varepsilon$-transitions consumable without reading input — simulating this directly at scan time means tracking a whole **set** of possible current states and repeatedly computing $\\varepsilon$-closures, redone on every single input character — correct, but slower than necessary for something as performance-sensitive as a lexer that must process every character of every source file.

**Subset construction — building an equivalent DFA**: **each DFA state is a *set* of NFA states** — specifically, the $\\varepsilon$-closure of some set of NFA states reachable from the start. Starting from the $\\varepsilon$-closure of the NFA's start state (the DFA's start state), for each possible input symbol, compute the set of NFA states reachable by that symbol followed by another $\\varepsilon$-closure — if that resulting set hasn't been seen as a DFA state yet, create it as a new one; add a DFA transition on that symbol to it. Repeat until no new DFA states are produced. A DFA state is **accepting** if it contains **any** accepting NFA state.

**Why this is worth the extra offline construction cost**: subset construction is a **one-time**, compile-time cost — done once when the lexer itself is being built, not repeated per input character — while the resulting DFA gives **each input character** a single, deterministic, $O(1)$ table lookup at *scan* time, with no set-tracking or $\\varepsilon$-closure recomputation needed while actually lexing a source file. This is exactly the same "pay a one-time construction cost for cheap repeated lookups later" tradeoff seen elsewhere in this course's later parse-table-construction material (related cards).`,
    related: ["mit6035-parse-thompson-construction"],
  },
  {
    id: "mit6035-parse-why-cfg-needed",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why are regular expressions/finite automata insufficient to describe programming-language syntax like balanced parentheses, motivating context-free grammars?",
    back: `**The core limitation**: a finite automaton has, by definition, only a **finite, fixed number of states** — it cannot count to an unbounded depth. Describing something like **balanced parentheses** (\`(((...)))\`, arbitrarily deeply nested, requiring the *same* number of closes as opens) requires tracking a nesting **count** that can grow without bound as input grows — no fixed-size finite-state machine can do this correctly for *every* possible nesting depth, since for any specific FSA (however many states it has), a sufficiently deeply-nested input exceeds what it can distinguish (this is the same fundamental argument as the pumping-lemma-style limitation this course's earlier — MIT 6.045J — automata material establishes formally, related concept).

**Programming-language syntax needs exactly this kind of unbounded, nested structure**: matched parentheses/brackets/braces, nested expressions, nested block structure — all fundamentally require more than a bounded finite-state machine can track.

**The fix — context-free grammars**: a CFG (related card), realized computationally by a **pushdown automaton** (a finite-state machine *plus* an unbounded stack, related later card) can track unbounded nesting depth via the stack itself growing and shrinking with each open/close — exactly the missing capability regular languages/FSAs lack. This is precisely why this course's syntax layer moves from regular expressions (lexical structure) to context-free grammars (syntactic structure): the *unbounded* structure genuinely characteristic of program syntax needs a strictly more powerful model than the *bounded* structure regular expressions can express.`,
    related: ["mit6035-parse-cfg-basics", "mit6035-parse-pushdown-automaton"],
  },
  {
    id: "mit6035-parse-cfg-basics",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define the basic components of a context-free grammar, and distinguish a derivation from a parse tree.",
    back: `**A CFG's components**: **terminals** (tokens — the actual symbols that appear in valid input, e.g. \`+\`, \`Int\`); **nonterminals** (grammar symbols standing for larger syntactic categories, e.g. \`Expr\`, \`Term\` — never appearing in the final input themselves); **productions** (rewrite rules, $A \\to \\beta$, saying nonterminal $A$ can be replaced by the sequence $\\beta$ of terminals/nonterminals); a designated **start symbol**.

**Derivation**: a sequence of rewrite steps starting from the start symbol, at each step replacing **one** nonterminal in the current **sentential form** (a string of terminals and nonterminals) using some matching production, until only terminals remain. A **leftmost derivation** always rewrites the *leftmost* nonterminal at each step; a **rightmost derivation** always rewrites the *rightmost* one.

**Parse tree**: the tree structure recording *which* productions were applied and *where* — nonterminal nodes with their production's right-hand-side symbols as children, terminal nodes as leaves, read left-to-right giving back the original input string. **Different derivation orders (leftmost vs. rightmost) of the *same* sequence of production applications produce the exact same parse tree** — the derivation records an *order* of rewriting, while the parse tree records only the resulting *structure*, which is why parsing algorithms are typically described as either "build a leftmost derivation" (top-down, related card) or "build a rightmost derivation in reverse" (bottom-up, related card), despite both ultimately constructing the same kind of tree.`,
    related: ["mit6035-parse-why-cfg-needed", "mit6035-parse-ambiguity-and-precedence-hack"],
  },
  {
    id: "mit6035-parse-ambiguity-and-precedence-hack",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does grammar ambiguity mean, and how does layering nonterminals by precedence level ('hack the grammar') encode operator precedence and associativity directly into the grammar?",
    back: `**Ambiguity, defined**: a grammar is **ambiguous** if some string in the language it generates has **more than one** distinct parse tree — a genuine structural problem, not merely an inconvenience, since different parse trees for the same input string can correspond to different *meanings* (e.g. \`2 - 3 * 4\` parsed as $(2-3)\\times4$ vs. $2-(3\\times4)$ — wildly different results).

**The naive, flat grammar and why it's ambiguous**: \`Expr → Expr + Expr | Expr - Expr | Expr * Expr | Expr / Expr | Int\` treats every operator identically — a string like \`2 - 3 * 4\` can be parsed with *either* operator applied "first" (as the outermost production), giving two different valid parse trees, with no way for the grammar itself to prefer one.

**The fix — "hack the grammar": layer nonterminals by precedence level**: \`Expr → Expr + Term | Expr - Term | Term\`; \`Term → Term * Int | Term / Int | Int\`. Now **addition/subtraction can only ever be the outermost operation** (they live in \`Expr\`, the higher/outer layer), while **multiplication/division are always nested one level down inside a \`Term\`** — meaning \`2 - 3 * 4\` can *only* be parsed as $2 - (3\\times4)$, since the grammar's very structure forces \`3 * 4\` to reduce to a single \`Term\` before it can ever combine with \`2\` via the \`Expr\`-level \`-\` production — precedence is enforced structurally, by which layer an operator's production lives in, not by any separate precedence-declaration mechanism.

**Associativity, encoded the same way**: \`Expr → Expr + Term\` (not \`Term + Expr\`) is deliberately **left-recursive**, forcing repeated \`+\`/\`-\` applications to always nest on the **left** — giving left-associativity (\`a - b - c\` parses as $(a-b)-c$, not $a-(b-c)$) directly from the grammar's shape, again with no separate declared rule needed.`,
    pitfall:
      "The 'flat' single-nonterminal grammar for arithmetic expressions isn't merely inelegant — it's genuinely ambiguous, admitting multiple parse trees (hence multiple possible meanings) for the same input string. Layering nonterminals by precedence level isn't a stylistic choice; it's the mechanism that makes the grammar unambiguous with respect to precedence in the first place.",
    related: ["mit6035-parse-cfg-basics", "mit6035-parse-ast-vs-cst-dangling-else"],
  },
  {
    id: "mit6035-parse-ast-vs-cst-dangling-else",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Distinguish an abstract syntax tree from a concrete parse tree, and describe the classic dangling-else ambiguity and its grammar-level fix.",
    back: `**Concrete (parse) tree**: records the **literal derivation structure** — every nonterminal, every production application, exactly as the grammar specifies (including nonterminals that exist purely for grammar-engineering reasons, like precedence-layering or left-recursion-elimination helper nonterminals, related later card).

**Abstract syntax tree (AST)**: records only the **semantically meaningful structure** — e.g. an addition node with two operand children — discarding grammar-engineering artifacts (parentheses tokens, precedence-layer nonterminal wrappers) that don't carry independent meaning once parsing is done. Later compiler phases (semantic analysis, code generation) work against the **AST**, not the raw concrete parse tree, precisely because it's a cleaner, purpose-built representation of "what the program actually means" rather than "exactly how the grammar happened to derive it."

**The dangling-else ambiguity**: \`NT → if Expr then Stmt | if Expr then Stmt else Stmt\` — given \`if E1 then if E2 then S1 else S2\`, does the \`else\` bind to the **inner** \`if\` (the usual, intended reading) or the **outer** one? Both are structurally valid parses under this grammar — a genuine ambiguity, not just an implementation quirk, since the grammar itself doesn't determine which \`if\` the \`else\` belongs to.

**The fix, at the grammar level**: distinguish "matched" (an \`if\` that already has its own \`else\`, or contains no \`if\` at all) from "unmatched" statements, and only allow an unmatched \`if\` to appear as the very *last* thing in an outer statement (never nested where a further \`else\` could ambiguously attach) — forcing \`else\` to always bind to the **nearest** unmatched \`if\`, resolving the ambiguity structurally, exactly the same "encode the intended disambiguation directly into the grammar's shape" move already seen for operator precedence (related card).`,
    related: ["mit6035-parse-ambiguity-and-precedence-hack", "mit6035-parse-left-factoring"],
  },
  {
    id: "mit6035-parse-chomsky-hierarchy-correspondence",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the correspondence between grammar classes (regular, context-free) and the machine models that recognize them.",
    back: `**Regular languages ↔ finite automata (FSAs)**: every regular expression corresponds to some finite automaton that recognizes exactly the strings it describes (Thompson's construction plus subset construction, related cards, makes this correspondence completely constructive) — bounded memory, bounded nesting.

**Context-free languages ↔ pushdown automata (PDAs)**: every context-free grammar corresponds to some pushdown automaton — a finite-state machine augmented with an **unbounded stack** — that recognizes exactly the strings it generates; the stack is precisely what provides the unbounded nesting-tracking capability regular languages/FSAs structurally lack (related card).

**Where this fits the broader Chomsky hierarchy** (context-sensitive grammars ↔ linear-bounded automata; unrestricted grammars ↔ Turing machines) — this course's own earlier automata-theory material (MIT 6.045J, related concept) develops this hierarchy and its formal properties (pumping lemmas, closure properties, decidability results) in much greater depth; **this course specifically needs only the regular/CFG layer and its correspondence to FSAs/PDAs**, since that's exactly the pair of formalisms real compilers' lexical and syntactic analysis phases are built on (related cards) — the shift-reduce parsers built later in this module (related cards) are, quite literally, a concrete, practical realization of a pushdown automaton for a specific grammar.`,
    related: ["mit6035-parse-why-cfg-needed", "mit6045-automata-nfa-to-dfa-subset-construction"],
  },

  // --- Lecture 3 + 3b: Shift-reduce (bottom-up) parsing ---
  {
    id: "mit6035-parse-pushdown-automaton",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the pushdown-automaton structure of a shift-reduce parser: its stack, finite-state control, and three actions.",
    back: `**Structure**: a shift-reduce parser is, concretely, a **pushdown automaton** (related card on the CFG/PDA correspondence) — a **stack** holding a mix of terminals and nonterminals already recognized, plus **finite-state control** tracking, at every point, "what has the parser seen so far, and what might legally come next."

**Three parse actions**: **shift** — push the next input token onto the stack, advance the input by one token. **Reduce** (by production $k$, $A \\to \\beta$) — pop $|\\beta|$ symbols off the stack (however many symbols are on $\\beta$'s right-hand side), then push $A$ (the production's left-hand-side nonterminal) in their place — recognizing that the popped symbols collectively matched production $k$'s right-hand side. **Accept** — the parse is complete and successful.

**Why "shift-reduce," and the relationship to rightmost derivation**: shift-reduce parsing builds a **rightmost derivation in reverse** — each reduce step corresponds to *undoing* one step of a rightmost derivation, working from the input string back toward the start symbol, rather than top-down parsing's forward construction of a leftmost derivation (related later card). This bottom-up strategy is exactly what lets shift-reduce parsing handle **left-recursive** grammars directly and efficiently — a genuine advantage over naive top-down approaches (related card on the left-recursion problem).`,
    related: ["mit6035-parse-shift-reduce-mechanics", "mit6035-parse-why-cfg-needed"],
  },
  {
    id: "mit6035-parse-shift-reduce-mechanics",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Trace the exact shift/reduce mechanics on a parenthesis-matching grammar, showing what happens to the state stack and symbol stack at each step.",
    back: `**Worked grammar**: $S \\to X\\text{END} \\ (1)$, $X \\to (X) \\ (2)$, $X \\to () \\ (3)$ (writing \`END\` for the end-of-input marker) — parsing the input \`(())\` followed by end-of-input.

**Two parallel stacks are maintained**: a **state stack** (finite-control states, tracking "where" in the grammar's overall structure the parser currently is) and a **symbol stack** (the actual terminals/nonterminals recognized so far). **Shift to $s_n$**: push the current input token onto the symbol stack; push state $s_n$ onto the state stack; advance to the next input token. **Reduce($k$)**: pop **both** stacks $|\\beta|$ times (matching production $k$'s right-hand-side length); push the production's left-hand-side nonterminal onto the symbol stack; then consult the **Goto** table (indexed by the now-exposed top-of-state-stack and the newly-pushed nonterminal) to push the correct new state.

**Concrete trace excerpt**: starting with input \`)$\` remaining and stack state \`s2, s2, s0\` / symbols \`(, (\`: **shift** \`)\` → state stack \`s5, s2, s2, s0\`, symbols \`), (, (\`. The parse table says state \`s5\` on any lookahead **reduces by production (3)** (\`X → ()\`, matching the popped \`(\` \`)\`) — **pop 2** from both stacks (state stack back to \`s2, s2, s0\`, symbols back to \`(, (\`), then **push $X$** onto the symbol stack and consult **Goto(s2, X) = s3**, pushing \`s3\`. This kind of alternating shift/reduce sequence continues until the stack holds just the start symbol and the input is exhausted, at which point the parser **accepts**.

**Which action to take at each step is entirely table-driven**: the parser looks up \`Table[top-of-state-stack][current-input-symbol]\` to get either a shift instruction, a reduce instruction, or an error — the parser itself contains no grammar-specific logic; all grammar knowledge lives in this precomputed table (related cards on how the table is actually constructed).`,
    related: ["mit6035-parse-pushdown-automaton", "mit6035-parse-lr0-items-closure-goto"],
  },
  {
    id: "mit6035-parse-conflicts",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define shift/reduce and reduce/reduce conflicts, and explain why some grammars produce a genuine conflict that no amount of lookahead can resolve.",
    back: `**Shift/reduce conflict**: at some point in parsing, the parser's finite control is simultaneously in a state where it **could** shift the next input token *and* **could** reduce by some completed production — with no way, from the current state alone, to know which is correct.

**Reduce/reduce conflict**: the parser's current state contains **two or more** distinct "completed" items (productions fully matched, ready to reduce) simultaneously — with no way to know *which* production to reduce by.

**Genuinely ambiguous grammars produce conflicts no lookahead can fix**: consider a grammar admitting, for some specific input, **multiple entirely valid parse trees** (true ambiguity, related card) — e.g. one where a particular decision point genuinely has *three* different valid ways to continue the parse, each corresponding to a different, individually-correct-looking derivation. In this case the shift/reduce (or reduce/reduce) conflict at that decision point isn't a limitation of the *parsing algorithm* — it's a direct, unavoidable **symptom of the underlying grammar's own ambiguity**: no amount of additional lookahead can resolve a conflict that stems from the language itself genuinely admitting multiple valid structures for the same input, since lookahead only ever helps distinguish cases that *are* actually distinguishable from the input stream — it cannot manufacture a distinction the grammar itself doesn't make.

**The practical takeaway**: when a parser generator reports a shift/reduce or reduce/reduce conflict, the first question to ask is **whether the grammar is genuinely ambiguous** (needs restructuring, related cards on precedence-layering and left-factoring) — versus merely needing more lookahead (fixable via SLR/LR(1), related cards) — since only the latter category of conflict is actually resolvable without changing what language the grammar defines.`,
    related: ["mit6035-parse-shift-reduce-mechanics", "mit6035-parse-table-construction-and-slr"],
  },
  {
    id: "mit6035-parse-lr0-items-closure-goto",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define an LR(0) item, and describe the Closure() and Goto() algorithms used to build the DFA of parser states from a grammar.",
    back: `**LR(0) item**: a production with a **dot** marking how much of its right-hand side has been recognized so far — e.g. $X \\to (\\bullet X)$ means "the parser has already seen an open paren, and expects to next see something matching $X$, then a close paren." A production with $n$ right-hand-side symbols generates $n+1$ distinct items (one dot position for each point along the production).

**What an item in the current state means**: item $A \\to \\alpha \\bullet \\beta$ says "the parser has parsed an $\\alpha$; if it goes on to parse a $\\beta$, it should then reduce by $A \\to \\alpha\\beta$." Item $A \\to \\alpha \\bullet$ (dot fully at the end) says "the parser has parsed the whole right-hand side; **reduce now**."

**Closure(I)** — finds every item that belongs in the **same** parser state as the items already in set $I$: repeat — for every item $A \\to \\alpha \\bullet B \\beta$ in $I$ (dot immediately before some nonterminal $B$), and every production $B \\to \\gamma$, add the item $B \\to \\bullet\\gamma$ (dot at the very start) to $I$ — until no more items can be added. **Intuition**: if the parser might be about to parse a $B$, it could be starting *any* of $B$'s own productions, so all of those productions' "just starting" items belong in the same state.

**Goto(I, X)** — finds the state reached by "moving the dot over" grammar symbol $X$ from state $I$: $\\text{Goto}(I, X) = \\text{Closure}(\\{A \\to \\alpha X \\bullet \\beta \\mid A \\to \\alpha \\bullet X \\beta \\in I\\})$ — collect every item in $I$ whose dot sits right before an $X$, advance each dot past that $X$, then take the closure of the result.

**Building the whole DFA**: start with the closure of the single item $S \\to \\bullet\\beta$ (followed by the end-of-input marker) as the initial state. Repeatedly: for each state $I$ and each item $A \\to \\alpha \\bullet X \\beta$ in it, compute $\\text{Goto}(I, X)$; if that set isn't already a known state, add it as a new one, with an edge labeled $X$ from $I$ to it. Repeat until no new states or edges can be added — the resulting graph **is** the shift-reduce parser's finite-state control.`,
    related: ["mit6035-parse-shift-reduce-mechanics", "mit6035-parse-table-construction-and-slr"],
  },
  {
    id: "mit6035-parse-table-construction-and-slr",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How is the ACTION/GOTO parse table built from the LR(0) DFA, why does plain LR(0) suffer spurious conflicts, and how does SLR fix this using Follow sets?",
    back: `**Building the table from the DFA** (related card): for each state, a transition on a **terminal** becomes a **shift** entry; a transition on a **nonterminal** becomes a **goto** entry; an item $A \\to \\alpha\\bullet$ (dot fully at the end) in that state produces a **reduce** entry — under the plain LR(0) scheme, for **every** terminal in the table's columns (no lookahead-based restriction at all).

**The spurious-conflict problem this plain LR(0) construction creates**: consider a state containing **both** a shift-able item **and** a completed item $A \\to \\beta\\bullet$ — plain LR(0) would place a reduce action in **every** column for that state, including columns where the current input symbol **could never legally follow** $A$ in any actual derivation — producing a shift/reduce conflict that doesn't reflect any real ambiguity in the *language*, only an over-eager reduce action the table-construction procedure placed without checking whether it could ever actually be correct.

**SLR (Simple LR) — the fix, using Follow sets**: only place a **reduce** action for item $A \\to \\beta\\bullet$ in the columns for terminals that are actually in **Follow($A$)** — the set of terminals that can legitimately appear immediately after $A$ in *some* derivation (computed via the standard Follow-set fixed-point algorithm: the end-of-input marker is in Follow($S$) for the start symbol; if $A \\to \\alpha B\\beta$ is a production, $\\text{First}(\\beta) \\subseteq \\text{Follow}(B)$; if $\\beta$ can derive $\\varepsilon$, also $\\text{Follow}(A) \\subseteq \\text{Follow}(B)$). **The payoff**: this **eliminates useless reduce actions** in columns where reducing could never actually be correct — e.g. for a grammar with $X \\to a$ and $X \\to ab$, plain LR(0) would place a spurious reduce-by-$X\\to a$ action even in the column for terminal $b$ (where shifting is obviously the only sensible choice, since $b$ genuinely never follows $X$) — SLR correctly restricts that reduce action to only the columns where $b \\notin \\text{Follow}(X)$ would actually allow it, resolving exactly this kind of spurious shift/reduce conflict without changing the grammar at all.`,
    pitfall:
      "A shift/reduce conflict reported by plain LR(0) table construction doesn't necessarily mean the grammar is genuinely ambiguous — it may simply be a spurious conflict from LR(0)'s complete lack of lookahead, exactly the kind SLR's Follow-set restriction is designed to eliminate. Always distinguish 'the grammar is actually ambiguous' (related conflicts card) from 'the parsing technique isn't using enough lookahead to see the distinction.'",
    related: ["mit6035-parse-lr0-items-closure-goto", "mit6035-parse-lr1-and-lalr"],
  },
  {
    id: "mit6035-parse-lr1-and-lalr",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "How do LR(1) items differ from LR(0) items, and what tradeoff does LALR(1) make relative to full LR(1)?",
    back: `**LR(1) items** — carry lookahead directly in the item itself: $[A \\to \\alpha \\bullet \\beta, T]$ — the same production-plus-dot-position as an LR(0) item, **plus** a specific terminal (or the end-of-input marker) $T$, meaning "reduce by $A \\to \\alpha\\beta$ **specifically** when the lookahead is $T$." A single LR(0) item like $X \\to (\\bullet X)$ can expand into **several** distinct LR(1) items — one per possible lookahead symbol that's actually consistent with that parsing context — meaning **LR(1) item sets carry strictly more precise information than SLR's after-the-fact Follow-set patch**, since the lookahead is computed **contextually**, specific to *how* the parser actually reached that state, rather than globally, once, for the nonterminal in isolation (SLR's Follow($A$) is the *same* set no matter which parser state $A$ is being reduced from — potentially too permissive in some specific parsing contexts).

**LR(1) Closure/Goto**: analogous to the LR(0) versions (related card), but now propagate lookahead sets alongside dot positions — Closure$(I)$ adds, for each item $[A \\to \\alpha\\bullet B\\beta, c]$ in $I$ and production $B \\to \\gamma$, the item $[B \\to \\bullet\\gamma, d]$ for every $d \\in \\text{First}(\\beta c)$ (i.e., whatever could follow $B$ in *this specific* context, including $c$ itself if $\\beta$ can vanish to $\\varepsilon$). This eliminates strictly **more** spurious conflicts than SLR can, at the cost of a genuinely **larger** DFA (many more, more finely-distinguished states) — real LR(1) parsers for realistic programming languages can have prohibitively many states.

**LALR(1) — the practical compromise real tools (yacc, bison, CUP) actually use**: build the full LR(1) automaton, then **merge any two states that are identical except for the lookahead symbols on their items** — collapsing LR(1)'s finely-distinguished states back down toward something closer to LR(0)'s state count, while still retaining LR(1)-quality (contextual) lookahead on the reductions that remain. **The tradeoff this merging makes**: LALR(1) typically has **far fewer states** than full LR(1) (often comparable to plain LR(0)/SLR), but the merging can, in principle, **introduce new reduce/reduce conflicts** that the un-merged, fully-distinguished LR(1) automaton would not have had — a real, if generally rare in practice, cost paid for the dramatic state-count savings, which is exactly why LALR(1) is the de facto standard choice for real-world parser generators despite being formally weaker than full LR(1).`,
    related: ["mit6035-parse-table-construction-and-slr", "mit6035-parse-lr0-items-closure-goto"],
  },

  // --- Lecture 4: Top-down / recursive-descent parsing ---
  {
    id: "mit6035-parse-topdown-basic-approach",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the basic top-down parsing approach: building a leftmost derivation, and the central 'policy problem' this leaves open.",
    back: `**The basic idea**: start with the **Start** symbol as the current sentential form (related card). Repeatedly: if the **leftmost** symbol in the current sentential form is a **nonterminal**, choose one of its productions and **apply it** (replacing that nonterminal with the production's right-hand side); if the leftmost symbol is a **terminal**, **match it against the current input token** (and advance, if it matches). If every terminal is eventually matched and the input is fully consumed, a valid parse has been found — this process, by construction, builds a **leftmost derivation** (related card) of the input string, one production application at a time.

**The "policy problem" this leaves genuinely open**: **which production should be chosen** whenever the leftmost nonterminal has more than one applicable alternative? Top-down parsing's basic mechanism (apply a production / match a terminal / accept) says nothing about *how* to make this choice correctly — it's a classic **separation of policy and mechanism**: the mechanism (the three actions) is fixed and simple; the *policy* (which production, when there's a choice) is the genuinely hard remaining design question, addressed by the rest of this lecture via two different strategies: **backtracking** (related card) and **predictive parsing** (related card).`,
    related: ["mit6035-parse-cfg-basics", "mit6035-parse-backtracking-and-left-recursion-problem"],
  },
  {
    id: "mit6035-parse-backtracking-and-left-recursion-problem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe backtracking as a policy for top-down parsing, and explain precisely why combining it with a left-recursive grammar causes an infinite loop.",
    back: `**Backtracking, as a policy**: treat production-choice as a **search problem** — at each choice point, try one alternative; if it later becomes clear that choice leads nowhere (a terminal fails to match, or the derivation can't be completed), **backtrack** to the choice point and try the next alternative instead. This is a completely general search technique (used widely in classical AI and natural-language processing, e.g. parsing, speech recognition) — nothing about it is specific to CFGs.

**Why left recursion breaks it, specifically**: consider a production $Term \\to Term * Int$ (left-recursive — $Term$ appears as the very first symbol on its own right-hand side). A backtracking top-down parser, expanding the leftmost nonterminal $Term$, might choose **this very production first** — producing a new sentential form whose leftmost symbol is, again, $Term$. Nothing about the algorithm has consumed **any actual input** in this step — the parser is right back where it started, structurally, and if it makes the **same** (entirely reasonable-looking) choice again, it produces $Term * Int * Int$ ... expanding the same left-recursive production **forever**, never once needing to check the actual input stream, since the recursion happens entirely on the *left*, before any terminal from that production is ever reached to match against input.

**Why this is a fundamental mismatch, not a fixable implementation bug**: the depth-first, "always expand leftmost first" character of naive backtracking search means it will always try the left-recursive alternative to arbitrary depth *before* ever backing off to try a different, input-consuming alternative — a search strategy issue, not something patchable within backtracking parsing itself. The actual fixes are: **eliminate left recursion from the grammar** (related card, this course's chosen approach for parsing specifically) — or use a different exploration strategy for the underlying general search problem (viable in other domains, but not the approach taken here).`,
    pitfall:
      "The infinite loop isn't a bug in a specific backtracking IMPLEMENTATION — it's a structural consequence of combining depth-first, leftmost-first exploration with a grammar rule that lets the very same nonterminal recur as the first symbol of its own expansion. No amount of implementation cleverness within plain backtracking search fixes this; the grammar itself (or the exploration strategy) has to change.",
    related: ["mit6035-parse-topdown-basic-approach", "mit6035-parse-eliminating-left-recursion"],
  },
  {
    id: "mit6035-parse-eliminating-left-recursion",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the standard grammar transformation for eliminating left recursion, and how it changes the resulting parse tree's shape.",
    back: `**Starting productions**: $A \\to A\\alpha$ (the left-recursive alternative) and $A \\to \\beta$ (a non-left-recursive "base case" alternative), where $\\alpha, \\beta$ are sequences of terminals/nonterminals that don't themselves start with $A$. Repeated application of $A \\to A\\alpha$ naturally builds a **left-branching** parse tree — each new $\\alpha$ attaches as the **right** child of a progressively deeper leftward chain of $A$ nodes.

**The transformation**: introduce a **new nonterminal** $R$, and replace the two original productions with: $A \\to \\beta R$ (the base case, now followed by $R$); $R \\to \\alpha R$ (recursing on $R$, not $A$ — critically, $\\alpha$ now appears **first**, so this is *right*-recursive, not left-recursive); $R \\to \\varepsilon$ (the base case for ending the chain).

**Why this genuinely eliminates the infinite-loop problem**: parsing now always starts with the **non-recursive** $\\beta$ alternative for $A$ — there's no longer any way to expand $A$ into something whose leftmost symbol is $A$ again; the recursive structure has been pushed entirely onto $R$, whose own recursive alternative ($R \\to \\alpha R$) has $\\alpha$ appearing **before** the recursive call, meaning some actual grammar symbols must be matched/consumed before $R$ can recurse again — the left-recursion-specific pathology (recursing with zero symbols consumed) is gone, even though $R$'s recursion is still, in a sense, unbounded in principle.

**The resulting parse-tree shape changes**: the *transformed* grammar naturally produces a **right-branching** concrete parse tree (each $\\alpha$ now nests progressively deeper to the **right**, via $R$'s own right-recursive alternative) — the **opposite** shape from the original left-recursive grammar's naturally left-branching tree, even though both grammars generate the exact same *language*. This shape mismatch is exactly what motivates the later "concrete vs. abstract tree reconstruction" technique (related card) — real compiler code wants the original, semantically-correct left-associative structure, even while parsing against this transformed, right-recursive grammar.`,
    related: ["mit6035-parse-backtracking-and-left-recursion-problem", "mit6035-parse-concrete-vs-abstract-tree-reconstruction"],
  },
  {
    id: "mit6035-parse-predictive-parsing-and-first-sets",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe predictive parsing's one-token-lookahead policy, and the two fixed-point algorithms (derives-ε, First sets) it depends on.",
    back: `**Predictive parsing — the alternative to backtracking**: rather than trying alternatives and backtracking on failure, **look ahead at the next input token** and use it to **decide directly** which production applies — no search, no backtracking, provided the grammar is well-behaved enough (related later card on left factoring) that one token of lookahead genuinely determines the right choice.

**"Derives $\\varepsilon$" — does a nonterminal admit an empty expansion?** Needed because a lookahead decision sometimes has to reason about whether some nonterminal could vanish entirely. Two rules, computed via a **fixed-point algorithm**: (1) $NT \\to \\varepsilon$ directly implies $NT$ derives $\\varepsilon$. (2) $NT \\to NT_1 \\ldots NT_n$, where **every** $NT_i$ derives $\\varepsilon$, implies $NT$ also derives $\\varepsilon$. Algorithm: initialize every nonterminal's "derives $\\varepsilon$" flag to false; set it true for every direct $NT \\to \\varepsilon$ production; then repeatedly scan all productions, propagating rule (2), until nothing changes.

**First($\\beta$) — what terminal can legally appear first, starting from $\\beta$?** $T \\in \\text{First}(\\beta)$ if $T$ can be the very first symbol of *some* derivation starting from $\\beta$. Four constraint rules generate a system of **subset-inclusion constraints** to be solved: $T \\in \\text{First}(T)$ for any terminal $T$ (trivially); $\\text{First}(S) \\subseteq \\text{First}(S\\beta)$ (whatever starts $S$ also starts $S\\beta$); if $NT$ derives $\\varepsilon$, $\\text{First}(\\beta) \\subseteq \\text{First}(NT\\beta)$ (if $NT$ can vanish, whatever starts $\\beta$ can also start $NT\\beta$); if $NT \\to S\\beta$ is a production, $\\text{First}(S\\beta) \\subseteq \\text{First}(NT)$ (whatever can start one of $NT$'s own productions can start $NT$ itself).

**Solving via constraint propagation**: initialize every First-set to empty, then **repeatedly propagate** the subset constraints (each rule above adding elements from one set into another) until a fixed point — no set changes further — is reached. This is a general technique (constraint propagation to a fixed point) that recurs throughout this course's later dataflow-analysis material, related future concept — First-set computation is, in effect, this course's first worked example of the pattern.`,
    related: ["mit6035-parse-eliminating-left-recursion", "mit6035-parse-recursive-descent-implementation"],
  },
  {
    id: "mit6035-parse-recursive-descent-implementation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the structure of a hand-coded recursive-descent parser: one procedure per nonterminal, using First sets to choose productions.",
    back: `**Predictive parsing + hand coding = recursive descent**: one **procedure per nonterminal** $NT$, with productions $NT \\to \\beta_1, \\ldots, NT \\to \\beta_n$. The procedure examines the **current input token** $T$ (kept in a shared/global variable) to decide which production applies: if $T \\in \\text{First}(\\beta_k)$, apply production $k$ — consuming any terminals directly in $\\beta_k$ (checking they actually match), and **recursively calling** the procedures for any nonterminals appearing in $\\beta_k$, in left-to-right order. Each procedure **returns** true/false, indicating whether the parse succeeded from that point.

**Worked example**, for \`Term → Int Term'\`, \`Term' → * Int Term'\`, \`Term' → / Int Term'\`, \`Term' → ε\`:
\`\`\`
Boolean Term()
  if (token = Int n) token = NextToken(); return(TermPrime())
  else return(false)
Boolean TermPrime()
  if (token = *)
    token = NextToken()
    if (token = Int n) token = NextToken(); return(TermPrime())
    else return(false)
  else if (token = /)
    ... (symmetric) ...
  else return(true)
\`\`\`
Note \`TermPrime\`'s final \`else return(true)\` — this is exactly the $\\varepsilon$-production case: if the current token is neither \`*\` nor \`/\`, that's not an error, it's simply the (valid) empty expansion, and parsing of $Term'$ succeeds having consumed nothing further.

**Where the First-set computation (related card) actually gets used**: it's precisely what tells each procedure **which** branch (which production) to take, given the current token — the hand-written \`if\`/\`else if\` chain in the code above is a direct, manual encoding of exactly the First-set-based decision the general predictive-parsing algorithm describes abstractly.`,
    related: ["mit6035-parse-predictive-parsing-and-first-sets", "mit6035-parse-left-factoring"],
  },
  {
    id: "mit6035-parse-left-factoring",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Using the dangling-else example again, show why multiple productions sharing a common prefix break predictive parsing, and how left factoring fixes it.",
    back: `**The problem, revisited from the LL/predictive-parsing angle**: consider $NT \\to \\text{if then}$ and $NT \\to \\text{if then else}$ (this course's own dangling-else grammar, related card, simplified). With \`if\` as the next input token, it's **unclear which production to apply** — both productions' right-hand sides **start with the same prefix** (\`if then\`), so \`if\` $\\in \\text{First}(\\text{if then})$ **and** \`if\` $\\in \\text{First}(\\text{if then else})$ simultaneously — predictive parsing's whole mechanism (related card) depends on the current token uniquely determining which production to take, and here it genuinely doesn't.

**The fix — left factoring**: factor the **common prefix** out into its own, single production, deferring the actual choice point to **after** that shared prefix has already been consumed: $NT \\to \\text{if then } NT'$; $NT' \\to \\text{else}$; $NT' \\to \\varepsilon$. Now there is **no choice at all** when the next token is \`if\` — only **one** production for $NT$ begins with it; the genuine decision (is there an \`else\` or not) has been pushed down to $NT'$, where it *can* be decided cleanly by one token of lookahead (\`else\` vs. anything else) — First($NT'$'s two alternatives) no longer overlap.

**The general principle**: whenever two or more of a nonterminal's productions share a common leading prefix, predictive parsing cannot distinguish between them using only the current token — **left factoring** (repeatedly pulling shared prefixes out into a fresh nonterminal, deferring the actual branch point until after the shared part is consumed) is the standard, mechanical fix, restoring the property predictive/recursive-descent parsing fundamentally depends on: **every nonterminal's alternative productions must have pairwise-disjoint First sets** (accounting for $\\varepsilon$-derivability, related card, via Follow sets where relevant).`,
    related: ["mit6035-parse-ast-vs-cst-dangling-else", "mit6035-parse-recursive-descent-implementation"],
  },
  {
    id: "mit6035-parse-concrete-vs-abstract-tree-reconstruction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Why does parsing against a left-recursion-eliminated grammar naturally produce a right-branching concrete parse tree that doesn't match the desired left-associative AST, and describe the 'incomplete node with a missing left child, filled in by the caller' technique that fixes this.",
    back: `**The mismatch, concretely**: parsing \`2*3*4\` against the transformed (right-recursive, related card) grammar \`Term → Int Term'\`, \`Term' → * Int Term'\`, \`Term' → ε\` naturally produces a **right-branching concrete parse tree** (each \`* Int\` nests one level deeper to the right via $Term'$'s recursion) — but the **semantically correct**, left-associative reading of \`2*3*4\` is $((2\\times3)\\times4)$, a **left**-branching structure. Building the AST by naively mirroring the concrete parse tree's own shape would silently produce the **wrong associativity**.

**The fix — build an *incomplete* subtree, with the leftmost child deliberately left blank, to be filled in by the caller**: \`TermPrime()\` doesn't return a finished tree — it returns **two** things: \`root\` (the root of whatever tree it built) and \`incomplete\` (a specific node **inside** that tree whose **leftmost child slot is still empty**, waiting to be attached). Concretely (called with \`token = *\`, remaining input \`3 * 4\`): \`TermPrime()\` builds a node for \`* 4\` recursively containing a nested node for \`* 3\` — returning \`root\` pointing at the outer (\`*4\`) node, and \`incomplete\` pointing at the **inner** (\`*3\`) node, which still needs *its own* left operand filled in.

**How the caller (\`Term()\`) completes the picture**: \`Term()\` reads the very first \`Int\` (e.g. \`2\`) **before** calling \`TermPrime()\` — call this \`leftmostInt\`. After \`TermPrime()\` returns \`(root, incomplete)\`: if \`root\` is \`NULL\` (no further \`*\`/\`/\` operators at all), just return \`leftmostInt\` directly. Otherwise, **attach \`leftmostInt\` as \`incomplete\`'s left child** (\`incomplete.leftChild = leftmostInt\`), then return \`root\` — since \`incomplete\` is specifically the **innermost, first-encountered** multiplicative node, plugging the true leftmost operand in there, rather than at the tree's outer root, is exactly what reassembles the correct **left**-associative structure, despite the underlying grammar (and its naturally right-branching concrete derivation) being right-recursive throughout.

**The general lesson**: a grammar transformation done purely for **parsing-algorithm** reasons (eliminating left recursion so backtracking/predictive top-down parsing terminates, related card) doesn't have to leak into the **AST's** own shape — a sufficiently clever tree-construction discipline (build incomplete subtrees, thread a pointer to the "hole" back up through the return values, let the caller who has the actually-missing piece plug it in) can recover the original, semantically intended structure entirely within the parser's own implementation, with no separate AST-rebuilding pass needed afterward.`,
    pitfall:
      "Don't assume the concrete parse tree IS the AST — for any grammar that's been transformed for parsing-algorithm reasons (left-recursion elimination being the standard example here), the concrete tree's shape can diverge sharply from the semantically intended structure, and naively mirroring it produces silently wrong associativity, not a crash — exactly the kind of bug that's easy to miss without directly comparing against the intended left-associative reading.",
    related: ["mit6035-parse-eliminating-left-recursion", "mit6035-parse-recursive-descent-implementation"],
  },
  {
    id: "mit6035-parse-recursive-descent-vs-generator-tradeoff",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "What practical engineering tradeoff does the lecture identify between hand-coded recursive-descent parsers and parser-generator-based (LALR/yacc-style) parsers?",
    back: `**The core question posed directly**: what do you do if your parser doesn't work?

**Recursive descent (hand-coded)**: if something's wrong, the fix is to **write more code** — the parser is ordinary, debuggable source code you fully control; there is essentially always *some* way to make it correctly handle whatever grammar construct is causing trouble, even if that requires substantially restructuring the hand-written procedures.

**Parser generator (LALR/yacc-style, related cards)**: if something's wrong, the fix is generally to **hack the grammar** (restructure productions to eliminate conflicts, per this module's own earlier precedence-layering and left-factoring techniques, related cards) — but **if the parser generator's underlying algorithm still can't handle the resulting grammar** (a genuinely ambiguous construct that resists any restructuring, or a construct needing more lookahead/context than the generator's algorithm supports), **there is nothing further you can do** within that tool — the parser may simply **never** work for that specific grammar, however much effort is spent.

**Why this matters more as language complexity grows**: a more **complicated grammar** increases the chance of running into exactly this kind of generator-specific limitation — pushing "outside the comfort zone" of whatever specific parsing algorithm (SLR, LALR(1), etc.) the generator implements.

**The bottom-line tradeoff**: recursive descent is **probably more work** up front, but carries **less risk of an outright dead end** — you can almost always eventually make a hand-written recursive-descent parser work, and the resulting code may also be **easier to live with** afterward (a single, ordinary language/toolchain throughout, no separate parser-generator step to integrate, no dependency on a potentially "flaky" external tool). **The stated recommendation**: if parser-development time is small relative to the rest of the project, **or** the target language is genuinely complicated, favor a **hand-coded recursive-descent parser** — trading more up-front implementation effort for substantially lower risk of getting permanently stuck.`,
    related: ["mit6035-parse-lr1-and-lalr", "mit6035-parse-recursive-descent-implementation"],
  },
];
