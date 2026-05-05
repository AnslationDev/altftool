import React from "react";

const Description = () => {
  const steps = [
    {
      title: "Add Flow Nodes",
      description:
        "Drag and drop different types of nodes like Start, Process, Decision, and End to begin building your flowchart.",
    },
    {
      title: "Connect the Steps",
      description:
        "Link nodes using arrows to define the logical flow of your process clearly and efficiently.",
    },
    {
      title: "Customize Content",
      description:
        "Edit text, rename nodes, and adjust structure to match your workflow requirements.",
    },
    {
      title: "Organize Layout",
      description:
        "Reposition and align nodes neatly to keep your flowchart clean and professional.",
    },
    {
      title: "Preview in Real Time",
      description:
        "Instantly see updates while editing to ensure your flow works exactly as planned.",
    },
    {
      title: "Download & Share",
      description:
        "Export your completed flowchart as a PDF and share it with your team or clients easily.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4 mt-[-30]">
            How It Works ?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create professional flowcharts in just a few simple steps
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, index) => (
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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 transition-all hover:text-blue-600">
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