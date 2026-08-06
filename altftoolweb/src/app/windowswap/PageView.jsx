"use client";

import React, { useState } from "react";
import "./style/windowswap.css";
import { windowVideos } from "./videos";

// Modular React Components
import HeroSection from "./components/HeroSection";
import GiftSection from "./components/GiftSection";
import AllAccessSection from "./components/AllAccessSection";
import TipJarSection from "./components/TipJarSection";
import SurveySection from "./components/SurveySection";
import MusicSection from "./components/MusicSection";

import SubmitDrawer from "./components/SubmitDrawer";
import SupportDrawer from "./components/SupportDrawer";
import VideoPlayer from "./components/VideoPlayer";
import Footer from "@/platform/navigation/Footer";


export default function WindowSwapPage() {
  // Navigation drawer states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  // Video playback states
  const [activePlayer, setActivePlayer] = useState("A"); // "A" or "B"
  const [videoIndexA, setVideoIndexA] = useState(0);
  const [videoIndexB, setVideoIndexB] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Start the immersive player
  const startPlaying = () => {
    setIsPlaying(true);
    setIsMuted(true);

    // Choose a random starting video for Player A
    const startIndex = Math.floor(Math.random() * windowVideos.length);
    setVideoIndexA(startIndex);

    // Buffer a different video in Player B
    let nextIndex = Math.floor(Math.random() * windowVideos.length);
    while (nextIndex === startIndex) {
      nextIndex = Math.floor(Math.random() * windowVideos.length);
    }
    setVideoIndexB(nextIndex);

    setActivePlayer("A");
  };

  // Trigger double-buffered video crossfade
  const handleSwap = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextIndex = Math.floor(Math.random() * windowVideos.length);

    if (activePlayer === "A") {
      // Player A is currently showing, load next video into Player B
      setVideoIndexB(nextIndex);

      // Let the browser load/pre-buffer, then crossfade to B
      setTimeout(() => {
        setActivePlayer("B");
        setTimeout(() => setIsTransitioning(false), 1200);
      }, 300);
    } else {
      // Player B is currently showing, load next video into Player A
      setVideoIndexA(nextIndex);

      // Let the browser load/pre-buffer, then crossfade to A
      setTimeout(() => {
        setActivePlayer("A");
        setTimeout(() => setIsTransitioning(false), 1200);
      }, 300);
    }
  };

  const handleCategorySelect = (category) => {
    if (isTransitioning) return;

    const matchingVideos = windowVideos.filter((video) => video.category === category);
    if (!matchingVideos.length) return;

    const currentIndex = activePlayer === "A" ? videoIndexA : videoIndexB;
    const currentVideoId = windowVideos[currentIndex]?.id;

    const candidateVideos = matchingVideos.filter((video) => video.id !== currentVideoId);
    const chosenVideo = (candidateVideos.length ? candidateVideos : matchingVideos)[Math.floor(Math.random() * (candidateVideos.length ? candidateVideos.length : matchingVideos.length))];
    const chosenIndex = windowVideos.findIndex((video) => video.id === chosenVideo.id);
    if (chosenIndex === -1) return;

    if (activePlayer === "A") {
      setVideoIndexA(chosenIndex);
      const alternateIndex = windowVideos.findIndex((video) => video.id !== chosenVideo.id);
      if (alternateIndex !== -1) {
        setVideoIndexB(alternateIndex);
      }
    } else {
      setVideoIndexB(chosenIndex);
      const alternateIndex = windowVideos.findIndex((video) => video.id !== chosenVideo.id);
      if (alternateIndex !== -1) {
        setVideoIndexA(alternateIndex);
      }
    }
  };

  const handleExit = () => {
    setIsPlaying(false);
  };

  return (
    <div className="windowswap-theme min-h-screen font-sans antialiased overflow-x-hidden select-none selection:bg-primary/20 selection:text-foreground">

      {/* ──────────────────────────────────────────────────────── */}
      {/* LANDING PAGE STATE */}
      {/* ──────────────────────────────────────────────────────── */}
      {!isPlaying && (
        <div className="flex flex-col w-full min-h-screen">
          <HeroSection
            onStartPlaying={startPlaying}
            onOpenSubmit={() => setIsSubmitOpen(true)}
            onOpenSupport={() => setIsSurveyOpen(true)}
          />
          <GiftSection />
          <AllAccessSection />
          <TipJarSection onOpenSupport={() => setIsSurveyOpen(true)} />
          <SurveySection />
          <MusicSection />
          <Footer />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* IMMERSIVE PLAYER STATE */}
      {/* ──────────────────────────────────────────────────────── */}
      {isPlaying && (
        <VideoPlayer
          videoA={windowVideos[videoIndexA]}
          videoB={windowVideos[videoIndexB]}
          activePlayer={activePlayer}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onSwap={handleSwap}
          onExit={handleExit}
          isTransitioning={isTransitioning}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* DRAWER MODAL: SUBMIT A WINDOW */}
      {/* ──────────────────────────────────────────────────────── */}
      <SubmitDrawer
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
      />

      {/* ──────────────────────────────────────────────────────── */}
      {/* DRAWER MODAL: TIP / SURVEY MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      <SupportDrawer
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
      />



    </div>
  );
}
