import React from "react";

const Features = () => {
  const features = [
    {
      title: "Easy UTM Parameter Creation",
      description:
        "Generate custom UTM parameters for your URLs to accurately track marketing campaigns across platforms.",
    },
    {
      title: "Campaign Tracking Made Simple",
      description:
        "Add source, medium, campaign, term, and content parameters effortlessly for detailed analytics insights.",
    },
    {
      title: "Instant Link Generation",
      description:
        "Create fully formatted UTM tracking links instantly without any technical knowledge.",
    },
    {
      title: "Error-Free URL Formatting",
      description:
        "Automatically structure and encode your URLs to prevent tracking errors and broken links.",
    },
    {
      title: "Marketing Performance Insights",
      description:
        "Track traffic sources effectively and measure campaign performance in tools like Google Analytics.",
    },
    {
      title: "Secure & Browser-Based",
      description:
        "Works entirely in your browser with no data storage, keeping your campaign links private and secure.",
    },
  ];

  return (
    <section className="py-16  px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our UTM Link Builder?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Build accurate tracking URLs and measure your marketing campaigns with precision
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