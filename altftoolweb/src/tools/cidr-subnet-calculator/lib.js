/**
 * IPv4 CIDR subnet calculator.
 *
 * Rules implemented:
 *  - CIDR addressing per RFC 4632: an IPv4 address plus a prefix length 0–32.
 *  - Usable hosts in a subnet = 2^(32-prefix) − 2 (network + broadcast
 *    addresses are reserved) for prefixes up to /30.
 *  - /31 point-to-point links have 2 usable addresses and no broadcast
 *    (RFC 3021).
 *  - /32 is a single host route: 1 address, no network/broadcast pair.
 *  - Private ranges per RFC 1918: 10/8, 172.16/12, 192.168/16;
 *    loopback 127/8 (RFC 1122); link-local 169.254/16 (RFC 3927);
 *    CGN 100.64/10 (RFC 6598); multicast 224/4 (RFC 5771).
 */

export const IPV4_BITS = 32;

/** Parse dotted-quad IPv4 into an unsigned 32-bit int, or null when invalid. */
export function parseIpv4(text) {
  if (typeof text !== "string") return null;
  const parts = text.trim().split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = ((value << 8) | octet) >>> 0;
  }
  return value;
}

/** Render an unsigned 32-bit int as dotted-quad. */
export function ipToString(value) {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ].join(".");
}

/** Netmask for a prefix length (0–32) as an unsigned 32-bit int. */
export function maskForPrefix(prefix) {
  // A 32-bit shift is a no-op in JS, so /0 must be special-cased.
  return prefix === 0 ? 0 : (0xffffffff << (IPV4_BITS - prefix)) >>> 0;
}

/** Parse "a.b.c.d/p". Returns { ip, prefix } or null. */
export function parseCidr(text) {
  if (typeof text !== "string") return null;
  const match = /^\s*([0-9.]+)\/(\d{1,2})\s*$/.exec(text);
  if (!match) return null;
  const ip = parseIpv4(match[1]);
  const prefix = Number(match[2]);
  if (ip === null || prefix > IPV4_BITS) return null;
  return { ip, prefix };
}

/** Classify an address against the well-known reserved ranges. */
export function classifyAddress(ip) {
  const inBlock = (base, prefix) => (ip & maskForPrefix(prefix)) >>> 0 === base;
  if (inBlock(parseIpv4("10.0.0.0"), 8)) return "Private (RFC 1918, 10/8)";
  if (inBlock(parseIpv4("172.16.0.0"), 12)) return "Private (RFC 1918, 172.16/12)";
  if (inBlock(parseIpv4("192.168.0.0"), 16)) return "Private (RFC 1918, 192.168/16)";
  if (inBlock(parseIpv4("127.0.0.0"), 8)) return "Loopback (RFC 1122)";
  if (inBlock(parseIpv4("169.254.0.0"), 16)) return "Link-local (RFC 3927)";
  if (inBlock(parseIpv4("100.64.0.0"), 10)) return "Carrier-grade NAT (RFC 6598)";
  if (inBlock(parseIpv4("224.0.0.0"), 4)) return "Multicast (RFC 5771)";
  return "Public / globally routable";
}

/**
 * Compute the full subnet breakdown for a CIDR block.
 *
 * @param {object} input
 * @param {string} input.cidr  e.g. "192.168.1.130/26"
 * @returns {object|{error:string}}
 */
export function computeSubnet({ cidr }) {
  const parsed = parseCidr(cidr ?? "");
  if (!parsed) {
    return { error: "Enter a valid IPv4 CIDR block like 192.168.1.0/24 (prefix 0–32)." };
  }
  const { ip, prefix } = parsed;
  const mask = maskForPrefix(prefix);
  const wildcard = ~mask >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (IPV4_BITS - prefix);

  let usableHosts;
  let firstUsable;
  let lastUsable;
  let hostNote;
  if (prefix === IPV4_BITS) {
    // /32 host route
    usableHosts = 1;
    firstUsable = network;
    lastUsable = network;
    hostNote = "/32 is a single host route — no network or broadcast address.";
  } else if (prefix === IPV4_BITS - 1) {
    // /31 point-to-point (RFC 3021): both addresses usable, no broadcast
    usableHosts = 2;
    firstUsable = network;
    lastUsable = broadcast;
    hostNote = "/31 point-to-point per RFC 3021 — both addresses are usable, none is broadcast.";
  } else {
    usableHosts = totalAddresses - 2;
    firstUsable = (network + 1) >>> 0;
    lastUsable = (broadcast - 1) >>> 0;
    hostNote = "Network and broadcast addresses are reserved, leaving 2^(32-prefix) - 2 hosts.";
  }

  return {
    inputIp: ipToString(ip),
    prefix,
    network: ipToString(network),
    broadcast: prefix >= IPV4_BITS - 1 ? null : ipToString(broadcast),
    netmask: ipToString(mask),
    wildcardMask: ipToString(wildcard),
    firstUsable: ipToString(firstUsable),
    lastUsable: ipToString(lastUsable),
    totalAddresses,
    usableHosts,
    hostNote,
    addressClass: classifyAddress(network),
    normalizedCidr: `${ipToString(network)}/${prefix}`,
    hostBits: IPV4_BITS - prefix,
  };
}
