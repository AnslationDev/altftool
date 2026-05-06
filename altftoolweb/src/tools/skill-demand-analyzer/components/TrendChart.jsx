"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { LocationList } from './index.js';

const COMPARISON_COLORS = ['#2563eb', '#9333ea', '#f59e0b', '#10b981', '#ef4444'];

const MetricCard = ({ label, value, subtext, valueClass = "text-3xl", truncate }) => (
  <div className={`rounded-[24px] border border-(--border) bg-(--card) p-5 shadow-sm transition-all hover:shadow-md ${truncate ? 'overflow-hidden' : ''}`}>
    <p className="text-[10px] uppercase tracking-[0.2em] text-(--muted-foreground) font-bold">{label}</p>
    <p className={`mt-3 font-bold ${valueClass} ${truncate ? 'truncate' : ''}`}>{value}</p>
    <p className="mt-1 text-xs text-(--muted-foreground) leading-relaxed">{subtext}</p>
  </div>
);

const SectionHeader = ({ label, title, subtitle, badge, labelClass = "text-blue-600" }) => (
  <div className="space-y-3">
    <p className={`text-xs uppercase tracking-[0.28em] font-bold ${labelClass}`}>{label}</p>
    <div className="flex items-center gap-3">
      <h3 className="text-2xl font-bold text-(--foreground)">{title}</h3>
      {badge && (
        <span className="rounded-full bg-blue-600/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600 border border-blue-600/20">
          {badge}
        </span>
      )}
    </div>
    {subtitle && <p className="max-w-2xl text-sm text-(--muted-foreground) leading-relaxed">{subtitle}</p>}
  </div>
);

function TrendTooltip({ active, payload, label, source }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-3xl border border-(--border) bg-(--card) p-4 shadow-xl text-sm text-(--foreground)">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.name}: <strong>{entry.value}</strong></span>
        </div>
      ))}
      <p className="text-xs text-(--muted-foreground)">Source: {source}</p>
    </div>
  );
}

export function TrendChart({
  trendData = [],
  trendStatus,
  averageInterest,
  trendDirection = 'stable',
  percentageChange = 0,
  lastUpdated,
  source = 'Google Trends',
  isComparison,
  skills = [],
  topLocations = [],
}) {
  const { theme } = useTheme();
  const sanitizedData = Array.isArray(trendData)
    ? trendData.map((item) => ({
        date: item?.date || '',
        value: Number.isFinite(Number(item?.value)) ? Number(item.value) : 0,
      }))
    : [];

  const currentPopularity = sanitizedData.length ? sanitizedData[sanitizedData.length - 1].value : 0;
  const directionLabel = trendDirection === 'up' ? 'Increasing' : trendDirection === 'down' ? 'Falling' : 'Stable';
  const directionIcon = trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '→';
  const gridColor = theme === 'dark' ? '#2a2a2e' : '#e5e7eb';
  const textColor = theme === 'dark' ? '#a1a1aa' : '#4b5563';
  const cardBg = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
  const highlightColor = trendDirection === 'up' ? 'text-emerald-500' : trendDirection === 'down' ? 'text-rose-500' : 'text-slate-500';
  const gradientId = 'trendGradient';

  const values = sanitizedData.map((item) => item.value);
  const highestPoint = sanitizedData.reduce(
    (best, item) => {
      if (!best || item.value > best.value) return item;
      return best;
    },
    null,
  );
  const lowestPoint = sanitizedData.reduce(
    (best, item) => {
      if (!best || item.value < best.value) return item;
      return best;
    },
    null,
  );
  const averageScore = values.length ? (values.reduce((sum, num) => sum + num, 0) / values.length).toFixed(1) : '0.0';

  return (
    <div className={`rounded-[32px] border ${theme === 'dark' ? 'border-neutral-800' : 'border-slate-200'} shadow-xl ${cardBg} p-6 relative overflow-hidden`}> 
      <div className="flex flex-col gap-10 xl:flex-row xl:flex-wrap xl:items-start xl:justify-between">
        <SectionHeader 
          label="Google Trends" 
          title="Trend performance overview" 
          badge="Live data"
          subtitle="Visualize the latest Google Trends interest data with smart insights, monthly momentum, and a polished chart presentation."
        />

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 w-full xl:w-full xl:grid-cols-2 2xl:grid-cols-4 min-w-0">
          <MetricCard 
            label="Popularity" 
            value={currentPopularity} 
            subtext="Latest monthly score" 
            valueClass="text-3xl text-(--foreground)"
          />
          <MetricCard 
            label="Change" 
            value={`${directionIcon} ${Math.abs(percentageChange)}%`} 
            subtext={`${directionLabel} vs prior`} 
            valueClass={`text-3xl ${highlightColor}`}
          />
          <MetricCard 
            label="Direction" 
            value={trendDirection ? trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1) : 'Stable'} 
            subtext="Trend orientation" 
            valueClass={`text-2xl ${highlightColor}`}
          />
          <MetricCard 
            label="Updated" 
            value={lastUpdated || 'Today'} 
            subtext={source} 
            valueClass="text-xl sm:text-2xl text-(--foreground)"
            truncate
          />
        </div>
      </div>

      <div className="mt-8 rounded-[32px] border border-(--border) bg-(--card) p-6 shadow-inner">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <SectionHeader 
            label="Interest trend" 
            title="Last 12 months" 
            labelClass="text-(--muted-foreground)"
          />
          <div className="text-sm font-medium text-(--muted-foreground) bg-(--muted)/50 px-3 py-1 rounded-lg">Source: {source}</div>
        </div>

        <div className="mt-5 h-[380px] w-full min-h-[320px] rounded-[28px] bg-gradient-to-br from-slate-50/80 to-white/80 p-4 shadow-sm dark:from-slate-950/70 dark:to-slate-900/70 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <ComposedChart data={sanitizedData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
              {!isComparison && (
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.06} />
                  </linearGradient>
                </defs>
              )}
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 12 }} tickMargin={10} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 12 }} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
              <Tooltip content={<TrendTooltip source={source} />} />
              {!isComparison && <Area type="monotone" dataKey="value" stroke="none" fill={`url(#${gradientId})`} />}
              {!isComparison ? (
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1200} />
              ) : (
                skills.map((skillObj, index) => (
                  <Line
                    key={skillObj.skill || `skill-${index}`}
                    type="monotone"
                    dataKey={skillObj.skill}
                    name={(skillObj.skill || '').toUpperCase()}
                    stroke={COMPARISON_COLORS[index % COMPARISON_COLORS.length]}
                    strokeWidth={3}
                    dot={{ fill: COMPARISON_COLORS[index % COMPARISON_COLORS.length], r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                ))
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Locations shown below the trend chart (kept in normal flow to avoid overlay) */}
      {Array.isArray(topLocations) && topLocations.length > 0 && (
        <div className="mt-6">
          <LocationList topLocations={topLocations} />
        </div>
      )}

      {!isComparison && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <MetricCard 
            label="Highest month" 
            value={highestPoint ? highestPoint.date : 'N/A'} 
            subtext={`Score ${highestPoint ? highestPoint.value : '-'}`}
            valueClass="text-2xl text-(--foreground)"
          />
          <MetricCard 
            label="Lowest month" 
            value={lowestPoint ? lowestPoint.date : 'N/A'} 
            subtext={`Score ${lowestPoint ? lowestPoint.value : '-'}`}
            valueClass="text-2xl text-(--foreground)"
          />
          <MetricCard 
            label="Average score" 
            value={averageScore} 
            subtext="Monthly average interest"
            valueClass="text-4xl text-(--foreground)"
          />
        </div>
      )}
    </div>
  );
}
