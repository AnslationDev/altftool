export default function DoubleSlitControls({ settings, setSettings }) {
  const update = (key, value) => setSettings({ ...settings, [key]: value });
  const fringeSpacing = settings.wavelength * settings.screenDist / settings.slitSep * 1e3;

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h2 className="subheading text-[var(--primary)]">Double Slit</h2>
      <Slider label="Wavelength (nm)" value={settings.wavelength * 1e9} min={400} max={700} step={1} onChange={v => update("wavelength", v / 1e9)} />
      <Slider label="Slit separation d (mm)" value={settings.slitSep * 1e3} min={0.1} max={1.0} step={0.01} onChange={v => update("slitSep", v / 1e3)} />
      <Slider label="Screen distance L (m)" value={settings.screenDist} min={0.5} max={5} step={0.1} onChange={v => update("screenDist", v)} />
      <Slider label="Slit width a (mm, 0=off)" value={settings.slitWidth * 1e3} min={0} max={0.5} step={0.01} onChange={v => update("slitWidth", v / 1e3)} />
      <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
        <span>Fringe spacing:</span>
        <span className="font-mono text-[var(--foreground)]">{fringeSpacing.toFixed(2)} mm</span>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-[var(--muted-foreground)]">
      <span className="flex justify-between font-medium">
        {label}
        <span className="font-mono text-[var(--foreground)]">{typeof value === "number" ? value.toFixed(2) : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--border)] accent-[var(--primary)]" />
    </label>
  );
}
