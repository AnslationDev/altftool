"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAmbientAudio } from "../hooks/useAmbientAudio";
import { useLocalMixes } from "../hooks/useLocalMixes";
import { ambientSounds, presetMixes } from "../data/ambientSounds";
import TimerModal from "./TimerModal";
import SaveMixModal from "./SaveMixModal";
import ShareMixModal from "./ShareMixModal";
import FAQSection from "./FAQSection";
import UseCases from "./UseCases";
import VisualEnvironment from "./VisualEnvironment";
import * as Icons from "lucide-react";
import "../soft-murmur.css";

export default function AmbientMixer() {
  const {
    soundsState,
    isPlaying,
    masterVolume,
    flowMode,
    flowIntensity,
    timerTime,
    isTimerActive,
    timerFadeOut,
    initialTimerDuration,
    toggleSound,
    setSoundVolume,
    togglePlayPause,
    setMasterVolume,
    resetMix,
    loadPreset,
    setFlowMode,
    setFlowIntensity,
    startTimer,
    cancelTimer,
  } = useAmbientAudio();

  const { savedMixes, saveMix, deleteMix } = useLocalMixes();
  const searchParams = useSearchParams();

  // Modals state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Side Drawer & Environment Settings
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState("Night"); // Morning, Afternoon, Evening, Night
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Message alert for user feedback
  const [alertMessage, setAlertMessage] = useState("");

  // Count active sounds
  const activeCount = Object.values(soundsState).filter((s) => s.active).length;

  // Handle URL share links on mount
  useEffect(() => {
    const mix = searchParams.get("mix");
    const mv = searchParams.get("mv");
    const fm = searchParams.get("fm") === "true";
    const fi = searchParams.get("fi") || "Soft";
    const tod = searchParams.get("tod");

    if (tod) setTimeOfDay(tod);

    if (mix) {
      const parsedSounds = {};
      mix.split(",").forEach((item) => {
        const [id, volStr] = item.split(":");
        const vol = parseInt(volStr, 10);
        if (id && !isNaN(vol)) {
          parsedSounds[id] = vol;
        }
      });

      if (Object.keys(parsedSounds).length > 0) {
        const masterVol = mv ? parseInt(mv, 10) : 80;
        loadPreset(parsedSounds, masterVol, fm, fi);
      }
    }
  }, [searchParams]);

  // Alert message banner timer
  useEffect(() => {
    if (alertMessage) {
      const t = setTimeout(() => setAlertMessage(""), 4000);
      return () => clearTimeout(t);
    }
  }, [alertMessage]);

  const handleGlobalPlay = () => {
    if (activeCount === 0 && !isPlaying) {
      setAlertMessage("Choose at least one sound from the mixer drawer to start.");
      setIsDrawerOpen(true);
      return;
    }
    togglePlayPause();
  };

  const handleLoadPreset = (preset) => {
    loadPreset(preset.sounds, preset.masterVolume, preset.flowMode, preset.flowIntensity);
  };

  const handleSaveMixSubmit = (name) => {
    return saveMix(name, soundsState, masterVolume, flowMode, flowIntensity);
  };

  // Fullscreen toggle logic
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error enabling fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const formatTimerCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // --- Dynamic Environment Cross-Fader Background Resolver ---
  const getBackgroundKey = () => {
    if (activeCount === 0) return "nature";

    // Detect dominant active sound based on highest volume
    let dominantId = null;
    let maxVol = -1;
    Object.entries(soundsState).forEach(([id, state]) => {
      if (state.active && state.volume > maxVol) {
        maxVol = state.volume;
        dominantId = id;
      }
    });

    if (!dominantId) return "nature";

    if (dominantId === "rain" || dominantId === "thunder") return "rain";
    if (dominantId === "waves") return "ocean";
    if (dominantId === "fire") return "fire";
    if (dominantId === "coffee") return "cafe";
    if (dominantId === "singing_bowl") return "zen";
    if (dominantId === "white_noise") return "white_noise";

    return "nature"; // Default sunrise forest for birds, wind, crickets
  };

  // Resolve dynamic screensaver overlay titles based on sound combinations
  const getActiveSoundTheme = () => {
    if (activeCount === 0) {
      return { name: "AMBIENT STUDIO", tagline: "SELECT A SOUND SCENE", icon: "Trees", color: "text-emerald-400" };
    }

    const isRain = soundsState.rain?.active;
    const isThunder = soundsState.thunder?.active;
    const isFire = soundsState.fire?.active;
    const isCoffee = soundsState.coffee?.active;
    const isWaves = soundsState.waves?.active;
    const isWind = soundsState.wind?.active;
    const isCrickets = soundsState.crickets?.active;

    if (isRain && isThunder) {
      return { name: "STORMY TEMPEST", tagline: "WEATHER SOUNDSCAPE", icon: "CloudLightning", color: "text-purple-400" };
    }
    if (isRain && isFire) {
      return { name: "FOREST CABIN", tagline: "COZY SOUNDSCAPE", icon: "Home", color: "text-orange-400" };
    }
    if (isRain && isCoffee) {
      return { name: "RAINY CAFE", tagline: "INTERIOR SOUNDSCAPE", icon: "Coffee", color: "text-amber-500" };
    }
    if (isWaves && isWind) {
      return { name: "OCEAN BREEZE", tagline: "COASTAL SOUNDSCAPE", icon: "Waves", color: "text-teal-400" };
    }
    if (isCrickets && isFire) {
      return { name: "NIGHT CAMPFIRE", tagline: "WILDERNESS SOUNDSCAPE", icon: "Flame", color: "text-amber-500" };
    }

    let dominantId = null;
    let maxVol = -1;
    Object.entries(soundsState).forEach(([id, state]) => {
      if (state.active && state.volume > maxVol) {
        maxVol = state.volume;
        dominantId = id;
      }
    });

    const nameMap = {
      rain: "RAIN AMBIENT",
      thunder: "THUNDERSTORM",
      waves: "OCEAN WAVES",
      wind: "WIND GUSTS",
      fire: "FIRE AMBIENT",
      birds: "FOREST BIRDS",
      crickets: "NIGHT FORESTS",
      coffee: "CAFE AMBIENT",
      singing_bowl: "SINGING BOWL",
      white_noise: "WHITE NOISE",
    };

    const iconMap = {
      rain: "CloudRain",
      thunder: "CloudLightning",
      waves: "Waves",
      wind: "Wind",
      fire: "Flame",
      birds: "Trees",
      crickets: "Moon",
      coffee: "Coffee",
      singing_bowl: "Bell",
      white_noise: "Volume2",
    };

    const colorMap = {
      rain: "text-sky-400",
      thunder: "text-violet-400",
      waves: "text-blue-400",
      wind: "text-teal-400",
      fire: "text-orange-400",
      birds: "text-emerald-400",
      crickets: "text-indigo-400",
      coffee: "text-amber-500",
      singing_bowl: "text-yellow-500",
      white_noise: "text-slate-400",
    };

    return {
      name: nameMap[dominantId] || "AMBIENT SOUND",
      tagline: "SOUNDSCAPE",
      icon: iconMap[dominantId] || "Volume2",
      color: colorMap[dominantId] || "text-emerald-400",
    };
  };

  const activeBg = getBackgroundKey();
  const themeData = getActiveSoundTheme();
  const IconComponent = Icons[themeData.icon] || Icons.Volume2;

  return (
    <div className="scrollable-wrapper">
      <div className="ambient-container relative select-none">
        
        {/* --- DYNAMIC CROSS-FADING BACKGROUND LAYERS --- */}
        <div className="background-system">
          <div className={`ambient-bg-layer ${activeBg === "nature" ? "active" : ""}`} style={{ backgroundImage: "url('/soft-murmur/ambient_nature_hero.png')" }} />
          <div className={`ambient-bg-layer ${activeBg === "rain" ? "active" : ""}`} style={{ backgroundImage: "url('/soft-murmur/ambient_rain_cabin.png')" }} />
          <div className={`ambient-bg-layer ${activeBg === "ocean" ? "active" : ""}`} style={{ backgroundImage: "url('/soft-murmur/ambient_ocean_coast.png')" }} />
          <div className={`ambient-bg-layer ${activeBg === "fire" ? "active" : ""}`} style={{ backgroundImage: "url('/soft-murmur/ambient_camp_fire.png')" }} />
          <div className={`ambient-bg-layer ${activeBg === "cafe" ? "active" : ""}`} style={{ backgroundImage: "url('/soft-murmur/ambient_cafe_window.png')" }} />
          <div className={`ambient-bg-layer ${activeBg === "zen" ? "active" : ""}`} style={{ backgroundImage: "url('/soft-murmur/ambient_zen_garden.png')" }} />
          <div className={`ambient-bg-layer ${activeBg === "white_noise" ? "active" : ""}`} style={{ background: "radial-gradient(circle at center, #0f1c24 0%, #050a0f 100%)" }} />
          
          {/* Dark Vignette Overlay */}
          <div className="ambient-overlay" />
        </div>

        {/* --- DYNAMIC VISUAL ENVIRONMENT CANVAS --- */}
        <VisualEnvironment soundsState={soundsState} timeOfDay={timeOfDay} />

        {/* --- SCREENSAVER TEXT OVERLAY (Inspired by Mockup) --- */}
        <div className="screensaver-overlay">
          <div className={`screensaver-icon ${themeData.color}`}>
            <IconComponent size={34} className="animate-pulse" />
          </div>
          <h1 className="screensaver-title">{themeData.name}</h1>
          <p className="screensaver-tagline">{themeData.tagline}</p>
        </div>

        {/* --- FLOATING BOTTOM PLAYER CONTROLS (Inspired by Mockup) --- */}
        <div className="floating-player-bar">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={`player-btn ${isDrawerOpen ? "active" : ""}`}
            title="Configure Sound Mixer"
            aria-label="Open sounds mixer"
          >
            <Icons.Sliders size={18} />
          </button>
          
          <button
            onClick={handleGlobalPlay}
            className="player-btn player-btn-main"
            title={isPlaying ? "Pause Soundscape" : "Play Soundscape"}
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? <Icons.Pause size={24} /> : <Icons.Play size={24} />}
          </button>

          <button
            onClick={() => setIsTimerOpen(true)}
            className={`player-btn ${isTimerActive ? "active" : ""}`}
            title="Set Sleep Timer"
            aria-label="Configure timer"
          >
            <Icons.Clock size={18} />
          </button>

          <button
            onClick={() => setIsSaveOpen(true)}
            disabled={activeCount === 0}
            className="player-btn disabled:opacity-40"
            title="Save Current Mix"
            aria-label="Save current mix"
          >
            <Icons.Save size={18} />
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            disabled={activeCount === 0}
            className="player-btn disabled:opacity-40"
            title="Share Current Mix"
            aria-label="Share current mix"
          >
            <Icons.Share2 size={18} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="player-btn"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label="Toggle fullscreen view"
          >
            {isFullscreen ? <Icons.Minimize size={18} /> : <Icons.Maximize size={18} />}
          </button>

          {isTimerActive && (
            <span className="text-xs font-mono text-emerald-400 ml-1">
              {formatTimerCountdown(timerTime)}
            </span>
          )}
        </div>

        {/* --- SLIDE-IN SOUND MIXER DRAWER (Inspired by Mockup Right Panel) --- */}
        <div className={`sounds-drawer ${isDrawerOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <div className="flex items-center gap-2">
              <Icons.Volume2 className="text-emerald-400" size={18} />
              <h3 className="font-extrabold text-sm tracking-wider text-white uppercase">Sounds & Mixer</h3>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
              aria-label="Close mixer drawer"
            >
              <Icons.X size={16} />
            </button>
          </div>

          <div className="drawer-content">
            {/* Environment Time of Day Switcher inside the drawer */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2.5 mb-2">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Atmosphere Time</span>
              <div className="grid grid-cols-4 gap-1 bg-black/30 p-1 rounded-xl">
                {[
                  { id: "Morning", label: "Morning", icon: "SunDim", color: "text-amber-400" },
                  { id: "Afternoon", label: "Noon", icon: "Sun", color: "text-sky-400" },
                  { id: "Evening", label: "Dusk", icon: "Sunset", color: "text-orange-400" },
                  { id: "Night", label: "Night", icon: "Moon", color: "text-indigo-400" }
                ].map((tod) => {
                  const TodIcon = Icons[tod.icon];
                  const active = timeOfDay === tod.id;
                  return (
                    <button
                      key={tod.id}
                      onClick={() => setTimeOfDay(tod.id)}
                      title={`Atmosphere: ${tod.label}`}
                      className={`py-2 px-1 rounded-lg text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                        active ? "bg-white/10 " + tod.color : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <TodIcon size={14} />
                      <span>{tod.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Master Volume */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>MASTER VOLUME</span>
                <span className="text-emerald-400 font-mono text-xs">{masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
                className="custom-range"
                aria-label="Master volume slider"
              />
            </div>

            {/* Individual Sound Sliders */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Generators</span>
              
              {ambientSounds.map((sound) => {
                const state = soundsState[sound.id];
                const SoundIcon = Icons[sound.icon] || Icons.Volume2;
                return (
                  <div
                    key={sound.id}
                    className={`drawer-sound-item cursor-pointer ${state.active ? "active" : ""}`}
                    onClick={() => toggleSound(sound.id)}
                    title={`Click to toggle ${sound.name}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSound(sound.id);
                      }}
                      className="sound-item-btn"
                      title={`Toggle ${sound.name}`}
                    >
                      <SoundIcon size={16} />
                    </button>
                    
                    <div className="sound-slider-wrap">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200">{sound.name}</span>
                        {state.active && (
                          <span className="text-[10px] font-mono text-emerald-400">{state.volume}%</span>
                        )}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={state.volume}
                        onChange={(e) => setSoundVolume(sound.id, parseInt(e.target.value, 10))}
                        onClick={(e) => e.stopPropagation()} // Stop toggle when adjusting volume
                        disabled={!state.active}
                        className="custom-range mt-1"
                        aria-label={`${sound.name} volume slider`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Preset Mixes */}
            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Quick Presets</span>
              <div className="flex flex-wrap gap-1.5">
                {presetMixes.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className="px-3 py-1.5 rounded-full text-[10px] font-bold border border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400 hover:text-white"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved User Mixes */}
            <div className="flex flex-col gap-2 pt-3 border-t border-white/5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">My Saved Mixes</span>
              {savedMixes.length === 0 ? (
                <span className="text-[10px] text-slate-500 font-semibold italic">No saved mixes yet.</span>
              ) : (
                <div className="flex flex-col gap-2">
                  {savedMixes.map((mix) => (
                    <div key={mix.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                      <button
                        onClick={() => loadPreset(mix.sounds, mix.masterVolume, mix.flowMode, mix.flowIntensity)}
                        className="font-bold text-slate-300 hover:text-white text-left truncate flex-grow mr-2"
                      >
                        {mix.name}
                      </button>
                      <button
                        onClick={() => deleteMix(mix.id)}
                        className="text-slate-500 hover:text-rose-400"
                        aria-label={`Delete saved mix ${mix.name}`}
                      >
                        <Icons.Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={resetMix}
              className="mt-2 py-2.5 w-full rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Icons.RotateCcw size={14} />
              Reset Soundscape
            </button>
          </div>
        </div>

        {/* Alerts & Modals */}
        <TimerModal
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          timerTime={timerTime}
          isTimerActive={isTimerActive}
          onStartTimer={startTimer}
          onCancelTimer={cancelTimer}
        />

        <SaveMixModal
          isOpen={isSaveOpen}
          onClose={() => setIsSaveOpen(false)}
          onSave={handleSaveMixSubmit}
        />

        <ShareMixModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          soundsState={soundsState}
          masterVolume={masterVolume}
          flowMode={flowMode}
          flowIntensity={flowIntensity}
        />
      </div>

      {/* --- EXTRA DOCUMENTATION SECTION BELOW VIEWFOLD (SEO/FAQ) --- */}
      <div className="extra-content-section">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <UseCases />
          <FAQSection />
        </div>
      </div>
    </div>
  );
}
