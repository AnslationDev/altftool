import admin from "firebase-admin";

let cachedAuth = null;
let cachedDb = null;
let cachedMessaging = null;

const FIREBASE_ADMIN_ENV = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

function normalizePrivateKey(value = "") {
  return value.replace(/\\n/g, "\n").trim();
}

function validateFirebaseAdminConfig(env = process.env) {
  const values = Object.fromEntries(
    FIREBASE_ADMIN_ENV.map((name) => [
      name,
      typeof env[name] === "string" ? env[name].trim() : "",
    ]),
  );
  const missing = FIREBASE_ADMIN_ENV.filter((name) => !values[name]);
  const privateKey = normalizePrivateKey(values.FIREBASE_PRIVATE_KEY);
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
    projectId: values.FIREBASE_PROJECT_ID || null,
    clientEmailConfigured: Boolean(values.FIREBASE_CLIENT_EMAIL),
    privateKeyConfigured: Boolean(values.FIREBASE_PRIVATE_KEY),
    privateKeyLooksComplete:
      Boolean(values.FIREBASE_PRIVATE_KEY) &&
      privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
      privateKey.includes("-----END PRIVATE KEY-----"),
    values: {
      projectId: values.FIREBASE_PROJECT_ID,
      clientEmail: values.FIREBASE_CLIENT_EMAIL,
      privateKey,
    },
  };
}

export function getFirebaseAdminConfigStatus() {
  const status = validateFirebaseAdminConfig();

  return {
    ok: status.ok,
    projectId: status.projectId,
    clientEmailConfigured: status.clientEmailConfigured,
    privateKeyConfigured: status.privateKeyConfigured,
    privateKeyLooksComplete: status.privateKeyLooksComplete,
    missing: status.missing,
    invalid: status.invalid,
  };
}

function getFirebaseAdminConfig() {
  const status = validateFirebaseAdminConfig();

  if (!status.ok) {
    const parts = [];
    if (status.missing.length) {
      parts.push(`missing: ${status.missing.join(", ")}`);
    }
    if (status.invalid.length) {
      parts.push(status.invalid.join(" "));
    }

    const error = new Error(`Firebase Admin credentials are not ready (${parts.join("; ")}).`);
    error.status = 500;
    error.missing = status.missing;
    error.invalid = status.invalid;
    throw error;
  }

  return status.values;
}

function getFirebaseAdminApp() {
  if (admin.apps.length) return admin.app();

  const { projectId, clientEmail, privateKey } = getFirebaseAdminConfig();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return admin.app();
}

export function getAdminAuth() {
  if (!cachedAuth) cachedAuth = getFirebaseAdminApp().auth();
  return cachedAuth;
}

export function getAdminDb() {
  if (!cachedDb) cachedDb = getFirebaseAdminApp().firestore();
  return cachedDb;
}

export function getAdminMessaging() {
  if (!cachedMessaging) cachedMessaging = getFirebaseAdminApp().messaging();
  return cachedMessaging;
}

function lazyAdminProxy(getTarget) {
  return new Proxy(
    {},
    {
      get(_target, prop) {
        const target = getTarget();
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
      },
    }
  );
}

export const adminAuth = lazyAdminProxy(getAdminAuth);
export const adminDb = lazyAdminProxy(getAdminDb);
export const adminMessaging = lazyAdminProxy(getAdminMessaging);
