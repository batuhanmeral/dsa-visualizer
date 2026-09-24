/**
 * Picks the loop invariant that holds at a given step.
 *
 * Step notes narrate; invariants explain. The note says "swap 7 and 3", the
 * invariant says "everything left of i is already smaller than the pivot" —
 * which is the reason the swap is allowed, and the part that turns a trace of
 * operations into an argument for why the algorithm is correct.
 *
 * Several algorithms change invariant between phases, so a slug maps to a list
 * of rules and the first match wins. The last rule of each list has no
 * condition, which makes it the default.
 */
import type { SimulationStep } from "./simulations/types";
import { msg, type Note, type StepNoteKey } from "./simulations/note";

interface Rule {
  /** Applies when this returns true; omit for the phase-independent default. */
  when?: (step: SimulationStep) => boolean;
  key: StepNoteKey;
  /** Values the invariant's template needs, read off the step. */
  vars?: (step: SimulationStep) => Record<string, string | number>;
}

/** Look a watched variable up by name; `-1` when the step does not track it. */
const v = (step: SimulationStep, label: string): number => {
  const found = step.vars?.find((x) => x.label === label)?.value;
  return typeof found === "number" ? found : -1;
};

const RULES: Record<string, Rule[]> = {
  "bubble-sort": [
    { key: "inv.bubble", vars: (s) => ({ locked: s.sorted.length }) },
  ],
  "selection-sort": [
    { key: "inv.select", vars: (s) => ({ i: Math.max(v(s, "i"), 0) }) },
  ],
  "insertion-sort": [
    { key: "inv.insert", vars: (s) => ({ i: Math.max(v(s, "i"), 1) }) },
  ],
  "shell-sort": [
    { key: "inv.shell", vars: (s) => ({ gap: Math.max(v(s, "gap"), 1) }) },
  ],
  "merge-sort": [
    // Line 15 is the recursive split; the merge body is lines 6..10.
    { when: (s) => s.codeLine >= 15, key: "inv.merge.split" },
    { key: "inv.merge.merge" },
  ],
  "quick-sort": [
    { when: (s) => s.codeLine === 9, key: "inv.quick.placed" },
    { key: "inv.quick.partition" },
  ],
  "heap-sort": [
    // Lines 14..15 build the heap; from 16 on it is extracted.
    { when: (s) => s.codeLine >= 16, key: "inv.heapsort.extract" },
    { key: "inv.heapsort.build" },
  ],
  "counting-sort": [
    { when: (s) => s.codeLine >= 12, key: "inv.counting.place" },
    { key: "inv.counting.count" },
  ],
  "radix-sort": [{ key: "inv.radix" }],
  "bucket-sort": [{ key: "inv.bucket" }],

  "linear-search": [{ key: "inv.linear" }],
  "binary-search": [
    {
      key: "inv.binary",
      vars: (s) => ({ lo: s.range?.[0] ?? 0, hi: s.range?.[1] ?? 0 }),
    },
  ],
  "jump-search": [
    // The linear scan inside the candidate block starts at line 9.
    { when: (s) => s.codeLine >= 9, key: "inv.jump.scan" },
    { key: "inv.jump.blocks" },
  ],
  "interpolation-search": [
    {
      key: "inv.interp",
      vars: (s) => ({ lo: s.range?.[0] ?? 0, hi: s.range?.[1] ?? 0 }),
    },
  ],
};

/** The invariant holding at `step` of `slug`, or `null` if none is written. */
export function invariantFor(
  slug: string,
  step: SimulationStep
): Note | null {
  const rules = RULES[slug];
  if (!rules) return null;
  for (const rule of rules)
    if (!rule.when || rule.when(step))
      return msg(rule.key, rule.vars?.(step));
  return null;
}

/**
 * The phase-independent invariant for algorithms whose visualizers do not use
 * `SimulationStep` (graphs, trees, DP, …). One statement each: their phases are
 * already obvious from the canvas, so a changing line would add noise.
 */
const STATIC: Record<string, StepNoteKey> = {
  bfs: "inv.bfs",
  dfs: "inv.dfs",
  dijkstra: "inv.dijkstra",
  "bellman-ford": "inv.bellman",
  "topological-sort": "inv.topo",
  prim: "inv.prim",
  kruskal: "inv.kruskal",
  "a-star": "inv.astar",
  "floyd-warshall": "inv.floyd",

  bst: "inv.bst",
  avl: "inv.avl",
  heap: "inv.heap",
  trie: "inv.trie",
  "segment-tree": "inv.segment",
  "union-find": "inv.unionfind",

  lcs: "inv.lcs",
  knapsack: "inv.knapsack",
  "edit-distance": "inv.edit",
  "coin-change": "inv.coin",
  fibonacci: "inv.fib",
  kadane: "inv.kadane",
  lis: "inv.lis",

  "activity-selection": "inv.activity",
  "fractional-knapsack": "inv.frac",
  "job-sequencing": "inv.job",
  "huffman-coding": "inv.huffman",

  "n-queens": "inv.queens",
  sudoku: "inv.sudoku",
  "rat-in-a-maze": "inv.maze",
  subsets: "inv.subsets",
  permutations: "inv.perms",

  kmp: "inv.kmp",
  "rabin-karp": "inv.rk",
  "z-algorithm": "inv.z",
  manacher: "inv.manacher",
  "boyer-moore": "inv.bm",

  "linked-list": "inv.list",
  stack: "inv.stack",
  queue: "inv.queue",
  "hash-table": "inv.hash",

  "sieve-of-eratosthenes": "inv.sieve",
  "euclidean-gcd": "inv.gcd",
  "extended-euclidean": "inv.extgcd",
  "fast-exponentiation": "inv.pow",
};

/** The single invariant for a slug, ignoring phase. `null` if none is written. */
export function staticInvariantFor(slug: string): Note | null {
  const key = STATIC[slug];
  return key ? msg(key) : null;
}

/** Slugs covered by either lookup — used by the tests. */
export const INVARIANT_SLUGS = [
  ...Object.keys(RULES),
  ...Object.keys(STATIC),
];
