"use client";

import React from "react";
import { Card, Button, StatCard, EmptyState, Alert } from "@altftool/ui";

const calculateA1c = (avgGlucoseMgDl) => {
  // eAG = (28.7 * A1C) - 46.7
  // A1C = (eAG + 46.7) / 28.7
  return ((avgGlucoseMgDl + 46.7) / 28.7).toFixed(1);
};

export default function Dashboard({ logs, profile, onDelete, onGoToLog, onGoToProfile }) {
  if (!profile || !profile.targetMin || !profile.targetMax) {
    return (
      <EmptyState
        title="Setup Required"
        description="Please complete your profile to set your target blood sugar range before viewing the dashboard."
        action={<Button variant="primary" onClick={onGoToProfile}>Setup Profile</Button>}
      />
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        title="No Readings Yet"
        description="Log your first blood sugar reading to see insights."
        action={<Button variant="primary" onClick={onGoToLog}>Log Reading</Button>}
      />
    );
  }

  // Convert everything to mg/dL for calculations
  const readingsMgDl = logs.map(log =>
    log.unit === "mmol/L" ? log.reading * 18 : log.reading
  );

  const avgReading = Math.round(readingsMgDl.reduce((a, b) => a + b, 0) / readingsMgDl.length);
  const highest = Math.max(...readingsMgDl);
  const lowest = Math.min(...readingsMgDl);

  const inRangeCount = readingsMgDl.filter(r => r >= profile.targetMin && r <= profile.targetMax).length;
  const inRangePercentage = Math.round((inRangeCount / readingsMgDl.length) * 100);

  const estimatedA1c = calculateA1c(avgReading);

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Average Reading"
          value={`${avgReading} mg/dL`}
          delta={avgReading > profile.targetMax ? "High" : avgReading < profile.targetMin ? "Low" : "In Target"}
          deltaTone={avgReading >= profile.targetMin && avgReading <= profile.targetMax ? "success" : "danger"}
        />
        <StatCard label="Highest (All time)" value={`${highest} mg/dL`} />
        <StatCard label="Lowest (All time)" value={`${lowest} mg/dL`} />
        <StatCard
          label="Time in Target"
          value={`${inRangePercentage}%`}
          hint={`${inRangeCount} of ${logs.length} readings`}
          delta={inRangePercentage >= 70 ? "Good" : "Needs Work"}
          deltaTone={inRangePercentage >= 70 ? "success" : "warning"}
        />
      </div>

      <Card className="p-6 bg-(--muted) border-(--border)">
        <h3 className="text-xl font-bold mb-2 text-(--foreground)">Estimated HbA1c</h3>
        <div className="flex items-center gap-6">
          <span className="text-5xl font-black text-teal-600">{estimatedA1c}%</span>
          <p className="text-sm text-(--muted-foreground) max-w-sm leading-relaxed">
            This is an approximate estimation based on your logged average glucose of {avgReading} mg/dL.
            <strong> Not a medical diagnosis.</strong> Always rely on clinical laboratory tests ordered by your doctor.
          </p>
        </div>
      </Card>

      {/* History */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-xl font-bold">Recent Readings</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>Print Report</Button>
            <Button variant="outline" size="sm" onClick={() => alert('Exporting to CSV...')}>Export Data</Button>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="mb-8 p-6 bg-(--muted) rounded-lg border border-(--border)">
          <h4 className="text-sm font-semibold text-(--muted-foreground) mb-4">Glucose Trend (Last 7 Readings, mg/dL)</h4>
          <div className="flex items-end justify-between gap-2 h-40">
            {logs.slice(0, 7).reverse().map((log) => {
              const readingVal = log.unit === "mmol/L" ? log.reading * 18 : log.reading;

              // Max scale is ~300 mg/dL for the chart
              const heightPercent = Math.min(100, (readingVal / 300) * 100);
              const isHigh = readingVal > profile.targetMax;
              const isLow = readingVal < profile.targetMin;
              const barColor = isHigh ? "bg-red-500" : isLow ? "bg-yellow-500" : "bg-teal-500";

              return (
                <div key={`chart-${log.id}`} className="w-full flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-(--foreground) text-(--background) text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none z-10">
                    {Math.round(readingVal)}
                  </div>
                  {/* Bar */}
                  <div
                    className={`w-full max-w-[40px] ${barColor} rounded-t-md transition-all duration-500`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  {/* Label */}
                  <span className="text-xs text-(--muted-foreground) mt-2 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                    {log.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--border)">
                <th className="py-3 px-4 font-semibold">Date / Time</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Reading</th>
                <th className="py-3 px-4 font-semibold">Notes</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const readingVal = log.unit === "mmol/L" ? log.reading * 18 : log.reading;
                const isHigh = readingVal > profile.targetMax;
                const isLow = readingVal < profile.targetMin;
                const statusClass = isHigh ? "text-red-500 font-bold" : isLow ? "text-yellow-600 font-bold" : "text-green-600";

                return (
                  <tr key={log.id} className="border-b border-(--border) hover:bg-(--muted) transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{log.date} at {log.time}</td>
                    <td className="py-3 px-4 capitalize">{log.readingType.replace("_", " ")}</td>
                    <td className={`py-3 px-4 ${statusClass}`}>
                      {log.reading} {log.unit}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-(--muted-foreground)">{log.notes || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="danger" size="sm" onClick={() => onDelete(log.id)}>Delete</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
