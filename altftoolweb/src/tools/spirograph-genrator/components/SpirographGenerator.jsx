"use client";

import { useState, useCallback } from "react";
import SpirographCanvas from "./SpirographCanvas";
import SpirographControls from "./SpirographControls";
import SpirographPresets from "./SpirographPresets";
import SpirographHowItWorks from "./SpirographHowItWorks";
import SpirographFeatures from "./SpirographFeatures";
import "./SpirographGenerator.css";

const PATTERN_MODES = [
  { id: 'hypotrochoid', name: 'Hypotrochoid', desc: 'Inside circle' },
  { id: 'epitrochoid', name: 'Epitrochoid', desc: 'Outside circle' },
  { id: 'harmonic', name: 'Harmonic', desc: 'Wave spiro mode' }
];

const PRESETS = [
  { name: 'Classic Flower', mode: 'hypotrochoid', outer: 150, inner: 105, distance: 120, step: 0.02, width: 2, color: '#6366f1', loops: 6 },
  { name: 'Geometric Star', mode: 'epitrochoid', outer: 180, inner: 130, distance: 110, step: 0.018, width: 1.8, color: '#f59e0b', loops: 5 },
  { name: 'Complex Mandala', mode: 'hypotrochoid', outer: 200, inner: 75, distance: 140, step: 0.015, width: 1.5, color: '#8b5cf6', loops: 7 },
  { name: 'Simple Circle', mode: 'hypotrochoid', outer: 120, inner: 90, distance: 60, step: 0.025, width: 2.5, color: '#06b6d4', loops: 1 },
  { name: 'Rainbow Spiral', mode: 'hypotrochoid', outer: 160, inner: 72, distance: 100, step: 0.02, width: 1.6, color: '#ec4899', loops: 8 },
  { name: 'Outer Star', mode: 'epitrochoid', outer: 220, inner: 160, distance: 130, step: 0.016, width: 1.4, color: '#f97316', loops: 4 },
  { name: 'Lotus Bloom', mode: 'hypotrochoid', outer: 170, inner: 98, distance: 115, step: 0.019, width: 1.9, color: '#10b981', loops: 6 },
  { name: 'Crystal Wave', mode: 'hypotrochoid', outer: 190, inner: 80, distance: 125, step: 0.017, width: 1.7, color: '#6366f1', loops: 5 },
  { name: 'Sunburst', mode: 'epitrochoid', outer: 210, inner: 140, distance: 150, step: 0.014, width: 1.3, color: '#eab308', loops: 3 },
  { name: 'Ocean Rings', mode: 'hypotrochoid', outer: 140, inner: 65, distance: 85, step: 0.022, width: 2.2, color: '#0891b2', loops: 7 },
  { name: 'Rose Petal', mode: 'hypotrochoid', outer: 155, inner: 88, distance: 95, step: 0.021, width: 2.0, color: '#ef4444', loops: 6 },
  { name: 'Vortex', mode: 'hypotrochoid', outer: 230, inner: 110, distance: 160, step: 0.013, width: 1.2, color: '#7c3aed', loops: 5 },
  { name: 'Daisy Chain', mode: 'epitrochoid', outer: 165, inner: 120, distance: 90, step: 0.02, width: 1.8, color: '#22c55e', loops: 8 },
  { name: 'Infinity Loop', mode: 'hypotrochoid', outer: 175, inner: 95, distance: 108, step: 0.018, width: 1.6, color: '#3b82f6', loops: 4 },
  { name: 'Fire Ring', mode: 'hypotrochoid', outer: 195, inner: 82, distance: 135, step: 0.016, width: 1.5, color: '#dc2626', loops: 6 },
  { name: 'Galaxy Swirl', mode: 'hypotrochoid', outer: 240, inner: 125, distance: 145, step: 0.015, width: 1.3, color: '#a855f7', loops: 7 },
  { name: 'Pinwheel', mode: 'epitrochoid', outer: 130, inner: 95, distance: 75, step: 0.023, width: 2.3, color: '#d97706', loops: 3 },
  { name: 'Frost Pattern', mode: 'hypotrochoid', outer: 185, inner: 70, distance: 118, step: 0.017, width: 1.7, color: '#06b6d4', loops: 5 },
  { name: 'Sunflower', mode: 'hypotrochoid', outer: 150, inner: 78, distance: 92, step: 0.02, width: 2.1, color: '#f59e0b', loops: 9 },
  { name: 'Diamond Core', mode: 'hypotrochoid', outer: 205, inner: 100, distance: 128, step: 0.015, width: 1.4, color: '#6366f1', loops: 4 }
];

const COLORS = [
  "#6366f1", "#06b6d4", "#8b5cf6", "#ef4444", "#10b981",
  "#f59e0b", "#ec4899", "#6366f1", "#14b8a6", "#f97316",
  "#3b82f6", "#a855f7", "#22c55e", "#e11d48", "#eab308",
  "#0891b2", "#7c3aed", "#059669", "#dc2626", "#d97706"
];

export default function SpirographGenerator() {
  const [patternMode, setPatternMode] = useState('hypotrochoid');
  const [outerRadius, setOuterRadius] = useState(150);
  const [innerRadius, setInnerRadius] = useState(105);
  const [distance, setDistance] = useState(120);
  const [step, setStep] = useState(0.02);
  const [lineWidth, setLineWidth] = useState(2.0);
  const [outerLoop, setOuterLoop] = useState(1);
  const [innerLoop, setInnerLoop] = useState(1);
  const [strokeColor, setStrokeColor] = useState('#6366f1');
  const [background, setBackground] = useState("#ffffff");
  const [secondaryColor, setSecondaryColor] = useState("#ec4899");
  const [multiLine, setMultiLine] = useState(false);
  const [lineCount, setLineCount] = useState(3);
  const [activePreset, setActivePreset] = useState('Classic Flower');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1.2);

  const applyPreset = useCallback((preset) => {
    setPatternMode(preset.mode || 'hypotrochoid');
    setOuterRadius(preset.outer);
    setInnerRadius(preset.inner);
    setDistance(preset.distance);
    setStep(preset.step);
    setLineWidth(preset.width);
    setOuterLoop(preset.outerLoop || preset.loops || 1);
    setInnerLoop(preset.innerLoop || 1);
    setStrokeColor(preset.color);
    setActivePreset(preset.name);
  }, []);

  const handleRandomize = () => {
    const randomPreset = PRESETS[Math.floor(Math.random() * PRESETS.length)];
    applyPreset(randomPreset);
    setMultiLine(Math.random() > 0.6);
    setLineCount(Math.floor(Math.random() * 4) + 2);
  };

  const params = {
    patternMode,
    outerRadius,
    innerRadius,
    distance,
    step,
    lineWidth,
    outerLoop,
    innerLoop,
    strokeColor,
    background,
    secondaryColor,
    multiLine,
    lineCount,
    isAnimating,
    animationSpeed,
    activePreset
  };

  return (
    <div className="spirograph-container">
      {/* Header Section */}
      <header className="spirograph-header">
        <h1>Spirograph Generator</h1>
        <p>Create geometric spirograph art with custom controls and export options.</p>
      </header>

      {/* Workspace: Controls + Canvas */}
      <div className="spirograph-workspace">
        {/* Left: Controls */}
        <div className="spirograph-controls-panel">
          <SpirographPresets
            presets={PRESETS}
            activePreset={activePreset}
            onApplyPreset={applyPreset}
          />

          <SpirographControls
            patternMode={patternMode}
            onPatternModeChange={setPatternMode}
            patternModes={PATTERN_MODES}
            outerRadius={outerRadius}
            onOuterRadiusChange={setOuterRadius}
            innerRadius={innerRadius}
            onInnerRadiusChange={setInnerRadius}
            distance={distance}
            onDistanceChange={setDistance}
            step={step}
            onStepChange={setStep}
            lineWidth={lineWidth}
            onLineWidthChange={setLineWidth}
            outerLoop={outerLoop}
            onOuterLoopChange={setOuterLoop}
            innerLoop={innerLoop}
            onInnerLoopChange={setInnerLoop}
            strokeColor={strokeColor}
            onStrokeColorChange={setStrokeColor}
            background={background}
            onBackgroundChange={setBackground}
            secondaryColor={secondaryColor}
            onSecondaryColorChange={setSecondaryColor}
            multiLine={multiLine}
            onMultiLineChange={setMultiLine}
            lineCount={lineCount}
            onLineCountChange={setLineCount}
            colors={COLORS}
            outerRadiusMax={260}
          />
        </div>

        {/* Right: Canvas + Animation */}
        <SpirographCanvas
          params={params}
          onAnimationToggle={() => setIsAnimating(!isAnimating)}
          onSpeedChange={setAnimationSpeed}
          onRandomize={handleRandomize}
        />
      </div>

      {/* How It Works Section */}
      <SpirographHowItWorks />

      {/* Features Section */}
      <SpirographFeatures />
    </div>
  );
}
