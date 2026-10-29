import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSiteUrl } from "../lib/site";

test("SITE_URL is required", () =>
  assert.throws(() => parseSiteUrl(undefined, undefined), /SITE_URL/));
test("SITE_URL must be a URL", () =>
  assert.throws(() => parseSiteUrl("algoritmalar", undefined), /SITE_URL/));
test("SITE_URL must be http or https", () =>
  assert.throws(() => parseSiteUrl("ftp://algoritmalar.com", undefined), /SITE_URL/));
test("production requires https", () => {
  assert.throws(() => parseSiteUrl("http://algoritmalar.com", "production"), /https/);
  assert.equal(parseSiteUrl("http://localhost:3000", "preview").origin, "http://localhost:3000");
  assert.equal(parseSiteUrl("https://algoritmalar.com/", "production").href, "https://algoritmalar.com/");
});
