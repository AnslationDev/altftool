"use client";

// ALTF Engine — Google Search Console (indexing, performance, sitemaps).

import { useEffect, useState } from "react";
import { gscGet, gscPost } from "../services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import {
  Layers,
  Search,
  FileText,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  ScanLine,
  UploadCloud,
} from "lucide-react";

const NAV = [
  { href: "/altftool/seo/dashboard", label: "Dashboard", icon: Layers },
  { href: "/altftool/seo/search", label: "Search", icon: Search },
  { href: "/altftool/seo", label: "Config", icon: FileText },
  { href: "/altftool/seo/gsc", label: "Search Console", icon: Globe, active: true },
];

export default function GscPage() {
  const [status, setStatus] = useState(null);
  const [statusState, setStatusState] = useState("loading");

  // URL inspection
  const [inspectUrl, setInspectUrl] = useState("");
  const [inspectResult, setInspectResult] = useState(null);
  const [inspecting, setInspecting] = useState(false);

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsState, setAnalyticsState] = useState("idle");

  // Sitemaps
  const [sitemaps, setSitemaps] = useState(null);
  const [sitemapMsg, setSitemapMsg] = useState("");

  useEffect(() => {
    gscGet("status")
      .then((d) => {
        setStatus(d);
        setStatusState("ready");
      })
      .catch((e) => {
        setStatus({ error: getErrorMessage(e) });
        setStatusState("ready");
      });
  }, []);

  const configured = status?.configured;
  const connected = status?.connected;

  async function runInspect() {
    if (!inspectUrl.trim()) return;
    setInspecting(true);
    setInspectResult(null);
    try {
      const d = await gscPost({ action: "inspect", url: inspectUrl.trim() });
      setInspectResult(d.result || d);
    } catch (e) {
      setInspectResult({ error: getErrorMessage(e) });
    } finally {
      setInspecting(false);
    }
  }

  async function loadAnalytics() {
    setAnalyticsState("loading");
    try {
      setAnalytics(await gscGet("analytics", { dimension: "query" }));
    } catch (e) {
      setAnalytics({ error: getErrorMessage(e) });
    } finally {
      setAnalyticsState("ready");
    }
  }

  async function loadSitemaps() {
    try {
      const d = await gscGet("sitemaps");
      setSitemaps(d.sitemaps || []);
    } catch (e) {
      setSitemaps({ error: getErrorMessage(e) });
    }
  }

  async function submitSitemap() {
    setSitemapMsg("");
    try {
      const d = await gscPost({ action: "submit-sitemap" });
      setSitemapMsg(`Submitted: ${d.feedpath}`);
      loadSitemaps();
    } catch (e) {
      setSitemapMsg(getErrorMessage(e));
    }
  }

  const verdict = inspectResult?.indexStatusResult?.verdict;
  const coverage = inspectResult?.indexStatusResult?.coverageState;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-slide-in">
      <nav className="flex items-center gap-6 border-b border-border pb-3 flex-wrap">
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            className={`pb-3 -mb-3.5 flex items-center gap-1.5 transition-colors ${
              n.active ? "font-semibold text-primary border-b-2 border-primary" : "text-muted hover:text-foreground"
            }`}
          >
            <n.icon className="w-4 h-4" /> {n.label}
          </a>
        ))}
      </nav>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" /> Google Search Console
        </h1>
        <p className="text-sm text-muted mt-1">Index status, performance and sitemaps — straight from Google.</p>
      </header>

      {/* Connection status */}
      <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
        {statusState === "loading" ? (
          <p className="text-sm text-muted">Checking connection…</p>
        ) : status?.error ? (
          <p className="text-danger text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{status.error}</p>
        ) : !configured ? (
          <SetupNotice siteUrl={status?.siteUrl} />
        ) : connected ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-success font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Connected
            </div>
            <div className="text-sm text-muted">
              Property <code className="text-foreground">{status.siteUrl}</code>
              {status.permissionLevel ? ` · ${status.permissionLevel}` : ""}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-warning"><XCircle className="w-5 h-5" /> Credentials set but the property isn’t accessible — add the service account as Owner.</div>
        )}
      </section>

      {configured && (
        <>
          {/* URL Inspection */}
          <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><ScanLine className="w-4 h-4 text-muted" /> URL Inspection</h2>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                value={inspectUrl}
                onChange={(e) => setInspectUrl(e.target.value)}
                placeholder="https://altftool.com/tools/all/image-compressor"
                className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={runInspect} disabled={inspecting} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50">
                <ScanLine className="w-4 h-4" /> {inspecting ? "Inspecting…" : "Inspect"}
              </button>
            </div>
            {inspectResult?.error && <p className="text-danger text-sm">{inspectResult.error}</p>}
            {verdict && (
              <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm space-y-1.5">
                <div className="flex items-center gap-2 font-semibold">
                  {verdict === "PASS" ? <CheckCircle2 className="w-4 h-4 text-success" /> : <AlertCircle className="w-4 h-4 text-warning" />}
                  {verdict === "PASS" ? "URL is on Google" : `Verdict: ${verdict}`}
                </div>
                <Row label="Coverage" value={coverage || "—"} />
                <Row label="Last crawl" value={(inspectResult.indexStatusResult?.lastCrawlTime || "").slice(0, 10) || "—"} />
                <Row label="Robots" value={inspectResult.indexStatusResult?.robotsTxtState || "—"} />
                <Row label="Indexing" value={inspectResult.indexStatusResult?.indexingState || "—"} />
                <Row label="Canonical (Google)" value={inspectResult.indexStatusResult?.googleCanonical || "—"} />
              </div>
            )}
          </section>

          {/* Performance */}
          <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4 text-muted" /> Performance (last 28 days)</h2>
              <button onClick={loadAnalytics} disabled={analyticsState === "loading"} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-surface-soft transition disabled:opacity-50">
                {analyticsState === "loading" ? "Loading…" : "Load top queries"}
              </button>
            </div>
            {analytics?.error && <p className="text-danger text-sm">{analytics.error}</p>}
            {analytics?.totals && (
              <div className="flex gap-3 flex-wrap">
                <Metric label="Clicks" value={analytics.totals.clicks} />
                <Metric label="Impressions" value={analytics.totals.impressions} />
              </div>
            )}
            {analytics?.rows?.length > 0 && (
              <table className="w-full text-sm mt-2">
                <thead><tr className="text-muted text-xs uppercase border-b border-border"><th className="text-left py-2">Query</th><th className="text-right">Clicks</th><th className="text-right">Impr.</th><th className="text-right">CTR</th><th className="text-right">Pos.</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {analytics.rows.map((r, i) => (
                    <tr key={i}>
                      <td className="py-2 text-foreground">{r.keys?.[0]}</td>
                      <td className="text-right">{r.clicks}</td>
                      <td className="text-right">{r.impressions}</td>
                      <td className="text-right">{((r.ctr || 0) * 100).toFixed(1)}%</td>
                      <td className="text-right">{(r.position || 0).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Sitemaps */}
          <section className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><UploadCloud className="w-4 h-4 text-muted" /> Sitemaps</h2>
              <div className="flex gap-2">
                <button onClick={loadSitemaps} className="px-4 py-2 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-surface-soft transition">Refresh</button>
                <button onClick={submitSitemap} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
                  <UploadCloud className="w-4 h-4" /> Submit sitemap.xml
                </button>
              </div>
            </div>
            {sitemapMsg && <p className="text-sm text-muted">{sitemapMsg}</p>}
            {Array.isArray(sitemaps) && sitemaps.length > 0 && (
              <ul className="text-sm divide-y divide-border">
                {sitemaps.map((s) => (
                  <li key={s.path} className="py-2 flex justify-between gap-3">
                    <span className="text-primary truncate">{s.path}</span>
                    <span className="text-muted text-xs">{(s.lastSubmitted || "").slice(0, 10)} · {s.contents?.[0]?.submitted || 0} urls</span>
                  </li>
                ))}
              </ul>
            )}
            {Array.isArray(sitemaps) && sitemaps.length === 0 && <p className="text-sm text-muted">No sitemaps submitted yet.</p>}
            {sitemaps?.error && <p className="text-danger text-sm">{sitemaps.error}</p>}
          </section>
        </>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3"><span className="text-muted w-40 shrink-0">{label}</span><span className="text-foreground break-words">{value}</span></div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-[120px] px-4 py-3 rounded-lg border border-border bg-surface-soft">
      <div className="text-[11px] text-muted">{label}</div>
      <div className="text-2xl font-bold text-foreground">{Number(value).toLocaleString()}</div>
    </div>
  );
}

function SetupNotice({ siteUrl }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2 text-warning font-semibold"><AlertCircle className="w-5 h-5" /> Not connected yet</div>
      <p className="text-muted">To enable Search Console, an admin must (one-time):</p>
      <ol className="list-decimal pl-5 text-muted space-y-1">
        <li>Enable the <strong>Google Search Console API</strong> in Google Cloud (project altftool-bca36).</li>
        <li>In Search Console → Settings → Users &amp; permissions, add the service-account email as an <strong>Owner</strong>.</li>
        <li>Set <code className="text-foreground">GSC_SITE_URL</code> if your property isn’t <code className="text-foreground">{siteUrl || "sc-domain:altftool.com"}</code>.</li>
      </ol>
    </div>
  );
}
