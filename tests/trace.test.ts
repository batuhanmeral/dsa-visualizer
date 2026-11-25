import { test } from "node:test";
import assert from "node:assert/strict";
import { getSimulation } from "../lib/simulations";
import {
  STEP_KINDS,
  TRACEABLE,
  createReplay,
  stepHighlights,
  stepRange,
  traceRun,
  traceTransfer,
} from "../lib/simulations/trace";
import { categories } from "../lib/data";
import { arrayCases, ascending, rng } from "./helpers";

const slugsOf = (category: string) =>
  categories.find((c) => c.slug === category)!.algorithms.map((a) => a.slug);
const sortSlugs = slugsOf("sorting");
const searchSlugs = slugsOf("searching");

test("every sorting and searching algorithm can be traced", () => {
  assert.deepEqual([...TRACEABLE].sort(), [...sortSlugs, ...searchSlugs].sort());
  assert.equal(traceRun("dijkstra", [3, 1, 2]), undefined);
});

test("a slug that names an inherited object method traces nothing", () => {
  for (const slug of ["constructor", "toString", "valueOf", "hasOwnProperty", "__proto__"]) {
    assert.equal(traceRun(slug, [3, 1, 2]), undefined, slug);
  }
});

test("a trace replays to exactly the snapshot run, step by step", () => {
  for (const slug of [...sortSlugs, ...searchSlugs]) {
    for (const input of arrayCases()) {
      // A present target and a missing one, for the searches; sorts ignore it.
      const target = searchSlugs.includes(slug) ? (input.length % 2 ? input[0] : 1001) : undefined;
      const steps = getSimulation(slug)!(input, target);
      const trace = traceRun(slug, input, target)!;
      assert.equal(trace.count, steps.length, `${slug} [${input}]: step count`);
      const replay = createReplay(trace);
      steps.forEach((s, k) => {
        replay.seek(k);
        const where = `${slug} [${input}] step ${k}`;
        assert.deepEqual([...replay.values], s.array, `${where}: array`);
        assert.equal(STEP_KINDS[trace.kinds[k]], s.kind, `${where}: kind`);
        assert.equal(trace.lines[k], s.codeLine, `${where}: code line`);
        assert.deepEqual([...stepHighlights(trace, k)], s.highlights, `${where}: highlights`);
        assert.deepEqual(stepRange(trace, k), s.range, `${where}: range`);
      });
    }
  }
});

test("seeking back replays from the start, seeking forward does not rewind", () => {
  const input = [9, 4, 7, 1, 8, 2, 6, 3, 5];
  const steps = getSimulation("quick-sort")!(input);
  const replay = createReplay(traceRun("quick-sort", input)!);
  for (const k of [steps.length - 1, 3, 0, 10, 10, 2, steps.length - 1]) {
    replay.seek(k);
    assert.equal(replay.at, k);
    assert.deepEqual([...replay.values], steps[k].array, `seek ${k}`);
  }
  // Out of range is clamped.
  replay.seek(10_000);
  assert.equal(replay.at, steps.length - 1);
  replay.seek(-5);
  assert.equal(replay.at, 0);
});

test("large inputs replay to a sorted array", () => {
  const rand = rng(7);
  for (const slug of sortSlugs) {
    const n = 1000;
    const input = Array.from({ length: n }, () => 1 + Math.floor(rand() * n));
    const trace = traceRun(slug, input)!;
    const replay = createReplay(trace);
    replay.seek(trace.count - 1);
    assert.deepEqual([...replay.values], ascending(input), slug);
    assert.equal(STEP_KINDS[trace.kinds[trace.count - 1]], "done", slug);
  }
});

test("a large search finds a present target and reports a missing one", () => {
  const input = Array.from({ length: 2000 }, (_, i) => 2000 - i);
  for (const slug of searchSlugs) {
    for (const [target, found] of [[1234, true], [5000, false]] as const) {
      const trace = traceRun(slug, input, target)!;
      const kinds = [...trace.kinds].map((k) => STEP_KINDS[k]);
      assert.equal(kinds.includes("found"), found, `${slug} target ${target}`);
    }
  }
});

test("a trace moves to another thread whole, without copying its arrays", () => {
  const input = [9, 4, 7, 1, 8, 2, 6, 3, 5];
  const trace = traceRun("merge-sort", input)!;
  const expected = structuredClone(trace);
  const transfer = traceTransfer(trace);
  const typed = Object.values(trace).filter(ArrayBuffer.isView);
  // Every array's buffer is listed once, and no two arrays share one.
  assert.equal(transfer.length, typed.length);
  assert.equal(new Set(transfer).size, transfer.length);

  const moved = structuredClone(trace, { transfer });
  assert.deepEqual(moved, expected);
  // The sender's arrays are detached: the data moved rather than copied.
  assert.ok(typed.every((a) => a.byteLength === 0));
});

const traceBytes = (trace: object) =>
  Object.values(trace)
    .filter(ArrayBuffer.isView)
    .reduce((sum, a) => sum + a.byteLength, 0);

test("a trace costs about a dozen bytes a step, so 2000 values fit every sort", () => {
  const rand = rng(13);
  const input = Array.from({ length: 2000 }, () => 1 + Math.floor(rand() * 2000));
  // The worst case: bubble sort, about 3 million steps.
  const trace = traceRun("bubble-sort", input)!;
  const perStep = traceBytes(trace) / trace.count;
  assert.ok(perStep <= 12, `${perStep.toFixed(1)} bytes a step`);
  const replay = createReplay(trace);
  replay.seek(trace.count - 1);
  assert.deepEqual([...replay.values], ascending(input));
});

test("values that do not fit 16 bits are kept exactly", () => {
  const input = [70_000, -40_000, 2.5, 1e9, 3];
  for (const slug of ["bubble-sort", "merge-sort", "quick-sort"]) {
    const steps = getSimulation(slug)!(input);
    const replay = createReplay(traceRun(slug, input)!);
    replay.seek(steps.length - 1);
    assert.deepEqual([...replay.values], steps.at(-1)!.array, slug);
  }
});
