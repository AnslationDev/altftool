import { NextResponse } from "next/server";
import { enforceRateLimit, jsonResponse } from "@altftool/core/http";

export const runtime = "nodejs";
export const revalidate = 900;

const DNS_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CAA"];

function validationError(message) {
  const error = new Error(message);
  error.expose = true;
  return error;
}

function normalizeDomain(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || raw.length > 253) throw validationError("Enter a valid domain name.");
  let hostname;
  try { hostname = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname; }
  catch { throw validationError("Enter a valid domain name."); }
  hostname = hostname.replace(/^www\./, "").replace(/\.$/, "");
  const labels = hostname.split(".");
  if (labels.length < 2 || labels.some((label) => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) {
    throw validationError("Enter a public domain such as example.com.");
  }
  return hostname;
}

function normalizeSelector(value) {
  const selector = String(value || "").trim().toLowerCase();
  if (!selector) return "";
  if (selector.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(selector)) throw validationError("Enter a valid DKIM selector.");
  return selector;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 4_500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timeout); }
}

async function dnsQuery(name, type) {
  const url = new URL("https://dns.google/resolve");
  url.searchParams.set("name", name); url.searchParams.set("type", type); url.searchParams.set("cd", "false");
  const response = await fetchWithTimeout(url, { headers: { accept: "application/dns-json" }, next: { revalidate } });
  if (!response.ok) throw new Error(`DNS ${type} lookup failed.`);
  const payload = await response.json();
  return (payload.Answer || []).map((answer) => ({ name: answer.name, type: answer.type, ttl: answer.TTL, data: answer.data }));
}

async function rdapQuery(domain) {
  try {
    const response = await fetchWithTimeout(`https://rdap.org/domain/${encodeURIComponent(domain)}`, { headers: { accept: "application/rdap+json" }, next: { revalidate } });
    if (!response.ok) return null;
    const payload = await response.json();
    return {
      handle: payload.handle || null,
      status: payload.status || [],
      nameservers: (payload.nameservers || []).map((item) => item.ldhName).filter(Boolean),
      events: (payload.events || []).filter((item) => ["registration", "expiration", "last changed"].includes(item.eventAction)),
    };
  } catch { return null; }
}

function hasTxt(records, prefix) {
  return records.some((record) => record.data.replace(/^"|"$/g, "").toLowerCase().startsWith(prefix));
}

export async function GET(request) {
  const limited = enforceRateLimit(NextResponse, request, { limit: 20, scope: "domainops", windowMs: 60_000 });
  if (limited) return limited;
  try {
    const { searchParams } = new URL(request.url);
    const domain = normalizeDomain(searchParams.get("domain"));
    const selector = normalizeSelector(searchParams.get("selector"));
    const recordEntries = await Promise.all(DNS_TYPES.map(async (type) => {
      try { return [type, await dnsQuery(domain, type)]; } catch { return [type, []]; }
    }));
    const records = Object.fromEntries(recordEntries);
    const [dmarc, dkim, rdap] = await Promise.all([
      dnsQuery(`_dmarc.${domain}`, "TXT").catch(() => []),
      selector ? dnsQuery(`${selector}._domainkey.${domain}`, "TXT").catch(() => []) : Promise.resolve([]),
      rdapQuery(domain),
    ]);
    records.DMARC = dmarc; if (selector) records.DKIM = dkim; records.RDAP = rdap;
    const checks = {
      address: records.A.length > 0 || records.AAAA.length > 0,
      nameservers: records.NS.length >= 2,
      mail: records.MX.length > 0,
      spf: hasTxt(records.TXT, "v=spf1"),
      dmarc: hasTxt(dmarc, "v=dmarc1"),
      caa: records.CAA.length > 0,
      dkim: !selector || hasTxt(dkim, "v=dkim1") || dkim.length > 0,
      registration: Boolean(rdap),
    };
    const weights = { address: 20, nameservers: 15, mail: 10, spf: 15, dmarc: 20, caa: 10, registration: 10 };
    const score = Object.entries(weights).reduce((sum, [key, weight]) => sum + (checks[key] ? weight : 0), 0);
    const findings = [
      ["address", "Website address", checks.address ? "An A or AAAA address record is published." : "No A or AAAA address record was found."],
      ["nameservers", "DNS redundancy", checks.nameservers ? "At least two nameserver records are published." : "Publish at least two authoritative nameservers."],
      ["mail", "Mail routing", checks.mail ? "Mail exchanger records are published." : "No MX records were found; this is acceptable only if the domain does not receive email."],
      ["spf", "SPF policy", checks.spf ? "An SPF policy was found." : "No SPF policy was detected in root TXT records."],
      ["dmarc", "DMARC policy", checks.dmarc ? "A DMARC policy was found." : "No DMARC policy was found at the standard hostname."],
      ["caa", "Certificate authority policy", checks.caa ? "CAA records restrict certificate issuance." : "No CAA policy was found; adding one can reduce certificate issuance risk."],
      ["registration", "Registration data", checks.registration ? "Public RDAP registration data was available." : "The RDAP provider did not return registration data."],
      ...(selector ? [["dkim", `DKIM selector: ${selector}`, checks.dkim ? "A DKIM key record was found." : "No DKIM key was found for this selector."]] : []),
    ].map(([id, label, message]) => ({ id, label, message, passed: checks[id] }));
    return jsonResponse(NextResponse, { domain, checkedAt: new Date().toISOString(), score, findings, records, sources: ["Google Public DNS over HTTPS", "RDAP.org bootstrap service"] }, { cache: { sMaxage: revalidate, staleWhileRevalidate: 3600 } });
  } catch (error) {
    const exposed = error?.expose === true;
    return jsonResponse(NextResponse, { error: exposed ? error.message : "Domain report failed." }, { status: exposed ? 400 : 500, headers: { "Cache-Control": "no-store" } });
  }
}
