import React from "react";

const Features = () => {
  const features = [
    {
      title: "Instant Domain Availability Check",
      description:
        "Quickly check whether your desired domain name is available for registration in seconds.",
    },
    {
      title: "Multiple TLD Support",
      description:
        "Search across popular domain extensions like .com, .net, .org, and more in one place.",
    },
    {
      title: "Accurate & Real-Time Results",
      description:
        "Get up-to-date availability status to help you secure your domain before someone else does.",
    },
    {
      title: "Smart Domain Suggestions",
      description:
        "If your preferred domain is taken, receive alternative name suggestions instantly.",
    },
    {
      title: "Fast & User-Friendly Interface",
      description:
        "Enter your domain name easily and get results with a clean, simple, and responsive design.",
    },
    {
      title: "Secure & Private Search",
      description:
        "Your domain searches are not stored or tracked. Browse safely and confidently.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Why Use Our Domain Checker?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Instantly check domain name availability and secure your perfect web address
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
