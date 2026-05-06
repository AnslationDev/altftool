"use client";
import React from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const topApps = [
  {
    name: "WhatsApp",
    category: "Social",
    rating: 4.7,
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    link: "https://www.whatsapp.com/download",
  },
  {
    name: "Instagram",
    category: "Social",
    rating: 4.6,
    icon: "https://img.icons8.com/color/240/instagram-new.png",
    link: "https://www.instagram.com/download/",
  },
  {
    name: "Facebook",
    category: "Social",
    rating: 4.3,
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
    link: "https://www.facebook.com/mobile/",
  },
  {
    name: "Spotify",
    category: "Music",
    rating: 4.5,
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    link: "https://www.spotify.com/download/other/",
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
    name: "Snapchat",
    category: "Social",
    rating: 4.4,
    icon: "https://img.icons8.com/color/240/snapchat.png",
    link: "https://www.snapchat.com/download",
  },
  {
    name: "Twitter (X)",
    category: "Social",
    rating: 4.2,
    icon: "https://img.icons8.com/color/240/twitter--v1.png",
    link: "https://twitter.com/download",
  },
  {
    name: "Netflix",
    category: "Entertainment",
    rating: 4.6,
    icon: "https://img.icons8.com/color/240/netflix.png",
    link: "https://www.netflix.com",
  },
  {
    name: "Amazon Prime Video",
    category: "Entertainment",
    rating: 4.4,
    icon: "https://img.icons8.com/color/240/amazon-prime-video.png",
    link: "https://www.primevideo.com",
  },
];

export default function TopFreeApps() {
  return (
    <section className="section bg-[var(--background)] text-[var(--foreground)]  animate-slide-up ">

      <h2 className="section-title">
        Top Charts
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-10 mt-2 sm:mt-3 md:mt-4 lg:mt-5 animate-slight-right">
        <button className="px-5 sm:px-6 py-2 bg-(--primary) text-white border border-[var(--border)] rounded-full shadow-x font-medium  transition">
          Top free
        </button>

        <button className="px-5 sm:px-6 py-2 bg-(--card) border border-[var(--border)] rounded-full font-medium shadow-xl hover:bg-[var(--card-hover)] text-(--secondary-foreground)  transition">
          Top grossing
        </button>
        <button className="px-5 sm:px-6 py-2 bg-(--card) border border-[var(--border)] rounded-full font-medium shadow-xl hover:bg-[var(--card-hover)] text-(--secondary-foreground)  transition">
          Top paid
        </button>
      </div>

      {/* Apps Grid */}
      <div className="    grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10 ">
        {topApps.map((app, index) => (
          <a
            key={index}
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex  flex-col animate-slide-right items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--card-hover)] rounded-xl hover:shadow-xl hover:scale-105 transition-shadow duration-300 cursor-pointer"
          >

            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center bg-gray-50 rounded-2xl">
              <ManagedImage
                src={app.icon}
                alt={app.name}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
              />
            </div>

            <div className="text-center">
              <h3 className="subheading">{app.name}</h3>
              <p className="description">{app.category}</p>
              <p className="text-yellow-500 font-semibold">{app.rating} ★</p>
            </div>

          </a>
        ))}
      </div>
    </section>
  );
}
