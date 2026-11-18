import { test } from "node:test";
import assert from "node:assert/strict";
import { categories } from "../lib/data";
import { algorithmTitle, homeMetadata, pageMetadata } from "../lib/seo";

test("turkish title carries both names", () =>
  assert.equal(
    algorithmTitle("tr", "bubble-sort", "Bubble Sort"),
    "Kabarcık Sıralaması (Bubble Sort) nedir? Nasıl çalışır?"
  ));
test("identical names are not repeated", () =>
  assert.equal(algorithmTitle("tr", "kmp", "KMP"), "KMP nedir? Nasıl çalışır?"));
test("english title", () =>
  assert.equal(
    algorithmTitle("en", "bubble-sort", "Bubble Sort"),
    "What is Bubble Sort? How does it work?"
  ));
test("every turkish title names the algorithm in English", () => {
  for (const a of categories.flatMap((c) => c.algorithms))
    assert.ok(algorithmTitle("tr", a.slug, a.name).includes(a.name), a.slug);
});
test("home titles have no long dashes", () => {
  for (const lang of ["tr", "en"] as const) {
    const t = homeMetadata(lang).title as { absolute: string };
    assert.doesNotMatch(t.absolute, /[\u2013\u2014]/);
  }
});
test("alternates point at both languages and x-default at turkish", () => {
  const m = pageMetadata("en", "/sorting/bubble-sort", "t", "d");
  assert.equal(m.alternates?.canonical, "/en/sorting/bubble-sort");
  assert.deepEqual(m.alternates?.languages, {
    tr: "/sorting/bubble-sort",
    en: "/en/sorting/bubble-sort",
    "x-default": "/sorting/bubble-sort",
  });
});
