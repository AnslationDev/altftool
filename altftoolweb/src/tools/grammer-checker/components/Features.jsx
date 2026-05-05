import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Grammar Correction",
      description:
        "Detect and correct grammar mistakes instantly to improve clarity and professionalism in your writing.",
    },
    {
      title: "Spelling & Punctuation Check",
      description:
        "Identify spelling errors, punctuation issues, and typos to ensure your content is polished and error-free.",
    },
    {
      title: "Sentence Structure Improvement",
      description:
        "Get suggestions to enhance sentence structure, readability, and overall writing flow.",
    },
    {
      title: "Tone & Style Suggestions",
      description:
        "Refine your writing tone for academic, professional, or casual communication with smart suggestions.",
    },
    {
      title: "Privacy First",
      description:
        "Your text stays secure. We do not store or track your content — everything is processed safely.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Use the grammar checker seamlessly on desktop, tablet, or mobile devices anytime, anywhere.",
    },
  ];

  return (
    <section className="py-10 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Grammar Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Improve your writing accuracy, clarity, and confidence instantly
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