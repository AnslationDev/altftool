import React from "react";

const Features = () => {
  const features = [
    {
      title: "Comprehensive Question Library",
      description:
        "Access a wide range of interview questions covering technical, behavioral, and HR rounds.",
    },
    {
      title: "Role-Specific Questions",
      description:
        "Find tailored interview questions for different job roles, industries, and experience levels.",
    },
    {
      title: "Behavioral & Situational Practice",
      description:
        "Prepare for real-world interview scenarios with commonly asked behavioral and situational questions.",
    },
    {
      title: "Sample Answers & Tips",
      description:
        "Get guidance and example answers to help you structure confident and professional responses.",
    },
    {
      title: "Regularly Updated Content",
      description:
        "Stay prepared with updated interview questions that match current hiring trends.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Practice interview questions seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-10 sm:py-15 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Interview Questions Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Prepare smarter, practice confidently, and ace your next job interview
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