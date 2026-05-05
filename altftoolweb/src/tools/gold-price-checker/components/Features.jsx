import React from "react";

const Features = () => {
  const features = [
    {
      title: "Live Gold Price Updates",
      description:
        "Get the latest gold prices in real-time to stay informed about current market trends.",
    },
    {
      title: "Multiple Units Support",
      description:
        "Check gold prices in grams, ounces, and kilograms for accurate comparison and calculations.",
    },
    {
      title: "Currency Conversion",
      description:
        "View gold prices in different currencies to match your local market and investment needs.",
    },
    {
      title: "Market Trend Insights",
      description:
        "Track price fluctuations and analyze short-term and long-term gold market movements.",
    },
    {
      title: "Simple & User-Friendly Interface",
      description:
        "Clean and intuitive design that makes checking gold prices quick and effortless.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Access the gold price checker seamlessly on desktop, tablet, and mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Gold Price Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Stay updated with accurate and real-time gold market prices
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