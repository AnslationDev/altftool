import React from "react";

const Features = () => {
  const features = [
    {
      title: "Check Latest npm Package Versions",
      description:
        "Instantly find the latest published version of any npm package, including scoped packages like @angular/core.",
    },
    {
      title: "Scoped Package Support",
      description:
        "Enter scoped names like @angular/core or @types/node and they resolve exactly like unscoped packages.",
    },
    {
      title: "Latest Version Details",
      description:
        "See the current latest published version along with its description, last-updated date, author, and homepage link.",
    },
    {
      title: "Always Live, Never Cached",
      description:
        "Every check queries the npm registry directly, so you always get the current dist-tags.latest version — never a stale or cached number.",
    },
    {
      title: "Fast & Lightweight",
      description:
        "Get accurate package version details instantly with a simple and efficient interface.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Check package versions seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Package Version Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Stay up to date with the latest package releases and dependency versions
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