/**
 * Dynamic-programming engines — pure step generators that fill a 2-D table
 * one cell at a time. Each returns an ordered `DPStep[]` the renderer replays.
 * `codeLine` values are 0-based and MUST match the C code in lib/data.ts.
 */

export interface DPStep {
  codeLine: number;
  note: string;
  /** Full table snapshot; `null` = not yet computed. */
  table: (number | null)[][];
  /** Cell being written this step. */
  active?: [number, number];
  /** Cells the active cell reads from. */
  deps: [number, number][];
  /** For LCS: whether the two compared characters matched. */
  match?: boolean;
  /** For Floyd-Warshall: the intermediate node of the current round. */
  k?: number;
}

// ── Longest Common Subsequence ──────────────────────────────────────────
export interface LCSResult {
  a: string;
  b: string;
  steps: DPStep[];
}

export function lcsSteps(aRaw: string, bRaw: string): LCSResult {
  const a = aRaw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  const b = bRaw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  const m = a.length;
  const n = b.length;
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array<number | null>(n + 1).fill(null)
  );
  const steps: DPStep[] = [];
  const snap = (
    codeLine: number,
    note: string,
    active: [number, number] | undefined,
    deps: [number, number][],
    match?: boolean
  ) =>
    steps.push({
      codeLine,
      note,
      table: dp.map((r) => r.slice()),
      active,
      deps,
      match,
    });

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0 || j === 0) {
        snap(8, `Row ${i}, col ${j}: an empty string has no subsequence.`, [
          i,
          j,
        ], []);
        dp[i][j] = 0;
        snap(9, `Base case → dp[${i}][${j}] = 0.`, [i, j], []);
      } else {
        const ca = a[i - 1];
        const cb = b[j - 1];
        const isMatch = ca === cb;
        snap(
          10,
          `Compare a[${i - 1}]='${ca}' with b[${j - 1}]='${cb}'.`,
          [i, j],
          [],
          isMatch
        );
        if (isMatch) {
          const val = (dp[i - 1][j - 1] ?? 0) + 1;
          dp[i][j] = val;
          snap(
            11,
            `Match! Extend the diagonal: dp[${i}][${j}] = dp[${i - 1}][${
              j - 1
            }] + 1 = ${val}.`,
            [i, j],
            [[i - 1, j - 1]],
            true
          );
        } else {
          const up = dp[i - 1][j] ?? 0;
          const left = dp[i][j - 1] ?? 0;
          const val = Math.max(up, left);
          dp[i][j] = val;
          snap(
            13,
            `No match — carry the best neighbour: max(${up}, ${left}) = ${val}.`,
            [i, j],
            [
              [i - 1, j],
              [i, j - 1],
            ],
            false
          );
        }
      }
    }
  }

  snap(
    16,
    `Done. The longest common subsequence of "${a}" and "${b}" has length ${dp[m][n]}.`,
    [m, n],
    []
  );
  return { a, b, steps };
}

// ── 0/1 Knapsack ────────────────────────────────────────────────────────
export interface KnapItem {
  weight: number;
  value: number;
}
export interface KnapResult {
  items: KnapItem[];
  capacity: number;
  steps: DPStep[];
}

export function knapsackSteps(
  items: KnapItem[],
  capacity: number
): KnapResult {
  const n = items.length;
  const W = capacity;
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array<number | null>(W + 1).fill(null)
  );
  const steps: DPStep[] = [];
  const snap = (
    codeLine: number,
    note: string,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) =>
    steps.push({
      codeLine,
      note,
      table: dp.map((r) => r.slice()),
      active,
      deps,
    });

  for (let i = 0; i <= n; i++) {
    for (let c = 0; c <= W; c++) {
      if (i === 0 || c === 0) {
        dp[i][c] = 0;
        snap(8, `Base case (no items or no capacity) → dp[${i}][${c}] = 0.`, [
          i,
          c,
        ], []);
      } else {
        const w = items[i - 1].weight;
        const v = items[i - 1].value;
        if (w > c) {
          const val = dp[i - 1][c] ?? 0;
          dp[i][c] = val;
          snap(
            10,
            `Item ${i} (w=${w}) is heavier than capacity ${c} — skip it: dp[${i}][${c}] = ${val}.`,
            [i, c],
            [[i - 1, c]]
          );
        } else {
          const skip = dp[i - 1][c] ?? 0;
          const take = (dp[i - 1][c - w] ?? 0) + v;
          const val = Math.max(skip, take);
          dp[i][c] = val;
          snap(
            13,
            `Item ${i}: skip=${skip} vs take=${take} (${
              dp[i - 1][c - w] ?? 0
            }+${v}). Best = ${val}.`,
            [i, c],
            [
              [i - 1, c],
              [i - 1, c - w],
            ]
          );
        }
      }
    }
  }

  snap(
    16,
    `Done. Max value within capacity ${W} is ${dp[n][W]}.`,
    [n, W],
    []
  );
  return { items, capacity: W, steps };
}

// ── Edit Distance (Levenshtein) ─────────────────────────────────────────
export function editDistanceSteps(aRaw: string, bRaw: string): LCSResult {
  const a = aRaw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  const b = bRaw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
  const m = a.length;
  const n = b.length;
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    new Array<number | null>(n + 1).fill(null)
  );
  const steps: DPStep[] = [];
  const snap = (
    codeLine: number,
    note: string,
    active: [number, number] | undefined,
    deps: [number, number][],
    match?: boolean
  ) =>
    steps.push({
      codeLine,
      note,
      table: dp.map((r) => r.slice()),
      active,
      deps,
      match,
    });

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) {
        snap(11, `Turning "" into the first ${j} of "${b}" needs ${j} inserts.`, [i, j], []);
        dp[i][j] = j;
        snap(12, `Base row → dp[0][${j}] = ${j}.`, [i, j], []);
      } else if (j === 0) {
        snap(13, `Turning the first ${i} of "${a}" into "" needs ${i} deletes.`, [i, j], []);
        dp[i][j] = i;
        snap(14, `Base column → dp[${i}][0] = ${i}.`, [i, j], []);
      } else {
        const ca = a[i - 1];
        const cb = b[j - 1];
        if (ca === cb) {
          const val = dp[i - 1][j - 1] ?? 0;
          snap(15, `a[${i - 1}]='${ca}' == b[${j - 1}]='${cb}' — no edit needed.`, [i, j], [], true);
          dp[i][j] = val;
          snap(16, `Carry the diagonal: dp[${i}][${j}] = dp[${i - 1}][${j - 1}] = ${val}.`, [i, j], [[i - 1, j - 1]], true);
        } else {
          const rep = dp[i - 1][j - 1] ?? 0;
          const del = dp[i - 1][j] ?? 0;
          const ins = dp[i][j - 1] ?? 0;
          const val = 1 + Math.min(rep, del, ins);
          snap(17, `'${ca}' != '${cb}' — take 1 + the cheapest edit.`, [i, j], [], false);
          dp[i][j] = val;
          snap(18, `1 + min(replace ${rep}, delete ${del}, insert ${ins}) = ${val}.`, [i, j], [[i - 1, j - 1], [i - 1, j], [i, j - 1]], false);
        }
      }
    }
  }

  snap(22, `Done. Edit distance between "${a}" and "${b}" is ${dp[m][n]}.`, [m, n], []);
  return { a, b, steps };
}

// ── Coin Change (fewest coins, unbounded) ───────────────────────────────
const COIN_INF = 1_000_000;

export interface CoinResult {
  coins: number[];
  amount: number;
  steps: DPStep[];
}

export function coinChangeSteps(coins: number[], amount: number): CoinResult {
  const n = coins.length;
  const dp: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array<number | null>(amount + 1).fill(null)
  );
  const steps: DPStep[] = [];
  const show = (v: number) => (v >= COIN_INF ? "∞" : v);
  const snap = (
    codeLine: number,
    note: string,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) =>
    steps.push({
      codeLine,
      note,
      table: dp.map((r) => r.slice()),
      active,
      deps,
    });

  for (let i = 0; i <= n; i++) {
    for (let a = 0; a <= amount; a++) {
      if (a === 0) {
        snap(9, `Amount 0 costs nothing.`, [i, a], []);
        dp[i][a] = 0;
        snap(10, `dp[${i}][0] = 0.`, [i, a], []);
      } else if (i === 0) {
        snap(11, `No coins available for amount ${a}.`, [i, a], []);
        dp[i][a] = COIN_INF;
        snap(12, `Unreachable → dp[0][${a}] = ∞.`, [i, a], []);
      } else {
        const coin = coins[i - 1];
        if (coin > a) {
          const val = dp[i - 1][a] ?? COIN_INF;
          snap(13, `Coin ${coin} > amount ${a} — can't use it.`, [i, a], []);
          dp[i][a] = val;
          snap(14, `Inherit above: dp[${i}][${a}] = ${show(val)}.`, [i, a], [[i - 1, a]]);
        } else {
          const skip = dp[i - 1][a] ?? COIN_INF;
          const take = (dp[i][a - coin] ?? COIN_INF) + 1;
          const val = Math.min(skip, take);
          snap(15, `Use coin ${coin}? skip=${show(skip)} vs take=${show(take)}.`, [i, a], []);
          dp[i][a] = val;
          snap(16, `dp[${i}][${a}] = min(${show(skip)}, ${show(take)}) = ${show(val)}.`, [i, a], [[i - 1, a], [i, a - coin]]);
        }
      }
    }
  }

  const best = dp[n][amount] ?? COIN_INF;
  snap(
    20,
    best >= COIN_INF
      ? `Done. Amount ${amount} cannot be made from these coins.`
      : `Done. Minimum coins for ${amount} is ${best}.`,
    [n, amount],
    []
  );
  return { coins, amount, steps };
}

// ── Floyd-Warshall (all-pairs shortest paths) ───────────────────────────
export const FW_INF = 1_000_000;

/** Preset 4-node directed weighted graph as an adjacency/dist matrix. */
export const FW_GRAPH: number[][] = [
  [0, 3, FW_INF, 7],
  [8, 0, 2, FW_INF],
  [5, FW_INF, 0, 1],
  [2, FW_INF, FW_INF, 0],
];

export interface FloydResult {
  size: number;
  steps: DPStep[];
}

export function floydWarshallSteps(graph: number[][] = FW_GRAPH): FloydResult {
  const V = graph.length;
  const dist: (number | null)[][] = graph.map((row) => [...row]);
  const steps: DPStep[] = [];
  const show = (v: number | null) =>
    v === null || v >= FW_INF ? "∞" : String(v);
  const snap = (
    codeLine: number,
    note: string,
    k: number | undefined,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) =>
    steps.push({
      codeLine,
      note,
      table: dist.map((r) => r.slice()),
      active,
      deps,
      k,
    });

  snap(3, `Start from the edge matrix: dist[i][j] = direct edge (∞ = none).`, undefined, undefined, []);

  for (let k = 0; k < V; k++) {
    snap(4, `Round k = ${k}: may any pair improve by stopping over at node ${k}?`, k, undefined, []);
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        // i==j never improves; legs touching k are the identity — skip the noise.
        if (i === j || i === k || j === k) continue;
        const ik = dist[i][k] ?? FW_INF;
        const kj = dist[k][j] ?? FW_INF;
        const ij = dist[i][j] ?? FW_INF;
        if (ik >= FW_INF || kj >= FW_INF) {
          snap(
            7,
            `dist[${i}][${k}] + dist[${k}][${j}] = ${show(ik)} + ${show(kj)} — no path through ${k}.`,
            k,
            [i, j],
            [
              [i, k],
              [k, j],
            ]
          );
          continue;
        }
        snap(
          7,
          `Via ${k}: ${show(ik)} + ${show(kj)} = ${ik + kj} vs current dist[${i}][${j}] = ${show(ij)}.`,
          k,
          [i, j],
          [
            [i, k],
            [k, j],
          ]
        );
        if (ik + kj < ij) {
          dist[i][j] = ik + kj;
          snap(
            8,
            `Shorter — dist[${i}][${j}] = ${ik + kj} (through node ${k}).`,
            k,
            [i, j],
            [
              [i, k],
              [k, j],
            ]
          );
        }
      }
    }
  }

  snap(13, `Done. dist[i][j] is now the shortest path between every pair.`, undefined, undefined, []);
  return { size: V, steps };
}

// ── Fibonacci (tabulation) ──────────────────────────────────────────────
export interface FibResult {
  n: number;
  steps: DPStep[];
}

export function fibonacciSteps(n: number): FibResult {
  const row = new Array<number | null>(n + 1).fill(null);
  const steps: DPStep[] = [];
  const snap = (
    codeLine: number,
    note: string,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) => steps.push({ codeLine, note, table: [row.slice()], active, deps });

  row[0] = 0;
  snap(3, `Base case: dp[0] = 0.`, [0, 0], []);
  if (n >= 1) {
    row[1] = 1;
    snap(4, `Base case: dp[1] = 1.`, [0, 1], []);
  }
  for (let i = 2; i <= n; i++) {
    const a = row[i - 1] ?? 0;
    const b = row[i - 2] ?? 0;
    row[i] = a + b;
    snap(
      6,
      `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${a} + ${b} = ${a + b}.`,
      [0, i],
      [[0, i - 1], [0, i - 2]]
    );
  }
  snap(7, `Done. The ${n}th Fibonacci number is ${row[n]}.`, [0, n], []);
  return { n, steps };
}

// ── Longest Increasing Subsequence ──────────────────────────────────────
export interface LISResult {
  values: number[];
  steps: DPStep[];
}

export function lisSteps(input: number[]): LISResult {
  const a = input.slice(0, 8);
  const n = a.length;
  const dp = new Array<number | null>(n).fill(null);
  const steps: DPStep[] = [];
  const snap = (
    codeLine: number,
    note: string,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) => steps.push({ codeLine, note, table: [dp.slice()], active, deps });

  let best = 0;
  for (let i = 0; i < n; i++) {
    dp[i] = 1;
    snap(4, `dp[${i}] = 1 — value ${a[i]} on its own.`, [0, i], []);
    for (let j = 0; j < i; j++) {
      snap(
        6,
        `Can ${a[i]} extend the run ending at ${a[j]}? (${a[j]} < ${a[i]}?)`,
        [0, i],
        [[0, j]]
      );
      if (a[j] < a[i] && (dp[j] ?? 0) + 1 > (dp[i] ?? 0)) {
        dp[i] = (dp[j] ?? 0) + 1;
        snap(7, `Yes — dp[${i}] = dp[${j}] + 1 = ${dp[i]}.`, [0, i], [[0, j]]);
      }
    }
    if ((dp[i] ?? 0) > best) best = dp[i] ?? 0;
    snap(9, `Longest increasing subsequence so far: ${best}.`, [0, i], []);
  }
  snap(11, `Done. The longest increasing subsequence has length ${best}.`, undefined, []);
  return { values: a, steps };
}
