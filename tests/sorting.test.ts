import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bubbleSortSteps,
  bucketSortSteps,
  countingSortSteps,
  heapSortSteps,
  insertionSortSteps,
  mergeSortSteps,
  quickSortSteps,
  radixSortSteps,
  selectionSortSteps,
  shellSortSteps,
} from "../lib/simulations/sorting";
import type { SimulationStep } from "../lib/simulations/types";
import { holdsValue } from "../lib/simulations";
import { arrayCases, ascending, bag } from "./helpers";

const engines = {
  "bubble-sort": bubbleSortSteps,
  "selection-sort": selectionSortSteps,
  "insertion-sort": insertionSortSteps,
  "shell-sort": shellSortSteps,
  "merge-sort": mergeSortSteps,
  "quick-sort": quickSortSteps,
  "heap-sort": heapSortSteps,
  "radix-sort": radixSortSteps,
  "counting-sort": countingSortSteps,
  "bucket-sort": bucketSortSteps,
};

/**
 * Sorts that copy through auxiliary storage: a merge buffer, a counting
 * output array, buckets. Their steps carry that storage as `aux` rows.
 */
const outOfPlace = new Set(["merge-sort", "counting-sort", "radix-sort", "bucket-sort"]);

/**
 * Every value a step *displays*, wherever it is drawn.
 *
 * Insertion and shell sort lift a value into a local `key`, so mid-shift the
 * array holds a stale duplicate at `held.hole`; the held value stands in for
 * it. Out-of-place sorts move values into `aux` buffers and leave `holes`
 * behind in the main array; a hole is a stale copy, the buffer holds the real
 * value. With both accounted for, every snapshot is a permutation of the input.
 */
function displayed(step: SimulationStep): number[] {
  const a = [...step.array];
  if (step.held) a[step.held.hole] = step.held.value;
  const holes = new Set(step.holes ?? []);
  const main = a.filter((_, i) => !holes.has(i));
  const buffered = (step.aux ?? []).flatMap((row) =>
    row.cells.filter((c): c is number => c !== null)
  );
  return [...main, ...buffered];
}

for (const [name, run] of Object.entries(engines)) {
  test(`${name} sorts every input`, () => {
    for (const input of arrayCases()) {
      const steps = run([...input]);
      if (input.length === 0) continue;
      const last = steps.at(-1)!;
      assert.deepEqual(
        last.array,
        ascending(input),
        `${name} failed on [${input}]`
      );
      assert.equal(last.kind, "done", `${name} did not finish on [${input}]`);
    }
  });

  test(`${name} never invents or loses a value`, () => {
    for (const input of arrayCases()) {
      if (input.length === 0) continue;
      const want = bag(input);
      for (const [i, step] of run([...input]).entries())
        assert.equal(
          bag(displayed(step)),
          want,
          `${name} step ${i} is not a permutation of [${input}]`
        );
    }
  });

  test(`${name} only locks indices that hold their final value`, () => {
    for (const input of arrayCases()) {
      if (input.length === 0) continue;
      const final = ascending(input);
      for (const [i, step] of run([...input]).entries())
        for (const idx of step.sorted) {
          assert.ok(
            idx >= 0 && idx < input.length,
            `${name} step ${i}: locked index ${idx} is out of range`
          );
          assert.equal(
            step.array[idx],
            final[idx],
            `${name} step ${i}: index ${idx} is marked sorted but holds ${step.array[idx]}, not ${final[idx]}`
          );
        }
    }
  });
}

test("an empty array is handled without crashing", () => {
  for (const [name, run] of Object.entries(engines)) {
    const steps = run([]);
    for (const s of steps) {
      assert.deepEqual(s.array, [], `${name} invented elements for []`);
      assert.deepEqual(s.sorted, [], `${name} locked an index of an empty array`);
    }
  }
});

test("every locked index of an out-of-place sort holds its final value", () => {
  // The weaker guarantee these sorts do make: whatever they mark as settled is
  // settled, even while the rest of the array is mid-copy.
  for (const [name, run] of Object.entries(engines)) {
    if (!outOfPlace.has(name)) continue;
    for (const input of arrayCases()) {
      if (input.length === 0) continue;
      const final = ascending(input);
      for (const step of run([...input]))
        for (const idx of step.sorted)
          assert.equal(step.array[idx], final[idx], `${name} on [${input}]`);
    }
  }
});

test("out-of-place sorts draw their buffer, and in-place sorts have none", () => {
  for (const [name, run] of Object.entries(engines)) {
    const steps = run([23, 7, 41, 15, 3, 34, 9, 28]);
    const buffered = steps.some((s) => (s.aux ?? []).length > 0);
    assert.equal(buffered, outOfPlace.has(name), `${name} aux rows`);
    for (const [i, s] of steps.entries()) {
      for (const h of s.holes ?? []) {
        assert.ok(!s.sorted.includes(h), `${name} step ${i}: hole ${h} is marked sorted`);
        assert.ok(h >= 0 && h < s.array.length, `${name} step ${i}: hole ${h} out of range`);
      }
      for (const row of s.aux ?? [])
        for (const c of row.active ?? [])
          assert.ok(c >= 0 && c < row.cells.length, `${name} step ${i}: ${row.label}[${c}]`);
    }
    assert.deepEqual(steps.at(-1)!.holes ?? [], [], `${name} ends with holes`);
    assert.deepEqual(steps.at(-1)!.aux ?? [], [], `${name} ends with a buffer`);
  }
});

test("merge sort copies each half into L and R before merging", () => {
  const steps = mergeSortSteps([4, 3, 2, 1]);
  const first = steps.find((s) => (s.aux ?? []).length > 0)!;
  assert.deepEqual(first.aux!.map((r) => r.label), ["L"]);
  assert.equal(first.codeLine, 3);
  const both = steps.find((s) => (s.aux ?? []).length === 2)!;
  assert.deepEqual(both.aux!.map((r) => r.label), ["L", "R"]);
  assert.equal(both.codeLine, 4);
});

test("bucket sort shows one row per bucket", () => {
  const steps = bucketSortSteps([23, 7, 41, 15, 3, 34, 9, 28]);
  const rows = steps.find((s) => (s.aux ?? []).length > 0)!.aux!;
  assert.deepEqual(
    rows.map((r) => r.label),
    ["bucket[0]", "bucket[1]", "bucket[2]", "bucket[3]", "bucket[4]"]
  );
});

test("counting and radix sort animate the stable placement pass", () => {
  // The backward walk over the input is the only reason either sort is stable;
  // it used to run silently, so the defining line was never highlighted.
  const input = [23, 7, 41, 15, 3, 34, 9, 28];
  assert.ok(
    countingSortSteps(input).some((s) => s.note.k === "n.counting.stable"),
    "counting sort never explains its stable pass"
  );
  assert.ok(
    radixSortSteps(input).some((s) => s.note.k === "n.radix.stable"),
    "radix sort never explains its stable pass"
  );
});

test("insertion and shell sort report the value they are holding", () => {
  for (const run of [insertionSortSteps, shellSortSteps]) {
    const steps = run([5, 2, 9, 1]);
    const shifts = steps.filter((s) => s.kind === "shift");
    assert.ok(shifts.length > 0, "expected at least one shift");
    for (const s of shifts)
      assert.ok(
        s.held !== undefined,
        "a shift leaves a hole, so the held key must be reported"
      );
  }
});

test("holdsValue names exactly the engines whose steps lift a value", () => {
  for (const [slug, engine] of Object.entries(engines)) {
    const lifts = arrayCases().some((input) => engine(input).some((s) => s.held));
    assert.equal(holdsValue(slug), lifts, slug);
  }
});
