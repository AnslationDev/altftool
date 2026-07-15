import React from "react";

const Description = () => {
  const features = [
    {
      title: "Real-Time Generation",
      description:
        "QR codes update instantly as you type. No refresh or button clicks needed.",
    },
    {
      title: "Multiple QR Types",
      description:
        "Generate QR codes for URLs, text, emails, phone numbers, SMS, WhatsApp, Wi-Fi, contacts, locations, and calendar events.",
    },
    {
      title: "Full Customization",
      description:
        "Adjust size, foreground and background colors, error correction level, margin, and transparent backgrounds.",
    },
    {
      title: "Logo Embedding",
      description:
        "Upload and center your brand logo inside the QR code for a professional touch.",
    },
    {
      title: "Multiple Export Formats",
      description:
        "Download your QR codes as PNG, SVG, or JPEG with a single click.",
    },
    {
      title: "Private & Secure",
      description:
        "All QR codes are generated locally in your browser. No data is sent to any server.",
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background)">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-(--foreground) mb-4 mt-[-40]">
            How It Works?
          </h2>
          <p className="text-base sm:text-lg text-(--muted-foreground) max-w-2xl mx-auto leading-relaxed">
            Create, customize, and download QR codes in seconds
          </p>
        </div>

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
              <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-3 hover:text-(--primary)">
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
