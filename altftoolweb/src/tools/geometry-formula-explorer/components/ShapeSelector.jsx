import { Circle, Square, Triangle as TriIcon } from "lucide-react";

const ICON_MAP = {
  circle: Circle,
  square: Square,
  triangle: TriIcon,
  trapezoid: TriIcon,
  parallelogram: TriIcon,
  box: Square,
  cylinder: Circle,
  cone: TriIcon,
};

export default function ShapeSelector({ shapes, selected, onSelect }) {
  const twoD = shapes.filter((s) => s.category === "2D");
  const threeD = shapes.filter((s) => s.category === "3D");

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h3 className="text-base font-bold text-[var(--foreground)]">Select Shape</h3>
      </div>
      <div className="p-6">
        <p className="mb-3 text-xs font-semibold uppercase text-[var(--muted-foreground)]">2D Shapes</p>
        <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {twoD.map((s) => {
            const Icon = ICON_MAP[s.icon] || Circle;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                  selected?.id === s.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <Icon className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--foreground)]">{s.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mb-3 text-xs font-semibold uppercase text-[var(--muted-foreground)]">3D Shapes</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {threeD.map((s) => {
            const Icon = ICON_MAP[s.icon] || Circle;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                  selected?.id === s.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/5 shadow-md ring-1 ring-[var(--primary)]/20"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30"
                }`}
              >
                <Icon className="h-5 w-5 text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--foreground)]">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
