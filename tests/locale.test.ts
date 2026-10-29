import { test } from "node:test";
import assert from "node:assert/strict";
import { langOfPath, localePath, switchLangPath } from "../lib/locale";

test("localePath prefixes only English", () => {
  assert.equal(localePath("tr", "/"), "/");
  assert.equal(localePath("tr", "/sorting/bubble-sort"), "/sorting/bubble-sort");
  assert.equal(localePath("en", "/"), "/en");
  assert.equal(localePath("en", "/sorting"), "/en/sorting");
});
test("switchLangPath maps both ways and keeps the query", () => {
  assert.equal(switchLangPath("/sorting/bubble-sort", "?input=5,3&step=2", "en"),
    "/en/sorting/bubble-sort?input=5,3&step=2");
  assert.equal(switchLangPath("/en/sorting/bubble-sort", "?input=5,3&step=2", "tr"),
    "/sorting/bubble-sort?input=5,3&step=2");
  assert.equal(switchLangPath("/en", "", "tr"), "/");
  assert.equal(switchLangPath("/", "", "en"), "/en");
  assert.equal(switchLangPath("/en/sorting", "", "en"), "/en/sorting");
});
test("only a whole /en segment counts as English", () => {
  assert.equal(langOfPath("/en"), "en");
  assert.equal(langOfPath("/en/graphs"), "en");
  assert.equal(langOfPath("/english"), "tr");
  assert.equal(langOfPath("/en-us/x"), "tr");
  assert.equal(switchLangPath("/english", "", "en"), "/en/english");
});
