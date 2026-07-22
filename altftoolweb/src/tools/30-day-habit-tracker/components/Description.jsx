import React from 'react';
import { Target, Flame, CheckSquare, FileText, TrendingUp, Trophy } from 'lucide-react';

export default function Description() {
  const steps = [
    {
      title: "Choose a Habit",
      desc: "Select from our curated list of daily templates or define your own custom habit, complete with a motivating reward.",
      icon: <Target className="w-6 h-6" />,
    },
    {
      title: "Commit Daily",
      desc: "Show up every day to build momentum. The secret to long-term habit formation is consistency and repetition.",
      icon: <Flame className="w-6 h-6" />,
    },
    {
      title: "Log Your Progress",
      desc: "Mark each day as Completed or Skipped with a single click. Keep the chain active and watch your streak grow.",
      icon: <CheckSquare className="w-6 h-6" />,
    },
    {
      title: "Jot Down Reflections",
      desc: "Write down thoughts, moods, obstacles, or small achievements for any day using daily progress notes.",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "Analyze Analytics",
      desc: "Monitor your custom habit metrics, including overall completion rate, current streak, and longest streak.",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "Celebrate Milestones",
      desc: "Track your completion, claim your custom reward at the end of the 30 days, and download your full progress logs.",
      icon: <Trophy className="w-6 h-6" />,
    }
  ];

  return (
    <div className="py-12 bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 relative">
          <h2 className="text-2xl font-black tracking-widest uppercase text-[var(--primary)]">
            How It Works?
          </h2>
          <div className="w-16 h-1.5 bg-[var(--primary)] mx-auto mt-4 rounded-full shadow-[0_0_10px_var(--primary)]"></div>
        </div>

        {/* 6-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group rounded-3xl p-8 border transition-all duration-500 hover:-translate-y-2"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                boxShadow: '0 10px 30px -15px rgba(0,0,0,0.1)'
              }}
            >
              {/* Icon Container */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--primary)'
                }}
              >
                {step.icon}
              </div>

              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-[var(--foreground)] transition-colors duration-300 group-hover:text-[var(--primary)]">
                  {step.title}
                </h3>
              </div>

              <p className="text-sm leading-relaxed font-medium text-[var(--muted-foreground)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
