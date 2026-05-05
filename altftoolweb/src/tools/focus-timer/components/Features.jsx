import React from "react";

const Features = () => {
  const features = [
    {
      title: "Customizable Focus Sessions",
      description:
        "Set your preferred focus and break durations to match your workflow and productivity style.",
    },
    {
      title: "Pomodoro Technique Support",
      description:
        "Use structured work intervals with short and long breaks to stay productive without burnout.",
    },
    {
      title: "Distraction-Free Interface",
      description:
        "Minimal and clean design that helps you stay focused on your task without unnecessary distractions.",
    },
    {
      title: "Session Tracking",
      description:
        "Keep track of completed focus sessions to measure your daily productivity progress.",
    },
    {
      title: "Sound & Visual Alerts",
      description:
        "Get gentle notifications when it’s time to start, pause, or take a break.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Access your focus timer seamlessly on desktop, tablet, and mobile devices anytime.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Focus Timer Tool ?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Boost productivity, improve concentration, and manage your time effectively
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