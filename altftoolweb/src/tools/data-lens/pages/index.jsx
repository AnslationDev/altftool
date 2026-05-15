import React, { useState, useMemo, useCallback, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import ProfileReport from "../components/ProfileReport";
import FilterPanel from "../components/FilterPanel";
import Dashboard from "../components/Dashboard";
import CleanPanel from "../components/CleanPanel";
import { useDataInsights } from "../hooks/useDataInsights";
import { filterData } from "../utils/dataTransform";
import { filtersToCondition } from "../utils/filterUtils";
import { profileData } from "../utils/profileData";

const glassStyles = `
  :root {
    --glass-bg: linear-gradient(135deg, rgba(219, 234, 254, 0.55), rgba(248, 250, 255, 0.6));
    --glass-shadow: 0 6px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04);
    --glass-shadow-hover: 0 12px 30px rgba(59,130,246,0.10), 0 0 0 1px rgba(59,130,246,0.15), 0 6px 20px rgba(0,0,0,0.08);
    --glass-inner-bg: rgba(255, 255, 255, 0.7);
    --glass-inner-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  [data-theme="dark"] {
    --glass-bg: linear-gradient(135deg, rgba(30, 58, 138, 0.3), rgba(15, 23, 42, 0.5));
    --glass-shadow: 0 6px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
    --glass-shadow-hover: 0 12px 30px rgba(59,130,246,0.18), 0 0 0 1px rgba(59,130,246,0.25), 0 6px 20px rgba(0,0,0,0.35);
    --glass-inner-bg: rgba(30, 41, 59, 0.65);
    --glass-inner-shadow: 0 4px 14px rgba(0,0,0,0.3);
  }

  .glass-card {
    background: var(--glass-bg);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-radius: 1rem;
    box-shadow: var(--glass-shadow);
    border: none;
    transform: translateY(0) scale(1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .glass-card:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: var(--glass-shadow-hover);
  }

  .glass-card-inner {
    background: var(--glass-inner-bg);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    border-radius: 0.75rem;
    box-shadow: var(--glass-inner-shadow);
    border: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .glass-card-inner:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  }

  .subheading {
    color: var(--primary);
  }
`;

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center mt-16 text-center">
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6">
      <rect x="3" y="12" width="4" height="9" rx="0.5" />
      <rect x="10" y="7" width="4" height="14" rx="0.5" />
      <rect x="17" y="3" width="4" height="18" rx="0.5" />
      <line x1="1" y1="21" x2="23" y2="21" />
    </svg>
    <h3 className="text-lg font-semibold text-[var(--foreground)] mt-4">Welcome to DataLens</h3>
    <p className="text-sm text-[var(--muted-foreground)] max-w-xs mt-2">
      Upload a CSV to get a full profiling report, clean the data, or build visualisations.
    </p>
  </div>
);

const ToolHome = () => {
  const [data, setData] = useState([]);
  const [typeOverrides, setTypeOverrides] = useState({});
  const { types, autoTypes } = useDataInsights(data, typeOverrides);
  const columns = data.length ? Object.keys(data[0]) : [];
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const [profilingResult, setProfilingResult] = useState(null);

  // ---- single "analyzing" state, controlled by ToolHome ----
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = glassStyles;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  // called when user clicks Analyse (start spinner)
  const handleAnalysisStart = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  // called when analysis finishes or is cleared
  const handleAnalysisEnd = useCallback(() => {
    setIsAnalyzing(false);
  }, []);

  const handleProfileReady = useCallback((profile) => {
    if (profile) setProfilingResult(profile);
    else setProfilingResult(null);
    handleAnalysisEnd();       // spinner off
  }, [handleAnalysisEnd]);

  const handleDataParsed = useCallback((parsed) => {
    setData(parsed);
    setTypeOverrides({});
    setFilters({});
    // keep spinner running – profile not ready yet
  }, []);

  const handleDataCleaned = useCallback((cleanedData) => {
    setData(cleanedData);
    setTypeOverrides({});
    setFilters({});
    if (cleanedData.length && Object.keys(types).length) {
      const cleanedProfile = profileData(cleanedData, types);
      setProfilingResult(cleanedProfile);
    } else {
      setProfilingResult(null);
    }
  }, [types]);

  const filteredData = useMemo(() => {
    if (!data.length) return [];
    const cond = filtersToCondition(filters);
    return Object.keys(cond).length ? filterData(data, cond) : data;
  }, [data, filters]);

  const handleTypeChange = useCallback((col, newType) => {
    setTypeOverrides(prev => {
      const updated = { ...prev, [col]: newType };
      setTimeout(() => {
        const newTypes = { ...autoTypes, ...updated };
        if (data.length) setProfilingResult(profileData(data, newTypes));
      }, 0);
      return updated;
    });
    setFilters(prev => { if (!prev[col]) return prev; const n = {...prev}; delete n[col]; return n; });
  }, [autoTypes, data]);

  const handleTypeReset = useCallback((col) => {
    setTypeOverrides(prev => {
      const updated = { ...prev };
      delete updated[col];
      setTimeout(() => {
        const newTypes = { ...autoTypes, ...updated };
        if (data.length) setProfilingResult(profileData(data, newTypes));
      }, 0);
      return updated;
    });
    setFilters(prev => { if (!prev[col]) return prev; const n = {...prev}; delete n[col]; return n; });
  }, [autoTypes, data]);

  const cleanIssues = useMemo(() => {
    if (!profilingResult) return [];
    const issues = [];
    if (profilingResult.totalMissing > 0) {
      const missingCols = Object.entries(profilingResult.columns)
        .filter(([,c]) => c.nullCount > 0)
        .map(([name,c]) => `${name} (${c.nullCount})`);
      if (missingCols.length) issues.push(`Missing values in: ${missingCols.join(', ')}.`);
    }
    if (profilingResult.duplicateCount > 0) issues.push(`${profilingResult.duplicateCount} duplicate row(s) found.`);
    return issues;
  }, [profilingResult]);
  const hasDataIssues = profilingResult && (profilingResult.totalMissing > 0 || profilingResult.duplicateCount > 0);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-[1280px] mb-6 text-center">
        <h1 className="heading">DataLens</h1>
        <p className="description mt-2">Smart CSV Analyser – Profile, Clean, Visualise</p>
      </header>

      <FileUpload
        onDataParsed={handleDataParsed}
        onProfileReady={handleProfileReady}
        analyzing={isAnalyzing}
        onAnalysisStart={handleAnalysisStart}
        onAnalysisEnd={handleAnalysisEnd}
      />

      {!data.length && !isAnalyzing && <EmptyState />}

      {data.length > 0 && (
        <div className="w-full max-w-[1280px] mt-8 space-y-6">
          <div className="flex border-b border-[var(--border)] gap-2">
            <button onClick={() => setActiveTab("profile")} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab==="profile"?"border-b-2 border-[var(--primary)] text-[var(--primary)]":"text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>Profile</button>
            <button onClick={() => setActiveTab("clean")}   className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab==="clean"  ?"border-b-2 border-[var(--primary)] text-[var(--primary)]":"text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>Clean</button>
            <button onClick={() => setActiveTab("builder")} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab==="builder"?"border-b-2 border-[var(--primary)] text-[var(--primary)]":"text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}>Visual Builder</button>
          </div>

          {activeTab === "profile" && (
            <ProfileReport
              data={data}
              columnTypes={types}
              autoTypes={autoTypes}
              analysis={profilingResult}
              onTypeChange={handleTypeChange}
              onTypeReset={handleTypeReset}
              isLoading={isAnalyzing || !profilingResult}
            />
          )}

          {activeTab === "clean" && (
            <div className="space-y-4">
              <div className="glass-card p-6">
                <h2 className="subheading mb-3">Data Cleaning</h2>
                {hasDataIssues ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-amber-600 dark:text-amber-400"><span className="text-2xl">⚠️</span><span>Your dataset has issues that can be cleaned.</span></div>
                    <ul className="ml-8 text-sm text-[var(--foreground)] list-disc space-y-1">{cleanIssues.map((issue,idx)=><li key={idx}>{issue}</li>)}</ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-400"><span className="text-2xl">✅</span><span>No missing values or duplicate rows detected. Your data looks clean!</span></div>
                )}
              </div>
              <CleanPanel data={data} columnTypes={types} analysis={profilingResult} onDataCleaned={handleDataCleaned} />
            </div>
          )}

          {activeTab === "builder" && (
            <>
              <FilterPanel data={data} columns={columns} columnTypes={types} filters={filters} onChange={setFilters} />
              <Dashboard data={filteredData} columns={columns} columnTypes={types} filters={filters} profiling={profilingResult} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolHome;