import React from "react";

const Features = () => {
  const features = [
    {
      title: "Real-Time Regex Testing",
      description:
        "Test your regular expressions instantly and see live matching results as you type.",
    },
    {
      title: "Detailed Match Information",
      description:
        "View full match data including groups, indices, and captured patterns for accurate debugging.",
    },
    {
      title: "Syntax Highlighting",
      description:
        "Easily read and understand complex regular expressions with clear syntax highlighting.",
    },
    {
      title: "Error Detection & Debugging",
      description:
        "Identify invalid patterns and quickly fix syntax errors with instant feedback.",
    },
    {
      title: "Supports Multiple Use Cases",
      description:
        "Perfect for developers, testers, and students working with validation, parsing, and data extraction.",
    },
    {
      title: "Fast & Frontend-Based",
      description:
        "Lightweight tool that runs directly in your browser without any backend setup required.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Regex Tester?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Test, debug, and validate your regular expressions with real-time precision
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