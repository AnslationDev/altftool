"use client";

import React, { Suspense } from "react";
import AmbientMixer from "./components/AmbientMixer";

export default function SoftMurmurPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-400">
            Loading Ambient Mixer...
          </p>
        </div>
      }
    >
      <AmbientMixer />
    </Suspense>
  );
}
