/**
 * CIDR <-> IP range <-> wildcard mask converter.
 *
 * Rules:
 *  - CIDR notation per RFC 4632: address + prefix length 0–32.
 *  - Wildcard masks (Cisco ACL style) are the bitwise inverse of the netmask;
 *    a wildcard maps to a single CIDR only when (wildcard + 1) is a power of
 *    two AND the address is aligned to that block size.
 *  - An arbitrary start–end range is decomposed into the minimal list of CIDR
 *    blocks with the standard greedy algorithm: at each step emit the largest
 *    block that (a) starts at the current address (alignment: the block size
 *    cannot exceed the lowest set bit of the start) and (b) fits in the
 *    remaining range.
 */

export const IPV4_BITS = 32;
/** Total IPv4 space, 2^32. */
export const IPV4_SPACE = 2 ** IPV4_BITS;

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

/** Netmask for a prefix length; /0 special-cased (32-bit shift is a JS no-op). */
export function maskForPrefix(prefix) {
  return prefix === 0 ? 0 : (0xffffffff << (IPV4_BITS - prefix)) >>> 0;
}

/** Wildcard (inverse) mask for a prefix length. */
export function wildcardForPrefix(prefix) {
  return ~maskForPrefix(prefix) >>> 0;
}

/**
 * Decompose an inclusive [start, end] range into the minimal CIDR list
 * (greedy largest-aligned-block algorithm).
 */
export function rangeToCidrs(start, end) {
  const cidrs = [];
  let cursor = start;
  while (cursor <= end) {
    // Alignment limit: the block starting at cursor cannot be larger than the
    // lowest set bit of cursor (cursor 0 is aligned to the whole space).
    const alignSize = cursor === 0 ? IPV4_SPACE : (cursor & (~cursor + 1)) >>> 0;
    // Size limit: the block cannot exceed the remaining range.
    const remaining = end - cursor + 1;
    let blockSize = alignSize;
    while (blockSize > remaining) blockSize /= 2;
    const prefix = IPV4_BITS - Math.round(Math.log2(blockSize));
    cidrs.push(`${ipToString(cursor)}/${prefix}`);
    cursor += blockSize;
  }
  return cidrs;
}

/**
 * Parse one line into { start, end } plus a note of the detected format.
 * Supported: "10.0.0.0/24" · "10.0.0.5 - 10.0.0.16" · "172.16.5.0 0.0.0.255"
 * (address + wildcard mask) · bare "10.0.0.5".
 * @returns {{start:number,end:number,format:string}|{lineError:string}}
 */
export function parseFlexibleLine(line) {
  const text = line.trim();
  if (text === "") return { lineError: "empty" };

  const cidrMatch = /^([0-9.]+)\/(\d{1,2})$/.exec(text);
  if (cidrMatch) {
    const ip = parseIpv4(cidrMatch[1]);
    const prefix = Number(cidrMatch[2]);
    if (ip === null || prefix > IPV4_BITS) return { lineError: `"${text}" is not a valid CIDR block.` };
    const mask = maskForPrefix(prefix);
    const start = (ip & mask) >>> 0;
    return { start, end: (start | (~mask >>> 0)) >>> 0, format: "CIDR" };
  }

  const rangeMatch = /^([0-9.]+)\s*[-–]\s*([0-9.]+)$/.exec(text);
  if (rangeMatch) {
    const start = parseIpv4(rangeMatch[1]);
    const end = parseIpv4(rangeMatch[2]);
    if (start === null || end === null) return { lineError: `"${text}" is not a valid start-end range.` };
    if (start > end) return { lineError: `"${text}" runs backwards — start is after end.` };
    return { start, end, format: "Range" };
  }

  const wildcardMatch = /^([0-9.]+)\s+([0-9.]+)$/.exec(text);
  if (wildcardMatch) {
    const ip = parseIpv4(wildcardMatch[1]);
    const wildcard = parseIpv4(wildcardMatch[2]);
    if (ip === null || wildcard === null) {
      return { lineError: `"${text}" is not a valid address + wildcard mask pair.` };
    }
    // Contiguous wildcard <=> wildcard + 1 is a power of two.
    const size = wildcard + 1;
    if ((size & (size - 1)) !== 0 && wildcard !== 0xffffffff) {
      return {
        lineError: `Wildcard ${ipToString(wildcard)} is non-contiguous — it matches a scattered set, not one CIDR block.`,
      };
    }
    const start = (ip & ~wildcard) >>> 0;
    return { start, end: (start | wildcard) >>> 0, format: "Wildcard" };
  }

  const single = parseIpv4(text);
  if (single !== null) return { start: single, end: single, format: "Single IP" };

  return { lineError: `"${text}" is not a CIDR block, range, wildcard pair or address.` };
}

/**
 * Convert every input line into all three representations.
 *
 * @param {object} input
 * @param {string} input.text one entry per line
 * @returns {{results:Array<{input:string,format:string,start:string,end:string,size:number,cidrs:string[],wildcard:string|null}>, lineErrors:string[]}|{error:string}}
 */
export function convertLines({ text }) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Enter at least one CIDR block, IP range or wildcard entry — one per line." };
  }
  /** Keep bulk runs instant in the browser. */
  const MAX_LINES = 500;

  const lines = text.split("\n");
  if (lines.length > MAX_LINES) {
    return { error: `Too many lines — the converter caps at ${MAX_LINES} per run.` };
  }

  const results = [];
  const lineErrors = [];
  for (const line of lines) {
    const parsed = parseFlexibleLine(line);
    if (parsed.lineError) {
      if (parsed.lineError !== "empty") lineErrors.push(parsed.lineError);
      continue;
    }
    const { start, end, format } = parsed;
    const cidrs = rangeToCidrs(start, end);
    // A single-CIDR result also has an exact wildcard representation.
    let wildcard = null;
    if (cidrs.length === 1) {
      const prefix = Number(cidrs[0].split("/")[1]);
      wildcard = `${ipToString(start)} ${ipToString(wildcardForPrefix(prefix))}`;
    }
    results.push({
      input: line.trim(),
      format,
      start: ipToString(start),
      end: ipToString(end),
      size: end - start + 1,
      cidrs,
      wildcard,
    });
  }

  if (results.length === 0) {
    return {
      error:
        lineErrors.length > 0
          ? `No valid entries found. ${lineErrors[0]}`
          : "Enter at least one valid entry.",
    };
  }

  return { results, lineErrors };
}
