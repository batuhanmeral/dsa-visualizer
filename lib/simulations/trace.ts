import {
  bubbleSortSteps,
  bucketSortSteps,
  countingSortSteps,
  heapSortSteps,
  insertionSortSteps,
  makeRecorder,
  mergeSortSteps,
  quickSortSteps,
  radixSortSteps,
  selectionSortSteps,
  shellSortSteps,
  type Recorder,
  type RecorderFactory,
} from "./sorting";
import {
  binarySearchSteps,
  interpolationSearchSteps,
  jumpSearchSteps,
  linearSearchSteps,
} from "./searching";
import type { SimulationStep, StepKind } from "./types";

/**
 * Compact recording of a sort or search run, for the large-n canvas.
 *
 * The step generators snapshot the whole array at every step, which is right
 * for 16 values and impossible for 2000 (millions of steps, each a copy). The
 * same generator, run against `traceRecorder`, instead logs per step only its
 * kind, code line, highlighted indices and the array writes made since the
 * previous step, into typed arrays. Replaying the writes reproduces every
 * snapshot exactly (`npm test` checks this against the snapshot run).
 */

/** Step kinds by their code in `RunTrace.kinds`. */
export const STEP_KINDS: readonly StepKind[] = [
  "compare",
  "swap",
  "shift",
  "select",
  "probe",
  "found",
  "info",
  "done",
];
const KIND_CODE = new Map(STEP_KINDS.map((k, i) => [k, i]));

/** Indices into the array: 16 bits while the array is shorter than 32768. */
type IndexArray = Int16Array | Int32Array;
/** Array values: 16 bits when every value is a small integer, else exact doubles. */
type ValueArray = Int16Array | Float64Array;

/** Steps per checkpoint of the highlight and write offsets. */
export const BLOCK = 64;

/**
 * About a dozen bytes a step, so a 2000-value bubble sort (~3 million steps)
 * stays in the tens of megabytes. Per step: kind, code line, how many
 * highlights and how many writes; the offsets into `hl` and `wIdx`/`wVal` are
 * kept every BLOCK steps and summed up from the counts in between.
 */
export interface RunTrace {
  initial: Float64Array;
  count: number;
  /** Code into `STEP_KINDS`, per step. */
  kinds: Uint8Array;
  /** Highlighted code line, per step. */
  lines: Uint8Array;
  /**
   * The step's active window `[rangeLo, rangeHi]`; -1 when it has none. Empty
   * when the run never has one (most sorts), so it costs nothing there.
   */
  rangeLo: IndexArray;
  rangeHi: IndexArray;
  /** Highlights of each step, in order; step k has `hlCount[k]` of them. */
  hlCount: Uint8Array;
  /** Offset into `hl` of step `b * BLOCK`. */
  hlBlock: Uint32Array;
  hl: IndexArray;
  /** Writes made before step k was recorded: `wCount[k]` of them. */
  wCount: Uint16Array;
  /** Offset into `wIdx`/`wVal` of step `b * BLOCK`. */
  wBlock: Uint32Array;
  wIdx: IndexArray;
  wVal: ValueArray;
}

type TypedArray = IndexArray | ValueArray | Uint32Array | Uint8Array | Uint16Array;

/** Append-only typed buffer that doubles when full. */
function growable<T extends TypedArray>(make: (size: number) => T) {
  let buf = make(1024);
  let len = 0;
  return {
    push(v: number) {
      if (len === buf.length) {
        const next = make(buf.length * 2);
        next.set(buf);
        buf = next;
      }
      buf[len++] = v;
    },
    get length() {
      return len;
    },
    done: (): T => buf.slice(0, len) as T,
  };
}

const fitsInt16 = (v: number) => Number.isInteger(v) && v >= -32768 && v <= 32767;

/** A recorder with the snapshot recorder's interface that fills a {@link RunTrace}. */
export function traceRecorder(): { make: RecorderFactory; finish: () => RunTrace } {
  const kinds = growable((n) => new Uint8Array(n));
  const lines = growable((n) => new Uint8Array(n));
  const hlCount = growable((n) => new Uint8Array(n));
  const hlBlock = growable((n) => new Uint32Array(n));
  const wCount = growable((n) => new Uint16Array(n));
  const wBlock = growable((n) => new Uint32Array(n));
  // Sized once the array is known, in `make`.
  let index = (n: number): IndexArray => new Int32Array(n);
  let hl = growable(index);
  let wIdx = growable(index);
  let wVal = growable((n): ValueArray => new Float64Array(n));
  let rangeLo: ReturnType<typeof growable<IndexArray>> | null = null;
  let rangeHi: ReturnType<typeof growable<IndexArray>> | null = null;
  let pendingWrites = 0;
  let initial = new Float64Array(0);

  const make: RecorderFactory = (target) => {
    initial = Float64Array.from(target);
    const small = target.length <= 32767;
    // Sorts and searches only move the input's values around, so if the input
    // fits 16 bits every write does; anything else would be a different value.
    const smallValues = target.every(fitsInt16);
    if (small) index = (n) => new Int16Array(n);
    hl = growable(index);
    wIdx = growable(index);
    wVal = growable((n): ValueArray => (smallValues ? new Int16Array(n) : new Float64Array(n)));

    // The generator mutates `arr`; every index write is logged on the way in.
    const arr = new Proxy(target, {
      set(t, prop, value: number) {
        if (typeof prop === "string") {
          const i = Number(prop);
          if (Number.isInteger(i) && i >= 0) {
            if (smallValues && !fitsInt16(value))
              throw new Error(`trace: ${value} is not one of the input's values`);
            wIdx.push(i);
            wVal.push(value);
            pendingWrites++;
          }
        }
        return Reflect.set(t, prop, value);
      },
    });
    // Everything a generator calls stays available; only `record` is logged.
    const base = makeRecorder(arr);
    const record: Recorder["record"] = (kind, highlights, codeLine, _note, range) => {
      const k = kinds.length;
      if (k % BLOCK === 0) {
        hlBlock.push(hl.length);
        wBlock.push(wIdx.length - pendingWrites);
      }
      if (codeLine > 255 || highlights.length > 255 || pendingWrites > 65535)
        throw new Error(`trace: step ${k} does not fit the compact format`);
      kinds.push(KIND_CODE.get(kind)!);
      lines.push(codeLine);
      if (range && !rangeLo) {
        // First window of the run: earlier steps had none.
        rangeLo = growable(index);
        rangeHi = growable(index);
        for (let s = 0; s < k; s++) {
          rangeLo.push(-1);
          rangeHi.push(-1);
        }
      }
      rangeLo?.push(range ? range[0] : -1);
      rangeHi?.push(range ? range[1] : -1);
      hlCount.push(highlights.length);
      for (const i of highlights) hl.push(i);
      wCount.push(pendingWrites);
      pendingWrites = 0;
    };
    return { ...base, arr, record, steps: [] as SimulationStep[] };
  };

  const finish = (): RunTrace => ({
    initial,
    count: kinds.length,
    kinds: kinds.done(),
    lines: lines.done(),
    rangeLo: rangeLo?.done() ?? new Int16Array(0),
    rangeHi: rangeHi?.done() ?? new Int16Array(0),
    hlCount: hlCount.done(),
    hlBlock: hlBlock.done(),
    hl: hl.done(),
    wCount: wCount.done(),
    wBlock: wBlock.done(),
    wIdx: wIdx.done(),
    wVal: wVal.done(),
  });

  return { make, finish };
}

type Engine = (input: number[], target: number | undefined, make: RecorderFactory) => unknown;

// A Map, so a slug from a worker message never reaches an inherited object method.
const ENGINES = new Map<string, Engine>([
  ["bubble-sort", bubbleSortSteps],
  ["selection-sort", selectionSortSteps],
  ["insertion-sort", insertionSortSteps],
  ["shell-sort", shellSortSteps],
  ["merge-sort", mergeSortSteps],
  ["quick-sort", quickSortSteps],
  ["heap-sort", heapSortSteps],
  ["counting-sort", countingSortSteps],
  ["bucket-sort", bucketSortSteps],
  ["radix-sort", radixSortSteps],
  ["linear-search", linearSearchSteps],
  ["binary-search", binarySearchSteps],
  ["jump-search", jumpSearchSteps],
  ["interpolation-search", interpolationSearchSteps],
]);

export const TRACEABLE: readonly string[] = [...ENGINES.keys()];

/**
 * Runs a sort or a search (for `target`) on `input` and returns its trace, or
 * undefined for any other algorithm. A search that sorts its input first
 * starts the trace from the sorted array, as the canvas draws it.
 */
export function traceRun(
  slug: string,
  input: readonly number[],
  target?: number
): RunTrace | undefined {
  const engine = ENGINES.get(slug);
  if (typeof engine !== "function") return undefined;
  const { make, finish } = traceRecorder();
  engine([...input], target, make);
  return finish();
}

/**
 * The buffers to transfer when posting a trace from the worker that built it:
 * the arrays move to the page instead of being copied.
 */
export function traceTransfer(trace: RunTrace): ArrayBuffer[] {
  return Object.values(trace)
    .filter((v): v is ArrayBufferView => ArrayBuffer.isView(v))
    .map((a) => a.buffer as ArrayBuffer);
}

/** Offset of step `k`'s first entry, from its block's checkpoint and the counts since. */
function offsetOf(block: Uint32Array, counts: Uint8Array | Uint16Array, k: number): number {
  let at = block[Math.floor(k / BLOCK)];
  for (let s = k - (k % BLOCK); s < k; s++) at += counts[s];
  return at;
}

/** Step `k`'s highlighted indices (a view, not a copy). */
export function stepHighlights(trace: RunTrace, k: number): IndexArray {
  const from = offsetOf(trace.hlBlock, trace.hlCount, k);
  return trace.hl.subarray(from, from + trace.hlCount[k]);
}

/** Step `k`'s active window, as the snapshot step's `range`. */
export function stepRange(trace: RunTrace, k: number): [number, number] | undefined {
  if (trace.rangeLo.length === 0 || trace.rangeLo[k] < 0) return undefined;
  return [trace.rangeLo[k], trace.rangeHi[k]];
}

/**
 * The array at any step. Seeking forward applies the writes in between;
 * seeking back starts over from the input, which for a few million writes is
 * still a few milliseconds.
 */
export function createReplay(trace: RunTrace) {
  const values = Float64Array.from(trace.initial);
  let at = -1;
  /** Offset of the first write of step `at + 1`. */
  let next = 0;
  return {
    values,
    get at() {
      return at;
    },
    seek(target: number) {
      const k = Math.min(Math.max(target, 0), trace.count - 1);
      if (k < at) {
        values.set(trace.initial);
        at = -1;
        next = 0;
      }
      while (at < k) {
        const end = next + trace.wCount[++at];
        for (let w = next; w < end; w++) values[trace.wIdx[w]] = trace.wVal[w];
        next = end;
      }
    },
  };
}
