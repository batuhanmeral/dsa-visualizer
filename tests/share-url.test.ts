import { test } from "node:test";
import assert from "node:assert/strict";
import { shareQuery } from "../lib/share-url";

// URLSearchParams escapes commas as %2C (existing behavior).
test("default state writes no query", () =>
  assert.equal(shareQuery({ values: [3, 1], step: 0 }, { values: [3, 1] }), ""));
test("default state with a target writes no query", () =>
  assert.equal(
    shareQuery({ values: [3, 1], target: 1, step: 0 }, { values: [3, 1], target: 1 }),
    ""
  ));
test("a moved step is shareable", () =>
  assert.equal(
    shareQuery({ values: [3, 1], step: 2 }, { values: [3, 1] }),
    "input=3%2C1&step=2"
  ));
test("custom input and target are kept", () =>
  assert.equal(
    shareQuery({ values: [5], target: 5, step: 0 }, { values: [3, 1], target: 1 }),
    "input=5&target=5&step=0"
  ));
