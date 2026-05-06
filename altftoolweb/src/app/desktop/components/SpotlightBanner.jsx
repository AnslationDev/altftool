"use client";
import { Play } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import ManagedImage from "@/components/ui/ManagedImage";

export default function SpotlightBanner() {
  const theme = useTheme();
  return (
    <section className="section">
      <div className="
        relative 
        flex flex-col md:flex-row
        overflow-hidden 
        rounded-2xl 
        bg-[#2f3336] 
        text-white 
        shadow-lg
        animated-slide-up animate-slide-right
      ">

        {/* RIGHT IMAGE (Mobile pe top dikhega) */}
        <div className="
          relative 
          w-full md:w-[55%] 
          h-[220px] sm:h-[260px] md:h-[320px] lg:h-[380px]
          order-1 md:order-2
        ">
          <ManagedImage
            src="https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1600&auto=format&fit=crop"
            alt="Drama Banner"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* LEFT CONTENT */}
        <div className="
          w-full md:w-[45%]
          p-5 sm:p-8 md:p-10
          flex flex-col justify-center
          bg-gradient-to-r from-black/80 to-transparent
          z-10
          order-2 md:order-1
        ">

          <span className={`bg-[var(--badge-bg)] px-3 py-1 text-xs sm:text-sm  rounded-full w-fit mb-3 ${theme === "dark" ? "text-[var(--secondary-foreground)]" : "text-[var(--primary)]"}`}>
            Spotlight
          </span>

          <h1 className="heading text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
            Watch &apos;Forever After, Never Again&apos;
          </h1>

          <p className="text-gray-300 mt-3 text-sm sm:text-base description">
            Catch this trending short drama
          </p>

          {/* App Info */}
          <div className="flex items-center gap-3 sm:gap-4 mt-6">
            <ManagedImage
              src="https://img.icons8.com/fluency/96/video-playlist.png"
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl"
              alt="app"
            />

            <div>
              <p className="font-semibold text-sm sm:text-base subheading">
                DramaBox - Stream Drama Shorts
              </p>
              <p className="text-gray-400 text-xs sm:text-sm subheading">
                STORYMATRIX • 12+
              </p>
            </div>
          </div>



        </div>
      </div>
    </section>
  );
}
