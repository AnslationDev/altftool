"use client";

import React from "react";
import {
  Wallpaper,
  Building2,
  Waves,
  Camera,
  Palette,
  Upload,
  Droplets,
} from "lucide-react";

export default function BackgroundControls({
  setBgImage,
  setBgSource,
  bgBlur,
  setBgBlur,
}) {
  const btnClass =
    "flex items-center gap-2 px-3 py-2 rounded-lg border border-(--border) cursor-pointer hover:bg-(--primary) hover:text-(--primary-foreground) transition";

  // preset images (free Unsplash images)
  const presets = [
    {
      key: "office",
      label: "Office",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c",
      icon: <Building2 className="text-yellow-500" size={16} />,
    },
    {
      key: "beach",
      label: "Beach",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      icon: <Waves className="text-blue-500" size={16} />,
    },
    {
      key: "studio",
      label: "Studio",
      url: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
      icon: <Camera className="text-purple-500" size={16} />,
    },
    {
      key: "abstract",
      label: "Abstract",
      url: "https://images.unsplash.com/photo-1557683316-973673baf926",
      icon: <Palette className="text-pink-500" size={16} />,
    },
  ];

  // Takes the actual image URL and marks source as "preset"
  const applyPreset = (url) => {
    setBgImage(url);
    setBgSource("preset");
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBgImage(url);
    setBgSource("custom");
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <label className="font-medium font-semibold flex items-center gap-2">
        <Wallpaper className="text-purple-500" size={18} />
        Background Intelligence
      </label>

      {/* Presets */}
      <div className="grid grid-cols-2 gap-2">
        {presets.map(({ key, label, url, icon }) => (
          <button key={key} className={btnClass} onClick={() => applyPreset(url)}>
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Blur Toggle */}
      <div className="flex items-center justify-between border border-(--border) rounded-lg p-2">
        <span className="flex items-center gap-2">
          <Droplets className="text-blue-400" size={16} />
          Blur Background
        </span>
        <input
          type="checkbox"
          checked={bgBlur}
          onChange={(e) => setBgBlur(e.target.checked)}
        />
      </div>

      {/* Upload */}
      <label className={btnClass}>
        <Upload className="text-indigo-500" size={16} />
        Upload Background
        <input type="file" accept="image/*" hidden onChange={handleUpload} />
      </label>
    </div>
  );
}