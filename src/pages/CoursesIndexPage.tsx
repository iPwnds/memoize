import { Link } from "react-router-dom";
import { ALL_CARDS, COURSES, MODULES } from "../data";
import { computeCardsProgress } from "../lib/progress";
import { useSrsStore } from "../store/srsStore";

export function CoursesIndexPage() {
  const srsCards = useSrsStore((s) => s.cards);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Courses</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A lecture-by-lecture syllabus tracker for a specific course, mapping every
          lecture to the cards that cover it — a study plan, not just a reading list.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {COURSES.map((course) => {
          const courseModuleSlugs = new Set(
            MODULES.filter((m) => m.course === course.id).map((m) => m.slug),
          );
          const courseCards = ALL_CARDS.filter((c) => courseModuleSlugs.has(c.module));
          const progress = computeCardsProgress(courseCards, srsCards);
          return (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{course.title}</span>
                <span className="text-xs text-slate-400">{progress.total} cards</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{course.subtitle}</p>
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
}
