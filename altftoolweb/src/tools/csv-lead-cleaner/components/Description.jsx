import React from "react";

const Description = () => {
  const steps = [
    {
      title: "Upload Your CSV File",
      description:
        "Simply upload your raw lead CSV file directly into the tool. No login or signup required.",
    },
    {
      title: "Auto Detect Columns",
      description:
        "The system automatically detects key columns like email, phone, and name for proper cleaning.",
    },
    {
      title: "Remove Duplicate Leads",
      description:
        "Instantly eliminate duplicate records to keep your lead list clean and organized.",
    },
    {
      title: "Clean & Normalize Data",
      description:
        "Standardize formatting, fix capitalization, and normalize inconsistent data fields.",
    },
    {
      title: "Preview Cleaned Results",
      description:
        "Review your cleaned data in a preview table before downloading the final version.",
    },
    {
      title: "Download CRM-Ready CSV",
      description:
        "Export your optimized and cleaned lead list ready to upload into any CRM system.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 mt-[-150]">
          <h2 className="text-3xl sm:text-4xl  text-(--foreground) mb-4">
            How It Works?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Clean your CSV leads in 6 simple steps
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="
                group
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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 transition-colors duration-300 group-hover:text-(--primary)">
                {step.title}
              </h3>

              <p className="text-sm sm:text-base text-(--muted-foreground) leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Description;