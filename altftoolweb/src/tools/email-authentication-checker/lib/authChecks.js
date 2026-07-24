// SPF / DMARC / DKIM / MX analysis. Each check fetches real DNS records via
// DoH (lib/doh.js) and evaluates them with fixed, documented rules — the same
// pass/warn/fail logic mail testers apply to the authentication side of
// deliverability. No scores are invented: every verdict traces to a concrete
// record property.

import { resolveRecord } from "./doh";

// DKIM has no fixed location — keys live at <selector>._domainkey.<domain>,
// and the selector is chosen by the sending service. When the user doesn't
// know theirs, we probe the selectors used by the most common providers.
export const COMMON_DKIM_SELECTORS = [
  { selector: "google", hint: "Google Workspace" },
  { selector: "selector1", hint: "Microsoft 365" },
  { selector: "selector2", hint: "Microsoft 365" },
  { selector: "k1", hint: "Mailchimp / Klaviyo" },
  { selector: "k2", hint: "Mailchimp" },
  { selector: "s1", hint: "SendGrid" },
  { selector: "s2", hint: "SendGrid" },
  { selector: "default", hint: "Generic / self-hosted" },
  { selector: "dkim", hint: "Generic" },
  { selector: "mail", hint: "Generic" },
  { selector: "zoho", hint: "Zoho Mail" },
  { selector: "mx", hint: "Amazon SES (varies)" },
];

function verdict(status, title, detail, fix = "", meta = {}) {
  return { status, title, detail, fix, ...meta };
}

/* ---------------- SPF ---------------- */

export async function checkSpf(domain) {
  const res = await resolveRecord(domain, "TXT");
  const spfRecords = res.records.filter((r) => /^v=spf1(\s|$)/i.test(r.trim()));

  if (spfRecords.length === 0) {
    return verdict(
      "fail",
      "No SPF record found",
      `No TXT record starting with "v=spf1" exists on ${domain}. Receiving servers can't verify which mail servers are allowed to send for this domain.`,
      'Add a TXT record on the root domain, e.g. "v=spf1 include:_spf.google.com ~all" (adjust the include for your email provider).',
      { records: spfRecords },
    );
  }
  if (spfRecords.length > 1) {
    return verdict(
      "fail",
      `${spfRecords.length} SPF records found (must be exactly 1)`,
      "Multiple v=spf1 records make SPF evaluation a permanent error (permerror) — receivers treat it as if SPF failed.",
      "Merge all mechanisms into a single v=spf1 TXT record and delete the extras.",
      { records: spfRecords },
    );
  }

  const record = spfRecords[0].trim();
  const issues = [];
  let status = "pass";

  const allMatch = record.match(/([~\-?+]?)all\s*$/i);
  const hasRedirect = /\bredirect=/i.test(record);
  if (!allMatch && !hasRedirect) {
    issues.push('Record has no terminal "all" mechanism — unlisted servers are neither passed nor failed, weakening the policy.');
    status = "warn";
  } else if (allMatch && allMatch[1] === "+") {
    issues.push('"+all" allows ANY server on the internet to send as your domain — this defeats SPF entirely.');
    status = "fail";
  } else if (allMatch && allMatch[1] === "?") {
    issues.push('"?all" is neutral — receivers get no signal about unlisted servers. Prefer "~all" (softfail) or "-all" (hardfail).');
    status = "warn";
  }

  // Each include/a/mx/exists/redirect triggers extra DNS lookups; RFC 7208
  // caps the total at 10, after which SPF permerrors.
  const lookupCount = (record.match(/\b(include:|a[\s:]|mx[\s:]|exists:|redirect=|ptr\b)/gi) || []).length;
  if (lookupCount > 10) {
    issues.push(`Approximately ${lookupCount} DNS-lookup mechanisms — over the RFC limit of 10, which causes a permanent SPF error.`);
    status = "fail";
  } else if (lookupCount >= 8) {
    issues.push(`Approximately ${lookupCount} DNS-lookup mechanisms — close to the RFC limit of 10. Consider flattening includes.`);
    if (status === "pass") status = "warn";
  }

  if (/\bptr\b/i.test(record)) {
    issues.push('The "ptr" mechanism is deprecated (RFC 7208) — slow, unreliable, and ignored by some receivers.');
    if (status === "pass") status = "warn";
  }

  return verdict(
    status,
    status === "pass" ? "Valid SPF record" : status === "warn" ? "SPF record has warnings" : "SPF record is broken",
    issues.length ? issues.join(" ") : `A single well-formed SPF record with a ${allMatch ? `"${allMatch[0].trim()}"` : ""} policy is published.`,
    issues.length ? "Adjust the record to resolve the issues above, keeping exactly one v=spf1 record." : "",
    { records: [record], lookupCount },
  );
}

/* ---------------- DMARC ---------------- */

export async function checkDmarc(domain) {
  const res = await resolveRecord(`_dmarc.${domain}`, "TXT");
  const dmarcRecords = res.records.filter((r) => /^v=DMARC1(\s*;|$)/i.test(r.trim()));

  if (dmarcRecords.length === 0) {
    return verdict(
      "fail",
      "No DMARC record found",
      `No TXT record exists at _dmarc.${domain}. Without DMARC, receivers have no policy for handling mail that fails SPF/DKIM — and Gmail/Yahoo now require DMARC for bulk senders.`,
      'Add a TXT record at _dmarc.' + domain + ' e.g. "v=DMARC1; p=none; rua=mailto:dmarc-reports@' + domain + '" to start monitoring, then tighten to quarantine/reject.',
      { records: [] },
    );
  }

  const record = dmarcRecords[0].trim();
  const tags = {};
  for (const part of record.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k && rest.length) tags[k.toLowerCase()] = rest.join("=").trim();
  }

  const policy = (tags.p || "").toLowerCase();
  const issues = [];
  let status = "pass";

  if (!policy) {
    issues.push('Record is missing the required "p=" policy tag.');
    status = "fail";
  } else if (policy === "none") {
    issues.push('Policy is "p=none" — you receive reports but failing mail is still delivered. Fine for monitoring; move to "quarantine" or "reject" once reports look clean.');
    status = "warn";
  }

  if (!tags.rua) {
    issues.push('No "rua=" aggregate-report address — you get no visibility into who is sending as your domain.');
    if (status === "pass") status = "warn";
  }

  const pct = tags.pct ? Number(tags.pct) : 100;
  if (Number.isFinite(pct) && pct < 100) {
    issues.push(`"pct=${pct}" applies the policy to only ${pct}% of failing mail.`);
    if (status === "pass") status = "warn";
  }

  return verdict(
    status,
    status === "pass" ? `DMARC enforced (p=${policy})` : status === "warn" ? "DMARC present but not fully enforced" : "DMARC record invalid",
    issues.length ? issues.join(" ") : `Policy "p=${policy}" is enforced${tags.rua ? " with aggregate reporting configured" : ""}.`,
    issues.length ? "Address the notes above — the end goal is p=quarantine or p=reject with rua reporting." : "",
    { records: [record], tags },
  );
}

/* ---------------- DKIM ---------------- */

async function probeSelector(domain, selector) {
  const name = `${selector}._domainkey.${domain}`;
  // DKIM records are sometimes served behind a CNAME (common with ESPs); DoH
  // TXT resolution follows the chain, so checking TXT alone is sufficient.
  const res = await resolveRecord(name, "TXT");
  const dkim = res.records.find((r) => /(^|;)\s*v=DKIM1\s*(;|$)/i.test(r) || /(^|;|\s)p=[A-Za-z0-9+/=]+/.test(r));
  if (!dkim) return null;
  const keyMatch = dkim.match(/(^|;)\s*p=([A-Za-z0-9+/=]*)/);
  const key = keyMatch ? keyMatch[2] : "";
  return { selector, name, record: dkim, revoked: key === "", keyBits: key ? estimateKeyBits(key) : 0 };
}

// Rough RSA key size from base64 length (1024-bit ≈ 216 b64 chars, 2048 ≈ 392).
function estimateKeyBits(b64) {
  const bytes = Math.floor((b64.length * 3) / 4);
  if (bytes >= 380) return 4096;
  if (bytes >= 250) return 2048;
  if (bytes >= 120) return 1024;
  return 512;
}

export async function checkDkim(domain, customSelector) {
  const selectors = customSelector
    ? [{ selector: customSelector, hint: "your selector" }]
    : COMMON_DKIM_SELECTORS;

  // Probe in parallel; keep every selector that answers.
  const results = await Promise.allSettled(selectors.map((s) => probeSelector(domain, s.selector)));
  const found = results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => r.value)
    .map((v) => ({ ...v, hint: selectors.find((s) => s.selector === v.selector)?.hint || "" }));

  if (found.length === 0) {
    return verdict(
      customSelector ? "fail" : "warn",
      customSelector ? `No DKIM key at selector "${customSelector}"` : "No DKIM key found on common selectors",
      customSelector
        ? `No DKIM TXT record exists at ${customSelector}._domainkey.${domain}.`
        : `None of the ${COMMON_DKIM_SELECTORS.length} most common selectors (${COMMON_DKIM_SELECTORS.slice(0, 5).map((s) => s.selector).join(", ")}…) have a key on ${domain}. Your provider may use a custom selector — check its DNS setup page and re-run with that selector.`,
      "Enable DKIM signing in your email provider's admin console and publish the TXT record it gives you.",
      { found: [] },
    );
  }

  const weak = found.filter((f) => !f.revoked && f.keyBits < 2048);
  const active = found.filter((f) => !f.revoked);
  let status = "pass";
  const issues = [];

  if (active.length === 0) {
    status = "fail";
    issues.push("All discovered DKIM keys are revoked (empty p= value).");
  } else if (weak.length) {
    status = "warn";
    issues.push(`${weak.length} key(s) are ~1024-bit or smaller — 2048-bit RSA is the current standard.`);
  }

  return verdict(
    status,
    status === "pass"
      ? `DKIM key${active.length > 1 ? "s" : ""} found (${active.map((f) => f.selector).join(", ")})`
      : status === "warn"
        ? "DKIM present but weak"
        : "DKIM keys revoked",
    issues.length
      ? issues.join(" ")
      : `Active DKIM key${active.length > 1 ? "s" : ""} published${active[0].keyBits ? ` (~${active[0].keyBits}-bit)` : ""}${active[0].hint ? ` — matches ${active[0].hint}` : ""}.`,
    issues.length ? "Rotate to a 2048-bit key from your provider's DKIM settings." : "",
    { found },
  );
}

/* ---------------- MX ---------------- */

export async function checkMx(domain) {
  const res = await resolveRecord(domain, "MX");

  if (res.records.length === 0) {
    return verdict(
      "warn",
      "No MX records",
      `${domain} publishes no MX records, so it cannot receive replies or bounce notifications. Sending-only domains sometimes do this deliberately, but replies (and some receiver checks) will fail.`,
      "If this domain should receive mail, add MX records from your email provider.",
      { records: [] },
    );
  }

  const parsed = res.records
    .map((r) => {
      const m = String(r).match(/^(\d+)\s+(.+)$/);
      return m ? { priority: Number(m[1]), host: m[2].replace(/\.$/, "") } : { priority: 0, host: r };
    })
    .sort((a, b) => a.priority - b.priority);

  return verdict(
    "pass",
    `${parsed.length} MX record${parsed.length > 1 ? "s" : ""} configured`,
    `Mail for ${domain} is routed to: ${parsed.map((p) => `${p.host} (priority ${p.priority})`).join(", ")}.`,
    "",
    { records: parsed },
  );
}

/* ---------------- Orchestrator ---------------- */

const WEIGHTS = { spf: 0.3, dkim: 0.3, dmarc: 0.3, mx: 0.1 };
const STATUS_SCORE = { pass: 100, warn: 55, fail: 0 };

export async function runAllChecks(domain, dkimSelector) {
  const [spf, dmarc, dkim, mx] = await Promise.all([
    checkSpf(domain).catch((e) => verdict("error", "SPF lookup failed", friendly(e))),
    checkDmarc(domain).catch((e) => verdict("error", "DMARC lookup failed", friendly(e))),
    checkDkim(domain, dkimSelector).catch((e) => verdict("error", "DKIM lookup failed", friendly(e))),
    checkMx(domain).catch((e) => verdict("error", "MX lookup failed", friendly(e))),
  ]);

  const parts = { spf, dkim, dmarc, mx };
  let weightSum = 0;
  let scoreSum = 0;
  for (const [key, result] of Object.entries(parts)) {
    if (result.status === "error") continue; // network failure ≠ domain failure
    weightSum += WEIGHTS[key];
    scoreSum += STATUS_SCORE[result.status] * WEIGHTS[key];
  }
  const score = weightSum > 0 ? Math.round(scoreSum / weightSum) : 0;

  return { domain, checks: parts, score, checkedAt: Date.now() };
}

function friendly(e) {
  return `The DNS lookup could not be completed (${e?.message || "network error"}). This is a network/resolver issue, not a verdict about the domain — try again.`;
}
