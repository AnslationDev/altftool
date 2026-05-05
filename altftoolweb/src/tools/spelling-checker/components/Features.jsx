import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Spell Check",
      description:
        "Detect spelling mistakes in your text instantly and correct them with high accuracy.",
    },
    {
      title: "Real-Time Error Detection",
      description:
        "Identify misspelled words as you type and improve your writing instantly.",
    },
    {
      title: "Smart Correction Suggestions",
      description:
        "Receive accurate word suggestions to quickly fix errors and enhance clarity.",
    },
    {
      title: "Supports Multiple Languages",
      description:
        "Check spelling across various languages for better global communication.",
    },
    {
      title: "Easy Copy & Edit",
      description:
        "Correct your text and copy the improved version instantly for use anywhere.",
    },
    {
      title: "Fast, Secure & Browser-Based",
      description:
        "Works directly in your browser without storing your text, ensuring privacy and convenience.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Spelling Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Eliminate spelling mistakes and improve your writing with instant accuracy
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