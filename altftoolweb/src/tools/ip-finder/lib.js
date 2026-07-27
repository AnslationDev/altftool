/**
 * IP Address Finder — pure address logic.
 *
 * Everything here is arithmetic on the address itself: parsing, prefix
 * matching against the IANA special-purpose registries, CIDR block maths and
 * reverse-DNS pointer names. No network calls, no DOM, no clock reads — the
 * page layer does the geolocation fetch and hands the payload to
 * `normaliseLookup` for display.
 *
 * Sources for the range tables:
 *   IANA IPv4 Special-Purpose Address Registry (RFC 6890 and friends)
 *   IANA IPv6 Special-Purpose Address Registry (RFC 4291, RFC 4193, RFC 3849)
 */

/** An IPv4 address is 32 bits, so 2^32 distinct addresses exist. */
export const IPV4_BITS = 32;

/** An IPv6 address is 128 bits (RFC 4291 §2). */
export const IPV6_BITS = 128;

/** 2^32 — the size of the whole IPv4 space, used for block-size maths. */
export const IPV4_SPACE = 4294967296;

/**
 * A subnet of /31 or /32 has no separate network+broadcast pair, so the
 * "usable hosts = 2^(32-prefix) - 2" rule stops applying at /31 (RFC 3021).
 */
export const SMALLEST_MULTI_HOST_PREFIX = 30;

/** IANA IPv4 Special-Purpose Address Registry — matched longest-prefix-first. */
export const IPV4_SPECIAL_RANGES = [
  { cidr: "0.0.0.0/8", label: "This network", scope: "reserved", rfc: "RFC 1122" },
  { cidr: "10.0.0.0/8", label: "Private network", scope: "private", rfc: "RFC 1918" },
  { cidr: "100.64.0.0/10", label: "Carrier-grade NAT (shared address space)", scope: "shared", rfc: "RFC 6598" },
  { cidr: "127.0.0.0/8", label: "Loopback", scope: "loopback", rfc: "RFC 1122" },
  { cidr: "169.254.0.0/16", label: "Link-local (APIPA)", scope: "link-local", rfc: "RFC 3927" },
  { cidr: "172.16.0.0/12", label: "Private network", scope: "private", rfc: "RFC 1918" },
  { cidr: "192.0.0.0/24", label: "IETF protocol assignments", scope: "reserved", rfc: "RFC 6890" },
  { cidr: "192.0.2.0/24", label: "Documentation (TEST-NET-1)", scope: "documentation", rfc: "RFC 5737" },
  { cidr: "192.88.99.0/24", label: "6to4 relay anycast (deprecated)", scope: "reserved", rfc: "RFC 7526" },
  { cidr: "192.168.0.0/16", label: "Private network", scope: "private", rfc: "RFC 1918" },
  { cidr: "198.18.0.0/15", label: "Network benchmark testing", scope: "reserved", rfc: "RFC 2544" },
  { cidr: "198.51.100.0/24", label: "Documentation (TEST-NET-2)", scope: "documentation", rfc: "RFC 5737" },
  { cidr: "203.0.113.0/24", label: "Documentation (TEST-NET-3)", scope: "documentation", rfc: "RFC 5737" },
  { cidr: "224.0.0.0/4", label: "Multicast", scope: "multicast", rfc: "RFC 5771" },
  { cidr: "240.0.0.0/4", label: "Reserved for future use", scope: "reserved", rfc: "RFC 1112" },
  { cidr: "255.255.255.255/32", label: "Limited broadcast", scope: "broadcast", rfc: "RFC 8190" },
];

/** IANA IPv6 Special-Purpose Address Registry — matched longest-prefix-first. */
export const IPV6_SPECIAL_RANGES = [
  { cidr: "::/128", label: "Unspecified address", scope: "reserved", rfc: "RFC 4291" },
  { cidr: "::1/128", label: "Loopback", scope: "loopback", rfc: "RFC 4291" },
  { cidr: "::ffff:0:0/96", label: "IPv4-mapped address", scope: "mapped", rfc: "RFC 4291" },
  { cidr: "64:ff9b::/96", label: "IPv4/IPv6 translation", scope: "reserved", rfc: "RFC 6052" },
  { cidr: "100::/64", label: "Discard-only block", scope: "reserved", rfc: "RFC 6666" },
  { cidr: "2001:db8::/32", label: "Documentation", scope: "documentation", rfc: "RFC 3849" },
  { cidr: "2002::/16", label: "6to4", scope: "reserved", rfc: "RFC 3056" },
  { cidr: "fc00::/7", label: "Unique local address (ULA)", scope: "private", rfc: "RFC 4193" },
  { cidr: "fe80::/10", label: "Link-local", scope: "link-local", rfc: "RFC 4291" },
  { cidr: "ff00::/8", label: "Multicast", scope: "multicast", rfc: "RFC 4291" },
];

/** Scopes that a packet cannot carry across the public internet. */
const NON_ROUTABLE_SCOPES = new Set([
  "private",
  "loopback",
  "link-local",
  "documentation",
  "reserved",
  "multicast",
  "broadcast",
  "shared",
]);

/* ------------------------------------------------------------------ IPv4 */

/**
 * Parse a dotted-quad IPv4 string.
 *
 * @param {string} input
 * @returns {{ octets: number[], value: number } | { error: string }}
 */
export function parseIpv4(input) {
  if (typeof input !== "string") return { error: "Enter an IP address as text." };
  const text = input.trim();
  if (!text) return { error: "Enter an IP address." };

  const parts = text.split(".");
  if (parts.length !== 4) {
    return { error: "An IPv4 address needs exactly four numbers separated by dots." };
  }

  const octets = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return { error: `"${part}" is not a number between 0 and 255.` };
    }
    const value = Number(part);
    if (value > 255) return { error: `${value} is above 255 — each IPv4 octet is one byte.` };
    octets.push(value);
  }

  // Big-endian assembly; multiplication avoids the sign flip that << 24 causes.
  const value = octets[0] * 16777216 + octets[1] * 65536 + octets[2] * 256 + octets[3];
  return { octets, value };
}

/**
 * Turn a 32-bit unsigned integer back into dotted-quad form.
 *
 * @param {number} value
 * @returns {string | null} null when the value is outside the IPv4 space
 */
export function longToIpv4(value) {
  if (!Number.isInteger(value) || value < 0 || value >= IPV4_SPACE) return null;
  return [
    Math.floor(value / 16777216) % 256,
    Math.floor(value / 65536) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
  ].join(".");
}

/* ------------------------------------------------------------------ IPv6 */

/**
 * Parse an IPv6 string (including `::` compression and IPv4-mapped tails).
 *
 * @param {string} input
 * @returns {{ groups: number[], value: bigint } | { error: string }}
 */
export function parseIpv6(input) {
  if (typeof input !== "string") return { error: "Enter an IP address as text." };
  let text = input.trim().toLowerCase();
  if (!text) return { error: "Enter an IP address." };
  if (text.startsWith("[") && text.endsWith("]")) text = text.slice(1, -1);
  // Drop any zone index such as %eth0 (RFC 4007) — it is not part of the address.
  const zoneAt = text.indexOf("%");
  if (zoneAt !== -1) text = text.slice(0, zoneAt);

  if (text.includes(".")) {
    // IPv4-mapped / IPv4-compatible tail: expand it into two hextets.
    const lastColon = text.lastIndexOf(":");
    if (lastColon === -1) return { error: "That looks like IPv4, not IPv6." };
    const v4 = parseIpv4(text.slice(lastColon + 1));
    if (v4.error) return { error: v4.error };
    const high = (v4.octets[0] * 256 + v4.octets[1]).toString(16);
    const low = (v4.octets[2] * 256 + v4.octets[3]).toString(16);
    text = `${text.slice(0, lastColon + 1)}${high}:${low}`;
  }

  const doubleColons = text.split("::").length - 1;
  if (doubleColons > 1) return { error: "An IPv6 address may contain '::' only once." };

  let head = [];
  let tail = [];
  if (doubleColons === 1) {
    const [left, right] = text.split("::");
    head = left ? left.split(":") : [];
    tail = right ? right.split(":") : [];
  } else {
    head = text.split(":");
  }

  const explicit = head.length + tail.length;
  if (explicit > 8) return { error: "An IPv6 address has at most eight groups." };
  if (doubleColons === 0 && explicit !== 8) {
    return { error: "An uncompressed IPv6 address needs exactly eight groups." };
  }

  const middle = new Array(8 - explicit).fill("0");
  const parts = [...head, ...middle, ...tail];

  const groups = [];
  for (const part of parts) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) {
      return { error: `"${part}" is not a valid IPv6 group (1–4 hex digits).` };
    }
    groups.push(parseInt(part, 16));
  }

  let value = 0n;
  for (const group of groups) value = (value << 16n) | BigInt(group);
  return { groups, value };
}

/** Full, non-compressed IPv6 text (eight four-digit hextets). */
export function expandIpv6(groups) {
  if (!Array.isArray(groups) || groups.length !== 8) return null;
  return groups.map((group) => group.toString(16).padStart(4, "0")).join(":");
}

/** RFC 5952 canonical short form: longest run of zero groups becomes `::`. */
export function compressIpv6(groups) {
  if (!Array.isArray(groups) || groups.length !== 8) return null;
  let bestStart = -1;
  let bestLength = 0;
  let runStart = -1;
  for (let index = 0; index <= 8; index += 1) {
    const isZero = index < 8 && groups[index] === 0;
    if (isZero && runStart === -1) runStart = index;
    if (!isZero && runStart !== -1) {
      const length = index - runStart;
      // RFC 5952 §4.2.2: a single zero group is written as "0", not "::".
      if (length > bestLength && length > 1) {
        bestStart = runStart;
        bestLength = length;
      }
      runStart = -1;
    }
  }
  const hex = groups.map((group) => group.toString(16));
  if (bestStart === -1) return hex.join(":");
  const left = hex.slice(0, bestStart).join(":");
  const right = hex.slice(bestStart + bestLength).join(":");
  return `${left}::${right}`;
}

/* -------------------------------------------------------- classification */

function matchesPrefixV4(value, cidr) {
  const [network, prefixText] = cidr.split("/");
  const prefix = Number(prefixText);
  const parsed = parseIpv4(network);
  if (parsed.error) return false;
  if (prefix === 0) return true;
  const blockSize = Math.pow(2, IPV4_BITS - prefix);
  const base = Math.floor(parsed.value / blockSize) * blockSize;
  return value >= base && value < base + blockSize;
}

function matchesPrefixV6(value, cidr) {
  const [network, prefixText] = cidr.split("/");
  const prefix = BigInt(prefixText);
  const parsed = parseIpv6(network);
  if (parsed.error) return false;
  if (prefix === 0n) return true;
  const shift = BigInt(IPV6_BITS) - prefix;
  return value >> shift === parsed.value >> shift;
}

/** "v4", "v6" or null. */
export function detectVersion(input) {
  if (typeof input !== "string") return null;
  const text = input.trim();
  if (!text) return null;
  if (text.includes(":")) return "v6";
  if (text.includes(".")) return "v4";
  return null;
}

/**
 * Validate an address and describe which registry block it falls in.
 *
 * @param {string} input
 * @returns {object} classification, or { error }
 */
export function classifyIp(input) {
  const version = detectVersion(input);
  if (!version) {
    return { error: "Enter an IPv4 address like 8.8.8.8 or an IPv6 address like 2001:4860:4860::8888." };
  }

  if (version === "v4") {
    const parsed = parseIpv4(input);
    if (parsed.error) return { error: parsed.error };
    const match = [...IPV4_SPECIAL_RANGES]
      .sort((a, b) => Number(b.cidr.split("/")[1]) - Number(a.cidr.split("/")[1]))
      .find((range) => matchesPrefixV4(parsed.value, range.cidr));
    const scope = match ? match.scope : "public";
    return {
      version: "IPv4",
      address: parsed.octets.join("."),
      octets: parsed.octets,
      integer: parsed.value,
      hex: `0x${parsed.value.toString(16).toUpperCase().padStart(8, "0")}`,
      binary: parsed.octets.map((octet) => octet.toString(2).padStart(8, "0")).join("."),
      scope,
      scopeLabel: match ? match.label : "Public (globally routable)",
      block: match ? match.cidr : null,
      rfc: match ? match.rfc : "RFC 791",
      isRoutable: !NON_ROUTABLE_SCOPES.has(scope),
      reversePointer: reversePointer(parsed.octets.join(".")),
    };
  }

  const parsed = parseIpv6(input);
  if (parsed.error) return { error: parsed.error };
  const match = [...IPV6_SPECIAL_RANGES]
    .sort((a, b) => Number(b.cidr.split("/")[1]) - Number(a.cidr.split("/")[1]))
    .find((range) => matchesPrefixV6(parsed.value, range.cidr));
  const scope = match ? match.scope : "public";
  const expanded = expandIpv6(parsed.groups);
  return {
    version: "IPv6",
    address: compressIpv6(parsed.groups),
    expanded,
    groups: parsed.groups,
    hex: `0x${parsed.value.toString(16).toUpperCase().padStart(32, "0")}`,
    scope,
    scopeLabel: match ? match.label : "Global unicast (routable)",
    block: match ? match.cidr : null,
    rfc: match ? match.rfc : "RFC 4291",
    isRoutable: !NON_ROUTABLE_SCOPES.has(scope) && scope !== "mapped",
    reversePointer: reversePointer(expanded),
  };
}

/* --------------------------------------------------------------- subnets */

/**
 * Network, broadcast and host counts for an IPv4 CIDR block.
 *
 * @param {string} address dotted-quad
 * @param {number} prefix 0–32
 * @returns {object} block details, or { error }
 */
export function ipv4Subnet(address, prefix) {
  const parsed = parseIpv4(address);
  if (parsed.error) return { error: parsed.error };
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > IPV4_BITS) {
    return { error: "The prefix length must be a whole number from 0 to 32." };
  }

  const blockSize = Math.pow(2, IPV4_BITS - prefix);
  const networkValue = Math.floor(parsed.value / blockSize) * blockSize;
  const broadcastValue = networkValue + blockSize - 1;
  const maskValue = IPV4_SPACE - blockSize;

  // /31 and /32 carry no network/broadcast pair (RFC 3021), so every address is usable.
  const usableHosts = prefix <= SMALLEST_MULTI_HOST_PREFIX ? blockSize - 2 : blockSize;

  return {
    cidr: `${longToIpv4(networkValue)}/${prefix}`,
    network: longToIpv4(networkValue),
    broadcast: longToIpv4(broadcastValue),
    firstHost: longToIpv4(prefix <= SMALLEST_MULTI_HOST_PREFIX ? networkValue + 1 : networkValue),
    lastHost: longToIpv4(prefix <= SMALLEST_MULTI_HOST_PREFIX ? broadcastValue - 1 : broadcastValue),
    subnetMask: longToIpv4(maskValue),
    wildcardMask: longToIpv4(blockSize - 1),
    totalAddresses: blockSize,
    usableHosts,
    prefix,
  };
}

/**
 * Reverse-DNS pointer name for an address.
 *
 * @param {string} address dotted-quad IPv4 or fully expanded IPv6
 * @returns {string | null}
 */
export function reversePointer(address) {
  if (typeof address !== "string") return null;
  if (address.includes(":")) {
    const nibbles = address.replace(/:/g, "");
    if (nibbles.length !== 32) return null;
    return `${nibbles.split("").reverse().join(".")}.ip6.arpa`;
  }
  const parsed = parseIpv4(address);
  if (parsed.error) return null;
  return `${[...parsed.octets].reverse().join(".")}.in-addr.arpa`;
}

/* ------------------------------------------------------------- geo links */

/** Latitude is ±90°, longitude ±180° (WGS 84). */
export const LAT_LIMIT = 90;
export const LON_LIMIT = 180;

/**
 * Map deep links for a coordinate pair.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {{ openStreetMap: string, googleMaps: string } | { error: string }}
 */
export function buildMapLinks(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: "No coordinates were returned for this address." };
  }
  if (Math.abs(latitude) > LAT_LIMIT || Math.abs(longitude) > LON_LIMIT) {
    return { error: "Those coordinates are outside the valid range." };
  }
  const lat = latitude.toFixed(4);
  const lon = longitude.toFixed(4);
  return {
    openStreetMap: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=11/${lat}/${lon}`,
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
  };
}

/**
 * Flatten an ipapi.co-shaped payload into the fields this tool displays.
 * Unknown or absent fields come back as null rather than undefined.
 *
 * @param {object} payload
 * @returns {object} normalised record, or { error }
 */
export function normaliseLookup(payload) {
  if (!payload || typeof payload !== "object") {
    return { error: "The lookup service returned nothing usable." };
  }
  if (payload.error) {
    return { error: typeof payload.reason === "string" ? payload.reason : "The lookup failed." };
  }

  const pick = (value) => (value === undefined || value === null || value === "" ? null : value);
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);

  return {
    ip: pick(payload.ip),
    city: pick(payload.city),
    region: pick(payload.region),
    country: pick(payload.country_name),
    countryCode: pick(payload.country_code),
    postal: pick(payload.postal),
    timezone: pick(payload.timezone),
    utcOffset: pick(payload.utc_offset),
    currency: pick(payload.currency),
    callingCode: pick(payload.country_calling_code),
    org: pick(payload.org),
    asn: pick(payload.asn),
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
  };
}
