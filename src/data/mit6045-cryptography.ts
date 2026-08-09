// MIT 6.045J / 18.400J (Spring 2011) — Lectures 11, 13, 14, 18: classical
// cryptography and Shannon's theorem, pseudorandom generators and one-way
// functions, public-key cryptography (Diffie-Hellman, RSA), and trapdoor
// one-way functions / zero-knowledge proofs. Genuinely new territory versus
// the generic curriculum, which has no cryptography module — the mechanics
// of modular exponentiation and modular inverses are assumed from the
// existing number-theory module and not re-derived here; these cards focus
// on the protocol-level ideas (why the constructions work, what security
// they achieve, what assumptions they rest on). See src/data/courses.ts for
// the full lecture map, including the intentional Lecture 12/15-17 gap.
import type { Card } from "./types";

const MODULE = "mit6045-crypto";

export const mit6045CryptographyCards: Card[] = [
  {
    id: "mit6045-crypto-classical-ciphers-and-weaknesses",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why are the Caesar cipher and general substitution ciphers both breakable, despite substitution having a vastly larger key space?",
    back: `The **Caesar cipher** shifts every letter by a fixed amount (traditionally 3: A→D, ..., wrapping Z→C), so ciphertext = plaintext + 3 (mod 26) letter-by-letter. It has only 26 possible keys — trivially breakable by trying all of them by hand (this is why a Sicilian mafia boss was eventually caught decades into using it operationally: the cipher itself was never the weak link, using it at all was).

The **substitution cipher** generalizes this to an arbitrary permutation of the alphabet ($26!$ possible keys, astronomically more than 26) — yet it's *still* easily broken, just not by brute force: **frequency analysis**. Natural-language letter frequencies are highly non-uniform (E and T are common, Q and Z are rare), and a substitution cipher preserves this statistical fingerprint — the most frequent ciphertext symbol is very likely standing in for E, and so on. Key-space size alone doesn't guarantee security; what matters is whether the ciphertext leaks *any* exploitable structure about the plaintext, and a fixed, deterministic permutation of a highly non-uniform underlying distribution always does.

This motivates the real question the rest of the module answers: what would it take for ciphertext to reveal **nothing** exploitable at all?`,
    related: ["mit6045-crypto-one-time-pad"],
  },
  {
    id: "mit6045-crypto-one-time-pad",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "How does the one-time pad achieve provable, unconditional security, and what's the mechanism (both intuitively and formally)?",
    back: `The **one-time pad** (Vernam, 1920s) represents the plaintext as a binary string $M$ and XORs it with a truly random key $K$ of the **same length**: $C = M \\oplus K$. Decryption XORs again: $C \\oplus K = M \\oplus K \\oplus K = M$ (since $x \\oplus x = 0$ for any bit string $x$).

**Why it's provably unbreakable**: to an eavesdropper without $K$, $C$ is indistinguishable from a uniformly random string — for *every* possible plaintext $M'$, there exists some key $K' = C \\oplus M'$ that would have produced the observed ciphertext $C$ from $M'$. Since $K$ was chosen uniformly at random and independently of $M$, every candidate plaintext of the right length is equally consistent with the observed $C$; the ciphertext carries **zero** information narrowing down which plaintext was sent — not "hard to figure out," but information-theoretically impossible, even for an adversary with unlimited computation time.

This is qualitatively different from every classical cipher (which leak statistical structure) and sets the bar the rest of the course chases: real cryptography wants OTP's absolute guarantee, but OTP's own severe limitation — a key exactly as long as every message, usable only once — makes it impractical at scale. The rest of the module is essentially the story of relaxing "unconditional" security to "secure against any polynomial-time adversary" in exchange for keys far smaller than the messages they protect.`,
    code: `M = 0b1110101100 01  # plaintext
K = 0b0110111010 11  # random key, same length
C = M ^ K            # ciphertext, looks uniformly random without K
assert (C ^ K) == M  # decryption recovers M exactly`,
    related: ["mit6045-crypto-classical-ciphers-and-weaknesses", "mit6045-crypto-shannons-theorem", "mit6045-crypto-key-reuse-vulnerability"],
  },
  {
    id: "mit6045-crypto-shannons-theorem",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State Shannon's theorem on perfect secrecy, sketch its proof, and identify exactly which assumption a computationally-secure cryptosystem relaxes to escape it.",
    back: `**Shannon's Theorem** (1940s): any *perfectly secure* cryptosystem requires a key at least as long as the message. Formally, for an encryption function $e_k: \\{0,1\\}^n_{plaintext} \\to \\{0,1\\}^m_{ciphertext}$: for every key $k$, $e_k$ must be **injective** (distinct plaintexts must map to distinct ciphertexts under the same key, or decryption would be ambiguous). Fix a ciphertext $C$ produced with an $r$-bit key — the number of *distinct* plaintexts that could possibly have produced $C$ (as the key ranges over all $2^r$ possibilities) is at most $2^r$. If $r < n$ (key shorter than message), $2^r < 2^n$, so **some** plaintexts of length $n$ are provably impossible to have produced $C$ under *any* key. An adversary with unlimited computation time can identify this excluded set by brute-force search over all $2^r$ keys — learning real information about the message (it's provably not one of the excluded strings), even without learning the exact plaintext. This breaks the OTP-style guarantee that every plaintext remains equally consistent with the observed ciphertext.

**The loophole Shannon's proof relies on**: "**unlimited computational power**." The proof only goes through because the adversary can afford to actually try all $2^r$ keys. If instead the adversary is restricted to **polynomial-time** computation, the same short-key system might still be secure in practice — the adversary is *information-theoretically* able to narrow things down (the excluded plaintexts genuinely exist), but *computationally unable* to find them in any feasible amount of time.

This is exactly the conceptual pivot the rest of the module makes: trade Shannon's absolute, unconditional security guarantee for a *computational* security guarantee (secure against any polynomial-time-bounded adversary), in exchange for keys dramatically shorter than the messages they protect — which is what pseudorandom generators are built to enable (see related card).`,
    pitfall:
      "Shannon's theorem doesn't say short-key cryptosystems are insecure in any practical sense — it says they can't be *perfectly* (information-theoretically) secure. A short-key system can still be entirely adequate against realistic, computationally-bounded adversaries, which is the whole premise the rest of modern cryptography operates on.",
    related: ["mit6045-crypto-one-time-pad", "mit6045-crypto-pseudorandom-generators"],
  },
  {
    id: "mit6045-crypto-key-reuse-vulnerability",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Concretely, why does reusing a one-time-pad key across two messages break the whole system, and how was this exploited historically?",
    back: `If the same key $K$ encrypts two different messages, $C_1 = M_1 \\oplus K$ and $C_2 = M_2 \\oplus K$, an eavesdropper who intercepts both ciphertexts (without knowing $K$) can still compute:
$$C_1 \\oplus C_2 = (M_1 \\oplus K) \\oplus (M_2 \\oplus K) = M_1 \\oplus M_2$$
The $K$ terms cancel — the eavesdropper recovers the XOR of the two *plaintexts* directly, with zero knowledge of $K$ itself. This isn't yet either plaintext individually, but it's a severe leak: if the eavesdropper has *any* partial knowledge or guess about either message's structure (a known header, a predictable word, a run of blank/zero bytes), that structure "shows through" in $M_1 \\oplus M_2$ and can be used to peel back both messages. E.g. if $M_1$ has a stretch of all-zero bits at some position (a plain background in a bitmap, say), that stretch of $M_1 \\oplus M_2$ directly reveals $M_2$'s bits at the same position.

**Historical instance**: during the Cold War, Soviet intelligence used one-time pads for covert communications but occasionally — under wartime pressure to generate enough key material — reused pads. The NSA's VENONA project systematically exploited exactly this key-reuse weakness to partially decrypt intercepted traffic, eventually gathering enough information to help identify and prosecute Julius and Ethel Rosenberg.

The practical upshot: the "one-time" in one-time pad is not a suggestion — it's the entire basis of the security proof (see related Shannon's-theorem card), and violating it converts a provably unbreakable system into one leaking real, exploitable structure.`,
    pitfall:
      "The leaked quantity is M1 ⊕ M2, not either plaintext directly — an eavesdropper needs some additional structural assumption about at least one message (known plaintext, predictable patterns, redundancy) to turn this into full recovery. But in practice, real messages almost always have enough exploitable structure that this bar is easy to clear.",
    related: ["mit6045-crypto-one-time-pad"],
  },
  {
    id: "mit6045-crypto-pseudorandom-generators",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a cryptographic pseudorandom generator (CPRG), formally, and why does 'negligible advantage' — rather than zero advantage — define security?",
    back: `A **pseudorandom generator (PRG)** takes a short, *truly* random seed and stretches it into a longer, seemingly-random output. Naive expansion methods (e.g. a linear-congruential generator $x_{i+1} = ax_i + b \\bmod N$, standard in most programming languages) are **not** cryptographically secure — an adversary can recover the generator's internal state by solving a small system of equations mod $N$ from a handful of outputs, since the recurrence is simple algebra, not designed to resist an adversarial analyst.

A **cryptographic PRG (CPRG)**, formally (Yao, 1982): a function $f: \\{0,1\\}^n \\to \\{0,1\\}^{n+1}$ such that (1) $f$ is computable in polynomial time, and (2) for **all** polynomial-time algorithms $A$ (adversaries), the **advantage**
$$\\left| \\Pr_{y \\in \\{0,1\\}^{n+1}}[A(y) \\text{ accepts}] - \\Pr_{x \\in \\{0,1\\}^n}[A(f(x)) \\text{ accepts}] \\right|$$
is **negligible** — meaning smaller than $\\frac{1}{p(n)}$ for *every* polynomial $p$ (ideally, decreasing exponentially in $n$). In other words: no polynomial-time algorithm can reliably tell $f$'s output apart from a genuinely random string of the same length.

**Why negligible, not zero, and why exactly this threshold matters**: requiring zero advantage would be equivalent to requiring the output be *actually* uniformly random, which is provably impossible for any polynomial-time-computable stretching function (there are only $2^n$ possible seeds but $2^{n+1}$ possible outputs, so the map can't be onto — a real random $(n{+}1)$-bit string is exponentially unlikely to ever be produced by $f$ at all). "Negligible" is chosen specifically because a $\\frac{1}{p(n)}$ advantage, if it existed, could itself be **amplified** by a polynomial-time adversary into a large, exploitable, near-certain distinguishing advantage (the same amplification-by-repetition idea as the BPP/RP amplification lemmas) — so "negligible" is the precise threshold below which amplification-based attacks provably can't work.`,
    pitfall:
      "A linear-congruential generator is a perfectly good source of 'randomness' for simulations or games, but it is not remotely a CPRG — the cryptographic definition demands resistance to any polynomial-time adversary specifically trying to find structure, not just adequate statistical behavior for non-adversarial uses.",
    related: ["mit6045-crypto-prg-stretching", "mit6045-crypto-one-way-functions"],
  },
  {
    id: "mit6045-crypto-prg-stretching",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Given a CPRG that stretches n bits to n+1 bits, how does the 'feed and repeat' construction stretch it to any polynomial length p(n), and what's the proof strategy (without executing it in full)?",
    back: `Given base CPRG $f: \\{0,1\\}^n \\to \\{0,1\\}^{n+1}$, construct $g: \\{0,1\\}^n \\to \\{0,1\\}^{p(n)}$ for any polynomial $p$: repeatedly **break off one bit** of $f$'s output as a genuine output bit, and **feed the remaining $n$ bits back into $f$** to generate another $(n{+}1)$-bit block. Iterating this roughly $p(n)$ times produces $p(n)$ pseudorandom-looking output bits from the original single $n$-bit seed — each round consumes the previous round's leftover $n$ bits as its new "seed."

**Proof strategy** (sketched, not carried out in full — described as "somewhat tricky" even in the source lecture): to show $g$'s $p(n)$-bit output is indistinguishable from truly random, argue by **contradiction via a hybrid/reduction argument** — if some polynomial-time adversary could distinguish $g$'s output from random, that same distinguishing power could be turned into a distinguisher for the *original* $(n{+}1)$-bit output of the base $f$ against random, by focusing on just one round of the iteration and treating everything "outside" that round as if it were already indistinguishable from random (an inductive/hybrid step across the $p(n)$ rounds). That would contradict the assumption that $f$ itself is already a secure CPRG.

The practical significance: it means a single, fixed CPRG design that only needs to stretch by 1 bit is already enough machinery to build a PRG of **arbitrary polynomial expansion** — you never need a fundamentally different generator for longer outputs, just more iterations of the same one.`,
    related: ["mit6045-crypto-pseudorandom-generators", "mit6045-crypto-enhanced-one-time-pad"],
  },
  {
    id: "mit6045-crypto-enhanced-one-time-pad",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does a CPRG let you build a one-time-pad-style cipher with a key polynomially shorter than the message, and what's the proof idea that no poly-time adversary can recover the plaintext?",
    back: `Given a CPRG $f: \\{0,1\\}^n \\to \\{0,1\\}^{p(n)}$ (stretched to arbitrary polynomial length via the feed-and-repeat construction), build an **enhanced one-time pad**: sample a short truly-random seed $s \\in \\{0,1\\}^n$, compute $k = f(s)$ (now $p(n)$ pseudorandom-looking bits), and encrypt/decrypt exactly as ordinary OTP: $e = x \\oplus k$, recover $x = e \\oplus k$. The key transmitted/stored is just the short seed $s$ (length $n$), while the effective one-time pad $k$ can be as long as $p(n)$ — polynomially longer than the actual shared secret.

**Claim**: no polynomial-time adversary can recover the plaintext from the ciphertext. **Proof idea** (by contradiction, simplified to a single repeated-bit plaintext for clarity): suppose a poly-time adversary could guess the plaintext from the ciphertext with probability *non-negligibly* greater than $\\frac{1}{2}$. If $k$ were **truly** random (real OTP), no adversary could do better than a $\\frac{1}{2}$ guess (Shannon's theorem's guarantee, restricted to full-length truly-random keys). So an adversary succeeding with better-than-$\\frac{1}{2}$-by-a-non-negligible-margin probability against the *pseudorandom* $k = f(s)$, but only $\\frac{1}{2}$ against a truly random key, is implicitly **distinguishing** $f(s)$ from a truly random string with non-negligible bias — directly violating the assumption that $f$ is a secure CPRG.

This is the paradigm the whole module builds toward: instead of proving security from first principles each time, reduce a new construction's security to a **contradiction against an already-trusted primitive** (here, the CPRG assumption) — the same reduction-based proof style used throughout complexity theory, now applied to cryptographic guarantees. This construction alone isn't yet a complete, deployable cryptosystem (repeated-key issues across multiple messages still need separate handling), but it demonstrates the core mechanism: computational security from an information-theoretic-looking construction, once the "random" key is replaced with a CPRG's output.`,
    pitfall:
      "This reduction only shows security against recovering the plaintext outright with better-than-guessing probability — a real deployable system needs to additionally handle issues like key reuse across multiple messages (the same key-reuse vulnerability as ordinary OTP still applies to k = f(s) if s is ever reused) and chosen-message attacks, which this simplified construction doesn't address.",
    related: ["mit6045-crypto-prg-stretching", "mit6045-crypto-key-reuse-vulnerability"],
  },
  {
    id: "mit6045-crypto-one-way-functions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define a one-way function formally, and explain why the definition asks for negligible probability of finding SOME preimage with the same output, rather than requiring recovery of the exact original input.",
    back: `A **one-way function (OWF)** is $f: \\{0,1\\}^n \\to \\{0,1\\}^{p(n)}$ such that (1) $f$ is computable in polynomial time, and (2) for all polynomial-time algorithms $A$:
$$\\Pr_{x \\in \\{0,1\\}^n}\\left[f(A(f(x))) = f(x)\\right] \\text{ is negligible.}$$
Informally: easy to compute, hard to invert. Note the condition is $f(A(f(x))) = f(x)$ — asking whether $A$'s guessed preimage produces the **same output** under $f$ — rather than $A(f(x)) = x$ exactly. This is deliberate: $f$ need not be injective, so multiple inputs can map to the same output, and *any* of them is an equally valid "break" of one-wayness (the adversary has still successfully inverted $f$ in the sense that matters — producing something that looks like a valid preimage). Requiring the *exact original* $x$ would also let in degenerate, useless "one-way functions" like the constant function $f(x) = 1$: technically no fixed algorithm can reliably output the *original* $x$ (since $f$ throws away all information about which $x$ produced the output), even though $f(x)=1$ is trivially "invertible" in every sense that matters (any string works as a fake preimage, since $f$ maps everything to the same output). The output-matching definition correctly excludes this: for $f(x) = 1$, any guess $A$ outputs also satisfies $f(A(\\cdot)) = 1 = f(x)$ trivially and with probability 1, so $f(x)=1$ correctly fails to qualify as one-way.

OWFs are the foundational, minimal cryptographic hardness assumption the rest of private-key cryptography rests on (see related equivalence card) — weaker and more general than assuming any single specific hard problem (like factoring), since many unrelated-looking computational processes are plausible OWF candidates.`,
    pitfall:
      "It's tempting to define one-way-ness as 'can't recover the exact input x' — but that definition is satisfied by trivial, useless functions like the constant function, which throw away all information and are invertible in every practically meaningful sense. The output-matching definition (does A's guess reproduce the same f-value?) is what correctly rules those out.",
    related: ["mit6045-crypto-owf-cprg-equivalence"],
  },
  {
    id: "mit6045-crypto-owf-cprg-equivalence",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why does every CPRG give a OWF for free, but why did the converse direction (OWF ⟹ CPRG) take over 20 years to prove?",
    back: `**CPRG $\\Rightarrow$ OWF** (the easy direction): if a CPRG $f$ could be efficiently inverted (some poly-time $A$ recovers a valid seed from $f$'s output with non-negligible probability), that inversion itself would be a distinguisher — a real, truly-random $(n{+}1)$-bit string is the image of *some* $n$-bit seed under $f$ with probability at most $\\frac{1}{2}$ (since $f$ maps $2^n$ seeds into a $2^{n+1}$-size output space, at most half the possible outputs are even reachable), whereas $f$'s actual pseudorandom output is reachable (and hence "invertible" in this sense) with probability 1 by construction. An adversary that inverts well can exploit exactly this gap to distinguish pseudorandom output from real randomness — directly violating the CPRG definition. So every secure CPRG is automatically a OWF.

**OWF $\\Rightarrow$ CPRG** (the hard direction): also true, but the *proof* — due to Håstad, Impagliazzo, Levin, and Luby, 1997 — required a genuinely difficult, multi-step reduction, not a one-line argument like the easy direction. Part of *why* it's hard: the implication is not a triviality to be dismissed, since there provably exist one-way functions that are **not themselves** CPRGs directly (e.g. a OWF's output isn't necessarily even the right length, or might have exploitable non-uniform structure despite still being hard to invert) — so the construction has to actively *transform* an arbitrary OWF into something with the CPRG's much stronger indistinguishable-from-random guarantee, not just repackage it.

**Consequence**: because both directions hold, "does a secure private-key cryptosystem with small keys exist" and "do one-way functions exist" turn out to be **essentially the same question** — OWFs are simultaneously the *minimal* assumption needed (nothing weaker suffices, by the easy direction) and *sufficient* (nothing more is needed, by the hard direction) for the whole private-key cryptography enterprise built in this module.`,
    related: ["mit6045-crypto-one-way-functions", "mit6045-crypto-worst-case-vs-average-case"],
  },
  {
    id: "mit6045-crypto-worst-case-vs-average-case",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Why can't cryptography simply be based on P ≠ NP directly, and what kind of hardness does it need instead?",
    back: `NP-completeness (the machinery of the complexity-theory module) is fundamentally a **worst-case** hardness notion: an NP-complete problem being "hard" means no polynomial-time algorithm solves it correctly on *every* input — but says nothing about how hard *typical* or *random* instances are. Translated into cryptographic terms, "$P \\neq NP$" would only license a guarantee like "**there exists** some message that's hard to decode" — nearly useless as a security guarantee, since an adversary breaking the system on 99.9% of messages while failing on a measure-zero set of pathological ones would still technically be consistent with "some hard instance exists." A cryptosystem needs messages to be hard to decrypt with **overwhelming probability**, across essentially all messages actually sent — **average-case** hardness, not worst-case.

Despite decades of effort, **no known technique relates worst-case hardness (NP-completeness) to average-case hardness** for NP-complete problems in a way useful for cryptography. This is precisely why cryptography needs a **stronger assumption than $P \\neq NP$** — the existence of one-way functions (see related card), which are defined *directly* in average-case terms (negligible success probability over a random input $x$), rather than derived from a worst-case complexity class separation.

This also explains a second, independent obstruction (developed further in the trapdoor-OWF material): many natural cryptographic problems turn out to land in $NP \\cap coNP$ (both a "yes" and a "no" answer have a short verifiable proof), and problems in $NP \\cap coNP$ **can't be NP-complete** under standard reduction techniques unless $NP = coNP$ — an additional structural reason cryptographic hardness doesn't come "for free" just from believing $P \\neq NP$.`,
    pitfall:
      "Believing P ≠ NP is neither necessary nor sufficient for believing secure cryptography exists — it's a different, in some ways orthogonal, hardness question. A world could in principle have P ≠ NP with NP-complete problems hard in the worst case yet easy on average (making cryptography impossible), or the reverse.",
    related: ["mit6045-crypto-one-way-functions", "np-completeness-p-vs-np"],
  },
  {
    id: "mit6045-crypto-yaos-minimax-principle",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "State Yao's Minimax Principle informally, and explain why it justifies restricting adversaries to be deterministic in the CPRG/OWF definitions.",
    back: `The CPRG and OWF definitions both quantify over "all polynomial-time algorithms $A$" without specifying whether $A$ is deterministic or probabilistic — yet the definitions given are stated for *deterministic* $A$. **Yao's Minimax Principle** (the easy direction, stated informally) explains why this loses no generality: **once the probability distribution over inputs is fixed** (as it is here — a uniformly random seed or preimage), there always exists **some fixed, deterministic strategy** that performs at least as well, on average against that fixed distribution, as the *best* randomized strategy.

Intuition via a simpler example: in Rock-Paper-Scissors, if you somehow *knew* your opponent's fixed probability distribution over their three moves in advance, there's always some single deterministic move of yours (not a randomized mixed strategy) that does at least as well against that specific known distribution as any randomization would — because your own randomization only ever averages over choices, and averaging can never beat the best individual response to a fixed distribution you already know.

**Practical consequence for CPRGs and OWFs**: since the adversary's input distribution is fixed by the definition itself (uniform over seeds, or uniform over $x$), it's safe to only quantify over deterministic adversaries when checking security — any *probabilistic* adversary's average success rate is matched by some deterministic one, so a definition secure against all deterministic adversaries is automatically secure against all probabilistic ones too. This is why the formal definitions elsewhere in this module can quietly restrict to deterministic $A$ without weakening the guarantee.`,
    related: ["mit6045-crypto-pseudorandom-generators"],
  },
  {
    id: "mit6045-crypto-public-key-motivation",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is the 'locked box' thought experiment for public-key cryptography, and how does it resolve the apparent chicken-and-egg problem of two parties who've never met?",
    back: `**Setup**: Alice wants to send Bob a package so that no third party can open it in transit, but Alice and Bob have **never met** and share no secret key in advance. If they *did* share a key, the problem is trivial (Alice locks the box with the shared key; Bob unlocks it with his copy). Without a shared key, there's an apparent paradox: Alice can't send the package in an unlocked box (anyone could open it), but she also can't send it pre-locked, since sending the *key* separately (in an unlocked box) defeats the purpose — seemingly infinite regress.

**Resolution — the double-lock protocol**: (1) Alice puts the package in a box, locks it with **her own** lock, and sends it to Bob. (2) Bob, unable to open Alice's lock, adds a **second**, independent lock of his own, and sends the doubly-locked box back to Alice. (3) Alice removes **her** lock (she still has that key) and sends the box — now locked only with Bob's lock — back to Bob. (4) Bob removes his own lock and opens the package. At every step in transit, the box is protected by at least one lock whose key only its owner holds — no step ever exposes the contents.

This is a physical-world proof of concept that public-key-style protocols are conceptually possible at all, motivating the search for a **digital** analogue — the actual subject of Diffie-Hellman and RSA (related cards), which simulate "locking" using number-theoretic operations instead of physical padlocks.`,
    related: ["mit6045-crypto-diffie-hellman", "mit6045-crypto-rsa"],
  },
  {
    id: "mit6045-crypto-diffie-hellman",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through the Diffie-Hellman key exchange protocol and the algebraic identity that lets Alice and Bob land on the same shared secret without ever transmitting it.",
    back: `Alice picks a large prime $p$, a base $g$, and a secret integer $a$; she computes $A = g^a \\bmod p$ and sends $(g, p, A)$ to Bob (all public). Bob picks his own secret $b$, computes $B = g^b \\bmod p$, and sends $B$ back to Alice (also public). Now each side computes the shared secret independently: Alice computes $K = B^a \\bmod p$; Bob computes $K = A^b \\bmod p$.

**Why these agree**: $K_{\\text{Bob's formula}} = A^b \\bmod p = (g^a \\bmod p)^b \\bmod p = g^{ab} \\bmod p$, and $K_{\\text{Alice's formula}} = B^a \\bmod p = (g^b \\bmod p)^a \\bmod p = g^{ba} \\bmod p = g^{ab} \\bmod p$ — both sides land on the same value $g^{ab} \\bmod p$, computed via a different exponent order but the same underlying quantity (modular exponentiation, related card, powers this whole computation).

**Security intuition**: an eavesdropper who intercepts $g, p, A, B$ sees only $g^a \\bmod p$ and $g^b \\bmod p$ — recovering $K = g^{ab} \\bmod p$ from these (without knowing $a$ or $b$ individually) is the **Diffie-Hellman problem**, believed hard for large $p$, closely related to the presumed hardness of the **discrete logarithm problem** (recovering $a$ from $g^a \\bmod p$ alone). Neither $a$ nor $b$ is ever transmitted — only $g$, $p$, and the two exponentiated values — yet both parties converge on the identical secret $K$, entirely over a channel an eavesdropper can freely observe.

This is a genuine key-*exchange* protocol (both parties jointly generate a fresh shared secret through back-and-forth interaction) rather than the more direct message-encryption pattern of RSA (related card) — historically the first serious public-key proposal (1976), though somewhat cumbersome in requiring two full messages before any actual data can be sent.`,
    related: ["mit6045-crypto-public-key-motivation", "mit6045-crypto-rsa", "number-theory-modular-exponentiation"],
  },
  {
    id: "mit6045-crypto-rsa",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "Walk through RSA's encryption and decryption, and explain how Euler's theorem lets the key-holder recover the original message using only knowledge of the prime factors of N.",
    back: `**Setup**: the recipient (say, Amazon) generates two large primes $p, q$ such that neither $p-1$ nor $q-1$ is divisible by 3, computes $N = pq$, and publishes $N$ (keeping $p, q$ secret). To send a secret message $x$ (e.g. a credit card number) to Amazon, anyone computes $y = x^3 \\bmod N$ and sends $y$ — the exponent 3 and modulus $N$ are both public; only $y$ is transmitted.

**Decryption, using knowledge of $p, q$**: Amazon needs to recover $x$ from $y = x^3 \\bmod N$ — a cube root mod $N$, generally hard *without* knowing the factorization. With $p, q$ in hand, Amazon finds an integer $k$ such that $3k \\equiv 1 \\pmod{(p-1)(q-1)}$ (solvable in polynomial time via the extended Euclidean algorithm — a modular inverse computation, related card — and guaranteed to exist precisely *because* neither $p-1$ nor $q-1$ is divisible by 3). **Euler's theorem** gives $x^{(p-1)(q-1)} \\equiv 1 \\pmod N$ (since $(p-1)(q-1)$ is the order of the multiplicative group mod $N$ — the count of integers from 1 to $N$ coprime to $N$). Since $3k \\equiv 1 \\pmod{(p-1)(q-1)}$, write $3k = c \\cdot (p-1)(q-1) + 1$ for some integer $c$; then:
$$y^k = (x^3)^k = x^{3k} = x^{c(p-1)(q-1)+1} = \\left(x^{(p-1)(q-1)}\\right)^c \\cdot x \\equiv 1^c \\cdot x = x \\pmod N$$
Computing $y^k \\bmod N$ itself is efficient via repeated squaring (related card), so decryption is polynomial-time — but only for someone who knows $p, q$ (needed to compute $k$ in the first place).

**Security**: anyone who could **factor** $N$ into $p \\times q$ could run the identical decryption procedure — so RSA's security rests entirely on the presumed computational intractability of factoring large integers (an assumption that breaks under large-scale quantum computers, via Shor's algorithm, and that any proof of factoring's hardness would also establish $P \\neq NP$). The converse — whether RSA could be broken *without* factoring $N$ — remains a 30-year-old open problem; despite this theoretical uncertainty, RSA has withstood essentially all proposed attacks in practice and underlies most modern electronic commerce.`,
    pitfall:
      "The exponent 3 works only because Amazon specifically chose p, q with neither p-1 nor q-1 divisible by 3 — this is what guarantees an inverse k exists at all; a different fixed public exponent needs the analogous non-divisibility condition. In practice, small fixed exponents like 3 also require careful padding of messages with random data to avoid known small-exponent attacks — the bare x^3 mod N scheme sketched here is the core idea, not a production-ready protocol.",
    related: ["mit6045-crypto-diffie-hellman", "mit6045-crypto-trapdoor-owf", "number-theory-modular-exponentiation", "number-theory-modular-inverse"],
  },
  {
    id: "mit6045-crypto-trapdoor-owf",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What is a trapdoor one-way function, why is RSA's core operation an example, and what makes finding candidate TDOWFs harder than finding ordinary OWFs?",
    back: `A **trapdoor one-way function (TDOWF)** is a one-way function (related card) with one extra property: there's some **secret trapdoor information** that, if known, makes the function efficiently *invertible* — while remaining hard to invert for anyone lacking that trapdoor. RSA's core operation $f(x) = x^3 \\bmod N$ is the canonical example: believed hard to invert in general, yet trivially efficient to invert (via the exponent $k$ derived from $p, q$) for anyone who knows $N$'s prime factorization — the trapdoor is exactly "knowing $p$ and $q$." (A related variant, due to Rabin in 1979: **squaring** $x$ instead of cubing makes inversion provably as hard as factoring itself, a stronger guarantee than RSA's presumed-but-unproven hardness — but squaring is 2-to-1, so decryption becomes ambiguous between multiple valid square roots, which is precisely why this variant never displaced RSA in practice.)

**Why TDOWFs are harder to come by than plain OWFs**: an ordinary OWF just needs to be hard to invert — many "generic," unstructured computational processes that scramble their input plausibly qualify, with no special mathematical structure required. A *trapdoor* OWF additionally needs a deliberately engineered "back door" — some specific mathematical structure that makes inversion easy *given a specific secret*, while remaining hard without it. This is a much more special, delicate property to arrange; only a handful of plausible candidate constructions are known, and essentially all of them are built on some specific rich algebraic structure: RSA-style constructions (modular arithmetic on products of large primes), lattice-based constructions (why: even a quantum computer isn't currently known to break them, unlike modular-arithmetic and elliptic-curve schemes — though at real polynomial-blowup practicality costs), and elliptic-curve cryptography (currently practical, shares RSA's vulnerability to quantum attack but has other structural advantages).`,
    related: ["mit6045-crypto-rsa", "mit6045-crypto-one-way-functions", "mit6045-crypto-impagliazzos-five-worlds"],
  },
  {
    id: "mit6045-crypto-impagliazzos-five-worlds",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Summarize Impagliazzo's Five Worlds framework for the possible relationships between P vs NP and the existence of cryptography, and identify which world is generally believed to be real.",
    back: `A well-known framework (Impagliazzo) organizes the logically possible outcomes of open questions in complexity theory and cryptography into five nested "worlds," from most to least cryptographically hospitable:

1. **Algorithmica**: $P = NP$ (or at least fast probabilistic algorithms solve all of $NP$) — essentially no interesting computational hardness exists at all; cryptography as usually understood is impossible.
2. **Heuristica**: $P \\neq NP$, but NP-complete problems, while hard in the *worst case*, are easy *on average* — worst-case/average-case hardness gap (related card) fully realized against cryptography's favor; still no useful cryptographic hardness.
3. **Pessiland**: NP-complete problems are hard **on average**, but one-way functions still don't exist — average-case-hard problems exist, yet none of them happen to have the specific structure (easy to compute, hard to invert) that cryptography needs; no cryptography, despite genuine average-case hardness being present.
4. **Minicrypt**: one-way functions **do** exist — enabling private-key cryptography, pseudorandom generators, and everything built on OWFs in this module — but no trapdoor OWFs exist, so no **public-key** cryptography (no Diffie-Hellman, no RSA).
5. **Cryptomania**: full public-key cryptography is possible — trapdoor one-way functions exist.

The reigning belief among researchers is that we live in **Cryptomania**, or at minimum **Minicrypt** — consistent with RSA and Diffie-Hellman's decades of practical robustness. But *none* of these five possibilities has been ruled out by a proof; the ordering itself is a hierarchy of increasingly strong (and increasingly plausible-but-unproven) hardness assumptions, each properly containing the next as a special case.`,
    related: ["mit6045-crypto-worst-case-vs-average-case", "mit6045-crypto-trapdoor-owf"],
  },
  {
    id: "mit6045-crypto-zero-knowledge-graph-nonisomorphism",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Using Graph Nonisomorphism as the example, explain what makes an interactive proof 'zero-knowledge' — illustrated by the Coke-vs-Pepsi taste-test analogy.",
    back: `Two graphs $G_1, G_2$ are **isomorphic** if some relabeling of vertices makes them identical. **Graph Isomorphism** is in $NP$ (certificate = the relabeling itself); it's not known to be in $P$, and there's strong evidence it *isn't* NP-complete either (NP-completeness would imply a complexity-theoretic collapse considered unlikely). Whether Graph Isomorphism is in $NP \\cap coNP$ was, at the time, open — meaning it wasn't known whether there's a short, efficiently-checkable proof that two graphs are **not** isomorphic (naively checking all $n!$ relabelings is exponential).

**A surprisingly simple interactive protocol proves non-isomorphism** — analogous to a blind taste test: if you claim Coke and Pepsi taste different but I claim they're the same, you can't easily give me a "proof" via chemical formulas, but you *can* convince me by reliably telling them apart blindfolded, repeatedly. Applied to graphs: an all-powerful **prover** wants to convince a polynomial-time **verifier** that $G_1 \\not\\cong G_2$. The verifier privately picks one of the two graphs at random, randomly permutes its vertices to form $G'$, and sends $G'$ to the prover, asking which original graph $G'$ came from. If $G_1 \\not\\cong G_2$ (genuinely different), the all-powerful prover can *always* answer correctly (a random permutation of $G_1$ never coincidentally becomes isomorphic to $G_2$). If $G_1 \\cong G_2$ (i.e. the prover's claim is false), $G'$ is equally consistent with *either* origin, so even an all-powerful prover can guess correctly with probability at most $\\frac{1}{2}$. Repeating the challenge, say, 100 times drives the verifier's confidence in a false claim's detection to $1 - 2^{-100}$.

**The zero-knowledge property**: even though the verifier becomes convinced, she learns **nothing new** about $G_1, G_2$ beyond the bare fact of non-isomorphism — she could have generated the entire transcript of random permutations herself, without the prover's participation at all, and it would look statistically identical. An interactive proof with this property — where everything the verifier sees, she could have simulated on her own — is called a **zero-knowledge proof system**: the prover convinces without revealing *why* it's true, only *that* it's true.`,
    pitfall:
      "The zero-knowledge guarantee as described here only holds against a verifier who follows the protocol honestly — a dishonest verifier who deviates from the specified challenge distribution could potentially extract more information than an honest one would. Real zero-knowledge proof definitions have to account for this malicious-verifier case explicitly.",
    related: ["mit6045-crypto-3-coloring-zero-knowledge"],
  },
  {
    id: "mit6045-crypto-3-coloring-zero-knowledge",
    tier: 1,
    module: MODULE,
    type: "implementation",
    front: "How does the Goldreich-Micali-Wigderson protocol generalize zero-knowledge proofs to any NP statement, using graph 3-coloring as the universal 'commitment box' mechanism?",
    back: `Graph Nonisomorphism (related card) only demonstrates zero-knowledge for one specific problem. **The general question**: can *any* mathematical proof be converted to zero-knowledge form? Yes — and the conversion can be done in polynomial time, though it needs a cryptographic assumption. The key move: since **THEOREM** (proving a theorem in $\\leq n$ symbols in some formal system) is itself NP-complete, and every NP-complete problem is polynomial-time reducible to every other, it suffices to build a zero-knowledge protocol for **just one** convenient NP-complete problem and reduce everything else to it. **Graph 3-coloring** turns out to be the most convenient choice for this purpose.

**Protocol, assuming "magical boxes"** (openable by the prover, sealed to the verifier, used to commit to a value in advance without being able to change it later): (1) Start from a genuine 3-coloring of the graph; randomly permute the 3 colors (6 possible permutations) — this is a *fresh* random relabeling on every repetition. (2) Write each vertex's (permuted) color on a slip of paper, seal each in its own labeled magic box, and hand all boxes to the verifier. (3) The verifier picks any two **adjacent** vertices and asks the prover to open just those two boxes. (4) Discard everything and repeat the whole protocol as many times as desired.

**Soundness**: if the graph really is 3-colorable, adjacent vertices always show two *different* colors (a valid coloring by definition), so the verifier is never caught detecting a conflict. If the graph is **not** actually 3-colorable, some edge must eventually have same-colored endpoints in any attempted coloring — since there are $O(n^2)$ edges and the boxes commit to a full coloring in advance (so the prover can't adapt which two get revealed), each single round has probability $\\Omega(1/n^2)$ of the verifier's random edge choice landing on a conflict. Repeating $\\sim n^3$ times drives the chance of *never* catching a lie down to exponentially close to 0.

**Zero-knowledge**: because the color permutation is freshly randomized every round and the boxes are re-committed and re-shuffled from scratch each time, the verifier only ever sees **two uniformly random distinct colors** on any given round — learning nothing about the actual underlying 3-coloring, no matter how many rounds are repeated.

**Realizing this without literal magic boxes**: simulate commitment via **encryption** — encrypt each vertex's color (padded with random garbage so equal colors produce unrecognizably different ciphertexts) and send the encrypted messages; when challenged, decrypt and *prove* (via the unique-decryption property that schemes like RSA provide by construction) exactly the two requested colors, without exposing any others.`,
    pitfall:
      "The random color permutation each round is what makes this zero-knowledge, not merely the boxes/encryption — committing to the *same* coloring (same permutation) across multiple rounds would let a verifier who asks about enough different edge pairs across rounds eventually reconstruct the entire coloring, defeating the whole point.",
    related: ["mit6045-crypto-zero-knowledge-graph-nonisomorphism", "mit6045-complexity-clique-is-np-complete"],
  },
];
