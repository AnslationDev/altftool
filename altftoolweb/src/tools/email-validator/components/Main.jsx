"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  AtSign,
  CheckCircle,
  Clipboard,
  Copy,
  Download,
  Globe,
  Loader2,
  Mail,
  MailCheck,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";

const SAMPLE_EMAILS = `saurabh@gmail.com
support@altftool.com
admin@mailinator.com
hello@gmai.com
bad..dots@example.com
user@invalid-domain.test`;

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "aol.com",
  "rediffmail.com",
  "live.com",
  "msn.com",
  "mail.com",
];

const FREE_PROVIDERS = new Set(COMMON_DOMAINS);
const ROLE_ACCOUNTS = new Set([
  "admin",
  "billing",
  "careers",
  "contact",
  "hello",
  "help",
  "hr",
  "info",
  "marketing",
  "no-reply",
  "noreply",
  "office",
  "sales",
  "security",
  "support",
  "team",
]);
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "temp-mail.org",
  "tempmail.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "getnada.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "mintemail.com",
  "moakt.com",
]);
const SUSPICIOUS_TLDS = new Set(["zip", "mov", "click", "country", "gq", "tk", "ml", "cf"]);

function normalizeEmail(value) {
  return value.trim().replace(/^mailto:/i, "").toLowerCase();
}

function toAsciiDomain(domain) {
  try {
    return new URL(`https://${domain}`).hostname.toLowerCase();
  } catch {
    return domain.toLowerCase();
  }
}

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  return dp[a.length][b.length];
}

function getDomainSuggestion(domain) {
  let best = null;

  COMMON_DOMAINS.forEach((candidate) => {
    const distance = levenshtein(domain, candidate);
    if (!best || distance < best.distance) {
      best = { candidate, distance };
    }
  });

  if (best && best.distance > 0 && best.distance <= 2) return best.candidate;
  return "";
}

function analyzeSyntax(rawEmail) {
  const normalized = normalizeEmail(rawEmail);
  const issues = [];
  const warnings = [];

  if (!normalized) {
    issues.push("Email is empty.");
    return { normalized, local: "", domain: "", asciiDomain: "", issues, warnings };
  }

  if (normalized.length > 254) issues.push("Email exceeds 254 characters.");
  if (/\s/.test(normalized)) issues.push("Email contains spaces.");

  const parts = normalized.split("@");
  if (parts.length !== 2) {
    issues.push("Email must contain exactly one @ symbol.");
    return { normalized, local: parts[0] || "", domain: parts[1] || "", asciiDomain: "", issues, warnings };
  }

  const [local, domainRaw] = parts;
  const domain = domainRaw.toLowerCase();
  const asciiDomain = toAsciiDomain(domain);
  const tld = asciiDomain.split(".").pop() || "";

  if (!local) issues.push("Local part before @ is missing.");
  if (!domain) issues.push("Domain after @ is missing.");
  if (local.length > 64) issues.push("Local part exceeds 64 characters.");
  if (local.startsWith(".") || local.endsWith(".")) issues.push("Local part cannot start or end with a dot.");
  if (local.includes("..")) issues.push("Local part contains consecutive dots.");
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) {
    issues.push("Local part contains unsupported characters.");
  }
  if (domain.startsWith(".") || domain.endsWith(".")) issues.push("Domain cannot start or end with a dot.");
  if (domain.includes("..")) issues.push("Domain contains consecutive dots.");
  if (!/^(?!-)([a-z0-9-]{1,63}\.)+[a-z0-9-]{2,63}$/i.test(asciiDomain)) {
    issues.push("Domain format is invalid.");
  }
  if (SUSPICIOUS_TLDS.has(tld)) warnings.push(`.${tld} domains can be higher risk for abuse.`);

  return { normalized, local, domain, asciiDomain, issues, warnings };
}

async function fetchDnsRecord(domain, type) {
  const response = await fetch(
    `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
  );
  if (!response.ok) throw new Error(`DNS ${type} lookup failed.`);
  return response.json();
}

async function lookupDns(domain) {
  const empty = { mx: [], a: [], aaaa: [], dnsStatus: "not_checked", dnsError: "" };
  if (!domain) return empty;

  try {
    const [mxData, aData, aaaaData] = await Promise.allSettled([
      fetchDnsRecord(domain, "MX"),
      fetchDnsRecord(domain, "A"),
      fetchDnsRecord(domain, "AAAA"),
    ]);

    const mx =
      mxData.status === "fulfilled"
        ? (mxData.value.Answer || [])
            .filter((record) => record.type === 15)
            .map((record) => record.data.replace(/\.$/, ""))
        : [];
    const a =
      aData.status === "fulfilled"
        ? (aData.value.Answer || []).filter((record) => record.type === 1).map((record) => record.data)
        : [];
    const aaaa =
      aaaaData.status === "fulfilled"
        ? (aaaaData.value.Answer || []).filter((record) => record.type === 28).map((record) => record.data)
        : [];

    return {
      mx,
      a,
      aaaa,
      dnsStatus: mx.length ? "mx_found" : a.length || aaaa.length ? "fallback_found" : "not_found",
      dnsError: "",
    };
  } catch (error) {
    return {
      ...empty,
      dnsStatus: "unavailable",
      dnsError: error.message || "DNS lookup unavailable.",
    };
  }
}

function scoreEmail(syntax, dns) {
  const signals = [];
  let score = 100;

  if (syntax.issues.length) {
    score -= 70;
    signals.push({ label: "Invalid syntax", severity: "bad", detail: syntax.issues.join(" ") });
  }

  if (syntax.asciiDomain && DISPOSABLE_DOMAINS.has(syntax.asciiDomain)) {
    score -= 35;
    signals.push({ label: "Disposable domain", severity: "bad", detail: "Temporary inbox providers are risky for signups and leads." });
  }

  if (syntax.local && ROLE_ACCOUNTS.has(syntax.local)) {
    score -= 12;
    signals.push({ label: "Role-based inbox", severity: "warn", detail: "Shared inboxes can be useful, but they are weaker for person-level outreach." });
  }

  if (syntax.asciiDomain && FREE_PROVIDERS.has(syntax.asciiDomain)) {
    score -= 4;
    signals.push({ label: "Free provider", severity: "info", detail: "Fine for personal users, weaker for B2B lead quality." });
  }

  if (!syntax.issues.length && dns.dnsStatus === "mx_found") {
    signals.push({ label: "MX records found", severity: "good", detail: "Domain is configured to receive email." });
  } else if (!syntax.issues.length && dns.dnsStatus === "fallback_found") {
    score -= 12;
    signals.push({ label: "No MX, address records found", severity: "warn", detail: "Some domains receive mail without MX, but deliverability is less certain." });
  } else if (!syntax.issues.length && dns.dnsStatus === "not_found") {
    score -= 45;
    signals.push({ label: "No DNS records", severity: "bad", detail: "Domain did not return MX, A, or AAAA records." });
  } else if (!syntax.issues.length && dns.dnsStatus === "unavailable") {
    score -= 8;
    signals.push({ label: "DNS lookup unavailable", severity: "warn", detail: dns.dnsError || "Could not verify domain DNS." });
  }

  syntax.warnings.forEach((warning) => {
    score -= 8;
    signals.push({ label: "Domain warning", severity: "warn", detail: warning });
  });

  const suggestion = syntax.asciiDomain ? getDomainSuggestion(syntax.asciiDomain) : "";
  if (suggestion) {
    score -= 20;
    signals.push({ label: "Possible typo", severity: "warn", detail: `Did you mean ${syntax.local}@${suggestion}?` });
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const status = syntax.issues.length
    ? "Invalid"
    : finalScore >= 80
      ? "Valid"
      : finalScore >= 55
        ? "Risky"
        : "Poor";

  return { score: finalScore, status, signals, suggestion };
}

async function validateEmail(rawEmail) {
  const syntax = analyzeSyntax(rawEmail);
  const dns = syntax.issues.length
    ? { mx: [], a: [], aaaa: [], dnsStatus: "not_checked", dnsError: "" }
    : await lookupDns(syntax.asciiDomain);
  const assessment = scoreEmail(syntax, dns);

  return {
    raw: rawEmail,
    ...syntax,
    ...dns,
    ...assessment,
  };
}

function parseEmailCandidates(input) {
  return Array.from(
    new Set(
      input
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function createReport(result) {
  if (!result) return "";

  return [
    `Email: ${result.normalized}`,
    `Status: ${result.status}`,
    `Score: ${result.score}/100`,
    `Domain: ${result.asciiDomain || "N/A"}`,
    `DNS: ${result.dnsStatus}`,
    `MX: ${result.mx.length ? result.mx.join(" | ") : "None"}`,
    result.suggestion ? `Suggestion: ${result.local}@${result.suggestion}` : "",
    "",
    "Signals:",
    ...result.signals.map((signal) => `- ${signal.label}: ${signal.detail}`),
  ].filter(Boolean).join("\n");
}

function exportCsv(rows) {
  const header = ["Email", "Status", "Score", "Domain", "DNS Status", "MX Records", "Suggestion", "Signals"];
  const body = rows.map((row) => [
    row.normalized,
    row.status,
    row.score,
    row.asciiDomain,
    row.dnsStatus,
    row.mx.join(" | "),
    row.suggestion ? `${row.local}@${row.suggestion}` : "",
    row.signals.map((signal) => signal.label).join(" | "),
  ]);
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "email-validation-results.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function statusTone(status) {
  if (status === "Valid") return "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
  if (status === "Risky") return "text-amber-600 bg-amber-500/10 border-amber-500/30";
  if (status === "Poor") return "text-orange-600 bg-orange-500/10 border-orange-500/30";
  return "text-red-600 bg-red-500/10 border-red-500/30";
}

function SignalIcon({ severity }) {
  if (severity === "good") return <CheckCircle className="h-4 w-4 text-emerald-600" />;
  if (severity === "bad") return <XCircle className="h-4 w-4 text-red-600" />;
  if (severity === "warn") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  return <ShieldCheck className="h-4 w-4 text-(--primary)" />;
}

function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--card) p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold text-(--foreground)">{value}</p>
          {detail && <p className="mt-1 text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const [singleEmail, setSingleEmail] = useState("saurabh@gmail.com");
  const [bulkInput, setBulkInput] = useState(SAMPLE_EMAILS);
  const [singleResult, setSingleResult] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [activeMode, setActiveMode] = useState("single");
  const [isValidating, setIsValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");

  const bulkStats = useMemo(() => {
    const total = bulkResults.length;
    const valid = bulkResults.filter((row) => row.status === "Valid").length;
    const risky = bulkResults.filter((row) => row.status === "Risky" || row.status === "Poor").length;
    const invalid = bulkResults.filter((row) => row.status === "Invalid").length;
    const averageScore = total
      ? Math.round(bulkResults.reduce((sum, row) => sum + row.score, 0) / total)
      : 0;
    return { total, valid, risky, invalid, averageScore };
  }, [bulkResults]);

  const validateSingle = async () => {
    setIsValidating(true);
    setStatus("Checking syntax, domain, and MX records...");

    try {
      const result = await validateEmail(singleEmail);
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      setSingleResult(result);
      setStatus(`${result.status} email. Score ${result.score}/100.`);
    } catch {
      setStatus("Could not validate this email. Try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const validateBulk = async () => {
    const candidates = parseEmailCandidates(bulkInput).slice(0, 100);
    setIsValidating(true);
    setStatus(`Validating ${candidates.length} email${candidates.length === 1 ? "" : "s"}...`);

    try {
      const results = [];
      for (const email of candidates) {
        results.push(await validateEmail(email));
      }
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      setBulkResults(results);
      setStatus(`Bulk validation finished for ${results.length} emails.`);
    } catch {
      setStatus("Bulk validation failed. Check your connection and try again.");
    } finally {
      setIsValidating(false);
    }
  };

  const copyReport = async () => {
    const text = activeMode === "single"
      ? createReport(singleResult)
      : bulkResults.map(createReport).join("\n\n---\n\n");
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 py-8 text-(--foreground)">
      <div className="text-center">
        <h1 className="heading">Email Validator</h1>
        <p className="description mt-3">
          Validate email syntax, domain DNS, MX records, typo risk, disposable
          domains, and bulk contact lists directly in the browser.
        </p>
      </div>

      <section className="mt-8 rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row 2xl:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <MailCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Validation Workspace</h2>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                Use single mode for one address or bulk mode for lead lists.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ["single", Mail, "Single"],
              ["bulk", AtSign, "Bulk"],
            ].map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setActiveMode(mode)}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  activeMode === mode
                    ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                    : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeMode === "single" ? (
          <div className="mt-6 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_auto]">
            <input
              type="email"
              value={singleEmail}
              onChange={(event) => setSingleEmail(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") validateSingle();
              }}
              className="w-full rounded-lg border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary)"
              placeholder="name@example.com"
            />
            <button
              type="button"
              onClick={validateSingle}
              disabled={isValidating}
              className="btn-primary"
            >
              {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
              {isValidating ? "Checking..." : "Validate Email"}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <textarea
              value={bulkInput}
              onChange={(event) => setBulkInput(event.target.value)}
              className="min-h-52 w-full resize-y rounded-lg border border-(--border) bg-(--background) px-4 py-3 font-mono text-sm leading-6 text-(--foreground) outline-none transition focus:border-(--primary)"
              placeholder="Paste one email per line, or comma-separated emails..."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={validateBulk}
                disabled={isValidating}
                className="btn-primary"
              >
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchCheck className="h-4 w-4" />}
                {isValidating ? "Checking List..." : "Validate List"}
              </button>
              <button
                type="button"
                onClick={() => setBulkInput(SAMPLE_EMAILS)}
                className="btn-secondary"
              >
                <Sparkles className="h-4 w-4" />
                Load Sample
              </button>
              <button
                type="button"
                onClick={() => {
                  setBulkInput("");
                  setBulkResults([]);
                }}
                className="btn-secondary"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        )}
      </section>

      {!!status && (
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
          {isValidating ? (
            <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" />
          ) : (
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{status}</p>
        </div>
      )}

      {activeMode === "single" && singleResult && (
        <section className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-(--border) bg-(--card) p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className={`inline-flex rounded-lg border px-3 py-1 text-sm font-semibold ${statusTone(singleResult.status)}`}>
                  {singleResult.status} - {singleResult.score}/100
                </div>
                <h2 className="mt-4 text-2xl font-bold text-(--foreground)">
                  {singleResult.normalized}
                </h2>
                <p className="mt-2 text-sm text-(--muted-foreground)">
                  DNS status: {singleResult.dnsStatus.replaceAll("_", " ")}
                </p>
              </div>
              <button type="button" onClick={copyReport} className="btn-secondary">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="tool-card-grid mt-6">
              <MetricCard
                icon={Globe}
                label="Domain"
                value={singleResult.asciiDomain || "N/A"}
                detail={singleResult.mx.length ? `${singleResult.mx.length} MX record(s)` : "No MX record found"}
              />
              <MetricCard
                icon={ShieldAlert}
                label="Risk Signals"
                value={singleResult.signals.length}
                detail={singleResult.suggestion ? `Suggestion: ${singleResult.local}@${singleResult.suggestion}` : "No typo suggestion"}
              />
              <MetricCard
                icon={MailCheck}
                label="Mailbox Check"
                value="Not pinged"
                detail="Mailbox existence needs SMTP or confirmation email."
              />
            </div>

            <div className="mt-6 space-y-3">
              {singleResult.signals.map((signal) => (
                <div
                  key={`${signal.label}-${signal.detail}`}
                  className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--background) p-4"
                >
                  <SignalIcon severity={signal.severity} />
                  <div>
                    <p className="font-semibold text-(--foreground)">{signal.label}</p>
                    <p className="mt-1 text-sm text-(--muted-foreground)">{signal.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-(--border) bg-(--card) p-5">
              <h2 className="font-semibold text-(--foreground)">DNS Records</h2>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  ["MX", singleResult.mx],
                  ["A", singleResult.a],
                  ["AAAA", singleResult.aaaa],
                ].map(([label, values]) => (
                  <div key={label} className="rounded-lg bg-(--background) p-3">
                    <p className="font-semibold text-(--foreground)">{label}</p>
                    <p className="mt-1 break-words text-(--muted-foreground)">
                      {values.length ? values.join(" | ") : "No records"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 text-amber-700">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm">
                  This tool validates format and domain readiness. It does not
                  prove the exact mailbox exists or can receive a message.
                </p>
              </div>
            </section>
          </aside>
        </section>
      )}

      {activeMode === "bulk" && !!bulkResults.length && (
        <section className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard icon={Mail} label="Total" value={bulkStats.total} />
            <MetricCard icon={CheckCircle} label="Valid" value={bulkStats.valid} />
            <MetricCard icon={AlertTriangle} label="Risky" value={bulkStats.risky} />
            <MetricCard icon={XCircle} label="Invalid" value={bulkStats.invalid} />
          </div>

          <div className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Bulk Results</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Average quality score: {bulkStats.averageScore}/100.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={copyReport} className="btn-secondary">
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy Report"}
                </button>
                <button type="button" onClick={() => exportCsv(bulkResults)} className="btn-primary">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-(--border)">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-(--background) text-xs uppercase text-(--muted-foreground)">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">DNS</th>
                    <th className="px-4 py-3">Suggestion</th>
                    <th className="px-4 py-3">Signals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {bulkResults.map((row) => (
                    <tr key={row.normalized} className="bg-(--card)">
                      <td className="px-4 py-3 font-medium text-(--foreground)">{row.normalized}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusTone(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-(--foreground)">{row.score}/100</td>
                      <td className="px-4 py-3 text-(--foreground)">{row.dnsStatus.replaceAll("_", " ")}</td>
                      <td className="px-4 py-3 text-(--foreground)">
                        {row.suggestion ? `${row.local}@${row.suggestion}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-(--muted-foreground)">
                        {row.signals.map((signal) => signal.label).join(", ") || "No signals"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
