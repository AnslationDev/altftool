"use client";

import { ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

const HeroSection = () => {
  const scrollToBuilder = () => {
    const builderSection = document.getElementById("builder");
    builderSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-(--background)">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-(--primary)/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-(--accent)/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 border border-(--primary)/20 animate-scale-in">
          <Zap className="w-4 h-4 text-(--primary)" />
          <span className="text-sm font-medium text-(--primary)">
            Free • No Sign-up Required
          </span>
        </div>

        {/* Heading */}
        <h1 className="heading font-bold tracking-tight text-(--primary)">
          Build Perfect <span className="">UTM Links</span>
          <br />
          <span className="text-(--foreground)">in Seconds</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-(--muted-foreground) max-w-2xl mx-auto">
          Create properly formatted UTM-tagged URLs for your marketing
          campaigns. Track traffic sources with Google Analytics effortlessly.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button
            onClick={scrollToBuilder}
            className="
              inline-flex items-center gap-2
              px-8 py-4 rounded-xl
              font-semibold text-base 
               text-white          
              bg-(--primary)
              hover:opacity-90 hover:shadow-xl
              transition-all duration-300 cursor-pointer
            "
          >
            Start Building Now
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            className="
              inline-flex items-center
              px-8 py-4 rounded-xl
              font-semibold text-base
              border border-(--border)
              text-(--foreground)
              bg-(--background)
              hover:border-(--primary)
              hover:text-(--primary)
              hover:shadow-xl
              transition-all duration-300
            "
          >
            Learn More
          </button>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap gap-4 justify-center pt-8 animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-(--card) border border-(--border) shadow-sm">
            <Shield className="w-4 h-4 text-(--success)" />
            <span className="text-sm font-medium text-(--foreground)">
              Secure & Private
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-(--card) border border-(--border) shadow-sm">
            <Zap className="w-4 h-4 text-(--accent)" />
            <span className="text-sm font-medium text-(--foreground)">
              Instant Generation
            </span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-(--card) border border-(--border) shadow-sm">
            <TrendingUp className="w-4 h-4 text-(--primary)" />
            <span className="text-sm font-medium text-(--foreground)">
              Track Performance
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
