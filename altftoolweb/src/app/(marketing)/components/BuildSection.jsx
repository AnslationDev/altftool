"use client";

import { useState, useEffect } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function BuildSection() {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    fetch("/data/tools.json")
      .then((res) => res.json())
      .then((data) => setTools(data))
      .catch(() => console.error("Failed to load tools.json"));
  }, []);

  const mid = Math.ceil(tools.length / 2);
  const topRowTools = tools.slice(0, mid);
  const bottomRowTools = tools.slice(mid);

  const ToolCard = ({ tool }) => (
    <div
      aria-label={`Open ${tool.name}`}
      className="group relative flex-shrink-0 px-1.5 sm:px-2"
    // onClick={() => {
    //   setSelectedTool(tool);
    //   setOpenApp(true);
    // }}
    >
      <div
        className="
          relative
          w-[78vw]
          max-w-[320px]
          sm:w-[220px]
          md:w-[250px]
          lg:w-[280px]
          xl:w-[300px]
          2xl:w-[320px]
          aspect-[3/2]
          overflow-hidden
          rounded-2xl
          bg-muted
          shadow-md
          transition-shadow
          duration-300
          hover:shadow-xl
        "
      >
        <ManagedImage
          src={tool.image}
          alt={tool.name}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/images/featured1.png")}
          className="
            h-full w-full object-cover
            transition-transform duration-500
            group-hover:scale-110
          "
        />

        {/* overlay */}
        <div
          className="
            pointer-events-none
            absolute inset-0
            flex items-end
            bg-gradient-to-t
            from-black/80 via-black/30 to-transparent
            opacity-0
            transition-opacity duration-300
            group-hover:opacity-100
          "
        >
          <p className="w-full p-3 text-center text-sm sm:text-base font-semibold text-white">
            {tool.name}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }

        .animate-marquee-left {
          animation: marquee-left 40s linear infinite;
          will-change: transform;
        }

        .animate-marquee-right {
          animation: marquee-right 40s linear infinite;
          will-change: transform;
        }

        .marquee-wrap:hover .animate-marquee-left,
        .marquee-wrap:hover .animate-marquee-right {
          animation-play-state: paused;
        }
      `}</style>

      <section className="bg-background py-[3%] flex flex-col items-center px-4 overflow-hidden">
        <div className=" mx-auto">
          {/* heading */}
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="section-title mb-3">
              What do you want to{" "}
              <span className="gradient-text">build today?</span>
            </h2>

            <p className="text-[#9DA3AF] text-[clamp(0.9rem,1.4vw,1.05rem)]">
              Over 100+ tools ready to use instantly
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* ---------- TOP ROW ---------- */}
            <div className="relative flex overflow-hidden mask-gradient marquee-wrap">
              <div className="flex animate-marquee-left">
                {[...topRowTools, ...topRowTools].map((tool, index) => (
                  <ToolCard
                    key={`top-${tool.id}-${index}`}
                    tool={tool}
                  />
                ))}
              </div>
            </div>

            {/* ---------- BOTTOM ROW ---------- */}
            <div className="relative flex overflow-hidden mask-gradient marquee-wrap">
              <div className="flex animate-marquee-right">
                {[...bottomRowTools, ...bottomRowTools].map(
                  (tool, index) => (
                    <ToolCard
                      key={`bottom-${tool.id}-${index}`}
                      tool={tool}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <ToolDescriptionModel
        isOpen={openApp}
        onClose={() => setOpenApp(false)}
        app={selectedTool}
      /> */}
    </>
  );
}
