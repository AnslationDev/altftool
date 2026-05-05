import React from "react";

const Features = () => {
  const features = [
    {
      title: "Open Multiple URLs at Once",
      description:
        "Paste multiple website links and open them simultaneously in separate tabs with a single click.",
    },
    {
      title: "Fast & Efficient Workflow",
      description:
        "Save time by eliminating the need to open each link manually — perfect for research, SEO, and daily tasks.",
    },
    {
      title: "Simple Copy & Paste Input",
      description:
        "Easily add multiple URLs by pasting them line-by-line into the input box for instant processing.",
    },
    {
      title: "Browser-Based & Secure",
      description:
        "Runs directly in your browser with no server involvement. Your links are never stored or tracked.",
    },
    {
      title: "Lightweight & Instant",
      description:
        "Optimized for speed to open links quickly without unnecessary delays or complex setup.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Works smoothly across desktop, tablet, and mobile devices for convenient access anywhere.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Bulk URL Opener?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Open multiple website links instantly and boost your productivity
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
