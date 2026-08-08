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

export function LearnCardSection({
  card,
  relatedCards,
  onJumpTo,
  highlighted,
}: {
  card: Card;
  relatedCards: Card[];
  onJumpTo: (cardId: string) => void;
  highlighted: boolean;
}) {
  return (
    <section
      id={card.id}
      className={`scroll-mt-20 rounded-2xl border p-6 transition-colors ${
        highlighted
          ? "border-indigo-400 bg-indigo-50/50 dark:border-indigo-600 dark:bg-indigo-500/5"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {TYPE_LABEL[card.type]}
        </span>
        <span>Tier {card.tier}</span>
      </div>

      <h3 className="text-lg font-semibold leading-snug">{card.front}</h3>

      <div className="mt-4">
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

        {relatedCards.length > 0 && (
          <div className="not-prose mt-4 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="text-xs text-slate-400">See also:</span>
            {relatedCards.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onJumpTo(rel.id)}
                title={rel.module !== card.module ? `${rel.module} module` : undefined}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300"
              >
                {rel.front.length > 60 ? rel.front.slice(0, 57) + "…" : rel.front}
                {rel.module !== card.module ? " ↗" : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
