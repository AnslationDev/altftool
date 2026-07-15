"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Clipboard,
  Download,
  FileArchive,
  FileText,
  History,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  Wand2,
} from "lucide-react";
import Header from "../components/Header";
import Panel from "../components/Panel";
import Features from "../components/Features";
import {
  HISTORY_KEY,
  HISTORY_LIMIT,
  SOURCE_ENCODINGS,
  STORAGE_KEY,
  TARGET_ENCODINGS,
  convertFileRecord,
  detectEncoding,
  downloadBytes,
  formatBytes,
  formatEncodedPreview,
  formatHexPreview,
  looksGarbled,
  previewText,
  readFileAsBytes,
  safeReadJson,
} from "../utils/encodingUtils";

export default function ToolHome() {
  const saved = useMemo(() => safeReadJson(STORAGE_KEY, {}), []);
  const [records, setRecords] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [sourceEncoding, setSourceEncoding] = useState(saved.sourceEncoding || "auto");
  const [targetEncoding, setTargetEncoding] = useState(saved.targetEncoding || "utf-8");
  const [repairMode, setRepairMode] = useState(saved.repairMode || "none");
  const [history, setHistory] = useState(() => safeReadJson(HISTORY_KEY, []));
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const originalPreviewRef = useRef(null);
  const convertedPreviewRef = useRef(null);
  const syncingPreviewRef = useRef(false);

  const convertedRecords = useMemo(
    () => records.map((record) => convertFileRecord(record, sourceEncoding, targetEncoding, repairMode)),
    [records, sourceEncoding, targetEncoding, repairMode]
  );
  const activeRecord = convertedRecords.find((record) => record.id === activeId) || convertedRecords[0] || null;
  const activeError = activeRecord?.validation?.find((message) => message.type === "error")?.text || "";
  const convertedCompareText = activeRecord?.canDownload ? formatEncodedPreview(activeRecord.outputBytes, activeRecord.targetEncoding) : activeError;
  const convertedPreviewText = activeRecord?.canDownload ? activeRecord.convertedText : activeError;
  const garbled = activeRecord ? looksGarbled(activeRecord.originalText) : false;
  const activeHistorySnapshot = useMemo(() => {
    if (!activeRecord) return null;
    return {
      name: activeRecord.name,
      source: activeRecord.sourceEncoding,
      target: activeRecord.targetEncoding,
      bytes: activeRecord.stats.outputBytes,
    };
  }, [activeRecord]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sourceEncoding, targetEncoding, repairMode }));
  }, [sourceEncoding, targetEncoding, repairMode]);

  useEffect(() => {
    if (originalPreviewRef.current) originalPreviewRef.current.scrollTop = 0;
    if (convertedPreviewRef.current) convertedPreviewRef.current.scrollTop = 0;
  }, [activeRecord?.id, sourceEncoding, targetEncoding, repairMode]);

  useEffect(() => {
    if (!activeHistorySnapshot) return;
    const timer = window.setTimeout(() => {
      const item = {
        id: `${activeHistorySnapshot.name}-${Date.now()}`,
        name: activeHistorySnapshot.name,
        source: activeHistorySnapshot.source,
        target: activeHistorySnapshot.target,
        bytes: activeHistorySnapshot.bytes,
        createdAt: new Date().toISOString(),
      };
      setHistory((current) => {
        const next = [item, ...current.filter((entry) => entry.name !== item.name)].slice(0, HISTORY_LIMIT);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [activeHistorySnapshot]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  const loadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    try {
      const loaded = await Promise.all(
        files.map(async (file) => {
          const bytes = await readFileAsBytes(file);
          const detected = detectEncoding(bytes);
          return {
            id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID?.() || Date.now()}`,
            name: file.name,
            type: file.type || "text/plain",
            size: file.size,
            lastModified: file.lastModified,
            bytes,
            detected,
          };
        })
      );
      setRecords((current) => [...loaded, ...current].slice(0, 12));
      setActiveId(loaded[0]?.id || "");
      if (fileInputRef.current) fileInputRef.current.value = "";
      flash(`${loaded.length} file${loaded.length === 1 ? "" : "s"} analyzed.`);
    } catch (error) {
      flash(error?.message || "Unable to read selected files.");
    }
  };

  const copyConverted = async () => {
    if (!activeRecord?.convertedText) return flash("No converted text to copy yet.");
    if (!activeRecord.canDownload) return flash("Fix validation errors before copying converted text.");
    await navigator.clipboard.writeText(activeRecord.convertedText);
    setCopied(true);
    flash("Converted text copied.");
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadActive = () => {
    if (!activeRecord?.outputBytes) return flash("No converted file to download yet.");
    if (!activeRecord.canDownload) return flash("Fix validation errors before downloading.");
    downloadBytes(activeRecord.outputName, activeRecord.outputBytes, `${activeRecord.type || "text/plain"};charset=${targetEncoding}`);
    flash("Converted file downloaded.");
  };

  const downloadBatch = () => {
    if (!convertedRecords.length) return flash("Upload files before batch download.");
    const downloadable = convertedRecords.filter((record) => record.canDownload);
    if (!downloadable.length) return flash("Fix validation errors before downloading.");
    downloadable.forEach((record) => {
      downloadBytes(record.outputName, record.outputBytes, `${record.type || "text/plain"};charset=${targetEncoding}`);
    });
    flash(`${downloadable.length} converted file${downloadable.length === 1 ? "" : "s"} downloaded.`);
  };

  const clearWorkspace = () => {
    setRecords([]);
    setActiveId("");
    flash("Workspace cleared.");
  };

  const syncPreviewScroll = (source, target) => {
    if (syncingPreviewRef.current || !source.current || !target.current) return;
    syncingPreviewRef.current = true;
    target.current.scrollTop = source.current.scrollTop;
    target.current.scrollLeft = source.current.scrollLeft;
    window.requestAnimationFrame(() => {
      syncingPreviewRef.current = false;
    });
  };

  return (
    <main className="encoding-studio min-h-screen max-w-full overflow-visible bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative isolate px-2 py-4 sm:px-5 lg:px-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_55%_0%,rgba(236,72,153,0.12),transparent_24%)]" />

        <section className="mx-auto max-w-7xl space-y-3">
          <Header activeFile={activeRecord?.name} convertedCount={convertedRecords.length} historyCount={history.length} />

          {notice && (
            <div className="fixed right-4 top-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-emerald-400/40 bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-xl">
              <span className="break-words [overflow-wrap:anywhere]">{notice}</span>
            </div>
          )}

          <section className="grid min-w-0 items-start gap-3 2xl:grid-cols-[minmax(0,1fr)_minmax(320px,400px)]">
            <div className="min-w-0 space-y-3">
              <Panel title="Upload Panel" icon={UploadCloud}>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    loadFiles(event.dataTransfer.files);
                  }}
                  className={`flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-center transition ${
                    dragging ? "border-cyan-400 bg-cyan-500/10" : "border-[var(--border)] bg-[var(--background)]/70 hover:border-cyan-400/70"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-7 w-7 text-cyan-500" />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-black text-[var(--foreground)]">Drop text, CSV, JSON, XML, HTML, CSS, JS, logs, or code files</p>
                    <p className="mt-1 break-words text-xs text-[var(--muted-foreground)]">Multiple files are supported and processed fully inside your browser.</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.csv,.json,.xml,.html,.htm,.css,.js,.ts,.jsx,.tsx,.md,.log,.yml,.yaml,.ini,.env,text/*,application/json,application/xml"
                    onChange={(event) => loadFiles(event.target.files)}
                    className="sr-only"
                  />
                </div>
              </Panel>

              <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                <Panel title="Encoding Detection Panel" icon={Sparkles}>
                  {activeRecord ? (
                    <div className="space-y-2">
                      <Metric label="Detected" value={activeRecord.detected.label} />
                      <Metric label="Confidence" value={`${activeRecord.detected.confidence}%`} />
                      <Metric label="BOM" value={activeRecord.detected.bom?.bytes || "Not detected"} />
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                        <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${activeRecord.detected.confidence}%` }} />
                      </div>
                    </div>
                  ) : (
                    <EmptyText text="Upload a file to detect encoding from bytes." />
                  )}
                </Panel>

                <Panel title="Encoding Selector" icon={RefreshCw}>
                  <div className="grid gap-2">
                    <SelectField label="Source Encoding" value={sourceEncoding} onChange={setSourceEncoding} options={SOURCE_ENCODINGS} />
                    <SelectField label="Target Encoding" value={targetEncoding} onChange={setTargetEncoding} options={TARGET_ENCODINGS} />
                    <label className="flex min-w-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)]/70 p-2.5 text-sm font-semibold">
                      <input
                        type="checkbox"
                        checked={repairMode === "mojibake"}
                        onChange={(event) => setRepairMode(event.target.checked ? "mojibake" : "none")}
                        className="h-4 w-4 shrink-0 accent-cyan-500"
                      />
                      <span className="min-w-0 break-words">Repair garbled UTF-8 text decoded as ANSI or ISO</span>
                    </label>
                    {garbled && repairMode === "none" && (
                      <p className="break-words rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5 text-xs font-semibold text-amber-600">
                        Garbled text patterns were detected. Enable repair if the preview contains mojibake.
                      </p>
                    )}
                  </div>
                </Panel>
              </div>

              <Panel title="Compare View" icon={FileText}>
                <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                  <PreviewBox
                    title="Original File"
                    text={activeRecord ? previewText(activeRecord.originalText) : ""}
                    previewRef={originalPreviewRef}
                    onScroll={() => syncPreviewScroll(originalPreviewRef, convertedPreviewRef)}
                  />
                  <PreviewBox
                    title="Converted File Encoded Bytes"
                    text={activeRecord ? convertedCompareText : ""}
                    previewRef={convertedPreviewRef}
                    onScroll={() => syncPreviewScroll(convertedPreviewRef, originalPreviewRef)}
                    highlight
                    blocked={Boolean(activeRecord && !activeRecord.canDownload)}
                  />
                </div>
                {activeRecord && (
                  <div className="mt-2 grid gap-2 text-xs font-semibold text-[var(--muted-foreground)] sm:grid-cols-2">
                    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)]/70 p-2.5">
                      <span className="block text-[11px] uppercase">Input bytes</span>
                      <code className="mt-1 block break-words font-mono text-[var(--foreground)] [overflow-wrap:anywhere]">
                        {formatHexPreview(activeRecord.bytes)}
                      </code>
                    </div>
                    <div className="min-w-0 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2.5">
                      <span className="block text-[11px] uppercase text-cyan-600">
                        Converted bytes ({activeRecord.targetEncoding})
                      </span>
                      <code className="mt-1 block break-words font-mono text-[var(--foreground)] [overflow-wrap:anywhere]">
                        {activeRecord.canDownload ? formatHexPreview(activeRecord.outputBytes) : "Conversion blocked to prevent Unicode data loss."}
                      </code>
                    </div>
                  </div>
                )}
                {activeRecord && activeRecord.originalText === activeRecord.convertedText && (
                  <p className="mt-2 break-words rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2.5 text-xs font-semibold text-cyan-600">
                    Text preview is identical because encoding conversion changes the downloaded byte encoding. Use the size, BOM, and validation panels to confirm byte-level output.
                  </p>
                )}
              </Panel>

              <Panel title="Preview Panel" icon={Info}>
                {activeRecord ? (
                  <pre className="max-h-80 min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[var(--border)] bg-[var(--background)]/70 p-3 font-mono text-sm leading-6 [overflow-wrap:anywhere]">
                    {previewText(convertedPreviewText)}
                  </pre>
                ) : (
                  <EmptyText text="Converted content preview appears after upload." />
                )}
              </Panel>
            </div>

            <aside className="min-w-0 space-y-3">
              <Panel title="File Queue" icon={FileArchive}>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {convertedRecords.length ? (
                    convertedRecords.map((record) => (
                      <button
                        key={record.id}
                        onClick={() => setActiveId(record.id)}
                        className={`flex w-full min-w-0 items-center gap-2 rounded-lg border p-2.5 text-left transition ${
                          activeRecord?.id === record.id ? "border-cyan-400 bg-cyan-500/10" : "border-[var(--border)] bg-[var(--background)]/70 hover:border-cyan-400/60"
                        }`}
                      >
                        <FileText className="h-5 w-5 shrink-0 text-cyan-500" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black">{record.name}</span>
                          <span className="block truncate text-xs text-[var(--muted-foreground)]">
                            {record.detected.label} to {record.targetEncoding} · {formatBytes(record.size)}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <EmptyText text="Uploaded files will appear here." />
                  )}
                </div>
              </Panel>

              <Panel title="Validation Panel" icon={ShieldCheck}>
                <div className="space-y-2">
                  {(activeRecord?.validation || [{ type: "info", text: "Waiting for a file." }]).map((message) => (
                    <div
                      key={message.text}
                      className={`flex min-w-0 gap-2 rounded-lg border p-2.5 text-xs font-semibold ${
                        message.type === "error"
                          ? "border-red-400/30 bg-red-500/10 text-red-500"
                          : message.type === "warning"
                            ? "border-amber-400/30 bg-amber-500/10 text-amber-600"
                            : "border-emerald-400/30 bg-emerald-500/10 text-emerald-600"
                      }`}
                    >
                      {message.type === "warning" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Check className="h-4 w-4 shrink-0" />}
                      <span className="min-w-0 break-words">{message.text}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Statistics Panel" icon={Info}>
                {activeRecord ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Metric label="Input Size" value={formatBytes(activeRecord.stats.inputBytes)} />
                    <Metric label="Output Size" value={formatBytes(activeRecord.stats.outputBytes)} />
                    <Metric label="Delta" value={formatBytes(activeRecord.stats.sizeDelta)} />
                    <Metric label="Target" value={activeRecord.targetEncoding} />
                    <Metric label="Lines" value={activeRecord.stats.outputLines} />
                    <Metric label="Chars In" value={activeRecord.stats.inputChars} />
                  </div>
                ) : (
                  <EmptyText text="Real file statistics appear here." />
                )}
              </Panel>

              <Panel title="Copy + Download Area" icon={Download}>
                <div className="grid gap-2">
                  <ActionButton icon={copied ? Check : Clipboard} label="Copy Converted Text" onClick={copyConverted} disabled={!activeRecord || !activeRecord.canDownload} />
                  <ActionButton icon={Download} label="Download Active File" onClick={downloadActive} disabled={!activeRecord || !activeRecord.canDownload} />
                  <ActionButton icon={FileArchive} label="Batch Download All" onClick={downloadBatch} disabled={!convertedRecords.some((record) => record.canDownload)} />
                  <ActionButton icon={Trash2} label="Clear Workspace" onClick={clearWorkspace} disabled={!convertedRecords.length} danger />
                </div>
              </Panel>

              <Panel title="History Section" icon={History}>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {history.length ? (
                    history.map((item) => (
                      <div key={item.id} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)]/70 p-2.5">
                        <p className="truncate text-sm font-black">{item.name}</p>
                        <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                          {item.source} to {item.target} · {formatBytes(item.bytes)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <EmptyText text="Recent conversions are saved locally." />
                  )}
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem(HISTORY_KEY);
                      flash("History cleared.");
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear history
                  </button>
                )}
              </Panel>

              <Panel title="Garbled Text Repair Support" icon={Wand2} compact>
                <p className="break-words text-xs leading-5 text-[var(--muted-foreground)]">
                  Repair mode reinterprets common ANSI/ISO mojibake as UTF-8 and updates preview, validation, copy, and downloads instantly.
                </p>
              </Panel>
            </aside>
          </section>

          <Features />
        </section>
      </div>
    </main>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block truncate text-[11px] font-bold uppercase text-[var(--muted-foreground)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-bold outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
      >
        {options.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PreviewBox({ title, text, highlight = false, blocked = false, previewRef, onScroll }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]/70">
      <div className={`border-b border-[var(--border)] px-3 py-2 text-xs font-black uppercase ${highlight ? "text-cyan-500" : "text-[var(--muted-foreground)]"}`}>
        {title}
      </div>
      <pre
        ref={previewRef}
        onScroll={onScroll}
        className={`h-64 min-w-0 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-sm leading-6 [overflow-wrap:anywhere] ${
          blocked ? "text-red-500" : ""
        }`}
      >
        {text || "Upload a file to preview content."}
      </pre>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)]/70 p-2.5">
      <p className="truncate text-[11px] font-bold uppercase text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 min-w-0 break-words text-sm font-black leading-tight [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, disabled, danger = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${
        danger
          ? "border-red-400/30 text-red-500 hover:bg-red-500/10"
          : "border-[var(--border)] bg-[var(--background)]/70 hover:border-cyan-400 hover:bg-cyan-500/10"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function EmptyText({ text }) {
  return (
    <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)]/60 p-3 text-center text-sm font-semibold text-[var(--muted-foreground)]">
      <span className="break-words [overflow-wrap:anywhere]">{text}</span>
    </div>
  );
}
