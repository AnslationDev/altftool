"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Clipboard,
  Download,
  FileInput,
  FileJson,
  History,
  RotateCcw,
  Trash2,
  Wand2,
} from "lucide-react";
import { ARRAY_STYLES, MODES } from "../utils/conversionEngine";
import { downloadText } from "../utils/fileUtils";
import { usePostmanConverter } from "../hooks/usePostmanConverter";

function MiniStat({ label, value }) {
  return (
    <div className="min-w-[108px] rounded-2xl border border-blue-400/25 bg-blue-400/10 p-3 text-center">
      <p className="text-[11px] font-black uppercase leading-tight text-blue-400">{label}</p>
      <p className="mt-1 break-words text-xl font-black leading-tight [overflow-wrap:anywhere]">{value}</p>
    </div>
  );
}

function ActionButton({ children, onClick, disabled }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="pp-button-secondary disabled:cursor-not-allowed disabled:opacity-50">
      {children}
    </button>
  );
}

function CodeBox({ title, value, copied, onCopy, onDownload, filename }) {
  return (
    <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background)/45 p-4">
      <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
        <h3 className="min-w-0 break-words text-sm font-black">{title}</h3>
        <div className="flex shrink-0 gap-2">
          <button className="pp-icon-button" type="button" title={`Copy ${title}`} disabled={!value} onClick={onCopy}>
            {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Clipboard className="h-4 w-4" />}
          </button>
          <button className="pp-icon-button" type="button" title={`Download ${title}`} disabled={!value} onClick={() => onDownload(filename)}>
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      <pre className="max-h-72 min-h-32 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-(--border) bg-(--card)/80 p-3 text-xs leading-6 [overflow-wrap:anywhere]">
        {value}
      </pre>
    </div>
  );
}

export default function ConverterStudio() {
  const converter = usePostmanConverter();
  const outputName = converter.mode === "params-to-json" || converter.mode === "raw-json" ? "output.json" : "params.txt";
  const headersText = converter.headers.map((header) => `${header.key}: ${header.value}`).join("\n");

  const downloadOutput = (filename) => {
    if (!converter.result.output) return converter.flash("Nothing to download yet.");
    downloadText(converter.result.output, filename, converter.mode.includes("json") ? "application/json;charset=utf-8" : "text/plain;charset=utf-8");
    converter.flash(`${filename} downloaded.`);
  };

  const downloadCurl = (filename) => {
    if (!converter.curl) return converter.flash("Nothing to download yet.");
    downloadText(converter.curl, filename);
    converter.flash(`${filename} downloaded.`);
  };

  return (
    <div className="mx-auto grid max-w-7xl min-w-0 gap-6">
      {converter.notice && (
        <div className="fixed right-4 top-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-teal-400/40 bg-teal-500 px-4 py-3 text-sm font-bold text-white shadow-xl">
          <span className="break-words [overflow-wrap:anywhere]">{converter.notice}</span>
        </div>
      )}

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5">
          <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-black">Live Input Editor</h2>
              <p className="text-sm text-(--muted-foreground)">Input changes validate, parse, convert, and sync the preview instantly.</p>
            </div>
            <label className="pp-button-secondary cursor-pointer">
              <FileInput className="h-4 w-4" />
              Upload
              <input type="file" accept=".json,.txt,.csv" className="sr-only" onChange={(event) => converter.uploadFile(event.target.files?.[0])} />
            </label>
          </div>

          <div className="grid min-w-0 gap-3 2xl:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-bold">Conversion Mode</span>
              <select className="pp-input w-full pr-10" value={converter.mode} onChange={(event) => converter.setMode(event.target.value)}>
                {MODES.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-sm font-bold">Request Endpoint</span>
              <input className="pp-input w-full" value={converter.endpoint} onChange={(event) => converter.setEndpoint(event.target.value)} />
            </label>
          </div>

          <div className="mt-3 grid min-w-0 gap-3 2xl:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-(--border) bg-(--muted)/25 p-3">
              <p className="mb-2 text-xs font-black uppercase text-(--muted-foreground)">Array Handling</p>
              <div className="flex min-w-0 flex-wrap gap-2">
                {ARRAY_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => converter.setArrayStyle(style.id)}
                    className={`pp-chip ${converter.arrayStyle === style.id ? "pp-chip-active" : ""}`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-2 rounded-2xl border border-(--border) bg-(--muted)/25 p-3">
              <ActionButton onClick={converter.beautifyJson}>
                <Wand2 className="h-4 w-4" /> Beautify
              </ActionButton>
              <ActionButton onClick={converter.minifyCurrentJson}>
                <FileJson className="h-4 w-4" /> Minify
              </ActionButton>
              <ActionButton onClick={converter.clearWorkspace} disabled={!converter.input}>
                <Trash2 className="h-4 w-4" /> Clear
              </ActionButton>
              <ActionButton onClick={converter.resetWorkspace}>
                <RotateCcw className="h-4 w-4" /> Reset
              </ActionButton>
            </div>
          </div>

          <textarea
            value={converter.input}
            onChange={(event) => converter.setInput(event.target.value)}
            spellCheck={false}
            className="mt-4 min-h-[420px] w-full min-w-0 resize-y rounded-2xl border border-(--border) bg-(--background)/55 p-4 font-mono text-sm leading-6 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
            placeholder={converter.selectedMode.input === "json" ? "Paste valid JSON..." : "Paste query params or key=value rows..."}
          />

          <div className="mt-3 flex min-w-0 flex-wrap items-center justify-between gap-2">
            <p className={`min-w-0 break-words text-sm font-bold [overflow-wrap:anywhere] ${converter.result.ok ? "text-teal-400" : "text-red-400"}`}>
              {converter.result.ok ? "Valid input. Output is live and synced." : converter.result.error}
            </p>
            <ActionButton onClick={converter.loadSample}>Load Sample</ActionButton>
          </div>
        </div>

        <div className="grid min-w-0 gap-6">
          <div className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5">
            <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-black">Synced Output Preview</h2>
                <p className="text-sm text-(--muted-foreground)">No output is generated when validation fails.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton disabled={!converter.result.ok} onClick={() => converter.copyText("Output", converter.result.output)}>
                  {converter.copied === "Output" ? <Check className="h-4 w-4 text-teal-400" /> : <Clipboard className="h-4 w-4" />} Copy
                </ActionButton>
                <ActionButton disabled={!converter.result.ok} onClick={() => downloadOutput(outputName)}>
                  <Download className="h-4 w-4" /> Download
                </ActionButton>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-[repeat(auto-fit,minmax(108px,1fr))] gap-3">
              <MiniStat label="Input" value={`${converter.stats.inputBytes} B`} />
              <MiniStat label="Output" value={`${converter.stats.outputBytes} B`} />
              <MiniStat label="Keys" value={converter.stats.keyCount} />
              <MiniStat label="Arrays" value={converter.stats.arrayCount} />
              <MiniStat label="Depth" value={converter.stats.nestingDepth} />
            </div>

            <div className="mt-4 min-h-[340px] overflow-auto rounded-2xl border border-(--border) bg-(--background)/45 p-4">
              <AnimatePresence mode="wait">
                {!converter.result.ok ? (
                  <motion.div key="invalid" className="flex min-h-64 flex-col items-center justify-center gap-3 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <AlertCircle className="h-8 w-8 text-red-400" />
                    <p className="text-sm font-bold text-red-400">Waiting for valid input</p>
                    <p className="max-w-sm text-xs text-(--muted-foreground)">{converter.result.error}</p>
                  </motion.div>
                ) : (
                  <motion.pre key={converter.mode} className="whitespace-pre-wrap break-words font-mono text-xs leading-6 [overflow-wrap:anywhere]" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {converter.result.output}
                  </motion.pre>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <CodeBox
              title="Dynamic Headers"
              value={converter.result.ok ? headersText : ""}
              copied={converter.copied === "Headers"}
              onCopy={() => converter.copyText("Headers", headersText)}
              onDownload={(filename) => downloadText(headersText, filename)}
              filename="headers.txt"
            />
            <CodeBox
              title="Dynamic cURL"
              value={converter.curl}
              copied={converter.copied === "cURL"}
              onCopy={() => converter.copyText("cURL", converter.curl)}
              onDownload={downloadCurl}
              filename="curl.txt"
            />
          </div>
        </div>
      </section>

      <section className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5">
        <div className="mb-3 flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <History className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-black">Recent Conversions</h2>
          </div>
          <button className="pp-button-secondary" type="button" disabled={!converter.history.length} onClick={() => converter.setHistory([])}>
            <Trash2 className="h-4 w-4" /> Clear History
          </button>
        </div>
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {converter.history.length ? (
            converter.history.map((item) => (
              <button key={item.id} type="button" onClick={() => { converter.setMode(item.mode); converter.setInput(item.input); }} className="min-w-0 rounded-2xl border border-(--border) bg-(--background)/45 p-4 text-left transition hover:border-blue-400/60">
                <span className="block break-words text-xs font-black uppercase text-blue-400">{item.label}</span>
                <span className="mt-2 block line-clamp-3 break-words text-xs text-(--muted-foreground) [overflow-wrap:anywhere]">{item.output}</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-(--muted-foreground)">Valid live conversions will be saved here automatically.</p>
          )}
        </div>
      </section>
    </div>
  );
}
