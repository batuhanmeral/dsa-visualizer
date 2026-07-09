export type StepKind =
  | "compare"
  | "swap"
  | "shift"
  | "select"
  | "info"
  | "done";

export interface SimulationStep {
  /** Snapshot of the array after this step. */
  array: number[];
  /** Indices involved in this step (compared, swapped, …). */
  highlights: number[];
  /** Indices already locked into their final position. */
  sorted: number[];
  kind: StepKind;
  /** 0-based line of the algorithm's `code` string to highlight. */
  codeLine: number;
  /** Human-readable explanation shown in the step strip. */
  note: string;
}

export type StepGenerator = (input: number[]) => SimulationStep[];
