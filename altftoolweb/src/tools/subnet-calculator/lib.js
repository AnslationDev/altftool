/**
 * IPv4 Subnet Calculator — pure arithmetic over 32-bit addresses.
 *
 * RULES IMPLEMENTED
 *   RFC 791    IPv4 addresses are 32 bits, written as four dotted decimal octets 0-255.
 *   RFC 4632   Classless Inter-Domain Routing: a prefix length /0../32 marks how many
 *              leading bits are the network part. mask = (0xFFFFFFFF << (32 - prefix)).
 *              network   = address AND mask
 *              broadcast = network OR NOT mask
 *   RFC 1812   In a normal subnet the all-zeros host is the network address and the
 *              all-ones host is the directed broadcast, so usable hosts = 2^h - 2.
 *   RFC 3021   A /31 has no network or broadcast address; both addresses are usable on a
 *              point-to-point link, so a /31 gives 2 usable hosts, not 0.
 *              A /32 is a single host route: 1 usable address.
 *   RFC 1918   Private space: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.
 *   RFC 6598   Shared address space for carrier NAT: 100.64.0.0/10.
 *   RFC 3927   Link-local (APIPA): 169.254.0.0/16.
 *   RFC 1122   Loopback: 127.0.0.0/8.  "This network": 0.0.0.0/8.
 *   RFC 5771   Multicast (old class D): 224.0.0.0/4.  RFC 1112 reserved: 240.0.0.0/4.
 *   RFC 791    Classful first-octet ranges, kept because people still ask for them:
 *              A 0-127 (/8), B 128-191 (/16), C 192-223 (/24), D 224-239, E 240-255.
 *
 * Pure module: no clock, no DOM, no network. Numbers in, numbers out.
 * All 32-bit maths is done with >>> 0 so JavaScript's signed bit operators never
 * produce a negative address.
 */

/** IPv4 is 32 bits wide (RFC 791). */
export const IPV4_BITS = 32;

/** Largest unsigned value a 32-bit address can hold. */
export const IPV4_MAX = 0xffffffff;

/** Prefix at which RFC 3021 point-to-point rules replace the network/broadcast pair. */
export const POINT_TO_POINT_PREFIX = 31;

/** Prefix of a single-host route. */
export const HOST_ROUTE_PREFIX = 32;

/** Special-purpose blocks, each as [first octet path, prefix, label, reference]. */
export const SPECIAL_BLOCKS = [
  ["0.0.0.0", 8, '"This network"', "RFC 1122"],
  ["10.0.0.0", 8, "Private", "RFC 1918"],
  ["100.64.0.0", 10, "Carrier-grade NAT (shared)", "RFC 6598"],
  ["127.0.0.0", 8, "Loopback", "RFC 1122"],
  ["169.254.0.0", 16, "Link-local (APIPA)", "RFC 3927"],
  ["172.16.0.0", 12, "Private", "RFC 1918"],
  ["192.0.2.0", 24, "Documentation (TEST-NET-1)", "RFC 5737"],
  ["192.168.0.0", 16, "Private", "RFC 1918"],
  ["198.18.0.0", 15, "Benchmarking", "RFC 2544"],
  ["198.51.100.0", 24, "Documentation (TEST-NET-2)", "RFC 5737"],
  ["203.0.113.0", 24, "Documentation (TEST-NET-3)", "RFC 5737"],
  ["224.0.0.0", 4, "Multicast", "RFC 5771"],
  ["240.0.0.0", 4, "Reserved", "RFC 1112"],
];

/** Classful first-octet ranges from RFC 791, as [low, high, class, defaultPrefix]. */
export const CLASSFUL_RANGES = [
  [0, 127, "A", 8],
  [128, 191, "B", 16],
  [192, 223, "C", 24],
  [224, 239, "D (multicast)", null],
  [240, 255, "E (reserved)", null],
];

/**
 * Parse a dotted-decimal IPv4 string into an unsigned 32-bit integer.
 * Returns null when the text is not exactly four octets of 0-255.
 */
export function parseIPv4(text) {
  if (typeof text !== "string") return null;
  const parts = text.trim().split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

/** Render an unsigned 32-bit integer as dotted decimal. */
export function formatIPv4(value) {
  const v = value >>> 0;
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].join(".");
}

/** Render an unsigned 32-bit integer as four dotted groups of 8 binary digits. */
export function formatBinary(value) {
  const v = value >>> 0;
  return [(v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]
    .map((o) => o.toString(2).padStart(8, "0"))
    .join(".");
}

/** Build the 32-bit netmask for a prefix length. prefix 0 must not shift by 32. */
export function maskFromPrefix(prefix) {
  if (prefix <= 0) return 0;
  if (prefix >= IPV4_BITS) return IPV4_MAX;
  return ((IPV4_MAX << (IPV4_BITS - prefix)) & IPV4_MAX) >>> 0;
}

/**
 * Convert a dotted netmask to a prefix length.
 * Only contiguous masks are valid (RFC 4632), so 255.255.0.255 is rejected.
 */
export function prefixFromMask(maskValue) {
  const m = maskValue >>> 0;
  let prefix = 0;
  let seenZero = false;
  for (let bit = IPV4_BITS - 1; bit >= 0; bit -= 1) {
    const isOne = ((m >>> bit) & 1) === 1;
    if (isOne) {
      if (seenZero) return null; // a 1 after a 0 means the mask is not contiguous
      prefix += 1;
    } else {
      seenZero = true;
    }
  }
  return prefix;
}

/** Which special-purpose block, if any, contains this address. */
export function classifyAddress(value) {
  const v = value >>> 0;
  for (const [base, prefix, label, reference] of SPECIAL_BLOCKS) {
    const baseValue = parseIPv4(base);
    const mask = maskFromPrefix(prefix);
    if (((v & mask) >>> 0) === ((baseValue & mask) >>> 0)) {
      return { scope: label, block: `${base}/${prefix}`, reference };
    }
  }
  return { scope: "Public", block: null, reference: "RFC 1918 / RFC 6890 by exclusion" };
}

/** Classful letter and its historic default prefix, from the first octet. */
export function classfulInfo(value) {
  const firstOctet = (value >>> 24) & 255;
  for (const [low, high, letter, defaultPrefix] of CLASSFUL_RANGES) {
    if (firstOctet >= low && firstOctet <= high) {
      return { class: letter, defaultPrefix };
    }
  }
  return { class: "unknown", defaultPrefix: null };
}

/**
 * Usable host count for a prefix, applying the RFC 3021 and host-route exceptions.
 * Returned as a Number; 2^32 is exactly representable so this never loses precision.
 */
export function usableHosts(prefix) {
  const hostBits = IPV4_BITS - prefix;
  const total = Math.pow(2, hostBits);
  if (prefix === HOST_ROUTE_PREFIX) return 1; // single host route
  if (prefix === POINT_TO_POINT_PREFIX) return 2; // RFC 3021: both addresses usable
  return total - 2; // network address + directed broadcast are not assignable
}

/**
 * Main entry point.
 *
 * @param {object} input
 * @param {string} input.address  dotted-decimal IPv4, optionally with "/prefix" appended
 * @param {number|string} [input.prefix]  prefix length 0-32, used when address has no /n
 * @param {string} [input.mask]   dotted netmask, an alternative to prefix
 * @returns {object} the full subnet breakdown, or { error }
 */
export function calculateSubnet(input) {
  const raw = input && typeof input.address === "string" ? input.address.trim() : "";
  if (!raw) return { error: "Enter an IPv4 address, for example 192.168.1.10." };

  let addressText = raw;
  let prefix = null;

  const slash = raw.indexOf("/");
  if (slash !== -1) {
    addressText = raw.slice(0, slash).trim();
    const suffix = raw.slice(slash + 1).trim();
    if (/^\d{1,2}$/.test(suffix)) {
      prefix = Number(suffix);
    } else {
      const suffixMask = parseIPv4(suffix);
      if (suffixMask === null)
        return { error: `"${suffix}" is not a prefix length or a netmask.` };
      prefix = prefixFromMask(suffixMask);
      if (prefix === null)
        return { error: `${suffix} is not a valid netmask — mask bits must be contiguous.` };
    }
  }

  const address = parseIPv4(addressText);
  if (address === null)
    return { error: `"${addressText}" is not a valid IPv4 address (four octets, each 0-255).` };

  if (prefix === null && input && input.mask) {
    const maskValue = parseIPv4(String(input.mask));
    if (maskValue === null) return { error: `"${input.mask}" is not a valid netmask.` };
    prefix = prefixFromMask(maskValue);
    if (prefix === null)
      return { error: `${input.mask} is not a valid netmask — mask bits must be contiguous.` };
  }

  if (prefix === null && input && input.prefix !== undefined && input.prefix !== "") {
    prefix = Number(input.prefix);
  }

  if (prefix === null) return { error: "Enter a prefix length (0-32) or a netmask." };
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > IPV4_BITS)
    return { error: "Prefix length must be a whole number between 0 and 32." };

  const mask = maskFromPrefix(prefix);
  const wildcard = (~mask & IPV4_MAX) >>> 0;
  const network = (address & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const hostBits = IPV4_BITS - prefix;
  const totalAddresses = Math.pow(2, hostBits);
  const hosts = usableHosts(prefix);

  let firstHost;
  let lastHost;
  if (prefix >= POINT_TO_POINT_PREFIX) {
    // /31 and /32 have no reserved network or broadcast address.
    firstHost = network;
    lastHost = broadcast;
  } else {
    firstHost = (network + 1) >>> 0;
    lastHost = (broadcast - 1) >>> 0;
  }

  const scope = classifyAddress(address);
  const klass = classfulInfo(address);

  return {
    address: formatIPv4(address),
    addressInt: address,
    prefix,
    cidr: `${formatIPv4(network)}/${prefix}`,
    netmask: formatIPv4(mask),
    wildcard: formatIPv4(wildcard),
    network: formatIPv4(network),
    broadcast: prefix >= POINT_TO_POINT_PREFIX ? null : formatIPv4(broadcast),
    firstHost: formatIPv4(firstHost),
    lastHost: formatIPv4(lastHost),
    hostBits,
    totalAddresses,
    usableHosts: hosts,
    addressBinary: formatBinary(address),
    maskBinary: formatBinary(mask),
    networkBinary: formatBinary(network),
    isNetworkAddress: prefix < POINT_TO_POINT_PREFIX && address === network,
    isBroadcastAddress: prefix < POINT_TO_POINT_PREFIX && address === broadcast,
    scope: scope.scope,
    scopeBlock: scope.block,
    scopeReference: scope.reference,
    class: klass.class,
    classDefaultPrefix: klass.defaultPrefix,
    note:
      prefix === HOST_ROUTE_PREFIX
        ? "A /32 is a single host route — one address, no network or broadcast."
        : prefix === POINT_TO_POINT_PREFIX
          ? "RFC 3021: a /31 point-to-point link has no network or broadcast address, so both addresses are usable."
          : null,
  };
}

/** Upper bound on how many child subnets this tool will enumerate at once. */
export const MAX_SPLIT_ROWS = 256;

/**
 * Split a parent block into equal child subnets of a longer prefix.
 * Returns { error } when the new prefix is not longer, or the split is too large to list.
 */
export function splitSubnet(input, newPrefix) {
  const parent = calculateSubnet(input);
  if (parent.error) return parent;

  const target = Number(newPrefix);
  if (!Number.isInteger(target) || target < 0 || target > IPV4_BITS)
    return { error: "Split prefix must be a whole number between 0 and 32." };
  if (target <= parent.prefix)
    return { error: `Split prefix must be longer than /${parent.prefix}.` };

  const count = Math.pow(2, target - parent.prefix);
  if (count > MAX_SPLIT_ROWS)
    return {
      error: `Splitting /${parent.prefix} into /${target} makes ${count.toLocaleString(
        "en-US",
      )} subnets — more than the ${MAX_SPLIT_ROWS} this tool lists at once.`,
    };

  const step = Math.pow(2, IPV4_BITS - target);
  const base = parseIPv4(parent.network);
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const start = (base + i * step) >>> 0;
    const end = (start + step - 1) >>> 0;
    rows.push({
      cidr: `${formatIPv4(start)}/${target}`,
      network: formatIPv4(start),
      broadcast: target >= POINT_TO_POINT_PREFIX ? null : formatIPv4(end),
      firstHost: formatIPv4(target >= POINT_TO_POINT_PREFIX ? start : (start + 1) >>> 0),
      lastHost: formatIPv4(target >= POINT_TO_POINT_PREFIX ? end : (end - 1) >>> 0),
      usableHosts: usableHosts(target),
    });
  }
  return { parent, prefix: target, count, subnets: rows };
}
