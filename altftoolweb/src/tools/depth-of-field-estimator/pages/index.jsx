"use client";

import React, { useState, useEffect } from "react";
import {
  Camera,
  Sliders,
  Table,
  Briefcase,
  BookOpen,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DofCalculator from "../components/DofCalculator";
import DofTable from "../components/DofTable";
import GearPresets from "../components/GearPresets";
import DofGuide from "../components/DofGuide";

// List of standard photography sensors and standard Circles of Confusion (CoC in mm)
export const SENSORS = [
  { name: "Full Frame (35mm)", cropFactor: 1.0, coc: 0.030, desc: "Standard reference sensor format." },
  { name: "APS-C (Nikon/Sony/Fuji)", cropFactor: 1.5, coc: 0.020, desc: "Popular mirrorless/DSLR format." },
  { name: "APS-C (Canon)", cropFactor: 1.6, coc: 0.019, desc: "Canon specific APS-C size." },
  { name: "Micro Four Thirds (MFT)", cropFactor: 2.0, coc: 0.015, desc: "Lightweight mirrorless standard." },
  { name: "Medium Format (0.79x)", cropFactor: 0.79, coc: 0.038, desc: "Fuji GFX, Hasselblad X2D, premium details." },
  { name: "Medium Format (0.64x)", cropFactor: 0.64, coc: 0.045, desc: "Larger 645 crop formats." },
  { name: "1-inch Type (2.7x)", cropFactor: 2.7, coc: 0.011, desc: "Compact premium cameras." },
  { name: "Mobile / Smartphone (6.0x)", cropFactor: 6.0, coc: 0.005, desc: "Standard phone sensor size." }
];

export default function DepthOfFieldEstimator() {
  const [activeTab, setActiveTab] = useState("calculator");

  // Shared Photography States
  const [sensor, setSensor] = useState(SENSORS[0]);
  const [focalLength, setFocalLength] = useState(50); // in mm
  const [aperture, setAperture] = useState(2.8); // f-stop
  const [distance, setDistance] = useState(3.0); // subject distance
  const [distanceUnit, setDistanceUnit] = useState("m"); // 'm' or 'ft'

  // Presets State (initially loaded from localStorage)
  const [presets, setPresets] = useState(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("dof_estimator_presets") : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default camera setups (extremely helpful and interactive!)
    return [
      {
        id: "default-portrait",
        name: "Portrait Focus",
        sensorName: "Full Frame (35mm)",
        focalLength: 85,
        aperture: 1.4,
        distance: 2.5,
        distanceUnit: "m",
        notes: "Dreamy bokeh with paper-thin depth of field."
      },
      {
        id: "default-street",
        name: "Street Snapshot",
        sensorName: "APS-C (Nikon/Sony/Fuji)",
        focalLength: 23,
        aperture: 5.6,
        distance: 3.0,
        distanceUnit: "m",
        notes: "Deep sharp range, perfect for zone focusing."
      },
      {
        id: "default-landscape",
        name: "Epic Landscape",
        sensorName: "Full Frame (35mm)",
        focalLength: 24,
        aperture: 8,
        distance: 10,
        distanceUnit: "m",
        notes: "Focus near hyperfocal distance for edge-to-edge sharpness."
      },
      {
        id: "default-macro",
        name: "Macro Closeup",
        sensorName: "Full Frame (35mm)",
        focalLength: 90,
        aperture: 5.6,
        distance: 0.4,
        distanceUnit: "m",
        notes: "Extremely narrow DoF, millimeter precision required."
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("dof_estimator_presets", JSON.stringify(presets));
    } catch (e) {}
  }, [presets]);

  const loadPreset = (preset) => {
    const matchedSensor = SENSORS.find(s => s.name === preset.sensorName) || SENSORS[0];
    setSensor(matchedSensor);
    setFocalLength(preset.focalLength);
    setAperture(preset.aperture);
    setDistance(preset.distance);
    setDistanceUnit(preset.distanceUnit);
    setActiveTab("calculator");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.02 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" } }
  };

  const tabs = [
    { id: "calculator", label: "Calculator", icon: Sliders },
    { id: "table", label: "DoF Reference Table", icon: Table },
    { id: "presets", label: "My Camera Bag", icon: Briefcase },
    { id: "guide", label: "Photography Guide", icon: BookOpen }
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Camera className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Depth of Field Estimator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Photography</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Calculate focus ranges, hyperfocal distances, and sharpness zones for any camera and lens combination.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["DoF Calculator", "Reference Table", "Camera Presets"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Camera className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 mx-auto max-w-6xl space-y-6"
        >
          {/* Navigation Tabs */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex w-full max-w-2xl overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-lg no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-bold transition-all duration-100 min-w-[120px] ${
                      isActive
                        ? "text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface-soft"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab-glow"
                        className="absolute inset-0 rounded-xl bg-[var(--primary)] shadow-md"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Dynamic Tab Panels */}
          <div className="relative z-10 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                {activeTab === "calculator" && (
                  <DofCalculator
                    sensor={sensor}
                    setSensor={setSensor}
                    focalLength={focalLength}
                    setFocalLength={setFocalLength}
                    aperture={aperture}
                    setAperture={setAperture}
                    distance={distance}
                    setDistance={setDistance}
                    distanceUnit={distanceUnit}
                    setDistanceUnit={setDistanceUnit}
                    presets={presets}
                    setPresets={setPresets}
                  />
                )}

                {activeTab === "table" && (
                  <DofTable
                    sensor={sensor}
                    focalLength={focalLength}
                    distanceUnit={distanceUnit}
                  />
                )}

                {activeTab === "presets" && (
                  <GearPresets
                    presets={presets}
                    setPresets={setPresets}
                    onLoad={loadPreset}
                    currentSettings={{
                      sensorName: sensor.name,
                      focalLength,
                      aperture,
                      distance,
                      distanceUnit
                    }}
                  />
                )}

                {activeTab === "guide" && <DofGuide />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Persistent Micro Footnote */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <div className="rounded-2xl border border-border bg-primary/5 p-5">
              <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest flex items-center justify-center gap-2">
                <Info className="h-4 w-4" />
                Photography Principle
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed italic max-w-3xl mx-auto">
                "Depth of field does not abruptly change from sharp to blurry; it is a gradual transition. Acceptable sharpness is defined by the Circle of Confusion limit, corresponding to what the human eye perceives as sharp at standard viewing distances."
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
