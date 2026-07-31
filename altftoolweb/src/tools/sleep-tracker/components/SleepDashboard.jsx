"use client";

import React, { useState } from "react";
import { Card, Button, StatCard, EmptyState, Badge, ConfirmModal } from "@altftool/ui";

const parseTime = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const formatMins = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

const getScoreColor = (score) => {
  if (score >= 85) return "success";
  if (score >= 70) return "info";
  if (score >= 60) return "warning";
  return "danger";
};

// Subjective 1-10 rating -> badge tone. Kept separate from the objective
// Sleep Score (duration/efficiency/continuity) so it never silently changes
// the documented scoring formula (see seo.js FAQ).
const getQualityTone = (quality) => {
  const q = Number(quality);
  if (!q) return "neutral";
  if (q >= 8) return "success";
  if (q >= 6) return "info";
  if (q >= 4) return "warning";
  return "danger";
};

const escapeCsvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const CSV_HEADER = [
  "Date", "Bedtime", "Wake Time", "Time in Bed (min)", "Time to Fall Asleep (min)",
  "Night Awakenings", "Minutes Awake", "Nap Duration (min)", "Actual Sleep (min)",
  "Sleep Efficiency (%)", "Sleep Goal (hrs)", "Sleep Quality (1-10)",
  "Caffeine Intake (cups)", "Alcohol Drinks", "Screen Time Before Bed (min)",
  "Stress Level", "Activity Level", "Room Environment",
];

function exportLogsToCsv(logs) {
  if (!logs || logs.length === 0) return;

  const rows = logs.map((log) => {
    let bm = parseTime(log.bedtime);
    let wm = parseTime(log.wakeTime);
    let tib = wm - bm;
    if (tib < 0) tib += 24 * 60;
    const actual = Math.max(0, tib - (Number(log.timeToFallAsleep) || 0) - (Number(log.minutesAwake) || 0));
    const eff = tib > 0 ? Math.round((actual / tib) * 100) : 0;

    return [
      log.date, log.bedtime, log.wakeTime, tib, log.timeToFallAsleep,
      log.nightAwakenings, log.minutesAwake, log.napDuration, actual,
      eff, log.sleepGoal, log.sleepQuality,
      log.caffeineIntake, log.alcoholIntake, log.screenTime,
      log.stressLevel, log.activityLevel, log.roomEnvironment,
    ];
  });

  downloadCsv(`sleep-log_${new Date().toISOString().split("T")[0]}.csv`, [CSV_HEADER, ...rows]);
}

export default function SleepDashboard({ logs, onDelete, onGoToLog }) {
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        title="No Sleep Data"
        description="Log your sleep to see your personalized analysis and dashboard."
        action={<Button variant="primary" onClick={onGoToLog}>Log Sleep Now</Button>}
      />
    );
  }

  // Use the most recent log for primary display
  const latestLog = logs[0];

  let bedMins = parseTime(latestLog.bedtime);
  let wakeMins = parseTime(latestLog.wakeTime);
  let timeInBedMins = wakeMins - bedMins;
  if (timeInBedMins < 0) timeInBedMins += 24 * 60; // Next day

  const actualSleepMins = Math.max(0, timeInBedMins - latestLog.timeToFallAsleep - latestLog.minutesAwake);
  const efficiency = timeInBedMins > 0 ? Math.round((actualSleepMins / timeInBedMins) * 100) : 0;

  // Sleep Goal is optional in the form; a missing/empty/zero value must never
  // reach a division below, or the score renders as a literal "NaN". Fall
  // back to the widely-recommended 8h target (matches the form's own default).
  const targetSleepMins = (Number(latestLog.sleepGoal) || 8) * 60;
  const sleepDebtMins = Math.max(0, targetSleepMins - actualSleepMins);

  // Calculate Score (Max 100)
  // Duration: 50 points (proportional to target)
  const durationScore = Math.min(50, (actualSleepMins / targetSleepMins) * 50);
  // Efficiency: 30 points
  const efficiencyScore = Math.min(30, (efficiency / 100) * 30);
  // Uninterrupted: 20 points (deduct for awakenings)
  const interruptDeduction = Math.min(20, latestLog.nightAwakenings * 4);
  const uninterruptScore = Math.max(0, 20 - interruptDeduction);

  const totalScore = Math.round(durationScore + efficiencyScore + uninterruptScore);
  const scoreTone = getScoreColor(totalScore);

  let scoreLabel = "Poor";
  if (totalScore >= 85) scoreLabel = "Excellent";
  else if (totalScore >= 70) scoreLabel = "Good";
  else if (totalScore >= 60) scoreLabel = "Fair";

  // Recommendations logic
  const recommendations = [];
  if (efficiency < 85) recommendations.push("Your sleep efficiency is low. Try reducing screen time before bed to fall asleep faster.");
  if (latestLog.caffeineIntake > 2) recommendations.push("High caffeine intake can disrupt deep sleep. Consider cutting back in the afternoon.");
  if (sleepDebtMins > 60) recommendations.push(`You have a sleep debt of ${formatMins(sleepDebtMins)}. Try going to bed slightly earlier tonight.`);
  if (latestLog.screenTime > 30) recommendations.push("Avoid screens for at least an hour before bedtime to improve melatonin production.");
  if (latestLog.alcoholIntake > 0) recommendations.push("Alcohol before bed can reduce REM sleep even when total duration looks fine. Try to stop drinking at least 3 hours before bedtime.");
  if (latestLog.stressLevel === "high" || latestLog.stressLevel === "severe") recommendations.push("High stress makes it harder to fall and stay asleep. A short wind-down routine, like breathing exercises or journaling, can help.");
  if (latestLog.roomEnvironment === "noisy_bright") recommendations.push("A noisy or bright room disrupts sleep continuity. Blackout curtains, earplugs or a white-noise machine can improve your environment.");
  if (Number(latestLog.sleepQuality) > 0 && Number(latestLog.sleepQuality) <= 4 && totalScore >= 70) recommendations.push("You rated last night's sleep quality low even though the numbers look decent. Consider factors the score doesn't capture, like stress, room comfort or how you felt on waking.");
  if (recommendations.length === 0) recommendations.push("Great job! Keep up the healthy sleep habits.");

  return (
    <div className="space-y-8">

      {/* Score Section */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-(--muted) rounded-lg border border-(--border)">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h2 className="text-2xl font-bold text-(--foreground) mb-2">Sleep Score</h2>
          <p className="text-(--muted-foreground)">Based on your latest log from {latestLog.date}</p>
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8"
          style={{
            borderColor: scoreTone === "success" ? "#10b981" : scoreTone === "info" ? "#3b82f6" : scoreTone === "warning" ? "#f59e0b" : "#ef4444"
          }}>
          <div className="text-center">
            <span className="text-3xl font-black">{totalScore}</span>
            <span className="block text-sm font-semibold">{scoreLabel}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sleep" value={formatMins(actualSleepMins)} />
        <StatCard label="Time in Bed" value={formatMins(timeInBedMins)} />
        <StatCard label="Sleep Efficiency" value={`${efficiency}%`} hint="Target: >85%" />
        <StatCard label="Sleep Debt" value={formatMins(sleepDebtMins)} delta={sleepDebtMins === 0 ? "Perfect" : ""} deltaTone="success" />
      </div>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Personalized Recommendations</h3>
        <ul className="space-y-3">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-3 text-(--foreground)">
              <span className="text-teal-500 mt-1">✦</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* History */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h3 className="text-xl font-bold">Recent Sleep Logs</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>Print Report</Button>
            <Button variant="outline" size="sm" onClick={() => exportLogsToCsv(logs)}>Export Data</Button>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div className="mb-8 p-6 bg-(--muted) rounded-lg border border-(--border)">
          <h4 className="text-sm font-semibold text-(--muted-foreground) mb-4">Sleep Duration Trend (Last 7 Days)</h4>
          <div className="flex items-end justify-between gap-2 h-40">
            {logs.slice(0, 7).reverse().map((log) => {
              let bm = parseTime(log.bedtime);
              let wm = parseTime(log.wakeTime);
              let tib = wm - bm;
              if (tib < 0) tib += 24 * 60;
              let actual = Math.max(0, tib - log.timeToFallAsleep - log.minutesAwake);

              // Max scale is 12 hours (720 mins)
              const heightPercent = Math.min(100, (actual / 720) * 100);

              return (
                <div key={`chart-${log.id}`} className="w-full flex flex-col items-center group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-(--foreground) text-(--background) text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none">
                    {formatMins(actual)}
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full max-w-[40px] bg-teal-500 rounded-t-md transition-all duration-500"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  {/* Label */}
                  <span className="text-xs text-(--muted-foreground) mt-2 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                    {log.date.slice(5)} {/* MM-DD */}
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
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Bedtime</th>
                <th className="py-3 px-4 font-semibold">Wake Time</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Quality</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                let bm = parseTime(log.bedtime);
                let wm = parseTime(log.wakeTime);
                let tib = wm - bm;
                if (tib < 0) tib += 24 * 60;
                let actual = Math.max(0, tib - log.timeToFallAsleep - log.minutesAwake);

                return (
                  <tr key={log.id} className="border-b border-(--border) hover:bg-(--muted) transition-colors">
                    <td className="py-3 px-4">{log.date}</td>
                    <td className="py-3 px-4">{log.bedtime}</td>
                    <td className="py-3 px-4">{log.wakeTime}</td>
                    <td className="py-3 px-4 font-medium">{formatMins(actual)}</td>
                    <td className="py-3 px-4">
                      <Badge tone={getQualityTone(log.sleepQuality)}>
                        {log.sleepQuality ? `${log.sleepQuality}/10` : "—"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="danger" size="sm" onClick={() => setPendingDeleteId(log.id)}>Delete</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={pendingDeleteId !== null}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        title="Delete sleep log?"
        message="This will permanently remove this log entry from your history. This can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  );
}
