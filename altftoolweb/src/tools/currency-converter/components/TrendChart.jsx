"use client";

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
} from "recharts";

export default function TrendChart({
  trendDays,
  setTrendDays,
  trendData,
  trendLoading,
  trendStats,
  fromCurrency,
  toCurrency,
}) {
  return (
    <div className="mt-8 w-full rounded-2xl border border-(--border) bg-(--card) p-4 sm:p-5 lg:p-6 shadow-lg">
      
      {/* Top Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-(--foreground)">
            Rate Trend
          </h3>
          <p className="text-sm text-(--muted-foreground) mt-1">
            {fromCurrency} → {toCurrency} • Last {trendDays} days
          </p>
        </div>

        {/* 7 / 30 / 90 buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {[7, 30, 90].map((day) => (
            <button
              key={day}
              onClick={() => setTrendDays(day)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                trendDays === day
                  ? "bg-(--primary) text-white border-(--primary)"
                  : "bg-(--card) text-(--foreground) border-(--border)"
              }`}
            >
              {day}D
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {trendLoading ? (
        <div className="h-[260px] flex items-center justify-center text-(--muted-foreground)">
          Loading trend...
        </div>
      ) : (
        <>
          {/* Chart */}
          {trendData.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-(--border) bg-(--background) px-4 text-center text-sm text-(--muted-foreground) sm:min-h-[260px] lg:min-h-[300px]">
              Trend data is unavailable right now. Conversion still works with the latest cached rate.
            </div>
          ) : (
          <div className="min-h-[220px] w-full sm:min-h-[260px] lg:min-h-[300px]">
            <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={220}>
              <LineChart data={trendData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })
                  }
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  width={50}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />

                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    color: "var(--foreground)",
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />

                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={false}
                />

                {trendStats?.high && (
                  <ReferenceDot
                    x={trendStats.high.date}
                    y={trendStats.high.rate}
                    r={6}
                    fill="#22c55e"
                    stroke="transparent"
                  />
                )}

                {trendStats?.low && (
                  <ReferenceDot
                    x={trendStats.low.date}
                    y={trendStats.low.rate}
                    r={6}
                    fill="#ef4444"
                    stroke="transparent"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Bottom Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-(--border) p-4 bg-(--background)">
              <p className="text-xs text-(--muted-foreground) mb-1">High</p>
              <p className="text-base font-bold text-green-500">
                {trendStats?.high?.rate?.toFixed(4) ?? "--"}
              </p>
            </div>

            <div className="rounded-xl border border-(--border) p-4 bg-(--background)">
              <p className="text-xs text-(--muted-foreground) mb-1">Low</p>
              <p className="text-base font-bold text-red-500">
                {trendStats?.low?.rate?.toFixed(4) ?? "--"}
              </p>
            </div>

            <div className="rounded-xl border border-(--border) p-4 bg-(--background)">
              <p className="text-xs text-(--muted-foreground) mb-1">
                % Change
              </p>
              <p
                className={`text-base font-bold ${
                  Number(trendStats?.percentChange) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {trendStats?.percentChange ?? "--"}%
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
