import assert from "node:assert/strict";
import test from "node:test";

import {
  MIN_ZONE_SIZE,
  normalizeZone,
  summarizeChecklist,
  updateZone,
  zoneFromDrag,
} from "./privacyZones.mjs";

test("zoneFromDrag normalizes a reverse drag", () => {
  assert.deepEqual(
    zoneFromDrag(
      { x: 80, y: 70 },
      { x: 25, y: 15 },
      { id: "zone-1", label: "Account menu" },
    ),
    {
      id: "zone-1",
      label: "Account menu",
      x: 25,
      y: 15,
      width: 55,
      height: 55,
    },
  );
});

test("zoneFromDrag clamps points and ignores accidental clicks", () => {
  assert.deepEqual(zoneFromDrag({ x: -10, y: 30 }, { x: 110, y: 60 }), {
    id: "privacy-zone",
    label: "Privacy zone",
    x: 0,
    y: 30,
    width: 100,
    height: 30,
  });
  assert.equal(
    zoneFromDrag(
      { x: 20, y: 20 },
      { x: 20 + MIN_ZONE_SIZE / 2, y: 20 + MIN_ZONE_SIZE / 2 },
    ),
    null,
  );
});

test("normalizeZone and updateZone keep zones inside the preview", () => {
  const normalized = normalizeZone({ id: "zone", x: 96, y: -4, width: 20, height: 1 });
  assert.deepEqual(normalized, {
    id: "zone",
    x: 96,
    y: 0,
    width: 4,
    height: MIN_ZONE_SIZE,
  });

  assert.deepEqual(updateZone(normalized, { x: 70, width: 40 }), {
    id: "zone",
    x: 70,
    y: 0,
    width: 30,
    height: MIN_ZONE_SIZE,
  });

  assert.deepEqual(normalizeZone({ x: 100, y: 100, width: 10, height: 10 }), {
    x: 98,
    y: 98,
    width: MIN_ZONE_SIZE,
    height: MIN_ZONE_SIZE,
  });
});

test("summarizeChecklist counts only unique, known checklist items", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

  assert.deepEqual(summarizeChecklist(["a", "a", "unknown", "c"], items), {
    total: 3,
    completed: 2,
    remaining: 1,
    ready: false,
  });
  assert.equal(summarizeChecklist(["a", "b", "c"], items).ready, true);
});
