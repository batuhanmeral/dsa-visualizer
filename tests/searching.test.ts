import { test } from "node:test";
import assert from "node:assert/strict";
import {
  binarySearchSteps,
  interpolationSearchSteps,
  jumpSearchSteps,
  linearSearchSteps,
} from "../lib/simulations/searching";
import { arrayCases, ascending } from "./helpers";

/** Searches that sort the input first, so reported indices refer to that order. */
const engines = [
  ["linear-search", linearSearchSteps, false],
  ["binary-search", binarySearchSteps, true],
  ["jump-search", jumpSearchSteps, true],
  ["interpolation-search", interpolationSearchSteps, true],
] as const;

for (const [name, run, sortsInput] of engines) {
  test(`${name} finds a value exactly when it is present`, () => {
    for (const input of arrayCases()) {
      if (input.length === 0) continue;
      const view = sortsInput ? ascending(input) : [...input];
      // Every value in the array, plus misses just outside and well outside it.
      const targets = new Set([
        ...view,
        view[0] - 1,
        view[view.length - 1] + 1,
        1000,
        -5,
        0,
      ]);
      for (const target of targets) {
        const steps = run([...input], target);
        const last = steps.at(-1)!;
        const found = last.kind === "found";
        assert.equal(
          found,
          view.includes(target),
          `${name}: target ${target} in [${view}] — reported found=${found}`
        );
        if (found) {
          const idx = last.highlights[0];
          assert.equal(
            view[idx],
            target,
            `${name}: reported index ${idx} holds ${view[idx]}, not ${target}`
          );
          assert.deepEqual(last.sorted, [idx], `${name} did not mark the hit`);
        }
      }
    }
  });

  test(`${name} never reads outside the array`, () => {
    for (const input of arrayCases()) {
      if (input.length === 0) continue;
      for (const target of [input[0], 1000, -1]) {
        for (const step of run([...input], target))
          for (const h of step.highlights)
            assert.ok(
              h >= 0 && h < input.length,
              `${name} highlighted index ${h} of a ${input.length}-element array`
            );
      }
    }
  });
}

test("searching an empty array is handled without crashing", () => {
  for (const [name, run] of engines) {
    const steps = run([], 5);
    assert.ok(steps.length > 0, `${name} said nothing about an empty array`);
    assert.ok(
      steps.every((s) => s.kind !== "found"),
      `${name} claims to have found a value in an empty array`
    );
  }
});

test("jump search stops instead of running past the end", () => {
  // The block loop probes arr[min(step, n) - 1]; a target above every value
  // used to be the case most likely to walk off the array.
  const steps = jumpSearchSteps([1, 2, 3, 4, 5], 100);
  assert.equal(steps.at(-1)!.note.k, "n.jump.pastEnd");
});

test("interpolation search survives a window where every value is equal", () => {
  // arr[hi] - arr[lo] is the interpolation denominator: 0 here.
  const steps = interpolationSearchSteps([7, 7, 7, 7], 7);
  assert.equal(steps.at(-1)!.kind, "found");
  assert.ok(steps.every((s) => Number.isFinite(s.highlights[0] ?? 0)));
});
