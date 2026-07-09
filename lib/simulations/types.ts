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
  /** Human-readable explanation shown in the step strip. */
  note: string;
}

/**
 * Turns an input array (and, for searches, a target) into an ordered list of
 * simulation steps. Sorting generators ignore `target`.
 */
export type StepGenerator = (
  input: number[],
  target?: number
) => SimulationStep[];
