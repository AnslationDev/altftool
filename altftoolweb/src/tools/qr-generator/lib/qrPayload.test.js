import assert from "node:assert/strict";
import test from "node:test";

import { buildQrPayload, escapeWifiValue } from "./qrPayload.js";

test("blank website input never falls back to an unrelated URL", () => {
  const result = buildQrPayload({ activeTab: "URL", url: "   " });
  assert.equal(result.value, "");
  assert.match(result.error, /enter/i);
  assert.doesNotMatch(result.value, /google/i);
});

test("UPI payload omits an empty amount parameter", () => {
  const result = buildQrPayload({
    activeTab: "UPI",
    upi: { vpa: "merchant@bank", name: "Demo Store", am: "" },
  });
  assert.equal(result.error, "");
  assert.equal(result.value, "upi://pay?pa=merchant%40bank&pn=Demo%20Store&cu=INR");
  assert.doesNotMatch(result.value, /(?:\?|&)am=/);
});

test("UPI payload preserves an explicitly supplied amount", () => {
  const result = buildQrPayload({
    activeTab: "UPI",
    upi: { vpa: "merchant@bank", name: "", am: "125.50" },
  });
  assert.equal(result.value, "upi://pay?pa=merchant%40bank&am=125.50&cu=INR");
});

test("vCard fields escape newlines and separators instead of injecting properties", () => {
  const result = buildQrPayload({
    activeTab: "vCARD",
    vCard: { fn: "A\nURL:https://example.test", ln: "Doe;Jr", tel: "1,2", email: "" },
  });
  assert.equal(result.error, "");
  assert.match(result.value, /A\\nURL:https:\/\/example\.test/);
  assert.match(result.value, /Doe\\;Jr/);
  assert.match(result.value, /TEL:1\\,2/);
  assert.doesNotMatch(result.value, /\r\nURL:/);
});

test("WiFi values escape every payload delimiter", () => {
  assert.equal(escapeWifiValue('guest:west;floor,2"\\'), 'guest\\:west\\;floor\\,2\\"\\\\');
});
