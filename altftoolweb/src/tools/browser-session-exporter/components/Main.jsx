"use client";

import React, { useState } from "react";
import {
  Share2,
  Copy,
  Download,
  Check,
  Code,
  FileText,
  CornerDownRight,
  Sparkles,
  Link2,
} from "lucide-react";

export default function MainComponent() {
  const [inputText, setInputText] = useState("");
  const [exportFormat, setExportFormat] = useState("markdown");
  const [outputText, setOutputText] = useState("");
  const [parsedLinks, setParsedLinks] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSampleSession = () => {
    const sample = `Vercel Platform: https://vercel.com
GitHub Profile: https://github.com/torvalds
NextJS Guide: https://nextjs.org/docs
Google Search: https://google.com`;
    setInputText(sample);
    setError("");
    setSuccess("Sample URL logs loaded into input box.");
  };

  const handleTranspile = () => {
    setError("");
    setSuccess("");
    setOutputText("");
    setParsedLinks([]);

    if (!inputText.trim()) {
      setError("Please paste some browser tabs or URL lists first.");
      return;
    }

    // Match all http/https URLs in the input text
    const urlRegex = /https?:\/\/[^\s"'<>\(\)]+/gi;
    const matches = inputText.match(urlRegex) || [];

    if (matches.length === 0) {
      setError("No valid HTTP or HTTPS links could be found in the pasted content.");
      return;
    }

    const uniqueUrls = Array.from(new Set(matches));

    // Compile nice objects with hostname fallback titles
    const linksList = uniqueUrls.map((url) => {
      let hostname = "Link";
      try {
        hostname = new URL(url).hostname.replace("www.", "");
      } catch (err) {}
      
      // Try to find a custom label near the URL (e.g. "Label: https://...")
      const lines = inputText.split("\n");
      let foundLabel = "";
      for (const line of lines) {
        if (line.includes(url)) {
          const partBefore = line.split(url)[0].trim().replace(/[:\-]+/g, "").trim();
          if (partBefore && partBefore.length < 50) {
            foundLabel = partBefore;
            break;
          }
        }
      }

      return {
        url,
        title: foundLabel || hostname,
        domain: hostname,
      };
    });

    setParsedLinks(linksList);

    // Format output
    if (exportFormat === "markdown") {
      const markdown = linksList
        .map((link) => `- [${link.title}](${link.url})`)
        .join("\n");
      setOutputText(markdown);
    } else if (exportFormat === "html") {
      const html = `<ul>\n${linksList
        .map((link) => `  <li><a href="${link.url}" target="_blank">${link.title}</a></li>`)
        .join("\n")}\n</ul>`;
      setOutputText(html);
    } else if (exportFormat === "json") {
      setOutputText(JSON.stringify(linksList, null, 2));
    }

    setSuccess(`Transpiled ${linksList.length} unique tabs successfully!`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === "markdown" ? "md" : exportFormat === "html" ? "html" : "json";
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `browser-session-${exportFormat}-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Share2 className="h-8 w-8 text-teal-500 shrink-0" /> Browser Session Exporter
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Transpile multi-tab browsing histories or bookmark segments into clean Markdown or HTML index tables.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Input URL Stack */}
      <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-(--border) pb-3">
          <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
            <Code className="h-4.5 w-4.5 text-teal-500" /> Paste Browser Tabs or Bookmarks
          </h3>
          <button
            onClick={loadSampleSession}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer"
          >
            Load Sample Tabs
          </button>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste URLs on separate lines, bookmarks content, or clipboard text logs containing links..."
          className="w-full h-56 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-4 outline-none focus:border-teal-500 font-mono resize-none shadow-inner"
        />
      </div>

      {/* Step 2 & 3: Progressive Settings and Exporter trigger */}
      {inputText.trim() !== "" && (
        <>
          {/* Step 2: Settings */}
          <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-2">
              <CornerDownRight className="h-4.5 w-4.5 text-teal-500" /> Export Options
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setExportFormat("markdown")}
                className={`px-6 py-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  exportFormat === "markdown"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-(--page) text-(--foreground) border-(--border)"
                }`}
              >
                Markdown Links List
              </button>
              <button
                onClick={() => setExportFormat("html")}
                className={`px-6 py-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  exportFormat === "html"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-(--page) text-(--foreground) border-(--border)"
                }`}
              >
                HTML link list (ul/li)
              </button>
              <button
                onClick={() => setExportFormat("json")}
                className={`px-6 py-3 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  exportFormat === "json"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-(--page) text-(--foreground) border-(--border)"
                }`}
              >
                JSON Array Map
              </button>
            </div>
          </div>

          {/* Step 3: Trigger Transpile */}
          <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 text-center shadow-sm flex flex-col items-center justify-center">
            <button
              onClick={handleTranspile}
              className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Share2 className="h-4.5 w-4.5" /> Compile Export Logs
            </button>
          </div>
        </>
      )}

      {/* Step 4: Preview Output & Link tags */}
      {outputText && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Formatted Output text block (7/12 cols) */}
          <div className="lg:col-span-7 bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-(--border) pb-3">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-teal-500" /> Formatted Link Code
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {isCopied ? "Copied" : "Copy Log"}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={outputText}
              className="w-full h-72 bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-4 outline-none font-mono resize-none shadow-inner"
            />
          </div>

          {/* Parsed List details (5/12 cols) */}
          <div className="lg:col-span-5 bg-(--surface) border border-(--border) rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-teal-500" /> Extracted URLs ({parsedLinks.length})
            </h3>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {parsedLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-(--page) border border-(--border) rounded-lg text-xs flex flex-col space-y-1 hover:border-teal-500/35 transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-(--foreground)">
                    <Link2 className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                    <span className="truncate">{link.title}</span>
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline truncate"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
