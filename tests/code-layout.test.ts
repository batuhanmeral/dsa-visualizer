import { test } from "node:test";
import assert from "node:assert/strict";
import { algoCode } from "../lib/algo-code";
import { collapseCommentPadding, leadingIndent } from "../lib/code-layout";

test("leadingIndent counts leading spaces", () => {
  assert.equal(leadingIndent("    x"), 4);
  assert.equal(leadingIndent("x"), 0);
  assert.equal(leadingIndent(""), 0);
});

test("collapseCommentPadding shrinks the gap before a trailing remark to two spaces", () => {
  assert.equal(
    collapseCommentPadding("        for v ← 0 to V-1                 ▸ nearest unvisited", "pseudo"),
    "        for v ← 0 to V-1  ▸ nearest unvisited"
  );
  assert.equal(
    collapseCommentPadding("    int top;          /* -1 when empty */", "c"),
    "    int top;  /* -1 when empty */"
  );
});

test("collapseCommentPadding leaves full-line, single-space and wrong-language remarks alone", () => {
  assert.equal(collapseCommentPadding("/* full line */", "c"), "/* full line */");
  assert.equal(collapseCommentPadding("    x; // y", "c"), "    x; // y");
  assert.equal(collapseCommentPadding("a ▸ b", "c"), "a ▸ b");
});

test("collapseCommentPadding only ever changes whitespace in the real snippets", () => {
  const strip = (s: string) => s.replace(/\s/g, "");
  for (const [slug, { code, pseudo }] of Object.entries(algoCode)) {
    for (const [lang, text] of [["c", code], ["pseudo", pseudo]] as const) {
      for (const line of text.split("\n")) {
        assert.equal(strip(collapseCommentPadding(line, lang)), strip(line), `${slug} ${lang}: ${line}`);
      }
    }
  }
});
