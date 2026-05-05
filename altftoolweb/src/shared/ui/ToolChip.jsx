import { Sparkles } from "lucide-react";

export default function Chip({ text, className = "" }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2",
        "bg-[var(--background)]",
        "border border-[var(--border)]",
        "rounded-full px-4 py-2",
        "text-sm font-semibold",
        "text-[var(--primary)]",
        className,
      ].join(" ")}
    >
      <Sparkles className="w-4 h-4" />
      <span>{text}</span>
    </div>
  );
}
