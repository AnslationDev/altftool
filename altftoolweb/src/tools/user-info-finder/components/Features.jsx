"use client";
import React from "react";
import {
  Search,
  Gauge,
  ShieldCheck,
  CloudCheck,
  UserSearch,RefreshCw
} from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Search className="w-10 h-10 text-(--primary)" />,
      title: "Quick Search",
      description:
        "Find users instantly by name or email with our fast search engine.",
    },
    {
      icon: <Gauge className="w-10 h-10" />,
      title: "Lightning Fast",
      description: "Get results in milliseconds with optimized performance.",
    },
    {
      icon: <ShieldCheck className="w-10 h-10" />,
      title: "Secure & Private",
      description: "Your searches are encrypted and completely private.",
    },
    {
      icon: <CloudCheck className="w-10 h-10" />,
      title: "Cloud Based",
      description:
        "Access user data from anywhere, anytime with cloud storage.",
    },
    {
      icon: <UserSearch className="w-10 h-10" />,
      title: "Advanced Filters",
      description: "Filter and sort results to find exactly what you need.",
    },
    {
  icon: <RefreshCw className="w-10 h-10" />,
  title: "Real-Time Updates",
  description:
    "Get live user data updates instantly without refreshing the page.",
}
  ];

  return (
    <div className="py-6 sm:py-16 px-4 bg-(--background)">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-(--foreground) mb-3">
            Why Choose User Finder?
          </h2>

          <p className="text-(--muted-foreground) max-w-2xl mx-auto text-base sm:text-lg">
            Powerful features designed to make user search simple and efficient.
          </p>
        </div>

        {/* Features Grid */}
        <div
          className="
          grid grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          gap-6 sm:gap-8
        "
        >
          {features.map((item, i) => (
            <div
              key={i}
              className="
                rounded-3xl p-6 sm:p-8 text-center
                bg-(--card) border border-(--border)
                backdrop-blur-xl
                transition-all duration-300
                hover:-translate-y-2 hover:shadow-xl 
              "
            >
              {/* Icon */}
              <div
                className="
                  w-20 h-20 rounded-full
                  bg-(--muted) border border-(--border)
                  flex items-center justify-center mx-auto mb-5
                text-(--primary)
                "
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3
                className="
                text-xl sm:text-2xl font-semibold 
                text-(--foreground) mb-2
              "
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                className="
                text-(--muted-foreground)
                leading-relaxed text-sm sm:text-base
              "
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
