// components/TypingMasterHowItWorks.jsx
"use client";

import React from "react";

const steps = [
  {
    title: "Sign Up & Set Goals",
    description: "Create an account and set your typing speed and accuracy goals to get personalized training."
  },
  {
    title: "Start Lessons",
    description: "Follow structured typing lessons, starting from basic keystrokes to advanced typing exercises."
  },
  {
    title: "Real-Time Feedback",
    description: "Get instant feedback on your speed and accuracy, highlighting mistakes for faster improvement."
  },
  {
    title: "Track Progress",
    description: "Monitor your daily, weekly, and monthly performance with detailed charts and statistics."
  },
  {
    title: "Take Challenges",
    description: "Participate in typing games and speed challenges to test your skills under pressure."
  },
  {
    title: "Achieve Mastery",
    description: "Complete advanced lessons and reach your typing goals while enjoying continuous improvement."
  }
];

export default function TypingMasterHowItWorks() {
  return (
    <div className="max-w-7xl mx-auto my-16 px-4">
      <h2 className="text-3xl font-bold text-(--foreground) text-center mb-10">
        How It Works ?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-start gap-4 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-(--foreground) transition-all hover:text-blue-500">
              {step.title}
            </h3>
            <p className="text-(--foreground)/80">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}