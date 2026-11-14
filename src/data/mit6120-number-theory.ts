// MIT 6.1200J (formerly 6.042J) Mathematics for Computer Science, Spring
// 2024 — Unit 3: Number Theory (Lectures 8-10). Sourced from the course's own
// lecture notes, read page-by-page. Lecture 8 covers divisibility, the
// water-jug invariant, gcd and the correctness/termination of Euclid's
// algorithm, and the Pulverizer with Bézout's identity. Lecture 9 covers
// congruence, remainders (and how programming languages disagree on them),
// which substitutions are legal mod n, multiplicative inverses, and Fermat's
// little theorem. Lecture 10 covers why RSA decrypts correctly, what its
// security actually assumes, and the Chinese Remainder Theorem. The
// algorithmic side (Euclid, extended Euclid, modular inverse and
// exponentiation, Miller-Rabin) already lives in Complexity Class, and the
// one-time pad, Diffie-Hellman and RSA mechanics in MIT 6.045J — so this
// module supplies the proofs behind them and cross-links rather than
// repeating. Correction to the notes: they say computing d from (n, e) is as
// hard as factoring only under ERH; in fact that equivalence is unconditional
// (probabilistic: RSA paper/Miller; deterministic: Coron-May 2007) — ERH was
// only needed for Miller's older deterministic reduction. See
// src/data/courses.ts for the full lecture map.
import type { Card } from "./types";

const MODULE = "mit6120-number-theory";

export const mit6120NumberTheoryCards: Card[] = [
  // --- Lecture 8: Divisibility ---
  {
    id: "mit6120-number-theory-divisibility",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "Define 'a divides b' precisely, and list the basic divisibility facts — including the one about integer linear combinations.",
    back: `**Definition**: $a \\mid b$ ("$a$ divides $b$", "$b$ is a multiple of $a$") iff there exists an integer $k$ with $ak = b$.

Examples: $3 \\mid 12$, $-5 \\mid 100$, $n \\mid n$, and — because $0 \\cdot 1 = 0$ — even $0 \\mid 0$. This is *almost* "$b/a$ is an integer", except the definition handles $0/0$ cleanly. "Even" just means "divisible by 2", so **0 is even**.

**Basic facts** (each a one-line proof from the definition):
- **Transitivity**: $a \\mid b$ and $b \\mid c$ ⇒ $a \\mid c$ (if $ax = b$, $by = c$ then $a(xy) = c$).
- $a \\mid b$ ⇒ $a \\mid bc$ for any $c$.
- $a \\mid b$ and $a \\mid c$ ⇒ $a \\mid b + c$ (since $xa + ya = (x+y)a$).
- **Closure under ILCs**: $a \\mid b$ and $a \\mid c$ ⇒ $a \\mid sb + tc$ for all integers $s, t$.

$sb + tc$ with integers $s, t$ is an **integer linear combination** (ILC) of $b$ and $c$. The last fact is the workhorse of the whole unit: anything that divides both $b$ and $c$ divides everything you can build from them by adding and scaling.`,
    pitfall:
      "a | b is a statement (true or false), not a number — don't confuse it with a/b. '3 | 12' is true; '3/12' is 1/4.",
    related: ["mit6120-number-theory-water-jugs", "mit6120-number-theory-euclid-correctness"],
  },
  {
    id: "mit6120-number-theory-water-jugs",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "With jugs of capacities a and b (fill, empty, pour), prove every reachable amount is an integer linear combination of a and b. Why can't 6- and 9-gallon jugs measure 5?",
    back: `Die Hard 3: with a 3- and a 5-gallon jug you *can* get 4 gallons, e.g. $(0,0) \\to (0,5) \\to (3,2) \\to (0,2) \\to (2,0) \\to (2,5) \\to (3,4)$. With 6 and 9, 5 is impossible — and the invariant principle proves it.

**State machine**: state $(x, y)$ = contents of the $a$- and $b$-jug, starting at $(0, 0)$. Transitions: empty one jug ($(0, y)$ or $(x, 0)$); fill one jug ($(a, y)$ or $(x, b)$); pour one into the other until it's empty or the other is full ($(0, x+y)$ or $(x+y-b, b)$, and symmetrically $(x+y, 0)$ or $(a, x+y-a)$).

**Invariant** $P(x, y)$: both $x$ and $y$ are ILCs of $a$ and $b$.

**Proof.** *Initially*: $0 = 0a + 0b$. ✓ *Preserved*: assume $x = sa + tb$ and $y = ua + vb$. Every possible next value lies in $\\{0, x, y, a, b, x + y, x + y - a, x + y - b\\}$, and each is an ILC: e.g. $x + y = (s + u)a + (t + v)b$ and $x + y - a = (s + u - 1)a + (t + v)b$; the rest are similar. By the Invariant Principle, every reachable state satisfies $P$. $\\blacksquare$

**6 and 9**: every reachable amount has the form $6s + 9t$, which is divisible by 3 — so 5 is unreachable.

(Bézout's identity later gives the converse: every multiple of $\\gcd(a, b)$ up to $\\max(a, b)$ is reachable.)`,
    related: ["mit6120-number-theory-divisibility", "mit6120-proofs-invariant-principle", "mit6120-number-theory-pulverizer-bezout"],
  },
  {
    id: "mit6120-number-theory-euclid-correctness",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define gcd via divisibility, prove gcd(a, b) = gcd(b, a rem b), and prove Euclid's algorithm correct and fast.",
    back: `**Definition**: $\\gcd(a, b)$ is the **nonnegative** common divisor $g$ of $a$ and $b$ such that **every** common divisor $d$ of $a$ and $b$ divides $g$. This is usually the largest common divisor, but the divisibility form also covers $\\gcd(0, 0) = 0$. Also $\\gcd(a, 0) = |a|$.

**Lemma**: $\\gcd(a, b) = \\gcd(a, b - a)$. *Proof*: if $d \\mid a$ and $d \\mid b$ then $d \\mid b - a$; conversely if $d \\mid a$ and $d \\mid b - a$ then $d \\mid a + (b - a) = b$. The two pairs have **exactly the same common divisors**, so the same gcd.

**Division theorem**: for $d > 0$ there are unique $q, r$ with $n = qd + r$, $0 \\leq r < d$; write $r = n \\text{ rem } d$.

**Lemma**: $\\gcd(a, b) = \\gcd(a, b \\text{ rem } a)$ — apply the previous lemma $q$ times (a hidden induction): $\\gcd(a, b) = \\gcd(a, b - a) = \\cdots = \\gcd(a, b - qa)$.

**Euclid's algorithm** as a state machine: from $(x, y)$ with $y > 0$, go to $(y,\\ x \\text{ rem } y)$; stop when $y = 0$ and answer $x$.
- **Invariant**: $\\gcd(x, y) = \\gcd(a, b)$ (preserved by the lemma).
- **Partial correctness**: a final state has $y = 0$, so $\\gcd(a, b) = \\gcd(x, 0) = x$.
- **Termination**: $x + y$ strictly decreases. Better: when $y \\leq x$, $x \\text{ rem } y < x/2$, so the **total bit count** of $x$ and $y$ strictly decreases — at most $\\text{bits}(a) + \\text{bits}(b)$ steps. Logarithmic, and no factoring needed (we have no fast factoring algorithm).

Trace: $\\gcd(1001, 777) \\to (777, 224) \\to (224, 105) \\to (105, 14) \\to (14, 7) \\to (7, 0)$, so the gcd is $7$.`,
    pitfall:
      "The naive 'subtract until done' version (gcd(a, b − a)) is correct but can take time linear in the VALUE of the inputs — exponential in their bit length. The rem step is what makes it efficient.",
    related: ["mit6120-number-theory-pulverizer-bezout", "number-theory-euclidean-algorithm", "mit6120-proofs-invariant-principle"],
  },
  {
    id: "mit6120-number-theory-pulverizer-bezout",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State Bézout's identity, explain how the Pulverizer (extended Euclid) proves it via invariants, and derive its two corollaries.",
    back: `**Bézout's identity**: for all integers $a, b$ there exist integers $s, t$ with $\\gcd(a, b) = sa + tb$.

**The Pulverizer** (extended Euclid; the *kuttaka* attributed to Aryabhata, c. 500 CE): run Euclid's algorithm while also tracking how each number is an ILC of $a$ and $b$. State $(x, y, s, t, u, v)$, starting at $(a, b, 1, 0, 0, 1)$; with $q = x \\text{ div } y$, $r = x \\text{ rem } y$, transition to
$$(y,\\ r,\\ u,\\ v,\\ s - qu,\\ t - qv).$$
Three invariants: $\\gcd(x, y) = \\gcd(a, b)$; $x = as + bt$; $y = au + bv$. The third is preserved because $r = x - qy = (as + bt) - q(au + bv) = a(s - qu) + b(t - qv)$; the second then follows (the old $y$ becomes the new $x$). At the final state $y = 0$, so $\\gcd(a, b) = x = as + bt$. $\\blacksquare$

Worked: $a = 1001, b = 777$: $224 = a - b$, $105 = b - 3 \\cdot 224 = -3a + 4b$, $14 = 224 - 2 \\cdot 105 = 7a - 9b$, $7 = 105 - 7 \\cdot 14 = -52a + 67b$. Check: $-52 \\cdot 1001 + 67 \\cdot 777 = 7$. ✓

**Corollary 1**: $n$ is an ILC of $a$ and $b$ **iff** $\\gcd(a, b) \\mid n$. (⇒: $g$ divides every ILC. ⇐: if $n = kg$, then $n = (ks)a + (kt)b$.)

**Corollary 2**: $\\gcd(a, b)$ is the **smallest positive** ILC of $a$ and $b$.`,
    related: ["mit6120-number-theory-euclid-correctness", "mit6120-number-theory-inverse-iff-coprime", "number-theory-extended-euclidean"],
  },

  // --- Lecture 9: Modular arithmetic ---
  {
    id: "mit6120-number-theory-congruence-and-remainders",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Define a ≡ b (mod n) and prove that a ≡ b (mod n) iff a and b leave the same remainder mod n.",
    back: `**Definition**: $a \\equiv_n b$ (also written $a \\equiv b \\pmod n$) iff $n \\mid a - b$. The theme of modular arithmetic: ignore multiples of $n$. Everyday cases: even/odd (mod 2), weekdays (mod 7), last digit (mod 10), clock time (mod 12 or 24).

Mod 5 there are exactly 5 **residue classes**: $[0] = \\{\\ldots, -5, 0, 5, \\ldots\\}$, $[1] = \\{\\ldots, -4, 1, 6, \\ldots\\}$, …, $[4] = \\{\\ldots, -1, 4, 9, \\ldots\\}$. Every $k$ is congruent to its remainder: if $k = nq + r$ then $k - r = nq$, so $k \\equiv_n r$.

**Theorem.** $a \\equiv_n b$ iff $a \\text{ rem } n = b \\text{ rem } n$.

**Proof.** (⇐) If both remainders are $r$, then $a = nq + r$ and $b = nq' + r$, so $a - b = n(q - q')$ and $n \\mid a - b$.
(⇒) Suppose $a - b = nk$. Write $b = qn + r$ with $0 \\leq r \\leq n - 1$, so $r = b \\text{ rem } n$. Then $a = b + nk = (k + q)n + r$. Since $0 \\leq r \\leq n - 1$, the **uniqueness** part of the division theorem says $r$ is also $a \\text{ rem } n$. $\\blacksquare$

So the remainders $0, 1, \\ldots, n - 1$ are representatives of all $n$ classes.

**Notation trap**: "$a \\bmod n$" usually names a **function** (the remainder, always in $[0, n-1]$), while "$a \\equiv b \\pmod n$" is a **relation** (neither side need be in range: $12 \\equiv 17 \\pmod 5$). "$a = b \\bmod n$" is ambiguous between the two — the course writes $\\equiv_n$ to avoid this.`,
    related: ["mit6120-number-theory-remainder-in-programming-languages", "mit6120-number-theory-legal-substitutions"],
  },
  {
    id: "mit6120-number-theory-remainder-in-programming-languages",
    tier: 1,
    module: MODULE,
    type: "compare",
    front: "What is −43 rem 10 mathematically, and why does -43 % 10 give different answers in Python and in C, Java or JavaScript?",
    back: `**Mathematical remainder** (as in the division theorem): $0 \\leq r < n$, always nonnegative. $-43 = (-5) \\cdot 10 + 7$, so $-43 \\text{ rem } 10 = 7$.

| Language | \`-43 % 10\` | Rounding of integer division |
|---|---|---|
| Python, Mathematica | **7** (matches the math) | \`//\` rounds **down** (toward $-\\infty$): \`-43 // 10 == -5\` |
| C, C++, Java, JavaScript | **−3** (sign follows the dividend) | \`/\` truncates **toward zero**: \`-43 / 10 == -4\` |

Both satisfy $n = q \\cdot d + r$; they just choose a different $(q, r)$ pair. Some languages offer both under different names (the nonnegative, math-style one listed first): Lisp \`mod\`/\`rem\`, Haskell \`mod\`/\`rem\`, Fortran \`modulo\`/\`mod\`, CoffeeScript \`%%\`/\`%\`.

**Why it matters in practice**: \`arr[i % n]\` for a circular buffer, hashing with \`hash % buckets\`, or "is this weekday" arithmetic break on negative inputs in C/Java/JS. The portable fix is \`((a % n) + n) % n\`.

In proofs (and in 6.1200), "rem" always means the nonnegative one.`,
    pitfall:
      "Even Python isn't 'the math' for float or negative-divisor cases (e.g. 7 % -3 == -2 in Python). Check the language spec for the operand signs you actually use.",
    related: ["mit6120-number-theory-congruence-and-remainders", "hashing-good-hash-function"],
  },
  {
    id: "mit6120-number-theory-legal-substitutions",
    tier: 1,
    module: MODULE,
    type: "code-trace",
    front: "Which substitutions are legal when computing mod n? Use them to find the last two digits of 11335¹¹¹¹¹ · (6 + 7799⁵⁰⁰⁰).",
    back: `**Theorem**: if $a \\equiv_n b$ then for any $c$: $a + c \\equiv_n b + c$, $a - c \\equiv_n b - c$, $c - a \\equiv_n c - b$, and $ac \\equiv_n bc$ (each because the difference is a multiple of $a - b$). By induction on $k$, also $x \\equiv_n y \\Rightarrow x^k \\equiv_n y^k$ for $k \\geq 1$.

So you may replace any **operand of $+, -, \\times$** and any **base of a power** by something congruent to it — but **never the exponent**: $1 \\equiv_5 6$, yet $2^1 = 2$ while $2^6 = 64 \\equiv_5 4$.

**Worked example** — last two digits means "rem 100". Reduce early and often:
1. Bases: $11335 \\equiv_{100} 35$ and $7799 \\equiv_{100} 99 \\equiv_{100} -1$. So $x \\equiv_{100} 35^{11111}\\,(6 + (-1)^{5000})$.
2. $(-1)^{5000} = 1$ (even exponent — exponents are used exactly, not reduced).
3. Powers of 35 mod 100: $35, 25, 75, 25, 75, \\ldots$ — after the first, even exponents give 25 and odd exponents give 75. $11111$ is odd, so $35^{11111} \\equiv_{100} 75$.
4. $x \\equiv_{100} 75 \\cdot 7 = 525 \\equiv_{100} 25$.

The last two digits are **25**.`,
    pitfall:
      "Reducing an exponent mod n is the classic error. Exponents can only be reduced using a different modulus — e.g. mod p − 1 when working mod a prime p, by Fermat's little theorem.",
    related: ["mit6120-number-theory-fermats-little-theorem", "number-theory-modular-exponentiation"],
  },
  {
    id: "mit6120-number-theory-inverse-iff-coprime",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Why can't you 'divide both sides by 3' in 3x ≡ 3 (mod 6)? Prove that a has a multiplicative inverse mod n iff gcd(a, n) = 1.",
    back: `**Division can fail**: $3 \\cdot 5 = 15 \\equiv_6 3$, so $x = 5$ solves $3x \\equiv_6 3$ — yet $5 \\not\\equiv_6 1$. "Dividing by 3" would need a number $3^{-1}$ with $3 \\cdot 3^{-1} \\equiv_6 1$, and none exists.

**Theorem.** $a$ has an inverse mod $n$ iff $\\gcd(a, n) = 1$.

**Proof** — a chain of equivalences:
$a$ has an inverse mod $n$
⟺ there is $b$ with $ab \\equiv_n 1$
⟺ there are $b, q$ with $ab - 1 = nq$, i.e. $ab - nq = 1$
⟺ 1 is an integer linear combination of $a$ and $n$
⟺ $\\gcd(a, n) = 1$ (by Bézout's corollary: the ILCs are exactly the multiples of the gcd). $\\blacksquare$

The Pulverizer computes the inverse: the $s$ in $sa + tn = 1$ is $a^{-1}$.

**Corollary**: if $p$ is prime and $a \\not\\equiv_p 0$, then $a$ has an inverse mod $p$ — the only divisors of $p$ are 1 and $p$.

**Cancelling with an inverse**: $7$ and $13$ are inverses mod 30 ($91 \\equiv_{30} 1$). From $7x \\equiv_{30} 12$, multiply both sides by 13: $x \\equiv_{30} 156 \\equiv_{30} 6$. (Check: $42 \\equiv_{30} 12$. ✓)`,
    related: ["mit6120-number-theory-pulverizer-bezout", "mit6120-number-theory-fermats-little-theorem", "number-theory-modular-inverse"],
  },
  {
    id: "mit6120-number-theory-fermats-little-theorem",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State and prove Fermat's little theorem.",
    back: `**Theorem.** If $p$ is prime and $a \\not\\equiv_p 0$, then $a^{p-1} \\equiv_p 1$.

**Proof.** Consider $a, 2a, 3a, \\ldots, (p-1)a$. Claim: mod $p$ these are exactly $1, 2, \\ldots, p - 1$, in some order. (Example $p = 7, a = 3$: $3, 6, 9, 12, 15, 18 \\equiv_7 3, 6, 2, 5, 1, 4$.)
- None is $\\equiv_p 0$: $a$ has an inverse mod $p$, so $ia \\equiv_p 0$ would give $i \\equiv_p 0$, but $1 \\leq i \\leq p - 1$.
- No two coincide: $ia \\equiv_p ja$ ⇒ (multiply by $a^{-1}$) $i \\equiv_p j$, impossible for distinct $i, j$ in $1..p-1$.

So we have $p - 1$ distinct nonzero residues — all of them. Multiplying both lists together, the products agree mod $p$:
$$(p - 1)! \\cdot a^{p-1} \\equiv_p (p - 1)!.$$
$\\gcd((p-1)!, p) = 1$ (no factor of $(p-1)!$ is divisible by $p$), so $(p-1)!$ has an inverse mod $p$; cancel it to get $a^{p-1} \\equiv_p 1$. $\\blacksquare$

**Use**: when working mod a prime $p$, exponents may be reduced **mod $p - 1$**: $a^k \\equiv_p a^{k \\text{ rem } (p-1)}$ for $a \\not\\equiv_p 0$. This is the key fact behind RSA's correctness and Fermat-style primality tests.`,
    pitfall:
      "The converse is false: a^(n−1) ≡ 1 (mod n) does not prove n is prime (Carmichael numbers like 561 pass for every coprime a). That's why practical primality testing uses Miller–Rabin.",
    related: ["mit6120-number-theory-inverse-iff-coprime", "mit6120-number-theory-rsa-correctness", "number-theory-miller-rabin"],
  },

  // --- Lecture 10: Cryptography ---
  {
    id: "mit6120-number-theory-rsa-correctness",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "Set up RSA and prove that decryption undoes encryption: (mᵉ)ᵈ ≡ m (mod pq).",
    back: `**Setup**: secret large primes $p, q$; publish $n = pq$. Choose $e$ coprime to $(p-1)(q-1)$, and use the Pulverizer to find $d$, an inverse of $e$ mod $(p-1)(q-1)$. Public key $(n, e)$; secret key $(n, d)$ (keep $p, q, d$ secret).
- Encrypt: $E(m) = m^e \\text{ rem } n$. Decrypt: $D(c) = c^d \\text{ rem } n$ — both fast by repeated squaring.

**Claim**: $m^{ed} \\equiv_n m$.

**Proof** (for $m$ coprime to $pq$ — with primes this large a message essentially never shares a factor with $n$, and the general case can be handled separately). Since $ed \\equiv 1 \\pmod{(p-1)(q-1)}$, write $ed = 1 + t(p-1)(q-1)$ for some integer $t \\geq 0$. Working mod $p$, with Fermat's little theorem:
$$m^{ed} = m \\cdot \\left(m^{p-1}\\right)^{t(q-1)} \\equiv_p m \\cdot 1^{t(q-1)} = m.$$
By the same argument mod $q$, $m^{ed} \\equiv_q m$. So both $p$ and $q$ divide $m^{ed} - m$; since they are distinct primes, $pq \\mid m^{ed} - m$, i.e. $m^{ed} \\equiv_{pq} m$. $\\blacksquare$

(The last step — "mod $p$ and mod $q$ together give mod $pq$" — is exactly the Chinese Remainder Theorem.)`,
    pitfall:
      "This textbook RSA is NOT secure to deploy as-is: without padding it is deterministic and malleable, and many attacks are known. Real systems use vetted libraries.",
    related: ["mit6120-number-theory-fermats-little-theorem", "mit6120-number-theory-rsa-security-assumptions", "mit6120-number-theory-chinese-remainder-theorem", "mit6045-crypto-rsa"],
  },
  {
    id: "mit6120-number-theory-rsa-security-assumptions",
    tier: 1,
    module: MODULE,
    type: "concept",
    front: "What does RSA's security actually rest on, and how do you find the large primes p and q efficiently?",
    back: `**Security is assumed, not proved.** RSA relies on:
- **Factoring being hard**: from $n = pq$ alone, recovering $p, q$ has no known efficient classical algorithm. (Shor's algorithm would do it on a large quantum computer.) Nobody has *proved* factoring is hard — an efficient method might exist, possibly known privately.
- **More than factoring**: recovering the secret key $d$ from $(n, e)$ is provably **equivalent** to factoring $n$ — probabilistically since the original RSA paper (building on Miller), and deterministically since Coron–May (2007); only Miller's older deterministic reduction needed the Extended Riemann Hypothesis. The genuinely open question is whether **decrypting** a message requires $d$ at all. So security also rests on the **RSA assumption**: computing $e$-th roots mod $pq$ is hard.

Why trust it anyway? These assumptions have been attacked by experts for decades, with prizes for incremental progress — far more scrutiny than "security by obscurity" (Caesar) or "security by hubris" (Enigma).

**Finding large primes**:
1. **Primality is easy to test** (Miller–Rabin), even though factoring is hard.
2. **Primes are plentiful** — the Prime Number Theorem: $\\pi(k) \\sim k / \\ln k$. Near $10^{300}$ the density is about $1 / \\ln(10^{300}) \\approx 1/700$.

So: pick random 300-digit numbers and test each; about 700 tries are expected. (Skipping even numbers halves that.)`,
    related: ["mit6120-number-theory-rsa-correctness", "number-theory-miller-rabin", "mit6045-learning-quantum-shors-algorithm", "mit6045-crypto-public-key-motivation"],
  },
  {
    id: "mit6120-number-theory-chinese-remainder-theorem",
    tier: 1,
    module: MODULE,
    type: "proof",
    front: "State the Chinese Remainder Theorem for two coprime moduli and prove existence and uniqueness of the solution.",
    back: `**Example**: $0 \\leq x < 55$, $x \\equiv_5 4$, $x \\equiv_{11} 7$. Candidates $\\equiv_{11} 7$: $7, 18, 29, 40, 51$; only $29 \\equiv_5 4$. So $x = 29$.

**CRT.** If $\\gcd(p, q) = 1$, then for any $a, b$ the system $x \\equiv_p a$, $x \\equiv_q b$ has a solution, unique mod $pq$. Informally: computing mod $pq$ is the same as computing mod $p$ and mod $q$ separately.

**Existence.** Let $q^{-1}$ be an inverse of $q$ mod $p$ and $p^{-1}$ an inverse of $p$ mod $q$ (they exist since $\\gcd(p, q) = 1$). Set $e_p = q^{-1} q$ and $e_q = p^{-1} p$. Then $e_p \\equiv_p 1$, $e_p \\equiv_q 0$, $e_q \\equiv_p 0$, $e_q \\equiv_q 1$ — "basis vectors". Take $x = a e_p + b e_q$: mod $p$ it is $a \\cdot 1 + b \\cdot 0 = a$, and mod $q$ it is $a \\cdot 0 + b \\cdot 1 = b$. ✓

**Uniqueness.** If $x, x'$ both solve the system, let $y = x - x'$; then $p \\mid y$ and $q \\mid y$, say $y = p k_p = q k_q$. By Bézout, $1 = ps + qt$, so
$$k_p = p s k_p + q t k_p = y s + q t k_p = q k_q s + q t k_p = q(k_q s + t k_p).$$
So $q \\mid k_p$, hence $pq \\mid p k_p = y$: $x \\equiv_{pq} x'$. $\\blacksquare$

The construction is also an algorithm (two Pulverizer runs), and the same "work mod each prime, then combine" idea speeds up RSA decryption in practice.`,
    pitfall:
      "Coprimality is essential: x ≡ 0 (mod 4) and x ≡ 1 (mod 6) has no solution (x would be both even and odd), and when solutions do exist for non-coprime moduli they're only unique mod lcm(p, q).",
    related: ["mit6120-number-theory-rsa-correctness", "mit6120-number-theory-pulverizer-bezout", "mit6120-number-theory-inverse-iff-coprime"],
  },
];
