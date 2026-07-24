import assert from "node:assert/strict";
import test from "node:test";

import {
  buildConversationPrivacyReport,
  parseConversation,
  scanConversation,
} from "./scanConversation.mjs";

test("parses role-labelled text conversations", () => {
  const parsed = parseConversation("User: hello\nAssistant: hi\nthere");
  assert.equal(parsed.ok, true);
  assert.equal(parsed.messages.length, 2);
  assert.equal(parsed.messages[1].role, "assistant");
});

test("parses common JSON message arrays", () => {
  const parsed = parseConversation(
    JSON.stringify({
      messages: [
        { role: "user", content: "first" },
        { role: "model", content: { parts: ["second"] } },
      ],
    }),
  );
  assert.equal(parsed.format, "json");
  assert.deepEqual(
    parsed.messages.map((message) => message.role),
    ["user", "assistant"],
  );
});

test("scans messages and produces a redacted transcript", () => {
  const result = scanConversation(
    "User: Email me at demo@example.com\nAssistant: access token: abcdefghijk",
  );
  assert.equal(result.messageCount, 2);
  assert.equal(result.flaggedMessageCount, 2);
  assert.match(result.transcript, /\[EMAIL_1\]/);
  assert.equal(result.transcript.includes("demo@example.com"), false);
});

test("honours enabled detector categories", () => {
  const result = scanConversation("User: demo@example.com", {
    enabledTypes: [],
  });
  assert.equal(result.totalDetections, 0);
  assert.match(result.transcript, /demo@example\.com/);
});

test("safe report never contains conversation text", () => {
  const secret = "private-person@example.com";
  const result = scanConversation(`User: ${secret}`);
  const report = buildConversationPrivacyReport(result);
  assert.equal(JSON.stringify(report).includes(secret), false);
  assert.equal(Object.hasOwn(report, "transcript"), false);
});
