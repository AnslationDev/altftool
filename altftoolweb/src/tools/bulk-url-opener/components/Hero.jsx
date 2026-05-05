"use client";
import React from "react";

export default function Hero() {
  return (
    <section className="w-full px-4 bg-(--background)">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div
          className="inline-block mb-6 px-4 py-1.5 rounded-full 
                        bg-(--primary)/10 
                        text-(--primary) 
                        border border-(--primary)/30 
                        text-sm font-semibold"
        >
          🚀 Instant Link Launcher
        </div>

        {/* Title */}
        <h1 className="heading mb-6">Bulk URL Opener</h1>

        {/* Description */}
        <p className="description max-w-2xl mx-auto mb-8">
          Paste multiple URLs and open all valid links instantly. No installs
          required, completely safe, and works directly in your browser.
        </p>
      </div>
    </section>
  );
}