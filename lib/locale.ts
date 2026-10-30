export type Lang = "tr" | "en";
export const LANGS: readonly Lang[] = ["tr", "en"];

const EN_PREFIX = "/en";

/** Turkish lives at the root; only English gets a path prefix. */
export function localePath(lang: Lang, path: string): string {
  if (lang === "tr") return path;
  return path === "/" ? EN_PREFIX : `${EN_PREFIX}${path}`;
}

/** Only a whole `/en` segment counts, so `/english` stays Turkish. */
export function langOfPath(pathname: string): Lang {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)
    ? "en"
    : "tr";
}

export function switchLangPath(
  pathname: string,
  search: string,
  to: Lang
): string {
  const bare =
    langOfPath(pathname) === "en" ? pathname.slice(EN_PREFIX.length) || "/" : pathname;
  return localePath(to, bare) + search;
}
