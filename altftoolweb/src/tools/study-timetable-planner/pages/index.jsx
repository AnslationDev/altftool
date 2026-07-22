"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Calendar, Clock, BookOpen, BarChart2,
  Settings, Download, Trash2, CheckCircle2,
  AlertCircle, ChevronRight, Play, Timer,
  Trophy, Flame, Target, BookMarked, Sparkles
} from "lucide-react";

import SubjectManager from "../components/SubjectManager";
import TimetableGrid from "../components/TimetableGrid";
import PomodoroTimer from "../components/PomodoroTimer";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import ExportPanel from "../components/ExportPanel";
import { loadData, saveData, exportToJSON } from "../utils/storage";
import { generateTimetable } from "../utils/scheduler";

export default function StudyTimetablePlanner() {
  const [subjects, setSubjects] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, subjects, timetable, focus
  const [stats, setStats] = useState({
    streak: 0,
    completionRate: 0,
    totalHours: 0,
    upcomingExams: 0
  });

  // Load initial data
  useEffect(() => {
    const data = loadData();
    if (data) {
      setSubjects(data.subjects || []);
      setTimetable(data.timetable || []);
      setStats(data.stats || { streak: 0, completionRate: 0, totalHours: 0, upcomingExams: 0 });
    }
  }, []);

  // Save data on changes
  useEffect(() => {
    saveData({ subjects, timetable, stats });
  }, [subjects, timetable, stats]);

  // Dynamic Stats Calculation
  const calculatedStats = useMemo(() => {
    const completed = timetable.filter(s => s.status === 'completed').length;
    const total = timetable.filter(s => s.type !== 'break').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalHrs = Math.round((completed * 60) / 60); // Assuming 60 min sessions
    const exams = subjects.filter(s => s.examDate && new Date(s.examDate) > new Date()).length;

    // Simple streak calculation (mocked for demo if no real daily history)
    const streak = completed > 0 ? Math.min(7, Math.ceil(completed / 5)) : 0;

    return {
      streak,
      completionRate: rate,
      totalHours: totalHrs,
      upcomingExams: exams
    };
  }, [timetable, subjects]);

  // Update stats state when calculation changes
  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  const handleAddSubject = (subject) => {
    setSubjects([...subjects, { ...subject, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleUpdateSubject = (id, updates) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleGenerateTimetable = (config) => {
    const newTimetable = generateTimetable(subjects, config);
    setTimetable(newTimetable);
    setActiveTab("timetable");
  };

  const handleUpdateSession = (sessionId, updates) => {
    setTimetable(timetable.map(s => s.id === sessionId ? { ...s, ...updates } : s));
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-4 md:p-8">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-4 border border-indigo-500/20"
        >
          <Sparkles className="w-3 h-3" />
          AI-Powered Study Planning
        </motion.div>
        <h1 className="heading text-4xl md:text-6xl mb-4">Study Timetable Planner</h1>
        <p className="description text-base text-(--secondary-foreground) max-w-2xl mx-auto">
          Master your schedule, track your progress, and achieve your academic goals with ease.
        </p>
      </header>

      {/* Main Dashboard Navigation */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap md:flex-nowrap gap-2 mb-8 p-1.5 bg-(--card)/50 backdrop-blur-md rounded-2xl border border-(--border) w-full">
          {[
            { id: "dashboard", icon: <BarChart2 className="w-4 h-4" />, label: "Dashboard" },
            { id: "subjects", icon: <BookOpen className="w-4 h-4" />, label: "Subjects" },
            { id: "timetable", icon: <Calendar className="w-4 h-4" />, label: "Timetable" },
            { id: "focus", icon: <Timer className="w-4 h-4" />, label: "Focus Mode" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                ? "bg-(--primary) text-white shadow-lg"
                : "hover:bg-(--card-hover-bg) text-(--muted-foreground)"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content Area */}
        <div className="relative min-h-[600px]">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <AnalyticsDashboard stats={stats} timetable={timetable} subjects={subjects} />

                  <div className="bg-(--card) rounded-2xl border border-(--border) p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-500" />
                      Current Progress
                    </h2>
                    <div className="h-48 flex items-center justify-center text-(--muted-foreground) bg-(--background)/50 rounded-xl border border-dashed border-(--border)">
                      No active sessions tracked yet.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StudyStats stats={stats} />
                    <div className="space-y-6">
                      <QuickActions onNavigate={setActiveTab} />
                      <ExportPanel timetable={timetable} subjects={subjects} />
                    </div>
                  </div>
              </motion.div>
            )}

            {activeTab === "subjects" && (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SubjectManager
                  subjects={subjects}
                  onAdd={handleAddSubject}
                  onUpdate={handleUpdateSubject}
                  onDelete={handleDeleteSubject}
                />
              </motion.div>
            )}

            {activeTab === "timetable" && (
              <motion.div
                key="timetable"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TimetableGrid
                  timetable={timetable}
                  subjects={subjects}
                  onGenerate={handleGenerateTimetable}
                  onUpdateSession={handleUpdateSession}
                />
              </motion.div>
            )}

            {activeTab === "focus" && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PomodoroTimer />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer / Info */}
      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-(--border) text-center text-(--muted-foreground) text-sm">
        <p>&copy; 2026 Study Timetable Planner. Built for productivity.</p>
      </footer>
    </div>
  );
}

function QuickActions({ onNavigate }) {
  return (
    <div className="bg-(--card) rounded-2xl border border-(--border) p-6 shadow-sm">
      <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-(--muted-foreground)">Quick Actions</h3>
      <div className="space-y-3">
        <ActionButton
          icon={<Plus className="w-4 h-4" />}
          label="Add New Subject"
          onClick={() => onNavigate("subjects")}
        />
        <ActionButton
          icon={<Calendar className="w-4 h-4" />}
          label="Generate Timetable"
          onClick={() => onNavigate("timetable")}
        />
        <ActionButton
          icon={<Timer className="w-4 h-4" />}
          label="Start Pomodoro"
          onClick={() => onNavigate("focus")}
        />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-(--background) border border-(--border) hover:border-(--primary) hover:bg-(--card-hover-bg) transition-all group"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-(--primary)/10 text-(--primary) group-hover:bg-(--primary) group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="font-bold text-xs">{label}</span>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-(--muted-foreground) group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

function StudyStats({ stats }) {
  return (
    <div className="bg-(--card) rounded-2xl border border-(--border) p-6 shadow-sm">
      <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-(--muted-foreground)">Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<Flame className="w-4 h-4 text-orange-500" />} label="Streak" value={`${stats.streak} Days`} />
        <StatCard icon={<Target className="w-4 h-4 text-green-500" />} label="Done" value={`${stats.completionRate}%`} />
        <StatCard icon={<Clock className="w-4 h-4 text-blue-500" />} label="Total" value={`${stats.totalHours}h`} />
        <StatCard icon={<AlertCircle className="w-4 h-4 text-red-500" />} label="Exams" value={stats.upcomingExams} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="p-3.5 rounded-xl bg-(--background) border border-(--border) text-center">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <p className="text-[9px] uppercase font-bold text-(--muted-foreground) mb-0.5">{label}</p>
      <p className="text-base font-black">{value}</p>
    </div>
  );
}
