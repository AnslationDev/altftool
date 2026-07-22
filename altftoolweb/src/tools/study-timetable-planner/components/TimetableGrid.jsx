"use client";

import { useState } from "react";
import {
  Calendar, Clock, BookOpen, AlertCircle,
  Settings, Download, Printer, RefreshCcw,
  ChevronLeft, ChevronRight, CheckCircle2,
  MoreVertical, Timer, BookMarked
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimetableGrid({ timetable, subjects, onGenerate, onUpdateSession }) {
  const [currentView, setCurrentView] = useState("daily"); // daily, weekly
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredTimetable = timetable.filter(session => session.date === activeDate);

  const handleGenerate = () => {
    onGenerate({
      startDate: activeDate,
      daysCount: 7,
      dailyHours: { start: 8, end: 20 },
      sessionDuration: 60,
      breakDuration: 15,
      revisionRatio: 0.2
    });
  };

  const dates = [...new Set(timetable.map(s => s.date))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Study Timetable</h2>
          <p className="text-xs text-(--muted-foreground)">View and manage your study sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            {timetable.length > 0 ? "Regenerate" : "Generate Schedule"}
          </button>
          <div className="flex bg-(--card) border border-(--border) rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setCurrentView("daily")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${currentView === 'daily' ? 'bg-(--primary) text-white shadow-md' : 'text-(--muted-foreground)'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setCurrentView("weekly")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${currentView === 'weekly' ? 'bg-(--primary) text-white shadow-md' : 'text-(--muted-foreground)'}`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {timetable.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Date Selector */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-(--card) p-4 rounded-2xl border border-(--border) shadow-sm">
              <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-(--muted-foreground)">Select Date</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {dates.map(date => (
                  <button
                    key={date}
                    onClick={() => setActiveDate(date)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      activeDate === date
                      ? "bg-(--primary)/10 border-(--primary) text-(--primary) font-bold"
                      : "bg-(--background) border-(--border) text-(--muted-foreground) hover:border-(--primary)/50"
                    }`}
                  >
                    <div className="text-[10px] uppercase opacity-60">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="lg:col-span-9 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {filteredTimetable.map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onUpdate={onUpdateSession}
                    index={index}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-center text-(--muted-foreground) bg-(--card)/50 border border-dashed border-(--border) rounded-2xl">
          <Calendar className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-xl font-bold mb-2">No timetable generated</p>
          <p className="max-w-xs mx-auto text-sm">Add some subjects and click generate to create your personalized study schedule.</p>
          <button
            onClick={handleGenerate}
            disabled={subjects.length === 0}
            className="mt-8 px-8 py-3 bg-(--primary) text-white rounded-xl font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create My Schedule
          </button>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onUpdate, index }) {
  const isBreak = session.type === 'break';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative overflow-hidden flex items-center gap-6 p-5 rounded-2xl border transition-all ${
        isBreak
        ? "bg-(--background) border-dashed border-(--border) opacity-60"
        : "bg-(--card) border-(--border) hover:border-(--primary) shadow-sm"
      }`}
    >
      <div className="shrink-0 text-center min-w-[60px]">
        <div className="text-[11px] font-bold text-(--primary)">{session.startTime}</div>
        <div className="text-[9px] text-(--muted-foreground) uppercase tracking-tighter">{session.endTime}</div>
      </div>

      <div className="w-1 h-8 rounded-full shrink-0" style={{
        backgroundColor: isBreak ? 'var(--border)' :
          session.difficulty === 'high' ? '#ef4444' :
          session.difficulty === 'medium' ? '#f59e0b' : '#10b981'
      }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-base truncate">{session.subjectName}</h3>
          {session.type === 'revision' && (
            <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[9px] font-bold uppercase tracking-wider border border-indigo-500/20 whitespace-nowrap">
              Revision
            </span>
          )}
        </div>
        <p className="text-xs text-(--muted-foreground) flex items-center gap-1 truncate">
          {isBreak ? (
            <Timer className="w-3 h-3" />
          ) : (
            <BookMarked className="w-3 h-3" />
          )}
          {session.topic || 'General Session'}
        </p>
      </div>

      {!isBreak && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex flex-col items-end gap-1 shrink-0">
             <div className="text-[10px] font-bold text-(--muted-foreground) uppercase tracking-widest flex justify-between w-full">
               <span>Progress</span>
               <span>{session.progress || 0}%</span>
             </div>
             <input
                type="range"
                min="0" max="100"
                value={session.progress || 0}
                onChange={(e) => onUpdate(session.id, { progress: parseInt(e.target.value), status: parseInt(e.target.value) === 100 ? 'completed' : 'pending' })}
                className="w-24 h-1.5 bg-(--background) rounded-full appearance-none cursor-pointer accent-indigo-500 border border-(--border)"
             />
          </div>
          <button
            onClick={() => onUpdate(session.id, { status: session.status === 'completed' ? 'pending' : 'completed', progress: session.status === 'completed' ? 0 : 100 })}
            className={`p-3 rounded-xl transition-all ${
              session.status === 'completed'
              ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
              : "bg-(--background) text-(--muted-foreground) border border-(--border) hover:border-green-500 hover:text-green-500"
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
