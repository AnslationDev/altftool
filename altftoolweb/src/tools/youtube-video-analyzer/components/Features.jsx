import React from "react";

const Features = () => {
  const features = [
    {
      icon: "🔍",
      title: "Video Analysis",
      description:
        "Extract comprehensive information from any YouTube video URL including metadata, thumbnails, and statistics.",
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description:
        "Get instant results with our optimized processing engine. No waiting, no delays — just pure speed.",
    },
    {
      icon: "📱",
      title: "Responsive Design",
      description:
        "Works perfectly on all devices — desktop, tablet, and mobile. A beautiful interface that adapts to your screen.",
    },
    {
      icon: "🎨",
      title: "Modern UI",
      description:
        "Clean, intuitive interface with smooth animations and modern design principles for the best user experience.",
    },
    {
      icon: "🔒",
      title: "Privacy First",
      description:
        "No data collection, no tracking. Everything runs in your browser. Your privacy is our priority.",
    },
    {
      icon: "🌐",
      title: "No Server Required",
      description:
        "Fully client-side application. No backend servers or API keys needed — just pure frontend magic.",
    },
  ];

  return (
    <section
      className="
        py-20 px-2 sm:px-4
        bg-(--background)
      "
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-16 px-2 sm:px-0">
          <h2
            className="
              text-3xl md:text-4xl font-extrabold
              text-(--foreground)
              mb-4
            "
          >
            Why Choose Our Video Viewer?
          </h2>
          <p
            className="
              text-base sm:text-xl
              text-(--muted-foreground)
              max-w-2xl mx-auto leading-relaxed
            "
          >
            Powerful features designed for the modern web
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                bg-(--card)
                rounded-2xl
                shadow-lg
                border border-(--border)
                p-5 sm:p-7
                flex flex-col
                hover:shadow-xl
                hover:-translate-y-2
                transition-all duration-300
              "
            >
              {/* Icon */}
              <div className="mb-5">
                <div
                  className="
                    w-14 h-14 sm:w-16 sm:h-16
                    rounded-xl flex items-center justify-center
                    bg-linear-to-r from-(--primary) to-(--primary-foreground)
                  "
                >
                  <span className="text-3xl sm:text-4xl text-(--primary-foreground)">
                    {feature.icon}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
                {feature.title}
              </h3>

              {/* Description */}
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
