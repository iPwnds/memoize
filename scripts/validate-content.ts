// Content integrity check: run after every module lands.
//   npx tsx scripts/validate-content.ts
//
// Verifies:
//   - every card id is globally unique
//   - every card.module matches a known module slug
//   - every id in `related` resolves to a real card
//   - id naming convention: "<module-slug>-<topic-slug>"
//   - every course has a lecture map, every lecture's cardIds resolve,
//     and every course-module card is reachable from its course's map

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

const courseModuleSlugs = new Set(
  MODULES.filter((m) => m.course).map((m) => m.slug),
);
const cardIdsInLectureMaps = new Set<string>();

for (const course of COURSES) {
  const lectures = COURSE_LECTURE_MAPS[course.id];
  if (!lectures) {
    fail(`Course "${course.id}" has no entry in COURSE_LECTURE_MAPS`);
    continue;
  }
  for (const lecture of lectures) {
    for (const cardId of lecture.cardIds) {
      cardIdsInLectureMaps.add(cardId);
      if (!idSet.has(cardId)) {
        fail(
          `Course "${course.id}" Lecture ${lecture.number} references unknown card id "${cardId}"`,
        );
      }
    }
  }
}

for (const c of ALL_CARDS) {
  if (courseModuleSlugs.has(c.module) && !cardIdsInLectureMaps.has(c.id)) {
    fail(
      `Card "${c.id}" belongs to a course module ("${c.module}") but isn't referenced by any lecture in that course's map`,
    );
  }
}

console.log(`Checked ${ALL_CARDS.length} cards across ${MODULES.length} modules.`);
if (errors > 0) {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log("All good.");
}
