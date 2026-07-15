"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Image, Upload } from "lucide-react";

export default function BackgroundSelector({ presets, onSelect, selected, onUploadCustom }) {
  const [activeTab, setActiveTab] = useState("colors");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#14B8A6");
  const colorInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const colors = presets.filter((p) => p.type === "color");
  const gradients = presets.filter((p) => p.type === "gradient");
  const images = presets.filter((p) => p.type === "image");

  const tabs = [
    { key: "colors", label: "Colors", count: colors.length },
    { key: "gradients", label: "Gradients", count: gradients.length },
    { key: "images", label: "Images", count: images.length },
  ];

  useEffect(() => {
    if (showColorPicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [showColorPicker]);

  const renderGrid = (items, renderItem) => (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
      {items.map((item, i) => renderItem(item, i))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4 text-(--primary)" />
            Choose Background
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--border) text-xs font-medium hover:bg-(--primary)/10 hover:border-(--primary) transition"
            >
              <Upload className="w-3.5 h-3.5" />
              Custom
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) onUploadCustom(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="flex gap-1 mb-5 bg-[var(--page)] rounded-lg p-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                activeTab === key
                  ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "colors" && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {colors.map((color, i) => (
              <div
                key={i}
                onClick={() => onSelect(color.value)}
                className={`cursor-pointer rounded-lg border-2 overflow-hidden transition hover:scale-105 ${
                  selected === color.value ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-[var(--border)]"
                }`}
              >
                <div
                  className="aspect-square w-full"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-[10px] text-center py-1.5 truncate text-[var(--muted-foreground)]">
                  {color.name}
                </p>
              </div>
            ))}
            <div
              onClick={() => setShowColorPicker(true)}
              className={`cursor-pointer rounded-lg border-2 overflow-hidden transition hover:scale-105 ${
                selected === customColor ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-[var(--border)]"
              }`}
            >
              <div className="aspect-square w-full flex items-center justify-center bg-[var(--page)] min-h-[40px]">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--border)]" style={{ backgroundColor: customColor }} />
              </div>
              <p className="text-[10px] text-center py-1.5 text-[var(--muted-foreground)]">Custom</p>
            </div>
          </div>
        )}

        {activeTab === "gradients" && (
          renderGrid(gradients, (grad, i) => (
            <div
              key={i}
              onClick={() => onSelect(grad.value)}
              className={`cursor-pointer rounded-lg border-2 overflow-hidden transition hover:scale-105 ${
                selected === grad.value ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-[var(--border)]"
              }`}
            >
              <div
                className="aspect-square w-full"
                style={{ background: grad.value }}
              />
              <p className="text-[10px] text-center py-1.5 truncate text-[var(--muted-foreground)]">
                {grad.name}
              </p>
            </div>
          ))
        )}

        {activeTab === "images" && (
          renderGrid(images, (img, i) => (
            <div
              key={i}
              onClick={() => onSelect(img.value)}
              className={`cursor-pointer rounded-lg border-2 overflow-hidden transition hover:scale-105 ${
                selected === img.value ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30" : "border-[var(--border)]"
              }`}
            >
              <div className="aspect-square w-full bg-[var(--page)]">
                <img
                  src={img.value}
                  alt={img.name}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-[10px] text-center py-1.5 truncate text-[var(--muted-foreground)]">
                {img.name}
              </p>
            </div>
          ))
        )}

        {selected && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">Background applied</span>
            <button
              onClick={() => onSelect(null)}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              Clear background
            </button>
          </div>
        )}
      </div>

      {showColorPicker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-(--surface) rounded-xl p-6 shadow-lg w-[260px] text-center border border-(--border)">
            <h3 className="font-semibold mb-4 text-sm">Custom Color</h3>
            <div
              className="w-16 h-16 mx-auto rounded-full border-2 border-(--border) shadow-sm mb-5"
              style={{ backgroundColor: customColor }}
            />
            <input
              type="color"
              value={customColor}
              onInput={(e) => setCustomColor(e.target.value)}
              onChange={(e) => setCustomColor(e.target.value)}
              ref={colorInputRef}
              className="hidden"
            />
            <button
              onClick={() => colorInputRef.current?.click()}
              className="px-4 py-2 border border-(--border) rounded-lg mb-5 text-sm bg-(--primary) text-white hover:opacity-90 transition"
            >
              Choose Color
            </button>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowColorPicker(false)}
                className="px-4 py-2 bg-(--muted)/20 text-(--foreground) rounded-lg text-sm border border-(--border)"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSelect(customColor);
                  setShowColorPicker(false);
                }}
                className="px-4 py-2 bg-(--primary) text-white rounded-lg text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
