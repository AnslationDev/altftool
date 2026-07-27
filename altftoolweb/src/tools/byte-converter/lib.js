/**
 * Byte Converter — pure logic.
 *
 * Two prefix systems, deliberately kept apart:
 *
 *  - SI decimal prefixes (kB, MB, GB, TB, PB) are powers of 1000. This is what
 *    IEC 80000-13 and the SI brochure define, and what drive manufacturers,
 *    network equipment and macOS/iOS use when they print a capacity.
 *  - IEC binary prefixes (KiB, MiB, GiB, TiB, PiB) are powers of 1024, defined
 *    by IEC 60027-2 / IEC 80000-13 precisely so that "1024 bytes" has a name
 *    that is not "kilobyte". Windows, Linux `ls -h` and most RAM specs use
 *    these magnitudes, though Windows still labels them KB/MB/GB.
 *
 * That mismatch is the whole reason a "1 TB" drive shows as 931 GB in Windows:
 * 1_000_000_000_000 / 1024^4 = 0.9095 TiB = 931.32 GiB.
 *
 * Bits are included because link speeds are quoted in bits per second.
 * 1 byte = 8 bits (an octet), fixed by IEC 80000-13.
 */

/** Bits in one byte. IEC 80000-13 defines the byte as an 8-bit octet. */
export const BITS_PER_BYTE = 8;

/** SI decimal step: 1000. */
const SI = 1000;
/** IEC binary step: 1024 (2^10). */
const IEC = 1024;

/**
 * Every supported unit, expressed as how many bytes one of it is worth.
 * `group` drives the grouping in the UI's unit menus.
 */
export const BYTE_UNITS = [
  { id: "bit", label: "bit (b)", group: "Bits", bytes: 1 / BITS_PER_BYTE },
  { id: "kbit", label: "kilobit (kb)", group: "Bits", bytes: SI / BITS_PER_BYTE },
  { id: "Mbit", label: "megabit (Mb)", group: "Bits", bytes: SI ** 2 / BITS_PER_BYTE },
  { id: "Gbit", label: "gigabit (Gb)", group: "Bits", bytes: SI ** 3 / BITS_PER_BYTE },

  { id: "B", label: "byte (B)", group: "Decimal (×1000)", bytes: 1 },
  { id: "kB", label: "kilobyte (kB)", group: "Decimal (×1000)", bytes: SI },
  { id: "MB", label: "megabyte (MB)", group: "Decimal (×1000)", bytes: SI ** 2 },
  { id: "GB", label: "gigabyte (GB)", group: "Decimal (×1000)", bytes: SI ** 3 },
  { id: "TB", label: "terabyte (TB)", group: "Decimal (×1000)", bytes: SI ** 4 },
  { id: "PB", label: "petabyte (PB)", group: "Decimal (×1000)", bytes: SI ** 5 },

  { id: "KiB", label: "kibibyte (KiB)", group: "Binary (×1024)", bytes: IEC },
  { id: "MiB", label: "mebibyte (MiB)", group: "Binary (×1024)", bytes: IEC ** 2 },
  { id: "GiB", label: "gibibyte (GiB)", group: "Binary (×1024)", bytes: IEC ** 3 },
  { id: "TiB", label: "tebibyte (TiB)", group: "Binary (×1024)", bytes: IEC ** 4 },
  { id: "PiB", label: "pebibyte (PiB)", group: "Binary (×1024)", bytes: IEC ** 5 },
];

const UNIT_BY_ID = new Map(BYTE_UNITS.map((unit) => [unit.id, unit]));

/**
 * Largest value accepted, in bytes: 2^53 − 1, the last integer JavaScript's
 * Number can represent exactly. Past this, conversions silently lose digits,
 * so the tool refuses rather than printing a wrong figure.
 */
export const MAX_SAFE_BYTES = Number.MAX_SAFE_INTEGER;

/** Ordered unit ids for the "human readable" ladder, decimal and binary. */
const DECIMAL_LADDER = ["B", "kB", "MB", "GB", "TB", "PB"];
const BINARY_LADDER = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

/** Look up a unit descriptor by id, or `undefined`. */
export function getUnit(id) {
  return UNIT_BY_ID.get(id);
}

/**
 * Convert `value` of unit `from` into every supported unit.
 *
 * @param {{ value: number|string, from: string }} input
 * @returns {{ error: string } | { bytes: number, from: object, results: Array<{id,label,group,value}> }}
 */
export function convertBytes({ value, from = "B" } = {}) {
  const unit = UNIT_BY_ID.get(from);
  if (!unit) return { error: `Unknown unit "${from}".` };

  const raw = typeof value === "string" ? value.trim() : value;
  if (raw === "" || raw === null || raw === undefined) {
    return { error: "Enter a size to convert." };
  }

  const amount = Number(raw);
  if (!Number.isFinite(amount)) {
    return { error: "Enter a number — letters and symbols cannot be converted." };
  }
  if (amount < 0) {
    return { error: "A size cannot be negative." };
  }

  const bytes = amount * unit.bytes;
  if (bytes > MAX_SAFE_BYTES) {
    return {
      error:
        "That is larger than 9 petabytes (2^53 bytes), past the point where the result would still be exact.",
    };
  }

  return {
    bytes,
    from: unit,
    results: BYTE_UNITS.map((target) => ({
      id: target.id,
      label: target.label,
      group: target.group,
      value: bytes / target.bytes,
    })),
  };
}

/**
 * Convert a single value between two units.
 * @returns {{ error: string } | { value: number }}
 */
export function convertUnit(value, from, to) {
  const target = UNIT_BY_ID.get(to);
  if (!target) return { error: `Unknown unit "${to}".` };
  const converted = convertBytes({ value, from });
  if (converted.error) return converted;
  return { value: converted.bytes / target.bytes };
}

/**
 * Pick the largest unit on the chosen ladder that leaves a value >= 1, the way
 * `ls -h` and file managers do. 0 bytes stays "0 B".
 *
 * @param {number} bytes
 * @param {{ binary?: boolean, decimals?: number }} options
 * @returns {{ error: string } | { value: number, unit: string, text: string }}
 */
export function humanizeBytes(bytes, { binary = true, decimals = 2 } = {}) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return { error: "Enter a size of zero or more bytes." };
  }
  const ladder = binary ? BINARY_LADDER : DECIMAL_LADDER;
  let index = 0;
  while (
    index < ladder.length - 1 &&
    bytes >= UNIT_BY_ID.get(ladder[index + 1]).bytes
  ) {
    index += 1;
  }
  const unitId = ladder[index];
  const value = bytes / UNIT_BY_ID.get(unitId).bytes;
  const rounded = Number(value.toFixed(decimals));
  return { value: rounded, unit: unitId, text: `${rounded} ${unitId}` };
}

/**
 * How long `bytes` takes to move over a link quoted in megabits per second —
 * the reason bits and bytes both live in this tool. 100 Mbps moves
 * 100_000_000 / 8 = 12.5 MB every second.
 *
 * @returns {{ error: string } | { seconds: number }}
 */
export function transferSeconds(bytes, megabitsPerSecond) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return { error: "Enter a size of zero or more bytes." };
  }
  if (!Number.isFinite(megabitsPerSecond) || megabitsPerSecond <= 0) {
    return { error: "Enter a link speed greater than zero." };
  }
  const bitsPerSecond = megabitsPerSecond * SI ** 2;
  return { seconds: (bytes * BITS_PER_BYTE) / bitsPerSecond };
}
