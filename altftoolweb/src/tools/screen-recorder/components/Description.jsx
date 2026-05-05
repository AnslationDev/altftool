"use client";

import React from "react";
import { Film, Video, Clock, Pause, Play, Square } from "lucide-react";

const cardData = [
  {
    title: "Easy Screen Capture",
    description: "Start recording your screen in one click and capture your entire desktop or a specific window.",
    icon: <Film className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "High Quality Video",
    description: "Record in HD with smooth frame rates, adjustable settings, and clear audio support.",
    icon: <Video className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Live Timer",
    description: "See the duration of your recording in real-time with a built-in timer.",
    icon: <Clock className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Pause & Resume",
    description: "Pause your recording at any moment and resume without losing progress.",
    icon: <Pause className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Stop & Save",
    description: "Stop recording and automatically save your video locally for easy access.",
    icon: <Square className="w-8 h-8 text-(--primary)" />
  },
  {
    title: "Play & Review",
    description: "Play back your recordings instantly to review or share with others.",
    icon: <Play className="w-8 h-8 text-(--primary)" />
  }
];

export default function Description() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-(--foreground) text-center mb-10">How it Works ?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-start hover:bg-white/20 transition-colors shadow-md"
          >
            <div className="mb-4">{card.icon}</div>
            <h3 className="text-xl font-semibold text-(--foreground) mb-2 group-hover:text-blue-500 transition-colors">{card.title}</h3>
            <p className="text-(--foreground) text-sm">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}