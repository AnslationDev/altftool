import React from "react";
import FeatureCard from "./FeatureCard";
import { Wand2, ArrowRight, SlidersHorizontal, Zap, Code } from "lucide-react";

const LandingPage = ({ onStart }) => {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="py-12  bg-(--background)">
        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Heading */}
          <h1 className="heading">CSS Shadows Made Simple</h1>

          {/* Sub-heading */}
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto text-(--muted-foreground) mb-8">
            Generate complex, layered, and beautiful CSS box-shadows visually.
            Copy the code instantly and streamline your frontend workflow.
          </p>

          {/* CTA */}
          {/* <button
            onClick={onStart}
            className="bg-(--primary) text-(--primary-foreground)
              px-6 py-3 rounded-xl
              text-lg font-semibold
              flex items-center gap-2 mx-auto
              shadow hover:shadow-lg 
              transition cursor-pointer"
          >
            Start Creating <ArrowRight className="w-5 h-5" />
          </button> */}

          {/* Visual Demo */}
          <div className="mt-16 flex justify-center perspective-[1000px]">
            <div
              className="
                w-48 md:w-72 h-48 md:h-72
                bg-(white) rounded-2xl
                flex items-center justify-center
                shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]
                transition-transform
                hover:scale-105 hover:rotate-x-0 hover:rotate-y-0
                rotate-x-20 rotate-y-[-10deg]
              "
            >
              <Wand2 className="text-(--primary) opacity-80 w-20 h-20" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-10 bg-(--background)">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-(--foreground) mb-3">
            Why ShadowCraft?
          </h2>

          <p className="text-center text-(--muted-foreground) max-w-xl mx-auto mb-12">
            Everything you need to create the perfect depth for your UI
            elements.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<SlidersHorizontal className="text-(--primary) w-8 h-8" />}
              title="Precise Control"
              description="Fine-tune offsets, blur, spread, and opacity with intuitive sliders."
            />

            <FeatureCard
              icon={<Zap className="text-red-500 w-8 h-8" />}
              title="Instant Preview"
              description="See your changes immediately on a live preview element."
            />

            <FeatureCard
              icon={<Code className="text-green-600 w-8 h-8" />}
              title="Clean CSS"
              description="Copy optimized CSS code ready for production."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      {/* <section className="py-16 bg-(--background)">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-(--foreground) mb-10">
            How It Works
          </h2> */}

      {/* Stepper */}
      {/* <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[1, 2, 3].map((num) => (
              <div key={num}>
                <div className="w-16 h-16 bg-(--primary) text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                  {num}
                </div>
                <p className="font-semibold text-(--foreground)">
                  {num === 1
                    ? "Adjust Properties"
                    : num === 2
                      ? "Style & Color"
                      : "Copy Code"}
                </p>
              </div>
            ))}
          </div> */}

      {/* <div className="grid sm:grid-cols-3 gap-6 mt-10 text-center">
            <p className="text-(--muted-foreground)">
              Control horizontal & vertical offset, blur radius, and spread.
            </p>
            <p className="text-(--muted-foreground)">
              Select colors, adjust opacity, toggle inset mode.
            </p>
            <p className="text-(--muted-foreground)">
              Copy your generated CSS box-shadow instantly.
            </p>
          </div>
        </div>
      </section> */}

      {/* CTA SECTION */}
      <section className="py-16 bg-(--background) text-center px-4">
        <div className="max-w-xl mx-auto">
          <h3 className="text-3xl font-bold text-(--foreground) mb-2">
            Ready to design?
          </h3>

          <p className="text-(--muted-foreground) mb-6">
            Join thousands of developers using ShadowCraft to enhance their UI.
          </p>

          <button
            onClick={onStart}
            className="
              bg-(--primary) text-(--primary-foreground)
              px-8 py-3
              rounded-xl text-lg font-semibold
              hover:shadow-lg transition cursor-pointer
            "
          >
            Open Generator
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
