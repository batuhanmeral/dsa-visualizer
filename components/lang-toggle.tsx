"use client";

import { useLang, type Lang } from "@/lib/i18n";

/** Compact EN/TR segmented control. Persists via the i18n provider. */
export default function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLang();
  const langs: Lang[] = ["en", "tr"];

  return (
    <div
      title={t("toggle.lang")}
      className={`flex items-center rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
    >
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase transition-colors ${
            lang === l
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
