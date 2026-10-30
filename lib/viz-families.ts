/**
 * Which custom visualizer family draws an algorithm. Kept apart from the
 * components so the workspace can pick one without bundling all eight.
 */

const DS_SLUGS = new Set(["stack", "queue", "linked-list", "hash-table"]);

/** Mirrors the keys of `GRAPH_ALGOS` (enforced by `npm test`). */
export const GRAPH_SLUGS = new Set([
  "bfs",
  "dfs",
  "dijkstra",
  "bellman-ford",
  "topological-sort",
  "prim",
  "kruskal",
  "a-star",
]);

const DP_SLUGS = new Set([
  "lcs",
  "knapsack",
  "edit-distance",
  "coin-change",
  "fibonacci",
  "lis",
  "floyd-warshall",
  "kadane",
]);

const BT_SLUGS = new Set([
  "n-queens",
  "sudoku",
  "rat-in-a-maze",
  "subsets",
  "permutations",
]);

const TREE_SLUGS = new Set([
  "bst",
  "avl",
  "heap",
  "trie",
  "segment-tree",
  "union-find",
]);

/** Mirrors the keys of `STRING_ALGOS` (enforced by `npm test`). */
export const STRING_SLUGS = new Set([
  "kmp",
  "rabin-karp",
  "z-algorithm",
  "manacher",
  "boyer-moore",
]);

const GREEDY_SLUGS = new Set([
  "activity-selection",
  "fractional-knapsack",
  "job-sequencing",
  "huffman-coding",
]);

const MATH_SLUGS = new Set([
  "sieve-of-eratosthenes",
  "euclidean-gcd",
  "extended-euclidean",
  "fast-exponentiation",
]);

export function hasDataStructureViz(slug: string): boolean {
  return DS_SLUGS.has(slug);
}

export function hasGraphViz(slug: string): boolean {
  return GRAPH_SLUGS.has(slug);
}

export function hasDpViz(slug: string): boolean {
  return DP_SLUGS.has(slug);
}

export function hasBacktrackViz(slug: string): boolean {
  return BT_SLUGS.has(slug);
}

export function hasTreeViz(slug: string): boolean {
  return TREE_SLUGS.has(slug);
}

export function hasStringViz(slug: string): boolean {
  return STRING_SLUGS.has(slug);
}

export function hasGreedyViz(slug: string): boolean {
  return GREEDY_SLUGS.has(slug);
}

export function hasMathViz(slug: string): boolean {
  return MATH_SLUGS.has(slug);
}
