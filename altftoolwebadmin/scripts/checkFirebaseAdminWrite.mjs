import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import { cert, deleteApp, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

for (const filename of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), filename);
  if (existsSync(envPath)) loadEnv({ path: envPath, override: false, quiet: true });
}

const FIREBASE_ADMIN_ENV = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

function envValue(name) {
  return typeof process.env[name] === "string" ? process.env[name].trim() : "";
}

function normalizePrivateKey(value = "") {
  return value.replace(/\\n/g, "\n").trim();
}

function validateCredentials() {
  const values = Object.fromEntries(FIREBASE_ADMIN_ENV.map((name) => [name, envValue(name)]));
  const privateKey = normalizePrivateKey(values.FIREBASE_PRIVATE_KEY);
  const missing = FIREBASE_ADMIN_ENV.filter((name) => !values[name]);
  const invalid = [];

  if (values.FIREBASE_CLIENT_EMAIL && !values.FIREBASE_CLIENT_EMAIL.includes("@")) {
    invalid.push("FIREBASE_CLIENT_EMAIL must be a service-account email.");
  }

  if (
    values.FIREBASE_PRIVATE_KEY &&
    (!privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !privateKey.includes("-----END PRIVATE KEY-----"))
  ) {
    invalid.push("FIREBASE_PRIVATE_KEY must be the full PEM private key.");
  }

  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    values: {
      projectId: values.FIREBASE_PROJECT_ID,
      clientEmail: values.FIREBASE_CLIENT_EMAIL,
      privateKey,
    },
  };
}

function createAppOptions(credentials, useEmulator) {
  if (useEmulator) {
    return { projectId: credentials.values.projectId || "altftool-bca36" };
  }

  const { projectId, clientEmail, privateKey } = credentials.values;
  return {
    credential: cert({ projectId, clientEmail, privateKey }),
  };
}

function fail(message, details = {}) {
  console.error(message);
  if (Object.keys(details).length) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
}

const mode = envValue("FIREBASE_ADMIN_WRITE_CHECK_MODE") || "live";
const useDryRun = mode === "dry-run";
const useEmulator = Boolean(envValue("FIRESTORE_EMULATOR_HOST"));
const credentials = validateCredentials();

if (useDryRun) {
  console.log("Firebase Admin write check dry run passed.");
  console.log(JSON.stringify({
    mode,
    emulator: useEmulator,
    credentialReady: credentials.ok,
    missing: credentials.missing,
    invalid: credentials.invalid,
  }, null, 2));
  process.exit(0);
}

if (!useEmulator && !credentials.ok) {
  fail("Firebase Admin write check cannot run without ready credentials.", {
    missing: credentials.missing,
    invalid: credentials.invalid,
    hint: "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and the full FIREBASE_PRIVATE_KEY, or run against Firestore Emulator with FIRESTORE_EMULATOR_HOST.",
  });
}

const app = getApps()[0] || initializeApp(createAppOptions(credentials, useEmulator));
const db = getFirestore(app);
const checkId = `admin-write-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const docRef = db.collection("__altftool_health_checks__").doc(checkId);
let wroteDocument = false;
let exitCode = 0;

try {
  await docRef.set({
    checkId,
    source: "altftoolwebadmin/scripts/checkFirebaseAdminWrite.mjs",
    createdAt: FieldValue.serverTimestamp(),
  });
  wroteDocument = true;

  const snapshot = await docRef.get();
  if (!snapshot.exists) throw new Error("Write verification failed: document was not found after set().");
  if (snapshot.data()?.checkId !== checkId) {
    throw new Error("Write verification failed: checkId did not round-trip.");
  }

  await docRef.delete();
  wroteDocument = false;

  const deletedSnapshot = await docRef.get();
  if (deletedSnapshot.exists) throw new Error("Cleanup verification failed: health-check document still exists.");

  console.log("Firebase Admin write check passed.");
  console.log(JSON.stringify({
    mode,
    emulator: useEmulator,
    collection: "__altftool_health_checks__",
    checkedDocument: checkId,
  }, null, 2));
} catch (error) {
  exitCode = 1;
  console.error("Firebase Admin write check failed.");
  console.error(JSON.stringify({
    message: error?.message || String(error),
    collection: "__altftool_health_checks__",
    checkedDocument: checkId,
  }, null, 2));
} finally {
  if (wroteDocument) {
    await docRef.delete().catch(() => {});
  }
  await deleteApp(app).catch(() => {});
}

if (exitCode) process.exit(exitCode);
