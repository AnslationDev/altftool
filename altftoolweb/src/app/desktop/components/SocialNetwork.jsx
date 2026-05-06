"use client";
import React from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const socialApps = [
  {
    name: "WhatsApp",
    category: "Social",
    rating: 4.7,
    icon: "https://img.icons8.com/color/240/whatsapp.png",
    link: "https://www.whatsapp.com/download",
  },
  {
    name: "Facebook",
    category: "Social",
    rating: 4.3,
    icon: "https://img.icons8.com/color/240/facebook-new.png",
    link: "https://www.facebook.com",
  },
  {
    name: "YouTube",
    category: "Video",
    rating: 4.6,
    icon: "https://img.icons8.com/color/240/youtube-play.png",
    link: "https://www.youtube.com",
  },
  {
    name: "Telegram",
    category: "Messaging",
    rating: 4.5,
    icon: "https://img.icons8.com/color/240/telegram-app.png",
    link: "https://desktop.telegram.org/",
  },
  {
    name: "Chrome",
    category: "Browser",
    rating: 4.4,
    icon: "https://img.icons8.com/color/240/chrome.png",
    link: "https://www.google.com/chrome/",
  },
];

export default function SocialNetworking() {
  return (
    <section className=" section bg-[var(--background)] text-[var(--foreground)] animate-slide-up">

      {/* Heading */}
      <h2 className="section-title ">
        Social Networking
      </h2>

      {/* Apps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6 md:gap-8  mt-4 md:mt-6 lg:mt-8 xl:mt-10 ">

        {socialApps.map((app, index) => (
          <a
            key={index}
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col animate-slide-right items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-xl hover:shadow-xl hover:scale-105 transition-shadow duration-300 cursor-pointer"
          >

            {/* Icon */}
            {/* <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center bg-[var(--muted)] rounded-2xl"> */}
            <ManagedImage
              src={app.icon}
              alt={app.name}
              className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
            />
            {/* </div> */}

            {/* Info */}
            <div className="text-center">

              <h3 className="font-semibold text-base sm:text-lg md:text-xl lg:text-2xl subheading">
                {app.name}
              </h3>

              <p className="text-[var(--muted-foreground)] text-xs sm:text-sm md:text-base lg:text-lg">
                {app.category}
              </p>

              <p className="text-yellow-500 text-sm sm:text-base md:text-lg lg:text-xl">
                {app.rating} ★
              </p>

            </div>

          </a>
        ))}

      </div>
    </section>
  );
}
