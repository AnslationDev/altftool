export default function Effects({ settings, update }) {
  return (
    <section className="font-css-card p-4 sm:p-5 space-y-5">
      <h2 className="text-lg font-black text-[var(--foreground)]">Effects</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <button type="button" onClick={() => update("gradientEnabled", !settings.gradientEnabled)} className={`font-css-toggle ${settings.gradientEnabled ? "is-on" : ""}`}>
          Gradient Text {settings.gradientEnabled ? "On" : "Off"}
        </button>
        <button type="button" onClick={() => update("shadowEnabled", !settings.shadowEnabled)} className={`font-css-toggle ${settings.shadowEnabled ? "is-on" : ""}`}>
          Text Shadow {settings.shadowEnabled ? "On" : "Off"}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <label className="font-css-mini-label">Gradient From<input type="color" value={settings.gradientFrom} onChange={(event) => update("gradientFrom", event.target.value)} className="font-css-color mt-2" /></label>
        <label className="font-css-mini-label">Gradient To<input type="color" value={settings.gradientTo} onChange={(event) => update("gradientTo", event.target.value)} className="font-css-color mt-2" /></label>
        <label className="font-css-mini-label">Angle<input type="range" min="0" max="360" value={settings.gradientAngle} onChange={(event) => update("gradientAngle", Number(event.target.value))} className="w-full mt-4 accent-cyan-400" /><span className="text-xs text-cyan-400">{settings.gradientAngle}deg</span></label>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          ["shadowX", "X", -80, 80],
          ["shadowY", "Y", -80, 80],
          ["shadowBlur", "Blur", 0, 120],
        ].map(([key, label, min, max]) => (
          <label key={key} className="font-css-mini-label">
            {label}
            <input type="range" min={min} max={max} value={settings[key]} onChange={(event) => update(key, Number(event.target.value))} className="w-full mt-4 accent-cyan-400" />
            <span className="text-xs text-cyan-400">{settings[key]}px</span>
          </label>
        ))}
        <label className="font-css-mini-label">Shadow Color<input type="color" value={settings.shadowColor} onChange={(event) => update("shadowColor", event.target.value)} className="font-css-color mt-2" /></label>
      </div>
    </section>
  );
}
