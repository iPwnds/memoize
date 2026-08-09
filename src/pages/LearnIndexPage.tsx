import { Link } from "react-router-dom";
import { ALL_CARDS, COURSES, MODULES } from "../data";

export function LearnIndexPage() {
  const coursesWithCards = COURSES.filter((course) => {
    const courseModules = MODULES.filter((m) => m.course === course.id);
    return courseModules.some((m) => ALL_CARDS.some((c) => c.module === m.slug));
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Learn</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          A structured, textbook-style read through each module — cards presented in
          curated order with cross-links, instead of one at a time. Doesn't affect your
          review schedule. Pick a course below, then a module within it.
        </p>
      </div>

      {coursesWithCards.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Courses
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {coursesWithCards.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="flex flex-col gap-1 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 transition-colors hover:border-indigo-400 dark:border-indigo-800 dark:bg-indigo-500/5 dark:hover:border-indigo-600"
              >
                <span className="font-medium">{course.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{course.subtitle}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
