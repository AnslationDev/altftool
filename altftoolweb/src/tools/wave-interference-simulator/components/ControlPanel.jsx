import { AmplitudeIcon, FrequencyIcon, WavelengthIcon, PhaseIcon, SpeedIcon } from "./Icons";

const sliderIcons = {
  Amplitude: AmplitudeIcon,
  "Frequency (Hz)": FrequencyIcon,
  Wavelength: WavelengthIcon,
  "Phase (°)": PhaseIcon,
  Speed: SpeedIcon,
};

function Slider({ label, value, min, max, step, onChange }) {
  const IconComponent = sliderIcons[label] || null;
  return (
    <label className="flex flex-col gap-1 text-xs text-[var(--muted-foreground)]">
      <span className="flex items-center justify-between font-medium">
        <span className="flex items-center gap-1.5">
          {IconComponent && <IconComponent />}
          {label}
        </span>
        <span className="font-mono text-[var(--foreground)]">
          {typeof value === "number" ? value.toFixed(2) : value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--border)] accent-[var(--primary)]"
      />
    </label>
  );
}

export default function ControlPanel({ waves, setWaves, mode, emitterDistance, setEmitterDistance }) {
  const updateWave = (index, key, value) => {
    const newWaves = [...waves];
    newWaves[index] = { ...newWaves[index], [key]: value };
    setWaves(newWaves);
  };

  const showEmitter = mode === "ripple";
  const isDual = mode === "interference" || mode === "ripple";

  return (
    <div className="space-y-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
      <h2 className="subheading text-[var(--primary)] flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        Controls
      </h2>
      {waves.map((wave, idx) => (
        <div key={idx} className="space-y-2">
          {(isDual || idx === 0) && (
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Wave {idx + 1}</p>
          )}
          <Slider label="Amplitude" value={wave.amplitude} min={0.1} max={3} step={0.1}
            onChange={v => updateWave(idx, "amplitude", v)} />
          <Slider label="Frequency (Hz)" value={wave.frequency} min={0.2} max={5} step={0.1}
            onChange={v => updateWave(idx, "frequency", v)} />
          <Slider label="Wavelength" value={wave.wavelength} min={0.4} max={3} step={0.1}
            onChange={v => updateWave(idx, "wavelength", v)} />
          <Slider label="Phase (°)" value={(wave.phase * 180) / Math.PI} min={0} max={360} step={1}
            onChange={v => updateWave(idx, "phase", v * Math.PI / 180)} />
          {idx === 0 && mode !== "standing" && (
            <Slider label="Speed" value={wave.speed} min={0.1} max={3} step={0.1}
              onChange={v => {
                const newWaves = [...waves];
                newWaves.forEach((_, i) => newWaves[i] = { ...newWaves[i], speed: v });
                setWaves(newWaves);
              }} />
          )}
        </div>
      ))}
      {showEmitter && (
        <Slider label="Emitter Distance" value={emitterDistance} min={1} max={6} step={0.1}
          onChange={setEmitterDistance} />
      )}
    </div>
  );
}
