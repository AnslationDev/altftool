import React from "react";

const Features = () => {
  const features = [
    {
      title: "Create Memes Instantly",
      description:
        "Generate funny and viral memes in seconds using popular meme templates or your own images.",
    },
    {
      title: "Custom Text Editing",
      description:
        "Add top and bottom text, customize font size, color, and alignment to match your style.",
    },
    {
      title: "Upload Your Own Images",
      description:
        "Turn your personal photos into share-worthy memes with easy editing tools.",
    },
    {
      title: "High-Quality Downloads",
      description:
        "Download your memes in high resolution, ready to share on social media platforms.",
    },
    {
      title: "No Watermarks",
      description:
        "Create and download memes without unwanted watermarks or restrictions.",
    },
    {
      title: "Fully Responsive Design",
      description:
        "Design memes smoothly on desktop, tablet, or mobile devices anytime, anywhere.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Meme Generator?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create hilarious, shareable memes quickly and effortlessly
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