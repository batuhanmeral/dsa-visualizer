import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, getCategory } from "@/lib/data";
import type { Lang } from "@/lib/locale";
import CategoryView from "@/components/category-view";

export function categoryParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export function categoryMetadata(categorySlug: string): Metadata {
  const category = getCategory(categorySlug);
  if (!category) return {};
  return {
    title: category.name,
    description: `${category.name} algorithms: ${category.algorithms
      .map((a) => a.name)
      .join(", ")}.`,
  };
}

interface CategoryPageProps {
  lang: Lang;
  categorySlug: string;
}

// `lang` is part of the contract for server-rendered, language-specific
// content; the client view still reads it from LangProvider.
export default function CategoryPage({ categorySlug }: CategoryPageProps) {
  const category = getCategory(categorySlug);
  if (!category) notFound();

  return <CategoryView slug={category.slug} />;
}
