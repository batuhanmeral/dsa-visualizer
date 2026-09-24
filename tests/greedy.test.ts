import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activitySelectionSteps,
  fractionalKnapsackSteps,
  huffmanSteps,
  jobSequencingSteps,
  type Activity,
  type Job,
} from "../lib/simulations/greedy";
import { rng } from "./helpers";

test("activity selection is optimal and picks non-overlapping intervals", () => {
  const rand = rng(71);
  /** Longest chain of compatible activities, by DP over finish order. */
  const ref = (acts: Activity[]) => {
    const a = [...acts].sort((x, y) => x.end - y.end);
    const dp = a.map(() => 1);
    let best = a.length ? 1 : 0;
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < i; j++)
        if (a[j].end <= a[i].start) dp[i] = Math.max(dp[i], dp[j] + 1);
      best = Math.max(best, dp[i]);
    }
    return best;
  };
  const cases: Activity[][] = [
    [{ start: 0, end: 0 }],
    [{ start: 1, end: 1 }, { start: 1, end: 1 }],
    [{ start: 0, end: 5 }, { start: 0, end: 5 }, { start: 5, end: 9 }],
    ...Array.from({ length: 150 }, (_, k) =>
      Array.from({ length: 1 + (k % 9) }, () => {
        const start = Math.floor(rand() * 14);
        return { start, end: start + 1 + Math.floor(rand() * 6) };
      })
    ),
  ];
  for (const acts of cases) {
    const r = activitySelectionSteps(acts);
    const last = r.steps.at(-1)!;
    assert.equal(last.selected.length, ref(acts), JSON.stringify(acts));
    assert.equal(
      last.selected.length + last.rejected.length,
      acts.length,
      "every activity must end up selected or rejected"
    );
    const picked = last.selected
      .map((i) => r.activities[i])
      .sort((x, y) => x.start - y.start);
    for (let i = 1; i < picked.length; i++)
      assert.ok(
        picked[i].start >= picked[i - 1].end,
        `overlap in ${JSON.stringify(picked)}`
      );
  }
});

test("fractional knapsack is optimal and never overfills the bag", () => {
  const rand = rng(73);
  const ref = (items: { weight: number; value: number }[], W: number) => {
    let remaining = W;
    let total = 0;
    for (const it of [...items].sort(
      (a, b) => b.value / b.weight - a.value / a.weight
    )) {
      if (remaining <= 0) break;
      const take = Math.min(it.weight, remaining);
      total += (it.value * take) / it.weight;
      remaining -= take;
    }
    return total;
  };
  for (let k = 0; k < 150; k++) {
    const items = Array.from({ length: 1 + (k % 7) }, () => ({
      weight: 1 + Math.floor(rand() * 15),
      value: 1 + Math.floor(rand() * 40),
    }));
    const W = 1 + Math.floor(rand() * 40);
    const r = fractionalKnapsackSteps(items, W);
    const last = r.steps.at(-1)!;
    assert.ok(
      Math.abs(last.total - ref(items, W)) < 1e-9,
      `total ${last.total} vs ${ref(items, W)} for W=${W}`
    );
    const packed = last.taken.reduce(
      (s, t) => s + r.items[t.index].weight * t.fraction,
      0
    );
    assert.ok(packed <= W + 1e-9, `packed ${packed} into a bag of ${W}`);
    for (const t of last.taken)
      assert.ok(t.fraction >= 0 && t.fraction <= 1 + 1e-9, "fraction range");
  }
});

test("job sequencing matches a brute-force optimum", () => {
  const rand = rng(79);
  /** Best profit over every subset, feasible iff sorted deadlines allow it. */
  const ref = (jobs: Job[]) => {
    let best = 0;
    for (let mask = 0; mask < 1 << jobs.length; mask++) {
      const pick = jobs.filter((_, i) => mask & (1 << i));
      pick.sort((a, b) => a.deadline - b.deadline);
      if (pick.every((j, i) => j.deadline >= i + 1))
        best = Math.max(
          best,
          pick.reduce((s, j) => s + j.profit, 0)
        );
    }
    return best;
  };
  for (let k = 0; k < 120; k++) {
    const jobs: Job[] = Array.from({ length: 1 + (k % 7) }, (_, i) => ({
      id: `J${i}`,
      deadline: 1 + Math.floor(rand() * 4),
      profit: 1 + Math.floor(rand() * 30),
    }));
    const r = jobSequencingSteps(jobs);
    const last = r.steps.at(-1)!;
    assert.equal(last.total, ref(jobs), JSON.stringify(jobs));
    for (const [t, j] of last.slots.entries())
      if (j !== null)
        assert.ok(
          r.jobs[j].deadline >= t + 1,
          `${r.jobs[j].id} sits in hour ${t + 1}, past its deadline`
        );
    assert.equal(
      new Set(last.slots.filter((s) => s !== null)).size,
      last.scheduled.length,
      "a job was scheduled into two hours"
    );
  }
});

test("a job that cannot be scheduled earns nothing", () => {
  const r = jobSequencingSteps([{ id: "A", deadline: 0, profit: 9 }]);
  assert.equal(r.steps.at(-1)!.total, 0);
});

test("Huffman codes are prefix-free and optimally short", () => {
  const rand = rng(83);
  /** Optimal weighted path length: repeatedly merge the two lightest trees. */
  const ref = (freqs: number[]) => {
    const heap = [...freqs];
    let cost = 0;
    while (heap.length > 1) {
      heap.sort((a, b) => a - b);
      const merged = heap.shift()! + heap.shift()!;
      cost += merged;
      heap.push(merged);
    }
    return cost;
  };
  for (let k = 0; k < 120; k++) {
    const n = 2 + (k % 7);
    const freqs = Array.from({ length: n }, (_, i) => ({
      ch: String.fromCharCode(97 + i),
      freq: 1 + Math.floor(rand() * 40),
    }));
    const codes = huffmanSteps(freqs).steps.at(-1)!.codes;
    assert.equal(Object.keys(codes).length, n, "one code per character");
    const all = Object.values(codes);
    for (const a of all)
      for (const b of all)
        if (a !== b)
          assert.ok(!b.startsWith(a), `"${a}" is a prefix of "${b}"`);
    assert.equal(
      freqs.reduce((s, f) => s + f.freq * codes[f.ch].length, 0),
      ref(freqs.map((f) => f.freq)),
      JSON.stringify(freqs)
    );
  }
});

test("Huffman handles all-equal frequencies", () => {
  const codes = huffmanSteps(
    ["a", "b", "c", "d"].map((ch) => ({ ch, freq: 1 }))
  ).steps.at(-1)!.codes;
  assert.equal(
    Object.values(codes).reduce((s, c) => s + c.length, 0),
    8,
    "four symbols of equal weight need two bits each"
  );
});

test("Huffman handles a lone symbol and no symbols at all", () => {
  const single = huffmanSteps([{ ch: "a", freq: 7 }]).steps;
  assert.equal(single.at(-1)!.codes.a, "0", "a lone symbol still needs a code");
  const empty = huffmanSteps([]).steps;
  assert.equal(empty.length, 1);
  assert.equal(empty[0].note.k, "n.huff.empty");
});

test("empty greedy inputs produce a note instead of throwing", () => {
  assert.equal(
    activitySelectionSteps([]).steps.at(-1)!.note.k,
    "n.activity.empty"
  );
  assert.equal(
    fractionalKnapsackSteps([], 10).steps.at(-1)!.note.k,
    "n.frac.empty"
  );
  assert.equal(jobSequencingSteps([]).steps.at(-1)!.note.k, "n.job.empty");
});
