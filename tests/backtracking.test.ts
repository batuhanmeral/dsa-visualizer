import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeSudokuGrid,
  mazeSteps,
  nQueensSteps,
  permutationsSteps,
  SAMPLE_MAZE,
  subsetsSteps,
  sudokuSteps,
  SUDOKU_PUZZLE,
  type MazeStep,
} from "../lib/simulations/backtracking";
import { rng } from "./helpers";

test("N-Queens solves every solvable board and never shows an illegal one", () => {
  for (let n = 1; n <= 8; n++) {
    const steps = nQueensSteps(n);
    const solved = steps.find((s) => s.status === "solved");
    const solvable = n !== 2 && n !== 3;
    assert.equal(!!solved, solvable, `n=${n}`);
    if (solved) {
      const q = solved.queens;
      assert.ok(q.every((c) => c >= 0), `n=${n} board incomplete`);
      for (let r = 0; r < n; r++)
        for (let s = r + 1; s < n; s++) {
          assert.notEqual(q[r], q[s], `n=${n}: rows ${r},${s} share a column`);
          assert.notEqual(
            Math.abs(q[r] - q[s]),
            Math.abs(r - s),
            `n=${n}: rows ${r},${s} share a diagonal`
          );
        }
    }
    // Every intermediate board must be a legal partial placement too.
    for (const step of steps)
      for (let r = 0; r < n; r++) {
        if (step.queens[r] < 0) continue;
        for (let s = r + 1; s < n; s++) {
          if (step.queens[s] < 0) continue;
          assert.ok(
            step.queens[r] !== step.queens[s] &&
              Math.abs(step.queens[r] - step.queens[s]) !== Math.abs(r - s),
            `n=${n}: illegal partial state [${step.queens}]`
          );
        }
      }
  }
});

test("N-Queens says so when the board has no solution", () => {
  // 2×2 and 3×3 used to end on a plain backtrack, leaving the viewer to guess.
  for (const n of [2, 3])
    assert.equal(nQueensSteps(n).at(-1)!.note.k, "n.queens.impossible", `n=${n}`);
});

test("Sudoku fills the preset puzzle into a valid grid", () => {
  const { grid, fixed } = makeSudokuGrid();
  const steps = sudokuSteps(grid);
  const solved = steps.find((s) => s.status === "solved");
  assert.ok(solved, "the preset puzzle must be solvable");
  // The demo lives in the *backtracking* category, so the preset has to make
  // the solver back up — the previous one was fillable in a single pass.
  assert.ok(
    steps.filter((s) => s.note.k === "n.sudoku.backtrack").length >= 3,
    "the preset puzzle never forces a backtrack"
  );
  const g = solved.grid;
  const complete = (cells: number[]) =>
    [...cells].sort((a, b) => a - b).join("") === "123456789";
  for (let r = 0; r < 9; r++) assert.ok(complete(g[r]), `row ${r}`);
  for (let c = 0; c < 9; c++)
    assert.ok(complete(g.map((row) => row[c])), `column ${c}`);
  for (let br = 0; br < 3; br++)
    for (let bc = 0; bc < 3; bc++) {
      const box: number[] = [];
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) box.push(g[br * 3 + i][bc * 3 + j]);
      assert.ok(complete(box), `box ${br},${bc}`);
    }
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (fixed[r][c])
        assert.equal(g[r][c], SUDOKU_PUZZLE[r][c], `clue ${r},${c} was changed`);
});

test("Sudoku refuses a contradictory grid", () => {
  const grid = SUDOKU_PUZZLE.map((r) => r.slice());
  grid[0][0] = 0;
  grid[0][1] = 0;
  grid[1][0] = 5; // forces a duplicate 5 in column 0
  const steps = sudokuSteps(grid);
  assert.ok(!steps.some((s) => s.status === "solved"));
  assert.equal(steps.at(-1)!.note.k, "n.sudoku.impossible");
});

/** Path cells must be open, and connected from entrance to exit. */
function pathProblem(maze: number[][], steps: MazeStep[]): string | null {
  const N = maze.length;
  const solved = steps.find((s) => s.status === "solved");
  if (!solved) return null;
  const path = solved.path;
  if (!path[0][0]) return "the entrance is not on the path";
  if (!path[N - 1][N - 1]) return "the exit is not on the path";
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (path[r][c] && maze[r][c] === 0) return `the path crosses a wall at ${r},${c}`;
  const seen = new Set(["0,0"]);
  const stack: [number, number][] = [[0, 0]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    for (const [dr, dc] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= N || nc >= N) continue;
      if (path[nr][nc] && !seen.has(`${nr},${nc}`)) {
        seen.add(`${nr},${nc}`);
        stack.push([nr, nc]);
      }
    }
  }
  return seen.has(`${N - 1},${N - 1}`) ? null : "the path is not connected";
}

test("the maze is solved exactly when the exit is reachable", () => {
  const rand = rng(103);
  const mazes = [
    SAMPLE_MAZE,
    ...Array.from({ length: 200 }, (_, k) => {
      const N = 3 + (k % 3);
      const m = Array.from({ length: N }, () =>
        Array.from({ length: N }, () => (rand() < 0.7 ? 1 : 0))
      );
      m[0][0] = 1;
      return m;
    }),
  ];
  for (const maze of mazes) {
    const N = maze.length;
    const seen = new Set(["0,0"]);
    const stack: [number, number][] = [[0, 0]];
    while (stack.length) {
      const [r, c] = stack.pop()!;
      for (const [dr, dc] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= N || nc >= N) continue;
        if (maze[nr][nc] && !seen.has(`${nr},${nc}`)) {
          seen.add(`${nr},${nc}`);
          stack.push([nr, nc]);
        }
      }
    }
    const reachable = seen.has(`${N - 1},${N - 1}`);
    const steps = mazeSteps(maze);
    assert.equal(
      steps.some((s) => s.status === "solved"),
      reachable,
      `reachable=${reachable} for ${JSON.stringify(maze)}`
    );
    const problem = pathProblem(maze, steps);
    assert.equal(problem, null, `${problem} in ${JSON.stringify(maze)}`);
  }
});

test("a walled-off exit is not accepted as solved", () => {
  // The exit test used to run before the wall test, so a walled exit counted
  // as a win and the path was drawn straight through the wall.
  const maze = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 0],
  ];
  const steps = mazeSteps(maze);
  assert.ok(!steps.some((s) => s.status === "solved"));
  assert.equal(steps.at(-1)!.note.k, "n.maze.blockedExit");
});

test("a maze with no route says so", () => {
  const maze = [
    [1, 0, 0],
    [0, 0, 0],
    [0, 0, 1],
  ];
  assert.equal(mazeSteps(maze).at(-1)!.note.k, "n.maze.noRoute");
});

test("subsets enumerates the power set once", () => {
  for (let n = 0; n <= 10; n++) {
    const a = Array.from({ length: n }, (_, i) => i + 1);
    const last = subsetsSteps(a).at(-1)!;
    const results = last.results.slice(0, last.resultCount);
    assert.equal(results.length, 2 ** n, `n=${n}`);
    assert.equal(
      new Set(results.map((r) => r.join(","))).size,
      results.length,
      `n=${n} has duplicates`
    );
    for (const r of results)
      assert.ok(
        r.every((v, i) => i === 0 || v > r[i - 1]),
        `subset [${r}] is not in input order`
      );
  }
});

test("permutations enumerates n! arrangements once", () => {
  for (let n = 0; n <= 6; n++) {
    const a = Array.from({ length: n }, (_, i) => i + 1);
    const last = permutationsSteps(a).at(-1)!;
    const results = last.results.slice(0, last.resultCount);
    const factorial = a.reduce((s, v) => s * v, 1);
    assert.equal(results.length, factorial, `n=${n}`);
    assert.equal(
      new Set(results.map((r) => r.join(","))).size,
      results.length,
      `n=${n} has duplicates`
    );
    for (const r of results)
      assert.deepEqual([...r].sort((x, y) => x - y), a, `[${r}] is not a permutation`);
  }
});

test("choice steps share one results array instead of copying it per step", () => {
  // Copying made permutations O(n!·n!) in memory: n = 7 exhausted a 2 GB heap.
  const steps = permutationsSteps([1, 2, 3, 4, 5, 6, 7]);
  const first = steps[0].results;
  assert.ok(
    steps.every((s) => s.results === first),
    "every step must reference the same array"
  );
  assert.equal(steps.at(-1)!.resultCount, 5040);
  assert.ok(
    steps.every((s, i) => i === 0 || s.resultCount >= steps[i - 1].resultCount),
    "resultCount must only grow"
  );
});
