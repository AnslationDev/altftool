"use client";

import React from "react";
import { Card, Button, StatCard, EmptyState, Badge } from "@altftool/ui";

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

export default function SleepDashboard({ logs, onDelete, onGoToLog }) {
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

  const targetSleepMins = latestLog.sleepGoal * 60;
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
            <Button variant="outline" size="sm" onClick={() => alert('Exporting to CSV...')}>Export Data</Button>
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
