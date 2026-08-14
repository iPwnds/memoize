// MIT 6.004 (Spring 2009) — Lectures 1-3: information theory basics (Shannon
// entropy, encodings, error correction), the digital abstraction (contracts,
// noise margins, combinational devices), and CMOS technology (MOSFETs, gate
// synthesis, timing, power). Completely new territory for the app — every
// prior course has been algorithms/theoretical CS; this is the first
// hardware/digital-systems content, so there is no overlap to cross-link
// against. See src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6004-basics";

export const mit6004InfoDigitalCmosCards: Card[] = [
  {
    id: "mit6004-basics-shannon-information",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State Shannon's formula for quantifying information, and explain why unequally-probable choices require a weighted-average bit count instead.",
    back: `**Shannon (1948)**: information resolves uncertainty — it's simply *that which cannot be predicted*. If you face $N$ equally probable choices, and a fact narrows it down to $M$ choices, you've been given $\\log_2(N/M)$ **bits** of information. Examples: one coin flip, $\\log_2(2/1)=1$ bit; the roll of 2 dice, $\\log_2(36/1) \\approx 5.2$ bits.

**When choices aren't equally probable**, a rare (unlikely) choice carries *more* information than a common one — learning something you already expected tells you little. Choice $i$ with probability $p_i$ carries $\\log_2(1/p_i)$ bits; the **average** information per choice (what a good encoding should aim to match) is $\\sum_i p_i \\log_2(1/p_i)$ — this quantity is **entropy**. Worked example: choices A, B, C, D with probabilities $\\frac{1}{3}, \\frac{1}{2}, \\frac{1}{12}, \\frac{1}{12}$ carry $1.58, 1, 3.58, 3.58$ bits respectively; the entropy (weighted average) is $(.333)(1.58)+(.5)(1)+(2)(.083)(3.58) \\approx 1.626$ bits — notably less than the 2 bits a naive fixed-length code would need for 4 symbols, since encoding based on true probabilities can do better than encoding based on symbol *count* alone.

This is the theoretical target every encoding scheme (related cards) is measured against: an encoding is "good" to the extent it approaches this entropy bound, using few bits for common symbols and more for rare ones.`,
    related: ["mit6004-basics-encoding-schemes"],
  },
  {
    id: "mit6004-basics-encoding-schemes",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Contrast fixed-length and Huffman variable-length encodings, and work through a concrete Huffman tree example.",
    back: `**Fixed-length encoding**: appropriate when choices are equally likely (or assumed so) — use at least $\\lceil\\log_2(\\text{count})\\rceil$ bits per symbol. E.g. ~86 printable English characters ($\\log_2(86)=6.426$) round up to 7-bit ASCII; 10 decimal digits ($\\log_2(10)=3.322$) round up to 4-bit BCD (binary-coded decimal).

**Huffman coding** (David Huffman, MIT, 1950s): when probabilities differ, use **shorter** bit sequences for high-probability choices and **longer** sequences for rare ones — approaching the entropy bound (related card) rather than the naive fixed-length count. Worked example, same A/B/C/D distribution ($p=\\frac13,\\frac12,\\frac1{12},\\frac1{12}$): build a binary tree bottom-up by repeatedly merging the two least-probable nodes; the resulting codewords are A="11", B="0", C="100", D="101" (each choice's depth in the tree is its codeword length). **Average codeword length**: $(.333)(2)+(.5)(1)+(2)(.083)(3) = 1.666$ bits — better than a naive fixed 2-bit code (which would need exactly 2000 bits to transmit 1000 choices vs. Huffman's ~1666), though still short of the true 1.626-bit entropy bound, since Huffman encodes one symbol at a time.

**Getting closer to the entropy bound**: encoding **sequences** of choices together (not just one symbol at a time) can approach entropy more closely — this is the approach most real file-compression algorithms (ZIP, etc.) actually take. A telling consequence: **recompressing already-compressed data doesn't help** — if the first compression pass removed all redundancy, the result is close to random noise, which by definition has no further redundancy left to exploit.`,
    pitfall:
      "Huffman coding with one codeword per symbol gets close to entropy but generally doesn't reach it exactly — only when all probabilities happen to be exact negative powers of 2 does per-symbol Huffman coding hit the entropy bound precisely; otherwise, encoding sequences of symbols jointly is needed to close the remaining gap.",
    related: ["mit6004-basics-shannon-information", "mit6004-basics-hamming-error-correction"],
  },
  {
    id: "mit6004-basics-twos-complement",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does two's complement representation let addition handle both signed and unsigned numbers with the same circuit, and what's its range?",
    back: `An $n$-bit **two's complement** number treats the most-significant bit as having a **negative** weight: $v = -2^{n-1}b_{n-1} + \\sum_{i=0}^{n-2} 2^i b_i$ (compare to an ordinary unsigned binary number, where every bit has a positive weight). Example: $8$-bit $11010110 = -2^7+2^6+2^4+2^2+2^1 = -128+64+16+4+2 = -42$. The representable **range** is $[-2^{n-1}, 2^{n-1}-1]$ — asymmetric, one more negative value than positive, since $0$ itself only needs one of the two "sign" patterns a naive signed-magnitude scheme would waste on $+0$/$-0$.

**The key engineering payoff**: ordinary binary addition performed **mod $2^n$** (simply discarding any carry out of the top bit) produces the *correct* result whether the operands are interpreted as unsigned or as two's-complement signed — **no separate subtraction circuitry or signed/unsigned mode is needed**. This works because two's complement negation is exactly "invert all bits, add 1," which is algebraically equivalent to $2^n - v$ — so $a + (-b) \\bmod 2^n$ computed via ordinary addition automatically lands on the correct signed result.

**Fractions, too**: moving the implicit "binary point" lets the same bit-pattern machinery represent fractional values — e.g. $1101.0110 = -2^3+2^2+2^0+2^{-2}+2^{-3} = -8+4+1+0.25+0.125 = -2.625$ — with the sign bit and the point's position being purely a matter of *interpretation* of the same underlying bits, not a different physical representation.`,
    pitfall:
      "Two's complement's range is asymmetric — an n-bit representation covers one more negative value than positive values (e.g. 8-bit range is -128 to 127, not -127 to 127) — attempting to negate the most negative representable value (like -128 in 8 bits) overflows back to itself, a classic off-by-one bug source.",
    related: ["mit6004-basics-shannon-information"],
  },
  {
    id: "mit6004-basics-hamming-error-correction",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Define Hamming distance, and derive the relationship between minimum code-word distance and how many bit errors can be detected vs. corrected.",
    back: `**Hamming distance**: the number of digit positions in which two equal-length encodings differ. A naive 1-bit code for a coin flip ("0"="heads", "1"="tails") has Hamming distance exactly 1 between its two valid codewords — meaning a single-bit transmission error turns one valid codeword directly into the *other* valid codeword, giving **no way to even detect** the error occurred.

**Error detection via parity**: pad each codeword with a **parity bit** chosen so the total number of 1s is even ("even parity") — e.g. "00" for heads, "11" for tails. Now the two valid codewords have Hamming distance 2, so any single-bit error produces an *invalid* codeword ("01" or "10") — detectable, though not yet correctable (you know an error occurred, but not which valid codeword was originally sent).

**Error correction requires distance 3+**: e.g. "000" for heads, "111" for tails — now every single-bit-error pattern reachable from "000" (namely "001","010","100") is *closer* (Hamming distance 1) to "000" than to "111" (distance 2), so a receiver can correctly guess the original codeword even after a 1-bit corruption, by picking whichever valid codeword is nearest.

**General relationship**: if $D$ is the minimum Hamming distance between any two valid codewords, you can **detect** up to $D-1$ bit errors, and **correct** up to $\\lfloor\\frac{D-1}{2}\\rfloor$ bit errors. Real systems use more sophisticated codes than simple repetition for efficiency — **Reed-Solomon** (1960, used in CDs/DVDs/satellite broadcast) constructs a polynomial from the data and transmits an over-sampled plot of it, letting the original be recovered from any large-enough subset of received symbols — particularly effective against *bursts* of consecutive errors (e.g. a scratch on a CD).`,
    pitfall:
      "Detection and correction have DIFFERENT distance requirements from the same D — detecting D-1 errors needs only that valid codewords don't collide, while correcting requires the stronger guarantee that every error pattern stays closer to its true origin than to any other valid codeword, which costs roughly twice the redundancy for the same error magnitude.",
    related: ["mit6004-basics-encoding-schemes"],
  },
  {
    id: "mit6004-basics-digital-contracts-and-abstraction",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does 6.004 frame the digital abstraction around 'contracts,' and what specifically does outlawing a range of voltages ('the forbidden zone') buy a real physical system?",
    back: `Real physical systems (voltages, currents, any physical substrate) are inherently continuous and noisy — manufacturing variation, thermal noise, and interference mean you can never *exactly* reproduce a value. A **system** is a structure guaranteed to exhibit specified behavior, **assuming all its components obey their own specified behaviors** — this is achieved via **contracts**: every component has clear obligations, and if every component honors its contract, the composed system's behavior is guaranteed; if a contract is violated, all bets are off.

**Why digital, specifically**: going digital is a deliberate trade — you throw away almost all of a continuous signal's information (an entire analog voltage collapses to just 1 bit), but in exchange, the contract each component has to honor becomes trivially simple: "output only 0s and 1s, and they will be *good* 0s and 1s." This simplicity is what makes reliable composition of enormous numbers of components (billions of transistors) tractable at all.

**The forbidden zone**: rather than defining "0" and "1" as single exact voltages, define a **valid "0" range** and a **valid "1" range**, with an explicit **forbidden zone** of voltages in between that no correctly-operating component's *output* is ever allowed to produce. This directly gives rise to the notion of signal **validity** — the discrete, binary abstraction is not a property of the physical world, but something deliberately *engineered* by refusing to let real components produce "close call" outputs anywhere near the 0/1 boundary, leaving room to absorb noise (related card) without a signal crossing into ambiguous territory.`,
    pitfall:
      "The digital abstraction is a deliberate engineering choice imposed ON a continuous physical world, not a natural property discovered in it — 'the world is not digital, we would simply like to engineer it to behave that way,' which is exactly why real digital circuits still have to actively fight noise, manufacturing variation, and other analog effects to maintain the abstraction.",
    related: ["mit6004-basics-digital-combinational-device", "mit6004-basics-digital-vtc-noise-margins"],
  },
  {
    id: "mit6004-basics-digital-combinational-device",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the formal definition of a combinational device, and the theorem that lets you compose them into arbitrarily large acyclic circuits.",
    back: `A **combinational device** is a circuit element with: one or more digital inputs; one or more digital outputs; a **functional specification** detailing the output value for every possible combination of *valid* input values; and a **timing specification**, consisting at minimum of an upper bound $t_{PD}$ (propagation delay, related card) on the time needed to compute the specified outputs from a set of stable, valid inputs.

**Combinational digital system**: a set of interconnected combinational elements forms a combinational **system** if (1) every individual element is itself combinational, (2) every input is connected to exactly one output (or to a constant supply of 0s/1s), and (3) the circuit contains **no directed cycles**.

**Why this matters — the composition theorem**: given an acyclic circuit meeting these constraints, you can **derive** the whole system's functional and timing specifications purely from the specifications of its individual components — no need to reason about the internal analog details ever again. This is exactly the payoff of the contract-based design philosophy (related card): once each small piece's contract is verified, arbitrarily large systems built by composing them are automatically correct by construction, as long as the acyclicity and single-driver constraints hold. This theorem is what makes the entire rest of the course possible — every subsequent circuit, from a single logic gate up to a full processor, is ultimately just an argument that its sub-pieces individually satisfy this definition.`,
    pitfall:
      "The 'no directed cycles' constraint is not a minor technicality — a feedback loop breaks the composition theorem entirely, since there's no longer a well-defined order in which to derive each component's inputs from already-known values. Feedback is exactly what later distinguishes sequential logic (which deliberately uses controlled feedback for memory) from purely combinational logic.",
    related: ["mit6004-basics-digital-contracts-and-abstraction", "mit6004-basics-cmos-timing-contract"],
  },
  {
    id: "mit6004-basics-digital-noise-sources",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Name three concrete physical sources of noise that threaten the digital abstraction in real integrated circuits.",
    back: `**Power supply noise**: a chip's power distribution network has real resistance, capacitance, and inductance (from wiring layers and chip leads) — voltage droops from IR drop (current × resistance, e.g. ~30mV between gates, up to ~350mV across a whole chip), from $L\\frac{dI}{dt}$ drop when current changes suddenly (mitigated with extra pins and bypass capacitors), and from LC ringing triggered by sudden current "steps."

**Crosstalk**: on an integrated circuit with many overlapping wiring layers, two adjacent wires $A$ and $B$ form an unintended coupling capacitor $C_C$ alongside each wire's own capacitance to ground $C_O$. A voltage swing $\\Delta V_A$ on wire $A$ induces an unwanted $\\Delta V_B = \\frac{C_C}{C_O+C_C}\\Delta V_A$ on the neighboring wire $B$ — with realistic modern values ($\\Delta V_A = 2.5V$, $C_O=20fF$, $C_C=10fF$), this can induce $\\Delta V_B \\approx 0.83V$, a genuinely dangerous swing capable of pushing a valid signal into the forbidden zone.

**Sequential interference** (inter-symbol interference): voltage left over from *earlier* signaling on the same wire — from transmission-line reflections off impedance mismatches, from incomplete charge/discharge in an RC circuit (narrow pulses getting "lost" if the wire doesn't have time to fully transition before the next symbol), or from RLC ringing triggered by voltage steps. The general fix across all these sources: operate more slowly and limit voltage swings/slew rates, trading performance for reliability.

Together, these three sources are exactly why the digital abstraction (related card) needs **noise margins** (related card) — a device's output must land solidly inside the valid zone, with enough cushion that these unavoidable real-world disturbances can't push it into the forbidden zone before the next component reads it.`,
    related: ["mit6004-basics-digital-vtc-noise-margins"],
  },
  {
    id: "mit6004-basics-digital-vtc-noise-margins",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "What does a Voltage Transfer Characteristic (VTC) plot, why must a valid combinational device have gain > 1 and a nonlinear response, and how do noise margins get chosen from a measured VTC?",
    back: `The **Voltage Transfer Characteristic (VTC)** is a plot of $V_{out}$ vs. $V_{in}$ for a device (e.g. an inverter), each point measured once transients have died out — it captures only **static** behavior, saying nothing about speed. The **static discipline** requires the VTC curve avoid the "forbidden" rectangular regions where a *valid* input voltage would produce an *invalid* output voltage.

**Why gain$>1$ and nonlinearity are unavoidable**: a device must **restore marginally valid signals** — accept inputs anywhere in the valid-but-imperfect range and still produce solidly, unambiguously valid outputs (this is precisely what makes a device useful for noise mitigation, related card). Achieving this restoring behavior across the whole valid input range forces the VTC to have a steep (gain-greater-than-1) transition somewhere between the valid "0" and valid "1" input regions — a purely linear (gain-exactly-1) device could never simultaneously map a full range of "marginal" inputs to a *tighter* range of solidly-valid outputs.

**Worked example — choosing noise margins from a measured VTC**: given a device whose VTC passes through points $(0,5), (1,4), (2.5,1), (3,0.5)$ (in volts), first pick $V_{OL}$ low enough that the device can actually *produce* that output level (e.g. $V_{OL}=0.5V$, since that's the lowest output achieved) and $V_{OH}$ correspondingly high (e.g. treat $(0,5)$ as giving $V_{OH}$ near 5V, or more conservatively pick a value the curve reliably reaches). Then choose a **noise margin** $N$ and set $V_{IL} = V_{OL}+N$, $V_{IH}=V_{OH}-N$, such that any input at or below $V_{IL}$ is guaranteed to produce output at or above $V_{OH}$ (and symmetrically for $V_{IH}/V_{OL}$) — reading directly off the measured curve which $N$ (e.g. $N=0.5V$ in the worked slide example) makes both restoring conditions hold simultaneously.`,
    pitfall:
      "A VTC only characterizes STATIC (steady-state) behavior — it tells you nothing about how fast a device switches, which is a completely separate timing specification (tPD/tCD, related card). A device can have a beautiful gain>1, well-margined VTC and still be too slow to be useful in a given circuit.",
    related: ["mit6004-basics-digital-noise-sources", "mit6004-basics-digital-contracts-and-abstraction"],
  },
  {
    id: "mit6004-basics-cmos-mosfet-switch-model",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Describe the MOSFET as a voltage-controlled switch, and explain the physical role of the threshold voltage and 'inversion.'",
    back: `A **MOSFET** (metal-oxide-semiconductor field-effect transistor) is a four-terminal device — **gate**, **source**, **drain**, **bulk** — that behaves as a voltage-controlled switch: current can flow between the source and drain terminals only if the gate voltage is large enough to create a conducting **channel**; otherwise the switch is "off" and source/drain are electrically disconnected.

**Physical mechanism**: the gate sits above a thin insulating oxide layer over a doped silicon substrate (the "bulk"); a sufficiently strong electric field from the gate **inverts** the local substrate — attracting enough opposite-type charge carriers to the surface to form a thin conducting channel of the *opposite* doping type from the surrounding bulk, bridging source and drain. The gate voltage at which this channel first forms is the **threshold voltage** ($V_{TH}$) — below it, no channel exists (switch off); above it, current can flow (switch on).

**Two flavors**: an **NFET** has n-type source/drain diffusions in a p-type substrate (positive threshold voltage — needs a sufficiently *high* gate voltage to turn on); a **PFET** has p-type source/drain in an n-type substrate (negative threshold voltage — needs a sufficiently *low* gate voltage to turn on, i.e. conducts when the gate is *low* relative to its source). Using **both** transistor types together — "complementary" MOS, or CMOS — is the foundational trick the rest of the course's gate designs build on (related card): the bulk terminal is tied to a fixed supply rail (ground for NFETs, $V_{DD}$ for PFETs) specifically to keep the source/drain diffusions electrically insulated from the bulk via a reverse-biased PN junction, a purely engineering detail that keeps the switch model clean.`,
    related: ["mit6004-basics-cmos-design-rules"],
  },
  {
    id: "mit6004-basics-cmos-design-rules",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "State the two CMOS design rules, and explain why following them lets you model transistors as simple on/off switches when deriving the inverter's VTC.",
    back: `**Rule 1**: only use NFETs in **pulldown** circuits (paths from the output node to ground). **Rule 2**: only use PFETs in **pullup** circuits (paths from the output node to $V_{DD}$). Following these two rules lets you treat each transistor as a simple, ideal switch (on = low resistance, off = infinite resistance) — an NFET is "off" when $V_G < V_{TH,NFET}$ and "on" when $V_G > V_{TH,NFET}$; symmetrically for a PFET around its own (negative) threshold.

**CMOS inverter VTC derivation**: build an inverter from one NFET (pulldown) and one PFET (pullup), gates tied together as the input, drains tied together as the output. When $V_{IN}$ is **low**: the NFET is off, the PFET is on — current flows *into* the output node, charging it up until $V_{OUT}$ reaches $V_{DD}$ (no more current flows once the PFET's own drive is exhausted, i.e. $V_{OUT}=V_{OH}=V_{DD}$). When $V_{IN}$ is **high**: symmetric — the PFET is off, the NFET is on, discharging the output down to $V_{OUT}=V_{OL}=\\text{GND}$. When $V_{IN}$ is in the **middle**, *both* transistors are partially on simultaneously — this is exactly the region where the VTC's steep, high-gain transition happens (small changes in $V_{IN}$ produce large changes in $V_{OUT}$, satisfying the gain$>1$ requirement, related card), with the curve looking almost like a step function for well-designed devices. A "perfect" CMOS VTC reaches $V_{OH}=V_{DD}$ and $V_{OL}=\\text{GND}$ exactly, giving maximum possible noise margins — and, crucially, **zero static power dissipation** at either extreme, since one of the two transistors is always fully off (no DC path from $V_{DD}$ to ground exists in steady state).`,
    pitfall:
      "The two design rules are what license treating a MOSFET as an ideal switch for this analysis — the actual current characteristics of a real MOSFET are far more complex (I_DS depends on W/L and the exact gate/drain/source voltages), but as long as the two rules are followed, the SWITCH-LEVEL model (used throughout the rest of the CMOS gate-design content) remains valid for reasoning about logical correctness, even though it abstracts away the analog details that determine actual speed and power.",
    related: ["mit6004-basics-cmos-mosfet-switch-model", "mit6004-basics-cmos-gate-synthesis"],
  },
  {
    id: "mit6004-basics-cmos-gate-synthesis",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the general CMOS gate-design recipe (pulldown network → complementary pullup), and explain why CMOS gates are inherently inverting.",
    back: `**Three-step recipe** for building any CMOS logic gate: **Step 1** — design a pulldown network (NFETs only, per Rule 1) that conducts (pulls the output to 0) exactly when you want the output to be **low** — i.e., figure out which combination of inputs should generate a low output. **Step 2** — "walk the hierarchy," systematically converting the pulldown network into a pullup network: replace every NFET with a PFET, every series sub-network with a parallel one, and every parallel sub-network with a series one. **Step 3** — combine the Step-1 pulldown network with the Step-2 pullup network to form the complete, fully-complementary CMOS gate.

**Series/parallel logic** (why the swap in Step 2 works): two NFETs in **series** conduct only when *both* gate inputs are high ($A \\cdot B$); the PFET equivalent of this sub-network (De Morgan's law made physical) is two PFETs in **parallel**, conducting when $A$ is low **or** $B$ is low ($\\overline{A}+\\overline{B} = \\overline{A\\cdot B}$) — matching the complementary condition needed. Symmetrically, NFETs in **parallel** ($A+B$) correspond to PFETs in **series** ($\\overline{A}\\cdot\\overline{B} = \\overline{A+B}$).

**Worked examples**: a 2-input NAND gate's pulldown is two NFETs in series (conducts, pulling output low, iff $A$ AND $B$ are both high) — giving output $\\overline{A\\cdot B}$. A 2-input NOR gate's pulldown is two NFETs in parallel (conducts iff $A$ OR $B$ is high) — giving output $\\overline{A+B}$. A more complex target function like $\\overline{F} = A\\cdot(B+C)$ (i.e., pull low when $A$ AND ($B$ OR $C$)) needs a pulldown network with $A$ in series with a parallel $B/C$ sub-network, then a pullup network built by the walk-the-hierarchy rule ($A$ in parallel with a series $B/C$ sub-network).

**Why CMOS gates are inherently inverting**: this construction always produces $\\overline{f(\\text{inputs})}$ for whatever function $f$ the pulldown network was designed to satisfy — a rising input transition can only ever cause a *falling* output transition and vice versa, never a same-direction transition. Building a non-inverting function (like plain AND or OR) always requires an *extra* inverter stage tacked onto the corresponding NAND/NOR gate — there's no way to build a "CMOS AND gate" directly from a single complementary pullup/pulldown pair.`,
    code: `# NAND: pulldown = A in series with B (conducts iff A AND B)
# pullup (walk hierarchy) = A in parallel with B (conducts iff NOT-A OR NOT-B)
def cmos_nand(a, b):
    return not (a and b)

# NOR: pulldown = A in parallel with B (conducts iff A OR B)
# pullup = A in series with B
def cmos_nor(a, b):
    return not (a or b)`,
    pitfall:
      "The walk-the-hierarchy transformation (series↔parallel, NFET↔PFET) applies to the NETWORK TOPOLOGY, not to the individual gate's logic function directly — it's easy to try to guess the pullup network's shape from the truth table alone rather than mechanically transforming the already-designed pulldown network's structure, which is both more error-prone and misses the guaranteed-correct-by-construction property the recipe provides.",
    related: ["mit6004-basics-cmos-design-rules"],
  },
  {
    id: "mit6004-basics-cmos-timing-contract",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define propagation delay and contamination delay precisely, and explain what a 'lenient' combinational device additionally guarantees.",
    back: `**Propagation delay ($t_{PD}$)**: an **upper bound** on the delay from valid, stable inputs to valid, stable outputs — the device's promise of how *slow* it might be, at worst. **Contamination delay ($t_{CD}$)**, an optional but often important additional spec: a **lower bound** on the delay from an input change to any possible output change — the device's promise of how *fast* it might react, at best (i.e., a guarantee that the *old* output remains valid for at least this long after an input starts changing). If $t_{CD}$ isn't specified, it's safe to conservatively assume $t_{CD}=0$ (no guarantee the old output persists at all).

**The combinational contract, visualized**: after an input changes, there's a window of time where "no promises" are made about the output (it may be transiently invalid, glitching, etc.) — the output is only guaranteed **valid** again once at least $t_{PD}$ has passed since the *last* input change, and is only guaranteed to have possibly become **invalid** no earlier than $t_{CD}$ after the *first* input change.

**Composing timing specs across an acyclic circuit**: given a chain of gates, the overall circuit's $t_{PD}$ is the **maximum** cumulative propagation delay over all input-to-output paths (the slowest path dominates); the overall $t_{CD}$ is the **minimum** cumulative contamination delay over all paths (the fastest path to potentially glitch dominates) — e.g. for a circuit of NAND gates each with $t_{PD}=4$ns, $t_{CD}=1$ns, a 3-gate-deep path gives circuit $t_{PD}=12$ns, while a 2-gate-deep path gives circuit $t_{CD}=2$ns.

**Lenient combinational devices** — a stronger, more useful guarantee some real gates (including CMOS gates) satisfy: the output is guaranteed valid once **any subset of inputs sufficient to determine the output value** has been valid for $t_{PD}$ — **tolerating** transitions (even invalid voltage levels!) on inputs that are *irrelevant* to the current output. E.g. for a NOR gate already outputting 0 because input $A$ is high, input $B$ can wiggle through invalid voltages freely without affecting the (already-determined) output's validity — a strict (non-lenient) device would conservatively refuse this guarantee, insisting *all* inputs be simultaneously valid.`,
    pitfall:
      "The circuit-level tPD uses the SLOWEST path (maximum) while tCD uses the FASTEST path (minimum) — these are opposite optimization directions across the same set of paths, and mixing them up (e.g. taking the minimum for tPD) would silently understate the circuit's true worst-case delay.",
    related: ["mit6004-basics-digital-combinational-device", "mit6004-basics-cmos-gate-synthesis"],
  },
  {
    id: "mit6004-basics-cmos-power-and-reversible-computing",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State the CMOS dynamic power dissipation formula, and explain Landauer's Principle's claim about the true physical origin of computation's energy cost.",
    back: `**Dynamic power dissipation**: each time a CMOS gate's output node (with load capacitance $C$) charges and then discharges through a full switching cycle, energy $C V_{DD}^2$ is dissipated. Across an entire chip: $\\text{Power} = f \\cdot n \\cdot C \\cdot V_{DD}^2$, where $f$ is the switching frequency and $n$ is the number of gates — explaining why modern high-performance chips (historically dissipating 80–150W at $V_{DD}\\approx 1.2V$, drawing on the order of 100 Amps) face a serious cooling challenge, comparable to keeping a 100W incandescent bulb's filament cool to the touch. With little remaining room to reduce $V_{DD}$ further, and both $n$ (transistor count) and $f$ (clock speed) historically continuing to grow, power dissipation is a first-order design constraint, not an afterthought.

**Does computation itself *require* energy dissipation?** A NAND gate maps 2 input bits to 1 output bit — genuinely **destroying information** (given only the output, you can't recover which of the 3 inputs producing that output actually occurred). **Landauer's Principle** (1961): it is specifically the **discarding of information** that has an unavoidable thermodynamic energy cost (related to entropy) — not computation itself. **Bennett** (1973) showed the converse: build gates from **reversible** (information-*preserving*) logic instead of NAND, and there is **no** fundamental lower bound on energy use for computation. Example: the **Feynman gate** maps 2 input bits to 2 output bits in a way that's fully invertible (given the outputs, the exact inputs can always be recovered) — no information is thrown away, so Landauer's argument simply doesn't apply to it.

**Status**: this remains largely a theoretical frontier rather than mainstream engineering practice — reversible-logic computing connects directly to modern research in quantum computing (where unitary, and hence reversible, operations are the norm — see the mit6045 course's quantum computing module) — but it establishes an important conceptual point: energy dissipation in ordinary computers is a consequence of a specific *design choice* (irreversible gates like NAND) rather than a truly unavoidable law of computation itself.`,
    pitfall:
      "Landauer's Principle is about discarding information specifically, not about switching transistors or moving charge in general — a reversible gate can in principle switch just as much charge as an irreversible one while dissipating far less energy, because the thermodynamic cost Landauer identified attaches to erasing bits, not to voltage transitions per se.",
    related: ["mit6004-basics-cmos-gate-synthesis", "mit6045-learning-quantum-unitary-transformations"],
  },
];
