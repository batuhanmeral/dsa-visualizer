import { msg } from "./note";
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

  record("info", [], 0, msg("n.linear.start", { n, target }));

  for (let i = 0; i < n; i++) {
    w.i = i;
    record("probe", [i], 2, msg("n.linear.probe", { index: i, value: arr[i], target }));
    if (arr[i] === target) {
      sorted.add(i);
      record("found", [i], 3, msg("n.linear.match", { target, index: i }));
      return steps;
    }
  }

  record("info", [], 5, msg("n.linear.absent", { target }));
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
  record("info", [], 1, msg("n.binary.start", { n, target }), [lo, hi]);

  while (lo <= hi) {
    const mid = Math.floor(lo + (hi - lo) / 2);
    w.lo = lo;
    w.hi = hi;
    w.mid = mid;
    record(
      "probe",
      [mid],
      3,
      msg("n.binary.probe", { lo, hi, mid, value: arr[mid] }),
      [lo, hi]
    );
    if (arr[mid] === target) {
      sorted.add(mid);
      record("found", [mid], 5, msg("n.binary.match", { target, index: mid }), [lo, hi]);
      return steps;
    }
    if (arr[mid] < target) {
      lo = mid + 1;
      w.lo = lo;
      record("compare", [mid], 7, msg("n.binary.right", { value: arr[mid], target }), [
        lo,
        hi,
      ]);
    } else {
      hi = mid - 1;
      w.hi = hi;
      record("compare", [mid], 9, msg("n.binary.left", { value: arr[mid], target }), [
        lo,
        hi,
      ]);
    }
  }

  record("info", [], 11, msg("n.binary.empty", { target }));
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
    record("info", [], 16, msg("n.jump.empty"));
    return steps;
  }

  const jump = Math.max(1, Math.floor(Math.sqrt(n)));
  let prev = 0;
  let step = jump;
  w.step = step;
  record("info", [], 1, msg("n.jump.start", { n, jump }), [0, n - 1]);

  while (arr[Math.min(step, n) - 1] < target) {
    const probe = Math.min(step, n) - 1;
    record(
      "probe",
      [probe],
      3,
      msg("n.jump.blockEnd", { index: probe, value: arr[probe], target }),
      [prev, probe]
    );
    prev = step;
    step += jump;
    w.prev = prev;
    w.step = step;
    if (prev >= n) {
      record("info", [], 7, msg("n.jump.pastEnd", { target }));
      return steps;
    }
  }

  const blockEnd = Math.min(step, n) - 1;
  record("info", [], 9, msg("n.jump.scanBlock", { lo: prev, hi: blockEnd }), [
    prev,
    blockEnd,
  ]);

  while (arr[prev] < target) {
    record(
      "probe",
      [prev],
      9,
      msg("n.jump.step", { index: prev, value: arr[prev], target }),
      [prev, blockEnd]
    );
    prev++;
    w.prev = prev;
    if (prev === Math.min(step, n)) {
      record("info", [], 12, msg("n.jump.blockDone", { target }));
      return steps;
    }
  }

  if (arr[prev] === target) {
    sorted.add(prev);
    record("found", [prev], 15, msg("n.jump.match", { target, index: prev }), [
      prev,
      blockEnd,
    ]);
    return steps;
  }

  record("info", [], 16, msg("n.jump.absent", { target }));
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
  record("info", [], 1, msg("n.interp.start", { n, target }), [lo, hi]);

  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    w.lo = lo;
    w.hi = hi;
    if (lo === hi) {
      w.pos = lo;
      record("probe", [lo], 4, msg("n.interp.single", { index: lo, value: arr[lo] }), [
        lo,
        hi,
      ]);
      if (arr[lo] === target) {
        sorted.add(lo);
        record("found", [lo], 4, msg("n.interp.match", { target, index: lo }), [lo, hi]);
      } else {
        record("info", [], 5, msg("n.interp.singleMiss", { value: arr[lo], target }));
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
        msg("n.interp.flat", { lo, hi, value: arr[lo], index: lo }),
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
      msg("n.interp.estimate", { pos, target, lo: arr[lo], hi: arr[hi] }),
      [lo, hi]
    );
    if (arr[pos] === target) {
      sorted.add(pos);
      record("found", [pos], 12, msg("n.interp.match", { target, index: pos }), [lo, hi]);
      return steps;
    }
    if (arr[pos] < target) {
      lo = pos + 1;
      w.lo = lo;
      record("compare", [pos], 14, msg("n.interp.right", { value: arr[pos], target }), [
        lo,
        hi,
      ]);
    } else {
      hi = pos - 1;
      w.hi = hi;
      record("compare", [pos], 16, msg("n.interp.left", { value: arr[pos], target }), [
        lo,
        hi,
      ]);
    }
  }

  record("info", [], 18, msg("n.interp.outside", { target }));
  return steps;
}
