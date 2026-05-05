"use client";

import React from "react";

const Description = () => {
  const steps = [
    {
      title: " Upload Image",
      description: "Select an image from your device to start cropping.",
    },
    {
      title: " Adjust Crop Area",
      description: "Drag and resize the crop box to select the area you want to keep.",
    },
    {
      title: "Zoom & Pan",
      description: "Zoom in/out or move the image for precise cropping.",
    },
    {
      title: "Preview",
      description: "Check the preview of the cropped image before finalizing it.",
    },
    {
      title: " Crop Image",
      description: "Click the crop button to cut the image as per your selection.",
    },
    {
      title: " Download/Save",
      description: "Download the cropped image or save it to your account for later use.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4 mt-[-50]">
            How It Works ?
          </h2>
          
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="
                bg-(--card)
                rounded-2xl
                shadow-md
                border border-(--border)
                p-6 sm:p-8
                flex flex-col
                hover:shadow-xl
                hover:-translate-y-2
                transition-all duration-300
              "
            >
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 hover:text-blue-500 transition-colors duration-300">
  {step.title}
</h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
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