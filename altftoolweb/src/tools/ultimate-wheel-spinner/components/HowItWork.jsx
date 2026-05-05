"use-client";
import React from "react";
import { Sparkles, ListPlus, Palette, RotateCw, Trophy } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      title: "Add Your Options",
      description:
        "Type any number of options—names, tasks, prizes, or choices—and add them to the wheel.",
      icon: <ListPlus className="h-6 w-6 text-(--primary)" />,
      bg: "bg-(--muted)",
    },
    {
      title: "Customize the Wheel",
      description:
        "Each option gets its own color segment automatically. Add, remove, or clear items anytime.",
      icon: <Palette className="h-6 w-6 text-(--primary)" />,
      bg: "bg-(--muted)",
    },
    {
      title: "Spin the Wheel",
      description:
        "Press the Spin button to rotate the wheel with smooth animations and random selection.",
      icon: <RotateCw className="h-6 w-6 text-(--primary)" />,
      bg: "bg-(--muted)",
    },
    {
      title: "View the Winner",
      description:
        "Once the wheel stops, the winning option is highlighted automatically at the top pointer.",
      icon: <Trophy className="h-6 w-6 text-(--primary)" />,
      bg: "bg-(--muted)",
    },
  ];

  return (
    <section className="w-full px-4 md:px-10 py-12">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 text-(--foreground)">
          <Sparkles className="h-7 w-7 text-(--primary)" />
          How It Works
        </h2>
        <p className="text-(--muted-foreground) mt-4 max-w-2xl mx-auto text-base md:text-lg">
          Create, customize, and spin your own decision wheel in just a few
          clicks.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`
              rounded-xl border border-(--border)
              bg-(--card) shadow-sm
              hover:shadow-lg hover:-translate-y-1
              transition-all duration-300
            `}
          >
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${step.bg}`}
              >
                {step.icon}
              </div>

              <h3 className="text-lg md:text-xl font-semibold text-(--card-foreground)">
                {step.title}
              </h3>

              <p className="text-(--muted-foreground) text-sm md:text-base">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
