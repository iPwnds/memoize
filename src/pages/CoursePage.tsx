import { Link, useParams } from "react-router-dom";
import { ALL_CARDS, COURSES, COURSE_LECTURE_MAPS, MODULES } from "../data";
import type { CourseLecture } from "../data/courses";
import type { Tier } from "../data/types";
import { computeCardsProgress, computeModuleProgress } from "../lib/progress";
import { useSrsStore } from "../store/srsStore";

const TIER_LABEL: Record<Tier, string> = {
  1: "Tier 1 — Foundations",
  2: "Tier 2 — Intermediate",
  3: "Tier 3 — Advanced",
};

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const srsCards = useSrsStore((s) => s.cards);
  const idToCard = new Map(ALL_CARDS.map((c) => [c.id, c]));

  const course = COURSES.find((c) => c.id === courseId);
  const lectures = courseId ? COURSE_LECTURE_MAPS[courseId] : undefined;
  const courseModules = courseId ? MODULES.filter((m) => m.course === courseId) : [];

  if (!course || (!lectures && courseModules.length === 0)) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400">
        <p>This course isn't available yet.</p>
        <Link to="/courses" className="mt-2 inline-block text-indigo-600 hover:underline dark:text-indigo-400">
          ← All courses
        </Link>
      </div>
    );
  }

  const allCourseCards = lectures
    ? lectures.flatMap((l) => l.cardIds.map((id) => idToCard.get(id)).filter((c): c is NonNullable<typeof c> => c !== undefined))
    : ALL_CARDS.filter((c) => courseModules.some((m) => m.slug === c.module));
  const overall = computeCardsProgress(allCourseCards, srsCards);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/courses" className="mb-2 inline-block text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
          ← All courses
        </Link>
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.subtitle}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-indigo-600" style={{ width: `${overall.masteryPct}%` }} />
          </div>
          <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">
            {overall.masteryPct}% mastered · {overall.total} cards
          </span>
        </div>
      </div>

      {lectures ? (
        <LectureTrackerView course={course} lectures={lectures} idToCard={idToCard} srsCards={srsCards} />
      ) : (
        <ModuleGroupedView modules={courseModules} srsCards={srsCards} />
      )}
    </div>
  );
}

function LectureTrackerView({
  course,
  lectures,
  idToCard,
  srsCards,
}: {
  course: (typeof COURSES)[number];
  lectures: CourseLecture[];
  idToCard: Map<string, (typeof ALL_CARDS)[number]>;
  srsCards: Record<string, import("../lib/srs").CardSrsState>;
}) {
  const scopes = course.quizScopes ?? [
    { label: "All lectures", lectures: [lectures[0]?.number ?? 1, lectures[lectures.length - 1]?.number ?? 1] as [number, number] },
  ];
  return (
    <>
      {scopes.map((scope) => {
        const scopeLectures = lectures.filter(
          (l) => l.number >= scope.lectures[0] && l.number <= scope.lectures[1],
        );
        if (scopeLectures.length === 0) return null;
        return (
          <div key={scope.label}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {scope.label} · Lectures {scope.lectures[0]}–{scope.lectures[1]}
            </h2>
            <div className="flex flex-col gap-3">
              {scopeLectures.map((lecture) => (
                <LectureRow key={lecture.number} lecture={lecture} idToCard={idToCard} srsCards={srsCards} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

function ModuleGroupedView({
  modules,
  srsCards,
}: {
  modules: (typeof MODULES)[number][];
  srsCards: Record<string, import("../lib/srs").CardSrsState>;
}) {
  const tiers: Tier[] = [1, 2, 3];
  return (
    <>
      {tiers.map((tier) => {
        const tierModules = modules.filter((m) => m.tier === tier).sort((a, b) => a.order - b.order);
        const withCards = tierModules.filter((m) => ALL_CARDS.some((c) => c.module === m.slug));
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
                      <div className="h-full bg-indigo-600" style={{ width: `${progress.masteryPct}%` }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function LectureRow({
  lecture,
  idToCard,
  srsCards,
}: {
  lecture: CourseLecture;
  idToCard: Map<string, (typeof ALL_CARDS)[number]>;
  srsCards: Record<string, import("../lib/srs").CardSrsState>;
}) {
  const cards = lecture.cardIds.map((id) => idToCard.get(id)).filter((c): c is NonNullable<typeof c> => c !== undefined);
  const progress = computeCardsProgress(cards, srsCards);

  const refs = [lecture.recitation, lecture.problemSet, lecture.problemSession].filter(Boolean);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="font-medium">Lecture {lecture.number}: {lecture.title}</span>
          {refs.length > 0 && (
            <p className="mt-0.5 text-xs text-slate-400">{refs.join(" · ")}</p>
          )}
        </div>
        {cards.length > 0 && (
          <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {progress.masteryPct}% · {cards.length} cards
          </span>
        )}
      </div>

      {cards.length > 0 && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-indigo-600" style={{ width: `${progress.masteryPct}%` }} />
        </div>
      )}

      {lecture.noCardContent ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{lecture.noCardContent}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cards.map((card) => (
            <Link
              key={card.id}
              to={`/learn/${card.module}?card=${card.id}`}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300"
            >
              {card.front.length > 55 ? card.front.slice(0, 52) + "…" : card.front}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
