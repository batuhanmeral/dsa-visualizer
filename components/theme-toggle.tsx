"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Flips the manual light/dark theme and persists the choice to localStorage.
 * The effective theme lives in `document.documentElement.dataset.theme`, stamped
 * before paint by the inline script in the root layout. We mirror it into local
 * state after mount so the icon reflects the real value without a hydration
 * mismatch (server render and first client render both show the fallback Moon).
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  // Sync local state to the theme the inline script already applied — a one-time
  // read of a value that only exists after mount (hence the scoped waiver).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "light" ? "light" : "dark"
    );
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage unavailable — ignore */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title={theme === "light" ? "Switch to dark" : "Switch to light"}
      className={`flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${className}`}
    >
      {theme === "light" ? (
        <Sun className="size-4.5" />
      ) : (
        <Moon className="size-4.5" />
      )}
    </button>
  );
}
