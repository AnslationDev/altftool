"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Globe, Loader2, Plus, RefreshCw, UploadCloud } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { fetchSitemaps, submitSitemap } from "../services/searchConsoleService";

export default function SitemapsPanel() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [feed, setFeed] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchSitemaps();
      setData(res);
      if (res?.defaultFeed && !feed) setFeed(res.defaultFeed);
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Could not load sitemaps" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submit = async () => {
    setSubmitting(true);
    try {
      await submitSitemap(feed || undefined);
      emitAlert({ type: "success", message: "Sitemap submitted." });
      await load();
    } catch (err) {
      emitAlert({ type: "error", message: err.message || "Submit failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground"><Globe className="h-4 w-4 text-primary" /> Sitemaps</h3>
        <button onClick={load} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-soft">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={feed}
          onChange={(e) => setFeed(e.target.value)}
          placeholder="https://altftool.com/sitemap.xml"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={submit} disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Submit
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : !data?.sitemaps?.length ? (
          <p className="py-6 text-center text-sm text-muted">No sitemaps submitted yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {data.sitemaps.map((s) => (
              <li key={s.path} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm text-foreground" title={s.path}>{s.path}</span>
                <div className="flex items-center gap-3 text-xs">
                  {s.errors > 0
                    ? <span className="inline-flex items-center gap-1 text-danger"><AlertTriangle className="h-3.5 w-3.5" />{s.errors} err</span>
                    : <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" />OK</span>}
                  {s.warnings > 0 && <span className="text-warning">{s.warnings} warn</span>}
                  <span className="text-muted">{s.lastSubmitted ? new Date(s.lastSubmitted).toLocaleDateString() : "—"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
