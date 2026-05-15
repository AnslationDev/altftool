import React from "react";
import DataPreview from "./DataPreview";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["var(--primary)", "#06b6d4", "#f59e0b", "#ef4444", "#8b5cf6", "#10b981"];

const MiniHistogram = ({ data }) => (
  <div className="w-full h-24">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <Bar dataKey="count" fill="var(--primary)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const FrequencyBar = ({ data }) => (
  <div className="w-full h-32">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
        <XAxis type="number" hide />
        <YAxis dataKey="value" type="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={60} />
        <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const CorrelationHeatmap = ({ correlations, columns }) => {
  if (!correlations?.length) return null;
  const numericCols = columns.filter(c => correlations.some(cor => cor.colA === c || cor.colB === c));
  const getColor = (r) => {
    if (r === null || isNaN(r)) return "transparent";
    const intensity = Math.min(Math.abs(r), 1);
    if (r > 0) return `rgba(37, 99, 235, ${intensity * 0.6})`;
    if (r < 0) return `rgba(239, 68, 68, ${intensity * 0.6})`;
    return "transparent";
  };
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr>
            <th className="px-2 py-1"></th>
            {numericCols.map(c => <th key={c} className="px-2 py-1 text-[var(--foreground)] font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {numericCols.map(colA => (
            <tr key={colA}>
              <td className="px-2 py-1 font-medium text-[var(--foreground)]">{colA}</td>
              {numericCols.map(colB => {
                if (colA === colB) return <td key={colB} className="px-2 py-1 text-center text-[var(--muted-foreground)]">1.00</td>;
                const corr = correlations.find(c => (c.colA === colA && c.colB === colB) || (c.colA === colB && c.colB === colA));
                const value = corr ? corr.correlation.toFixed(2) : null;
                const display = value !== null ? value : "−";
                const bg = getColor(value);
                return (
                  <td key={colB} className="px-2 py-1 text-center rounded" style={{
                    backgroundColor: bg,
                    color: bg === "transparent" ? "var(--muted-foreground)" : (Math.abs(value) > 0.5 ? "white" : "var(--foreground)"),
                    fontWeight: value && Math.abs(value) > 0.7 ? "600" : "normal",
                  }}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Skeleton block (animated pulse) ─── */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-[var(--muted)] rounded ${className}`} />
);

const ProfileReport = ({ data, columnTypes, autoTypes, analysis, onTypeChange, onTypeReset, isLoading }) => {
  if (!data.length) return null;

  const completeness = analysis ? ((analysis.totalCells - analysis.totalMissing) / analysis.totalCells) * 100 : 0;
  const uniqueness = analysis ? (100 - (analysis.totalRows > 0 ? (analysis.duplicateCount / analysis.totalRows) * 100 : 0)) : 0;
  const score = analysis ? Math.round((completeness * 0.6) + (uniqueness * 0.3) + ((analysis.warnings?.length === 0 ? 100 : 50) * 0.1)) : 0;

  let scoreColor = "#ef4444";
  let scoreGlow = "rgba(239,68,68,0.3)";
  if (score >= 90) { scoreColor = "#10b981"; scoreGlow = "rgba(16,185,129,0.3)"; }
  else if (score >= 70) { scoreColor = "#f59e0b"; scoreGlow = "rgba(245,158,11,0.3)"; }

  const numericCount = analysis ? Object.values(analysis.columns).filter(c => c.type === 'numeric').length : 0;
  const categoricalCount = analysis ? Object.values(analysis.columns).filter(c => c.type === 'categorical').length : 0;
  const dateCount = analysis ? Object.values(analysis.columns).filter(c => c.type === 'date').length : 0;

  return (
    <div className="space-y-8">
      {/* ─── Dataset Overview ─── */}
      <section className="glass-card p-6">
        <h2 className="subheading mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          Dataset Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div className="glass-card-inner p-3">
            <p className="text-xs text-[var(--muted-foreground)]">Rows</p>
            {isLoading ? <Skeleton className="h-5 w-12 mt-1" /> : <p className="font-semibold text-[var(--foreground)]">{analysis?.totalRows}</p>}
          </div>
          <div className="glass-card-inner p-3">
            <p className="text-xs text-[var(--muted-foreground)]">Columns</p>
            {isLoading ? <Skeleton className="h-5 w-12 mt-1" /> : <p className="font-semibold text-[var(--foreground)]">{analysis?.totalColumns}</p>}
          </div>
          <div className="glass-card-inner p-3">
            <p className="text-xs text-[var(--muted-foreground)]">Missing Cells</p>
            {isLoading ? <Skeleton className="h-5 w-16 mt-1" /> : <p className="font-semibold text-[var(--foreground)]">{analysis?.totalMissing} ({analysis?.missingPercent?.toFixed(1)}%)</p>}
          </div>
          <div className="glass-card-inner p-3">
            <p className="text-xs text-[var(--muted-foreground)]">Duplicate Rows</p>
            {isLoading ? <Skeleton className="h-5 w-12 mt-1" /> : <p className="font-semibold text-[var(--foreground)]">{analysis?.duplicateCount}</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="glass-card-inner p-2 text-center">
            <span className="text-[var(--primary)] font-bold">{isLoading ? <Skeleton className="h-4 w-8 mx-auto" /> : numericCount}</span>
            <span className="text-[var(--muted-foreground)] ml-1">Numeric</span>
          </div>
          <div className="glass-card-inner p-2 text-center">
            <span className="text-[var(--primary)] font-bold">{isLoading ? <Skeleton className="h-4 w-8 mx-auto" /> : categoricalCount}</span>
            <span className="text-[var(--muted-foreground)] ml-1">Categorical</span>
          </div>
          <div className="glass-card-inner p-2 text-center">
            <span className="text-[var(--primary)] font-bold">{isLoading ? <Skeleton className="h-4 w-8 mx-auto" /> : dateCount}</span>
            <span className="text-[var(--muted-foreground)] ml-1">Date</span>
          </div>
        </div>
      </section>

      {/* ─── Data Health ─── */}
      <section className="glass-card p-6">
        <h2 className="subheading mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Data Health
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="flex-shrink-0 relative w-36 h-36 flex items-center justify-center">
            {isLoading ? (
              <Skeleton className="w-32 h-32 rounded-full" />
            ) : (
              <>
                <div className="absolute inset-0 rounded-full glass-score-glow"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), radial-gradient(circle at 70% 70%, ${scoreGlow}, transparent 60%), ${scoreColor}20`,
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: `1px solid ${scoreColor}40`,
                    boxShadow: `0 0 20px ${scoreGlow}, inset 0 0 10px rgba(255,255,255,0.1)`,
                  }}
                />
                <div className="relative text-center">
                  <p className="text-4xl font-bold" style={{ color: scoreColor, textShadow: `0 0 10px ${scoreGlow}` }}>{score}</p>
                  <p className="text-xs font-medium" style={{ color: scoreColor }}>score</p>
                </div>
              </>
            )}
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--foreground)]">Completeness</span>
                {isLoading ? <Skeleton className="h-3 w-12" /> : <span className="text-[var(--muted-foreground)]">{completeness.toFixed(1)}%</span>}
              </div>
              <div className="w-full bg-[var(--muted)] rounded-full h-2">
                {isLoading ? <Skeleton className="h-2 w-3/4" /> : <div className="bg-[var(--primary)] h-2 rounded-full progress-bar" style={{ width: `${completeness}%` }} />}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--foreground)]">Uniqueness</span>
                {isLoading ? <Skeleton className="h-3 w-12" /> : <span className="text-[var(--muted-foreground)]">{uniqueness.toFixed(1)}%</span>}
              </div>
              <div className="w-full bg-[var(--muted)] rounded-full h-2">
                {isLoading ? <Skeleton className="h-2 w-2/3" /> : <div className="bg-[var(--primary)] h-2 rounded-full progress-bar" style={{ width: `${uniqueness}%` }} />}
              </div>
            </div>
          </div>
        </div>
        {analysis?.warnings?.length > 0 && !isLoading && (
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-2">Issues Found</h3>
            <ul className="space-y-1 text-sm text-[var(--foreground)]">
              {analysis.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-[var(--primary)] font-bold mt-0.5">•</span> {w}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ─── Data Preview (always visible) ─── */}
      <DataPreview
        data={data}
        columnTypes={columnTypes}
        autoTypes={autoTypes}
        onTypeChange={onTypeChange}
        onTypeReset={onTypeReset}
      />

      {/* ─── Correlation Matrix ─── */}
      {isLoading ? (
        <section className="glass-card p-6">
          <h2 className="subheading mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="0.5" /><rect x="14" y="3" width="7" height="7" rx="0.5" /><rect x="3" y="14" width="7" height="7" rx="0.5" /><rect x="14" y="14" width="7" height="7" rx="0.5" />
            </svg>
            Correlation Matrix
          </h2>
          <Skeleton className="h-32 w-full" />
        </section>
      ) : (analysis?.correlations?.length > 0 && (
        <section className="glass-card p-6">
          <h2 className="subheading mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="0.5" /><rect x="14" y="3" width="7" height="7" rx="0.5" /><rect x="3" y="14" width="7" height="7" rx="0.5" /><rect x="14" y="14" width="7" height="7" rx="0.5" />
            </svg>
            Correlation Matrix
          </h2>
          <CorrelationHeatmap correlations={analysis.correlations} columns={Object.keys(analysis.columns)} />
        </section>
      ))}

      {/* ─── Column Details ─── */}
      <section className="space-y-4">
        <h2 className="subheading text-[var(--foreground)] flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
          </svg>
          Column Details
        </h2>
        {isLoading ? (
          <div className="glass-card p-5 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          Object.values(analysis.columns).map((col) => (
            <div key={col.column} className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-[var(--foreground)]">{col.column}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted-gray)] text-[var(--muted-foreground)] capitalize">{col.type}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3">
                <p>Missing: <span className="font-medium">{col.nullCount} ({col.nullPercent.toFixed(1)}%)</span></p>
                {col.type === "numeric" && (
                  <>
                    <p>Min: <span className="font-medium">{col.min.toFixed(2)}</span></p>
                    <p>Max: <span className="font-medium">{col.max.toFixed(2)}</span></p>
                    <p>Mean: <span className="font-medium">{col.mean.toFixed(2)}</span></p>
                    <p>Median: <span className="font-medium">{col.median.toFixed(2)}</span></p>
                    <p>Std Dev: <span className="font-medium">{col.stdDev.toFixed(2)}</span></p>
                    <p>Outliers: <span className="font-medium">{col.outliersCount} ({col.outliersPercent.toFixed(1)}%)</span></p>
                  </>
                )}
                {col.type !== "numeric" && (
                  <p>Unique: <span className="font-medium">{col.uniqueCount}</span></p>
                )}
              </div>
              {col.histogram && <MiniHistogram data={col.histogram} />}
              {col.topValues && <FrequencyBar data={col.topValues} />}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default ProfileReport;