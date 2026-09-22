/**
 * Backtracking engines — pure step generators that explore, fail fast and undo.
 * Both search to the FIRST solution (clearer for teaching than counting all).
 * `codeLine` values are 0-based and MUST match the C code in lib/data.ts.
 */

import { msg, type Note, type StepNoteKey } from "./note";

// ── N-Queens ────────────────────────────────────────────────────────────
export type QueenStatus =
  | "try"
  | "place"
  | "conflict"
  | "backtrack"
  | "solved";

export interface QueensStep {
  codeLine: number;
  note: Note;
  n: number;
  /** Column of the queen in each row, or -1 if the row is empty. */
  queens: number[];
  /** Cell under consideration this step. */
  active?: [number, number];
  status: QueenStatus;
}

function queenSafe(queens: number[], row: number, col: number): boolean {
  for (let r = 0; r < row; r++) {
    if (queens[r] === col) return false;
    if (r - queens[r] === row - col) return false;
    if (r + queens[r] === row + col) return false;
  }
  return true;
}

export function nQueensSteps(n: number): QueensStep[] {
  const queens = new Array<number>(n).fill(-1);
  const steps: QueensStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    status: QueenStatus,
    active?: [number, number]
  ) =>
    steps.push({
      codeLine,
      note,
      n,
      queens: queens.slice(),
      active,
      status,
    });

  const solve = (row: number): boolean => {
    if (row === n) {
      snap(10, msg("n.queens.solved", { n }), "solved");
      return true;
    }
    for (let col = 0; col < n; col++) {
      const safe = queenSafe(queens, row, col);
      snap(
        12,
        msg(safe ? "n.queens.trySafe" : "n.queens.tryAttacked", { row, col }),
        safe ? "try" : "conflict",
        [row, col]
      );
      if (safe) {
        queens[row] = col;
        snap(13, msg("n.queens.place", { row, col }), "place", [row, col]);
        if (solve(row + 1)) return true;
        queens[row] = -1;
        snap(15, msg("n.queens.backtrack", { row }), "backtrack", [row, col]);
      }
    }
    return false;
  };

  snap(11, msg("n.queens.start", { n }), "try");
  solve(0);
  return steps;
}

// ── Sudoku ──────────────────────────────────────────────────────────────
export type SudokuStatus = "scan" | "try" | "place" | "reject" | "backtrack" | "solved";

export interface SudokuStep {
  codeLine: number;
  note: Note;
  grid: number[][];
  active?: [number, number];
  digit?: number;
  status: SudokuStatus;
}

/** Easy puzzle with a handful of blanks — enough to show try/backtrack. */
export const SUDOKU_PUZZLE: number[][] = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

/**
 * Cells to blank out (row, col).
 *
 * Chosen so the solver genuinely has to back up: the previous set happened to
 * be fillable left-to-right in one pass, which meant the Sudoku demo in the
 * *backtracking* category never once backtracked. This one forces three dead
 * ends while keeping the run under a hundred steps.
 */
const BLANKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 8],
  [1, 2],
  [2, 5],
  [3, 0],
  [4, 1],
  [4, 8],
  [7, 0],
  [7, 3],
  [8, 3],
];

export function makeSudokuGrid(): { grid: number[][]; fixed: boolean[][] } {
  const grid = SUDOKU_PUZZLE.map((r) => r.slice());
  const fixed = grid.map((r) => r.map(() => true));
  for (const [r, c] of BLANKS) {
    grid[r][c] = 0;
    fixed[r][c] = false;
  }
  return { grid, fixed };
}

function sudokuValid(
  g: number[][],
  r: number,
  c: number,
  d: number
): boolean {
  for (let i = 0; i < 9; i++) {
    if (g[r][i] === d || g[i][c] === d) return false;
    if (g[3 * Math.floor(r / 3) + Math.floor(i / 3)][
      3 * Math.floor(c / 3) + (i % 3)
    ] === d)
      return false;
  }
  return true;
}

export function sudokuSteps(grid0: number[][]): SudokuStep[] {
  const g = grid0.map((r) => r.slice());
  const steps: SudokuStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    status: SudokuStatus,
    active?: [number, number],
    digit?: number
  ) =>
    steps.push({
      codeLine,
      note,
      grid: g.map((r) => r.slice()),
      active,
      digit,
      status,
    });

  const solve = (): boolean => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (g[r][c]) continue;
        snap(13, msg("n.sudoku.scan", { r, c }), "scan", [r, c]);
        for (let d = 1; d <= 9; d++) {
          const ok = sudokuValid(g, r, c, d);
          snap(
            15,
            msg(ok ? "n.sudoku.tryValid" : "n.sudoku.tryInvalid", { d, r, c }),
            ok ? "try" : "reject",
            [r, c],
            d
          );
          if (ok) {
            g[r][c] = d;
            snap(16, msg("n.sudoku.place", { d, r, c }), "place", [r, c], d);
            if (solve()) return true;
            g[r][c] = 0;
            snap(18, msg("n.sudoku.backtrack", { r, c }), "backtrack", [r, c], d);
          }
        }
        snap(21, msg("n.sudoku.stuck", { r, c }), "backtrack", [r, c]);
        return false;
      }
    }
    snap(24, msg("n.sudoku.solved"), "solved");
    return true;
  };

  if (!solve()) snap(21, msg("n.sudoku.impossible"), "backtrack");
  return steps;
}

// ── Rat in a Maze ───────────────────────────────────────────────────────
export type MazeStatus = "try" | "move" | "blocked" | "backtrack" | "solved";

export interface MazeStep {
  codeLine: number;
  note: Note;
  maze: number[][];
  path: boolean[][];
  active?: [number, number];
  status: MazeStatus;
}

/** Open cells = 1, walls = 0. Left column dead-ends force real backtracking. */
export const SAMPLE_MAZE: number[][] = [
  [1, 1, 1, 1],
  [1, 0, 0, 1],
  [1, 1, 0, 1],
  [1, 0, 0, 1],
];

export function mazeSteps(maze0: number[][]): MazeStep[] {
  const N = maze0.length;
  const maze = maze0.map((r) => r.slice());
  const sol = maze.map((r) => r.map(() => false));
  const steps: MazeStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    status: MazeStatus,
    active?: [number, number]
  ) =>
    steps.push({
      codeLine,
      note,
      maze,
      path: sol.map((r) => r.slice()),
      active,
      status,
    });

  // Directions: down, right, up, left — codeLine matches each `if (solve(...))`.
  const DIRS: [number, number, StepNoteKey, number][] = [
    [1, 0, "n.maze.dir.down", 11],
    [0, 1, "n.maze.dir.right", 12],
    [-1, 0, "n.maze.dir.up", 13],
    [0, -1, "n.maze.dir.left", 14],
  ];

  const solve = (r: number, c: number): boolean => {
    // Bounds and walls are checked BEFORE the exit test. The other order (and
    // the C snippet that used to match it) accepted a walled-off exit as a
    // solution and drew the path straight through the wall.
    if (r < 0 || c < 0 || r >= N || c >= N) return false;
    if (maze[r][c] === 0 || sol[r][c]) {
      snap(
        4,
        msg(maze[r][c] === 0 ? "n.maze.wall" : "n.maze.onPath", { r, c }),
        "blocked",
        [r, c]
      );
      return false;
    }

    sol[r][c] = true;
    snap(7, msg("n.maze.step", { r, c }), "move", [r, c]);
    if (r === N - 1 && c === N - 1) {
      snap(9, msg("n.maze.exit", { r, c }), "solved", [r, c]);
      return true;
    }

    for (const [dr, dc, dirKey, line] of DIRS) {
      snap(line, msg("n.maze.try", { r, c, dir: `@${dirKey}` }), "try", [r, c]);
      if (solve(r + dr, c + dc)) return true;
    }
    sol[r][c] = false;
    snap(15, msg("n.maze.backtrack", { r, c }), "backtrack", [r, c]);
    return false;
  };

  if (!solve(0, 0)) {
    snap(
      16,
      maze[N - 1][N - 1] === 0
        ? msg("n.maze.blockedExit", { r: N - 1, c: N - 1 })
        : msg("n.maze.noRoute"),
      "backtrack"
    );
  }
  return steps;
}

// ── Subsets & Permutations (choice tree) ────────────────────────────────
export type ChoiceStatus =
  | "add"
  | "skip"
  | "recurse"
  | "backtrack"
  | "complete";

export interface ChoiceStep {
  codeLine: number;
  note: Note;
  /** The partial candidate being built. */
  current: number[];
  /** Index within `current` to emphasise. */
  highlight?: number;
  /** Permutations: first `fixed` entries are locked in place. */
  fixed?: number;
  results: number[][];
  status: ChoiceStatus;
}

export function subsetsSteps(a: number[]): ChoiceStep[] {
  const n = a.length;
  const results: number[][] = [];
  const steps: ChoiceStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    status: ChoiceStatus,
    current: number[],
    highlight?: number
  ) =>
    steps.push({
      codeLine,
      note,
      current: current.slice(),
      highlight,
      results: results.map((r) => r.slice()),
      status,
    });

  const rec = (i: number, cur: number[]) => {
    if (i === n) {
      results.push([...cur]);
      snap(2, msg("n.subsets.record", { set: cur.join(", ") }), "complete", cur);
      return;
    }
    cur.push(a[i]);
    snap(5, msg("n.subsets.include", { value: a[i] }), "add", cur, cur.length - 1);
    rec(i + 1, cur);
    cur.pop();
    snap(7, msg("n.subsets.exclude", { value: a[i] }), "backtrack", cur);
    rec(i + 1, cur);
  };

  rec(0, []);
  return steps;
}

export function permutationsSteps(a: number[]): ChoiceStep[] {
  const n = a.length;
  const arr = a.slice();
  const results: number[][] = [];
  const steps: ChoiceStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    status: ChoiceStatus,
    fixed: number,
    highlight?: number
  ) =>
    steps.push({
      codeLine,
      note,
      current: arr.slice(),
      highlight,
      fixed,
      results: results.map((r) => r.slice()),
      status,
    });

  const rec = (k: number) => {
    if (k === n) {
      results.push([...arr]);
      snap(2, msg("n.perms.record", { perm: arr.join(", ") }), "complete", n);
      return;
    }
    for (let i = k; i < n; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      snap(6, msg("n.perms.fix", { k, value: arr[k] }), "add", k + 1, k);
      rec(k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
      snap(8, msg("n.perms.undo", { k }), "backtrack", k);
    }
  };

  rec(0);
  return steps;
}
