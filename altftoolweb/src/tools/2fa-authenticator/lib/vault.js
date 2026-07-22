/**
 * Secure client-side vault for TOTP secrets.
 *
 * Threat model & guarantees:
 *  - Secrets are NEVER stored in plaintext. Everything persisted to IndexedDB is
 *    AES-256-GCM ciphertext.
 *  - Two unlock modes:
 *      "device"     - encrypted with a NON-EXTRACTABLE AES-GCM CryptoKey that is
 *                     generated once and kept inside IndexedDB. The raw key bytes
 *                     can never be read by JavaScript (extractable:false), so the
 *                     key cannot be exfiltrated by XSS or copied to another
 *                     browser profile. Frictionless: auto-unlocks on this profile.
 *      "passphrase" - encrypted with a key derived from a user passphrase via
 *                     PBKDF2-SHA256 (600k iterations). The key exists only in
 *                     memory after unlock and is never persisted. Zero-knowledge:
 *                     without the passphrase the ciphertext is useless even with
 *                     full storage access.
 *  - The active key lives in a module-scoped variable, never in React state, and
 *    is cleared from memory on lock / tab-hide / unload.
 *  - All account objects are allow-list rebuilt on read/write (prototype-pollution
 *    safe) and secrets are validated as Base32.
 *
 * No secret, key or code is ever sent to a network, logged, or placed in a URL.
 */

const DB_NAME = "altf-2fa-vault";
const STORE = "keyval";
const DEVICE_KEY_ID = "device-key-v1";
const BLOB_ID = "vault-blob-v1";
const PBKDF2_ITERATIONS = 600000;
const VAULT_VERSION = 1;

const ALLOWED_ALGORITHMS = ["SHA1", "SHA256", "SHA512"];
const ALLOWED_DIGITS = [6, 7, 8];
const ALLOWED_PERIODS = [15, 30, 45, 60];

/* ------------------------------------------------------------------ *
 * Environment helpers
 * ------------------------------------------------------------------ */
function getCrypto() {
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (!c?.subtle) throw new Error("Web Crypto API unavailable in this browser.");
  return c;
}

function hasIndexedDB() {
  return typeof indexedDB !== "undefined";
}

function toBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function randomBytes(length) {
  return getCrypto().getRandomValues(new Uint8Array(length));
}

/* ------------------------------------------------------------------ *
 * Input hardening (exported for testing)
 * ------------------------------------------------------------------ */
export function sanitizeText(value, maxLength = 64) {
  // Remove angle brackets and backticks, then drop any ASCII control chars by
  // code point (0-31 and 127). Defense in depth: React escapes on render; this
  // keeps stored data clean too. Spaces, digits, letters, @ and . are preserved.
  const stripped = String(value ?? "").replace(/[<>`]/g, "");
  let out = "";
  for (const ch of stripped) {
    const code = ch.codePointAt(0);
    if (code > 31 && code !== 127) out += ch;
  }
  return out.slice(0, maxLength).trim();
}

export function normalizeSecret(value) {
  // Keep only the Base32 alphabet, padding, whitespace and dashes; drop the rest.
  return String(value ?? "").replace(/[^A-Za-z2-7=\s-]/g, "");
}

export function makeId() {
  return Array.from(randomBytes(9))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Rebuild an account from untrusted input using ONLY known keys. Because the
 * result is a fresh object literal, __proto__ / constructor / prototype keys in
 * the source can never pollute Object.prototype. Returns null if invalid.
 */
export function sanitizeAccount(raw) {
  if (!raw || typeof raw !== "object") return null;
  const secret = normalizeSecret(raw.secret).trim();
  if (!secret) return null;
  const digits = Number(raw.digits);
  const period = Number(raw.period);
  return {
    id: /^[a-z0-9-]{1,64}$/i.test(String(raw.id || "")) ? String(raw.id) : makeId(),
    name: sanitizeText(raw.name, 60) || "Account",
    email: sanitizeText(raw.email, 120),
    secret,
    algorithm: ALLOWED_ALGORITHMS.includes(raw.algorithm) ? raw.algorithm : "SHA1",
    digits: ALLOWED_DIGITS.includes(digits) ? digits : 6,
    period: ALLOWED_PERIODS.includes(period) ? period : 30,
  };
}

export function sanitizeAccounts(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const account = sanitizeAccount(item);
    if (!account || seen.has(account.id)) continue;
    seen.add(account.id);
    out.push(account);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Pure crypto (exported for testing)
 * ------------------------------------------------------------------ */
export async function deriveKeyFromPassphrase(passphrase, salt) {
  const subtle = getCrypto().subtle;
  const material = await subtle.importKey(
    "raw",
    new TextEncoder().encode(String(passphrase)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false, // non-extractable
    ["encrypt", "decrypt"],
  );
}

export async function encryptJSON(key, value) {
  const iv = randomBytes(12);
  const data = new TextEncoder().encode(JSON.stringify(value));
  const cipher = await getCrypto().subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { iv: toBase64(iv), ct: toBase64(new Uint8Array(cipher)) };
}

export async function decryptJSON(key, payload) {
  const iv = fromBase64(payload.iv);
  const ct = fromBase64(payload.ct);
  const plain = await getCrypto().subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(plain));
}

/* ------------------------------------------------------------------ *
 * IndexedDB glue (browser only)
 * ------------------------------------------------------------------ */
let dbPromise = null;
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB open failed"));
  });
  return dbPromise;
}

async function idbGet(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(id, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbDel(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getOrCreateDeviceKey() {
  const existing = await idbGet(DEVICE_KEY_ID);
  if (existing) return existing; // opaque, non-extractable CryptoKey
  const key = await getCrypto().subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false, // non-extractable - bytes never leave the browser
    ["encrypt", "decrypt"],
  );
  await idbSet(DEVICE_KEY_ID, key);
  return key;
}

/* ------------------------------------------------------------------ *
 * Vault manager - in-memory key never touches React state
 * ------------------------------------------------------------------ */
const LOCKED = "VAULT_LOCKED";

let deviceKey = null; // non-extractable, device mode
let sessionKey = null; // passphrase-derived, cleared on lock
let available = false;

export const VaultErrors = { LOCKED };

export function isVaultAvailable() {
  return available;
}

async function readBlob() {
  const blob = await idbGet(BLOB_ID);
  if (!blob || typeof blob !== "object" || !blob.iv || !blob.ct) return null;
  return blob;
}

/** Initialize storage. Returns { supported, hasVault, mode, locked }. */
export async function initVault() {
  if (!hasIndexedDB()) {
    available = false;
    return { supported: false, hasVault: false, mode: "none", locked: false };
  }
  try {
    getCrypto();
    deviceKey = await getOrCreateDeviceKey();
    available = true;
    const blob = await readBlob();
    const mode = blob?.mode === "passphrase" ? "passphrase" : blob ? "device" : "none";
    const locked = mode === "passphrase" && !sessionKey;
    return { supported: true, hasVault: Boolean(blob), mode, locked };
  } catch {
    available = false;
    return { supported: false, hasVault: false, mode: "none", locked: false };
  }
}

export async function getMode() {
  const blob = await readBlob();
  return blob?.mode === "passphrase" ? "passphrase" : blob ? "device" : "none";
}

export async function isLocked() {
  const mode = await getMode();
  return mode === "passphrase" && !sessionKey;
}

function activeKeyFor(mode) {
  if (mode === "passphrase") {
    if (!sessionKey) throw new Error(LOCKED);
    return sessionKey;
  }
  return deviceKey;
}

/** Load and decrypt accounts. Throws Error(LOCKED) if a passphrase is required. */
export async function loadAccounts() {
  if (!available) return [];
  const blob = await readBlob();
  if (!blob) return [];
  const mode = blob.mode === "passphrase" ? "passphrase" : "device";
  const key = activeKeyFor(mode);
  const decoded = await decryptJSON(key, blob);
  return sanitizeAccounts(decoded);
}

/** Encrypt + persist accounts using the current mode's key. */
export async function saveAccounts(accounts) {
  if (!available) return false;
  const clean = sanitizeAccounts(accounts);
  const mode = await getMode();
  const usePassphrase = mode === "passphrase";
  const key = usePassphrase ? activeKeyFor("passphrase") : deviceKey;
  const payload = await encryptJSON(key, clean);
  const blob = { v: VAULT_VERSION, mode: usePassphrase ? "passphrase" : "device", ...payload };
  if (usePassphrase) {
    const existing = await readBlob();
    if (existing?.salt) blob.salt = existing.salt;
  }
  await idbSet(BLOB_ID, blob);
  return true;
}

/** Unlock a passphrase vault. Returns decrypted accounts or throws on bad pass. */
export async function unlockWithPassphrase(passphrase) {
  const blob = await readBlob();
  if (!blob || blob.mode !== "passphrase" || !blob.salt) {
    throw new Error("This vault is not passphrase-protected.");
  }
  const key = await deriveKeyFromPassphrase(passphrase, fromBase64(blob.salt));
  let decoded;
  try {
    decoded = await decryptJSON(key, blob); // GCM tag fails on wrong passphrase
  } catch {
    throw new Error("Incorrect passphrase.");
  }
  sessionKey = key;
  return sanitizeAccounts(decoded);
}

/** Turn a device-key vault into a passphrase (zero-knowledge) vault. */
export async function enablePassphrase(passphrase, accounts) {
  const salt = randomBytes(16);
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const payload = await encryptJSON(key, sanitizeAccounts(accounts));
  await idbSet(BLOB_ID, {
    v: VAULT_VERSION,
    mode: "passphrase",
    salt: toBase64(salt),
    ...payload,
  });
  sessionKey = key;
  return true;
}

/** Remove passphrase protection, re-encrypting under the device key. */
export async function disablePassphrase(accounts) {
  const payload = await encryptJSON(deviceKey, sanitizeAccounts(accounts));
  await idbSet(BLOB_ID, { v: VAULT_VERSION, mode: "device", ...payload });
  sessionKey = null;
  return true;
}

/** Clear the in-memory passphrase key. */
export function lock() {
  sessionKey = null;
}

/** Wipe everything - vault blob and the device key. */
export async function wipeVault() {
  sessionKey = null;
  await idbDel(BLOB_ID);
  await idbDel(DEVICE_KEY_ID);
  deviceKey = null;
  available = false;
}
