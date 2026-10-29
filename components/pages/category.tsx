import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, getCategory } from "@/lib/data";
import { algoName, catName } from "@/lib/content-i18n";
import type { Lang } from "@/lib/locale";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { translate } from "@/lib/translate";
import JsonLd from "@/components/json-ld";
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

export default function CategoryPage({ lang, categorySlug }: CategoryPageProps) {
  const category = getCategory(categorySlug);
  if (!category) notFound();

  const breadcrumb = breadcrumbJsonLd(
    lang,
    [
      { name: translate(lang, "nav.overview"), path: "/" },
      { name: catName(category.slug, category.name, lang), path: `/${category.slug}` },
    ],
    siteUrl
  );

  return (
    <>
      <JsonLd data={breadcrumb} />
      <CategoryView slug={category.slug} />
    </>
  );
}
