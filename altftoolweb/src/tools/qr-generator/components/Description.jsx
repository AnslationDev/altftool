import React from "react";

const Description = () => {
  const features = [
    {
      title: "Instant QR Code Creation",
      description: "Generate QR codes instantly by entering any URL, text, or contact information.",
    },
    {
      title: "Customizable Design",
      description: "Choose colors, shapes, and logos to make your QR codes visually appealing.",
    },
    {
      title: "High Resolution Output",
      description: "Download QR codes in high resolution suitable for print or digital use.",
    },
    {
      title: "Safe and Secure",
      description: "All QR codes are generated locally in your browser without storing data online.",
    },
    {
      title: "Easy to Share",
      description: "Quickly copy or download your QR codes and share them with anyone instantly.",
    },
    {
      title: "Supports Multiple Data Types",
      description: "Generate QR codes for URLs, text messages, emails, and other common data formats.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4 mt-[-40]">
            How It Works ?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create, customize, and share QR codes in seconds
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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 hover:text-blue-600">
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

export default Description;