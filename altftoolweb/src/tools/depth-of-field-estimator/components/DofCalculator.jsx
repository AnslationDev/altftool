"use client";

import React, { useMemo } from "react";
import {
  Sliders,
  Info,
  AlertTriangle,
  HelpCircle,
  Camera,
  Layers,
  ChevronRight
} from "lucide-react";
import { SENSORS } from "../pages";

// Standard aperture options for quick clicking
const COMMON_APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

// Common focal length presets for quick clicking
const COMMON_FOCALS = [16, 24, 35, 50, 85, 105, 135, 200];

export default function DofCalculator({
  sensor,
  setSensor,
  focalLength,
  setFocalLength,
  aperture,
  setAperture,
  distance,
  setDistance,
  distanceUnit,
  setDistanceUnit,
  presets,
  setPresets
}) {

  // Non-linear distance slider mapping
  // Map slider value 0-100 to distance in meters 0.1 to 100
  // Formula: dist = 0.1 + (val / 100)^3 * 99.9
  const distanceSliderVal = useMemo(() => {
    // Inverse function: val = 100 * ((dist - 0.1) / 99.9)^(1/3)
    const distMeters = distanceUnit === "m" ? distance : distance * 0.3048;
    const clamped = Math.max(0.1, Math.min(100, distMeters));
    const ratio = (clamped - 0.1) / 99.9;
    return Math.round(100 * Math.pow(ratio, 1 / 3));
  }, [distance, distanceUnit]);

  const handleDistanceSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    const distMeters = 0.1 + Math.pow(val / 100, 3) * 99.9;
    if (distanceUnit === "m") {
      setDistance(Number(distMeters.toFixed(2)));
    } else {
      setDistance(Number((distMeters / 0.3048).toFixed(2)));
    }
  };

  // Perform standard DoF calculations
  const calc = useMemo(() => {
    const f = focalLength; // focal length in mm
    const N = aperture;    // f-stop number
    const c = sensor.coc;  // Circle of Confusion in mm

    // Convert subject distance to millimeters (s)
    const s = distanceUnit === "m" ? distance * 1000 : distance * 304.8;

    // Hyperfocal distance: H = f^2 / (N * c) + f
    const H = (f * f) / (N * c) + f;

    let nearLimit = 0;
    let farLimit = 0;
    let totalDof = 0;
    let isInfinite = false;
    let frontPct = 0;
    let behindPct = 0;
    let frontDist = 0;
    let behindDist = 0;

    if (s >= H) {
      // Focused at or beyond hyperfocal distance
      nearLimit = (s * (H - f)) / (H + s - 2 * f);
      farLimit = Infinity;
      totalDof = Infinity;
      isInfinite = true;
      frontDist = s - nearLimit;
      behindDist = Infinity;
      frontPct = 100;
      behindPct = 0;
    } else {
      nearLimit = (s * (H - f)) / (H + s - 2 * f);
      farLimit = (s * (H - f)) / (H - s);

      // Sanity check for edge cases
      if (farLimit < 0 || isNaN(farLimit)) {
        farLimit = Infinity;
        totalDof = Infinity;
        isInfinite = true;
        frontDist = s - nearLimit;
        behindDist = Infinity;
        frontPct = 100;
        behindPct = 0;
      } else {
        totalDof = farLimit - nearLimit;
        isInfinite = false;
        frontDist = s - nearLimit;
        behindDist = farLimit - s;
        if (totalDof > 0) {
          frontPct = (frontDist / totalDof) * 100;
          behindPct = (behindDist / totalDof) * 100;
        }
      }
    }

    // Diffraction calculations: Airy Disk diameter in micrometers = 2.44 * lambda * N
    // lambda = 550nm (green light) -> 1.342 * N
    const airyDisk = 1.342 * N;
    const cocMicrons = c * 1000;
    const diffractionLimited = airyDisk > cocMicrons;

    return {
      hyperfocal: H,
      nearLimit,
      farLimit,
      totalDof,
      isInfinite,
      frontDist,
      behindDist,
      frontPct,
      behindPct,
      airyDisk,
      cocMicrons,
      diffractionLimited
    };
  }, [sensor, focalLength, aperture, distance, distanceUnit]);

  // Format outputs for UI
  const formattedOutputs = useMemo(() => {
    const scale = distanceUnit === "m" ? 1000 : 304.8;
    const unitLabel = distanceUnit;

    const toUnitText = (valMm) => {
      if (valMm === Infinity) return "Infinity";
      const val = valMm / scale;
      if (val > 1000) return val.toFixed(1) + " " + unitLabel;
      return val.toFixed(2) + " " + unitLabel;
    };

    const toFeetInches = (valMm) => {
      if (valMm === Infinity) return "Infinity";
      const totalInches = valMm / 25.4;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      if (inches === 12) {
        return `${feet + 1}' 0"`;
      }
      return `${feet}' ${inches}"`;
    };

    return {
      hyperfocalText: toUnitText(calc.hyperfocal) + (distanceUnit === "ft" ? ` (${toFeetInches(calc.hyperfocal)})` : ""),
      nearLimitText: toUnitText(calc.nearLimit) + (distanceUnit === "ft" ? ` (${toFeetInches(calc.nearLimit)})` : ""),
      farLimitText: toUnitText(calc.farLimit) + (distanceUnit === "ft" && calc.farLimit !== Infinity ? ` (${toFeetInches(calc.farLimit)})` : ""),
      totalDofText: calc.isInfinite ? "Infinity (Deep Focus)" : toUnitText(calc.totalDof) + (distanceUnit === "ft" ? ` (${toFeetInches(calc.totalDof)})` : ""),
      frontDistText: toUnitText(calc.frontDist) + (distanceUnit === "ft" ? ` (${toFeetInches(calc.frontDist)})` : ""),
      behindDistText: toUnitText(calc.behindDist) + (distanceUnit === "ft" && calc.behindDist !== Infinity ? ` (${toFeetInches(calc.behindDist)})` : "")
    };
  }, [calc, distanceUnit]);

  // Generate 7 overlapping aperture blade paths dynamically
  const apertureBlades = useMemo(() => {
    const outerRadius = 42;
    // Map aperture f-stop f/0.95 to f/64 to an opening radius (r) between 4px and 38px
    // Scale is log-like: opening is larger for smaller f numbers
    // In physics, radius proportional to 1 / N.
    const maxApertureVal = 0.95;
    const minOpening = 4;
    const maxOpening = 36;
    const openingRadius = Math.max(minOpening, Math.min(maxOpening, maxOpening * (maxApertureVal / aperture) + 1));

    const center = { x: 50, y: 50 };
    const numBlades = 7;
    const blades = [];

    // Subtle rotation of the blades as f-number changes
    const rotationAngle = (aperture * Math.PI) / 36;

    for (let i = 0; i < numBlades; i++) {
      const theta1 = rotationAngle + (i * 2 * Math.PI) / numBlades;
      const theta2 = rotationAngle + ((i + 1) * 2 * Math.PI) / numBlades;

      // Outer endpoints on outer circle
      const outerOffset = 0.9; // overlapping angle offset
      const ox1 = center.x + outerRadius * Math.cos(theta1 + outerOffset);
      const oy1 = center.y + outerRadius * Math.sin(theta1 + outerOffset);
      const ox2 = center.x + outerRadius * Math.cos(theta2 + outerOffset);
      const oy2 = center.y + outerRadius * Math.sin(theta2 + outerOffset);

      // Inner heptagon points
      const ix1 = center.x + openingRadius * Math.cos(theta1);
      const iy1 = center.y + openingRadius * Math.sin(theta1);
      const ix2 = center.x + openingRadius * Math.cos(theta2);
      const iy2 = center.y + openingRadius * Math.sin(theta2);

      // Create polygon path for blade
      const pathData = `M ${ix1.toFixed(1)} ${iy1.toFixed(1)} L ${ix2.toFixed(1)} ${iy2.toFixed(1)} L ${ox2.toFixed(1)} ${oy2.toFixed(1)} L ${ox1.toFixed(1)} ${oy1.toFixed(1)} Z`;
      blades.push(pathData);
    }

    return { blades, openingRadius };
  }, [aperture]);

  // SVG focusing diagram positions
  const visualPlanes = useMemo(() => {
    // Total SVG range: x = 0 to 500.
    // Camera is fixed at x = 50.
    // Subject (focus plane) is fixed at x = 230.
    // Map near/far limits relative to focus distance.
    const cameraX = 50;
    const subjectX = 230;

    const s = distanceUnit === "m" ? distance * 1000 : distance * 304.8;
    const near = calc.nearLimit;
    const far = calc.farLimit;

    // Linear scaling for near limit:
    // If near = s, nearX = 230
    // If near = 0, nearX = 50
    let nearX = cameraX + (subjectX - cameraX) * (near / s);
    if (isNaN(nearX) || nearX < cameraX) nearX = cameraX;

    // Asymptotic exponential scaling for far limit:
    // This allows infinity to be at x = 460, and nicely handles all ranges.
    let farX = 460;
    if (!calc.isInfinite && far !== Infinity) {
      const farDelta = far - s;
      const scaleFactor = s * 1.5; // Controls compression of depth
      const ratio = 1 - Math.exp(-farDelta / scaleFactor);
      farX = subjectX + (440 - subjectX) * ratio;
    }

    // Determine background blur intensity (0 to 12)
    // Blur is high if DoF is narrow compared to the focal distance
    const dofFraction = calc.isInfinite ? 1.0 : calc.totalDof / s;
    let bgBlur = 0;
    if (!calc.isInfinite) {
      bgBlur = Math.max(1, Math.min(12, 8 * (1.5 - dofFraction)));
    }

    // Foreground blur intensity
    let fgBlur = 0;
    if (nearX > 80) {
      fgBlur = Math.max(0, Math.min(8, (nearX - 50) / 20));
    }

    return {
      nearX: Math.round(nearX),
      subjectX,
      farX: Math.round(farX),
      bgBlur: bgBlur.toFixed(1),
      fgBlur: fgBlur.toFixed(1)
    };
  }, [calc, distance, distanceUnit]);

  return (
    <div className="space-y-8">
      {/* 1. TOP ROW: Full-Width Interactive Focus Simulator & Animated Iris */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-5 shadow-xl backdrop-blur-2xl">
        <div className="w-full flex justify-between items-center mb-4 border-b border-[var(--card-border)] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-foreground)] flex items-center gap-1.5">
            <Layers className="h-4.5 w-4.5 text-[var(--primary)]" />
            Live Focus & Depth of Field Simulator
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[var(--muted-foreground)]">Lens Diaphragm:</span>
            {/* Small iris graphic container */}
            <div className="relative h-9 w-9 bg-[var(--background)] rounded-full border border-[var(--border)] shadow-inner overflow-hidden flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <linearGradient id="blade-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--muted-foreground)" />
                    <stop offset="100%" stopColor="var(--card)" />
                  </linearGradient>
                </defs>
                {/* Render blades */}
                {apertureBlades.blades.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="url(#blade-grad)"
                    stroke="var(--border)"
                    strokeWidth="0.8"
                  />
                ))}
                {/* Subtle glass reflection ring */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* SVG Diagram Canvas */}
        <div className="relative w-full aspect-[500/180] bg-[var(--background)]/80 border border-[var(--card-border)] rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          <svg viewBox="0 0 500 190" className="h-full w-full">
            <defs>
              <linearGradient id="dof-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                <stop offset="20%" stopColor="var(--primary)" stopOpacity="0.1" />
                <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.2" />
                <stop offset="80%" stopColor="var(--primary)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
              {/* Blur filter for foreground/background objects */}
              <filter id="dof-bg-blur">
                <feGaussianBlur stdDeviation={visualPlanes.bgBlur} />
              </filter>
              <filter id="dof-fg-blur">
                <feGaussianBlur stdDeviation={visualPlanes.fgBlur} />
              </filter>
            </defs>

            {/* Grid Lines */}
            <line x1="50" y1="20" x2="50" y2="150" stroke="var(--border)" strokeDasharray="3 3" />
            <line x1="460" y1="20" x2="460" y2="150" stroke="var(--border)" strokeDasharray="3 3" />

            {/* Acceptable Sharpness / Depth of Field Glow Band */}
            <rect
              x={visualPlanes.nearX}
              y="35"
              width={Math.max(4, visualPlanes.farX - visualPlanes.nearX)}
              height="100"
              fill="url(#dof-glow)"
              className="transition-all duration-75 ease-out"
            />

            {/* Tree / Mountain Background (Subject to BG Blur) */}
            <g filter="url(#dof-bg-blur)" className="transition-all duration-75">
              {/* Stylized trees at the right */}
              <polygon points="430,125 450,85 470,125" fill="var(--secondary-foreground)" opacity="0.3" />
              <polygon points="440,125 455,95 470,125" fill="var(--muted-foreground)" opacity="0.2" />
              <polygon points="460,125 475,90 490,125" fill="var(--secondary-foreground)" opacity="0.3" />
              <line x1="420" y1="125" x2="490" y2="125" stroke="var(--border)" strokeWidth="2" />
            </g>

            {/* Foreground Flowers / Grass (Subject to FG Blur) */}
            <g filter="url(#dof-fg-blur)" className="transition-all duration-75">
              {/* Flower on the left */}
              <circle cx="110" cy="120" r="5" fill="var(--primary)" opacity="0.5" />
              <line x1="110" y1="120" x2="110" y2="135" stroke="var(--primary)" strokeWidth="2" />

              <circle cx="95" cy="125" r="4" fill="var(--secondary-foreground)" opacity="0.5" />
              <line x1="95" y1="125" x2="95" y2="135" stroke="var(--primary)" strokeWidth="1.5" />
            </g>

            {/* Camera Icon on the left */}
            <g transform="translate(30, 70)" fill="none" stroke="var(--muted-foreground)" strokeWidth="2.5" className="transition-all duration-75">
              {/* Simple camera chassis */}
              <rect x="0" y="8" width="30" height="20" rx="3" fill="var(--card)" />
              <path d="M 8 8 L 11 3 L 19 3 L 22 8 Z" fill="var(--card)" />
              <circle cx="15" cy="18" r="6" fill="var(--background)" />
              {/* Laser lens projection */}
              <path d="M 27 13 L 40 8 L 40 28 L 27 23 Z" fill="rgba(37, 99, 235, 0.03)" stroke="var(--primary)" strokeOpacity="0.15" strokeWidth="1" />
            </g>
            <text x="45" y="112" fill="var(--muted-foreground)" fontSize="9" fontWeight="bold" fontFamily="monospace">CAMERA</text>

            {/* Focus Subject in center (Standard Focus Plane) */}
            <g transform="translate(218, 55)" className="transition-all duration-75">
              {/* Subject figure */}
              <circle cx="12" cy="15" r="8" fill="var(--primary)" />
              <path d="M 3 42 C 3 27, 21 27, 21 42 Z" fill="var(--primary)" />
              {/* Target hair-cross on subject */}
              <circle cx="12" cy="22" r="16" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" className="animate-spin" style={{ transformOrigin: "12px 22px", animationDuration: "12s" }} />
            </g>
            <text x="212" y="112" fill="var(--primary)" fontSize="9" fontWeight="extrabold" fontFamily="monospace">SUBJECT</text>

            {/* Near Limit Line & Label */}
            <g className="transition-all duration-75 ease-out">
              <line
                x1={visualPlanes.nearX}
                y1="25"
                x2={visualPlanes.nearX}
                y2="145"
                stroke="var(--primary)"
                strokeWidth="2"
              />
              <circle cx={visualPlanes.nearX} cy="25" r="3.5" fill="var(--primary)" />
              <text
                x={visualPlanes.nearX - 25}
                y="18"
                fill="var(--primary)"
                fontSize="8.5"
                fontWeight="black"
                fontFamily="monospace"
              >
                NEAR
              </text>
            </g>

            {/* Far Limit Line & Label */}
            <g className="transition-all duration-75 ease-out">
              <line
                x1={visualPlanes.farX}
                y1="25"
                x2={visualPlanes.farX}
                y2="145"
                stroke="var(--secondary-foreground)"
                strokeWidth="2"
                strokeDasharray={calc.isInfinite ? "3 3" : "0"}
              />
              <circle cx={visualPlanes.farX} cy="25" r="3.5" fill="var(--secondary-foreground)" />
              <text
                x={visualPlanes.farX - (calc.isInfinite ? 10 : 20)}
                y="18"
                fill="var(--secondary-foreground)"
                fontSize="8.5"
                fontWeight="black"
                fontFamily="monospace"
              >
                {calc.isInfinite ? "INFINITY" : "FAR"}
              </text>
            </g>

            {/* Distance scale metrics line at the bottom */}
            <line x1="50" y1="160" x2="450" y2="160" stroke="var(--border)" strokeWidth="1.5" />
            <polygon points="50,160 55,156 55,164" fill="var(--border)" />
            <polygon points="450,160 445,156 445,164" fill="var(--border)" />
            <text x="215" y="174" fill="var(--secondary-foreground)" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
              Dist: {distance} {distanceUnit}
            </text>
          </svg>

          {/* Float badge to represent hyperfocal */}
          <div className="absolute bottom-2 right-2 bg-[var(--card)]/90 border border-[var(--card-border)] rounded px-2 py-0.5 text-[9px] font-mono font-bold text-[var(--primary)] backdrop-blur-sm">
            Hyperfocal: {distanceUnit === "m" ? `${(calc.hyperfocal/1000).toFixed(2)}m` : `${(calc.hyperfocal/304.8).toFixed(1)}ft`}
          </div>
        </div>
      </div>

      {/* 2. BOTTOM ROW: Two-column grid (Controls Left, Outputs Right) */}
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN: Input Controls */}
        <div className="lg:col-span-7 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-xl backdrop-blur-2xl space-y-6">
          <h3 className="text-lg font-bold text-[var(--primary)] flex items-center gap-2 pb-3 border-b border-[var(--card-border)]">
            <Sliders className="h-5 w-5 text-[var(--primary)]" />
            Lens & Focus Parameters
          </h3>

          <div className="space-y-6">
            {/* Sensor Selection */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">
                  Camera Sensor Size
                </label>
                <span className="text-xs font-mono font-bold text-[var(--primary)]">
                  Crop Factor: {sensor.cropFactor.toFixed(2)}x
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SENSORS.slice(0, 4).map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => setSensor(s)}
                    className={`rounded-xl border p-3 text-center transition-all duration-75 ${
                      sensor.name === s.name
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-md"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                    }`}
                  >
                    <div className="text-xs font-black truncate">{s.name.split(" ")[0]}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)] mt-1 font-mono">{s.cropFactor}x Crop</div>
                  </button>
                ))}
              </div>
              {/* Dropdown for full list */}
              <select
                value={sensor.name}
                onChange={(e) => {
                  const s = SENSORS.find((x) => x.name === e.target.value);
                  if (s) setSensor(s);
                }}
                className="w-full mt-2 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]/80 px-4 py-2 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                {SENSORS.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({s.cropFactor.toFixed(2)}x crop — CoC {s.coc.toFixed(3)}mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Focal Length Selector */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">
                  Focal Length
                </label>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[var(--primary)]">
                  <input
                    type="number"
                    value={focalLength}
                    onChange={(e) => setFocalLength(Math.max(1, Math.min(1000, parseInt(e.target.value) || 0)))}
                    className="w-16 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)]/50 px-2 py-0.5 text-center text-sm font-bold outline-none focus:border-[var(--primary)]"
                  />
                  <span>mm</span>
                </div>
              </div>

              {/* Quick Focal Length Buttons */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {COMMON_FOCALS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFocalLength(f)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold font-mono transition-all duration-75 ${
                      focalLength === f
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {f}mm
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="10"
                max="300"
                value={focalLength}
                onChange={(e) => setFocalLength(parseInt(e.target.value))}
                className="w-full accent-[var(--primary)] cursor-pointer"
              />
            </div>

            {/* Aperture (f-stop) Selector */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">
                  Aperture (f-stop)
                </label>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-[var(--primary)]">
                  <span>f/</span>
                  <input
                    type="number"
                    step="0.1"
                    value={aperture}
                    onChange={(e) => setAperture(Math.max(0.7, Math.min(90, parseFloat(e.target.value) || 0.7)))}
                    className="w-16 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)]/50 px-2 py-0.5 text-center text-sm font-bold outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Quick Aperture Buttons */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {COMMON_APERTURES.map((ap) => (
                  <button
                    key={ap}
                    onClick={() => setAperture(ap)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold font-mono transition-all duration-75 ${
                      aperture === ap
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "bg-[var(--background)] border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    f/{ap}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="0.95"
                max="32"
                step="0.05"
                value={aperture}
                onChange={(e) => setAperture(parseFloat(e.target.value))}
                className="w-full accent-[var(--primary)] cursor-pointer"
              />
            </div>

            {/* Subject Distance Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--secondary-foreground)]">
                  Subject Focus Distance
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 font-mono text-sm font-bold text-[var(--primary)]">
                    <input
                      type="number"
                      step="0.05"
                      value={distance}
                      onChange={(e) => setDistance(Math.max(0.1, Math.min(1000, parseFloat(e.target.value) || 0.1)))}
                      className="w-20 rounded-md border border-[var(--input-border)] bg-[var(--input-bg)]/50 px-2 py-0.5 text-center text-sm font-bold outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                  {/* Metric / Imperial Toggle */}
                  <div className="flex rounded-lg border border-[var(--card-border)] p-0.5 bg-[var(--background)] shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        if (distanceUnit !== "m") {
                          setDistanceUnit("m");
                          setDistance(Number((distance * 0.3048).toFixed(2)));
                        }
                      }}
                      className={`px-2 py-1 text-[10px] font-black rounded-md transition-all duration-75 ${
                        distanceUnit === "m" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--secondary-foreground)]"
                      }`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (distanceUnit !== "ft") {
                          setDistanceUnit("ft");
                          setDistance(Number((distance * 0.3048).toFixed(2)));
                        }
                      }}
                      className={`px-2 py-1 text-[10px] font-black rounded-md transition-all duration-75 ${
                        distanceUnit === "ft" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--secondary-foreground)]"
                      }`}
                    >
                      FT
                    </button>
                  </div>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={distanceSliderVal}
                onChange={handleDistanceSliderChange}
                className="w-full accent-[var(--primary)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[var(--muted-foreground)]">
                <span>0.1 {distanceUnit} (Macro)</span>
                <span>3 {distanceUnit} (Portrait)</span>
                <span>15 {distanceUnit} (Street)</span>
                <span>100 {distanceUnit} (Infinity)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Numerical Results & Warning Banner */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Numerical Results Card */}
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 shadow-xl backdrop-blur-2xl w-full">
            <div className="text-center mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--secondary-foreground)]">
                Total Depth of Field
              </span>
              <h2 className="text-4xl font-black text-[var(--primary)] mt-1 tracking-tight">
                {formattedOutputs.totalDofText}
              </h2>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1 font-mono">
                CoC limit standard: {sensor.coc.toFixed(3)} mm ({sensor.name.split(" ")[0]})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-[var(--card-border)] py-5 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Near Limit of Sharpness
                </span>
                <div className="text-lg font-black text-[var(--primary)] mt-1 font-mono">
                  {formattedOutputs.nearLimitText}
                </div>
                <p className="text-[10px] text-[var(--secondary-foreground)] leading-tight mt-1">
                  Closest object acceptably sharp.
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Far Limit of Sharpness
                </span>
                <div className="text-lg font-black text-[var(--secondary-foreground)] mt-1 font-mono">
                  {formattedOutputs.farLimitText}
                </div>
                <p className="text-[10px] text-[var(--secondary-foreground)] leading-tight mt-1">
                  Farthest object acceptably sharp.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Sharpness in Front
                </span>
                <div className="text-base font-bold text-[var(--foreground)] mt-0.5 font-mono">
                  {formattedOutputs.frontDistText}
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  ({calc.frontPct.toFixed(0)}% of total DoF)
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Sharpness Behind Focus
                </span>
                <div className="text-base font-bold text-[var(--foreground)] mt-0.5 font-mono">
                  {formattedOutputs.behindDistText}
                </div>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  ({calc.behindPct.toFixed(0)}% of total DoF)
                </span>
              </div>
            </div>

            {/* DoF Front/Behind Proportional Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
                <span>Front Distribution ({calc.frontPct.toFixed(0)}%)</span>
                <span>Behind Distribution ({calc.behindPct.toFixed(0)}%)</span>
              </div>
              <div className="h-3 w-full rounded-full bg-[var(--background)] border border-[var(--border)] overflow-hidden flex">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-75"
                  style={{ width: `${calc.frontPct}%` }}
                />
                <div
                  className="h-full bg-[var(--secondary-foreground)]/40 transition-all duration-75"
                  style={{ width: `${calc.behindPct}%` }}
                />
              </div>
              <div className="text-[9px] text-[var(--muted-foreground)] text-center italic mt-1.5 flex items-center justify-center gap-1">
                <Info className="h-3 w-3 inline text-[var(--primary)]" />
                <span>
                  As subject distance increases, behind sharpness grows much larger than front sharpness.
                </span>
              </div>
            </div>
          </div>

          {/* Diffraction Warning Card */}
          {calc.diffractionLimited && (
            <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4 flex gap-3.5 items-start w-full">
              <AlertTriangle className="h-5 w-5 text-[var(--primary)] shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-[var(--primary)] mb-1">Diffraction Alert Active</h4>
                <p className="text-[var(--secondary-foreground)] leading-relaxed font-medium">
                  At f/{aperture}, the calculated size of the light spot formed by diffraction (Airy Disk: <strong>{calc.airyDisk.toFixed(1)} µm</strong>) exceeds your sensor's Circle of Confusion limit (<strong>{calc.cocMicrons.toFixed(1)} µm</strong>). The image might appear slightly soft due to light scattering, even exactly at the focal plane. Consider shooting at <strong>f/8</strong> or <strong>f/11</strong> if edge-to-edge pixel sharpness is critical.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
