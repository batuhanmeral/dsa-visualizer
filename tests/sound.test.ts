import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PITCH_HIGH_HZ,
  PITCH_LOW_HZ,
  SOUND_STORAGE_KEY,
  VOICES,
  parseSoundPref,
  pitchFor,
  tonesForStep,
  valueBounds,
} from "../lib/sound";
import { getSimulation } from "../lib/simulations";
import type { SimulationStep, StepKind } from "../lib/simulations/types";

const step = (over: Partial<SimulationStep>): SimulationStep => ({
  array: [10, 50, 90],
  highlights: [],
  sorted: [],
  kind: "info",
  codeLine: 0,
  note: { k: "n.bubble.noSwaps" },
  ...over,
});

const bounds = { min: 10, max: 90 };

test("the smallest value is the lowest pitch and the largest the highest", () => {
  assert.equal(pitchFor(10, 10, 90), PITCH_LOW_HZ);
  assert.equal(pitchFor(90, 10, 90), PITCH_HIGH_HZ);
});

test("a larger value never sounds lower", () => {
  let last = 0;
  for (let v = 0; v <= 100; v++) {
    const f = pitchFor(v, 0, 100);
    assert.ok(f >= last, `${v} -> ${f} Hz is below ${last} Hz`);
    last = f;
  }
});

test("pitches are snapped to equal-tempered semitones above the low pitch", () => {
  for (let v = 0; v <= 100; v += 7) {
    const semis = 12 * Math.log2(pitchFor(v, 0, 100) / PITCH_LOW_HZ);
    assert.ok(Math.abs(semis - Math.round(semis)) < 1e-9, `${v}: ${semis} semitones`);
  }
});

test("values outside the range are clamped, and a flat range sits in the middle", () => {
  assert.equal(pitchFor(-50, 0, 100), PITCH_LOW_HZ);
  assert.equal(pitchFor(500, 0, 100), PITCH_HIGH_HZ);
  const mid = pitchFor(7, 7, 7);
  assert.ok(mid > PITCH_LOW_HZ && mid < PITCH_HIGH_HZ);
});

test("value bounds come from the values, with a fallback for an empty list", () => {
  assert.deepEqual(valueBounds([5, 3, 9]), { min: 3, max: 9 });
  assert.deepEqual(valueBounds([]), { min: 0, max: 1 });
});

test("compare, swap, shift and probe each have their own timbre", () => {
  const kinds: StepKind[] = ["compare", "swap", "shift", "probe"];
  const waves = kinds.map((k) => VOICES[k]!.wave);
  assert.equal(new Set(waves).size, kinds.length, waves.join(", "));
});

test("an info step is silent", () => {
  assert.deepEqual(tonesForStep(step({ kind: "info", highlights: [0] }), bounds, 900), []);
});

test("a compare plays each highlighted value, in order, in its own voice", () => {
  const tones = tonesForStep(step({ kind: "compare", highlights: [2, 0] }), bounds, 900);
  assert.deepEqual(
    tones.map((t) => t.freq),
    [pitchFor(90, 10, 90), pitchFor(10, 10, 90)]
  );
  assert.ok(tones.every((t) => t.wave === VOICES.compare!.wave));
  assert.ok(tones[1].at > tones[0].at);
});

test("a held value is heard instead of the stale copy left in its slot", () => {
  const tones = tonesForStep(
    step({ kind: "shift", highlights: [1], held: { value: 90, hole: 1 } }),
    bounds,
    900
  );
  assert.deepEqual(tones.map((t) => t.freq), [pitchFor(90, 10, 90)]);
});

test("highlights outside the array are ignored", () => {
  const tones = tonesForStep(step({ kind: "probe", highlights: [7, 1] }), bounds, 900);
  assert.equal(tones.length, 1);
});

test("found rises above the found value, and done is a rising arpeggio", () => {
  const found = tonesForStep(step({ kind: "found", highlights: [1] }), bounds, 900);
  assert.ok(found.length >= 2);
  assert.equal(found[0].freq, pitchFor(50, 10, 90));
  assert.ok(found.at(-1)!.freq > found[0].freq);

  const done = tonesForStep(step({ kind: "done" }), bounds, 900);
  assert.ok(done.length >= 3);
  for (let i = 1; i < done.length; i++) {
    assert.ok(done[i].freq > done[i - 1].freq);
    assert.ok(done[i].at > done[i - 1].at);
  }
});

test("every tone of a step ends before the next step starts, at every speed", () => {
  for (const slug of ["bubble-sort", "insertion-sort", "merge-sort", "binary-search"]) {
    const steps = getSimulation(slug)!([23, 7, 41, 15, 3, 34, 9, 28], 15);
    const b = valueBounds(steps[0].array);
    for (const intervalMs of [1800, 900, 600, 450]) {
      for (const s of steps) {
        for (const t of tonesForStep(s, b, intervalMs)) {
          assert.ok(t.at >= 0 && t.duration > 0 && t.gain > 0 && t.gain <= 0.3);
          assert.ok(
            (t.at + t.duration) * 1000 <= intervalMs,
            `${slug} ${s.kind} at ${intervalMs} ms: tone ends at ${(t.at + t.duration) * 1000} ms`
          );
        }
      }
    }
  }
});

test("the sound preference is on unless stored as off", () => {
  assert.equal(SOUND_STORAGE_KEY, "sound");
  assert.equal(parseSoundPref("on"), true);
  assert.equal(parseSoundPref("off"), false);
  assert.equal(parseSoundPref(null), true);
  assert.equal(parseSoundPref("true"), true);
});
