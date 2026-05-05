import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant URL Shortening",
      description:
        "Convert long and complex links into clean, short URLs within seconds for easy sharing.",
    },
    {
      title: "Custom Short Links",
      description:
        "Create personalized short URLs with custom aliases to match your brand or campaign.",
    },
    {
      title: "One-Click Copy",
      description:
        "Copy your shortened link instantly and share it across social media, emails, or messages.",
    },
    {
      title: "Secure & Reliable",
      description:
        "Generate safe and secure short links with reliable redirection for seamless user experience.",
    },
    {
      title: "Mobile-Friendly Design",
      description:
        "Fully responsive interface that works smoothly on desktop, tablet, and mobile devices.",
    },
    {
      title: "No Installation Required",
      description:
        "Use directly in your browser without any downloads or complex setup.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Link Shortener?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Shorten, customize, and share your URLs quickly and securely
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