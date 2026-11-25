import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BACKTRACK_COUNTERS,
  DP_COUNTERS,
  GRAPH_COUNTERS,
  runningCounters,
  type CounterTrack,
} from "../lib/op-counters";
import {
  DIRECTED_DAG,
  GRAPH_ALGOS,
  SAMPLE_GRAPH,
  bfsSteps,
  dfsSteps,
  dijkstraSteps,
  kruskalSteps,
  topoSortSteps,
} from "../lib/simulations/graphs";
import {
  FW_GRAPH,
  floydWarshallSteps,
  knapsackSteps,
  lcsSteps,
} from "../lib/simulations/dp";
import {
  SAMPLE_MAZE,
  makeSudokuGrid,
  mazeSteps,
  nQueensSteps,
  permutationsSteps,
  subsetsSteps,
  sudokuSteps,
} from "../lib/simulations/backtracking";

const final = (tracks: CounterTrack[], key: string): number | undefined =>
  tracks.find((t) => t.key === key)?.totals.at(-1);

test("running totals are prefix sums, one per step, and silent counters are dropped", () => {
  const steps = [1, 0, 2, 0, 3];
  const tracks = runningCounters(steps, [
    { key: "stat.choices", delta: (s) => s },
    { key: "stat.backtracks", delta: () => 0 },
  ]);
  assert.deepEqual(tracks, [{ key: "stat.choices", totals: [1, 1, 3, 3, 6] }]);
  assert.deepEqual(runningCounters([], GRAPH_COUNTERS), []);
});

test("each counter sees the previous step, and none before the first", () => {
  const seen: (number | undefined)[] = [];
  runningCounters([5, 6, 7], [{ key: "stat.choices", delta: (_s, prev) => (seen.push(prev), 1) }]);
  assert.deepEqual(seen, [undefined, 5, 6]);
});

test("BFS and DFS on an undirected graph examine every edge from both ends", () => {
  for (const start of SAMPLE_GRAPH.nodes.map((n) => n.id)) {
    for (const run of [bfsSteps, dfsSteps]) {
      const tracks = runningCounters(run(SAMPLE_GRAPH, start), GRAPH_COUNTERS);
      assert.equal(final(tracks, "stat.edgesExamined"), 2 * SAMPLE_GRAPH.edges.length);
      // An unweighted traversal relaxes nothing, so that counter is not shown.
      assert.equal(final(tracks, "stat.relaxations"), undefined);
    }
  }
});

test("topological sort examines each directed edge once", () => {
  const tracks = runningCounters(topoSortSteps(DIRECTED_DAG), GRAPH_COUNTERS);
  assert.equal(final(tracks, "stat.edgesExamined"), DIRECTED_DAG.edges.length);
});

test("Dijkstra's relaxations are exactly the distance updates it announces", () => {
  for (const start of SAMPLE_GRAPH.nodes.map((n) => n.id)) {
    const steps = dijkstraSteps(SAMPLE_GRAPH, start);
    const updates = steps.filter((s) => s.note.k === "n.dijkstra.update").length;
    const tracks = runningCounters(steps, GRAPH_COUNTERS);
    assert.equal(final(tracks, "stat.relaxations"), updates);
    // At least one relaxation per node other than the source in a connected graph.
    assert.ok(updates >= SAMPLE_GRAPH.nodes.length - 1);
  }
});

test("every weighted graph run relaxes or rejects something", () => {
  for (const [slug, cfg] of Object.entries(GRAPH_ALGOS)) {
    if (!cfg.weighted) continue;
    const steps = cfg.generate(cfg.graph, 0, cfg.usesGoal ? cfg.graph.nodes.length - 1 : undefined);
    const tracks = runningCounters(steps, GRAPH_COUNTERS);
    const r = (final(tracks, "stat.relaxations") ?? 0) + (final(tracks, "stat.rejectedEdges") ?? 0);
    assert.ok(r > 0, `${slug}: nothing relaxed or rejected`);
  }
});

test("Kruskal counts every edge it drops for closing a cycle", () => {
  const steps = kruskalSteps(SAMPLE_GRAPH);
  const tracks = runningCounters(steps, GRAPH_COUNTERS);
  assert.equal(final(tracks, "stat.rejectedEdges"), steps.at(-1)!.rejectedEdges!.length);
  assert.equal(final(tracks, "stat.edgesExamined"), SAMPLE_GRAPH.edges.length);
});

test("LCS and knapsack write every table cell exactly once", () => {
  const lcs = lcsSteps("ABCBDAB", "BDCABA");
  assert.equal(
    final(runningCounters(lcs.steps, DP_COUNTERS), "stat.cellsWritten"),
    (lcs.a.length + 1) * (lcs.b.length + 1)
  );
  const items = [
    { weight: 1, value: 1 },
    { weight: 3, value: 4 },
    { weight: 4, value: 5 },
  ];
  const knap = knapsackSteps(items, 7);
  assert.equal(
    final(runningCounters(knap.steps, DP_COUNTERS), "stat.cellsWritten"),
    (items.length + 1) * (7 + 1)
  );
});

test("Floyd-Warshall counts its copy of the graph, then only the distances it improves", () => {
  const { steps } = floydWarshallSteps(FW_GRAPH);
  const V = FW_GRAPH.length;
  let improved = 0;
  for (let i = 1; i < steps.length; i++)
    for (let r = 0; r < FW_GRAPH.length; r++)
      for (let c = 0; c < FW_GRAPH.length; c++)
        if (steps[i].table[r][c] !== steps[i - 1].table[r][c]) improved++;
  assert.ok(improved > 0);
  const tracks = runningCounters(steps, DP_COUNTERS);
  assert.equal(tracks[0].totals[0], V * V);
  assert.equal(final(tracks, "stat.cellsWritten"), V * V + improved);
});

test("choices minus backtracks is what the partial solution grew by", () => {
  const queens = nQueensSteps(6);
  const q = runningCounters(queens, BACKTRACK_COUNTERS);
  assert.equal((final(q, "stat.choices") ?? 0) - (final(q, "stat.backtracks") ?? 0), 6);
  assert.ok((final(q, "stat.backtracks") ?? 0) > 0);
  assert.ok((final(q, "stat.deadEnds") ?? 0) > 0);

  // No solution: every queen placed is taken back.
  const none = runningCounters(nQueensSteps(3), BACKTRACK_COUNTERS);
  assert.equal(final(none, "stat.choices"), final(none, "stat.backtracks"));

  const { grid } = makeSudokuGrid();
  const blanks = grid.flat().filter((d) => d === 0).length;
  const sudoku = runningCounters(sudokuSteps(grid), BACKTRACK_COUNTERS);
  assert.equal((final(sudoku, "stat.choices") ?? 0) - (final(sudoku, "stat.backtracks") ?? 0), blanks);

  const maze = mazeSteps(SAMPLE_MAZE);
  const path = maze.at(-1)!.path.flat().filter(Boolean).length;
  const m = runningCounters(maze, BACKTRACK_COUNTERS);
  assert.equal((final(m, "stat.choices") ?? 0) - (final(m, "stat.backtracks") ?? 0), path);
});

test("subsets and permutations take back every choice they make", () => {
  for (const steps of [subsetsSteps([1, 2, 3]), permutationsSteps([1, 2, 3])]) {
    const tracks = runningCounters(steps, BACKTRACK_COUNTERS);
    assert.ok((final(tracks, "stat.choices") ?? 0) > 0);
    assert.equal(final(tracks, "stat.choices"), final(tracks, "stat.backtracks"));
    // No candidate is ever rejected outright, so dead ends are not shown.
    assert.equal(final(tracks, "stat.deadEnds"), undefined);
  }
});
