import React from "react";

const Features = () => {
  const features = [
    {
      title: "Accurate Api stress estimation",
      description:
        "Leverage advanced algorithms to predict API stress under various traffic patterns and configurations with high precision.",
    },
    {
      title: "Instant Results",
      description:
        "Get your API stress estimates calculated immediately with real-time processing. No delays, just quick and accurate output.",
    },
    {
      title: "Fully Responsive",
      description:
        "Optimized for desktop, tablet, and mobile devices. Enjoy a seamless experience on any screen size.",
    },
    {
      title: "Clean & Simple Interface",
      description:
        "Minimal, distraction-free design that makes calculating your API stress easy and user-friendly.",
    },
    {
      title: "Privacy Focused",
      description:
        "Your expense data stays in your browser. No data storage, no tracking — complete privacy guaranteed.",
    },
    {
      title: "No Backend Required",
      description:
        "Runs entirely on the frontend using JavaScript. No servers, no APIs — lightweight and efficient.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Choose Our API stress Estimator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Simple, fast, and accurate API stress estimation for everyone
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
