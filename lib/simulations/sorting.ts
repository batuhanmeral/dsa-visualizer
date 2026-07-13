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
  const record = (
    kind: StepKind,
    highlights: number[],
    codeLine: number,
    note: string,
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
      vars: watch
        ? Object.entries(watch).map(([label, value]) => ({ label, value }))
        : undefined,
    });
  };
  /** Register the mutable object whose fields are snapshotted into each step. */
  const setWatch = (bag: Record<string, number | string>) => {
    watch = bag;
  };
  return { steps, sorted, record, setWatch };
}

export function bubbleSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { i: 0, j: 0 };
  setWatch(w);

  record("info", [], 1, `Starting Bubble Sort on ${n} elements.`);

  for (let i = 0; i < n - 1; i++) {
    w.i = i;
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      w.j = j;
      record("compare", [j, j + 1], 4, `Comparing ${arr[j]} and ${arr[j + 1]}.`);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        record(
          "swap",
          [j, j + 1],
          6,
          `${arr[j + 1]} > ${arr[j]} — swapping them.`
        );
      }
    }
    sorted.add(n - 1 - i);
    record(
      "info",
      [n - 1 - i],
      10,
      `Pass ${i + 1} complete — ${arr[n - 1 - i]} is locked in place.`
    );
    if (!swapped) {
      for (let k = 0; k < n - 1 - i; k++) sorted.add(k);
      record("info", [], 11, "No swaps this pass — the rest is already sorted.");
      break;
    }
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 13, "Array sorted.");
  return steps;
}

export function selectionSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { i: 0, j: 0, min: 0 };
  setWatch(w);

  record("info", [], 1, `Starting Selection Sort on ${n} elements.`);

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    w.i = i;
    w.min = min;
    record(
      "select",
      [i],
      2,
      `Pass ${i + 1}: assume ${arr[i]} is the minimum of the unsorted part.`
    );
    for (let j = i + 1; j < n; j++) {
      w.j = j;
      record(
        "compare",
        [j, min],
        4,
        `Comparing ${arr[j]} with current minimum ${arr[min]}.`
      );
      if (arr[j] < arr[min]) {
        min = j;
        w.min = min;
        record("select", [j], 4, `${arr[j]} is the new minimum.`);
      }
    }
    if (min !== i) {
      [arr[i], arr[min]] = [arr[min], arr[i]];
      record(
        "swap",
        [i, min],
        8,
        `Swapping minimum ${arr[i]} into position ${i}.`
      );
    }
    sorted.add(i);
    record("info", [i], 10, `${arr[i]} is locked at position ${i}.`);
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 12, "Array sorted.");
  return steps;
}

export function insertionSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { i: 0, j: 0, key: 0 };
  setWatch(w);

  record("info", [], 1, `Starting Insertion Sort on ${n} elements.`);

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    w.i = i;
    w.key = key;
    record("select", [i], 2, `Picking key ${key} to insert into the sorted prefix.`);
    let j = i - 1;
    w.j = j;
    while (j >= 0) {
      w.j = j;
      record("compare", [j], 4, `Is ${arr[j]} greater than key ${key}?`);
      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        record("shift", [j, j + 1], 5, `Yes — shifting ${arr[j]} one slot right.`);
        j--;
      } else {
        break;
      }
    }
    w.j = j;
    arr[j + 1] = key;
    record("select", [j + 1], 8, `Placing key ${key} at position ${j + 1}.`);
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 10, "Array sorted.");
  return steps;
}

export function shellSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { gap: 0, i: 0, j: 0, key: 0 };
  setWatch(w);

  record("info", [], 0, `Starting Shell Sort on ${n} elements.`);

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    w.gap = gap;
    record("info", [], 1, `Gap = ${gap}: comparing elements ${gap} apart.`);
    for (let i = gap; i < n; i++) {
      const key = arr[i];
      w.i = i;
      w.key = key;
      w.j = i;
      record("select", [i], 3, `Take key ${key} at index ${i}.`);
      let j = i;
      while (j >= gap && arr[j - gap] > key) {
        w.j = j;
        record(
          "compare",
          [j - gap, j],
          5,
          `${arr[j - gap]} > key ${key} — shift it up by ${gap}.`
        );
        arr[j] = arr[j - gap];
        record("shift", [j - gap, j], 6, `Moved ${arr[j]} to index ${j}.`);
        j -= gap;
      }
      w.j = j;
      arr[j] = key;
      record("select", [j], 9, `Place key ${key} at index ${j}.`);
    }
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 12, "Array sorted.");
  return steps;
}

export function mergeSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { lo: 0, mid: 0, hi: 0 };
  setWatch(w);

  record("info", [], 13, `Starting Merge Sort on ${n} elements.`);

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
      `Merging sorted halves [${lo}..${mid}] and [${mid + 1}..${hi}].`,
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
        `Compare ${left[i]} and ${right[j]} — smaller goes first.`,
        [lo, hi]
      );
      arr[k] = left[i] <= right[j] ? left[i++] : right[j++];
      record("shift", [k], 8, `Write ${arr[k]} to index ${k}.`, [lo, hi]);
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i++];
      record("shift", [k], 9, `Copy remaining ${arr[k]} to index ${k}.`, [lo, hi]);
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j++];
      record("shift", [k], 10, `Copy remaining ${arr[k]} to index ${k}.`, [lo, hi]);
      k++;
    }
  };

  const mergeSort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const mid = Math.floor(lo + (hi - lo) / 2);
    w.lo = lo;
    w.mid = mid;
    w.hi = hi;
    record("info", [], 15, `Split [${lo}..${hi}] at index ${mid}.`, [lo, hi]);
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    merge(lo, mid, hi);
  };

  mergeSort(0, n - 1);

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 18, "Array sorted.");
  return steps;
}

export function quickSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { lo: 0, hi: 0, pivot: 0, i: 0, j: 0 };
  setWatch(w);

  record("info", [], 13, `Starting Quick Sort on ${n} elements.`);

  const partition = (lo: number, hi: number): number => {
    const pivot = arr[hi];
    w.lo = lo;
    w.hi = hi;
    w.pivot = pivot;
    record("select", [hi], 1, `Pivot = ${pivot} (last of [${lo}..${hi}]).`, [lo, hi]);
    let i = lo - 1;
    w.i = i;
    for (let j = lo; j < hi; j++) {
      w.j = j;
      record("compare", [j, hi], 4, `Is ${arr[j]} < pivot ${pivot}?`, [lo, hi]);
      if (arr[j] < pivot) {
        i++;
        w.i = i;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          record(
            "swap",
            [i, j],
            6,
            `Yes — swap ${arr[i]} into the smaller-than-pivot region.`,
            [lo, hi]
          );
        }
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    record(
      "swap",
      [i + 1, hi],
      9,
      `Place pivot ${pivot} at its final index ${i + 1}.`,
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
  record("done", [], 18, "Array sorted.");
  return steps;
}

export function heapSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { size: n, i: 0, largest: 0 };
  setWatch(w);

  record("info", [], 13, `Starting Heap Sort on ${n} elements.`);

  const heapify = (size: number, i: number) => {
    let largest = i;
    w.size = size;
    w.i = i;
    w.largest = largest;
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    if (l < size) {
      record("compare", [l, largest], 3, `Left child ${arr[l]} vs ${arr[largest]}.`);
      if (arr[l] > arr[largest]) largest = l;
    }
    if (r < size) {
      record("compare", [r, largest], 4, `Right child ${arr[r]} vs ${arr[largest]}.`);
      if (arr[r] > arr[largest]) largest = r;
    }
    w.largest = largest;
    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      record("swap", [i, largest], 7, `Swap ${arr[i]} down to restore the max-heap.`);
      heapify(size, largest);
    }
  };

  record("info", [], 14, "Build a max-heap from the bottom up.");
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    record("select", [i], 15, `Heapify the subtree rooted at index ${i}.`);
    heapify(n, i);
  }

  record("info", [], 16, "Heap ready — repeatedly extract the maximum.");
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    record("swap", [0, i], 18, `Move the max ${arr[i]} to index ${i}.`);
    sorted.add(i);
    record("info", [i], 20, `${arr[i]} locked — re-heapify the first ${i}.`);
    heapify(i, 0);
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 22, "Array sorted.");
  return steps;
}

export function countingSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { max: 0, i: 0 };
  setWatch(w);

  record("info", [], 0, `Starting Counting Sort on ${n} elements.`);
  if (n === 0) {
    record("done", [], 20, "Nothing to sort.");
    return steps;
  }

  let max = arr[0];
  w.max = max;
  record("select", [0], 1, `Assume the maximum value is ${max}.`);
  for (let i = 1; i < n; i++) {
    w.i = i;
    record("compare", [i], 3, `Is ${arr[i]} greater than current max ${max}?`);
    if (arr[i] > max) {
      max = arr[i];
      w.max = max;
      record("select", [i], 3, `New maximum ${max} — counts array needs ${max + 1} slots.`);
    }
  }

  const count = new Array(max + 1).fill(0);
  record("info", [], 6, `Clear counts[0..${max}] to zero.`);
  for (let i = 0; i < n; i++) {
    w.i = i;
    count[arr[i]]++;
    record("probe", [i], 9, `Tally ${arr[i]} — count[${arr[i]}] is now ${count[arr[i]]}.`);
  }

  for (let d = 1; d <= max; d++) count[d] += count[d - 1];
  record("info", [], 12, "Prefix-sum the counts: each slot holds a final position.");

  const out = new Array<number>(n);
  for (let i = n - 1; i >= 0; i--) out[--count[arr[i]]] = arr[i];

  for (let i = 0; i < n; i++) {
    w.i = i;
    arr[i] = out[i];
    sorted.add(i);
    record("shift", [i], 19, `Place ${arr[i]} at its sorted index ${i}.`);
  }

  record("done", [], 20, "Array sorted.");
  return steps;
}

const BUCKET_COUNT = 5;

export function bucketSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { max: 0, size: 0, b: 0, i: 0 };
  setWatch(w);

  record("info", [], 2, `Starting Bucket Sort on ${n} elements (${BUCKET_COUNT} buckets).`);
  if (n === 0) {
    record("done", [], 22, "Nothing to sort.");
    return steps;
  }

  let max = arr[0];
  w.max = max;
  record("select", [0], 3, `Assume the maximum value is ${max}.`);
  for (let i = 1; i < n; i++) {
    w.i = i;
    record("compare", [i], 5, `Is ${arr[i]} greater than current max ${max}?`);
    if (arr[i] > max) {
      max = arr[i];
      w.max = max;
      record("select", [i], 5, `New maximum ${max}.`);
    }
  }

  const size = Math.floor(max / BUCKET_COUNT) + 1;
  w.size = size;
  record("info", [], 8, `Bucket width = ${size}: value v goes to bucket v / ${size}.`);

  const buckets: number[][] = Array.from({ length: BUCKET_COUNT }, () => []);
  for (let i = 0; i < n; i++) {
    const b = Math.min(Math.floor(arr[i] / size), BUCKET_COUNT - 1);
    w.i = i;
    w.b = b;
    buckets[b].push(arr[i]);
    record("probe", [i], 12, `${arr[i]} → bucket ${b} [${b * size}..${(b + 1) * size - 1}].`);
  }

  for (let b = 0; b < BUCKET_COUNT; b++) {
    if (buckets[b].length > 1) {
      w.b = b;
      buckets[b].sort((x, y) => x - y);
      record("info", [], 16, `Sort bucket ${b}: [${buckets[b].join(", ")}].`);
    }
  }

  let idx = 0;
  for (let b = 0; b < BUCKET_COUNT; b++) {
    w.b = b;
    for (const v of buckets[b]) {
      w.i = idx;
      arr[idx] = v;
      sorted.add(idx);
      record("shift", [idx], 21, `Concatenate bucket ${b}: write ${v} to index ${idx}.`);
      idx++;
    }
  }

  record("done", [], 22, "Array sorted.");
  return steps;
}

export function radixSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record, setWatch } = makeRecorder(arr);
  const w = { exp: 1, i: 0 };
  setWatch(w);

  record("info", [], 19, `Starting Radix Sort on ${n} elements.`);

  const max = arr.length ? Math.max(...arr) : 0;
  const placeName = (d: number) =>
    d === 1 ? "ones" : d === 2 ? "tens" : d === 3 ? "hundreds" : `10^${d - 1}`;

  let digit = 1;
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10, digit++) {
    const place = placeName(digit);
    w.exp = exp;
    record("info", [], 20, `Pass on the ${place} digit (exp = ${exp}).`);

    const count = new Array(10).fill(0);
    for (let i = 0; i < n; i++) {
      const d = Math.floor(arr[i] / exp) % 10;
      w.i = i;
      count[d]++;
      record("probe", [i], 10, `${arr[i]} → ${place} digit is ${d}.`);
    }
    for (let d = 1; d < 10; d++) count[d] += count[d - 1];

    const out = new Array<number>(n);
    for (let i = n - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10;
      out[--count[d]] = arr[i];
    }
    for (let i = 0; i < n; i++) arr[i] = out[i];
    record("shift", [], 16, `Stably reorder the array by the ${place} digit.`);
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 22, "Array sorted.");
  return steps;
}
