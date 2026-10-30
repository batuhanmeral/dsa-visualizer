import { test } from "node:test";
import assert from "node:assert/strict";
import { categories } from "../lib/data";
import { en, tr } from "../lib/dictionaries";
import { algoName, algoSummary, catName, catTagline } from "../lib/content-i18n";
import { getAlgoInfo } from "../lib/algo-info";

const MISSING = "__missing__";

test("tr dictionary covers every en key", () => {
  for (const key of Object.keys(en))
    assert.ok(key in tr, `missing tr key: ${key}`);
});

test("content-i18n covers every category and algorithm", () => {
  for (const c of categories) {
    assert.notEqual(catName(c.slug, MISSING, "tr"), MISSING, c.slug);
    assert.notEqual(catTagline(c.slug, MISSING, "tr"), MISSING, c.slug);
    for (const a of c.algorithms) {
      assert.notEqual(algoName(a.slug, MISSING, "tr"), MISSING, a.slug);
      assert.notEqual(algoSummary(a.slug, MISSING, "tr"), MISSING, a.slug);
    }
  }
});

test("turkish algo info covers every slug that has english info", () => {
  for (const a of categories.flatMap((c) => c.algorithms))
    if (getAlgoInfo(a.slug, "en"))
      assert.ok(getAlgoInfo(a.slug, "tr"), a.slug);
});
