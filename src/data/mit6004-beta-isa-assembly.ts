// MIT 6.004 (Spring 2009) — Lectures 10-13: designing the Beta instruction
// set architecture (ISA design tradeoffs, the von Neumann stored-program
// model, Beta's register/instruction formats, addressing, and branching),
// machine language/assemblers/compilers (interpretation vs. compilation,
// the UASM two-stage assembler, macro expansion, compiling C constructs to
// Beta assembly), a lean bridge into formal models of computation (FSM
// enumeration, the Universal Turing Machine tied back to stored-program
// interpretation — heavily cross-linked to mit6045-computability rather
// than re-deriving the same proofs), and stacks & procedure linkage
// (activation records, the caller/callee contract, stack frame layout,
// recursion, dangling references). See src/data/courses.ts for the lecture
// map.
import type { Card } from "./types";

const MODULE = "mit6004-beta";

export const mit6004BetaIsaAssemblyCards: Card[] = [
  // --- Lecture 10: Designing an Instruction Set ---
  {
    id: "mit6004-beta-isa-von-neumann",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the von Neumann model's key idea, and explain how it solves the programmability problem that a purely ad-hoc control FSM (e.g. one hand-wired for N*(N-1) or factorial) runs into.",
    back: `A hand-built control FSM wired to compute one specific function (e.g. $N\\times(N-1)$) is genuinely **programmable** in a narrow sense — reconfiguring which control sequence loads into the FSM changes what it computes — but it falls short of a practical general-purpose computer for three reasons: (1) it has very **limited storage** (nowhere near the "expandable memory resource" of a Turing machine's tape), (2) it has a **tiny repertoire of operations**, and (3) its "program" is **fixed** — it lacks the power to generate a new program and then execute it.

**The von Neumann architecture** (proposed by John von Neumann in the late 1940s) has three major components — a **CPU** (registers plus logic for a specified set of operations), **main memory** (storage for $N$ words of $W$ bits each, where $N$ is expandable), and **I/O** devices. Its **key idea**, which directly resolves limitation (3): **memory holds not only data, but coded instructions that make up a program**. The CPU **fetches and executes** — interprets — successive instructions of the program, where the program is simply *data* for the interpreter, specifying what computation to perform. Because instructions and data share the **same expandable memory resource**, both program size and data size scale together, and — critically — a program can now **compute and then execute** a new program, since instructions are just memory contents like any other data.`,
    pitfall:
      "The von Neumann insight isn't merely 'add more memory' — a bigger ad-hoc FSM with more storage still has a FIXED program. The actual breakthrough is treating the program itself as data living in the same memory as the data it operates on, which is what makes programmability (not just configurability) possible.",
    related: ["mit6004-beta-isa-programming-model", "mit6004-beta-models-universal-tm-and-interpretation"],
  },
  {
    id: "mit6004-beta-isa-tradeoffs",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What are the two central design axes an instruction set architecture (ISA) must navigate, and what does the RISC philosophy choose along each?",
    back: `Coding instructions as binary data raises two central tradeoff axes:

**Uniformity**: should different instructions be the same size? Take the same amount of time to execute? The trend toward **uniformity** affords simplicity, speed, and — critically for later lectures — **pipelining** (a uniform instruction format and execution time makes it far easier to overlap the processing of successive instructions).

**Complexity**: how many different instructions should exist, and at what level of operation? Should the ISA directly support high-level operations like array indexing, procedure calls, or "evaluate this polynomial"? The **RISC** ("Reduced Instruction Set Computer") philosophy answers: keep instructions **simple**, optimized for speed, and build complex operations out of sequences of simple ones in software rather than hardware.

**How these tradeoffs get resolved in practice**: ISA design is "a mix of engineering and art" — there's no purely analytical way to settle these questions. **Trial by simulation** is the best available technique: implement candidate design choices, run representative **benchmark** programs/code sequences through them, and measure the consequences against a chosen metric (cost, performance, code size, etc.), iterating from there. This course's representative example ISA, designed with these tradeoffs in mind, is the **$\\beta$ (Beta) architecture**.`,
    related: ["mit6004-beta-isa-formats", "mit6004-beta-isa-addressing-modes"],
  },
  {
    id: "mit6004-beta-isa-programming-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the Beta's programming model (registers, PC, memory) and its fetch/execute loop.",
    back: `The Beta's **processor state** consists of a **program counter (PC)** and **32 general registers** ($r0$–$r31$), each holding a 32-bit "word." **$r31$ is hardwired to read as 0**, and writes to it are discarded — a common RISC convention that provides a free "zero" operand and a way to discard results without a special-cased instruction.

**Main memory** is organized as 32-bit words, but — for historical reasons — the Beta uses **byte addresses**: since each memory word holds four 8-bit bytes, addresses of *consecutive words* differ by **4**, not 1.

**Fetch/execute loop** (the concrete realization of the von Neumann interpretation idea, related card): (1) **fetch** Mem$[PC]$; (2) $PC \\leftarrow PC + 4$ (advance to the next word — note the $+4$, not $+1$, matching byte addressing of word-sized instructions); (3) **execute** the fetched instruction (which may itself change $PC$, e.g. a branch); (4) **repeat**. This loop is the entire "interpreter" — the hardware realization of "memory holds coded instructions that get fetched and executed."`,
    related: ["mit6004-beta-isa-von-neumann", "mit6004-beta-isa-formats"],
  },
  {
    id: "mit6004-beta-isa-formats",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the Beta's two 32-bit instruction formats and what each field encodes.",
    back: `Every Beta instruction fits in a single **32-bit word**, uniformly (see the uniformity tradeoff, related card), split into two formats:

**Format 1 — OP, 3 register operands**: \`OPCODE(6 bits) | rc(5) | ra(5) | rb(5) | unused(11)\`. Two source registers ($ra$, $rb$) and one destination register ($rc$), each a 5-bit field addressing one of the 32 registers.

**Format 2 — OPC, 2 register operands + literal**: \`OPCODE(6 bits) | rc(5) | ra(5) | 16-bit signed constant\`. One source register plus an embedded 16-bit two's-complement **literal** ("constant"), sign-extended to 32 bits before use, replacing the second register operand.

**Worked example — the ADD instruction**: \`ADD(r1, r2, r3)\` — assembly-language shorthand ("what we prefer to write") for opcode $100000_2$ with $rc=3$ (R3 as destination), $ra=1$, $rb=2$ (R1, R2 as sources), encoding to the 32-bit hex value \`0x80611000\`. The corresponding literal-constant form, \`ADDC(r1, -3, r3)\`, uses opcode $110000_2$ with the 16-bit field holding $-3$ sign-extended. Every arithmetic/compare/boolean/shift operation exists in both a register-register (\`ADD\`, \`SUB\`, \`MUL\`, \`DIV\`, ...) and a register-constant (\`ADDC\`, \`SUBC\`, \`MULC\`, \`DIVC\`, ...) form — see the related ALU-operations card.`,
    related: ["mit6004-beta-isa-alu-ops-and-constants", "mit6004-beta-isa-programming-model"],
  },
  {
    id: "mit6004-beta-isa-alu-ops-and-constants",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "List the Beta's four ALU operation categories, and explain why the ISA bothers to provide a built-in-constant variant of each rather than relying only on register operands.",
    back: `The Beta's ALU instructions fall into four categories, each with a register-register form \`OP(ra, rb, rc)\` computing \`Reg[rc] = Reg[ra] OP Reg[rb]\`, and a register-constant form \`OPC(ra, const, rc)\` computing \`Reg[rc] = Reg[ra] OP sxt(const)\`:

- **Arithmetic**: \`ADD/ADDC\`, \`SUB/SUBC\`, \`MUL/MULC\`, \`DIV/DIVC\`
- **Compare**: \`CMPEQ/CMPEQC\`, \`CMPLT/CMPLTC\`, \`CMPLE/CMPLEC\`
- **Boolean**: \`AND/ANDC\`, \`OR/ORC\`, \`XOR/XORC\`
- **Shift**: \`SHL/SHLC\`, \`SHR/SHRC\`, \`SAR/SARC\`

**Why built-in constants?** This is a concrete instance of the "trial by simulation" design methodology (related card): measuring representative benchmarks (TeX, Spice, GCC) shows that a **large fraction of operations use a constant operand** — e.g. roughly 83–92% of *compares* and 23–38% of memory loads across the three benchmarks use a constant. Without a literal-constant instruction form, every one of those operations would need an extra instruction just to first load the constant into a register — built-in constants directly eliminate that overhead for the empirically common case, at the cost of a slightly more complex instruction format (two formats instead of one) and a smaller usable register-operand space per format.`,
    pitfall:
      "The register-constant forms aren't a convenience shortcut layered on top of a 'real' register-register ISA — they exist BECAUSE benchmark measurement showed constant operands are common enough to justify first-class hardware support, illustrating the general 'measure representative usage, then optimize for it' ISA design principle.",
    related: ["mit6004-beta-isa-formats", "mit6004-beta-isa-tradeoffs"],
  },
  {
    id: "mit6004-beta-isa-loads-stores",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Give the syntax/semantics of Beta LD and ST, and explain the LOAD-COMPUTE-STORE pattern they establish for compiling variables.",
    back: `**Load**: \`LD(ra, const, rc)\` computes \`Reg[rc] = Mem[Reg[ra] + sxt(const)]\` — "fetch into $rc$ the contents of the memory location whose address is $C$ plus the contents of $ra$." Abbreviation \`LD(C, rc)\` stands for \`LD(R31, C, rc)\` (recall $r31$ reads as 0, so this becomes a pure absolute-address load).

**Store**: \`ST(rc, const, ra)\` computes \`Mem[Reg[ra] + sxt(const)] = Reg[rc]\` — "store the contents of $rc$ into the memory location whose address is $C$ plus the contents of $ra$." Abbreviation \`ST(rc, C)\` stands for \`ST(rc, C, R31)\`.

**Critical addressing detail**: Beta uses **byte addresses**, but only supports **word-aligned, 32-bit-word accesses** — the low two address bits are simply **ignored** by LD/ST.

**Storage convention this establishes**: in C, \`int x, y; y = x * 37;\` — variables **live in memory**, operations are **done on registers**, and registers hold only **temporary** values. This "**LOAD, COMPUTE, STORE**" compilation pattern is the foundation for every subsequent variable/expression compilation example: \`LD(x, r0); MULC(r0, 37, r0); ST(r0, y)\`.`,
    related: ["mit6004-beta-asm-compiling-data", "mit6004-beta-isa-addressing-modes"],
  },
  {
    id: "mit6004-beta-isa-addressing-modes",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "List the common addressing-mode taxonomy (absolute, indirect, displacement, indexed, autoincrement/decrement, scaled), and explain which one the Beta directly supports plus the cost/benefit tension the others represent.",
    back: `A general addressing-mode taxonomy (usable across many real ISAs, of which the Beta directly supports only **displacement**):

| Mode | Value | Typical use |
|---|---|---|
| Absolute: \`constant\` | \`Mem[constant]\` | accessing static data |
| Indirect (register deferred): \`(Rx)\` | \`Mem[Reg[x]]\` | pointer accesses |
| Displacement: \`constant(Rx)\` | \`Mem[Reg[x] + constant]\` | access to local variables |
| Indexed: \`(Rx + Ry)\` | \`Mem[Reg[x] + Reg[y]]\` | array accesses (base + index) |
| Memory indirect: \`@(Rx)\` | \`Mem[Mem[Reg[x]]]\` | access through a pointer in memory |
| Autoincrement: \`(Rx)+\` | \`Mem[Reg[x]]\`, then \`Reg[x]++\` | sequential pointer accesses |
| Autodecrement: \`-(Rx)\` | \`Reg[X]--\`, then \`Mem[Reg[x]]\` | stack operations |
| Scaled: \`constant(Rx)[Ry]\` | \`Mem[Reg[x] + c + d*Reg[y]]\` | array accesses (base + index) |

**The Beta's answer**: only **displacement** addressing is built directly into \`LD\`/\`ST\` (\`const(ra)\`, i.e. \`Reg[ra] + sxt(const)\`) — every other mode above must be **synthesized in software** from displacement addressing plus ordinary ALU instructions (e.g. absolute addressing is just displacement with $ra = r31$, a special case already built in).

**The cost/benefit tension**: real usage-frequency data (from TeX, Spice, GCC) shows displacement dominates actual memory-operand usage (56–67%), with register-deferred (indirect) second (4–41%) and the remaining modes far rarer — motivating the RISC-style choice to build in only the single most valuable mode directly in hardware, and pay a small software-instruction-count cost for the others, rather than complicate every instruction's encoding and the datapath's hardware to support all modes natively.`,
    pitfall:
      "The full addressing-mode list is a general taxonomy taught for comparison — the Beta itself supports ONLY displacement addressing directly in hardware; don't assume the Beta's LD/ST syntax has built-in autoincrement, scaled, or memory-indirect variants.",
    related: ["mit6004-beta-isa-loads-stores", "mit6004-beta-isa-tradeoffs"],
  },
  {
    id: "mit6004-beta-isa-branches",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Give the semantics of BEQ/BNE and explain how the branch offset is encoded — specifically, what it counts and why.",
    back: `The Beta's **branch instructions** conditionally change $PC$, optionally remembering (in $rc$) the address execution branched *from* — useful for procedure calls (related card).

\`BEQ(ra, label, rc)\` — "branch if equal": \`Reg[rc] = PC; if (Reg[ra] == 0) PC = PC + 4*offset;\`
\`BNE(ra, label, rc)\` — "branch if not equal": \`Reg[rc] = PC; if (Reg[ra] != 0) PC = PC + 4*offset;\`

Both use Format 2 (\`OPCODE | rc | ra | 16-bit signed constant\`), where the 16-bit constant field holds \`offset = (label - <addr of the BNE/BEQ instruction>)/4 - 1\`.

**Why divide by 4 and subtract 1?** The offset is measured in **instructions**, not bytes — dividing the byte-distance to the target by 4 (the byte-width of one instruction) converts it to an instruction count, giving up to $\\pm32767$ instructions of reach (rather than $\\pm32767$ bytes, which would be far more restrictive) from a single 16-bit signed field. The $-1$ adjustment accounts for the fact that $PC$ has *already* been advanced by the fetch/execute loop's $PC = PC+4$ step (related card) by the time the offset is added, so the "natural" zero-offset destination is already one instruction past the branch itself.`,
    pitfall:
      "The 16-bit branch offset is a SIGNED CONSTANT counting instruction-widths (words), not raw byte displacement — computing it as a plain byte difference without dividing by 4 (and adjusting by -1 for the already-incremented PC) produces a completely wrong branch target.",
    related: ["mit6004-beta-isa-programming-model"],
  },

  // --- Lecture 11: Machine language, assemblers, and compilers ---
  {
    id: "mit6004-beta-asm-interpretation-vs-compilation",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "Contrast interpretation and compilation as software abstraction strategies, along the dimensions of when they act and what they optimize.",
    back: `Both **interpretation** and **compilation** are translators that let programmers work in an easier language $L_2$ (for a hard-to-program machine $M_1$) rather than $M_1$'s native language directly — but they differ sharply in *when* and *how*:

| | Interpretation | Compilation |
|---|---|---|
| How it treats input "x+2" | **computes** x+2 directly | **generates a program** that computes x+2 |
| When it happens | during execution | before execution |
| What it complicates/slows | program execution | program development |
| Decisions made at | run time | compile time |

**The recurring major design choice**: "do it at compile time, or at run time?" — this tension reappears constantly throughout computer systems (this course will see it again, e.g. in operating systems and memory management). Compilation front-loads translation work so execution is fast but development/build cycles are slower; interpretation keeps development flexible (no separate build step, easier to reason about what's happening) but pays a repeated runtime translation cost on every execution. **Layers of interpretation** are common in practice — e.g. a Scheme interpreter running on an x86 CPU, itself interpreting an application's data — since interpretation and compilation both allow platform-independent languages and can be freely mixed/stacked.`,
    related: ["mit6004-beta-asm-uasm-two-stage-translation"],
  },
  {
    id: "mit6004-beta-asm-uasm-two-stage-translation",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe UASM's model as a two-part software abstraction, and explain the role of symbols, labels, and the '.' (location counter) variable.",
    back: `**UASM** (the 6.004 Micro-Assembly language) is (1) a **symbolic language** for representing strings of bits, and (2) a **program** (an "assembler" — a primitive compiler) for translating UASM source text into binary machine language. It occupies the "**abstraction step 1**" role in the software stack: a symbolic representation of machine language that hides bit-level representations, hex addresses, and raw binary values from the programmer.

**Values**: a UASM source file specifies successive bytes to load into memory, written in decimal (default, e.g. \`37 -3 255\`), binary (\`0b100101\`), or hex (\`0x25\`) — and as arbitrary **expressions** combining these (e.g. \`4*0b110-1\` evaluates to a byte value at assembly time).

**Symbols**: source programs can define named **symbols** for reuse — e.g. \`x = 0x1000\` names a variable location, \`R1 = 1\` names a register. A special variable **\`.\`** (period) always holds the "next byte address to be filled" — \`. = 0x100\` sets the assembly origin; \`. = .+16\` skips 16 bytes (leaving a gap, e.g. for later-filled data); and each byte/word emitted implicitly advances \`.\`.

**Labels**: a **label**, syntax \`x:\`, is simply shorthand for \`x = .\` — capturing whatever address \`.\` currently holds, letting later code refer to that memory location symbolically (e.g. as a branch target) instead of by a fragile hard-coded numeric address.`,
    code: `. = 0x1000       | Assemble into 0x1000
sqrs:  0 1 4 9      | Symbol "sqrs" is 0x1000
       16 25 36 49
       64 81 100 121
       144 169 196 225
slen:  .-sqrs       | slen = 16 (byte count of the table)`,
    related: ["mit6004-beta-asm-macros-and-instruction-assembly", "mit6004-beta-isa-branches"],
  },
  {
    id: "mit6004-beta-asm-macros-and-instruction-assembly",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What is a macro in the UASM sense, and how do macros like betaop/betaopc turn a symbolic instruction like ADD(r1,r2,r3) into its 32-bit binary encoding?",
    back: `A **macro** is a parameterized abbreviation — shorthand that expands, at assembly time, into a longer sequence of primitive UASM statements. Example: \`.macro consec(n)  n  n+1  n+2  n+3\` invoked as \`consec(37)\` has the same effect as writing out \`37 38 39 40\` directly — macros never add new *capability*, only convenience and readability.

**Building real Beta instructions from macros**: the primitive \`.macro betaop(OP,RA,RB,RC) { .align 4  LONG((OP<<26)+((RC%32)<<21)+((RA%32)<<16)+((RB%32)<<11)) }\` packs the opcode and three register fields into one 32-bit word using shifts and masks matching Format 1's bit layout exactly (related card); \`betaopc\` is the analogous macro for Format 2 (opcode + 2 registers + 16-bit constant). \`.align 4\` ensures each instruction begins on a word (4-byte) boundary.

**Worked expansion — \`ADDC(R3,1234,R17)\`**: expands to \`betaopc(0x30,3,1234,17)\` → aligns to a word boundary → emits \`LONG((0x30<<26)+((17%32)<<21)+((3%32)<<16)+(1234%0x10000))\`, which evaluates to the 32-bit constant \`0xC22304D2\` → the \`LONG\` macro itself expands into two \`WORD\` macros (splitting the 32-bit value into little-endian byte-order halves) → finally evaluating down to individual bytes: \`0xD2 0x04 0xC2 0x23\`.

**"Don't have it, fake it"**: convenience macros build higher-level pseudo-instructions entirely out of real Beta instructions — e.g. \`MOVE(RA,RC)\` expands to \`ADD(RA,R31,RC)\`, \`NOP()\` expands to \`ADD(R31,R31,R31)\` (do nothing), and multi-instruction sequences like \`PUSH(RA)\`/\`POP(RA)\` (related stack cards) are themselves defined as macros over primitive Beta instructions.`,
    pitfall:
      "Macros are purely a source-level convenience resolved entirely at assembly time — they don't add any new instructions to the Beta's actual repertoire. A 'pseudo-instruction' like MOVE or PUSH always bottoms out in ordinary ADD/ADDC/LD/ST instructions once expanded.",
    related: ["mit6004-beta-asm-uasm-two-stage-translation", "mit6004-beta-isa-formats"],
  },
  {
    id: "mit6004-beta-asm-compiling-data",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Show the general 'constant base address + variable offset' pattern for compiling array and struct field accesses to Beta assembly.",
    back: `**Arrays**: C \`int Hist[100]; ... Hist[score] += 1;\` compiles to (given \`score\` already in $r1$): \`hist: .=.+4*100\` (reserve 100 ints of storage) then \`MULC(r1,4,r2)\` (index → byte offset, scaled by the 4-byte int size) \`LD(r2,hist,r0)\` (load \`Hist[score]\`) \`ADDC(r0,1,r0)\` (increment) \`ST(r0,hist,r2)\` (store back) — using the **displacement addressing mode's** \`LD(ra, const, rc)\` with the roles reversed from the simple-variable case: the *constant* is the array's fixed base address, and the *register* carries the variable, per-access offset.

**Structs**: C \`struct Point { int x, y; } P1, P2, *p; ... p->y = 157;\` compiles by giving each field a fixed **byte offset** within the struct — \`x=0\`, \`y=4\` — then a field access is \`Mem[<struct base address> + <field's fixed offset>]\`: with $p$'s value in $r3$, \`ST(r0, y, r3)\` implements \`p->y = 157\` (via \`CMOVE(157,r0)\` then that store), since \`y\` was defined as the constant 4.

**The general pattern, stated once for both**: \`Address = CONSTANT base address + VARIABLE offset computed from index\` (arrays: base fixed, offset variable/data-dependent) versus \`Address = VARIABLE base address + CONSTANT component offset\` (structs: base variable — e.g. held in a register — offset fixed at compile time by the field's position). Both are instances of the same displacement-addressing \`LD(ra, const, rc)\`/\`ST(rc, const, ra)\` instruction — only *which* of the two address components is the register and which is the embedded constant differs.`,
    related: ["mit6004-beta-isa-loads-stores", "mit6004-beta-isa-addressing-modes"],
  },
  {
    id: "mit6004-beta-asm-compiling-control-flow",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Show the general template for compiling if/else and while to Beta branches, and explain the 'move the test to the end of the loop' optimization.",
    back: `**If (no else)**: \`if (expr) { STUFF }\` compiles to: (compile *expr* into $rx$) \`BF(rx, Lendif)\` (branch-if-false, skipping *STUFF*) (compile *STUFF*) \`Lendif:\`.

**If/else**: \`if (expr) { STUFF1 } else { STUFF2 }\` compiles to: (compile *expr* into $rx$) \`BF(rx, Lelse)\` (compile *STUFF1*) \`BR(Lendif)\` \`Lelse:\` (compile *STUFF2*) \`Lendif:\` — note the extra unconditional \`BR(Lendif)\` needed at the end of the true-branch, so control doesn't fall through into the else-branch's code.

**While — naive**: \`while (expr) { STUFF }\` compiles to: \`Lwhile:\` (compile *expr* into $rx$) \`BF(rx, Lendwhile)\` (compile *STUFF*) \`BR(Lwhile)\` \`Lendwhile:\`. This works but executes **two** branches per loop iteration (the conditional test-branch, plus the unconditional back-edge branch).

**The "move the test to the end" optimization**: \`BR(Ltest)\` \`Lwhile:\` (compile *STUFF*) \`Ltest:\` (compile *expr* into $rx$) \`BT(rx, Lwhile)\` \`Lendwhile:\`. This restructuring costs **one extra branch before the loop even starts** (the initial unconditional jump to \`Ltest\`) but then executes only **one** branch per iteration thereafter (the loop-closing conditional \`BT\`) — a net win whenever the loop body runs more than once, since the one-time setup cost is amortized across all iterations. This exact transformation is visible in the worked "favorite program" example: the naive compilation needs 11 instructions in the loop body; after applying loop-invariant hoisting (moving LDs/STs of unchanging values outside the loop) and this test-relocation trick together, the same loop shrinks to just 3 instructions per iteration.`,
    pitfall:
      "Compiling if/else naively without the extra unconditional BR(Lendif) after STUFF1 causes execution to 'fall through' into STUFF2's code after the true-branch finishes — the trailing branch is not optional, it's required for correctness, not just style.",
    related: ["mit6004-beta-isa-branches", "mit6004-beta-asm-compiling-data"],
  },

  // --- Lecture 12: Models of computation (lean — cross-linked to 6.045J) ---
  {
    id: "mit6004-beta-models-fsm-enumeration",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the 'FSM enumeration' idea, and why does it matter for the transition from digital hardware to formal models of computation?",
    back: `**The idea**: any FSM with $i$ input bits, $o$ output bits, and $s$ state bits is completely determined by its ROM contents — a truth table of $2^{i+s}$ rows, each specifying $(o+s)$ output bits. Since this truth table is just a finite bit string, there are exactly $2^{(o+s)\\cdot 2^{i+s}}$ possible such FSMs, and — crucially — **every one of them can be assigned a canonical index number**: "FSM$_{837}$" unambiguously names one specific, fully-specified machine (e.g. FSM$_{1077}$ = a 4-bit counter, FSM$_{89143}$ = a specific digital watch design). Real devices (an actual Pentium CPU) have *astronomically* larger index numbers than these toy examples, but the principle is the same: a complete hardware description reduces to a single (very large) integer.

**Why this matters**: this "encode a computing device as an integer" move is precisely the bridge from *hardware* (this course's home territory — switches, gates, combinational logic, FSMs) to the formal, abstract models of computation studied in theoretical computer science (Turing machines, computability, universality — heavily developed in **mit6045-computability**, related cards). The same encoding trick — canonically numbering machines — reappears as the basis for Turing-machine-as-integer-function and for the Universal Turing Machine (related card).`,
    related: ["mit6004-beta-models-universal-tm-and-interpretation", "mit6045-computability-encoding-machines-as-strings"],
  },
  {
    id: "mit6004-beta-models-fsm-limitations-and-turing-machines",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Give the well-formed-parentheses-checker argument for why FSMs are NOT the ultimate digital computing device, and state what Turing's model adds to fix this.",
    back: `**The limitation, concretely**: a "well-formed parentheses checker" — given a string of coded left/right parens, output 1 if balanced, else 0 — is simple to *describe* but **no fixed FSM can implement it correctly for every input length**. The checker must effectively **count** unmatched left-parens seen so far, and an FSM has only a finite, fixed number of states — for *any* particular FSM, however many states it has, there exists some input string (one with more nesting depth than the FSM has states to track) that the FSM gets wrong. FSMs are fundamentally bounded; this task needs **unboundedly many states**, depending on the input.

**Turing's fix**: augment an FSM with an **infinite digital tape** that can be read and written at each step — the FSM component still solves the "FINITE" problem (bounded per-step logic), while the tape provides the unbounded storage FSMs alone lack. A Turing machine is formally specified by: current state, input symbol → next state, symbol to write, direction to move (a truth table exactly analogous to an FSM's, just now also driving tape read/write/move). See **mit6045-computability-tm-informal-model** (related card) for the full formal treatment and the broader theory (decidability, reductions, Rice's theorem, etc.) built on top of this model — this course only needs the model itself as the endpoint of the hardware-to-computability bridge.`,
    related: ["mit6004-beta-models-fsm-enumeration", "mit6045-computability-tm-informal-model"],
  },
  {
    id: "mit6004-beta-models-universal-tm-and-interpretation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the Universal Turing Machine result, and explain why it is the theoretical justification for — and direct analogue of — the von Neumann stored-program computer this module's ISA material builds.",
    back: `Encoding both Turing machines and their input tapes as integers (via the same canonical-numbering trick as FSM enumeration, related card) lets us define $T_k[j]$ = the result of running the $k$-th Turing machine on tape $j$. A natural question: is there a **single** machine $T_U$ that can compute $U(k,j) = T_k[j]$ for **any** $k$ — i.e. one machine capable of emulating the behavior of every other Turing machine, given a description of which one to emulate?

**Surprising answer: yes.** Such a **Universal Turing Machine** exists (in fact infinitely many), each capable of performing *any* computation any Turing machine can perform. The **key idea is interpretation**: $T_U$ manipulates a *coded representation* of an arbitrary machine ($k$) plus data ($j$), rather than needing to be physically rebuilt for each different machine it emulates. **Turing universality is remarkably cheap to achieve** — universal Turing machines with just a handful of states exist — and it is the theoretical bedrock underlying every modern general-purpose computer: "every modern computer is a UTM (given enough memory)," and demonstrating a new machine's universality is done simply by showing it can emulate some already-known universal machine.

**The direct tie-back to this module's hardware material**: this is *exactly* the same move as the von Neumann stored-program insight (related card) — "memory holds not only data, but coded instructions that make up a program" is the Universal-Turing-Machine idea, realized in silicon. The Beta CPU's fetch/execute loop **is** an interpretation loop: $T_U$ reads a coded description ($k$, the program in memory) and applies it to data ($j$), precisely mirroring $U(k,j)=T_k[j]$. See **mit6045-computability-universal-tm-church-turing** (related card) for the formal Church-Turing thesis and universality proofs this result rests on.`,
    related: ["mit6004-beta-isa-von-neumann", "mit6045-computability-universal-tm-church-turing"],
  },

  // --- Lecture 13: Stacks and Procedures ---
  {
    id: "mit6004-beta-stack-activation-records",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is an activation record, what does it need to hold, and why does a naive fixed-register procedure-linkage convention break down for recursive procedures?",
    back: `Every procedure call needs storage for: **arguments** passed in, the **return address** back to the caller, **temporary storage** for intermediate expression results, and **local variables**. Collectively, these — specific to one particular *activation* (one specific call) of a procedure — are called that call's **activation record**.

**Naive first attempt**: adopt a fixed convention — pass the argument in $r1$, the return address in $r28$, the result in $r0$ — and branch to the procedure with \`BR(fact, r28)\`. This works for a **single, non-recursive** call. It breaks down immediately for **recursive** procedures like \`fact(n) = n>0 ? n*fact(n-1) : 1\`: the recursive call to \`fact(n-1)\` needs to use the *same* fixed registers ($r1$ for the argument, $r28$ for the return address) that the *current, still-in-progress* call is also using — the inner call's use of $r28$ **overwrites** the outer call's own return address before the outer call gets a chance to use it, corrupting the outer call's ability to return correctly. Fixed-register linkage needs $O(n)$ distinct storage locations for $n$ levels of recursion, but the naive convention only provides $O(1)$.

**The fix this motivates**: since each activation needs its *own* private copy of this storage, and activations nest in strict last-in-first-out order (an inner call always finishes before the outer call that invoked it resumes), a **stack** (related card) is exactly the right data structure to hold activation records.`,
    pitfall:
      "The bug in the naive fixed-register scheme isn't about running out of registers in some abstract sense — it's that RECURSIVE calls reuse the exact same physical register for the return address across nested, still-live activations, so an inner call's write silently clobbers an outer call's still-needed value.",
    related: ["mit6004-beta-stack-discipline", "mit6004-beta-stack-recursion-and-crawling"],
  },
  {
    id: "mit6004-beta-stack-discipline",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Describe the Beta's stack conventions (SP register, growth direction, PUSH/POP) and why a LIFO discipline specifically matches procedure call/return nesting.",
    back: `**Convention**: dedicate register $r29$ as the **Stack Pointer (SP)**. The stack **builds up** (toward higher addresses) on push; $SP$ always points to the first **unused** location — everything below $SP$ is allocated/protected, everything at/above is free. (Other architectures instead grow stacks *down* with $SP$ pointing at the top of the *used* region — purely a convention choice, not a fundamental constraint.)

**Basic operations, implemented as macros over ordinary ALU/memory instructions** (related card): \`PUSH(RX)\`: \`Reg[SP] = Reg[SP]+4; Mem[Reg[SP]-4] = Reg[X]\` → \`ADDC(R29,4,R29)\` then \`ST(RX,-4,R29)\`. \`POP(RX)\`: \`Reg[X] = Mem[Reg[SP]-4]; Reg[SP] = Reg[SP]-4\` → \`LD(R29,-4,RX)\` then \`ADDC(R29,-4,R29)\`. \`ALLOCATE(k)\`/\`DEALLOCATE(k)\` reserve/release $k$ words by directly adjusting $SP$ by $4k$, without transferring any data — used to reserve space for locals without pushing values one at a time.

**Why LIFO specifically fits procedure linkage**: a stack's defining discipline — "**strong constraint on deallocation order**": only the most-recently-pushed item can be popped next — exactly matches how activation records nest: a called procedure's activation record is always the *most recently created* one, and it is always the *first* to be deallocated (when that call returns), before any *earlier*, still-suspended caller's activation record can be touched again. This is also why stacks are low-overhead: allocation/deallocation is just adjusting a single pointer, no general-purpose free-list management is needed, because the access pattern is guaranteed to be strictly nested.`,
    code: `PUSH(R1)   |  freed-up register saved
PUSH(R0)
...          | R0, R1 available for other use here
POP(R0)    |  restored in reverse (LIFO) order
POP(R1)`,
    related: ["mit6004-beta-stack-activation-records", "mit6004-beta-asm-macros-and-instruction-assembly"],
  },
  {
    id: "mit6004-beta-stack-linkage-contract",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the caller/callee procedure-linkage contract precisely, and explain why arguments are pushed in reverse order.",
    back: `**The contract**, as a strict division of responsibilities: the **CALLER** will (1) push arguments onto the stack, **in reverse order** (last argument pushed first); (2) branch to the callee, placing the return address into a dedicated **linkage register** ($LP$, conventionally $r28$); (3) remove (deallocate) the pushed arguments from the stack once the call returns. The **CALLEE** will (1) perform its promised computation, leaving the result in $r0$; (2) branch back to the caller using the saved return address; (3) leave stacked data intact (including the caller's still-stacked arguments, until the caller itself deallocates them) and leave all registers **except $r0$** unchanged.

**Why reverse order?** Pushing arguments last-first means the **first** argument ends up **closest to the frame base** — at a small, *fixed* positive offset from the base pointer ($BP$, related card) regardless of how many total arguments were pushed. This buys two things: (1) the callee can locate the base pointer's fixed relationship to *all* its locals uniformly (details in the stack-frame-layout card), and (2) the callee can access its first few arguments **without needing to know in advance how many arguments were passed in total** — useful for variadic-style access patterns, since argument $j$'s offset from $BP$ depends only on $j$, not on the total argument count.`,
    pitfall:
      "The caller/callee split of WHO deallocates the arguments matters: the callee is contractually obligated to leave the caller's pushed arguments on the stack untouched — deallocating them is explicitly the CALLER's job, done after the call returns, not the callee's.",
    related: ["mit6004-beta-stack-frame-layout", "mit6004-beta-isa-branches"],
  },
  {
    id: "mit6004-beta-stack-frame-layout",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Diagram a Beta stack frame (BP, SP, LP roles) and explain why a dedicated base pointer is used even though SP alone could theoretically address everything.",
    back: `Three dedicated registers manage stack frames: $r27 = BP$ (**base pointer**, points into the stack at the base of the *local* variables of the currently-executing callee), $r28 = LP$ (**linkage pointer**, holds the return address to the caller), $r29 = SP$ (**stack pointer**, points to the first unused word).

**Layout of one callee's frame**, from low to high address: caller's pushed **args** (reverse order, related card) → saved \`old <LP>\` → saved \`old <BP>\` → the callee's own **locals**/**temps** → unused space (where $SP$ currently points). $BP$ sits at the boundary between the saved linkage/base-pointer pair and the callee's own locals.

**Why a separate $BP$, when $SP$ already points somewhere in the frame?** In principle $SP$ alone could address everything — but $SP$'s value **changes** as the callee executes (every \`PUSH\`/\`POP\`, e.g. for nested expression evaluation or further calls, shifts it), so an offset from $SP$ to a given local variable would itself have to change throughout the callee's execution, constantly recomputed. $BP$, by contrast, is set **once** at entry (\`MOVE(SP,BP)\`) and held **fixed** for the callee's entire execution — letting every local variable and argument be addressed by a single **constant** offset from $BP$ (e.g. \`LD(BP, k*4, rx)\` for local $k$, \`LD(BP, -4*(j+3), rx)\` for argument $j$) regardless of how much the callee subsequently pushes and pops elsewhere in its own frame.`,
    pitfall:
      "It's tempting to think SP could replace BP entirely since SP already points somewhere inside the frame — but SP's value drifts with every push/pop during the callee's execution, while BP is deliberately fixed at entry specifically so that constant, unchanging offsets can address locals/arguments throughout the call.",
    related: ["mit6004-beta-stack-linkage-contract", "mit6004-beta-stack-recursion-and-crawling"],
  },
  {
    id: "mit6004-beta-stack-recursion-and-crawling",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the stack-frame discipline automatically support recursion with no special-casing, and what is 'stack crawling'?",
    back: `**Recursion falls out for free**: because each **call** — recursive or not — pushes a brand-new activation record (allocating fresh space for its own args/locals/saved $BP$/saved $LP$), and each **return** deallocates exactly the most-recently-created record (the LIFO discipline, related card), a procedure calling *itself* needs no special hardware or software support beyond the ordinary calling-sequence contract already described. \`fact(3)\` calling \`fact(2)\` calling \`fact(1)\` calling \`fact(0)\` simply pushes four nested frames, each holding its own private copy of $n$ (via the saved \`old <BP>\`/\`old <LP>\` chain linking each frame back to its caller's frame), then pops them off in exact reverse order as each call returns.

**Stack crawling** — a debugging technique explicitly called out as "particularly useful on 6.004 quizzes": given a raw stack **snapshot** (memory contents plus the current $PC$, $BP$, $SP$), reconstruct the call history by following the chain of saved \`old <BP>\` links backward through the stack, frame by frame — at each frame, decode the arguments, locals, and return location using the fixed offset conventions (related card) to answer questions like "what was the argument to the most recent call?" or "what instruction executes next?" purely from the raw memory dump, without having traced the program's execution directly.`,
    related: ["mit6004-beta-stack-frame-layout", "mit6004-beta-stack-activation-records"],
  },
  {
    id: "mit6004-beta-stack-dangling-references",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a dangling reference, why does stack-based local storage create the risk, and how do C/C++ vs. managed languages differ in their response?",
    back: `**The problem, concretely**: \`int *p; int h(int x) { int y = x*3; p = &y; return 37; } h(10); print(*p);\` — \`h\`'s local variable $y$ lives in $h$'s stack frame, which is **deallocated** the instant $h$ returns (its frame's space becomes "unused space" again, liable to be overwritten by the *next* call). The pointer \`p\`, however, was set to $y$'s address and **outlives** the frame it points into — dereferencing \`p\` afterward reads memory that may since have been overwritten by an entirely different call's frame. Consequence: "randomness, crashes, undefined behavior" — the language gives **no guarantee** about what \`*p\` reads.

**Related tough problem — non-local variable access**: nested procedure definitions that reference an *enclosing* procedure's locals (e.g. Python's \`def f(x): def g(y): return x+y; return g\` then calling the returned \`g\` after \`f\` has already returned) face the same fundamental issue — the "FUNarg problem": the enclosing frame may no longer exist by the time the inner function is actually invoked. C **sidesteps this entirely by outlawing nested procedure declarations**, rather than solving it.

**Two different responses**: **C and C++** treat this as "real tools, real dangers" — the language permits taking a stack variable's address and simply trusts the programmer not to let it dangle ("you get what you deserve"). **Java, Scheme, Python**, and similar languages instead guarantee **safety**: no \`ADDRESS OF\` operator exists for stack locals, and local variables are automatically allocated from a garbage-collected **heap** rather than a stack whenever their lifetime might need to outlive their creating call — trading some performance/manual-optimization opportunity for a hard guarantee against stray reads/writes.`,
    pitfall:
      "A pointer to a stack-local variable is only valid while that variable's frame is still live — once the enclosing procedure returns, the frame's memory is fair game for the next call, and dereferencing the stale pointer reads whatever unrelated data now occupies that address, not a compile error or a clean crash.",
    related: ["mit6004-beta-stack-frame-layout"],
  },
];
