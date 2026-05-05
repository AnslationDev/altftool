"use client";
import React, { useState } from "react";
// import { isValidYouTubeUrl } from "../utils";
import { isValidYouTubeUrl } from "../utils/api";
import { Search, Link } from "lucide-react";

const VideoInput = ({ onSubmit, loading = false }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setError("");

    try {
      await onSubmit(url);
    } catch (err) {
      setError(err.message || "Failed to fetch video information.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-(--muted-foreground)">
            <Link className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=...)"
            disabled={loading}
            className="
              w-full h-12 pl-10 rounded-lg
              bg-(--background)
              text-(--foreground)
              placeholder:text-(--muted-foreground)
              border border-(--border)
              focus-visible:ring-2 focus-visible:ring-(--primary)
              transition-all
              outline-none
            "
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="
            h-12 px-6 flex items-center gap-2 font-semibold rounded-lg
            bg-(--primary) text-(--primary-foreground)
            hover:opacity-90 transition-all
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {loading ? (
            <>
              <div className="h-4 cursor-pointer w-4 border-2 border-(--primary-foreground) border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Analyze Video
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 rounded-lg border border-red-300 bg-red-50 text-red-700 flex items-center gap-2">
          ⚠️ <span>{error}</span>
        </div>
      )}
    </form>
  );
};

export default VideoInput;
