import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Spam Detection",
      description:
        "Analyze your email content or text instantly to identify potential spam triggers and risky phrases.",
    },
    {
      title: "Spam Score Analysis",
      description:
        "Get a detailed spam score to understand how likely your message is to be flagged by email filters.",
    },
    {
      title: "Content Optimization Tips",
      description:
        "Receive actionable suggestions to improve deliverability and avoid spam folders.",
    },
    {
      title: "Keyword & Trigger Check",
      description:
        "Detect common spam words and suspicious patterns that may impact email performance.",
    },
    {
      title: "Fast & Easy to Use",
      description:
        "Simple interface that allows you to paste your content and get instant results.",
    },
    {
      title: "Secure & Private",
      description:
        "All analysis runs securely without storing or sharing your content.",
    },
  ];

  return (
    <section className="pb-16 pt-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Spam Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Improve email deliverability and avoid spam filters with smart analysis
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