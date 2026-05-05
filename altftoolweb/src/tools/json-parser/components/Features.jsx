import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant JSON Validation",
      description:
        "Validate your JSON data instantly and detect syntax errors with clear, easy-to-understand feedback.",
    },
    {
      title: "Pretty Print & Formatting",
      description:
        "Beautify and format raw JSON into a clean, structured layout for better readability and debugging.",
    },
    {
      title: "Error Highlighting",
      description:
        "Quickly identify issues with precise error messages and line references to fix problems faster.",
    },
    {
      title: "Minify JSON Data",
      description:
        "Compress JSON by removing unnecessary spaces and formatting for optimized data transfer.",
    },
    {
      title: "Secure & Private Processing",
      description:
        "All JSON parsing happens directly in your browser — no data is stored or transmitted.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Use the JSON parser seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our JSON Parser Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Validate, format, and debug your JSON data quickly and efficiently
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