import React from "react";

const Features = () => {
  const features = [
    {
      title: "Real-Time Speech Recognition",
      description:
        "Convert your spoken words into accurate text instantly using advanced speech recognition technology.",
    },
    {
      title: "High Accuracy Transcription",
      description:
        "Experience precise voice-to-text conversion with minimal errors for better productivity.",
    },
    {
      title: "Supports Multiple Languages",
      description:
        "Transcribe speech in various languages for meetings, notes, and content creation.",
    },
    {
      title: "Instant Copy & Edit",
      description:
        "Easily copy, edit, and use the generated text for documents, emails, or messages.",
    },
    {
      title: "Hands-Free Productivity",
      description:
        "Save time by speaking instead of typing, perfect for multitasking and quick note-taking.",
    },
    {
      title: "Secure & Browser-Based",
      description:
        "Runs directly in your browser with no installation required and keeps your voice data private.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-(--background)">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Voice to Text Tool?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Convert speech into accurate text instantly and boost your productivity
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