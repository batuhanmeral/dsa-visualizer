import { msg, type Note } from "./note";
import type { SimulationStep, StepKind } from "./types";

/**
 * Shared recorder: mutate `arr` freely, call `record` after each meaningful
 * moment — it snapshots the array and the sorted set into an immutable step.
 * Code line numbers are 0-based and MUST match the C code in lib/data.ts.
 */
export function makeRecorder(arr: number[]) {
  const steps: SimulationStep[] = [];
  const sorted = new Set<number>();
  // Mutable watch bag: generators mutate it in place; every `record` snapshots
  // the current values, so the tracked variable set stays stable across a run.
  let watch: Record<string, number | string> | undefined;
  // Value lifted out of the array into a local (insertion/shell `key`). While
  // it is held the array has a duplicate at the hole, so the canvas needs to
  // know which slot is a hole rather than a real element.
  let held: { value: number; hole: number } | undefined;
  const record = (
    kind: StepKind,
    highlights: number[],
    codeLine: number,
    note: Note,
    range?: [number, number]
  ) => {
    steps.push({
      array: [...arr],
      highlights,
      sorted: [...sorted],
      range,
      kind,
      codeLine,
      note,
      held,
      vars: watch
        ? Object.entries(watch).map(([label, value]) => ({ label, value }))
        : undefined,
    });
  };
  /** Register the mutable object whose fields are snapshotted into each step. */
  const setWatch = (bag: Record<string, number | string>) => {
    watch = bag;
  };
  /** Mark `value` as lifted out of the array, leaving a hole at `hole`. */
  const hold = (value: number, hole: number) => {
    held = { value, hole };
  };
  /** Move the hole (the key shifted one slot left / `gap` slots left). */
  const moveHole = (hole: number) => {
    if (held) held = { value: held.value, hole };
  };
  /** The key is back in the array — no hole any more. */
  const release = () => {
    held = undefined;
  };
  return { steps, sorted, record, setWatch, hold, moveHole, release };
}

export function bubbleSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { i: 0, j: 0 };
  setWatch(w);

  record("info", [], 1, msg("n.bubble.start", { n }));

  for (let i = 0; i < n - 1; i++) {
    w.i = i;
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      w.j = j;
      record(
        "compare",
        [j, j + 1],
        4,
        msg("n.bubble.compare", { a: arr[j], b: arr[j + 1] })
      );
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        record(
          "swap",
          [j, j + 1],
          6,
          msg("n.bubble.swap", { big: arr[j + 1], small: arr[j] })
        );
      }
    }
    sorted.add(n - 1 - i);
    record(
      "info",
      [n - 1 - i],
      10,
      msg("n.bubble.passDone", { pass: i + 1, value: arr[n - 1 - i] })
    );
    if (!swapped) {
      for (let k = 0; k < n - 1 - i; k++) sorted.add(k);
      record("info", [], 11, msg("n.bubble.noSwaps"));
      break;
    }
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 13, msg("n.sort.done"));
  return steps;
}

export function selectionSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { i: 0, j: 0, min: 0 };
  setWatch(w);

  record("info", [], 1, msg("n.select.start", { n }));

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    w.i = i;
    w.min = min;
    record("select", [i], 2, msg("n.select.assume", { pass: i + 1, value: arr[i] }));
    for (let j = i + 1; j < n; j++) {
      w.j = j;
      record(
        "compare",
        [j, min],
        4,
        msg("n.select.compare", { value: arr[j], min: arr[min] })
      );
      if (arr[j] < arr[min]) {
        min = j;
        w.min = min;
        record("select", [j], 4, msg("n.select.newMin", { value: arr[j] }));
      }
    }
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      record("swap", [i, min], 8, msg("n.select.swap", { value: arr[i], index: i }));
    }
    sorted.add(i);
    record("info", [i], 10, msg("n.select.locked", { value: arr[i], index: i }));
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 12, msg("n.sort.done"));
  return steps;
}

export function insertionSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch, hold, moveHole, release } =
    makeRecorder(arr);
  const w = { i: 0, j: 0, key: 0 };
  setWatch(w);

  record("info", [], 1, msg("n.insert.start", { n }));

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    w.i = i;
    w.key = key;
    hold(key, i);
    record("select", [i], 2, msg("n.insert.pick", { key }));
    let j = i - 1;
    w.j = j;
    while (j >= 0) {
      w.j = j;
      record("compare", [j], 4, msg("n.insert.ask", { value: arr[j], key }));
      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        moveHole(j);
        record("shift", [j, j + 1], 5, msg("n.insert.shift", { value: arr[j] }));
        j--;
      } else {
        break;
      }
    }
    w.j = j;
    arr[j + 1] = key;
    release();
    record("select", [j + 1], 8, msg("n.insert.place", { key, index: j + 1 }));
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 10, msg("n.sort.done"));
  return steps;
}

export function shellSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch, hold, moveHole, release } =
    makeRecorder(arr);
  const w = { gap: 0, i: 0, j: 0, key: 0 };
  setWatch(w);

  record("info", [], 0, msg("n.shell.start", { n }));

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    w.gap = gap;
    record("info", [], 1, msg("n.shell.gap", { gap }));
    for (let i = gap; i < n; i++) {
      const key = arr[i];
      w.i = i;
      w.key = key;
      w.j = i;
      hold(key, i);
      record("select", [i], 3, msg("n.shell.take", { key, index: i }));
      let j = i;
      while (j >= gap && arr[j - gap] > key) {
        w.j = j;
        record(
          "compare",
          [j - gap, j],
          5,
          msg("n.shell.compare", { value: arr[j - gap], key, gap })
        );
        arr[j] = arr[j - gap];
        moveHole(j - gap);
        record("shift", [j - gap, j], 6, msg("n.shell.moved", { value: arr[j], index: j }));
        j -= gap;
      }
      w.j = j;
      arr[j] = key;
      release();
      record("select", [j], 9, msg("n.shell.place", { key, index: j }));
    }
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 12, msg("n.sort.done"));
  return steps;
}

export function mergeSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { lo: 0, mid: 0, hi: 0 };
  setWatch(w);

  record("info", [], 13, msg("n.merge.start", { n }));

  const merge = (lo: number, mid: number, hi: number) => {
    w.lo = lo;
    w.mid = mid;
    w.hi = hi;
    const left = arr.slice(lo, mid + 1);
    const right = arr.slice(mid + 1, hi + 1);
    record(
      "info",
      [],
      6,
      msg("n.merge.merging", { lo, mid, rlo: mid + 1, hi }),
      [lo, hi]
    );
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < left.length && j < right.length) {
      record(
        "compare",
        [k],
        7,
        msg("n.merge.compare", { a: left[i], b: right[j] }),
        [lo, hi]
      );
      arr[k] = left[i] <= right[j] ? left[i++] : right[j++];
      record("shift", [k], 8, msg("n.merge.write", { value: arr[k], index: k }), [
        lo,
        hi,
      ]);
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i++];
      record(
        "shift",
        [k],
        9,
        msg("n.merge.copyRest", { value: arr[k], index: k }),
        [lo, hi]
      );
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j++];
      record(
        "shift",
        [k],
        10,
        msg("n.merge.copyRest", { value: arr[k], index: k }),
        [lo, hi]
      );
      k++;
    }
  };

  const mergeSort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = Math.floor(lo + (hi - lo) / 2);
    w.lo = lo;
    w.mid = mid;
    w.hi = hi;
    record("info", [], 15, msg("n.merge.split", { lo, hi, mid }), [lo, hi]);
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    merge(lo, mid, hi);
  };

  mergeSort(0, n - 1);

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 18, msg("n.sort.done"));
  return steps;
}

export function quickSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { lo: 0, hi: 0, pivot: 0, i: 0, j: 0 };
  setWatch(w);

  record("info", [], 13, msg("n.quick.start", { n }));

  const partition = (lo: number, hi: number): number => {
    const pivot = arr[hi];
    w.lo = lo;
    w.hi = hi;
    w.pivot = pivot;
    record("select", [hi], 1, msg("n.quick.pivot", { pivot, lo, hi }), [lo, hi]);
    let i = lo - 1;
    w.i = i;
    for (let j = lo; j < hi; j++) {
      w.j = j;
      record("compare", [j, hi], 4, msg("n.quick.ask", { value: arr[j], pivot }), [
        lo,
        hi,
      ]);
      if (arr[j] < pivot) {
        i++;
        w.i = i;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          record("swap", [i, j], 6, msg("n.quick.swap", { value: arr[i] }), [lo, hi]);
        }
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    record(
      "swap",
      [i + 1, hi],
      9,
      msg("n.quick.place", { pivot, index: i + 1 }),
      [lo, hi]
    );
    sorted.add(i + 1);
    return i + 1;
  };

  const quickSort = (lo: number, hi: number) => {
    if (lo < hi) {
      const p = partition(lo, hi);
      quickSort(lo, p - 1);
      quickSort(p + 1, hi);
    } else if (lo === hi) {
      sorted.add(lo);
    }
  };

  quickSort(0, n - 1);

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 18, msg("n.sort.done"));
  return steps;
}

export function heapSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { size: n, i: 0, largest: 0 };
  setWatch(w);

  record("info", [], 13, msg("n.heapsort.start", { n }));

  const heapify = (size: number, i: number) => {
    let largest = i;
    w.size = size;
    w.i = i;
    w.largest = largest;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < size) {
      record(
        "compare",
        [l, largest],
        3,
        msg("n.heapsort.left", { child: arr[l], parent: arr[largest] })
      );
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < size) {
      record(
        "compare",
        [r, largest],
        4,
        msg("n.heapsort.right", { child: arr[r], parent: arr[largest] })
      );
      if (arr[r] > arr[largest]) largest = r;
    }
    w.largest = largest;
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      record("swap", [i, largest], 7, msg("n.heapsort.swapDown", { value: arr[i] }));
      heapify(size, largest);
    }
  };

  record("info", [], 14, msg("n.heapsort.build"));
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    record("select", [i], 15, msg("n.heapsort.heapifyAt", { index: i }));
    heapify(n, i);
  }

  record("info", [], 16, msg("n.heapsort.ready"));
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    record("swap", [0, i], 18, msg("n.heapsort.moveMax", { value: arr[i], index: i }));
    sorted.add(i);
    record("info", [i], 20, msg("n.heapsort.locked", { value: arr[i], size: i }));
    heapify(i, 0);
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 22, msg("n.sort.done"));
  return steps;
}

export function countingSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { max: 0, i: 0 };
  setWatch(w);

  record("info", [], 0, msg("n.counting.start", { n }));
  if (n === 0) {
    record("done", [], 20, msg("n.sort.nothing"));
    return steps;
  }

  let max = arr[0];
  w.max = max;
  record("select", [0], 1, msg("n.counting.assumeMax", { max }));
  for (let i = 1; i < n; i++) {
    w.i = i;
    record("compare", [i], 3, msg("n.counting.ask", { value: arr[i], max }));
    if (arr[i] > max) {
      max = arr[i];
      w.max = max;
      record("select", [i], 3, msg("n.counting.newMax", { max, slots: max + 1 }));
    }
  }

  const count = new Array(max + 1).fill(0);
  record("info", [], 6, msg("n.counting.clear", { max }));
  for (let i = 0; i < n; i++) {
    w.i = i;
    count[arr[i]]++;
    record(
      "probe",
      [i],
      9,
      msg("n.counting.tally", { value: arr[i], count: count[arr[i]] })
    );
  }

  for (let d = 1; d <= max; d++) count[d] += count[d - 1];
  record("info", [], 12, msg("n.counting.prefix"));

  // The backward walk is what makes counting sort stable, so animate it rather
  // than filling `out` silently: line 16 is the whole point of the algorithm.
  const out = new Array<number>(n);
  for (let i = n - 1; i >= 0; i--) {
    w.i = i;
    const slot = --count[arr[i]];
    out[slot] = arr[i];
    record("probe", [i], 16, msg("n.counting.stable", { value: arr[i], slot }));
  }

  for (let i = 0; i < n; i++) {
    w.i = i;
    arr[i] = out[i];
    sorted.add(i);
    record("shift", [i], 19, msg("n.counting.copyBack", { value: arr[i], index: i }));
  }

  record("done", [], 20, msg("n.sort.done"));
  return steps;
}

const BUCKET_COUNT = 5;

export function bucketSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { max: 0, size: 0, b: 0, i: 0 };
  setWatch(w);

  record("info", [], 2, msg("n.bucket.start", { n, buckets: BUCKET_COUNT }));
  if (n === 0) {
    record("done", [], 22, msg("n.sort.nothing"));
    return steps;
  }

  let max = arr[0];
  w.max = max;
  record("select", [0], 3, msg("n.bucket.assumeMax", { max }));
  for (let i = 1; i < n; i++) {
    w.i = i;
    record("compare", [i], 5, msg("n.bucket.ask", { value: arr[i], max }));
    if (arr[i] > max) {
      max = arr[i];
      w.max = max;
      record("select", [i], 5, msg("n.bucket.newMax", { max }));
    }
  }

  const size = Math.floor(max / BUCKET_COUNT) + 1;
  w.size = size;
  record("info", [], 8, msg("n.bucket.width", { size }));

  const buckets: number[][] = Array.from({ length: BUCKET_COUNT }, () => []);
  for (let i = 0; i < n; i++) {
    const b = Math.min(Math.floor(arr[i] / size), BUCKET_COUNT - 1);
    w.i = i;
    w.b = b;
    buckets[b].push(arr[i]);
    record(
      "probe",
      [i],
      12,
      msg("n.bucket.into", {
        value: arr[i],
        bucket: b,
        lo: b * size,
        hi: (b + 1) * size - 1,
      })
    );
  }

  for (let b = 0; b < BUCKET_COUNT; b++) {
    if (buckets[b].length > 1) {
      w.b = b;
      buckets[b].sort((x, y) => x - y);
      record(
        "info",
        [],
        16,
        msg("n.bucket.sortBucket", { bucket: b, values: buckets[b].join(", ") })
      );
    }
  }

  let idx = 0;
  for (let b = 0; b < BUCKET_COUNT; b++) {
    w.b = b;
    for (const v of buckets[b]) {
      w.i = idx;
      arr[idx] = v;
      sorted.add(idx);
      record(
        "shift",
        [idx],
        21,
        msg("n.bucket.concat", { bucket: b, value: v, index: idx })
      );
      idx++;
    }
  }

  record("done", [], 22, msg("n.sort.done"));
  return steps;
}

/** Digit place as a note key, so "ones"/"tens"/… stay translatable. */
const placeKey = (d: number): { place: string; placeExp?: number } =>
  d === 1
    ? { place: "@n.radix.place.ones" }
    : d === 2
      ? { place: "@n.radix.place.tens" }
      : d === 3
        ? { place: "@n.radix.place.hundreds" }
        : { place: "@n.radix.place.power", placeExp: d - 1 };

export function radixSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { exp: 1, i: 0 };
  setWatch(w);

  record("info", [], 19, msg("n.radix.start", { n }));

  const max = arr.length ? Math.max(...arr) : 0;

  let digit = 1;
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10, digit++) {
    const place = placeKey(digit);
    w.exp = exp;
    record("info", [], 20, msg("n.radix.pass", { ...place, exp }));

    const count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) {
      const d = Math.floor(arr[i] / exp) % 10;
      w.i = i;
      count[d]++;
      record("probe", [i], 10, msg("n.radix.digit", { value: arr[i], ...place, digit: d }));
    }
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];

    // Same as counting sort: the backward pass is where stability comes from,
    // and stability is the only reason radix sort works at all.
    const out = new Array<number>(n);
    for (let i = n - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10;
      const slot = --count[d];
      out[slot] = arr[i];
      w.i = i;
      record("probe", [i], 14, msg("n.radix.stable", { value: arr[i], slot, ...place }));
    }
    for (let i = 0; i < n; i++) arr[i] = out[i];
    record("shift", [], 16, msg("n.radix.reorder", { ...place }));
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 22, msg("n.sort.done"));
  return steps;
}
