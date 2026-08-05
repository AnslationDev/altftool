import assert from "node:assert/strict";
import test from "node:test";

import {
  allowsResultHistory,
  createSeededRandom,
  loadInitial,
  persistableValues,
  summarize,
} from "./runtimeHelpers.js";

function sequence(seed, length = 8) {
  const random = createSeededRandom(seed);
  return Array.from({ length }, () => random());
}

test("seeded random returns the same sequence for the same regenerate seed", () => {
  assert.deepEqual(sequence(42), sequence(42));
});

test("incrementing the regenerate seed produces a different sequence", () => {
  assert.notDeepEqual(sequence(42), sequence(43));
});

test("seeded random values stay in the Math.random interval", () => {
  for (const value of sequence(7, 100)) {
    assert.ok(value >= 0 && value < 1);
  }
});

test("sensitive fields are omitted from storage and ordinary summaries", () => {
  const fields = [
    { key: "username", label: "Username", type: "text" },
    { key: "password", label: "Password", type: "password" },
  ];
  const raw = { username: "demo", password: "super-secret" };

  assert.deepEqual(persistableValues(fields, raw), { username: "demo" });
  assert.doesNotMatch(
    summarize(
      { title: "Header", fields },
      raw,
      { result: "ready", caption: "", rows: [], list: [], table: null },
      "",
    ),
    /super-secret|Password/u,
  );
  assert.equal(allowsResultHistory({ fields }), false);
  assert.equal(
    allowsResultHistory({ fields: [{ key: "query", type: "text" }] }),
    true,
  );
});

test("result-only export returns exactly the computed output", () => {
  assert.equal(
    summarize(
      { title: "Header", fields: [], exportResultOnly: true },
      {},
      { result: "Basic ZGVtbzpwYXNz" },
      "",
    ),
    "Basic ZGVtbzpwYXNz",
  );
});

test("saved sensitive values are never restored", () => {
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: {
      getItem: () => JSON.stringify({
        raw: { username: "saved", password: "persisted-secret" },
        mode: "",
      }),
    },
  };

  try {
    const initial = loadInitial(
      {
        fields: [
          { key: "username", type: "text", default: "default" },
          { key: "password", type: "password", default: "fresh-default" },
        ],
      },
      "test-key",
      false,
    );
    assert.deepEqual(initial.raw, {
      username: "saved",
      password: "fresh-default",
    });
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
