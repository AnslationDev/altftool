/**
 * PDF password removal.
 *
 * A password-protected PDF carries an /Encrypt dictionary in its trailer. The
 * standard security handler defined in ISO 32000 derives a file encryption key
 * from the supplied password plus the /O, /U and /ID values, then uses RC4 or
 * AES to encrypt every string and stream in the document. "Unlocking" means
 * decrypting those objects with the correct key and writing the document back
 * out without the /Encrypt dictionary.
 *
 * The decryption itself is done by @pdfsmaller/pdf-decrypt, which implements
 * the standard handler for:
 *   V=1,2 / R=2,3  RC4 40-bit and 128-bit  (legacy)
 *   V=5   / R=6    AES-256                 (PDF 2.0)
 * Either the user password or the owner password is accepted, which is exactly
 * what the specification says the handler must do.
 *
 * This tool cannot and does not guess or crack passwords: without the correct
 * password the file encryption key cannot be derived at all.
 *
 * Pure module: no React, no DOM. The two async functions take and return bytes.
 */

/** Every PDF begins with the five bytes "%PDF-" (ISO 32000, 7.5.2). */
export const PDF_MAGIC = "%PDF-";

/** How many leading bytes to scan for the header. Some producers emit a few
 * junk bytes before it, and readers tolerate a short offset. */
export const HEADER_SCAN_BYTES = 1024;

/** Upper size limit, in bytes. Decryption walks every object in memory, so a
 * very large file would exhaust a browser tab. 100 MB is the practical ceiling. */
export const MAX_PDF_BYTES = 100 * 1024 * 1024;

/** Longest password the standard handler can use. Revisions 2-4 truncate at 32
 * bytes; revision 6 (AES-256) truncates at 127 bytes. 127 is the safe cap. */
export const MAX_PASSWORD_LENGTH = 127;

/** Human labels for the algorithms the decoder reports. */
export const ALGORITHM_LABELS = {
  "AES-256": "AES-256 (PDF 2.0, revision 6)",
  RC4: "RC4 (legacy standard security handler)",
};

const BYTE_UNITS = ["B", "KB", "MB", "GB"];

/**
 * Does this byte array look like a PDF?
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function isPdfBytes(bytes) {
  if (!bytes || typeof bytes.length !== "number" || bytes.length < PDF_MAGIC.length) {
    return false;
  }
  const limit = Math.min(bytes.length - PDF_MAGIC.length, HEADER_SCAN_BYTES);
  for (let offset = 0; offset <= limit; offset += 1) {
    let matched = true;
    for (let i = 0; i < PDF_MAGIC.length; i += 1) {
      if (bytes[offset + i] !== PDF_MAGIC.charCodeAt(i)) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

/**
 * Byte count as a short human string, e.g. 1536 -> "1.5 KB".
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const decimals = unit === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toFixed(decimals)} ${BYTE_UNITS[unit]}`;
}

/**
 * Output filename for the unlocked copy.
 * @param {string} originalName
 * @returns {string}
 */
export function unlockedFileName(originalName) {
  const name = typeof originalName === "string" && originalName.trim() ? originalName.trim() : "document.pdf";
  const withoutExtension = name.replace(/\.pdf$/i, "");
  return `${withoutExtension}-unlocked.pdf`;
}

/**
 * Validate a candidate file before any crypto work is attempted.
 * @param {Uint8Array} bytes
 * @returns {{ ok: true } | { error: string }}
 */
export function validatePdfBytes(bytes) {
  if (!bytes || typeof bytes.length !== "number" || bytes.length === 0) {
    return { error: "That file is empty. Choose a PDF file and try again." };
  }
  if (bytes.length > MAX_PDF_BYTES) {
    return {
      error: `That file is ${formatBytes(bytes.length)}. This tool handles PDFs up to ${formatBytes(MAX_PDF_BYTES)}.`,
    };
  }
  if (!isPdfBytes(bytes)) {
    return { error: "That does not look like a PDF — the %PDF- header is missing." };
  }
  return { ok: true };
}

/**
 * Report whether a PDF is encrypted, and with what.
 *
 * @param {Uint8Array} bytes
 * @returns {Promise<{ encrypted: boolean, algorithm: string|null, algorithmLabel: string,
 *                     version: number|null, revision: number|null, keyLength: number|null }
 *                   | { error: string }>}
 */
export async function inspectPdf(bytes) {
  const check = validatePdfBytes(bytes);
  if (check.error) return check;

  try {
    const { isEncrypted } = await import("@pdfsmaller/pdf-decrypt");
    const info = await isEncrypted(bytes);
    const algorithm = info.algorithm || null;
    return {
      encrypted: Boolean(info.encrypted),
      algorithm,
      algorithmLabel: algorithm ? ALGORITHM_LABELS[algorithm] || algorithm : "None",
      version: typeof info.version === "number" ? info.version : null,
      revision: typeof info.revision === "number" ? info.revision : null,
      keyLength: typeof info.keyLength === "number" ? info.keyLength : null,
    };
  } catch {
    return { error: "This PDF could not be read. It may be damaged or incomplete." };
  }
}

/**
 * Remove the password from a PDF.
 *
 * @param {Uint8Array} bytes    the encrypted PDF
 * @param {string} password     the user or owner password
 * @returns {Promise<{ bytes: Uint8Array, byteLength: number, algorithm: string|null,
 *                     algorithmLabel: string, pageCount: number|null } | { error: string }>}
 */
export async function unlockPdf(bytes, password) {
  const check = validatePdfBytes(bytes);
  if (check.error) return check;

  if (typeof password !== "string") {
    return { error: "Enter the password that opens this PDF." };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { error: `PDF passwords are at most ${MAX_PASSWORD_LENGTH} characters long.` };
  }

  const info = await inspectPdf(bytes);
  if (info.error) return info;
  if (!info.encrypted) {
    return { error: "This PDF has no password on it, so there is nothing to remove." };
  }

  let decrypted;
  try {
    const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
    decrypted = await decryptPDF(bytes, password);
  } catch (cause) {
    const message = String((cause && cause.message) || cause || "");
    if (/incorrect password/i.test(message)) {
      return { error: "That password did not open the file. Check it and try again." };
    }
    if (/unsupported encryption/i.test(message)) {
      return {
        error:
          "This PDF uses an encryption scheme this tool does not support. Only RC4 40/128-bit and AES-256 can be removed here.",
      };
    }
    if (/not encrypted/i.test(message)) {
      return { error: "This PDF has no password on it, so there is nothing to remove." };
    }
    return { error: "The file could not be decrypted. It may be damaged or incomplete." };
  }

  if (!decrypted || decrypted.length === 0) {
    return { error: "Decryption produced an empty file. The PDF may be damaged." };
  }

  let pageCount = null;
  try {
    const { PDFDocument } = await import("pdf-lib");
    const document = await PDFDocument.load(decrypted, { ignoreEncryption: false });
    pageCount = document.getPageCount();
  } catch {
    // The bytes decrypted but pdf-lib could not re-parse them. The download is
    // still offered; the page count is simply unknown.
    pageCount = null;
  }

  return {
    bytes: decrypted,
    byteLength: decrypted.length,
    algorithm: info.algorithm,
    algorithmLabel: info.algorithmLabel,
    pageCount,
  };
}
