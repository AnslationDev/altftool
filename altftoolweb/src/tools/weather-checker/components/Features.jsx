import React from "react";

const Features = () => {
  const features = [
    {
      title: "Real-Time Weather Updates",
      description:
        "Get live weather information including temperature, humidity, and wind speed for any location.",
    },
    {
      title: "Search by City or Location",
      description:
        "Enter any city name to instantly check the current weather conditions worldwide.",
    },
    {
      title: "Detailed Weather Insights",
      description:
        "View important details like feels-like temperature, pressure, visibility, and weather conditions.",
    },
    {
      title: "Clean & Easy Interface",
      description:
        "Simple and user-friendly design for quick weather checks on any device.",
    },
    {
      title: "Fast & Accurate Results",
      description:
        "Receive up-to-date and reliable weather data within seconds.",
    },
    {
      title: "Mobile Responsive Design",
      description:
        "Works seamlessly across desktop, tablet, and mobile devices for weather updates anytime, anywhere.",
    },
  ];

  return (
    <section className=" pt-10 sm:py-16 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Weather Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Check accurate and real-time weather conditions for any city instantly
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