import type { SimulationStep, StepKind } from "./types";

/**
 * Shared recorder: mutate `arr` freely, call `record` after each meaningful
 * moment — it snapshots the array and the sorted set into an immutable step.
 * Code line numbers are 0-based and MUST match the C code in lib/data.ts.
 */
function makeRecorder(arr: number[]) {
  const steps: SimulationStep[] = [];
  const sorted = new Set<number>();
  const record = (
    kind: StepKind,
    highlights: number[],
    codeLine: number,
    note: string
  ) => {
    steps.push({
      array: [...arr],
      highlights,
      sorted: [...sorted],
      kind,
      codeLine,
      note,
    });
  };
  return { steps, sorted, record };
}

export function bubbleSortSteps(input: number[]): SimulationStep[] {
  const arr = [...input];
  const n = arr.length;
  const { steps, sorted, record } = makeRecorder(arr);

  record("info", [], 1, `Starting Bubble Sort on ${n} elements.`);

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
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
  const { steps, sorted, record } = makeRecorder(arr);

  record("info", [], 1, `Starting Selection Sort on ${n} elements.`);

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    record(
      "select",
      [i],
      2,
      `Pass ${i + 1}: assume ${arr[i]} is the minimum of the unsorted part.`
    );
    for (let j = i + 1; j < n; j++) {
      record(
        "compare",
        [j, min],
        4,
        `Comparing ${arr[j]} with current minimum ${arr[min]}.`
      );
      if (arr[j] < arr[min]) {
        min = j;
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
  const { steps, sorted, record } = makeRecorder(arr);

  record("info", [], 1, `Starting Insertion Sort on ${n} elements.`);

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    record("select", [i], 2, `Picking key ${key} to insert into the sorted prefix.`);
    let j = i - 1;
    while (j >= 0) {
      record("compare", [j], 4, `Is ${arr[j]} greater than key ${key}?`);
      if (arr[j] > key) {
        arr[j + 1] = arr[j];
        record("shift", [j, j + 1], 5, `Yes — shifting ${arr[j]} one slot right.`);
        j--;
      } else {
        break;
      }
    }
    arr[j + 1] = key;
    record("select", [j + 1], 8, `Placing key ${key} at position ${j + 1}.`);
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  record("done", [], 10, "Array sorted.");
  return steps;
}
