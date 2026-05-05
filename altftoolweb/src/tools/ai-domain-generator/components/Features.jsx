import React from "react";

const Features = () => {
  const features = [
    {
      title: "Smart Domain Suggestions",
      description:
        "Generate creative and unique domain name ideas instantly based on your keywords and business niche.",
    },
    {
      title: "Instant Availability Check",
      description:
        "Quickly check if your desired domain name is available so you can secure it before someone else does.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Works seamlessly across desktop, tablet, and mobile devices for smooth browsing anywhere.",
    },
    {
      title: "Keyword-Based Generator",
      description:
        "Enter one or multiple keywords and get optimized, brandable domain name combinations in seconds.",
    },
    {
      title: "Privacy Friendly",
      description:
        "No tracking, no data storage. Everything runs securely in your browser to protect your ideas.",
    },
    {
      title: "No API Required",
      description:
        "Lightweight frontend-based tool that generates domain ideas without requiring complex backend setup.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Domain Generator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Find the perfect domain name for your brand in seconds
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
