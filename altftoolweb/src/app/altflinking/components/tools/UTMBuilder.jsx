/**
 * UTM Campaign Link Builder Tool
 * Location: src/app/altflinking/components/tools/UTMBuilder.jsx
 */

"use client";

import React, { useState } from "react";
import { Link2, Copy, Check, Sparkles, RefreshCw } from "lucide-react";

export default function UTMBuilder() {
  const [baseUrl, setBaseUrl] = useState("https://altftool.com");
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("summer_backlink_promo");
  const [term, setTerm] = useState("seo_tools");
  const [content, setContent] = useState("hero_cta");
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: "Google Organic", s: "google", m: "organic", c: "seo" },
    { label: "Facebook Ad", s: "facebook", m: "cpc", c: "retargeting" },
    { label: "Email Newsletter", s: "newsletter", m: "email", c: "weekly_digest" },
    { label: "Guest Post Backlink", s: "techradar_insights", m: "guest_post", c: "q3_campaign" },
  ];

  const applyPreset = (p) => {
    setSource(p.s);
    setMedium(p.m);
    setCampaign(p.c);
  };

  const generateUrl = () => {
    try {
      let clean = baseUrl.trim();
      if (!clean) return "";
      if (!/^https?:\/\//i.test(clean)) {
        clean = `https://${clean}`;
      }
      const url = new URL(clean);
      if (source) url.searchParams.set("utm_source", source.trim());
      if (medium) url.searchParams.set("utm_medium", medium.trim());
      if (campaign) url.searchParams.set("utm_campaign", campaign.trim());
      if (term) url.searchParams.set("utm_term", term.trim());
      if (content) url.searchParams.set("utm_content", content.trim());
      return url.toString();
    } catch {
      return "Invalid Base URL";
    }
  };

  const finalUrl = generateUrl();

  const handleCopy = () => {
    if (finalUrl && finalUrl !== "Invalid Base URL") {
      navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Link2 className="h-5 w-5 text-indigo-400" />
          <span>UTM Campaign Link Builder</span>
        </h2>
        <p className="text-xs text-slate-500">Generate clean, trackable campaign URLs for backlink outreach and ads</p>
      </div>

      {/* Preset Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-600">Quick Campaign Presets:</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="rounded bg-white border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:text-indigo-600 hover:border-indigo-500/50 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Form */}
      <div className="altf-card p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Website Landing URL *</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://yourwebsite.com/page"
            className="altf-input text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Source (utm_source) *</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. google, newsletter, techradar"
              className="altf-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Medium (utm_medium) *</label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="e.g. cpc, guest_post, banner"
              className="altf-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Name (utm_campaign)</label>
            <input
              type="text"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="e.g. summer_sale, q3_outreach"
              className="altf-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Campaign Term / Keyword (utm_term)</label>
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. seo_tools"
              className="altf-input text-xs"
            />
          </div>
        </div>
      </div>

      {/* Generated Output Card */}
      <div className="altf-card p-6 bg-gradient-to-r from-indigo-50 to-white border border-indigo-500/30 space-y-3">
        <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Generated Trackable Link</span>
        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 font-mono text-xs text-emerald-400 overflow-x-auto">
          <span className="truncate">{finalUrl}</span>
          <button
            onClick={handleCopy}
            className="altf-btn-primary py-1.5 px-3 text-xs shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy URL"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
