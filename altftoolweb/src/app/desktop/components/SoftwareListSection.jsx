"use client";
import React from "react";
import ManagedImage from "@/components/ui/ManagedImage";

const softwareList = [
  {
    name: "TikTok LIVE Studio",
    rating: 4.6,
    description: "Live streaming software for TikTok creators",
    details:
      "Free desktop application that allows TikTok users to stream directly from PC.",
    image: "https://img.icons8.com/color/240/tiktok--v1.png",
    tags: ["Windows", "Streaming", "Chat"],
    link: "https://www.tiktok.com/live-studio",
  },
  {
    name: "Twitch",
    rating: 4.3,
    description: "Streaming platform for gamers and creators",
    details: "Watch and stream gaming, entertainment and live events.",
    image: "https://img.icons8.com/color/240/twitch--v1.png",
    tags: ["Windows", "Android", "Mac"],
    link: "https://www.twitch.tv/downloads",
  },
  {
    name: "Zoom",
    rating: 4.5,
    description: "Video conferencing and meetings",
    details: "Reliable platform for online meetings and webinars.",
    image: "https://img.icons8.com/color/240/zoom.png",
    tags: ["Meetings", "Video Call", "Remote Work"],
    link: "https://zoom.us/download",
  },
  {
    name: "OBS Studio",
    rating: 4.7,
    description: "Professional streaming and recording tool",
    details:
      "Free and open-source software for video recording and live streaming.",
    image: "https://img.icons8.com/color/240/obs-studio.png",
    tags: ["Streaming", "Recording", "Open Source"],
    link: "https://obsproject.com/download",
  },
  {
    name: "Adobe Acrobat Reader",
    rating: 4.4,
    description: "View and manage PDF documents",
    details:
      "Industry standard tool for reading and signing PDF files.",
    image: "https://img.icons8.com/color/240/adobe-acrobat--v1.png",
    tags: ["PDF", "Reader", "Documents"],
    link: "https://get.adobe.com/reader/",
  },
  {
    name: "Spotify",
    rating: 4.6,
    description: "Music streaming application",
    details: "Listen to millions of songs and podcasts online.",
    image: "https://img.icons8.com/color/240/spotify.png",
    tags: ["Music", "Streaming", "Entertainment"],
    link: "https://www.spotify.com/download",
  },
  {
    name: "Discord",
    rating: 4.5,
    description: "Voice, video and chat for communities",
    details:
      "Popular communication platform for gamers and teams.",
    image: "https://img.icons8.com/color/240/discord--v1.png",
    tags: ["Chat", "Voice", "Community"],
    link: "https://discord.com/download",
  },
  {
    name: "Google Chrome",
    rating: 4.7,
    description: "Fast and secure web browser",
    details:
      "One of the most popular browsers with extension support.",
    image: "https://img.icons8.com/color/240/chrome.png",
    tags: ["Browser", "Extensions", "Web"],
    link: "https://www.google.com/chrome/",
  },
  {
    name: "VLC Media Player",
    rating: 4.8,
    description: "Play almost all video and audio formats",
    details: "Lightweight and powerful open-source media player.",
    image: "https://img.icons8.com/color/240/vlc.png",
    tags: ["Video", "Audio", "Media Player"],
    link: "https://www.videolan.org/vlc/",
  },
];

export default function SoftwareListSection() {
  return (
    <section className="section animate-slide-up" >
      <h2 className="section-title">Trending Software</h2>

      <div className="space-y-6  mt-4 md:mt-6 lg:mt-8 xl:mt-10 ">
        {softwareList.map((app, index) => (
          <div
            key={index}
            className="flex flex-col animate-slide-down md:flex-row justify-between gap-6 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 border hover:shadow-lg transition hover:bg-[var(--card-hover)]"

          >
            {/* LEFT */}
            <div className="flex gap-5 w-full md:w-2/3">
              <ManagedImage
                src={app.image}
                alt={app.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-contain"
              />

              <div>
                <h3 className="subheading">{app.name}</h3>

                <p className="description mt-1">
                  {app.rating} · Free
                </p>

                <p className="subheading mt-2 text-sm font-semibold">
                  {app.description}
                </p>

                <p className="description mt-2">{app.details}</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-start md:items-end gap-4">
              <button
                onClick={() => window.open(app.link, "_blank")}
                className="px-6 py-2 rounded-lg font-medium transition hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Free Download
              </button>

              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}