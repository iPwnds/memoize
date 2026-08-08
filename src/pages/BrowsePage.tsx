import { useEffect, useMemo, useState } from "react";
import { CardView } from "../components/CardView";
import { ALL_CARDS, MODULES } from "../data";
import type { CardType, Tier } from "../data/types";

const TYPES: CardType[] = ["concept", "complexity", "code-trace", "compare", "implementation"];

export function BrowsePage() {
  const [tier, setTier] = useState<Tier | "all">("all");
  const [module, setModule] = useState<string>("all");
  const [type, setType] = useState<CardType | "all">("all");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CARDS.filter((c) => {
      if (tier !== "all" && c.tier !== tier) return false;
      if (module !== "all" && c.module !== module) return false;
      if (type !== "all" && c.type !== type) return false;
      if (q && !c.front.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tier, module, type, query]);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [tier, module, type, query]);

  const current = filtered[index];
  const availableModules = MODULES.filter((m) => tier === "all" || m.tier === tier);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(filtered.length - 1, i + 1));
        setFlipped(false);
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(0, i - 1));
        setFlipped(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered.length]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={tier}
          onChange={(e) => {
            setTier(e.target.value === "all" ? "all" : (Number(e.target.value) as Tier));
            setModule("all");
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All tiers</option>
          <option value={1}>Tier 1</option>
          <option value={2}>Tier 2</option>
          <option value={3}>Tier 3</option>
        </select>
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All modules</option>
          {availableModules.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.title}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as CardType | "all")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="all">All types</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fronts…"
          className="min-w-[10rem] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {current ? (
        <>
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <button
              onClick={() => {
                setIndex((i) => Math.max(0, i - 1));
                setFlipped(false);
              }}
              disabled={index === 0}
              className="rounded-lg px-2 py-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              ← Prev
            </button>
            <span>
              {index + 1} / {filtered.length}
            </span>
            <button
              onClick={() => {
                setIndex((i) => Math.min(filtered.length - 1, i + 1));
                setFlipped(false);
              }}
              disabled={index === filtered.length - 1}
              className="rounded-lg px-2 py-1 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"
            >
              Next →
            </button>
          </div>
          <CardView card={current} flipped={flipped} onFlip={() => setFlipped(true)} />
        </>
      ) : (
        <div className="py-24 text-center text-slate-500 dark:text-slate-400">
          No cards match these filters.
        </div>
      )}
    </div>
  );
}
