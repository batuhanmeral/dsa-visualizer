import { test } from "node:test";
import assert from "node:assert/strict";
import { categories } from "../lib/data";
import { algorithmTitle, pageMetadata } from "../lib/seo";

test("turkish title carries both names", () =>
  assert.equal(
    algorithmTitle("tr", "bubble-sort", "Bubble Sort"),
    "Kabarcık Sıralaması (Bubble Sort): Nasıl Çalışır?"
  ));
test("identical names are not repeated", () =>
  assert.equal(algorithmTitle("tr", "kmp", "KMP"), "KMP: Nasıl Çalışır?"));
test("english title", () =>
  assert.equal(
    algorithmTitle("en", "bubble-sort", "Bubble Sort"),
    "Bubble Sort: How It Works"
  ));
test("every turkish title names the algorithm in English", () => {
  for (const a of categories.flatMap((c) => c.algorithms))
    assert.ok(algorithmTitle("tr", a.slug, a.name).includes(a.name), a.slug);
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
