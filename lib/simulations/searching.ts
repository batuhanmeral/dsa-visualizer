import { makeRecorder } from "./sorting";
import type { SimulationStep } from "./types";

/**
 * Linear Search — walk the array left to right until the target appears.
 * Code line numbers are 0-based and MUST match the C code in lib/data.ts.
 */
export function linearSearchSteps(
  input: number[],
  target = Number.NaN
): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record } = makeRecorder(arr);

  record("info", [], 0, `Scanning ${n} elements for ${target}.`);

  for (let i = 0; i < n; i++) {
    record("probe", [i], 2, `Is arr[${i}] = ${arr[i]} equal to ${target}?`);
    if (arr[i] === target) {
      sorted.add(i);
      record("found", [i], 3, `Match! ${target} is at index ${i}.`);
      return steps;
    }
  }

  record("info", [], 5, `${target} is not in the array — return -1.`);
  return steps;
}

/**
 * Binary Search — halve a sorted window each step. The input is sorted first
 * (mirroring the workspace's `sortedInput` behaviour) so indices line up with
 * what the canvas draws.
 */
export function binarySearchSteps(
  input: number[],
  target = Number.NaN
): SimulationStep[] {
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const { steps, sorted, record } = makeRecorder(arr);

  let lo = 0;
  let hi = n - 1;
  record("info", [], 1, `Searching a sorted array of ${n} for ${target}.`, [lo, hi]);

  while (lo <= hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    record(
      "probe",
      [mid],
      3,
      `Window [${lo}..${hi}] — check the middle arr[${mid}] = ${arr[mid]}.`,
      [lo, hi]
    );
    if (arr[mid] === target) {
      sorted.add(mid);
      record("found", [mid], 5, `Match! ${target} is at index ${mid}.`, [lo, hi]);
      return steps;
    }
    if (arr[mid] < target) {
      lo = mid + 1;
      record(
        "compare",
        [mid],
        7,
        `${arr[mid]} < ${target} — discard the left half.`,
        [lo, hi]
      );
    } else {
      hi = mid - 1;
      record(
        "compare",
        [mid],
        9,
        `${arr[mid]} > ${target} — discard the right half.`,
        [lo, hi]
      );
    }
  }

  record("info", [], 11, `Window is empty — ${target} is not present.`);
  return steps;
}
