import React from "react";

const Features = () => {
  const features = [
    {
      title: "Add Watermark to PDF Online",
      description:
        "Insert text or image watermarks into your PDF files quickly and easily directly from your browser.",
    },
    {
      title: "Custom Text & Image Watermarks",
      description:
        "Add personalized text, logos, or brand images as watermarks with full customization options.",
    },
    {
      title: "Adjust Position & Transparency",
      description:
        "Control watermark placement, size, rotation, and opacity to match your document design.",
    },
    {
      title: "Batch Watermark Support",
      description:
        "Apply watermarks to multiple PDF pages at once for fast and efficient document protection.",
    },
    {
      title: "Secure & Private Processing",
      description:
        "Your PDF files are processed securely with no data storage or third-party sharing.",
    },
    {
      title: "Fully Responsive PDF Tool",
      description:
        "Add watermarks to PDF files seamlessly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our PDF Watermark Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Protect and brand your PDF documents by adding custom watermarks online
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