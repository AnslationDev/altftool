"use client";

import { useEffect, useMemo, useState } from "react";
import jsBeautify from "js-beautify";
import { FileCode2 } from "lucide-react";
import CodeEditorPanel from "./CodeEditorPanel";
import ResultsPanel from "./ResultsPanel";
import { auditEmailHtml, minifyEmailHtml, SAMPLE_EMAIL_HTML } from "../lib/emailAuditEngine";
import { exportPDF, exportJSON, downloadCleanedHtml, getRecentAnalyses, pushRecentAnalysis, clearRecentAnalyses } from "../lib/exportAndStorage";
import { safeCopyText } from "@/shared/utils/clipboard";

export default function MainSection() {
  const [html, setHtml] = useState("");
  // `checkedHtml` is the snapshot the audit runs against. It only updates when
  // the user clicks "Check", so typing no longer triggers a live re-analysis.
  const [checkedHtml, setCheckedHtml] = useState("");
  const [recent, setRecent] = useState([]);

  const audit = useMemo(() => auditEmailHtml(checkedHtml), [checkedHtml]);

  // True when the editor has edits that haven't been re-checked yet.
  const dirty = html.trim() !== checkedHtml.trim();

  useEffect(() => {
    setRecent(getRecentAnalyses());
  }, []);

  function handleCheck() {
    if (!html.trim()) return;
    setCheckedHtml(html);
    const result = auditEmailHtml(html);
    if (html.trim().length >= 30) {
      setRecent(pushRecentAnalysis({ html, overallScore: result.overallScore, grade: result.grade, sizeKb: result.stats.sizeKb }));
    }
  }

  function handleFormat() {
    setHtml((prev) => jsBeautify.html(prev, { indent_size: 2, wrap_line_length: 0, preserve_newlines: true }));
  }

  function handleMinify() {
    setHtml((prev) => minifyEmailHtml(prev));
  }

  function handleClear() {
    setHtml("");
    setCheckedHtml("");
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

        <div className="grid grid-cols-1 gap-5 lg:h-[80vh] lg:min-h-[560px] lg:grid-cols-2">
          <CodeEditorPanel
            html={html}
            onChange={setHtml}
            onFormat={handleFormat}
            onMinify={handleMinify}
            onClear={handleClear}
            onSample={handleSample}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onCheck={handleCheck}
            dirty={dirty}
          />
          <ResultsPanel
            audit={audit}
            dirty={dirty && Boolean(checkedHtml)}
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
