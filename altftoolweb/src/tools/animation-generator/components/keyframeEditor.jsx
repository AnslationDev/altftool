import React, { useState, useEffect } from "react";

export default function KeyframeEditor({ onChange }) {

  const [frames, setFrames] = useState([
    { percent: 0, opacity: 0, transform: "translateY(40px)" },
    { percent: 50, opacity: 0.5, transform: "" },
    { percent: 100, opacity: 1, transform: "translateY(0)" }
  ]);

  useEffect(() => {
    onChange && onChange(frames);
  }, [frames, onChange]);

  const updateFrame = (index, key, value) => {
    const updated = [...frames];
    updated[index][key] = value;
    setFrames(updated);
  };

  const generatedCode = `
@keyframes customAnimation {
${frames.map(f => `
  ${f.percent}% {
    opacity: ${f.opacity};
    ${f.transform ? `transform: ${f.transform};` : ""}
  }
`).join("")}
}
`;

  return (
    <div className=" p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)">

      {/* TITLE */}
      <div>
        <h2 className="font-semibold text-(--foreground)">
          Keyframe Editor 🎬
        </h2>
        <p className="text-sm text-(--muted-foreground)">
          Define how your animation behaves at different stages
        </p>
      </div>

      {/* FRAMES */}
      <div className="space-y-3">

        {frames.map((frame, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end p-3 border border-(--border) rounded-lg bg-(--muted)"
          >

            {/* % */}
            <div>
              <label className="text-xs text-(--muted-foreground)">
                Progress (%)
              </label>
              <input
                type="number"
                value={frame.percent}
                onChange={(e) => updateFrame(idx, "percent", e.target.value)}
                className="border-(--border) shadow-sm p-2 rounded w-full bg-(--card) text-(--foreground)" 
              />
            </div>

            {/* OPACITY */}
            <div>
              <label className="text-xs text-(--muted-foreground)">
                Opacity
              </label>
              <input
                type="number"
                step="0.1"
                value={frame.opacity}
                onChange={(e) => updateFrame(idx, "opacity", e.target.value)}
                className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              />
            </div>

            {/* TRANSFORM */}
            <div className="md:col-span-2">
              <label className="text-xs text-(--muted-foreground)">
                Transform (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. translateY(40px), scale(1.2)"
                value={frame.transform}
                onChange={(e) => updateFrame(idx, "transform", e.target.value)}
                className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
              />
            </div>

          </div>
        ))}

      </div>

      {/* CODE PREVIEW */}
      <div>
        <p className="text-sm font-medium mb-1 text-(--foreground)">
          Generated CSS 👇
        </p>

        <pre className="bg-(--muted-gray) p-3 rounded text-xs overflow-x-auto border border-(--border)">
          {generatedCode}
        </pre>
      </div>

    </div>
  );
}
