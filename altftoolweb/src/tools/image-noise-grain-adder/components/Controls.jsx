"use client";

import React from "react";
import { 
  Sparkles, 
  Palette, 
  Wand2, 
  Type, 
  Sun, 
  Contrast as ContrastIcon, 
  Droplets,
  Thermometer,
  Cloud,
  Focus,
  Zap
} from "lucide-react";

const Slider = ({ label, icon: Icon, min, max, step = 1, value, onChange, suffix = "" }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[13px] font-bold text-(--foreground)">
        {Icon && <Icon size={14} className="text-blue-500" />}
        {label}
      </div>
      <span className="text-[11px] font-black font-mono text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
        {value}{suffix}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-(--background) rounded-lg appearance-none cursor-pointer accent-blue-600 border border-(--border)"
    />
  </div>
);

const Toggle = ({ label, icon: Icon, active, onToggle }) => (
  <div className="flex items-center justify-between p-2.5 rounded-xl bg-(--background) border border-(--border) hover:border-blue-500/20 transition-all">
    <div className="flex items-center gap-2 text-[12px] font-bold text-(--foreground)">
      {Icon && <Icon size={14} className="text-blue-500" />}
      {label}
    </div>
    <button 
      onClick={onToggle}
      className={`w-9 h-5 rounded-full transition-colors relative ${active ? 'bg-blue-600' : 'bg-(--border)'}`}
    >
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-5' : 'left-1'}`} />
    </button>
  </div>
);

export const GrainControls = ({ settings, updateSetting }) => (
  <div className="space-y-4">
    <Slider 
      label="Intensity" 
      icon={Sparkles} 
      min={0} max={100} 
      value={settings.intensity} 
      onChange={(v) => updateSetting("intensity", v)} 
      suffix="%"
    />
    <Slider 
      label="Grain Size" 
      icon={Focus} 
      min={0.5} max={5} step={0.1}
      value={settings.size} 
      onChange={(v) => updateSetting("size", v)} 
      suffix="px"
    />
    <Slider 
      label="Noise Opacity" 
      icon={Droplets} 
      min={0} max={100} 
      value={settings.opacity} 
      onChange={(v) => updateSetting("opacity", v)} 
      suffix="%"
    />
    <div className="grid grid-cols-1 gap-2 pt-2">
      <Toggle 
        label="Monochrome" 
        icon={Palette} 
        active={settings.monochrome} 
        onToggle={() => updateSetting("monochrome", !settings.monochrome)} 
      />
      <Toggle 
        label="Animated" 
        icon={Zap} 
        active={settings.animated} 
        onToggle={() => updateSetting("animated", !settings.animated)} 
      />
    </div>
  </div>
);

export const ColorControls = ({ settings, updateSetting }) => (
  <div className="space-y-4">
    <Slider 
      label="Brightness" 
      icon={Sun} 
      min={50} max={150} 
      value={settings.brightness} 
      onChange={(v) => updateSetting("brightness", v)} 
      suffix="%"
    />
    <Slider 
      label="Contrast" 
      icon={ContrastIcon} 
      min={50} max={150} 
      value={settings.contrast} 
      onChange={(v) => updateSetting("contrast", v)} 
      suffix="%"
    />
    <Slider 
      label="Saturation" 
      icon={Droplets} 
      min={0} max={200} 
      value={settings.saturation} 
      onChange={(v) => updateSetting("saturation", v)} 
      suffix="%"
    />
    <Slider 
      label="Warmth" 
      icon={Thermometer} 
      min={-100} max={100} 
      value={settings.warmth} 
      onChange={(v) => updateSetting("warmth", v)} 
      suffix="K"
    />
  </div>
);

export const EffectControls = ({ settings, updateSetting }) => (
  <div className="space-y-4">
    <Slider 
      label="Dust Amount" 
      icon={Cloud} 
      min={0} max={100} 
      value={settings.dust} 
      onChange={(v) => updateSetting("dust", v)} 
      suffix="%"
    />
    <Slider 
      label="Scratch Density" 
      icon={Type} 
      min={0} max={100} 
      value={settings.scratches} 
      onChange={(v) => updateSetting("scratches", v)} 
      suffix="%"
    />
    <Slider 
      label="Vignette" 
      icon={Focus} 
      min={0} max={100} 
      value={settings.vignette} 
      onChange={(v) => updateSetting("vignette", v)} 
      suffix="%"
    />
    <Slider 
      label="Soft Blur" 
      icon={Focus} 
      min={0} max={5} step={0.1}
      value={settings.blur} 
      onChange={(v) => updateSetting("blur", v)} 
      suffix="px"
    />
  </div>
);
