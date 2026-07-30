"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { Image, Droplets, Eye, EyeOff, Wand2, Loader2 } from "lucide-react";
import { Card, Button } from "@altftool/ui";
import { BACKGROUND_OPTIONS } from "../constants/backgrounds";

function BackgroundSwatch({ color, label, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-(--primary)/40
        ${isSelected ? "border-(--primary) bg-(--primary-soft)/20" : "border-(--border) bg-(--card) hover:border-(--border-strong) hover:shadow-sm"}`}
      aria-pressed={isSelected}
      aria-label={label}
    >
      <div
        className={`w-10 h-10 rounded-lg border border-(--border) ${color === "transparent" ? "bg-[repeating-conic-gradient(#e2e8f0_0%_25%,transparent_0%_50%)_50%/10px_10px]" : ""}`}
        style={{ backgroundColor: color && color !== "transparent" && color !== "blur" && color !== "gradient" ? color : undefined }}
      />
      <span className="text-xs font-medium text-(--foreground)">{label}</span>
    </button>
  );
}

export default function BackgroundEditor({
  background = { type: "white", color: "#FFFFFF" },
  onChange = () => {},
  image,
  onRemoveBackground = () => {},
  removingBg = false,
  bgRemovalSupported = true,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [blurRadius, setBlurRadius] = useState(10);
  const [gradientStart, setGradientStart] = useState("#14B8A6");
  const [gradientEnd, setGradientEnd] = useState("#22D3EE");

  const handleSelect = (opt) => {
    const newBg = { type: opt.id, color: opt.color };
    if (opt.id === "custom") {
      setShowColorPicker(true);
    } else if (opt.id === "blur") {
      newBg.blurRadius = blurRadius;
    } else if (opt.id === "gradient") {
      newBg.gradientStart = gradientStart;
      newBg.gradientEnd = gradientEnd;
    } else {
      setShowColorPicker(false);
    }
    onChange(newBg);
  };

  const handleCustomColor = (hex) => {
    onChange({ type: "custom", color: hex });
  };

  const handleBlurChange = (val) => {
    setBlurRadius(val);
    onChange({ type: "blur", blurRadius: val });
  };

  const handleGradientChange = (start, end) => {
    const newStart = start ?? gradientStart;
    const newEnd = end ?? gradientEnd;
    setGradientStart(newStart);
    setGradientEnd(newEnd);
    onChange({ type: "gradient", gradientStart: newStart, gradientEnd: newEnd });
  };

  const bgStyle = (() => {
    if (background.type === "transparent") return { backgroundImage: "repeating-conic-gradient(#e2e8f0 0% 25%,transparent 0% 50%)", backgroundSize: "10px 10px" };
    if (background.type === "blur") return {};
    if (background.type === "gradient") return { background: `linear-gradient(135deg, ${background.gradientStart || gradientStart}, ${background.gradientEnd || gradientEnd})` };
    if (background.color) return { backgroundColor: background.color };
    return { backgroundColor: "#FFFFFF" };
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-(--foreground)">Background</h3>
        {background.type === "blur" && (
          <span className="text-xs text-(--muted-foreground)">Blur: {background.blurRadius || blurRadius}px</span>
        )}
      </div>

      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-(--border) bg-(--muted) flex items-center justify-center">
        {image?.dataUrl ? (
          <div className="relative w-full h-full">
            <img
              src={image.dataUrl}
              alt="Preview"
              className="w-full h-full object-contain"
              style={background.type === "blur" ? { filter: `blur(${background.blurRadius || blurRadius}px)` } : undefined}
            />
            <div className="absolute inset-0 -z-10" style={bgStyle} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-(--muted-foreground)">
            <Image size={28} alt="" />
            <span className="text-xs">Upload a photo first</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {BACKGROUND_OPTIONS.map((opt) => (
          <BackgroundSwatch
            key={opt.id}
            color={opt.color}
            label={opt.name}
            isSelected={background.type === opt.id}
            onClick={() => handleSelect(opt)}
          />
        ))}
      </div>

      <AnimatePresence>
        {(background.type === "custom" || showColorPicker) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 flex flex-col items-center gap-3 p-4 rounded-xl border border-(--border) bg-(--card)">
              <HexColorPicker
                color={background.color || "#FFFFFF"}
                onChange={handleCustomColor}
                className="!w-full max-w-[220px]"
              />
              <div className="flex items-center gap-2 w-full max-w-[220px]">
                <label className="text-xs text-(--muted-foreground) shrink-0">Hex</label>
                <input
                  type="text"
                  value={background.color || "#FFFFFF"}
                  onChange={(e) => handleCustomColor(e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-(--border) bg-(--muted) text-xs text-(--foreground)
                    focus:outline-none focus:ring-2 focus:ring-(--primary)/40 focus:border-(--primary)"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {background.type === "blur" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 flex flex-col gap-2 p-4 rounded-xl border border-(--border) bg-(--card)">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-(--muted-foreground)">Blur Radius</label>
                <span className="text-xs font-semibold text-(--foreground) tabular-nums">{background.blurRadius || blurRadius}px</span>
              </div>
              <input
                type="range" min={1} max={30} step={1}
                value={background.blurRadius || blurRadius}
                onChange={(e) => handleBlurChange(Number(e.target.value))}
                className="w-full h-1.5 bg-(--border) rounded-full appearance-none cursor-pointer accent-(--primary)
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--primary) [&::-webkit-slider-thumb]:shadow-sm
                  [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                aria-label="Blur radius"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {background.type === "gradient" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 p-4 rounded-xl border border-(--border) bg-(--card) flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-(--muted-foreground)">Start Color</label>
                <HexColorPicker
                  color={background.gradientStart || gradientStart}
                  onChange={(c) => handleGradientChange(c, undefined)}
                  className="!w-full max-w-[180px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-(--muted-foreground)">End Color</label>
                <HexColorPicker
                  color={background.gradientEnd || gradientEnd}
                  onChange={(c) => handleGradientChange(undefined, c)}
                  className="!w-full max-w-[180px]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={onRemoveBackground}
          disabled={!bgRemovalSupported || removingBg || !image?.dataUrl}
          className="w-full"
        >
          {removingBg ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Removing Background...
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Remove Background
            </>
          )}
        </Button>
        {!bgRemovalSupported && (
          <p className="text-xs text-(--muted-foreground) text-center">
            Background removal is not supported in this browser.
          </p>
        )}
        <p className="text-xs text-(--muted-foreground) text-center">
          Background removal uses browser-based processing. Results may vary.
        </p>
      </div>
    </div>
  );
}
