"use client";
import { useMemo } from "react";
import Cropper from "react-easy-crop";
import { HexColorPicker } from "react-colorful";
import { SlidersHorizontal, RotateCw, FlipHorizontal, FlipVertical, RotateCcw, Undo2, Sun, Contrast, Droplets } from "lucide-react";

const sections = [
  {
    key: "crop", label: "CROP", icon: SlidersHorizontal,
    controls: ["zoom", "rotate", "flip", "reset"],
  },
  {
    key: "light", label: "LIGHT", icon: Sun,
    controls: ["brightness", "contrast", "exposure", "shadows", "highlights"],
  },
  {
    key: "color", label: "COLOR", icon: Droplets,
    controls: ["saturation", "temperature", "tint"],
  },
  {
    key: "detail", label: "DETAIL", icon: Contrast,
    controls: ["sharpness"],
  },
];

const sliderConfig = {
  brightness: { label: "Brightness", min: -100, max: 100, step: 1 },
  contrast: { label: "Contrast", min: -100, max: 100, step: 1 },
  saturation: { label: "Saturation", min: -100, max: 100, step: 1 },
  sharpness: { label: "Sharpness", min: -100, max: 100, step: 1 },
  exposure: { label: "Exposure", min: -100, max: 100, step: 1 },
  shadows: { label: "Shadows", min: -100, max: 100, step: 1 },
  highlights: { label: "Highlights", min: -100, max: 100, step: 1 },
  temperature: { label: "Temperature", min: -100, max: 100, step: 1 },
  tint: { label: "Tint", min: -100, max: 100, step: 1 },
};

function SliderControl({ config, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-(--muted-foreground)">{config.label}</label>
        <span className="text-xs font-semibold text-(--foreground) tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-(--border) rounded-full appearance-none cursor-pointer accent-(--primary)
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--primary)
          [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-(--primary) [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
        aria-label={config.label}
      />
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = "secondary" }) {
  const base = "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-(--primary)/40";
  const variants = {
    secondary: "bg-(--muted) text-(--muted-foreground) border border-(--border) hover:bg-(--primary-soft) hover:text-(--primary) hover:border-(--primary)",
    ghost: "text-(--muted-foreground) hover:text-(--primary) hover:bg-(--primary-soft)",
    danger: "text-(--danger) hover:bg-(--danger)/10 border border-(--border) hover:border-(--danger)",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`} aria-label={label}>
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function PhotoEditor({
  adjustments = { brightness: 0, contrast: 0, saturation: 0, sharpness: 0, exposure: 0, shadows: 0, highlights: 0, temperature: 0, tint: 0, zoom: 1, rotation: 0, flipH: false, flipV: false },
  onAdjustmentChange = () => {},
  onReset = () => {},
  onRotate = () => {},
  onFlip = () => {},
  image,
  crop = { x: 0, y: 0 },
  zoom = 1,
  onCropChange = () => {},
  onZoomChange = () => {},
  onCropComplete = () => {},
}) {
  const handleSliderChange = useMemo(() => (key) => (value) => onAdjustmentChange(key, value), [onAdjustmentChange]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
      <div className="relative flex-1 min-h-[300px] lg:min-h-0 rounded-xl overflow-hidden bg-(--muted) border border-(--border)">
        {image?.dataUrl ? (
          <Cropper
            image={image.dataUrl}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
            classes={{ containerClassName: "rounded-xl", cropAreaClassName: "border-2 border-(--primary)" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="flex flex-col items-center gap-3 text-(--muted-foreground)">
              <SlidersHorizontal size={36} />
              <p className="text-sm">Upload a photo to start editing</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3 overflow-y-auto max-h-[70vh] lg:max-h-none">
        {sections.map((section) => (
          <div key={section.key} className="rounded-xl border border-(--border) bg-(--card) overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-(--border) bg-(--muted)/30">
              <section.icon size={14} className="text-(--primary)" />
              <span className="text-xs font-bold tracking-wider text-(--muted-foreground)">{section.label}</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {section.key === "crop" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-(--muted-foreground)">Zoom</label>
                      <span className="text-xs font-semibold text-(--foreground) tabular-nums">{zoom}x</span>
                    </div>
                    <input
                      type="range" min={0.5} max={3} step={0.1} value={zoom}
                      onChange={(e) => onZoomChange(Number(e.target.value))}
                      className="w-full h-1.5 bg-(--border) rounded-full appearance-none cursor-pointer accent-(--primary)
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-(--primary)
                        [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                        [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-(--primary) [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                      aria-label="Zoom"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton icon={RotateCcw} label="Left" onClick={() => onRotate("left")} />
                    <ActionButton icon={RotateCw} label="Right" onClick={() => onRotate("right")} />
                    <ActionButton icon={FlipHorizontal} label="H Flip" onClick={() => onFlip("h")} />
                    <ActionButton icon={FlipVertical} label="V Flip" onClick={() => onFlip("v")} />
                    <ActionButton icon={Undo2} label="Reset" onClick={onReset} variant="ghost" />
                  </div>
                </>
              )}
              {section.key === "light" && section.controls.map((key) => (
                <SliderControl
                  key={key}
                  config={sliderConfig[key]}
                  value={adjustments[key]}
                  onChange={handleSliderChange(key)}
                />
              ))}
              {section.key === "color" && section.controls.map((key) => (
                <SliderControl
                  key={key}
                  config={sliderConfig[key]}
                  value={adjustments[key]}
                  onChange={handleSliderChange(key)}
                />
              ))}
              {section.key === "detail" && section.controls.map((key) => (
                <SliderControl
                  key={key}
                  config={sliderConfig[key]}
                  value={adjustments[key]}
                  onChange={handleSliderChange(key)}
                />
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={onReset}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold
            bg-(--danger)/10 text-(--danger) border border-(--danger)/20 hover:bg-(--danger)/20
            transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-(--danger)/40"
        >
          <Undo2 size={14} />
          Reset All Adjustments
        </button>
      </div>
    </div>
  );
}
