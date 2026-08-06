import assert from "node:assert/strict";
import test from "node:test";

import { parsePastedContent } from "./parser.js";

test("parses message nodes from an official ChatGPT conversations export", () => {
  const exportJson = JSON.stringify([
    {
      title: "Release notes",
      mapping: {
        userNode: {
          id: "userNode",
          message: {
            id: "message-user",
            author: { role: "user" },
            create_time: 1_700_000_000,
            content: { content_type: "text", parts: ["Summarize this."] },
          },
        },
        assistantNode: {
          id: "assistantNode",
          message: {
            id: "message-assistant",
            author: { role: "assistant" },
            create_time: 1_700_000_001,
            content: { content_type: "text", parts: ["Here is the summary."] },
          },
        },
      },
    },
  ]);

  const parsed = parsePastedContent(exportJson);

  assert.deepEqual(
    parsed.messages.map(({ role, content }) => ({ role, content })),
    [
      { role: "user", content: "Summarize this." },
      { role: "assistant", content: "Here is the summary." },
    ],
  );
  assert.equal(parsed.messages[0].timestamp, 1_700_000_000_000);
});

test("keeps the ordinary role/content JSON shape working", () => {
  const parsed = parsePastedContent(
    JSON.stringify({
      title: "Simple thread",
      messages: [
        { id: "one", role: "user", content: "Hello" },
        { id: "two", role: "assistant", content: "Hi" },
      ],
    }),
  );

  assert.equal(parsed.title, "Simple thread");
  assert.deepEqual(
    parsed.messages.map(({ role, content }) => ({ role, content })),
    [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi" },
    ],
  );
});
