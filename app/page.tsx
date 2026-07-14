"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { categories } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { algoName, catName, catTagline } from "@/lib/content-i18n";

export default function HomePage() {
  const { t, lang } = useLang();
  const algorithmCount = categories.reduce(
    (sum, c) => sum + c.algorithms.length,
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
      {/* Hero */}
      <div className="mb-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-3.5" />
          {t("home.badge", {
            count: algorithmCount,
            categories: categories.length,
          })}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("home.title.pre")}
          <span className="text-emerald-500">{t("home.title.accent")}</span>
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
          return (
            <section
              key={category.slug}
              className="rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-emerald-500/40 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-emerald-500/40"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">
                    {catName(category.slug, category.name, lang)}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {catTagline(category.slug, category.tagline, lang)}
                  </p>
                </div>
              </div>
              <ul className="space-y-1">
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
