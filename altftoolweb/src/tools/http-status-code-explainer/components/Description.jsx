"use client";

import React from "react";

const features = [
  { 
    title: "Search & Explore", 
    description: "Enter any HTTP status code in the search bar to instantly retrieve its official documentation and meaning." 
  },
  { 
    title: "Visual Learning", 
    description: "Browse through our categorized grid with high-quality visual aids and memes to remember each code easily." 
  },
  { 
    title: "Simplified Parsing", 
    description: "Get simplified, easy-to-read explanations that strip away complex jargon for better developer understanding." 
  },
  { 
    title: "Error Categorization", 
    description: "Quickly identify whether an issue is originating from the client-side (400s) or the server-side (500s)." 
  },
  { 
    title: "Debug Insights", 
    description: "Access actionable troubleshooting tips to resolve errors and improve your web application's reliability." 
  },
  { 
    title: "Smart Navigation", 
    description: "Use the interactive grid to toggle between different status codes and compare their behaviors instantly." 
  },
];

export default function HowItWorks() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <h2 className="text-3xl lg:text-4xl font-bold text-center text-(--foreground) mb-6">
        How It Works ?
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((card, index) => (
          <div
            key={index}
            className="group bg-(--card) p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-transparent hover:border-blue-500/10 cursor-default"
          >
            {/* Title turns blue on card hover */}
            <h3 className="text-xl font-bold mb-3 text-(--foreground) group-hover:text-blue-500 transition-colors">
              {card.title}
            </h3>
            <p className="text-(--muted-foreground) text-ml leading-relaxed">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}