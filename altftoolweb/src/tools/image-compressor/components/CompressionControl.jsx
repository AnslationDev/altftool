"use client";
import React from "react";

export default function CompressionControl({
  settings,
  onSettingsChange,
  onCompress,
  onReset,
  isCompressing,
  hasImage,
}) {
  return (
    <div className="bg-(--background) border border-(--border) rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-(--foreground) mb-4">
        Compression Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-2">
            Quality: {settings.quality}%
          </label>

          <input
            type="range"
            min="10"
            max="100"
            value={settings.quality}
            onChange={(e) =>
              onSettingsChange({ quality: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-(--muted) rounded-lg cursor-pointer"
          />
        </div>

        {/* Max Width */}
        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-2">
            Max Width (px)
          </label>

          <input
            type="number"
            min="100"
            max="4000"
            value={settings.maxWidth}
            onChange={(e) =>
              onSettingsChange({ maxWidth: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 bg-(--background) text-(--foreground) border border-(--border) rounded-md focus:ring-2 focus:ring-(--primary)"
          />
        </div>

        {/* Max Height */}
        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-2">
            Max Height (px)
          </label>

          <input
            type="number"
            min="100"
            max="4000"
            value={settings.maxHeight}
            onChange={(e) =>
              onSettingsChange({ maxHeight: parseInt(e.target.value) })
            }
            className="w-full px-3 py-2 bg-(--background) text-(--foreground) border border-(--border) rounded-md focus:ring-2 focus:ring-(--primary)"
          />
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-2">
            Output Format
          </label>

          <select
            value={settings.format}
            onChange={(e) => onSettingsChange({ format: e.target.value })}
            className="w-full px-3 py-2 bg-(--background) text-(--foreground) border border-(--border) rounded-md focus:ring-2 focus:ring-(--primary)"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onCompress}
          disabled={!hasImage || isCompressing}
          className={`flex-1 bg-(--primary) text-(--primary-foreground) px-6 py-3 rounded-lg font-medium 
          hover:opacity-90 disabled:bg-(--muted) disabled:text-(--muted-foreground) disabled:cursor-not-allowed transition-all`}
        >
          {isCompressing ? "Compressing..." : "Compress Image"}
        </button>

        <button
          onClick={onReset}
          disabled={!hasImage}
          className={`flex-1 sm:flex-none bg-(--secondary) text-(--secondary-foreground) px-6 py-3 rounded-lg font-medium 
          hover:opacity-90 disabled:bg-(--muted) disabled:text-(--muted-foreground) disabled:cursor-not-allowed transition-all`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
