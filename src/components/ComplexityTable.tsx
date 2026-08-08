import type { Complexity } from "../data/types";

export function ComplexityTable({ complexity }: { complexity: Complexity }) {
  const hasSpace = complexity.operations.some((op) => op.space);
  const hasNote = complexity.operations.some((op) => op.note);
  return (
    <div className="not-prose my-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {complexity.structure} — complexity
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="px-3 py-2 text-left font-medium">Operation</th>
              <th className="px-3 py-2 text-left font-medium">Time</th>
              {hasSpace && <th className="px-3 py-2 text-left font-medium">Space</th>}
              {hasNote && <th className="px-3 py-2 text-left font-medium">Note</th>}
            </tr>
          </thead>
          <tbody>
            {complexity.operations.map((op, i) => (
              <tr
                key={op.op}
                className={i % 2 === 1 ? "bg-slate-50 dark:bg-slate-900/50" : ""}
              >
                <td className="px-3 py-2 font-medium">{op.op}</td>
                <td className="px-3 py-2 font-mono">{op.time}</td>
                {hasSpace && <td className="px-3 py-2 font-mono">{op.space ?? "—"}</td>}
                {hasNote && (
                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                    {op.note ?? ""}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {complexity.caveat && (
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {complexity.caveat}
        </div>
      )}
    </div>
  );
}
