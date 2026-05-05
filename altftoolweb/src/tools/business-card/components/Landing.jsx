"use client";

import React from "react";
import { Sparkles } from "lucide-react";

const Landing = ({ setShowGenerator }) => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-225 mx-auto">
          <div className="  inline-flex items-center gap-2 py-3 px-6 mb-8 bg-(--background) text-(--primary) rounded-full border border-(--primary) p-2 shadow-md ">
            <Sparkles size={18} className="text-(--primary)" />
            <span className="text-[0.95rem]">
              Create Professional Business Cards in Seconds
            </span>
          </div>

          <h1 className="heading text-center mb-4 aniamte-fade-up ">
            Your Digital Business Card, Instantly
          </h1>

          <p className=" description text-center mb-8 animate-fade-up">
            Create stunning, professional business cards with our easy-to-use
            online tool. No design skills needed. 100% free. Download instantly.
          </p>

          <div className="">
            <button
              onClick={() => setShowGenerator(true)}
              className="py-3 px-8 text-[clamp(1rem,2vw,1.1rem)] font-semibold rounded-xl bg-(--primary) text-white cursor-pointer transition-all duration-300  "
            >
              Create Your Card Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
