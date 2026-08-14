import assert from "node:assert/strict";
import test from "node:test";

import { AVAILABLE_YEARS, CONTRIBUTION_YEARS, computeCppEi } from "./lib.js";

test("2026 is the default preset with verified CRA limits and rates", () => {
  assert.equal(AVAILABLE_YEARS[0], 2026);
  assert.deepEqual(CONTRIBUTION_YEARS[2026], {
    year: 2026,
    ympe: 74600,
    yampe: 85000,
    cppEmployeeRate: 0.0595,
    cpp2Rate: 0.04,
    qppEmployeeRate: 0.063,
    qpp2Rate: 0.04,
    eiMaxInsurableEarnings: 68900,
    eiRateOutsideQuebec: 0.0163,
    eiRateQuebec: 0.013,
  });
});

test("2026 CPP and EI annual maxima match the CRA table", () => {
  const result = computeCppEi({ annualEarnings: 100000, year: 2026 });
  assert.equal(result.maxEmployeePension, 4230.45);
  assert.equal(result.employeePension, 4230.45);
  assert.equal(result.maxEmployeeSecond, 416);
  assert.equal(result.employeeSecond, 416);
  assert.equal(result.maxEmployeeEi, 1123.07);
  assert.equal(result.employeeEi, 1123.07);
});

test("2026 Quebec QPP and reduced EI maxima match the CRA table", () => {
  const result = computeCppEi({ annualEarnings: 100000, year: 2026, inQuebec: true });
  assert.equal(result.maxEmployeePension, 4479.3);
  assert.equal(result.employeePension, 4479.3);
  assert.equal(result.employeeSecond, 416);
  assert.equal(result.maxEmployeeEi, 895.7);
  assert.equal(result.employeeEi, 895.7);
});
