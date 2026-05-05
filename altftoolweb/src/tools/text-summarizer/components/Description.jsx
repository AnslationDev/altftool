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
    title: "Custom Summary Length",
    description: "Adjust the length of summaries according to your preference, from short to detailed."
  },
  {
    title: "AI-Powered",
    description: "Utilizes advanced AI algorithms to capture the key points accurately."
  },
  {
    title: "Copy & Share",
    description: "Easily copy your summaries or share them directly with colleagues or friends."
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