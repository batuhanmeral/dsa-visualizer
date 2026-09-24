import { test } from "node:test";
import assert from "node:assert/strict";
import { categories } from "../lib/data";
import { fitCurve, parseComplexity } from "../lib/complexity";
import {
  INVARIANT_SLUGS,
  invariantFor,
  staticInvariantFor,
} from "../lib/invariants";
import { getSimulation } from "../lib/simulations";
import { stepNotesEn, stepNotesTr, type StepNoteKey } from "../lib/step-notes";
import { fixtures } from "./fixtures";
import * as structures from "../lib/step-notes/structures";

const algorithms = categories.flatMap((c) =>
  c.algorithms.map((a) => ({ ...a, category: c.slug }))
);

const placeholders = (template: string) =>
  new Set([...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]));

test("every algorithm with an engine has a fixture", () => {
  // Keeps the code-line and note checks below honest: a new engine without a
  // fixture would otherwise be silently untested.
  const engined = algorithms.filter(
    (a) => getSimulation(a.slug) !== undefined || a.slug in fixtures
  );
  for (const a of engined)
    assert.ok(a.slug in fixtures, `no fixture for "${a.slug}"`);
  for (const slug of Object.keys(fixtures))
    assert.ok(
      algorithms.some((a) => a.slug === slug),
      `fixture "${slug}" is not an algorithm in lib/data.ts`
    );
});

test("every highlighted code line exists in the algorithm's C source", () => {
  for (const [slug, run] of Object.entries(fixtures)) {
    const algo = algorithms.find((a) => a.slug === slug)!;
    const lines = algo.code.split("\n").length;
    const used = new Set(run().map((s) => s.codeLine));
    for (const line of [...used].sort((a, b) => a - b))
      assert.ok(
        line >= 0 && line < lines,
        `${slug}: line ${line} is outside its ${lines}-line C snippet`
      );
  }
});

test("pseudocode is aligned line-for-line with the C source", () => {
  // The alignment is the whole mechanism: one `codeLine` from a step generator
  // highlights the right row in either view, with no second mapping to drift.
  for (const a of algorithms) {
    const c = a.code.split("\n");
    const pseudo = a.pseudo.split("\n");
    assert.equal(
      pseudo.length,
      c.length,
      `"${a.slug}": C has ${c.length} lines, pseudocode has ${pseudo.length}`
    );
  }
});

test("pseudocode is not just the C source again", () => {
  for (const a of algorithms) {
    assert.notEqual(a.pseudo, a.code, `"${a.slug}" pseudocode is a copy`);
    assert.ok(
      !a.pseudo.includes(";\n") && !a.pseudo.includes("int "),
      `"${a.slug}" pseudocode still reads like C`
    );
  }
});

test("every note a generator emits exists in the dictionary", () => {
  for (const [slug, run] of Object.entries(fixtures))
    for (const step of run())
      assert.ok(
        step.note.k in stepNotesEn,
        `${slug} emits unknown note key "${step.note.k}"`
      );
});

test("every note supplies exactly the values its template needs", () => {
  const seen = new Map<StepNoteKey, Set<string>>();
  for (const [slug, run] of Object.entries(fixtures))
    for (const step of run()) {
      const key = step.note.k as StepNoteKey;
      const supplied = new Set(Object.keys(step.note.v ?? {}));
      // A nested note or "@key" value may itself consume outer values, so a
      // supplied-but-unused name is only reported when nothing nests.
      const nests = Object.values(step.note.v ?? {}).some(
        (v) => typeof v === "object" || (typeof v === "string" && v.startsWith("@"))
      );
      for (const name of placeholders(stepNotesEn[key]))
        assert.ok(
          supplied.has(name),
          `${slug}: note "${key}" needs {${name}} but was given [${[...supplied]}]`
        );
      if (!nests)
        for (const name of supplied)
          assert.ok(
            placeholders(stepNotesEn[key]).has(name),
            `${slug}: note "${key}" was given an unused value {${name}}`
          );
      seen.set(key, supplied);
    }
  assert.ok(seen.size > 100, `only ${seen.size} distinct notes exercised`);
});

test("the Turkish and English note templates use the same placeholders", () => {
  for (const key of Object.keys(stepNotesEn) as StepNoteKey[]) {
    const turkish = stepNotesTr[key];
    assert.ok(turkish !== undefined, `"${key}" has no Turkish translation`);
    assert.deepEqual(
      [...placeholders(turkish)].sort(),
      [...placeholders(stepNotesEn[key])].sort(),
      `"${key}" placeholders differ between languages`
    );
  }
});

test("no note key is defined twice across the dictionary modules", () => {
  // The modules are spread into one object, so a duplicate would be silently
  // shadowed — and the shadowed wording would never appear.
  const keys = Object.keys(stepNotesEn);
  assert.equal(new Set(keys).size, keys.length);
});

test("the dictionary has no unreachable entries", () => {
  const used = new Set<string>();
  for (const run of Object.values(fixtures))
    for (const step of run()) {
      used.add(step.note.k);
      for (const v of Object.values(step.note.v ?? {})) {
        if (typeof v === "object") used.add(v.k);
        else if (typeof v === "string" && v.startsWith("@")) used.add(v.slice(1));
      }
    }
  // The data-structure walkthroughs are driven by clicks, not by a generator,
  // so their notes have no fixture to exercise them.
  const clickDriven = new Set(Object.keys(structures.en));

  // Invariants are chosen per algorithm rather than emitted by a step, and
  // have their own coverage tests below.
  for (const a of algorithms) {
    const stat = staticInvariantFor(a.slug);
    if (stat) used.add(stat.k);
    const run = fixtures[a.slug];
    if (run)
      for (const step of run()) {
        const note = invariantFor(a.slug, step as never);
        if (note) used.add(note.k);
      }
  }

  /**
   * Branches that mirror the C snippet beside them but that the surrounding
   * invariants make unreachable. They stay in the engines so the animation can
   * not diverge from the code being taught, and are listed here rather than
   * left to look like an oversight.
   */
  const unreachableByDesign = new Map<string, string>([
    [
      "n.jump.blockDone",
      "the block loop only exits once arr[blockEnd] >= target, so the linear scan always stops at or before blockEnd",
    ],
    [
      "n.interp.singleMiss",
      "the loop guard requires target between arr[lo] and arr[hi], so a one-cell window is always a hit",
    ],
    [
      "n.uf.compress",
      "union by rank plus compression on every find keeps trees shallow enough that a path of two or more compressible nodes does not arise for the preset sizes",
    ],
    [
      "n.rk.spurious",
      "a hash collision modulo 1e9+7 does not occur for inputs of this length",
    ],
  ]);

  const orphans = Object.keys(stepNotesEn).filter(
    (k) =>
      !used.has(k) && !clickDriven.has(k) && !unreachableByDesign.has(k)
  );
  assert.deepEqual(orphans, [], `unused note keys: ${orphans.join(", ")}`);

  // And the exemptions must stay honest: if one becomes reachable, drop it.
  for (const [key, why] of unreachableByDesign)
    assert.ok(
      !used.has(key),
      `"${key}" is listed as unreachable (${why}) but a fixture now reaches it`
    );
});

test("every algorithm's stated complexity parses into a curve where the chart shows one", () => {
  // The Growth tab only appears for algorithms with an engine, and it draws the
  // fitted curve from `time`. An unparsed bound silently drops the curve, so
  // the two have to stay in step.
  for (const a of algorithms) {
    if (getSimulation(a.slug) === undefined) continue;
    assert.ok(
      parseComplexity(a.time) !== null,
      `"${a.slug}" has an engine but its complexity "${a.time}" does not parse`
    );
  }
});

test("a fitted curve passes through the measurements it was fitted to", () => {
  const curve = parseComplexity("O(n²)")!;
  const points = [4, 8, 16].map((n) => ({ n, value: n * n }));
  const fitted = fitCurve(curve, points)!;
  for (const { n, value } of points)
    assert.ok(Math.abs(fitted(n) - value) < 1e-9, `n=${n}`);
});

test("every algorithm has an invariant, and it resolves to a real note", () => {
  // The invariant is the "why" beside every step note, so a missing one is a
  // silently emptier explanation rather than a visible error.
  for (const a of algorithms) {
    const covered = INVARIANT_SLUGS.includes(a.slug);
    assert.ok(covered, `"${a.slug}" has no invariant`);
    const note = staticInvariantFor(a.slug);
    if (note) assert.ok(note.k in stepNotesEn, `"${a.slug}" → ${note.k}`);
  }
});

test("phase-aware invariants cover every step of a run", () => {
  for (const [slug, run] of Object.entries(fixtures)) {
    const steps = run();
    // Only the array canvas has phase rules; the rest use the static lookup.
    const first = invariantFor(slug, steps[0] as never);
    if (!first) continue;
    for (const step of steps) {
      const note = invariantFor(slug, step as never);
      assert.ok(note, `${slug}: a step has no invariant`);
      assert.ok(note.k in stepNotesEn, `${slug} → ${note.k}`);
      for (const name of [...stepNotesEn[note.k].matchAll(/\{(\w+)\}/g)])
        assert.ok(
          note.v && name[1] in note.v,
          `${slug}: invariant "${note.k}" needs {${name[1]}}`
        );
    }
  }
});
