"use client";

import { Palette, Maximize, Shield, ArrowDownToLine, Image as ImageIcon } from "lucide-react";

export default function QRControls({
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  transparentBg,
  setTransparentBg,
  size,
  setSize,
  margin,
  setMargin,
  errorLevel,
  setErrorLevel,
  customLogo,
  handleLogo,
  removeLogo,
}) {
  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-6 shadow-sm">
      <h2 className="font-semibold text-lg flex items-center gap-2 text-(--primary)">
        <Palette size={20} /> Customize QR Code
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
            Foreground
          </label>
          <input
            type="color"
            className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-(--border)"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            title="QR code color"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
            Background
          </label>
          <input
            type="color"
            className="w-full h-10 rounded-lg cursor-pointer bg-transparent border border-(--border)"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            disabled={transparentBg}
            title="Background color"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qr-ctl-size" className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide flex items-center gap-1">
            <Maximize size={12} /> Size
          </label>
          <select
            id="qr-ctl-size"
            className="w-full h-10 px-2 bg-(--background) border border-(--border) rounded-lg font-semibold text-sm"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={150}>Small (150)</option>
            <option value={220}>Medium (220)</option>
            <option value={300}>Large (300)</option>
            <option value={400}>Extra Large (400)</option>
            <option value={512}>Print (512)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qr-ctl-margin" className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">
            Margin
          </label>
          <select
            id="qr-ctl-margin"
            className="w-full h-10 px-2 bg-(--background) border border-(--border) rounded-lg font-semibold text-sm"
            value={margin}
            onChange={(e) => setMargin(Number(e.target.value))}
          >
            <option value={0}>None (0)</option>
            <option value={4}>Small (4)</option>
            <option value={8}>Medium (8)</option>
            <option value={16}>Large (16)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="qr-ctl-error-level" className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide flex items-center gap-1">
            <Shield size={12} /> Error Correction
          </label>
          <select
            id="qr-ctl-error-level"
            className="w-full h-10 px-2 bg-(--background) border border-(--border) rounded-lg font-semibold text-sm"
            value={errorLevel}
            onChange={(e) => setErrorLevel(e.target.value)}
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide flex items-center gap-1">
            <ImageIcon size={12} /> Logo
          </label>
          {customLogo ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-(--primary)">Logo added</span>
              <button
                onClick={removeLogo}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="w-full h-10 rounded-lg border flex items-center justify-center cursor-pointer text-sm font-semibold bg-(--background) border-(--border) hover:border-(--primary) transition-colors">
              <ImageIcon size={14} className="mr-1" /> Upload
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleLogo}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          role="switch"
          aria-checked={transparentBg}
          onClick={() => setTransparentBg(!transparentBg)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-(--primary) focus:ring-offset-2 ${
            transparentBg ? "bg-(--primary)" : "bg-(--border)"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              transparentBg ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <label className="text-sm font-semibold text-(--foreground)">
          Transparent Background
        </label>
      </div>
    </div>
  );
}
