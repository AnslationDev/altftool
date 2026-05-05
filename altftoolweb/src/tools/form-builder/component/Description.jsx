// component/Description.jsx
import React from "react";

const Description = () => {
  const descriptions = [
    {
      title: "Drag & Drop Builder",
      description:
        "Easily create custom forms using a simple drag-and-drop interface without any coding.",
    },
    {
      title: "Custom Fields",
      description:
        "Add a variety of field types like text, email, number, checkbox, radio, file upload, and more.",
    },
    {
      title: "Responsive Forms",
      description:
        "Forms automatically adapt to desktop, tablet, and mobile devices for optimal user experience.",
    },
    {
      title: "Preview Mode",
      description:
        "See how your form looks in real-time before publishing or sharing it with users.",
    },
    {
      title: "Save & Restore",
      description:
        "Your form data is stored locally, allowing you to save progress and resume editing anytime.",
    },
    {
      title: "Submit & Export",
      description:
        "Collect responses and export them in JSON or CSV format for easy analysis.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4 mt-[-60]">
            How It Works ?
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {descriptions.map((item, index) => (
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
                group
              "
            >
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 group-hover:text-blue-500 transition-colors duration-300">
                {item.title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;