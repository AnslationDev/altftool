import React from "react";

const Features = () => {
  const features = [
    {
      title: "All-in-One Unit Conversion",
      description:
        "Convert between multiple measurement units including length, weight, temperature.",
    },
    {
      title: "Instant & Accurate Results",
      description:
        "Get precise conversion results instantly as you enter values with no delays.",
    },
    {
      title: "Supports Multiple Categories",
      description:
        "Easily switch between categories like distance, mass, speed, time, energy, and pressure.",
    },
    {
      title: "Simple & User-Friendly Interface",
      description:
        "Clean and intuitive design makes unit conversion quick and effortless for everyone.",
    },
    {
      title: "Real-Time Conversion",
      description:
        "See converted values automatically update as you type for faster calculations.",
    },
    {
      title: "Fast & Browser-Based",
      description:
        "Lightweight tool that works directly in your browser without installation or backend setup.",
    },
  ];

  return (
    <section className="mt-5 py-16  px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Unit Converter?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Convert measurements quickly, accurately, and effortlessly in one place
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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
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

export default Features;