import React from "react";

const Features = () => {
  const features = [
    {
      title: "Daily Panchang Details",
      description:
        "Access complete daily Panchang information including Tithi, Nakshatra, Yoga, and Karana in one place.",
    },
    {
      title: "Auspicious & Inauspicious Timings",
      description:
        "Check important timings such as Muhurat, Rahu Kaal, Gulika Kaal, and Abhijit Muhurat for better planning.",
    },
    {
      title: "Festival & Vrat Information",
      description:
        "Stay updated with Hindu festivals, fasting days (Vrat), and significant religious observances.",
    },
    {
      title: "Location-Based Calculations",
      description:
        "Get accurate Panchang details based on your location for precise sunrise, sunset, and timing data.",
    },
    {
      title: "Simple & Easy to Understand",
      description:
        "Clean layout designed to present traditional calendar details in a clear and user-friendly format.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Access the Panchang calendar seamlessly on desktop, tablet, and mobile devices anytime, anywhere.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Panchang Calendar?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Get accurate daily Panchang details and plan your important activities wisely
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
