"use client";
import React, { useState } from "react";
import VideoPlayer from "./VideoPlayer";
import {
  Play,
  ExternalLink,
  Share2,
  User,
  Clock,
  Eye,
  Calendar,
} from "lucide-react";

const VideoInfoCard = ({ video, onWatchOnYouTube, onShare }) => {
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const handleWatchHere = () => {
    setShowVideoPlayer(true);
    document.body.style.overflow = "hidden";
  };

  const handleClosePlayer = () => {
    setShowVideoPlayer(false);
    document.body.style.overflow = "unset";
  };

  if (!video) return null;

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-(--border) bg-(--card) shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
        {/* THUMBNAIL */}
        <div className="relative rounded-xl overflow-hidden group">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
            }}
          />

          {/* Play overlay */}
          <div className="absolute inset-0 bg-(--background)/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="h-16 w-16 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition"
              onClick={onWatchOnYouTube}
            >
              <Play className="h-6 w-6 text-white ml-1" />
            </button>
          </div>
        </div>

        {/* VIDEO DETAILS */}
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold text-(--card-foreground) mb-4 line-clamp-2">
            {video.title}
          </h1>

          {/* INFO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Channel */}
            <InfoBox
              icon={<User className="h-5 w-5" />}
              label="Channel"
              value={video.author}
              bg="bg-red-100"
              color="text-red-600"
            />

            {/* Duration */}
            <InfoBox
              icon={<Clock className="h-5 w-5" />}
              label="Duration"
              value={video.duration}
              bg="bg-blue-100"
              color="text-blue-600"
            />

            {/* Views */}
            <InfoBox
              icon={<Eye className="h-5 w-5" />}
              label="Views"
              value={video.views}
              bg="bg-green-100"
              color="text-green-600"
            />

            {/* Upload Date */}
            <InfoBox
              icon={<Calendar className="h-5 w-5" />}
              label="Upload Date"
              value={video.uploadDate}
              bg="bg-purple-100"
              color="text-purple-600"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-(--card-foreground)">
              Description
            </h3>
            <p className="text-(--muted-foreground) bg-(--muted) p-4 rounded-lg">
              {video.description}
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {/* Watch Here */}
            <button
              className="flex-1 gap-2 py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 transition"
              onClick={handleWatchHere}
            >
              <Play className="h-4 w-4 inline-block" /> Watch Here
            </button>

            {/* Open on YouTube */}
            <button
              className="flex-1 gap-2 py-3 rounded-lg font-semibold border border-(--border) text-(--foreground) hover:text-red-600 hover:border-red-600 transition"
              onClick={onWatchOnYouTube}
            >
              <ExternalLink className="h-4 w-4 inline-block" /> YouTube
            </button>

            {/* Share */}
            <button
              className="flex-1 gap-2 py-3 rounded-lg font-semibold border border-(--border) text-(--foreground) hover:text-red-600 hover:border-red-600 transition"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4 inline-block" /> Share
            </button>
          </div>
        </div>
      </div>

      {showVideoPlayer && (
        <VideoPlayer videoId={video.id} onClose={handleClosePlayer} />
      )}
    </div>
  );
};

export default VideoInfoCard;

/* Helper Box Component */
const InfoBox = ({ icon, label, value, bg, color }) => (
  <div className="flex items-center gap-3 p-3 bg-(--muted) rounded-lg">
    <div className={`p-2 rounded-lg ${bg} ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-(--muted-foreground) uppercase font-medium">
        {label}
      </p>
      <p className="font-medium text-(--card-foreground) truncate">{value}</p>
    </div>
  </div>
);
