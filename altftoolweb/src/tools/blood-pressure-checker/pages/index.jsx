"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { 
  HeartPulse, 
  Activity, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  Clock, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function ToolHome() {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [error, setError] = useState("");
  const [readings, setReadings] = useState([
    { time: "09:00 AM", systolic: 120, diastolic: 80, date: "Today" },
    { time: "12:30 PM", systolic: 118, diastolic: 78, date: "Today" }
  ]);

  const getStatus = (s, d) => {
    if (s < 120 && d < 80) return "normal";
    if (s < 130 && d < 80) return "elevated";
    if (s < 140 || d < 90) return "stage1";
    return "stage2";
  };

  const getStatusLabel = (s, d) => {
    if (s < 120 && d < 80) return "Normal";
    if (s < 130 && d < 80) return "Elevated";
    if (s < 140 || d < 90) return "Stage 1 Hypertension";
    return "Stage 2 Hypertension";
  };

  const getStatusColorClass = (s, d) => {
    const status = getStatus(s, d);
    switch (status) {
      case "normal":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-800";
      case "elevated":
        return "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800";
      case "stage1":
        return "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-800";
      case "stage2":
      default:
        return "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-800";
    }
  };

  const handleAddReading = (e) => {
    e.preventDefault();
    setError("");

    if (!systolic || !diastolic) {
      setError("Please enter both readings");
      return;
    }

    const sys = Number(systolic);
    const dia = Number(diastolic);

    if (isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) {
      setError("Please enter valid positive numbers");
      return;
    }

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    setReadings([
      ...readings,
      { time, systolic: sys, diastolic: dia, date: "Today" }
    ]);

    setSystolic("");
    setDiastolic("");
  };

  const handleClearHistory = () => {
    setReadings([]);
  };

  const chartData = {
    labels: readings.map(r => r.time),
    datasets: [
      {
        label: "Systolic (mmHg)",
        data: readings.map(r => r.systolic),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4
      },
      {
        label: "Diastolic (mmHg)",
        data: readings.map(r => r.diastolic),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--foreground)',
          font: { weight: 'bold' }
        }
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "var(--muted)" }
      },
      y: {
        grid: { color: "rgba(0,0,0,0.05)" },
        ticks: { color: "var(--muted)" }
      }
    }
  };

  const last = readings[readings.length - 1];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <HeartPulse className="h-5 w-5 text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Blood Pressure Checker
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Health & Fitness
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Track and monitor your systolic and diastolic blood pressure readings. Log history, visualize trends, and check clinical categories.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["100% Client-Side", "Secure & Private", "Interactive Trends"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Form & Last Status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                <Activity size={14} className="text-primary" />
                New Reading
              </h2>

              <form onSubmit={handleAddReading} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Systolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                    Diastolic (mmHg)
                  </label>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="e.g. 80"
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-2.5 rounded-xl text-xs font-semibold leading-relaxed">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:brightness-110 transition cursor-pointer"
                >
                  <Plus size={14} /> Add Measurement
                </button>
              </form>

              {last && (
                <div className={`mt-4 p-4 rounded-xl border border-l-4 shadow-sm transition-all ${getStatusColorClass(last.systolic, last.diastolic)}`}>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">Latest Status</p>
                    <p className="font-extrabold text-sm">
                      {getStatusLabel(last.systolic, last.diastolic)}
                    </p>
                    <div className="text-2xl font-black mt-1">
                      {last.systolic}/{last.diastolic} <span className="text-xs font-normal">mmHg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Readings History List */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} className="text-primary" />
                  Readings History
                </h2>
                {readings.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {readings.length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                    No readings recorded yet.
                  </div>
                ) : (
                  readings.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-soft border border-border text-xs leading-relaxed"
                    >
                      <div>
                        <div className="font-mono font-bold text-foreground">{r.time}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold">{r.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-foreground bg-card border border-border px-2.5 py-1 rounded-lg">
                          {r.systolic}/{r.diastolic} <span className="text-[10px] text-muted-foreground font-normal">mmHg</span>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Chart & Visuals */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-primary" />
                Measurement Trends
              </h2>
              <div className="h-[300px] w-full relative">
                {readings.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-semibold">
                    Enter readings to plot trend charts.
                  </div>
                ) : (
                  <Line data={chartData} options={chartOptions} />
                )}
              </div>
            </div>
            
            {/* Informational Tip Card */}
            <div className="bg-surface-soft border border-border/80 p-4 rounded-xl text-xs text-muted-foreground leading-relaxed font-semibold">
              💡 **Health Reminder:** Sit quietly for 5 minutes before taking blood pressure. Do not talk, drink caffeine, or exercise within 30 minutes of taking a reading.
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
