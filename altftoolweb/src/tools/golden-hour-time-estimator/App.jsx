"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Sun,
  Moon,
  Sunset,
  Compass,
  MapPin,
  Calendar,
  Bell,
  Plus,
  Trash2,
  Camera,
  Sparkles,
  Bookmark,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  History,
  CheckCircle2,
  Zap,
  Cloud,
  CloudSun,
  CloudLightning
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LOCATION_PRESETS,
  getTimezoneOffset,
  calculateLightingTimes,
  detectLightingPhase,
  formatMinuteToTime,
  formatDuration
} from "./utils/solarMath";

// Theme-Agnostic Glassmorphism Card Container (Standard Blue Brand Accents)
const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`bg-(--card) border border-(--border) rounded-[32px] p-6 shadow-xl hover:border-blue-500/20 transition-all ${className}`}
  >
    {title && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            {Icon && <Icon size={18} className="animate-pulse-slow" />}
          </div>
          <h3 className="text-sm font-black uppercase tracking-widest text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

export default function GoldenHourEstimator() {
  // --- Header Title Typing State ---
  const [titleText, setTitleText] = useState("");
  const fullTitle = "Golden Hour Estimator";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTitleText(fullTitle.slice(0, index));
      index++;
      if (index > fullTitle.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // --- Location Configuration States ---
  const [selectedPresetId, setSelectedPresetId] = useState("new-york");
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);
  const [timezoneName, setTimezoneName] = useState("America/New_York");
  const [customLocationName, setCustomLocationName] = useState("");
  const [savedLocations, setSavedLocations] = useState([]);
  
  // --- Date Picker State ---
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().substring(0, 10)
  );

  // --- Weather Sim Preset ---
  const [weatherCondition, setWeatherCondition] = useState("clear"); // clear, partly_cloudy, overcast, storm

  // --- Notification Reminder Preferences ---
  const [notificationsAllowed, setNotificationsAllowed] = useState(false);
  const [notifyBeforeMinutes, setNotifyBeforeMinutes] = useState(15);
  const [notifyForSunrise, setNotifyForSunrise] = useState(true);
  const [notifyForGoldenHour, setNotifyForGoldenHour] = useState(true);

  // --- Feedback Messages ---
  const [successMsg, setSuccessMsg] = useState("");

  // --- Real-time Ticker ---
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Local Storage Hydration ---
  useEffect(() => {
    try {
      const storedPreset = localStorage.getItem("gh_selected_preset");
      const storedLat = localStorage.getItem("gh_latitude");
      const storedLng = localStorage.getItem("gh_longitude");
      const storedTz = localStorage.getItem("gh_timezone");
      const storedSaved = localStorage.getItem("gh_saved_locations");
      const storedNotifyMins = localStorage.getItem("gh_notify_before_mins");
      const storedNotifySunrise = localStorage.getItem("gh_notify_sunrise");
      const storedNotifyGolden = localStorage.getItem("gh_notify_golden");

      if (storedPreset) setSelectedPresetId(storedPreset);
      if (storedLat) setLatitude(parseFloat(storedLat));
      if (storedLng) setLongitude(parseFloat(storedLng));
      if (storedTz) setTimezoneName(storedTz);
      if (storedSaved) setSavedLocations(JSON.parse(storedSaved));
      if (storedNotifyMins) setNotifyBeforeMinutes(parseInt(storedNotifyMins));
      if (storedNotifySunrise) setNotifyForSunrise(storedNotifySunrise === "true");
      if (storedNotifyGolden) setNotifyForGoldenHour(storedNotifyGolden === "true");

      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationsAllowed(Notification.permission === "granted");
      }
    } catch (e) {
      console.error("Local storage restoration failed", e);
    }
  }, []);

  // --- Persistence Handlers ---
  const triggerNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!customLocationName.trim()) return;

    const newLoc = {
      id: "saved-" + Date.now(),
      name: customLocationName.trim(),
      lat: parseFloat(latitude.toFixed(4)),
      lng: parseFloat(longitude.toFixed(4)),
      timezone: timezoneName,
    };

    const updated = [newLoc, ...savedLocations];
    setSavedLocations(updated);
    localStorage.setItem("gh_saved_locations", JSON.stringify(updated));
    setCustomLocationName("");
    triggerNotification(`Venue Saved: ${newLoc.name}`);
  };

  const handleDeleteLocation = (id) => {
    const updated = savedLocations.filter((l) => l.id !== id);
    setSavedLocations(updated);
    localStorage.setItem("gh_saved_locations", JSON.stringify(updated));
    triggerNotification("Venue deleted.");
  };

  const handleSelectPreset = (id) => {
    setSelectedPresetId(id);
    localStorage.setItem("gh_selected_preset", id);

    if (id === "gps") {
      triggerGPSDetection();
    } else {
      const preset = LOCATION_PRESETS.find((p) => p.id === id);
      if (preset) {
        setLatitude(preset.lat);
        setLongitude(preset.lng);
        setTimezoneName(preset.timezone);
        localStorage.setItem("gh_latitude", preset.lat.toString());
        localStorage.setItem("gh_longitude", preset.lng.toString());
        localStorage.setItem("gh_timezone", preset.timezone);
        triggerNotification(`Switched to preset: ${preset.name}`);
      }
    }
  };

  const handleSelectSaved = (loc) => {
    setSelectedPresetId(loc.id);
    setLatitude(loc.lat);
    setLongitude(loc.lng);
    setTimezoneName(loc.timezone);
    localStorage.setItem("gh_latitude", loc.lat.toString());
    localStorage.setItem("gh_longitude", loc.lng.toString());
    localStorage.setItem("gh_timezone", loc.timezone);
    triggerNotification(`Switched to venue: ${loc.name}`);
  };

  const triggerGPSDetection = () => {
    if (!navigator.geolocation) {
      alert("GPS Geolocation is not supported by your browser.");
      return;
    }
    triggerNotification("Accessing GPS satellite network...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        const autoTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        setTimezoneName(autoTz);

        localStorage.setItem("gh_latitude", lat.toString());
        localStorage.setItem("gh_longitude", lng.toString());
        localStorage.setItem("gh_timezone", autoTz);
        triggerNotification("GPS Coordinates Anchored Successfully!");
      },
      (err) => {
        console.error("GPS lock failed", err);
        alert("Failed to access location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const requestNotificationPermission = () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      const granted = permission === "granted";
      setNotificationsAllowed(granted);
      if (granted) {
        triggerNotification("Planning notifications unlocked!");
        new Notification("Golden Hour Alert Enabled", {
          body: "You will receive real-time camera alerts before shoots!",
          icon: "/favicon.ico",
        });
      }
    });
  };

  // --- Compute Dates ---
  const activeDate = useMemo(() => {
    return new Date(selectedDateStr + "T12:00:00");
  }, [selectedDateStr]);

  const timezoneOffset = useMemo(() => {
    return getTimezoneOffset(timezoneName, activeDate);
  }, [timezoneName, activeDate]);

  const currentCalculations = useMemo(() => {
    return calculateLightingTimes(latitude, longitude, activeDate, timezoneOffset);
  }, [latitude, longitude, activeDate, timezoneOffset]);

  const tomorrowCalculations = useMemo(() => {
    const nextDay = new Date(activeDate.getTime() + 24 * 60 * 60 * 1000);
    const nextOffset = getTimezoneOffset(timezoneName, nextDay);
    return calculateLightingTimes(latitude, longitude, nextDay, nextOffset);
  }, [latitude, longitude, activeDate, timezoneName]);

  const currentMinutesOffset = useMemo(() => {
    const localTz = -systemTime.getTimezoneOffset() / 60;
    const currentMinLocal = systemTime.getHours() * 60 + systemTime.getMinutes() + systemTime.getSeconds() / 60;
    const diffHours = timezoneOffset - localTz;
    let targetMin = currentMinLocal + diffHours * 60;
    while (targetMin < 0) targetMin += 1440;
    while (targetMin >= 1440) targetMin -= 1440;
    return targetMin;
  }, [systemTime, timezoneOffset]);

  const currentElevationAndPhase = useMemo(() => {
    const mins = Math.floor(currentMinutesOffset);
    const item = currentCalculations.elevations[mins] || { elevation: 0 };
    const phase = detectLightingPhase(item.elevation, mins <= currentCalculations.solarNoon);
    return {
      elevation: item.elevation,
      phase,
    };
  }, [currentMinutesOffset, currentCalculations]);

  // --- Countdown Engine ---
  const countdownStats = useMemo(() => {
    const isToday = selectedDateStr === new Date().toISOString().substring(0, 10);

    if (!isToday) {
      return {
        active: false,
        eventName: "Planning Mode Active",
        timeRemainingText: "--:--:--",
        percentLeft: 0,
      };
    }

    const tTimes = currentCalculations;
    const tomTimes = tomorrowCalculations;
    const nowMin = currentMinutesOffset;

    const milestones = [
      { name: "Morning Blue Hour", start: tTimes.morningBlue.start, end: tTimes.morningBlue.end, type: "blue_hour" },
      { name: "Morning Golden Hour", start: tTimes.morningGolden.start, end: tTimes.morningGolden.end, type: "golden_hour" },
      { name: "Sunrise", start: tTimes.sunrise, end: null, type: "sunrise" },
      { name: "Solar Noon", start: tTimes.solarNoon, end: null, type: "noon" },
      { name: "Evening Golden Hour", start: tTimes.eveningGolden.start, end: tTimes.eveningGolden.end, type: "golden_hour" },
      { name: "Sunset", start: tTimes.sunset, end: null, type: "sunset" },
      { name: "Evening Blue Hour", start: tTimes.eveningBlue.start, end: tTimes.eveningBlue.end, type: "blue_hour" },
    ];

    let nextEvent = null;
    let minRemaining = 0;
    let isEnd = false;

    for (const mil of milestones) {
      if (mil.start !== null && mil.start > nowMin) {
        nextEvent = mil;
        minRemaining = mil.start - nowMin;
        isEnd = false;
        break;
      }
      if (mil.end !== null && mil.end > nowMin) {
        nextEvent = mil;
        minRemaining = mil.end - nowMin;
        isEnd = true;
        break;
      }
    }

    if (!nextEvent) {
      nextEvent = {
        name: "Morning Blue Hour",
        start: tomTimes.morningBlue.start,
        end: tomTimes.morningBlue.end,
        type: "blue_hour",
      };
      minRemaining = (1440 - nowMin) + (tomTimes.morningBlue.start || 0);
      isEnd = false;
    }

    const totalSeconds = Math.floor(minRemaining * 60);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const timeStr = `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

    let percent = 0;
    if (isEnd && nextEvent.start !== null && nextEvent.end !== null) {
      const windowLen = nextEvent.end - nextEvent.start;
      percent = ((windowLen - minRemaining) / windowLen) * 100;
    } else {
      percent = ((60 - Math.min(60, minRemaining)) / 60) * 100;
    }

    return {
      active: true,
      eventName: nextEvent.name,
      isEnd,
      timeRemainingText: timeStr,
      percentLeft: Math.min(100, Math.max(0, percent)),
      type: nextEvent.type,
    };
  }, [currentCalculations, tomorrowCalculations, currentMinutesOffset, selectedDateStr]);

  // --- Real-time Notifications Alert Dispatch ---
  const notifiedEventsRef = useRef(new Set());
  
  useEffect(() => {
    if (!notificationsAllowed) return;

    const tTimes = currentCalculations;
    const nowMin = currentMinutesOffset;
    const todayStr = new Date().toISOString().substring(0, 10);

    const alertOffsets = [notifyBeforeMinutes];

    const alarmTargets = [];
    if (notifyForGoldenHour && tTimes.morningGolden.start !== null) {
      alarmTargets.push({ key: "m-golden-start", min: tTimes.morningGolden.start, name: "Morning Golden Hour starts" });
    }
    if (notifyForGoldenHour && tTimes.eveningGolden.start !== null) {
      alarmTargets.push({ key: "e-golden-start", min: tTimes.eveningGolden.start, name: "Evening Golden Hour starts" });
    }
    if (notifyForSunrise && tTimes.sunrise !== null) {
      alarmTargets.push({ key: "sunrise", min: tTimes.sunrise, name: "Sunrise occurs" });
    }
    if (notifyForSunrise && tTimes.sunset !== null) {
      alarmTargets.push({ key: "sunset", min: tTimes.sunset, name: "Sunset occurs" });
    }

    alarmTargets.forEach((target) => {
      alertOffsets.forEach((offset) => {
        const targetMinTrigger = target.min - offset;
        const eventId = `${target.key}-${offset}-${todayStr}`;

        if (nowMin >= targetMinTrigger && nowMin <= targetMinTrigger + 1.5) {
          if (!notifiedEventsRef.current.has(eventId)) {
            notifiedEventsRef.current.add(eventId);
            new Notification("Photography Alert", {
              body: `${target.name} in ${offset} minutes! Prepare your camera settings.`,
              icon: "/favicon.ico",
            });
          }
        }
      });
    });
  }, [currentMinutesOffset, currentCalculations, notificationsAllowed, notifyBeforeMinutes, notifyForSunrise, notifyForGoldenHour]);

  // --- Weather Sim Variables ---
  const weatherModifiers = useMemo(() => {
    switch (weatherCondition) {
      case "partly_cloudy":
        return {
          quality: "Good - Diffused Light",
          intensity: "80%",
          advice: "Cloud contrast adds massive dramatic shapes to your skies. Excellent depth.",
          wb: "Cloudy (5800K-6000K)",
          score: 8,
          scoreColor: "text-emerald-500 dark:text-emerald-400",
          accentBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        };
      case "overcast":
        return {
          quality: "Moderate - Flat Ambient",
          intensity: "30%",
          advice: "Shadowless portrait softbox effect. Watch out for cold, grey horizons.",
          wb: "Shade (6500K)",
          score: 5,
          scoreColor: "text-amber-500 dark:text-amber-400",
          accentBg: "bg-amber-500/10 text-amber-500 border-amber-500/20"
        };
      case "storm":
        return {
          quality: "Poor - Moody Contrast",
          intensity: "10%",
          advice: "High darkness drama. Focus on rain puddles, lightning, and intense sky details.",
          wb: "Daylight (5500K)",
          score: 2,
          scoreColor: "text-rose-500",
          accentBg: "bg-rose-500/10 text-rose-500 border-rose-500/20"
        };
      case "clear":
      default:
        return {
          quality: "Pristine - Direct Beam",
          intensity: "100%",
          advice: "Intense warm flares, direct silhouettes, and sharp long shadows.",
          wb: "Sunset/Direct (5000K-5500K)",
          score: 10,
          scoreColor: "text-blue-500",
          accentBg: "bg-blue-500/10 text-blue-500 border-blue-500/20"
        };
    }
  }, [weatherCondition]);

  const sunSvgCoordinates = useMemo(() => {
    const width = 600;
    const height = 180;
    const horizonY = 130;

    const currentT = currentMinutesOffset / 1440;
    const sunX = 50 + currentT * 500;

    const el = currentElevationAndPhase.elevation;
    const normEl = Math.min(60, Math.max(-20, el));
    const sunY = horizonY - (normEl / 60) * 100;

    return {
      width,
      height,
      horizonY,
      sunX,
      sunY,
    };
  }, [currentMinutesOffset, currentElevationAndPhase]);

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-blue-500/30 text-(--foreground) overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* --- Futuristic Tool Header (Standard Blue Brand Accents) --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Camera size={14} className="animate-spin-slow text-blue-500" />
            Solar Protocol Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            {titleText}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Map precise golden hour, blue hour, and celestial windows using high-fidelity latitude and longitude calculations.
          </p>
        </motion.div>

        {/* Dynamic Toast Success Notification */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-blue-600 border border-blue-400 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2.5"
            >
              <Check size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Quick Stats Grid (Identical Layout to Seating Master) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Phase", value: currentElevationAndPhase.phase.name, icon: Sun, color: "blue" },
            { label: "Next Milestone", value: countdownStats.timeRemainingText.split(":").slice(0, 2).join(":"), icon: Clock, color: "blue" },
            { label: "Sunrise Today", value: formatMinuteToTime(currentCalculations.sunrise), icon: Sun, color: "blue" },
            { label: "Sunset Today", value: formatMinuteToTime(currentCalculations.sunset), icon: Sunset, color: "blue" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-(--card) border border-(--border) p-5 rounded-3xl backdrop-blur-md shadow-lg group hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-blue-500/10 text-blue-500`}>
                  <stat.icon size={16} />
                </div>
                <span className="text-sm font-black text-(--foreground) truncate max-w-[170px]">{stat.value}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* --- Main Dashboard Body Layout --- */}
        <div className="bg-(--card) border border-(--border) rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-8 space-y-12">
            
            {/* Global Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8">
              <div className="flex gap-4">
                <button onClick={triggerGPSDetection} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 font-bold text-xs uppercase tracking-widest">
                  <Compass size={16} /> Auto GPS Location
                </button>
                <button
                  onClick={() => setSelectedDateStr(new Date().toISOString().substring(0, 10))}
                  className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground rounded-2xl hover:border-black/30 dark:border-white/30 transition-all font-bold text-xs uppercase tracking-widest"
                >
                  <Calendar size={16} /> Reset to Today
                </button>
              </div>
              
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/5 px-4 py-2.5 rounded-2xl border border-blue-500/10">
                Astronomical Engine Core Active
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              {/* Left Column: Input Settings & Saved Venues */}
              <div className="lg:col-span-4 space-y-10">
                
                {/* 1. Location Settings */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Compass size={14} /> Coordinates Settings
                  </h3>
                  <div className="space-y-4">
                    
                    {/* Date select */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Active Date</label>
                      <input
                        type="date"
                        value={selectedDateStr}
                        onChange={(e) => setSelectedDateStr(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-(--foreground) focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>

                    {/* Presets Select */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Location Preset</label>
                      <select
                        value={selectedPresetId}
                        onChange={(e) => handleSelectPreset(e.target.value)}
                        className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm text-(--foreground) focus:border-blue-500/50 outline-none transition-all"
                      >
                        <option value="gps">Satellite GPS Auto Geolocation</option>
                        {LOCATION_PRESETS.filter(p => p.id !== "gps").map(preset => (
                          <option key={preset.id} value={preset.id}>{preset.name}</option>
                        ))}
                        {savedLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>Saved: {loc.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Custom Latitude/Longitude drawer */}
                    <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
                      <div className="flex items-center justify-between text-[9px] font-black text-blue-500 uppercase tracking-wider">
                        <span>Node Metrics</span>
                        <span className="text-muted-foreground">UTC {timezoneOffset >= 0 ? "+" : ""}{timezoneOffset}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Latitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={latitude}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setLatitude(Math.min(90, Math.max(-90, val)));
                              setSelectedPresetId("custom");
                            }}
                            className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500/50 outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Longitude</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={longitude}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setLongitude(Math.min(180, Math.max(-180, val)));
                              setSelectedPresetId("custom");
                            }}
                            className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500/50 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Timezone Name</label>
                        <input
                          type="text"
                          value={timezoneName}
                          onChange={(e) => {
                            setTimezoneName(e.target.value);
                            setSelectedPresetId("custom");
                          }}
                          className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:border-blue-500/50 outline-none transition-all"
                          placeholder="e.g. Europe/London"
                        />
                      </div>
                    </div>

                    {/* Custom Venue form */}
                    <form onSubmit={handleSaveLocation} className="space-y-3 pt-2">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Save Coordinates As Custom Venue</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Venue Label... e.g. Peak Shoot"
                          value={customLocationName}
                          onChange={(e) => setCustomLocationName(e.target.value)}
                          className="flex-1 bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs focus:border-blue-500/50 outline-none transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!customLocationName.trim()}
                          className="p-3 bg-blue-600 border border-blue-500 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-950/20 disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </form>

                  </div>
                </div>

                {/* 2. Notification Reminders */}
                <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Bell size={14} /> Alert Intelligence
                  </h3>
                  <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-(--foreground) block">System Alerts</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Shoot warnings</span>
                      </div>
                      {notificationsAllowed ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                          Permitted
                        </span>
                      ) : (
                        <button
                          onClick={requestNotificationPermission}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Unlock
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                      <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        <span>Notify Before</span>
                        <span className="text-blue-500">{notifyBeforeMinutes} Mins</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        step="5"
                        value={notifyBeforeMinutes}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setNotifyBeforeMinutes(val);
                          localStorage.setItem("gh_notify_before_mins", val.toString());
                        }}
                        className="w-full accent-blue-500 bg-black/10 dark:bg-white/10 rounded-lg cursor-pointer h-1"
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer text-xs group">
                        <input
                          type="checkbox"
                          checked={notifyForGoldenHour}
                          onChange={(e) => {
                            setNotifyForGoldenHour(e.target.checked);
                            localStorage.setItem("gh_notify_golden", e.target.checked.toString());
                          }}
                          className="w-4 h-4 rounded accent-blue-500"
                        />
                        <span className="text-muted-foreground group-hover:text-(--foreground) transition-colors text-[11px] font-medium">
                          Alert for Golden Hour starts
                        </span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer text-xs group">
                        <input
                          type="checkbox"
                          checked={notifyForSunrise}
                          onChange={(e) => {
                            setNotifyForSunrise(e.target.checked);
                            localStorage.setItem("gh_notify_sunrise", e.target.checked.toString());
                          }}
                          className="w-4 h-4 rounded accent-blue-500"
                        />
                        <span className="text-muted-foreground group-hover:text-(--foreground) transition-colors text-[11px] font-medium">
                          Alert for Sunrise / Sunset occurs
                        </span>
                      </label>
                    </div>

                  </div>
                </div>

                {/* 3. Custom Locations List */}
                {savedLocations.length > 0 && (
                  <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                      <Bookmark size={14} /> Saved Landmarks
                    </h3>
                    <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                      {savedLocations.map((loc) => (
                        <div
                          key={loc.id}
                          className={`p-4 rounded-2xl border flex items-center justify-between group transition-all cursor-pointer ${
                            selectedPresetId === loc.id
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-500 font-bold"
                              : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-blue-500/20 text-muted-foreground hover:text-(--foreground)"
                          }`}
                          onClick={() => handleSelectSaved(loc)}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{loc.name}</div>
                            <div className="text-[9px] text-zinc-500 uppercase mt-0.5 tracking-tighter">
                              {loc.lat}°N, {loc.lng}°E • {loc.timezone.split("/").pop()}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLocation(loc.id);
                            }}
                            className="p-2 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 rounded-xl transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Dynamic SVG Trajectory & Schedule */}
              <div className="lg:col-span-8 space-y-10">
                
                {/* Visual Trajectory Display */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Sun size={14} /> Solar Blueprint
                  </h3>
                  
                  <div className="relative group rounded-[32px] overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 shadow-inner min-h-[300px] flex flex-col justify-between p-6">
                    
                    {/* Sky Gradient Overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-b transition-all duration-[2000ms] opacity-25 pointer-events-none ${
                        currentElevationAndPhase.phase.id === "daylight"
                          ? "from-sky-500/40 via-sky-600/10 to-transparent"
                          : currentElevationAndPhase.phase.id === "golden_hour"
                          ? "from-orange-500/50 via-amber-600/15 to-transparent"
                          : currentElevationAndPhase.phase.id === "blue_hour"
                          ? "from-indigo-600/50 via-purple-600/10 to-transparent"
                          : currentElevationAndPhase.phase.id === "twilight"
                          ? "from-violet-900/60 via-indigo-950/20 to-transparent"
                          : "from-zinc-950 via-black/40 to-transparent"
                      }`}
                    />

                    {/* SVG Trajectory Drawing */}
                    <div className="relative z-10 w-full">
                      <svg
                        viewBox={`0 0 ${sunSvgCoordinates.width} ${sunSvgCoordinates.height}`}
                        className="w-full h-auto"
                      >
                        <defs>
                          <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FB923C" />
                            <stop offset="100%" stopColor="#F59E0B" />
                          </linearGradient>
                          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#312E81" stopOpacity="0.4" />
                            <stop offset="30%" stopColor="#EA580C" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.8" />
                            <stop offset="70%" stopColor="#EA580C" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#312E81" stopOpacity="0.4" />
                          </linearGradient>
                        </defs>

                        {/* Horizon level line */}
                        <line
                          x1="20"
                          y1={sunSvgCoordinates.horizonY}
                          x2={sunSvgCoordinates.width - 20}
                          y2={sunSvgCoordinates.horizonY}
                          className="stroke-black/10 dark:stroke-white/10"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />

                        {/* Curved solar path arc */}
                        <path
                          d={`M 50 ${sunSvgCoordinates.horizonY + 20} Q ${sunSvgCoordinates.width / 2} -20 ${
                            sunSvgCoordinates.width - 50
                          } ${sunSvgCoordinates.horizonY + 20}`}
                          fill="none"
                          stroke="url(#pathGradient)"
                          strokeWidth="2.5"
                        />

                        {/* Sunrise and Sunset Points */}
                        {currentCalculations.sunrise !== null && (
                          <g transform={`translate(${50 + (currentCalculations.sunrise / 1440) * 500}, ${sunSvgCoordinates.horizonY})`}>
                            <circle r="4.5" fill="#F59E0B" />
                            <text y="15" textAnchor="middle" className="text-muted-foreground fill-current font-black" fontSize="7">
                              RISE
                            </text>
                          </g>
                        )}

                        {currentCalculations.sunset !== null && (
                          <g transform={`translate(${50 + (currentCalculations.sunset / 1440) * 500}, ${sunSvgCoordinates.horizonY})`}>
                            <circle r="4.5" fill="#EA580C" />
                            <text y="15" textAnchor="middle" className="text-muted-foreground fill-current font-black" fontSize="7">
                              SET
                            </text>
                          </g>
                        )}

                        {/* Solar Noon Point */}
                        <g transform={`translate(${50 + (currentCalculations.solarNoon / 1440) * 500}, ${sunSvgCoordinates.horizonY - (currentCalculations.maxElevation / 60) * 100})`}>
                          <circle r="3.5" fill="#FBBF24" />
                          <text y="-9" textAnchor="middle" className="text-muted-foreground fill-current font-black" fontSize="7">
                            NOON ({currentCalculations.maxElevation.toFixed(1)}°)
                          </text>
                        </g>

                        {/* Current Sun indicator */}
                        <g transform={`translate(${sunSvgCoordinates.sunX}, ${sunSvgCoordinates.sunY})`}>
                          <circle r="12" fill="url(#sunGlow)" opacity="0.25" className="animate-pulse" />
                          <circle r="7" fill="url(#sunGlow)" />
                          <line x1="0" y1="-12" x2="0" y2="-9" stroke="#FBBF24" strokeWidth="1.5" />
                          <line x1="0" y1="12" x2="0" y2="9" stroke="#FBBF24" strokeWidth="1.5" />
                          <line x1="-12" y1="0" x2="-9" y2="0" stroke="#FBBF24" strokeWidth="1.5" />
                          <line x1="12" y1="0" x2="9" y2="0" stroke="#FBBF24" strokeWidth="1.5" />
                        </g>
                      </svg>
                    </div>

                    {/* Interactive controls and status banner */}
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-black/5 dark:border-white/5 pt-5 gap-3 w-full relative z-10">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${currentElevationAndPhase.phase.color}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${currentElevationAndPhase.phase.textColor}`}>
                          Current: {currentElevationAndPhase.phase.name} (Alt: {currentElevationAndPhase.elevation.toFixed(1)}°)
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        {currentElevationAndPhase.phase.advice.substring(0, 52)}...
                      </span>
                    </div>

                  </div>
                </div>

                {/* Celestial Schedule Card */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Camera size={14} /> Shoot Planner Calendar
                  </h3>
                  
                  {currentCalculations.polarStatus && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                      <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-rose-800 dark:text-rose-200 font-medium">
                        <strong className="font-bold">Extreme Latitudes Warning: </strong>
                        {currentCalculations.polarStatus === "day"
                          ? "This latitude experiences 24-hour Midnight Sun (Polar Day) on this date. Sun never crosses below the horizon."
                          : "This latitude experiences 24-hour Polar Night on this date. Sun never crosses above the horizon."}
                      </div>
                    </div>
                  )}

                  {/* Planning Schedule List */}
                  <div className="overflow-hidden border border-black/5 dark:border-white/5 rounded-3xl bg-black/5 dark:bg-white/5">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10 text-muted-foreground font-black uppercase tracking-widest text-[9px]">
                          <th className="pb-3.5 pt-4 pl-4">Celestial Window</th>
                          <th className="pb-3.5 pt-4">Angles</th>
                          <th className="pb-3.5 pt-4">Start</th>
                          <th className="pb-3.5 pt-4">End</th>
                          <th className="pb-3.5 pt-4 pr-4 text-right">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        
                        {/* Morning Blue Hour */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pl-4 font-bold text-indigo-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            Morning Blue Hour
                          </td>
                          <td className="py-3.5 text-muted-foreground">-6.0° to -4.0°</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.morningBlue.start)}</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.morningBlue.end)}</td>
                          <td className="py-3.5 pr-4 text-right text-muted-foreground">
                            {currentCalculations.morningBlue.start !== null && currentCalculations.morningBlue.end !== null
                              ? formatDuration(currentCalculations.morningBlue.end - currentCalculations.morningBlue.start)
                              : "--"}
                          </td>
                        </tr>

                        {/* Morning Golden Hour */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pl-4 font-bold text-orange-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Morning Golden Hour
                          </td>
                          <td className="py-3.5 text-muted-foreground">-6.0° to +6.0°</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.morningGolden.start)}</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.morningGolden.end)}</td>
                          <td className="py-3.5 pr-4 text-right text-muted-foreground">
                            {currentCalculations.morningGolden.start !== null && currentCalculations.morningGolden.end !== null
                              ? formatDuration(currentCalculations.morningGolden.end - currentCalculations.morningGolden.start)
                              : "--"}
                          </td>
                        </tr>

                        {/* Sunrise */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pl-4 font-bold text-amber-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Sunrise
                          </td>
                          <td className="py-3.5 text-muted-foreground">At -0.833°</td>
                          <td className="py-3.5 font-bold text-(--foreground)" colSpan="2">
                            {formatMinuteToTime(currentCalculations.sunrise)}
                          </td>
                          <td className="py-3.5 pr-4 text-right text-muted-foreground">Instant</td>
                        </tr>

                        {/* Solar Noon */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pl-4 font-bold text-(--foreground) flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Solar Noon
                          </td>
                          <td className="py-3.5 text-muted-foreground">Highest Point</td>
                          <td className="py-3.5 font-bold text-(--foreground)" colSpan="2">
                            {formatMinuteToTime(currentCalculations.solarNoon)}
                          </td>
                          <td className="py-3.5 pr-4 text-right text-muted-foreground">Instant</td>
                        </tr>

                        {/* Sunset */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pl-4 font-bold text-amber-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Sunset
                          </td>
                          <td className="py-3.5 text-muted-foreground">At -0.833°</td>
                          <td className="py-3.5 font-bold text-(--foreground)" colSpan="2">
                            {formatMinuteToTime(currentCalculations.sunset)}
                          </td>
                          <td className="py-3.5 pr-4 text-right text-muted-foreground">Instant</td>
                        </tr>

                        {/* Evening Golden Hour */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pl-4 font-bold text-orange-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                            Evening Golden Hour
                          </td>
                          <td className="py-3.5 text-muted-foreground">+6.0° to -6.0°</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.eveningGolden.start)}</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.eveningGolden.end)}</td>
                          <td className="py-3.5 pr-4 text-right text-muted-foreground">
                            {currentCalculations.eveningGolden.start !== null && currentCalculations.eveningGolden.end !== null
                              ? formatDuration(currentCalculations.eveningGolden.end - currentCalculations.eveningGolden.start)
                              : "--"}
                          </td>
                        </tr>

                        {/* Evening Blue Hour */}
                        <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-3.5 pl-4 font-bold text-indigo-500 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                            Evening Blue Hour
                          </td>
                          <td className="py-3.5 text-muted-foreground">-4.0° to -6.0°</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.eveningBlue.start)}</td>
                          <td className="py-3.5 font-bold text-(--foreground)">{formatMinuteToTime(currentCalculations.eveningBlue.end)}</td>
                          <td className="py-3.5 pr-4 text-right text-muted-foreground">
                            {currentCalculations.eveningBlue.start !== null && currentCalculations.eveningBlue.end !== null
                              ? formatDuration(currentCalculations.eveningBlue.end - currentCalculations.eveningBlue.start)
                              : "--"}
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Weather Simulation Panel */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Sparkles size={14} /> Weather Sim Settings
                  </h3>
                  
                  <div className="p-6 rounded-[32px] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: "clear", label: "Clear Sky", icon: Sun },
                        { id: "partly_cloudy", label: "Scattered", icon: CloudSun },
                        { id: "overcast", label: "Overcast", icon: Cloud },
                        { id: "storm", label: "Stormy", icon: CloudLightning },
                      ].map((w) => {
                        const Icon = w.icon;
                        return (
                          <button
                            key={w.id}
                            onClick={() => setWeatherCondition(w.id)}
                            className={`py-3 px-2 rounded-2xl border text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
                              weatherCondition === w.id
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-950/20"
                                : "bg-black/5 dark:bg-black/20 border-black/10 dark:border-white/10 text-muted-foreground hover:border-blue-500/20"
                            }`}
                          >
                            <Icon size={14} className="shrink-0" />
                            <span>{w.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-5 rounded-2xl bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 items-center text-xs">
                      
                      <div className="sm:col-span-4 flex flex-col items-center text-center border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 pb-4 sm:pb-0 sm:pr-4">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">
                          Light Score
                        </span>
                        <span className={`text-4xl font-black ${weatherModifiers.scoreColor} font-mono mt-1`}>
                          {weatherModifiers.score}/10
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold mt-1">
                          {weatherModifiers.quality}
                        </span>
                      </div>

                      <div className="sm:col-span-8 space-y-2.5">
                        <div className="flex justify-between">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Estimated Transmission</span>
                          <span className="text-sm font-bold text-(--foreground)">{weatherModifiers.intensity}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Recommended White Balance</span>
                          <span className="text-sm font-bold text-(--foreground)">{weatherModifiers.wb}</span>
                        </div>

                        <div className="text-[11px] text-muted-foreground leading-relaxed pt-1.5 border-t border-black/5 dark:border-white/5">
                          <strong className="text-(--foreground)">Shoot Tip: </strong>
                          {weatherModifiers.advice}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* 5. Scientific Methodology / FAQ Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          {[
            { icon: Sunset, title: "Golden Hour Physics", desc: "Golden hour occurs when the sun sits between -6° and +6° relative to the horizon, refracting warm red and amber rays." },
            { icon: Moon, title: "Blue Hour Horizon", desc: "Blue hour runs at elevations of -6° to -4°, scattering heavy blue/violet particles for magical atmospheric backdrops." },
            { icon: Clock, title: "Real-time Ticker", desc: "Our live countdown updates continuously every second to track lighting changes precisely as you shoot." }
          ].map((feat, i) => (
            <div key={i} className="space-y-4 p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 transition-all group">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 w-fit group-hover:scale-110 transition-transform">
                <feat.icon size={24} />
              </div>
              <h4 className="text-lg font-bold text-(--foreground)">{feat.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Embedded Global Scrollbar Style matching standard other tools */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
      `}</style>
    </div>
  );
}
