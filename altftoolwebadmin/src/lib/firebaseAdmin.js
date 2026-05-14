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

function parseServiceAccount(rawValue = "") {
  const value = rawValue.trim();
  if (!value) return { account: null, error: null };

  try {
    const parsed = JSON.parse(value);
    return {
      account: {
        projectId: parsed.project_id || parsed.projectId || "",
        clientEmail: parsed.client_email || parsed.clientEmail || "",
        privateKey: parsed.private_key || parsed.privateKey || "",
      },
      error: null,
    };
  } catch {
    return {
      account: null,
      error: "FIREBASE_SERVICE_ACCOUNT must be valid service-account JSON.",
    };
  }
}

function validateFirebaseAdminConfig(env = process.env) {
  const rawValues = Object.fromEntries(
    FIREBASE_ADMIN_ENV.map((name) => [
      name,
      typeof env[name] === "string" ? env[name].trim() : "",
    ]),
  );
  const serviceAccountRaw = typeof env.FIREBASE_SERVICE_ACCOUNT === "string"
    ? env.FIREBASE_SERVICE_ACCOUNT
    : "";
  const { account: serviceAccount, error: serviceAccountError } = parseServiceAccount(serviceAccountRaw);
  const values = {
    projectId: rawValues.FIREBASE_PROJECT_ID || serviceAccount?.projectId || "",
    clientEmail: rawValues.FIREBASE_CLIENT_EMAIL || serviceAccount?.clientEmail || "",
    privateKey: rawValues.FIREBASE_PRIVATE_KEY || serviceAccount?.privateKey || "",
  };
  const missing = [
    ["FIREBASE_PROJECT_ID", values.projectId],
    ["FIREBASE_CLIENT_EMAIL", values.clientEmail],
    ["FIREBASE_PRIVATE_KEY", values.privateKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  const privateKey = normalizePrivateKey(values.privateKey);
  const invalid = [];

  if (serviceAccountError) {
    invalid.push(serviceAccountError);
  }

  if (values.clientEmail && !values.clientEmail.includes("@")) {
    invalid.push("FIREBASE_CLIENT_EMAIL must be a service-account email.");
  }

  if (
    values.privateKey &&
    (!privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !privateKey.includes("-----END PRIVATE KEY-----"))
  ) {
    invalid.push("FIREBASE_PRIVATE_KEY must be the full PEM private key.");
  }

  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    projectId: values.projectId || null,
    clientEmailConfigured: Boolean(values.clientEmail),
    privateKeyConfigured: Boolean(values.privateKey),
    privateKeyLooksComplete:
      Boolean(values.privateKey) &&
      privateKey.includes("-----BEGIN PRIVATE KEY-----") &&
      privateKey.includes("-----END PRIVATE KEY-----"),
    serviceAccountConfigured: Boolean(serviceAccountRaw.trim()),
    values: {
      projectId: values.projectId,
      clientEmail: values.clientEmail,
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
    serviceAccountConfigured: status.serviceAccountConfigured,
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
