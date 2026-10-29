import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, getCategory } from "@/lib/data";
import { algoName, catName } from "@/lib/content-i18n";
import type { Lang } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import CategoryView from "@/components/category-view";

export function categoryParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export function categoryMetadata(lang: Lang, categorySlug: string): Metadata {
  const category = getCategory(categorySlug);
  if (!category) return {};
  const name = catName(category.slug, category.name, lang);
  const names = category.algorithms
    .map((a) => algoName(a.slug, a.name, lang))
    .join(", ");
  return pageMetadata(
    lang,
    `/${categorySlug}`,
    name,
    lang === "tr" ? `${name}: ${names}.` : `${name} algorithms: ${names}.`
  );
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
