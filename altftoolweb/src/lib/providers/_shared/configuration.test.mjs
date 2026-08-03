import assert from "node:assert/strict";
import test from "node:test";

import {
  PROVIDER_NOT_CONFIGURED,
  requireProviderApproval,
  requireProviderKey,
} from "./configuration.js";

test("provider keys fail closed without exposing environment names", () => {
  const previous = process.env.TEST_TOP10_PROVIDER_KEY;
  delete process.env.TEST_TOP10_PROVIDER_KEY;
  try {
    assert.throws(
      () => requireProviderKey("TEST_TOP10_PROVIDER_KEY", "Test Provider"),
      (error) => error.code === PROVIDER_NOT_CONFIGURED && !error.message.includes("TEST_TOP10_PROVIDER_KEY"),
    );
  } finally {
    if (previous === undefined) delete process.env.TEST_TOP10_PROVIDER_KEY;
    else process.env.TEST_TOP10_PROVIDER_KEY = previous;
  }
});

test("commercial provider integrations require explicit approval", () => {
  const previous = process.env.TEST_TOP10_PROVIDER_APPROVED;
  try {
    process.env.TEST_TOP10_PROVIDER_APPROVED = "false";
    assert.throws(
      () => requireProviderApproval("TEST_TOP10_PROVIDER_APPROVED", "Test Provider"),
      (error) => error.code === PROVIDER_NOT_CONFIGURED,
    );
    process.env.TEST_TOP10_PROVIDER_APPROVED = "true";
    assert.doesNotThrow(() => requireProviderApproval("TEST_TOP10_PROVIDER_APPROVED", "Test Provider"));
  } finally {
    if (previous === undefined) delete process.env.TEST_TOP10_PROVIDER_APPROVED;
    else process.env.TEST_TOP10_PROVIDER_APPROVED = previous;
  }
});
