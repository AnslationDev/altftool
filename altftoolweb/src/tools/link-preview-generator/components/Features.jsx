import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Link Preview",
      description:
        "Generate rich previews for any URL instantly, including title, description, and featured image.",
    },
    {
      title: "Meta Tag Extraction",
      description:
        "Automatically fetch Open Graph and meta tag data to display accurate link information.",
    },
    {
      title: "Social Media Ready",
      description:
        "Preview how your link will appear when shared on social platforms before posting.",
    },
    {
      title: "Accurate & Fast Results",
      description:
        "Retrieve preview data quickly with optimized processing for smooth performance.",
    },
    {
      title: "Simple & Clean Interface",
      description:
        "User-friendly design that makes generating link previews quick and effortless.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Generate and view link previews seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Link Preview Generator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Generate accurate link previews and optimize your sharing experience
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