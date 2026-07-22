import React from "react";
import { Card, CardContent } from "@mui/material";

import { Search, SlidersHorizontal, BarChart3, CheckCircle2, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
  {
    title: "Search Corporate Tools",
    description:
      "Search tools by name, category, or keywords to quickly discover solutions that fit your business needs.",
    icon: <Search className="h-6 w-6 text-indigo-600" />,
    bg: "bg-indigo-100",
  },
  {
    title: "Filter & Refine Results",
    description:
      "Apply category and functionality filters such as CRM, Finance, HR, or Development to narrow down your options.",
    icon: <SlidersHorizontal className="h-6 w-6 text-purple-600" />,
    bg: "bg-purple-100",
  },
  {
    title: "Compare Tool Insights",
    description:
      "Compare features, pricing models, and use cases to evaluate which tools best match your workflow.",
    icon: <BarChart3 className="h-6 w-6 text-pink-600" />,
    bg: "bg-pink-100",
  },
  {
    title: "Select the Best Tool",
    description:
      "Choose the tool that aligns with your team size, budget, and long-term scalability goals.",
    icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
    bg: "bg-green-100",
  },
];


  return (
    <div className="w-full px-4 md:px-10 py-12 ">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2 text-black">
          <Sparkles className="h-7 w-7 text-indigo-600" />
          How It Works
        </h2>
        <p className="text-black mt-4 max-w-2xl mx-auto text-base md:text-lg">
          Digital wallet  quickly and efficiently in just a few simple steps
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <Card
            key={index}
            className="hover:shadow-xl transition-transform duration-300 transform rounded-xl"
          >
            <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${step.bg}`}
              >
                {step.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm md:text-base">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}