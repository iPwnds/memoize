import { Link } from "react-router-dom";
import { ALL_CARDS, COURSES, MODULES } from "../data";
import type { Tier } from "../data/types";
import { computeModuleProgress } from "../lib/progress";
import { useSrsStore } from "../store/srsStore";

const TIER_LABEL: Record<Tier, string> = {
  1: "Tier 1 — Foundations",
  2: "Tier 2 — Intermediate / Competitive & Interview-Level",
  3: "Tier 3 — Advanced / Specialized",
};

export function LearnIndexPage() {
  const srsCards = useSrsStore((s) => s.cards);

  const tiers: Tier[] = [1, 2, 3];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Learn</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A structured, textbook-style read through each module — cards presented in
          curated order with cross-links, instead of one at a time. Doesn't affect your
          review schedule.
        </p>
      </div>

      {COURSES.map((course) => {
        const courseModules = MODULES.filter((m) => m.course === course.id);
        if (!courseModules.some((m) => ALL_CARDS.some((c) => c.module === m.slug))) {
          return null;
        }
        return (
          <div key={course.id}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Courses
            </h2>
            <Link
              to={`/courses/${course.id}`}
              className="flex flex-col gap-1 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 transition-colors hover:border-indigo-400 dark:border-indigo-800 dark:bg-indigo-500/5 dark:hover:border-indigo-600"
            >
              <span className="font-medium">{course.title}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {course.subtitle} — open the lecture-by-lecture syllabus tracker
              </span>
            </Link>
          </div>
        );
      })}

      {tiers.map((tier) => {
        const tierModules = MODULES.filter((m) => m.tier === tier && !m.course).sort(
          (a, b) => a.order - b.order,
        );
        const withCards = tierModules.filter((m) =>
          ALL_CARDS.some((c) => c.module === m.slug),
        );
        if (withCards.length === 0) return null;

        return (
          <div key={tier}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {TIER_LABEL[tier]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {withCards.map((m) => {
                const cardCount = ALL_CARDS.filter((c) => c.module === m.slug).length;
                const progress = computeModuleProgress(ALL_CARDS, srsCards, m.slug);
                return (
                  <Link
                    key={m.slug}
                    to={`/learn/${m.slug}`}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{m.title}</span>
                      <span className="text-xs text-slate-400">{cardCount} cards</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-indigo-600"
                        style={{ width: `${progress.masteryPct}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
