import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const adminCwd = path.join(root, "altftoolwebadmin");
const scriptArgs = ["scripts/checkFirebaseAdminWrite.mjs"];

function runChecker(extraEnv = {}) {
  return spawnSync(process.execPath, scriptArgs, {
    cwd: adminCwd,
    env: {
      ...process.env,
      FIREBASE_PROJECT_ID: "",
      FIREBASE_CLIENT_EMAIL: "",
      FIREBASE_PRIVATE_KEY: "",
      FIREBASE_ADMIN_WRITE_CHECK_MODE: "",
      FIRESTORE_EMULATOR_HOST: "",
      ...extraEnv,
    },
    encoding: "utf8",
  });
}

test("Firebase Admin write checker dry-run validates wiring without credentials", () => {
  const result = runChecker({ FIREBASE_ADMIN_WRITE_CHECK_MODE: "dry-run" });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /dry run passed/i);
  assert.match(result.stdout, /credentialReady/);
  assert.doesNotMatch(result.stdout, /PRIVATE KEY-----/);
});

test("Firebase Admin write checker fails clearly when live credentials are missing", () => {
  const result = runChecker();

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cannot run without ready credentials/i);
  assert.match(result.stderr, /FIREBASE_CLIENT_EMAIL/);
  assert.doesNotMatch(result.stderr, /PRIVATE KEY-----/);
});
