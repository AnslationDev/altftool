"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Lock, Unlock, Wand2, Palette, RefreshCw } from "lucide-react";

const BEAUTIFUL_PALETTES = [
  ["#6366f1", "#8b5cf6"],
  ["#ec4899", "#f43f5e"],
  ["#0ea5e9", "#06b6d4"],
  ["#10b981", "#34d399"],
  ["#f59e0b", "#f97316"],
  ["#8b5cf6", "#ec4899"],
  ["#06b6d4", "#6366f1"],
  ["#f43f5e", "#f97316"],
  ["#3b82f6", "#06b6d4"],
  ["#a855f7", "#6366f1"],
  ["#ff7e5f", "#feb47b"],
  ["#6a11cb", "#2575fc"],
  ["#f12711", "#f5af19"],
  ["#00b09b", "#96c93d"],
  ["#4776e6", "#8e54e9"],
  ["#b8860b", "#f5e27a"],
];

function randomHex() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  );
}

function randomAngle() {
  return Math.floor(Math.random() * 36) * 10;
}

function randomPalette() {
  return BEAUTIFUL_PALETTES[
    Math.floor(Math.random() * BEAUTIFUL_PALETTES.length)
  ];
}

export default function GradientRandomizer({
  color1,
  color2,
  angle,
  setColor1,
  setColor2,
  setAngle,
}) {
  const [lockedColor1, setLockedColor1] = useState(false);
  const [lockedColor2, setLockedColor2] = useState(false);
  const [lockedAngle, setLockedAngle] = useState(false);
  const [history, setHistory] = useState([]);

  const saveToHistory = (c1, c2, a) => {
    setHistory((prev) => [{ c1, c2, a }, ...prev].slice(0, 6));
  };

  // Full randomize — respects locks
  const randomizeFull = () => {
    const [p1, p2] = randomPalette();
    const newC1 = lockedColor1 ? color1 : p1;
    const newC2 = lockedColor2 ? color2 : p2;
    const newAngle = lockedAngle ? angle : randomAngle();
    saveToHistory(newC1, newC2, newAngle);
    setColor1(newC1);
    setColor2(newC2);
    setAngle(newAngle);
    toast.success("New gradient generated!");
  };

  // Shuffle only colors — keep angle
  const shuffleColors = () => {
    const [p1, p2] = randomPalette();
    const newC1 = lockedColor1 ? color1 : p1;
    const newC2 = lockedColor2 ? color2 : p2;
    saveToHistory(newC1, newC2, angle);
    setColor1(newC1);
    setColor2(newC2);
    toast.success("Colors shuffled!");
  };

  // Shuffle only angle — keep colors
  const shuffleAngle = () => {
    if (lockedAngle) return;
    const newAngle = randomAngle();
    saveToHistory(color1, color2, newAngle);
    setAngle(newAngle);
    toast.success("Angle shuffled!");
  };

  // Restore from history
  const restoreFromHistory = (item) => {
    setColor1(item.c1);
    setColor2(item.c2);
    setAngle(item.a);
    toast.success("↩ Gradient restored!");
  };

  const currentGradient = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

  return (
    <div className="sm:m-8 p-4 border border-(--border) rounded-xl shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold"> Randomize Magic</h3>
        <p className="text-sm text-(--foreground) mt-1">
          Generate beautiful gradients instantly — lock what you love
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left — Controls */}
        <div className="space-y-6">
          {/* Current colors with lock toggles */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Lock Colors</label>

            {/* Color 1 */}
            <div className="flex items-center gap-3 p-3 bg-(--card) rounded-lg border border-(--border) mt-1">
              <div
                className="w-10 h-10 rounded-lg border border-(--border) flex-shrink-0"
                style={{ background: color1 }}
              />
              <span className="text-sm font-mono flex-1">{color1}</span>
              <button
                onClick={() => setLockedColor1((v) => !v)}
                title={lockedColor1 ? "Unlock color 1" : "Lock color 1"}
                className={`text-xl w-9 h-9 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                  lockedColor1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-(--border) hover:bg-(--card)"
                }`}
              >
                {lockedColor1 ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
            </div>

            {/* Color 2 */}
            <div className="flex items-center gap-3 p-3 bg-(--card) rounded-lg border border-(--border)">
              <div
                className="w-10 h-10 rounded-lg border border-(--border) flex-shrink-0"
                style={{ background: color2 }}
              />
              <span className="text-sm font-mono flex-1">{color2}</span>
              <button
                onClick={() => setLockedColor2((v) => !v)}
                title={lockedColor2 ? "Unlock color 2" : "Lock color 2"}
                className={`text-xl w-9 h-9 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                  lockedColor2
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-(--border) hover:bg-(--card)"
                }`}
              >
                {lockedColor2 ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
            </div>

            {/* Angle */}
            <div className="flex items-center gap-3 p-3 bg-(--card) rounded-lg border border-(--border)">
              <div className="w-10 h-10 rounded-lg border border-(--border) flex-shrink-0 flex items-center justify-center text-sm font-mono">
                {angle}°
              </div>
              <span className="text-sm flex-1">Angle</span>
              <button
                onClick={() => setLockedAngle((v) => !v)}
                title={lockedAngle ? "Unlock angle" : "Lock angle"}
                className={`text-xl w-9 h-9 rounded-lg border transition cursor-pointer flex items-center justify-center ${
                  lockedAngle
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-(--border) hover:bg-(--card)"
                }`}
              >
                {lockedAngle ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Main magic button */}
            <button
              onClick={randomizeFull}
              disabled={lockedColor1 && lockedColor2 && lockedAngle}
              className={`w-full py-3 rounded-xl font-semibold text-base transition ${
                lockedColor1 && lockedColor2 && lockedAngle
                  ? "opacity-40 cursor-not-allowed bg-blue-600 text-white"
                  : "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Wand2 size={18} />
                Randomize Magic
              </span>
            </button>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shuffleColors}
                disabled={lockedColor1 && lockedColor2}
                className={`border border-(--border) py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${
                  lockedColor1 && lockedColor2
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer hover:bg-(--card)"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Palette size={16} />
                  Shuffle Colors
                </span>
              </button>
              <button
                onClick={shuffleAngle}
                disabled={lockedAngle}
                className={`border border-(--border) py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-center gap-2 ${
                  lockedAngle
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer hover:bg-(--card)"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} />
                  Shuffle Angle
                </span>
              </button>
            </div>
          </div>

          {/* Lock hint */}
          {(lockedColor1 || lockedColor2 || lockedAngle) && (
            <p className="text-xs text-blue-500 text-center">
              Locked values will not change on shuffle
            </p>
          )}
        </div>

        {/* Right — Preview + History */}
        <div className="space-y-4">
          {/* Current preview */}
          <label className="text-sm font-medium">Current Gradient</label>
          <div
            className="w-full h-36 rounded-xl border border-(--border) mt-1"
            style={{ background: currentGradient }}
          />
          <p className="text-xs text-(--foreground) text-center">
            {angle}° · {color1} → {color2}
          </p>

          {/* History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Recent History</label>
              <div className="grid grid-cols-3 gap-2">
                {history.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => restoreFromHistory(item)}
                    title={`${item.a}° · ${item.c1} → ${item.c2}`}
                    className="h-14 rounded-lg border border-(--border) cursor-pointer hover:scale-105 transition-transform hover:shadow-md"
                    style={{
                      background: `linear-gradient(${item.a}deg, ${item.c1}, ${item.c2})`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-(--foreground) text-center">
                Click any to restore
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
