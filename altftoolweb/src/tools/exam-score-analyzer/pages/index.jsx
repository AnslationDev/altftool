"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateStats, getInsights } from "../utils/analyzer-logic";
import MarksInput from "../components/MarksInput";
import StatsDashboard from "../components/StatsDashboard";
import PerformanceCharts from "../components/PerformanceCharts";
import InsightsCard from "../components/InsightsCard";
import ProgressTracker from "../components/ProgressTracker";
import ExportPanel from "../components/ExportPanel";
import Features from "../components/Features";
import confetti from "canvas-confetti";
import { LayoutDashboard, GraduationCap, LineChart, Settings2, Sparkles, RefreshCcw } from "lucide-react";

export default function ToolHome() {
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Mathematics", obtained: 85, total: 100 },
    { id: 2, name: "Science", obtained: 78, total: 100 },
    { id: 3, name: "English", obtained: 92, total: 100 },
  ]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [exams, setExams] = useState([
    { id: 1, type: "Unit Test", percentage: "72.5", grade: "B" },
    { id: 2, type: "Midterm", percentage: "81.2", grade: "A" },
  ]);

  const stats = useMemo(() => calculateStats(subjects), [subjects]);
  const analysis = useMemo(() => (stats ? getInsights(stats, subjects) : null), [stats, subjects]);

  useEffect(() => {
    if (stats && parseFloat(stats.percentage) >= 90) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#a855f7", "#3b82f6"],
      });
    }
  }, [stats?.percentage]);

  const resetData = () => {
    if (confirm("Are you sure you want to reset all data?")) {
      setSubjects([{ id: 1, name: "", obtained: "", total: 100 }]);
    }
  };

  const tabs = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Charts", icon: LineChart },
    { id: "insights", label: "Insights", icon: Sparkles },
    { id: "progress", label: "Progress", icon: GraduationCap },
  ];

  return (
    <div className="px-4 py-8">
      {/* Platform Standard Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="heading flex justify-center gap-2 animate-fade-up">
          Exam Score Analyzer
        </h1>
        <p className="description opacity-90 mt-2 text-xl md:text-2xl animate-fade-up">
          Analyze marks, track progress & get smart recommendations
        </p>
      </motion.div>

      {/* Platform Standard Container */}
      <div id="analysis-report" className="max-w-5xl mx-auto bg-(--card) rounded-xl shadow-lg overflow-hidden py-5 border border-(--border)">

        <div className="p-6 space-y-8">

          {/* Data Entry Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-(--border) pb-4">
              <h2 className="text-xl font-bold text-(--foreground) flex items-center gap-2 uppercase tracking-tight">
                <Settings2 size={20} className="text-indigo-600" /> Score Entry
              </h2>
              <div className="flex items-center gap-2 no-print">
                <button
                  onClick={resetData}
                  className="p-2 text-(--muted-foreground) hover:text-red-500 transition-colors border border-(--border) rounded-lg bg-(--background)"
                >
                  <RefreshCcw size={16} />
                </button>
                <ExportPanel stats={stats} subjects={subjects} />
              </div>
            </div>

            <MarksInput subjects={subjects} setSubjects={setSubjects} />
          </div>

          {/* Results Navigation Section */}
          <div className="space-y-6 pt-4 border-t border-(--border)">
            <div className="flex bg-(--background) p-1 rounded-xl border border-(--border) gap-1 overflow-x-auto no-scrollbar shadow-inner no-print">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-(--card) text-indigo-600 shadow-sm border border-(--border)"
                      : "text-(--muted-foreground) hover:text-(--foreground)"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {activeTab === "dashboard" && (
                  <div className="space-y-8">
                    <StatsDashboard stats={stats} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
                          <h4 className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Pass Status</h4>
                          <h2 className="text-4xl font-black mb-2">{stats?.passStatus}</h2>
                          <p className="text-xs font-medium opacity-90 leading-relaxed">
                            Rank: <span className="uppercase">{stats?.rank}</span>. Consistently performing across all subjects.
                          </p>
                       </div>

                       <div className="bg-(--background) border border-(--border) rounded-2xl p-6 flex flex-col justify-center shadow-sm">
                          <h4 className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-widest mb-1">Average Score</h4>
                          <div className="flex items-baseline gap-2">
                             <h2 className="text-5xl font-black text-(--foreground)">{stats?.average}</h2>
                             <span className="text-xs font-bold text-indigo-600 uppercase">Marks</span>
                          </div>
                          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                             <motion.div
                               initial={{ width: 0 }}
                               animate={{ width: `${stats?.percentage}%` }}
                               className="h-full bg-indigo-600"
                             />
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === "analytics" && (
                  <PerformanceCharts subjects={subjects} />
                )}

                {activeTab === "insights" && (
                  <InsightsCard analysis={analysis} />
                )}

                {activeTab === "progress" && (
                  <ProgressTracker exams={[...exams, { id: 3, type: "Current Exam", percentage: stats?.percentage, grade: stats?.grade }]} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Platform Standard Features Section */}
      <Features />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          .no-print { display: none !important; }
          #analysis-report { margin: 0; padding: 0; box-shadow: none; border: none; }
        }
      `}</style>
    </div>
  );
}
