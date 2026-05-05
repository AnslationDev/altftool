import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Paraphrasing",
      description:
        "Rewrite sentences and paragraphs instantly while preserving the original meaning and context.",
    },
    {
      title: "Multiple Writing Modes",
      description:
        "Choose from different tones such as formal, academic, creative, or simplified to match your needs.",
    },
    {
      title: "Improved Clarity & Readability",
      description:
        "Enhance sentence structure and wording to make your content clearer and more engaging.",
    },
    {
      title: "Plagiarism Reduction",
      description:
        "Generate unique variations of your content to help avoid duplicate phrasing and repetition.",
    },
    {
      title: "Secure & Private",
      description:
        "Your text is processed securely with no storage or tracking of your content.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Use the paraphrasing tool seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Paraphrasing Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Rewrite content effortlessly while keeping the original meaning intact
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