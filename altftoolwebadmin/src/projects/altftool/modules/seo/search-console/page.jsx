"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle, CheckCircle2, Link2, Loader2, Lock, MousePointerClick,
  Plug, RefreshCw, Search, TrendingUp, Unplug, Eye, Globe, FileSearch,
  ShieldCheck, BellRing, Download, Gauge,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  startConnect, fetchConnection, fetchProperties, selectProperty, disconnect, fetchReport,
} from "./services/searchConsoleService";

const DIMENSIONS = [
  { key: "query", label: "Top queries", icon: Search },
  { key: "page", label: "Top pages", icon: Link2 },
  { key: "country", label: "Countries", icon: Globe },
  { key: "device", label: "Devices", icon: MousePointerClick },
];
const RANGES = [7, 28, 90];

const FUTURE = [
  { icon: FileSearch, label: "URL Inspection", desc: "Index status & coverage per URL" },
  { icon: ShieldCheck, label: "Index Coverage", desc: "Valid / excluded / error pages" },
  { icon: Globe, label: "Sitemaps", desc: "Submit & monitor sitemaps" },
  { icon: Gauge, label: "Core Web Vitals", desc: "LCP / INP / CLS by template" },
  { icon: BellRing, label: "Alerts", desc: "Traffic drops & new errors" },
  { icon: Download, label: "Exports", desc: "Scheduled CSV / XLSX reports" },
];

const fmt = (n) => Number(n || 0).toLocaleString();
const pct = (n) => `${(Number(n || 0) * 100).toFixed(1)}%`;
const pos = (n) => Number(n || 0).toFixed(1);

function Kpi({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-muted"><Icon className="h-4 w-4" /><span className="text-xs font-medium">{label}</span></div>
      <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

export default function SearchConsoleCenter() {
  const params = useSearchParams();
  const [conn, setConn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [properties, setProperties] = useState([]);
  const [dimension, setDimension] = useState("query");
  const [days, setDays] = useState(28);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadConnection = useCallback(async () => {
    try {
      const data = await fetchConnection();
      setConn(data);
      return data;
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Failed to load connection" });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConnection(); }, [loadConnection]);

  // Surface OAuth callback result.
  useEffect(() => {
    if (params.get("connected")) emitAlert({ type: "success", message: "Google Search Console connected." });
    const e = params.get("error");
    if (e) emitAlert({ type: "error", message: `Connection failed: ${e}` });
  }, [params]);

  const connected = conn?.connection?.connected;
  const activeProperty = conn?.connection?.activeProperty;

  const loadReport = useCallback(async () => {
    if (!connected || !activeProperty) return;
    setReportLoading(true);
    try {
      setReport(await fetchReport({ dimension, days }));
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Failed to load analytics" });
    } finally {
      setReportLoading(false);
    }
  }, [connected, activeProperty, dimension, days]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleConnect = async () => {
    setBusy(true);
    try {
      const { configured, authUrl, error } = await startConnect();
      if (!configured || !authUrl) {
        emitAlert({ type: "warning", message: error || "Google OAuth is not configured on the server yet." });
        return;
      }
      window.location.href = authUrl;
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Could not start connection" });
    } finally {
      setBusy(false);
    }
  };

  const handleLoadProperties = async () => {
    setBusy(true);
    try {
      const { properties: list } = await fetchProperties();
      setProperties(list || []);
      if (!list?.length) emitAlert({ type: "info", message: "No verified properties on this account." });
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Could not load properties" });
    } finally {
      setBusy(false);
    }
  };

  const handleSelect = async (siteUrl) => {
    setBusy(true);
    try {
      await selectProperty(siteUrl);
      await loadConnection();
      emitAlert({ type: "success", message: `Active property set to ${siteUrl}` });
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Could not select property" });
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Disconnect Google Search Console for the whole organization?")) return;
    setBusy(true);
    try {
      await disconnect();
      setProperties([]);
      setReport(null);
      await loadConnection();
      emitAlert({ type: "success", message: "Disconnected." });
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Could not disconnect" });
    } finally {
      setBusy(false);
    }
  };

  const totals = report?.totals;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-7 sm:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">SEO Center</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-foreground">
            <Search className="h-6 w-6 text-primary" /> Search Console
          </h1>
          <p className="mt-1 text-sm text-muted">Connect Google, manage properties, and monitor search performance.</p>
        </div>
        <button onClick={loadConnection} disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface-soft">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </header>

      {/* Connection card */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading connection…</div>
        ) : !conn?.oauthConfigured && !connected ? (
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
            <div>
              <h2 className="text-sm font-bold text-foreground">Google OAuth not configured</h2>
              <p className="mt-1 text-sm text-muted">
                Set <code className="rounded bg-surface-soft px-1">GSC_OAUTH_CLIENT_ID</code>, <code className="rounded bg-surface-soft px-1">GSC_OAUTH_CLIENT_SECRET</code>, <code className="rounded bg-surface-soft px-1">GSC_OAUTH_REDIRECT_URI</code> and <code className="rounded bg-surface-soft px-1">GSC_TOKEN_ENC_KEY</code> on the server, then reload. See <code className="rounded bg-surface-soft px-1">GSC_SEO_CENTER.md</code>.
              </p>
            </div>
          </div>
        ) : !connected ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Plug className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Connect your Google account</h2>
                <p className="mt-1 text-sm text-muted">One organization-wide connection. Tokens are encrypted at rest.</p>
              </div>
            </div>
            <button onClick={handleConnect} disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />} Connect Google
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-soft text-success"><CheckCircle2 className="h-5 w-5" /></span>
                <div>
                  <p className="text-sm font-bold text-foreground">{conn.connection.googleEmail || "Connected"}</p>
                  <p className="text-xs text-muted">Connected{conn.connection.connectedByEmail ? ` by ${conn.connection.connectedByEmail}` : ""}</p>
                </div>
              </div>
              <button onClick={handleDisconnect} disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-danger hover:bg-danger-soft disabled:opacity-50">
                <Unplug className="h-4 w-4" /> Disconnect
              </button>
            </div>

            {/* Property picker */}
            <div className="rounded-xl border border-border bg-surface-soft p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Globe className="h-4 w-4 text-muted" />
                  <span className="font-semibold">Active property:</span>
                  <span className="text-muted">{activeProperty || "none selected"}</span>
                </div>
                <button onClick={handleLoadProperties} disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-50">
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Load properties
                </button>
              </div>
              {properties.length > 0 && (
                <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {properties.map((p) => (
                    <li key={p.siteUrl}>
                      <button onClick={() => handleSelect(p.siteUrl)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                          activeProperty === p.siteUrl ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface text-foreground hover:bg-surface-soft"
                        }`}>
                        <span className="min-w-0 truncate">{p.siteUrl}</span>
                        <span className="shrink-0 text-[11px] text-muted">{p.permissionLevel?.replace("siteOwner", "owner") || ""}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Search Analytics */}
      {connected && activeProperty && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><TrendingUp className="h-5 w-5 text-primary" /> Search Analytics</h2>
            <div className="flex items-center gap-1.5">
              {RANGES.map((d) => (
                <button key={d} onClick={() => setDays(d)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${days === d ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-muted hover:bg-surface-soft"}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi icon={MousePointerClick} label="Clicks" value={fmt(totals?.clicks)} />
            <Kpi icon={Eye} label="Impressions" value={fmt(totals?.impressions)} />
            <Kpi icon={TrendingUp} label="Avg CTR" value={pct(totals?.ctr)} />
            <Kpi icon={Gauge} label="Avg position" value={pos(totals?.position)} />
          </div>

          <div className="rounded-2xl border border-border bg-surface">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface-soft px-3 py-2">
              {DIMENSIONS.map((d) => {
                const Icon = d.icon;
                return (
                  <button key={d.key} onClick={() => setDimension(d.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${dimension === d.key ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface"}`}>
                    <Icon className="h-3.5 w-3.5" />{d.label}
                  </button>
                );
              })}
              {reportLoading && <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted" />}
            </div>
            {!report?.rows?.length ? (
              <p className="px-4 py-12 text-center text-sm text-muted">{reportLoading ? "Loading…" : "No data for this range."}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-bold uppercase tracking-wider text-muted">
                      <th className="px-4 py-2.5">{dimension}</th>
                      <th className="px-4 py-2.5 text-right">Clicks</th>
                      <th className="px-4 py-2.5 text-right">Impr.</th>
                      <th className="px-4 py-2.5 text-right">CTR</th>
                      <th className="px-4 py-2.5 text-right">Pos.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.rows.map((r) => (
                      <tr key={r.key} className="hover:bg-surface-soft">
                        <td className="max-w-[360px] truncate px-4 py-2.5 text-foreground" title={r.key}>{r.key || "—"}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-foreground">{fmt(r.clicks)}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted">{fmt(r.impressions)}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted">{pct(r.ctr)}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-muted">{pos(r.position)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Future modules (architecture preview) */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">More SEO tools — coming soon</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FUTURE.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-surface-soft p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted"><Icon className="h-4.5 w-4.5" /></span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{f.label}</p>
                  <p className="text-xs text-muted">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
