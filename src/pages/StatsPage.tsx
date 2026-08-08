import { ALL_CARDS, MODULES } from "../data";
import { computeModuleProgress, dueCards } from "../lib/progress";
import { useSrsStore } from "../store/srsStore";

export function StatsPage() {
  const srsCards = useSrsStore((s) => s.cards);
  const streak = useSrsStore((s) => s.streak);
  const totalReviews = useSrsStore((s) => s.totalReviews);

  const totalDue = dueCards(ALL_CARDS, srsCards).length;
  const modulesWithCards = MODULES.filter(
    (m) => ALL_CARDS.some((c) => c.module === m.slug),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Stats</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Current streak" value={`${streak.current}d`} />
        <StatTile label="Longest streak" value={`${streak.longest}d`} />
        <StatTile label="Due now" value={String(totalDue)} />
        <StatTile label="Total reviews" value={String(totalReviews)} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Per-module mastery
        </h2>
        <div className="flex flex-col gap-2">
          {modulesWithCards.map((m) => {
            const p = computeModuleProgress(ALL_CARDS, srsCards, m.slug);
            return (
              <div
                key={m.slug}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="w-48 shrink-0 truncate text-sm font-medium">
                  {m.title}
                </div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${p.masteryPct}%` }}
                  />
                </div>
                <div className="w-10 shrink-0 text-right text-sm tabular-nums">
                  {p.masteryPct}%
                </div>
                <div className="w-16 shrink-0 text-right text-xs text-slate-400">
                  {p.due} due
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
