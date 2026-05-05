import React, { useState } from "react";

export default function AiAnimationGenerator({ onGenerate }) {
  const [input, setInput] = useState("");

  const generateAnimation = () => {
    let keyframes = "";

    if (input.toLowerCase().includes("fade")) {
      keyframes = `
@keyframes aiAnimation {
  0% { opacity: 0; }
  100% { opacity: 1; }
}`;
    }

    else if (input.toLowerCase().includes("zoom")) {
      keyframes = `
@keyframes aiAnimation {
  0% { transform: scale(0.5); }
  100% { transform: scale(1); }
}`;
    }

    else if (input.toLowerCase().includes("rotate")) {
      keyframes = `
@keyframes aiAnimation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
    }

    else {
      keyframes = `
@keyframes aiAnimation {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}`;
    }

    // 🔥 IMPORTANT PART
    onGenerate({
      name: "aiAnimation",
      keyframes: keyframes
    });
  };

  return (
    <div className="p-4 bg-(--card) border border-(--border) rounded-lg space-y-3">
      <p className="font-semibold text-(--foreground)">
        AI Animation Generator
      </p>

      <input
        type="text"
        placeholder="Type animation (e.g. fade, zoom, rotate)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
      />

      <button
        onClick={generateAnimation}
        className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded"
      >
        Generate Animation
      </button>
    </div>
  );
}