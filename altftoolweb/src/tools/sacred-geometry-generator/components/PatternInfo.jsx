import { Atom, CircleDot, Triangle } from "lucide-react";
import { PATTERNS } from "../utils/patterns";

const icons = {
  flower: CircleDot,
  sriYantra: Triangle,
  metatron: Atom,
};

const details = {
  flower: [
    "Equal-radius circles",
    "Sixfold radial symmetry",
    "Great for mandala bases",
  ],
  sriYantra: [
    "Nine triangle system",
    "Central bindu point",
    "Lotus and boundary layers",
  ],
  metatron: [
    "Thirteen node structure",
    "Fruit of Life foundation",
    "Dense chord network",
  ],
};

export default function PatternInfo({ pattern }) {
  const Icon = icons[pattern] || CircleDot;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {Object.entries(PATTERNS).map(([key, item]) => {
        const ItemIcon = icons[key] || Icon;
        const active = pattern === key;
        return (
          <div
            key={key}
            className={`rounded-2xl border p-4 ${
              active
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-[var(--card-border)] bg-[var(--card)]/70"
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--background)] text-[var(--primary)]">
                <ItemIcon size={18} />
              </span>
              <h2 className="text-sm font-bold text-[var(--foreground)]">{item.label}</h2>
            </div>
            <ul className="space-y-1 text-sm text-[var(--secondary-foreground)]">
              {details[key].map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
