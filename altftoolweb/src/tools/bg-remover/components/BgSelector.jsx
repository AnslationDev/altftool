"use client";

import { useState, useRef, useEffect } from "react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function BackgroundSelector({ backgrounds, onSelect }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState("#ffffff");
  const colorInputRef = useRef(null);

  const handleApplyColor = () => {
    onSelect(tempColor);
    setShowColorPicker(false);
  };

  useEffect(() => {
    if (showColorPicker) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showColorPicker]);

  return (
    <div className="mt-8">
      <h2 className="text-base font-semibold mb-4 text-center">
        Choose Background
      </h2>

      {/* ✅ CENTER WRAPPER */}
      <div className="flex justify-center">
        <div
          className="
            grid 
            grid-cols-4 
            sm:grid-cols-5 
            md:grid-cols-6 
            lg:grid-cols-7
            gap-2
            max-w-[1000px]
            
          "
        >
          {backgrounds.map((bg, i) => (
            <div
              key={i}
              onClick={() => onSelect(bg.src)}
              className="cursor-pointer rounded-md border border-(--border) shadow-md hover:scale-105 transition overflow-hidden bg-(--card)"
            >
              {/* square image */}
              <div className="aspect-square w-full">
                <ManagedImage
                  src={bg.src}
                  alt={bg.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* ✅ TEXT RESTORED */}
              <p className="text-[10px] text-center py-1 truncate">
                {bg.name}
              </p>
            </div>
          ))}

          {/* ✅ SOLID COLOR TILE (MATCHED STYLE) */}
          <div
            onClick={() => setShowColorPicker(true)}
            className="cursor-pointer rounded-md border border-(--border) shadow-md hover:scale-105 transition overflow-hidden bg-(--card)"
          >
            <div className="aspect-square w-full flex items-center justify-center text-[10px] font-medium text-center px-1">
              Color
            </div>
            <p className="text-[10px] text-center py-1">
              Custom
            </p>
          </div>
        </div>
      </div>

      {/* ✅ MODAL */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[260px] text-center">

            <h3 className="font-semibold mb-4 text-sm">Color Preview</h3>

            <div
              className="w-16 h-16 mx-auto rounded-full border border-(--border) shadow-sm mb-5"
              style={{ background: tempColor }}
            />

            <input
              type="color"
              value={tempColor}
              onInput={(e) => setTempColor(e.target.value)}
              onChange={(e) => setTempColor(e.target.value)}
              ref={colorInputRef}
              className="hidden"
            />

            <button
              onClick={() => colorInputRef.current.click()}
              className="px-3 py-2 border-(--border) shadow-sm rounded-lg mb-5 text-sm bg-(--primary) text-white"
            >
              Choose Color
            </button>

            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowColorPicker(false)}
                className="px-3 py-2 bg-gray-400 text-white rounded-md text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleApplyColor}
                className="px-3 py-2 bg-(--primary) text-white rounded-md text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}