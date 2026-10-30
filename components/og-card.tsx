import { ImageResponse } from "next/og";
import { getAlgorithm, getCategory } from "@/lib/data";
import { algoName, catName, catTagline } from "@/lib/content-i18n";
import type { Lang } from "@/lib/locale";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// ImageResponse cannot read CSS variables, so these mirror the tokens in globals.css.
const COLOR = {
  background: "#161619",
  text: "#fafafa",
  muted: "#a1a1aa",
  accent: "#d97757",
  accentText: "#e59172",
  onAccent: "#ffffff",
};

interface OgCardProps {
  title: string;
  subtitle?: string;
  category?: string;
}

/** Lucide `Binary` on an accent box, same mark as the sidebar logo. */
function Glyph() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 72,
        height: 72,
        borderRadius: 20,
        background: COLOR.accent,
      }}
    >
      <svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLOR.onAccent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="14" y="14" width="4" height="6" rx="2" />
        <rect x="6" y="4" width="4" height="6" rx="2" />
        <path d="M6 20h4" />
        <path d="M14 10h4" />
        <path d="M6 14h2v6" />
        <path d="M14 4h2v6" />
      </svg>
    </div>
  );
}

export function ogCard({ title, subtitle, category }: OgCardProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          background: COLOR.background,
          color: COLOR.text,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Glyph />
          <div style={{ fontSize: 40, fontWeight: 700, color: COLOR.accentText }}>
            Algoritmalar
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          {subtitle ? (
            <div style={{ fontSize: 44, color: COLOR.muted }}>{subtitle}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", fontSize: 36, color: COLOR.muted }}>
          {category ?? ""}
        </div>
      </div>
    ),
    OG_SIZE
  );
}

/** Algorithm card: name in the page language, English name underneath on TR. */
export async function algorithmOgImage(
  lang: Lang,
  params: Promise<{ category: string; algorithm: string }>
): Promise<ImageResponse> {
  const { category: categorySlug, algorithm: algorithmSlug } = await params;
  const match = getAlgorithm(categorySlug, algorithmSlug);
  if (!match) throw new Error(`Unknown algorithm ${categorySlug}/${algorithmSlug}`);
  const { category, algorithm } = match;
  const title = algoName(algorithm.slug, algorithm.name, lang);
  return ogCard({
    title,
    subtitle: lang === "tr" && title !== algorithm.name ? algorithm.name : undefined,
    category: catName(category.slug, category.name, lang),
  });
}

export async function categoryOgImage(
  lang: Lang,
  params: Promise<{ category: string }>
): Promise<ImageResponse> {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) throw new Error(`Unknown category ${categorySlug}`);
  return ogCard({
    title: catName(category.slug, category.name, lang),
    subtitle: catTagline(category.slug, category.tagline, lang),
  });
}

export const HOME_OG_TEXT: Record<Lang, { title: string; subtitle: string }> = {
  tr: { title: "Algoritmalar", subtitle: "Veri yapıları ve algoritmaları adım adım izle" },
  en: { title: "Algoritmalar", subtitle: "Data structures and algorithms, step by step" },
};
