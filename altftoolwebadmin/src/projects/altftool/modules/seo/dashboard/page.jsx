"use client";

// ALTF Engine — SEO Dashboard (Phase A): page counts by type + aggregate health.

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { fetchRegistrySummary } from "../services/seoService";
import { getErrorMessage } from "@/lib/apiClient";
import SeoNav from "../components/SeoNav";
import { LoadingState } from "@/ansets";
import { 
  Globe, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  RefreshCw,
  CheckCircle2,
  Layers, 
  EyeOff, 
  Link2, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";

const HEALTH_LABELS = {
  missingTitle: "Missing Title",
  missingDescription: "Missing Description",
  missingCanonical: "Missing Canonical",
  missingH1: "Missing H1",
  missingSchema: "Missing Schema",
  noindex: "Noindex Pages",
};

export default function SeoDashboardPage() {
  const params = useParams();
  const project =
    (typeof params?.project === "string" && params.project) || "altftool";
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [copiedPath, setCopiedPath] = useState(null);

  async function load(refresh = false) {
    setStatus("loading");
    setError("");
    try {
      const res = await fetchRegistrySummary(refresh);
      setData(res);
      setStatus("ready");
    } catch (e) {
      setError(getErrorMessage(e));
      setStatus("ready");
    }
  }

  useEffect(() => {
    load(false);
  }, []);

  const summary = data?.summary;
  const attentionList = data?.attention || [];

  // Calculate Health Score
  const healthMetrics = useMemo(() => {
    if (!summary) return { score: 100, healthIssues: 0, percentageIssues: 0 };
    
    // We count: missingTitle, missingDescription, missingCanonical, missingH1, missingSchema
    const criticalIssues = 
      (summary.health.missingTitle ?? 0) + 
      (summary.health.missingDescription ?? 0) + 
      (summary.health.missingCanonical ?? 0) + 
      (summary.health.missingH1 ?? 0) +
      (summary.health.missingSchema ?? 0);
    
    // 5 checks per page
    const totalMaxChecks = summary.total * 5;
    const score = totalMaxChecks > 0 
      ? Math.max(0, 100 - Math.round((criticalIssues / totalMaxChecks) * 100)) 
      : 100;
      
    return {
      score,
      healthIssues: criticalIssues,
      percentageIssues: summary.total > 0 ? Math.round((criticalIssues / totalMaxChecks) * 100) : 0
    };
  }, [summary]);

  // Filtered Attention List
  const filteredAttention = useMemo(() => {
    return attentionList.filter((item) => {
      const matchesSearch = item.path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || item.pageType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [attentionList, searchQuery, typeFilter]);

  // Handle path copy
  const handleCopy = (path) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Filter buttons: only show types that actually appear in the attention list,
  // so every button yields results (no dead "0 results" filters).
  const pageTypes = useMemo(() => {
    const present = new Set(attentionList.map((i) => i.pageType).filter(Boolean));
    return ["all", ...[...present].sort()];
  }, [attentionList]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-slide-in">
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <SeoNav active="dashboard" />
      </div>

      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            SEO Dashboard
          </h1>
          <p className="text-sm text-muted mt-1">
            Site-wide page registry and SEO health compliance overview.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-border bg-card hover:bg-surface-soft text-foreground transition-all duration-200 shadow-sm hover:shadow active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${status === "loading" ? "animate-spin" : ""}`} />
            {status === "loading" ? "Building Registry..." : "Refresh Registry"}
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-danger-soft border border-danger/20 text-danger rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Failed to fetch data</h4>
            <p className="text-sm opacity-90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {summary ? (
        <>
          {/* Top Key Performance Indicator Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Health Score Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">SEO Health Score</span>
                  <div className="text-3xl font-extrabold text-foreground">{healthMetrics.score}%</div>
                </div>
                <div className={`p-2.5 rounded-lg ${
                  healthMetrics.score >= 90 
                    ? "bg-success-soft text-success" 
                    : healthMetrics.score >= 70 
                    ? "bg-warning-soft text-warning" 
                    : "bg-danger-soft text-danger"
                }`}>
                  {healthMetrics.score >= 80 ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>
              </div>
              <div className="mt-4">
                <div className="h-1.5 w-full bg-surface-soft rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      healthMetrics.score >= 90 
                        ? "bg-success" 
                        : healthMetrics.score >= 70 
                        ? "bg-warning" 
                        : "bg-danger"
                    }`}
                    style={{ width: `${healthMetrics.score}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs">
                  <span className="text-muted">Compliance level</span>
                  <span className={`font-semibold ${
                    healthMetrics.score >= 90 
                      ? "text-success" 
                      : healthMetrics.score >= 70 
                      ? "text-warning" 
                      : "text-danger"
                  }`}>
                    {healthMetrics.score >= 90 ? "Excellent" : healthMetrics.score >= 70 ? "Needs Polish" : "Critical Fixes"}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Crawled Pages Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Total Pages</span>
                  <div className="text-3xl font-extrabold text-foreground">{summary.total}</div>
                </div>
                <div className="p-2.5 bg-primary-soft text-primary rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted mt-5">
                Total routes identified across all static and dynamic modules.
              </p>
            </div>

            {/* Noindex Exclusions Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">Noindex Exclusions</span>
                  <div className="text-3xl font-extrabold text-foreground">{summary.health.noindex ?? 0}</div>
                </div>
                <div className="p-2.5 bg-surface-soft text-muted rounded-lg">
                  <EyeOff className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted mt-5">
                Pages explicitly excluded from crawler indexing engines.
              </p>
            </div>

            {/* Critical SEO Issues Card */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">SEO Warnings</span>
                  <div className="text-3xl font-extrabold text-foreground">{healthMetrics.healthIssues}</div>
                </div>
                <div className={`p-2.5 rounded-lg ${healthMetrics.healthIssues > 0 ? "bg-warning-soft text-warning animate-pulse" : "bg-success-soft text-success"}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-muted mt-5">
                Missing basic components like titles, descriptions, canonicals, or H1s.
              </p>
            </div>

          </section>

          {/* Breakdown Section: Types vs Health Checks */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Page Type Distribution Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <Layers className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Page Distribution by Type</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(summary.byType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="capitalize text-foreground">{type}</span>
                          <span className="text-muted">{count} pages ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Health Checklist Breakdown */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <ShieldAlert className="w-4 h-4 text-warning" />
                <h2 className="font-semibold text-foreground">Critical Health Scan Checklist</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(HEALTH_LABELS)
                  .filter(([key]) => key !== "noindex") // exclude noindex as it is not a health issue
                  .map(([key, label]) => {
                    const count = summary.health[key] ?? 0;
                    const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
                    const isPerfect = count === 0;

                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-foreground">{label}</span>
                          <span className={`font-semibold ${isPerfect ? "text-success" : "text-warning"}`}>
                            {isPerfect ? "0 issues (100% OK)" : `${count} pages (${pct}% affected)`}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${isPerfect ? "bg-success" : "bg-warning"}`}
                            style={{ width: isPerfect ? "100%" : `${100 - pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

          </section>

          {/* Attention Pages Section */}
          <section className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            
            {/* Header & Filters */}
            <div className="p-6 border-b border-border bg-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    Pages Needing Attention 
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-warning-soft text-warning">
                      {attentionList.length}
                    </span>
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Priority indexable pages containing missing SEO meta parameters.
                  </p>
                </div>
              </div>

              {/* Dynamic Filters bar */}
              <div className="flex flex-col md:flex-row gap-3 pt-2">
                
                {/* Search query input */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-muted" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by path..."
                    className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-surface text-foreground text-sm placeholder:text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-150"
                  />
                </div>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-muted font-medium mr-1 select-none">Filter type:</span>
                  {pageTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 capitalize cursor-pointer ${
                        typeFilter === type
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-surface text-muted border-border hover:bg-surface-soft hover:text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List Table */}
            {filteredAttention.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-soft text-muted font-semibold text-xs uppercase tracking-wider">
                      <th className="px-6 py-3.5">Type</th>
                      <th className="px-6 py-3.5">Page Path</th>
                      <th className="px-6 py-3.5">Detected SEO Deficiencies</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredAttention.map((item) => (
                      <tr key={item.path} className="hover:bg-surface-soft/60 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-soft text-primary capitalize">
                            {item.pageType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground max-w-sm sm:max-w-md md:max-w-lg truncate" title={item.path}>
                            {item.path}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {item.health.missingTitle && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-danger-soft text-danger border border-danger/10">
                                <AlertTriangle className="w-3 h-3" />
                                No Title
                              </span>
                            )}
                            {item.health.missingDescription && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-warning-soft text-warning border border-warning/10">
                                <AlertCircle className="w-3 h-3" />
                                No Description
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleCopy(item.path)}
                              title="Copy URL path to clipboard"
                              className="p-1.5 rounded-md border border-border bg-card text-muted hover:text-foreground transition-all duration-150 active:scale-95"
                            >
                              {copiedPath === item.path ? (
                                <Check className="w-4 h-4 text-success" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <a
                              href={`/${project}/seo/pages?path=${encodeURIComponent(item.path)}`}
                              title="Edit this page's SEO"
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border border-border bg-card text-primary hover:bg-primary-soft transition-all duration-150 active:scale-95"
                            >
                              Edit SEO
                              <ArrowRight className="w-3 h-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-muted">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-3" />
                <p className="font-semibold text-foreground">No pages match current filters</p>
                <p className="text-xs mt-1">Excellent! All indexable pages within this criteria have titles and descriptions.</p>
              </div>
            )}
          </section>
        </>
      ) : (
        /* Skeleton loaders while registry is building */
        <div className="space-y-6">
          <LoadingState variant="stats" />
          <LoadingState variant="cards" rows={2} />
        </div>
      )}
    </div>
  );
}
