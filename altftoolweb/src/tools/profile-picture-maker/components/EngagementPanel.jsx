"use client";

import React from "react";
import { Share2, Heart } from "lucide-react";

export default function EngagementPanel({ savePreset, canvasRef, currentState}) {

  const handleWhatsAppShare = () => {
  if (!canvasRef?.current) {
    alert("Canvas not ready");
    return;
  }

  try {
    const dataUrl = canvasRef.current.toDataURL("image/png");

    // Step 1: Download image
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "profile.png";
    link.click();

    // Step 2: Open WhatsApp with instruction
    const text = encodeURIComponent(
      "I just created my new profile picture 🚀 Upload it here 👇"
    );

    window.open(`https://wa.me/?text=${text}`, "_blank");

  } catch (e) {
    console.error(e);
    alert("Error while sharing");
  }
};

  return (
    <div className=" w-full space-y-4 p-4 rounded-2xl border border-(--border) bg-(--card)">

      <h3 className="text-sm text-gray-300 font-semibold">
        Quick Actions 
      </h3>

      <div className="flex flex-col gap-3">

        <button
          onClick={savePreset}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-pink-500 text-white"
        >
          <Heart size={16} /> Save Preset
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white"
        >
          <Share2 size={16} /> Download & Share
        </button>

      </div>
    </div>
  );
}