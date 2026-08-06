import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import Papa from "papaparse";

import {
  buildDiabetesLogsCsv,
  clearDiabetesStorage,
  LOGS_STORAGE_KEY,
  PROFILE_STORAGE_KEY,
  validateGlucoseReading,
  validateTargetRange,
} from "./lib.js";

test("CSV export escapes every spreadsheet formula prefix in user notes", () => {
  const formulaPrefixes = ["=", "+", "-", "@", "\t", "\r"];
  const logs = formulaPrefixes.map((prefix, index) => ({
    date: "2027-01-01",
    time: `0${index}:00`,
    readingType: "fasting",
    reading: 100,
    unit: "mg/dL",
    notes: `${prefix}dangerous-formula`,
  }));

  const parsed = Papa.parse(buildDiabetesLogsCsv(logs), { header: true }).data;
  assert.deepEqual(
    parsed.map((row) => row.Notes),
    formulaPrefixes.map((prefix) => `'${prefix}dangerous-formula`),
  );
});

test("glucose validation rejects zero and implausible mg/dL readings", () => {
  assert.match(validateGlucoseReading(0, "mg/dL"), /20 and 600 mg\/dL/);
  assert.match(validateGlucoseReading(19.9, "mg/dL"), /20 and 600 mg\/dL/);
  assert.match(validateGlucoseReading(600.1, "mg/dL"), /20 and 600 mg\/dL/);
  assert.equal(validateGlucoseReading(20, "mg/dL"), null);
  assert.equal(validateGlucoseReading(600, "mg/dL"), null);
});

test("glucose validation applies mmol/L-specific plausible bounds", () => {
  assert.match(validateGlucoseReading(0, "mmol/L"), /1\.1 and 33\.3 mmol\/L/);
  assert.match(validateGlucoseReading(1, "mmol/L"), /1\.1 and 33\.3 mmol\/L/);
  assert.match(validateGlucoseReading(33.4, "mmol/L"), /1\.1 and 33\.3 mmol\/L/);
  assert.equal(validateGlucoseReading(1.1, "mmol/L"), null);
  assert.equal(validateGlucoseReading(33.3, "mmol/L"), null);
});

test("target validation rejects missing, zero, implausible and inverted ranges", () => {
  assert.match(validateTargetRange("", 130), /both minimum and maximum/);
  assert.match(validateTargetRange(0, 130), /20 and 600 mg\/dL/);
  assert.match(validateTargetRange(70, 601), /20 and 600 mg\/dL/);
  assert.match(validateTargetRange(130, 130), /less than maximum/);
  assert.match(validateTargetRange(131, 130), /less than maximum/);
  assert.equal(validateTargetRange(70, 130), null);
});

test("clear-all removes both diabetes keys even when one removal fails", () => {
  const attempted = [];
  const storage = {
    removeItem(key) {
      attempted.push(key);
      if (key === PROFILE_STORAGE_KEY) throw new Error("blocked");
    },
  };

  const result = clearDiabetesStorage(storage);
  assert.deepEqual(attempted, [PROFILE_STORAGE_KEY, LOGS_STORAGE_KEY]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.failedKeys, [PROFILE_STORAGE_KEY]);
});

test("dashboard visibly discloses unencrypted storage and exposes clear-all", async () => {
  const source = await readFile(new URL("./pages/index.jsx", import.meta.url), "utf8");
  assert.match(source, /not encrypted/i);
  assert.match(source, /shared or public device/i);
  assert.match(source, /Clear all saved data/);
  assert.match(source, /clearDiabetesStorage\(localStorage\)/);
});
