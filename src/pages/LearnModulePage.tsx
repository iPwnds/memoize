import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ALL_CARDS, moduleBySlug } from "../data";
import { LearnCardSection } from "../components/LearnCardSection";

export function LearnModulePage() {
  const { moduleSlug } = useParams<{ moduleSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const meta = moduleSlug ? moduleBySlug(moduleSlug) : undefined;
  const cards = useMemo(
    () => ALL_CARDS.filter((c) => c.module === moduleSlug),
    [moduleSlug],
  );
  const idToCard = useMemo(() => new Map(ALL_CARDS.map((c) => [c.id, c])), []);

  const jumpTarget = searchParams.get("card");

  useEffect(() => {
    if (!jumpTarget) return;
    const target = jumpTarget;
    let cancelled = false;

    (async () => {
      // Wait for web fonts (KaTeX) to finish laying out — on a fresh cross-module
      // navigation the page is still growing under us, and scrolling before it
      // settles lands on the wrong card.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      if (cancelled) return;

      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setHighlighted(target);
        setTimeout(() => {
          setHighlighted((h) => (h === target ? null : h));
        }, 2000);
      }
      // clear the query param so the highlight doesn't re-trigger on next visit
      setSearchParams({}, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpTarget]);

  const handleJumpTo = (cardId: string) => {
    const target = idToCard.get(cardId);
    if (!target) return;
    if (target.module === moduleSlug) {
      document.getElementById(cardId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlighted(cardId);
      setTimeout(() => {
        setHighlighted((h) => (h === cardId ? null : h));
      }, 2000);
    } else {
      navigate(`/learn/${target.module}?card=${cardId}`);
    }
  };

  if (!meta || cards.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400">
        <p>This module isn't available yet.</p>
        <Link to="/learn" className="mt-2 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
          ← Back to Learn
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <nav className="order-2 shrink-0 lg:sticky lg:top-20 lg:order-1 lg:w-64">
        <Link
          to="/learn"
          className="mb-3 inline-block text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          ← All modules
        </Link>
        <div className="mb-2 text-sm font-semibold">{meta.title}</div>
        <ol className="flex flex-col gap-1 border-l border-slate-200 pl-3 text-sm dark:border-slate-800 lg:max-h-[75vh] lg:overflow-y-auto">
          {cards.map((c, i) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(c.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="block py-0.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                {i + 1}. {c.front.length > 50 ? c.front.slice(0, 47) + "…" : c.front}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="order-1 flex min-w-0 flex-1 flex-col gap-4 lg:order-2">
        <div>
          <h1 className="text-2xl font-semibold">{meta.title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tier {meta.tier} · {cards.length} cards, in curated reading order.
          </p>
        </div>
        {cards.map((card) => (
          <LearnCardSection
            key={card.id}
            card={card}
            relatedCards={(card.related ?? [])
              .map((id) => idToCard.get(id))
              .filter((c): c is NonNullable<typeof c> => c !== undefined)}
            onJumpTo={handleJumpTo}
            highlighted={highlighted === card.id}
          />
        ))}
      </div>
    </div>
  );
}
