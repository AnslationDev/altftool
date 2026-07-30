/**
 * Animated QR File Beam — pure logic.
 *
 * Splits a small file into a sequence of QR-sized frames so it can be carried
 * across an air gap by pointing one screen at another camera, then reassembles
 * the file from the frames a receiver scanned back.
 *
 * Everything here is deterministic: same bytes in, same frames out. No network,
 * no DOM, no clocks, no randomness.
 *
 * Frame grammar (plain ASCII so every QR scanner returns it intact):
 *   header : QFB1|<fileId>|H|<totalFrames>|<sizeBytes>|<crc32>|<chunkBytes>|<b64Name>
 *   data   : QFB1|<fileId>|<seq>|<totalFrames>|<b64Chunk>
 * `seq` runs 1..totalFrames. `fileId` is CRC-32 of the name bytes followed by
 * the file bytes, so it is stable for a given file and different for another.
 */

export const PROTOCOL_ID = "QFB1";
export const EC_LEVELS = ["L", "M", "Q", "H"];

export const EC_LEVEL_LABELS = {
  L: "L — recovers ~7% damage, most data per frame",
  M: "M — recovers ~15% damage, balanced",
  Q: "Q — recovers ~25% damage, tolerant of glare",
  H: "H — recovers ~30% damage, fewest bytes per frame",
};

/**
 * Byte-mode data capacity in bytes for QR versions 1..40, per ISO/IEC 18004.
 * Index 0 is version 1.
 */
export const QR_BYTE_CAPACITY = {
  L: [
    17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858,
    929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431,
    2563, 2699, 2809, 2953,
  ],
  M: [
    14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666,
    711, 779, 857, 911, 997, 1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989,
    2099, 2213, 2331,
  ],
  Q: [
    11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482,
    509, 565, 611, 661, 715, 751, 805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423,
    1499, 1579, 1663,
  ],
  H: [
    7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403,
    439, 461, 511, 535, 593, 625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219,
    1273,
  ],
};

/** Largest file this tool will beam. Above it the frame count stops being usable. */
export const MAX_BEAM_BYTES = 262144;
/** Reserved bytes for the fixed part of a data frame header. */
const DATA_FRAME_OVERHEAD = 22;
export const MIN_FPS = 1;
export const MAX_FPS = 20;

/* ------------------------------------------------------------------ bytes */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

/** CRC-32 (IEEE 802.3, reflected polynomial 0xEDB88320) over a byte array. */
export function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

/** CRC-32 as a lowercase 8-character hex string. */
export function crc32Hex(bytes) {
  return crc32(bytes).toString(16).padStart(8, "0");
}

const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const B64_LOOKUP = (() => {
  const map = new Map();
  for (let i = 0; i < B64_ALPHABET.length; i += 1) map.set(B64_ALPHABET[i], i);
  return map;
})();

/** Standard padded Base64 of a byte array. */
export function bytesToBase64(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    out += B64_ALPHABET[b0 >> 2];
    out += B64_ALPHABET[((b0 & 0x03) << 4) | ((b1 === undefined ? 0 : b1) >> 4)];
    out += b1 === undefined ? "=" : B64_ALPHABET[((b1 & 0x0f) << 2) | ((b2 === undefined ? 0 : b2) >> 6)];
    out += b2 === undefined ? "=" : B64_ALPHABET[b2 & 0x3f];
  }
  return out;
}

/** Decode padded Base64. Returns null when the string is not valid Base64. */
export function base64ToBytes(text) {
  const clean = String(text ?? "").trim();
  if (clean.length === 0) return new Uint8Array(0);
  if (clean.length % 4 !== 0) return null;
  let padding = 0;
  if (clean.endsWith("==")) padding = 2;
  else if (clean.endsWith("=")) padding = 1;
  const out = new Uint8Array((clean.length / 4) * 3 - padding);
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = [0, 1, 2, 3].map((k) => {
      const ch = clean[i + k];
      if (ch === "=") return 0;
      const v = B64_LOOKUP.get(ch);
      return v === undefined ? -1 : v;
    });
    if (chunk.some((v) => v < 0)) return null;
    const triple = (chunk[0] << 18) | (chunk[1] << 12) | (chunk[2] << 6) | chunk[3];
    if (o < out.length) out[o++] = (triple >> 16) & 0xff;
    if (o < out.length) out[o++] = (triple >> 8) & 0xff;
    if (o < out.length) out[o++] = triple & 0xff;
  }
  return out;
}

/** UTF-8 encode a string to bytes without relying on TextEncoder. */
export function utf8Encode(text) {
  const str = String(text ?? "");
  const out = [];
  for (let i = 0; i < str.length; i += 1) {
    let code = str.codePointAt(i);
    if (code > 0xffff) i += 1;
    if (code < 0x80) out.push(code);
    else if (code < 0x800) {
      out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    } else {
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return Uint8Array.from(out);
}

/** UTF-8 decode bytes to a string without relying on TextDecoder. */
export function utf8Decode(bytes) {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) {
      out += String.fromCodePoint(b);
      i += 1;
    } else if (b >= 0xc0 && b < 0xe0 && i + 1 < bytes.length) {
      out += String.fromCodePoint(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if (b >= 0xe0 && b < 0xf0 && i + 2 < bytes.length) {
      out += String.fromCodePoint(
        ((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else if (b >= 0xf0 && i + 3 < bytes.length) {
      out += String.fromCodePoint(
        ((b & 0x07) << 18) |
          ((bytes[i + 1] & 0x3f) << 12) |
          ((bytes[i + 2] & 0x3f) << 6) |
          (bytes[i + 3] & 0x3f),
      );
      i += 4;
    } else {
      out += "�";
      i += 1;
    }
  }
  return out;
}

/* --------------------------------------------------------------- capacity */

/** Base64 length produced by `byteLength` raw bytes. */
export function base64Length(byteLength) {
  return 4 * Math.ceil(byteLength / 3);
}

/** Raw bytes whose Base64 form still fits inside `budget` characters. */
export function bytesForBase64Budget(budget) {
  if (!Number.isFinite(budget) || budget < 4) return 0;
  return 3 * Math.floor(budget / 4);
}

/** Byte-mode capacity of one QR symbol, or 0 for an unknown version/level. */
export function capacityFor(version, ecLevel) {
  const table = QR_BYTE_CAPACITY[ecLevel];
  if (!table) return 0;
  if (!Number.isInteger(version) || version < 1 || version > 40) return 0;
  return table[version - 1];
}

/** Modules along one edge of a QR symbol of this version (21 for v1, 177 for v40). */
export function moduleCount(version) {
  if (!Number.isInteger(version) || version < 1 || version > 40) return 0;
  return 17 + 4 * version;
}

/** Smallest QR version whose byte-mode capacity holds `payloadBytes`. */
export function pickQrVersion(payloadBytes, ecLevel) {
  const table = QR_BYTE_CAPACITY[ecLevel];
  if (!table) return null;
  for (let v = 1; v <= 40; v += 1) {
    if (table[v - 1] >= payloadBytes) return v;
  }
  return null;
}

/**
 * How many raw file bytes fit in one data frame at a given version and level,
 * and how many frames a file of `byteLength` would need.
 */
export function planBeam({ byteLength, fileName = "file.bin", ecLevel = "M", version = 12 } = {}) {
  if (!EC_LEVELS.includes(ecLevel)) {
    return { error: `Unknown error-correction level "${ecLevel}". Use L, M, Q or H.` };
  }
  const capacity = capacityFor(version, ecLevel);
  if (capacity === 0) {
    return { error: "QR version must be a whole number between 1 and 40." };
  }
  if (!Number.isInteger(byteLength) || byteLength < 0) {
    return { error: "File size must be a whole number of bytes." };
  }
  if (byteLength === 0) {
    return { error: "The file is empty, so there is nothing to beam." };
  }
  if (byteLength > MAX_BEAM_BYTES) {
    return {
      error: `This file is ${formatBytes(byteLength)}. QR beaming is only practical up to ${formatBytes(
        MAX_BEAM_BYTES,
      )} — anything larger needs thousands of frames.`,
    };
  }

  const chunkBytes = bytesForBase64Budget(capacity - DATA_FRAME_OVERHEAD);
  if (chunkBytes <= 0) {
    return {
      error: `A version-${version} ${ecLevel} symbol holds only ${capacity} bytes, which is not enough for the ${DATA_FRAME_OVERHEAD}-byte frame header. Raise the QR version or lower the error-correction level.`,
    };
  }

  const dataFrames = Math.ceil(byteLength / chunkBytes);
  const nameBase64Length = base64Length(utf8Encode(fileName).length);
  const headerLength = PROTOCOL_ID.length + 1 + 8 + 3 + String(dataFrames).length * 2 + 20 + nameBase64Length;
  if (headerLength > capacity) {
    return {
      error: `The file name is too long for a version-${version} ${ecLevel} header frame. Shorten the name or raise the QR version.`,
    };
  }

  return {
    capacity,
    chunkBytes,
    dataFrames,
    totalFrames: dataFrames + 1,
    headerLength,
    payloadEfficiency: chunkBytes / capacity,
  };
}

/* ------------------------------------------------------------------ build */

function sanitiseFileName(name) {
  const raw = String(name ?? "").trim();
  const base = raw.length === 0 ? "file.bin" : raw;
  return base.replace(/[\\/]/g, "_").slice(0, 120);
}

/**
 * Build the full frame sequence for a file.
 * `bytes` is a Uint8Array (or any array-like of 0..255 numbers).
 */
export function buildBeam({ bytes, fileName = "file.bin", ecLevel = "M", version = 12, fps = 5 } = {}) {
  if (!bytes || typeof bytes.length !== "number") {
    return { error: "No file data was supplied." };
  }
  const data = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
  const name = sanitiseFileName(fileName);

  const plan = planBeam({ byteLength: data.length, fileName: name, ecLevel, version });
  if (plan.error) return { error: plan.error };

  const rate = Number(fps);
  if (!Number.isFinite(rate) || rate < MIN_FPS || rate > MAX_FPS) {
    return { error: `Frame rate must be between ${MIN_FPS} and ${MAX_FPS} frames per second.` };
  }

  const nameBytes = utf8Encode(name);
  const idSource = new Uint8Array(nameBytes.length + data.length);
  idSource.set(nameBytes, 0);
  idSource.set(data, nameBytes.length);
  const fileId = crc32Hex(idSource);
  const checksum = crc32Hex(data);

  const total = plan.dataFrames;
  const header = [
    PROTOCOL_ID,
    fileId,
    "H",
    String(total),
    String(data.length),
    checksum,
    String(plan.chunkBytes),
    bytesToBase64(nameBytes),
  ].join("|");

  const frames = [
    {
      seq: 0,
      kind: "header",
      payload: header,
      byteLength: header.length,
      version: pickQrVersion(header.length, ecLevel),
      label: "Header",
    },
  ];

  for (let i = 0; i < total; i += 1) {
    const start = i * plan.chunkBytes;
    const chunk = data.subarray(start, Math.min(start + plan.chunkBytes, data.length));
    const payload = [PROTOCOL_ID, fileId, String(i + 1), String(total), bytesToBase64(chunk)].join("|");
    frames.push({
      seq: i + 1,
      kind: "data",
      payload,
      byteLength: payload.length,
      version: pickQrVersion(payload.length, ecLevel),
      label: `Frame ${i + 1} of ${total}`,
    });
  }

  const widest = frames.reduce((max, frame) => Math.max(max, frame.byteLength), 0);
  const renderVersion = Math.max(version, pickQrVersion(widest, ecLevel) ?? version);

  return {
    fileId,
    fileName: name,
    size: data.length,
    checksum,
    ecLevel,
    requestedVersion: version,
    renderVersion,
    renderModules: moduleCount(renderVersion),
    capacity: plan.capacity,
    chunkBytes: plan.chunkBytes,
    dataFrames: total,
    totalFrames: frames.length,
    payloadEfficiency: plan.payloadEfficiency,
    fps: rate,
    frames,
  };
}

/**
 * Playback order for the beam: the header is repeated every `headerEvery` data
 * frames so a receiver that joins late still learns the file name and length.
 */
export function buildPlaybackOrder(beam, { headerEvery = 12 } = {}) {
  if (!beam || beam.error || !Array.isArray(beam.frames)) return [];
  const every = Number.isInteger(headerEvery) && headerEvery > 0 ? headerEvery : 12;
  const order = [];
  const dataFrames = beam.frames.filter((frame) => frame.kind === "data");
  const headerFrame = beam.frames.find((frame) => frame.kind === "header");
  dataFrames.forEach((frame, index) => {
    if (index % every === 0 && headerFrame) order.push(headerFrame);
    order.push(frame);
  });
  if (order.length === 0 && headerFrame) order.push(headerFrame);
  return order;
}

/** Loop length and effective throughput for a playback order. */
export function beamTiming({ playbackLength, fps, size }) {
  const frames = Number(playbackLength);
  const rate = Number(fps);
  if (!Number.isFinite(frames) || frames <= 0) return { error: "There are no frames to play." };
  if (!Number.isFinite(rate) || rate <= 0) return { error: "Frame rate must be above zero." };
  const cycleSeconds = frames / rate;
  const bytes = Number(size);
  return {
    cycleSeconds,
    framesPerCycle: frames,
    bytesPerSecond: Number.isFinite(bytes) && cycleSeconds > 0 ? bytes / cycleSeconds : null,
  };
}

/* ---------------------------------------------------------------- receive */

/** Parse one scanned frame string. */
export function parseFrame(payload) {
  const text = String(payload ?? "").trim();
  if (text.length === 0) return { error: "Empty frame." };
  const parts = text.split("|");
  if (parts[0] !== PROTOCOL_ID) {
    return { error: `Not a ${PROTOCOL_ID} frame — this QR contains something else.` };
  }
  if (parts.length < 5) return { error: "Frame is truncated." };
  const fileId = parts[1];
  if (!/^[0-9a-f]{8}$/.test(fileId)) return { error: "Frame has a malformed file id." };

  if (parts[2] === "H") {
    if (parts.length !== 8) return { error: "Header frame has the wrong number of fields." };
    const total = Number(parts[3]);
    const size = Number(parts[4]);
    const checksum = parts[5];
    const chunkBytes = Number(parts[6]);
    const nameBytes = base64ToBytes(parts[7]);
    if (!Number.isInteger(total) || total <= 0) return { error: "Header frame has a bad frame count." };
    if (!Number.isInteger(size) || size < 0) return { error: "Header frame has a bad file size." };
    if (!/^[0-9a-f]{8}$/.test(checksum)) return { error: "Header frame has a bad checksum field." };
    if (!Number.isInteger(chunkBytes) || chunkBytes <= 0) {
      return { error: "Header frame has a bad chunk size." };
    }
    if (nameBytes === null) return { error: "Header frame has a bad file name field." };
    return {
      kind: "header",
      fileId,
      totalFrames: total,
      size,
      checksum,
      chunkBytes,
      fileName: utf8Decode(nameBytes),
    };
  }

  const seq = Number(parts[2]);
  const total = Number(parts[3]);
  if (!Number.isInteger(seq) || seq <= 0) return { error: "Frame has a bad sequence number." };
  if (!Number.isInteger(total) || total <= 0) return { error: "Frame has a bad frame count." };
  if (seq > total) return { error: `Frame ${seq} claims to be past the last frame (${total}).` };
  const chunk = base64ToBytes(parts.slice(4).join("|"));
  if (chunk === null) return { error: `Frame ${seq} carries data that is not valid Base64.` };
  return { kind: "data", fileId, seq, totalFrames: total, bytes: chunk };
}

/**
 * Rebuild a file from whatever frames have been scanned so far.
 * Returns progress even when frames are still missing.
 */
export function reassemble(payloads) {
  const list = Array.isArray(payloads) ? payloads : [];
  if (list.length === 0) return { error: "No frames scanned yet." };

  const rejected = [];
  const chunks = new Map();
  let header = null;
  let fileId = null;
  let totalFrames = null;

  for (const raw of list) {
    const frame = parseFrame(raw);
    if (frame.error) {
      rejected.push(frame.error);
      continue;
    }
    if (fileId === null) fileId = frame.fileId;
    else if (frame.fileId !== fileId) {
      return { error: "These frames come from more than one file. Clear the list and scan one beam." };
    }
    if (frame.kind === "header") {
      header = frame;
      totalFrames = frame.totalFrames;
    } else {
      if (totalFrames === null) totalFrames = frame.totalFrames;
      chunks.set(frame.seq, frame.bytes);
    }
  }

  if (fileId === null) {
    return { error: `None of the scanned frames are ${PROTOCOL_ID} frames.` };
  }
  if (totalFrames === null) {
    return { error: "No usable frame header found yet." };
  }

  const missing = [];
  for (let seq = 1; seq <= totalFrames; seq += 1) {
    if (!chunks.has(seq)) missing.push(seq);
  }

  const base = {
    fileId,
    totalFrames,
    received: chunks.size,
    missing,
    rejected,
    hasHeader: Boolean(header),
    fileName: header ? header.fileName : null,
    expectedSize: header ? header.size : null,
    expectedChecksum: header ? header.checksum : null,
    complete: false,
    bytes: null,
    checksumOk: null,
    actualChecksum: null,
  };

  if (missing.length > 0) return base;
  if (!header) {
    return {
      ...base,
      note: "Every data frame is in, but the header frame with the file name and checksum is still missing.",
    };
  }

  let length = 0;
  for (let seq = 1; seq <= totalFrames; seq += 1) length += chunks.get(seq).length;
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (let seq = 1; seq <= totalFrames; seq += 1) {
    const part = chunks.get(seq);
    bytes.set(part, offset);
    offset += part.length;
  }

  const trimmed = header.size <= bytes.length ? bytes.subarray(0, header.size) : bytes;
  const actualChecksum = crc32Hex(trimmed);

  return {
    ...base,
    complete: true,
    bytes: trimmed,
    size: trimmed.length,
    actualChecksum,
    checksumOk: actualChecksum === header.checksum && trimmed.length === header.size,
  };
}

/* --------------------------------------------------------------- helpers */

/** Human byte size using binary units. */
export function formatBytes(byteLength) {
  const n = Number(byteLength);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KiB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MiB`;
}

/** Seconds as m:ss when long enough to matter. */
export function formatSeconds(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "—";
  if (s < 60) return `${s.toFixed(1)} s`;
  const mins = Math.floor(s / 60);
  const rest = Math.round(s - mins * 60);
  return `${mins} min ${String(rest).padStart(2, "0")} s`;
}

/** Frames and loop time a file would need at each error-correction level. */
export function capacityComparison({ byteLength, version, fps }) {
  return EC_LEVELS.map((level) => {
    const plan = planBeam({ byteLength, ecLevel: level, version });
    if (plan.error) {
      return { ecLevel: level, capacity: capacityFor(version, level), error: plan.error };
    }
    const timing = beamTiming({ playbackLength: plan.totalFrames, fps, size: byteLength });
    return {
      ecLevel: level,
      capacity: plan.capacity,
      chunkBytes: plan.chunkBytes,
      dataFrames: plan.dataFrames,
      cycleSeconds: timing.error ? null : timing.cycleSeconds,
    };
  });
}
