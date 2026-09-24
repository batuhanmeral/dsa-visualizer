/**
 * One representative run per algorithm, used by the cross-cutting tests
 * (code-line bounds, note dictionary coverage).
 *
 * Every algorithm in `lib/data.ts` that has an engine must appear here, and
 * `coverage.test.ts` fails if one is missing — so adding an engine without a
 * fixture is caught rather than silently skipped.
 */
import type { Note } from "../lib/simulations/note";
import * as sorting from "../lib/simulations/sorting";
import * as searching from "../lib/simulations/searching";
import * as graphs from "../lib/simulations/graphs";
import * as trees from "../lib/simulations/trees";
import * as dp from "../lib/simulations/dp";
import * as greedy from "../lib/simulations/greedy";
import * as math from "../lib/simulations/math";
import * as strings from "../lib/simulations/strings";
import * as backtracking from "../lib/simulations/backtracking";

interface Step {
  codeLine: number;
  note: Note;
}

const A = [23, 7, 41, 15, 3, 34, 9, 28];
const sources = [0, 1, 2, 3, 4, 5];

/** Steps for a slug, covering hit/miss and both branches where they differ. */
export const fixtures: Record<string, () => Step[]> = {
  "bubble-sort": () => sorting.bubbleSortSteps(A),
  "selection-sort": () => sorting.selectionSortSteps(A),
  "insertion-sort": () => sorting.insertionSortSteps(A),
  "shell-sort": () => sorting.shellSortSteps(A),
  "merge-sort": () => sorting.mergeSortSteps(A),
  "quick-sort": () => sorting.quickSortSteps(A),
  "heap-sort": () => sorting.heapSortSteps(A),
  "radix-sort": () => sorting.radixSortSteps([5, 1234, 77, 903, 12]),
  "counting-sort": () => [
    ...sorting.countingSortSteps(A),
    ...sorting.countingSortSteps([]),
  ],
  "bucket-sort": () => [
    ...sorting.bucketSortSteps(A),
    ...sorting.bucketSortSteps([]),
  ],

  "linear-search": () => [
    ...searching.linearSearchSteps(A, 15),
    ...searching.linearSearchSteps(A, 99),
  ],
  "binary-search": () => [
    ...searching.binarySearchSteps(A, 15),
    ...searching.binarySearchSteps(A, 99),
    ...searching.binarySearchSteps(A, 1),
  ],
  "jump-search": () => [
    ...searching.jumpSearchSteps(A, 15),
    ...searching.jumpSearchSteps(A, 99),
    ...searching.jumpSearchSteps(A, 1),
    ...searching.jumpSearchSteps(A, 8),
    ...searching.jumpSearchSteps([], 1),
  ],
  "interpolation-search": () => [
    ...searching.interpolationSearchSteps(A, 15),
    ...searching.interpolationSearchSteps(A, 99),
    ...searching.interpolationSearchSteps(A, 1),
    ...searching.interpolationSearchSteps([7, 7, 7], 7),
    ...searching.interpolationSearchSteps([4, 9], 5),
    // Probe lands above the target — the only route to the left-half branch.
    ...searching.interpolationSearchSteps([6, 22, 42, 49], 35),
    // Window collapses to a single cell.
    ...searching.interpolationSearchSteps([0], 0),
  ],

  bfs: () => sources.flatMap((s) => graphs.bfsSteps(graphs.SAMPLE_GRAPH, s)),
  dfs: () => sources.flatMap((s) => graphs.dfsSteps(graphs.SAMPLE_GRAPH, s)),
  dijkstra: () => [
    ...sources.flatMap((s) => graphs.dijkstraSteps(graphs.SAMPLE_GRAPH, s)),
    ...graphs.dijkstraSteps(
      { nodes: graphs.SAMPLE_GRAPH.nodes, edges: [{ from: 0, to: 1, weight: 3 }] },
      0
    ),
  ],
  "bellman-ford": () => [
    ...sources.flatMap((s) => graphs.bellmanFordSteps(graphs.DIRECTED_DAG, s)),
    ...graphs.bellmanFordSteps(
      {
        nodes: graphs.SAMPLE_GRAPH.nodes,
        directed: true,
        edges: [
          { from: 0, to: 1, weight: 1 },
          { from: 1, to: 2, weight: -3 },
          { from: 2, to: 1, weight: 1 },
        ],
      },
      0
    ),
    // Negative weights, no cycle, and long enough to use all V-1 passes.
    ...graphs.bellmanFordSteps(
      {
        nodes: graphs.SAMPLE_GRAPH.nodes,
        directed: true,
        edges: [
          { from: 5, to: 4, weight: -2 },
          { from: 4, to: 3, weight: -2 },
          { from: 3, to: 2, weight: -2 },
          { from: 2, to: 1, weight: -2 },
          { from: 1, to: 0, weight: -2 },
          { from: 0, to: 5, weight: 20 },
        ],
      },
      5
    ),
  ],
  "topological-sort": () => [
    ...graphs.topoSortSteps(graphs.DIRECTED_DAG),
    ...graphs.topoSortSteps({
      nodes: graphs.SAMPLE_GRAPH.nodes,
      directed: true,
      edges: [
        { from: 0, to: 1, weight: 1 },
        { from: 1, to: 2, weight: 1 },
        { from: 2, to: 0, weight: 1 },
      ],
    }),
  ],
  prim: () => sources.flatMap((s) => graphs.primSteps(graphs.SAMPLE_GRAPH, s)),
  kruskal: () => graphs.kruskalSteps(graphs.SAMPLE_GRAPH),
  "a-star": () => [
    ...sources.flatMap((s) =>
      [0, 3, 5].flatMap((g) => graphs.aStarSteps(graphs.GEOMETRIC_GRAPH, s, g))
    ),
    // Goal in a different component: the open set drains without reaching it.
    ...graphs.aStarSteps(
      { nodes: graphs.GEOMETRIC_GRAPH.nodes, edges: [{ from: 0, to: 1, weight: 3 }] },
      0,
      5
    ),
  ],

  bst: () => [
    ...trees.bstSteps([50, 30, 70, 20, 40, 60, 80], 40, 30),
    ...trees.bstSteps([50, 30, 70], 99, 99),
    ...trees.bstSteps([50, 50, 30], 50, 50),
    ...trees.bstSteps([50, 30, 70, 60, 80], 60, 70),
  ],
  avl: () => [
    ...trees.avlSteps([10, 20, 30, 40, 50, 25]),
    ...trees.avlSteps([50, 40, 30, 20, 10, 5]),
    ...trees.avlSteps([30, 10, 20]),
    ...trees.avlSteps([10, 30, 20]),
  ],
  heap: () => [
    ...trees.heapSteps([15, 40, 30, 50, 20, 60, 45], 2),
    ...trees.heapSteps([1], 1),
  ],
  trie: () => [
    ...trees.trieSteps(["CAT", "CAR", "CARD", "DOG", "DO"], "CARD"),
    ...trees.trieSteps(["CAT"], "ZZ"),
    ...trees.trieSteps(["CAT"], "CA"),
  ],
  "segment-tree": () => [
    ...trees.segmentTreeSteps([2, 5, 1, 4, 9, 3, 7, 6], 2, 5),
    ...trees.segmentTreeSteps([], 0, 0),
  ],
  "union-find": () => [
    ...trees.unionFindSteps([[0, 1], [2, 3], [1, 3], [4, 5], [0, 5], [1, 2]], 4, 6),
    // Unions of unequal rank, and a find that compresses a two-hop path.
    ...trees.unionFindSteps([[4, 0], [1, 1], [3, 4]], 3, 5),
    // A find that has a node to compress (rank union keeps trees very shallow,
    // so a compressible path takes a specific union order to produce).
    ...trees.unionFindSteps([[2, 1], [0, 3], [3, 3], [1, 2], [2, 0]], 3, 4),
  ],

  lcs: () => dp.lcsSteps("AGGTAB", "GXTXAYB").steps,
  knapsack: () =>
    dp.knapsackSteps(
      [
        { weight: 2, value: 3 },
        { weight: 3, value: 4 },
        { weight: 4, value: 5 },
      ],
      5
    ).steps,
  "edit-distance": () => dp.editDistanceSteps("SUNDAY", "SATURDAY").steps,
  "coin-change": () => [
    ...dp.coinChangeSteps([1, 3, 4], 6).steps,
    ...dp.coinChangeSteps([5], 3).steps,
  ],
  "floyd-warshall": () => dp.floydWarshallSteps().steps,
  fibonacci: () => [...dp.fibonacciSteps(10).steps, ...dp.fibonacciSteps(0).steps],
  kadane: () => [
    ...dp.kadaneSteps([-2, 1, -3, 4, -1, 2, 1, -5, 4]).steps,
    ...dp.kadaneSteps([]).steps,
  ],
  lis: () => [...dp.lisSteps([10, 9, 2, 5, 3, 7]).steps, ...dp.lisSteps([]).steps],

  "activity-selection": () => [
    ...greedy.activitySelectionSteps([
      { start: 1, end: 4 },
      { start: 3, end: 5 },
      { start: 0, end: 6 },
      { start: 5, end: 7 },
    ]).steps,
    ...greedy.activitySelectionSteps([]).steps,
  ],
  "fractional-knapsack": () => [
    ...greedy.fractionalKnapsackSteps(
      [
        { weight: 10, value: 60 },
        { weight: 20, value: 100 },
        { weight: 30, value: 120 },
      ],
      50
    ).steps,
    ...greedy.fractionalKnapsackSteps([], 5).steps,
  ],
  "job-sequencing": () => [
    ...greedy.jobSequencingSteps([
      { id: "a", deadline: 2, profit: 100 },
      { id: "b", deadline: 1, profit: 19 },
      { id: "c", deadline: 2, profit: 27 },
      { id: "d", deadline: 1, profit: 25 },
    ]).steps,
    ...greedy.jobSequencingSteps([]).steps,
  ],
  "huffman-coding": () => [
    ...greedy.huffmanSteps([
      { ch: "A", freq: 5 },
      { ch: "B", freq: 9 },
      { ch: "C", freq: 12 },
      { ch: "D", freq: 13 },
    ]).steps,
    ...greedy.huffmanSteps([{ ch: "A", freq: 1 }]).steps,
    ...greedy.huffmanSteps([]).steps,
  ],

  "sieve-of-eratosthenes": () => [
    ...math.sieveSteps(60).steps,
    ...math.sieveSteps(1).steps,
  ],
  "euclidean-gcd": () => [
    ...math.gcdSteps(252, 105).steps,
    ...math.gcdSteps(1, 0).steps,
  ],
  "extended-euclidean": () => math.extGcdSteps(240, 46).steps,
  "fast-exponentiation": () => [
    ...math.fastPowSteps(3, 13, 100).steps,
    ...math.fastPowSteps(2, 0, 7).steps,
  ],

  kmp: () => [
    ...strings.kmpSteps("ABABDABACDABABCABAB", "ABABCABAB"),
    ...strings.kmpSteps("AAAA", "AA"),
    ...strings.kmpSteps("BBB", "A"),
    ...strings.kmpSteps("A", ""),
    ...strings.kmpSteps("", "A"),
    ...strings.kmpSteps("AB", "ABC"),
  ],
  "rabin-karp": () => [
    ...strings.rabinKarpSteps("GEEKSFORGEEKS", "GEEK"),
    ...strings.rabinKarpSteps("AAAA", "AA"),
    ...strings.rabinKarpSteps("BBB", "A"),
    ...strings.rabinKarpSteps("A", ""),
    ...strings.rabinKarpSteps("", "A"),
    ...strings.rabinKarpSteps("AB", "ABC"),
  ],
  "z-algorithm": () => [...strings.zSteps("AABXAAYAAB"), ...strings.zSteps("")],
  manacher: () => [
    ...strings.manacherSteps("ABABABA"),
    ...strings.manacherSteps("ABC"),
    ...strings.manacherSteps(""),
  ],
  "boyer-moore": () => [
    ...strings.boyerMooreSteps("ABAAABCDBBABCDDEBCABC", "ABC"),
    ...strings.boyerMooreSteps("AAAA", "AA"),
    ...strings.boyerMooreSteps("BBB", "A"),
    ...strings.boyerMooreSteps("A", ""),
    ...strings.boyerMooreSteps("", "A"),
    ...strings.boyerMooreSteps("AB", "ABC"),
  ],

  "n-queens": () => [4, 5, 6, 7, 8, 2, 3].flatMap((n) => backtracking.nQueensSteps(n)),
  sudoku: () => {
    const contradictory = backtracking.SUDOKU_PUZZLE.map((r) => r.slice());
    contradictory[0][0] = 0;
    contradictory[0][1] = 0;
    contradictory[1][0] = 5;
    return [
      ...backtracking.sudokuSteps(backtracking.makeSudokuGrid().grid),
      ...backtracking.sudokuSteps(contradictory),
    ];
  },
  "rat-in-a-maze": () => [
    ...backtracking.mazeSteps(backtracking.SAMPLE_MAZE),
    ...backtracking.mazeSteps([
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
    ]),
    ...backtracking.mazeSteps([
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 1],
    ]),
  ],
  subsets: () => backtracking.subsetsSteps([1, 2, 3]),
  permutations: () => backtracking.permutationsSteps([1, 2, 3]),
};
