import assert from "node:assert/strict";
import test from "node:test";

import {
  parseCalendar,
  scrubCalendar,
  shiftIcsDateValue,
  unfoldContentLines,
} from "./calendarPrivacy.mjs";

const PRIVATE_CALENDAR = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Example Corp//Calendar 1.0//EN",
  "BEGIN:VTIMEZONE",
  "TZID:Asia/Kolkata",
  "END:VTIMEZONE",
  "BEGIN:VEVENT",
  "UID:secret-record-123@example.com",
  "DTSTART;TZID=Asia/Kolkata:20260724T093000",
  "DTEND;TZID=Asia/Kolkata:20260724T103000",
  "SUMMARY:Acquisition planning",
  "ORGANIZER;CN=\"Niki Owner\";SENT-BY=\"mailto:assistant@example.com\":mailto:niki@example.com",
  "ATTENDEE;CN=\"Alice Person\";ROLE=REQ-PARTICIPANT:mailto:alice@example.com",
  "ATTENDEE;CN=\"Bob Person\";ROLE=OPT-PARTICIPANT:mailto:bob@example.com",
  "LOCATION:Private HQ\\, Floor 4",
  "DESCRIPTION:Notes for the meeting\\nJoin https://meet.google.com/abc-defg-hij",
  "CONFERENCE;VALUE=URI:https://meet.google.com/abc-defg-hij",
  "RRULE:FREQ=WEEKLY;COUNT=3",
  "EXDATE;TZID=Asia/Kolkata:20260731T093000",
  "BEGIN:VALARM",
  "TRIGGER:-PT15M",
  "ACTION:DISPLAY",
  "DESCRIPTION:Reminder with private notes",
  "END:VALARM",
  "END:VEVENT",
  "END:VCALENDAR",
  "",
].join("\r\n");

test("unfolds folded ICS content lines before parsing", () => {
  const lines = unfoldContentLines(
    "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nDESCRIPTION:First part\r\n second part\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n",
  );

  assert.ok(lines.includes("DESCRIPTION:First partsecond part"));
  assert.equal(parseCalendar(lines.join("\r\n")).events.length, 1);
});

test("parses a calendar into safe event preview metadata", () => {
  const parsed = parseCalendar(PRIVATE_CALENDAR);

  assert.equal(parsed.ok, true);
  assert.equal(parsed.events.length, 1);
  assert.deepEqual(
    {
      summary: parsed.events[0].summary,
      attendeeCount: parsed.events[0].attendeeCount,
      timezone: parsed.events[0].timezone,
      recurring: parsed.events[0].recurring,
      alarmCount: parsed.events[0].alarmCount,
    },
    {
      summary: "Acquisition planning",
      attendeeCount: 2,
      timezone: "Asia/Kolkata",
      recurring: true,
      alarmCount: 1,
    },
  );
});

test("generalizes identities, removes sensitive content and preserves event duration", () => {
  const result = scrubCalendar(PRIVATE_CALENDAR, {
    summary: "generalize",
    attendees: "generalize",
    organizer: "generalize",
    location: "generalize",
    description: "remove",
    removeConferenceUrls: true,
    removeAlarms: true,
    uid: "replace",
    shiftDays: 2,
  });

  assert.equal(result.ok, true);
  const unfoldedOutput = unfoldContentLines(result.output).join("\n");
  assert.match(unfoldedOutput, /SUMMARY:Private event 1/);
  assert.match(
    unfoldedOutput,
    /ATTENDEE;ROLE=REQ-PARTICIPANT;CN="Attendee 1":mailto:attendee-1-1@redacted\.invalid/,
  );
  assert.match(
    unfoldedOutput,
    /ORGANIZER;CN="Organizer":mailto:organizer-1@redacted\.invalid/,
  );
  assert.match(unfoldedOutput, /LOCATION:Private location/);
  assert.match(unfoldedOutput, /UID:event-1@redacted\.invalid/);
  assert.match(unfoldedOutput, /DTSTART;TZID=Asia\/Kolkata:20260726T093000/);
  assert.match(unfoldedOutput, /DTEND;TZID=Asia\/Kolkata:20260726T103000/);
  assert.match(unfoldedOutput, /EXDATE;TZID=Asia\/Kolkata:20260802T093000/);
  assert.match(unfoldedOutput, /RRULE:FREQ=WEEKLY;COUNT=3/);
  assert.doesNotMatch(unfoldedOutput, /Niki Owner|Alice Person|Bob Person/);
  assert.doesNotMatch(unfoldedOutput, /niki@example\.com|alice@example\.com|bob@example\.com/);
  assert.doesNotMatch(unfoldedOutput, /BEGIN:VALARM|meet\.google\.com|Notes for the meeting/);
  assert.equal(result.stats.alarmsRemoved, 1);
  assert.equal(result.stats.shiftedDateValues, 3);
  assert.ok(result.warnings.some((warning) => warning.includes("Recurring rules")));
  assert.ok(result.warnings.some((warning) => warning.includes("VTIMEZONE")));
});

test("supports explicit removal modes and leaves the surrounding calendar valid", () => {
  const result = scrubCalendar(PRIVATE_CALENDAR, {
    summary: "remove",
    attendees: "remove",
    organizer: "remove",
    location: "remove",
    description: "remove",
    uid: "remove",
  });

  assert.equal(result.ok, true);
  assert.doesNotMatch(
    result.output,
    /^(?:SUMMARY|ATTENDEE|ORGANIZER|LOCATION|DESCRIPTION|UID)[;:]/m,
  );
  assert.match(result.output, /BEGIN:VEVENT/);
  assert.match(result.output, /END:VEVENT/);
});

test("shifts date, local date-time, UTC date-time and period values across boundaries", () => {
  assert.deepEqual(shiftIcsDateValue("20260228", 1), {
    value: "20260301",
    shifted: 1,
    unsupported: 0,
  });
  assert.deepEqual(shiftIcsDateValue("20261231T235959Z", 1), {
    value: "20270101T235959Z",
    shifted: 1,
    unsupported: 0,
  });
  assert.deepEqual(
    shiftIcsDateValue("20260724T090000/20260724T100000", -1),
    {
      value: "20260723T090000/20260723T100000",
      shifted: 2,
      unsupported: 0,
    },
  );
  assert.deepEqual(shiftIcsDateValue("not-a-date", 3), {
    value: "not-a-date",
    shifted: 0,
    unsupported: 1,
  });
});

test("never partially shifts an event when one related date field is unsupported", () => {
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "UID:mixed-date@example.test",
    "DTSTART:20260724T090000",
    "DTEND:not-a-standard-date",
    "SUMMARY:Mixed date formats",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const result = scrubCalendar(calendar, { shiftDays: 4 });
  const unfoldedOutput = unfoldContentLines(result.output).join("\n");

  assert.equal(result.ok, true);
  assert.match(unfoldedOutput, /DTSTART:20260724T090000/);
  assert.match(unfoldedOutput, /DTEND:not-a-standard-date/);
  assert.equal(result.stats.shiftedDateValues, 0);
  assert.equal(result.stats.unsupportedDateValues, 2);
  assert.ok(
    result.warnings.some((warning) =>
      warning.includes("could not be shifted as a safe group"),
    ),
  );
});

test("rejects structurally invalid calendar input without creating output", () => {
  const result = scrubCalendar(
    "BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nSUMMARY:Broken\r\nEND:VCALENDAR\r\n",
  );

  assert.equal(result.ok, false);
  assert.equal(result.output, "");
  assert.ok(result.errors.length > 0);
});
