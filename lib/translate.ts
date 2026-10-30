import { en, tr, type TKey } from "./dictionaries";
import type { Lang } from "./locale";

export type Vars = Record<string, string | number>;

/** Substitute `{name}` placeholders from a vars map. */
export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

/** Translate a key for a language, English as fallback, then the key itself. */
export function translate(lang: Lang, key: TKey, vars?: Vars): string {
  const template = (lang === "tr" ? tr[key] : undefined) ?? en[key] ?? key;
  return interpolate(template, vars);
}
