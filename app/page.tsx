"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
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

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      {/* Hero: the name carries the weight, the accent carries the subtitle.
          600/400 rather than 500 because claude-500 is only 3.0:1 on the light
          page — right on the large-text limit. */}
      <h1 className="mb-12 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Algorhythm
        <span className="font-normal text-claude-600 dark:text-claude-400">
          {" \u2014 "}
          {t("home.heading")}
        </span>
      </h1>

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
