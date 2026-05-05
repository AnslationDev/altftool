import React from "react";

const Features = () => {
  const features = [
    {
      title: "Real-Time Markdown Preview",
      description:
        "Write Markdown on one side and instantly see the formatted preview update in real time.",
    },
    {
      title: "Live Syntax Highlighting",
      description:
        "Enjoy clean and readable Markdown editing with proper syntax highlighting support.",
    },
    {
      title: "Supports Standard Markdown",
      description:
        "Fully compatible with headings, lists, links, images, code blocks, tables, and more.",
    },
    {
      title: "Side-by-Side Editor",
      description:
        "Edit and preview your content simultaneously for faster writing and formatting.",
    },
    {
      title: "Secure & Private",
      description:
        "All processing happens directly in your browser — your content is never stored or shared.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Use the Markdown preview tool seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Markdown Preview Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Write, format, and preview Markdown content instantly with ease
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