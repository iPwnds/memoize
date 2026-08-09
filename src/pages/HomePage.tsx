import { Link } from "react-router-dom";
import { ALL_CARDS, COURSES, MODULES } from "../data";
import { computeCardsProgress, dueCards } from "../lib/progress";
import { useSrsStore } from "../store/srsStore";

const MODES = [
  {
    to: "/browse",
    title: "Browse",
    desc: "Free exploration by track/module/type, with search.",
  },
  {
    to: "/cram",
    title: "Cram",
    desc: "Every card in a chosen module, no effect on your review schedule.",
  },
  {
    to: "/learn",
    title: "Learn",
    desc: "Structured, textbook-style reading through each module, with cross-links.",
  },
  {
    to: "/courses",
    title: "Courses",
    desc: "Lecture-by-lecture syllabus tracker for a specific course.",
  },
  {
    to: "/cheatsheet",
    title: "Cheat Sheet",
    desc: "Complexity reference generated directly from card data.",
  },
  {
    to: "/stats",
    title: "Stats",
    desc: "Per-module mastery, streak, and cards due.",
  },
];

export function HomePage() {
  const srsCards = useSrsStore((s) => s.cards);
  const streak = useSrsStore((s) => s.streak);
  const totalReviews = useSrsStore((s) => s.totalReviews);

  const totalDue = dueCards(ALL_CARDS, srsCards).length;
  const overall = computeCardsProgress(ALL_CARDS, srsCards);

  const courses = COURSES.map((course) => {
    const courseModuleSlugs = new Set(
      MODULES.filter((m) => m.course === course.id).map((m) => m.slug),
    );
    const courseCards = ALL_CARDS.filter((c) => courseModuleSlugs.has(c.module));
    return { course, progress: computeCardsProgress(courseCards, srsCards) };
  }).filter((c) => c.progress.total > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Memoize</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          A flashcard app for mastering algorithms and data structures — spaced
          repetition, structured reading, and course-specific study tracks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Due now" value={String(totalDue)} />
        <StatTile label="Current streak" value={`${streak.current}d`} />
        <StatTile label="Overall mastery" value={`${overall.masteryPct}%`} />
        <StatTile label="Total reviews" value={String(totalReviews)} />
      </div>

      <Link
        to="/review"
        className="flex items-center justify-between rounded-2xl bg-indigo-600 px-6 py-5 text-white shadow-sm transition-colors hover:bg-indigo-500"
      >
        <div>
          <div className="text-lg font-semibold">
            {totalDue > 0
              ? `Review ${totalDue} card${totalDue === 1 ? "" : "s"}`
              : "All caught up — review anyway"}
          </div>
          <p className="mt-0.5 text-sm text-indigo-100">
            Spaced-repetition queue, filterable by course.
          </p>
        </div>
        <span aria-hidden className="text-2xl">→</span>
      </Link>

      {courses.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Your courses
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map(({ course, progress }) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="flex flex-col gap-2 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 transition-colors hover:border-indigo-400 dark:border-indigo-800 dark:bg-indigo-500/5 dark:hover:border-indigo-600"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{course.title}</span>
                  <span className="text-xs text-slate-400">{progress.total} cards</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-full bg-indigo-600"
                    style={{ width: `${progress.masteryPct}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Study modes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((mode) => (
            <Link
              key={mode.to}
              to={mode.to}
              className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
            >
              <span className="font-medium">{mode.title}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{mode.desc}</span>
            </Link>
          ))}
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
