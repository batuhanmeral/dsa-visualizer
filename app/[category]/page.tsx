import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { categories, getCategory } from "@/lib/data";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.name} algorithms: ${category.algorithms
      .map((a) => a.name)
      .join(", ")}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) notFound();

  const Icon = category.icon;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {category.tagline}
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
                  {algorithm.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {algorithm.summary}
                </p>
                <p className="mt-2 font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                  Time {algorithm.time} · Space {algorithm.space}
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
