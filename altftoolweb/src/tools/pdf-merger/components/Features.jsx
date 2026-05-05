import React from "react";

const Features = () => {
  const features = [
    {
      title: "Merge Multiple PDFs Easily",
      description:
        "Combine multiple PDF files into a single document in just a few clicks.",
    },
    {
      title: "Drag & Drop Upload",
      description:
        "Simply drag and drop your PDF files to arrange and merge them quickly.",
    },
    {
      title: "Custom File Order",
      description:
        "Rearrange pages or documents before merging to create the perfect final file.",
    },
    {
      title: "Fast & Secure Processing",
      description:
        "Your files are processed quickly with complete privacy and no data storage.",
    },
    {
      title: "High-Quality Output",
      description:
        "Maintain original formatting and quality while merging your PDF documents.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Merge PDF files seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our PDF Merger Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Combine your PDF documents quickly, securely, and effortlessly
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