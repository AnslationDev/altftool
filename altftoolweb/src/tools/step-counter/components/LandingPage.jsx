"use client";
import React from "react";
import { Activity, Flame, MapPin, ChevronRight } from "lucide-react";

const LandingPage = ({ onStart }) => {
  return (
    <div
      className="
        flex flex-col
        bg-(--background) 
        text-(--foreground)
      "
    >
      {/* ================= HERO SECTION ================= */}
      <section
        className="
          flex-1 flex items-center 
          rounded-2xl 
          py-12 
          bg-linear-to-br 
          from-(--background) to-(--muted)
        "
      >
        <div className="max-w-3xl mx-auto text-center px-4 flex flex-col items-center gap-6">
          {/* Icon Bubble */}
          <div
            className="
              p-3 rounded-full 
              bg-blue-100 text-blue-600 
              inline-flex
            "
          >
            <Activity size={32} />
          </div>

          {/* Headings */}
          <div>
            <h1
              className="
                heading
              "
            >
              Track Every Step
            </h1>
            <h1
              className="
                heading text-(--foreground)
              "
            >
              Reach Your Goals
            </h1>
          </div>

          {/* Subtext */}
          <p
            className="
              text-lg md:text-xl 
              text-(--foreground)
              max-w-xl 
              leading-relaxed 
              opacity-80
            "
          >
            A simple, effective, and beautiful way to simulate and track your
            daily activity. Start your fitness journey today with our intuitive
            step counter.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onStart}
              className="
                bg-(--primary) text-(--primary-foreground)
                px-6 py-3 rounded-xl
                text-lg font-semibold
                flex items-center justify-center gap-2
                transition shadow hover:shadow-lg cursor-pointer
              "
            >
              Start Walking
              <ChevronRight size={20} />
            </button>

            <button
              onClick={() => alert("Learn more feature coming soon!")}
              className="
                border-2 border-(--primary) 
                text-(--primary) 
                px-6 py-3 rounded-xl 
                text-lg font-semibold
                transition
                hover:bg-blue-50 dark:hover:bg-white/5
              "
            >
              Learn More!
            </button>
          </div>
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="py-16 bg-(--card)">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-center text-(--foreground) mb-3">
            Why Choose StepMaster?
          </h2>

          <p className="text-center text-(--muted-foreground) max-w-xl mx-auto mb-10">
            Powerful features designed to help you stay active, motivated, and
            in control of your fitness journey.
          </p>

          {/* Features */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Activity />,
                title: "Real-Time Step Tracking",
                desc: "Automatically detects movements using device motion or manual tapping.",
              },
              {
                icon: <Flame />,
                title: "Calorie Estimation",
                desc: "Get instant calorie burn estimates based on your steps.",
              },
              {
                icon: <MapPin />,
                title: "Distance Calculation",
                desc: "See how far you’ve walked, measured in KM with accurate step-to-distance mapping.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="
            rounded-2xl
            bg-(--background)
            border border-(--border)
            p-6
            transition
            hover:-translate-y-1
            hover:shadow-lg
          "
              >
                {/* Icon Bubble */}
                <div
                  className="
              w-12 h-12
              bg-blue-100 text-blue-600
              rounded-lg
              flex items-center justify-center
              mb-3
            "
                >
                  {f.icon}
                </div>

                <h3 className="text-xl font-semibold text-(--foreground)">
                  {f.title}
                </h3>

                <p className="text-(--muted-foreground) mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
