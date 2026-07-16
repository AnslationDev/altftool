"use client";
import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Sparkles, Database } from "lucide-react";

function useCssVar(name) {
  const [value, setValue] = useState("#14b8a6");
  useEffect(() => {
    const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (val) setValue(val);
  }, [name]);
  return value;
}

export default function StatsPanel({ totalSize, duplicateSize, formatCounts }) {
  const primaryColor = useCssVar("--primary");
  const dangerColor = useCssVar("--anslation-ds-danger");
  const secondaryColor = useCssVar("--secondary");
  const infoColor = useCssVar("--anslation-ds-info");
  const successColor = useCssVar("--anslation-ds-success");
  const warningColor = useCssVar("--anslation-ds-warning");

  const formatKB = (bytes) => {
    if (!bytes) return "0 KB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  const chartData = [
    { name: "Total Loaded", size: Math.round(totalSize / 1024) },
    { name: "Wasted Space", size: Math.round(duplicateSize / 1024) },
  ];

  const pieData = Object.keys(formatCounts).map((key) => ({
    name: key.toUpperCase(),
    value: formatCounts[key],
  }));

  const COLORS = [
    primaryColor,
    secondaryColor,
    infoColor,
    dangerColor,
    warningColor,
  ];

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            Storage Usage (KB)
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="size" fill={primaryColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border-t border-border/60 pt-4 mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Cleanable Duplicates:</span>
          <span className="font-black text-rose-500">{formatKB(duplicateSize)}</span>
        </div>
      </div>

      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            File Formats
          </h4>
          <div className="h-48 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" fontSize={9} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                No format data available.
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-border/60 pt-4 mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Unique formats:</span>
          <span className="font-black text-foreground">{pieData.length} detected</span>
        </div>
      </div>
    </div>
  );
}
