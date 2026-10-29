import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Workspace from "@/components/workspace";
import { categories, getAlgorithm } from "@/lib/data";
import { algoSummary } from "@/lib/content-i18n";
import type { Lang } from "@/lib/locale";
import { algorithmTitle, pageMetadata } from "@/lib/seo";

export function algorithmParams() {
  return categories.flatMap((category) =>
    category.algorithms.map((algorithm) => ({
      category: category.slug,
      algorithm: algorithm.slug,
    }))
  );
}

export function algorithmMetadata(
  lang: Lang,
  categorySlug: string,
  algorithmSlug: string
): Metadata {
  const match = getAlgorithm(categorySlug, algorithmSlug);
  if (!match) return {};
  const { slug, name, summary } = match.algorithm;
  return pageMetadata(
    lang,
    `/${categorySlug}/${algorithmSlug}`,
    algorithmTitle(lang, slug, name),
    algoSummary(slug, summary, lang)
  );
}

interface AlgorithmPageProps {
  lang: Lang;
  categorySlug: string;
  algorithmSlug: string;
}

// `lang` is part of the contract for server-rendered, language-specific
// content; Workspace still reads it from LangProvider.
export default function AlgorithmPage({
  categorySlug,
  algorithmSlug,
}: AlgorithmPageProps) {
  const match = getAlgorithm(categorySlug, algorithmSlug);
  if (!match) notFound();

  return (
    <Workspace
      category={{ name: match.category.name, slug: match.category.slug }}
      algorithm={match.algorithm}
    />
  );
}
