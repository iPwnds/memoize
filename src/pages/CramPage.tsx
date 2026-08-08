import { useEffect, useMemo, useState } from "react";
import { CardView } from "../components/CardView";
import { ALL_CARDS, MODULES } from "../data";

export function CramPage() {
  const [module, setModule] = useState<string>(MODULES[0]?.slug ?? "");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = useMemo(
    () => ALL_CARDS.filter((c) => c.module === module),
    [module],
  );
  const current = cards[index];

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [module]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(cards.length - 1, i + 1));
        setFlipped(false);
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(0, i - 1));
        setFlipped(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cards.length]);

  const modulesWithCounts = MODULES.map((m) => ({
    ...m,
    count: ALL_CARDS.filter((c) => c.module === m.slug).length,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {modulesWithCounts.map((m) => (
            <option key={m.slug} value={m.slug} disabled={m.count === 0}>
              {m.course ? m.title : `Tier ${m.tier} — ${m.title}`} ({m.count})
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-400">
          Cram mode doesn't affect your review schedule.
        </span>
      </div>

      {current ? (
        <>
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>
                Card {index + 1} of {cards.length}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${(index / cards.length) * 100}%` }}
              />
            </div>
          </div>
          <CardView card={current} flipped={flipped} onFlip={() => setFlipped(true)} />
          <div className="mx-auto flex w-full max-w-2xl justify-between">
            <button
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setFlipped(false);
              }}
              disabled={index === 0}
              className="rounded-lg px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              ← Prev
            </button>
            <button
              onClick={() => {
                setIndex((i) => Math.min(cards.length - 1, i + 1));
                setFlipped(false);
              }}
              disabled={index === cards.length - 1}
              className="rounded-lg px-3 py-1.5 text-sm hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400">
          This module has no cards yet.
        </div>
      )}
    </div>
  );
}
