import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeMarketplaceMessage,
  analyzerLimits,
  buildSafeMarketplaceReport,
  redactMarketplaceEvidence,
} from "./analyzeMarketplaceMessage.mjs";

test("returns a calibrated clear result without confirming legitimacy", () => {
  const result = analyzeMarketplaceMessage(
    "Please use marketplace checkout. Never share an OTP and wait for settled payment before shipping.",
    { role: "seller" },
  );

  assert.equal(result.score, 0);
  assert.equal(result.findings.length, 0);
  assert.match(result.assessment.summary, /does not confirm/iu);
  assert.match(result.disclaimer, /not a probability or a fraud verdict/iu);
});

test("detects off-platform payment, private chat, advance fee, and urgency", () => {
  const result = analyzeMarketplaceMessage(
    "Continue only on WhatsApp. Pay outside the marketplace to avoid the platform fee and transfer the refundable courier insurance fee immediately.",
    { role: "buyer" },
  );
  const ids = new Set(result.findings.map((finding) => finding.id));

  assert.equal(ids.has("off-platform-payment"), true);
  assert.equal(ids.has("off-platform-chat"), true);
  assert.equal(ids.has("advance-release-fee"), true);
  assert.equal(ids.has("urgent-transaction"), true);
  assert.equal(result.assessment.level, "strong");
});

test("detects fake escrow, account upgrade, courier, and refund-release stories", () => {
  const result = analyzeMarketplaceMessage(
    "Your payment is held by escrow until you ship. Upgrade your seller account to receive funds. My courier will contact you and arrange payment. Pay a processing fee to release the refund.",
  );
  const ids = new Set(result.findings.map((finding) => finding.id));

  assert.equal(ids.has("fake-escrow-hold"), true);
  assert.equal(ids.has("account-upgrade-payment"), true);
  assert.equal(ids.has("courier-agent-payment"), true);
  assert.equal(ids.has("refund-release-fee"), true);
});

test("detects message and numeric-context overpayment signals", () => {
  const result = analyzeMarketplaceMessage(
    "I overpaid and sent extra. Refund the difference to my shipping agent.",
    {
      role: "seller",
      listingAmount: "12000",
      claimedPaymentAmount: "18000",
    },
  );
  const ids = new Set(result.findings.map((finding) => finding.id));

  assert.equal(ids.has("overpayment-refund"), true);
  assert.equal(ids.has("context-amount-overpayment"), true);
  assert.ok(result.nextSteps.some((step) => /do not refund or forward/iu.test(step)));
});

test("detects OTP, receive-money PIN, remote access, and account takeover", () => {
  const result = analyzeMarketplaceMessage(
    "Share the verification code to prove you are a real seller. Enter your UPI PIN to receive payment. Install AnyDesk and sign in through this link to unlock your account.",
  );
  const ids = new Set(result.findings.map((finding) => finding.id));

  assert.equal(ids.has("verification-code-request"), true);
  assert.equal(ids.has("receive-money-pin-qr"), true);
  assert.equal(ids.has("remote-access-request"), true);
  assert.equal(ids.has("account-login-link"), true);
  assert.equal(result.assessment.level, "strong");
});

test("detects shipping before settlement and onward reshipping", () => {
  const result = analyzeMarketplaceMessage(
    "The payment is pending, but ship the item now. Receive the next package and reship it to a new recipient.",
  );
  const ids = new Set(result.findings.map((finding) => finding.id));

  assert.equal(ids.has("ship-before-settlement"), true);
  assert.equal(ids.has("address-change-or-reship"), true);
});

test("negation handling avoids common marketplace safety advice", () => {
  const result = analyzeMarketplaceMessage(
    "Never share your OTP. Do not install AnyDesk. You should not pay outside the marketplace or ship before funds clear.",
  );

  assert.equal(result.findings.length, 0);
});

test("redacts contact, links, payment values, codes, and long numbers", () => {
  const redacted = redactMarketplaceEvidence(
    "Email buyer@example.com, open https://example.test, pay ₹12,500 to name@upi, code 654321, account 123456789012.",
  );

  assert.doesNotMatch(
    redacted,
    /buyer@example|example\.test|12,500|name@upi|654321|123456789012/u,
  );
  assert.match(redacted, /\[EMAIL\]|\[LINK\]|\[AMOUNT\]|\[CODE OR NUMBER\]/u);
});

test("safe report excludes message and transaction values", () => {
  const result = analyzeMarketplaceMessage(
    "Pay ₹98,765 outside the platform at private.person@example.test and send OTP 778899.",
    {
      role: "seller",
      listingAmount: "40000",
      claimedPaymentAmount: "98765",
    },
  );
  const report = buildSafeMarketplaceReport(result);

  assert.doesNotMatch(report, /98,765|private\.person|778899|40000/iu);
  assert.match(report, /excludes the pasted message, listing details/iu);
  assert.match(report, /not a probability/iu);
});

test("bounds unusually large message input", () => {
  const result = analyzeMarketplaceMessage(
    "a".repeat(analyzerLimits.maxMessageLength + 300),
  );

  assert.equal(result.messageLength, analyzerLimits.maxMessageLength);
  assert.equal(result.truncated, true);
});
