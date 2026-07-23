"use client";

export const STORAGE_KEY = "fileEncodingConversionStudioState";
export const HISTORY_KEY = "fileEncodingConversionStudioHistory";
export const HISTORY_LIMIT = 8;
export const PREVIEW_LIMIT = 9000;

export const SOURCE_ENCODINGS = [
  { label: "Auto Detect", value: "auto" },
  { label: "UTF-8", value: "utf-8" },
  { label: "UTF-8 BOM", value: "utf-8" },
  { label: "UTF-16 LE", value: "utf-16le" },
  { label: "UTF-16 BE", value: "utf-16be" },
  { label: "Chinese Simplified (GB18030)", value: "gb18030" },
  { label: "Chinese Traditional (Big5)", value: "big5" },
  { label: "Japanese (Shift_JIS)", value: "shift_jis" },
  { label: "Korean (EUC-KR)", value: "euc-kr" },
  { label: "ASCII", value: "ascii" },
  { label: "Windows ANSI", value: "windows-1252" },
  { label: "ISO-8859-1", value: "iso-8859-1" },
];

export const TARGET_ENCODINGS = [
  { label: "UTF-8", value: "utf-8" },
  { label: "UTF-8 with BOM", value: "utf-8-bom" },
  { label: "UTF-16 LE", value: "utf-16le" },
  { label: "UTF-16 BE", value: "utf-16be" },
  { label: "ASCII", value: "ascii" },
  { label: "Windows ANSI", value: "windows-1252" },
  { label: "ISO-8859-1", value: "iso-8859-1" },
];

const WINDOWS_1252_ENCODE = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

const WINDOWS_1252_DECODE = new Map(Array.from(WINDOWS_1252_ENCODE, ([code, byte]) => [byte, code]));

export function readFileAsBytes(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Unable to read file."));
    reader.readAsArrayBuffer(file);
  });
}

export function detectEncoding(bytes) {
  const bom = detectBom(bytes);
  if (bom) {
    return { encoding: bom.encoding, label: bom.label, confidence: 99, bom };
  }

  if (isAscii(bytes)) {
    return { encoding: "ascii", label: "ASCII", confidence: 96, bom: null };
  }

  const utf8 = scoreUtf8(bytes);
  if (utf8.valid && utf8.score > 0.68) {
    return { encoding: "utf-8", label: "UTF-8", confidence: Math.round(utf8.score * 100), bom: null };
  }

  const utf16 = scoreUtf16(bytes);
  if (utf16.confidence >= 70) {
    return { encoding: utf16.encoding, label: utf16.label, confidence: utf16.confidence, bom: null };
  }

  const latinText = scoreLatinText(bytes);
  if (latinText.confidence >= 62) return latinText;

  const legacyUnicode = detectLegacyUnicodeEncoding(bytes);
  if (legacyUnicode) return legacyUnicode;

  const latinScore = scoreSingleByteText(bytes);
  return {
    encoding: latinScore > 0.72 ? "windows-1252" : "iso-8859-1",
    label: latinScore > 0.72 ? "Windows ANSI" : "ISO-8859-1",
    confidence: Math.round(Math.max(54, latinScore * 100)),
    bom: null,
  };
}

export function decodeBytes(bytes, encoding) {
  const normalized = normalizeEncoding(encoding);
  if (normalized === "ascii") return decodeAscii(bytes);
  if (normalized === "windows-1252") return decodeWindows1252(bytes);
  return decodeWithStatus(bytes, normalized).text;
}

export function decodeWithStatus(bytes, encoding) {
  const normalized = normalizeEncoding(encoding);
  if (normalized === "ascii") {
    const text = decodeAscii(bytes);
    return {
      text,
      ok: !text.includes("\ufffd"),
      error: text.includes("\ufffd") ? "ASCII decoding found bytes outside the 7-bit ASCII range." : "",
    };
  }
  if (normalized === "windows-1252") {
    return { text: decodeWindows1252(bytes), ok: true, error: "" };
  }

  try {
    return { text: new TextDecoder(normalized, { fatal: true }).decode(bytes), ok: true, error: "" };
  } catch {
    return {
      text: new TextDecoder(normalized, { fatal: false }).decode(bytes),
      ok: false,
      error: `The input bytes are not valid ${encoding}. Choose the correct source encoding before converting.`,
    };
  }
}

export function encodeText(text, encoding) {
  const normalized = normalizeEncoding(encoding);
  if (encoding === "utf-8-bom") return concatBytes([new Uint8Array([0xef, 0xbb, 0xbf]), new TextEncoder().encode(text)]);
  if (normalized === "utf-8") return new TextEncoder().encode(text);
  if (normalized === "utf-16le") return encodeUtf16(text, true);
  if (normalized === "utf-16be") return encodeUtf16(text, false);
  if (normalized === "ascii") return encodeAscii(text);
  if (normalized === "windows-1252") return encodeWindows1252(text);
  if (normalized === "iso-8859-1") return encodeLatin1(text);
  return new TextEncoder().encode(text);
}

export function convertFileRecord(record, sourceEncoding, targetEncoding, repairMode = "none") {
  const detected = record.detected || detectEncoding(record.bytes);
  const resolvedSource = sourceEncoding === "auto" ? detected.encoding : sourceEncoding;
  const decoded = decodeWithStatus(record.bytes, resolvedSource);
  const originalText = decoded.text;
  const repairedText = repairMode === "mojibake" ? repairMojibake(originalText) : originalText;
  let targetSupport = validateTargetSupport(repairedText, targetEncoding);
  let outputBytes = new Uint8Array();
  if (targetSupport.ok) {
    try {
      outputBytes = encodeText(repairedText, targetEncoding);
    } catch (error) {
      targetSupport = {
        ok: false,
        message: error?.message || "Selected encoding cannot preserve this file. Please use UTF-8 or UTF-16.",
      };
    }
  }
  const convertedText = targetSupport.ok ? decodeBytes(outputBytes, targetEncoding) : repairedText;
  const validation = validateConversion(
    record.bytes,
    outputBytes,
    originalText,
    repairedText,
    convertedText,
    resolvedSource,
    targetEncoding,
    decoded,
    targetSupport
  );

  return {
    ...record,
    detected,
    sourceEncoding: resolvedSource,
    targetEncoding,
    originalText,
    convertedText,
    conversionInputText: repairedText,
    outputBytes,
    canDownload: decoded.ok && targetSupport.ok && Boolean(record.bytes.length),
    validation,
    stats: buildStats(record.bytes, outputBytes, originalText, convertedText),
    outputName: buildOutputName(record.name, targetEncoding),
  };
}

export function validateConversion(
  inputBytes,
  outputBytes,
  originalText,
  conversionInputText,
  outputText,
  sourceEncoding,
  targetEncoding,
  decoded = { ok: true, error: "" },
  targetSupport = { ok: true, message: "" }
) {
  const messages = [];
  if (!decoded.ok) {
    messages.push({ type: "error", text: decoded.error });
  }
  const replacementCount = countChar(originalText, "\ufffd");
  if (replacementCount) messages.push({ type: "warning", text: `${replacementCount} replacement character${replacementCount === 1 ? "" : "s"} found while decoding ${sourceEncoding}.` });
  if (!targetSupport.ok) {
    messages.push({ type: "error", text: targetSupport.message });
  }
  if (targetSupport.ok && outputText !== conversionInputText) {
    messages.push({ type: "warning", text: "Converted preview changed because the target encoding cannot preserve every character." });
  }
  if (!inputBytes.length) messages.push({ type: "error", text: "The selected file is empty." });
  if (!messages.length) messages.push({ type: "success", text: "Encoding conversion is valid and ready to download." });
  return messages;
}

export function repairMojibake(text) {
  try {
    if (Array.from(text).some((char) => char.codePointAt(0) > 0xff)) return text;
    const bytes = Uint8Array.from(Array.from(text), (char) => char.codePointAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return text;
  }
}

export function looksGarbled(text) {
  return /Ã.|Â.|â€|â€™|â€œ|â€|ï¿½|�/.test(text);
}

export function buildStats(inputBytes, outputBytes, inputText, outputText) {
  return {
    inputBytes: inputBytes.length,
    outputBytes: outputBytes.length,
    sizeDelta: outputBytes.length - inputBytes.length,
    inputChars: Array.from(inputText).length,
    outputChars: Array.from(outputText).length,
    inputLines: inputText ? inputText.split(/\r\n|\r|\n/).length : 0,
    outputLines: outputText ? outputText.split(/\r\n|\r|\n/).length : 0,
  };
}

export function buildOutputName(name, encoding) {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : ".txt";
  return `${base}_${encoding.replace(/[^a-z0-9]+/gi, "").toLowerCase()}${ext}`;
}

export function downloadBytes(filename, bytes, type = "text/plain;charset=utf-8") {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function safeReadJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed ?? fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "0 B";
  if (Math.abs(bytes) < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = Math.abs(bytes);
  let unit = "B";
  for (const nextUnit of units) {
    value /= 1024;
    unit = nextUnit;
    if (value < 1024) break;
  }
  return `${bytes < 0 ? "-" : ""}${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}

export function formatHexPreview(bytes, limit = 32) {
  if (!bytes?.length) return "";
  return Array.from(bytes.slice(0, limit), (byte) => byte.toString(16).padStart(2, "0").toUpperCase()).join(" ");
}

export function formatEncodedPreview(bytes, encoding, limit = PREVIEW_LIMIT) {
  if (!bytes?.length) return "";
  const hex = Array.from(bytes.slice(0, Math.min(bytes.length, limit)), (byte, index) => {
    const value = byte.toString(16).padStart(2, "0").toUpperCase();
    return (index + 1) % 16 === 0 ? `${value}\n` : value;
  }).join(" ");
  const trimmed = bytes.length > limit ? "\n\n...Encoded preview trimmed for performance." : "";
  return `${encoding.toUpperCase()} encoded bytes\n\n${hex}${trimmed}`;
}

export function previewText(text) {
  if (!text) return "";
  return text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT)}\n\n...Preview trimmed for performance.` : text;
}

function normalizeEncoding(encoding) {
  if (encoding === "utf-8-bom") return "utf-8";
  if (encoding === "ascii") return "ascii";
  if (encoding === "ansi") return "windows-1252";
  if (encoding === "gbk") return "gb18030";
  if (encoding === "shift-jis") return "shift_jis";
  if (encoding === "euckr") return "euc-kr";
  return encoding;
}

function detectBom(bytes) {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { encoding: "utf-8", label: "UTF-8 BOM", bytes: "EF BB BF" };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { encoding: "utf-16le", label: "UTF-16 LE BOM", bytes: "FF FE" };
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return { encoding: "utf-16be", label: "UTF-16 BE BOM", bytes: "FE FF" };
  }
  return null;
}

function isAscii(bytes) {
  return bytes.every((byte) => byte <= 0x7f);
}

function scoreUtf8(bytes) {
  let i = 0;
  let valid = 0;
  let invalid = 0;
  while (i < bytes.length) {
    const byte = bytes[i];
    if (byte <= 0x7f) {
      valid += 1;
      i += 1;
    } else if (byte >= 0xc2 && byte <= 0xdf && isContinuation(bytes[i + 1])) {
      valid += 2;
      i += 2;
    } else if (byte >= 0xe0 && byte <= 0xef && isContinuation(bytes[i + 1]) && isContinuation(bytes[i + 2])) {
      valid += 3;
      i += 3;
    } else if (byte >= 0xf0 && byte <= 0xf4 && isContinuation(bytes[i + 1]) && isContinuation(bytes[i + 2]) && isContinuation(bytes[i + 3])) {
      valid += 4;
      i += 4;
    } else {
      invalid += 1;
      i += 1;
    }
  }
  const total = Math.max(1, valid + invalid);
  return { valid: invalid === 0, score: valid / total };
}

function isContinuation(byte) {
  return byte >= 0x80 && byte <= 0xbf;
}

function scoreUtf16(bytes) {
  const sample = bytes.slice(0, Math.min(bytes.length, 4000));
  let evenNulls = 0;
  let oddNulls = 0;
  for (let i = 0; i < sample.length; i += 1) {
    if (sample[i] === 0) {
      if (i % 2 === 0) evenNulls += 1;
      else oddNulls += 1;
    }
  }
  const pairs = Math.max(1, Math.floor(sample.length / 2));
  if (oddNulls / pairs > 0.22) return { encoding: "utf-16le", label: "UTF-16 LE", confidence: Math.round((oddNulls / pairs) * 100) };
  if (evenNulls / pairs > 0.22) return { encoding: "utf-16be", label: "UTF-16 BE", confidence: Math.round((evenNulls / pairs) * 100) };
  return { encoding: "utf-8", label: "UTF-8", confidence: 0 };
}

function scoreSingleByteText(bytes) {
  if (!bytes.length) return 0;
  const printable = bytes.filter((byte) => byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126) || byte >= 160).length;
  return printable / bytes.length;
}

function scoreLatinText(bytes) {
  const sample = bytes.slice(0, Math.min(bytes.length, 8000));
  if (!sample.length) return { confidence: 0 };

  let asciiText = 0;
  let highBytes = 0;
  let controls = 0;
  for (const byte of sample) {
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)) asciiText += 1;
    else if (byte >= 0x80) highBytes += 1;
    else controls += 1;
  }

  const asciiRatio = asciiText / sample.length;
  const highRatio = highBytes / sample.length;
  if (controls / sample.length > 0.04) return { confidence: 0 };

  if (asciiRatio >= 0.55 && highRatio <= 0.35) {
    return {
      encoding: "windows-1252",
      label: "Windows ANSI",
      confidence: Math.round(Math.min(92, Math.max(62, asciiRatio * 100))),
      bom: null,
    };
  }

  return { confidence: 0 };
}

function detectLegacyUnicodeEncoding(bytes) {
  const candidates = [
    { encoding: "gb18030", label: "Chinese Simplified (GB18030)" },
    { encoding: "big5", label: "Chinese Traditional (Big5)" },
    { encoding: "shift_jis", label: "Japanese (Shift_JIS)" },
    { encoding: "euc-kr", label: "Korean (EUC-KR)" },
  ];
  const scored = candidates
    .map((candidate) => {
      try {
        const text = new TextDecoder(candidate.encoding, { fatal: true }).decode(bytes);
        return { ...candidate, score: scoreDecodedText(text, candidate.encoding) + scoreScriptBonus(text, candidate.encoding) };
      } catch {
        return { ...candidate, score: 0 };
      }
    })
    .sort((left, right) => right.score - left.score);

  const best = scored[0];
  if (!best || best.score < 0.58) return null;
  return {
    encoding: best.encoding,
    label: best.label,
    confidence: Math.min(94, Math.max(62, Math.round(best.score * 100))),
    bom: null,
  };
}

function scoreDecodedText(text, encoding) {
  const chars = Array.from(text);
  if (!chars.length || chars.includes("\ufffd")) return 0;
  let useful = 0;
  let suspicious = 0;
  for (const char of chars) {
    const code = char.codePointAt(0);
    if (char === "\t" || char === "\n" || char === "\r" || char === " ") {
      useful += 0.7;
    } else if (isExpectedForEncoding(code, encoding)) {
      useful += 1.2;
    } else if (isReadableUnicode(code)) {
      useful += 0.55;
      suspicious += 0.65;
    } else if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) {
      suspicious += 2;
    } else {
      suspicious += 0.75;
    }
  }
  return useful / Math.max(1, useful + suspicious);
}

function isExpectedForEncoding(code, encoding) {
  if ((code >= 0x21 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff)) return true;
  if (encoding === "shift_jis") return (code >= 0x3040 && code <= 0x30ff) || (code >= 0x3400 && code <= 0x9fff);
  if (encoding === "euc-kr") return code >= 0xac00 && code <= 0xd7af;
  if (encoding === "gb18030" || encoding === "big5") return code >= 0x3400 && code <= 0x9fff;
  return isReadableUnicode(code);
}

function scoreScriptBonus(text, encoding) {
  if (encoding === "shift_jis" && /[\u3040-\u30ff]/.test(text)) return 0.25;
  if (encoding === "euc-kr" && /[\uac00-\ud7af]/.test(text)) return 0.25;
  return 0;
}

function isReadableUnicode(code) {
  return (
    (code >= 0x21 && code <= 0x7e) ||
    (code >= 0xa0 && code <= 0x024f) ||
    (code >= 0x0900 && code <= 0x097f) ||
    (code >= 0x3040 && code <= 0x30ff) ||
    (code >= 0x3400 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af) ||
    (code >= 0x1f300 && code <= 0x1faff)
  );
}

function decodeAscii(bytes) {
  return Array.from(bytes, (byte) => String.fromCharCode(byte <= 0x7f ? byte : 0xfffd)).join("");
}

function decodeWindows1252(bytes) {
  return Array.from(bytes, (byte) => {
    if (byte <= 0x7f || byte >= 0xa0) return String.fromCharCode(byte);
    const mapped = WINDOWS_1252_DECODE.get(byte);
    return String.fromCodePoint(mapped ?? byte);
  }).join("");
}

function encodeUtf16(text, littleEndian) {
  const bytes = new Uint8Array(text.length * 2);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    const offset = i * 2;
    bytes[offset] = littleEndian ? code & 0xff : code >> 8;
    bytes[offset + 1] = littleEndian ? code >> 8 : code & 0xff;
  }
  return bytes;
}

function encodeAscii(text) {
  return Uint8Array.from(Array.from(text), (char) => {
    const code = char.codePointAt(0);
    if (code > 0x7f) throw new Error("ASCII cannot preserve Unicode characters. Please use UTF-8 or UTF-16.");
    return code;
  });
}

function validateTargetSupport(text, encoding) {
  const normalized = normalizeEncoding(encoding);
  if (normalized === "utf-8" || normalized === "utf-16le" || normalized === "utf-16be") {
    return { ok: true, message: "" };
  }
  if (normalized === "ascii" && /[^\x00-\x7F]/.test(text)) {
    return {
      ok: false,
      message: "Selected encoding does not support Unicode characters such as Chinese, Hindi, Japanese, Korean, or emoji. Please use UTF-8 or UTF-16.",
    };
  }
  if (normalized === "iso-8859-1" && /[^\x00-\xFF]/.test(text)) {
    return {
      ok: false,
      message: "ISO-8859-1 cannot preserve one or more characters in this file. Please use UTF-8 or UTF-16 to avoid data loss.",
    };
  }
  if (normalized === "windows-1252" && hasUnencodableWindows1252(text)) {
    return {
      ok: false,
      message: "Windows ANSI cannot preserve one or more characters in this file. Please use UTF-8 or UTF-16 to avoid data loss.",
    };
  }
  return { ok: true, message: "" };
}

function encodeLatin1(text) {
  return Uint8Array.from(Array.from(text), (char) => {
    const code = char.codePointAt(0);
    if (code > 0xff) throw new Error("ISO-8859-1 cannot preserve one or more characters. Please use UTF-8 or UTF-16.");
    return code;
  });
}

function encodeWindows1252(text) {
  return Uint8Array.from(Array.from(text), (char) => {
    const code = char.codePointAt(0);
    if (code <= 0x7f || (code >= 0xa0 && code <= 0xff)) return code;
    const encoded = WINDOWS_1252_ENCODE.get(code);
    if (encoded === undefined) throw new Error("Windows ANSI cannot preserve one or more characters. Please use UTF-8 or UTF-16.");
    return encoded;
  });
}

function hasUnencodableWindows1252(text) {
  return Array.from(text).some((char) => {
    const code = char.codePointAt(0);
    return !(code <= 0x7f || (code >= 0xa0 && code <= 0xff) || WINDOWS_1252_ENCODE.has(code));
  });
}

function concatBytes(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

function countChar(text, char) {
  return Array.from(text).filter((value) => value === char).length;
}
