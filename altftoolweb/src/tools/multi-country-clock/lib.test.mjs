import assert from "node:assert/strict";
import test from "node:test";

import {
  formatClockTime,
  formatTimeZoneCity,
  formatUtcOffset,
  getTimeZoneSearchText,
  isDstActive,
} from "./lib.js";

test("formats midnight with a 00 hour in 24-hour mode", () => {
  const instant = new Date("2026-01-01T00:05:06.000Z");
  assert.equal(formatClockTime(instant, false, "UTC"), "00:05:06");
});

test("formats the same real instant in the selected IANA zone", () => {
  const instant = new Date("2026-01-01T00:05:06.000Z");
  assert.equal(formatClockTime(instant, false, "Asia/Kolkata"), "05:35:06");
});

test("formats whole, half-hour and quarter-hour UTC offsets", () => {
  const instant = new Date("2026-01-15T12:00:00.000Z");
  assert.equal(formatUtcOffset("UTC", instant), "UTC+00:00");
  assert.equal(formatUtcOffset("Asia/Kolkata", instant), "UTC+05:30");
  assert.equal(formatUtcOffset("Asia/Kathmandu", instant), "UTC+05:45");
});

test("tracks northern and southern hemisphere DST from the same instant", () => {
  const january = new Date("2026-01-15T12:00:00.000Z");
  const july = new Date("2026-07-15T12:00:00.000Z");

  assert.equal(isDstActive("America/New_York", january), false);
  assert.equal(isDstActive("America/New_York", july), true);
  assert.equal(isDstActive("Australia/Sydney", january), true);
  assert.equal(isDstActive("Australia/Sydney", july), false);
});

test("invalid zones fail closed", () => {
  assert.equal(formatUtcOffset("Not/A_Real_Zone"), null);
  assert.equal(isDstActive("Not/A_Real_Zone"), false);
});

test("modern city names cover legacy ICU zone identifiers", () => {
  assert.equal(formatTimeZoneCity("Asia/Calcutta"), "Kolkata");
  assert.match(getTimeZoneSearchText("Asia/Calcutta"), /kolkata/);
  assert.equal(formatTimeZoneCity("Europe/Kiev"), "Kyiv");
});
