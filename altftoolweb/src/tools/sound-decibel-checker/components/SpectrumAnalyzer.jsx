"use client";
export default function SpectrumAnalyzer({ frequencyData }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 mb-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Frequency Spectrum
      </h2>

      <div className="bg-black/50 rounded-xl p-4 border border-white/10">
        <div className="flex items-end justify-between gap-1 h-32">
          {frequencyData.map((value, index) => {
            const height = (value / 255) * 100;
            const hue = (index / frequencyData.length) * 280;

            return (
              <div
                key={index}
                className="flex-1 rounded-t transition-all duration-75"
                style={{
                  height: `${height}%`,
                  backgroundColor: `hsl(${hue}, 100%, 50%)`,
                  boxShadow: `0 0 10px hsl(${hue}, 100%, 50%)`,
                  minHeight: "2px",
                }}
              />
            );
          })}
        </div>

        <div className="flex justify-between mt-2 text-xs text-purple-300">
          <span>20 Hz</span>
          <span>1 kHz</span>
          <span>10 kHz</span>
          <span>20 kHz</span>
        </div>
      </div>
    </div>
  );
}
