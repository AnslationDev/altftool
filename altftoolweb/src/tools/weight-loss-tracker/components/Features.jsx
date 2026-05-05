import React from "react";

const Features = () => {
  const features = [
    {
      title: "Track Your Weight Progress",
      description:
        "Log your weight regularly and monitor your progress over time with clear tracking tools.",
    },
    {
      title: "Visual Progress Insights",
      description:
        "View your weight changes in an easy-to-understand format to stay motivated and consistent.",
    },
    {
      title: "Set Personal Goals",
      description:
        "Define your target weight and track how close you are to achieving your fitness goals.",
    },
    {
      title: "Daily & Weekly Monitoring",
      description:
        "Record updates daily or weekly to maintain discipline and see steady improvements.",
    },
    {
      title: "Simple & User-Friendly Interface",
      description:
        "Clean and intuitive design makes tracking your weight quick and hassle-free.",
    },
    {
      title: "Private & Secure",
      description:
        "Your health data stays safe and accessible only to you while using the tracker.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Weight Loss Tracker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Stay motivated, monitor your progress, and achieve your fitness goals effectively
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