"use client";

import React, { useState, useEffect } from "react";
import { Mail, CheckCircle2, Copy, FileDown, Eye, FileText, ListChecks, BarChart3, Globe } from "lucide-react";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export default function ToolHome() {
  const [input, setInput] = useState(
    "Contact us at support@example.com or sales.department@sub.domain.org.\nYou can also reach out to john.doe123@gmail.com or jane_doe@yahoo.com.\nDuplicate email test: support@example.com."
  );
  const [emails, setEmails] = useState([]);
  const [domainCounts, setDomainCounts] = useState({});
  const [deduplicate, setDeduplicate] = useState(true);
  const [sortAlphabetically, setSortAlphabetically] = useState(true);
  const [domainFilter, setDomainFilter] = useState("");
  const [separator, setSeparator] = useState("\n");
  
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!input) {
      setEmails([]);
      setDomainCounts({});
      return;
    }

    // Find all matches
    const matches = input.match(EMAIL_REGEX) || [];
    
    // Clean and filter
    let processed = matches.map(m => m.toLowerCase().trim());

    if (deduplicate) {
      processed = [...new Set(processed)];
    }

    if (domainFilter) {
      const filter = domainFilter.toLowerCase().trim();
      processed = processed.filter(email => email.endsWith(filter));
    }

    if (sortAlphabetically) {
      processed.sort();
    }

    setEmails(processed);

    // Calculate domain frequency
    const counts = {};
    processed.forEach(email => {
      const domain = email.split("@")[1];
      if (domain) {
        counts[domain] = (counts[domain] || 0) + 1;
      }
    });
    setDomainCounts(counts);
  }, [input, deduplicate, sortAlphabetically, domainFilter]);

  const outputText = emails.join(separator);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const textBlob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extracted-emails.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const loadSample = () => {
    setInput(
      `From: admin@company.com\nTo: user.one@gmail.com, user.two@yahoo.com\nCC: billing@company.com, support@company.com\n\nHi team, please contact hello@clientinfo.net for details, or ping sales@company.com if needed.\nNote: duplicate support@company.com is here.`
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Mail className="h-5 w-5 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Email Extractor
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Extract email addresses from blocks of text, HTML code, server log sheets, or databases securely with domain analytics.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Secure"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="w-full space-y-6">
          
          {/* 1. Raw Source Input (Full Width) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                Raw Source Text
              </label>
              <button
                onClick={loadSample}
                className="text-[10px] font-bold text-primary hover:underline px-2 py-0.5 bg-primary/5 rounded"
              >
                Load Sample
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your source text, HTML content, or log dump here..."
              rows={5}
              className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>

          {/* 2. Output & Stats side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Output List and Controls */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks size={14} className="text-primary" />
                    Extracted Emails List
                  </label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={handleCopy}
                      disabled={emails.length === 0}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2 py-1 hover:border-primary transition disabled:opacity-50 shrink-0"
                    >
                      {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={emails.length === 0}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2 py-1 hover:border-primary transition disabled:opacity-50 shrink-0"
                    >
                      {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                      {downloaded ? "Downloaded" : "Download"}
                    </button>
                  </div>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  placeholder="No emails extracted yet..."
                  rows={8}
                  className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none resize-none cursor-text animate-fade-in"
                />
              </div>

              {/* Extraction Filters & Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border">
                
                {/* Domain Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Filter by Domain
                  </label>
                  <input
                    type="text"
                    value={domainFilter}
                    onChange={(e) => setDomainFilter(e.target.value)}
                    placeholder="e.g. gmail.com"
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Separator Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Output Separator
                  </label>
                  <select
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  >
                    <option value="\n">New Line</option>
                    <option value=", ">Comma (,)</option>
                    <option value="; ">Semicolon (;)</option>
                  </select>
                </div>

                {/* Boolean Checks */}
                <div className="flex flex-col justify-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={deduplicate}
                      onChange={(e) => setDeduplicate(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Deduplicate Emails
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sortAlphabetically}
                      onChange={(e) => setSortAlphabetically(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    Sort Alphabetically
                  </label>
                </div>

              </div>

            </div>

            {/* Sidebar Stats Panel */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Stat Total Display */}
              <div className="border-b border-border pb-4">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-primary" />
                  Summary Statistics
                </h2>
                <div className="bg-surface-soft border border-border rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-primary">{emails.length}</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase mt-1">Emails Extracted</div>
                </div>
              </div>

              {/* Domain breakdown */}
              <div>
                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Globe size={14} className="text-primary" />
                  Domain Distribution
                </h3>
                {Object.keys(domainCounts).length === 0 ? (
                  <div className="text-xs text-muted-foreground italic py-2">
                    No domains detected.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {Object.entries(domainCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([domain, count]) => (
                        <div
                          key={domain}
                          className="flex items-center justify-between p-2 rounded-lg bg-surface-soft border border-border/60 text-xs"
                        >
                          <span className="font-mono text-foreground truncate max-w-[120px]">
                            {domain}
                          </span>
                          <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px]">
                            {count}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
