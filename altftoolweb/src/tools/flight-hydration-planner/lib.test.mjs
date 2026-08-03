import test from "node:test";
import assert from "node:assert/strict";

import { computeFlightHydration } from "./lib.js";

const noExtras = {
  drinks: { beer: 0, wine: 0, spirit: 0 },
  coffees: 0,
  teas: 0,
  departTime: "10:00",
  destBedtime: "23:00",
};

test("flight schedule and bottle count reconcile with the displayed total", () => {
  const result = computeFlightHydration({
    ...noExtras,
    weightKg: 40,
    flightHours: 20,
  });

  assert.equal(result.error, undefined);
  assert.equal(result.totalDrinkMl, 1500);
  assert.equal(result.bottlesOf500, 3);
  assert.equal(
    result.schedule.reduce((sum, slot) => sum + slot.amountMl, 0),
    result.totalDrinkMl,
  );
  assert.equal(result.schedule.at(-1).cumulativeMl, result.totalDrinkMl);
});
