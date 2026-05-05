"use client";

import { Zap, Star, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Fast & Simple",
    description:
      "No sign-ups, no installations. Just instant access to powerful tools.",
  },
  {
    icon: Star,
    title: "Curated Content",
    description:
      "Handpicked tools tested for quality, reliability, and ease of use.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data stays yours. We don’t track, store, or sell your information.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section">
      {/* <div className=" mx-auto  px-0 space-y-8"> */}

      {/* Header */}
      <div className="section-header">
        <h2 className="section-title">
          Why <span className="text-[var(--primary)]">Choose Us</span>
        </h2>

        <p className="section-subtitle">
          The best tool discovery platform for creators, developers, and businesses
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 mt-12  rounded-2xl overflow-hidden">

        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.title}
              className={`px-8 py-10 lg:px-12 lg:py-14 text-center  transition  ${index !== features.length - 1
                ? "md:border-r border-[var(--border)]"
                : ""
                }`}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6 lg:mb-8">
                <div className="p-3 lg:p-4 rounded-full bg-[var(--badge-bg)] shadow-md">
                  <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--foreground)]" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4 text-[var(--foreground)]">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="leading-relaxed text-[var(--secondary-foreground)] text-sm md:text-base lg:text-lg">
                {feature.description}
              </p>
            </div>
          );
        })}

      </div>
      {/* </div> */}
    </section>
  );
}