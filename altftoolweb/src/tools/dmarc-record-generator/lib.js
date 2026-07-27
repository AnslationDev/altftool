/**
 * DMARC record generation per RFC 7489 (DMARC1).
 *
 * Tag rules encoded here (RFC 7489 section 6.3):
 *  - v=DMARC1 must be the first tag, exactly.
 *  - p (policy): none | quarantine | reject. Required in a policy record.
 *  - sp (subdomain policy): same values; defaults to p when absent.
 *  - pct: integer 0-100, default 100. Applies only to quarantine/reject
 *    sampling, not to p=none.
 *  - rua / ruf: comma-separated DMARC URIs, in practice mailto: addresses.
 *  - adkim / aspf (alignment): r (relaxed, default) | s (strict).
 *  - fo (failure reporting options): colon-separated 0, 1, d, s; default 0.
 *    Only meaningful when ruf is present.
 *  - ri (aggregate report interval): seconds, default 86400.
 * The record lives at the name "_dmarc.<domain>" as a TXT record.
 */

export const POLICIES = [
  { id: "none", label: "none — monitor only, deliver normally" },
  { id: "quarantine", label: "quarantine — send failures to spam" },
  { id: "reject", label: "reject — refuse failing mail outright" },
];

export const ALIGNMENT_MODES = [
  { id: "r", label: "relaxed (default) — organisational domain match" },
  { id: "s", label: "strict — exact domain match" },
];

export const FO_OPTIONS = [
  { id: "0", label: "0 (default) — report only if both SPF and DKIM fail alignment" },
  { id: "1", label: "1 — report if either SPF or DKIM fails alignment" },
  { id: "d", label: "d — report on DKIM signature failure regardless of alignment" },
  { id: "s", label: "s — report on SPF failure regardless of alignment" },
];

// RFC 7489 s6.3: pct is an integer between 0 and 100 inclusive.
export const PCT_MIN = 0;
export const PCT_MAX = 100;

// RFC 7489 s6.3: ri default is 86400 seconds (one day).
export const RI_DEFAULT = 86400;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validate a comma/space separated list of report addresses. */
function parseAddresses(raw) {
  const items = String(raw)
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.toLowerCase().startsWith("mailto:") ? s.slice(7) : s));
  for (const email of items) {
    if (!EMAIL_PATTERN.test(email)) return { error: `"${email}" is not a valid email address.` };
  }
  return { emails: items };
}

const DOMAIN_PATTERN = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$/;

/**
 * Build the DMARC TXT record.
 *
 * @param {object} input
 * @param {string} input.domain      Domain the policy is for (e.g. example.com).
 * @param {string} input.policy      "none" | "quarantine" | "reject".
 * @param {string} [input.subdomainPolicy] "inherit" or a policy id.
 * @param {number|string} [input.pct]  0-100 sampling percentage.
 * @param {string} [input.rua]       Aggregate report addresses (comma separated).
 * @param {string} [input.ruf]       Forensic report addresses (comma separated).
 * @param {string} [input.adkim]     "r" | "s".
 * @param {string} [input.aspf]      "r" | "s".
 * @param {string[]} [input.fo]      Failure options subset of ["0","1","d","s"].
 * @param {number|string} [input.ri] Aggregate interval in seconds.
 * @returns {{ recordName, recordValue, tags, warnings }|{ error }}
 */
export function buildDmarcRecord({
  domain,
  policy,
  subdomainPolicy = "inherit",
  pct = 100,
  rua = "",
  ruf = "",
  adkim = "r",
  aspf = "r",
  fo = [],
  ri = RI_DEFAULT,
}) {
  const dom = String(domain).trim().toLowerCase().replace(/\.$/, "");
  if (dom === "") return { error: "Enter the domain the DMARC policy is for." };
  if (!DOMAIN_PATTERN.test(dom)) {
    return { error: "Enter a valid domain name such as example.com (no scheme, no path)." };
  }

  if (!POLICIES.some((p) => p.id === policy)) {
    return { error: "Choose a policy: none, quarantine or reject." };
  }
  const sp = subdomainPolicy === "inherit" ? null : subdomainPolicy;
  if (sp !== null && !POLICIES.some((p) => p.id === sp)) {
    return { error: "Subdomain policy must be none, quarantine or reject." };
  }

  const pctNum = Number(pct);
  if (!Number.isInteger(pctNum) || pctNum < PCT_MIN || pctNum > PCT_MAX) {
    return { error: "pct must be a whole number from 0 to 100 (RFC 7489)." };
  }

  const riNum = Number(ri);
  if (!Number.isInteger(riNum) || riNum < 0) {
    return { error: "Report interval (ri) must be zero or a positive whole number of seconds." };
  }

  if (!["r", "s"].includes(adkim)) return { error: "adkim must be r (relaxed) or s (strict)." };
  if (!["r", "s"].includes(aspf)) return { error: "aspf must be r (relaxed) or s (strict)." };

  const validFo = FO_OPTIONS.map((o) => o.id);
  const foList = Array.isArray(fo) ? fo.filter((f) => validFo.includes(f)) : [];

  const ruaParsed = parseAddresses(rua);
  if (ruaParsed.error) return { error: `Aggregate report address: ${ruaParsed.error}` };
  const rufParsed = parseAddresses(ruf);
  if (rufParsed.error) return { error: `Forensic report address: ${rufParsed.error}` };

  // Assemble tags in the conventional order; v then p are mandatory and
  // v=DMARC1 must come first (RFC 7489 s6.4).
  const tags = [
    ["v", "DMARC1"],
    ["p", policy],
  ];
  if (sp) tags.push(["sp", sp]);
  if (pctNum !== 100) tags.push(["pct", String(pctNum)]);
  if (ruaParsed.emails.length > 0) {
    tags.push(["rua", ruaParsed.emails.map((e) => `mailto:${e}`).join(",")]);
  }
  if (rufParsed.emails.length > 0) {
    tags.push(["ruf", rufParsed.emails.map((e) => `mailto:${e}`).join(",")]);
  }
  if (adkim !== "r") tags.push(["adkim", adkim]);
  if (aspf !== "r") tags.push(["aspf", aspf]);
  if (foList.length > 0 && !(foList.length === 1 && foList[0] === "0")) {
    tags.push(["fo", foList.join(":")]);
  }
  if (riNum !== RI_DEFAULT) tags.push(["ri", String(riNum)]);

  const recordValue = tags.map(([k, v]) => `${k}=${v}`).join("; ");
  const recordName = `_dmarc.${dom}`;

  const warnings = [];
  if (ruaParsed.emails.length === 0) {
    warnings.push(
      "No rua address — you will receive no aggregate reports, so you cannot see who is failing DMARC. Add one before tightening the policy.",
    );
  }
  if (policy === "none" && pctNum !== 100) {
    warnings.push("pct has no effect when p=none; sampling only applies to quarantine and reject.");
  }
  if (policy === "reject" && ruaParsed.emails.length === 0) {
    warnings.push(
      "Moving straight to p=reject without monitoring reports risks rejecting legitimate mail from forgotten senders (CRM, billing, newsletters).",
    );
  }
  if (foList.length > 0 && rufParsed.emails.length === 0) {
    warnings.push("fo options only matter when a ruf address is set — most receivers no longer send forensic reports anyway.");
  }
  const external = ruaParsed.emails.filter((e) => !e.toLowerCase().endsWith(`@${dom}`));
  if (external.length > 0) {
    warnings.push(
      "Reports go to a different domain: the receiving domain must publish an external destination verification record (<yourdomain>._report._dmarc.<reportdomain>) per RFC 7489 section 7.1.",
    );
  }

  return { recordName, recordValue, tags, warnings, domain: dom };
}
