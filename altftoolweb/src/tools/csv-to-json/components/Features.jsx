import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant CSV to JSON Conversion",
      description:
        "Convert your CSV files into structured JSON format instantly with accurate data mapping.",
    },
    {
      title: "Supports Large Files",
      description:
        "Handle large CSV datasets efficiently without compromising speed or performance.",
    },
    {
      title: "Accurate Data Parsing",
      description:
        "Automatically detect headers and transform rows into properly formatted JSON objects.",
    },
    {
      title: "Copy & Download JSON Output",
      description:
        "Easily copy the converted JSON data or download it for use in your projects and applications.",
    },
    {
      title: "Secure & Browser-Based",
      description:
        "Your files are processed directly in your browser. No uploads, no data storage, complete privacy.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Use the tool seamlessly on desktop, tablet, or mobile devices with a clean and adaptive interface.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our CSV to JSON Converter?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Quickly transform CSV data into structured JSON format for development and data processing
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
