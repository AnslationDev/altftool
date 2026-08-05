/**
 * Quick Preview Slide-over Drawer for ALTFTool Backlink Marketplace
 * 100% Pure Light Theme Design System
 * Location: src/app/altflinking/components/marketplace/QuickPreviewDrawer.jsx
 */

"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  ExternalLink,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  Globe,
  DollarSign,
  Sparkles,
  Send,
} from "lucide-react";
import TrafficSparklineSvg from "../visuals/TrafficSparklineSvg";

import { formatPrice, resolveGuestPostPrice, resolveLinkInsertionPrice } from "../../lib/pricing";
import { trafficTrendPercent } from "../visuals/TrafficSparklineSvg";
export default function QuickPreviewDrawer({ site, onClose, onPlaceOrder }) {
  const [selectedType, setSelectedType] = useState(() =>
    resolveGuestPostPrice(site) !== null ? "GUEST_POST" : "LINK_INSERTION"
  );
  const [targetUrl, setTargetUrl] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [campaignName, setCampaignName] = useState("Main Campaign");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articleContent, setArticleContent] = useState("");
  const [articleDocUrl, setArticleDocUrl] = useState("");

  if (!site) return null;

  const guestPostPrice = resolveGuestPostPrice(site);
  const linkInsertionPrice = resolveLinkInsertionPrice(site);
  const currentPrice = selectedType === "GUEST_POST" ? guestPostPrice : linkInsertionPrice;
  const isFree = currentPrice === 0;
  const trafficTrend = trafficTrendPercent(site.trafficHistory);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetUrl || !anchorText || currentPrice === null) return;
    setIsSubmitting(true);
    try {
      await onPlaceOrder({
        listingId: site.id,
        type: selectedType,
        targetUrl,
        anchorText,
        articleContent,
        articleDocUrl,
        campaignName,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Background Dimming Overlay */}
      <div className="altf-drawer-overlay" onClick={onClose} />

      {/* Slide-over Panel */}
      <div className="altf-drawer space-y-6">

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              {(site.name || site.domain || "TC").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5 leading-tight">
                {site.name || site.domain}
                {site.verified && (
                  <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" title="Verified Publisher" />
                )}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{site.domain}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
            title="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Domain Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Domain Rating</p>
            <p className="text-xl font-black text-indigo-600 font-mono mt-1">DR {site.dr ?? "—"}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">DA {site.da ?? "—"}</p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Organic Traffic</p>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">
              {typeof site.traffic === "number" ? `${(site.traffic / 1000).toFixed(0)}k/mo` : site.traffic || "—"}
            </p>
            {trafficTrend === null ? null : (
                <p className="text-[10px] text-indigo-600 font-mono font-bold mt-0.5">
                  {trafficTrend > 0 ? "+" : ""}
                  {trafficTrend}% Growth
                </p>
              )}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
            <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Turnaround</p>
            <p className="text-xl font-black text-slate-900 font-mono mt-1">{site.tatDays ? `${site.tatDays} Days` : "—"}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Publisher-provided</p>
          </div>
        </div>

        {/* 6-Month Organic Traffic Trend */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              6-Month Organic Traffic Trend
            </span>
          </div>

          {/* SVG Smooth Sparkline */}
          <div className="pt-2">
            <TrafficSparklineSvg trafficHistory={site.trafficHistory} width={400} height={45} />
          </div>
        </div>

        {/* Publisher Guidelines Card */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-600" />
            Editorial &amp; Content Guidelines
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {site.guidelines || "No publisher guidelines have been provided for this listing."}
          </p>
        </div>

        {/* Live Sample Articles */}
        {site.sampleUrls && site.sampleUrls.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-indigo-600" />
              Live Sample Articles
            </h4>
            <div className="space-y-2">
              {site.sampleUrls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 transition group shadow-2xs"
                >
                  <span className="truncate pr-2">{url}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-600 transition" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Order Configuration Form */}
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Configure Backlink Order
            </h3>
            <span className={`rounded-full px-3 py-0.5 text-xs font-black font-mono border ${
              isFree
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-slate-100 text-indigo-600 border-slate-200"
            }`}>
              {formatPrice(currentPrice)}
            </span>
          </div>

          {/* Placement Type Selector Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedType("GUEST_POST")}
              disabled={guestPostPrice === null}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                selectedType === "GUEST_POST"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>Guest Post</span>
              <span className="font-mono opacity-90">({formatPrice(guestPostPrice)})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("LINK_INSERTION")}
              disabled={linkInsertionPrice === null}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                selectedType === "LINK_INSERTION"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>Link Insertion</span>
              <span className="font-mono opacity-90">({formatPrice(linkInsertionPrice)})</span>
            </button>
          </div>

          {/* Target URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Webpage URL *</label>
            <input
              type="url"
              placeholder="https://yourwebsite.com/landing-page"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="altf-input text-xs"
            />
          </div>

          {/* Desired Anchor Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Desired Anchor Text *</label>
            <input
              type="text"
              placeholder="e.g. best productivity software"
              required
              value={anchorText}
              onChange={(e) => setAnchorText(e.target.value)}
              className="altf-input text-xs"
            />
          </div>

          {/* Article Draft Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Content Instructions / Requirements (Optional)</label>
            <textarea
              rows="3"
              placeholder="Paste article topic, guest post guidelines, or specific anchor placement details..."
              value={articleContent}
              onChange={(e) => setArticleContent(e.target.value)}
              className="altf-input text-xs"
            />
          </div>

          {/* Google Doc Link */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Google Doc / Draft Link (Optional)</label>
            <input
              type="url"
              placeholder="https://docs.google.com/document/d/..."
              value={articleDocUrl}
              onChange={(e) => setArticleDocUrl(e.target.value)}
              className="altf-input text-xs"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || currentPrice === null}
            className="altf-btn-primary w-full py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? (
              <span>Submitting Order Request...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>{currentPrice === null ? "Price unavailable" : `Submit Order (${formatPrice(currentPrice)})`}</span>
              </>
            )}
          </button>
        </form>

      </div>
    </>
  );
}
