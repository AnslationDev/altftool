// DNS-over-HTTPS (DoH) client. Runs entirely in the browser — queries Google's
// and Cloudflare's public DoH resolvers (both CORS-enabled) so no backend of
// our own is needed. Google is primary; Cloudflare is the fallback if Google
// errors out.
//
// Response shape (RFC 8484 JSON): { Status, Answer?: [{ name, type, TTL, data }] }
// Status 0 = NOERROR, 3 = NXDOMAIN (name doesn't exist).

const RECORD_TYPES = { A: 1, TXT: 16, MX: 15, CNAME: 5 };

async function fetchDoh(url, headers) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`DoH HTTP ${res.status}`);
  return res.json();
}

/**
 * Resolve one record type for a name. Returns
 * { ok, status, records: string[], raw }.
 * TXT records are unquoted and their split chunks are joined back together.
 */
export async function resolveRecord(name, type) {
  const typeNum = RECORD_TYPES[type] || type;
  const encoded = encodeURIComponent(name);

  let json;
  try {
    json = await fetchDoh(`https://dns.google/resolve?name=${encoded}&type=${type}`);
  } catch {
    // Fallback to Cloudflare
    json = await fetchDoh(`https://cloudflare-dns.com/dns-query?name=${encoded}&type=${type}`, {
      Accept: "application/dns-json",
    });
  }

  const answers = (json.Answer || []).filter((a) => a.type === typeNum);
  const records = answers.map((a) => normalizeData(type, a.data));

  return { ok: json.Status === 0, status: json.Status, records, raw: json };
}

// TXT record `data` from DoH arrives wrapped in quotes; long records are split
// into multiple adjacent quoted strings ("part1" "part2") that must be joined
// without a separator to reconstruct the original value.
function normalizeData(type, data) {
  if (type !== "TXT") return String(data).replace(/\.$/, "");
  const chunks = data.match(/"([^"]*)"/g);
  if (chunks) return chunks.map((c) => c.slice(1, -1)).join("");
  return data.replace(/^"|"$/g, "");
}

export function isValidDomain(domain) {
  const clean = normalizeDomain(domain);
  if (!clean) return false;
  return /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i.test(clean);
}

// Accepts a bare domain, a full email address, or a URL and returns just the
// registrable domain part in lowercase.
export function normalizeDomain(input) {
  let value = (input || "").trim().toLowerCase();
  if (!value) return "";
  if (value.includes("@")) value = value.split("@").pop();
  value = value.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
  return value.replace(/\.$/, "");
}
