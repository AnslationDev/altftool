import React from "react";

const Features = () => {
  const features = [
    {
      title: "Real-Time Sound Measurement",
      description:
        "Measure ambient noise levels instantly using your device microphone and see live decibel (dB) readings.",
    },
    {
      title: "Accurate dB Monitoring",
      description:
        "Track sound intensity levels with clear visual indicators to understand low, moderate, and high noise ranges.",
    },
    {
      title: "Live Visual Meter",
      description:
        "Interactive sound meter display that updates in real-time for easy monitoring and quick analysis.",
    },
    {
      title: "Noise Level Insights",
      description:
        "Understand whether your environment is quiet, normal, loud, or potentially harmful based on decibel values.",
    },
    {
      title: "Privacy-Focused",
      description:
        "All sound processing happens locally in your browser. No recordings are stored or shared.",
    },
    {
      title: "No App Installation Required",
      description:
        "Use directly from your browser without downloading any software or connecting to external servers.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Sound Decibel Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Measure noise levels instantly and monitor your environment with real-time accuracy
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