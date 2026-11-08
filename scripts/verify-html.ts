/**
 * Post-build check: every algorithm page's prerendered HTML carries the About
 * tab's explainer, and the tab panel holding it is not hidden.
 *
 * Usage: `npm run build && npm run verify:html`. Exits 1 and lists the gaps.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getAlgoInfo } from "../lib/algo-info";
import { algoName, algoSummary } from "../lib/content-i18n";
import { categories } from "../lib/data";
import type { Lang } from "../lib/locale";
import { translate } from "../lib/translate";

const APP_DIR = join(import.meta.dirname, "..", ".next", "server", "app");
const LANGS: { lang: Lang; prefix: string }[] = [
  { lang: "tr", prefix: "" },
  { lang: "en", prefix: "en" },
];
const TABPANEL_OPEN = '<div role="tabpanel"';

// Same escaping React applies to text children.
const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const isHidden = (openTag: string) => /\shidden(?:[\s=>]|$)/.test(openTag);

/** The tabpanel (open tag + end of its content) that contains `at`, if any. */
function panelAround(html: string, at: number): { openTag: string } | null {
  const start = html.lastIndexOf(TABPANEL_OPEN, at);
  if (start === -1) return null;
  // The About panel is followed by the Code panel; the section closes after the last one.
  const ends = [html.indexOf(TABPANEL_OPEN, start + 1), html.indexOf("</section>", start)]
    .filter((i) => i !== -1);
  if (ends.length > 0 && at > Math.min(...ends)) return null;
  return { openTag: html.slice(start, html.indexOf(">", start)) };
}

/** Why `text` is not visible explainer copy in `html`, or null when it is. */
function problemWith(html: string, label: string, text: string): string | null {
  const needle = escapeHtml(text);
  let inHiddenPanel = false;
  // The summary also sits in the meta description and the RSC payload, so check every hit.
  for (let at = html.indexOf(needle); at !== -1; at = html.indexOf(needle, at + 1)) {
    const panel = panelAround(html, at);
    if (!panel) continue;
    if (!isHidden(panel.openTag)) return null;
    inHiddenPanel = true;
  }
  if (inHiddenPanel) return `${label} in a hidden tabpanel`;
  return html.includes(needle) ? `${label} not inside a tabpanel` : `${label} missing`;
}

function pageProblems(lang: Lang, file: string, slug: string, enName: string, enSummary: string): string[] {
  const info = getAlgoInfo(slug, lang);
  if (!info) return [];
  let html: string;
  try {
    html = readFileSync(file, "utf8");
  } catch {
    return ["HTML file missing"];
  }
  const expected = [
    ["h2", translate(lang, "explainer.title", { name: algoName(slug, enName, lang) })],
    ["how", info.how],
    ["summary", algoSummary(slug, enSummary, lang)],
  ] as const;
  return expected
    .map(([label, text]) => problemWith(html, label, text))
    .filter((problem): problem is string => problem !== null);
}

const failures: string[] = [];
let checked = 0;
for (const category of categories)
  for (const algorithm of category.algorithms)
    for (const { lang, prefix } of LANGS) {
      const file = join(APP_DIR, prefix, category.slug, `${algorithm.slug}.html`);
      checked++;
      for (const problem of pageProblems(lang, file, algorithm.slug, algorithm.name, algorithm.summary))
        failures.push(`${lang} /${category.slug}/${algorithm.slug}: ${problem}`);
    }

if (failures.length > 0) {
  console.error(`verify:html: ${failures.length} problem(s) in ${checked} pages`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log(`verify:html: ${checked} pages OK`);
