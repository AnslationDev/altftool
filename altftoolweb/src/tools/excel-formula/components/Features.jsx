import React from "react";

const Features = () => {
  const features = [
    {
      title: "Search Excel Formulas Instantly",
      description:
        "Quickly find the right Excel formula by searching with keywords or function names.",
    },
    {
      title: "Discover Popular & Advanced Functions",
      description:
        "Explore commonly used formulas like VLOOKUP, IF, SUM, INDEX, MATCH, and more advanced functions.",
    },
    {
      title: "Clear Syntax & Examples",
      description:
        "View formula syntax along with practical examples to understand how each function works.",
    },
    {
      title: "Boost Productivity",
      description:
        "Save time by finding ready-to-use formulas instead of searching through documentation manually.",
    },
    {
      title: "Beginner to Advanced Friendly",
      description:
        "Whether you're a student, analyst, or professional, easily discover formulas suited to your level.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Access Excel formulas seamlessly on desktop, tablet, and mobile devices anytime you need them.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Excel Formula Finder?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Search and discover Excel formulas to boost your productivity and simplify your work
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
