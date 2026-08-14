import assert from "node:assert/strict";
import test from "node:test";

import { buildKoreaCoverLetter } from "./lib.js";

const VALID_INPUT = {
  fullName: "Amara Nwosu",
  nationality: "Nigerian",
  passportNumber: "B7788990",
  passportExpiryDate: "2030-10-10",
  occupation: "Product manager",
  employer: "Kite Media Ltd",
  visaTypeId: "c39-single",
  purposeId: "tourism",
  applicationDate: "2027-01-15",
  visaIssueDate: "2027-02-01",
  arrivalDate: "2027-03-20",
  departureDate: "2027-04-05",
  itinerary: "20–27 Mar — Seoul",
  accommodation: "A hotel in Seoul",
  inviterName: "Min-jun Kim",
  budgetUsd: "3000",
  applicants: "1",
  tiesStatement: "I will return home after the trip.",
};

test("over-90-day stays block submit-ready output without suggesting an extension", () => {
  const result = buildKoreaCoverLetter({
    ...VALID_INPUT,
    arrivalDate: "2027-01-01",
    departureDate: "2027-04-01",
  });

  assert.equal(result.stayDays, 91);
  assert.equal(result.withinSojourn, false);
  assert.equal(result.letterBlocked, true);
  assert.equal(result.letter, "");
  assert.match(result.letterBlockingReason, /cannot be prepared/);
  assert.doesNotMatch(result.warnings.join(" "), /extension|HiKorea/i);
});

test("valid letters do not invent supporting-document confirmations", () => {
  const result = buildKoreaCoverLetter(VALID_INPUT);

  assert.equal(result.letterBlocked, false);
  assert.ok(result.letter.length > 0);
  assert.match(result.letter, /My host and point of contact in Korea is Min-jun Kim\./);
  assert.match(result.letter, /My planned accommodation is A hotel in Seoul\./);
  assert.doesNotMatch(result.letter, /enclosed|booking confirmations|confirmed return ticket/i);
  assert.doesNotMatch(result.letter, /leave for these dates is approved/i);
  assert.doesNotMatch(
    result.letter,
    /invitation letter|bank statements|flight confirmation|employment certificate/i,
  );
});
