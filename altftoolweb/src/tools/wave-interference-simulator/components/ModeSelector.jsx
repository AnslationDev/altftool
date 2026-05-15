import { WaveIcon, InterferenceIcon, StandingWaveIcon, RippleIcon, DoubleSlitIcon, CustomIcon } from "./Icons";

const MODES = [
  { id: "single",      label: "Single Wave",     icon: WaveIcon },
  { id: "interference",label: "Interference",     icon: InterferenceIcon },
  { id: "standing",    label: "Standing Wave",    icon: StandingWaveIcon },
  { id: "ripple",      label: "Ripple Mode",      icon: RippleIcon },
  { id: "doubleslit",  label: "Double Slit",      icon: DoubleSlitIcon },
  { id: "custom",      label: "Custom Formula",   icon: CustomIcon },
];

export default function ModeSelector({ current, onChange, vertical = false }) {
  if (vertical) {
    return (
      <div className="flex flex-col gap-3">
        {MODES.map(m => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-semibold
                ${current === m.id
                  ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--primary)] shadow-[var(--anslation-ds-shadow-sm)]"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                }`}
            >
              <Icon />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {MODES.map(m => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold
              ${current === m.id
                ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--primary)] shadow-[var(--anslation-ds-shadow-sm)]"
                : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
              }`}
          >
            <Icon />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
