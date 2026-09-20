import type { Note } from "./note";

export type StepKind =
  | "compare"
  | "swap"
  | "shift"
  | "select"
  | "probe"
  | "found"
  | "info"
  | "done";

export interface SimulationStep {
  /** Snapshot of the array after this step. */
  array: number[];
  /** Indices involved in this step (compared, swapped, probed, …). */
  highlights: number[];
  /** Indices already locked into their final position (or the found match). */
  sorted: number[];
  /**
   * Active window `[lo, hi]` inclusive. Indices outside it are dimmed as
   * "eliminated" — used by range-narrowing algorithms (binary search) and to
   * spotlight the segment a divide-and-conquer sort is working on.
   */
  range?: [number, number];
  kind: StepKind;
  /** 0-based line of the algorithm's `code` string to highlight. */
  codeLine: number;
  /** Explanation shown in the step strip, as a translatable key + values. */
  note: Note;
  /**
   * A value lifted out of the array into a local variable (insertion/shell
   * `key`). `hole` is the slot whose displayed value is a stale copy left
   * behind by a shift, not a real element — the canvas draws it as a gap and
   * shows `value` floating above it.
   */
  held?: { value: number; hole: number };
  /**
   * Watched loop variables at this step (`i`, `j`, `pivot`, `lo`, `hi`, …),
   * shown in the variable-watch panel. Snapshotted from the recorder's mutable
   * watch bag — the key set stays stable across a run.
   */
  vars?: { label: string; value: number | string }[];
}

/**
 * Turns an input array (and, for searches, a target) into an ordered list of
 * simulation steps. Sorting generators ignore `target`.
 */
export type StepGenerator = (
  input: number[],
  target?: number
) => SimulationStep[];
