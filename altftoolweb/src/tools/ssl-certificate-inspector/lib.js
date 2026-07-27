/**
 * SSL Certificate Inspector — parses a PEM-encoded X.509 certificate or chain
 * entirely in the browser and reports what it contains.
 *
 * NOTE ON SCOPE: a browser cannot read the certificate a remote server
 * presents — no web API exposes the peer certificate of a TLS connection, so
 * "fetch google.com and show its cert" is only possible from a server. This
 * module therefore inspects certificates you paste (copied from a browser's
 * certificate viewer, or from `openssl s_client -showcerts`), which needs no
 * network access at all.
 *
 * Standards implemented:
 *  - X.509 v3 structure and DER encoding: RFC 5280 with ITU-T X.690 (BER/DER)
 *    tag-length-value parsing.
 *  - PEM framing: RFC 7468 ("-----BEGIN CERTIFICATE-----").
 *  - Base64: RFC 4648 section 4.
 *  - UTCTime years: RFC 5280 section 4.1.2.5.1 — YY of 50..99 means 19YY,
 *    00..49 means 20YY.
 *  - Hostname matching: RFC 6125 section 6.4.3 — a wildcard is allowed only as
 *    the complete leftmost label and matches exactly one label.
 *  - Maximum certificate lifetime: 398 days for TLS certificates issued on or
 *    after 1 September 2020 (CA/Browser Forum Baseline Requirements).
 *  - Minimum RSA key size: 2048 bits (CA/Browser Forum Baseline Requirements).
 *
 * Pure module: no React, no DOM, no network, no clock reads — "today" is an
 * argument.
 */

/** CA/Browser Forum maximum TLS certificate lifetime, in days, from 2020-09-01. */
export const MAX_TLS_LIFETIME_DAYS = 398;
/** CA/Browser Forum minimum RSA modulus size for a publicly trusted TLS cert. */
export const MIN_RSA_BITS = 2048;
/** Default renewal warning threshold, in days. */
export const DEFAULT_WARN_DAYS = 30;

const MS_PER_DAY = 86400000;

/* --------------------------------------------------------------- base64/PEM */

const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64ToBytes(text) {
  const clean = String(text).replace(/[^A-Za-z0-9+/=]/g, "");
  if (clean.length % 4 !== 0) return null;
  const out = [];
  for (let i = 0; i < clean.length; i += 4) {
    const q = [0, 1, 2, 3].map((offset) => {
      const char = clean[i + offset];
      return char === "=" ? -1 : B64_ALPHABET.indexOf(char);
    });
    if (q[0] < 0 || q[1] < 0) return null;
    out.push((q[0] << 2) | (q[1] >> 4));
    if (q[2] >= 0) out.push(((q[1] & 0x0f) << 4) | (q[2] >> 2));
    if (q[3] >= 0) out.push(((q[2] & 0x03) << 6) | q[3]);
  }
  return Uint8Array.from(out);
}

/** Split a PEM blob into individual base64 bodies, in file order. */
export function splitPemBlocks(text) {
  const matches = String(text ?? "").matchAll(
    /-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/g,
  );
  return Array.from(matches, (match) => match[1]);
}

/* ------------------------------------------------------------- DER decoding */

/**
 * Read one DER TLV at `offset`.
 * @returns {{tag: number, start: number, length: number, end: number, contentStart: number}|null}
 */
function readTlv(bytes, offset) {
  if (offset + 2 > bytes.length) return null;
  const tag = bytes[offset];
  let cursor = offset + 1;
  let length = bytes[cursor];
  cursor += 1;

  if (length & 0x80) {
    const count = length & 0x7f;
    if (count === 0 || count > 4 || cursor + count > bytes.length) return null;
    length = 0;
    for (let i = 0; i < count; i += 1) {
      length = length * 256 + bytes[cursor + i];
    }
    cursor += count;
  }
  const end = cursor + length;
  if (end > bytes.length) return null;
  return { tag, start: offset, length, end, contentStart: cursor };
}

/** Read every TLV inside a constructed value. */
function readChildren(bytes, node) {
  const children = [];
  let cursor = node.contentStart;
  while (cursor < node.end) {
    const child = readTlv(bytes, cursor);
    if (!child) break;
    children.push(child);
    cursor = child.end;
  }
  return children;
}

/** Decode an OBJECT IDENTIFIER value into dotted form. */
function decodeOid(bytes, node) {
  const content = bytes.subarray(node.contentStart, node.end);
  if (content.length === 0) return "";
  const parts = [Math.floor(content[0] / 40), content[0] % 40];
  let value = 0;
  for (let i = 1; i < content.length; i += 1) {
    value = value * 128 + (content[i] & 0x7f);
    if ((content[i] & 0x80) === 0) {
      parts.push(value);
      value = 0;
    }
  }
  return parts.join(".");
}

const asciiDecoder = new TextDecoder("utf-8");

function decodeString(bytes, node) {
  return asciiDecoder.decode(bytes.subarray(node.contentStart, node.end));
}

function decodeIntegerHex(bytes, node) {
  return Array.from(bytes.subarray(node.contentStart, node.end))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(":");
}

/**
 * Decode UTCTime (tag 0x17) or GeneralizedTime (0x18) into an ISO string.
 * RFC 5280: UTCTime years 50-99 are 19xx, 00-49 are 20xx.
 */
function decodeTime(bytes, node) {
  const text = decodeString(bytes, node).trim();
  const isUtc = node.tag === 0x17;
  const match = isUtc
    ? text.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/)
    : text.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/);
  if (!match) return null;
  const year = isUtc
    ? Number(match[1]) >= 50
      ? 1900 + Number(match[1])
      : 2000 + Number(match[1])
    : Number(match[1]);
  const iso = `${String(year).padStart(4, "0")}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] ?? "00"}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : iso;
}

/* ------------------------------------------------------------------- tables */

const NAME_OIDS = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "1.2.840.113549.1.9.1": "emailAddress",
};

/** Signature algorithm OIDs, flagged where the hash is no longer acceptable. */
const SIGNATURE_OIDS = {
  "1.2.840.113549.1.1.4": { label: "MD5 with RSA", weak: true },
  "1.2.840.113549.1.1.5": { label: "SHA-1 with RSA", weak: true },
  "1.2.840.113549.1.1.10": { label: "RSASSA-PSS", weak: false },
  "1.2.840.113549.1.1.11": { label: "SHA-256 with RSA", weak: false },
  "1.2.840.113549.1.1.12": { label: "SHA-384 with RSA", weak: false },
  "1.2.840.113549.1.1.13": { label: "SHA-512 with RSA", weak: false },
  "1.2.840.10045.4.3.2": { label: "ECDSA with SHA-256", weak: false },
  "1.2.840.10045.4.3.3": { label: "ECDSA with SHA-384", weak: false },
  "1.2.840.10045.4.3.4": { label: "ECDSA with SHA-512", weak: false },
  "1.2.840.10045.4.1": { label: "ECDSA with SHA-1", weak: true },
  "1.3.101.112": { label: "Ed25519", weak: false },
};

const CURVE_OIDS = {
  "1.2.840.10045.3.1.7": { label: "P-256 (prime256v1)", bits: 256 },
  "1.3.132.0.34": { label: "P-384 (secp384r1)", bits: 384 },
  "1.3.132.0.35": { label: "P-521 (secp521r1)", bits: 521 },
  "1.3.132.0.10": { label: "secp256k1", bits: 256 },
};

const EXT_SAN = "2.5.29.17";
const EXT_BASIC_CONSTRAINTS = "2.5.29.19";
const EXT_KEY_USAGE = "2.5.29.15";
const EXT_EXT_KEY_USAGE = "2.5.29.37";

const KEY_USAGE_BITS = [
  "digitalSignature",
  "nonRepudiation",
  "keyEncipherment",
  "dataEncipherment",
  "keyAgreement",
  "keyCertSign",
  "cRLSign",
  "encipherOnly",
  "decipherOnly",
];

const EKU_OIDS = {
  "1.3.6.1.5.5.7.3.1": "TLS server authentication",
  "1.3.6.1.5.5.7.3.2": "TLS client authentication",
  "1.3.6.1.5.5.7.3.3": "Code signing",
  "1.3.6.1.5.5.7.3.4": "Email protection",
  "1.3.6.1.5.5.7.3.8": "Time stamping",
  "1.3.6.1.5.5.7.3.9": "OCSP signing",
};

/* ------------------------------------------------------------------ parsing */

function parseName(bytes, node) {
  const parts = [];
  readChildren(bytes, node).forEach((rdn) => {
    readChildren(bytes, rdn).forEach((pair) => {
      const [typeNode, valueNode] = readChildren(bytes, pair);
      if (!typeNode || !valueNode) return;
      const oid = decodeOid(bytes, typeNode);
      parts.push({
        key: NAME_OIDS[oid] ?? oid,
        value: decodeString(bytes, valueNode),
      });
    });
  });
  return {
    parts,
    text: parts.map((part) => `${part.key}=${part.value}`).join(", "),
    commonName: parts.find((part) => part.key === "CN")?.value ?? "",
    organisation: parts.find((part) => part.key === "O")?.value ?? "",
  };
}

function parsePublicKey(bytes, node) {
  const [algNode, keyNode] = readChildren(bytes, node);
  if (!algNode || !keyNode) return { algorithm: "Unknown", bits: null };
  const algChildren = readChildren(bytes, algNode);
  const algOid = algChildren[0] ? decodeOid(bytes, algChildren[0]) : "";

  if (algOid === "1.2.840.113549.1.1.1") {
    // BIT STRING content starts with the unused-bits count byte.
    const inner = readTlv(bytes, keyNode.contentStart + 1);
    let bits = null;
    if (inner) {
      const [modulus] = readChildren(bytes, inner);
      if (modulus) {
        let start = modulus.contentStart;
        while (start < modulus.end && bytes[start] === 0) start += 1; // strip DER sign padding
        bits = (modulus.end - start) * 8;
      }
    }
    return { algorithm: "RSA", bits, curve: null };
  }

  if (algOid === "1.2.840.10045.2.1") {
    const curveOid = algChildren[1] ? decodeOid(bytes, algChildren[1]) : "";
    const curve = CURVE_OIDS[curveOid];
    return { algorithm: "ECDSA", bits: curve?.bits ?? null, curve: curve?.label ?? curveOid };
  }

  if (algOid === "1.3.101.112") return { algorithm: "Ed25519", bits: 256, curve: "Curve25519" };
  if (algOid === "1.3.101.113") return { algorithm: "Ed448", bits: 448, curve: "Curve448" };

  return { algorithm: algOid || "Unknown", bits: null, curve: null };
}

function parseExtensions(bytes, node) {
  const result = {
    subjectAltNames: [],
    isCa: false,
    pathLength: null,
    keyUsage: [],
    extendedKeyUsage: [],
  };

  const [sequence] = readChildren(bytes, node);
  if (!sequence) return result;

  readChildren(bytes, sequence).forEach((extension) => {
    const children = readChildren(bytes, extension);
    if (children.length === 0) return;
    const oid = decodeOid(bytes, children[0]);
    const valueNode = children[children.length - 1]; // OCTET STRING
    const inner = readTlv(bytes, valueNode.contentStart);
    if (!inner) return;

    if (oid === EXT_SAN) {
      readChildren(bytes, inner).forEach((entry) => {
        if (entry.tag === 0x82) result.subjectAltNames.push(decodeString(bytes, entry));
        else if (entry.tag === 0x81) result.subjectAltNames.push(decodeString(bytes, entry));
        else if (entry.tag === 0x87) {
          const raw = Array.from(bytes.subarray(entry.contentStart, entry.end));
          if (raw.length === 4) result.subjectAltNames.push(raw.join("."));
        }
      });
    } else if (oid === EXT_BASIC_CONSTRAINTS) {
      const parts = readChildren(bytes, inner);
      parts.forEach((part) => {
        if (part.tag === 0x01) result.isCa = bytes[part.contentStart] !== 0x00;
        if (part.tag === 0x02) result.pathLength = bytes[part.contentStart];
      });
    } else if (oid === EXT_KEY_USAGE) {
      const unused = bytes[inner.contentStart];
      const data = bytes.subarray(inner.contentStart + 1, inner.end);
      const totalBits = data.length * 8 - unused;
      for (let index = 0; index < totalBits && index < KEY_USAGE_BITS.length; index += 1) {
        const byte = data[Math.floor(index / 8)];
        if (byte & (0x80 >> index % 8)) result.keyUsage.push(KEY_USAGE_BITS[index]);
      }
    } else if (oid === EXT_EXT_KEY_USAGE) {
      readChildren(bytes, inner).forEach((entry) => {
        const value = decodeOid(bytes, entry);
        result.extendedKeyUsage.push(EKU_OIDS[value] ?? value);
      });
    }
  });

  return result;
}

/**
 * Parse one PEM certificate.
 * @param {string} pem
 * @returns {object|{error: string}}
 */
export function parseCertificate(pem) {
  const blocks = splitPemBlocks(pem);
  const body = blocks.length > 0 ? blocks[0] : pem;
  const bytes = base64ToBytes(body);
  if (!bytes || bytes.length < 16) {
    return { error: "That is not a PEM certificate — paste the whole -----BEGIN CERTIFICATE----- block." };
  }

  const root = readTlv(bytes, 0);
  if (!root || root.tag !== 0x30) return { error: "The DER structure is not a SEQUENCE — the certificate is corrupt." };

  const [tbs, sigAlgNode] = readChildren(bytes, root);
  if (!tbs || tbs.tag !== 0x30) return { error: "Could not read the tbsCertificate section." };

  const tbsChildren = readChildren(bytes, tbs);
  let index = 0;
  let version = 1;
  if (tbsChildren[0] && tbsChildren[0].tag === 0xa0) {
    const [versionNode] = readChildren(bytes, tbsChildren[0]);
    if (versionNode) version = bytes[versionNode.contentStart] + 1;
    index = 1;
  }

  const serialNode = tbsChildren[index];
  const issuerNode = tbsChildren[index + 2];
  const validityNode = tbsChildren[index + 3];
  const subjectNode = tbsChildren[index + 4];
  const spkiNode = tbsChildren[index + 5];
  if (!serialNode || !issuerNode || !validityNode || !subjectNode || !spkiNode) {
    return { error: "The certificate is missing required X.509 fields." };
  }

  const [notBeforeNode, notAfterNode] = readChildren(bytes, validityNode);
  const notBefore = notBeforeNode ? decodeTime(bytes, notBeforeNode) : null;
  const notAfter = notAfterNode ? decodeTime(bytes, notAfterNode) : null;
  if (!notBefore || !notAfter) return { error: "The validity dates could not be decoded." };

  const extensionsNode = tbsChildren.slice(index + 6).find((child) => child.tag === 0xa3);
  const extensions = extensionsNode
    ? parseExtensions(bytes, extensionsNode)
    : { subjectAltNames: [], isCa: false, pathLength: null, keyUsage: [], extendedKeyUsage: [] };

  const sigChildren = sigAlgNode ? readChildren(bytes, sigAlgNode) : [];
  const sigOid = sigChildren[0] ? decodeOid(bytes, sigChildren[0]) : "";
  const signature = SIGNATURE_OIDS[sigOid] ?? { label: sigOid || "Unknown", weak: false };

  const issuer = parseName(bytes, issuerNode);
  const subject = parseName(bytes, subjectNode);

  return {
    version,
    serialNumber: decodeIntegerHex(bytes, serialNode),
    issuer,
    subject,
    notBefore,
    notAfter,
    lifetimeDays: Math.round((Date.parse(notAfter) - Date.parse(notBefore)) / MS_PER_DAY),
    publicKey: parsePublicKey(bytes, spkiNode),
    signatureAlgorithm: signature.label,
    signatureIsWeak: signature.weak,
    selfSigned: issuer.text === subject.text,
    ...extensions,
    byteLength: bytes.length,
  };
}

/**
 * RFC 6125 section 6.4.3 hostname matching. A wildcard is only valid as the
 * entire leftmost label and matches exactly one label.
 */
export function matchesHostname(hostname, pattern) {
  const host = String(hostname ?? "").trim().toLowerCase().replace(/\.$/, "");
  const name = String(pattern ?? "").trim().toLowerCase().replace(/\.$/, "");
  if (!host || !name) return false;
  if (!name.startsWith("*.")) return host === name;

  const suffix = name.slice(2);
  if (!suffix.includes(".")) return false; // never match a wildcard across a public suffix
  if (!host.endsWith(`.${suffix}`)) return false;
  const label = host.slice(0, host.length - suffix.length - 1);
  return label.length > 0 && !label.includes(".");
}

/**
 * A bare YYYY-MM-DD is taken as 12:00 UTC on that day, so a certificate issued
 * or expiring at some hour of the same day is not misreported as not-yet-valid
 * or already expired. A full ISO timestamp is used as given.
 */
function normaliseInstant(value) {
  const text = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T12:00:00Z` : text;
}

/**
 * Validity, expiry and hostname checks for a parsed certificate.
 *
 * @param {object} cert - the object from parseCertificate
 * @param {{hostname?: string, today: string, warnDays?: number}} options
 * @returns {object|{error: string}}
 */
export function checkCertificate(cert, { hostname = "", today, warnDays = DEFAULT_WARN_DAYS } = {}) {
  if (!cert || cert.error) return { error: cert?.error ?? "Parse a certificate first." };
  const now = Date.parse(normaliseInstant(today));
  if (!Number.isFinite(now)) return { error: "Enter the date to check against as YYYY-MM-DD." };

  const threshold = Number(warnDays);
  if (!Number.isFinite(threshold) || threshold < 0) {
    return { error: "The renewal warning must be zero days or more." };
  }

  const notBefore = Date.parse(cert.notBefore);
  const notAfter = Date.parse(cert.notAfter);
  const daysToExpiry = Math.floor((notAfter - now) / MS_PER_DAY);
  const daysSinceIssue = Math.floor((now - notBefore) / MS_PER_DAY);

  let status = "valid";
  if (now < notBefore) status = "not-yet-valid";
  else if (now > notAfter) status = "expired";
  else if (daysToExpiry <= threshold) status = "expiring";

  const names = [
    ...cert.subjectAltNames,
    ...(cert.subject.commonName ? [cert.subject.commonName] : []),
  ];
  const hostnameChecked = String(hostname).trim() !== "";
  const matchedName = hostnameChecked
    ? names.find((name) => matchesHostname(hostname, name)) ?? null
    : null;

  const warnings = [];
  if (cert.signatureIsWeak) {
    warnings.push(`Signed with ${cert.signatureAlgorithm}, which browsers no longer accept for TLS.`);
  }
  if (cert.publicKey.algorithm === "RSA" && cert.publicKey.bits && cert.publicKey.bits < MIN_RSA_BITS) {
    warnings.push(
      `RSA key is ${cert.publicKey.bits} bits, below the ${MIN_RSA_BITS}-bit CA/Browser Forum minimum.`,
    );
  }
  if (cert.lifetimeDays > MAX_TLS_LIFETIME_DAYS && !cert.isCa) {
    warnings.push(
      `Lifetime is ${cert.lifetimeDays} days, over the ${MAX_TLS_LIFETIME_DAYS}-day maximum for TLS certificates issued since 1 September 2020.`,
    );
  }
  if (cert.subjectAltNames.length === 0 && !cert.isCa) {
    warnings.push("No subjectAltName extension — browsers ignore commonName and will reject this.");
  }
  if (hostnameChecked && !matchedName) {
    warnings.push(`No SAN or CN matches "${hostname}" under RFC 6125 wildcard rules.`);
  }
  if (cert.selfSigned && !cert.isCa) {
    warnings.push("Self-signed leaf certificate — no public CA vouches for it.");
  }

  return {
    status,
    daysToExpiry,
    daysSinceIssue,
    expiresOn: cert.notAfter,
    hostnameChecked,
    hostnameMatches: hostnameChecked ? Boolean(matchedName) : null,
    matchedName,
    names,
    warnings,
    trusted: status === "valid" && warnings.length === 0,
  };
}

/**
 * Parse a chain and verify the certificates are in the RFC 5246 order
 * (leaf first, each issued by the next).
 *
 * @param {string} pemText
 * @returns {{certificates: Array, orderOk: boolean, issues: string[]}|{error: string}}
 */
export function inspectChain(pemText) {
  const blocks = splitPemBlocks(pemText);
  if (blocks.length === 0) {
    return { error: "No -----BEGIN CERTIFICATE----- block found in that text." };
  }

  const certificates = blocks.map((block) =>
    parseCertificate(`-----BEGIN CERTIFICATE-----${block}-----END CERTIFICATE-----`),
  );
  const failed = certificates.findIndex((cert) => cert.error);
  if (failed >= 0) {
    return { error: `Certificate ${failed + 1} in the chain could not be parsed: ${certificates[failed].error}` };
  }

  const issues = [];
  if (certificates[0].isCa) issues.push("The first certificate is a CA, so the leaf is missing or out of order.");
  for (let i = 0; i < certificates.length - 1; i += 1) {
    if (certificates[i].issuer.text !== certificates[i + 1].subject.text) {
      issues.push(
        `Certificate ${i + 1} was issued by "${certificates[i].issuer.text}", which does not match the subject of certificate ${i + 2}.`,
      );
    }
  }

  return { certificates, orderOk: issues.length === 0, issues };
}
