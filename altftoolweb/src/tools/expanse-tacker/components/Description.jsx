"use client";

import React from "react";
import { CreditCard, DollarSign, BarChart2, Clock, BookOpen, CheckCircle } from "lucide-react";

const steps = [
  {
    title: "Add Your Expenses",
    description: "Easily add your daily expenses and categorize them.",
    icon: <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />,
  },
  {
    title: "Track Spending",
    description: "Visualize your spending patterns with charts and summaries.",
    icon: <BarChart2 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />,
  },
  {
    title: "Set Budgets",
    description: "Define monthly budgets to manage your money effectively.",
    icon: <DollarSign className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />,
  },
  {
    title: "View History",
    description: "Check past expenses and review your spending patterns.",
    icon: <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />,
  },
  {
    title: "Notifications",
    description: "Stay updated with spending alerts and notifications.",
    icon: <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />,
  },
  {
    title: "Review & Save",
    description: "Analyze your expenses and save more efficiently.",
    icon: <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />,
  },
];

export default function Description() {
  return (
    <section className="py-12 sm:py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Responsive Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-10 sm:mb-16 text-center text-gray-900 tracking-tight">
          How It <span className="text-blue-600">Works?</span>
        </h2>

        {/* The Grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              /* w-full on mobile, fixed max-width for balance */
              className="group p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Icon Container with background scaling */}
              <div className="mb-5 p-4 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}