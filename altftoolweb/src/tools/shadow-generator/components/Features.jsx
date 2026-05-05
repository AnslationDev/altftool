import React from "react";

const Features = () => {
  const features = [
    {
      title: "Custom Box Shadow Generator",
      description:
        "Create beautiful CSS box-shadow effects instantly with adjustable blur, spread, offset, and color controls.",
    },
    {
      title: "Real-Time Preview",
      description:
        "See live shadow changes as you tweak settings and instantly visualize the perfect depth and elevation.",
    },
    {
      title: "Text Shadow Support",
      description:
        "Generate stylish text-shadow effects for headings, buttons, and UI elements with ease.",
    },
    {
      title: "Copy CSS Code Instantly",
      description:
        "One-click copy feature lets you grab clean, production-ready CSS shadow code for your project.",
    },
    {
      title: "Modern UI-Friendly Presets",
      description:
        "Choose from ready-made shadow presets designed for cards, buttons, modals, and modern web interfaces.",
    },
    {
      title: "Fully Browser-Based",
      description:
        "Lightweight frontend tool that works instantly in your browser with no backend or installation required.",
    },
  ];

  return (
    <section className="pb-16 sm:pb-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Shadow Generator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Design stunning CSS shadows quickly and enhance your UI with professional depth effects
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