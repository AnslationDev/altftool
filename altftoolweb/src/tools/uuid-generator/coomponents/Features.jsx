import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant UUID Generation",
      description:
        "Generate universally unique identifiers (UUIDs) instantly for your applications and databases.",
    },
    {
      title: "Supports Multiple UUID Versions",
      description:
        "Create UUID v1, v4, and other standard formats depending on your development needs.",
    },
    {
      title: "Bulk UUID Creation",
      description:
        "Generate multiple UUIDs at once to speed up development and testing workflows.",
    },
    {
      title: "Copy with One Click",
      description:
        "Quickly copy generated UUIDs to your clipboard for seamless integration into your projects.",
    },
    {
      title: "Developer-Friendly Format",
      description:
        "Clean and properly formatted UUID strings ready to use in APIs, databases, and backend systems.",
    },
    {
      title: "Secure & Browser-Based",
      description:
        "Runs entirely in your browser with no data storage or server communication required.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our UUID Generator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Generate secure, unique identifiers instantly for your applications
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