"use client";

import React from "react";

const Description = () => {
  const features = [
    {
      title: "Instant README Generation",
      description:
        "Provide your project details like title, description, features, and dependencies, and get a fully formatted README instantly.",
    },
    {
      title: "Custom Sections",
      description:
        "Add sections like Installation, Usage, Contributing, License, and more to create a professional README tailored to your project.",
    },
    {
      title: "Markdown Ready",
      description:
        "Generate clean Markdown output that’s ready to copy, paste, and use on GitHub or other repositories.",
    },
    {
      title: "Template Options",
      description:
        "Choose from multiple templates and styles for your README to match your project’s look and feel.",
    },
    {
      title: "Instant Preview",
      description:
        "See a live preview of your README while you fill in the project details to ensure it looks perfect before exporting.",
    },
    {
      title: "Copy & Export",
      description:
        "Easily copy your README to clipboard or export as a Markdown file for direct use in your repository.",
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
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Automatically generate professional README files by providing your project details.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 hover:text-blue-600">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;