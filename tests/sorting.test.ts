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
 * Sorts that rearrange the array in place. Their every snapshot is a genuine
 * permutation of the input (once a held key is accounted for).
 *
 * The others copy through auxiliary storage — a merge buffer, a counting
 * output array, buckets — and the canvas only draws the main array, so while
 * a copy-back is half finished the display legitimately shows a value twice.
 * Those are checked on their result and their locked indices instead.
 */
const inPlace = new Set([
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "shell-sort",
  "quick-sort",
  "heap-sort",
]);

/**
 * The array a step *displays*. Insertion and shell sort lift a value into a
 * local `key`, so mid-shift the array legitimately holds a stale duplicate at
 * `held.hole`; substituting the held value back makes every snapshot a true
 * permutation of the input.
 */
function displayed(step: SimulationStep): number[] {
  if (!step.held) return step.array;
  const a = [...step.array];
  a[step.held.hole] = step.held.value;
  return a;
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

  test(`${name} never invents or loses a value`, { skip: !inPlace.has(name) }, () => {
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
    if (inPlace.has(name)) continue;
    for (const input of arrayCases()) {
      if (input.length === 0) continue;
      const final = ascending(input);
      for (const step of run([...input]))
        for (const idx of step.sorted)
          assert.equal(step.array[idx], final[idx], `${name} on [${input}]`);
    }
  }
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
