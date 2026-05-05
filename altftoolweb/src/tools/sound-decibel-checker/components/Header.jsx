"use client";
import { Volume2 } from "lucide-react";

export default function Header() {
  return (
    <div className="text-center mb-8">
      {/* Icon Circle */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-(--muted)">
        <Volume2 className="w-8 h-8 text-(--primary)" />
      </div>

      {/* Title */}
      <h1 className="heading">
        Sound Decibel Checker
      </h1>

      {/* Subtitle */}
      <p className="description">
        Real-time audio analysis & visualization
      </p>
    </div>
  );
}
