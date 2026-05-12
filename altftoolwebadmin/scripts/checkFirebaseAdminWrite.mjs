import { existsSync } from "node:fs";
import path from "node:path";
import { config as loadEnv } from "dotenv";

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

function createAppOptions(credentials, cert) {
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

function firestoreRestValue(value) {
  if (typeof value === "string") return { stringValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "boolean") return { booleanValue: value };
  if (Number.isInteger(value)) return { integerValue: String(value) };
  if (typeof value === "number") return { doubleValue: value };
  return { stringValue: String(value) };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  return { response, body };
}

async function runEmulatorCheck({ projectId, checkId }) {
  const host = envValue("FIRESTORE_EMULATOR_HOST");
  const baseUrl = `http://${host}/v1/projects/${projectId}/databases/(default)/documents`;
  const documentUrl = `${baseUrl}/__altftool_health_checks__/${checkId}`;
  const payload = {
    fields: {
      checkId: firestoreRestValue(checkId),
      source: firestoreRestValue("altftoolwebadmin/scripts/checkFirebaseAdminWrite.mjs"),
      createdAt: firestoreRestValue(new Date()),
    },
  };

  const write = await fetchJson(documentUrl, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!write.response.ok) {
    throw new Error(`Emulator write failed with ${write.response.status}: ${JSON.stringify(write.body)}`);
  }

  const read = await fetchJson(documentUrl);
  if (!read.response.ok) {
    throw new Error(`Emulator read failed with ${read.response.status}: ${JSON.stringify(read.body)}`);
  }
  if (read.body?.fields?.checkId?.stringValue !== checkId) {
    throw new Error("Emulator write verification failed: checkId did not round-trip.");
  }

  const deleted = await fetchJson(documentUrl, { method: "DELETE" });
  if (!deleted.response.ok) {
    throw new Error(`Emulator cleanup failed with ${deleted.response.status}: ${JSON.stringify(deleted.body)}`);
  }

  const afterDelete = await fetchJson(documentUrl);
  if (afterDelete.response.status !== 404) {
    throw new Error("Emulator cleanup verification failed: health-check document still exists.");
  }
}

async function runAdminSdkCheck({ credentials, checkId }) {
  const [{ cert, deleteApp, getApps, initializeApp }, { FieldValue, getFirestore }] = await Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/firestore"),
  ]);

  const app = getApps()[0] || initializeApp(createAppOptions(credentials, cert));
  const db = getFirestore(app);
  const docRef = db.collection("__altftool_health_checks__").doc(checkId);
  let wroteDocument = false;

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
  } finally {
    if (wroteDocument) {
      await docRef.delete().catch(() => {});
    }
    await deleteApp(app).catch(() => {});
  }
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

const checkId = `admin-write-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let exitCode = 0;

try {
  if (useEmulator) {
    await runEmulatorCheck({
      projectId: credentials.values.projectId || "altftool-bca36",
      checkId,
    });
  } else {
    await runAdminSdkCheck({ credentials, checkId });
  }

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
}

if (exitCode) process.exit(exitCode);
