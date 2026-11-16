import { test } from "node:test";
import assert from "node:assert/strict";
import { fitScale, nextScale } from "../lib/fit-scale";

test("fitScale takes the tighter axis, capped by the family's upper limit", () => {
  assert.equal(fitScale({ width: 600, height: 400 }, { width: 300, height: 100 }, 1.75), 1.75);
  assert.equal(fitScale({ width: 600, height: 400 }, { width: 300, height: 250 }, 2), 1.6);
  assert.equal(fitScale({ width: 200, height: 400 }, { width: 400, height: 100 }, 2), 0.5);
});

test("fitScale leaves empty content unscaled", () => {
  assert.equal(fitScale({ width: 600, height: 400 }, { width: 0, height: 0 }, 2), 1);
});

test("fitScale stays positive when the stage has no room", () => {
  assert.ok(fitScale({ width: 0, height: 0 }, { width: 300, height: 100 }, 2) > 0);
});

test("nextScale starts from the fit, then only shrinks", () => {
  assert.equal(nextScale(null, 1.4), 1.4);
  assert.equal(nextScale(1.4, 1.6), 1.4);
  assert.equal(nextScale(1.4, 1.1), 1.1);
});
