import assert from "node:assert/strict";
import test from "node:test";

import { runOnce } from "./sandbox.mjs";

const ESCAPE_ATTEMPTS = [
  `(values, mode, random) => ({
    result: random.constructor("return pro" + "cess")().version,
  })`,
  `(values) => ({
    result: values.constructor.constructor("return pro" + "cess")().version,
  })`,
  `() => ({
    result: Math.constructor.constructor("return pro" + "cess")().version,
  })`,
  `() => ({
    result: btoa.constructor("return pro" + "cess")().version,
  })`,
  `() => ({
    result: crypto.randomUUID.constructor("return pro" + "cess")().version,
  })`,
  `() => {
    const bytes = new TextEncoder().encode("escape");
    return {
      result: bytes.constructor.constructor("return pro" + "cess")().version,
    };
  }`,
  `async () => {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("escape"),
    );
    return {
      result: digest.constructor.constructor("return pro" + "cess")().version,
    };
  }`,
];

test("compute sandbox blocks constructor-chain access to the host realm", async () => {
  for (const source of ESCAPE_ATTEMPTS) {
    const result = await runOnce(source, [], {});
    assert.equal(result.ok, false, source);
    assert.match(result.error, /code generation from strings disallowed/i);
  }
});

test("compute sandbox keeps approved browser-style helpers functional", async () => {
  const source = `async (values, mode, random) => {
    const encoded = btoa(values.text);
    const decoded = atob(encoded);
    const bytes = new TextEncoder().encode(decoded);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hex = [...new Uint8Array(digest)]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    return {
      result: hex,
      rows: [["random", random()], ["uuid", crypto.randomUUID()]],
    };
  }`;
  const result = await runOnce(
    source,
    [{ key: "text", type: "text" }],
    { text: "abc" },
  );
  assert.equal(result.ok, true, result.error);
  assert.equal(
    result.output.result,
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
  assert.equal(result.output.rows[0][1], 0.26642920868471265);
  assert.match(result.output.rows[1][1], /^[0-9a-f]{8}-[0-9a-f-]{27}$/i);
});

test("compute sandbox serializes non-finite output for validation", async () => {
  const result = await runOnce(
    `() => ({ result: Infinity, rows: [["nan", NaN]] })`,
    [],
    {},
  );
  assert.equal(result.ok, true, result.error);
  assert.equal(result.output.result, "Infinity");
  assert.equal(result.output.rows[0][1], "NaN");
});
