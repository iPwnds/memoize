import { NavLink, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useUiStore } from "../store/uiStore";

const NAV = [
  { to: "/", label: "Review", end: true },
  { to: "/browse", label: "Browse" },
  { to: "/cram", label: "Cram" },
  { to: "/learn", label: "Learn" },
  { to: "/courses", label: "Courses" },
  { to: "/cheatsheet", label: "Cheat Sheet" },
  { to: "/stats", label: "Stats" },
];

export function Layout() {
  const dark = useUiStore((s) => s.dark);
  const toggleDark = useUiStore((s) => s.toggleDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <span className="text-lg font-semibold tracking-tight">Memoize</span>
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="ml-1 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {dark ? "☀︎" : "☾"}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
