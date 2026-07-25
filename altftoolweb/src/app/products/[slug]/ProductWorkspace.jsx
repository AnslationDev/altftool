"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Clipboard,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Gauge,
  Globe2,
  ListChecks,
  LockKeyhole,
  Play,
  RefreshCw,
  Save,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wifi,
  XCircle,
} from "lucide-react";
import { Badge, Button, Card, Input, Label } from "@altftool/ui";
import {
  analyzeTranscript,
  calculateNetworkMetrics,
  evaluateIdea,
  FLOW_ACTIONS,
  generateTotp,
  runTextWorkflow,
} from "@altftool/core/product-utilities";

const fieldClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition duration-150 placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-primary/25 motion-reduce:transition-none";
const panelClass = "border-border bg-card p-5 shadow-sm";

export default function ProductWorkspace({ suite }) {
  if (suite.slug === "idea-lab") return <IdeaLabWorkspace />;
  if (suite.slug === "minutes") return <MinutesWorkspace />;
  if (suite.slug === "authenticator") return <AuthenticatorWorkspace />;
  if (suite.slug === "netcheck") return <NetCheckWorkspace />;
  if (suite.slug === "flow") return <FlowWorkspace />;
  if (suite.slug === "domainops") return <DomainOpsWorkspace />;
  if (suite.slug === "security") return <SecurityWorkspace />;
  if (suite.slug === "impact") return <ImpactWorkspace />;
  if (suite.slug === "developers") return <DevelopersWorkspace />;
  if (suite.slug === "vault") return <VaultWorkspace />;
  return <HubWorkspace suite={suite} />;
}

function WorkspaceTitle({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"><Icon className="h-5 w-5" /></span>
      <div><h2 className="text-xl font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>
    </div>
  );
}

function FieldLabel({ htmlFor, children }) {
  return <Label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold">{children}</Label>;
}

function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  return <Button variant="secondary" size="sm" onClick={copy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : label}</Button>;
}

function IdeaLabWorkspace() {
  const [input, setInput] = useState({ problem: "", audience: "", urgency: 3, willingness: 3, frequency: "weekly", reach: "focused" });
  const [result, setResult] = useState(null);
  const update = (key, value) => setInput((current) => ({ ...current, [key]: value }));

  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={Sparkles} title="Idea evidence check" description="Score the current evidence, reveal weak assumptions, and leave with four concrete experiments." />
      <form onSubmit={(event) => { event.preventDefault(); setResult(evaluateIdea(input)); }} className="space-y-5">
        <div><FieldLabel htmlFor="idea-problem">Problem and current evidence</FieldLabel><textarea id="idea-problem" required rows={4} value={input.problem} onChange={(event) => update("problem", event.target.value)} className={fieldClass} placeholder="Describe who faces the problem, when it happens, and what they do today." /></div>
        <div><FieldLabel htmlFor="idea-audience">First narrow audience</FieldLabel><Input id="idea-audience" required value={input.audience} onChange={(event) => update("audience", event.target.value)} placeholder="For example: independent accountants serving small retailers" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField id="idea-urgency" label="Problem urgency" value={input.urgency} onChange={(event) => update("urgency", event.target.value)} options={[1,2,3,4,5].map((value) => [value, `${value} / 5`])} />
          <SelectField id="idea-pay" label="Willingness to pay" value={input.willingness} onChange={(event) => update("willingness", event.target.value)} options={[1,2,3,4,5].map((value) => [value, `${value} / 5`])} />
          <SelectField id="idea-frequency" label="Problem frequency" value={input.frequency} onChange={(event) => update("frequency", event.target.value)} options={[["one-off","One-off"],["yearly","Yearly"],["monthly","Monthly"],["weekly","Weekly"],["daily","Daily"]]} />
          <SelectField id="idea-reach" label="Addressable audience" value={input.reach} onChange={(event) => update("reach", event.target.value)} options={[["niche","Niche"],["focused","Focused"],["broad","Broad"]]} />
        </div>
        <Button type="submit"><Gauge className="h-4 w-4" /> Evaluate idea</Button>
      </form>
      {result ? (
        <div className="mt-6 border-t border-border pt-6" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3"><strong className="text-4xl text-primary">{result.score}</strong><div><p className="font-semibold">{result.band}</p><p className="text-sm text-muted-foreground">Evidence score out of 100, not a guarantee of success.</p></div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ResultList title="Risks to investigate" items={result.risks} icon={AlertTriangle} />
            <ResultList title="Next experiments" items={result.experiments} icon={ListChecks} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function MinutesWorkspace() {
  const sample = "We agreed to launch the onboarding test on Friday. Priya will prepare the copy by Wednesday. Omar needs to verify analytics. Should we include returning users? The final decision is to keep the first test limited to new users.";
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const markdown = useMemo(() => result ? ["# Meeting notes", "", "## Summary", ...result.summary.map((item) => `- ${item}`), "", "## Decisions", ...result.decisions.map((item) => `- ${item}`), "", "## Actions", ...result.actions.map((item) => `- ${item}`), "", "## Open questions", ...result.questions.map((item) => `- ${item}`)].join("\n") : "", [result]);
  const download = () => {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "altf-minutes.md"; anchor.click(); URL.revokeObjectURL(url);
  };
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={Clipboard} title="Transcript to meeting notes" description="A deterministic local extractor for quick notes. Review the output before sharing it." />
      <FieldLabel htmlFor="minutes-input">Meeting transcript</FieldLabel>
      <textarea id="minutes-input" rows={10} value={transcript} onChange={(event) => setTranscript(event.target.value)} className={fieldClass} placeholder="Paste a transcript or rough meeting notes" />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => setResult(analyzeTranscript(transcript))} disabled={transcript.trim().length < 20}><Sparkles className="h-4 w-4" /> Extract notes</Button>
        <Button variant="secondary" onClick={() => setTranscript(sample)}>Use sample</Button>
        {result ? <><CopyButton value={markdown} label="Copy Markdown" /><Button variant="secondary" onClick={download}><Download className="h-4 w-4" /> Export</Button></> : null}
      </div>
      {result ? (
        <div className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-2" aria-live="polite">
          <ResultList title={`Summary · ${result.wordCount} words`} items={result.summary} icon={Clipboard} empty="No complete summary lines found." />
          <ResultList title="Decisions" items={result.decisions} icon={CheckCircle2} empty="No explicit decisions detected." />
          <ResultList title="Actions" items={result.actions} icon={ListChecks} empty="No explicit actions detected." />
          <ResultList title="Open questions" items={result.questions} icon={AlertTriangle} empty="No open questions detected." />
        </div>
      ) : null}
    </Card>
  );
}

function AuthenticatorWorkspace() {
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(30);
  const [error, setError] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const now = Date.now();
      setRemaining(30 - (Math.floor(now / 1000) % 30));
      if (!secret.trim()) { setCode("------"); setError(""); return; }
      try { const nextCode = await generateTotp(secret, now); if (active) { setCode(nextCode); setError(""); } }
      catch (nextError) { if (active) { setCode("------"); setError(nextError.message); } }
    };
    refresh(); const timer = window.setInterval(refresh, 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, [secret]);
  const makeBackups = () => {
    const values = new Uint32Array(8); crypto.getRandomValues(values);
    setBackupCodes([...values].map((value) => value.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)));
  };
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={LockKeyhole} title="Local TOTP generator" description="The secret stays in this tab's memory and is never persisted or transmitted. Clear it when finished." />
      <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground"><strong className="text-foreground">Safety note:</strong> use this as a temporary verification utility, not as the only copy of an account credential.</div>
      <div className="mt-5"><FieldLabel htmlFor="totp-secret">Base32 secret</FieldLabel><Input id="totp-secret" value={secret} onChange={(event) => setSecret(event.target.value)} autoComplete="off" spellCheck="false" placeholder="JBSWY3DPEHPK3PXP" /></div>
      {error ? <p className="mt-2 text-sm text-[var(--anslation-ds-danger)]" role="alert">{error}</p> : null}
      <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border bg-background p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase text-muted-foreground">Current code</p><p className="mt-1 font-mono text-4xl font-bold tracking-wider">{code}</p><p className="mt-2 text-sm text-muted-foreground">Refreshes in {remaining}s</p></div>
        <CopyButton value={code.replace(/-/g, "")} label="Copy code" />
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Temporary backup codes</h3><p className="mt-1 text-sm text-muted-foreground">Generated locally; they are not linked to an account.</p></div><Button variant="secondary" onClick={makeBackups}><RefreshCw className="h-4 w-4" /> Generate</Button></div>
        {backupCodes.length ? <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{backupCodes.map((item) => <code key={item} className="rounded-md border border-border bg-muted p-2 text-center text-sm">{item}</code>)}</div> : null}
      </div>
    </Card>
  );
}

function NetCheckWorkspace() {
  const [state, setState] = useState({ running: false, result: null, error: "" });
  const run = async () => {
    setState({ running: true, result: null, error: "" });
    try {
      const latencies = [];
      for (let index = 0; index < 4; index += 1) {
        const start = performance.now(); const response = await fetch(`/api/netcheck?mode=ping&t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Latency test is unavailable."); await response.json(); latencies.push(performance.now() - start);
      }
      const downloadStart = performance.now(); const downloadResponse = await fetch(`/api/netcheck?mode=download&bytes=350000&t=${Date.now()}`, { cache: "no-store" });
      if (!downloadResponse.ok) throw new Error("Download test is unavailable."); const download = await downloadResponse.arrayBuffer(); const downloadMs = performance.now() - downloadStart;
      const upload = new Uint8Array(96_000);
      for (let offset = 0; offset < upload.length; offset += 65_536) {
        crypto.getRandomValues(upload.subarray(offset, Math.min(offset + 65_536, upload.length)));
      }
      const uploadStart = performance.now(); const uploadResponse = await fetch("/api/netcheck", { method: "POST", headers: { "content-type": "application/octet-stream" }, body: upload });
      if (!uploadResponse.ok) throw new Error("Upload test is unavailable."); await uploadResponse.json(); const uploadMs = performance.now() - uploadStart;
      setState({ running: false, error: "", result: calculateNetworkMetrics({ latencies, downloadBytes: download.byteLength, downloadMs, uploadBytes: upload.byteLength, uploadMs }) });
    } catch (error) { setState({ running: false, result: null, error: error.message || "Network test failed." }); }
  };
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={Wifi} title="Quick connection check" description="Uses less than 500 KB download and 100 KB upload per run. Results reflect this server path, not your ISP's theoretical maximum." />
      <Button onClick={run} loading={state.running}><Play className="h-4 w-4" /> {state.running ? "Testing" : "Run bounded test"}</Button>
      {state.error ? <p className="mt-4 rounded-md border border-border bg-muted p-3 text-sm" role="alert">{state.error}</p> : null}
      {state.result ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          <MetricCard label="Latency" value={`${state.result.latencyMs} ms`} /><MetricCard label="Jitter" value={`${state.result.jitterMs} ms`} /><MetricCard label="Download" value={`${state.result.downloadMbps} Mbps`} /><MetricCard label="Upload" value={`${state.result.uploadMbps} Mbps`} />
          <div className="sm:col-span-2 lg:col-span-4"><Badge tone={state.result.quality === "Responsive" ? "success" : state.result.quality === "Usable" ? "warning" : "neutral"}>{state.result.quality} connection</Badge></div>
        </div>
      ) : null}
    </Card>
  );
}

function FlowWorkspace() {
  const [input, setInput] = useState("");
  const [actions, setActions] = useState(["trim"]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setSaved(JSON.parse(localStorage.getItem("altf-flow-recipes") || "[]")); }
      catch { setSaved([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const run = () => { try { setResult(runTextWorkflow(input, actions)); setError(""); } catch (nextError) { setResult(null); setError(nextError.message); } };
  const move = (index, direction) => setActions((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const save = () => {
    if (!recipeName.trim() || !actions.length) return;
    const next = [...saved.filter((item) => item.name !== recipeName.trim()), { name: recipeName.trim(), actions }].slice(-12);
    setSaved(next); localStorage.setItem("altf-flow-recipes", JSON.stringify(next)); setRecipeName("");
  };
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={ServerCog} title="Local text workflow" description="Compose repeatable steps, execute them in order, and keep recipes in this browser." />
      <div className="grid gap-5 lg:grid-cols-2">
        <div><FieldLabel htmlFor="flow-input">Input</FieldLabel><textarea id="flow-input" rows={12} value={input} onChange={(event) => setInput(event.target.value)} className={fieldClass} placeholder="Paste text, URLs, line lists, or JSON" /></div>
        <div><FieldLabel htmlFor="flow-output">Output</FieldLabel><textarea id="flow-output" rows={12} readOnly value={result?.output || ""} className={fieldClass} placeholder="Run the workflow to see output" /></div>
      </div>
      <div className="mt-5 border-t border-border pt-5">
        <div className="flex flex-wrap items-end gap-3">
          <SelectField id="flow-action" label="Add action" value="" onChange={(event) => { if (event.target.value) setActions((current) => [...current, event.target.value]); }} options={[["","Choose an action"], ...FLOW_ACTIONS.map((item) => [item.id, item.label])]} />
          <Button onClick={run} disabled={!actions.length}><Play className="h-4 w-4" /> Run workflow</Button>
          {result ? <CopyButton value={result.output} label="Copy output" /> : null}
        </div>
        <ol className="mt-4 space-y-2">
          {actions.map((actionId, index) => (
            <li key={`${actionId}-${index}`} className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-background px-3">
              <span className="flex-1 text-sm font-medium">{index + 1}. {FLOW_ACTIONS.find((item) => item.id === actionId)?.label}</span>
              <Button variant="ghost" size="icon" aria-label="Move action up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Move action down" disabled={index === actions.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Remove action" onClick={() => setActions((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
        </ol>
        {error ? <p className="mt-3 text-sm text-[var(--anslation-ds-danger)]" role="alert">{error}</p> : null}
        {result ? <p className="mt-3 text-sm text-muted-foreground">Completed {result.log.length} actions · {result.output.length} output characters</p> : null}
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <h3 className="font-semibold">Saved recipes</h3>
        <div className="mt-3 flex gap-2"><Input value={recipeName} onChange={(event) => setRecipeName(event.target.value)} placeholder="Recipe name" /><Button variant="secondary" onClick={save}><Save className="h-4 w-4" /> Save</Button></div>
        {saved.length ? <div className="mt-3 flex flex-wrap gap-2">{saved.map((recipe) => <Button key={recipe.name} variant="secondary" size="sm" onClick={() => setActions(recipe.actions)}>{recipe.name}</Button>)}</div> : <p className="mt-3 text-sm text-muted-foreground">No local recipes yet.</p>}
      </div>
    </Card>
  );
}

function DomainOpsWorkspace() {
  const [domain, setDomain] = useState(""); const [selector, setSelector] = useState("");
  const [state, setState] = useState({ loading: false, data: null, error: "" });
  const inspect = async (event) => {
    event.preventDefault(); setState({ loading: true, data: null, error: "" });
    try { const query = new URLSearchParams({ domain }); if (selector.trim()) query.set("selector", selector.trim()); const response = await fetch(`/api/domainops?${query}`); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Domain report failed."); setState({ loading: false, data: payload, error: "" }); }
    catch (error) { setState({ loading: false, data: null, error: error.message }); }
  };
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={Globe2} title="Domain health report" description="DNS and registration signals are collected from public DNS-over-HTTPS and RDAP sources. No request is sent to the inspected website." />
      <form onSubmit={inspect} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end">
        <div><FieldLabel htmlFor="domain-name">Domain</FieldLabel><Input id="domain-name" required value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="example.com" /></div>
        <div><FieldLabel htmlFor="dkim-selector">DKIM selector (optional)</FieldLabel><Input id="dkim-selector" value={selector} onChange={(event) => setSelector(event.target.value)} placeholder="google" /></div>
        <Button type="submit" loading={state.loading}><RefreshCw className="h-4 w-4" /> Inspect</Button>
      </form>
      {state.error ? <p className="mt-4 rounded-md border border-border bg-muted p-3 text-sm" role="alert">{state.error}</p> : null}
      {state.data ? (
        <div className="mt-6 space-y-4 border-t border-border pt-6" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3"><strong className="text-4xl text-primary">{state.data.score}</strong><div><p className="font-semibold">Domain readiness score</p><p className="text-sm text-muted-foreground">Checked {new Date(state.data.checkedAt).toLocaleString()}</p></div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {state.data.findings.map((finding) => <Finding key={finding.id} finding={finding} />)}
          </div>
          <details className="rounded-lg border border-border bg-background p-4"><summary className="cursor-pointer font-semibold">Raw records</summary><pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(state.data.records, null, 2)}</pre></details>
        </div>
      ) : null}
    </Card>
  );
}

function SecurityWorkspace() {
  const [html, setHtml] = useState(""); const [results, setResults] = useState([]);
  const audit = () => {
    const documentNode = new DOMParser().parseFromString(html, "text/html");
    const headings = [...documentNode.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((item) => Number(item.tagName.slice(1)));
    const skipped = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1);
    const checks = [
      ["Document language", Boolean(documentNode.documentElement.getAttribute("lang")), "Add a valid lang attribute to the html element."],
      ["Unique page title", Boolean(documentNode.title.trim()), "Add a concise title element."],
      ["Viewport metadata", Boolean(documentNode.querySelector('meta[name="viewport"]')), "Add responsive viewport metadata."],
      ["One primary heading", documentNode.querySelectorAll("h1").length === 1, "Use exactly one descriptive H1."],
      ["Heading order", !skipped, "Avoid skipping heading levels."],
      ["Image alternatives", [...documentNode.images].every((image) => image.hasAttribute("alt")), "Give every image an alt attribute; decorative images use empty alt."],
      ["Named controls", [...documentNode.querySelectorAll("button,a[href]")].every((item) => (item.textContent || item.getAttribute("aria-label") || item.querySelector("img")?.alt || "").trim()), "Give links and buttons an accessible name."],
      ["Form labels", [...documentNode.querySelectorAll("input:not([type=hidden]),select,textarea")].every((item) => item.getAttribute("aria-label") || item.getAttribute("aria-labelledby") || (item.id && documentNode.querySelector(`label[for="${CSS.escape(item.id)}"]`))), "Associate every field with a label."],
    ];
    setResults(checks.map(([name, passed, guidance]) => ({ name, passed, guidance })));
  };
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={ShieldCheck} title="Private HTML readiness audit" description="Paste rendered HTML to catch common accessibility and document-quality issues locally. This is not a penetration test." />
      <FieldLabel htmlFor="security-html">HTML source</FieldLabel><textarea id="security-html" rows={12} value={html} onChange={(event) => setHtml(event.target.value)} className={fieldClass} placeholder="<!doctype html>..." />
      <Button className="mt-4" onClick={audit} disabled={!html.trim()}><ShieldCheck className="h-4 w-4" /> Run local audit</Button>
      {results.length ? <div className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">{results.map((item) => <div key={item.name} className="rounded-lg border border-border bg-background p-4"><div className="flex items-center gap-2 font-semibold">{item.passed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-[var(--anslation-ds-danger)]" />}{item.name}</div><p className="mt-2 text-sm text-muted-foreground">{item.passed ? "Passed this automated check." : item.guidance}</p></div>)}</div> : null}
    </Card>
  );
}

const IMPACT_EDITIONS = [
  { country: "India", name: "AltF Bharat", sources: [["myScheme", "https://www.myscheme.gov.in/", "Government scheme discovery"], ["Startup India", "https://www.startupindia.gov.in/", "Startup recognition and support"]] },
  { country: "United States", name: "AltF USA", sources: [["USAGov Benefit Finder", "https://www.usa.gov/benefit-finder", "Federal benefits and financial help"]] },
  { country: "United Kingdom", name: "AltF UK", sources: [["GOV.UK Benefits", "https://www.gov.uk/browse/benefits", "Benefits, eligibility and claims"]] },
  { country: "Canada", name: "AltF Canada", sources: [["Canada Benefits Finder", "https://www.canada.ca/en/services/benefits/finder.html", "Federal benefits and programs"]] },
  { country: "Australia", name: "AltF Australia", sources: [["Business grants finder", "https://business.gov.au/grants-and-programs", "Government grants and business support"]] },
];

function ImpactWorkspace() {
  const [country, setCountry] = useState("India"); const edition = IMPACT_EDITIONS.find((item) => item.country === country);
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={Globe2} title="Official support directory" description="Select an edition, then continue on the official source. AltFTool does not determine eligibility or collect identity details." />
      <SelectField id="impact-country" label="Country edition" value={country} onChange={(event) => setCountry(event.target.value)} options={IMPACT_EDITIONS.map((item) => [item.country, `${item.name} · ${item.country}`])} />
      <div className="mt-5 space-y-3">
        {edition.sources.map(([name, href, description]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="group flex min-h-20 items-center gap-4 rounded-lg border border-border bg-background p-4 outline-none transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none motion-reduce:transition-none"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"><ExternalLink className="h-5 w-5" /></span><span className="flex-1"><strong className="block">{name}</strong><span className="mt-1 block text-sm text-muted-foreground">{description} · Official source verified July 2026</span></span><ExternalLink className="h-4 w-4 text-primary" /></a>)}
      </div>
      <p className="mt-5 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">Programs and eligibility can change. Always rely on the destination authority for current rules and application decisions.</p>
    </Card>
  );
}

function DevelopersWorkspace() {
  const [endpoint, setEndpoint] = useState("/api/signals"); const [state, setState] = useState({ loading: false, output: "", error: "" });
  const run = async () => { setState({ loading: true, output: "", error: "" }); try { const response = await fetch(endpoint, { headers: { accept: "application/json" } }); const payload = await response.json(); setState({ loading: false, output: JSON.stringify(payload, null, 2), error: response.ok ? "" : `HTTP ${response.status}` }); } catch (error) { setState({ loading: false, output: "", error: error.message }); } };
  const origin = typeof window === "undefined" ? "https://altftool.com" : window.location.origin;
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={Code2} title="Public API console" description="Try a read-only endpoint, inspect its JSON response, and copy a request example." />
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><SelectField id="api-endpoint" label="Endpoint" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} options={[["/api/signals","GET /api/signals"],["/api/health","GET /api/health"],["/api/signals?sort=volume","GET /api/signals?sort=volume"]]} /><Button onClick={run} loading={state.loading} className="sm:self-end"><Play className="h-4 w-4" /> Send</Button></div>
      <div className="mt-4 flex flex-wrap gap-2"><CopyButton value={`curl -H "Accept: application/json" "${origin}${endpoint}"`} label="Copy cURL" /><CopyButton value={`const response = await fetch("${origin}${endpoint}");\nconst data = await response.json();`} label="Copy fetch" /></div>
      {state.error ? <p className="mt-4 text-sm text-[var(--anslation-ds-danger)]" role="alert">{state.error}</p> : null}
      <pre className="mt-4 min-h-56 max-h-96 overflow-auto rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground">{state.output || "Response will appear here."}</pre>
    </Card>
  );
}

function VaultWorkspace() {
  const gates = ["Published threat model and abuse review", "Independent cryptography and extension audit", "Tested recovery model without server-readable secrets", "Security incident and disclosure process", "Telemetry verified to exclude secret material"];
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={LockKeyhole} title="Vault is intentionally gated" description="A password manager must earn trust before it stores anything. AltFTool has not enabled account storage, sync, imports, or browser extension access." />
      <div className="rounded-lg border border-border bg-muted p-4"><Badge tone="neutral">No password storage active</Badge><p className="mt-3 text-sm leading-6 text-muted-foreground">This page is a release gate, not a disguised beta. Use the focused password utilities in the related tools panel while the independent security work remains incomplete.</p></div>
      <h3 className="mt-6 font-semibold">Required before release</h3>
      <ul className="mt-3 space-y-2">{gates.map((gate) => <li key={gate} className="flex gap-3 rounded-md border border-border bg-background p-3 text-sm"><LockKeyhole className="h-4 w-4 shrink-0 text-primary" />{gate}</li>)}</ul>
    </Card>
  );
}

function HubWorkspace({ suite }) {
  return (
    <Card className={panelClass}>
      <WorkspaceTitle icon={ListChecks} title={`${suite.name} task path`} description="Choose the outcome you need and continue directly into the matching working utility." />
      <ol className="space-y-3">
        {suite.relatedTools.map(([label, href], index) => (
          <li key={href}><Link href={href} className="group flex min-h-16 items-center gap-4 rounded-lg border border-border bg-background p-4 outline-none transition duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-primary/35 motion-reduce:transform-none motion-reduce:transition-none"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none">{index + 1}</span><span className="flex-1"><strong className="block">{label}</strong><span className="mt-1 block text-sm text-muted-foreground">Open the focused tool and keep your work moving.</span></span><ExternalLink className="h-4 w-4 text-primary" /></Link></li>
        ))}
      </ol>
    </Card>
  );
}

function SelectField({ id, label, options, ...props }) {
  return <div className="min-w-0"><FieldLabel htmlFor={id}>{label}</FieldLabel><select id={id} className={fieldClass} {...props}>{options.map(([value, optionLabel]) => <option key={String(value)} value={value}>{optionLabel}</option>)}</select></div>;
}

function ResultList({ title, items, icon: Icon, empty = "No items found." }) {
  return <div className="rounded-lg border border-border bg-background p-4"><h3 className="flex items-center gap-2 font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</h3>{items.length ? <ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="text-sm leading-6 text-muted-foreground">{item}</li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">{empty}</p>}</div>;
}

function MetricCard({ label, value }) {
  return <div className="rounded-lg border border-border bg-background p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div>;
}

function Finding({ finding }) {
  return <div className="rounded-lg border border-border bg-background p-4"><div className="flex items-center gap-2">{finding.passed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-[var(--anslation-ds-danger)]" />}<strong>{finding.label}</strong></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{finding.message}</p></div>;
}
