"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategory } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { algoName, algoSummary, catName, catTagline } from "@/lib/content-i18n";

/** Client body of a category page — server page handles params/metadata/404. */
export default function CategoryView({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const category = getCategory(slug);
  if (!category) return null;
  const Icon = category.icon;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {catName(category.slug, category.name, lang)}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {catTagline(category.slug, category.tagline, lang)}
          </p>
        </div>
      </div>

      <ul className="space-y-3">
        {category.algorithms.map((algorithm) => (
          <li key={algorithm.slug}>
            <Link
              href={`/${category.slug}/${algorithm.slug}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-emerald-500/40 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-emerald-500/40"
            >
              <div className="min-w-0">
                <h2 className="text-sm font-semibold tracking-tight">
                  {algoName(algorithm.slug, algorithm.name, lang)}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {algoSummary(algorithm.slug, algorithm.summary, lang)}
                </p>
                <p className="mt-2 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                  {t("cat.time")} {algorithm.time} · {t("cat.space")}{" "}
                  {algorithm.space}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
