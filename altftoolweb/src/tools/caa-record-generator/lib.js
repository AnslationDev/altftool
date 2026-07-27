/**
 * CAA record generation per RFC 8659 (which obsoleted RFC 6844).
 *
 * Rules encoded here:
 *  - RDATA is: flags (one octet) tag (ascii) value (quoted string).
 *  - flags: bit 7 is the "issuer critical" flag — 128 when set, 0 otherwise
 *    (RFC 8659 s4.1). A CA that does not understand a critical property
 *    must not issue.
 *  - Tags (RFC 8659 s4.2-4.4):
 *      issue     — authorises a CA to issue certificates for the domain.
 *      issuewild — authorises wildcard issuance; when at least one
 *                  issuewild record exists, it alone controls wildcards.
 *      iodef     — URL (mailto:, http: or https:) to report violations to,
 *                  per RFC 8659 s4.4 / RFC 6546.
 *  - The value ";" in issue/issuewild forbids all issuance of that kind.
 *  - An empty CAA record set means ANY CA may issue (subject to its own
 *    checks); CAs have been REQUIRED to check CAA since September 2017 by
 *    CA/Browser Forum Baseline Requirements s3.2.2.8.
 */

// RFC 8659 s4.1: bit 7 of the flags octet is "issuer critical".
export const FLAG_CRITICAL = 128;
export const FLAG_NONE = 0;

// The registered CA identifier domains published by major CAs.
export const KNOWN_CAS = [
  { id: "letsencrypt.org", label: "Let's Encrypt" },
  { id: "digicert.com", label: "DigiCert" },
  { id: "sectigo.com", label: "Sectigo (also covers ZeroSSL)" },
  { id: "pki.goog", label: "Google Trust Services" },
  { id: "amazon.com", label: "Amazon (AWS Certificate Manager)" },
  { id: "globalsign.com", label: "GlobalSign" },
  { id: "ssl.com", label: "SSL.com" },
  { id: "entrust.net", label: "Entrust" },
  { id: "certum.pl", label: "Certum" },
  { id: "buypass.com", label: "Buypass" },
];

const DOMAIN_PATTERN = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$/;

/** Validate one CA identifier (a bare domain, optionally with parameters after ";"). */
function validateCaIdentifier(value) {
  const [domainPart] = String(value).split(";").map((s) => s.trim());
  if (!DOMAIN_PATTERN.test(domainPart)) {
    return `"${value}" is not a valid CA identifier — use the CA's registered domain, e.g. letsencrypt.org.`;
  }
  return null;
}

/** Validate the iodef URL: RFC 8659 s4.4 allows mailto:, http: and https:. */
function validateIodef(value) {
  const v = String(value).trim();
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return null;
  if (/^https?:\/\/\S+\.\S+/.test(v)) return null;
  return "iodef must be a mailto: address or an http(s):// URL (RFC 8659 section 4.4).";
}

/**
 * Build a CAA record set.
 *
 * @param {object} input
 * @param {string} input.domain        Domain the records are for.
 * @param {number|string} [input.ttl]  TTL seconds (default 3600).
 * @param {string[]} input.issueCAs    CA identifiers allowed to issue; empty
 *                                     array + forbidIssue emits issue ";".
 * @param {string} input.wildcardMode  "same" (no issuewild records) |
 *                                     "custom" (use wildcardCAs) |
 *                                     "forbid" (issuewild ";").
 * @param {string[]} [input.wildcardCAs] CA identifiers for wildcard issuance.
 * @param {string} [input.iodef]       Violation-report URL, optional.
 * @param {boolean} [input.critical]   Set the 128 critical flag on all records.
 * @returns {{ records, zoneLines, notes }|{ error }}
 */
export function buildCaaRecords({
  domain,
  ttl = 3600,
  issueCAs = [],
  wildcardMode = "same",
  wildcardCAs = [],
  iodef = "",
  critical = false,
}) {
  const dom = String(domain).trim().toLowerCase().replace(/\.$/, "");
  if (dom === "") return { error: "Enter the domain to protect." };
  if (!DOMAIN_PATTERN.test(dom)) {
    return { error: "Enter a valid domain name such as example.com (no scheme, no path)." };
  }

  const ttlNum = Number(ttl);
  if (!Number.isInteger(ttlNum) || ttlNum < 0 || ttlNum > 2147483647) {
    return { error: "TTL must be a whole number of seconds between 0 and 2147483647." };
  }

  if (!["same", "custom", "forbid"].includes(wildcardMode)) {
    return { error: "Choose how wildcard certificates should be handled." };
  }

  const issueList = issueCAs.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  const wildList = wildcardCAs.map((s) => String(s).trim().toLowerCase()).filter(Boolean);

  for (const ca of issueList) {
    const err = validateCaIdentifier(ca);
    if (err) return { error: `Issue CA: ${err}` };
  }
  if (wildcardMode === "custom") {
    for (const ca of wildList) {
      const err = validateCaIdentifier(ca);
      if (err) return { error: `Wildcard CA: ${err}` };
    }
    if (wildList.length === 0) {
      return { error: "Add at least one wildcard CA, or choose 'forbid' / 'same as normal'." };
    }
  }

  const iodefTrimmed = String(iodef).trim();
  if (iodefTrimmed !== "") {
    const err = validateIodef(iodefTrimmed);
    if (err) return { error: err };
  }

  const flags = critical ? FLAG_CRITICAL : FLAG_NONE;
  const records = [];

  if (issueList.length === 0) {
    // RFC 8659 s4.2: value ";" means no CA may issue.
    records.push({ flags, tag: "issue", value: ";" });
  } else {
    for (const ca of issueList) records.push({ flags, tag: "issue", value: ca });
  }

  if (wildcardMode === "forbid") {
    records.push({ flags, tag: "issuewild", value: ";" });
  } else if (wildcardMode === "custom") {
    for (const ca of wildList) records.push({ flags, tag: "issuewild", value: ca });
  }

  if (iodefTrimmed !== "") {
    records.push({ flags, tag: "iodef", value: iodefTrimmed });
  }

  const zoneLines = records.map(
    (r) => `${dom}.\t${ttlNum}\tIN\tCAA\t${r.flags} ${r.tag} "${r.value}"`,
  );

  const notes = [
    "CAs have been required to check CAA before issuing since 8 September 2017 (CA/Browser Forum Baseline Requirements s3.2.2.8).",
    "CAA is checked on the closest ancestor with a CAA record set — records on example.com cover shop.example.com unless the subdomain publishes its own.",
  ];
  if (issueList.length === 0) {
    notes.push('issue ";" blocks ALL certificate issuance — renewals will start failing. Use only for parked domains.');
  }
  if (wildcardMode === "same") {
    notes.push(
      "No issuewild records published: RFC 8659 falls back to the issue records for wildcard requests, so the same CAs may issue wildcards.",
    );
  }
  if (critical) {
    notes.push(
      "Critical flag (128) set: a CA that does not understand a property must refuse to issue. Rarely needed for the standard issue/issuewild/iodef tags, which every CA understands.",
    );
  }

  return { records, zoneLines, notes, domain: dom, ttl: ttlNum };
}
