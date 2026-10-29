import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Workspace from "@/components/workspace";
import { categories, getAlgorithm } from "@/lib/data";
import type { Lang } from "@/lib/locale";

export function algorithmParams() {
  return categories.flatMap((category) =>
    category.algorithms.map((algorithm) => ({
      category: category.slug,
      algorithm: algorithm.slug,
    }))
  );
}

export function algorithmMetadata(
  categorySlug: string,
  algorithmSlug: string
): Metadata {
  const match = getAlgorithm(categorySlug, algorithmSlug);
  if (!match) return {};
  return {
    title: match.algorithm.name,
    description: match.algorithm.summary,
  };
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
