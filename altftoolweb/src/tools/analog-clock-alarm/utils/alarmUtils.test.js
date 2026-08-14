import test from "node:test";
import assert from "node:assert/strict";
import { minutesUntilNextAlarm, nextAlarmLabel, shouldFire } from "./alarmUtils.js";

const alarm = (overrides) => ({
  enabled: true,
  hour: 9,
  minute: 0,
  repeat: "daily",
  customDays: [],
  ...overrides,
});

test("next alarm calculation respects weekday and weekend repeat rules", () => {
  const fridayEvening = new Date(2026, 7, 7, 18, 0, 0, 0);

  assert.equal(
    minutesUntilNextAlarm([alarm({ repeat: "weekdays" })], fridayEvening),
    63 * 60,
  );
  assert.equal(
    minutesUntilNextAlarm([alarm({ repeat: "weekends" })], fridayEvening),
    15 * 60,
  );
});

test("firing and countdown use the same repeat-day rules", () => {
  const weekdayAlarm = alarm({ repeat: "weekdays" });

  assert.equal(shouldFire(weekdayAlarm, new Date(2026, 7, 7, 9, 0, 0, 0)), true);
  assert.equal(shouldFire(weekdayAlarm, new Date(2026, 7, 8, 9, 0, 0, 0)), false);
});

test("next alarm calculation respects custom days and ignores empty custom repeats", () => {
  const mondayMorning = new Date(2026, 7, 3, 10, 0, 0, 0);

  assert.equal(
    minutesUntilNextAlarm([alarm({ repeat: "custom", customDays: [3] })], mondayMorning),
    47 * 60,
  );
  assert.equal(
    minutesUntilNextAlarm([alarm({ repeat: "custom", customDays: [] })], mondayMorning),
    null,
  );
});

test("next alarm label selects the earliest eligible enabled alarm", () => {
  const fridayEvening = new Date(2026, 7, 7, 18, 0, 30, 0);
  const alarms = [
    alarm({ repeat: "weekdays" }),
    alarm({ repeat: "weekends", hour: 8, minute: 30 }),
    alarm({ repeat: "daily", hour: 18, minute: 1, enabled: false }),
  ];

  assert.equal(nextAlarmLabel(alarms, fridayEvening), "Next alarm in 14h 30m");
});
