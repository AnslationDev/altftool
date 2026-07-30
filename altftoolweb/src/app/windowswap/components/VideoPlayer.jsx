"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  RefreshCw,
  VolumeX,
  Volume2,
  Maximize2,
  Minimize2,
  X,
  Search,
  Share2,
  Bookmark,
  Smile,
  Building2,
  Trees,
  CloudRain,
  MoonStar,
  Waves,
  Snowflake,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import "../style/VideoPlayer.css";

const windowCategories = [
  { label: "Interior", icon: Building2 },
  { label: "City", icon: Building2 },
  { label: "Nature", icon: Trees },
  { label: "Rain", icon: CloudRain },
  { label: "Snow", icon: Snowflake },
  { label: "Night", icon: MoonStar },
  { label: "Water", icon: Waves },
];

const isVimeoUrl = (url) => typeof url === "string" && url.includes("player.vimeo.com/video");

export default function VideoPlayer({
  videoA,
  videoB,
  activePlayer,
  isMuted,
  onToggleMute,
  onSwap,
  onExit,
  isTransitioning,
  onCategorySelect,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUnmuteHint, setShowUnmuteHint] = useState(true);
  const [showChrome, setShowChrome] = useState(true);

  const videoRefA = useRef(null);
  const videoRefB = useRef(null);
  const containerRef = useRef(null);
  const hideChromeTimerRef = useRef(null);

  const resetChromeHideTimer = () => {
    setShowChrome(true);

    if (hideChromeTimerRef.current) {
      window.clearTimeout(hideChromeTimerRef.current);
    }

    hideChromeTimerRef.current = window.setTimeout(() => {
      setShowChrome(false);
      setShowUnmuteHint(false);
    }, 2000);
  };

  // Sync mute state to native video elements
  useEffect(() => {
    if (videoRefA.current) videoRefA.current.muted = isMuted;
    if (videoRefB.current) videoRefB.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    resetChromeHideTimer();

    const handleUserActivity = () => {
      resetChromeHideTimer();
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("mousedown", handleUserActivity);
    window.addEventListener("pointermove", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      if (hideChromeTimerRef.current) {
        window.clearTimeout(hideChromeTimerRef.current);
      }

      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("mousedown", handleUserActivity);
      window.removeEventListener("pointermove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, []);

  // Sync active play status on change
  useEffect(() => {
    if (activePlayer === "A") {
      if (videoRefA.current) {
        videoRefA.current.play().catch(err => console.log("Play error A:", err));
      }
    } else {
      if (videoRefB.current) {
        videoRefB.current.play().catch(err => console.log("Play error B:", err));
      }
    }
  }, [activePlayer, videoA, videoB]);

  // Sync fullscreen state
  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement)
      );
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  const activeVideo = activePlayer === "A" ? videoA : videoB;
  const windowTitle = activeVideo?.windowTitle || `${activeVideo?.location?.split(",")?.[0] || "Window"}'s Window`;
  const locationLine = activeVideo?.location?.toUpperCase() || "UNKNOWN LOCATION";
  const timeLine = activeVideo?.timeLabel || "11:37";
  const dateLine = activeVideo?.dateLabel || "APRIL 2026";
  const activeCategory = activeVideo?.category || "Nature";
  const isActiveVideoVimeo = isVimeoUrl(activeVideo?.url);

  return (
    <div
      ref={containerRef}
      className="windowswap-player relative w-screen h-screen bg-black overflow-hidden"
    >
      {/* PLAYER A */}
      {isVimeoUrl(videoA?.url) ? (
        <div className="windowswap-player-frame absolute inset-0 overflow-hidden z-0" style={{ opacity: activePlayer === "A" ? 1 : 0 }}>
          <iframe
            src={videoA?.url}
            className="absolute left-1/2 top-1/2 border-0 pointer-events-none"
            style={{
              width: "177.7778vh",
              height: "56.25vw",
              minWidth: "100%",
              minHeight: "100%",
              transform: "translate(-50%, -50%)",
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={videoA?.windowTitle || "WindowSwap video A"}
          />
        </div>
      ) : (
        <video
          ref={videoRefA}
          src={videoA?.url}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: activePlayer === "A" ? 1 : 0 }}
          loop
          playsInline
          muted={isMuted}
        />
      )}

      {/* PLAYER B */}
      {isVimeoUrl(videoB?.url) ? (
        <div className="windowswap-player-frame absolute inset-0 overflow-hidden z-0" style={{ opacity: activePlayer === "B" ? 1 : 0 }}>
          <iframe
            src={videoB?.url}
            className="absolute left-1/2 top-1/2 border-0 pointer-events-none"
            style={{
              width: "177.7778vh",
              height: "56.25vw",
              minWidth: "100%",
              minHeight: "100%",
              transform: "translate(-50%, -50%)",
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={videoB?.windowTitle || "WindowSwap video B"}
          />
        </div>
      ) : (
        <video
          ref={videoRefB}
          src={videoB?.url}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: activePlayer === "B" ? 1 : 0 }}
          loop
          playsInline
          muted={isMuted}
        />
      )}

      {/* Soft atmospheric overlays */}
      {showChrome && <div className="windowswap-player-overlay absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/20 pointer-events-none z-10" />}
      {showChrome && <div className="windowswap-player-topfade absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent pointer-events-none z-10" />}
      {showChrome && <div className="windowswap-player-bottomfade absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />}

      {/* TOP HEADER */}
      {showChrome && (
        <div className="windowswap-player-chrome absolute top-5 left-5 right-5 z-20 flex items-start justify-between gap-4 text-white/90">
          <div className="min-w-0 max-w-[34vw]">
            <div className="font-serif text-[10px] sm:text-xs md:text-sm tracking-[0.35em] uppercase font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] truncate">
              {windowTitle}
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center pointer-events-none">
            <div className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.04em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              WindowSwap
            </div>
          </div>

          <div className="min-w-0 max-w-[32vw] text-right">
            <div className="font-serif text-[10px] sm:text-xs md:text-sm tracking-[0.28em] uppercase font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)] truncate">
              {locationLine}
            </div>
            <div className="mt-1 text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
              {timeLine}, {dateLine}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT CATEGORY RAIL */}
      {showChrome && (
        <div className="windowswap-player-rail absolute right-0 top-[18vh] bottom-[16vh] z-20 hidden md:flex flex-col items-center justify-between py-4 w-[84px] bg-white/10 backdrop-blur-md border-l border-white/15 rounded-l-3xl shadow-[0_0_30px_rgba(0,0,0,0.12)]">
          {windowCategories.map(({ label, icon: Icon }) => {
            const isActive = label === activeCategory;

            return (
              <button
                key={label}
                type="button"
                onClick={() => onCategorySelect?.(label)}
                className={`group flex flex-col items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-[0.12em] transition rounded-2xl cursor-pointer hover:bg-white/10 hover:cursor-pointer ${isActive ? "text-white opacity-100" : "text-white/55 hover:text-white/80"}`}
                title={`Open a ${label.toLowerCase()} window`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "opacity-100" : "opacity-70"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* AUTOPLAY FAILURE FLOATING ALERT */}
      <AnimatePresence>
        {showChrome && showUnmuteHint && isMuted && !isActiveVideoVimeo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => {
              onToggleMute();
              setShowUnmuteHint(false);
            }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-30 cursor-pointer"
          >
            <div className="bg-windowswap-terracotta text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-none border border-white/10 text-xs font-semibold uppercase tracking-wider select-none">
              <span>🔊 Click to unmute ambient sound</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM CONTROLS */}
      {showChrome && (
        <div className="windowswap-player-bottom absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 sm:gap-4 w-[calc(100%-2rem)] max-w-[610px] justify-center">
          <motion.button
            onClick={onSwap}
            disabled={isTransitioning}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-w-0 max-w-[430px] px-5 sm:px-7 py-3.5 border border-white/50 rounded-full bg-white/4 backdrop-blur-md text-white shadow-[0_0_30px_rgba(0,0,0,0.12)] select-none cursor-pointer transition-none"
          >
            <span className="flex items-center justify-center gap-3 text-[13px] sm:text-[18px] font-serif font-normal tracking-[0.02em] text-white/95">
              <span>Open a window somewhere in the world</span>
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white/90" />
            </span>
          </motion.button>

          <button
            onClick={onSwap}
            disabled={isTransitioning}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border border-white/45 bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-lg hover:bg-white/15 transition cursor-pointer"
            title="Open a new window"
          >
            <RefreshCw className={`h-5 w-5 ${isTransitioning ? "animate-spin" : ""}`} />
          </button>
        </div>
      )}

      {/* BOTTOM RIGHT CLUSTER */}
      {showChrome && (
        <div className="windowswap-player-actions absolute bottom-6 right-5 z-20 flex items-center gap-3 text-white">

          <button
            onClick={() => {
              onToggleMute();
              setShowUnmuteHint(false);
            }}
            className="h-11 w-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            title={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>

          <button
            onClick={handleFullscreenToggle}
            className="h-11 w-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>

          <button
            onClick={onExit}
            className="h-11 w-11 rounded-full border border-white/40 bg-white/10 backdrop-blur-md text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            title="Return to Home"
          >
            <X className="h-5 w-5" />
          </button>

        </div>
      )}

    </div>
  );
}
