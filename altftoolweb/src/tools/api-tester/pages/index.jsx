"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  FileJson,
  Folder,
  FolderPlus,
  Globe,
  History,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Plus,
  Save,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Variable,
  Wand2,
  X,
  Zap,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   Constants & helpers
--------------------------------------------------------------------------- */

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

const METHOD_COLORS = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-amber-600 dark:text-amber-400",
  PUT: "text-blue-600 dark:text-blue-400",
  PATCH: "text-violet-600 dark:text-violet-400",
  DELETE: "text-red-600 dark:text-red-400",
  HEAD: "text-slate-500",
  OPTIONS: "text-slate-500",
};
const methodColor = (m) => METHOD_COLORS[m] || "text-slate-500";

const SAMPLES = [
  { name: "Get a post", method: "GET", url: "https://jsonplaceholder.typicode.com/posts/1" },
  { name: "List users", method: "GET", url: "https://jsonplaceholder.typicode.com/users" },
  { name: "Create post", method: "POST", url: "https://jsonplaceholder.typicode.com/posts", body: '{\n  "title": "Hello",\n  "body": "World",\n  "userId": 1\n}' },
  { name: "Random dog", method: "GET", url: "https://dog.ceo/api/breeds/image/random" },
];

const load = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const emptyRow = () => ({ id: Math.random().toString(36).slice(2), key: "", value: "", on: true });

const applyVars = (text, vars) =>
  String(text || "").replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (m, name) => (vars[name] !== undefined ? vars[name] : m));

const prettyBytes = (n) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`);

const statusTone = (s) =>
  s === 0 ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
  : s < 300 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
  : s < 400 ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30"
  : s < 500 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30";

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export default function ToolHome() {
  /* ------- workspace state ------- */
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [params, setParams] = useState([emptyRow()]);
  const [headers, setHeaders] = useState([emptyRow()]);
  const [body, setBody] = useState("");
  const [authType, setAuthType] = useState("none");
  const [authToken, setAuthToken] = useState("");
  const [authUser, setAuthUser] = useState("");
  const [authPass, setAuthPass] = useState("");

  const [reqTab, setReqTab] = useState("params");
  const [resTab, setResTab] = useState("body");
  const [pretty, setPretty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [copied, setCopied] = useState(false);

  /* ------- sidebar state ------- */
  const [sideTab, setSideTab] = useState("collections");
  const [collections, setCollections] = useState(() => load("postman-collections", [{ id: "1", name: "My Collection", requests: [] }]));
  const [history, setHistory] = useState(() => load("postman-history", []));
  const [envVars, setEnvVars] = useState(() => load("apitester-env", [emptyRow()]));
  const [openCols, setOpenCols] = useState({});
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveCol, setSaveCol] = useState("1");
  const abortRef = useRef(null);

  useEffect(() => { localStorage.setItem("postman-collections", JSON.stringify(collections)); }, [collections]);
  useEffect(() => { localStorage.setItem("postman-history", JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem("apitester-env", JSON.stringify(envVars)); }, [envVars]);

  const vars = useMemo(() => {
    const map = {};
    envVars.forEach((r) => { if (r.on && r.key) map[r.key] = r.value; });
    return map;
  }, [envVars]);

  /* ------- params <-> URL sync ------- */
  const setUrlFromParams = (rows) => {
    try {
      const base = url.split("?")[0];
      const qs = rows
        .filter((r) => r.on && r.key)
        .map((r) => `${encodeURIComponent(r.key)}=${encodeURIComponent(r.value)}`)
        .join("&");
      setUrl(qs ? `${base}?${qs}` : base);
    } catch { /* keep url as-is */ }
  };

  /* ------- request execution ------- */
  const send = async () => {
    const finalUrl = applyVars(url, vars).trim();
    if (!finalUrl) return;
    setLoading(true);
    setResponse(null);
    const controller = new AbortController();
    abortRef.current = controller;
    const startTime = Date.now();

    const headerObj = {};
    headers.forEach((h) => { if (h.on && h.key) headerObj[applyVars(h.key, vars)] = applyVars(h.value, vars); });
    if (authType === "bearer" && authToken) headerObj["Authorization"] = `Bearer ${applyVars(authToken, vars)}`;
    if (authType === "basic" && (authUser || authPass)) headerObj["Authorization"] = `Basic ${btoa(`${authUser}:${authPass}`)}`;

    const hasBody = !["GET", "HEAD"].includes(method) && body.trim();
    if (hasBody && !Object.keys(headerObj).some((k) => k.toLowerCase() === "content-type")) {
      headerObj["Content-Type"] = "application/json";
    }

    let result;
    try {
      const res = await fetch(finalUrl, {
        method,
        headers: headerObj,
        body: hasBody ? applyVars(body, vars) : undefined,
        signal: controller.signal,
      });
      const text = await res.text();
      result = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data: text,
        size: new Blob([text]).size,
        time: Date.now() - startTime,
      };
    } catch (error) {
      result = {
        status: 0,
        statusText: error.name === "AbortError" ? "Cancelled" : "Network Error",
        headers: {},
        data: error.name === "AbortError" ? "Request cancelled." : `${error.message}\n\nTip: many public APIs block browser requests via CORS. This tool runs entirely in your browser, so the target API must allow cross-origin requests.`,
        size: 0,
        time: Date.now() - startTime,
      };
    }

    setResponse(result);
    setResTab("body");
    setLoading(false);
    setHistory((h) => [
      { id: Date.now().toString(), timestamp: new Date().toISOString(), request: { method, url: finalUrl, headers: headerObj, body: hasBody ? body : "" }, response: { status: result.status, statusText: result.statusText, time: result.time } },
      ...h.slice(0, 49),
    ]);
  };

  const cancel = () => abortRef.current?.abort();

  /* ------- load helpers ------- */
  const loadRequest = (r) => {
    setMethod(r.method || "GET");
    setUrl(r.url || "");
    setBody(r.body || "");
    const hs = Object.entries(r.headers || {}).map(([key, value]) => ({ id: Math.random().toString(36).slice(2), key, value, on: true }));
    setHeaders(hs.length ? hs : [emptyRow()]);
    setResponse(null);
  };

  const saveRequest = () => {
    if (!saveName.trim()) return;
    const headerObj = {};
    headers.forEach((h) => { if (h.on && h.key) headerObj[h.key] = h.value; });
    const req = { id: Date.now().toString(), name: saveName.trim(), method, url, headers: headerObj, body };
    setCollections((cols) => cols.map((c) => (c.id === saveCol ? { ...c, requests: [...c.requests, req] } : c)));
    setOpenCols((o) => ({ ...o, [saveCol]: true }));
    setSaveOpen(false);
    setSaveName("");
    setSideTab("collections");
  };

  const addCollection = () => {
    const name = prompt("Collection name");
    if (name?.trim()) setCollections((c) => [...c, { id: Date.now().toString(), name: name.trim(), requests: [] }]);
  };

  /* ------- derived ------- */
  const isJsonResponse = useMemo(() => {
    if (!response) return false;
    try { JSON.parse(response.data); return true; } catch { return false; }
  }, [response]);

  const shownBody = response
    ? pretty && isJsonResponse ? JSON.stringify(JSON.parse(response.data), null, 2) : response.data
    : "";

  const copyResponse = () => {
    navigator.clipboard?.writeText(shownBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const downloadResponse = () => {
    const blob = new Blob([response.data], { type: "text/plain" });
    const dlUrl = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: dlUrl, download: isJsonResponse ? "response.json" : "response.txt" });
    a.click();
    URL.revokeObjectURL(dlUrl);
  };

  const formatBody = () => {
    try { setBody(JSON.stringify(JSON.parse(body), null, 2)); } catch { /* not JSON */ }
  };

  /* ------- KV editor ------- */
  const kvEditor = (rows, setRows, keyPh, valPh) => (
    <div className="space-y-1.5">
      {rows.map((row, i) => (
        <div key={row.id} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={row.on}
            onChange={() => { const next = rows.map((r, idx) => (idx === i ? { ...r, on: !r.on } : r)); setRows(next); }}
            className="h-3.5 w-3.5 shrink-0 accent-(--primary)"
          />
          <input
            value={row.key}
            placeholder={keyPh}
            onChange={(e) => {
              const next = rows.map((r, idx) => (idx === i ? { ...r, key: e.target.value } : r));
              if (i === rows.length - 1 && e.target.value) next.push(emptyRow());
              setRows(next);
            }}
            className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 font-mono text-[12px] text-(--foreground) outline-none focus:border-(--primary)"
          />
          <input
            value={row.value}
            placeholder={valPh}
            onChange={(e) => setRows(rows.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)))}
            className="min-w-0 flex-1 rounded-lg border border-(--border) bg-(--background) px-2.5 py-1.5 font-mono text-[12px] text-(--foreground) outline-none focus:border-(--primary)"
          />
          <button
            onClick={() => setRows(rows.length > 1 ? rows.filter((_, idx) => idx !== i) : [emptyRow()])}
            aria-label="Remove row"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-(--muted-foreground) hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  const sideTabBtn = (id, label, Icon) => (
    <button
      key={id}
      onClick={() => setSideTab(id)}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-semibold transition-colors ${
        sideTab === id ? "bg-(--card) text-(--foreground) shadow-sm" : "text-(--muted-foreground) hover:text-(--foreground)"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-(--background) px-3 py-6 text-(--foreground) antialiased sm:px-5 sm:py-8">
      <div className="mx-auto max-w-7xl">
        {/* ================= header ================= */}
        <header className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Send className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">API Tester</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--card) px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Zap className="h-3 w-3" /> Runs in your browser
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-(--muted-foreground)">Build, send and inspect API requests — collections, history & environment variables included.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {SAMPLES.map((s) => (
              <button
                key={s.name}
                onClick={() => loadRequest(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1.5 text-[12px] font-medium text-(--muted-foreground) hover:text-(--foreground) hover:border-(--primary)/40 transition-colors"
              >
                <span className={`font-mono text-[10px] font-bold ${methodColor(s.method)}`}>{s.method}</span>
                {s.name}
              </button>
            ))}
          </div>
        </header>

        {/* ================= workbench ================= */}
        <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]">
            {/* ---------------- sidebar ---------------- */}
            <aside className="border-b border-(--border) lg:border-b-0 lg:border-r">
              <div className="m-3 flex rounded-xl border border-(--border) bg-(--muted)/40 p-1">
                {sideTabBtn("collections", "Saved", Folder)}
                {sideTabBtn("history", "History", History)}
                {sideTabBtn("env", "Env", Variable)}
              </div>

              <div className="apo-scroll max-h-[520px] overflow-y-auto px-3 pb-3">
                {/* collections */}
                {sideTab === "collections" && (
                  <div className="space-y-1">
                    {collections.map((col) => {
                      const open = openCols[col.id] ?? true;
                      return (
                        <div key={col.id}>
                          <div className="group flex items-center gap-1 rounded-lg px-1.5 py-1.5 hover:bg-(--muted)/50">
                            <button onClick={() => setOpenCols((o) => ({ ...o, [col.id]: !open }))} className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
                              {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-(--muted-foreground)" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-(--muted-foreground)" />}
                              <Folder className="h-3.5 w-3.5 shrink-0 text-(--primary)" />
                              <span className="truncate text-[13px] font-semibold">{col.name}</span>
                              <span className="text-[10px] text-(--muted-foreground)">({col.requests.length})</span>
                            </button>
                            <button
                              onClick={() => { if (confirm(`Delete collection "${col.name}"?`)) setCollections((cs) => cs.filter((c) => c.id !== col.id)); }}
                              className="hidden h-6 w-6 shrink-0 place-items-center rounded text-(--muted-foreground) hover:text-red-500 group-hover:grid"
                              aria-label="Delete collection"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          {open && (
                            <div className="ml-4 border-l border-(--border) pl-2">
                              {col.requests.length === 0 && <p className="px-2 py-1.5 text-[11px] text-(--muted-foreground)">No saved requests yet.</p>}
                              {col.requests.map((r) => (
                                <div key={r.id} className="group flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-(--muted)/50">
                                  <button onClick={() => loadRequest(r)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                                    <span className={`w-10 shrink-0 font-mono text-[10px] font-bold ${methodColor(r.method)}`}>{r.method}</span>
                                    <span className="truncate text-[12px]">{r.name}</span>
                                  </button>
                                  <button
                                    onClick={() => setCollections((cs) => cs.map((c) => (c.id === col.id ? { ...c, requests: c.requests.filter((x) => x.id !== r.id) } : c)))}
                                    className="hidden h-6 w-6 shrink-0 place-items-center rounded text-(--muted-foreground) hover:text-red-500 group-hover:grid"
                                    aria-label="Delete request"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button onClick={addCollection} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-(--border) py-2 text-[12px] font-medium text-(--muted-foreground) hover:text-(--foreground) hover:border-(--primary)/40 transition-colors">
                      <FolderPlus className="h-3.5 w-3.5" /> New Collection
                    </button>
                  </div>
                )}

                {/* history */}
                {sideTab === "history" && (
                  <div className="space-y-1">
                    {history.length === 0 && <p className="px-2 py-6 text-center text-[12px] text-(--muted-foreground)">Requests you send will appear here.</p>}
                    {history.map((h) => (
                      <button key={h.id} onClick={() => loadRequest(h.request)} className="w-full rounded-lg px-2 py-2 text-left hover:bg-(--muted)/50">
                        <div className="flex items-center gap-2">
                          <span className={`w-11 shrink-0 font-mono text-[10px] font-bold ${methodColor(h.request.method)}`}>{h.request.method}</span>
                          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-(--foreground)">{h.request.url.replace(/^https?:\/\//, "")}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 pl-13 text-[10px] text-(--muted-foreground)">
                          <span className={h.response.status >= 400 || h.response.status === 0 ? "text-red-500 font-semibold" : "text-emerald-600 dark:text-emerald-400 font-semibold"}>
                            {h.response.status || "ERR"}
                          </span>
                          <span>{h.response.time} ms</span>
                          <span>{new Date(h.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </button>
                    ))}
                    {history.length > 0 && (
                      <button onClick={() => setHistory([])} className="mt-2 w-full rounded-xl border border-(--border) py-1.5 text-[11px] font-medium text-(--muted-foreground) hover:text-red-500 transition-colors">
                        Clear history
                      </button>
                    )}
                  </div>
                )}

                {/* environment */}
                {sideTab === "env" && (
                  <div>
                    <p className="mb-2 rounded-lg bg-(--muted)/40 p-2 text-[11px] leading-relaxed text-(--muted-foreground)">
                      Define variables and use them anywhere as <code className="rounded bg-(--muted) px-1 font-mono text-[10px]">{"{{name}}"}</code> — in the URL, headers or body.
                    </p>
                    {kvEditor(envVars, setEnvVars, "variable", "value")}
                  </div>
                )}
              </div>
            </aside>

            {/* ---------------- main panel ---------------- */}
            <div className="flex min-w-0 flex-col">
              {/* request bar */}
              <div className="border-b border-(--border) p-3 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className={`h-10 w-full appearance-none rounded-xl border border-(--border) bg-(--background) pl-3 pr-8 font-mono text-[13px] font-bold outline-none focus:border-(--primary) sm:w-28 ${methodColor(method)}`}
                    >
                      {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--muted-foreground)" />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--muted-foreground)" />
                    <input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !loading && send()}
                      placeholder="https://api.example.com/v1/users  ·  supports {{variables}}"
                      spellCheck={false}
                      className="h-10 w-full rounded-xl border border-(--border) bg-(--background) pl-9 pr-3 font-mono text-[13px] text-(--foreground) outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
                    />
                  </div>
                  <div className="flex gap-2">
                    {loading ? (
                      <button onClick={cancel} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-500/40 px-4 text-[13px] font-semibold text-red-500 hover:bg-red-500/10 sm:flex-none">
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    ) : (
                      <button onClick={send} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-(--primary) px-5 text-[13px] font-semibold text-white shadow-lg shadow-(--primary)/20 hover:bg-(--primary)/90 sm:flex-none">
                        <Send className="h-4 w-4" /> Send
                      </button>
                    )}
                    <button onClick={() => { setSaveOpen(true); setSaveName(""); }} aria-label="Save request" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-(--border) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted)/60">
                      <Save className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* request tabs */}
                <div className="mt-3 flex items-center gap-1 overflow-x-auto">
                  {[
                    { id: "params", label: "Params", icon: Settings2 },
                    { id: "headers", label: "Headers", icon: Layers },
                    { id: "auth", label: "Auth", icon: KeyRound },
                    { id: "body", label: "Body", icon: FileJson },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setReqTab(id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                        reqTab === id ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted-foreground) hover:text-(--foreground)"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                      {id === "headers" && headers.some((h) => h.on && h.key) && <span className="rounded-full bg-(--primary)/15 px-1.5 text-[10px]">{headers.filter((h) => h.on && h.key).length}</span>}
                    </button>
                  ))}
                </div>

                {/* tab bodies */}
                <div className="mt-3">
                  {reqTab === "params" && (
                    <div>
                      {kvEditor(params, (rows) => { setParams(rows); setUrlFromParams(rows); }, "key", "value")}
                      <p className="mt-2 text-[11px] text-(--muted-foreground)">Query params are appended to the URL automatically.</p>
                    </div>
                  )}
                  {reqTab === "headers" && kvEditor(headers, setHeaders, "Header name", "Header value")}
                  {reqTab === "auth" && (
                    <div className="space-y-3">
                      <div className="flex gap-1 rounded-xl border border-(--border) bg-(--muted)/40 p-1 sm:w-fit">
                        {[["none", "No Auth"], ["bearer", "Bearer Token"], ["basic", "Basic Auth"]].map(([id, label]) => (
                          <button key={id} onClick={() => setAuthType(id)} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors ${authType === id ? "bg-(--card) text-(--foreground) shadow-sm" : "text-(--muted-foreground)"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                      {authType === "bearer" && (
                        <div className="relative sm:max-w-md">
                          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--muted-foreground)" />
                          <input value={authToken} onChange={(e) => setAuthToken(e.target.value)} placeholder="Token — sent as Authorization: Bearer …" className="w-full rounded-xl border border-(--border) bg-(--background) py-2 pl-9 pr-3 font-mono text-[12px] outline-none focus:border-(--primary)" />
                        </div>
                      )}
                      {authType === "basic" && (
                        <div className="flex flex-col gap-2 sm:max-w-md sm:flex-row">
                          <input value={authUser} onChange={(e) => setAuthUser(e.target.value)} placeholder="Username" className="flex-1 rounded-xl border border-(--border) bg-(--background) px-3 py-2 font-mono text-[12px] outline-none focus:border-(--primary)" />
                          <input value={authPass} onChange={(e) => setAuthPass(e.target.value)} type="password" placeholder="Password" className="flex-1 rounded-xl border border-(--border) bg-(--background) px-3 py-2 font-mono text-[12px] outline-none focus:border-(--primary)" />
                        </div>
                      )}
                    </div>
                  )}
                  {reqTab === "body" && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] text-(--muted-foreground)">Raw body (JSON, text…) — sent as-is. Supports {"{{variables}}"}.</p>
                        <button onClick={formatBody} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-(--primary) hover:bg-(--primary)/10">
                          <Wand2 className="h-3 w-3" /> Beautify JSON
                        </button>
                      </div>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        spellCheck={false}
                        rows={7}
                        placeholder={'{\n  "key": "value"\n}'}
                        className="apo-scroll w-full resize-y rounded-xl border border-(--border) bg-(--background) p-3 font-mono text-[12px] leading-relaxed text-(--foreground) outline-none focus:border-(--primary)"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ---------------- response ---------------- */}
              <div className="flex min-h-[280px] flex-1 flex-col p-3 sm:p-4">
                {!response && !loading && (
                  <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--muted)/60 text-(--muted-foreground)">
                      <Send className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold">Ready when you are</h3>
                    <p className="mt-1 max-w-sm text-[13px] text-(--muted-foreground)">Hit <span className="font-semibold text-(--foreground)">Send</span> to fire the request — or try a sample from the top bar.</p>
                  </div>
                )}
                {loading && (
                  <div className="flex flex-1 flex-col items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-(--primary)" />
                    <p className="mt-3 text-[13px] text-(--muted-foreground)">Sending request…</p>
                  </div>
                )}
                {response && !loading && (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[12px] font-bold ${statusTone(response.status)}`}>
                        {response.status || "ERR"} {response.statusText}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[12px] text-(--muted-foreground)"><Clock className="h-3 w-3" /> {response.time} ms</span>
                      <span className="text-[12px] text-(--muted-foreground)">{prettyBytes(response.size)}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        {isJsonResponse && (
                          <button onClick={() => setPretty((p) => !p)} className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${pretty ? "bg-(--primary)/10 text-(--primary)" : "border border-(--border) text-(--muted-foreground)"}`}>
                            Pretty
                          </button>
                        )}
                        <button onClick={copyResponse} aria-label="Copy response" className="grid h-7 w-7 place-items-center rounded-lg border border-(--border) text-(--muted-foreground) hover:text-(--foreground)">
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={downloadResponse} aria-label="Download response" className="grid h-7 w-7 place-items-center rounded-lg border border-(--border) text-(--muted-foreground) hover:text-(--foreground)">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1">
                      {["body", "headers"].map((t) => (
                        <button key={t} onClick={() => setResTab(t)} className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors ${resTab === t ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted-foreground) hover:text-(--foreground)"}`}>
                          {t} {t === "headers" && <span className="text-[10px]">({Object.keys(response.headers).length})</span>}
                        </button>
                      ))}
                    </div>

                    {resTab === "body" && (
                      <pre className="apo-scroll mt-2 max-h-96 flex-1 overflow-auto rounded-xl border border-(--border) bg-(--muted)/30 p-3 font-mono text-[12px] leading-relaxed text-(--foreground)">
                        {shownBody || "(empty body)"}
                      </pre>
                    )}
                    {resTab === "headers" && (
                      <div className="apo-scroll mt-2 max-h-96 overflow-auto rounded-xl border border-(--border)">
                        {Object.entries(response.headers).length === 0 && <p className="p-3 text-[12px] text-(--muted-foreground)">No headers available.</p>}
                        {Object.entries(response.headers).map(([k, v]) => (
                          <div key={k} className="flex gap-3 border-b border-(--border) px-3 py-2 font-mono text-[11px] last:border-0">
                            <span className="w-44 shrink-0 truncate font-semibold text-(--primary)">{k}</span>
                            <span className="min-w-0 break-all text-(--foreground)">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-(--muted-foreground)">
          Everything runs locally — requests go straight from your browser to the target API. APIs must allow CORS for browser access.
        </p>
      </div>

      {/* ================= save modal ================= */}
      {saveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSaveOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-(--border) bg-(--card) p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold">Save Request</h2>
              <button onClick={() => setSaveOpen(false)} className="grid h-7 w-7 place-items-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-(--muted-foreground)">Request name</label>
                <input value={saveName} onChange={(e) => setSaveName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveRequest()} placeholder="e.g. Get user profile" autoFocus className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-[13px] outline-none focus:border-(--primary)" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-(--muted-foreground)">Collection</label>
                <select value={saveCol} onChange={(e) => setSaveCol(e.target.value)} className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-[13px] outline-none focus:border-(--primary)">
                  {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button onClick={saveRequest} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-(--primary) py-2.5 text-[13px] font-semibold text-white hover:bg-(--primary)/90">
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .apo-scroll::-webkit-scrollbar { height: 6px; width: 6px }
        .apo-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, currentColor 18%, transparent); border-radius: 9999px }
      ` }} />
    </div>
  );
}
