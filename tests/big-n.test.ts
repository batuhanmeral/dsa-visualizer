import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BIG_N_RUN_SECONDS,
  BIG_N_SHAPES,
  BIG_N_SIZES,
  bigInput,
  bigTarget,
  stepsPerSecond,
} from "../lib/big-n";
import { ascending, rng } from "./helpers";

test("every sort and search offers 500, 1000 and 2000 values", () => {
  assert.deepEqual(BIG_N_SIZES, [500, 1000, 2000]);
});

test("the search target is one of the values", () => {
  const rand = rng(11);
  for (const shape of BIG_N_SHAPES) {
    const values = bigInput(shape, 1000, rand);
    for (let i = 0; i < 20; i++) assert.ok(values.includes(bigTarget(values, rand)), shape);
  }
});

test("every shape gives n values between 1 and n", () => {
  for (const shape of BIG_N_SHAPES) {
    for (const n of [500, 2000]) {
      const a = bigInput(shape, n, rng(3));
      assert.equal(a.length, n, shape);
      assert.ok(a.every((v) => Number.isInteger(v) && v >= 1 && v <= n), shape);
    }
  }
});

test("random is a shuffled permutation, and the ordered shapes are ordered", () => {
  const n = 500;
  const random = bigInput("random", n, rng(5));
  assert.deepEqual(ascending(random), Array.from({ length: n }, (_, i) => i + 1));
  assert.notDeepEqual(random, ascending(random));

  const sorted = bigInput("sorted", n, rng(5));
  assert.deepEqual(sorted, ascending(sorted));
  const reversed = bigInput("reversed", n, rng(5));
  assert.deepEqual(reversed, ascending(reversed).reverse());

  // Nearly sorted: a few adjacent pairs out of order, no more.
  const nearly = bigInput("nearly", n, rng(5));
  let inversions = 0;
  for (let i = 1; i < n; i++) if (nearly[i] < nearly[i - 1]) inversions++;
  assert.ok(inversions > 0 && inversions <= n / 20, `${inversions} inversions`);

  assert.ok(new Set(bigInput("fewUnique", n, rng(5))).size <= 5);
});

test("a long run takes about the same time whatever its length, and speed shortens it", () => {
  for (const count of [10_000, 745_333, 2_991_712]) {
    const seconds = count / stepsPerSecond(count, 1);
    assert.ok(Math.abs(seconds - BIG_N_RUN_SECONDS) < 0.01, `${count}: ${seconds}s`);
    assert.equal(stepsPerSecond(count, 2), 2 * stepsPerSecond(count, 1));
    assert.equal(stepsPerSecond(count, 0.5), stepsPerSecond(count, 1) / 2);
  }
});

test("a short run plays at the small canvas's pace, one step per 900 ms at 1x", () => {
  for (const count of [3, 12, 22]) {
    assert.equal(stepsPerSecond(count, 1), 1000 / 900);
    assert.equal(stepsPerSecond(count, 2), 2000 / 900);
  }
});
