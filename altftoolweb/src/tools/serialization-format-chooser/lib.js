/**
 * Serialization Format Chooser — weighted decision matrix over five widely used
 * serialization formats. Every fitness score below is justified by the format's
 * own specification or primary documentation:
 *
 *  - JSON: RFC 8259 (text format, human readable, no schema, no binary type —
 *    raw bytes must be base64-encoded, RFC 4648 puts that overhead at ~33%).
 *  - Protocol Buffers: protobuf language guide (tag-numbered fields give
 *    forward/backward compatibility; binary wire format; the canonical
 *    serialization for gRPC).
 *  - Apache Avro: Avro 1.11 specification (reader/writer schema resolution for
 *    evolution; no per-field tags on the wire, so encodings are very compact;
 *    Object Container Files and Kafka make it the de-facto big-data row format).
 *  - MessagePack: msgpack spec (schemaless binary, "like JSON but small",
 *    first-class bin family for raw bytes).
 *  - CBOR: RFC 8949 (schemaless binary, designed for constrained nodes; the
 *    basis of COSE (RFC 9052) and CoAP payloads in IoT stacks).
 */

/** Importance levels the user assigns to each requirement. */
export const WEIGHT_LEVELS = [
  { value: 0, label: "Not needed" },
  { value: 1, label: "Nice to have" },
  { value: 2, label: "Critical" },
];

/** Fitness scale: 0 = unsuitable … 5 = best-in-class. */
export const MAX_FITNESS = 5;

export const CRITERIA = [
  {
    id: "humanReadable",
    label: "Humans read or edit payloads",
    hint: "Debugging with curl, config files, API examples in docs.",
  },
  {
    id: "compactSize",
    label: "Smallest possible wire size",
    hint: "Bandwidth-sensitive traffic, high message volume, storage cost.",
  },
  {
    id: "schemaEvolution",
    label: "Safe schema evolution",
    hint: "Fields will be added/removed over years without breaking old readers.",
  },
  {
    id: "noSchema",
    label: "No schema management",
    hint: "Ad-hoc payloads; you do not want .proto/.avsc files or a registry.",
  },
  {
    id: "browserFriendly",
    label: "Browser / JavaScript first",
    hint: "Parsed natively or with tiny libraries in web frontends.",
  },
  {
    id: "bigDataStreaming",
    label: "Big-data files and streaming",
    hint: "Kafka topics, data-lake row files, long append-only streams.",
  },
  {
    id: "binaryData",
    label: "Raw binary payloads",
    hint: "Images, sensor blobs, embedded byte arrays without base64 bloat.",
  },
  {
    id: "rpc",
    label: "Typed RPC / service APIs",
    hint: "Strongly typed service-to-service calls, code-generated stubs.",
  },
  {
    id: "constrainedDevices",
    label: "Constrained / IoT devices",
    hint: "Microcontrollers, CoAP, COSE, tiny parsers, standards-track needs.",
  },
];

/**
 * Fitness matrix. Each number is 0..MAX_FITNESS and is tied to a documented
 * property of the format (see the header comment for sources).
 */
export const FORMATS = [
  {
    id: "json",
    name: "JSON",
    spec: "RFC 8259",
    scores: {
      humanReadable: 5, // plain UTF-8 text, readable and hand-editable
      compactSize: 1, // repeated keys + text numbers make it the largest of the five
      schemaEvolution: 2, // tolerant of unknown keys but no typed contract or defaults
      noSchema: 5, // fully self-describing, zero tooling
      browserFriendly: 5, // JSON.parse/stringify are built into every JS engine
      bigDataStreaming: 2, // NDJSON works but has no splittable container or compression blocks
      binaryData: 0, // no byte-string type; base64 adds ~33% (RFC 4648)
      rpc: 3, // ubiquitous in REST, but contracts need OpenAPI bolted on
      constrainedDevices: 1, // text parsing is heavy for microcontrollers
    },
    strengths: "Universal, human readable, zero tooling, native in browsers.",
    weaknesses: "Largest payloads; no binary type; no built-in schema contract.",
  },
  {
    id: "protobuf",
    name: "Protocol Buffers",
    spec: "protobuf.dev language guide",
    scores: {
      humanReadable: 0, // binary wire format, unreadable without the .proto
      compactSize: 4, // varint + field tags; small, though tags cost a little vs Avro
      schemaEvolution: 5, // numbered fields, unknown-field preservation, add/deprecate safely
      noSchema: 0, // .proto files and codegen are mandatory
      browserFriendly: 2, // needs protobuf-js/ts bundles; no native support
      bigDataStreaming: 2, // no standard splittable file container of its own
      binaryData: 5, // first-class `bytes` type
      rpc: 5, // the canonical IDL and payload for gRPC
      constrainedDevices: 3, // nanopb etc. run on MCUs, but codegen is required
    },
    strengths: "Best-in-class evolution guarantees and gRPC integration.",
    weaknesses: "Schema + codegen required; opaque on the wire; weak in browsers.",
  },
  {
    id: "avro",
    name: "Apache Avro",
    spec: "Avro 1.11 specification",
    scores: {
      humanReadable: 0, // binary encoding; JSON encoding exists but is not the wire default
      compactSize: 5, // no per-field tags at all — smallest typical encoding of the five
      schemaEvolution: 5, // reader/writer schema resolution with defaults and aliases
      noSchema: 0, // writer schema must travel with data or live in a registry
      browserFriendly: 1, // little browser tooling; schema resolution is server-side territory
      bigDataStreaming: 5, // Object Container Files are splittable/compressible; Kafka standard
      binaryData: 5, // first-class `bytes` and `fixed` types
      rpc: 2, // Avro RPC exists but has little ecosystem adoption
      constrainedDevices: 1, // schema-resolution runtime is heavy for MCUs
    },
    strengths: "Smallest payloads plus rigorous evolution; the big-data row format.",
    weaknesses: "Needs schema registry/distribution; almost no browser story.",
  },
  {
    id: "messagepack",
    name: "MessagePack",
    spec: "msgpack/spec.md",
    scores: {
      humanReadable: 0, // binary
      compactSize: 4, // compact type headers, but map keys are still repeated like JSON
      schemaEvolution: 2, // schemaless like JSON — no contract, same drift risks
      noSchema: 5, // self-describing, drop-in JSON replacement
      browserFriendly: 3, // small, mature @msgpack/msgpack library, ~JSON-shaped API
      bigDataStreaming: 3, // simple length-prefixed streaming, no standard container format
      binaryData: 5, // bin 8/16/32 family for raw bytes
      rpc: 2, // msgpack-rpc exists but is niche
      constrainedDevices: 3, // simple format, many C implementations
    },
    strengths: "JSON's data model at binary size with zero schema tooling.",
    weaknesses: "Keys still repeated; no evolution contract; not human readable.",
  },
  {
    id: "cbor",
    name: "CBOR",
    spec: "RFC 8949",
    scores: {
      humanReadable: 0, // binary (diagnostic notation is for docs, not the wire)
      compactSize: 4, // comparable to MessagePack; keys repeated per record
      schemaEvolution: 2, // schemaless; CDDL (RFC 8610) adds validation but not tags
      noSchema: 5, // self-describing
      browserFriendly: 3, // solid cbor JS libraries; used by WebAuthn in browsers
      bigDataStreaming: 3, // CBOR sequences (RFC 8742) stream, but no big-data container
      binaryData: 5, // major type 2 byte strings
      rpc: 1, // no mainstream RPC framework builds on CBOR
      constrainedDevices: 5, // designed for constrained nodes; basis of COSE and CoAP payloads
    },
    strengths: "IETF standards-track binary JSON; the IoT/COSE/WebAuthn choice.",
    weaknesses: "No evolution contract; niche outside IoT and security tokens.",
  },
];

/**
 * Rank the formats for a given set of requirement weights.
 *
 * @param {Object<string, number>} weights map of criterion id -> 0 | 1 | 2
 * @returns {{ranked: Array, winner: Object, maxScore: number} | {error: string}}
 */
export function chooseFormat(weights) {
  if (!weights || typeof weights !== "object") {
    return { error: "Set an importance level for at least one requirement." };
  }

  const active = CRITERIA.filter((criterion) => {
    const weight = Number(weights[criterion.id]);
    return Number.isFinite(weight) && weight > 0;
  });

  if (active.length === 0) {
    return { error: "Mark at least one requirement as more than “Not needed” to get a ranking." };
  }

  for (const criterion of active) {
    const weight = Number(weights[criterion.id]);
    if (weight < 0 || weight > 2) {
      return { error: "Importance levels must be 0 (not needed), 1 (nice to have) or 2 (critical)." };
    }
  }

  // Highest possible score: every active criterion at full fitness.
  const maxScore = active.reduce(
    (sum, criterion) => sum + Number(weights[criterion.id]) * MAX_FITNESS,
    0,
  );

  const ranked = FORMATS.map((format) => {
    let score = 0;
    const wins = [];
    const losses = [];
    for (const criterion of active) {
      const weight = Number(weights[criterion.id]);
      const fitness = format.scores[criterion.id];
      score += weight * fitness;
      // 4+ of 5 counts as a strength for this requirement, <=1 as a real gap.
      if (fitness >= 4) wins.push(criterion.label);
      else if (fitness <= 1) losses.push(criterion.label);
    }
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return {
      id: format.id,
      name: format.name,
      spec: format.spec,
      score,
      percent,
      wins,
      losses,
      strengths: format.strengths,
      weaknesses: format.weaknesses,
    };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return { ranked, winner: ranked[0], maxScore, activeCount: active.length };
}
