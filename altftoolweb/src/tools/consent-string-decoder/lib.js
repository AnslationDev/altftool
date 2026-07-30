/**
 * IAB Europe Transparency & Consent Framework (TCF) v2 / v2.2 TC String decoder.
 *
 * A TC String is one or more dot-separated segments. Each segment is a
 * web-safe Base64 encoding (alphabet A-Z a-z 0-9 - _, no padding) of a raw
 * bit stream. Field offsets below are taken from the IAB "TCF Implementation
 * Guidelines / Consent string and vendor list formats v2" specification.
 *
 * Everything here is pure: the same string always decodes to the same object.
 * No network, no clock, no randomness. The decoder cannot tell you a vendor's
 * NAME — that lives in the Global Vendor List, which is a network resource —
 * so it reports vendor IDs and ranges only.
 */

/** Web-safe Base64 alphabet used by the TCF. Index === 6-bit value. */
const B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Standard Base64 aliases, accepted so a copy-paste from a log still decodes. */
const B64_ALIASES = { "+": 62, "/": 63 };

/** Core-string field offsets and widths, in bits. */
export const CORE_FIELDS = {
  version: [0, 6],
  created: [6, 36],
  lastUpdated: [42, 36],
  cmpId: [78, 12],
  cmpVersion: [90, 12],
  consentScreen: [102, 6],
  consentLanguage: [108, 12],
  vendorListVersion: [120, 12],
  tcfPolicyVersion: [132, 6],
  isServiceSpecific: [138, 1],
  useNonStandardTexts: [139, 1],
  specialFeatureOptIns: [140, 12],
  purposesConsent: [152, 24],
  purposesLegitimateInterest: [176, 24],
  purposeOneTreatment: [200, 1],
  publisherCountryCode: [201, 12],
};

/** First bit after the fixed-width core header — the vendor-consent section. */
export const CORE_VARIABLE_START = 213;

/** TCF v2.2 purposes. `liAllowed` follows the v2.2 policy (consent-only for 1, 3, 4, 5, 6). */
export const TCF_PURPOSES = [
  { id: 1, name: "Store and/or access information on a device", liAllowed: false },
  { id: 2, name: "Use limited data to select advertising", liAllowed: true },
  { id: 3, name: "Create profiles for personalised advertising", liAllowed: false },
  { id: 4, name: "Use profiles to select personalised advertising", liAllowed: false },
  { id: 5, name: "Create profiles to personalise content", liAllowed: false },
  { id: 6, name: "Use profiles to select personalised content", liAllowed: false },
  { id: 7, name: "Measure advertising performance", liAllowed: true },
  { id: 8, name: "Measure content performance", liAllowed: true },
  { id: 9, name: "Understand audiences through statistics or combinations of data", liAllowed: true },
  { id: 10, name: "Develop and improve services", liAllowed: true },
  { id: 11, name: "Use limited data to select content", liAllowed: true },
];

/** TCF v2.2 special features — always opt-in, never legitimate interest. */
export const TCF_SPECIAL_FEATURES = [
  { id: 1, name: "Use precise geolocation data" },
  { id: 2, name: "Actively scan device characteristics for identification" },
];

/** Publisher restriction types (2 bits). */
export const RESTRICTION_TYPES = [
  { id: 0, name: "Purpose flatly not allowed", detail: "The publisher forbids this purpose for the vendor entirely." },
  { id: 1, name: "Require consent", detail: "The vendor may only use consent, even if it declared legitimate interest." },
  { id: 2, name: "Require legitimate interest", detail: "The vendor may only use legitimate interest, even if it declared consent." },
  { id: 3, name: "Undefined", detail: "Reserved value — a CMP should never emit it." },
];

/** Segment types, read from the leading 3 bits of every non-core segment. */
export const SEGMENT_TYPES = {
  0: { key: "core", name: "Core" },
  1: { key: "disclosedVendors", name: "Disclosed Vendors (out-of-band)" },
  2: { key: "allowedVendors", name: "Allowed Vendors (removed in TCF v2.2)" },
  3: { key: "publisherTc", name: "Publisher Transparency & Consent" },
};

/** TCF policy version 4 and above is TCF v2.2 (in force since 2023). */
export const TCF_22_POLICY_VERSION = 4;

/** Minimum base64 characters for a nonce-grade 128-bit value — unused here, kept for clarity. */
const DECISECONDS_TO_MS = 100;

/* ------------------------------------------------------------------ */
/* Bit plumbing                                                        */
/* ------------------------------------------------------------------ */

/**
 * Turn one web-safe Base64 segment into a string of "0"/"1" characters.
 * Returns { error } naming the first character that is not in the alphabet.
 */
export function segmentToBits(segment) {
  const text = String(segment == null ? "" : segment);
  if (!text) return { error: "Segment is empty." };
  let bits = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "=") continue; // tolerate padding a logger may have added
    let value = B64_ALPHABET.indexOf(char);
    if (value < 0 && Object.prototype.hasOwnProperty.call(B64_ALIASES, char)) {
      value = B64_ALIASES[char];
    }
    if (value < 0) {
      return {
        error: `"${char}" at position ${i + 1} is not a web-safe Base64 character (A-Z a-z 0-9 - _).`,
      };
    }
    bits += value.toString(2).padStart(6, "0");
  }
  if (!bits) return { error: "Segment contains no data." };
  return { bits };
}

/** Sequential bit reader over a "0"/"1" string. Returns null once it runs out. */
function createReader(bits) {
  let cursor = 0;
  return {
    position: () => cursor,
    remaining: () => bits.length - cursor,
    seek(next) {
      cursor = next;
    },
    /** Read `length` bits as an unsigned integer (safe up to 53 bits). */
    int(length) {
      if (length <= 0 || cursor + length > bits.length) return null;
      const value = parseInt(bits.slice(cursor, cursor + length), 2);
      cursor += length;
      return Number.isFinite(value) ? value : null;
    },
    /** Read one bit as a boolean. */
    bool() {
      if (cursor + 1 > bits.length) return null;
      const value = bits[cursor] === "1";
      cursor += 1;
      return value;
    },
    /** Read `length` raw bits as a "0"/"1" string. */
    raw(length) {
      if (length < 0 || cursor + length > bits.length) return null;
      const value = bits.slice(cursor, cursor + length);
      cursor += length;
      return value;
    },
    /** Read a fixed-width run of 6-bit letters, A=0 … Z=25. */
    letters(count) {
      let out = "";
      for (let i = 0; i < count; i += 1) {
        const value = this.int(6);
        if (value === null) return null;
        if (value > 25) return null;
        out += String.fromCharCode(65 + value);
      }
      return out;
    },
  };
}

/** Convert a bitfield string into the list of 1-based ids whose bit is set. */
export function bitfieldToIds(field) {
  const ids = [];
  for (let i = 0; i < field.length; i += 1) {
    if (field[i] === "1") ids.push(i + 1);
  }
  return ids;
}

/** Collapse a sorted list of ids into inclusive [start, end] ranges. */
export function idsToRanges(ids) {
  const ranges = [];
  for (let i = 0; i < ids.length; i += 1) {
    const start = ids[i];
    let end = start;
    while (i + 1 < ids.length && ids[i + 1] === end + 1) {
      end += 1;
      i += 1;
    }
    ranges.push([start, end]);
  }
  return ranges;
}

/** Total ids covered by a list of inclusive ranges. */
export function countRanges(ranges) {
  return ranges.reduce((total, [start, end]) => total + (end - start + 1), 0);
}

/** Render ranges as "1-5, 9, 42" for display. */
export function formatRanges(ranges, limit = 40) {
  const shown = ranges.slice(0, limit).map(([start, end]) => (start === end ? String(start) : `${start}-${end}`));
  if (ranges.length > limit) shown.push(`… ${ranges.length - limit} more`);
  return shown.join(", ");
}

/**
 * Decode a 36-bit TCF timestamp (deciseconds since the Unix epoch, UTC).
 * Returns { epochMs, iso } or { error } when the value is out of range.
 */
export function decodeTcfTimestamp(deciseconds) {
  if (!Number.isFinite(deciseconds) || deciseconds < 0) {
    return { error: "Timestamp is not a valid 36-bit value." };
  }
  const epochMs = deciseconds * DECISECONDS_TO_MS;
  const date = new Date(epochMs);
  if (Number.isNaN(date.getTime())) return { error: "Timestamp is outside the representable date range." };
  return { epochMs, iso: date.toISOString() };
}

/* ------------------------------------------------------------------ */
/* Vendor sections                                                     */
/* ------------------------------------------------------------------ */

/**
 * Read a vendor section: MaxVendorId(16), IsRangeEncoding(1), then either a
 * bitfield of MaxVendorId bits or a 12-bit entry count followed by range
 * entries (IsARange(1), StartOrOnlyVendorId(16), [EndVendorId(16)]).
 */
export function readVendorSection(reader, label) {
  const maxVendorId = reader.int(16);
  if (maxVendorId === null) return { error: `${label}: string ends before MaxVendorId.` };
  const isRange = reader.bool();
  if (isRange === null) return { error: `${label}: string ends before the encoding flag.` };

  let ranges = [];
  if (isRange) {
    const numEntries = reader.int(12);
    if (numEntries === null) return { error: `${label}: string ends before the range-entry count.` };
    for (let i = 0; i < numEntries; i += 1) {
      const isARange = reader.bool();
      if (isARange === null) return { error: `${label}: range entry ${i + 1} is truncated.` };
      const start = reader.int(16);
      if (start === null) return { error: `${label}: range entry ${i + 1} is truncated.` };
      let end = start;
      if (isARange) {
        end = reader.int(16);
        if (end === null) return { error: `${label}: range entry ${i + 1} is truncated.` };
      }
      if (end < start) {
        return { error: `${label}: range entry ${i + 1} ends at ${end} but starts at ${start}.` };
      }
      ranges.push([start, end]);
    }
  } else {
    const field = reader.raw(maxVendorId);
    if (field === null) return { error: `${label}: bitfield needs ${maxVendorId} bits but the string is shorter.` };
    ranges = idsToRanges(bitfieldToIds(field));
  }

  const count = countRanges(ranges);
  const overflow = ranges.filter(([, end]) => end > maxVendorId);
  return {
    maxVendorId,
    encoding: isRange ? "range" : "bitfield",
    ranges,
    count,
    overflow: overflow.map(([start, end]) => (start === end ? String(start) : `${start}-${end}`)),
  };
}

/** Read only the range-entry table (used by publisher restrictions). */
function readRangeTable(reader, label) {
  const numEntries = reader.int(12);
  if (numEntries === null) return { error: `${label}: string ends before the entry count.` };
  const ranges = [];
  for (let i = 0; i < numEntries; i += 1) {
    const isARange = reader.bool();
    if (isARange === null) return { error: `${label}: entry ${i + 1} is truncated.` };
    const start = reader.int(16);
    if (start === null) return { error: `${label}: entry ${i + 1} is truncated.` };
    let end = start;
    if (isARange) {
      end = reader.int(16);
      if (end === null) return { error: `${label}: entry ${i + 1} is truncated.` };
    }
    if (end < start) return { error: `${label}: entry ${i + 1} ends at ${end} but starts at ${start}.` };
    ranges.push([start, end]);
  }
  return { ranges };
}

/* ------------------------------------------------------------------ */
/* Input tidy-up                                                       */
/* ------------------------------------------------------------------ */

/**
 * Pull the TC String out of what people actually paste: a bare string, a
 * cookie line (`euconsent-v2=C…`), or a URL macro (`&gdpr_consent=C…&`).
 */
export function extractTcString(input) {
  let text = String(input == null ? "" : input).trim();
  if (!text) return { error: "Paste a TC string to decode." };
  text = text.replace(/^["']|["']$/g, "");
  const keyed = /(?:euconsent-v2|gdpr_consent|tcString|consent)\s*[=:]\s*([A-Za-z0-9\-_.+/=]+)/i.exec(text);
  if (keyed) text = keyed[1];
  text = text.split(/[&;\s]/)[0];
  text = text.replace(/^["']|["']$/g, "").trim();
  if (!text) return { error: "No TC string found in that text." };
  return { value: text };
}

/* ------------------------------------------------------------------ */
/* Warnings                                                            */
/* ------------------------------------------------------------------ */

function buildWarnings(core, extraSegments) {
  const warnings = [];
  const push = (level, title, detail) => warnings.push({ level, title, detail });

  const consented = new Set(core.purposesConsent);
  const legitimate = new Set(core.purposesLegitimateInterest);

  TCF_PURPOSES.forEach((purpose) => {
    if (legitimate.has(purpose.id) && !purpose.liAllowed) {
      push(
        "error",
        `Purpose ${purpose.id} claims legitimate interest`,
        `TCF policy v2.2 makes purpose ${purpose.id} ("${purpose.name}") consent-only. A legitimate-interest bit here is not a valid legal basis under the current policy.`,
      );
    }
    if (consented.has(purpose.id) && legitimate.has(purpose.id)) {
      push(
        "error",
        `Purpose ${purpose.id} sets both legal bases`,
        "Consent and legitimate-interest transparency are both set for the same purpose. A purpose carries one legal basis; downstream vendors will disagree about which applies.",
      );
    }
  });

  if (core.purposesConsent.length === 0 && core.purposesLegitimateInterest.length === 0) {
    push("warn", "No purposes are established", "Neither consent nor legitimate interest is set for any purpose — this string signals a full rejection.");
  }

  if (core.purposeOneTreatment) {
    push(
      "info",
      "PurposeOneTreatment is on",
      "The CMP is signalling that purpose 1 (device storage and access) was not disclosed to this user, so vendors must not rely on the purpose-1 bit.",
    );
  }

  if (core.specialFeatureOptIns.includes(1)) {
    push("warn", "Precise geolocation opt-in is set", "Special feature 1 is on: vendors may use precise geolocation data (GPS-grade, better than 500 m).");
  }
  if (core.specialFeatureOptIns.includes(2)) {
    push("warn", "Device scanning opt-in is set", "Special feature 2 is on: vendors may actively scan device characteristics for fingerprinting-style identification.");
  }

  if (core.tcfPolicyVersion < TCF_22_POLICY_VERSION) {
    push(
      "warn",
      `Policy version ${core.tcfPolicyVersion} predates TCF v2.2`,
      "TCF v2.2 (policy version 4) has been mandatory since November 2023. A lower policy version means this string was written against the retired v2.0/v2.1 purpose wording.",
    );
  }

  if (core.cmpId === 0) {
    push("error", "CMP ID is 0", "Zero is not an allocated CMP ID. The string was produced outside the registered CMP list, or by test tooling.");
  }

  if (core.created.epochMs !== undefined && core.lastUpdated.epochMs !== undefined && core.lastUpdated.epochMs < core.created.epochMs) {
    push("error", "LastUpdated is before Created", "The two 36-bit timestamps are inconsistent, which usually means the string was hand-edited or truncated.");
  }

  if (core.vendorConsent.count === 0) {
    push("warn", "No vendor has consent", "The vendor-consent section is empty, so no Global Vendor List vendor may process data under consent.");
  }

  if (core.vendorConsent.overflow.length) {
    push("error", "Vendor consent ids exceed MaxVendorId", `Entries ${core.vendorConsent.overflow.join(", ")} sit above the declared MaxVendorId of ${core.vendorConsent.maxVendorId}.`);
  }
  if (core.vendorLegitimateInterest.overflow.length) {
    push("error", "Vendor LI ids exceed MaxVendorId", `Entries ${core.vendorLegitimateInterest.overflow.join(", ")} sit above the declared MaxVendorId of ${core.vendorLegitimateInterest.maxVendorId}.`);
  }

  core.publisherRestrictions.forEach((restriction) => {
    if (restriction.restrictionType === 3) {
      push("error", `Restriction on purpose ${restriction.purposeId} uses type 3`, "Restriction type 3 is undefined in the specification and no CMP should emit it.");
    }
    if (restriction.restrictionType === 0) {
      push("info", `Purpose ${restriction.purposeId} is disallowed for ${restriction.count} vendor(s)`, "The publisher has flatly forbidden this purpose for the listed vendors, whatever the user chose.");
    }
  });

  if (extraSegments.some((segment) => segment.type === 2)) {
    push("warn", "Allowed Vendors segment present", "Segment type 2 (Allowed Vendors) was removed in TCF v2.2 and is ignored by conforming vendors.");
  }

  if (!/^[A-Z]{2}$/.test(core.consentLanguage)) {
    push("error", "Consent language is not two letters", "ConsentLanguage must be an uppercase ISO 639-1 pair; this string carries something else.");
  }

  return warnings;
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/**
 * Decode a full TC String.
 * Returns { error } for anything unusable, otherwise the decoded structure.
 */
export function decodeTcString(input) {
  const extracted = extractTcString(input);
  if (extracted.error) return { error: extracted.error };
  const value = extracted.value;

  const segments = value.split(".");
  const coreBits = segmentToBits(segments[0]);
  if (coreBits.error) return { error: `Core segment: ${coreBits.error}` };
  const bits = coreBits.bits;

  const version = parseInt(bits.slice(0, 6), 2);
  if (!Number.isFinite(version)) return { error: "Core segment is too short to hold a version number." };
  if (version === 1) {
    return { error: "This is a TCF v1 string (version field = 1). TCF v1 was retired in 2020 and uses a different bit layout." };
  }
  if (version !== 2) {
    return { error: `Version field is ${version}; this decoder reads TCF v2 / v2.2 strings (version 2).` };
  }
  if (bits.length < CORE_VARIABLE_START + 17) {
    return { error: `Core segment holds ${bits.length} bits; a TCF v2 core needs at least ${CORE_VARIABLE_START + 17}.` };
  }

  const reader = createReader(bits);
  reader.seek(6);

  const createdRaw = reader.int(36);
  const lastUpdatedRaw = reader.int(36);
  const cmpId = reader.int(12);
  const cmpVersion = reader.int(12);
  const consentScreen = reader.int(6);
  const consentLanguage = reader.letters(2);
  const vendorListVersion = reader.int(12);
  const tcfPolicyVersion = reader.int(6);
  const isServiceSpecific = reader.bool();
  const useNonStandardTexts = reader.bool();
  const specialFeatureBits = reader.raw(12);
  const purposesConsentBits = reader.raw(24);
  const purposesLiBits = reader.raw(24);
  const purposeOneTreatment = reader.bool();
  const publisherCountryCode = reader.letters(2);

  if (
    createdRaw === null ||
    lastUpdatedRaw === null ||
    cmpId === null ||
    cmpVersion === null ||
    consentScreen === null ||
    vendorListVersion === null ||
    tcfPolicyVersion === null ||
    isServiceSpecific === null ||
    useNonStandardTexts === null ||
    specialFeatureBits === null ||
    purposesConsentBits === null ||
    purposesLiBits === null ||
    purposeOneTreatment === null
  ) {
    return { error: "Core segment is truncated inside the fixed header." };
  }
  if (consentLanguage === null || publisherCountryCode === null) {
    return { error: "ConsentLanguage or PublisherCC holds a 6-bit value above 25, which is not a letter." };
  }
  if (reader.position() !== CORE_VARIABLE_START) {
    return { error: `Internal offset mismatch: header ended at bit ${reader.position()}, expected ${CORE_VARIABLE_START}.` };
  }

  const vendorConsent = readVendorSection(reader, "Vendor consent");
  if (vendorConsent.error) return { error: vendorConsent.error };
  const vendorLegitimateInterest = readVendorSection(reader, "Vendor legitimate interest");
  if (vendorLegitimateInterest.error) return { error: vendorLegitimateInterest.error };

  const numPubRestrictions = reader.int(12);
  if (numPubRestrictions === null) {
    return { error: "Core segment ends before the publisher-restriction count." };
  }
  const publisherRestrictions = [];
  for (let i = 0; i < numPubRestrictions; i += 1) {
    const purposeId = reader.int(6);
    const restrictionType = reader.int(2);
    if (purposeId === null || restrictionType === null) {
      return { error: `Publisher restriction ${i + 1} is truncated.` };
    }
    const table = readRangeTable(reader, `Publisher restriction ${i + 1}`);
    if (table.error) return { error: table.error };
    publisherRestrictions.push({
      purposeId,
      restrictionType,
      restrictionName: RESTRICTION_TYPES[restrictionType].name,
      restrictionDetail: RESTRICTION_TYPES[restrictionType].detail,
      ranges: table.ranges,
      count: countRanges(table.ranges),
    });
  }

  const created = decodeTcfTimestamp(createdRaw);
  const lastUpdated = decodeTcfTimestamp(lastUpdatedRaw);

  const core = {
    version,
    createdRaw,
    lastUpdatedRaw,
    created,
    lastUpdated,
    cmpId,
    cmpVersion,
    consentScreen,
    consentLanguage,
    vendorListVersion,
    tcfPolicyVersion,
    isServiceSpecific,
    useNonStandardTexts,
    purposeOneTreatment,
    publisherCountryCode,
    specialFeatureOptIns: bitfieldToIds(specialFeatureBits),
    purposesConsent: bitfieldToIds(purposesConsentBits),
    purposesLegitimateInterest: bitfieldToIds(purposesLiBits),
    vendorConsent,
    vendorLegitimateInterest,
    publisherRestrictions,
    bitLength: bits.length,
    trailingBits: bits.length - reader.position(),
  };

  const extraSegments = [];
  for (let i = 1; i < segments.length; i += 1) {
    const decoded = decodeExtraSegment(segments[i], i);
    extraSegments.push(decoded);
  }

  const purposeRows = TCF_PURPOSES.map((purpose) => ({
    ...purpose,
    consent: core.purposesConsent.includes(purpose.id),
    legitimateInterest: core.purposesLegitimateInterest.includes(purpose.id),
  }));

  const specialFeatureRows = TCF_SPECIAL_FEATURES.map((feature) => ({
    ...feature,
    optedIn: core.specialFeatureOptIns.includes(feature.id),
  }));

  return {
    input: value,
    segmentCount: segments.length,
    core,
    purposeRows,
    specialFeatureRows,
    extraSegments,
    warnings: buildWarnings(core, extraSegments),
  };
}

/** Decode one non-core segment. The leading 3 bits identify the segment type. */
export function decodeExtraSegment(segment, index) {
  const decoded = segmentToBits(segment);
  if (decoded.error) return { index, error: `Segment ${index + 1}: ${decoded.error}` };
  const bits = decoded.bits;
  const reader = createReader(bits);
  const type = reader.int(3);
  if (type === null) return { index, error: `Segment ${index + 1} is shorter than its 3-bit type field.` };
  const meta = SEGMENT_TYPES[type] || { key: "unknown", name: `Unknown segment type ${type}` };

  if (type === 1 || type === 2) {
    const vendors = readVendorSection(reader, meta.name);
    if (vendors.error) return { index, type, name: meta.name, error: vendors.error };
    return { index, type, key: meta.key, name: meta.name, vendors, bitLength: bits.length };
  }

  if (type === 3) {
    const pubPurposesConsentBits = reader.raw(24);
    const pubPurposesLiBits = reader.raw(24);
    const numCustomPurposes = reader.int(6);
    if (pubPurposesConsentBits === null || pubPurposesLiBits === null || numCustomPurposes === null) {
      return { index, type, name: meta.name, error: "Publisher TC segment is truncated." };
    }
    const customConsentBits = reader.raw(numCustomPurposes);
    const customLiBits = reader.raw(numCustomPurposes);
    if (customConsentBits === null || customLiBits === null) {
      return { index, type, name: meta.name, error: `Publisher TC segment declares ${numCustomPurposes} custom purposes but the bits are missing.` };
    }
    return {
      index,
      type,
      key: meta.key,
      name: meta.name,
      bitLength: bits.length,
      publisherPurposesConsent: bitfieldToIds(pubPurposesConsentBits),
      publisherPurposesLegitimateInterest: bitfieldToIds(pubPurposesLiBits),
      numCustomPurposes,
      customPurposesConsent: bitfieldToIds(customConsentBits),
      customPurposesLegitimateInterest: bitfieldToIds(customLiBits),
    };
  }

  return {
    index,
    type,
    key: meta.key,
    name: meta.name,
    bitLength: bits.length,
    error: `Segment type ${type} is not defined by TCF v2.`,
  };
}

/** Flatten a decoded result into the JSON people paste into a ticket. */
export function summariseForCopy(result) {
  if (!result || result.error) return "";
  const { core } = result;
  return JSON.stringify(
    {
      tcString: result.input,
      segments: result.segmentCount,
      version: core.version,
      created: core.created.iso || null,
      lastUpdated: core.lastUpdated.iso || null,
      cmpId: core.cmpId,
      cmpVersion: core.cmpVersion,
      consentScreen: core.consentScreen,
      consentLanguage: core.consentLanguage,
      vendorListVersion: core.vendorListVersion,
      tcfPolicyVersion: core.tcfPolicyVersion,
      isServiceSpecific: core.isServiceSpecific,
      useNonStandardTexts: core.useNonStandardTexts,
      purposeOneTreatment: core.purposeOneTreatment,
      publisherCountryCode: core.publisherCountryCode,
      specialFeatureOptIns: core.specialFeatureOptIns,
      purposesConsent: core.purposesConsent,
      purposesLegitimateInterest: core.purposesLegitimateInterest,
      vendorConsent: {
        maxVendorId: core.vendorConsent.maxVendorId,
        encoding: core.vendorConsent.encoding,
        vendorCount: core.vendorConsent.count,
        ranges: core.vendorConsent.ranges,
      },
      vendorLegitimateInterest: {
        maxVendorId: core.vendorLegitimateInterest.maxVendorId,
        encoding: core.vendorLegitimateInterest.encoding,
        vendorCount: core.vendorLegitimateInterest.count,
        ranges: core.vendorLegitimateInterest.ranges,
      },
      publisherRestrictions: core.publisherRestrictions.map((item) => ({
        purposeId: item.purposeId,
        restrictionType: item.restrictionType,
        restriction: item.restrictionName,
        vendorRanges: item.ranges,
      })),
      extraSegments: result.extraSegments.map((item) => ({ type: item.type, name: item.name, error: item.error || null })),
      warnings: result.warnings.map((item) => `${item.level.toUpperCase()}: ${item.title}`),
    },
    null,
    2,
  );
}
