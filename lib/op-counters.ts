import type { TKey } from "./dictionaries";
import type { GraphStep } from "./simulations/graphs";
import type { DPStep } from "./simulations/dp";
import type {
  ChoiceStep,
  MazeStep,
  QueensStep,
  SudokuStep,
} from "./simulations/backtracking";

/**
 * Live operation counters for the families that do not use the array canvas.
 *
 * Like the sorting counters, they are derived from the step list rather than
 * emitted by the generators: each counter says how much one step adds, given
 * the step before it, and the totals are prefix sums. Scrubbing back therefore
 * winds the counters back too.
 */
export interface CounterDef<S> {
  key: TKey;
  /** What this step adds; `prev` is undefined for the first step. */
  delta: (step: S, prev: S | undefined) => number;
}

export interface CounterTrack {
  key: TKey;
  /** `totals[i]` is the running total up to and including step `i`. */
  totals: number[];
}

/**
 * Running totals for each counter. Counters that stay at zero for the whole
 * run are dropped, so the set shown is stable while the run plays.
 */
export function runningCounters<S>(
  steps: readonly S[],
  defs: readonly CounterDef<S>[]
): CounterTrack[] {
  const tracks: CounterTrack[] = [];
  for (const def of defs) {
    const totals = new Array<number>(steps.length);
    let sum = 0;
    for (let i = 0; i < steps.length; i++) {
      sum += def.delta(steps[i], i > 0 ? steps[i - 1] : undefined);
      totals[i] = sum;
    }
    if (sum > 0) tracks.push({ key: def.key, totals });
  }
  return tracks;
}

// ── Graphs ──────────────────────────────────────────────────────────────
const sameEdge = (a?: [number, number], b?: [number, number]) =>
  a !== undefined && b !== undefined && a[0] === b[0] && a[1] === b[1];

/** Steps that show an edge again rather than examine it: DFS coming back along a tree edge. */
const EDGE_REVISITS = new Set<string>(["n.dfs.back"]);

export const GRAPH_COUNTERS: CounterDef<GraphStep>[] = [
  {
    // An engine keeps the edge on screen for the steps that act on it, so a
    // new examination is an edge that differs from the previous step's.
    key: "stat.edgesExamined",
    delta: (s, prev) =>
      s.edge && !sameEdge(s.edge, prev?.edge) && !EDGE_REVISITS.has(s.note.k) ? 1 : 0,
  },
  {
    // A distance (or key, or g-score) that went down or became finite. The
    // source's own 0 is set before anything else has a distance and is not one.
    key: "stat.relaxations",
    delta: (s, prev) => {
      if (!s.dist || !prev?.dist || Object.keys(prev.dist).length === 0) return 0;
      let n = 0;
      for (const [node, d] of Object.entries(s.dist)) {
        const before = prev.dist[Number(node)];
        if (before === undefined || d < before) n++;
      }
      return n;
    },
  },
  {
    key: "stat.rejectedEdges",
    delta: (s, prev) =>
      Math.max(0, (s.rejectedEdges?.length ?? 0) - (prev?.rejectedEdges?.length ?? 0)),
  },
];

// ── Dynamic programming ─────────────────────────────────────────────────
export const DP_COUNTERS: CounterDef<DPStep>[] = [
  {
    // Cells whose value changed since the previous snapshot: a first fill,
    // or an improvement in Floyd-Warshall. Cells already filled in the first
    // snapshot were written before it (a base case, Floyd-Warshall's copy of
    // the graph).
    key: "stat.cellsWritten",
    delta: (s, prev) => {
      let n = 0;
      for (let r = 0; r < s.table.length; r++)
        for (let c = 0; c < s.table[r].length; c++)
          if (prev ? s.table[r][c] !== prev.table[r]?.[c] : s.table[r][c] !== null) n++;
      return n;
    },
  },
];

// ── Backtracking ────────────────────────────────────────────────────────
export type BacktrackStep = QueensStep | SudokuStep | MazeStep | ChoiceStep;

/** How many choices the partial solution holds at this step. */
function partialSize(s: BacktrackStep): number {
  if ("queens" in s) return s.queens.filter((c) => c >= 0).length;
  if ("grid" in s) return s.grid.reduce((n, row) => n + row.filter((d) => d !== 0).length, 0);
  if ("path" in s) return s.path.reduce((n, row) => n + row.filter(Boolean).length, 0);
  return s.fixed ?? s.current.length;
}

const CHOICE = new Set(["place", "move", "add"]);
const DEAD_END = new Set(["conflict", "reject", "blocked"]);

export const BACKTRACK_COUNTERS: CounterDef<BacktrackStep>[] = [
  // A queen placed, a digit written, a cell stepped on, an element taken.
  { key: "stat.choices", delta: (s) => (CHOICE.has(s.status) ? 1 : 0) },
  {
    // A choice taken back. Counted from the partial solution shrinking, not
    // from the status: "backtrack" also marks a cell with no digit left and a
    // run that ends without a solution, and neither undoes a choice.
    key: "stat.backtracks",
    delta: (s, prev) => (prev && partialSize(s) < partialSize(prev) ? 1 : 0),
  },
  // A candidate refused before it was tried: attacked square, invalid digit, wall.
  { key: "stat.deadEnds", delta: (s) => (DEAD_END.has(s.status) ? 1 : 0) },
];
