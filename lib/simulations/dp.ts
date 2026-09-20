/**
 * Dynamic-programming engines — pure step generators that fill a 2-D table
 * one cell at a time. Each returns an ordered `DPStep[]` the renderer replays.
 * `codeLine` values are 0-based and MUST match the C code in lib/data.ts.
 */

import { msg, type Note } from "./note";

export interface DPStep {
  codeLine: number;
  note: Note;
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
    note: Note,
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
        snap(8, msg("n.lcs.base", { i, j }), [i, j], []);
        dp[i][j] = 0;
        snap(9, msg("n.lcs.baseSet", { i, j }), [i, j], []);
      } else {
        const ca = a[i - 1];
        const cb = b[j - 1];
        const isMatch = ca === cb;
        snap(
          10,
          msg("n.lcs.compare", { i: i - 1, ca, j: j - 1, cb }),
          [i, j],
          [],
          isMatch
        );
        if (isMatch) {
          const val = (dp[i - 1][j - 1] ?? 0) + 1;
          dp[i][j] = val;
          snap(
            11,
            msg("n.lcs.match", { i, j, pi: i - 1, pj: j - 1, value: val }),
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
            msg("n.lcs.noMatch", { up, left, value: val }),
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

  snap(16, msg("n.lcs.done", { a, b, value: dp[m][n] ?? 0 }), [m, n], []);
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
    note: Note,
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
        snap(8, msg("n.knap.base", { i, c }), [i, c], []);
      } else {
        const w = items[i - 1].weight;
        const v = items[i - 1].value;
        if (w > c) {
          const val = dp[i - 1][c] ?? 0;
          dp[i][c] = val;
          snap(
            10,
            msg("n.knap.tooHeavy", { i, w, c, value: val }),
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
            msg("n.knap.choose", {
              i,
              skip,
              take,
              prev: dp[i - 1][c - w] ?? 0,
              v,
              value: val,
            }),
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

  snap(16, msg("n.knap.done", { W, value: dp[n][W] ?? 0 }), [n, W], []);
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
    note: Note,
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
        snap(11, msg("n.edit.baseRow", { j, b }), [i, j], []);
        dp[i][j] = j;
        snap(12, msg("n.edit.baseRowSet", { j }), [i, j], []);
      } else if (j === 0) {
        snap(13, msg("n.edit.baseCol", { i, a }), [i, j], []);
        dp[i][j] = i;
        snap(14, msg("n.edit.baseColSet", { i }), [i, j], []);
      } else {
        const ca = a[i - 1];
        const cb = b[j - 1];
        if (ca === cb) {
          const val = dp[i - 1][j - 1] ?? 0;
          snap(15, msg("n.edit.same", { i: i - 1, ca, j: j - 1, cb }), [i, j], [], true);
          dp[i][j] = val;
          snap(16, msg("n.edit.carry", { i, j, pi: i - 1, pj: j - 1, value: val }), [i, j], [[i - 1, j - 1]], true);
        } else {
          const rep = dp[i - 1][j - 1] ?? 0;
          const del = dp[i - 1][j] ?? 0;
          const ins = dp[i][j - 1] ?? 0;
          const val = 1 + Math.min(rep, del, ins);
          snap(17, msg("n.edit.differ", { ca, cb }), [i, j], [], false);
          dp[i][j] = val;
          snap(18, msg("n.edit.min", { rep, del, ins, value: val }), [i, j], [[i - 1, j - 1], [i - 1, j], [i, j - 1]], false);
        }
      }
    }
  }

  snap(22, msg("n.edit.done", { a, b, value: dp[m][n] ?? 0 }), [m, n], []);
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
    note: Note,
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
        snap(9, msg("n.coin.zero"), [i, a], []);
        dp[i][a] = 0;
        snap(10, msg("n.coin.zeroSet", { i }), [i, a], []);
      } else if (i === 0) {
        snap(11, msg("n.coin.noCoins", { a }), [i, a], []);
        dp[i][a] = COIN_INF;
        snap(12, msg("n.coin.unreachable", { a }), [i, a], []);
      } else {
        const coin = coins[i - 1];
        if (coin > a) {
          const val = dp[i - 1][a] ?? COIN_INF;
          snap(13, msg("n.coin.tooBig", { coin, a }), [i, a], []);
          dp[i][a] = val;
          snap(14, msg("n.coin.inherit", { i, a, value: show(val) }), [i, a], [[i - 1, a]]);
        } else {
          const skip = dp[i - 1][a] ?? COIN_INF;
          const take = (dp[i][a - coin] ?? COIN_INF) + 1;
          const val = Math.min(skip, take);
          snap(15, msg("n.coin.ask", { coin, skip: show(skip), take: show(take) }), [i, a], []);
          dp[i][a] = val;
          snap(16, msg("n.coin.min", { i, a, skip: show(skip), take: show(take), value: show(val) }), [i, a], [[i - 1, a], [i, a - coin]]);
        }
      }
    }
  }

  const best = dp[n][amount] ?? COIN_INF;
  snap(
    20,
    best >= COIN_INF
      ? msg("n.coin.impossible", { amount })
      : msg("n.coin.done", { amount, value: best }),
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
    note: Note,
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

  snap(3, msg("n.floyd.start"), undefined, undefined, []);

  for (let k = 0; k < V; k++) {
    snap(4, msg("n.floyd.round", { k }), k, undefined, []);
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
            msg("n.floyd.noPath", { i, k, j, ik: show(ik), kj: show(kj) }),
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
          msg("n.floyd.via", {
            k,
            ik: show(ik),
            kj: show(kj),
            sum: ik + kj,
            i,
            j,
            ij: show(ij),
          }),
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
            msg("n.floyd.update", { i, j, sum: ik + kj, k }),
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

  snap(13, msg("n.floyd.done"), undefined, undefined, []);
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
    note: Note,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) => steps.push({ codeLine, note, table: [row.slice()], active, deps });

  row[0] = 0;
  snap(3, msg("n.fib.base0"), [0, 0], []);
  if (n >= 1) {
    row[1] = 1;
    snap(4, msg("n.fib.base1"), [0, 1], []);
  }
  for (let i = 2; i <= n; i++) {
    const a = row[i - 1] ?? 0;
    const b = row[i - 2] ?? 0;
    row[i] = a + b;
    snap(
      6,
      msg("n.fib.step", { i, a: i - 1, b: i - 2, va: a, vb: b, sum: a + b }),
      [0, i],
      [[0, i - 1], [0, i - 2]]
    );
  }
  snap(7, msg("n.fib.done", { n, value: row[n] ?? 0 }), [0, n], []);
  return { n, steps };
}

// ── Kadane (maximum subarray sum) ───────────────────────────────────────
export interface KadaneResult {
  values: number[];
  steps: DPStep[];
}

export function kadaneSteps(input: number[]): KadaneResult {
  const a = input.slice(0, 10);
  const n = a.length;
  // Single-row table: dp[i] = best subarray sum ending exactly at i.
  const row = new Array<number | null>(n).fill(null);
  const steps: DPStep[] = [];
  const snap = (
    codeLine: number,
    note: Note,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) => steps.push({ codeLine, note, table: [row.slice()], active, deps });

  let cur = a[0];
  let best = a[0];
  row[0] = a[0];
  snap(1, msg("n.kadane.start", { value: a[0] }), [0, 0], []);

  for (let i = 1; i < n; i++) {
    const extend = cur + a[i];
    snap(
      4,
      msg("n.kadane.ask", { cur, value: a[i], sum: extend }),
      [0, i],
      [[0, i - 1]]
    );
    if (extend > a[i]) {
      cur = extend;
      row[i] = cur;
      snap(5, msg("n.kadane.extend", { cur }), [0, i], [[0, i - 1]]);
    } else {
      cur = a[i];
      row[i] = cur;
      snap(7, msg("n.kadane.restart", { cur }), [0, i], []);
    }
    if (cur > best) {
      best = cur;
      snap(9, msg("n.kadane.newBest", { best }), [0, i], []);
    }
  }

  snap(11, msg("n.kadane.done", { best }), undefined, []);
  return { values: a, steps };
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
    note: Note,
    active: [number, number] | undefined,
    deps: [number, number][]
  ) => steps.push({ codeLine, note, table: [dp.slice()], active, deps });

  let best = 0;
  for (let i = 0; i < n; i++) {
    dp[i] = 1;
    snap(4, msg("n.lis.init", { i, value: a[i] }), [0, i], []);
    for (let j = 0; j < i; j++) {
      snap(
        6,
        msg("n.lis.ask", { value: a[i], prev: a[j] }),
        [0, i],
        [[0, j]]
      );
      if (a[j] < a[i] && (dp[j] ?? 0) + 1 > (dp[i] ?? 0)) {
        dp[i] = (dp[j] ?? 0) + 1;
        snap(7, msg("n.lis.extend", { i, j, value: dp[i] ?? 0 }), [0, i], [[0, j]]);
      }
    }
    if ((dp[i] ?? 0) > best) best = dp[i] ?? 0;
    snap(9, msg("n.lis.best", { best }), [0, i], []);
  }
  snap(11, msg("n.lis.done", { best }), undefined, []);
  return { values: a, steps };
}
