import React from "react";

const Description = () => {
  const steps = [
    {
      title: "Select Colors",
      description:
        "Pick your favorite two colors to create a custom gradient for your project.",
    },
    {
      title: "Adjust Angle",
      description:
        "Change the angle of the gradient to get the exact direction you want.",
    },
    {
      title: "Preview Live",
      description:
        "See a real-time preview of your gradient before copying the CSS.",
    },
    {
      title: "Use Presets",
      description:
        "Quickly choose from popular gradient presets to save time and effort.",
    },
    {
      title: "Copy CSS",
      description:
        "Copy the generated CSS code with one click and use it in your project.",
    },
    {
      title: "Apply Anywhere",
      description:
        "Use your gradient on buttons, backgrounds, cards, or any web element.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            How It Works ?
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
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
                {step.title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;