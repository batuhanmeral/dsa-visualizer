"use client";

import { useLang, type Lang } from "@/lib/i18n";

/**
 * Single-button language switch: shows the language in force and flips to the
 * other one on click. Sized and styled to match ThemeToggle so the two read as
 * one pair of controls.
 */
export default function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const next: Lang = lang === "en" ? "tr" : "en";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={t("toggle.lang")}
      title={t("toggle.lang")}
      className={`flex size-9 items-center justify-center rounded-lg text-[11px] font-semibold uppercase text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${className}`}
    >
      {lang}
    </button>
  );
}
