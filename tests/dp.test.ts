import { test } from "node:test";
import assert from "node:assert/strict";
import {
  coinChangeSteps,
  editDistanceSteps,
  fibonacciSteps,
  floydWarshallSteps,
  FW_GRAPH,
  FW_INF,
  kadaneSteps,
  knapsackSteps,
  lcsSteps,
  lisSteps,
} from "../lib/simulations/dp";
import { rng } from "./helpers";

const letters = (rand: () => number, n: number) =>
  Array.from({ length: n }, () => "ABCD"[Math.floor(rand() * 4)]).join("");

test("LCS matches a reference table", () => {
  const rand = rng(41);
  const ref = (a: string, b: string) => {
    const d = Array.from({ length: a.length + 1 }, () =>
      new Array<number>(b.length + 1).fill(0)
    );
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] =
          a[i - 1] === b[j - 1]
            ? d[i - 1][j - 1] + 1
            : Math.max(d[i - 1][j], d[i][j - 1]);
    return d[a.length][b.length];
  };
  for (let k = 0; k < 120; k++) {
    const r = lcsSteps(letters(rand, 1 + (k % 8)), letters(rand, 1 + (k % 7)));
    assert.equal(r.steps.at(-1)!.note.v!.value, ref(r.a, r.b), `"${r.a}"/"${r.b}"`);
  }
});

test("LCS handles empty and non-letter input", () => {
  for (const [a, b] of [["", ""], ["A", ""], ["", "A"], ["123", "456"]]) {
    const r = lcsSteps(a, b);
    assert.equal(r.steps.at(-1)!.note.v!.value, 0, `"${a}"/"${b}"`);
  }
});

test("edit distance matches a reference table", () => {
  const rand = rng(43);
  const ref = (a: string, b: string) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] =
          a[i - 1] === b[j - 1]
            ? d[i - 1][j - 1]
            : 1 + Math.min(d[i - 1][j - 1], d[i - 1][j], d[i][j - 1]);
    return d[a.length][b.length];
  };
  for (let k = 0; k < 120; k++) {
    const r = editDistanceSteps(
      letters(rand, 1 + (k % 8)),
      letters(rand, 1 + (k % 6))
    );
    assert.equal(r.steps.at(-1)!.note.v!.value, ref(r.a, r.b), `"${r.a}"/"${r.b}"`);
  }
});

test("0/1 knapsack matches a rolling-array reference", () => {
  const rand = rng(47);
  const ref = (items: { weight: number; value: number }[], W: number) => {
    const d = new Array<number>(W + 1).fill(0);
    for (const it of items)
      for (let c = W; c >= it.weight; c--)
        d[c] = Math.max(d[c], d[c - it.weight] + it.value);
    return d[W];
  };
  for (let k = 0; k < 120; k++) {
    const items = Array.from({ length: 1 + (k % 6) }, () => ({
      weight: 1 + Math.floor(rand() * 10),
      value: 1 + Math.floor(rand() * 20),
    }));
    const W = 1 + Math.floor(rand() * 20);
    const r = knapsackSteps(items, W);
    assert.equal(
      r.steps.at(-1)!.note.v!.value,
      ref(items, W),
      `W=${W} ${JSON.stringify(items)}`
    );
  }
});

test("coin change finds the minimum, or reports an unreachable amount", () => {
  const rand = rng(53);
  const ref = (coins: number[], amount: number) => {
    const d = new Array<number>(amount + 1).fill(Infinity);
    d[0] = 0;
    for (let a = 1; a <= amount; a++)
      for (const c of coins)
        if (c > 0 && c <= a) d[a] = Math.min(d[a], d[a - c] + 1);
    return d[amount];
  };
  for (let k = 0; k < 120; k++) {
    const coins = [
      ...new Set(
        Array.from({ length: 1 + (k % 4) }, () => 1 + Math.floor(rand() * 9))
      ),
    ];
    const amount = 1 + Math.floor(rand() * 25);
    const last = coinChangeSteps(coins, amount).steps.at(-1)!;
    const want = ref(coins, amount);
    if (want === Infinity) {
      assert.equal(last.note.k, "n.coin.impossible", `[${coins}] → ${amount}`);
    } else {
      assert.equal(last.note.k, "n.coin.done");
      assert.equal(last.note.v!.value, want, `[${coins}] → ${amount}`);
    }
  }
});

test("Floyd-Warshall matches a reference triple loop", () => {
  const rand = rng(59);
  const graphs = [
    FW_GRAPH,
    ...Array.from({ length: 60 }, (_, k) => {
      const V = 4 + (k % 2);
      return Array.from({ length: V }, (_, i) =>
        Array.from({ length: V }, (_, j) =>
          i === j ? 0 : rand() < 0.5 ? FW_INF : 1 + Math.floor(rand() * 15)
        )
      );
    }),
  ];
  for (const g of graphs) {
    const V = g.length;
    const ref = g.map((r) => [...r]);
    for (let k = 0; k < V; k++)
      for (let i = 0; i < V; i++)
        for (let j = 0; j < V; j++)
          if (
            ref[i][k] < FW_INF &&
            ref[k][j] < FW_INF &&
            ref[i][k] + ref[k][j] < ref[i][j]
          )
            ref[i][j] = ref[i][k] + ref[k][j];
    const got = floydWarshallSteps(g).steps.at(-1)!.table;
    for (let i = 0; i < V; i++)
      for (let j = 0; j < V; j++)
        assert.equal(got[i][j], ref[i][j], `dist[${i}][${j}]`);
  }
});

test("Fibonacci tabulation is correct up to n = 25", () => {
  const f = [0, 1];
  for (let i = 2; i <= 25; i++) f[i] = f[i - 1] + f[i - 2];
  for (let n = 0; n <= 25; n++) {
    const last = fibonacciSteps(n).steps.at(-1)!;
    assert.equal(last.table[0][n], f[n], `fib(${n})`);
    assert.equal(last.note.v!.value, f[n]);
  }
});

test("Kadane matches a reference scan, including all-negative input", () => {
  const rand = rng(61);
  const ref = (a: number[]) => {
    let cur = a[0];
    let best = a[0];
    for (let i = 1; i < a.length; i++) {
      cur = Math.max(a[i], cur + a[i]);
      best = Math.max(best, cur);
    }
    return best;
  };
  const cases = [
    [-5],
    [-5, -1, -9],
    [-3, -3, -3],
    ...Array.from({ length: 150 }, (_, k) =>
      Array.from({ length: 1 + (k % 10) }, () => Math.floor(rand() * 41) - 20)
    ),
  ];
  for (const a of cases) {
    const r = kadaneSteps(a);
    assert.equal(r.steps.at(-1)!.note.v!.best, ref(r.values), `[${r.values}]`);
  }
});

test("LIS matches a reference O(n²) scan", () => {
  const rand = rng(67);
  const ref = (a: number[]) => {
    const d = a.map(() => 1);
    let best = 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < i; j++) if (a[j] < a[i]) d[i] = Math.max(d[i], d[j] + 1);
      best = Math.max(best, d[i]);
    }
    return best;
  };
  for (let k = 0; k < 150; k++) {
    const a = Array.from({ length: 1 + (k % 8) }, () =>
      Math.floor(rand() * 20)
    );
    const r = lisSteps(a);
    assert.equal(r.steps.at(-1)!.note.v!.best, ref(r.values), `[${r.values}]`);
  }
});

test("Kadane and LIS explain an empty input instead of reporting NaN", () => {
  assert.equal(kadaneSteps([]).steps.at(-1)!.note.k, "n.kadane.empty");
  assert.equal(lisSteps([]).steps.at(-1)!.note.k, "n.lis.empty");
});
