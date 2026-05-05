import React from "react";

const Features = () => {
  const features = [
    {
      title: "Convert Images to Video Instantly",
      description:
        "Turn your images into engaging videos within seconds directly in your browser — no complex setup required.",
    },
    {
      title: "100% Client-Side Processing",
      description:
        "Everything runs locally in your browser. No backend servers, no uploads, and no waiting time.",
    },
    {
      title: "Custom Duration & Order",
      description:
        "Adjust image display duration and arrange photos in your preferred sequence for the perfect slideshow.",
    },
    {
      title: "High-Quality Video Output",
      description:
        "Generate smooth and clear video files optimized for sharing on social media or presentations.",
    },
    {
      title: "Privacy First",
      description:
        "Your images never leave your device. No data storage or tracking — full privacy guaranteed.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Create videos seamlessly on desktop, tablet, or mobile devices anytime, anywhere.",
    },
  ];

  return (
    <section className="py-8 sm:py-10 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Image to Video Converter?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create stunning videos from your images — fast, secure, and completely browser-based
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