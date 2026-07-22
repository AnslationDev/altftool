import React from "react";

const Features = () => {
  const features = [
    {
      title: "AI-Powered Generation",
      description:
        "Paste your notes or text, and our AI intelligently extracts key concepts to create flashcards automatically.",
    },
    {
      title: "Interactive 3D Study",
      description:
        "Experience a tactile learning flow with smooth 3D flip animations and mobile-optimized touch controls.",
    },
    {
      title: "Multiple Study Modes",
      description:
        "Choose between Smart Review, Quiz Mode (typing), or Rapid Fire (timed) to suit your learning style.",
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor your learning efficiency with detailed insights into difficulty mix, streaks, and session accuracy.",
    },
    {
      title: "Local Persistence",
      description:
        "All your decks are saved securely in your browser's local storage. No account required, total privacy.",
    },
    {
      title: "Data Portability",
      description:
        "Export your entire flashcard collection as JSON for backup or to use in other compatible study applications.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-(--foreground) mb-4">
            Master Any Subject Faster
          </h2>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed font-medium">
            Powerful tools designed to help you memorize, understand, and recall information efficiently.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-[var(--card)]
                rounded-2xl
                shadow-lg
                border border-[var(--border)]
                p-8
                flex flex-col
                hover:shadow-2xl
                hover:-translate-y-2
                transition-all duration-500
              "
            >
              <h3 className="text-xl font-black text-(--foreground) mb-4">
                {feature.title}
              </h3>

              <p className="text-sm text-(--muted-foreground) leading-relaxed font-medium">
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
