"use client";
import {
  Zap,
  RotateCcw,
  Clock,
  Globe,
  ShieldCheck,
  Smile,
} from "lucide-react";


import React from "react";
function FeatureCard({ icon, title, description }) {
  return (
    <div
      className="
          bg-(--card)
          border border-(--border)
          p-6
          rounded-2xl
          shadow-sm
          hover:shadow-xl
          transition-all
          transform
          hover:-translate-y-1
        "
    >
      <div className="mb-4 flex justify-center">
        {icon}
      </div>

      <h3 className="text-xl font-semibold mb-2 text-(--foreground)">
        {title}
      </h3>

      <p className="text-sm text-(--muted-foreground)">
        {description}
      </p>
    </div>
  );
}

export default function Feature() {



  return (
    <section className="w-full py-20 bg-(--background)">
      <div className="max-w-7xl mx-auto px-6 text-center">

        <h2 className="heading text-(--foreground) md:text-5xl mb-12">
          Why Use Our Tool?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          <FeatureCard
            title="Fast Encoding"
            description="Encode URLs instantly without waiting. Super fast and reliable."
            icon={<Zap className="h-12 w-12 text-(--primary)" />}
          />

          <FeatureCard
            title="Decode Easily"
            description="Decode any encoded URL safely with just one click."
            icon={<RotateCcw className="h-12 w-12 text-(--primary)" />}
          />

          <FeatureCard
            title="Time Saver"
            description="Quickly encode and decode URLs to save your time."
            icon={<Clock className="h-12 w-12 text-(--primary)" />}
          />

          <FeatureCard
            title="Free & Online"
            description="Use our tool anytime, anywhere. Completely free and browser based."
            icon={<Globe className="h-12 w-12 text-(--primary)" />}
          />

          <FeatureCard
            title="Secure"
            description="Your data is completely safe. We never store your URLs."
            icon={<ShieldCheck className="h-12 w-12 text-(--primary)" />}
          />

          <FeatureCard
            title="User Friendly"
            description="Easy to use interface. Anyone can encode or decode URLs in seconds."
            icon={<Smile className="h-12 w-12 text-(--primary)" />}
          />


        </div>
      </div>
    </section>
  );
}
