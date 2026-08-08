import { useEffect, useMemo, useState } from "react";
import { CardView } from "../components/CardView";
import { ALL_CARDS } from "../data";
import { dueCards, sortByReviewPriority } from "../lib/progress";
import type { Rating } from "../lib/srs";
import { useSrsStore } from "../store/srsStore";

export function ReviewPage() {
  const srsCards = useSrsStore((s) => s.cards);
  const rate = useSrsStore((s) => s.rate);

  // Snapshot the due queue once per mount so rating a card mid-session
  // doesn't reshuffle the list out from under the user.
  const queue = useMemo(
    () => sortByReviewPriority(dueCards(ALL_CARDS, srsCards), srsCards),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const current = queue[index];

  const advance = () => {
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  const handleRate = (rating: Rating) => {
    if (!current) return;
    rate(current.id, rating);
    advance();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (!current) return;
      if (!flipped && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setFlipped(true);
        return;
      }
      if (flipped) {
        if (e.key === "1") handleRate("again");
        else if (e.key === "2") handleRate("hard");
        else if (e.key === "3") handleRate("good");
        else if (e.key === "4") handleRate("easy");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, current]);

  if (queue.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="text-2xl font-semibold">All caught up 🎉</div>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          No cards are due right now. Try Browse or Cram to keep studying.
        </p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <div className="text-2xl font-semibold">Session complete 🎉</div>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          You reviewed {queue.length} card{queue.length === 1 ? "" : "s"}. Come back
          tomorrow for the next batch.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Card {index + 1} of {queue.length}
          </span>
          <span>{current.module}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(index / queue.length) * 100}%` }}
          />
        </div>
      </div>

      <CardView card={current} flipped={flipped} onFlip={() => setFlipped(true)} />

      {flipped && (
        <div className="mx-auto grid w-full max-w-2xl grid-cols-4 gap-2">
          <RateButton label="Again" hint="1" color="bg-rose-600 hover:bg-rose-500" onClick={() => handleRate("again")} />
          <RateButton label="Hard" hint="2" color="bg-amber-600 hover:bg-amber-500" onClick={() => handleRate("hard")} />
          <RateButton label="Good" hint="3" color="bg-emerald-600 hover:bg-emerald-500" onClick={() => handleRate("good")} />
          <RateButton label="Easy" hint="4" color="bg-sky-600 hover:bg-sky-500" onClick={() => handleRate("easy")} />
        </div>
      )}
    </div>
  );
}

function RateButton({
  label,
  hint,
  color,
  onClick,
}: {
  label: string;
  hint: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-colors ${color}`}
    >
      {label}
      <span className="mt-0.5 text-xs opacity-70">{hint}</span>
    </button>
  );
}
