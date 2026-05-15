import React from "react";

const Features = () => {
  const features = [
    {
      title: "Interactive Canvas",
      description: "Uses HTML5 Canvas to render high-density, organic dot patterns similar to real medical plates.",
    },
    {
      title: "Vision Simulation",
      description: "Switch between normal vision, protanopia, deuteranopia, and more to see how others perceive the world.",
    },
    {
      title: "Timed Experience",
      description: "Optional timer per plate to simulate the speed required in professional screening environments.",
    },
    {
      title: "Result Analysis",
      description: "Get a detailed breakdown of your correct answers and educational insights into color vision types.",
    },
    {
      title: "Mobile Optimized",
      description: "Fully responsive design ensures the plates are readable and interactive on all screen sizes.",
    },
    {
      title: "Secure & Private",
      description: "All image generation and analysis happens locally in your browser. No data is ever sent to a server.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Color Blind Test?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            An educational tool designed to raise awareness about color vision deficiency
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-(--card) rounded-2xl shadow-md border border-(--border) p-6 sm:p-8 flex flex-col hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
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
