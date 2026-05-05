import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Language Translation",
      description:
        "Translate text between multiple languages instantly with fast and accurate results.",
    },
    {
      title: "Supports Multiple Languages",
      description:
        "Choose from a wide range of global languages for communication, study, or travel purposes.",
    },
    {
      title: "Real-Time Translation",
      description:
        "Get immediate translated output as you type, making conversations and writing seamless.",
    },
    {
      title: "Simple & User-Friendly Interface",
      description:
        "Clean and intuitive design that makes translating text quick and effortless on any device.",
    },
    {
      title: "Copy & Share Easily",
      description:
        "Copy translated text with one click and share it anywhere you need — messages, emails, or documents.",
    },
    {
      title: "Browser-Based & Secure",
      description:
        "Works directly in your browser with no installation required, keeping your text safe and private.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Text Translator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Translate text quickly and accurately across multiple languages in seconds
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