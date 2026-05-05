import React from "react";

const Features = () => {
  const features = [
    {
      title: "Generate API Documentation Instantly",
      description:
        "Create clean and structured API documentation in seconds from your endpoints and parameters.",
    },
    {
      title: "Organized Endpoint Structure",
      description:
        "Automatically format routes, request methods, headers, query parameters, and response examples.",
    },
    {
      title: "Developer-Friendly Format",
      description:
        "Produce readable and professional documentation suitable for teams, clients, and public APIs.",
    },
    {
      title: "Code Examples Included",
      description:
        "Add sample requests and responses to help developers understand how to integrate your API quickly.",
    },
    {
      title: "Easy Editing & Export",
      description:
        "Edit documentation easily and export it for sharing, publishing, or internal use.",
    },
    {
      title: "Fully Responsive Interface",
      description:
        "Create and manage API documentation seamlessly across desktop, tablet, and mobile devices.",
    },
  ];

  return (
    <section className="py-8 sm:py-15 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our API Documentation Maker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Build clear, professional API documentation to simplify integration and development
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