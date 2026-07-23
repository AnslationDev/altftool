"use client";

import { useState, useEffect, useRef } from "react";
import {
  Copy, Link as LinkIcon, AlertCircle, CheckCircle2,
  MousePointerClick, Zap, Shield, Mail,
  Search, Share2, Facebook, Instagram, Linkedin, Twitter,
  ArrowRight, Sparkles, BarChart2, ExternalLink, RefreshCcw, Tags
} from "lucide-react";

/* ---------------------------------------------
   Presets
--------------------------------------------- */
const PRESETS = [
  {
    id: "google",
    name: "Google Ads",
    icon: Search,
    color: "text-blue-600",
    activeColor: "text-white",
    bg: "bg-blue-50",
    activeBg: "bg-blue-600",
    border: "border-blue-200",
    activeBorder: "border-blue-600",
    utm_source: "google",
    utm_medium: "cpc",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-700",
    activeColor: "text-white",
    bg: "bg-blue-50",
    activeBg: "bg-blue-700",
    border: "border-blue-200",
    activeBorder: "border-blue-700",
    utm_source: "facebook",
    utm_medium: "cpc",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    activeColor: "text-white",
    bg: "bg-pink-50",
    activeBg: "bg-gradient-to-br from-pink-500 to-purple-600",
    border: "border-pink-200",
    activeBorder: "border-pink-500",
    utm_source: "instagram",
    utm_medium: "social",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-sky-700",
    activeColor: "text-white",
    bg: "bg-sky-50",
    activeBg: "bg-sky-700",
    border: "border-sky-200",
    activeBorder: "border-sky-700",
    utm_source: "linkedin",
    utm_medium: "social",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Twitter,
    color: "text-slate-800",
    activeColor: "text-white",
    bg: "bg-slate-100",
    activeBg: "bg-slate-800",
    border: "border-slate-300",
    activeBorder: "border-slate-800",
    utm_source: "twitter",
    utm_medium: "social",
  },
  {
    id: "email",
    name: "Email Newsletter",
    icon: Mail,
    color: "text-emerald-700",
    activeColor: "text-white",
    bg: "bg-emerald-50",
    activeBg: "bg-emerald-600",
    border: "border-emerald-200",
    activeBorder: "border-emerald-600",
    utm_source: "newsletter",
    utm_medium: "email",
  },
];

const UTM_PARAM_COLORS = {
  utm_source:   { dot: "bg-indigo-500",  key: "text-indigo-600",  val: "text-indigo-800",  badge: "bg-indigo-50 border-indigo-200 text-indigo-700",  label: "source" },
  utm_medium:   { dot: "bg-emerald-500", key: "text-emerald-600", val: "text-emerald-800", badge: "bg-emerald-50 border-emerald-200 text-emerald-700", label: "medium" },
  utm_campaign: { dot: "bg-pink-500",    key: "text-pink-600",    val: "text-pink-800",    badge: "bg-pink-50 border-pink-200 text-pink-700",          label: "campaign" },
  utm_term:     { dot: "bg-amber-500",   key: "text-amber-600",   val: "text-amber-800",   badge: "bg-amber-50 border-amber-200 text-amber-700",       label: "term" },
  utm_content:  { dot: "bg-purple-500",  key: "text-purple-600",  val: "text-purple-800",  badge: "bg-purple-50 border-purple-200 text-purple-700",    label: "content" },
};

/* ---------------------------------------------
   Progress Bar
--------------------------------------------- */
const ProgressBar = ({ params, validateUrl }) => {
  const fields = ["baseUrl", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const filled = fields.filter((f) => {
    if (f === "baseUrl") return params.baseUrl && validateUrl(params.baseUrl);
    return !!params[f];
  }).length;
  const pct = Math.round((filled / fields.length) * 100);
  const color = pct < 40 ? "from-red-400 to-orange-400" : pct < 80 ? "from-amber-400 to-yellow-400" : "from-emerald-500 to-teal-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-black w-10 text-right ${pct === 100 ? "text-emerald-600" : "text-slate-400"}`}>{pct}%</span>
    </div>
  );
};

/* ----------------------------------------
   Main Component
-----------------------------------------*/
const MainComponent = () => {
  const [params, setParams] = useState({
    baseUrl: "",
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_id: "",
    utm_term: "",
    utm_content: "",
  });
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [urlError, setUrlError] = useState("");
  const campaignRef = useRef(null);

  useEffect(() => {
    generateUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const validateUrl = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch { return false; }
  };

  const normalizeValue = (value) =>
    value.trim().replace(/\s+/g, "_").replace(/[^\w-]/g, "");

  const generateUrl = () => {
    if (!params.baseUrl) { setGeneratedUrl(""); setUrlError(""); return; }
    if (!validateUrl(params.baseUrl)) {
      setGeneratedUrl("");
      if (params.baseUrl.length > 3) setUrlError("Add https:// at the start of your URL");
      return;
    }
    setUrlError("");
    try {
      const url = new URL(params.baseUrl);
      const utms = {
        utm_source:   normalizeValue(params.utm_source),
        utm_medium:   normalizeValue(params.utm_medium),
        utm_campaign: normalizeValue(params.utm_campaign),
        utm_id:       normalizeValue(params.utm_id),
        utm_term:     normalizeValue(params.utm_term),
        utm_content:  normalizeValue(params.utm_content),
      };
      Object.entries(utms).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
      setGeneratedUrl(url.toString());
    } catch { setGeneratedUrl(""); }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { alert("Failed to copy URL"); }
  };

  const handleChange = (key, value) => {
    setParams((p) => ({ ...p, [key]: value }));
    if (key === "utm_source" || key === "utm_medium") setActivePreset(null);
  };

  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setParams((p) => ({ ...p, utm_source: preset.utm_source, utm_medium: preset.utm_medium }));
    setTimeout(() => campaignRef.current?.focus(), 50);
  };

  const clearForm = () => {
    setParams({ baseUrl: "", utm_source: "", utm_medium: "", utm_campaign: "", utm_id: "", utm_term: "", utm_content: "" });
    setActivePreset(null);
    setGeneratedUrl("");
  };

  const buildHighlightedUrl = () => {
    if (!generatedUrl) return null;
    const utmOrder = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"];
    const paramParts = utmOrder
      .map((key) => ({ key, val: normalizeValue(params[key] || "") }))
      .filter((p) => p.val);

    return (
      <span className="font-mono text-sm leading-7 break-all">
        <span className="text-slate-800 font-semibold">{params.baseUrl}</span>
        {paramParts.length > 0 && (
          <>
            <span className="text-slate-400">?</span>
            {paramParts.map((p, i) => {
              const c = UTM_PARAM_COLORS[p.key] || { key: "text-slate-500", val: "text-slate-700" };
              return (
                <span key={p.key}>
                  {i > 0 && <span className="text-slate-300">&amp;</span>}
                  <span className={c.key}>{p.key}=</span>
                  <span className={`${c.val} font-bold`}>{p.val}</span>
                </span>
              );
            })}
          </>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">

      {/* ───── Main Card ───── */}
      <div className="mx-auto w-full max-w-6xl my-8 px-4 md:px-6">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden relative">
          {/* Top Gradient Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="p-6 md:p-10">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full mb-4 font-bold tracking-widest text-[10px] uppercase border border-indigo-100">
                  <Tags className="w-3.5 h-3.5" /> Campaign Tracking
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                  UTM Link Builder
                </h1>
                <p className="text-slate-500 text-base md:text-lg max-w-xl leading-relaxed">
                  Build perfect UTM-tagged campaign URLs in seconds. Track traffic across Google Analytics effortlessly.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                {[
                  { icon: Shield, text: "Secure & Private", color: "text-emerald-500" },
                  { icon: Zap, text: "Real-time Preview", color: "text-amber-500" },
                  { icon: BarChart2, text: "GA4 Compatible", color: "text-indigo-500" },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <span className="text-xs font-bold text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Progress Strip ── */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 mb-10">
              <div className="text-xs font-bold text-slate-500 flex items-center gap-2 shrink-0">
                <MousePointerClick className="w-4 h-4 text-indigo-500" /> Completion
              </div>
              <div className="flex-1">
                <ProgressBar params={params} validateUrl={validateUrl} />
              </div>
              <button
                onClick={clearForm}
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-all"
              >
                <RefreshCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* ── Two-column layout ── */}
            <div className="grid lg:grid-cols-[1fr_420px] gap-8 xl:gap-12">

              {/* LEFT: Builder Form */}
              <div className="space-y-8">

                {/* Step 1 – Platform Presets */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 relative overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl opacity-60"></div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-sm shrink-0">1</div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">Choose your traffic source</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Click a platform to auto-fill UTM source & medium</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRESETS.map((preset) => {
                      const Icon = preset.icon;
                      const isActive = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className={`group relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                            isActive
                              ? `${preset.activeBg} ${preset.activeBorder} text-white shadow-md`
                              : `bg-white ${preset.border} hover:${preset.bg}`
                          }`}
                        >
                          {isActive && (
                            <CheckCircle2 className="absolute top-2.5 right-2.5 w-3.5 h-3.5 text-white/80" />
                          )}
                          <div className={`p-2 rounded-xl ${isActive ? "bg-white/20" : preset.bg}`}>
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : preset.color}`} />
                          </div>
                          <span className={`text-xs font-extrabold text-center leading-tight ${isActive ? "text-white" : "text-slate-700"}`}>
                            {preset.name}
                          </span>
                          <span className={`text-[10px] font-semibold ${isActive ? "text-white/70" : "text-slate-400"}`}>
                            {preset.utm_medium}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 – UTM Fields */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 relative overflow-hidden hover:shadow-md transition-shadow">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl opacity-60"></div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-sm shrink-0">2</div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base">Fill campaign details</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Fields marked <span className="text-red-400">*</span> are required</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Base URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Target URL <span className="text-red-400">*</span></label>
                      <div className={`flex rounded-xl border-2 overflow-hidden transition-all focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] ${urlError ? "border-red-400" : "border-slate-200 focus-within:border-indigo-500"}`}>
                        <div className="flex items-center px-4 bg-slate-50 border-r border-slate-200">
                          <LinkIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                          className="flex-1 bg-white py-3 px-4 text-slate-800 font-medium focus:outline-none text-sm"
                          placeholder="https://yourwebsite.com/landing-page"
                          value={params.baseUrl}
                          onChange={(e) => handleChange("baseUrl", e.target.value)}
                        />
                      </div>
                      {urlError && (
                        <p className="text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {urlError}
                        </p>
                      )}
                    </div>

                    {/* Source / Medium */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                          Source <span className="text-red-400">*</span>
                        </label>
                        <input
                          className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)] transition-all"
                          placeholder="google, facebook..."
                          value={params.utm_source}
                          onChange={(e) => handleChange("utm_source", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                          Medium <span className="text-red-400">*</span>
                        </label>
                        <input
                          className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(52,211,153,0.08)] transition-all"
                          placeholder="cpc, email, social..."
                          value={params.utm_medium}
                          onChange={(e) => handleChange("utm_medium", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Campaign */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500 inline-block"></span>
                        Campaign Name <span className="text-slate-400 font-normal normal-case tracking-normal ml-1">(recommended)</span>
                      </label>
                      <input
                        ref={campaignRef}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:border-pink-400 focus:shadow-[0_0_0_4px_rgba(244,114,182,0.08)] transition-all"
                        placeholder="e.g. summer_sale_2026"
                        value={params.utm_campaign}
                        onChange={(e) => handleChange("utm_campaign", e.target.value)}
                      />
                    </div>

                    {/* Optional */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2 list-none select-none mt-2">
                        <span className="group-open:rotate-90 transition-transform inline-block text-lg leading-none">›</span>
                        Optional: Term, Content, Campaign ID
                      </summary>
                      <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                        {[
                          { key: "utm_term", label: "Term", dot: "bg-amber-400", placeholder: "running_shoes", color: "focus:border-amber-400" },
                          { key: "utm_content", label: "Content", dot: "bg-purple-400", placeholder: "header_cta", color: "focus:border-purple-400" },
                        ].map(({ key, label, dot, placeholder, color }) => (
                          <div key={key}>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${dot} inline-block`}></span>{label}
                            </label>
                            <input className={`w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none ${color} transition-all`} placeholder={placeholder} value={params[key]} onChange={(e) => handleChange(key, e.target.value)} />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Campaign ID</label>
                          <input className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-slate-400 transition-all" placeholder="campaign_123" value={params.utm_id} onChange={(e) => handleChange("utm_id", e.target.value)} />
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

              </div>

              {/* RIGHT: Result Panel */}
              <div className="sticky top-6 h-fit">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Panel header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white/20 text-white text-xs font-black flex items-center justify-center border border-white/30">3</div>
                      <div>
                        <h3 className="font-extrabold text-white text-base">Your Tracking Link</h3>
                        <p className="text-xs text-indigo-200 mt-0.5">Copy &amp; use in your campaigns</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {generatedUrl ? (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                        {/* URL Box */}
                        <div className="bg-white rounded-xl border border-slate-200 p-4 min-h-[120px] shadow-sm">
                          <div className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400 mb-3">Preview</div>
                          {buildHighlightedUrl()}
                        </div>

                        {/* UTM Legend */}
                        {Object.entries(UTM_PARAM_COLORS).some(([k]) => normalizeValue(params[k] || "")) && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(UTM_PARAM_COLORS).map(([key, c]) => {
                              const val = normalizeValue(params[key] || "");
                              if (!val) return null;
                              return (
                                <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${c.badge}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
                                  {c.label}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Copy Button */}
                        <button
                          onClick={handleCopy}
                          className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
                            copied
                              ? "bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)]"
                              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.45)] hover:-translate-y-0.5"
                          } transition-transform`}
                        >
                          {copied ? (
                            <><CheckCircle2 className="w-5 h-5" /> Copied to Clipboard!</>
                          ) : (
                            <><Copy className="w-5 h-5" /> Copy Tracking Link</>
                          )}
                        </button>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <a
                            href={generatedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 rounded-xl border-2 border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white hover:bg-indigo-50"
                          >
                            <ExternalLink className="w-4 h-4" /> Open URL
                          </a>
                          <button
                            onClick={clearForm}
                            className="py-2.5 rounded-xl border-2 border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-500 text-xs font-bold flex items-center justify-center gap-2 transition-all bg-white hover:bg-red-50"
                          >
                            <RefreshCcw className="w-4 h-4" /> New Link
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                          <Share2 className="w-7 h-7 text-indigo-400" />
                        </div>
                        <p className="text-slate-700 font-bold text-sm mb-2">Your link will appear here</p>
                        <p className="text-slate-400 text-xs leading-relaxed">Fill in the URL and select a platform or enter UTM parameters manually.</p>
                        <div className="mt-5 flex items-center gap-2 text-indigo-500 text-xs font-bold">
                          <ArrowRight className="w-4 h-4 rotate-180" /> Start with Step 1
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainComponent;
