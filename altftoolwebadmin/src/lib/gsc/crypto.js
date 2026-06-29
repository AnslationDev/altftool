// altftoolwebadmin/src/lib/gsc/crypto.js
//
// Authenticated encryption (AES-256-GCM) for Google OAuth tokens at rest.
// The key comes from GSC_TOKEN_ENC_KEY (32 bytes, hex64 or base64). Tokens are
// NEVER stored in plaintext: if the key is missing, storage refuses to persist.
//
// Ciphertext format: "v1:<iv b64>:<authTag b64>:<ciphertext b64>"

import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const VERSION = "v1";

function readKey() {
  const raw = process.env.GSC_TOKEN_ENC_KEY;
  if (!raw) return null;
  let key;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) key = Buffer.from(raw, "hex");
  else key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("GSC_TOKEN_ENC_KEY must decode to 32 bytes (64 hex chars or base64).");
  }
  return key;
}

export function isEncryptionConfigured() {
  try {
    return Boolean(readKey());
  } catch {
    return false;
  }
}

export function encryptSecret(plaintext) {
  const key = readKey();
  if (!key) throw new Error("GSC_TOKEN_ENC_KEY is not configured — cannot encrypt tokens.");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(payload) {
  const key = readKey();
  if (!key) throw new Error("GSC_TOKEN_ENC_KEY is not configured — cannot decrypt tokens.");
  const parts = String(payload || "").split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Malformed ciphertext.");
  }
  const [, ivb, tagb, datab] = parts;
  const iv = Buffer.from(ivb, "base64");
  const tag = Buffer.from(tagb, "base64");
  const data = Buffer.from(datab, "base64");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
