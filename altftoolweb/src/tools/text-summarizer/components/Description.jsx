// components/TextSummarizerFeatures.jsx
"use client";

import React from "react";

const features = [
  {
    title: "Quick Summaries",
    description: "Generate concise summaries of long articles, documents, or notes in seconds."
  },
  {
    title: "Multiple Languages",
    description: "Supports text summarization in multiple languages to cater to a global audience."
  },
  {
    title: "Three Summary Lengths",
    description: "Choose Short, Medium or Long to get one, two or three key sentences."
  },
  {
    title: "Instant & Private",
    description: "Runs entirely in your browser using sentence splitting and positional selection — nothing is uploaded, and nothing in the summary is invented."
  },
  {
    title: "Copy & Download",
    description: "Copy your summary to the clipboard or download it as a text file."
  },
  {
    title: "Privacy Focused",
    description: "Your text is processed securely and not stored permanently to protect your data."
  }
];

export default function TextSummarizerFeatures() {
  return (
    <div className="max-w-7xl mx-auto my-16 px-4">
      <h2 className="text-3xl font-bold text-(--foreground) text-center mb-10 mt-[20]">
        How It Works ?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-start gap-4 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-semibold text-(--foreground) transition-all hover:text-blue-500">
              {feature.title}
            </h3>
            <p className="text-(--foreground)/80">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}