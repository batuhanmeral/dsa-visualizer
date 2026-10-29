import { test } from "node:test";
import assert from "node:assert/strict";
import { categories } from "../lib/data";
import { breadcrumbJsonLd, jsonLdString, sitemapEntries } from "../lib/seo";

const entries = sitemapEntries(new URL("https://algoritmalar.com"));
test("sitemap lists every page in both languages", () => {
  const n = 1 + categories.length + categories.flatMap((c) => c.algorithms).length;
  assert.equal(entries.length, n * 2);
  assert.ok(entries.some((e) => e.url === "https://algoritmalar.com/sorting/bubble-sort"));
  assert.ok(entries.some((e) => e.url === "https://algoritmalar.com/en/sorting/bubble-sort"));
});
test("every entry links its counterparts and x-default", () => {
  const base = "https://algoritmalar.com";
  for (const e of entries) {
    const l = e.alternates?.languages;
    assert.ok(l?.tr && l.en && l["x-default"], e.url);
    assert.equal(l["x-default"], l.tr);
    assert.ok(l.tr.startsWith(base) && !l.tr.startsWith(`${base}/en`), l.tr);
    assert.ok(l.en === `${base}/en` || l.en.startsWith(`${base}/en/`), l.en);
    assert.ok(e.url === l.tr || e.url === l.en, e.url);
  }
  const home = entries.find((e) => e.url === `${base}/`);
  assert.deepEqual(home?.alternates?.languages, {
    tr: `${base}/`,
    en: `${base}/en`,
    "x-default": `${base}/`,
  });
});
test("json-ld escapes markup", () =>
  assert.ok(!jsonLdString({ name: "</script>" }).includes("</script>")));
test("breadcrumb items use the language prefix", () => {
  const base = new URL("https://algoritmalar.com");
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Sorting", path: "/sorting" },
  ];
  const items = (lang: "tr" | "en") =>
    (breadcrumbJsonLd(lang, crumbs, base) as { itemListElement: { item: string }[] })
      .itemListElement.map((i) => i.item);
  for (const item of items("en"))
    assert.ok(item === `${base.origin}/en` || item.startsWith(`${base.origin}/en/`), item);
  for (const item of items("tr")) assert.ok(!item.startsWith(`${base.origin}/en`), item);
});
test("json-ld round-trips and never contains a raw <", () => {
  const data = { name: "</script><b>", nested: { a: [1, "<"] } };
  const out = jsonLdString(data);
  assert.ok(!out.includes("<"));
  assert.deepEqual(JSON.parse(out), data);
});
