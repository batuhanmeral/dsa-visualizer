"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { categories } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { algoName, catName, catTagline } from "@/lib/content-i18n";

export default function HomePage() {
  const { t, lang } = useLang();
  // Collapsible category cards — click a header to reveal its algorithms.
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (slug: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  const algorithmCount = categories.reduce(
    (sum, c) => sum + c.algorithms.length,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      {/* Hero */}
      <div className="mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-claude-500/30 bg-claude-500/10 px-3 py-1 text-xs font-medium text-claude-600 dark:text-claude-400">
          <Sparkles className="size-3.5" />
          {t("home.badge", {
            count: algorithmCount,
            categories: categories.length,
          })}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("home.title.pre")}
          <span className="text-claude-500">{t("home.title.accent")}</span>
          {t("home.title.post")}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Category grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isOpen = open.has(category.slug);
          return (
            <section
              key={category.slug}
              className="self-start rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-claude-500/40 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-claude-500/40"
            >
              <button
                type="button"
                onClick={() => toggle(category.slug)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-claude-500/10 text-claude-600 dark:text-claude-400">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-semibold tracking-tight">
                    {catName(category.slug, category.name, lang)}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {catTagline(category.slug, category.tagline, lang)}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {category.algorithms.length}
                  </span>
                  <ChevronDown
                    className={`size-4 text-zinc-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="list"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-4 space-y-1">
                      {category.algorithms.map((algorithm) => (
                        <li key={algorithm.slug}>
                          <Link
                            href={`/${category.slug}/${algorithm.slug}`}
                            className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                          >
                            {algoName(algorithm.slug, algorithm.name, lang)}
                            <span className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                                {algorithm.time}
                              </span>
                              <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </div>
  );
}
