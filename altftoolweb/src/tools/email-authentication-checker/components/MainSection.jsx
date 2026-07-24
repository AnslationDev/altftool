"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CloudOff,
  ChevronDown,
  Clock3,
  Trash2,
  ExternalLink,
  Info,
  Copy,
  Check,
} from "lucide-react";
import { isValidDomain, normalizeDomain } from "../lib/doh";
import { runAllChecks } from "../lib/authChecks";
import { getHistory, pushHistory, clearHistory } from "../lib/storage";
import { safeCopyText } from "@/shared/utils/clipboard";

const INPUT_CLASS =
  "w-full rounded-xl border border-(--border) bg-(--background) px-3.5 py-2.5 text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25";

const STATUS_META = {
  pass: { icon: CheckCircle2, label: "Pass", text: "text-success", soft: "bg-success-soft", bar: "bg-success" },
  warn: { icon: AlertTriangle, label: "Warning", text: "text-warning", soft: "bg-warning-soft", bar: "bg-warning" },
  fail: { icon: XCircle, label: "Fail", text: "text-danger", soft: "bg-danger-soft", bar: "bg-danger" },
  error: { icon: CloudOff, label: "Lookup failed", text: "text-(--muted-foreground)", soft: "bg-(--muted)", bar: "bg-(--muted-foreground)" },
};

const CHECK_INFO = {
  spf: {
    title: "SPF",
    subtitle: "Sender Policy Framework",
    why: "Lists which servers may send email for your domain. Receivers reject or distrust mail from servers not on the list.",
  },
  dkim: {
    title: "DKIM",
    subtitle: "DomainKeys Identified Mail",
    why: "A cryptographic signature proving the email wasn't altered and really comes from your domain.",
  },
  dmarc: {
    title: "DMARC",
    subtitle: "Domain-based Message Authentication",
    why: "Tells receivers what to do when SPF/DKIM fail, and sends you reports about who is sending as your domain. Required by Gmail & Yahoo for bulk senders.",
  },
  mx: {
    title: "MX",
    subtitle: "Mail Exchange records",
    why: "Where replies and bounces for your domain are delivered. Missing MX breaks two-way email.",
  },
};

function ScoreRing({ score }) {
  const tone = score >= 80 ? STATUS_META.pass : score >= 50 ? STATUS_META.warn : STATUS_META.fail;
  const size = 148;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`Authentication score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" className="stroke-(--muted)" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          className={`transition-[stroke-dashoffset] duration-700 ease-out ${tone.bar.replace("bg-", "stroke-")}`}
          strokeDasharray={c}
          strokeDashoffset={c - (score / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums text-(--foreground)">{score}</span>
        <span className="text-[11px] text-(--muted-foreground)">/ 100</span>
      </div>
    </div>
  );
}

function RecordBlock({ label, value }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (await safeCopyText(value)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  }
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg bg-(--muted) p-2.5">
      <code className="min-w-0 flex-1 break-all font-mono text-[11px] leading-relaxed text-(--foreground)/90">
        {label ? <span className="mr-1 font-semibold text-(--muted-foreground)">{label}</span> : null}
        {value}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy record"
        className="shrink-0 cursor-pointer text-(--muted-foreground) hover:text-(--primary)"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    </div>
  );
}

function CheckCard({ id, result }) {
  const meta = STATUS_META[result.status];
  const info = CHECK_INFO[id];
  const Icon = meta.icon;

  return (
    <details className="group rounded-2xl border border-(--card-border) bg-(--card)/80 shadow-sm backdrop-blur-xl" open={result.status !== "pass"}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.soft}`}>
          <Icon className={`h-4.5 w-4.5 ${meta.text}`} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-(--foreground)">{info.title}</span>
            <span className="text-xs text-(--muted-foreground)">{info.subtitle}</span>
          </span>
          <span className={`text-sm font-medium ${meta.text}`}>{result.title}</span>
        </span>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.soft} ${meta.text}`}>{meta.label}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-(--muted-foreground) transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-(--border) p-4 pt-3">
        <p className="text-sm leading-relaxed text-(--foreground)/85">{result.detail}</p>
        {result.fix && (
          <p className="mt-2 text-xs leading-relaxed text-(--muted-foreground)">
            <strong className="text-(--foreground)/70">Fix:</strong> {result.fix}
          </p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-(--muted-foreground)">
          <strong className="text-(--foreground)/70">Why it matters:</strong> {info.why}
        </p>

        {/* Raw records */}
        {id === "mx" && result.records?.length > 0 &&
          result.records.map((r, i) => <RecordBlock key={i} label={`${r.priority}`} value={r.host} />)}
        {(id === "spf" || id === "dmarc") && result.records?.length > 0 &&
          result.records.map((r, i) => <RecordBlock key={i} value={r} />)}
        {id === "dkim" && result.found?.length > 0 &&
          result.found.map((f, i) => (
            <RecordBlock key={i} label={`${f.selector}${f.hint ? ` (${f.hint})` : ""} · ~${f.keyBits}-bit`} value={f.record.length > 140 ? `${f.record.slice(0, 140)}…` : f.record} />
          ))}
      </div>
    </details>
  );
}

export default function MainSection() {
  const [domainInput, setDomainInput] = useState("");
  const [selector, setSelector] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  async function handleCheck(rawDomain, rawSelector) {
    const domain = normalizeDomain(rawDomain ?? domainInput);
    const dkimSelector = (rawSelector ?? selector).trim() || undefined;

    if (!domain) return setError("Enter a domain to check.");
    if (!isValidDomain(domain)) return setError(`"${domain}" doesn't look like a valid domain.`);

    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await runAllChecks(domain, dkimSelector);
      setResult(res);
      setHistory(pushHistory({ domain, score: res.score }));
    } catch (e) {
      setError(`Checks could not be completed (${e?.message || "network error"}). Check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  }

  function loadFromHistory(entry) {
    setDomainInput(entry.domain);
    setSelector("");
    handleCheck(entry.domain, "");
  }

  const verdictLabel =
    result &&
    (result.score >= 80 ? "Well authenticated" : result.score >= 50 ? "Partially configured" : "Authentication problems");

  return (
    <div className="bg-(--background) text-(--foreground)">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <div className="mb-6 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Email Marketing
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Email Authentication{" "}
            <span className="bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">Checker</span>
          </h1>
          <p className="mt-2 max-w-2xl text-(--muted-foreground) sm:text-lg">
            Check a domain&apos;s live SPF, DKIM, DMARC and MX records — the DNS settings that decide whether your
            email lands in the inbox or gets rejected. Lookups run from your browser via DNS-over-HTTPS.
          </p>
        </div>

        {/* Input card */}
        <div className="rounded-2xl border border-(--card-border) bg-(--card)/80 p-5 shadow-lg backdrop-blur-xl sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheck();
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <label htmlFor="eac-domain" className="mb-1 block text-xs font-semibold text-(--muted-foreground)">
                Domain (or email address)
              </label>
              <input
                id="eac-domain"
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="yourcompany.com"
                autoComplete="off"
                spellCheck={false}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label htmlFor="eac-selector" className="mb-1 block text-xs font-semibold text-(--muted-foreground)">
                DKIM selector <span className="font-normal">(optional)</span>
              </label>
              <input
                id="eac-selector"
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="auto-detect"
                autoComplete="off"
                spellCheck={false}
                className={`${INPUT_CLASS} sm:w-40`}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !domainInput.trim()}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-(--primary) px-5 py-2.5 text-sm font-semibold text-(--primary-foreground) shadow-sm transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                {loading ? "Checking…" : "Check domain"}
              </button>
            </div>
          </form>
          {error && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-danger" role="alert">
              <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
            </p>
          )}
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-(--muted-foreground)">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            DNS lookups go to Google/Cloudflare public DNS-over-HTTPS resolvers — no data is sent to AltFTool&apos;s
            servers. This checks DNS configuration only; it can&apos;t measure sender reputation or actual inbox
            placement.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-5 space-y-3" aria-live="polite">
            {["SPF", "DKIM", "DMARC", "MX"].map((label) => (
              <div key={label} className="flex animate-pulse items-center gap-3 rounded-2xl border border-(--border) bg-(--card)/60 p-4">
                <span className="h-9 w-9 rounded-xl bg-(--muted)" />
                <span className="flex-1">
                  <span className="mb-1.5 block h-3.5 w-24 rounded bg-(--muted)" />
                  <span className="block h-3 w-48 rounded bg-(--muted)" />
                </span>
                <span className="text-xs text-(--muted-foreground)">Checking {label}…</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-5 space-y-4" aria-live="polite">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-(--card-border) bg-(--card)/80 p-6 shadow-lg backdrop-blur-xl sm:flex-row sm:gap-8">
              <ScoreRing score={result.score} />
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-(--foreground)">{verdictLabel}</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Authentication setup for <span className="font-semibold text-(--foreground)">{result.domain}</span> —
                  weighted across SPF (30%), DKIM (30%), DMARC (30%) and MX (10%).
                </p>
                <p className="mt-2 text-xs text-(--muted-foreground)">
                  Blacklist/reputation checks need server-side lookups — use{" "}
                  <a
                    href={`https://check.spamhaus.org/results?query=${encodeURIComponent(result.domain)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium text-(--primary) hover:underline"
                  >
                    Spamhaus <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>{" "}
                  or{" "}
                  <a
                    href={`https://mxtoolbox.com/SuperTool.aspx?action=blacklist%3a${encodeURIComponent(result.domain)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-medium text-(--primary) hover:underline"
                  >
                    MXToolbox <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>{" "}
                  for that part.
                </p>
              </div>
            </div>

            {["spf", "dkim", "dmarc", "mx"].map((id) => (
              <CheckCard key={id} id={id} result={result.checks[id]} />
            ))}
          </div>
        )}

        {/* History */}
        <div className="mt-6 rounded-2xl border border-(--card-border) bg-(--card)/80 p-5 shadow-lg backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-(--foreground)">
              <Clock3 className="h-4 w-4" aria-hidden="true" /> Recent checks ({history.length})
            </h3>
            {history.length > 0 && (
              <button type="button" onClick={() => setHistory(clearHistory())} className="inline-flex cursor-pointer items-center gap-1 text-xs text-(--muted-foreground) hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-(--muted-foreground)">Domains you check will appear here for quick re-checks.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {history.map((entry) => {
                const tone = entry.score >= 80 ? STATUS_META.pass : entry.score >= 50 ? STATUS_META.warn : STATUS_META.fail;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => loadFromHistory(entry)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-(--border) bg-(--background) py-1.5 pl-3.5 pr-2 text-sm text-(--foreground) transition-colors hover:border-(--primary)"
                  >
                    {entry.domain}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tone.soft} ${tone.text}`}>{entry.score}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
