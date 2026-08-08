import type { Card } from "./types";

const MODULE = "computational-geometry";

export const computationalGeometryCards: Card[] = [
  {
    id: "computational-geometry-orientation-primitive",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What is the cross-product orientation test, and why is it the foundational primitive for computational geometry?",
    back: `For three points $O$, $A$, $B$, the 2D cross product of vectors $OA$ and $OB$ is:
$$\\text{cross} = (A.x - O.x)(B.y - O.y) - (A.y - O.y)(B.x - O.x)$$
Its **sign** tells you the turn direction from $O \\to A \\to B$: positive means **counterclockwise** (a "left turn"), negative means **clockwise** (a "right turn"), zero means the three points are **collinear**.

This single $O(1)$ primitive — "which way does this triple of points turn" — is what nearly every algorithm in this module is built from: convex hull construction (deciding whether to keep or discard a point based on turn direction), segment intersection testing (checking whether endpoints straddle each other), and sweep-line event ordering all reduce to repeated orientation tests rather than any trigonometry or floating-point angle computation — which is also why it's numerically preferred: pure integer/rational arithmetic when coordinates are integers, avoiding the precision pitfalls of computing and comparing actual angles.`,
    code: `def orientation(O, A, B):
    cross = (A[0]-O[0])*(B[1]-O[1]) - (A[1]-O[1])*(B[0]-O[0])
    if cross > 0:
        return 1   # counterclockwise
    elif cross < 0:
        return -1  # clockwise
    return 0       # collinear`,
    pitfall:
      "Preferring this integer cross-product test over computing and comparing actual angles (via atan2 or trigonometry) isn't just style — angle computation introduces floating-point error that can flip a comparison's result near-boundary, while the cross product stays exact for integer coordinates.",
    related: ["computational-geometry-graham-scan", "computational-geometry-segment-intersection"],
  },

  // ------------------------------------------------------------- Convex hull
  {
    id: "computational-geometry-convex-hull-problem",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What is the convex hull problem?",
    back: `Given a set of $n$ points in the plane, find the smallest **convex polygon** (a shape where every line segment between two points inside it stays inside it) that contains **all** the points — visually, the shape a rubber band would form if stretched around every point and released.

Real uses: collision detection in graphics/games (approximating a complex shape's outer boundary cheaply), pattern recognition and image processing (shape analysis), GIS/mapping (computing a region's boundary from scattered sample points), and as a subroutine inside more complex geometric algorithms (e.g. some closest-pair and diameter-of-point-set algorithms use a convex hull as a first step, since the answer often lies on the hull).

Two classic algorithms solve it with different complexity trade-offs depending on $n$ (total points) vs $h$ (points actually on the hull) — Graham scan and Jarvis march, covered in their own cards.`,
    related: ["computational-geometry-graham-scan", "computational-geometry-jarvis-march"],
  },
  {
    id: "computational-geometry-graham-scan",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does Graham scan construct a convex hull in O(n log n)?",
    back: `1. Find the point with the **lowest y-coordinate** (breaking ties by lowest x) — guaranteed to be on the hull, and used as a fixed pivot.
2. **Sort** all other points by **polar angle** around that pivot (using the orientation test to compare angles without trigonometry — comparing cross products directly gives a valid angular ordering).
3. Walk through the sorted points maintaining a **stack**: for each new point, while the last two points on the stack together with the new point **don't** make a counterclockwise turn (i.e., the orientation test returns clockwise or collinear), **pop** the stack — that popped point would create a concave "dent," so it can't be on the hull. Push the new point.

The stack at the end holds exactly the hull vertices, in order. Sorting dominates the complexity: $O(n \\log n)$ total, with the scan itself $O(n)$ (each point pushed once, popped at most once — the same amortized argument as a monotonic stack, Tier 2).`,
    code: `import functools

def graham_scan(points):
    points = sorted(points, key=lambda p: (p[1], p[0]))
    pivot = points[0]

    def cmp(a, b):   # sort by polar angle around pivot, via orientation (no atan2)
        o = orientation(pivot, a, b)
        if o == 0:
            # closer point first if collinear
            da = (a[0]-pivot[0])**2 + (a[1]-pivot[1])**2
            db = (b[0]-pivot[0])**2 + (b[1]-pivot[1])**2
            return -1 if da < db else 1
        return -1 if o == 1 else 1
    rest = sorted(points[1:], key=functools.cmp_to_key(cmp))

    hull = [pivot]
    for p in rest:
        while len(hull) >= 2 and orientation(hull[-2], hull[-1], p) != 1:
            hull.pop()
        hull.append(p)
    return hull`,
    complexity: {
      structure: "Graham Scan",
      operations: [{ op: "Build convex hull", time: "O(n log n)", note: "dominated by the angular sort" }],
    },
    pitfall:
      "Ties in angle (multiple points collinear with the pivot) need a secondary sort key (distance from pivot, nearest first) — otherwise the stack-popping logic can incorrectly discard a valid hull point or include an interior one.",
    related: ["computational-geometry-orientation-primitive", "computational-geometry-hull-comparison"],
  },
  {
    id: "computational-geometry-jarvis-march",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How does Jarvis march (gift wrapping) construct a convex hull, and why is its complexity output-sensitive?",
    back: `Start at a guaranteed-hull point (e.g. the leftmost point). Repeatedly find the **next hull vertex**: from the current point, scan **all** other points to find the one such that every other point lies to one consistent side (counterclockwise) of the line from current to that candidate — that candidate is the next hull vertex, "wrapping" around the point set like wrapping a gift. Repeat until you return to the starting point.

Each step is an $O(n)$ scan over all points, and there are exactly $h$ steps (one per hull vertex) — giving $O(nh)$ total. This is **output-sensitive**: complexity depends on $h$ (the number of points that actually end up on the hull), not just $n$. When $h$ is small (a few points form the hull, most points are interior), Jarvis march can beat Graham scan's fixed $O(n \\log n)$; when $h$ is close to $n$ (most points are on the hull, e.g. points arranged in a circle), Jarvis march degrades toward $O(n^2)$, worse than Graham scan.`,
    complexity: {
      structure: "Jarvis March",
      operations: [{ op: "Build convex hull", time: "O(n·h)", note: "h = number of hull vertices; output-sensitive" }],
    },
    related: ["computational-geometry-graham-scan", "computational-geometry-hull-comparison"],
  },
  {
    id: "computational-geometry-hull-comparison",
    tier: 3,
    module: MODULE,
    type: "compare",
    front: "Graham scan vs. Jarvis march — when does the output-sensitive complexity actually matter?",
    back: `| | Complexity | Best when |
|---|---|---|
| Graham scan | O(n log n), fixed | General purpose default — predictable regardless of hull shape |
| Jarvis march | O(n·h), output-sensitive | h (hull vertices) is known/expected to be small relative to n |

If most points are scattered with only a handful forming the outer boundary (e.g. a dense cluster with a few outliers), Jarvis march's $O(nh)$ can be dramatically better than Graham scan's fixed $O(n \\log n)$ — e.g. $h=10, n=10000$ gives Jarvis march $O(100{,}000)$ vs. Graham scan's $O(n\\log n) \\approx O(130{,}000)$, a real but modest win; the gap widens further as $h$ shrinks relative to $n$.

If the point distribution is unknown or could plausibly have most points on the hull (e.g. points on a circle, $h \\approx n$), Graham scan's guaranteed $O(n\\log n)$ is the safer default — Jarvis march's worst case degrades to $O(n^2)$. This is a recurring theme: an output-sensitive algorithm is a great choice specifically when you have reason to believe the output will be small.`,
    related: ["computational-geometry-graham-scan", "computational-geometry-jarvis-march"],
  },

  // ---------------------------------------------------- Segment intersection
  {
    id: "computational-geometry-segment-intersection",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "How do you test whether two line segments intersect, using the orientation primitive?",
    back: `Two segments $AB$ and $CD$ **properly intersect** (crossing each other, not just touching collinearly) if and only if:
- $A$ and $B$ are on **opposite sides** of line $CD$ (i.e., \`orientation(C, D, A) != orientation(C, D, B)\`), **and**
- $C$ and $D$ are on **opposite sides** of line $AB$ (i.e., \`orientation(A, B, C) != orientation(A, B, D)\`).

Intuition: if $A$ and $B$ straddle line $CD$, segment $AB$ must cross the infinite line through $C,D$ **somewhere** — but that alone doesn't guarantee the crossing point falls within segment $CD$'s actual extent, which is exactly what the symmetric second condition (checking $C, D$ straddle line $AB$) confirms. Both conditions together, using only the $O(1)$ orientation primitive four times, give an exact combinatorial test with no need to actually compute the intersection point's coordinates (which would require division and floating-point care).

**Collinear special cases** (orientation returns 0) need explicit handling — e.g. checking whether one segment's endpoint lies within the other's bounding box — since the straddle test alone doesn't distinguish "overlapping collinear segments" from "collinear but disjoint."`,
    code: `def on_segment(p, q, r):  # is q on segment pr, given they're collinear?
    return (min(p[0],r[0]) <= q[0] <= max(p[0],r[0]) and
            min(p[1],r[1]) <= q[1] <= max(p[1],r[1]))

def segments_intersect(A, B, C, D):
    o1, o2 = orientation(A, B, C), orientation(A, B, D)
    o3, o4 = orientation(C, D, A), orientation(C, D, B)
    if o1 != o2 and o3 != o4:
        return True
    # collinear special cases
    if o1 == 0 and on_segment(A, C, B): return True
    if o2 == 0 and on_segment(A, D, B): return True
    if o3 == 0 and on_segment(C, A, D): return True
    if o4 == 0 and on_segment(C, B, D): return True
    return False`,
    complexity: {
      structure: "Segment Intersection Test",
      operations: [{ op: "Check two segments", time: "O(1)" }],
    },
    pitfall:
      "Skipping the collinear special-case checks handles the common case correctly but silently gives wrong answers for the edge case of overlapping or endpoint-touching collinear segments — easy to miss in testing since it's a lower-probability geometric configuration.",
    related: ["computational-geometry-orientation-primitive"],
  },

  // -------------------------------------------------------------- Sweep line
  {
    id: "computational-geometry-sweep-line",
    tier: 3,
    module: MODULE,
    type: "concept",
    front: "What is the sweep line technique, and how does it find any intersection among n segments faster than checking all pairs?",
    back: `Checking all $\\binom{n}{2}$ pairs of segments for intersection is $O(n^2)$. The sweep line technique imagines a vertical line sweeping left to right across the plane, processing discrete **events** in x-order, and maintaining a **status structure** — an ordered collection of segments currently crossed by the sweep line, ordered by their y-coordinate at the sweep line's current x-position.

Two event types: a segment's **left endpoint** (insert it into the status structure, then check if it intersects its new immediate neighbors above/below), and its **right endpoint** (remove it from the status structure, then check if its former neighbors above/below now newly touch each other). The key insight making this correct and efficient: **two segments can only possibly intersect if they are adjacent in the status structure's y-order at some point during the sweep** — so it suffices to check only newly-adjacent pairs at each event, never all pairs.

Processing $O(n)$ events, each doing $O(\\log n)$ work (status structure insert/delete/neighbor-query, typically backed by a balanced BST), gives $O(n \\log n)$ total for detecting whether *any* intersection exists among $n$ segments — this is the core idea behind the **Bentley-Ottmann algorithm**, which extends it to report *all* $k$ intersections in $O((n+k)\\log n)$.`,
    complexity: {
      structure: "Sweep Line (segment intersection)",
      operations: [
        { op: "Detect any intersection among n segments", time: "O(n log n)", note: "vs O(n²) all-pairs" },
        { op: "Report all k intersections (Bentley-Ottmann)", time: "O((n + k) log n)" },
      ],
    },
    pitfall:
      "The sweep line's correctness relies on the 'only adjacent-in-status-order segments can intersect' invariant being properly maintained — this requires that the status structure's ordering only ever changes AT event points (intersections themselves are exactly where two segments would swap y-order), which is why intersection events must also be inserted into the event queue as they're discovered, not just the original endpoints.",
    related: ["computational-geometry-segment-intersection", "specialized-trees-interval-trees"],
  },
];
