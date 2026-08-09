// Content integrity check: run after every module lands.
//   npx tsx scripts/validate-content.ts
//
// Verifies:
//   - every card id is globally unique
//   - every card.module matches a known module slug
//   - every id in `related` resolves to a real card
//   - id naming convention: "<module-slug>-<topic-slug>"
//   - every module belongs to a real COURSES entry
//   - for lecture-numbered courses (has a COURSE_LECTURE_MAPS entry): every
//     lecture's cardIds resolve, and every card in that course's modules is
//     reachable from some lecture
//   - for module-grouped courses (no COURSE_LECTURE_MAPS entry): at least
//     one module is tagged with that course id

import { ALL_CARDS } from "../src/data";
import { MODULES } from "../src/data/modules";
import { COURSES, COURSE_LECTURE_MAPS } from "../src/data/courses";

let errors = 0;

function fail(msg: string) {
  console.error(`✗ ${msg}`);
  errors++;
}

const moduleSlug = new Set(MODULES.map((m) => m.slug));
const ids = new Map<string, number>();

ALL_CARDS.forEach((c, i) => {
  ids.set(c.id, (ids.get(c.id) ?? 0) + 1);

  if (!moduleSlug.has(c.module)) {
    fail(`Card "${c.id}" (index ${i}) has unknown module "${c.module}"`);
  }

  if (!c.id.startsWith(c.module)) {
    fail(`Card "${c.id}" does not start with its module slug "${c.module}"`);
  }

  const mod = MODULES.find((m) => m.slug === c.module);
  if (mod && mod.tier !== c.tier) {
    fail(`Card "${c.id}" has tier ${c.tier} but module "${c.module}" is tier ${mod.tier}`);
  }
});

for (const [id, count] of ids) {
  if (count > 1) fail(`Duplicate id "${id}" appears ${count} times`);
}

const idSet = new Set(ALL_CARDS.map((c) => c.id));
for (const c of ALL_CARDS) {
  for (const rel of c.related ?? []) {
    if (!idSet.has(rel)) {
      fail(`Card "${c.id}" has a related id "${rel}" that does not resolve to any card`);
    }
    if (rel === c.id) {
      fail(`Card "${c.id}" lists itself in related`);
    }
  }
}

const courseIds = new Set(COURSES.map((c) => c.id));
for (const m of MODULES) {
  if (!m.course) {
    fail(`Module "${m.slug}" has no \`course\` — every module must belong to a course`);
  } else if (!courseIds.has(m.course)) {
    fail(`Module "${m.slug}" has unknown course "${m.course}"`);
  }
}

for (const course of COURSES) {
  const lectures = COURSE_LECTURE_MAPS[course.id];
  const courseModuleSlugs = new Set(
    MODULES.filter((m) => m.course === course.id).map((m) => m.slug),
  );

  if (!lectures) {
    // Module-grouped course: no external lecture numbering to check
    // against — just make sure it actually has content.
    if (courseModuleSlugs.size === 0) {
      fail(`Course "${course.id}" has no lecture map and no modules — it has no content at all`);
    }
    continue;
  }

  const cardIdsInLectureMap = new Set<string>();
  for (const lecture of lectures) {
    for (const cardId of lecture.cardIds) {
      cardIdsInLectureMap.add(cardId);
      if (!idSet.has(cardId)) {
        fail(
          `Course "${course.id}" Lecture ${lecture.number} references unknown card id "${cardId}"`,
        );
      }
    }
  }
  for (const c of ALL_CARDS) {
    if (courseModuleSlugs.has(c.module) && !cardIdsInLectureMap.has(c.id)) {
      fail(
        `Card "${c.id}" belongs to a course module ("${c.module}") but isn't referenced by any lecture in "${course.id}"'s map`,
      );
    }
  }
}

console.log(`Checked ${ALL_CARDS.length} cards across ${MODULES.length} modules.`);
if (errors > 0) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log("All good.");
}
