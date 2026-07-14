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
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { i: 0 };
  setWatch(w);

  record("info", [], 0, `Scanning ${n} elements for ${target}.`);

  for (let i = 0; i < n; i++) {
    w.i = i;
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
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { lo: 0, hi: n - 1, mid: 0 };
  setWatch(w);

  let lo = 0;
  let hi = n - 1;
  record("info", [], 1, `Searching a sorted array of ${n} for ${target}.`, [lo, hi]);

  while (lo <= hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    w.lo = lo;
    w.hi = hi;
    w.mid = mid;
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
      w.lo = lo;
      record(
        "compare",
        [mid],
        7,
        `${arr[mid]} < ${target} — discard the left half.`,
        [lo, hi]
      );
    } else {
      hi = mid - 1;
      w.hi = hi;
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

/**
 * Jump Search — on a sorted array, leap ahead in blocks of √n until the block
 * that could hold the target is found, then scan it linearly. Input is sorted
 * first so indices match the canvas.
 */
export function jumpSearchSteps(
  input: number[],
  target = Number.NaN
): SimulationStep[] {
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { step: 0, prev: 0 };
  setWatch(w);

  if (n === 0) {
    record("info", [], 16, "Empty array — nothing to search.");
    return steps;
  }

  const jump = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;
  let step = jump;
  w.step = step;
  record("info", [], 1, `Sorted array of ${n} — jump size = ⌊√${n}⌋ = ${jump}.`, [0, n - 1]);

  while (arr[Math.min(step, n) - 1] < target) {
    const probe = Math.min(step, n) - 1;
    record(
      "probe",
      [probe],
      3,
      `Block end arr[${probe}] = ${arr[probe]} < ${target} — jump past this block.`,
      [prev, probe]
    );
    prev = step;
    step += jump;
    w.prev = prev;
    w.step = step;
    if (prev >= n) {
      record("info", [], 7, `Jumped past the end — ${target} is not present.`);
      return steps;
    }
  }

  const blockEnd = Math.min(step, n) - 1;
  record(
    "info",
    [],
    9,
    `Target may be in block [${prev}..${blockEnd}] — scan it linearly.`,
    [prev, blockEnd]
  );

  while (arr[prev] < target) {
    record(
      "probe",
      [prev],
      9,
      `arr[${prev}] = ${arr[prev]} < ${target} — step forward.`,
      [prev, blockEnd]
    );
    prev++;
    w.prev = prev;
    if (prev === Math.min(step, n)) {
      record("info", [], 12, `Reached the block end — ${target} is not present.`);
      return steps;
    }
  }

  if (arr[prev] === target) {
    sorted.add(prev);
    record("found", [prev], 15, `Match! ${target} is at index ${prev}.`, [prev, blockEnd]);
    return steps;
  }

  record("info", [], 16, `${target} is not present — return -1.`);
  return steps;
}

/**
 * Interpolation Search — like binary search, but estimates the probe position
 * from the target's value relative to the window's endpoints. Best on
 * uniformly distributed sorted data. Input is sorted first.
 */
export function interpolationSearchSteps(
  input: number[],
  target = Number.NaN
): SimulationStep[] {
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { lo: 0, hi: n - 1, pos: 0 };
  setWatch(w);

  let lo = 0;
  let hi = n - 1;
  record("info", [], 1, `Searching a sorted array of ${n} for ${target}.`, [lo, hi]);

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    w.lo = lo;
    w.hi = hi;
    if (lo === hi) {
      w.pos = lo;
      record("probe", [lo], 4, `Window is a single cell — check arr[${lo}] = ${arr[lo]}.`, [lo, hi]);
      if (arr[lo] === target) {
        sorted.add(lo);
        record("found", [lo], 4, `Match! ${target} is at index ${lo}.`, [lo, hi]);
      } else {
        record("info", [], 5, `${arr[lo]} ≠ ${target} — not present.`);
      }
      return steps;
    }

    if (arr[hi] === arr[lo]) {
      // Flat window: every value in [lo..hi] is equal, so the interpolation
      // denominator would be 0. The loop guard already proved target is in
      // range, hence it equals arr[lo].
      w.pos = lo;
      sorted.add(lo);
      record(
        "found",
        [lo],
        8,
        `All values in [${lo}..${hi}] equal ${arr[lo]} — match at index ${lo}.`,
        [lo, hi]
      );
      return steps;
    }

    const pos =
      lo + Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));
    w.pos = pos;
    record(
      "probe",
      [pos],
      9,
      `Estimate pos = ${pos} from value ${target} in [${arr[lo]}..${arr[hi]}].`,
      [lo, hi]
    );
    if (arr[pos] === target) {
      sorted.add(pos);
      record("found", [pos], 12, `Match! ${target} is at index ${pos}.`, [lo, hi]);
      return steps;
    }
    if (arr[pos] < target) {
      lo = pos + 1;
      w.lo = lo;
      record("compare", [pos], 14, `${arr[pos]} < ${target} — search the right part.`, [lo, hi]);
    } else {
      hi = pos - 1;
      w.hi = hi;
      record("compare", [pos], 16, `${arr[pos]} > ${target} — search the left part.`, [lo, hi]);
    }
  }

  record("info", [], 18, `${target} is outside the remaining window — not present.`);
  return steps;
}
