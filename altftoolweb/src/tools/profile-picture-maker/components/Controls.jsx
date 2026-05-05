"use client";

import React from "react";
import { Download } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import AIEnhancements from "./AIEnhancements";
import useAIEnhancements from "../hooks/useAIEnhancements";
import StylePresets from "./StylePresets";
import useStylePresets from "../hooks/useStylePresets";
import BackgroundControls from "./BackgroundControls";
import Modes from "./Modes";





export default function Controls({
  size,
  setSize,
  zoom,
  setZoom,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  style,
  setStyle,
  bgType,
  setBgType,
  bgColor,
  setBgColor,
  downloadPNG,
  colorRef,
  faceFocus,
  setFaceFocus,
  skinSmooth,
  setSkinSmooth,
  eyeSharpen,
  setEyeSharpen,
  removeBackground,
  bgRemovedUrl,
  setBgImage,
  setBgSource,
  bgBlur,
  setBgBlur,
  applyPreset,
  blur,
  setBlur,
  handleAvatarMode,
  avatarMode,
}) {
  const ai = useAIEnhancements({
    brightness,
    contrast,
    saturation,
    setBrightness,
    setContrast,
    setSaturation,
    faceFocus,
    setFaceFocus,
    skinSmooth,
    setSkinSmooth,
    eyeSharpen,
    setEyeSharpen,
    setZoom,
    setBlur,
  });
  const {
    applyLinkedIn,
    applyGamer,
    applyInfluencer,
    applyCorporate,
    applyGradient,
    applyGlitch,
  } = useStylePresets({
    setBrightness,
    setContrast,
    setSaturation,
    setBgType,
    setBgColor,
    setZoom,
    removeBackground,
    bgRemovedUrl,
  });

  return (
    <div className="space-y-6">

      

      <AIEnhancements ai={ai} />
      <Modes onSelectMode={handleAvatarMode} activeMode={avatarMode} />

      <StylePresets
        applyLinkedIn={applyLinkedIn}
        applyGamer={applyGamer}
        applyInfluencer={applyInfluencer}
        applyCorporate={applyCorporate}
        applyGradient={applyGradient}
        applyGlitch={applyGlitch}
      />

     <div className="font-medium block mb-2">
            {/* SIZE */}
            <div>
              <label className="space-y-3   font-medium">
                Output Size: {size}px
              </label>
              <input
                type="range"
                min="64"
                max="512"
                step="32"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full "
              />
            </div>
            {/* ZOOM */}
            <div className="space-y-3">
              <label>Zoom</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.01"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* ADJUSTMENTS */}
            <div className="space-y-3">
              <label>Brightness</label>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full"
              />

              <label>Contrast</label>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full"
              />

              <label>Saturation</label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

      

      

      {/* STYLE */}
      <div>
        <label className="block mb-2 font-semibold">Style</label>
        <div className="flex gap-3">
          <button
            onClick={() => setStyle("round")}
            className={`px-4 py-2 rounded-lg border cursor-pointer ${
              style === "round"
                ? "bg-(--primary) text-(--primary-foreground)"
                : "border-(--border)"
            }`}
          >
            Round
          </button>
          <button
            onClick={() => setStyle("square")}
            className={`px-4 py-2 rounded-lg border cursor-pointer ${
              style === "square"
                ? "bg-(--primary) text-(--primary-foreground)"
                : "border-(--border)"
            }`}
          >
            Square
          </button>
        </div>
      </div>

      {/* BACKGROUND */}
      <div>
        <label className="text-[var(--foreground)]">Background</label>

        <select
          value={bgType}
          onChange={(e) => setBgType(e.target.value)}
          className="w-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] p-2 mt-2 rounded-md"
        >
          <option value="transparent">Transparent</option>
          <option value="solid">Solid</option>
        </select>

        {bgType === "solid" && (
          <div className="mt-3 flex flex-col gap-3">
            <label className="text-sm text-[var(--foreground)]">
              Background Color :
            </label>

            <label className="relative w-fit cursor-pointer">
              {/* <div className="w-full max-w-[200px]">
                <HexColorPicker color={bgColor} onChange={setBgColor} />
              </div> */}

              <div
                className="w-full h-8 rounded-md border border-[var(--border)]"
                style={{ backgroundColor: bgColor }}
              />

              <input
                ref={colorRef}
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                onMouseEnter={() => colorRef.current?.click()}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>
      {/* background Intelligence */}
      <BackgroundControls
        setBgImage={setBgImage}
        setBgSource={setBgSource}
        bgBlur={bgBlur}
        setBgBlur={setBgBlur}
      />
      {/* DOWNLOAD */}
      {/* <button
        onClick={downloadPNG}
        className="w-full bg-(--primary) text-(--primary-foreground) py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download size={18} />
        Download PNG
      </button> */}
      
    </div>
  );
}
