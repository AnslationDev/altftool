import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routeSource = readFileSync(
  new URL("./[slug]/page.jsx", import.meta.url),
  "utf8",
);

test("deferred converter pages use on-demand static generation", () => {
  assert.match(routeSource, /export const dynamic = "force-static";/);
  assert.match(routeSource, /export const revalidate = 86400;/);
  assert.match(routeSource, /export const dynamicParams = true;/);
});
