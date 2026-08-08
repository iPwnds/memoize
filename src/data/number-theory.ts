import type { Card } from "./types";

const MODULE = "number-theory";

export const numberTheoryCards: Card[] = [
  // -------------------------------------------------------------- GCD/LCM
  {
    id: "number-theory-gcd-lcm",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What are GCD and LCM, and how are they related?",
    back: `**GCD** (greatest common divisor) of $a$ and $b$: the largest integer that divides both evenly. **LCM** (least common multiple): the smallest positive integer divisible by both.

They're linked by a clean identity: $\\gcd(a,b) \\times \\text{lcm}(a,b) = a \\times b$ — so once you have an efficient GCD algorithm (the Euclidean algorithm, see that card), LCM is free: $\\text{lcm}(a,b) = \\frac{a \\times b}{\\gcd(a,b)}$.

Real uses: reducing fractions to lowest terms (divide numerator and denominator by their GCD), scheduling problems (finding when repeating events next align — LCM of their periods), and as a building block for modular arithmetic and cryptography (RSA key generation relies on GCD computations, via the extended Euclidean algorithm — see that card).`,
    code: `def lcm(a, b):
    return a * b // gcd(a, b)`,
    pitfall:
      "Computing LCM as a*b // gcd(a,b) can overflow in fixed-width-integer languages for large a, b even when the final LCM itself would fit — dividing by gcd(a,b) first (i.e., (a // gcd(a,b)) * b) avoids the intermediate overflow. Not a concern in Python's arbitrary-precision integers, but essential in C/Java/etc.",
    related: ["number-theory-euclidean-algorithm"],
  },
  {
    id: "number-theory-euclidean-algorithm",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does the Euclidean algorithm compute GCD in O(log(min(a,b)))?",
    back: `Based on the identity $\\gcd(a, b) = \\gcd(b, a \\bmod b)$ — the GCD of two numbers doesn't change if you replace the larger one with its remainder when divided by the smaller. Repeatedly apply this (swap and take remainder) until one value reaches 0; the other is the GCD.

Why it's fast: each step at least **halves** the larger of the two numbers within two iterations (a provable bound — the worst case for slow shrinking is consecutive Fibonacci numbers, which is exactly why the Euclidean algorithm's worst-case input is related to the Fibonacci sequence and why its complexity is stated in terms of $\\log$, tied to Fibonacci's own growth rate). This gives $O(\\log(\\min(a,b)))$ iterations — remarkably fast even for enormous numbers (cryptographic key sizes, hundreds of digits), which is exactly why it's the practical backbone of number-theoretic algorithms in real cryptographic libraries.`,
    code: `def gcd(a, b):
    while b:
        a, b = b, a % b
    return a`,
    complexity: {
      structure: "Euclidean Algorithm",
      operations: [{ op: "gcd(a, b)", time: "O(log(min(a,b)))" }],
    },
    related: ["number-theory-extended-euclidean", "number-theory-gcd-lcm"],
  },
  {
    id: "number-theory-extended-euclidean",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What does the extended Euclidean algorithm compute, and why does that matter for modular inverses?",
    back: `Alongside $\\gcd(a,b)$, the extended Euclidean algorithm also finds integers $x, y$ (Bézout coefficients) satisfying **Bézout's identity**:
$$ax + by = \\gcd(a, b)$$
It's computed by unwinding the ordinary Euclidean algorithm's recursion — at each step, express the current remainder's coefficients in terms of the previous step's coefficients, back-substituting all the way to the base case.

**Why this matters**: if $\\gcd(a, m) = 1$ (a and m are coprime), Bézout's identity becomes $ax + my = 1$, which — reduced modulo $m$ — gives $ax \\equiv 1 \\pmod m$. That's **exactly the definition of a modular inverse**: $x$ is $a$'s multiplicative inverse mod $m$ (see that card). The extended Euclidean algorithm is therefore the general-purpose way to compute a modular inverse whenever the modulus isn't necessarily prime (unlike the Fermat's-little-theorem shortcut, which requires a prime modulus).`,
    code: `def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0        # gcd, x, y such that a*x + b*y = gcd
    g, x1, y1 = extended_gcd(b, a % b)
    x, y = y1, x1 - (a // b) * y1
    return g, x, y`,
    complexity: {
      structure: "Extended Euclidean Algorithm",
      operations: [{ op: "Compute gcd(a,b) and Bézout coefficients", time: "O(log(min(a,b)))" }],
    },
    related: ["number-theory-euclidean-algorithm", "number-theory-modular-inverse"],
  },

  // ------------------------------------------------------ Modular exponentiation
  {
    id: "number-theory-modular-exponentiation",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does fast (binary) modular exponentiation compute a^b mod m in O(log b)?",
    back: `Naively computing $a^b$ by multiplying $a$ by itself $b$ times is $O(b)$ — infeasible for the huge exponents cryptography uses (hundreds of digits). **Binary exponentiation** exploits the binary representation of $b$: write $b$ in binary, and note $a^b = a^{b_0} \\cdot (a^2)^{b_1} \\cdot (a^4)^{b_2} \\cdots$ where $b_i$ is the $i$-th bit of $b$ — i.e., **repeatedly square** the base (giving $a, a^2, a^4, a^8, \\ldots$) and **multiply into the result** only when the corresponding bit of $b$ is set.

This needs only $O(\\log b)$ multiplications instead of $O(b)$. Taking the result **mod $m$ after every multiplication** (not just at the end) keeps every intermediate value bounded by $m^2$ at most, which is what makes this practical for huge exponents — without the running mod, intermediate values would grow astronomically large.`,
    code: `def mod_pow(a, b, m):
    result = 1
    a %= m
    while b > 0:
        if b & 1:              # current bit is set
            result = (result * a) % m
        a = (a * a) % m         # square the base
        b >>= 1
    return result`,
    complexity: {
      structure: "Modular Exponentiation",
      operations: [{ op: "a^b mod m", time: "O(log b)" }],
    },
    pitfall:
      "Forgetting to take the mod after EVERY multiplication (not just at the end) defeats the entire purpose — the intermediate un-reduced values would grow exponentially large, exactly the blowup this technique exists to avoid.",
    related: ["number-theory-modular-inverse"],
  },
  {
    id: "number-theory-modular-inverse",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What is a modular inverse, and what are the two standard ways to compute it?",
    back: `The modular inverse of $a$ modulo $m$ is a value $x$ such that $a \\cdot x \\equiv 1 \\pmod m$ — the modular-arithmetic analogue of "$1/a$," letting you effectively "divide by $a$" under modular arithmetic (which has no native division operator) by multiplying by $x$ instead. It exists **if and only if** $\\gcd(a, m) = 1$ (a and m are coprime).

Two computation methods:
1. **Extended Euclidean algorithm** (general — works for any coprime $a, m$): Bézout's identity $ax + my = 1$ directly gives $x$ as the inverse (mod $m$), as derived in that card.
2. **Fermat's little theorem shortcut** (only when $m$ is **prime**): Fermat's little theorem states $a^{m-1} \\equiv 1 \\pmod m$ for prime $m$ and $a$ not divisible by $m$ — rearranging, $a^{m-2} \\cdot a \\equiv 1 \\pmod m$, so $a^{m-2} \\bmod m$ **is** the inverse. This reduces the problem directly to modular exponentiation (see that card), often more convenient in competitive programming when the modulus is a known prime (a very common setup, e.g. $10^9+7$).

Both run in $O(\\log m)$; the choice is purely about whether the modulus is guaranteed prime.`,
    code: `def mod_inverse_fermat(a, p):  # p must be prime
    return mod_pow(a, p - 2, p)

def mod_inverse_extended_euclidean(a, m):
    g, x, _ = extended_gcd(a, m)
    if g != 1:
        raise ValueError("inverse does not exist (a and m not coprime)")
    return x % m`,
    pitfall:
      "Using Fermat's shortcut when the modulus is NOT prime silently gives a wrong answer — Fermat's little theorem's premise requires primality; always confirm the modulus is prime before reaching for a^(m-2) instead of extended Euclidean.",
    related: ["number-theory-extended-euclidean", "number-theory-modular-exponentiation"],
  },

  // -------------------------------------------------------------- Sieve
  {
    id: "number-theory-sieve-of-eratosthenes",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does the Sieve of Eratosthenes find all primes up to n in O(n log log n)?",
    back: `Start with a boolean array marking every number from 2 to $n$ as "potentially prime." For each number $p$ starting from 2, if it's still marked prime, **mark every multiple of $p$** (starting from $p^2$ — smaller multiples were already marked by smaller primes) as **not** prime. After processing all $p$ up to $\\sqrt{n}$ (any composite number $> \\sqrt{n}$ must have a factor $\\leq \\sqrt{n}$, so it's already been marked by then), everything still marked prime genuinely is.

Why $O(n \\log \\log n)$, not $O(n \\log n)$ or worse: the total work is $\\sum_{p \\leq n, \\text{prime}} n/p$ (marking multiples of each prime), and the sum of reciprocals of primes up to $n$ grows like $\\ln \\ln n$ (a nontrivial number-theoretic fact, not something to re-derive, just to know) — giving the surprisingly slow-growing $n \\ln \\ln n$ total, making the sieve extremely fast in practice even for $n$ in the tens of millions.`,
    code: `def sieve_of_eratosthenes(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for p in range(2, int(n**0.5) + 1):
        if is_prime[p]:
            for multiple in range(p * p, n + 1, p):
                is_prime[multiple] = False
    return [i for i in range(n + 1) if is_prime[i]]`,
    complexity: {
      structure: "Sieve of Eratosthenes",
      operations: [{ op: "Find all primes up to n", time: "O(n log log n)", space: "O(n)" }],
    },
    pitfall:
      "Starting the inner marking loop at p*2 instead of p*p works correctly but wastes time re-marking multiples already caught by smaller primes (e.g. marking 6 as a multiple of both 2 and 3) — starting at p*p is the standard optimization, valid because any smaller multiple of p already has a smaller prime factor that caught it earlier.",
    related: ["number-theory-miller-rabin"],
  },

  // ---------------------------------------------------------- Miller-Rabin
  {
    id: "number-theory-miller-rabin",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does Miller-Rabin probabilistically test primality, and why is it practical for huge numbers?",
    back: `The Sieve of Eratosthenes finds all primes up to $n$, but is useless for testing whether a **single, enormous** number (hundreds of digits, as used in cryptography) is prime — sieving up to it would take far too long. Miller-Rabin instead directly tests one candidate number $n$ using **repeated modular exponentiation** (see that card), in a **Monte Carlo** algorithm (Tier 1, Recursion & D&C module) — fast, fixed running time, small tunable chance of a wrong answer.

Core idea: write $n - 1 = 2^r \\cdot d$ ($d$ odd). Pick a random "witness" $a$, and compute $a^d \\bmod n$, then repeatedly square it up to $r-1$ times, checking a specific pattern that **every prime number must satisfy** (a generalization of Fermat's little theorem, strengthened to catch a class of numbers — Carmichael numbers — that fool the plain Fermat test). If the pattern fails for witness $a$, $n$ is **definitely composite**. If it passes, $n$ is only "**probably prime**" — a small fraction of composite numbers ("strong liars") pass for any *specific* witness.

Running the test with **multiple independent random witnesses** drives the false-positive probability down **exponentially** — each additional witness reduces the error probability by roughly $1/4$, so ~20 witnesses gives an error probability below $10^{-12}$, overwhelmingly reliable in practice despite being theoretically "probabilistic," which is why Miller-Rabin (not a deterministic test) is the practical standard for cryptographic-scale primality testing.`,
    complexity: {
      structure: "Miller-Rabin Primality Test",
      operations: [{ op: "Test one candidate (k witnesses)", time: "O(k log³ n)", note: "modular exponentiation cost per witness" }],
    },
    pitfall:
      "Miller-Rabin with a fixed small set of witnesses can be deterministic and exact for numbers below certain known bounds (a well-studied technique for cryptographic-library correctness), but for arbitrary/unbounded n it remains genuinely probabilistic — don't treat 'passed Miller-Rabin' as an ironclad proof of primality without knowing which regime you're in.",
    related: ["number-theory-modular-exponentiation", "number-theory-sieve-of-eratosthenes", "recursion-dc-las-vegas-vs-monte-carlo"],
  },
];
