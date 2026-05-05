import React from "react";

const Description = () => {
  const features = [
    {
      title: "Enter Your Birth Details",
      description:
        "Provide your date of birth, time, and place of birth to get the most accurate rashi prediction.",
    },
    {
      title: "Instant Rashi Calculation",
      description:
        "Our tool automatically calculates your rashi based on Vedic astrology principles in seconds.",
    },
    {
      title: "Daily Horoscope Insights",
      description:
        "Receive daily guidance and predictions tailored to your rashi to help plan your day better.",
    },
    {
      title: "Compatibility Check",
      description:
        "Check compatibility with friends, family, or partners based on rashi and astrology charts.",
    },
    {
      title: "Personalized Tips",
      description:
        "Get actionable tips and remedies specific to your rashi to improve your wellbeing and luck.",
    },
    {
      title: "Completely Free & Private",
      description:
        "All calculations are done in-browser, with no personal data stored or shared, ensuring full privacy.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4 mt-[-50]">
            How It Works ?
          </h2>
          <p className="text-2xl text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Discover your rashi instantly and explore personalized horoscope insights
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-2xl">
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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 hover:text-blue-600 cursor-pointer">
                {feature.title}
              </h3>

              <p className="text-xl  text-(--muted-foreground) leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;