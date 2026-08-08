import { useState } from "react";
import type { Card } from "../data/types";
import { Markdown } from "./Markdown";
import { ComplexityTable } from "./ComplexityTable";

const TYPE_LABEL: Record<Card["type"], string> = {
  concept: "Concept",
  complexity: "Complexity",
  "code-trace": "Code Trace",
  compare: "Compare",
  implementation: "Coding Practice",
};

const TYPE_COLOR: Record<Card["type"], string> = {
  concept: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  complexity: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "code-trace": "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  compare: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-300",
  implementation: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

export function CardView({
  card,
  flipped,
  onFlip,
}: {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
}) {
  const [attempt, setAttempt] = useState("");
  const isImplementation = card.type === "implementation";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_COLOR[card.type]}`}
        >
          {TYPE_LABEL[card.type]}
        </span>
        <span className="text-xs text-slate-400">Tier {card.tier}</span>
      </div>

      <div
        className="min-h-[16rem] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        onClick={!flipped ? onFlip : undefined}
        role={!flipped ? "button" : undefined}
        tabIndex={!flipped ? 0 : undefined}
      >
        <div className="text-lg font-medium leading-snug">{card.front}</div>

        {isImplementation && !flipped && (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <textarea
              value={attempt}
              onChange={(e) => setAttempt(e.target.value)}
              placeholder="Write your attempt here (not saved, just scratch space)..."
              className="h-40 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              onClick={onFlip}
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Reveal solution
            </button>
          </div>
        )}

        {!isImplementation && !flipped && (
          <div className="mt-6 text-sm text-slate-400">
            Click, or press space / enter, to flip
          </div>
        )}

        {flipped && (
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <Markdown>{card.back}</Markdown>

            {card.complexity && <ComplexityTable complexity={card.complexity} />}

            {card.code && (
              <div className="not-prose mt-3">
                <Markdown>{`\`\`\`${card.codeLang ?? "python"}\n${card.code}\n\`\`\``}</Markdown>
              </div>
            )}

            {card.pitfall && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <span className="font-semibold">Pitfall: </span>
                {card.pitfall}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
