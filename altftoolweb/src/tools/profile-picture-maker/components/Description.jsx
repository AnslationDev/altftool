"use client";

import React from "react";

const Description = () => {
  const steps = [
    {
      title: "Upload Your Photo",
      description: "Start by uploading your photo from your device to create a personalized profile picture.",
    },
    {
      title: "Choose a Style",
      description: "Select from multiple artistic styles, backgrounds, and effects to customize your profile picture.",
    },
    {
      title: "Adjust & Crop",
      description: "Crop, rotate, or adjust your image to make it perfectly fit for social media or your website.",
    },
    {
      title: "Preview in Real-Time",
      description: "See your profile picture instantly as you apply effects and styles, with no delay.",
    },
    {
      title: "Download & Save",
      description: "Once satisfied, download your newly created profile picture in high resolution.",
    },
    {
      title: "Reusable Anywhere",
      description: "Use this tool again anytime to generate multiple profile pictures quickly for different platforms.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-(--background)">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-(--foreground) mb-4 mt-[-35]">
            How It Works ?
          </h2>
          <p className="text-(--muted-foreground) max-w-2xl mx-auto">
            Create stunning profile pictures in just a few simple steps
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-(--card) rounded-2xl shadow-md border border-(--border) p-6 sm:p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-(--foreground) mb-3  transition all hover:text-blue-600">
                {step.title}
              </h3>
              <p className="text-sm text-(--muted-foreground) leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;