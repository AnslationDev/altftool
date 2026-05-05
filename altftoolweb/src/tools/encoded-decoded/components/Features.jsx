import React from "react";

const Features = () => {
  const features = [
    {
      title: "Enter Source Text",
      description:
        "Paste or type the text you want to process into the input fields.",
    },
    {
      title: "Choose Operation",
      description:
        "Select whether you want to Encode or Decode your data.",
    },
    {
      title: "Select Format",
      description:
        "Pick from Base64, URL, Hex, or other supported standards.",
    },
    {
      title: "Instant Preview",
      description:
        "See the converted result in real-time as you type or change settings.",
    },
    {
      title: "Copy Result",
      description:
        "One-click copy to clipboard to use the output in your projects.",
    },
    {
      title: "Clear & Repeat",
      description:
        "Reset the fields instantly to start a new conversion quickly.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Encode & Decode Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Easily convert text between encoded and decoded formats for development and data handling
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
