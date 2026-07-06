"use client";

// ALTF Engine — Technical SEO: robots.txt, redirects (301/302), sitemap info,
// canonical/hreflang management and broken-URL detection.

import { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Bot,
  Save,
  CornerUpRight,
  Plus,
  Trash2,
  Map as MapIcon,
  Link2,
  LinkIcon,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { fetchSeoConfig, saveSeoConfig, checkLinks } from "../services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import SeoNav from "../components/SeoNav";
import { Field, TextArea, Select, Toggle, Banner, SectionCard, BTN_PRIMARY, BTN_SECONDARY, SuccessDialog } from "../components/ui";
import { getBaseUrl } from "../lib/seoModel";

const linesToArray = (text) => String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);
const arrayToLines = (arr) => (Array.isArray(arr) ? arr.join("\n") : "");

export default function TechnicalSeoPage() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [savedPopup, setSavedPopup] = useState("");
  const [isError, setIsError] = useState(false);

  // robots
  const [disallow, setDisallow] = useState("");
  const [allow, setAllow] = useState("");
  const [extraSitemaps, setExtraSitemaps] = useState("");

  // redirects
  const [redirects, setRedirects] = useState([]);

  // broken links
  const [linksInput, setLinksInput] = useState("");
  const [linkResults, setLinkResults] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cfg = await fetchSeoConfig();
        setConfig(cfg || {});
        setDisallow(arrayToLines(cfg?.crawl?.disallow));
        setAllow(arrayToLines(cfg?.crawl?.allow));
        setExtraSitemaps(arrayToLines(cfg?.crawl?.extraSitemaps));
        setRedirects(Array.isArray(cfg?.redirects) ? cfg.redirects : []);
        const overridePaths = Object.keys(cfg?.pages || {});
        setLinksInput((overridePaths.length ? overridePaths : ["/", "/tools", "/blogs"]).join("\n"));
        setStatus("ready");
      } catch (e) {
        setStatus("error");
        setIsError(true);
        setMessage(getErrorMessage(e));
      }
    })();
  }, []);

  const baseUrl = useMemo(() => getBaseUrl(config), [config]);

  const robotsPreview = useMemo(() => {
    const lines = ["User-agent: *"];
    linesToArray(allow).forEach((p) => lines.push(`Allow: ${p}`));
    const dis = linesToArray(disallow);
    if (dis.length) dis.forEach((p) => lines.push(`Disallow: ${p}`));
    else lines.push("Disallow:");
    lines.push("", `Sitemap: ${baseUrl}/sitemap.xml`);
    linesToArray(extraSitemaps).forEach((s) => lines.push(`Sitemap: ${s}`));
    return lines.join("\n");
  }, [allow, disallow, extraSitemaps, baseUrl]);

  async function persist(next, successMsg) {
    setMessage("");
    setIsError(false);
    setStatus("saving");
    try {
      const res = await saveSeoConfig(next, {});
      setConfig(next);
      setStatus("ready");
      setMessage(`${successMsg} (v${res.version}). Live within a few seconds.`);
      setSavedPopup(`${successMsg} (v${res.version}). Live within a few seconds.`);
    } catch (e) {
      setStatus("ready");
      setIsError(true);
      setMessage(getErrorMessage(e));
    }
  }

  function saveRobots() {
    const crawl = {
      disallow: linesToArray(disallow).filter((p) => p.startsWith("/")),
      allow: linesToArray(allow).filter((p) => p.startsWith("/")),
      extraSitemaps: linesToArray(extraSitemaps).filter((u) => /^https?:\/\//i.test(u)),
    };
    persist({ ...config, crawl }, "Saved robots.txt rules");
  }

  function saveRedirects() {
    const cleaned = redirects
      .map((r, i) => ({
        id: r.id || `redirect-${i}`,
        source: (r.source || "").trim(),
        destination: (r.destination || "").trim(),
        type: Number(r.type) === 302 ? 302 : 301,
        enabled: r.enabled !== false,
        note: (r.note || "").trim() || undefined,
      }))
      .filter((r) => r.source && r.destination);
    persist({ ...config, redirects: cleaned }, "Saved redirects");
  }

  function addRedirect() {
    setRedirects((rs) => [...rs, { source: "", destination: "", type: 301, enabled: true, note: "" }]);
  }
  function updateRedirect(i, patch) {
    setRedirects((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function removeRedirect(i) {
    setRedirects((rs) => rs.filter((_, idx) => idx !== i));
  }

  async function runLinkCheck() {
    setChecking(true);
    setLinkResults(null);
    try {
      const res = await checkLinks(linesToArray(linksInput));
      setLinkResults(res);
    } catch (e) {
      setLinkResults({ error: getErrorMessage(e) });
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12 animate-slide-in">
      <SuccessDialog
        open={Boolean(savedPopup)}
        title="Changes applied successfully"
        message={savedPopup}
        onClose={() => setSavedPopup("")}
      />
      <SeoNav active="technical" />

      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Wrench className="h-6 w-6 text-primary" /> Technical SEO
        </h1>
        <p className="mt-1 text-sm text-muted">robots.txt, redirects, sitemap, canonical &amp; hreflang, and broken-URL detection.</p>
      </header>

      {message && <Banner tone={isError ? "danger" : "success"}>{message}</Banner>}

      {status === "loading" ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted">Loading…</div>
      ) : (
        <>
          {/* robots.txt */}
          <SectionCard
            title="robots.txt editor"
            icon={Bot}
            description="Crawl directives merged into the live robots.txt. One path per line."
            actions={
              <button type="button" onClick={saveRobots} disabled={status === "saving"} className={BTN_PRIMARY}>
                <Save className="h-4 w-4" /> Save
              </button>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Field label="Disallow paths" hint="e.g. /admin or /news/topics/">
                  <TextArea value={disallow} onChange={setDisallow} rows={4} mono placeholder={"/admin\n/private"} />
                </Field>
                <Field label="Allow paths" hint="Explicit allow overrides.">
                  <TextArea value={allow} onChange={setAllow} rows={3} mono placeholder={"/public"} />
                </Field>
                <Field label="Extra sitemaps" hint="Absolute URLs only.">
                  <TextArea value={extraSitemaps} onChange={setExtraSitemaps} rows={2} mono placeholder={"https://altftool.com/news-sitemap.xml"} />
                </Field>
              </div>
              <div>
                <div className="mb-1.5 text-xs font-medium text-muted">Live preview</div>
                <pre className="h-full max-h-[320px] overflow-auto rounded-lg border border-border bg-surface-soft p-3 font-mono text-xs leading-relaxed text-foreground">{robotsPreview}</pre>
              </div>
            </div>
          </SectionCard>

          {/* Redirects */}
          <SectionCard
            title="Redirect manager"
            icon={CornerUpRight}
            description="301 (permanent) / 302 (temporary) redirects. Source must start with /."
            actions={
              <div className="flex gap-2">
                <button type="button" onClick={addRedirect} className={BTN_SECONDARY}>
                  <Plus className="h-4 w-4" /> Add
                </button>
                <button type="button" onClick={saveRedirects} disabled={status === "saving"} className={BTN_PRIMARY}>
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            }
          >
            {redirects.length === 0 ? (
              <p className="py-4 text-sm text-muted">No redirects yet. Click “Add” to create one.</p>
            ) : (
              <div className="space-y-2">
                {redirects.map((r, i) => (
                  <div key={i} className="grid grid-cols-1 items-center gap-2 rounded-lg border border-border p-2 md:grid-cols-[1fr_1fr_90px_110px_40px]">
                    <input
                      value={r.source || ""}
                      onChange={(e) => updateRedirect(i, { source: e.target.value })}
                      placeholder="/old-path"
                      className="rounded-md border border-border bg-card px-2.5 py-2 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <input
                      value={r.destination || ""}
                      onChange={(e) => updateRedirect(i, { destination: e.target.value })}
                      placeholder="/new-path or https://…"
                      className="rounded-md border border-border bg-card px-2.5 py-2 font-mono text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <Select value={String(r.type || 301)} onChange={(v) => updateRedirect(i, { type: Number(v) })} options={[{ value: "301", label: "301" }, { value: "302", label: "302" }]} />
                    <Toggle label={r.enabled !== false ? "On" : "Off"} checked={r.enabled !== false} onChange={(v) => updateRedirect(i, { enabled: v })} />
                    <button type="button" onClick={() => removeRedirect(i)} className="flex h-9 items-center justify-center rounded-md text-muted hover:bg-danger-soft hover:text-danger" aria-label="Remove redirect">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <div className="grid gap-6 md:grid-cols-3">
            <SectionCard title="Sitemap" icon={MapIcon} description="Auto-generated.">
              <p className="text-sm text-foreground">
                <a href={`${baseUrl}/sitemap.xml`} target="_blank" rel="noreferrer" className="text-primary underline">
                  {baseUrl}/sitemap.xml
                </a>
              </p>
              <p className="text-xs text-muted">Per-page priority &amp; change frequency are set in the Pages workspace; add extra sitemaps above.</p>
            </SectionCard>
            <SectionCard title="Canonical" icon={Link2} description="Base URL.">
              <p className="font-mono text-sm text-foreground">{baseUrl}</p>
              <p className="text-xs text-muted">Set the canonical base in Global settings; override per-page in the Pages workspace.</p>
            </SectionCard>
            <SectionCard title="Hreflang" icon={LinkIcon} description="International targeting.">
              <p className="text-xs text-muted">Add language/region alternates per page in the Pages workspace → Hreflang tab.</p>
            </SectionCard>
          </div>

          {/* Broken URL detection */}
          <SectionCard
            title="Broken URL detection"
            icon={AlertTriangle}
            description="Check reachability of paths/URLs (status, redirects, errors). One per line, up to 60."
            actions={
              <button type="button" onClick={runLinkCheck} disabled={checking} className={BTN_PRIMARY}>
                {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {checking ? "Checking…" : "Run check"}
              </button>
            }
          >
            <TextArea value={linksInput} onChange={setLinksInput} rows={4} mono placeholder={"/\n/tools\n/blogs"} />
            {linkResults?.error && <Banner tone="danger">{linkResults.error}</Banner>}
            {linkResults?.results && (
              <div className="mt-3">
                <div className="mb-2 flex gap-3 text-sm">
                  <span className="text-muted">Checked {linkResults.checked}</span>
                  <span className={linkResults.broken ? "font-semibold text-danger" : "font-semibold text-success"}>
                    {linkResults.broken} broken
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border border-border">
                  {linkResults.results.map((r) => {
                    const broken = r.error || r.status >= 400 || r.status === 0;
                    return (
                      <div key={r.url} className="flex items-center gap-3 border-b border-border px-3 py-2 text-sm last:border-0">
                        {broken ? (
                          <XCircle className="h-4 w-4 shrink-0 text-danger" />
                        ) : r.redirected ? (
                          <CornerUpRight className="h-4 w-4 shrink-0 text-warning" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                        )}
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground" title={r.url}>{r.url}</span>
                        <span className={`w-16 text-right text-xs font-semibold ${broken ? "text-danger" : r.redirected ? "text-warning" : "text-success"}`}>
                          {r.error ? "ERR" : r.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
