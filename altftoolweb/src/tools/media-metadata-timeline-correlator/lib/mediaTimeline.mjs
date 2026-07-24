const MAX_EMBEDDED_EVENTS = 80;
const QUICKTIME_TO_UNIX_SECONDS = 2_082_844_800;
const MAX_INPUT_FILES = 20;
const MAX_INPUT_FILE_BYTES = 64 * 1024 * 1024;
const MAX_INPUT_BATCH_BYTES = 128 * 1024 * 1024;
const ACCEPTED_INPUT_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "mp4",
  "mov",
  "m4v",
  "wav",
]);
const MP4_CONTAINERS = new Set([
  "moov",
  "trak",
  "mdia",
  "minf",
  "stbl",
  "edts",
  "udta",
]);

function inputExtension(name) {
  return (
    String(name || "")
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
}

export function selectMediaInputBatch(existingRecords = [], fileList = []) {
  const selected = Array.from(fileList || []);
  if (!selected.length) return { ok: false, error: "Choose at least one media file." };

  const remaining = MAX_INPUT_FILES - existingRecords.length;
  if (remaining <= 0) {
    return {
      ok: false,
      error: `A maximum of ${MAX_INPUT_FILES} files can be compared at once.`,
    };
  }
  const candidates = selected.slice(0, remaining);
  if (
    candidates.some(
      (file) => !ACCEPTED_INPUT_EXTENSIONS.has(inputExtension(file?.name)),
    )
  ) {
    return {
      ok: false,
      error: "Use JPEG, PNG, WebP, MP4/MOV/M4V, or WAV files.",
    };
  }
  if (
    candidates.some(
      (file) =>
        !Number.isSafeInteger(Number(file?.size)) ||
        Number(file.size) < 0 ||
        Number(file.size) > MAX_INPUT_FILE_BYTES,
    )
  ) {
    return {
      ok: false,
      error: "Each media file must be 64 MB or smaller.",
    };
  }

  const existingBytes = existingRecords.reduce(
    (total, record) => total + Math.max(0, Number(record?.size) || 0),
    0,
  );
  const incomingBytes = candidates.reduce(
    (total, file) => total + Number(file.size),
    0,
  );
  if (existingBytes + incomingBytes > MAX_INPUT_BATCH_BYTES) {
    return {
      ok: false,
      error: "Keep the combined local batch at or below 128 MB.",
    };
  }

  return {
    ok: true,
    candidates,
    ignoredFileCount: selected.length - candidates.length,
    reservedBytes: incomingBytes,
    totalBytesAfterReservation: existingBytes + incomingBytes,
  };
}

export const mediaTimelineInputLimits = Object.freeze({
  maxBatchBytes: MAX_INPUT_BATCH_BYTES,
  maxFileBytes: MAX_INPUT_FILE_BYTES,
  maxFiles: MAX_INPUT_FILES,
});

function hasBytes(view, offset, length) {
  return (
    Number.isInteger(offset) &&
    Number.isInteger(length) &&
    offset >= 0 &&
    length >= 0 &&
    offset + length <= view.byteLength
  );
}

function readAscii(view, offset, length) {
  if (!hasBytes(view, offset, length)) return "";
  let result = "";
  for (let index = 0; index < length; index += 1) {
    const value = view.getUint8(offset + index);
    if (!value) break;
    result += String.fromCharCode(value);
  }
  return result.trim();
}

function validWallClock(parts) {
  const [year, month, day, hour, minute, second] = parts;
  if (
    year < 1601 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 60
  ) {
    return false;
  }
  const date = new Date(
    Date.UTC(year, month - 1, day, hour, minute, Math.min(second, 59)),
  );
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute
  );
}

function offsetMinutes(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase();
  if (normalized === "Z") return 0;
  const match = normalized.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  if (hours > 23 || minutes > 59) return null;
  const total = hours * 60 + minutes;
  return match[1] === "-" ? -total : total;
}

export function normalizeTimestamp(rawInput, fallbackOffsetInput = "") {
  const raw = String(rawInput || "").trim();
  if (!raw) return { status: "invalid", raw, reason: "empty" };

  const explicitlyZoned = raw.match(/(Z|[+-]\d{2}:?\d{2})$/i);
  const wallMatch = raw.match(
    /^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?/,
  );
  if (!wallMatch) {
    return { status: "invalid", raw, reason: "unsupported-format" };
  }
  const parts = wallMatch.slice(1, 7).map(Number);
  if (!validWallClock(parts)) {
    return { status: "invalid", raw, reason: "invalid-calendar-value" };
  }

  const chosenOffset =
    explicitlyZoned?.[1] || String(fallbackOffsetInput || "").trim();
  if (!chosenOffset) {
    return {
      status: "unresolved",
      raw,
      reason: "timezone-missing",
      wallClock: `${String(parts[0]).padStart(4, "0")}-${String(
        parts[1],
      ).padStart(2, "0")}-${String(parts[2]).padStart(2, "0")} ${String(
        parts[3],
      ).padStart(
        2,
        "0",
      )}:${String(parts[4]).padStart(2, "0")}:${String(parts[5]).padStart(2, "0")}`,
    };
  }

  const minutes = offsetMinutes(chosenOffset);
  if (minutes === null) {
    return { status: "invalid", raw, reason: "invalid-timezone-offset" };
  }
  const epochMs =
    Date.UTC(
      parts[0],
      parts[1] - 1,
      parts[2],
      parts[3],
      parts[4],
      Math.min(parts[5], 59),
    ) -
    minutes * 60_000;
  return {
    status: "zoned",
    raw,
    epochMs,
    iso: new Date(epochMs).toISOString(),
    offset: chosenOffset.toUpperCase(),
    usedFallbackOffset: !explicitlyZoned,
  };
}

function tiffAsciiValue(view, tiffOffset, entryOffset, littleEndian) {
  if (!hasBytes(view, entryOffset, 12)) return "";
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  if ((type !== 2 && type !== 7) || !count || count > 512) return "";
  const valueOffset =
    count <= 4
      ? entryOffset + 8
      : tiffOffset + view.getUint32(entryOffset + 8, littleEndian);
  return readAscii(view, valueOffset, count);
}

function tiffLongValue(view, tiffOffset, entryOffset, littleEndian) {
  if (!hasBytes(view, entryOffset, 12)) return null;
  const type = view.getUint16(entryOffset + 2, littleEndian);
  const count = view.getUint32(entryOffset + 4, littleEndian);
  if (type !== 4 || count !== 1) return null;
  return view.getUint32(entryOffset + 8, littleEndian);
}

function parseTiffTimestamps(view, tiffOffset) {
  if (!hasBytes(view, tiffOffset, 8)) return [];
  const byteOrder = readAscii(view, tiffOffset, 2);
  const littleEndian = byteOrder === "II";
  if (!littleEndian && byteOrder !== "MM") return [];
  if (view.getUint16(tiffOffset + 2, littleEndian) !== 42) return [];

  const fields = new Map();
  const visited = new Set();
  const parseIfd = (relativeOffset, depth = 0) => {
    if (
      depth > 4 ||
      !Number.isInteger(relativeOffset) ||
      visited.has(relativeOffset)
    ) {
      return;
    }
    visited.add(relativeOffset);
    const directoryOffset = tiffOffset + relativeOffset;
    if (!hasBytes(view, directoryOffset, 2)) return;
    const entryCount = Math.min(
      view.getUint16(directoryOffset, littleEndian),
      256,
    );
    for (let index = 0; index < entryCount; index += 1) {
      const entryOffset = directoryOffset + 2 + index * 12;
      if (!hasBytes(view, entryOffset, 12)) break;
      const tag = view.getUint16(entryOffset, littleEndian);
      if ([0x0132, 0x9003, 0x9004, 0x9010, 0x9011, 0x9012].includes(tag)) {
        const value = tiffAsciiValue(
          view,
          tiffOffset,
          entryOffset,
          littleEndian,
        );
        if (value && !fields.has(tag)) fields.set(tag, value);
      }
      if ([0x8769, 0x8825].includes(tag)) {
        const nested = tiffLongValue(
          view,
          tiffOffset,
          entryOffset,
          littleEndian,
        );
        if (nested !== null) parseIfd(nested, depth + 1);
      }
    }
  };
  parseIfd(view.getUint32(tiffOffset + 4, littleEndian));

  return [
    {
      tag: 0x9003,
      offsetTag: 0x9011,
      kind: "exif-original",
      label: "EXIF DateTimeOriginal",
    },
    {
      tag: 0x9004,
      offsetTag: 0x9012,
      kind: "exif-digitized",
      label: "EXIF DateTimeDigitized",
    },
    {
      tag: 0x0132,
      offsetTag: 0x9010,
      kind: "exif-modified",
      label: "EXIF DateTime",
    },
  ]
    .filter((definition) => fields.has(definition.tag))
    .map((definition) => ({
      kind: definition.kind,
      label: definition.label,
      timestamp: fields.get(definition.tag),
      offset: fields.get(definition.offsetTag) || "",
      timezoneBasis: fields.has(definition.offsetTag)
        ? "embedded-offset"
        : "unknown",
    }));
}

function parseJpeg(view) {
  const events = [];
  let offset = 2;
  while (hasBytes(view, offset, 4) && events.length < MAX_EMBEDDED_EVENTS) {
    if (view.getUint8(offset) !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = view.getUint8(offset + 1);
    if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x00 || marker === 0xff) {
      offset += 1;
      continue;
    }
    const segmentLength = view.getUint16(offset + 2, false);
    if (segmentLength < 2 || !hasBytes(view, offset + 2, segmentLength)) break;
    const payloadOffset = offset + 4;
    if (
      marker === 0xe1 &&
      readAscii(view, payloadOffset, 4) === "Exif" &&
      hasBytes(view, payloadOffset, 6)
    ) {
      events.push(...parseTiffTimestamps(view, payloadOffset + 6));
    }
    offset += segmentLength + 2;
  }
  return events.slice(0, MAX_EMBEDDED_EVENTS);
}

function parsePng(view) {
  const events = [];
  let offset = 8;
  while (hasBytes(view, offset, 12) && events.length < MAX_EMBEDDED_EVENTS) {
    const length = view.getUint32(offset, false);
    const type = readAscii(view, offset + 4, 4);
    const dataOffset = offset + 8;
    if (!hasBytes(view, dataOffset, length + 4)) break;
    if (type === "eXIf") {
      events.push(...parseTiffTimestamps(view, dataOffset));
    } else if (type === "tIME" && length === 7) {
      const year = view.getUint16(dataOffset, false);
      const values = [
        year,
        view.getUint8(dataOffset + 2),
        view.getUint8(dataOffset + 3),
        view.getUint8(dataOffset + 4),
        view.getUint8(dataOffset + 5),
        view.getUint8(dataOffset + 6),
      ];
      if (validWallClock(values)) {
        events.push({
          kind: "png-modified",
          label: "PNG tIME (last modification)",
          timestamp: `${String(year).padStart(4, "0")}-${String(
            values[1],
          ).padStart(2, "0")}-${String(values[2]).padStart(2, "0")}T${String(
            values[3],
          ).padStart(2, "0")}:${String(values[4]).padStart(2, "0")}:${String(
            values[5],
          ).padStart(2, "0")}Z`,
          offset: "Z",
          timezoneBasis: "format-defined-utc",
        });
      }
    }
    offset += length + 12;
  }
  return events.slice(0, MAX_EMBEDDED_EVENTS);
}

function parseWebp(view) {
  const events = [];
  let offset = 12;
  while (hasBytes(view, offset, 8) && events.length < MAX_EMBEDDED_EVENTS) {
    const type = readAscii(view, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const dataOffset = offset + 8;
    if (!hasBytes(view, dataOffset, length)) break;
    if (type === "EXIF") {
      const tiffOffset =
        readAscii(view, dataOffset, 4) === "Exif" ? dataOffset + 6 : dataOffset;
      events.push(...parseTiffTimestamps(view, tiffOffset));
    }
    offset += 8 + length + (length % 2);
  }
  return events.slice(0, MAX_EMBEDDED_EVENTS);
}

function quickTimeIso(secondsInput) {
  const seconds =
    typeof secondsInput === "bigint"
      ? Number(secondsInput)
      : Number(secondsInput);
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const unixSeconds = seconds - QUICKTIME_TO_UNIX_SECONDS;
  const epochMs = unixSeconds * 1000;
  if (!Number.isFinite(epochMs)) return "";
  const date = new Date(epochMs);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function parseMp4(view) {
  const events = [];
  const scan = (start, end, depth = 0) => {
    if (depth > 6 || events.length >= MAX_EMBEDDED_EVENTS) return;
    let offset = start;
    while (offset + 8 <= end && events.length < MAX_EMBEDDED_EVENTS) {
      let size = view.getUint32(offset, false);
      const type = readAscii(view, offset + 4, 4);
      let headerSize = 8;
      if (size === 1) {
        if (!hasBytes(view, offset, 16)) break;
        const large = view.getBigUint64(offset + 8, false);
        if (large > BigInt(Number.MAX_SAFE_INTEGER)) break;
        size = Number(large);
        headerSize = 16;
      } else if (size === 0) {
        size = end - offset;
      }
      if (size < headerSize || offset + size > end) break;
      const payload = offset + headerSize;
      const atomEnd = offset + size;

      if ((type === "mvhd" || type === "mdhd") && hasBytes(view, payload, 8)) {
        const version = view.getUint8(payload);
        let seconds = 0;
        if (version === 0 && hasBytes(view, payload + 4, 4)) {
          seconds = view.getUint32(payload + 4, false);
        } else if (version === 1 && hasBytes(view, payload + 4, 8)) {
          seconds = view.getBigUint64(payload + 4, false);
        }
        const timestamp = quickTimeIso(seconds);
        if (timestamp) {
          events.push({
            kind: type === "mvhd" ? "mp4-movie-created" : "mp4-media-created",
            label:
              type === "mvhd"
                ? "MP4 movie-header creation time"
                : "MP4 media-header creation time",
            timestamp,
            offset: "Z",
            timezoneBasis: "container-utc-field",
          });
        }
      }
      if (MP4_CONTAINERS.has(type)) scan(payload, atomEnd, depth + 1);
      if (type === "meta" && payload + 4 < atomEnd) {
        scan(payload + 4, atomEnd, depth + 1);
      }
      offset += size;
    }
  };
  scan(0, view.byteLength);
  return events.slice(0, MAX_EMBEDDED_EVENTS);
}

function parseWav(view) {
  const events = [];
  let offset = 12;
  while (hasBytes(view, offset, 8) && events.length < MAX_EMBEDDED_EVENTS) {
    const type = readAscii(view, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const payload = offset + 8;
    if (!hasBytes(view, payload, length)) break;
    if (
      type === "LIST" &&
      length >= 4 &&
      readAscii(view, payload, 4) === "INFO"
    ) {
      let child = payload + 4;
      const listEnd = payload + length;
      while (child + 8 <= listEnd) {
        const childType = readAscii(view, child, 4);
        const childLength = view.getUint32(child + 4, true);
        const childPayload = child + 8;
        if (
          !hasBytes(view, childPayload, childLength) ||
          childPayload + childLength > listEnd
        ) {
          break;
        }
        if (childType === "ICRD") {
          const timestamp = readAscii(view, childPayload, childLength);
          if (timestamp) {
            events.push({
              kind: "wav-created",
              label: "WAV INFO ICRD",
              timestamp,
              offset: "",
              timezoneBasis: "unknown",
            });
          }
        }
        child += 8 + childLength + (childLength % 2);
      }
    }
    offset += 8 + length + (length % 2);
  }
  return events.slice(0, MAX_EMBEDDED_EVENTS);
}

export function extractMediaTimestamps(arrayBuffer) {
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    return {
      format: "unknown",
      events: [],
      warning: "An ArrayBuffer is required.",
    };
  }
  const view = new DataView(arrayBuffer);
  let format = "unknown";
  let events = [];

  if (
    view.byteLength >= 2 &&
    view.getUint8(0) === 0xff &&
    view.getUint8(1) === 0xd8
  ) {
    format = "jpeg";
    events = parseJpeg(view);
  } else if (
    view.byteLength >= 8 &&
    view.getUint32(0, false) === 0x89504e47 &&
    view.getUint32(4, false) === 0x0d0a1a0a
  ) {
    format = "png";
    events = parsePng(view);
  } else if (
    view.byteLength >= 12 &&
    readAscii(view, 0, 4) === "RIFF" &&
    readAscii(view, 8, 4) === "WEBP"
  ) {
    format = "webp";
    events = parseWebp(view);
  } else if (
    view.byteLength >= 12 &&
    readAscii(view, 0, 4) === "RIFF" &&
    readAscii(view, 8, 4) === "WAVE"
  ) {
    format = "wav";
    events = parseWav(view);
  } else if (view.byteLength >= 12 && readAscii(view, 4, 4) === "ftyp") {
    format = "mp4-family";
    events = parseMp4(view);
  }

  const deduped = [];
  const seen = new Set();
  events.forEach((event) => {
    const key = `${event.kind}\u0000${event.timestamp}\u0000${event.offset}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(event);
    }
  });
  return {
    format,
    events: deduped.slice(0, MAX_EMBEDDED_EVENTS),
    warning:
      format === "unknown"
        ? "No supported JPEG, PNG, WebP, MP4-family, or WAV container signature was found."
        : "",
  };
}

export function correlateTimeline(recordsInput, options = {}) {
  const records = Array.isArray(recordsInput) ? recordsInput.slice(0, 30) : [];
  const fallbackOffset = String(options.fallbackOffset || "").trim();
  const clusterMinutes = Math.min(
    1440,
    Math.max(1, Number(options.clusterMinutes) || 5),
  );
  const events = [];

  records.forEach((record, recordIndex) => {
    const recordId = String(record.id || `record-${recordIndex + 1}`);
    const fileName = String(record.fileName || `File ${recordIndex + 1}`);
    if (Number(record.lastModified) > 0) {
      const iso = new Date(Number(record.lastModified)).toISOString();
      events.push({
        recordId,
        fileName,
        kind: "filesystem-last-modified",
        label: "Browser file lastModified",
        timestamp: iso,
        offset: "Z",
        timezoneBasis: "browser-file-property",
      });
    }
    const embedded = Array.isArray(record.embeddedEvents)
      ? record.embeddedEvents.slice(0, MAX_EMBEDDED_EVENTS)
      : [];
    embedded.forEach((event) => {
      events.push({
        recordId,
        fileName,
        kind: String(event.kind || "embedded"),
        label: String(event.label || "Embedded timestamp"),
        timestamp: String(event.timestamp || ""),
        offset: String(event.offset || ""),
        timezoneBasis: String(event.timezoneBasis || "unknown"),
      });
    });
  });

  const normalized = events.map((event, index) => {
    const usesUserFallback =
      !event.offset &&
      event.timezoneBasis === "unknown" &&
      Boolean(fallbackOffset);
    const offset = event.offset || (usesUserFallback ? fallbackOffset : "");
    const normalizedTimestamp = normalizeTimestamp(event.timestamp, offset);
    return {
      ...event,
      eventId: `${event.recordId}:${event.kind}:${index}`,
      normalized:
        normalizedTimestamp.status === "zoned"
          ? {
              ...normalizedTimestamp,
              usedFallbackOffset: usesUserFallback,
            }
          : normalizedTimestamp,
    };
  });
  const known = normalized
    .filter((event) => event.normalized.status === "zoned")
    .sort(
      (left, right) =>
        left.normalized.epochMs - right.normalized.epochMs ||
        left.eventId.localeCompare(right.eventId),
    );
  const unresolved = normalized.filter(
    (event) => event.normalized.status !== "zoned",
  );

  const thresholdMs = clusterMinutes * 60_000;
  const clusters = [];
  let current = [];
  known.forEach((event) => {
    const previous = current.at(-1);
    if (
      previous &&
      event.normalized.epochMs - previous.normalized.epochMs > thresholdMs
    ) {
      if (current.length > 1) clusters.push(current);
      current = [];
    }
    current.push(event);
  });
  if (current.length > 1) clusters.push(current);

  const exactGroups = new Map();
  known.forEach((event) => {
    const key = String(event.normalized.epochMs);
    exactGroups.set(key, [...(exactGroups.get(key) || []), event]);
  });
  const exactTimestampGroups = [...exactGroups.values()].filter(
    (group) => new Set(group.map((event) => event.recordId)).size > 1,
  );

  const embeddedAfterFilesystem = [];
  records.forEach((record, recordIndex) => {
    const recordId = String(record.id || `record-${recordIndex + 1}`);
    const recordEvents = known.filter((event) => event.recordId === recordId);
    const filesystem = recordEvents.find(
      (event) => event.kind === "filesystem-last-modified",
    );
    if (!filesystem) return;
    recordEvents
      .filter((event) => event.kind !== "filesystem-last-modified")
      .forEach((event) => {
        if (event.normalized.epochMs > filesystem.normalized.epochMs + 60_000) {
          embeddedAfterFilesystem.push(event);
        }
      });
  });

  return {
    records,
    events: normalized,
    known,
    unresolved,
    clusters,
    exactTimestampGroups,
    embeddedAfterFilesystem,
    options: { fallbackOffset, clusterMinutes },
    counts: {
      files: records.length,
      events: normalized.length,
      zonedEvents: known.length,
      unresolvedEvents: unresolved.length,
      fallbackOffsetEvents: known.filter(
        (event) => event.normalized.usedFallbackOffset,
      ).length,
      proximityClusters: clusters.length,
      exactCrossFileGroups: exactTimestampGroups.length,
      embeddedAfterFilesystem: embeddedAfterFilesystem.length,
    },
    limitations: [
      "Metadata can be missing, rewritten, copied, rounded, timezone-free, incorrect, or intentionally changed.",
      "File lastModified is a browser-provided file property and is not a capture timestamp.",
      "MP4-family time fields depend on how the writing software interpreted the container specification.",
      "Correlation shows temporal proximity and field relationships; it does not establish capture order, authorship, authenticity, tampering, or legal admissibility.",
    ],
  };
}

export function buildTimelineCountsReport(result) {
  if (!result?.counts) return null;
  return {
    schema: "altftool.media-metadata-timeline-counts.v1",
    createdAt: new Date().toISOString(),
    createdAtMeaning:
      "Report-generation time from this browser clock; not a media, capture, or source timestamp.",
    counts: { ...result.counts },
    options: {
      fallbackOffsetApplied: Boolean(result.options?.fallbackOffset),
      clusterMinutes: result.options?.clusterMinutes || 5,
    },
    formats: result.records.reduce((counts, record) => {
      const format = String(record.format || "unknown");
      counts[format] = (counts[format] || 0) + 1;
      return counts;
    }, {}),
    scope: {
      localOnly: true,
      filenamesIncluded: false,
      reportGenerationTimestampIncluded: true,
      sourceMediaTimestampsIncluded: false,
      rawMetadataIncluded: false,
      mediaIncluded: false,
      authenticityEstablished: false,
      captureOrderEstablished: false,
    },
  };
}
