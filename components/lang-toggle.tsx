"use client";

import type { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { useLang, type Lang } from "@/lib/i18n";
import { switchLangPath } from "@/lib/locale";

/**
 * Single-button language switch: links to the same page in the other language.
 * Sized and styled to match ThemeToggle so the two read as one pair of controls.
 */
export default function LangToggle({ className = "" }: { className?: string }) {
  const { lang, t } = useLang();
  const pathname = usePathname();
  const next: Lang = lang === "en" ? "tr" : "en";

  // Query read at click time: useSearchParams would push static pages into
  // client rendering. Modified clicks keep the browser's default (new tab).
  const switchWithQuery = (event: MouseEvent<HTMLAnchorElement>) => {
    const modified =
      event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (modified) return;
    event.preventDefault();
    window.location.assign(
      switchLangPath(pathname, window.location.search, next) + window.location.hash
    );
  };

  return (
    <a
      href={switchLangPath(pathname, "", next)}
      onClick={switchWithQuery}
      aria-label={t("toggle.lang")}
      title={t("toggle.lang")}
      className={`flex size-9 items-center justify-center rounded-lg text-[11px] font-semibold uppercase text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${className}`}
    >
      {lang}
    </a>
  );
}
