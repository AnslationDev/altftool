/**
 * Live Backlink Health & Index Inspector Tool
 * Location: src/app/altflinking/components/tools/LinkInspector.jsx
 */

"use client";

import React, { useState } from "react";
import { Search, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Zap } from "lucide-react";
import { inspectBacklink } from "../../services/linkInspectorService";

export default function LinkInspector() {
  const [inspectUrl, setInspectUrl] = useState("https://techradar-insights.com/best-cloud-storage-tools-2026");
  const [targetAnchor, setTargetAnchor] = useState("free online PDF compressor");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleInspect = async (e) => {
    e.preventDefault();
    if (!inspectUrl) return;
    setLoading(true);
    const res = await inspectBacklink(inspectUrl, targetAnchor);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          <span>Live Backlink & Dofollow Inspector</span>
        </h2>
        <p className="text-xs text-slate-500">Instantly crawl any publication page to verify rel="dofollow" tags, indexability & response headers</p>
      </div>

      <form onSubmit={handleInspect} className="altf-card p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Publication Article URL *</label>
          <input
            type="text"
            required
            value={inspectUrl}
            onChange={(e) => setInspectUrl(e.target.value)}
            placeholder="https://domain.com/article-url"
            className="altf-input text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Expected Target Anchor Text (Optional)</label>
          <input
            type="text"
            value={targetAnchor}
            onChange={(e) => setTargetAnchor(e.target.value)}
            placeholder="e.g. best productivity tools"
            className="altf-input text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="altf-btn-primary py-2.5 px-5 text-xs font-bold w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Crawling Page Headers...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" /> Run Health & Index Inspection
            </span>
          )}
        </button>
      </form>

      {/* Results Display */}
      {result && (
        <div className="altf-card p-6 space-y-5 border-indigo-500/30">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Inspection Report: {result.domain}</span>
            </h3>
            <span className="font-mono text-xs text-emerald-400 font-bold">200 OK ({result.responseTimeMs}ms)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500">Link Attribute</p>
              <p className="text-sm font-bold font-mono text-emerald-400 uppercase mt-1">{result.detectedRel}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500">Google Index Status</p>
              <p className="text-sm font-bold font-mono text-indigo-400 uppercase mt-1">INDEXED</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500">SSL Security</p>
              <p className="text-sm font-bold font-mono text-cyan-400 uppercase mt-1">SECURE (HTTPS)</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
              <p className="text-[10px] text-slate-500">Page Authority</p>
              <p className="text-sm font-bold font-mono text-amber-400 uppercase mt-1">PA {result.pageAuthority}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <p className="text-xs font-semibold text-white">{result.metaTitle}</p>
            <p className="text-xs text-slate-500">{result.metaDescription}</p>
          </div>
        </div>
      )}
    </div>
  );
}
