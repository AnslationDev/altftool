import assert from "node:assert/strict";
import test from "node:test";

import { computeLateralEntryMerit } from "./lib.js";

test("AICTE eligibility uses the raw diploma percentage at both category floors", () => {
  const general = computeLateralEntryMerit({
    diplomaObtained: 44_999,
    diplomaMax: 100_000,
    entranceObtained: 50,
    entranceMax: 100,
    diplomaWeight: 50,
  });
  const reserved = computeLateralEntryMerit({
    diplomaObtained: 39_999,
    diplomaMax: 100_000,
    entranceObtained: 50,
    entranceMax: 100,
    diplomaWeight: 50,
    isReserved: true,
  });

  assert.equal(general.diplomaPercent, 45);
  assert.equal(general.meetsAicteFloor, false);
  assert.equal(reserved.diplomaPercent, 40);
  assert.equal(reserved.meetsAicteFloor, false);
});

test("merit rounds once after summing the raw weighted contributions", () => {
  const result = computeLateralEntryMerit({
    diplomaObtained: 3_333,
    diplomaMax: 10_000,
    entranceObtained: 3_333,
    entranceMax: 10_000,
    diplomaWeight: 50,
  });

  assert.equal(result.diplomaShare, 16.67);
  assert.equal(result.entranceShare, 16.67);
  assert.equal(result.merit, 33.33);
});
