"use client";

import React, { useState } from "react";
import {
  LOTTIE_INFINITE_PREVIEW_ITERATIONS,
  buildLottieDocument,
} from "../lib/animationState.js";

let html2canvasPromise;

function loadHtml2Canvas() {
  html2canvasPromise ||= import("html2canvas").then((module) => module.default || module);
  return html2canvasPromise;
}

export default function GifExport({
  controls,
  transform,
  animationName,
  color,
  keyframesCss,
  customKeyframes,
}) {

  const [exportSize, setExportSize] = useState(250); // 👈 default size

  const getElement = () => document.querySelector(".animated-element");

  /* 🎬 VIDEO EXPORT */

  const handleMp4 = async () => {
    const element = getElement();
    if (!element) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // ✅ SIZE CONTROL
    canvas.width = exportSize;
    canvas.height = exportSize;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream);

    const chunks = [];
    const html2canvas = await loadHtml2Canvas();

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "animation.webm";
      a.click();
    };

    recorder.start();

    let recording = true;

    const drawFrame = async () => {
      if (!recording) return;

      const frame = await html2canvas(element);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ✅ SCALE FIX
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

      requestAnimationFrame(drawFrame);
    };

    drawFrame();

    setTimeout(() => {
      recording = false;
      recorder.stop();
    }, 2000);
  };

  /* 🎨 LOTTIE EXPORT */

  const handleLottie = () => {
    const lottie = buildLottieDocument({
      size: exportSize,
      animationName,
      controls,
      transform,
      color,
      keyframesCss,
      customKeyframes,
    });

    const blob = new Blob([JSON.stringify(lottie, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "animation.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 bg-(--card) border border-(--border) rounded-lg space-y-4">

      <p className="font-semibold text-(--foreground)">
        Export Animation 🎥
      </p>

      {/* 🎛 SIZE CONTROL UI */}
      <div>
        <label htmlFor="animation-export-size" className="text-sm text-(--foreground)">
          Export video size (px)
        </label>

        <input
          id="animation-export-size"
          type="number"
          min="32"
          max="2000"
          value={exportSize}
          onChange={(e) => setExportSize(Number(e.target.value))}
          className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
        />
      </div>

      <div className="flex gap-3">

        <button
          type="button"
          onClick={handleMp4}
          className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded hover:scale-105 transition"
        >
          Export Video
        </button>

        <button
          type="button"
          onClick={handleLottie}
          className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded hover:scale-105 transition"
        >
          Export Lottie
        </button>

      </div>

      {controls?.iterations === "infinite" && (
        <p className="text-xs text-(--muted-foreground)">
          Infinite animations export as a bounded {LOTTIE_INFINITE_PREVIEW_ITERATIONS}-loop Lottie preview.
        </p>
      )}

    </div>
  );
}
