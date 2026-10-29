import type { Metadata, MetadataRoute } from "next";
import { algoName } from "./content-i18n";
import { categories } from "./data";
import { LANGS, localePath, type Lang } from "./locale";
import { translate } from "./translate";

const OG_LOCALE: Record<Lang, string> = { tr: "tr_TR", en: "en_US" };

const HOME_TITLE: Record<Lang, string> = {
  tr: "Algoritmalar — Veri Yapıları ve Algoritmaları Adım Adım İzle",
  en: "Algoritmalar — Data Structures & Algorithms, Step by Step",
};

/** Turkish titles carry both names so English searches ("bubble sort") still match. */
export function algorithmTitle(lang: Lang, slug: string, enName: string): string {
  if (lang === "en") return `${enName}: How It Works`;
  const trName = algoName(slug, enName, "tr");
  const names =
    trName.toLowerCase() === enName.toLowerCase()
      ? trName
      : `${trName} (${enName})`;
  return `${names}: Nasıl Çalışır?`;
}

export function pageMetadata(
  lang: Lang,
  path: string,
  title: string | { absolute: string },
  description: string
): Metadata {
  const canonical = localePath(lang, path);
  const languages: Record<string, string> = Object.fromEntries(
    LANGS.map((l) => [l, localePath(l, path)])
  );
  languages["x-default"] = localePath("tr", path);
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: typeof title === "string" ? title : title.absolute,
      description,
      url: canonical,
      locale: OG_LOCALE[lang],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export function homeMetadata(lang: Lang): Metadata {
  return pageMetadata(
    lang,
    "/",
    { absolute: HOME_TITLE[lang] },
    translate(lang, "home.desc")
  );
}

/** Every page in both languages; each entry links its counterpart. */
export function sitemapEntries(base: URL): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...categories.flatMap((c) => [
      `/${c.slug}`,
      ...c.algorithms.map((a) => `/${c.slug}/${a.slug}`),
    ]),
  ];
  const abs = (lang: Lang, path: string) =>
    new URL(localePath(lang, path), base).href;
  return paths.flatMap((path) => {
    const languages = {
      tr: abs("tr", path),
      en: abs("en", path),
      "x-default": abs("tr", path),
    };
    return LANGS.map((lang) => ({
      url: languages[lang],
      alternates: { languages },
    }));
  });
}

export function breadcrumbJsonLd(
  lang: Lang,
  crumbs: { name: string; path: string }[],
  base: URL
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: new URL(localePath(lang, crumb.path), base).href,
    })),
  };
}

export function websiteJsonLd(lang: Lang, base: URL): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Algoritmalar",
    url: new URL(localePath(lang, "/"), base).href,
    inLanguage: lang,
  };
}

/** `<` is escaped so data can never close the script tag. */
export function jsonLdString(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
