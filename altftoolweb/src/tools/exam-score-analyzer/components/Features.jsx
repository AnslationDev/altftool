import React from "react";

const Features = () => {
  const features = [
    {
      title: "Smart Grade Logic",
      description:
        "Automatically calculates grades and percentages based on academic standards and total marks.",
    },
    {
      title: "Visual Performance",
      description:
        "Interactive bar and pie charts visualize your score distribution and subject-wise comparison.",
    },
    {
      title: "AI-Style Insights",
      description:
        "Get personalized feedback on your strengths and identifies subjects that need more focus.",
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor your academic growth by comparing unit tests, midterms, and final exam results.",
    },
    {
      title: "PDF Export",
      description:
        "Generate and download professional academic reports with a single click for offline use.",
    },
    {
      title: "Private & Secure",
      description:
        "Your marks are processed locally in your browser. No data is ever stored on any server.",
    },
  ];

  return (
    <section className="py-12 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Powerful Analytics Features
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Everything you need to track and improve your academic performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-(--card) rounded-2xl shadow-md border border-(--border) p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
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
