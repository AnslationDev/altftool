import React from "react";

const HowItWorks = () => {
  const steps = [
    {
      title: "Enter Your Details",
      description:
        "Fill in your name, company, phone number, email and other required details in the form.",
    },
    {
      title: "Customize Design",
      description:
        "Choose your preferred colors, layout style and card structure to match your brand.",
    },
    {
      title: "Live Preview",
      description:
        "Instantly see how your business card looks while making changes.",
    },
    {
      title: "Adjust & Finalize",
      description:
        "Fine-tune spacing, text alignment and other details for a perfect layout.",
    },
    {
      title: "Generate Card",
      description:
        "Click the generate button to create your professional business card instantly.",
    },
    {
      title: "Download & Use",
      description:
        "Download your print-ready business card and start using it immediately.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 mt-[-80]">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            How It Works?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create your professional business card in just a few simple steps
          </p>
        </div>

        {/* Cards Grid */}
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
              {/* Step Number */}
              <span className="text-sm font-semibold text-(--muted-foreground) mb-2">
                Step {index + 1}
              </span>

              {/* Heading Blue by Default */}
              <h3 className="text-lg sm:text-xl font-bold text-blue-600 mb-3">
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

export default HowItWorks;
