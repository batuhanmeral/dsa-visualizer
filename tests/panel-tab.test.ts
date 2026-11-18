import { test } from "node:test";
import assert from "node:assert/strict";
import {
  availableTabs,
  initialTab,
  tabAfterUserAdvance,
  tabIndexForKey,
} from "../lib/panel-tab";

test("tabs keep the about and code order", () => {
  assert.equal(availableTabs.length, 1);
  assert.deepEqual(availableTabs(true), ["about", "code"]);
  assert.deepEqual(availableTabs(false), ["code"]);
});

test("about opens first when the page has it", () => {
  assert.equal(initialTab(["about", "code"]), "about");
  assert.equal(initialTab(["code"]), "code");
});

test("a user advance leaves about for code only", () => {
  assert.equal(tabAfterUserAdvance("about"), "code");
  assert.equal(tabAfterUserAdvance("code"), "code");
});

test("arrow keys wrap, home and end jump, other keys are ignored", () => {
  assert.equal(tabIndexForKey(1, "ArrowRight", 2), 0);
  assert.equal(tabIndexForKey(0, "ArrowLeft", 2), 1);
  assert.equal(tabIndexForKey(1, "Home", 2), 0);
  assert.equal(tabIndexForKey(0, "End", 2), 1);
  assert.equal(tabIndexForKey(0, "a", 2), null);
});
