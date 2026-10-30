import { test } from "node:test";
import assert from "node:assert/strict";
import { GRAPH_ALGOS } from "../lib/simulations/graphs";
import { STRING_ALGOS } from "../lib/simulations/strings";
import { GRAPH_SLUGS, STRING_SLUGS } from "../lib/viz-families";

// The lists are copied so the workspace can pick a family without importing
// the engines; a drift would leave an algorithm with an empty canvas.
test("the graph family lists exactly the configured graph algorithms", () => {
  assert.deepEqual([...GRAPH_SLUGS].sort(), Object.keys(GRAPH_ALGOS).sort());
});

test("the string family lists exactly the configured string algorithms", () => {
  assert.deepEqual([...STRING_SLUGS].sort(), Object.keys(STRING_ALGOS).sort());
});
