import { test } from "node:test";
import assert from "node:assert/strict";
import nextConfig from "../next.config";

async function headers() {
  const rules = await nextConfig.headers!();
  assert.equal(rules.length, 1);
  assert.equal(rules[0].source, "/:path*");
  return new Map(rules[0].headers.map((h) => [h.key, h.value]));
}

test("security headers apply to every path", async () => {
  const h = await headers();
  assert.equal(h.get("X-Content-Type-Options"), "nosniff");
  assert.equal(h.get("X-Frame-Options"), "DENY");
  assert.equal(h.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.match(h.get("Permissions-Policy") ?? "", /camera=\(\)/);
});

test("CSP keeps the locked directives", async () => {
  const csp = (await headers()).get("Content-Security-Policy") ?? "";
  for (const directive of [
    "default-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ])
    assert.ok(csp.includes(directive), `missing ${directive}`);
  // 'unsafe-eval' is only for next dev; tests run outside development.
  assert.ok(!csp.includes("'unsafe-eval'"), "unsafe-eval outside development");
});

test("X-Powered-By is not sent", () => assert.equal(nextConfig.poweredByHeader, false));
