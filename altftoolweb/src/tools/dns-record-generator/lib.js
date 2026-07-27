/**
 * DNS record generation with zone-file formatting.
 *
 * Syntax rules encoded here:
 *  - RFC 1035: master-file format, 255-octet limit per TXT character-string,
 *    63-octet label limit, 255-octet total name limit.
 *  - RFC 2181 section 8: TTL is an unsigned 31-bit value (0 to 2147483647).
 *  - RFC 2181 section 10.1: a CNAME cannot coexist with other data, which is
 *    why a CNAME at the zone apex (@) is rejected — the apex always holds
 *    SOA and NS records.
 *  - RFC 2782: SRV owner name is _service._proto.name; priority, weight and
 *    port are 16-bit unsigned integers; a target of "." means "no service".
 *  - ALIAS/ANAME is not an IETF-standard type; it is a provider-side
 *    synthetic record (Route 53, Cloudflare flattening, DNSimple) that is
 *    answered as A/AAAA. The tool emits it in the provider's pseudo-syntax.
 */

// RFC 2181 s8: TTL is a 31-bit unsigned integer.
export const TTL_MAX = 2147483647;

// RFC 1035 s2.3.4: labels max 63 octets, full names max 255 octets.
export const LABEL_MAX = 63;
export const NAME_MAX = 255;

// RFC 1035 s3.3: a single character-string in TXT RDATA is at most 255 octets.
export const TXT_CHUNK_MAX = 255;

export const RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT", "SRV", "ALIAS"];

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Validate a dotted-quad IPv4 address; every octet 0-255. */
export function isValidIPv4(value) {
  const m = IPV4_PATTERN.exec(String(value).trim());
  if (!m) return false;
  return m.slice(1).every((octet) => {
    if (octet.length > 1 && octet.startsWith("0")) return false; // no leading zeros
    return Number(octet) <= 255;
  });
}

/**
 * Validate an IPv6 address (RFC 4291 text forms): up to 8 hextets, at most
 * one "::" compression, optional embedded IPv4 tail.
 */
export function isValidIPv6(value) {
  const s = String(value).trim();
  if (s.length === 0 || s.includes(":::")) return false;
  const doubleColons = s.split("::").length - 1;
  if (doubleColons > 1) return false;

  let body = s;
  let v4Tail = null;
  const lastColon = s.lastIndexOf(":");
  if (lastColon !== -1 && s.slice(lastColon + 1).includes(".")) {
    v4Tail = s.slice(lastColon + 1);
    if (!isValidIPv4(v4Tail)) return false;
    body = s.slice(0, lastColon + 1) + "0:0"; // IPv4 tail occupies two hextets
  }

  const hextet = /^[0-9a-fA-F]{1,4}$/;
  if (doubleColons === 1) {
    const [left, right] = body.split("::");
    const leftParts = left === "" ? [] : left.split(":");
    const rightParts = right === "" ? [] : right.split(":");
    if (![...leftParts, ...rightParts].every((p) => hextet.test(p))) return false;
    return leftParts.length + rightParts.length <= 7; // "::" covers >= 1 hextet
  }
  const parts = body.split(":");
  return parts.length === 8 && parts.every((p) => hextet.test(p));
}

/**
 * Validate an owner/target hostname in zone-file terms.
 * Allows "@" (apex), "*" as a leading wildcard label, and underscore labels
 * (used by service and policy records).
 */
export function validateName(value, { allowApex = true, allowWildcard = true } = {}) {
  const s = String(value).trim();
  if (s === "") return "Name cannot be empty.";
  if (s === "@") return allowApex ? null : "This record type cannot sit at the zone apex (@).";
  const name = s.endsWith(".") ? s.slice(0, -1) : s;
  if (name.length > NAME_MAX) return `Name exceeds the ${NAME_MAX}-character limit (RFC 1035).`;
  const labels = name.split(".");
  for (let i = 0; i < labels.length; i += 1) {
    const label = labels[i];
    if (label === "") return "Name contains an empty label (double dot).";
    if (label.length > LABEL_MAX) return `Label "${label}" exceeds 63 characters (RFC 1035).`;
    if (label === "*") {
      if (!allowWildcard || i !== 0) return "A wildcard (*) is only valid as the leftmost label.";
      continue;
    }
    if (!/^[A-Za-z0-9_]([A-Za-z0-9_-]*[A-Za-z0-9_])?$/.test(label)) {
      return `Label "${label}" may contain only letters, digits, hyphens and underscores, and cannot start or end with a hyphen.`;
    }
  }
  return null;
}

/** Validate a TTL; RFC 2181 s8 caps it at 2^31 - 1 seconds. */
export function validateTtl(value) {
  const n = Number(value);
  if (!Number.isInteger(n)) return "TTL must be a whole number of seconds.";
  if (n < 0) return "TTL cannot be negative.";
  if (n > TTL_MAX) return `TTL cannot exceed ${TTL_MAX} seconds (RFC 2181).`;
  return null;
}

/** Split a long TXT value into quoted 255-octet chunks (RFC 1035 s3.3). */
export function chunkTxtValue(value) {
  const chunks = [];
  for (let i = 0; i < value.length; i += TXT_CHUNK_MAX) {
    chunks.push(value.slice(i, i + TXT_CHUNK_MAX));
  }
  return chunks;
}

const escapeTxt = (chunk) => chunk.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const ensureFqdn = (target) => (target.endsWith(".") ? target : `${target}.`);

/**
 * Build one zone-file record line.
 *
 * @param {object} input
 * @param {string} input.type    One of RECORD_TYPES.
 * @param {string} input.name    Owner name ("@", "www", "_sip._tcp", ...).
 * @param {number|string} input.ttl TTL in seconds.
 * @param {string} [input.value] Address / target / text, depending on type.
 * @param {number|string} [input.priority] SRV only, 0-65535.
 * @param {number|string} [input.weight]   SRV only, 0-65535.
 * @param {number|string} [input.port]     SRV only, 1-65535.
 * @returns {{ zoneLine: string, notes: string[] }|{ error: string }}
 */
export function buildRecord({ type, name, ttl, value = "", priority, weight, port }) {
  if (!RECORD_TYPES.includes(type)) return { error: "Choose a supported record type." };

  const ttlError = validateTtl(ttl);
  if (ttlError) return { error: ttlError };

  const notes = [];
  const trimmedName = String(name).trim();
  const trimmedValue = String(value).trim();

  const nameError = validateName(trimmedName, {
    // RFC 2181 s10.1: CNAME cannot coexist with the SOA/NS set at the apex.
    allowApex: type !== "CNAME",
    allowWildcard: type !== "SRV",
  });
  if (nameError) return { error: nameError };

  let rdata;
  switch (type) {
    case "A": {
      if (!isValidIPv4(trimmedValue)) {
        return { error: "Enter a valid IPv4 address (four octets 0-255, e.g. 192.0.2.10)." };
      }
      rdata = trimmedValue;
      break;
    }
    case "AAAA": {
      if (!isValidIPv6(trimmedValue)) {
        return { error: "Enter a valid IPv6 address (e.g. 2001:db8::1)." };
      }
      rdata = trimmedValue.toLowerCase();
      break;
    }
    case "CNAME": {
      const targetError = validateName(trimmedValue, { allowApex: false, allowWildcard: false });
      if (targetError) return { error: `Target: ${targetError}` };
      if (isValidIPv4(trimmedValue)) {
        return { error: "A CNAME must point to a hostname, not an IP address. Use an A record instead." };
      }
      rdata = ensureFqdn(trimmedValue);
      notes.push(
        "RFC 2181: a name with a CNAME cannot carry any other record — do not add MX, TXT or A records at this name.",
      );
      break;
    }
    case "TXT": {
      if (trimmedValue.length === 0) return { error: "Enter the text value for the TXT record." };
      const chunks = chunkTxtValue(trimmedValue).map((c) => `"${escapeTxt(c)}"`);
      rdata = chunks.join(" ");
      if (chunks.length > 1) {
        notes.push(
          `Value exceeds 255 characters, so it is split into ${chunks.length} quoted strings (RFC 1035); resolvers concatenate them.`,
        );
      }
      break;
    }
    case "SRV": {
      // RFC 2782: owner must be _service._proto.name.
      if (!/^_[^.]+\._(tcp|udp|tls)\b/i.test(trimmedName) && trimmedName !== "@") {
        return {
          error: "SRV owner name must follow _service._proto (e.g. _sip._tcp), per RFC 2782.",
        };
      }
      const pri = Number(priority);
      const wgt = Number(weight);
      const prt = Number(port);
      if (!Number.isInteger(pri) || pri < 0 || pri > 65535) {
        return { error: "SRV priority must be a whole number from 0 to 65535." };
      }
      if (!Number.isInteger(wgt) || wgt < 0 || wgt > 65535) {
        return { error: "SRV weight must be a whole number from 0 to 65535." };
      }
      if (!Number.isInteger(prt) || prt < 1 || prt > 65535) {
        return { error: "SRV port must be a whole number from 1 to 65535." };
      }
      const targetError = validateName(trimmedValue, { allowApex: false, allowWildcard: false });
      if (targetError) return { error: `Target: ${targetError}` };
      rdata = `${pri} ${wgt} ${prt} ${ensureFqdn(trimmedValue)}`;
      notes.push(
        "Lower priority is tried first; equal-priority targets are load-balanced by weight (RFC 2782).",
      );
      break;
    }
    case "ALIAS": {
      const targetError = validateName(trimmedValue, { allowApex: false, allowWildcard: false });
      if (targetError) return { error: `Target: ${targetError}` };
      rdata = ensureFqdn(trimmedValue);
      notes.push(
        "ALIAS/ANAME is not a standard DNS type — it is provider-side flattening (Route 53 alias, Cloudflare CNAME flattening, DNSimple ALIAS) answered as A/AAAA. Check your provider's exact syntax.",
      );
      break;
    }
    default:
      return { error: "Choose a supported record type." };
  }

  const zoneLine = `${trimmedName}\t${Number(ttl)}\tIN\t${type}\t${rdata}`;
  return { zoneLine, notes, type, name: trimmedName, ttl: Number(ttl), rdata };
}
