import { motion } from "framer-motion";

const MODES = [
  { id: "normal", name: "Normal Vision", color: "bg-gray-500" },
  { id: "protanopia", name: "Protanopia", color: "bg-red-500" },
  { id: "deuteranopia", name: "Deuteranopia", color: "bg-green-500" },
  { id: "tritanopia", name: "Tritanopia", color: "bg-blue-500" },
  { id: "achromatopsia", name: "Achromatopsia", color: "bg-gray-800" },
];

export default function AccessibilityModes({ currentMode, onModeChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-8">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
            currentMode === mode.id
              ? "bg-(--primary) text-white border-(--primary) shadow-md scale-105"
              : "bg-(--card) text-(--secondary-foreground) border-(--border) hover:bg-(--muted)"
          }`}
        >
          {mode.name}
        </button>
      ))}
    </div>
  );
}
