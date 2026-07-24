export const CHAIN_SCHEMA = "altftool.evidence-chain.v1";
export const COUNTS_SCHEMA = "altftool.evidence-chain-counts.v1";

export const LIMITS = Object.freeze({
  maxEvidenceItems: 100,
  maxEvents: 1_000,
  maxIdLength: 120,
  maxLabelLength: 240,
  maxTimestampLength: 80,
  maxTimezoneLength: 100,
  maxPersonLength: 240,
  maxLocationLength: 300,
  maxNoteLength: 2_000,
});

export const EVENT_TYPES = Object.freeze([
  Object.freeze({ value: "acquisition", label: "Acquisition" }),
  Object.freeze({ value: "copy", label: "Copy" }),
  Object.freeze({ value: "transfer", label: "Transfer" }),
  Object.freeze({ value: "access", label: "Access" }),
  Object.freeze({ value: "return", label: "Return" }),
  Object.freeze({ value: "seal", label: "Seal" }),
]);

export const DIGEST_ALGORITHMS = Object.freeze([
  Object.freeze({ value: "SHA-256", hexadecimalLength: 64 }),
  Object.freeze({ value: "SHA-512", hexadecimalLength: 128 }),
]);

export const LIMITATIONS = Object.freeze([
  "This organizer and its exports are not a digital signature, notarization, timestamp authority, or proof of authenticity.",
  "A recorded digest or matching hash chain does not prove who handled an item, whether an event occurred, whether an item is trustworthy, or whether evidence is admissible.",
  "The optional SHA-256 chain detects changes relative to this exported event sequence only; anyone who can edit the record can recompute the chain.",
  "Actor, recipient, location, timestamp, timezone, and note values are user-entered data and are not independently verified.",
]);

const EVENT_TYPE_VALUES = new Set(EVENT_TYPES.map((type) => type.value));
const DIGEST_LENGTHS = new Map(
  DIGEST_ALGORITHMS.map((algorithm) => [
    algorithm.value,
    algorithm.hexadecimalLength,
  ]),
);
const OFFSET_TIMESTAMP_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/u;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function compareText(left, right) {
  const a = String(left ?? "");
  const b = String(right ?? "");
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function canonicalize(value) {
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map((item) =>
      item === undefined ||
      typeof item === "function" ||
      typeof item === "symbol"
        ? null
        : canonicalize(item),
    );
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareText)
        .filter((key) => {
          const item = value[key];
          return (
            item !== undefined &&
            typeof item !== "function" &&
            typeof item !== "symbol"
          );
        })
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  return String(value);
}

export function stableCanonicalStringify(value) {
  return JSON.stringify(canonicalize(value));
}

function normalizeId(value) {
  return String(value ?? "").trim();
}

function normalizeDigest(value) {
  return String(value ?? "").trim().toLowerCase();
}

function exactText(value) {
  return String(value ?? "");
}

function addIssue(collection, code, path, message) {
  collection.push({ code, path, message });
}

function validateLength({
  collection,
  path,
  value,
  maximum,
  label,
  required = false,
}) {
  const text = exactText(value);
  if (required && !text.trim()) {
    addIssue(collection, "required", path, `${label} is required.`);
  }
  if (text.length > maximum) {
    addIssue(
      collection,
      "too-long",
      path,
      `${label} must be ${maximum.toLocaleString("en-US")} characters or fewer.`,
    );
  }
}

export function parseOffsetTimestamp(value) {
  const source = exactText(value);
  const match = OFFSET_TIMESTAMP_PATTERN.exec(source);
  if (!match) {
    return {
      ok: false,
      epochMs: null,
      message:
        "Use YYYY-MM-DDTHH:mm:ss with Z or a numeric UTC offset such as +05:30.",
    };
  }

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    fractionText = "",
    offsetText,
    offsetSign,
    offsetHourText,
    offsetMinuteText,
  ] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const offsetHour = offsetText === "Z" ? 0 : Number(offsetHourText);
  const offsetMinute = offsetText === "Z" ? 0 : Number(offsetMinuteText);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHour > 14 ||
    offsetMinute > 59 ||
    (offsetHour === 14 && offsetMinute !== 0)
  ) {
    return {
      ok: false,
      epochMs: null,
      message: "The timestamp or UTC offset contains an invalid date or time.",
    };
  }

  const milliseconds = Number(fractionText.padEnd(3, "0") || 0);
  const offsetMinutes =
    offsetText === "Z"
      ? 0
      : (offsetSign === "-" ? -1 : 1) * (offsetHour * 60 + offsetMinute);
  const epochMs =
    Date.UTC(year, month - 1, day, hour, minute, second, milliseconds) -
    offsetMinutes * 60_000;

  return { ok: true, epochMs, message: "" };
}

export function validateEvidenceChainDraft(draft) {
  const errors = [];
  const warnings = [];
  const evidenceItems = Array.isArray(draft?.evidenceItems)
    ? draft.evidenceItems
    : [];
  const events = Array.isArray(draft?.events) ? draft.events : [];

  validateLength({
    collection: errors,
    path: "caseReference",
    value: draft?.caseReference,
    maximum: LIMITS.maxLabelLength,
    label: "Private case reference",
  });

  if (!evidenceItems.length) {
    addIssue(
      errors,
      "missing-evidence",
      "evidenceItems",
      "Add at least one evidence item.",
    );
  }
  if (evidenceItems.length > LIMITS.maxEvidenceItems) {
    addIssue(
      errors,
      "too-many-evidence-items",
      "evidenceItems",
      `Use no more than ${LIMITS.maxEvidenceItems} evidence items.`,
    );
  }
  if (!events.length) {
    addIssue(
      errors,
      "missing-events",
      "events",
      "Add at least one custody event.",
    );
  }
  if (events.length > LIMITS.maxEvents) {
    addIssue(
      errors,
      "too-many-events",
      "events",
      `Use no more than ${LIMITS.maxEvents.toLocaleString("en-US")} events.`,
    );
  }

  const evidenceIds = new Set();
  evidenceItems.slice(0, LIMITS.maxEvidenceItems).forEach((item, index) => {
    const path = `evidenceItems[${index}]`;
    const id = normalizeId(item?.id);
    validateLength({
      collection: errors,
      path: `${path}.id`,
      value: id,
      maximum: LIMITS.maxIdLength,
      label: `Evidence item ${index + 1} ID`,
      required: true,
    });
    validateLength({
      collection: errors,
      path: `${path}.label`,
      value: item?.label,
      maximum: LIMITS.maxLabelLength,
      label: `Evidence item ${index + 1} label`,
    });
    if (id) {
      if (evidenceIds.has(id)) {
        addIssue(
          errors,
          "duplicate-evidence-id",
          `${path}.id`,
          `Evidence item ID "${id}" is duplicated.`,
        );
      }
      evidenceIds.add(id);
    }

    const algorithm = exactText(item?.digestAlgorithm);
    const digest = normalizeDigest(item?.digest);
    const expectedLength = DIGEST_LENGTHS.get(algorithm);
    if (!expectedLength) {
      addIssue(
        errors,
        "invalid-digest-algorithm",
        `${path}.digestAlgorithm`,
        `Evidence item ${index + 1} must use a supported digest algorithm.`,
      );
    } else if (
      digest.length !== expectedLength ||
      !/^[a-f0-9]+$/u.test(digest)
    ) {
      addIssue(
        errors,
        "invalid-digest",
        `${path}.digest`,
        `Evidence item ${index + 1} needs a ${expectedLength}-character hexadecimal ${algorithm} digest.`,
      );
    }
  });

  const eventIds = new Set();
  const firstTypeByEvidence = new Map();
  const eventTypeCounts = Object.fromEntries(
    EVENT_TYPES.map((type) => [type.value, 0]),
  );
  let lastValidEpoch = null;
  let lastValidEventLabel = "";
  let eventsWithRecipient = 0;
  let eventsWithLocation = 0;
  let eventsWithNote = 0;

  events.slice(0, LIMITS.maxEvents).forEach((event, index) => {
    const path = `events[${index}]`;
    const eventId = normalizeId(event?.eventId);
    const evidenceItemId = normalizeId(event?.evidenceItemId);
    const eventType = exactText(event?.type);

    validateLength({
      collection: errors,
      path: `${path}.eventId`,
      value: eventId,
      maximum: LIMITS.maxIdLength,
      label: `Event ${index + 1} ID`,
      required: true,
    });
    if (eventId) {
      if (eventIds.has(eventId)) {
        addIssue(
          errors,
          "duplicate-event-id",
          `${path}.eventId`,
          `Event ID "${eventId}" is duplicated.`,
        );
      }
      eventIds.add(eventId);
    }

    validateLength({
      collection: errors,
      path: `${path}.evidenceItemId`,
      value: evidenceItemId,
      maximum: LIMITS.maxIdLength,
      label: `Event ${index + 1} evidence reference`,
      required: true,
    });
    if (evidenceItemId && !evidenceIds.has(evidenceItemId)) {
      addIssue(
        errors,
        "unknown-evidence-reference",
        `${path}.evidenceItemId`,
        `Event ${index + 1} references an unknown evidence item ID.`,
      );
    }

    if (!EVENT_TYPE_VALUES.has(eventType)) {
      addIssue(
        errors,
        "invalid-event-type",
        `${path}.type`,
        `Event ${index + 1} needs a supported event type.`,
      );
    } else {
      eventTypeCounts[eventType] += 1;
      const firstType = firstTypeByEvidence.get(evidenceItemId);
      if (evidenceItemId && !firstType) {
        firstTypeByEvidence.set(evidenceItemId, eventType);
        if (eventType !== "acquisition") {
          addIssue(
            errors,
            "acquisition-not-first",
            `${path}.type`,
            `The first event for evidence item "${evidenceItemId}" must be acquisition.`,
          );
        }
      } else if (evidenceItemId && eventType === "acquisition") {
        addIssue(
          errors,
          "repeated-acquisition",
          `${path}.type`,
          `Evidence item "${evidenceItemId}" already has an earlier event; acquisition must be first and appear once.`,
        );
      }
    }

    validateLength({
      collection: errors,
      path: `${path}.timestamp`,
      value: event?.timestamp,
      maximum: LIMITS.maxTimestampLength,
      label: `Event ${index + 1} timestamp`,
      required: true,
    });
    const parsedTimestamp = parseOffsetTimestamp(event?.timestamp);
    if (!parsedTimestamp.ok) {
      addIssue(
        errors,
        "invalid-timestamp",
        `${path}.timestamp`,
        `Event ${index + 1}: ${parsedTimestamp.message}`,
      );
    } else {
      if (
        lastValidEpoch !== null &&
        parsedTimestamp.epochMs < lastValidEpoch
      ) {
        addIssue(
          errors,
          "chronology-regression",
          `${path}.timestamp`,
          `Event ${index + 1} occurs before the preceding valid event${lastValidEventLabel ? ` "${lastValidEventLabel}"` : ""}.`,
        );
      } else if (
        lastValidEpoch !== null &&
        parsedTimestamp.epochMs === lastValidEpoch
      ) {
        addIssue(
          warnings,
          "same-instant",
          `${path}.timestamp`,
          `Event ${index + 1} has the same instant as the preceding valid event; confirm their intended sequence.`,
        );
      }
      lastValidEpoch = parsedTimestamp.epochMs;
      lastValidEventLabel = eventId;
    }

    validateLength({
      collection: errors,
      path: `${path}.timezone`,
      value: event?.timezone,
      maximum: LIMITS.maxTimezoneLength,
      label: `Event ${index + 1} timezone label`,
      required: true,
    });
    validateLength({
      collection: errors,
      path: `${path}.actor`,
      value: event?.actor,
      maximum: LIMITS.maxPersonLength,
      label: `Event ${index + 1} actor`,
      required: true,
    });
    validateLength({
      collection: errors,
      path: `${path}.recipient`,
      value: event?.recipient,
      maximum: LIMITS.maxPersonLength,
      label: `Event ${index + 1} recipient`,
      required: eventType === "transfer" || eventType === "return",
    });
    validateLength({
      collection: errors,
      path: `${path}.location`,
      value: event?.location,
      maximum: LIMITS.maxLocationLength,
      label: `Event ${index + 1} location`,
    });
    validateLength({
      collection: errors,
      path: `${path}.note`,
      value: event?.note,
      maximum: LIMITS.maxNoteLength,
      label: `Event ${index + 1} note`,
    });

    if (exactText(event?.recipient).trim()) eventsWithRecipient += 1;
    if (exactText(event?.location).trim()) eventsWithLocation += 1;
    if (exactText(event?.note).trim()) eventsWithNote += 1;
  });

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    counts: {
      evidenceItems: Math.min(evidenceItems.length, LIMITS.maxEvidenceItems),
      events: Math.min(events.length, LIMITS.maxEvents),
      eventTypes: eventTypeCounts,
      eventsWithRecipient,
      eventsWithLocation,
      eventsWithNote,
    },
  };
}

function normalizedEvidenceItem(item) {
  return {
    id: normalizeId(item.id),
    label: exactText(item.label),
    digest: {
      algorithm: exactText(item.digestAlgorithm),
      value: normalizeDigest(item.digest),
    },
  };
}

function normalizedEvent(event, index) {
  return {
    sequence: index + 1,
    eventId: normalizeId(event.eventId),
    evidenceItemId: normalizeId(event.evidenceItemId),
    type: exactText(event.type),
    timestampEntered: exactText(event.timestamp),
    timezoneEntered: exactText(event.timezone),
    actor: exactText(event.actor),
    recipient: exactText(event.recipient),
    location: exactText(event.location),
    note: exactText(event.note),
  };
}

export function buildCanonicalRecord(draft) {
  const validation = validateEvidenceChainDraft(draft);
  if (!validation.ok) {
    throw new TypeError(
      validation.errors.map((issue) => issue.message).join(" "),
    );
  }

  const evidenceItems = draft.evidenceItems
    .map(normalizedEvidenceItem)
    .sort((left, right) => compareText(left.id, right.id));
  const events = draft.events.map(normalizedEvent);

  return {
    schema: CHAIN_SCHEMA,
    caseReference: exactText(draft.caseReference),
    limitations: [...LIMITATIONS],
    privacy: {
      localOnly: true,
      persistentStorageUsed: false,
      containsUserEnteredPrivateData: true,
    },
    canonicalization: {
      objectKeys: "UTF-16 ascending",
      arrayOrder: "preserved",
      evidenceItemOrder: "ID UTF-16 ascending",
      eventOrder: "entered sequence after chronology validation",
      textEncoding: "UTF-8",
    },
    evidenceItems,
    events,
    hashChain: {
      enabled: false,
    },
  };
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function sha256Hex(
  value,
  subtle = globalThis.crypto?.subtle,
) {
  if (!subtle) throw new Error("Web Crypto is unavailable in this browser.");
  const encoded = new TextEncoder().encode(exactText(value));
  const digest = await subtle.digest("SHA-256", encoded);
  return bytesToHex(new Uint8Array(digest));
}

export async function applySha256EventHashChain(
  canonicalRecord,
  subtle = globalThis.crypto?.subtle,
) {
  if (!canonicalRecord || !Array.isArray(canonicalRecord.events)) {
    throw new TypeError("A canonical evidence-chain record is required.");
  }

  let previousHash = "GENESIS";
  const chainedEvents = [];
  for (const event of canonicalRecord.events) {
    const payload = { ...event };
    delete payload.chain;
    const eventHash = await sha256Hex(
      `${previousHash}\n${stableCanonicalStringify(payload)}`,
      subtle,
    );
    chainedEvents.push({
      ...payload,
      chain: {
        previousHash,
        eventHash,
      },
    });
    previousHash = eventHash;
  }

  return {
    ...canonicalRecord,
    events: chainedEvents,
    hashChain: {
      enabled: true,
      algorithm: "SHA-256",
      genesis: "GENESIS",
      recipe:
        "SHA-256(UTF-8(previousEventHash + LF + canonicalEventJSON))",
      canonicalEventJSON:
        "Recursive object-key sort; event array order is the validated entered sequence.",
      coverage:
        "Event payloads only; evidence-item registry and top-level metadata are not covered by this chain.",
      finalEventHash: previousHash,
    },
  };
}

export function buildCountsOnlyReport(record, validation) {
  const events = Array.isArray(record?.events) ? record.events : [];
  const typeCounts = Object.fromEntries(
    EVENT_TYPES.map((type) => [
      `${type.value}Events`,
      events.filter((event) => event.type === type.value).length,
    ]),
  );

  return {
    schema: COUNTS_SCHEMA,
    limitations: [...LIMITATIONS],
    counts: {
      evidenceItems: Array.isArray(record?.evidenceItems)
        ? record.evidenceItems.length
        : 0,
      events: events.length,
      ...typeCounts,
      eventsWithRecipient: events.filter((event) =>
        exactText(event.recipient).trim(),
      ).length,
      eventsWithLocation: events.filter((event) =>
        exactText(event.location).trim(),
      ).length,
      eventsWithNote: events.filter((event) =>
        exactText(event.note).trim(),
      ).length,
      validationErrors: Array.isArray(validation?.errors)
        ? validation.errors.length
        : 0,
      validationWarnings: Array.isArray(validation?.warnings)
        ? validation.warnings.length
        : 0,
      hashChainIncluded: Boolean(record?.hashChain?.enabled),
    },
    scope: {
      localOnly: true,
      includesCaseReference: false,
      includesEvidenceIds: false,
      includesDigests: false,
      includesEventIds: false,
      includesTimestamps: false,
      includesTimezones: false,
      includesActors: false,
      includesRecipients: false,
      includesLocations: false,
      includesNotes: false,
      includesEventHashes: false,
    },
  };
}
