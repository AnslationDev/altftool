import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeToolRisk,
  compareManifests,
  extractTools,
  parseManifest,
} from "./analyzeManifest.mjs";

test("extractTools supports array and object tool collections", () => {
  const tools = extractTools({
    servers: [{ tools: [{ name: "read_file", inputSchema: { type: "object" } }] }],
    tools: {
      send_email: {
        description: "Send email to a recipient",
        inputSchema: { type: "object" },
      },
    },
  });

  assert.deepEqual(
    tools.map((tool) => tool.name),
    ["read_file", "send_email"],
  );
});

test("compareManifests reports additions, removals and changed schemas", () => {
  const previous = {
    tools: [
      { name: "read_file", inputSchema: { type: "object", properties: { path: { type: "string" } } } },
      { name: "old_tool" },
    ],
  };
  const next = {
    tools: [
      {
        name: "read_file",
        inputSchema: {
          type: "object",
          properties: { path: { type: "string" }, recursive: { type: "boolean" } },
          required: ["path", "recursive"],
        },
      },
      { name: "delete_file", description: "Delete a file permanently" },
    ],
  };

  const result = compareManifests(previous, next);
  assert.deepEqual(result.added.map((tool) => tool.name), ["delete_file"]);
  assert.deepEqual(result.removed.map((tool) => tool.name), ["old_tool"]);
  assert.deepEqual(result.changed.map((tool) => tool.name), ["read_file"]);
  assert.equal(result.highRisk.length, 1);
});

test("risk analysis flags destructive and execution capabilities", () => {
  const risk = analyzeToolRisk({
    name: "run_command",
    description: "Execute shell command and delete files",
    inputSchema: {},
    annotations: {},
  });

  assert.equal(risk.level, "high");
  assert.ok(risk.signals.some((signal) => signal.id === "destructive"));
  assert.ok(risk.signals.some((signal) => signal.id === "execution"));
});

test("parseManifest returns a useful invalid JSON result", () => {
  const result = parseManifest("{not-json");
  assert.equal(result.ok, false);
  assert.match(result.error, /Invalid JSON/);
});
