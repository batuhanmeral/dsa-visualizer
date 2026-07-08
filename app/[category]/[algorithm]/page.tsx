import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Workspace from "@/components/workspace";
import { categories, getAlgorithm } from "@/lib/data";

interface AlgorithmPageProps {
  params: Promise<{ category: string; algorithm: string }>;
}

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.algorithms.map((algorithm) => ({
      category: category.slug,
      algorithm: algorithm.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: AlgorithmPageProps): Promise<Metadata> {
  const { category: categorySlug, algorithm: algorithmSlug } = await params;
  const match = getAlgorithm(categorySlug, algorithmSlug);
  if (!match) return {};
  return {
    title: match.algorithm.name,
    description: match.algorithm.summary,
  };
}

export default async function AlgorithmPage({ params }: AlgorithmPageProps) {
  const { category: categorySlug, algorithm: algorithmSlug } = await params;
  const match = getAlgorithm(categorySlug, algorithmSlug);
  if (!match) notFound();

  return (
    <Workspace
      category={{ name: match.category.name, slug: match.category.slug }}
      algorithm={match.algorithm}
    />
  );
}
