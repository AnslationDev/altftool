"use client";

import React from "react";
import * as Icons from "lucide-react";

export default function UseCases() {
  const cases = [
    {
      title: "Focus & Study",
      description:
        "Drown out background chatter, corridor noises, and minor distractions with a mix of steady white noise and soft rainfall.",
      icon: "BookOpen",
      color: "text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-950/40",
    },
    {
      title: "Deep Sleep",
      description:
        "Calm a racing mind at night by layering rhythmic ocean waves, forest crickets, and a gentle wind to ease transition into deep rest.",
      icon: "Moon",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-950/40",
    },
    {
      title: "Meditation & Peace",
      description:
        "Set a serene backdrop for mindfulness practice with resonant singing bowls, wind chimes, and natural rustling forest winds.",
      icon: "Heart",
      color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-950/40",
    },
    {
      title: "Writers & Creators",
      description:
        "Simulate the calming hum of a bustling coffee shop to trigger creative workflow while keeping individual elements adjustable.",
      icon: "PenTool",
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-950/40",
    },
  ];

  return (
    <section className="py-12 border-t border-slate-200/50 dark:border-slate-800/80">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Perfect For Every Scenario
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-350 mt-2 max-w-xl mx-auto font-semibold">
            Whether you need absolute silence, organic soundscapes, or coffee shop bustle, customize the perfect environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cases.map((item, idx) => {
            const IconComp = Icons[item.icon] || Icons.HelpCircle;
            return (
              <div
                key={idx}
                className="p-6 bg-white/20 dark:bg-slate-900/30 border border-slate-250 dark:border-slate-800/80 rounded-2xl flex gap-4 items-start backdrop-blur-sm"
              >
                <div
                  className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${item.color}`}
                >
                  <IconComp size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold leading-relaxed mt-1.5">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
