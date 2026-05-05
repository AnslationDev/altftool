import React from "react";

const Features = () => {
  const features = [
    {
      title: "Reorder PDF Pages Online",
      description:
        "Easily rearrange PDF pages in any order with simple drag-and-drop controls to organize your document perfectly.",
    },
    {
      title: "Delete Unwanted PDF Pages",
      description:
        "Remove specific pages from your PDF file instantly to clean up unnecessary or sensitive content.",
    },
    {
      title: "Live PDF Preview",
      description:
        "Preview your PDF pages before downloading to ensure the correct order and accurate edits.",
    },
    {
      title: "Fast & Secure PDF Editing",
      description:
        "Edit PDF files directly in your browser with secure processing and no data storage.",
    },
    {
      title: "Maintain Original Quality",
      description:
        "Reorder and delete pages without affecting the original formatting or document quality.",
    },
    {
      title: "Fully Responsive PDF Tool",
      description:
        "Rearrange and manage PDF pages seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-18 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our PDF Purifier Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Reorder, preview, and delete PDF pages online quickly and securely
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