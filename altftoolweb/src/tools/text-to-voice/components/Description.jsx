import React from "react";

const Description = () => {
  const features = [
    {
      title: "Instant Text to Speech",
      description:
        "Convert written text into natural-sounding speech instantly with high-quality voice output.",
    },
    {
      title: "Multiple Voice Options",
      description:
        "Choose from different voices, accents, and languages to match your preference or project needs.",
    },
    {
      title: "Adjustable Speed & Pitch",
      description:
        "Customize speech rate and pitch to create the perfect listening experience.",
    },
    {
      title: "Real-Time Audio Playback",
      description:
        "Listen to your generated voice output immediately without downloads or delays.",
    },
    {
      title: "Accessibility Friendly",
      description:
        "Ideal for students, content creators, and users who prefer listening over reading.",
    },
    {
      title: "Browser-Based & Secure",
      description:
        "Works directly in your browser with no installation required and keeps your text private.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Text to Voice Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Convert text into clear, natural speech quickly and effortlessly
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

export default Description;