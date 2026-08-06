import assert from "node:assert/strict";
import test from "node:test";

import { formatImfFixdate, parseRetryAfter } from "./lib.js";

test("asctime Retry-After dates are parsed as UTC and normalised", () => {
  const nowMs = Date.parse("1994-11-06T08:49:00Z");
  const result = parseRetryAfter("Sun Nov  6 08:49:37 1994", nowMs);

  assert.equal(result.kind, "date");
  assert.equal(result.targetMs, Date.parse("1994-11-06T08:49:37Z"));
  assert.equal(result.seconds, 37);
  assert.equal(result.normalised, "Sun, 06 Nov 1994 08:49:37 GMT");
});

test("asctime parsing rejects invalid tokens, ranges, dates and weekdays", () => {
  const nowMs = Date.parse("1994-11-06T08:49:00Z");
  const invalid = [
    "Mon Nov  6 08:49:37 1994",
    "Foo Nov  6 08:49:37 1994",
    "Sun Foo  6 08:49:37 1994",
    "Sun Feb 30 08:49:37 1994",
    "Sun Nov  6 24:49:37 1994",
    "Sun Nov  6 08:60:37 1994",
    "Sun Nov  6 08:49:61 1994",
    "sun Nov  6 08:49:37 1994",
    "Sun Nov 6 08:49:37 1994",
  ];

  for (const value of invalid) {
    assert.match(parseRetryAfter(value, nowMs).error, /Neither a run of digits nor a date/);
  }
});

test("asctime parsing accepts the RFC leap-second boundary", () => {
  const result = parseRetryAfter(
    "Sat Dec 31 23:59:60 2016",
    Date.parse("2016-12-31T23:59:59Z"),
  );

  assert.equal(result.kind, "date");
  assert.equal(result.targetMs, Date.parse("2017-01-01T00:00:00Z"));
  assert.equal(result.seconds, 1);
  assert.equal(result.normalised, "Sun, 01 Jan 2017 00:00:00 GMT");
});

test("IMF-fixdate parsing validates grammar, calendar fields and weekday", () => {
  const nowMs = Date.parse("1994-11-06T08:49:00Z");
  const valid = parseRetryAfter("Sun, 06 Nov 1994 08:49:37 GMT", nowMs);
  assert.equal(valid.kind, "date");
  assert.equal(valid.targetMs, Date.parse("1994-11-06T08:49:37Z"));
  assert.equal(valid.isImfFixdate, true);

  const invalid = [
    "Mon, 06 Nov 1994 08:49:37 GMT",
    "Bog, 06 Nov 1994 08:49:37 GMT",
    "Sun, 31 Feb 1994 08:49:37 GMT",
    "Sun, 06 Nov 1994 24:49:37 GMT",
    "Sun, 06 Nov 1994 08:60:37 GMT",
    "Sun, 06 Nov 1994 08:49:61 GMT",
    "Fri, 01 Jan 1700 00:00:00 GMT",
    "sun, 06 Nov 1994 08:49:37 GMT",
    "Sun, 6 Nov 1994 08:49:37 GMT",
    "Sun, 06 Nov 1994 08:49:37 UTC",
  ];

  for (const value of invalid) {
    assert.match(parseRetryAfter(value, nowMs).error, /Neither a run of digits nor a date/);
  }
});

test("HTTP dates cannot parse or format years before the RFC 5322 floor", () => {
  const nowMs = Date.parse("2026-01-01T00:00:00Z");
  assert.match(
    parseRetryAfter("Fri Jan  1 00:00:00 1700", nowMs).error,
    /Neither a run of digits nor a date/,
  );
  assert.equal(formatImfFixdate(Date.parse("1899-12-31T00:00:00Z")), null);
  assert.equal(
    formatImfFixdate(Date.parse("1900-01-01T00:00:00Z")),
    "Mon, 01 Jan 1900 00:00:00 GMT",
  );
});

test("rfc850 dates use the RFC two-digit-year rule and reject invalid fields", () => {
  const nowMs = Date.parse("2026-01-01T00:00:00Z");
  const valid = parseRetryAfter("Sunday, 06-Nov-94 08:49:37 GMT", nowMs);
  assert.equal(valid.kind, "date");
  assert.equal(valid.targetMs, Date.parse("1994-11-06T08:49:37Z"));
  assert.equal(valid.normalised, "Sun, 06 Nov 1994 08:49:37 GMT");
  assert.equal(valid.isImfFixdate, false);

  const invalid = [
    "Monday, 06-Nov-94 08:49:37 GMT",
    "Bogday, 06-Nov-94 08:49:37 GMT",
    "Sunday, 31-Feb-94 08:49:37 GMT",
    "Sunday, 06-Nov-94 24:49:37 GMT",
    "Sunday, 06-Nov-94 08:60:37 GMT",
    "Sunday, 06-Nov-94 08:49:61 GMT",
    "Sunday, 6-Nov-94 08:49:37 GMT",
  ];

  for (const value of invalid) {
    assert.match(parseRetryAfter(value, nowMs).error, /Neither a run of digits nor a date/);
  }
});

test("date parsing rejects non-HTTP-date strings instead of delegating to Date.parse", () => {
  const nowMs = Date.parse("2026-01-01T00:00:00Z");
  for (const value of ["1994-11-06T08:49:37Z", "November 6, 1994", "Sun, 31 Feb 1994 08:49:37 GMT"]) {
    assert.match(parseRetryAfter(value, nowMs).error, /Neither a run of digits nor a date/);
  }
});
