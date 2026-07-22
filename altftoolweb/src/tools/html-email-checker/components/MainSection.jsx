"use client";

import { useEffect, useMemo, useState } from "react";
import jsBeautify from "js-beautify";
import { FileCode2 } from "lucide-react";
import CodeEditorPanel from "./CodeEditorPanel";
import ResultsPanel from "./ResultsPanel";
import { auditEmailHtml, minifyEmailHtml, SAMPLE_EMAIL_HTML } from "../lib/emailAuditEngine";
import { exportPDF, exportJSON, downloadCleanedHtml, getRecentAnalyses, pushRecentAnalysis, clearRecentAnalyses } from "../lib/exportAndStorage";
import { safeCopyText } from "@/shared/utils/clipboard";

const HISTORY_DEBOUNCE_MS = 1200;

export default function MainSection() {
  const [html, setHtml] = useState("");
  const [recent, setRecent] = useState([]);

  const audit = useMemo(() => auditEmailHtml(html), [html]);

  useEffect(() => {
    setRecent(getRecentAnalyses());
  }, []);

  useEffect(() => {
    if (!html.trim() || html.trim().length < 30) return undefined;
    const handle = window.setTimeout(() => {
      setRecent(pushRecentAnalysis({ html, overallScore: audit.overallScore, grade: audit.grade, sizeKb: audit.stats.sizeKb }));
    }, HISTORY_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [html, audit.overallScore, audit.grade, audit.stats.sizeKb]);

  function handleFormat() {
    setHtml((prev) => jsBeautify.html(prev, { indent_size: 2, wrap_line_length: 0, preserve_newlines: true }));
  }

  function handleMinify() {
    setHtml((prev) => minifyEmailHtml(prev));
  }

  function handleClear() {
    setHtml("");
  }

  function handleSample() {
    setHtml(SAMPLE_EMAIL_HTML);
  }

  function handleCopy() {
    safeCopyText(html);
  }

  function handleDownload() {
    downloadCleanedHtml(html);
  }

  return (
    <div className="bg-(--background) text-(--foreground)">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:py-8">
        <div className="mb-5 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
            <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" /> Email Marketing
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            HTML Email <span className="bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">Checker</span>
          </h1>
          <p className="mt-2 max-w-3xl text-(--muted-foreground) sm:text-lg">
            Paste your email HTML for an instant, rule-based audit — structure, CSS compatibility, accessibility,
            performance, client support and responsive design, all scored live in your browser.
          </p>
        </div>

        <div className="grid h-[80vh] min-h-[560px] grid-cols-1 gap-5 lg:grid-cols-2">
          <CodeEditorPanel
            html={html}
            onChange={setHtml}
            onFormat={handleFormat}
            onMinify={handleMinify}
            onClear={handleClear}
            onSample={handleSample}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
          <ResultsPanel
            audit={audit}
            onExportPdf={() => exportPDF(audit)}
            onExportJson={() => exportJSON(audit)}
            recent={recent}
            onSelectRecent={setHtml}
            onClearRecent={() => setRecent(clearRecentAnalyses())}
          />
        </div>
      </div>
    </div>
  );
}
