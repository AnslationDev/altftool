"use client";

import { useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Code2,
  Download,
  FileText,
  Globe,
  History,
  Loader2,
  Radar,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

const EXAMPLE_APIS = [
  { label: "Petstore", url: "https://petstore3.swagger.io/api/v3/openapi.json" },
  { label: "GitHub API", url: "https://api.github.com" },
  { label: "OpenAI", url: "https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml" },
  { label: "HTTPBin", url: "https://httpbin.org/spec.json" },
];

const FEATURE_CHIPS = [
  { icon: Radar, label: "Smart Detection" },
  { icon: BarChart3, label: "Usage Mapping" },
  { icon: Sparkles, label: "Visual Charts" },
  { icon: History, label: "Scan History" },
  { icon: Download, label: "Export Reports" },
];

const SOURCE_KIND_LABEL = { file: "File", paste: "Pasted", url: "URL" };

export default function InputRow({
  onAddFiles,
  pasteText,
  onPasteChange,
  onLoadPasteSample,
  onScanUrl,
  scanning,
  scanError,
  sources,
  onRemoveSource,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState("");

  const submitUrl = (value) => {
    const target = (value ?? url).trim();
    if (target) onScanUrl(target);
  };

  return (
    <section aria-label="Scan inputs" className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".js,.jsx,.ts,.tsx,.py,.java,.php,.go,.rb,.json,.yaml,.yml,.har,.log,.txt,.sh,.curl,.md"
        className="hidden"
        onChange={(event) => {
          const files = [...(event.target.files || [])];
          if (files.length) onAddFiles(files);
          event.target.value = "";
        }}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upload card */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const files = [...(event.dataTransfer.files || [])];
            if (files.length) onAddFiles(files);
          }}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/10"
              : "border-primary/40 bg-card hover:border-primary/70"
          }`}
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud aria-hidden="true" size={22} />
          </span>
          <h2 className="text-base font-bold text-foreground">Upload Code / File</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Drag &amp; drop your code files here
            <br />
            Supports JS, TS, Python, Java, PHP, Go, cURL, Postman, OpenAPI, Swagger, HAR, logs
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <UploadCloud aria-hidden="true" size={13} /> Upload Files
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              or browse
            </button>
          </div>
        </div>

        {/* Paste card */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Code2 aria-hidden="true" size={17} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">Paste API Spec / OpenAPI</h2>
                <p className="text-xs text-muted-foreground">
                  OpenAPI / Swagger JSON or YAML, logs, or code
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onLoadPasteSample}
              className="shrink-0 text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Sample
            </button>
          </div>
          <label htmlFor="paste-spec" className="sr-only">
            Paste your API spec
          </label>
          <textarea
            id="paste-spec"
            value={pasteText}
            onChange={(event) => onPasteChange(event.target.value)}
            spellCheck={false}
            placeholder="Paste your API spec here…"
            className="min-h-28 flex-1 resize-y rounded-xl border border-border bg-background p-3 font-mono text-xs leading-5 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>

        {/* URL scan card */}
        <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-start gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe aria-hidden="true" size={17} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Scan a Public API</h2>
              <p className="text-xs text-muted-foreground">Fetches the spec from your browser</p>
            </div>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitUrl();
            }}
            className="flex gap-2"
          >
            <label htmlFor="scan-url" className="sr-only">
              Public API spec URL
            </label>
            <input
              id="scan-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://api.example.com/openapi.json"
              className="min-h-10 w-full min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <button
              type="submit"
              disabled={scanning || !url.trim()}
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {scanning ? (
                <Loader2 aria-hidden="true" size={13} className="animate-spin" />
              ) : null}
              {scanning ? "Scanning…" : "Scan API"}
            </button>
          </form>
          {scanError && (
            <p className="mt-2 text-xs font-medium text-danger" role="alert">
              {scanError}
            </p>
          )}
          <p className="mt-3 text-xs font-medium text-muted-foreground">Example:</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {EXAMPLE_APIS.map((example) => (
              <button
                key={example.label}
                type="button"
                disabled={scanning}
                onClick={() => {
                  setUrl(example.url);
                  submitUrl(example.url);
                }}
                className="inline-flex min-h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Globe aria-hidden="true" size={11} /> {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loaded sources */}
      {sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Loaded sources">
          <span className="text-xs font-medium text-muted-foreground">Sources:</span>
          {sources.map((source) => (
            <span
              key={source.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-2.5 pr-1 text-[11px] font-semibold text-foreground"
            >
              <FileText aria-hidden="true" size={11} className="text-primary" />
              <span className="max-w-48 truncate">
                {SOURCE_KIND_LABEL[source.kind]} · {source.name}
              </span>
              <button
                type="button"
                onClick={() => onRemoveSource(source.id)}
                aria-label={`Remove source ${source.name}`}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <X aria-hidden="true" size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Feature chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {FEATURE_CHIPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground"
          >
            <CheckCircle2 aria-hidden="true" size={13} className="text-success" />
            <Icon aria-hidden="true" size={13} className="text-primary" />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
