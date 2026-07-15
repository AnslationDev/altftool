import React from "react";
import { Sparkles, Trophy, Shield, Heart, Zap, Smile } from "lucide-react";

const faqItems = [
  {
    question: "What is the Random Life Challenge tool?",
    answer:
      "It is a gamified daily self-improvement app that generates random micro-actions across physical health, emotional wellness, social connectivity, and learning. It helps you build good habits while keeping things unpredictable.",
  },
  {
    question: "Do I have to complete the challenge immediately?",
    answer:
      "No! You can set your difficulty (Easy, Medium, Hard) and click 'Accept Challenge'. This adds it to your active list, where you can complete it within 24 hours.",
  },
  {
    question: "What are XP and Achievements?",
    answer:
      "Every time you complete a challenge, you earn Experience Points (XP). Reaching milestones unlocks custom badges (like 'Fitness Fanatic' or 'Zen Master') to track your personal development.",
  },
  {
    question: "Is my progress saved?",
    answer:
      "Yes. Your lifetime score, current streak, active challenges, and unlocked achievement badges are stored locally in your browser's localStorage.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl px-4">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) tracking-tight">
            Gamified Self-Improvement
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Take small, daily steps toward a healthier, more creative, and adventurous life. Spin the selector wheel and break your routine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Achievement Milestones</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Collect experience points (XP) and unlock specialized badges as you complete challenges and break routines.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Randomized Comfort-Breakers</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Discover unique micro-challenges from taking cold showers to writing thank-you notes that keep life exciting.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Private Lifetime Tracking</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your scores, completion logs, and streak counts stay completely on your browser. No profile sign-ups needed.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-(--surface) rounded-2xl border border-(--border) p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-(--foreground) mb-3 flex items-start gap-2.5">
                  <span className="text-teal-500 font-extrabold text-lg shrink-0">Q.</span>
                  <span>{item.question}</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
