"use client";

export function Field({ label, hint, children, right }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {right}
      </div>
      {children}
      {hint && (
        <p className="mt-1 text-xs" style={{ color: "var(--ali-muted)" }}>
          {hint}
        </p>
      )}
    </label>
  );
}

export function RangeField({ label, value, min, max, step = 1, unit = "", onChange, format }) {
  const display = format ? format(value) : `${value}${unit}`;
  return (
    <Field
      label={label}
      right={
        <span
          className="rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums"
          style={{ background: "var(--ali-soft)", color: "var(--ali-teal-700)" }}
        >
          {display}
        </span>
      }
    >
      <input
        type="range"
        className="ali-range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

export function NumberField({ label, value, min, max, onChange, placeholder, hint, disabled }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="number"
        className="ali-input"
        value={value}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      />
    </Field>
  );
}

export function TextField({ label, value, onChange, placeholder, hint }) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        className="ali-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, hint }) {
  return (
    <Field label={label} hint={hint}>
      <select className="ali-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function ToggleRow({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors"
      style={{ borderColor: "var(--ali-border)", background: "var(--ali-surface)" }}
    >
      <span>{label}</span>
      <span
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{ background: checked ? "var(--ali-teal)" : "var(--ali-soft)" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? "22px" : "2px" }}
        />
      </span>
    </button>
  );
}

export function SegMenu({ options, value, onChange, columns = 2 }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          data-active={value === opt.value}
          className="ali-chip justify-center"
          style={{ justifyContent: "center" }}
        >
          {opt.icon}
          <span className="truncate">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
