// components/VehicleComparisonDescription.jsx
"use client";

import React from "react";

const steps = [
  {
    title: "Select Vehicles",
    description: "Choose two or more vehicles from the database that you want to compare side by side."
  },
  {
    title: "View Specifications",
    description: "Check detailed specifications including engine, performance, mileage, safety features, and more."
  },
  {
    title: "Compare Features",
    description: "Analyze features, pros and cons of each vehicle to see which one fits your needs better."
  },
  {
    title: "Price Comparison",
    description: "Compare prices and available offers to make an informed purchasing decision."
  },
  {
    title: "User Reviews & Ratings",
    description: "Read reviews and ratings from other users to understand real-world performance and satisfaction."
  },
  {
    title: "Make Informed Choice",
    description: "Based on specifications, price, and reviews, select the vehicle that best suits your preferences."
  }
];

export default function VehicleComparisonDescription() {
  return (
    <div className="max-w-7xl mx-auto my-16 px-4">
      <h2 className="text-3xl font-bold text-(--foreground) text-center mb-10 mt-[-250]">
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