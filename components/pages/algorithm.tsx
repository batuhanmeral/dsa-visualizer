import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AlgoExplainer from "@/components/algo-explainer";
import Workspace from "@/components/workspace";
import { algoCode } from "@/lib/algo-code";
import { getAlgoInfo } from "@/lib/algo-info";
import { categories, getAlgorithm } from "@/lib/data";
import JsonLd from "@/components/json-ld";
import { algoName, algoSummary, catName } from "@/lib/content-i18n";
import type { Lang } from "@/lib/locale";
import { algorithmTitle, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { translate } from "@/lib/translate";

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

export default function AlgorithmPage({
  lang,
  categorySlug,
  algorithmSlug,
}: AlgorithmPageProps) {
  const match = getAlgorithm(categorySlug, algorithmSlug);
  if (!match) notFound();

  const { category, algorithm } = match;
  const breadcrumb = breadcrumbJsonLd(
    lang,
    [
      { name: translate(lang, "nav.overview"), path: "/" },
      { name: catName(category.slug, category.name, lang), path: `/${category.slug}` },
      {
        name: algoName(algorithm.slug, algorithm.name, lang),
        path: `/${category.slug}/${algorithm.slug}`,
      },
    ],
    siteUrl
  );

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Workspace
        category={{ name: category.name, slug: category.slug }}
        algorithm={algorithm}
        code={algoCode[algorithm.slug]}
        info={getAlgoInfo(algorithm.slug, lang)}
      />
      <AlgoExplainer
        lang={lang}
        slug={algorithm.slug}
        name={algoName(algorithm.slug, algorithm.name, lang)}
      />
    </>
  );
}
