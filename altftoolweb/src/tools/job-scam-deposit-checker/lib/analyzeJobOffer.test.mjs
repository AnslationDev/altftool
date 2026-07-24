import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeJobOffer,
  analyzerLimits,
  buildSafeJobOfferReport,
  normalizeCompanyDomain,
  redactSensitiveValues,
} from "./analyzeJobOffer.mjs";

test("returns a calibrated clear result without claiming legitimacy", () => {
  const result = analyzeJobOffer(
    "We invite you to a video interview. No candidate payment is required.",
  );

  assert.equal(result.score, 0);
  assert.equal(result.findings.length, 0);
  assert.match(result.assessment.summary, /does not confirm/iu);
  assert.match(result.disclaimer, /not a probability or a definitive scam verdict/iu);
});

test("clusters upfront fee, refund, urgency, and personal payment evidence", () => {
  const result = analyzeJobOffer(
    "Pay the refundable security deposit to the recruiter's personal account immediately to confirm your slot.",
  );
  const categories = new Set(result.categories.map((category) => category.id));

  assert.equal(categories.has("fees"), true);
  assert.equal(categories.has("personalPayment"), true);
  assert.equal(categories.has("urgency"), true);
  assert.equal(result.assessment.level, "strong");
  assert.doesNotMatch(result.assessment.label, /definite|confirmed scam/iu);
});

test("detects gift card, crypto, money-mule, and reshipping requests", () => {
  const result = analyzeJobOffer(
    "Buy gift cards for training. Receive client funds in your bank account, keep a commission, and forward the rest as USDT. You will also receive packages and reship them.",
  );
  const findingIds = new Set(result.findings.map((finding) => finding.id));

  assert.equal(findingIds.has("gift-card-payment"), true);
  assert.equal(findingIds.has("crypto-payment"), true);
  assert.equal(findingIds.has("money-forwarding"), true);
  assert.equal(findingIds.has("parcel-reshipping"), true);
  assert.equal(result.assessment.level, "strong");
});

test("compares recruiter contact with an independently supplied official domain", () => {
  const result = analyzeJobOffer("Please join an interview.", {
    recruiterContact: "recruiter.person@gmail.com",
    officialDomain: "https://careers.example-company.com/jobs",
  });
  const findingIds = new Set(result.findings.map((finding) => finding.id));

  assert.equal(findingIds.has("free-mail-recruiter"), true);
  assert.equal(findingIds.has("official-domain-mismatch"), true);
  assert.equal(normalizeCompanyDomain("https://www.Example.com/careers"), "example.com");
});

test("flags high short-period pay and identity-document pressure", () => {
  const result = analyzeJobOffer(
    "Earn ₹25,000 per day with no interview. Send your Aadhaar and bank statement now to receive the role.",
  );

  assert.ok(
    result.findings.some((finding) => finding.id === "high-periodic-compensation"),
  );
  assert.ok(
    result.findings.some((finding) => finding.id === "identity-document-request"),
  );
});

test("does not turn common candidate safety advice into a fee or secret finding", () => {
  const result = analyzeJobOffer(
    "We never ask candidates to pay a registration fee. Do not share your OTP or password with anyone.",
  );

  assert.equal(
    result.findings.some((finding) => finding.category === "fees"),
    false,
  );
  assert.equal(
    result.findings.some(
      (finding) => finding.id === "authentication-secret-request",
    ),
    false,
  );
});

test("redacts contact, link, payment, and long-number values from evidence", () => {
  const redacted = redactSensitiveValues(
    "Email person@example.com, open https://example.test, pay ₹12,500, call +91 98765 43210, account 123456789012.",
  );

  assert.doesNotMatch(redacted, /person@example|example\.test|12,500|98765|123456789012/u);
  assert.match(redacted, /\[EMAIL\]|\[LINK\]|\[AMOUNT\]/u);
});

test("safe report excludes raw offer, recruiter, domain, and payment values", () => {
  const rawOffer =
    "Pay ₹98,765 to private.account@example.test immediately for the refundable training fee.";
  const result = analyzeJobOffer(rawOffer, {
    recruiterContact: "named.recruiter@gmail.com",
    officialDomain: "secret-company.example",
  });
  const report = buildSafeJobOfferReport(result);

  assert.doesNotMatch(
    report,
    /98,765|private\.account|named\.recruiter|secret-company/iu,
  );
  assert.match(report, /excludes the pasted offer, recruiter contact, domains/iu);
  assert.match(report, /not a probability/iu);
});

test("bounds unusually large input before analysis", () => {
  const result = analyzeJobOffer(
    "a".repeat(analyzerLimits.maxOfferLength + 250),
  );

  assert.equal(result.messageLength, analyzerLimits.maxOfferLength);
  assert.equal(result.truncated, true);
});
