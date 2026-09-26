"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PanelLeftClose } from "lucide-react";
import { categories } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { algoName, catName } from "@/lib/content-i18n";
import ThemeToggle from "./theme-toggle";
import LangToggle from "./lang-toggle";

interface SidebarNavProps {
  onNavigate?: () => void;
  /** Desktop only: renders the collapse button next to the brand. */
  onCollapse?: () => void;
}

export default function SidebarNav({ onNavigate, onCollapse }: SidebarNavProps) {
  const pathname = usePathname();
  const { t, lang } = useLang();

  return (
    <div className="flex h-full flex-col">
      {/* Nav */}
      <nav className="scrollbar-slim flex-1 overflow-y-auto px-3 pb-6 pt-5">
        <Link
          href="/"
          onClick={onNavigate}
          className={`mb-4 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-claude-500/10 text-claude-600 dark:text-claude-400"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
          }`}
        >
          <LayoutDashboard className="size-4" />
          {t("nav.overview")}
        </Link>

        <ul className="space-y-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.slug}>
                <div className="mb-1.5 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  <Icon className="size-3.5" />
                  {catName(category.slug, category.name, lang)}
                </div>
                <ul className="space-y-0.5">
                  {category.algorithms.map((algorithm) => {
                    const href = `/${category.slug}/${algorithm.slug}`;
                    const isActive = pathname === href;
                    return (
                      <li key={algorithm.slug}>
                        <Link
                          href={href}
                          onClick={onNavigate}
                          aria-current={isActive ? "page" : undefined}
                          className={`relative flex items-center rounded-lg py-2 pl-6 pr-3 text-sm transition-colors ${
                            isActive
                              ? "bg-claude-500/10 font-medium text-claude-600 dark:text-claude-400"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-2 h-4 w-0.5 rounded-full bg-claude-500" />
                          )}
                          {algoName(algorithm.slug, algorithm.name, lang)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: language on the left, then theme and the collapse control */}
      <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <LangToggle />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              aria-label={t("nav.collapse")}
              title={t("nav.collapse")}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
