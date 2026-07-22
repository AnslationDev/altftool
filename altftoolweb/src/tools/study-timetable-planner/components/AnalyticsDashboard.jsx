"use client";

import { motion } from "framer-motion";
import {
  BarChart2, PieChart, TrendingUp,
  BookOpen, CheckCircle2, Clock,
  AlertCircle, Trophy, Calendar
} from "lucide-react";

export default function AnalyticsDashboard({ stats, timetable, subjects }) {
  const completedSessions = timetable.filter(s => s.status === 'completed').length;
  const totalSessions = timetable.filter(s => s.type !== 'break').length;
  const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // Calculate subject-wise distribution
  const subjectDistribution = subjects.map(sub => {
    const sessions = timetable.filter(s => s.subjectId === sub.id);
    return {
      name: sub.name,
      count: sessions.length,
      completed: sessions.filter(s => s.status === 'completed').length
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatSummaryCard
          icon={<Trophy className="w-6 h-6 text-yellow-500" />}
          label="Overall Progress"
          value={`${completionRate}%`}
          desc={`${completedSessions} of ${totalSessions} sessions done`}
          progress={completionRate}
          color="indigo"
        />
        <StatSummaryCard
          icon={<BookOpen className="w-6 h-6 text-indigo-500" />}
          label="Subjects Tracked"
          value={subjects.length}
          desc="Across all active courses"
          progress={100}
          color="indigo"
        />
        <StatSummaryCard
          icon={<Calendar className="w-6 h-6 text-green-500" />}
          label="Next Exam"
          value={subjects.find(s => s.examDate)?.name || "None"}
          desc={subjects.find(s => s.examDate) ? `On ${new Date(subjects.find(s => s.examDate).examDate).toLocaleDateString()}` : "Keep studying!"}
          progress={100}
          color="green"
        />
      </div>

      <div className="bg-(--card) rounded-2xl border border-(--border) p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-500" />
          Subject-wise Breakdown
        </h3>
        <div className="space-y-5">
          {subjectDistribution.length > 0 ? (
            subjectDistribution.map(subject => (
              <div key={subject.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">{subject.name}</span>
                  <span className="text-(--muted-foreground)">{subject.completed} / {subject.count}</span>
                </div>
                <div className="h-2 w-full bg-(--background) rounded-full overflow-hidden border border-(--border)">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.count > 0 ? (subject.completed / subject.count) * 100 : 0}%` }}
                    className="h-full bg-indigo-500"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-(--muted-foreground)">
              No data available. Add subjects to see breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatSummaryCard({ icon, label, value, desc, progress, color }) {
  return (
    <div className="bg-(--card) p-5 rounded-2xl border border-(--border) shadow-sm flex flex-col justify-between overflow-hidden relative group">
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="p-2.5 rounded-xl bg-(--background) border border-(--border) group-hover:border-indigo-500/50 transition-all">
          {icon}
        </div>
        <div className="text-right">
          <p className="text-xl font-black">{value}</p>
          <p className="text-[9px] uppercase font-bold text-(--muted-foreground) tracking-widest">{label}</p>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-[11px] text-(--muted-foreground) mb-2.5">{desc}</p>
        <div className="h-1.5 w-full bg-(--background) rounded-full overflow-hidden border border-(--border)">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full bg-${color}-500`}
          />
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full" />
    </div>
  );
}
