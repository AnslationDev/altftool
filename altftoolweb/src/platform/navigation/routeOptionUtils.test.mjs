import assert from "node:assert/strict";
import test from "node:test";

import { canonicalRouteOption } from "./routeOptionUtils.js";

test("navigation avoids the /games redirect while retaining legacy matching", () => {
  assert.deepEqual(
    canonicalRouteOption({
      label: "Games Arcade",
      href: "/games",
      match: ["/games"],
    }),
    {
      label: "Games Arcade",
      href: "/tools/games",
      match: ["/games"],
    },
  );
});

test("canonical navigation options keep their object identity", () => {
  const option = { label: "Tools", href: "/tools/all" };
  assert.equal(canonicalRouteOption(option), option);
});
