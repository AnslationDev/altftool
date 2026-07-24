const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_URL_CHARACTERS = 2_048;
const MAX_TITLE_CHARACTERS = 500;
const MAX_NOTES_CHARACTERS = 5_000;
const MAX_FILENAME_CHARACTERS = 255;
const SHA256_PATTERN = /^[a-f0-9]{64}$/u;
const OBSERVED_AT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})$/u;
const SENSITIVE_QUERY_KEY_PATTERN =
  /^(?:(?:access|auth|csrf|id|refresh|reset|sas|security|verification)?token|apikey|auth|authorization|authcode|authorizationcode|bearer|clientsecret|code|credential|jwt|key|magiclink|nonce|oauth|oauthcode|otp|pass|password|passwordresettoken|passwd|privatekey|secret|session|sessionid|sig|signature|ticket|xamzcredential|xamzsecuritytoken|xamzsignature|xgoogcredential|xgoogsignature)$/u;

const MEDIA_TYPES = Object.freeze({
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
});

const LIMITATIONS = Object.freeze([
  "The SHA-256 digest identifies the exact uploaded screenshot bytes; it does not establish who created the file or whether its depicted content is true.",
  "The source URL, page title, observation time, and notes are user-entered metadata and are not independently verified.",
  "The complete accepted source URL, including ordinary query parameter names and values, is stored in the downloaded manifest.",
  "ALTFTool does not visit the URL, capture the webpage, compare the screenshot with a live page, or contact a timestamping authority.",
  "This manifest is not notarization, authentication, proof of capture time or content, legal advice, or a guarantee of legal admissibility.",
  "Preserve the original screenshot separately. Re-saving, editing, or metadata changes can produce a different file digest.",
]);

function sliceCharacters(value, maximum) {
  return [...String(value ?? "")].slice(0, maximum).join("");
}

function normalizeSingleLine(value, maximum) {
  return sliceCharacters(
    String(value ?? "")
      .normalize("NFC")
      .replace(/[\u0000-\u001f\u007f]+/gu, " ")
      .replace(/\s+/gu, " ")
      .trim(),
    maximum,
  );
}

function normalizeNotes(value) {
  return sliceCharacters(
    String(value ?? "")
      .normalize("NFC")
      .replace(/\r\n?/gu, "\n")
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, "")
      .trim(),
    MAX_NOTES_CHARACTERS,
  );
}

function characterCount(value) {
  return [...String(value ?? "")].length;
}

function normalizeFilename(value) {
  const candidate = String(value ?? "").split(/[\\/]/u).at(-1);
  return (
    normalizeSingleLine(candidate, MAX_FILENAME_CHARACTERS) || "screenshot"
  );
}

export function normalizeSourceUrl(value) {
  if (characterCount(value) > MAX_URL_CHARACTERS) {
    return {
      ok: false,
      error: `Keep the source URL within ${MAX_URL_CHARACTERS.toLocaleString("en-US")} characters.`,
    };
  }
  const candidate = normalizeSingleLine(value, MAX_URL_CHARACTERS);
  if (!candidate) {
    return { ok: false, error: "Enter the source page URL." };
  }

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: "Enter a valid absolute HTTP or HTTPS URL." };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, error: "Only HTTP and HTTPS source URLs are supported." };
  }
  if (parsed.username || parsed.password) {
    return {
      ok: false,
      error: "Remove usernames or passwords from the source URL.",
    };
  }
  if (candidate.includes("#")) {
    return {
      ok: false,
      error:
        "Remove the URL fragment (#…). Fragments can contain tokens or private application state and are not accepted.",
    };
  }
  const hasSensitiveQueryKey = [...parsed.searchParams.keys()].some((key) => {
    const normalizedKey = key
      .normalize("NFKC")
      .toLocaleLowerCase("en-US")
      .replace(/[^a-z0-9]/gu, "");
    return SENSITIVE_QUERY_KEY_PATTERN.test(normalizedKey);
  });
  if (hasSensitiveQueryKey) {
    return {
      ok: false,
      error:
        "Remove sensitive query parameters such as tokens, passwords, authorization codes, session IDs, credentials, or signatures.",
    };
  }
  return { ok: true, value: parsed.href };
}

export function normalizeObservedAt(value) {
  const candidate = normalizeSingleLine(value, 64);
  const match = candidate.match(OBSERVED_AT_PATTERN);
  if (!match) {
    return {
      ok: false,
      error:
        "Enter an ISO 8601 date and time with seconds and a timezone, such as 2026-07-24T14:30:00+05:30.",
    };
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, fraction = "", zone] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const millisecond = Number(fraction.padEnd(3, "0") || "0");
  const maximumDay =
    year >= 1_000 && month >= 1 && month <= 12
      ? new Date(Date.UTC(year, month, 0)).getUTCDate()
      : 0;

  if (
    day < 1 ||
    day > maximumDay ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return { ok: false, error: "The observation date or time is not valid." };
  }

  let offsetMinutes = 0;
  if (zone !== "Z") {
    const sign = zone[0] === "+" ? 1 : -1;
    const zoneHour = Number(zone.slice(1, 3));
    const zoneMinute = Number(zone.slice(4, 6));
    if (
      zoneHour > 14 ||
      zoneMinute > 59 ||
      (zoneHour === 14 && zoneMinute !== 0)
    ) {
      return { ok: false, error: "The timezone offset is not valid." };
    }
    offsetMinutes = sign * (zoneHour * 60 + zoneMinute);
  }

  const instant = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond) -
      offsetMinutes * 60_000,
  );
  return {
    ok: true,
    declared: zone === "Z" ? `${candidate.slice(0, -1)}Z` : candidate,
    utc: instant.toISOString(),
  };
}

export function detectScreenshotMediaType(value) {
  const bytes =
    value instanceof Uint8Array
      ? value
      : value instanceof ArrayBuffer
        ? new Uint8Array(value)
        : null;
  if (!bytes) return null;
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function bytesToHex(value) {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function sha256Bytes(value, cryptoProvider = globalThis.crypto) {
  if (!cryptoProvider?.subtle) {
    throw new Error("Web Crypto SHA-256 is unavailable in this browser.");
  }
  const bytes =
    value instanceof ArrayBuffer
      ? new Uint8Array(value)
      : ArrayBuffer.isView(value)
        ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
        : null;
  if (!bytes) throw new TypeError("Hash input must be an ArrayBuffer or typed array.");
  const digest = await cryptoProvider.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

export async function sha256Text(value, cryptoProvider = globalThis.crypto) {
  return sha256Bytes(new TextEncoder().encode(String(value)), cryptoProvider);
}

export function canonicalJson(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("Canonical JSON does not support non-finite numbers.");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((key) => {
        if (value[key] === undefined) {
          throw new TypeError("Canonical JSON does not support undefined values.");
        }
        return `${JSON.stringify(key)}:${canonicalJson(value[key])}`;
      });
    return `{${entries.join(",")}}`;
  }
  throw new TypeError("Canonical JSON supports JSON-compatible values only.");
}

function sortedJsonValue(value) {
  if (Array.isArray(value)) return value.map(sortedJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sortedJsonValue(value[key])]),
    );
  }
  return value;
}

export function serializeCertificate(certificate) {
  return `${JSON.stringify(sortedJsonValue(certificate), null, 2)}\n`;
}

function normalizeScreenshot(value) {
  const mediaType = normalizeSingleLine(value?.mediaType, 100).toLowerCase();
  const sizeBytes = Number(value?.sizeBytes);
  const sha256 = normalizeSingleLine(value?.sha256, 128).toLowerCase();
  const errors = [];

  if (!MEDIA_TYPES[mediaType]) {
    errors.push("Choose a PNG, JPEG, or WebP screenshot.");
  }
  if (
    !Number.isSafeInteger(sizeBytes) ||
    sizeBytes <= 0 ||
    sizeBytes > MAX_FILE_BYTES
  ) {
    errors.push("The screenshot must be larger than 0 bytes and no more than 25 MB.");
  }
  if (!SHA256_PATTERN.test(sha256)) {
    errors.push("The screenshot needs a valid 64-character SHA-256 digest.");
  }
  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      filename: normalizeFilename(value?.filename),
      mediaType,
      mediaTypeLabel: MEDIA_TYPES[mediaType],
      sizeBytes,
      sha256,
    },
  };
}

export function prepareCertificatePayload(input = {}) {
  const title = normalizeSingleLine(input.title, MAX_TITLE_CHARACTERS);
  const notes = normalizeNotes(input.notes);
  const sourceUrl = normalizeSourceUrl(input.sourceUrl);
  const observedAt = normalizeObservedAt(input.observedAt);
  const screenshot = normalizeScreenshot(input.screenshot);
  const errors = [];

  if (!title) errors.push("Enter the page title shown in the screenshot.");
  if (!sourceUrl.ok) errors.push(sourceUrl.error);
  if (!observedAt.ok) errors.push(observedAt.error);
  if (!screenshot.ok) errors.push(...screenshot.errors);
  if (errors.length) return { ok: false, errors: [...new Set(errors)] };

  const populatedMetadataFields = [
    sourceUrl.value,
    title,
    observedAt.declared,
    notes,
    screenshot.value.filename,
    screenshot.value.mediaType,
    screenshot.value.sizeBytes,
    screenshot.value.sha256,
  ].filter((value) => value !== "").length;

  return {
    ok: true,
    payload: {
      annotations: {
        notes,
      },
      certificateProfile: "ALTFTool self-recorded web snapshot metadata v1",
      counts: {
        metadataFieldsPresent: populatedMetadataFields,
        noteCharacters: characterCount(notes),
        screenshotFiles: 1,
        screenshotFilesHashed: 1,
        sourceUrls: 1,
        titleCharacters: characterCount(title),
      },
      limitations: [...LIMITATIONS],
      processing: {
        acceptedFullUrlStoredInManifest: true,
        contentAnalyzed: false,
        localOnly: true,
        networkUsed: false,
        persisted: false,
        screenshotEmbedded: false,
        sourceUrlFetched: false,
      },
      schema: "altftool.web-evidence-snapshot-certificate.v1",
      screenshot: screenshot.value,
      source: {
        observedAtDeclared: observedAt.declared,
        observedAtUtc: observedAt.utc,
        pageTitle: title,
        url: sourceUrl.value,
      },
    },
  };
}

export async function buildSnapshotCertificate(
  input,
  digestText = (value) => sha256Text(value),
) {
  const prepared = prepareCertificatePayload(input);
  if (!prepared.ok) return prepared;

  const canonicalPayload = canonicalJson(prepared.payload);
  const payloadSha256 = String(await digestText(canonicalPayload)).toLowerCase();
  if (!SHA256_PATTERN.test(payloadSha256)) {
    throw new Error("The certificate payload digest was not a valid SHA-256 value.");
  }

  const certificate = {
    ...prepared.payload,
    integrity: {
      algorithm: "SHA-256",
      authority: "none",
      digestScope:
        "Canonical JSON of all certificate fields except the integrity object.",
      notarized: false,
      payloadSha256,
      signed: false,
      thirdPartyTimestamp: false,
    },
  };
  return {
    ok: true,
    canonicalPayload,
    certificate,
    serialized: serializeCertificate(certificate),
  };
}

export const snapshotCertificateLimits = Object.freeze({
  maxFileBytes: MAX_FILE_BYTES,
  maxFilenameCharacters: MAX_FILENAME_CHARACTERS,
  maxNotesCharacters: MAX_NOTES_CHARACTERS,
  maxTitleCharacters: MAX_TITLE_CHARACTERS,
  maxUrlCharacters: MAX_URL_CHARACTERS,
  supportedMediaTypes: Object.keys(MEDIA_TYPES),
});
