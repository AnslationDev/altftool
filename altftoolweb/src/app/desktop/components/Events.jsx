"use client";
import React, { useRef } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const events = [
  {
    title: "Edit images with just a doodle using Nano Banana",
    description: "Now you can tell Gemini exactly where and how to apply …",
    appName: "Google Gemini",
    developer: "Google LLC",
    age: "12+",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8f/Google-gemini-icon.svg",
  },
  {
    title: "Bittersweet Obsession",
    description: "For eight years, she kept her feelings hidden…",
    appName: "FreeReels - Dramas & Reels",
    developer: "SKYWORK AI PTE.LTD.",
    age: "12+",
    image:
      "https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg",
  },
  {
    title: "Star in a Scream",
    description: "Come face-to-face with thrilling AI moments…",
    appName: "Meta AI - Vibes",
    developer: "Meta Platforms",
    age: "12+",
    image:
      "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
  },
  {
    title: "Mindful Meditation Sessions",
    description: "Relax your mind with guided meditation…",
    appName: "Calm Mind",
    developer: "Mindful Apps",
    age: "4+",
    image:
      "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg",
  },
  {
    title: "Photo Remix AI",
    description: "Turn your photos into AI artworks instantly…",
    appName: "RemixAI",
    developer: "Artify LLC",
    age: "12+",
    image:
      "https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg",
  },
  {
    title: "Fitness Tracker Pro",
    description: "Track workouts, calories and health easily…",
    appName: "FitPro",
    developer: "HealthTech",
    age: "4+",
    image:
      "https://images.pexels.com/photos/414029/pexels-photo-414029.jpeg",
  },
  {
    title: "Language Learner AI",
    description: "Learn languages fast with AI tutor…",
    appName: "LinguaAI",
    developer: "EduTech",
    age: "4+",
    image:
      "https://images.pexels.com/photos/3184402/pexels-photo-3184402.jpeg",
  },
  {
    title: "Travel Explorer Guide",
    description: "Discover new destinations & travel plans…",
    appName: "TravelMate",
    developer: "GlobeTrotters",
    age: "4+",
    image:
      "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg",
  },
  {
    title: "AI Video Creator",
    description: "Generate videos using simple text prompts…",
    appName: "VideoGen AI",
    developer: "Creative Labs",
    age: "12+",
    image:
      "https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg",
  },
  {
    title: "Music Beat Studio",
    description: "Create beats & music using smart AI tools…",
    appName: "BeatFlow",
    developer: "SoundTech",
    age: "4+",
    image:
      "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg",
  },
];

const appIcon =
  "https://upload.wikimedia.org/wikipedia/commons/8/8f/Google-gemini-icon.svg";

export default function EventCarousel() {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const width = sliderRef.current.clientWidth * 0.7;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -width : width,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="section bg-[var(--background)] text-[var(--foreground)] animate-scale-up">

      {/* Heading */}
      <h2 className="section-title">
        Events happening now
      </h2>

      {/* Slider */}
      <div className="relative mt-4 md:mt-6 lg:mt-8 xl:mt-10 animate-slide-right">

        {/* Left arrow */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10 hover:bg-black transition"
        >
          ◀
        </button>

        {/* Right arrow */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10 hover:bg-black transition"
        >
          ▶
        </button>

        {/* Scroll container */}
        <div
          ref={sliderRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide "
        >
          {events.map((event, index) => (
            <div
              key={index}
              className="relative min-w-[240px] sm:min-w-[280px] md:min-w-[320px] lg:min-w-[360px] rounded-xl shadow-lg flex-shrink-0 snap-start bg-[var(--card)]"
            >
              <ManagedImage
                src={event.image}
                alt={event.title}
                className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover rounded-xl"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-xl"></div>

              {/* Content */}
              <div className="absolute bottom-0 p-3 sm:p-4 w-full text-white">

                <h3 className="font-bold text-sm sm:text-base md:text-lg">
                  {event.title}
                </h3>

                <p className="text-xs sm:text-sm mt-1 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center justify-between mt-3">

                  {/* App info */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <ManagedImage
                        src={appIcon}
                        alt={event.appName}
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                      />
                    </div>

                    <div className="text-[10px] sm:text-xs">
                      <p className="font-medium">{event.appName}</p>
                      <p className="text-gray-300">
                        {event.developer} · {event.age} · Free ★
                      </p>
                    </div>
                  </div>

                  {/* Install button */}
                  <button className="bg-gray-300 text-black text-[10px] sm:text-xs px-3 py-1.5 rounded-md">
                    Install
                  </button>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
