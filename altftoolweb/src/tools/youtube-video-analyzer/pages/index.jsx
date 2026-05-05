"use client";

import React, { useState } from "react";
import VideoInput from "../components/VideoInput";
import VideoInfoCard from "../components/VideoInfoCard";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Header from "../components/Header";

// import "./index.css";

function YouTubeVideoAnalyzer() {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");

  const extractVideoId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.*\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleVideoSubmit = async (url) => {
    setLoading(true);
    setError("");
    setVideoData(null);
    setOriginalUrl(url);

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Simulate video data extraction (in a real app, you'd use YouTube API)
      const mockVideoData = {
        id: videoId,
        title: "Sample Video Title - This is a demo",
        author: "Demo Channel",
        duration: "5:42",
        views: "1,234,567",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description:
          "This is a demo application showcasing a modern YouTube video information viewer. The server has been removed and this is now a frontend-only application.",
        uploadDate: new Date().toLocaleDateString(),
        url: url,
      };

      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setVideoData(mockVideoData);
    } catch (error) {
      console.error("Error processing video:", error);
      setError(error.message || "Failed to process video information");
    } finally {
      setLoading(false);
    }
  };

  const handleWatchOnYouTube = () => {
    if (originalUrl) {
      window.open(originalUrl, "_blank");
    }
  };

  const handleShareVideo = async () => {
    if (navigator.share && videoData) {
      try {
        await navigator.share({
          title: videoData.title,
          text: `Check out this video: ${videoData.title}`,
          url: originalUrl,
        });
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.log("Error sharing:", err);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(originalUrl);
      alert("Video URL copied to clipboard!");
    }
  };

  const handleBack = () => {
    setVideoData(null);
    setError("");
    setOriginalUrl("");
  };

  return (
    <div className=" bg-(--background) text-(--foreground) flex flex-col overflow-x-hidden">
      {!videoData ? (
        <>
          <Header />
          <Hero />

          <main className="container mx-auto px-4 py-10 grow">
            {/* Search Section */}
            <div className="bg-(--card) border border-(--border) rounded-2xl shadow-lg p-8 md:p-12 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-(--foreground) mb-2">
                  Discover YouTube Videos
                </h2>
                <p className="text-lg text-(--muted-foreground)">
                  Enter a YouTube URL to view detailed video information
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <VideoInput onSubmit={handleVideoSubmit} loading={loading} />

                {error && (
                  <div className="mt-6 p-4 rounded-lg flex items-center gap-2 bg-red-100 text-red-700 border border-red-300">
                    <span className="text-xl">⚠️</span>
                    {error}
                  </div>
                )}

                {loading && (
                  <div className="mt-6 p-6 rounded-xl shadow bg-(--card) flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-(--border) border-t-(--primary) rounded-full animate-spin"></div>
                    <p className="mt-4 text-(--foreground) font-medium">
                      Analyzing video...
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Features />
            </div>
          </main>
        </>
      ) : (
        <main className="container mx-auto px-4 py-10 grow">
          <button
            onClick={handleBack}
            className={`"
              mb-8 inline-flex items-center gap-2
              px-4 py-2 rounded-lg
              bg-(--muted) text-(--foreground)
              border border-(--border)
              hover:bg-(--muted-hover)
              transition
            `}
          >
            ← Back to Search
          </button>

          <VideoInfoCard
            video={videoData}
            onWatchOnYouTube={handleWatchOnYouTube}
            onShare={handleShareVideo}
          />
        </main>
      )}
    </div>
  );
}

export default YouTubeVideoAnalyzer;
