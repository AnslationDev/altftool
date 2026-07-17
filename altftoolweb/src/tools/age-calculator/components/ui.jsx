"use client";

// Small shared primitives for the Age Calculator, themed purely through
// ALTFTool semantic tokens (teal primary / cyan secondary) so the tool tracks
// the platform in both light and dark.

const softPrimary = "color-mix(in srgb, var(--primary) 12%, transparent)";

export function SectionCard({ title, icon: Icon, action, className = "", children }) {
  return (
    <section
      className={`@container rounded-2xl border border-(--border) bg-(--card) p-5 shadow-sm sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-(--foreground)">
            {Icon ? (
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-(--primary)"
                style={{ background: softPrimary }}
              >
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
            ) : null}
            {title}
          </h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatTile({ icon: Icon, value, label, tone = "var(--primary)", className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-(--border) p-4 shadow-sm transition hover:shadow-md ${className}`}
      style={{ background: `color-mix(in srgb, ${tone} 5%, var(--card))` }}
    >
      {Icon ? (
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${tone} 14%, transparent)`, color: tone }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
      ) : null}
      <div className="min-w-0">
        <p className="text-lg font-black leading-tight tracking-tight text-(--foreground) [font-variant-numeric:tabular-nums]">
          {value}
        </p>
        <p className="text-xs font-semibold text-(--muted-foreground)">{label}</p>
      </div>
    </div>
  );
}

export function Chip({ icon: Icon, children }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--card) px-3 py-1.5 text-xs font-semibold text-(--foreground)"
    >
      {Icon ? <Icon className="h-3.5 w-3.5 text-(--primary)" /> : null}
      {children}
    </span>
  );
}

export const fmt = (n) => Number(n || 0).toLocaleString("en-US");

// Compact display for very large figures (1.39B, 620M) — display only, the
// underlying calculation stays untouched.
export const fmtCompact = (n) => {
  const v = Number(n || 0);
  if (v >= 1e9) return `${(v / 1e9).toFixed(2).replace(/\.?0+$/, "")}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  return v.toLocaleString("en-US");
};

// Accent tones: master.md teal (primary) + cyan (secondary), plus blue as the
// additional accent the brief allows. Used to colour tiles/illustration chips.
export const ACCENT = {
  teal: "var(--primary)",
  cyan: "var(--secondary)",
  blue: "#3B82F6",
  violet: "#8B5CF6",
};
