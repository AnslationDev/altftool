import React from "react";

const Features = () => {
  const features = [
    {
      title: "Creative Username Ideas",
      description:
        "Generate unique and catchy usernames instantly for social media, gaming, or online platforms.",
    },
    {
      title: "Customizable Options",
      description:
        "Add keywords, numbers, prefixes, or suffixes to create personalized username combinations.",
    },
    {
      title: "Multiple Style Variations",
      description:
        "Choose from cool, aesthetic, professional, funny, or random username styles.",
    },
    {
      title: "Instant Generation",
      description:
        "Get dozens of username suggestions in seconds with fast and smooth performance.",
    },
    {
      title: "One-Click Copy",
      description:
        "Easily copy your favorite username and use it anywhere without hassle.",
    },
    {
      title: "Browser-Based & Free",
      description:
        "Use the tool directly in your browser with no sign-up or installation required.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Username Generator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create unique, stylish, and memorable usernames in seconds
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