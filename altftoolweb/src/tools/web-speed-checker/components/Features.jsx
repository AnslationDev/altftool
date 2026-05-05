import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Website Speed Test",
      description:
        "Analyze your website loading speed instantly and measure performance in seconds.",
    },
    {
      title: "Detailed Performance Metrics",
      description:
        "Get insights on page load time, response time, and overall performance score.",
    },
    {
      title: "Identify Optimization Areas",
      description:
        "Discover performance bottlenecks and learn what may be slowing down your website.",
    },
    {
      title: "Mobile & Desktop Testing",
      description:
        "Evaluate your website performance across different devices for better user experience.",
    },
    {
      title: "Simple & User-Friendly Interface",
      description:
        "Clean design makes it easy to test and understand your website speed reports.",
    },
    {
      title: "Fast & Browser-Based Tool",
      description:
        "Run speed tests directly from your browser without installing additional software.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Web Speed Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Test your website performance and improve loading speed effortlessly
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