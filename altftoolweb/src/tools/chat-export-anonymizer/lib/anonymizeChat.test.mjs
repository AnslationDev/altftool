import assert from "node:assert/strict";
import test from "node:test";

import {
  anonymizeChat,
  buildPrivacyReport,
  detectChatFormat,
  parseCsv,
} from "./anonymizeChat.mjs";

test("anonymizes common chat labels and stable contact patterns", () => {
  const source = `[24/07/2026, 10:04 AM] Asha Mehta: Email me at asha@example.com or +91 98765 43210.
[24/07/2026, 10:05 AM] Kabir: Open https://example.com/case/42.
[24/07/2026, 10:06 AM] Asha Mehta: Customer ID: CUST-7788 and asha@example.com again.`;

  const result = anonymizeChat(source);

  assert.equal(result.format, "text");
  assert.match(result.output, /^Person 1: Email me at \[EMAIL_1\] or \[PHONE_1\]\./);
  assert.match(result.output, /Person 2: Open \[URL_1\]\./);
  assert.match(result.output, /Person 1: Customer ID: \[ID_1\] and \[EMAIL_1\] again\./);
  assert.equal(result.summary.find((item) => item.kind === "participant").unique, 2);
  assert.equal(result.summary.find((item) => item.kind === "timestamp").count, 3);
});

test("keeps dates, times, and short numbers that do not look like phone numbers", () => {
  const source = "Meeting: 2026-07-24 at 10:30. Use room 1234.";
  const result = anonymizeChat(source, {
    removeTimestamps: false,
    replaceParticipants: false,
  });

  assert.equal(result.output, source);
  assert.equal(result.totalChanges, 0);
});

test("preserves JSON structure while anonymizing structured participant, id, and timestamp fields", () => {
  const source = JSON.stringify({
    messages: [
      {
        sender: "Asha",
        senderId: "user-9012",
        phone: 9876543210,
        timestamp: "2026-07-24T10:04:00Z",
        text: "Reach me at asha@example.com",
      },
      {
        sender: "Asha",
        senderId: "user-9012",
        timestamp: "2026-07-24T10:05:00Z",
        text: "Same sender",
      },
    ],
  });

  const result = anonymizeChat(source);
  const parsed = JSON.parse(result.output);

  assert.equal(result.format, "json");
  assert.equal(parsed.messages[0].sender, "Person 1");
  assert.equal(parsed.messages[1].sender, "Person 1");
  assert.equal(parsed.messages[0].senderId, "[ID_1]");
  assert.equal(parsed.messages[1].senderId, "[ID_1]");
  assert.equal(parsed.messages[0].phone, "[PHONE_1]");
  assert.equal(parsed.messages[0].timestamp, "[TIMESTAMP_REMOVED]");
  assert.match(parsed.messages[0].text, /\[EMAIL_1\]/);
});

test("handles quoted CSV cells and stable participant pseudonyms", () => {
  const source = `sender,timestamp,message
Asha,2026-07-24T10:04:00Z,"Hello, call 98765 43210"
Kabir,2026-07-24T10:05:00Z,"Visit https://example.com"
Asha,2026-07-24T10:06:00Z,Thanks`;

  const result = anonymizeChat(source);
  const rows = parseCsv(result.output);

  assert.equal(result.format, "csv");
  assert.equal(rows[1][0], "Person 1");
  assert.equal(rows[2][0], "Person 2");
  assert.equal(rows[3][0], "Person 1");
  assert.equal(rows[1][1], "");
  assert.equal(rows[1][2], "Hello, call [PHONE_1]");
  assert.equal(rows[2][2], "Visit [URL_1]");
});

test("privacy report contains counts but never raw chat values", () => {
  const source = "Asha: asha@example.com";
  const result = anonymizeChat(source, { removeTimestamps: false });
  const serializedReport = JSON.stringify(buildPrivacyReport(result));

  assert.equal(buildPrivacyReport(result).containsRawChat, false);
  assert.doesNotMatch(serializedReport, /Asha|asha@example\.com/);
});

test("auto-detection is calibrated for JSON, recognized CSV, and bracketed TXT chat", () => {
  assert.equal(detectChatFormat('[{"sender":"Asha","text":"Hello"}]'), "json");
  assert.equal(detectChatFormat("sender,message\nAsha,Hello"), "csv");
  assert.equal(detectChatFormat("[10:04] Asha: Hello, Kabir"), "text");
});
