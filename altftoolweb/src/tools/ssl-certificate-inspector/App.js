"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  FileJson,
  FileText,
  FileType,
  Globe,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  Network,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Timer,
} from "lucide-react";
import { useSslInspector } from "@/tools/ssl-certificate-inspector/hooks/useSslInspector";
import {
  buildTextReport,
  copyToClipboard,
  downloadJSON,
  downloadPDF,
  downloadTXT,
} from "@/tools/ssl-certificate-inspector/utils/export";

const statusStyles = {
  valid: "bg-green-500/10 text-green-500 border-green-500/20",
  expired: "bg-red-500/10 text-red-500 border-red-500/20",
  invalid: "bg-red-500/10 text-red-500 border-red-500/20",
  "self-signed": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  error: "bg-red-500/10 text-red-500 border-red-500/20",
  info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

function titleCase(value = "") {
  return String(value || "N/A")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function formatNameObject(value = {}) {
  const pairs = Object.entries(value || {}).filter(([, item]) => item);
  if (!pairs.length) return "N/A";
  return pairs.map(([key, item]) => `${key}: ${item}`).join(" | ");
}

function warningLabel(daysRemaining) {
  if (daysRemaining === null || daysRemaining === undefined) return "Unknown";
  if (daysRemaining < 0) return "Expired";
  if (daysRemaining <= 7) return "Critical";
  if (daysRemaining <= 15) return "High";
  if (daysRemaining <= 30) return "Warning";
  return "Healthy";
}

function formatCipherSuite(value) {
  if (!value || value === "Unknown") return "Negotiated protocol";
  return String(value)
    .replace(/^TLS_/i, "")
    .replace(/_/g, "-")
    .replace(/-WITH-/i, " ");
}

function formatDnsRecords(records = []) {
  if (!records.length) return "N/A";
  return records.map((record) => record.address).join(", ");
}

const StatusBadge = ({ status, type = "info", animate = false }) => (
  <div
    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold font-secondary ${
      statusStyles[type] || statusStyles.info
    }`}
  >
    {animate && (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
      </span>
    )}
    {status || "Ready"}
  </div>
);

const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`relative overflow-hidden bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/40 hover:shadow-cyan-500/10 ${className}`}
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
    <div className="flex items-center gap-3 mb-6 border-b border-(--border) pb-4">
      <div className="p-2 rounded-lg bg-(--background) border border-(--border) text-cyan-500">
        {Icon && <Icon size={18} />}
      </div>
      <h3 className="font-primary font-bold text-lg text-(--foreground)">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const DataRow = ({ label, value, highlight = false }) => (
  <div className="flex items-start justify-between gap-4 py-1.5 border-b border-(--border)/30 last:border-0">
    <span className="text-[13px] font-secondary text-(--muted-foreground) shrink-0">{label}</span>
    <span
      className={`min-w-0 text-[13px] font-semibold font-secondary text-right break-words ${
        highlight ? "text-cyan-500" : "text-(--foreground)"
      }`}
    >
      {value || "N/A"}
    </span>
  </div>
);

const MetricCard = ({ label, value, icon: Icon, tone = "cyan", sublabel }) => {
  const tones = {
    cyan: "text-cyan-500 border-cyan-500/20 bg-cyan-500/10",
    green: "text-green-500 border-green-500/20 bg-green-500/10",
    amber: "text-orange-500 border-orange-500/20 bg-orange-500/10",
    red: "text-red-500 border-red-500/20 bg-red-500/10",
    violet: "text-violet-500 border-violet-500/20 bg-violet-500/10",
  };

  return (
    <div className="h-full rounded-xl border border-(--border) bg-(--card) p-5 transition-all duration-300 hover:border-cyan-500/30">
      <div className="flex min-h-32 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <p className="min-w-0 text-[11px] uppercase tracking-wider font-bold text-(--muted-foreground)">
            {label}
          </p>
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${tones[tone] || tones.cyan}`}>
            {Icon && <Icon size={20} />}
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-black font-primary leading-tight text-(--foreground)">
            {value || "N/A"}
          </p>
          {sublabel && (
            <p className="mt-2 max-w-full text-sm leading-snug text-(--muted-foreground) break-words">
              {sublabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function InputPanel({ domainInput, setDomainInput, loading, inspect, loadSamples, domains }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    inspect();
  };

  return (
    <InfoCard title="Domain Input" icon={Globe} className="lg:col-span-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={domainInput}
          onChange={(event) => setDomainInput(event.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="google.com&#10;https://github.com&#10;openai.com"
          className="w-full resize-y rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-sm font-secondary text-(--foreground) outline-none transition-all focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/10"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-(--muted-foreground)">
            {domains.length || 0} target{domains.length === 1 ? "" : "s"} queued. Supports domain, HTTP URL, and HTTPS URL.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={loadSamples}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-(--background) border border-(--border) hover:bg-(--card) transition-all active:scale-95 text-sm font-bold text-(--foreground)"
            >
              <Sparkles size={16} className="text-violet-500" />
              Load Samples
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 text-sm font-bold"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {loading ? "Scanning TLS" : "Lookup SSL"}
            </button>
          </div>
        </div>
      </form>
    </InfoCard>
  );
}

function ActionRow({ results, copied, setCopied }) {
  const hasResults = results.length > 0;

  const handleCopy = async () => {
    if (!hasResults) return;
    const success = await copyToClipboard(buildTextReport(results));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-3">
      <button
        onClick={handleCopy}
        disabled={!hasResults}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-(--background) border border-(--border) hover:bg-(--card) disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm text-(--foreground)"
      >
        <Clipboard className={`w-4 h-4 ${copied ? "text-green-500" : "text-cyan-500"}`} />
        <span className="text-sm font-bold whitespace-nowrap">{copied ? "Copied Report" : "Copy Report"}</span>
      </button>

      <div className="w-full md:w-auto relative group/export">
        <button
          disabled={!hasResults}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-bold whitespace-nowrap">Export Report</span>
        </button>
        {hasResults && (
          <div className="absolute top-full right-0 mt-2 w-52 bg-(--card) border border-(--border) rounded-lg shadow-xl py-2 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-20 translate-y-1 group-hover/export:translate-y-0">
            <button
              onClick={() => downloadJSON(results)}
              className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-cyan-500/5 text-sm font-medium"
            >
              <FileJson size={15} className="text-cyan-500" />
              Download JSON
            </button>
            <button
              onClick={() => downloadTXT(results)}
              className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-cyan-500/5 text-sm font-medium"
            >
              <FileText size={15} className="text-green-500" />
              Download TXT
            </button>
            <button
              onClick={() => downloadPDF(results)}
              className="w-full flex items-center gap-2 text-left px-4 py-2 hover:bg-cyan-500/5 text-sm font-medium"
            >
              <FileType size={15} className="text-orange-500" />
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-(--card) border border-dashed border-(--border) rounded-2xl p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-500">
        <ShieldCheck size={22} />
      </div>
      <h3 className="text-lg font-bold text-(--foreground)">Ready for live certificate inspection</h3>
      <p className="mt-2 text-sm text-(--muted-foreground)">
        Enter one or more public domains and run a lookup to retrieve real TLS certificate data.
      </p>
    </div>
  );
}

function ErrorPanel({ error }) {
  if (!error) return null;
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p className="font-semibold break-words">{error}</p>
      </div>
    </div>
  );
}

function SummaryCards({ result }) {
  if (!result) return null;

  const status = result.validation?.status || "error";
  const daysRemaining = result.validation?.daysRemaining;
  const isValid = status === "valid";
  const isWarning = daysRemaining !== null && daysRemaining !== undefined && daysRemaining <= 30;

  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
      <MetricCard
        label="SSL Status"
        value={titleCase(status)}
        sublabel={result.validation?.authorizationError || "Validated by Node TLS"}
        icon={isValid ? ShieldCheck : ShieldX}
        tone={isValid ? "green" : status === "self-signed" ? "amber" : "red"}
      />
      <MetricCard
        label="TLS Version"
        value={result.tls?.version || "N/A"}
        sublabel={formatCipherSuite(result.tls?.standardName || result.tls?.cipher)}
        icon={Lock}
        tone={result.tls?.version === "TLSv1.3" ? "green" : "cyan"}
      />
      <MetricCard
        label="Expiry"
        value={daysRemaining === null || daysRemaining === undefined ? "Unknown" : `${daysRemaining} days`}
        sublabel={`${warningLabel(daysRemaining)} | ${formatDate(result.certificate?.validTo)}`}
        icon={Timer}
        tone={isWarning ? "amber" : "violet"}
      />
      <MetricCard
        label="Security Grade"
        value={result.validation?.grade || "N/A"}
        sublabel={result.redirect?.redirectsToHttps ? "HTTP to HTTPS verified" : "HTTP redirect not verified"}
        icon={Activity}
        tone={result.validation?.grade === "A+" || result.validation?.grade === "A" ? "green" : "amber"}
      />
    </div>
  );
}

function SanList({ names = [] }) {
  if (!names.length) {
    return <p className="text-sm text-(--muted-foreground)">No SAN names exposed by the certificate.</p>;
  }

  return (
    <div className="max-h-52 overflow-auto rounded-xl border border-(--border) bg-(--background) p-3">
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <span
            key={name}
            className="max-w-full rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-500 break-all"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function CertificateChain({ result }) {
  const chain = [...(result?.chain || [])].reverse();

  if (!chain.length) {
    return <p className="text-sm text-(--muted-foreground)">Certificate chain was not returned.</p>;
  }

  return (
    <div className="space-y-3">
      {chain.map((cert, index) => {
        const isLeaf = index === chain.length - 1;
        return (
          <div key={`${cert.fingerprint256 || cert.serialNumber}-${index}`} className="relative">
            <div className="rounded-xl border border-(--border) bg-(--background) p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-(--muted-foreground)">
                    {index === 0 ? "Root CA" : isLeaf ? "Website Certificate" : "Intermediate CA"}
                  </p>
                  <p className="mt-1 text-sm font-black text-(--foreground) break-words">
                    {cert.commonName}
                  </p>
                  <p className="text-xs text-(--muted-foreground) break-words">{cert.issuerName}</p>
                </div>
                <StatusBadge status={cert.ca ? "CA" : "Leaf"} type={cert.ca ? "info" : "valid"} />
              </div>
              <p className="mt-3 text-[11px] font-mono text-(--muted-foreground) break-all">
                {cert.fingerprint256 || cert.fingerprint || cert.serialNumber}
              </p>
            </div>
            {!isLeaf && (
              <div className="mx-auto my-2 h-5 w-px bg-gradient-to-b from-cyan-500/70 to-transparent" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ComparisonTable({ results }) {
  if (results.length <= 1) return null;

  return (
    <InfoCard title="Multi-Domain Comparison" icon={Network} className="lg:col-span-2">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-(--border) text-left text-[11px] uppercase tracking-wider text-(--muted-foreground)">
              <th className="py-3 pr-4">Domain</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">TLS</th>
              <th className="py-3 pr-4">Issuer</th>
              <th className="py-3 pr-4">Expires</th>
              <th className="py-3 pr-4">Grade</th>
              <th className="py-3 pr-4">Redirect</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={`${result.input}-${result.inspectedAt}`} className="border-b border-(--border)/40 last:border-0">
                <td className="py-3 pr-4 font-bold text-(--foreground) break-all">{result.host || result.input}</td>
                <td className="py-3 pr-4">{titleCase(result.validation?.status || "error")}</td>
                <td className="py-3 pr-4">{result.tls?.version || "N/A"}</td>
                <td className="py-3 pr-4 break-words">{result.certificate?.issuerName || "N/A"}</td>
                <td className="py-3 pr-4">{formatDate(result.certificate?.validTo)}</td>
                <td className="py-3 pr-4 font-black">{result.validation?.grade || "N/A"}</td>
                <td className="py-3 pr-4">{result.redirect?.redirectsToHttps ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </InfoCard>
  );
}

function ResultDetails({ result }) {
  if (!result) return <EmptyState />;
  if (result.error) {
    return (
      <InfoCard title="Lookup Error" icon={AlertTriangle} className="border-red-500/20">
        <p className="text-sm font-semibold text-red-500 break-words">{result.error.message}</p>
        <DataRow label="Target" value={result.input} />
        <DataRow label="HTTPS" value="Disabled or unreachable" />
      </InfoCard>
    );
  }

  return (
    <div className="space-y-8">
      <SummaryCards result={result} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InfoCard title="Certificate Details" icon={KeyRound}>
          <DataRow label="Common Name" value={result.certificate?.commonName} highlight />
          <DataRow label="Organization" value={result.certificate?.organization} />
          <DataRow label="Country" value={result.certificate?.country} />
          <DataRow label="Subject" value={formatNameObject(result.certificate?.subject)} />
          <DataRow label="Serial Number" value={result.certificate?.serialNumber} />
          <DataRow label="SHA256 Fingerprint" value={result.certificate?.fingerprint256} highlight />
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-wider text-(--muted-foreground) mb-2 font-bold">
              Subject Alternative Names
            </p>
            <SanList names={result.certificate?.subjectAltNames} />
          </div>
        </InfoCard>

        <InfoCard title="Issuer Information" icon={ShieldCheck}>
          <DataRow label="Certificate Authority" value={result.certificate?.issuerName} highlight />
          <DataRow label="Issuer" value={formatNameObject(result.certificate?.issuer)} />
          <DataRow label="Issue Date" value={formatDate(result.certificate?.validFrom)} />
          <DataRow label="Expiry Date" value={formatDate(result.certificate?.validTo)} highlight />
          <DataRow
            label="Days Remaining"
            value={
              result.validation?.daysRemaining === null || result.validation?.daysRemaining === undefined
                ? "N/A"
                : `${result.validation.daysRemaining} Days Remaining`
            }
          />
          <div className="rounded-xl border border-(--border) bg-(--background) p-3">
            <p className="text-[10px] uppercase tracking-wider font-bold text-(--muted-foreground)">
              Expiry Warning
            </p>
            <p className="mt-1 text-sm font-black text-(--foreground)">
              {warningLabel(result.validation?.daysRemaining)}
            </p>
          </div>
        </InfoCard>

        <InfoCard title="TLS & HTTPS" icon={Lock}>
          <DataRow label="HTTPS Availability" value={result.https?.enabled ? "Enabled" : "Disabled"} highlight />
          <DataRow label="TLS Version" value={result.tls?.version} highlight />
          <DataRow label="Cipher" value={result.tls?.standardName || result.tls?.cipher} />
          <DataRow label="DNS Records" value={formatDnsRecords(result.dns)} />
          <DataRow label="Port" value={result.https?.port ? String(result.https.port) : "443"} />
          <DataRow label="HTTP Status" value={result.redirect?.statusCode ? String(result.redirect.statusCode) : "N/A"} />
          <DataRow label="HTTP to HTTPS Redirect" value={result.redirect?.redirectsToHttps ? "Enabled" : "Not detected"} />
          <DataRow
            label="Lookup Time"
            value={result.responseTimeMs ? `${result.responseTimeMs} ms` : "N/A"}
          />
          {result.redirect?.location && (
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-wider text-(--muted-foreground) mb-2 font-bold">
                Redirect Location
              </p>
              <p className="rounded-lg border border-(--border) bg-(--background) p-3 text-[11px] font-mono break-all">
                {result.redirect.location}
              </p>
            </div>
          )}
        </InfoCard>

        <InfoCard title="Security Summary" icon={Activity}>
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
            <p className="text-[11px] uppercase tracking-wider font-bold text-cyan-500">Quick Report</p>
            <p className="mt-3 text-sm leading-7 text-(--foreground)">
              SSL Status: <strong>{titleCase(result.summary?.sslStatus)}</strong>
              <br />
              TLS: <strong>{result.summary?.tls || "N/A"}</strong>
              <br />
              Expiry: <strong>{result.summary?.expiry || "N/A"}</strong>
              <br />
              Grade: <strong>{result.summary?.grade || "N/A"}</strong>
              <br />
              Live lookup: <strong>{result.responseTimeMs ? `${result.responseTimeMs} ms` : "N/A"}</strong>
            </p>
          </div>
          {result.validation?.warnings?.length ? (
            <div className="space-y-2">
              {result.validation.warnings.map((warning) => (
                <div key={warning} className="flex items-start gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 text-orange-500">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span className="text-xs font-bold break-words">{warning}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-green-500">
              <CheckCircle2 size={15} />
              <span className="text-xs font-bold">No immediate certificate warnings detected.</span>
            </div>
          )}
        </InfoCard>

        <InfoCard title="Certificate Chain Viewer" icon={Link2}>
          <CertificateChain result={result} />
        </InfoCard>

        <InfoCard title="Certificate Transparency" icon={Network}>
          <DataRow
            label="SCT Exposed"
            value={result.certificateTransparency?.available ? "Available" : "Not exposed"}
            highlight={result.certificateTransparency?.available}
          />
          <div className="rounded-xl border border-(--border) bg-(--background) p-3">
            <p className="text-xs text-(--muted-foreground) break-words">
              {result.certificateTransparency?.note || "Certificate transparency metadata was not returned."}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-(--muted-foreground) font-bold">OCSP</p>
            {(result.certificateTransparency?.ocsp || []).length ? (
              result.certificateTransparency.ocsp.map((url) => (
                <p key={url} className="text-[11px] font-mono rounded-lg border border-(--border) bg-(--background) p-2 break-all">
                  {url}
                </p>
              ))
            ) : (
              <p className="text-xs text-(--muted-foreground)">No OCSP URL exposed.</p>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

const Features = () => {
  const features = [
    {
      title: "Real TLS Lookup",
      description: "Certificate data is retrieved through a Node TLS endpoint, not browser-side mock data.",
    },
    {
      title: "Expiry Monitoring",
      description: "Issue date, expiry date, days remaining, and warning levels are calculated from the live certificate.",
    },
    {
      title: "Chain Inspection",
      description: "Root, intermediate, and website certificates are rendered from the peer certificate chain.",
    },
    {
      title: "Export & Copy",
      description: "Copy the report or download JSON, TXT, and PDF outputs from the latest real inspection.",
    },
  ];

  return (
    <section className="py-12 mt-6 border-t border-(--border)">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-(--card) rounded-2xl border border-(--border) p-5 hover:border-cyan-500/30 transition-all"
          >
            <h3 className="text-base font-bold text-(--foreground) mb-2">{feature.title}</h3>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default function SslCertificateInspectorApp() {
  const {
    copied,
    domains,
    domainInput,
    error,
    lastCheckedAt,
    loading,
    primaryResult,
    results,
    inspect,
    loadSamples,
    setCopied,
    setDomainInput,
  } = useSslInspector();

  const liveStatus = loading ? "Scanning" : results.length ? "Live Data" : "Ready";
  const primaryStatus = primaryResult?.validation?.status || "info";

  return (
    <div className="px-4 py-8 font-secondary selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center text-(--primary) mb-8">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <StatusBadge status={liveStatus} type={loading ? "info" : "valid"} animate={loading} />
            {primaryResult && (
              <StatusBadge status={titleCase(primaryStatus)} type={primaryStatus === "valid" ? "valid" : primaryStatus} />
            )}
          </div>
          <h1 className="heading animate-fade-up md:whitespace-nowrap !text-3xl md:!text-5xl">
            SSL Certificate Inspector Studio
          </h1>
          <p className="description opacity-90 mt-1 text-(--secondary) text-base md:text-lg animate-fade-up">
            Real-time SSL lookup, HTTPS validation, certificate chain analysis, and exportable developer reports
          </p>
          {lastCheckedAt && (
            <p className="mt-3 text-xs text-(--muted-foreground)">
              Last inspected: {new Date(lastCheckedAt).toLocaleString()}
            </p>
          )}
        </header>

        <ErrorPanel error={error} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputPanel
            domainInput={domainInput}
            setDomainInput={setDomainInput}
            loading={loading}
            inspect={inspect}
            loadSamples={loadSamples}
            domains={domains}
          />
        </div>

        {loading && (
          <div className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-1">
            <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          </div>
        )}

        <ActionRow results={results} copied={copied} setCopied={setCopied} />

        <ResultDetails result={primaryResult} />
        <ComparisonTable results={results} />
        <Features />
      </div>
    </div>
  );
}
