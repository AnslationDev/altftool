"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  Eraser,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ArrowRight,
  Code2,
  Link2,
  Image as ImageIcon,
  Type,
  AlignLeft,
  Rows3,
} from "lucide-react";
import { convertHtmlToText, SAMPLE_HTML } from "../lib/htmlToText";
import { safeCopyText } from "@/shared/utils/clipboard";

const DEBOUNCE_MS = 300;

const ACTION_BTN =
  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-medium text-(--foreground) transition-colors hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--border) disabled:hover:text-(--foreground)";

function StatChip({ icon: Icon, label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--muted) px-2.5 py-1 text-[11px] font-medium text-(--muted-foreground)">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {value} {label}
    </span>
  );
}

export default function MainSection() {
  const [html, setHtml] = useState("");
  const [debouncedHtml, setDebouncedHtml] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  // Debounce the expensive conversion so it runs after the user pauses typing.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedHtml(html), DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [html]);

  const { text, stats, warnings } = useMemo(() => convertHtmlToText(debouncedHtml), [debouncedHtml]);

  const inputStats = useMemo(() => {
    const trimmed = html.trim();
    return {
      chars: html.length,
      words: trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0,
      lines: html ? html.split("\n").length : 0,
    };
  }, [html]);

  const readFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setHtml(String(reader.result || ""));
    reader.readAsText(file);
  }, []);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = [...(e.dataTransfer?.files || [])].find((f) => /\.(html?|txt)$/i.test(f.name) || f.type === "text/html");
    if (file) readFile(file);
  }

  async function handleCopy() {
    if (!text) return;
    if (await safeCopyText(text)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  function handleDownload() {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "email-plain-text.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-(--background) text-(--foreground)">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:py-8">
        <div className="mb-5 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Email Marketing
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            HTML to Plain-Text{" "}
            <span className="bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">
              Email Converter
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-(--muted-foreground) sm:text-lg">
            Turn any HTML email into the clean plain-text version every multipart send needs — links become
            &quot;Text (URL)&quot;, lists stay lists, tables stay readable, tracking pixels disappear. All in your
            browser.
          </p>
        </div>

        {/* Sticky action bar */}
        <div className="sticky top-0 z-10 -mx-1 mb-4 flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-(--border) bg-(--card)/90 p-2.5 shadow-sm backdrop-blur-xl sm:flex-wrap">
          <button type="button" onClick={() => setHtml(SAMPLE_HTML)} className={ACTION_BTN}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Sample
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={ACTION_BTN}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Upload .html
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".html,.htm,text/html"
            className="hidden"
            onChange={(e) => {
              readFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <span className="mx-1 hidden h-5 w-px bg-(--border) sm:block" aria-hidden="true" />
          <button type="button" onClick={handleCopy} disabled={!text} className={ACTION_BTN}>
            {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy text"}
          </button>
          <button type="button" onClick={handleDownload} disabled={!text} className={ACTION_BTN}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download .txt
          </button>
          <button
            type="button"
            onClick={() => setHtml("")}
            disabled={!html}
            className={`${ACTION_BTN} sm:ml-auto hover:border-danger hover:text-danger`}
          >
            <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="mb-4 space-y-2" role="alert">
            {warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft px-4 py-2.5 text-xs font-medium leading-relaxed text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {w}
              </div>
            ))}
          </div>
        )}

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
          {/* Input panel */}
          <div
            className={`flex flex-col overflow-hidden rounded-2xl border bg-(--card)/80 shadow-lg backdrop-blur-xl transition-colors ${dragging ? "border-(--primary) ring-2 ring-(--primary)/30" : "border-(--card-border)"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex items-center gap-2 border-b border-(--border) px-4 py-2.5">
              <Code2 className="h-4 w-4 text-(--primary)" aria-hidden="true" />
              <span className="text-sm font-semibold text-(--foreground)">HTML input</span>
              <span className="ml-auto text-[11px] text-(--muted-foreground)">{dragging ? "Drop your file…" : "paste, type or drop a .html file"}</span>
            </div>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<html>…paste your email HTML here…</html>"
              spellCheck={false}
              aria-label="HTML input"
              className="min-h-[380px] flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-(--foreground) outline-none placeholder:text-(--input-placeholder)"
            />
            <div className="flex flex-wrap gap-1.5 border-t border-(--border) px-4 py-2.5">
              <StatChip icon={Type} label="chars" value={inputStats.chars} />
              <StatChip icon={AlignLeft} label="words" value={inputStats.words} />
              <StatChip icon={Rows3} label="lines" value={inputStats.lines} />
            </div>
          </div>

          {/* Divider arrow */}
          <div className="hidden items-center lg:flex" aria-hidden="true">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-(--border) bg-(--card) text-(--primary) shadow-sm">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>

          {/* Output panel */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-(--card-border) bg-(--card)/80 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-(--border) px-4 py-2.5">
              <FileText className="h-4 w-4 text-(--primary)" aria-hidden="true" />
              <span className="text-sm font-semibold text-(--foreground)">Plain-text output</span>
              {html !== debouncedHtml && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-(--muted-foreground)">
                  <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-(--primary) border-t-transparent" />
                  converting…
                </span>
              )}
            </div>
            {text ? (
              <textarea
                value={text}
                readOnly
                aria-label="Plain text output"
                className="min-h-[380px] flex-1 resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed text-(--foreground) outline-none"
              />
            ) : (
              <div className="flex min-h-[380px] flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-(--muted-foreground)">
                <FileText className="h-10 w-10 opacity-40" aria-hidden="true" />
                <p className="max-w-xs text-sm">
                  Paste HTML on the left (or hit <span className="font-semibold text-(--foreground)">Sample</span>) and
                  the clean plain-text version appears here instantly.
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 border-t border-(--border) px-4 py-2.5">
              <StatChip icon={Type} label="chars" value={stats.chars} />
              <StatChip icon={AlignLeft} label="words" value={stats.words} />
              <StatChip icon={Rows3} label="lines" value={stats.lines} />
              <StatChip icon={Link2} label="links" value={stats.links} />
              <StatChip icon={ImageIcon} label="images" value={stats.images} />
            </div>
          </div>
        </div>

        {/* Why plain text matters */}
        <div className="mt-8 rounded-2xl border border-(--card-border) bg-(--card)/80 p-6 shadow-lg backdrop-blur-xl">
          <h2 className="mb-2 text-lg font-semibold text-(--foreground)">Why every HTML email needs a plain-text version</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-(--muted-foreground)">
            Properly built campaigns are sent as <strong className="text-(--foreground)/80">multipart/alternative</strong>:
            the HTML part plus a plain-text part. Spam filters distrust HTML-only emails, some clients and screen
            readers prefer the text part, and smartwatches show only it. A clean text version — links written as
            &quot;Text (URL)&quot;, no leftover markup — measurably improves deliverability and accessibility. Most
            ESPs auto-generate a poor one; pasting a hand-checked version from this tool gives you full control.
          </p>
        </div>
      </div>
    </div>
  );
}
