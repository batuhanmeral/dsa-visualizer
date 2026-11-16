import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SPLIT_CSS_VAR,
  SPLIT_MIN_CANVAS_PX,
  SPLIT_STORAGE_KEY,
  clampSplit,
  effectiveMinSplit,
  parseStoredSplit,
  splitBootSnippet,
  splitForKey,
  splitFromPointer,
} from "../lib/split-ratio";

test("the ratio stays between 30 and 70", () => {
  assert.equal(clampSplit(10), 30);
  assert.equal(clampSplit(95), 70);
  assert.equal(clampSplit(50), 50);
});

test("a stored ratio falls back to the default unless it is a number", () => {
  assert.equal(parseStoredSplit(null), 65);
  assert.equal(parseStoredSplit("abc"), 65);
  assert.equal(parseStoredSplit(""), 65);
  assert.equal(parseStoredSplit("42"), 42);
  assert.equal(parseStoredSplit("99"), 70);
});

test("arrows step by two within the range, home resets, other keys are ignored", () => {
  assert.equal(splitForKey(65, "ArrowLeft"), 63);
  assert.equal(splitForKey(31, "ArrowLeft"), 30);
  assert.equal(splitForKey(69, "ArrowRight"), 70);
  assert.equal(splitForKey(40, "Home"), 65);
  assert.equal(splitForKey(40, "x"), null);
});

test("the pointer position maps to a share of the container", () => {
  assert.equal(splitFromPointer(500, 100, 1000), 40);
  assert.equal(splitFromPointer(0, 100, 1000), 30);
  assert.equal(splitFromPointer(1100, 100, 1000), 70);
});

test("the canvas floor raises the minimum share on narrow grids", () => {
  assert.equal(SPLIT_MIN_CANVAS_PX, 340);
  assert.equal(effectiveMinSplit(1700), 30);
  assert.equal(effectiveMinSplit(1134), 30);
  assert.equal(effectiveMinSplit(1133), 31);
  assert.equal(effectiveMinSplit(680), 50);
  assert.equal(effectiveMinSplit(673), 51);
});

test("the floor never pushes the minimum past the maximum", () => {
  assert.equal(effectiveMinSplit(400), 70);
  assert.equal(effectiveMinSplit(0), 70);
});

// Runs the boot snippet against a fake page and returns what it set.
function runBoot(stored: string | null | Error) {
  const calls: [string, string][] = [];
  const localStorage = {
    getItem(key: string) {
      if (stored instanceof Error) throw stored;
      return key === SPLIT_STORAGE_KEY ? stored : null;
    },
  };
  const document = {
    documentElement: {
      style: { setProperty: (name: string, v: string) => calls.push([name, v]) },
    },
  };
  new Function("localStorage", "document", splitBootSnippet())(localStorage, document);
  return calls;
}

test("the boot snippet applies the stored ratio before paint", () => {
  assert.deepEqual(runBoot("42"), [[SPLIT_CSS_VAR, "42"]]);
  assert.deepEqual(runBoot("abc"), [[SPLIT_CSS_VAR, "65"]]);
});

test("the boot snippet survives blocked storage", () => {
  assert.doesNotThrow(() => runBoot(new Error("SecurityError")));
});

test("the boot snippet reads a stored value exactly like parseStoredSplit", () => {
  const raws = [null, "", " ", "abc", "42", "99", "10", "42.6", " 50 ", "Infinity", "1e2", "-5"];
  for (const raw of raws) {
    assert.deepEqual(runBoot(raw), [[SPLIT_CSS_VAR, String(parseStoredSplit(raw))]], `raw ${JSON.stringify(raw)}`);
  }
});
