import { test } from "node:test";
import assert from "node:assert/strict";
import { en, tr } from "../lib/dictionaries";
import { translate } from "../lib/translate";

test("translate picks the language and fills placeholders", () => {
  assert.equal(translate("en", "nf.back"), en["nf.back"]);
  assert.equal(translate("tr", "nf.back"), tr["nf.back"]);
  assert.equal(translate("en", "ws.maxNumbers", { n: 7 }), "max 7 numbers (0–999)");
});
