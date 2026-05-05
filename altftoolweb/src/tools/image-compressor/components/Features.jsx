import React from "react";

const Features = () => {
  const features = [
    {
      title: "Fast Image Compression",
      description:
        "Reduce image file size instantly without noticeable loss in quality for faster uploads and sharing.",
    },
    {
      title: "High-Quality Optimization",
      description:
        "Smart compression algorithms maintain image clarity while significantly lowering file size.",
    },
    {
      title: "Supports Multiple Formats",
      description:
        "Compress popular image formats including JPG, PNG, and WebP with ease.",
    },
    {
      title: "Custom Compression Levels",
      description:
        "Adjust compression settings to balance between image quality and file size according to your needs.",
    },
    {
      title: "Secure & Private Processing",
      description:
        "Your images are processed securely with no data storage or tracking involved.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Use the image compressor smoothly on desktop, tablet, or mobile devices anytime.",
    },
  ];

  return (
    <section className="py-10 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Image Compressor?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Optimize your images for faster performance without sacrificing quality
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