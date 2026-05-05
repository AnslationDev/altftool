import React from "react";

const Features = () => {
  const features = [
    {
      title: "Discover Thousands of Apps",
      description:
        "Browse a wide range of apps across categories including games, productivity, education, lifestyle, and more.",
    },
    {
      title: "Direct App Store Redirect",
      description:
        "Instantly redirect to the official App Store page to download apps safely and securely.",
    },
    {
      title: "Smart Search & Filtering",
      description:
        "Quickly find the apps you need using powerful search and category-based filtering options.",
    },
    {
      title: "Latest & Trending Apps",
      description:
        "Explore trending, top-rated, and newly released apps all in one place.",
    },
    {
      title: "Fast & Lightweight",
      description:
        "Optimized for speed to deliver quick results without unnecessary loading delays.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Seamlessly works across desktop, tablet, and mobile devices for smooth app discovery anywhere.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-10 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our App Finder?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Discover, explore, and download the best apps instantly
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
