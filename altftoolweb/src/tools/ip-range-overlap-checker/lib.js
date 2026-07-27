/**
 * IPv4 range overlap checker.
 *
 * Accepts CIDR blocks (RFC 4632), explicit start-end ranges and single
 * addresses. Two inclusive ranges [aStart, aEnd] and [bStart, bEnd] overlap
 * iff aStart <= bEnd AND bStart <= aEnd — the standard interval-intersection
 * test. Overlaps are further classified as identical, containment or partial.
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

/** Netmask for a prefix length; /0 special-cased (32-bit shift is a JS no-op). */
export function maskForPrefix(prefix) {
  return prefix === 0 ? 0 : (0xffffffff << (IPV4_BITS - prefix)) >>> 0;
}

/**
 * Parse one line into an inclusive range.
 * Supported: "10.0.0.0/24", "10.0.0.1 - 10.0.0.99", "10.0.0.5".
 * @returns {{label:string,start:number,end:number}|{lineError:string}}
 */
export function parseRangeLine(line) {
  const text = line.trim();
  if (text === "") return { lineError: "empty" };

  const cidrMatch = /^([0-9.]+)\/(\d{1,2})$/.exec(text);
  if (cidrMatch) {
    const ip = parseIpv4(cidrMatch[1]);
    const prefix = Number(cidrMatch[2]);
    if (ip === null || prefix > IPV4_BITS) {
      return { lineError: `"${text}" is not a valid CIDR block.` };
    }
    const mask = maskForPrefix(prefix);
    const start = (ip & mask) >>> 0;
    const end = (start | (~mask >>> 0)) >>> 0;
    return { label: `${ipToString(start)}/${prefix}`, start, end };
  }

  const rangeMatch = /^([0-9.]+)\s*[-–]\s*([0-9.]+)$/.exec(text);
  if (rangeMatch) {
    const start = parseIpv4(rangeMatch[1]);
    const end = parseIpv4(rangeMatch[2]);
    if (start === null || end === null) {
      return { lineError: `"${text}" is not a valid start-end range.` };
    }
    if (start > end) {
      return { lineError: `"${text}" runs backwards — the start address is after the end.` };
    }
    return { label: `${ipToString(start)}-${ipToString(end)}`, start, end };
  }

  const single = parseIpv4(text);
  if (single !== null) {
    return { label: ipToString(single), start: single, end: single };
  }

  return { lineError: `"${text}" is not a CIDR block, IP range or address.` };
}

/** Classify the relationship between two overlapping inclusive ranges. */
export function classifyOverlap(a, b) {
  if (a.start === b.start && a.end === b.end) return "identical";
  if (a.start <= b.start && a.end >= b.end) return `${a.label} contains ${b.label}`;
  if (b.start <= a.start && b.end >= a.end) return `${b.label} contains ${a.label}`;
  return "partial overlap";
}

/**
 * Check every pair of entries for overlap.
 *
 * @param {object} input
 * @param {string} input.text  one CIDR / range / IP per line
 * @returns {{entries:Array<{label:string,start:string,end:string,size:number}>, overlaps:Array<{a:string,b:string,relation:string,overlapStart:string,overlapEnd:string,overlapSize:number}>, lineErrors:string[], pairsChecked:number}|{error:string}}
 */
export function checkOverlaps({ text }) {
  if (typeof text !== "string" || text.trim() === "") {
    return { error: "Enter at least two CIDR blocks, ranges or addresses — one per line." };
  }
  /** Cap to keep the O(n^2) pair scan instant in the browser. */
  const MAX_ENTRIES = 500;

  const lines = text.split("\n");
  const entries = [];
  const lineErrors = [];
  for (const line of lines) {
    const parsed = parseRangeLine(line);
    if (parsed.lineError) {
      if (parsed.lineError !== "empty") lineErrors.push(parsed.lineError);
      continue;
    }
    entries.push(parsed);
  }
  if (entries.length > MAX_ENTRIES) {
    return { error: `Too many entries — the checker caps at ${MAX_ENTRIES} lines per run.` };
  }
  if (entries.length < 2) {
    return {
      error:
        lineErrors.length > 0
          ? `Need at least two valid entries to compare. ${lineErrors[0]}`
          : "Enter at least two entries to compare.",
    };
  }

  const overlaps = [];
  let pairsChecked = 0;
  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      pairsChecked += 1;
      const a = entries[i];
      const b = entries[j];
      // interval intersection test on inclusive ranges
      if (a.start <= b.end && b.start <= a.end) {
        const overlapStart = Math.max(a.start, b.start);
        const overlapEnd = Math.min(a.end, b.end);
        overlaps.push({
          a: a.label,
          b: b.label,
          relation: classifyOverlap(a, b),
          overlapStart: ipToString(overlapStart),
          overlapEnd: ipToString(overlapEnd),
          overlapSize: overlapEnd - overlapStart + 1,
        });
      }
    }
  }

  return {
    entries: entries.map((entry) => ({
      label: entry.label,
      start: ipToString(entry.start),
      end: ipToString(entry.end),
      size: entry.end - entry.start + 1,
    })),
    overlaps,
    lineErrors,
    pairsChecked,
  };
}
