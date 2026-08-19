/**
 * WHOIS Lookup — domain registration records, read over RDAP.
 *
 * Classic WHOIS runs on TCP port 43 as plain text, which a web page cannot
 * open. ICANN's replacement, RDAP (Registration Data Access Protocol, RFC 9082
 * and RFC 9083), serves the same registration record as JSON over HTTPS and is
 * mandatory for every gTLD registry and registrar, so a browser can query it
 * directly. Everything in this module is the pure part of that job: validating
 * and normalising the domain, building the RDAP URL, turning an RDAP JSON
 * response into a flat readable record, explaining the EPP status codes, and
 * doing the date arithmetic. The network call itself lives in the UI.
 *
 * Date arithmetic uses UTC only, and "now" is always passed in as an argument,
 * so the same inputs always produce the same output.
 */

/**
 * rdap.org — a public bootstrap redirector, independently run (not operated
 * by IANA/ICANN). A GET to https://rdap.org/domain/<name> follows IANA's
 * published TLD-to-RDAP-server mapping (RFC 9224) and redirects to the
 * authoritative RDAP server for that TLD.
 */
export const RDAP_BOOTSTRAP_BASE = "https://rdap.org/domain/";

/** Milliseconds in a day. */
export const MS_PER_DAY = 86_400_000;

/** Mean Gregorian year in days (146097 days per 400 years). */
export const DAYS_PER_YEAR = 365.2425;

/** Maximum label length in a domain name (RFC 1035). */
export const MAX_LABEL_LENGTH = 63;

/** Maximum length of a full domain name in presentation form (RFC 1035). */
export const MAX_DOMAIN_LENGTH = 253;

/**
 * EPP / RDAP status codes and what they mean, from ICANN's published list of
 * EPP status codes and the RDAP status mapping in RFC 8056.
 * Keys are normalised: lower case with spaces and hyphens removed, so both
 * "clientTransferProhibited" and "client transfer prohibited" resolve.
 */
export const STATUS_MEANINGS = {
  ok: "Standing state — no pending operations or prohibitions.",
  active: "Standing state — the domain is delegated and no operations are pending.",
  inactive: "The domain has no nameservers delegated, so it will not resolve.",
  clienttransferprohibited: "The registrar blocks transfers to another registrar. This is the normal anti-hijacking lock.",
  clientdeleteprohibited: "The registrar blocks deletion requests for this domain.",
  clientupdateprohibited: "The registrar blocks changes to the domain record.",
  clientrenewprohibited: "The registrar blocks renewal requests for this domain.",
  clienthold: "The registrar has asked the registry to stop publishing the domain in DNS — it will not resolve.",
  servertransferprohibited: "The registry blocks transfers, usually during a dispute or the first 60 days after registration or transfer.",
  serverdeleteprohibited: "The registry blocks deletion of this domain.",
  serverupdateprohibited: "The registry blocks changes to this domain.",
  serverrenewprohibited: "The registry blocks renewal of this domain.",
  serverhold: "The registry is not publishing the domain in DNS — it will not resolve.",
  pendingcreate: "A registration request has been received and is being processed.",
  pendingdelete: "The domain is being deleted. After the 30-day redemption period there is a 5-day pending-delete window before it is released.",
  pendingrenew: "A renewal request is being processed.",
  pendingtransfer: "A transfer to another registrar has been requested and is being processed.",
  pendingupdate: "An update request is being processed.",
  pendingrestore: "A restore from the redemption period has been requested and is awaiting a report.",
  redemptionperiod: "The domain was deleted and is in the 30-day grace window in which the registrant can restore it.",
  addperiod: "The first 5 days after registration, during which the registrar can cancel for a refund.",
  autorenewperiod: "The 45-day window after an automatic renewal, during which the renewal can be cancelled for a refund.",
  renewperiod: "The 5-day window after an explicit renewal, during which the renewal can be cancelled for a refund.",
  transferperiod: "The 5-day window after a transfer, during which the transfer can be reversed.",
  associated: "The record is linked to another object in the registry.",
  validated: "The registry has validated the registrant's contact details.",
  locked: "The record is locked against changes.",
  private: "Registration details are withheld from public display.",
  removed: "The record has been removed from the registry.",
};

const isNonEmpty = (v) => typeof v === "string" && v.trim() !== "";

const normaliseKey = (value) => String(value ?? "").toLowerCase().replace(/[\s_-]/g, "");

/** Plain-English meaning for one status string, or a fallback. */
export function describeStatus(status) {
  const meaning = STATUS_MEANINGS[normaliseKey(status)];
  return meaning ?? "Registry-specific status — see the registry's documentation.";
}

/**
 * Clean whatever the user typed into a bare domain name.
 * Accepts full URLs, trailing dots, uppercase and a leading "www.".
 *
 * @param {string} input
 * @returns {{ domain: string, tld: string, labels: string[] } | { error: string }}
 */
export function normaliseDomain(input) {
  let text = String(input ?? "").trim().toLowerCase();
  if (text === "") return { error: "Enter a domain name, for example example.com." };

  text = text.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // strip any scheme
  text = text.split("/")[0].split("?")[0].split("#")[0]; // strip path, query, fragment
  text = text.split("@").pop(); // tolerate an email address
  text = text.split(":")[0]; // strip a port
  text = text.replace(/\.$/, ""); // strip the root dot

  if (text.startsWith("www.") && text.split(".").length > 2) text = text.slice(4);

  if (text === "") return { error: "That input had no domain name in it." };
  if (text.length > MAX_DOMAIN_LENGTH) return { error: `Domain names cannot be longer than ${MAX_DOMAIN_LENGTH} characters.` };

  const labels = text.split(".");
  if (labels.length < 2) return { error: "Include the extension too, for example example.com rather than example." };

  for (const label of labels) {
    if (label.length === 0) return { error: "The domain has an empty label — check for a doubled dot." };
    if (label.length > MAX_LABEL_LENGTH) return { error: `Each part of a domain can be at most ${MAX_LABEL_LENGTH} characters.` };
    if (!/^[a-z0-9-]+$/.test(label)) {
      return { error: "Only letters, digits and hyphens are allowed. Enter an international domain in its punycode (xn--) form." };
    }
    if (label.startsWith("-") || label.endsWith("-")) {
      return { error: "No part of a domain may start or end with a hyphen." };
    }
  }

  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/.test(tld) && !tld.startsWith("xn--")) {
    return { error: "The extension must be at least two letters, for example .com or .in." };
  }

  return { domain: text, tld, labels };
}

/**
 * Build the RDAP query URL for a domain.
 *
 * @param {string} domain already normalised
 * @param {string} [serverBase] optional explicit RDAP base, e.g. https://rdap.verisign.com/com/v1/
 */
export function rdapUrlFor(domain, serverBase = RDAP_BOOTSTRAP_BASE) {
  const cleaned = normaliseDomain(domain);
  if (cleaned.error) return cleaned;
  const base = String(serverBase || RDAP_BOOTSTRAP_BASE).trim();
  if (!/^https:\/\//.test(base)) return { error: "The RDAP server must be an https:// address." };
  const withSlash = base.endsWith("/") ? base : `${base}/`;
  const withDomainPath = /\/domain\/$/.test(withSlash) ? withSlash : `${withSlash}domain/`;
  return { url: `${withDomainPath}${encodeURIComponent(cleaned.domain)}` };
}

/** Pull a named property out of an RDAP jCard (vcardArray) structure. */
export function vcardValue(vcardArray, key) {
  if (!Array.isArray(vcardArray) || !Array.isArray(vcardArray[1])) return null;
  for (const entry of vcardArray[1]) {
    if (Array.isArray(entry) && entry[0] === key) {
      const value = entry[3];
      if (typeof value === "string" && value.trim() !== "") return value.trim();
      if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    }
  }
  return null;
}

/** Pull just the country out of an RDAP jCard 'adr' entry (its last non-empty structured field). */
function vcardCountry(vcardArray) {
  if (!Array.isArray(vcardArray) || !Array.isArray(vcardArray[1])) return null;
  for (const entry of vcardArray[1]) {
    if (Array.isArray(entry) && entry[0] === "adr") {
      const value = entry[3];
      if (Array.isArray(value)) {
        const parts = value.filter((v) => typeof v === "string" && v.trim() !== "");
        return parts.length ? parts[parts.length - 1].trim() : null;
      }
      if (typeof value === "string" && value.trim() !== "") return value.trim();
    }
  }
  return null;
}

function collectEntities(entities, found = []) {
  if (!Array.isArray(entities)) return found;
  for (const entity of entities) {
    if (entity && typeof entity === "object") {
      found.push(entity);
      collectEntities(entity.entities, found);
    }
  }
  return found;
}

/**
 * Flatten an RDAP domain response into the fields a WHOIS reader expects.
 *
 * @param {object} json the parsed RDAP JSON body
 */
export function parseRdapDomain(json) {
  if (!json || typeof json !== "object") return { error: "The RDAP server did not return a readable record." };
  if (json.errorCode) {
    const title = isNonEmpty(json.title) ? json.title : `RDAP error ${json.errorCode}`;
    const detail = Array.isArray(json.description) ? json.description.join(" ") : "";
    return { error: `${title}${detail ? `: ${detail}` : ""}` };
  }
  if (!isNonEmpty(json.ldhName) && !isNonEmpty(json.unicodeName) && !Array.isArray(json.events)) {
    return { error: "That response was not an RDAP domain record." };
  }

  const events = {};
  if (Array.isArray(json.events)) {
    for (const event of json.events) {
      if (event && isNonEmpty(event.eventAction) && isNonEmpty(event.eventDate)) {
        events[event.eventAction.toLowerCase()] = event.eventDate;
      }
    }
  }

  const allEntities = collectEntities(json.entities);
  const byRole = (role) => allEntities.find((e) => Array.isArray(e.roles) && e.roles.includes(role)) ?? null;

  const registrarEntity = byRole("registrar");
  const abuseEntity = registrarEntity ? collectEntities(registrarEntity.entities).find((e) => Array.isArray(e.roles) && e.roles.includes("abuse")) ?? null : null;
  const registrantEntity = byRole("registrant");

  const ianaId = registrarEntity && Array.isArray(registrarEntity.publicIds)
    ? registrarEntity.publicIds.find((id) => /iana/i.test(String(id.type ?? "")))?.identifier ?? null
    : null;

  const nameservers = Array.isArray(json.nameservers)
    ? json.nameservers.map((ns) => (isNonEmpty(ns.ldhName) ? ns.ldhName.toLowerCase() : null)).filter(Boolean)
    : [];

  const statuses = Array.isArray(json.status) ? json.status.filter(isNonEmpty) : [];

  return {
    domain: (json.ldhName || json.unicodeName || "").toLowerCase(),
    handle: isNonEmpty(json.handle) ? json.handle : null,
    statuses: statuses.map((status) => ({ code: status, meaning: describeStatus(status) })),
    events,
    registrationIso: events.registration ?? null,
    expiryIso: events.expiration ?? null,
    lastChangedIso: events["last changed"] ?? null,
    registrar: registrarEntity ? vcardValue(registrarEntity.vcardArray, "fn") : null,
    registrarIanaId: ianaId,
    abuseEmail: abuseEntity ? vcardValue(abuseEntity.vcardArray, "email") : null,
    registrant: registrantEntity ? vcardValue(registrantEntity.vcardArray, "fn") : null,
    registrantCountry: registrantEntity ? vcardCountry(registrantEntity.vcardArray) : null,
    nameservers,
    dnssecSigned: json.secureDNS ? json.secureDNS.delegationSigned === true : null,
  };
}

/**
 * Age and time-to-expiry, measured in whole UTC days.
 *
 * @param {{ registrationIso: string|null, expiryIso: string|null, asOfIso: string }} input
 */
export function domainTimeline({ registrationIso, expiryIso, asOfIso }) {
  const asOf = Date.parse(asOfIso);
  if (!Number.isFinite(asOf)) return { error: "The reference date could not be read." };

  const registered = registrationIso ? Date.parse(registrationIso) : NaN;
  const expires = expiryIso ? Date.parse(expiryIso) : NaN;

  const ageDays = Number.isFinite(registered) ? Math.floor((asOf - registered) / MS_PER_DAY) : null;
  const daysToExpiry = Number.isFinite(expires) ? Math.floor((expires - asOf) / MS_PER_DAY) : null;

  return {
    ageDays,
    ageYears: ageDays === null ? null : ageDays / DAYS_PER_YEAR,
    daysToExpiry,
    expired: daysToExpiry === null ? null : daysToExpiry < 0,
    expiringSoon: daysToExpiry === null ? null : daysToExpiry >= 0 && daysToExpiry <= 30,
  };
}

/** Format an RDAP timestamp for display, in UTC. */
export function formatRdapDate(iso) {
  if (!isNonEmpty(iso)) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  const date = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

/** Render a parsed record as plain text, for the copy button. */
export function recordToText(record, timeline) {
  if (!record || record.error) return "";
  const lines = [`WHOIS / RDAP record for ${record.domain}`, ""];
  if (record.registrar) lines.push(`Registrar: ${record.registrar}${record.registrarIanaId ? ` (IANA ${record.registrarIanaId})` : ""}`);
  if (record.registrationIso) lines.push(`Registered: ${formatRdapDate(record.registrationIso)}`);
  if (record.expiryIso) lines.push(`Expires: ${formatRdapDate(record.expiryIso)}`);
  if (record.lastChangedIso) lines.push(`Last changed: ${formatRdapDate(record.lastChangedIso)}`);
  if (timeline && timeline.ageDays !== null) lines.push(`Age: ${timeline.ageDays} days`);
  if (timeline && timeline.daysToExpiry !== null) lines.push(`Days to expiry: ${timeline.daysToExpiry}`);
  if (record.dnssecSigned !== null) lines.push(`DNSSEC: ${record.dnssecSigned ? "signed" : "unsigned"}`);
  if (record.nameservers.length) lines.push(`Nameservers: ${record.nameservers.join(", ")}`);
  if (record.abuseEmail) lines.push(`Registrar abuse contact: ${record.abuseEmail}`);
  if (record.statuses.length) {
    lines.push("", "Status codes:");
    for (const status of record.statuses) lines.push(`  ${status.code} — ${status.meaning}`);
  }
  return lines.join("\n");
}
