import assert from "node:assert/strict";
import test from "node:test";

import {
  buildContactReport,
  compareContact,
  normalizeContact,
} from "./compareContact.mjs";

const confirmed = { trustedReferenceConfirmed: true };

test("normalizes ordinary domains and rejects paths", () => {
  assert.equal(normalizeContact("domain", "EXAMPLE.COM.").normalized, "example.com");
  assert.equal(normalizeContact("domain", "example.com/login").ok, false);
});

test("requires independent trusted-reference confirmation", () => {
  const result = compareContact({
    type: "email",
    officialValue: "help@example.com",
    claimedValue: "help@example.com",
  });
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /Confirm/);
});

test("reports exact match without claiming authenticity", () => {
  const result = compareContact({
    ...confirmed,
    type: "phone",
    officialValue: "+91 12345 67890",
    claimedValue: "+91-12345-67890",
  });
  assert.equal(result.status, "exact-match");
  assert.match(result.limitations.join(" "), /does not query/);
});

test("distinguishes a related subdomain from an exact domain match", () => {
  const result = compareContact({
    ...confirmed,
    type: "domain",
    officialValue: "example.com",
    claimedValue: "support.example.com",
  });
  assert.equal(result.status, "same-domain-family");
});

test("distinguishes same-origin URL paths", () => {
  const result = compareContact({
    ...confirmed,
    type: "url",
    officialValue: "https://example.com/contact",
    claimedValue: "https://example.com/payment",
  });
  assert.equal(result.status, "same-origin-different-url");
});

test("surfaces hidden Unicode and internationalized-domain cues", () => {
  const result = compareContact({
    ...confirmed,
    type: "domain",
    officialValue: "example.com",
    claimedValue: "ex\u200Bample.com",
  });
  assert.equal(result.status, "exact-match");
  assert.equal(result.cues.some((cue) => cue.id === "hidden-unicode"), true);
  const idn = normalizeContact("domain", "münich.example");
  assert.equal(idn.punycode, true);
});

test("does not treat different values as verified", () => {
  const result = compareContact({
    ...confirmed,
    type: "email",
    officialValue: "help@example.com",
    claimedValue: "help@example.net",
  });
  assert.equal(result.status, "different");
});

test("privacy-safe report excludes both contact values", () => {
  const result = compareContact({
    ...confirmed,
    type: "email",
    officialValue: "private-official@example.com",
    claimedValue: "private-claim@example.net",
  });
  const serialized = JSON.stringify(buildContactReport(result));
  assert.equal(serialized.includes("private-official"), false);
  assert.equal(serialized.includes("private-claim"), false);
  assert.equal(JSON.parse(serialized).scope.authenticityEstablished, false);
});
