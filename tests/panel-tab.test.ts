import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableTabs,
  initialTab,
  tabAfterUserAdvance,
  tabIndexForKey,
} from "../lib/panel-tab";

test("tabs keep the about, code, growth order", () => {
  assert.deepEqual(availableTabs(true, true), ["about", "code", "growth"]);
  assert.deepEqual(availableTabs(true, false), ["about", "code"]);
  assert.deepEqual(availableTabs(false, false), ["code"]);
});

test("about opens first when the page has it", () => {
  assert.equal(initialTab(["about", "code"]), "about");
  assert.equal(initialTab(["code"]), "code");
});

test("a user advance leaves about for code only", () => {
  assert.equal(tabAfterUserAdvance("about"), "code");
  assert.equal(tabAfterUserAdvance("growth"), "growth");
  assert.equal(tabAfterUserAdvance("code"), "code");
});

test("arrow keys wrap, home and end jump, other keys are ignored", () => {
  assert.equal(tabIndexForKey(2, "ArrowRight", 3), 0);
  assert.equal(tabIndexForKey(0, "ArrowLeft", 3), 2);
  assert.equal(tabIndexForKey(1, "Home", 3), 0);
  assert.equal(tabIndexForKey(0, "End", 3), 2);
  assert.equal(tabIndexForKey(0, "a", 3), null);
});
