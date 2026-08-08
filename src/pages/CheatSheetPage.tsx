import { useMemo, useState } from "react";
import { ALL_CARDS } from "../data";
import { ComplexityTable } from "../components/ComplexityTable";
import { mergeComplexityByStructure } from "../lib/complexity";

export function CheatSheetPage() {
  const [query, setQuery] = useState("");

  const allStructures = useMemo(() => mergeComplexityByStructure(ALL_CARDS), []);

  const structures = useMemo(
    () =>
      allStructures
        .filter((c) => c.structure.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.structure.localeCompare(b.structure)),
    [allStructures, query],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Complexity Cheat Sheet</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every data structure/algorithm's operation complexities, pulled directly from
          the flashcard data.
        </p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter structures…"
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      {structures.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400">
          No matching structures yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {structures.map((c) => (
            <div
              key={c.structure}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <ComplexityTable complexity={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
