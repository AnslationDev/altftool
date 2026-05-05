"use client";

import { Play, X } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const videos = [
  { id: 1, url: "https://www.pexels.com/download/video/8084499/" },
  { id: 2, url: "https://www.pexels.com/download/video/8328103/" },
  { id: 3, url: "https://www.pexels.com/download/video/854323/" },
  { id: 4, url: "https://www.pexels.com/download/video/35771190/" },
  { id: 5, url: "https://www.pexels.com/download/video/10396265/" },
  { id: 6, url: "https://www.pexels.com/download/video/6804128/" },
  { id: 7, url: "https://www.pexels.com/download/video/18069700/" },
  { id: 8, url: "https://www.pexels.com/download/video/18069237/" },
  { id: 9, url: "https://www.pexels.com/download/video/25935025/" },
  { id: 10, url: "https://www.pexels.com/download/video/35977437/" },
  { id: 11, url: "https://www.pexels.com/download/video/36382300/" },
  { id: 12, url: "https://www.pexels.com/download/video/30064775/" },
];

function VideoModal({ video, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, []);

  if (!video) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--background) backdrop-blur-sm "
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden bg-(--foreground) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-(--card) text-(--foreground) rounded-full p-2 transition"
          aria-label="Close video"
        >
          <X className="w-5 h-5" />
        </button>

        <video
          ref={videoRef}
          src={video.url}
          controls
          autoPlay
          loop={false}
          playsInline
          onEnded={onClose}
          className="w-full max-h-[80vh] object-cover"
        />
      </div>
    </div>,
    document.body,
  );
}

export default function VideoGridSection() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const rowVideos = videos.slice(0, 6);

  const rowPattern = [
    { type: "rectangle", index: 0 },
    { type: "stack", indices: [1, 2] },
    { type: "rectangle", index: 3 },
    { type: "stack", indices: [4, 5] },
  ];

  return (
    <>
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
      <section className="section animate-slide-up">
        <h2 className="section-title items-center text-center ">
          Thousands of Video Content
        </h2>
        <p className="section-subtitle  items-center text-center ">
          Explore curated videos across tools, trends, and real-world use cases
          all in one place.
        </p>

        {/* GRID */}
        <div className="grid animate-slide-right grid-cols-2  sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6  auto-rows-[160px] lg:auto-rows-[200px] tv-section-content">
          {rowPattern.map((col, colIndex) => {
            if (col.type === "rectangle") {
              const video = rowVideos[col.index];
              return (
                <div
                  key={colIndex}
                  className="relative
  lg:row-span-2
  rounded-xl lg:rounded-2xl
  overflow-hidden
  group cursor-pointer
  bg-gray-200"
                  onClick={() => setSelectedVideo(video)}
                >
                  <video
                    src={video.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />

                  <div className="absolute inset-0 transition" />
                  <div className="absolute inset-0 flex items-center justify-center"></div>
                </div>
              );
            }

            if (col.type === "stack") {
              return (
                <div
                  key={colIndex}
                  className=" contents
  lg:row-span-2
  lg:grid
  lg:grid-rows-2
  lg:gap-5"
                >
                  {col.indices.map((i) => {
                    const video = rowVideos[i];
                    return (
                      <div
                        key={i}
                        className="relative animate-slide-up rounded-xl overflow-hidden group cursor-pointer bg-gray-200"
                        onClick={() => setSelectedVideo(video)}
                      >
                        <video
                          src={video.url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0  transition" />
                        <div className="absolute inset-0 flex items-center justify-center"></div>
                      </div>
                    );
                  })}
                </div>
              );
            }
          })}
        </div>
      </section>
    </>
  );
}
