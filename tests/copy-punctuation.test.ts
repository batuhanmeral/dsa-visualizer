import { test } from "node:test";
import assert from "node:assert/strict";
import { algoCode } from "../lib/algo-code";
import { getAlgoInfo } from "../lib/algo-info";
import { algoName, algoSummary, catName, catTagline } from "../lib/content-i18n";
import * as content from "../lib/content-i18n";
import { categories } from "../lib/data";
import { en, tr } from "../lib/dictionaries";
import { stepNotesEn, stepNotesTr } from "../lib/step-notes/index";

function collectStrings(value: unknown, path: string): Array<[string, string]> {
  if (typeof value === "string") return [[path, value]];
  if (typeof value !== "object" || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    collectStrings(child, `${path}.${key}`),
  );
}

const algorithms = categories.flatMap((category) => category.algorithms);
const sources = {
  "dictionary.en": en,
  "dictionary.tr": tr,
  "content-i18n": {
    ...content,
    categories: Object.fromEntries(categories.map((category) => [
      category.slug,
      {
        name: catName(category.slug, category.name, "tr"),
        tagline: catTagline(category.slug, category.tagline, "tr"),
      },
    ])),
    algorithms: Object.fromEntries(algorithms.map((algorithm) => [
      algorithm.slug,
      {
        name: algoName(algorithm.slug, algorithm.name, "tr"),
        summary: algoSummary(algorithm.slug, algorithm.summary, "tr"),
      },
    ])),
  },
  categories,
  "algo-info": Object.fromEntries(algorithms.flatMap(({ slug }) =>
    (["tr", "en"] as const).map((lang) => [`${slug}.${lang}`, getAlgoInfo(slug, lang)]),
  )),
  "step-notes.en": stepNotesEn,
  "step-notes.tr": stepNotesTr,
  "algo-code": Object.fromEntries(Object.entries(algoCode).map(([slug, { code, pseudo }]) =>
    [slug, { code, pseudo }],
  )),
};
const stringsBySource = Object.entries(sources).map(([name, value]) =>
  [name, collectStrings(value, name)] as const,
);
const all = stringsBySource.flatMap(([, strings]) => strings);

test("user-facing copy has no em or en dashes", () => {
  const bad = all.filter(([, s]) => /[–—]/.test(s));
  assert.deepEqual(bad.map(([p, s]) => `${p}: ${s.slice(0, 60)}`), []);
});

test("the scan reaches every source", () => {
  for (const [name, strings] of stringsBySource) {
    assert.ok(strings.length > 0, `${name} yielded no strings`);
  }
});
