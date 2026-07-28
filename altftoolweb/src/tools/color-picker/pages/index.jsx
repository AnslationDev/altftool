"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Palette, Copy, Check, Download, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Utility: copy to clipboard
const safeCopyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
};

// Conversions
function hexToRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6 && h.length !== 8) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

function rgbToHex(r, g, b, a = 1) {
  const toHex = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a * 255) : ""}`;
}

function rgbToHsl(r, g, b, a = 1) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100, a };
}

function hslToRgb(h, s, l, a = 1) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255, a };
}

function rgbToCmyk(r, g, b) {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);
  let k = Math.min(c, Math.min(m, y));
  
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }
  
  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);
  
  return { c: c * 100, m: m * 100, y: y * 100, k: k * 100 };
}

function luminance(r, g, b) {
  const [nR, nG, nB] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return nR * 0.2126 + nG * 0.7152 + nB * 0.0722;
}

function contrastRatio(r1, g1, b1, r2, g2, b2) {
  const l1 = luminance(r1, g1, b1);
  const l2 = luminance(r2, g2, b2);
  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (lightest + 0.05) / (darkest + 0.05);
}

// Generate Palette
function generatePalette(h, s, l) {
  const toHex = (h, s, l) => {
    const rgb = hslToRgb((h % 360 + 360) % 360, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };
  
  return {
    complementary: [toHex(h, s, l), toHex(h + 180, s, l)],
    analogous: [toHex(h - 30, s, l), toHex(h, s, l), toHex(h + 30, s, l)],
    triadic: [toHex(h, s, l), toHex(h + 120, s, l), toHex(h + 240, s, l)],
    monochromatic: [
      toHex(h, s, Math.min(100, l + 30)),
      toHex(h, s, Math.min(100, l + 15)),
      toHex(h, s, l),
      toHex(h, s, Math.max(0, l - 15)),
      toHex(h, s, Math.max(0, l - 30))
    ]
  };
}

export default function ToolHome() {
  const [hex, setHex] = useState("#14B8A6");
  const [alpha, setAlpha] = useState(1);
  const [history, setHistory] = useState([]);
  
  // Try to parse hex
  const rgbObj = useMemo(() => hexToRgb(hex) || { r: 0, g: 0, b: 0, a: 1 }, [hex]);
  const hslObj = useMemo(() => rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b, alpha), [rgbObj, alpha]);
  const cmykObj = useMemo(() => rgbToCmyk(rgbObj.r, rgbObj.g, rgbObj.b), [rgbObj]);
  const palettes = useMemo(() => generatePalette(hslObj.h, hslObj.s, hslObj.l), [hslObj]);
  
  const contrastWhite = useMemo(() => contrastRatio(rgbObj.r, rgbObj.g, rgbObj.b, 255, 255, 255), [rgbObj]);
  const contrastBlack = useMemo(() => contrastRatio(rgbObj.r, rgbObj.g, rgbObj.b, 17, 24, 39), [rgbObj]); // Using #111827

  // Add to history
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHistory(prev => {
        const newHistory = [hex, ...prev.filter(h => h !== hex)].slice(0, 10);
        return newHistory;
      });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [hex]);

  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgbObj, [channel]: Number(value) };
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };
  
  const handleHslChange = (channel, value) => {
    const newHsl = { ...hslObj, [channel]: Number(value) };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleCopy = async (text, label) => {
    if (await safeCopyText(text)) {
      toast.success(`${label} copied!`, { icon: '📋' });
    } else {
      toast.error('Failed to copy');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <Toaster position="bottom-right" />
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Palette className="h-4 w-4" />
            Design
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Color Picker</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Professional real-time color picker with format conversions and palette generation.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="space-y-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <label className="text-sm font-semibold">Select Color</label>
              <div className="mt-2 flex gap-3">
                <input
                  type="color"
                  value={hex.substring(0, 7)}
                  onChange={(e) => setHex(e.target.value)}
                  className="h-12 w-14 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1 sm:w-16 cursor-pointer"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <span>Hue</span>
                    <span>{Math.round(hslObj.h)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="360"
                    value={hslObj.h}
                    onChange={(e) => handleHslChange('h', e.target.value)}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <span>Saturation</span>
                    <span>{Math.round(hslObj.s)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={hslObj.s}
                    onChange={(e) => handleHslChange('s', e.target.value)}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <span>Lightness</span>
                    <span>{Math.round(hslObj.l)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={hslObj.l}
                    onChange={(e) => handleHslChange('l', e.target.value)}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <span>Alpha / Opacity</span>
                    <span>{Math.round(alpha * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={alpha}
                    onChange={(e) => setAlpha(Number(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h3 className="text-sm font-semibold mb-4">Color Formats</h3>
              <div className="space-y-3">
                {[
                  { label: "HEX", value: hex },
                  { label: "RGB", value: `rgb(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b})` },
                  { label: "RGBA", value: `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, ${alpha})` },
                  { label: "HSL", value: `hsl(${Math.round(hslObj.h)}, ${Math.round(hslObj.s)}%, ${Math.round(hslObj.l)}%)` },
                  { label: "CMYK", value: `cmyk(${Math.round(cmykObj.c)}%, ${Math.round(cmykObj.m)}%, ${Math.round(cmykObj.y)}%, ${Math.round(cmykObj.k)}%)` },
                ].map(format => (
                  <div key={format.label} className="flex items-center gap-2">
                    <div className="w-12 text-xs font-semibold text-[var(--muted-foreground)]">{format.label}</div>
                    <input 
                      readOnly 
                      value={format.value} 
                      className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm font-mono outline-none"
                    />
                    <button 
                      onClick={() => handleCopy(format.value, format.label)}
                      className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {history.length > 0 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <h3 className="text-sm font-semibold mb-3">History</h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => setHex(h)}
                      className="w-8 h-8 rounded-full border border-[var(--border)] cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: h }}
                      title={h}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div 
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--anslation-ds-shadow-sm)] min-h-[250px] relative overflow-hidden transition-colors duration-300 flex items-center justify-center p-8"
              style={{ backgroundColor: `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, ${alpha})` }}
            >
               <div
                 className="absolute inset-0 z-0 opacity-20"
                 style={{
                   zIndex: -1,
                   backgroundImage:
                     "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIi8+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNjY2MiLz4KPC9zdmc+')",
                 }}
               ></div>
               
               <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl p-6 text-center max-w-sm w-full shadow-lg z-10 border border-[var(--border)]">
                  <h2 className="text-4xl font-bold tracking-wider mb-2 font-mono" style={{ color: `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, 1)` }}>{hex.toUpperCase()}</h2>
                  <p className="text-sm text-[var(--muted-foreground)] uppercase tracking-widest font-semibold mb-6">Live Preview</p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => handleCopy(`color: ${hex};\nopacity: ${alpha};`, 'CSS Variables')}
                      className="w-full btn-primary"
                      style={{ backgroundColor: `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, 1)` }}
                    >
                      <Copy className="h-4 w-4 mr-2 inline-block" />
                      Copy CSS Styles
                    </button>
                    <button 
                      onClick={() => handleCopy(`bg-[${hex}]`, 'Tailwind Class')}
                      className="w-full px-4 py-2 rounded-lg font-semibold text-sm border border-[var(--border)] hover:bg-[var(--surface-soft)] transition-colors"
                    >
                      Copy Tailwind Class
                    </button>
                  </div>
               </div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <h3 className="text-sm font-semibold mb-4">Accessibility (Light Text)</h3>
                <div 
                  className="rounded-md p-4 mb-4 flex items-center justify-center min-h-[100px]"
                  style={{ backgroundColor: `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, 1)`, color: '#ffffff' }}
                >
                  <p className="text-xl font-semibold">White Text</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[var(--muted-foreground)]">Ratio: <span className="font-mono font-medium text-[var(--foreground)]">{contrastWhite.toFixed(2)}:1</span></div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${contrastWhite >= 4.5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {contrastWhite >= 4.5 ? 'PASS AA' : 'FAIL'}
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <h3 className="text-sm font-semibold mb-4">Accessibility (Dark Text)</h3>
                <div 
                  className="rounded-md p-4 mb-4 flex items-center justify-center min-h-[100px]"
                  style={{ backgroundColor: `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, 1)`, color: '#111827' }}
                >
                  <p className="text-xl font-semibold">Dark Text</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[var(--muted-foreground)]">Ratio: <span className="font-mono font-medium text-[var(--foreground)]">{contrastBlack.toFixed(2)}:1</span></div>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${contrastBlack >= 4.5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {contrastBlack >= 4.5 ? 'PASS AA' : 'FAIL'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h3 className="text-base font-semibold mb-6">Generated Palettes</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-3">Analogous</h4>
                  <div className="flex h-16 rounded-lg overflow-hidden border border-[var(--border)]">
                    {palettes.analogous.map((c, i) => (
                      <div key={i} className="flex-1 cursor-pointer hover:opacity-90 relative group" style={{ backgroundColor: c }} onClick={() => { setHex(c); handleCopy(c, 'Color'); }}>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                           <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded">{c}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-3">Complementary</h4>
                  <div className="flex h-16 rounded-lg overflow-hidden border border-[var(--border)]">
                    {palettes.complementary.map((c, i) => (
                      <div key={i} className="flex-1 cursor-pointer hover:opacity-90 relative group" style={{ backgroundColor: c }} onClick={() => { setHex(c); handleCopy(c, 'Color'); }}>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                           <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded">{c}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-3">Triadic</h4>
                  <div className="flex h-16 rounded-lg overflow-hidden border border-[var(--border)]">
                    {palettes.triadic.map((c, i) => (
                      <div key={i} className="flex-1 cursor-pointer hover:opacity-90 relative group" style={{ backgroundColor: c }} onClick={() => { setHex(c); handleCopy(c, 'Color'); }}>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                           <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded">{c}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold uppercase text-[var(--muted-foreground)] mb-3">Monochromatic</h4>
                  <div className="flex h-16 rounded-lg overflow-hidden border border-[var(--border)]">
                    {palettes.monochromatic.map((c, i) => (
                      <div key={i} className="flex-1 cursor-pointer hover:opacity-90 relative group" style={{ backgroundColor: c }} onClick={() => { setHex(c); handleCopy(c, 'Color'); }}>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                           <span className="bg-white/90 text-black text-[10px] font-bold px-2 py-1 rounded">{c}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
