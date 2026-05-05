"use-client";
import React, { useState, useRef, useEffect } from "react";
import { RotateCw, Target, Trash2, Info } from "lucide-react";

import HowItWorks from "../components/HowItWork";

const UltimateWheelSpinTool = () => {
  const [names, setNames] = useState([
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
  ]);
  const [inputValue, setInputValue] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const wheelRef = useRef(null);

  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFE66D",
    "#95E1D3",
    "#C7B3E5",
    "#FF8B94",
    "#A8E6CF",
    "#FFD3B6",
    "#FFAAA5",
    "#FF6B9D",
  ];

  const addName = () => {
    if (inputValue.trim()) {
      setNames([...names, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeName = (i) => setNames(names.filter((_, index) => index !== i));
  const clearAll = () => setNames([]);

  const spin = () => {
    if (!names.length) return alert("Add at least one option!");
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedItem(null);

    const spins = 5 + Math.floor(Math.random() * 3);
    const extraDegree = Math.floor(Math.random() * 360);

    const totalRotation = rotation + spins * 360 + extraDegree;
    setRotation(totalRotation);

    setTimeout(() => {
      const normalized = totalRotation % 360;
      const segment = 360 / names.length;
      const adjusted = (360 - normalized) % 360;
      const index = Math.floor(adjusted / segment);
      setSelectedItem(names[index]);
      setIsSpinning(false);
    }, 5000);
  };

  const handleKeyPress = (e) => e.key === "Enter" && addName();

  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8 text-(--foreground)">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* TITLE */}
        <div className="p-6 rounded-xl border border-(--border) bg-(--card) shadow-sm">
          <h2 className="text-2xl font-bold text-(--primary)">
            🎡 Ultimate Wheel Spinner
          </h2>
          <p className="text-(--muted-foreground)">
            Interactive animated selection spinner — add options and spin!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT — Wheel */}
          <div className="p-6 rounded-xl bg-(--card) border border-(--border) shadow-sm flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-6">Wheel Spinner</h3>

            {/* Wheel container */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-8">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "20px solid transparent",
                    borderRight: "20px solid transparent",
                    borderTop: "30px solid #ef4444",
                  }}
                ></div>
              </div>

              {/* Wheel */}
              <div
                ref={wheelRef}
                className="w-full h-full rounded-full shadow-2xl relative"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? "transform 5s cubic-bezier(0.17,0.67,0.12,0.99)"
                    : "none",
                  background: names.length
                    ? `conic-gradient(${names
                        .map(
                          (_, i) =>
                            `${colors[i % colors.length]} ${i * (360 / names.length)}deg ${
                              (i + 1) * (360 / names.length)
                            }deg`,
                        )
                        .join(", ")})`
                    : "conic-gradient(#ccc 0deg, #ccc 360deg)",
                }}
              >
                {/* Labels */}
                {names.map((item, index) => {
                  const segment = 360 / names.length;
                  const angle = index * segment + segment / 2;

                  return (
                    <div
                      key={index}
                      className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <div
                        className="font-bold text-xs md:text-sm text-white drop-shadow-lg px-2 text-center"
                        style={{
                          transform: "translateY(-85px)",
                          maxWidth: "90px",
                          lineHeight: "1.2",
                        }}
                      >
                        {item}
                      </div>
                    </div>
                  );
                })}

                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-(--background) rounded-full flex items-center justify-center shadow-md border border-(--border)">
                  🎡
                </div>
              </div>
            </div>

            {/* SPIN BUTTON */}
            <button
              onClick={spin}
              disabled={isSpinning || !names.length}
              className="w-full max-w-xs h-12 rounded-lg font-bold text-white bg-linear-to-r from-blue-500 to-purple-600 hover:opacity-90 flex items-center justify-center gap-2"
            >
              {isSpinning ? (
                <RotateCw className="animate-spin w-5 h-5" />
              ) : (
                <Target className="w-5 h-5" />
              )}
              {isSpinning ? "SPINNING..." : "SPIN THE WHEEL"}
            </button>

            {/* RESULT */}
            {selectedItem && (
              <div className="mt-6 text-center">
                <p className="font-semibold">🎉 Winner:</p>
                <div className="mt-2 px-6 py-3 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg text-xl font-bold">
                  {selectedItem}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Manage Options */}
          <div className="p-6 rounded-xl bg-(--card) border border-(--border) shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Manage Options</h3>

            {/* Input */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Enter option..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="p-3 rounded-lg border border-(--border) w-full bg-(--background) text-(--foreground)"
              />
              <button
                onClick={addName}
                className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
              >
                Add
              </button>
            </div>

            {/* List */}
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              Current Options
              <span className="px-3 py-1 text-sm rounded-full bg-(--muted) text-(--foreground)">
                {names.length}
              </span>
            </h4>

            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {names.map((name, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-(--muted) border border-(--border) flex justify-between items-center"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    ></div>

                    <span className="truncate font-medium">{name}</span>
                  </div>

                  <button
                    onClick={() => removeName(i)}
                    className="p-2 rounded-md hover:bg-red-100 text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {!names.length && (
                <p className="text-center text-(--muted-foreground) italic py-6">
                  No options yet. Add one to begin!
                </p>
              )}
            </div>

            {/* Clear All */}
            {names.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full mt-4 py-3 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="p-4 sm:p-6 rounded-xl border border-(--border) bg-(--card) shadow-sm">
          <h3 className="text-base sm:text-lg font-semibold text-(--foreground) mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-(--primary) shrink-0" />
            About Wheel Spinner
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Feature 1 */}
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                <span className="px-3 py-1 rounded-md text-white font-medium text-sm w-fit bg-blue-500">
                  Random Selection
                </span>

                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Ideal for decision-making, raffles, giveaways, team rotations,
                  classroom activities, or fun challenges. Each spin uses
                  randomized logic to ensure a fair and unbiased result every
                  time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                <span className="px-3 py-1 rounded-md text-white font-medium text-sm w-fit bg-emerald-500">
                  Unlimited Options
                </span>

                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Add as many options as you want. The wheel dynamically adjusts
                  its size, segments, and colors based on the number of entries.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Feature 3 */}
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                <span className="px-3 py-1 rounded-md text-white font-medium text-sm w-fit bg-purple-500">
                  Smooth Animations
                </span>

                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Enjoy realistic spinning animations with momentum and easing
                  effects. Every spin feels natural, engaging, and fun to watch.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                <span className="px-3 py-1 rounded-md text-white font-medium text-sm w-fit bg-pink-500">
                  Easy Customization
                </span>

                <p className="text-sm text-(--muted-foreground) leading-relaxed">
                  Add, remove, or clear options anytime. The tool updates
                  instantly and ensures each option is clearly visible with
                  auto-assigned colors.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-(--card) border border-(--border)">
          <HowItWorks />
        </div>
      </div>
    </div>
  );
};

export default UltimateWheelSpinTool;
