"use client";

// Activity-over-time area chart for the analytics view. recharts, themed with
// design tokens (light + dark). Loaded via next/dynamic from the analytics panel.
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

function fmtDay(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs shadow-[var(--shadow-md)]">
      <p className="font-bold text-[var(--foreground)]">{fmtDay(label)}</p>
      <p className="mt-0.5 text-[var(--muted)]">
        Activity: <span className="font-semibold text-[var(--foreground)]">{payload[0].value}</span>
      </p>
    </div>
  );
}

export default function GrowthChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="wsGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date" tickFormatter={fmtDay} interval="preserveStartEnd" minTickGap={28}
          tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} allowDecimals={false} width={30} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#wsGrowth)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
