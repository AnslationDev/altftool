"use client";

export default function Spectrum({ frequencyData }) {
  return (
    <div className="rounded-3xl p-4 sm:p-8 border border-(--border) bg-(--card) shadow-md transition-colors mb-6">
      <h2 className="text-lg sm:text-xl font-semibold text-(--foreground) mb-4 sm:mb-6">
        Frequency Spectrum
      </h2>

      <div className="rounded-xl p-2 sm:p-4 border border-(--border) bg-(--muted) transition-colors">
        <div className="flex items-end gap-0.5 sm:gap-1 h-32 w-full overflow-hidden">
          {frequencyData.map((value, index) => {
            const height = (value / 255) * 100;
            const hue = (index / frequencyData.length) * 280;

            return (
              <div
                key={index}
                className="flex-1 min-w-0 rounded-t transition-all duration-75"
                style={{
                  height: `${Math.max(height, 1)}%`,
                  backgroundColor: `hsl(${hue}, 100%, 50%)`,
                  boxShadow: `0 0 8px hsl(${hue}, 100%, 50%)`,
                  minHeight: "2px",
                }}
              />
            );
          })}
        </div>

        <div className="flex justify-between mt-2 text-(--muted-foreground) text-[10px] sm:text-xs">
          <span>20Hz</span>
          <span>1kHz</span>
          <span>10kHz</span>
          <span>20kHz</span>
        </div>
      </div>
    </div>
  );
}
