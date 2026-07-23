"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind, Play, Pause, RotateCcw, Volume2, VolumeX, ChevronDown, CheckCircle,
  HelpCircle, Star, Sparkles, Clock, Flame,
  Sparkle, Sliders, Moon, Sun, Smile, AlertCircle, Battery,
  Compass, ChevronRight, TrendingDown, TrendingUp, BarChart2, Check, X
} from "lucide-react";
import { toast } from "sonner";

// Scientific breathing techniques
const TECHNIQUES = [
  {
    key: "4-7-8",
    name: "4-7-8 Breathing",
    description: "Reduce stress & anxiety",
    pattern: "4-7-8 Pattern",
    durationStr: "7 min",
    cyclesStr: "12 cycles",
    recommended: true,
    phases: [
      { name: "Inhale", duration: 4, scale: 1.4, color: "border-cyan-400 bg-cyan-500/20 text-cyan-700 dark:text-cyan-100 shadow-[0_0_40px_rgba(34,211,238,0.3)]" },
      { name: "Hold", duration: 7, scale: 1.4, color: "border-blue-400 bg-blue-500/20 text-blue-700 dark:text-blue-100 shadow-[0_0_40px_rgba(59,130,246,0.3)]" },
      { name: "Exhale", duration: 8, scale: 1.0, color: "border-teal-400 bg-teal-500/20 text-teal-700 dark:text-teal-100 shadow-[0_0_40px_rgba(45,212,191,0.3)]" }
    ]
  },
  {
    key: "box",
    name: "Box Breathing",
    description: "Improve focus & clarity",
    pattern: "4-4-4-4 Pattern",
    durationStr: "5 min",
    cyclesStr: "10 cycles",
    phases: [
      { name: "Inhale", duration: 4, scale: 1.4, color: "border-indigo-400 bg-indigo-500/20 text-indigo-700 dark:text-indigo-100 shadow-[0_0_40px_rgba(129,140,248,0.3)]" },
      { name: "Hold", duration: 4, scale: 1.4, color: "border-violet-400 bg-violet-500/20 text-violet-700 dark:text-violet-100 shadow-[0_0_40px_rgba(167,139,250,0.3)]" },
      { name: "Exhale", duration: 4, scale: 1.0, color: "border-pink-400 bg-pink-500/20 text-pink-700 dark:text-pink-100 shadow-[0_0_40px_rgba(244,114,182,0.3)]" },
      { name: "Hold", duration: 4, scale: 1.0, color: "border-slate-400 bg-slate-500/20 text-slate-700 dark:text-slate-100 shadow-[0_0_40px_rgba(148,163,184,0.3)]" }
    ]
  },
  {
    key: "deepsleep",
    name: "Deep Sleep",
    description: "Fall asleep faster",
    pattern: "4-2-4 Pattern",
    durationStr: "10 min",
    cyclesStr: "15 cycles",
    phases: [
      { name: "Inhale", duration: 4, scale: 1.3, color: "border-blue-500 bg-blue-600/20 text-blue-800 dark:text-blue-100 shadow-[0_0_40px_rgba(37,99,235,0.3)]" },
      { name: "Hold", duration: 2, scale: 1.3, color: "border-purple-400 bg-purple-500/20 text-purple-700 dark:text-purple-100 shadow-[0_0_40px_rgba(139,92,246,0.3)]" },
      { name: "Exhale", duration: 4, scale: 1.0, color: "border-indigo-400 bg-indigo-500/20 text-indigo-700 dark:text-indigo-100 shadow-[0_0_40px_rgba(99,102,241,0.3)]" }
    ]
  },
  {
    key: "morning",
    name: "Morning Energy",
    description: "Boost your energy",
    pattern: "2-2 Pattern",
    durationStr: "5 min",
    cyclesStr: "10 cycles",
    phases: [
      { name: "Inhale", duration: 2, scale: 1.4, color: "border-amber-400 bg-amber-500/20 text-amber-700 dark:text-amber-100 shadow-[0_0_40px_rgba(245,158,11,0.3)]" },
      { name: "Exhale", duration: 2, scale: 1.0, color: "border-orange-400 bg-orange-500/20 text-orange-700 dark:text-orange-100 shadow-[0_0_40px_rgba(249,115,22,0.3)]" }
    ]
  }
];

// Meditative Sound Engine for continuous, high-quality relaxation tones
class MeditativeSoundSynth {
  constructor() {
    this.ctx = null;
    this.nodes = {};
  }
  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
  }
  playBellChime() {
    this.init();
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(528, now); // Solfeggio 528Hz

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(792, now); // Harmonic fifth

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.10, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.2);
      osc2.stop(now + 2.2);
    } catch (e) { }
  }
  startStressRelief(volume, master) {
    this.init();
    this.stopStressRelief();
    try {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, this.ctx.currentTime); // Solfeggio 528Hz drone

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime((volume / 100) * (master / 100) * 0.12, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.nodes.stress = osc;
    } catch (e) { }
  }
  stopStressRelief() {
    if (this.nodes.stress) {
      try { this.nodes.stress.stop(); } catch (e) { }
      this.nodes.stress = null;
    }
  }
  startOcean(volume, master) {
    this.init();
    this.stopOcean();
    try {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(136.1, this.ctx.currentTime); // Om chant fundamental drone

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime((volume / 100) * (master / 100) * 0.18, this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.nodes.ocean = osc;
    } catch (e) { }
  }
  stopOcean() {
    if (this.nodes.ocean) {
      try { this.nodes.ocean.stop(); } catch (e) { }
      this.nodes.ocean = null;
    }
  }
  stopAll() {
    this.stopStressRelief();
    this.stopOcean();
  }
}

// Visual Worlds configuration with highly visible live Himalayas Nature Videos
const VISUAL_WORLDS = [
  {
    key: "Himalayas",
    name: "Himalayan Peaks",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-snow-capped-mountains-under-a-blue-sky-40742-large.mp4",
    bgImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=80",
    bgGradient: "from-black/60 via-transparent to-black/40"
  },
  {
    key: "Dawn",
    name: "Himalayan Dawn",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-timelapse-of-clouds-over-mountains-43097-large.mp4",
    bgImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    bgGradient: "from-black/60 via-transparent to-black/40"
  },
  {
    key: "Forest",
    name: "Himalayan Valley",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-pine-forest-valley-41551-large.mp4",
    bgImage: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=1920&q=80",
    bgGradient: "from-black/60 via-transparent to-black/40"
  },
  {
    key: "Sunset",
    name: "Himalayan Sunset",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunset-over-mountain-peaks-43098-large.mp4",
    bgImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
    bgGradient: "from-black/60 via-transparent to-black/40"
  }
];

export default function DeepBreathingGuide() {
  const [activeWorld, setActiveWorld] = useState("Himalayas");
  const [activeTechKey, setActiveTechKey] = useState("4-7-8");
  const [ambientSound, setAmbientSound] = useState(true);

  // Feeling & AI recommendation
  const [feeling, setFeeling] = useState("Stressed");
  const [aiRecommendation, setAiRecommendation] = useState("4-7-8 Breathing is perfect for stress relief right now.");

  // Playback state
  const [isRunning, setIsRunning] = useState(false);
  const [breathState, setBreathState] = useState({ phaseIndex: 0, secondsLeft: 0 });
  const [initialTotalSeconds, setInitialTotalSeconds] = useState(0);
    const [totalSecondsLeft, setTotalSecondsLeft] = useState(0);
  // In togglePlay start block setInitialTotalSeconds(computeTotalSeconds(activeTech));
  // In startSessionWithTech start block setInitialTotalSeconds(computeTotalSeconds(selectedTech));
  // In endSession replace hardcoded 322 with initialTotalSeconds;
  // In resetSession also reset initialTotalSeconds to 0;
  const [breathCount, setBreathCount] = useState(0);

  // Soundscape sliders

  const [playOcean, setPlayOcean] = useState(true);
  const [volWaves, setVolWaves] = useState(80);
  const [volWind, setVolWind] = useState(30);
  const [masterVolume, setMasterVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [activeStatTab, setActiveStatTab] = useState("Mind Score");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [prepSeconds, setPrepSeconds] = useState(0);
  const [experienceLevel, setExperienceLevel] = useState("Moderate");

  const getPastDateString = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  useEffect(() => {
    const stored = localStorage.getItem("serene_breath_history_v3");
    if (stored) {
      setHistory(JSON.parse(stored));
    } else {
      setHistory([]);
    }
  }, []);

  const levelMultipliers = { Beginner: 0.75, Moderate: 1.0, Pro: 1.25 };
  const rawActiveTech = TECHNIQUES.find(t => t.key === activeTechKey) || TECHNIQUES[0];
  const activeTech = {
    ...rawActiveTech,
    phases: rawActiveTech.phases.map(p => ({
      ...p,
      duration: Math.max(1, Math.round(p.duration * levelMultipliers[experienceLevel]))
    }))
  };
  const currentPhase = activeTech.phases[breathState.phaseIndex];

  const synthRef = useRef(null);
  const videoRef = useRef(null);

  // Force automatic video playback on load and theme switch
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay handled
        });
      }
    }
  }, [activeWorld]);

  useEffect(() => {
    synthRef.current = new MeditativeSoundSynth();
    return () => {
      if (synthRef.current) {
        synthRef.current.stopAll();
      }
    };
  }, []);

  // Sync audio
  useEffect(() => {
    if (!synthRef.current) return;
    if (isRunning && ambientSound) {
      if (playOcean) synthRef.current.startOcean(volWaves, masterVolume);
      else synthRef.current.stopOcean();
    } else {
      synthRef.current.stopAll();
    }
  }, [isRunning, ambientSound, playOcean, volWaves, masterVolume]);


  // Helper formatTime function
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Helper to compute total seconds for a technique (uses already-scaled phases from activeTech)
  const computeTotalSeconds = (tech) => {
    const cycles = Number(tech.cyclesStr?.split(' ')[0]) || 10;
    const lvlMult = { Beginner: 0.75, Moderate: 1.0, Pro: 1.25 };
    const scaledPhaseSum = tech.phases.reduce((sum, p) => {
      return sum + Math.max(1, Math.round(p.duration * lvlMult[experienceLevel]));
    }, 0);
    return scaledPhaseSum * cycles;
  };

  // Get target cycles for display (e.g. "12 cycles" → 12)
  const targetCycles = Number(rawActiveTech.cyclesStr?.split(' ')[0]) || 10;

  // Main ticker loop
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      // 3-second prep countdown
      if (prepSeconds > 0) {
        setPrepSeconds(prev => {
          if (prev <= 1) {
            if (synthRef.current) {
              synthRef.current.playBellChime();
            }
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      // Decrement total session timer
      setTotalSecondsLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          toast.success("Breathing session completed! Well done.");
          return 0;
        }
        return prev - 1;
      });

      // Advance breath phase
      setBreathState(prev => {
        const nextSeconds = prev.secondsLeft - 1;
        if (nextSeconds <= 0) {
          // Move to next phase
          const nextIdx = (prev.phaseIndex + 1) % activeTech.phases.length;
          const nextPhase = activeTech.phases[nextIdx];

          // When we cycle back to Inhale, that's a new breath
          if (nextPhase.name === "Inhale") {
            setBreathCount(b => b + 1);
          }
          if (synthRef.current) {
            synthRef.current.playBellChime();
          }

          return {
            phaseIndex: nextIdx,
            secondsLeft: nextPhase.duration
          };
        }
        return {
          ...prev,
          secondsLeft: nextSeconds
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, activeTechKey, activeTech.phases, prepSeconds]);

  const togglePlay = () => {
    if (!isRunning) {
      setBreathState({
        phaseIndex: 0,
        secondsLeft: activeTech.phases[0].duration
      });
      const total = computeTotalSeconds(rawActiveTech);
      setTotalSecondsLeft(total);
      setInitialTotalSeconds(total);
      setBreathCount(0);
      setIsRunning(true);
      setIsFullScreen(true);
      setPrepSeconds(3);
      if (synthRef.current) {
        synthRef.current.playBellChime();
      }
      toast.info(`Session started: ${activeTech.name}`);
    } else {
      setIsRunning(false);
    }
  };

  const startSessionWithTech = (techKey) => {
    const selectedTech = TECHNIQUES.find(t => t.key === techKey) || TECHNIQUES[0];
    setActiveTechKey(techKey);
    const lvlMult = { Beginner: 0.75, Moderate: 1.0, Pro: 1.25 };
    setBreathState({
      phaseIndex: 0,
      secondsLeft: Math.max(1, Math.round(selectedTech.phases[0].duration * lvlMult[experienceLevel]))
    });
    const total = computeTotalSeconds(selectedTech);
    setTotalSecondsLeft(total);
    setInitialTotalSeconds(total);
    setBreathCount(0);
    setIsRunning(true);
    setIsFullScreen(true);
    setPrepSeconds(3);
    if (synthRef.current) {
      synthRef.current.playBellChime();
    }
    toast.success(`Starting: ${selectedTech.name}`);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const getChartData = () => {
    let rawVals = [0, 0, 0, 0, 0, 0, 0];
    if (history.length === 0) {
      return rawVals;
    }

    const dayGroups = {};
    history.forEach(entry => {
      const idx = entry.dayIndex;
      if (idx >= 0 && idx <= 6) {
        if (!dayGroups[idx]) dayGroups[idx] = [];
        dayGroups[idx].push(entry);
      }
    });

    Object.keys(dayGroups).forEach(idx => {
      const dayIdx = Number(idx);
      const daySessions = dayGroups[dayIdx];

      if (activeStatTab === "Mind Score") {
        const avgScore = Math.round(daySessions.reduce((acc, s) => acc + s.calmScore, 0) / daySessions.length);
        rawVals[dayIdx] = avgScore;
      } else if (activeStatTab === "Total Minutes") {
        const mins = daySessions.reduce((acc, s) => acc + (s.durationSeconds / 60), 0);
        rawVals[dayIdx] = Math.round(mins * 10) / 10;
      } else if (activeStatTab === "Total Breaths") {
        rawVals[dayIdx] = daySessions.reduce((acc, s) => acc + s.breathsCompleted, 0);
      } else if (activeStatTab === "Sessions") {
        rawVals[dayIdx] = daySessions.length;
      }
    });

    return rawVals;
  };

  const formatTooltipVal = (val) => {
    if (activeStatTab === "Mind Score") return `${val}`;
    if (activeStatTab === "Total Minutes") return `${val}m`;
    if (activeStatTab === "Total Breaths") return `${val}`;
    if (activeStatTab === "Sessions") return `${val} sess`;
    return `${val}`;
  };

  const logSessionAndSave = (seconds, breaths) => {
    const today = new Date();
    const rawDay = today.getDay();
    const dayIndex = (rawDay + 6) % 7; // Mon is 0, Sun is 6

    const durationMin = seconds / 60;
    const baseScore = durationMin >= 5 ? 85 : durationMin >= 2 ? 75 : 65;
    const sessionScore = Math.min(100, Math.max(60, baseScore + Math.floor(Math.random() * 15)));

    const newSession = {
      id: Date.now(),
      timestamp: today.toISOString(),
      dateString: today.toISOString().split("T")[0],
      dayIndex,
      durationSeconds: seconds,
      breathsCompleted: breaths,
      technique: activeTech.name,
      calmScore: sessionScore
    };

    setHistory(prev => {
      const updated = [...prev, newSession];
      localStorage.setItem("serene_breath_history_v3", JSON.stringify(updated));
      return updated;
    });
    toast.success(`Session saved! Calm Score: ${sessionScore}%`);
  };

  // Completion Observer
  useEffect(() => {
    if (totalSecondsLeft === 0 && !isRunning && breathCount > 0) {
      logSessionAndSave(initialTotalSeconds, breathCount);
      resetSession();
      setIsFullScreen(false);
    }
  }, [totalSecondsLeft, isRunning]);

  const resetSession = (lvl = experienceLevel) => {
    setIsRunning(false);
    // Reset all counters to zero; the actual durations will be set when a new session starts
    setBreathState({ phaseIndex: 0, secondsLeft: 0 });
    setBreathCount(0);
    setTotalSecondsLeft(0);
  };

  const endSession = () => {
    setIsRunning(false);
    setIsFullScreen(false);
    const elapsedSeconds = initialTotalSeconds - totalSecondsLeft;
    if (elapsedSeconds > 5 && breathCount > 0) {
      logSessionAndSave(elapsedSeconds, breathCount);
    }
    resetSession();
    toast.info("Session ended");
  };

  const handleFeelingChange = (newFeeling) => {
    setFeeling(newFeeling);
    let rec = "";
    let tech = "4-7-8";
    if (newFeeling === "Stressed") {
      rec = "4-7-8 Breathing is perfect for stress relief right now.";
      tech = "4-7-8";
    } else if (newFeeling === "Anxious") {
      rec = "4-7-8 Breathing is recommended to reduce nervous system activity.";
      tech = "4-7-8";
    } else if (newFeeling === "Tired") {
      rec = "Morning Energy breathing is fantastic to boost your focus and energy.";
      tech = "morning";
    } else if (newFeeling === "Angry") {
      rec = "Box Breathing helps calm active frustration and restore clear thinking.";
      tech = "box";
    } else if (newFeeling === "Calm") {
      rec = "Deep Sleep breathing helps you maintain a relaxed, tranquil state.";
      tech = "deepsleep";
    }
    setAiRecommendation(rec);
    setActiveTechKey(tech);
    resetSession();
    toast.info(`AI suggested ${TECHNIQUES.find(t => t.key === tech).name}`);
  };

  const handleAiChoose = () => {
    const moods = ["Stressed", "Anxious", "Tired", "Angry", "Calm"];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    handleFeelingChange(randomMood);
  };



  const currentWorld = VISUAL_WORLDS.find(w => w.key === activeWorld) || VISUAL_WORLDS[0];
  const chartVals = getChartData();
  const maxVal = Math.max(1, ...chartVals);
  const getY = (val) => {
    if (activeStatTab === "Mind Score") {
      return 100 - ((val - 50) * (80 / 50));
    } else {
      return 100 - (val * (80 / maxVal));
    }
  };
  const yVals = chartVals.map(v => getY(v));

  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Mon is 0, Sun is 6

  const buildPaths = () => {
    if (yVals.length === 0) return { linePath: "", fillPath: "" };
    let linePath = `M 25 ${yVals[0]}`;
    let fillPath = `M 25 120 L 25 ${yVals[0]}`;

    for (let i = 0; i < currentDayIndex; i++) {
      const xStart = 25 + i * 75;
      const xEnd = 25 + (i + 1) * 75;
      const c1 = xStart + 30;
      const c2 = xEnd - 30;
      const seg = ` C ${c1} ${yVals[i]}, ${c2} ${yVals[i+1]}, ${xEnd} ${yVals[i+1]}`;
      linePath += seg;
      fillPath += seg;
    }

    const endX = 25 + currentDayIndex * 75;
    fillPath += ` L ${endX} 120 Z`;

    return { linePath, fillPath };
  };

  const { linePath, fillPath } = buildPaths();

  const leftPct = 5 + currentDayIndex * 15;
  const tooltipY = yVals.length > 0 ? yVals[currentDayIndex] : 60;
  const tooltipVal = chartVals.length > 0 ? chartVals[currentDayIndex] : 0;

  const totalSessions = history.length;
  const totalMinutes = Math.round(history.reduce((acc, s) => acc + (s.durationSeconds / 60), 0));
  const totalBreaths = history.reduce((acc, s) => acc + s.breathsCompleted, 0);
  const currentMindScore = history.length > 0 ? Math.round(history.reduce((acc, s) => acc + s.calmScore, 0) / history.length) : 0;

  return (
    <div className="w-full min-h-screen bg-[#f4f7fb] dark:bg-[#070a13] text-slate-800 dark:text-slate-100 font-sans p-4 sm:p-6 md:p-10 space-y-8 transition-colors duration-500">

      <div className="max-w-[1550px] mx-auto space-y-8">

        {/* 1. TOP HERO VISUALIZER CARD WITH HIMALAYAS LIVE BACKGROUND VIDEO */}
        <div
          className="w-full p-8 md:p-12 rounded-[38px] text-white shadow-2xl relative min-h-[520px] flex flex-col justify-between overflow-hidden transition-all duration-1000 bg-[#0c2a1a] bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(to bottom, rgba(16, 58, 36, 0.4), rgba(12, 42, 26, 0.8)), url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1500&q=80')"
          }}
        >
          {/* Live Himalayas Background Video */}
          <video
            ref={videoRef}
            key={currentWorld.key}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster={currentWorld.bgImage}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 mix-blend-overlay ${isRunning ? "opacity-45" : "opacity-10 pointer-events-none"}`}
          >
            <source src={currentWorld.videoUrl} type="video/mp4" />
          </video>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full relative z-10 w-full">

            {/* Left Column: Moods & Recommendation */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                  How are you<br />feeling right now?
                </h1>
              </div>

              {/* Mood Selector Buttons */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Stressed", icon: AlertCircle, color: "hover:border-red-400/50 hover:bg-red-500/10" },
                  { label: "Anxious", icon: HelpCircle, color: "hover:border-amber-400/50 hover:bg-amber-500/10" },
                  { label: "Tired", icon: Battery, color: "hover:border-blue-400/50 hover:bg-blue-500/10" },
                  { label: "Angry", icon: Flame, color: "hover:border-orange-400/50 hover:bg-orange-500/10" },
                  { label: "Calm", icon: Smile, color: "hover:border-green-400/50 hover:bg-green-500/10" }
                ].map((mood) => {
                  const isSelected = feeling === mood.label;
                  return (
                    <button
                      key={mood.label}
                      onClick={() => handleFeelingChange(mood.label)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer w-20 h-20 ${isSelected
                          ? "bg-green-500/20 border-green-400 text-green-400 shadow-lg scale-105"
                          : `border-white/10 bg-white/5 text-white/70 ${mood.color}`
                        }`}
                    >
                      <mood.icon className="w-6 h-6 mb-1.5" />
                      <span className="text-[10px] font-bold block truncate max-w-full">{mood.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Experience Level Selector */}
              <div className="space-y-2 pt-1 text-left">
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">Experience Level</span>
                <div className="inline-flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                  {["Beginner", "Moderate", "Pro"].map((lvl) => {
                    const isSelected = experienceLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        onClick={() => {
                          setExperienceLevel(lvl);
                          resetSession(lvl);
                          toast.success(`Experience level set to: ${lvl}`);
                        }}
                        className={`py-1.5 px-4 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white text-[#103a24] shadow-lg scale-100"
                            : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recommendation Box */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80 tracking-wide">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Recommendation</span>
                </div>

                {/* Recommended Card */}
                {(() => {
                  const moodMeta = {
                    Stressed: { badge: "Best for Stress Relief", techKey: "4-7-8" },
                    Anxious: { badge: "Calm Nervous System", techKey: "4-7-8" },
                    Tired: { badge: "Boost Alertness", techKey: "morning" },
                    Angry: { badge: "Cool Down Fast", techKey: "box" },
                    Calm: { badge: "Maintain Zen State", techKey: "deepsleep" }
                  }[feeling] || { badge: "Best for Balance", techKey: "4-7-8" };

                  const recommendedTech = TECHNIQUES.find(t => t.key === moodMeta.techKey) || TECHNIQUES[0];

                  return (
                    <div
                      onClick={() => {
                        setActiveTechKey(recommendedTech.key);
                        resetSession();
                        toast.success(`Selected recommended technique: ${recommendedTech.name}`);
                      }}
                      className="p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer max-w-md group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-white">{recommendedTech.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/20">
                            {moodMeta.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60">
                          {recommendedTech.durationStr || "7 min"} • {recommendedTech.cyclesStr || "12 Cycles"}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Column: Breathing Circular Visualizer */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">

              {/* 1. START SESSION STATE */}
              <div
                onClick={togglePlay}
                className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-black/20 border border-white/10 flex flex-col items-center justify-center text-center p-8 hover:border-white/20 hover:bg-black/30 transition-all cursor-pointer group shadow-2xl"
              >
                {/* Decorative Glowing Rings */}
                <div className="absolute inset-0 rounded-full border border-green-500/20 animate-pulse pointer-events-none scale-105" />
                <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />

                <svg className="w-8 h-8 text-green-400 mb-4 animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,8,4,16,4,16C4,16,11.5,15,16,11C18.5,8.8,19,5,19,5C19,5,18.8,7.8,17,8Z" />
                  <path d="M12,12C9,12,7.3,16,7.3,16C7.3,16,11.5,15,14,12.5C15.4,11.1,15.7,9,15.7,9C15.7,9,15.5,10.7,14,12Z" opacity="0.7" />
                </svg>

                <h3 className="font-extrabold text-xl tracking-tight text-white mb-1.5">
                  Start Your Session
                </h3>
                <p className="text-[11px] text-white/70 max-w-[200px] leading-relaxed mb-6">
                  Take a deep breath and let's begin
                </p>

                <div className="w-14 h-14 rounded-full bg-white text-[#103a24] flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 2. STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mind Score */}
          <div
            onClick={() => setActiveStatTab("Mind Score")}
            className={`p-5 rounded-[26px] bg-white dark:bg-[#0c1220] border flex items-center gap-4 cursor-pointer transition-all duration-300 ${
              activeStatTab === "Mind Score"
                ? "border-green-500 ring-2 ring-green-500/10 shadow-md scale-[1.02]"
                : "border-slate-100 dark:border-white/5 shadow-sm hover:border-slate-200 dark:hover:border-white/10 hover:scale-[1.01]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Sparkle className="w-6 h-6 fill-current" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Mind Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{currentMindScore}</span>
                <span className="text-xs font-semibold text-emerald-500">{currentMindScore === 0 ? "Inactive" : currentMindScore >= 80 ? "Calm" : currentMindScore >= 70 ? "Focused" : "Active"}</span>
              </div>
            </div>
            {/* Mini line graph SVG */}
            <div className="w-16 h-8 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 60 20">
                <path d="M 0 15 Q 15 5, 30 12 T 60 4" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Total Minutes */}
          <div
            onClick={() => setActiveStatTab("Total Minutes")}
            className={`p-5 rounded-[26px] bg-white dark:bg-[#0c1220] border flex items-center gap-4 cursor-pointer transition-all duration-300 ${
              activeStatTab === "Total Minutes"
                ? "border-green-500 ring-2 ring-green-500/10 shadow-md scale-[1.02]"
                : "border-slate-100 dark:border-white/5 shadow-sm hover:border-slate-200 dark:hover:border-white/10 hover:scale-[1.01]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Minutes</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{totalMinutes}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">This Week</span>
            </div>
          </div>

          {/* Total Breaths */}
          <div
            onClick={() => setActiveStatTab("Total Breaths")}
            className={`p-5 rounded-[26px] bg-white dark:bg-[#0c1220] border flex items-center gap-4 cursor-pointer transition-all duration-300 ${
              activeStatTab === "Total Breaths"
                ? "border-green-500 ring-2 ring-green-500/10 shadow-md scale-[1.02]"
                : "border-slate-100 dark:border-white/5 shadow-sm hover:border-slate-200 dark:hover:border-white/10 hover:scale-[1.01]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
              <Wind className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Total Breaths</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{totalBreaths.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">This Week</span>
            </div>
          </div>

          {/* Sessions */}
          <div
            onClick={() => setActiveStatTab("Sessions")}
            className={`p-5 rounded-[26px] bg-white dark:bg-[#0c1220] border flex items-center gap-4 cursor-pointer transition-all duration-300 ${
              activeStatTab === "Sessions"
                ? "border-green-500 ring-2 ring-green-500/10 shadow-md scale-[1.02]"
                : "border-slate-100 dark:border-white/5 shadow-sm hover:border-slate-200 dark:hover:border-white/10 hover:scale-[1.01]"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Sessions</span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{totalSessions}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">This Week</span>
            </div>
          </div>
        </div>

        {/* 3. RECOMMENDED FOR YOU */}
        <div className="space-y-4">
          <div className="text-left">
            <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Recommended For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECHNIQUES.map((tech) => {
              const isActive = activeTechKey === tech.key;

              const meta = {
                "4-7-8": { icon: Sparkle, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
                box: { icon: Sliders, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
                deepsleep: { icon: Moon, color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
                morning: { icon: Sun, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" }
              }[tech.key] || { icon: Wind, color: "text-green-500 bg-green-500/10 border-green-500/30" };

              return (
                <div
                  key={tech.key}
                  onClick={() => startSessionWithTech(tech.key)}
                  className={`p-4 rounded-3xl border transition-all flex items-center justify-between cursor-pointer text-left ${isActive
                      ? "bg-green-500/10 dark:bg-green-500/5 border-green-500 text-green-805 dark:text-green-300 shadow-sm"
                      : "bg-white dark:bg-[#0c1220] border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${meta.color}`}>
                      <meta.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-white leading-snug">{tech.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mb-1 truncate max-w-[140px]">{tech.description}</p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block">
                        {tech.durationStr} • {tech.cyclesStr}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startSessionWithTech(tech.key);
                    }}
                    className="w-8 h-8 rounded-full bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center hover:scale-105 transition shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>



        {/* 5. PROGRESS & INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Your Progress (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center text-left">
              <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight">Your Progress — {activeStatTab}</h2>
              <div className="relative">
                <select className="appearance-none pl-3 pr-8 py-1 rounded-full bg-white dark:bg-[#0c1220] border border-slate-100 dark:border-white/5 text-[11px] font-bold text-slate-500 cursor-pointer focus:outline-none">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-100 dark:border-white/5 shadow-sm flex flex-col justify-between min-h-[220px]">
              {/* Responsive SVG Line Chart */}
              <div className="w-full h-40 relative">
                {/* Tooltip Tag */}
                <div
                  className="absolute bg-green-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md shadow-md -translate-y-full -translate-x-1/2 flex items-center justify-center gap-0.5 z-10"
                  style={{ left: `${leftPct}%`, top: `${tooltipY * 1.33}px` }}
                >
                  <span>{formatTooltipVal(tooltipVal)}</span>
                </div>

                <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-white/5" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-white/5" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-white/5" />

                  {/* Gradient Area */}
                  {fillPath && <path d={fillPath} fill="url(#chartGrad)" />}

                  {/* Smooth Line */}
                  {linePath && <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />}

                  {/* Dynamic Points up to today */}
                  {[0, 1, 2, 3, 4, 5, 6].map(i => {
                    if (i > currentDayIndex) return null;
                    const cx = 25 + i * 75;
                    const isToday = i === currentDayIndex;
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={yVals[i]}
                        r={isToday ? 5 : 4}
                        fill="#10b981"
                        stroke={isToday ? "#ffffff" : "none"}
                        strokeWidth={isToday ? 2 : 0}
                        className={isToday ? "dark:stroke-[#0c1220]" : ""}
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-50 dark:border-white/5">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* AI Insight (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight text-left">AI Insight</h2>
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-100 dark:border-white/5 space-y-5 shadow-sm text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">AI Insight</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Great job! Your average stress level is 23% lower than last week.
                  </p>
                </div>
              </div>

              {/* Metrics Changes */}
              <div className="grid grid-cols-3 gap-3 border-t border-slate-55 dark:border-white/5 pt-4">
                <div className="text-left space-y-1">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Stress</span>
                  <div className="flex items-center gap-0.5 text-xs font-black text-green-600 dark:text-green-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>23%</span>
                  </div>
                </div>
                <div className="text-left space-y-1">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Focus</span>
                  <div className="flex items-center gap-0.5 text-xs font-black text-green-600 dark:text-green-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>18%</span>
                  </div>
                </div>
                <div className="text-left space-y-1">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Sleep</span>
                  <div className="flex items-center gap-0.5 text-xs font-black text-green-600 dark:text-green-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>12%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInsightsModal(true)}
                className="w-full py-3 rounded-2xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <BarChart2 className="w-4 h-4" />
                View Detailed Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. DETAILED INSIGHTS MODAL */}
      <AnimatePresence>
        {showInsightsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsightsModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0c1220] rounded-[32px] border border-slate-200/60 dark:border-white/10 shadow-2xl overflow-hidden text-slate-800 dark:text-white"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Mindfulness Detailed Insights</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Real-time statistics synced from your local storage</p>
                </div>
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition flex items-center justify-center text-slate-600 dark:text-white cursor-pointer text-sm font-black"
                >
                  ✕
                </button>
              </div>

              {/* Body Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto">
                {/* Left Column: Stats & Achievements */}
                <div className="space-y-4 text-left">
                  <h4 className="text-xs font-black uppercase text-green-500 tracking-wider">Achievements & Milestones</h4>

                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0">
                        🏆
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs">First Breath</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Completed your first guided session</p>
                      </div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                      history.length >= 3
                        ? "bg-amber-500/10 border-amber-500/20 text-slate-850 dark:text-white"
                        : "bg-slate-100/50 dark:bg-white/5 border-transparent opacity-60"
                    }`}>
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                        🔥
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs">Consistent Yogi</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Log at least 3 breathing sessions</p>
                      </div>
                    </div>

                    <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                      history.length >= 10
                        ? "bg-purple-500/10 border-purple-500/20 text-slate-850 dark:text-white"
                        : "bg-slate-100/50 dark:bg-white/5 border-transparent opacity-60"
                    }`}>
                      <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center shrink-0">
                        🧘
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs">Zen Master</h5>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Log at least 10 breathing sessions</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Logged Sessions List */}
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase text-green-500 tracking-wider">Session History ({history.length})</h4>
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear your local history?")) {
                            localStorage.removeItem("serene_breath_history_v3");
                            setHistory([]);
                            toast.success("History cleared successfully!");
                          }
                        }}
                        className="text-[9px] font-bold text-red-500 hover:underline"
                      >
                        Clear History
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {history.slice().reverse().map((s) => (
                      <div key={s.id || s.timestamp} className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex justify-between items-center">
                        <div>
                          <h5 className="font-extrabold text-xs">{s.technique || "Breathing Session"}</h5>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">
                            {s.dateString} • {Math.round(s.durationSeconds)}s • {s.breathsCompleted} breaths
                          </span>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-black border border-green-500/20">
                          {s.calmScore}%
                        </div>
                      </div>
                    ))}

                    {history.length === 0 && (
                      <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                        No breathing sessions logged yet. Start a session above to see it here!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-end">
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. FULL SCREEN IMMERSIVE BREATHING SESSION OVERLAY */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070a13] overflow-hidden select-none"
          >
            {/* Background cover image */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
              style={{
                backgroundImage: `linear-gradient(to bottom, rgba(16, 58, 36, 0.45), rgba(10, 30, 18, 0.85)), url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1500&q=80')`
              }}
            />

            {/* Live Video Overlay */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={currentWorld.bgImage}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 mix-blend-overlay opacity-40 pointer-events-none"
            >
              <source src={currentWorld.videoUrl} type="video/mp4" />
            </video>

            {/* Immersive Top-Right Close Button: circle and crossed */}
            <button
              onClick={endSession}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center shadow-lg transition-all duration-300 backdrop-blur-md cursor-pointer hover:rotate-90 z-50"
              aria-label="Close breathing session"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Perfectly Centered Breathing visualizer */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-8 max-w-md w-full px-4 text-white">

              {prepSeconds > 0 ? (
                /* PREPARATION COUNTDOWN STATE */
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex flex-col items-center justify-center bg-black/40 border-2 border-white/10 rounded-full backdrop-blur-md shadow-2xl">
                  {/* Decorative pulsing rings */}
                  <div className="absolute inset-0 rounded-full border border-green-500/20 animate-ping pointer-events-none scale-95" />
                  <div className="absolute inset-4 border border-white/5 rounded-full pointer-events-none" />

                  <span className="text-xs uppercase tracking-widest font-black text-green-400 opacity-90 block mb-2">
                    Get Ready
                  </span>
                  <motion.span
                    key={prepSeconds}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.15, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-8xl font-black tracking-tight my-1 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    {prepSeconds}
                  </motion.span>
                  <span className="text-[10px] uppercase tracking-wider block opacity-70 mt-2 max-w-[180px] text-center font-bold">
                    Prepare to Breathe
                  </span>
                </div>
              ) : (
                /* Circular Visualizer (Inhale/Hold/Exhale) */
                <>
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                    {/* Progress Ring */}
                    <svg className="absolute w-64 sm:w-72 h-64 sm:h-72 transform -rotate-90 z-20">
                      <circle cx="144" cy="144" r="130" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="transparent" />
                      <circle
                        cx="144"
                        cy="144"
                        r="130"
                        stroke="#4ade80"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray={816.8}
                        strokeDashoffset={Math.max(0, 816.8 - (816.8 * (currentPhase.duration - breathState.secondsLeft)) / currentPhase.duration)}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>

                    {/* Pulsing Visual Circle */}
                    <motion.div
                      key={breathState.phaseIndex}
                      initial={{ scale: currentPhase.name === "Inhale" ? 0.95 : 1.15 }}
                      animate={{ scale: Math.min(currentPhase.scale, 1.15) }}
                      transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
                      className="z-10 w-44 sm:w-52 h-44 sm:h-52 rounded-full flex flex-col items-center justify-center bg-green-700/50 border-4 border-green-400/40 backdrop-blur-md shadow-2xl"
                    >
                      <span className="text-[10px] uppercase tracking-widest font-extrabold opacity-90 block">
                        {currentPhase.name}
                      </span>
                      <span className="text-6xl font-black tracking-tight my-0.5 drop-shadow-xl">
                        {breathState.secondsLeft}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider block opacity-80">
                        SECONDS
                      </span>
                    </motion.div>

                    {/* Outer Orbit */}
                    <div className="absolute inset-4 border border-white/10 rounded-full animate-pulse pointer-events-none" />
                  </div>

                  {/* Session Meta */}
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className="flex gap-4 text-xs font-bold bg-black/40 border border-white/10 px-5 py-2 rounded-full backdrop-blur-md shadow-inner">
                      <span className="text-white/80">Time: <span className="text-green-400">{formatTime(totalSecondsLeft)}</span></span>
                      <span className="text-white/20">|</span>
                      <span className="text-white/80">Breaths: <span className="text-green-400">{breathCount}/{targetCycles}</span></span>
                    </div>

                    <div className="text-center space-y-1">
                      <p className="text-sm font-extrabold text-white/95">{activeTech.name}</p>
                      <p className="text-xs text-white/65 tracking-wide font-semibold">{activeTech.description}</p>
                    </div>

                    {/* Audio controls overlay */}
                    <div className="flex items-center gap-4 bg-black/30 border border-white/5 rounded-2xl p-3.5 mt-2 shadow-xl backdrop-blur-md w-full justify-center max-w-xs">
                      <button
                        onClick={togglePlay}
                        className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-105 transition cursor-pointer shadow-md"
                      >
                        {isRunning ? <Pause className="w-3.5 h-3.5 fill-white text-white" /> : <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />}
                      </button>

                      <button
                        onClick={toggleMute}
                        className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:scale-105 transition cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={masterVolume}
                        onChange={e => setMasterVolume(Number(e.target.value))}
                        className="w-20 accent-green-400 h-1.5 rounded-lg cursor-pointer bg-white/20"
                      />
                    </div>
                  </div>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
