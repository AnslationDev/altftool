import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzePermissionInput,
  buildAuditReport,
  parsePermissionInput,
} from "./auditPermissions.mjs";

test("parses focused and unclassified permissions from AndroidManifest XML", () => {
  const parsed = parsePermissionInput(`
    <manifest>
      <uses-permission android:name="android.permission.READ_CONTACTS" />
      <uses-permission android:name="android.permission.READ_SMS" />
      <uses-permission android:name="android.permission.INTERNET" />
    </manifest>
  `);

  assert.equal(parsed.inputKind, "AndroidManifest XML");
  assert.deepEqual(
    parsed.permissions.map((permission) => permission.name),
    ["INTERNET", "READ_CONTACTS", "READ_SMS"],
  );
  assert.equal(
    parsed.permissions.find((permission) => permission.name === "INTERNET").classified,
    false,
  );
});

test("accepts a plain permission list and removes duplicate entries", () => {
  const parsed = parsePermissionInput(
    "READ_CONTACTS, android.permission.READ_SMS\nREAD_CONTACTS\nSYSTEM_ALERT_WINDOW",
  );

  assert.equal(parsed.inputKind, "Permission list");
  assert.deepEqual(
    parsed.permissions.map((permission) => permission.name),
    ["READ_CONTACTS", "READ_SMS", "SYSTEM_ALERT_WINDOW"],
  );
  assert.deepEqual(parsed.duplicates, [{ name: "READ_CONTACTS", count: 2 }]);
});

test("flags sensitive combinations without declaring that an app is fraudulent", () => {
  const audit = analyzePermissionInput(`
    android.permission.READ_CONTACTS
    android.permission.READ_CALL_LOG
    android.permission.ACCESS_BACKGROUND_LOCATION
  `);

  assert.equal(audit.reviewLevel.key, "high");
  assert.ok(
    audit.combinations.some(
      (combination) => combination.id === "social-graph-communications",
    ),
  );
  assert.ok(
    audit.combinations.some(
      (combination) => combination.id === "background-location-social",
    ),
  );

  const report = buildAuditReport(audit);
  assert.match(report, /does not prove/i);
  assert.doesNotMatch(report, /this app is fraudulent/i);
});

test("returns a calibrated result when no focused permission is found", () => {
  const audit = analyzePermissionInput(
    "android.permission.INTERNET\nandroid.permission.VIBRATE",
  );

  assert.equal(audit.classifiedCount, 0);
  assert.equal(audit.unclassifiedCount, 2);
  assert.equal(audit.reviewLevel.key, "none");
  assert.equal(audit.combinations.length, 0);
});

test("detects special-access declarations embedded in service and receiver entries", () => {
  const audit = analyzePermissionInput(`
    <service android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <receiver android:permission="android.permission.BIND_DEVICE_ADMIN">
      <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
    </receiver>
  `);

  assert.ok(
    audit.permissions.some(
      (permission) => permission.name === "BIND_ACCESSIBILITY_SERVICE",
    ),
  );
  assert.ok(
    audit.combinations.some(
      (combination) => combination.id === "screen-control-overlay",
    ),
  );
  assert.ok(
    audit.combinations.some((combination) => combination.id === "persistent-control"),
  );
});
