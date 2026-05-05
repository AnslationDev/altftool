// components/SurveyFeatures.jsx
"use client";

import React from "react";


const features = [
  {
    title: "Drag-and-Drop Builder",
    description: "Easily arrange and reorder your survey questions using a simple drag-and-drop interface.",
  
  },
  {
    title: "Multiple Question Types",
    description: "Support for text, multiple-choice, rating scales, checkboxes, and more to collect versatile responses.",
   
  },
  {
    title: "Conditional Logic",
    description: "Show or hide questions based on previous answers to make your surveys smarter and more interactive.",
    
  },
  {
    title: "Real-time Analytics",
    description: "Track responses as they come in and visualize results with charts and graphs.",
    
  },
  {
    title: "Easy Sharing",
    description: "Share your surveys with a link or embed them directly on your website or social media.",
  
  },
  {
    title: "Customizable Design",
    description: "Brand your surveys with custom colors, logos, and layouts to match your style.",

  }
];

export default function SurveyFeatures() {
  return (
    <div className="max-w-7xl mx-auto my-16 px-4 mt-[-40]">
      <h2 className="text-3xl font-bold text-(--foreground) text-center mb-10">How It Works ?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col items-start gap-4 hover:shadow-xl transition-shadow"
          >
           
            <h3 className="text-xl font-semibold text-(--foreground) transition-all hover:text-blue-500">{feature.title}</h3>
            <p className="text-(--foreground)/80">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}