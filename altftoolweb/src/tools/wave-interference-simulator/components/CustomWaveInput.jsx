export default function CustomWaveInput({ waves, customFormula, setCustomFormula, setWaves }) {
  const updateFormula = (waveIdx, text) => {
    const newCustom = { ...customFormula };
    if (waveIdx === 1) newCustom.wave2 = text;
    else newCustom.wave1 = text;
    setCustomFormula(newCustom);
  };

  const toggleCustom = (waveIdx) => {
    const newCustom = { ...customFormula };
    newCustom.useCustom = [...newCustom.useCustom];
    newCustom.useCustom[waveIdx] = !newCustom.useCustom[waveIdx];
    setCustomFormula(newCustom);
  };

  return (
    <div className="space-y-5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h2 className="subheading text-[var(--primary)]">Custom Formula</h2>
      {[0, 1].map(idx => (
        <div key={idx} className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">Wave {idx + 1}</p>
            <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <input type="checkbox" checked={customFormula.useCustom[idx]} onChange={() => toggleCustom(idx)} className="accent-[var(--primary)]" />
              Use custom formula
            </label>
          </div>
          <textarea
            value={idx === 0 ? customFormula.wave1 : customFormula.wave2}
            onChange={e => updateFormula(idx, e.target.value)}
            rows={3}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2 font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none"
            placeholder="e.g. A*sin(k*x - w*t + phi)"
          />
        </div>
      ))}
      <p className="text-[10px] text-[var(--muted-foreground)]">
        You can use variables <code>x</code>, <code>t</code>, <code>A</code>, <code>k</code>, <code>w</code>, <code>phi</code>, <code>PI</code>, <code>E</code>, and standard functions.
      </p>
    </div>
  );
}
