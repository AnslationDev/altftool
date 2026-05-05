import { Footprints, Droplets, Eye } from "lucide-react";

const SUGGESTIONS = [
  {
    icon: Footprints,
    title: "Take a walk",
    desc: "Step away from your screen for a few minutes",
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    icon: Droplets,
    title: "Drink water",
    desc: "Stay hydrated — your brain needs it",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    icon: Eye,
    title: "Eye relaxation",
    desc: "Look 20 feet away for 20 seconds",
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
];

export default function BreakSuggestions({ phase }) {
  if (phase !== "break") return null;

  return (
    <div className="mb-4">

      {/* HEADER */}
      <p className="text-sm font-bold font-primary text-(--foreground) mb-3">
        Break Suggestions
      </p>

      {/* CARDS */}
      <div className="flex flex-col sm:flex-row sm:justify-center gap-2">
        {SUGGESTIONS.map(({ icon: Icon, title, desc, color, bg, border }) => (
          <div
            key={title}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bg} ${border}`}
          >
            <div className={`shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className={`text-sm font-bold font-primary ${color}`}>
                {title}
              </p>
              <p className="text-xs font-secondary text-(--muted-foreground)">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}