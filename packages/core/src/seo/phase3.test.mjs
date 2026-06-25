// Node test runner: `node --test packages/core/src/seo/phase3.test.mjs`
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRedirect } from "./resolver.js";
import { validateSeoConfig } from "./schemas.js";

test("resolveRedirect is inert for empty/invalid input", () => {
  assert.equal(resolveRedirect([], "/x"), null);
  assert.equal(resolveRedirect(null, "/x"), null);
  assert.equal(resolveRedirect([{ source: "/a", destination: "/b" }], 123), null);
});

test("resolveRedirect matches exact + trailing slash, honors type", () => {
  const list = [{ source: "/old", destination: "/new", type: 302 }];
  assert.deepEqual(resolveRedirect(list, "/old"), { destination: "/new", statusCode: 302 });
  assert.deepEqual(resolveRedirect(list, "/old/"), { destination: "/new", statusCode: 302 });
  assert.deepEqual(resolveRedirect([{ source: "/old", destination: "/new" }], "/old"), {
    destination: "/new",
    statusCode: 301,
  });
});

test("resolveRedirect skips disabled, self, and missing destination", () => {
  assert.equal(resolveRedirect([{ source: "/o", destination: "/n", enabled: false }], "/o"), null);
  assert.equal(resolveRedirect([{ source: "/o", destination: "/o" }], "/o"), null);
  assert.equal(resolveRedirect([{ source: "/o" }], "/o"), null);
});

test("resolveRedirect supports external destinations", () => {
  assert.deepEqual(resolveRedirect([{ source: "/go", destination: "https://x.com/a" }], "/go"), {
    destination: "https://x.com/a",
    statusCode: 301,
  });
});

test("validateSeoConfig normalizes redirects + drops invalid", () => {
  const { value } = validateSeoConfig({
    enabled: true,
    redirects: [
      { source: "no-slash", destination: "/a" }, // dropped (source not rooted)
      { source: "/a", destination: "bad" }, // dropped (bad destination)
      { source: "/ok", destination: "/dest", type: 302 },
      { source: "/ext", destination: "https://x.com" },
    ],
  });
  assert.equal(value.redirects.length, 2);
  assert.equal(value.redirects[0].source, "/ok");
  assert.equal(value.redirects[0].type, 302);
  assert.equal(value.redirects[0].enabled, true);
});

test("validateSeoConfig flags redirect loops and duplicates", () => {
  const loop = validateSeoConfig({ enabled: true, redirects: [
    { source: "/a", destination: "/b" },
    { source: "/b", destination: "/a" },
  ] });
  assert.ok(loop.errors.some((e) => /loop/i.test(e)));

  const dup = validateSeoConfig({ enabled: true, redirects: [
    { source: "/x", destination: "/y" },
    { source: "/x", destination: "/z" },
  ] });
  assert.ok(dup.errors.some((e) => /duplicate/i.test(e)));

  const self = validateSeoConfig({ enabled: true, redirects: [{ source: "/s", destination: "/s" }] });
  assert.ok(self.errors.some((e) => /itself/i.test(e)));
});
