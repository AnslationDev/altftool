// altftoolwebadmin/src/lib/gsc/tokenStore.js
//
// Org-wide Google Search Console connection store (single shared connection).
// Tokens are encrypted at rest (AES-256-GCM) and live in `integrations/gscConnection`,
// which is denied to all clients by Firestore rules — only the Admin SDK (server)
// can read/write it. A short in-memory cache avoids re-reading + re-decrypting on
// every request.

import { adminDb } from "@/lib/firebaseAdmin";
import { encryptSecret, decryptSecret, isEncryptionConfigured } from "./crypto";

const DOC_PATH = ["integrations", "gscConnection"];
const CACHE_TTL_MS = 30_000;

let _cache = null;
let _cacheAt = 0;

function docRef() {
  return adminDb.collection(DOC_PATH[0]).doc(DOC_PATH[1]);
}

function invalidate() {
  _cache = null;
  _cacheAt = 0;
}

async function readRaw({ force = false } = {}) {
  if (!force && _cache && Date.now() - _cacheAt < CACHE_TTL_MS) return _cache;
  const snap = await docRef().get();
  _cache = snap.exists ? snap.data() : null;
  _cacheAt = Date.now();
  return _cache;
}

export async function isConnected() {
  const raw = await readRaw();
  return Boolean(raw?.connected && raw?.refreshTokenEnc);
}

/** Public, token-free view for the UI. */
export async function getConnection() {
  const raw = await readRaw();
  if (!raw?.connected) return { connected: false };
  return {
    connected: true,
    googleEmail: raw.googleEmail || null,
    activeProperty: raw.activeProperty || null,
    properties: raw.properties || [],
    scopes: raw.scopes || [],
    connectedAt: raw.connectedAt || null,
    connectedByEmail: raw.connectedByEmail || null,
    lastSyncedAt: raw.lastSyncedAt || null,
    tokenExpiresAt: raw.accessTokenExpiresAt || null,
  };
}

export async function saveConnection({ tokens = {}, profile = {}, scopes = [], actor = {} } = {}) {
  if (!isEncryptionConfigured()) {
    throw new Error("Refusing to store tokens: GSC_TOKEN_ENC_KEY is not configured.");
  }
  const existing = await readRaw({ force: true });

  const payload = {
    connected: true,
    provider: "oauth",
    googleEmail: profile.email || existing?.googleEmail || null,
    googleSub: profile.sub || existing?.googleSub || null,
    scopes: scopes.length ? scopes : existing?.scopes || [],
    accessTokenEnc: tokens.access_token ? encryptSecret(tokens.access_token) : existing?.accessTokenEnc || null,
    accessTokenExpiresAt: tokens.expires_in
      ? Date.now() + Number(tokens.expires_in) * 1000
      : existing?.accessTokenExpiresAt || null,
    // Google only returns a refresh_token on first consent — keep the old one otherwise.
    refreshTokenEnc: tokens.refresh_token ? encryptSecret(tokens.refresh_token) : existing?.refreshTokenEnc || null,
    activeProperty: existing?.activeProperty || null,
    properties: existing?.properties || [],
    connectedByUid: actor.uid || existing?.connectedByUid || null,
    connectedByEmail: actor.email || existing?.connectedByEmail || null,
    connectedAt: existing?.connectedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await docRef().set(payload, { merge: true });
  invalidate();
  return getConnection();
}

export async function updateAccessToken({ access_token, expires_in } = {}) {
  if (!access_token) return;
  await docRef().set(
    {
      accessTokenEnc: encryptSecret(access_token),
      accessTokenExpiresAt: Date.now() + Number(expires_in || 3600) * 1000,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  invalidate();
}

export async function setActiveProperty(siteUrl) {
  await docRef().set({ activeProperty: siteUrl || null, updatedAt: new Date().toISOString() }, { merge: true });
  invalidate();
}

export async function setCachedProperties(properties = []) {
  await docRef().set({ properties, updatedAt: new Date().toISOString() }, { merge: true });
  invalidate();
}

export async function markSynced() {
  await docRef().set({ lastSyncedAt: new Date().toISOString() }, { merge: true });
  invalidate();
}

export async function clearConnection() {
  await docRef().delete().catch(() => {});
  invalidate();
}

/** Server-only: the decrypted refresh token (for the OAuth client). */
export async function getRefreshToken() {
  const raw = await readRaw();
  if (!raw?.refreshTokenEnc) return null;
  return decryptSecret(raw.refreshTokenEnc);
}

/** Server-only: a still-valid access token + expiry, or null if refresh is needed. */
export async function getStoredAccessToken() {
  const raw = await readRaw();
  if (!raw?.accessTokenEnc) return null;
  const skewMs = 60_000; // refresh a minute early
  if (raw.accessTokenExpiresAt && raw.accessTokenExpiresAt - skewMs < Date.now()) return null;
  return decryptSecret(raw.accessTokenEnc);
}

export async function getActiveProperty() {
  const raw = await readRaw();
  return raw?.activeProperty || null;
}
